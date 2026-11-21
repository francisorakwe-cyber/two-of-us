import { createFileRoute } from "@tanstack/react-router";
import { RecoverPage } from "@/components/two/auth-views";

export const Route = createFileRoute("/recover")({ component: RecoverPage });
