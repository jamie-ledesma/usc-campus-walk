/* ==================================================================
   The Ronald Tutor Campus Center courtyard (2010, AC Martin).
   The paved court between TCC (grid west), the Student Union (grid
   east) and Steven and Kathryn Sample Hall, which closes the far
   (grid south) end; it opens grid north onto the walk from Hahn
   Plaza through a row of cast bollards. Blue-gray stone in large
   fields between lighter granite bands, dozens of tan market
   umbrellas over dark brown wicker tables and chairs, big pots of
   flowers, lamps with lantern heads. Along TCC: the grand cast stone
   stair with a bronze lattice railing climbing to the second level
   walk, the fountain under it (gold mosaic niche, jets arcing back
   into the basin), shopfronts under a lettered parapet, the arcade,
   a storey of windows and the top loggia. Along the Student Union:
   broad cast stone seating terraces. Sample Hall's limestone end:
   three round arched entries with carved archivolts and dark green
   marble columns, the two carved names, french windows with iron
   balconettes, the pergola on the cornice and the cupola.
   Layout from the OSM footprints (TCC, Sample Hall, Student Union)
   and photos. Frame: TCC.P(u,v), the Hahn grid (u east, v south).
   ================================================================== */
(function(){
  if(!TCC) return;
  var P=TCC.P, loc=TCC.loc;
  var MW=new Mesher(), MG=new Mesher(), MQ=new Mesher(), cols=[], LAT={};
  var du=[0.8829,0.4695], dv=[-0.4695,0.8829];
  var BRICK=0x9E5540, CAST=0xD8CEB6, CASTL=0xE4DCC8, CASTD=0xBDB29A, LIME=0xD3C9B5, LIMED=0xB9AE97,
      STRIPE=0xA4543E, GLASS=0x3D4C54, GLASSD=0x4C5D66, DARK=0x2F2925, LIT=0xC9A85E, MARBLE=0x1F4B43,
      FRAME=0x26443D, BLUE=0x2D5F8A, GOLD=0xC99A3A, BRONZE=0x8C6A3A, WATER=0x2C84C6, WATERL=0x5FA8D6,
      SLATE=0x63717F, GRAN=0xBDBDB7, CONC=0xCAC4B6, BRK=0x9C5845;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function hsh(i){ var h=Math.sin(i*12.9898+78.233)*43758.5453; return h-Math.floor(h); }
  function gvec(a,b){ return [du[0]*a+dv[0]*b, du[1]*a+dv[1]*b]; }
  /* a frame on a wall: s along it from grid point A to B, t out from it (toward hint) */
  function Frame(A,B,hint){
    var o=P(A[0],A[1]), e=P(B[0],B[1]), L=Math.hypot(e[0]-o[0],e[1]-o[1]);
    var d=[(e[0]-o[0])/L,(e[1]-o[1])/L], h=gvec(hint[0],hint[1]);
    var n=[-d[1],d[0]]; if(n[0]*h[0]+n[1]*h[1]<0) n=[d[1],-d[0]];
    return {o:o,d:d,n:n,L:L,W:function(s,t){ return [o[0]+d[0]*s+n[0]*t, o[1]+d[1]*s+n[1]*t]; }};
  }
  var GF={W:function(u,v){ return P(u,v); }, n:gvec(0,-1)};      /* the grid itself */
  /* a box in a frame, cut into short pieces so no cap is lost as a needle */
  function fbox(M,F,s0,s1,t0,t1,y0,y1,col,sh){
    var ls=s1-s0, lt=t1-t0, ns=Math.max(1,Math.ceil(ls/Math.max(1.2,lt*8))), nt=Math.max(1,Math.ceil(lt/Math.max(1.2,ls*8)));
    for(var i=0;i<ns;i++) for(var j=0;j<nt;j++){
      var a=s0+ls*i/ns, b=s0+ls*(i+1)/ns, c=t0+lt*j/nt, e=t0+lt*(j+1)/nt;
      prism(M,ccw([F.W(a,c),F.W(b,c),F.W(b,e),F.W(a,e)]),y0,y1,col,col,sh===undefined?0.62:sh);
    }
  }
  function fsolid(F,s0,s1,t0,t1,h){ cols.push([ccw([F.W(s0,t0),F.W(s1,t0),F.W(s1,t1),F.W(s0,t1)]),h]); }
  /* a flat quad in a frame (trapezoid allowed), cut into pieces */
  function fflat(M,F,s0,s1,t0,t1,y,col,sh){
    var ls=s1-s0, lt=t1-t0, ns=Math.max(1,Math.ceil(ls/Math.max(1.5,lt*6))), nt=Math.max(1,Math.ceil(lt/Math.max(1.5,ls*6)));
    for(var i=0;i<ns;i++) for(var j=0;j<nt;j++){
      var a=s0+ls*i/ns, b=s0+ls*(i+1)/ns, c=t0+lt*j/nt, e=t0+lt*(j+1)/nt;
      flat(M,ccw([F.W(a,c),F.W(b,c),F.W(b,e),F.W(a,e)]),y,col,sh===undefined?1:sh);
    }
  }
  /* the same, facing down: soffits */
  function fdown(M,F,s0,s1,t0,t1,y,col){
    var c=rgb(col,0.8), ls=s1-s0, lt=t1-t0, ns=Math.max(1,Math.ceil(ls/Math.max(1.5,lt*6)));
    for(var i=0;i<ns;i++){ var a=s0+ls*i/ns, b=s0+ls*(i+1)/ns, r=ccw([F.W(a,t0),F.W(b,t0),F.W(b,t1),F.W(a,t1)]);
      M.tri([r[0][0],y,r[0][1]],[r[1][0],y,r[1][1]],[r[2][0],y,r[2][1]],c,c,c);
      M.tri([r[0][0],y,r[0][1]],[r[2][0],y,r[2][1]],[r[3][0],y,r[3][1]],c,c,c); }
  }
  /* an opening or panel on a wall face of a frame, facing out along t */
  function farch(M,F,s,t,y0,w,hs,ha,col,sh){ var p=F.W(s,t); archFace(M,p[0],p[1],-F.n[1],F.n[0],0,0,y0,w,hs,ha,col,sh); }
  /* a box between two 3-D points (rails), drawn both ways round */
  function bar(M,A,B,w,col){
    var tx=B[0]-A[0], ty=B[1]-A[1], tz=B[2]-A[2], L=Math.hypot(tx,ty,tz); if(L<1e-3) return;
    tx/=L; ty/=L; tz/=L;
    var hx=-tz, hz=tx, hl=Math.hypot(hx,hz)||1; hx/=hl; hz/=hl;
    var ux=-hz*ty, uy=hz*tx-hx*tz, uz=hx*ty, ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul;
    var c=rgb(col,1), cd=rgb(col,0.7), q=w/2;
    function C(P0,a,b){ return [P0[0]+(hx*a+ux*b)*q, P0[1]+uy*b*q, P0[2]+(hz*a+uz*b)*q]; }
    var S=[[1,1],[-1,1],[-1,-1],[1,-1]];
    for(var i=0;i<4;i++){ var a=S[i], b=S[(i+1)%4], cc=i===0?c:cd;
      var p0=C(A,a[0],a[1]), p1=C(B,a[0],a[1]), p2=C(B,b[0],b[1]), p3=C(A,b[0],b[1]);
      MW.quad(p0,p1,p2,p3,cc,cc,cc,cc); MW.quad(p3,p2,p1,p0,cc,cc,cc,cc); }
  }
  /* a lattice panel: the pattern is a texture; a and b are bottom points [x,y,z] */
  function lattice(kind,a,b,hgt,rep){
    (LAT[kind]||(LAT[kind]=[])).push([a,b,hgt,rep||0.6]);
  }
  /* add a three.js geometry into a Mesher through a matrix */
  var D3=new T.Object3D(), V3=new T.Vector3();
  function mat(x,y,z,rx,ry,rz,sx,sy,sz){ D3.position.set(x,y,z); D3.rotation.set(rx||0,ry||0,rz||0);
    D3.scale.set(sx===undefined?1:sx,sy===undefined?1:sy,sz===undefined?1:sz); D3.updateMatrix(); return D3.matrix.clone(); }
  function part(M,geo,col,m,sh){
    var g=geo.index?geo.toNonIndexed():geo, p=g.attributes.position.array, c=rgb(col,sh||1);
    function tp(i){ V3.set(p[i],p[i+1],p[i+2]).applyMatrix4(m); return [V3.x,V3.y,V3.z]; }
    for(var i=0;i<p.length;i+=9) M.tri(tp(i),tp(i+3),tp(i+6),c,c,c);
  }
  function inst(M,list,mt){
    var g=M.geom(), im=new T.InstancedMesh(g,mt||matWorld,Math.max(1,list.length)), D=new T.Object3D();
    list.forEach(function(q,i){ D.position.set(q[0],q[3]||0,q[1]); D.rotation.set(0,q[2]||0,0); D.scale.set(q[4]||1,q[4]||1,q[4]||1);
      D.updateMatrix(); im.setMatrixAt(i,D.matrix); });
    im.count=list.length; im.frustumCulled=false; im.raycast=function(){}; scene.add(im); return im;
  }

  /* ---- the walls of the court, as functions of v ---- */
  function uW(v){ return v<35.3?-53.7:-58.6+(v-34.6)*3.5/70.6; }
  function uE(v){ if(v<66.4) return -27.9+(v-30.7)*0.9/35.7; if(v<71.7) return -21.95;
    if(v<85.6) return -41.1-(v-71.7)*0.6/13.9; if(v<99.5) return -41.7-(v-85.6)*0.5/13.9; return -42.2; }
  var TW=Frame([-58.6,34.6],[-55.1,105.2],[1,0]);      /* TCC's long courtyard front */
  var NE=Frame([-53.7,35.3],[-53.7,18.3],[1,0]);       /* the TCC block at the mouth */
  var NS=Frame([-53.7,35.3],[-58.6,34.6],[0,1]);       /* its short south face */
  var SU=Frame([-27.9,30.7],[-27.0,66.4],[-1,0]);      /* the Student Union's courtyard side */
  var SH=Frame([-41.1,71.7],[-21.9,71.7],[0,-1]);      /* Sample Hall's end front */
  /* grid point -> stair frame (s,t) */
  function inTW(u,v){ var p=P(u,v), x=p[0]-TW.o[0], z=p[1]-TW.o[1]; return [x*TW.d[0]+z*TW.d[1], x*TW.n[0]+z*TW.n[1]]; }
  function inSU(u,v){ var p=P(u,v), x=p[0]-SU.o[0], z=p[1]-SU.o[1]; return [x*SU.d[0]+z*SU.d[1], x*SU.n[0]+z*SU.n[1]]; }

  /* ---- clear the old lawn trees off the court ---- */
  var APRON=TCC.apron;
  for(var i=TREE_POS.length-1;i>=0;i--){ var tp=TREE_POS[i];
    if(inRing(TCC.ring,tp[0],tp[1])||inRing(APRON,tp[0],tp[1])) TREE_POS.splice(i,1); }
  NO_LAWN_TREES.push(offsetRing(TCC.ring,1.0),APRON);

  /* ================= the paving ================= */
  var BV=[30.4,37.0,43.6,50.2,56.8,63.4,71.7,78.6,85.6,92.2,98.8,105.2], BRKS=[35.3,66.4],
      CU=[-70,-55.0,-48.6,-42.2,-35.8,-29.4,-10];
  var rows=[];
  for(i=0;i<BV.length-1;i++){
    var cuts=[BV[i]]; BRKS.forEach(function(b){ if(b>BV[i]&&b<BV[i+1]) cuts.push(b); }); cuts.push(BV[i+1]);
    for(var k=0;k<cuts.length-1;k++) rows.push([cuts[k],cuts[k+1],k===0,k===cuts.length-2,i]);
  }
  var nCell=0;
  rows.forEach(function(r){
    var v0=r[0], v1=r[1], e0=v0+1e-4, e1=v1-1e-4;
    for(var c=0;c<CU.length-1;c++){
      var a0=Math.max(CU[c],uW(e0)), b0=Math.min(CU[c+1],uE(e0)), a1=Math.max(CU[c],uW(e1)), b1=Math.min(CU[c+1],uE(e1));
      if(b0-a0<0.05&&b1-a1<0.05) continue;
      if(b0<a0) b0=a0; if(b1<a1) b1=a1;
      flat(MG,ccw([P(a0,v0),P(b0,v0),P(b1,v1),P(a1,v1)]),0.150,GRAN,1);
      var iv0=r[2]?0.35:0, iv1=r[3]?0.35:0, w0=b0-a0, w1=b1-a1;
      if(Math.min(w0,w1)<1.3||v1-v0-iv0-iv1<0.6) continue;
      var s0=v0+iv0, s1=v1-iv1, k0=(s0-v0)/(v1-v0), k1=(s1-v0)/(v1-v0);
      var A0=a0+(a1-a0)*k0+0.35, B0=b0+(b1-b0)*k0-0.35, A1=a0+(a1-a0)*k1+0.35, B1=b0+(b1-b0)*k1-0.35;
      flat(MG,ccw([P(A0,s0),P(B0,s0),P(B1,s1),P(A1,s1)]),0.156,SLATE,0.93+hsh(r[4]*7+c)*0.12);
      nCell++;
    }
  });
  /* the striped walk to Sample Hall's middle door */
  for(var sv=58,sk=0;sv<71.6;sv+=0.55,sk++)
    flat(MG,ccw([P(-32.9,sv),P(-30.1,sv),P(-30.1,Math.min(71.7,sv+0.55)),P(-32.9,Math.min(71.7,sv+0.55))]),0.162,sk%2?0x58636E:0xBFC0BC,1);
  /* the apron at the mouth: pale concrete with brick bands, as on the walk outside */
  fflat(MG,GF,-53.7,-27.9,25.6,30.4,0.150,CONC,1);
  fflat(MG,GF,-27.9,-6.2,25.6,30.0,0.150,CONC,1);
  [-49.4,-42.2,-35.0,-20.5,-13.3].forEach(function(u){ fflat(MG,GF,u-0.55,u+0.55,26.3,30.0,0.156,BRK,1); });
  for(var ju=-52.4;ju<-6.5;ju+=1.8) fflat(MG,GF,ju-0.03,ju+0.03,26.3,30.0,0.153,0xB3AEA3,1);
  /* a low cast stone bed of shrubs along the Student Union's walk front */
  (function(){ var S=Frame([-27.9,30.7],[9.3,30.2],[0,-1]);
    fbox(MW,S,0.6,21.2,0.0,1.3,0,0.5,CASTD,0.62); fbox(MW,S,0.75,21.05,0.15,1.15,0.5,0.95,0x3E6A34,0.7);
    fsolid(S,0.6,21.2,0,1.3,0.95); })();

  /* ================= TCC: the long courtyard front ================= */
  (function(){
    var F=TW, L=F.L, NB=16, PB=L/NB, T0=0.42;
    fbox(MW,F,0,L,0,T0,0,19.9,BRICK,0.56);
    fbox(MW,F,0,L,T0,T0+0.08,0,0.6,CASTD,0.66);
    /* banded piers on the ground storey: cream courses, glass drawn over them */
    [1.5,2.5,3.5].forEach(function(y){ fbox(MW,F,0,L,T0,T0+0.02,y,y+0.24,CAST,0.8); });
    fbox(MW,F,0,L,T0,T0+0.08,4.15,4.6,CAST,0.75);
    for(var k=0;k<NB;k++){
      var c=(k+0.5)*PB;
      farch(MW,F,c,T0+0.03,0.6,3.1,3.35,0,GLASS,1);
      farch(MW,F,c,T0+0.035,3.25,3.1,0.6,0,LIT,0.9);
      [-0.78,0.78].forEach(function(o){ fbox(MW,F,c+o-0.04,c+o+0.04,T0,T0+0.06,0.6,3.95,DARK,0.7); });
      /* the second level arcade behind the parapet */
      farch(MW,F,c,T0+0.03,4.6,3.6,3.05,1.8,CASTL,1);
      farch(MW,F,c,T0+0.04,4.6,3.0,3.05,1.5,DARK,1);
      /* third floor windows */
      farch(MW,F,c,T0+0.03,11.2,1.8,2.7,0,CAST,1);
      farch(MW,F,c,T0+0.04,11.35,1.35,2.4,0,0x46565E,1);
      fbox(MW,F,c-0.95,c+0.95,T0,T0+0.16,11.05,11.25,CAST,0.8);
      /* the top loggia: two openings a bay between cream piers */
      farch(MW,F,c,T0+0.03,14.6,PB,4.0,0,CAST,1);
      [-1.05,1.05].forEach(function(o){ farch(MW,F,c+o,T0+0.04,14.75,1.55,3.55,0,0x34302C,1); });
    }
    [10.25,14.2].forEach(function(y){ fbox(MW,F,0,L,T0,T0+0.12,y,y+0.42,CAST,0.78); });
    fbox(MW,F,0,L,T0,T0+0.13,18.6,19.9,CAST,0.8);
    fbox(MW,F,0,L,T0,T0+0.55,19.9,20.75,CASTL,0.62);
    fdown(MW,F,0,L,T0,T0+0.55,19.9,CASTD);
    /* the parapet of the second level walk: pierced panels, and the name; open where the stair lands */
    var GAP0=8.6, GAP1=12.9;
    [[0,GAP0],[GAP1,L]].forEach(function(r){
      fbox(MW,F,r[0],r[1],T0,1.15,4.6,5.75,CAST,0.62);
      fdown(MW,F,r[0],r[1],T0,1.15,4.6,CAST);
      fbox(MW,F,r[0]-0.03,r[1]+0.03,T0,1.22,5.75,5.9,CASTL,0.8);
    });
    for(k=0;k<NB;k++){
      var c2=(k+0.5)*PB;
      if(c2>GAP0-1.5&&c2<GAP1+1.5) continue;
      if(c2>26.5&&c2<41) continue;
      var a=F.W(c2-1.35,1.165), b=F.W(c2+1.35,1.165);
      farch(MW,F,c2,1.155,4.85,2.7,0.7,0,0x4A4038,1);
      lattice('stone',[a[0],4.85,a[1]],[b[0],4.85,b[1]],0.7,0.45);
    }
    var tx=F.W(33.7,1.15);
    facadeText('RONALD TUTOR CAMPUS CENTER',tx[0],tx[1],F.n[0],F.n[1],5.2,11.5,0.78,'#5A4E40');
    fsolid(F,0,L,0,0.5,20);
  })();

  /* ================= TCC: the block at the mouth ================= */
  (function(){
    var F=NE, L=F.L, T0=0.4, NB=4, PB=L/NB;
    fbox(MW,F,0,L,0,T0,0,19.9,BRICK,0.56);
    fbox(MW,F,0,L,T0,T0+0.06,0,7.3,CAST,0.62);
    fbox(MW,F,0,L,T0,T0+0.12,0,0.55,CASTD,0.66);
    fbox(MW,F,0,L,T0,T0+0.14,7.3,7.75,CASTL,0.75);
    for(var k=0;k<NB;k++){
      var c=(k+0.5)*PB;
      farch(MW,F,c,T0+0.07,0.55,3.7,3.55,1.85,CASTL,1);
      farch(MW,F,c,T0+0.08,0.55,3.0,3.55,1.5,GLASS,1);
      farch(MW,F,c,T0+0.09,4.1,3.0,0.0,1.5,BLUE,1);
      fbox(MW,F,c-1.5,c+1.5,T0+0.06,T0+0.14,4.0,4.12,CAST,0.8);
      [-0.75,0,0.75].forEach(function(o){ fbox(MW,F,c+o-0.04,c+o+0.04,T0+0.06,T0+0.12,0.55,4.0,DARK,0.7); });
      /* tall arched windows in cast stone surrounds, a balconette at the sill */
      farch(MW,F,c,T0+0.03,8.6,2.3,4.2,1.15,CAST,1);
      farch(MW,F,c,T0+0.04,8.75,1.8,4.05,0.9,0x46565E,1);
      fbox(MW,F,c-1.3,c+1.3,T0,T0+0.5,8.45,8.65,CAST,0.75);
      var a=F.W(c-1.1,T0+0.48), b=F.W(c+1.1,T0+0.48);
      lattice('iron',[a[0],8.65,a[1]],[b[0],8.65,b[1]],0.85,0.45);
      farch(MW,F,c,T0+0.03,14.6,PB,4.0,0,CAST,1);
      [-1.0,1.0].forEach(function(o){ farch(MW,F,c+o,T0+0.04,14.75,1.5,3.55,0,0x34302C,1); });
    }
    fbox(MW,F,0,L,T0,T0+0.12,14.2,14.6,CAST,0.78);
    fbox(MW,F,0,L,T0,T0+0.13,18.6,19.9,CAST,0.8);
    fbox(MW,F,0,L,T0,T0+0.55,19.9,20.75,CASTL,0.62);
    fdown(MW,F,0,L,T0,T0+0.55,19.9,CASTD);
    fsolid(F,0,L,0,0.55,20);
    /* its short face on the court */
    var S=NS;
    fbox(MW,S,0,S.L,0,T0,0,19.9,BRICK,0.56);
    fbox(MW,S,0,S.L,T0,T0+0.06,0,7.3,CAST,0.62);
    fbox(MW,S,0,S.L,T0,T0+0.14,7.3,7.75,CASTL,0.75);
    farch(MW,S,S.L/2,T0+0.07,0.55,3.4,3.55,1.7,CASTL,1);
    farch(MW,S,S.L/2,T0+0.08,0.55,2.7,3.55,1.35,GLASS,1);
    farch(MW,S,S.L/2,T0+0.09,4.1,2.7,0.0,1.35,BLUE,1);
    fbox(MW,S,0,S.L,T0,T0+0.12,14.2,14.6,CAST,0.78);
    fbox(MW,S,0,S.L,T0,T0+0.13,18.6,19.9,CAST,0.8);
    fbox(MW,S,0,S.L,T0,T0+0.55,19.9,20.75,CASTL,0.62);
    fsolid(S,0,S.L,0,0.5,20);
  })();

  /* ================= the grand stair and the fountain under it ================= */
  var STAIR={tA:0.45,tB:4.2};
  (function(){
    var F=TW, tA=STAIR.tA, tB=STAIR.tB, R=0.18, N=13, sFoot=27.5, s1=21.0, sL=19.0, s2=12.5, sTop=9.0;
    var tr1=(sFoot-s1)/N, tr2=(sL-s2)/N, H1=N*R, H2=2*N*R;
    function step(sa,sb,h){
      fbox(MW,F,sa,sb,tA,tB,0,h-0.03,CAST,0.6);
      fbox(MW,F,sa,sb,tA,tB+0.03,h-0.03,h,CASTL,0.75);
      fsolid(F,sa,sb,tA,tB,h);
      fsolid(F,sa,sb,tB-0.18,tB+0.08,h+1.05);          /* the railing */
    }
    for(var k=1;k<=N;k++) step(sFoot-k*tr1,sFoot-(k-1)*tr1,k*R);
    step(sL,s1,H1);
    for(k=1;k<=N;k++) step(sL-k*tr2,sL-(k-1)*tr2,H1+k*R);
    step(sTop,s2,H2);
    fsolid(F,sTop-0.08,sTop+0.2,tA,tB,H2+1.05);
    /* bronze lattice railing on the open side and across the top */
    function Y(s){ if(s>=s1) return (sFoot-s)/tr1*R; if(s>=sL) return H1; if(s>=s2) return H1+(sL-s)/tr2*R; return H2; }
    var tr=tB-0.1, pts=[sFoot,s1,sL,s2,sTop], RH=1.0;
    for(var p=0;p<pts.length-1;p++){
      var sa=pts[p], sb=pts[p+1], n=Math.max(1,Math.round(Math.abs(sa-sb)/2.2));
      for(var q=0;q<n;q++){
        var s0=sa+(sb-sa)*q/n, s3=sa+(sb-sa)*(q+1)/n, a=F.W(s0,tr), b=F.W(s3,tr);
        lattice('bronze',[a[0],Y(s0)+0.06,a[1]],[b[0],Y(s3)+0.06,b[1]],RH-0.1,0.55);
        bar(MW,[a[0],Y(s0),a[1]],[a[0],Y(s0)+RH+0.06,a[1]],0.09,BRONZE);
      }
      var A=F.W(sa,tr), B=F.W(sb,tr);
      bar(MW,[A[0],Y(sa)+RH,A[1]],[B[0],Y(sb)+RH,B[1]],0.08,BRONZE);
    }
    var e0=F.W(sTop,tr), e1=F.W(sTop,tA+0.1);
    lattice('bronze',[e0[0],H2+0.06,e0[1]],[e1[0],H2+0.06,e1[1]],RH-0.1,0.55);
    bar(MW,[e0[0],H2+RH,e0[1]],[e1[0],H2+RH,e1[1]],0.08,BRONZE);
    bar(MW,[e1[0],H2,e1[1]],[e1[0],H2+RH+0.06,e1[1]],0.09,BRONZE);
    /* the newel at the foot */
    fbox(MW,F,sFoot,sFoot+0.6,tB-0.6,tB+0.05,0,1.15,CAST,0.62);
    fbox(MW,F,sFoot-0.05,sFoot+0.65,tB-0.65,tB+0.1,1.15,1.3,CASTL,0.8);
    fsolid(F,sFoot,sFoot+0.6,tB-0.6,tB+0.05,1.3);

    /* ---- the fountain: gold mosaic niche in the stair's side, a ledge, the basin, arcing jets ---- */
    var NC=15.75;
    farch(MW,F,NC,tB+0.02,0.55,3.5,1.15,1.75,CASTL,1);
    farch(MW,F,NC,tB+0.03,0.55,2.8,1.15,1.4,GOLD,1.05);
    farch(MW,F,NC,tB+0.04,2.15,1.6,0.0,0.8,0xE0BC5A,1.1);
    fbox(MW,F,NC-1.7,NC+1.7,tB,tB+0.75,0,1.05,CAST,0.62);
    fflat(MW,F,NC-1.6,NC+1.6,tB+0.05,tB+0.68,1.06,WATERL,1);
    (function(){ var a=F.W(NC-1.6,tB+0.78), b=F.W(NC+1.6,tB+0.78), c=rgb(0xDCF1FB,1);
      MQ.quad([a[0],1.05,a[1]],[b[0],1.05,b[1]],[b[0],0.42,b[1]],[a[0],0.42,a[1]],c,c,c,c); })();
    var bs0=12.9, bs1=18.6, bt0=tB, bt1=7.3;
    function bring(o){ return ccw([F.W(bs0-o,bt0),F.W(bs1+o,bt0),F.W(bs1+o,bt1-0.8+o*0.4),F.W(bs1-0.8,bt1+o),F.W(bs0+0.8,bt1+o),F.W(bs0-o,bt1-0.8+o*0.4)]); }
    var outer=bring(0.0), inner=bring(-0.4);
    band(MW,outer,0,0.5,0,CAST,0.95,0.6,true);
    band(MW,bring(0.08),0.5,0.62,0,CASTL,1,0.8,true);
    (function(){ var o=bring(0.08), n2=inner, c=rgb(CASTL,1);
      for(var k2=0;k2<o.length;k2++){ var q2=(k2+1)%o.length;
        MW.quad([o[k2][0],0.62,o[k2][1]],[n2[k2][0],0.62,n2[k2][1]],[n2[q2][0],0.62,n2[q2][1]],[o[q2][0],0.62,o[q2][1]],c,c,c,c); } })();
    band(MW,inner.slice().reverse(),0.1,0.62,0,0x968F80,0.86,0.5,true);
    flat(MW,inner,0.42,WATER,1);
    cols.push([outer,0.9]);
    /* jets from the front rim arcing back toward the niche */
    var jm=new T.MeshLambertMaterial({color:0xE2F3FB,transparent:true,opacity:0.62,flatShading:true});
    var reach=2.4, ha=1.5, NJ=9;
    var arc=new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(0,0,0),new T.Vector3(-reach*0.5,ha*2,0),new T.Vector3(-reach,0,0)),12,0.04,4,false);
    var iA=new T.InstancedMesh(arc,jm,NJ), D=new T.Object3D(), th=Math.atan2(-F.n[1],F.n[0]);
    for(k=0;k<NJ;k++){
      var sj=bs0+0.9+(bs1-bs0-1.8)*k/(NJ-1), pj=F.W(sj,bt1-0.55);
      D.position.set(pj[0],0.44,pj[1]); D.rotation.set(0,th,0); D.scale.set(1,0.85+0.3*hsh(k+3),1); D.updateMatrix(); iA.setMatrixAt(k,D.matrix);
    }
    iA.frustumCulled=false; iA.raycast=function(){}; iA.userData.noShadow=true; scene.add(iA);
    STAIR.zone=[7.5,29.0,8.6];
  })();

  /* ================= the Student Union side: seating terraces ================= */
  (function(){
    var F=SU, a=5.0, b=25.5;
    [[0,2.2,1.26],[2.2,3.4,0.84],[3.4,4.6,0.42]].forEach(function(r){
      fbox(MW,F,a,b,r[0],r[1],0,r[2]-0.04,CAST,0.58);
      fbox(MW,F,a,b,r[0],r[1]+0.04,r[2]-0.04,r[2],CASTL,0.78);
      fsolid(F,a,b,r[0],r[1],r[2]);
    });
    [7,14.5,22].forEach(function(s){ var p=F.W(s,5.6); campusLamp(MW,p[0],p[1],4.2,false); });
    /* the cast stone name wall at the corner, facing the walk */
    var W0=-26.8, W1=-22.2, WV=28.6;
    fbox(MW,GF,W0,W1,WV-0.25,WV+0.25,0,0.95,CAST,0.62);
    fbox(MW,GF,W0-0.05,W1+0.05,WV-0.3,WV+0.3,0.95,1.05,CASTL,0.8);
    fbox(MW,GF,W0,W1,WV+0.3,WV+1.6,0,0.55,CASTD,0.62);
    fbox(MW,GF,W0+0.1,W1-0.1,WV+0.4,WV+1.5,0.55,1.1,0x355E2E,0.7);
    var tp=P((W0+W1)/2,WV-0.26);
    facadeText('RONALD TUTOR CAMPUS CENTER',tp[0],tp[1],GF.n[0],GF.n[1],0.6,4.2,0.36,'#4A4034');
    cols.push([ccw([P(W0,WV-0.3),P(W1,WV-0.3),P(W1,WV+1.6),P(W0,WV+1.6)]),1.1]);
  })();

  /* ================= Sample Hall's end front ================= */
  (function(){
    var F=SH, L=F.L, T0=0.32, AC=[4.4,9.6,14.8];
    fbox(MW,F,0,L,0,T0,0,18.4,LIME,0.6);
    fbox(MW,F,0,L,T0,T0+0.08,0,0.5,LIMED,0.66);
    [0.95,2.95,5.65,10.05,12.15,15.55].forEach(function(y){ fbox(MW,F,0,L,T0,T0+0.015,y,y+0.16,STRIPE,0.8); });
    AC.forEach(function(c){
      farch(MW,F,c,T0+0.02,7.28,4.5,0.02,2.25,0xC2B69C,1);           /* carved archivolt */
      farch(MW,F,c,T0+0.03,0.5,3.5,6.8,1.75,GLASSD,1);
      farch(MW,F,c,T0+0.035,3.9,3.4,0.75,0,LIT,1.0);
      [-0.6,0.6].forEach(function(o){ fbox(MW,F,c+o-0.04,c+o+0.04,T0,T0+0.07,0.5,8.9,0x3A3A36,0.7); });
      [3.0,5.3,7.3].forEach(function(y){ fbox(MW,F,c-1.75,c+1.75,T0,T0+0.07,y,y+0.08,0x3A3A36,0.7); });
      /* dark green marble columns either side, stone base and capital */
      [-2.05,2.05].forEach(function(o){ var s=c+o;
        fbox(MW,F,s-0.32,s+0.32,T0,T0+0.38,0,0.6,LIMED,0.62);
        fbox(MW,F,s-0.26,s+0.26,T0,T0+0.32,0.6,5.6,MARBLE,0.7);
        fbox(MW,F,s-0.34,s+0.34,T0,T0+0.4,5.6,6.1,0xDDD3BE,0.75);
      });
    });
    var t1=F.W(L/2,T0);
    facadeText('STEVEN AND KATHRYN SAMPLE HALL',t1[0],t1[1],F.n[0],F.n[1],10.75,16.5,0.85,'#463C31');
    fbox(MW,F,-0.05,L+0.05,T0,T0+0.32,11.75,12.1,0xDDD3BE,0.72);
    fbox(MW,F,-0.05,L+0.05,T0,T0+0.18,11.6,11.75,LIMED,0.6);
    /* french windows with iron balconettes */
    [4.8,9.6,14.4].forEach(function(c){
      farch(MW,F,c,T0+0.02,12.6,1.9,3.95,0,FRAME,1);
      farch(MW,F,c,T0+0.03,12.75,1.45,3.6,0,0x4D5E62,1);
      fbox(MW,F,c-0.03,c+0.03,T0,T0+0.06,12.75,16.35,FRAME,0.7);
      fbox(MW,F,c-0.73,c+0.73,T0,T0+0.06,15.35,15.42,FRAME,0.7);
      fbox(MW,F,c-1.15,c+1.15,T0,T0+0.22,16.55,16.8,0xDDD3BE,0.75);
      fbox(MW,F,c-1.2,c+1.2,T0,T0+0.62,12.45,12.6,0xDDD3BE,0.72);
      var a=F.W(c-1.1,T0+0.58), b=F.W(c+1.1,T0+0.58);
      lattice('iron',[a[0],12.6,a[1]],[b[0],12.6,b[1]],1.0,0.4);
      [-1.1,1.1].forEach(function(o){ var p=F.W(c+o,T0+0.58), q=F.W(c+o,T0);
        lattice('iron',[p[0],12.6,p[1]],[q[0],12.6,q[1]],1.0,0.4); });
      bar(MW,[a[0],13.62,a[1]],[b[0],13.62,b[1]],0.05,0x24221F);
    });
    var t2=F.W(L/2,T0);
    facadeText('RONALD TUTOR CAMPUS CENTER',t2[0],t2[1],F.n[0],F.n[1],17.35,14.5,0.8,'#463C31');
    fsolid(F,0,L,0,0.7,18.4);
    /* the pergola storey on the cornice: columns, glass behind, a thin slatted canopy */
    var Y0=19.1, Y1=22.25;
    for(var k=0;k<8;k++){
      var s=0.7+k*(L-1.4)/7, p=F.W(s,0.15), r=ccw(ngon(p[0],p[1],0.26,10,0));
      prism(MW,r,Y0,Y1-0.25,CASTL,CASTL,0.66);
      prism(MW,ccw(ngon(p[0],p[1],0.36,10,0)),Y1-0.25,Y1,CASTL,CASTL,0.8);
      prism(MW,ccw(ngon(p[0],p[1],0.34,10,0)),Y0,Y0+0.2,CASTL,CASTL,0.7);
    }
    fbox(MW,F,0.4,L-0.4,-1.5,-1.3,Y0,Y1,0x46545C,0.8);
    for(k=0;k<=8;k++){ var sm=0.4+k*(L-0.8)/8; fbox(MW,F,sm-0.06,sm+0.06,-1.32,-1.22,Y0,Y1,CASTL,0.8); }
    fbox(MW,F,-1.3,L+1.3,1.35,1.6,Y1,Y1+0.4,CASTL,0.7);
    fbox(MW,F,-1.3,-1.1,-3.5,1.6,Y1,Y1+0.4,CASTL,0.7);
    fbox(MW,F,L+1.1,L+1.3,-3.5,1.6,Y1,Y1+0.4,CASTL,0.7);
    for(var ss=-0.9;ss<L+1.0;ss+=0.55) fbox(MW,F,ss-0.06,ss+0.06,-3.5,1.4,Y1+0.12,Y1+0.32,CASTL,0.66);
    fbox(MW,F,-1.3,L+1.3,-3.6,1.6,Y1+0.4,Y1+0.47,0xE9E3D4,0.6);
    fdown(MW,F,-1.3,L+1.3,-3.6,1.6,Y1+0.39,0xCFC6B2);
    /* the cupola */
    var cp=F.W(L/2,-7.5);
    prism(MW,ccw(ngon(cp[0],cp[1],1.7,8,0.39)),Y1+0.47,Y1+0.9,CASTL,CASTL,0.7);
    prism(MW,ccw(ngon(cp[0],cp[1],1.35,8,0.39)),Y1+0.9,Y1+2.4,0x6E7F86,0x6E7F86,0.8);
    for(k=0;k<8;k++){ var ag=0.39+k/8*6.283185; postAt(MW,cp[0]+Math.cos(ag)*1.33,cp[1]+Math.sin(ag)*1.33,Y1+0.9,Y1+2.4,0.09,CASTL,0.8); }
    prism(MW,ccw(ngon(cp[0],cp[1],1.6,8,0.39)),Y1+2.4,Y1+2.65,CASTL,CASTL,0.75);
    coneRoof(MW,cp[0],cp[1],1.55,Y1+2.65,1.15,0x9AA8A0,8);
    postAt(MW,cp[0],cp[1],Y1+3.7,Y1+4.3,0.05,0x5A5A55,0.8);
  })();

  /* ================= furniture: instanced ================= */
  var WICK=0x3E2C21, WICKL=0x4C3627, TOPC=0x4A3628;
  var box=function(w,h,d){ return new T.BoxGeometry(w,h,d); };
  function chair(M,ang,r){
    var x=Math.cos(ang)*r, z=Math.sin(ang)*r, ry=Math.PI-ang;      /* local +x points at the table */
    function at(lx,ly,lz){ var c=Math.cos(ry), s=Math.sin(ry); return [x+lx*c+lz*s, ly, z-lx*s+lz*c]; }
    function pb(w,h,d,lx,ly,lz,col){ var p=at(lx,ly,lz); part(M,box(w,h,d),col,mat(p[0],p[1],p[2],0,ry,0)); }
    pb(0.48,0.08,0.48,0,0.45,0,WICKL);
    pb(0.07,0.5,0.48,-0.23,0.74,0,WICK);
    [-0.2,0.2].forEach(function(a){ [-0.2,0.2].forEach(function(b){ pb(0.04,0.42,0.04,a,0.21,b,WICK); }); });
    [-0.23,0.23].forEach(function(b){ pb(0.44,0.05,0.05,-0.02,0.66,b,WICK); pb(0.05,0.2,0.05,0.18,0.56,b,WICK); });
  }
  var SQ=new Mesher(), RD=new Mesher();
  part(SQ,box(0.8,0.04,0.8),TOPC,mat(0,0.74,0)); part(SQ,box(0.08,0.72,0.08),0x2B2622,mat(0,0.36,0));
  part(SQ,box(0.55,0.04,0.08),0x2B2622,mat(0,0.02,0)); part(SQ,box(0.08,0.04,0.55),0x2B2622,mat(0,0.02,0));
  for(i=0;i<4;i++) chair(SQ,i*Math.PI/2,0.78);
  part(RD,new T.CylinderGeometry(0.44,0.44,0.04,12),TOPC,mat(0,0.74,0)); part(RD,box(0.08,0.72,0.08),0x2B2622,mat(0,0.36,0));
  part(RD,new T.CylinderGeometry(0.26,0.3,0.04,8),0x2B2622,mat(0,0.02,0));
  for(i=0;i<3;i++) chair(RD,i*Math.PI*2/3+0.5,0.76);
  var UM=new Mesher(), TAN=0xC4A16C, TAND=0xA48352;
  part(UM,new T.CylinderGeometry(0.035,0.035,2.85,6),0x6E6A64,mat(0,1.42,0));
  part(UM,new T.ConeGeometry(1.9,0.55,4,1,true),TAN,mat(0,2.6,0,0,Math.PI/4,0));
  part(UM,new T.PlaneGeometry(2.68,2.68),0xF0D8A8,mat(0,2.33,0,Math.PI/2,0,0),1.0);
  [0,1,2,3].forEach(function(k){ var a=k*Math.PI/2;
    part(UM,box(2.7,0.14,0.02),TAN,mat(Math.cos(a)*1.34,2.27,Math.sin(a)*1.34,0,-a+Math.PI/2,0),0.9); });
  part(UM,box(0.08,0.12,0.08),0x6E6A64,mat(0,2.92,0));
  /* where things may stand */
  function freeAt(u,v,pad){
    if(v<34.2||v>69.4) return false;
    if(u<uW(v)+1.6+pad||u>uE(v)-1.6-pad) return false;
    if(Math.abs(u+42.2)<1.7+pad) return false;
    if(Math.abs(v-50)<1.4+pad&&u>-50.5) return false;
    if(v>56&&Math.abs(u+31.5)<2.2+pad) return false;
    var st=inTW(u,v); if(st[0]>STAIR.zone[0]-pad&&st[0]<STAIR.zone[1]+pad&&st[1]<STAIR.zone[2]+pad) return false;
    var su=inSU(u,v); if(su[0]>4-pad&&su[0]<27+pad&&su[1]<6.7+pad) return false;
    return true;
  }
  var SQL=[], RDL=[], UML=[], n=0;
  for(var gu=-53.3,ci=0;gu<-28;gu+=2.95,ci++) for(var gv=35.6,ri=0;gv<69.2;gv+=3.15,ri++){
    var uu=gu+(hsh(ci*31+ri)-0.5)*0.4, vv=gv+(hsh(ci*17+ri*5)-0.5)*0.4;
    if(!freeAt(uu,vv,0.55)) continue;
    var p=P(uu,vv), ry=Math.atan2(du[1],du[0])*-1+(hsh(ci+ri*13)-0.5)*0.5, round=((ci+ri*2)%3)===0;
    (round?RDL:SQL).push([p[0],p[1],ry,0.15]);
    if((ci+ri)%2===0) UML.push([p[0],p[1],-Math.atan2(du[1],du[0]),0.15]);
    cols.push([ccw(ngon(p[0],p[1],0.55,6,0)),0.8]);
    n++;
  }
  /* a row of tables on the top terrace walk and a few by the stair foot */
  inst(SQ,SQL); inst(RD,RDL); inst(UM,UML);

  /* ---- bollards across the mouth ---- */
  var BO=new Mesher(), prof=[[0,0],[0.2,0],[0.21,0.06],[0.16,0.12],[0.12,0.3],[0.17,0.48],[0.18,0.58],[0.12,0.7],
       [0.09,0.78],[0.15,0.82],[0.15,0.86],[0.07,0.88],[0.11,0.95],[0.12,1.02],[0.08,1.09],[0,1.11]]
       .map(function(q){ return new T.Vector2(q[0],q[1]); });
  part(BO,new T.LatheGeometry(prof,10),0x5E574C,mat(0,0,0));
  part(BO,new T.CylinderGeometry(0.26,0.28,0.1,10),0xBDB29A,mat(0,0.05,0));
  var BOL=[];
  for(var bu=-52.5;bu<=-29.0;bu+=1.96){ var bp=P(bu,30.9); BOL.push([bp[0],bp[1],0,0.15]); cols.push([ccw(ngon(bp[0],bp[1],0.22,6,0)),1.2]); }
  inst(BO,BOL);

  /* ---- planters: flowers and cordyline in big pots, spiral topiary by the doors ---- */
  var PA=new Mesher(), PB2=new Mesher();
  var pot=[[0,0],[0.36,0],[0.44,0.08],[0.5,0.68],[0.56,0.74],[0.56,0.8],[0,0.8]].map(function(q){ return new T.Vector2(q[0],q[1]); });
  part(PA,new T.LatheGeometry(pot,10),0x8A6248,mat(0,0,0));
  part(PA,new T.IcosahedronGeometry(0.45,0),0x4F7A38,mat(0,0.95,0,0,0,0,1,0.55,1));
  for(i=0;i<11;i++){ var fa=i/11*6.283; part(PA,new T.OctahedronGeometry(0.06,0),i%3?0xF2C230:0xC0352E,mat(Math.cos(fa)*0.36,1.06+(i%2)*0.06,Math.sin(fa)*0.36)); }
  for(i=0;i<6;i++){ var fb=i/6*6.283+0.3; part(PA,new T.ConeGeometry(0.05,1.0,3),0x5A3A48,mat(Math.cos(fb)*0.12,1.35,Math.sin(fb)*0.12,Math.sin(fb)*0.35,0,-Math.cos(fb)*0.35)); }
  part(PB2,new T.LatheGeometry(pot,10),0x8A6248,mat(0,0,0,0,0,0,0.8,0.9,0.8));
  for(i=0;i<7;i++){ var hr=0.3-i*0.03, ha2=i*1.6; part(PB2,new T.DodecahedronGeometry(hr,0),0x2F5A2A,mat(Math.cos(ha2)*0.1,0.9+i*0.27,Math.sin(ha2)*0.1)); }
  part(PB2,new T.ConeGeometry(0.1,0.35,6),0x2F5A2A,mat(0,2.9,0));
  var PAL=[], PBL=[];
  function pa(u,v){ var p=P(u,v); PAL.push([p[0],p[1],hsh(u*3+v),0.15]); cols.push([ccw(ngon(p[0],p[1],0.55,6,0)),0.95]); }
  [59.5,62.2,64.9,67.6].forEach(function(v){ pa(-33.9,v); pa(-29.1,v); });
  pa(-52.3,33.6); pa(-46.0,33.0);
  [[3.5,5.4],[26.6,5.4]].forEach(function(q){ var p=SU.W(q[0],q[1]), l=loc(p); pa(l[0],l[1]); });
  [7.0,12.2].forEach(function(s){ var p=SH.W(s,1.3); PBL.push([p[0],p[1],0,0.15]); cols.push([ccw(ngon(p[0],p[1],0.45,6,0)),0.95]); });
  [1.6,17.6].forEach(function(s){ var p=SH.W(s,1.3), l=loc(p); pa(l[0],l[1]); });
  inst(PA,PAL); inst(PB2,PBL);

  /* ---- lamps with lantern heads ---- */
  [[3.0,3.2],[31.5,3.4],[42,3.0],[52,3.0]].forEach(function(q){ var p=TW.W(q[0],q[1]); campusLamp(MW,p[0],p[1],4.2,false); });
  [[-40.4,69.6],[-23.6,69.6],[-50.6,32.4],[-37.6,33.0]].forEach(function(q){ var p=P(q[0],q[1]); campusLamp(MW,p[0],p[1],4.2,false); });

  /* ================= finish ================= */
  function latTex(kind){
    var cv=document.createElement('canvas'); cv.width=64; cv.height=128;
    var g=cv.getContext('2d'); g.clearRect(0,0,64,128);
    var col=kind==='bronze'?'#8C6A3A':(kind==='iron'?'#24221F':'#D9CFB8');
    g.strokeStyle=col; g.fillStyle=col; g.lineWidth=kind==='stone'?7:4;
    g.beginPath();
    for(var s=-1;s<=1;s+=2){ g.moveTo(32,6); for(var y=6;y<=122;y+=2){ g.lineTo(32+s*26*Math.sin((y-6)/116*Math.PI*2-Math.PI/2)*0.5+s*13, y); } }
    g.stroke();
    g.beginPath(); g.moveTo(0,64); g.bezierCurveTo(20,40,44,40,64,64); g.moveTo(0,64); g.bezierCurveTo(20,88,44,88,64,64); g.stroke();
    g.fillRect(0,0,64,7); g.fillRect(0,121,64,7);
    g.fillRect(0,0,4,128); g.fillRect(60,0,4,128);
    var tx=new T.CanvasTexture(cv); tx.wrapS=T.RepeatWrapping; tx.wrapT=T.ClampToEdgeWrapping; return tx;
  }
  Object.keys(LAT).forEach(function(kind){
    var IP=[], IU=[];
    LAT[kind].forEach(function(q){
      var a=q[0], b=q[1], h=q[2], L=Math.hypot(b[0]-a[0],b[2]-a[2]), u=Math.max(1,Math.round(L/q[3]));
      IP.push(a[0],a[1],a[2], b[0],b[1],b[2], b[0],b[1]+h,b[2],  a[0],a[1],a[2], b[0],b[1]+h,b[2], a[0],a[1]+h,a[2]);
      IU.push(0,0, u,0, u,1,  0,0, u,1, 0,1);
    });
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(IP,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(IU,2));
    g.computeVertexNormals(); g.computeBoundingSphere();
    var m=new T.Mesh(g,new T.MeshLambertMaterial({map:latTex(kind),alphaTest:0.5,side:T.DoubleSide}));
    m.frustumCulled=false; m.userData.noShadow=true; m.raycast=function(){}; scene.add(m);
  });
  var mq=new T.Mesh(MQ.geom(),new T.MeshLambertMaterial({color:0xDCF1FB,transparent:true,opacity:0.55,
    flatShading:true,side:T.DoubleSide,depthWrite:false}));
  mq.frustumCulled=false; mq.userData.noShadow=true; mq.raycast=function(){}; scene.add(mq);
  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; scene.add(mg);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  window.__tcc={tables:n,umbrellas:UML.length,cells:nCell,tris:MW.count()+MG.count()};
})();
