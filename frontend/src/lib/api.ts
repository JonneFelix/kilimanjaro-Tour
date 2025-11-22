import type { EquipmentItem, Note, MapMarker, DocumentItem } from '../shared-types';

export const TRIP_ID = 1;

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

// Equipment
export const getEquipment = (tripId: number) => fetchJson<EquipmentItem[]>(`${API_BASE}/equipment?tripId=${tripId}`);
export const createEquipment = (data: Partial<EquipmentItem>) => fetchJson<EquipmentItem>(`${API_BASE}/equipment`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
export const updateEquipment = (id: number, data: Partial<EquipmentItem>) => fetchJson<EquipmentItem>(`${API_BASE}/equipment/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
export const deleteEquipment = (id: number) => fetchJson<{ success: true }>(`${API_BASE}/equipment/${id}`, { method: 'DELETE' });

// Notes
export const getNotes = (tripId: number) => fetchJson<Note[]>(`${API_BASE}/notes?tripId=${tripId}`);
export const createNote = (data: Partial<Note>) => fetchJson<Note>(`${API_BASE}/notes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
export const updateNote = (id: number, data: Partial<Note>) => fetchJson<Note>(`${API_BASE}/notes/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
export const deleteNote = (id: number) => fetchJson<{ success: true }>(`${API_BASE}/notes/${id}`, { method: 'DELETE' });

// Map Markers
export const getMarkers = (tripId: number) => fetchJson<MapMarker[]>(`${API_BASE}/map-markers?tripId=${tripId}`);
export const createMarker = (data: Partial<MapMarker>) => fetchJson<MapMarker>(`${API_BASE}/map-markers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
export const deleteMarker = (id: number) => fetchJson<{ success: true }>(`${API_BASE}/map-markers/${id}`, { method: 'DELETE' });

// Documents
export const getDocuments = (tripId: number) => fetchJson<DocumentItem[]>(`${API_BASE}/documents?tripId=${tripId}`);
export const createDocument = (formData: FormData) => fetchJson<DocumentItem>(`${API_BASE}/documents`, {
  method: 'POST',
  body: formData
});
export const deleteDocument = (id: number) => fetchJson<{ success: true }>(`${API_BASE}/documents/${id}`, { method: 'DELETE' });

