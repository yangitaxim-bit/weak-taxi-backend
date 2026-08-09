const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { driversRef, clientsRef } = require('../services/firebaseService');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretweakkey123";

exports.driverLogin = async (req, res) => {
    const { phone, pin, pozivnoy } = req.body;

    if (!phone || !pin || !pozivnoy) {
        return res.status(400).json({ error: "Phone, PIN, and Pozivnoy are required." });
    }

    try {
        const driverId = `driver_${pozivnoy}`;
        const snapshot = await driversRef.child(driverId).once('value');

        if (!snapshot.exists()) {
            return res.status(401).json({ error: "Driver not found or invalid pozivnoy." });
        }

        const driverData = snapshot.val();

        if (driverData.phone !== phone) {
            return res.status(401).json({ error: "Phone number mismatch." });
        }

        const isPinValid = driverData.pin_hash ? await bcrypt.compare(String(pin), driverData.pin_hash) : false;
        const isPlainValid = String(pin) === String(driverData.pin);

        if (!isPinValid && !isPlainValid) {
            return res.status(401).json({ error: "Invalid PIN." });
        }

        const token = jwt.sign(
            { id: driverId, role: 'driver', pozivnoy: pozivnoy },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            driver: {
                id: driverId,
                name: driverData.name,
                phone: driverData.phone,
                car: driverData.car,
                plate: driverData.plate
            }
        });
    } catch (error) {
        console.error("Driver Login error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

exports.clientLogin = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone is required" });

    try {
        const clientId = `client_${phone.replace('+', '')}`;
        const snapshot = await clientsRef.child(clientId).once('value');

        let clientData;
        if (!snapshot.exists()) {
            clientData = { phone, name: 'New Client', registeredAt: Date.now() };
            await clientsRef.child(clientId).set(clientData);
        } else {
            clientData = snapshot.val();
        }

        const token = jwt.sign(
            { id: clientId, role: 'client' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ success: true, token, client: clientData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
