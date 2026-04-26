const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const paymentController = require("../controllers/payment.controller");

router.post("/create", auth, paymentController.createPayment);
router.patch("/pay", auth, paymentController.simulatePayment);
router.get("/:paperId", auth, paymentController.getPaymentInfo);

module.exports = router;
