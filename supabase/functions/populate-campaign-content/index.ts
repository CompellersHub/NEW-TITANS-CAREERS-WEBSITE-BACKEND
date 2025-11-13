import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Starter campaign content
const starterContent = [
  // Career Tips
  {
    content_key: "career_tip_1",
    campaign_type: "career_tips",
    subject: "5 LinkedIn Profile Mistakes Costing You Job Offers",
    preview_text: "These simple fixes could double your recruiter responses",
    html_content: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fbbf24; margin: 0;">LinkedIn Mistakes to Fix Now</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi there! 👋</p>
          
          <p>Your LinkedIn profile is your 24/7 job interview. Here are 5 critical mistakes that could be costing you opportunities:</p>
          
          <h2 style="color: #1e3a5f;">1. Generic Headline</h2>
          <p><strong>Instead of:</strong> "Seeking new opportunities"<br>
          <strong>Try:</strong> "AML Analyst | Financial Crime Prevention | ICA Certified"</p>
          
          <h2 style="color: #1e3a5f;">2. No Keywords in About Section</h2>
          <p>Recruiters search for specific terms. Include the exact job titles and skills from your target roles.</p>
          
          <h2 style="color: #1e3a5f;">3. Experience That Doesn't Tell a Story</h2>
          <p>Don't just list duties. Show impact with numbers: "Analyzed sales data to identify trends, increasing revenue by 23%"</p>
          
          <h2 style="color: #1e3a5f;">4. Missing Featured Section</h2>
          <p>Showcase your portfolio, certifications, and case studies in the Featured section.</p>
          
          <h2 style="color: #1e3a5f;">5. No Engagement Activity</h2>
          <p>Comment on 3 posts per day in your industry. Recruiters check who's active in the field.</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
            <strong>Action Item:</strong> Spend 20 minutes this week fixing these 5 items. Track how your profile views increase!
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://titanscareer.com/resources" style="display: inline-block; background: #fbbf24; color: #1e3a5f; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Download Our LinkedIn Template
            </a>
          </div>
          
          <p>To your success,<br><strong>The Titans Careers Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Titans Careers | Building Real Careers</p>
        </div>
      </body>
      </html>
    `,
    priority: 10,
  },
  {
    content_key: "career_tip_2",
    campaign_type: "career_tips",
    subject: "How to Negotiate £5K More (Without Being Awkward)",
    preview_text: "The exact script our students use to boost their offers",
    html_content: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fbbf24; margin: 0;">Salary Negotiation Script</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Most people leave £5,000-£10,000 on the table because they're afraid to negotiate. Here's the exact script that works:</p>
          
          <h2 style="color: #1e3a5f;">The 3-Step Framework</h2>
          
          <h3 style="color: #2563eb;">Step 1: Show Enthusiasm</h3>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; font-style: italic;">
            "I'm really excited about this opportunity and I can see myself making a significant impact on your team..."
          </p>
          
          <h3 style="color: #2563eb;">Step 2: Present Market Data</h3>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; font-style: italic;">
            "Based on my research and the market rate for AML Analysts with my skill set in London, I was expecting something in the range of £35,000-£38,000..."
          </p>
          
          <h3 style="color: #2563eb;">Step 3: Leave Room for Discussion</h3>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; font-style: italic;">
            "Is there flexibility in the salary range you've offered?"
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
            <strong>Pro Tip:</strong> Never give a single number. Always give a range, and make the bottom of your range higher than their initial offer.
          </div>
          
          <h2 style="color: #1e3a5f;">What NOT to Say</h2>
          <ul>
            <li>❌ "I really need more money"</li>
            <li>❌ "My friend makes more than that"</li>
            <li>❌ "That's too low" (without data)</li>
          </ul>
          
          <p><strong>Real Result:</strong> Sarah, one of our students, used this exact script and increased her offer from £31K to £36K. That's £5K more per year!</p>
          
          <p>To your success,<br><strong>The Titans Careers Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Titans Careers | Building Real Careers</p>
        </div>
      </body>
      </html>
    `,
    priority: 9,
  },
  
  // Job Alerts
  {
    content_key: "job_alert_1",
    campaign_type: "job_alerts",
    subject: "15 AML Analyst Roles Hiring Now (£30-40K)",
    preview_text: "Remote & London positions - apply before Friday",
    html_content: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fbbf24; margin: 0;">🔥 Hot Jobs This Week</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p><strong>15 companies are actively hiring AML Analysts this week.</strong> These roles won't last long!</p>
          
          <div style="border: 2px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #1e3a5f; margin-top: 0;">Featured: Remote AML Analyst</h3>
            <p><strong>Company:</strong> FinTech Scale-up<br>
            <strong>Salary:</strong> £35,000 - £40,000<br>
            <strong>Location:</strong> Fully Remote UK<br>
            <strong>Experience:</strong> Entry Level Welcome</p>
            <p><strong>Why It's Great:</strong> Growing company, modern tools, strong training program</p>
            <a href="https://titanscareer.com/courses" style="display: inline-block; background: #fbbf24; color: #1e3a5f; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Apply Now
            </a>
          </div>
          
          <h3 style="color: #1e3a5f;">More Opportunities:</h3>
          
          <div style="background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 3px solid #2563eb;">
            <strong>KYC Analyst - London</strong> | £32K | Hybrid<br>
            <span style="color: #6b7280;">Major Bank | Closing Friday</span>
          </div>
          
          <div style="background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 3px solid #2563eb;">
            <strong>Transaction Monitoring Analyst - Manchester</strong> | £30-35K | Office<br>
            <span style="color: #6b7280;">Financial Services | No experience required</span>
          </div>
          
          <div style="background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 3px solid #2563eb;">
            <strong>Compliance Analyst - Remote</strong> | £33-38K | Remote<br>
            <span style="color: #6b7280;">Insurance | ICA qualified preferred</span>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
            <strong>Application Tip:</strong> Apply within 48 hours of job posting. Early applicants get 3x more interview invites!
          </div>
          
          <p><strong>Not Job Ready Yet?</strong> Our 8-week AML course gets you interview-ready with portfolio projects that employers actually want to see.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://titanscareer.com/courses" style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Our Courses
            </a>
          </div>
          
          <p>To your success,<br><strong>The Titans Careers Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Titans Careers | Building Real Careers</p>
        </div>
      </body>
      </html>
    `,
    priority: 10,
  },
  
  // Course Updates
  {
    content_key: "course_update_1",
    campaign_type: "course_updates",
    subject: "New Cohort Starting Feb 10th - Last 8 Spots",
    preview_text: "Join 300+ career switchers who landed £30K+ roles",
    html_content: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fbbf24; margin: 0;">⚡ Next Cohort Almost Full</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 18px; font-weight: bold; color: #1e3a5f;">Only 8 spots remaining for our February cohort!</p>
          
          <p>Our AML Compliance course starts February 10th, and we're down to the last few spots. Here's what you'll get:</p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1e3a5f; margin-top: 0;">8-Week Intensive Program</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Week 1-2:</strong> AML Fundamentals & UK Regulations</li>
              <li><strong>Week 3-4:</strong> Transaction Monitoring & Screening</li>
              <li><strong>Week 5-6:</strong> SAR Writing & Case Studies</li>
              <li><strong>Week 7-8:</strong> Portfolio Projects & Interview Prep</li>
            </ul>
          </div>
          
          <h3 style="color: #1e3a5f;">What Makes Us Different?</h3>
          <ul>
            <li>✅ <strong>Real Tools:</strong> Actimize, World-Check simulations</li>
            <li>✅ <strong>Portfolio Projects:</strong> 3 case studies for interviews</li>
            <li>✅ <strong>Job Support:</strong> CV review, mock interviews, job board</li>
            <li>✅ <strong>ICA Certification:</strong> Exam prep included</li>
          </ul>
          
          <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
            <strong>Student Success:</strong> 85% of our graduates land AML roles within 3 months of completing the course. Average starting salary: £33,500.
          </div>
          
          <h3 style="color: #1e3a5f;">Course Schedule</h3>
          <p>
            <strong>Start Date:</strong> February 10, 2025<br>
            <strong>Duration:</strong> 8 weeks<br>
            <strong>Format:</strong> Online, Live Sessions + Self-Paced<br>
            <strong>Time:</strong> Evenings & Weekends (work-friendly)<br>
            <strong>Investment:</strong> £999 or £350/month for 3 months
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://titanscareer.com/courses" style="display: inline-block; background: #fbbf24; color: #1e3a5f; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
              Secure Your Spot →
            </a>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            <strong>⏰ Last 8 spots</strong> | Join 300+ successful career switchers
          </p>
          
          <p>Questions? Just reply to this email - we're here to help!</p>
          
          <p>To your success,<br><strong>The Titans Careers Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Titans Careers | Building Real Careers</p>
        </div>
      </body>
      </html>
    `,
    priority: 10,
  },
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Populating campaign content...");

    const results = [];
    
    for (const content of starterContent) {
      const { data, error } = await supabase
        .from("campaign_content")
        .insert(content)
        .select()
        .single();

      if (error) {
        console.error(`Error inserting ${content.content_key}:`, error);
        results.push({ key: content.content_key, status: "error", error: error.message });
      } else {
        console.log(`Inserted ${content.content_key}`);
        results.push({ key: content.content_key, status: "success" });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Campaign content populated",
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
