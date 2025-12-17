-- Create debit_cards table
CREATE TABLE debit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  bank VARCHAR(100) NOT NULL,
  last_four_digits VARCHAR(4),
  current_balance DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE debit_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own debit cards
CREATE POLICY "Users can view own debit cards"
  ON debit_cards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own debit cards
CREATE POLICY "Users can insert own debit cards"
  ON debit_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own debit cards
CREATE POLICY "Users can update own debit cards"
  ON debit_cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own debit cards
CREATE POLICY "Users can delete own debit cards"
  ON debit_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user_id
CREATE INDEX idx_debit_cards_user_id ON debit_cards(user_id);
