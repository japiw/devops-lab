const http = require("http");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT || 3000);

const pool = new Pool({
  host: process.env.DB_HOST || "database",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const server = http.createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });

    res.end(
      JSON.stringify({
        status: "ok",
      })
    );

    return;
  }

  if (req.url === "/db") {
    try {
      const result = await pool.query("SELECT NOW()");

      res.writeHead(200, { "Content-Type": "application/json" });

      res.end(
        JSON.stringify({
          status: "database connected",
          time: result.rows[0].now,
        })
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500, { "Content-Type": "application/json" });

      res.end(
        JSON.stringify({
          status: "database connection failed",
        })
      );
    }

    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(
    JSON.stringify({
      message: "Hello from my Docker container",
      status: "running",
    })
  );
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down...");

  server.close(async () => {
    await pool.end();
    console.log("Server shut down gracefully.");
    process.exit(0);
  });
});









