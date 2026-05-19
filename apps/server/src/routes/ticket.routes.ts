import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const ticketController = new TicketController();

// all ticket routes require authentication

router.use(authenticate);

router.post("/", (req, res) => ticketController.create(req, res));
router.get("/", (req, res) => ticketController.getAll(req, res));
router.get("/:id", (req, res) => ticketController.getById(req, res));
router.patch("/:id", (req, res) => ticketController.update(req, res));
router.post("/:id/comments", (req, res) =>
  ticketController.addComment(req, res),
);

export default router;
