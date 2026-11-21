import { createFileRoute } from "@tanstack/react-router";
import { NotesScreen } from "@/components/two/screens";

export const Route = createFileRoute("/_app/notes")({ component: NotesScreen });
