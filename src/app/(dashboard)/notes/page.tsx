import { createClient } from "@/lib/supabase/server";
import { NotesListClient } from "@/components/notes/notes-list-client";

export default async function NotesPage() {
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("soap_notes")
    .select(
      "*, appointment:appointments(id, starts_at, session_number, client:clients(first_name, last_name), session_type:session_types(name))"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return <NotesListClient notes={notes || []} />;
}
