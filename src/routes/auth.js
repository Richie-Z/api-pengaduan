import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ms from "ms";
import auth from "../middleware/auth";
import { users, jwt_token } from "../models/index";

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
    const user = await users.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user }, "secret", { expiresIn: "1h" });
      await jwt_token.create({
        token: token,
        userId: user.id,
        expiredAt: Date.now() + ms("1h"),
      });
      res.json({
        status: true,
        messages: null,
        data: user,
        token: token,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
router.delete("/logout", auth, async (req, res) => {
  try {
    const token = req?.jwt_token;
    await jwt_token.destroy({ where: { token: token } });
    return res.json({
      status: true,
      message: "logout success",
    });
  } catch (error) {
    return res.json(error);
  }
});
export default router;
