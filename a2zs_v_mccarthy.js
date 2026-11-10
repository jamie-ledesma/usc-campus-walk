/* ==================================================================
   McCarthy Honors Residential College (USC Village), built with the Village kit VK (a2zm_village_kit.js).
   Placeholder: replaced by the hand-built version.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='McCarthy Honors Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  VK.brickRing(B.ring,0,19);
  VK.roof(B.ring,19,4.5);
  VK.collider(B.ring,19);
})();
