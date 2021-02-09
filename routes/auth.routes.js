//create your routes here
const router = require("express").Router();
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')

/* GET signin page */
router.get("/signin", (req, res, next) => {
    res.render('auth/signin.hbs')
});

/* GET signup page */
router.get("/signup", (req, res, next) => {
  res.render('auth/signup.hbs')
});

// Handle POST requests to /signup
router.post("/signup", (req, res, next) => {
     const {name, email, password} = req.body
     //validate first
    // checking if the user has entered all three fields
    // we're missing one important step here
    if (!name.length || !email.length || !password.length) {
      res.render('auth/signup', {msg: 'Please enter all fields'})
      return;
  }

  // validate if the user has entered email in the right format ( @ , .)
   // regex that validates an email in javascript

   let re = /\S+@\S+\.\S+/;
   if (!re.test(email)) {
      res.render('auth/signup', {msg: 'Email not in valid format'})
      return;
   }


     //validate password (special character, some numbers, min 6 length)
     /*
     let regexPass = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8,20}$/;
     if (!regexPass.test(password)) {
        res.render('auth/signup', {msg: 'Password needs to have special chanracters, some numbers and be 6 characters aatleast'})
        return;
     }
   ----or----
     
    let isPas = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if(!isPas.test(password)){
        res.render("auth/signup",{msg:"pass not in valid format"})
        return;
      };
*/

      // creating a salt 
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);
       //console.log(hash)
       UserModel.create({name, email, password: hash})
       .then(() => {
          res.redirect('/')
       })
       .catch(() => {
         next(err)
      })
 
});
// Handle POST requests to /signin
router.post("/signin", (req, res, next) => {
  const {email, password} = req.body
   // implement the same set of validations as you did in signup as well
 /*// checking if the user has entered all three fields
    // we're missing one important step here
    if (!email || !password) {
      res.render('auth/signup', {msg: 'Please enter all fields'})
      return;
  }

  // validate if the user has entered email in the right format ( @ , .)
   // regex that validates an email in javascript

   let re = /\S+@\S+\.\S+/;
   if (!re.test(email)) {
      res.render('auth/signup', {msg: 'Email not in valid format'})
      return;
   }*/


  UserModel.findOne({email:email})
    .then((result) => {
      //if result exists
      if(result){
          bcrypt.compare(password, result.password)
          .then((isMatching) => {
                if(isMatching){
                  req.session.loggedInUser = result
                    res.redirect('/profile')
                } else {
                     res.render('auth/signin.hbs',{msg:'Password dont match'})
                }
          })
          } else {
            res.render('auth/signin.hbs',{msg:'Email does not match'})
        }
    })
    .catch(() => {
      next(err)
   })

});
//GET request to handle /profile

//Middleware to protect routes
const checkLoggedInUser =(req, res, next) =>{
  if (req.session.loggedInUser) {
    next()
}
else {
    res.redirect('/signin')
}
}

router.get('/profile', checkLoggedInUser, (req, res, next) => {
  let email = req.session.loggedInUser.email
  res.render('profile.hbs', {email})
})


router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

// 3. don't forget to export your router with 'modeul.exports'
module.exports = router;


// And finally don't forget to link this router in your middleware at the bottom of app.js where the other routes are defined