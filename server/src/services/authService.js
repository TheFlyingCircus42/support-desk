// exchange credentials for a token, and give an attacker nothing

import { randomUUID } from "node:crypto";
import { verifyPassword } from "../auth/passwords.js";
import { signAccessToken, generateRefreshToken, hashRefreshToken } from "../auth/tokens.js";
import { AppError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import * as refreshTokenRepository from "../repositories/refreshTokenRepository.js";
import config from "../config/index.js";

const DUMMY_HASH = "$2b$12$3mGbr4x0qYjflmwTd8cD7.suq4dIj1HBdEERRB3RqFJTI50Fi2tXW";

// Mint + store a new refresh token for userId within familyId, returning the
// RAW token to hand back to the client - only its hash is ever persisted.
// Exported (not private) so userService.js's register() - a brand new
// sign-in lineage, same as login() - can reuse it without duplicating this
// logic in two files.
export async function issueRefreshToken(userId, familyId) {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create({ userId, familyId, tokenHash, expiresAt });
    return rawToken;
}

export async function login({ email, password }) {
    const account = await userRepository.findByEmailWithHash(email || "");

    const genericFailure = () => AppError.unauthenticated("invalid email or password");

    if (!account) {
        await verifyPassword(password, DUMMY_HASH);
        throw genericFailure();
    }

    const ok = await verifyPassword(password, account.password_hash);
    if (!ok) throw genericFailure();

    await userRepository.touchLastLogin(account.id);

    const user = await userRepository.findById(account.id);
    const refreshToken = await issueRefreshToken(user.id, randomUUID());
    return { user, token: signAccessToken(user), refreshToken };
}

// let a client ask "is this stored token still good, and who is it?"
export async function getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("user not found");
    return user;
}

// Exchange a refresh token for a new access token, rotating the refresh
// token in the process. Every failure below returns the exact same message
// - "invalid or expired token" - whether the token was never issued, has
// expired naturally, or was already used once before (reuse). That
// distinction lives only in what happens server-side, never in what's
// handed back to whoever presented the token - which might not be the
// legitimate user. Same anti-enumeration reasoning as login() above, one
// level up.
export async function refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
        throw AppError.unauthenticated("authentication required");
    }

    const invalid = () => AppError.unauthenticated("invalid or expired token");

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const row = await refreshTokenRepository.findByHash(tokenHash);

    if (!row) {
        throw invalid();
    }

    if (row.revoked_at !== null) {
        // REUSE DETECTED: this exact token was already rotated away once.
        // Whoever presented it now isn't necessarily the attacker - it
        // could be the legitimate user replaying a stale request - but we
        // can't tell which, so the whole lineage dies, not just this token.
        await refreshTokenRepository.revokeFamily(row.family_id);
        throw invalid();
    }

    if (row.expires_at < new Date()) {
        // Natural expiry, not theft - do NOT revoke the family here.
        throw invalid();
    }

    await refreshTokenRepository.revoke(row.id);
    const refreshToken = await issueRefreshToken(row.user_id, row.family_id);
    const user = await userRepository.findById(row.user_id);
    return { user, token: signAccessToken(user), refreshToken };
}

// Sign-out. Silent on a missing or unrecognized token - a client with no
// stored refresh token, or one repeating a sign-out call, should never see
// a failure here.
export async function revokeRefreshToken(rawRefreshToken) {
    if (!rawRefreshToken) return;

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const row = await refreshTokenRepository.findByHash(tokenHash);
    if (!row) return;

    // Sign-out kills the whole lineage, not just the one token presented.
    await refreshTokenRepository.revokeFamily(row.family_id);
}
