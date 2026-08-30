import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { requireDatabaseUrl } from "../env.js";

const sql = postgres(requireDatabaseUrl());
export const db = drizzle(sql, { schema });
