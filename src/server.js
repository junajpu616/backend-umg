require("dotenv").config();
const app = require("./app");
const { prisma } = require("./config/prisma");

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:'

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL (Prisma) conectado");

    app.listen(PORT, () => {
        console.log(`🚀 API escuchando en ${API_URL}:${PORT}`);
        console.log(`Documentación en ${API_URL}:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar: ", error);
    process.exit(1);
  }
}

bootstrap();
