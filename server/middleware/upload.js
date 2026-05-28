// Stub middleware for file upload fields.
// If you add multer later, replace this implementation.
module.exports = {
  single: () => (req, res, next) => {
    next();
  }
};
