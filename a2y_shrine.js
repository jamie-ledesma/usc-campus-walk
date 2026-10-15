/* ==================================================================
   Shrine Auditorium (Al Malaikah Temple, 1926, John C. Austin and
   A. M. Edelman), 665 W. Jefferson Blvd, across Jefferson from campus.
   Moorish Revival in pale pink stucco and cast stone.

   Footprint from OpenStreetMap way 407613039 plus way 407613027 (the
   north west block of the exhibition wing), shifted like the rest of
   world.txt (about -3.5, +4.0 m). The wedge of the USC Shrine Parking
   Structure on the east side is a separate building (world.txt ##B).

   Frame: the campus grid with its origin at the south west corner of the
   Jefferson wing: u grid east, v grid south (so everything is at v<0).
   P(u,v) = (301,-269) + u*(0.8829,0.4695) + v*(-0.4695,0.8829).
     Jefferson Blvd front (south)  v = -1.0,   u -0.5 .. 85.5
     Royal St front (west)         u = -3.2 between the dome pavilions,
                                   v -26.7 .. -80.5 (five great arches)
     south dome pavilion           u -4.2 .. 9.6,  v -12.9 .. -26.7
     north dome pavilion           u -6.2 .. 13.6, v -80.5 .. -100.3
     exhibition wing (north)       v -100.3 .. -172.5, west wall u -7.2
   Massing: the two storey Jefferson wing (12.6 m), the Royal St front
   block (cornice 22.7 m), the crenellated auditorium box (28.6 m) under
   a shallow ribbed dome (35.6 m), dome pavilions with stepped bases,
   drums and gold onion domes with crescent finials (about 43 m), the
   small domed tower on the south east corner, the lower exhibition wing.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Shrine Auditorium') B=CAMPUS[bi];
  if(!B) return;
  var M=new Mesher(), MG=new Mesher(), cols=[], PI=Math.PI;
  var du=[0.8829,0.4695], dv=[-0.4695,0.8829], OX=301, OZ=-269;
  var STUC=0xFFE3D8, STUCD=0xF2CFC3, CAST=0xEAE1D3, CASTL=0xF5EFE6, CASTD=0xCBC0AF,
      GOLD=0xE4B04C, DRUM=0xF7EAE0, GLASS=0x2C3740, GLASSL=0x55646E, DOOR=0x2C5442, DOORL=0x4A7560,
      BRONZE=0x4E4336, ROOF=0xB9B6AE, POT=0xC9B9A4;
  function P(u,v){ return [OX+u*du[0]+v*dv[0], OZ+u*du[1]+v*dv[1]]; }
  function V(u,v,y){ var p=P(u,v); return [p[0],y,p[1]]; }
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ var a=Math.min(u0,u1), b=Math.max(u0,u1), c=Math.min(v0,v1), d=Math.max(v0,v1);
    return ccw([P(a,c),P(b,c),P(b,d),P(a,d)]); }
  function RU(pts){ return ccw(pts.map(function(q){ return P(q[0],q[1]); })); }
  function box(u0,u1,v0,v1,y0,y1,col,sh){ var r=R(u0,u1,v0,v1); prism(M,r,y0,y1,col,col,sh===undefined?0.72:sh); return r; }
  function solid(r,h){ cols.push([r,h]); }
  /* a triangle turned so its normal points along n */
  function otri(Mx,A,Bp,C,c,n){
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*n[0]+ny*n[1]+nz*n[2]<0) Mx.tri(A,C,Bp,c,c,c); else Mx.tri(A,Bp,C,c,c,c);
  }
  function oquad(Mx,A,Bp,C,D,col,sh,n){ var c=rgb(col,sh===undefined?1:sh); otri(Mx,A,Bp,C,c,n); otri(Mx,A,C,D,c,n); }
  function q2(A,Bp,C,D,col,sh){ var k=rgb(col,sh===undefined?1:sh); M.quad(A,Bp,C,D,k,k,k,k); M.quad(D,C,Bp,A,k,k,k,k); }
  /* a wall: plane u=c (axis 0, s along v) or v=c (axis 1, s along u); out=+1/-1 */
  function Face(axis,c,out){
    var n2=axis===0?[du[0]*out,du[1]*out]:[dv[0]*out,dv[1]*out];
    var G=function(s,t){ return axis===0?[c+out*t,s]:[s,c+out*t]; };
    return {n:[n2[0],0,n2[1]],G:G,W:function(s,t,y){ var g=G(s,t); return V(g[0],g[1],y); }};
  }
  function fq(F,s0,s1,y0,y1,t,col,sh){ oquad(M,F.W(s0,t,y0),F.W(s1,t,y0),F.W(s1,t,y1),F.W(s0,t,y1),col,sh,F.n); }
  function fb(F,s0,s1,t0,t1,y0,y1,col,sh){ var g0=F.G(s0,t0), g1=F.G(s1,t1); return box(g0[0],g1[0],g0[1],g1[1],y0,y1,col,sh); }
  /* a star shaped polygon [[s,y]..] on a wall, fanned from its average point */
  function fpoly(F,pts,t,col,sh){
    var cs=0,cy=0,i; for(i=0;i<pts.length;i++){ cs+=pts[i][0]; cy+=pts[i][1]; } cs/=pts.length; cy/=pts.length;
    var c=rgb(col,sh===undefined?1:sh), O=F.W(cs,t,cy);
    for(i=0;i<pts.length;i++){ var a=pts[i], b=pts[(i+1)%pts.length];
      otri(M,O,F.W(a[0],t,a[1]),F.W(b[0],t,b[1]),c,F.n); }
  }
  /* round headed outline: centre s, half width w, springing y0, bottom yb */
  function roundPts(s,w,yb,y0,n,lift){
    var p=[[s-w,yb],[s+w,yb]];
    for(var k=0;k<=n;k++){ var a=PI*k/n; p.push([s+Math.cos(a)*w, y0+Math.sin(a)*w*(lift||1)]); }
    return p;
  }
  /* pointed (ogee-ish) Moorish head */
  function ogeePts(s,w,yb,y0,hh){
    var p=[[s-w,yb],[s+w,yb]], prof=[[1,0],[1.08,0.22],[1.02,0.45],[0.8,0.66],[0.48,0.84],[0,1]];
    for(var k=0;k<prof.length;k++) p.push([s+prof[k][0]*w, y0+prof[k][1]*hh]);
    for(k=prof.length-2;k>=0;k--) p.push([s-prof[k][0]*w, y0+prof[k][1]*hh]);
    return p;
  }

  /* ---------- textured meshes: carved cast stone and the stained glass ---------- */
  var CVP=[], CVU=[], GLP=[], GLU=[];
  function ttri(PA,UA,A,Bp,C,ua,ub,uc,n){
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*n[0]+ny*n[1]+nz*n[2]<0){ var T1=Bp; Bp=C; C=T1; var T2=ub; ub=uc; uc=T2; }
    PA.push(A[0],A[1],A[2],Bp[0],Bp[1],Bp[2],C[0],C[1],C[2]); UA.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);
  }
  /* a carved band on a wall, with the pattern repeating every rep metres */
  function carve(F,s0,s1,y0,y1,t,rep){
    var L=Math.abs(s1-s0)/(rep||1.6), A=F.W(s0,t,y0), Bp=F.W(s1,t,y0), C=F.W(s1,t,y1), D=F.W(s0,t,y1);
    ttri(CVP,CVU,A,Bp,C,[0,0],[L,0],[L,1],F.n); ttri(CVP,CVU,A,C,D,[0,0],[L,1],[0,1],F.n);
  }
  /* a projecting carved band: carved face plus top and bottom */
  function cband(F,s0,s1,y0,y1,t,rep){
    carve(F,s0,s1,y0,y1,t,rep);
    oquad(M,F.W(s0,0,y1),F.W(s1,0,y1),F.W(s1,t,y1),F.W(s0,t,y1),CASTL,0.95,[0,1,0]);
    oquad(M,F.W(s0,0,y0),F.W(s1,0,y0),F.W(s1,t,y0),F.W(s0,t,y0),CASTD,0.7,[0,-1,0]);
  }
  /* a full cornice: carved frieze, a ledge, a heavy crown */
  function cornice(F,s0,s1,yb,ext){
    var e=ext||0;
    cband(F,s0-e,s1+e,yb,yb+1.0,0.32,1.6);
    fb(F,s0-e*1.4,s1+e*1.4,0,0.5,yb+1.0,yb+1.3,CAST,0.75);
    fb(F,s0-e*1.8,s1+e*1.8,0,0.72,yb+1.3,yb+2.1,CASTL,0.82);
    fb(F,s0-e*1.8,s1+e*1.8,0,0.6,yb+2.1,yb+2.4,CAST,0.8);
  }

  /* ================= plan ================= */
  var VJ=-1.0, UR=-3.2, VA=-26.7, VB=-80.5, UM=9.5, VN=-100.3;
  var HW=12.6, HF=22.7, HM=28.6, HE=16.5;
  /* clear stray trees out of the footprint */
  var keep=offsetRing(B.ring,1.0);
  for(var ti=TREE_POS.length-1;ti>=0;ti--) if(inRing(keep,TREE_POS[ti][0],TREE_POS[ti][1])) TREE_POS.splice(ti,1);

  /* ================= massing ================= */
  var rW=box(-0.5,85.5,VJ,-12.9,0,HW,STUC,0.72); solid(rW,HW);
  flat(M,R(-0.3,85.3,VJ-0.2,-12.9),HW+0.02,ROOF,1);
  var rF=box(UR,UM,VA,VB,0,HF,STUC,0.72); solid(rF,HF);
  flat(M,R(UR+0.3,UM,VA,VB),HF+0.02,ROOF,0.96);
  var mainRing=[[UM,-12.9],[85.5,-12.9],[85.5,-77.7],[79.7,-77.7],[79.7,VN],[UM,VN]];
  var rM=RU(mainRing); prism(M,rM,0,HM,STUC,ROOF,0.72); solid(rM,HM);
  var expoRing=[[0.1,VN],[79.7,VN],[79.7,-172.5],[-4.1,-172.5],[-4.1,-167.9],[-7.2,-167.9],[-7.2,-114.9],[-3.9,-114.9],[-3.9,-110],[0.1,-110]];
  var rE=RU(expoRing); prism(M,rE,0,HE,STUC,ROOF,0.72); solid(rE,HE);
  band(M,offsetRing(rE,0.05),HE-1.0,HE+0.35,0.25,CAST,0.95,0.72,true);
  band(M,offsetRing(rE,0.05),HE+0.35,HE+0.6,0.1,CASTL,1,0.8,true);
  /* coping and stepped merlons round the auditorium box */
  band(M,rM,HM-0.35,HM,0.14,CAST,0.95,0.75,true);
  (function(){
    for(var i=0;i<mainRing.length;i++){
      var a=mainRing[i], b=mainRing[(i+1)%mainRing.length];
      var alongU=Math.abs(b[1]-a[1])<0.01, L=alongU?Math.abs(b[0]-a[0]):Math.abs(b[1]-a[1]);
      var n=Math.floor(L/1.5), st=L/n;
      /* the ring runs clockwise in (u,v) when seen from above with v south: inward is to the right */
      for(var k=0;k<n;k++){
        var f0=(k+0.25)/n, f1=(k+0.75)/n, fm=(k+0.5)/n;
        var p0=[a[0]+(b[0]-a[0])*f0, a[1]+(b[1]-a[1])*f0], p1=[a[0]+(b[0]-a[0])*f1, a[1]+(b[1]-a[1])*f1],
            pm=[a[0]+(b[0]-a[0])*fm, a[1]+(b[1]-a[1])*fm];
        /* inward offset: toward the centre of the box */
        var iu=(46-pm[0]), iv=(-56-pm[1]);
        if(alongU){ var sv=iv>0?1:-1; box(p0[0],p1[0],pm[1],pm[1]+sv*0.55,HM,HM+0.8,STUC,0.7);
          box(p0[0]+(p1[0]-p0[0])*0.22,p1[0]-(p1[0]-p0[0])*0.22,pm[1],pm[1]+sv*0.4,HM+0.8,HM+1.15,STUC,0.75); }
        else { var su=iu>0?1:-1; box(pm[0],pm[0]+su*0.55,p0[1],p1[1],HM,HM+0.8,STUC,0.7);
          box(pm[0],pm[0]+su*0.4,p0[1]+(p1[1]-p0[1])*0.22,p1[1]-(p1[1]-p0[1])*0.22,HM+0.8,HM+1.15,STUC,0.75); }
      }
      void st;
    }
  })();

  /* ================= the shallow ribbed dome over the auditorium ================= */
  var DC=[45.75,-56.6], DA=33.75, DB=41.5, DY=HM+0.15, DH=7.0;
  function sgnp(x){ return (x<0?-1:1)*Math.sqrt(Math.abs(x)); }
  function domePt(r,a){ return [DC[0]+DA*r*sgnp(Math.cos(a)), DC[1]+DB*r*sgnp(Math.sin(a)), DY+DH*Math.pow(Math.max(0,1-r*r),0.55)]; }
  (function(){
    var RS=[0,0.18,0.36,0.52,0.66,0.78,0.87,0.94,1], NA=56, up=[0,1,0];
    var col=function(r,a){ var w=0.5+0.5*Math.sin(a*7+r*9)*Math.cos(a*3-r*5);
      var k=0.72+0.28*w; return [0.88*k+0.04,0.88*k+0.04,0.86*k+0.04]; };
    for(var i=0;i<RS.length-1;i++) for(var j=0;j<NA;j++){
      var a0=2*PI*j/NA, a1=2*PI*(j+1)/NA, r0=RS[i], r1=RS[i+1];
      var A=domePt(r0,a0), Bp=domePt(r0,a1), C=domePt(r1,a1), D=domePt(r1,a0);
      var cA=col(r0,a0), cB=col(r0,a1), cC=col(r1,a1), cD=col(r1,a0);
      var W=function(p){ var q=P(p[0],p[1]); return [q[0],p[2],q[1]]; };
      var A3=W(A),B3=W(Bp),C3=W(C),D3=W(D);
      if(i>0){ var cAv=A3, cTri=function(P1,P2,P3,c1,c2,c3){ var ux=P2[0]-P1[0],uz=P2[2]-P1[2],vx=P3[0]-P1[0],vz=P3[2]-P1[2];
          if(uz*vx-ux*vz<0) M.tri(P1,P3,P2,c1,c3,c2); else M.tri(P1,P2,P3,c1,c2,c3); };
        cTri(A3,B3,C3,cA,cB,cC); cTri(A3,C3,D3,cA,cC,cD); void cAv; }
      else otri(M,A3,C3,D3,cC,up);
    }
    /* ribs along the meridians and one ring */
    var NR=28;
    for(var k=0;k<NR;k++){ var a=2*PI*(k+0.5)/NR;
      for(i=1;i<RS.length-1;i++){
        var p0=domePt(RS[i],a), p1=domePt(RS[i+1],a);
        var tu=-(p1[1]-p0[1]), tv=(p1[0]-p0[0]), tl=Math.hypot(tu,tv)||1; tu*=0.24/tl; tv*=0.24/tl;
        oquad(M,V(p0[0]-tu,p0[1]-tv,p0[2]+0.14),V(p0[0]+tu,p0[1]+tv,p0[2]+0.14),V(p1[0]+tu,p1[1]+tv,p1[2]+0.14),V(p1[0]-tu,p1[1]-tv,p1[2]+0.14),0xA4A59F,0.9,up);
      } }
    /* the flat margin between the dome's rim and the parapet */
    flat(M,offsetRing(rM,-0.2),DY-0.05,0xC3C2BB,1);
    /* mushroom vents round the outer slope */
    [[0.86,-0.5],[0.86,-0.2],[0.86,0.15],[0.86,0.5],[0.84,-1.2],[0.84,-1.5],[0.84,-1.85],[0.8,-2.3],[0.82,-0.85],[0.7,0.3]].forEach(function(q){
      var p=domePt(q[0],q[1]), w=P(p[0],p[1]);
      lathe(M,w[0],w[1],[[0.5,p[2]-0.3],[0.5,p[2]+1.1],[0.85,p[2]+1.15],[0.85,p[2]+1.35],[0.2,p[2]+1.6],[0,p[2]+1.62]],8,0xE6E6E0,0.92);
    });
    /* boxy roof units at the north end */
    [[25,-92,4,3,1.6],[66,-90,5,3.5,1.8],[73,-30,3,3,1.4]].forEach(function(q){
      var y=domePt(0.93,Math.atan2((q[1]-DC[1])/DB,(q[0]-DC[0])/DA))[2];
      var r=box(q[0]-q[2]/2,q[0]+q[2]/2,q[1]-q[3]/2,q[1]+q[3]/2,y-1,y+q[4],0xD7D6D0,0.7); void r; });
  })();

  /* a turned solid: prof [[r,y]..] bottom to top */
  function lathe(Mx,cx,cz,prof,n,col,sh,shadeFn){
    for(var i=0;i<prof.length-1;i++){
      var r0=prof[i][0], y0=prof[i][1], r1=prof[i+1][0], y1=prof[i+1][1];
      for(var j=0;j<n;j++){
        var a0=2*PI*j/n, a1=2*PI*(j+1)/n, am=(a0+a1)/2;
        var A=[cx+Math.cos(a0)*r0,y0,cz+Math.sin(a0)*r0], Bp=[cx+Math.cos(a1)*r0,y0,cz+Math.sin(a1)*r0],
            C=[cx+Math.cos(a1)*r1,y1,cz+Math.sin(a1)*r1], D=[cx+Math.cos(a0)*r1,y1,cz+Math.sin(a0)*r1];
        var dy=y1-y0, dr=r1-r0, nn=[Math.cos(am)*dy,-dr,Math.sin(am)*dy];
        var s=(sh===undefined?1:sh)*(shadeFn?shadeFn(i,am):1);
        var c=rgb(col,s);
        if(r0>1e-4) otri(Mx,A,Bp,C,c,nn);
        if(r1>1e-4) otri(Mx,A,C,D,c,nn);
      }
    }
  }

  /* ================= dome pavilions ================= */
  function pavilion(u0,u1,v0,v1,steps,drumR,domeH){
    var half=(v0-v1)/2, cu=u0+half, cv=(v0+v1)/2;
    var r=box(u0,u1,v0,v1,0,24.0,STUC,0.72); solid(r,24.0);
    band(M,R(u0,u0+2*half,v0,v1),23.6,24.1,0.18,CAST,1,0.75);
    var y=24.0;
    steps.forEach(function(w,k){ var h=w/2;
      box(cu-h,cu+h,cv-h,cv+h,y,y+1.0,k%2?STUC:CASTL,0.72);
      band(M,R(cu-h,cu+h,cv-h,cv+h),y+0.85,y+1.0,0.08,CAST,1,0.8); y+=1.0; });
    var c=P(cu,cv), cx=c[0], cz=c[1], dH=4.6, NS=16, rot=PI/NS;
    /* the drum, with small arched windows all round */
    lathe(M,cx,cz,[[drumR,y],[drumR,y+dH]],NS,DRUM,0.9,function(i,a){ return 0.86+0.14*Math.cos(a-0.6); });
    for(var k=0;k<NS;k+=2){
      var am=2*PI*(k+0.5)/NS, nx=Math.cos(am), nz=Math.sin(am), rf=drumR*Math.cos(PI/NS)+0.04;
      var pts=roundPts(0,0.34,y+1.2,y+2.9,6);
      var cc=rgb(GLASS,1), n3=[nx,0,nz];
      var Wp=function(q){ return [cx+nx*rf-nz*q[0], q[1], cz+nz*rf+nx*q[0]]; };
      var O=Wp([0,y+2.2]);
      for(var q=0;q<pts.length;q++){ var a=pts[q], b=pts[(q+1)%pts.length]; otri(M,O,Wp(a),Wp(b),cc,n3); }
    }
    void rot;
    y+=dH;
    lathe(M,cx,cz,[[drumR+0.02,y-0.25],[drumR+0.3,y-0.1],[drumR+0.3,y+0.35],[drumR,y+0.5]],NS,CASTL,0.95);
    y+=0.5;
    /* the gold onion dome */
    var R0=drumR*1.02, prof=[[1,0],[1.09,0.1],[1.13,0.22],[1.1,0.34],[1.0,0.46],[0.84,0.58],[0.64,0.7],[0.42,0.81],[0.22,0.9],[0.08,0.97],[0.03,1]];
    var dp=prof.map(function(q){ return [q[0]*R0, y+q[1]*domeH]; });
    lathe(M,cx,cz,dp,24,GOLD,1,function(i,a){ return (i<1?0.95:1)*(0.9+0.1*Math.cos(a-0.5)); });
    y+=domeH;
    /* finial: knops on a stem, then the crescent */
    lathe(M,cx,cz,[[0.16,y-0.1],[0.16,y+0.5],[0.4,y+0.75],[0.16,y+1.05],[0.12,y+1.5],[0.3,y+1.7],[0.1,y+1.95],[0.08,y+2.5]],8,BRONZE,1);
    var yc=y+3.1, ro=0.7, ri=0.55, sx=-dv[0], sz=-dv[1];   /* the crescent faces Royal St (grid west) */
    var cr=rgb(0x6B5A3E,1);
    for(var m=0;m<14;m++){
      var b0=-PI*0.8+m*(1.6*PI)/14, b1=b0+(1.6*PI)/14;
      var pt=function(rr,b,off){ return [cx+Math.sin(b)*rr*dv[0], yc+off-Math.cos(b)*rr, cz+Math.sin(b)*rr*dv[1]]; };
      var A=pt(ro,b0,0), Bp=pt(ro,b1,0), C=pt(ri,b1,0.2), D=pt(ri,b0,0.2);
      M.quad(A,Bp,C,D,cr,cr,cr,cr); M.quad(D,C,Bp,A,cr,cr,cr,cr);
    }
    void sx; void sz;
    return {cu:cu,cv:cv,half:half,top:y+3.8};
  }
  var PS=pavilion(-4.2,9.6,-12.9,-26.7,[13.0,11.8,10.6],4.5,8.0);
  var PN=pavilion(-6.2,13.6,-80.5,-100.3,[17.8,15.4,13.2,11.0],4.6,8.2);

  /* pavilion faces: slits, small windows, tall arched windows, frieze, cornice */
  function pavFace(F,c,lo){
    [-0.9,0,0.9].forEach(function(o){ fq(F,c+o-0.16,c+o+0.16,15.4,17.9,0.04,GLASS,1); });
    if(lo){
      [-1.6,0,1.6].forEach(function(o){ fq(F,c+o-0.3,c+o+0.3,11.9,12.6,0.04,GLASS,1); });
      [-1.05,1.05].forEach(function(o){
        fpoly(F,roundPts(c+o,0.68,5.0,8.4,6),0.05,CASTL,0.95);
        fpoly(F,roundPts(c+o,0.52,5.1,8.4,6),0.08,GLASS,1);
        fq(F,c+o-0.55,c+o+0.55,1.4,3.6,0.05,GLASS,1);
        fb(F,c+o-0.7,c+o+0.7,0,0.18,1.25,1.4,CAST,0.8); });
    }
  }
  (function(){
    var Fs=Face(0,-4.2,-1); pavFace(Fs,-19.8,1);
    carve(Fs,-12.9,-26.7,13.0,14.6,0.2,1.6); cornice(Fs,-12.9,-26.7,20.3,0);
    var Fj=Face(1,-12.9,1); pavFace(Fj,2.7,0);
    carve(Fj,-4.2,9.6,13.0,14.6,0.2,1.6); cornice(Fj,-4.2,9.6,20.3,0);
    var Fn=Face(0,-6.2,-1); pavFace(Fn,-90.4,1);
    [-2.6,2.6].forEach(function(o){ fq(Fn,-90.4+o-0.16,-90.4+o+0.16,15.4,17.9,0.04,GLASS,1); });
    carve(Fn,-80.5,-100.3,13.0,14.6,0.2,1.6); cornice(Fn,-80.5,-100.3,20.3,0);
    var Fx=Face(1,-80.5,1); carve(Fx,-6.2,UR,13.0,14.6,0.2,1.6); cornice(Fx,-6.2,UR,20.3,0);
    var Fy=Face(1,VN,-1); pavFace(Fy,3.7,0); cornice(Fy,-6.2,13.6,20.3,0);
    var Fz=Face(1,-26.7,-1); carve(Fz,-4.2,UR,13.0,14.6,0.2,1.6); cornice(Fz,-4.2,UR,20.3,0);
  })();

  /* ================= the Royal St front: five great horseshoe arches ================= */
  (function(){
    var F=Face(0,UR,-1), pitch=(VA-VB)/5;
    var hw=3.4, yS=7.2, RR=3.65, yc=yS+Math.sqrt(RR*RR-hw*hw), j0=Math.asin((yc-yS)/RR);
    /* the low entrance plinth along the front */
    fb(F,VA,VB,0,1.3,0,0.18,CAST,0.8);
    for(var k=0;k<5;k++){
      var sc=VA-pitch*(k+0.5);
      /* the stained glass: horseshoe above the transom, fanned from the circle's centre */
      var loop=[[sc-hw,5.6],[sc+hw,5.6],[sc+hw,yS]], N=26, i;
      for(i=0;i<=N;i++){ var a=-j0+(PI+2*j0)*i/N; loop.push([sc+Math.cos(a)*RR, yc+Math.sin(a)*RR]); }
      loop.push([sc-hw,yS]);
      var Oc=F.W(sc,0.03,yc);
      for(i=0;i<loop.length;i++){ var p=loop[i], q=loop[(i+1)%loop.length];
        var mp=function(z){ return [(z[0]-sc)/(2*RR)+0.5,(z[1]-yc)/(2*RR)+0.5]; };
        ttri(GLP,GLU,Oc,F.W(p[0],0.03,p[1]),F.W(q[0],0.03,q[1]),[0.5,0.5],mp(p),mp(q),F.n); }
      /* transom, glazed band and the green doors */
      fq(F,sc-hw,sc+hw,5.25,5.6,0.05,BRONZE,1);
      fq(F,sc-hw,sc+hw,3.75,5.25,0.03,GLASS,1);
      for(var m=0;m<=6;m++){ var s=sc-hw+m*(2*hw/6); fq(F,s-0.06,s+0.06,3.75,5.25,0.05,DOOR,1); }
      fq(F,sc-hw,sc+hw,0.18,3.75,0.03,DOOR,0.9);
      for(m=0;m<=16;m++){ s=sc-hw+0.2+m*((2*hw-0.4)/16); fq(F,s-0.05,s+0.05,0.3,3.6,0.06,DOORL,1); }
      fq(F,sc-hw,sc+hw,3.55,3.75,0.06,DOORL,0.8);
      text(F,sc,0.09,4.0,'ENTRANCE',0.28,'#D9CFB0');
      /* colonnettes, bases and imposts each side */
      [-1,1].forEach(function(sd){
        var x=sc+sd*(hw+0.32);
        fb(F,x-0.42,x+0.42,0,0.62,0.18,0.95,CAST,0.75);
        fb(F,x-0.2,x+0.2,0.12,0.5,0.95,6.45,CASTL,0.78);
        fb(F,x-0.45,x+0.45,0,0.62,6.45,6.95,CAST,0.8);
        fb(F,x-0.32,x+0.32,0.05,0.52,6.25,6.45,CASTL,0.85);
        var x2=sc+sd*(hw+0.95);
        fb(F,x2-0.18,x2+0.18,0.05,0.4,0.95,6.45,CASTL,0.72);
      });
      /* the carved horseshoe surround, slightly pointed at the crown */
      var NB=22, ri=RR, ro=RR+0.78, prev=null, tF=0.5;
      for(i=0;i<=NB;i++){
        var a2=-j0-0.08+(PI+2*j0+0.16)*i/NB, lift=Math.max(0,1-Math.abs(a2-PI/2)/0.7)*0.32;
        var pi=[sc+Math.cos(a2)*ri, yc+Math.sin(a2)*ri+lift*0.8], po=[sc+Math.cos(a2)*ro, yc+Math.sin(a2)*ro+lift];
        if(prev){
          var u0=(i-1)/NB*6, u1=i/NB*6;
          ttri(CVP,CVU,F.W(prev[0][0],tF,prev[0][1]),F.W(pi[0],tF,pi[1]),F.W(po[0],tF,po[1]),[u0,0],[u1,0],[u1,1],F.n);
          ttri(CVP,CVU,F.W(prev[0][0],tF,prev[0][1]),F.W(po[0],tF,po[1]),F.W(prev[1][0],tF,prev[1][1]),[u0,0],[u1,1],[u0,1],F.n);
          q2(F.W(prev[0][0],0,prev[0][1]),F.W(pi[0],0,pi[1]),F.W(pi[0],tF,pi[1]),F.W(prev[0][0],tF,prev[0][1]),CASTD,0.8);
          q2(F.W(prev[1][0],0,prev[1][1]),F.W(po[0],0,po[1]),F.W(po[0],tF,po[1]),F.W(prev[1][0],tF,prev[1][1]),CAST,0.85);
        }
        prev=[pi,po];
      }
      /* the pier between this arch and the next: a shallow pilaster */
      if(k<4){ var sp=VA-pitch*(k+1); fb(F,sp-0.5,sp+0.5,0,0.2,0.18,12.7,STUCD,0.7); }
      /* potted plant at each pier foot */
      [sc-pitch/2,sc+pitch/2].forEach(function(s2){ var w=F.W(s2,1.0,0); lathe(M,w[0],w[2],[[0.22,0.18],[0.34,0.5],[0.36,0.85],[0.3,0.9]],8,POT,0.9); });
    }
    /* carved frieze, sill, the row of pointed windows, the cornice */
    fb(F,VA,VB,0,0.35,12.7,13.0,CAST,0.75);
    carve(F,VA,VB,13.0,14.6,0.3,1.6);
    oquad(M,F.W(VA,0,14.6),F.W(VB,0,14.6),F.W(VB,0.3,14.6),F.W(VA,0.3,14.6),CASTL,0.95,[0,1,0]);
    fb(F,VA,VB,0,0.4,14.6,14.95,CAST,0.78);
    var wp=pitch/4;
    for(var j=1;j<20;j++){
      var s=VA-j*wp, blind=(j%4===0);
      fpoly(F,ogeePts(s,1.0,14.95,18.1,1.95),0.06,CASTL,0.92);
      fpoly(F,ogeePts(s,0.8,15.05,18.1,1.62),0.1,blind?STUCD:GLASS,blind?0.88:1);
      if(!blind){ fq(F,s-0.03,s+0.03,15.05,19.2,0.12,GLASSL,1); fq(F,s-0.8,s+0.8,16.9,16.96,0.12,GLASSL,1); fq(F,s-0.8,s+0.8,18.1,18.16,0.12,GLASSL,1); }
      /* colonnettes between the windows */
      var sm=s+wp/2;
      fb(F,sm-0.13,sm+0.13,0.05,0.32,14.95,18.0,CASTL,0.75);
      fb(F,sm-0.24,sm+0.24,0.02,0.36,18.0,18.3,CAST,0.8);
    }
    var sm2=VA-19.5*wp; fb(F,sm2-0.13,sm2+0.13,0.05,0.32,14.95,18.0,CASTL,0.75);
    cornice(F,VA,VB,20.3,0);
  })();
  function text(F,s,t,y,str,hgt,col){ var p=F.W(s,t,y); facadeText(str,p[0],p[2],F.n[0],F.n[2],y,hgt*1024/96,hgt,col); }

  /* ================= the Jefferson wing ================= */
  function wingBay(F,c,door){
    if(door){
      fpoly(F,roundPts(c,1.75,0,3.6,10),0.04,CAST,0.92);
      fpoly(F,roundPts(c,1.45,0.05,3.6,10),0.07,0x23292E,1);
      for(var m=0;m<9;m++){ var s=c-1.3+m*(2.6/8); fq(F,s-0.04,s+0.04,0.1,3.6,0.1,DOOR,1); }
      fq(F,c-1.45,c+1.45,3.4,3.5,0.1,DOOR,1);
    } else {
      fq(F,c-1.62,c+1.62,0.7,5.6,0.02,STUCD,0.92);
      [-0.68,0.68].forEach(function(o){
        fpoly(F,roundPts(c+o,0.44,1.3,4.5,6),0.06,GLASS,1);
        fq(F,c+o-0.52,c+o+0.52,1.15,1.3,0.08,CAST,0.8); });
      fb(F,c-0.08,c+0.08,0.03,0.2,1.3,4.6,CASTL,0.75);
    }
    /* upper storey: a pair of round headed windows on a colonnette */
    [-0.62,0.62].forEach(function(o){
      fpoly(F,roundPts(c+o,0.58,7.05,9.6,6),0.04,CASTL,0.92);
      fpoly(F,roundPts(c+o,0.46,7.15,9.6,6),0.07,GLASS,1); });
    fb(F,c-0.1,c+0.1,0.03,0.22,7.05,9.6,CASTL,0.75);
    fb(F,c-0.95,c+0.95,0,0.22,6.85,7.05,CAST,0.8);
  }
  (function(){
    var F=Face(1,VJ,1), n=20, p=86/n;
    fb(F,-0.5,85.5,0,0.18,0,0.6,CASTD,0.75);
    for(var k=0;k<n;k++) wingBay(F,-0.5+p*(k+0.5),k>=17);
    fb(F,-0.5,85.5,0,0.3,6.1,6.5,CAST,0.78);
    cornice(F,-0.5,85.5,10.4,0);
    var Fw=Face(0,-0.5,-1);
    fb(Fw,VJ,-12.9,0,0.18,0,0.6,CASTD,0.75);
    [-4.0,-9.9].forEach(function(c){ wingBay(Fw,c,0); });
    fb(Fw,VJ,-12.9,0,0.3,6.1,6.5,CAST,0.78);
    cornice(Fw,VJ,-12.9,10.4,0);
    var Fe=Face(0,85.5,1); cornice(Fe,VJ,-12.9,10.4,0);
    /* steps up to the three east doorways */
    for(k=17;k<20;k++){ var c=-0.5+p*(k+0.5); fb(F,c-2.0,c+2.0,0,0.9,0,0.15,CAST,0.8); }
    /* raised blocks and units on the wing roof */
    var r1=box(38,56,-12.9,-8.6,HW,17.6,STUC,0.65); solid(r1,17.6);
    band(M,r1,17.3,17.8,0.12,CAST,1,0.75);
    var Fb=Face(1,-8.6,1); [41,44,47,50,53].forEach(function(c){ fpoly(Fb,roundPts(c,0.5,13.6,16.0,6),0.05,GLASS,1); });
    var r2=box(60.5,64.5,-12.9,-9.8,HW,16.2,STUC,0.65); solid(r2,16.2); band(M,r2,15.9,16.35,0.1,CAST,1,0.75);
    [[10,-6,3,2.2,1.4],[22,-8,2.4,2.4,1.2],[70,-7,3.2,2.4,1.5],[30,-4.5,2,1.6,1.0]].forEach(function(q){
      box(q[0]-q[2]/2,q[0]+q[2]/2,q[1]-q[3]/2,q[1]+q[3]/2,HW,HW+q[4],0xCFCCC4,0.7); });
  })();

  /* ================= the auditorium walls above the low parts ================= */
  (function(){
    var Fs=Face(1,-12.9,1);
    [28,47,66].forEach(function(c){ fpoly(Fs,roundPts(c,1.05,17.2,22.6,8),0.04,CASTL,0.9); fpoly(Fs,roundPts(c,0.85,17.3,22.6,8),0.07,GLASS,1); });
    [36,58].forEach(function(c){ [-0.5,0,0.5].forEach(function(o){ fq(Fs,c+o-0.12,c+o+0.12,21.0,23.2,0.04,GLASS,1); }); });
    /* thin downpipes */
    [19,74].forEach(function(c){ fb(Fs,c-0.08,c+0.08,0,0.16,HW,HM,STUCD,0.7); });
    var Fe=Face(0,85.5,1);
    [-30,-50,-66].forEach(function(c){ fpoly(Fe,roundPts(c,0.9,19.2,23.5,8),0.05,GLASS,1); });
    var Fr=Face(0,UM,-1);
    [-40,-53.6,-67].forEach(function(c){ fq(Fr,c-0.5,c+0.5,24.4,25.6,0.04,GLASS,1); });
  })();

  /* ================= the small domed tower on the south east corner ================= */
  (function(){
    var u0=80.4, u1=85.5, v0=-12.9, v1=-18.0, cu=(u0+u1)/2, cv=(v0+v1)/2;
    var r=box(u0,u1,v1,v0,HM,33.4,STUC,0.68); solid(r,33.4);
    band(M,r,33.3,33.75,0.15,CAST,1,0.75);
    [Face(1,v0,1),Face(0,u0,-1)].forEach(function(F,i){
      var c=i?cv:cu; fpoly(F,roundPts(c,0.75,30.2,32.2,6),0.04,GLASS,1); });
    var h=1.7; box(cu-h,cu+h,cv-h,cv+h,33.75,34.4,CASTL,0.75);
    var c=P(cu,cv);
    lathe(M,c[0],c[1],[[1.35,34.4],[1.35,35.4],[1.5,35.55]],12,DRUM,0.9);
    lathe(M,c[0],c[1],[[1.5,35.55],[1.62,35.9],[1.55,36.4],[1.25,36.9],[0.8,37.35],[0.35,37.7],[0.06,37.95]],12,GOLD,1);
    lathe(M,c[0],c[1],[[0.08,37.9],[0.08,38.7],[0.2,38.9],[0.05,39.2]],6,BRONZE,1);
  })();

  /* ================= the exhibition wing ================= */
  (function(){
    function expoFace(F,s0,s1,arc){
      var L=Math.abs(s1-s0), dir=s1>s0?1:-1, n=Math.max(1,Math.round(L/4.8)), p=L/n;
      for(var k=0;k<n;k++){ var c=s0+dir*p*(k+0.5);
        if(arc){ fpoly(F,roundPts(c,1.6,0,3.4,8),0.04,CAST,0.9); fpoly(F,roundPts(c,1.35,0,3.4,8),0.07,0x3A3631,1); }
        [7.4,11.4].forEach(function(y){ fq(F,c-0.65,c+0.65,y,y+1.7,0.04,GLASS,1); fb(F,c-0.8,c+0.8,0,0.15,y-0.18,y,CAST,0.78); });
      }
      fb(F,Math.min(s0,s1),Math.max(s0,s1),0,0.25,5.6,6.0,CAST,0.78);
    }
    expoFace(Face(0,-7.2,-1),-114.9,-167.9,1);
    expoFace(Face(0,0.1,-1),VN,-110,1);
    expoFace(Face(0,-3.9,-1),-110,-114.9,0);
    expoFace(Face(1,-172.5,-1),-4.1,79.7,0);
    expoFace(Face(0,79.7,1),-100.3,-172.5,0);
    /* the auditorium's north wall above it */
    var Fn=Face(1,VN,-1); [24,40,56,70].forEach(function(c){ fq(Fn,c-0.6,c+0.6,20.5,23.5,0.04,GLASS,1); });
  })();

  /* ================= flag pole on the front block roof ================= */
  (function(){
    var p=P(2.2,-33.5), x=p[0], z=p[1];
    lathe(M,x,z,[[0.11,HF],[0.07,34.0],[0.16,34.1],[0.16,34.35],[0,34.4]],6,0xD8D8D2,1);
    var y1=33.85, y0=y1-1.75, L=3.1, sv=-1, k;
    for(k=0;k<13;k++){
      var ya=y1-k*(1.75/13), yb=ya-1.75/13, col=k%2?0xF2F0EA:0xB22234;
      var A=V(2.2,-33.5+0.1*sv,ya), Bp=V(2.2,-33.5+(0.1+L)*sv,ya), C=V(2.2,-33.5+(0.1+L)*sv,yb), D=V(2.2,-33.5+0.1*sv,yb);
      void D; q2(A,Bp,C,V(2.2,-33.5+0.1*sv,yb),col,1);
    }
    var cy0=y1-1.75*7/13;
    q2(V(2.21,-33.6,y1),V(2.21,-33.6-1.25,y1),V(2.21,-33.6-1.25,cy0),V(2.21,-33.6,cy0),0x3C3B6E,1);
    void y0; void x; void z;
  })();

  /* ================= the SHRINE sign at the north end of the roof ================= */
  (function(){
    var vS=-95.2, u0=34, u1=57.5, y0=DY+3.4, y1=y0+4.0;
    /* steel frame behind */
    for(var u=u0+1;u<=u1-1;u+=3.9){ box(u-0.12,u+0.12,vS-0.5,vS-0.26,DY,y1-0.2,0x77736C,0.8); }
    box(u0,u1,vS-0.25,vS-0.05,y0,y1,0xE9E4D6,0.8);
    var cv=document.createElement('canvas'); cv.width=512; cv.height=96;
    var g=cv.getContext('2d');
    g.fillStyle='#F1EBDD'; g.fillRect(0,0,512,96);
    g.strokeStyle='#8C5A35'; g.lineWidth=5; g.strokeRect(5,5,502,86);
    g.fillStyle='#A0643A'; g.font='bold 76px Georgia,"Times New Roman",serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillText('S H R I N E',256,52,470);
    var tex=new T.CanvasTexture(cv); tex.anisotropy=4;
    var A=V(u0,vS,y0), Bp=V(u1,vS,y0), C=V(u1,vS,y1), D=V(u0,vS,y1), PA=[], UA=[], n=[dv[0],0,dv[1]];
    ttri(PA,UA,A,Bp,C,[0,0],[1,0],[1,1],n); ttri(PA,UA,A,C,D,[0,0],[1,1],[0,1],n);
    var gg=new T.BufferGeometry();
    gg.setAttribute('position',new T.Float32BufferAttribute(PA,3)); gg.setAttribute('uv',new T.Float32BufferAttribute(UA,2));
    gg.computeVertexNormals(); gg.computeBoundingSphere();
    var m=new T.Mesh(gg,new T.MeshLambertMaterial({map:tex})); m.frustumCulled=false; m.userData.noShadow=true; m.raycast=function(){}; scene.add(m);
  })();

  /* ================= paving: a 3 m band along the Jefferson and Royal St walls =================
     (the grounds file paves beyond it). Each wall run gets a strip 3 m out, run on 3 m past both ends
     and 1 m in under the wall, so the corners close; the overlaps are the same colour or hidden. */
  (function(){
    var PV=0xC8B2A6;
    flat(MG,R(-3.5,85.5,VJ-1.0,VJ+3.0),0.11,PV,1);
    [[-0.5,VJ,-12.9],[-4.2,-12.9,VA],[UR,VA,VB],[-6.2,VB,VN],[0.1,VN,-110],[-3.9,-110,-114.9],[-7.2,-114.9,-167.9],[-4.1,-167.9,-172.5]].forEach(function(q){
      flat(MG,R(q[0]-3.0,q[0]+1.0,q[1]+3.0,q[2]-3.0),0.11,PV,1); });
  })();

  /* ================= textures ================= */
  (function(){
    /* carved cast stone: interlaced roundels and lozenges */
    var cv=document.createElement('canvas'); cv.width=128; cv.height=64;
    var g=cv.getContext('2d');
    g.fillStyle='#E2D8C8'; g.fillRect(0,0,128,64);
    g.strokeStyle='#A69680'; g.lineWidth=3;
    g.strokeRect(1,3,126,58);
    for(var i=0;i<2;i++){ var x=32+i*64;
      g.beginPath(); g.arc(x,32,17,0,2*PI); g.stroke();
      g.beginPath(); g.moveTo(x,13); g.lineTo(x+19,32); g.lineTo(x,51); g.lineTo(x-19,32); g.closePath(); g.stroke();
      g.beginPath(); g.arc(x,32,6,0,2*PI); g.fillStyle='#B3A38C'; g.fill();
      g.beginPath(); g.moveTo(x+32,12); g.lineTo(x+32,52); g.stroke(); }
    g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(0,0,128,3);
    var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.anisotropy=4;
    var gg=new T.BufferGeometry();
    gg.setAttribute('position',new T.Float32BufferAttribute(CVP,3)); gg.setAttribute('uv',new T.Float32BufferAttribute(CVU,2));
    gg.computeVertexNormals(); gg.computeBoundingSphere();
    var m=new T.Mesh(gg,new T.MeshLambertMaterial({map:tex})); m.frustumCulled=false; m.castShadow=true; m.receiveShadow=true; m.raycast=function(){}; scene.add(m);

    /* geometric stained glass: hexagon and star lattice in a round rim */
    var c2=document.createElement('canvas'); c2.width=256; c2.height=256;
    var h=c2.getContext('2d');
    var gr=h.createLinearGradient(0,0,256,256); gr.addColorStop(0,'#5E7684'); gr.addColorStop(0.45,'#2D3B45'); gr.addColorStop(1,'#3E5462');
    h.fillStyle=gr; h.fillRect(0,0,256,256);
    h.strokeStyle='#CFCABB'; h.lineWidth=3.2;
    var r=26, s3=Math.sqrt(3);
    for(var a=-1;a<8;a++) for(var b=-1;b<8;b++){
      var cx=128+(a-3)*1.5*r, cy=128+(b-3)*s3*r+((a&1)?s3*r/2:0);
      h.beginPath(); for(var k=0;k<=6;k++){ var t=k*PI/3; var X=cx+Math.cos(t)*r, Y=cy+Math.sin(t)*r; if(k)h.lineTo(X,Y); else h.moveTo(X,Y); } h.stroke();
      h.beginPath(); for(k=0;k<=6;k++){ t=k*PI/3+PI/6; X=cx+Math.cos(t)*r*0.42; Y=cy+Math.sin(t)*r*0.42; if(k)h.lineTo(X,Y); else h.moveTo(X,Y); } h.stroke();
    }
    h.lineWidth=7; h.strokeStyle='#D8D2C2'; h.beginPath(); h.arc(128,128,124,0,2*PI); h.stroke();
    h.fillStyle='rgba(255,255,255,0.10)'; h.beginPath(); h.ellipse(90,80,70,40,-0.6,0,2*PI); h.fill();
    var t2=new T.CanvasTexture(c2); t2.anisotropy=4;
    var g2=new T.BufferGeometry();
    g2.setAttribute('position',new T.Float32BufferAttribute(GLP,3)); g2.setAttribute('uv',new T.Float32BufferAttribute(GLU,2));
    g2.computeVertexNormals(); g2.computeBoundingSphere();
    var m2=new T.Mesh(g2,new T.MeshLambertMaterial({map:t2})); m2.frustumCulled=false; m2.userData.noShadow=true; m2.raycast=function(){}; scene.add(m2);
  })();

  /* ================= build ================= */
  NO_PLANT.push(offsetRing(B.ring,0.5));
  B.h=35;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__shrine={tris:M.count()+MG.count()+CVP.length/9+GLP.length/9, domes:[PS.top,PN.top]};
})();
