import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes'
import feedbackRoutes from './routes/feedbackRoutes';
import cartRoutes from './routes/cartRoutes';
import addressRoutes from './routes/addressRoutes';
import orderRoutes from './routes/orderRoutes';
import returnRoutes from './routes/returnRoutes'
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();



const app = express();
app.use(express.json());
app.use(cookieParser()); 
app.use(cors());
app.use(helmet());

app.use('/api/users', userRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/feedback',feedbackRoutes);
app.use('/api/carts',cartRoutes)
app.use('/api/address',addressRoutes);
app.use('/api/orders',orderRoutes);

app.use('/api/returns', returnRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
