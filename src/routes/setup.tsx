import { createFileRoute } from "@tanstack/react-router";
import { SetupPage } from "@/components/two/auth-views";

export const Route = createFileRoute("/setup")({ component: SetupPage });
