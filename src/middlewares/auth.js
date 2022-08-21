import axios, { AxiosError } from "axios";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { ROLE_ID } from "../utils/user";
import { codes, messages } from "../utils/responses";

const validate = async (req, res, next) => {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

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
        return res
          .status(codes.BAD_REQUEST)
          .json({ message: messages.INVALID_VENDOR });
    }

    const [[record]] = await connection.query(selectExUserSql);
    if (!record) {
      return res
        .status(codes.NOT_FOUND)
        .json({ message: messages.RESOURCE_NOT_FOUND });
    }

    req.user = { ...payload, record };
    next();
  } catch (error) {
    // case of arte_token error
    if (error instanceof JsonWebTokenError) {
      return res
        .status(401)
        .json({ message: messages.INVALID_ARTE_TOKEN, error });
    }
    // case of vender response
    // !: 벤더마다 응답이 다를 경우, 메세지와 네임을 통일해야 함.
    if (error.response) {
      return res.status(401).json({
        message: messages.REJECTED_BY_SNS_VENDOR,
        error: {
          name: error.response.data.error_description,
          message: error.response.data.error,
        },
      });
    }

    console.trace(error);
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
  } finally {
    connection.release();
  }
};

// check is admin
const checkIsAdmin = async (req, res, next) => {
  const { role_id } = req.user.record;

  if (role_id !== ROLE_ID.admin) {
    return res
      .status(codes.FORBIDDEN)
      .json({ message: messages.BAD_PERMISSION_LEVEL });
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
        message: messages.REJECTED_BY_SNS_VENDOR,
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
        message: messages.REJECTED_BY_SNS_VENDOR,
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
        message: messages.REJECTED_BY_SNS_VENDOR,
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
