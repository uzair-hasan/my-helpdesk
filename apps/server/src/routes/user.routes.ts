import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// All user management routes require authentication + ADMIN role

router.use(authenticate);

// this route is available to ALL authenticated users
router.get("/assignable", (req, res) => userController.getAssignable(req, res));

// for admin
router.use(authorize("ADMIN"));

// admin routes
router.get("/", (req, res) => userController.getAll(req, res));
router.patch("/:id/role", (req, res) => userController.updateRole(req, res));
router.patch("/:id/toggle-active", (req, res) =>
  userController.toggleActive(req, res),
);

export default router;
