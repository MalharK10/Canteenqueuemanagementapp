import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.js';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-strong-random-secret';
export function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}
export function authenticate(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
export async function authenticateAdmin(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await findUserById(decoded.id);
        if (!user || user.role !== 'admin') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        req.userId = decoded.id;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.js.map