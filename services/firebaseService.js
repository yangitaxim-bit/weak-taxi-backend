const admin = require('firebase-admin');
require('dotenv').config();

// Hardcoded fallback for Railway/Production
const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://ygrweaktaxi-default-rtdb.firebaseio.com";

if (!admin.apps.length) {
    admin.initializeApp({
        databaseURL: databaseURL
    });
}

const db = admin.database();

module.exports = {
    admin,
    db,
    driversRef: db.ref('drivers'),
    ordersRef: db.ref('orders'),
    clientsRef: db.ref('clients')
};
