-- Add credit_card_id column to credits table
ALTER TABLE credits
ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

-- Index for faster queries by credit card
CREATE INDEX idx_credits_credit_card_id ON credits(credit_card_id);
