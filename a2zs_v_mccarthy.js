/* ==================================================================
   McCarthy Honors Residential College (USC Village), built with the Village kit VK (a2zm_village_kit.js).
   The Village's landmark: five storeys (a tall retail / dining ground floor and four residential
   floors) in red brick with cast stone bands, round-arched top floor windows and hip roofs, and the
   145 ft (44 m) Gothic clock tower on the plaza front: buttressed brick shaft with a pointed arch
   portal, a big tracery window, clock faces on four sides, a belfry with lancets, an octagonal
   lantern with gablets and pinnacles, and a slate spire with a finial.
   Plan (from OSM way 541643585 and the photos): a C-shaped block on the campus grid. The east end
   faces Hecuba plaza (arcade, Dulce, the tower), the east side follows the service drive north to
   the bridge (arcade, Amazon), the long south side faces Cale across the walk, the north side the
   service road, the west end McClintock with the dining hall between the two wings. Inside: a
   ground level courtyard behind the dining hall and a podium courtyard on the first residential floor.
   Frame: u runs grid east along the long side, v grid south; origin at the plaza / south corner.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='McCarthy Honors Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M, PI=Math.PI;
  var Fr=VK.frame([2,-515],[36,19]);
  function W(u,v){ return Fr.P(u,v); }
  function dirW(u,v){ return [u*Fr.du[0]+v*Fr.dv[0], u*Fr.du[1]+v*Fr.dv[1]]; }
  function FF(u0,v0,u1,v1,ou,ov){ return VK.face(W(u0,v0),W(u1,v1),dirW(ou,ov)); }
  function sAt(F,p){ return (p[0]-F.A[0])*F.t[0]+(p[1]-F.A[1])*F.t[1]; }
  function sU(F,u,v){ return sAt(F,W(u,v)); }
  function norm(r){ r=r.slice(); if(ringArea(r)<0) r.reverse(); return r; }
  function fr(pts){ return norm(pts.map(function(p){ return W(p[0],p[1]); })); }
  function grow(r,d){ var o=offsetRing(r,d); if(Math.abs(ringArea(o))<Math.abs(ringArea(r))) o=offsetRing(r,-d); return o; }
  var Y_G=6.0, Y_EAVE=20.4, FLOORS=[6.0,9.4,12.8,16.2];

  /* ---------- small geometry helpers ---------- */
  /* a brick quad from face coords [s,y,d] (spandrels, gables) */
  function bq(F,pts,back){ var w=back?[-F.want[0],0,-F.want[2]]:F.want;
    VK.quad(VK.MB,pts.map(function(q){ return F.p3(q[0],q[2],q[1]); }),w,0xFFFFFF,1,pts.map(function(q){ return [q[0]/2,q[1]]; })); }
  /* a coloured quad from face coords, facing `want` (default: out of the face) */
  function sq(F,pts,col,k,want){ VK.quad(M,pts.map(function(q){ return F.p3(q[0],q[2],q[1]); }),want||F.want,col,k); }
  /* a triangle facing away from `c` (a world point) */
  function triOut(A,Bp,Cp,c,col,k){ var cc=rgb(col,k===undefined?1:k);
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=Cp[0]-A[0],vy=Cp[1]-A[1],vz=Cp[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, mx=(A[0]+Bp[0]+Cp[0])/3-c[0], my=(A[1]+Bp[1]+Cp[1])/3-c[1], mz=(A[2]+Bp[2]+Cp[2])/3-c[2];
    if(nx*mx+ny*my+nz*mz<0) M.tri(A,Cp,Bp,cc,cc,cc); else M.tri(A,Bp,Cp,cc,cc,cc); }
  /* a pyramid (or cone) over a ring, apex at height yt */
  function pyramid(ring,y0,yt,col,k){ var cx=0,cz=0; ring.forEach(function(p){ cx+=p[0]; cz+=p[1]; }); cx/=ring.length; cz/=ring.length;
    var apex=[cx,yt,cz], ctr=[cx,y0+(yt-y0)*0.3,cz];
    for(var i=0;i<ring.length;i++){ var a=ring[i], b=ring[(i+1)%ring.length]; triOut([a[0],y0,a[1]],[b[0],y0,b[1]],apex,ctr,col,k); } }
  /* a square in the frame centred at (u,v) */
  function sqr(u,v,h){ return fr([[u-h,v-h],[u+h,v-h],[u+h,v+h],[u-h,v+h]]); }
  /* a pinnacle: stone shaft and a pointed cap */
  function pinn(u,v,h,y0,y1,yt){ var r=sqr(u,v,h); prism(M,r,y0,y1,C.CAST,C.CAST,0.72);
    prism(M,sqr(u,v,h+0.07),y1,y1+0.18,C.CAST_D,C.CAST_D,0.7); pyramid(sqr(u,v,h+0.02),y1+0.18,yt,C.CAST_L,0.95); }
  /* an octagon (world ring) round frame point (u,v), circumradius R */
  function oct(u,v,R){ var r=[]; for(var k=0;k<8;k++){ var a=PI/8+k*PI/4; r.push(W(u+Math.cos(a)*R,v+Math.sin(a)*R)); } return norm(r); }
  /* hip roof with its stone band, as a wing: all wings share pitch so their roofs join in clean valleys */
  function hip(ring,y,rise,inset){ var e=grow(ring,0.6); band(M,e,y,y+0.45,0,C.CAST,0.9,0.6); hipRoof(M,e,y+0.45,rise,inset,C.ROOF); }

  /* ---------- facade pieces ---------- */
  /* stone courses: plinth, band over the ground floor, sill course, band under the top floor, cornice */
  function courses(F,s0,s1,yb,opt){ opt=opt||{};
    if(yb<0.1&&!opt.noPlinth) F.block(s0-0.08,s1+0.08,0,0.08,0,0.6,C.CAST_D,0.75);
    if(yb<6.1) F.block(s0-0.18,s1+0.18,0,0.18,5.85,6.45,C.CAST,0.75);
    if(!opt.court) F.block(s0-0.1,s1+0.1,0,0.1,9.25,9.42,C.CAST,0.75);
    F.block(s0-0.12,s1+0.12,0,0.12,15.95,16.25,C.CAST,0.75);
    F.block(s0-0.32,s1+0.32,0,0.32,19.5,20.4,C.CAST,0.8); }
  /* the residential floors: style 'std' (arched first and top floors), 'pair' (two arched lights per bay
     on the first and top floors, as on the plaza front) or 'court' (plain, for the courtyards) */
  function floors(F,s0,s1,n,style,skip){
    var w=(s1-s0)/n;
    for(var i=0;i<n;i++){ if(skip&&skip.indexOf(i)>=0) continue; var c=s0+w*(i+0.5);
      for(var f=0;f<4;f++){ var y=FLOORS[f];
        if(style==='court'){ F.tile(TL.WIN,c-1.0,c+1.0,y+0.55,y+2.85); continue; }
        var arched=(f===0||f===3);
        if(arched&&style==='pair'){ F.tile(TL.WIN_ARCH,c-1.32,c-0.06,y+0.55,y+3.0); F.tile(TL.WIN_ARCH,c+0.06,c+1.32,y+0.55,y+3.0); }
        else if(arched) F.tile(TL.WIN_ARCH,c-1.1,c+1.1,y+0.5,y+3.05);
        else F.tile(TL.WIN,c-1.12,c+1.12,y+0.45,y+3.0); } } }
  /* stone quoin strip */
  function quoin(F,s,y0,y1){ F.block(s-0.4,s+0.4,0,0.12,y0,y1,C.CAST,0.75); }

  /* a walk-under arcade between s0 and s1: round arches on stone columns, brick spandrels with a
     stone archivolt, a soffit, paving, and shopfronts on the back wall */
  var AD=3.2, AYI=3.6, AYS=5.45;
  function arcade(F,s0,s1,n,opt){ opt=opt||{};
    var bw=(s1-s0)/n, cw=0.62, r=(bw-cw)/2, K=8, dB=-0.6;
    if(!opt.noBack){ var b0=opt.back0===undefined?s0:opt.back0, b1=opt.back1===undefined?s1:opt.back1;
      F.brick(b0,b1,0,AYS,-AD);
      for(var i=0;i<n;i++){ var c=s0+bw*(i+0.5); if(opt.door&&opt.door.indexOf(i)>=0) F.tile(TL.DOOR,c-1.2,c+1.2,0,3.4,-AD+0.03);
        else F.tile(TL.SHOP_ARCH,Math.max(b0,c-bw/2+0.3),Math.min(b1,c+bw/2-0.3),0,4.7,-AD+0.03); } }
    if(!opt.noSoffit){ F.under(s0,s1,-AD,0,AYS,C.CAST_D); VK.pave(F.ring(s0,s1,-AD,0),0.03); }
    for(var k=0;k<=n;k++){ if(opt.skip&&opt.skip.indexOf(k)>=0) continue; var s=s0+k*bw, p=F.pt(s,-0.3);
      var o=[]; for(var j=0;j<8;j++){ var a=PI/8+j*PI/4; o.push([p[0]+Math.cos(a)*0.27,p[1]+Math.sin(a)*0.27]); }
      prism(M,norm(o),0.45,AYI-0.3,C.CAST,C.CAST,0.78);
      F.block(s-0.36,s+0.36,-0.66,0.06,0,0.45,C.CAST_D,0.75); F.block(s-0.38,s+0.38,-0.68,0.08,AYI-0.3,AYI,C.CAST,0.8);
      /* the pier above the capital */
      F.brick(s-cw/2,s+cw/2,AYI,Y_G,0); bq(F,[[s+cw/2,AYI,dB],[s-cw/2,AYI,dB],[s-cw/2,Y_G,dB],[s+cw/2,Y_G,dB]],true); }
    for(i=0;i<n;i++){ c=s0+bw*(i+0.5);
      for(j=0;j<K;j++){ var ta=PI-j*PI/K, tb=PI-(j+1)*PI/K, as=c+r*Math.cos(ta), ay=AYI+r*Math.sin(ta), bs=c+r*Math.cos(tb), by=AYI+r*Math.sin(tb);
        bq(F,[[as,ay,0],[bs,by,0],[bs,Y_G,0],[as,Y_G,0]]);
        bq(F,[[bs,by,dB],[as,ay,dB],[as,Y_G,dB],[bs,Y_G,dB]],true);
        var ms=(as+bs)/2-c, my=(ay+by)/2-AYI, wv=[-(F.t[0]*ms), -my, -(F.t[1]*ms)];
        sq(F,[[as,ay,0.04],[bs,by,0.04],[bs,by,dB],[as,ay,dB]],C.CAST_D,0.85,wv);
        var R2=r+0.3; sq(F,[[as,ay,0.05],[bs,by,0.05],[c+R2*Math.cos(tb),AYI+R2*Math.sin(tb),0.05],[c+R2*Math.cos(ta),AYI+R2*Math.sin(ta),0.05]],C.CAST,0.95); } } }

  /* a pointed (equilateral) arch outline from sL to sR springing at yI; R>=span widens it outward */
  function pointed(sL,sR,yI,R,K){ var w=sR-sL, mid=(sL+sR)/2, out=[], j, ta=Math.acos((mid-sR)/R), a;
    for(j=0;j<=K;j++){ a=PI+(ta-PI)*j/K; out.push([sR+R*Math.cos(a),yI+R*Math.sin(a)]); }
    var tb=Math.acos((mid-sL)/R);
    for(j=K-1;j>=0;j--){ a=tb*j/K; out.push([sL+R*Math.cos(a),yI+R*Math.sin(a)]); }
    return out; }

  /* ================= plan ================= */
  var Wing1=fr([[0,0],[-92.64,-1.99],[-92.6,-16],[0,-16]]);              /* south wing, faces Cale */
  var Wing2=fr([[0,0],[0,-40.71],[-18,-40.71],[-18,0]]);                 /* plaza wing */
  var Wing3=norm([[21,-551],[21,-582],[2,-582],[2,-551]]);              /* east wing along the drive */
  var Wing4=fr([[-91.26,-61.51],[-21.9,-60.0],[-21.9,-45],[-92.3,-45]]); /* north wing */
  var Hall=fr([[-75,-16],[-75,-45],[-102.7,-45],[-102.7,-16]]);          /* dining hall, McClintock end */

  /* ================= the plaza front (east end) ================= */
  var FP=FF(0,0,0,-40.71,1,0), sp=function(v){ return sU(FP,0,v); };
  var pA=Math.min(sp(0),sp(-26)), pB=Math.max(sp(0),sp(-26)), pC=Math.min(sp(-34),sp(-40.71)), pD=Math.max(sp(-34),sp(-40.71));
  FP.brick(pA,pB,Y_G,Y_EAVE,0); FP.brick(pC,pD,Y_G,Y_EAVE,0);
  arcade(FP,pA,pB,7,{skip:[0]});
  arcade(FP,pC,pD,2,{skip:[2],back1:Math.max(sp(-34),sp(-39.9))});
  courses(FP,pA,pB,Y_G); courses(FP,pC,pD,Y_G);
  floors(FP,pA,pB,7,'pair'); floors(FP,pC,pD,2,'pair');
  quoin(FP,pA+0.4,Y_G,19.5);
  /* corner pier at the south corner, and the arch that opens the arcade to the south walk */
  prism(M,fr([[0.08,0.08],[-0.8,0.08],[-0.8,-0.8],[0.08,-0.8]]),0,Y_G,C.CAST,C.CAST,0.75);
  /* Dulce, under the arcade */
  (function(){ var bw=(pB-pA)/7, c=pA+bw*4.5, p=FP.pt(c,-AD+0.05); FP.flat(c-1.3,c+1.3,4.6,5.2,-AD+0.04,C.DARK,1);
    facadeText('DULCE',p[0],p[1],FP.n[0],FP.n[1],4.9,2.4,0.42,'#F3EEE4'); })();

  /* ================= east side along the drive (Amazon arcade, then shops up to the bridge) ================= */
  var FE=VK.face([21,-551],[21,-582],[1,0]), seA=sAt(FE,[21,-551]), seB=sAt(FE,[21,-568.6]), seE=sAt(FE,[21,-582]);
  var e0=Math.min(seA,seB), e1=Math.max(seA,seB), e2=Math.min(seB,seE), e3=Math.max(seB,seE);
  FE.brick(Math.min(seA,seE),Math.max(seA,seE),Y_G,Y_EAVE,0); FE.brick(e2,e3,0,Y_G,0);
  arcade(FE,e0,e1,5,{skip:[seA<seB?0:5],door:[2],back0:seA<seB?e0+0.8:e0,back1:seA<seB?e1:e1-0.8});
  prism(M,norm([[21.08,-550.9],[20.2,-550.9],[20.2,-551.8],[21.08,-551.8]]),0,Y_G,C.CAST,C.CAST,0.75);
  VK.face([17.8,-568.6],[21,-568.6],[0,1]).brick(0,3.2,0,AYS,0);
  (function(){ var n=3, w=(e3-e2)/n; for(var i=0;i<n;i++){ var c=e2+w*(i+0.5); FE.tile(i===1?TL.DOOR:TL.SHOP,c-1.6,c+1.6,0.6,i===1?3.6:4.8); } })();
  courses(FE,Math.min(seA,seE),Math.max(seA,seE),Y_G,{noPlinth:true}); FE.block(e2,e3,0,0.08,0,0.6,C.CAST_D,0.75);
  floors(FE,Math.min(seA,seE),Math.max(seA,seE),8,'std');
  /* north end of the east wing */
  var FN3=VK.face([21,-582],[4,-582],[0,-1]);
  FN3.brick(0,17,0,Y_EAVE,0); courses(FN3,0,17,0); floors(FN3,0,17,4,'std');
  (function(){ for(var i=0;i<4;i++){ var c=(i+0.5)*17/4; FN3.tile(i===1?TL.DOOR:TL.WIN,c-1.1,c+1.1,i===1?0:1.4,i===1?3.4:4.1); } })();

  /* ================= the long south front, facing Cale ================= */
  var FS=FF(-92.64,-1.99,0,0,0,1), sS0=sU(FS,-92.64,-1.99), sS1=sU(FS,0,0), sCorner=sU(FS,-3.2,-0.07);
  var sLo=Math.min(sS0,sS1), sHi=Math.max(sS0,sS1), west=sS0<sS1;   /* west end at sLo when west is true */
  function sx(t){ return west?sLo+t:sHi-t; }                           /* t: metres from the west end */
  var archL=Math.min(sCorner,west?sHi:sLo), archR=Math.max(sCorner,west?sHi:sLo);
  FS.brick(sLo,sHi,Y_G,Y_EAVE,0);
  var gL=Math.min(sx(0),sx(89.44)), gR=Math.max(sx(0),sx(89.44));
  FS.brick(gL,gR,0,Y_G,0);
  arcade(FS,archL,archR,1,{noBack:true,noSoffit:true,skip:[0,1]}); FS.brick(archL,archL+0.31,0,Y_G,0);
  courses(FS,sLo,sHi,Y_G,{}); FS.block(gL-0.08,gR,0,0.08,0,0.6,C.CAST_D,0.75);
  /* 24 bays of 3.727 m from the west end; gables over bays 5-6 and 15-16, oriels at 2, 10 and 20, the door at 12 */
  var NB=24, BW=89.44/NB, ORI=[2,10,20], GAB=[5.5,15.5];
  (function(){
    for(var i=0;i<NB;i++){ var c=sx(BW*(i+0.5));
      if(i===12){ FS.tile(TL.DOOR,c-1.3,c+1.3,0,3.6); FS.tile(TL.WIN_ARCH,c-1.2,c+1.2,3.7,5.6); FS.block(c-1.75,c+1.75,0,0.2,0,0.6,C.CAST,0.75);
        FS.block(c-1.75,c-1.35,0,0.2,0,5.6,C.CAST,0.78); FS.block(c+1.35,c+1.75,0,0.2,0,5.6,C.CAST,0.78); FS.block(c-1.85,c+1.85,0,0.3,5.55,5.85,C.CAST,0.8); }
      else if(i<12) FS.tile(TL.WIN_ARCH,c-1.25,c+1.25,0.9,5.3);
      else FS.tile(TL.SHOP_ARCH,c-1.5,c+1.5,0.6,5.5); }
    var skip=[]; ORI.forEach(function(k){ skip.push(west?k:NB-1-k); });
    floors(FS,gL,gR,NB,'std',skip);
    /* the unit by the arcade corner */
    floors(FS,archL,archR,1,'std');
    ORI.forEach(function(k){ var c=sx(BW*(k+0.5));
      FS.block(c-1.55,c+1.55,0,0.95,5.75,6.45,C.CAST,0.78);              /* corbel */
      FS.block(c-1.4,c+1.4,0,0.85,6.45,19.55,C.CAST_L,0.72);             /* the bay */
      for(var f=0;f<4;f++) FS.tile(TL.ORIEL,c-1.3,c+1.3,FLOORS[f]+0.12,FLOORS[f]+3.28,0.88);
      FS.block(c-1.6,c+1.6,0,1.05,19.55,20.15,C.CAST,0.8); });
    GAB.forEach(function(k){ var c=sx(BW*(k+0.5)), hw=3.9, yA=24.2, dG=0.65;
      quoin(FS,c-hw,0.6,19.5); quoin(FS,c+hw,0.6,19.5);
      FS.block(c-hw-0.1,c+hw+0.1,0,dG+0.1,19.95,20.45,C.CAST,0.8);
      bq(FS,[[c-hw,20.45,dG],[c+hw,20.45,dG],[c,yA,dG],[c,yA,dG]]);
      FS.tile(TL.VENT_ARCH,c-0.85,c+0.85,20.7,22.9,dG+0.03);
      /* the gable roof, running back into the hip */
      sq(FS,[[c-hw-0.3,20.3,dG+0.35],[c,yA+0.25,dG+0.35],[c,yA+0.25,-7.2],[c-hw-0.3,20.3,-7.2]],C.ROOF,0.92,[0,1,0]);
      sq(FS,[[c,yA+0.25,dG+0.35],[c+hw+0.3,20.3,dG+0.35],[c+hw+0.3,20.3,-7.2],[c,yA+0.25,-7.2]],C.ROOF,0.92,[0,1,0]);
      var a=FS.pt(c,dG+0.2), q=Fr.loc(a); pinn(q[0],q[1],0.22,yA,yA+0.9,yA+2.0); });
    quoin(FS,sx(0.4),0.6,19.5);
  })();

  /* ================= west end (McClintock): wing ends and the dining hall ================= */
  var FW1=FF(-92.6,-16,-92.64,-1.99,-1,0);
  FW1.brick(0,FW1.L,0,Y_EAVE,0); courses(FW1,0,FW1.L,0); floors(FW1,0,FW1.L,4,'std');
  (function(){ for(var i=0;i<4;i++){ var c=(i+0.5)*FW1.L/4; FW1.tile(TL.WIN_ARCH,c-1.2,c+1.2,0.9,5.2); } })();
  var FW4=FF(-92.3,-45,-91.26,-61.51,-1,0);
  FW4.brick(0,FW4.L,0,Y_EAVE,0); courses(FW4,0,FW4.L,0); floors(FW4,0,FW4.L,4,'std');
  (function(){ for(var i=0;i<4;i++){ var c=(i+0.5)*FW4.L/4; FW4.tile(TL.WIN_ARCH,c-1.2,c+1.2,0.9,5.2); } })();
  /* the dining hall: two tall storeys of pointed windows under a hip roof */
  var YH=9.2;
  function hallFace(F,n,door){ F.brick(0,F.L,0,YH,0); F.block(-0.1,F.L+0.1,0,0.1,0,0.6,C.CAST_D,0.75);
    F.block(-0.3,F.L+0.3,0,0.3,YH-0.7,YH,C.CAST,0.8);
    for(var i=0;i<n;i++){ var c=(i+0.5)*F.L/n;
      if(door&&i===(n>>1)){ F.tile(TL.DOOR,c-1.3,c+1.3,0,3.6); F.tile(TL.GOTHIC,c-1.4,c+1.4,3.8,8.2); }
      else F.tile(TL.GOTHIC,c-1.25,c+1.25,1.2,8.1);
      if(i>0) F.block((i)*F.L/n-0.35,(i)*F.L/n+0.35,0,0.3,0,YH-0.7,C.CAST,0.76); } }
  hallFace(FF(-102.7,-45,-102.7,-16,-1,0),5,true);
  hallFace(FF(-102.7,-16,-92.6,-16,0,1),2);
  hallFace(FF(-102.7,-45,-92.3,-45,0,-1),2);
  hallFace(FF(-75,-45,-75,-16,1,0),5);
  hip(Hall,YH,3.0,6.5);

  /* ================= the north side, on the service road ================= */
  var FN=VK.face([4,-582],[-50,-612],dirW(0,-1));
  FN.brick(0,FN.L,0,Y_EAVE,0); courses(FN,0,FN.L,0);
  (function(){ var n=17; floors(FN,0,FN.L,n,'std');
    for(var i=0;i<n;i++){ var c=(i+0.5)*FN.L/n; if(i%6===3) FN.tile(TL.DOOR,c-1.2,c+1.2,0,3.4); else FN.tile(TL.WIN,c-1.1,c+1.1,1.4,4.2); }
    quoin(FN,0.4,0.6,19.5); quoin(FN,FN.L-0.4,0.6,19.5); })();

  /* ================= courtyards ================= */
  function court(F,y0,n,gw){ F.brick(0,F.L,y0,Y_EAVE,0); F.block(-0.3,F.L+0.3,0,0.3,19.5,20.4,C.CAST,0.8);
    if(y0<Y_G) F.block(-0.15,F.L+0.15,0,0.15,5.85,6.3,C.CAST,0.75);
    var w=F.L/n; for(var i=0;i<n;i++){ var c=w*(i+0.5); for(var f=0;f<4;f++) if(FLOORS[f]>=y0-0.1) F.tile(TL.WIN,c-1.0,c+1.0,FLOORS[f]+0.55,FLOORS[f]+2.85);
      if(gw&&y0<1) F.tile(i%3===1?TL.DOOR:TL.WIN_ARCH,c-1.1,c+1.1,i%3===1?0:1.0,i%3===1?3.4:4.8); } }
  court(FF(-92.6,-16,-75,-16,0,-1),YH,5);
  court(FF(-75,-16,-53,-16,0,-1),0,6,true);
  court(FF(-53,-16,-18,-16,0,-1),Y_G,10);
  court(FF(-18,-16,-18,-34.1,-1,0),Y_G,5);
  court(VK.face(W(-18,-34.1),W(-23.8,-45),[-1,0]),Y_G,3);
  court(FF(-23.8,-45,-53,-45,0,1),Y_G,8);
  court(FF(-53,-45,-75,-45,0,1),0,6,true);
  court(FF(-75,-45,-92.3,-45,0,1),YH,5);
  /* the podium (dining and lobby below, the first floor courtyard on top) and the ground courtyard */
  var FPd=FF(-53,-45,-53,-16,-1,0); FPd.brick(0,FPd.L,0,Y_G+0.9,0); FPd.block(-0.1,FPd.L+0.1,-0.25,0.12,Y_G+0.9,Y_G+1.05,C.CAST,0.8);
  (function(){ for(var i=0;i<6;i++){ var c=(i+0.5)*FPd.L/6; FPd.tile(TL.WIN_ARCH,c-1.15,c+1.15,1.0,4.9); } })();
  var podTop=fr([[-18,-16],[-18,-34.1],[-23.8,-45],[-53,-45],[-53,-16]]);
  VK.pave(podTop,Y_G+0.02,0.92); VK.pave(fr([[-53,-16],[-53,-45],[-75,-45],[-75,-16]]),0.03,0.95);
  /* planters with lawn, two in each courtyard */
  [[-30,-24],[-42,-37],[-61,-24],[-67,-37]].forEach(function(p,i){ var y=i<2?Y_G:0, r=sqr(p[0],p[1],2.6);
    prism(M,r,y,y+0.55,C.CAST,C.CAST,0.75); flat(M,sqr(p[0],p[1],2.35),y+0.56,0x5E8A3A,1); });

  /* ================= roofs ================= */
  [Wing1,Wing2,Wing3,Wing4].forEach(function(r){ hip(r,Y_EAVE,3.4,7.4); });

  /* ================= the clock tower ================= */
  /* base: the front stands 2.2 m proud of the plaza front between v -34 and -26 */
  var TU0=-5.8, TU1=2.2, TV0=-34, TV1=-26, TUc=(TU0+TU1)/2, TVc=(TV0+TV1)/2;
  var FT=FF(TU1,TV1,TU1,TV0,1,0), st=function(v){ return sU(FT,TU1,v); };
  var tL=Math.min(st(TV1),st(TV0)), tR=Math.max(st(TV1),st(TV0)), tm=(tL+tR)/2;
  /* side walls of the base (they close the arcade bays too) */
  var FTs=FF(-AD,TV1,TU1,TV1,0,1), FTn=FF(-AD,TV0,TU1,TV0,0,-1);
  [FTs,FTn].forEach(function(F){ F.brick(0,F.L,0,AYS,0); var a=sU(F,0,TVc), b=sU(F,TU1,TVc); F.brick(Math.min(a,b),Math.max(a,b),AYS,Y_EAVE,0);
    F.block(Math.min(a,b),Math.max(a,b),0,0.12,15.95,16.25,C.CAST,0.75); F.block(Math.min(a,b),Math.max(a,b),0,0.18,5.85,6.45,C.CAST,0.75); });
  /* the portal: a pointed arch with a deep reveal, tracery over the doors and the college's name */
  var pL=tm-1.6, pR=tm+1.6, pI=5.4, PK=7, inner=pointed(pL,pR,pI,3.2,PK), outer=pointed(pL,pR,pI,3.65,PK), apexY=inner[PK][1], dR=-1.0;
  FT.brick(tL+0.5,pL,0,Y_EAVE,0); FT.brick(pR,tR-0.5,0,Y_EAVE,0); FT.brick(pL,pR,apexY,Y_EAVE,0);
  for(var j=0;j<2*PK;j++){ var a=inner[j], b=inner[j+1];
    bq(FT,[[a[0],a[1],0],[b[0],b[1],0],[b[0],apexY,0],[a[0],apexY,0]]);
    var ms=(a[0]+b[0])/2-tm, wv=[-FT.t[0]*ms,-1,-FT.t[1]*ms];
    sq(FT,[[a[0],a[1],0.02],[b[0],b[1],0.02],[b[0],b[1],dR],[a[0],a[1],dR]],C.CAST_D,0.85,wv);
    var oa=outer[j], ob=outer[j+1]; sq(FT,[[a[0],a[1],0.07],[b[0],b[1],0.07],[ob[0],ob[1],0.07],[oa[0],oa[1],0.07]],C.CAST,0.95); }
  FT.block(pL-0.45,pL,0,0.07,0,pI,C.CAST,0.8); FT.block(pR,pR+0.45,0,0.07,0,pI,C.CAST,0.8);
  sq(FT,[[pL,0,0],[pL,0,dR],[pL,pI,dR],[pL,pI,0]],C.CAST_D,0.75,[FT.t[0],0,FT.t[1]]);
  sq(FT,[[pR,0,dR],[pR,0,0],[pR,pI,0],[pR,pI,dR]],C.CAST_D,0.75,[-FT.t[0],0,-FT.t[1]]);
  FT.flat(pL,pR,0,apexY,dR,C.DARK,1);
  FT.tile(TL.GOTHIC,pL+0.1,pR-0.1,3.2,apexY-0.05,dR+0.04); FT.tile(TL.DOOR,pL+0.25,pR-0.25,0,3.3,dR+0.06);
  FT.tile(TL.BLANK_STONE,pL+0.05,pR-0.05,3.2,4.0,dR+0.08);
  (function(){ var p=FT.pt(tm,dR+0.1); facadeText('McCARTHY HONORS COLLEGE',p[0],p[1],FT.n[0],FT.n[1],3.6,2.9,0.3,'#4A4034'); })();
  VK.pave(FT.ring(pL,pR,dR,0),0.03);
  /* the great tracery window and the paired lights over it */
  FT.block(tm-1.45,tm+1.45,0,0.22,9.45,9.7,C.CAST,0.8); FT.tile(TL.GOTHIC,tm-1.35,tm+1.35,9.7,15.6);
  FT.tile(TL.WIN_ARCH,tm-1.5,tm-0.07,16.6,19.3); FT.tile(TL.WIN_ARCH,tm+0.07,tm+1.5,16.6,19.3);
  FT.block(tL+0.5,pL-0.45,0,0.18,5.85,6.45,C.CAST,0.75); FT.block(pR+0.45,tR-0.5,0,0.18,5.85,6.45,C.CAST,0.75); FT.block(tL+1,tR-1,0,0.12,15.95,16.25,C.CAST,0.75);
  FT.block(tL+0.6,tR-0.6,0,0.35,19.5,20.4,C.CAST,0.8);
  /* the clock stage: 8 x 8 m, brick, a clock on each face, a pierced stone parapet */
  var Y_CS=26.0, clockRing=fr([[TU0,TV0],[TU1,TV0],[TU1,TV1],[TU0,TV1]]);
  var csF=[FF(TU1,TV1,TU1,TV0,1,0),FF(TU0,TV1,TU1,TV1,0,1),FF(TU0,TV0,TU1,TV0,0,-1),FF(TU0,TV1,TU0,TV0,-1,0)];
  csF.forEach(function(F,i){ F.brick(0,F.L,Y_EAVE,Y_CS,0); F.block(-0.2,F.L+0.2,0,0.2,Y_EAVE,20.9,C.CAST,0.8);
    var c=i===0?F.L/2:(i===3?F.L/2:sU(F,TU1-3.6,i===1?TV1:TV0)), cy=i===3?24.5:23.2;
    F.block(c-1.35,c+1.35,0,0.08,cy-1.35,cy+1.35,C.CAST,0.8); F.tile(TL.CLOCK,c-1.2,c+1.2,cy-1.2,cy+1.2,0.11);
    F.block(-0.2,F.L+0.2,0,0.25,Y_CS-0.35,Y_CS,C.CAST,0.8); });
  flat(M,clockRing,Y_CS,C.CAST_D,0.8);
  balustrade(M,clockRing,Y_CS,C.CAST,C.CAST_D);
  /* corner buttresses: the front pair rise from the ground, the back pair from the roof */
  [[TU1,TV1,1,1],[TU1,TV0,1,-1],[TU0,TV1,-1,1],[TU0,TV0,-1,-1]].forEach(function(c,i){
    var uA=c[0]-c[2]*0.55, uB=c[0]+c[2]*0.45, vA=c[1]-c[3]*0.55, vB=c[1]+c[3]*0.45, y0=i<2?0:Y_EAVE-0.5;
    prism(M,fr([[uA,vA],[uB,vA],[uB,vB],[uA,vB]]),y0,27.4,C.CAST,C.CAST,0.74);
    if(i<2){ prism(M,fr([[uA-0.08*c[2],vA-0.08*c[3]],[uB+0.08*c[2],vA-0.08*c[3]],[uB+0.08*c[2],vB+0.08*c[3]],[uA-0.08*c[2],vB+0.08*c[3]]]),0,0.7,C.CAST_D,C.CAST_D,0.7);
      prism(M,fr([[uA,vA],[uB+0.12*c[2],vA],[uB+0.12*c[2],vB+0.12*c[3]],[uA,vB+0.12*c[3]]]),Y_G-0.1,Y_G+0.5,C.CAST,C.CAST,0.78); }
    pinn((uA+uB)/2,(vA+vB)/2,0.38,27.4,28.4,30.0); });
  /* the belfry: 5.2 m square with two lancets either side of a louvred pointed arch on each face */
  var BH=2.6, BU0=TUc-BH, BU1=TUc+BH, BV0=TVc-BH, BV1=TVc+BH, Y_BT=33.0;
  var bRing=fr([[BU0,BV0],[BU1,BV0],[BU1,BV1],[BU0,BV1]]);
  [FF(BU1,BV1,BU1,BV0,1,0),FF(BU0,BV1,BU1,BV1,0,1),FF(BU0,BV0,BU1,BV0,0,-1),FF(BU0,BV1,BU0,BV0,-1,0)].forEach(function(F){
    F.brick(0,F.L,Y_CS,Y_BT,0); var m=F.L/2;
    F.tile(TL.LANCET,m-2.15,m-0.95,27.1,32.0); F.tile(TL.SPIRE_LOUVRE,m-0.9,m+0.9,26.9,32.4); F.tile(TL.LANCET,m+0.95,m+2.15,27.1,32.0);
    F.block(-0.1,F.L+0.1,0,0.15,Y_BT-0.3,Y_BT,C.CAST,0.8); F.block(-0.1,F.L+0.1,0,0.12,Y_CS+0.9,Y_CS+1.1,C.CAST,0.78); });
  flat(M,bRing,Y_BT,C.CAST_D,0.8);
  balustrade(M,grow(bRing,0.05),Y_BT,C.CAST,C.CAST_D);
  [[BU0,BV0],[BU1,BV0],[BU1,BV1],[BU0,BV1]].forEach(function(c){ pinn(c[0],c[1],0.32,Y_CS+0.9,33.9,35.4); });
  /* the lantern: an octagon with louvred lights and gablets */
  var LR=2.05, Y_LT=36.9, lo=oct(TUc,TVc,LR);
  for(var k=0;k<8;k++){ var a1=lo[k], b1=lo[(k+1)%8], mx=(a1[0]+b1[0])/2, mz=(a1[1]+b1[1])/2, cw=Fr.P(TUc,TVc);
    var F=VK.face(a1,b1,[mx-cw[0],mz-cw[1]]); F.brick(0,F.L,Y_BT,Y_LT,0); F.tile(TL.SPIRE_LOUVRE,0.18,F.L-0.18,33.5,36.5);
    var ax=Fr.loc([mx,mz]); if(Math.abs(Math.abs(ax[0]-TUc)-Math.abs(ax[1]-TVc))>1.0){   /* the four cardinal faces get a gablet */
      sq(F,[[-0.05,Y_LT,0.08],[F.L+0.05,Y_LT,0.08],[F.L/2,Y_LT+1.35,0.08],[F.L/2,Y_LT+1.35,0.08]],C.CAST,0.92);
      sq(F,[[F.L/2,Y_LT+1.35,0.08],[F.L+0.05,Y_LT,0.08],[F.L+0.05,Y_LT,-0.9],[F.L/2,Y_LT+1.35,-0.9]],C.ROOF,0.9,[0,1,0]);
      sq(F,[[-0.05,Y_LT,0.08],[F.L/2,Y_LT+1.35,0.08],[F.L/2,Y_LT+1.35,-0.9],[-0.05,Y_LT,-0.9]],C.ROOF,0.9,[0,1,0]); } }
  band(M,grow(lo,0.12),Y_BT,Y_BT+0.35,0,C.CAST,0.95,0.7);
  band(M,grow(lo,0.12),Y_LT-0.3,Y_LT,0,C.CAST,0.95,0.7);
  [0,2,4,6].forEach(function(k){ var q=Fr.loc(lo[k]); pinn(q[0],q[1],0.16,Y_LT-0.2,Y_LT+0.6,Y_LT+1.7); });
  /* the spire: octagonal slate to 44.2 m, a bronze finial above */
  var spr=oct(TUc,TVc,1.95), sc=Fr.P(TUc,TVc);
  pyramid(spr,Y_LT,44.2,0x57514B,1);
  postAt(M,sc[0],sc[1],44.0,45.7,0.05,C.BRONZE,0.8);
  segBox(M,W(TUc-0.35,TVc),W(TUc+0.35,TVc),45.05,45.15,0.08,C.BRONZE,0.8);
  postAt(M,sc[0],sc[1],44.15,44.45,0.13,C.BRONZE,0.9);

  /* ================= colliders (the arcades and the portal stay walkable) ================= */
  VK.collider(fr([[-AD,0],[-92.64,-1.99],[-92.6,-16],[-AD,-16]]),21);
  VK.collider(fr([[-AD,0],[-AD,-40.71],[-18,-40.71],[-18,0]]),21);
  VK.collider(fr([[-AD,TV1+0.5],[TU1+0.5,TV1+0.5],[TU1+0.5,TV0-0.5],[-AD,TV0-0.5]]),46);
  VK.collider(norm([[17.8,-551],[17.8,-582],[2,-582],[2,-551]]),21);
  VK.collider(norm([[21,-568.6],[21,-582],[17.8,-582],[17.8,-568.6]]),21);
  VK.collider(Wing4,21);
  VK.collider(fr([[-18,-16],[-18,-40.71],[-23.8,-45],[-102.7,-45],[-102.7,-16]]),12);
})();
