const express = require('express');
const app = express();
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

router.post('/', async (req, res, next) => {
    if (!req.body.users) {
        console.error('Users param not sent with request');
        return res.sendStatus(400);
    }

    var users = JSON.parse(req.body.users);
    if (users.length === 0) {
        console.error('Users array is empty');
        return res.sendStatus(400); 
    }

    users.push(req.session.user);

    let chatData = {
        users: users,
        isGroupChat: true,
    };

    Chat.create(chatData)
        .then(results => res.status(200).send(results))
        .catch(error => {
            console.error(error);
            res.sendStatus(400);
        });

});

router.get('/', async (req, res, next) => {
    Chat.find({users: { $elemMatch: { $eq: req.session.user._id} }})
        .populate('users')
        .sort({updatedAt: -1})
        .then(results => res.status(200).send(results))
        .catch(error => {
            console.error(error);
            res.sendStatus(400);
        });
});


module.exports = router;


