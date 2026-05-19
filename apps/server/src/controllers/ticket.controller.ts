import { Request, Response } from "express";
import { TicketService } from "../services/ticket.service.js";

const ticketService = new TicketService();

export class TicketController {
  // create
  async create(req: Request, res: Response) {
    try {
      const ticket = await ticketService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // get all
  async getAll(req: Request, res: Response) {
    try {
      const result = await ticketService.getAll({
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedToId: req.query.assignedToId as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // get by ID
  async getById(req: Request, res: Response) {
    try {
      const ticket = await ticketService.getById(req.params.id as string);
      res.json(ticket);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  // update
  async update(req: Request, res: Response) {
    try {
      const ticket = await ticketService.update(
        req.params.id as string,
        req.body,
      );
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // add-comment
  async addComment(req: Request, res: Response) {
    try {
      const comment = await ticketService.addComment(
        req.params.id as string,
        req.user!.userId,
        req.body.content,
      );
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
