import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/components/two/auth-views";

export const Route = createFileRoute("/welcome")({ component: WelcomePage });
