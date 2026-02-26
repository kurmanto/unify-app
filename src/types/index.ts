// ─── Enums ───────────────────────────────────────────────

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "failed";

export type PaymentProcessor = "stripe" | "square";

export type SeriesType = "ten_series" | "custom";

export type SeriesStatus = "active" | "completed" | "paused" | "cancelled";

export type FormType =
  | "intake"
  | "health_history"
  | "consent"
  | "cancellation_policy"
  | "custom";

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "cancelled";

export type DocumentType =
  | "intake_form"
  | "consent_form"
  | "waiver"
  | "receipt"
  | "other";

export type PaymentProcessorStatus =
  | "succeeded"
  | "pending"
  | "failed"
  | "refunded"
  | "cancelled";

// ─── Database Row Types ──────────────────────────────────

export interface Practitioner {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  business_name: string;
  timezone: string;
  schedule_config: ScheduleConfig;
  stripe_customer_id: string | null;
  square_merchant_id: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  practitioner_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  address: Address | null;
  emergency_contact: EmergencyContact | null;
  health_history: HealthHistory | null;
  intake_completed: boolean;
  notes: string | null;
  tags: string[];
  created_at: string;
}

export interface Appointment {
  id: string;
  practitioner_id: string;
  client_id: string;
  session_type_id: string;
  series_id: string | null;
  session_number: number | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_processor: PaymentProcessor | null;
  payment_id: string | null;
  external_calendar_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Series {
  id: string;
  client_id: string;
  practitioner_id: string;
  type: SeriesType;
  total_sessions: number;
  current_session: number;
  status: SeriesStatus;
  package_payment_id: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface SoapNote {
  id: string;
  appointment_id: string;
  practitioner_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  ai_transcript: string | null;
  focus_areas: FocusArea[] | null;
  techniques_used: string[] | null;
  session_goals: string[] | null;
  pre_session_notes: string | null;
  created_at: string;
}

export interface IntakeForm {
  id: string;
  client_id: string;
  practitioner_id: string;
  form_type: FormType;
  form_data: Record<string, unknown>;
  signature_url: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface SessionType {
  id: string;
  practitioner_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  currency: string;
  tax_rate: number;
  description: string | null;
  is_package: boolean;
  package_sessions: number | null;
  package_price_cents: number | null;
}

export interface Campaign {
  id: string;
  practitioner_id: string;
  subject: string;
  body_html: string;
  segment_tags: string[];
  status: CampaignStatus;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface CampaignRecipient {
  campaign_id: string;
  client_id: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
}

export interface Document {
  id: string;
  client_id: string;
  practitioner_id: string;
  type: DocumentType;
  file_url: string;
  name: string;
  signed: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string | null;
  client_id: string;
  practitioner_id: string;
  amount_cents: number;
  currency: string;
  tax_cents: number;
  processor: PaymentProcessor;
  processor_payment_id: string | null;
  status: PaymentProcessorStatus;
  card_last_four: string | null;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  practitioner_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  created_at: string;
}

export interface CalendarSlotClickData {
  date: string;  // "YYYY-MM-DD"
  time: string;  // "HH:mm"
}

// ─── Nested / JSON Types ─────────────────────────────────

export interface Address {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface HealthHistory {
  conditions: string[];
  medications: string[];
  surgeries: string[];
  allergies: string[];
  previous_bodywork: string[];
  current_complaints: string;
  goals: string;
}

export interface FocusArea {
  area: string;
  notes: string;
}

export interface ScheduleConfig {
  days: DaySchedule[];
  buffer_minutes: number;
  booking_window_days: number;
}

export interface DaySchedule {
  day: number; // 0=Sunday, 1=Monday, ...
  enabled: boolean;
  start_time: string; // "09:00"
  end_time: string; // "18:00"
  breaks: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

// ─── UI / Frontend Types ─────────────────────────────────

export interface AppointmentWithRelations extends Appointment {
  client: Client;
  session_type: SessionType;
  series?: Series;
  soap_note?: SoapNote;
}

export interface ClientWithRelations extends Client {
  appointments: Appointment[];
  series: Series[];
  intake_forms: IntakeForm[];
  documents: Document[];
  payments: Payment[];
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

// ─── Schedule Types ─────────────────────────────────────

export type ScheduleView = "day" | "week" | "month" | "list";

export interface DragSelectData {
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}

export interface AppointmentDropData {
  appointmentId: string;
  newStartsAt: string;
  newEndsAt: string;
}

export interface AppointmentDragGhost {
  appointment: CalendarAppointment;
  startMinutes: number;
  endMinutes: number;
}

// ─── Client List & Detail Types ─────────────────────────

export interface ClientListItem extends Client {
  active_series: Series | null;
  last_visit: string | null;
  next_appointment: string | null;
  total_completed_sessions: number;
}

export type BodyRegion =
  | "head"
  | "jaw"
  | "neck"
  | "shoulders"
  | "chest"
  | "upper_back"
  | "mid_back"
  | "lower_back"
  | "arms"
  | "forearms"
  | "hands"
  | "abdomen"
  | "pelvis"
  | "hips"
  | "sacrum"
  | "glutes"
  | "upper_legs"
  | "knees"
  | "lower_legs"
  | "ankles"
  | "feet"
  | "it_band"
  | "inner_legs"
  | "side_body";

export interface ClientInsights {
  next_session_recommendations: string[];
  treatment_patterns: string[];
  progress_summary: string;
  areas_of_concern: string[];
  body_area_frequency: Record<string, number>;
  pre_session_briefing: string;
}

export interface ClientCommunication {
  id: string;
  client_id: string;
  practitioner_id: string;
  type: "email" | "reminder" | "intake_request" | "follow_up";
  subject: string;
  body_html: string;
  sent_at: string;
  status: "sent" | "delivered" | "failed" | "opened";
  resend_message_id: string | null;
}

export interface AiInsightCache {
  id: string;
  client_id: string;
  practitioner_id: string;
  insights: ClientInsights;
  generated_at: string;
  soap_note_count: number;
}

export interface CalendarAppointment {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  session_number: number | null;
  series_id: string | null;
  client_id: string | null;
  client: { first_name: string; last_name: string; email: string | null; phone: string | null } | null;
  session_type: { name: string; duration_minutes: number } | null;
  series: { total_sessions: number; current_session: number } | null;
}
