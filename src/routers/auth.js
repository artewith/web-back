import express from "express";
import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver-v2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

import routes from "../routes";
import pool from "../db";
import { handleCallback } from "../controllers/auth";
import { SNS_AUTH_API_ID, ROLE_ID, GENDER_ID } from "../utils/user";

dotenv.config();

const router = express.Router();

passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_KEY,
      clientSecret: process.env.KAKAO_SECRET,
      callbackURL: routes.AUTH + routes.KAKAO_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      const connection = await pool.getConnection(async (conn) => conn);
      const user = {
        provider: profile.provider,
        accessToken,
      };

      try {
        const [[record]] = await connection.query(
          `SELECT * FROM users 
                WHERE sns_id=? 
                AND sns_auth_api_id=?`,
          [profile.id, SNS_AUTH_API_ID[profile.provider]]
        );

        if (record) {
          user.id = record.id;
        } else {
          await connection.query(
            `INSERT INTO users (role_id, sns_auth_api_id, sns_id, name, email, image_url, gender, age_range) 
                VALUES (?,?,?,?,?,?,?,?)`,
            [
              ROLE_ID.member,
              SNS_AUTH_API_ID.kakao,
              profile.id,
              profile.username,
              profile._json.kakao_account.email,
              profile._json.properties.profile_image,
              GENDER_ID[profile._json.kakao_account.gender],
              profile._json.kakao_account.age_range,
            ]
          );

          const [[{ lastInsertId }]] = await connection.query(
            `SELECT LAST_INSERT_ID() AS lastInsertId`
          );
          user.id = lastInsertId;
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      } finally {
        connection.release();
      }
    }
  )
);

passport.use(
  new NaverStrategy(
    {
      clientID: process.env.NAVER_KEY,
      clientSecret: process.env.NAVER_SECRET,
      callbackURL: routes.AUTH + routes.NAVER_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      if (profile.email === undefined || profile.name === undefined) {
        return done(null, false);
      }
      const connection = await pool.getConnection(async (conn) => conn);
      const user = {
        provider: profile.provider,
        accessToken,
      };

      try {
        const [[record]] = await connection.query(
          `SELECT * FROM users 
                WHERE sns_id=? 
                AND sns_auth_api_id=?`,
          [profile.id, SNS_AUTH_API_ID[profile.provider]]
        );

        if (record) {
          user.id = record.id;
        } else {
          await connection.query(
            `INSERT INTO users (role_id, sns_auth_api_id, sns_id, name, email, image_url, gender, age_range, phone_number) 
                VALUES (?,?,?,?,?,?,?,?,?)`,
            [
              ROLE_ID.member,
              SNS_AUTH_API_ID.naver,
              profile.id,
              profile.name,
              profile.email,
              profile.profileImage,
              GENDER_ID[profile.gender],
              profile.age,
              profile.mobile,
            ]
          );

          const [[{ lastInsertId }]] = await connection.query(
            `SELECT LAST_INSERT_ID() AS lastInsertId`
          );
          user.id = lastInsertId;
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      } finally {
        connection.release();
      }
    }
  )
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_KEY,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: routes.AUTH + routes.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      const connection = await pool.getConnection(async (conn) => conn);
      const user = {
        provider: profile.provider,
        accessToken,
      };

      try {
        const [[record]] = await connection.query(
          `SELECT * FROM users 
                WHERE sns_id=? 
                AND sns_auth_api_id=?`,
          [profile.id, SNS_AUTH_API_ID[profile.provider]]
        );

        if (record) {
          user.id = record.id;
        } else {
          await connection.query(
            `INSERT INTO users (role_id, sns_auth_api_id, sns_id, name, email, image_url) 
                VALUES (?,?,?,?,?,?)`,
            [
              ROLE_ID.member,
              SNS_AUTH_API_ID.google,
              profile.id,
              profile.displayName,
              profile._json.email,
              profile._json.picture,
            ]
          );

          const [[{ lastInsertId }]] = await connection.query(
            `SELECT LAST_INSERT_ID() AS lastInsertId`
          );
          user.id = lastInsertId;
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      } finally {
        connection.release();
      }
    }
  )
);

router.get(routes.KAKAO, passport.authenticate("kakao", { session: false }));

router.get(
  routes.KAKAO_CALLBACK,
  passport.authenticate("kakao", { session: false }),
  handleCallback
);

router.get(routes.NAVER, passport.authenticate("naver", { session: false }));

router.get(
  routes.NAVER_FAIL,
  passport.authenticate("naver", { authType: "reprompt", session: false })
);

router.get(
  routes.NAVER_CALLBACK,
  passport.authenticate("naver", {
    failureRedirect: routes.AUTH + routes.NAVER_FAIL,
    session: false,
  }),
  handleCallback
);

router.get(
  routes.GOOGLE,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
    session: false,
  })
);

router.get(
  routes.GOOGLE_CALLBACK,
  passport.authenticate("google", { session: false }),
  handleCallback
);

export default router;
