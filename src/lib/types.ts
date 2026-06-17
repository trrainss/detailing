export interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Request {
  id: string;
  client_name: string;
  client_phone: string;
  service_id: string;
  status: 'new' | 'in_progress' | 'done' | 'cancelled';
  created_at: string;
  service?: Service;
}

export interface RequestWithService extends Request {
  service: Service;
}
