import { adminClient,userFromToken } from './_supabase.js';
function code(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const a=new Uint32Array(8);crypto.getRandomValues(a);let s='';a.forEach(x=>s+=alphabet[x%alphabet.length]);return `RA-${s.slice(0,4)}-${s.slice(4)}`}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'仅支持 POST'});
  try{const {sb,user}=await userFromToken(req);const {data:p,error:pe}=await sb.from('profiles').select('role').eq('id',user.id).single();if(pe||p?.role!=='admin')return res.status(403).json({error:'只有开发者管理员可以邀请成员'});
    const body=req.body||{};const inviteCode=code();const expires=body.expires_at||new Date(Date.now()+7*86400000).toISOString();const {data,error}=await sb.from('invitations').insert({code:inviteCode,created_by:user.id,invited_email:body.email||null,expires_at:expires}).select('code,status,expires_at').single();if(error)throw error;return res.status(200).json({ok:true,invite:data});
  }catch(e){return res.status(500).json({error:e.message||'创建邀请失败'})}
}
