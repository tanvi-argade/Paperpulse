const pool = require("../config/db");
const paymentModel = require("../models/payment.model");
const auditModel = require("../models/audit.model");
const notificationModel = require("../models/notification.model");
const AUDIT = require("../utils/auditActions");
const PAPER_STATUS = require("../utils/paperStatus");

// Create payment record (Author only)
const createPayment = async (req, res) => {
  try {
    const { paper_id } = req.body;
    const user_id = req.user.id;

    if (!paper_id) {
      return res.status(400).json({ message: "paper_id is required" });
    }

    // 1. Check paper existence and ownership
    const paperRes = await pool.query(
      "SELECT author_id, status FROM papers WHERE id = $1",
      [paper_id]
    );

    if (paperRes.rows.length === 0) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const paper = paperRes.rows[0];

    // Ownership check
    if (paper.author_id !== user_id) {
      return res.status(403).json({ message: "Not authorized to pay for this paper" });
    }

    // 2. Status guard: Only accepted papers allowed
    if (paper.status !== PAPER_STATUS.ACCEPTED) {
      return res.status(400).json({ message: "Payment only allowed for accepted papers" });
    }

    // 3. Create or update pending payment
    const payment = await paymentModel.createPayment(paper_id, user_id, 100); // Fixed amount 100 for simulation

    await auditModel.logAction(paper_id, AUDIT.PAYMENT_CREATED, user_id, { amount: 100 });

    res.status(201).json({
      message: "Payment record created",
      payment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Simulate payment (Author only)
const simulatePayment = async (req, res) => {
  try {
    const { paper_id, status } = req.body; // status: success / failed
    const user_id = req.user.id;

    if (!paper_id || !status) {
      return res.status(400).json({ message: "paper_id and status are required" });
    }

    // 1. Check payment existence
    const payment = await paymentModel.getPaymentByPaper(paper_id);
    if (!payment) {
      return res.status(404).json({ message: "Payment record does not exist. Create it first." });
    }

    // 2. Guard: Cannot re-pay if already success
    if (payment.status === 'success') {
      return res.status(400).json({ message: "Payment already successfully completed" });
    }

    // 3. Ownership check (redundant but safe)
    if (payment.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 4. Update status
    const updatedPayment = await paymentModel.updatePaymentStatus(paper_id, status);

    // 5. Audit & Notifications
    if (status === 'success') {
      await auditModel.logAction(paper_id, AUDIT.PAYMENT_SUCCESS, user_id);
      await notificationModel.createNotification(
        user_id,
        AUDIT.PAYMENT_SUCCESS,
        "Payment successful. You can now publish your paper."
      );
    } else {
      await auditModel.logAction(paper_id, AUDIT.PAYMENT_FAILED, user_id);
    }

    res.json({
      message: `Payment ${status}`,
      payment: updatedPayment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment info
const getPaymentInfo = async (req, res) => {
    try {
        const { paperId } = req.params;
        const payment = await paymentModel.getPaymentByPaper(paperId);
        res.json(payment || { status: 'none' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  createPayment,
  simulatePayment,
  getPaymentInfo
};
