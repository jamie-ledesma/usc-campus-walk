/* ==================================================================
   Ilium Residential College (USC Village Building 9, north half; the game
   label spells it "Illium"). Built with the Village kit VK (a2zm_village_kit.js).

   Building 9 (3131 S. Hoover St.) is the largest block in the Village and is
   shared with Cowlings Residential College, which is its south half (z > -609,
   Target and Trader Joe's are on that side). OSM tags Ilium as 5 levels: a
   tall retail / lobby ground floor and four floors of student apartments,
   built round a courtyard on the second floor podium.
   From USC Housing photos: red brick, a heavy cast stone band over the ground
   floor, a band under the third floor, a sill band under the top floor, a
   cornice under a tile hip roof; plain square windows in stone surrounds with
   arched windows on the top floor and small stone panels between some floors;
   slightly projecting brick corner pavilions; all-stone pavilions that rise
   above the eaves with corner pinnacles; stone oriel bays with paired lancets.
   The ground floor is a row of tall pointed arches (glazed shopfronts and
   pointed stone door portals) between stone pilasters. CorePower Yoga
   (Unit 9-D, entrance off Hoover) is on the Hoover side.

   Frame: footprint x 35..114 (west to east), z -652..-609 (north to south).
   Hoover St. runs north-south about 22 m east; the north side faces the
   Village's north service road; McCarthy Honors is across the lane west.
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='Illium Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M;
  var X0=35, X1=114, Z0=-652, Z1=-609;                 /* footprint */
  var CX0=48, CX1=101, CZ0=-639, CZ1=-620;             /* the second floor courtyard */
  var GF=5.6, FH=3.2, NF=4, EAVE=GF+NF*FH;             /* 18.4 m to the eaves */
  var RISE=4.6, PJ=0.45, SPJ=0.75, OV=0.5;             /* roof rise, pavilion and stone pavilion projection, eave overhang */

  function sAt(F,p){ return (p[0]-F.A[0])*F.t[0]+(p[1]-F.A[1])*F.t[1]; }
  function span(F,p,q){ var a=sAt(F,p), b=sAt(F,q); return a<b?[a,b]:[b,a]; }
  function cols(s0,s1,pitch){ var n=Math.max(1,Math.floor((s1-s0)/pitch+0.25)), w=(s1-s0)/n, out=[];
    for(var k=0;k<n;k++) out.push(s0+w*(k+0.5)); return out; }
  /* [s0,s1] minus a list of ranges */
  function freeRuns(s0,s1,cut){ var runs=[[s0,s1]];
    cut.forEach(function(c){ var nx=[]; runs.forEach(function(r){
      if(c[1]<=r[0]||c[0]>=r[1]){ nx.push(r); return; }
      if(c[0]>r[0]) nx.push([r[0],c[0]]); if(c[1]<r[1]) nx.push([c[1],r[1]]); }); runs=nx; });
    return runs; }
  /* a triangle on any Mesher, turned to face `want` */
  function tri(tgt,A,Bp,D,want,hex,k){
    var ux=Bp[0]-A[0],uy=Bp[1]-A[1],uz=Bp[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, c=rgb(hex,k===undefined?1:k);
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) tgt.tri(A,D,Bp,c,c,c); else tgt.tri(A,Bp,D,c,c,c);
  }
  /* a small stone pinnacle: square shaft and a pyramid cap */
  function pinnacle(p,y0,y1,w){
    postAt(M,p[0],p[1],y0,y1,w,C.CAST,0.7);
    var x=p[0], z=p[1], q=[[x-w*1.15,y1,z-w*1.15],[x+w*1.15,y1,z-w*1.15],[x+w*1.15,y1,z+w*1.15],[x-w*1.15,y1,z+w*1.15]], ap=[x,y1+w*5,z];
    postAt(M,x,z,y1-0.05,y1+0.12,w*1.25,C.CAST_D,0.8);
    for(var k=0;k<4;k++){ var a=q[k], b=q[(k+1)%4], mx=(a[0]+b[0])/2-x, mz=(a[2]+b[2])/2-z;
      tri(M,a,b,ap,[mx,0.6,mz],C.CAST_L,k%2?0.82:0.95); }
  }
  /* brick return wall (perpendicular to the face) at s, facing dir along s */
  function ret(F,s,d0,d1,y0,y1,dir){
    VK.quad(VK.MB,[F.p3(s,d0,y0),F.p3(s,d1,y0),F.p3(s,d1,y1),F.p3(s,d0,y1)],[F.t[0]*dir,0,F.t[1]*dir],0xFFFFFF,0.82,
      [[d0/2,y0],[d1/2,y0],[d1/2,y1],[d0/2,y1]]);
  }

  /* ---------------- shared facade pieces ---------------- */
  /* stone courses of a wall plane at d (from y0 up: plinth, podium band, floor band, top floor sill, cornice) */
  function courses(F,s0,s1,d,y0,proj){
    var p=proj||0;
    if(y0<0.1) F.block(s0,s1,d-0.2,d+0.12,0,0.62,C.CAST_D,0.75);
    if(y0<GF) F.block(s0,s1,d-0.2,d+0.2,GF-0.32,GF+0.3,C.CAST,0.68,C.CAST_L);
    F.block(s0,s1,d-0.2,d+0.09,GF+FH-0.12,GF+FH+0.12,C.CAST,0.7);
    F.block(s0,s1,d-0.2,d+0.08,EAVE-FH-0.2,EAVE-FH,C.CAST,0.7);
    F.block(s0-p,s1+p,d-0.2,d+OV+p,EAVE-0.6,EAVE-0.25,C.CAST,0.66,C.CAST_L);
    F.block(s0-p,s1+p,d-0.2,d+OV+p,EAVE-0.25,EAVE,C.CAST_L,0.8);
  }
  /* a stack of upper floor windows at column sc on the plane at d */
  function winStack(F,sc,d,panel){
    for(var f=0;f<NF;f++){ var b=GF+f*FH;
      if(f<NF-1) F.tile(TL.WIN,sc-1.0,sc+1.0,b+0.55,b+2.75,d+0.03);
      else F.tile(TL.WIN_ARCH,sc-1.0,sc+1.0,b+0.5,b+2.95,d+0.03);
      if(panel&&f===1) F.tile(TL.BLANK_STONE,sc-0.5,sc+0.5,b+2.8,b+3.7,d+0.025);
    }
  }
  /* ground floor: tall pointed arches between stone pilasters; doors in some bays */
  function arcade(F,s0,s1,d,doorAt,blankAt){
    var c=cols(s0,s1,4.8), n=c.length, w=(s1-s0)/n;
    c.forEach(function(sc,k){
      if(blankAt&&blankAt(k,n)){ F.block(sc-1.4,sc+1.4,d-0.1,d+0.06,0.62,4.3,C.CAST_L,0.8); F.tile(TL.LANCET,sc-1.5,sc+1.5,0.62,5.05,d+0.09); return; }
      F.tile(TL.GOTHIC,sc-1.9,sc+1.9,0.62,5.05,d+0.03);
      if(doorAt&&doorAt(k,n)) F.tile(TL.DOOR,sc-1.05,sc+1.05,0.62,3.25,d+0.07);
    });
    for(var k=0;k<=n;k++){ var s=s0+w*k; if(s-0.3<s0-0.01&&k>0) continue;
      F.block(Math.max(s0,s-0.3),Math.min(s1,s+0.3),d-0.1,d+0.2,0.62,GF-0.32,C.CAST,0.7); }
  }
  /* brick corner pavilion projecting PJ over [a,b]; ext extends the front round a building corner */
  function pavilion(F,a,b,extA,extB,L){
    var A=a-(extA?PJ:0), Bq=b+(extB?PJ:0);
    F.brick(A,Bq,0.62,EAVE,PJ);
    if(!extA) ret(F,a,0,PJ,0.62,EAVE,-1);
    if(!extB) ret(F,b,0,PJ,0.62,EAVE,1);
    courses(F,A,Bq,PJ,0,0);
    /* cast stone quoin strips at the pavilion edges */
    if(!extA) F.block(a,a+0.55,PJ-0.05,PJ+0.07,0.62,EAVE-0.6,C.CAST,0.75);
    else F.block(A,A+0.55,PJ-0.05,PJ+0.07,0.62,EAVE-0.6,C.CAST,0.75);
    if(!extB) F.block(b-0.55,b,PJ-0.05,PJ+0.07,0.62,EAVE-0.6,C.CAST,0.75);
    else F.block(Bq-0.55,Bq,PJ-0.05,PJ+0.07,0.62,EAVE-0.6,C.CAST,0.75);
    var c=cols(a+0.6,b-0.6,3.4);
    c.forEach(function(sc,k){ winStack(F,sc,PJ,k%2===0); });
    arcade(F,a+0.6,b-0.6,PJ,null,null);
  }
  /* all cast stone pavilion rising above the eaves with corner pinnacles */
  function stonePav(F,a,b,entry,label){
    var top=EAVE+2.5;
    F.block(a,b,-4.6,SPJ,0,top,C.CAST,0.74,C.ROOF_D);
    F.block(a-0.12,b+0.12,-4.6,SPJ+0.14,0,0.62,C.CAST_D,0.75);
    [GF,GF+FH,EAVE-FH].forEach(function(y){ F.block(a-0.06,b+0.06,SPJ-0.1,SPJ+0.08,y-0.2,y+0.14,C.CAST_D,0.78); });
    F.block(a-0.15,b+0.15,-4.7,SPJ+0.18,EAVE-0.55,EAVE,C.CAST_L,0.72);
    /* parapet coping round the front and sides of the flat top */
    F.block(a-0.12,b+0.12,SPJ-0.3,SPJ+0.14,top,top+0.55,C.CAST_D,0.75,C.CAST_L);
    F.block(a-0.12,a+0.2,-4.0,SPJ-0.3,top,top+0.55,C.CAST_D,0.75,C.CAST_L);
    F.block(b-0.2,b+0.12,-4.0,SPJ-0.3,top,top+0.55,C.CAST_D,0.75,C.CAST_L);
    /* paired lancets in each floor, a tall pointed window to the top floor */
    var mid=(a+b)/2, half=(b-a)/2, cw=Math.min(3.2,half-0.5);
    for(var f=0;f<NF;f++){ var by=GF+f*FH;
      if(f<NF-1){ F.tile(TL.ORIEL,mid-cw-0.15,mid-0.15,by+0.35,by+3.0,SPJ+0.03); F.tile(TL.ORIEL,mid+0.15,mid+cw+0.15,by+0.35,by+3.0,SPJ+0.03); }
      else { F.tile(TL.GOTHIC,mid-cw-0.1,mid-0.1,by+0.2,by+3.05,SPJ+0.03); F.tile(TL.GOTHIC,mid+0.1,mid+cw+0.1,by+0.2,by+3.05,SPJ+0.03); }
    }
    F.tile(TL.VENT_ARCH,mid-0.9,mid+0.9,EAVE+0.15,EAVE+2.25,SPJ+0.03);
    /* ground floor: a pointed portal */
    if(entry){ F.block(mid-2.5,mid+2.5,SPJ-0.02,SPJ+0.22,0.62,5.05,C.CAST_L,0.8); F.tile(TL.GOTHIC,mid-2.2,mid+2.2,0.62,4.35,SPJ+0.25); F.tile(TL.DOOR,mid-1.25,mid+1.25,0.62,2.95,SPJ+0.29); }
    else F.tile(TL.GOTHIC,mid-2.0,mid+2.0,0.62,5.0,SPJ+0.03);
    var pa=F.pt(a+0.3,SPJ-0.3), pb=F.pt(b-0.3,SPJ-0.3);
    pinnacle(pa,top,top+1.6,0.3); pinnacle(pb,top,top+1.6,0.3);
    if(label){ var lp=F.pt(mid,SPJ+0.22); facadeText(label,lp[0],lp[1],F.n[0],F.n[1],4.7,4.8,0.5,'#3A3029'); }
  }
  /* stone oriel bay (stacked lancet panels) with a stone gable over the eaves */
  function oriel(F,sc){
    var w=1.95;
    F.block(sc-1.7,sc+1.7,-0.1,0.8,GF-0.9,GF+0.32,C.CAST_D,0.7);
    F.block(sc-w,sc+w,-0.1,0.95,GF+0.32,EAVE,C.CAST,0.74,C.CAST_L);
    for(var f=0;f<NF;f++){ var by=GF+f*FH; F.tile(TL.ORIEL,sc-1.75,sc+1.75,by+0.4,by+3.05,0.98); }
    gable(F,sc-w-0.25,sc+w+0.25,EAVE,4.3,1.02,-4.2,C.CAST,true);
  }
  /* a gable over the eaves: front triangle at dF, back at dB, two roof slopes over it */
  function gable(F,s0,s1,y0,h,dF,dB,col,vent){
    var m=(s0+s1)/2, want=[F.n[0],0,F.n[1]], back=[-F.n[0],0,-F.n[1]];
    tri(M,F.p3(s0,dF,y0),F.p3(s1,dF,y0),F.p3(m,dF,y0+h),want,col,0.95);
    tri(M,F.p3(s0,dB,y0),F.p3(s1,dB,y0),F.p3(m,dB,y0+h),back,C.ROOF_D,0.8);
    var o=0.35, eY=y0-o*h/((s1-s0)/2);
    VK.quad(M,[F.p3(s0-o,dF+0.3,eY),F.p3(m,dF+0.3,y0+h+0.05),F.p3(m,dB,y0+h+0.05),F.p3(s0-o,dB,eY)],[-F.t[0],1,-F.t[1]],C.ROOF,0.9);
    VK.quad(M,[F.p3(s1+o,dF+0.3,eY),F.p3(m,dF+0.3,y0+h+0.05),F.p3(m,dB,y0+h+0.05),F.p3(s1+o,dB,eY)],[F.t[0],1,F.t[1]],C.ROOF,0.78);
    /* undersides of the verges */
    VK.quad(M,[F.p3(s0-o,dF+0.3,eY-0.02),F.p3(m,dF+0.3,y0+h-0.25),F.p3(m,dF-0.4,y0+h-0.25),F.p3(s0-o,dF-0.4,eY-0.02)],[0,-1,0],C.ROOF_D,0.5);
    VK.quad(M,[F.p3(s1+o,dF+0.3,eY-0.02),F.p3(m,dF+0.3,y0+h-0.25),F.p3(m,dF-0.4,y0+h-0.25),F.p3(s1+o,dF-0.4,eY-0.02)],[0,-1,0],C.ROOF_D,0.5);
    if(vent) F.tile(TL.VENT_ARCH,m-0.8,m+0.8,y0+0.35,y0+2.3,dF+0.03);
  }

  /* ---------------- an outer face ----------------
     o.pav: [[a,b,extA,extB],..] corner pavilions; o.stone: [[a,b,entry,label],..]; o.oriels: [sc,..];
     o.gf: false for a face with no ground floor (the side against Cowlings); o.doors(k,n); o.blank(k,n) */
  function outer(F,o){
    var L=F.L, y0=o.gf===false?GF:0.62;
    F.brick(0,L,y0,EAVE,0);
    courses(F,0,L,0,o.gf===false?GF:0,0);
    var cut=[];
    (o.pav||[]).forEach(function(p){ pavilion(F,p[0],p[1],p[2],p[3],L); cut.push([p[0]-0.3,p[1]+0.3]); });
    (o.stone||[]).forEach(function(p){ stonePav(F,p[0],p[1],p[2],p[3]); cut.push([p[0]-0.3,p[1]+0.3]); });
    var gcut=cut.slice();
    (o.oriels||[]).forEach(function(sc){ oriel(F,sc); cut.push([sc-2.4,sc+2.4]); });
    freeRuns(0.4,L-0.4,cut).forEach(function(r){ if(r[1]-r[0]<2.4) return;
      cols(r[0],r[1],3.4).forEach(function(sc,k){ winStack(F,sc,0,(k%3)===1); }); });
    if(o.gf!==false) freeRuns(0,L,gcut).forEach(function(r){ if(r[1]-r[0]<3.5) return; arcade(F,r[0]+0.1,r[1]-0.1,0,o.doors,o.blank); });
  }
  /* a courtyard face (seen from above and from the rooms opposite) */
  function court(F){
    var L=F.L;
    F.brick(0,L,GF+0.3,EAVE,0);
    F.block(0,L,-0.2,0.08,GF+FH-0.12,GF+FH+0.1,C.CAST,0.7);
    F.block(0,L,-0.2,OV,EAVE-0.45,EAVE,C.CAST,0.66,C.CAST_L);
    cols(1.5,L-1.5,3.6).forEach(function(sc){ winStack(F,sc,0,false); });
  }

  /* ---------------- the four outer faces ---------------- */
  var FN=VK.face([X0,Z0],[X1,Z0],[0,-1]);        /* north, to the service road */
  var FE=VK.face([X1,Z0],[X1,Z1],[1,0]);         /* east, Hoover St */
  var FW=VK.face([X0,Z0],[X0,Z1],[-1,0]);        /* west, the lane to McCarthy */
  var FS=VK.face([X0,Z1],[X1,Z1],[0,1]);         /* south, against Cowlings (upper floors only) */

  var nW=span(FN,[X0,Z0],[X0+8.5,Z0]), nE=span(FN,[X1-8.5,Z0],[X1,Z0]), nC=span(FN,[70,Z0],[79,Z0]);
  outer(FN,{pav:[[nW[0],nW[1],nW[0]<0.1,false],[nE[0],nE[1],false,nE[1]>FN.L-0.1]],
    stone:[[nC[0],nC[1],true,'ILIUM RESIDENTIAL COLLEGE']],
    oriels:[sAt(FN,[55.5,Z0]),sAt(FN,[93.5,Z0])],
    doors:function(k,n){ return k===1||k===n-2; }, blank:function(k,n){ return k===0; }});

  var eN=span(FE,[X1,Z0],[X1,Z0+8.5]), eC=span(FE,[X1,-635.5],[X1,-626]);
  outer(FE,{pav:[[eN[0],eN[1],eN[0]<0.1,eN[1]>FE.L-0.1]], stone:[[eC[0],eC[1],true,null]],
    doors:function(k,n){ return k===1; }});

  var wN=span(FW,[X0,Z0],[X0,Z0+8.5]);
  outer(FW,{pav:[[wN[0],wN[1],wN[0]<0.1,wN[1]>FW.L-0.1]], oriels:[sAt(FW,[X0,-628])],
    doors:function(k,n){ return k===n-1; }, blank:function(k,n){ return k===1; }});

  outer(FS,{gf:false});

  /* CorePower Yoga (Unit 9-D, entrance off Hoover), lettered on the stone band over the shopfronts south of the stone pavilion */
  (function(){ var p=FE.pt(sAt(FE,[X1,-617.5]),0.21); facadeText('COREPOWER YOGA',p[0],p[1],FE.n[0],FE.n[1],GF-0.01,7.0,0.5,'#2E2A26'); })();

  /* ---------------- courtyard on the podium ---------------- */
  [VK.face([CX0,CZ0],[CX1,CZ0],[0,1]), VK.face([CX0,CZ1],[CX1,CZ1],[0,-1]),
   VK.face([CX0,CZ0],[CX0,CZ1],[1,0]), VK.face([CX1,CZ0],[CX1,CZ1],[-1,0])].forEach(court);
  VK.pave([[CX0,CZ0],[CX1,CZ0],[CX1,CZ1],[CX0,CZ1]],GF+0.3,0.92);
  /* planters, lawn panels and a pergola strip in the courtyard */
  [[52,-636,64,-632],[85,-636,97,-632],[52,-627,64,-623],[85,-627,97,-623]].forEach(function(r){
    var g=[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]; if(ringArea(g)<0) g.reverse();
    prism(M,g,GF+0.3,GF+0.75,C.CAST,0x5E7F3E,0.75); });
  [[69,-633.5,80,-625.5]].forEach(function(r){
    var g=[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]; if(ringArea(g)<0) g.reverse();
    prism(M,g,GF+0.3,GF+0.36,0x6F8F49,0x6F8F49,0.9); });

  /* ---------------- the roof: one hipped ring over the four wings ---------------- */
  (function(){
    var Ro=[[X0-OV,Z0-OV],[X1+OV,Z0-OV],[X1+OV,Z1],[X0-OV,Z1]];                    /* outer eaves (flush on the Cowlings side) */
    var Rr=[[(X0+CX0)/2,(Z0+CZ0)/2],[(X1+CX1)/2,(Z0+CZ0)/2],[(X1+CX1)/2,(Z1+CZ1)/2],[(X0+CX0)/2,(Z1+CZ1)/2]];   /* ridge */
    var Ri=[[CX0+OV,CZ0+OV],[CX1-OV,CZ0+OV],[CX1-OV,CZ1-OV],[CX0+OV,CZ1-OV]];      /* courtyard eaves */
    var yR=EAVE+RISE, outN=[[0,-1],[1,0],[0,1],[-1,0]], sh=[0.78,0.92,1.0,0.86];
    for(var k=0;k<4;k++){ var j=(k+1)%4, n=outN[k];
      VK.quad(M,[[Ro[k][0],EAVE,Ro[k][1]],[Ro[j][0],EAVE,Ro[j][1]],[Rr[j][0],yR,Rr[j][1]],[Rr[k][0],yR,Rr[k][1]]],[n[0],1,n[1]],C.ROOF,sh[k]);
      VK.quad(M,[[Ri[k][0],EAVE,Ri[k][1]],[Ri[j][0],EAVE,Ri[j][1]],[Rr[j][0],yR,Rr[j][1]],[Rr[k][0],yR,Rr[k][1]]],[-n[0],1,-n[1]],C.ROOF,sh[(k+2)%4]);
      /* a darker ridge cap */
      segBox(M,Rr[k],Rr[j],yR-0.05,yR+0.16,0.32,C.ROOF_D,0.8);
    }
    /* a few small hipped dormers / vents on the street slopes */
    [[63.5,-649.4],[86,-649.4]].forEach(function(p){ var r=[[p[0]-1.2,p[1]-0.9],[p[0]+1.2,p[1]-0.9],[p[0]+1.2,p[1]+0.9],[p[0]-1.2,p[1]+0.9]];
      if(ringArea(r)<0) r.reverse();
      prism(M,r,EAVE+1.0,EAVE+3.0,C.CAST,C.CAST,0.75); hipRoof(M,offsetRing(r,0.25),EAVE+3.0,0.9,1.1,C.ROOF_D);
      VK.face([p[0]-1.2,p[1]-0.9],[p[0]+1.2,p[1]-0.9],[0,-1]).tile(TL.VENT_ARCH,0.5,1.9,EAVE+1.4,EAVE+2.9); });
  })();

  VK.collider([[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]],EAVE);
})();
