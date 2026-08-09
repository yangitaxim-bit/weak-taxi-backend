const { driversRef } = require('../services/firebaseService');

exports.updateLocation = async (req, res) => {
    const { lat, lng } = req.body;
    const driverId = req.user.id;
    try {
        await driversRef.child(driverId).child('location').set({ lat, lng, updatedAt: Date.now() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    const driverId = req.user.id;
    try {
        await driversRef.child(driverId).update({ status });
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const snap = await driversRef.child(req.user.id).once('value');
        res.json(snap.val());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
