import { Router } from "express";
import petugasRouter from "./petugas";
import authRouter from "./auth";
import auth from "../middleware/auth";
import csurf from "csurf";

const router = Router();
const csrfProtection = csurf({ cookie: true });

router.use(csrfProtection);
router.use((err, _req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403);
  res.json({ status: false, message: "Invalid CSRF Token" });
});

router.get("/csrf-token", (req, res) => {
  const token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token);
  res.json({
    status: true,
    message: "Success",
    csrfToken: token,
  });
});

router.use("/auth", authRouter);
router.use("/petugas", auth, petugasRouter);

export default router;
