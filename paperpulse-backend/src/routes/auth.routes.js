const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.get("/admin-data", auth, role("admin"), (req, res) => {
  res.json({ message: "Admin only data" });
});
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;