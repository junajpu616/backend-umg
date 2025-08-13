const express = require("express");
const { authRequired } = require("../middleware/auth");
const { list, create, getById, update, remove } = require("../controllers/product.controller");

const router = express.Router();
router.use(authRequired);
router.get("/", list);
router.post("/", create);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
