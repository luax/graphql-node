const getUser = req => {
  const token = req.headers.authentication || "";
  return {
    id: 1,
    email: "ludvig",
    token,
  };
};

module.exports = {
  getUser,
};
