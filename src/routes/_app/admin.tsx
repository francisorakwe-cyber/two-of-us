import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/admin")({ component: AdminScreen });
