import { Router } from "express";
import hasRole from "../middleware/Role";

const router = Router();

router.get("/", function (_req, res) {
  res.json({ status: true, message: "Hello this is petugas index endpoint" });
});
router.get("/admin", hasRole("admin"), function (_req, res) {
  res.send("Hello this is admin index");
});

router.get(
  "/pengaduan/:pengaduanId(\\d+)/:statusVerif(\\s+)",
  function (req, res) {
    res.json({
      status: true,
      message: "Success",
      data: req.params,
    });
  }
);

export default router;
