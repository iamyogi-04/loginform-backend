const jwt = require('jsonwebtoken');
const JWT_SECRET = "process.env.SECRET";

const fetchuser = (req, res, next) => {
  //taking the id from token and adding it to the req object
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send('Please autheticate using valid token');
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    // if verified typed email will become user email
    req.user = data.user;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).send('Authentication Failed');
  }
};

module.exports = fetchuser;
