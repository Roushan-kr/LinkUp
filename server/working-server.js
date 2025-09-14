import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoute.js';
import postRouter from './routes/postRoutes.js';

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

// Development mode - mock authentication
console.log('Running in development mode - using mock authentication');
app.use((req, res, next) => {
    req.auth = () => Promise.resolve({ userId: 'dev_user_123' });
    next();
});

app.get('/', (req, res) => res.send('Working server is running'))
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)

const PORT = 5000;

app.listen(PORT, () => console.log(`Working server is running on port ${PORT}`))

