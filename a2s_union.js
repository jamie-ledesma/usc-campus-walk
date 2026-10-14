/* ==================================================================
   The Gwynn Wilson Student Union (1927-28, John and Donald Parkinson),
   3601 Trousdale Parkway. a_world.js leaves the footprint empty
   (HAND_HALLS).

   A square Italian Romanesque palazzo of red brick and cream cast
   stone. Its main front faces east onto Trousdale and Hahn Plaza (the
   plaza fountain in front); the north front faces the walk and the
   Tutor Campus Center apron; the west side is the TCC courtyard,
   where a2r_tcc.js lays the seating terraces.
   East and north fronts: a ground storey of round arched windows in
   cast stone banded with brick, basement lights in the plinth, a
   corbel table and string course, paired windows in cast stone
   surrounds on the second floor, a band of brick diaper panels, paired
   round headed windows on the third, the main corbel table and
   cornice, an attic of small square lights, a low red tile hip roof
   with finials, corner pavilions with pilasters, and a centre bay:
   the arched east entrance with steps, a traceried balcony and a
   carved panel. The courtyard side is plainer brick with cast stone
   trimmed windows, the tall chimney stack by the north west pavilion
   and the arched doorway (pierced tympanum, carved jambs, voussoirs
   alternating cream and brick, STUDENT UNION on the lintel, lanterns,
   bronze letters) up a cast stone stair between cheek walls, with
   fluted lamp posts. The south side is plain brick with a pavilion at
   the Trousdale corner. A light court sits in the roof.
   Footprint from OpenStreetMap (relation 6095474, outer way
   406923992; inner court way 406923856), shifted like its neighbours.
   Frame: TCC.P(u,v), the Hahn grid (u east, v south).
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Student Union') B=CAMPUS[bi];
  if(!B||!TCC) return;
  var P=TCC.P;
  var M=new Mesher(), cols=[], TQP=[], TQU=[];
  var du=[0.8829,0.4695], dv=[-0.4695,0.8829];
  var BRICK=0xAE5C3E, BRICKD=0x8A432E, CAST=0xE2D4B2, CASTL=0xEDE3CB, CASTD=0xC6B694,
      GLASS=0x2F3B44, GLASSL=0x4A5C68, FRAME=0x2B2722, WOOD=0x4B3324, WOODL=0x6A4A34,
      TILE=0xA8573A, TILED=0x7B3926, LIT=0xF2DFA8, BRONZE=0x6B5236, POST=0xCBC5B6;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function gvec(a,b){ return [du[0]*a+dv[0]*b, du[1]*a+dv[1]*b]; }
  /* the outline (grid corners, matching world.txt) */
  var NW=[-27.86,30.67], NE=[9.26,30.19], SE=[9.74,67.3], SW=[-26.96,66.4];
  var ring=ccw([P(NW[0],NW[1]),P(NE[0],NE[1]),P(SE[0],SE[1]),P(SW[0],SW[1])]);
  /* a wall frame: s from grid point A to B, t out of the wall (toward the grid direction out) */
  function Frame(A,Bq,out){
    var o=P(A[0],A[1]), e=P(Bq[0],Bq[1]), L=Math.hypot(e[0]-o[0],e[1]-o[1]);
    var d=[(e[0]-o[0])/L,(e[1]-o[1])/L], h=gvec(out[0],out[1]);
    var n=[-d[1],d[0]]; if(n[0]*h[0]+n[1]*h[1]<0) n=[d[1],-d[0]];
    return {o:o,d:d,n:n,L:L,W:function(s,t){ return [o[0]+d[0]*s+n[0]*t, o[1]+d[1]*s+n[1]*t]; }};
  }
  var FN=Frame(NW,NE,[0,-1]), FE=Frame(NE,SE,[1,0]), FS=Frame(SE,SW,[0,1]), FW=Frame(NW,SW,[-1,0]);

  /* ---- drawing helpers in a frame ---- */
  function fq(F,t,pts,col,sh){
    var c=rgb(col,sh===undefined?1:sh), w=pts.map(function(q){ var p=F.W(q[0],t); return [p[0],q[1],p[1]]; });
    var ux=w[1][0]-w[0][0], uy=w[1][1]-w[0][1], uz=w[1][2]-w[0][2], vx=w[2][0]-w[0][0], vy=w[2][1]-w[0][1], vz=w[2][2]-w[0][2];
    var nx=uy*vz-uz*vy, nz=ux*vy-uy*vx;
    if(nx*F.n[0]+nz*F.n[1]<0) w.reverse();
    if(w.length===3) M.tri(w[0],w[1],w[2],c,c,c); else M.quad(w[0],w[1],w[2],w[3],c,c,c,c);
  }
  function fr(F,s0,s1,y0,y1,t,col,sh){ fq(F,t,[[s0,y0],[s1,y0],[s1,y1],[s0,y1]],col,sh); }
  function fa(F,s,t,y0,w,hs,ha,col,sh){ var p=F.W(s,t); archFace(M,p[0],p[1],-F.n[1],F.n[0],0,0,y0,w,hs,ha,col,sh===undefined?1:sh); }
  function fb(F,s0,s1,t0,t1,y0,y1,col,sh){
    var r=ccw([F.W(s0,t0),F.W(s1,t0),F.W(s1,t1),F.W(s0,t1)]); prism(M,r,y0,y1,col,col,sh===undefined?0.66:sh); return r; }
  function solid(F,s0,s1,t0,t1,h){ cols.push([ccw([F.W(s0,t0),F.W(s1,t0),F.W(s1,t1),F.W(s0,t1)]),h]); }
  /* a ring of voussoirs, alternating colours, centre (s,yc) */
  function vous(F,s,t,yc,r0,r1,N,cA,cB){
    for(var i=0;i<N;i++){ var a0=Math.PI*i/N, a1=Math.PI*(i+1)/N;
      fq(F,t,[[s+Math.cos(a0)*r0,yc+Math.sin(a0)*r0],[s+Math.cos(a0)*r1,yc+Math.sin(a0)*r1],
              [s+Math.cos(a1)*r1,yc+Math.sin(a1)*r1],[s+Math.cos(a1)*r0,yc+Math.sin(a1)*r0]],i%2?cB:cA,1); }
  }
  /* a sloped-top block (cheek walls): s0..s1 across, t0..t1 out, top from h0 at t0 to h1 at t1 */
  function slab(F,s0,s1,t0,t1,h0,h1,col){
    var c=rgb(col,0.78), ct=rgb(col,1);
    function V(s,t,y){ var p=F.W(s,t); return [p[0],y,p[1]]; }
    var a=V(s0,t0,0), b=V(s1,t0,0), cc=V(s1,t1,0), d=V(s0,t1,0), A=V(s0,t0,h0), Bv=V(s1,t0,h0), C=V(s1,t1,h1), D=V(s0,t1,h1);
    [[a,b,Bv,A],[b,cc,C,Bv],[cc,d,D,C],[d,a,A,D],[A,Bv,C,D]].forEach(function(q,k){
      var col2=k===4?ct:c; M.quad(q[0],q[1],q[2],q[3],col2,col2,col2,col2); M.quad(q[3],q[2],q[1],q[0],col2,col2,col2,col2); });
  }
  /* textured quads from one canvas atlas: region r = [x0,y0,x1,y1] in a 256 px canvas */
  var RG={dia:[0,0,128,128],tym:[128,0,256,128],carve:[0,128,128,256],goth:[128,128,256,256]};
  function tq(F,s0,s1,y0,y1,t,key,rep){
    var r=RG[key], u0=r[0]/256, u1=r[2]/256, v0=1-r[3]/256, v1=1-r[1]/256, k=rep||1;
    var a=F.W(s0,t), b=F.W(s1,t);
    TQP.push(a[0],y0,a[1], b[0],y0,b[1], b[0],y1,b[1],  a[0],y0,a[1], b[0],y1,b[1], a[0],y1,a[1]);
    if(k===1) TQU.push(u0,v0, u1,v0, u1,v1,  u0,v0, u1,v1, u0,v1);
    else TQU.push(0,0, k,0, k,1, 0,0, k,1, 0,1);
  }
  /* repeated region (diaper panels): own small texture coords, a second list */
  var TDP=[], TDU=[];
  function tdia(F,s0,s1,y0,y1,t){
    var a=F.W(s0,t), b=F.W(s1,t), k=Math.max(1,Math.round((s1-s0)/(y1-y0)));
    TDP.push(a[0],y0,a[1], b[0],y0,b[1], b[0],y1,b[1],  a[0],y0,a[1], b[0],y1,b[1], a[0],y1,a[1]);
    TDU.push(0,0, k,0, k,1, 0,0, k,1, 0,1);
  }

  /* ---- heights ---- */
  var YPL=0.95, YG=6.0, YS1=6.72, YS2=6.95, Y2=7.45, YP0=10.85, YP1=12.1, Y3=12.45, YC=15.35, YC1=16.07, YC2=16.45,
      YA=17.7, YE=18.0;

  /* ================= massing ================= */
  prism(M,ring,0,YA,BRICK,BRICK,0.56);
  cols.push([ring,YE+2]);
  band(M,ring,0,YPL,0.14,CASTD,0.95,0.68,true);
  band(M,ring,YPL-0.12,YPL,0.2,CAST,1,0.8,true);
  lombardBand(M,ring,YG,CAST,BRICK,0.86);
  band(M,ring,YS1,YS2,0.26,CAST,1,0.72,true);
  band(M,ring,YP0,YP0+0.16,0.1,CAST,1,0.75,true);
  band(M,ring,YP1-0.16,YP1,0.1,CAST,1,0.75,true);
  lombardBand(M,ring,YC,CAST,BRICK,1.0);
  band(M,ring,YC1,YC2,0.55,CASTL,1,0.62);
  band(M,ring,YC1-0.1,YC1,0.4,CASTD,0.9,0.6,true);
  band(M,ring,YA,YE,0.38,CAST,1,0.66);

  /* ================= the roof: low tile hips round a flat crown, a light court ================= */
  (function(){
    var er=offsetRing(ring,0.6), inset=7.2, rise=3.1, hi=offsetRing(er,-inset), n=er.length;
    var cT=rgb(TILE,1), cB=rgb(TILE,0.8), cU=rgb(TILED,0.5);
    for(var i=0;i<n;i++){ var j=(i+1)%n, a=er[i], b=er[j], ai=hi[i], bj=hi[j];
      M.quad([a[0],YE,a[1]],[ai[0],YE+rise,ai[1]],[bj[0],YE+rise,bj[1]],[b[0],YE,b[1]],cB,cT,cT,cB);
      M.quad([a[0],YE-0.25,a[1]],[b[0],YE-0.25,b[1]],[b[0],YE,b[1]],[a[0],YE,a[1]],cU,cU,cU,cU);
      /* hip ridges */
      var steps=8; for(var k=0;k<steps;k++){ var t0=k/steps, t1=(k+1)/steps;
        segBox(M,[a[0]+(ai[0]-a[0])*t0,a[1]+(ai[1]-a[1])*t0],[a[0]+(ai[0]-a[0])*t1,a[1]+(ai[1]-a[1])*t1],
          YE+rise*t0+0.02,YE+rise*t1+0.14,0.24,TILED,0.85); }
    }
    /* the flat crown with the light court cut out (OSM inner way) */
    var CR=[[-18.7,46.9],[-6.8,46.9],[-6.8,55.2],[-18.7,55.2]].map(function(q){ return P(q[0],q[1]); });
    ccw(CR);
    flatHoled(M,ccw(hi.slice()),[CR],YE+rise,0x8F8778,1);
    band(M,offsetRing(CR,0.25),YE+rise,YE+rise+0.5,0,CAST,1,0.75,true);
    /* the court walls, seen from above: brick inside, a dark floor below */
    var cr=CR.slice().reverse(), dk=rgb(BRICKD,0.6), dk2=rgb(BRICKD,0.85);
    for(i=0;i<cr.length;i++){ var p=cr[i], q=cr[(i+1)%cr.length];
      M.quad([p[0],YE-6,p[1]],[p[0],YE+rise,p[1]],[q[0],YE+rise,q[1]],[q[0],YE-6,q[1]],dk,dk2,dk2,dk); }
    flat(M,CR,YE-6,0x4A4540,1);
    /* finials at the corners of the eaves */
    er.forEach(function(p){ var r=ccw(ngon(p[0],p[1],0.28,8,0));
      prism(M,r,YE,YE+0.55,CAST,CASTL,0.7); coneRoof(M,p[0],p[1],0.2,YE+0.55,0.9,CAST,8); });
  })();

  /* ================= window kinds ================= */
  /* ground storey round arched window, bottom of glass at gy */
  function gArch(F,c,t,gy){
    gy=gy||1.55;
    fa(F,c,t+0.03,gy-0.2,2.7,4.05-gy+0.2,1.35,CAST,1);
    fa(F,c,t+0.045,gy-0.05,2.36,4.05-gy+0.05,1.18,CASTD,0.92);
    fa(F,c,t+0.06,gy,2.0,4.05-gy,1.0,GLASS,1);
    [-0.34,0.34].forEach(function(o){ fr(F,c+o-0.035,c+o+0.035,gy,4.05+Math.sqrt(1-o*o)*0.98,t+0.07,FRAME,1); });
    [gy+0.95,gy+1.9,4.05].forEach(function(y){ if(y<=4.06) fr(F,c-1.0,c+1.0,y-0.03,y+0.03,t+0.07,FRAME,1); });
    fb(F,c-0.24,c+0.24,t,t+0.12,5.08,5.5,CASTL,0.8);                 /* keystone */
    fb(F,c-1.3,c+1.3,t,t+0.14,gy-0.36,gy-0.18,CAST,0.8);             /* sill */
    /* two basement lights in the plinth */
    if(gy<2) [-0.52,0.52].forEach(function(o){ fr(F,c+o-0.33,c+o+0.33,0.22,0.78,t+0.15,CASTL,1); fr(F,c+o-0.24,c+o+0.24,0.3,0.7,t+0.16,GLASS,1); });
  }
  /* second floor: a pair of tall lights in one cast stone surround */
  function w2(F,c,t){
    fr(F,c-1.18,c+1.18,Y2,10.1,t+0.03,CAST,1);
    [-0.53,0.53].forEach(function(o){ fr(F,c+o-0.4,c+o+0.4,Y2+0.15,9.95,t+0.05,GLASS,1);
      fr(F,c+o-0.4,c+o+0.4,9.18,9.24,t+0.06,FRAME,1); fr(F,c+o-0.025,c+o+0.025,Y2+0.15,9.18,t+0.06,FRAME,1); });
    fb(F,c-1.32,c+1.32,t,t+0.15,Y2-0.22,Y2,CASTL,0.8);
    fb(F,c-1.28,c+1.28,t,t+0.12,10.1,10.24,CASTL,0.8);
  }
  /* third floor: a pair of round headed lights */
  function w3(F,c,t){
    fr(F,c-1.15,c+1.15,Y3-0.1,13.8,t+0.025,CAST,1);
    [-0.56,0.56].forEach(function(o){
      fa(F,c+o,t+0.035,Y3-0.1,1.1,1.45,0.55,CAST,1);
      fa(F,c+o,t+0.05,Y3+0.05,0.78,1.32,0.39,GLASS,1);
      fr(F,c+o-0.39,c+o+0.39,Y3+1.32,Y3+1.37,t+0.06,FRAME,1); });
    fb(F,c-0.09,c+0.09,t,t+0.14,Y3-0.1,Y3+1.4,CASTL,0.85);          /* colonnette */
    fb(F,c-1.28,c+1.28,t,t+0.15,Y3-0.3,Y3-0.1,CASTL,0.8);
  }
  /* plain rectangular window with a cast stone surround (the courtyard and south sides) */
  function wp(F,c,t,y0,y1,w){
    w=w||1.7;
    fr(F,c-w/2-0.16,c+w/2+0.16,y0-0.16,y1+0.16,t+0.03,CAST,1);
    fr(F,c-w/2,c+w/2,y0,y1,t+0.05,GLASS,1);
    fr(F,c-0.04,c+0.04,y0,y1,t+0.06,CASTL,1);
    fr(F,c-w/2,c+w/2,y0+(y1-y0)*0.62,y0+(y1-y0)*0.62+0.06,t+0.06,CASTL,1);
    fb(F,c-w/2-0.3,c+w/2+0.3,t,t+0.14,y0-0.32,y0-0.14,CASTL,0.8);
  }
  /* cream and brick banding over a stretch of wall */
  function stripes(F,s0,s1,t,up){
    var y;
    if(!up) for(y=YPL+0.1;y<YG-0.45;y+=0.6) fr(F,s0,s1,y,y+0.36,t+0.015,CAST,0.97);
    for(y=YS2+0.12;y<YP0-0.1;y+=0.62) fr(F,s0,s1,y,y+0.22,t+0.015,CAST,0.97);
    for(y=YP1+0.14;y<YC-0.45;y+=0.62) fr(F,s0,s1,y,y+0.22,t+0.015,CAST,0.97);
  }
  /* a pilaster on the upper storeys */
  function pil(F,s,t){
    fb(F,s-0.3,s+0.3,t,t+0.18,YS2,YC-0.36,CAST,0.68);
    fb(F,s-0.38,s+0.38,t,t+0.26,YC-0.62,YC-0.36,CASTL,0.75);
    fb(F,s-0.36,s+0.36,t,t+0.24,YS2,YS2+0.35,CASTD,0.7);
  }
  /* the attic: small square lights between cream blocks */
  function attic(F,s0,s1){
    var n=Math.max(1,Math.round((s1-s0)/1.6)), p=(s1-s0)/n;
    for(var k=0;k<n;k++){ var c=s0+(k+0.5)*p;
      fr(F,c-0.36,c+0.36,16.62,17.34,0.03,CAST,1); fr(F,c-0.22,c+0.22,16.76,17.2,0.05,GLASS,1);
      if(k<n-1) fr(F,c+p/2-0.2,c+p/2+0.2,16.62,17.34,0.025,CASTL,0.95); }
  }
  /* a diaper panel in a cream frame */
  function panel(F,s0,s1,t){
    fr(F,s0,s1,YP0+0.16,YP1-0.16,t+0.02,CAST,1);
    tdia(F,s0+0.14,s1-0.14,YP0+0.28,YP1-0.28,t+0.035);
  }

  /* ================= the ornate fronts (east, north) ================= */
  function ornate(F,o){
    var L=F.L, cp=3.75*L/37, cw=5.0, bw=(L-2*cp-cw)/8, PT=0.2;
    var bays=[], k;
    for(k=0;k<4;k++) bays.push(cp+(k+0.5)*bw);
    for(k=0;k<4;k++) bays.push(cp+4*bw+cw+(k+0.5)*bw);
    stripes(F,cp,cp+4*bw,0); stripes(F,L-cp-4*bw,L-cp,0);
    stripes(F,0,cp,0); stripes(F,L-cp,L,0);
    bays.forEach(function(c,i){
      if(o.door===i){
        /* a door in an arched surround */
        fa(F,c,0.03,0.1,2.7,3.95,1.35,CAST,1);
        fa(F,c,0.05,0.18,2.1,3.87,1.05,0x5E5244,1);
        fr(F,c-0.95,c+0.95,0.18,3.6,0.07,WOOD,1);
        fa(F,c,0.07,3.65,1.9,0.3,0.95,GLASS,1);
        fr(F,c-0.03,c+0.03,0.18,3.6,0.08,FRAME,1);
        [-0.48,0.48].forEach(function(q){ fr(F,c+q-0.3,c+q+0.3,1.9,3.3,0.08,GLASSL,1); });
        fb(F,c-1.5,c+1.5,0,0.7,0,0.16,CASTD,0.75); solid(F,c-1.5,c+1.5,0,0.7,0.16);
        fb(F,c-0.24,c+0.24,0,0.12,5.08,5.5,CASTL,0.8);
      } else gArch(F,c,0);
      w2(F,c,0); w3(F,c,0); panel(F,c-bw/2+0.22,c+bw/2-0.22,0);
    });
    attic(F,0.3,L-0.3);
    /* corner pavilions: upper storeys stand forward, pilasters at their edges */
    [[-PT,cp],[L-cp,L+PT]].forEach(function(r,j){
      fb(F,r[0],r[1],0,PT,YS2,YC-0.3,BRICK,0.6);
      var c=j?L-cp/2:cp/2;
      stripes(F,r[0]+(j?0:PT),r[1]-(j?PT:0),PT,1);
      gArch(F,c,0); w2(F,c,PT); w3(F,c,PT); panel(F,c-cp/2+0.75,c+cp/2-0.75,PT);
      pil(F,j?r[0]+0.3:r[1]-0.3,PT); pil(F,j?L-0.12:0.12,PT);
    });
    /* the centre bay */
    var cc=cp+4*bw+cw/2, CT=0.28;
    fb(F,cc-cw/2,cc+cw/2,0,CT,YS2,YC-0.3,CAST,0.64);
    stripes(F,cc-cw/2,cc+cw/2,0);
    pil(F,cc-cw/2+0.3,CT); pil(F,cc+cw/2-0.3,CT);
    if(o.entry){
      /* the arched entrance: archivolts, a deep reveal, panelled doors, a fanlight, steps */
      fa(F,cc,0.03,0.3,4.1,3.7,2.05,CAST,1);
      fa(F,cc,0.045,0.3,3.6,3.7,1.8,CASTL,1);
      fa(F,cc,0.06,0.3,3.2,3.7,1.6,CASTD,0.9);
      fa(F,cc,0.075,0.3,2.7,3.7,1.35,0x55493D,1);
      fr(F,cc-1.15,cc+1.15,0.32,3.75,0.09,WOOD,1);
      fa(F,cc,0.09,3.75,2.3,0.01,1.15,GLASS,1);
      fr(F,cc-0.03,cc+0.03,0.32,3.75,0.1,FRAME,1);
      [-0.58,0.58].forEach(function(q){ [0.6,2.2].forEach(function(y){ fr(F,cc+q-0.4,cc+q+0.4,y,y+1.25,0.1,WOODL,1); }); });
      fb(F,cc-0.3,cc+0.3,0,0.14,5.65,6.15,CASTL,0.8);
      [[2.3,0.16,0,4.4],[1.25,0.32,0,3.8]].forEach(function(q){ fb(F,cc-q[3]/2,cc+q[3]/2,0,q[0],0,q[1],CASTD,0.72); solid(F,cc-q[3]/2,cc+q[3]/2,0,q[0],q[1]); });
      /* a bronze plaque by the corner */
      fr(F,cp-0.5,cp+0.1,1.9,2.75,0.05,BRONZE,1);
    } else {
      fa(F,cc,0.03,1.35,3.2,2.7,1.6,CAST,1);
      fa(F,cc,0.05,1.55,2.6,2.5,1.3,GLASS,1);
      [-0.45,0.45].forEach(function(q){ fr(F,cc+q-0.035,cc+q+0.035,1.55,4.05+1.2,0.06,FRAME,1); });
      fr(F,cc-1.3,cc+1.3,2.9,2.96,0.06,FRAME,1);
    }
    /* second floor: two lights behind a traceried balcony */
    fr(F,cc-1.75,cc+1.75,Y2-0.15,10.3,CT+0.03,CAST,1);
    [-0.85,0.85].forEach(function(q){ fr(F,cc+q-0.55,cc+q+0.55,Y2+0.1,10.0,CT+0.05,GLASS,1);
      fr(F,cc+q-0.03,cc+q+0.03,Y2+0.1,10.0,CT+0.06,FRAME,1); fr(F,cc+q-0.55,cc+q+0.55,9.2,9.26,CT+0.06,FRAME,1); });
    fb(F,cc-1.95,cc+1.95,CT,CT+0.62,Y2-0.35,Y2-0.08,CASTL,0.72);
    [-0.6,-1.3,0.6,1.3].forEach(function(q){ fb(F,cc+q-0.12,cc+q+0.12,CT,CT+0.5,Y2-0.95,Y2-0.35,CASTD,0.7); });
    tq(F,cc-1.95,cc+1.95,Y2-0.08,Y2+0.95,CT+0.62,'goth');
    fb(F,cc-1.95,cc+1.95,CT+0.5,CT+0.66,Y2+0.95,Y2+1.07,CASTL,0.8);
    /* third floor and the diaper band: one carved panel round two lights */
    tq(F,cc-2.0,cc+2.0,YP0+0.05,YC-0.4,CT+0.03,'carve');
    [-0.65,0.65].forEach(function(q){ fr(F,cc+q-0.48,cc+q+0.48,Y3+0.25,14.35,CT+0.05,CASTL,1); fr(F,cc+q-0.36,cc+q+0.36,Y3+0.35,14.25,CT+0.06,GLASS,1); });
    return {cp:cp,bw:bw,cw:cw,cc:cc};
  }
  var oE=ornate(FE,{entry:1}), oN=ornate(FN,{door:7});

  /* ================= the courtyard (west) side ================= */
  var SD=15.25;                                  /* the door, on a2r's terrace frame (s from the NW corner) */
  (function(){
    var F=FW, L=F.L, cp=3.75*L/37, PT=0.2;
    /* the north west pavilion and the next bay, as on the fronts */
    stripes(F,0,cp+3.1,0);
    fb(F,-PT,cp,0,PT,YS2,YC-0.3,BRICK,0.6);
    stripes(F,PT,cp,PT,1);
    gArch(F,cp/2,0,1.7); w2(F,cp/2,PT); w3(F,cp/2,PT); panel(F,0.75,cp-0.75,PT);
    pil(F,0.12,PT); pil(F,cp-0.3,PT);
    var c2=cp+1.55; gArch(F,c2,0,1.7); w2(F,c2,0); w3(F,c2,0); panel(F,c2-1.3,c2+1.3,0);
    attic(F,0.3,L-0.3);
    /* the chimney stack against the wall: brick with cream bands, a corbelled top, two flues */
    var C0=cp+3.25, C1=C0+2.3, CH=24.6;
    fb(F,C0,C1,0,0.75,0,CH,BRICK,0.6);
    [6.6,10.9,15.6,19.2].forEach(function(y){ fb(F,C0-0.06,C1+0.06,0,0.81,y,y+0.2,CAST,0.75); });
    fb(F,C0-0.06,C1+0.06,-0.4,0.81,YE-0.2,YE+0.3,CAST,0.75);
    fb(F,C0-0.18,C1+0.18,-0.6,0.93,CH-1.0,CH-0.7,CAST,0.75);
    fb(F,C0-0.1,C1+0.1,-0.55,0.85,CH-0.7,CH,BRICK,0.6);
    fb(F,C0-0.2,C1+0.2,-0.65,0.95,CH,CH+0.22,CASTL,0.8);
    fb(F,C0+0.25,C0+0.95,-0.35,0.5,CH+0.22,CH+1.0,BRICKD,0.6); fb(F,C1-0.95,C1-0.25,-0.35,0.5,CH+0.22,CH+1.0,BRICKD,0.6);
    [[C0+0.6],[C1-0.6]].forEach(function(q){ var p=F.W(q[0],0.07); coneRoof(M,p[0],p[1],0.42,CH+1.0,0.55,CASTL,6); });
    fb(F,C0,C1,-0.6,0.75,YE,CH-1.0,BRICK,0.6);
    solid(F,C0,C1,0,0.75,CH);
    /* plain bays: cast stone trimmed windows on three floors */
    var P3=3.2;
    for(var k=-1;k<=5;k++){ var c=SD+k*P3;
      wp(F,c,0,Y2+0.1,9.9,1.7); wp(F,c,0,Y3+0.1,14.4,1.7);
    }
    /* the ground floor: room for the bronze letters right of the door */
    [SD-3.2,SD+4.5,SD+9.6,SD+12.8,SD+16.0].forEach(function(c){ wp(F,c,0,2.25,4.15,1.7); });
    /* the doorway (photo: GWYNN WILSON STUDENT UNION) at the head of the stair */
    var YD=1.26, DW=1.7, DH=2.62, JW=0.4, RA=1.25, yc=YD+DH+0.42;
    fr(F,SD-DW/2-JW,SD+DW/2+JW,YD,yc,0.03,CAST,1);
    tq(F,SD-DW/2-JW,SD-DW/2,YD+0.1,YD+DH,0.045,'carve');
    tq(F,SD+DW/2,SD+DW/2+JW,YD+0.1,YD+DH,0.045,'carve');
    fr(F,SD-DW/2,SD+DW/2,YD,YD+DH,0.045,0x3A2A1F,1);
    [-0.42,0.42].forEach(function(q){ fr(F,SD+q-0.36,SD+q+0.36,YD+0.05,YD+DH-0.05,0.06,WOOD,1);
      [[1.0,2.3]].forEach(function(r){ fr(F,SD+q-0.26,SD+q+0.26,YD+r[0],YD+r[1],0.07,GLASSL,1);
        fr(F,SD+q-0.02,SD+q+0.02,YD+r[0],YD+r[1],0.075,0x3A2A1F,1); fr(F,SD+q-0.26,SD+q+0.26,YD+1.65,YD+1.69,0.075,0x3A2A1F,1); }); });
    /* the lintel with the name, scroll capitals, the tympanum, the arch */
    fb(F,SD-DW/2-JW-0.05,SD+DW/2+JW+0.05,0,0.16,YD+DH,yc,CASTL,0.82);
    [-1,1].forEach(function(sg){ fb(F,SD+sg*(DW/2+JW/2)-0.26,SD+sg*(DW/2+JW/2)+0.26,0,0.2,YD+DH-0.05,yc+0.05,CAST,0.75); });
    var tp=F.W(SD,0.17); facadeText('STUDENT UNION',tp[0],tp[1],F.n[0],F.n[1],YD+DH+0.21,1.5,0.2,'#8A7C62');
    fa(F,SD,0.03,yc,2*RA+0.3,0.01,RA+0.15,CAST,1);
    tq(F,SD-RA,SD+RA,yc,yc+RA,0.05,'tym');
    vous(F,SD,0.04,yc,RA+0.12,RA+0.75,11,CAST,BRICKD);
    vous(F,SD,0.05,yc,RA+0.12,RA+0.22,11,CASTL,CASTL);
    /* wall lanterns either side */
    [-1.75,1.75].forEach(function(q){ var s=SD+q;
      fb(F,s-0.05,s+0.05,0,0.3,YD+2.25,YD+2.35,FRAME,0.7);
      fb(F,s-0.16,s+0.16,0.17,0.49,YD+1.85,YD+1.92,FRAME,0.7);
      fb(F,s-0.13,s+0.13,0.2,0.46,YD+1.92,YD+2.38,LIT,1);
      fb(F,s-0.16,s+0.16,0.17,0.49,YD+2.38,YD+2.45,FRAME,0.7);
      [[-0.13,0.2],[0.13,0.2],[-0.13,0.46],[0.13,0.46]].forEach(function(q){ fb(F,s+q[0]-0.02,s+q[0]+0.02,q[1]-0.02,q[1]+0.02,YD+1.92,YD+2.38,FRAME,0.7); });
      var p=F.W(s,0.33); coneRoof(M,p[0],p[1],0.2,YD+2.45,0.22,FRAME,4); });
    /* bronze letters */
    var lp=F.W(SD+2.75,0.04);
    facadeText('GWYNN WILSON',lp[0],lp[1],F.n[0],F.n[1],YD+2.06,1.5,0.19,'#7A5C36');
    facadeText('STUDENT UNION',lp[0],lp[1],F.n[0],F.n[1],YD+1.81,1.5,0.19,'#7A5C36');
    /* the stair: landing, seven steps, cheek walls with sloped tops */
    var S0=SD-2.6, S1=SD+2.6, TL=1.3, TR=0.4, NR=8, RI=(YD-0.155)/NR;
    fb(F,S0+0.55,S1-0.55,0,TL,0,YD,CAST,0.6); solid(F,S0+0.55,S1-0.55,0,TL,YD);
    for(k=1;k<NR;k++){ var yk=YD-RI*k, t0=TL+(k-1)*TR, t1=t0+TR;
      fb(F,S0+0.55,S1-0.55,t0,t1,0,yk,CAST,0.6);
      fb(F,S0+0.55,S1-0.55,t1-0.04,t1,yk-0.025,yk,CASTD,0.7);
      solid(F,S0+0.55,S1-0.55,t0,t1,yk); }
    var TE=TL+(NR-1)*TR+0.5;
    [[S0,S0+0.55],[S1-0.55,S1]].forEach(function(r){
      fb(F,r[0],r[1],0,TL,0,YD+0.95,CAST,0.62);
      slab(F,r[0],r[1],TL,TE-0.6,YD+0.95,0.95,CAST);
      fb(F,r[0],r[1],TE-0.6,TE,0,0.95,CAST,0.62);
      fb(F,r[0]-0.04,r[1]+0.04,TE-0.64,TE+0.04,0.95,1.02,CASTL,0.8);
      solid(F,r[0],r[1],0,TE,YD+0.95); });
    /* fluted lamp posts with lantern heads at the foot of the stair */
    [S0-0.55,S1+0.55].forEach(function(s){ var p=F.W(s,TE+0.35); flutedLamp(p[0],p[1]); });
    /* hedges in cast stone planters on the top terrace */
    [[5.3,6.8],[9.4,10.9],[19.6,21.0]].forEach(function(r){
      fb(F,r[0],r[1],0.8,2.0,1.26,1.75,CAST,0.62);
      fb(F,r[0]+0.08,r[1]-0.08,0.88,1.92,1.75,2.35,0x355F2C,0.68);
      solid(F,r[0],r[1],0.8,2.0,2.35); });
  })();

  /* ================= the south side ================= */
  (function(){
    var F=FS, L=F.L, cp=3.75*L/37, PT=0.2;
    /* the pavilion at the Trousdale corner (s=0 is the south east corner) */
    stripes(F,0,cp,0);
    fb(F,-PT,cp,0,PT,YS2,YC-0.3,BRICK,0.6); stripes(F,PT,cp,PT,1);
    gArch(F,cp/2,0); w2(F,cp/2,PT); w3(F,cp/2,PT); panel(F,0.75,cp-0.75,PT);
    pil(F,0.12,PT); pil(F,cp-0.3,PT);
    attic(F,0.3,L-0.3);
    var n=10, p=(L-cp-1.2)/n, mid=Math.floor(n/2);
    for(var k=0;k<n;k++){ var c=cp+0.6+(k+0.5)*p;
      if(k===mid){
        /* a service door in a cast stone surround */
        fr(F,c-1.05,c+1.05,0.1,3.4,0.03,CAST,1); fr(F,c-0.8,c+0.8,0.12,3.1,0.05,WOOD,1);
        fr(F,c-0.03,c+0.03,0.12,3.1,0.06,FRAME,1);
        fb(F,c-1.3,c+1.3,0,0.18,3.4,3.65,CASTL,0.8);
        fb(F,c-1.3,c+1.3,0,0.8,0,0.16,CASTD,0.75); solid(F,c-1.3,c+1.3,0,0.8,0.16);
      } else wp(F,c,0,1.9,3.9,1.6);
      wp(F,c,0,Y2+0.1,9.9,1.6); wp(F,c,0,Y3+0.1,14.4,1.6);
    }
  })();

  /* ================= the roof chimney behind the east front ================= */
  (function(){
    function gb(u0,u1,v0,v1,y0,y1,col,sh){ prism(M,ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]),y0,y1,col,col,sh||0.62); }
    var u=3.4, v=43.0;
    gb(u-0.9,u+0.9,v-1.3,v+1.3,YE,23.2,CAST,0.62);
    [19.6,20.6,21.6].forEach(function(y){ gb(u-0.94,u+0.94,v-1.34,v+1.34,y,y+0.35,BRICK,0.6); });
    gb(u-1.12,u+1.12,v-1.52,v+1.52,23.2,23.5,CASTL,0.8);
    gb(u-0.95,u+0.95,v-1.35,v+1.35,23.5,24.1,CAST,0.62);
    gb(u-1.1,u+1.1,v-1.5,v+1.5,24.1,24.3,CASTL,0.8);
    [-0.65,0.65].forEach(function(o){ var p=P(u,v+o); prism(M,ccw(ngon(p[0],p[1],0.3,8,0)),24.3,24.9,TILED,TILED,0.7);
      coneRoof(M,p[0],p[1],0.38,24.9,0.5,TILE,8); });
  })();

  /* ================= fluted lamp posts with lantern heads ================= */
  function flutedLamp(x,z){
    prism(M,ccw(ngon(x,z,0.34,8,0)),0,0.25,POST,POST,0.7);
    prism(M,ccw(ngon(x,z,0.26,8,0)),0.25,0.75,POST,POST,0.66);
    prism(M,ccw(ngon(x,z,0.17,8,0)),0.75,0.95,POST,POST,0.7);
    prism(M,ccw(ngon(x,z,0.105,12,0)),0.95,3.9,POST,POST,0.6);
    prism(M,ccw(ngon(x,z,0.15,8,0)),3.9,4.08,POST,POST,0.72);
    prism(M,ccw(ngon(x,z,0.22,4,Math.PI/4)),4.08,4.16,FRAME,FRAME,0.7);
    prism(M,ccw(ngon(x,z,0.17,4,Math.PI/4)),4.16,4.72,LIT,LIT,0.95);
    [0,1,2,3].forEach(function(i){ var a=Math.PI/4+i*Math.PI/2; postAt(M,x+Math.cos(a)*0.17,z+Math.sin(a)*0.17,4.16,4.72,0.025,FRAME,0.7); });
    prism(M,ccw(ngon(x,z,0.25,4,Math.PI/4)),4.72,4.8,FRAME,FRAME,0.7);
    coneRoof(M,x,z,0.24,4.8,0.3,FRAME,4);
    postAt(M,x,z,5.1,5.3,0.03,FRAME,0.7);
    cols.push([ccw(ngon(x,z,0.32,6,0)),4.0]);
  }
  /* two more either side of the east entrance */
  [-3.2,3.2].forEach(function(o){ var p=FE.W(oE.cc+o,2.6); flutedLamp(p[0],p[1]); });

  /* ================= the texture atlas ================= */
  function atlas(){
    var cv=document.createElement('canvas'); cv.width=256; cv.height=256;
    var g=cv.getContext('2d'), i, j;
    g.clearRect(0,0,256,256);
    /* carved relief (jambs, the centre panel): cream with scrolling vine lozenges */
    g.fillStyle='#E2D4B2'; g.fillRect(0,128,128,128);
    g.strokeStyle='#A8966F'; g.lineWidth=3;
    for(j=0;j<4;j++){ var cy=128+16+j*32;
      g.beginPath(); g.moveTo(64,cy-14); g.lineTo(84,cy); g.lineTo(64,cy+14); g.lineTo(44,cy); g.closePath(); g.stroke();
      g.beginPath(); g.arc(64,cy,5,0,6.283); g.stroke();
      g.beginPath(); g.moveTo(10,cy-12); g.quadraticCurveTo(30,cy,10,cy+12); g.moveTo(118,cy-12); g.quadraticCurveTo(98,cy,118,cy+12); g.stroke(); }
    g.lineWidth=4; g.strokeRect(4,132,120,120);
    /* pierced tympanum: a cream half disc with dark openings */
    g.fillStyle='#E4D7B7'; g.beginPath(); g.moveTo(128,128); g.arc(192,128,63,Math.PI,0); g.closePath(); g.fill();
    g.fillStyle='#3B3129';
    for(j=0;j<4;j++) for(i=0;i<9;i++){ var px=136+i*14+(j%2)*7, py=118-j*14;
      if(Math.hypot(px-192,py-128)<52){ g.beginPath(); g.arc(px,py,4.2,0,6.283); g.fill();
        g.fillRect(px-1.2,py-7,2.4,14); g.fillRect(px-7,py-1.2,14,2.4); } }
    g.strokeStyle='#B9A782'; g.lineWidth=4; g.beginPath(); g.arc(192,128,58,Math.PI,0); g.stroke();
    /* the gothic balcony front: cream with a row of pointed openings */
    g.fillStyle='#E4D7B7'; g.fillRect(128,128,128,128);
    g.fillStyle='#463A31';
    for(i=0;i<6;i++){ var ox=136+i*20;
      g.beginPath(); g.moveTo(ox,232); g.lineTo(ox,176); g.quadraticCurveTo(ox,158,ox+7,152); g.quadraticCurveTo(ox+14,158,ox+14,176); g.lineTo(ox+14,232); g.closePath(); g.fill(); }
    g.fillStyle='#C9B892'; g.fillRect(128,236,128,20); g.fillRect(128,128,128,14);
    var t=new T.CanvasTexture(cv); t.anisotropy=4; return t;
  }
  function diaper(){
    var cv=document.createElement('canvas'); cv.width=64; cv.height=64;
    var g=cv.getContext('2d');
    g.fillStyle='#A85A3E'; g.fillRect(0,0,64,64);
    g.fillStyle='#934A33'; for(var y=0;y<64;y+=8) g.fillRect(0,y,64,1);
    g.strokeStyle='#6E3121'; g.lineWidth=6;
    g.beginPath(); g.moveTo(32,0); g.lineTo(64,32); g.lineTo(32,64); g.lineTo(0,32); g.closePath(); g.stroke();
    g.fillStyle='#E0D0AC'; g.fillRect(28,28,8,8); g.fillRect(0,0,5,5); g.fillRect(59,0,5,5); g.fillRect(0,59,5,5); g.fillRect(59,59,5,5);
    var t=new T.CanvasTexture(cv); t.wrapS=T.RepeatWrapping; t.wrapT=T.RepeatWrapping; return t;
  }
  function texMesh(pos,uv,tex,alpha){
    if(!pos.length) return;
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    g.computeVertexNormals(); g.computeBoundingSphere();
    var m=new T.Mesh(g,new T.MeshLambertMaterial({map:tex,side:T.DoubleSide,alphaTest:alpha?0.5:0,transparent:false}));
    m.frustumCulled=false; m.userData.noShadow=true; m.raycast=function(){}; scene.add(m);
  }
  texMesh(TQP,TQU,atlas(),true);
  texMesh(TDP,TDU,diaper(),false);

  /* keep trees off the building */
  var keep=offsetRing(ring,2.0);
  for(var t2=TREE_POS.length-1;t2>=0;t2--) if(inRing(keep,TREE_POS[t2][0],TREE_POS[t2][1])) TREE_POS.splice(t2,1);

  B.h=YE+3.1;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  window.__union={tris:M.count(),tex:(TQP.length+TDP.length)/9};
})();
