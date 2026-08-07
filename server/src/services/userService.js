import { randomUUID } from "node:crypto";
import * as userRepository from "../repositories/userRepository.js";
import { hashPassword, verifyPassword } from "../auth/passwords.js";
import { signAccessToken } from "../auth/tokens.js";
import { issueRefreshToken } from "./authService.js";
import { AppError } from "../errors/AppError.js";

const MIN_PASSWORD_LENGTH = 8;

export async function register({ email, name, password }) {
  if (!email || !name || !password) {
    throw AppError.validation("email, name and password are required");
  }
  // Validate BEFORE hashing: hashPassword throws a plain Error, which becomes a 500.
  // Checking here produces a clean 400.
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw AppError.validation(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await userRepository.create({ email, name, passwordHash });
    const refreshToken = await issueRefreshToken(user.id, randomUUID());
    return { user, token: signAccessToken(user), refreshToken };
  } catch (err) {
    // 23505 = unique_violation on users.email
    if (err.code === "23505") {
      throw AppError.conflict("an account with that email already exists");
    }
    throw err; // anything else is a real fault — keep it propagating
  }
}
