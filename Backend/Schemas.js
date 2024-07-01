const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversationSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
}, { timestamps: true });

const chatSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversations: [conversationSchema]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
