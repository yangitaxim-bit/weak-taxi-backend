const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./services/socketService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));

// Root endpoint for status check
app.get('/', (req, res) => {
    res.json({ status: "running", server: "Weak Taxi Professional Backend" });
});

// ---------------- SERVER START ----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
