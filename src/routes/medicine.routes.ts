import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

const medicineSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  image: z.string().url().optional(),
  manufacturer: z.string().min(2),
  dosage: z.string().optional(),
  categoryId: z.string(),
});

// GET /api/medicines - public
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, categoryId, minPrice, maxPrice, page = "1", limit = "12" } = req.query;
    const where: Record<string, unknown> = {};
    if (search) where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { manufacturer: { contains: String(search), mode: "insensitive" } },
    ];
    if (categoryId) where.categoryId = String(categoryId);
    if (minPrice || maxPrice) where.price = {
      ...(minPrice ? { gte: parseFloat(String(minPrice)) } : {}),
      ...(maxPrice ? { lte: parseFloat(String(maxPrice)) } : {}),
    };

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        include: { category: true, seller: { select: { id: true, name: true } } },
        skip,
        take: parseInt(String(limit)),
        orderBy: { createdAt: "desc" },
      }),
      prisma.medicine.count({ where }),
    ]);
    res.json({ success: true, data: medicines, total, page: parseInt(String(page)), limit: parseInt(String(limit)) });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/medicines/:id - public
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        seller: { select: { id: true, name: true } },
        reviews: { include: { customer: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!medicine) {
      res.status(404).json({ success: false, message: "Medicine not found" });
      return;
    }
    res.json({ success: true, data: medicine });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/medicines - seller only
router.post("/", authenticate, authorize("SELLER"), async (req: AuthRequest, res: Response) => {
  try {
    const data = medicineSchema.parse(req.body);
    const medicine = await prisma.medicine.create({
      data: { ...data, sellerId: req.user!.id },
      include: { category: true },
    });
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/medicines/:id - seller only
router.put("/:id", authenticate, authorize("SELLER"), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.sellerId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    const data = medicineSchema.partial().parse(req.body);
    const medicine = await prisma.medicine.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json({ success: true, data: medicine });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/medicines/:id - seller only
router.delete("/:id", authenticate, authorize("SELLER"), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.sellerId !== req.user!.id) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    await prisma.medicine.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Medicine deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/medicines/seller/my - seller's own medicines
router.get("/seller/my", authenticate, authorize("SELLER"), async (req: AuthRequest, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { sellerId: req.user!.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: medicines });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
