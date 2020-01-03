const {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} = require("apollo-server");

const formatError = err => {
  if (err.message.startsWith("Database Error: ")) {
    return new Error("Internal server error");
  }

  if (process.env.NODE_ENV !== "test") console.log("error", err);

  return err;
};

module.exports = {
  AuthenticationError,
  ForbiddenError,
  formatError,
  UserInputError,
};
