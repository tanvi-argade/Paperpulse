const auditModel = require("../models/audit.model");

const getLogs = async (req, res) => {
  try {
    const paper_id = req.params.paper_id || req.params.paperId;

    const logs = await auditModel.getPaperLogs(paper_id);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLogs };