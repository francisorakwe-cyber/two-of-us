import { createFileRoute } from "@tanstack/react-router";
import { EditProfileScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/edit-profile")({ component: EditProfileScreen });
