import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import busRoutes from './routes/buses';




dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI as string, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('MongoDB connected'))
  .catch((err: Error) => console.error(err));

app.get('/', (req: Request, res: Response) => res.send('API running'));
app.use('/api/buses', busRoutes);

export default app;
