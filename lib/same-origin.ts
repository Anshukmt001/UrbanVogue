export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host");

  if (!origin) {
    return true;
  }

  if (!host) {
    return false;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}