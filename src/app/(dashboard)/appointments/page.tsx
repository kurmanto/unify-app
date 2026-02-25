import { redirect } from "next/navigation";

export default function AppointmentsPage() {
  redirect("/schedule?view=list");
}
