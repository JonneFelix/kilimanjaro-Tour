export type UserId = 'jonne' | 'frank';

export type Assignment = 'jonne' | 'frank' | 'both_individual' | 'shared';

export type ItemStatus = 'backlog' | 'to_buy' | 'ready_to_pack' | 'packed' | 'optional' | 'not_needed';

export type SourceType = 'shop' | 'local_store' | 'borrow' | 'own' | 'other';

export type Trip = {
  id: number;
  name: string;
  created_at: string;
  description?: string;
};

export type EquipmentItem = {
  id: number;
  trip_id: number;
  name: string;
  category: string | null;
  assignment: Assignment;
  general_status: ItemStatus | null;
  jonne_status: ItemStatus | null;
  frank_status: ItemStatus | null;
  notes: string | null;
  source_type: SourceType | null;
  source_url: string | null;
};

export type Note = {
  id: number;
  trip_id: number;
  title: string;
  category: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export type MapMarkerType = 'route_waypoint' | 'custom';

export type MapMarker = {
  id: number;
  trip_id: number;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  type: MapMarkerType;
  day_index: number | null;
  elevation_m: number | null;
  distance_from_start_km: number | null;
  segment_name: string | null;
  created_at: string;
};

export type DocumentItem = {
  id: number;
  trip_id: number;
  original_name: string;
  stored_name: string;
  category: string | null;
  tags: string | null;
  created_at: string;
};

