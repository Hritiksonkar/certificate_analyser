const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        fileUrl: String,
        status: {
            type: String,
            enum: ['pending', 'approved'],
            default: 'pending',
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Certificate', certificateSchema);
