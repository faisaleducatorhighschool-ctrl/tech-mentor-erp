import { Router } from "express";
import { db, productsTable, ordersTable, customersTable, salesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

async function xr(q: ReturnType<typeof sql>): Promise<any[]> {
  const r = (await db.execute(q)) as any;
  return Array.isArray(r?.rows) ? r.rows : (Array.isArray(r) && Array.isArray(r[0]) ? r[0] : (Array.isArray(r) ? r : []));
}

router.get("/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const [productStats] = await db.select({
    total: sql<number>`count(*)`,
    lowStock: sql<number>`sum(case when stock <= low_stock_limit and stock > 0 then 1 else 0 end)`,
    outOfStock: sql<number>`sum(case when stock = 0 then 1 else 0 end)`,
  }).from(productsTable);

  const [orderStats] = await db.select({
    total: sql<number>`count(*)`,
    pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
  }).from(ordersTable);

  const [customerStats] = await db.select({ total: sql<number>`count(*)` }).from(customersTable);

  const [salesStats] = await db.select({
    todaySales: sql<number>`coalesce(sum(case when created_at >= CURRENT_DATE then (case when is_return then -1 else 1 end) * total_amount else 0 end), 0)`,
    monthSales: sql<number>`coalesce(sum(case when created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') then (case when is_return then -1 else 1 end) * total_amount else 0 end), 0)`,
    totalRevenue: sql<number>`coalesce(sum((case when is_return then -1 else 1 end) * total_amount), 0)`,
    totalReturns: sql<number>`sum(case when is_return = true then 1 else 0 end)`,
  }).from(salesTable);

  const [expiryStats] = await xr(sql`
    SELECT
      sum(case when expiry_date IS NOT NULL
          AND expiry_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          AND cast(expiry_date as date) < CURRENT_DATE
          AND stock > 0 then 1 else 0 end) as expired_count,
      sum(case when expiry_date IS NOT NULL
          AND expiry_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          AND cast(expiry_date as date) >= CURRENT_DATE
          AND cast(expiry_date as date) <= CURRENT_DATE + INTERVAL 7 DAY
          AND stock > 0 then 1 else 0 end) as expiring_7days,
      sum(case when expiry_date IS NOT NULL
          AND expiry_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          AND cast(expiry_date as date) >= CURRENT_DATE
          AND cast(expiry_date as date) <= CURRENT_DATE + INTERVAL 15 DAY
          AND stock > 0 then 1 else 0 end) as expiring_15days,
      sum(case when expiry_date IS NOT NULL
          AND expiry_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          AND cast(expiry_date as date) >= CURRENT_DATE
          AND cast(expiry_date as date) <= CURRENT_DATE + INTERVAL 30 DAY
          AND stock > 0 then 1 else 0 end) as expiring_30days,
      coalesce(sum(
        case when expiry_date IS NOT NULL
          AND expiry_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          AND cast(expiry_date as date) >= CURRENT_DATE
          AND cast(expiry_date as date) <= CURRENT_DATE + INTERVAL 30 DAY
          AND stock > 0
        then stock * cost_price else 0 end
      ), 0) as near_expiry_value
    FROM products WHERE status = 'active'
  `);

  res.json({
    totalRevenue: Number(salesStats?.totalRevenue ?? 0),
    totalOrders: Number(orderStats?.total ?? 0),
    totalProducts: Number(productStats?.total ?? 0),
    totalCustomers: Number(customerStats?.total ?? 0),
    pendingOrders: Number(orderStats?.pending ?? 0),
    lowStockCount: Number(productStats?.lowStock ?? 0),
    outOfStockCount: Number(productStats?.outOfStock ?? 0),
    todaySales: Number(salesStats?.todaySales ?? 0),
    monthSales: Number(salesStats?.monthSales ?? 0),
    totalReturns: Number(salesStats?.totalReturns ?? 0),
    expiredCount: Number(expiryStats?.expired_count ?? 0),
    expiring7Days: Number(expiryStats?.expiring_7days ?? 0),
    expiring15Days: Number(expiryStats?.expiring_15days ?? 0),
    expiring30Days: Number(expiryStats?.expiring_30days ?? 0),
    nearExpiryValue: Number(expiryStats?.near_expiry_value ?? 0),
  });
});

router.get("/dashboard/recent-orders", requireAuth, async (_req, res): Promise<void> => {
  const orders = await db.select({
    id: ordersTable.id,
    orderNumber: ordersTable.orderNumber,
    customerId: ordersTable.customerId,
    customerName: sql<string | null>`(select name from customers where id = orders.customer_id)`,
    status: ordersTable.status,
    deliveryMethod: ordersTable.deliveryMethod,
    paymentMethod: ordersTable.paymentMethod,
    paymentStatus: ordersTable.paymentStatus,
    subtotal: ordersTable.subtotal,
    discount: ordersTable.discount,
    tax: ordersTable.tax,
    totalAmount: ordersTable.totalAmount,
    paidAmount: ordersTable.paidAmount,
    dueAmount: ordersTable.dueAmount,
    notes: ordersTable.notes,
    createdAt: ordersTable.createdAt,
  }).from(ordersTable).orderBy(sql`created_at desc`).limit(10);

  res.json(orders.map(o => ({
    ...o,
    subtotal: Number(o.subtotal), discount: Number(o.discount), tax: Number(o.tax),
    totalAmount: Number(o.totalAmount), paidAmount: Number(o.paidAmount), dueAmount: Number(o.dueAmount),
    items: [], createdAt: o.createdAt.toISOString(),
  })));
});

router.get("/dashboard/sales-chart", requireAuth, async (_req, res): Promise<void> => {
  const rows = await xr(sql`
    SELECT
      DATE_FORMAT(days.day, '%Y-%m-%d') as date,
      coalesce(sum((case when s.is_return then -1 else 1 end) * s.total_amount), 0) as sales,
      sum(case when s.id is not null and s.is_return = false then 1 else 0 end) as orders
    FROM (
      SELECT CURRENT_DATE - INTERVAL 6 DAY AS day
      UNION ALL SELECT CURRENT_DATE - INTERVAL 5 DAY
      UNION ALL SELECT CURRENT_DATE - INTERVAL 4 DAY
      UNION ALL SELECT CURRENT_DATE - INTERVAL 3 DAY
      UNION ALL SELECT CURRENT_DATE - INTERVAL 2 DAY
      UNION ALL SELECT CURRENT_DATE - INTERVAL 1 DAY
      UNION ALL SELECT CURRENT_DATE
    ) days
    LEFT JOIN sales s ON cast(s.created_at as date) = days.day
    GROUP BY days.day ORDER BY days.day
  `);
  res.json(rows.map(r => ({ date: r.date, sales: Number(r.sales), orders: Number(r.orders) })));
});

export default router;
