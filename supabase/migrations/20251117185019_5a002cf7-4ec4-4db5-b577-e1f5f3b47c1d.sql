-- Fix user_order_history view to match expected interface
DROP VIEW IF EXISTS public.user_order_history CASCADE;

CREATE VIEW public.user_order_history
WITH (security_invoker=on) AS
SELECT 
  e.id,
  e.customer_email,
  e.course_slug,
  e.course_title,
  e.price,
  e.created_at as purchase_date,
  e.payment_method,
  e.payment_status as display_status,
  e.payment_provider_reference as payment_reference,
  NULL::timestamp with time zone as expires_at,
  NULL::text[] as payment_proof_urls,
  NULL::timestamp with time zone as verified_at,
  e.payment_metadata
FROM enrollments e

UNION ALL

SELECT 
  bt.id,
  bt.customer_email,
  bt.course_slug,
  bt.course_title,
  bt.amount as price,
  bt.created_at as purchase_date,
  'bank_transfer' as payment_method,
  bt.status as display_status,
  bt.payment_reference,
  bt.expires_at,
  bt.payment_proof_urls,
  bt.verified_at,
  '{}'::jsonb as payment_metadata
FROM bank_transfer_orders bt

ORDER BY purchase_date DESC;