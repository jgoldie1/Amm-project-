import fs from "node:fs";

const mediaPath = new URL("../src/data/CircleParkRealityMediaPipeline.ts", import.meta.url);
const aaaPath = new URL("../src/data/StreetVerseChicagoAAAVerticalSlice.ts", import.meta.url);
const media = fs.readFileSync(mediaPath, "utf8");
const aaa = fs.readFileSync(aaaPath, "utf8");

const requireAll = (label, source, tokens) => {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length) {
    console.error(`[morning-mega] ${label} missing: ${missing.join(", ")}`);
    process.exit(1);
  }
};

requireAll("Circle Park media pipeline", media, [
  "minimumRawMinutes: 60",
  "targetRawMinutes: 90",
  "reelsMinimum: 8",
  "reelsMaximum: 10",
  "liveAftershow: true",
  "allAmericanNetwork: true",
  "holoDrama: true",
  "separateMovieChapterEdit: true",
  "guardianReleaseForMinors: true",
  "REAL CHICAGO → REAL PEOPLE → REAL STORY → DIGITAL TWIN → PLAYABLE MISSION → TV → MOVIE → LIVE → COMMERCE",
  'currentState: "READY_FOR_FOOTAGE"',
]);

requireAll("StreetVerse Chicago AAA benchmark", aaa, [
  "circle-park-roosevelt-taylor-pilsen-aaa-benchmark",
  "pbr-materials",
  "lighting-and-reflections",
  "vehicle-interaction-and-physics",
  "living-pedestrian-population",
  "chicago-reference-authenticity",
  "lod-occlusion-world-streaming",
  "automated-visual-validator",
  "physicalDeviceCheckRequired: true",
  'currentState: "BUILDING"',
]);

console.log("StreetVerse Chicago morning mega contract: PASS");
