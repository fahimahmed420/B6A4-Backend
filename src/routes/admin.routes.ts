import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

// GET /api/admin/stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalMedicines, totalOrders, revenueData] = await Promise.all([
      prisma.user.count(),
      prisma.medicine.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { totalAmount: true } }),
    ]);
    res.json({
      success: true,
      data: {
        totalUsers,
        totalMedicines,
        totalOrders,
        totalRevenue: revenueData._sum.totalAmount ?? 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/users
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isBanned: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/admin/users/:id/ban
router.patch("/users/:id/ban", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: true },
      select: { id: true, name: true, email: true, isBanned: true },
    });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/admin/users/:id/unban
router.patch("/users/:id/unban", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: false },
      select: { id: true, name: true, email: true, isBanned: true },
    });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/orders
router.get("/orders", async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        orderItems: { include: { medicine: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/medicines
router.get("/medicines", async (_req: Request, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        category: true,
        seller: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: medicines });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
