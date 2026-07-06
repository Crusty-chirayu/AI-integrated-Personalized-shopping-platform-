export async function GET() {
  return Response.json({
    message: "Supabase config values to add in your environment",
    variables: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY",
      "RAZORPAY_SECRET_KEY",
      "RAZORPAY_WEBHOOK_SECRET",
    ],
  });
}
