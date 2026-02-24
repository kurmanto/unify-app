export interface TenSeriesSession {
  session: number;
  name: string;
  phase: "sleeve" | "core" | "integration";
  subtitle: string;
  goals: string[];
  focus_areas: string[];
  anatomy: string[];
  techniques: string[];
  philosophy: string;
  client_description: string;
  post_session_guidance: string;
}

export const TEN_SERIES: TenSeriesSession[] = [
  {
    session: 1,
    name: "Breath & Ribcage",
    phase: "sleeve",
    subtitle: "Opening the Sleeve — Freeing the Breath",
    goals: [
      "Establish the therapeutic relationship",
      "Open the ribcage and improve breathing capacity",
      "Begin to address superficial fascial restrictions",
      "Introduce the body to structural change",
    ],
    focus_areas: [
      "Ribcage",
      "Diaphragm",
      "Arms and shoulders",
      "Upper legs and hamstrings",
      "Neck and spine",
    ],
    anatomy: [
      "Pectoralis major/minor",
      "External intercostals",
      "Diaphragm",
      "Rectus abdominis (superficial)",
      "Deltoids",
      "Hamstrings (superficial)",
      "SCM and scalenes",
    ],
    techniques: [
      "Broad fascial spreading",
      "Myofascial release",
      "Rib mobilization",
      "Diaphragm release",
    ],
    philosophy:
      "Session 1 is about creating space. We open the superficial sleeve to allow the breath to move more freely. This sets the foundation for all subsequent work.",
    client_description:
      "This first session focuses on freeing your breath. We'll work on the ribcage, shoulders, and upper body to create more space for breathing. Many clients notice deeper, easier breathing immediately after this session.",
    post_session_guidance:
      "Take some time to notice how your breathing feels. You may feel more open in the chest. Drink plenty of water and allow yourself to rest if needed. Some mild soreness in the worked areas is normal.",
  },
  {
    session: 2,
    name: "Foundation",
    phase: "sleeve",
    subtitle: "Opening the Sleeve — Establishing the Base",
    goals: [
      "Create a stable foundation through the feet and lower legs",
      "Improve ground contact and proprioception",
      "Address lower leg fascial restrictions",
      "Begin to establish a stable base of support",
    ],
    focus_areas: [
      "Feet",
      "Ankles",
      "Knees",
      "Lower legs",
      "Back",
      "Neck",
    ],
    anatomy: [
      "Plantar fascia",
      "Peroneal muscles",
      "Gastrocnemius and soleus",
      "Tibialis anterior/posterior",
      "Intrinsic foot muscles",
      "Erector spinae (superficial)",
    ],
    techniques: [
      "Plantar fascia release",
      "Ankle mobilization",
      "Lower leg fascial work",
      "Foot intrinsic work",
    ],
    philosophy:
      "Session 2 builds the foundation. Like a building, the body needs a stable base. We work from the ground up, ensuring the feet can properly support the structure above.",
    client_description:
      "This session focuses on your feet, ankles, and lower legs — your foundation. We'll work to improve your connection to the ground and the stability of your base. You may notice a new sense of being 'grounded' after this session.",
    post_session_guidance:
      "Pay attention to how your feet contact the ground when walking. You may feel a broader, more stable base. Walk barefoot when possible to maintain awareness. Some achiness in the feet and calves is normal.",
  },
  {
    session: 3,
    name: "Lateral Line",
    phase: "sleeve",
    subtitle: "Opening the Sleeve — Integrating the Side Body",
    goals: [
      "Balance the front-back relationship via the lateral line",
      "Create space between the pelvis and ribcage",
      "Address the side body as a bridge between front and back",
      "Begin three-dimensional organization",
    ],
    focus_areas: [
      "Side body",
      "Shoulder to pelvis connection",
      "Lateral trunk",
      "IT band region",
      "Lateral neck",
    ],
    anatomy: [
      "Quadratus lumborum",
      "External/internal obliques",
      "Latissimus dorsi",
      "Serratus anterior",
      "IT band/TFL",
      "Gluteus medius",
      "Intercostals (lateral)",
    ],
    techniques: [
      "Lateral line release",
      "Rib differentiation",
      "Lateral pelvic work",
      "Side-lying techniques",
    ],
    philosophy:
      "Session 3 completes the sleeve work by addressing the lateral line — the bridge between front and back. This session creates the three-dimensional space needed for the deeper core work to follow.",
    client_description:
      "This session works on the sides of your body, from hips to shoulders. It's about creating length and space in the trunk. You may feel taller and more balanced between your front and back body afterward.",
    post_session_guidance:
      "Notice the space between your ribs and pelvis. You may feel longer through the side body. Gentle side stretches can help maintain this new length. Allow 24-48 hours for the work to fully integrate.",
  },
  {
    session: 4,
    name: "Midline",
    phase: "core",
    subtitle: "Beginning Core Work — The Inner Leg and Pelvic Floor",
    goals: [
      "Begin accessing the core of the body",
      "Address the inner leg line and pelvic floor",
      "Improve pelvic stability and alignment",
      "Create lift through the inner arch and inner leg",
    ],
    focus_areas: [
      "Inner arch of foot",
      "Inner leg",
      "Adductors",
      "Pelvic floor",
      "Pelvis",
    ],
    anatomy: [
      "Adductor group",
      "Gracilis",
      "Pelvic floor muscles",
      "Inner arch muscles",
      "Sartorius",
      "Medial hamstrings",
    ],
    techniques: [
      "Inner leg fascial release",
      "Pelvic floor awareness work",
      "Adductor release",
      "Arch support work",
    ],
    philosophy:
      "Session 4 marks the transition to core work. The inner leg line connects the arch of the foot to the pelvic floor, creating a line of support that runs through the center of the body. This is often a profound session.",
    client_description:
      "This session begins the deeper core work, focusing on the inner legs and pelvic area. We'll work to create better support from the inner arches up through the pelvis. This session can feel quite different from the first three — deeper and more subtle.",
    post_session_guidance:
      "You may feel more grounded through the inner legs and feet. Emotional releases are not uncommon after this session. Be gentle with yourself and allow processing time. Light walking helps integrate the changes.",
  },
  {
    session: 5,
    name: "Anterior Core",
    phase: "core",
    subtitle: "Core Work — Opening the Front Body",
    goals: [
      "Open the anterior core — abdominals and psoas",
      "Release chronic flexion patterns",
      "Create length in the front body",
      "Address the visceral space",
    ],
    focus_areas: [
      "Abdominals",
      "Psoas",
      "Hip flexors",
      "Anterior spine",
      "Visceral fascia",
    ],
    anatomy: [
      "Rectus abdominis (deep)",
      "Psoas major/minor",
      "Iliacus",
      "Transversus abdominis",
      "Visceral peritoneum",
      "Anterior longitudinal ligament",
    ],
    techniques: [
      "Psoas release",
      "Abdominal fascial work",
      "Hip flexor release",
      "Visceral mobilization",
    ],
    philosophy:
      "Session 5 opens the front body at the deepest level. The psoas is the soul of the body — it connects the spine to the legs and responds deeply to emotional and physical patterns. Freeing it creates profound change.",
    client_description:
      "This session works on the deep front of your body — the abdominals, hip flexors, and the deep psoas muscle. This work can create a sense of openness and length through the front of your body. Some clients describe feeling 'taller' or 'lighter' afterward.",
    post_session_guidance:
      "The psoas work can bring up emotional responses — this is normal and healthy. Rest if needed. You may notice changes in your posture over the next few days. Gentle walking is beneficial.",
  },
  {
    session: 6,
    name: "Posterior Core",
    phase: "core",
    subtitle: "Core Work — Freeing the Back Body",
    goals: [
      "Open the posterior core — sacrum to cranium",
      "Address the sacroiliac joint and deep back line",
      "Create length in the posterior spine",
      "Balance the front-back relationship at the core level",
    ],
    focus_areas: [
      "Sacroiliac joint",
      "Deep back line",
      "Heels to cranium",
      "Sacrum",
      "Posterior spine",
    ],
    anatomy: [
      "Multifidus",
      "Rotatores",
      "Posterior sacroiliac ligaments",
      "Deep laminar layer",
      "Erector spinae (deep)",
      "Suboccipitals",
    ],
    techniques: [
      "SI joint release",
      "Deep spinal work",
      "Sacral release",
      "Cranial base work",
    ],
    philosophy:
      "Session 6 completes the front-back balancing begun in Session 5. By freeing the deep back body from the heels through the sacrum to the cranium, we create the conditions for the spine to truly lengthen.",
    client_description:
      "This session works on the deep back body, from your heels up through your spine to the base of your skull. We'll pay special attention to the sacrum and lower back. Many clients feel a new sense of length and ease in their spine after this work.",
    post_session_guidance:
      "You may notice changes in how you sit and stand. Your spine may feel longer and more supported. Gentle stretching and walking help integrate the changes. Some back soreness is normal.",
  },
  {
    session: 7,
    name: "Head, Neck & Shoulders",
    phase: "core",
    subtitle: "Core Work — Crowning the Structure",
    goals: [
      "Integrate the head, neck, and shoulders with the core",
      "Release jaw and cranial restrictions",
      "Complete the core work phase",
      "Establish the head balanced over the spine",
    ],
    focus_areas: [
      "Shoulders",
      "Neck",
      "Jaw (TMJ)",
      "Cranium",
      "Intraoral work (if appropriate)",
      "Full body integration",
    ],
    anatomy: [
      "Deep cervical flexors",
      "Scalenes (deep)",
      "Suboccipitals",
      "Pterygoids (intraoral)",
      "Masseter",
      "Temporalis",
      "Hyoid muscles",
    ],
    techniques: [
      "Cranial work",
      "TMJ release",
      "Deep neck work",
      "Intraoral techniques",
      "Shoulder girdle integration",
    ],
    philosophy:
      "Session 7 crowns the structure. The head and neck carry tremendous significance — they orient us in space and express our relationship to the world. Freeing them allows the entire structure to find a new balance.",
    client_description:
      "This session focuses on your head, neck, jaw, and shoulders. It may include work inside the mouth (with your consent) to address jaw tension. This session often brings a sense of clarity and lightness in the head and neck.",
    post_session_guidance:
      "You may notice changes in your jaw, vision, or breathing through the nose. The head may feel lighter on the spine. Avoid heavy chewing for 24 hours. Gentle neck movements help integrate the work.",
  },
  {
    session: 8,
    name: "Upper Integration",
    phase: "integration",
    subtitle: "Integration — Connecting the Upper Body",
    goals: [
      "Integrate changes from sessions 1-7 in the upper body",
      "Address remaining compensatory patterns",
      "Create coherent movement patterns in the upper half",
      "Individualized work based on client's needs",
    ],
    focus_areas: [
      "Upper body integration",
      "Shoulder girdle",
      "Arms",
      "Ribcage to pelvis relationship",
      "Individualized areas",
    ],
    anatomy: ["Varies based on individual assessment"],
    techniques: [
      "Integration techniques",
      "Movement education",
      "Gestural work",
      "Individualized approach",
    ],
    philosophy:
      "Sessions 8 and 9 are integration sessions — they're about connecting all the changes made in the previous sessions into a coherent whole. Session 8 typically focuses on the upper body, but is individualized to each client's needs.",
    client_description:
      "This is the first of two integration sessions. We'll work to connect and harmonize all the changes from previous sessions, focusing on the upper body. This session is customized to your specific needs and patterns.",
    post_session_guidance:
      "Notice how the upper and lower body relate to each other now. Movement may feel more coordinated and fluid. Continue any movement practices we've discussed. Walk mindfully to integrate the work.",
  },
  {
    session: 9,
    name: "Lower Integration",
    phase: "integration",
    subtitle: "Integration — Connecting the Lower Body",
    goals: [
      "Integrate changes from sessions 1-7 in the lower body",
      "Address remaining compensatory patterns",
      "Create coherent movement patterns in the lower half",
      "Prepare for the closing session",
    ],
    focus_areas: [
      "Lower body integration",
      "Pelvis and legs",
      "Feet and ankles revisited",
      "Pelvic-spinal relationship",
      "Individualized areas",
    ],
    anatomy: ["Varies based on individual assessment"],
    techniques: [
      "Integration techniques",
      "Movement education",
      "Gestural work",
      "Individualized approach",
    ],
    philosophy:
      "Session 9 continues the integration work, typically focusing on the lower body. The goal is to create a seamless connection between the upper and lower halves, preparing the body for the final balancing session.",
    client_description:
      "This session continues the integration work, focusing on the lower body. We'll work to ensure your legs, pelvis, and feet are well-connected with the changes in your upper body. The body is being prepared for the final session.",
    post_session_guidance:
      "Pay attention to your walking pattern — it may feel different. Notice the connection between your feet, legs, and pelvis. Continue mindful movement practices. You may feel emotional as the series nears completion.",
  },
  {
    session: 10,
    name: "Closure & Integration",
    phase: "integration",
    subtitle: "Integration — Final Balancing",
    goals: [
      "Final whole-body integration and balancing",
      "Address horizontal relationships (joints, diaphragms)",
      "Close the series with a sense of completion",
      "Empower the client for self-maintenance",
    ],
    focus_areas: [
      "Full body horizontal balancing",
      "Joint relationships",
      "Diaphragm alignment",
      "Superficial closure",
      "Overall structural harmony",
    ],
    anatomy: [
      "All major diaphragms: pelvic, respiratory, thoracic inlet, cranial",
      "Superficial fascia globally",
      "Joint capsules as needed",
    ],
    techniques: [
      "Horizontal balancing",
      "Superficial fascial spreading",
      "Diaphragm alignment",
      "Closure techniques",
    ],
    philosophy:
      "Session 10 is about completion and new beginnings. We balance the horizontal planes of the body and create a coherent, integrated whole. The client leaves with a new sense of their body and the tools to maintain it.",
    client_description:
      "This final session brings everything together. We'll work on balancing the whole body — creating harmony between all the areas we've addressed. Many clients describe this session as deeply satisfying, a sense of 'coming home' to their body.",
    post_session_guidance:
      "Congratulations on completing the Ten Series! Your body will continue to integrate these changes for weeks or months. Maintain awareness of your posture and movement. Follow-up sessions can be scheduled after 4-6 weeks to support ongoing integration.",
  },
];

export function getSessionGuide(sessionNumber: number): TenSeriesSession | undefined {
  return TEN_SERIES.find((s) => s.session === sessionNumber);
}

export function isSeriesSessionType(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("ten series session") && !lower.includes("package");
}

export function getPhaseLabel(phase: TenSeriesSession["phase"]): string {
  switch (phase) {
    case "sleeve":
      return "Sleeve (Sessions 1-3)";
    case "core":
      return "Core (Sessions 4-7)";
    case "integration":
      return "Integration (Sessions 8-10)";
  }
}
