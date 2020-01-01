const { AuthenticationError } = require("./errors");

module.exports = (getUser, models, loaders) => async ({ req }) => {
  const user = getUser(req);
  if (!user)
    throw new AuthenticationError("you must be logged in to query this schema");
  return {
    user,
    models,
    // Create new loaders per request
    loaders: loaders(),
  };
};
