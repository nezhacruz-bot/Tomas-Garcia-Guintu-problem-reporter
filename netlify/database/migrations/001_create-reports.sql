CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  role TEXT,
  date TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);
