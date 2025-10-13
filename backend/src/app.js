const express = require('express');
const authRoutes = require('./Routes/auth.routes')
const cookieparser= require('cookie-parser');
const cookieParser = require('cookie-parser');
const taxRoutes = require('./Routes/taxRoutes')

const app = express();
app.use(cookieParser());
app.use(express.json());
const cors = require('cors');
app.use(cors()); // Allow all origins for now



 
app.use('/api/auth',authRoutes);

app.use('/api/tax', taxRoutes);

module.exports = app;