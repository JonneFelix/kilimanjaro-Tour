import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import type { MapMarker } from '../shared-types';
import { getMarkers, createMarker, deleteMarker, TRIP_ID } from '../lib/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Custom Icons ---

const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const customMarkerIcon = L.divIcon({
  className: 'custom-marker-icon',
  html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

// --- Components ---

const AddMarkerController: React.FC<{ onAdd: (lat: number, lng: number) => void; active: boolean }> = ({ onAdd, active }) => {
  useMapEvents({
    click(e) {
      if (active) {
        onAdd(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

export const MapView: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMarker, setNewMarker] = useState<{lat: number, lng: number, title: string} | null>(null);

  const fetchMarkers = async () => {
    setLoading(true);
    try {
      const data = await getMarkers(TRIP_ID);
      // Sort markers: route markers first (by day/id), then custom
      // Route logic: sort by day_index if available, else id
      setMarkers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setNewMarker({ lat, lng, title: '' });
    setIsAdding(false); 
  };

  const saveMarker = async () => {
    if (!newMarker || !newMarker.title) return;
    try {
      await createMarker({
        trip_id: TRIP_ID,
        title: newMarker.title,
        lat: newMarker.lat,
        lng: newMarker.lng,
        type: 'custom',
        description: 'Eigener Marker'
      });
      setNewMarker(null);
      fetchMarkers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("Marker löschen?")) return;
      try {
          await deleteMarker(id);
          setMarkers(markers.filter(m => m.id !== id));
      } catch (e) { console.error(e); }
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  // Filter and sort route markers for the line
  const routeMarkers = markers
    .filter(m => m.type === 'route_waypoint')
    .sort((a, b) => {
      if (a.day_index !== b.day_index) return (a.day_index || 0) - (b.day_index || 0);
      return a.id - b.id;
    });

  const polylinePositions = routeMarkers.map(m => [m.lat, m.lng] as [number, number]);

  // Center map
  const center: [number, number] = markers.length > 0 
    ? [markers[0].lat, markers[0].lng] 
    : [-3.0674, 37.3556]; 

  return (
    <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-gray-200 relative shadow-sm">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route Line */}
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.6, dashArray: '10, 10' }} 
        />

        {/* Markers */}
        {markers.map((marker) => {
          let icon;
          if (marker.type === 'route_waypoint') {
            // Find index in routeMarkers for numbering
            const index = routeMarkers.findIndex(m => m.id === marker.id);
            icon = createNumberedIcon(index + 1);
          } else {
            icon = customMarkerIcon;
          }

          return (
            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-base mb-1">{marker.title}</h3>
                  {marker.type === 'route_waypoint' && (
                    <div className="flex gap-2 mb-2">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">Tag {marker.day_index}</span>
                      {marker.elevation_m && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{marker.elevation_m}m</span>}
                    </div>
                  )}
                  {marker.segment_name && <div className="text-xs text-gray-500 italic mb-2">{marker.segment_name}</div>}
                  
                  {marker.type === 'custom' && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <button onClick={() => handleDelete(marker.id)} className="text-red-500 text-xs flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded w-full transition-colors">
                          <Trash2 size={12}/> Marker löschen
                        </button>
                      </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <AddMarkerController onAdd={handleMapClick} active={isAdding} />
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${isAdding ? 'bg-red-500 text-white rotate-45' : 'bg-white text-blue-600 hover:bg-gray-50'}`}
          title="Marker hinzufügen"
        >
          <Plus />
        </button>
      </div>

      {/* Add Marker Modal */}
      {newMarker && (
        <div className="absolute inset-0 z-[2000] bg-black/20 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-80">
            <h3 className="font-bold mb-4">Neuer Marker</h3>
            <div className="text-xs text-gray-400 mb-4 font-mono bg-gray-50 p-2 rounded">
              {newMarker.lat.toFixed(5)}, {newMarker.lng.toFixed(5)}
            </div>
            <input 
              autoFocus
              type="text" 
              placeholder="Titel (z.B. Schöner Blick)" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newMarker.title}
              onChange={e => setNewMarker({...newMarker, title: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && saveMarker()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setNewMarker(null)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded">Abbrechen</button>
              <button onClick={saveMarker} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">Speichern</button>
            </div>
          </div>
        </div>
      )}
      
      {isAdding && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-[1000] text-sm animate-bounce flex items-center gap-2">
          <Plus size={16} />
          Klicke auf die Karte
        </div>
      )}
    </div>
  );
};
