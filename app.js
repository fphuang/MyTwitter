const express = require('express');
const middleware = require('./middleware');
const app = express();
const PORT = process.env.PORT || 3003;
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database');
const session = require('express-session');

const server = app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'bbq chips',
    resave: true,
    saveUninitialized: false,
}));

//Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');

const postsApiRoute = require('./routes/api/posts');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', logoutRoute);

app.use('/api/posts', postsApiRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
    var payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user
    }

    res.status(200).render('home.pug', payload);
});





