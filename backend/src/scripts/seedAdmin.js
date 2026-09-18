require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (existing) {
    console.log("Admin already exists, skipping");
    process.exit(0);
  }

  await User.create({
    name: "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("Admin created");
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
