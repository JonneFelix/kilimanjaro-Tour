import { db, initDB } from "./db";

initDB();

const tripName = "Kilimanjaro 2025";

// 1. Ensure Trip Exists
let trip = db.query("SELECT * FROM trips WHERE name = $name").get({ $name: tripName }) as { id: number } | null;

if (!trip) {
  console.log("Creating trip...");
  const tripStmt = db.prepare("INSERT INTO trips (name, created_at) VALUES ($name, CURRENT_TIMESTAMP) RETURNING id");
  trip = tripStmt.get({ $name: tripName }) as { id: number };
}

const tripId = trip.id;
console.log(`Using Trip ID: ${tripId}`);

// 2. Clear existing Items for this trip (re-seed safe)
console.log("Clearing existing items, markers and notes...");
db.run("DELETE FROM equipment_items WHERE trip_id = $tripId", { $tripId: tripId });
db.run("DELETE FROM map_markers WHERE trip_id = $tripId AND type = 'route_waypoint'", { $tripId: tripId });
db.run("DELETE FROM notes WHERE trip_id = $tripId AND title = 'Reiseinfos'", { $tripId: tripId }); 
// Also clear sample document if exists to prevent duplicates
db.run("DELETE FROM documents WHERE trip_id = $tripId AND original_name = 'Packliste_Referenz.pdf'", { $tripId: tripId });

// 3. Equipment Items (TAMAC List)
const equipmentList = [
  // AUSRÜSTUNG
  { name: "Kleine Tasche (Deponierung Hotel)", category: "Ausrüstung", assignment: "both_individual" },
  { name: "Schlafsack (1000g Daune, -8°C)", category: "Ausrüstung", assignment: "both_individual", notes: "lt. EN13537 Daune 90/10, 650+ cuin" },
  { name: "Teleskopstöcke", category: "Ausrüstung", assignment: "both_individual" },
  { name: "Trekkingsandalen oder Turnschuhe", category: "Ausrüstung", assignment: "both_individual", notes: "Fürs Camp" },
  { name: "Tagesrucksack (25-30l)", category: "Ausrüstung", assignment: "both_individual", notes: "Für Wasser, Regenschutz, Verpflegung" },
  { name: "Robuste Reisetasche (max 15kg)", category: "Ausrüstung", assignment: "both_individual", notes: "Wasserdicht, wird getragen" },
  
  // SCHUHE
  { name: "Trekkingschuhe (Kat. B/C oder C)", category: "Schuhe", assignment: "both_individual", notes: "Im Flugzeug anziehen/Handgepäck!" },

  // BEKLEIDUNG
  { name: "Daunenjacke/-weste", category: "Bekleidung", assignment: "both_individual" },
  { name: "Funktionshose (wind-/wasserdicht)", category: "Bekleidung", assignment: "both_individual", notes: "Membranenverarbeitung" },
  { name: "Funktionssocken", category: "Bekleidung", assignment: "both_individual" },
  { name: "Halstuch / Neckgaiter", category: "Bekleidung", assignment: "both_individual" },
  { name: "T-Shirts / Hemden", category: "Bekleidung", assignment: "both_individual" },
  { name: "Überziehhandschuhe", category: "Bekleidung", assignment: "both_individual", notes: "wasserdicht, atmungsaktiv" },
  { name: "Fleece-/Windstopper-Mütze", category: "Bekleidung", assignment: "both_individual" },
  { name: "Funktionsjacke (wind-/wasserdicht)", category: "Bekleidung", assignment: "both_individual" },
  { name: "Funktionsunterwäsche", category: "Bekleidung", assignment: "both_individual", notes: "schnell trocknend" },
  { name: "Pullover / Jacke (Fleece)", category: "Bekleidung", assignment: "both_individual" },
  { name: "Trekkinghose (lang/knielang)", category: "Bekleidung", assignment: "both_individual" },
  { name: "Unterziehhandschuhe", category: "Bekleidung", assignment: "both_individual", notes: "Fleece oder Windstopper" },

  // ZUSÄTZLICHES
  { name: "Badesachen", category: "Zusätzliches", assignment: "both_individual", status: "optional" },
  { name: "Erste Hilfe Set", category: "Sicherheit", assignment: "shared", notes: "Blasenpflaster, Tape, Ohropax" },
  { name: "Kamera + Ladegerät", category: "Elektronik", assignment: "both_individual" },
  { name: "Smartphone + Ladegerät", category: "Elektronik", assignment: "both_individual" },
  { name: "LED-Stirnlampe + Batterien", category: "Elektronik", assignment: "both_individual" },
  { name: "Regenschutz (Poncho/Hülle)", category: "Zusätzliches", assignment: "both_individual" },
  { name: "Sonnenbrille", category: "Zusätzliches", assignment: "both_individual" },
  { name: "Sonnenhut", category: "Zusätzliches", assignment: "both_individual" },
  { name: "Toilettenpapier", category: "Hygiene", assignment: "shared" },
  { name: "Trinkflaschen (Gesamt 3L)", category: "Ausrüstung", assignment: "both_individual", notes: "Kein Einwegplastik! Stahl/Plastik/Blase" },
  { name: "Zwischenverpflegung", category: "Verpflegung", assignment: "both_individual", notes: "Müsliriegel, Schokolade, Nüsse" },
  { name: "Elektrolytgetränkepulver", category: "Verpflegung", assignment: "shared", status: "optional" },
  { name: "Insektenschutz", category: "Hygiene", assignment: "shared" },
  { name: "Kleines Nähzeug", category: "Zusätzliches", assignment: "shared", status: "optional" },
  { name: "Persönliche Medikamente", category: "Gesundheit", assignment: "both_individual" },
  { name: "Reiseapotheke", category: "Gesundheit", assignment: "shared" },
  { name: "Sonnencreme (LSF 30+)", category: "Hygiene", assignment: "shared" },
  { name: "Lippenschutzcreme (LSF 30+)", category: "Hygiene", assignment: "both_individual" },
  { name: "Toilettenartikel", category: "Hygiene", assignment: "both_individual" },
  { name: "Trink-/Thermosflasche (bruchfest)", category: "Ausrüstung", assignment: "both_individual", status: "optional", notes: "für heißen Tee am Gipfeltag" },
  { name: "Universaladapter", category: "Elektronik", assignment: "shared" },
  
  // EXTRAS
  { name: "Fernglas", category: "Extras", assignment: "shared", status: "optional" },
  { name: "Höhenmesser", category: "Extras", assignment: "shared", status: "optional" },
  { name: "Literatur / Buch", category: "Extras", assignment: "both_individual", status: "optional" },
  { name: "Feuchttücher", category: "Hygiene", assignment: "both_individual", notes: "Sehr wichtig für Katzenwäsche" },
  { name: "Karten", category: "Extras", assignment: "shared", status: "optional" },
  { name: "Taschenmesser", category: "Ausrüstung", assignment: "shared" },
  { name: "Reisedokumente (Pass, Vers., Tickets)", category: "Dokumente", assignment: "both_individual", notes: "Kopien anfertigen!" },
];

const itemStmt = db.prepare(`
  INSERT INTO equipment_items (trip_id, name, category, assignment, general_status, jonne_status, frank_status, notes)
  VALUES ($trip_id, $name, $category, $assignment, $general_status, $status, $status, $notes)
`);

console.log(`Seeding ${equipmentList.length} equipment items...`);

for (const item of equipmentList) {
  const initialStatus = item.status || "backlog";
  itemStmt.run({
    $trip_id: tripId,
    $name: item.name,
    $category: item.category,
    $assignment: item.assignment,
    $general_status: initialStatus,
    $status: initialStatus,
    $notes: item.notes || null
  });
}

// 4. Map Markers (Machame Route)
const markers = [
  { title: "Machame Gate", type: "route_waypoint", lat: -3.1666, lng: 37.25, elevation: 1800, day: 1, segment: "Start -> Machame Camp" },
  { title: "Machame Camp", type: "route_waypoint", lat: -3.1333, lng: 37.2666, elevation: 2835, day: 1, segment: "Start -> Machame Camp" },
  { title: "Shira Camp", type: "route_waypoint", lat: -3.1166, lng: 37.2166, elevation: 3750, day: 2, segment: "Machame Camp -> Shira Camp" },
  { title: "Lava Tower", type: "route_waypoint", lat: -3.0833, lng: 37.2333, elevation: 4600, day: 3, segment: "Shira -> Barranco (via Lava Tower)" },
  { title: "Barranco Camp", type: "route_waypoint", lat: -3.1, lng: 37.2833, elevation: 3900, day: 3, segment: "Shira -> Barranco" },
  { title: "Karanga Camp", type: "route_waypoint", lat: -3.0833, lng: 37.3166, elevation: 3995, day: 4, segment: "Barranco -> Karanga" },
  { title: "Barafu Camp", type: "route_waypoint", lat: -3.0666, lng: 37.35, elevation: 4673, day: 5, segment: "Karanga -> Barafu" },
  { title: "Uhuru Peak", type: "route_waypoint", lat: -3.0758, lng: 37.3533, elevation: 5895, day: 6, segment: "Summit Push" },
  { title: "Mweka Camp", type: "route_waypoint", lat: -3.1666, lng: 37.3333, elevation: 3100, day: 6, segment: "Descent" },
  { title: "Mweka Gate", type: "route_waypoint", lat: -3.2, lng: 37.35, elevation: 1640, day: 7, segment: "Finish" }
];

const markerStmt = db.prepare(`
  INSERT INTO map_markers (trip_id, title, lat, lng, type, day_index, elevation_m, segment_name)
  VALUES ($trip_id, $title, $lat, $lng, $type, $day, $elevation, $segment)
`);

console.log("Seeding map markers...");
for (const m of markers) {
  markerStmt.run({
    $trip_id: tripId,
    $title: m.title,
    $lat: m.lat,
    $lng: m.lng,
    $type: m.type,
    $day: m.day,
    $elevation: m.elevation,
    $segment: m.segment
  });
}

// 5. Demo Note
const noteStmt = db.prepare("INSERT INTO notes (trip_id, title, content, category, created_at) VALUES ($trip_id, $title, $content, 'General', CURRENT_TIMESTAMP)");
noteStmt.run({ $trip_id: tripId, $title: "Reiseinfos", $content: "Dies ist eine automatisch erstellte Notiz.\n\nHier können Flugdaten, Visum-Infos und weitere Details gespeichert werden." });

// 6. Demo Document (Entry only, file cannot be created easily via script without source)
// Just a placeholder entry so the list isn't empty, but download will fail if file is missing.
// Better: Don't insert fake document to avoid 404 errors.

console.log("Seed completed successfully (Items, Map, Notes).");
