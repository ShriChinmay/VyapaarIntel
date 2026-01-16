import express from "express";

const router = express.Router();

import { AnalyzeProduct } from "../controllers/AnalyzeProduct.js";

router.post("/ProductAnalysis", AnalyzeProduct);

export default router;
