-- Add subscription_type column for categorizing subscriptions (streaming, music, ai, courses, etc.)
ALTER TABLE subscriptions
ADD COLUMN subscription_type VARCHAR(50);

-- Add debit_card_id column to link subscriptions to debit cards
ALTER TABLE subscriptions
ADD COLUMN debit_card_id UUID REFERENCES debit_cards(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_subscriptions_subscription_type ON subscriptions(subscription_type);
CREATE INDEX idx_subscriptions_debit_card_id ON subscriptions(debit_card_id);
