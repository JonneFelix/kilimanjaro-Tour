import { db, initDB } from "./db";

initDB();

const tripName = "Kilimanjaro 2025";
const existingTrip = db.query("SELECT * FROM trips WHERE name = $name").get({ $name: tripName }) as any;

if (existingTrip) {
  console.log("Trip already exists, skipping seed.");
  process.exit(0);
}

console.log("Seeding database...");

// 1. Create Trip
const tripStmt = db.prepare("INSERT INTO trips (name, created_at) VALUES ($name, CURRENT_TIMESTAMP) RETURNING id");
const trip = tripStmt.get({ $name: tripName }) as { id: number };
const tripId = trip.id;

// 2. Equipment Items
const items = [
  { name: "Wanderschuhe", category: "Kleidung", assignment: "both_individual", general_status: "backlog" },
  { name: "Schlafsack (-10°C)", category: "Schlafen", assignment: "both_individual", general_status: "to_buy" },
  { name: "Erste-Hilfe-Set", category: "Sicherheit", assignment: "shared", general_status: "ready_to_pack" },
  { name: "Powerbank", category: "Elektronik", assignment: "jonne", general_status: "packed" },
  { name: "Kamera", category: "Elektronik", assignment: "frank", general_status: "backlog" },
  { name: "Sonnencreme", category: "Hygiene", assignment: "shared", general_status: "to_buy" },
];

const itemStmt = db.prepare(`
  INSERT INTO equipment_items (trip_id, name, category, assignment, general_status, jonne_status, frank_status)
  VALUES ($trip_id, $name, $category, $assignment, $general_status, $status, $status)
`);

for (const item of items) {
  itemStmt.run({
    $trip_id: tripId,
    $name: item.name,
    $category: item.category,
    $assignment: item.assignment,
    $general_status: item.general_status,
    $status: item.general_status // default for both
  });
}

// 3. Map Markers (Machame Route)
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

// 4. Notes
const noteStmt = db.prepare("INSERT INTO notes (trip_id, title, content, category, created_at) VALUES ($trip_id, $title, $content, 'General', CURRENT_TIMESTAMP)");
noteStmt.run({ $trip_id: tripId, $title: "Reiseinfos", $content: "Flugdaten: ...\nVisum: ..." });

console.log("Seed completed.");

