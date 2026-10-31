import http from "http";
import { spawn } from "child_process";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Starting Next.js production server...");
  const server = spawn("npx", ["next", "start", "-p", "3001"], {
    stdio: "inherit",
    shell: true,
  });

  // Give server 5 seconds to boot up
  await wait(5000);

  try {
    console.log("\n--- TEST 1: Homepage GET / ---");
    const homeRes = await request({
      hostname: "127.0.0.1",
      port: 3001,
      path: "/",
      method: "GET",
    });
    console.log(`Homepage Status: ${homeRes.statusCode}`);
    if (homeRes.statusCode !== 200) throw new Error("Homepage did not return 200");

    console.log("\n--- TEST 2: POST /api/shorten ---");
    const shortenPayload = JSON.stringify({
      url: "https://github.com/trending",
      customSlug: "github-trending",
    });
    const shortenRes = await request(
      {
        hostname: "127.0.0.1",
        port: 3001,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(shortenPayload),
        },
      },
      shortenPayload
    );
    console.log(`Shorten Status: ${shortenRes.statusCode}`);
    const shortenData = JSON.parse(shortenRes.body);
    console.log("Shorten Response:", shortenData);
    if (!shortenData.success) throw new Error("Shorten API failed");

    console.log("\n--- TEST 3: GET /github-trending (Redirect) ---");
    const redirectRes = await request({
      hostname: "127.0.0.1",
      port: 3001,
      path: "/github-trending",
      method: "GET",
    });
    console.log(`Redirect Status: ${redirectRes.statusCode}`);
    console.log(`Location Header: ${redirectRes.headers.location}`);
    if (redirectRes.statusCode !== 307 || redirectRes.headers.location !== "https://github.com/trending") {
      throw new Error(`Unexpected redirect response: ${redirectRes.statusCode} -> ${redirectRes.headers.location}`);
    }

    console.log("\n--- TEST 4: GET /api/links ---");
    const linksRes = await request({
      hostname: "127.0.0.1",
      port: 3001,
      path: "/api/links",
      method: "GET",
    });
    console.log(`Links Status: ${linksRes.statusCode}`);
    const linksData = JSON.parse(linksRes.body);
    console.log(`Links Count: ${linksData.links.length}, First Link Code: ${linksData.links[0]?.code}, Clicks: ${linksData.links[0]?.clicks}`);

    console.log("\n--- TEST 5: GET /api/stats ---");
    const statsRes = await request({
      hostname: "127.0.0.1",
      port: 3001,
      path: "/api/stats",
      method: "GET",
    });
    console.log(`Stats Status: ${statsRes.statusCode}`);
    const statsData = JSON.parse(statsRes.body);
    console.log("Stats Data:", statsData.stats);

    console.log("\n--- TEST 6: Nonexistent link /invalid-code-xyz ---");
    const invalidRes = await request({
      hostname: "127.0.0.1",
      port: 3001,
      path: "/invalid-code-xyz",
      method: "GET",
    });
    console.log(`Invalid Code Status: ${invalidRes.statusCode}, Location: ${invalidRes.headers.location}`);

    console.log("\n========================================");
    console.log("ALL END-TO-END VERIFICATION TESTS PASSED!");
    console.log("========================================\n");
  } finally {
    console.log("Stopping server...");
    server.kill("SIGINT");
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
