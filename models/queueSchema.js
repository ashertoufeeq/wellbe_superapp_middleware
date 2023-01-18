const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const SchemaTypes = mongoose.Schema.Types;

const QueueSchema = new mongoose.Schema({
    index: {
        type: SchemaTypes.Double,
    },
    label: {
        type: String,
    },
    token: {
        type: Number,
    },
    isQueueUpdated: {
        type: Boolean,
    },
    logs: [
        {
            label: String,
            time: Date,
        },
    ],
});

module.exports = QueueSchema;
