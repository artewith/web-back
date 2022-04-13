const checkIsAuthenticated = (req, res, next) => {
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

const checkIsAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user?.isSuperUser) {
    next();
  } else {
    res.status(401).json({ message: "IS NOT ADMIN" });
  }
};

export { checkIsAuthenticated, checkIsNotAuthenticated, checkIsAdmin };
