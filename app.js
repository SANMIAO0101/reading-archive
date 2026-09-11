const KEY='reading_archive_production_v2';
const SKILLS=['人物塑造','对白','心理描写','情节设计','故事节奏','语言表达','环境描写','情绪设计','悬念设计','章节钩子'];
const seed={
  theme:'light', invited:true, user:{name:'Personal Edition',role:'admin',email:'demo@reading-archive.local'},
  books:[
    {id:'b1',title:'《百年孤独》',author:'加西亚·马尔克斯',status:'reading',progress:68,current_page:204,total_pages:300},
    {id:'b2',title:'《献给阿尔吉侬的花束》',author:'丹尼尔·凯斯',status:'reading',progress:43,current_page:137,total_pages:318},
    {id:'b3',title:'《局外人》',author:'阿尔贝·加缪',status:'reading',progress:22,current_page:31,total_pages:142}
  ],
  notes:[
    {id:'n1',quote:'“他没有回头，只是把门又轻轻推了一寸。”',source:'某部小说 · 第12章',why:'一个很小的动作，让沉默和牵挂都出现了。作者没有解释人物的心理。',tags:['人物动作','人物关系','情绪留白'],analysis:null},
    {id:'n2',quote:'“房间里没有人说话，只有百叶窗把下午切成一条一条。”',source:'某部小说 · 第5章',why:'环境不是装饰，而是在替人物说话。',tags:['环境描写','情绪表达'],analysis:null}
  ],
  ideas:[{id:'i1',title:'离开时故意留下东西',body:'一个女人每次想离开一个男人，都会故意留下一个东西。第一次耳环，第二次书，第三次什么都没有。',tags:['关系','意象','灵感']}],
  writings:[{id:'w1',title:'久别重逢',status:'draft',content:'她站在门口，手还搭在门把上。屋里的人没有挽留，只把桌上的杯子往里推了推。她看了很久，最终没有走。',updated_at:new Date().toISOString()}],
  exercises:[{id:'e1',title:'用动作代替情绪',prompt:'写一段两个人争吵后准备分开。不要出现“难过”“舍不得”，也不要直接解释心理。100—200字。',submission:'',score:null,feedback:null,status:'未完成',skill:'动作暗示'}],
  documents:[],
  techniques:SKILLS.map((name,i)=>({id:'t'+i,name,description:['通过动作让读者自己推断人物心理。','利用言外之意推动关系。','让情绪藏在感知与行动里。','让每场戏产生明确变化。','控制转折与信息释放。','形成稳定而有辨识度的句子。','让空间参与叙事和情绪。','建立情绪递进和反差。','建立读者想知道的核心问题。','让章节结尾产生继续阅读的动力。'][i],mastery:[3.8,3.4,4.1,2.8,3.1,3.6,3.0,3.7,2.9,2.6][i]})),
  invites:[], growth:{}, customTags:{notes:[],ideas:[]}, trainingHistory:[
    {id:'tr1',skill:'人物塑造',score:4.0,date:'2026-08-12T10:00:00.000Z',source:'exercise',title:'用动作代替情绪',note:'首次完成动作暗示练习'},
    {id:'tr2',skill:'心理描写',score:4.2,date:'2026-08-20T14:30:00.000Z',source:'exercise',title:'情绪留白训练',note:'减少直接解释心理'},
    {id:'tr3',skill:'对白',score:3.6,date:'2026-09-01T09:15:00.000Z',source:'exercise',title:'潜台词对白',note:'言外之意仍偏直白'},
    {id:'tr4',skill:'情节设计',score:3.2,date:'2026-09-05T16:00:00.000Z',source:'exercise',title:'场景推进',note:'关系变化不够明显'},
    {id:'tr5',skill:'章节钩子',score:2.8,date:'2026-09-08T11:20:00.000Z',source:'exercise',title:'章末钩子',note:'钩子类型单一'}
  ]
};

let state=loadState();
let route='home'; let subroute=''; let selectedWriting=state.writings[0]?.id||null; let selectedDocument=null; let selectedSkill=null; let tagFilter=''; let tagKind='notes'; let skillFilter='';
function loadState(){try{const raw=JSON.parse(localStorage.getItem(KEY));if(!raw)return structuredClone(seed);if(!Array.isArray(raw.trainingHistory)||!raw.trainingHistory.length){raw.trainingHistory=structuredClone(seed.trainingHistory||[])}if(!raw.customTags){raw.customTags={notes:[],ideas:[]}}if(!Array.isArray(raw.customTags.notes))raw.customTags.notes=[];if(!Array.isArray(raw.customTags.ideas))raw.customTags.ideas=[];if(!Array.isArray(raw.notes))raw.notes=structuredClone(seed.notes);if(!Array.isArray(raw.ideas))raw.ideas=structuredClone(seed.ideas);if(!Array.isArray(raw.techniques)||!raw.techniques.length)raw.techniques=structuredClone(seed.techniques);return raw}catch{return structuredClone(seed)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));if(typeof cloudReady!=='undefined'&&cloudReady)queueCloudSync()}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function uid(p='id'){return (typeof cloudReady!=='undefined'&&cloudReady&&crypto.randomUUID)?crypto.randomUUID():p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
function toast(text){const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),2400)}
function applyTheme(){document.documentElement.dataset.theme=state.theme==='dark'?'dark':'light'}
function toggleTheme(){state.theme=state.theme==='dark'?'light':'dark';save();applyTheme();render()}
function btn(label,fn,kind=''){return `<button class="btn ${kind}" onclick="${fn}">${label}</button>`}
function pageHead(num,title,desc,actions=''){return `<header class="page-head"><div class="page-head-main"><div class="page-head-title"><h2>${title}</h2></div><div class="page-head-side"><p class="page-desc">${desc}</p><div class="actions">${actions}</div></div></div></header>`}

const PAGE_ORDER=['home','excerpts','ideas','techniques','writing','profile','settings'];
const PAGE_LABEL={home:'HOME',excerpts:'EXCERPTS',ideas:'IDEAS',techniques:'TECHNIQUES',writing:'WRITING',profile:'PROFILE',settings:'SETTINGS'};
function pageFooter(){return ''}

function ensureCustomTags(){
  if(!state.customTags) state.customTags={notes:[],ideas:[]};
  if(!Array.isArray(state.customTags.notes)) state.customTags.notes=[];
  if(!Array.isArray(state.customTags.ideas)) state.customTags.ideas=[];
}
function allTags(collection){
  ensureCustomTags();
  const set=new Set();
  (collection||[]).forEach(x=>(x.tags||[]).forEach(t=>{if(t)set.add(t)}));
  // detect kind by reference or by checking if items look like ideas
  const isIdea=collection===state.ideas||(collection&&collection[0]&&('title' in collection[0])&&!('quote' in collection[0]));
  const kind=isIdea?'ideas':'notes';
  (state.customTags[kind]||[]).forEach(t=>set.add(t));
  return [...set].sort((a,b)=>a.localeCompare(b,'zh'));
}
function setTagFilter(tag,kind){openTagPage(kind||tagKind||'notes',tag)}
function openTagPage(kind,tag){
  tagKind=(kind==='ideas'||kind==='idea')?'ideas':'notes';
  tagFilter=String(tag||'').trim();
  if(!tagFilter){
    route=tagKind==='ideas'?'ideas':'excerpts';
    render();
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  route='tagArchive';
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function clearTagFilter(){
  const back=tagKind==='ideas'?'ideas':'excerpts';
  tagFilter='';
  route=back;
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function backFromTagArchive(){clearTagFilter()}
function tagChipBar(collection,kind){
  const tags=allTags(collection);
  const k=kind==='ideas'?'ideas':'notes';
  return `<div class="tag-bar">`
    +`<button type="button" class="tag-chip ${!tagFilter?'active':''}" data-tag-kind="${k}" data-tag-value="" onclick="onExcerptTagClick(this)">全部</button>`
    +tags.map(t=>`<button type="button" class="tag-chip ${tagFilter===t?'active':''}" data-tag-kind="${k}" data-tag-value="${esc(t)}" onclick="onExcerptTagClick(this)">${esc(t)} <em>${collection.filter(x=>(x.tags||[]).includes(t)).length}</em></button>`).join('')
    +`<button type="button" class="tag-chip tag-add" data-tag-kind="${k}" onclick="openAddTagModal('${k}')">+ 标签</button>`
    +`</div>`;
}


function openAddTagModal(kind){
  ensureCustomTags();
  const k=kind==='ideas'?'ideas':'notes';
  const label=k==='ideas'?'灵感':'摘抄';
  modal('添加'+label+'标签',
    `<div class="form-grid"><label>新标签名称<input id="new-tag-name" placeholder="例如：场景节奏、伏笔、对话" maxlength="20" /></label>
    <p class="meta">添加后会出现在标签栏；可在编辑摘抄/灵感时勾选使用。也可直接点「创建并筛选」进入该标签页。</p></div>`,
    `${btn('取消',"this.closest('.modal-back').remove()")}${btn('仅添加',`submitNewTag('${k}',false)`,'')}${btn('创建并打开',`submitNewTag('${k}',true)`,'dark')}`);
  setTimeout(()=>document.getElementById('new-tag-name')?.focus(),50);
}
function submitNewTag(kind,openAfter){
  ensureCustomTags();
  const k=kind==='ideas'?'ideas':'notes';
  const name=(document.getElementById('new-tag-name')?.value||'').trim();
  if(!name){toast('请输入标签名');return}
  if(name.length>20){toast('标签名过长');return}
  const list=state.customTags[k];
  if(!list.includes(name) && !(allTags(k==='ideas'?state.ideas:state.notes).includes(name))){
    list.push(name);
    save();
  }
  document.querySelector('.modal-back')?.remove();
  toast('已添加标签：'+name);
  if(openAfter) openTagPage(k,name);
  else render();
}

function onExcerptTagClick(el){
  const kind=el.getAttribute('data-tag-kind')||'notes';
  const tag=el.getAttribute('data-tag-value')||'';
  if(!tag){clearTagFilter();return}
  openTagPage(kind, tag);
}

function renderItemTags(tags,kind,id){
  const list=tags||[];
  const k=kind==='ideas'?'ideas':'notes';
  if(!list.length) return `<div class="tags"><button type="button" class="tag-btn tag-empty" onclick="editItemTags('${k}','${id}')">+ 添加标签</button></div>`;
  return `<div class="tags">${list.map(t=>`<button type="button" class="tag-btn ${tagFilter===t?'active':''}" data-tag-kind="${k}" data-tag-value="${esc(t)}" onclick="onExcerptTagClick(this)">${esc(t)}</button>`).join('')}<button type="button" class="tag-btn tag-edit" onclick="editItemTags('${k}','${id}')" title="编辑标签">✎</button></div>`;
}
function editItemTags(kind,id){const col=kind==='notes'?state.notes:state.ideas;const item=col.find(x=>x.id===id);if(!item)return;const current=(item.tags||[]).join('、');const all=allTags(col);const body=`<div class="field"><label>标签（用顿号、逗号或空格分隔）</label><input id="tagInput" value="${esc(current)}" placeholder="例如：人物动作、情绪留白"></div><div class="field"><label>已有标签 · 点击添加</label><div class="chip-row">${all.length?all.map(t=>`<button type="button" class="chip" data-tag="${esc(t)}">${esc(t)}</button>`).join(''):'<span class="meta">还没有公共标签</span>'}</div></div>`;const m=modal('编辑标签',body,`${btn('取消',"this.closest('.modal-back').remove()")}<button class="btn dark" id="saveTags">保存标签</button>`);m.querySelectorAll('.chip[data-tag]').forEach(ch=>{ch.onclick=()=>{const i=m.querySelector('#tagInput');const parts=i.value.trim()?i.value.split(/[、,，\s]+/).filter(Boolean):[];const t=ch.getAttribute('data-tag');if(!parts.includes(t)){parts.push(t);i.value=parts.join('、')}}});m.querySelector('#saveTags').onclick=()=>{const raw=m.querySelector('#tagInput').value.trim();item.tags=raw?raw.split(/[、,，\s]+/).map(x=>x.trim()).filter(Boolean):[];save();m.remove();render();toast('标签已更新')}}
function manageTags(kind){const col=kind==='notes'?state.notes:state.ideas;const tags=allTags(col);const body=`<p class="modal-text">点击标签可筛选${kind==='notes'?'摘抄':'灵感'}；也可新建标签并批量应用。</p><div class="chip-row" style="margin-bottom:14px">${tags.length?tags.map(t=>`<button class="chip ${tagFilter===t?'active':''}" data-filter="${esc(t)}">${esc(t)} · ${col.filter(x=>(x.tags||[]).includes(t)).length}</button>`).join(''):'<span class="meta">暂无标签</span>'}</div><div class="field"><label>新建标签名</label><input id="newTagName" placeholder="输入新标签"></div><div class="field"><label>应用到（可多选）</label><div class="tag-apply-list">${col.map(x=>`<label class="check-row"><input type="checkbox" value="${esc(x.id)}"><span>${esc(kind==='notes'?String(x.quote||'').slice(0,40):String(x.title||''))}</span></label>`).join('')||'<span class="meta">暂无条目</span>'}</div></div>`;const m=modal('管理标签 · '+(kind==='notes'?'摘抄':'灵感'),body,`${btn('取消',"this.closest('.modal-back').remove()")}<button class="btn dark" id="applyNewTag">添加并应用</button>`);m.querySelectorAll('[data-filter]').forEach(b=>{b.onclick=()=>{m.remove();setTagFilter(b.getAttribute('data-filter'))}});m.querySelector('#applyNewTag').onclick=()=>{const name=m.querySelector('#newTagName').value.trim();if(!name)return toast('请输入标签名');const ids=[...m.querySelectorAll('.tag-apply-list input:checked')].map(x=>x.value);if(!ids.length)return toast('请至少选择一条记录');col.forEach(item=>{if(!ids.includes(item.id))return;item.tags=item.tags||[];if(!item.tags.includes(name))item.tags.push(name)});save();m.remove();tagFilter=name;render();toast('已添加标签：'+name)}}

function nav(){const items=[['home','首页','HOME'],['excerpts','我的摘抄','EXCERPTS'],['ideas','灵感随笔','IDEAS'],['techniques','文笔技巧库','TECHNIQUES'],['writing','我的创作','WRITING'],['profile','成长档案','PROFILE'],['settings','设置','SETTINGS']];return items.map(x=>{const active=route===x[0]||(route==='tagArchive'&&((tagKind==='notes'&&x[0]==='excerpts')||(tagKind==='ideas'&&x[0]==='ideas')))||(route==='training'&&x[0]==='profile');return `<button class="nav-item ${active?'active':''}" onclick="go('${x[0]}')"><span><b>${x[1]}</b><small>${x[2]}</small></span></button>`}).join('')}
function layout(content){document.getElementById('app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><div class="eyebrow">PERSONAL EDITION</div><h1>READING<br>ARCHIVE</h1><small>ISSUE 001 · 2026</small></div><nav class="nav">${nav()}</nav><button class="side-theme" onclick="toggleTheme()">${state.theme==='dark'?'☀':'☾'} <span>${state.theme==='dark'?'白天模式':'夜晚模式'}</span></button><div class="side-foot">读过的、想过的、<br>最后都会成为你的句子。</div></aside><main class="main"><div class="topbar"><span>MY ARCHIVE / ${route.toUpperCase()}${subroute?' / '+subroute.toUpperCase():''}${(route==='tagArchive'&&tagFilter)?' / TAG · '+String(tagFilter).toUpperCase():''}${route==='training'?(skillFilter?' / SKILL · '+String(skillFilter).toUpperCase():' / TRAINING'):''}</span><div class="topbar-right"><span class="private">PRIVATE · ${state.user.role==='admin'?'ADMIN':'MEMBER'}</span><button class="theme-top" onclick="toggleTheme()">${state.theme==='dark'?'☀':'☾'}</button></div></div><div class="content">${content}${pageFooter()}</div></main><nav class="mobile-nav">${[['home','首页'],['excerpts','摘抄'],['ideas','灵感'],['techniques','技巧'],['writing','创作'],['profile','成长'],['settings','设置']].map(x=>`<button class="${route===x[0]?'active':''}" onclick="go('${x[0]}')">${x[1]}</button>`).join('')}</nav></div>`}
function cardLink(title,value,desc,fn,cls=''){return `<button class="metric-card ${cls}" onclick="${fn}"><span class="eyebrow">${esc(desc)}</span><strong>${esc(value)}</strong><span>${esc(title)}</span><i>→</i></button>`}
function home(){const done=state.exercises.filter(x=>x.status==='已完成').length;const skills=state.techniques;return pageHead('01','我的写作档案','阅读、摘抄、仿写、创作和 AI 分析，形成一条可以长期追踪的成长轨迹。')+`<div class="metric-grid">${cardLink('摘抄片段',String(state.notes.length),'EXCERPTS',"go('excerpts')")}${cardLink('灵感笔记',String(state.ideas.length),'IDEAS',"go('ideas')")}${cardLink('写作练习',String(state.exercises.length),'EXERCISES',"go('writing');openWritingTab('exercises')")}${cardLink('完成练习',String(done),'COMPLETED',"go('writing');openWritingTab('exercises')")}${cardLink('我的作品',String(state.writings.length),'WRITING',"go('writing')")}</div><div class="section-title"><h3>最近值得做什么</h3><span>AI COACH / NEXT STEP</span></div><div class="feature-row"><button class="feature-card" onclick="analyzeNote('${state.notes[0]?.id||''}')"><span class="eyebrow">NEXT TRAINING</span><h3>人物沉默的时候，作者是怎么继续推动关系变化的？</h3><p>根据最近摘抄与仿写记录，建议继续训练“动作暗示 + 潜台词”。</p><b>查看 AI 分析 →</b></button><div class="topic-card"><div class="eyebrow">RECURRING</div>${[['人物关系',28],['自我欺骗',21],['孤独',18],['欲望',15],['成长',13]].map(x=>`<button onclick="go('ideas')"><b>${x[0]}</b><span>${x[1]}</span></button>`).join('')}</div></div><div class="section-title"><h3>写作能力摘要</h3><span>按各技巧最新一次仿写评分</span></div><div class="skill-list">${skills.slice(0,8).map(homeSkillButton).join('')}</div>`}

/** 某技巧的全部训练记录 */
function trainingsForSkill(skillName){
  return (state.trainingHistory||[]).filter(x=>x.skill===skillName||(x.skill&&skillName&&(x.skill.includes(skillName)||skillName.includes(x.skill))));
}
/** 综合掌握度：该标签下全部历史训练的加权平均（近期权重略高） */
function masteryFromHistory(skillName){
  const list=trainingsForSkill(skillName).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!list.length){
    const t=state.techniques.find(x=>x.name===skillName);
    return Number(t?.mastery||0);
  }
  let wSum=0, sSum=0;
  list.forEach((h,i)=>{const w=1+i*0.15; wSum+=w; sSum+=Number(h.score||0)*w});
  return Math.min(5, Math.max(0, Number((sSum/wSum).toFixed(1))));
}
/** 最新一次训练评分（首页写作能力摘要用） */
function latestScoreForSkill(skillName){
  const list=trainingsForSkill(skillName).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(list.length) return Number(list[0].score||0);
  const t=state.techniques.find(x=>x.name===skillName);
  return Number(t?.mastery||0);
}

function homeSkillButton(t){const m=latestScoreForSkill(t.name);const pct=Math.round(m/5*100);const last=trainingsForSkill(t.name).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];const hint=last?new Date(last.date).toLocaleDateString():'暂无训练';return `<button class="skill-row" onclick="openSkill('${t.id}')"><span>${esc(t.name)}</span><span class="star-mini">${stars(m)}</span><div class="track"><i style="width:${pct}%"></i></div><b>${m.toFixed(1)}</b><span class="arrow">→</span></button>`}
function skillButton(t){const m=masteryFromHistory(t.name);const pct=Math.round(m/5*100);return `<button class="skill-row" onclick="openSkill('${t.id}')"><span>${esc(t.name)}</span><span class="star-mini">${stars(m)}</span><div class="track"><i style="width:${pct}%"></i></div><b>${m.toFixed(1)}</b><span class="arrow">→</span></button>`}
function stars(v){const n=Math.max(0,Math.min(5,Math.round(Number(v)||0)));return '★'.repeat(n)+'☆'.repeat(5-n)}
function excerpts(){
  return pageHead('02','我的摘抄','把喜欢的句子、来源和为什么喜欢单独归档。点击标签可进入该标签的摘抄归档页。',btn('+ 新建摘抄','newNote()','dark'))
  +`<div class="toolbar"><span>摘抄 · ${state.notes.length}</span></div>`
  +tagChipBar(state.notes,'notes')
  +`<div class="notes-list">${state.notes.length?state.notes.map(n=>`<article class="quote-card"><div class="note-head"><span class="eyebrow">NOTE / ${esc(String(n.id).slice(-3))}</span><span class="meta">${esc(n.source)}</span></div><blockquote>${esc(n.quote)}</blockquote><p>${esc(n.why)}</p>${renderItemTags(n.tags,'notes',n.id)}<div class="card-actions">${btn('AI 分析',`analyzeNote('${n.id}')`,'dark')}${btn('编辑',`editNote('${n.id}')`)}${btn('删除',`deleteItem('notes','${n.id}')`,'danger')}</div></article>`).join(''):`<div class="empty"><h3>还没有摘抄</h3><p>从阅读中留下一句真正打动你的话，再让 AI 拆解技法。</p>${btn('+ 新建摘抄','newNote()','dark')}</div>`}</div>`}
function ideas(){
  const filtered=tagFilter?state.ideas.filter(i=>(i.tags||[]).includes(tagFilter)):state.ideas;
  const title=tagFilter?`灵感 · ${tagFilter}`:'灵感随笔';
  const desc=tagFilter?`正在查看标签「${tagFilter}」下的全部灵感。可继续切换标签，或返回全部灵感。`:'捕捉闪现的情节、意象、人物关系与未完成的念头。这里只做灵感，不做摘抄。';
  return pageHead('03',title,desc,(tagFilter?btn('← 全部灵感','clearTagFilter()'):'')+btn('+ 新灵感','newIdea()','dark'))
  +`<div class="toolbar"><span>灵感 · ${filtered.length}${tagFilter?` / 标签筛选中`:''}</span><button class="btn" onclick="go('excerpts')">去我的摘抄 →</button></div>`
  +tagChipBar(state.ideas,'ideas')
  +`<div class="idea-list">${filtered.length?filtered.map(i=>`<article class="idea-card"><div class="idea-main"><span class="eyebrow">IDEA / ${esc(String(i.id).slice(-3))}</span><h3>${esc(i.title)}</h3><p>${esc(i.body)}</p>${renderItemTags(i.tags,'ideas',i.id)}</div><div class="card-actions">${btn('编辑',`editIdea('${i.id}')`)}${btn('删除',`deleteItem('ideas','${i.id}')`,'danger')}</div></article>`).join(''):`<div class="empty"><h3>${tagFilter?'该标签下暂无灵感':'灵感簿还是空的'}</h3><p>${tagFilter?'换一个标签，或给现有灵感添加此标签。':'记下一个未完成的画面、一句对白，或一次关系翻转。'}</p>${tagFilter?btn('查看全部灵感','clearTagFilter()','dark'):btn('+ 新灵感','newIdea()','dark')}</div>`}</div>`}

function tagArchive(){
  const isIdea=tagKind==='ideas';
  const collection=isIdea?state.ideas:state.notes;
  const filtered=collection.filter(x=>(x.tags||[]).includes(tagFilter));
  const label=isIdea?'灵感':'摘抄';
  const backRoute=isIdea?'ideas':'excerpts';
  const head=pageHead('02', `${label}标签`, `标签「${esc(tagFilter)}」下的全部${label}记录。`, btn('← 返回'+label, `go('${backRoute}')`)+btn('+ 新建', isIdea?'newIdea()':'newNote()','dark'));
  const chips=tagChipBar(collection, isIdea?'ideas':'notes');
  if(isIdea){
    return head+`<div class="toolbar"><span>标签 · ${esc(tagFilter)} · ${filtered.length} 条</span></div>`
      +chips
      +`<div class="idea-list">${filtered.length?filtered.map(i=>`<article class="idea-card"><div class="idea-main"><span class="eyebrow">IDEA / ${esc(String(i.id).slice(-3))}</span><h3>${esc(i.title)}</h3><p>${esc(i.body)}</p>${renderItemTags(i.tags,'ideas',i.id)}</div><div class="card-actions">${btn('编辑',`editIdea('${i.id}')`)}${btn('删除',`deleteItem('ideas','${i.id}')`,'danger')}</div></article>`).join(''):`<div class="empty"><h3>该标签下暂无灵感</h3><p>可返回灵感页添加标签，或新建一条灵感。</p>${btn('返回灵感','go(\'ideas\')','dark')}</div>`}</div>`;
  }
  return head+`<div class="toolbar"><span>标签 · ${esc(tagFilter)} · ${filtered.length} 条</span></div>`
    +chips
    +`<div class="notes-list">${filtered.length?filtered.map(n=>`<article class="quote-card"><div class="note-head"><span class="eyebrow">NOTE / ${esc(String(n.id).slice(-3))}</span><span class="meta">${esc(n.source)}</span></div><blockquote>${esc(n.quote)}</blockquote><p>${esc(n.why)}</p>${renderItemTags(n.tags,'notes',n.id)}<div class="card-actions">${btn('AI 分析',`analyzeNote('${n.id}')`,'dark')}${btn('编辑',`editNote('${n.id}')`)}${btn('删除',`deleteItem('notes','${n.id}')`,'danger')}</div></article>`).join(''):`<div class="empty"><h3>该标签下暂无摘抄</h3><p>可返回摘抄页给已有记录添加此标签。</p>${btn('返回摘抄','go(\'excerpts\')','dark')}</div>`}</div>`;
}

function techniques(){return pageHead('04','文笔技巧库','每个技巧都有 AI 掌握度、训练记录和历史变化。点击任意技巧进入对应训练档案。',btn('+ 新技巧','newTechnique()'))+`<div class="grid technique-grid">${state.techniques.map(t=>`<button class="technique-card" onclick="openSkill('${t.id}')"><div class="eyebrow">TECHNIQUE</div><h3>${esc(t.name)}</h3><p>${esc(t.description)}</p><div class="tech-stars">${stars(t.mastery)}</div><div class="tech-foot"><span>AI 掌握度 ${t.mastery.toFixed(1)} / 5</span><b>查看训练历史 →</b></div></button>`).join('')}</div><div class="section-title"><h3>本月训练重点</h3><span>AI COACH</span></div><button class="coach-card" onclick="go('settings');setTimeout(()=>openCoach(),50)"><span class="eyebrow">CURRENT FOCUS</span><h3>${esc(currentFocus())}</h3><p>AI 会根据最近练习、点评和原创作品中的问题动态调整训练重点。</p><b>打开 AI 教练 →</b></button>`}
function writing(){const tabs=[['works','我的作品'],['documents','已上传文档'],['exercises','仿写练习']];const tab=subroute||'works';return pageHead('05','我的创作','原创作品、上传文档和仿写练习统一管理；所有记录均可编辑、删除并进入 AI 分析。',btn('+ 新作品','newWriting()','dark')+btn('↑ 上传 TXT / DOCX / EPUB','uploadWork()'))+`<div class="subtabs writing-tabs">${tabs.map(x=>`<button class="${tab===x[0]?'active':''}" onclick="openWritingTab('${x[0]}')">${x[1]}</button>`).join('')}</div>${tab==='works'?worksPanel():tab==='documents'?documentsPanel():exercisesPanel()}`}
function worksPanel(){let w=state.writings.find(x=>x.id===selectedWriting)||state.writings[0];if(!w)return `<div class="empty">还没有原创作品。<button class="btn dark" onclick="newWriting()">创建第一部作品</button></div>`;return `<div class="writing-layout"><div class="work-list">${state.writings.map(x=>`<button class="work-item ${x.id===w.id?'active':''}" onclick="selectedWriting='${x.id}';render()"><h3>${esc(x.title)}</h3><span>${esc(x.status)} · ${String(x.content||'').length} 字</span><i>→</i></button>`).join('')}</div><div class="editor-panel"><div class="editor-head"><div><span class="eyebrow">MANUSCRIPT</span><h3>${esc(w.title)}</h3></div><div class="card-actions">${btn('编辑信息',`editWriting('${w.id}')`)}${btn('删除',`deleteItem('writings','${w.id}')`,'danger')}</div></div><textarea id="workContent" class="manuscript">${esc(w.content||'')}</textarea><div class="editor-actions">${btn('保存','saveWork()','dark')}${btn('AI 故事分析',`analyzeOriginal('${w.id}')`)}${btn('AI 全书诊断',`openDocReport('${w.id}')`)}</div><div id="originalAnalysis"></div></div></div>`}
function documentsPanel(){return `<div class="document-list">${state.documents.length?state.documents.map(d=>`<article class="document-card"><div class="doc-type">${esc(d.format)}</div><div class="doc-main"><div class="eyebrow">${esc(d.status||'COMPLETED')}</div><h3>${esc(d.title||d.filename)}</h3><p>${Number(d.characters||0).toLocaleString()} 字 · ${d.chunk_count||0} 个文本块 · ${d.analysis_levels?.length||3} 层分析</p><div class="analysis-pills">${(d.analysis_levels||['章节级','卷级','全书级']).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="doc-actions">${btn('查看完整报告',`openDocument('${d.id}')`,'dark')}${btn('编辑',`editDocument('${d.id}')`)}${btn('重新分析',`reanalyzeDocument('${d.id}')`)}${btn('删除',`deleteDocument('${d.id}')`,'danger')}</div></article>`).join(''): `<div class="empty"><h3>还没有上传作品</h3><p>支持 TXT、DOCX、EPUB。上传后后台读取，不在页面展开原文。</p>${btn('上传作品','uploadWork()','dark')}</div>`}</div>`}
function exercisesPanel(){return `<div class="exercise-list">${state.exercises.map(e=>`<article class="exercise-card"><div class="exercise-top"><span class="eyebrow">${esc(e.skill||'AI TRAINING')}</span><span class="status-pill ${e.status==='已完成'?'done':''}">${esc(e.status)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.prompt)}</p>${e.submission?`<div class="submission-preview"><span>我的仿写</span>${esc(e.submission.slice(0,180))}${e.submission.length>180?'…':''}</div>`:''}<div class="exercise-foot">${e.score?`<span class="stars-big">${stars(e.score)} <b>${Number(e.score).toFixed(1)}/5</b></span>`:'<span class="meta">尚未评分</span>'}<div class="card-actions">${btn('进入练习',`editExercise('${e.id}')`,'dark')}${btn('编辑',`editExercise('${e.id}')`)}${btn('删除',`deleteItem('exercises','${e.id}')`,'danger')}</div></div></article>`).join('')}${btn('+ 新建仿写练习','newExercise()')}</div>`}
function profile(){
  const done=state.exercises.filter(x=>x.status==='已完成').length;
  const hist=[...(state.trainingHistory||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const recent=hist.slice(0,3);
  return pageHead('06','成长档案','把训练结果变成长期数据。历史训练与文笔技巧库、AI 掌握分析相互关联。')
  +`<div class="profile-cards">${cardLink('历史训练',String(hist.length),'TRAINING LOG',"openTrainingHistory()")}${cardLink('仿写练习',String(state.exercises.length),'EXERCISES',"go('writing');openWritingTab('exercises')")}${cardLink('摘抄',String(state.notes.length),'EXCERPTS',"go('excerpts')")}</div>`
  +`<div class="section-title"><h3>能力变化</h3><span>各技巧全部训练综合分</span></div><div class="skill-history-list">${state.techniques.map(skillButton).join('')}</div>`
  +`<div class="section-title"><h3>历史训练</h3><span>LATEST · ${hist.length} TOTAL</span></div>`
  +`<div class="training-history-panel">${recent.length?recent.map(h=>`<button type="button" class="history-row history-row-link" data-skill-filter="${esc(h.skill)}" onclick="onSkillTagClick(this)"><span class="hist-date">${new Date(h.date).toLocaleDateString()}</span><span class="hist-skill">${esc(h.skill)}</span><b class="hist-stars">${stars(h.score)}</b><span class="hist-src">${esc(h.title||h.source||'exercise')}</span><i>→</i></button>`).join('')+`<div class="toolbar" style="margin-top:12px">${btn('查看全部历史训练','openTrainingHistory()','dark')}</div>`:`<div class="empty">完成仿写练习后，训练记录会出现在这里，并同步到各技巧档案。<div style="margin-top:12px">${btn('打开训练档案','openTrainingHistory()','dark')}</div></div>`}</div>`
  +`<div class="section-title"><h3>本月训练重点</h3><span>GENERATED FROM PRACTICE</span></div><button class="coach-card" onclick="go('settings');setTimeout(()=>openCoach(),50)"><span class="eyebrow">THIS MONTH</span><h3>${esc(currentFocus())}</h3><p>${esc(coachReason())}</p><b>查看训练建议 →</b></button>`
  +`<div class="section-title"><h3>月度 / 年度报告</h3><span>LONG TERM</span></div><div class="report-grid"><button class="report-card" onclick="openReport('month')"><span class="eyebrow">MONTHLY REPORT</span><strong>09</strong><h3>2026 / 09</h3><p>训练 ${hist.length} · 摘抄 ${state.notes.length} · 完成练习 ${done}</p><b>查看月报 →</b></button><button class="report-card" onclick="openReport('year')"><span class="eyebrow">YEARLY REPORT</span><strong>26</strong><h3>2026</h3><p>查看全年摘抄、训练、原创和能力成长。</p><b>查看年报 →</b></button></div>`}

function settings(){return pageHead('07','设置','账号、AI 教练、数据同步和开发者邀请权限。')+`<div class="settings-grid"><button class="settings-card" onclick="openAccount()"><span class="eyebrow">ACCOUNT</span><h3>${esc(state.user.name)}</h3><p>${esc(state.user.email)} · ${esc(state.user.role)}</p><b>账号设置 →</b></button><button class="settings-card active-card" onclick="openCoach()"><span class="eyebrow">AI COACH</span><h3>AI 教练</h3><p>根据仿写、原创作品和上传文档的 AI 诊断，自动生成训练重点。</p><b>进入 AI 教练 →</b></button><button class="settings-card" onclick="openCloudStatus()"><span class="eyebrow">DATA</span><h3>${window.RA_CONFIG?.supabaseUrl?'CLOUD MODE':'DEMO MODE'}</h3><p>${window.RA_CONFIG?.supabaseUrl?'Supabase 数据同步已配置。':'当前使用本机演示数据；配置 Supabase 后可跨设备同步。'}</p><b>查看数据状态 →</b></button></div>${state.user.role==='admin'?`<div class="section-title"><h3>开发者邀请</h3><span>ADMIN ONLY</span></div><div class="admin-panel"><h3>只有开发者才能邀请成员</h3><p>生成一次性邀请码。正式模式下邀请码应由服务端校验并绑定 Supabase Auth 用户。</p><button class="btn dark" onclick="createInvite()">+ 生成邀请码</button><div class="invite-list">${state.invites.length?state.invites.map(i=>`<div><code>${esc(i.code)}</code><span>${esc(i.status)}</span><button onclick="revokeInvite('${i.code}')">撤销</button></div>`).join(''):'暂无邀请码'}</div></div>`:''}`}

function currentFocus(){const weak=[...state.techniques].sort((a,b)=>a.mastery-b.mastery)[0];return weak?`重点训练「${weak.name}」`:'建立第一轮训练'}
function coachReason(){const weak=[...state.techniques].sort((a,b)=>a.mastery-b.mastery)[0];const count=state.exercises.length;return `AI 根据当前 ${count} 次仿写记录、原创分析和技巧掌握度判断，下一阶段最值得投入的是“${weak?.name||'人物塑造'}”。完成 3 次针对性训练后会重新评分。`}
function go(p){route=p;subroute='';if(p!=='excerpts'&&p!=='ideas'&&p!=='tagArchive'){tagFilter=''} if(p==='excerpts'||p==='ideas'){tagFilter='';tagKind=p==='ideas'?'ideas':'notes'} if(p!=='training'){skillFilter=''} render();window.scrollTo({top:0,behavior:'smooth'})}
function openWritingTab(t){route='writing';subroute=t;render()}
function render(){applyTheme();if(route==='reading')route='excerpts';if(route==='notes')route='ideas';const map={home,excerpts,ideas,tagArchive,techniques,writing,profile,training,settings};layout((map[route]||home)())}
function modal(title,body,actions=''){const d=document.createElement('div');d.className='modal-back';d.innerHTML=`<div class="modal"><div class="modal-head"><h3>${title}</h3><button onclick="this.closest('.modal-back').remove()">×</button></div>${body}<div class="modal-actions">${actions}</div></div>`;d.onclick=e=>{if(e.target===d)d.remove()};document.body.appendChild(d);return d}
function confirmAction(title,message,ok){modal(title,`<p class="modal-text">${message}</p>`,`${btn('取消',`this.closest('.modal-back').remove()`)}${btn('确认',`${ok};this.closest('.modal-back').remove()`,'danger dark')}`)}
function formModal(title,fields,onSave){const body=fields.map(f=>`<div class="field"><label>${f.label}</label>${f.type==='textarea'?`<textarea id="${f.id}">${esc(f.value||'')}</textarea>`:`<input id="${f.id}" type="${f.type||'text'}" value="${esc(f.value||'')}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''}>`}</div>`).join('');const m=modal(title,body,`${btn('取消',`this.closest('.modal-back').remove()`)}<button class="btn dark" id="formSave">保存</button>`);m.querySelector('#formSave').onclick=()=>onSave(m);return m}
function addBook(){formModal('添加一本书',[{id:'t',label:'书名'},{id:'a',label:'作者'},{id:'p',label:'进度 %',type:'number',min:0,max:100,value:0},{id:'cp',label:'当前页',type:'number',value:0},{id:'tp',label:'总页数',type:'number'}],m=>{state.books.unshift({id:uid('b'),title:m.querySelector('#t').value||'未命名作品',author:m.querySelector('#a').value||'未知作者',status:'reading',progress:Number(m.querySelector('#p').value)||0,current_page:Number(m.querySelector('#cp').value)||0,total_pages:Number(m.querySelector('#tp').value)||null});save();m.remove();render();toast('阅读记录已保存')})}
function editBook(id){const b=state.books.find(x=>x.id===id);formModal('编辑阅读记录',[{id:'t',label:'书名',value:b.title},{id:'a',label:'作者',value:b.author},{id:'p',label:'进度 %',type:'number',min:0,max:100,value:b.progress},{id:'cp',label:'当前页',type:'number',value:b.current_page},{id:'tp',label:'总页数',type:'number',value:b.total_pages||''}],m=>{Object.assign(b,{title:m.querySelector('#t').value,author:m.querySelector('#a').value,progress:Number(m.querySelector('#p').value)||0,current_page:Number(m.querySelector('#cp').value)||0,total_pages:Number(m.querySelector('#tp').value)||null});save();m.remove();render()})}
function updateBook(id){const b=state.books.find(x=>x.id===id);const v=prompt('输入新的阅读进度（0-100）',b.progress);if(v!==null){b.progress=Math.max(0,Math.min(100,Number(v)||0));save();render();}}
function newNote(){formModal('新建摘抄',[{id:'q',label:'原文',type:'textarea'},{id:'s',label:'来源'},{id:'w',label:'我为什么喜欢',type:'textarea'},{id:'tg',label:'标签（顿号或逗号分隔）',value:''}],m=>{const quote=m.querySelector('#q').value.trim();if(!quote)return toast('请先输入摘抄');const tags=(m.querySelector('#tg').value||'').split(/[、,，\s]+/).map(x=>x.trim()).filter(Boolean);state.notes.unshift({id:uid('n'),quote,source:m.querySelector('#s').value||'未注明',why:m.querySelector('#w').value||'待补充',tags:tags.length?tags:['待分类'],analysis:null});save();m.remove();render()})}
function editNote(id){const n=state.notes.find(x=>x.id===id);formModal('编辑摘抄',[{id:'q',label:'原文',type:'textarea',value:n.quote},{id:'s',label:'来源',value:n.source},{id:'w',label:'我为什么喜欢',type:'textarea',value:n.why},{id:'tg',label:'标签（顿号或逗号分隔）',value:(n.tags||[]).join('、')}],m=>{n.quote=m.querySelector('#q').value;n.source=m.querySelector('#s').value;n.why=m.querySelector('#w').value;n.tags=(m.querySelector('#tg').value||'').split(/[、,，\s]+/).map(x=>x.trim()).filter(Boolean);save();m.remove();render()})}
function newIdea(){formModal('记录灵感',[{id:'t',label:'标题'},{id:'b',label:'灵感',type:'textarea'},{id:'tg',label:'标签（顿号或逗号分隔）',value:'灵感'}],m=>{const tags=(m.querySelector('#tg').value||'').split(/[、,，\s]+/).map(x=>x.trim()).filter(Boolean);state.ideas.unshift({id:uid('i'),title:m.querySelector('#t').value||'未命名灵感',body:m.querySelector('#b').value,tags:tags.length?tags:['灵感']});save();m.remove();render()})}
function editIdea(id){const x=state.ideas.find(i=>i.id===id);formModal('编辑灵感',[{id:'t',label:'标题',value:x.title},{id:'b',label:'灵感',type:'textarea',value:x.body},{id:'tg',label:'标签（顿号或逗号分隔）',value:(x.tags||[]).join('、')}],m=>{x.title=m.querySelector('#t').value;x.body=m.querySelector('#b').value;x.tags=(m.querySelector('#tg').value||'').split(/[、,，\s]+/).map(v=>v.trim()).filter(Boolean);save();m.remove();render()})}
function openIdeaList(){go('ideas')}
function newTechnique(){formModal('新增个人技巧',[{id:'n',label:'技巧名称'},{id:'d',label:'说明',type:'textarea'}],m=>{state.techniques.push({id:uid('t'),name:m.querySelector('#n').value||'新技巧',description:m.querySelector('#d').value,mastery:0});save();m.remove();render()})}
function newWriting(){formModal('新作品',[{id:'t',label:'作品名'}],m=>{const w={id:uid('w'),title:m.querySelector('#t').value||'未命名作品',status:'draft',content:'',updated_at:new Date().toISOString()};state.writings.unshift(w);selectedWriting=w.id;save();m.remove();openWritingTab('works')})}
function editWriting(id){const w=state.writings.find(x=>x.id===id);formModal('编辑作品信息',[{id:'t',label:'作品名',value:w.title},{id:'s',label:'状态',value:w.status}],m=>{w.title=m.querySelector('#t').value;w.status=m.querySelector('#s').value;w.updated_at=new Date().toISOString();save();m.remove();render()})}
function saveWork(){const w=state.writings.find(x=>x.id===selectedWriting);if(!w)return;w.content=document.getElementById('workContent').value;w.updated_at=new Date().toISOString();save();toast('作品已保存')}
function newExercise(){formModal('新建仿写练习',[{id:'t',label:'练习标题'},{id:'p',label:'题目要求',type:'textarea'},{id:'s',label:'训练技巧',value:'动作暗示'}],m=>{state.exercises.unshift({id:uid('e'),title:m.querySelector('#t').value||'新练习',prompt:m.querySelector('#p').value,skill:m.querySelector('#s').value,submission:'',score:null,feedback:null,status:'未完成'});save();m.remove();render()})}
function editExercise(id){const e=state.exercises.find(x=>x.id===id);const body=`<div class="field"><label>题目</label><div class="prompt-box">${esc(e.prompt)}</div></div><div class="field"><label>我的仿写</label><textarea id="sub">${esc(e.submission||'')}</textarea></div><div class="field"><label>状态</label><select id="st"><option ${e.status==='未完成'?'selected':''}>未完成</option><option ${e.status==='已完成'?'selected':''}>已完成</option></select></div>${e.feedback?`<div class="feedback-box"><b>AI 点评</b><p>${esc(e.feedback)}</p></div>`:''}`;const m=modal('仿写练习 · '+e.title,body,`${btn('删除',`deleteItem('exercises','${e.id}');this.closest('.modal-back').remove()`,'danger')}${btn('AI 点评',`gradeExercise('${e.id}')`,'dark')}<button class="btn dark" id="saveEx">保存</button>`);m.querySelector('#saveEx').onclick=()=>{e.submission=m.querySelector('#sub').value;e.status=m.querySelector('#st').value;save();m.remove();render();toast('仿写练习已保存')};}
function gradeExercise(id){const e=state.exercises.find(x=>x.id===id);if(!e.submission){toast('先写入仿写内容');return}e.score=Math.min(5,Math.max(1,3.5+(e.submission.length>120?.6:0)+(e.submission.includes('她')||e.submission.includes('他')?.2:0)));e.feedback='完成了核心限制。动作与环境已经承担了一部分情绪表达；下一步建议减少解释性句子，并让人物关系发生一个可观察的小变化。';e.status='已完成';recordTraining(e.skill||'动作暗示',e.score,e.title);save();toast('AI 点评已生成');editExercise(id)}
function recordTraining(skill,score,title){state.trainingHistory.unshift({id:uid('tr'),skill,score,date:new Date().toISOString(),source:'exercise',title:title||skill+' · 仿写练习'});const t=state.techniques.find(x=>x.name===skill)||state.techniques.find(x=>x.name.includes(skill));if(t){t.mastery=masteryFromHistory(skill||t.name);} }
function analyzeNote(id){const n=state.notes.find(x=>x.id===id);if(!n)return;const analysis={why:'这段文字把情绪藏在动作和节奏里，没有直接告诉读者人物“舍不得”，而是让动作本身成为心理证据。',techniques:[['动作暗示',5],['情绪留白',4.5],['潜台词',4.5]],practice:'写一个人物准备离开却没有真正离开的场景。禁止直接使用“难过、舍不得、后悔”等情绪词。'};n.analysis=analysis;save();modal('AI 拆解 · 摘抄',`<div class="quote-focus">${esc(n.quote)}</div><div class="analysis-block"><h4>为什么有效</h4><p>${analysis.why}</p></div><div class="analysis-grid">${analysis.techniques.map(x=>`<div><b>${x[0]}</b><div class="stars-big">${stars(x[1])}</div></div>`).join('')}</div><div class="analysis-block"><h4>下一步仿写</h4><p>${analysis.practice}</p></div>`,`${btn('加入仿写练习',`addExerciseFromAI('${id}')`,'dark')}`)}
function addExerciseFromAI(noteId){const n=state.notes.find(x=>x.id===noteId);state.exercises.unshift({id:uid('e'),title:'AI 仿写：动作代替情绪',prompt:'参考摘抄中的动作暗示方法，写一个人物准备离开却没有真正离开的场景。禁止直接使用“难过、舍不得、后悔”等情绪词。100—200 字。',skill:'动作暗示',submission:'',score:null,feedback:null,status:'未完成',source_note:n?.id});save();document.querySelector('.modal-back')?.remove();openWritingTab('exercises');toast('已加入仿写训练')}
function analyzeOriginal(id){const w=state.writings.find(x=>x.id===id);const html=`<div class="analysis-block"><h4>故事总览</h4><p>当前作品的核心张力来自人物没有说出口的真实需求。建议继续保留信息差，让每个场景至少产生一次关系变化。</p></div><div class="analysis-grid"><div><b>人物</b><p>目标、恐惧、关系变化需要在章节中持续留下行动证据。</p></div><div><b>节奏</b><p>建议每 2—3 个场景制造一次小钩子，每 8—12 个场景形成一次较大的转折。</p></div><div><b>悬念</b><p>不要一次性解释过去，把答案拆成可验证的小线索。</p></div><div><b>钩子</b><p>章节结尾优先使用新信息、关系变化或不可逆行动。</p></div></div>`;const box=document.getElementById('originalAnalysis');if(box){box.innerHTML=`<div class="analysis-panel"><div class="analysis-head"><h3>AI 故事分析 · ${esc(w.title)}</h3><button onclick="this.parentElement.parentElement.remove()">×</button></div>${html}</div>`;box.scrollIntoView({behavior:'smooth',block:'start'})}}
function uploadWork(){const body=`<div class="upload-zone" id="dropZone"><div class="upload-icon">↑</div><strong id="fileName">选择作品文件</strong><span>TXT · DOCX · EPUB · 文件只在后台解析，正文不在网页展示</span><input id="workFile" type="file" accept=".txt,.docx,.epub"></div><div class="field"><label>分析重点（可选）</label><input id="focus" placeholder="人物关系 / 悬念 / 三章一钩子 / 节奏 / 文笔……"></div><div class="pipeline">${['小说','自动切块','片段分析','提取事实','人物变化','剧情变化','伏笔','悬念','钩子','写作技巧','总编 AI','完整故事报告'].map((x,i)=>`<span><b>${String(i+1).padStart(2,'0')}</b>${x}</span>`).join('')}</div>`;const m=modal('上传作品 · 后台 AI 分析',body,`${btn('取消',`this.closest('.modal-back').remove()`)}<button class="btn dark" id="startUpload">上传并开始分析 →</button>`);const input=m.querySelector('#workFile');input.onchange=()=>m.querySelector('#fileName').textContent=input.files[0]?.name||'选择作品文件';m.querySelector('#startUpload').onclick=()=>processUpload(m,input.files[0]);}
async function demoProcessUpload(m,file){if(!file)return toast('请选择 TXT、DOCX 或 EPUB');if(!/\.(txt|docx|epub)$/i.test(file.name))return toast('仅支持 TXT / DOCX / EPUB');const focus=m.querySelector('#focus').value;const button=m.querySelector('#startUpload');button.disabled=true;button.textContent='后台解析中…';const status=modal('AI 分析任务已创建',`<div class="job-status"><div class="spinner"></div><h3>正在建立分析档案</h3><p>不会在网页展示原文。生产模式将文件放入 Supabase Private Storage，再由后台按章节 / 卷 / 全书分层分析。</p><div class="pipeline live"><span class="on">01 小说</span><span class="on">02 自动切块</span><span>03 片段分析</span><span>04 人物 / 剧情</span><span>05 悬念 / 钩子</span><span>06 总编 AI</span></div></div>`);m.remove();await new Promise(r=>setTimeout(r,650));const doc={id:uid('d'),filename:file.name,title:file.name.replace(/\.(txt|docx|epub)$/i,''),format:file.name.split('.').pop().toUpperCase(),characters:0,chunk_count:0,status:'completed',focus,analysis_levels:['章节级','卷级','全书级'],created_at:new Date().toISOString(),report:demoReport(file.name,focus)};try{if(file.type==='text/plain'||/\.txt$/i.test(file.name)){const text=await file.text();doc.characters=text.length;doc.chunk_count=Math.max(1,Math.ceil(text.length/12000))}else{doc.characters=0;doc.chunk_count=0}}catch{}state.documents.unshift(doc);save();selectedDocument=doc.id;openWritingTab('documents');setTimeout(()=>openDocument(doc.id),80);toast('分析档案已建立')}
function demoReport(filename,focus){return {title:filename.replace(/\.(txt|docx|epub)$/i,''),focus:focus||'综合分析',overview:'这是一个生产版分析档案示例。真实部署后将由后台 AI 根据完整文本生成。',levels:{chapter:{summary:'章节级：识别章节事件、人物行动、关系变化、冲突、伏笔、悬念、钩子和写作技巧。',items:['每章核心事件','人物状态变化','关系变化','章末钩子','悬念问题','可学习技法']},volume:{summary:'卷级：合并章节事实，识别阶段目标、主线支线、转折、节奏和伏笔回收。',items:['卷目标','阶段冲突','人物弧光','转折密度','伏笔回收','节奏诊断']},book:{summary:'全书级：总编 AI 汇总全书结构，形成完整故事诊断、修改优先级和训练计划。',items:['一句话故事','三幕结构','人物关系','主线支线','悬念系统','钩子系统','文笔技法','优点弱点','仿写训练']}}}}
function reportModel(d){const raw=d.report||{};if(raw.levels)return raw;if(raw.book||raw.volume||raw.chapter){const b=raw.book||{};return {overview:b.detailed_synopsis||b.editor_summary||'已完成分层分析。',levels:{chapter:Array.isArray(raw.chapter)?{summary:`已分析 ${raw.chapter.length} 个章节/文本块。`,items:['章节事件','人物变化','关系变化','剧情推进','伏笔与悬念','章节钩子','写作技巧'],data:raw.chapter}:raw.chapter||{summary:'章节级分析已完成',items:[]},volume:Array.isArray(raw.volume)?{summary:`已形成 ${raw.volume.length} 个卷级分析单元。`,items:['卷目标','阶段冲突','人物弧光','关系变化','转折密度','伏笔回收','节奏诊断'],data:raw.volume}:raw.volume||{summary:'卷级分析已完成',items:[]},book:{summary:b.editor_summary||b.detailed_synopsis||'全书级总编分析已完成。',items:['一句话核心','三幕结构','人物与关系','主线与支线','悬念与伏笔','章节钩子','文笔技法','优点与问题','仿写训练'],data:b}}}}return demoReport(d.filename,d.focus)}
function openDocument(id){const d=state.documents.find(x=>x.id===id);if(!d)return;selectedDocument=id;const r=reportModel(d);modal('完整 AI 故事报告',`<div class="report-hero"><span class="eyebrow">AI EDITORIAL ARCHIVE · ${esc(d.format)}</span><h2>${esc(d.title)}</h2><p>${esc(r.overview||r.levels.book.summary||'')}</p><div class="report-meta">后台文件：${esc(d.filename)} · 原文不在页面展示 · 章节级 / 卷级 / 全书级</div></div><div class="report-tabs">${[['chapter','章节级'],['volume','卷级'],['book','全书级']].map(x=>`<button onclick="showReportLevel('${d.id}','${x[0]}')">${x[1]}</button>`).join('')}</div><div id="levelReport">${reportLevelHtml(r.levels.book,'全书级')}</div>`,`${btn('编辑分析重点',`editDocument('${d.id}')`)}${btn('删除文档',`deleteDocument('${d.id}')`,'danger')}`)}
function showReportLevel(id,level){const d=state.documents.find(x=>x.id===id);if(!d)return;const r=reportModel(d);const box=document.getElementById('levelReport');if(box)box.innerHTML=reportLevelHtml(r.levels[level],level==='chapter'?'章节级':level==='volume'?'卷级':'全书级')}
function reportLevelHtml(x,title){const data=x?.data;let detail='';if(Array.isArray(data)){detail=data.slice(0,80).map((item,i)=>`<div class="analysis-item"><h5>${String(i+1).padStart(2,'0')} · ${esc(item.chapter||item.volume||item.scene||'分析单元')}</h5><p><b>剧情：</b>${esc((item.events||item.plot||[]).join('；'))}</p><p><b>人物/关系：</b>${esc((item.character_changes||item.relationship_changes||item.character_arcs||[]).join('；'))}</p><p><b>悬念/钩子：</b>${esc((item.suspense||item.hooks||[]).join('；'))}</p><p><b>技法：</b>${esc((item.techniques||[]).join('；'))}</p></div>`).join('');}else if(data&&typeof data==='object'){detail=`<div class="analysis-grid">${Object.entries(data).slice(0,14).map(([k,v])=>`<div><b>${esc(k)}</b><p>${esc(Array.isArray(v)?v.join('；'):typeof v==='object'?JSON.stringify(v):v)}</p></div>`).join('')}</div>`}return `<div class="level-report"><div class="level-title"><span class="eyebrow">${title}</span><h3>${esc(x?.summary||'')}</h3></div><div class="analysis-grid">${(x?.items||[]).map((i,n)=>`<button onclick="toast('该模块已进入历史分析')"><b>${String(n+1).padStart(2,'0')}</b><span>${esc(i)}</span><i>→</i></button>`).join('')}</div>${detail}<div class="analysis-block"><h4>AI 编辑建议</h4><p>生产模式会保存章节定位、证据、评分、修改优先级和训练结果；后续可以从这里直接生成仿写任务。</p></div></div>`}
function editDocument(id){const d=state.documents.find(x=>x.id===id);formModal('编辑上传文档',[{id:'t',label:'文档名称',value:d.title},{id:'f',label:'分析重点',value:d.focus||''}],m=>{d.title=m.querySelector('#t').value;d.focus=m.querySelector('#f').value;save();m.remove();render();})}
function demoReanalyzeDocument(id){const d=state.documents.find(x=>x.id===id);d.status='processing';save();render();setTimeout(()=>{d.status='completed';d.report=demoReport(d.filename,d.focus);save();render();toast('重新分析完成（演示模式）')},900)}
function demoDeleteDocument(id){confirmAction('删除上传文档','将删除这个分析档案；生产模式还会同时删除 Private Storage 中的原始文件和分析缓存。',`state.documents=state.documents.filter(x=>x.id!=='${id}');save();render()`)}
function openDocReport(id){const d=state.documents.find(x=>x.id===id);if(d)openDocument(id);else toast('该作品还没有上传分析档案')}
function deleteItem(collection,id){confirmAction('确认删除','此操作不可撤销，请确认要删除这条记录。',`state.${collection}=state.${collection}.filter(x=>x.id!=='${id}');if(selectedWriting==='${id}')selectedWriting=state.writings[0]?.id||null;save();render()`)}
function openSkill(id){const t=state.techniques.find(x=>x.id===id);if(!t)return;selectedSkill=id;const history=trainingsForSkill(t.name).sort((a,b)=>new Date(b.date)-new Date(a.date));const overall=masteryFromHistory(t.name);const latest=latestScoreForSkill(t.name);modal(`技巧训练档案 · ${t.name}`,`<div class="skill-hero"><span class="eyebrow">AI MASTERY</span><div class="stars-big">${stars(overall)}</div><strong>${overall.toFixed(1)} / 5</strong><p>${esc(t.description)}</p><div class="score-pair"><span>综合掌握（全部训练） <b>${overall.toFixed(1)}</b></span><span>最新仿写评分 <b>${latest.toFixed(1)}</b></span></div></div><div class="section-title"><h3>历史训练</h3><span>${history.length} RECORDS</span></div>${history.length?history.map(h=>`<div class="history-row"><span>${new Date(h.date).toLocaleDateString()}</span><b>${stars(h.score)}</b><span>${esc(h.title||h.source||'exercise')}</span></div>`).join('')+`<div class="toolbar" style="margin-top:12px">${btn('在成长档案查看全部',"document.querySelector('.modal-back')?.remove();openTrainingHistory()")}</div>`:`<div class="empty">还没有对应训练记录。完成仿写后 AI 会自动更新掌握度。</div>`}<div class="section-title"><h3>AI 掌握分析</h3><span>5 STAR SCALE</span></div><div class="analysis-block"><p>${overall<3?'当前掌握度偏低，建议增加针对性仿写，并在每次点评后进行一次修改。':overall<4?'已经形成基础方法，但稳定性不足，建议继续训练并尝试迁移到原创作品。':'掌握度较好，建议进入复杂场景训练，并检查是否能稳定迁移到长篇章节。'}</p></div>`,`${btn('开始相关仿写',`addSkillExercise('${t.name}')`,'dark')}${btn('全部历史训练',"document.querySelector('.modal-back')?.remove();openTrainingHistory()")}`)}
function openSkillByName(name){const t=state.techniques.find(x=>x.name===name)||state.techniques.find(x=>name&&x.name.includes(name));if(t)openSkill(t.id);else toast('未找到对应技巧档案')}
function onSkillTagClick(el){
  const v=el&&el.getAttribute('data-skill-filter');
  openTrainingHistory(v||null);
}
function openTrainingHistory(filterSkill){
  skillFilter=(filterSkill&&filterSkill!=='null')?filterSkill:'';
  route='training';
  document.querySelectorAll('.modal-back').forEach(el=>el.remove());
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function openSkillTrainingPage(skill){
  openTrainingHistory(skill||'');
}
function training(){
  const all=[...(state.trainingHistory||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const skill=skillFilter||'';
  const list=skill?all.filter(x=>x.skill===skill||(x.skill&&skill.includes(x.skill))||(skill&&x.skill&&x.skill.includes(skill))):all;
  const title=skill?`训练 · ${skill}`:'历史训练';
  const desc=skill?`技巧「${skill}」下的全部历史训练记录，与文笔技巧库档案互通。`:'全部仿写与技巧训练记录。点击上方技巧标签进入该技巧的独立训练页。';
  const skillTabs=['全部',...SKILLS].map(s=>{
    const count=s==='全部'?all.length:all.filter(x=>x.skill===s).length;
    const active=(!skill&&s==='全部')||skill===s;
    const val=s==='全部'?'':s;
    return `<button type="button" class="tag-chip ${active?'active':''}" data-skill-filter="${esc(val)}" onclick="onSkillTagClick(this)">${esc(s)}${s==='全部'?'':` · ${count}`}</button>`;
  }).join('');
  const headActions=btn('← 成长档案',"go('profile')")+btn('去技巧库',"go('techniques')",'dark');
  return pageHead('06',title,desc,headActions)
    + (skill?`<div class="skill-filter-banner"><span class="eyebrow">SKILL ARCHIVE</span><h3>${esc(skill)}</h3><p>该技巧标签下的全部历史训练（共 ${list.length} 条）。可点击其他标签切换，或点「全部」返回总览。</p></div>`:'')
    +`<div class="toolbar"><span>${skill?`技巧 · ${esc(skill)} · ${list.length} 条`:`全部记录 · ${list.length} 条`}</span>${skill?`<button type="button" class="btn" data-skill-filter="" onclick="onSkillTagClick(this)">← 全部记录</button>`:''}</div>`
    +`<div class="tag-bar">${skillTabs}</div>`
    +`<div class="training-history-panel training-page-list">${list.length?list.map(h=>`<button type="button" class="history-row history-row-link" data-skill-name="${esc(h.skill)}" onclick="openSkillByName(this.getAttribute('data-skill-name'))"><span class="hist-date">${new Date(h.date).toLocaleDateString()}</span><span class="hist-skill">${esc(h.skill)}</span><b class="hist-stars">${stars(h.score)}</b><span class="hist-src">${esc(h.title||h.note||h.source||'exercise')}</span><i>→</i></button>`).join(''):`<div class="empty"><h3>${skill?'该技巧下暂无训练记录':'还没有历史训练'}</h3><p>在「我的创作 → 仿写练习」完成并接受 AI 点评后，记录会出现在这里。</p>${btn('去仿写练习',"go('writing');openWritingTab('exercises')",'dark')}</div>`}</div>`;
}

function addSkillExercise(skill){state.exercises.unshift({id:uid('e'),title:`${skill} · AI 专项仿写`,prompt:`围绕“${skill}”完成一次 150—300 字原创场景练习。要求先使用目标技巧，再避免直接解释情绪。`,skill,submission:'',score:null,feedback:null,status:'未完成'});save();document.querySelector('.modal-back')?.remove();openWritingTab('exercises')}
function openCoach(){modal('AI 教练 · Personal Writing Coach',`<div class="coach-hero"><span class="eyebrow">CURRENT TRAINING PLAN</span><h2>${esc(currentFocus())}</h2><p>${esc(coachReason())}</p></div><div class="analysis-grid"><div><b>第 1 步</b><p>阅读 3 个高质量片段，记录作者如何处理目标技巧。</p></div><div><b>第 2 步</b><p>完成 2 次专项仿写，每次提交后接受 AI 点评。</p></div><div><b>第 3 步</b><p>把技巧迁移到自己的原创章节，再进行一次 AI 复盘。</p></div><div><b>第 4 步</b><p>系统重新计算掌握度，决定下一阶段训练重点。</p></div></div>`,`${btn('进入已上传文档',`document.querySelector('.modal-back')?.remove();openWritingTab('documents')`,'dark')}${btn('开始专项仿写',`addSkillExercise('${[...state.techniques].sort((a,b)=>a.mastery-b.mastery)[0]?.name||'人物塑造'}')` )}`)}
function openAccount(){formModal('账号设置',[{id:'n',label:'显示名称',value:state.user.name},{id:'e',label:'邮箱',value:state.user.email}],m=>{state.user.name=m.querySelector('#n').value;state.user.email=m.querySelector('#e').value;save();m.remove();render()})}
function openCloudStatus(){modal('数据模式',`<div class="analysis-block"><h4>${window.RA_CONFIG?.supabaseUrl?'CLOUD MODE':'DEMO MODE'}</h4><p>${window.RA_CONFIG?.supabaseUrl?'已检测到 Supabase 配置。下一步应执行 supabase-schema.sql 并接入 Auth/RLS。':'当前所有数据保存在本浏览器 localStorage。为了跨设备长期使用，请配置 Supabase URL、Anon Key，并执行项目附带的生产数据库脚本。'}</p></div>`,`${btn('查看生产配置说明',`toast('请打开 README-production.md')`)}`)}
async function createInvite(){
  if(cloudReady){const email=prompt('绑定邮箱（可留空）','');try{const token=await cloudToken();const r=await fetch('/api/create-invite',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({email:email||null})});const d=await r.json();if(!r.ok)throw new Error(d.error||'创建邀请失败');state.invites.unshift({...d.invite,created:new Date().toISOString()});saveLocalOnly();render();toast('邀请码已生成：'+d.invite.code);return}catch(e){toast(e.message);return}}
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const a=new Uint32Array(8);crypto.getRandomValues(a);a.forEach(x=>s+=alphabet[x%alphabet.length]);const code='RA-'+s.slice(0,4)+'-'+s.slice(4);state.invites.unshift({code,status:'UNUSED',created:new Date().toISOString()});save();render();toast('邀请码：'+code)
}
function revokeInvite(code){const i=state.invites.find(x=>x.code===code);if(i){i.status='REVOKED';save();render()}}
function openReport(type){const year=type==='year';modal(year?'2026 年度报告':'2026 / 09 月度报告',`<div class="report-hero"><span class="eyebrow">${year?'YEARLY':'MONTHLY'} WRITING REPORT</span><h2>${year?'你的 2026 写作档案':'本月训练复盘'}</h2><p>${year?'系统会基于全年摘抄、仿写训练、原创和 AI 分析记录生成长期成长报告。':'本月重点不是数量，而是哪些训练真的转化成了写作能力。'}</p></div><div class="report-stats">${[['阅读',state.books.length],['摘抄',state.notes.length],['仿写',state.exercises.length],['完成',state.exercises.filter(x=>x.status==='已完成').length],['作品',state.writings.length]].map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div><div class="analysis-block"><h4>AI 成长结论</h4><p>${esc(coachReason())} 随着更多真实训练数据进入系统，报告会改为基于历史评分变化、作品诊断和训练完成度自动生成，而不是固定模板。</p></div>`)}
// Initial boot
applyTheme();render();

/* ===== Production Cloud Adapter ===== */
let cloud=null, cloudReady=false, cloudLoading=false;
function cloudConfigured(){return !!(window.RA_CONFIG?.supabaseUrl&&window.RA_CONFIG?.supabaseAnonKey&&!window.RA_CONFIG?.demoMode&&window.supabase)}
async function initCloud(){if(!cloudConfigured())return false;cloudLoading=true;cloud=window.supabase.createClient(window.RA_CONFIG.supabaseUrl,window.RA_CONFIG.supabaseAnonKey);const {data:{session}}=await cloud.auth.getSession();if(!session){cloudLoading=false;renderCloudGate();return true}cloudReady=true;await loadCloudState(session.user);cloudLoading=false;render();cloud.auth.onAuthStateChange(async(_e,s)=>{if(s?.user){cloudReady=true;await loadCloudState(s.user);render()}else{cloudReady=false;renderCloudGate()}});return true}
async function loadCloudState(user){state.user={id:user.id,name:user.user_metadata?.display_name||user.email?.split('@')[0]||'Member',email:user.email||'',role:'member'};try{const {data:p}=await cloud.from('profiles').select('display_name,role').eq('id',user.id).maybeSingle();if(p){state.user.name=p.display_name||state.user.name;state.user.role=p.role||'member'}}catch{}const load=async(table)=>{const {data,error}=await cloud.from(table).select('*').eq('user_id',user.id);if(error)throw error;return data||[]};try{state.books=await load('books');state.notes=await load('excerpts');state.ideas=await load('ideas');state.writings=await load('writings');state.exercises=await load('exercises');state.techniques=await load('skill_profiles');if(!state.techniques.length)state.techniques=SKILLS.map((name,i)=>({id:crypto.randomUUID(),user_id:user.id,skill:name,name,description:'AI 训练技能',mastery:0}));state.documents=await load('writing_documents');const {data:jobs}=await cloud.from('analysis_jobs').select('*').eq('user_id',user.id).order('created_at',{ascending:false});for(const d of state.documents){d.job_id=jobs?.find(j=>j.document_id===d.id)?.id||null;}const {data:reports}=await cloud.from('document_reports').select('*').eq('user_id',user.id);for(const d of state.documents){const rr=(reports||[]).filter(x=>x.document_id===d.id);const book=rr.find(x=>x.level==='book')?.report;const volume=rr.find(x=>x.level==='volume')?.report;const chapter=rr.find(x=>x.level==='chapter')?.report;d.report={book:book||{},volume:volume||[],chapter:chapter||[]};}state.trainingHistory=await load('training_records');normalizeCloudState();saveLocalOnly();}catch(e){toast('云端数据读取失败：'+e.message)}}
function saveLocalOnly(){localStorage.setItem(KEY,JSON.stringify(state))}
let cloudSyncTimer=null;function queueCloudSync(){saveLocalOnly();if(!cloudReady)return;clearTimeout(cloudSyncTimer);cloudSyncTimer=setTimeout(syncCloud,350)}
async function syncTable(table,rows,userId,remoteIdField='id'){if(!cloudReady)return;const clean=rows.map(r=>{const x={...r,user_id:userId};delete x.name; if(table==='skill_profiles'){x.skill=r.skill||r.name;delete x.description}return x});if(clean.length)await cloud.from(table).upsert(clean,{onConflict:'id'});const {data:remote}=await cloud.from(table).select('id').eq('user_id',userId);const keep=new Set(rows.map(r=>r.id));const gone=(remote||[]).map(x=>x.id).filter(id=>!keep.has(id));if(gone.length)await cloud.from(table).delete().in('id',gone).eq('user_id',userId)}
async function syncCloud(){if(!cloudReady||!cloud)return;const uid=state.user.id;try{await syncTable('books',state.books,uid);await syncTable('excerpts',state.notes,uid);await syncTable('ideas',state.ideas,uid);await syncTable('writings',state.writings,uid);await syncTable('exercises',state.exercises,uid);await syncTable('skill_profiles',state.techniques,uid);await syncTable('training_records',state.trainingHistory,uid);await cloud.from('profiles').upsert({id:uid,display_name:state.user.name,role:state.user.role},{onConflict:'id'});toast('云端已同步')}catch(e){console.error(e);toast('云端同步失败：'+e.message)}}
function renderCloudGate(){document.getElementById('app').innerHTML=`<div class="gate-screen"><div class="gate-card"><span class="eyebrow">PRIVATE EDITION · CLOUD</span><h1>READING<br>ARCHIVE</h1><p>这是邀请制私人写作系统。请登录，或使用开发者提供的邀请码创建账户。</p><div class="gate-tabs"><button class="active" onclick="showCloudLogin()">登录</button><button onclick="showCloudRedeem()">邀请码加入</button></div><div id="gateForm"></div></div></div>`;showCloudLogin()}
function showCloudLogin(){const box=document.getElementById('gateForm');if(!box)return;box.innerHTML=`<div class="field"><label>邮箱</label><input id="loginEmail" type="email"></div><div class="field"><label>密码</label><input id="loginPassword" type="password"></div><button class="btn dark wide" onclick="cloudLogin()">登录档案 →</button>`}
function showCloudRedeem(){const box=document.getElementById('gateForm');if(!box)return;box.innerHTML=`<div class="field"><label>开发者邀请码</label><input id="inviteCode"></div><div class="field"><label>邮箱</label><input id="redeemEmail" type="email"></div><div class="field"><label>设置密码（至少 8 位）</label><input id="redeemPassword" type="password"></div><button class="btn dark wide" onclick="redeemInvite()">验证邀请码并创建账户 →</button>`}
async function cloudLogin(){const email=document.getElementById('loginEmail').value.trim(),password=document.getElementById('loginPassword').value;if(!email||!password)return toast('请填写邮箱和密码');const {error}=await cloud.auth.signInWithPassword({email,password});if(error)toast(error.message);}
async function redeemInvite(){const code=document.getElementById('inviteCode').value.trim(),email=document.getElementById('redeemEmail').value.trim(),password=document.getElementById('redeemPassword').value;if(!code||!email||password.length<8)return toast('请完整填写邀请码、邮箱和密码');const r=await fetch('/api/redeem-invite',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code,email,password})});const d=await r.json();if(!r.ok)return toast(d.error||'邀请码验证失败');toast('账户已创建，请登录');showCloudLogin();document.getElementById('loginEmail').value=email}
async function cloudLogout(){if(cloud)await cloud.auth.signOut();else{state.invited=false;saveLocalOnly();location.reload()}}

/* Cloud-specific overrides */
async function cloudToken(){const {data:{session}}=await cloud.auth.getSession();return session?.access_token||''}
function normalizeCloudState(){state.notes=state.notes.map(x=>({...x,tags:x.tags||[]}));state.ideas=state.ideas.map(x=>({...x,tags:x.tags||[]}));state.writings=state.writings.map(x=>({...x,content:x.content||''}));state.exercises=state.exercises.map(x=>({...x,submission:x.submission||'',status:x.status||'未完成'}));state.techniques=state.techniques.map((x,i)=>({...x,name:x.name||x.skill||SKILLS[i]||'新技巧',description:x.description||'AI 训练技能',mastery:Number(x.mastery||0)}));}
async function uploadToCloudStorage(file){const path=`${state.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w\-.\u4e00-\u9fff]/g,'_')}`;const {error}=await cloud.storage.from('private-manuscripts').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});if(error)throw error;return path}
async function processUpload(m,file){
  if(!file)return toast('请选择 TXT、DOCX 或 EPUB');
  if(!/\.(txt|docx|epub)$/i.test(file.name))return toast('仅支持 TXT / DOCX / EPUB');
  const focus=m.querySelector('#focus').value; const button=m.querySelector('#startUpload');
  button.disabled=true;button.textContent='正在创建后台分析任务…';m.remove();
  if(!cloudReady){
    // Demo mode：不上传到外部服务，只创建一个可查看的分层分析档案。
    let chars=0,chunks=0;try{if(/\.txt$/i.test(file.name)){const text=await file.text();chars=text.length;chunks=Math.max(1,Math.ceil(text.length/10000))}}catch{}
    const doc={id:uid('d'),filename:file.name,title:file.name.replace(/\.(txt|docx|epub)$/i,''),format:file.name.split('.').pop().toUpperCase(),characters:chars,chunk_count:chunks,status:'completed',focus,analysis_levels:['章节级','卷级','全书级'],created_at:new Date().toISOString(),report:demoReport(file.name,focus)};
    state.documents.unshift(doc);save();selectedDocument=doc.id;openWritingTab('documents');setTimeout(()=>openDocument(doc.id),80);toast('演示分析档案已建立');return;
  }
  let storagePath='';let docId='';
  try{
    storagePath=await uploadToCloudStorage(file);
    const token=await cloudToken();const form=new FormData();form.append('file',file);form.append('focus',focus);
    const r=await fetch('/api/create-analysis-job',{method:'POST',body:form,headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(!r.ok)throw new Error(d.error||'创建分析任务失败');
    docId=d.document_id;await cloud.from('writing_documents').update({storage_path:storagePath}).eq('id',docId).eq('user_id',state.user.id);
    toast(`分析任务已创建，共 ${d.chunk_count} 个分析块`);openWritingTab('documents');
    const poll=async()=>{try{const rr=await fetch('/api/process-analysis-job',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({job_id:d.job_id})});const x=await rr.json();if(!rr.ok)throw new Error(x.error||'后台分析失败');if(x.status==='completed'){const {data:doc}=await cloud.from('writing_documents').select('*').eq('id',docId).single();const {data:reports}=await cloud.from('document_reports').select('*').eq('document_id',docId).eq('user_id',state.user.id);const map={};for(const q of reports||[])map[q.level]=q.report;state.documents.unshift({...doc,characters:doc.source_chars,chunk_count:doc.chunk_count,report:{chapter:map.chapter||[],volume:map.volume||[],book:map.book||{}}});saveLocalOnly();render();openDocument(docId);toast('完整分层 AI 分析完成')}else{toast(`AI 后台分析 ${x.progress||0}%`);setTimeout(poll,1200)}}catch(e){toast('后台分析失败：'+e.message)}};poll();
  }catch(e){if(storagePath)await cloud.storage.from('private-manuscripts').remove([storagePath]).catch(()=>{});toast('上传失败：'+e.message);openWritingTab('documents')}
}
async function reanalyzeDocument(id){
  const d=state.documents.find(x=>x.id===id);if(!d)return;
  if(!cloudReady)return demoReanalyzeDocument(id);
  if(!d.job_id)return toast('没有可继续的后台任务，请重新上传该文档');
  const token=await cloudToken();d.status='processing';saveLocalOnly();render();
  const poll=async()=>{try{const r=await fetch('/api/process-analysis-job',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({job_id:d.job_id})});const x=await r.json();if(!r.ok)throw new Error(x.error||'分析失败');if(x.status==='completed'){const {data:reports}=await cloud.from('document_reports').select('*').eq('document_id',id).eq('user_id',state.user.id);const map={};for(const q of reports||[])map[q.level]=q.report;d.status='completed';d.report={chapter:map.chapter||[],volume:map.volume||[],book:map.book||{}};saveLocalOnly();render();openDocument(id);toast('后台分析已完成')}else{toast(`后台分析 ${x.progress||0}%`);setTimeout(poll,1200)}}catch(e){d.status='failed';saveLocalOnly();render();toast(e.message)}};poll();
}
function deleteDocument(id){const d=state.documents.find(x=>x.id===id);confirmAction('确认删除上传文档','删除后会移除分析档案；云端模式还会删除 Private Storage 中的原文件。',`(async()=>{state.documents=state.documents.filter(x=>x.id!=='${id}');saveLocalOnly();if(cloudReady){if('${d?.storage_path||''}')await cloud.storage.from('private-manuscripts').remove(['${d?.storage_path||''}']);await cloud.from('writing_documents').delete().eq('id','${id}').eq('user_id',state.user.id)}render()})()`)}
function logout(){if(cloudReady)return cloudLogout();state.invited=false;saveLocalOnly();location.reload()}

(async()=>{if(cloudConfigured()){await initCloud();}else{render();}})();

window.onExcerptTagClick=onExcerptTagClick;window.openAddTagModal=openAddTagModal;window.submitNewTag=submitNewTag;window.onSkillTagClick=onSkillTagClick;window.openTrainingHistory=openTrainingHistory;window.openSkillByName=openSkillByName;window.openTagPage=openTagPage;window.go=go;
