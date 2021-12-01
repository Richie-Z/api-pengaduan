export default function hasRole(role) {
  return (req, res, next) => {
    if (role !== req.user.role)
      return res.json({
        status: false,
        message: `Only ${role} member authoratizon`,
      });
    next();
  };
}
