const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
    admin.initializeApp({
        databaseURL: process.env.FIREBASE_DATABASE_URL
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
