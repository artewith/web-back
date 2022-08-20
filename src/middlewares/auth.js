import axios from "axios";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { ROLE_ID } from "../utils/user";
import { codes, messages } from "../utils/responses";

const validate = async (req, res, next) => {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const payload = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    const selectExUserSql = mysql.format(myRaw.select.exUser, [payload.userId]);

    // !: 최적화 필요. 현재 평균 실행시간 150 ms 이상
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

    payload.roleId = record.role_id;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ msg: "invalid token", name: error.name });
    }

    if (error.response.status === 400 || error.response.status === 401) {
      res.status(401).json({
        message: messages.REJECTED_BY_VENDOR,
        ...error.response.data,
      });
    }

    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
  } finally {
    connection.release();
  }
};

// check is admin
const checkIsAdmin = async (req, res, next) => {
  const { roleId } = req.user;

  if (roleId !== ROLE_ID.admin) {
    return res.status(401).json({ message: "BAD PERMISSION LEVEL" });
  } else return next();
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
      return res.status(codes.UNAUTHORIZED).json({
        message: messages.REJECTED_BY_VENDOR,
        error: error.response.data,
      });

    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
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
      return res.status(codes.UNAUTHORIZED).json({
        message: messages.REJECTED_BY_VENDOR,
        error: error.response.data,
      });
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
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
      return res.status(codes.UNAUTHORIZED).json({
        message: messages.REJECTED_BY_VENDOR,
        ...error.response.data,
      });
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ ...responses.uncaughtError, error });
  }
};
export {
  validate,
  checkIsAdmin,
  getKakaoUserInfo,
  getNaverUserInfo,
  getGoogleUserInfo,
};
