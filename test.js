const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_BniQ96PuJcIb@ep-rough-math-ap0c7osc-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

async function main() {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows);
  process.exit(0);
}

main().catch(console.error);