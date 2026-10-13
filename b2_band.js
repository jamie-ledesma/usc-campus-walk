/* ==================================================================
   The USC fight song, quietly, when the walk starts: it plays twice in
   a row and then stops. B (or the note button on touch) turns it off,
   or plays it twice more if it has finished. The recording sits next
   to the page as usc_fight_song.mp3 and is decoded once into Web Audio,
   so the volume works the same on phones.
   ================================================================== */
var MUSIC_URL='usc_fight_song.mp3', MUSIC_VOL=0.11;     /* through masterGain (0.5): faint under the walk */
var BAND=null, bandOn=true, _bandGain=null, _bandDuck=1, _bandSrc=[], _bandBuf=null, _bandLoad=null, _bandEnds=0;
function _bandFetch(){
  if(_bandLoad) return _bandLoad;
  _bandLoad=fetch(MUSIC_URL).then(function(r){ if(!r.ok) throw new Error('no song'); return r.arrayBuffer(); })
    .then(function(a){ return new Promise(function(ok,bad){ AC.decodeAudioData(a,ok,bad); }); })
    .then(function(b){ _bandBuf=b; return b; })
    .catch(function(){ _bandLoad=null; return null; });       /* no file, no music: the walk carries on */
  return _bandLoad;
}
function _bandStop(){ _bandSrc.forEach(function(s){ try{ s.onended=null; s.stop(); }catch(e){} }); _bandSrc=[]; }
function _bandPlayTwice(){
  _bandFetch().then(function(buf){
    if(!buf||!bandOn) return;
    _bandStop();
    var t=AC.currentTime+0.15;
    for(var k=0;k<2;k++){
      var s=AC.createBufferSource(); s.buffer=buf; s.connect(_bandGain); s.start(t+k*buf.duration);
      _bandSrc.push(s);
    }
    _bandEnds=t+2*buf.duration;
    _bandSrc[1].onended=function(){ _bandSrc=[]; };
    bandLevel(1.2);
  });
}
function bandStart(){
  if(!AC||BAND) return;
  BAND=true;
  _bandGain=AC.createGain(); _bandGain.gain.value=0.0001; _bandGain.connect(masterGain);
  _bandPlayTwice();
}
function bandLevel(fade){
  if(!_bandGain) return;
  var v=bandOn?MUSIC_VOL*_bandDuck:0.0001, t=AC.currentTime;
  _bandGain.gain.cancelScheduledValues(t); _bandGain.gain.setValueAtTime(Math.max(0.0001,_bandGain.gain.value),t);
  _bandGain.gain.exponentialRampToValueAtTime(Math.max(0.0001,v),t+(fade||0.4));
}
function bandToggle(){
  var playing=_bandSrc.length>0;
  if(bandOn&&playing){ bandOn=false; bandLevel(0.5); setTimeout(function(){ if(!bandOn) _bandStop(); },600); }
  else { bandOn=true; if(!BAND) bandStart(); else _bandPlayTwice(); }
  var b=document.getElementById('tb-music'); if(b) b.classList.toggle('on',bandOn);
  return bandOn;
}
function bandDuck(paused){ _bandDuck=paused?0.45:1; bandLevel(0.6); }
/* switching tabs freezes the sound where it is, and picks it back up when you return */
document.addEventListener('visibilitychange',function(){
  if(!AC) return;
  if(document.hidden){ if(AC.state==='running') AC.suspend(); }
  else if(AC.state==='suspended') AC.resume();
});
