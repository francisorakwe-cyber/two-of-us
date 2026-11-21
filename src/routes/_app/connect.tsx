import { createFileRoute } from "@tanstack/react-router";
import { ConnectScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/connect")({ component: ConnectScreen });
