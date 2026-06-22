import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

const reviewSchema = z.object({
  medicineId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// POST /api/reviews - customer
router.post("/", authenticate, authorize("CUSTOMER"), async (req: AuthRequest, res: Response) => {
  try {
    const data = reviewSchema.parse(req.body);
    const review = await prisma.review.create({
      data: { ...data, customerId: req.user!.id },
      include: { customer: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/reviews/:medicineId - public
router.get("/:medicineId", async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { medicineId: req.params.medicineId },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: reviews });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
