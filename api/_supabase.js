import { createClient } from '@supabase/supabase-js';
export function adminClient(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Supabase server environment variables are missing');return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})}
export async function userFromToken(req){const h=String(req.headers.authorization||'');if(!h.startsWith('Bearer '))throw new Error('未登录');const sb=adminClient();const {data:{user},error}=await sb.auth.getUser(h.slice(7));if(error||!user)throw new Error('登录已失效');return{sb,user}}
export function json(res,status,payload){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');return res.end(JSON.stringify(payload))}
