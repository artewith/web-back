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

// after validate
const readUser = async (req, res) => {
  return res
    .status(codes.OK)
    .json({ message: messages.OK, user: req.user.record });
};

export { kakaoLogin, naverLogin, googleLogin, readUser };
