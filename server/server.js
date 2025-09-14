import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
// import { inngest, functions } from "./inngest/index.js"
// import {serve} from 'inngest/express'
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

app.get('/', (req, res)=> res.send('server is running'))
// app.use('/api/inngest', serve({ client: inngest, functions}) )
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`))