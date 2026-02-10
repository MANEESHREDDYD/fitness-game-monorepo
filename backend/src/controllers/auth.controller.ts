import { Request, Response } from 'express';
import { query } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const SECRET_KEY = process.env.JWT_SECRET || 'local-dev-secret';

const SignupSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    weight_kg: z.number().optional(),
    height_cm: z.number().optional()
});

export const signup = async (req: Request, res: Response) => {
    try {
        const data = SignupSchema.parse(req.body);
        const hash = await bcrypt.hash(data.password, 10);

        const result = await query(
            `INSERT INTO users (username, email, password_hash, weight_kg, height_cm)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email`,
            [data.username, data.email, hash, data.weight_kg || 70, data.height_cm || 170]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Username or Email already exists' });
        }
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });

        // Remove hash from response
        delete user.password_hash;

        res.json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
