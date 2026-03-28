import express from 'express';
import dotenv from "dotenv";
import sequelize from "./src/db/db.js";
import searchRoutes from './src/routes/searchRoutes.js'
import comparisonRoutes from './src/routes/comparisonRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import cors from 'cors';
dotenv.config();

const app= express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

app.use('/api', searchRoutes);
app.use('/api', comparisonRoutes);
app.use('/api', uploadRoutes);

app.use('/', (req, res)=>{
    res.send("search my admission backend");
});

const startServer = async () => {
  try {
    await sequelize.sync();
    console.log("All tables synced with database");
  } catch (err) {
    console.error("Sync failed (continuing without DB):", err);
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();