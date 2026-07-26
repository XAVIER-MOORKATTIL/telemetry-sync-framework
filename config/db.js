const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB SUCCESS] MongoDB Atlas Connected: ${conn.connection.host}`);
    
    // Force Mongoose to sync unique indexes with Atlas
    const { Telemetry } = require('../models/Telemetry');
    await Telemetry.syncIndexes();
    console.log(`[INDEX SUCCESS] Schema Indexes Synchronized On Atlas.`);
  } catch (error) {
    console.error(`[DB FATAL ERROR] Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB WARNING] Lost MongoDB Atlas Connection.');
});

module.exports = connectDB;