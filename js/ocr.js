(function(global){
  function parseNumberToken(line){ if(!line) return null; const m=line.match(/(-?\d+(?:\.\d+)?)(?=%?)/); if(!m) return null; const v=parseFloat(m[1]); return isNaN(v)?null:v; }
  function norm(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(); }
  function extractStatsFromText(text, STAT_PATTERNS){
    const raw = String(text||"").split(/\r?\n/).map(l=>l.replace(/\u00A0/g," ").trim()).filter(Boolean);
    const lines = raw.filter(l=>l.replace(/[^A-Za-z0-9%.\-]+/g,"").length>=2);
    const res = {};
    for(const p of STAT_PATTERNS){
      const label = norm(p.label); const tokens = label.split(/\s+/).filter(Boolean);
      let found = null;
      for(let i=0;i<lines.length && found==null;i++){
        const lower = norm(lines[i]); let ok=true; for(const t of tokens){ if(t && lower.indexOf(t)===-1){ ok=false; break; } }
        if(ok){ const num=parseNumberToken(lines[i]); if(num!=null){ found=num; break; } const alt = lines[i].match(/(-?\d+(?:\.\d+)?)(?=%?)/g); if(alt && alt.length){ found=parseFloat(alt[alt.length-1]); break; } }
      }
      if(found==null){
        for(let i=0;i<lines.length-1 && found==null;i++){
          const a = norm(lines[i]); let ok=true; for(const t of tokens){ if(t && a.indexOf(t)===-1){ ok=false; break; } }
          if(ok){ const num = parseNumberToken(lines[i+1]); if(num!=null){ found=num; break; } }
        }
      }
      if(found==null){
        const kw = tokens[tokens.length-1];
        if(kw){ for(const line of lines){ if(norm(line).indexOf(kw)!==-1){ const num=parseNumberToken(line); if(num!=null){ found=num; break; } } } }
      }
      res[p.key] = { label: p.label, value: found, type: p.type };
    }
    return res;
  }
  async function processImageFile(file, STAT_PATTERNS, logger){
    const url = URL.createObjectURL(file);
    if(logger) logger("preview", url);
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data:{ text } } = await worker.recognize(url);
    await worker.terminate();
    const stats = extractStatsFromText(text, STAT_PATTERNS);
    return { text, stats };
  }
  global.OCR = { extractStatsFromText, processImageFile };
})(window);
