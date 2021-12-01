import { Router } from "express";
import hasRole from "../middleware/Role";

var router = Router();

router.get("/", function (req, res) {
  res.send("Hello this is user index");
});
router.get("/op", hasRole("operator"), function (req, res) {
  res.send("Hello this is op index");
});
router.get("/admin", hasRole("admin"), function (req, res) {
  res.send("Hello this is admin index");
});

export default router;
