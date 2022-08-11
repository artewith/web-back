import axios from "axios";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";

// ?: 클라이언트쪽과 논의 필요
const validate = async (req, res, next) => {
  try {
    const payload = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    const selectExUserSql = mysql.format(myRaw.select.exUser, [payload.userId]);
    const connection = await pool.getConnection(async (conn) => conn);

    switch (payload.provider) {
      case "kakao":
        await axios.get("https://kapi.kakao.com/v1/user/access_token_info", {
          headers: { Authorization: `Bearer ${payload.access_token}` },
        });
        break;

      case "google":
        await axios.get("https://www.googleapis.com/oauth2/v1/tokeninfo", {
          headers: { Authorization: `Bearer ${payload.access_token}` },
        });
        break;

      case "naver":
        await axios.get("https://openapi.naver.com/v1/nid/me", {
          headers: { Authorization: `Bearer ${payload.access_token}` },
        });
        break;

      default:
        return res.status(401).json({ message: "no provider" });
    }

    const [[record]] = await connection.query(selectExUserSql);
    if (!record) {
      return res.status(401).json({ message: "RECORT NOT EXISTS" });
    }

    req.user = payload;
    req.userRecord = record;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ msg: "invalid token", name: error.name });
    }

    if (error.response.status === 400 || error.response.status === 401) {
      res.status(401).json(error.response.data);
    }
  } finally {
  }
};

// get user info from vendors
const getKakaoUserInfo = async (req, res, next) => {
  const { access_token } = req.body;
  const kakaoUserInfoUrl = "https://kapi.kakao.com/v2/user/me";
  const kakaoUserInfoRequestHeader = {
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const kakaoUserInfoResponse = await axios.get(kakaoUserInfoUrl, {
      headers: kakaoUserInfoRequestHeader,
    });

    req.kakaoUserInfoData = kakaoUserInfoResponse.data;
    return next();
  } catch (error) {
    if (error.response)
      return res.status(error.response.status).json(error.response.data);
  }
};

const getNaverUserInfo = async (req, res, next) => {
  const { access_token } = req.body;
  const naverUserInfoUrl = "https://openapi.naver.com/v1/nid/me";
  const naverUserInfoRequestHeader = {
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const naverUserInfoResponse = await axios.get(naverUserInfoUrl, {
      headers: naverUserInfoRequestHeader,
    });
    req.naverUserInfoData = naverUserInfoResponse.data;
    return next();
  } catch (error) {
    if (error.response)
      return res.status(error.response.status).json(error.response.data);
  }
};

const getGoogleUserInfo = async (req, res, next) => {
  const { access_token } = req.body;
  const googleUserInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
  const googleUserInfoRequestHeader = {
    Authorization: `Bearer ${access_token}`,
  };

  try {
    const googleUserInfoResponse = await axios.get(googleUserInfoUrl, {
      headers: googleUserInfoRequestHeader,
    });
    req.googleUserInfoData = googleUserInfoResponse.data;
    return next();
  } catch (error) {
    if (error.response)
      return res.status(error.response.status).json(error.response.data);
  }
};
export { validate, getKakaoUserInfo, getNaverUserInfo, getGoogleUserInfo };
