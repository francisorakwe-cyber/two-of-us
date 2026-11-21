import { createFileRoute } from "@tanstack/react-router";
import { ProgressScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/progress")({ component: ProgressScreen });
