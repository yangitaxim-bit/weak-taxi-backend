const { ordersRef, driversRef } = require('../services/firebaseService');
const { getIo } = require('../services/socketService');

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

exports.createOrder = async (req, res) => {
    try {
        const orderId = `order_${Date.now()}`;
        const orderData = { ...req.body, id: orderId, clientId: req.user.id, status: 'searching', createdAt: Date.now() };
        await ordersRef.child(orderId).set(orderData);
        const driversSnap = await driversRef.once('value');
        let nearestDriver = null;
        let minDistance = 5.0;
        driversSnap.forEach(snap => {
            const driver = snap.val();
            if (driver.status === 'online' && driver.location) {
                const dist = getDistance(orderData.pickupLocation.lat, orderData.pickupLocation.lng, driver.location.lat, driver.location.lng);
                if (dist < minDistance) { minDistance = dist; nearestDriver = snap.key; }
            }
        });
        if (nearestDriver) {
            await ordersRef.child(orderId).update({ assignedDriver: nearestDriver });
            getIo().to(nearestDriver).emit('new_order', orderData);
        }
        res.json({ success: true, orderId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.acceptOrder = async (req, res) => {
    const { orderId } = req.params;
    const driverId = req.user.id;
    try {
        const orderSnap = await ordersRef.child(orderId).once('value');
        if (!orderSnap.exists()) return res.status(404).json({ error: "Order not found" });
        const order = orderSnap.val();
        if (order.status !== 'searching') return res.status(400).json({ error: "Order already taken" });
        await ordersRef.child(orderId).update({ status: 'accepted', driverId: driverId });
        getIo().to(order.clientId).emit('order_accepted', { driverId, orderId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.finishOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        await ordersRef.child(orderId).update({ status: 'finished' });
        const orderSnap = await ordersRef.child(orderId).once('value');
        getIo().to(orderSnap.val().clientId).emit('order_finished', { orderId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
