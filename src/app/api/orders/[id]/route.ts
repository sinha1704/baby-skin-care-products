import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, syncFromRemote } from '../../../../data/mockDb';
import { z } from 'zod';

const orderStatusUpdateSchema = z.object({
  status: z.enum(['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'])
});

// GET: Fetch a single order (Public for receipts)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await syncFromRemote();
    const { id } = await params;
    const order = getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order API:', error);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}

// PUT: Update order status (Protected / Cancel for customers)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await syncFromRemote();
    const { id } = await params;
    const body = await request.json();

    // Check if it's a customer-initiated cancellation
    if (body.action === 'cancel') {
      const order = getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Enforce Cash on Delivery only
      if (order.paymentMethod !== 'COD') {
        return NextResponse.json({ error: 'Only Cash on Delivery (COD) orders can be cancelled by the customer' }, { status: 400 });
      }

      // Enforce 24-hour limit
      const orderDate = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const differenceInHours = (now - orderDate) / (1000 * 60 * 60);

      if (differenceInHours > 24) {
        return NextResponse.json({ error: 'Orders can only be cancelled within 24 hours of placement' }, { status: 400 });
      }

      // Enforce status checks (cannot cancel if shipped, delivered, or already cancelled)
      if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
        return NextResponse.json({ error: `Cannot cancel an order that is already ${order.status}` }, { status: 400 });
      }

      const success = await updateOrderStatus(id, 'Cancelled');
      if (!success) {
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Order successfully cancelled' });
    }

    // Default admin-protected status update flow
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const result = orderStatusUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const success = await updateOrderStatus(id, result.data.status);
    if (!success) {
      return NextResponse.json({ error: 'Order not found to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Status updated to ${result.data.status}` });
  } catch (error) {
    console.error('Error updating order API:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
