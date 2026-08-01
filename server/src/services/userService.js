import { findByEmail, create } from "../repositories/userRepository.js";
import { hashPassword } from "../auth/passwords.js";
import { signAccessToken } from "../auth/tokens.js";
import { AppError } from "../errors/AppError.js";

export async function registerUser({ email, password, name } = {}) {
  if (!email || !password || !name) {
    throw AppError.validation("email, password, and name are required");
  }

  if (password.length < 8) {
    throw AppError.validation("password must be at least 8 characters");
  }

  const existing = await findByEmail(email);
  if (existing) {
    throw AppError.conflict(`An account with email ${email} already exists`);
  }

  const passwordHash = await hashPassword(password);
  const user = await create({ email, name, passwordHash });
  const accessToken = signAccessToken(user);

  return { user, accessToken };
}
