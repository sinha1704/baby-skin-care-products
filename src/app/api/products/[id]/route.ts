import { NextRequest, NextResponse } from 'next/server';
import { getProductById, saveProduct, deleteProduct } from '../../../../data/mockDb';
import { Product } from '../../../../data/seed';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock must be 0 or more'),
  ingredients: z.string().optional().default(''),
  benefits: z.string().optional().default(''),
  usage: z.string().optional().default(''),
  safetyNotes: z.string().optional().default(''),
  images: z.array(z.string()).min(1, 'At least one image URL is required'),
  isFeatured: z.boolean().optional().default(false)
});

// GET: Fetch a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product API:', error);
    return NextResponse.json({ error: 'Failed to retrieve product' }, { status: 500 });
  }
}

// PUT: Update an existing product (Protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin check
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = productSchema.safeParse({ ...body, id });

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const existingProduct = getProductById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found to update' }, { status: 404 });
    }

    const val = result.data;
    const updatedProduct: Product = {
      ...existingProduct,
      name: val.name,
      slug: val.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      categoryId: val.categoryId,
      description: val.description,
      price: val.price,
      stock: val.stock,
      ingredients: val.ingredients,
      benefits: val.benefits,
      usage: val.usage,
      safetyNotes: val.safetyNotes,
      images: val.images,
      isFeatured: val.isFeatured
    };

    const saved = saveProduct(updatedProduct);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error updating product API:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE: Delete a product (Protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin check
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
    const success = deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: 'Product not found to delete' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product API:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
