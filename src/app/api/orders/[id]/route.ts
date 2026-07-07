import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '../../../../data/mockDb';
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

// PUT: Update order status (Protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = orderStatusUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const success = updateOrderStatus(id, result.data.status);
    if (!success) {
      return NextResponse.json({ error: 'Order not found to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Status updated to ${result.data.status}` });
  } catch (error) {
    console.error('Error updating order API:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
