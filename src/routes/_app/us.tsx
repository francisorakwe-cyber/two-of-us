import { createFileRoute } from "@tanstack/react-router";
import { UsScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/us")({ component: UsScreen });
