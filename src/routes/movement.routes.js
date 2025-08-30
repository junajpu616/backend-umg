const { Router } = require("express");
const { registrarMovimiento, listarMovimientos } = require("../controllers/movimiento.controller");

const router = Router();

router.post("/", registrarMovimiento);
router.get("/", listarMovimientos);

module.exports = router;