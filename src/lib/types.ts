export type Category = 'Bar' | 'Pasticceria' | 'Ristorante' | 'Pizzeria' | 'Gelateria' | 'Altro';

export const CATEGORIES: Category[] = ['Bar', 'Pasticceria', 'Ristorante', 'Pizzeria', 'Gelateria', 'Altro'];

export type Merchant = {
  id: string;
  name: string;
  category: Category;
  address: string | null;
  points_per_visit: number;
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  trial_ends_at: string;
  pilot: boolean;
};

export type Membership = {
  merchant_id: string;
  role: 'owner' | 'staff';
  merchants: Merchant;
};

export type Card = {
  merchant_id: string;
  merchant_name: string;
  category: Category;
  address: string | null;
  balance: number;
  last_activity: string;
  next_reward_title: string | null;
  next_reward_cost: number | null;
  reward_available: boolean;
};

export type Reward = {
  id: string;
  merchant_id: string;
  title: string;
  cost_points: number;
  active: boolean;
};

export type LedgerKind = 'EARN' | 'REDEEM' | 'REVERSAL';

export type HistoryRow = {
  id: string;
  kind: LedgerKind;
  points: number;
  reward_title: string | null;
  created_at: string;
};

export type ActivityRow = HistoryRow & {
  customer_name: string;
  reversed: boolean;
};

export type CustomerLookup = {
  display_name: string;
  balance: number;
  visits: number;
  can_operate: boolean;
};

export type MerchantStats = {
  scans_7d: number;
  customers_7d: number;
  redemptions_7d: number;
  customers_total: number;
  returning_customers: number;
};
