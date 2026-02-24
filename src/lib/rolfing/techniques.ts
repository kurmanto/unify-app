export interface Technique {
  name: string;
  category: string;
  description: string;
  common_areas: string[];
}

export const TECHNIQUES: Technique[] = [
  {
    name: "Broad Fascial Spreading",
    category: "Myofascial",
    description: "Slow, broad pressure to spread and release superficial fascial layers.",
    common_areas: ["Chest", "Back", "Thighs", "Arms"],
  },
  {
    name: "Myofascial Release",
    category: "Myofascial",
    description: "Sustained pressure to release fascial restrictions and restore tissue mobility.",
    common_areas: ["Full body"],
  },
  {
    name: "Cross-Fiber Work",
    category: "Myofascial",
    description: "Pressure applied across the direction of muscle fibers to break adhesions.",
    common_areas: ["IT Band", "Hamstrings", "Forearms"],
  },
  {
    name: "Deep Tissue",
    category: "Structural",
    description: "Slow, deep pressure reaching the deeper layers of muscle and fascia.",
    common_areas: ["Paravertebral muscles", "Psoas", "Quadratus lumborum"],
  },
  {
    name: "Visceral Mobilization",
    category: "Visceral",
    description: "Gentle mobilization of abdominal organs and visceral fascia.",
    common_areas: ["Abdomen", "Diaphragm"],
  },
  {
    name: "Cranial Work",
    category: "Craniosacral",
    description: "Light touch work on the cranial bones and membranes.",
    common_areas: ["Cranium", "Sacrum", "Spinal column"],
  },
  {
    name: "Intraoral Work",
    category: "Specialized",
    description: "Work inside the mouth to address jaw (TMJ) and facial tension.",
    common_areas: ["Jaw", "Pterygoids", "Masseter"],
  },
  {
    name: "Nerve Mobilization",
    category: "Neural",
    description: "Gentle techniques to free restricted nerves and improve neural glide.",
    common_areas: ["Sciatic nerve", "Brachial plexus", "Carpal tunnel"],
  },
  {
    name: "Joint Mobilization",
    category: "Structural",
    description: "Gentle oscillatory movements to improve joint range of motion.",
    common_areas: ["Ribs", "Spine", "Sacroiliac", "Ankle"],
  },
  {
    name: "Movement Education",
    category: "Integration",
    description: "Guided movement patterns to help integrate structural changes.",
    common_areas: ["Full body"],
  },
  {
    name: "Diaphragm Release",
    category: "Myofascial",
    description: "Specific techniques targeting the respiratory, pelvic, and thoracic inlet diaphragms.",
    common_areas: ["Respiratory diaphragm", "Pelvic floor", "Thoracic inlet"],
  },
  {
    name: "Psoas Release",
    category: "Structural",
    description: "Careful access and release of the iliopsoas muscle complex.",
    common_areas: ["Psoas", "Iliacus", "Hip flexors"],
  },
];

export function getTechniquesByCategory(category: string): Technique[] {
  return TECHNIQUES.filter((t) => t.category === category);
}

export function getCategories(): string[] {
  return [...new Set(TECHNIQUES.map((t) => t.category))];
}
