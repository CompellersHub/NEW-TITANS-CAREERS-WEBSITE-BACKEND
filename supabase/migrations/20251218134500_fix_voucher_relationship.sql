DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_voucher_campaigns_voucher_id_fkey') THEN
        -- Check if voucher_id column exists just in case
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scheduled_voucher_campaigns' AND column_name = 'voucher_id') THEN
            ALTER TABLE "public"."scheduled_voucher_campaigns" 
            ADD CONSTRAINT "scheduled_voucher_campaigns_voucher_id_fkey" 
            FOREIGN KEY ("voucher_id") 
            REFERENCES "public"."vouchers" ("id") ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

COMMENT ON CONSTRAINT "scheduled_voucher_campaigns_voucher_id_fkey" ON "public"."scheduled_voucher_campaigns" IS 'vouchers';
