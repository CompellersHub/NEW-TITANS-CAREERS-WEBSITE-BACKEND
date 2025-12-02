# Titans Careers API Documentation

## Overview

This directory contains the Swagger UI documentation system for all Titans Careers API endpoints.

## Accessing the Documentation

### Local Development
If running Supabase locally:
```
http://localhost:54321/functions/v1/swagger-ui
```

### Production
Replace `{project-id}` with your Supabase project ID:
```
https://{project-id}.supabase.co/functions/v1/swagger-ui
```

## Features

- **Interactive API Documentation**: Browse all 51 API endpoints with detailed descriptions
- **Try It Out**: Test API endpoints directly from the browser
- **Request/Response Examples**: See example requests and responses for each endpoint
- **Schema Validation**: View request and response schemas
- **Organized by Category**: Endpoints grouped by functionality (Payment, Email, Analytics, etc.)
- **CORS Enabled**: All endpoints support cross-origin requests from any domain

## API Categories

### Payment Processing
- `create-checkout-session` - Create Stripe checkout sessions
- `create-bank-transfer` - Initiate bank transfer payments
- `create-paypal-order` - Create PayPal orders
- `create-payl8r-application` - Create Payl8r finance applications
- `validate-voucher` - Validate discount vouchers

### Webhooks
- `stripe-webhook` - Handle Stripe events
- `paypal-webhook` - Handle PayPal events
- `payl8r-webhook` - Handle Payl8r events
- `email-webhook` - Handle email service events

### Email & Notifications
- `newsletter-signup` - Subscribe users to newsletter
- `send-*` functions - Various email sending capabilities (15 endpoints)

### Analytics & Tracking
- `track-behavior` - Track user behavior and update lead scores
- `track-email-open` - Track email opens via pixel
- `track-email-click` - Track email link clicks
- `track-email-link` - Track email link interactions
- `update-engagement-scores` - Update user engagement scores

### Campaign Management
- `process-scheduled-campaigns` - Process scheduled campaigns
- `send-ab-test` - Send A/B test campaigns
- `select-ab-winner` - Select winning A/B test variant
- `send-ab-winner` - Send winning variant to audience
- `populate-campaign-content` - Generate campaign content

### Lead Management
- `lead-nurture` - Execute lead nurturing workflows
- `lead-scoring-automation` - Automated lead scoring
- `optimize-send-times` - Determine optimal send times

### Automation
- `process-abandoned-checkouts` - Send abandoned cart recovery emails
- `check-expired-payments` - Handle expired payments
- `check-recovery-alerts` - Send recovery alerts
- `maintain-event-lifecycle` - Clean up event data
- `auto-send-summaries` - Send automated summaries

### AI Features
- `ai-course-advisor` - Get AI-powered course recommendations
- `predict-alerts` - Predict optimal alert timing
- `validate-predictions` - Validate AI prediction accuracy

### User Management
- `manage-user-roles` - Update user roles and permissions
- `submit-course-inquiry` - Submit course inquiry forms
- `contact-chat` - Send contact messages
- `academy-integration` - Integrate with academy platform

### Alerts
- `form-analytics-alerts` - Send form analytics alerts
- `send-sla-alert` - Send SLA breach alerts

## Downloading OpenAPI Specification

You can download the OpenAPI specification in JSON format:

```
https://{project-id}.supabase.co/functions/v1/swagger-ui/openapi.json
```

Or add `?format=json` to the main URL:
```
https://{project-id}.supabase.co/functions/v1/swagger-ui?format=json
```

## Authentication

Most endpoints require authentication via:
- **API Key**: Include your Supabase `apikey` in the request header
- **Bearer Token**: Include a JWT token from Supabase Auth in the Authorization header

## CORS Configuration

All API endpoints are configured with:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

This allows requests from any origin, making the API accessible from any web application.

## Files

- `index.ts` - Main Swagger UI endpoint handler
- `openapi-spec.ts` - Complete OpenAPI 3.0 specification
- `README.md` - This documentation file

## Shared Utilities

The `_shared/cors.ts` module provides reusable CORS utilities:
```typescript
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
```

## Development

To modify the API documentation:

1. Edit `openapi-spec.ts` to update endpoint definitions
2. The Swagger UI will automatically reflect changes
3. Deploy the function: `supabase functions deploy swagger-ui`

## Support

For questions or issues, contact the Titans Careers development team.
