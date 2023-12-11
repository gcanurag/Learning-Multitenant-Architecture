const epxress = require('express');
const app = epxress();
require('dotenv').config();
const passport = require('passport');
const { user, users } = require('./model/index');
const jwt = require('jsonwebtoken');
const generateToken = require('./services/generateToken');
const orgRoute = require('./routes/organizationRoutes');
const cookieParser = require('cookie-parser');
//requires ends here


//middleware
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(epxress.json());
app.use(epxress.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

//middleware ends here


passport.serializeUser(function (user, cb) {
    cb(null, user);//cb(error,success)--> cb(error)
})
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
})

//databse connection
require('./model/index');




app.get('/', (req, res) => {
   res.render('home')
})


//google login here
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var userProfile
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        // console.log(profile);
        userProfile = profile;
        return done(null, userProfile);
    }
))






//google login ends here

app.get('/auth/google',passport.authenticate("google",{scope:['profile','email']}))

app.get ('/auth/google/callback', passport.authenticate("google", {
    failureRedirect:'http://localhost:3000'
}),
    async function (req, res) { 
        // console.log(userProfile);
        // return;
        const userGoogleEmail = userProfile.emails[0].value;
        const user = await users.findOne({
            where: {
                email: userGoogleEmail,
                // googleId: userProfile.id,
                // username:userProfile.displayName
            }
        })
        if (user) {
            const token = generateToken(user);
            res.cookie("token", token);
            res.redirect('/organization');

        } else {
            const user = await users.create({
                email: userGoogleEmail,
                googleId: userProfile.id,
                username: userProfile.displayName
            });
            // console.log("user", user);
            const token = generateToken(user);
            res.cookie('token', token);
            res.redirect("/organization");
        }
        // res.send("Logged In Successfully")
    }

)


//routes middlewares
app.use('/', orgRoute);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log('Server is running on port '+port);

})









