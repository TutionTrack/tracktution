"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    // Can add filters based on req.query
    const logs = await models_1.SessionLog.findAll({
        where: { teacher_id: req.user.id },
        include: [models_1.Student],
        order: [['date', 'DESC']]
    });
    const formatTime = (time) => time || 'N/A';
    let reportText = "Tuition Session Tracker Report\n";
    reportText += "=================================\n\n";
    let totalMinutes = 0;
    logs.forEach(log => {
        const studentName = log.Student ? log.Student.name : 'Unknown';
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
exports.default = router;
//# sourceMappingURL=reports.js.map