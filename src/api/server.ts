import express from "express";
import path from "path";
import resultRoutes from "./routes/resultRoutes";
import analysisRoutes from "./routes/analysisRoutes";
import generateRoutes from "./routes/generateRoutes";
import { errorHandler } from "./middleware";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../../public")));

// API routes
app.use("/api/results", resultRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/generate", generateRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Vietlott Analyzer API running at http://localhost:${PORT}`);
});

export default app;
