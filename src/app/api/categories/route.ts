import { NextRequest, NextResponse } from 'next/server';
import { getCategories, saveCategory, syncFromRemote } from '../../../data/mockDb';
import { Category } from '../../../data/seed';
import { z } from 'zod';

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  image: z.string().url('Must be a valid image URL')
});

// GET: List all categories
export async function GET() {
  try {
    await syncFromRemote();
    const categories = getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories API:', error);
    return NextResponse.json({ error: 'Failed to retrieve categories' }, { status: 500 });
  }
}

// POST: Create category (Protected)
export async function POST(request: NextRequest) {
  try {
    await syncFromRemote();
    // Admin check
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const val = result.data;
    const newCategory: Category = {
      id: val.id || `cat-${Date.now()}`,
      name: val.name,
      slug: val.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: val.description,
      image: val.image
    };

    const saved = saveCategory(newCategory);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating category API:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
