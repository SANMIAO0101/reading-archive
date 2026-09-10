import { createClient } from '@supabase/supabase-js';
export function adminClient(){
  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('未配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
}
export async function userFromToken(req){
  const h=req.headers.authorization||''; const token=h.startsWith('Bearer ')?h.slice(7):'';
  if(!token) throw new Error('缺少登录令牌');
  const sb=adminClient(); const {data:{user},error}=await sb.auth.getUser(token);
  if(error||!user) throw new Error('登录已失效，请重新登录');
  return {sb,user};
}
