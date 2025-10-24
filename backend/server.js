import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productsRouter from './routes/products.js';
import stockRouter from './routes/stock.js';
import salesRouter from './routes/sales.js';
import userRouter from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Route
app.use('/products', productsRouter);
app.use('/stock', stockRouter);
app.use('/sales', salesRouter);
app.use('/users', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});