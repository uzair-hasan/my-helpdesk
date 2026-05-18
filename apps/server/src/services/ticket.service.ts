import { prisma } from "../lib/prisma.js";

// create-ticket

interface CreateTicketInput {
  title: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  categoryId?: string;
  userId: string; // who created it
}

// get-tickets
interface GetTicketsInput {
  status?: string;
  priority?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}

// update-ticket
interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedToId?: string;
}

export class TicketService {
  // create-ticket

  async create(input: CreateTicketInput) {
    const ticket = await prisma.ticket.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority || "MEDIUM",
        categoryId: input.categoryId,
        createdById: input.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });

    return ticket;
  }

  // get-all-tickets

  async getAll(input: GetTicketsInput) {
    const page = input.page || 1;
    const limit = input.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (input.status) where.status = input.status;
    if (input.priority) where.priority = input.priority;
    if (input.assignedToId) where.assignedToId = input.assignedToId;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          category: true,
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // get-single-ticket (BY ID)
  async getById(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        category: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return ticket;
  }

  //   update-ticket
  async update(id: string, input: UpdateTicketInput) {
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Ticket not found");
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: input,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
    return ticket;
  }
}
