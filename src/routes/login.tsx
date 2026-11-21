import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/two/auth-views";

export const Route = createFileRoute("/login")({ component: LoginPage });
