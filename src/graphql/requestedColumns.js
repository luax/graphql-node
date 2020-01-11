const graphqlFields = require("graphql-fields");

const requestedColumns = (keys, other) => {
  const defaultColumns = [...keys, ...other].sort();
  return (info = null) => {
    if (!info) {
      return defaultColumns;
    }
    const fields = Object.keys(graphqlFields(info));
    const selectedColumns = fields.filter(field => other.has(field));
    const columns = [...keys, ...selectedColumns].sort();
    return columns;
  };
};

module.exports = requestedColumns;
