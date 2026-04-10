const COOKIE = "ff_portal_auth";

function sign(secret: string): string {
  return Buffer.from(secret).toString("base64url");
}

export function portalCookieValue(password: string): string {
  return sign(password);
}

export function isPortalCookieValid(cookie: string | undefined): boolean {
  const pwd = process.env.PORTAL_PASSWORD;
  if (!pwd) return true;
  return cookie === sign(pwd);
}

export const PORTAL_COOKIE_NAME = COOKIE;
