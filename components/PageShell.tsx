/**
 * Shared shell for the redesigned routes: the skip-link target and main
 * landmark. The global chrome around it (skip link, logomark/menu
 * navigation, footer) is rendered by app/layout.tsx.
 */
export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main id="main">{children}</main>;
}
