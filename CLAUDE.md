# FinTrack - Aplicacion de Finanzas Personales

## Stack Tecnologico
- Frontend: Vite + React 18 + TypeScript
- UI: Tailwind CSS + Shadcn/ui
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Autenticacion: Google OAuth

## Estructura del Proyecto
```
fintrack/
├── public/
│   └── bank-logos/          # Logos de bancos (PNG)
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes Shadcn + CardVisual, ServiceLogo
│   │   ├── layout/          # MainLayout, Sidebar, ProtectedRoute
│   │   ├── dashboard/       # MonthlyBalance, CardsOverview, UpcomingPayments, ExpensesByCategory
│   │   ├── transactions/    # TransactionForm, TransactionList
│   │   ├── credit-cards/    # CreditCardForm, CreditCardList
│   │   ├── debit-cards/     # DebitCardForm, DebitCardList
│   │   ├── credits/         # CreditForm, CreditList
│   │   ├── subscriptions/   # SubscriptionForm, SubscriptionList
│   │   ├── categories/      # CategoryForm, CategoryList
│   │   └── calendar/        # PaymentCalendar, DayPaymentsDialog
│   ├── hooks/
│   │   └── useAuth.ts       # Hook de autenticacion
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase
│   │   ├── utils.ts         # Utilidad cn() para clases
│   │   ├── icons.ts         # Helper para iconos de categorias
│   │   ├── bank-styles.ts   # Estilos visuales por banco
│   │   ├── service-logos.ts # Mapeo de logos de servicios
│   │   └── subscription-types.ts # Tipos de suscripcion y providers
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Cards.tsx        # Unifica credito y debito con Tabs
│   │   ├── Credits.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Calendar.tsx     # Calendario visual de pagos
│   │   └── Categories.tsx
│   └── types/
│       └── database.ts      # Tipos generados de Supabase
├── supabase/
│   └── migrations/          # Migraciones SQL
└── CLAUDE.md
```

## Base de Datos (Tablas con RLS)
- **categories**: Categorias de ingresos/gastos con icono y color
- **credit_cards**: Tarjetas de credito con bank_id, limite, saldo, dias corte/pago
- **debit_cards**: Tarjetas de debito con bank_id y saldo
- **credits**: Creditos/prestamos vinculados a tarjetas (MSI)
- **subscriptions**: Suscripciones recurrentes con tipo y provider
- **transactions**: Transacciones con tipo income/expense/credit_payment

### Relaciones Clave
- Todas las tablas tienen `user_id` → `auth.users(id)` con CASCADE delete
- `transactions` → `categories`, `credit_cards`, `debit_cards`, `credits` (SET NULL on delete)
- `subscriptions` → `categories`, `credit_cards` (SET NULL on delete)
- `credits` → `credit_cards` (SET NULL on delete)

## Logica de Negocio Importante

### Tarjetas de Credito
- current_balance = monto usado/comprometido
- disponible = credit_limit - current_balance
- Al crear credito MSI: suma original_amount al current_balance de la tarjeta
- Al pagar credito completamente: libera el monto en la tarjeta

### Creditos (MSI)
- Vinculados a una tarjeta de credito
- Los pagos reducen current_balance del credito
- Cuando balance llega a 0: is_active = false, libera linea de la tarjeta

### Transacciones
- Tipo ingreso + debito: suma saldo a tarjeta
- Tipo gasto + debito: resta saldo de tarjeta
- Tipo gasto + credito (sin MSI): suma al usado de la tarjeta
- Tipo pago de credito: reduce saldo del credito, puede liberar tarjeta

## Componentes Visuales Especiales

### CardVisual (src/components/ui/CardVisual.tsx)
- Tarjeta con aspecto fisico realista
- Efecto flip 3D para mostrar detalles/acciones
- Estilos por banco definidos en bank-styles.ts
- Props: type, bankId, cardName, holderName, lastFourDigits, currentBalance, etc.

### ServiceLogo (src/components/ui/ServiceLogo.tsx)
- Logos de servicios de suscripcion
- Usa @icons-pack/react-simple-icons
- Fallback a Globe si no encuentra el servicio

### PaymentCalendar (src/components/calendar/PaymentCalendar.tsx)
- Calendario visual estilo Google Calendar para pagos del mes
- Muestra creditos y suscripciones con chips de colores:
  - Azul (bg-blue-100/text-blue-700): creditos
  - Morado (bg-purple-100/text-purple-700): suscripciones
- Navegacion entre meses con formato español (MMMM yyyy)
- Click en dia abre modal con detalles de pagos
- Footer con resumen: total del mes + conteo por tipo
- Props: month (Date), onMonthChange ((date: Date) => void)

### DayPaymentsDialog (src/components/calendar/DayPaymentsDialog.tsx)
- Modal para mostrar pagos de un dia especifico
- Header con fecha formateada ("Miercoles 15 de Diciembre")
- Lista de pagos con icono, nombre, badge de tarjeta y monto
- Footer con total del dia
- Props: isOpen, onClose, date, payments[]

## Logica de Calculo de Pagos

### Creditos
- Se muestran en su `payment_day` de cada mes
- Todos los creditos activos se pagan mensualmente

### Suscripciones (segun billing_cycle)
- **monthly**: se cobra en `billing_day` cada mes
- **weekly**: se cobra cada semana en el dia correspondiente
- **yearly**: se cobra solo si `next_billing_date` cae en el mes

### Auto-calculo de next_billing_date (SubscriptionForm)
- Al cambiar `billing_day` o `billing_cycle`, se calcula automaticamente
- monthly: si el dia ya paso → proximo mes, si no → mes actual
- weekly: proximo dia de la semana correspondiente
- yearly: si ya paso este año → proximo año
- El usuario puede editar manualmente para casos especiales (pruebas gratuitas)

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
import _ from "lodash";
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
const activeSubscriptions = subscriptions.filter((s) => s.isActive);

// ❌ DON'T: Cryptic names that require comments
const flag = d < t; // check if overdue
const subs = s.filter((x) => x.a);
```

### Error Handling

```typescript
// ✅ DO: Handle specific errors
async function fetchTransactions() {
  const { data, error } = await supabase.from("transactions").select();

  if (error?.code === "PGRST116") {
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
    const { data } = await supabase.from("transactions").select();
    return data;
  } catch (e) {
    console.log("error");
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
    <Card className={isOverdue(dueDate) ? "border-red-500" : ""}>
      {children}
    </Card>
  );
}

// Use it
<PaymentCard dueDate={credit.paymentDate}>
  <CreditDetails credit={credit} />
</PaymentCard>;
```

### State Management

```typescript
// ✅ DO: Local state first
function TransactionForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
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
    .filter((t) => t.type === "expense")
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
  return <Button onClick={() => onDelete()}>Delete</Button>;
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
    .channel("transactions")
    .on("postgres_changes", { event: "*", schema: "public" }, handleChange)
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## Dependencias Principales
- @supabase/supabase-js
- react-router-dom
- react-hook-form + zod
- date-fns
- lucide-react
- @icons-pack/react-simple-icons

## Comandos Utiles
```bash
npm run dev                    # Servidor de desarrollo
npx supabase db push          # Aplicar migraciones
npx supabase gen types typescript --linked > src/types/database.ts  # Regenerar tipos
```

## Naming Conventions

| Element           | Convention                  | Example                        |
| ----------------- | --------------------------- | ------------------------------ |
| Components        | PascalCase                  | `TransactionCard.tsx`          |
| Hooks             | camelCase with `use` prefix | `useTransactions.ts`           |
| Utilities         | camelCase                   | `formatCurrency.ts`            |
| Types             | PascalCase                  | `Transaction`, `CreditCard`    |
| Constants         | UPPER_SNAKE_CASE            | `MAX_TRANSACTIONS_PER_PAGE`    |
| Event handlers    | `handle` + Event            | `handleSubmit`, `handleDelete` |
| Boolean variables | `is`/`has`/`should` prefix  | `isLoading`, `hasError`        |

## Supabase Conventions

### Queries

```typescript
// ✅ DO: Use the generated types
import { Database } from "@/types/database";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// ✅ DO: Select only needed columns
const { data } = await supabase
  .from("transactions")
  .select("id, amount, description, date")
  .eq("type", "expense");

// ❌ DON'T: Select everything when you need 3 fields
const { data } = await supabase.from("transactions").select("*");
```

### Error Handling

```typescript
// ✅ DO: Always check for errors
const { data, error } = await supabase.from("transactions").select();

if (error) {
  // Handle appropriately based on context
  throw error;
}

// ❌ DON'T: Ignore errors
const { data } = await supabase.from("transactions").select();
// Proceed assuming data exists...
```

## TypeScript Rules

```typescript
// ✅ DO: Let TypeScript infer when obvious
const count = 5; // inferred as number
const items = [1, 2, 3]; // inferred as number[]
const doubled = items.map((x) => x * 2); // inferred

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

## Rutas de la Aplicacion

| Ruta            | Pagina         | Descripcion                              |
| --------------- | -------------- | ---------------------------------------- |
| `/`             | Dashboard      | Vista general con resumen financiero     |
| `/transactions` | Transactions   | Lista y gestion de transacciones         |
| `/cards`        | Cards          | Tarjetas de credito y debito (con Tabs)  |
| `/credits`      | Credits        | Creditos y MSI activos                   |
| `/subscriptions`| Subscriptions  | Suscripciones recurrentes                |
| `/calendar`     | Calendar       | Calendario visual de pagos               |
| `/categories`   | Categories     | Categorias de ingresos/gastos            |
| `/login`        | Login          | Autenticacion con Google OAuth           |

---

## Quick Reference Card

| Situation                                | Action                                         |
| ---------------------------------------- | ---------------------------------------------- |
| Need a utility function                  | Check if native JS/TS can do it first          |
| State needed in one component            | `useState`                                     |
| State needed in parent + children        | Lift state up, pass as props                   |
| State needed across unrelated components | Consider context (sparingly)                   |
| Side effect on user action               | Event handler                                  |
| Side effect on mount/dependency change   | `useEffect`                                    |
| Same logic in 3+ components              | Extract to custom hook                         |
| Same UI in 3+ places                     | Extract to component                           |
| Complex form                             | `react-hook-form` + `zod`                      |
| Date formatting/manipulation             | `date-fns`                                     |
| Data fetching                            | Supabase client directly or simple custom hook |

---

_Remember: The best code is code you don't have to write. Keep it simple._
