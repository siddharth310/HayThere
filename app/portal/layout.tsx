import { HayThereAppShell } from "@/components/haythere-app-shell";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HayThereAppShell>{children}</HayThereAppShell>;
}
