import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  // Get practitioner ID from auth.users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError || !users?.users?.length) {
    console.error("No users found:", usersError?.message);
    process.exit(1);
  }

  const pid = users.users[0].id;
  console.log(`Seeding data for practitioner: ${pid}`);

  // Check if data already exists
  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("practitioner_id", pid);
  if (count && count > 0) {
    console.log(`Data already exists (${count} clients). Delete first with: npx tsx scripts/seed.ts --delete`);
    process.exit(0);
  }

  // Fetch session types
  const { data: sessionTypes } = await supabase
    .from("session_types")
    .select("id, name")
    .eq("practitioner_id", pid);

  if (!sessionTypes || sessionTypes.length === 0) {
    console.error("No session types found — complete onboarding first");
    process.exit(1);
  }

  console.log(`Found ${sessionTypes.length} session types`);

  const tenSeriesType = sessionTypes.find((t) =>
    t.name.toLowerCase().includes("ten series session")
  );
  const singleType = sessionTypes.find((t) =>
    t.name.toLowerCase().includes("single rolfing")
  );
  const tuneUpType = sessionTypes.find((t) =>
    t.name.toLowerCase().includes("tune-up")
  );
  const consultType = sessionTypes.find((t) =>
    t.name.toLowerCase().includes("consultation")
  );
  const cranioType = sessionTypes.find((t) =>
    t.name.toLowerCase().includes("craniosacral")
  );

  const defaultType = tenSeriesType || sessionTypes[0];

  // ─── Clients ─────────────────────────────────────────────
  const clientsData = [
    {
      practitioner_id: pid,
      first_name: "Sarah",
      last_name: "Chen",
      email: "sarah.chen@example.com",
      phone: "+1 416-555-0101",
      date_of_birth: "1988-03-15",
      intake_completed: true,
      tags: ["ten series", "athlete"],
      notes: "Marathon runner. Referred by Dr. Patel.",
      health_history: {
        conditions: ["IT band syndrome", "Plantar fasciitis"],
        medications: [],
        surgeries: ["ACL reconstruction (2019, left knee)"],
        allergies: [],
        previous_bodywork: ["Deep tissue massage", "Physiotherapy"],
        current_complaints:
          "Chronic tightness in right hip and IT band. Left knee occasionally locks during long runs.",
        goals:
          "Complete the Ten Series to improve running form. Reduce hip pain and improve overall alignment.",
      },
      emergency_contact: {
        name: "David Chen",
        phone: "+1 416-555-0102",
        relationship: "Spouse",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Marcus",
      last_name: "Williams",
      email: "marcus.w@example.com",
      phone: "+1 416-555-0201",
      date_of_birth: "1975-08-22",
      intake_completed: true,
      tags: ["ten series", "chronic pain"],
      notes: "Desk worker with chronic back pain for 10+ years.",
      health_history: {
        conditions: ["Chronic lower back pain", "Mild scoliosis"],
        medications: ["Ibuprofen (as needed)"],
        surgeries: [],
        allergies: ["Latex"],
        previous_bodywork: ["Chiropractic (3 years)", "Massage therapy"],
        current_complaints:
          "Lower back pain radiating to left glute. Headaches 2-3x/week. Neck stiffness.",
        goals:
          "Pain-free sitting at desk. Better posture. Reduce headache frequency.",
      },
      emergency_contact: {
        name: "Linda Williams",
        phone: "+1 416-555-0202",
        relationship: "Wife",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Aisha",
      last_name: "Patel",
      email: "aisha.p@example.com",
      phone: "+1 416-555-0301",
      date_of_birth: "1992-11-08",
      intake_completed: true,
      tags: ["ten series", "yoga"],
      notes: "Yoga instructor. Wants to deepen body awareness.",
      health_history: {
        conditions: [],
        medications: [],
        surgeries: [],
        allergies: [],
        previous_bodywork: ["Thai massage", "Myofascial release"],
        current_complaints:
          "Left shoulder sits higher than right. Tightness in thoracic spine. Wanting more freedom in backbends.",
        goals:
          "Structural balance for yoga practice. Even shoulders. Greater spinal mobility.",
      },
      emergency_contact: {
        name: "Raj Patel",
        phone: "+1 416-555-0302",
        relationship: "Brother",
      },
    },
    {
      practitioner_id: pid,
      first_name: "James",
      last_name: "O'Brien",
      email: "james.ob@example.com",
      phone: "+1 416-555-0401",
      date_of_birth: "1965-04-30",
      intake_completed: true,
      tags: ["post-series", "maintenance"],
      notes: "Completed Ten Series in 2025. Returns for monthly tune-ups.",
      health_history: {
        conditions: ["Mild arthritis (hands)", "Previous frozen shoulder (resolved)"],
        medications: ["Glucosamine"],
        surgeries: ["Rotator cuff repair (2020, right)"],
        allergies: [],
        previous_bodywork: ["Rolfing (full Ten Series)", "Osteopathy"],
        current_complaints:
          "Occasional right shoulder stiffness. Hands get stiff in cold weather.",
        goals: "Maintain alignment gains from Ten Series. Manage shoulder mobility.",
      },
      emergency_contact: {
        name: "Margaret O'Brien",
        phone: "+1 416-555-0402",
        relationship: "Wife",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Elena",
      last_name: "Vasquez",
      email: "elena.v@example.com",
      phone: "+1 416-555-0501",
      date_of_birth: "1999-07-14",
      intake_completed: false,
      tags: ["new"],
      notes: "Inquired through website. First appointment scheduled.",
      health_history: null,
      emergency_contact: null,
    },
    {
      practitioner_id: pid,
      first_name: "Robert",
      last_name: "Kim",
      email: "robert.kim@example.com",
      phone: "+1 416-555-0601",
      date_of_birth: "1982-12-03",
      intake_completed: true,
      tags: ["ten series", "musician"],
      notes: "Professional cellist. Repetitive strain in arms and shoulders.",
      health_history: {
        conditions: ["Repetitive strain injury", "TMJ dysfunction"],
        medications: [],
        surgeries: [],
        allergies: ["Penicillin"],
        previous_bodywork: ["Alexander Technique", "Feldenkrais"],
        current_complaints:
          "Right forearm tension from playing. Jaw clenching. Rounded upper back.",
        goals:
          "Better upper body posture for playing. Less forearm pain. Jaw tension relief.",
      },
      emergency_contact: {
        name: "Susan Kim",
        phone: "+1 416-555-0602",
        relationship: "Mother",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Priya",
      last_name: "Sharma",
      email: "priya.s@example.com",
      phone: "+1 416-555-0701",
      date_of_birth: "1995-02-28",
      intake_completed: true,
      tags: ["ten series"],
      notes: "Referred by Aisha Patel.",
      health_history: {
        conditions: ["Mild anxiety"],
        medications: [],
        surgeries: ["Appendectomy (2015)"],
        allergies: [],
        previous_bodywork: ["Massage"],
        current_complaints:
          "Tension in neck and shoulders. Difficulty taking deep breaths. Holds stress in upper body.",
        goals: "Better breathing. Stress reduction. More body awareness.",
      },
      emergency_contact: {
        name: "Vikram Sharma",
        phone: "+1 416-555-0702",
        relationship: "Father",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Daniel",
      last_name: "Nguyen",
      email: "daniel.nguyen@example.com",
      phone: "+1 416-555-0801",
      date_of_birth: "1990-06-12",
      intake_completed: true,
      tags: ["ten series", "tech worker"],
      notes: "Software developer. Forward head posture from years at computer.",
      health_history: {
        conditions: ["Thoracic outlet syndrome (mild)", "Carpal tunnel (right)"],
        medications: [],
        surgeries: [],
        allergies: [],
        previous_bodywork: ["Registered massage therapy"],
        current_complaints:
          "Numbness in right hand during typing. Forward head posture. Mid-back pain between shoulder blades.",
        goals:
          "Reduce hand numbness. Fix posture for long work hours. Less mid-back tension.",
      },
      emergency_contact: {
        name: "Lily Nguyen",
        phone: "+1 416-555-0802",
        relationship: "Sister",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Catherine",
      last_name: "Stewart",
      email: "cstewart@example.com",
      phone: "+1 416-555-0901",
      date_of_birth: "1958-01-19",
      intake_completed: true,
      tags: ["post-series", "senior"],
      notes: "Retired teacher. Completed Ten Series last year. Quarterly check-ins.",
      health_history: {
        conditions: ["Osteoporosis (mild)", "Hip replacement (left, 2023)"],
        medications: ["Calcium supplement", "Vitamin D"],
        surgeries: ["Left hip replacement (2023)", "Cataract surgery (2024)"],
        allergies: [],
        previous_bodywork: ["Rolfing (full Ten Series)", "Tai Chi"],
        current_complaints:
          "Stiffness in mornings. Left hip still adjusting post-replacement. Wants to stay active.",
        goals: "Maintain mobility. Support hip integration. Prevent falls.",
      },
      emergency_contact: {
        name: "Brian Stewart",
        phone: "+1 416-555-0902",
        relationship: "Son",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Ahmed",
      last_name: "Hassan",
      email: "ahmed.h@example.com",
      phone: "+1 416-555-1001",
      date_of_birth: "1987-09-03",
      intake_completed: true,
      tags: ["ten series", "construction"],
      notes: "Construction foreman. Heavy lifting daily. Referred by James O'Brien.",
      health_history: {
        conditions: ["L4-L5 disc bulge (2022)", "Chronic shoulder impingement (right)"],
        medications: ["Naproxen (as needed)"],
        surgeries: [],
        allergies: [],
        previous_bodywork: ["Physiotherapy", "Acupuncture"],
        current_complaints:
          "Lower back locks up after heavy lifting. Right shoulder catches overhead. Hamstrings constantly tight.",
        goals:
          "Stay working without surgery. Reduce back episodes. Better shoulder range of motion.",
      },
      emergency_contact: {
        name: "Fatima Hassan",
        phone: "+1 416-555-1002",
        relationship: "Wife",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Olivia",
      last_name: "Moreau",
      email: "olivia.moreau@example.com",
      phone: "+1 416-555-1101",
      date_of_birth: "1993-04-25",
      intake_completed: true,
      tags: ["ten series", "dancer"],
      notes: "Contemporary dancer with National Ballet. Hyper-mobile.",
      health_history: {
        conditions: ["Generalized hypermobility", "Recurring left ankle sprains"],
        medications: [],
        surgeries: ["Ankle reconstruction (left, 2021)"],
        allergies: [],
        previous_bodywork: ["Pilates", "Sports physiotherapy", "Osteopathy"],
        current_complaints:
          "Left ankle instability post-surgery. Difficulty finding center — feels like body compensates around the ankle. Wants more control in hypermobile range.",
        goals:
          "Ankle stability for dance. Better proprioception. Find structural support within hypermobility.",
      },
      emergency_contact: {
        name: "Claire Moreau",
        phone: "+1 416-555-1102",
        relationship: "Mother",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Tomas",
      last_name: "Kowalski",
      email: "tomas.k@example.com",
      phone: "+1 416-555-1201",
      date_of_birth: "1970-11-30",
      intake_completed: true,
      tags: ["ten series", "post-surgical"],
      notes: "Post-spinal fusion (L5-S1). Surgeon approved for bodywork.",
      health_history: {
        conditions: ["L5-S1 spinal fusion (2024)", "Type 2 diabetes (managed)"],
        medications: ["Metformin", "Gabapentin (tapering)"],
        surgeries: ["L5-S1 spinal fusion (2024)", "Hernia repair (2018)"],
        allergies: ["Sulfa drugs"],
        previous_bodywork: ["Post-surgical physiotherapy"],
        current_complaints:
          "Stiffness above fusion site. Compensating with thoracolumbar junction. Walking feels asymmetric since surgery.",
        goals:
          "Restore mobility above and below fusion. Even gait pattern. Reduce compensatory pain.",
      },
      emergency_contact: {
        name: "Anna Kowalski",
        phone: "+1 416-555-1202",
        relationship: "Wife",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Maya",
      last_name: "Thompson",
      email: "maya.t@example.com",
      phone: "+1 416-555-1301",
      date_of_birth: "2001-08-17",
      intake_completed: false,
      tags: ["new", "student"],
      notes: "University student. Interested in Rolfing for anxiety and tension. Booked consultation.",
      health_history: null,
      emergency_contact: null,
    },
    {
      practitioner_id: pid,
      first_name: "Gregory",
      last_name: "Fontaine",
      email: "greg.fontaine@example.com",
      phone: "+1 416-555-1401",
      date_of_birth: "1980-03-08",
      intake_completed: true,
      tags: ["ten series", "triathlete"],
      notes: "Competitive triathlete. Training for Ironman 2026.",
      health_history: {
        conditions: ["Achilles tendinopathy (right)", "Swimmer's shoulder (bilateral)"],
        medications: [],
        surgeries: ["Meniscus repair (right knee, 2019)"],
        allergies: [],
        previous_bodywork: ["Sports massage", "ART (Active Release)", "Dry needling"],
        current_complaints:
          "Right Achilles flares during run training. Both shoulders fatigue in swim sets. Right knee tracks laterally.",
        goals:
          "Race-ready body for Ironman. Achilles management. Shoulder endurance for open water.",
      },
      emergency_contact: {
        name: "Sophie Fontaine",
        phone: "+1 416-555-1402",
        relationship: "Wife",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Ingrid",
      last_name: "Bergström",
      email: "ingrid.b@example.com",
      phone: "+1 416-555-1501",
      date_of_birth: "1985-12-02",
      intake_completed: true,
      tags: ["single session", "prenatal"],
      notes: "32 weeks pregnant. OB cleared for bodywork. Wants relief sessions, not a series.",
      health_history: {
        conditions: ["Pregnancy (32 weeks)", "Gestational pelvic girdle pain"],
        medications: ["Prenatal vitamins"],
        surgeries: [],
        allergies: [],
        previous_bodywork: ["Prenatal massage"],
        current_complaints:
          "Sacroiliac joint pain, worse on left. Rib flare making breathing difficult. Low back ache by end of day.",
        goals:
          "Pain relief for remaining weeks of pregnancy. Better breathing. Prepare body for delivery.",
      },
      emergency_contact: {
        name: "Erik Bergström",
        phone: "+1 416-555-1502",
        relationship: "Husband",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Kwame",
      last_name: "Asante",
      email: "kwame.a@example.com",
      phone: "+1 416-555-1601",
      date_of_birth: "1978-05-21",
      intake_completed: true,
      tags: ["ten series", "executive"],
      notes: "CFO at mid-size firm. High stress. Wants holistic approach to tension patterns.",
      health_history: {
        conditions: ["Hypertension (managed)", "Bruxism"],
        medications: ["Lisinopril"],
        surgeries: [],
        allergies: [],
        previous_bodywork: ["Spa massage (occasional)"],
        current_complaints:
          "Jaw clenching at night, wears guard. Tension headaches. Upper traps feel like rocks. Sleep quality poor.",
        goals:
          "Stress embodiment awareness. Jaw tension resolution. Better sleep through less physical tension.",
      },
      emergency_contact: {
        name: "Grace Asante",
        phone: "+1 416-555-1602",
        relationship: "Wife",
      },
    },
    {
      practitioner_id: pid,
      first_name: "Sophia",
      last_name: "Romano",
      email: "sophia.r@example.com",
      phone: "+1 416-555-1701",
      date_of_birth: "1996-10-09",
      intake_completed: true,
      tags: ["ten series", "postpartum"],
      notes: "6 months postpartum. Diastasis recti. Wants to rebuild core and alignment.",
      health_history: {
        conditions: ["Diastasis recti (2-finger separation)", "Mild pelvic floor weakness"],
        medications: [],
        surgeries: ["C-section (2025)"],
        allergies: [],
        previous_bodywork: ["Pelvic floor physiotherapy"],
        current_complaints:
          "Abdominal separation not closing with physio alone. Low back pain when carrying baby. Feels disconnected from core.",
        goals:
          "Close diastasis. Rebuild functional core. Reduce back pain from baby carrying.",
      },
      emergency_contact: {
        name: "Marco Romano",
        phone: "+1 416-555-1702",
        relationship: "Husband",
      },
    },
  ];

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .insert(clientsData)
    .select("id, first_name, last_name");

  if (clientsError || !clients) {
    console.error("Failed to create clients:", clientsError?.message);
    process.exit(1);
  }

  console.log(`Created ${clients.length} clients`);

  const clientMap: Record<string, string> = {};
  clients.forEach((c) => {
    clientMap[`${c.first_name} ${c.last_name}`] = c.id;
  });

  // ─── Series ──────────────────────────────────────────────
  const seriesData = [
    {
      client_id: clientMap["Sarah Chen"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 5,
      status: "active" as const,
      started_at: "2026-01-08T10:00:00-05:00",
    },
    {
      client_id: clientMap["Marcus Williams"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 3,
      status: "active" as const,
      started_at: "2026-01-20T14:00:00-05:00",
    },
    {
      client_id: clientMap["Aisha Patel"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 7,
      status: "active" as const,
      started_at: "2025-11-15T09:00:00-05:00",
    },
    {
      client_id: clientMap["James O'Brien"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 10,
      status: "completed" as const,
      started_at: "2025-06-01T10:00:00-04:00",
      completed_at: "2025-10-15T10:00:00-04:00",
    },
    {
      client_id: clientMap["Robert Kim"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 1,
      status: "active" as const,
      started_at: "2026-02-18T11:00:00-05:00",
    },
    {
      client_id: clientMap["Priya Sharma"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 2,
      status: "active" as const,
      started_at: "2026-02-05T15:00:00-05:00",
    },
    // New clients series
    {
      client_id: clientMap["Daniel Nguyen"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 4,
      status: "active" as const,
      started_at: "2025-12-10T13:00:00-05:00",
    },
    {
      client_id: clientMap["Catherine Stewart"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 10,
      status: "completed" as const,
      started_at: "2025-04-01T11:00:00-04:00",
      completed_at: "2025-08-20T11:00:00-04:00",
    },
    {
      client_id: clientMap["Ahmed Hassan"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 6,
      status: "active" as const,
      started_at: "2025-11-01T16:00:00-05:00",
    },
    {
      client_id: clientMap["Olivia Moreau"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 3,
      status: "active" as const,
      started_at: "2026-01-15T17:00:00-05:00",
    },
    {
      client_id: clientMap["Tomas Kowalski"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 5,
      status: "active" as const,
      started_at: "2025-12-01T10:00:00-05:00",
    },
    {
      client_id: clientMap["Gregory Fontaine"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 2,
      status: "active" as const,
      started_at: "2026-02-01T07:00:00-05:00",
    },
    {
      client_id: clientMap["Kwame Asante"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 1,
      status: "active" as const,
      started_at: "2026-02-20T18:00:00-05:00",
    },
    {
      client_id: clientMap["Sophia Romano"],
      practitioner_id: pid,
      type: "ten_series" as const,
      total_sessions: 10,
      current_session: 3,
      status: "active" as const,
      started_at: "2026-01-10T10:00:00-05:00",
    },
  ];

  const { data: seriesResult, error: seriesError } = await supabase
    .from("series")
    .insert(seriesData)
    .select("id, client_id");

  if (seriesError) {
    console.error("Failed to create series:", seriesError.message);
    process.exit(1);
  }

  console.log(`Created ${seriesResult?.length || 0} series`);

  const seriesMap: Record<string, string> = {};
  seriesResult?.forEach((s) => {
    seriesMap[s.client_id] = s.id;
  });

  // ─── Appointments ────────────────────────────────────────
  const ts = tenSeriesType?.id || defaultType.id;
  const tu = tuneUpType?.id || defaultType.id;
  const co = consultType?.id || defaultType.id;

  const appointmentsData = [
    // Sarah Chen — sessions 1-5 completed, session 6 upcoming
    ...[1, 2, 3, 4, 5].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Sarah Chen"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Sarah Chen"]],
      session_number: n,
      starts_at: new Date(2026, 0, 8 + (n - 1) * 7, 10, 0).toISOString(),
      ends_at: new Date(2026, 0, 8 + (n - 1) * 7, 11, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Sarah Chen"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Sarah Chen"]],
      session_number: 6,
      starts_at: "2026-02-26T10:00:00-05:00",
      ends_at: "2026-02-26T11:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Marcus Williams — sessions 1-3 completed, session 4 upcoming
    ...[1, 2, 3].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Marcus Williams"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Marcus Williams"]],
      session_number: n,
      starts_at: new Date(2026, 0, 20 + (n - 1) * 10, 14, 0).toISOString(),
      ends_at: new Date(2026, 0, 20 + (n - 1) * 10, 15, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Marcus Williams"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Marcus Williams"]],
      session_number: 4,
      starts_at: "2026-02-28T14:00:00-05:00",
      ends_at: "2026-02-28T15:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Aisha Patel — sessions 1-7 completed, session 8 upcoming
    ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Aisha Patel"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Aisha Patel"]],
      session_number: n,
      starts_at: new Date(2025, 10, 15 + (n - 1) * 14, 9, 0).toISOString(),
      ends_at: new Date(2025, 10, 15 + (n - 1) * 14, 10, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Aisha Patel"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Aisha Patel"]],
      session_number: 8,
      starts_at: "2026-03-01T09:00:00-05:00",
      ends_at: "2026-03-01T10:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // James O'Brien — completed series + monthly tune-ups
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["James O'Brien"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["James O'Brien"]],
      session_number: n,
      starts_at: new Date(2025, 5, 1 + (n - 1) * 14, 10, 0).toISOString(),
      ends_at: new Date(2025, 5, 1 + (n - 1) * 14, 11, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["James O'Brien"],
      session_type_id: tu,
      starts_at: "2025-11-15T10:00:00-05:00",
      ends_at: "2025-11-15T11:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["James O'Brien"],
      session_type_id: tu,
      starts_at: "2025-12-20T10:00:00-05:00",
      ends_at: "2025-12-20T11:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["James O'Brien"],
      session_type_id: tu,
      starts_at: "2026-01-24T10:00:00-05:00",
      ends_at: "2026-01-24T11:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["James O'Brien"],
      session_type_id: tu,
      starts_at: "2026-03-05T10:00:00-05:00",
      ends_at: "2026-03-05T11:00:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Elena Vasquez — initial consultation upcoming
    {
      practitioner_id: pid,
      client_id: clientMap["Elena Vasquez"],
      session_type_id: co,
      starts_at: "2026-02-27T16:00:00-05:00",
      ends_at: "2026-02-27T16:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Robert Kim — session 1 completed
    {
      practitioner_id: pid,
      client_id: clientMap["Robert Kim"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Robert Kim"]],
      session_number: 1,
      starts_at: "2026-02-18T11:00:00-05:00",
      ends_at: "2026-02-18T12:30:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Robert Kim"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Robert Kim"]],
      session_number: 2,
      starts_at: "2026-03-04T11:00:00-05:00",
      ends_at: "2026-03-04T12:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Priya Sharma — sessions 1-2 completed
    {
      practitioner_id: pid,
      client_id: clientMap["Priya Sharma"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Priya Sharma"]],
      session_number: 1,
      starts_at: "2026-02-05T15:00:00-05:00",
      ends_at: "2026-02-05T16:30:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Priya Sharma"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Priya Sharma"]],
      session_number: 2,
      starts_at: "2026-02-19T15:00:00-05:00",
      ends_at: "2026-02-19T16:30:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Priya Sharma"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Priya Sharma"]],
      session_number: 3,
      starts_at: "2026-03-05T15:00:00-05:00",
      ends_at: "2026-03-05T16:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Daniel Nguyen — sessions 1-4 completed, session 5 upcoming
    ...[1, 2, 3, 4].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Daniel Nguyen"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Daniel Nguyen"]],
      session_number: n,
      starts_at: new Date(2025, 11, 10 + (n - 1) * 14, 13, 0).toISOString(),
      ends_at: new Date(2025, 11, 10 + (n - 1) * 14, 14, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Daniel Nguyen"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Daniel Nguyen"]],
      session_number: 5,
      starts_at: "2026-02-25T13:00:00-05:00",
      ends_at: "2026-02-25T14:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Catherine Stewart — completed series + quarterly tune-ups
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Catherine Stewart"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Catherine Stewart"]],
      session_number: n,
      starts_at: new Date(2025, 3, 1 + (n - 1) * 14, 11, 0).toISOString(),
      ends_at: new Date(2025, 3, 1 + (n - 1) * 14, 12, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Catherine Stewart"],
      session_type_id: tu,
      starts_at: "2025-11-05T11:00:00-05:00",
      ends_at: "2025-11-05T12:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Catherine Stewart"],
      session_type_id: tu,
      starts_at: "2026-02-10T11:00:00-05:00",
      ends_at: "2026-02-10T12:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },

    // Ahmed Hassan — sessions 1-6 completed, session 7 upcoming
    ...[1, 2, 3, 4, 5, 6].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Ahmed Hassan"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Ahmed Hassan"]],
      session_number: n,
      starts_at: new Date(2025, 10, 1 + (n - 1) * 14, 16, 0).toISOString(),
      ends_at: new Date(2025, 10, 1 + (n - 1) * 14, 17, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Ahmed Hassan"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Ahmed Hassan"]],
      session_number: 7,
      starts_at: "2026-02-28T16:00:00-05:00",
      ends_at: "2026-02-28T17:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Olivia Moreau — sessions 1-3 completed, session 4 upcoming
    ...[1, 2, 3].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Olivia Moreau"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Olivia Moreau"]],
      session_number: n,
      starts_at: new Date(2026, 0, 15 + (n - 1) * 10, 17, 0).toISOString(),
      ends_at: new Date(2026, 0, 15 + (n - 1) * 10, 18, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Olivia Moreau"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Olivia Moreau"]],
      session_number: 4,
      starts_at: "2026-03-02T17:00:00-05:00",
      ends_at: "2026-03-02T18:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Tomas Kowalski — sessions 1-5 completed, session 6 upcoming
    ...[1, 2, 3, 4, 5].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Tomas Kowalski"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Tomas Kowalski"]],
      session_number: n,
      starts_at: new Date(2025, 11, 1 + (n - 1) * 12, 10, 0).toISOString(),
      ends_at: new Date(2025, 11, 1 + (n - 1) * 12, 11, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Tomas Kowalski"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Tomas Kowalski"]],
      session_number: 6,
      starts_at: "2026-03-03T10:00:00-05:00",
      ends_at: "2026-03-03T11:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Maya Thompson — consultation upcoming (no series, new client)
    {
      practitioner_id: pid,
      client_id: clientMap["Maya Thompson"],
      session_type_id: co,
      starts_at: "2026-03-01T14:00:00-05:00",
      ends_at: "2026-03-01T14:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Gregory Fontaine — sessions 1-2 completed, session 3 upcoming
    ...[1, 2].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Gregory Fontaine"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Gregory Fontaine"]],
      session_number: n,
      starts_at: new Date(2026, 1, 1 + (n - 1) * 10, 7, 0).toISOString(),
      ends_at: new Date(2026, 1, 1 + (n - 1) * 10, 8, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Gregory Fontaine"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Gregory Fontaine"]],
      session_number: 3,
      starts_at: "2026-02-27T07:00:00-05:00",
      ends_at: "2026-02-27T08:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Ingrid Bergström — 2 single sessions completed, 1 upcoming (no series)
    {
      practitioner_id: pid,
      client_id: clientMap["Ingrid Bergström"],
      session_type_id: singleType?.id || defaultType.id,
      starts_at: "2026-02-05T10:00:00-05:00",
      ends_at: "2026-02-05T11:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Ingrid Bergström"],
      session_type_id: singleType?.id || defaultType.id,
      starts_at: "2026-02-19T10:00:00-05:00",
      ends_at: "2026-02-19T11:00:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Ingrid Bergström"],
      session_type_id: singleType?.id || defaultType.id,
      starts_at: "2026-03-05T10:00:00-05:00",
      ends_at: "2026-03-05T11:00:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Kwame Asante — session 1 completed, session 2 upcoming
    {
      practitioner_id: pid,
      client_id: clientMap["Kwame Asante"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Kwame Asante"]],
      session_number: 1,
      starts_at: "2026-02-20T18:00:00-05:00",
      ends_at: "2026-02-20T19:30:00-05:00",
      status: "completed" as const,
      payment_status: "paid" as const,
    },
    {
      practitioner_id: pid,
      client_id: clientMap["Kwame Asante"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Kwame Asante"]],
      session_number: 2,
      starts_at: "2026-03-06T18:00:00-05:00",
      ends_at: "2026-03-06T19:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },

    // Sophia Romano — sessions 1-3 completed, session 4 upcoming
    ...[1, 2, 3].map((n) => ({
      practitioner_id: pid,
      client_id: clientMap["Sophia Romano"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Sophia Romano"]],
      session_number: n,
      starts_at: new Date(2026, 0, 10 + (n - 1) * 14, 10, 0).toISOString(),
      ends_at: new Date(2026, 0, 10 + (n - 1) * 14, 11, 30).toISOString(),
      status: "completed" as const,
      payment_status: "paid" as const,
    })),
    {
      practitioner_id: pid,
      client_id: clientMap["Sophia Romano"],
      session_type_id: ts,
      series_id: seriesMap[clientMap["Sophia Romano"]],
      session_number: 4,
      starts_at: "2026-03-07T10:00:00-05:00",
      ends_at: "2026-03-07T11:30:00-05:00",
      status: "confirmed" as const,
      payment_status: "pending" as const,
    },
  ];

  const { data: appointments, error: aptsError } = await supabase
    .from("appointments")
    .insert(appointmentsData)
    .select("id, client_id, session_number, status");

  if (aptsError) {
    console.error("Failed to create appointments:", aptsError.message);
    process.exit(1);
  }

  console.log(`Created ${appointments?.length || 0} appointments`);

  // ─── SOAP Notes (for completed sessions) ─────────────────
  const completedApts = (appointments || []).filter(
    (a) => a.status === "completed"
  );

  const soapNotesData = completedApts.map((apt) => {
    const soapContent = getSoapContent(apt.client_id, apt.session_number, clientMap);
    return {
      appointment_id: apt.id,
      practitioner_id: pid,
      ...soapContent,
    };
  });

  if (soapNotesData.length > 0) {
    const { error: soapError } = await supabase
      .from("soap_notes")
      .insert(soapNotesData);
    if (soapError) {
      console.error("SOAP notes error:", soapError.message);
    } else {
      console.log(`Created ${soapNotesData.length} SOAP notes`);
    }
  }

  // ─── Payments (for completed sessions) ───────────────────
  const paymentsData = completedApts.map((apt) => ({
    appointment_id: apt.id,
    client_id: apt.client_id,
    practitioner_id: pid,
    amount_cents: 18000,
    currency: "CAD",
    tax_cents: 2340,
    processor: "stripe" as const,
    status: "succeeded" as const,
    card_last_four: "4242",
  }));

  if (paymentsData.length > 0) {
    const { error: payError } = await supabase
      .from("payments")
      .insert(paymentsData);
    if (payError) {
      console.error("Payments error:", payError.message);
    } else {
      console.log(`Created ${paymentsData.length} payments`);
    }
  }

  // ─── Intake Forms ────────────────────────────────────────
  const intakeClients = [
    "Sarah Chen",
    "Marcus Williams",
    "Aisha Patel",
    "James O'Brien",
    "Robert Kim",
    "Priya Sharma",
    "Daniel Nguyen",
    "Catherine Stewart",
    "Ahmed Hassan",
    "Olivia Moreau",
    "Tomas Kowalski",
    "Gregory Fontaine",
    "Ingrid Bergström",
    "Kwame Asante",
    "Sophia Romano",
  ];
  const intakeFormsData: {
    client_id: string;
    practitioner_id: string;
    form_type: string;
    form_data: Record<string, unknown>;
    signed_at: string;
  }[] = intakeClients.map((name) => ({
    client_id: clientMap[name],
    practitioner_id: pid,
    form_type: "intake",
    form_data: { completed: true },
    signed_at: new Date(2026, 0, 1).toISOString(),
  }));

  intakeFormsData.push(
    {
      client_id: clientMap["Sarah Chen"],
      practitioner_id: pid,
      form_type: "consent",
      form_data: { type: "general_consent" },
      signed_at: new Date(2026, 0, 8).toISOString(),
    },
    {
      client_id: clientMap["Marcus Williams"],
      practitioner_id: pid,
      form_type: "health_history",
      form_data: { type: "detailed_health" },
      signed_at: new Date(2026, 0, 20).toISOString(),
    }
  );

  const { error: formsError } = await supabase
    .from("intake_forms")
    .insert(intakeFormsData);
  if (formsError) {
    console.error("Forms error:", formsError.message);
  } else {
    console.log(`Created ${intakeFormsData.length} intake forms`);
  }

  console.log("\nSeed complete!");
}

async function deleteSeedData() {
  const { data: users } = await supabase.auth.admin.listUsers();
  if (!users?.users?.length) {
    console.error("No users found");
    process.exit(1);
  }
  const pid = users.users[0].id;
  console.log(`Deleting data for practitioner: ${pid}`);

  await supabase.from("payments").delete().eq("practitioner_id", pid);
  await supabase.from("soap_notes").delete().eq("practitioner_id", pid);
  await supabase.from("intake_forms").delete().eq("practitioner_id", pid);
  await supabase.from("documents").delete().eq("practitioner_id", pid);
  await supabase.from("appointments").delete().eq("practitioner_id", pid);
  await supabase.from("series").delete().eq("practitioner_id", pid);
  await supabase.from("clients").delete().eq("practitioner_id", pid);

  console.log("All data deleted.");
}

// ─── SOAP content generator ──────────────────────────────────
function getSoapContent(
  clientId: string,
  sessionNumber: number | null,
  clientMap: Record<string, string>
) {
  const clientName = Object.entries(clientMap).find(
    ([, id]) => id === clientId
  )?.[0];

  const num = sessionNumber || 1;

  const soapTemplates: Record<
    number,
    {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
      focus_areas: { area: string; notes: string }[];
      techniques_used: string[];
      session_goals: string[];
    }
  > = {
    1: {
      subjective:
        "Client reports general tightness across the chest and upper body. Breathing feels restricted, especially during exercise. Notes tension increases with stress.",
      objective:
        "Observed restricted ribcage expansion on inhalation. Pectoralis major bilateral tightness. Superficial fascial adhesions noted in anterior trunk. Diaphragm excursion limited to ~60% of expected range.",
      assessment:
        "Significant superficial fascial restrictions in the anterior trunk limiting respiratory capacity. Good tissue responsiveness to initial work — positive prognosis for series progression.",
      plan: "Continue sleeve work in Session 2 with focus on feet and lower legs. Recommend awareness of breathing patterns between sessions. Hydration important.",
      focus_areas: [
        { area: "Ribcage", notes: "Bilateral restrictions in intercostals" },
        { area: "Diaphragm", notes: "Limited excursion, responded well to release" },
        { area: "Chest", notes: "Pectoralis tightness, superficial fascial spreading" },
        { area: "Shoulders", notes: "Deltoid tension, beginning to release" },
      ],
      techniques_used: [
        "Broad Fascial Spreading",
        "Myofascial Release",
        "Diaphragm Release",
        "Joint Mobilization",
      ],
      session_goals: [
        "Open ribcage and improve breathing",
        "Address superficial fascial restrictions",
        "Establish therapeutic relationship",
      ],
    },
    2: {
      subjective:
        "Client reports improved breathing since last session. Noticed they're standing differently. Some soreness in feet after long walks.",
      objective:
        "Improved ribcage mobility compared to Session 1. Plantar fascia bilateral tightness. Peroneal tension noted. Collapsed medial arches bilaterally. Calf complex hypertonic.",
      assessment:
        "Good integration of Session 1 work. Foundation needs significant attention — collapsed arches contributing to compensation patterns throughout the chain.",
      plan: "Session 3 will address lateral line. Recommended barefoot walking exercises to maintain arch awareness.",
      focus_areas: [
        { area: "Feet", notes: "Plantar fascia release, arch work" },
        { area: "Ankles", notes: "Peroneal release, mobility improved" },
        { area: "Lower legs", notes: "Gastrocnemius/soleus release" },
        { area: "Back", notes: "Superficial erector spinae work" },
      ],
      techniques_used: [
        "Plantar Fascia Release",
        "Ankle Mobilization",
        "Lower Leg Fascial Work",
        "Myofascial Release",
      ],
      session_goals: [
        "Create stable foundation through feet",
        "Improve ground contact",
        "Address lower leg restrictions",
      ],
    },
    3: {
      subjective:
        "Reports feeling more grounded. Better balance when walking. Noticed asymmetry in trunk — right side feels shorter than left.",
      objective:
        "Visible lateral tilt — right iliac crest elevated. IT band tension right > left. Quadratus lumborum shortened on right. Lateral ribcage restricted bilaterally. Serratus anterior weakness left side.",
      assessment:
        "Significant lateral imbalance confirmed. Right QL shortening is a primary pattern. Sleeve work completion allowing deeper patterns to become visible.",
      plan: "Transition to core work in Session 4. Will address inner leg line and begin pelvic floor awareness.",
      focus_areas: [
        { area: "Side body", notes: "Lateral line release, right side focus" },
        { area: "IT Band", notes: "Right IT band release" },
        { area: "Ribcage", notes: "Lateral intercostal differentiation" },
        { area: "Hips", notes: "Hip hiking pattern noted right side" },
      ],
      techniques_used: [
        "Lateral Line Release",
        "Cross-Fiber Work",
        "Side-Lying Techniques",
        "Rib Differentiation",
      ],
      session_goals: [
        "Balance front-back via lateral line",
        "Create space between pelvis and ribcage",
        "Begin three-dimensional organization",
      ],
    },
    4: {
      subjective:
        "Feeling longer through the side body. Sleep has improved. Noticed more awareness of inner legs when walking. Some emotional processing this week.",
      objective:
        "Adductor group bilateral tightness. Pelvic floor tension palpable. Inner arch collapse improving but still present. Gracilis tight bilateral.",
      assessment:
        "Core work entry point reveals significant holding pattern in adductor complex and pelvic floor. Inner leg line restriction contributing to arch collapse pattern identified in Session 2.",
      plan: "Session 5 anterior core work. May need extra pelvic floor awareness homework. Check in about emotional processing next session.",
      focus_areas: [
        { area: "Inner legs", notes: "Adductor release bilateral" },
        { area: "Pelvis", notes: "Pelvic floor awareness work" },
        { area: "Feet", notes: "Inner arch support" },
        { area: "Knees", notes: "Medial knee tracking improved" },
      ],
      techniques_used: [
        "Inner Leg Fascial Release",
        "Pelvic Floor Awareness Work",
        "Adductor Release",
        "Arch Support Work",
      ],
      session_goals: [
        "Access the core of the body",
        "Address inner leg line and pelvic floor",
        "Create lift through inner arch",
      ],
    },
    5: {
      subjective:
        "Reports deeper body awareness. Some emotional release during week — felt tearful but also lighter. Standing taller at work.",
      objective:
        "Psoas bilateral hypertonic, left > right. Rectus abdominis superficial adhesions. Hip flexor shortening bilateral. Visceral space restricted. Anterior longitudinal ligament mobility improving.",
      assessment:
        "Psoas holding pattern significant and likely longstanding. Left psoas more restricted correlating with right lateral shift pattern. Good client awareness — emotional processing indicates deep tissue engagement.",
      plan: "Session 6 posterior core. Will balance the front body opening with back body work. Psoas may need revisiting in integration sessions.",
      focus_areas: [
        { area: "Abdomen", notes: "Psoas release bilateral, left focus" },
        { area: "Hip flexors", notes: "Iliacus and hip flexor release" },
        { area: "Chest", notes: "Anterior trunk lengthening" },
        { area: "Lower back", notes: "Secondary lumbar response" },
      ],
      techniques_used: [
        "Psoas Release",
        "Visceral Mobilization",
        "Deep Tissue",
        "Myofascial Release",
      ],
      session_goals: [
        "Open anterior core",
        "Release chronic flexion patterns",
        "Address visceral space",
      ],
    },
    6: {
      subjective:
        "Feels like posture has shifted significantly. Co-workers commenting on standing taller. Lower back pain notably reduced. Breathing much easier.",
      objective:
        "SI joint mobility improved. Deep laminar layer tension reducing. Multifidus activation improving. Sacral position more neutral. Suboccipital tension still present.",
      assessment:
        "Posterior core responding well. Sacral torsion pattern beginning to resolve. Front-back balance significantly improved from pre-series assessment.",
      plan: "Session 7 head, neck, and shoulders. Will address remaining suboccipital tension and integrate head on spine.",
      focus_areas: [
        { area: "Sacrum", notes: "SI joint release, sacral positioning" },
        { area: "Lower back", notes: "Deep spinal work, multifidus" },
        { area: "Upper back", notes: "Deep erector spinae release" },
        { area: "Neck", notes: "Suboccipital area, preliminary work" },
      ],
      techniques_used: [
        "SI Joint Release",
        "Deep Spinal Work",
        "Sacral Release",
        "Cranial Base Work",
      ],
      session_goals: [
        "Open posterior core",
        "Balance front-back at core level",
        "Create spinal length",
      ],
    },
    7: {
      subjective:
        "Reports jaw clenching has decreased. Neck feels freer. Headache frequency reduced from 2-3x/week to 1x/week. Some sinus clearing after session.",
      objective:
        "Deep cervical flexors underactive. Scalenes hypertonic left > right. TMJ restriction lateral pterygoids. Masseter tension bilateral. Hyoid muscles restricted. Head anterior to spine by ~2cm.",
      assessment:
        "Head-neck relationship significantly improved with core work. TMJ pattern likely contributing to residual headaches. Intraoral work well-tolerated and effective.",
      plan: "Session 8 upper integration. Will customize based on remaining upper body patterns. Consider revisiting shoulder girdle.",
      focus_areas: [
        { area: "Neck", notes: "Deep cervical work, scalene release" },
        { area: "Jaw", notes: "TMJ release, intraoral pterygoid work" },
        { area: "Shoulders", notes: "Shoulder girdle integration" },
        { area: "Head", notes: "Cranial work, suboccipital release" },
      ],
      techniques_used: [
        "Cranial Work",
        "TMJ Release",
        "Deep Neck Work",
        "Intraoral Work",
      ],
      session_goals: [
        "Integrate head, neck, shoulders with core",
        "Release jaw restrictions",
        "Establish head balanced over spine",
      ],
    },
  };

  const template = soapTemplates[num] || soapTemplates[1];

  let subjectivePrefix = "";
  if (clientName?.includes("Sarah")) {
    subjectivePrefix = "Active runner. ";
  } else if (clientName?.includes("Marcus")) {
    subjectivePrefix = "Desk worker. ";
  } else if (clientName?.includes("Aisha")) {
    subjectivePrefix = "Yoga instructor. ";
  } else if (clientName?.includes("Robert")) {
    subjectivePrefix = "Professional cellist. ";
  }

  return {
    subjective: subjectivePrefix + template.subjective,
    objective: template.objective,
    assessment: template.assessment,
    plan: template.plan,
    focus_areas: template.focus_areas,
    techniques_used: template.techniques_used,
    session_goals: template.session_goals,
  };
}

// Run
const isDelete = process.argv.includes("--delete");
if (isDelete) {
  deleteSeedData();
} else {
  seed();
}
