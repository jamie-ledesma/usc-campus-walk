/* ==================================================================
   Cale Residential College (USC Village), the west half of Village
   Building 6 (929 W. Jefferson Blvd), shared with Irani Residential
   College to the east. Built with the Village kit VK (a2zm_village_kit.js).

   From USC Housing photos and OSM way 541642576: five storeys (a tall
   ground storey of fitness center glass, four residential floors), red
   brick with cast stone plinth, belt course, top floor sill band, frieze
   and cornice, square windows in stone surrounds, arched windows on the
   top floor, dark tile hip roof. The lawn front (west, toward Hoover) has
   corner pavilions and a projecting centre pavilion with its own cross
   hip; the Jefferson front (south) has a cream stone oriel over a pointed
   Gothic entrance; the street front (north, toward McCarthy Honors) has a
   ground arcade and the FedEx Office at its west end. The residential
   floors ring a podium courtyard (second floor level). On Jefferson the
   footprint has a notch for the Fitness Center pavilion (a2zv_v_fitness.js,
   eaves 10.8 m); Cale's top two floors bridge over it from 11.5 m (soffit
   at 11.3), so nothing of Cale is inside that block below 11.3 m. One hip
   roof runs round the courtyard. The east wall is shared with Irani and is
   not drawn.

   Local frame: a runs along the Jefferson wall from the south west corner
   toward Irani (0..42.06 m), b runs north along the lawn wall (0..57.2 m);
   Q(a,b) maps it bilinearly onto the four corners of the footprint.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='Cale Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M;
  var t0=VK.MB.count()+VK.MA.count()+VK.MP.count()+M.count();

  var SW=[-77,-474], SE=[-40,-454], NE=[-12,-504], NW=[-51,-525], WA=42.06, DB=57.2;
  function Q(a,b){ var s=a/WA, t=b/DB, k0=(1-s)*(1-t), k1=s*(1-t), k2=s*t, k3=(1-s)*t;
    return [k0*SW[0]+k1*SE[0]+k2*NE[0]+k3*NW[0], k0*SW[1]+k1*SE[1]+k2*NE[1]+k3*NW[1]]; }
  function rectRing(a0,a1,b0,b1){ var r=[Q(a0,b0),Q(a1,b0),Q(a1,b1),Q(a0,b1)]; if(ringArea(r)<0) r.reverse(); return r; }
  function slab(a0,a1,b0,b1,y0,y1,col,sh,top){ prism(M,rectRing(a0,a1,b0,b1),y0,y1,col,top||col,sh===undefined?0.7:sh); }
  /* make a ring's offsetRing(+d) grow it (VK.roof and hipRoof offset by the ring's winding) */
  function outward(r){ r=r.slice(); if(Math.abs(ringArea(offsetRing(r,0.5)))<Math.abs(ringArea(r))) r.reverse(); return r; }

  var G=5.5, FL=3.2, TOP=G+3*FL, EAVE=G+4*FL;      /* ground storey, floor height, top floor, eave 18.3 */
  var OUT={W:[-1,0],E:[1,0],S:[0,-1],N:[0,1]};

  /* the wall face along one side: side W/E is a wall at a=fx, S/N a wall at b=fx, running lo..hi along the other axis */
  function wall(side,fx,lo,hi){
    var P=(side==='W'||side==='E')?function(t){ return [fx,t]; }:function(t){ return [t,fx]; };
    var p0=P(lo), p1=P(hi), m=P((lo+hi)/2), o=OUT[side], wm=Q(m[0],m[1]), wo=Q(m[0]+o[0],m[1]+o[1]);
    var F=VK.face(Q(p0[0],p0[1]),Q(p1[0],p1[1]),[wo[0]-wm[0],wo[1]-wm[1]]);
    F.S=function(t){ var p=P(t), w=Q(p[0],p[1]); return (w[0]-F.A[0])*F.t[0]+(w[1]-F.A[1])*F.t[1]; };
    return F;
  }
  /* a cast stone band along a wall run: the rect lo+kLo*pr..hi+kHi*pr along it, pr out from it, 0.05 into it */
  function bandRun(side,fx,lo,hi,kLo,kHi,pr,y0,y1,col){
    var l=lo+kLo*pr, h=hi+kHi*pr;
    if(side==='W') slab(fx-pr,fx+0.05,l,h,y0,y1,col);
    else if(side==='E') slab(fx-0.05,fx+pr,l,h,y0,y1,col);
    else if(side==='S') slab(l,h,fx-pr,fx+0.05,y0,y1,col);
    else slab(l,h,fx-0.05,fx+pr,y0,y1,col);
  }
  /* the standard bands of a brick front: plinth, belt over the ground storey, top floor sill, frieze, cornice */
  function bands(side,fx,lo,hi,kLo,kHi,o){
    if(o.ground!=='none'){ bandRun(side,fx,lo,hi,kLo,kHi,0.1,0,0.6,C.CAST_D); bandRun(side,fx,lo,hi,kLo,kHi,0.2,G-0.22,G+0.28,C.CAST); }
    else if(o.coping) bandRun(side,fx,lo,hi,kLo,kHi,0.12,G,G+0.3,C.CAST);
    if(o.lowOnly) return;
    bandRun(side,fx,lo,hi,kLo,kHi,0.1,TOP-0.12,TOP+0.06,C.CAST_L);
    bandRun(side,fx,lo,hi,kLo,kHi,0.06,EAVE-0.62,EAVE-0.15,C.CAST_L);
    bandRun(side,fx,lo,hi,kLo,kHi,0.32,EAVE-0.15,EAVE+0.4,C.CAST);
  }
  /* bands round a whole pavilion (prisms on its rect grown by pr; the inside is hidden in the wall) */
  function pavBands(a0,a1,b0,b1,ground){
    function r(pr,y0,y1,col){ slab(a0-pr,a1+pr,b0-pr,b1+pr,y0,y1,col); }
    if(ground){ r(0.1,0,0.6,C.CAST_D); r(0.2,G-0.22,G+0.28,C.CAST); }
    r(0.1,TOP-0.12,TOP+0.06,C.CAST_L); r(0.06,EAVE-0.62,EAVE-0.15,C.CAST_L); r(0.32,EAVE-0.15,EAVE+0.4,C.CAST);
  }

  /* brick, windows and ground storey of one wall run (n bays). o: ground shop|arcade|brick|none, mid win|pair,
     top arch|sq|arch2, y0 (brick from), door (bay index), skip (bay index left plain), noWin (no windows below floor index) */
  function front(side,fx,lo,hi,n,o){
    var F=wall(side,fx,lo,hi), sA=F.S(lo), sB=F.S(hi), s0=Math.min(sA,sB), s1=Math.max(sA,sB);
    F.brick(s0,s1,o.y0||0,o.y1||EAVE,0);
    if(!n) return F;
    var bw=(s1-s0)/n;
    for(var i=0;i<n;i++){
      var c=F.S(lo+(i+0.5)*(hi-lo)/n);
      if(o.skip===i) continue;
      /* ground storey */
      if(o.door===i){
        F.block(c-1.55,c+1.55,-0.02,0.12,0.6,4.3,C.CAST_L,0.75);
        F.tile(TL.GOTHIC,c-1.3,c+1.3,0.6,4.15,0.15);
        F.tile(TL.DOOR,c-1.05,c+1.05,0.6,3.0,0.18);
      } else if(o.ground==='shop'){
        F.tile(TL.SHOP,c-bw/2+0.45,c+bw/2-0.45,0.6,4.7);
        F.block(c-bw/2+0.3,c+bw/2-0.3,-0.02,0.07,4.7,5.0,C.CAST_L,0.75);
      } else if(o.ground==='arcade'){
        F.tile(TL.ARCADE,c-bw/2,c+bw/2,0,G-0.22);
        F.block(c-bw/2-0.32,c-bw/2+0.32,-0.02,0.26,0.6,G-0.22,C.CAST,0.72);
        if(i===n-1) F.block(c+bw/2-0.32,c+bw/2+0.32,-0.02,0.26,0.6,G-0.22,C.CAST,0.72);
      }
      /* floors 2-4 */
      for(var k=0;k<3;k++){
        if(o.noWin!==undefined&&k<o.noWin) continue;
        var y=G+k*FL+0.45;
        if(o.mid==='pair') F.tile(TL.WIN_PAIR,c-1.4,c+1.4,y,y+2.45);
        else F.tile(TL.WIN,c-1.05,c+1.05,y,y+2.45);
      }
      /* top floor */
      var yt=TOP+0.12;
      if(o.top==='sq') F.tile(TL.WIN,c-1.05,c+1.05,yt+0.1,yt+2.5);
      else if(o.top==='arch2'){ F.tile(TL.WIN_ARCH,c-1.85,c-0.25,yt,yt+2.6); F.tile(TL.WIN_ARCH,c+0.25,c+1.85,yt,yt+2.6); }
      else F.tile(TL.WIN_ARCH,c-1.05,c+1.05,yt,yt+2.75);
    }
    return F;
  }
  /* the plain brick return of a projecting pavilion */
  function ret(side,fx,lo,hi){ var F=wall(side,fx,lo,hi), a=F.S(lo), b=F.S(hi); F.brick(Math.min(a,b),Math.max(a,b),0,EAVE,0); }

  var CYW=17, CYE=33.5, CYS=13.7, CYN=40;       /* courtyard (and the Fitness Center notch south of CYS) */
  var BR=11.5;                                 /* the residential floors bridge the Fitness Center (eaves 10.8) from here up */
  var PJ=0.45, PC=0.6;                           /* pavilion projections */

  /* ---------------- west front on the lawn (Hoover side) ---------------- */
  /* south west corner pavilion */
  front('W',-PJ,-PJ,7.2,2,{ground:'shop'});
  front('S',-PJ,-PJ,7.2,2,{ground:'shop'});
  ret('N',7.2,-PJ,0); ret('E',7.2,-PJ,0);
  pavBands(-PJ,7.2,-PJ,7.2,true);
  /* north west corner pavilion */
  front('W',-PJ,50,DB+PJ,2,{ground:'shop'});
  var FNW=front('N',DB+PJ,-PJ,7.2,2,{ground:'shop'});
  ret('S',50,-PJ,0); ret('E',7.2,DB,DB+PJ);
  pavBands(-PJ,7.2,50,DB+PJ,true);
  /* centre pavilion: square windows to the top */
  front('W',-PC,22.35,34.85,4,{ground:'shop',top:'sq'});
  ret('S',22.35,-PC,0); ret('N',34.85,-PC,0);
  pavBands(-PC,0,22.35,34.85,true);
  /* the two ranges between, with the side door the walk from the lawn comes to */
  front('W',0,7.2,22.35,5,{ground:'shop',door:3});
  bands('W',0,7.2,22.35,1,-1,{});
  front('W',0,34.85,50,5,{ground:'shop'});
  bands('W',0,34.85,50,1,-1,{});

  /* ---------------- Jefferson front (south) ---------------- */
  var FS=front('S',0,7.2,CYW,3,{ground:'shop',skip:1});
  bands('S',0,7.2,CYW,1,1,{lowOnly:1});
  front('S',0,CYE,WA,3,{ground:'shop'});
  bands('S',0,CYE,WA,-1,0,{lowOnly:1});
  /* over the Fitness Center: two residential floors carried on a cast stone band, a soffit under them */
  var FB=front('S',0,CYW,CYE,5,{ground:'none',y0:BR,noWin:2});
  bands('S',0,7.2,WA,1,0,{ground:'none'});
  bandRun('S',0,CYW,CYE,1,-1,0.25,BR-0.2,BR+0.3,C.CAST);
  (function(){ var s0=FB.S(CYW), s1=FB.S(CYE); FB.under(Math.min(s0,s1),Math.max(s0,s1),0.25,-CYS,BR-0.2,C.CAST_D); })();
  /* cream stone oriel bay over the pointed entrance */
  (function(){
    var a0=10.4, a1=13.8, d=0.95, F=FS, c=F.S(12.1), sl=Math.abs(F.S(a1)-F.S(a0))/2;
    slab(a0,a1,-d,0.02,G-0.45,EAVE+1.4,C.CAST_L,0.78);
    slab(a0+0.2,a1-0.2,-0.6,0.02,G-0.9,G-0.45,C.CAST,0.7);
    slab(a0+0.5,a1-0.5,-0.3,0.02,G-1.35,G-0.9,C.CAST,0.7);
    for(var k=0;k<4;k++){ var y=G+k*FL; F.tile(TL.ORIEL,c-sl+0.12,c+sl-0.12,y+0.18,y+FL-0.18,d+0.03); }
    slab(a0-0.08,a1+0.08,-d-0.08,0.02,G+0.95*FL-0.1,G+0.95*FL+0.12,C.CAST_D,0.7);
    slab(a0-0.08,a1+0.08,-d-0.12,0.02,EAVE+1.4,EAVE+1.62,C.CAST,0.8);
    /* side lancets */
    var L=wall('W',a0,-d,0), R=wall('E',a1,-d,0);
    [L,R].forEach(function(S){ var m=S.S(-d/2);
      for(var k=0;k<4;k++){ var y=G+k*FL; S.tile(TL.LANCET,m-0.38,m+0.38,y+0.4,y+FL-0.4,0.03); } });
    /* stepped gable parapet with pinnacles */
    slab(a0+0.45,a1-0.45,-d+0.15,0.02,EAVE+1.62,EAVE+2.45,C.CAST_L,0.78);
    slab(a0+1.1,a1-1.1,-d+0.15,0.02,EAVE+2.45,EAVE+3.2,C.CAST_L,0.78);
    [a0+0.12,a1-0.12].forEach(function(a){ var p=Q(a,-d+0.12); postAt(M,p[0],p[1],EAVE+1.62,EAVE+2.9,0.11,C.CAST_L,0.7);
      postAt(M,p[0],p[1],EAVE+2.9,EAVE+3.15,0.05,C.CAST_D,0.7); });
    /* the entrance: a cast stone frontispiece round a pointed arch with doors */
    F.block(c-1.75,c+1.75,-0.02,0.2,0,G-1.35,C.CAST_L,0.78);
    F.tile(TL.GOTHIC,c-1.35,c+1.35,0.25,4.05,0.23);
    F.tile(TL.DOOR,c-1.05,c+1.05,0.15,2.85,0.26);
    F.block(c-1.95,c+1.95,-0.02,0.32,0,0.25,C.CAST_D,0.7);
  })();

  /* ---------------- street front (north, toward McCarthy Honors): arcade ---------------- */
  var FN=front('N',DB,7.2,WA,8,{ground:'arcade',mid:'pair',top:'arch2'});
  bands('N',DB,7.2,WA,1,0,{});
  /* FedEx Office (Print and Ship Center) at the west end of the arcade */
  (function(){ var c=FNW.S(3.6), p=FNW.pt(c,0.33), n=FNW.n;
    FNW.tile(TL.BLANK_STONE,c-2.2,c+2.2,4.72,5.22,0.3);
    FNW.block(c-2.3,c+2.3,-0.02,0.28,4.66,5.28,C.CAST_L,0.8);
    facadeText('FedEx Office',p[0],p[1],n[0],n[1],4.97,3.9,0.42,'#4D148C'); })();

  /* ---------------- the Fitness Center notch on Jefferson and the podium courtyard ---------------- */
  /* notch side walls: plain brick up to the bridge (the gym pavilion stands 0.4 m clear of them) */
  front('E',CYW,0,CYS,0,{y1:BR});
  front('W',CYE,0,CYS,0,{y1:BR});
  bandRun('E',CYW,0.05,CYS,0,0,0.1,0,0.6,C.CAST_D); bandRun('E',CYW,0.05,CYS,0,0,0.2,G-0.22,G+0.28,C.CAST);
  bandRun('W',CYE,0.05,CYS,0,0,0.1,0,0.6,C.CAST_D); bandRun('W',CYE,0.05,CYS,0,0,0.2,G-0.22,G+0.28,C.CAST);
  /* courtyard walls up from the podium; the south one is the back of the bridge over the gym */
  front('E',CYW,CYS,CYN,8,{ground:'none',y0:G-0.3,top:'sq'});
  front('W',CYE,CYS,CYN,8,{ground:'none',y0:G-0.3,top:'sq'});
  front('S',CYN,CYW,CYE,5,{ground:'none',y0:G-0.3,top:'sq'});
  front('N',CYS,CYW,CYE,5,{ground:'none',y0:G-0.3,top:'sq',noWin:2});
  [[0.12,G,G+0.3,C.CAST],[0.1,TOP-0.12,TOP+0.06,C.CAST_L],[0.06,EAVE-0.62,EAVE-0.15,C.CAST_L],[0.32,EAVE-0.15,EAVE+0.4,C.CAST]].forEach(function(b){
    bandRun('E',CYW,CYS,CYN,0,0,b[0],b[1],b[2],b[3]); bandRun('W',CYE,CYS,CYN,0,0,b[0],b[1],b[2],b[3]);
    bandRun('S',CYN,CYW,CYE,1,-1,b[0],b[1],b[2],b[3]); bandRun('N',CYS,CYW,CYE,1,-1,b[0],b[1],b[2],b[3]); });
  bandRun('N',CYS,CYW,CYE,1,-1,0.12,BR-0.2,BR+0.15,C.CAST);
  /* the podium courtyard: paving, a lawn in a stone kerb, planters, benches */
  (function(){
    VK.pave(rectRing(CYW,CYE,CYS,CYN),G+0.02);
    slab(21.5,29,20.5,33,G,G+0.14,0x6F8A4C,0.8);
    slab(21.3,29.2,20.3,20.5,G,G+0.25,C.CAST); slab(21.3,29.2,33,33.2,G,G+0.25,C.CAST);
    slab(21.3,21.5,20.5,33,G,G+0.25,C.CAST); slab(29,29.2,20.5,33,G,G+0.25,C.CAST);
    [[19,16.2],[31.5,16.2],[19,37.5],[31.5,37.5],[19,26.75],[31.5,26.75]].forEach(function(p){
      slab(p[0]-0.7,p[0]+0.7,p[1]-0.7,p[1]+0.7,G,G+0.6,C.CAST,0.72);
      slab(p[0]-0.55,p[0]+0.55,p[1]-0.55,p[1]+0.55,G+0.6,G+1.25,0x56743E,0.8,0x6A8A4A); });
    [[25.25,19.6],[25.25,33.9]].forEach(function(p){ slab(p[0]-1.2,p[0]+1.2,p[1]-0.25,p[1]+0.25,G,G+0.45,C.CAST_D,0.7); });
  })();

  /* ---------------- roofs ---------------- */
  /* one hip roof round the courtyard: slopes down to the outer eaves and down into the courtyard, flat crown between */
  (function(){
    var OV=0.55, RI=4.68, RS=3.6, y0=EAVE+0.4, y1=y0+0.45, y2=y1+RS;
    function R(a0,a1,b0,b1,sgn){ var r=[Q(a0,b0),Q(a1,b0),Q(a1,b1),Q(a0,b1)]; if(ringArea(r)*sgn<0) r.reverse(); return r; }
    var Eo=R(-OV,WA+OV,-OV,DB+OV,1), To=R(-OV+RI,WA+OV-RI,-OV+RI,DB+OV-RI,1);
    var Ec=R(CYW+OV,CYE-OV,CYS+OV,CYN-OV,-1), Tc=R(CYW+OV-RI,CYE-OV+RI,CYS+OV-RI,CYN-OV+RI,-1);
    band(M,Eo,y0,y1,0,C.CAST,0.9,0.6,true); band(M,Ec,y0,y1,0,C.CAST,0.9,0.6,true);
    function slopes(lo,hi,inner){ /* hi is the same rect shrunk or grown, so match corners by nearest */
      var h=lo.map(function(p){ var best=null,bd=1e9; hi.forEach(function(q){ var d=Math.hypot(q[0]-p[0],q[1]-p[1]); if(d<bd){ bd=d; best=q; } }); return best; });
      for(var i=0;i<4;i++){ var j=(i+1)%4, a=lo[i], b=lo[j], ai=h[i], bi=h[j];
        var mx=(a[0]+b[0]-ai[0]-bi[0])/2, mz=(a[1]+b[1]-ai[1]-bi[1])/2, ml=Math.hypot(mx,mz)||1;
        VK.quad(M,[[a[0],y1,a[1]],[b[0],y1,b[1]],[bi[0],y2,bi[1]],[ai[0],y2,ai[1]]],[mx/ml,1.3,mz/ml],C.ROOF,0.92);
        /* soffit under the overhang, back to the wall line */
        var ex=[(b[0]-a[0]),(b[1]-a[1])], el=Math.hypot(ex[0],ex[1]), k=inner?-OV:OV; ex=[ex[0]/el*k,ex[1]/el*k];
        var wa=[a[0]+ex[0]-mx/ml*OV,a[1]+ex[1]-mz/ml*OV], wb=[b[0]-ex[0]-mx/ml*OV,b[1]-ex[1]-mz/ml*OV];
        VK.quad(M,[[a[0],y0-0.01,a[1]],[b[0],y0-0.01,b[1]],[wb[0],y0-0.01,wb[1]],[wa[0],y0-0.01,wa[1]]],[0,-1,0],C.CAST_D,0.6); } }
    slopes(Eo,To,0); slopes(Ec,Tc,1);
    flatHoled(M,To,[Tc],y2,C.ROOF,1);
  })();
  /* cross hip over the centre pavilion, little pyramids on the corner pavilions */
  function hipOn(r,rise,inset){ r=outward(r); var e=offsetRing(r,0.55); band(M,e,EAVE+0.4,EAVE+0.85,0,C.CAST,0.9,0.6); hipRoof(M,e,EAVE+0.85,rise,inset,C.ROOF); }
  hipOn(rectRing(-PC,6.5,22.35,34.85),3.3,3.4);
  hipOn(rectRing(-PJ,7.2,-PJ,7.2),4.6,4.0);
  hipOn(rectRing(-PJ,7.2,50,DB+PJ),4.6,4.0);

  /* ---------------- lawn terrace: red umbrellas and tables (photos) ---------------- */
  [[-4.6,26.5],[-4.6,31],[-3.9,38],[-3.9,42.5],[-3.9,47]].forEach(function(p){
    var w=Q(p[0],p[1]), x=w[0], z=w[1], k, r=[];
    for(k=0;k<8;k++){ var t=k/8*Math.PI*2; r.push([x+Math.cos(t)*0.48,z+Math.sin(t)*0.48]); }
    if(ringArea(r)<0) r.reverse();
    prism(M,r,0.72,0.77,0x2E2A27,0x3A3532,0.7);
    postAt(M,x,z,0,0.72,0.06,0x2E2A27,0.7);
    postAt(M,x,z,0.77,2.45,0.025,0xD8D2C6,0.8);
    for(k=0;k<8;k++){ var a0=k/8*Math.PI*2, a1=(k+1)/8*Math.PI*2;
      var P0=[x+Math.cos(a0)*1.35,2.05,z+Math.sin(a0)*1.35], P1=[x+Math.cos(a1)*1.35,2.05,z+Math.sin(a1)*1.35], A=[x,2.55,z];
      var mid=[(Math.cos(a0)+Math.cos(a1))/2,0.9,(Math.sin(a0)+Math.sin(a1))/2];
      VK.quad(M,[A,P0,P1,P1],mid,0xB8242B,1);
      VK.quad(M,[A,P1,P0,P0],[-mid[0],-1,-mid[2]],0x8E1C21,0.8); }
    [[0.8,0],[-0.8,0],[0,0.8]].forEach(function(o){ var cx=x+o[0], cz=z+o[1];
      postAt(M,cx,cz,0,0.45,0.2,0x2E2A27,0.7); });
    VK.collider(r,0.8);
  });

  /* ---------------- colliders ---------------- */
  VK.collider([Q(0,0),Q(CYW,0),Q(CYW,CYS),Q(CYE,CYS),Q(CYE,0),Q(WA,0),Q(WA,DB),Q(0,DB)],EAVE);
  VK.collider(rectRing(-PJ,7.2,-PJ,7.2),EAVE); VK.collider(rectRing(-PJ,7.2,50,DB+PJ),EAVE); VK.collider(rectRing(-PC,0.05,22.35,34.85),EAVE);
  VK.collider(rectRing(10.2,14,-0.35,0.02),4.5);

  window.__cale={tris:VK.MB.count()+VK.MA.count()+VK.MP.count()+M.count()-t0, Q:Q,
    look:function(){ window.__cam&&window.__cam(-110,60,-420,-45,0,-490); }};
})();
