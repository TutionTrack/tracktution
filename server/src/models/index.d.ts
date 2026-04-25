import { Model } from 'sequelize';
export declare class User extends Model {
    id: number;
    name: string;
    email: string;
    password_hash: string;
}
export declare class EmailOTP extends Model {
    id: number;
    user_id: number;
    otp: string;
    expires_at: Date;
    type: string;
}
export declare class Student extends Model {
    id: number;
    teacher_id: number;
    name: string;
    email: string;
    board: string;
    grade: string;
    notes: string;
}
export declare class Session extends Model {
    id: number;
    teacher_id: number;
    student_id: number;
    subject: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    recurring_type: string;
}
export declare class SessionLog extends Model {
    id: number;
    session_id: number;
    student_id: number;
    teacher_id: number;
    date: string;
    start_time: string;
    end_time: string;
    duration: string;
    comments: string;
    status: string;
}
//# sourceMappingURL=index.d.ts.map