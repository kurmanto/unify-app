"use client";

import { useState } from "react";
import { ClientHeroHeader } from "./client-hero-header";
import { ClientStatsRow } from "./client-stats-row";
import { TenSeriesProgress } from "./ten-series-progress";
import { SessionTimeline } from "./session-timeline";
import { BodyMap } from "./body-map";
import { HealthSection } from "./health-section";
import { FormsSection } from "./forms-section";
import { PaymentHistory } from "./payment-history";
import { SoapNoteSheet } from "./soap-note-sheet";
import { QuickBookDialog } from "./quick-book-dialog";
import { CommunicationHub } from "./communication-hub";
import { AiInsightsPanel } from "./ai-insights-panel";
import type {
  Client,
  Appointment,
  Series,
  SoapNote,
  IntakeForm,
  Payment,
  SessionType,
} from "@/types";

interface ClientDetailPageClientProps {
  client: Client;
  appointments: (Appointment & { session_type?: SessionType | null })[];
  series: Series[];
  soapNotes: SoapNote[];
  intakeForms: IntakeForm[];
  payments: Payment[];
}

export function ClientDetailPageClient({
  client: initialClient,
  appointments,
  series,
  soapNotes: initialSoapNotes,
  intakeForms,
  payments,
}: ClientDetailPageClientProps) {
  const [client, setClient] = useState(initialClient);
  const [soapNotes, setSoapNotes] = useState(initialSoapNotes);
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [selectedSoapAppointmentId, setSelectedSoapAppointmentId] = useState<
    string | null
  >(null);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);

  const activeSeries = series.find((s) => s.status === "active") || null;

  const selectedAppointment = selectedSoapAppointmentId
    ? appointments.find((a) => a.id === selectedSoapAppointmentId) || null
    : null;

  const selectedSoapNote = selectedSoapAppointmentId
    ? soapNotes.find((n) => n.appointment_id === selectedSoapAppointmentId) ||
      null
    : null;

  function handleSoapNoteUpdate(updated: SoapNote) {
    setSoapNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  }

  return (
    <div className="space-y-6 animate-page-in">
      {/* Hero header */}
      <ClientHeroHeader
        client={client}
        onSchedule={() => setShowQuickBook(true)}
        onEdit={() => {
          // Scroll to health section for inline editing
          document.getElementById("health-section")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Stats row */}
      <ClientStatsRow
        appointments={appointments}
        activeSeries={activeSeries}
        payments={payments}
      />

      {/* Ten Series Progress (only if there's an active series) */}
      {activeSeries && activeSeries.type === "ten_series" && (
        <TenSeriesProgress
          series={activeSeries}
          soapNotes={soapNotes}
          onSessionClick={(sessionNumber) => {
            const apt = appointments.find(
              (a) =>
                a.series_id === activeSeries.id &&
                a.session_number === sessionNumber
            );
            if (apt) {
              setSelectedSoapAppointmentId(apt.id);
            }
          }}
        />
      )}

      {/* Body Map + Session Timeline side by side */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <BodyMap
          soapNotes={soapNotes}
          selectedRegion={filterRegion}
          onRegionSelect={setFilterRegion}
        />
        <SessionTimeline
          clientId={client.id}
          appointments={appointments}
          soapNotes={soapNotes}
          filterRegion={filterRegion}
          onSessionClick={(appointmentId) =>
            setSelectedSoapAppointmentId(appointmentId)
          }
        />
      </div>

      {/* AI Insights */}
      <AiInsightsPanel
        clientId={client.id}
        hasSoapNotes={soapNotes.length > 0}
      />

      {/* Health Information */}
      <div id="health-section">
        <HealthSection
          client={client}
          onClientUpdate={(updated) => setClient(updated)}
        />
      </div>

      {/* Communication Hub */}
      <CommunicationHub
        clientId={client.id}
        clientEmail={client.email}
        intakeCompleted={client.intake_completed}
      />

      {/* Forms */}
      <FormsSection forms={intakeForms} />

      {/* Payments */}
      <PaymentHistory payments={payments} activeSeries={activeSeries} />

      {/* SOAP Note Sheet */}
      <SoapNoteSheet
        open={!!selectedSoapAppointmentId}
        onOpenChange={(open) => {
          if (!open) setSelectedSoapAppointmentId(null);
        }}
        soapNote={selectedSoapNote}
        appointment={selectedAppointment}
        onSoapNoteUpdate={handleSoapNoteUpdate}
      />

      {/* Quick Book Dialog */}
      <QuickBookDialog
        open={showQuickBook}
        onOpenChange={setShowQuickBook}
        client={client}
        activeSeries={activeSeries}
      />
    </div>
  );
}
