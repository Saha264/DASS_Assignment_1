import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

import messageRoutes from './routes/messageRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';

//load env variables
dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app); // Create HTTP server to attach Socket.io

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ entended: true }));

app.use(morgan('dev'));

//Routes

const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        // Exclude /api routes so they get handled by the notFound middleware below
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
        } else {
            res.status(404).json({ message: 'API Route Not Found' });
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('Felicity Event Management API is running');
    });
}

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(notFound);
app.use(errorHandler);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific team room
    socket.on('join_team', (teamId) => {
        socket.join(teamId);
        console.log(`User ${socket.id} joined team room: ${teamId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
        // data expects: { teamId, senderId, senderName, content }
        try {
            // Save message to database
            const message = await Message.create({
                team: data.teamId,
                sender: data.senderId,
                content: data.content
            });

            // Construct payload to broadcast (mimicking populated Mongoose object)
            const messagePayload = {
                ...message.toObject(),
                sender: {
                    _id: data.senderId,
                    firstName: data.senderName.firstName,
                    lastName: data.senderName.lastName,
                }
            };

            // Broadcast to everyone in the room (including sender to update their UI)
            io.to(data.teamId).emit('receive_message', messagePayload);
        } catch (error) {
            console.error('Socket message save error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

