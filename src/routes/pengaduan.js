import { Router } from "express";
import {
  createPengaduan,
  getPengaduanID,
  getPengaduanIP,
} from "../controller/PengaduanController";
import Multer from "multer";

const router = Router();
const storage = Multer.diskStorage({
  destination: "./public/files",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});
const upload = new Multer({ storage: storage });

router.get("/", getPengaduanIP);
router.get("/:pengaduanId(\\d+)", getPengaduanID);
router.post("/", upload.array("lampiran", 6), createPengaduan);
export default router;
