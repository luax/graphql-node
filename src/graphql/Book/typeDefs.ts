import { gql } from "apollo-server";

const typeDefs = gql`
  type Book implements Node {
    id: ID!
    title: String
    author: Author
  }

  extend type Query {
    books: [Book]
    book(id: ID!): Book
  }
`;

export default typeDefs;
