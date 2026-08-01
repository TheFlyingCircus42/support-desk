// exchange credentials for a token; register new accounts

import * as userRepository from "../repositories/userRepository.js";
import { AppError } from "../errors/AppError.js";
import { hashPassword, verifyPassword } from "../auth/passwords.js";
import { signAccessToken } from "../auth/tokens.js";
import { AUTH_FAILURE_MESSAGE } from "../constants/index.js";

const DUMMY_HASH = "$2b$12$3mGbr4x0qYjflmwTd8cD7.suq4dIj1HBdEERRB3RqFJTI50Fi2tXW";

export async function register({ email, password, name } = {}) {
  if (!email || !password || !name) {
    throw AppError.validation("email, password, and name are required");
  }

  if (password.length < 8) {
    throw AppError.validation("password must be at least 8 characters");
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await userRepository.create({ email, name, passwordHash });
    return { user, token: signAccessToken(user) };
  } catch (err) {
    if (err.code === "23505") {
      throw AppError.conflict(AUTH_FAILURE_MESSAGE);
    }
    throw err;
  }
}

export async function login ({ email, password}){
    const account = await userRepository.findByEmailWithHash(email || "");

    const genericFailure = () => AppError.unnauthenticated(AUTH_FAILURE_MESSAGE);

    if(!account){
        await verifyPassword(password, DUMMY_HASH);
        throw genericFailure();
    }

    const ok = await verifyPassword(password, account.password_hash);
    if (!ok) throw genericFailure();

    await userRepository.touchLastLogin(account.id);

    const user = await userRepository.findById(account.id)
    return {user, token: signAccessToken(user) };
}

//let a client ask "is this token stored still good and who is it?"
export async function getCurrentUser(userId){
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("user not found");
    return user;
}
