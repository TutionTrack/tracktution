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
  
  let reportText = "Tuition Session Tracker Report\n";
  reportText += "=================================\n\n";
  
  let totalMinutes = 0;
  
  logs.forEach(log => {
     const studentName = (log as any).Student ? (log as any).Student.name : 'Unknown';
     reportText += `Student: ${studentName}\n`;
     reportText += `Date: ${log.date}\n`;
     reportText += `Time: ${log.start_time} - ${log.end_time}\n`;
     reportText += `Duration: ${log.duration}\n`;
     reportText += `Status: ${log.status}\n`;
     reportText += `Comments: ${log.comments}\n`;
     reportText += `---------------------------------\n`;
     
     if (log.duration && log.duration.includes(':')) {
       const [h, m] = log.duration.split(':').map(Number);
       totalMinutes += (h * 60) + m;
     }
  });
  
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  
  reportText += `\nTotal Hours: ${totalHours}h ${remainingMins}m\n`;
  
  res.json({ text: reportText, data: logs });
});

export default router;
