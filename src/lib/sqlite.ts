import { log } from "@/lib";
import { core } from "@/lib/tauri";

export class SQLite {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  static async open(path: string): Promise<SQLite> {
    const res = await core.invoke<string>("plugin:rrai-sqlite|open", { path });
    log.debug(res);
    return new SQLite(path);
  }

  async close(): Promise<boolean> {
    return await core.invoke("plugin:rrai-sqlite|close", { path: this.path });
  }

  async execute(sql: string, values?: Record<string, any>): Promise<boolean> {
    return values
      ? await core.invoke("plugin:rrai-sqlite|execute", {
          path: this.path,
          sql,
          args: values,
        })
      : await core.invoke("plugin:rrai-sqlite|execute_sql", { path: this.path, sql });
  }

  async queryWithArgs<T>(sql: string, values?: Record<string, any>): Promise<T> {
    return await core.invoke("plugin:rrai-sqlite|query_with_args", {
      path: this.path,
      sql,
      args: values ?? {},
    });
  }
}

export default SQLite;
