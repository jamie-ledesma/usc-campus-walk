/* ==================================================================
   Cowlings Residential College (USC Village), built with the Village kit VK.
   The southern half of the Cowlings and Ilium block (OSM: 5 levels, 3131 S
   Hoover St): a retail ground floor over the whole footprint (Trader Joe's
   on the plaza, Target next door on the plaza and Hoover corner) and four
   residential floors in a ring round a raised podium courtyard. Brick with
   cast stone bands and window surrounds, arched top floor windows, a cream
   stone corner pavilion with lancets at the plaza / Hoover corner, oriel
   bays on Hoover, a gabled centre bay over the open tile-roofed pergola in
   front (the OSM "roof" in front of the building), and the arched bridge
   over the service street to McCarthy (BUILD_BRIDGE).
   Frame: south face z=-560 looks on the plaza, east face x=114 on Hoover,
   west face x=35 on the service street, north face z=-609 abuts Ilium.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='Cowlings Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var BUILD_BRIDGE=true;     /* the arched bridge to McCarthy over the service street (x 21..35) */
  var C=VK.C, TL=VK.TILE, M=VK.M;
  var X0=35, X1=114, ZN=-609, ZS=-560, WG=16;               /* footprint and wing depth */
  var IX0=X0+WG, IX1=X1-WG, IZN=ZN+WG, IZS=ZS-WG;           /* podium courtyard */
  var G=5.6, FL=[5.6,8.8,12.0,15.2], TOP=18.0, EAVE=18.4, RISE=4.0;   /* matches Ilium: 5.6 m ground floor, four 3.2 m floors, eaves 18.4 */
  var GB0=G-0.3, GB1=G+0.3;                                  /* the ground floor cornice band */
  var ROOF2=0x8E6155;                                        /* warmer tile of the pergola */

  /* ---------- small helpers ---------- */
  function tri3(a,b,c,want,hex,k){ var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, col=rgb(hex,k===undefined?1:k);
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) M.tri(a,c,b,col,col,col); else M.tri(a,b,c,col,col,col); }
  function q4(pts,want,hex,k){ VK.quad(M,pts,want,hex,k); }
  function pos(r){ r=r.slice(); if(ringArea(r)<0) r.reverse(); return r; }
  /* a horizontal ledge round an axis aligned rect R=[x0,x1,z0,z1] standing d proud (inward if hole) */
  function ledge(R,d,y0,y1,col,hole,skip){
    var s=hole?-d:d, O=[R[0]-s,R[1]+s,R[2]-s,R[3]+s];
    var inn=[[R[0],R[2]],[R[1],R[2]],[R[1],R[3]],[R[0],R[3]]], out=[[O[0],O[2]],[O[1],O[2]],[O[1],O[3]],[O[0],O[3]]];
    var cx=(R[0]+R[1])/2, cz=(R[2]+R[3])/2;
    if(skip===0){ out[0]=[out[0][0],R[2]]; out[1]=[out[1][0],R[2]]; }   /* the shared edge with Ilium: no band, ends flush */
    for(var i=0;i<4;i++){ if(i===skip) continue; var a=out[i], b=out[(i+1)%4], ai=inn[i], bi=inn[(i+1)%4];
      var mx=(a[0]+b[0])/2-cx, mz=(a[1]+b[1])/2-cz, n=Math.abs(mx)>Math.abs(mz)?[Math.sign(mx),0]:[0,Math.sign(mz)];
      if(hole) n=[-n[0],-n[1]];
      q4([[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],[n[0],0,n[1]],col,0.9);
      q4([[ai[0],y1,ai[1]],[bi[0],y1,bi[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]],[0,1,0],col,1);
      q4([[ai[0],y0,ai[1]],[bi[0],y0,bi[1]],[b[0],y0,b[1]],[a[0],y0,a[1]]],[0,-1,0],col,0.62); } }
  /* n tiles spread evenly over s0..s1 */
  function row(F,s0,s1,n,id,y0,y1,w,d){ var p=(s1-s0)/n; for(var i=0;i<n;i++){ var c=s0+(i+0.5)*p; F.tile(id,c-w/2,c+w/2,y0,y1,d); } }
  /* the residential floors of a bay run: windows on four floors, arched on the top floor */
  function floors(F,s0,s1,n,d,ids){ for(var k=0;k<4;k++) row(F,s0,s1,n,(ids&&ids[k]!==undefined)?ids[k]:(k===3?TL.WIN_ARCH:TL.WIN),FL[k]+0.4,FL[k]+2.7,2.1,d); }
  /* a flat disc on a face (the Target bullseye) */
  function disc(F,s,y,r,d,col){ var n=20; for(var i=0;i<n;i++){ var a0=i/n*6.2832, a1=(i+1)/n*6.2832;
    tri3(F.p3(s,d,y),F.p3(s+Math.cos(a0)*r,d,y+Math.sin(a0)*r),F.p3(s+Math.cos(a1)*r,d,y+Math.sin(a1)*r),F.want,col,1); } }
  function sign(F,s,y,d,txt,w,h,col){ var p=F.pt(s,d); facadeText(txt,p[0],p[1],F.n[0],F.n[1],y,w,h,col); }
  /* a cream stone oriel bay up the residential floors, with lancet panels */
  function oriel(F,s0,s1,dp){
    var yb=GB1;
    F.block(s0,s1,-0.05,dp,yb,TOP,C.CAST_L,0.85);
    F.under(s0,s1,0.36,dp,yb,C.CAST_D);
    F.block(s0+0.25,s1-0.25,-0.05,dp-0.15,yb-0.9,yb,C.CAST_D,0.8); F.under(s0+0.25,s1-0.25,0.36,dp-0.15,yb-0.9,C.CAST_D);
    for(var k=0;k<4;k++) F.tile(TL.ORIEL,s0+0.18,s1-0.18,Math.max(FL[k]+0.35,yb+0.1),FL[k]+3.0,dp+0.03);
    F.block(s0-0.12,s1+0.12,-0.05,dp+0.12,TOP,TOP+0.85,C.CAST,0.8);
    F.block(s0+0.3,s1-0.3,-0.05,dp-0.1,TOP+0.85,TOP+1.25,C.CAST_L,0.8); }
  /* a gable: brick triangle on a face from s0..s1 at plane dF, rake roof running back to dBack */
  function gable(F,s0,s1,dF,yb,ya,dBack,vent){
    var sm=(s0+s1)/2, m=(ya-yb)/(sm-s0), o=0.45, dO=dF+0.45;
    VK.quad(VK.MB,[F.p3(s0,dF,yb),F.p3(s1,dF,yb),F.p3(sm,dF,ya),F.p3(sm,dF,ya)],F.want,0xFFFFFF,1,[[s0/2,yb],[s1/2,yb],[sm/2,ya],[sm/2,ya]]);
    var up=[0,1,0];
    [[s0-o,sm],[s1+o,sm]].forEach(function(e){ var se=e[0], ye=yb-o*m, dir=se<sm?-1:1;
      var w=[F.t[0]*dir, 1, F.t[1]*dir];
      q4([F.p3(se,dO,ye),F.p3(sm,dO,ya+0.05),F.p3(sm,dBack,ya+0.05),F.p3(se,dBack,ye)],w,C.ROOF,1);
      q4([F.p3(se,dO,ye-0.12),F.p3(sm,dO,ya-0.07),F.p3(sm,dF,ya-0.07),F.p3(se,dF,ye-0.12)],[0,-1,0],C.CAST_D,0.7);
      q4([F.p3(se,dO,ye-0.12),F.p3(sm,dO,ya-0.07),F.p3(sm,dO,ya+0.05),F.p3(se,dO,ye)],F.want,C.CAST,0.9); });
    if(vent) F.tile(TL.VENT_ARCH,sm-1.0,sm+1.0,yb+0.35,yb+0.35+(ya-yb)*0.62,dF+0.03); }

  /* ==================== the main block ==================== */
  var OUT=[X0,X1,ZN,ZS], INN=[IX0,IX1,IZN,IZS];
  var FS=VK.face([X0,ZS],[X1,ZS],[0,1]);     /* plaza: s = x-35 */
  var FE=VK.face([X1,ZS],[X1,ZN],[1,0]);     /* Hoover: s = -560-z */
  var FW=VK.face([X0,ZN],[X0,ZS],[-1,0]);    /* service street: s = z+609 */
  FS.brick(0,79,0,TOP,0); FE.brick(0,49,0,TOP,0); FW.brick(0,49,0,TOP,0);   /* no face on z=-609: it is inside Building 9 */
  /* courtyard walls (podium deck at G) */
  var CF=[VK.face([IX0,IZS],[IX1,IZS],[0,-1]), VK.face([IX1,IZN],[IX0,IZN],[0,1]), VK.face([IX0,IZN],[IX0,IZS],[1,0]), VK.face([IX1,IZS],[IX1,IZN],[-1,0])];
  CF.forEach(function(F){ F.brick(0,F.L,G,TOP,0,0.95); var n=Math.max(2,Math.round(F.L/3.4)); floors(F,0.6,F.L-0.6,n); });
  VK.pave([[IX0,IZN],[IX1,IZN],[IX1,IZS],[IX0,IZS]],G+0.04);
  [[56,-588,62,-585],[67,-588,82,-585],[87,-588,93,-585],[60,-582,64,-579.5],[85,-582,89,-579.5]].forEach(function(r){
    prism(M,pos([[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]),G,G+0.65,C.CAST,0x5F8A45,0.8); });

  /* bands round the outside: ground floor cornice, a thin course at floor 3, the top floor sill course, the main cornice */
  ledge(OUT,0.34,GB0,GB1,C.CAST,false,0);
  ledge(OUT,0.10,FL[2]-0.12,FL[2],C.CAST,false,0);
  ledge(OUT,0.14,FL[3]-0.15,FL[3]+0.05,C.CAST,false,0);
  ledge(OUT,0.58,TOP,EAVE,C.CAST,false,0);
  ledge(INN,0.10,FL[3]-0.15,FL[3]+0.05,C.CAST,true);
  ledge(INN,0.45,TOP,EAVE,C.CAST,true);
  ledge(OUT,0.12,0,0.55,C.CAST_D,false,0);                          /* stone plinth */

  /* the roof: hipped ring over the four wings, valleys into the courtyard */
  (function(){
    var E=[X0-0.5,X1+0.5,ZN,ZS+0.5], Ei=[IX0+0.4,IX1-0.4,IZN+0.4,IZS-0.4], R=[X0+WG/2,X1-WG/2,ZN+WG/2,ZS-WG/2], yr=EAVE+RISE;
    function P(r,i,y){ return [[r[0],y,r[2]],[r[1],y,r[2]],[r[1],y,r[3]],[r[0],y,r[3]]][i]; }
    var outN=[[0,1,-1],[1,1,0],[0,1,1],[-1,1,0]];
    for(var i=0;i<4;i++){ var j=(i+1)%4;
      q4([P(E,i,EAVE),P(E,j,EAVE),P(R,j,yr),P(R,i,yr)],outN[i],C.ROOF,1);
      q4([P(Ei,i,EAVE),P(Ei,j,EAVE),P(R,j,yr),P(R,i,yr)],[-outN[i][0],1,-outN[i][2]],C.ROOF,0.92);
      var a=P(R,i,yr), b=P(R,j,yr); segBox(M,[a[0],a[2]],[b[0],b[2]],yr-0.05,yr+0.16,0.32,C.ROOF_D,0.8); }
  })();

  /* ---------- south face, on the plaza ---------- */
  /* Trader Joe's, s 0..22.4: five arched shopfronts between stone piers */
  FS.block(-0.05,0.9,-0.05,0.4,0,TOP,C.CAST,0.85);                       /* corner quoin strip */
  for(var b=0;b<5;b++){ var s0=0.9+b*4.3; FS.tile(TL.SHOP_ARCH,s0+0.55,s0+4.05,0.35,4.5); FS.block(s0+4.05,s0+4.75,-0.05,0.3,0,GB0,C.CAST,0.8); }
  FS.flat(7.2,16.0,4.56,5.24,0.36,0xF6F2EA,1);
  sign(FS,11.6,4.9,0.38,"TRADER JOE'S",8.6,0.8,'#B3261E');
  floors(FS,0.9,23.6,7);
  /* centre bay, s 24..36: projects 0.7, gabled, with a stone oriel; the pergola stands in front */
  (function(){
    var FC=VK.face([X0+24,ZS+0.7],[X0+36,ZS+0.7],[0,1]);
    FC.brick(0,12,0,TOP,0);
    FS.brick(24,24.0001,0,0,0);
    VK.face([X0+24,ZS],[X0+24,ZS+0.7],[-1,0]).brick(0,0.7,0,TOP,0);
    VK.face([X0+36,ZS+0.7],[X0+36,ZS],[1,0]).brick(0,0.7,0,TOP,0);
    FC.block(-0.05,0.55,-0.05,0.18,0,TOP,C.CAST,0.85); FC.block(11.45,12.05,-0.05,0.18,0,TOP,C.CAST,0.85);
    FC.block(-0.3,12.3,-0.05,0.36,GB0,GB1,C.CAST,0.85);
    FC.block(-0.4,12.4,-0.05,0.62,TOP,EAVE,C.CAST,0.9);
    FC.tile(TL.DOOR,1.2,4.6,0.2,4.4); FC.tile(TL.SHOP,4.9,7.1,0.4,4.0); FC.tile(TL.DOOR,7.4,10.8,0.2,4.4);
    for(var k=0;k<4;k++){ FC.tile(k===3?TL.WIN_ARCH:TL.WIN,1.3,3.4,FL[k]+0.4,FL[k]+2.7); FC.tile(k===3?TL.WIN_ARCH:TL.WIN,8.6,10.7,FL[k]+0.4,FL[k]+2.7); }
    oriel(FC,4.3,7.7,0.85);
    gable(FC,-0.3,12.3,0.0,EAVE,EAVE+3.8,-8.4,true);
  })();
  /* Target, s 36..65.5: seven glass shopfronts, fascia with the name and bullseye */
  for(b=0;b<7;b++){ var t0=36.8+b*4.1; FS.block(t0-0.7,t0,-0.05,0.3,0,GB0,C.CAST,0.8); FS.tile(TL.SHOP,t0+0.15,t0+3.25,0.4,4.15); }
  FS.block(36.1,65.5,-0.05,0.2,4.3,GB0,C.CAST_L,0.85);
  disc(FS,46.4,4.8,0.4,0.24,0xCC0000); disc(FS,46.4,4.8,0.27,0.25,0xFFFFFF); disc(FS,46.4,4.8,0.13,0.26,0xCC0000);
  sign(FS,51.4,4.8,0.24,'TARGET',8.2,0.78,'#CC0000');
  floors(FS,36.6,65.3,9);

  /* ---------- the cream stone pavilion at the plaza / Hoover corner ---------- */
  (function(){
    var PX0=X1-13.5, PX1=X1+0.7, PZ0=ZS-13, PZ1=ZS+0.7, PH=23.0;
    var ring=[[PX0,PZ0],[PX1,PZ0],[PX1,PZ1],[PX0,PZ1]]; if(ringArea(ring)<0) ring.reverse();
    prism(M,ring,0,PH,C.CAST,C.CAST_D,0.86);
    var PR=[PX0,PX1,PZ0,PZ1];
    ledge(PR,0.3,GB0,GB1,C.CAST_L); ledge(PR,0.12,FL[3]-0.15,FL[3]+0.05,C.CAST_L); ledge(PR,0.4,TOP+0.6,TOP+1.1,C.CAST_L);
    ledge(PR,0.35,PH-0.6,PH,C.CAST_L); ledge(PR,0.12,0,0.6,C.CAST_D);
    ledge(PR,0.0,PH,PH+1.05,C.CAST); ledge([PX0+0.35,PX1-0.35,PZ0+0.35,PZ1-0.35],0.0,PH,PH+1.05,C.CAST_D,true);
    /* corner buttresses with pinnacles */
    [[PX0,PZ1],[PX1,PZ1],[PX1,PZ0]].forEach(function(c){
      postAt(M,c[0],c[1],0,PH+1.05,0.55,C.CAST_L,0.85); postAt(M,c[0],c[1],PH+1.05,PH+2.0,0.38,C.CAST_L,0.85);
      var t=[c[0],PH+3.6,c[1]], q=[[c[0]-0.38,c[1]-0.38],[c[0]+0.38,c[1]-0.38],[c[0]+0.38,c[1]+0.38],[c[0]-0.38,c[1]+0.38]];
      for(var i=0;i<4;i++){ var a=q[i], b2=q[(i+1)%4]; tri3([a[0],PH+2.0,a[1]],[b2[0],PH+2.0,b2[1]],t,[(a[0]+b2[0])/2-c[0],0.3,(a[1]+b2[1])/2-c[1]],C.CAST_L,0.9); } });
    flat(M,[[PX0+0.35,PZ0+0.35],[PX1-0.35,PZ0+0.35],[PX1-0.35,PZ1-0.35],[PX0+0.35,PZ1-0.35]],PH+0.02,0x8D8678,1);
    var PF=[VK.face([PX0,PZ1],[PX1,PZ1],[0,1]), VK.face([PX1,PZ1],[PX1,PZ0],[1,0])];
    PF.forEach(function(F,fi){ var L=F.L;
      /* ground floor: arched shopfronts (Target's corner entry) */
      F.tile(TL.SHOP_ARCH,1.3,5.6,0.6,5.05); F.tile(TL.SHOP_ARCH,L-5.6,L-1.3,0.6,5.05); F.tile(TL.BLANK_STONE,5.9,L-5.9,1.2,4.6);
      if(fi===0){ disc(F,L/2,3.0,0.85,0.05,0xCC0000); disc(F,L/2,3.0,0.57,0.06,0xFFFFFF); disc(F,L/2,3.0,0.29,0.07,0xCC0000); }
      else F.tile(TL.ROSE,L/2-1.3,L/2+1.3,1.6,4.2);
      /* residential floors: three bays of paired lancets */
      for(var k=0;k<3;k++) for(var bb=0;bb<3;bb++){ var c=1.2+(bb+0.5)*(L-2.4)/3, ya=Math.max(FL[k]+0.3,GB1+0.15); F.tile(TL.LANCET,c-1.25,c-0.05,ya,FL[k]+2.9); F.tile(TL.LANCET,c+0.05,c+1.25,ya,FL[k]+2.9); }
      row(F,1.2,L-1.2,3,TL.GOTHIC,FL[3]+0.3,FL[3]+2.95,1.9);
      /* attic: one tall traceried window between two lancets */
      F.tile(TL.GOTHIC,L/2-1.2,L/2+1.2,TOP+1.3,PH-0.75); F.tile(TL.LANCET,L/2-3.6,L/2-2.2,TOP+1.4,PH-0.9); F.tile(TL.LANCET,L/2+2.2,L/2+3.6,TOP+1.4,PH-0.9); });
    VK.collider(ring,PH);
  })();

  /* ---------- east face, on Hoover ---------- */
  FE.block(48.1,49.05,-0.05,0.4,0,TOP,C.CAST,0.85);
  for(b=0;b<4;b++){ var e0=14.0+b*4.0; FE.block(e0-0.7,e0,-0.05,0.3,0,GB0,C.CAST,0.8); FE.tile(TL.SHOP,e0+0.15,e0+3.15,0.4,4.15); }
  FE.block(29.3,30.0,-0.05,0.3,0,GB0,C.CAST,0.8);
  FE.block(30.0,34.0,-0.05,0.45,0,GB0,C.CAST_L,0.85); FE.tile(TL.DOOR,30.3,33.7,0.25,4.0,0.48); FE.tile(TL.BLANK_STONE,30.3,33.7,4.05,5.2,0.48);
  sign(FE,32.0,4.62,0.5,'COWLINGS',3.3,0.32,'#5B5145');
  FE.block(34.0,34.7,-0.05,0.3,0,GB0,C.CAST,0.8);
  for(b=0;b<3;b++){ var h0=34.95+b*4.4; FE.tile(TL.SHOP_ARCH,h0,h0+3.5,0.35,4.5); FE.block(h0+3.5,h0+4.2,-0.05,0.3,0,GB0,C.CAST,0.8); }
  floors(FE,13.6,20.0,2); oriel(FE,20.4,24.4,0.95); floors(FE,24.8,37.6,4); oriel(FE,38.0,42.0,0.95); floors(FE,42.4,48.1,2);
  gable(FE,25.6,36.8,0.0,EAVE,EAVE+3.5,-7.6,true);

  /* ---------- west face, on the service street ---------- */
  var BZ0=-577, BZ1=-570;                       /* the bridge spans z -577..-570 */
  var bs0=BZ0-ZN, bs1=BZ1-ZN;                    /* 32..39 on FW */
  FW.block(48.1,49.05,-0.05,0.4,0,TOP,C.CAST,0.85);
  for(b=0;b<6;b++){ var w0=1.0+b*4.8; FW.block(w0-0.7,w0,-0.05,0.3,0,GB0,C.CAST,0.8); FW.tile(b%3===1?TL.DOOR:TL.SHOP,w0+0.4,w0+3.7,0.4,4.3); }
  FW.block(29.1,29.8,-0.05,0.3,0,GB0,C.CAST,0.8);
  for(b=0;b<2;b++){ var a0=40.3+b*4.0; FW.tile(TL.SHOP_ARCH,a0,a0+3.4,0.35,4.5); FW.block(a0+3.4,a0+4.0,-0.05,0.3,0,GB0,C.CAST,0.8); }
  floors(FW,0.6,11.0,3); oriel(FW,11.4,15.4,0.9); floors(FW,15.8,bs0-0.6,5,undefined,BUILD_BRIDGE?[TL.WIN,TL.WIN,TL.WIN,TL.WIN_ARCH]:undefined);
  if(BUILD_BRIDGE){ row(FW,bs0+0.6,bs1-0.6,2,TL.WIN_ARCH,FL[3]+0.4,FL[3]+2.7,2.1); }
  else floors(FW,bs0,bs1,2);
  floors(FW,bs1+0.4,48.1,3);

  /* ---------- the pergola in front of the centre bay (OSM: building=roof) ---------- */
  (function(){
    var PX0=X0+23, PX1=X0+37, PZB=ZS+0.7, PZF=ZS+17, HB=4.0, HT=4.6;
    var cols=[[PX0+0.35,PZF-0.35],[(PX0+PX1)/2,PZF-0.35],[PX1-0.35,PZF-0.35],[PX0+0.35,(PZB+PZF)/2+0.5],[PX1-0.35,(PZB+PZF)/2+0.5]];
    cols.forEach(function(c){ postAt(M,c[0],c[1],0,0.5,0.4,C.CAST_D,0.8); postAt(M,c[0],c[1],0.5,HB,0.21,C.CAST_L,0.85); postAt(M,c[0],c[1],HB-0.3,HB,0.36,C.CAST,0.85);
      VK.collider([[c[0]-0.4,c[1]-0.4],[c[0]+0.4,c[1]-0.4],[c[0]+0.4,c[1]+0.4],[c[0]-0.4,c[1]+0.4]],HB); });
    segBox(M,[PX0+0.35,PZF-0.35],[PX1-0.35,PZF-0.35],HB,HT,0.5,C.CAST,0.8);
    segBox(M,[PX0+0.35,PZB],[PX0+0.35,PZF-0.35],HB,HT,0.5,C.CAST,0.8);
    segBox(M,[PX1-0.35,PZB],[PX1-0.35,PZF-0.35],HB,HT,0.5,C.CAST,0.8);
    for(var x=PX0+2.3;x<PX1-1;x+=2.0) segBox(M,[x,PZB],[x,PZF-0.35],HT-0.35,HT-0.05,0.18,C.BRONZE,0.8);   /* rafters */
    q4([[PX0,HT,PZB],[PX1,HT,PZB],[PX1,HT,PZF],[PX0,HT,PZF]],[0,-1,0],0xC9B89C,0.95);                      /* ceiling */
    var rr=[[PX0-0.5,PZB-1.2],[PX1+0.5,PZB-1.2],[PX1+0.5,PZF+0.5],[PX0-0.5,PZF+0.5]]; if(ringArea(rr)<0) rr.reverse();
    band(M,rr,HT,HT+0.22,0,C.CAST,0.95,0.7,true);
    hipRoof(M,rr,HT+0.22,2.8,7.4,ROOF2);
  })();

  /* ---------- the bridge to McCarthy over the service street ---------- */
  if(BUILD_BRIDGE)(function(){
    var BX0=21, BX1=X0, PW=1.2, SP=3.6, R=(BX1-BX0-2*PW)/2, CXs=(BX1-BX0)/2, YT=10.6, YW=14.6, YC=15.1;
    [[BX0,BX0+PW],[BX1-PW,BX1]].forEach(function(p){ var r=[[p[0],BZ0],[p[1],BZ0],[p[1],BZ1],[p[0],BZ1]]; prism(M,r,0,YT,C.CAST,C.CAST,0.8); VK.collider(r,YT); });
    var faces=[VK.face([BX0,BZ1],[BX1,BZ1],[0,1]), VK.face([BX1,BZ0],[BX0,BZ0],[0,-1])];
    /* arch angles, with the corner directions included so the spandrel reaches the corners */
    var ang=[], N=18, ca=Math.atan2(YT-SP,R); for(var i=0;i<=N;i++) ang.push(i/N*Math.PI); ang.push(ca); ang.push(Math.PI-ca); ang.sort(function(a,b){return a-b;});
    function bnd(a){ var dx=Math.cos(a), dy=Math.sin(a), t=1e9; if(Math.abs(dx)>1e-6) t=Math.min(t,R/Math.abs(dx)); if(dy>1e-6) t=Math.min(t,(YT-SP)/dy); return [dx*t,dy*t]; }
    faces.forEach(function(F){
      var c=F.L/2;
      for(var i=0;i<ang.length-1;i++){ var a0=ang[i], a1=ang[i+1]; if(a1-a0<1e-5) continue;
        var p0=[Math.cos(a0)*R,Math.sin(a0)*R], p1=[Math.cos(a1)*R,Math.sin(a1)*R], b0=bnd(a0), b1=bnd(a1);
        q4([F.p3(c+p0[0],0,SP+p0[1]),F.p3(c+b0[0],0,SP+b0[1]),F.p3(c+b1[0],0,SP+b1[1]),F.p3(c+p1[0],0,SP+p1[1])],F.want,C.CAST,0.92);
        /* the archivolt ring, a little proud */
        var r2=R+0.75; q4([F.p3(c+p0[0],0.07,SP+p0[1]),F.p3(c+Math.cos(a0)*r2,0.07,SP+Math.sin(a0)*r2),F.p3(c+Math.cos(a1)*r2,0.07,SP+Math.sin(a1)*r2),F.p3(c+p1[0],0.07,SP+p1[1])],F.want,C.CAST_L,1); }
      F.block(c-0.45,c+0.45,-0.05,0.22,SP+R-0.1,SP+R+1.0,C.CAST_L,0.85);                          /* keystone */
      F.block(PW-0.1,PW+0.25,-0.05,0.2,SP-0.35,SP,C.CAST_D,0.8); F.block(F.L-PW-0.25,F.L-PW+0.1,-0.05,0.2,SP-0.35,SP,C.CAST_D,0.8);   /* imposts */
      F.block(0,F.L,-0.05,0.3,YT,YT+0.45,C.CAST,0.85);
      F.brick(0,F.L,YT+0.45,YW,0);
      row(F,0.4,F.L-0.4,5,TL.WIN_ARCH,YT+0.85,YW-0.35,1.75);
      F.block(0,F.L,-0.05,0.45,YW,YC,C.CAST,0.85); });
    /* the soffit of the arch */
    for(i=0;i<ang.length-1;i++){ var a0=ang[i], a1=ang[i+1]; if(a1-a0<1e-5) continue;
      var x0=BX0+PW+R+Math.cos(a0)*R, y0=SP+Math.sin(a0)*R, x1=BX0+PW+R+Math.cos(a1)*R, y1=SP+Math.sin(a1)*R, am=(a0+a1)/2;
      q4([[x0,y0,BZ0],[x1,y1,BZ0],[x1,y1,BZ1],[x0,y0,BZ1]],[-Math.cos(am),-Math.sin(am),0],C.CAST_D,0.78); }
    VK.roof(pos([[BX0-0.2,BZ0],[BX1+0.2,BZ0],[BX1+0.2,BZ1],[BX0-0.2,BZ1]]),YC,2.2,0.35);
  })();

  /* colliders: the main block, the centre bay */
  VK.collider(pos([[X0,ZN],[X1,ZN],[X1,ZS],[X0,ZS]]),EAVE);
  VK.collider(pos([[X0+24,ZS-0.1],[X0+36,ZS-0.1],[X0+36,ZS+0.75],[X0+24,ZS+0.75]]),EAVE);
})();
