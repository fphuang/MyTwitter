const express = require('express');
const app = express();
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const multer = require('multer');
const uploads = multer({dest: 'uploads/'});
const path = require('path');
const fs = require('fs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

router.get('/', async (req, res, next) => {
    var searchObj = req.query;

    if (req.query.search !== undefined) {
        searchObj = {
             $or: [
                 {firstName: {$regex: searchObj.search, $options: 'i'}},
                 {lastName: {$regex: searchObj.search, $options: 'i'}},
                 {userName: {$regex: searchObj.search, $options: 'i'}},
                 ],
        };
    }

    User.find(searchObj)
        .then(results => {
            res.status(200).send(results)
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.put('/:userId/follow', async (req, res, next) => {
    const userId = req.params.userId;

    const user = await User.findById(userId)
        .catch((err) => {
            console.log(err);
        });
    if (user == null) {
        res.sendStatus(404);
    }

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? '$pull': "$addToSet";
    req.session.user = await User.findByIdAndUpdate(
            req.session.user._id, 
            {[option]: {following: userId}}, {new: true}
        ).catch(error=> {
            console.log(error);
            res.sendStatus(400);
        });

    await User.findByIdAndUpdate(
            userId, 
            {[option]: {followers: req.session.user._id}}
        ).catch(error=> {
            console.log(error);
            res.sendStatus(400);
        });

    res.status(200).send(req.session.user);
});

router.get('/:userId/following', async (req, res, next) => {
    await User.findById(req.params.userId)
        .populate('following')
        .then(results => {
            res.status(200).send(results);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.get('/:userId/followers', async (req, res, next) => {
    await User.findById(req.params.userId)
        .populate('followers')
        .then(results => {
            res.status(200).send(results);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
});

router.post('/profilePicture', uploads.single('croppedImage'), async (req, res, next) => {
    if (!req.file) {
        console.error('No file uploaded with ajax request');
        return res.sendStatus(400);
    }
    
    //multer will upload the image as png
    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(tempPath, targetPath, async (error) => {
        if (error != null) {
            console.log(error);
            return req.sendStatus(400);
        }

        console.log('fxh', req.session);
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, {profilePic: filePath}, {new: true});
        res.sendStatus(204);
    });
});

router.post('/coverPhoto', uploads.single('croppedImage'), async (req, res, next) => {
    if (!req.file) {
        console.error('No file uploaded with ajax request');
        return res.sendStatus(400);
    }
    
    //multer will upload the image as png
    var filePath = `/uploads/images/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(tempPath, targetPath, async (error) => {
        if (error != null) {
            console.log(error);
            return req.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, {coverPhoto: filePath}, {new: true});
        res.sendStatus(204);
    });
});

module.exports = router;


