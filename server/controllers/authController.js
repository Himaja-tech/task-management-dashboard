import { store } from "../utils/dataStore.js";
import { generateToken } from "../utils/generateToken.js";

const authPayload = (user) => ({
  token: generateToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    timeZone: user.timeZone,
    language: user.language,
    emailNotifications: user.emailNotifications,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    phone: user.phone,
    location: user.location,
    createdAt: user.createdAt
  }
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await store.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await store.createUser({ name, email, password });

    res.status(201).json(authPayload(user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await store.findUserByEmail(email, { includePassword: true });

    if (!user || !(await store.comparePassword(user, password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json(authPayload(user));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, username, bio, timeZone, language, emailNotifications, phone, department, role, employeeId, location } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Full name and email are required." });
    }

    const existingUser = await store.findUserByEmail(email);
    if (existingUser && String(existingUser._id) !== String(req.user._id)) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await store.updateUser(req.user._id, {
      name,
      email,
      username,
      bio,
      timeZone,
      language,
      emailNotifications,
      phone,
      department,
      role,
      employeeId,
      location
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(authPayload(user));
  } catch (error) {
    next(error);
  }
};
