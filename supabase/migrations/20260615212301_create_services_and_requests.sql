-- Services table (pre-populated detailing services)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'car',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Requests table (client submissions)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES services(id),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Services: anyone can read (public link page)
CREATE POLICY "read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

-- Requests: anyone can insert (form submission)
CREATE POLICY "insert_requests" ON requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Requests: only authenticated can read/update/delete (admin)
CREATE POLICY "select_requests" ON requests FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "update_requests" ON requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_requests" ON requests FOR DELETE
  TO authenticated USING (true);

-- Pre-populate services
INSERT INTO services (name, description, icon, display_order) VALUES
('Полировка кузова', 'Восстановление блеска и защита ЛКП', 'sparkles', 1),
('Нанокерамика', 'Нанокерамическое покрытие на 3+ года', 'shield', 2),
('Химчистка салона', 'Глубокая чистка кожи, текстиля и пластика', 'armchair', 3),
('Пленка PPF', 'Защитная полиуретановая пленка', 'shield-check', 4),
('Тонировка', 'Пленочная тонировка по ГОСТу', 'eye-off', 5),
('Ремонт кожи', 'Восстановление кожаных элементов салона', 'paintbrush', 6);
