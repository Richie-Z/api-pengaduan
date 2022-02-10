import { verify } from "jsonwebtoken";
import { JwtToken } from "../database/models/index";
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({
      status: false,
      message: "A token is required for authentication",
    });
  }
  try {
    const decoded = verify(token, "secret");
    const tokenDB = await JwtToken.findOne({ where: { token: token } });
    if (!tokenDB) throw new Error();
    req.petugas = decoded?.petugas;
    req.jwt_token = token;
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid Token" });
  }
  return next();
};

export default verifyToken;
