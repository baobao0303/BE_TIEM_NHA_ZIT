import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET } from '@/config';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: object, expiresIn: SignOptions['expiresIn'] = '1h'): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload: object, expiresIn: SignOptions['expiresIn'] = '7d'): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
    return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string): string | jwt.JwtPayload => {
    return jwt.verify(token, JWT_SECRET);
};
