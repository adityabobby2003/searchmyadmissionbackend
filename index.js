import express from 'express';
import dotenv from "dotenv";
import searchRoutes from './src/routes/searchRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import cors from 'cors';
dotenv.config();

const app= express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

app.use('/api', searchRoutes);
app.use('/api', uploadRoutes);

app.use('/', (req, res)=>{
    res.send("search my admission backend");
});

app.listen(port, ()=>{
    console.log(`http://localhost:${port}`)
})