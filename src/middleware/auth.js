import { verify } from "jsonwebtoken";
import { jwt_token } from "../models/index";
const verifyToken = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = verify(token, "secret");
    req.user = decoded;
    req.jwt_token = token;
    const tokenDB = await jwt_token.findOne({ where: { token: token } });
    if (!tokenDB) throw new Error();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default verifyToken;
