import { cookies } from "next/headers";
import { isPortalCookieValid } from "@/lib/portal-cookie";

export { portalCookieValue, PORTAL_COOKIE_NAME } from "@/lib/portal-cookie";

export async function isPortalAuthenticated(): Promise<boolean> {
  if (!process.env.PORTAL_PASSWORD) return true;
  const jar = await cookies();
  return isPortalCookieValid(jar.get("ff_portal_auth")?.value);
}
