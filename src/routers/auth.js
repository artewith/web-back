import express from "express";
import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver-v2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

import routes from "../routes";
import pool from "../db";
import {
  checkIsAuthenticated,
  checkIsNotAuthenticated,
} from "../middlewares/auth";
import {
  logoutController,
  kakaoCallbackController,
  naverCallbackController,
  googleCallbackController,
} from "../controllers/auth";

dotenv.config();

const router = express.Router();

passport.use(
  "kakao",
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_KEY,
      callbackURL: routes.AUTH + routes.KAKAO_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      const connection = await pool.getConnection(async (conn) => conn);

      try {
        const [[userRecord]] = await connection.query(
          "SELECT * FROM users WHERE sns_id = ? AND sns_api_id IN (SELECT id FROM sns_api WHERE name = ?);",
          [profile.id, profile.provider]
        );
        if (userRecord) {
          done(null, {
            provider: profile.provider,
            id: profile.id,
            recordId: userRecord.id,
            isSuperUser: userRecord.is_superuser,
          });
        } else {
          await connection.query(
            "INSERT INTO users (sns_api_id, sns_id, name, email, image_url, gender, age_range) VALUES (?,?,?,?,?,?,?);",
            [
              1,
              profile.id,
              profile.username,
              profile._json.kakao_account.email,
              profile._json.properties.profile_image,
              profile._json.kakao_account.gender === "male"
                ? 1
                : profile._json.kakao_account.gender === "female"
                ? 2
                : profile._json.kakao_account.gender === undefined && null,
              profile._json.kakao_account.age_range,
            ]
          );
        }
        const [[{ lastInsertId }]] = await connection.query(
          "SELECT LAST_INSERT_ID() AS lastInsertId;"
        );
        return done(null, {
          provider: profile.provider,
          id: profile.id,
          recordId: lastInsertId,
        });
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

      try {
        const [[userRecord]] = await connection.query(
          "SELECT * FROM users WHERE sns_id = ? AND sns_api_id IN (SELECT id FROM sns_api WHERE name = ?);",
          [profile.id, profile.provider]
        );
        if (userRecord) {
          done(null, {
            provider: profile.provider,
            id: profile.id,
            recordId: userRecord.id,
            isSuperUser: userRecord.is_superuser,
          });
        } else {
          await connection.query(
            "INSERT INTO users (sns_api_id, sns_id, name, email, image_url, gender, age_range, phone_number) VALUES (?,?,?,?,?,?,?,?);",
            [
              2,
              profile.id,
              profile.name,
              profile.email,
              profile.profileImage,
              profile.gender === "M"
                ? 1
                : profile.gender === "F"
                ? 2
                : profile.gender === undefined && null,
              profile.age,
              profile.mobile,
            ]
          );
        }
        const [[{ lastInsertId }]] = await connection.query(
          "SELECT LAST_INSERT_ID() AS lastInsertId;"
        );
        return done(null, {
          provider: profile.provider,
          id: profile.id,
          recordId: lastInsertId,
        });
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

      try {
        const [[userRecord]] = await connection.query(
          "SELECT * FROM users WHERE sns_id = ? AND sns_api_id IN (SELECT id FROM sns_api WHERE name = ?);",
          [profile.id, profile.provider]
        );
        if (userRecord) {
          done(null, {
            provider: profile.provider,
            id: profile.id,
            recordId: userRecord.id,
            isSuperUser: userRecord.is_superuser,
          });
        } else {
          await connection.query(
            "INSERT INTO users (sns_api_id, sns_id, name, email, image_url) VALUES (?,?,?,?,?);",
            [
              3,
              profile.id,
              profile.displayName,
              profile._json.email,
              profile._json.picture,
            ]
          );
        }
        const [[{ lastInsertId }]] = await connection.query(
          "SELECT LAST_INSERT_ID() AS lastInsertId;"
        );
        return done(null, {
          provider: profile.provider,
          id: profile.id,
          recordId: lastInsertId,
        });
      } catch (error) {
        return done(error);
      } finally {
        connection.release();
      }
    }
  )
);

router.get(routes.LOGOUT, checkIsAuthenticated, logoutController);

router.get(
  routes.KAKAO,
  checkIsNotAuthenticated,
  passport.authenticate("kakao")
);

router.get(
  routes.KAKAO_CALLBACK,
  passport.authenticate("kakao"),
  kakaoCallbackController
);

router.get(
  routes.NAVER,
  checkIsNotAuthenticated,
  passport.authenticate("naver")
);

router.get(
  routes.NAVER_FAIL,
  passport.authenticate("naver", { authType: "reprompt" })
);

router.get(
  routes.NAVER_CALLBACK,
  passport.authenticate("naver", {
    failureRedirect: routes.AUTH + routes.NAVER_FAIL,
  }),
  naverCallbackController
);

router.get(
  routes.GOOGLE,
  checkIsNotAuthenticated,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  routes.GOOGLE_CALLBACK,
  passport.authenticate("google"),
  googleCallbackController
);

export default router;
