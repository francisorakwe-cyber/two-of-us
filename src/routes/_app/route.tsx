import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/two/shell";

export const Route = createFileRoute("/_app")({
  component: function AppLayout() {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  },
});
