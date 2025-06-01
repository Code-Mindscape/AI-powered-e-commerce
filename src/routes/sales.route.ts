import express from "express";
import {
  createSale,
  deleteSale,
  getSaleById,
  getSales,
  updateSale,
} from "../controllers/sales.controller.js";

const router = express.Router();

// POST /api/sales - Create a single sale
router.post("/", createSale);

// Future routes (optional, for extension)
router.get("/", getSales);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

export default router;
