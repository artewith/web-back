import express from "express";
import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import dotenv from "dotenv";

import routes from "../routes";
import pool from "../db";
import {
  checkIsAuthenticated,
  checkIsNotAuthenticated,
} from "../middlewares/auth";
import { logoutController, kakaoCallbackController } from "../controllers/auth";

dotenv.config();

const router = express.Router();

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_KEY,
      callbackURL: "/auth/kakao/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newSession = {
        provider: profile.provider,
        id: profile.id,
      };
      const connection = await pool.getConnection(async (conn) => conn);
      try {
        const [result] = await connection.query(
          "SELECT * FROM users WHERE sns_id = ? AND sns_api_id IN (SELECT id FROM sns_api WHERE name = ?);",
          [profile.id, "kakao"]
        );
        if (result.length) {
          done(null, { ...newSession, isSuperUser: result[0].is_superuser });
        } else {
          await connection.query(
            "INSERT INTO users (sns_api_id, sns_id, name, email, image_url) VALUES (?,?,?,?,?);",
            [
              1,
              profile.id,
              profile.username,
              profile._json.kakao_account.email,
              profile._json.properties.profile_image,
            ]
          );
        }
        return done(null, newSession);
      } catch (error) {
        console.log(error);
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

export default router;
