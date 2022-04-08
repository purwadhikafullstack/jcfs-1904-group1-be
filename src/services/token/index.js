require("dotenv").config();

const jwt = require("jsonwebtoken");
const key = process.env.JWT_KEY;

const sign = (data) => {
  // data = { id: 45 }
  const token = jwt.sign(data, key);
  // token = eJH...
  return token;
};

const verify = (data) => {
  // data = eJH...
  const actualData = jwt.verify(data, key);
  // actualData = { id: 45, iat: 'kapan token ini dibuat' }
  return actualData;
};

module.exports = { sign, verify };
