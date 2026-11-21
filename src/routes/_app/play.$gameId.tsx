import { createFileRoute } from "@tanstack/react-router";
import { PlayView } from "@/components/two/play-view";

export const Route = createFileRoute("/_app/play/$gameId")({
  component: function PlayRoute() {
    const { gameId } = Route.useParams();
    return <PlayView gameId={gameId} />;
  },
});
