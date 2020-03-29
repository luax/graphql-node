import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";

const selectFields = (
  includedFields: Set<string>,
  selectableFields: Set<string>,
): ((info: GraphQLResolveInfo) => string[]) => {
  const allFields = [...includedFields, ...selectableFields].sort();
  return (info: GraphQLResolveInfo): string[] => {
    if (!info) {
      return allFields;
    }
    const fields = Object.keys(graphqlFields(info));
    const selectedFields = fields.filter(field => selectableFields.has(field));
    const sortedFields = [...includedFields, ...selectedFields].sort();
    return sortedFields;
  };
};

export { selectFields };
