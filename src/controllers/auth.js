import axios, { AxiosError } from "axios";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { codes, messages } from "../utils/responses";
import { GENDER_ID, ROLE_ID, SNS_AUTH_API_ID } from "../utils/user";

// kakao login
const kakaoLogin = async (req, res) => {
  const { access_token } = req.body;
  const {
    id,
    kakao_account: {
      profile: { nickname, profile_image_url },
      email,
      gender,
      age_range,
    },
  } = req.kakaoUserInfoData;

  // sqls
  const selectExUserSql = mysql.format(myRaw.select.exUserBySNS, [
    id,
    SNS_AUTH_API_ID.kakao,
  ]);
  const insertUserSql = mysql.format(myRaw.insert.kakaoUser, [
    ROLE_ID.member,
    SNS_AUTH_API_ID.kakao,
    id,
    nickname,
    email,
    profile_image_url,
    GENDER_ID[gender],
    age_range,
  ]);

  let statusCode;
  const payload = {
    provider: "kakao",
    access_token,
  };
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[record]] = await connection.query(selectExUserSql);
    if (record) {
      statusCode = 200;
      payload.userId = record.id;
    } else {
      const [{ insertId }] = await connection.query(insertUserSql);
      statusCode = 201;
      payload.userId = insertId;
    }

    // jwt
    const arte_token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: process.env.JWT_ALGORITHM,
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXP,
    });

    return res.status(statusCode).json({ arte_token });
  } catch (error) {
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
  } finally {
    connection.release();
  }
};

// naver login
const naverLogin = async (req, res) => {
  const { access_token } = req.body;
  const { id, name, email, profile_image, gender, age, mobile } =
    req.naverUserInfoData.response;

  // sqls
  const selectExUserSql = mysql.format(myRaw.select.exUserBySNS, [
    id,
    SNS_AUTH_API_ID.naver,
  ]);
  const insertUserSql = mysql.format(myRaw.insert.naverUser, [
    ROLE_ID.member,
    SNS_AUTH_API_ID.naver,
    id,
    name,
    email,
    profile_image,
    GENDER_ID[gender],
    age,
    mobile,
  ]);

  let statusCode;
  const payload = {
    provider: "naver",
    access_token,
  };
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[record]] = await connection.query(selectExUserSql);
    if (record) {
      statusCode = 200;
      payload.userId = record.id;
    } else {
      const [{ insertId }] = await connection.query(insertUserSql);
      statusCode = 201;
      payload.userId = insertId;
    }

    // jwt
    const arte_token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: process.env.JWT_ALGORITHM,
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXP,
    });

    return res.status(statusCode).json({ arte_token });
  } catch (error) {
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
  } finally {
    connection.release();
  }
};

// google login
const googleLogin = async (req, res) => {
  const { access_token } = req.body;
  const { id, name, email, picture } = req.googleUserInfoData;

  // sqls
  const selectExUserSql = mysql.format(myRaw.select.exUserBySNS, [
    id,
    SNS_AUTH_API_ID.google,
  ]);
  const insertUserSql = mysql.format(myRaw.insert.googleUser, [
    ROLE_ID.member,
    SNS_AUTH_API_ID.google,
    id,
    name,
    email,
    picture,
  ]);

  let statusCode;
  const payload = {
    provider: "google",
    access_token,
  };
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[record]] = await connection.query(selectExUserSql);
    if (record) {
      statusCode = 200;
      payload.userId = record.id;
    } else {
      const [{ insertId }] = await connection.query(insertUserSql);
      statusCode = 201;
      payload.userId = insertId;
    }

    // jwt
    const arte_token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: process.env.JWT_ALGORITHM,
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXP,
    });

    return res.status(statusCode).json({ arte_token });
  } catch (error) {
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
  } finally {
    connection.release();
  }
};

// validate
const validateAndReturnUser = async (req, res) => {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const { userId, provider, access_token } = await jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const selectExUserSql = mysql.format(myRaw.select.exUser, [userId]);

    switch (provider) {
      case "kakao":
        await axios.get("https://kapi.kakao.com/v1/user/access_token_info", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        break;

      case "google":
        await axios.get("https://www.googleapis.com/oauth2/v1/tokeninfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        break;

      case "naver":
        await axios.get("https://openapi.naver.com/v1/nid/me", {
          headers: { Authorization: `Bearer ${access_token}` },
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

    return res
      .status(codes.OK)
      .json({ message: messages.OK_WITH_SINGLE_RECORD, record });
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res
        .status(401)
        .json({ message: "invalid token", name: error.name });
    }
    if (error instanceof AxiosError) {
      return res.status(401).json({ message: error.message, name: error.name });
    }
    if (error.response?.status === 400 || error.response?.status === 401) {
      return res.status(401).json(error.response.data);
    }
    return res
      .status(codes.INTERNAL_SERVER_ERROR)
      .json({ message: messages.UNCAUGHT_ERROR, error });
  } finally {
    connection.release();
  }
};

export { kakaoLogin, naverLogin, googleLogin, validateAndReturnUser };
