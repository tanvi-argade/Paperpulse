const PAPER_STATUS = require("./paperStatus");

const transitions = {
  [PAPER_STATUS.SUBMITTED]: [PAPER_STATUS.UNDER_REVIEW],
  [PAPER_STATUS.UNDER_REVIEW]: [PAPER_STATUS.ACCEPTED, PAPER_STATUS.REJECTED],
  [PAPER_STATUS.ACCEPTED]: [PAPER_STATUS.PUBLISHED],
  [PAPER_STATUS.REJECTED]: [],
  [PAPER_STATUS.PUBLISHED]: []
};

const canTransition = (from, to) => {
  return transitions[from]?.includes(to);
};

module.exports = { canTransition };