const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/api/tasks', require('./routes/taskRoutes'));

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));