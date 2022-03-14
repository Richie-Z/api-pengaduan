import { Router } from "express";
import {
  createPengaduan,
  getPengaduanID,
  getPengaduanIP,
  updatePengaduan,
} from "../controller/PengaduanController";
import { deletePengaduan } from "../controller/PetugasController";
import Multer from "multer";

const router = Router();
const storage = Multer.diskStorage({
  destination: "./public/files",
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

router.get("/", getPengaduanIP);
router.get("/:pengaduanId(\\d+)", getPengaduanID);
router.put("/:pengaduanID(\\d+)", upload.array("lampiran", 4), updatePengaduan);
router.post("/", upload.array("lampiran", 6), createPengaduan);
router.delete("/:pengaduanId(\\d+)/", deletePengaduan);

export default router;
