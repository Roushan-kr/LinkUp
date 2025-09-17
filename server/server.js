import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoute.js';
import postRouter from './routes/postRoutes.js';


const app = express();

await connectDB();

app.use(express.json());
app.use(cors());


// global middleware to mock authentication
app.use((req, res, next) => {
    req.auth = () => Promise.resolve({ userId: 'dev_user_123' });
    console.log('auth middleware called');
    next();
});

app.get('/', (req, res)=> res.send('server is running'))
// app.use('/api/inngest', serve({ client: inngest, functions}) )
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`))