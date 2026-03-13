// ── CONFIG — change this after deploying backend ──
const API = localStorage.getItem("ff_api") || "https://flyerforge-api.onrender.com";

// ── STATE ──
let selectedTemplate = TEMPLATES[0];
let currentCat = "All";
let token = localStorage.getItem("ff_token") || null;
const canvas = document.getElementById("flyer-canvas");
const ctx = canvas.getContext("2d");

// ── HELPERS ──
const g = id => document.getElementById(id)?.value?.trim() || "";
const getForm = () => ({
  title: g("f-title"), institute: g("f-inst"),
  date: g("f-date"), time: g("f-time"),
  venue: g("f-venue"), guest: g("f-guest"),
  role: g("f-role"), desc: g("f-desc"),
});
const show = id => document.getElementById(id)?.classList.remove("hidden");
const hide = id => document.getElementById(id)?.classList.add("hidden");

// ── AUTH ──
async function doLogin() {
  const user = document.getElementById("l-user").value.trim();
  const pass = document.getElementById("l-pass").value;
  const btn = document.getElementById("btn-login");
  btn.textContent = "Signing in...";
  btn.disabled = true;
  hide("login-error");
  try {
    const fd = new FormData();
    fd.append("username", user);
    fd.append("password", pass);
    const res = await fetch(`${API}/login`, { method: "POST", body: fd });
    if (!res.ok) throw new Error();
    const data = await res.json();
    token = data.access_token;
    localStorage.setItem("ff_token", token);
    enterApp();
  } catch {
    show("login-error");
  } finally {
    btn.textContent = "Sign In →";
    btn.disabled = false;
  }
}

function signOut() {
  token = null;
  localStorage.removeItem("ff_token");
  hide("page-app");
  show("page-login");
}

async function enterApp() {
  hide("page-login");
  show("page-app");
  buildCategoryTabs();
  buildTemplateGrid();
  setPlaceholder();
  try {
    const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      document.getElementById("header-stats").textContent = `${data.total_flyers} FLYERS SAVED`;
    }
  } catch {}
}

// ── TABS ──
function showTab(tab) {
  ["create", "history"].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle("hidden", t !== tab);
    document.getElementById(`nav-${t}`).classList.toggle("active", t === tab);
  });
  if (tab === "history") loadHistory();
}

// ── SAVE TO BACKEND ──
async function saveFlyer() {
  const form = getForm();
  if (!form.title) return;
  const btn = document.getElementById("btn-save");
  const statusEl = document.getElementById("save-status");
  btn.textContent = "Saving...";
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/flyers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title, institute: form.institute,
        guest: form.guest, role: form.role,
        date: form.date, time: form.time,
        venue: form.venue, description: form.desc,
        template_id: selectedTemplate.id,
        template_name: selectedTemplate.name,
      }),
    });
    if (!res.ok) throw new Error();
    statusEl.textContent = "✓ Saved to history!";
    statusEl.className = "save-status success";
    show("save-status");
    setTimeout(() => hide("save-status"), 3000);
    // update count
    const me = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (me.ok) { const d = await me.json(); document.getElementById("header-stats").textContent = `${d.total_flyers} FLYERS SAVED`; }
  } catch {
    statusEl.textContent = "✗ Failed to save. Is backend running?";
    statusEl.className = "save-status error";
    show("save-status");
    setTimeout(() => hide("save-status"), 4000);
  } finally {
    btn.textContent = "☁ Save to History";
    btn.disabled = false;
  }
}

// ── LOAD HISTORY ──
async function loadHistory() {
  const grid = document.getElementById("history-grid");
  grid.innerHTML = '<div class="history-loading">Loading your flyers...</div>';
  try {
    const res = await fetch(`${API}/flyers`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    const flyers = await res.json();
    if (flyers.length === 0) {
      grid.innerHTML = '<div class="history-empty">No flyers yet. Create your first one!</div>';
      return;
    }
    grid.innerHTML = "";
    flyers.forEach(f => {
      const t = TEMPLATES.find(x => x.id === f.template_id) || TEMPLATES[0];
      const card = document.createElement("div");
      card.className = "history-card";
      const date = new Date(f.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      card.innerHTML = `
        <div class="history-card-preview" style="background:linear-gradient(135deg,${t.bg1},${t.bg2})">
          <canvas id="hc-${f.id}" width="600" height="800"></canvas>
        </div>
        <div class="history-card-body">
          <div class="history-card-title">${f.title}</div>
          <div class="history-card-meta">${[f.date, f.venue].filter(Boolean).join(" · ") || "No date/venue"}</div>
          <div class="history-card-tmpl">✦ ${f.template_name}</div>
          <div class="history-card-meta" style="margin-top:4px">Saved ${date}</div>
          <div class="history-card-actions">
            <button class="hc-btn" onclick="reloadFlyer(${f.id})">↩ Reload</button>
            <button class="hc-btn" onclick="downloadHistory(${f.id})">↓ Download</button>
            <button class="hc-btn del" onclick="deleteFlyer(${f.id}, this)">✕ Delete</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
      // render mini preview
      setTimeout(() => {
        const miniCanvas = document.getElementById(`hc-${f.id}`);
        if (miniCanvas) {
          const mctx = miniCanvas.getContext("2d");
          renderToCanvasCtx(mctx, miniCanvas, t.id, {
            title: f.title, institute: f.institute, guest: f.guest,
            role: f.role, date: f.date, time: f.time, venue: f.venue, desc: f.description
          }, 600, 800);
        }
      }, 50);
    });
  } catch (e) {
    grid.innerHTML = '<div class="history-empty">Could not load history. Make sure backend is running.</div>';
  }
}

async function deleteFlyer(id, btn) {
  if (!confirm("Delete this flyer?")) return;
  try {
    await fetch(`${API}/flyers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    btn.closest(".history-card").remove();
  } catch { alert("Failed to delete"); }
}

function reloadFlyer(id) {
  // Switch to create tab and load that flyer's data
  showTab("create");
}

function downloadHistory(id) {
  const miniCanvas = document.getElementById(`hc-${id}`);
  if (!miniCanvas) return;
  const a = document.createElement("a");
  a.href = miniCanvas.toDataURL("image/png");
  a.download = `flyer-${id}.png`;
  a.click();
}

// ── CANVAS RENDERER (delegates to renderer.js renderToCanvas) ──
function renderToCanvasCtx(ctx2, canvas2, tmplId, form, W = 900, H = 1200) {
  canvas2.width = W; canvas2.height = H;
  // reuse the big renderToCanvas but swap ctx/canvas temporarily
  const origCanvas = canvas;
  const origCtx = ctx;
  // We call a simplified version directly
  const t = TEMPLATES.find(x => x.id === tmplId) || TEMPLATES[0];
  const g2 = ctx2.createLinearGradient(0, 0, 0, H);
  g2.addColorStop(0, t.bg1); g2.addColorStop(1, t.bg2);
  ctx2.fillStyle = g2; ctx2.fillRect(0, 0, W, H);
  ctx2.fillStyle = t.text; ctx2.font = `bold ${W*0.08}px Georgia`;
  ctx2.textAlign = "center";
  const words = (form.title || "").split(" ");
  let line = "", lines = [], maxW = W * 0.8;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx2.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((l, i) => ctx2.fillText(l, W/2, H*0.38 + i * W*0.09));
  if (form.guest) { ctx2.fillStyle = t.accent; ctx2.font = `bold ${W*0.045}px Georgia`; ctx2.fillText(form.guest, W/2, H*0.62); }
  ctx2.fillStyle = t.accent+"80"; ctx2.font = `${W*0.025}px Arial`;
  ctx2.fillText([form.date, form.venue].filter(Boolean).join("  ·  "), W/2, H*0.88);
}

// ── PREVIEW ──
let previewTimer = null;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    const form = getForm();
    if (!form.title) {
      canvas.style.display = "none";
      show("preview-ph");
      return;
    }
    canvas.width = 900; canvas.height = 1200;
    renderToCanvas(selectedTemplate.id, form);
    canvas.style.display = "block";
    hide("preview-ph");
  }, 250);
}

// ── GENERATE ──
document.getElementById("btn-generate").addEventListener("click", () => {
  const form = getForm();
  if (!form.title) return;
  const btn = document.getElementById("btn-generate");
  btn.textContent = "GENERATING...";
  btn.disabled = true;
  setTimeout(() => {
    canvas.width = 900; canvas.height = 1200;
    renderToCanvas(selectedTemplate.id, form);
    canvas.style.display = "block";
    canvas.classList.add("ready");
    hide("preview-ph");
    show("save-row");
    document.getElementById("status-dot").classList.add("ready");
    const st = document.getElementById("status-text");
    st.textContent = "READY"; st.classList.add("ready");
    btn.textContent = "⚡ GENERATE FLYER";
    btn.disabled = false;
  }, 1000);
});

// ── DOWNLOAD ──
document.getElementById("btn-download").addEventListener("click", () => {
  const form = getForm();
  const filename = (form.title || "flyer").replace(/\s+/g, "-");
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename + ".png";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
});

document.getElementById("btn-save").addEventListener("click", saveFlyer);

// ── FORM INPUTS ──
["f-title","f-inst","f-date","f-time","f-venue","f-guest","f-role","f-desc"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", () => {
    const hasTitle = document.getElementById("f-title").value.trim().length > 0;
    const btn = document.getElementById("btn-generate");
    btn.disabled = !hasTitle;
    if (hasTitle) btn.classList.add("active"); else btn.classList.remove("active");
    schedulePreview();
  });
});

// ── LOGIN ENTER KEY ──
document.getElementById("l-pass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
document.getElementById("btn-login").addEventListener("click", doLogin);

// ── TEMPLATE UI ──
function buildCategoryTabs() {
  const container = document.getElementById("cat-tabs");
  container.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat === currentCat ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => { currentCat = cat; buildCategoryTabs(); buildTemplateGrid(); };
    container.appendChild(btn);
  });
}

function buildTemplateGrid() {
  const container = document.getElementById("tmpl-grid");
  container.innerHTML = "";
  const visible = currentCat === "All" ? TEMPLATES : TEMPLATES.filter(t => t.category === currentCat);
  visible.forEach(t => {
    const card = document.createElement("button");
    card.className = "tmpl-card" + (t.id === selectedTemplate.id ? " selected" : "");
    card.style.background = `linear-gradient(135deg,${t.bg1},${t.bg2})`;
    card.style.borderColor = t.id === selectedTemplate.id ? t.accent : "transparent";
    card.innerHTML = `<div class="dot" style="background:${t.accent}"></div><div class="tmpl-name" style="color:${t.accent}">${t.name}</div><div class="tmpl-cat" style="color:${t.text}">${t.category}</div>`;
    card.onclick = () => {
      selectedTemplate = t;
      hide("save-row"); hide("save-status");
      canvas.classList.remove("ready");
      document.getElementById("status-dot").classList.remove("ready");
      document.getElementById("status-text").textContent = t.name.toUpperCase();
      document.getElementById("status-text").classList.remove("ready");
      setPlaceholder();
      buildTemplateGrid();
      schedulePreview();
    };
    container.appendChild(card);
  });
}

function setPlaceholder() {
  const t = selectedTemplate;
  const ph = document.getElementById("preview-ph");
  if (ph) ph.style.background = `linear-gradient(135deg,${t.bg1},${t.bg2})`;
  const icon = document.getElementById("ph-icon");
  const name = document.getElementById("ph-name");
  if (icon) icon.style.color = t.accent;
  if (name) { name.textContent = t.name; name.style.color = t.accent; }
  document.getElementById("status-text").textContent = t.name.toUpperCase();
}

// ── INIT ──
if (token) {
  enterApp();
} else {
  show("page-login");
}
