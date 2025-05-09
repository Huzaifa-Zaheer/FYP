const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    rideId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'Ride' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // [userId, captainId]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
