import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankTransferInstructionsRequest {
  customerEmail: string;
  customerName: string;
  courseTitle: string;
  amount: number;
  paymentReference: string;
  expiresAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, courseTitle, amount, paymentReference, expiresAt }: BankTransferInstructionsRequest = await req.json();

    console.log('Sending bank transfer instructions to:', customerEmail);

    const accountName = Deno.env.get("BANK_TRANSFER_ACCOUNT_NAME") || "Titans Corporate Training Ltd";
    const sortCode = Deno.env.get("BANK_TRANSFER_SORT_CODE") || "12-34-56";
    const accountNumber = Deno.env.get("BANK_TRANSFER_ACCOUNT_NUMBER") || "12345678";

    const expiryDate = new Date(expiresAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: "Titans Training <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Bank Transfer Instructions - ${courseTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .bank-details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; color: #666; }
              .detail-value { color: #333; font-family: monospace; }
              .reference { background: #667eea; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 2px; border-radius: 4px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bank Transfer Payment Instructions</h1>
              </div>
              <div class="content">
                <p>Dear ${customerName},</p>
                <p>Thank you for enrolling in <strong>${courseTitle}</strong>!</p>
                <p>To complete your enrollment, please transfer <strong>£${amount.toFixed(2)}</strong> using the bank details below:</p>
                
                <div class="bank-details">
                  <div class="detail-row">
                    <span class="detail-label">Account Name:</span>
                    <span class="detail-value">${accountName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Sort Code:</span>
                    <span class="detail-value">${sortCode}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Account Number:</span>
                    <span class="detail-value">${accountNumber}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">£${amount.toFixed(2)}</span>
                  </div>
                </div>

                <p><strong>IMPORTANT - Payment Reference:</strong></p>
                <div class="reference">${paymentReference}</div>
                <p style="text-align: center; color: #666; font-size: 14px;">Please use this exact reference when making your payment</p>

                <div class="warning">
                  <strong>⏰ Payment Deadline:</strong><br/>
                  Your payment must be received by <strong>${expiryDate}</strong><br/>
                  After this time, your enrollment will expire and you'll need to re-register.
                </div>

                <h3>Next Steps:</h3>
                <ol>
                  <li>Make the bank transfer using the details above</li>
                  <li>Include the payment reference: <strong>${paymentReference}</strong></li>
                  <li>Upload proof of payment at your payment status page</li>
                  <li>We'll verify your payment within 1-2 business days</li>
                  <li>You'll receive a confirmation email once verified</li>
                </ol>

                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br/>The Titans Training Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Bank transfer instructions sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error sending bank transfer instructions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
