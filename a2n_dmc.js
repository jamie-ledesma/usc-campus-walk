/* ==================================================================
   Dr. Joseph Medicine Crow Center for International and Public Affairs
   (DMC; Edward Durell Stone, 1966; formerly the Von KleinSmid Center).
   a_world.js leaves its footprint empty (CUSTOM stub sets B.hand).

   A rose brick square doughnut on a low podium. Measurements come from
   OpenStreetMap (relation 6095465): the outer block is about 85 x 55 m,
   the open courtyard (the hole in the white roof) about 31.6 x 17 m and
   sits toward the south west side; the 51 m tower (way 442277391) stands
   in the courtyard's north west inner corner.

   Courtyard: glass ground storey set back under a white balcony slab with
   a light rail and flags; above it tall slender brick piers and round
   arches on all four sides; the thin white roof oversails them. In the
   middle a sunken round amphitheatre of brick and concrete rings, hedges
   and a tree.

   Outside: vertical brick fins on the north, west and east fronts; along
   the south front (toward Tommy Trojan) a tall arcade with flags in the
   bays; the thin white roof plane on fine ribs; broad low steps all round.
   Passages lead into the courtyard from the south arcade, the west front
   and the east front.

   Local frame: u along the long side (grid east), v across it (grid south,
   toward Tommy Trojan). All heights in metres above the street.
   ================================================================== */
(function(){
  var NAME='Dr. Joseph Medicine Crow Center for International and Public Affairs';
  var B=null, i, k;
  for(i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name===NAME) B=CAMPUS[i];
  if(!B) return;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var BRICK=0xC06E52, BRICKD=0xA85C44, WHITE=0xF2EFE7, ROOFC=0xE4E0D6, CREAM=0xE7DCC8,
      GLASS=0x2B353D, BRONZE=0x4A4038, SLOT=0x4C3328, DARK=0x2E2622, PAVE=0xBDB3A0,
      STEP=0xD9D3C5, CONC=0xCEC7B6, HEDGE=0x3C6B33, HEDGET=0x4A7A3B, RAIL=0xE8E6E0;

  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function solid(r,h){ cols.push([ccw(r.slice()),h]); }

  /* ---------- local frame from the footprint ---------- */
  var R=B.ring, n=R.length, OX=0, OZ=0, best=0, EU=[1,0];
  for(i=0;i<n;i++){
    OX+=R[i][0]/n; OZ+=R[i][1]/n;
    var a=R[i], b=R[(i+1)%n], L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(L>best){ best=L; EU=[(b[0]-a[0])/L,(b[1]-a[1])/L]; }
  }
  if(EU[0]<0) EU=[-EU[0],-EU[1]];
  var EV=[-EU[1],EU[0]], U=0, V=0;
  for(i=0;i<n;i++){
    var du=R[i][0]-OX, dv=R[i][1]-OZ;
    U+=Math.abs(du*EU[0]+dv*EU[1])/n; V+=Math.abs(du*EV[0]+dv*EV[1])/n;
  }
  function P(u,v){ return [OX+EU[0]*u+EV[0]*v, OZ+EU[1]*u+EV[1]*v]; }
  function W3(u,v,y){ var p=P(u,v); return [p[0],y,p[1]]; }
  function WN(nu,nv){ return [EU[0]*nu+EV[0]*nv,0,EU[1]*nu+EV[1]*nv]; }
  function UV(x,z){ var dx=x-OX, dz=z-OZ; return [dx*EU[0]+dz*EU[1], dx*EV[0]+dz*EV[1]]; }
  function rect(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function box(u0,u1,v0,v1,y0,y1,col,sh){ var r=rect(u0,u1,v0,v1); prism(M,r,y0,y1,col,col,sh==null?0.62:sh); return r; }
  function under(ring,y,col,sh){                      /* a face looking down */
    var f=triangulate(ring), c=rgb(col,sh==null?0.8:sh);
    for(var j=0;j<f.length;j++){ var A=ring[f[j][0]],Bq=ring[f[j][1]],C=ring[f[j][2]];
      M.tri([A[0],y,A[1]],[Bq[0],y,Bq[1]],[C[0],y,C[1]],c,c,c); }
  }
  /* a quad wound so that it faces n */
  function q4(A,Bq,C,D,c,nn,MM){
    var ux=Bq[0]-A[0],uy=Bq[1]-A[1],uz=Bq[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*nn[0]+ny*nn[1]+nz*nn[2]<0) (MM||M).quad(D,C,Bq,A,c,c,c,c); else (MM||M).quad(A,Bq,C,D,c,c,c,c);
  }
  /* the region between two nested rectangles, as four strips */
  function frame(i0,o0){   /* [u0,u1,v0,v1] inner, outer */
    return [[o0[0],o0[1],o0[2],i0[2]],[o0[0],o0[1],i0[3],o0[3]],[o0[0],i0[0],i0[2],i0[3]],[i0[1],o0[1],i0[2],i0[3]]];
  }

  /* wall frames: s runs along the wall, t out from it along the normal */
  function FP(F,s,t){ return [F.cu+F.au*s+F.nu*t, F.cv+F.av*s+F.nv*t]; }
  function F3(F,s,t,y){ var q=FP(F,s,t); return W3(q[0],q[1],y); }
  function FN(F){ return WN(F.nu,F.nv); }
  function Frect(F,s0,s1,t0,t1){ var p=FP(F,s0,t0), q=FP(F,s1,t1);
    return rect(Math.min(p[0],q[0]),Math.max(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[1],q[1])); }
  function Fbox(F,s0,s1,t0,t1,y0,y1,col,sh){ var r=Frect(F,s0,s1,t0,t1); prism(M,r,y0,y1,col,col,sh==null?0.62:sh); return r; }
  function Fface(F,s0,s1,t,y0,y1,col,sh,back){
    var nn=FN(F); if(back) nn=[-nn[0],0,-nn[2]];
    q4(F3(F,s0,t,y0),F3(F,s0,t,y1),F3(F,s1,t,y1),F3(F,s1,t,y0),rgb(col,sh==null?1:sh),nn);
  }

  /* ---------- dimensions ---------- */
  var G=1.5;                      /* podium, courtyard and arcade floor */
  var H=G+15.2, RT=H+0.6;         /* top of the brick, top of the roof slab */
  /* the open courtyard (the hole in the roof), from OSM's inner ring */
  var OPEN=[[144.1,-56.2],[116.2,-71.0],[108.2,-55.9],[136.0,-41.0]].map(function(p){ return UV(p[0],p[1]); });
  var ou0=1e9,ou1=-1e9,ov0=1e9,ov1=-1e9;
  OPEN.forEach(function(q){ ou0=Math.min(ou0,q[0]); ou1=Math.max(ou1,q[0]); ov0=Math.min(ov0,q[1]); ov1=Math.max(ov1,q[1]); });
  var CU=(ou0+ou1)/2, CV=(ov0+ov1)/2;
  function grow(d){ return [ou0-d,ou1+d,ov0-d,ov1+d]; }
  var WALL=grow(3.0), PIER=grow(1.4), SLABE=grow(0.6), OPENR=grow(0);
  var LOG=3.5;                    /* depth of the south arcade */
  var BAYS_S=13, BWS=U/9.5, UA0=-3.5*BWS;      /* puts a bay on the south passage */
  var PS=[-2.2,2.2], PW=[CV+3.2,CV+7.6], PE=[CV-2.2,CV+2.2];   /* passages: south (u), west (v), east (v) */
  var PH=G+4.2;                   /* passage and ground storey height */

  /* ================================================================
     the building mass, as blocks round the courtyard and passages
     ================================================================ */
  var blocks=[
    [-U,U,-V,WALL[2]],
    [-U,WALL[0],WALL[2],PW[0]], [-U,WALL[0],PW[1],WALL[3]],
    [WALL[1],U,WALL[2],PE[0]],  [WALL[1],U,PE[1],WALL[3]],
    [-U,UA0,WALL[3],V], [UA0,PS[0],WALL[3],V-LOG], [PS[1],U,WALL[3],V-LOG]
  ];
  blocks.forEach(function(q){ var r=box(q[0],q[1],q[2],q[3],0,H,BRICK,0.56); solid(r,RT); });
  /* lintels over the three passages, and their ceilings */
  [[PS[0],PS[1],WALL[3],V-LOG],[-U,WALL[0],PW[0],PW[1]],[WALL[1],U,PE[0],PE[1]]].forEach(function(q){
    box(q[0],q[1],q[2],q[3],PH,H,BRICK,0.56); under(rect(q[0],q[1],q[2],q[3]),PH,CREAM,0.7);
  });

  /* ================================================================
     roof: a thin white plane over everything, with the courtyard hole
     ================================================================ */
  var OV=3.0, RO=[-U-OV,U+OV,-V-OV,V+OV];
  var roofOuter=rect(RO[0],RO[1],RO[2],RO[3]), roofHole=rect(OPENR[0],OPENR[1],OPENR[2],OPENR[3]);
  flatHoled(M,roofOuter,[roofHole],RT,ROOFC,1);
  frame([-U,U,-V,V],RO).concat(frame(OPENR,WALL)).forEach(function(q){ under(rect(q[0],q[1],q[2],q[3]),H,WHITE,0.78); });
  /* outer and inner fascias */
  var EXT={S:{cu:0,cv:V,au:1,av:0,nu:0,nv:1,h:U}, N:{cu:0,cv:-V,au:1,av:0,nu:0,nv:-1,h:U},
           W:{cu:-U,cv:0,au:0,av:1,nu:-1,nv:0,h:V}, E:{cu:U,cv:0,au:0,av:1,nu:1,nv:0,h:V}};
  var INN={N:{cu:CU,cv:WALL[2],au:1,av:0,nu:0,nv:1,h:(WALL[1]-WALL[0])/2,p:(PIER[1]-PIER[0])/2,o:(ou1-ou0)/2,nb:7},
           S:{cu:CU,cv:WALL[3],au:1,av:0,nu:0,nv:-1,h:(WALL[1]-WALL[0])/2,p:(PIER[1]-PIER[0])/2,o:(ou1-ou0)/2,nb:7},
           W:{cu:WALL[0],cv:CV,au:0,av:1,nu:1,nv:0,h:(WALL[3]-WALL[2])/2,p:(PIER[3]-PIER[2])/2,o:(ov1-ov0)/2,nb:4},
           E:{cu:WALL[1],cv:CV,au:0,av:1,nu:-1,nv:0,h:(WALL[3]-WALL[2])/2,p:(PIER[3]-PIER[2])/2,o:(ov1-ov0)/2,nb:4}};
  Object.keys(EXT).forEach(function(kk){
    var F=EXT[kk], L2=F.h+OV;
    Fface(F,-L2,L2,OV,H,RT,WHITE,0.95);
    Fface(F,-L2,L2,OV-0.12,H-0.18,H,WHITE,0.85);
    for(var s=-L2+0.6;s<L2-0.3;s+=1.2) Fbox(F,s-0.07,s+0.07,0,OV-0.05,H-0.42,H,WHITE,0.74);   /* ribs under the overhang */
  });
  Object.keys(INN).forEach(function(kk){
    var F=INN[kk];
    Fface(F,-F.o,F.o,3.0,H,RT,WHITE,0.95);
    for(var s=-F.o+0.5;s<F.o-0.3;s+=1.1) Fbox(F,s-0.07,s+0.07,0,2.95,H-0.42,H,WHITE,0.74);
  });

  /* ================================================================
     arcades: piers and round arches, spandrels to the top
     ================================================================ */
  function arches(F,s0,s1,nb,yb,crown,ytop,pw,t0,t1,col,colS,solidH){
    var bw=(s1-s0)/nb, nn=FN(F), nb2=[-nn[0],0,-nn[2]], sd=WN(F.au,F.av);
    var cF=rgb(col,1), cB=rgb(col,0.62), cS=rgb(colS,0.82), NSEG=10;
    for(var kk=0;kk<=nb;kk++){
      var sc=s0+kk*bw, pa=Math.max(s0,sc-pw/2), pb=Math.min(s1,sc+pw/2);
      var r=Fbox(F,pa,pb,t0,t1,yb,ytop,col,0.6); if(solidH) solid(r,solidH);
    }
    var out=[];
    for(kk=0;kk<nb;kk++){
      var a2=s0+kk*bw+pw/2, b2=s0+(kk+1)*bw-pw/2, r0=(b2-a2)/2, m=(a2+b2)/2, sp=crown-r0;
      out.push(m);
      for(var j=0;j<NSEG;j++){
        var th0=Math.PI*(1-j/NSEG), th1=Math.PI*(1-(j+1)/NSEG), thm=(th0+th1)/2;
        var sa=m+Math.cos(th0)*r0, sb=m+Math.cos(th1)*r0, ya=sp+Math.sin(th0)*r0, yb2=sp+Math.sin(th1)*r0;
        q4(F3(F,sa,t1,ya),F3(F,sa,t1,ytop),F3(F,sb,t1,ytop),F3(F,sb,t1,yb2),cF,nn);
        q4(F3(F,sa,t0,ya),F3(F,sa,t0,ytop),F3(F,sb,t0,ytop),F3(F,sb,t0,yb2),cB,nb2);
        var sn=[-sd[0]*Math.cos(thm),-Math.sin(thm),-sd[2]*Math.cos(thm)];
        q4(F3(F,sa,t1,ya),F3(F,sb,t1,yb2),F3(F,sb,t0,yb2),F3(F,sa,t0,ya),cS,sn);
      }
    }
    return {bw:bw,mids:out};
  }

  /* flags: simple national tricolours and bicolours, a few with a centre mark */
  var FLAGS=[['v',[0x006847,0xFFFFFF,0xCE1126]], ['v',[0xD52B1E,0xFFFFFF,0xD52B1E],0xD52B1E], ['h',[0x000000,0xDD0000,0xFFCE00]],
             ['v',[0x002395,0xFFFFFF,0xED2939]], ['v',[0x169B62,0xFFFFFF,0xFF883E]], ['h',[0xFFFFFF,0xDC143C]],
             ['h',[0xAA151B,0xF1BF00,0xAA151B]], ['v',[0x009246,0xFFFFFF,0xCE2B37]], ['h',[0x0057B7,0xFFD700]],
             ['v',[0xFFFFFF],0xBC002D], ['h',[0x21468B,0xFFFFFF,0xAE1C28]], ['h',[0x00843D,0xFFFFFF,0x00843D]]];
  var flagN=0;
  function flag(F,s0,t,y0,w,h){
    var d=FLAGS[(flagN++)%FLAGS.length], st=d[1], ns=st.length;
    for(var j=0;j<ns;j++){
      var c=st[j];
      if(d[0]==='v'){ Fface(F,s0+w*j/ns,s0+w*(j+1)/ns,t,y0,y0+h,c,0.95); Fface(F,s0+w*j/ns,s0+w*(j+1)/ns,t-0.01,y0,y0+h,c,0.8,1); }
      else { var ya=y0+h*(ns-1-j)/ns, yb=y0+h*(ns-j)/ns; Fface(F,s0,s0+w,t,ya,yb,c,0.95); Fface(F,s0,s0+w,t-0.01,ya,yb,c,0.8,1); }
    }
    if(d[2]!=null){ var cs=s0+w/2, q=h*0.28; Fface(F,cs-q,cs+q,t+0.01,y0+h/2-q,y0+h/2+q,d[2],0.95); Fface(F,cs-q,cs+q,t-0.02,y0+h/2-q,y0+h/2+q,d[2],0.8,1); }
  }

  /* ================================================================
     the courtyard elevations, all four sides
     ================================================================ */
  var CROWN=H-1.25;
  Object.keys(INN).forEach(function(kk){
    var F=INN[kk];
    /* passage gaps in this wall, in s */
    var gaps=[];
    if(kk==='S') gaps.push([PS[0]-CU,PS[1]-CU]);
    if(kk==='W') gaps.push([PW[0]-CV,PW[1]-CV]);
    if(kk==='E') gaps.push([PE[0]-CV,PE[1]-CV]);
    /* ground storey glass, mullions, a transom, doors */
    var segs=[[-F.h,F.h]];
    gaps.forEach(function(g){ var nsg=[]; segs.forEach(function(sg){
      if(g[1]<=sg[0]||g[0]>=sg[1]){ nsg.push(sg); return; }
      if(g[0]>sg[0]) nsg.push([sg[0],g[0]]); if(g[1]<sg[1]) nsg.push([g[1],sg[1]]); }); segs=nsg; });
    segs.forEach(function(sg){
      Fface(F,sg[0],sg[1],0.04,G,PH,GLASS,1);
      Fbox(F,sg[0],sg[1],0,0.14,G+3.0,G+3.12,BRONZE,0.8);
      for(var s=sg[0]+0.05;s<=sg[1];s+=1.55) Fbox(F,s-0.05,s+0.05,0,0.14,G,PH,BRONZE,0.8);
    });
    gaps.forEach(function(g){   /* a white surround round each passage mouth */
      Fbox(F,g[0]-0.3,g[0],0,0.2,G,PH+0.3,WHITE,0.8); Fbox(F,g[1],g[1]+0.3,0,0.2,G,PH+0.3,WHITE,0.8); });
    /* the balcony slab: a white overhang over the glass, with its rail */
    var sl=Fbox(F,-F.h,F.h,0,2.4,PH,G+5.0,WHITE,0.82); under(sl,PH,WHITE,0.74);
    var sr=F.h-0.1;
    Fbox(F,-sr,sr,2.26,2.34,G+5.95,G+6.05,RAIL,0.8);
    Fbox(F,-sr,sr,2.27,2.33,G+5.1,G+5.16,RAIL,0.8);
    for(var s2=-sr;s2<=sr;s2+=0.34) Fbox(F,s2-0.025,s2+0.025,2.275,2.325,G+5.0,G+5.98,RAIL,0.75);
    /* the upper arcade */
    var ar=arches(F,-F.p,F.p,F.nb,G+5.0,CROWN,H,0.9,0.8,1.6,BRICK,CREAM,0);
    ar.mids.forEach(function(m,j){
      /* tall dark windows and doors on the gallery wall behind each arch */
      Fface(F,m-1.25,m+1.25,0.03,G+5.0,CROWN-1.4,CREAM,0.9);
      Fface(F,m-1.05,m+1.05,0.05,G+5.0,CROWN-1.6,0x3A2E28,1);
      Fbox(F,m-0.05,m+0.05,0,0.1,G+5.0,CROWN-1.6,BRONZE,0.8);
      /* flags on short poles off the rail, every other bay */
      if(j%2===0){
        Fbox(F,m-0.04,m+0.04,2.36,2.44,G+5.0,G+7.7,0x6A6A6A,0.8);
        flag(F,m+0.04,2.42,G+6.85,1.1,0.72);
      }
    });
  });

  /* ================================================================
     the outside
     ================================================================ */
  /* vertical brick fins with dark slots between them */
  function fins(F,s0,s1){
    if(s1-s0<1.5) return;
    Fface(F,s0,s1,0.03,G,H-1.7,SLOT,1);
    for(var s=s0+0.4;s<s1-0.2;s+=1.75) Fbox(F,s-0.24,s+0.24,0,0.8,G-0.05,H-1.7,BRICK,0.55);
    solid(Frect(F,s0,s1,0,0.8),H);
  }
  function surround(F,g){       /* white frame round a passage on an outer wall */
    Fbox(F,g[0]-0.45,g[0],0,0.3,G,PH+0.45,WHITE,0.8); Fbox(F,g[1],g[1]+0.45,0,0.3,G,PH+0.45,WHITE,0.8);
    Fbox(F,g[0]-0.45,g[1]+0.45,0,0.3,PH,PH+0.45,WHITE,0.8);
  }
  fins(EXT.N,-U+1.5,U-1.5);
  fins(EXT.W,-V+1.5,PW[0]-0.9); fins(EXT.W,PW[1]+0.9,V-1.5); surround(EXT.W,PW);
  fins(EXT.E,-V+1.5,PE[0]-0.9); fins(EXT.E,PE[1]+0.9,V-LOG-0.9); surround(EXT.E,PE);

  /* the south arcade, toward Tommy Trojan, with flags in the bays */
  var FS=EXT.S, CR_S=G+11.1;
  var arS=arches(FS,UA0,U,BAYS_S,G,CR_S,H,1.15,-1.0,0,BRICK,CREAM,H);
  var lc=box(UA0,U,V-LOG,V-1.0,G+11.4,H,BRICK,0.56); under(lc,G+11.4,CREAM,0.62);
  arS.mids.forEach(function(m){
    if(Math.abs(m)<2.6){       /* the passage into the courtyard */
      Fbox(FS,PS[0]-0.4,PS[0],-LOG,-LOG+0.25,G,PH+0.4,WHITE,0.8); Fbox(FS,PS[1],PS[1]+0.4,-LOG,-LOG+0.25,G,PH+0.4,WHITE,0.8);
      Fbox(FS,PS[0]-0.4,PS[1]+0.4,-LOG,-LOG+0.25,PH,PH+0.4,WHITE,0.8);
    } else {
      Fface(FS,m-1.45,m+1.45,-LOG+0.02,G,G+3.6,WHITE,0.85);
      Fface(FS,m-1.3,m+1.3,-LOG+0.04,G,G+3.45,GLASS,1);
      Fbox(FS,m-0.05,m+0.05,-LOG,-LOG+0.1,G,G+3.45,BRONZE,0.8);
      Fface(FS,m-0.7,m+0.7,-LOG+0.04,G+4.4,G+10.2,0x3A2E28,1);
    }
    Fbox(FS,m-0.85,m+0.85,-0.56,-0.48,G+4.6,G+4.68,0x6A6A6A,0.8);
    flag(FS,m-0.65,-0.5,G+3.75,1.3,0.85);
  });

  /* ================================================================
     podium and broad low steps all round
     ================================================================ */
  var STEPS=[[3.5,G],[4.1,G-0.375],[4.7,G-0.75],[5.3,G-1.125]];   /* outer offset of each level, its height */
  for(k=0;k<STEPS.length;k++){
    var o=STEPS[k][0], hy=STEPS[k][1], lo=hy-0.375;
    Object.keys(EXT).forEach(function(kk){ var F=EXT[kk]; Fface(F,-F.h-o,F.h+o,o,lo,hy,STEP,1); });
    if(k>0){
      var oi=STEPS[k-1][0];
      flatHoled(M,rect(-U-o,U+o,-V-o,V+o),[rect(-U-oi,U+oi,-V-oi,V+oi)],hy,STEP,1);
      frame([-U-oi,U+oi,-V-oi,V+oi],[-U-o,U+o,-V-o,V+o]).forEach(function(q){ cols.push([rect(q[0],q[1],q[2],q[3]),hy]); });
    }
  }

  /* ================================================================
     the sunken round amphitheatre
     ================================================================ */
  var AU=CU+2.5, AV=CV, RA=[7.6,6.2,4.9,3.7], ZA=[G-0.375,G-0.75,G-1.125], NS=28;
  function circ(r){ var out=[]; for(var j=0;j<NS;j++){ var t=j/NS*Math.PI*2; out.push(P(AU+Math.cos(t)*r,AV+Math.sin(t)*r)); } return ccw(out); }
  function cp(r,t,y){ return W3(AU+Math.cos(t)*r,AV+Math.sin(t)*r,y); }
  var PR=STEPS[0][0], POD=[-U-PR,U+PR,-V-PR,V+PR];
  flatHoled(M,rect(POD[0],POD[1],POD[2],POD[3]),[circ(RA[0])],G,PAVE,1);
  var SQ=[AU-RA[0],AU+RA[0],AV-RA[0],AV+RA[0]];
  frame(SQ,POD).forEach(function(q){ cols.push([rect(q[0],q[1],q[2],q[3]),G]); });
  var up=[0,1,0];
  for(var j=0;j<NS;j++){
    var t0=j/NS*Math.PI*2, t1=(j+1)/NS*Math.PI*2, tm=(t0+t1)/2;
    var inw=WN(-Math.cos(tm),-Math.sin(tm));
    for(k=0;k<RA.length;k++){
      var ytop=k===0?G:ZA[k-1], ylo=k<3?ZA[k]:0.0;
      q4(cp(RA[k],t0,ylo),cp(RA[k],t0,ytop),cp(RA[k],t1,ytop),cp(RA[k],t1,ylo),rgb(k%2?CONC:BRICKD,0.85),inw);
      if(k<3){
        q4(cp(RA[k],t0,ylo),cp(RA[k],t1,ylo),cp(RA[k+1],t1,ylo),cp(RA[k+1],t0,ylo),rgb(k%2?BRICK:CONC,k%2?0.9:1),up);
        cols.push([ccw([P(AU+Math.cos(t0)*RA[k],AV+Math.sin(t0)*RA[k]),P(AU+Math.cos(t1)*RA[k],AV+Math.sin(t1)*RA[k]),
                        P(AU+Math.cos(t1)*RA[k+1],AV+Math.sin(t1)*RA[k+1]),P(AU+Math.cos(t0)*RA[k+1],AV+Math.sin(t0)*RA[k+1])]),ylo]);
      }
    }
    /* the paving between the top ring and the square round it */
    var R0=RA[0];
    var hit=function(t){ var c=Math.cos(t), s=Math.sin(t), m=R0/Math.max(Math.abs(c),Math.abs(s)); return P(AU+c*m,AV+s*m); };
    var poly=[P(AU+Math.cos(t0)*R0,AV+Math.sin(t0)*R0),P(AU+Math.cos(t1)*R0,AV+Math.sin(t1)*R0),hit(t1)];
    for(var cq=0;cq<4;cq++){ var ca=Math.PI/4+cq*Math.PI/2; if(ca>t0+1e-4&&ca<t1-1e-4) poly.push(P(AU+R0*Math.SQRT2*Math.cos(ca),AV+R0*Math.SQRT2*Math.sin(ca))); }
    poly.push(hit(t0));
    cols.push([ccw(poly),G]);
  }
  flat(MG,circ(RA[3]),0.03,CONC,0.95);
  flat(MG,circ(RA[3]*0.55),0.045,BRICK,0.85);

  /* hedges in long boxes along the glass, and a tree */
  function hedge(u0,u1,v0,v1){
    box(u0,u1,v0,v1,G,G+0.72,HEDGE,0.6); box(u0+0.08,u1-0.08,v0+0.08,v1-0.08,G+0.72,G+0.9,HEDGET,0.85);
    cols.push([rect(u0,u1,v0,v1),G+0.9]);
  }
  hedge(CU-7.6,CU-1.6,ov0-1.2,ov0-0.1); hedge(CU+1.6,CU+8.4,ov0-1.2,ov0-0.1); hedge(CU+11.2,ou1+1.4,ov0-1.2,ov0-0.1);
  hedge(ou0-1.4,PS[0]-1.2,ov1+0.3,ov1+1.4); hedge(PS[1]+1.2,ou1+1.4,ov1+0.3,ov1+1.4);
  hedge(ou1+0.2,ou1+1.3,CV-6.5,PE[0]-0.8); hedge(ou1+0.2,ou1+1.3,PE[1]+0.8,CV+7.0);
  var TP=[CU+13.4,CV-4.4];
  var pl=box(TP[0]-1.3,TP[0]+1.3,TP[1]-1.3,TP[1]+1.3,G,G+0.55,CONC,0.7); solid(pl,G+0.55);
  flat(M,rect(TP[0]-1.1,TP[0]+1.1,TP[1]-1.1,TP[1]+1.1),G+0.56,0x4A3828,1);

  /* ================================================================
     the tower in the courtyard's north west corner, and its lattice globe
     ================================================================ */
  var TW=UV(117.47,-66.15), TU=TW[0], TV=TW[1], TOPT=44.8;
  function tb(u0,u1,v0,v1,y0,y1,col,sh){ return box(TU+u0,TU+u1,TV+v0,TV+v1,y0,y1,col,sh); }
  tb(-3.0,3.0,-3.0,3.0,0,38.2,CREAM,0.7);                     /* the pale channel down each face */
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){
    var a3=0.62, b3=3.65;
    tb(c[0]<0?-b3:a3,c[0]<0?-a3:b3,c[1]<0?-b3:a3,c[1]<0?-a3:b3,0,38.2,BRICK,0.55);
    tb(c[0]<0?-3.95:2.75,c[0]<0?-2.75:3.95,c[1]<0?-3.95:2.75,c[1]<0?-2.75:3.95,38.2,TOPT,BRICK,0.55);
  });
  tb(-3.8,3.8,-3.8,3.8,37.9,38.2,BRICK,0.6);
  tb(-3.0,3.0,-3.0,3.0,38.2,TOPT-0.6,DARK,0.8);               /* the open belfry */
  [-1,1].forEach(function(sg){
    [-1.45,1.45].forEach(function(s){
      tb(s-0.2,s+0.2,sg<0?-3.95:3.0,sg<0?-3.0:3.95,38.2,TOPT,BRICK,0.55);
      tb(sg<0?-3.95:3.0,sg<0?-3.0:3.95,s-0.2,s+0.2,38.2,TOPT,BRICK,0.55);
    });
    tb(-0.22,0.22,sg<0?-3.6:3.0,sg<0?-3.0:3.6,38.2,TOPT,CREAM,0.7);
    tb(sg<0?-3.6:3.0,sg<0?-3.0:3.6,-0.22,0.22,38.2,TOPT,CREAM,0.7);
  });
  tb(-3.95,3.95,-3.95,3.95,TOPT-0.6,TOPT,BRICK,0.6);
  tb(-3.7,3.7,-3.7,3.7,TOPT,TOPT+0.22,WHITE,0.8);
  solid(rect(TU-3.65,TU+3.65,TV-3.65,TV+3.65),51);
  (function(){
    var c0=P(TU,TV), cx=c0[0], cz=c0[1], gr=2.95, cy=TOPT+0.22+gr-0.1, col=rgb(0xBDB8AC,1), w=0.17, NG=20;
    function tube(A,Bq){
      var d=[Bq[0]-A[0],Bq[1]-A[1],Bq[2]-A[2]], l=Math.hypot(d[0],d[1],d[2]); d=[d[0]/l,d[1]/l,d[2]/l];
      var upv=Math.abs(d[1])<0.9?[0,1,0]:[1,0,0];
      var p=[d[1]*upv[2]-d[2]*upv[1],d[2]*upv[0]-d[0]*upv[2],d[0]*upv[1]-d[1]*upv[0]], pl2=Math.hypot(p[0],p[1],p[2]);
      p=[p[0]/pl2*w/2,p[1]/pl2*w/2,p[2]/pl2*w/2];
      var q=[d[1]*p[2]-d[2]*p[1],d[2]*p[0]-d[0]*p[2],d[0]*p[1]-d[1]*p[0]];
      function o(X,a,bb){ return [X[0]+a[0]+bb[0],X[1]+a[1]+bb[1],X[2]+a[2]+bb[2]]; }
      var neg=function(v){ return [-v[0],-v[1],-v[2]]; };
      [[p,q],[q,neg(p)],[neg(p),neg(q)],[neg(q),p]].forEach(function(pr){
        var e=pr[0], f=pr[1];
        q4(o(A,e,f),o(A,e,neg(f)),o(Bq,e,neg(f)),o(Bq,e,f),col,e);
      });
    }
    for(var mI=0;mI<6;mI++){
      var ph=mI*Math.PI/6;
      for(var jj=0;jj<NG;jj++){
        var a0=jj/NG*Math.PI*2, a1=(jj+1)/NG*Math.PI*2;
        tube([cx+Math.cos(a0)*Math.cos(ph)*gr,cy+Math.sin(a0)*gr,cz+Math.cos(a0)*Math.sin(ph)*gr],
             [cx+Math.cos(a1)*Math.cos(ph)*gr,cy+Math.sin(a1)*gr,cz+Math.cos(a1)*Math.sin(ph)*gr]);
      }
    }
    [-60,-30,0,30,60].forEach(function(lat){
      var la=lat*Math.PI/180, rr2=Math.cos(la)*gr, yy=cy+Math.sin(la)*gr;
      for(var jj=0;jj<NG;jj++){
        var a0=jj/NG*Math.PI*2, a1=(jj+1)/NG*Math.PI*2;
        tube([cx+Math.cos(a0)*rr2,yy,cz+Math.sin(a0)*rr2],[cx+Math.cos(a1)*rr2,yy,cz+Math.sin(a1)*rr2]);
      }
    });
  })();

  /* ================================================================
     keep the landscape out, put the courtyard tree in
     ================================================================ */
  var keep=rect(-U-6,U+6,-V-6,V+6);
  NO_PLANT.push(keep); NO_LAWN_TREES.push(keep);
  for(i=TREE_POS.length-1;i>=0;i--) if(inRing(keep,TREE_POS[i][0],TREE_POS[i][1])) TREE_POS.splice(i,1);
  var tp=P(TP[0],TP[1]); TREE_POS.push([tp[0],tp[1],0,'syc',1.35]);

  B.h=RT;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; scene.add(mg);
  window.__dmc={tris:M.count()+MG.count(),U:U,V:V,open:[ou0,ou1,ov0,ov1],P:P};
})();
