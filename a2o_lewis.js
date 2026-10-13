/* ==================================================================
   Ralph and Goldy Lewis Hall (RGL), home of the USC Price School of
   Public Policy, 650 Childs Way (built 1995-97). a_world.js leaves the
   footprint empty (HAND_HALLS).

   A long three storey brick block on the campus grid, under a red
   clay tile hip roof, with a raised lantern of small arched windows on
   the roof. The north front faces Childs Way: a shallow projecting
   centre block, three storeys under its own tile roof, carries a cast
   stone entrance pavilion two storeys tall (two round columns, glass
   between, RALPH AND GOLDY LEWIS HALL cut in the entablature). Its top
   is a balcony with slender cypress in planters in front of the third
   floor. Cream stone bands run round at the floor lines and under the
   eave. A brick walk with a concrete centre leads up from Childs Way
   past a row of cast stone bollards, between hedges and lamp posts.

   Footprint from OpenStreetMap (way 406923981, 4 levels, 16.4 m),
   shifted onto this map the same way as its neighbours. Everything is
   laid out in grid coordinates: u runs grid east along the long side,
   v runs grid north, out of the front.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Lewis Hall') B=CAMPUS[bi];
  if(!B) return;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var A=27.6*Math.PI/180, EX=Math.cos(A), EZ=Math.sin(A), NX=Math.sin(A), NZ=-Math.cos(A);
  function W(u,v){ return [u*EX+v*NX, u*EZ+v*NZ]; }
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function rect(u0,u1,v0,v1){ return ccw([W(u0,v0),W(u1,v0),W(u1,v1),W(u0,v1)]); }
  function solid(r,h){ cols.push([r,h]); }
  /* a wall frame: centre (u,v) in grid terms, outward normal along grid (ou,ov) */
  function frame(u,v,ou,ov,L){
    var c=W(u,v), nx=ou*EX+ov*NX, nz=ou*EZ+ov*NZ;
    return {x:c[0],z:c[1],dx:-nz,dz:nx,nx:nx,nz:nz,L:L};
  }

  var BRICK=0xA9563E, BRICKD=0x8E4733, CAST=0xDCD2BB, CASTD=0xC2B79E, CREAM=0xE6DCC6,
      TILE=0xB0563A, TILED=0x8A3F28, GLASS=0x2C3841, GLASSL=0x4A5F6E, RED=0x7E2C22,
      DARK=0x23292E, GREEN=0x2F5A2A, CYP=0x2A4A26;
  var H=11.2, EAVE=11.45;
  /* the main block, the projecting centre block and the entrance pavilion (grid coords) */
  var U0=189.9, U1=247.6, VS=-62.2, VN=-41.8;
  var PC=211.3, PW=11.9, VP=-37.2;        /* centre block: u PC+-PW, v VN..VP */
  var EW=6.0, ED=2.6;                     /* pavilion: u PC+-EW, v VP..VP+ED */

  var main=rect(U0,U1,VS,VN), wing=rect(PC-PW,PC+PW,VN-0.3,VP);
  [[main,H],[wing,H]].forEach(function(m){
    var r=m[0];
    prism(M,r,0,H,BRICK,0x8F8A80,0.55); solid(r,EAVE+1.5);
    band(M,r,0,0.75,0.14,CASTD,0.95,0.7,true);
    band(M,r,3.85,4.05,0.08,CREAM,1,0.75,true);
    band(M,r,7.55,7.85,0.12,CREAM,1,0.78,true);
    band(M,r,10.55,H,0.1,CREAM,1,0.8,true);
    band(M,r,10.4,10.55,0.05,CASTD,0.9,0.7,true);
  });
  /* tile roofs: the long main roof, the cross roof over the centre block */
  var er=offsetRing(main,0.85);
  band(M,er,H,EAVE,0,TILED,0.85,0.55);
  hipRoof(M,er,EAVE,2.7,4.8,TILE);
  var ew=ccw([W(PC-PW,-49),W(PC+PW,-49),W(PC+PW,VP),W(PC-PW,VP)]); ew=offsetRing(ew,0.85);
  band(M,ew,H,EAVE,0,TILED,0.85,0.55);
  hipRoof(M,ew,EAVE,1.6,2.9,TILE);
  /* the raised lantern: a ring of small arched windows under its own hip roof */
  var LU=207.0, LV=-48.6, LW=6.2, LD=4.0, LB=13.2, LT=17.8;
  var lan=rect(LU-LW,LU+LW,LV-LD,LV+LD);
  prism(M,lan,LB,LT,BRICK,BRICK,0.6);
  band(M,lan,LT-0.4,LT,0.08,CREAM,1,0.8,true);
  band(M,lan,15.1,15.35,0.06,CREAM,0.95,0.75,true);
  [[0,1,LW,LD],[0,-1,LW,LD],[1,0,LD,LW],[-1,0,LD,LW]].forEach(function(s){
    var F=frame(LU+s[0]*s[3],LV+s[1]*s[3],s[0],s[1],s[2]*2), K=wallKit(M,F), n=s[1]?5:3;
    for(var k=0;k<n;k++){ var u=-s[2]+(k+0.5)*(2*s[2]/n);
      K.face(u,0.05,15.5,1.15,1.0,0.57,CREAM,1); K.face(u,0.08,15.6,0.86,0.95,0.43,GLASSL,1); }
  });
  var lr=offsetRing(lan,0.55); band(M,lr,LT,LT+0.2,0,TILED,0.85,0.55); hipRoof(M,lr,LT+0.2,1.7,2.4,TILE);

  /* ---------- windows ---------- */
  function win1(K,u){ K.face(u,0.04,0.95,2.0,2.45,0,CAST,1); K.face(u,0.07,1.05,1.7,2.25,0,GLASS,1);
    K.face(u,0.09,1.05,0.08,2.25,0,CREAM,0.95); K.face(u,0.06,0.85,2.2,0.16,0,CREAM,1); }
  function win2(K,u){ K.face(u,0.04,4.6,2.0,2.4,0,CREAM,1); K.face(u,0.07,4.7,1.72,2.2,0,GLASS,1);
    K.face(u,0.09,4.7,0.08,2.2,0,CREAM,0.95); K.face(u,0.09,6.15,1.72,0.07,0,CREAM,0.95); }
  function win3(K,u,w){ w=w||2.3;
    K.face(u,0.04,8.25,w+0.3,2.05,0,CREAM,1); K.face(u,0.07,8.35,w,1.85,0,GLASS,1);
    [-w/2+0.05,-w/6,w/6,w/2-0.05].forEach(function(o){ K.face(u+o,0.09,8.35,0.09,1.85,0,RED,1); });
    K.face(u,0.09,9.6,w,0.08,0,RED,1); K.face(u,0.09,8.35,w,0.08,0,RED,1); K.face(u,0.09,10.12,w,0.08,0,RED,1);
    K.face(u,0.06,8.12,w+0.5,0.16,0,CAST,1); }
  /* a run of window bays on a wall, leaving out [a,b] spans in skip */
  function rows(F,pitch,skip,f1,door){
    var K=wallKit(M,F), n=Math.max(1,Math.round((F.L-2.4)/pitch)), p=(F.L-2.4)/n;
    for(var k=0;k<n;k++){
      var u=-F.L/2+1.2+(k+0.5)*p, bad=false;
      (skip||[]).forEach(function(s){ if(u>s[0]-1.4&&u<s[1]+1.4) bad=true; });
      if(bad) continue;
      if(door!==undefined&&k===door){
        K.face(u,0.04,0,2.8,3.3,0,CAST,1); K.face(u,0.08,0,2.2,3.0,0,DARK,1); K.face(u,0.1,0,0.08,3.0,0,CAST,0.9);
      } else if(f1!==false) win1(K,u);
      win2(K,u); win3(K,u);
      /* a brick pier between bays, a shade proud of the wall */
      if(k<n-1){ var ub=u+p/2; K.box(ub-0.3,ub+0.3,-0.05,0.12,0.75,10.4,BRICKD,0.62); }
    }
    return K;
  }
  var PU=PC-(U0+U1)/2;     /* centre block's u on the north wall frame */
  rows(frame((U0+U1)/2,VN,0,1,U1-U0),3.9,[[PU-PW,PU+PW]]);
  rows(frame((U0+U1)/2,VS,0,-1,U1-U0),3.9,[],true,7);
  rows(frame(U1,(VS+VN)/2,1,0,VN-VS),3.9,[],true,2);
  rows(frame(U0,(VS+VN)/2,-1,0,VN-VS),3.9,[]);
  rows(frame(PC+PW,(VN+VP)/2,1,0,VP-VN),3.0,[]);
  rows(frame(PC-PW,(VN+VP)/2,-1,0,VP-VN),3.0,[]);
  /* the centre block's front: a bay of windows each side of the pavilion, third floor right across */
  var FC=frame(PC,VP,0,1,PW*2), KC=wallKit(M,FC);
  [-PW+2.9,PW-2.9].forEach(function(u){ win1(KC,u); win2(KC,u); });
  [-9.0,-4.5,0,4.5,9.0].forEach(function(u){ win3(KC,u,2.6); });

  /* ---------- the entrance pavilion ---------- */
  var KP=wallKit(M,FC), PT=8.0, ENT=6.7, REC=1.5;
  /* outer piers, solid cast stone, a dark door in each */
  [-1,1].forEach(function(s){
    var r=KP.box(s>0?EW-1.0:-EW,s>0?EW:-EW+1.0,-0.1,ED,0,ENT,CAST,0.68); solid(r,PT);
    var r2=KP.box(s>0?1.9:-4.95,s>0?4.95:-1.9,-0.1,ED-REC,0,ENT,CAST,0.68); solid(r2,PT);
  });
  /* the entablature with the name, and the base */
  KP.box(-EW-0.15,EW+0.15,-0.1,ED+0.15,ENT,ENT+0.25,CASTD,0.7);
  KP.box(-EW,EW,-0.1,ED,ENT+0.25,PT-0.3,CAST,0.72);
  KP.box(-EW-0.2,EW+0.2,-0.1,ED+0.22,PT-0.3,PT,CREAM,0.75);
  KP.box(-EW-0.1,EW+0.1,-0.1,ED+0.1,0,0.35,CASTD,0.7);
  var nm=KP.P(0,ED); facadeText('RALPH AND GOLDY LEWIS HALL',nm[0],nm[1],FC.nx,FC.nz,7.33,10.4,0.62,'#6E6553');
  /* the recessed bays: glass above, stone and a dark door below at the sides, glass doors in the middle */
  var gv=ED-REC+0.02;
  [-1,1].forEach(function(s){ var u=s*3.42;
    KP.face(u,gv,4.3,2.6,2.2,0,GLASS,1); KP.face(u,gv+0.02,4.3,0.08,2.2,0,CAST,0.9);
    KP.face(u,gv+0.02,4.1,2.7,0.2,0,CAST,1);
    KP.face(u,gv,0,1.3,2.7,0,DARK,1); });
  var gc=ED-REC-0.4;
  KP.face(0,gc,0,3.8,6.5,0,GLASS,1);
  KP.face(0,gc+0.02,2.95,3.8,1.0,0,DARK,0.9);
  [-1.9,-0.95,0,0.95,1.9].forEach(function(o){ KP.face(o,gc+0.04,0,0.09,6.5,0,0x3A3A36,1); });
  [2.95,3.95].forEach(function(y){ KP.face(0,gc+0.04,y,3.8,0.08,0,0x3A3A36,1); });
  facadeText('USC PRICE SCHOOL OF PUBLIC POLICY',KP.P(0,gc+0.05)[0],KP.P(0,gc+0.05)[1],FC.nx,FC.nz,3.45,3.3,0.3,'#E8E2D2');
  /* porch floor and soffit */
  var pf=ccw([KP.P(-4.95,gc),KP.P(4.95,gc),KP.P(4.95,ED),KP.P(-4.95,ED)]);
  prism(M,pf,0,0.12,CASTD,0xC9C1AE,0.7);
  var sof=ccw([KP.P(-4.95,gc),KP.P(4.95,gc),KP.P(4.95,ED),KP.P(-4.95,ED)]);
  var sf=triangulate(sof), cs=rgb(CAST,0.7);
  for(var i=0;i<sf.length;i++){ var a=sof[sf[i][0]],b=sof[sf[i][1]],c=sof[sf[i][2]];
    M.tri([a[0],ENT,a[1]],[b[0],ENT,b[1]],[c[0],ENT,c[1]],cs,cs,cs); }
  /* the two round columns */
  [-1.9,1.9].forEach(function(u){ var p=KP.P(u,ED-0.5);
    prism(M,ccw(ngon(p[0],p[1],0.52,12,0)),0,0.45,CAST,CAST,0.7);
    prism(M,ccw(ngon(p[0],p[1],0.38,12,0)),0.45,ENT-0.4,CAST,CAST,0.62);
    prism(M,ccw(ngon(p[0],p[1],0.52,12,0)),ENT-0.4,ENT,CAST,CAST,0.75);
    cols.push([ccw(ngon(p[0],p[1],0.45,8,0)),ENT]); });
  /* back wall of the porch is solid for walking */
  solid(ccw([KP.P(-4.95,-0.1),KP.P(4.95,-0.1),KP.P(4.95,gc),KP.P(-4.95,gc)]),PT);

  /* ---------- the third floor balcony with its cypress ---------- */
  var BD=1.25;
  KC.box(-PW,-EW,0,BD,7.5,7.85,CREAM,0.75); KC.box(EW,PW,0,BD,7.5,7.85,CREAM,0.75);
  var rail=function(u0,v0,u1,v1){ var a=KC.P(u0,v0), b=KC.P(u1,v1);
    segBox(M,a,b,8.75,8.85,0.1,CREAM,0.8); segBox(M,a,b,PT,8.1,0.12,CREAM,0.75);
    var L=Math.hypot(u1-u0,v1-v0), n=Math.max(1,Math.round(L/0.35));
    for(var k=0;k<=n;k++){ var t=k/n, q=KC.P(u0+(u1-u0)*t,v0+(v1-v0)*t); postAt(M,q[0],q[1],7.85,8.75,0.025,CREAM,0.75); } };
  rail(-PW,BD-0.08,-EW,BD-0.08); rail(EW,BD-0.08,PW,BD-0.08);
  rail(-EW,ED+0.05,EW,ED+0.05); rail(-EW,BD-0.08,-EW,ED+0.05); rail(EW,BD-0.08,EW,ED+0.05);
  [-9.4,-5.6,-1.9,1.9,5.6,9.4].forEach(function(u){
    var v=Math.abs(u)<EW?ED-0.55:BD-0.5, p=KC.P(u,v), y0=Math.abs(u)<EW?PT:7.85;
    prism(M,ccw(ngon(p[0],p[1],0.36,4,Math.PI/4+A)),y0,y0+0.55,CAST,CREAM,0.7);
    coneRoof(M,p[0],p[1],0.34,y0+0.55,3.1,CYP,7);
  });

  /* ---------- the walk up from Childs Way ---------- */
  var VW=-23.6, V1=VP+ED;           /* Childs Way walk centre line, pavilion front */
  var walk=rect(PC-3.4,PC+3.4,V1,VW), band2=rect(PC-1.35,PC+1.35,V1,VW);
  flat(MG,walk,0.112,0x9C4E3A,0.96);
  flat(MG,band2,0.138,0xC9C3B5,1);
  /* the forecourt, a little wider, right at the doors */
  flat(MG,rect(PC-EW-1.2,PC+EW+1.2,V1,V1+3.2),0.116,0x9C4E3A,0.96);
  /* cast stone bollards across the walk */
  [-3.0,-1.8,-0.6,0.6,1.8,3.0].forEach(function(o){
    var p=W(PC+o,V1+4.2), r=ccw(ngon(p[0],p[1],0.2,8,0));
    prism(M,r,0,0.75,CAST,CAST,0.65);
    prism(M,ccw(ngon(p[0],p[1],0.26,8,0)),0.75,0.88,CASTD,CREAM,0.7);
    prism(M,ccw(ngon(p[0],p[1],0.14,8,0)),0.88,1.05,DARK,DARK,0.7);
    cols.push([ccw(ngon(p[0],p[1],0.22,6,0)),1.0]); });
  /* clipped hedges along the front, a brick planter with a cream cap at the street end */
  var hedge=function(u0,u1,v0,v1,h){ var r=rect(u0,u1,v0,v1); prism(M,r,0,h,GREEN,0x3B6C33,0.6); solid(r,h); };
  hedge(PC-PW+0.4,PC-EW-1.4,V1-1.0,V1+0.3,1.0);
  hedge(PC+EW+1.4,PC+PW-0.4,V1-1.0,V1+0.3,1.0);
  hedge(U0+1.0,PC-PW-0.6,VN+1.0,VN+2.1,0.9);
  hedge(PC+PW+0.6,U1-1.0,VN+1.0,VN+2.1,0.9);
  var pl=rect(PC+3.9,PC+3.9+1.6,V1+7.0,VW-2.4);
  prism(M,pl,0,0.75,BRICKD,CREAM,0.62); solid(pl,0.9);
  band(M,pl,0.75,0.88,0.06,CREAM,1,0.75);
  prism(M,offsetRing(pl,-0.15),0.88,1.5,GREEN,0x3B6C33,0.6);
  hedge(PC+3.9,PC+3.9+1.4,V1+6.0,V1+7.0,1.05);
  /* lamp posts either side */
  [[-4.3,V1+6.5],[4.3,V1+9.0],[-4.3,VW-2.2]].forEach(function(q){ var p=W(PC+q[0],q[1]); campusLamp(M,p[0],p[1],4.2,false); });

  /* keep trees and props off the building and the walk */
  var keep=[offsetRing(main,3.5),offsetRing(wing,3),rect(PC-5.5,PC+5.5,V1-0.5,VW-1.0)];
  keep.forEach(function(r){ NO_PLANT.push(r); NO_LAWN_TREES.push(r); });
  for(var t=TREE_POS.length-1;t>=0;t--) for(var q=0;q<keep.length;q++)
    if(inRing(keep[q],TREE_POS[t][0],TREE_POS[t][1])){ TREE_POS.splice(t,1); break; }

  B.h=19.6;
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__lewis={tris:M.count()};
})();
