# Payment Gateway Guide

This document explains how the payment system works in the Titans Careers platform, powered by **Stripe Checkout** and **Supabase Edge Functions**.

## 🔄 The User Journey

1.  **Selection**: A user clicks "Enroll Now" on a course page.
2.  **Checkout**: They are redirected to a secure **Stripe Checkout** page (hosted by Stripe).
    *   They see the course name, price, and any applied discounts.
    *   They enter their payment details (credit card, etc.).
3.  **Payment Processing**: Stripe processes the payment securely.
4.  **Success**:
    *   **User Side**: The user is redirected back to the website's "Thank You" page.
    *   **System Side**: Stripe sends a "webhook" signal to our server confirming the payment.
5.  **Fulfillment**: The system automatically:
    *   Creates an **enrollment** record in the database.
    *   Updates the **payment status** to "completed".
    *   Sends a **welcome email** to the user with login details.

---

## 🛠 Technical Architecture

The system consists of two main Edge Functions:

### 1. `create-checkout-session`
*   **Trigger**: Called when the user clicks the "Buy" button on the frontend.
*   **Input**: `courseSlug`, `courseTitle`, `price`, `userEmail`, `voucherCode` (optional).
*   **Action**:
    *   Validates the voucher (if provided) and calculates the final price.
    *   Creates a `payment_intent` record in the Supabase database with status `pending`.
    *   Calls Stripe API to generate a unique Checkout Session URL.
*   **Output**: Returns the Stripe URL to the frontend for redirection.

### 2. `stripe-webhook`
*   **Trigger**: Called automatically by Stripe *after* a successful payment.
*   **Event**: Listens for `checkout.session.completed`.
*   **Action**:
    *   Verifies the cryptographic signature to ensure the request is genuinely from Stripe.
    *   **Enrollment**: Inserts a record into the `enrollments` table, granting the user access to the course.
    *   **Payment Update**: Updates the `payment_intents` table to status `completed`.
    *   **Vouchers**: Increments the usage count for any voucher used.
    *   **Email**: Sends a "Welcome" email using the Resend API.

---

## 🗄 Database Tables Affected

*   **`payment_intents`**: Tracks every attempt to buy a course. (Status flows from `pending` -> `completed`).
*   **`enrollments`**: The source of truth for user access. If a record exists here, the user "owns" the course.
*   **`voucher_usage`**: Logs who used which voucher and when.
*   **`vouchers`**: Updates `usage_count` to enforce limits.

---

## 🔑 Configuration & Keys

The system relies on the following Environment Variables in Supabase:

| Variable | Purpose |
| :--- | :--- |
| `STRIPE_PUBLISHABLE_KEY` | Public key for frontend elements (if needed). |
| `STRIPE_SECRET_KEY` | **Secret** key used by `create-checkout-session` to talk to Stripe. |
| `STRIPE_WEBHOOK_SECRET` | **Secret** key used by `stripe-webhook` to verify request authenticity. |
| `RESEND_API_KEY` | Used to send the confirmation/welcome email. |

> **Note**: The system also supports `PUBLISHABLE__KEY` and `SECRETE_KEY` as aliases for the Stripe keys.

## 🧪 Testing

To test the flow without a real credit card:
1.  Ensure you are using **Test Mode** API keys.
2.  Use the Stripe Test Card numbers (e.g., `4242 4242 4242 4242`).
3.  Any future expiration date and any 3-digit CVC will work.
