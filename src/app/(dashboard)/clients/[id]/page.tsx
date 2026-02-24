import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  Activity,
} from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    notFound();
  }

  // Fetch related data
  const [
    { data: appointments },
    { data: series },
    { data: intakeForms },
    { data: soapNotes },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, session_type:session_types(*)")
      .eq("client_id", id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("series")
      .select("*")
      .eq("client_id", id)
      .order("started_at", { ascending: false }),
    supabase
      .from("intake_forms")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("soap_notes")
      .select("*, appointment:appointments(starts_at)")
      .eq(
        "appointment_id",
        supabase
          .from("appointments")
          .select("id")
          .eq("client_id", id) as unknown as string
      ),
  ]);

  const healthHistory = client.health_history as {
    conditions?: string[];
    medications?: string[];
    surgeries?: string[];
    allergies?: string[];
    previous_bodywork?: string[];
    current_complaints?: string;
    goals?: string;
  } | null;
  const emergencyContact = client.emergency_contact as Record<string, string> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {client.first_name} {client.last_name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {client.phone}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {client.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <Badge variant={client.intake_completed ? "default" : "outline"}>
            {client.intake_completed ? "Intake Complete" : "Intake Pending"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">
            Appointments ({appointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="series">
            Series ({series?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="health">Health History</TabsTrigger>
          <TabsTrigger value="forms">
            Forms ({intakeForms?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {appointments?.filter((a) => a.status === "completed").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Series
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {series?.filter((s) => s.status === "active").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Forms
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {intakeForms?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{emergencyContact.name}</p>
                <p className="text-muted-foreground">
                  {emergencyContact.relationship} — {emergencyContact.phone}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>
                All sessions with {client.first_name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!appointments || appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No appointments yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const sessionType = apt.session_type as Record<string, unknown> | null;
                    return (
                      <Link
                        key={apt.id}
                        href={`/appointments/${apt.id}`}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {sessionType?.name as string}
                            {apt.session_number && ` — Session ${apt.session_number}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.starts_at).toLocaleDateString("en-CA", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(apt.starts_at).toLocaleTimeString("en-CA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{apt.status}</Badge>
                          <Badge
                            variant={
                              apt.payment_status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {apt.payment_status}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="series" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Series Progress</CardTitle>
              <CardDescription>
                Track {client.first_name}&apos;s series progression.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!series || series.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active series.
                </p>
              ) : (
                <div className="space-y-6">
                  {series.map((s) => (
                    <div key={s.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {s.type === "ten_series"
                              ? "Ten Series"
                              : "Custom Series"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started{" "}
                            {new Date(s.started_at).toLocaleDateString("en-CA")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            s.status === "active" ? "default" : "secondary"
                          }
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Session {s.current_session} of {s.total_sessions}
                          </span>
                          <span>
                            {Math.round(
                              (s.current_session / s.total_sessions) * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${(s.current_session / s.total_sessions) * 100}%`,
                            }}
                          />
                        </div>
                        {/* Session indicators */}
                        <div className="flex gap-1">
                          {Array.from({ length: s.total_sessions }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-6 flex-1 rounded text-center text-xs leading-6",
                                i < s.current_session
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Health History</CardTitle>
              <CardDescription>
                Medical and health information for {client.first_name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!healthHistory ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No health history recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {healthHistory.conditions &&
                    healthHistory.conditions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Conditions</h4>
                        <div className="flex flex-wrap gap-2">
                          {healthHistory.conditions.map((c) => (
                            <Badge key={c} variant="outline">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {healthHistory.medications &&
                    healthHistory.medications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Medications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {healthHistory.medications.map((m) => (
                            <Badge key={m} variant="outline">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {healthHistory.allergies &&
                    healthHistory.allergies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Allergies</h4>
                        <div className="flex flex-wrap gap-2">
                          {healthHistory.allergies.map((a) => (
                            <Badge key={a} variant="destructive">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {healthHistory.current_complaints && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Current Complaints
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {healthHistory.current_complaints}
                      </p>
                    </div>
                  )}
                  {healthHistory.goals && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Goals</h4>
                      <p className="text-sm text-muted-foreground">
                        {healthHistory.goals}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Forms & Documents</CardTitle>
              <CardDescription>
                Intake forms and signed documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!intakeForms || intakeForms.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No forms submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {intakeForms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {form.form_type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(form.created_at).toLocaleDateString("en-CA")}
                        </p>
                      </div>
                      <Badge
                        variant={form.signed_at ? "default" : "outline"}
                      >
                        {form.signed_at ? "Signed" : "Unsigned"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
