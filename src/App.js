import { useState, useEffect } from "react";

// ========== デフォルトデータ ==========
const DEFAULT_DAILY_TASKS = [
  { id: "x_post", label: "X投稿した" },
  { id: "note_read", label: "自分の記事・コメントを確認" },
  { id: "focus", label: "今日の最優先タスクを決めた" },
];

const DEFAULT_WEEKLY_TASKS = [
  { id: "note", label: "note記事を書く（週1本）", critical: true },
  { id: "x_daily", label: "X毎日投稿（週5回以上）", critical: true },
  { id: "profile", label: "プロフィール確認・更新", critical: false },
  { id: "stripe", label: "Stripe設定進捗", critical: false },
  { id: "review", label: "先週の振り返り記録", critical: false },
];

const DEFAULT_QUARTERLY = {
  "Q1 2026": ["noteプロフィール更新（自己理解×キャリア設計に統一）","Stripeアカウント作成","note記事12本","オレンジセールス退職を伝える","Xフォロワー200人"],
  "Q2 2026": ["note有料記事開始（月2本）","βテスター5人","ツール1本目開発（自己理解マップ）","Xフォロワー350人","noteフォロワー150人"],
  "Q3 2026": ["オレンジセールス終了（7月末）","個別セッション正式販売（月2件）","ツール2本目（キャリア棚卸し）"],
  "Q4 2026": ["有料マガジン開始（初期30人）","B2B営業開始","ツール3本目（オプション）"],
};

const DEFAULT_KPI_TARGETS = {
  "2026-06": { noteFollowers: 150, xFollowers: 350, revenue: 50000, sessions: 0, magazineMembers: 0, noteArticles: 24 },
  "2026-09": { noteFollowers: 300, xFollowers: 500, revenue: 75000, sessions: 2, magazineMembers: 0, noteArticles: 36 },
  "2026-12": { noteFollowers: 500, xFollowers: 800, revenue: 100000, sessions: 2, magazineMembers: 30, noteArticles: 52 },
};

const KPI_FIELD_META = [
  { id: "noteFollowers", label: "noteフォロワー", unit: "人", color: "#4ade80" },
  { id: "xFollowers", label: "Xフォロワー", unit: "人", color: "#60a5fa" },
  { id: "noteArticles", label: "note記事数（累計）", unit: "本", color: "#a78bfa" },
  { id: "revenue", label: "今月の収益", unit: "円", color: "#fbbf24" },
  { id: "sessions", label: "個別セッション（今月）", unit: "件", color: "#f87171" },
  { id: "magazineMembers", label: "マガジン会員数", unit: "人", color: "#34d399" },
];

const STORAGE_KEY = "ng3_dashboard_v1";
const CURRENT_QUARTER = "Q1 2026";

// ========== localStorage ==========
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
}

// ========== ユーティリティ ==========
function getTodayKey() { return new Date().toISOString().split("T")[0]; }
function getWeekKey() {
  const d = new Date(), day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(new Date().setDate(diff)).toISOString().split("T")[0];
}
function getMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function formatCurrency(v) { return v ? "¥" + Number(v).toLocaleString() : "¥0"; }
function uid() { return Math.random().toString(36).slice(2, 8); }

// ========== スタイル ==========
const S = {
  input: { width:"100%", background:"#1a1a30", border:"1px solid #2a2a4a", borderRadius:8, color:"#e8e8f0", padding:"9px 12px", fontSize:13, fontFamily:"inherit", boxSizing:"border-box", outline:"none" },
  textarea: { width:"100%", background:"#1a1a30", border:"1px solid #2a2a4a", borderRadius:8, color:"#e8e8f0", padding:12, fontSize:13, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", outline:"none" },
};
const btn = (c="#a78bfa") => ({ background:"none", border:`1px solid ${c}55`, borderRadius:6, color:c, cursor:"pointer", fontSize:11, padding:"3px 8px", fontFamily:"inherit" });

// ========== 共通コンポーネント ==========
function ProgressBar({ value, max, color="#4ade80" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value/max)*100)) : 0;
  return (
    <div style={{ background:"#1a1a2e", borderRadius:4, height:6, overflow:"hidden", margin:"4px 0" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:4, transition:"width 0.5s ease" }}/>
    </div>
  );
}
function Card({ children, style={} }) {
  return <div style={{ background:"#111128", border:"1px solid #2a2a4a", borderRadius:12, padding:16, marginBottom:12, ...style }}>{children}</div>;
}
function CardTitle({ children, style={} }) {
  return <div style={{ fontSize:13, fontWeight:600, color:"#a0a0c0", marginBottom:10, letterSpacing:0.5, ...style }}>{children}</div>;
}
function CheckItem({ checked, label, onToggle, accent="#4ade80", onDelete, onEdit }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:"1px solid #1a1a30" }}>
      <div onClick={onToggle} style={{ width:20, height:20, borderRadius:5, border:`2px solid ${checked?accent:"#3a3a5a"}`, background:checked?accent+"22":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.15s" }}>
        {checked && <span style={{ color:accent, fontSize:12, fontWeight:700 }}>✓</span>}
      </div>
      <span onClick={onToggle} style={{ flex:1, fontSize:13, color:checked?"#606080":"#c8c8e0", textDecoration:checked?"line-through":"none", lineHeight:1.4, cursor:"pointer" }}>{label}</span>
      {onEdit && <button onClick={onEdit} style={btn("#8080b0")}>編集</button>}
      {onDelete && <button onClick={onDelete} style={btn("#f87171")}>✕</button>}
    </div>
  );
}
function EditableRow({ value, onChange, onSave, onCancel }) {
  return (
    <div style={{ display:"flex", gap:6, padding:"6px 0", borderBottom:"1px solid #1a1a30" }}>
      <input value={value} onChange={e=>onChange(e.target.value)} style={{ ...S.input, flex:1 }} onKeyDown={e=>e.key==="Enter"&&onSave()} autoFocus/>
      <button onClick={onSave} style={btn("#4ade80")}>保存</button>
      <button onClick={onCancel} style={btn("#8080b0")}>取消</button>
    </div>
  );
}

// ========== メイン ==========
export default function Dashboard() {
  const [tab, setTab] = useState("daily");
  const [data, setData] = useState(null);

  useEffect(() => {
    const d = loadData();
    setData(d ? {
      daily: d.daily||{}, weekly: d.weekly||{}, kpi: d.kpi||{}, quarterlyDone: d.quarterlyDone||{},
      dailyTasks: d.dailyTasks||DEFAULT_DAILY_TASKS,
      weeklyTasks: d.weeklyTasks||DEFAULT_WEEKLY_TASKS,
      quarterly: d.quarterly||DEFAULT_QUARTERLY,
      kpiTargets: d.kpiTargets||DEFAULT_KPI_TARGETS,
    } : {
      daily:{}, weekly:{}, kpi:{}, quarterlyDone:{},
      dailyTasks:DEFAULT_DAILY_TASKS, weeklyTasks:DEFAULT_WEEKLY_TASKS,
      quarterly:DEFAULT_QUARTERLY, kpiTargets:DEFAULT_KPI_TARGETS,
    });
  }, []);

  function update(nd) { setData(nd); saveData(nd); }

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0d0d1a", color:"#888", fontFamily:"sans-serif" }}>読み込み中...</div>
  );

  const tabs = [
    { id:"daily", label:"日次", icon:"☀️" },
    { id:"weekly", label:"週次", icon:"📅" },
    { id:"kpi", label:"KPI", icon:"📊" },
    { id:"quarterly", label:"四半期", icon:"🎯" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a18", color:"#e8e8f0", fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#0f0f2d 0%,#1a0a2e 100%)", borderBottom:"1px solid #2a2a4a", padding:"16px 20px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", maxWidth:640, margin:"0 auto" }}>
          <div>
            <div style={{ fontSize:11, color:"#8080b0", letterSpacing:2, marginBottom:2 }}>ng3 自分業</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#c8b8ff" }}>自己理解 × キャリア設計</div>
          </div>
          <div style={{ fontSize:10, color:"#8080b0" }}>2026 / 基盤構築期</div>
        </div>
      </div>

      <div style={{ display:"flex", background:"#0f0f22", borderBottom:"1px solid #1e1e3a", maxWidth:640, margin:"0 auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"12px 4px", background:"none", border:"none", borderBottom:tab===t.id?"2px solid #a78bfa":"2px solid transparent", color:tab===t.id?"#a78bfa":"#606080", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
            <div style={{ fontSize:16 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:16 }}>
        {tab==="daily" && <DailyTab data={data} update={update}/>}
        {tab==="weekly" && <WeeklyTab data={data} update={update}/>}
        {tab==="kpi" && <KPITab data={data} update={update}/>}
        {tab==="quarterly" && <QuarterlyTab data={data} update={update}/>}
      </div>
    </div>
  );
}

// ========== 日次タブ ==========
function DailyTab({ data, update }) {
  const today = getTodayKey();
  const todayData = data.daily[today]||{ tasks:{}, memo:"" };
  const tasks = data.dailyTasks;
  const [editMode, setEditMode] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  const toggle = id => update({ ...data, daily:{ ...data.daily, [today]:{ ...todayData, tasks:{ ...todayData.tasks, [id]:!todayData.tasks[id] } } } });
  const addTask = () => { if(!newLabel.trim())return; update({ ...data, dailyTasks:[...tasks,{ id:uid(), label:newLabel.trim() }] }); setNewLabel(""); };
  const delTask = id => update({ ...data, dailyTasks:tasks.filter(t=>t.id!==id) });
  const saveEdit = () => { update({ ...data, dailyTasks:tasks.map(t=>t.id===editingId?{ ...t, label:editingLabel }:t) }); setEditingId(null); };

  const done = tasks.filter(t=>todayData.tasks[t.id]).length;
  const d = new Date();
  const days = [];
  for(let i=6;i>=0;i--){ const dd=new Date(); dd.setDate(dd.getDate()-i); const k=dd.toISOString().split("T")[0]; const cnt=(data.daily[k]?.tasks)?tasks.filter(t=>data.daily[k].tasks[t.id]).length:0; days.push({ key:k, cnt, label:"日月火水木金土"[dd.getDay()] }); }

  return (
    <div>
      <div style={{ color:"#8080b0", fontSize:12, marginBottom:12 }}>{d.getFullYear()}年{d.getMonth()+1}月{d.getDate()}日（{"日月火水木金土"[d.getDay()]}）</div>
      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <CardTitle style={{ margin:0 }}>今日のチェック</CardTitle>
          <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
        </div>
        <ProgressBar value={done} max={tasks.length||1} color="#a78bfa"/>
        <div style={{ fontSize:11, color:"#8080b0", margin:"2px 0 10px" }}>{done}/{tasks.length} 完了</div>
        {tasks.map(task => editingId===task.id
          ? <EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          : <CheckItem key={task.id} checked={!!todayData.tasks[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)} accent="#a78bfa"
              onEdit={editMode?()=>{ setEditingId(task.id); setEditingLabel(task.label); }:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {editMode && (
          <div style={{ display:"flex", gap:6, marginTop:10 }}>
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="新しい項目..." style={{ ...S.input, flex:1 }} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
            <button onClick={addTask} style={{ ...btn("#4ade80"), padding:"8px 12px" }}>追加</button>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>今日のメモ・気づき</CardTitle>
        <textarea value={todayData.memo} onChange={e=>update({ ...data, daily:{ ...data.daily, [today]:{ ...todayData, memo:e.target.value } } })} placeholder="Xに投稿したこと、記事のアイデア、気づきなど..." style={{ ...S.textarea, minHeight:100 }}/>
      </Card>
      <Card>
        <CardTitle>直近7日のチェック状況</CardTitle>
        <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
          {days.map(dd => (
            <div key={dd.key} style={{ textAlign:"center" }}>
              <div style={{ width:32, height:32, borderRadius:6, background:dd.cnt>=1?"#a78bfa":"#1a1a30", border:"1px solid #2a2a4a", marginBottom:4 }}/>
              <div style={{ fontSize:10, color:"#606080" }}>{dd.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ========== 週次タブ ==========
function WeeklyTab({ data, update }) {
  const week = getWeekKey();
  const weekData = data.weekly[week]||{ tasks:{}, noteTitle:"", reflection:"" };
  const tasks = data.weeklyTasks;
  const [editMode, setEditMode] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCritical, setNewCritical] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  const toggle = id => update({ ...data, weekly:{ ...data.weekly, [week]:{ ...weekData, tasks:{ ...weekData.tasks, [id]:!weekData.tasks[id] } } } });
  const setField = (f,v) => update({ ...data, weekly:{ ...data.weekly, [week]:{ ...weekData, [f]:v } } });
  const addTask = () => { if(!newLabel.trim())return; update({ ...data, weeklyTasks:[...tasks,{ id:uid(), label:newLabel.trim(), critical:newCritical }] }); setNewLabel(""); setNewCritical(false); };
  const delTask = id => update({ ...data, weeklyTasks:tasks.filter(t=>t.id!==id) });
  const saveEdit = () => { update({ ...data, weeklyTasks:tasks.map(t=>t.id===editingId?{ ...t, label:editingLabel }:t) }); setEditingId(null); };

  const critical = tasks.filter(t=>t.critical);
  const others = tasks.filter(t=>!t.critical);
  const wd = new Date(week), we = new Date(week); we.setDate(we.getDate()+6);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ color:"#8080b0", fontSize:12 }}>今週: {wd.getMonth()+1}/{wd.getDate()} 〜 {we.getMonth()+1}/{we.getDate()}</div>
        <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
      </div>
      <Card>
        <CardTitle>🔴 最優先タスク（絶対やる）</CardTitle>
        <ProgressBar value={critical.filter(t=>weekData.tasks[t.id]).length} max={critical.length||1} color="#f87171"/>
        <div style={{ fontSize:11, color:"#8080b0", margin:"2px 0 10px" }}>{critical.filter(t=>weekData.tasks[t.id]).length}/{critical.length}</div>
        {critical.map(task => editingId===task.id
          ? <EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          : <CheckItem key={task.id} checked={!!weekData.tasks[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)} accent="#f87171"
              onEdit={editMode?()=>{ setEditingId(task.id); setEditingLabel(task.label); }:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {weekData.tasks["note"] && (
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:12, color:"#8080b0", marginBottom:4 }}>今週の記事タイトル</div>
            <input value={weekData.noteTitle||""} onChange={e=>setField("noteTitle",e.target.value)} placeholder="例: グレーゾーンの子の自己理解と..." style={S.input}/>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>その他タスク</CardTitle>
        {others.map(task => editingId===task.id
          ? <EditableRow key={task.id} value={editingLabel} onChange={setEditingLabel} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>
          : <CheckItem key={task.id} checked={!!weekData.tasks[task.id]} label={task.label} onToggle={()=>!editMode&&toggle(task.id)}
              onEdit={editMode?()=>{ setEditingId(task.id); setEditingLabel(task.label); }:null}
              onDelete={editMode?()=>delTask(task.id):null}/>
        )}
        {editMode && (
          <div style={{ marginTop:10 }}>
            <div style={{ display:"flex", gap:6, marginBottom:6 }}>
              <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="タスク名..." style={{ ...S.input, flex:1 }} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
              <button onClick={addTask} style={{ ...btn("#4ade80"), padding:"8px 12px" }}>追加</button>
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#a0a0c0", cursor:"pointer" }}>
              <input type="checkbox" checked={newCritical} onChange={e=>setNewCritical(e.target.checked)}/>最優先として追加
            </label>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>今週の振り返り</CardTitle>
        <textarea value={weekData.reflection||""} onChange={e=>setField("reflection",e.target.value)} placeholder="うまくいったこと、できなかったこと、来週に活かすこと..." style={{ ...S.textarea, minHeight:80 }}/>
      </Card>
      <div style={{ color:"#8080b0", fontSize:11, textAlign:"center", marginTop:8 }}>週全体: {tasks.filter(t=>weekData.tasks[t.id]).length}/{tasks.length} 完了</div>
    </div>
  );
}

// ========== KPIタブ ==========
function KPITab({ data, update }) {
  const month = getMonthKey();
  const kpiData = data.kpi[month]||{};
  const kpiTargets = data.kpiTargets;
  const [editMode, setEditMode] = useState(false);
  const [editingTargets, setEditingTargets] = useState(null);

  const setKPI = (f,v) => update({ ...data, kpi:{ ...data.kpi, [month]:{ ...kpiData, [f]:v } } });
  const startEdit = () => { setEditingTargets(JSON.parse(JSON.stringify(kpiTargets))); setEditMode(true); };
  const saveTargets = () => { update({ ...data, kpiTargets:editingTargets }); setEditMode(false); setEditingTargets(null); };
  const setTV = (m,f,v) => setEditingTargets(p=>({ ...p, [m]:{ ...p[m], [f]:Number(v) } }));

  const sortedT = Object.entries(kpiTargets).sort();
  const nextT = sortedT.find(([k])=>k>=month);
  const target = nextT?kpiTargets[nextT[0]]:null;
  const d = new Date();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ color:"#8080b0", fontSize:12 }}>{d.getFullYear()}年{d.getMonth()+1}月の実績を入力</div>
        <button onClick={editMode?saveTargets:startEdit} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"目標値を保存":"目標値を編集"}</button>
      </div>
      {target&&!editMode&&<div style={{ background:"#1a1a30", border:"1px solid #2a2a4a", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#a78bfa" }}>📍 次の目標: {nextT[0]} 時点</div>}
      {editMode ? (
        <div>
          <div style={{ fontSize:12, color:"#8080b0", marginBottom:12 }}>各マイルストーン時点の目標値を編集</div>
          {Object.entries(editingTargets).sort().map(([mk,vals])=>(
            <Card key={mk}>
              <CardTitle>{mk} 目標</CardTitle>
              {KPI_FIELD_META.map(f=>(
                <div key={f.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ fontSize:12, color:"#a0a0c0", width:160, flexShrink:0 }}>{f.label}</div>
                  <input type="number" value={vals[f.id]||""} onChange={e=>setTV(mk,f.id,e.target.value)} style={{ ...S.input, flex:1 }}/>
                  <div style={{ fontSize:11, color:"#606080" }}>{f.unit}</div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      ) : (
        KPI_FIELD_META.map(f=>{
          const cur=Number(kpiData[f.id])||0, tgt=target?target[f.id]:null;
          return (
            <Card key={f.id}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:13, color:"#c8c8e0" }}>{f.label}</div>
                {tgt!=null&&<div style={{ fontSize:11, color:"#606080" }}>目標: {f.id==="revenue"?formatCurrency(tgt):tgt+f.unit}</div>}
              </div>
              {tgt!=null&&tgt>0&&<><ProgressBar value={cur} max={tgt} color={f.color}/><div style={{ fontSize:11, color:"#606080", marginBottom:8 }}>{f.id==="revenue"?formatCurrency(cur):cur+f.unit} / {tgt+f.unit} ({Math.min(100,Math.round(cur/tgt*100))}%)</div></>}
              <input type="number" value={kpiData[f.id]||""} onChange={e=>setKPI(f.id,e.target.value)} placeholder={`現在の${f.label}を入力`} style={S.input}/>
            </Card>
          );
        })
      )}
      {!editMode&&<Card><CardTitle>今月のメモ</CardTitle><textarea value={kpiData.memo||""} onChange={e=>setKPI("memo",e.target.value)} placeholder="数字の背景、気づき、来月の方針..." style={{ ...S.textarea, minHeight:80 }}/></Card>}
    </div>
  );
}

// ========== 四半期タブ ==========
function QuarterlyTab({ data, update }) {
  const quarterly = data.quarterly;
  const [editMode, setEditMode] = useState(false);
  const [newItems, setNewItems] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editingText, setEditingText] = useState("");

  const toggle = (q,i) => { const k=`${q}_${i}`; update({ ...data, quarterlyDone:{ ...data.quarterlyDone, [k]:!data.quarterlyDone[k] } }); };
  const addItem = q => { const v=(newItems[q]||"").trim(); if(!v)return; update({ ...data, quarterly:{ ...quarterly, [q]:[...quarterly[q],v] } }); setNewItems(p=>({ ...p, [q]:"" })); };
  const delItem = (q,i) => { const nd={ ...data, quarterly:{ ...quarterly, [q]:quarterly[q].filter((_,j)=>j!==i) } }; delete nd.quarterlyDone[`${q}_${i}`]; update(nd); };
  const saveEdit = () => { update({ ...data, quarterly:{ ...quarterly, [editingKey[0]]:quarterly[editingKey[0]].map((m,i)=>i===editingKey[1]?editingText:m) } }); setEditingKey(null); };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ color:"#8080b0", fontSize:12 }}>Year 1（2026年）のマイルストーン</div>
        <button onClick={()=>setEditMode(!editMode)} style={btn(editMode?"#fbbf24":"#a78bfa")}>{editMode?"完了":"編集"}</button>
      </div>
      {Object.keys(quarterly).map(q=>{
        const ms=quarterly[q], done=ms.filter((_,i)=>data.quarterlyDone[`${q}_${i}`]).length, isCurrent=q===CURRENT_QUARTER;
        return (
          <Card key={q} style={{ borderColor:isCurrent?"#a78bfa":"#2a2a4a" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <CardTitle style={{ margin:0 }}>{q}</CardTitle>
              {isCurrent&&<span style={{ fontSize:10, background:"#a78bfa22", color:"#a78bfa", padding:"2px 8px", borderRadius:12, border:"1px solid #a78bfa44" }}>現在</span>}
              <span style={{ marginLeft:"auto", fontSize:12, color:"#606080" }}>{done}/{ms.length}</span>
            </div>
            <ProgressBar value={done} max={ms.length||1} color={isCurrent?"#a78bfa":"#4a4a6a"}/>
            <div style={{ marginTop:10 }}>
              {ms.map((m,i)=> editingKey&&editingKey[0]===q&&editingKey[1]===i
                ? <EditableRow key={i} value={editingText} onChange={setEditingText} onSave={saveEdit} onCancel={()=>setEditingKey(null)}/>
                : <CheckItem key={i} checked={!!data.quarterlyDone[`${q}_${i}`]} label={m} onToggle={()=>!editMode&&toggle(q,i)} accent={isCurrent?"#a78bfa":"#606080"}
                    onEdit={editMode?()=>{ setEditingKey([q,i]); setEditingText(m); }:null}
                    onDelete={editMode?()=>delItem(q,i):null}/>
              )}
              {editMode&&(
                <div style={{ display:"flex", gap:6, marginTop:8 }}>
                  <input value={newItems[q]||""} onChange={e=>setNewItems(p=>({ ...p, [q]:e.target.value }))} placeholder="項目を追加..." style={{ ...S.input, flex:1 }} onKeyDown={e=>e.key==="Enter"&&addItem(q)}/>
                  <button onClick={()=>addItem(q)} style={{ ...btn("#4ade80"), padding:"8px 12px" }}>追加</button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
      <Card>
        <CardTitle>最重要ルール（常に確認）</CardTitle>
        {["🔴 note週1本を止めない（最優先）","❌ カウンセラー・コーチを名乗らない","❌ ポートフォリオ開発が主軸を超えない","❌ ココナラは使わない","✅ 構造化パートナーとして勝負する"].map((r,i)=>(
          <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid #1a1a30", fontSize:13, color:"#c8c8e0", lineHeight:1.5 }}>{r}</div>
        ))}
      </Card>
    </div>
  );
}
