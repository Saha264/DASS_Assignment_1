import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';

//load env variables
dotenv.config();

connectDB();

const app= express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({entended:true}));

app.use(morgan('dev'));

//Routes

app.get('/',(req,res) => {
    res.send('Felicity Event Management API is running');
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT= process.env.PORT ||5000;

app.listen(PORT,()=>{
    console.log(`Server is rinning in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

