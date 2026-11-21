import { createFileRoute } from "@tanstack/react-router";
import { CategoryScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/games/$category")({
  component: function CategoryRoute() {
    const { category } = Route.useParams();
    return <CategoryScreen category={category} />;
  },
});
