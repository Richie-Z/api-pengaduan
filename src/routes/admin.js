import { Router } from "express";
import {
  createOp,
  deletePetugas,
  detailPetugas,
  getAll,
  updateOp,
} from "../controller/AdminController";
const router = Router();

router.get("/", getAll);
router.post("/", createOp);
router.put("/:petugasID(\\d+)", updateOp);
router.get("/:petugasID(\\d+)", detailPetugas);
router.delete("/:petugasID(\\d+)", deletePetugas);

export default router;
