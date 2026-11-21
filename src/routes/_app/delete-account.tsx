import { createFileRoute } from "@tanstack/react-router";
import { DeleteScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/delete-account")({ component: DeleteScreen });
