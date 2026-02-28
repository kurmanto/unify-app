import type { BodyRegion } from "@/types";

export interface SoapTemplate {
  session: number;
  name: string;
  objective: string;
  assessment: string;
  techniques: string[];
  focus_areas: BodyRegion[];
  session_goals: string[];
}

export const SOAP_TEMPLATES: SoapTemplate[] = [
  {
    session: 1,
    name: "Session 1 — Breath & Ribcage",
    objective:
      "Postural assessment reveals restricted rib excursion and elevated shoulders. Superficial fascial layers of the chest and upper back show limited glide. Diaphragm palpation reveals hypertonic fibers with reduced excursion. Tissue quality improved through session with increased rib mobility.",
    assessment:
      "Superficial sleeve restrictions limiting breath capacity. Initial fascial release achieved good response with improved rib excursion and shoulder drop. Foundation established for deeper work in subsequent sessions.",
    techniques: [
      "Broad Fascial Spreading",
      "Myofascial Release",
      "Joint Mobilization",
      "Diaphragm Release",
    ],
    focus_areas: ["chest", "shoulders", "arms", "upper_legs", "neck"],
    session_goals: [
      "Establish the therapeutic relationship",
      "Open the ribcage and improve breathing capacity",
      "Begin to address superficial fascial restrictions",
      "Introduce the body to structural change",
    ],
  },
  {
    session: 2,
    name: "Session 2 — Foundation",
    objective:
      "Assessment of foot mechanics reveals limited arch mobility and restricted plantar fascia. Ankle dorsiflexion reduced bilaterally. Lower leg compartments show fascial binding, particularly in the lateral compartment. Improved ground contact and arch response post-treatment.",
    assessment:
      "Foundation work addresses base of support. Good tissue response in plantar fascia and lower leg compartments. Client demonstrates improved proprioception and weight distribution through the feet.",
    techniques: [
      "Myofascial Release",
      "Joint Mobilization",
      "Broad Fascial Spreading",
    ],
    focus_areas: ["feet", "ankles", "knees", "lower_legs"],
    session_goals: [
      "Create a stable foundation through the feet and lower legs",
      "Improve ground contact and proprioception",
      "Address lower leg fascial restrictions",
      "Begin to establish a stable base of support",
    ],
  },
  {
    session: 3,
    name: "Session 3 — Lateral Line",
    objective:
      "Lateral line assessment shows asymmetry between right and left side body. Reduced space between ribcage and pelvis. IT band shows fascial restriction bilaterally. Lateral trunk musculature responds well to differentiation work. Improved lateral balance post-treatment.",
    assessment:
      "Lateral line work completes the sleeve phase. Three-dimensional organization improving with balanced front-back-side relationships. Client reports feeling more space between ribs and pelvis.",
    techniques: [
      "Myofascial Release",
      "Broad Fascial Spreading",
      "Joint Mobilization",
    ],
    focus_areas: ["side_body", "it_band", "shoulders", "hips"],
    session_goals: [
      "Balance the front-back relationship via the lateral line",
      "Create space between the pelvis and ribcage",
      "Address the side body as a bridge between front and back",
      "Begin three-dimensional organization",
    ],
  },
  {
    session: 4,
    name: "Session 4 — Midline",
    objective:
      "Inner leg line assessment reveals restricted adductor group bilaterally. Medial arch of foot shows reduced tone. Pelvic floor awareness limited. Tissue quality in adductors improved through session. Client reports increased sense of inner support.",
    assessment:
      "Transition to core work initiated successfully. Inner leg line responds well to release work. Improved connection from inner arch through adductors to pelvic floor. Client demonstrates better understanding of core support.",
    techniques: [
      "Myofascial Release",
      "Deep Tissue",
    ],
    focus_areas: ["inner_legs", "pelvis", "feet", "upper_legs"],
    session_goals: [
      "Begin accessing the core of the body",
      "Address the inner leg line and pelvic floor",
      "Improve pelvic stability and alignment",
      "Create lift through the inner arch and inner leg",
    ],
  },
  {
    session: 5,
    name: "Session 5 — Anterior Core",
    objective:
      "Anterior core assessment shows chronic flexion pattern. Psoas palpation reveals hypertonic and shortened muscle bilaterally. Abdominal fascia restricted with limited visceral mobility. Post-treatment, psoas length improved and abdominal wall shows better differentiation.",
    assessment:
      "Deep anterior core work addresses longstanding flexion patterns. Psoas release achieved good depth with client tolerance. Visceral space improved. Client reports sense of openness and length in the front body.",
    techniques: [
      "Psoas Release",
      "Deep Tissue",
      "Visceral Mobilization",
      "Myofascial Release",
    ],
    focus_areas: ["abdomen", "pelvis", "hips"],
    session_goals: [
      "Open the anterior core — abdominals and psoas",
      "Release chronic flexion patterns",
      "Create length in the front body",
      "Address the visceral space",
    ],
  },
  {
    session: 6,
    name: "Session 6 — Posterior Core",
    objective:
      "Posterior assessment reveals SI joint restriction. Deep spinal muscles show hypertonicity, particularly in the lumbar region. Sacral mobility limited. Suboccipital group tight bilaterally. Post-treatment, improved sacral mobility and spinal length noted.",
    assessment:
      "Deep back body work balances Session 5 anterior release. SI joint shows improved mobility. Spinal length increased with reduced erector spinae tone. Client reports new sense of length through posterior body.",
    techniques: [
      "Deep Tissue",
      "Myofascial Release",
      "Joint Mobilization",
      "Cranial Work",
    ],
    focus_areas: ["sacrum", "lower_back", "upper_back", "neck"],
    session_goals: [
      "Open the posterior core — sacrum to cranium",
      "Address the sacroiliac joint and deep back line",
      "Create length in the posterior spine",
      "Balance the front-back relationship at the core level",
    ],
  },
  {
    session: 7,
    name: "Session 7 — Head, Neck & Shoulders",
    objective:
      "Head and neck assessment shows forward head posture. TMJ restricted bilaterally with lateral deviation on opening. Deep cervical flexors weak. Scalenes hypertonic. Post-treatment, improved head-spine relationship and jaw mobility noted.",
    assessment:
      "Crown of the structure addressed with comprehensive head, neck, and jaw work. Forward head posture improved. TMJ mobility restored. Client reports clarity and lightness in head and neck region. Core phase complete.",
    techniques: [
      "Cranial Work",
      "Deep Tissue",
      "Myofascial Release",
      "Joint Mobilization",
    ],
    focus_areas: ["head", "jaw", "neck", "shoulders"],
    session_goals: [
      "Integrate the head, neck, and shoulders with the core",
      "Release jaw and cranial restrictions",
      "Complete the core work phase",
      "Establish the head balanced over the spine",
    ],
  },
  {
    session: 8,
    name: "Session 8 — Upper Integration",
    objective:
      "Upper body assessment shows improved alignment from prior sessions. Remaining compensatory patterns noted in shoulder girdle. Arm-trunk relationship shows improved but incomplete integration. Movement quality improving in upper body functional patterns.",
    assessment:
      "First integration session addresses upper body coherence. Shoulder girdle integration improved. Arm-trunk connection refined. Movement patterns show better coordination. Individualized work targets remaining compensatory patterns.",
    techniques: [
      "Myofascial Release",
      "Movement Education",
      "Broad Fascial Spreading",
    ],
    focus_areas: ["shoulders", "arms", "chest", "upper_back"],
    session_goals: [
      "Integrate changes from sessions 1-7 in the upper body",
      "Address remaining compensatory patterns",
      "Create coherent movement patterns in the upper half",
      "Individualized work based on client's needs",
    ],
  },
  {
    session: 9,
    name: "Session 9 — Lower Integration",
    objective:
      "Lower body assessment shows improved pelvic alignment. Gait pattern improved with better push-off and swing phase. Feet show maintained arch tone from Session 2. Remaining asymmetries in pelvic-leg relationship addressed. Movement quality shows good integration.",
    assessment:
      "Second integration session connects lower body changes. Pelvic-leg relationship refined. Gait pattern normalized. Upper-lower body relationship shows improved continuity. Client prepared for final balancing session.",
    techniques: [
      "Myofascial Release",
      "Movement Education",
      "Broad Fascial Spreading",
    ],
    focus_areas: ["pelvis", "hips", "upper_legs", "lower_legs", "feet"],
    session_goals: [
      "Integrate changes from sessions 1-7 in the lower body",
      "Address remaining compensatory patterns",
      "Create coherent movement patterns in the lower half",
      "Prepare for the closing session",
    ],
  },
  {
    session: 10,
    name: "Session 10 — Closure & Integration",
    objective:
      "Full body assessment shows significant improvement in overall alignment and balance. Horizontal planes (pelvic, respiratory, thoracic inlet) showing improved alignment. Superficial fascia shows good mobility globally. Client demonstrates improved postural awareness and movement quality.",
    assessment:
      "Final balancing session completes the Ten Series. Horizontal planes aligned. Global fascial continuity restored. Client reports feeling integrated and grounded. Self-maintenance guidance provided. Follow-up recommended in 4-6 weeks.",
    techniques: [
      "Broad Fascial Spreading",
      "Diaphragm Release",
      "Movement Education",
      "Joint Mobilization",
    ],
    focus_areas: ["chest", "abdomen", "pelvis", "neck"],
    session_goals: [
      "Final whole-body integration and balancing",
      "Address horizontal relationships (joints, diaphragms)",
      "Close the series with a sense of completion",
      "Empower the client for self-maintenance",
    ],
  },
];

export function getTemplate(sessionNumber: number): SoapTemplate | undefined {
  return SOAP_TEMPLATES.find((t) => t.session === sessionNumber);
}
