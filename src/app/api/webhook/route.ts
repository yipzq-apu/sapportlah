import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers(); // ✅ await here
  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const amount = paymentIntent.amount / 100;
    const donationId = paymentIntent.metadata?.donationId;
    const campaignId = paymentIntent.metadata?.campaignId;
    // Begin transaction
    await db.query('START TRANSACTION');

    try {
      // Update donation status
      await db.query(
        `UPDATE donations SET 
              payment_status = 'completed',
              updated_at = NOW()
            WHERE id = ?`,
        [donationId]
      );
      // Update campaign amounts
      await db.query(
        `UPDATE campaigns SET 
          current_amount = current_amount + ?,
          backers_count = (
            SELECT COUNT(DISTINCT user_id) 
            FROM donations 
            WHERE campaign_id = ? AND payment_status = 'completed'
          ),
          updated_at = NOW()
        WHERE id = ?`,
        [amount, campaignId, campaignId]
      );
      // Commit transaction
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }
  return new NextResponse('OK', { status: 200 });
}
