import { createFileRoute } from "@tanstack/react-router";
import { PartnerScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/partner")({ component: PartnerScreen });
