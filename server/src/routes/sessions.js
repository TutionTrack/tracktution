"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
const sendSessionEmail = async (studentEmail, teacherEmail, subject, text) => {
    if (!process.env.SMTP_USER) {
        console.log(`[DEV MODE] Email to ${studentEmail}, ${teacherEmail}: [${subject}] - ${text}`);
        return;
    }
    try {
        await transporter.sendMail({ from: process.env.SMTP_USER, to: [studentEmail, teacherEmail].filter(Boolean).join(','), subject, text });
    }
    catch (e) {
        console.error("Email send failed", e);
    }
};
router.get('/', async (req, res) => {
    const sessions = await models_1.Session.findAll({ where: { teacher_id: req.user.id }, include: [models_1.Student] });
    res.json(sessions);
});
router.post('/', async (req, res) => {
    const session = await models_1.Session.create({ ...req.body, teacher_id: req.user.id });
    const student = await models_1.Student.findByPk(session.student_id);
    if (student && student.email) {
        await sendSessionEmail(student.email, 'teacher@example.com', 'New Session Scheduled', `A session for ${session.subject} is scheduled on ${session.date} at ${session.start_time}.`);
    }
    res.json(session);
});
router.put('/:id', async (req, res) => {
    await models_1.Session.update(req.body, { where: { id: req.params.id, teacher_id: req.user.id } });
    res.json({ message: 'Updated successfully' });
});
router.delete('/:id', async (req, res) => {
    await models_1.Session.destroy({ where: { id: req.params.id, teacher_id: req.user.id } });
    res.json({ message: 'Deleted successfully' });
});
exports.default = router;
//# sourceMappingURL=sessions.js.map