-- Add debit_card_id column to transactions table
ALTER TABLE transactions
ADD COLUMN debit_card_id UUID REFERENCES debit_cards(id) ON DELETE SET NULL;

-- Index for faster queries by debit card
CREATE INDEX idx_transactions_debit_card_id ON transactions(debit_card_id);
