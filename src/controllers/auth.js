import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const logoutController = (req, res) => {
  req.session.destroy();
  res.status(200).end();
};

const kakaoCallbackController = (req, res) => {
  const date = new Date();
  console.log("---kakao callback");
  console.log(req.user);
  const payload = {
    user_id: req.user.id,
  };

  const jwtConfig = {
    issuer: process.env.JWT_ISSUER,
    expiresIn: process.env.JWT_EXP,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, jwtConfig);

  res.setHeader("authorization", token);
  res.status(200).json(token);
};

const naverCallbackController = (req, res) => {
  res.status(200).end();
};

const googleCallbackController = (req, res) => {
  res.status(200).end();
};

export {
  logoutController,
  kakaoCallbackController,
  naverCallbackController,
  googleCallbackController,
};
