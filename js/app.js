(function(){
  // STAT_GROUPS
  const STAT_GROUPS = [
    { title: "Core Attributes", items:[
      { key:"strength", label:"Strength:", type:"plain" },
      { key:"intelligence", label:"Intelligence:", type:"plain" },
      { key:"willpower", label:"Willpower:", type:"plain" },
      { key:"dexterity", label:"Dexterity:", type:"plain" },
    ]},
    { title:"Weapon & Offensive", items:[
      { key:"baseWeaponDamage", label:"Base Weapon Damage", type:"plain" },
      { key:"weaponSpeed", label:"Weapon Speed", type:"plain" },
      { key:"attackSpeedBonus", label:"Attack Speed Bonus", type:"percent" },
      { key:"critChance", label:"Critical Strike Chance", type:"percent" },
      { key:"critDamage", label:"Critical Strike Damage", type:"percent" },
      { key:"overpowerChance", label:"Overpower Chance", type:"percent" },
      { key:"overpowerDamage", label:"Overpower Damage", type:"percent" },
      { key:"vulnerableDamage", label:"Vulnerable Damage", type:"percent" },
      { key:"allDamage", label:"All Damage", type:"percent" },
      { key:"basicDamage", label:"Damage with Basic", type:"percent" },
      { key:"coreDamage", label:"Damage with Core", type:"percent" },
      { key:"bleedingDamage", label:"Damage with Bleeding", type:"percent" },
      { key:"burningDamage", label:"Damage with Burning", type:"percent" },
      { key:"poisoningDamage", label:"Damage with Poisoning", type:"percent" },
      { key:"corruptingDamage", label:"Damage with Corrupting", type:"percent" },
      { key:"thorns", label:"Thorns", type:"plain" }
    ]}
  ];
  window.STAT_GROUPS = STAT_GROUPS;

  // Simple debug
  function debug(msg){ const el = document.getElementById("debugLog"); if(el) el.textContent = new Date().toLocaleTimeString() + " " + msg + "\n" + el.textContent; console.log(msg); }

  // init UI collapsibles (if UI available)
  if(window.UI && window.UI.initCollapsibles) window.UI.initCollapsibles();

  // background controls
  const btnSetBg = document.getElementById("btnSetBg"), bgFile = document.getElementById("bgFile"), bgDropArea = document.getElementById("bgDropArea"), applyBgUrl = document.getElementById("applyBgUrl"), bgUrlInput = document.getElementById("bgUrl"), resetBg = document.getElementById("resetBg");
  btnSetBg.addEventListener("click", ()=> bgFile.click());
  bgFile.addEventListener("change", e => { const f = e.target.files[0]; if(f){ const fr=new FileReader(); fr.onload=()=>{ document.documentElement.style.setProperty("--bg-image-url", "url('" + fr.result + "')"); localStorage.setItem("customBackground", fr.result); debug("Background set from file"); }; fr.readAsDataURL(f); }});
  bgDropArea.addEventListener("dragover", e=>{ e.preventDefault(); bgDropArea.style.opacity=.85; }); bgDropArea.addEventListener("dragleave", e=>{ bgDropArea.style.opacity=1; });
  bgDropArea.addEventListener("drop", e=>{ e.preventDefault(); bgDropArea.style.opacity=1; const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f){ const fr=new FileReader(); fr.onload=()=>{ document.documentElement.style.setProperty("--bg-image-url", "url('" + fr.result + "')"); localStorage.setItem("customBackground", fr.result); debug("Background set from drop"); }; fr.readAsDataURL(f); }});
  applyBgUrl.addEventListener("click", ()=>{ const u = bgUrlInput.value.trim(); if(u){ document.documentElement.style.setProperty("--bg-image-url", "url('" + u + "')"); localStorage.setItem("customBackground", u); debug("Background set from URL"); }});
  resetBg.addEventListener("click", ()=>{ document.documentElement.style.setProperty("--bg-image-url", "url(\"/assets/background.jpg\")"); localStorage.removeItem("customBackground"); debug("Background reset"); });
  (function restoreBg(){ const cur = localStorage.getItem("customBackground"); if(cur) document.documentElement.style.setProperty("--bg-image-url", "url('" + cur + "')"); })();

  // OCR file input
  const fileInput = document.getElementById("fileInput"), preview = document.getElementById("preview"), statusEl = document.getElementById("status"), ocrTextEl = document.getElementById("ocrText");
  fileInput.addEventListener("change", async (e)=>{ for(const f of e.target.files){ await handleFile(f); } });

  async function handleFile(file){
    try{
      statusEl.textContent = "Running OCR...";
      const { text, stats } = await OCR.processImageFile(file, STAT_GROUPS, (type,m)=> {
        if(type==="preview"){ preview.src = m; preview.style.display="block"; }
        else if(type==="progress"){ statusEl.textContent = m.status + " " + Math.round((m.progress||0)*100) + "%"; }
      });
      statusEl.textContent = "OCR done";
      ocrTextEl.textContent = text || "(no text)";
      // merge stats
      window.state = window.state || {};
      window.state.lastExtractedStats = stats;
      window.state.combinedStats = window.state.combinedStats || {};
      for(const k in stats){ if(stats[k] && stats[k].value!=null) window.state.combinedStats[k]=stats[k]; }
      // apply buffs
      Buffs.applyBuffsToCombined(window.state.combinedStats, window.state.activeElixir || null, window.state.activeEssence || {});
      // render (simple UI functions)
      if(window.UI && window.UI.renderStatsTable) window.UI.renderStatsTable(window.state.combinedStats, STAT_GROUPS);
      debug("OCR merged");
    }catch(err){
      statusEl.textContent = "OCR error";
      ocrTextEl.textContent = String(err);
      debug("OCR error: " + (err && err.message));
    }
  }

  // populate elixir/essence grids
  function makeGrid(id, items, onToggle){ const container=document.getElementById(id); if(!container) return; container.innerHTML=""; Object.keys(items).forEach(k=>{ const it=items[k]; const div=document.createElement("div"); div.className="selectable"; div.dataset.key=k; div.innerHTML = "<div class='title'>" + (it.title||it.name) + "</div><div class='meta'>" + (it.desc||it.criteria||"") + "</div>"; div.addEventListener("click", ()=> onToggle(k,div)); container.appendChild(div); }); }
  makeGrid("basicElixirGrid", Buffs.ELIXIRS || {}, (k,div)=>{ window.state.activeElixir = (window.state.activeElixir===k?null:k); document.querySelectorAll("#basicElixirGrid .selectable, #advancedElixirGrid .selectable").forEach(el=>el.classList.toggle("active", el.dataset.key===window.state.activeElixir)); Buffs.applyBuffsToCombined(window.state.combinedStats||{}, window.state.activeElixir, window.state.activeEssence||{}); localStorage.setItem("activeElixir", window.state.activeElixir||""); if(window.UI && window.UI.renderStatsTable) window.UI.renderStatsTable(window.state.combinedStats, STAT_GROUPS); });
  makeGrid("advancedElixirGrid", Buffs.ELIXIRS || {}, (k,div)=>{ window.state.activeElixir = (window.state.activeElixir===k?null:k); document.querySelectorAll("#basicElixirGrid .selectable, #advancedElixirGrid .selectable").forEach(el=>el.classList.toggle("active", el.dataset.key===window.state.activeElixir)); Buffs.applyBuffsToCombined(window.state.combinedStats||{}, window.state.activeElixir, window.state.activeEssence||{}); localStorage.setItem("activeElixir", window.state.activeElixir||""); if(window.UI && window.UI.renderStatsTable) window.UI.renderStatsTable(window.state.combinedStats, STAT_GROUPS); });
  makeGrid("essenceCoreGrid", Buffs.ESSENCE_CORE||{}, (k)=>{ window.state.activeEssence = window.state.activeEssence||{}; window.state.activeEssence.core = (window.state.activeEssence.core===k?null:k); document.querySelectorAll("#essenceCoreGrid .selectable").forEach(el=>el.classList.toggle("active", el.dataset.key===window.state.activeEssence.core)); Buffs.applyBuffsToCombined(window.state.combinedStats||{}, window.state.activeElixir, window.state.activeEssence); localStorage.setItem("activeEssence", JSON.stringify(window.state.activeEssence||{})); if(window.UI && window.UI.renderStatsTable) window.UI.renderStatsTable(window.state.combinedStats, STAT_GROUPS); });
  makeGrid("essenceDefGrid", Buffs.ESSENCE_DEF||{}, (k)=>{ window.state.activeEssence = window.state.activeEssence||{}; window.state.activeEssence.defensive = (window.state.activeEssence.defensive===k?null:k); document.querySelectorAll("#essenceDefGrid .selectable").forEach(el=>el.classList.toggle("active", el.dataset.key===window.state.activeEssence.defensive)); Buffs.applyBuffsToCombined(window.state.combinedStats||{}, window.state.activeElixir, window.state.activeEssence); localStorage.setItem("activeEssence", JSON.stringify(window.state.activeEssence||{})); if(window.UI && window.UI.renderStatsTable) window.UI.renderStatsTable(window.state.combinedStats, STAT_GROUPS); });
  makeGrid("essenceResGrid", Buffs.ESSENCE_RES||{}, (k)=>{ window.state.activeEssence = window.state.activeEssence||{}; window.state.activeEssence.resistance = (window.state.activeEssence.resistance===k?null:k); document.querySelectorAll("#essenceResGrid .selectable").forEach(el=>el.classList.toggle("active", el.dataset.key===window.state.activeEssence.resistance)); Buffs.applyBuffsToCombined(window.state.combinedStats||{}, window.state.activeElixir, window.state.activeEssence); localStorage.setItem("activeEssence", JSON.stringify(window.state.activeEssence||{})); if(window.UI && window.UI.renderStatsTable) window.UI.renderStatsTable(window.state.combinedStats, STAT_GROUPS); });

  // populate rune selects
  function populateSelect(id, obj){ const sel=document.getElementById(id); if(!sel) return; sel.innerHTML = "<option value=\"\">(none)</option>"; Object.keys(obj||{}).forEach(k=>{ const it=obj[k]; const o=document.createElement("option"); o.value=k; o.textContent = k + " â€” " + (it.name || it.title) + " (" + (it.rarity||"") + ")"; sel.appendChild(o); }); }
  populateSelect("selectOfferingRune", Runes.OFFER_RUNES || {});
  populateSelect("selectInvocationRune", Runes.INVOCATION_RUNES || {});

  // rune buttons events are wired in separate functions in app.js (not repeated here)
  debug("Initialisation done");
})();
