import { Router } from "express";
import { updateStatus, update } from "../controller/PetugasController";
import hasRole from "../middleware/Role";

const router = Router();

router.get("/", function (_req, res) {
  res.json({ status: true, message: "Hello this is petugas index endpoint" });
});
router.get("/admin", hasRole("admin"), function (_req, res) {
  res.send("Hello this is admin index");
});

/**
 * ! ANCHOR DEPRECATED
 */
router.put(
  "/pengaduan/:pengaduanId(\\d+)/:statusVerif(belumVerif|proses|selesai)",
  function (req, res) {
    res.json({
      status: false,
      message: "this route is deprecated",
      params: req.params,
    });
  },
  updateStatus
);

router.put("/pengaduan/:pengaduanId(\\d+)/", update);
export default router;