const routes = {
  ROOT: "/",
  FILTERS: "/filters",
  AUTH: "/auth",
  USERS: "/users",
  REGISTER: "/register",
  IMAGE: "/image",
  LOGOUT: "/logout",
  KAKAO: "/kakao",
  KAKAO_CALLBACK: "/kakao/callback",
  NAVER: "/naver",
  NAVER_CALLBACK: "/naver/callback",
  NAVER_FAIL: "/naver/fail",
  GOOGLE: "/google",
  GOOGLE_CALLBACK: "/google/callback",
  OFFERS: "/offers",
  LESSON_RESUMES: "/lesson-resumes",
  LESSON_RESUME: "/lesson-resumes/:offerId",
  ACCOMPANIST_RESUMES: "/accompanist-resumes",
  ACCOMPANIST_RESUME: "/accompanist-resumes/:offerId",
  TUTOR_RECRUITS: "/tutor-recruits",
  TUTOR_RECRUIT: "/tutor-recruits/:offerId",
  ACCOMPANIST_RECRUITS: "/accompanist-recruits",
  ACCOMPANIST_RECRUIT: "/accompanist-recruits/:offerId",
  OFFER_ID: "/:offerId",
  IMAGE: "/image",
  RECOMMEND: "/recommend",
  OFFER_RECOMMEND: "/:offerId/recommend",
  OFFER_FULFILL: "/:offerId/fulfill",
  PRACTICE_HOUSES: "/practice-houses",
  HOUSE_ID: "/:houseId",
  HOUSE_IMAGE: "/image",
  ROOM_IMAGE: "/room/image",
  ROOM_IMAGES: "/room/images",
  HOUSE_RECOMMEND: "/:houseId/recommend",
  HOUSE_FULFILL: "/:houseId/fulfill",
  COMMUNITY: "/community",
  POST_ID: "/:postId",
  POST_COMMENTS: "/:postId/comments",
  POST_COMMENT_ID: "/:postId/comments/:commentId",
  ADVERTISEMENTS: "/advertisements",
  RANDOM: "/random",
};

export default routes;
