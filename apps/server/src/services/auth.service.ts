// This is the business logic layer. It knows nothing about HTTP — only about users, passwords, and tokens

import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { userInfo } from "os";

// no of salt round for bcypt - higher : more secure but slower
const SALT_ROUNDS = 12;

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: string;
  role: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    // check if user already exist
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // hash the password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // create the user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
      },
    });

    // generate tokens
    const tokens = this.generateTokens({ userId: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  // login
  async login(input: LoginInput) {
    // find user by email

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // compare password with hash
    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    // generate tokens
    const tokens = this.generateTokens({ userId: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  // refresh tokens

  async refreshToken(token: string) {
    try {
      // verify the refresh token

      const payload = jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET as string,
      ) as TokenPayload;
      //check if user still exist and active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      // generate new tokens
      const tokens = this.generateTokens({ userId: user.id, role: user.role });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  private generateTokens(payload: TokenPayload) {
    const accessOptions: SignOptions = { expiresIn: "15m" };
    const refreshOptions: SignOptions = { expiresIn: "7d" };

    const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET as string, accessOptions);
    const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET as string, refreshOptions);

    return { accessToken, refreshToken };
  }
}
