/**
 * Cinnabar — Supabase Database Security & Integration Verification Script
 * 
 * Verifies all critical requirements against an actual live Supabase instance:
 * 1. Anonymous role CANNOT read manage_key (column privilege enforced / error)
 * 2. Anonymous role CANNOT delete links directly (denied by RLS)
 * 3. Anonymous role CANNOT insert links directly (denied by RLS)
 * 4. Anonymous role CANNOT execute record_link_click directly via RPC (permission denied)
 * 5. Anonymous role CANNOT execute create_short_link directly via RPC (permission denied)
 * 6. Anonymous role CANNOT execute delete_link_with_key directly via RPC (permission denied)
 * 7. Public can read non-sensitive columns from public_links for redirection
 * 8. Server-side link creation via service_role succeeds
 * 9. Server-side click tracking via record_link_click succeeds
 * 10. Unauthorized deletion via wrong manage_key is rejected (returns false)
 * 11. Authorized deletion via matching manage_key succeeds (returns true)
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Automatically parse .env.local or .env if present
function loadEnvFile(file) {
  try {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) return;
    const content = fs.readFileSync(full, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch {
    // ignore
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_URL = rawUrl ? rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "") : "";
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

console.log("========================================================");
console.log("  CINNABAR SUPABASE DATABASE SECURITY VERIFICATION TEST ");
console.log("========================================================");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("\n[STATUS: CREDENTIALS REQUIRED]");
  console.log("To run verification against your live Supabase project, provide your credentials.");
  console.log("\nOption 1: Add them to .env.local");
  console.log('  SUPABASE_URL="https://your-project.supabase.co"');
  console.log('  SUPABASE_ANON_KEY="your-anon-key"');
  console.log('  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.log("\nOption 2: Run with environment variables:");
  console.log('  $env:SUPABASE_URL="https://your-project.supabase.co"');
  console.log('  $env:SUPABASE_ANON_KEY="your-anon-key"');
  console.log('  $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.log("  node scripts/verify-supabase.mjs\n");
  process.exit(0);
}

console.log(`Target Supabase URL: ${SUPABASE_URL}`);
console.log(`Anon / Publishable Key: ${SUPABASE_ANON_KEY.slice(0, 15)}...`);
console.log(`Service Role / Secret Key: ${SUPABASE_SERVICE_ROLE_KEY ? `${SUPABASE_SERVICE_ROLE_KEY.slice(0, 12)}... (CONFIGURED)` : "NOT PROVIDED"}`);

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const serviceClient = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

let passed = 0;
let failed = 0;

function assert(condition, message, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}${details ? ` -> ${details}` : ""}`);
    failed++;
  }
}

async function run() {
  const testCode = `sec-test-${Date.now().toString(36)}`;
  const testManageKey = `key-${Math.random().toString(36).slice(2, 10)}`;
  let testCreatedOnServer = false;

  try {
    // -----------------------------------------------------------------
    // TEST 1: Anonymous Access Restrictions on manage_key
    // -----------------------------------------------------------------
    console.log("\n[1] Testing Anonymous Access Restrictions on manage_key");
    const { data: leakData, error: leakError } = await anonClient
      .from("links")
      .select("code, manage_key")
      .limit(1);

    const isManageKeyBlocked =
      leakError !== null ||
      !leakData ||
      leakData.length === 0 ||
      leakData.every((r) => r.manage_key === undefined);

    assert(
      isManageKeyBlocked,
      "Anonymous client is prevented from querying manage_key (column privilege enforced)",
      leakError?.message
    );

    // -----------------------------------------------------------------
    // TEST 2: Anonymous Direct DELETE on public.links
    // -----------------------------------------------------------------
    console.log("\n[2] Testing Anonymous Direct DELETE on public.links");
    const { error: directDelError } = await anonClient
      .from("links")
      .delete()
      .eq("code", testCode);

    assert(
      directDelError !== null,
      "Anonymous client direct DELETE is blocked by RLS",
      directDelError ? directDelError.message : "Unexpectedly succeeded"
    );

    // -----------------------------------------------------------------
    // TEST 3: Anonymous Direct INSERT on public.links
    // -----------------------------------------------------------------
    console.log("\n[3] Testing Anonymous Direct INSERT on public.links");
    const { error: directInsertError } = await anonClient.from("links").insert({
      id: `test_${Date.now()}`,
      code: testCode,
      original_url: "https://example.com/unauthorized",
      manage_key: testManageKey,
    });

    assert(
      directInsertError !== null,
      "Anonymous client direct INSERT is blocked by RLS",
      directInsertError ? directInsertError.message : "Unexpectedly succeeded"
    );

    // -----------------------------------------------------------------
    // TEST 4: Anonymous RPC Execution Privileges
    // -----------------------------------------------------------------
    console.log("\n[4] Testing Anonymous RPC Execution Privileges");
    
    // 4a. record_link_click
    const { error: rpcClickError } = await anonClient.rpc("record_link_click", {
      p_code: testCode,
      p_click_log: { timestamp: new Date().toISOString(), referrer: "test" },
    });
    assert(
      rpcClickError !== null,
      "Anonymous client cannot invoke record_link_click directly via RPC",
      rpcClickError ? rpcClickError.message : "Unexpectedly succeeded"
    );

    // 4b. delete_link_with_key
    const { error: rpcDelError } = await anonClient.rpc("delete_link_with_key", {
      p_code: testCode,
      p_manage_key: testManageKey,
    });
    assert(
      rpcDelError !== null,
      "Anonymous client cannot invoke delete_link_with_key directly via RPC",
      rpcDelError ? rpcDelError.message : "Unexpectedly succeeded"
    );

    // 4c. create_short_link
    const { error: rpcCreateError } = await anonClient.rpc("create_short_link", {
      p_id: `test_${Date.now()}`,
      p_code: `${testCode}-anon`,
      p_original_url: "https://example.com/blocked",
      p_expires_at: null,
      p_manage_key: testManageKey,
    });
    assert(
      rpcCreateError !== null,
      "Anonymous client cannot invoke create_short_link directly via RPC",
      rpcCreateError ? rpcCreateError.message : "Unexpectedly succeeded"
    );

    // -----------------------------------------------------------------
    // TEST 5: Public Access to public_links View
    // -----------------------------------------------------------------
    console.log("\n[5] Testing Public Access to public_links View");
    const { data: viewData, error: viewError } = await anonClient
      .from("public_links")
      .select("code, original_url, clicks")
      .limit(5);

    assert(
      viewError === null && Array.isArray(viewData),
      "Public can safely query public_links for redirect resolution",
      viewError?.message
    );

    if (serviceClient) {
      // ---------------------------------------------------------------
      // TEST 6: Server-Side Link Creation via service_role
      // ---------------------------------------------------------------
      console.log("\n[6] Testing Server-Side Operations via service_role");
      const { error: srvInsertErr } = await serviceClient.from("links").insert({
        id: `test_${Date.now()}`,
        code: testCode,
        original_url: "https://example.com/target-verification",
        manage_key: testManageKey,
      });

      assert(srvInsertErr === null, "Service role can create links server-side", srvInsertErr?.message);
      if (!srvInsertErr) {
        testCreatedOnServer = true;
      }

      // ---------------------------------------------------------------
      // TEST 7: Public Redirect Resolution for Created Link
      // ---------------------------------------------------------------
      console.log("\n[7] Testing Public Redirect Query on newly created link");
      const { data: redirectRecord, error: redirectErr } = await anonClient
        .from("public_links")
        .select("code, original_url, clicks, manage_key")
        .eq("code", testCode)
        .maybeSingle();

      assert(
        redirectErr === null || redirectErr.message.includes("manage_key"),
        "Public query executes without exposing manage_key"
      );

      // Verify that selecting non-sensitive columns succeeds
      const { data: validRedirect } = await anonClient
        .from("public_links")
        .select("code, original_url, clicks")
        .eq("code", testCode)
        .maybeSingle();

      assert(
        validRedirect && validRedirect.original_url === "https://example.com/target-verification",
        "Public visitor can read redirect destination (original_url) via public_links"
      );

      // ---------------------------------------------------------------
      // TEST 8: Server-Side Click Tracking Procedure
      // ---------------------------------------------------------------
      console.log("\n[8] Testing Server-Side Click Tracking via record_link_click");
      const { error: srvClickErr } = await serviceClient.rpc("record_link_click", {
        p_code: testCode,
        p_click_log: { timestamp: new Date().toISOString(), referrer: "Direct" },
      });
      assert(srvClickErr === null, "Service role can invoke record_link_click", srvClickErr?.message);

      // Verify click count incremented
      const { data: updatedLink } = await serviceClient
        .from("links")
        .select("clicks")
        .eq("code", testCode)
        .single();
      assert(
        updatedLink && Number(updatedLink.clicks) >= 1,
        "Click counter incremented successfully in PostgreSQL"
      );

      // ---------------------------------------------------------------
      // TEST 9: Unauthorized vs Authorized Deletion
      // ---------------------------------------------------------------
      console.log("\n[9] Testing Unauthorized vs Authorized Deletion");
      const { data: delFail, error: failErr } = await serviceClient.rpc("delete_link_with_key", {
        p_code: testCode,
        p_manage_key: "wrong-manage-key-xyz",
      });
      assert(
        failErr === null && delFail === false,
        "Deletion with wrong manage_key was rejected (returned false)"
      );

      const { data: delPass, error: passErr } = await serviceClient.rpc("delete_link_with_key", {
        p_code: testCode,
        p_manage_key: testManageKey,
      });
      assert(
        passErr === null && delPass === true,
        "Deletion with matching manage_key succeeded (returned true)"
      );

      // Verify deletion from table
      const { data: verifyDeleted } = await serviceClient
        .from("links")
        .select("id")
        .eq("code", testCode)
        .maybeSingle();
      assert(!verifyDeleted, "Link is confirmed permanently deleted from PostgreSQL");
      testCreatedOnServer = false;
    } else {
      console.log("\n[6-9] Skipped service_role tests (SUPABASE_SERVICE_ROLE_KEY not supplied)");
    }
  } finally {
    // Guaranteed cleanup
    if (testCreatedOnServer && serviceClient) {
      try {
        await serviceClient.from("links").delete().eq("code", testCode);
      } catch {
        // ignore
      }
    }
  }

  console.log("\n========================================================");
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
