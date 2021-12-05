import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ms from "ms";
import auth from "../middleware/auth";
import { Petugas, JwtToken } from "../database/models/index";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).json({
        status: false,
        message: "Missing Parameter",
      });
    }
    const petugas = await Petugas.findOne({ where: { username } });
    if (petugas && (await bcrypt.compare(password, petugas.password))) {
      const token = jwt.sign({ petugas }, "secret", { expiresIn: "1h" });
      await JwtToken.create({
        token: token,
        petugasId: petugas.id,
        expiredAt: Date.now() + ms("1h"),
      });
      res.json({
        status: true,
        messages: null,
        data: petugas,
        token: token,
      });
    }
  } catch (error) {
    res.status(401).json(error);
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    const { petugas } = req;
    res.json({
      status: true,
      messages: null,
      data: petugas,
    });
  } catch (error) {
    res.status(401).json(error);
  }
});
router.delete("/logout", auth, async (req, res) => {
  try {
    const token = req?.jwt_token;
    await JwtToken.destroy({ where: { token: token } });
    return res.json({
      status: true,
      message: "logout success",
    });
  } catch (error) {
    return res.json(error);
  }
});
export default router;
