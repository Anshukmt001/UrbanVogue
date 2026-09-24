import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface AdminSession {
  email: string;
  name: string | null;
  role: string | null;
}

/**
 * Single server-side session check for protected admin APIs.
 * Uses the existing NextAuth (Auth.js) credentials session created by
 * /admin/login — same mechanism the rest of the admin area relies on.
 *
 * Returns the admin session, or null when unauthenticated / not an admin.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return null;

    const user = session.user as
      | { name?: string | null; role?: string | null }
      | undefined;
    const role = user?.role ?? null;
    if (role !== "admin") return null;

    return {
      email,
      name: user?.name ?? null,
      role,
    };
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "UNAUTHORIZED" },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: "FORBIDDEN" },
    { status: 403 }
  );
}
