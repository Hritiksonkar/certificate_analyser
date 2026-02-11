const express = require('express');
const Certificate = require('../models/Certificate');

const router = express.Router();

router.get('/pending', async (req, res) => {
    try {
        const certificates = await Certificate.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(certificates);
    } catch (err) {
        console.error('Pending fetch error:', err);
        res.status(500).json({ message: 'Failed to fetch pending certificates' });
    }
});

router.put('/approve/:id', async (req, res) => {
    try {
        await Certificate.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ message: 'Approved Successfully' });
    } catch (err) {
        console.error('Approve error:', err);
        res.status(500).json({ message: 'Approve failed' });
    }
});

module.exports = router;
