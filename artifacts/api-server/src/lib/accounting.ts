import { sql } from "drizzle-orm";

// A minimal executor shape that both the top-level `db` and a transaction `tx`
// satisfy. Keeping it structural lets the same balance helpers run inside or
// outside a transaction.
export interface SqlExecutor {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
}

// mysql2 returns [rows, fields]; normalize to a plain rows array regardless of
// driver shape.
async function rows(exec: SqlExecutor, query: ReturnType<typeof sql>): Promise<any[]> {
  const r = (await exec.execute(query)) as any;
  return Array.isArray(r?.rows) ? r.rows : (Array.isArray(r) && Array.isArray(r[0]) ? r[0] : (Array.isArray(r) ? r : []));
}

// Canonical customer-receivable SQL expression (the ONE source of truth).
//   = sales (due on normal sales − total of sales returns)
//   + receivable transactions (debit increases, credit decreases)
// Sales returns are stored is_return=true with a POSITIVE total — always
// SUBTRACTED, never filtered out.
// `idExpr` is the customer-id reference to correlate on: pass sql`${customerId}`
// for a single lookup, or sql`c.id` to embed inside a list/report query so the
// single-row and list surfaces compute identical numbers.
export function customerReceivableSql(idExpr: ReturnType<typeof sql>) {
  return sql`(
    coalesce((
      SELECT sum(CASE WHEN is_return = false THEN due_amount
                      ELSE -total_amount END)
      FROM sales WHERE customer_id = ${idExpr}
    ), 0)
    + coalesce((
      SELECT sum(CASE WHEN direction = 'debit' THEN amount
                      ELSE -amount END)
      FROM customer_transactions WHERE customer_id = ${idExpr} AND account = 'receivable'
    ), 0)
  )`;
}

// Canonical supplier-payable SQL expression (the ONE source of truth).
//   = purchase dues − purchase returns
//   + payable transactions (debit increases, credit decreases)
export function supplierPayableSql(idExpr: ReturnType<typeof sql>) {
  return sql`(
    coalesce((SELECT sum(due_amount) FROM purchases WHERE supplier_id = ${idExpr}), 0)
    - coalesce((SELECT sum(total_amount) FROM purchase_returns WHERE supplier_id = ${idExpr}), 0)
    + coalesce((
      SELECT sum(CASE WHEN direction = 'debit' THEN amount
                      ELSE -amount END)
      FROM supplier_transactions WHERE supplier_id = ${idExpr} AND account = 'payable'
    ), 0)
  )`;
}

// Live customer receivable (what the customer owes us right now).
export async function getCustomerReceivable(exec: SqlExecutor, customerId: number): Promise<number> {
  const [r] = await rows(exec, sql`SELECT ${customerReceivableSql(sql`${customerId}`)} as balance`);
  return Number(r?.balance ?? 0);
}

// Live supplier payable (what we owe the supplier right now).
export async function getSupplierPayable(exec: SqlExecutor, supplierId: number): Promise<number> {
  const [r] = await rows(exec, sql`SELECT ${supplierPayableSql(sql`${supplierId}`)} as balance`);
  return Number(r?.balance ?? 0);
}
