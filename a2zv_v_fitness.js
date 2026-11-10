/* ==================================================================
   USC Village Fitness Center (USC Village), built with the Village kit VK (a2zm_village_kit.js).
   The real gym (929 W. Jefferson Blvd, suite 1665, about 30,000 sq ft) is the
   double height ground floor of Cale Residential College on Jefferson. From the
   street it reads as tall glazed arches in cast stone surrounds set in red
   brick, with dark steel mullions, and a pointed arch entrance with a flat
   dark canopy carrying "USC VILLAGE FITNESS CENTER" letters and a red blade
   sign on the pier. This file builds that Jefferson frontage on the gym's own
   footprint as a two storey pavilion (stone belt course, brick frieze, dark
   tile hip roof). The facade stands 0.5 m proud of the footprint line so it
   stays visible however Cale meets it.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='USC Village Fitness Center') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, M=VK.M, TILE=VK.TILE;
  var R=B.ring;   /* (-61,-467) (-55,-477) (-42,-470) (-47,-460): R[0]->R[3] runs along Jefferson */

  /* frame: u along Jefferson, v out to the street (south) */
  var Fr=VK.frame(R[0],[R[3][0]-R[0][0],R[3][1]-R[0][1]]);
  var L=Math.hypot(R[3][0]-R[0][0],R[3][1]-R[0][1]);
  var D0=0.5, DW=0.38, DG=0.1;            /* pier face, brick face, glass plane (distance out from the footprint line) */
  var YS=5.8, YB=9.35, YT=10.8;          /* arch springing, belt course, eaves */
  var STEEL=0x34302C, GLASS_LO=0x8A8172, GLASS_MID=0x5D6B74, GLASS_HI=0x6F8494;

  var F=VK.face(Fr.P(0,0),Fr.P(L,0),Fr.dv);
  var OUT=F.want, TP=[F.t[0],0,F.t[1]], TN=[-F.t[0],0,-F.t[1]];

  /* ---------- small helpers on the Jefferson face ---------- */
  function cq(tgt,pts,want,cols){   /* quad with per-vertex colours, turned to face `want` */
    var A=pts[0],Bp=pts[1],D=pts[2];
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) tgt.quad(pts[0],pts[3],pts[2],pts[1],cols[0],cols[3],cols[2],cols[1]);
    else tgt.quad(pts[0],pts[1],pts[2],pts[3],cols[0],cols[1],cols[2],cols[3]);
  }
  function ctri(tgt,A,Bp,D,want,cols){
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) tgt.tri(A,D,Bp,cols[0],cols[2],cols[1]); else tgt.tri(A,Bp,D,cols[0],cols[1],cols[2]);
  }
  /* brick on any quad of the front face plane at d (uv in metres, like F.brick) */
  function brickQ(sy,d){ var p=sy.map(function(q){ return F.p3(q[0],d,q[1]); });
    VK.quad(VK.MB,p,OUT,0xFFFFFF,1,sy.map(function(q){ return [q[0]/2,q[1]]; })); }
  /* brick on a return (side) face at s, from d0 to d1, facing +t (dir 1) or -t (dir -1) */
  function brickRet(s,d0,d1,y0,y1,dir){ var p=[F.p3(s,d0,y0),F.p3(s,d1,y0),F.p3(s,d1,y1),F.p3(s,d0,y1)];
    VK.quad(VK.MB,p,dir>0?TP:TN,0xFFFFFF,0.86,[[d0/2,y0],[d1/2,y0],[d1/2,y1],[d0/2,y1]]); }
  function col(h,k){ return rgb(h,k===undefined?1:k); }

  /* arch curve over an opening [s0,s1] springing at ys, grown outward by e; pointed = two arcs of radius 0.75w */
  function arch(s0,s1,ys,pointed,e,n){
    var w=s1-s0, mid=(s0+s1)/2, pts=[], k, half=[];
    if(!pointed){ var r=w/2+e; for(k=0;k<=2*n;k++){ var a=Math.PI*(1-k/(2*n)); pts.push([mid+r*Math.cos(a), ys+r*Math.sin(a)]); } return pts; }
    var Rr=0.75*w, cL=s0+Rr, rr=Rr+e, ta=Math.acos((mid-cL)/rr);
    for(k=0;k<=n;k++){ var t=Math.PI+(ta-Math.PI)*k/n; half.push([cL+rr*Math.cos(t), ys+rr*Math.sin(t)]); }
    half[n]=[mid,half[n][1]];
    pts=half.slice(); for(k=n-1;k>=0;k--) pts.push([2*mid-half[k][0],half[k][1]]);
    return pts;
  }
  function archTop(s0,s1,ys,pointed,s){   /* height of the inner curve above s */
    var w=s1-s0, mid=(s0+s1)/2;
    if(!pointed){ var r=w/2; return ys+Math.sqrt(Math.max(0,r*r-(s-mid)*(s-mid))); }
    var Rr=0.75*w, c=s<=mid?s0+Rr:s1-Rr; return ys+Math.sqrt(Math.max(0,Rr*Rr-(s-c)*(s-c)));
  }

  /* one glazed arched opening: stone surround, brick spandrel, glass, steel mullions */
  function opening(s0,s1,pointed,entrance){
    var bw=0.32, n=pointed?7:9, inner=arch(s0,s1,YS,pointed,0,n), outer=arch(s0,s1,YS,pointed,bw,n), k, mid=(s0+s1)/2;
    var dF=D0+0.04, cS=col(C.CAST,1), cSd=col(C.CAST,0.74), cSs=col(C.CAST_D,0.66);
    for(k=0;k<inner.length-1;k++){
      var a=inner[k], b=inner[k+1], A=outer[k], Bq=outer[k+1];
      /* front of the stone ring */
      cq(M,[F.p3(a[0],dF,a[1]),F.p3(b[0],dF,b[1]),F.p3(Bq[0],dF,Bq[1]),F.p3(A[0],dF,A[1])],OUT,[cS,cS,cS,cS]);
      /* soffit (inner face of the arch, back to the glass) */
      var dir2=[mid-(a[0]+b[0])/2,YS-(a[1]+b[1])/2], wv=[F.t[0]*dir2[0],dir2[1],F.t[1]*dir2[0]];
      cq(M,[F.p3(a[0],DG,a[1]),F.p3(b[0],DG,b[1]),F.p3(b[0],dF,b[1]),F.p3(a[0],dF,a[1])],wv,[cSs,cSs,cSs,cSs]);
      /* outer edge, from the brick face out to the ring front */
      var dir3=[(A[0]+Bq[0])/2-mid,(A[1]+Bq[1])/2-YS]; var wo=[F.t[0]*dir3[0],dir3[1],F.t[1]*dir3[0]];
      cq(M,[F.p3(A[0],DW,A[1]),F.p3(Bq[0],DW,Bq[1]),F.p3(Bq[0],dF,Bq[1]),F.p3(A[0],dF,A[1])],wo,[cSd,cSd,cSd,cSd]);
      /* brick spandrel above the ring, up to the belt course */
      brickQ([[A[0],A[1]],[Bq[0],Bq[1]],[Bq[0],YB],[A[0],YB]],DW);
    }
    /* keystone on round arches */
    if(!pointed){ var ap=outer[n]; F.block(mid-0.24,mid+0.24,DW,dF+0.08,ap[1]-0.5,ap[1]+0.16,C.CAST_L,0.72); }
    /* glass: arch head as a fan, lower part as a rectangle, shaded darker upward (lit gym inside, sky glare above) */
    var gL=col(GLASS_LO), gM=col(GLASS_MID), gH=col(GLASS_HI), cen3=F.p3(mid,DG,YS);
    for(k=0;k<inner.length-1;k++) ctri(M,cen3,F.p3(inner[k][0],DG,inner[k][1]),F.p3(inner[k+1][0],DG,inner[k+1][1]),OUT,[gM,gH,gH]);
    if(!entrance){
      cq(M,[F.p3(s0,DG,0.45),F.p3(s1,DG,0.45),F.p3(s1,DG,YS),F.p3(s0,DG,YS)],OUT,[gL,gL,gM,gM]);
      /* the gym's ceiling lights and a dark equipment line seen through the glass */
      [4.1,5.0].forEach(function(y){ F.flat(s0+0.25,s1-0.25,y,y+0.07,DG+0.02,0xF3EBD6,1); });
      F.flat(s0+0.1,s1-0.1,0.45,1.25,DG+0.02,0x3A3634,1);
      F.block(s0,s1,DG-0.05,DG+0.12,0,0.45,STEEL,0.8);                      /* base rail */
    } else {
      cq(M,[F.p3(s0,DG,3.05),F.p3(s1,DG,3.05),F.p3(s1,DG,YS),F.p3(s0,DG,YS)],OUT,[gL,gL,gM,gM]);
    }
    /* steel mullions and transoms */
    var mt=0.07, md=DG+0.06;
    var verts=entrance?[s0+0.7,mid,s1-0.7]:[s0+(s1-s0)/3,s0+2*(s1-s0)/3];
    if(pointed&&!entrance) verts.push(mid);
    verts.forEach(function(s){ var top=archTop(s0,s1,YS,pointed,s); F.block(s-mt/2,s+mt/2,DG-0.02,md,entrance&&s===mid?3.05:0.45,top-0.02,STEEL,0.75); });
    [3.05,YS].forEach(function(y){ F.block(s0,s1,DG-0.02,md,y-mt/2,y+mt/2,STEEL,0.75); });
    if(!pointed) F.block(s0,s1,DG-0.02,md,YS+1.1,YS+1.1+mt,STEEL,0.75);
  }

  /* ---------- the Jefferson frontage ---------- */
  var PE=0.85, PW=0.9, OW=(L-2*PE-2*PW)/3;
  var O=[[PE,PE+OW],[PE+OW+PW,PE+2*OW+PW],[PE+2*OW+2*PW,L-PE]];
  /* end piers: brick, with returns to the footprint line and into the openings */
  [[0,PE,1],[L-PE,L,-1]].forEach(function(p){
    brickQ([[p[0],0.6],[p[1],0.6],[p[1],YB],[p[0],YB]],DW);
    var outerS=p[2]>0?p[0]:p[1], jambS=p[2]>0?p[1]:p[0];
    brickRet(outerS,0,DW,0,YT,-p[2]);          /* outer return, back to Cale */
    brickRet(jambS,DG,DW,0.6,YS,p[2]);           /* jamb into the opening */
    F.block(p[0]-(p[2]>0?0.02:0),p[1]+(p[2]<0?0.02:0),DG,DW+0.08,0,0.6,C.CAST,0.7);   /* stone plinth */
    F.block(jambS-0.2*p[2],jambS+0.06*p[2],DG,DW+0.1,YS-0.32,YS,C.CAST,0.72); /* impost */
  });
  /* cast stone piers between the arches, with plinth and impost capital */
  [[O[0][1],O[1][0]],[O[1][1],O[2][0]]].forEach(function(p){
    F.block(p[0],p[1],DG,D0,0.6,YS-0.34,C.CAST,0.72);
    F.block(p[0]-0.06,p[1]+0.06,DG,D0+0.1,0,0.6,C.CAST_D,0.7);
    F.block(p[0]-0.1,p[1]+0.1,DG,D0+0.14,YS-0.34,YS,C.CAST_L,0.72);
    /* brick between the two arch rings above the capital */
    brickQ([[p[0]+0.32,YS],[p[1]-0.32,YS],[p[1]-0.32,YB],[p[0]+0.32,YB]],DW);
  });
  opening(O[0][0],O[0][1],false,false);
  opening(O[1][0],O[1][1],true,true);
  opening(O[2][0],O[2][1],false,false);

  /* the entrance: glass double doors with sidelights under a flat dark canopy */
  (function(){
    var s0=O[1][0], s1=O[1][1], mid=(s0+s1)/2, gL=col(0xB3A487), gD=col(0x8C8A82);
    cq(M,[F.p3(s0,DG,0),F.p3(s1,DG,0),F.p3(s1,DG,3.05),F.p3(s0,DG,3.05)],OUT,[gL,gL,gD,gD]);
    F.block(s0,s1,DG-0.02,DG+0.1,0,0.06,STEEL,0.8);                       /* threshold */
    [mid-1.15,mid,mid+1.15].forEach(function(s){ F.block(s-0.05,s+0.05,DG-0.02,DG+0.1,0,3.05,STEEL,0.75); });
    F.block(mid-1.15,mid+1.15,DG-0.02,DG+0.1,2.55,2.65,STEEL,0.75);       /* door head */
    [mid-0.2,mid+0.2].forEach(function(s){ F.block(s-0.025,s+0.025,DG+0.1,DG+0.16,0.9,1.9,0xB9A57E,0.8); });  /* pulls */
    /* door crests (the shield etched on the glass): small pale panels */
    [mid-0.58,mid+0.58].forEach(function(s){ F.flat(s-0.17,s+0.17,1.4,1.8,DG+0.02,0xB8BCBC,0.9); });
    /* canopy: a flat dark steel plate with a lighter soffit */
    var c0=mid-1.75, c1=mid+1.75, cd=DG+1.65;
    F.block(c0,c1,DG,cd,3.06,3.38,0x46413C,0.85,0x3B3734);
    F.under(c0,c1,DG,cd,3.055,0x6E675F);
    [mid-0.9,mid+0.9].forEach(function(s){ F.under(s-0.12,s+0.12,cd-0.75,cd-0.51,3.035,0xF6EBCF); });  /* downlights */
    /* two hanger rods from the canopy's front corners back up to the wall */
    [c0+0.15,c1-0.15].forEach(function(s){ var a=F.p3(s,cd-0.08,3.38), b=F.p3(s,DW,4.95), cR=col(0x2A2724);
      var e=0.025, ex=[F.t[0]*e,0,F.t[1]*e];
      cq(M,[[a[0]-ex[0],a[1],a[2]-ex[2]],[a[0]+ex[0],a[1],a[2]+ex[2]],[b[0]+ex[0],b[1],b[2]+ex[2]],[b[0]-ex[0],b[1],b[2]-ex[2]]],[F.n[0],0.6,F.n[1]],[cR,cR,cR,cR]); });
    /* letters on the canopy (white, two lines, like the real sign) */
    var p1=F.pt(mid,cd+0.02);       /* at the canopy's front edge, clear of the piers */
    facadeText('USC VILLAGE',p1[0],p1[1],F.n[0],F.n[1],4.06,3.4,0.6,'#F4F2EC');
    facadeText('FITNESS CENTER',p1[0],p1[1],F.n[0],F.n[1],3.62,3.4,0.6,'#F4F2EC');
    /* thin dark backing bars the letters stand on */
    F.block(mid-1.45,mid+1.45,cd-0.32,cd-0.26,3.34,3.36,0x1E1B19,0.8);
  })();
  /* brick paved landing from the doors out to the Jefferson sidewalk */
  (function(){ var m=(O[1][0]+O[1][1])/2, r=F.ring(m-1.9,m+1.9,DG,DG+3.4);
    prism(M,r,0,0.06,C.PAVE_D,C.PAVE,0.8); VK.pave(r,0.062); })();
  /* red round blade sign on the pier left of the entrance (as seen from the street) */
  (function(){
    var s=(O[0][1]+O[1][0])/2, y=4.9, cr=0.38, n=10, cR=col(0x9D2235), cRd=col(0x7A1A29), cW=col(0xF3E9D2);
    F.block(s-0.03,s+0.03,D0,D0+0.28,y+0.3,y+0.36,STEEL,0.8);          /* bracket */
    var dc=D0+0.28+cr;
    for(var k=0;k<n;k++){ var a0=k/n*Math.PI*2, a1=(k+1)/n*Math.PI*2;
      var P0=F.p3(s,dc+Math.cos(a0)*cr,y+Math.sin(a0)*cr), P1=F.p3(s,dc+Math.cos(a1)*cr,y+Math.sin(a1)*cr);
      var Pc=F.p3(s+0.06,dc,y), Pc2=F.p3(s-0.06,dc,y);
      var Q0=F.p3(s+0.06,dc+Math.cos(a0)*cr,y+Math.sin(a0)*cr), Q1=F.p3(s+0.06,dc+Math.cos(a1)*cr,y+Math.sin(a1)*cr);
      var R0=F.p3(s-0.06,dc+Math.cos(a0)*cr,y+Math.sin(a0)*cr), R1=F.p3(s-0.06,dc+Math.cos(a1)*cr,y+Math.sin(a1)*cr);
      ctri(M,Pc,Q0,Q1,TP,[cR,cR,cR]); ctri(M,Pc2,R0,R1,TN,[cR,cR,cR]);
      var mo=[Math.cos((a0+a1)/2)*F.n[0],Math.sin((a0+a1)/2),Math.cos((a0+a1)/2)*F.n[1]];
      cq(M,[Q0,Q1,R1,R0],mo,[cRd,cRd,cRd,cRd]);
    }
    /* a pale shield on both faces */
    [[0.065,TP],[-0.065,TN]].forEach(function(f){ cq(M,[F.p3(s+f[0],dc-0.13,y-0.16),F.p3(s+f[0],dc+0.13,y-0.16),F.p3(s+f[0],dc+0.13,y+0.16),F.p3(s+f[0],dc-0.13,y+0.16)],f[1],[cW,cW,cW,cW]); });
  })();

  /* belt course, brick frieze with small square vents, and the frieze over the whole front */
  F.block(-0.02,L+0.02,DW-0.02,D0+0.16,YB-0.05,YB+0.42,C.CAST,0.7,C.CAST_L);
  brickQ([[0,YB+0.42],[L,YB+0.42],[L,YT],[0,YT]],DW);
  O.forEach(function(o){ var m=(o[0]+o[1])/2; F.tile(TILE.BLANK_STONE,m-0.45,m+0.45,YB+0.55,YT-0.12,DW+0.04); });

  /* ---------- the other three walls (they meet Cale): plain brick with the belt course ---------- */
  var ring=R.slice(); if(ringArea(ring)<0) ring.reverse();
  for(i=0;i<ring.length;i++){
    var a=ring[i], b=ring[(i+1)%ring.length];
    var la=Fr.loc(a), lb=Fr.loc(b);
    if(Math.abs(la[1])<0.3&&Math.abs(lb[1])<0.3) continue;      /* the Jefferson edge is done above */
    var W=VK.face(a,b,null), Lw=W.L;
    W.brick(0,Lw,0,YT,0);
    W.block(0,Lw,-0.05,0.12,YB-0.05,YB+0.42,C.CAST,0.7);
    W.block(0,Lw,-0.05,0.08,0,0.6,C.CAST_D,0.7);
  }

  /* ---------- roof: low dark tile hip with the stone cornice ---------- */
  var rr=[R[0],R[1],R[2],R[3]].map(function(p,k){ return k===0||k===3?[p[0]+Fr.dv[0]*D0,p[1]+Fr.dv[1]*D0]:p; });
  if(ringArea(rr)<0) rr.reverse();
  VK.roof(rr,YT,3.0,0.4);

  /* ---------- collision ---------- */
  var cr=[R[0],R[1],R[2],R[3]].map(function(p,k){ return k===0||k===3?[p[0]+Fr.dv[0]*(D0+0.1),p[1]+Fr.dv[1]*(D0+0.1)]:p; });
  if(ringArea(cr)<0) cr.reverse();
  VK.collider(cr,YT+1);
})();
