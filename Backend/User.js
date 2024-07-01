const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
