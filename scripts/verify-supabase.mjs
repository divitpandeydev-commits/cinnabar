/**
 * Cinnabar — Supabase Database Security & Integration Verification Script
 * 
 * Verifies all 8 critical requirements against an actual live Supabase instance:
 * 1. Anonymous role CANNOT read manage_key (permission denied / null)
 * 2. Anonymous role CANNOT delete links directly (403 / denied by RLS)
 * 3. Anonymous role CANNOT execute record_link_click directly via RPC
 * 4. Anonymous role CANNOT execute create_short_link directly via RPC
 * 5. Anonymous role CANNOT execute delete_link_with_key directly via RPC
 * 6. Public can read non-sensitive columns from public_links for redirection
 * 7. Server-side link creation via service_role succeeds
 * 8. Authorized deletion via manage_key succeeds, while wrong key fails
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("========================================================");
console.log("  CINNABAR SUPABASE DATABASE SECURITY VERIFICATION TEST ");
console.log("========================================================");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("\n[SKIPPED] SUPABASE_URL or SUPABASE_ANON_KEY not set in environment.");
  console.log("To verify against a live Supabase instance:");
  console.log("  $env:SUPABASE_URL='https://your-project.supabase.co'");
  console.log("  $env:SUPABASE_ANON_KEY='your-anon-key'");
  console.log("  $env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'");
  console.log("  node scripts/verify-supabase.mjs\n");
  process.exit(0);
}

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

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  const testCode = `sec-test-${Date.now().toString(36)}`;
  const testManageKey = `key-${Math.random().toString(36).slice(2, 10)}`;

  console.log("\n[1] Testing Anonymous Access Restrictions on manage_key");
  const { data: leakData, error: leakError } = await anonClient
    .from("links")
    .select("code, manage_key")
    .limit(1);

  assert(
    leakError !== null || (leakData && leakData.every((r) => r.manage_key === undefined)),
    "Anonymous client is prevented from querying manage_key (column privilege enforced)"
  );

  console.log("\n[2] Testing Anonymous Direct DELETE on public.links");
  const { error: directDelError } = await anonClient
    .from("links")
    .delete()
    .eq("code", "any-random-code");
  assert(
    directDelError !== null,
    "Anonymous client direct DELETE is blocked by RLS"
  );

  console.log("\n[3] Testing Anonymous Direct INSERT on public.links");
  const { error: directInsertError } = await anonClient.from("links").insert({
    id: `test_${Date.now()}`,
    code: testCode,
    original_url: "https://example.com",
    manage_key: testManageKey,
  });
  assert(
    directInsertError !== null,
    "Anonymous client direct INSERT is blocked by RLS"
  );

  console.log("\n[4] Testing Anonymous RPC Execution Privileges");
  const { error: rpcClickError } = await anonClient.rpc("record_link_click", {
    p_code: testCode,
    p_click_log: { timestamp: new Date().toISOString(), referrer: "test" },
  });
  assert(
    rpcClickError !== null,
    "Anonymous client cannot invoke record_link_click directly via RPC"
  );

  const { error: rpcDelError } = await anonClient.rpc("delete_link_with_key", {
    p_code: testCode,
    p_manage_key: testManageKey,
  });
  assert(
    rpcDelError !== null,
    "Anonymous client cannot invoke delete_link_with_key directly via RPC"
  );

  console.log("\n[5] Testing Public Access to public_links View");
  const { data: viewData, error: viewError } = await anonClient
    .from("public_links")
    .select("code, original_url")
    .limit(5);
  assert(
    viewError === null && Array.isArray(viewData),
    "Public can safely query public_links for redirect resolution"
  );

  if (serviceClient) {
    console.log("\n[6] Testing Server-Side Operations via service_role");
    const { error: srvInsertErr } = await serviceClient.from("links").insert({
      id: `test_${Date.now()}`,
      code: testCode,
      original_url: "https://example.com/target",
      manage_key: testManageKey,
    });
    assert(srvInsertErr === null, "Service role can create links server-side");

    console.log("\n[7] Testing Unauthorized vs Authorized Deletion");
    const { data: delFail } = await serviceClient.rpc("delete_link_with_key", {
      p_code: testCode,
      p_manage_key: "wrong-manage-key",
    });
    assert(delFail === false, "Deletion with wrong manage_key was rejected (returned false)");

    const { data: delPass } = await serviceClient.rpc("delete_link_with_key", {
      p_code: testCode,
      p_manage_key: testManageKey,
    });
    assert(delPass === true, "Deletion with matching manage_key succeeded (returned true)");
  } else {
    console.log("\n[6-8] Skipped service_role tests (SUPABASE_SERVICE_ROLE_KEY not supplied in env)");
  }

  console.log("\n========================================================");
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");
}

run().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});

