import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { initSocket } from './services/socket.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors()); // Added cors middleware here as it was missing in original index.ts usage but imported

app.use((req, res, next) => {
    // console.log(`[${req.method}] ${req.url}`); // Optional: Disable logging during tests to keep output clean
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${req.method}] ${req.url}`);
    }
    next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initSocket(io);

export { app, httpServer, io };
