import { NextResponse } from 'next/server';
import { ProductsDB, OrdersDB, CustomersDB } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const products = await ProductsDB.getAll();
    const orders = await OrdersDB.getAll();
    const customers = await CustomersDB.getAll();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Compute Metrics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => (o.order_status || '').toLowerCase() === 'pending').length;
    const completedOrders = orders.filter(o => ['delivered', 'completed'].includes((o.order_status || '').toLowerCase())).length;
    const cancelledOrders = orders.filter(o => (o.order_status || '').toLowerCase() === 'cancelled').length;

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => (Number(p.stock_quantity) || 0) <= 5).length;
    const outOfStockProducts = products.filter(p => (Number(p.stock_quantity) || 0) <= 0 || !p.is_available).length;
    const totalCustomers = customers.length;

    let totalRevenue = 0;
    let todayOrdersCount = 0;
    let todayRevenue = 0;
    let yesterdayRevenue = 0;

    // Daily breakdown for last 7 days chart
    const last7DaysMap: Record<string, { date: string; sales: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      last7DaysMap[dStr] = { date: label, sales: 0, orders: 0 };
    }

    orders.forEach(o => {
      const amount = Number(o.total_amount) || 0;
      const isCancelled = (o.order_status || '').toLowerCase() === 'cancelled';
      
      if (!isCancelled) {
        totalRevenue += amount;
      }

      const orderDate = (o.created_at || '').split('T')[0];

      if (orderDate === todayStr) {
        todayOrdersCount++;
        if (!isCancelled) todayRevenue += amount;
      } else if (orderDate === yesterdayStr) {
        if (!isCancelled) yesterdayRevenue += amount;
      }

      if (last7DaysMap[orderDate] && !isCancelled) {
        last7DaysMap[orderDate].sales += amount;
        last7DaysMap[orderDate].orders += 1;
      }
    });

    const recentOrders = orders.slice(0, 8);
    const chartData = Object.values(last7DaysMap);

    return NextResponse.json({
      success: true,
      counts: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCustomers,
        totalRevenue,
        todayOrders: todayOrdersCount,
        todayRevenue,
        yesterdayRevenue,
      },
      chartData,
      recentOrders,
      products: totalProducts,
      pendingOrders,
      completedOrders,
      todayRevenue,
      yesterdayRevenue,
    });
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
