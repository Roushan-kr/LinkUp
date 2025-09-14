import express from 'express';

const app = express();

app.get('/', (req, res) => res.send('Simple test server is running'))

const PORT = 4000;

app.listen(PORT, () => console.log(`Simple test server is running on port ${PORT}`))
