/* ==================================================================
   Game day in Alumni Park, in front of Doheny Library: the same tailgates
   as McCarthy Quad (a2zf_tailgate.js, whose kit TGK this borrows) on the
   park's four lawns, plus dance circles round speakers on the open grass,
   fans in Tommy Trojan costumes (gold helmet with a red crest, red cape,
   sword and shield), pairs throwing footballs, a group throwing a
   frisbee with a dog chasing it, and a second dog wandering the party.
   Frame: ALUM (u along the library front, v out into the park), turned
   right handed here if need be. Only the open lawn is used: clear of the
   walks and their hedges and lamps, the fountain plaza and its hedge
   ring, the cross walk, the SC bed and every tree trunk.
   Self-contained like a2zf: its own random numbers, no colliders, nothing
   pushed into the shared lists, so the rest of the map and the crowd are
   unchanged. All instanced; it animates only near the camera and hides
   when far away. It chains onto updateTailgate.
   ================================================================== */
(function(){
  if(!ALUM||!TGK) return;
  var K=TGK, F=ALUM.F, FV=ALUM.FV, VB=ALUM.VB, BW=ALUM.BW, U=ALUM.U, V1=ALUM.V1;
  /* a right handed frame: flip u if the library frame is mirrored (the park is symmetric in u) */
  var SG=(F.dx*F.nz-F.dz*F.nx)<0?-1:1;
  var DU=[F.dx*SG,F.dz*SG], DV=[F.nx,F.nz];
  function P(u,v){ return ALUM.P(u*SG,v); }
  var YAW0=Math.atan2(-DU[1],DU[0]);
  var seed=19340425;
  function rr(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  function rb(a,b){ return a+(b-a)*rr(); }
  function rot(x,z,a){ var c=Math.cos(a), s=Math.sin(a); return [x*c+z*s,-x*s+z*c]; }
  function wdir(fu,fv){ return [fu*DU[0]+fv*DV[0],fu*DU[1]+fv*DV[1]]; }
  function yawOf(wx,wz){ return Math.atan2(-wx,-wz); }

  /* ---------------- where things may go ---------------- */
  var TREES=[];
  for(var ti=0;ti<TREE_POS.length;ti++){ var l=ALUM.loc(TREE_POS[ti]); if(l[0]>-U-6&&l[0]<U+6&&l[1]>-2&&l[1]<V1+6) TREES.push([l[0]*SG,l[1]]); }
  var WALKS=PATHS.filter(function(p){ return !p.hide&&p.w>=2.5; });
  function segD(p,a,b){ var dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1,
    t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2)); return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t); }
  function offWalks(p,pad){
    for(var i=0;i<WALKS.length;i++){ var w=WALKS[i].w, hw=(w>6?w*1.5+2.3:w*1.3+1.0)/2+pad, q=WALKS[i].pts;
      for(var k=0;k<q.length-1;k++) if(segD(p,q[k],q[k+1])<hw) return false; }
    return true;
  }
  /* anything solid already in the park (the hedge rows round the lawns, benches, lamps): read, never changed */
  var BB=[[-U-8,-4],[U+8,-4],[U+8,V1+8],[-U-8,V1+8]].map(function(q){ return P(q[0],q[1]); });
  var bx0=Math.min.apply(null,BB.map(function(q){ return q[0]; })), bx1=Math.max.apply(null,BB.map(function(q){ return q[0]; })),
      bz0=Math.min.apply(null,BB.map(function(q){ return q[1]; })), bz1=Math.max.apply(null,BB.map(function(q){ return q[1]; }));
  var CL=COLLIDERS.filter(function(c){ return c.h<6&&c.x1>bx0&&c.x0<bx1&&c.z1>bz0&&c.z0<bz1; });
  function nearCol(x,z,m){
    for(var i=0;i<CL.length;i++){ var c=CL[i]; if(x<c.x0-m||x>c.x1+m||z<c.z0-m||z>c.z1+m) continue;
      if(inRing(c.ring,x,z)) return true;
      for(var k=0;k<c.ring.length;k++) if(segD([x,z],c.ring[k],c.ring[(k+1)%c.ring.length])<m) return true; }
    return false;
  }
  /* m: how far it must keep from the edges; tr: how far from a tree trunk */
  function ok(u,v,m,tr){
    var au=Math.abs(u);
    if(au<7.2+m||au>U-3-m||v<8+m||v>V1-3-m) return false;
    if(Math.abs(v-FV)<4.2+m) return false;
    if(Math.hypot(u,v-FV)<15.4+m) return false;
    if(au<BW+2+m&&Math.abs(v-VB)<15+m) return false;
    for(var i=0;i<TREES.length;i++) if(Math.hypot(u-TREES[i][0],v-TREES[i][1])<(tr===undefined?2.4+m:tr)) return false;
    var p=P(u,v);
    if(inPlaza(p[0],p[1])||!offWalks(p,0.6)||nearCol(p[0],p[1],0.5+m*0.8)) return false;
    return true;
  }

  /* ---------------- the canopies first ---------------- */
  var TENTS=[[],[]], TABLES=[], CHAIRS=[], COOLR=[], COOLW=[], FLAGS=[], SPEAK=[], FANS=[], OB=[];
  function put(list,u,v,yawLocal,y){ var p=P(u,v); list.push([p[0],y||0,p[1],YAW0+yawLocal]); }
  var SITES=[];
  /* ---------------- first the games, on clear lanes: football pairs and a frisbee group ---------------- */
  function laneClear(a,b){
    for(var t=0;t<=1.0001;t+=0.1){ var u=a[0]+(b[0]-a[0])*t, v=a[1]+(b[1]-a[1])*t;
      if(!ok(u,v,0.4,1.8)||underTent(u,v,null,0.6)) return false; }
    return true;
  }
  function spotPair(len){
    for(var tries=0;tries<400;tries++){
      var a=[rb(-U,U),rb(8,V1)], ang=rb(0,6.283), b=[a[0]+Math.cos(ang)*len,a[1]+Math.sin(ang)*len];
      if(!laneClear(a,b)||!clear(a[0],a[1],1.4)||!clear(b[0],b[1],1.4)) continue;
      return [a,b];
    }
    return null;
  }
  var GAMES=[], RES=[];      /* RES: the lanes and the frisbee ring, kept free of canopies */
  for(var gi=0;gi<3;gi++){
    var pr=spotPair(rb(10,14)); if(!pr) continue;
    var dx=pr[1][0]-pr[0][0], dz=pr[1][1]-pr[0][1], dl=Math.hypot(dx,dz);
    var A=fan(pr[0][0],pr[0][1],dx/dl,dz/dl,{role:'fb'}), Bf=fan(pr[1][0],pr[1][1],-dx/dl,-dz/dl,{role:'fb'});
    GAMES.push({kind:'fb',p:[A,Bf],hold:0,t:0,fly:-1,wait:rb(0.5,2),ball:null});
    OB.push([pr[0][0],pr[0][1],1.0],[pr[1][0],pr[1][1],1.0]); RES.push({a:pr[0],b:pr[1],r:3.2});
  }
  /* the frisbee: three in a triangle */
  (function(){
    for(var tries=0;tries<3000;tries++){
      var c=[rb(-U,U),rb(8,V1)], r=rb(4.3,5.6), a0=rb(0,6.283), pts=[];
      for(var k=0;k<3;k++) pts.push([c[0]+Math.cos(a0+k*2.094)*r,c[1]+Math.sin(a0+k*2.094)*r]);
      if(!laneClear(pts[0],pts[1])||!laneClear(pts[1],pts[2])||!laneClear(pts[2],pts[0])||!ok(c[0],c[1],0.5,1.8)) continue;
      if(!pts.every(function(p){ return clear(p[0],p[1],1.4); })) continue;
      var ps=pts.map(function(p){ var tu=c[0]-p[0], tv=c[1]-p[1], tl=Math.hypot(tu,tv); return fan(p[0],p[1],tu/tl,tv/tl,{role:'fz'}); });
      GAMES.push({kind:'fz',p:ps,hold:0,to:1,t:0,fly:-1,wait:1,c:c,r:r}); RES.push({c:c,r:r+2.6});
      pts.forEach(function(p){ OB.push([p[0],p[1],1.0]); });
      OB.push([c[0],c[1],r*0.8]);
      return;
    }
  })();

  for(var gv=8;gv<=V1;gv+=6.2) for(var gu=-U;gu<=U;gu+=5.8){
    var cu=gu+rb(-0.9,0.9)+((Math.round(gv/6.2)%2)?2.1:0), cv=gv+rb(-0.9,0.9);
    if(!ok(cu,cv,2.2,4.6)||rr()<0.06||reserved(cu,cv)) continue;
    SITES.push({u:cu,v:cv,a:Math.floor(rr()*4)*Math.PI/2+rb(-0.08,0.08),gold:rr()<0.24});
  }
  function reserved(u,v){ for(var i=0;i<RES.length;i++){ var q=RES[i];
    if(q.c?Math.hypot(u-q.c[0],v-q.c[1])<q.r:segD([u,v],q.a,q.b)<q.r) return true; } return false; }
  function underTent(u,v,own,m){
    for(var i=0;i<SITES.length;i++){ var S=SITES[i]; if(S===own) continue;
      var q=rot(u-S.u,v-S.v,-S.a); if(Math.abs(q[0])<1.5+m&&Math.abs(q[1])<1.5+m) return true; }
    return false;
  }
  function clear(u,v,r){ for(var i=0;i<OB.length;i++){ var q=OB[i]; if(Math.hypot(u-q[0],v-q[1])<q[2]) return false; }
    for(i=0;i<FANS.length;i++) if(Math.hypot(u-FANS[i].u,v-FANS[i].v)<(r||0.75)) return false; return true; }
  SITES.forEach(function(S){ [[-1.5,-1.5],[1.5,-1.5],[1.5,1.5],[-1.5,1.5]].forEach(function(c){ var o=rot(c[0],c[1],S.a); OB.push([S.u+o[0],S.v+o[1],0.45]); }); });
  function fan(u,v,fu,fv,o){ var f={u:u,v:v,fu:fu,fv:fv,sit:0,dance:0,role:''}; for(var k in o) f[k]=o[k]; FANS.push(f); return f; }
  SITES.forEach(function(S){
    var cu=S.u, cv=S.v, a=S.a, k;
    put(TENTS[S.gold?1:0],cu,cv,a);
    var o=rot(0,-0.35,a); put(TABLES,cu+o[0],cv+o[1],a);
    var nc=1+Math.floor(rr()*3);
    for(k=0;k<nc;k++){ var cx=-1.0+k*1.0+rb(-0.15,0.15), oc=rot(cx,0.62,a), ca=a+rb(-0.35,0.35); put(CHAIRS,cu+oc[0],cv+oc[1],ca); OB.push([cu+oc[0],cv+oc[1],0.55]);
      if(rr()<0.75) fan(cu+oc[0],cv+oc[1],-Math.sin(ca),-Math.cos(ca),{sit:1}); }
    var ncool=1+(rr()<0.55?1:0);
    for(k=0;k<ncool;k++){ var side=ncool===1?(rr()<0.5?-1:1):(k?1:-1), ok2=rot(side*rb(0.45,1.25),-1.55-rb(0,0.4),a);
      if(!underTent(cu+ok2[0],cv+ok2[1],S,0.45)&&ok(cu+ok2[0],cv+ok2[1],0,1.2)){ put(rr()<0.7?COOLR:COOLW,cu+ok2[0],cv+ok2[1],a+rb(-0.5,0.5)); OB.push([cu+ok2[0],cv+ok2[1],0.75]); } }
    if(rr()<0.4){ var of=rot(1.6,1.6,a); if(ok(cu+of[0],cv+of[1],0.3,1.2)&&!underTent(cu+of[0],cv+of[1],S,0.3)){ put(FLAGS,cu+of[0],cv+of[1],rb(0,6.28)); OB.push([cu+of[0],cv+of[1],0.4]); } }
    var nf=5+Math.floor(rr()*7), ga=rb(0,6.283), gx=cu+Math.cos(ga)*2.6, gz=cv+Math.sin(ga)*2.6;
    for(k=0;k<nf;k++) for(var tries=0;tries<12;tries++){
      var an=rb(0,6.283), r=rb(0.7,1.9), fu=gx+Math.cos(an)*r, fv=gz+Math.sin(an)*r;
      if(!ok(fu,fv,0.6,1.0)||underTent(fu,fv,null,0.45)||!clear(fu,fv)||reserved(fu,fv)) continue;
      var tu=gx+rb(-0.3,0.3)-fu, tv=gz+rb(-0.3,0.3)-fv, tl=Math.hypot(tu,tv)||1;
      fan(fu,fv,tu/tl,tv/tl,{dance:rr()<0.35?1:0}); break;
    }
  });

  /* ---------------- dance circles round speakers on the open grass ---------------- */
  for(var dv2=10;dv2<V1;dv2+=6.5) for(var du2=-U;du2<=U;du2+=6.5){
    var cu2=du2+rb(-1.5,1.5), cv2=dv2+rb(-1.5,1.5);
    if(!ok(cu2,cv2,2.0,3.0)||underTent(cu2,cv2,null,1.6)||!clear(cu2,cv2,2.4)||reserved(cu2,cv2)||rr()<0.12) continue;
    put(SPEAK,cu2,cv2,rb(0,6.28)); OB.push([cu2,cv2,0.6]);
    var n2=8+Math.floor(rr()*6);
    for(var k2=0;k2<n2;k2++){ var a2=k2/n2*6.283+rb(-0.2,0.2), r2=rb(1.4,2.1), pu=cu2+Math.cos(a2)*r2, pv=cv2+Math.sin(a2)*r2;
      if(!ok(pu,pv,0.6,1.0)||underTent(pu,pv,null,0.45)||!clear(pu,pv)||reserved(pu,pv)) continue;
      fan(pu,pv,(cu2-pu)/r2,(cv2-pv)/r2,{dance:rr()<0.8?1:0}); }
  }

  /* ---------------- three Tommy Trojans among the crowd ---------------- */
  for(var tj=0,tt=0;tj<3&&tt<300;tt++){
    var S2=SITES[(rr()*SITES.length)|0]; if(!S2) break;
    var aj=rb(0,6.283), uj=S2.u+Math.cos(aj)*3.4, vj=S2.v+Math.sin(aj)*3.4;
    if(!ok(uj,vj,0.6,1.2)||underTent(uj,vj,null,0.5)||!clear(uj,vj,1.0)) continue;
    fan(uj,vj,(S2.u-uj)/3.4,(S2.v-vj)/3.4,{role:'troj'}); tj++;
  }

  /* ---------------- build the props ---------------- */
  var ALL=[], lam=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  function inst(geo,mat,list,dyn){
    var im=new T.InstancedMesh(geo,mat,Math.max(1,list.length)), D=new T.Object3D();
    list.forEach(function(q,i){ D.position.set(q[0],q[1],q[2]); D.rotation.set(0,q[3],0); D.updateMatrix(); im.setMatrixAt(i,D.matrix); });
    im.count=list.length; im.frustumCulled=false; im.raycast=function(){};
    if(dyn) im.instanceMatrix.setUsage(T.DynamicDrawUsage);
    scene.add(im); ALL.push(im); return im;
  }
  var tg=K.tentGeom();
  inst(tg,new T.MeshLambertMaterial({map:K.atlas('#A3202F','#F2C230','#9D1B2A','#F2C230'),vertexColors:true,side:T.DoubleSide}),TENTS[0]);
  inst(tg,new T.MeshLambertMaterial({map:K.atlas('#F2C230','#9D1B2A','#A3202F','#F2C230'),vertexColors:true,side:T.DoubleSide}),TENTS[1]);
  inst(K.tab.geom(),lam,TABLES); inst(K.chr.geom(),lam,CHAIRS); inst(K.cR.geom(),lam,COOLR); inst(K.cW.geom(),lam,COOLW); inst(K.flg.geom(),lam,FLAGS);
  var MT=K.MT, BX=K.BX, CY=K.CY;
  var spk=new K.Bag();
  spk.add(BX,MT(0,0.42,0,0.42,0.84,0.36),0x1E1F22); spk.add(CY,MT(0,0.58,-0.185,0.13,0.01,0.13,Math.PI/2),0x4A4C50);
  spk.add(CY,MT(0,0.25,-0.185,0.08,0.01,0.08,Math.PI/2),0x4A4C50); spk.add(BX,MT(0,0.86,0,0.3,0.04,0.06),0xC4161C);
  inst(spk.geom(),lam,SPEAK);

  /* ---------------- the fans ---------------- */
  var NF=FANS.length, mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  function mk(b,n){ var m=new T.InstancedMesh(b.geom(),mat,Math.max(1,n)); m.count=n; m.frustumCulled=false;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.raycast=function(){}; scene.add(m); ALL.push(m); return m; }
  var IH=mk(K.head,NF), IHR=mk(K.hair,NF), ICP=mk(K.cap,NF), IB=mk(K.body,NF), IAL=mk(K.arm,NF), IAR=mk(K.arm,NF),
      ILL=mk(K.leg,NF), ILR=mk(K.leg,NF), ICU=mk(K.cup,NF);
  /* the Trojan's kit: helmet with crest, cape, sword, shield */
  var helm=new K.Bag();
  helm.add(new T.SphereGeometry(0.42,10,6,0,6.283,0,1.75),MT(0,0.42,0.02),0xD9A62E);
  helm.add(BX,MT(0,0.86,0.05,0.09,0.24,0.78),0xC0161E); helm.add(BX,MT(0,0.76,0.42,0.08,0.4,0.18),0xC0161E);
  helm.add(BX,MT(0,0.24,-0.36,0.06,0.3,0.06),0xD9A62E);
  var cape=new K.Bag(); cape.add(BX,MT(0,-0.32,0.06,0.58,0.72,0.03,0.12),0xB3121D);
  var swd=new K.Bag(); swd.add(BX,MT(0,-0.33,-0.34,0.04,0.04,0.62),0xD8DCE0); swd.add(BX,MT(0,-0.33,-0.04,0.18,0.04,0.04),0xC99A2E);
  var shd=new K.Bag(); shd.add(CY,MT(-0.08,-0.2,0,0.32,0.04,0.32,0,0,Math.PI/2),0xD9A62E); shd.add(CY,MT(-0.1,-0.2,0,0.12,0.04,0.12,0,0,Math.PI/2),0xB3121D);
  var TROJ=FANS.filter(function(f){ return f.role==='troj'; });
  var IHE=mk(helm,TROJ.length), ICA=mk(cape,TROJ.length), ISW=mk(swd,TROJ.length), ISH=mk(shd,TROJ.length);
  TROJ.forEach(function(f,k){ f.ti=k; });
  var PARTS=[IH,IHR,ICP,IB,IAL,IAR,ILL,ILR,ICU,IHE,ICA,ISW,ISH];
  var col=new T.Color(), Z=new T.Matrix4().makeScale(0,0,0);
  function tint(m,i,h){ col.setHex(h); m.setColorAt(i,col); }
  FANS.forEach(function(f,i){
    var sk=K.SKIN[(rr()*K.SKIN.length)|0], sh=K.SHIRT[(rr()*K.SHIRT.length)|0], pt=K.PANT[(rr()*K.PANT.length)|0];
    if(f.role==='troj'){ sh=0xD9A62E; pt=0xB3121D; }
    if(f.role==='fb'||f.role==='fz'){ sh=rr()<0.5?0x9D2235:(rr()<0.5?0xF2F1EC:0xF2C230); pt=rr()<0.5?0x2A2A2E:0x9D2235; }
    f.cap=f.role==='troj'?false:rr()<0.55; f.cup=(f.role||f.dance)?(f.dance&&!f.role&&rr()<0.5):rr()<0.75;
    f.sc=rb(1.0,1.16); f.ph=rb(0,6.28); f.sp=rb(0.8,1.25);
    var w=wdir(f.fu,f.fv); f.yaw=yawOf(w[0],w[1]);
    var p=P(f.u,f.v); f.x=p[0]; f.z=p[1];
    tint(IH,i,sk); tint(IAL,i,sk); tint(IAR,i,sk); tint(IB,i,sh); tint(IHR,i,K.HAIR[(rr()*K.HAIR.length)|0]); tint(ICP,i,K.CAPC[(rr()*K.CAPC.length)|0]);
    tint(ILL,i,pt); tint(ILR,i,pt); tint(ICU,i,0xFFFFFF);
  });
  [IHE,ICA,ISW,ISH].forEach(function(m){ for(var j=0;j<Math.max(1,TROJ.length);j++) tint(m,j,0xFFFFFF); });
  PARTS.forEach(function(m){ if(m.instanceColor) m.instanceColor.needsUpdate=true; });

  /* ---------------- the balls and the dogs ---------------- */
  var fbB=new K.Bag(); fbB.add(new T.SphereGeometry(1,10,8),MT(0,0,0,0.09,0.09,0.15),0x6B3A1E); fbB.add(BX,MT(0,0.085,0,0.02,0.012,0.09),0xF4F2EC);
  var fzB=new K.Bag(); fzB.add(CY,MT(0,0,0,0.14,0.025,0.14),0xC4161C); fzB.add(CY,MT(0,0.012,0,0.09,0.006,0.09),0xF2C230);
  var NFB=GAMES.filter(function(g){ return g.kind==='fb'; }).length;
  var IFB=mk(fbB,NFB), IFZ=mk(fzB,1);
  for(var bj=0;bj<Math.max(1,NFB);bj++) tint(IFB,bj,0xFFFFFF); tint(IFZ,0,0xFFFFFF);
  IFB.instanceColor.needsUpdate=true; IFZ.instanceColor.needsUpdate=true;
  var dogB=new K.Bag();
  dogB.add(BX,MT(0,0.5,0,0.3,0.3,0.74),0xFFFFFF);
  dogB.add(BX,MT(0,0.72,-0.44,0.26,0.26,0.3),0xFFFFFF);
  dogB.add(BX,MT(0,0.66,-0.64,0.15,0.13,0.18),0xE8E2D8);
  dogB.add(BX,MT(0,0.7,-0.74,0.06,0.05,0.04),0x1A1A1A);
  dogB.add(BX,MT(-0.1,0.83,-0.42,0.06,0.14,0.1,0,0,0.3),0xB0B0B0); dogB.add(BX,MT(0.1,0.83,-0.42,0.06,0.14,0.1,0,0,-0.3),0xB0B0B0);
  dogB.add(BX,MT(-0.07,0.78,-0.6,0.04,0.04,0.02),0x111111); dogB.add(BX,MT(0.07,0.78,-0.6,0.04,0.04,0.02),0x111111);
  dogB.add(BX,MT(0,0.6,-0.3,0.31,0.06,0.06),0xC4161C);
  var dogL=new K.Bag(); dogL.add(BX,MT(0,-0.18,0,0.08,0.36,0.08),0xFFFFFF);
  var dogT=new K.Bag(); dogT.add(BX,MT(0,0.16,0,0.05,0.32,0.05,0),0xFFFFFF);
  var DOGS=[{coat:0xD9A15A,x:0,z:0,yaw:0,spd:0,ph:0,tx:0,tz:0,wait:0,chase:1},{coat:0x2B2B2D,x:0,z:0,yaw:0,spd:0,ph:0,tx:0,tz:0,wait:0,chase:0}];
  var IDB=mk(dogB,2), IDL=mk(dogL,8), IDT=mk(dogT,2);
  DOGS.forEach(function(d,k){ tint(IDB,k,d.coat); tint(IDT,k,d.coat); for(var j=0;j<4;j++) tint(IDL,k*4+j,d.coat); });
  [IDB,IDL,IDT].forEach(function(m){ m.instanceColor.needsUpdate=true; });
  var fz=GAMES.filter(function(g){ return g.kind==='fz'; })[0];
  if(!fz) IFZ.count=0;
  (function(){ var st=fz?P(fz.c[0],fz.c[1]):P(-20,30); DOGS[0].x=st[0]+1; DOGS[0].z=st[1];
    var any=FANS[(FANS.length*0.5)|0]||{x:st[0],z:st[1]}; DOGS[1].x=any.x+1.5; DOGS[1].z=any.z+1.5; DOGS[1].tx=DOGS[1].x; DOGS[1].tz=DOGS[1].z; })();
  var PROPS=[IFB,IFZ,IDB,IDL,IDT];

  /* ---------------- posing ---------------- */
  var _r=new T.Matrix4(), _p=new T.Matrix4(), _o=new T.Matrix4(), _a=new T.Matrix4(), _q=new T.Quaternion(), _v=new T.Vector3(), _s=new T.Vector3(1,1,1), _e=new T.Euler();
  function part(m,i,x,y,z,rx,rz){ _e.set(rx||0,0,rz||0); _q.setFromEuler(_e); _p.compose(_v.set(x,y,z),_q,_s); _o.multiplyMatrices(_r,_p); m.setMatrixAt(i,_o); return _o; }
  function attach(m,i,base,x,y,z,rx){ _a.copy(base); _e.set(rx||0,0,0); _q.setFromEuler(_e); _p.compose(_v.set(x,y,z),_q,_s); m.setMatrixAt(i,_o.multiplyMatrices(_a,_p)); }
  function pose(f,i,t){
    var sc=f.sc, ph=f.ph+t*f.sp, y=0, yaw=f.yaw, aL=0.12, aR=0.12, lL=0, lR=0, rzL=0, rzR=0, hx=0;
    if(f.sit){ y=0.43-0.34*sc; aL=0.55; aR=f.cup?1.15+Math.max(0,Math.sin(ph*0.7)-0.8)*4.0:0.55; lL=1.25; lR=1.15; }
    else if(f.role==='fb'||f.role==='fz'){
      yaw=f.face!==undefined?f.face:yaw; aL=f.aL||0.15; aR=f.aR||0.15; y=f.hop||0;
      var stp=f.step||0; lL=Math.sin(stp)*0.35; lR=-Math.sin(stp)*0.35;
    } else if(f.role==='troj'){
      var sw=Math.max(0,Math.sin(ph*0.8)); aR=1.2+sw*1.6; aL=0.9; y=Math.max(0,Math.sin(ph*1.6))*0.05; yaw+=Math.sin(ph*0.5)*0.3;
    } else if(f.dance){
      var b=Math.sin(ph*5.2); y=Math.abs(b)*0.13; yaw+=Math.sin(ph*1.7)*0.45;
      aL=2.5+Math.sin(ph*5.2)*0.45; aR=2.5-Math.sin(ph*5.2)*0.45; rzL=0.35+Math.sin(ph*2.6)*0.3; rzR=-0.35-Math.sin(ph*2.6)*0.3;
      lL=Math.max(0,b)*0.45; lR=Math.max(0,-b)*0.45; hx=Math.sin(ph*5.2)*0.12;
    } else {
      var sip=Math.max(0,Math.sin(ph*0.55)-0.82)*5.5;
      aR=f.cup?0.95+sip*0.9:0.12+Math.sin(ph*0.9)*0.08; aL=0.15+Math.max(0,Math.sin(ph*1.3+1))*0.5; yaw+=Math.sin(ph*0.4)*0.12; hx=-sip*0.25;
    }
    _e.set(0,yaw,0); _q.setFromEuler(_e); _s.set(sc,sc,sc); _r.compose(_v.set(f.x,y,f.z),_q,_s); _s.set(1,1,1);
    var bd=part(IB,i,0,0.34,0,-0.04);
    if(f.role==='troj'){ ICA.setMatrixAt(f.ti,_o.multiplyMatrices(bd,_p.compose(_v.set(0,0.42,0.3),_q.identity(),_s))); }
    var hd=part(IH,i,0,0.735,0,hx);
    if(f.role==='troj'){ IHE.setMatrixAt(f.ti,hd); IHR.setMatrixAt(i,Z); ICP.setMatrixAt(i,Z); }
    else if(f.cap){ part(ICP,i,0,0.735,0,hx); IHR.setMatrixAt(i,Z); } else { part(IHR,i,0,0.735,0,hx); ICP.setMatrixAt(i,Z); }
    var al=part(IAL,i,-0.295,0.74,0,aL,rzL); if(f.role==='troj') attach(ISH,f.ti,al,0,0,0,0);
    var ar=part(IAR,i,0.295,0.74,0,aR,rzR);
    if(f.role==='troj'){ attach(ISW,f.ti,ar,0,0,0,0); ICU.setMatrixAt(i,Z); }
    else if(f.cup){ _a.copy(ar); _e.set(-aR+Math.min(0.9,Math.max(0,aR-1.6)),0,-rzR); _q.setFromEuler(_e); _p.compose(_v.set(0,-0.33,0),_q,_s);
      ICU.setMatrixAt(i,_o.multiplyMatrices(_a,_p)); } else ICU.setMatrixAt(i,Z);
    part(ILL,i,-0.125,0.36,0,lL); part(ILR,i,0.125,0.36,0,lR);
  }

  /* ---------------- the games ---------------- */
  var _m=new T.Matrix4(), _q2=new T.Quaternion(), _v2=new T.Vector3(), _s2=new T.Vector3(1,1,1), _e2=new T.Euler();
  function face(f,o){ f.face=yawOf(o.x-f.x,o.z-f.z); }
  var fbi=0;
  GAMES.forEach(function(g){ if(g.kind==='fb') g.bi=fbi++; });
  function chest(f){ return [f.x,1.05*f.sc,f.z]; }
  function stepGames(dt){
    GAMES.forEach(function(g){
      var P0=g.p[g.hold], P1=g.kind==='fb'?g.p[1-g.hold]:g.p[g.to], bp, k;
      g.p.forEach(function(f){ f.aL=0.15; f.aR=0.2; f.hop=0; });
      if(g.fly<0){
        g.wait-=dt; face(P0,P1); face(P1,P0);
        P0.aR=1.3; P0.aL=0.6;
        if(g.wait<0.45){ P0.aR=1.3+(0.45-Math.max(0,g.wait))/0.45*1.7; }          /* wind up */
        var c=chest(P0), fw=[(P1.x-P0.x),(P1.z-P0.z)], fl=Math.hypot(fw[0],fw[1])||1;
        bp=[c[0]+fw[0]/fl*0.35,c[1]+(P0.aR>1.6?(P0.aR-1.6)*0.45:0),c[2]+fw[1]/fl*0.35];
        if(g.wait<=0){ g.fly=0; g.dur=g.kind==='fb'?0.55+fl/16:0.7+fl/11; g.S=bp; g.E=[P1.x-fw[0]/fl*0.3,1.15*P1.sc,P1.z-fw[1]/fl*0.3]; g.L=fl; }
      }
      if(g.fly>=0){
        g.fly+=dt; var u=Math.min(1,g.fly/g.dur);
        P0.aR=u<0.25?3.0-u*7:1.0;
        face(P1,P0); if(u>0.45){ P1.aL=1.5; P1.aR=1.5; if(g.kind==='fz') P1.hop=Math.sin(u*Math.PI)*0.06; }
        var h=g.kind==='fb'?1.0+g.L*0.1:0.6, side=g.kind==='fz'?Math.sin(u*Math.PI)*1.4:0, nx=-(g.E[2]-g.S[2])/g.L, nz=(g.E[0]-g.S[0])/g.L;
        bp=[g.S[0]+(g.E[0]-g.S[0])*u+nx*side, g.S[1]+(g.E[1]-g.S[1])*u+Math.sin(u*Math.PI)*h, g.S[2]+(g.E[2]-g.S[2])*u+nz*side];
        if(u>=1){ g.fly=-1; g.wait=rb(0.8,2.2);
          if(g.kind==='fb') g.hold=1-g.hold; else { g.hold=g.to; g.to=(g.hold+1+(rr()<0.5?1:0))%3; if(g.to===g.hold) g.to=(g.hold+1)%3; } }
      }
      g.p.forEach(function(f){ f.step=(f.step||0)+dt*(f===P1&&g.fly>=0?6:1.2); });
      g.pos=bp;
      if(g.kind==='fb'){
        var dir=g.fly>=0?[g.E[0]-g.S[0],0,g.E[2]-g.S[2]]:[P1.x-P0.x,0,P1.z-P0.z];
        _e2.set(g.fly>=0?-0.35+0.7*Math.min(1,g.fly/g.dur):0,Math.atan2(dir[0],dir[2]),0); _q2.setFromEuler(_e2);
        var spin=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),g.fly>=0?g.fly*25:0); _q2.multiply(spin);
        _m.compose(_v2.set(bp[0],bp[1],bp[2]),_q2,_s2); IFB.setMatrixAt(g.bi,_m);
      } else {
        _e2.set(0.08,(g.fly>=0?g.fly*18:0),0.05); _q2.setFromEuler(_e2); _m.compose(_v2.set(bp[0],bp[1],bp[2]),_q2,_s2); IFZ.setMatrixAt(0,_m);
      }
    });
  }

  /* ---------------- the dogs ---------------- */
  function dogFree(x,z){ var l=ALUM.loc([x,z]), u=l[0]*SG, v=l[1];
    if(underTent(u,v,null,0.35)||nearCol(x,z,0.45)||!offWalks([x,z],-0.4)) return false;
    for(var i=0;i<TREES.length;i++) if(Math.hypot(u-TREES[i][0],v-TREES[i][1])<0.9) return false;
    /* the a2k hedges (drawn only, no colliders): along the cross walk, along the central walk, round the fountain */
    var au=Math.abs(u), rf=Math.hypot(u,v-FV);
    if(au>11&&au<U-1&&(Math.abs(v-FV-2.9)<1.0||Math.abs(v-FV+2.9)<1.0)) return false;
    if(au>3.2&&au<5.6&&v>7&&v<V1) return false;
    if(rf>12.3&&rf<14.5) return false;
    return Math.abs(u)<U+2&&v>4&&v<V1+2&&Math.hypot(u,v-FV)>8.6&&!(Math.abs(u)<9&&Math.abs(v-VB)<7.5); }
  function pathFree(x0,z0,x1,z1){
    for(var t=0;t<=1.0001;t+=0.1){ var x=x0+(x1-x0)*t, z=z0+(z1-z0)*t; if(!dogFree(x,z)) return false;
      if(t>0.15) for(var i=0;i<FANS.length;i++) if(Math.abs(FANS[i].x-x)<0.8&&Math.abs(FANS[i].z-z)<0.8) return false; }
    return true;
  }
  function pathOpen(x0,z0,x1,z1){ for(var t=0.1;t<=1.0001;t+=0.1) if(!dogFree(x0+(x1-x0)*t,z0+(z1-z0)*t)) return false; return true; }
  /* open spots on the lawns, clear of people, where the wandering dog can go */
  var DSPOT=[];
  for(var su=-U;su<=U;su+=2.5) for(var sv=6;sv<=V1;sv+=2.5){ var sp0=P(su,sv);
    if(!dogFree(sp0[0],sp0[1])) continue;
    var near0=false; for(var fi0=0;fi0<FANS.length;fi0++) if(Math.hypot(FANS[fi0].x-sp0[0],FANS[fi0].z-sp0[1])<1.4){ near0=true; break; }
    if(!near0) DSPOT.push(sp0); }
  function stepDogs(dt,t){
    DOGS.forEach(function(d,k){
      if(d.chase&&fz&&fz.pos){
        var tgt=fz.fly>=0?fz.pos:[fz.p[fz.hold].x,0,fz.p[fz.hold].z];
        var cw=P(fz.c[0],fz.c[1]), ax=tgt[0]-cw[0], az=tgt[2]-cw[1], al=Math.hypot(ax,az)||1, off=fz.fly>=0?0:1.6;
        d.tx=tgt[0]+(fz.fly>=0?0:ax/al*off); d.tz=tgt[2]+(fz.fly>=0?0:az/al*off);
      } else if(!d.chase){
        d.wait-=dt;
        /* boxed in: no headway for a second and a half, so go somewhere else */
        d.chk=(d.chk||0)+dt;
        if(d.chk>1.5){ if(Math.hypot(d.x-(d.cx||0),d.z-(d.cz||0))<0.25&&Math.hypot(d.tx-d.x,d.tz-d.z)>0.4){ d.tx=d.x; d.tz=d.z; d.wait=0; }
          d.chk=0; d.cx=d.x; d.cz=d.z; }
        if(d.wait<=0&&Math.hypot(d.tx-d.x,d.tz-d.z)<0.4){
          d.tx=d.x; d.tz=d.z; d.wait=0.4;
          /* an open spot 4 to 16 m away with a clear run to it; failing that, any reachable one */
          for(var pass=0;pass<2&&d.wait<1;pass++) for(var tr2=0;tr2<30;tr2++){
            var sp=DSPOT[(rr()*DSPOT.length)|0], dd=Math.hypot(sp[0]-d.x,sp[1]-d.z);
            if(dd<4||dd>16||!(pass?pathOpen(d.x,d.z,sp[0],sp[1]):pathFree(d.x,d.z,sp[0],sp[1]))) continue;
            d.tx=sp[0]; d.tz=sp[1]; d.wait=rb(2,5); break; }
        }
      }
      var dx=d.tx-d.x, dz=d.tz-d.z, L=Math.hypot(dx,dz), want=L<0.3?0:Math.min(d.chase?6.5:1.8,L*2.5);
      d.spd+=(want-d.spd)*Math.min(1,dt*4);
      if(L>0.05){ var ty=Math.atan2(-dx,-dz), dy=ty-d.yaw; while(dy>Math.PI) dy-=6.283; while(dy<-Math.PI) dy+=6.283; d.yaw+=dy*Math.min(1,dt*6);
        var nx=d.x-Math.sin(d.yaw)*d.spd*dt, nz=d.z-Math.cos(d.yaw)*d.spd*dt;
        /* step aside from people, and never into a canopy, a trunk or a hedge */
        for(var fi=0;fi<FANS.length;fi++){ var ff=FANS[fi], ex=nx-ff.x, ez=nz-ff.z, e2=ex*ex+ez*ez;
          if(e2<0.64&&e2>1e-6){ var el=Math.sqrt(e2), pu=(0.8-el)/el; nx+=ex*pu; nz+=ez*pu; } }
        if(dogFree(nx,nz)||!dogFree(d.x,d.z)){ d.x=nx; d.z=nz; } else { d.spd*=0.5; if(!d.chase){ d.tx=d.x; d.tz=d.z; d.wait=0; } } }
      d.ph+=dt*(2+d.spd*3.2);
      var bob=Math.abs(Math.sin(d.ph))*0.04*Math.min(1,d.spd);
      _e2.set(0,d.yaw,0); _q2.setFromEuler(_e2); _m.compose(_v2.set(d.x,bob,d.z),_q2,_s2); IDB.setMatrixAt(k,_m);
      var amp=Math.min(1,d.spd/2)*0.6, legs=[[-0.1,-0.26,0],[0.1,-0.26,Math.PI],[-0.1,0.26,Math.PI],[0.1,0.26,0]];
      legs.forEach(function(lg,j){ _e.set(Math.sin(d.ph+lg[2])*amp,0,0); _q.setFromEuler(_e); _p.compose(_v.set(lg[0],0.4,lg[1]),_q,_s);
        IDL.setMatrixAt(k*4+j,_o.multiplyMatrices(_m,_p)); });
      _e.set(0.6,0,Math.sin(t*14+k)*0.5); _q.setFromEuler(_e); _p.compose(_v.set(0,0.6,0.36),_q,_s); IDT.setMatrixAt(k,_o.multiplyMatrices(_m,_p));
    });
  }

  var clock=0, frame=0, near=true, CEN=P(0,FV);
  stepGames(0); stepDogs(0,0);
  for(var i=0;i<NF;i++) pose(FANS[i],i,0);
  var prev=updateTailgate;
  updateTailgate=function(dt){
    prev(dt);
    var dx=camera.position.x-CEN[0], dz=camera.position.z-CEN[1], d2=dx*dx+dz*dz, nr=d2<420*420;
    if(nr!==near){ near=nr; ALL.forEach(function(m){ m.visible=nr; }); }
    if(!nr||d2>170*170) return;
    dt=Math.min(dt,0.1); clock+=dt; frame++;
    stepGames(dt); stepDogs(dt,clock);
    var half=frame&1;
    for(var i=0;i<NF;i++){ var f=FANS[i]; if(f.role==='fb'||f.role==='fz'||(i&1)===half) pose(f,i,clock); }
    PARTS.forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
    PROPS.forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
  };
  window.__alumniTailgate={tents:TENTS[0].length+TENTS[1].length,chairs:CHAIRS.length,coolers:COOLR.length+COOLW.length,flags:FLAGS.length,
    P:P,speakers:SPEAK.length,fans:NF,trojans:TROJ.length,footballs:NFB,frisbee:fz?1:0,dogs:DOGS.length,sg:SG,
    state:function(){ return {games:GAMES.map(function(g){ return {kind:g.kind,fly:g.fly,hold:g.hold,pos:g.pos}; }),dogs:DOGS.map(function(d){ return [d.x,d.z,d.spd]; })}; }};
})();
