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
