const chat = document.getElementById("chat");
let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
let logs = JSON.parse(localStorage.getItem("logs") || "[]");

function now(){ return new Date().toLocaleString("zh-TW"); }
function showPage(id){ document.getElementById(id).scrollIntoView({behavior:"smooth"}); }
function saveLocal(){ localStorage.setItem("reminders",JSON.stringify(reminders)); localStorage.setItem("logs",JSON.stringify(logs)); render(); }

function addBubble(text, type="ai"){
  const div=document.createElement("div");
  div.className="bubble "+type;
  div.textContent=text;
  chat.appendChild(div);
  chat.scrollTop=chat.scrollHeight;
  document.getElementById("lastTalk").textContent=now();
}

async function sendMessage(){
  const input=document.getElementById("msg");
  const message=input.value.trim();
  if(!message) return;
  addBubble(message,"me");
  input.value="";
  addBubble("AI 思考中...","ai");
  try{
    const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});
    const data=await res.json();
    chat.lastChild.textContent=data.reply || "沒有取得回覆";
    speak(data.reply || "");
  }catch(e){
    chat.lastChild.textContent="連線失敗：請確認 Azure Function 和 OPENAI_API_KEY 已設定。";
  }
}

function voiceInput(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ alert("請使用 Chrome 才支援語音輸入"); return; }
  const rec=new SR();
  rec.lang="zh-TW";
  rec.onresult=e=>{ document.getElementById("msg").value=e.results[0][0].transcript; sendMessage(); };
  rec.start();
}

function speak(text){
  if(!("speechSynthesis" in window) || !text) return;
  const u=new SpeechSynthesisUtterance(text);
  u.lang="zh-TW";
  speechSynthesis.speak(u);
}

async function saveHealth(){
  const payload={
    heart:+document.getElementById("heart").value,
    systolic:+document.getElementById("sys").value,
    diastolic:+document.getElementById("dia").value,
    steps:+document.getElementById("steps").value
  };
  const res=await fetch("/api/health",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await res.json();
  document.getElementById("healthResult").textContent=data.message;
  document.getElementById("mainStatus").textContent=data.status;
  document.getElementById("familyStatus").textContent=data.status;
  document.getElementById("mainNote").textContent=data.message;
  if(data.alert){ logs.unshift(now()+" 健康警示："+data.message); saveLocal(); }
}

function addReminder(){
  reminders.push({text:document.getElementById("remText").value,time:document.getElementById("remTime").value});
  saveLocal();
}

async function sendSOS(){
  const res=await fetch("/api/sos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"長者",time:now()})});
  const data=await res.json();
  logs.unshift(now()+" SOS："+data.message);
  document.getElementById("mainStatus").textContent="🔴 緊急";
  document.getElementById("familyStatus").textContent="🔴 緊急";
  saveLocal();
  alert(data.message);
}

function render(){
  document.getElementById("reminders").innerHTML=reminders.map((r,i)=>`<li>${r.time}｜${r.text} <button class="gray" onclick="reminders.splice(${i},1);saveLocal()">刪除</button></li>`).join("") || "<li>尚無提醒</li>";
  document.getElementById("logs").innerHTML=logs.map(x=>`<li>${x}</li>`).join("") || "<li>尚無通知</li>";
  document.getElementById("remCount").textContent=reminders.length;
  document.getElementById("sosCount").textContent=logs.filter(x=>x.includes("SOS")).length;
}
addBubble("您好，我是 AI 智慧高齡生活助理。您可以跟我聊天、更新健康資料，或按 SOS 求救。","ai");
render();
