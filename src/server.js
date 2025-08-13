require("dotenv").config();
const app = require("./app");
const { connectMongo } = require("./config/mongo");
const { prisma } = require("./config/prisma");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectMongo(process.env.MONGO_URI);
    await prisma.$connect();
    console.log("PostgreSQL (Prisma) conectado");

    app.listen(PORT, () => console.log(`🚀 API escuchando en http://localhost:${PORT}`));
  } catch (error) {
    console.error("❌ Error al iniciar: ", error);
    process.exit(1);
  }
}

bootstrap();
