const path = require('path');
const dotenv = require('dotenv');

// 🌍 Determine environment and load corresponding .env file
const env = process.env.NODE_ENV || 'qa';
const envPath = path.resolve(__dirname, 'env', `${env}.env`);
dotenv.config({ path: envPath });

// ✅ Export config values
module.exports = {
  port: process.env.PORT,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL, // ✅ Needed for CORS
};

console.log(`🌍 Running in ${env} mode`);
