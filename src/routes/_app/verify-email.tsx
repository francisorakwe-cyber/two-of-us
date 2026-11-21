import { createFileRoute } from "@tanstack/react-router";
import { VerifyScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/verify-email")({ component: VerifyScreen });
