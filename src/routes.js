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
  OFFER_FULFILL: "/:offerId/fulfill",
  PRACTICE_HOUSES: "/practice-houses",
  HOUSE_ID: "/:houseId",
  HOUSE_RECOMMEND: "/:houseId/recommend",
  HOUSE_FULFILL: "/:houseId/fulfill",
};

export default routes;
