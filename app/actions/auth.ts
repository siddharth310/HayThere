"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PORTAL_COOKIE_NAME,
  portalCookieValue,
} from "@/lib/portal-cookie";

export async function portalLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.PORTAL_PASSWORD;
  if (!expected) {
    redirect("/portal");
  }
  if (password !== expected) {
    throw new Error("Invalid password");
  }

  const jar = await cookies();
  jar.set(PORTAL_COOKIE_NAME, portalCookieValue(expected), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/portal");
}

export async function portalLogout() {
  const jar = await cookies();
  jar.delete(PORTAL_COOKIE_NAME);
  redirect("/portal/login");
}
