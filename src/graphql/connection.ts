import { ConnectionInput, ConnectionArguments } from "./types";
import { UserInputError } from "apollo-server";

export class ConnectionUtils {
  // eslint-disable-next-line max-statements
  static async getArguments<T>(
    { first, last, before, after }: ConnectionInput,
    getByCursor: (cursor: string) => Promise<T | undefined>,
  ): Promise<ConnectionArguments<T>> {
    const isFirst = first > 0;
    const isLast = last > 0;
    if (first < 0 || last < 0) {
      throw new UserInputError("first or last must be positive");
    }
    if (!isFirst && !isLast) {
      throw new UserInputError("first or last must be positive");
    }
    if (isFirst && isLast) {
      throw new UserInputError("cannot be both first and last");
    }
    const beforeItem = before && (await getByCursor(before));
    if (before && !beforeItem) {
      throw new UserInputError("bad before cursor");
    }
    const afterItem = after && (await getByCursor(after));
    if (after && !afterItem) {
      throw new UserInputError("bad after cursor");
    }
    return {
      before: beforeItem,
      after: afterItem,
      isFirst,
      isLast,
      limit: first || last,
    };
  }
}
