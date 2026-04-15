const transitions = {
  submitted: ["under_review"],
  under_review: ["accepted", "rejected"],
  accepted: [],
  rejected: []
};

const canTransition = (from, to) => {
  return transitions[from]?.includes(to);
};

module.exports = { canTransition };