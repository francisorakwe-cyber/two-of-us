import { createFileRoute } from "@tanstack/react-router";
import { GamesScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/games/")({ component: GamesScreen });
