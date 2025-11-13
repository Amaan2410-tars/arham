-- Add payment_status column to pos_sales table (pending, received, due)
ALTER TABLE pos_sales 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add payment_status column to orders table (pending, received, due)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Keep payment_received for backward compatibility (will be calculated from payment_status)
ALTER TABLE pos_sales 
ADD COLUMN IF NOT EXISTS payment_received BOOLEAN DEFAULT false;

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

