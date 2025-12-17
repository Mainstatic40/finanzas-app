-- Add credit_id column to transactions table
ALTER TABLE transactions
ADD COLUMN credit_id UUID REFERENCES credits(id) ON DELETE SET NULL;

-- Index for faster queries by credit
CREATE INDEX idx_transactions_credit_id ON transactions(credit_id);
