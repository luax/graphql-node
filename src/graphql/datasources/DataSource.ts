import {
  DataSource as OriginalDataSource,
  DataSourceConfig,
} from "apollo-datasource";
import { KeyValueCache, PrefixingKeyValueCache } from "apollo-server-caching";
import { AppContext } from "../types";

abstract class DataSource<T> extends OriginalDataSource<AppContext> {
  context!: AppContext;

  cache!: KeyValueCache<string>;

  abstract keyPrefix: string;

  abstract serialize(obj: T): string;

  abstract deserialize(str: string): T;

  initialize(config: DataSourceConfig<AppContext>): void {
    this.cache = new PrefixingKeyValueCache(this.cache, this.keyPrefix);
    this.context = config.context;
  }

  async set(
    key: string,
    value: T,
    ttl: number | undefined = undefined,
  ): Promise<void> {
    const res = await this.cache.set(key, this.serialize(value), { ttl });
    return res;
  }

  async get(key: string): Promise<T | undefined> {
    const res = await this.cache.get(key);
    return res ? this.deserialize(res) : undefined;
  }
}

export default DataSource;
