import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  // get all users
  async getAll(req: Request, res: Response) {
    try {
      const result = await userService.getAll({
        role: req.query.role as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // update user role
  async updateRole(req: Request, res: Response) {
    try {
      const user = await userService.updateRole(
        req.params.id as string,
        req.body.role,
      );
      res.json(user);
    } catch (error: any) {
      res.json(400).json({ message: error.message });
    }
  }

  // toggle actice status
  async toggleActive(req: Request, res: Response) {
    try {
      const user = await userService.toggleActive(req.params.id as string);
      res.json(user);
    } catch (error: any) {
      res.json(400).json({ message: error.message });
    }
  }

  // get assignable users (agents + admins)
  async getAssignable(_req: Request, res: Response) {
    try {
      const users = await userService.getAssignable();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
