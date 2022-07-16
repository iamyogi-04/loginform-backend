const router = require("express").Router();
const userdb = require("../models/User");
const { body, validationResult } = require("express-validator");
var bcrypt = require('bcryptjs');
const JWT_SECRET = "process.env.SECRET";
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");


//ROUTE 1: method-post route: /api/v1/register
router.post(
  "/register",
  [
    // limiting the length and type of users.
    body("name").isLength({ min: 4 }),
    body("email").isEmail(),
    body('phone').isLength({min : 10 , max:10}),
    body("password").isLength({ min: 5 }),
  ],
  async function (req, res) {
    // validating the errors if present or not.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {email} = req.body
      let user = await userdb.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ errors: "Sorry a user with this email already exists." });
      }
      const salt = await bcrypt.genSalt(10); 
      const secPass = await bcrypt.hash(req.body.password, salt);
      // creating new user.
      user = await userdb.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: secPass,
      });

      //sending data to response.
      res.json({ message: "user created successfully"});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

//ROUTE 2: method-post route: /api/v1/login
router.post(
  "/login",
  [
    // limiting the length and type of users.
    body("email", "Please enter the valid email").isEmail(),
    body("password", "Please enter a valid password").exists(),
  ],
  async function (req, res) {
    // validating the errors if present or not.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await userdb.findOne({ email });
      if (!user) {
        res
          .status(400)
          .send({ error: "Please try to login using valid credentials" });
      }
      //comparing passwords
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        res
          .status(400)
          .send({ error: "Please try to login using valid credentials" });
      }
      // object
      const data = {
        user: {
          id: user.id,
        },
      };
      // creating auth-token
      const authtoken = jwt.sign(data, JWT_SECRET);
      const userData = { ...user._doc, password: undefined };
      // send response
      res.json({ sucess: true, userData, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 3 : method-post route: /api/v1/getuser
router.post("/getuser", fetchuser, async function (req, res) {
  try {
    const userId = req.user.id;
    const user = await userdb.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
