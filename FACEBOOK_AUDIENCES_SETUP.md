# Facebook Custom Audiences Setup Guide

This guide provides step-by-step instructions for creating high-converting custom audiences for retargeting campaigns.

## Prerequisites

- Facebook Pixel installed and firing correctly (verify with Pixel Helper)
- At least 100 website visitors in the last 30 days (recommended)
- Access to Meta Business Suite / Ads Manager

## Quick Access

**Create Audiences Here:**
1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Navigate to: **Audiences** (left sidebar)
3. Click **Create Audience** → **Custom Audience** → **Website**

---

## 🎯 Core Retargeting Audiences

### 1. All Website Visitors (180 days)
**Purpose**: Broad retargeting for brand awareness and general offers

**Setup:**
```
Audience Name: Website Visitors - All (180d)
Description: All users who visited any page in last 180 days

Include people who match:
- Event: PageView
- Time: In the last 180 days

Exclude: None
```

**Use Cases:**
- Brand awareness campaigns
- General course promotions
- Seasonal offers
- Blog content promotion

**Expected Audience Size:** 1,000-10,000+ (depends on traffic)

---

### 2. Course Viewers (30 days)
**Purpose**: Target users interested in specific courses

**Setup:**
```
Audience Name: Course Viewers - Not Purchased (30d)
Description: Users who viewed course pages but didn't purchase

Include people who match:
- Event: ViewContent
- Time: In the last 30 days

Exclude people who match:
- Event: Purchase
- Time: In the last 30 days
```

**Variations by Course Category:**

**2A. AML/KYC Course Viewers**
```
Include people who match:
- Event: ViewContent
- URL contains: /course/aml-kyc
- Time: In the last 30 days

Exclude: Purchase (30d)
```

**2B. Data Analysis Course Viewers**
```
Include people who match:
- Event: ViewContent
- URL contains: /course/data-analysis
- Time: In the last 30 days

Exclude: Purchase (30d)
```

**2C. Cybersecurity Course Viewers**
```
Include people who match:
- Event: ViewContent
- URL contains: /course/cybersecurity
- Time: In the last 30 days

Exclude: Purchase (30d)
```

**Use Cases:**
- Course-specific retargeting ads
- Limited-time course discounts
- Success story testimonials
- Course comparison ads

**Expected Audience Size:** 100-1,000 per course

---

### 3. Checkout Abandoners (14 days)
**Purpose**: Recover high-intent users who started but didn't complete checkout

**Setup:**
```
Audience Name: Checkout Abandoners (14d)
Description: Users who clicked enroll but didn't purchase

Include people who match:
- Event: InitiateCheckout
- Time: In the last 14 days

Exclude people who match:
- Event: Purchase
- Time: In the last 14 days
```

**Advanced Version (High Priority):**
```
Include people who match ALL of:
- Event: InitiateCheckout
- Time: In the last 7 days
- Frequency: At least 2 times

Exclude people who match:
- Event: Purchase
- Time: In the last 14 days
```

**Use Cases:**
- Cart abandonment recovery ads
- Limited-time discount offers
- Payment plan reminders
- Social proof and urgency messaging
- Voucher code offers

**Expected Audience Size:** 50-500 (high-intent, valuable audience)

**Campaign Strategy:**
- Day 1-3: Reminder ads with social proof
- Day 4-7: 10% discount offer
- Day 8-14: Last chance + urgency messaging

---

### 4. Engaged Users (30 days)
**Purpose**: Target highly engaged visitors with strong purchase intent

**Setup:**
```
Audience Name: Engaged Users (30d)
Description: Users who took multiple engagement actions

Include people who match ANY of:
- Event: CTAClick (custom)
- Event: CourseInterest (custom)
- Event: Download (custom)
- Event: Contact
- Event: Lead
- Time: In the last 30 days
- Frequency: At least 3 events

Exclude people who match:
- Event: Purchase
- Time: In the last 30 days
```

**Use Cases:**
- Premium course offers
- Early-bird discounts
- Exclusive webinar invitations
- Personalized consultations

**Expected Audience Size:** 200-2,000

---

### 5. Form Submitters / Leads (90 days)
**Purpose**: Nurture leads who showed interest but haven't purchased

**Setup:**
```
Audience Name: Leads - Not Purchased (90d)
Description: Contact form submitters and newsletter signups

Include people who match ANY of:
- Event: Lead
- Event: Subscribe
- Event: Contact
- Time: In the last 90 days

Exclude people who match:
- Event: Purchase
- Time: In the last 90 days
```

**Segmented Versions:**

**5A. Newsletter Subscribers Only**
```
Include people who match:
- Event: Subscribe
- Time: In the last 90 days

Exclude: Purchase (90d)
```

**5B. Contact Form Leads Only**
```
Include people who match:
- Event: Lead
- URL contains: /contact
- Time: In the last 30 days

Exclude: Purchase (90d)
```

**Use Cases:**
- Lead nurture campaigns
- Free trial offers
- Success story content
- Career transformation stories
- Special consultation offers

**Expected Audience Size:** 100-1,000

---

### 6. Past Purchasers (365 days)
**Purpose**: Cross-sell and upsell to existing customers

**Setup:**
```
Audience Name: Past Purchasers (365d)
Description: Customers who completed a purchase

Include people who match:
- Event: Purchase
- Time: In the last 365 days
```

**Segmented by Recency:**

**6A. Recent Purchasers (30 days)**
```
Include: Purchase (last 30 days)
Use for: Onboarding content, course materials, upsells
```

**6B. Mid-term Purchasers (31-180 days)**
```
Include: Purchase (31-180 days ago)
Use for: Advanced courses, complementary skills
```

**6C. Long-term Purchasers (181-365 days)**
```
Include: Purchase (181-365 days ago)
Use for: Re-engagement, new course launches
```

**Use Cases:**
- Cross-sell complementary courses
- Advanced/premium course offers
- Referral program invitations
- Loyalty rewards
- Success story collection

**Expected Audience Size:** 50-500 (grows over time)

---

## 🎨 Advanced Combination Audiences

### 7. High-Intent Prospects
**Purpose**: Users showing strong purchase signals

**Setup:**
```
Audience Name: High-Intent Prospects (14d)

Include people who match ALL of:
- Event: ViewContent
- Frequency: At least 3 times
- Time: In the last 14 days

AND match ANY of:
- Event: InitiateCheckout
- Event: CTAClick
- Event: Download

Exclude people who match:
- Event: Purchase
- Time: In the last 30 days
```

**Use Cases:**
- High-budget campaigns
- Premium messaging
- Limited-time VIP offers

---

### 8. Price-Sensitive Shoppers
**Purpose**: Users who viewed but need incentive

**Setup:**
```
Audience Name: Price-Sensitive Shoppers (30d)

Include people who match:
- Event: ViewContent
- Frequency: At least 2 times
- Time: In the last 30 days

Exclude people who match ANY of:
- Event: InitiateCheckout (30d)
- Event: Purchase (30d)
```

**Use Cases:**
- Discount code offers
- Payment plan promotions
- Early bird pricing
- Voucher campaigns

---

### 9. Blog Readers
**Purpose**: Content-engaged users

**Setup:**
```
Audience Name: Blog Readers (60d)

Include people who match:
- Event: PageView
- URL contains: /blog/
- Frequency: At least 3 pages
- Time: In the last 60 days

Exclude: Purchase (60d)
```

**Use Cases:**
- Blog-to-course conversion
- Content upgrades
- Lead magnets
- Newsletter signups

---

## 📊 Lookalike Audiences

After building custom audiences, create lookalikes to find similar users:

### Setup Process:
1. Go to Audiences → Create Audience → Lookalike Audience
2. Select source audience (recommendations below)
3. Choose location: United Kingdom
4. Select audience size: 1%-3% (start small, scale up)

### Recommended Lookalike Sources:

**1. Past Purchasers (1%)**
```
Source: Past Purchasers (365d)
Location: United Kingdom
Size: 1%
Name: LAL - Purchasers 1% UK
```
**Best for:** Cold acquisition campaigns

**2. Checkout Abandoners (2%)**
```
Source: Checkout Abandoners (14d)
Location: United Kingdom
Size: 2%
Name: LAL - Checkout 2% UK
```
**Best for:** High-intent prospecting

**3. Engaged Users (3%)**
```
Source: Engaged Users (30d)
Location: United Kingdom
Size: 3%
Name: LAL - Engaged 3% UK
```
**Best for:** Broad reach campaigns

---

## 🚀 Campaign Strategy by Audience

### Course Viewers Campaign
**Objective:** Conversions (Purchase)
**Budget:** £10-20/day
**Ad Creative:**
- Course-specific benefits
- Success stories from that course
- "Limited spots" urgency
- Social proof (student count, ratings)

### Checkout Abandoners Campaign
**Objective:** Conversions (Purchase)
**Budget:** £15-30/day (high priority)
**Ad Strategy:**
- Day 1-3: Reminder + social proof
- Day 4-7: 10% discount offer
- Day 8-14: Last chance + urgency

**Sample Ad Copy:**
```
"You were one step away from transforming your career! 🎯

Complete your enrollment in [Course Name] and get:
✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

Use code COMPLETE10 for 10% off (expires in 48 hours)

[CTA: Complete Enrollment]"
```

### Leads Campaign
**Objective:** Conversions (Lead → Purchase)
**Budget:** £10-15/day
**Ad Creative:**
- Success transformation stories
- Career outcome focus
- Payment plan options
- Free consultation offer

---

## 📈 Performance Monitoring

### Key Metrics by Audience:

**Course Viewers:**
- Target CTR: 2-4%
- Target CPC: £0.50-£1.50
- Target CVR: 1-3%
- Target ROAS: 3:1

**Checkout Abandoners:**
- Target CTR: 3-6%
- Target CPC: £1-£2
- Target CVR: 5-10%
- Target ROAS: 5:1

**Leads:**
- Target CTR: 2-3%
- Target CPC: £0.75-£1.25
- Target CVR: 2-4%
- Target ROAS: 4:1

---

## ⚙️ Audience Maintenance

### Weekly Tasks:
- [ ] Check audience sizes (aim for 1,000+ for stable performance)
- [ ] Review delivery status (audiences under 1,000 may have limited delivery)
- [ ] Exclude recent purchasers from all non-purchaser audiences

### Monthly Tasks:
- [ ] Analyze top-performing audiences
- [ ] Adjust time windows based on performance
- [ ] Create new audience variations for testing
- [ ] Update exclusion lists

### Quarterly Tasks:
- [ ] Full audience audit
- [ ] Create fresh lookalike audiences
- [ ] Retirement of underperforming audiences
- [ ] Strategic audience segmentation review

---

## 🎯 Quick Start Checklist

**Week 1: Foundation**
- [ ] Create "All Website Visitors (180d)"
- [ ] Create "Course Viewers (30d)"
- [ ] Create "Checkout Abandoners (14d)"
- [ ] Verify all audiences are populating

**Week 2: Expansion**
- [ ] Create "Engaged Users (30d)"
- [ ] Create "Leads (90d)"
- [ ] Create course-specific viewer audiences
- [ ] Launch first retargeting campaigns

**Week 3: Optimization**
- [ ] Create "Past Purchasers (365d)"
- [ ] Build lookalike audiences (1%)
- [ ] Add exclusions to prevent overlap
- [ ] A/B test ad creatives

**Week 4: Scale**
- [ ] Expand lookalike percentages (2-3%)
- [ ] Create combination audiences
- [ ] Optimize budget allocation
- [ ] Document winning strategies

---

## 🛠️ Troubleshooting

### Audience Too Small (< 1,000)
**Solutions:**
- Increase time window
- Broaden event criteria
- Combine multiple events
- Wait for more traffic

### Low Match Rate
**Solutions:**
- Implement Advanced Matching
- Add Conversion API
- Include user data (email hash)
- Verify pixel installation

### High Frequency, Low Results
**Solutions:**
- Rotate ad creatives weekly
- Refresh audiences with tighter time windows
- Add new exclusions
- Test new ad formats

---

## 📞 Support & Resources

- [Custom Audiences Guide](https://www.facebook.com/business/help/744354708981227)
- [Lookalike Audiences Best Practices](https://www.facebook.com/business/help/164749007013531)
- [Audience Insights Tool](https://www.facebook.com/business/insights/tools/audience-insights)
- [Meta Learning Hub](https://www.facebook.com/business/learn)
