// User Model
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, },
    email: { type: String, required: true},
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now}
});

// Export so I can use my schema in other files too
module.exports = mongoose.model('User', UserSchema);
