const checkIsAuthenticated = (req, res, next) => {
  // !: 제대로 만들기.
  //  jwt.verify(
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJpYXQiOjE2NTg0NjgxNTYsImV4cCI6MTY1OTA3Mjk1NiwiaXNzIjoiYXJ0ZXdpdGgifQ.Graf8LIdbsC4rzcpe5QvnESZJ8dMTWMBH0PN-qrZ_RY",
  // process.env.JWT_SECRET,
  // (err, payload) => {
  // console.log("===========================");
  // console.log(payload);
  // }
  // );
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "NOT AUTHENTICATED" });
  }
};

const checkIsNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(403).json({ message: "ALREADY AUTHENTICATED" });
  } else {
    next();
  }
};

// !: 수정 필요
const checkIsAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user?.isSuperUser) {
    next();
  } else {
    res.status(401).json({ message: "IS NOT ADMIN" });
  }
};

export { checkIsAuthenticated, checkIsNotAuthenticated, checkIsAdmin };
