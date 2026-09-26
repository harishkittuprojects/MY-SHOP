import { NextResponse } from 'next/server';
import { OrdersDB, ProductsDB, CustomersDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'summary'; // 'daily', 'weekly', 'monthly', 'products', 'customers', 'export_csv'

  try {
    const orders = await OrdersDB.getAll();
    const products = await ProductsDB.getAll();
    const customers = await CustomersDB.getAll();

    // 1. Calculate Aggregates
    let totalRevenue = 0;
    let totalUnitsSold = 0;
    const productSalesMap: Record<string, { name: string; units: number; revenue: number; category: string }> = {};
    const customerSalesMap: Record<string, { name: string; email: string; phone: string; ordersCount: number; totalSpent: number }> = {};
    const dailyMap: Record<string, { date: string; orders: number; revenue: number; itemsSold: number }> = {};

    orders.forEach(o => {
      const isCancelled = (o.order_status || '').toLowerCase() === 'cancelled';
      const orderDate = (o.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0];
      const amount = Number(o.total_amount) || 0;

      if (!dailyMap[orderDate]) {
        dailyMap[orderDate] = { date: orderDate, orders: 0, revenue: 0, itemsSold: 0 };
      }

      dailyMap[orderDate].orders += 1;

      if (!isCancelled) {
        totalRevenue += amount;
        dailyMap[orderDate].revenue += amount;

        // Customer aggregation
        const cKey = o.customer_email || o.customer_phone || o.customer_name || 'Guest';
        if (!customerSalesMap[cKey]) {
          customerSalesMap[cKey] = {
            name: o.customer_name || 'Customer',
            email: o.customer_email || '',
            phone: o.customer_phone || '',
            ordersCount: 0,
            totalSpent: 0
          };
        }
        customerSalesMap[cKey].ordersCount += 1;
        customerSalesMap[cKey].totalSpent += amount;

        // Items aggregation
        const items = Array.isArray(o.items) ? o.items : [];
        items.forEach((it: any) => {
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          totalUnitsSold += qty;
          dailyMap[orderDate].itemsSold += qty;

          const pId = it.id || it.product_id || it.name;
          if (!productSalesMap[pId]) {
            productSalesMap[pId] = {
              name: it.name || 'Product',
              units: 0,
              revenue: 0,
              category: it.category || 'General'
            };
          }
          productSalesMap[pId].units += qty;
          productSalesMap[pId].revenue += qty * price;
        });
      }
    });

    const dailyBreakdown = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);
    const topCustomers = Object.values(customerSalesMap).sort((a, b) => b.totalSpent - a.totalSpent);

    // If CSV export requested
    if (type === 'export_csv') {
      const csvHeader = 'Order ID,Date,Customer Name,Phone,Email,Total Amount,Payment Method,Payment Status,Order Status\n';
      const csvRows = orders.map(o => {
        const cleanName = (o.customer_name || '').replace(/,/g, ' ');
        const cleanAddress = (o.shipping_address || '').replace(/,/g, ' ');
        return `"${o.id}","${(o.created_at || '').slice(0, 10)}","${cleanName}","${o.customer_phone || ''}","${o.customer_email || ''}",${o.total_amount},"${o.payment_method}","${o.payment_status}","${o.order_status}"`;
      }).join('\n');

      return new NextResponse(csvHeader + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sales_report_${Date.now()}.csv"`,
        }
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        totalUnitsSold,
        totalCustomers: customers.length,
        averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0,
      },
      dailyBreakdown,
      topProducts,
      topCustomers,
    });
  } catch (error: any) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}
