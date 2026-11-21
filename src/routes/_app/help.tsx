import { createFileRoute } from "@tanstack/react-router";
import { HelpScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/help")({ component: HelpScreen });
