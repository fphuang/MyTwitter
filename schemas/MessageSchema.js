const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MessageSchema = new Schema(
    {
        chatName: {type: String, trim: true},
        isGroupChat: {type: Boolean, default: false},
        users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    }, 
    { 
        timestamps: true, 
    }
);

module.exports = mongoose.model('Message', MessageSchema);