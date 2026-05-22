import { prisma } from "../lib/prisma.js";
interface GetUserInput {
  role?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  // get all user with pagination
  async getAll(input: GetUserInput) {
    const page = input.page || 1;
    const limit = input.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (input.role) where.role = input.role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // update a user's role
  async updateRole(id: string, role: "USER" | "AGENT" | "ADMIN") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }
    const updated = await prisma.user.update({
      where: { id },

      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return updated;
  }

  // deactivate / reactivate a user

  async toggleActive(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return updated;
  }

  // get agents and admins (for ticket assignment dropdown)
  async getAssignable() {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["AGENT", "ADMIN"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
    return users;
  }
}
