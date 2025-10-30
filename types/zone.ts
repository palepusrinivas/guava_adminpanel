// Zone Type Definitions

export interface Zone {
  id: number;
  readableId: string;
  name: string;
  polygonWkt: string;
  active: boolean;
}

export interface ZoneFormData {
  readableId: string;
  name: string;
  polygonWkt: string;
  active: boolean;
}

export interface ZoneCreatePayload extends ZoneFormData {
  id?: number;
}

export interface ZoneUpdatePayload extends ZoneFormData {
  id: number;
}

