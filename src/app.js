const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const movimientoRoutes = require("./routes/movimiento.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, service: "UMG_PROYECT" }));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/movimientos", movimientoRoutes);

module.exports = app;
