/* ==================================================================
   George Finley Bovard Administration Building and Auditorium (1921,
   John and Donald Parkinson), Italian Romanesque in rose red brick and
   cream cast stone. a_world.js leaves the footprint empty (HAND_HALLS)
   and sets BOVARD (frame, front lawn kept clear, a hidden crowd walk).

   Massing from OpenStreetMap way 406923885 (34.1 m), shifted like Tommy
   Trojan: a three storey front range facing grid east onto the forecourt
   and Trousdale, the tower in its middle standing 2.7 m forward, taller
   three storey ranges at both ends whose east ends are the projecting
   pavilions, lower blocks behind, and the auditorium hall in the middle
   (stage end projecting west) under a gabled tile roof with a rose window.
   The tower: engaged brick shafts near every corner, the deep cast stone
   portal (four orders on colonnettes, carved rings, dark wood doors) up
   steps, the bronze plaque, a pair of round arched lights under a brick
   relieving arch, the tall two light window in a cast stone frame with
   the seal in its tympanum (all four faces), the belfry of five arches
   on twisted colonnettes, the eight white statues on the shaft capitals,
   corbel table, bracketed cornice and a low tile pyramid roof.
   Front range: ground storey of round brick arches (wood doors or
   windows), a cast stone belt, paired round headed windows in cream
   surrounds, pairs of small arched lights, corbel table, cornice, tile
   roof. End ranges: square windows below, a continuous arcade of arched
   windows on colonnettes on top. Forecourt of pale panels in red brick
   bands between clipped hedges, topiary cones and lamps by the steps,
   magnolias and sycamores on the lawns.
   Frame: HAHN.P (u grid east, v grid south); the tower axis is v=VC.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Bovard Administration Building') B=CAMPUS[bi];
  if(!B||!BOVARD) return;
  var P=HAHN.P, du=HAHN.du, dv=HAHN.dv, VC=BOVARD.VC, PI=Math.PI;
  var M=new Mesher(), MG=new Mesher(), cols=[], TQP=[], TQU=[];
  var BRICK=0xBC6A55, BRICKL=0xC4725C, BRICKD=0x9A4E3E, CAST=0xE3D6B8, CASTL=0xEEE4CC, CASTD=0xC5B595,
      GLASS=0x2C3843, FRAME=0x2A2622, DARK=0x1F1B19, WOOD=0x452E21, WOODL=0x5E402E,
      TILE=0xA8573A, TILED=0x7B3926, BRONZE=0x4E3D2B, STAT=0xF3EFE6, HEDGE=0x2F5A26, HEDGEL=0x3B6A2E,
      PAVE=0xC6BDAA, PBR=0x8E4636, PBRD=0x8A4A3A, IRON=0x1E2224, LIT=0xF2DFA8;
  var ROT8=Math.atan2(du[1],du[0])+PI/8;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function gw(a,b){ return [du[0]*a+dv[0]*b, du[1]*a+dv[1]*b]; }
  function R(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function box(m,u0,u1,v0,v1,y0,y1,col,sh){ var r=R(u0,u1,v0,v1); prism(m,r,y0,y1,col,col,sh===undefined?0.66:sh); return r; }
  /* a wall frame: origin (ou,ov), s along (su,sv), t out along (nu,nv), all in grid units */
  function Fr(ou,ov,su,sv,nu,nv){
    return {n:gw(nu,nv), sd:gw(su,sv), W:function(s,t){ return P(ou+su*s+nu*t, ov+sv*s+nv*t); }};
  }

  /* ---- drawing helpers in a frame ---- */
  function fq(F,t,pts,col,sh){
    var c=rgb(col,sh===undefined?1:sh), w=pts.map(function(q){ var p=F.W(q[0],t); return [p[0],q[1],p[1]]; });
    var ux=w[1][0]-w[0][0], uy=w[1][1]-w[0][1], uz=w[1][2]-w[0][2], vx=w[2][0]-w[0][0], vy=w[2][1]-w[0][1], vz=w[2][2]-w[0][2];
    var nx=uy*vz-uz*vy, nz=ux*vy-uy*vx;
    if(nx*F.n[0]+nz*F.n[1]<0) w.reverse();
    if(w.length===3) M.tri(w[0],w[1],w[2],c,c,c); else M.quad(w[0],w[1],w[2],w[3],c,c,c,c);
  }
  /* a quad given as [s,y,t] points, turned to face the world direction `want` */
  function q3(F,pts,col,sh,want){
    var c=rgb(col,sh), w=pts.map(function(q){ var p=F.W(q[0],q[2]); return [p[0],q[1],p[1]]; });
    var ux=w[1][0]-w[0][0], uy=w[1][1]-w[0][1], uz=w[1][2]-w[0][2], vx=w[2][0]-w[0][0], vy=w[2][1]-w[0][1], vz=w[2][2]-w[0][2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) w.reverse();
    M.quad(w[0],w[1],w[2],w[3],c,c,c,c);
  }
  function fr(F,s0,s1,y0,y1,t,col,sh){ fq(F,t,[[s0,y0],[s1,y0],[s1,y1],[s0,y1]],col,sh); }
  function fa(F,s,t,y0,w,hs,ha,col,sh){ var p=F.W(s,t); archFace(M,p[0],p[1],-F.n[1],F.n[0],0,0,y0,w,hs,ha,col,sh===undefined?1:sh); }
  function fb(F,s0,s1,t0,t1,y0,y1,col,sh){
    var r=ccw([F.W(s0,t0),F.W(s1,t0),F.W(s1,t1),F.W(s0,t1)]); prism(M,r,y0,y1,col,col,sh===undefined?0.66:sh); return r; }
  function solid(F,s0,s1,t0,t1,h){ cols.push([ccw([F.W(s0,t0),F.W(s1,t0),F.W(s1,t1),F.W(s0,t1)]),h]); }
  /* an arch ring with depth: radii r0..r1 round (s,yc), from the wall (t0) out to t1; colours alternate when cB is given */
  function aring(F,s,yc,r0,r1,t0,t1,cA,cB,N,a0){
    a0=a0||0;
    for(var i=0;i<N;i++){
      var b0=a0+PI*i/N, b1=a0+PI*(i+1)/N, c0=Math.cos(b0), s0=Math.sin(b0), c1=Math.cos(b1), s1=Math.sin(b1),
          cm=Math.cos((b0+b1)/2), sm=Math.sin((b0+b1)/2), col=(cB&&i%2)?cB:cA;
      fq(F,t1,[[s+c0*r0,yc+s0*r0],[s+c0*r1,yc+s0*r1],[s+c1*r1,yc+s1*r1],[s+c1*r0,yc+s1*r0]],col,1);
      if(t1-t0<0.03) continue;
      var inw=[-F.sd[0]*cm,-sm,-F.sd[1]*cm];
      q3(F,[[s+c0*r0,yc+s0*r0,t0],[s+c0*r0,yc+s0*r0,t1],[s+c1*r0,yc+s1*r0,t1],[s+c1*r0,yc+s1*r0,t0]],col,0.72,inw);
      q3(F,[[s+c0*r1,yc+s0*r1,t0],[s+c0*r1,yc+s0*r1,t1],[s+c1*r1,yc+s1*r1,t1],[s+c1*r1,yc+s1*r1,t0]],col,0.86,[-inw[0],-inw[1],-inw[2]]);
    }
  }
  /* a round shaft (frustum) at a world point */
  function frust(x,z,r0,r1,y0,y1,col,n,sh,rot){
    var c=rgb(col,1), cd=rgb(col,sh===undefined?0.72:sh); rot=rot||0;
    for(var i=0;i<n;i++){ var a0=rot+2*PI*i/n, a1=rot+2*PI*(i+1)/n;
      M.quad([x+Math.cos(a0)*r0,y0,z+Math.sin(a0)*r0],[x+Math.cos(a0)*r1,y1,z+Math.sin(a0)*r1],
             [x+Math.cos(a1)*r1,y1,z+Math.sin(a1)*r1],[x+Math.cos(a1)*r0,y0,z+Math.sin(a1)*r0],cd,c,c,cd); }
    if(r1>0.025) for(i=0;i<n;i++){ var b0=rot+2*PI*i/n, b1=rot+2*PI*(i+1)/n;
      M.tri([x,y1,z],[x+Math.cos(b1)*r1,y1,z+Math.sin(b1)*r1],[x+Math.cos(b0)*r1,y1,z+Math.sin(b0)*r1],c,c,c); }
  }
  /* a sloping beam between two 3-D points (hip ridges, copings): top and two sides */
  function beam(a,b,w,h,col,sh){
    var dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2], L=Math.hypot(dx,dy,dz)||1; dx/=L; dy/=L; dz/=L;
    var px=-dz, pz=dx, pl=Math.hypot(px,pz)||1; px=px/pl*w/2; pz=pz/pl*w/2;
    var ux=-dy*dx, uy=dx*dx+dz*dz, uz=-dy*dz, ul=Math.hypot(ux,uy,uz)||1; ux=ux/ul*h; uy=uy/ul*h; uz=uz/ul*h;
    function V(p,sp,su){ return [p[0]+px*sp+ux*su, p[1]+uy*su, p[2]+pz*sp+uz*su]; }
    var c=rgb(col,1), cd=rgb(col,sh===undefined?0.75:sh);
    var A0=V(a,-1,0), A1=V(a,-1,1), A2=V(a,1,1), A3=V(a,1,0), B0=V(b,-1,0), B1=V(b,-1,1), B2=V(b,1,1), B3=V(b,1,0);
    function Q(p,q,r,t,cc){ var e=[q[0]-p[0],q[1]-p[1],q[2]-p[2]], f=[t[0]-p[0],t[1]-p[1],t[2]-p[2]];
      var n=[e[1]*f[2]-e[2]*f[1], e[2]*f[0]-e[0]*f[2], e[0]*f[1]-e[1]*f[0]];
      var m=[(p[0]+r[0])/2-(a[0]+b[0])/2-ux*0.5, (p[1]+r[1])/2-(a[1]+b[1])/2-uy*0.5, (p[2]+r[2])/2-(a[2]+b[2])/2-uz*0.5];
      if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0) M.quad(p,t,r,q,cc,cc,cc,cc); else M.quad(p,q,r,t,cc,cc,cc,cc); }
    Q(A1,B1,B2,A2,c); Q(A0,B0,B1,A1,cd); Q(A3,A2,B2,B3,cd);
  }
  function col8(F,s,t,y0,y1,r,col,sh){ var p=F.W(s,t); frust(p[0],p[1],r,r,y0,y1,col,8,sh,ROT8); }
  /* a twisted colonnette: short drums in alternating shades */
  function twist(F,s,t,y0,y1,r){
    var p=F.W(s,t), n=Math.max(3,Math.round((y1-y0)/0.24)), h=(y1-y0)/n;
    for(var k=0;k<n;k++) frust(p[0],p[1],r,r,y0+k*h,y0+(k+1)*h,k%2?CASTD:CASTL,6,k%2?0.8:0.95,ROT8+k*0.5);
  }

  /* ---- heights ---- */
  var FL=0.75,                 /* ground floor */
      EA=12.5, CA=11.35,       /* front range and the low blocks: eave, corbel table */
      EB=14.8, CB=13.7,        /* end ranges */
      ED=17.6, CD=16.45,       /* auditorium */
      TC=29.9, TE=31.8;        /* tower corbel table, top of the cornice */

  /* ================= massing ================= */
  var rA=R(-26,-13.5,-61.0,-9.3), rB=R(-55.1,-6.8,-9.25,3.9), rC=R(-54.9,-6.8,-74.55,-61.05),
      rE=R(-55.1,-26.05,-21.5,-9.3), rF=R(-54.9,-26.05,-61.0,-48.8), rD=R(-57.2,-26,-48.8,-21.5),
      rT=R(-22,-10.8,VC-5.6,VC+5.6);
  [[rA,EA],[rB,EB],[rC,EB],[rE,EA],[rF,EA],[rD,ED],[rT,TE]].forEach(function(q){
    prism(M,q[0],0,q[1],BRICK,BRICK,0.6);
    band(M,q[0],0,FL,0.14,CASTD,0.95,0.66,true);
    band(M,q[0],FL-0.1,FL+0.04,0.2,CAST,1,0.8,true);
  });
  cols.push([rA,EA+3],[rB,EB+4],[rC,EB+4],[rE,EA+3],[rF,EA+3],[rD,ED+6.5],[rT,TE+3.9]);
  /* corbel tables and cornices */
  [[rA,CA,EA],[rE,CA,EA],[rF,CA,EA],[rB,CB,EB],[rC,CB,EB],[rD,CD,ED]].forEach(function(q){
    lombardBand(M,q[0],q[1],CAST,BRICK,1.05);
    band(M,q[0],q[2]-0.45,q[2]-0.12,0.3,CAST,1,0.74,true);
    band(M,q[0],q[2]-0.12,q[2],0.42,CASTL,1,0.8,true);
  });

  /* ================= roofs ================= */
  function tileHip(r,y,rise,inset){
    var e=offsetRing(r,0.75); hipRoof(M,e,y,rise,inset,TILE);
    /* hip ridges in a darker tile */
    var hi=offsetRing(e,-safeInset(e,inset)), n=e.length, rr=Math.min(rise,safeInset(e,inset)*1.35);
    for(var i=0;i<n;i++){ var a=e[i], b=hi[i], c=hi[(i+1)%n];
      beam([a[0],y+0.02,a[1]],[b[0],y+rr+0.02,b[1]],0.26,0.12,TILED,0.8);
      beam([b[0],y+rr+0.02,b[1]],[c[0],y+rr+0.02,c[1]],0.3,0.14,TILED,0.8); }
  }
  tileHip(rA,EA,3.3,6.3); tileHip(rE,EA,3.0,6.1); tileHip(rF,EA,3.0,6.1);
  tileHip(rB,EB,4.0,7.2); tileHip(rC,EB,4.0,7.2);

  /* the auditorium: a gable roof along the grid, ridge at VC */
  (function(){
    var u0=-57.85, u1=-25.4, vA=-49.45, vB=-20.85, yr=ED+6.4, ct=rgb(TILE,1), cs=rgb(TILE,0.86), cu=rgb(TILED,0.45);
    function V(u,v,y){ var p=P(u,v); return [p[0],y,p[1]]; }
    [[vA,cs],[vB,ct]].forEach(function(q){
      var a=V(u0,q[0],ED), b=V(u1,q[0],ED), c=V(u1,VC,yr), d=V(u0,VC,yr);
      /* orient each slope to face up and out */
      var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=d[0]-a[0], vy=d[1]-a[1], vz=d[2]-a[2];
      var up=uz*vx-ux*vz>=0;
      if(up) M.quad(a,b,c,d,q[1],q[1],q[1],q[1]); else M.quad(a,d,c,b,q[1],q[1],q[1],q[1]);
      var a2=[a[0],a[1]-0.25,a[2]], b2=[b[0],b[1]-0.25,b[2]], c2=[c[0],c[1]-0.25,c[2]], d2=[d[0],d[1]-0.25,d[2]];
      if(up) M.quad(a2,d2,c2,b2,cu,cu,cu,cu); else M.quad(a2,b2,c2,d2,cu,cu,cu,cu);
      for(var k=0;k<22;k++){ var uu=u0+0.4+(u1-u0-0.8)*k/21, e0=P(uu,q[0]), e1=P(uu,VC);
        beam([e0[0],ED+0.01,e0[1]],[e1[0],yr+0.01,e1[1]],0.11,0.07,TILED,0.85); }
    });
    var r0=P(u0,VC), r1=P(u1,VC); beam([r0[0],yr-0.05,r0[1]],[r1[0],yr-0.05,r1[1]],0.36,0.26,TILED,0.85);
    /* gable walls with a cream coping */
    [[-57.2,-1],[-26,1]].forEach(function(q){
      var F=Fr(q[0],VC,0,1,q[1],0), hw=13.65;
      fq(F,0,[[-hw,ED],[hw,ED],[0,yr-0.1]],BRICK,1);
      var g0=F.W(-hw-0.6,0.1), g1=F.W(0,0.1), g2=F.W(hw+0.6,0.1);
      beam([g0[0],ED-0.2,g0[1]],[g1[0],yr+0.05,g1[1]],0.6,0.3,CAST,0.8);
      beam([g2[0],ED-0.2,g2[1]],[g1[0],yr+0.05,g1[1]],0.6,0.3,CAST,0.8);
      var k;
      /* corbels along the rakes */
      for(k=1;k<12;k++){ var ss=hw*k/12;
        [-1,1].forEach(function(sg){ fb(F,sg*ss-0.12,sg*ss+0.12,0,0.2,ED+(hw-ss)/hw*6.3-0.5,ED+(hw-ss)/hw*6.3-0.05,CAST,0.8); }); }
      /* the rose window */
      var yc=ED+2.1;
      for(k=0;k<16;k++){ var a0=2*PI*k/16, a1=2*PI*(k+1)/16;
        fq(F,0.03,[[0,yc],[Math.cos(a0)*1.55,yc+Math.sin(a0)*1.55],[Math.cos(a1)*1.55,yc+Math.sin(a1)*1.55]],k%2?GLASS:0x34414C,1); }
      aring(F,0,yc,1.55,2.0,0,0.18,CAST,CASTL,10,0); aring(F,0,yc,1.55,2.0,0,0.18,CAST,CASTL,10,PI);
      aring(F,0,yc,2.0,2.25,0,0.08,BRICKD,null,10,0); aring(F,0,yc,2.0,2.25,0,0.08,BRICKD,null,10,PI);
      for(k=0;k<8;k++){ var a=PI*k/8, ca=Math.cos(a)*1.55, sa=Math.sin(a)*1.55, px=-Math.sin(a)*0.05, py=Math.cos(a)*0.05;
        fq(F,0.06,[[-ca+px,yc-sa+py],[ca+px,yc+sa+py],[ca-px,yc+sa-py],[-ca-px,yc-sa-py]],CASTL,1); }
      aring(F,0,yc,0,0.32,0,0.08,CASTL,null,6,0); aring(F,0,yc,0,0.32,0,0.08,CASTL,null,6,PI);
    });
  })();

  /* the tower roof: a low tile pyramid */
  (function(){
    var e=offsetRing(rT,0.75), c=P(-16.4,VC), ap=[c[0],TE+3.9,c[1]], ct=rgb(TILE,1), cd=rgb(TILE,0.82), cu=rgb(TILED,0.45);
    for(var i=0;i<4;i++){ var a=e[i], b=e[(i+1)%4];
      M.tri([a[0],TE,a[1]],ap,[b[0],TE,b[1]],i%2?cd:ct,ct,i%2?cd:ct);
      M.quad([a[0],TE-0.22,a[1]],[a[0],TE,a[1]],[b[0],TE,b[1]],[b[0],TE-0.22,b[1]],cu,cu,cu,cu);
      beam([a[0],TE+0.02,a[1]],ap,0.26,0.13,TILED,0.8); }
    frust(c[0],c[1],0.22,0.16,TE+3.8,TE+4.2,TILED,6,0.8,0); frust(c[0],c[1],0.12,0.01,TE+4.2,TE+4.7,TILED,6,0.8,0);
  })();

  /* ================= window kinds ================= */
  /* ground storey round arch in brick: a wood door or a window */
  function gArch(F,c,door,w,sp){
    w=w||2.0; sp=sp||2.75; var r=w/2;
    aring(F,c,sp,r,r+0.32,0,0.09,BRICKD,0x9C4E3E,9);
    fa(F,c,0.02,FL,w,sp-FL,r,DARK,1);
    if(door){
      fr(F,c-r+0.12,c+r-0.12,FL,sp-0.12,0.04,WOOD);
      [-1,1].forEach(function(sg){ var q=sg*(r-0.12)/2, pw=(r-0.12)/2-0.1;
        fr(F,c+q-pw,c+q+pw,FL+0.25,FL+1.15,0.05,WOODL); fr(F,c+q-pw,c+q+pw,FL+1.35,sp-0.4,0.05,WOODL); });
      fr(F,c-0.025,c+0.025,FL,sp-0.12,0.055,DARK);
      fa(F,c,0.04,sp-0.1,w-0.24,0.01,r-0.12,0x3A4550,1);
      fr(F,c-r+0.12,c+r-0.12,sp-0.16,sp-0.1,0.05,FRAME);
    } else {
      fr(F,c-r+0.1,c+r-0.1,FL,1.38,0.03,BRICK,0.9);
      fa(F,c,0.04,1.5,w-0.2,sp-1.5,r-0.1,GLASS,1);
      [-0.36,0,0.36].forEach(function(o){ fr(F,c+o*w/2.2-0.025,c+o*w/2.2+0.025,1.5,sp+Math.sqrt(Math.max(0,1-o*o))*(r-0.12),0.05,FRAME); });
      [2.25,sp].forEach(function(y){ fr(F,c-r+0.1,c+r-0.1,y-0.025,y+0.025,0.05,FRAME); });
      fb(F,c-r-0.12,c+r+0.12,0,0.14,1.34,1.5,CAST,0.8);
    }
  }
  /* a pair of round headed lights in one cream surround with a colonnette */
  function pair2(F,c,t,y0,sc){
    sc=sc||1; var lw=0.78*sc, o=0.52*sc, hs=1.35*sc, y1=y0+hs;
    fr(F,c-o-0.6*sc,c+o+0.6*sc,y0-0.12,y1,t+0.03,CAST);
    [-o,o].forEach(function(q){
      fa(F,c+q,t+0.03,y1-0.01,lw+0.3*sc,0.01,(lw+0.3*sc)/2,CAST);
      fa(F,c+q,t+0.05,y0,lw,hs,lw/2,GLASS);
      fr(F,c+q-0.02,c+q+0.02,y0,y1+lw/2-0.02,t+0.06,FRAME);
      fr(F,c+q-lw/2,c+q+lw/2,y0+hs*0.62,y0+hs*0.62+0.04,t+0.06,FRAME); });
    fb(F,c-0.07,c+0.07,t,t+0.13,y0,y1-0.1,CASTL,0.8);
    fb(F,c-0.13,c+0.13,t,t+0.17,y1-0.12,y1+0.03,CASTL,0.8);
    fb(F,c-o-0.72*sc,c+o+0.72*sc,t,t+0.16,y0-0.32,y0-0.12,CASTL,0.8);
  }
  /* a pair of small arched lights (the front range's top storey) */
  function pair3(F,c,t,y0){
    [-0.42,0.42].forEach(function(q){
      aring(F,c+q,y0+0.9,0.31,0.44,t,t+0.07,CAST,null,6);
      fa(F,c+q,t+0.03,y0,0.62,0.9,0.31,GLASS);
      fr(F,c+q-0.02,c+q+0.02,y0,y0+1.18,t+0.04,FRAME); });
    fb(F,c-0.07,c+0.07,t,t+0.12,y0,y0+0.9,CASTL,0.8);
    fb(F,c-0.13,c+0.13,t,t+0.16,y0+0.82,y0+0.96,CASTL,0.8);
    [-0.86,0.86].forEach(function(q){ fb(F,c+q-0.06,c+q+0.06,t,t+0.07,y0,y0+0.9,CAST,0.8); });
  }
  /* a square headed window in a cream surround */
  function rectW(F,c,y0,y1,w){
    fr(F,c-w/2-0.17,c+w/2+0.17,y0-0.17,y1+0.17,0.03,CAST);
    fr(F,c-w/2,c+w/2,y0,y1,0.05,GLASS);
    fr(F,c-0.025,c+0.025,y0,y1,0.06,FRAME);
    fr(F,c-w/2,c+w/2,y0+(y1-y0)*0.55,y0+(y1-y0)*0.55+0.05,0.06,FRAME);
    fb(F,c-w/2-0.3,c+w/2+0.3,0,0.14,y0-0.34,y0-0.15,CASTL,0.8);
    fb(F,c-w/2-0.24,c+w/2+0.24,0,0.1,y1+0.17,y1+0.32,CAST,0.8);
  }
  /* a run of arched windows on colonnettes, cream archivolts */
  function arcadeRun(F,s0,s1,y0,sp,pitch){
    var n=Math.max(1,Math.round((s1-s0)/pitch)), p=(s1-s0)/n, w=p*0.66, r=w/2, k;
    fb(F,s0-0.2,s1+0.2,0,0.15,y0-0.22,y0,CASTL,0.8);
    for(k=0;k<n;k++){ var c=s0+(k+0.5)*p;
      fa(F,c,0.03,y0,w,sp-y0,r,GLASS);
      aring(F,c,sp,r,r+0.16,0,0.08,CAST,null,7);
      fr(F,c-0.02,c+0.02,y0,sp+r-0.04,0.05,FRAME);
      fr(F,c-r,c+r,y0+(sp-y0)*0.6,y0+(sp-y0)*0.6+0.04,0.05,FRAME); }
    for(k=0;k<=n;k++){ var s=s0+k*p;
      col8(F,s,0.1,y0,sp-0.14,0.09,CASTL,0.8);
      fb(F,s-0.15,s+0.15,0,0.24,sp-0.16,sp+0.02,CASTL,0.8); }
  }

  /* ================= the front range (grid east face) ================= */
  var FA=Fr(-13.5,VC,0,-1,1,0);          /* s grid north from the tower axis */
  (function(){
    var F=FA;
    [[5.6,25.75],[-25.95,-5.6]].forEach(function(r,j){
      var L=r[1]-r[0], n=5, p=L/n;
      fb(F,r[0],r[1],0,0.07,4.9,5.12,CAST,0.8);                      /* belt */
      fb(F,r[0],r[1],0,0.1,8.75,8.9,CASTL,0.8);                       /* sill of the top storey */
      for(var k=0;k<n;k++){ var c=r[0]+(k+0.5)*p, near=j?(k===n-1):(k===0);
        gArch(F,c,near||k===2);
        pair2(F,c,0,5.75);
        pair3(F,c,0,9.05);
      }
    });
  })();

  /* ================= the end ranges ================= */
  /* long side: square windows on two floors, the arcade on top */
  function sideFace(F,L,skip0,skip1){
    skip0=skip0||0; skip1=skip1||L;
    fb(F,skip0,skip1,0,0.07,4.55,4.78,CAST,0.8);
    var n=Math.max(1,Math.floor((skip1-skip0-1.5)/3.25)), p=(skip1-skip0)/n, k;
    for(k=0;k<n;k++){ var c=skip0+(k+0.5)*p; rectW(F,c,1.55,3.75,1.3); rectW(F,c,5.6,8.1,1.3); }
    var gw2=11.0, gap=1.5, ng=Math.max(1,Math.floor((skip1-skip0-1.6+gap)/(gw2+gap)));
    var tot=ng*gw2+(ng-1)*gap, st=skip0+(skip1-skip0-tot)/2;
    for(k=0;k<ng;k++) arcadeRun(F,st+k*(gw2+gap),st+k*(gw2+gap)+gw2,9.45,12.05,1.84);
  }
  /* pavilion front: three bays of ground arches, paired windows, arcade pairs */
  function pavilion(F,L){
    var m=L/2;
    fb(F,0,L,0,0.07,4.55,4.78,CAST,0.8);
    [m-4.15,m,m+4.15].forEach(function(c,i){
      if(i===1) gArch(F,c,1,2.6,3.1); else gArch(F,c,0,2.0,2.75);
      pair2(F,c,0,5.75,1.12);
      arcadeRun(F,c-1.45,c+1.45,9.45,12.05,1.45);
    });
    /* pilaster strips at the corners */
    [0.32,L-0.32].forEach(function(s){ fb(F,s-0.32,s+0.32,0,0.12,FL,CB-0.3,BRICKL,0.7); });
  }
  /* south range */
  sideFace(Fr(-55.1,3.9,1,0,0,1),48.3);
  pavilion(Fr(-6.8,3.9,0,-1,1,0),13.15);
  sideFace(Fr(-55.1,-9.25,0,1,-1,0),13.15);
  (function(){ var F=Fr(-13.5,-9.25,1,0,0,-1); gArch(F,3.35,0); pair2(F,3.35,0,5.75); arcadeRun(F,2.0,4.7,9.45,12.05,1.35); })();
  /* north range */
  sideFace(Fr(-54.9,-74.55,1,0,0,-1),48.1);
  pavilion(Fr(-6.8,-61.05,0,-1,1,0),13.5);
  sideFace(Fr(-54.9,-74.55,0,1,-1,0),13.5);
  (function(){ var F=Fr(-13.5,-61.05,1,0,0,1); gArch(F,3.35,0); pair2(F,3.35,0,5.75); arcadeRun(F,2.0,4.7,9.45,12.05,1.35); })();
  /* the low blocks: west faces */
  [[-55.1,-21.5,12.2],[-54.9,-61.0,12.2]].forEach(function(q){
    var F=Fr(q[0],q[1],0,1,-1,0), n=4, p=q[2]/n;
    for(var k=0;k<n;k++){ var c=(k+0.5)*p; rectW(F,c,1.55,3.75,1.2); rectW(F,c,5.6,8.1,1.2); pair3(F,c,0,9.05); }
  });

  /* ================= the auditorium walls ================= */
  (function(){
    /* clerestory over the low blocks, north and south */
    [[-26,-48.8,-1],[-26,-21.5,1]].forEach(function(q){
      var F=Fr(q[0],q[1],-1,0,0,q[2]);
      for(var k=0;k<6;k++){ var c=2.7+k*5.15;
        fa(F,c,0.03,EA+0.55,2.1,1.85,1.05,CAST); fa(F,c,0.05,EA+0.7,1.7,1.7,0.85,GLASS);
        fr(F,c-0.02,c+0.02,EA+0.7,EA+3.2,0.06,FRAME); fb(F,c-1.2,c+1.2,0,0.14,EA+0.4,EA+0.58,CASTL,0.8); }
    });
    /* the west (stage) end */
    var F=Fr(-57.2,VC,0,1,-1,0);
    [-9.5,9.5].forEach(function(c){ fr(F,c-1.5,c+1.5,0,4.2,0.03,CAST); fr(F,c-1.25,c+1.25,0.05,4.0,0.05,WOOD);
      fr(F,c-0.03,c+0.03,0.05,4.0,0.06,DARK); fb(F,c-1.7,c+1.7,0,0.25,4.2,4.5,CASTL,0.8); });
    [-5.2,0,5.2].forEach(function(c){ fa(F,c,0.03,6.3,2.3,5.2,1.15,CAST); fa(F,c,0.05,6.45,1.9,5.05,0.95,GLASS);
      fr(F,c-0.02,c+0.02,6.45,12.4,0.06,FRAME); [8.3,10.3].forEach(function(y){ fr(F,c-0.95,c+0.95,y,y+0.04,0.06,FRAME); });
      fb(F,c-1.35,c+1.35,0,0.15,6.1,6.3,CASTL,0.8); });
    fb(F,-13.65,13.65,0,0.07,4.55,4.78,CAST,0.8);
  })();

  /* ================= the tower ================= */
  var TF=[Fr(-10.8,VC,0,-1,1,0), Fr(-16.4,VC-5.6,1,0,0,-1), Fr(-16.4,VC+5.6,-1,0,0,1), Fr(-22,VC,0,1,-1,0)];
  /* the seal: a textured disc */
  function seal(F,s,y,t,r){
    for(var k=0;k<16;k++){ var a0=2*PI*k/16, a1=2*PI*(k+1)/16;
      var pa=[[s,y],[s+Math.cos(a0)*r,y+Math.sin(a0)*r],[s+Math.cos(a1)*r,y+Math.sin(a1)*r]],
          ua=[[0.5,0.5],[0.5+Math.cos(a0)*0.5,0.5+Math.sin(a0)*0.5],[0.5+Math.cos(a1)*0.5,0.5+Math.sin(a1)*0.5]];
      for(var j=0;j<3;j++){ var p=F.W(pa[j][0],t); TQP.push(p[0],pa[j][1],p[1]); TQU.push(ua[j][0],ua[j][1]); } }
  }
  /* a robed statue standing on a bracket */
  function statue(F,s,t,y,k){
    var p=F.W(s,t), x=p[0], z=p[1], nx=F.n[0], nz=F.n[1], sx=F.sd[0], sz=F.sd[1];
    frust(x,z,0.41,0.37,y,y+0.25,STAT,10,0.85,ROT8);
    frust(x,z,0.37,0.27,y+0.25,y+1.62,STAT,10,0.86,ROT8);
    frust(x,z,0.27,0.3,y+1.62,y+2.06,STAT,10,0.9,ROT8);
    frust(x,z,0.32,0.13,y+2.06,y+2.22,STAT,10,0.92,ROT8);
    frust(x,z,0.08,0.08,y+2.22,y+2.28,STAT,6,0.9,0);
    frust(x+nx*0.02,z+nz*0.02,0.14,0.15,y+2.28,y+2.48,STAT,8,0.92,0);
    frust(x+nx*0.02,z+nz*0.02,0.15,0.05,y+2.48,y+2.62,STAT,8,0.95,0);
    if(k%3===1){ /* a raised arm */
      var ax=x+sx*0.3+nx*0.08, az=z+sz*0.3+nz*0.08;
      segBox(M,[ax,az],[ax+sx*0.02,az+sz*0.02],y+1.7,y+2.75,0.1,STAT,0.75);
    } else {   /* a book or scroll held in front */
      segBox(M,[x+nx*0.24-sx*0.15,z+nz*0.24-sz*0.15],[x+nx*0.24+sx*0.15,z+nz*0.24+sz*0.15],y+1.2,y+1.45,0.12,STAT,0.8);
      segBox(M,[x+nx*0.18-sx*0.27,z+nz*0.18-sz*0.27],[x+nx*0.24-sx*0.05,z+nz*0.24-sz*0.05],y+1.3,y+1.42,0.11,STAT,0.78);
    }
  }
  var YW=17.55, YB=26.65, YS=YB+2.0;   /* big window sill, belfry sill, belfry springing */
  TF.forEach(function(F,fi){
    /* engaged shafts near the corners, capitals, brackets and the statues on them */
    [-4.0,4.0].forEach(function(s,j){
      col8(F,s,0.18,0,FL+0.55,0.56,CASTD,0.7);
      col8(F,s,0.18,FL+0.55,YB-0.7,0.42,BRICKL,0.62);
      for(var y=3.2;y<YB-1.5;y+=3.4) col8(F,s,0.18,y,y+0.16,0.44,CAST,0.8);
      var p=F.W(s,0.18); frust(p[0],p[1],0.43,0.58,YB-0.7,YB-0.3,CAST,8,0.8,ROT8);
      fb(F,s-0.52,s+0.52,-0.2,0.72,YB-0.3,YB-0.05,CASTL,0.8);
      fb(F,s-0.36,s+0.36,0,0.58,YB-0.6,YB-0.3,CAST,0.75);
      statue(F,s,0.26,YB-0.05,fi*2+j);
    });
    /* the tall window in a cast stone frame, the seal in its tympanum */
    var ys=YW+3.75, ya=ys+0.9;           /* lights spring, frame spring */
    fb(F,-2.85,2.85,0,0.26,YW-0.3,YW,CASTL,0.8);
    fr(F,-2.05,2.05,YW,ys,0.03,CAST);
    fa(F,0,0.03,ys-0.01,4.1,0.92,2.05,CAST);
    [-2.27,2.27].forEach(function(s){ fb(F,s-0.22,s+0.22,0,0.22,YW,ya,CAST,0.75); });
    aring(F,0,ya,2.05,2.5,0,0.22,CAST,CASTL,13);
    aring(F,0,ya,1.86,2.05,0,0.1,CASTD,null,13);
    aring(F,0,ya,2.5,2.8,0,0.08,BRICKD,null,13);
    [-0.97,0.97].forEach(function(s){
      fa(F,s,0.06,YW+0.15,1.26,ys-YW-0.15,0.63,GLASS);
      fr(F,s-0.02,s+0.02,YW+0.15,ys+0.6,0.07,FRAME);
      for(var y=YW+0.85;y<ys;y+=0.72) fr(F,s-0.63,s+0.63,y,y+0.035,0.07,FRAME);
      aring(F,s,ys,0.63,0.76,0,0.1,CASTL,null,6); });
    [-1.86,0,1.86].forEach(function(s){ col8(F,s,0.11,YW+0.15,ys-0.2,s?0.12:0.15,CASTL,0.8);
      fb(F,s-0.2,s+0.2,0,0.3,ys-0.22,ys+0.02,CASTL,0.8); fb(F,s-0.18,s+0.18,0,0.28,YW,YW+0.25,CAST,0.8); });
    aring(F,0,ya+1.1,0.66,0.8,0,0.1,CASTD,null,8,0); aring(F,0,ya+1.1,0.66,0.8,0,0.1,CASTD,null,8,PI);
    seal(F,0,ya+1.1,0.08,0.66);
    /* the belfry: five arches on twisted colonnettes */
    fb(F,-3.4,3.4,0,0.32,YB-0.35,YB,CASTL,0.8);
    for(var k=0;k<5;k++){ var c=-2.6+k*1.3;
      fa(F,c,0.02,YB,1.0,YS-YB,0.5,DARK);
      fr(F,c-0.5,c+0.5,YB,YB+0.5,0.03,0x2B2522);
      aring(F,c,YS,0.5,0.66,0,0.13,CAST,null,6);
      aring(F,c,YS,0.66,0.8,0,0.06,BRICKD,null,6); }
    for(k=0;k<6;k++){ var cs=-3.25+k*1.3;
      twist(F,cs,0.16,YB,YS-0.22,0.12);
      fb(F,cs-0.2,cs+0.2,0,0.34,YS-0.22,YS+0.02,CASTL,0.8); }
    /* a cream string course under the belfry */
    fb(F,-5.6,5.6,0,0.06,YB-0.5,YB-0.35,CAST,0.8);
    /* modillions under the cornice */
    for(var m=-5.45;m<=5.46;m+=0.545) fb(F,m-0.1,m+0.1,0,0.42,TC+0.82,TC+1.18,CASTL,0.78);
  });
  lombardBand(M,rT,TC,CAST,BRICK,0.86);
  band(M,rT,TC+0.72,TC+0.82,0.12,CAST,1,0.75,true);
  band(M,rT,TC+1.18,TC+1.55,0.48,CAST,1,0.74,true);
  band(M,rT,TC+1.55,TE,0.62,CASTL,1,0.8,true);

  /* ---- the tower front ---- */
  var FT=TF[0];
  (function(){
    var F=FT, SP=3.25;
    /* the portal: four orders stepping out, colonnettes, carved rings */
    var OR=[[1.6,2.05,0.22],[2.05,2.5,0.42],[2.5,2.95,0.62],[2.95,3.4,0.82]];
    OR.forEach(function(o,k){
      [-1,1].forEach(function(sg){
        fb(F,sg>0?o[0]:-o[1],sg>0?o[1]:-o[0],0,o[2],0,SP,k%2?CAST:CASTL,0.72);
        col8(F,sg*(o[0]+0.15),o[2]-0.08,FL+0.3,SP-0.3,0.13,CASTL,0.82);
        fb(F,sg*(o[0]+0.15)-0.2,sg*(o[0]+0.15)+0.2,o[2]-0.28,o[2]+0.08,SP-0.32,SP,CASTL,0.8);
        fb(F,sg*(o[0]+0.15)-0.19,sg*(o[0]+0.15)+0.19,o[2]-0.27,o[2]+0.07,FL,FL+0.3,CAST,0.75);
      });
      aring(F,0,SP,o[0],o[1],0,o[2],k%2?CAST:CASTL,k%2?CASTD:CAST,k===3?18:14);
    });
    aring(F,0,SP,3.4,3.56,0,0.9,CASTL,null,18);
    fb(F,-3.56,3.56,0,0.9,0,FL,CASTD,0.7);
    /* the doors: dark wood under the arch */
    fa(F,0,0.02,FL,3.2,SP-FL,1.6,WOOD);
    fr(F,-0.03,0.03,FL,SP+1.5,0.03,DARK);
    [-0.78,0.78].forEach(function(q){
      fr(F,q-0.6,q+0.6,FL+0.3,FL+1.3,0.035,WOODL); fr(F,q-0.6,q+0.6,FL+1.5,SP-0.2,0.035,WOODL); });
    fr(F,-1.6,1.6,SP-0.08,SP,0.03,DARK);
    /* the bronze plaque */
    fr(F,-2.4,2.4,7.3,8.7,0.04,0x3A2E22); fr(F,-2.3,2.3,7.38,8.62,0.05,BRONZE);
    var tp=F.W(0,0.06);
    facadeText('GEORGE  ·  FINLEY  ·  BOVARD',tp[0],tp[1],F.n[0],F.n[1],8.38,4.2,0.36,'#D7C38C');
    facadeText('ADMINISTRATION  ·  AUDITORIUM',tp[0],tp[1],F.n[0],F.n[1],8.0,4.2,0.34,'#D7C38C');
    facadeText('UNIVERSITY OF SOUTHERN CALIFORNIA',tp[0],tp[1],F.n[0],F.n[1],7.62,4.3,0.32,'#D7C38C');
    /* a pair of round arched lights under a brick relieving arch */
    fb(F,-2.35,2.35,0,0.16,9.42,9.66,CASTL,0.8);
    [-0.74,0.74].forEach(function(s){
      fa(F,s,0.04,9.66,1.12,3.1,0.56,GLASS);
      fr(F,s-0.02,s+0.02,9.66,13.3,0.05,FRAME);
      for(var y=10.3;y<12.7;y+=0.62) fr(F,s-0.56,s+0.56,y,y+0.035,0.05,FRAME);
      aring(F,s,12.76,0.56,0.76,0,0.07,BRICKD,null,7); });
    col8(F,0,0.1,9.66,12.6,0.13,CASTL,0.8);
    fb(F,-0.2,0.2,0,0.28,12.55,12.8,CASTL,0.8);
    aring(F,0,12.76,1.52,1.88,0,0.1,BRICKD,0x9E5040,13);
    aring(F,0,12.76,1.88,2.06,0,0.05,BRICKD,null,13);
    /* the landing in the portal and the steps down to the forecourt */
    var YF=0.14, NR=4, RI=(FL-YF)/NR, S0=-4.4, S1=4.4, TL=1.6, TR=0.42;
    fb(F,-1.6,1.6,0,TL,0,FL,CASTD,0.6); solid(F,-1.6,1.6,0,TL,FL);
    fb(F,S0,S1,0.9,TL,0,FL,CAST,0.62); solid(F,S0,S1,0.9,TL,FL);
    for(var k=1;k<=NR;k++){ var yk=FL-RI*k, t0=TL+(k-1)*TR, t1=t0+TR;
      if(k===NR) break;
      fb(F,S0,S1,t0,t1,0,yk,CAST,0.6); fb(F,S0,S1,t1-0.04,t1,yk-0.02,yk,CASTD,0.7); solid(F,S0,S1,t0,t1,yk); }
    /* cheek blocks with the lamps */
    var TE2=TL+(NR-1)*TR;
    [[S0-0.85,S0],[S1,S1+0.85]].forEach(function(r){
      fb(F,r[0],r[1],0,TE2,0,FL+0.12,CAST,0.62); fb(F,r[0]-0.05,r[1]+0.05,-0.05,TE2+0.05,FL+0.12,FL+0.2,CASTL,0.8);
      solid(F,r[0],r[1],0,TE2,FL+0.2);
      var p=F.W((r[0]+r[1])/2,TE2-0.45); lamp(p[0],p[1],FL+0.2); });
    /* the jambs of the portal are solid */
    solid(F,-3.56,-1.6,0,0.9,8); solid(F,1.6,3.56,0,0.9,8);
  })();

  /* ================= lamps, forecourt, hedges, topiary, trees ================= */
  function lamp(x,z,y){
    frust(x,z,0.17,0.13,y,y+0.45,IRON,8,0.7,0);
    frust(x,z,0.075,0.06,y+0.45,y+3.1,IRON,8,0.72,0);
    frust(x,z,0.11,0.11,y+3.1,y+3.22,IRON,6,0.75,0);
    frust(x,z,0.15,0.2,y+3.22,y+3.3,IRON,4,0.75,PI/4+ROT8-PI/8);
    frust(x,z,0.16,0.19,y+3.3,y+3.85,LIT,4,0.95,PI/4+ROT8-PI/8);
    frust(x,z,0.22,0.22,y+3.85,y+3.93,IRON,4,0.75,PI/4+ROT8-PI/8);
    frust(x,z,0.22,0.02,y+3.93,y+4.2,IRON,4,0.75,PI/4+ROT8-PI/8);
    cols.push([ccw(ngon(x,z,0.25,6,0)),y+3.5]);
  }
  /* the forecourt: pale panels framed by red brick bands, on the tower axis */
  var UA=-7.95, UB=10.3, SW=6.8;
  (function(){
    function gq(u0,u1,s0,s1,y,col){ var c=rgb(col,1), a=P(u0,VC+s0), b=P(u1,VC+s0), cc=P(u1,VC+s1), d=P(u0,VC+s1);
      var q=ccw([a,b,cc,d]); MG.quad([q[0][0],y,q[0][1]],[q[3][0],y,q[3][1]],[q[2][0],y,q[2][1]],[q[1][0],y,q[1][1]],c,c,c,c); }
    /* pale field in pieces, then the bands on top */
    for(var u=UA;u<UB-0.01;u+=3){ var u1=Math.min(UB,u+3); gq(u,u1,-SW,SW,0.140,PAVE); }
    [[-SW,-SW+0.6],[SW-0.6,SW],[-3.6,-2.6],[2.6,3.6]].forEach(function(r){
      for(var u=UA;u<UB-0.01;u+=3) gq(u,Math.min(UB,u+3),r[0],r[1],0.146,PBR); });
    /* thin cross courses, a broad band at each end and one across the middle */
    for(var k=1;k*2.2+UA<UB-1.2;k++){ var uc=UA+k*2.2; gq(uc-0.1,uc+0.1,-SW,SW,0.145,PBRD); }
    gq(UA,UA+0.55,-SW,SW,0.147,PBR); gq(UB-1.0,UB,-SW,SW,0.147,PBR);
    var um=UA+Math.round((UB-UA)/2/2.2)*2.2; gq(um-0.5,um+0.5,-SW,SW,0.147,PBR);
  })();
  /* clipped hedges along both sides, topiary cones by the steps */
  [-1,1].forEach(function(sg){
    var s0=sg*(SW+0.25), s1=sg*(SW+1.55), v0=VC+Math.min(s0,s1), v1=VC+Math.max(s0,s1);
    [[-12.9,-1.4],[-0.6,8.9]].forEach(function(r){
      box(M,r[0],r[1],v0,v1,0,1.0,HEDGE,0.6); box(M,r[0]+0.08,r[1]-0.08,v0+0.08,v1-0.08,1.0,1.18,HEDGEL,0.85);
      cols.push([R(r[0],r[1],v0,v1),1.2]); });
    var c=P(-11.55,VC+sg*6.2);
    box(M,-12.1,-11.0,VC+sg*6.2-0.55,VC+sg*6.2+0.55,0,0.42,CAST,0.7);
    frust(c[0],c[1],0.5,0.02,0.42,2.35,HEDGE,8,0.68,ROT8);
    frust(c[0],c[1],0.56,0.5,0.42,0.6,HEDGEL,8,0.7,ROT8);
    cols.push([R(-12.1,-11.0,VC+sg*6.2-0.55,VC+sg*6.2+0.55),1.6]);
  });
  /* the front lawns: magnolias and sycamores (TREE_POS: x,z,kind,species,scale) */
  (function(){
    var keep=offsetRing(B.ring,2.5), i, t;
    for(i=TREE_POS.length-1;i>=0;i--){ t=TREE_POS[i];
      if(inRing(keep,t[0],t[1])||inRing(BOVARD.lawn,t[0],t[1])) TREE_POS.splice(i,1); }
    [[7.2,13.6,'mag',1.45],[7.4,-13.2,'syc',1.5],[-3.4,15.2,'mag',1.25],[-3.0,-15.6,'mag',1.3],
     [1.6,-24.0,'syc',1.25],[2.2,22.6,'mag',1.2],[2.5,-33.5,'mag',1.3],[-1.5,-39.0,'syc',1.2]].forEach(function(q){
      var p=P(q[0],VC+q[1]); TREE_POS.push([p[0],p[1],0,q[2],q[3]]); });
  })();

  /* ================= the seal texture ================= */
  (function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=128;
    var g=cv.getContext('2d');
    g.fillStyle='#E3D6B8'; g.fillRect(0,0,128,128);
    g.fillStyle='#2F3A33'; g.beginPath(); g.arc(64,64,63,0,6.283); g.fill();
    g.strokeStyle='#C9B477'; g.lineWidth=4; g.beginPath(); g.arc(64,64,58,0,6.283); g.stroke();
    g.lineWidth=2; g.beginPath(); g.arc(64,64,42,0,6.283); g.stroke();
    g.fillStyle='#C9B477'; g.font='bold 11px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle';
    var txt='UNIVERSITY OF SOUTHERN CALIFORNIA · 1880 ·';
    for(var i=0;i<txt.length;i++){ var a=-PI/2+(i/txt.length)*2*PI;
      g.save(); g.translate(64+Math.cos(a)*50,64+Math.sin(a)*50); g.rotate(a+PI/2); g.fillText(txt[i],0,0); g.restore(); }
    /* three torches and an open book */
    g.fillStyle='#C9B477';
    [-16,0,16].forEach(function(o){ g.fillRect(62+o,48,4,32); g.beginPath(); g.moveTo(64+o,34); g.quadraticCurveTo(72+o,44,64+o,50); g.quadraticCurveTo(56+o,44,64+o,34); g.fill(); });
    g.fillRect(44,84,40,8);
    var tex=new T.CanvasTexture(cv); tex.anisotropy=4;
    var gg=new T.BufferGeometry();
    gg.setAttribute('position',new T.Float32BufferAttribute(TQP,3));
    gg.setAttribute('uv',new T.Float32BufferAttribute(TQU,2));
    gg.computeVertexNormals(); gg.computeBoundingSphere();
    var m=new T.Mesh(gg,new T.MeshLambertMaterial({map:tex,side:T.DoubleSide}));
    m.frustumCulled=false; m.userData.noShadow=true; m.raycast=function(){}; scene.add(m);
  })();

  B.h=EB+4;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__bovard={tris:M.count(),ground:MG.count()};
})();
