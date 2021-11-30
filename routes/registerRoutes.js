const express = require('express');
const app = express();
const User = require('../schemas/UserSchema');
const bcrypt = require('bcryptjs');

app.set('view engine', 'pug');
app.set('views', 'views');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();
router.get('/', (req, res, next) => {
    res.status(200).render('register');
    next();
});

router.post('/', async (req, res, next) => {
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var userName = req.body.userName.trim();
    var email = req.body.email.trim();
    var password = req.body.lastName;

    var payload = req.body;
    if (firstName && lastName && userName && email && password) {
        var user = await User.findOne({
            $or: [
                { userName: userName }, 
                { email: email }
            ]
        })
        .catch(error => {
            console.log(error);
            payload.errorMessage = 'Cannot verify the registration info.';
            res.status(200).render('register', payload);
        })

        if (!user) {
            var data = req.body;
            // data.password = await bcrypt.hash(password, 10);

            User.create(data).then(user => {
                req.session.user = user;
                return res.redirect('/');
            });
        }
        else {
            if (email === user.email) {
                payload.errorMessage = 'Email already in use.'
            }
            else {
                payload.errorMessage = 'Username already in use.';
            }
            res.status(200).render('register', payload);
        }
    }
    else {
        payload.errorMessage = 'Make sure each field is not empty';
        res.status(200).render('register', payload);
    }

    //we do not need the next() statement
});

module.exports = router;


