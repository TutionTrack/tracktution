"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const logs = await models_1.SessionLog.findAll({ where: { teacher_id: req.user.id }, include: [models_1.Student] });
    res.json(logs);
});
router.post('/', async (req, res) => {
    const log = await models_1.SessionLog.create({ ...req.body, teacher_id: req.user.id });
    res.json(log);
});
router.put('/:id', async (req, res) => {
    await models_1.SessionLog.update(req.body, { where: { id: req.params.id, teacher_id: req.user.id } });
    res.json({ message: 'Updated successfully' });
});
router.delete('/:id', async (req, res) => {
    await models_1.SessionLog.destroy({ where: { id: req.params.id, teacher_id: req.user.id } });
    res.json({ message: 'Deleted successfully' });
});
exports.default = router;
//# sourceMappingURL=logs.js.map