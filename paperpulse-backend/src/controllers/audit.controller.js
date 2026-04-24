const auditModel = require("../models/audit.model");

const getLogs = async (req, res) => {
  try {
    const paper_id = req.params.paper_id || req.params.paperId || req.query.paper_id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const logs = await auditModel.getLogs({ paper_id, limit, offset });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLogs };