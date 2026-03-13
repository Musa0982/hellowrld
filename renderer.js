// ── STATE ──
let selectedTemplate = TEMPLATES[0];
let currentCat = "All";
let previewGenerated = false;
const canvas = document.getElementById("flyer-canvas");
const ctx = canvas.getContext("2d");

// ── FORM HELPERS ──
const g = id => document.getElementById(id).value.trim();
const getForm = () => ({
  title: g("f-title"), institute: g("f-inst"),
  date: g("f-date"), time: g("f-time"),
  venue: g("f-venue"), guest: g("f-guest"),
  role: g("f-role"), desc: g("f-desc"),
});

// ── CANVAS RENDERER ──
function renderToCanvas(tmplId, form) {
  const W = 900, H = 1200;
  canvas.width = W; canvas.height = H;
  const t = TEMPLATES.find(x => x.id === tmplId);
  const inst = (form.institute || "Your Institute").toUpperCase();
  const title = form.title || "Event Title";
  const guest = form.guest || "";
  const role = form.role || "";
  const dateStr = [form.date, form.time].filter(Boolean).join("  ·  ");
  const venue = form.venue || "";
  const desc = form.desc || "";

  const gradBg = (c1, c2, diag = false) => {
    const g = diag ? ctx.createLinearGradient(0,0,W,H) : ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  };
  const hex2rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const radGlow = (x, y, r, col, a = 0.2) => {
    const [rv,gv,bv] = hex2rgb(col);
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0, `rgba(${rv},${gv},${bv},${a})`); g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  };
  const aLine = (y, h = 4) => {
    const g = ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,"transparent"); g.addColorStop(0.5,t.accent); g.addColorStop(1,"transparent");
    ctx.fillStyle = g; ctx.fillRect(0,y,W,h);
  };
  const hLine = (y, x1=80, x2=W-80, col=t.accent+"50", w=1) => {
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();
  };
  const cT = (txt, y, sz, font, col, style="") => {
    ctx.fillStyle=col; ctx.font=`${style} ${sz}px ${font}`; ctx.textAlign="center";
    ctx.fillText(String(txt).slice(0,80), W/2, y);
  };
  const lT = (txt, x, y, sz, font, col, style="") => {
    ctx.fillStyle=col; ctx.font=`${style} ${sz}px ${font}`; ctx.textAlign="left";
    ctx.fillText(String(txt).slice(0,80), x, y);
  };
  const rT = (txt, x, y, sz, font, col) => {
    ctx.fillStyle=col; ctx.font=`bold ${sz}px ${font}`; ctx.textAlign="right";
    ctx.fillText(String(txt).slice(0,80), x, y);
  };
  const wrap = (text, maxW, sz, font) => {
    ctx.font = `bold ${sz}px ${font}`;
    const words = String(text).split(" "); let lines = [], line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines.slice(0,4);
  };

  const id = tmplId;

  if (id===1) {
    gradBg(t.bg1,t.bg2,true); radGlow(W/2,H*0.4,600,t.accent,0.08);
    aLine(0,4); aLine(H-4,4);
    ctx.strokeStyle=t.accent+"60"; ctx.lineWidth=1.5;
    [[50,50,1,0],[W-50,50,0,1],[50,H-50,1,1],[W-50,H-50,0,0]].forEach(([x,y,rx,ry])=>{
      const s=55; ctx.beginPath();
      if(rx&&!ry){ctx.moveTo(x,y+s);ctx.lineTo(x,y);ctx.lineTo(x+s,y);}
      else if(!rx&&!ry){ctx.moveTo(x-s,y);ctx.lineTo(x,y);ctx.lineTo(x,y+s);}
      else if(rx&&ry){ctx.moveTo(x,y-s);ctx.lineTo(x,y);ctx.lineTo(x+s,y);}
      else{ctx.moveTo(x-s,y);ctx.lineTo(x,y);ctx.lineTo(x,y-s);}
      ctx.stroke();
    });
    cT(inst,105,17,"Arial",t.accent,"bold"); hLine(128,180,W-180); cT("presents",176,22,"Georgia",t.sub,"italic");
    const tl=wrap(title,W-160,88,"Georgia"); tl.forEach((l,i)=>{ctx.fillStyle=t.accent+"20";ctx.font=`900 88px Georgia`;ctx.textAlign="center";ctx.fillText(l,W/2+2,298+i*96+2);ctx.fillStyle=t.text;ctx.fillText(l,W/2,298+i*96);});
    const aT=298+tl.length*96+40; hLine(aT,120,W-120);
    if(guest){cT(guest,aT+65,44,"Georgia",t.accent,"bold");if(role)cT(role,aT+108,24,"Georgia",t.sub,"italic");}
    if(desc){const dl=wrap(desc,W-300,23,"Georgia");dl.slice(0,2).forEach((l,i)=>cT(l,aT+(guest?145:50)+i*32,23,"Georgia",t.sub));}
    hLine(H-140,100,W-100); if(dateStr)cT(dateStr,H-100,25,"Arial",t.text); if(venue)cT(venue,H-65,23,"Arial",t.sub);
  }
  else if (id===2) {
    gradBg(t.bg1,t.bg2,true); radGlow(0,0,500,t.accent,0.15); radGlow(W,H,500,t.accent,0.1);
    ctx.fillStyle=t.accent+"18"; ctx.beginPath();ctx.moveTo(0,H*0.38);ctx.lineTo(W,H*0.2);ctx.lineTo(W,H*0.58);ctx.lineTo(0,H*0.76);ctx.fill();
    aLine(0,5); aLine(H-5,5); cT(inst,88,17,"Arial",t.accent,"bold");
    const tl=wrap(title,W-120,92,"Georgia"); const tY=H/2-(tl.length*100)/2;
    tl.forEach((l,i)=>{ctx.fillStyle=t.accent+"25";ctx.font=`900 92px Georgia`;ctx.textAlign="center";ctx.fillText(l,W/2+3,tY+i*100+3);ctx.fillStyle=t.text;ctx.fillText(l,W/2,tY+i*100);});
    if(guest){const gY=tY+tl.length*100+55;hLine(gY-20,120,W-120,t.accent+"60",1.5);cT(guest,gY+35,42,"Georgia",t.accent,"bold");if(role)cT(role,gY+75,24,"Georgia",t.sub,"italic");}
    if(dateStr)cT(dateStr,H-96,25,"Arial",t.text); if(venue)cT(venue,H-60,22,"Arial",t.sub);
  }
  else if (id===3) {
    gradBg(t.bg1,t.bg2); for(let i=0;i<H;i+=40){ctx.strokeStyle=t.accent+"06";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
    radGlow(W/2,300,500,t.accent,0.12);
    ctx.strokeStyle=t.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(60,78);ctx.lineTo(W-60,78);ctx.stroke();
    lT(inst,70,136,18,"Arial",t.accent,"bold");
    const tl=wrap(title,W-140,82,"'Courier New'"); tl.forEach((l,i)=>lT(l,70,258+i*90,82,"'Courier New'",t.text,"bold"));
    const aT=258+tl.length*90+40; hLine(aT,70,W-70,t.accent+"50");
    if(guest){ctx.fillStyle=t.accent;ctx.font=`bold 44px Arial`;ctx.textAlign="left";ctx.fillText(guest,70,aT+58);if(role){ctx.fillStyle=t.sub;ctx.font=`300 24px Arial`;ctx.fillText(role,70,aT+92);}}
    if(dateStr)lT("◈  "+dateStr,70,H-80,22,"Arial",t.text); if(venue)lT("◉  "+venue,70,H-46,22,"Arial",t.sub);
  }
  else if (id===4) {
    gradBg(t.bg1,t.bg2,true); ctx.fillStyle=t.accent+"22";ctx.fillRect(0,0,170,H); ctx.fillStyle=t.accent;ctx.fillRect(0,0,7,H);
    ctx.save();ctx.translate(85,H/2);ctx.rotate(-Math.PI/2);ctx.fillStyle=t.accent+"80";ctx.font="bold 18px Arial";ctx.textAlign="center";ctx.fillText(inst,0,0);ctx.restore();
    const tl=wrap(title,W-250,80,"Georgia"); tl.forEach((l,i)=>lT(l,210,200+i*88,80,"Georgia",t.text,"bold"));
    const aT=200+tl.length*88+50;
    if(guest){lT(guest,210,aT,46,"Georgia",t.accent,"bold");if(role)lT(role,210,aT+44,23,"Georgia",t.sub,"italic");}
    if(dateStr)lT(dateStr,210,H-88,22,"Arial",t.text); if(venue)lT(venue,210,H-55,22,"Arial",t.sub);
  }
  else if (id===5) {
    gradBg(t.bg1,t.bg2,true); radGlow(W*0.3,H*0.3,400,t.accent,0.2); radGlow(W*0.7,H*0.7,350,t.accent,0.15);
    aLine(0,3); aLine(H-3,3);
    ctx.strokeStyle=t.accent+"25";ctx.lineWidth=0.8;for(let r=80;r<320;r+=60){ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);ctx.stroke();}
    cT(inst,98,16,"Arial",t.accent,"bold");
    const tl=wrap(title,W-160,90,"Georgia"); const tY=H/2-(tl.length*98)/2;
    tl.forEach((l,i)=>{ctx.fillStyle=t.accent+"20";ctx.font=`900 90px Georgia`;ctx.textAlign="center";ctx.fillText(l,W/2+2,tY+i*98+2);ctx.fillStyle=t.text;ctx.fillText(l,W/2,tY+i*98);});
    if(guest){const gY=tY+tl.length*98+60;cT("—  "+guest+"  —",gY,38,"Georgia",t.accent,"bold");if(role)cT(role,gY+46,23,"Georgia",t.sub,"italic");}
    if(dateStr)cT(dateStr,H-96,25,"Arial",t.text); if(venue)cT(venue,H-62,22,"Arial",t.sub);
  }
  else if (id===6) {
    gradBg(t.bg1,t.bg2,true); aLine(0,8); ctx.fillStyle=t.accent;ctx.fillRect(0,8,W,3);
    cT(inst.toUpperCase(),78,16,"Georgia",t.text,"bold"); hLine(98,60,W-60,t.accent+"80",1.5);
    const tl=wrap(title,W-120,98,"Georgia"); tl.forEach((l,i)=>cT(l,198+i*107,98,"Georgia",t.text,"bold italic"));
    const aT=198+tl.length*107+20; hLine(aT,60,W-60,t.accent+"60");
    if(guest){cT(guest,aT+74,43,"Georgia",t.accent,"bold");if(role)cT(role,aT+115,23,"Georgia",t.sub,"italic");}
    hLine(H-128,60,W-60,t.accent+"40"); if(dateStr)cT(dateStr,H-92,25,"Georgia",t.text); if(venue)cT(venue,H-57,22,"Georgia",t.sub); aLine(H-6,6);
  }
  else if (id===7) {
    gradBg(t.bg1,t.bg2,true); radGlow(W/2,200,400,t.accent,0.08);
    ctx.strokeStyle=t.accent+"50";ctx.lineWidth=1;ctx.beginPath();ctx.arc(W/2,165,70,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(W/2,165,60,0,Math.PI*2);ctx.stroke();
    cT("✿",165,46,"Georgia",t.accent); cT(inst,260,18,"Arial",t.sub,"bold"); hLine(284,190,W-190,t.accent+"40",0.8);
    const tl=wrap(title,W-160,85,"Georgia"); tl.forEach((l,i)=>cT(l,372+i*93,85,"Georgia",t.text,"bold italic"));
    const aT=372+tl.length*93+30;
    if(guest){cT("✦  "+guest+"  ✦",aT+42,37,"Georgia",t.accent);if(role)cT(role,aT+82,22,"Georgia",t.sub,"italic");}
    hLine(H-138,150,W-150,t.accent+"40",0.8); if(dateStr)cT(dateStr,H-98,25,"Georgia",t.text); if(venue)cT(venue,H-62,22,"Georgia",t.sub);
  }
  else if (id===8) {
    gradBg(t.bg1,t.bg2,true); ctx.fillStyle=t.accent+"18";ctx.fillRect(0,0,W,200); ctx.fillStyle=t.accent;ctx.fillRect(0,0,W,6);
    ctx.fillStyle="#FFFFFF";ctx.font="bold 16px Arial";ctx.textAlign="left";ctx.fillText(inst,60,44);ctx.textAlign="right";ctx.fillText(dateStr||"",W-60,44);
    hLine(58,0,W,t.accent+"30");
    const tl=wrap(title,W-120,92,"Georgia"); tl.forEach((l,i)=>lT(l,60,200+i*101,92,"Georgia",t.text,"bold"));
    const aT=200+tl.length*101+40;
    if(guest){ctx.fillStyle=t.accent;ctx.fillRect(60,aT,5,62);lT(guest,80,aT+44,42,"Georgia",t.accent,"bold");if(role)lT(role,80,aT+74,22,"Georgia",t.sub);}
    ctx.fillStyle=t.accent;ctx.fillRect(0,H-98,W,4);
    if(venue)lT("📍 "+venue,60,H-58,25,"Arial",t.text); if(form.time)rT(form.time,W-60,H-58,28,"Arial",t.text);
  }
  else if (id===9) {
    gradBg(t.bg1,t.bg2,true); for(let i=0;i<H;i+=8){ctx.strokeStyle=t.accent+"04";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
    ctx.fillStyle=t.accent;ctx.fillRect(58,58,8,H-116); cT(inst,108,16,"Arial",t.sub,"bold"); hLine(128,100,W-100,t.accent+"50");
    const tl=wrap(title,W-200,88,"Georgia"); tl.forEach((l,i)=>cT(l,260+i*96,88,"Georgia",t.text,"bold italic"));
    const aT=260+tl.length*96+50;
    if(guest){ctx.fillStyle=t.accent+"30";ctx.fillRect(200,aT,W-400,52);cT(guest,aT+38,37,"Georgia",t.accent,"bold");if(role)cT(role,aT+78,22,"Georgia",t.sub,"italic");}
    hLine(H-128,100,W-100,t.accent+"40"); if(dateStr)cT(dateStr,H-88,25,"Arial",t.text); if(venue)cT(venue,H-53,22,"Arial",t.sub);
  }
  else if (id===10) {
    gradBg(t.bg1,t.bg2,true); ctx.fillStyle=t.accent+"20";ctx.fillRect(0,H-260,W,260); aLine(H-260,3);
    cT(inst,78,17,"Arial",t.accent,"bold"); hLine(98,100,W-100,t.accent+"40");
    const tl=wrap(title,W-140,90,"Georgia"); const tY=H/2-100-(tl.length*98)/2;
    tl.forEach((l,i)=>cT(l,tY+i*98,90,"Georgia",t.text,"bold"));
    if(guest){cT("—  "+guest+"  —",H-205,40,"Georgia",t.accent,"bold");if(role)cT(role,H-158,23,"Georgia",t.sub,"italic");}
    if(dateStr)cT(dateStr,H-108,25,"Arial",t.text); if(venue)cT(venue,H-72,22,"Arial",t.sub);
  }
  else if (id===11) {
    ctx.fillStyle=t.bg1;ctx.fillRect(0,0,W,H); radGlow(W/2,H*0.35,500,t.accent,0.25);
    for(let i=0;i<H;i+=4){ctx.fillStyle="rgba(0,0,0,0.28)";ctx.fillRect(0,i,W,2);}
    for(let i=0;i<W;i+=60){ctx.strokeStyle=t.accent+"06";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
    const tl=wrap(title,W-120,92,"'Arial Black'"); const tY=H/2-(tl.length*100)/2;
    ctx.strokeStyle=t.accent;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(60,tY-32);ctx.lineTo(W-60,tY-32);ctx.stroke();ctx.beginPath();ctx.moveTo(60,tY+tl.length*100+12);ctx.lineTo(W-60,tY+tl.length*100+12);ctx.stroke();
    tl.forEach((l,i)=>{ctx.font=`900 92px 'Arial Black'`;ctx.textAlign="center";ctx.fillStyle="#00FFFF40";ctx.fillText(l,W/2-3,tY+i*100-2);ctx.fillStyle=t.accent+"40";ctx.fillText(l,W/2+3,tY+i*100+2);ctx.fillStyle=t.text;ctx.fillText(l,W/2,tY+i*100);});
    lT(inst,60,58,15,"Arial",t.accent,"bold"); rT(dateStr||"",W-60,58,15,"Arial",t.accent);
    if(guest){const gY=tY+tl.length*100+65;ctx.fillStyle=t.accent;ctx.font=`bold 42px Arial`;ctx.textAlign="center";ctx.fillText(guest,W/2,gY);if(role){ctx.fillStyle=t.sub;ctx.font=`300 22px Arial`;ctx.fillText(role,W/2,gY+38);}}
    if(venue)cT(venue,H-58,22,"Arial",t.sub);
  }
  else if (id===12) {
    ctx.fillStyle=t.bg1;ctx.fillRect(0,0,W,H); for(let i=0;i<H;i+=20){ctx.fillStyle=t.accent+"05";ctx.fillRect(0,i,W,10);}
    radGlow(W/2,H/2,400,t.accent,0.1); ctx.strokeStyle=t.accent+"40";ctx.lineWidth=1;ctx.strokeRect(40,40,W-80,H-80);ctx.strokeRect(50,50,W-100,H-100);
    lT("> "+inst,70,98,18,"'Courier New'",t.accent); lT("> INITIATING...",70,128,15,"'Courier New'",t.accent+"80");
    const tl=wrap(title,W-160,84,"'Courier New'"); tl.forEach((l,i)=>lT(l,70,260+i*92,84,"'Courier New'",t.accent,"bold"));
    const aT=260+tl.length*92+40;
    if(guest){lT("> SPEAKER:",70,aT,18,"'Courier New'",t.accent+"80");lT(guest,70,aT+46,40,"'Courier New'",t.text,"bold");if(role)lT(role,70,aT+84,20,"'Courier New'",t.sub);}
    if(dateStr)lT("> DATE: "+dateStr,70,H-98,20,"'Courier New'",t.accent); if(venue)lT("> LOC:  "+venue,70,H-65,20,"'Courier New'",t.accent); rT("EOF",W-70,H-60,16,"'Courier New'",t.accent+"40");
  }
  else if (id>=13 && id<=15) {
    gradBg(t.bg1,t.bg2,true); radGlow(W/2,H*0.35,480,t.accent,0.22);
    aLine(0,4); aLine(H-4,4); cT(inst,78,16,"Arial",t.accent,"bold");
    if(id===14){ctx.strokeStyle=t.accent+"25";ctx.lineWidth=0.8;for(let r=80;r<480;r+=70){ctx.beginPath();ctx.arc(W/2,H*0.4,r,0,Math.PI*2);ctx.stroke();}}
    if(id===15){ctx.fillStyle=t.accent+"20";ctx.fillRect(0,H*0.42,W,H*0.16);ctx.strokeStyle=t.accent+"80";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,H*0.42);ctx.lineTo(W,H*0.42);ctx.stroke();ctx.beginPath();ctx.moveTo(0,H*0.58);ctx.lineTo(W,H*0.58);ctx.stroke();}
    if(id===13){ctx.fillStyle=t.accent+"28";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*0.55,0);ctx.lineTo(W*0.35,H);ctx.lineTo(0,H);ctx.fill();ctx.fillStyle=t.accent;ctx.beginPath();ctx.moveTo(W*0.55,0);ctx.lineTo(W*0.58,0);ctx.lineTo(W*0.38,H);ctx.lineTo(W*0.35,H);ctx.fill();}
    const tl=wrap(title,W-140,90,"Georgia");
    const tY = id===15 ? H*0.42-(tl.length*98)/2+18 : H/2-(tl.length*98)/2;
    tl.forEach((l,i)=>{ctx.font=`900 90px Georgia`;ctx.textAlign="center";ctx.fillStyle=t.accent+"20";ctx.fillText(l,W/2+2,tY+i*98+2);ctx.fillStyle=t.text;ctx.fillText(l,W/2,tY+i*98);});
    const aT2=tY+tl.length*98+52;
    if(guest){cT(guest,aT2,42,"Georgia",t.accent,"bold");if(role)cT(role,aT2+46,23,"Georgia",t.sub,"italic");}
    if(dateStr)cT(dateStr,H-96,25,"Arial",t.text); if(venue)cT(venue,H-62,22,"Arial",t.sub);
  }
  else if (id===16) {
    gradBg(t.bg1,t.bg2,true); const pad=50;
    ctx.strokeStyle=t.accent;ctx.lineWidth=2;ctx.strokeRect(pad,pad,W-pad*2,H-pad*2);ctx.strokeRect(pad+13,pad+13,W-pad*2-26,H-pad*2-26);
    ctx.strokeStyle=t.accent+"50";ctx.lineWidth=0.8;ctx.strokeRect(pad+22,pad+22,W-pad*2-44,H-pad*2-44);
    [[pad+13,pad+13],[W-pad-13,pad+13],[pad+13,H-pad-13],[W-pad-13,H-pad-13]].forEach(([x,y])=>{ctx.fillStyle=t.accent;ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x+14,y);ctx.lineTo(x,y+14);ctx.lineTo(x-14,y);ctx.fill();});
    cT(inst,128,17,"Georgia",t.accent,"bold"); hLine(153,190,W/2-36,t.accent+"55"); cT("◆",153,14,"Georgia",t.accent); hLine(153,W/2+36,W-190,t.accent+"55");
    const tl=wrap(title,W-220,86,"Georgia"); tl.forEach((l,i)=>cT(l,270+i*95,86,"Georgia",t.text,"bold italic"));
    const aT=270+tl.length*95+40;
    if(guest){ctx.fillStyle=t.accent+"22";ctx.fillRect(120,aT,W-240,70);cT(guest,aT+49,39,"Georgia",t.accent,"bold");if(role)cT(role,aT+89,22,"Georgia",t.sub,"italic");}
    hLine(H-143,120,W-120,t.accent+"50"); if(dateStr)cT(dateStr,H-104,25,"Georgia",t.text); if(venue)cT(venue,H-68,22,"Georgia",t.sub);
  }
  else if (id===17) {
    gradBg(t.bg1,t.bg2,true); aLine(0,12); aLine(H-12,12);
    ctx.strokeStyle=t.accent;ctx.lineWidth=3;ctx.strokeRect(28,28,W-56,H-56);ctx.strokeStyle=t.accent+"80";ctx.lineWidth=1;ctx.strokeRect(42,42,W-84,H-84);
    cT(inst,99,22,"Georgia",t.accent,"bold"); cT("PRESENTS",130,14,"Georgia",t.sub);
    ctx.strokeStyle=t.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(118,150);ctx.lineTo(W-118,150);ctx.stroke();
    const tl=wrap(title,W-180,90,"Georgia"); tl.forEach((l,i)=>cT(l,280+i*98,90,"Georgia",t.text,"900"));
    const aT=280+tl.length*98+30;
    if(guest){ctx.strokeStyle=t.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(100,aT+10);ctx.lineTo(W-100,aT+10);ctx.stroke();cT(guest,aT+68,42,"Georgia",t.accent,"bold");if(role)cT(role,aT+108,23,"Georgia",t.sub,"italic");}
    ctx.strokeStyle=t.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(100,H-143);ctx.lineTo(W-100,H-143);ctx.stroke();
    if(dateStr)cT(dateStr,H-103,27,"Georgia",t.text,"bold"); if(venue)cT(venue,H-66,22,"Georgia",t.sub);
  }
  else if (id===18) {
    gradBg(t.bg1,t.bg2,true); ctx.fillStyle=t.accent+"22";ctx.beginPath();ctx.arc(W/2,-80,500,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=t.accent;ctx.fillRect(0,0,W,80); ctx.fillStyle="#FFFFFF";ctx.font="bold 20px Arial";ctx.textAlign="center";ctx.fillText(inst,W/2,50);
    const tl=wrap(title,W-160,88,"Georgia"); tl.forEach((l,i)=>cT(l,228+i*96,88,"Georgia",t.text,"bold"));
    const aT=228+tl.length*96+50; ctx.fillStyle=t.accent;ctx.fillRect(100,aT,W-200,4);
    if(guest){cT(guest,aT+62,42,"Georgia",t.accent,"bold");if(role)cT(role,aT+104,23,"Georgia",t.sub,"italic");}
    ctx.fillStyle=t.accent;ctx.fillRect(0,H-78,W,78); ctx.fillStyle="#FFFFFF";ctx.font="400 23px Arial";ctx.textAlign="center";
    ctx.fillText([dateStr,venue].filter(Boolean).join("   |   "),W/2,H-28);
  }
  else if (id===19) {
    gradBg(t.bg1,t.bg2,true); ctx.strokeStyle=t.accent+"80";ctx.lineWidth=2;ctx.strokeRect(40,40,W-80,H-80);ctx.strokeStyle=t.accent+"50";ctx.lineWidth=0.8;ctx.strokeRect(55,55,W-110,H-110);
    cT("✿ ◆ ✿",88,25,"Georgia",t.accent); cT(inst,138,18,"Georgia",t.accent,"bold"); hLine(163,118,W-118,t.accent+"60"); cT("invites you to",208,23,"Georgia",t.sub,"italic");
    const tl=wrap(title,W-200,84,"Georgia"); tl.forEach((l,i)=>cT(l,308+i*92,84,"Georgia",t.text,"bold italic"));
    const aT=308+tl.length*92+30;
    if(guest){cT("— featuring —",aT+12,20,"Georgia",t.sub,"italic");cT(guest,aT+62,40,"Georgia",t.accent,"bold");if(role)cT(role,aT+98,21,"Georgia",t.sub,"italic");}
    hLine(H-148,118,W-118,t.accent+"40"); if(dateStr)cT(dateStr,H-106,25,"Georgia",t.text); if(venue)cT(venue,H-70,23,"Georgia",t.sub); cT("✿ ◆ ✿",H-38,18,"Georgia",t.accent);
  }
  else if (id===20) {
    gradBg(t.bg1,t.bg2,true);
    for(let i=0;i<W;i+=40){ctx.strokeStyle=t.accent+"12";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
    for(let i=0;i<H;i+=40){ctx.strokeStyle=t.accent+"12";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
    ctx.strokeStyle=t.accent+"60";ctx.lineWidth=1.5;ctx.strokeRect(40,40,W-80,H-80);
    [[40,40],[W-40,40],[40,H-40],[W-40,H-40]].forEach(([x,y])=>{ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});
    lT("REF: "+inst,60,78,14,"'Courier New'",t.accent); rT("SHEET 1/1",W-60,78,14,"'Courier New'",t.accent);
    hLine(95,40,W-40,t.accent+"40"); lT("TITLE:",60,158,16,"'Courier New'",t.accent);
    const tl=wrap(title,W-160,80,"'Courier New'"); tl.forEach((l,i)=>lT(l,60,238+i*88,80,"'Courier New'",t.text,"bold"));
    const aT=238+tl.length*88+40;
    if(guest){lT("PRESENTER:",60,aT,15,"'Courier New'",t.accent);lT(guest,60,aT+48,40,"'Courier New'",t.text,"bold");if(role)lT(role,60,aT+80,20,"'Courier New'",t.sub);}
    hLine(H-108,40,W-40,t.accent+"40"); if(dateStr)lT("DATE: "+dateStr,60,H-76,20,"'Courier New'",t.accent); if(venue)lT("LOC: "+venue,60,H-45,20,"'Courier New'",t.sub);
  }
  else if (id===21) {
    ctx.fillStyle=t.bg1;ctx.fillRect(0,0,W,H); ctx.fillStyle=t.accent;ctx.fillRect(0,0,W,160);
    lT(inst,50,54,18,"Arial","#FFFFFF","bold"); rT(dateStr||"",W-50,54,18,"Arial","#FFFFFF");
    ctx.fillStyle="#000000";ctx.fillRect(0,160,W,5);
    const tl=wrap(title,W-100,98,"'Arial Black'"); tl.forEach((l,i)=>lT(l,50,310+i*107,98,"'Arial Black'",t.text,"900"));
    const aT=310+tl.length*107+20;
    if(guest){ctx.fillStyle=t.accent;ctx.fillRect(50,aT,5,88);lT(guest,70,aT+54,42,"Arial",t.text,"bold");if(role)lT(role,70,aT+90,22,"Arial",t.sub);}
    ctx.fillStyle=t.accent;ctx.fillRect(0,H-98,W,4); lT(venue||"",50,H-53,23,"Arial",t.sub); rT(form.time||"",W-50,H-53,28,"Arial",t.text);
  }
  else if (id===22) {
    gradBg(t.bg1,t.bg2,true); ctx.strokeStyle=t.accent+"28";ctx.lineWidth=1;ctx.beginPath();ctx.arc(W/2,H/2,370,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=t.accent+"14";ctx.lineWidth=0.5;ctx.beginPath();ctx.arc(W/2,H/2,330,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(W/2,H/2,5,0,Math.PI*2);ctx.fill();
    hLine(58,0,W,t.accent+"60"); cT(inst,42,15,"Georgia",t.sub,"bold");
    const tl=wrap(title,W-200,88,"Georgia"); const tY=H/2-(tl.length*96)/2+10;
    tl.forEach((l,i)=>cT(l,tY+i*96,88,"Georgia",t.text,"bold italic"));
    if(guest){cT(guest,H*0.72,34,"Georgia",t.accent,"bold");if(role)cT(role,H*0.72+42,21,"Georgia",t.sub,"italic");}
    hLine(H-58,0,W,t.accent+"60"); cT([dateStr,venue].filter(Boolean).join("  /  "),H-30,20,"Georgia",t.sub);
  }
  else if (id===23) {
    gradBg(t.bg1,t.bg2,true); ctx.fillStyle=t.accent+"1E";ctx.fillRect(0,0,W,290); ctx.fillStyle=t.accent;ctx.fillRect(0,0,W,5);
    cT(inst,78,17,"Arial",t.text,"bold"); cT("cordially invites you",136,22,"Arial",t.sub+"CC");

// renderer only — UI in app.js
