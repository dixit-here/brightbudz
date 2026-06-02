const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const connectDB = require("./config/db");

const seedUsers = async () => {
  await connectDB();

  const users = [
    {
      name: "Test Student",
      email: "student@brightbudz.com",
      password: "student123",
      role: "student"
    },
    {
      name: "Test Admin",
      email: "admin@brightbudz.com",
      password: "admin123",
      role: "admin"
    }
  ];

  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      console.log(`⚠️  User already exists: ${userData.email} (role: ${exists.role})`);
      continue;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role
    });

    console.log(`✅ Created user: ${userData.email} (role: ${userData.role})`);
  }

  console.log("\n--- Valid Login Credentials ---");
  console.log("Student:  email: student@brightbudz.com  |  password: student123");
  console.log("Admin:    email: admin@brightbudz.com    |  password: admin123");

  mongoose.connection.close();
};

seedUsers();
