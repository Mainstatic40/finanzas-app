-- Create credit_cards table
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  bank VARCHAR(100) NOT NULL,
  last_four_digits VARCHAR(4),
  credit_limit DECIMAL(12,2),
  current_balance DECIMAL(12,2) DEFAULT 0,
  cut_off_day INTEGER NOT NULL CHECK (cut_off_day BETWEEN 1 AND 31),
  payment_due_day INTEGER NOT NULL CHECK (payment_due_day BETWEEN 1 AND 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own credit cards
CREATE POLICY "Users can view own credit cards"
  ON credit_cards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own credit cards
CREATE POLICY "Users can insert own credit cards"
  ON credit_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own credit cards
CREATE POLICY "Users can update own credit cards"
  ON credit_cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own credit cards
CREATE POLICY "Users can delete own credit cards"
  ON credit_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
