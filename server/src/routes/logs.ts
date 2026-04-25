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
