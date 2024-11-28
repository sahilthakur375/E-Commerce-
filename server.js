import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import bodyParser from 'body-parser';
import fileUpload from "express-fileupload"



dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(fileUpload());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
