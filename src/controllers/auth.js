import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const handleCallback = (req, res) => {
  const token = jwt.sign(req.user, process.env.JWT_SECRET, {
    algorithm: process.env.JWT_ALGORITHM,
    issuer: process.env.JWT_ISSUER,
    expiresIn: process.env.JWT_EXP,
  });

  res.setHeader("Authorization", token);
  return res.status(200).end();
};

export { handleCallback };
