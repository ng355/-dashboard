import { useState, useEffect } from "react";

// ========== デフォルトデータ ==========
const DEFAULT_DAILY_TASKS = [
  { id: "x_post", label: "X投稿した（最低1投稿）" },
  { id: "note_check", label: "noteコメント・反応を確認" },
  { id: "focus", label: "今日の最優先タスクを1つ決めた" },
  { id: "jibun", label: "自分事業に関して何か前進した" },
];

const DEFAULT_WEEKLY_TASKS = [
  { id: "note", label: "note記事を書いてアップした（週1本）", critical: true },
  { id: "x_daily", label: "X毎日投稿（週5回以上）", critical: true },
  { id: "profile", label: "プロフィール確認（自己理解×キャリア設計になっているか）", critical: false },
  { id: "stripe", label: "Stripe設定を進めた", critical: false },
  { id: "pdf_plan", label: "軽量プロダクト（PDF/ワークシート）の企画を進めた", critical: false },
  { id: "follower_check", label: "フォロワー数・記事PVを記録した", critical: false },
  { id: "review", label: "今週の振り返りを書いた", critical: false },
];

const DEFAULT_MONTHLY_TASKS = {
  "2026-03": [
    { id: "m03_1", label: "note記事を4本アップした" },
    { id: "m03_2", label: "プロフィールを「自己理解×キャリア設計」に統一した" },
    { id: "m03_3", label: "Stripeアカウントを作成した" },
    { id: "m03_4", label: "オレンジセールス退職意思を伝えた（7月末退職）" },
    { id: "m03_5", label: "4〜6月の記事テーマリスト10本を作った" },
  ],
  "2026-04": [
    { id: "m04_1", label: "有料記事を1本リリースした（500〜980円）" },
    { id: "m04_2", label: "βテスター募集記事の下書きを書いた" },
    { id: "m04_3", label: "軽量プロダクト（PDF）を1本リリースした" },
    { id: "m04_4", label: "ツール1本目（自己理解マップ）の詳細設計をした" },
    { id: "m04_5", label: "Xフォロワー200人に到達した" },
  ],
  "2026-05": [
    { id: "m05_1", label: "有料記事を計2本リリースした（月2本ペース）" },
    { id: "m05_2", label: "βテスター募集を開始した（目標5人）" },
    { id: "m05_3", label: "ツール1本目の開発を開始した" },
    { id: "m05_4", label: "noteフォロワー150人に到達した" },
  ],
  "2026-06": [
    { id: "m06_1", label: "βテスター5人完了・フィードバック収集した" },
    { id: "m06_2", label: "ツール1本目（自己理解マップ）を無料公開した" },
    { id: "m06_3", label: "Q2振り返りとQ3計画を更新した" },
    { id: "m06_4", label: "Xフォロワー350人に到達した" },
  ],
  "2026-07": [
    { id: "m07_1", label: "オレンジセールス最終出社・引き継ぎ完了" },
    { id: "m07_2", label: "個別セッションの販売ページをnoteに作成した" },
    { id: "m07_3", label: "ツール2本目（キャリア棚卸しツール）の企画を開始した" },
  ],
  "2026-08": [
    { id: "m08_1", label: "個別セッションの初回販売（1件以上）" },
    { id: "m08_2", label: "ツール2本目の開発・公開" },
    { id: "m08_3", label: "note週1本継続（累計24本以上）" },
  ],
  "2026-09": [
    { id: "m09_1", label: "個別セッション月2件ペースを確立した" },
    { id: "m09_2", label: "有料マガジン開始の企画・準備をした" },
    { id: "m09_3", label: "Q3振り返りとQ4計画を更新した" },
  ],
  "2026-10": [
    { id: "m10_1", label: "有料マガジンを開始した（初期10人目標）" },
    { id: "m10_2", label: "B2B研修の提案資料ドラフトを作成した" },
    { id: "m10_3", label: "note記事のアーカイブを整理・マガジン化した" },
  ],
  "2026-11": [
    { id: "m11_1", label: "マガジン会員20人に到達した" },
    { id: "m11_2", label: "B2B研修の提案先リストを作成した（5社以上）" },
    { id: "m11_3", label: "年末に向けたコンテンツ計画を作成した" },
  ],
  "2026-12": [
    { id: "m12_1", label: "マガジン会員30人に到達した" },
    { id: "m12_2", label: "Year 1の振り返りとYear 2計画を作成した" },
    { id: "m12_3", label: "note記事52本（週1本）を達成した" },
    { id: "m12_4", label: "Year 1収益目標65.7万円の進捗を確認した" },
  ],
};

const DEFAULT_QUARTERLY = {
  "Q1 2026": ["noteプロフィール更新（自己理解×キャリア設計に統一）","Stripeアカウント作成","note記事12本","オレンジセールス退職を伝える","Xフォロワー200人"],
  "Q2 2026": ["note有料記事開始（月2本）","βテスター5人","ツール1本目開発（自己理解マップ）","Xフォロワー350人","noteフォロワー150人"],
  "Q3 2026": ["オレンジセールス終了（7月末）","個別セッション正式販売（月2件）","ツール2本目（キャリア棚卸し）"],
  "Q4 2026": ["有料マガジン開始（初期30人）","B2B営業開始","ツール3本目（オプション）"],
};

const DEFAULT_KPI_TARGETS = {
  "2026-06": { noteFollowers:150, xFollowers:350, revenue:50000, sessions:0, magazineMembers:0, noteArticles:24 },
  "2026-09": { noteFollowers:300, xFollowers:500, revenue:75000, sessions:2, magazineMembers:0, noteArticles:36 },
  "2026-12": { noteFollowers:500, xFollowers:800, revenue:100000, sessions:2, magazineMembers:30, noteArticles:52 },
};

const KPI_FIELD_META = [
  { id:"noteFollowers", label:"noteフォロワー", unit:"人", color:"#4ade80" },
  { id:"xFollowers", label:"Xフォロワー", unit:"人", color:"#60a5fa" },
  { id:"noteArticles", label:"note記事数（累計）", unit:"本", color:"#a78bfa" },
  { id:"revenue", label:"今月の収益", unit:"円", color:"#fbbf24" },
  { id:"sessions", label:"個別セッション（今月）", unit:"件", color:"#f87171" },
  { id:"magazineMembers", label:"マガジン会員数", unit:"人", color:"#34d399" },
];

const STORAGE_KEY = "ng3_dashboard_v2";
const CURRENT_QUARTER = "Q1 2026";

function loadData() {
  try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):null; } catch{return null;}
}
function saveData(d) {
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch(e){console.error(e);}
}

function toLocalDateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function getTodayKey(){return toLocalDateKey(new Date());}
function getWeekKey(){const d=new Date(),day=d.getDay(),diff=d.getDate()-day+(day===0?-6:1);const m=new Date(d);m.setDate(diff);return toLocalDateKey(m);}
function getMonthKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;}
function formatCurrency(v){return v?"¥"+Number(v).toLocaleString():"¥0";}
function uid(){return Math.random().toString(36).slice(2,8);}
function getMonthLabel(k){const[y,m]=k.split("-");return `${y}年${parseInt(m)}月`;}

const S={
  input:{width:"100%",background:"#1a1a30",border:"1px solid #2a2a4a",borderRadius:8,color:"#e8e8f0",padding:"9px 12px",fontSize:13,fontFamily:"inherit",boxSizing:"border-box",outline:"none"},
  textarea:{width:"100%",background:"#1a1a30",border:"1px solid #2a2a4a",borderRadius:8,color:"#e8e8f0",padding:12,fontSize:13,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",outline:"none"},
};
const btn=(c="#a78bfa")=>({background:"none",border:`1px solid ${c}55`,borderRadius:6,color:c,cursor:"pointer",fontSize:11,padding:"3px 8px",fontFamily:"inherit"});

function ProgressBar({value,max,color="#4ade80"}){const p=max>0?Math.min(100,Math.round(value/max*100)):0;return(<div style={{background:"#1a1a2e",borderRadius:4,height:6,overflow:"hidden",margin:"4px 0"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:4,transition:"width 0.5s ease"}}/></div>);}
function Card({children,style={}}){return<div style={{background:"#111128",border:"1px solid #2a2a4a",borderRadius:12,padding:16,marginBottom:12,...style}}>{children}</div>;}
function CardTitle({children,style={}}){return<div style={{fontSize:13,fontWeight:600,color:"#a0a0c0",marginBottom:10,letterSpacing:0.5,...style}}>{children}</div>;}
function CheckItem({checked,label,onToggle,accent="#4ade80",onDelete,onEdit}){return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #1a1a30"}}><div onClick={onToggle} style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?accent:"#3a3a5a"}`,background:checked?accent+"22":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s"}}>{checked&&<span style={{color:accent,fontSize:12,fontWeight:700}}>✓</span>}</div><span onClick={onToggle} style={{flex:1,fontSize:13,color:checked?"#606080":"#c8c8e0",textDecoration:checked?"line-through":"none",lineHeight:1.4,cursor:"pointer"}}>{label}</span>{onEdit&&<button onClick={onEdit} style={btn("#8080b0")}>編集</button>}{onDelete&&<button onClick={onDelete} style={btn("#f87171")}>✕</button>}</div>);}
function EditableRow({value,onChange,onSave,onCancel}){return(<div style={{display:"flex",gap:6,padding:"6px 0",borderBottom:"1px solid #1a1a30"}}><input value={value} onChange={e=>onChange(e.target.value)} style={{...S.input,flex:1}} onKeyDown={e=>e.key==="Enter"&&onSave()} autoFocus/><button onClick={onSave} style={btn("#4ade80")}>保存</button><button onClick={onCancel} style={btn("#8080b0")}>取消</button></div>);}

export default function Dashboard(){
  const[tab,setTab]=useState("daily");
  const[data,setData]=useState(null);

  useEffect(()=>{
    const d=loadData();
    setData(d?{
      daily:d.daily||{},weekly:d.weekly||{},monthly:d.monthly||{},kpi:d.kpi||{},quarterlyDone:d.quarterlyDone||{},
      dailyTasks:d.dailyTasks||DEFAULT_DAILY_TASKS,
      weeklyTasks:d.weeklyTasks||DEFAULT_WEEKLY_TASKS,
      monthlyTasks:d.monthlyTasks||DEFAULT_MONTHLY_TASKS,
      quarterly:d.quarterly||DEFAULT_QUARTERLY,
      kpiTargets:d.kpiTargets||DEFAULT_KPI_TARGETS,
    }:{
      daily:{},weekly:{},monthly:{},kpi:{},quarterlyDone:{},
      dailyTasks:DEFAULT_DAILY_TASKS,weeklyTasks:DEFAULT_WEEKLY_TASKS,
      monthlyTasks:DEFAULT_MONTHLY_TASKS,
      quarterly:DEFAULT_QUARTERLY,kpiTargets:DEFAULT_KPI_TARGETS,
    });
  },[]);

  function update(nd){setData(nd);saveData(nd);}
  if(!data)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0d0d1a",color:"#888",fontFamily:"sans-serif"}}>読み込み中...</div>;

  const tabs=[
    {id:"daily",label:"日次",icon:"☀️"},
    {id:"weekly",label:"週次",icon:"📅"},
    {id:"monthly",label:"月次",icon:"📆"},
    {id:"kpi",label:"KPI",icon:"📊"},
    {id:"quarterly",label:"四半期",icon:"🎯"},
  ];

  return(
    <div style={{minHeight:"100vh",background:"#0a0a18",color:"#e8e8f0",fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0f0f2d 0%,#1a0a2e 100%)",borderBottom:"1px solid #2a2a4a",padding:"16px 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:640,margin:"0 auto"}}>
          <div>
            <div style={{fontSize:11,color:"#8080b0",letterSpacing:2,marginBottom:2}}>ng3 自分業</div>
            <div style={{fontSize:18,fontWeight:700,color:"#c8b8ff"}}>自己理解 × キャリア設計</div>
          </div>
          <div style={{fontSize:10,color:"#8080b0"}}>2026 / 基盤構築期</div>
        </div>
      </div>
      <div style={{display:"flex",background:"#0f0f22",borderBottom:"1px solid #1e1e3a",maxWidth:640,margin:"0 auto",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:"0 0 auto",minWidth:56,padding:"10px 6px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #a78bfa":"2px solid transparent",color:tab===t.id?"#a78bfa":"#606080",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>
            <div style={{fontSize:15}}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>
      <div style={{maxWidth:640,margin:"0 auto",padding:16}}>
        {tab==="daily"&&<DailyTab data={data} update={update}/>}
        {tab==="weekly"&&<WeeklyTab data={data} update={update}/>}
        {tab==="monthly"&&<MonthlyTab data={data} update={update}/>}
        {tab==="kpi"&&<KPITab data={data} update={update}/>}
        {tab==="quarterly"&&<QuarterlyTab data={data} update={update}/>}
      </div>
    </div>
  );
}

function DailyTab({data,update}){
  const todayKey=getTodayKey();
  const[viewDate,setViewDate]=useState(todayKey);
  const isToday=viewDate===todayKey;
  const isFuture=viewDate>todayKey;
  const viewData=data.daily[viewDate]||{tasks:{},memo:""};
  const tasks=data.dailyTasks;
  const[editMode,setEditMode]=useState(false);
  const[newLabel,setNewLabel]=useState("");
  const[editingId,setEditingId]=useState(null);
  const[editingLabel,setEditingLabel]=useState("");

  const moveDay=(delta)=>{const d=new Date(viewDate+"T00:00:00");d.setDate(d.getDate()+delta);setViewDate(toLocalDateKey(d));};
  const carryOver=()=>{
    const y=new Date(todayKey+"T00:00:00");y.setDate(y.getDate()-1);
    const yKey=toLocalDateKey(y);
    const yData=data.daily[yKey]||{tasks:{}};
    const incomplete=tasks.filter(t=>!yData.tasks[t.id]);
    if(!incomplete.length)return;
    alert("昨日の未完了:\n"+incomplete.map(t=>"・"+t.label).join("\n")+"\n\n今日のリストで確認・チェックできます");
  };

  const toggle=id=>update({...data,daily:{...data.daily,[viewDate]:{...viewData,tasks:{...viewData.tasks,[id]:!viewData.tasks[id]}}}});
  const addTask=()=>{if(!newLabel.trim())return;update({...data,dailyTasks:[...tasks,{id:uid(),label:newLabel.trim()}]});setNewLabel("");};
  const delTask=id=>update({...data,dailyTasks:tasks.filter(t=>t.id!==id)});
  const saveEdit=()=>{update({...data,dailyTasks:tasks.map(t=>t.id===editingId?{...t,label:editingLabel}:t)});setEditingId(null);};

  const done=tasks.filter(t=>viewData.tasks[t.id]).length;
  const vd=new Date(viewDate+"T00:00:00");
  const days=[];
  for(let i=6;i>=0;i--){const dd=new Date();dd.setDate(dd.getDate()-i);const k=toLocalDateKey(dd);const cnt=data.daily[k]&&data.daily[k].tasks?tasks.filter(t=>data.daily[k].tasks[t.id]).length:0;days.push({key:k,cnt,label:"日月火水木金土"[dd.getDay()]});}

  const yest=new Date(todayKey+"T00:00:00");yest.setDate(yest.getDate()-1);
  const yKey=toLocalDateKey(yest);
  const yData=data.daily[yKey]||{tasks:{}};
  const incompleteCount=tasks.filter(t=>!yData.tasks[t.id]).length;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>moveDay(-1)} style={{...btn("#8080b0"),padding:"4px 12px",fontSize:16}}>‹</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,color:isToday?"#a78bfa":"#c8c8e0",fontWeight:isToday?700:400}}>
            {vd.getFullYear()}年{vd.getMonth()+1}月{vd.getDate()}日（{"日月火水木金土"[vd.getDay()]}）
          </div>
          {!isToday&&!isFuture&&<div style={{fontSize:10,color:"#f87171",marginTop:2}}>過去の記録</div>}
          {isToday&&<div style={{fontSize:10,color:"#a78bfa",marginTop:2}}>今日</div>}
          {isFuture&&<div style={{fontSize:10,color:"#4ade80",marginTop:2}}>予定</div>}
        </div>
        <button onClick={()=>moveDay(1)} style={{...btn("#8080b0"),padding:"4px 12px",fontSize:16}}>›</button>
      </div>

      {isToday&&incompleteCount>0&&(
        <div style={{background:"#1a1a30",border:"1px solid #f87171",borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:12,color:"#f87171"}}>昨日の未完了: {incompleteCount}件</div>
          <button onClick={carryOver} style={btn("#f87171")}>確認する</button>
        </div>
      )}

      <Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <CardTitle style={{margin:0}}>{isToday?"今日":isFuture?"予定":"過去"}のチェック</CardTitle>
          <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
        </div>
        <ProgressBar value={done} max={tasks.length||1} color="#a78bfa"/>
        <div style={{fontSize:11,color:"#8080b0",margin:"2px 0 10px"}}>{done}/{tasks.length} 完了</div>
        {tasks.map(task=>editingId===task.id
          ?<EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          :<CheckItem key={task.id} checked={!!viewData.tasks[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)} accent="#a78bfa"
              onEdit={editMode?()=>{setEditingId(task.id);setEditingLabel(task.label);}:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {editMode&&(
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="新しい項目..." style={{...S.input,flex:1}} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
            <button onClick={addTask} style={{...btn("#4ade80"),padding:"8px 12px"}}>追加</button>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>{isToday?"今日":isFuture?"予定メモ":"過去のメモ・気づき"}</CardTitle>
        <textarea value={viewData.memo||""} onChange={e=>update({...data,daily:{...data.daily,[viewDate]:{...viewData,memo:e.target.value}}})} placeholder="Xに投稿したこと、記事のアイデア、気づきなど..." style={{...S.textarea,minHeight:100}}/>
      </Card>
      <Card>
        <CardTitle>直近7日のチェック状況</CardTitle>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {days.map(dd=>(
            <div key={dd.key} style={{textAlign:"center",cursor:"pointer"}} onClick={()=>setViewDate(dd.key)}>
              <div style={{width:32,height:32,borderRadius:6,background:dd.key===viewDate?"#6040a0":dd.cnt>=1?"#a78bfa":"#1a1a30",border:`1px solid ${dd.key===viewDate?"#a78bfa":"#2a2a4a"}`,marginBottom:4}}/>
              <div style={{fontSize:10,color:dd.key===viewDate?"#a78bfa":"#606080"}}>{dd.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WeeklyTab({data,update}){
  const week=getWeekKey();
  const weekData=data.weekly[week]||{tasks:{},noteTitle:"",reflection:""};
  const tasks=data.weeklyTasks;
  const[editMode,setEditMode]=useState(false);
  const[newLabel,setNewLabel]=useState("");
  const[newCritical,setNewCritical]=useState(false);
  const[editingId,setEditingId]=useState(null);
  const[editingLabel,setEditingLabel]=useState("");

  const toggle=id=>update({...data,weekly:{...data.weekly,[week]:{...weekData,tasks:{...weekData.tasks,[id]:!weekData.tasks[id]}}}});
  const setField=(f,v)=>update({...data,weekly:{...data.weekly,[week]:{...weekData,[f]:v}}});
  const addTask=()=>{if(!newLabel.trim())return;update({...data,weeklyTasks:[...tasks,{id:uid(),label:newLabel.trim(),critical:newCritical}]});setNewLabel("");setNewCritical(false);};
  const delTask=id=>update({...data,weeklyTasks:tasks.filter(t=>t.id!==id)});
  const saveEdit=()=>{update({...data,weeklyTasks:tasks.map(t=>t.id===editingId?{...t,label:editingLabel}:t)});setEditingId(null);};

  const critical=tasks.filter(t=>t.critical);
  const others=tasks.filter(t=>!t.critical);
  const wd=new Date(week+"T00:00:00"),we=new Date(week+"T00:00:00");we.setDate(we.getDate()+6);

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{color:"#8080b0",fontSize:12}}>今週: {wd.getMonth()+1}/{wd.getDate()} 〜 {we.getMonth()+1}/{we.getDate()}</div>
        <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
      </div>
      <Card>
        <CardTitle>🔴 最優先タスク（絶対やる）</CardTitle>
        <ProgressBar value={critical.filter(t=>weekData.tasks[t.id]).length} max={critical.length||1} color="#f87171"/>
        <div style={{fontSize:11,color:"#8080b0",margin:"2px 0 10px"}}>{critical.filter(t=>weekData.tasks[t.id]).length}/{critical.length}</div>
        {critical.map(task=>editingId===task.id
          ?<EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          :<CheckItem key={task.id} checked={!!weekData.tasks[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)} accent="#f87171"
              onEdit={editMode?()=>{setEditingId(task.id);setEditingLabel(task.label);}:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {weekData.tasks["note"]&&(
          <div style={{marginTop:10}}>
            <div style={{fontSize:12,color:"#8080b0",marginBottom:4}}>今週の記事タイトル</div>
            <input value={weekData.noteTitle||""} onChange={e=>setField("noteTitle",e.target.value)} placeholder="例: グレーゾーンの子の自己理解と..." style={S.input}/>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>その他タスク（Q1フェーズ）</CardTitle>
        {others.map(task=>editingId===task.id
          ?<EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          :<CheckItem key={task.id} checked={!!weekData.tasks[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)}
              onEdit={editMode?()=>{setEditingId(task.id);setEditingLabel(task.label);}:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {editMode&&(
          <div style={{marginTop:10}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="タスク名..." style={{...S.input,flex:1}} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
              <button onClick={addTask} style={{...btn("#4ade80"),padding:"8px 12px"}}>追加</button>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#a0a0c0",cursor:"pointer"}}>
              <input type="checkbox" checked={newCritical} onChange={e=>setNewCritical(e.target.checked)}/>最優先として追加
            </label>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>今週の振り返り</CardTitle>
        <textarea value={weekData.reflection||""} onChange={e=>setField("reflection",e.target.value)} placeholder="うまくいったこと、できなかったこと、来週に活かすこと..." style={{...S.textarea,minHeight:80}}/>
      </Card>
      <div style={{color:"#8080b0",fontSize:11,textAlign:"center",marginTop:8}}>週全体: {tasks.filter(t=>weekData.tasks[t.id]).length}/{tasks.length} 完了</div>
    </div>
  );
}

function MonthlyTab({data,update}){
  const currentMonth=getMonthKey();
  const[viewMonth,setViewMonth]=useState(currentMonth);
  const isCurrentMonth=viewMonth===currentMonth;
  const isFutureMonth=viewMonth>currentMonth;

  const monthlyTasks=data.monthlyTasks||DEFAULT_MONTHLY_TASKS;
  const monthTasks=monthlyTasks[viewMonth]||[];
  const monthRecord=data.monthly[viewMonth]||{};
  const monthMemo=monthRecord.memo||"";
  const[editMode,setEditMode]=useState(false);
  const[newLabel,setNewLabel]=useState("");
  const[editingId,setEditingId]=useState(null);
  const[editingLabel,setEditingLabel]=useState("");

  const moveMonth=(delta)=>{
    const[y,m]=viewMonth.split("-").map(Number);
    const d=new Date(y,m-1+delta,1);
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  };
  const toggle=id=>{
    const prev=data.monthly[viewMonth]||{};
    update({...data,monthly:{...data.monthly,[viewMonth]:{...prev,[id]:!prev[id]}}});
  };
  const setMemo=v=>{
    const prev=data.monthly[viewMonth]||{};
    update({...data,monthly:{...data.monthly,[viewMonth]:{...prev,memo:v}}});
  };
  const addTask=()=>{
    if(!newLabel.trim())return;
    const updated={...monthlyTasks,[viewMonth]:[...monthTasks,{id:uid(),label:newLabel.trim()}]};
    update({...data,monthlyTasks:updated});setNewLabel("");
  };
  const delTask=id=>{
    update({...data,monthlyTasks:{...monthlyTasks,[viewMonth]:monthTasks.filter(t=>t.id!==id)}});
  };
  const saveEdit=()=>{
    update({...data,monthlyTasks:{...monthlyTasks,[viewMonth]:monthTasks.map(t=>t.id===editingId?{...t,label:editingLabel}:t)}});
    setEditingId(null);
  };
  const done=monthTasks.filter(t=>monthRecord[t.id]).length;
  const months2026=["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"];

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>moveMonth(-1)} style={{...btn("#8080b0"),padding:"4px 12px",fontSize:16}}>‹</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:14,color:isCurrentMonth?"#a78bfa":"#c8c8e0",fontWeight:isCurrentMonth?700:400}}>
            {getMonthLabel(viewMonth)}
          </div>
          {isCurrentMonth&&<div style={{fontSize:10,color:"#a78bfa",marginTop:2}}>今月</div>}
          {isFutureMonth&&<div style={{fontSize:10,color:"#4ade80",marginTop:2}}>予定</div>}
          {!isCurrentMonth&&!isFutureMonth&&<div style={{fontSize:10,color:"#f87171",marginTop:2}}>過去</div>}
        </div>
        <button onClick={()=>moveMonth(1)} style={{...btn("#8080b0"),padding:"4px 12px",fontSize:16}}>›</button>
      </div>

      <Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <CardTitle style={{margin:0}}>今月のマイルストーン</CardTitle>
          <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
        </div>
        {monthTasks.length>0&&<>
          <ProgressBar value={done} max={monthTasks.length} color="#a78bfa"/>
          <div style={{fontSize:11,color:"#8080b0",margin:"2px 0 10px"}}>{done}/{monthTasks.length} 完了</div>
        </>}
        {monthTasks.length===0&&!editMode&&<div style={{fontSize:12,color:"#606080",padding:"8px 0"}}>この月のタスクはまだありません。編集から追加できます。</div>}
        {monthTasks.map(task=>editingId===task.id
          ?<EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          :<CheckItem key={task.id} checked={!!monthRecord[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)} accent="#a78bfa"
              onEdit={editMode?()=>{setEditingId(task.id);setEditingLabel(task.label);}:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {editMode&&(
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="マイルストーンを追加..." style={{...S.input,flex:1}} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
            <button onClick={addTask} style={{...btn("#4ade80"),padding:"8px 12px"}}>追加</button>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>振り返り・メモ</CardTitle>
        <textarea value={monthMemo} onChange={e=>setMemo(e.target.value)} placeholder="今月の気づき、うまくいったこと、来月への引き継ぎ..." style={{...S.textarea,minHeight:100}}/>
      </Card>

      <Card>
        <CardTitle>2026年 月次進捗</CardTitle>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {months2026.map(mk=>{
            const mt=monthlyTasks[mk]||[];
            const md=data.monthly[mk]||{};
            const d=mt.filter(t=>md[t.id]).length;
            const pct=mt.length>0?Math.round(d/mt.length*100):null;
            const isCur=mk===currentMonth;
            const isView=mk===viewMonth;
            return(
              <div key={mk} onClick={()=>setViewMonth(mk)} style={{cursor:"pointer",textAlign:"center",width:46}}>
                <div style={{height:36,background:isView?"#6040a0":pct===100?"#4ade8022":"#1a1a30",border:`1px solid ${isView?"#a78bfa":isCur?"#a78bfa66":"#2a2a4a"}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:3}}>
                  <div style={{fontSize:10,color:pct===100?"#4ade80":pct!==null?"#8080b0":"#3a3a5a"}}>{pct!==null?pct+"%":"-"}</div>
                </div>
                <div style={{fontSize:9,color:isCur?"#a78bfa":"#606080"}}>{parseInt(mk.split("-")[1])}月</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function KPITab({data,update}){
  const month=getMonthKey();
  const kpiData=data.kpi[month]||{};
  const kpiTargets=data.kpiTargets;
  const[editMode,setEditMode]=useState(false);
  const[editingTargets,setEditingTargets]=useState(null);

  const setKPI=(f,v)=>update({...data,kpi:{...data.kpi,[month]:{...kpiData,[f]:v}}});
  const startEdit=()=>{setEditingTargets(JSON.parse(JSON.stringify(kpiTargets)));setEditMode(true);};
  const saveTargets=()=>{update({...data,kpiTargets:editingTargets});setEditMode(false);setEditingTargets(null);};
  const setTV=(m,f,v)=>setEditingTargets(p=>({...p,[m]:{...p[m],[f]:Number(v)}}));

  const sortedT=Object.entries(kpiTargets).sort();
  const nextT=sortedT.find(([k])=>k>=month);
  const target=nextT?kpiTargets[nextT[0]]:null;
  const d=new Date();

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{color:"#8080b0",fontSize:12}}>{d.getFullYear()}年{d.getMonth()+1}月の実績を入力</div>
        <button onClick={editMode?saveTargets:startEdit} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"目標値を保存":"目標値を編集"}</button>
      </div>
      {target&&!editMode&&<div style={{background:"#1a1a30",border:"1px solid #2a2a4a",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#a78bfa"}}>📍 次の目標: {nextT[0]} 時点</div>}
      {editMode?(
        <div>
          <div style={{fontSize:12,color:"#8080b0",marginBottom:12}}>各マイルストーン時点の目標値を編集</div>
          {Object.entries(editingTargets).sort().map(([mk,vals])=>(
            <Card key={mk}>
              <CardTitle>{mk} 目標</CardTitle>
              {KPI_FIELD_META.map(f=>(
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{fontSize:12,color:"#a0a0c0",width:160,flexShrink:0}}>{f.label}</div>
                  <input type="number" value={vals[f.id]||""} onChange={e=>setTV(mk,f.id,e.target.value)} style={{...S.input,flex:1}}/>
                  <div style={{fontSize:11,color:"#606080"}}>{f.unit}</div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      ):(
        KPI_FIELD_META.map(f=>{
          const cur=Number(kpiData[f.id])||0,tgt=target?target[f.id]:null;
          return(
            <Card key={f.id}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:13,color:"#c8c8e0"}}>{f.label}</div>
                {tgt!=null&&<div style={{fontSize:11,color:"#606080"}}>目標: {f.id==="revenue"?formatCurrency(tgt):tgt+f.unit}</div>}
              </div>
              {tgt!=null&&tgt>0&&<><ProgressBar value={cur} max={tgt} color={f.color}/><div style={{fontSize:11,color:"#606080",marginBottom:8}}>{f.id==="revenue"?formatCurrency(cur):cur+f.unit} / {tgt+f.unit} ({Math.min(100,Math.round(cur/tgt*100))}%)</div></>}
              <input type="number" value={kpiData[f.id]||""} onChange={e=>setKPI(f.id,e.target.value)} placeholder={"現在の"+f.label+"を入力"} style={S.input}/>
            </Card>
          );
        })
      )}
      {!editMode&&<Card><CardTitle>今月のメモ</CardTitle><textarea value={kpiData.memo||""} onChange={e=>setKPI("memo",e.target.value)} placeholder="数字の背景、気づき、来月の方針..." style={{...S.textarea,minHeight:80}}/></Card>}
    </div>
  );
}

function QuarterlyTab({data,update}){
  const quarterly=data.quarterly;
  const[editMode,setEditMode]=useState(false);
  const[newItems,setNewItems]=useState({});
  const[editingKey,setEditingKey]=useState(null);
  const[editingText,setEditingText]=useState("");

  const toggle=(q,i)=>{const k=`${q}_${i}`;update({...data,quarterlyDone:{...data.quarterlyDone,[k]:!data.quarterlyDone[k]}});};
  const addItem=q=>{const v=(newItems[q]||"").trim();if(!v)return;update({...data,quarterly:{...quarterly,[q]:[...quarterly[q],v]}});setNewItems(p=>({...p,[q]:""}));};
  const delItem=(q,i)=>{const nd={...data,quarterly:{...quarterly,[q]:quarterly[q].filter((_,j)=>j!==i)}};delete nd.quarterlyDone[`${q}_${i}`];update(nd);};
  const saveEdit=()=>{update({...data,quarterly:{...quarterly,[editingKey[0]]:quarterly[editingKey[0]].map((m,i)=>i===editingKey[1]?editingText:m)}});setEditingKey(null);};

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{color:"#8080b0",fontSize:12}}>Year 1（2026年）のマイルストーン</div>
        <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
      </div>
      {Object.keys(quarterly).map(q=>{
        const ms=quarterly[q],done=ms.filter((_,i)=>data.quarterlyDone[`${q}_${i}`]).length,isCurrent=q===CURRENT_QUARTER;
        return(
          <Card key={q} style={{borderColor:isCurrent?"#a78bfa":"#2a2a4a"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <CardTitle style={{margin:0}}>{q}</CardTitle>
              {isCurrent&&<span style={{fontSize:10,background:"#a78bfa22",color:"#a78bfa",padding:"2px 8px",borderRadius:12,border:"1px solid #a78bfa44"}}>現在</span>}
              <span style={{marginLeft:"auto",fontSize:12,color:"#606080"}}>{done}/{ms.length}</span>
            </div>
            <ProgressBar value={done} max={ms.length||1} color={isCurrent?"#a78bfa":"#4a4a6a"}/>
            <div style={{marginTop:10}}>
              {ms.map((m,i)=>editingKey&&editingKey[0]===q&&editingKey[1]===i
                ?<EditableRow key={i} value={editingText} onChange={setEditingText} onSave={saveEdit} onCancel={()=>setEditingKey(null)}/>
                :<CheckItem key={i} checked={!!data.quarterlyDone[`${q}_${i}`]} label={m} onToggle={()=>!editMode&&toggle(q,i)} accent={isCurrent?"#a78bfa":"#606080"}
                    onEdit={editMode?()=>{setEditingKey([q,i]);setEditingText(m);}:null}
                    onDelete={editMode?()=>delItem(q,i):null}/>
              )}
              {editMode&&(
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input value={newItems[q]||""} onChange={e=>setNewItems(p=>({...p,[q]:e.target.value}))} placeholder="項目を追加..." style={{...S.input,flex:1}} onKeyDown={e=>e.key==="Enter"&&addItem(q)}/>
                  <button onClick={()=>addItem(q)} style={{...btn("#4ade80"),padding:"8px 12px"}}>追加</button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
      <Card>
        <CardTitle>最重要ルール（常に確認）</CardTitle>
        {["🔴 note週1本を止めない（最優先）","❌ カウンセラー・コーチを名乗らない","❌ ポートフォリオ開発が主軸を超えない","❌ ココナラは使わない","✅ 構造化パートナーとして勝負する"].map((r,i)=>(
          <div key={i} style={{padding:"8px 0",borderBottom:"1px solid #1a1a30",fontSize:13,color:"#c8c8e0",lineHeight:1.5}}>{r}</div>
        ))}
      </Card>
    </div>
  );
}
