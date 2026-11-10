/* ==================================================================
   McMorrow Residential College (USC Village Building 7, 835 W Jefferson
   Blvd), built with the Village kit VK (a2zm_village_kit.js).

   Plan from OSM relation 7935378 (5 levels) and way 727000076 (the one
   storey retail block), shifted like the rest of the Village (about
   -4.5, +5.5) so it fills the world.txt footprint, which is unchanged.
   Local frame: origin at the south west corner on Jefferson, a along
   Jefferson (grid east), b into the block (grid north toward the plaza).
   The residential block is a C round a one storey retail block: the
   south wing on Jefferson (a 0..64, b 0..15.3), the west wing on the
   street from Jefferson to the plaza (a 0..16), the east end, and a north
   piece that ends in a narrow point at the plaza. The east side is one
   straight diagonal along the walk between McMorrow and Nemirovsky; the
   retail block fronts that walk with shops, and its roof is the large
   second floor deck that USC Housing describes.

   From photos (Keck's photo of 835 W Jefferson, the entrance photo in
   the Daily Trojan, the Village street views): ground floor of shops
   between cast stone piers (round arched shopfronts at the east end of
   the Jefferson front), a cast stone band over it, three floors of
   square windows in stone surrounds, a sill course, a top floor of round
   arched windows, cornice, tile roof round a flat centre. A projecting
   brick bay with dark brick diamonds and a gable, cream stone oriel bays
   with lancets, and the entrance: a pointed arch between two cream stone
   buttresses with pinnacles under a stone panel lettered McMORROW
   RESIDENTIAL COLLEGE (placed here on the north point facing the plaza).
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='McMorrow Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M;
  var O=[34.778,-414.983], U=[0.872804,0.488071], W=[0.488071,-0.872804];
  function Q(a,b){ return [O[0]+a*U[0]+b*W[0], O[1]+a*U[1]+b*W[1]]; }
  function V(a,b){ var x=a*U[0]+b*W[0], z=a*U[1]+b*W[1], l=Math.hypot(x,z)||1; return [x/l,z/l]; }
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function ringL(pts){ return ccw(pts.map(function(p){ return Q(p[0],p[1]); })); }
  var tris0=VK.MB.count()+VK.MA.count()+VK.MP.count()+M.count();

  /* heights */
  var GH=5.5, FL=[6.0,9.2,12.4], TOP=15.6, EAVE=19.0, RISE=3.6;

  /* plan (local a,b) */
  var RES=[[0,0],[64,0],[64,16.5],[50.6,26.2],[45,15.3],[16,15.3],[16,38.6],[21.7,47.0],[8.5,56.5],[0,56.5]];
  var RET=[[16,15.3],[45,15.3],[50.6,26.2],[21.7,47.0],[16,38.6]];
  var resW=ringL(RES), retW=ringL(RET);

  /* a triangle on any accumulator, turned to face `want` */
  function tri3(tgt,A,Bp,D,want,col,k,uv){
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, c=rgb(col,k===undefined?1:k);
    if(nx*want[0]+ny*want[1]+nz*want[2]<0){ var t=Bp; Bp=D; D=t; if(uv){ uv=[uv[0],uv[2],uv[1]]; } }
    if(tgt===VK.MB) tgt.tri(A,Bp,D,uv[0],uv[1],uv[2],c); else tgt.tri(A,Bp,D,c,c,c);
  }
  /* brick on a side cheek of a projection (plane at s, from d0 to d1), facing dir sgn along the face */
  function cheek(F,s,d0,d1,y0,y1,sgn){
    var p=[F.p3(s,d0,y0),F.p3(s,d1,y0),F.p3(s,d1,y1),F.p3(s,d0,y1)];
    VK.quad(VK.MB,p,[F.t[0]*sgn,0,F.t[1]*sgn],0xFFFFFF,0.86,[[d0/2,y0],[d1/2,y0],[d1/2,y1],[d0/2,y1]]);
  }
  /* a gable on face F: base s0..s1 at height y0, apex h above, wall in plane d, roof running back to dBack */
  function gable(F,s0,s1,y0,h,d,dBack,stone,tile){
    var sc=(s0+s1)/2, A=F.p3(s0,d,y0), Bp=F.p3(s1,d,y0), T=F.p3(sc,d,y0+h), want=F.want;
    if(stone) tri3(M,A,Bp,T,want,C.CAST,0.95);
    else tri3(VK.MB,A,Bp,T,want,0xFFFFFF,1,[[s0/2,y0],[s1/2,y0],[sc/2,y0+h]]);
    /* stone coping on the rakes */
    var cw=0.32, k=h/((s1-s0)/2);
    [[s0,1],[s1,-1]].forEach(function(e){ var s=e[0], g=e[1];
      VK.quad(M,[F.p3(s,d+0.04,y0),F.p3(sc,d+0.04,y0+h),F.p3(sc,d+0.04,y0+h+cw),F.p3(s-g*0.25,d+0.04,y0+cw)],want,C.CAST_L,0.95); });
    /* the roof planes behind */
    var o=0.35, e0=s0-o, e1=s1+o, ye=y0-o*k+0.3, yt=y0+h+0.3;
    VK.quad(M,[F.p3(e0,d+0.25,ye),F.p3(sc,d+0.25,yt),F.p3(sc,dBack,yt),F.p3(e0,dBack,ye)],[-F.t[0],1.2,-F.t[1]],C.ROOF,0.92);
    VK.quad(M,[F.p3(e1,d+0.25,ye),F.p3(sc,d+0.25,yt),F.p3(sc,dBack,yt),F.p3(e1,dBack,ye)],[F.t[0],1.2,F.t[1]],C.ROOF,0.78);
    if(tile!==undefined){ var tw=Math.min(1.15,(s1-s0)*0.16); F.tile(tile,sc-tw,sc+tw,y0+0.45,y0+0.45+tw*2.1,d+0.03); }
  }
  /* finial / pinnacle on a face */
  function pinnacle(F,s,d,y0,y1){
    F.block(s-0.32,s+0.32,d-0.32,d+0.32,y0,y1,C.CAST_L,0.72);
    F.block(s-0.2,s+0.2,d-0.2,d+0.2,y1,y1+0.9,C.CAST,0.72);
    F.block(s-0.08,s+0.08,d-0.08,d+0.08,y1+0.9,y1+1.5,C.CAST_D,0.72);
  }
  /* cream stone oriel bay with lancets, floors 1..top, s0..s1 on face F, projecting p */
  function oriel(F,s0,s1,p){
    F.block(s0+0.25,s1-0.25,0,p-0.15,GH-0.7,GH,C.CAST_D,0.7);
    F.block(s0+0.1,s1-0.1,0,p-0.05,GH,FL[0],C.CAST,0.75);
    F.block(s0,s1,0,p,FL[0],EAVE+0.35,C.CAST,0.78,C.CAST_L);
    FL.concat([TOP]).forEach(function(y){ F.tile(TL.ORIEL,s0+0.08,s1-0.08,y+0.12,y+3.08,p+0.03); });
    F.block(s0-0.08,s1+0.08,-0.1,p+0.1,EAVE+0.35,EAVE+0.6,C.CAST_L,0.7);
    gable(F,s0,s1,EAVE+0.6,1.6,p-0.05,-0.6,true);
    pinnacle(F,s0+0.05,p-0.05,EAVE+0.6,EAVE+2.0); pinnacle(F,s1-0.05,p-0.05,EAVE+0.6,EAVE+2.0);
  }
  /* quoins on a pavilion edge (front plane d) */
  function quoins(F,s,dir,d,y0,y1){ for(var y=y0,k=0;y<y1-0.3;y+=0.62,k++){ var w=k%2?0.42:0.72; F.flat(dir>0?s:s-w,dir>0?s+w:s,y,y+0.54,d+0.02,C.CAST,0.95); } }

  /* the ground storey, windows, bands on one run s0..s1 of face F
     o: {n: bays, g: 'shop'|'arch'|'none', skip: [[s,s]...], gskip, pair: true, d: plane, y0: brick base} */
  function inSkip(c,sk){ if(!sk) return false; for(var j=0;j<sk.length;j++) if(c>sk[j][0]-0.2&&c<sk[j][1]+0.2) return true; return false; }
  function run(F,s0,s1,o){
    var d=o.d||0, n=o.n||Math.max(1,Math.round((s1-s0)/3.4)), pitch=(s1-s0)/n, y0=o.y0===undefined?0:o.y0;
    F.brick(s0,s1,y0,EAVE,d);
    if(o.g&&o.g!=='none'){
      F.block(s0,s1,d-0.05,d+0.12,0,0.42,C.CAST_D,0.7);
      for(var k=0;k<=n;k++){ var bs=s0+k*pitch; if(inSkip(bs,o.gskip)&&k>0&&k<n) continue;
        F.block(Math.max(s0,bs-0.32),Math.min(s1,bs+0.32),d-0.05,d+0.24,0.42,GH,C.CAST,0.74); }
    }
    for(var i=0;i<n;i++){
      var c=s0+(i+0.5)*pitch, hw=Math.min(0.95,pitch*0.3);
      if(o.g&&o.g!=='none'&&!inSkip(c,o.gskip)){
        var g=o.gt&&o.gt[i]!==undefined?o.gt[i]:o.g;
        if(g==='arch') F.tile(TL.SHOP_ARCH,c-pitch/2+0.36,c+pitch/2-0.36,0.42,5.15,d+0.05);
        else if(g==='door') F.tile(TL.DOOR,c-1.1,c+1.1,0.42,3.6,d+0.05);
        else { F.tile(TL.SHOP,c-pitch/2+0.36,c+pitch/2-0.36,0.42,4.35,d+0.05); F.flat(c-pitch/2+0.32,c+pitch/2-0.32,4.35,5.3,d+0.04,C.CAST_L,0.92); }
      }
      if(inSkip(c,o.skip)) continue;
      var pair=o.pair&&pitch>3.9;
      FL.forEach(function(y){ if(y<y0) return;
        if(pair) F.tile(TL.WIN_PAIR,c-1.35,c+1.35,y+0.4,y+2.95,d+0.03);
        else F.tile(TL.WIN,c-hw,c+hw,y+0.42,y+2.92,d+0.03); });
      F.tile(TL.WIN_ARCH,c-hw,c+hw,TOP+0.3,TOP+2.85,d+0.03);
    }
    /* sill course under the top floor and a thin course over the first floor */
    F.block(s0,s1,d-0.05,d+0.13,TOP+0.12,TOP+0.32,C.CAST,0.72);
    F.block(s0,s1,d-0.05,d+0.08,FL[1]-0.12,FL[1]+0.02,C.CAST,0.72);
  }
  /* a projecting brick pavilion with quoins, diaper diamonds and a gable */
  function pavilion(F,s0,s1,p,o){
    var n=o.n||2, pitch=(s1-s0)/n;
    run(F,s0,s1,{n:n,g:o.g,d:p,pair:o.pair,gt:o.gt});
    cheek(F,s0,0,p,0,EAVE,-1); cheek(F,s1,0,p,0,EAVE,1);
    quoins(F,s0,1,p,FL[0],EAVE-0.4); quoins(F,s1,-1,p,FL[0],EAVE-0.4);
    F.block(s0-0.3,s1+0.3,0,p+0.32,EAVE-0.42,EAVE,C.CAST,0.7);
    F.block(s0-0.1,s1+0.1,0,p+0.12,EAVE,EAVE+0.3,C.CAST_L,0.7);
    if(o.diaper){ /* a frieze of dark brick diamonds between the second and third floor windows */
      var y=FL[2]+0.06, dw=0.36, nd=Math.floor((s1-s0-1.6)/(dw*2)), sx0=(s0+s1)/2-nd*dw+dw;
      for(var i=0;i<nd;i++){ var sx=sx0+i*dw*2;
        VK.quad(M,[F.p3(sx,p+0.02,y-0.3),F.p3(sx+dw-0.04,p+0.02,y),F.p3(sx,p+0.02,y+0.3),F.p3(sx-dw+0.04,p+0.02,y)],F.want,C.BRICK_D,0.72); } }
    gable(F,s0-0.05,s1+0.05,EAVE+0.3,(s1-s0)*0.5,p-0.02,-6.5,false,TL.VENT_ARCH);
  }

  /* ---------------- faces ---------------- */
  function face(a0,b0,a1,b1,out){ return VK.face(Q(a0,b0),Q(a1,b1),V(out[0],out[1])); }
  function sOf(F,a,b){ var p=Q(a,b); return (p[0]-F.A[0])*F.t[0]+(p[1]-F.A[1])*F.t[1]; }

  /* Jefferson front (south), s = a */
  var FJ=face(0,0,64,0,[0,-1]);
  run(FJ,0,26,{n:8,g:'shop',skip:[[1.6,5.6]]});
  run(FJ,36,64,{n:8,g:'arch'});
  pavilion(FJ,26,36,0.7,{n:3,g:'shop',diaper:true});
  oriel(FJ,1.8,5.4,0.8);

  /* west front on the street to the plaza, s = 56.5 - b */
  var FW=face(0,56.5,0,0,[-1,0]);
  run(FW,0,56.5,{n:16,g:'arch',skip:[[14.6,18.2],[38.4,42.0]],gt:{0:'door'}});
  oriel(FW,14.6,18.2,0.8); oriel(FW,38.4,42.0,0.8);

  /* east end (toward Hoover) */
  var FE=face(64,0,64,16.5,[1,0]);
  run(FE,0,16.5,{n:5,g:'arch'});

  /* the two residential ends on the diagonal walk */
  var dn=[40,55.5];
  var FD1=face(64,16.5,50.6,26.2,dn), L1=FD1.L;
  run(FD1,0,4.2,{n:1,g:'shop'}); run(FD1,L1-4.2,L1,{n:1,g:'shop'});
  pavilion(FD1,4.2,L1-4.2,0.7,{n:2,g:'shop',pair:true,diaper:true});
  var FD2=face(21.7,47.0,8.5,56.5,dn), L2=FD2.L;
  run(FD2,0,L2,{n:5,g:'shop',gt:{2:'door'}});

  /* north point on the plaza: the entrance */
  var FN=face(8.5,56.5,0,56.5,[0,1]), LN=FN.L, cN=LN/2;
  FN.brick(0,LN,0,EAVE,0);
  [cN-2.7,cN+2.7].forEach(function(s){ FN.block(s-0.42,s+0.42,0,0.65,0,EAVE+1.4,C.CAST,0.78,C.CAST_L); pinnacle(FN,s,0.33,EAVE+1.4,EAVE+3.2); });
  FN.block(cN-2.28,cN+2.28,-0.05,0.14,0,0.42,C.CAST_D,0.7);
  FN.block(cN-2.28,cN+2.28,-0.05,0.1,0.42,5.55,C.CAST,0.8);
  FN.tile(TL.GOTHIC,cN-1.95,cN+1.95,0.42,5.45,0.13);
  FN.block(cN-2.1,cN+2.1,0,0.22,5.7,7.0,C.CAST_L,0.75);
  FL.forEach(function(y,k){ if(k>0) FN.tile(TL.WIN_PAIR,cN-1.6,cN+1.6,y+0.4,y+2.95,0.03); });
  FN.tile(TL.GOTHIC,cN-1.2,cN+1.2,TOP+0.1,TOP+2.8,0.03);
  [cN-3.65,cN+3.65].forEach(function(s){ FN.tile(TL.LANCET,s-0.5,s+0.5,0.6,4.6,0.03);
    FL.concat([TOP]).forEach(function(y){ FN.tile(TL.LANCET,s-0.45,s+0.45,y+0.3,y+2.85,0.03); }); });
  FN.block(-0.1,LN+0.1,-0.05,0.13,TOP+0.12,TOP+0.32,C.CAST,0.72);
  gable(FN,cN-2.3,cN+2.3,EAVE+0.4,3.3,0.25,-6,true,TL.ROSE);
  (function(){ var p=FN.pt(cN,0.23), n=FN.n;
    facadeText('McMORROW',p[0],p[1],n[0],n[1],6.55,5.4,0.5,'#5A4C3A');
    facadeText('RESIDENTIAL COLLEGE',p[0],p[1],n[0],n[1],6.08,3.7,0.35,'#5A4C3A'); })();

  /* courtyard faces above the deck */
  var FC1=face(16,15.3,45,15.3,[0,1]);   run(FC1,0,FC1.L,{n:8,g:'none',y0:GH});
  var FC2=face(45,15.3,50.6,26.2,[-10.9,5.6]); run(FC2,0,FC2.L,{n:3,g:'none',y0:GH});
  var FC3=face(16,38.6,16,15.3,[1,0]);   run(FC3,0,FC3.L,{n:7,g:'none',y0:GH});
  var FC4=face(16,38.6,21.7,47.0,[8.4,-5.7]); run(FC4,0,FC4.L,{n:3,g:'none',y0:GH});

  /* bands, cornice and roof round the residential block */
  band(M,resW,GH,FL[0],0.16,C.CAST,1,0.72,true);
  band(M,resW,EAVE-0.42,EAVE,0.3,C.CAST,1,0.7,true);
  band(M,resW,EAVE-0.62,EAVE-0.48,0.14,C.CAST_D,1,0.7,true);
  VK.roof(resW,EAVE,RISE,0.6);
  /* the flat centre of the roof is pale membrane (aerial photos), with a few boxes on it */
  var eR=offsetRing(resW,0.6), inR=safeInset(eR,Math.min(RISE*1.3,9)), yR=EAVE+0.45+Math.min(RISE,inR*1.35);
  flat(M,offsetRing(eR,-inR),yR+0.03,0xB4AFA5,1);
  function boxL(a0,a1,b0,b1,y0,y1,col,sh){ prism(M,ringL([[a0,b0],[a1,b0],[a1,b1],[a0,b1]]),y0,y1,col,col,sh===undefined?0.7:sh); }
  boxL(6,10,24,28,yR-0.2,yR+1.6,0xBDB6A8); boxL(28,33,6,9,yR-0.2,yR+1.3,0xBDB6A8); boxL(54,57,6,9,yR-0.2,yR+1.1,0xA8A196);

  /* ---------------- the retail block and the deck on its roof ---------------- */
  var FR=face(50.6,26.2,21.7,47.0,dn), LR=FR.L;
  FR.brick(0,LR,0,GH,0);
  FR.block(0,LR,-0.05,0.12,0,0.42,C.CAST_D,0.7);
  var nR=8, pR=LR/nR;
  for(var k=0;k<=nR;k++){ var bs=k*pR; FR.block(Math.max(0,bs-0.34),Math.min(LR,bs+0.34),-0.05,0.26,0.42,GH,C.CAST,0.74); }
  for(k=0;k<nR;k++){ var c=(k+0.5)*pR;
    FR.tile(TL.SHOP,c-pR/2+0.38,c+pR/2-0.38,0.42,4.3,0.05);
    FR.flat(c-pR/2+0.34,c+pR/2-0.34,4.3,5.3,0.04,0x2A2522,1); }
  FR.block(-0.1,LR+0.1,-0.3,0.3,GH-0.05,GH+0.95,C.CAST,0.75,C.CAST_L);
  FR.block(-0.1,LR+0.1,-0.38,0.38,GH+0.95,GH+1.1,C.CAST_L,0.7);
  /* shop names (OSM): which end is which depends on the face direction */
  function shopSign(a,b,str,w){ var s=(Math.floor(sOf(FR,a,b)/pR)+0.5)*pR, p=FR.pt(s,0.05), n=FR.n; facadeText(str,p[0],p[1],n[0],n[1],4.8,w,w/10.67,'#EDE5D2'); }
  shopSign(45.4,30.0,'lululemon',3.7);
  shopSign(35.4,37.2,'USC ROSKI EYE INSTITUTE',3.7);
  shopSign(25.6,44.2,'KAITLYN',3.7);
  (function(){ var s=sOf(FJ,50.5,0), p=FJ.pt(s,0.17), n=FJ.n; facadeText('CITY TACOS',p[0],p[1],n[0],n[1],5.75,5.6,0.52,'#4A3E30'); })();
  (function(){ var s=sOf(FJ,10,0), p=FJ.pt(s,0.17), n=FJ.n; facadeText('SOLE BICYCLES',p[0],p[1],n[0],n[1],5.75,5.6,0.52,'#4A3E30'); })();

  /* deck: pavers, planters, tables under red umbrellas */
  VK.pave(retW,GH+0.02,0.95);
  [[20,18,24,19.6],[26,18,32,19.6],[34,18,40,19.6],[17.5,22,19.1,34]].forEach(function(r){
    boxL(r[0],r[2],r[1],r[3],GH,GH+0.75,C.CAST,0.72); boxL(r[0]+0.12,r[2]-0.12,r[1]+0.12,r[3]-0.12,GH+0.75,GH+1.15,0x5D7A3E,0.8); });
  var RED=0xB3262B;
  [[25,25],[32,24],[38,23],[27,32],[34,30.5],[24,38]].forEach(function(t){
    var p=Q(t[0],t[1]), x=p[0], z=p[1], y0=GH, r=1.35, yr=y0+2.25, yt=y0+2.7;
    postAt(M,x,z,y0,yt,0.035,C.DARK,0.8);
    var tb=[[x-0.45,z-0.45],[x+0.45,z-0.45],[x+0.45,z+0.45],[x-0.45,z+0.45]]; if(ringArea(tb)<0) tb.reverse();
    prism(M,tb,y0+0.72,y0+0.78,0x3A3430,0x3A3430,0.8);
    for(var j=0;j<8;j++){ var a0=j/8*6.2832, a1=(j+1)/8*6.2832;
      var P0=[x+Math.cos(a0)*r,yr,z+Math.sin(a0)*r], P1=[x+Math.cos(a1)*r,yr,z+Math.sin(a1)*r], Tp=[x,yt,z];
      tri3(M,P0,P1,Tp,[0,1,0],RED,1); tri3(M,P0,P1,Tp,[0,-1,0],RED,0.55); } });

  /* colliders */
  VK.collider(resW,EAVE+1);
  VK.collider(retW,GH+1.1);

  window.__mcmorrow={tris:VK.MB.count()+VK.MA.count()+VK.MP.count()+M.count()-tris0, Q:Q,
    look:function(){ window.__cam&&window.__cam(60,1.7,-500,65,8,-450); }};
})();
