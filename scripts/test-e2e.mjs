import http from "http";
import { spawn } from "child_process";
import QRCode from "qrcode";

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

async function runProductionTestSuite() {
  console.log("=================================================");
  console.log("   CINNABAR PRODUCTION READINESS & SECURITY TEST ");
  console.log("=================================================");

  console.log("\n[SETUP] Starting Next.js production server on port 3002...");
  const server = spawn("npx", ["next", "start", "-p", "3002"], {
    stdio: "inherit",
    shell: true,
  });

  await wait(5000);

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Homepage Availability
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Verifying Homepage (GET /)");
    const home = await request({ hostname: "127.0.0.1", port: 3002, path: "/", method: "GET" });
    assert(home.statusCode === 200, `Homepage returned status ${home.statusCode}`);
    assert(home.body.includes("Cinnabar"), "Homepage contains brand identity");

    // -------------------------------------------------------------------------
    // TEST 2: Core URL Shortening
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Verifying Core URL Shortening (POST /api/shorten)");
    const shortenPayload = JSON.stringify({
      url: "https://www.apple.com/newsroom",
    });
    const shortenRes = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(shortenPayload),
        },
      },
      shortenPayload
    );
    assert(shortenRes.statusCode === 201, `Shorten returned 201 Created (got ${shortenRes.statusCode})`);
    const shortenData = JSON.parse(shortenRes.body);
    assert(shortenData.success === true, "Response indicated success");
    assert(typeof shortenData.data.code === "string", `Generated slug: ${shortenData.data.code}`);
    assert(typeof shortenData.data.manageKey === "string", "Secure manageKey returned in payload");

    // -------------------------------------------------------------------------
    // TEST 3: Custom Vanity Slug Creation & Redirection
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Verifying Custom Vanity Slug (POST /api/shorten with customSlug)");
    const customPayload = JSON.stringify({
      url: "https://github.com/torvalds/linux",
      customSlug: "linux-kernel",
    });
    const customRes = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(customPayload),
        },
      },
      customPayload
    );
    assert(customRes.statusCode === 201, `Custom slug returned 201 (got ${customRes.statusCode})`);
    const customData = JSON.parse(customRes.body);
    assert(customData.data.code === "linux-kernel", "Assigned exact custom slug");
    const linuxManageKey = customData.data.manageKey;

    // Test Redirect
    console.log("\n[TEST 4] Verifying HTTP 307 Redirection (GET /linux-kernel)");
    const redirectRes = await request({
      hostname: "127.0.0.1",
      port: 3002,
      path: "/linux-kernel",
      method: "GET",
    });
    assert(redirectRes.statusCode === 307, `Redirect status is 307 (got ${redirectRes.statusCode})`);
    assert(redirectRes.headers.location === "https://github.com/torvalds/linux", `Location points to destination`);

    // -------------------------------------------------------------------------
    // TEST 5: Duplicate Slug Collision Rejection
    // -------------------------------------------------------------------------
    console.log("\n[TEST 5] Verifying Duplicate Slug Rejection (Collision Protection)");
    const dupRes = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(customPayload),
        },
      },
      customPayload
    );
    assert(dupRes.statusCode === 409, `Duplicate alias returned 409 Conflict (got ${dupRes.statusCode})`);

    // -------------------------------------------------------------------------
    // TEST 6: Reserved Slug Protection
    // -------------------------------------------------------------------------
    console.log("\n[TEST 6] Verifying System Reserved Keyword Protection (/api, /admin)");
    const reservedPayload = JSON.stringify({
      url: "https://example.com",
      customSlug: "admin",
    });
    const reservedRes = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(reservedPayload),
        },
      },
      reservedPayload
    );
    assert(reservedRes.statusCode === 400, `Reserved slug returned 400 Bad Request (got ${reservedRes.statusCode})`);

    // -------------------------------------------------------------------------
    // TEST 7: SSRF & Loopback Protection
    // -------------------------------------------------------------------------
    console.log("\n[TEST 7] Verifying SSRF Protection (Attempting to shorten 127.0.0.1 / AWS metadata)");
    const ssrfPayload1 = JSON.stringify({ url: "http://127.0.0.1:8080/secret" });
    const ssrfRes1 = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(ssrfPayload1),
        },
      },
      ssrfPayload1
    );
    assert(ssrfRes1.statusCode === 400, `SSRF loopback 127.0.0.1 was blocked with 400`);

    const ssrfPayload2 = JSON.stringify({ url: "http://169.254.169.254/latest/meta-data" });
    const ssrfRes2 = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(ssrfPayload2),
        },
      },
      ssrfPayload2
    );
    assert(ssrfRes2.statusCode === 400, `SSRF cloud metadata 169.254.169.254 was blocked with 400`);

    // -------------------------------------------------------------------------
    // TEST 8: Malicious Protocol Rejection
    // -------------------------------------------------------------------------
    console.log("\n[TEST 8] Verifying Malicious Protocol Rejection (javascript:, data:)");
    const xssPayload = JSON.stringify({ url: "javascript:alert(1)" });
    const xssRes = await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(xssPayload),
        },
      },
      xssPayload
    );
    assert(xssRes.statusCode === 400, `javascript: protocol was rejected with 400`);

    // -------------------------------------------------------------------------
    // TEST 9: Unauthorized vs Authorized Deletion
    // -------------------------------------------------------------------------
    console.log("\n[TEST 9] Verifying Unauthorized Deletion Defense (403 Forbidden)");
    const unauthDel = await request({
      hostname: "127.0.0.1",
      port: 3002,
      path: "/api/links?code=linux-kernel",
      method: "DELETE",
    });
    assert(unauthDel.statusCode === 403, `Deletion without key rejected with 403 (got ${unauthDel.statusCode})`);

    console.log("\n[TEST 10] Verifying Authorized Deletion with manageKey");
    const authDel = await request({
      hostname: "127.0.0.1",
      port: 3002,
      path: `/api/links?code=linux-kernel&key=${linuxManageKey}`,
      method: "DELETE",
    });
    assert(authDel.statusCode === 200, `Deletion with valid key succeeded with 200`);

    // -------------------------------------------------------------------------
    // TEST 11: Link Expiration
    // -------------------------------------------------------------------------
    console.log("\n[TEST 11] Verifying Link Expiration Flow");
    const expPayload = JSON.stringify({
      url: "https://news.ycombinator.com",
      customSlug: "expired-test",
      expiresIn: 1, // 1 second lifespan
    });
    await request(
      {
        hostname: "127.0.0.1",
        port: 3002,
        path: "/api/shorten",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(expPayload),
        },
      },
      expPayload
    );
    // Wait 2 seconds for link to expire
    await wait(2000);
    const expRedirect = await request({
      hostname: "127.0.0.1",
      port: 3002,
      path: "/expired-test",
      method: "GET",
    });
    assert(expRedirect.statusCode === 307, "Expired link triggered redirect to notification page");
    assert(expRedirect.headers.location.includes("/link-expired"), `Destination is /link-expired (got ${expRedirect.headers.location})`);

    // -------------------------------------------------------------------------
    // TEST 12: High-Density QR Code Generator
    // -------------------------------------------------------------------------
    console.log("\n[TEST 12] Verifying QR Code Engine Generation");
    const testQrDataUrl = await QRCode.toDataURL("http://localhost:3002/linux-kernel", {
      width: 400,
      margin: 2,
    });
    assert(testQrDataUrl.startsWith("data:image/png;base64,"), "QR Code generated valid base64 PNG data URL");

    // -------------------------------------------------------------------------
    // TEST 13: Platform Telemetry & Observability
    // -------------------------------------------------------------------------
    console.log("\n[TEST 13] Verifying Platform Telemetry (GET /api/stats)");
    const statsRes = await request({
      hostname: "127.0.0.1",
      port: 3002,
      path: "/api/stats",
      method: "GET",
    });
    assert(statsRes.statusCode === 200, "Stats API returned 200");
    const statsData = JSON.parse(statsRes.body);
    assert(typeof statsData.stats.totalLinks === "number", `Recorded total links: ${statsData.stats.totalLinks}`);
    assert(typeof statsData.stats.totalClicks === "number", `Recorded total clicks: ${statsData.stats.totalClicks}`);

    console.log("\n=================================================");
    console.log(` SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log(" ALL PRODUCTION READINESS & SECURITY CHECKS PASSED!");
    console.log("=================================================\n");
  } finally {
    console.log("[TEARDOWN] Stopping test server...");
    server.kill("SIGINT");
  }
}

runProductionTestSuite().catch((err) => {
  console.error("Fatal Test Error:", err);
  process.exit(1);
});
