const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    facebookId: {
        type: String,
        required: true,
        unique: true
    },
    remindInterval: {
        type: Number,
        required: true
    },
    nextReminder: {
        type: String,
        required: true
    }
});

const users = mongoose.model('Users', userSchema);

module.exports = users;

