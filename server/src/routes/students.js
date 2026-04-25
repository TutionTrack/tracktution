"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const students = await models_1.Student.findAll({ where: { teacher_id: req.user.id } });
    res.json(students);
});
router.post('/', async (req, res) => {
    const student = await models_1.Student.create({ ...req.body, teacher_id: req.user.id });
    res.json(student);
});
router.put('/:id', async (req, res) => {
    await models_1.Student.update(req.body, { where: { id: req.params.id, teacher_id: req.user.id } });
    res.json({ message: 'Updated successfully' });
});
router.delete('/:id', async (req, res) => {
    await models_1.Student.destroy({ where: { id: req.params.id, teacher_id: req.user.id } });
    res.json({ message: 'Deleted successfully' });
});
exports.default = router;
//# sourceMappingURL=students.js.map