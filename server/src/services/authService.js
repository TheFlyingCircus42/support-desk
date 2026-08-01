// exchange credentials for a token

import * as userRepository from "../repositories/userRepository"
import { AppError } from "../errors/AppError";
import { verifyPassword } from "../auth/passwords";
import { signAccessToken } from "../auth/tokens";

const DUMMY_HASH = "$2b$12$3mGbr4x0qYjflmwTd8cD7.suq4dIj1HBdEERRB3RqFJTI50Fi2tXW";1

export async function login ({ email, password}){
    const account = await userRepository.findByEmailWithHash(email || "");
    
    const genericFailure = () => AppError.unnauthenticated("invalid email or password");

    if(!account){
        await verifyPassword(password, DUMMY_HASH);
        throw genericFailure();
    }

    const ok = await verifyPassword(password, account.password_hash);
    if (!ok) throw genericFailure();

    await userRepository.touchLastogin(account.id);

    const user = await userRepository.findById(account.id)
    return {user, token: signAccessToken(user) };
}

//let a client ask "is this token stored still good and who is it?"
export async function getCurrentUser(userId){
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("user not found");
    return user;
}