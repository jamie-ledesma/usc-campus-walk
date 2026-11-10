/* ==================================================================
   Nemirovsky Residential College (USC Village), built with the Village kit VK (a2zm_village_kit.js).
   The south half of Village Building 8 (3201 S. Hoover St., shared with Bohnett to the north),
   on the corner of Jefferson and Hoover. From photos, OSM and USC Housing:
   - an L of five storeys (a 5.5 m retail ground floor and four floors of rooms): a wing along
     Hoover and a head on Jefferson, red brick with cast stone bands, sills and window surrounds,
     arched windows on the top floor, cream stone oriel bays with lancets, gables, and a dark
     tile hip roof;
   - a cream stone corner pavilion on the Jefferson / Hoover corner with a pointed entrance arch,
     a stacked oriel and a stone gable with pinnacles;
   - in the crook of the L, along the pedestrian street to McMorrow, a one storey retail pavilion
     with tall arched shopfronts (Starbucks at its south end, green umbrellas) and a roof terrace
     (the "second floor patio") behind a cream balustrade under a dark steel pergola.
   Footprint from world.txt (unchanged), split here into the L and the pavilion.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='Nemirovsky Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M;
  var G=5.5, FH=3.2, NF=4, TOP=G+NF*FH;           /* ground floor, floor height, floors, wall top 18.3 */
  var ROOFY=TOP+0.05, RISE=4.6;                    /* VK.roof: cornice band ROOFY..+0.45, hip above */
  var SLOPE=RISE/(RISE*1.3), EAVE=ROOFY+0.45;      /* roof surface: EAVE at 0.6 m out, rising SLOPE per metre in */
  function ccw(r){ r=r.slice(); if(ringArea(r)<0) r.reverse(); return r; }

  /* ---------------- footprint pieces (world.txt ring, split) ---------------- */
  var J1=[111,-401], J2=[125,-399], J3=[131,-410], H2=[127,-453], N1=[120,-453], N2=[119,-459],
      W1=[110.3,-457.5], K=[114.5,-422], S1=[103.7,-417], P1=[89,-449], P2=[103,-455], P3=[103,-457];
  var MAIN=ccw([J1,J2,J3,H2,N1,N2,W1,K,S1]);       /* the five storey L */
  var PAV=ccw([S1,K,W1,P3,P2,P1]);                  /* the one storey retail pavilion with the roof terrace */

  /* a face of a ring between two of its points, out pointing away from the ring */
  function faceOf(A,Bp,ring){
    var dx=Bp[0]-A[0], dz=Bp[1]-A[1], L=Math.hypot(dx,dz), n=[-dz/L,dx/L];
    var m=[(A[0]+Bp[0])/2+n[0]*0.6,(A[1]+Bp[1])/2+n[1]*0.6];
    if(inRing(ring,m[0],m[1])) n=[-n[0],-n[1]];
    return VK.face(A,Bp,n);
  }
  function sOf(F,p){ return (p[0]-F.A[0])*F.t[0]+(p[1]-F.A[1])*F.t[1]; }

  /* ---------------- small geometry helpers (all into VK.M, oriented with want) ---------------- */
  function tri3(A,Bp,D,want,hex,k){
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, c=rgb(hex,k===undefined?1:k);
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) M.tri(A,D,Bp,c,c,c); else M.tri(A,Bp,D,c,c,c);
  }
  /* a six sided solid from 8 corners: a0..a3 one end loop, b0..b3 the other, same order */
  function hexa(a,b,col,top){
    var cx=0,cy=0,cz=0; a.concat(b).forEach(function(p){ cx+=p[0]/8; cy+=p[1]/8; cz+=p[2]/8; });
    function q(p0,p1,p2,p3){ var mx=(p0[0]+p1[0]+p2[0]+p3[0])/4-cx, my=(p0[1]+p1[1]+p2[1]+p3[1])/4-cy, mz=(p0[2]+p1[2]+p2[2]+p3[2])/4-cz;
      var k=my>0.3*Math.hypot(mx,mz)?1:0.74; VK.quad(M,[p0,p1,p2,p3],[mx,my,mz],my>0.3*Math.hypot(mx,mz)&&top?top:col,k); }
    q(a[0],a[1],a[2],a[3]); q(b[0],b[1],b[2],b[3]);
    for(var i=0;i<4;i++){ var j=(i+1)%4; q(a[i],a[j],b[j],b[i]); }
  }
  function pyramid(x,z,y0,h,w,col){
    var p=[[x-w,y0,z-w],[x+w,y0,z-w],[x+w,y0,z+w],[x-w,y0,z+w]], A=[x,y0+h,z];
    for(var i=0;i<4;i++){ var a=p[i], b=p[(i+1)%4]; tri3(a,b,A,[(a[0]+b[0])/2-x,0.4,(a[2]+b[2])/2-z],col,0.85); }
  }
  /* a pinnacle: shaft, cap and point */
  function pinnacle(x,z,y0,h,w){ postAt(M,x,z,y0,y0+h,w,C.CAST,0.75); postAt(M,x,z,y0+h,y0+h+0.18,w+0.06,C.CAST_D,0.75); pyramid(x,z,y0+h+0.18,1.0,w*0.9,C.CAST); }

  /* ---------------- facade pieces on a face F at base offset d ---------------- */
  function winY(k){ return G+k*FH; }
  /* a column of windows, floors k0..3 */
  function winCol(F,s,d,type,k0){
    for(var k=k0||0;k<NF;k++){ var y=winY(k);
      if(k===NF-1){ F.tile(TL.WIN_ARCH,s-0.72,s+0.72,y+0.65,y+2.95,d+0.03); }
      else if(type==='pair'){ F.tile(TL.WIN_PAIR,s-1.15,s+1.15,y+0.75,y+2.85,d+0.03); }
      else if(type==='small'){ F.tile(TL.WIN_SMALL,s-0.6,s+0.6,y+1.1,y+2.3,d+0.03); }
      else F.tile(TL.WIN,s-0.68,s+0.68,y+0.75,y+2.85,d+0.03);
    }
  }
  /* the horizontal stone: plinth, the big band over the shops, sill courses, the band under the top floor, the frieze */
  function bands(F,s0,s1,d,y0){
    if(y0<0.5) F.block(s0,s1,d,d+0.1,0,0.6,C.CAST_D,0.7);
    if(y0<G) F.block(s0,s1,d,d+0.26,G-0.45,G+0.05,C.CAST,0.72);
    for(var k=0;k<NF;k++){ var y=winY(k)+0.62; F.block(s0,s1,d,d+(k===NF-1?0.14:0.07),y,y+(k===NF-1?0.24:0.13),C.CAST,0.75); }
    F.block(s0,s1,d,d+0.2,TOP-0.55,TOP,C.CAST,0.72);
  }
  /* stone quoin strips at the ends of a span */
  function quoins(F,s0,s1,d,y0,y1,w){ w=w||0.55; F.block(s0,s0+w,d,d+0.09,y0,y1,C.CAST,0.75); F.block(s1-w,s1,d,d+0.09,y0,y1,C.CAST,0.75); }
  /* a ground floor bay: arched shopfront, plain arched window, door or pointed entrance; with stone pier bases and imposts at its sides */
  function groundBay(F,s,w,d,type){
    if(type==='shop') F.tile(TL.SHOP_ARCH,s-w/2,s+w/2,0.45,G-0.6,d+0.03);
    else if(type==='win') F.tile(TL.WIN_ARCH,s-0.85,s+0.85,1.1,G-0.75,d+0.03);
    else if(type==='door'){ F.tile(TL.DOOR,s-1.2,s+1.2,0.02,3.6,d+0.03); F.block(s-1.45,s+1.45,d,d+0.16,3.6,3.95,C.CAST,0.72); F.tile(TL.WIN_SMALL,s-0.55,s+0.55,4.0,5.0,d+0.03); }
    else if(type==='gothic') F.tile(TL.GOTHIC,s-w/2,s+w/2,0.02,G-0.5,d+0.03);
  }
  function pier(F,s,d){ F.block(s-0.36,s+0.36,d,d+0.13,0,1.0,C.CAST,0.72); F.block(s-0.4,s+0.4,d,d+0.15,3.15,3.45,C.CAST,0.72); }
  /* an oriel: a cream stone bay standing out 0.75 m from floor 1 to above the cornice, lancets on its face, a corbel under it */
  function oriel(F,s,w,d,k0,capH){
    var y0=winY(k0||0)-0.1, dd=d+0.75;
    F.block(s-w/2+0.25,s+w/2-0.25,d,dd-0.2,y0-0.7,y0,C.CAST_D,0.7);
    F.block(s-w/2,s+w/2,d,dd,y0,TOP+(capH||0.9),C.CAST,0.72,C.CAST_L);
    for(var k=k0||0;k<NF;k++){ var y=winY(k); F.tile(TL.ORIEL,s-w/2+0.18,s+w/2-0.18,y+0.25,y+3.0,dd+0.03); }
    F.block(s-w/2-0.06,s+w/2+0.06,d,dd+0.08,TOP+(capH||0.9),TOP+(capH||0.9)+0.22,C.CAST_D,0.72);
    var a=F.pt(s-w/2+0.2,dd-0.15), b=F.pt(s+w/2-0.2,dd-0.15), yT=TOP+(capH||0.9)+0.22;
    pinnacle(a[0],a[1],yT,0.7,0.16); pinnacle(b[0],b[1],yT,0.7,0.16);
  }
  /* a gable over s-w/2..s+w/2 rising from y0 by h, at offset d: brick or stone triangle, stone copings, a short roof behind */
  function gable(F,s,w,d,y0,h,stone,tile,depth){
    var sa=s-w/2, sb=s+w/2, yA=y0+h;
    if(stone) VK.quad(M,[F.p3(sa,d+0.02,y0),F.p3(sb,d+0.02,y0),F.p3(s,d+0.02,yA),F.p3(s,d+0.02,yA)],F.want,C.CAST,0.9);
    else VK.quad(VK.MB,[F.p3(sa,d,y0),F.p3(sb,d,y0),F.p3(s,d,yA),F.p3(s,d,yA)],F.want,0xFFFFFF,1,[[sa/2,y0],[sb/2,y0],[s/2,yA],[s/2,yA]]);
    /* the wall under the gable down to the frieze, in case the roof cornice sits lower than y0 */
    /* copings: a sloped slab along each rake */
    var t=0.3, back=-0.4;
    [[sa,y0,s,yA],[sb,y0,s,yA]].forEach(function(r){
      var ex=r[0]+(r[0]<s?-0.18:0.18), ey=r[1]-0.05, ax=r[2], ay=r[3]+0.12;
      var L=Math.hypot(ax-ex,ay-ey), nx=-(ay-ey)/L*(r[0]<s?1:-1), ny=(ax-ex)/L*(r[0]<s?1:-1);
      /* lower edge on the rake line, upper edge t above it, normal to the rake (nx is along s) */
      var lo0=[ex,ey], lo1=[ax,ay], up0=[ex+nx*t*0+0,ey+t], up1=[ax,ay+t];
      function P(sv,yv,dv){ return F.p3(sv,dv,yv); }
      hexa([P(lo0[0],lo0[1],d+0.16),P(lo1[0],lo1[1],d+0.16),P(up1[0],up1[1],d+0.16),P(up0[0],up0[1],d+0.16)],
           [P(lo0[0],lo0[1],d+back),P(lo1[0],lo1[1],d+back),P(up1[0],up1[1],d+back),P(up0[0],up0[1],d+back)],C.CAST,0xB9AC90);
    });
    var pa=F.pt(s,d-0.05); pinnacle(pa[0],pa[1],yA+0.3,0.55,0.18);
    if(stone){ var p0=F.pt(sa-0.1,d), p1=F.pt(sb+0.1,d); pinnacle(p0[0],p0[1],y0,1.4,0.2); pinnacle(p1[0],p1[1],y0,1.4,0.2); }
    if(tile!==undefined&&tile!==null){ var tw=Math.min(1.7,w*0.28); F.tile(tile,s-tw/2,s+tw/2,y0+0.35,y0+0.35+Math.min(h-1.2,tw*1.35),d+0.04); }
    /* the roof behind: two planes from the copings back into the hip */
    var D0=d-0.2, D1=d-(depth||5.5);
    [[sa-0.2,s],[sb+0.2,s]].forEach(function(r){
      var e0=F.p3(r[0],D0,y0+0.2), a0=F.p3(r[1],D0,yA+0.3), a1=F.p3(r[1],D1,yA+0.3), e1=F.p3(r[0],D1,y0+0.2);
      var side=F.pt(r[0],0), mid=F.pt(s,0);
      VK.quad(M,[e0,a0,a1,e1],[side[0]-mid[0],1.2,side[1]-mid[1]],C.ROOF,0.92);
    });
  }
  /* a dormer on a hip roof slope above face F, centred at s */
  function dormer(F,s,w){
    var dF=-0.25, yb=EAVE+(0.6-dF)*SLOPE-0.35, yt=yb+1.95, back=-3.2;
    F.block(s-w/2,s+w/2,back,dF,yb,yt,C.CAST,0.72);
    F.tile(TL.WIN_ARCH,s-w/2+0.25,s+w/2-0.25,yb+0.25,yt-0.15,dF+0.03);
    var yr=yt+w*0.42;
    [[s-w/2-0.15,s],[s+w/2+0.15,s]].forEach(function(r){
      var side=F.pt(r[0],0), mid=F.pt(s,0);
      VK.quad(M,[F.p3(r[0],dF+0.25,yt-0.05),F.p3(r[1],dF+0.25,yr),F.p3(r[1],back,yr),F.p3(r[0],back,yt-0.05)],[side[0]-mid[0],1.2,side[1]-mid[1]],C.ROOF,0.9);
    });
    VK.quad(M,[F.p3(s-w/2,dF+0.02,yt),F.p3(s+w/2,dF+0.02,yt),F.p3(s,dF+0.02,yr),F.p3(s,dF+0.02,yr)],F.want,C.CAST,0.95);
  }

  /* =============== the faces of the L =============== */
  /* Hoover Street (east), 43 m: corner quoins, four window bays, an oriel, a gabled centre bay with the entrance,
     an oriel, four window bays; arched shopfronts and windows on the ground floor */
  (function(){
    var F=faceOf(J3,H2,MAIN), L=F.L;
    F.brick(0,L,0,TOP,0);
    bands(F,0,L,0,0); quoins(F,0,L,0,0,TOP);
    var cs=L/2, cw=9.6, pd=0.4;                       /* the projecting centre bay */
    var a0=0.9, a1=cs-cw/2-3.6, b0=cs+cw/2+3.6, b1=L-0.9;
    function run(s0,s1,ground){
      var n=Math.round((s1-s0)/3.3), bw=(s1-s0)/n;
      for(var j=0;j<n;j++){ var s=s0+bw*(j+0.5); winCol(F,s,0,(j%3===1)?'pair':'win',0); groundBay(F,s,bw-0.9,0,ground(j)); }
      for(j=0;j<=n;j++) pier(F,s0+bw*j,0);
    }
    run(a0,a1,function(j){ return j===1?'win':'shop'; });
    run(b0,b1,function(j){ return j===2?'door':'win'; });
    oriel(F,cs-cw/2-1.8,3.0,0,0); oriel(F,cs+cw/2+1.8,3.0,0,0);
    groundBay(F,cs-cw/2-1.8,0,0,'door'); groundBay(F,cs+cw/2+1.8,0,0,'win');
    /* centre bay: stands out pd, brick with stone quoins, a pointed entrance, paired windows, a gable */
    F.brick(cs-cw/2,cs+cw/2,0,TOP,pd);
    F.block(cs-cw/2,cs-cw/2+0.6,0,pd+0.09,0,TOP,C.CAST,0.75); F.block(cs+cw/2-0.6,cs+cw/2,0,pd+0.09,0,TOP,C.CAST,0.75);
    bands(F,cs-cw/2+0.6,cs+cw/2-0.6,pd,0);
    groundBay(F,cs,3.6,pd,'gothic'); groundBay(F,cs-3.0,0,pd,'win'); groundBay(F,cs+3.0,0,pd,'win');
    winCol(F,cs-2.9,pd,'win',0); winCol(F,cs,pd,'pair',0); winCol(F,cs+2.9,pd,'win',0);
    gable(F,cs,cw,pd,TOP,4.0,false,TL.VENT_ARCH,6);
    dormer(F,(a0+a1)/2,1.8); dormer(F,(b0+b1)/2,1.8);
  })();

  /* the Jefferson / Hoover corner: a cream stone pavilion with a pointed entrance, a stacked oriel and a stone gable */
  (function(){
    var F=faceOf(J2,J3,MAIN), L=F.L, cs=L/2;
    F.block(0,L,-0.05,0.18,0,TOP,C.CAST,0.75,C.CAST);
    var d=0.18;
    F.block(0,L,d,d+0.1,0,0.6,C.CAST_D,0.7);
    F.block(0,L,d,d+0.2,G-0.45,G+0.05,C.CAST_D,0.72);
    F.block(0,L,d,d+0.18,TOP-0.55,TOP,C.CAST_D,0.72);
    for(var k=0;k<NF;k++){ var y=winY(k)+0.62; F.block(0.6,cs-2.2,d,d+0.07,y,y+0.13,C.CAST_D,0.75); F.block(cs+2.2,L-0.6,d,d+0.07,y,y+0.13,C.CAST_D,0.75); }
    groundBay(F,cs,4.0,d,'gothic'); groundBay(F,cs-3.9,2.6,d,'shop'); groundBay(F,cs+3.9,2.6,d,'shop');
    for(k=0;k<NF;k++){ var yy=winY(k); F.tile(TL.LANCET,cs-4.4,cs-3.2,yy+0.45,yy+2.95,d+0.03); F.tile(TL.LANCET,cs+3.2,cs+4.4,yy+0.45,yy+2.95,d+0.03); }
    oriel(F,cs,3.8,d,0,0.05);
    gable(F,cs,7.6,d,TOP,4.2,true,TL.ROSE,7);
    var c0=F.pt(0.3,d), c1=F.pt(L-0.3,d); pinnacle(c0[0],c0[1],TOP,1.9,0.28); pinnacle(c1[0],c1[1],TOP,1.9,0.28);
  })();

  /* Jefferson (south), 14 m: arched shopfronts, window bays, a paired centre */
  (function(){
    var F=faceOf(J1,J2,MAIN), L=F.L;
    F.brick(0,L,0,TOP,0); bands(F,0,L,0,0); quoins(F,0,L,0,0,TOP);
    var n=4, bw=(L-1.2)/n;
    for(var j=0;j<n;j++){ var s=0.6+bw*(j+0.5); winCol(F,s,0,'win',0); groundBay(F,s,bw-0.9,0,'shop'); }
    for(j=0;j<=n;j++) pier(F,0.6+bw*j,0);
    dormer(F,L/2,1.7);
  })();

  /* the head's west face on the pedestrian street, 17.6 m: Starbucks in two arches at the pavilion end, a door,
     a shopfront; a stone oriel and a brick gable above */
  (function(){
    var F=faceOf(S1,J1,MAIN), L=F.L, sN=sOf(F,S1)<L/2?0:L, dir=sN===0?1:-1;   /* sN: the end next to the pavilion */
    F.brick(0,L,0,TOP,0); bands(F,0,L,0,0); quoins(F,0,L,0,0,TOP);
    var cs=L/2;
    [[sN+dir*2.35,'shop'],[sN+dir*6.0,'shop'],[cs+dir*1.5,'door'],[L-sN-dir*3.6,'shop']].forEach(function(g){ groundBay(F,g[0],3.0,0,g[1]); });
    [sN+dir*0.55,sN+dir*4.15,sN+dir*7.85,L-sN-dir*1.6,L-sN-dir*5.6].forEach(function(s){ pier(F,s,0); });
    /* the Starbucks name on the stone band over its two arches */
    var sm=sN+dir*4.15, p=F.pt(sm,0.28);
    facadeText('STARBUCKS',p[0],p[1],F.n[0],F.n[1],G-0.2,4.4,0.5,'#0B3320');
    /* the round green blade sign on the pier between its arches, standing out over the street */
    (function(){ var cy=3.95, R=0.48, sp=sm;
      [[0.04,0x1E5B3A,R],[0.075,0xEDE7DA,R*0.55]].forEach(function(L2){
        [1,-1].forEach(function(sg){ var c=F.p3(sp+sg*L2[0],0.25+0.15+R,cy), want=[F.t[0]*sg,0,F.t[1]*sg];
          for(var q=0;q<8;q++){ var t0=q/8*6.2832, t1=(q+1)/8*6.2832;
            tri3(F.p3(sp+sg*L2[0],0.4+R+Math.cos(t0)*L2[2],cy+Math.sin(t0)*L2[2]),F.p3(sp+sg*L2[0],0.4+R+Math.cos(t1)*L2[2],cy+Math.sin(t1)*L2[2]),c,want,L2[1],0.95); } }); });
      var a=F.pt(sp,0.12), b=F.pt(sp,0.4+R); segBox(M,a,b,cy+R+0.02,cy+R+0.08,0.05,0x2B2826,0.7); })();
    winCol(F,sN+dir*2.4,0,'win',0); winCol(F,sN+dir*5.6,0,'win',0);
    oriel(F,cs+dir*2.6,3.0,0,0);
    winCol(F,L-sN-dir*2.2,0,'pair',0);
    gable(F,L-sN-dir*2.4,5.4,0,TOP,3.4,false,TL.WIN_ARCH,5);
  })();

  /* the faces over the roof terrace: the wing's west face (35.7 m) and the head's north face (11.9 m) */
  (function(){
    var yT=G+0.4;
    var F=faceOf(W1,K,MAIN), L=F.L;
    F.brick(0,L,yT,TOP,0); bands(F,0,L,0,yT); quoins(F,0,L,0,yT,TOP);
    var n=10, bw=(L-1.2)/n;
    for(var j=0;j<n;j++){ var s=0.6+bw*(j+0.5); if(j===4||j===5) continue; winCol(F,s,0,j%4===2?'pair':'win',0); }
    F.brick(0.6+bw*4,0.6+bw*6,yT,TOP,0.3);
    F.block(0.6+bw*4,0.6+bw*4+0.5,0,0.38,yT,TOP,C.CAST,0.75); F.block(0.6+bw*6-0.5,0.6+bw*6,0,0.38,yT,TOP,C.CAST,0.75);
    winCol(F,0.6+bw*4.5,0.3,'win',0); winCol(F,0.6+bw*5.5,0.3,'win',0);
    for(var k=0;k<NF;k++){ var y=winY(k)+0.62; F.block(0.6+bw*4+0.5,0.6+bw*6-0.5,0.3,0.38,y,y+0.13,C.CAST,0.75); }
    gable(F,0.6+bw*5,bw*2,0.3,TOP,3.6,false,TL.VENT_ARCH,5);
    dormer(F,0.6+bw*1.5,1.7); dormer(F,0.6+bw*8.5,1.7);
    var F2=faceOf(K,S1,MAIN), L2=F2.L;
    F2.brick(0,L2,yT,TOP,0); bands(F2,0,L2,0,yT); quoins(F2,0,L2,0,yT,TOP);
    for(j=0;j<3;j++) winCol(F2,0.6+(L2-1.2)*(j+0.5)/3,0,j===1?'pair':'win',0);
  })();

  /* the north end where Building 8 runs on as Bohnett: a short return on Hoover, the recess, the party wall */
  (function(){
    var F=faceOf(H2,N1,MAIN), L=F.L;
    F.brick(0,L,0,TOP,0); bands(F,0,L,0,0); quoins(F,0,L,0,0,TOP);
    winCol(F,L*0.3,0,'win',0); winCol(F,L*0.72,0,'win',0); groundBay(F,L*0.3,0,0,'win'); groundBay(F,L*0.72,0,0,'door');
    var F2=faceOf(N1,N2,MAIN);
    F2.brick(0,F2.L,0,TOP,0); bands(F2,0,F2.L,0,0); winCol(F2,F2.L/2,0,'small',0); groundBay(F2,F2.L/2,0,0,'door');
    var F3=faceOf(N2,W1,MAIN); F3.brick(0,F3.L,0,TOP,0);
  })();

  /* the roof: one hip over the L (a stone cornice band under it from VK.roof) */
  VK.roof(MAIN,ROOFY,RISE,0.6);

  /* =============== the retail pavilion and its roof terrace =============== */
  (function(){
    var PH=G+0.4, F=faceOf(P1,S1,PAV), L=F.L;
    F.brick(0,L,0,PH,0);
    F.block(0,L,0,0.1,0,0.6,C.CAST_D,0.7);
    var n=9, bw=(L-1.0)/n;
    for(var j=0;j<n;j++){ var s=0.5+bw*(j+0.5); groundBay(F,s,bw-0.85,0,'shop'); }
    for(j=0;j<=n;j++){ var sp=0.5+bw*j; F.block(sp-0.42,sp+0.42,0,0.2,0,PH-0.7,C.CAST,0.74); F.block(sp-0.5,sp+0.5,0,0.26,3.2,3.5,C.CAST_D,0.72); }
    /* cornice and the cream balustrade */
    F.block(-0.1,L+0.1,0,0.42,PH-0.75,PH-0.2,C.CAST,0.72,C.CAST_L);
    F.block(-0.15,L+0.15,0,0.5,PH-0.2,PH+0.05,C.CAST_D,0.7,C.CAST);
    F.block(0,L,-0.05,0.3,PH+0.05,PH+0.25,C.CAST,0.75);
    F.block(0,L,-0.08,0.33,PH+1.0,PH+1.15,C.CAST,0.75,C.CAST_L);
    var nb=Math.round(L/0.48);
    for(j=0;j<nb;j++){ var sb=(j+0.5)*L/nb; if(Math.abs(((sb-0.5)/bw)-Math.round((sb-0.5)/bw))*bw<0.35) continue; F.block(sb-0.07,sb+0.07,0.05,0.2,PH+0.25,PH+1.0,C.CAST_L,0.8); }
    for(j=0;j<=n;j++){ var sq=0.5+bw*j; F.block(sq-0.25,sq+0.25,-0.1,0.35,PH+0.05,PH+1.25,C.CAST,0.75,C.CAST_L); }
    /* the hidden north face against Bohnett and the terrace deck */
    var Fn=faceOf(P2,P1,PAV); Fn.brick(0,Fn.L,0,PH,0);
    VK.pave(PAV,PH+0.02,0.92);
    /* the pergola: cream square columns on the balustrade line, dark beams back over the terrace, slats along it */
    var BEAM=0x2E2B29, s0=0.5+bw, s1=L-0.5-bw;
    for(j=1;j<n;j++){ var sc=0.5+bw*j, c=F.pt(sc,-0.35), bwk=-6.2;
      postAt(M,c[0],c[1],PH+1.25,PH+3.6,0.17,C.CAST_L,0.78);
      var e0=F.pt(sc,0.4), e1=F.pt(sc,bwk); segBox(M,e0,e1,PH+3.45,PH+3.75,0.14,BEAM,0.7);
      var r=F.pt(sc,bwk+0.2); postAt(M,r[0],r[1],PH+0.02,PH+3.45,0.09,BEAM,0.7);
    }
    var a=F.pt(s0,-0.35), b=F.pt(s1,-0.35); segBox(M,a,b,PH+3.6,PH+3.75,0.22,BEAM,0.7);
    for(var dd=0.25;dd>-6.2;dd-=0.55){ var a2=F.pt(s0-0.3,dd), b2=F.pt(s1+0.3,dd); segBox(M,a2,b2,PH+3.75,PH+3.86,0.07,BEAM,0.75); }
    /* planters and tables on the terrace, beyond the pergola */
    for(j=1;j<n;j++){ var sp2=0.5+bw*(j+0.0), pc=F.pt(sp2,-8.2);
      if(j%2){ var pr=F.ring(sp2-0.9,sp2+0.9,-8.5,-7.9); prism(M,pr,PH,PH+0.6,0x6F665C,0x4E6B3A,0.7);
        prism(M,F.ring(sp2-0.8,sp2+0.8,-8.45,-7.95),PH+0.6,PH+1.05,0x4E7A3E,0x5D8A48,0.75); }
      else { postAt(M,pc[0],pc[1],PH,PH+0.74,0.04,0x2B2826,0.7); postAt(M,pc[0],pc[1],PH+0.72,PH+0.77,0.45,0x3A3633,0.8); }
    }
    /* green Starbucks umbrellas and tables on the street at the pavilion's south end */
    var sS=sOf(F,S1)<L/2?0:L, dr=sS===0?1:-1, GREEN=0x22603F;
    [2.2,6.0,9.8].forEach(function(o){ var c=F.pt(sS+dr*o,2.3), x=c[0], z=c[1], R=1.25, yr=2.25, ya=2.7;
      postAt(M,x,z,0,ya,0.035,0x3A3633,0.7);
      postAt(M,x,z,0.7,0.75,0.42,0x2B2826,0.8);
      for(var q=0;q<8;q++){ var t0=q/8*6.2832, t1=(q+1)/8*6.2832, A=[x+Math.cos(t0)*R,yr,z+Math.sin(t0)*R], Bq=[x+Math.cos(t1)*R,yr,z+Math.sin(t1)*R];
        tri3(A,Bq,[x,ya,z],[0,1,0],GREEN,q%2?0.92:1); tri3(A,Bq,[x,yr+0.12,z],[0,-1,0],GREEN,0.6); }
    });
  })();

  VK.collider(MAIN,TOP+5);
  VK.collider(PAV,G+1.6);
})();
