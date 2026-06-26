import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || "task-manager-productivity-dashboard-dev-only-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};
