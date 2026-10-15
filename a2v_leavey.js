/* ==================================================================
   Thomas and Dorothy Leavey Library (1994, Shepley Bulfinch Richardson
   and Abbott), on the north side of McCarthy Quad. a_world.js leaves
   the footprint empty (HAND_HALLS) and sets LEAVEY (frame, plaza, pool).

   A long four storey block on the campus grid under a low pitched red
   brown tile roof, gabled at both ends, with a red mechanical box on the
   ridge. Every wall is banded: a pale cast stone ground storey run
   through with thin brick courses, then red brown brick fields crossed by
   thin stone stripes, stone string courses at the sills, grouped windows
   in stone surrounds with stone mullions, and a stone frieze of brick
   lozenges under the eave. A lower two storey wing projects at the west
   end of the south front.
   The south front faces the quad: a pale stone tower bay of stacked
   canted bay windows rises above the eave to a pediment with a lunette
   and LEAVEY LIBRARY; a gabled porch on banded piers stands at its foot
   over broad steps. East of the porch a raised terrace (red umbrellas)
   runs along the front behind a wall of long planters, under a white
   steel pergola on banded brick and stone piers hung with vines; in front
   of it the long reflecting pool, blue tile with a Greek key border in a
   raised white coping. A shorter pergola stands west of the steps. Red
   brick basketweave paving all round, twin globe lamps.
   Footprint from OpenStreetMap way 406923908 (height 25.2 m); the pool is
   OSM way 221557202, widened a little toward the
   terrace to match the photographs. Frame: u grid east, v grid south,
   origin on the south wall (LEAVEY.P).
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Leavey Library') B=CAMPUS[bi];
  if(!B||!LEAVEY) return;
  var L=LEAVEY, du=L.du, dv=L.dv, P=L.P;
  var M=new Mesher(), cols=[];
  var BRICK=0xA65842, BRICKD=0x934B38, CAST=0xE6D5BE, CASTL=0xEEE2CF, CASTD=0xC9B699,
      GLASS=0x5E7585, GLASSD=0x3C4C58, ROOF=0x95553F, ROOFD=0x7A4433, REDBOX=0xB5442F,
      WHITE=0xF2F0EA, PLANT=0xDCD5C8, HEDGE=0x4C7A36, VINE=0x3F6E30, IRON=0x2B3530,
      UMB=0xB8232B, TABLE=0x3A3A3A;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ var a=Math.min(u0,u1), b=Math.max(u0,u1), c=Math.min(v0,v1), d=Math.max(v0,v1);
    return ccw([P(a,c),P(b,c),P(b,d),P(a,d)]); }
  function box(u0,u1,v0,v1,y0,y1,col,sh){ var r=R(u0,u1,v0,v1); prism(M,r,y0,y1,col,col,sh===undefined?0.62:sh); return r; }
  function solid(r,h){ cols.push([r,h]); }
  function V3(u,v,y){ var p=P(u,v); return [p[0],y,p[1]]; }
  function q2(a,b,c,d,col,sh){ var k=rgb(col,sh===undefined?1:sh); M.quad(a,b,c,d,k,k,k,k); M.quad(d,c,b,a,k,k,k,k); }
  function t2(a,b,c,col,sh){ var k=rgb(col,sh===undefined?1:sh); M.tri(a,b,c,k,k,k); M.tri(c,b,a,k,k,k); }
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
  /* a lozenge on a wall */
  function lozenge(F,s,y,a,b,t,col){
    var p0=F.W(s-a,t), p1=F.W(s,t), p2=F.W(s+a,t);
    q2([p0[0],y,p0[1]],[p1[0],y-b,p1[1]],[p2[0],y,p2[1]],[p1[0],y+b,p1[1]],col,1);
  }
  /* a half disc on a wall (lunette) */
  function lunette(F,s,y,r,t,col){
    var n=10, c=F.W(s,t);
    for(var i=0;i<n;i++){
      var a0=Math.PI*i/n, a1=Math.PI*(i+1)/n, p0=F.W(s+Math.cos(a0)*r,t), p1=F.W(s+Math.cos(a1)*r,t);
      t2([c[0],y,c[1]],[p0[0],y+Math.sin(a0)*r,p0[1]],[p1[0],y+Math.sin(a1)*r,p1[1]],col,1);
    }
  }
  /* a thin rod between two points */
  function bar(A,Bp,w,col){
    var dx=Bp[0]-A[0], dz=Bp[2]-A[2], Ln=Math.hypot(dx,dz)||1, sx=-dz/Ln*w/2, sz=dx/Ln*w/2;
    var a1=[A[0]+sx,A[1],A[2]+sz], a2=[A[0]-sx,A[1],A[2]-sz], a3=[a2[0],A[1]+w,a2[2]], a4=[a1[0],A[1]+w,a1[2]];
    var b1=[Bp[0]+sx,Bp[1],Bp[2]+sz], b2=[Bp[0]-sx,Bp[1],Bp[2]-sz], b3=[b2[0],Bp[1]+w,b2[2]], b4=[b1[0],Bp[1]+w,b1[2]];
    q2(a1,b1,b4,a4,col,0.85); q2(a2,b2,b3,a3,col,0.85); q2(a4,b4,b3,a3,col,1); q2(a1,b1,b2,a2,col,0.7);
  }
  function text(F,s,t,y,str,hgt,col){ var p=F.W(s,t); facadeText(str,p[0],p[1],F.n[0],F.n[1],y,hgt*1024/96,hgt,col); }

  /* ================= plan ================= */
  var U0=-39.2, U1=35.0, VN=-25.2, VS=0;          /* main block */
  var HE=18.6;                                     /* eave (top of frieze) */
  var WU0=-36.0, WU1=-19.6, WV1=12.9, WHE=9.6;     /* the west wing */
  var TU0=-12.2, TU1=-6.5, TV0=-1.0, TV1=3.2, TC=(TU0+TU1)/2;   /* the tower bay */
  var YT=0.9;                                      /* the terrace and porch landing */
  var PU0=1.6, PU1=35.2, PV0=13.6, PV1=21.5;       /* the pool, outside the coping */
  /* clear trees off the plaza before planting */
  var zone=L.plaza;
  for(var ti=TREE_POS.length-1;ti>=0;ti--) if(inRing(zone,TREE_POS[ti][0],TREE_POS[ti][1])) TREE_POS.splice(ti,1);
  NO_LAWN_TREES.push(zone.slice());

  /* ================= massing ================= */
  var rMain=box(U0,U1,VN,VS,0,HE,BRICK,0.6); solid(rMain,23.5);
  var rWing=box(WU0,WU1,VS-0.5,WV1,0,WHE,BRICK,0.6); solid(rWing,12.6);
  /* the round stair tower on the north side */
  (function(){
    var c=P(-9.25,VN), r=[], n=10;
    for(var i=0;i<=n;i++){ var a=Math.PI*i/n, q=P(-9.25+Math.cos(a)*3.7,VN-Math.sin(a)*5.6); r.push(q); }
    ccw(r); prism(M,r,0,HE,BRICK,CASTL,0.6); solid(r,HE);
    for(var y=0.9;y<HE-1;y+=1.25) band(M,r,y,y+0.28,0.02,CAST,1,0.8,true);
    band(M,r,0,0.6,0.05,CASTD,1,0.7,true);
    band(M,r,HE-1.2,HE,0.06,CAST,1,0.8);
  })();

  /* ================= banded walls ================= */
  /* storey levels of the main block */
  var LV=[[5.25,9.1],[9.75,13.6],[14.25,17.0]], STR=[[4.6,5.25],[9.1,9.75],[13.6,14.25]];
  function groupWin(F,c,n,y0,y1){
    var lw=0.9, mw=0.16, W=n*lw+(n-1)*mw;
    fq(F,c-W/2-0.32,c+W/2+0.32,y0-0.28,y1+0.32,0.04,CAST,0.98);
    fq(F,c-W/2,c+W/2,y0,y1,0.05,GLASS,1);
    fq(F,c-W/2,c+W/2,y0+(y1-y0)*0.74,y0+(y1-y0)*0.74+0.1,0.06,CASTL,1);
    for(var k=1;k<n;k++){ var s=c-W/2+k*(lw+mw)-mw; fq(F,s,s+mw,y0,y1,0.06,CASTL,1); }
    fb(F,c-W/2-0.4,c+W/2+0.4,0,0.16,y0-0.42,y0-0.28,CASTL,0.8);
  }
  /* dress one face. lv: storey bands, top: frieze top; groups [[c,n],...] */
  function dress(F,s0,s1,o){
    var gTop=o.gTop||4.6, lvs=o.lv, strs=o.str, top=o.top;
    /* stone ground storey with thin brick courses, darker plinth */
    fq(F,s0,s1,0,gTop,0.02,CAST,0.97);
    for(var y=0.95;y<gTop-0.4;y+=0.8) fq(F,s0,s1,y,y+0.17,0.03,BRICK,0.95);
    fq(F,s0,s1,0,0.5,0.04,CASTD,0.9);
    /* string courses at the sills, thin stone stripes through the brick */
    strs.forEach(function(q){ fb(F,s0-0.05,s1+0.05,0,0.1,q[0],q[1],CAST,0.85); });
    lvs.forEach(function(q){
      for(var y2=q[0]+1.05;y2<q[1]-0.5;y2+=1.1) fq(F,s0,s1,y2,y2+0.22,0.025,CAST,0.95);
    });
    /* the frieze of brick lozenges and the eave */
    var fy0=top-1.6;
    fq(F,s0,s1,fy0,top,0.03,CAST,0.98);
    fq(F,s0,s1,fy0,fy0+0.18,0.04,CASTD,0.9);
    for(var s=s0+1.3;s<s1-0.9;s+=2.6) lozenge(F,s,fy0+0.85,0.55,0.42,0.045,BRICKD);
    if(!o.noEave){ fb(F,s0-0.9,s1+0.9,0,0.9,top,top+0.42,CASTL,0.55); fb(F,s0-0.95,s1+0.95,0.85,0.95,top+0.3,top+0.5,CASTL,0.9); }
    /* windows */
    (o.groups||[]).forEach(function(g){
      var n=g[1];
      if(!o.noGround) groupWin(F,g[0],n,1.2,3.75);
      lvs.forEach(function(q){ groupWin(F,g[0],n,q[0]+0.45,q[1]-0.35); });
    });
  }
  function seq(a,b,step){ var r=[]; for(var x=a;x<=b+0.01;x+=step) r.push(x); return r; }
  /* south front */
  var FS=Face(1,VS,1);
  dress(FS,U0,U1,{lv:LV,str:STR,top:HE,groups:[[-35.6,4],[-29.0,4],[-22.4,4],[-16.0,3],[-1.6,4],[5.3,4],[12.2,4],[19.1,4],[26.0,4],[32.4,2]]});
  /* north front: groups either side of the stair tower */
  var gN=seq(-35.6,31.4,6.7).filter(function(c){ return Math.abs(c-(-9.25))>6.5; }).map(function(c){ return [c,4]; });
  dress(Face(1,VN,-1),U0,U1,{lv:LV,str:STR,top:HE,groups:gN});
  /* the ends */
  dress(Face(0,U1,1),VN,VS,{lv:LV,str:STR,top:HE,groups:[[-21.0,2],[-12.6,3],[-4.2,2]]});
  dress(Face(0,U0,-1),VN,VS,{lv:LV,str:STR,top:HE,groups:[[-21.0,2],[-12.6,3],[-4.2,2]]});
  /* the west wing: stone ground storey, one brick storey, its own frieze */
  var WLV=[[5.25,8.0]], WSTR=[[4.6,5.25]];
  dress(Face(1,WV1,1),WU0,WU1,{lv:WLV,str:WSTR,top:WHE,groups:[[-32.4,3],[-27.8,3],[-23.2,3]]});
  dress(Face(0,WU1,1),VS,WV1,{lv:WLV,str:WSTR,top:WHE,groups:[[3.6,2],[9.3,2]]});
  dress(Face(0,WU0,-1),VS,WV1,{lv:WLV,str:WSTR,top:WHE,groups:[[3.6,2],[9.3,2]]});

  /* ================= roofs ================= */
  function gableRoof(u0,u1,vA,vB,yE,vR,yR,col,endA,endB){
    /* eaves along u at vA and vB (yE), ridge at vR (yR), gable ends at u0/u1 */
    q2(V3(u0,vA,yE),V3(u1,vA,yE),V3(u1,vR,yR),V3(u0,vR,yR),col,1.0);
    q2(V3(u0,vB,yE),V3(u1,vB,yE),V3(u1,vR,yR),V3(u0,vR,yR),col,0.86);
    /* fascia and dark tile rows */
    for(var k=1;k<4;k++){ var f=k/4;
      var yA=yE+(yR-yE)*f, vvA=vA+(vR-vA)*f, vvB=vB+(vR-vB)*f;
      q2(V3(u0,vvA,yA+0.03),V3(u1,vvA,yA+0.03),V3(u1,vvA+(vR-vA)*0.012,yA+0.06),V3(u0,vvA+(vR-vA)*0.012,yA+0.06),ROOFD,1);
      q2(V3(u0,vvB,yA+0.03),V3(u1,vvB,yA+0.03),V3(u1,vvB+(vR-vB)*0.012,yA+0.06),V3(u0,vvB+(vR-vB)*0.012,yA+0.06),ROOFD,1);
    }
    bar(V3(u0,vR,yR-0.05),V3(u1,vR,yR-0.05),0.32,ROOFD);
  }
  var VR=(VN+VS)/2, RISE=0.36, ER=HE+0.42, RR=ER+(VR-VN+0.9)*RISE;
  gableRoof(U0-0.7,U1+0.7,VS+0.9,VN-0.9,ER,VR,RR,ROOF);
  /* gable ends: brick tympanum over a cornice return, stone on the rakes, a small window */
  [[U0,-1],[U1,1]].forEach(function(e){
    var u=e[0], o=e[1]*0.02;
    t2(V3(u+o,VS,ER),V3(u+o,VN,ER),V3(u+o,VR,RR-0.1),BRICK,0.9);
    var F=Face(0,u,e[1]);
    for(var y=ER+0.9;y<RR-0.8;y+=1.1){ var hw=(RR-y)/RISE-0.3; fq(F,VR-hw,VR+hw,y,y+0.22,0.03,CAST,0.95); }
    fq(F,VR-0.75,VR+0.75,ER+1.2,ER+2.6,0.05,CAST,1); fq(F,VR-0.5,VR+0.5,ER+1.4,ER+2.4,0.06,GLASSD,1);
    [VS,VN].forEach(function(vv){ bar(V3(u+e[1]*0.3,vv+(vv>VR?0.9:-0.9),ER-0.05),V3(u+e[1]*0.3,VR,RR+0.1),0.36,CASTL); });
  });
  /* the red mechanical box on the ridge */
  var rb=box(-17,-1.5,-17.5,-8.0,RR-2.2,25.2,REDBOX,0.62);
  box(-17.2,-1.3,-17.7,-7.8,25.2,25.45,0xC9C2B8,0.8);
  /* the wing: gable roof along u, pediment toward the court and the pool */
  var WVR=(VS+WV1)/2, WER=WHE+0.42, WRR=WER+(WV1+0.8-WVR)*0.4;
  gableRoof(WU0-0.7,WU1+0.7,WV1+0.8,VS-0.5,WER,WVR,WRR,ROOF);
  [[WU0,-1],[WU1,1]].forEach(function(e){
    var u=e[0], o=e[1]*0.02;
    t2(V3(u+o,VS-0.5,WER),V3(u+o,WV1,WER),V3(u+o,WVR,WRR-0.1),CAST,0.95);
    var F=Face(0,u,e[1]);
    fb(F,VS-0.5,WV1+0.9,0,0.6,WER-0.05,WER+0.25,CASTL,0.8);          /* the pediment's horizontal cornice */
    lunette(F,WVR,WER+0.55,1.0,0.05,GLASSD);
    [VS-0.5,WV1+0.8].forEach(function(vv){ bar(V3(u+e[1]*0.3,vv,WER-0.05),V3(u+e[1]*0.3,WVR,WRR+0.1),0.34,CASTL); });
  });

  /* ================= the tower bay ================= */
  (function(){
    var top=20.6, rT=box(TU0,TU1,TV0,TV1,0,top,CAST,0.62); solid(rT,top);
    box(TU0,TU1,-8,TV0,HE,top,CAST,0.62);
    var FT=Face(1,TV1,1), FTe=Face(0,TU1,1), FTw=Face(0,TU0,-1);
    [FT,FTe,FTw].forEach(function(F,k){
      var a=k?TV0:TU0, b=k?TV1:TU1;
      for(var y=0.6;y<top-0.5;y+=0.75) fq(F,a,b,y,y+0.05,0.02,CASTD,1);
      STR.forEach(function(q){ fb(F,a-0.08,b+0.08,0,0.12,q[0],q[1],CASTL,0.85); });
      fb(F,a-0.1,b+0.1,0,0.1,HE-0.4,HE,CASTL,0.85);
      if(k){ for(var j=0;j<LV.length;j++) fq(F,TV0+0.9,TV1-0.9,LV[j][0]+0.45,LV[j][1]-0.35,0.04,GLASS,1); }
    });
    /* stacked canted bay windows, floors 2 to 4 */
    var bp=[[TC-2.05,TV1],[TC-1.35,TV1+0.95],[TC+1.35,TV1+0.95],[TC+2.05,TV1]];
    var br=ccw(bp.map(function(q){ return P(q[0],q[1]); }));
    prism(M,br,4.75,17.1,CAST,CASTL,0.66);
    band(M,br,4.45,4.75,0.12,CASTD,1,0.6);
    band(M,br,17.1,17.5,0.15,CASTL,1,0.7);
    for(var j=0;j<LV.length;j++){
      var y0=LV[j][0]+0.35, y1=LV[j][1]-0.3;
      for(var e=0;e<3;e++){
        var a=bp[e], b=bp[e+1], ex=b[0]-a[0], ev=b[1]-a[1], Ln=Math.hypot(ex,ev);
        var i0=0.18/Ln, i1=1-i0, ox=-ev/Ln*0.05, ov=ex/Ln*0.05;
        var A=[a[0]+ex*i0+ox,a[1]+ev*i0+ov], Bq=[a[0]+ex*i1+ox,a[1]+ev*i1+ov];
        q2(V3(A[0],A[1],y0),V3(Bq[0],Bq[1],y0),V3(Bq[0],Bq[1],y1),V3(A[0],A[1],y1),GLASS,1);
        if(e===1){ for(var m=1;m<3;m++){ var f=i0+(i1-i0)*m/3, mx=a[0]+ex*f, mv=a[1]+ev*f;
          q2(V3(mx-0.08,mv+0.07,y0),V3(mx+0.08,mv+0.07,y0),V3(mx+0.08,mv+0.07,y1),V3(mx-0.08,mv+0.07,y1),CASTL,1); } }
      }
      var FB=Face(1,TV1+0.95,1);
      fq(FB,TC-1.35,TC+1.35,y0+(y1-y0)*0.74,y0+(y1-y0)*0.74+0.1,0.1,CASTL,1);
    }
    /* the name panel, cornice and pediment above the eave */
    fq(FT,TU0+0.4,TU1-0.4,17.7,20.1,0.04,CASTL,1);
    text(FT,TC,0.09,19.45,'LEAVEY',0.62,'#4E3F31');
    text(FT,TC,0.09,18.5,'LIBRARY',0.62,'#4E3F31');
    var PW0=TU0-1.5, PW1=TU1+1.5, PE=top, PA=24.3;
    fb(FT,PW0,PW1,-9.2,0.75,PE,PE+0.42,CASTL,0.62);
    t2(V3(PW0+0.3,TV1+0.02,PE+0.42),V3(PW1-0.3,TV1+0.02,PE+0.42),V3(TC,TV1+0.02,PA),CAST,1);
    lunette(FT,TC,PE+0.75,1.25,0.04,CASTD);
    lunette(FT,TC,PE+0.85,0.95,0.07,GLASSD);
    for(var mm=-1;mm<=1;mm+=2) q2(V3(TC+mm*0.32,TV1+0.1,PE+0.85),V3(TC+mm*0.32+0.08,TV1+0.1,PE+0.85),V3(TC+mm*0.32+0.08,TV1+0.1,PE+1.7),V3(TC+mm*0.32,TV1+0.1,PE+1.7),CASTL,1);
    /* the cross gable roof, back over the main roof */
    var ve=TV1+0.8;
    q2(V3(PW0-0.2,ve,PE+0.3),V3(PW0-0.2,-9.5,PE+0.3),V3(TC,-9.5,PA+0.2),V3(TC,ve,PA+0.2),ROOF,0.95);
    q2(V3(PW1+0.2,ve,PE+0.3),V3(PW1+0.2,-9.5,PE+0.3),V3(TC,-9.5,PA+0.2),V3(TC,ve,PA+0.2),ROOF,0.82);
    bar(V3(PW0-0.25,ve,PE+0.27),V3(TC,ve,PA+0.17),0.38,CASTL);
    bar(V3(PW1+0.25,ve,PE+0.27),V3(TC,ve,PA+0.17),0.38,CASTL);
    bar(V3(TC,ve,PA+0.1),V3(TC,-9.5,PA+0.1),0.3,ROOFD);
    /* the doors at the foot of the tower */
    fq(FT,TC-1.9,TC+1.9,YT,YT+3.0,0.05,GLASSD,1);
    for(var dd=-1;dd<=1;dd++) fq(FT,TC+dd*1.25-0.06,TC+dd*1.25+0.06,YT,YT+3.0,0.07,0x8C8C88,1);
    fb(FT,TC-2.2,TC+2.2,0,0.15,YT+3.0,YT+3.3,CASTL,0.8);
  })();

  /* ================= banded piers (porch and pergolas) ================= */
  function pier(u,v,y0,y1,w){
    var h=w/2, r=box(u-h,u+h,v-h,v+h,y0,y1,BRICK,0.62);
    for(var y=y0+0.55;y<y1-0.5;y+=0.9) box(u-h-0.03,u+h+0.03,v-h-0.03,v+h+0.03,y,y+0.3,CAST,0.7);
    box(u-h-0.08,u+h+0.08,v-h-0.08,v+h+0.08,y0,y0+0.35,CAST,0.68);
    box(u-h-0.12,u+h+0.12,v-h-0.12,v+h+0.12,y1,y1+0.22,CASTL,0.75);
    solid(r,y1+0.22);
  }

  /* ================= terrace, porch landing and steps ================= */
  var TE0=-5.8, TE1=34.4, TEV=12.7;
  var rLand=box(TU0-1.2,TE0+0.2,VS,TV1+3.0,0,YT,CAST,0.7); solid(rLand,YT);
  var rTer=box(TE0,TE1,VS,TEV,0,YT,CAST,0.7); solid(rTer,YT);
  box(TE0,TE1,TEV,TEV+0.08,0,0.3,CASTD,0.7);
  /* main steps down to the plaza from the porch */
  var SV=TV1+3.0;
  for(var st=0;st<5;st++){
    var y=YT-0.18*(st+1);
    if(y<0.01) break;
    var rs=box(TU0-1.2,TU1+1.0,SV+st*0.48,SV+(st+1)*0.48,0,y,CASTL,0.66); solid(rs,y);
  }
  for(var cs=-1;cs<=1;cs+=2){                      /* cheek walls */
    var cu=cs<0?TU0-1.45:TU1+1.25, rc=box(cu-0.25,cu+0.25,TV1+3.0,SV+2.1,0,YT+0.5,CAST,0.66); solid(rc,YT+0.5);
  }
  /* steps up onto the terrace's east end */
  for(st=0;st<5;st++){
    var y3=YT-0.18*(st+1); if(y3<0.01) break;
    var rs2=box(TE1+st*0.45,TE1+(st+1)*0.45,1.0,6.5,0,y3,CASTL,0.66); solid(rs2,y3);
  }

  /* ================= the porch ================= */
  (function(){
    var u0=TU0-0.6, u1=TU1+0.6, vf=TV1+2.6, pT=YT+3.5;
    pier(u0+0.45,vf-0.45,YT,pT,0.9); pier(u1-0.45,vf-0.45,YT,pT,0.9);
    pier(u0+0.45,TV1+0.45,YT,pT,0.8); pier(u1-0.45,TV1+0.45,YT,pT,0.8);
    box(u0-0.1,u1+0.1,TV1,vf+0.15,pT+0.2,pT+0.75,CASTL,0.66);          /* entablature */
    var ap=pT+2.4, ve=vf+0.6;
    q2(V3(u0-0.5,ve,pT+0.7),V3(u0-0.5,TV1+0.1,pT+0.7),V3(TC,TV1+0.1,ap),V3(TC,ve,ap),ROOF,0.95);
    q2(V3(u1+0.5,ve,pT+0.7),V3(u1+0.5,TV1+0.1,pT+0.7),V3(TC,TV1+0.1,ap),V3(TC,ve,ap),ROOF,0.82);
    t2(V3(u0+0.1,vf+0.1,pT+0.75),V3(u1-0.1,vf+0.1,pT+0.75),V3(TC,vf+0.1,ap-0.25),CAST,1);
    bar(V3(u0-0.55,ve,pT+0.66),V3(TC,ve,ap-0.04),0.3,WHITE);
    bar(V3(u1+0.55,ve,pT+0.66),V3(TC,ve,ap-0.04),0.3,WHITE);
    var FP=Face(1,vf+0.1,1);
    lunette(FP,TC,pT+0.95,0.7,0.02,GLASSD);
    /* lanterns either side of the doors */
    [TC-2.5,TC+2.5].forEach(function(u){ box(u-0.18,u+0.18,TV1,TV1+0.35,YT+2.3,YT+2.9,0xE9D9A8,0.95); });
  })();

  /* ================= pergolas ================= */
  var PIERS=[];                                   /* [u,v] for vines */
  function pergola(uA,uB,n,vP,vW,y0,yTop){
    var step=(uB-uA)/(n-1), yb=yTop+0.22;
    for(var i=0;i<n;i++){ var u=uA+i*step; pier(u,vP,y0,yTop,0.95); PIERS.push([u,vP,y0,yTop]); }
    /* longitudinal beam on the piers, and a lighter one against the wall */
    box(uA-0.9,uB+0.9,vP-0.17,vP+0.17,yb,yb+0.42,WHITE,0.75);
    box(uA-0.9,uB+0.9,vW+0.2,vW+0.45,yb+0.1,yb+0.42,WHITE,0.75);
    /* transverse beams at every pier and halfway between, cantilevered past the piers */
    for(var k=0;k<=2*(n-1);k++){
      var u2=uA+k*step/2, vOut=vP+(vP>vW?1.3:-1.3);
      box(u2-0.11,u2+0.11,Math.min(vW+0.2,vOut),Math.max(vW+0.2,vOut),yb+0.42,yb+0.72,WHITE,0.78);
      if(k%2===0){                              /* knee braces */
        var sg=vP>vW?-1:1;
        bar(V3(u2,vP+sg*0.5,yTop-0.9),V3(u2,vP+sg*1.8,yb),0.14,WHITE);
      }
    }
    /* purlins across the beams */
    var vlo=Math.min(vW+0.6,vP), vhi=Math.max(vW+0.6,vP);
    for(var vv=vlo+0.5;vv<vhi+1.2;vv+=1.6) box(uA-0.9,uB+0.9,vv-0.06,vv+0.06,yb+0.72,yb+0.86,WHITE,0.8);
  }
  pergola(-2.8,33.2,7,12.1,VS,YT,YT+4.0);                 /* along the terrace and the pool */
  pergola(WU1+0.9,TU0-2.1,3,10.2,VS,0,4.6);                /* west of the steps */
  /* long planters on the terrace wall, between the piers */
  function planters(uA,uB,n,vP,y0){
    var step=(uB-uA)/(n-1);
    for(var i=0;i<n-1;i++){
      var a=uA+i*step+0.65, b=uA+(i+1)*step-0.65;
      var r=box(a,b,vP-0.45,vP+0.5,y0,y0+0.72,PLANT,0.72);
      box(a+0.12,b-0.12,vP-0.33,vP+0.38,y0+0.72,y0+1.12,HEDGE,0.75);
      for(var s=a+0.6;s<b-0.5;s+=1.9) box(s,s+0.9,vP+0.5,vP+0.6,y0+0.15,y0+0.85,VINE,0.75);   /* trailing ivy */
      solid(r,y0+1.12);
    }
  }
  planters(-2.8,33.2,7,12.1,YT);
  planters(WU1+0.9,TU0-2.1,3,10.2,0);
  /* vines up the piers and over the beams */
  PIERS.forEach(function(q,i){
    if(i%2===1) return;
    var u=q[0], v=q[1], sg=v>3?1:-1;
    var vf=v+sg*0.5;
    box(u-0.22,u+0.26,Math.min(vf,vf+sg*0.16),Math.max(vf,vf+sg*0.16),q[2]+0.5,q[2]+1.9,VINE,0.72);
    box(u-0.3,u+0.12,Math.min(vf,vf+sg*0.2),Math.max(vf,vf+sg*0.2),q[2]+1.7,q[2]+2.9,HEDGE,0.72);
    box(u-0.1,u+0.34,Math.min(vf,vf+sg*0.18),Math.max(vf,vf+sg*0.18),q[2]+2.7,q[3]+0.4,VINE,0.72);
    box(u-0.9,u+0.4,v-0.7,v+0.5,q[3]+0.85,q[3]+1.2,VINE,0.8);
    box(u+0.5,u+1.5,v-2.4,v-1.2,q[3]+0.9,q[3]+1.12,HEDGE,0.82);
    box(u-1.6,u-0.8,v-1.5,v-0.6,q[3]+0.9,q[3]+1.1,VINE,0.82);
  });

  /* ================= tables and red umbrellas on the terrace ================= */
  (function(){
    var spots=[];
    for(var u=1.5;u<31;u+=6) spots.push([u,4.6],[u+3,8.6]);
    spots.forEach(function(s){
      var p=P(s[0],s[1]), x=p[0], z=p[1];
      postAt(M,x,z,YT,YT+0.72,0.05,TABLE,0.8);
      var top=ccw(ngon(x,z,0.55,10,0)); prism(M,top,YT+0.72,YT+0.77,0x9A9A96,0xB4B4AE,0.8);
      for(var c=0;c<4;c++){ var a=c/4*Math.PI*2+0.4, cx=x+Math.cos(a)*0.95, cz=z+Math.sin(a)*0.95;
        postAt(M,cx,cz,YT,YT+0.45,0.2,TABLE,0.7); }
      postAt(M,x,z,YT+0.77,YT+2.55,0.035,0x6E6E6E,0.8);
      coneRoof(M,x,z,1.5,YT+2.3,0.5,UMB,4);
      solid(ccw([[x-0.6,z-0.6],[x+0.6,z-0.6],[x+0.6,z+0.6],[x-0.6,z+0.6]]),YT+0.8);
    });
  })();

  /* ================= the reflecting pool ================= */
  var MW=new Mesher();
  (function(){
    var cop=0.55, yc=0.5, yw=0.42, yf=0.22, i0=PU0+cop, i1=PU1-cop, j0=PV0+cop, j1=PV1-cop;
    /* low step, raised white coping */
    var rStep=box(PU0-0.5,PU1+0.5,PV0-0.4,PV1+0.5,0,0.2,CASTL,0.7);
    [[PU0,PU1,PV0,j0],[PU0,PU1,j1,PV1],[PU0,i0,j0,j1],[i1,PU1,j0,j1]].forEach(function(q){ box(q[0],q[1],q[2],q[3],0.2,yc,WHITE,0.72); });
    /* tiled walls inside */
    var k=0x2F7FB8;
    q2(V3(i0,j0,yf),V3(i1,j0,yf),V3(i1,j0,yc),V3(i0,j0,yc),k,0.9);
    q2(V3(i0,j1,yf),V3(i1,j1,yf),V3(i1,j1,yc),V3(i0,j1,yc),k,0.8);
    q2(V3(i0,j0,yf),V3(i0,j1,yf),V3(i0,j1,yc),V3(i0,j0,yc),k,0.85);
    q2(V3(i1,j0,yf),V3(i1,j1,yf),V3(i1,j1,yc),V3(i1,j0,yc),k,0.85);
    solid(R(PU0-0.5,PU1+0.5,PV0-0.4,PV1+0.5),0.95);
    /* the floor: blue tile with the Greek key border, one canvas texture */
    var LU=i1-i0, LVv=j1-j0, cw=2048, ch=512, sx=cw/LU, sy=ch/LVv;
    var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch;
    var g=cv.getContext('2d');
    g.fillStyle='#2C93D4'; g.fillRect(0,0,cw,ch);
    g.fillStyle='rgba(255,255,255,0.10)';
    for(var x=0;x<LU;x+=0.6) g.fillRect(x*sx,0,1.5,ch);
    for(var yy=0;yy<LVv;yy+=0.6) g.fillRect(0,yy*sy,cw,1.5);
    var ins=0.35, bw=0.85;
    g.fillStyle='#E9F1F4';
    g.fillRect(ins*sx,ins*sy,(LU-2*ins)*sx,bw*sy); g.fillRect(ins*sx,(LVv-ins-bw)*sy,(LU-2*ins)*sx,bw*sy);
    g.fillRect(ins*sx,ins*sy,bw*sx,(LVv-2*ins)*sy); g.fillRect((LU-ins-bw)*sx,ins*sy,bw*sx,(LVv-2*ins)*sy);
    /* one key unit on a 7x7 grid: rails and an inward spiral */
    var KEY=[[0,0,7,1],[0,0,1,6],[0,5,5,6],[4,2,5,6],[2,2,5,3],[2,2,3,4],[0,6.4,7,7]];
    g.fillStyle='#1C4F8E';
    function side(ox,oy,ax,ay,bx,by,len){        /* origin, along, across (metres) */
      var unit=bw, n=Math.floor(len/unit), t=unit/7;
      for(var i=0;i<n;i++) KEY.forEach(function(r){
        var s0=i*unit+r[0]*t, s1=i*unit+r[2]*t, c0=r[1]*t*0.94+bw*0.03, c1=r[3]*t*0.94+bw*0.03;
        var xs=[ox+ax*s0+bx*c0, ox+ax*s1+bx*c1], ys=[oy+ay*s0+by*c0, oy+ay*s1+by*c1];
        g.fillRect(Math.min(xs[0],xs[1])*sx,Math.min(ys[0],ys[1])*sy,Math.abs(xs[1]-xs[0])*sx,Math.abs(ys[1]-ys[0])*sy);
      });
    }
    var lenL=LU-2*ins-2*bw, lenS=LVv-2*ins;
    side(ins+bw,ins,1,0,0,1,lenL);                       /* north */
    side(ins+bw,LVv-ins,1,0,0,-1,lenL);                  /* south */
    side(ins,ins,0,1,1,0,lenS);                          /* west */
    side(LU-ins,ins,0,1,-1,0,lenS);                      /* east */
    var tex=new T.CanvasTexture(cv);
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var a=V3(i0,j0,yf), b=V3(i0,j1,yf), c=V3(i1,j1,yf), d=V3(i1,j0,yf);
    var gq=new T.BufferGeometry();
    gq.setAttribute('position',new T.Float32BufferAttribute([].concat(a,b,c,a,c,d),3));
    gq.setAttribute('uv',new T.Float32BufferAttribute([0,1,0,0,1,0, 0,1,1,0,1,1],2));
    gq.computeVertexNormals();
    var floor=new T.Mesh(gq,new T.MeshLambertMaterial({map:tex}));
    floor.frustumCulled=false; floor.receiveShadow=true; scene.add(floor);
    /* the water: a pale clear sheet just under the coping */
    MW.quad(V3(i0,j0,yw),V3(i0,j1,yw),V3(i1,j1,yw),V3(i1,j0,yw),[1,1,1],[1,1,1],[1,1,1],[1,1,1]);
    var water=new T.Mesh(MW.geom(),new T.MeshLambertMaterial({color:0x5CC0EA,transparent:true,opacity:0.26,depthWrite:false}));
    water.renderOrder=2; water.frustumCulled=false; scene.add(water);
  })();

  /* ================= the brick plaza: basketweave, one texture ================= */
  (function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=512;
    var g=cv.getContext('2d'), U=32;
    g.fillStyle='#8E6A5A'; g.fillRect(0,0,512,512);
    function bc(a,b){ var h=Math.sin(a*127.1+b*311.7)*43758.5453; h-=Math.floor(h);
      var r=Math.round(160+h*30), gg=Math.round(78+h*18), bb=Math.round(60+h*14); if(h>0.88){ r-=24; gg-=12; bb-=8; }
      return 'rgb('+r+','+gg+','+bb+')'; }
    for(var i=0;i<16;i++) for(var j=0;j<16;j++){
      var x=i*U, y=j*U;
      for(var k=0;k<2;k++){
        g.fillStyle=bc(i*2+k,j);
        if((i+j)%2===0) g.fillRect(x+1.5,y+k*U/2+1.5,U-3,U/2-3);
        else g.fillRect(x+k*U/2+1.5,y+1.5,U/2-3,U-3);
      }
    }
    var tex=new T.CanvasTexture(cv); tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var pos=[], uv=[];
    function quad(u0,u1,v0,v1,y){
      var A=V3(u0,v0,y), Bq=V3(u0,v1,y), C=V3(u1,v1,y), D=V3(u1,v0,y), s=3.2;
      pos.push.apply(pos,[].concat(A,Bq,C,A,C,D));
      uv.push(u0/s,-v0/s,u0/s,-v1/s,u1/s,-v1/s, u0/s,-v0/s,u1/s,-v1/s,u1/s,-v0/s);
    }
    quad(-43.5,42,-1,36,0.06);
    quad(TU0-1.2,TE0+0.2,VS,TV1+3.0,YT+0.01);
    quad(TE0,TE1,VS,TEV,YT+0.01);
    var gb=new T.BufferGeometry();
    gb.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    gb.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    gb.computeVertexNormals();
    var mb=new T.Mesh(gb,new T.MeshLambertMaterial({map:tex}));
    mb.receiveShadow=true; mb.frustumCulled=false; scene.add(mb);
  })();

  /* ================= twin globe lamps ================= */
  var GLOBES=[];
  [[-38,24.4],[-20,24.4],[-2,24.4],[16,24.4],[33,24.4],[39.5,2.5],[39.5,14],[-41.2,5]].forEach(function(q){
    var p=P(q[0],q[1]), x=p[0], z=p[1], hg=4.3;
    postAt(M,x,z,0,0.6,0.2,IRON,0.6);
    postAt(M,x,z,0.6,hg,0.08,IRON,0.66);
    var a=P(q[0]-0.55,q[1]), b=P(q[0]+0.55,q[1]);
    segBox(M,a,b,hg-0.12,hg-0.02,0.08,IRON,0.7);
    postAt(M,x,z,hg,hg+0.75,0.05,IRON,0.7);
    GLOBES.push([a[0],hg+0.28,a[1]],[b[0],hg+0.28,b[1]],[x,hg+0.95,z]);
    addCollider(ccw([[x-0.3,z-0.3],[x+0.3,z-0.3],[x+0.3,z+0.3],[x-0.3,z+0.3]]),hg);
  });
  var gG=new T.SphereGeometry(0.27,10,8), iG=new T.InstancedMesh(gG,new T.MeshLambertMaterial({color:0xF7F4EC,emissive:0x5E5A50}),GLOBES.length);
  var D=new T.Object3D();
  GLOBES.forEach(function(q,i){ D.position.set(q[0],q[1],q[2]); D.updateMatrix(); iG.setMatrixAt(i,D.matrix); });
  iG.frustumCulled=false; iG.raycast=function(){}; scene.add(iG);

  /* ================= build ================= */
  B.h=HE;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  window.__leavey={tris:M.count()};
})();
