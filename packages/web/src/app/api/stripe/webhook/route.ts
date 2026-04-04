import { NextResponse } from "next/server";
import { updateUser, getUserByEmail } from "@/lib/auth";
import { getAuthDb } from "@/lib/db-auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.comply_user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.toString() || null;

          updateUser(userId, {
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId || undefined,
          });

          console.log(
            `[Stripe] User ${userId} upgraded to ${plan}`
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.toString();

        // Find user by stripe_customer_id
        const db = getAuthDb();
        const user = db
          .prepare("SELECT id FROM users WHERE stripe_customer_id = ?")
          .get(customerId) as { id: string } | undefined;

        if (user) {
          updateUser(user.id, { plan: "free" });
          console.log(
            `[Stripe] User ${user.id} downgraded to free (subscription deleted)`
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook]", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
