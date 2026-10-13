/* ==================================================================
   Widney Alumni House (1880), USC's first building. a_world.js leaves
   the footprint empty (HAND_HALLS).

   A two storey white wood frame Italianate house. Horizontal clapboard,
   corner boards and flat pilasters either side of the centre bay, a flat
   belt at the floor line, tall narrow 2-over-2 sash windows with flat
   cornice heads, a frieze and wide cornice on small brackets, a low gray
   hip roof with a small pediment (with a lunette) over the centre bay,
   two gabled dormers and a white balustraded deck on top. The centred
   entrance has paired panelled doors with sidelights and a transom
   under a flat entablature reading ALUMNI HOUSE on two consoles, reached
   by a brick stoop with black iron rails. A low brick planter wall with
   a cream cap runs along the front, full of low shrubs; a bench and a
   bronze plaque stand in front of it.

   Footprint from OpenStreetMap (way 154906712, 2 levels, 13 m): about
   16.7 m along the front and 16.8 m deep, square to the campus grid.
   The front faces grid south, straight down Pardee Way to the gate at
   Exposition. Moved here (north side of Childs Way) in 1997.
   Grid coords: u grid east, v grid north. Front wall frames run u
   the other way (grid west), so +u there is the viewer's left.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Widney Alumni House') B=CAMPUS[bi];
  if(!B) return;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var A=27.6*Math.PI/180, EX=Math.cos(A), EZ=Math.sin(A), NX=Math.sin(A), NZ=-Math.cos(A);
  function W(u,v){ return [u*EX+v*NX, u*EZ+v*NZ]; }
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function rect(u0,u1,v0,v1){ return ccw([W(u0,v0),W(u1,v0),W(u1,v1),W(u0,v1)]); }
  function solid(r,h){ cols.push([r,h]); }
  function frame(u,v,ou,ov,L){
    var c=W(u,v), nx=ou*EX+ov*NX, nz=ou*EZ+ov*NZ;
    return {x:c[0],z:c[1],dx:-nz,dz:nx,nx:nx,nz:nz,L:L};
  }
  /* a bar between two points in 3D (rails, raking cornices); drawn both ways round */
  function beam(p0,y0,p1,y1,w,h,col,sh){
    var dx=p1[0]-p0[0], dz=p1[1]-p0[1], L=Math.hypot(dx,dz)||1, nx=-dz/L*w/2, nz=dx/L*w/2;
    var c=rgb(col,sh===undefined?0.8:sh), cd=rgb(col,(sh===undefined?0.8:sh)*0.75);
    var a=[p0[0]+nx,y0,p0[1]+nz], b=[p0[0]-nx,y0,p0[1]-nz], e=[p1[0]+nx,y1,p1[1]+nz], f=[p1[0]-nx,y1,p1[1]-nz];
    var a2=[a[0],y0+h,a[2]], b2=[b[0],y0+h,b[2]], e2=[e[0],y1+h,e[2]], f2=[f[0],y1+h,f[2]];
    [[a,e,e2,a2,cd],[b,f,f2,b2,cd],[a2,e2,f2,b2,c],[a,e,f,b,cd]].forEach(function(q){
      M.quad(q[0],q[1],q[2],q[3],q[4],q[4],q[4],q[4]); M.quad(q[0],q[3],q[2],q[1],q[4],q[4],q[4],q[4]); });
  }

  var WHITE=0xFAFAF7, SHADOW=0xDAD9D3, TRIM=0xFFFFFF, SASH=0xE2E1DA, GLASS=0x2A333B, GLASSL=0x3C4954,
      FOUND=0xC4BFB5, ROOF=0x9A9C9A, ROOFD=0x767877, DECK=0xB9B8B2,
      BRICK=0xA4553F, BRICKD=0x8C4532, BRICKT=0xB8705A, CAP=0xE2D8BE, IRON=0x1E2022,
      SOIL=0x4A3A2C, GREEN=0x47783A, GREENL=0x5C8C46, GREEND=0x37612E, BRONZE=0x5E4A2E, GRAN=0x8F8B84;

  /* the house: u U0..U1, v VF (front) .. VB (back) */
  var U0=256.2, U1=272.9, VF=-5.3, VB=11.5, UC=(U0+U1)/2, VC=(VF+VB)/2, HW=(U1-U0)/2, HD=(VB-VF)/2;
  var GF=0.9;                      /* ground floor level */
  var FR=10.2, CO=10.75, EV=11.05; /* frieze bottom, cornice bottom, eave top */
  var house=rect(U0,U1,VF,VB);
  prism(M,house,0,EV,WHITE,WHITE,0.86); solid(house,EV+1.4);
  /* painted foundation */
  band(M,house,0,0.78,0.05,FOUND,0.95,0.7,true);
  band(M,house,0.78,0.86,0.08,TRIM,1,0.8,true);
  /* clapboard: a shadow line under every board */
  for(var y=0.86+0.2;y<FR-0.05;y+=0.2) band(M,house,y,y+0.035,0.012,SHADOW,1,1,true);
  /* the belt at the floor line, the frieze, the cornice */
  band(M,house,5.85,6.12,0.07,TRIM,1,0.78,true);
  band(M,house,6.12,6.18,0.11,TRIM,1,0.7,true);
  band(M,house,FR,CO,0.035,TRIM,1,0.82,true);
  band(M,house,FR-0.08,FR,0.07,TRIM,1,0.7,true);
  var eave=offsetRing(house,0.78);
  band(M,eave,CO,EV,0,TRIM,1,0.82,true);
  band(M,offsetRing(house,0.84),EV-0.1,EV+0.02,0,TRIM,1,0.7,true);
  /* soffit, facing down */
  var hin=offsetRing(house,0.03), cs=rgb(WHITE,0.62);
  for(var i=0;i<4;i++){ var a=hin[i], b=hin[(i+1)%4], c=eave[(i+1)%4], d=eave[i];
    M.quad([a[0],CO,a[1]],[d[0],CO,d[1]],[c[0],CO,c[1]],[b[0],CO,b[1]],cs,cs,cs,cs); }

  /* ---------- roof: low hip, flat deck with a balustrade ---------- */
  var RISE=2.0, INS=6.6, DY=EV+RISE;
  hipRoof(M,eave,EV,RISE,INS,ROOF);
  var deck=offsetRing(eave,-INS);
  flat(M,offsetRing(deck,-0.05),DY+0.01,DECK,1);
  var bal=offsetRing(deck,-0.12);
  for(i=0;i<4;i++){ var p0=bal[i], p1=bal[(i+1)%4], L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
    segBox(M,p0,p1,DY,DY+0.1,0.14,TRIM,0.75);
    segBox(M,p0,p1,DY+0.68,DY+0.78,0.16,TRIM,0.85);
    var n=Math.round(L/0.24);
    for(var k=1;k<n;k++){ var t=k/n; postAt(M,p0[0]+(p1[0]-p0[0])*t,p0[1]+(p1[1]-p0[1])*t,DY+0.1,DY+0.68,0.03,TRIM,0.8); }
    postAt(M,p0[0],p0[1],DY,DY+0.88,0.1,TRIM,0.75);
    postAt(M,p0[0],p0[1],DY+0.88,DY+0.94,0.13,TRIM,0.85);
  }

  /* ---------- the four walls ---------- */
  var FF=frame(UC,VF,0,-1,2*HW), FB=frame(UC,VB,0,1,2*HW), FE=frame(U1,VC,1,0,2*HD), FW=frame(U0,VC,-1,0,2*HD);
  var KF=wallKit(M,FF), KB=wallKit(M,FB), KE=wallKit(M,FE), KW=wallKit(M,FW);
  /* a tall 2-over-2 sash window: sill height y0, glass w x h */
  function win(K,u,y0,w,h){
    K.face(u,0.03,y0,w,h,0,GLASS,1);
    K.face(u,0.036,y0+h*0.5,w,h*0.5,0,GLASSL,0.9);
    K.face(u,0.05,y0,w,0.07,0,SASH,1); K.face(u,0.05,y0+h-0.07,w,0.07,0,SASH,1);
    K.face(u,0.05,y0+h*0.5-0.05,w,0.1,0,SASH,1);
    K.face(u-w/2+0.035,0.05,y0,0.07,h,0,SASH,1); K.face(u+w/2-0.035,0.05,y0,0.07,h,0,SASH,1);
    K.face(u,0.05,y0,0.05,h,0,SASH,1);
    K.box(u-w/2-0.15,u-w/2,0,0.08,y0,y0+h,TRIM,0.8); K.box(u+w/2,u+w/2+0.15,0,0.08,y0,y0+h,TRIM,0.8);
    K.box(u-w/2-0.2,u+w/2+0.2,0,0.13,y0-0.1,y0,TRIM,0.85);
    K.box(u-w/2-0.15,u+w/2+0.15,0,0.08,y0+h,y0+h+0.3,TRIM,0.8);
    K.box(u-w/2-0.27,u+w/2+0.27,0,0.18,y0+h+0.3,y0+h+0.42,TRIM,0.88);
  }
  var Y1=GF+0.75, H1=3.0, Y2=6.85, H2=2.85, WW=1.05;
  function pil(K,u,w,y0,y1){ K.box(u-w/2,u+w/2,0,0.07,y0,y1,TRIM,0.8); K.box(u-w/2-0.05,u+w/2+0.05,0,0.11,y1-0.22,y1,TRIM,0.85); }
  /* corner boards (each wall carries its own half) */
  [[KF,HW],[KB,HW],[KE,HD],[KW,HD]].forEach(function(q){ pil(q[0],-q[1]+0.15,0.3,0.86,FR); pil(q[0],q[1]-0.15,0.3,0.86,FR); });
  /* front: five bays, the middle one framed by pilasters and holding the door */
  [-6.1,-3.05,0,3.05,6.1].forEach(function(u){ win(KF,u,Y2,WW,H2); if(u) win(KF,u,Y1,WW,H1); });
  pil(KF,-1.75,0.36,0.86,FR); pil(KF,1.75,0.36,0.86,FR);
  /* back: five bays, a plain door in the middle */
  [-6.1,-3.05,0,3.05,6.1].forEach(function(u){ win(KB,u,Y2,WW,H2); if(u) win(KB,u,Y1,WW,H1); });
  KB.box(-0.75,0.75,0,0.1,GF-0.1,GF+2.6,TRIM,0.8); KB.face(0,0.11,GF,1.15,2.4,0,0xE4E3DC,1);
  KB.face(0,0.12,GF+1.35,0.8,0.9,0,GLASS,1); KB.box(-0.9,0.9,0,0.25,GF+2.6,GF+2.75,TRIM,0.85);
  var bs=ccw([KB.P(-1.2,0),KB.P(1.2,0),KB.P(1.2,1.4),KB.P(-1.2,1.4)]); prism(M,bs,0,GF-0.02,BRICK,BRICKT,0.65); solid(bs,GF-0.02);
  /* sides: four bays */
  [KE,KW].forEach(function(K){ [-5.9,-2.0,2.0,5.9].forEach(function(u){ win(K,u,Y2,WW,H2); win(K,u,Y1,WW,H1); }); });
  /* small brackets under the cornice, paired at the corners */
  [[KF,HW],[KB,HW],[KE,HD],[KW,HD]].forEach(function(q){
    var K=q[0], L=q[1], n=Math.round((2*L-0.6)/0.95);
    for(var k=0;k<=n;k++){ var u=-L+0.3+k*(2*L-0.6)/n;
      K.box(u-0.07,u+0.07,0.03,0.62,CO-0.2,CO,TRIM,0.7);
      K.box(u-0.07,u+0.07,0.03,0.3,CO-0.48,CO-0.2,TRIM,0.66); }
  });

  /* ---------- the pediment over the centre bay ---------- */
  var PW=2.65, PY=12.35, PV=0.8;
  KF.gable(-PW,PW,PV,EV,PY,WHITE);
  KF.roof(-PW-0.25,PW+0.25,PV+0.12,-1.8,EV-0.05,PY+0.12,ROOF,ROOFD);
  KF.gable(-PW-0.25,PW+0.25,-1.8,EV-0.05,PY+0.12,ROOFD);
  var pl=KF.P(-PW-0.2,PV+0.05), pm=KF.P(0,PV+0.05), pr=KF.P(PW+0.2,PV+0.05);
  beam(pl,EV-0.02,pm,PY-0.02,0.22,0.2,TRIM,0.9); beam(pm,PY-0.02,pr,EV-0.02,0.22,0.2,TRIM,0.9);
  KF.face(0,PV+0.02,EV+0.18,1.05,0,0.52,TRIM,1); KF.face(0,PV+0.04,EV+0.24,0.8,0,0.4,GLASS,1);
  KF.face(0,PV+0.05,EV+0.24,0.05,0.4,0,TRIM,1);

  /* ---------- dormers, front and back ---------- */
  var slopeY=function(dv){ return EV+RISE*Math.max(0,dv+0.78)/INS; };
  [KF,KB].forEach(function(K){ [-2.85,2.85].forEach(function(u){
    var v0=-1.9, v1=-5.0, y0=slopeY(1.9)-0.3, yt=13.25, yr=13.95, w=0.85;
    K.box(u-w,u+w,v1,v0,y0,yt,WHITE,0.7);
    K.gable(u-w,u+w,v0,yt,yr-0.08,WHITE);
    K.roof(u-w-0.18,u+w+0.18,v0+0.18,v1,yt-0.08,yr,ROOF,ROOFD);
    K.box(u-w-0.05,u+w+0.05,v0,v0+0.08,yt-0.12,yt,TRIM,0.85);
    [-0.36,0.36].forEach(function(o){ K.face(u+o,v0+0.02,y0+0.6,0.55,0.95,0,TRIM,1); K.face(u+o,v0+0.04,y0+0.66,0.42,0.83,0,GLASS,1); });
  }); });

  /* ---------- the entrance ---------- */
  /* paired panelled doors with sidelights and a transom, in a cased opening */
  KF.face(0,0.03,GF,2.6,3.65,0,TRIM,1);
  [-0.46,0.46].forEach(function(u){
    KF.face(u,0.05,GF,0.88,3.0,0,0xEFEEE8,1);
    [[0.25,1.05],[1.5,1.25]].forEach(function(p){ KF.face(u,0.06,GF+p[0],0.6,p[1],0,0xDCDBD3,1); KF.face(u,0.065,GF+p[0]+0.06,0.48,p[1]-0.12,0,0xEDECE6,1); });
  });
  KF.face(0,0.07,GF,0.04,3.0,0,0x9A9890,1);
  [-1.13,1.13].forEach(function(u){ KF.face(u,0.05,GF+0.95,0.34,2.0,0,GLASS,1); KF.face(u,0.06,GF,0.34,0.9,0,0xE6E5DE,1); });
  KF.face(0,0.05,GF+3.12,2.6,0.45,0,GLASS,1);
  [-0.65,0,0.65].forEach(function(u){ KF.face(u,0.06,GF+3.12,0.05,0.45,0,TRIM,1); });
  /* lantern hanging in the transom */
  var lp=KF.P(0,0.25); postAt(M,lp[0],lp[1],GF+3.25,GF+3.55,0.1,IRON,0.7); postAt(M,lp[0],lp[1],GF+3.3,GF+3.5,0.07,0xF2DDA0,1);
  /* pilasters, consoles, the entablature with the name */
  KF.box(-1.6,-1.3,0,0.14,GF,4.62,TRIM,0.8); KF.box(1.3,1.6,0,0.14,GF,4.62,TRIM,0.8);
  KF.box(-1.65,1.65,0,0.16,4.62,5.32,TRIM,0.82);
  [-1.45,1.45].forEach(function(u){ KF.box(u-0.11,u+0.11,0.16,0.44,4.72,5.32,TRIM,0.72); KF.box(u-0.08,u+0.08,0.14,0.3,4.42,4.72,TRIM,0.7); });
  KF.box(-1.95,1.95,0,0.5,5.32,5.48,TRIM,0.85); KF.box(-2.05,2.05,0,0.58,5.48,5.62,TRIM,0.9);
  var nm=KF.P(0,0.17); facadeText('ALUMNI HOUSE',nm[0],nm[1],FF.nx,FF.nz,4.97,2.4,0.34,'#3A3833');

  /* brick stoop: landing at the door, four steps down */
  var SW=2.1, LD=1.3, TD=0.3, steps=[];
  var land=ccw([KF.P(-SW,0),KF.P(SW,0),KF.P(SW,LD),KF.P(-SW,LD)]);
  prism(M,land,0,GF-0.04,BRICK,BRICK,0.62); solid(land,GF);
  prism(M,ccw([KF.P(-SW,LD-0.3),KF.P(SW,LD-0.3),KF.P(SW,LD+0.03),KF.P(-SW,LD+0.03)]),GF-0.04,GF,BRICKT,BRICKT,0.7);
  for(k=0;k<4;k++){ var v0=LD+k*TD, top=GF-0.18*(k+1);
    var st=ccw([KF.P(-SW+0.3,v0),KF.P(SW-0.3,v0),KF.P(SW-0.3,v0+TD),KF.P(-SW+0.3,v0+TD)]);
    prism(M,st,0,top-0.03,BRICK,BRICK,0.6); solid(st,top);
    prism(M,ccw([KF.P(-SW+0.3,v0),KF.P(SW-0.3,v0),KF.P(SW-0.3,v0+TD+0.03),KF.P(-SW+0.3,v0+TD+0.03)]),top-0.03,top,BRICKT,BRICKT,0.72);
    steps.push(st); }
  var SB=LD+4*TD;  /* foot of the stoop */
  /* brick cheek walls beside the steps with cream caps */
  [-1,1].forEach(function(s){
    var r=KF.box(s<0?-SW:SW-0.3,s<0?-SW+0.3:SW,0,SB,0,GF+0.05,BRICKD,0.62); solid(r,GF+0.1);
    KF.box(s<0?-SW-0.03:SW-0.33,s<0?-SW+0.33:SW+0.03,0,SB+0.03,GF+0.05,GF+0.13,CAP,0.85);
  });
  /* black iron handrails down both sides */
  [-1,1].forEach(function(s){ var u=s*(SW-0.45);
    var a=KF.P(u,0.15), b=KF.P(u,LD), c=KF.P(u,SB-0.15);
    beam(a,GF+0.85,b,GF+0.85,0.05,0.05,IRON,0.7); beam(b,GF+0.85,c,0.18+0.85,0.05,0.05,IRON,0.7);
    postAt(M,b[0],b[1],GF,GF+0.9,0.025,IRON,0.7); postAt(M,c[0],c[1],0.18,0.18+0.9,0.025,IRON,0.7);
    var m=KF.P(u,(LD+SB)/2); postAt(M,m[0],m[1],0.54,0.54+0.88,0.02,IRON,0.7);
    var e=KF.P(u,SB+0.15); beam(c,0.18+0.85,e,0.95,0.05,0.05,IRON,0.7); postAt(M,e[0],e[1],0,1.0,0.025,IRON,0.7);
  });

  /* ---------- the planter wall along the front, low shrubs behind it ---------- */
  var PWV=SB-0.05, PT=0.34, PH=0.72, PE=HW+0.6;
  [-1,1].forEach(function(s){
    var u0=s<0?-PE:SW, u1=s<0?-SW:PE;
    var r=KF.box(u0,u1,PWV-PT,PWV,0,PH,BRICK,0.62); solid(r,PH+0.1);
    KF.box(u0-(s<0?0.04:0),u1+(s>0?0.04:0),PWV-PT-0.04,PWV+0.04,PH,PH+0.08,CAP,0.85);
    var ue=s*PE, re=KF.box(ue-(s>0?PT:0),ue+(s<0?PT:0),0,PWV-PT,0,PH,BRICK,0.62); solid(re,PH+0.1);
    KF.box(ue-(s>0?PT+0.04:0.04),ue+(s<0?PT+0.04:0.04),0,PWV-PT,PH,PH+0.08,CAP,0.85);
    /* soil and shrubs */
    var su0=s<0?-PE+PT:SW+0.3, su1=s<0?-SW-0.3:PE-PT;
    prism(M,ccw([KF.P(su0,0.08),KF.P(su1,0.08),KF.P(su1,PWV-PT),KF.P(su0,PWV-PT)]),0,PH-0.12,SOIL,SOIL,0.6);
    var n=Math.round((su1-su0)/0.75);
    for(var k=0;k<n;k++){ var u=su0+(k+0.5)*(su1-su0)/n, h=0.45+((k*37+(s>0?11:0))%7)*0.07, vv=0.75+((k*53)%5)*0.12;
      var p=KF.P(u,vv);
      prism(M,ccw(ngon(p[0],p[1],0.46,9,k)),PH-0.15,PH-0.15+h,GREEND,GREEN,0.62);
      prism(M,ccw(ngon(p[0],p[1],0.32,9,k+0.4)),PH-0.15+h,PH-0.05+h+0.12,GREEN,GREENL,0.7); }
  });
  /* a few clipped shrubs along the sides of the house */
  [[KE,HD],[KW,HD]].forEach(function(q){ var K=q[0];
    for(var u=-q[1]+1.2;u<q[1]-0.8;u+=1.9){ var p=K.P(u,0.85);
      prism(M,ccw(ngon(p[0],p[1],0.55,7,u)),0,0.75,GREEND,GREEN,0.62);
      prism(M,ccw(ngon(p[0],p[1],0.36,7,u+0.3)),0.75,0.95,GREEN,GREENL,0.7); } });

  /* ---------- bench, plaque and the sign stand in front ---------- */
  var bench=function(u,v){
    KF.box(u-0.85,u+0.85,v,v+0.45,0.42,0.47,0x2B302C,0.75);
    KF.box(u-0.85,u+0.85,v-0.02,v+0.05,0.47,0.92,0x2B302C,0.7);
    [-0.8,0.8].forEach(function(o){ KF.box(u+o-0.04,u+o+0.04,v,v+0.45,0,0.68,IRON,0.6); });
    var r=ccw([KF.P(u-0.9,v),KF.P(u+0.9,v),KF.P(u+0.9,v+0.5),KF.P(u-0.9,v+0.5)]); solid(r,0.95);
  };
  bench(3.9,PWV+0.3); bench(-7.0,PWV+0.3);
  /* bronze plaque on a low granite block, tilted up */
  var pq=KF.box(-4.9,-3.1,PWV+0.35,PWV+1.0,0,0.38,GRAN,0.66); solid(pq,0.5);
  var q0=KF.P(-4.8,PWV+0.95), q1=KF.P(-3.2,PWV+0.95), q2=KF.P(-3.2,PWV+0.42), q3=KF.P(-4.8,PWV+0.42), cb=rgb(BRONZE,0.9);
  M.quad([q0[0],0.4,q0[1]],[q1[0],0.4,q1[1]],[q2[0],0.56,q2[1]],[q3[0],0.56,q3[1]],cb,cb,cb,cb);
  M.quad([q0[0],0.4,q0[1]],[q3[0],0.56,q3[1]],[q2[0],0.56,q2[1]],[q1[0],0.4,q1[1]],cb,cb,cb,cb);
  /* the history sign stand at the west end */
  var sg=KF.P(8.6,PWV+0.6); postAt(M,sg[0],sg[1],0,1.0,0.04,IRON,0.6);
  KF.box(8.15,9.05,PWV+0.55,PWV+0.65,1.0,1.55,0x2D2F31,0.7); KF.face(8.6,PWV+0.66,1.05,0.8,0.45,0,0xD8D2C0,0.95);

  /* keep trees and props off the house and its front */
  var keep=[offsetRing(house,3.0),ccw([KF.P(-PE-1,0),KF.P(PE+1,0),KF.P(PE+1,PWV+1.6),KF.P(-PE-1,PWV+1.6)])];
  keep.forEach(function(r){ NO_PLANT.push(r); NO_LAWN_TREES.push(r); });
  for(var t=TREE_POS.length-1;t>=0;t--) for(var q=0;q<keep.length;q++)
    if(inRing(keep[q],TREE_POS[t][0],TREE_POS[t][1])){ TREE_POS.splice(t,1); break; }

  /* paint reads gray under the scene light: lift the whites a little */
  for(i=0;i<M.c.length;i+=3){ var r0=M.c[i],g0=M.c[i+1],b0=M.c[i+2];
    if(b0>0.78&&r0-b0<0.06&&b0-r0<0.06&&g0>0.78) { M.c[i]=r0*1.14; M.c[i+1]=g0*1.14; M.c[i+2]=b0*1.14; } }
  B.h=14.0;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  if(MG.count()){ var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg); }
  window.__widney={tris:M.count()};
})();
