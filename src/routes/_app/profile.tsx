import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/profile")({ component: ProfileScreen });
