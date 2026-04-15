const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const paperRoutes = require("./routes/paper.routes");
const adminRoutes = require("./routes/admin.routes");
const reviewerRoutes = require("./routes/reviewer.routes");
const notificationRoutes = require("./routes/notification.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/reviewer", reviewerRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/", (req, res) => {
  res.send("PaperPulse API Running");
});

module.exports = app;