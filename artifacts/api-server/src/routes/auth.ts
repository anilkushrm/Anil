import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, invitationsTable, membershipsTable, usersTable, workspacesTable } from "@workspace/db";
import {
  AcceptInvitationBody,
  AcceptInvitationParams,
  AcceptInvitationResponse,
  GetInvitationParams,
  GetInvitationResponse,
  GetSessionResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";
import { clearSession, createSession, getAuthContext, type AuthContext } from "../lib/auth";
import { seedWorkspace } from "../lib/seed";
import { hashPassword, hashSessionToken, verifyPassword } from "../lib/security";

const router: IRouter = Router();

function sessionPayload(auth: AuthContext | null) {
  if (!auth) return { authenticated: false, user: null, workspace: null };
  return {
    authenticated: true,
    user: auth.user,
    workspace: auth.workspace,
  };
}

function createWorkspaceSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42) || "workspace";
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.get("/auth/session", async (req: Request, res: Response): Promise<void> => {
  const auth = await getAuthContext(req);
  res.json(GetSessionResponse.parse(sessionPayload(auth)));
});

router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success || !validEmail(parsed.data?.email ?? "")) {
    req.log.warn("Rejected invalid registration");
    res.status(400).json({ error: "Enter a valid name, email, password, and workspace name." });
    return;
  }

  const email = parsed.data.email.toLowerCase().trim();
  const [existingUser] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingUser) {
    res.status(409).json({ error: "An account already exists for this email." });
    return;
  }

  const [workspace] = await db
    .insert(workspacesTable)
    .values({
      name: parsed.data.workspaceName.trim(),
      slug: createWorkspaceSlug(parsed.data.workspaceName),
      plan: "starter",
      walletBalance: 0,
    })
    .returning();

  const [user] = await db
    .insert(usersTable)
    .values({
      name: parsed.data.name.trim(),
      email,
      passwordHash: hashPassword(parsed.data.password),
    })
    .returning();

  if (!workspace || !user) {
    res.status(400).json({ error: "We could not create your workspace." });
    return;
  }

  await db.insert(membershipsTable).values({ workspaceId: workspace.id, userId: user.id, role: "owner", status: "active" });
  await seedWorkspace(workspace.id, user.name);
  await createSession(res, user.id, workspace.id);

  res.status(201).json(RegisterResponse.parse(sessionPayload({
    user: { id: user.id, name: user.name, email: user.email, role: "owner" },
    workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, plan: workspace.plan, walletBalance: workspace.walletBalance },
  })));
});

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const email = parsed.data.email.toLowerCase().trim();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    req.log.warn({ email }, "Rejected sign-in");
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const memberships = await db
    .select({ membership: membershipsTable, workspace: workspacesTable })
    .from(membershipsTable)
    .innerJoin(workspacesTable, eq(workspacesTable.id, membershipsTable.workspaceId))
    .where(and(eq(membershipsTable.userId, user.id), eq(membershipsTable.status, "active")));
  const activeMemberships = memberships;
  if (activeMemberships.length === 0) {
    res.status(401).json({ error: "No workspace is available for this account." });
    return;
  }
  const requestedSlug = parsed.data.workspaceSlug?.trim().toLowerCase();
  const matchingMemberships = requestedSlug
    ? activeMemberships.filter(({ workspace }) => workspace.slug === requestedSlug)
    : activeMemberships;
  if (matchingMemberships.length === 0) {
    res.status(401).json({ error: "That workspace could not be found for this account." });
    return;
  }
  if (matchingMemberships.length > 1) {
    res.status(409).json({ error: "Multiple workspaces found. Enter the workspace slug to continue." });
    return;
  }
  const membership = matchingMemberships[0];

  await createSession(res, user.id, membership.workspace.id);
  res.json(LoginResponse.parse(sessionPayload({
    user: { id: user.id, name: user.name, email: user.email, role: membership.membership.role },
    workspace: {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      plan: membership.workspace.plan,
      walletBalance: membership.workspace.walletBalance,
    },
  })));
});

router.post("/auth/logout", async (req: Request, res: Response): Promise<void> => {
  await clearSession(req, res);
  res.status(204).send();
});

router.get("/auth/invitations/:token", async (req: Request, res: Response): Promise<void> => {
  const params = GetInvitationParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Invitation not found." });
    return;
  }
  const [invitation] = await db
    .select({
      invitation: invitationsTable,
      user: usersTable,
      membership: membershipsTable,
      workspace: workspacesTable,
    })
    .from(invitationsTable)
    .innerJoin(usersTable, eq(usersTable.id, invitationsTable.userId))
    .innerJoin(membershipsTable, and(
      eq(membershipsTable.userId, invitationsTable.userId),
      eq(membershipsTable.workspaceId, invitationsTable.workspaceId),
      eq(membershipsTable.status, "invited"),
    ))
    .innerJoin(workspacesTable, eq(workspacesTable.id, invitationsTable.workspaceId))
    .where(and(
      eq(invitationsTable.tokenHash, hashSessionToken(params.data.token)),
      isNull(invitationsTable.acceptedAt),
      gt(invitationsTable.expiresAt, new Date()),
    ))
    .limit(1);

  if (!invitation) {
    res.status(404).json({ error: "This invitation is invalid, expired, or already accepted." });
    return;
  }

  res.json(GetInvitationResponse.parse({
    workspaceName: invitation.workspace.name,
    email: invitation.user.email,
    role: invitation.membership.role,
    expiresAt: invitation.invitation.expiresAt.toISOString(),
    needsPasswordSetup: invitation.user.passwordSetupRequired,
  }));
});

router.post("/auth/invitations/:token/accept", async (req: Request, res: Response): Promise<void> => {
  const params = AcceptInvitationParams.safeParse(req.params);
  const body = AcceptInvitationBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Enter the required invitation details." });
    return;
  }

  const [invitation] = await db
    .select({
      invitation: invitationsTable,
      user: usersTable,
      membership: membershipsTable,
      workspace: workspacesTable,
    })
    .from(invitationsTable)
    .innerJoin(usersTable, eq(usersTable.id, invitationsTable.userId))
    .innerJoin(membershipsTable, and(
      eq(membershipsTable.userId, invitationsTable.userId),
      eq(membershipsTable.workspaceId, invitationsTable.workspaceId),
      eq(membershipsTable.status, "invited"),
    ))
    .innerJoin(workspacesTable, eq(workspacesTable.id, invitationsTable.workspaceId))
    .where(and(
      eq(invitationsTable.tokenHash, hashSessionToken(params.data.token)),
      isNull(invitationsTable.acceptedAt),
      gt(invitationsTable.expiresAt, new Date()),
    ))
    .limit(1);

  if (!invitation) {
    res.status(404).json({ error: "This invitation is invalid, expired, or already accepted." });
    return;
  }
  if (invitation.user.passwordSetupRequired && (!body.data.name || !body.data.password)) {
    res.status(400).json({ error: "Name and a password of at least 8 characters are required." });
    return;
  }

  if (invitation.user.passwordSetupRequired) {
    await db.update(usersTable).set({
      name: body.data.name!.trim(),
      passwordHash: hashPassword(body.data.password!),
      passwordSetupRequired: false,
    }).where(eq(usersTable.id, invitation.user.id));
  }
  await db.update(membershipsTable).set({ status: "active" }).where(eq(membershipsTable.id, invitation.membership.id));
  await db.update(invitationsTable).set({ acceptedAt: new Date() }).where(eq(invitationsTable.id, invitation.invitation.id));
  await createSession(res, invitation.user.id, invitation.workspace.id);

  res.json(AcceptInvitationResponse.parse(sessionPayload({
    user: {
      id: invitation.user.id,
      name: body.data.name?.trim() || invitation.user.name,
      email: invitation.user.email,
      role: invitation.membership.role,
    },
    workspace: {
      id: invitation.workspace.id,
      name: invitation.workspace.name,
      slug: invitation.workspace.slug,
      plan: invitation.workspace.plan,
      walletBalance: invitation.workspace.walletBalance,
    },
  })));
});

export default router;