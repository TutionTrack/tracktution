"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await models_1.User.findOne({ where: { email } });
        if (user)
            return res.status(400).json({ error: 'Email already exists' });
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        user = await models_1.User.create({ name, email, password_hash });
        const otp = generateOTP();
        await models_1.EmailOTP.create({ user_id: user.id, otp, expires_at: new Date(Date.now() + 15 * 60000), type: 'register' });
        if (process.env.SMTP_USER) {
            await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject: 'Your Registration OTP', text: `Your OTP is ${otp}` });
        }
        else {
            console.log(`[DEV MODE] Registration OTP for ${email}: ${otp}`);
        }
        res.json({ message: 'Registration successful, OTP sent.', userId: user.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/verify-otp', async (req, res) => {
    const { userId, otp, type } = req.body;
    const record = await models_1.EmailOTP.findOne({ where: { user_id: userId, otp, type } });
    if (!record || record.expires_at < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    await record.destroy();
    res.json({ message: 'OTP verified successfully' });
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await models_1.User.findOne({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password_hash))) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await models_1.User.findOne({ where: { email } });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const otp = generateOTP();
    await models_1.EmailOTP.create({ user_id: user.id, otp, expires_at: new Date(Date.now() + 15 * 60000), type: 'reset' });
    if (process.env.SMTP_USER) {
        await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject: 'Your Password Reset OTP', text: `Your OTP is ${otp}` });
    }
    else {
        console.log(`[DEV MODE] Reset OTP for ${email}: ${otp}`);
    }
    res.json({ message: 'Reset OTP sent', userId: user.id });
});
router.post('/reset-password', async (req, res) => {
    const { userId, otp, newPassword } = req.body;
    const record = await models_1.EmailOTP.findOne({ where: { user_id: userId, otp, type: 'reset' } });
    if (!record || record.expires_at < new Date())
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    const password_hash = await bcryptjs_1.default.hash(newPassword, 10);
    await models_1.User.update({ password_hash }, { where: { id: userId } });
    await record.destroy();
    res.json({ message: 'Password reset successful' });
});
exports.default = router;
//# sourceMappingURL=auth.js.map