import express from "express";

import routes from "../routes";
import {
  getGoogleUserInfo,
  getKakaoUserInfo,
  getNaverUserInfo,
} from "../middlewares/auth";
import {
  kakaoLogin,
  naverLogin,
  googleLogin,
  validateAndReturnUser,
} from "../controllers/auth";

const router = express.Router();

// social login
router.get(routes.KAKAO, getKakaoUserInfo, kakaoLogin);
router.get(routes.NAVER, getNaverUserInfo, naverLogin);
router.get(routes.GOOGLE, getGoogleUserInfo, googleLogin);
// validate
router.get(routes.VALIDATE, validateAndReturnUser);

export default router;
