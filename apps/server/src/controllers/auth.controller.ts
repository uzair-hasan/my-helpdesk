// for handles HTTP concerns — reading the request, calling the service, sending the response

import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // basic validation
      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ message: "Email,password and name are required." });
      }
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long" });
      }

      const result = await authService.register({ email, password, name });

      // set refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // send access token and user in response body
      return res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Email already registered"
      ) {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email or password are require" });
      }

      const result = await authService.login({ email, password });
      // set refresh token as http only cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }
      if (
        error instanceof Error &&
        error.message === "Account is deactivated"
      ) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // refresh token
  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const result = await authService.refreshToken(token);

      //set new refresh token
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  //logout
  async logout(req: Request, res: Response) {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  }
}
