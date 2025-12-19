-- Add account_email and notes columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN account_email VARCHAR(255),
ADD COLUMN notes TEXT;
