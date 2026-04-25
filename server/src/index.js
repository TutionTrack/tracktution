"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const logs_1 = __importDefault(require("./routes/logs"));
const reports_1 = __importDefault(require("./routes/reports"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/students', students_1.default);
app.use('/api/sessions', sessions_1.default);
app.use('/api/logs', logs_1.default);
app.use('/api/reports', reports_1.default);
const PORT = process.env.PORT || 3000;
db_1.sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
//# sourceMappingURL=index.js.map