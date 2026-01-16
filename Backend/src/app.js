import express from "express"
import productAnalysisRoutes from "./routes/ProductAnalysis.js";

const app = express();

app.use(express.json());
app.use("/api/ProductAnalysis", productAnalysisRoutes);

export default app;
