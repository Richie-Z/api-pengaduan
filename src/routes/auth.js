import { Router } from "express";
import jwt from "jsonwebtoken";
import { compare, hashSync } from "bcrypt";
import ms from "ms";
import auth from "../middleware/auth";
import { Petugas, JwtToken } from "../database/models/index";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password))
      throw {
        status: false,
        message: "Missing Paramater.",
      };
    const petugas = await Petugas.scope("withPassword").findOne({
      where: { username },
    });
    if (petugas && (await compare(password, petugas.password))) {
      const token = jwt.sign({ petugas }, "secret", { expiresIn: "24h" });
      await JwtToken.create({
        token: token,
        petugasId: petugas.id,
        expiredAt: Date.now() + ms("24h"),
      });
      res.cookie("token", token, { httpOnly: true });
      return res.json({
        status: true,
        message: "Login Success",
        data: petugas,
        token: token,
      });
    }
    throw {
      status: false,
      message: "username or password wrong.",
    };
  } catch (error) {
    console.error(error);
    res.status(401).json(error);
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    const { petugas } = req;
    // eslint-disable-next-line no-unused-vars
    const { password, ...newPetugas } = petugas;
    res.json({
      status: true,
      message: null,
      data: newPetugas,
    });
  } catch (error) {
    res.status(401).json(error);
  }
});
router.put("/change_password", auth, async (req, res) => {
  try {
    const { petugas } = req;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword && !newPassword)
      throw {
        status: false,
        message: "missing paramater",
      };
    if (!(await compare(oldPassword, petugas.password)))
      throw {
        status: false,
        message: "Old password not same",
      };
    const currentPetugas = await Petugas.findByPk(petugas.id);
    await currentPetugas.update({
      password: hashSync(newPassword, 10),
    });
    res.json({
      status: true,
      message: "Update Password Success.",
      data: null,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});
router.delete("/logout", auth, async (req, res) => {
  try {
    const token = req?.jwt_token;
    await JwtToken.destroy({ where: { token: token } });
    return res.json({
      status: true,
      message: "Logout Success",
    });
  } catch (error) {
    return res.json(error);
  }
});
export default router;
