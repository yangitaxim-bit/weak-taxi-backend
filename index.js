const express = require('express');
const http = require('http');
const cors = require('cors');
const { Telegraf, Scenes, session } = require('telegraf');
const { driversRef } = require('./services/firebaseService');
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

// ---------------- TELEGRAM BOT INTEGRATION ----------------
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const registerWizard = new Scenes.WizardScene(
    'register_driver',
    (ctx) => {
        ctx.reply("Assalomu alaykum! WeakTaxi ro'yxatdan o'tish botiga xush kelibsiz. 🚖\n\nIsmingizni kiriting:");
        ctx.wizard.state.driverData = {};
        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.wizard.state.driverData.name = ctx.message.text;
        ctx.reply("Telefon raqamingizni yuboring:", {
            reply_markup: { keyboard: [[{ text: "📞 Raqamni yuborish", request_contact: true }]], one_time_keyboard: true }
        });
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.wizard.state.driverData.phone = ctx.message.contact ? ctx.message.contact.phone_number : ctx.message.text;
        ctx.reply("Mashina modeli (masalan: Gentra):", { reply_markup: { remove_keyboard: true } });
        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.wizard.state.driverData.car = ctx.message.text;
        ctx.reply("Mashina raqami (masalan: 01A123AA):");
        return ctx.wizard.next();
    },
    async (ctx) => {
        const plate = ctx.message.text.toUpperCase();
        const { name, phone, car } = ctx.wizard.state.driverData;
        const pin = String(Math.floor(1000 + Math.random() * 9000));
        const pozivnoy = String(Math.floor(1000 + Math.random() * 900));
        const driverId = `driver_${pozivnoy}`;

        await driversRef.child(driverId).set({
            name, phone, car, plate, pin, pozivnoy,
            status: "offline", balance: 0,
            approved: false,
            registered_at: Date.now()
        });

        ctx.replyWithMarkdownV2(
            `✅ *Muvaffaqiyatli ro'yxatdan o'tdingiz\\!*\n\n` +
            `🔑 PIN: \`${pin}\`\n` +
            `🆔 Pozivnoy: \`${pozivnoy}\`\n\n` +
            `Ilovaga ushbu ma'lumotlar bilan kiring\\.`
        );
        return ctx.scene.leave();
    }
);

const stage = new Scenes.Stage([registerWizard]);
bot.use(session());
bot.use(stage.middleware());
bot.start((ctx) => ctx.reply("Ro'yxatdan o'tish uchun /register ni bosing."));
bot.command('register', (ctx) => ctx.scene.enter('register_driver'));

bot.launch().then(() => console.log('Telegram Bot started'));

// ---------------- SERVER START ----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
