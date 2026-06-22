import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

const orderSchema = z.object({
  shippingAddress: z.string().min(5),
  items: z.array(z.object({ medicineId: z.string(), quantity: z.number().int().positive() })).min(1),
});

// POST /api/orders - customer
router.post("/", authenticate, authorize("CUSTOMER"), async (req: AuthRequest, res: Response) => {
  try {
    const { shippingAddress, items } = orderSchema.parse(req.body);
    let totalAmount = 0;
    const orderItems: { medicineId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!medicine) {
        res.status(404).json({ success: false, message: `Medicine ${item.medicineId} not found` });
        return;
      }
      if (medicine.stock < item.quantity) {
        res.status(400).json({ success: false, message: `Insufficient stock for ${medicine.name}` });
        return;
      }
      totalAmount += medicine.price * item.quantity;
      orderItems.push({ medicineId: item.medicineId, quantity: item.quantity, price: medicine.price });
    }

    const order = await prisma.$transaction(async (tx: typeof prisma) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user!.id,
          shippingAddress,
          totalAmount,
          orderItems: { create: orderItems },
        },
        include: { orderItems: { include: { medicine: true } } },
      });
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/my - customer's own orders
router.get("/my", authenticate, authorize("CUSTOMER"), async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      include: { orderItems: { include: { medicine: { include: { category: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/:id - customer or seller or admin
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: { include: { medicine: true } },
      },
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (req.user!.role === "CUSTOMER" && order.customerId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Access forbidden" });
      return;
    }
    res.json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/orders/:id/cancel - customer cancel
router.patch("/:id/cancel", authenticate, authorize("CUSTOMER"), async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.customerId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    if (order.status !== "PLACED") {
      res.status(400).json({ success: false, message: "Can only cancel orders with PLACED status" });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/orders/:id/status - seller update status
router.patch("/:id/status", authenticate, authorize("SELLER", "ADMIN"), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/seller/all - seller's orders
router.get("/seller/all", authenticate, authorize("SELLER"), async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderItems: { some: { medicine: { sellerId: req.user!.id } } } },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        orderItems: { include: { medicine: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
