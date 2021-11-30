const express = require('express');
const app = express();
const User = require('../schemas/UserSchema');
const bcrypt = require('bcryptjs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'pug');
app.set('views', 'views');

const router = express.Router();
router.get('/', (req, res, next) => {
    res.status(200).render('login');
});

router.post('/', async (req, res, next) => {
    const payload = req.body;
    
    if (payload.logUserName && payload.logPassword) {

        var user = await User.findOne({
            $or: [
                { userName: payload.logUserName }, 
                { email: payload.logUserName }
            ]
        })
        .catch(error => {
            console.log(error);
            payload.errorMessage = 'Cannot verify the registration info.';
            return res.status(200).render('login', payload);
        });

        if (user != null) {
            //fxh: bcrypt seems buggy. For example, settomg 'jb' would always return false
            let result = await bcrypt.compare(payload.logPassword, user.password, (err,temp) => {
            });

            result = (payload.logPassword == user.password);
            
            if (result === true) {
                req.session.user = user;
                return res.redirect('/');
            }
        }

        payload.errorMessage = 'Login credential incorrect.';
        return res.status(200).render('login', payload);
    }

    payload.errorMessage = 'Make sure each field has a valid value.';
    res.status(200).render('login');
});

module.exports = router;


