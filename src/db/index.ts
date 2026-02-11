import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Architect's Note: For serverless, we disable 'prepare' to 
// maintain compatibility with Supabase's transaction pooling.
const connectionString = process.env.DATABASE_URL!


const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });