import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

const categorySchema = z.object({ name: z.string().min(2) });

// GET /api/categories - public
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { medicines: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/categories - admin only
router.post("/", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  try {
    const { name } = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/categories/:id - admin only
router.put("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  try {
    const { name } = categorySchema.parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { name } });
    res.json({ success: true, data: category });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/categories/:id - admin only
router.delete("/:id", authenticate, authorize("ADMIN"), async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Category deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
