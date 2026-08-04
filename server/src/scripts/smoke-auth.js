import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { signAccessToken } from "../auth/tokens.js";
import { closePool } from "../db.js";
import { DEMO_PASSWORD } from "../constants/index.js";

// Fixed fixtures seeded by `npm run seed` (server/src/scripts/seed.js).
// This script does not seed the DB itself — see the precondition check below.
const SEED = {
  alice: { id: "11111111-1111-1111-1111-111111111111", email: "alice@example.com" },
  bob: { id: "22222222-2222-2222-2222-222222222222", email: "bob@example.com" },
  carol: { id: "33333333-3333-3333-3333-333333333333", email: "carol@example.com" },
  dev: { id: "99999999-9999-9999-9999-999999999999", email: "dev@supportdesk.local" },
  ticketAlice: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", subject: "Cannot log in to my account" },
  ticketBob: { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", subject: "Billing charge looks incorrect" },
  ticketCarol: { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", subject: "How do I export my data?" },
};

const results = [];

function check(stage, name, passed, detail) {
  const status = passed ? "pass" : "fail";
  results.push({ stage, name, status, detail });
  const label = passed ? "[PASS]" : "[FAIL]";
  console.log(`${label} ${stage} :: ${name}${passed ? "" : ` -- ${detail}`}`);
}

function skip(stage, name, reason) {
  results.push({ stage, name, status: "invalid", detail: reason });
  console.log(`[SKIP] ${stage} :: ${name} -- ${reason}`);
}

function tokenFor(seedUser) {
  return signAccessToken({ id: seedUser.id });
}

async function main() {
  const app = buildApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function api(method, path, { token, body } = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  }

  try {
    // ---- Stage 1: public probes ----
    {
      const stage = "1 Public probes";
      const health = await api("GET", "/api/health");
      check(stage, "GET /api/health -> 200 status ok", health.status === 200 && health.json?.status === "ok", JSON.stringify(health));

      const ready = await api("GET", "/api/ready");
      check(stage, "GET /api/ready -> 200 status ready", ready.status === 200 && ready.json?.status === "ready", JSON.stringify(ready));
    }

    // ---- Stage 2: register ----
    const stage2 = "2 Register";
    const freshEmail = `smoke-${randomUUID()}@example.com`;
    const registered = await api("POST", "/api/auth/register", {
      body: { email: freshEmail, name: "Smoke Test User", password: "correct-horse-battery" },
    });
    check(
      stage2,
      "new email -> 201, has token, no password_hash, last_login_at null",
      registered.status === 201 &&
        typeof registered.json?.token === "string" &&
        registered.json?.user &&
        !("password_hash" in registered.json.user) &&
        registered.json.user.last_login_at === null,
      JSON.stringify(registered)
    );
    const freshUserToken = registered.json?.token;
    const freshUser = registered.json?.user;

    const weakPassword = await api("POST", "/api/auth/register", {
      body: { email: `smoke-weak-${randomUUID()}@example.com`, name: "Weak Pw", password: "short1" },
    });
    check(
      stage2,
      "short password -> 400 VALIDATION_ERROR (not 500)",
      weakPassword.status === 400 && weakPassword.json?.error?.code === "VALIDATION_ERROR",
      JSON.stringify(weakPassword)
    );

    const dupeEmail = await api("POST", "/api/auth/register", {
      body: { email: SEED.alice.email, name: "Impostor", password: "correct-horse-battery" },
    });
    check(
      stage2,
      "duplicate (seeded) email -> 409 CONFLICT",
      dupeEmail.status === 409 && dupeEmail.json?.error?.code === "CONFLICT",
      JSON.stringify(dupeEmail)
    );

    // ---- Stage 3: login ----
    const stage3 = "3 Login";
    const goodLogin = await api("POST", "/api/auth/login", {
      body: { email: SEED.alice.email, password: DEMO_PASSWORD },
    });
    check(
      stage3,
      "correct credentials -> 200, has token",
      goodLogin.status === 200 && typeof goodLogin.json?.token === "string",
      `${JSON.stringify(goodLogin)} (expected to fail until POST /api/auth/login is wired to authService.login())`
    );

    const wrongPassword = await api("POST", "/api/auth/login", {
      body: { email: SEED.alice.email, password: "definitely-wrong" },
    });
    const unknownEmail = await api("POST", "/api/auth/login", {
      body: { email: `nobody-${randomUUID()}@example.com`, password: "whatever123" },
    });
    check(
      stage3,
      "wrong password and unknown email -> byte-identical status/code/message",
      wrongPassword.status === unknownEmail.status &&
        wrongPassword.json?.error?.code === unknownEmail.json?.error?.code &&
        wrongPassword.json?.error?.message === unknownEmail.json?.error?.message,
      `wrongPassword=${JSON.stringify(wrongPassword)} unknownEmail=${JSON.stringify(unknownEmail)}`
    );

    // ---- Stage 4: authentication middleware ----
    const stage4 = "4 Authentication";
    const noToken = await api("GET", "/api/tickets");
    check(stage4, "no token -> 401", noToken.status === 401, JSON.stringify(noToken));

    const garbageToken = await api("GET", "/api/tickets", { token: "not.a.valid.jwt" });
    check(stage4, "garbage token -> 401", garbageToken.status === 401, JSON.stringify(garbageToken));

    if (freshUserToken) {
      const me = await api("GET", "/api/auth/me", { token: freshUserToken });
      check(
        stage4,
        "valid token -> GET /api/auth/me returns the right user",
        me.status === 200 && me.json?.user?.id === freshUser?.id && me.json?.user?.email === freshUser?.email,
        JSON.stringify(me)
      );
    } else {
      skip(stage4, "valid token -> GET /api/auth/me returns the right user", "stage 2 register did not yield a token");
    }

    // ---- Precondition check for stages 5-8: seeded fixtures present? ----
    const aliceToken = tokenFor(SEED.alice);
    const bobToken = tokenFor(SEED.bob);
    const devToken = tokenFor(SEED.dev);

    const aliceMe = await api("GET", "/api/auth/me", { token: aliceToken });
    const seedPresent = aliceMe.status === 200;

    if (!seedPresent) {
      console.log(
        "Seed data not found -- run `npm run migrate:up` and `npm run seed` first, then re-run `npm run smoke:auth`."
      );
      for (const [stage, names] of [
        ["5 Authorization", ["own tickets list is scoped to exactly the seeded ticket", "open-ticket count matches the scoped list"]],
        ["6 Core IDOR check", ["other user's ticket by id -> 404", "404 shape matches a genuinely nonexistent id"]],
        ["7 Assignee visibility", ["assignee (not requester) can read the ticket", "unrelated ticket -> 404"]],
        ["8 Spoofing", ["?userId= query param does not change ticket scoping"]],
      ]) {
        for (const name of names) skip(stage, name, "seed data not present in the database");
      }
    } else {
      // ---- Stage 5: authorization / scoping ----
      const stage5 = "5 Authorization";
      const aliceTickets = await api("GET", "/api/tickets", { token: aliceToken });
      check(
        stage5,
        "own tickets list is scoped to exactly the seeded ticket",
        Array.isArray(aliceTickets.json) &&
          aliceTickets.json.length === 1 &&
          aliceTickets.json[0]?.subject === SEED.ticketAlice.subject,
        JSON.stringify(aliceTickets)
      );

      const aliceCount = await api("GET", "/api/tickets/count", { token: aliceToken });
      check(
        stage5,
        "open-ticket count matches the scoped list",
        aliceCount.status === 200 && aliceCount.json?.count === 1,
        JSON.stringify(aliceCount)
      );

      // ---- Stage 6: core IDOR check ----
      const stage6 = "6 Core IDOR check";
      const bobReadsAlice = await api("GET", `/api/tickets/${SEED.ticketAlice.id}`, { token: bobToken });
      const nonexistentId = randomUUID();
      const bobReadsNonexistent = await api("GET", `/api/tickets/${nonexistentId}`, { token: bobToken });

      check(
        stage6,
        "other user's ticket by id -> 404 NOT_FOUND",
        bobReadsAlice.status === 404 && bobReadsAlice.json?.error?.code === "NOT_FOUND",
        JSON.stringify(bobReadsAlice)
      );
      check(
        stage6,
        "404 shape matches a genuinely nonexistent id (same status/code, same message template)",
        bobReadsAlice.status === bobReadsNonexistent.status &&
          bobReadsAlice.json?.error?.code === bobReadsNonexistent.json?.error?.code &&
          bobReadsAlice.json?.error?.message === `Ticket ${SEED.ticketAlice.id} not found` &&
          bobReadsNonexistent.json?.error?.message === `Ticket ${nonexistentId} not found`,
        `otherUsers=${JSON.stringify(bobReadsAlice)} nonexistent=${JSON.stringify(bobReadsNonexistent)}`
      );

      // ---- Stage 7: assignee visibility ----
      const stage7 = "7 Assignee visibility";
      const devReadsAssigned = await api("GET", `/api/tickets/${SEED.ticketAlice.id}`, { token: devToken });
      check(
        stage7,
        "assignee (not requester) can read the ticket",
        devReadsAssigned.status === 200,
        JSON.stringify(devReadsAssigned)
      );

      const devReadsUnrelated = await api("GET", `/api/tickets/${SEED.ticketCarol.id}`, { token: devToken });
      check(
        stage7,
        "unrelated ticket (neither requester nor assignee) -> 404",
        devReadsUnrelated.status === 404,
        JSON.stringify(devReadsUnrelated)
      );

      // ---- Stage 8: spoofing ----
      const stage8 = "8 Spoofing";
      const spoofed = await api("GET", `/api/tickets?userId=${SEED.bob.id}`, { token: aliceToken });
      check(
        stage8,
        "?userId= query param does not change ticket scoping",
        Array.isArray(spoofed.json) &&
          spoofed.json.length === 1 &&
          spoofed.json[0]?.subject === SEED.ticketAlice.subject,
        JSON.stringify(spoofed)
      );
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await closePool();
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const invalid = results.filter((r) => r.status === "invalid").length;

  console.log("");
  for (const r of results) {
    console.log(`${r.stage} :: ${r.name} -> ${r.status.toUpperCase()}`);
  }
  console.log("");
  console.log(
    `Smoke result: ${passed} passed, ${failed} failed.` + (invalid ? ` (${invalid} skipped)` : "")
  );

  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error("Smoke suite crashed:", err);
  process.exitCode = 1;
});
