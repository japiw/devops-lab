const http = require("http");
const { spawn } = require("child_process");

const server = spawn("node", ["server.js"], {
  env: {
    ...process.env,
    PORT: "3001",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || "5432",
    POSTGRES_USER: process.env.POSTGRES_USER || "devops",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "devops123",
    POSTGRES_DB: process.env.POSTGRES_DB || "devops_lab",
  },
});

function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          data,
        });
      });
    }).on("error", reject);
  });
}

async function runTests() {
  try {
    const health = await request("/health");

    if (health.statusCode !== 200 || health.data !== '{"status":"ok"}') {
      throw new Error("Health check test failed.");
    }

    console.log("Health check test passed.");

    const db = await request("/db");

    if (db.statusCode !== 200) {
      throw new Error("Database connection test failed.");
    }

    const result = JSON.parse(db.data);

    if (result.status !== "database connected") {
      throw new Error("Database connection test failed.");
    }

    console.log("Database connection test passed.");

    server.kill("SIGTERM");
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    server.kill("SIGTERM");
    process.exit(1);
  }
}

setTimeout(runTests, 1000);
