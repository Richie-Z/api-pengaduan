export default function hasRole(role) {
  return (req, res, next) => {
    if (role !== req.petugas.role)
      return res.json({
        status: false,
        message: `Only ${role} petugas authoratizon`,
      });
    next();
  };
}
