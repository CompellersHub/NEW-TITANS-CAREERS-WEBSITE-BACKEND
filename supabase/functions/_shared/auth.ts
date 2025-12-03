import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkAdmin(req: Request, supabase: SupabaseClient): Promise<boolean> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return false;

    // Check role in users table
    // We match by email since migrated users might not have auth_id linked yet
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

    return profile?.role === 'admin' || profile?.role === 'superuser';
}
