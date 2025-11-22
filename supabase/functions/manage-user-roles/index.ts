import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleCheck) {
      throw new Error('User is not an admin');
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'list_users': {
        // List all users with their roles
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) throw listError;

        const usersWithRoles = await Promise.all(
          authUsers.users.map(async (authUser) => {
            const { data: roles } = await supabaseAdmin
              .from('user_roles')
              .select('role')
              .eq('user_id', authUser.id);
            
            return {
              id: authUser.id,
              email: authUser.email,
              created_at: authUser.created_at,
              roles: roles?.map(r => r.role) || []
            };
          })
        );

        return new Response(
          JSON.stringify({ users: usersWithRoles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'grant_role': {
        const { userId, role } = params;
        
        // Insert role
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userId, role })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log the action
        await supabaseAdmin
          .from('role_audit_log')
          .insert({
            action: 'grant_role',
            target_user_id: userId,
            target_role: role,
            performed_by: user.id,
            metadata: { granted_at: new Date().toISOString() }
          });

        return new Response(
          JSON.stringify({ success: true, message: 'Role granted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'revoke_role': {
        const { userId, role } = params;
        
        // Delete role
        const { error: deleteError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (deleteError) throw deleteError;

        // Log the action
        await supabaseAdmin
          .from('role_audit_log')
          .insert({
            action: 'revoke_role',
            target_user_id: userId,
            target_role: role,
            performed_by: user.id,
            metadata: { revoked_at: new Date().toISOString() }
          });

        return new Response(
          JSON.stringify({ success: true, message: 'Role revoked successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_audit_log': {
        const { data: auditLogs, error: auditError } = await supabaseAdmin
          .from('role_audit_log')
          .select('*, performer:performed_by(email), target:target_user_id(email)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (auditError) throw auditError;

        return new Response(
          JSON.stringify({ auditLog: auditLogs }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});