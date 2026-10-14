/* ==================================================================
   Galen Center (2006, HNTB), USC's 10,258 seat arena, 3400 S. Figueroa
   Street, on the south east corner of Figueroa and Jefferson, across
   Figueroa from campus with Flower Street and the 110 behind it.
   a_world.js leaves the footprint empty (HAND_HALLS); the old raked
   bowl from the stadium list is gone (world.txt ##S).

   From outside it is a big closed box: a buff precast concrete arena
   about 27 m high, striped with thin courses of red brick over a brick
   base storey, with stepped boxy roof volumes rising to about 31 m.
   West front on Figueroa (the address front): a long brick facade of
   paired piers and tall narrow windows over two storeys, the glazed
   entrance bay in the middle (two tiers of curtain wall over the doors
   and the 3400 band), a cast stone ground storey banded with brick, and
   the wide cast stone entablature carrying GALEN CENTER.
   North front on Jefferson: a projecting brick pavilion of six tall
   glazed bays under its own GALEN CENTER band (the big north windows
   that look at downtown), flanked by the striped walls; a line of brick
   piers with cast stone caps, red gates and hedges along the street,
   Mexican fan palms.
   South west: the student entrance, a broad concrete stair with steel
   rails up from the Figueroa sidewalk to a raised plaza between brick
   retaining walls with cast stone coping, palms and round shade trees,
   in front of the lower practice pavilion's brick wall of tall glazed
   slots.
   Footprint from OpenStreetMap way 406923895 (height 29.8 m), as
   world.txt has it. Frame: the campus grid, u east, v south (metres).
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Galen Center') B=CAMPUS[bi];
  if(!B) return;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var du=[0.8829,0.4695], dv=[-0.4695,0.8829];
  var BRICK=0xB0593C, BRICKD=0x9C4D35, CAST=0xD4C29C, CASTL=0xDFD0AE, CASTD=0xB9A780,
      CONC=0xCFC1A3, STRIPE=0xA9563D, ROOF=0xB4AEA3, GLASS=0x323F4A, GLASSB=0x4E6E86,
      MULL=0x3B3E42, DOOR=0x2E5A45, GATE=0xC0252F, HEDGE=0x3C6B33, PAVE=0xCBC4B5,
      STEPC=0xCAC3B4, RAIL=0xBCC1C5, GOLD=0xD9A83A;
  function P(u,v){ return [u*du[0]+v*dv[0], u*du[1]+v*dv[1]]; }
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ var a=Math.min(u0,u1), b=Math.max(u0,u1), c=Math.min(v0,v1), d=Math.max(v0,v1);
    return ccw([P(a,c),P(b,c),P(b,d),P(a,d)]); }
  function box(u0,u1,v0,v1,y0,y1,col,sh){ var r=R(u0,u1,v0,v1); prism(M,r,y0,y1,col,col,sh===undefined?0.62:sh); return r; }
  function solid(r,h){ cols.push([r,h]); }
  /* a wall: plane u=c (axis 0) or v=c (axis 1), out=+1/-1; s runs along the wall, t out of it */
  function Face(axis,c,out){
    var n=axis===0?[du[0]*out,du[1]*out]:[dv[0]*out,dv[1]*out];
    var G=function(s,t){ return axis===0?[c+out*t,s]:[s,c+out*t]; };
    return {n:n,G:G,W:function(s,t){ var g=G(s,t); return P(g[0],g[1]); }};
  }
  /* an upright rectangle on a wall, facing out */
  function fq(F,s0,s1,y0,y1,t,col,sh){
    var a=F.W(s0,t), b=F.W(s1,t), c=rgb(col,sh===undefined?1:sh);
    var A=[a[0],y0,a[1]], Bv=[b[0],y0,b[1]], C=[b[0],y1,b[1]], D=[a[0],y1,a[1]];
    var ex=b[0]-a[0], ez=b[1]-a[1];
    if(-ez*F.n[0]+ex*F.n[1]<0) M.quad(Bv,A,D,C,c,c,c,c); else M.quad(A,Bv,C,D,c,c,c,c);
  }
  /* a box on a wall: s0..s1 along, t0..t1 out */
  function fb(F,s0,s1,t0,t1,y0,y1,col,sh){
    var g0=F.G(s0,t0), g1=F.G(s1,t1); return box(g0[0],g1[0],g0[1],g1[1],y0,y1,col,sh);
  }
  function V3(u,v,y){ var p=P(u,v); return [p[0],y,p[1]]; }
  function q2(a,b,c,d,col,sh){ var k=rgb(col,sh===undefined?1:sh); M.quad(a,b,c,d,k,k,k,k); M.quad(d,c,b,a,k,k,k,k); }
  /* a block along u whose bottom and top slope: b0/h0 at u0, b1/h1 at u1 */
  function sblock(u0,u1,v0,v1,b0,b1,h0,h1,col){
    var a=V3(u0,v0,b0), b=V3(u1,v0,b1), c=V3(u1,v1,b1), d=V3(u0,v1,b0),
        A=V3(u0,v0,h0), Bt=V3(u1,v0,h1), C=V3(u1,v1,h1), D=V3(u0,v1,h0);
    q2(a,b,Bt,A,col,0.8); q2(d,c,C,D,col,0.8); q2(a,d,D,A,col,0.7); q2(b,c,C,Bt,col,0.7); q2(A,Bt,C,D,col,1);
  }
  /* a thin rod between two points (handrails) */
  function bar(A,Bp,w,col){
    var dx=Bp[0]-A[0], dz=Bp[2]-A[2], L=Math.hypot(dx,dz)||1, sx=-dz/L*w/2, sz=dx/L*w/2;
    var a1=[A[0]+sx,A[1],A[2]+sz], a2=[A[0]-sx,A[1],A[2]-sz], a3=[a2[0],A[1]+w,a2[2]], a4=[a1[0],A[1]+w,a1[2]];
    var b1=[Bp[0]+sx,Bp[1],Bp[2]+sz], b2=[Bp[0]-sx,Bp[1],Bp[2]-sz], b3=[b2[0],Bp[1]+w,b2[2]], b4=[b1[0],Bp[1]+w,b1[2]];
    q2(a1,b1,b4,a4,col,0.85); q2(a2,b2,b3,a3,col,0.85); q2(a4,b4,b3,a3,col,1);
  }
  function text(F,s,t,y,str,hgt,col){ var p=F.W(s,t); facadeText(str,p[0],p[1],F.n[0],F.n[1],y,hgt*1024/96,hgt,col); }

  /* ================= plan (grid u,v) ================= */
  var UW=395, UA=401, UE=488.5, VN=-333.8, VM=-236, VS=-178, UB=407;   /* walls */
  var HS=22.5, HA=27.0, HB=21.0;
  var sC=-285, uC=440;                         /* centres of the west and north fronts */
  var YP=3.6;                                  /* the student entrance plaza */
  /* clear the generic trees off the block before planting ours */
  var zone=R(384,UE+2,VN-23,VS+2);
  for(var t2=TREE_POS.length-1;t2>=0;t2--) if(inRing(zone,TREE_POS[t2][0],TREE_POS[t2][1])) TREE_POS.splice(t2,1);

  /* ================= massing ================= */
  var rStrip=box(UW,UA,VN,VM,0,HS,CONC,0.6), rA=box(UA,UE,VN,VM,0,HA,CONC,0.6), rB=box(UB,UE,VM,VS,0,HB,CONC,0.6);
  solid(rStrip,HS); solid(rA,HA); solid(rB,HB);
  flat(M,R(UA+0.4,UE-0.4,VN+0.4,VM-0.4),HA+0.02,ROOF,1);
  flat(M,R(UW+0.4,UA,VN+0.4,VM-0.4),HS+0.02,ROOF,0.95);
  flat(M,R(UB+0.4,UE-0.4,VM+0.4,VS-0.4),HB+0.02,ROOF,0.95);
  /* parapet copings */
  [[UW,UA,VN,VM,HS],[UA,UE,VN,VM,HA],[UB,UE,VM,VS,HB]].forEach(function(q){
    band(M,offsetRing(R(q[0],q[1],q[2],q[3]),0.12),q[4]-0.15,q[4]+0.4,0,CASTL,1,0.75,true); });
  /* the stepped roof volumes over the bowl */
  var BOX=[[411,479,-325,-246,30.0],[404,419,-331,-318,31.2],[470,486,-331,-318,31.8],[404,419,-250,-238,30.8],[470,486,-250,-238,31.4],
           [418,478,-228,-186,23.6]];
  BOX.forEach(function(q){
    var base=q[4]>25?HA:HB, r=box(q[0],q[1],q[2],q[3],base,q[4],CONC,0.66);
    flat(M,offsetRing(r,-0.3),q[4]+0.02,ROOF,0.92);
    band(M,offsetRing(r,0.1),q[4]-0.12,q[4]+0.3,0,CASTL,1,0.75,true);
    solid(r,q[4]);
  });

  /* ================= striped walls and brick base storey ================= */
  function stripes(F,s0,s1,top,y0){
    for(var y=y0||7.9;y<top-2.2;y+=1.75) fq(F,s0,s1,y,y+0.36,0.03,STRIPE,0.92);
  }
  function base(F,s0,s1,doorStep){
    fq(F,s0,s1,0,6.2,0.03,BRICK,0.9);
    fb(F,s0,s1,0,0.32,6.2,6.95,CAST,0.72);
    fb(F,s0,s1,0,0.12,0,0.45,CASTD,0.7);
    if(!doorStep) return;
    for(var s=s0+doorStep*0.5;s<s1-2;s+=doorStep){
      fq(F,s-1.45,s+1.45,0.45,3.35,0.06,0x2A2C2E,1);
      fq(F,s-1.3,s-0.04,0.45,3.2,0.08,DOOR,1); fq(F,s+0.04,s+1.3,0.45,3.2,0.08,DOOR,1);
      fb(F,s-1.6,s+1.6,0,0.25,3.35,3.7,CAST,0.75);
    }
  }
  var FWs=Face(0,UW,-1), FNs=Face(1,VN,-1), FE=Face(0,UE,1), FSB=Face(1,VS,1), FSA=Face(1,VM,1);
  /* west, either side of the brick front */
  [[VN,sC-28.4],[sC+28.4,VM]].forEach(function(r){ base(FWs,r[0],r[1],0); stripes(FWs,r[0],r[1],HS); });
  /* north, either side of the pavilion */
  base(FNs,UW,uC-19.1,11); stripes(FNs,UW,UA,HS); stripes(FNs,UA,uC-19.1,HA);
  base(FNs,uC+19.1,UE,11); stripes(FNs,uC+19.1,UE,HA);
  /* east on Flower Street, south on the driveway */
  base(FE,VN,VS,14); stripes(FE,VN,VM,HA); stripes(FE,VM,VS,HB);
  base(FSB,UB,UE,13); stripes(FSB,UB,UE,HB);
  stripes(FSA,UB,UE,HA+0.6,HB+0.8);   /* above the pavilion roof the arena wall goes on */
  /* panel joints on the plain buff upper walls (west and north, above the fronts) */
  for(var jy=HS+1.5;jy<HA-0.5;jy+=1.6){ fq(Face(0,UA,-1),VN+0.2,VM,jy,jy+0.05,0.02,0xB8AA8C,1); }

  /* ================= the west front on Figueroa (image 25) ================= */
  (function(){
    var F=FWs, T0=0.72, TP=1.45;               /* recess plane, pier face */
    /* lay out the bays from the middle out: single pier, then window + paired piers, end block */
    var piers=[], wins=[], half=0;
    [1,-1].forEach(function(sg){
      var a=5.0, list=[];
      list.push(['p',a,a+1.3]); a+=1.3;
      for(var k=0;k<5;k++){
        list.push(['w',a,a+1.55]); a+=1.55;
        if(k<4){ list.push(['p',a,a+1.2]); list.push(['p',a+1.55,a+2.75]); a+=2.75; }
      }
      list.push(['p',a,a+3.0]); a+=3.0; half=a;
      list.forEach(function(e){
        var s0=sC+sg*e[1], s1=sC+sg*e[2], lo=Math.min(s0,s1), hi=Math.max(s0,s1);
        (e[0]==='p'?piers:wins).push([lo,hi]);
      });
    });
    var S0=sC-half, S1=sC+half;
    /* the brick wall behind the piers, the base storey either side of the doors */
    fb(F,S0,S1,0,T0,5.0,17.0,BRICKD,0.7);
    [[S0,sC-5.0],[sC+5.0,S1]].forEach(function(r){
      fb(F,r[0],r[1],0,1.22,0,5.0,CAST,0.68);
      [1.25,2.45,3.65].forEach(function(y){ fq(F,r[0],r[1],y,y+0.34,1.24,BRICK,0.95); });
      fb(F,r[0],r[1],1.22,1.36,0,0.5,CASTD,0.7);
      fb(F,r[0],r[1],0,1.32,4.85,5.05,CASTL,0.75);
    });
    /* piers, and the cast stone blocks under them in the base */
    piers.forEach(function(p){
      fb(F,p[0],p[1],T0,TP,5.0,17.0,BRICK,0.62);
      fb(F,p[0]+0.05,p[1]-0.05,1.22,1.5,0,4.85,CASTL,0.66);
    });
    /* the tall narrow windows, two tiers with a cast stone spandrel, sill and head */
    wins.forEach(function(w){
      var m=(w[0]+w[1])/2;
      fb(F,w[0],w[1],T0,T0+0.32,5.0,5.55,CAST,0.7);
      fq(F,m-0.55,m+0.55,5.55,10.55,T0+0.02,GLASS,1);
      fb(F,w[0],w[1],T0,T0+0.22,10.55,11.55,CAST,0.72);
      fq(F,m-0.55,m+0.55,11.55,16.25,T0+0.02,GLASS,1);
      fq(F,m-0.03,m+0.03,5.55,16.25,T0+0.05,MULL,1);
      fb(F,w[0],w[1],T0,T0+0.26,16.25,17.0,CAST,0.72);
    });
    /* the glazed entrance bay: doors, the 3400 band, two tiers of curtain wall */
    var G0=sC-5.0, G1=sC+5.0;
    fq(F,G0,G1,0,4.2,0.55,GLASS,1);
    for(var s=G0;s<=G1+0.01;s+=1.25) fb(F,s-0.06,s+0.06,0.55,0.68,0,4.2,MULL,0.8);
    fb(F,G0,G1,0.55,0.68,2.55,2.7,MULL,0.8);
    fb(F,G0,G1,0.4,1.3,4.2,5.5,CAST,0.72);
    text(F,sC,1.32,4.85,'3400',0.62,'#3E3428');
    [[5.5,10.5],[11.5,16.3]].forEach(function(r){
      fq(F,G0,G1,r[0],r[1],T0+0.02,GLASS,1);
      for(var s2=G0;s2<=G1+0.01;s2+=1.25) fb(F,s2-0.05,s2+0.05,T0,T0+0.14,r[0],r[1],MULL,0.85);
      fb(F,G0,G1,T0,T0+0.14,(r[0]+r[1])/2+0.6,(r[0]+r[1])/2+0.7,MULL,0.85);
    });
    fb(F,G0,G1,T0,1.05,10.5,11.5,CAST,0.72);
    fb(F,G0,G1,T0,1.0,16.3,17.0,CAST,0.72);
    /* the entablature with GALEN CENTER */
    fb(F,S0-0.3,S1+0.3,0,1.7,17.0,20.3,CAST,0.7);
    fb(F,S0-0.4,S1+0.4,0,1.85,20.15,20.45,CASTL,0.78);
    fb(F,S0-0.3,S1+0.3,0,1.78,17.0,17.25,CASTD,0.75);
    for(var j=S0+2.4;j<S1-0.5;j+=2.4) fq(F,j-0.02,j+0.02,17.25,20.15,1.72,0xB09F7C,1);
    text(F,sC,1.72,18.75,'GALEN CENTER',2.3,'#3E3328');
    solid(R(UW-1.85,UW,S0-0.4,S1+0.4),20.45);
    /* sidewalk trees in their wells and banner lamps at the curb */
    [-23.5,-16,-8.5,8.5,16,23.5].forEach(function(o){ var p=F.W(sC+o,2.9); TREE_POS.push([p[0],p[1],0,'mag',0.62]); });
    [-27,-12,12,27].forEach(function(o){ var p=F.W(sC+o,5.2); campusLamp(M,p[0],p[1],5.2,1); });
  })();

  /* ================= the north pavilion on Jefferson (image 26) ================= */
  (function(){
    var F=FNs, T0=0.6, TP=1.5, S0=uC-18.75, S1=uC+18.75;
    var piers=[[S0,S0+3.0],[S1-3.0,S1]], bays=[];
    for(var k=0;k<6;k++){ var a=S0+3.0+k*5.5; bays.push([a,a+4.0]); if(k<5) piers.push([a+4.0,a+5.5]); }
    fb(F,S0,S1,0,T0,0,17.6,BRICKD,0.7);
    piers.forEach(function(p){ fb(F,p[0],p[1],T0,TP,0,17.6,BRICK,0.62); });
    /* the ground storey: dark windows and green doors under the cast stone band */
    bays.forEach(function(b,k){
      if(k===1||k===4){ fq(F,b[0]+0.4,b[1]-0.4,0.3,3.4,T0+0.02,DOOR,1); fq(F,b[0]+0.4,b[1]-0.4,3.4,4.8,T0+0.02,GLASS,1); }
      else fq(F,b[0]+0.3,b[1]-0.3,0.9,4.8,T0+0.02,GLASS,1);
      fb(F,b[0],b[1],T0,T0+0.3,0,0.6,CASTD,0.7);
    });
    fb(F,S0-0.2,S1+0.2,0,2.1,5.5,6.8,CAST,0.68);
    fb(F,S0-0.2,S1+0.2,0,2.2,6.65,6.85,CASTL,0.75);
    /* six tall glazed bays */
    bays.forEach(function(b){
      fq(F,b[0],b[1],6.85,17.0,T0+0.02,GLASSB,1);
      for(var s=b[0];s<=b[1]+0.01;s+=1.0) fb(F,s-0.05,s+0.05,T0,T0+0.12,6.85,17.0,MULL,0.85);
      for(var y=6.85;y<17.1;y+=1.7) fb(F,b[0],b[1],T0,T0+0.12,y-0.05,y+0.05,MULL,0.85);
      fb(F,b[0],b[1],T0,T0+0.4,17.0,17.6,CAST,0.72);
    });
    /* the GALEN CENTER band */
    fb(F,S0-0.3,S1+0.3,0,1.7,17.6,21.2,CAST,0.7);
    fb(F,S0-0.4,S1+0.4,0,1.85,21.05,21.35,CASTL,0.78);
    for(var j=S0+2.3;j<S1-0.5;j+=2.3) fq(F,j-0.02,j+0.02,17.6,21.05,1.72,0xB09F7C,1);
    for(var jy=18.8;jy<21;jy+=1.2) fq(F,S0-0.3,S1+0.3,jy-0.02,jy+0.02,1.72,0xB09F7C,1);
    text(F,uC,1.72,19.4,'GALEN CENTER',2.3,'#3E3328');
    solid(R(S0-0.4,S1+0.4,VN-2.2,VN),21.35);
  })();

  /* ================= the practice pavilion's west wall behind the plaza (image 27) ================= */
  (function(){
    var F=Face(0,UB,-1);
    fq(F,VM,VS,0,HB-2.4,0.03,BRICK,0.9);
    for(var s=VM+1.0;s<VS-1.0;s+=4.6){
      fb(F,s,s+1.5,0,0.5,0,HB-2.4,BRICK,0.62);
      var m=s+3.05;
      if(m<VS-1.5&&(m<-216||m>-198)){ fq(F,m-0.55,m+0.55,YP+0.6,HB-4.2,0.04,GLASSB,1);
        fq(F,m-0.03,m+0.03,YP+0.6,HB-4.2,0.07,MULL,1); fb(F,m-0.7,m+0.7,0,0.25,HB-4.2,HB-3.7,CAST,0.72); }
    }
    fb(F,VM,VS,0,0.6,HB-2.4,HB-0.2,CONC,0.7);
    for(var y=HB-2.0;y<HB-0.3;y+=0.9) fq(F,VM,VS,y,y+0.25,0.61,STRIPE,0.92);
    /* the glass entrance opposite the stair */
    fq(F,-216,-198,YP,YP+3.4,0.55,GLASS,1);
    for(var s2=-216;s2<=-197.9;s2+=1.5) fb(F,s2-0.06,s2+0.06,0.55,0.7,YP,YP+3.4,MULL,0.8);
    fb(F,-216.5,-197.5,0,0.7,YP+3.4,YP+4.0,CAST,0.72);
    fb(F,-217,-197,0,2.2,YP+4.0,YP+4.35,CASTL,0.8);
    fb(F,-216.6,-216,0,0.7,YP,YP+4.0,BRICK,0.62); fb(F,-198,-197.4,0,0.7,YP,YP+4.0,BRICK,0.62);
  })();

  /* ================= the student entrance: stair, raised plaza, retaining walls ================= */
  var U0=397, V0=-236, V1=-180, SV0=-214, SV1=-200, NR=18, RS=YP/NR, TR=0.34, US=U0-NR*TR;
  (function(){
    var pr=R(U0,UB,V0,V1);
    prism(M,pr,0,YP,BRICK,PAVE,0.6);
    solid(pr,YP);
    for(var gu=U0+2;gu<UB;gu+=2) for(var gv=V0;gv<V1-0.1;gv+=2) flat(M,R(gu-0.03,gu+0.03,gv,gv+2),YP+0.012,0xB3AC9D,1);
    /* parapets with cast stone coping: west edge either side of the stair, the south edge */
    [[U0,U0+0.45,V0,SV0-0.6],[U0,U0+0.45,SV1+0.6,V1],[U0,UB,V1-0.45,V1]].forEach(function(q){
      var r=box(q[0],q[1],q[2],q[3],YP,YP+0.9,BRICK,0.62);
      box(q[0]-0.1,q[1]+0.1,q[2]-(q[2]===V1-0.45?0.1:0),q[3]+0.1,YP+0.9,YP+1.05,CAST,0.75);
      solid(r,YP+1.05);
    });
    fb(Face(0,U0,-1),V0,V1,0,0.08,YP-0.15,YP+0.02,CAST,0.75);
    fb(Face(1,V1,1),U0,UB,0,0.08,YP-0.15,YP+0.02,CAST,0.75);
    /* the steps */
    for(var k=0;k<NR;k++){
      var u0=US+k*TR, r=box(u0,U0,SV0,SV1,k*RS,(k+1)*RS,STEPC,k%2?0.8:0.74);
      fb(Face(0,u0,-1),SV0,SV1,0,0.03,(k+1)*RS-0.04,(k+1)*RS,0xA9A397,1);
      solid(r,(k+1)*RS);
    }
    /* brick cheek walls with sloping cast stone coping */
    [[SV0-0.6,SV0],[SV1,SV1+0.6]].forEach(function(v){
      sblock(US-0.3,U0,v[0],v[1],0,0,1.0,YP+0.9,BRICK);
      sblock(US-0.4,U0,v[0]-0.1,v[1]+0.1,1.0,YP+0.9,1.15,YP+1.05,CAST);
      solid(R(US-0.4,U0,v[0]-0.1,v[1]+0.1),YP+1.05);
    });
    /* steel handrails: three down the flight, posts and sloping rails */
    [-210.5,-207,-203.5].forEach(function(v){
      for(var k=0;k<=NR;k+=3){ var u=US+k*TR+0.17, y=Math.min(YP,(k+1)*RS), p=P(u,v);
        postAt(M,p[0],p[1],y,y+0.95,0.03,RAIL,0.85); }
      bar(V3(US+0.17,v,RS+0.9),V3(U0+0.6,v,YP+0.93),0.06,RAIL);
      bar(V3(US+0.17,v,RS+0.5),V3(U0+0.6,v,YP+0.53),0.04,RAIL);
    });
    /* STUDENT ENTRANCE on the retaining wall beside the stair */
    var FR=Face(0,U0,-1);
    fq(FR,-224,-217.5,1.55,2.55,0.05,0xB01E2F,1);
    fq(FR,-224,-217.5,1.4,1.55,0.05,GOLD,1);
    text(FR,-220.75,0.07,2.05,'STUDENT ENTRANCE',0.62,'#FFFFFF');
    /* planters of clipped shrubs against the wall, palms and shade trees on the plaza */
    [[V0+0.6,-218.5],[-195.5,V1-0.8]].forEach(function(q){
      var r=box(UB-1.8,UB-0.1,q[0],q[1],YP,YP+0.55,CAST,0.75);
      box(UB-1.65,UB-0.25,q[0]+0.15,q[1]-0.15,YP+0.55,YP+1.35,HEDGE,0.7); solid(r,YP+1.35);
    });
    [[399.2,-219],[399.2,-195.4],[399.2,-230],[399.2,-185]].forEach(function(q,k){
      var p=P(q[0],q[1]);
      if(k<2) TREE_POS.push([p[0],p[1],4,0,0.82,YP]);
      else TREE_POS.push([p[0],p[1],0,'ficus',0.9,YP]);
      prism(M,ccw(ngon(p[0],p[1],0.9,8,0)),YP,YP+0.4,CAST,0x4A3828,0.75);
    });
    /* hedges at the foot of the retaining wall */
    [[V0,SV0-0.8],[SV1+0.8,V1]].forEach(function(q){ var r=box(U0-1.3,U0-0.05,q[0],q[1],0,0.95,HEDGE,0.66); solid(r,0.95); });
    var lp=P(US-1.4,SV0-1.6); campusLamp(M,lp[0],lp[1],5.0,1);
    lp=P(US-1.4,SV1+1.6); campusLamp(M,lp[0],lp[1],5.0,1);
  })();

  /* ================= Jefferson frontage: piers, red gates, hedges, palms ================= */
  (function(){
    var VF=VN-5.4, n=12, a=UW+3, step=(UE-3-a)/n;
    for(var i=0;i<=n;i++){
      var u=a+i*step;
      var r=box(u-0.5,u+0.5,VF-0.5,VF+0.5,0,2.45,BRICK,0.6);
      box(u-0.62,u+0.62,VF-0.62,VF+0.62,2.45,2.7,CAST,0.75);
      box(u-0.4,u+0.4,VF-0.4,VF+0.4,2.7,2.85,CASTL,0.8);
      solid(r,2.85);
      if(i===n) break;
      var g0=u+0.5, g1=u+step-0.5, gm=(g0+g1)/2;
      if(i===4||i===7){                      /* red gates with the SC monogram */
        var gr=box(g0,g1,VF-0.06,VF+0.06,0.05,2.1,GATE,0.75); solid(gr,2.1);
        for(var b=g0+0.6;b<g1;b+=0.6) box(b-0.03,b+0.03,VF-0.09,VF+0.09,0.05,2.1,0x9A1D25,0.8);
        [gm-1.6,gm+1.6].forEach(function(cx){ box(cx-0.35,cx+0.35,VF-0.1,VF+0.1,1.05,1.75,GOLD,0.9); });
      } else if(i===5||i===6){
        /* open: the walk in to the north doors */
      } else {
        var hr=box(g0+0.1,g1-0.1,VF-0.5,VF+0.5,0,1.1,HEDGE,0.66); solid(hr,1.1);
      }
    }
    /* palms along the curb and inside the piers, round trees in front of the pavilion */
    for(var u2=UW+2;u2<UE;u2+=13.4){ var p=P(u2,VN-19.0); TREE_POS.push([p[0],p[1],4,0,1.0]); }
    [UW+7,UW+18,UE-18,UE-7].forEach(function(u3){ var p=P(u3,VN-8.6); TREE_POS.push([p[0],p[1],4,0,0.9]); });
    [uC-9,uC+9].forEach(function(u4){ var p=P(u4,VN-8.6); TREE_POS.push([p[0],p[1],0,'mag',0.8]); });
    [UW+12,uC-20,uC+20,UE-12].forEach(function(u5){ var p=P(u5,VN-20.4); campusLamp(M,p[0],p[1],6.0,0); });
  })();

  /* ================= paving round the fronts ================= */
  flat(MG,R(389.4,UW,VN,VM),0.1,PAVE,0.97);
  flat(MG,R(389.4,U0,VM,V1),0.1,PAVE,0.97);
  flat(MG,R(389.4,UE,VN-12.8,VN),0.1,PAVE,0.97);
  flat(MG,R(UE,UE+1.6,VN-12.8,VS),0.1,PAVE,0.97);

  /* ================= keep later planting out, build ================= */
  NO_PLANT.push(zone);

  B.h=31.8;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__galen={tris:M.count()+MG.count()};
})();
