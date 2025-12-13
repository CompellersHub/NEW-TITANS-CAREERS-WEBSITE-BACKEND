/**
 * PayPal Payment Endpoints Test Script
 * 
 * This script tests the PayPal payment flow:
 * 1. Create PayPal order
 * 2. Simulate webhook events
 * 
 * Usage:
 * deno run --allow-net --allow-env test-paypal-endpoints.ts
 */

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'YOUR_SUPABASE_ANON_KEY';

// Test data
const testCourseData = {
    courseSlug: 'test-course-slug',
    courseTitle: 'Test Course Title',
    price: 99.99,
    voucherCode: null,
    email: 'test@example.com',
    name: 'Test User'
};

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
    console.log('\n' + '='.repeat(60));
    log(title, colors.bright + colors.cyan);
    console.log('='.repeat(60) + '\n');
}

function logSuccess(message: string) {
    log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
    log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
    log(`ℹ ${message}`, colors.blue);
}

function logWarning(message: string) {
    log(`⚠ ${message}`, colors.yellow);
}

/**
 * Test 1: Create PayPal Order
 */
async function testCreatePayPalOrder() {
    logSection('TEST 1: Create PayPal Order');

    try {
        logInfo('Sending request to create-paypal-order endpoint...');
        logInfo(`Course: ${testCourseData.courseTitle}`);
        logInfo(`Price: £${testCourseData.price}`);
        logInfo(`Email: ${testCourseData.email}`);

        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/create-paypal-order`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify(testCourseData),
            }
        );

        const responseText = await response.text();

        if (!response.ok) {
            logError(`HTTP ${response.status}: ${response.statusText}`);
            logError(`Response: ${responseText}`);
            return null;
        }

        const data = JSON.parse(responseText);

        logSuccess('PayPal order created successfully!');
        console.log('\nResponse Data:');
        console.log(JSON.stringify(data, null, 2));

        if (data.approvalUrl) {
            logInfo('\nApproval URL (use this to complete payment in sandbox):');
            log(data.approvalUrl, colors.bright + colors.blue);
            logWarning('\nNote: You need to log in to PayPal Sandbox to complete the payment');
            logWarning('Visit: https://www.sandbox.paypal.com/');
        }

        return data;

    } catch (error) {
        logError(`Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        return null;
    }
}

/**
 * Test 2: Simulate PayPal Webhook
 */
async function testPayPalWebhook(orderId: string, paymentIntentId: string) {
    logSection('TEST 2: Simulate PayPal Webhook');

    try {
        logInfo('Sending simulated webhook event...');
        logInfo(`Order ID: ${orderId}`);
        logInfo(`Payment Intent ID: ${paymentIntentId}`);

        // Simulate a PAYMENT.CAPTURE.COMPLETED event
        const webhookEvent = {
            event_type: 'PAYMENT.CAPTURE.COMPLETED',
            resource: {
                id: orderId,
                status: 'COMPLETED',
                amount: {
                    currency_code: 'GBP',
                    value: testCourseData.price.toFixed(2)
                }
            }
        };

        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/paypal-webhook`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify(webhookEvent),
            }
        );

        const responseText = await response.text();

        if (!response.ok) {
            logError(`HTTP ${response.status}: ${response.statusText}`);
            logError(`Response: ${responseText}`);
            return false;
        }

        const data = JSON.parse(responseText);

        logSuccess('Webhook processed successfully!');
        console.log('\nResponse Data:');
        console.log(JSON.stringify(data, null, 2));

        logInfo('\nCheck your database for:');
        logInfo('1. Updated payment_intents record (status: completed)');
        logInfo('2. New enrollments record');
        logInfo('3. Confirmation email sent to test@example.com');

        return true;

    } catch (error) {
        logError(`Error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    log('\n' + '█'.repeat(60), colors.bright + colors.cyan);
    log('  PayPal Payment Endpoints Test Suite', colors.bright + colors.cyan);
    log('█'.repeat(60) + '\n', colors.bright + colors.cyan);

    logInfo(`Supabase URL: ${SUPABASE_URL}`);
    logInfo(`Testing with email: ${testCourseData.email}\n`);

    // Test 1: Create PayPal Order
    const orderResult = await testCreatePayPalOrder();

    if (!orderResult || !orderResult.success) {
        logError('\n❌ Test suite failed at order creation');
        logWarning('\nPlease check:');
        logWarning('1. PAYPAL_CLIENT_ID is set in Supabase secrets');
        logWarning('2. PAYPAL_CLIENT_SECRET is set in Supabase secrets');
        logWarning('3. PAYPAL_ENVIRONMENT is set (sandbox or production)');
        logWarning('4. payment_intents table exists in your database');
        Deno.exit(1);
    }

    // Wait a bit before testing webhook
    logInfo('\nWaiting 2 seconds before webhook test...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Simulate Webhook (optional - only if you want to test the full flow)
    logWarning('\n⚠ Webhook test will simulate payment completion');
    logWarning('This will create an enrollment record in your database');

    const webhookResult = await testPayPalWebhook(
        orderResult.orderId,
        orderResult.paymentIntentId
    );

    // Summary
    logSection('TEST SUMMARY');

    if (orderResult.success) {
        logSuccess('✓ Create PayPal Order: PASSED');
    } else {
        logError('✗ Create PayPal Order: FAILED');
    }

    if (webhookResult) {
        logSuccess('✓ PayPal Webhook: PASSED');
    } else {
        logError('✗ PayPal Webhook: FAILED');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    if (orderResult.success && webhookResult) {
        logSuccess('🎉 All tests passed!');
    } else {
        logWarning('⚠ Some tests failed. Check the output above for details.');
    }

    console.log();
}

// Run the tests
if (import.meta.main) {
    runTests();
}
