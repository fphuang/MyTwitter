const express = require('express');
const app = express();
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

router.get('/', async (req, res, next) => {
    var results = await getPosts({});
    res.status(200).send(results);
});

router.get('/:id', async (req, res, next) => {
    var postId = req.params.id;
    var postData = await getPosts({_id: postId});
    postData = postData[0];

    var results = {
        postData: postData,
    }

    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({replyTo: postId});

    res.status(200).send(results);
});

router.post('/', async (req, res, next) => {
    if (!req.body.content) {
        console.log('Content param not sent with request');
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user,
    }

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, {path: 'postedBy'});
        res.status(201).send(newPost);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
});

router.put('/:id/like', async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.session.user._id;
    let isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    let option = isLiked ? '$pull': '$addToSet';

    //without await, the data may not be updated in DB
    //{new: true}: ask for the updated object with new data
    req.session.user = await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true})
        .catch(error=> {
            console.log(error);
            res.sendStatus(400);
        });

    var post = await Post.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new: true})
    .catch(error=> {
        console.log(error);
        res.sendStatus(400);
    });
    
    res.status(200).send(post);
});

router.post('/:id/retweet', async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.session.user._id;

    //Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({
        postedBy: userId, 
        retweetData: postId})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });

    let option = deletedPost ? '$pull': '$addToSet';
    var repost = deletedPost;
    if (!repost) {
        repost = await Post.create({
            postedBy: userId,
            retweetData: postId
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });
    }

    //without await, the data may not be updated in DB
    //{new: true}: ask for the updated object with new data
    req.session.user = await User.findByIdAndUpdate(userId, {[option]: {retweets: repost._id}}, {new: true})
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });

    var post = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new: true})
        .catch(error=> {
            console.log(error);
            res.sendStatus(400);
        });
    
    res.status(200).send(post);
});

async function getPosts(filter) {
    var results = await Post.find(filter)
        .populate('postedBy')     //populate the postedBy field with its _id
        .populate("retweetData")  //populate the retweetData by its _id
        .populate('replyTo')
        .sort({'createdAt': -1})
        .catch(error => console.log(error));
    
    results = await User.populate(results, {path: 'replyTo.postedBy'});
    return await User.populate(results, {path: 'retweetData.postedBy'});
}

module.exports = router;


