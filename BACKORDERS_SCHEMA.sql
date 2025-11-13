-- Backorders table for tracking products that need to be ordered
CREATE TABLE IF NOT EXISTS backorders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity_ordered INTEGER NOT NULL DEFAULT 1,
  supplier VARCHAR(255),
  expected_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, ordered, received
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_backorders_status ON backorders(status);
CREATE INDEX IF NOT EXISTS idx_backorders_product_name ON backorders(product_name);

-- Enable RLS
ALTER TABLE backorders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage backorders
CREATE POLICY "Authenticated users can manage backorders"
  ON backorders FOR ALL
  USING (auth.role() = 'authenticated');

