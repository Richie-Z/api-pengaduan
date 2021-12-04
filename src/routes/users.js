import { Router } from "express";
import hasRole from "../middleware/Role";

const router = Router();

router.get("/", function (_req, res) {
  res.send("Hello this is user index");
});
router.get("/op", hasRole("operator"), function (_req, res) {
  res.send("Hello this is op index");
});
router.get("/admin", hasRole("admin"), function (_req, res) {
  res.send("Hello this is admin index");
});

export default router;
