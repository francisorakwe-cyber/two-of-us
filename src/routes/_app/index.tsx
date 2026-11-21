import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/")({ component: HomeScreen });
