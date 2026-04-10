import { HayThereAppShell } from "@/components/haythere-app-shell";

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HayThereAppShell>{children}</HayThereAppShell>;
}
