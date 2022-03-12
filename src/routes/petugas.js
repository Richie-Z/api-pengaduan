import { Router } from "express";
import {
  updateStatus,
  update,
  getAll,
  deletePengaduan,
  getMembers,
  getMembersPengaduan,
  dashboard,
} from "../controller/PetugasController";
import hasRole from "../middleware/Role";
import Multer from "multer";

const router = Router();
const storage = Multer.diskStorage({
  destination: "./public/lampiran",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let fileType = file.originalname.split(".");
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${fileType[fileType.length - 1]}`
    );
  },
});
const upload = new Multer({ storage: storage });

router.get("/", function (_req, res) {
  res.json({ status: true, message: "Hello this is petugas index endpoint" });
});
router.get("/dashboard", dashboard);
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
router.get("/pengaduan/all", getAll);
router.put(
  "/pengaduan/:pengaduanId(\\d+)/",
  upload.array("lampiran", 6),
  update
);
router.delete("/pengaduan/:pengaduanId(\\d+)/", deletePengaduan);

router.get("/members", getMembers);
router.get("/members/pengaduan", getMembersPengaduan);
export default router;
