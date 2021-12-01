import { verify } from "jsonwebtoken";
import { jwt_token } from "../database/models/index";
const verifyToken = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  const tokenDB = await jwt_token.findOne({ where: { token: token } });
  try {
    const decoded = verify(token, "secret");
    if (!tokenDB) throw new Error("Blacklisted");
    req.user = decoded?.user;
    req.jwt_token = token;
  } catch (err) {
    if (err !== "Blacklisted") tokenDB.destroy();
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default verifyToken;
