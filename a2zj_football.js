/* ==================================================================
   A USC football scrimmage on Howard Jones Field (Jamie asked for it,
   "like the women's soccer game"). FBALL (a_world.js) is the field frame:
   origin at the centre, u along the field, v across it, hu/hv to the
   painted edges; the goal lines are 10 yards in from the ends.

   The starting offense in cardinal jerseys and gold pants attacks +u;
   the starting defense in white jerseys and gold pants. Everybody wears
   the cardinal helmet with a grey facemask and gold side marks. Plays run
   on a loop: huddle, line up, set, snap, then a run (handoff to the back,
   the line blocks, the defense pursues and tackles) or a pass (the quarter-
   back drops, receivers run routes, corners shadow them, the throw arcs to
   the open man, caught or broken up). Downs move the ball; a touchdown
   sets off a celebration on the field and the cardinal sideline, then
   the ball goes back to the 25.
   Sidelines: twenty-odd players in each jersey on either side (some with
   helmets off), coaches in polos and khakis, and a news crew with
   tripod cameras near the end zone. Same build as the students: eight
   instanced meshes (head, helmet, body, pads, two arms, two legs) and
   the ball. Runs only while the camera is within 320 m.
   ================================================================== */
var updateFootball=function(){};
(function(){
  if(typeof FBALL==='undefined'||!FBALL) return;
  var C=FBALL.c, DU=FBALL.du, DV=FBALL.dv, HU=FBALL.hu, HV=FBALL.hv, GL=HU-Math.min(9.14,HU*0.15), HWP=HV-4;
  function P(u,v){ return [C[0]+u*DU[0]+v*DV[0], C[1]+u*DU[1]+v*DV[1]]; }

  /* ---------------- bodies, built like the students ---------------- */
  function Bag(){ this.p=[]; this.n=[]; this.c=[]; }
  Bag.prototype.add=function(geo,mat,hex){
    var g=geo.index?geo.toNonIndexed():geo, pos=g.attributes.position, nor=g.attributes.normal,
        nm=new T.Matrix3().getNormalMatrix(mat), v=new T.Vector3(), c=new T.Color(hex);
    for(var j=0;j<pos.count;j++){
      v.fromBufferAttribute(pos,j).applyMatrix4(mat); this.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(nor,j).applyMatrix3(nm).normalize(); this.n.push(v.x,v.y,v.z);
      this.c.push(c.r,c.g,c.b);
    }
  };
  Bag.prototype.geom=Mesher.prototype.geom;
  function MT(x,y,z,sx,sy,sz){ return new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion(),new T.Vector3(sx||1,sy||1,sz||1)); }
  var head=new Bag(), helm=new Bag(), body=new Bag(), pads=new Bag(), arm=new Bag(), leg=new Bag();
  head.add(new T.IcosahedronGeometry(0.37,0),MT(0,0.37,0,1.0,1.03,0.95),0xFFFFFF);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT(-0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT( 0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.IcosahedronGeometry(0.385,0),MT(0,0.415,0.045,1.0,0.86,0.98),0x3A281C);
  /* the helmet: cardinal shell, grey facemask, gold marks on the sides */
  helm.add(new T.IcosahedronGeometry(0.4,1),MT(0,0.40,0.02,1.0,0.94,1.06),0x9D2235);
  helm.add(new T.BoxGeometry(0.46,0.05,0.06),MT(0,0.30,-0.40),0xB9BCBE);
  helm.add(new T.BoxGeometry(0.40,0.05,0.06),MT(0,0.20,-0.38),0xB9BCBE);
  helm.add(new T.BoxGeometry(0.05,0.17,0.06),MT(0,0.25,-0.41),0xB9BCBE);
  helm.add(new T.BoxGeometry(0.04,0.18,0.2),MT(-0.395,0.41,0.02),0xF2C230);
  helm.add(new T.BoxGeometry(0.04,0.18,0.2),MT( 0.395,0.41,0.02),0xF2C230);
  body.add(new T.CylinderGeometry(0.300,0.360,0.42,8),MT(0,0.21,0),0xFFFFFF);
  body.add(new T.CylinderGeometry(0.205,0.24,0.05,8),MT(0,0.43,0),0xE8E8E8);
  pads.add(new T.BoxGeometry(0.98,0.2,0.56),MT(0,0.38,0),0xFFFFFF);
  pads.add(new T.BoxGeometry(0.62,0.08,0.44),MT(0,0.49,0),0xF0F0F0);
  arm.add(new T.CylinderGeometry(0.082,0.072,0.29,5),MT(0,-0.145,0),0xFFFFFF);
  leg.add(new T.CylinderGeometry(0.105,0.098,0.26,5),MT(0,-0.13,0),0xFFFFFF);
  leg.add(new T.BoxGeometry(0.195,0.115,0.25),MT(0,-0.305,-0.03),0x3A3A3A);

  var SKIN=[0xF7DCC2,0xF0C6A0,0xE3AC82,0xCE9163,0xB27548,0x915934,0x714128,0x54301D];
  var RED=0x9D2235, WHT=0xF2F2EE, GOLD=0xF2C230;
  var seed=11; function srnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }

  /* ---------------- who is here ----------------
     0..10 offense (C, LG, RG, LT, RT, TE, WR, WR, slot, QB, RB), 11..21 defense (DL x4, LB x3, CB x2, S x2),
     22..23 officials, then the sidelines, the coaches and the news crew. */
  var E=[], i;
  function add(o){ o.u=o.u||0; o.v=o.v||0; o.fu=o.fu||1; o.fv=o.fv||0; o.spd=0; o.ph=srnd()*6; o.pose=o.pose||'idle';
    o.sc=o.sc||1.12; o.down=0; o.jump=0; E.push(o); return o; }
  for(i=0;i<22;i++) add({team:i<11?0:1, k:i%11, helmet:1, pad:1, jer:i<11?RED:WHT, pants:GOLD, sp:5.6+srnd()*1.6});
  for(i=0;i<2;i++) add({team:2, helmet:0, pad:0, jer:0x1C1C1C, pants:0x1C1C1C, sc:1.04, sp:5});
  var SIDE=[];
  [[0,1],[1,-1]].forEach(function(q){            /* cardinal on the +v sideline, white on the -v */
    for(var k=0;k<24;k++){
      var row=k%3, u=-21+(k/3|0)*5.6+row*1.7+(srnd()-0.5)*2.2, v=q[1]*(HV+1.4+row*0.9+(srnd()-0.5)*0.6);
      SIDE.push(add({team:3+q[0], side:q[1], helmet:srnd()<0.6?1:0, pad:1, jer:q[0]?WHT:RED, pants:GOLD, u:u, v:v,
        fu:0, fv:-q[1], hu:u, hv:v, sp:4}));
    }
  });
  var COACH=[];
  [[1,[[-6,0x9D2235],[3,0x1E1E22],[11,0x9D2235]]],[-1,[[-9,0x1E1E22],[1,0x9D2235],[8,0xF2F2EE]]]].forEach(function(q){
    q[1].forEach(function(c){ COACH.push(add({team:5, side:q[0], helmet:0, pad:0, jer:c[1], pants:0xB8A47E, sc:1.05,
      u:c[0], v:q[0]*(HV+0.4), fu:0, fv:-q[0], hu:c[0], hv:q[0]*(HV+0.4), sp:3})); });
  });
  /* the news crew: two camera operators at tripods and a reporter with each, plus a crew at the end zone */
  var MEDIA=[], CAMS=[[30,HV+2.4],[34,HV+2.6],[-30,-(HV+2.6)],[HU+1.6,8],[HU+1.6,-6]];
  CAMS.forEach(function(q,ci){
    var fu=q[0]>HU?-1:0, fv=q[0]>HU?0:(q[1]>0?-1:1);
    MEDIA.push(add({team:6, helmet:0, pad:0, jer:[0x2C2E33,0x3A4A5E,0x1E1E22,0x5A5E66,0x2C2E33][ci], pants:0x2A2A2E, sc:1.04,
      u:q[0], v:q[1], fu:fu, fv:fv, hu:q[0], hv:q[1], cam:1}));
    if(ci<3) MEDIA.push(add({team:6, helmet:0, pad:0, jer:[0x2C3E5C,0xB0202A,0xE8E4DA][ci], pants:[0x2A2A2E,0x2C3E5C,0x6B7A8F][ci], sc:1.02,
      u:q[0]+1.6, v:q[1]+(q[1]>0?0.3:-0.3), fu:-1, fv:0, hu:q[0]+1.6, hv:q[1]+(q[1]>0?0.3:-0.3), mic:1}));
  });
  var NI=E.length;

  /* static kit: tripods and cameras, team benches, a water table, a down marker */
  (function(){
    var M=new Mesher();
    CAMS.forEach(function(q){
      var fu=q[0]>HU?-1:0, fv=q[0]>HU?0:(q[1]>0?-1:1), b=P(q[0]+fu*0.7,q[1]+fv*0.7);
      for(var k=0;k<3;k++){ var a=k/3*6.2832, f=P(q[0]+fu*0.7+Math.cos(a)*0.35,q[1]+fv*0.7+Math.sin(a)*0.35);
        segBox(M,[f[0],f[1]],[b[0],b[1]],0,0.05,0.04,0x2A2C30,0.8); postAt(M,f[0],f[1],0,1.25,0.03,0x2A2C30,0.8); }
      postAt(M,b[0],b[1],1.2,1.45,0.08,0x2A2C30,0.8);
      var cf=P(q[0]+fu*0.75,q[1]+fv*0.75), ck=P(q[0]+fu*1.05,q[1]+fv*1.05);
      postAt(M,cf[0],cf[1],1.45,1.75,0.17,0x1C1D20,0.85);
      postAt(M,ck[0],ck[1],1.52,1.68,0.09,0x111214,0.9);
    });
    /* benches behind each team */
    [1,-1].forEach(function(s){
      for(var k=0;k<4;k++){ var a=P(-18+k*10,s*(HV+3.6)), b=P(-12+k*10,s*(HV+3.6));
        segBox(M,a,b,0.42,0.5,0.4,0xC8C2B4,0.85); postAt(M,a[0],a[1],0,0.42,0.06,0x8A8E92,0.8); postAt(M,b[0],b[1],0,0.42,0.06,0x8A8E92,0.8); }
      var w=P(16,s*(HV+3.4)); postAt(M,w[0],w[1],0,0.8,0.45,0xE6E2D8,0.85);
      [-0.25,0.25].forEach(function(o){ var j=P(16+o,s*(HV+3.4)); postAt(M,j[0],j[1],0.8,1.3,0.14,0xE84C1E,0.9); });
    });
    var m=new T.Mesh(M.geom(),matWorld); m.frustumCulled=false; m.castShadow=true; scene.add(m);
  })();

  var mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  function mk(g){ var m=new T.InstancedMesh(g.geom(),mat,NI); m.frustumCulled=false;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.raycast=function(){}; scene.add(m); return m; }
  var IH=mk(head), IHM=mk(helm), IB=mk(body), IP=mk(pads), IAL=mk(arm), IAR=mk(arm), ILL=mk(leg), ILR=mk(leg),
      PARTS=[IH,IHM,IB,IP,IAL,IAR,ILL,ILR];
  var col=new T.Color();
  function tint(m,i,hex){ col.setHex(hex); m.setColorAt(i,col); }
  E.forEach(function(p,i){
    var sk=SKIN[(srnd()*SKIN.length)|0];
    tint(IH,i,sk); tint(IHM,i,0xFFFFFF); tint(IB,i,p.jer); tint(IP,i,p.jer); tint(IAL,i,p.pad?p.jer:sk); tint(IAR,i,p.pad?p.jer:sk);
    tint(ILL,i,p.pants); tint(ILR,i,p.pants);
  });
  PARTS.forEach(function(m){ m.instanceColor.needsUpdate=true; });
  var ballM=new T.Mesh(new T.IcosahedronGeometry(0.13,1).scale(1,1,1.75),new T.MeshLambertMaterial({color:0x7A3E1E,flatShading:true}));
  ballM.castShadow=true; ballM.raycast=function(){}; scene.add(ballM);

  /* ---------------- poses (the students' joints) ---------------- */
  var _r=new T.Matrix4(), _p=new T.Matrix4(), _o=new T.Matrix4(), _q=new T.Quaternion(), _v=new T.Vector3(), _s=new T.Vector3(1,1,1),
      _e=new T.Euler(0,0,0,'YXZ'), _z=new T.Matrix4().makeScale(0,0,0);
  function part(m,i,x,y,z,rx){ _e.set(rx,0,0); _q.setFromEuler(_e); _p.compose(_v.set(x,y,z),_q,_s); m.setMatrixAt(i,_o.multiplyMatrices(_r,_p)); }
  function root(i,u,v,y,fu,fv,sc,pitch){
    var p=P(u,v), wx=fu*DU[0]+fv*DV[0], wz=fu*DU[1]+fv*DV[1];
    _e.set(pitch||0,Math.atan2(-wx,-wz),0); _q.setFromEuler(_e); _s.set(sc,sc,sc);
    _r.compose(_v.set(p[0],y,p[1]),_q,_s); _s.set(1,1,1);
  }
  function kit(i,p,hy,hz,hr){
    part(IH,i,0,hy,hz,hr);
    if(p.helmet) part(IHM,i,0,hy,hz,hr); else IHM.setMatrixAt(i,_z);
    if(p.pad) part(IP,i,0,0.34,0,0); else IP.setMatrixAt(i,_z);
  }
  function poseRun(i,p,amp,armR){
    var sw=Math.sin(p.ph)*amp, bob=Math.abs(Math.cos(p.ph))*0.06*amp;
    root(i,p.u,p.v,0.13+bob+p.jump,p.fu,p.fv,p.sc);
    part(IB,i,0,0.34,0,-0.12*amp); kit(i,p,0.735,0,sw*0.04);
    var up=p.jump>0.02?2.7:0;
    part(IAL,i,-0.295,0.74,0,up||-sw*0.9); part(IAR,i,0.295,0.74,0,armR!==undefined?armR:(up||sw*0.9));
    part(ILL,i,-0.125,0.36,0,sw*1.0); part(ILR,i,0.125,0.36,0,-sw*1.0);
  }
  function poseStance(i,p,three){
    root(i,p.u,p.v,0.0,p.fu,p.fv,p.sc);
    part(IB,i,0,0.30,-0.05,-0.75); kit(i,p,0.62,-0.27,0.5);
    part(IAL,i,-0.295,0.62,-0.2,three?1.0:0.6); part(IAR,i,0.295,0.62,-0.2,three?1.45:0.6);
    part(ILL,i,-0.14,0.36,0,0.55); part(ILR,i,0.14,0.36,0.05,-0.15);
  }
  function poseDown(i,p){
    root(i,p.u,p.v,0.36,p.fu,p.fv,p.sc,-1.45);
    part(IB,i,0,0.34,0,0); kit(i,p,0.735,0,-0.3);
    part(IAL,i,-0.295,0.74,0,2.6); part(IAR,i,0.295,0.74,0,2.2);
    part(ILL,i,-0.125,0.36,0,0.15); part(ILR,i,0.125,0.36,0,-0.1);
  }
  function poseIdle(i,p,t,cheer){
    var hop=cheer?Math.max(0,Math.sin(t*9+p.ph*3.1))*0.2:0, sway=Math.sin(t*0.9+p.ph)*0.05;
    root(i,p.u,p.v,0.13+hop,p.fu,p.fv,p.sc);
    part(IB,i,0,0.34,0,sway*0.4); kit(i,p,0.735,0,sway);
    var al=cheer?2.7+Math.sin(t*11+p.ph)*0.3:0.12, ar=al;
    if(p.cam){ al=2.2; ar=2.5; }                       /* hands up on the camera */
    if(p.mic&&!cheer) ar=1.5;                          /* microphone */
    part(IAL,i,-0.295,0.74,0,al); part(IAR,i,0.295,0.74,0,ar);
    part(ILL,i,-0.125,0.36,0,0); part(ILR,i,0.125,0.36,0,0);
  }

  /* ---------------- formations ---------------- */
  var OFF=[[-0.7,0],[-0.7,-1.3],[-0.7,1.3],[-0.7,-2.6],[-0.7,2.6],[-0.8,3.9],[-0.7,-15],[-0.7,15],[-1.5,-8.5],[-4.6,0],[-4.8,-1.6]];
  var DEF=[[0.8,-1.0],[0.8,1.0],[0.8,-3.4],[0.8,3.4],[4.5,0],[4.5,-4.2],[4.5,4.2],[6.5,-15],[6.5,15],[11,-6],[11,6]];
  function clamp(x,a,b){ return x<a?a:(x>b?b:x); }
  function spot(p,los,bv){ var f=p.team===0?OFF[p.k]:DEF[p.k]; return [los+f[0], clamp(bv+f[1],-HWP-4,HWP+4)]; }

  /* ---------------- movement ---------------- */
  function turn(p,nu,nv,k){ k=Math.min(1,k); p.fu+=(nu-p.fu)*k; p.fv+=(nv-p.fv)*k; var l=Math.hypot(p.fu,p.fv)||1; p.fu/=l; p.fv/=l; }
  function moveTo(p,tu,tv,mx,dt){
    var a=tu-p.u, b=tv-p.v, L=Math.hypot(a,b), want=L<0.25?0:Math.min(mx,L*1.8);
    p.spd+=(want-p.spd)*Math.min(1,dt*3.5);
    if(L>0.05) turn(p,a/L,b/L,dt*(p.spd>3?6:9));
    p.u+=p.fu*p.spd*dt; p.v+=p.fv*p.spd*dt;
  }
  function face(p,tu,tv,dt){ var a=tu-p.u, b=tv-p.v, L=Math.hypot(a,b); if(L>0.3) turn(p,a/L,b/L,dt*4); }

  /* ---------------- the game ---------------- */
  var G={st:'huddle',t:4,los:-GL+22,bv:0,down:1,togo:10*0.9144,first:-GL+22+10*0.9144,type:'run',hold:-1,clock:0,
         score:0,plays:0,gain:0,tgt:-1,ball:{u:0,v:0,h:0.2,fl:0,ft:0,u0:0,v0:0,u1:0,v1:0},lastCheer:0,dcheer:0};
  var ROUTE=[];
  for(i=0;i<22;i++){ var s0=spot(E[i],G.los,G.bv); E[i].u=s0[0]-(E[i].team===0?6:-5); E[i].v=s0[1]*0.4; }
  function holder(){ return G.hold>=0?E[G.hold]:null; }
  function nearestDef(p){ var b=null, bd=1e9; for(var j=11;j<22;j++){ var q=E[j], d=Math.hypot(q.u-p.u,q.v-p.v); if(d<bd){ bd=d; b=q; } } return [b,bd]; }
  function snap(){
    G.st='play'; G.t=0; G.type=srnd()<0.55?'run':'pass'; G.hold=9; G.tgt=-1; G.thrown=0; G.hand=0;
    G.gap=(srnd()<0.5?-1:1)*(1.2+srnd()*3);
    ROUTE=[];
    [5,6,7,8].forEach(function(k){                       /* routes: stem upfield, then break in or out */
      var p=E[k], st=6+srnd()*10, br=(srnd()<0.5?-1:1)*(4+srnd()*7);
      if(k===5) { st=4+srnd()*3; br=(p.v>G.bv?1:-1)*3; }
      ROUTE[k]=[[p.u+st,p.v],[p.u+st+5,clamp(p.v+br,-HWP,HWP)]];
    });
    for(i=0;i<22;i++) E[i].down=0;
  }
  function whistle(spotU,why){
    G.st='dead'; G.t=3.2; G.why=why;
    var gain=spotU-G.los; G.gain=gain;
    if(why==='td'){ G.st='td'; G.t=5; G.score+=7; return; }
    if(why!=='inc') G.los=clamp(spotU,-GL+1,GL-1);
    var b=holder(); if(b) G.bv=clamp(b.v,-6,6);
    if(G.los>=G.first){ G.down=1; G.first=G.los+10*0.9144; }
    else if(++G.down>4){ G.down=1; G.first=G.los+10*0.9144; }   /* a scrimmage: just run the next series */
    G.dcheer=(why==='inc'||gain<0.5)?2.5:0;              /* the white sideline enjoys a stop */
  }
  function play(dt){
    var b=G.ball, h=holder(), p, k, j;
    G.t+=dt;
    /* the snap: the ball goes back to the quarterback */
    var QB=E[9], RB=E[10];
    if(G.type==='run'){
      if(!G.hand){
        moveTo(QB,G.los-3.2,G.bv+G.gap*0.4,4,dt);
        moveTo(RB,G.los-2.4,G.bv+G.gap,5.5,dt);
        if(G.t>0.9&&Math.hypot(QB.u-RB.u,QB.v-RB.v)<1.4){ G.hand=1; G.hold=10; }
      }
    } else {
      if(!G.thrown){
        moveTo(QB,G.los-7,G.bv,4.2,dt);
        moveTo(RB,G.los-5.6,G.bv+1.8,3,dt);
        if(G.t>2.4+srnd()*0.02){
          /* throw to whoever is most open */
          var best=-1, bs=-1;
          [5,6,7,8].forEach(function(k2){ var r=E[k2], nd=nearestDef(r)[1]+r.u*0.05; if(nd>bs){ bs=nd; best=k2; } });
          var r=E[best], d=Math.hypot(r.u-QB.u,r.v-QB.v), ft=clamp(d/17,0.6,1.7);
          b.u0=QB.u; b.v0=QB.v; b.u1=r.u+r.fu*r.spd*ft; b.v1=clamp(r.v+r.fv*r.spd*ft,-HWP-3,HWP+3);
          b.fl=0; b.ft=ft; G.thrown=1; G.tgt=best; G.hold=-1; QB.throwT=0.4;
        }
      }
    }
    h=holder();
    /* the ball in the air */
    if(G.thrown===1){
      b.fl+=dt; var f=Math.min(1,b.fl/b.ft);
      b.u=b.u0+(b.u1-b.u0)*f; b.v=b.v0+(b.v1-b.v0)*f; b.h=1.9+Math.sin(Math.PI*f)*(2+b.ft*3);
      var R=E[G.tgt]; moveTo(R,b.u1,b.v1,R.sp,dt);
      if(f>=1){
        var nd=nearestDef(R);
        if(Math.hypot(R.u-b.u1,R.v-b.v1)<1.7&&!(nd[1]<1.2&&srnd()<0.4)){ G.thrown=2; G.hold=G.tgt; }
        else { G.thrown=3; b.fl=0; nd[0].jump=0.4; whistle(G.los,'inc'); return; }
      }
    }
    h=holder();
    /* offense */
    for(k=0;k<11;k++){ p=E[k];
      if(p===h) continue;
      if(k<5||(k===5&&G.type==='run')){                  /* the line blocks the man across */
        var dl=E[[11,11,12,13,14][k]||15];
        var tu=h&&G.hold!==9?dl.u:Math.min(dl.u,G.los+0.6), tv=dl.v;
        moveTo(p,tu-0.9,tv,2.6,dt); continue; }
      if(k===9&&p!==h){ if(G.type==='pass'&&G.thrown) moveTo(p,p.u,p.v,1,dt); else if(G.hand) moveTo(p,p.u-1,p.v-G.gap*0.5,3,dt); continue; }
      if(k===10&&(G.type==='pass'||!G.hand)){ continue; }
      if(ROUTE[k]&&!(G.thrown>=2)){
        var rt=ROUTE[k], w=rt[0], dd=Math.hypot(w[0]-p.u,w[1]-p.v);
        if(dd<1.2&&rt.length>1) rt.shift();
        if(!(G.thrown===1&&k===G.tgt)) moveTo(p,w[0],w[1],p.sp,dt);
      } else if(h){ var nd2=nearestDef(h)[0]; moveTo(p,nd2.u-0.8,nd2.v,p.sp*0.8,dt); }
    }
    /* the ball carrier: upfield, away from the nearest tackler */
    if(h&&G.hold!==9){
      var nd3=nearestDef(h), q=nd3[0], away=q?clamp((h.v-q.v)*0.6,-3,3):0;
      if(h===RB&&G.type==='run'&&G.t<1.6) moveTo(h,G.los+1.5,G.bv+G.gap,h.sp*0.8,dt);
      else moveTo(h,h.u+8,clamp(h.v+away,-HV+2,HV-2),h.sp*(G.thrown===2?0.95:1.05),dt);
    }
    /* defense */
    for(k=11;k<22;k++){ p=E[k]; var dk=k-11;
      if(p.down>0){ p.spd=0; continue; }
      if(dk<4){                                          /* rush; slowed by the blocker in front */
        var tgt=h||QB, blk=null;
        for(var ob=0;ob<6;ob++){ if(Math.hypot(E[ob].u-p.u,E[ob].v-p.v)<1.25){ blk=E[ob]; break; } }
        var eng=blk&&G.t<3.5;
        moveTo(p,tgt.u,tgt.v,eng?0.3:p.sp*0.7,dt);
        if(eng&&G.type==='run'){ p.u+=0.9*dt; blk.u+=0.9*dt; }   /* the line drives them back */
      } else if(G.thrown===1){                           /* everybody to the ball */
        moveTo(p,b.u1,b.v1,p.sp*(dk>=7?1:0.85),dt);
      } else if(h&&(G.type==='run'&&G.hand&&(G.t>1.3||dk>=7)||G.thrown===2)){ /* pursue with a lead; the linebackers read the run first */
        moveTo(p,h.u+h.fu*h.spd*0.35,h.v+h.fv*h.spd*0.35,p.sp*(dk<7?0.95:1),dt);
      } else if(dk<7){ moveTo(p,G.los+7,p.v*0.98+(QB.v-p.v)*0.02,2.5,dt); face(p,QB.u,QB.v,dt); }
      else if(dk<9){ var wr=E[dk===7?6:7]; moveTo(p,wr.u+1.6,wr.v,p.sp*0.96,dt); }
      else { moveTo(p,Math.max(G.los+13,p.u),p.v,3,dt); face(p,QB.u,QB.v,dt); }
    }
    /* tackles, the sideline, the end zone, the clock */
    h=holder();
    if(h&&(G.type==='pass'?G.thrown===2:G.hand)){
      for(j=11;j<22;j++){ var t2=E[j]; if(t2.down>0||t2.miss>0) continue;
        if(Math.hypot(t2.u-h.u,t2.v-h.v)<0.95){
          if(srnd()<0.4){ t2.down=1.1; t2.miss=2.5; continue; }          /* broken tackle */
          h.down=1.8; t2.down=1.6; t2.u=h.u-0.4; whistle(h.u,'tackle'); return; } }
      if(Math.abs(h.v)>HV-1) { whistle(h.u,'out'); return; }
      if(h.u>GL+0.5){ whistle(h.u,'td'); return; }
    } else if(G.type==='run'&&!G.hand&&G.t>2.5){ G.hand=1; G.hold=10; }
    if(G.t>9){ whistle(h?h.u:G.los,'tackle'); }
  }
  function step(dt){
    var i, p, b=G.ball, h=holder();
    G.clock+=dt; if(G.dcheer>0) G.dcheer-=dt;
    for(i=0;i<NI;i++){ p=E[i]; if(p.down>0) p.down-=dt; if(p.jump>0&&G.st!=='td') p.jump=Math.max(0,p.jump-dt*1.5); if(p.throwT>0) p.throwT-=dt; if(p.miss>0) p.miss-=dt; }
    if(G.st==='huddle'){
      for(i=0;i<22;i++){ p=E[i]; var o=p.team===0, a=(p.k/11)*6.2832, r=o?2.3:2.8,
          cu=G.los+(o?-8:7), cv=G.bv;
        if(p.down>0) continue;
        moveTo(p,cu+Math.cos(a)*r,cv+Math.sin(a)*r,3.2,dt); if(p.spd<0.6) face(p,cu,cv,dt); }
      G.t-=dt; if(G.t<=0){ G.st='line'; G.t=0; }
    } else if(G.st==='line'){
      G.t+=dt; var far=0;
      for(i=0;i<22;i++){ p=E[i]; var s=spot(p,G.los,G.bv); moveTo(p,s[0],s[1],3.4,dt);
        if(p.spd<0.5) turn(p,p.team===0?1:-1,0,dt*5);
        if(Math.hypot(p.u-s[0],p.v-s[1])>0.6) far++; }
      if((far===0&&G.t>2)||G.t>7){ G.st='set'; G.t=1.2; }
    } else if(G.st==='set'){
      for(i=0;i<22;i++){ p=E[i]; p.spd*=0.8; turn(p,p.team===0?1:-1,0,dt*6); }
      G.t-=dt; if(G.t<=0) snap();
    } else if(G.st==='play'){ play(dt); }
    else {                                                /* after the whistle; a touchdown first celebrates */
      G.t-=dt;
      for(i=0;i<22;i++){ p=E[i]; if(p.down>0) { p.spd=0; continue; }
        if(G.st==='td'&&p.team===0){ moveTo(p,h?h.u-1.5+(p.k%3):GL,h?h.v+(p.k-5)*0.8:0,3,dt); p.jump=Math.max(0,Math.sin(G.clock*7+p.k))*0.45; }
        else { p.spd*=Math.exp(-dt*1.6); p.u+=p.fu*p.spd*dt; p.v+=p.fv*p.spd*dt; } }
      if(G.t<=0){
        if(G.st==='td'){ G.los=-GL+22; G.bv=0; G.down=1; G.first=G.los+10*0.9144; for(i=0;i<22;i++) E[i].jump=0; }
        G.st='huddle'; G.t=4.5; G.hold=-1; G.thrown=0; G.plays++;
      }
    }
    /* the officials trail the play */
    var bu=h?h.u:(G.thrown===1?b.u:G.los), bvv=h?h.v:G.bv;
    moveTo(E[22],clamp(bu+9,-HU,HU),clamp(bvv*0.5+3,-HWP,HWP),5,dt); face(E[22],bu,bvv,dt);
    moveTo(E[23],clamp(bu-1,-HU,HU),HV*0.5,4,dt); face(E[23],bu,bvv,dt);
    /* the sidelines turn to follow the ball and drift a little */
    for(i=24;i<NI;i++){ p=E[i]; if(p.cam&&p.u>HU) { face(p,bu,bvv,dt*0.5); continue; }
      face(p,bu,bvv,dt*0.6); p.u+=(p.hu+Math.max(-4,Math.min(4,(bu-p.hu)*0.12))-p.u)*Math.min(1,dt*0.4); }
    /* nobody stands inside anybody on the field */
    for(i=0;i<24;i++) for(var j=i+1;j<24;j++){
      var A=E[i], B=E[j], du=B.u-A.u, dv=B.v-A.v, d2=du*du+dv*dv;
      if(d2<0.64&&d2>1e-6&&!(A.down>0||B.down>0)){ var dd=Math.sqrt(d2), push=(0.8-dd)*0.5/dd; A.u-=du*push; A.v-=dv*push; B.u+=du*push; B.v+=dv*push; }
    }
    for(i=0;i<24;i++){ p=E[i]; p.u=clamp(p.u,-HU-2,HU+2); p.v=clamp(p.v,-HV+0.5,HV-0.5); p.ph+=dt*(1.5+p.spd*2.3); }
    /* where the ball is */
    h=holder();
    if(G.thrown===1){ /* set in play() */ }
    else if(h&&G.st!=='huddle'&&G.st!=='line'&&G.st!=='set'){ b.u=h.u+h.fu*0.3; b.v=h.v+h.fv*0.3; b.h=h.down>0?0.3:1.15; }
    else if(G.thrown===3){ b.fl+=dt; b.h=Math.max(0.12,b.h-dt*6); }
    else { b.u=G.los+0.1; b.v=G.bv; b.h=0.2; }
  }
  function draw(){
    var t=G.clock, redCheer=G.st==='td', whiteCheer=G.dcheer>0;
    for(var i=0;i<NI;i++){ var p=E[i];
      if(p.down>0) poseDown(i,p);
      else if(i<22&&G.st==='set'&&((p.team===0&&p.k<6)||(p.team===1&&p.k<4))) poseStance(i,p,true);
      else if(i<24) poseRun(i,p,Math.min(1,p.spd/2.4),p.throwT>0?2.9:undefined);
      else poseIdle(i,p,t,(p.team===3&&redCheer)||(p.team===4&&whiteCheer)||(p.team===5&&redCheer&&p.side>0));
    }
    PARTS.forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
    var b=G.ball, bp=P(b.u,b.v), h=holder(), fu=h?h.fu:1, fv=h?h.fv:0;
    if(G.thrown===1){ fu=b.u1-b.u0; fv=b.v1-b.v0; }
    ballM.position.set(bp[0],b.h,bp[1]);
    var wx=fu*DU[0]+fv*DV[0], wz=fu*DU[1]+fv*DV[1];
    ballM.rotation.set(G.thrown===1?-0.3:0,Math.atan2(wx,wz),0);
  }
  step(0.016); draw();
  var near=true;
  updateFootball=function(dt){
    var dx=camera.position.x-C[0], dz=camera.position.z-C[1], nr=dx*dx+dz*dz<320*320;
    if(nr!==near){ near=nr; PARTS.forEach(function(m){ m.visible=nr; }); ballM.visible=nr; }
    if(!nr) return;
    dt=Math.min(dt,0.05);
    step(dt); draw();
  };
  window.__football={n:NI,state:function(){ return {st:G.st,type:G.type,los:+G.los.toFixed(1),down:G.down,score:G.score,plays:G.plays,why:G.why,gain:+(G.gain||0).toFixed(1)}; },
    look:function(){ var e=P(G.los-16,-(HV+7)), t=P(G.los+3,G.bv); return [e[0],7,e[1],t[0],0.5,t[1]]; }};
})();
