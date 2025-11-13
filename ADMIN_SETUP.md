# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for managing newsletter subscribers.

## Features

✅ **Role-Based Access Control** - Secure admin authentication system  
✅ **Subscriber Management** - View, filter, and search all newsletter subscribers  
✅ **Export to CSV** - Download subscriber lists for email campaigns  
✅ **Unsubscribe Management** - Mark subscribers as active/inactive  
✅ **Bulk Actions** - Delete subscribers permanently  
✅ **WhatsApp Tracking** - See which subscribers provided WhatsApp numbers  
✅ **Source Tracking** - Know where each subscriber came from  
✅ **Real-time Stats** - Dashboard showing key metrics  

## 🔐 Creating Your First Admin User

### Step 1: Create an Account
1. Visit `/auth` on your site
2. Click "Sign Up" tab
3. Create an account with your email and password
4. You'll be automatically logged in

### Step 2: Make Yourself Admin
You need to manually add the admin role to your user in the database.

**Option A: Using Cloud UI (Easiest)**
1. Open Lovable Cloud → Database → Tables
2. Find the `user_roles` table
3. Click "Insert row"
4. Fill in:
   - `user_id`: Your user ID (copy from auth.users table)
   - `role`: Select "admin" from dropdown
5. Click "Save"

**Option B: Using SQL**
Run this query in the Lovable Cloud SQL editor:
```sql
-- First, find your user ID
SELECT id, email FROM auth.users;

-- Then insert admin role (replace YOUR_USER_ID with actual ID)
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### Step 3: Access Admin Dashboard
1. Log in to your account
2. Click your account menu in the navbar
3. Select "Admin Dashboard"
4. Or navigate directly to `/admin`

## 📊 Using the Admin Dashboard

### Dashboard Overview
The dashboard shows four key metrics:
- **Total Subscribers**: All subscribers ever signed up
- **Active Subscribers**: Currently subscribed users
- **With WhatsApp**: Subscribers who provided WhatsApp numbers
- **This Month**: New subscribers this month

### Searching & Filtering

**Search Bar**
- Search by email, name, or WhatsApp number
- Real-time filtering as you type

**Status Filter**
- All Status: Show everyone
- Active: Only active subscribers
- Inactive: Only unsubscribed users

**Source Filter**
- Filter by signup source (footer, blog, resources, etc.)
- Useful for tracking which pages convert best

### Managing Subscribers

**Unsubscribe a User**
1. Find the subscriber in the table
2. Click the user-x icon (✗)
3. User is marked as inactive

**Reactivate a User**
1. Filter by "Inactive" status
2. Find the user
3. Click the user-check icon (✓)
4. User is marked as active again

**Delete a User Permanently**
1. Find the subscriber
2. Click the trash icon (🗑️)
3. Confirm deletion
4. **Warning**: This cannot be undone!

### Exporting Data

**Export to CSV**
1. Use filters to select the subscribers you want
2. Click "Export CSV" button
3. File downloads automatically
4. Import into Brevo, Mailchimp, or any email platform

**CSV Includes:**
- Email address
- Name
- WhatsApp number
- Signup source
- Subscription date
- Active status
- Welcome email status

## 🔒 Security Best Practices

### Admin Access
- ✅ **DO** create unique admin accounts for each team member
- ✅ **DO** use strong passwords (12+ characters)
- ❌ **DON'T** share admin credentials
- ❌ **DON'T** give admin access to unnecessary users

### Database Security
The admin system uses:
- Row Level Security (RLS) policies
- Security definer functions to prevent SQL injection
- Role-based access control (RBAC)
- Session-based authentication

### Adding More Admins
To add additional admin users:
```sql
-- Insert admin role for another user
INSERT INTO user_roles (user_id, role)
VALUES ('THEIR_USER_ID', 'admin');
```

## 📧 Integration with Email Campaigns

### Using Exported Data in Brevo

1. **Export from Admin Dashboard**
   - Apply any filters needed
   - Click "Export CSV"

2. **Import to Brevo**
   - Go to Brevo → Contacts → Import
   - Upload the CSV file
   - Map columns (email, name, WhatsApp)
   - Create a contact list

3. **Create Campaign**
   - Go to Campaigns → Create Campaign
   - Select your imported list
   - Design and send your email

### Segmentation Ideas
Use filters to create targeted campaigns:
- **Blog readers**: Source = "blog-page"
- **Resource downloaders**: Source = "resources-page"
- **Homepage signups**: Source = "homepage-section"
- **WhatsApp users**: Has WhatsApp number
- **Recent signups**: Filter by date range

## 🚀 Advanced Features

### Automating Email Campaigns
You can set up automated sequences in Brevo:
1. Welcome email (already automated)
2. Day 3: Free resources
3. Day 7: Course recommendations
4. Day 14: Success stories
5. Weekly: Career tips

### WhatsApp Campaigns (Future)
Once WhatsApp Business API is integrated:
- Send job alerts to WhatsApp subscribers
- Share quick tips and updates
- Personal follow-ups for leads

### Analytics & Reporting
Track these metrics over time:
- Signup conversion rate by source
- Welcome email open rates
- Active vs inactive ratio
- WhatsApp opt-in rate
- Monthly growth trends

## 🛠️ Troubleshooting

### Can't Access Admin Dashboard
**Problem**: "Access Denied" message  
**Solution**: Verify you have admin role in `user_roles` table

### Don't See Any Subscribers
**Problem**: Table is empty  
**Solution**: 
- Check RLS policies are correct
- Verify you're logged in as admin
- Try refreshing the page

### Export Not Working
**Problem**: CSV download fails  
**Solution**: 
- Check browser popup blocker
- Try a different browser
- Check console for errors

### Changes Not Showing
**Problem**: Updates not reflecting  
**Solution**:
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check network tab for errors

## 📝 Database Schema Reference

### `newsletter_subscribers` Table
```sql
- id (uuid): Unique identifier
- email (text): Subscriber email (unique)
- name (text): Optional name
- whatsapp (text): Optional WhatsApp number
- source (text): Signup source
- subscribed_at (timestamp): Signup date
- active (boolean): Subscription status
- welcome_email_sent (boolean): Email sent flag
- metadata (jsonb): Additional data
```

### `user_roles` Table
```sql
- id (uuid): Unique identifier
- user_id (uuid): References auth.users
- role (app_role): 'admin' or 'user'
- created_at (timestamp): Role assigned date
```

## 🎯 Next Steps

1. **Create your admin account** (Step 1-3 above)
2. **Test the dashboard** - Sign up a test subscriber
3. **Export a CSV** - Verify export functionality
4. **Import to Brevo** - Set up your first campaign
5. **Monitor growth** - Check dashboard regularly

For questions or issues, refer to `BREVO_SETUP.md` for email integration details.
