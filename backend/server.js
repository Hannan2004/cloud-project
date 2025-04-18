const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();

const corsOptions = {
    origin: ['https://task-manager-frontend-470119455745.us-central1.run.app',
        'http://localhost:3000' ] ,// Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/api/tasks', require('./routes/taskRoutes'));

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));