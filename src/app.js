const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const adminRoutes = require("./routes/admin.routes");
const providerRoutes = require("./routes/provider.routes");
const categoryRoutes = require("./routes/category.routes");
const pedidoRutas = require('./routes/pedido.routes');
const estadoPedidoRoutes = require('./routes/estadoPedido.routes');
const tipoMovimientoRoutes = require('./routes/tipoMovimiento.routes');
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
app.use("/api/providers", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/pedidos", pedidoRutas);
app.use("/api/estados-pedido", estadoPedidoRoutes);
app.use("/api/tipos-movimiento", tipoMovimientoRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
