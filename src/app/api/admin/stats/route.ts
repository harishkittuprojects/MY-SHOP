import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customDate = searchParams.get('date');

  try {
    console.log('Fetching dashboard stats...');
    
    // Stats fetched via standard MySQL queries

    // 1. Product Count
    const prodResults: any = await mysql.query('SELECT COUNT(*) as count FROM products');
    const prodCount = prodResults[0]?.count || 0;

    // 2. Active Subscriptions (Resilient Case-Insensitive Check)
    const subResults: any = await mysql.query("SELECT COUNT(*) as count FROM subscriptions WHERE LOWER(TRIM(status)) = 'active'");
    const activeSubCount = subResults[0]?.count || 0;

    // 3. Completed Deliveries
    const delResults: any = await mysql.query("SELECT COUNT(*) as count FROM deliveries WHERE LOWER(TRIM(status)) = 'delivered'");
    const deliveryCount = delResults[0]?.count || 0;

    // 4. Revenue Today — from paid orders + subscriptions created today
    const revenueTodayResults: any = await mysql.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = CURDATE()"
    );
    const subRevToday: any = await mysql.query(
      "SELECT COALESCE(SUM(amount_paid), 0) as total FROM subscriptions WHERE DATE(created_at) = CURDATE() AND amount_paid IS NOT NULL AND amount_paid > 0"
    );
    const todayRevenue = (parseFloat(revenueTodayResults[0]?.total) || 0) + (parseFloat(subRevToday[0]?.total) || 0);

    // 5. Revenue Yesterday
    const revenueYesterdayResults: any = await mysql.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"
    );
    const subRevYesterday: any = await mysql.query(
      "SELECT COALESCE(SUM(amount_paid), 0) as total FROM subscriptions WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND amount_paid IS NOT NULL AND amount_paid > 0"
    );
    const yesterdayRevenue = (parseFloat(revenueYesterdayResults[0]?.total) || 0) + (parseFloat(subRevYesterday[0]?.total) || 0);

    // 6. Recent Subscriptions
    const recentSubs = await mysql.query(
      "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5"
    );

    console.log(`Stats fetched: Prods:${prodCount}, Subs:${activeSubCount}, Recent:${Array.isArray(recentSubs) ? recentSubs.length : 0}`);

    // 7. Custom Date Revenue (if provided)
    let customRevenue = null;
    if (customDate) {
      const customOrderResults: any = await mysql.query(
        "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = ?",
        [customDate]
      );
      const customSubResults: any = await mysql.query(
        "SELECT COALESCE(SUM(amount_paid), 0) as total FROM subscriptions WHERE DATE(created_at) = ? AND amount_paid IS NOT NULL AND amount_paid > 0",
        [customDate]
      );
      customRevenue = (parseFloat(customOrderResults[0]?.total) || 0) + (parseFloat(customSubResults[0]?.total) || 0);
    }

    // 8. One-off Orders
    const pendingOrdersResult: any = await mysql.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const completedOrdersResult: any = await mysql.query("SELECT COUNT(*) as count FROM orders WHERE status = 'completed' OR status = 'delivered'");
    
    const pendingOrders = pendingOrdersResult[0]?.count || 0;
    const completedOrdersValue = completedOrdersResult[0]?.count || 0;

    // 9. Recent Orders
    const recentOrdersRaw = await mysql.query(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5"
    );
    const recentOrders = (recentOrdersRaw as any[]).map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items
    }));

    return NextResponse.json({
      products: prodCount,
      activeSubscriptions: activeSubCount,
      completedDeliveries: deliveryCount,
      todayRevenue,
      yesterdayRevenue,
      recentSubs,
      customRevenue,
      pendingOrders,
      completedOrders: completedOrdersValue,
      recentOrders
    });
  } catch (error: any) {
    console.error('Stats API Error @ [GET /api/admin/stats]:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stats', 
      details: error.message || String(error),
      errorCode: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
}
