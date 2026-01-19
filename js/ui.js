(function(global){
  function escapeHtml(s){ if (s==null) return ""; return String(s).replace(/[&<>"'`]/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;","`":"&#96;"}[m]; }); }
  function initCollapsibles(){
    const key = "collapsedSections_v2";
    function load(){ try { const r=localStorage.getItem(key); return r?JSON.parse(r):{}; } catch(e){return{}} }
    function save(s){ try{ localStorage.setItem(key, JSON.stringify(s)); }catch(e){} }
    const state = load();
    document.querySelectorAll(".collapsible").forEach(section=>{
      const id = section.dataset.section || section.id;
      const header = section.querySelector(".section-header");
      if (!header) return;
      if (state[id]) section.classList.add("collapsed");
      header.addEventListener("click", ()=>{
        section.classList.toggle("collapsed");
        const ns = load(); ns[id] = section.classList.contains("collapsed"); save(ns);
      });
    });
    document.querySelectorAll(".collapsible-sub").forEach((sub,i)=>{
      const id = "sub_" + (sub.id || i);
      const header = sub.querySelector(".sub-header");
      if (!header) return;
      if (state[id]) sub.classList.add("sub-collapsed");
      header.addEventListener("click", ()=>{
        sub.classList.toggle("sub-collapsed");
        const ns = load(); ns[id] = sub.classList.contains("sub-collapsed"); save(ns);
      });
    });
  }
  global.UI = { initCollapsibles: initCollapsibles };
})(window);
