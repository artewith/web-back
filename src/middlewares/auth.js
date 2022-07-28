import axios from "axios";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

const validate = async (req, res, next) => {
  try {
    const payload = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    switch (payload.provider) {
      case "kakao":
        await axios.get("https://kapi.kakao.com/v1/user/access_token_info", {
          headers: { Authorization: `Bearer ${payload.accessToken}` },
        });
        break;

      case "google":
        await axios.get("https://www.googleapis.com/oauth2/v1/tokeninfo", {
          headers: { Authorization: `Bearer ${payload.accessToken}` },
        });
        break;

      case "naver":
        await axios.get("https://openapi.naver.com/v1/nid/me", {
          headers: { Authorization: `Bearer ${payload.accessToken}` },
        });
        break;

      default:
        return res.status(401).json({ msg: "no provider" });
    }

    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ msg: "invalid token" });
    }

    if (error.response.status === 400 || error.response.status === 401) {
      res.status(401).json(error.response.data);
    }
  }
};

export { validate };
