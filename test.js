const http = require("http");
const { spawn } = require("child_process");

const server = spawn("node", ["server.js"], {
  env: {
    ...process.env,
    PORT: "3001",
  },
});

setTimeout(() => {
  http.get("http://localhost:3001/health", (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      if (res.statusCode === 200 && data === '{"status":"ok"}') {
        console.log("Health check test passed.");
        server.kill("SIGTERM");
        process.exit(0);
      }

      console.error("Health check test failed.");
      server.kill("SIGTERM");
      process.exit(1);
    });
  }).on("error", (error) => {
    console.error("Health check test failed:", error.message);
    server.kill("SIGTERM");
    process.exit(1);
  });
}, 1000);
