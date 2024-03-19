import postgres from "postgres";

export const sql = postgres(Bun.env.DATABASE_URL!);
