-- Add payment_received column to pos_sales table
ALTER TABLE pos_sales 
ADD COLUMN IF NOT EXISTS payment_received BOOLEAN DEFAULT false;

-- Add payment_received column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_received BOOLEAN DEFAULT false;

-- Add payment_received_at timestamp for tracking when payment was received
ALTER TABLE pos_sales 
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pos_sales_payment_received ON pos_sales(payment_received);
CREATE INDEX IF NOT EXISTS idx_orders_payment_received ON orders(payment_received);

