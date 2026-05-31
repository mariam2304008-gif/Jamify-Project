exports.protect = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authorized' });
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (roles.includes('admin') && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};
