import express from "express";
import { body } from "express-validator";
import routes from "../routes";
import {
  getGoogleUserInfo,
  getKakaoUserInfo,
  getNaverUserInfo,
  validate,
} from "../middlewares/auth";
import {
  kakaoLogin,
  naverLogin,
  googleLogin,
  readUser,
} from "../controllers/auth";
import { alphabetAndNumber } from "../utils/regexp";
import { validateRequest } from "../middlewares/common";

const router = express.Router();

// social login
// ?: access_token에 대한 validation은 이걸로 충분한걸까. isLength라도 써야 하나. 각 벤더사에 access_token 관련 가이드를 찾아보자
router.post(
  routes.KAKAO,
  body("access_token").isString().matches(alphabetAndNumber),
  validateRequest,
  getKakaoUserInfo,
  kakaoLogin
);
router.post(
  routes.NAVER,
  body("access_token").isString().matches(alphabetAndNumber),
  validateRequest,
  getNaverUserInfo,
  naverLogin
);
router.post(
  routes.GOOGLE,
  body("access_token").isString().matches(alphabetAndNumber),
  validateRequest,
  getGoogleUserInfo,
  googleLogin
);
// validate
router.get(routes.VALIDATE, validate, readUser);

export default router;
