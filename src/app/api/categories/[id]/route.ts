import { NextRequest, NextResponse } from 'next/server';
import { getCategories, saveCategory, deleteCategory } from '../../../../data/mockDb';
import { Category } from '../../../../data/seed';
import { z } from 'zod';

const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  image: z.string().url('Must be a valid image URL')
});

// PUT: Update a category (Protected)
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
    const result = categorySchema.safeParse({ ...body, id });

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const categories = getCategories();
    const exists = categories.some(c => c.id === id);
    if (!exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const val = result.data;
    const updatedCategory: Category = {
      id,
      name: val.name,
      slug: val.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: val.description,
      image: val.image
    };

    const saved = saveCategory(updatedCategory);
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error updating category API:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE: Delete a category (Protected)
export async function DELETE(
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
    const success = deleteCategory(id);
    if (!success) {
      return NextResponse.json({ error: 'Category not found to delete' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category API:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
