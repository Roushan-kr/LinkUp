import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Test server is running'))

const PORT = 4000;

app.listen(PORT, () => console.log(`Test server is running on port ${PORT}`))

