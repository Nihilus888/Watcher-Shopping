const bcrypt = require("bcrypt");
const userModel = require("../../models/users/users");
const userValidators = require("../validators/users");

const controller = {
  signUp: async (req, res) => {
    console.log("Signup");
    //validations
    const validateUser = userValidators.createUser.validate(req.body);

    if (validateUser.error) {
      res.send("error");
      return;
    }

    const validatedUser = validateUser.value;

    //Joi-password would have probably validated the password and the confirm password

    if (validatedUser.password !== validatedUser.confirmPassword) {
      res.send(
        "Password and confirm password does not match. Please try again"
      );
      return;
    }
    console.log("whatever");
    //hash password
    const hash = await bcrypt.hash(validatedUser.password, 5);

    //with user data schema validation, create a username, password and hash in the DB
    try {
      console.log("Creating user");
      await userModel.create({
        username: validatedUser.username,
        password: validatedUser.password,
        hash: hash,
      });
    } catch (err) {
      console.log(err);
      res.send("Authentcation failed");
      return;
    }

    //redirect to Sign In page
    res.redirect("pages/signin");
  },

  login: async (req, res) => {
    //validations
    const validatedResults = req.body;

    let user = null;

    try {
      //find username in DB to to match the username that was inputted
      user = await userModel.findOne({ username: validatedResults.username });
    } catch (err) {
      console.log(err);
      res.send("failed to get username from the DB");
      res.redirect("/Signin");
      return;
    }

    //compare password hash to see if it matches
    const passwordinDB = await bcrypt.compare(
      validatedResults.password,
      user.hash
    );

    //throw out an error if password does not match
    if (!passwordinDB) {
      res.send("password is incorrect");
      return;
    }

    //regenerate the session to prevent session hijacking
    req.session.regenerate(function (err) {
      if (err) {
        console.log(err);
        res.send("error in regenerating session");
        return;
      }

      // store username in session
      req.session.user = user.username;

      //redirect the session to authenticated page
      //for login users and save the page as well
      req.session.save(function (err) {
        if (err) {
          //error will send the user to the Sign in page again
          res.send("Session cannot be saved");
          res.redirect("/pages/signin");
          return;
        }
        console.log("Login successful");
        //redirect to login home
        res.redirect("/Home");
      });
    });
  },

  logout: async (req, res) => {
    //destroy session and cookies for security and routes back to home unlogged in page
    res.session.destroy(function (err) {
      if (!err) {
        res.clearCookie("connect.sid");
        res.redirect('/')
      } else {
        res.send("error while logging out");
      }
    });
  },
};

module.exports = controller;
