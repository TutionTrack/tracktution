"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionLog = exports.Session = exports.Student = exports.EmailOTP = exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
class User extends sequelize_1.Model {
    id;
    name;
    email;
    password_hash;
}
exports.User = User;
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: sequelize_1.DataTypes.STRING, allowNull: false }
}, { sequelize: db_1.sequelize, modelName: 'User' });
class EmailOTP extends sequelize_1.Model {
    id;
    user_id;
    otp;
    expires_at;
    type;
}
exports.EmailOTP = EmailOTP;
EmailOTP.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    otp: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    expires_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    type: { type: sequelize_1.DataTypes.STRING, allowNull: false } // 'register', 'reset'
}, { sequelize: db_1.sequelize, modelName: 'EmailOTP' });
class Student extends sequelize_1.Model {
    id;
    teacher_id;
    name;
    email;
    board;
    grade;
    notes;
}
exports.Student = Student;
Student.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    teacher_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING },
    board: { type: sequelize_1.DataTypes.STRING },
    grade: { type: sequelize_1.DataTypes.STRING },
    notes: { type: sequelize_1.DataTypes.TEXT }
}, { sequelize: db_1.sequelize, modelName: 'Student' });
class Session extends sequelize_1.Model {
    id;
    teacher_id;
    student_id;
    subject;
    date;
    start_time;
    end_time;
    location;
    recurring_type;
}
exports.Session = Session;
Session.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    teacher_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    student_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    subject: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    date: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    start_time: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    end_time: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    location: { type: sequelize_1.DataTypes.STRING },
    recurring_type: { type: sequelize_1.DataTypes.STRING, defaultValue: 'None' }
}, { sequelize: db_1.sequelize, modelName: 'Session' });
class SessionLog extends sequelize_1.Model {
    id;
    session_id;
    student_id;
    teacher_id;
    date;
    start_time;
    end_time;
    duration;
    comments;
    status;
}
exports.SessionLog = SessionLog;
SessionLog.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    session_id: { type: sequelize_1.DataTypes.INTEGER },
    student_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    date: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    start_time: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    end_time: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    duration: { type: sequelize_1.DataTypes.STRING },
    comments: { type: sequelize_1.DataTypes.TEXT },
    status: { type: sequelize_1.DataTypes.STRING, allowNull: false } // completed, missed, cancelled
}, { sequelize: db_1.sequelize, modelName: 'SessionLog' });
// Associations
User.hasMany(Student, { foreignKey: 'teacher_id' });
Student.belongsTo(User, { foreignKey: 'teacher_id' });
Student.hasMany(Session, { foreignKey: 'student_id' });
Session.belongsTo(Student, { foreignKey: 'student_id' });
Student.hasMany(SessionLog, { foreignKey: 'student_id' });
SessionLog.belongsTo(Student, { foreignKey: 'student_id' });
//# sourceMappingURL=index.js.map