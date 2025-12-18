
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const SUPABASE_URL = "https://bzxzsidcifkhedydujqb.supabase.co";
// Access token from environment variable passed in command line
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("----------------------------------------------------------------");
console.log("                  STRIPE INTEGRATION TEST                       ");
console.log("----------------------------------------------------------------");

async function testStripeFlow() {
    if (!SUPABASE_KEY) {
        console.error("Please run with SUPABASE_SERVICE_ROLE_KEY environment variable set.");
        process.exit(1);
    }

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
            // Log more details if available
            if (error.context) console.error("Context:", error.context);
            return;
        }

        if (data && data.error) {
            console.error("❌ API returned error:", data.error);
            return;
        }

        if (data && data.url) {
            console.log("✅ Checkout session created successfully!");
            console.log("   URL:", data.url);
        } else {
            console.error("❌ unexpected response format:", data);
        }

    } catch (err) {
        console.error("❌ Unexpected error calling function:", err);
    }
}

testStripeFlow();
