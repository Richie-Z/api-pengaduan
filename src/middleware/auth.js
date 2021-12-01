import { verify } from "jsonwebtoken";
import { jwt_token } from "../database/models/index";
const verifyToken = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .json({
        status: false,
        message: "A token is required for authentication",
      });
  }
  try {
    const decoded = verify(token, "secret");
    const tokenDB = await jwt_token.findOne({ where: { token: token } });
    if (!tokenDB) throw new Error();
    req.user = decoded?.user;
    req.jwt_token = token;
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid Token" });
  }
  return next();
};

export default verifyToken;
