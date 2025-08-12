const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'qa';
const envPath = path.resolve(__dirname, 'env', `${env}.env`);

dotenv.config({ path: envPath });

module.exports = {
  port: process.env.PORT,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
};
console.log(`🌍 Running in ${process.env.NODE_ENV || 'qa'} mode`);
