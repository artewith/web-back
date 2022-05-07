const routes = {
  ROOT: "/",
  FILTERS: "/filters",
  AUTH: "/auth",
  LOGOUT: "/logout",
  KAKAO: "/kakao",
  KAKAO_CALLBACK: "/kakao/callback",
  NAVER: "/naver",
  NAVER_CALLBACK: "/naver/callback",
  NAVER_FAIL: "/naver/fail",
  GOOGLE: "/google",
  GOOGLE_CALLBACK: "/google/callback",
  OFFERS: "/offers",
  OFFER_ID: "/:offerId",
  OFFER_RECOMMEND: "/:offerId/recommend",
  PRACTICE_HOUSES: "/practice-houses",
  HOUSE_ID: "/:houseId",
  HOUSE_RECOMMEND: "/:houseId/recommend",
};

export default routes;
