import { NextRequest, NextResponse } from 'next/server';
import { getReviews, addReview, syncFromRemote } from '../../../data/mockDb';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  userName: z.string().min(2, 'Name must be at least 2 characters'),
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters')
});

// GET: Fetch reviews for a specific product
export async function GET(request: NextRequest) {
  try {
    await syncFromRemote();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;

    const reviews = getReviews(productId);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews API:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

// POST: Add a new review
export async function POST(request: NextRequest) {
  try {
    await syncFromRemote();
    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const val = result.data;
    const review = await addReview(val.productId, val.userName, val.rating, val.comment);
    
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error adding review API:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
