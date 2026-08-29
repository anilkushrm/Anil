import type { NextFunction, Request, Response } from "express";
import { and, eq, gt } from "drizzle-orm";
import { apiKeysTable, db, membershipsTable, sessionsTable, usersTable, workspacesTable } from "@workspace/db";
import { createSessionToken, hashSessionToken } from "./security";

const SESSION_COOKIE = "abcrm_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export type AuthContext = {
  user: { id: string; name: string; email: string; role: string };
  workspace: { id: string; name: string; slug: string; plan: string; walletBalance: number };
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_DURATION_MS,
    path: "/",
  };
}

export async function getAuthContext(req: Request): Promise<AuthContext | null> {
  const authorization = req.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (bearerToken.startsWith("abf_")) {
    const [record] = await db
      .select({
        apiKey: apiKeysTable,
        user: usersTable,
        membership: membershipsTable,
        workspace: workspacesTable,
      })
      .from(apiKeysTable)
      .innerJoin(usersTable, eq(usersTable.id, apiKeysTable.createdByUserId))
      .innerJoin(membershipsTable, and(
        eq(membershipsTable.userId, usersTable.id),
        eq(membershipsTable.workspaceId, apiKeysTable.workspaceId),
        eq(membershipsTable.status, "active"),
      ))
      .innerJoin(workspacesTable, eq(workspacesTable.id, apiKeysTable.workspaceId))
      .where(eq(apiKeysTable.keyHash, hashSessionToken(bearerToken)))
      .limit(1);
    if (!record) return null;
    await db.update(apiKeysTable).set({ lastUsedAt: new Date() }).where(eq(apiKeysTable.id, record.apiKey.id));
    return {
      user: {
        id: record.user.id,
        name: record.user.name,
        email: record.user.email,
        role: record.membership.role,
      },
      workspace: {
        id: record.workspace.id,
        name: record.workspace.name,
        slug: record.workspace.slug,
        plan: record.workspace.plan,
        walletBalance: record.workspace.walletBalance,
      },
    };
  }

  const rawToken = req.cookies?.[SESSION_COOKIE];
  if (typeof rawToken !== "string" || !rawToken) return null;

  const [record] = await db
    .select({
      user: usersTable,
      membership: membershipsTable,
      workspace: workspacesTable,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .innerJoin(membershipsTable, and(
      eq(membershipsTable.userId, usersTable.id),
      eq(membershipsTable.workspaceId, sessionsTable.workspaceId),
      eq(membershipsTable.status, "active"),
    ))
    .innerJoin(workspacesTable, eq(workspacesTable.id, sessionsTable.workspaceId))
    .where(and(eq(sessionsTable.tokenHash, hashSessionToken(rawToken)), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);

  if (!record) return null;
  return {
    user: {
      id: record.user.id,
      name: record.user.name,
      email: record.user.email,
      role: record.membership.role,
    },
    workspace: {
      id: record.workspace.id,
      name: record.workspace.name,
      slug: record.workspace.slug,
      plan: record.workspace.plan,
      walletBalance: record.workspace.walletBalance,
    },
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    res.locals.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuth(res: Response): AuthContext {
  return res.locals.auth as AuthContext;
}

export function canManageTeam(auth: AuthContext): boolean {
  return auth.user.role === "owner" || auth.user.role === "admin";
}

export async function createSession(res: Response, userId: string, workspaceId: string): Promise<void> {
  const token = createSessionToken();
  await db.insert(sessionsTable).values({
    tokenHash: hashSessionToken(token),
    userId,
    workspaceId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

export async function clearSession(req: Request, res: Response): Promise<void> {
  const rawToken = req.cookies?.[SESSION_COOKIE];
  if (typeof rawToken === "string" && rawToken) {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, hashSessionToken(rawToken)));
  }
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: undefined });
}