
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }))

app.use(cors({
    origin: 'http://localhost:3000'
  }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/mydb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));


const userRoutes = require('./routes/userRoute');
app.use('/api/v1/user', userRoutes);

const employeeRoutes = require('./routes/employeeRoute');
app.use('/api/v1/emp', employeeRoutes);

const SERVER_PORT = 5000;
app.listen(SERVER_PORT, () =>{
    console.log(`Server running on port ${SERVER_PORT}`)
})

