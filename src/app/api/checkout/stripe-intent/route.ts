import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Safe instantiation of Stripe client
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && !stripeKey.startsWith('sk_test_51P1abc') 
  ? new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' as any }) 
  : null;

export async function POST(request: NextRequest) {
  try {
    const { amount, email } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid checkout amount' }, { status: 400 });
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // If Stripe is not configured, fallback to simulation mode
    if (!stripe) {
      console.log('Stripe key is missing or is using placeholder. Falling back to Simulated Payment Intent.');
      return NextResponse.json({
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        isSimulated: true,
        amount: amount
      });
    }

    // Create a real Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      receipt_email: email,
      metadata: {
        integration: 'nextjs_baby_skin_care'
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      isSimulated: false,
      amount: amount
    });
  } catch (error: any) {
    console.error('Error creating Stripe Payment Intent API:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create payment intent' 
    }, { status: 500 });
  }
}
