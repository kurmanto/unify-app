import type { BodyRegion } from "@/types";

// Maps common SOAP note focus_area text labels to body region identifiers
const FOCUS_AREA_MAPPINGS: Record<string, BodyRegion> = {
  // Head/face/jaw
  head: "head",
  cranium: "head",
  cranial: "head",
  jaw: "jaw",
  tmj: "jaw",
  face: "jaw",
  // Neck
  neck: "neck",
  cervical: "neck",
  scm: "neck",
  scalenes: "neck",
  suboccipital: "neck",
  // Shoulders
  shoulders: "shoulders",
  shoulder: "shoulders",
  deltoid: "shoulders",
  rotator: "shoulders",
  "shoulder girdle": "shoulders",
  // Chest
  chest: "chest",
  pectoralis: "chest",
  ribcage: "chest",
  ribs: "chest",
  intercostal: "chest",
  diaphragm: "chest",
  // Upper back
  "upper back": "upper_back",
  thoracic: "upper_back",
  rhomboid: "upper_back",
  trapezius: "upper_back",
  // Mid back
  "mid back": "mid_back",
  "middle back": "mid_back",
  "erector spinae": "mid_back",
  // Lower back
  "lower back": "lower_back",
  lumbar: "lower_back",
  "quadratus lumborum": "lower_back",
  ql: "lower_back",
  // Arms
  arms: "arms",
  arm: "arms",
  bicep: "arms",
  tricep: "arms",
  // Forearms
  forearms: "forearms",
  forearm: "forearms",
  wrist: "forearms",
  // Hands
  hands: "hands",
  hand: "hands",
  fingers: "hands",
  // Abdomen
  abdomen: "abdomen",
  abdominal: "abdomen",
  psoas: "abdomen",
  "hip flexor": "abdomen",
  "hip flexors": "abdomen",
  rectus: "abdomen",
  visceral: "abdomen",
  // Pelvis
  pelvis: "pelvis",
  pelvic: "pelvis",
  "pelvic floor": "pelvis",
  // Hips
  hips: "hips",
  hip: "hips",
  // Sacrum
  sacrum: "sacrum",
  sacroiliac: "sacrum",
  "si joint": "sacrum",
  sacral: "sacrum",
  // Glutes
  glutes: "glutes",
  gluteal: "glutes",
  piriformis: "glutes",
  // Upper legs
  "upper legs": "upper_legs",
  thigh: "upper_legs",
  thighs: "upper_legs",
  quadriceps: "upper_legs",
  hamstring: "upper_legs",
  hamstrings: "upper_legs",
  // Knees
  knees: "knees",
  knee: "knees",
  // Lower legs
  "lower legs": "lower_legs",
  calf: "lower_legs",
  calves: "lower_legs",
  gastrocnemius: "lower_legs",
  soleus: "lower_legs",
  tibialis: "lower_legs",
  shin: "lower_legs",
  // Ankles
  ankles: "ankles",
  ankle: "ankles",
  // Feet
  feet: "feet",
  foot: "feet",
  plantar: "feet",
  "inner arch": "feet",
  // IT band
  "it band": "it_band",
  "iliotibial": "it_band",
  tfl: "it_band",
  // Inner legs
  "inner leg": "inner_legs",
  "inner legs": "inner_legs",
  adductor: "inner_legs",
  adductors: "inner_legs",
  gracilis: "inner_legs",
  // Side body
  "side body": "side_body",
  "lateral line": "side_body",
  "lateral trunk": "side_body",
  obliques: "side_body",
  "serratus anterior": "side_body",
  latissimus: "side_body",
};

/**
 * Maps a focus area text label to a body region identifier.
 */
export function mapFocusAreaToRegion(focusArea: string): BodyRegion | null {
  const lower = focusArea.toLowerCase().trim();

  // Direct match
  if (FOCUS_AREA_MAPPINGS[lower]) {
    return FOCUS_AREA_MAPPINGS[lower];
  }

  // Partial match
  for (const [key, region] of Object.entries(FOCUS_AREA_MAPPINGS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return region;
    }
  }

  return null;
}

/**
 * Computes color intensity per region based on frequency of work.
 * Returns a map of BodyRegion -> intensity (0-1).
 */
export function computeRegionIntensity(
  focusAreas: { area: string; notes: string }[]
): Record<BodyRegion, number> {
  const counts: Partial<Record<BodyRegion, number>> = {};
  let maxCount = 0;

  for (const fa of focusAreas) {
    const region = mapFocusAreaToRegion(fa.area);
    if (region) {
      counts[region] = (counts[region] || 0) + 1;
      maxCount = Math.max(maxCount, counts[region]!);
    }
  }

  const intensity: Record<string, number> = {};
  if (maxCount > 0) {
    for (const [region, count] of Object.entries(counts)) {
      intensity[region] = count! / maxCount;
    }
  }

  return intensity as Record<BodyRegion, number>;
}
