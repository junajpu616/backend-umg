const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const adminRoutes = require("./routes/admin.routes");
const { swaggerUi, swaggerDocs } = require("./swagger")

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de estado
app.get("/", (_req, res) => res.json({ ok: true, service: "UMG_PROYECT" }));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
