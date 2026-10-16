import { sql } from "drizzle-orm";
import { db } from "./src/db/client";

async function main() {
  const result = await db.execute(sql`SELECT pg_get_viewdef('v_nivel_usuario')`);
  console.log(result);
  process.exit(0);
}
main();
