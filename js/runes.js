(function(global){
  const OFFER_RUNES = {
    "Cir": { name:"Cir", rarity:"Magic", offering:50, criteria:"Cast the same non-Channeled Skill 3 times in a row" },
    "Zan": { name:"Zan", rarity:"Magic", offering:150, criteria:"Cast an Ultimate Skill" },
    "Cem": { name:"Cem", rarity:"Magic", offering:75, criteria:"Cast Evade" }
  };
  const INVOCATION_RUNES = {
    "Gar": { name:"Gar", rarity:"Magic", requires:25, cooldown:1, effect:"Gain 2.5% Crit Chance for 5s, up to 25% (stacks)." },
    "Lum": { name:"Lum", rarity:"Magic", requires:5, cooldown:1, effect:"Restore 1 Primary Resource." }
  };
  global.Runes = { OFFER_RUNES, INVOCATION_RUNES };
})(window);
