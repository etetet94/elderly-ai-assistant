const chat = document.getElementById("chat");
let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
let logs = JSON.parse(localStorage.getItem("logs") || "[]");
let deferredPrompt = null;

function now(){ return new Date().toLocaleString("zh-TW"); }
function showPage(id){ document.getElementById(id).scrollIntoView({behavior:"smooth"}); }
function saveLocal(){
  localStorage.setItem("reminders",JSON.stringify(reminders));
  localStorage.setItem("logs",JSON.stringify(logs));
  render();
}

function addBubble(text, type="ai"){
  const div=document.createElement("div");
  div.className="bubble "+type;
  div.textContent=text;
  chat.appendChild(div);
  chat.scrollTop=chat.scrollHeight;
  document.getElementById("lastTalk").textContent=now();
}

function smartReply(message){
  const m = message.toLowerCase();
  if (m.includes("頭暈") || m.includes("暈") || m.includes("不舒服")) {
    return "我了解您現在有點不舒服。請先坐下或躺下休息，慢慢喝水，避免突然站起來。如果持續頭暈、胸悶或呼吸困難，請立刻按 SOS 或請家人協助就醫。";
  }
  if (m.includes("胸痛") || m.includes("喘") || m.includes("呼吸")) {
    return "這可能需要立即注意。請先停止活動、坐下休息，並建議馬上通知家屬；如果症狀明顯或加重，請立即撥打 119。";
  }
  if (m.includes("孤單") || m.includes("難過") || m.includes("心情不好")) {
    return "我會陪著您。您可以先做三次深呼吸，也可以播放喜歡的音樂，或讓家人端知道您今天需要多一點陪伴。";
  }
  if (m.includes("吃藥") || m.includes("藥") || m.includes("提醒")) {
    return "目前設定的用藥提醒會顯示在提醒區。建議按醫師指示服藥，不要自行增減藥量。如果已經吃過藥，可以在提醒區做紀錄。";
  }
  if (m.includes("血壓") || m.includes("心率") || m.includes("健康")) {
    return "請在健康資料區輸入心率、血壓與步數，再按『送出健康分析』，我會幫您判斷目前是正常、注意或高風險。";
  }
  if (m.includes("求救") || m.includes("sos") || m.includes("救命")) {
    sendSOS();
    return "我已經幫您啟動 SOS 緊急通報紀錄，家屬端會看到這筆通知。請保持冷靜，坐下等待協助。";
  }
  return "我收到您的訊息了。您可以跟我說身體狀況、心情、用藥提醒，或更新健康資料。我會用簡單方式協助您。";
}

function sendMessage(){
  const input=document.getElementById("msg");
  const message=input.value.trim();
  if(!message) return;
  addBubble(message,"me");
  input.value="";
  const reply = smartReply(message);
  setTimeout(()=>{ addBubble(reply,"ai"); speak(reply); }, 300);
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
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function saveHealth(){
  const heart=+document.getElementById("heart").value;
  const sys=+document.getElementById("sys").value;
  const dia=+document.getElementById("dia").value;
  const steps=+document.getElementById("steps").value;
  let status="🟢 正常";
  let message=`心率 ${heart}，血壓 ${sys}/${dia}，步數 ${steps}。目前狀態穩定。`;

  if(heart>110 || heart<50 || sys>150 || dia>95){
    status="🔴 高風險";
    message=`心率 ${heart}，血壓 ${sys}/${dia}。數值偏高風險，建議立即通知家屬並視情況就醫。`;
    logs.unshift(now()+" 健康警示："+message);
  } else if(heart>95 || sys>135 || dia>88 || steps<1000){
    status="🟡 注意";
    message=`心率 ${heart}，血壓 ${sys}/${dia}，步數 ${steps}。建議多休息、補充水分並持續觀察。`;
    logs.unshift(now()+" 健康注意："+message);
  }

  document.getElementById("healthResult").textContent=message;
  document.getElementById("mainStatus").textContent=status;
  document.getElementById("familyStatus").textContent=status;
  document.getElementById("mainNote").textContent=message;
  saveLocal();
}

function addReminder(){
  const text=document.getElementById("remText").value.trim();
  const time=document.getElementById("remTime").value;
  if(!text) return;
  reminders.push({text,time,created:now()});
  logs.unshift(now()+" 新增用藥提醒："+time+"｜"+text);
  saveLocal();
}

function sendSOS(){
  const msg = now()+" SOS 緊急通報：長者已按下求救按鈕，請家屬立即確認狀況。";
  logs.unshift(msg);
  document.getElementById("mainStatus").textContent="🔴 緊急";
  document.getElementById("familyStatus").textContent="🔴 緊急";
  document.getElementById("mainNote").textContent="已觸發 SOS 緊急通報";
  addBubble("SOS 緊急通報已啟動，家屬端已新增通知紀錄。請保持冷靜並坐下等待協助。","ai alert");
  speak("緊急通報已啟動，請保持冷靜並等待協助。");
  saveLocal();
  alert("SOS 已啟動，家屬端已新增通知紀錄。");
}

function render(){
  document.getElementById("reminders").innerHTML = reminders.map((r,i)=>`<li>${r.time}｜${r.text} <button class="gray" onclick="reminders.splice(${i},1);saveLocal()">刪除</button></li>`).join("") || "<li>尚無提醒</li>";
  document.getElementById("logs").innerHTML = logs.map(x=>`<li>${x}</li>`).join("") || "<li>尚無通知</li>";
  document.getElementById("remCount").textContent = reminders.length;
  document.getElementById("sosCount").textContent = logs.filter(x=>x.includes("SOS")).length;
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn=document.getElementById("installBtn");
  btn.style.display="inline-block";
  btn.onclick=async()=>{ deferredPrompt.prompt(); deferredPrompt=null; btn.style.display="none"; };
});

addBubble("您好，我是 AI 智慧高齡生活助理。您可以跟我聊天、更新健康資料，或按 SOS 求救。","ai");
render();
