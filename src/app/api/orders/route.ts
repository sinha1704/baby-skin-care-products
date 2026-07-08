import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrder, syncFromRemote } from '../../../data/mockDb';
import { Order } from '../../../data/seed';
import { z } from 'zod';

const shippingAddressSchema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required')
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string()
});

const orderCreateSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  shippingAddress: shippingAddressSchema,
  items: z.array(orderItemSchema).min(1, 'Order must contain items'),
  total: z.number(),
  paymentIntentId: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'COD']).optional()
});

// GET: Retrieve all orders (Protected)
export async function GET(request: NextRequest) {
  try {
    await syncFromRemote();
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const orders = getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders API:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

// POST: Create a customer order (Public)
export async function POST(request: NextRequest) {
  try {
    await syncFromRemote();
    const body = await request.json();
    const result = orderCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const val = result.data;
    const newOrder: Order = {
      id: `ord-${1000 + getOrders().length + 1}`,
      customerName: val.customerName,
      customerEmail: val.customerEmail,
      shippingAddress: val.shippingAddress,
      total: val.total,
      status: val.paymentIntentId ? 'Paid' : 'Pending', // Mark paid immediately if Stripe processed
      items: val.items,
      paymentIntentId: val.paymentIntentId,
      paymentMethod: val.paymentMethod || (val.paymentIntentId ? 'CARD' : 'COD'),
      createdAt: new Date().toISOString()
    };

    const saved = saveOrder(newOrder);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating order API:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
