import { NextResponse } from "next/server";
import { getCurrentUser, updateUser } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

const PLAN_PRICES: Record<string, string> = {
  team: process.env.STRIPE_TEAM_PRICE_ID || "STRIPE_TEAM_PRICE_ID",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "STRIPE_ENTERPRISE_PRICE_ID",
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { plan } = await request.json();
    const priceId = PLAN_PRICES[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan. Choose team or enterprise." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3400";

    // Re-use existing Stripe customer if we have one
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { comply_user_id: user.id },
      });
      customerId = customer.id;
      updateUser(user.id, { stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/registry?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { comply_user_id: user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe Checkout]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
