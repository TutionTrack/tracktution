import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Session, Student } from '../models';
import nodemailer from 'nodemailer';

const router = Router();
router.use(authenticate as any);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const sendSessionEmail = async (studentEmail: string, teacherEmail: string, subject: string, text: string) => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV MODE] Email to ${studentEmail}, ${teacherEmail}: [${subject}] - ${text}`);
    return;
  }
  try {
    await transporter.sendMail({ from: process.env.SMTP_USER, to: [studentEmail, teacherEmail].filter(Boolean).join(','), subject, text });
  } catch (e) {
    console.error("Email send failed", e);
  }
};

router.get('/', async (req: AuthRequest, res) => {
  const sessions = await Session.findAll({ where: { teacher_id: req.user!.id }, include: [Student] });
  res.json(sessions);
});

router.post('/', async (req: AuthRequest, res) => {
  const session = await Session.create({ ...req.body, teacher_id: req.user!.id });
  const student = await Student.findByPk(session.student_id);
  if (student && student.email) {
    await sendSessionEmail(student.email, 'teacher@example.com', 'New Session Scheduled', `A session for ${session.subject} is scheduled on ${session.date} at ${session.start_time}.`);
  }
  res.json(session);
});

router.put('/:id', async (req: AuthRequest, res) => {
  await Session.update(req.body, { where: { id: req.params.id, teacher_id: req.user!.id } });
  res.json({ message: 'Updated successfully' });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await Session.destroy({ where: { id: req.params.id, teacher_id: req.user!.id } });
  res.json({ message: 'Deleted successfully' });
});

export default router;
