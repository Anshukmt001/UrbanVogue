import { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Frontend-only mock mode. Admin routes are browsable without auth.
  // Re-enable guards when the backend is connected.
  void _request;
  return;
}

export const config = {
  matcher: ["/admin/:path*"],
};