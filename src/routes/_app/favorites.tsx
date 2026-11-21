import { createFileRoute } from "@tanstack/react-router";
import { FavoritesScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/favorites")({ component: FavoritesScreen });
