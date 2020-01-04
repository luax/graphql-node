# graphql-node

Based on Apollo's [getting started guide](https://www.apollographql.com/docs/apollo-server/getting-started/) with added functionality like [cursor-based pagination](https://facebook.github.io/relay/graphql/connections.htm) (WIP) or [DataLoader](https://github.com/graphql/dataloader) for caching and batching PostgresSQL statements.

## Usage

Start server:

```
$ yarn start
```

Go to [http://localhost:4000/](http://localhost:4000/) and enter some query, for example:

```
{
  author(id: 1) {
    booksConnection(first: 11) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id,
          title
        }
        cursor
      }
    }
  }
}
```

## Setup

Have PostgreSQL and yarn installed then run:

```
$ bin/setup
```

## Resources

- [GraphQL](https://graphql.org/learn/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Pagination](https://graphql.org/learn/pagination/)
- [GraphQL Cursor Connections Specification](https://facebook.github.io/relay/graphql/connections.htm)
- [node postgres](http://node-postgres.com/)
- [DataLoader](https://github.com/graphql/dataloader)
