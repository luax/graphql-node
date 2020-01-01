const { AuthenticationError, ForbiddenError } = require("apollo-server");

const formatError = err => {
  // Don't give the specific errors to the client.
  if (err.message.startsWith("Database Error: ")) {
    return new Error("Internal server error");
  }

  if (process.env.NODE_ENV !== "test") console.log("error", err);

  // Otherwise return the original error.  The error can also
  // be manipulated in other ways, so long as it's returned.
  return err;
};

module.exports = { AuthenticationError, ForbiddenError, formatError };
