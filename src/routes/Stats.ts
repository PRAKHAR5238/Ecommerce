import express from "express";
import { adminOnly } from "../middleware/auth";
import { barchartstats, dashboardstats, linechartstats, piechartstats } from "../controllers/Stats";

const router = express.Router();

router.get("/dashstats", adminOnly, dashboardstats);
router.get("/pie", adminOnly, piechartstats);
router.get("/bar", adminOnly, barchartstats);
router.get("/line", adminOnly, linechartstats);

export default router;
