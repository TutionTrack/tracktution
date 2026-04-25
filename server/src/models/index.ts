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
