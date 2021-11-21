const express = require('express');
const app = express();
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const router = express.Router();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'pug');
app.set('views', 'views');

router.get('/', (req, res, next) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
});

module.exports = router;