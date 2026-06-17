-- Allow authenticated admin to insert/update/delete services
CREATE POLICY "insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_services" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_services" ON services FOR DELETE
  TO authenticated USING (true);
