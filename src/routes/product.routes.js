const express = require("express");
const { authRequired } = require("../middleware/auth");
const { providerAuthRequired } = require("../middleware/providerAuth");
const {
    list,
    listMyProducts,
    create,
    getById,
    update,
    remove
} = require("../controllers/product.controller");

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get("/", list); // Listar productos activos con filtros

// Rutas que requieren autenticación
router.use(authRequired);
router.get("/:id", getById);

// Rutas que requieren ser proveedor
router.use(providerAuthRequired);
router.get("/provider/my-products", listMyProducts); // Listar productos del proveedor
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
