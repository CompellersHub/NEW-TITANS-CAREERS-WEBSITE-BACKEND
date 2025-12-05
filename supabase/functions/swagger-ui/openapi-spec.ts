/**
 * OpenAPI 3.0 Specification for Titans Careers API
 * This file contains the complete API documentation for all Supabase Edge Functions
 */

export const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "Titans Careers API",
        version: "1.0.0",
        description: "Complete API documentation for Titans Careers backend services including payment processing, email campaigns, analytics, and more.",
        contact: {
            name: "Titans Careers",
            url: "https://titanscareer.com",
        },
    },
    servers: [
        {
            url: "https://{project-id}.supabase.co/functions/v1",
            description: "Supabase Edge Functions",
            variables: {
                "project-id": {
                    default: "bzxzsidcifkhedydujqb",
                    description: "Your Supabase project ID",
                },
            },
        },
    ],
    tags: [
        { name: "Payment", description: "Payment processing endpoints" },
        { name: "Webhooks", description: "Webhook handlers for external services" },
        { name: "Email", description: "Email and notification services" },
        { name: "Analytics", description: "Tracking and analytics endpoints" },
        { name: "Campaigns", description: "Campaign management and automation" },
        { name: "Leads", description: "Lead management and nurturing" },
        { name: "Automation", description: "Automated processes and cron jobs" },
        { name: "AI", description: "AI-powered features" },
        { name: "User Management", description: "User and role management" },
        { name: "Alerts", description: "Alert and notification systems" },
        { name: "Courses", description: "Course management and content" },
        { name: "Jobs", description: "Job listings" },
        { name: "Blogs", description: "Blog posts and articles" },
        { name: "Consultations", description: "Consultation requests" },
        { name: "Registrations", description: "Course registrations" },
        { name: "Events", description: "Event management" },
        { name: "Monitoring", description: "AML/KYC monitoring" },
        { name: "Authentication", description: "User authentication and authorization" },
    ],
    paths: {
        "/newsletter-signup": {
            post: {
                tags: ["Email"],
                summary: "Subscribe to newsletter",
                description: "Subscribe a user to the Titans Careers newsletter with optional metadata",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: {
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                    name: { type: "string", example: "John Doe" },
                                    whatsapp: { type: "string", example: "+44 7700 900000" },
                                    interest: { type: "string", example: "AML Compliance" },
                                    consent: { type: "boolean", example: true },
                                    source: { type: "string", example: "homepage" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Successfully subscribed",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                        success: { type: "boolean" },
                                    },
                                },
                            },
                        },
                    },
                    "400": { description: "Invalid email or validation error" },
                    "500": { description: "Internal server error" },
                },
            },
        },
        "/create-checkout-session": {
            post: {
                tags: ["Payment"],
                summary: "Create Stripe checkout session",
                description: "Create a Stripe checkout session for course enrollment with optional voucher code",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["courseSlug", "courseTitle", "price"],
                                properties: {
                                    courseSlug: { type: "string", example: "aml-compliance-course" },
                                    courseTitle: { type: "string", example: "AML Compliance Professional" },
                                    price: { type: "number", example: 499.99 },
                                    voucherCode: { type: "string", example: "SAVE20" },
                                    userEmail: { type: "string", format: "email", example: "user@example.com" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Checkout session created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        url: { type: "string", format: "uri", example: "https://checkout.stripe.com/..." },
                                    },
                                },
                            },
                        },
                    },
                    "400": { description: "Missing required fields or invalid voucher" },
                },
            },
        },
        "/create-bank-transfer": {
            post: {
                tags: ["Payment"],
                summary: "Create bank transfer payment",
                description: "Initiate a bank transfer payment for course enrollment",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["courseSlug", "courseTitle", "price", "userEmail"],
                                properties: {
                                    courseSlug: { type: "string" },
                                    courseTitle: { type: "string" },
                                    price: { type: "number" },
                                    userEmail: { type: "string", format: "email" },
                                    voucherCode: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": { description: "Bank transfer initiated" },
                    "400": { description: "Invalid request" },
                },
            },
        },
        "/create-paypal-order": {
            post: {
                tags: ["Payment"],
                summary: "Create PayPal order",
                description: "Create a PayPal order for course enrollment",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["courseSlug", "courseTitle", "price"],
                                properties: {
                                    courseSlug: { type: "string" },
                                    courseTitle: { type: "string" },
                                    price: { type: "number" },
                                    voucherCode: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "PayPal order created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        orderId: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/create-payl8r-application": {
            post: {
                tags: ["Payment"],
                summary: "Create Payl8r application",
                description: "Create a Payl8r finance application for course enrollment",
                responses: {
                    "200": { description: "Payl8r application created" },
                },
            },
        },
        "/validate-voucher": {
            post: {
                tags: ["Payment"],
                summary: "Validate voucher code",
                description: "Validate a voucher code and return discount information",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["code"],
                                properties: {
                                    code: { type: "string", example: "SAVE20" },
                                    courseSlug: { type: "string" },
                                    price: { type: "number" },
                                    userEmail: { type: "string", format: "email" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Voucher validation result",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        valid: { type: "boolean" },
                                        discountAmount: { type: "number" },
                                        finalPrice: { type: "number" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/stripe-webhook": {
            post: {
                tags: ["Webhooks"],
                summary: "Stripe webhook handler",
                description: "Handle Stripe webhook events for payment processing",
                responses: {
                    "200": { description: "Webhook processed" },
                },
            },
        },
        "/paypal-webhook": {
            post: {
                tags: ["Webhooks"],
                summary: "PayPal webhook handler",
                description: "Handle PayPal webhook events",
                responses: {
                    "200": { description: "Webhook processed" },
                },
            },
        },
        "/payl8r-webhook": {
            post: {
                tags: ["Webhooks"],
                summary: "Payl8r webhook handler",
                description: "Handle Payl8r webhook events",
                responses: {
                    "200": { description: "Webhook processed" },
                },
            },
        },
        "/email-webhook": {
            post: {
                tags: ["Webhooks"],
                summary: "Email service webhook handler",
                description: "Handle email service webhook events (Brevo, etc.)",
                responses: {
                    "200": { description: "Webhook processed" },
                },
            },
        },
        "/track-behavior": {
            post: {
                tags: ["Analytics"],
                summary: "Track user behavior",
                description: "Track user behavior and update lead scoring",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "behaviorType"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    behaviorType: { type: "string", example: "page_view" },
                                    scoreValue: { type: "number", example: 5 },
                                    behaviorData: { type: "object" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Behavior tracked",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        score: { type: "number" },
                                        status: { type: "string" },
                                        triggeredActions: { type: "array", items: { type: "string" } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/track-email-open": {
            get: {
                tags: ["Analytics"],
                summary: "Track email open",
                description: "Track email opens via tracking pixel (returns 1x1 transparent GIF)",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                        description: "Tracking ID",
                    },
                ],
                responses: {
                    "200": {
                        description: "Tracking pixel",
                        content: {
                            "image/gif": {
                                schema: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
        },
        "/track-email-click": {
            get: {
                tags: ["Analytics"],
                summary: "Track email link click",
                description: "Track email link clicks and redirect to target URL",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                        description: "Tracking ID",
                    },
                    {
                        name: "url",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uri" },
                        description: "Target URL",
                    },
                ],
                responses: {
                    "302": { description: "Redirect to target URL" },
                },
            },
        },
        "/track-email-link": {
            post: {
                tags: ["Analytics"],
                summary: "Track email link interaction",
                description: "Track email link interactions",
                responses: {
                    "200": { description: "Link tracked" },
                },
            },
        },
        "/update-engagement-scores": {
            post: {
                tags: ["Analytics"],
                summary: "Update engagement scores",
                description: "Update user engagement scores based on activity",
                responses: {
                    "200": { description: "Scores updated" },
                },
            },
        },
        "/send-ab-test": {
            post: {
                tags: ["Campaigns"],
                summary: "Send A/B test campaign",
                description: "Send A/B test email campaign to segment",
                responses: {
                    "200": { description: "A/B test sent" },
                },
            },
        },
        "/select-ab-winner": {
            post: {
                tags: ["Campaigns"],
                summary: "Select A/B test winner",
                description: "Automatically select winning variant based on performance",
                responses: {
                    "200": { description: "Winner selected" },
                },
            },
        },
        "/select-email-ab-winner": {
            post: {
                tags: ["Campaigns"],
                summary: "Select email A/B test winner",
                description: "Select winning email variant",
                responses: {
                    "200": { description: "Winner selected" },
                },
            },
        },
        "/select-nurture-ab-winner": {
            post: {
                tags: ["Campaigns"],
                summary: "Select nurture A/B test winner",
                description: "Select winning nurture campaign variant",
                responses: {
                    "200": { description: "Winner selected" },
                },
            },
        },
        "/send-ab-winner": {
            post: {
                tags: ["Campaigns"],
                summary: "Send A/B test winner",
                description: "Send winning variant to remaining audience",
                responses: {
                    "200": { description: "Winner sent" },
                },
            },
        },
        "/process-scheduled-campaigns": {
            post: {
                tags: ["Campaigns"],
                summary: "Process scheduled campaigns",
                description: "Process and send scheduled email campaigns",
                responses: {
                    "200": { description: "Campaigns processed" },
                },
            },
        },
        "/populate-campaign-content": {
            post: {
                tags: ["Campaigns"],
                summary: "Populate campaign content",
                description: "Generate and populate campaign content",
                responses: {
                    "200": { description: "Content populated" },
                },
            },
        },
        "/send-weekly-campaign": {
            post: {
                tags: ["Campaigns"],
                summary: "Send weekly campaign",
                description: "Send weekly newsletter campaign",
                responses: {
                    "200": { description: "Campaign sent" },
                },
            },
        },
        "/lead-nurture": {
            post: {
                tags: ["Leads"],
                summary: "Nurture leads",
                description: "Execute lead nurturing workflows",
                responses: {
                    "200": { description: "Leads nurtured" },
                },
            },
        },
        "/lead-scoring-automation": {
            post: {
                tags: ["Leads"],
                summary: "Lead scoring automation",
                description: "Automatically update lead scores based on behavior",
                responses: {
                    "200": { description: "Scores updated" },
                },
            },
        },
        "/optimize-send-times": {
            post: {
                tags: ["Leads"],
                summary: "Optimize email send times",
                description: "Determine optimal send times for each lead",
                responses: {
                    "200": { description: "Send times optimized" },
                },
            },
        },
        "/process-abandoned-checkouts": {
            post: {
                tags: ["Automation"],
                summary: "Process abandoned checkouts",
                description: "Send recovery emails for abandoned checkouts",
                responses: {
                    "200": { description: "Abandoned checkouts processed" },
                },
            },
        },
        "/check-expired-payments": {
            post: {
                tags: ["Automation"],
                summary: "Check expired payments",
                description: "Check for and handle expired payment intents",
                responses: {
                    "200": { description: "Expired payments checked" },
                },
            },
        },
        "/check-recovery-alerts": {
            post: {
                tags: ["Automation"],
                summary: "Check recovery alerts",
                description: "Check and send recovery alerts",
                responses: {
                    "200": { description: "Recovery alerts checked" },
                },
            },
        },
        "/maintain-event-lifecycle": {
            post: {
                tags: ["Automation"],
                summary: "Maintain event lifecycle",
                description: "Maintain and clean up event data",
                responses: {
                    "200": { description: "Events maintained" },
                },
            },
        },
        "/auto-send-summaries": {
            post: {
                tags: ["Automation"],
                summary: "Auto-send summaries",
                description: "Automatically send summary emails",
                responses: {
                    "200": { description: "Summaries sent" },
                },
            },
        },
        "/ai-course-advisor": {
            post: {
                tags: ["AI"],
                summary: "AI course advisor",
                description: "Get AI-powered course recommendations",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    userProfile: { type: "object" },
                                    preferences: { type: "object" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Course recommendations",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        recommendations: { type: "array", items: { type: "object" } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/predict-alerts": {
            post: {
                tags: ["AI"],
                summary: "Predict alerts",
                description: "Use AI to predict when alerts should be sent",
                responses: {
                    "200": { description: "Predictions generated" },
                },
            },
        },
        "/validate-predictions": {
            post: {
                tags: ["AI"],
                summary: "Validate predictions",
                description: "Validate AI prediction accuracy",
                responses: {
                    "200": { description: "Predictions validated" },
                },
            },
        },
        "/manage-user-roles": {
            post: {
                tags: ["User Management"],
                summary: "Manage user roles",
                description: "Update user roles and permissions",
                responses: {
                    "200": { description: "Roles updated" },
                },
            },
        },
        "/submit-course-inquiry": {
            post: {
                tags: ["User Management"],
                summary: "Submit course inquiry",
                description: "Submit a course inquiry form",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "course"],
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    course: { type: "string" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": { description: "Inquiry submitted" },
                },
            },
        },
        "/contact-chat": {
            post: {
                tags: ["User Management"],
                summary: "Contact chat",
                description: "Send a message via contact chat",
                responses: {
                    "200": { description: "Message sent" },
                },
            },
        },
        "/form-analytics-alerts": {
            post: {
                tags: ["Alerts"],
                summary: "Form analytics alerts",
                description: "Send alerts based on form analytics",
                responses: {
                    "200": { description: "Alerts sent" },
                },
            },
        },
        "/send-sla-alert": {
            post: {
                tags: ["Alerts"],
                summary: "Send SLA alert",
                description: "Send SLA breach alerts",
                responses: {
                    "200": { description: "Alert sent" },
                },
            },
        },
        "/send-admin-notification": {
            post: {
                tags: ["Email"],
                summary: "Send admin notification",
                description: "Send notification to administrators",
                responses: {
                    "200": { description: "Notification sent" },
                },
            },
        },
        "/send-bank-transfer-instructions": {
            post: {
                tags: ["Email"],
                summary: "Send bank transfer instructions",
                description: "Send bank transfer payment instructions",
                responses: {
                    "200": { description: "Instructions sent" },
                },
            },
        },
        "/send-campaign-approval-notification": {
            post: {
                tags: ["Email"],
                summary: "Send campaign approval notification",
                description: "Notify about campaign approval status",
                responses: {
                    "200": { description: "Notification sent" },
                },
            },
        },
        "/send-chat-transcript": {
            post: {
                tags: ["Email"],
                summary: "Send chat transcript",
                description: "Email chat transcript to user",
                responses: {
                    "200": { description: "Transcript sent" },
                },
            },
        },
        "/send-conversation-summary": {
            post: {
                tags: ["Email"],
                summary: "Send conversation summary",
                description: "Send conversation summary email",
                responses: {
                    "200": { description: "Summary sent" },
                },
            },
        },
        "/send-daily-digest": {
            post: {
                tags: ["Email"],
                summary: "Send daily digest",
                description: "Send daily digest email",
                responses: {
                    "200": { description: "Digest sent" },
                },
            },
        },
        "/send-digest-emails": {
            post: {
                tags: ["Email"],
                summary: "Send digest emails",
                description: "Send digest emails to subscribers",
                responses: {
                    "200": { description: "Digests sent" },
                },
            },
        },
        "/send-discussion-email": {
            post: {
                tags: ["Email"],
                summary: "Send discussion email",
                description: "Send discussion notification email",
                responses: {
                    "200": { description: "Email sent" },
                },
            },
        },
        "/send-payment-reminder": {
            post: {
                tags: ["Email"],
                summary: "Send payment reminder",
                description: "Send payment reminder email",
                responses: {
                    "200": { description: "Reminder sent" },
                },
            },
        },
        "/send-test-notification": {
            post: {
                tags: ["Email"],
                summary: "Send test notification",
                description: "Send test notification email",
                responses: {
                    "200": { description: "Test sent" },
                },
            },
        },
        "/send-voucher-email": {
            post: {
                tags: ["Email"],
                summary: "Send voucher email",
                description: "Send voucher code via email",
                responses: {
                    "200": { description: "Voucher sent" },
                },
            },
        },
        "/get-courses": {
            get: {
                tags: ["Courses"],
                summary: "Get all courses",
                description: "Retrieve a list of courses with filtering and pagination",
                parameters: [
                    { name: "category", in: "query", schema: { type: "string" } },
                    { name: "level", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of courses" },
                },
            },
        },
        "/get-course": {
            get: {
                tags: ["Courses"],
                summary: "Get course details",
                description: "Retrieve details for a specific course by ID",
                parameters: [
                    { name: "id", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": { description: "Course details" },
                    "404": { description: "Course not found" },
                },
            },
        },
        "/get-jobs": {
            get: {
                tags: ["Jobs"],
                summary: "Get all jobs",
                description: "Retrieve a list of jobs with filtering",
                parameters: [
                    { name: "status", in: "query", schema: { type: "string", default: "active" } },
                    { name: "type", in: "query", schema: { type: "string" } },
                    { name: "location", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of jobs" },
                },
            },
        },
        "/get-job": {
            get: {
                tags: ["Jobs"],
                summary: "Get job details",
                description: "Retrieve details for a specific job by ID",
                parameters: [
                    { name: "id", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": { description: "Job details" },
                    "404": { description: "Job not found" },
                },
            },
        },
        "/get-blogs": {
            get: {
                tags: ["Blogs"],
                summary: "Get all blogs",
                description: "Retrieve a list of blogs with filtering",
                parameters: [
                    { name: "category", in: "query", schema: { type: "string" } },
                    { name: "status", in: "query", schema: { type: "string", default: "published" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of blogs" },
                },
            },
        },
        "/get-blog": {
            get: {
                tags: ["Blogs"],
                summary: "Get blog details",
                description: "Retrieve details for a specific blog by slug",
                parameters: [
                    { name: "slug", in: "query", required: true, schema: { type: "string" } },
                ],
                responses: {
                    "200": { description: "Blog details" },
                    "404": { description: "Blog not found" },
                },
            },
        },
        "/get-consultations": {
            get: {
                tags: ["Consultations"],
                summary: "Get consultations",
                description: "Retrieve consultation requests",
                parameters: [
                    { name: "status", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of consultations" },
                },
            },
        },
        "/get-registrations": {
            get: {
                tags: ["Registrations"],
                summary: "Get registrations",
                description: "Retrieve course registrations",
                parameters: [
                    { name: "status", in: "query", schema: { type: "string" } },
                    { name: "course_name", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of registrations" },
                },
            },
        },
        "/get-events": {
            get: {
                tags: ["Events"],
                summary: "Get events",
                description: "Retrieve events",
                parameters: [
                    { name: "is_active", in: "query", schema: { type: "boolean" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of events" },
                },
            },
        },
        "/get-monitoring-alerts": {
            get: {
                tags: ["Monitoring"],
                summary: "Get monitoring alerts",
                description: "Retrieve AML/KYC monitoring alerts",
                parameters: [
                    { name: "status", in: "query", schema: { type: "string" } },
                    { name: "severity", in: "query", schema: { type: "string" } },
                    { name: "monitoring_type", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of alerts" },
                },
            },
        },
        "/get-monitoring-cases": {
            get: {
                tags: ["Monitoring"],
                summary: "Get monitoring cases",
                description: "Retrieve AML/KYC monitoring cases",
                parameters: [
                    { name: "status", in: "query", schema: { type: "string" } },
                    { name: "priority", in: "query", schema: { type: "string" } },
                    { name: "assign_to", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of cases" },
                },
            },
        },
        "/get-modules": {
            get: {
                tags: ["Courses"],
                summary: "Get course modules",
                description: "Retrieve course modules/sections",
                parameters: [
                    { name: "course_id", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of modules" },
                },
            },
        },
        "/get-course-library": {
            get: {
                tags: ["Courses"],
                summary: "Get course library",
                description: "Retrieve course videos and materials",
                parameters: [
                    { name: "course_id", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of library items" },
                },
            },
        },
        "/get-quiz-questions": {
            get: {
                tags: ["Courses"],
                summary: "Get quiz questions",
                description: "Retrieve quiz questions",
                parameters: [
                    { name: "quiz_id", in: "query", schema: { type: "string" } },
                    { name: "type", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of questions" },
                },
            },
        },
        "/get-users": {
            get: {
                tags: ["User Management"],
                summary: "Get users",
                description: "Retrieve user profiles",
                parameters: [
                    { name: "role", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of users" },
                },
            },
        },
        "/get-teachers": {
            get: {
                tags: ["User Management"],
                summary: "Get teachers",
                description: "Retrieve teacher profiles",
                parameters: [
                    { name: "is_verified", in: "query", schema: { type: "boolean" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of teachers" },
                },
            },
        },
        "/get-course-progress": {
            get: {
                tags: ["Courses"],
                summary: "Get course progress",
                description: "Retrieve student progress tracking",
                parameters: [
                    { name: "user_id", in: "query", schema: { type: "string" } },
                    { name: "course_id", in: "query", schema: { type: "string" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
                ],
                responses: {
                    "200": { description: "List of progress records" },
                },
            },
        },
        "/create-course": {
            post: {
                tags: ["Courses"],
                summary: "Create course",
                description: "Create a new course (Admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["title"],
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    // Add other properties as needed based on schema
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": { description: "Course created" },
                    "401": { description: "Unauthorized" },
                },
            },
        },
        "/update-course": {
            put: {
                tags: ["Courses"],
                summary: "Update course",
                description: "Update an existing course (Admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["id"],
                                properties: {
                                    id: { type: "string" },
                                    title: { type: "string" },
                                    // Add other properties
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": { description: "Course updated" },
                    "401": { description: "Unauthorized" },
                },
            },
        },
        "/delete-course": {
            delete: {
                tags: ["Courses"],
                summary: "Delete course",
                description: "Delete a course (Admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "query", schema: { type: "string" }, required: true },
                ],
                responses: {
                    "200": { description: "Course deleted" },
                    "401": { description: "Unauthorized" },
                },
            },
        },
        "/create-job": {
            post: {
                tags: ["Jobs"],
                summary: "Create job",
                description: "Create a new job (Admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["title"],
                                properties: {
                                    title: { type: "string" },
                                    // Add other properties
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": { description: "Job created" },
                    "401": { description: "Unauthorized" },
                },
            },
        },
        "/update-job": {
            put: {
                tags: ["Jobs"],
                summary: "Update job",
                description: "Update an existing job (Admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["id"],
                                properties: {
                                    id: { type: "string" },
                                    // Add other properties
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": { description: "Job updated" },
                    "401": { description: "Unauthorized" },
                },
            },
        },
        "/delete-job": {
            delete: {
                tags: ["Jobs"],
                summary: "Delete job",
                description: "Delete a job (Admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "query", schema: { type: "string" }, required: true },
                ],
                responses: {
                    "200": { description: "Job deleted" },
                    "401": { description: "Unauthorized" },
                },
            },
        },
        "/academy-integration": {
            post: {
                tags: ["User Management"],
                summary: "Academy integration",
                description: "Integrate with academy platform",
                responses: {
                    "200": { description: "Integration successful" },
                },
            },
        },
        "/login": {
            post: {
                tags: ["Authentication"],
                summary: "User login",
                description: "Authenticate user with email and password, returns JWT token",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                    password: { type: "string", format: "password", example: "your-password" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Login successful",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean", example: true },
                                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                                        user: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", format: "uuid" },
                                                email: { type: "string", format: "email" },
                                                username: { type: "string" },
                                                role: { type: "string" },
                                                userType: { type: "string", example: "bloguser" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": { description: "Invalid email or password" },
                    "400": { description: "Missing required fields" },
                },
            },
        },
        "/me": {
            get: {
                tags: ["Authentication"],
                summary: "Get current user",
                description: "Get authenticated user information (requires JWT token)",
                security: [{ BearerAuth: [] }],
                responses: {
                    "200": {
                        description: "User information",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                        user: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", format: "uuid" },
                                                email: { type: "string", format: "email" },
                                                username: { type: "string" },
                                                role: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": { description: "Unauthorized - Invalid or missing token" },
                },
            },
        },
        "/get-event": {
            get: {
                tags: ["Events"],
                summary: "Get event by ID",
                description: "Retrieve a single event by its ID",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Event ID",
                    },
                ],
                responses: {
                    "200": {
                        description: "Event details",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        event: { type: "object" },
                                    },
                                },
                            },
                        },
                    },
                    "404": { description: "Event not found" },
                    "400": { description: "Event ID is required" },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "apikey",
                description: "Supabase API key",
            },
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                description: "JWT token from Supabase Auth",
            },
        },
    },
    security: [
        {
            ApiKeyAuth: [],
        },
    ],
};
