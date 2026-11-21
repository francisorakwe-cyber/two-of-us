import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsScreen });
