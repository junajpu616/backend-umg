const express = require("express");
const { authRequired } = require("../middleware/auth");
const { adminAuthRequired } = require("../middleware/adminAuth");
const {
    createAdmin,
    listUsers,
    updateUserStatus
} = require("../controllers/admin.controller");

const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
router.use(authRequired);
router.use(adminAuthRequired);

// Rutas de administración
router.post("/create-admin", createAdmin);
router.get("/users", listUsers);
router.put("/users/:userId/status", updateUserStatus);

module.exports = router;
