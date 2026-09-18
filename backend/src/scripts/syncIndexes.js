require("dotenv").config();

const connectDB = require("../config/db");
const Availability = require("../models/Availability");

const run = async () => {
  await connectDB();

  const result = await Availability.syncIndexes();
  console.log("Synced Availability indexes:", result);
  process.exit(0);
};

run().catch((error) => {
  console.error("Index sync failed:", error.message);
  process.exit(1);
});
