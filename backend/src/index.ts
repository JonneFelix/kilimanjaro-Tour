import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { db, initDB } from "./db";
import { join } from "path";
import { write } from "bun";

// Initialize DB
initDB();

const app = new Hono();

app.use("/*", cors());

// Serve Uploads
app.use("/uploads/*", serveStatic({ root: "./" })); // serves from backend root, so /uploads maps to ./uploads

// API Routes
const api = new Hono();

// --- Equipment ---
api.get("/equipment", (c) => {
  const tripId = c.req.query("tripId");
  if (!tripId) return c.json({ error: "Missing tripId" }, 400);
  
  const items = db.query("SELECT * FROM equipment_items WHERE trip_id = $tripId").all({ $tripId: tripId });
  return c.json(items);
});

api.post("/equipment", async (c) => {
  const body = await c.req.json();
  const { trip_id, name, category, assignment, general_status, jonne_status, frank_status, notes, source_type, source_url } = body;

  const stmt = db.prepare(`
    INSERT INTO equipment_items (trip_id, name, category, assignment, general_status, jonne_status, frank_status, notes, source_type, source_url)
    VALUES ($trip_id, $name, $category, $assignment, $general_status, $jonne_status, $frank_status, $notes, $source_type, $source_url)
    RETURNING *
  `);

  const result = stmt.get({
    $trip_id: trip_id,
    $name: name,
    $category: category || null,
    $assignment: assignment,
    $general_status: general_status || null,
    $jonne_status: jonne_status || null,
    $frank_status: frank_status || null,
    $notes: notes || null,
    $source_type: source_type || null,
    $source_url: source_url || null,
  });

  return c.json(result);
});

api.put("/equipment/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  
  // Dynamically build update query based on fields provided
  const keys = Object.keys(body).filter(k => k !== 'id');
  if (keys.length === 0) return c.json({ error: "No fields to update" }, 400);

  const setClause = keys.map(k => `${k} = $${k}`).join(", ");
  const params = keys.reduce((acc, k) => ({ ...acc, [`$${k}`]: body[k] }), { $id: id });

  const stmt = db.prepare(`UPDATE equipment_items SET ${setClause} WHERE id = $id RETURNING *`);
  const result = stmt.get(params);

  return c.json(result);
});

api.delete("/equipment/:id", (c) => {
  const id = c.req.param("id");
  db.run("DELETE FROM equipment_items WHERE id = $id", { $id: id });
  return c.json({ success: true });
});

// --- Notes ---
api.get("/notes", (c) => {
  const tripId = c.req.query("tripId");
  if (!tripId) return c.json({ error: "Missing tripId" }, 400);
  const notes = db.query("SELECT * FROM notes WHERE trip_id = $tripId ORDER BY updated_at DESC").all({ $tripId: tripId });
  return c.json(notes);
});

api.post("/notes", async (c) => {
  const { trip_id, title, category, content } = await c.req.json();
  const stmt = db.prepare(`
    INSERT INTO notes (trip_id, title, category, content, created_at, updated_at)
    VALUES ($trip_id, $title, $category, $content, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `);
  const result = stmt.get({ $trip_id: trip_id, $title: title, $category: category, $content: content });
  return c.json(result);
});

api.put("/notes/:id", async (c) => {
  const id = c.req.param("id");
  const { title, category, content } = await c.req.json();
  const stmt = db.prepare(`
    UPDATE notes SET title = $title, category = $category, content = $content, updated_at = CURRENT_TIMESTAMP
    WHERE id = $id
    RETURNING *
  `);
  const result = stmt.get({ $id: id, $title: title, $category: category, $content: content });
  return c.json(result);
});

api.delete("/notes/:id", (c) => {
  const id = c.req.param("id");
  db.run("DELETE FROM notes WHERE id = $id", { $id: id });
  return c.json({ success: true });
});

// --- Map Markers ---
api.get("/map-markers", (c) => {
  const tripId = c.req.query("tripId");
  if (!tripId) return c.json({ error: "Missing tripId" }, 400);
  const markers = db.query("SELECT * FROM map_markers WHERE trip_id = $tripId").all({ $tripId: tripId });
  return c.json(markers);
});

api.post("/map-markers", async (c) => {
  const body = await c.req.json();
  // ... similar generic insert or specific fields
  const { trip_id, title, description, lat, lng, type, day_index, elevation_m, distance_from_start_km, segment_name } = body;
  const stmt = db.prepare(`
    INSERT INTO map_markers (trip_id, title, description, lat, lng, type, day_index, elevation_m, distance_from_start_km, segment_name)
    VALUES ($trip_id, $title, $description, $lat, $lng, $type, $day_index, $elevation_m, $distance_from_start_km, $segment_name)
    RETURNING *
  `);
  const result = stmt.get({
    $trip_id: trip_id,
    $title: title,
    $description: description || null,
    $lat: lat,
    $lng: lng,
    $type: type,
    $day_index: day_index || null,
    $elevation_m: elevation_m || null,
    $distance_from_start_km: distance_from_start_km || null,
    $segment_name: segment_name || null
  });
  return c.json(result);
});

api.delete("/map-markers/:id", (c) => {
  const id = c.req.param("id");
  db.run("DELETE FROM map_markers WHERE id = $id", { $id: id });
  return c.json({ success: true });
});

// --- Documents ---
api.get("/documents", (c) => {
  const tripId = c.req.query("tripId");
  if (!tripId) return c.json({ error: "Missing tripId" }, 400);
  const docs = db.query("SELECT * FROM documents WHERE trip_id = $tripId ORDER BY created_at DESC").all({ $tripId: tripId });
  return c.json(docs);
});

api.post("/documents", async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  const trip_id = body['trip_id'];
  const category = body['category'] as string;
  const tags = body['tags'] as string;

  if (file instanceof File) {
    const originalName = file.name;
    const storedName = `${Date.now()}-${originalName}`;
    const arrayBuffer = await file.arrayBuffer();
    
    // Write to uploads directory
    await write(join("uploads", storedName), arrayBuffer);

    const stmt = db.prepare(`
      INSERT INTO documents (trip_id, original_name, stored_name, category, tags)
      VALUES ($trip_id, $original_name, $stored_name, $category, $tags)
      RETURNING *
    `);
    const result = stmt.get({
      $trip_id: trip_id,
      $original_name: originalName,
      $stored_name: storedName,
      $category: category || null,
      $tags: tags || null
    });
    return c.json(result);
  }
  return c.json({ error: "No file uploaded" }, 400);
});

api.delete("/documents/:id", (c) => {
  const id = c.req.param("id");
  // Ideally delete file from disk too, but keeping it simple for now (or add it if easy)
  const doc = db.query("SELECT stored_name FROM documents WHERE id = $id").get({ $id: id }) as { stored_name: string };
  if (doc) {
    // try to delete file?
    // Bun doesn't have a simple 'unlink' in 'bun' module yet? Use 'node:fs'
    // import { unlink } from "node:fs/promises";
    // await unlink(join("uploads", doc.stored_name));
  }
  db.run("DELETE FROM documents WHERE id = $id", { $id: id });
  return c.json({ success: true });
});

// Mount API
app.route("/api", api);

// Serve Frontend (Static) - Fallback for SPA
app.use("/*", serveStatic({ root: "./frontend/dist" })); // serve dist folder
app.get("*", serveStatic({ path: "./frontend/dist/index.html" })); // fallback to index.html

const port = process.env.PORT || 3000;
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

