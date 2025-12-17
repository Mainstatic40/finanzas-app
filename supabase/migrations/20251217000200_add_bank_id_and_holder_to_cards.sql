-- Add bank_id and holder_name to credit_cards
ALTER TABLE credit_cards
ADD COLUMN bank_id VARCHAR(50),
ADD COLUMN holder_name VARCHAR(100);

-- Add bank_id and holder_name to debit_cards
ALTER TABLE debit_cards
ADD COLUMN bank_id VARCHAR(50),
ADD COLUMN holder_name VARCHAR(100);

-- Add indexes for bank_id
CREATE INDEX idx_credit_cards_bank_id ON credit_cards(bank_id);
CREATE INDEX idx_debit_cards_bank_id ON debit_cards(bank_id);
