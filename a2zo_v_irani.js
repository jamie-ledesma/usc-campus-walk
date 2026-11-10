/* ==================================================================
   Ghada and Ray Irani Residential College (USC Village), built with the
   Village kit VK (a2zm_village_kit.js). It is the east half of Village
   Building 6 (929 W Jefferson Blvd), shared with Cale Residential College
   (a2zn_v_cale.js) to the west: five storeys, Collegiate Gothic brick and
   cast stone, a podium ground floor (fitness centre, FedEx Office, service
   desks) and four floors of rooms round a courtyard on the podium roof.

   From photos and the satellite view: the south front on Jefferson has
   round arched ground floor windows, a cast stone belt, windows in cast
   stone surrounds, round arched windows on the top floor, a gabled brick
   pavilion and, by the south east corner, the cream stone oriel bay of
   paired lancets over a pointed entrance, with the "USC Village" sign wall
   and a stone pinnacle pier in front (the Jefferson entrance on the
   Trousdale axis). The east front on that entrance walk: shop arches, a
   second oriel corbelled out over a door, and a corner pavilion with its
   own hip roof at the plaza. The north front on the plaza: a cream stone
   arcade with shopfronts behind, a gable. The courtyard is on the podium.

   Matches Cale: ground storey 5.5 m, floors 3.2 m, eave 18.3 m, the same
   plinth, belt, top floor sill band, frieze and cornice, and the same roof
   (tile slopes down to the outer eaves and into the courtyard, flat crown
   at 22.75 m). No wall on the shared west edge: both roofs hip down to it
   and meet in a valley.

   Frame: Q(u,v) maps u 0..WU (along the north front, grid east) and
   v 0..WV (grid south, toward Jefferson) bilinearly onto the world.txt
   ring, so the corners shared with Cale are exact.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='Irani Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M, MG=VK.MG, MB=VK.MB;
  var t0=VK.MB.count()+VK.MA.count()+VK.MP.count()+M.count()+MG.count();
  var NW=[-12,-504], NE=[30,-481], SE=[2,-433], SW=[-40,-454], WU=47.4, WV=56.4;
  function Q(u,v){ var s=u/WU, t=v/WV, k0=(1-s)*(1-t), k1=s*(1-t), k2=s*t, k3=(1-s)*t;
    return [k0*NW[0]+k1*NE[0]+k2*SE[0]+k3*SW[0], k0*NW[1]+k1*NE[1]+k2*SE[1]+k3*SW[1]]; }
  var FR=VK.frame(NW,[NE[0]-NW[0],NE[1]-NW[1]]), du=FR.du, dv=FR.dv;
  var G=5.5, FL=[5.5,8.7,11.9,15.1], TOP=15.1, EAVE=18.3;
  var CU0=12.5, CU1=35.0, CV0=14.0, CV1=40.5;              /* courtyard */
  var pu0=40.9, pu1=WU+0.7, pv0n=-0.7, pv1n=6.4, PE=EAVE+1.0;  /* north east corner pavilion */
  var AD=3.0;                                              /* depth of the plaza arcade */
  var neg=function(a){ return [-a[0],-a[1]]; }, neg3=function(w){ return [-w[0],-w[1],-w[2]]; };
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ return ccw([Q(u0,v0),Q(u1,v0),Q(u1,v1),Q(u0,v1)]); }
  function tri3(tgt,a,b,c,want,col,k){ VK.quad(tgt,[a,b,c,c],want,col,k); }
  function brickTri(F,s0,s1,y0,y1,d){                      /* brick triangle in a face plane (gables) */
    var a=F.p3(s0,d,y0), b=F.p3(s1,d,y0), c=F.p3((s0+s1)/2,d,y1);
    VK.quad(MB,[a,b,c,c],F.want,0xFFFFFF,1,[[s0/2,y0],[s1/2,y0],[(s0+s1)/4,y1],[(s0+s1)/4,y1]]);
  }

  /* faces on the exact corners; s runs left to right seen from outside */
  var FS=VK.face(SW,SE,dv);           /* Jefferson: s from the west (Cale) end */
  var FE=VK.face(SE,NE,du);           /* entrance walk: s from Jefferson */
  var FN=VK.face(NE,NW,neg(dv));      /* plaza: s from the east end */

  /* ---------------- pieces ---------------- */
  function win(F,s,d,kind){                        /* one column of windows, floors 1-4 */
    for(var f=0;f<4;f++){ var y=FL[f], top=f===3;
      var id=kind==='pair'?TL.WIN_PAIR:(top?TL.WIN_ARCH:TL.WIN), w=kind==='pair'?2.7:1.9;
      F.tile(id,s-w/2,s+w/2,y+0.45,y+2.75,d+0.03);
      if(f) F.block(s-w/2+0.05,s+w/2-0.05,d,d+0.13,y+0.37,y+0.51,C.CAST,0.75);
    }
  }
  function shop(F,s,d){ F.tile(TL.SHOP_ARCH,s-1.55,s+1.55,0.6,4.85,d+0.03); }
  function door(F,s,d){
    F.block(s-1.6,s+1.6,d,d+0.22,0,4.5,C.CAST,0.8);
    F.tile(TL.DOOR,s-1.3,s+1.3,0.02,3.9,d+0.25);
    F.block(s-1.75,s+1.75,d,d+0.35,4.5,4.95,C.CAST_L,0.8);
  }
  /* the stone courses of a brick front, as on Cale: plinth, belt, top floor sill, frieze, cornice */
  function bands(F,s0,s1,d,noGround){
    if(!noGround){ F.block(s0,s1,d,d+0.1,0,0.6,C.CAST_D,0.8); F.block(s0,s1,d,d+0.2,G-0.22,G+0.28,C.CAST,0.75); }
    F.block(s0,s1,d,d+0.1,TOP-0.12,TOP+0.06,C.CAST_L,0.8);
    F.block(s0,s1,d,d+0.06,EAVE-0.62,EAVE-0.15,C.CAST_L,0.8);
    F.block(s0-0.05,s1+0.05,d,d+0.32,EAVE-0.15,EAVE+0.4,C.CAST,0.75);
  }
  function pinnacle(F,s,d,y0,h){
    var a=0.2, r=F.ring(s-a,s+a,d-a,d+a), y1=y0+h*0.55, y2=y0+h, o=F.p3(s,d,0);
    prism(M,r,y0,y1,C.CAST_L,C.CAST_L,0.8);
    var c=[F.p3(s-a,d-a,y1),F.p3(s+a,d-a,y1),F.p3(s+a,d+a,y1),F.p3(s-a,d+a,y1)];
    for(var k=0;k<4;k++){ var p=c[k], q=c[(k+1)%4];
      tri3(M,p,q,F.p3(s,d,y2),[(p[0]+q[0])/2-o[0],0.6,(p[2]+q[2])/2-o[2]],C.CAST_L,0.95); }
  }
  /* cream stone oriel bay of paired lancets, floors 1-4, with a coping and pinnacles */
  function oriel(F,s0,s1,fromGround){
    var dp=0.7, n=3, w=(s1-s0-0.5)/n;
    F.block(s0,s1,0,dp,fromGround?0:G-0.5,EAVE+1.4,C.CAST_L,0.82);
    if(!fromGround){                                     /* corbels under the bay */
      F.block(s0+0.15,s1-0.15,0,dp-0.12,G-0.95,G-0.5,C.CAST,0.7);
      F.block(s0+0.4,s1-0.4,0,dp-0.3,G-1.35,G-0.95,C.CAST,0.7);
    }
    for(var f=0;f<4;f++) for(var k=0;k<n;k++)
      F.tile(TL.ORIEL,s0+0.25+k*w+0.04,s0+0.25+(k+1)*w-0.04,FL[f]+0.12,FL[f]+3.05,dp+0.03);
    F.block(s0-0.06,s1+0.06,-0.05,dp+0.1,G-0.22,G+0.12,C.CAST,0.75);          /* belt carried across */
    F.block(s0-0.08,s1+0.08,-0.05,dp+0.12,EAVE+1.4,EAVE+1.65,C.CAST,0.75);    /* coping */
    for(var j=0;j<=n;j++) pinnacle(F,s0+0.25+j*w,dp-0.15,EAVE+1.65,j%n?1.7:2.4);
  }
  /* a gable rising from the cornice over sc-w/2..sc+w/2 on the plane d, its roof running back `depth` */
  function gable(F,sc,w,d,depth,tile){
    var y0=EAVE+0.4, h=w/2*0.95, ya=y0+h, s0=sc-w/2, s1=sc+w/2;
    brickTri(F,s0,s1,y0,ya,d);
    if(tile) F.tile(tile,sc-0.95,sc+0.95,y0+0.3,y0+Math.min(2.6,h-0.6),d+0.03);
    var o=0.35, e=0.25, dd=d+0.45, db=d-depth, ye=y0-o*0.95+0.15;
    var L0=F.p3(s0-o,dd,ye), A0=F.p3(sc,dd,ya+e), A1=F.p3(sc,db,ya+e), L1=F.p3(s0-o,db,ye);
    var R0=F.p3(s1+o,dd,ye), R1=F.p3(s1+o,db,ye), t=F.t, n=F.n;
    VK.quad(M,[L0,A0,A1,L1],[-t[0],1,-t[1]],C.ROOF,1);
    VK.quad(M,[A0,R0,R1,A1],[t[0],1,t[1]],C.ROOF,1);
    VK.quad(M,[L0,A0,A1,L1],[t[0],-1,t[1]],C.ROOF_D,0.6);               /* undersides of the overhang */
    VK.quad(M,[A0,R0,R1,A1],[-t[0],-1,-t[1]],C.ROOF_D,0.6);
    tri3(M,L1,R1,A1,[-n[0],0,-n[1]],C.ROOF_D,0.8);                       /* back end */
    VK.quad(M,[F.p3(s0-0.1,d+0.05,y0),F.p3(sc,d+0.05,ya+0.2),F.p3(sc,d+0.05,ya-0.15),F.p3(s0+0.25,d+0.05,y0)],F.want,C.CAST_L,0.95);
    VK.quad(M,[F.p3(s1-0.25,d+0.05,y0),F.p3(sc,d+0.05,ya-0.15),F.p3(sc,d+0.05,ya+0.2),F.p3(s1+0.1,d+0.05,y0)],F.want,C.CAST_L,0.95);
  }
  /* a small gabled dormer set into the roof slope above column s */
  function dormer(F,s){
    var a=0.85, d0=-0.6, d1=-3.6, yt=21.3, yr=22.15;
    F.block(s-a,s+a,d1,d0,EAVE+0.4,yt,C.CAST_L,0.8);
    F.tile(TL.WIN_SMALL,s-0.6,s+0.6,20.1,21.2,d0+0.03);
    tri3(M,F.p3(s-a,d0,yt),F.p3(s+a,d0,yt),F.p3(s,d0,yr),F.want,C.CAST_L,0.95);
    var dd=d0+0.25, db=-4.0, t=F.t;
    var L0=F.p3(s-a-0.15,dd,yt-0.12), A0=F.p3(s,dd,yr+0.08), A1=F.p3(s,db,yr+0.08), L1=F.p3(s-a-0.15,db,yt-0.12);
    var R0=F.p3(s+a+0.15,dd,yt-0.12), R1=F.p3(s+a+0.15,db,yt-0.12);
    VK.quad(M,[L0,A0,A1,L1],[-t[0],1,-t[1]],C.ROOF,1);
    VK.quad(M,[A0,R0,R1,A1],[t[0],1,t[1]],C.ROOF,1);
  }

  /* ================= south front (Jefferson) ================= */
  var LS=FS.L;                                               /* 46.96 */
  FS.brick(0,LS,0,EAVE,0);
  bands(FS,0,LS,0);
  [3.6,8.0,12.4,30.2,34.2].forEach(function(s){ win(FS,s,0); shop(FS,s,0); dormer(FS,s); });
  /* gabled brick pavilion, three pairs of windows */
  var pv0=15.3, pv1=27.1, pd=0.45;
  FS.brick(pv0,pv1,0,EAVE,pd);
  VK.face(FS.pt(pv0,0),FS.pt(pv0,pd),neg(FS.t)).brick(0,pd,0,EAVE,0);
  VK.face(FS.pt(pv1,pd),FS.pt(pv1,0),FS.t).brick(0,pd,0,EAVE,0);
  bands(FS,pv0,pv1,pd);
  [17.3,25.1].forEach(function(s){ win(FS,s,pd,'pair'); shop(FS,s,pd); });
  win(FS,21.2,pd,'pair'); door(FS,21.2,pd);
  gable(FS,21.2,pv1-pv0,pd,7.5,TL.VENT_ARCH);
  /* oriel bay over the pointed entrance by the corner */
  var ob0=37.0, ob1=44.6;
  oriel(FS,ob0,ob1,true);
  FS.block(ob0+1.1,ob1-1.1,0.7,0.95,0,5.2,C.CAST,0.8);
  FS.tile(TL.GOTHIC,ob0+1.35,ob1-1.35,0.05,5.05,0.98);
  /* (the "USC Village" monument signs at the paseo mouth are drawn by a2zw_v_plaza.js) */

  /* ================= east front (the entrance walk from Jefferson to the plaza) ================= */
  var LE=FE.L, pe0=LE-pv1n*LE/WV;                            /* 55.57; the pavilion starts at s pe0 */
  FE.brick(0,LE,0,EAVE,0);
  bands(FE,0,pe0,0);
  [4.0,8.4,12.8,17.2,21.6,34.2,38.6,43.0,47.4].forEach(function(s){ win(FE,s,0); shop(FE,s,0); });
  [4.0,12.8,21.6,38.6,47.4].forEach(function(s){ dormer(FE,s); });
  oriel(FE,24.1,31.7,false);
  door(FE,27.9,0);

  /* ================= north front (the plaza): stone arcade ================= */
  var LN=FN.L, PD=0.7, a0=7.2, pitch=4.4, nb=9, spring=3.3, SY=G-0.22;
  var sP=LN-pu0*LN/WU;                                        /* the pavilion's west side, in s */
  FN.brick(0,LN,SY,EAVE,0);
  bands(FN,0,LN,0,true);
  FN.block(0,LN,0,0.2,G-0.22,G+0.28,C.CAST,0.75);
  FN.flat(sP,LN,0,SY,-AD,C.CAST_D,0.85);                      /* back wall of the arcade */
  FN.under(sP,LN,-AD,-PD,SY,C.CAST_D);
  VK.pave(ccw([FN.pt(sP,0),FN.pt(LN-0.8,0),FN.pt(LN-0.8,-AD),FN.pt(sP,-AD)]),0.02);
  for(var k=0;k<=nb;k++){ var sk=a0+k*pitch;
    FN.block(sk-0.45,sk+0.45,-PD,0,0.45,SY,C.CAST,0.75);
    FN.block(sk-0.55,sk+0.55,-PD-0.08,0.08,0,0.45,C.CAST_D,0.8);
    FN.block(sk-0.52,sk+0.52,-PD-0.05,0.05,spring-0.25,spring,C.CAST_L,0.8);  /* impost */
    VK.collider(FN.ring(sk-0.5,sk+0.5,-PD,0.05),G);
  }
  FN.block(LN-0.8,LN,-AD,0,0,SY,C.CAST,0.75);                               /* the west end, against Cale */
  for(k=0;k<nb;k++){ var sc=a0+k*pitch+pitch/2, r=pitch/2-0.45, N=8, pts=[];
    for(var q=0;q<=N;q++){ var an=Math.PI*(1-q/N); pts.push([sc+Math.cos(an)*r, spring+Math.sin(an)*r]); }
    for(q=0;q<N;q++){ var p0=pts[q], p1=pts[q+1];
      VK.quad(M,[FN.p3(p0[0],0,p0[1]),FN.p3(p1[0],0,p1[1]),FN.p3(p1[0],0,SY),FN.p3(p0[0],0,SY)],FN.want,C.CAST,0.95);
      VK.quad(M,[FN.p3(p0[0],-PD,p0[1]),FN.p3(p1[0],-PD,p1[1]),FN.p3(p1[0],-PD,SY),FN.p3(p0[0],-PD,SY)],neg3(FN.want),C.CAST_D,0.8);
      var mx=(p0[0]+p1[0])/2-sc, my=(p0[1]+p1[1])/2-spring;
      VK.quad(M,[FN.p3(p0[0],0,p0[1]),FN.p3(p1[0],0,p1[1]),FN.p3(p1[0],-PD,p1[1]),FN.p3(p0[0],-PD,p0[1])],[-(FN.t[0]*mx),-my,-(FN.t[1]*mx)],C.CAST_D,0.85);
    }
    FN.block(sc-0.22,sc+0.22,0,0.1,spring+r-0.15,SY,C.CAST_L,0.85);         /* keystone */
    FN.tile(TL.SHOP,sc-1.6,sc+1.6,0.05,4.4,-AD+0.03);
    win(FN,sc,0);
  }
  gable(FN,a0+4.5*pitch,9.6,0,7,TL.WIN_ARCH);
  [a0+0.5*pitch,a0+2.5*pitch,a0+6.5*pitch,a0+8.5*pitch].forEach(function(s){ dormer(FN,s); });

  /* ================= north east corner pavilion with its own hip roof ================= */
  var PN=VK.face(Q(pu1,pv0n),Q(pu0,pv0n),neg(dv)), PEf=VK.face(Q(pu1,pv1n),Q(pu1,pv0n),du);
  [PN,PEf].forEach(function(F){ var L=F.L, c=L/2;
    F.brick(0,L,0,PE,0);
    F.block(0,L,0,0.1,0,0.6,C.CAST_D,0.8);
    F.block(0,L,0,0.2,G-0.22,G+0.28,C.CAST,0.75);
    F.block(0,L,0,0.1,TOP-0.12,TOP+0.06,C.CAST_L,0.8);
    F.block(0,L,0,0.12,EAVE-0.15,EAVE+0.1,C.CAST,0.8);                    /* the main cornice line carried round */
    F.block(-0.05,L+0.05,0,0.22,PE-0.3,PE,C.CAST,0.8);
    F.block(-0.1,L+0.1,0,0.55,PE,PE+0.45,C.CAST_L,0.7);
    win(F,c,0,'pair'); shop(F,c,0);
    F.block(-0.02,0.55,0,0.12,0.6,PE-0.3,C.CAST_L,0.85);                    /* stone corner strips */
    F.block(L-0.55,L+0.02,0,0.12,0.6,PE-0.3,C.CAST_L,0.85);
  });
  var RW=VK.face(Q(pu0,pv0n),Q(pu0,AD),neg(du)), RS=VK.face(Q(WU,pv1n),Q(pu1,pv1n),dv);
  RW.brick(0,RW.L,0,PE,0); RS.brick(0,RS.L,0,PE,0);
  hipRoof(M,offsetRing(R(pu0,pu1,pv0n,pv1n),0.55),PE+0.45,3.9,3.2,C.ROOF);

  /* ================= roof, as Cale's: slopes to the outer eaves and into the courtyard, flat crown ================= */
  (function(){
    var OV=0.55, RI=4.68, RSl=3.6, y0=EAVE+0.4, y1=y0+0.45, y2=y1+RSl;
    function RR(a0,a1,b0,b1,sgn){ var r=[Q(a0,b0),Q(a1,b0),Q(a1,b1),Q(a0,b1)]; if(ringArea(r)*sgn<0) r.reverse(); return r; }
    var Eo=RR(-OV,WU+OV,-OV,WV+OV,1), To=RR(-OV+RI,WU+OV-RI,-OV+RI,WV+OV-RI,1);
    var Ec=RR(CU0+OV,CU1-OV,CV0+OV,CV1-OV,-1), Tc=RR(CU0+OV-RI,CU1-OV+RI,CV0+OV-RI,CV1-OV+RI,-1);
    band(M,Eo,y0,y1,0,C.CAST,0.9,0.6,true); band(M,Ec,y0,y1,0,C.CAST,0.9,0.6,true);
    function slopes(lo,hi,inner){
      var h=lo.map(function(p){ var best=null,bd=1e9; hi.forEach(function(q){ var d=Math.hypot(q[0]-p[0],q[1]-p[1]); if(d<bd){ bd=d; best=q; } }); return best; });
      for(var i=0;i<4;i++){ var j=(i+1)%4, a=lo[i], b=lo[j], ai=h[i], bi=h[j];
        var mx=(a[0]+b[0]-ai[0]-bi[0])/2, mz=(a[1]+b[1]-ai[1]-bi[1])/2, ml=Math.hypot(mx,mz)||1;
        VK.quad(M,[[a[0],y1,a[1]],[b[0],y1,b[1]],[bi[0],y2,bi[1]],[ai[0],y2,ai[1]]],[mx/ml,1.3,mz/ml],C.ROOF,0.92);
        var ex=[(b[0]-a[0]),(b[1]-a[1])], el=Math.hypot(ex[0],ex[1]), kk=inner?-OV:OV; ex=[ex[0]/el*kk,ex[1]/el*kk];
        var wa=[a[0]+ex[0]-mx/ml*OV,a[1]+ex[1]-mz/ml*OV], wb=[b[0]-ex[0]-mx/ml*OV,b[1]-ex[1]-mz/ml*OV];
        VK.quad(M,[[a[0],y0-0.01,a[1]],[b[0],y0-0.01,b[1]],[wb[0],y0-0.01,wb[1]],[wa[0],y0-0.01,wa[1]]],[0,-1,0],C.CAST_D,0.6); } }
    slopes(Eo,To,0); slopes(Ec,Tc,1);
    flatHoled(M,To,[Tc],y2,C.ROOF,1);
  })();

  /* ================= courtyard on the podium ================= */
  var CF=[VK.face(Q(CU0,CV0),Q(CU1,CV0),dv), VK.face(Q(CU1,CV0),Q(CU1,CV1),neg(du)),
          VK.face(Q(CU1,CV1),Q(CU0,CV1),neg(dv)), VK.face(Q(CU0,CV1),Q(CU0,CV0),du)];
  CF.forEach(function(F){ var L=F.L, n=Math.floor((L-2)/3.6), st=(L-(n-1)*3.6)/2;
    F.brick(0,L,G-0.3,EAVE,0);
    F.block(0,L,0,0.12,G,G+0.3,C.CAST,0.8);
    bands(F,0,L,0,true);
    for(var c=0;c<n;c++){ var s=st+c*3.6;
      for(var f=0;f<4;f++) if(f||c!==Math.floor(n/2)) F.tile(TL.WIN,s-0.85,s+0.85,FL[f]+0.5,FL[f]+2.7,0.03);
      if(c===Math.floor(n/2)) F.tile(TL.DOOR,s-1.0,s+1.0,G+0.3,G+3.0,0.05);
    }
  });
  VK.pave(R(CU0,CU1,CV0,CV1),G+0.31);
  flat(MG,R(CU0+3.2,CU1-3.2,CV0+3.2,CV1-3.2),G+0.5,0x5E8F45,1);
  [[CU0+3.0,CU0+3.4,CV0+3.0,CV1-3.0],[CU1-3.4,CU1-3.0,CV0+3.0,CV1-3.0],[CU0+3.4,CU1-3.4,CV0+3.0,CV0+3.4],[CU0+3.4,CU1-3.4,CV1-3.4,CV1-3.0]]
    .forEach(function(b){ prism(M,R(b[0],b[1],b[2],b[3]),G+0.3,G+0.75,C.CAST,C.CAST_L,0.8); });
  [[CU0+2.0,CV0+1.0],[CU1-3.4,CV1-2.0]].forEach(function(t){ prism(M,R(t[0],t[0]+1.4,t[1],t[1]+0.8),G+0.3,G+1.05,0x6B5444,0x7A6250,0.8); });

  /* ================= colliders ================= */
  VK.collider(ccw([Q(0,AD),Q(pu0,AD),Q(pu0,pv0n),Q(pu1,pv0n),Q(pu1,pv1n),Q(WU,pv1n),Q(WU,WV),Q(0,WV)]),EAVE+1);
  VK.collider(FS.ring(pv0,pv1,0,pd),EAVE);
  VK.collider(FS.ring(ob0,ob1,0,0.7),EAVE);
  VK.collider(FE.ring(24.1,31.7,0,0.7),EAVE);
  window.__irani={Q:Q,FS:FS,FE:FE,FN:FN,tris:VK.MB.count()+VK.MA.count()+VK.MP.count()+M.count()+MG.count()-t0};
})();
