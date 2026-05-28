export declare class LoginAttempt {
    id: number;
    email: string;
    attempts: number;
    last_attempt: Date;
    locked_until: Date;
    ip: string;
}
