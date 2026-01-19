(function(global){
  const ELIXIRS = {
    "basic_precision": { tier:"basic", title:"Elixir of Precision", desc:"Crit Chance +4% and Crit Damage +25%", mods:{critChance:4,critDamage:25,experienceBonus:5}, req:10 },
    "basic_advantage": { tier:"basic", title:"Elixir of Advantage", desc:"Attack Speed +7% and Lucky Hit +7%", mods:{attackSpeedBonus:7,luckyHitChance:7,experienceBonus:5}, req:10 }
  };
  const ESSENCE_CORE = {
    "ancient_times": { title:"Ancient Times", desc:"Strength +100 & XP +5%", mods:{ strength:100, experienceBonus:5 } }
  };
  function isPercentKey(k){ return /percent|chance|damage|speed|resist/i.test(k); }
  function applyBuffsToCombined(combinedStats, activeElixir, activeEssence){
    for(const k of Object.keys(combinedStats)) if(k.startsWith("buff_")) delete combinedStats[k];
    function addBuff(key,label,value){ const typ = isPercentKey(key) ? "percent" : "plain"; combinedStats["buff_"+key] = { label, value, type: typ }; }
    if(activeElixir && ELIXIRS[activeElixir]){ const e = ELIXIRS[activeElixir]; for(const m in e.mods) addBuff(activeElixir+"_"+m, e.title+" â€” "+m, e.mods[m]); }
    if(activeEssence && activeEssence.core){ const o = ESSENCE_CORE[activeEssence.core]; if(o) for(const m in o.mods) addBuff(activeEssence.core+"_"+m, o.title+" â€” "+m, o.mods[m]); }
  }
  global.Buffs = { ELIXIRS, ESSENCE_CORE, applyBuffsToCombined };
})(window);
