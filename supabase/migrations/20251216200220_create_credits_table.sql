-- Create credits table (loans)
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  institution VARCHAR(100) NOT NULL,
  original_amount DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL,
  monthly_payment DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2),
  payment_day INTEGER NOT NULL CHECK (payment_day BETWEEN 1 AND 31),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own credits
CREATE POLICY "Users can view own credits"
  ON credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own credits
CREATE POLICY "Users can insert own credits"
  ON credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own credits
CREATE POLICY "Users can update own credits"
  ON credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own credits
CREATE POLICY "Users can delete own credits"
  ON credits
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_credits_user_id ON credits(user_id);