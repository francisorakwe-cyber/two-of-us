import { createFileRoute } from "@tanstack/react-router";
import { InvitesScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/invites")({ component: InvitesScreen });
