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

// 2. Clear existing Equipment Items for this trip
console.log("Clearing existing equipment...");
db.run("DELETE FROM equipment_items WHERE trip_id = $tripId", { $tripId: tripId });

// 3. Define New Items from TAMAC List
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

// 4. Insert Items
const itemStmt = db.prepare(`
  INSERT INTO equipment_items (trip_id, name, category, assignment, general_status, jonne_status, frank_status, notes)
  VALUES ($trip_id, $name, $category, $assignment, $general_status, $status, $status, $notes)
`);

console.log(`Seeding ${equipmentList.length} items...`);

for (const item of equipmentList) {
  const initialStatus = item.status || "backlog"; // Default status
  
  itemStmt.run({
    $trip_id: tripId,
    $name: item.name,
    $category: item.category,
    $assignment: item.assignment,
    $general_status: initialStatus,
    $status: initialStatus, // Init individual status same as general
    $notes: item.notes || null
  });
}

console.log("Pack list updated successfully from TAMAC Ausrüstungsliste.");

