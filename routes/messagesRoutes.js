const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');

router.get('/', (req, res, next) => {    
    var payload = createPayload(req.session.user, 'Inbox');
    res.status(200).render('inboxPage', payload);
});

router.get('/new', (req, res, next) => {    
    var payload = createPayload(req.session.user, 'New message');
    res.status(200).render('newMessage', payload);
});

function createPayload(userLoggedIn, pageTitle) {
    return { pageTitle,
             userLoggedIn,
             userLoggedInJs: JSON.stringify(userLoggedIn),
            };
}

router.get('/:chatId', async (req, res, next) => {  
    const userId = req.session.user._id;
    const chatId = req.params.chatId;
    const isValidId = mongoose.isValidObjectId(chatId);

    var payload = createPayload(req.session.user, 'Chat');

    if (!isValidId) {
        payload.errorMessage = 'Chat does not exist or you do not have permission to view it.';
        return res.status(200).render('chatPage', payload);
    }

    let chat = await Chat.findOne({_id: chatId, users: {$elemMatch: {$eq: userId}}})
                        .populate('users');

    if (!chat) {
        var userFound = await User.findById(chatId);
        if (userFound) {
            chat = await getChatByUserId(userFound._id, userId);
        }
    }

    if (!chat) {
        payload.errorMessage = 'Chat does not exist or you do not have permission to view it.';
    }
    else {
        payload.chat = chat;
    }

    res.status(200).render('chatPage', payload);
});

async function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
            isGroupChat: false,
            users: {
                $size: 2,
                $all: [
                    {$elemMatch: {$eq: mongoose.Types.ObjectId(userLoggedInId)}},
                    {$elemMatch: {$eq: mongoose.Types.ObjectId(otherUserId)}},
                ]
            }
        }, 
        {
            $setOnInsert: {
                users: [userLoggedInId, otherUserId],
            }
        },
        {
            new: true,
            upsert: true,
        })
        .populate('users');
}

module.exports = router;