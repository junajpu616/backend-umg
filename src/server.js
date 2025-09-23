require("dotenv").config();
const app = require("./app");
const { prisma } = require("./config/prisma");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL (Prisma) conectado");

    app.listen(PORT, () => {
        console.log(`🚀 API escuchando en http://localhost:${PORT}`);
        console.log(`Documentación en http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar: ", error);
    process.exit(1);
  }
}

bootstrap();
