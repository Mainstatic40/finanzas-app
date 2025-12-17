
# CLAUDE.md - FinTrack Development Guidelines

## Project Overview

**FinTrack** is a personal finance management web application for a single user. It tracks income, expenses, credit cards, active loans, and subscriptions with payment date visibility.

**Primary Goal:** Build a functional, maintainable app with minimal complexity. Cost optimization is critical—leverage free tiers wherever possible.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 18+ + TypeScript |
| UI | Shadcn/ui + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Hosting | Cloudflare Pages (frontend) + Supabase Cloud (backend) |
| Auth | Supabase Auth with Google OAuth |

## Project Setup Status

### Completed Setup ✅
- [x] Vite 7.x + React 19 + TypeScript initialized
- [x] Tailwind CSS v4 configured with PostCSS
- [x] Shadcn/ui initialized (style: new-york, base-color: slate, CSS variables: enabled)
- [x] Import alias `@/*` configured in tsconfig.json and vite.config.ts
- [x] Project folder structure created
- [x] ESLint configured
- [x] Environment variables (.env.local, .env.example)
- [x] Supabase client configured (`src/lib/supabase.ts`)
- [x] Auth hook created (`src/hooks/useAuth.ts`)
- [x] Supabase CLI initialized (`supabase/`)
- [x] Database migrations created (5 tables)

### Current Versions
```json
{
  "vite": "^7.2.4",
  "react": "^19.2.0",
  "typescript": "~5.9.3",
  "tailwindcss": "^4.1.18",
  "@supabase/supabase-js": "^2.88.0"
}
```

### Pending Setup
- [ ] React Router DOM
- [ ] Page components
- [ ] UI components

## Database Schema

### Tables (with RLS enabled)

| Table | Description |
|-------|-------------|
| `categories` | Income/expense categories with icon and color |
| `credit_cards` | Credit cards with limits, balance, cut-off and payment days |
| `credits` | Active loans with payment tracking |
| `subscriptions` | Recurring subscriptions linked to cards/categories |
| `transactions` | Income and expense records |

### Migrations
```
supabase/migrations/
├── 20251216195930_create_categories_table.sql
├── 20251216200121_create_credit_cards_table.sql
├── 20251216200220_create_credits_table.sql
├── 20251216200314_create_subscriptions_table.sql
└── 20251216200411_create_transactions_table.sql
```

### Key Relationships
- All tables have `user_id` → `auth.users(id)` with CASCADE delete
- `transactions` → `categories`, `credit_cards` (SET NULL on delete)
- `subscriptions` → `categories`, `credit_cards` (SET NULL on delete)

### RLS Policies
All tables have 4 policies: SELECT, INSERT, UPDATE, DELETE
- Users can only access their own records (`auth.uid() = user_id`)

## Core Principles

### KISS (Keep It Simple, Stupid)
- Before implementing anything, ask: "Is there a simpler way?"
- No premature abstractions
- No design patterns unless they solve a current, concrete problem
- If a solution feels complex, step back and simplify

### YAGNI (You Aren't Gonna Need It)
- Write code for today's requirements, not hypothetical futures
- No "just in case" validations
- No handlers for non-existent edge cases
- No configuration for hypothetical scenarios
- Delete commented-out code—git remembers

### DRY (With Judgment)
- Duplicate code is acceptable if the two instances will likely evolve differently
- Extract shared logic only after seeing the same pattern 3+ times
- Two similar functions are not necessarily duplicates—they may serve different purposes

## Code Style Rules

### General

```typescript
// ✅ DO: Use native APIs first
const uniqueItems = [...new Set(items)];
const sortedByDate = items.toSorted((a, b) => a.date - b.date);

// ❌ DON'T: Add lodash for things JS does natively
import _ from 'lodash';
const uniqueItems = _.uniq(items);
```

```typescript
// ✅ DO: Small functions, single responsibility
function calculateMonthlyTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

// ❌ DON'T: Functions that do multiple things
function processTransactionsAndUpdateUIAndSendAnalytics() { ... }
```

```typescript
// ✅ DO: Descriptive names that eliminate comment need
const isPaymentOverdue = dueDate < today;
const activeSubscriptions = subscriptions.filter(s => s.isActive);

// ❌ DON'T: Cryptic names that require comments
const flag = d < t; // check if overdue
const subs = s.filter(x => x.a);
```

### Error Handling

```typescript
// ✅ DO: Handle specific errors
async function fetchTransactions() {
  const { data, error } = await supabase.from('transactions').select();
  
  if (error?.code === 'PGRST116') {
    return []; // No rows found is okay
  }
  if (error) {
    throw new TransactionFetchError(error.message);
  }
  return data;
}

// ❌ DON'T: Generic try-catch that swallows everything
async function fetchTransactions() {
  try {
    const { data } = await supabase.from('transactions').select();
    return data;
  } catch (e) {
    console.log('error');
    return [];
  }
}
```

### Abstractions

```typescript
// ✅ DO: Create interfaces when you have 2+ implementations
// You have CreditCard and Subscription that both need payment tracking
interface Payable {
  nextPaymentDate: Date;
  amount: number;
}

// ❌ DON'T: Create interfaces "just in case"
// Only have Transaction, but creating interface anyway
interface ITransaction { ... }
interface ITransactionRepository { ... }
interface ITransactionService { ... }
```

## React Specific Rules

### Components

```typescript
// ✅ DO: Functional components always
function TransactionCard({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>{transaction.description}</CardHeader>
      <CardContent>${transaction.amount}</CardContent>
    </Card>
  );
}

// ❌ DON'T: Class components
class TransactionCard extends React.Component { ... }
```

```typescript
// ✅ DO: Composition over inheritance
function PaymentCard({ children, dueDate }: Props) {
  return (
    <Card className={isOverdue(dueDate) ? 'border-red-500' : ''}>
      {children}
    </Card>
  );
}

// Use it
<PaymentCard dueDate={credit.paymentDate}>
  <CreditDetails credit={credit} />
</PaymentCard>
```

### State Management

```typescript
// ✅ DO: Local state first
function TransactionForm() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  // ...
}

// ❌ DON'T: Global state for component-specific data
// Don't put form state in a global store
```

```typescript
// ✅ DO: Derive state when possible
function TransactionList({ transactions }: Props) {
  // Derived, not stored
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // ...
}

// ❌ DON'T: Store what you can calculate
const [transactions, setTransactions] = useState([]);
const [totalExpenses, setTotalExpenses] = useState(0); // Redundant!
```

### Hooks

```typescript
// ✅ DO: Custom hooks only when logic repeats 3+ times
// After seeing this pattern in TransactionList, CreditList, SubscriptionList:
function useSupabaseQuery<T>(table: string, query?: object) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // ...
}

// ❌ DON'T: Extract hooks prematurely
// Used in only one component? Keep it inline.
```

### Effects

```typescript
// ✅ DO: Direct event handlers when possible
function DeleteButton({ onDelete }: Props) {
  return (
    <Button onClick={() => onDelete()}>
      Delete
    </Button>
  );
}

// ❌ DON'T: useEffect for things events can handle
function DeleteButton({ shouldDelete, onDelete }: Props) {
  useEffect(() => {
    if (shouldDelete) {
      onDelete();
    }
  }, [shouldDelete]);
  // ...
}
```

```typescript
// ✅ DO: useEffect only for synchronization with external systems
useEffect(() => {
  // Fetch data on mount
  fetchTransactions().then(setTransactions);
}, []);

useEffect(() => {
  // Sync with Supabase realtime
  const subscription = supabase
    .channel('transactions')
    .on('postgres_changes', { event: '*', schema: 'public' }, handleChange)
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

## File Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn components (don't modify)
│   ├── layout/                # App shell components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── dashboard/             # Dashboard widgets and cards
│   ├── transactions/          # Feature components
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   └── TransactionCard.tsx
│   ├── credit-cards/
│   ├── credits/
│   └── subscriptions/
├── hooks/                     # Only shared hooks (3+ usages)
│   └── useAuth.ts
├── lib/
│   ├── supabase.ts           # Supabase client instance
│   └── utils.ts              # Only truly shared utilities (cn helper)
├── pages/                     # Route components
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   └── ...
├── types/
│   └── database.ts           # Supabase generated types
└── App.tsx
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `TransactionCard.tsx` |
| Hooks | camelCase with `use` prefix | `useTransactions.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Transaction`, `CreditCard` |
| Constants | UPPER_SNAKE_CASE | `MAX_TRANSACTIONS_PER_PAGE` |
| Event handlers | `handle` + Event | `handleSubmit`, `handleDelete` |
| Boolean variables | `is`/`has`/`should` prefix | `isLoading`, `hasError` |

## Supabase Conventions

### Queries

```typescript
// ✅ DO: Use the generated types
import { Database } from '@/types/database';

type Transaction = Database['public']['Tables']['transactions']['Row'];

// ✅ DO: Select only needed columns
const { data } = await supabase
  .from('transactions')
  .select('id, amount, description, date')
  .eq('type', 'expense');

// ❌ DON'T: Select everything when you need 3 fields
const { data } = await supabase
  .from('transactions')
  .select('*');
```

### Error Handling

```typescript
// ✅ DO: Always check for errors
const { data, error } = await supabase.from('transactions').select();

if (error) {
  // Handle appropriately based on context
  throw error;
}

// ❌ DON'T: Ignore errors
const { data } = await supabase.from('transactions').select();
// Proceed assuming data exists...
```

## TypeScript Rules

```typescript
// ✅ DO: Let TypeScript infer when obvious
const count = 5;                    // inferred as number
const items = [1, 2, 3];           // inferred as number[]
const doubled = items.map(x => x * 2); // inferred

// ✅ DO: Explicit types for function signatures
function calculateTotal(transactions: Transaction[]): number {
  // ...
}

// ❌ DON'T: Over-annotate everything
const count: number = 5;
const items: number[] = [1, 2, 3];
const doubled: number[] = items.map((x: number): number => x * 2);
```

```typescript
// ✅ DO: Use type for object shapes, interface for extendable contracts
type TransactionFormData = {
  amount: string;
  description: string;
  categoryId: string;
};

// ❌ DON'T: interface for everything
interface ITransactionFormData { ... }
```

## Dependencies Policy

Before adding any dependency, answer these questions:

1. **Can native JS/TS do this?** → Use native
2. **Does React already provide this?** → Use React
3. **Does Shadcn/ui have this component?** → Use Shadcn
4. **Is this a one-time use?** → Write it yourself
5. **Is this complex enough to warrant a library?** → Consider adding

### Pre-approved Dependencies
- `@supabase/supabase-js` - Required for backend
- `react-router-dom` - Routing
- `date-fns` - Date manipulation (native Date API is painful)
- `zod` - Form validation (pairs well with react-hook-form)
- `react-hook-form` - Form state management
- `recharts` - Charts for dashboard

### Forbidden Patterns
- No state management libraries (Redux, Zustand, Jotai) unless absolutely necessary
- No CSS-in-JS libraries (we have Tailwind)
- No axios (fetch is fine)
- No lodash (use native methods)
- No moment.js (use date-fns)

## Git Commit Messages

```
feat: add transaction filtering by category
fix: correct date calculation for credit payment due
refactor: simplify subscription renewal logic
chore: update dependencies
docs: add API documentation for edge functions
```

## Testing Approach

- Write tests for business logic (calculations, transformations)
- Skip tests for simple CRUD operations
- Test hooks that contain complex logic
- Don't test implementation details
- Integration tests for critical user flows

## Performance Guidelines

- Use `React.memo` only after measuring performance issues
- Avoid premature optimization
- Lazy load routes with `React.lazy`
- Use Supabase's built-in pagination instead of loading all data

## Security Reminders

- Never expose Supabase service key in frontend
- Always use Row Level Security (RLS) policies
- Validate user input with Zod before sending to database
- Store only last 4 digits of credit cards
- Use environment variables for all secrets

---

## Quick Reference Card

| Situation | Action |
|-----------|--------|
| Need a utility function | Check if native JS/TS can do it first |
| State needed in one component | `useState` |
| State needed in parent + children | Lift state up, pass as props |
| State needed across unrelated components | Consider context (sparingly) |
| Side effect on user action | Event handler |
| Side effect on mount/dependency change | `useEffect` |
| Same logic in 3+ components | Extract to custom hook |
| Same UI in 3+ places | Extract to component |
| Complex form | `react-hook-form` + `zod` |
| Date formatting/manipulation | `date-fns` |
| Data fetching | Supabase client directly or simple custom hook |

---

*Remember: The best code is code you don't have to write. Keep it simple.*
