
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuration
const SUPABASE_URL = "https://bzxzsidcifkhedydujqb.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "YOUR_SERVICE_ROLE_KEY"; // User needs to set this or we run locally with env

console.log("----------------------------------------------------------------");
console.log("                  STRIPE INTEGRATION TEST                       ");
console.log("----------------------------------------------------------------");

async function testStripeFlow() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Create Checkout Session
    console.log("\n1. Testing 'create-checkout-session' function...");

    const payload = {
        courseSlug: "test-course-stripe",
        courseTitle: "Stripe Integration Test Course",
        price: 10.00,
        userEmail: "test-user@example.com"
    };

    try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: payload
        });

        if (error) {
            console.error("❌ Function invocation failed:", error);
            return;
        }

        if (data.error) {
            console.error("❌ API returned error:", data.error);
            return;
        }

        console.log("✅ Checkout session created successfully!");
        console.log("   URL:", data.url);

        // If we have a URL, the keys are working!

    } catch (err) {
        console.error("❌ Unexpected error calling function:", err);
    }
}

// Check if run directly
if (import.meta.main) {
    if (!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
        console.error("Please run with SUPABASE_SERVICE_ROLE_KEY environment variable set.");
        console.log("Example: $env:SUPABASE_SERVICE_ROLE_KEY='...'; deno run -A test-stripe-payment.ts");
        Deno.exit(1);
    }
    await testStripeFlow();
}
