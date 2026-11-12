import { randomBytes } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Credentials and browser cookies stay outside the repository. All cleanup is by
// recorded primary key, with a username guard, never a broad name/prefix delete.
nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const mode = process.argv[2] ?? "create";
const sessionPath = process.argv[3] ?? path.join(tmpdir(), "farabak-panel-qa-session.json");
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";

async function save(session) {
  await writeFile(sessionPath, JSON.stringify(session, null, 2), { mode: 0o600 });
}

async function login(session) {
  for (const account of session.accounts) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: account.username, password: account.password }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) throw new Error(`QA ${account.role} login failed: HTTP ${response.status}`);
    const cookies = response.headers.getSetCookie().map((header) => {
      const [pair, ...attributes] = header.split(";");
      const separator = pair.indexOf("=");
      const maxAge = attributes.find((attribute) =>
        attribute.trim().toLowerCase().startsWith("max-age=")
      );
      return {
        name: pair.slice(0, separator),
        value: pair.slice(separator + 1),
        domain: new URL(baseUrl).hostname,
        path: "/",
        httpOnly: true,
        secure: baseUrl.startsWith("https:"),
        sameSite: "Lax",
        expires: Math.floor(Date.now() / 1000) + Number(maxAge?.split("=")[1] ?? 900),
      };
    });
    account.statePath = path.join(
      tmpdir(),
      `farabak-qa-${session.runId}-${account.role.toLowerCase()}.json`
    );
    await writeFile(account.statePath, JSON.stringify({ cookies, origins: [] }), { mode: 0o600 });
    await save(session);
  }
  console.log(
    JSON.stringify({
      sessionPath,
      branchId: session.branchId,
      states: session.accounts.map(({ role, statePath }) => ({ role, statePath })),
    })
  );
}

try {
  if (mode === "cleanup-run") {
    const runId = process.argv[3];
    if (!/^[a-z0-9]+$/.test(runId ?? "")) throw new Error("cleanup-run requires an exact run ID");
    await prisma.$transaction(
      async (tx) => {
        const admin = await tx.client.findUnique({
          where: { Username: `qa_a_${runId}` },
          select: { UserID: true, Role: true },
        });
        const branchUser = await tx.client.findUnique({
          where: { Username: `qa_b_${runId}` },
          select: { UserID: true, Role: true },
        });
        if (admin && admin.Role !== "Admin") throw new Error("Exact QA Admin role guard failed");
        if (branchUser && branchUser.Role !== "Branch") throw new Error("Exact QA Branch role guard failed");
        const branch = await tx.branch.findFirst({
          where: { name: `QA TEMP ${runId}` },
          select: { branchid: true, UserID: true },
        });
        if (branch && (!branchUser || branch.UserID !== branchUser.UserID))
          throw new Error("Exact QA branch owner guard failed");
        if (branch) await tx.branch.delete({ where: { branchid: branch.branchid } });
        for (const user of [admin, branchUser]) {
          if (!user) continue;
          await tx.password.deleteMany({ where: { UserId: user.UserID } });
          await tx.client.delete({ where: { UserID: user.UserID } });
        }
      },
      { timeout: 60000, maxWait: 10000 }
    );
    console.log(JSON.stringify({ cleaned: true, runId }));
  } else if (mode === "create") {
    const previous = await readFile(sessionPath, "utf8")
      .then(JSON.parse)
      .catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
    if (previous?.accounts?.length)
      throw new Error("Clean up the recorded QA session before creating another");
    const runId = Date.now().toString(36);
    const session = { runId, accounts: [], branchId: null, createdAt: new Date().toISOString() };
    await prisma.$transaction(
      async (tx) => {
        for (const [role, suffix] of [
          ["Admin", "a"],
          ["Branch", "b"],
        ]) {
          const username = `qa_${suffix}_${runId}`;
          const password = randomBytes(24).toString("base64url");
          const user = await tx.client.create({
            data: {
              Username: username,
              FirstName: "QA",
              LastName: "Temporary",
              Role: role,
              Password: { create: { Password1: await bcrypt.hash(password, 10), Active: true } },
            },
            select: { UserID: true },
          });
          session.accounts.push({ userId: user.UserID, username, password, role });
          if (role === "Branch") {
            const branch = await tx.branch.create({
              data: { UserID: user.UserID, name: `QA TEMP ${runId}`, location: "QA" },
              select: { branchid: true },
            });
            session.branchId = branch.branchid;
          }
        }
        await save(session);
      },
      { timeout: 60000, maxWait: 10000 }
    );
    console.log(JSON.stringify({ created: true, sessionPath, branchId: session.branchId }));
    await login(session);
  } else {
    const session = JSON.parse(await readFile(sessionPath, "utf8"));
    if (mode === "login") await login(session);
    else if (mode === "cleanup") {
      await prisma.$transaction(
        async (tx) => {
          for (const account of session.accounts) {
            const user = await tx.client.findUnique({
              where: { UserID: account.userId },
              select: { Username: true },
            });
            if (!user) continue;
            if (user.Username !== account.username || !account.username.startsWith("qa_"))
              throw new Error("QA cleanup ownership guard failed");
            if (account.role === "Branch" && session.branchId) {
              const branch = await tx.branch.findUnique({
                where: { branchid: session.branchId },
                select: { UserID: true },
              });
              if (branch && branch.UserID !== account.userId)
                throw new Error("QA branch ownership guard failed");
              await tx.branch.deleteMany({
                where: { branchid: session.branchId, UserID: account.userId },
              });
            }
            await tx.password.deleteMany({ where: { UserId: account.userId } });
            await tx.client.delete({ where: { UserID: account.userId } });
          }
        },
        { timeout: 60000, maxWait: 10000 }
      );
      for (const account of session.accounts) {
        if (account.statePath)
          await unlink(account.statePath).catch((error) => {
            if (error.code !== "ENOENT") throw error;
          });
      }
      await save({
        runId: session.runId,
        accounts: [],
        branchId: null,
        cleanedAt: new Date().toISOString(),
      });
      console.log(JSON.stringify({ cleaned: true, sessionPath }));
    } else throw new Error("Use create, login, cleanup, or cleanup-run <exact-run-id>");
  }
} catch (error) {
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : "QA session failed",
      sessionPath,
    })
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => undefined);
}
