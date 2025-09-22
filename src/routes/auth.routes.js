const express = require("express");
const { register, login, me, changePassword } = require("../controllers/auth.controller");
const { setup2FA, enable2FA, disable2FA, verifyLogin2FA } = require("../controllers/twofa.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, me);
router.post("/change-password", authRequired, changePassword);

// 2FA routes
router.post("/2fa/setup", authRequired, setup2FA);
router.post("/2fa/enable", authRequired, enable2FA);
router.post("/2fa/disable", authRequired, disable2FA);
router.post("/2fa/verify-login", verifyLogin2FA);

module.exports = router;
