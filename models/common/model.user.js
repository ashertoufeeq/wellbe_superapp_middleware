const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.user = new Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
});
