import { createFileRoute } from "@tanstack/react-router";
import { PrivacyScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/privacy")({ component: PrivacyScreen });
