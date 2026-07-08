import { NextRequest, NextResponse } from 'next/server';
import { getOrders, syncFromRemote } from '../../../../data/mockDb';

// GET: Retrieve orders for a specific customer email (Customer-Protected)
// Customer must supply ?email=... and be logged in (customer_session cookie present)
export async function GET(request: NextRequest) {
  try {
    await syncFromRemote();
    const customerToken = request.cookies.get('customer_session')?.value;
    if (!customerToken) {
      return NextResponse.json({ error: 'Please sign in to view your orders.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const allOrders = getOrders();
    const customerOrders = allOrders.filter(
      (o) => o.customerEmail.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json(customerOrders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to retrieve your orders.' }, { status: 500 });
  }
}
