const logoutController = (req, res) => {
  req.session.destroy();
  res.status(200).end();
};

const kakaoCallbackController = (req, res) => {
  res.status(200).end();
};

export { logoutController, kakaoCallbackController };
