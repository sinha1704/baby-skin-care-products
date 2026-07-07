import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProduct, getCategories } from '../../../data/mockDb';
import { Product } from '../../../data/seed';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string().optional(),
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

// GET: Fetch list of products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort'); // price-low-high, price-high-low, newest

    let products = getProducts();

    // Category filter
    if (category) {
      const cats = getCategories();
      const matchedCat = cats.find(c => c.slug === category || c.id === category);
      if (matchedCat) {
        products = products.filter(p => p.categoryId === matchedCat.id);
      } else {
        products = [];
      }
    }

    // Search query filter
    if (search) {
      const query = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort order
    if (sort) {
      if (sort === 'price-low-high') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high-low') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products API:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

// POST: Add new product (Protected)
export async function POST(request: NextRequest) {
  try {
    // Session token check for admin guard (simple mock)
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('admin_session')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
    if (!token || token !== 'mock-admin-jwt-token') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const result = productSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const val = result.data;
    const newProduct: Product = {
      id: val.id || `prod-${Date.now()}`,
      name: val.name,
      slug: val.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      categoryId: val.categoryId,
      description: val.description,
      price: val.price,
      rating: 5.0,
      reviewCount: 0,
      images: val.images,
      stock: val.stock,
      ingredients: val.ingredients,
      benefits: val.benefits,
      usage: val.usage,
      safetyNotes: val.safetyNotes,
      isFeatured: val.isFeatured,
      createdAt: new Date().toISOString()
    };

    const saved = saveProduct(newProduct);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating product API:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
