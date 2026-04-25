import os

base_dir = "/Users/s.krishna1_gis/Movies/Antigravity/Track-Tutions-Sessions/server"

files = {
    "src/db.ts": """
import { Sequelize } from 'sequelize';
import path from 'path';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});
""",
    "src/models/index.ts": """
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password_hash!: string;
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'User' });

export class EmailOTP extends Model {
  public id!: number;
  public user_id!: number;
  public otp!: string;
  public expires_at!: Date;
  public type!: string;
}

EmailOTP.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  otp: { type: DataTypes.STRING, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false } // 'register', 'reset'
}, { sequelize, modelName: 'EmailOTP' });

export class Student extends Model {
  public id!: number;
  public teacher_id!: number;
  public name!: string;
  public email!: string;
  public board!: string;
  public grade!: string;
  public notes!: string;
}

Student.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  board: { type: DataTypes.STRING },
  grade: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { sequelize, modelName: 'Student' });

export class Session extends Model {
  public id!: number;
  public teacher_id!: number;
  public student_id!: number;
  public subject!: string;
  public date!: string;
  public start_time!: string;
  public end_time!: string;
  public location!: string;
  public recurring_type!: string;
}

Session.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  start_time: { type: DataTypes.STRING, allowNull: false },
  end_time: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
  recurring_type: { type: DataTypes.STRING, defaultValue: 'None' }
}, { sequelize, modelName: 'Session' });

export class SessionLog extends Model {
  public id!: number;
  public session_id!: number;
  public student_id!: number;
  public teacher_id!: number;
  public date!: string;
  public start_time!: string;
  public end_time!: string;
  public duration!: string;
  public comments!: string;
  public status!: string;
}

SessionLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  session_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  start_time: { type: DataTypes.STRING, allowNull: false },
  end_time: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.STRING },
  comments: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, allowNull: false } // completed, missed, cancelled
}, { sequelize, modelName: 'SessionLog' });

// Associations
User.hasMany(Student, { foreignKey: 'teacher_id' });
Student.belongsTo(User, { foreignKey: 'teacher_id' });

Student.hasMany(Session, { foreignKey: 'student_id' });
Session.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasMany(SessionLog, { foreignKey: 'student_id' });
SessionLog.belongsTo(Student, { foreignKey: 'student_id' });
""",
    "src/index.ts": """
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './db';

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import sessionRoutes from './routes/sessions';
import logRoutes from './routes/logs';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
""",
    "src/middleware/auth.ts": """
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
""",
    "src/routes/auth.ts": """
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, EmailOTP } from '../models';
import nodemailer from 'nodemailer';

const router = Router();

const transporter = nodemailer.createTransport({
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
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ error: 'Email already exists' });
    
    const password_hash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password_hash });

    const otp = generateOTP();
    await EmailOTP.create({ user_id: user.id, otp, expires_at: new Date(Date.now() + 15 * 60000), type: 'register' });
    
    if (process.env.SMTP_USER) {
      await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject: 'Your Registration OTP', text: `Your OTP is ${otp}` });
    } else {
       console.log(`[DEV MODE] Registration OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'Registration successful, OTP sent.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { userId, otp, type } = req.body;
  const record = await EmailOTP.findOne({ where: { user_id: userId, otp, type } });
  if (!record || record.expires_at < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  await record.destroy();
  res.json({ message: 'OTP verified successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const otp = generateOTP();
  await EmailOTP.create({ user_id: user.id, otp, expires_at: new Date(Date.now() + 15 * 60000), type: 'reset' });
  
  if (process.env.SMTP_USER) {
    await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject: 'Your Password Reset OTP', text: `Your OTP is ${otp}` });
  } else {
    console.log(`[DEV MODE] Reset OTP for ${email}: ${otp}`);
  }

  res.json({ message: 'Reset OTP sent', userId: user.id });
});

router.post('/reset-password', async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  const record = await EmailOTP.findOne({ where: { user_id: userId, otp, type: 'reset' } });
  if (!record || record.expires_at < new Date()) return res.status(400).json({ error: 'Invalid or expired OTP' });
  
  const password_hash = await bcrypt.hash(newPassword, 10);
  await User.update({ password_hash }, { where: { id: userId } });
  await record.destroy();
  
  res.json({ message: 'Password reset successful' });
});

export default router;
""",
    "src/routes/students.ts": """
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Student } from '../models';

const router = Router();
router.use(authenticate as any);

router.get('/', async (req: AuthRequest, res) => {
  const students = await Student.findAll({ where: { teacher_id: req.user!.id } });
  res.json(students);
});

router.post('/', async (req: AuthRequest, res) => {
  const student = await Student.create({ ...req.body, teacher_id: req.user!.id });
  res.json(student);
});

router.put('/:id', async (req: AuthRequest, res) => {
  await Student.update(req.body, { where: { id: req.params.id, teacher_id: req.user!.id } });
  res.json({ message: 'Updated successfully' });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await Student.destroy({ where: { id: req.params.id, teacher_id: req.user!.id } });
  res.json({ message: 'Deleted successfully' });
});

export default router;
""",
    "src/routes/sessions.ts": """
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
""",
    "src/routes/logs.ts": """
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { SessionLog, Student } from '../models';

const router = Router();
router.use(authenticate as any);

router.get('/', async (req: AuthRequest, res) => {
  const logs = await SessionLog.findAll({ where: { teacher_id: req.user!.id }, include: [Student] });
  res.json(logs);
});

router.post('/', async (req: AuthRequest, res) => {
  const log = await SessionLog.create({ ...req.body, teacher_id: req.user!.id });
  res.json(log);
});

router.put('/:id', async (req: AuthRequest, res) => {
  await SessionLog.update(req.body, { where: { id: req.params.id, teacher_id: req.user!.id } });
  res.json({ message: 'Updated successfully' });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await SessionLog.destroy({ where: { id: req.params.id, teacher_id: req.user!.id } });
  res.json({ message: 'Deleted successfully' });
});

export default router;
""",
    "src/routes/reports.ts": """
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { SessionLog, Student } from '../models';

const router = Router();
router.use(authenticate as any);

router.get('/', async (req: AuthRequest, res) => {
  // Can add filters based on req.query
  const logs = await SessionLog.findAll({ 
    where: { teacher_id: req.user!.id },
    include: [Student],
    order: [['date', 'DESC']]
  });
  
  const formatTime = (time: string) => time || 'N/A';
  
  let reportText = "Tuition Session Tracker Report\\n";
  reportText += "=================================\\n\\n";
  
  let totalMinutes = 0;
  
  logs.forEach(log => {
     const studentName = (log as any).Student ? (log as any).Student.name : 'Unknown';
     reportText += `Student: ${studentName}\\n`;
     reportText += `Date: ${log.date}\\n`;
     reportText += `Time: ${log.start_time} - ${log.end_time}\\n`;
     reportText += `Duration: ${log.duration}\\n`;
     reportText += `Status: ${log.status}\\n`;
     reportText += `Comments: ${log.comments}\\n`;
     reportText += `---------------------------------\\n`;
     
     if (log.duration && log.duration.includes(':')) {
       const [h, m] = log.duration.split(':').map(Number);
       totalMinutes += (h * 60) + m;
     }
  });
  
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  
  reportText += `\\nTotal Hours: ${totalHours}h ${remainingMins}m\\n`;
  
  res.json({ text: reportText, data: logs });
});

export default router;
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

print("Backend scaffolded successfully.")
