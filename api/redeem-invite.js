import { adminClient } from './_supabase.js';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'仅支持 POST'});
  try{const {code,email,password}=req.body||{};if(!code||!email||!password||password.length<8)return res.status(400).json({error:'邀请码、邮箱和至少 8 位密码均为必填'});const sb=adminClient();
    const {data:inv,error:ie}=await sb.from('invitations').select('*').eq('code',String(code).trim().toUpperCase()).eq('status','unused').maybeSingle();if(ie)throw ie;if(!inv)return res.status(400).json({error:'邀请码无效、已使用或已撤销'});if(inv.expires_at&&new Date(inv.expires_at)<new Date())return res.status(400).json({error:'邀请码已过期'});if(inv.invited_email&&inv.invited_email.toLowerCase()!==String(email).toLowerCase())return res.status(400).json({error:'该邀请码绑定了其他邮箱'});
    const {data:created,error:ce}=await sb.auth.admin.createUser({email,password,email_confirm:true});if(ce)throw ce;const uid=created.user.id;await sb.from('profiles').insert({id:uid,display_name:email.split('@')[0],role:'member',invited_at:new Date().toISOString()});await sb.from('invitations').update({status:'used',used_by:uid}).eq('id',inv.id);return res.status(200).json({ok:true});
  }catch(e){return res.status(500).json({error:e.message||'邀请码兑换失败'})}
}
