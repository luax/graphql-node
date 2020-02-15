import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";

const selectedFields = (
  includedFields: Set<string>,
  selectableFields: Set<string>,
): ((info: GraphQLResolveInfo) => string[]) => {
  const allFields = [...includedFields, ...selectableFields].sort();
  return (info: GraphQLResolveInfo): string[] => {
    if (!info) {
      return allFields;
    }
    const fields = Object.keys(graphqlFields(info));
    const selectedColumns = fields.filter(field => selectableFields.has(field));
    const columns = [...includedFields, ...selectedColumns].sort();
    return columns;
  };
};

export { selectedFields };
