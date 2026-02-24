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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, User, FileText, Mic } from "lucide-react";
import { getSessionGuide } from "@/lib/rolfing/ten-series";
import { AppointmentActions } from "@/components/appointments/appointment-actions";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(
      "*, client:clients(*), session_type:session_types(*), series:series(*), soap_note:soap_notes(*)"
    )
    .eq("id", id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  const client = appointment.client as Record<string, string>;
  const sessionType = appointment.session_type as Record<string, unknown>;
  const series = appointment.series as Record<string, unknown> | null;
  const soapNote = appointment.soap_note as Record<string, string | null> | null;
  const sessionGuide = appointment.session_number
    ? getSessionGuide(appointment.session_number)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/appointments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {sessionType?.name as string}
            {appointment.session_number &&
              ` — Session ${appointment.session_number}`}
          </h1>
          <p className="text-muted-foreground">
            {new Date(appointment.starts_at).toLocaleDateString("en-CA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(appointment.starts_at).toLocaleTimeString("en-CA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{appointment.status}</Badge>
          <Badge
            variant={
              appointment.payment_status === "paid" ? "default" : "secondary"
            }
          >
            {appointment.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/clients/${appointment.client_id}`}
              className="font-medium hover:underline"
            >
              {client.first_name} {client.last_name}
            </Link>
            <p className="text-sm text-muted-foreground">{client.email}</p>
            {client.phone && (
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{sessionType?.name as string}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span>{sessionType?.duration_minutes as number} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>
                ${((sessionType?.price_cents as number) / 100).toFixed(2)} +
                HST
              </span>
            </div>
            {series && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Series Progress</span>
                <span>
                  {series.current_session as number} /{" "}
                  {series.total_sessions as number}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Guide (if part of Ten Series) */}
        {sessionGuide && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                Session {sessionGuide.session}: {sessionGuide.name}
              </CardTitle>
              <CardDescription>{sessionGuide.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Goals</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {sessionGuide.goals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {sessionGuide.focus_areas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Philosophy</h4>
                <p className="text-sm text-muted-foreground">
                  {sessionGuide.philosophy}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SOAP Note */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                SOAP Note
              </CardTitle>
              {!soapNote && appointment.status === "completed" && (
                <Button size="sm" asChild>
                  <Link href={`/notes/${appointment.id}`}>
                    <Mic className="mr-2 h-4 w-4" />
                    Create Note
                  </Link>
                </Button>
              )}
              {soapNote && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/notes/${appointment.id}`}>Edit Note</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!soapNote ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No SOAP note recorded for this session.
              </p>
            ) : (
              <div className="space-y-4">
                {soapNote.subjective && (
                  <div>
                    <h4 className="text-sm font-medium">Subjective</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {soapNote.subjective}
                    </p>
                  </div>
                )}
                {soapNote.objective && (
                  <div>
                    <h4 className="text-sm font-medium">Objective</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {soapNote.objective}
                    </p>
                  </div>
                )}
                {soapNote.assessment && (
                  <div>
                    <h4 className="text-sm font-medium">Assessment</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {soapNote.assessment}
                    </p>
                  </div>
                )}
                {soapNote.plan && (
                  <div>
                    <h4 className="text-sm font-medium">Plan</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {soapNote.plan}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentActions
              appointmentId={appointment.id}
              currentStatus={appointment.status}
              seriesId={appointment.series_id}
              sessionNumber={appointment.session_number}
            />
          </CardContent>
        </Card>
      </div>

      {appointment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Appointment Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
