import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected via Sequelize");
  } catch (error) {
    console.error("DB connection failed:", error);
    // process.exit(1); // Allow server to start without DB for now
  }
};

testConnection();

export default sequelize;
