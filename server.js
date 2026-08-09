const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.json({ message: 'WEAK Taxi API ishlayapti!' }));
app.get('/api/client/mobile/1.0/time', (req, res) => res.json({ time: new Date().toISOString() }));
app.get('/api/client/mobile/1.0/countries', (req, res) => res.json([
  { id: 1, name: 'Uzbekistan', code: 'UZ', phoneCode: '+998' },
  { id: 2, name: 'Russia', code: 'RU', phoneCode: '+7' }
]));

app.listen(PORT, () => console.log(`Server ${PORT} portda ishlamoqda`));