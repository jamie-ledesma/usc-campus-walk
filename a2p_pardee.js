/* ==================================================================
   The Pardee Way entrance and Pardee Way.
   From Exposition Boulevard a red brick forecourt opens off the sidewalk.
   The drive makes a U round the 125th Anniversary Fountain (2005): in on
   the east lane, out on the west. The fountain is a U in plan, flat side
   to the gate: a cream cast stone back wall between brick end piers, with
   round bronze medallion spouts pouring onto concentric stepped tiers. At
   the head of the U the gate line runs between Dauterive Hall (VPD) and
   Popovich Hall: tall square brick piers on cast stone bases with cream
   caps and the bronze USC seal, black iron gates standing open, iron
   railings, a small brick gate pavilion with a tile roof against VPD, and
   on the Popovich side a brick loggia of round arches filled with iron.
   Inside, the attendant booth (brick base, glass, red tile hip roof) sits
   on an island between the lanes, with a stop sign and bollards. Pardee
   Way then runs north as a concrete drive with brick edges, trees, lamps
   and the long rill along Popovich, to Childs Way and Widney Alumni House.
   Layout from OSM (ways 727000083, 1060835794, 381375623, 1340874374,
   442340245, gate nodes 6820935944, 9747602348), shifted onto this map
   like its neighbours, and from photos of the gate and the forecourt.
   Frame: the Childs Way frame (PARDEE.P): s grid east, t grid south.
   The fence (a2h_fence.js) leaves this line to us (GATES own:1).
   ================================================================== */
(function(){
  if(!PARDEE||!CHILDS) return;
  var P=PARDEE.P, loc=PARDEE.loc, ux=CHILDS.ux, uz=CHILDS.uz;
  var MW=new Mesher(), MG=new Mesher(), MB=new Mesher(), MQ=new Mesher(), IRON=[];
  var BRICK=0xA9563E, BRICKD=0x8E4733, CAST=0xDCD2BC, CASTD=0xC2B79E, CREAM=0xE9E1CD,
      TILE=0xB0563A, TILED=0x8A3F28, CONC=0xC4BFB4, CONC_D=0xB3AEA3, BRK=0x9C5845,
      WALK=0xC8C2B2, KERB=0xCFC8B6, HEDGE=0x2F5A2A, LAWN=0x5E8C3A, WATER=0x2C84C6,
      WATERL=0x3F93C9, BRONZE=0x7A5A2E, BOLL=0x5C4630, GLASS=0x3E5560, BLACK=0x17181A;
  var GL=91.6, SC=205.4;                       /* the gate line, the drive's centre line */
  var cols=[];
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function rect(s0,s1,t0,t1){ return ccw([P(s0,t0),P(s1,t0),P(s1,t1),P(s0,t1)]); }
  function box(M,s0,s1,t0,t1,y0,y1,col,sh){ prism(M,rect(s0,s1,t0,t1),y0,y1,col,col,sh===undefined?0.62:sh); }
  function solid(s0,s1,t0,t1,h){ cols.push([rect(s0,s1,t0,t1),h]); }
  /* flat in short pieces: triangulate() drops long needles */
  function slab(M,s0,s1,t0,t1,y,col){
    var ds=s1-s0, dt=t1-t0, ns=Math.max(1,Math.ceil(ds/Math.max(2,dt*6))), nt=Math.max(1,Math.ceil(dt/Math.max(2,ds*6)));
    for(var a=0;a<ns;a++) for(var b=0;b<nt;b++)
      flat(M,rect(s0+ds*a/ns,s0+ds*(a+1)/ns,t0+dt*b/nt,t0+dt*(b+1)/nt),y,col,1);
  }
  /* a strip whose south edge is a function of s (the Exposition sidewalk runs at an angle to the grid) */
  function strip(M,s0,s1,ft0,ft1,y,col,step){
    var n=Math.max(1,Math.ceil((s1-s0)/(step||2)));
    for(var i=0;i<n;i++){
      var a=s0+(s1-s0)*i/n, b=s0+(s1-s0)*(i+1)/n, a0=ft0(a), a1=ft1(a), b0=ft0(b), b1=ft1(b);
      var m=Math.max(1,Math.ceil(Math.max(a1-a0,b1-b0)/4));
      for(var k=0;k<m;k++){
        var r=ccw([P(a,a0+(a1-a0)*k/m),P(b,b0+(b1-b0)*k/m),P(b,b0+(b1-b0)*(k+1)/m),P(a,a0+(a1-a0)*(k+1)/m)]);
        flat(M,r,y,col,1);
      }
    }
  }
  /* world helpers */
  var ES=[ux,uz], ET=[-uz,ux];                  /* unit vectors along s and t */
  function W3(s,t,y){ var p=P(s,t); return [p[0],y,p[1]]; }
  /* a vertical disc facing along t (dir +1 south, -1 north), both sides */
  function discT(M,s,t,y,dir,r,n,col){
    var c=rgb(col,1), cx=P(s,t+dir*0.004);
    for(var i=0;i<n;i++){
      var a0=i/n*6.283185, a1=(i+1)/n*6.283185;
      var A=[cx[0],y,cx[1]], B=[cx[0]+ES[0]*Math.cos(a0)*r,y+Math.sin(a0)*r,cx[1]+ES[1]*Math.cos(a0)*r],
          C=[cx[0]+ES[0]*Math.cos(a1)*r,y+Math.sin(a1)*r,cx[1]+ES[1]*Math.cos(a1)*r];
      M.tri(A,B,C,c,c,c); M.tri(A,C,B,c,c,c);
    }
  }
  /* the spandrel round an arch in a wall face: opening centred at s=sc in the plane t0..t1 */
  function archAlongS(M,sc,t0,t1,ys,r,ytop,col){
    var c=rgb(col,1), cd=rgb(col,0.62), N=7;
    for(var i=0;i<N;i++){
      var a0=Math.PI*(1-i/N), a1=Math.PI*(1-(i+1)/N);
      var s0=sc+Math.cos(a0)*r, s1=sc+Math.cos(a1)*r, y0=ys+Math.sin(a0)*r, y1=ys+Math.sin(a1)*r;
      [t0,t1].forEach(function(t){
        var A=W3(s0,t,y0), B=W3(s0,t,ytop), C=W3(s1,t,ytop), D=W3(s1,t,y1);
        M.quad(A,B,C,D,c,c,c,c); M.quad(D,C,B,A,c,c,c,c);
      });
      var E=W3(s0,t0,y0), F=W3(s0,t1,y0), G=W3(s1,t1,y1), H=W3(s1,t0,y1);
      M.quad(E,F,G,H,cd,cd,cd,cd); M.quad(H,G,F,E,cd,cd,cd,cd);              /* soffit */
    }
  }
  /* an iron panel (texture) from a to b in world xz */
  function iron(a,b,y0,y1){ IRON.push([a,b,y0,y1]); }
  function ironS(s0,s1,t,y0,y1){ iron(P(s0,t),P(s1,t),y0,y1); }
  function ironT(s,t0,t1,y0,y1){ iron(P(s,t0),P(s,t1),y0,y1); }
  function bollard(s,t,col){
    var p=P(s,t), c=col||BOLL;
    var r1=ngon(p[0],p[1],0.15,8,0), r2=ngon(p[0],p[1],0.10,8,0), r3=ngon(p[0],p[1],0.13,8,0);
    [r1,r2,r3].forEach(function(r){ ccw(r); });
    prism(MW,r1,0.1,0.26,c,c,0.6); prism(MW,r2,0.26,0.92,c,c,0.66); prism(MW,r3,0.80,0.86,c,c,0.8);
    coneRoof(MW,p[0],p[1],0.10,0.92,0.07,c,8);
    cols.push([ccw(ngon(p[0],p[1],0.2,6,0)),1.0]);
  }

  /* the Exposition sidewalk: its inner edge and the kerb, as t at a given s */
  function tAtZ(s,z){ return (z-47-uz*s)/ux; }
  function tSide(s){ return tAtZ(s,243.0); }
  function tKerb(s){ return tAtZ(s,245.7); }

  /* ---- clear trees off the paving ---- */
  var IS0=200.2, IS1=210.6, IT0=101.6;          /* the fountain island */
  function onPave(l){
    if(l[0]>186.6&&l[0]<225&&l[1]>90&&l[1]<tKerb(l[0])+1) return true;
    if(l[0]>199&&l[0]<212&&l[1]>18&&l[1]<92) return true;
    if(l[0]>223.5&&l[0]<242&&l[1]>84&&l[1]<96.5) return true;
    return false;
  }
  for(var i=TREE_POS.length-1;i>=0;i--) if(onPave(loc(TREE_POS[i]))) TREE_POS.splice(i,1);
  var FOOT=[rect(186.6,225,89,tKerb(186.6)+1),rect(198.8,212.2,18,92),rect(223.5,242,84,96.5)];
  FOOT.forEach(function(r){ NO_PLANT.push(r); NO_LAWN_TREES.push(r); });

  /* ================= the forecourt: herringbone brick to the sidewalk ================= */
  var BK=[186.9,189.3,191.7,194.1,196.5,198.4,IS0,202.8,SC,208.0,IS1,212.6,214.7,216.6,218.6,220.6,222.5,224.4];
  for(i=0;i<BK.length-1;i++){
    var a=BK[i], b=BK[i+1], top=a<214.6?90.9:91.8, inI=a>=IS0-0.01&&b<=IS1+0.01;
    strip(MB,a,b,function(){ return top; },inI?function(){ return IT0; }:tSide,0.16,0xFFFFFF,2.4);
  }
  /* a soldier course of darker brick along the sidewalk and round the island */
  strip(MG,186.9,IS0,function(s){ return tSide(s)-0.35; },tSide,0.168,BRICKD,2);
  strip(MG,IS1,224.4,function(s){ return tSide(s)-0.35; },tSide,0.168,BRICKD,2);
  /* the sidewalk across the mouth: concrete with joints and a red kerb */
  strip(MG,183.5,226.5,tSide,function(s){ return tKerb(s)-0.25; },0.165,WALK,1.5);
  for(var sj=184;sj<226;sj+=1.6){ var j0=tSide(sj), j1=tKerb(sj)-0.25;
    flat(MG,ccw([P(sj-0.04,j0),P(sj+0.04,j0),P(sj+0.04,j1),P(sj-0.04,j1)]),0.168,CONC_D,1); }
  strip(MG,183.5,226.5,function(s){ return tKerb(s)-0.25; },tKerb,0.17,0xB0473A,1.5);

  /* ================= the fountain island and the 125th Anniversary Fountain ================= */
  var isl=ccw([P(IS0,IT0),P(IS1,IT0),P(IS1,tSide(IS1)),P(IS0,tSide(IS0))]);
  prism(MW,isl,0.10,0.30,KERB,KERB,0.7);
  flat(MG,offsetRing(isl,-0.25),0.305,LAWN,1);
  addCollider(isl,0.30);
  /* boxwood: along the gate side of the island and down both lanes */
  box(MW,IS0+0.3,IS1-0.3,IT0+0.3,IT0+1.0,0.30,0.8,HEDGE,0.7);
  box(MW,IS0+0.3,IS0+0.95,105.3,tSide(IS0)-0.5,0.30,0.72,HEDGE,0.7);
  box(MW,IS1-0.95,IS1-0.3,105.3,tSide(IS1)-0.5,0.30,0.72,HEDGE,0.7);
  /* the basin is a U: flat side against the back wall at FT, round to the street */
  var FT=104.9, FD=3.3;
  function U(w,ft){ ft=ft===undefined?FT:ft;
    var r=[P(SC-w,ft),P(SC-w,ft+FD)];
    for(var k=1;k<12;k++){ var th=Math.PI*(1-k/12); r.push(P(SC+Math.cos(th)*w,ft+FD+Math.sin(th)*w)); }
    r.push(P(SC+w,ft+FD)); r.push(P(SC+w,ft));
    return ccw(r);
  }
  function annulus(M,o,inr,y,col){ var c=rgb(col,1);
    for(var k=0;k<o.length;k++){ var q=(k+1)%o.length;
      M.quad([o[k][0],y,o[k][1]],[inr[k][0],y,inr[k][1]],[inr[q][0],y,inr[q][1]],[o[q][0],y,o[q][1]],c,c,c,c); } }
  var uo=U(3.75), ui=U(3.3);
  band(MW,uo,0.30,0.62,0,BRICK,0.95,0.6,true);                   /* brick basin wall */
  band(MW,U(3.85),0.62,0.74,0,CREAM,1,0.8,true);                 /* cast stone coping */
  annulus(MW,U(3.85),ui,0.74,CREAM);
  band(MW,ui.slice().reverse(),0.30,0.74,0,0x968F80,0.86,0.5,true);
  flat(MW,ui,0.56,WATER,1);
  flat(MW,U(2.9),0.555,0x1D6EAA,1);
  /* concentric steps, water sheeting over each one */
  band(MW,U(2.35),0.30,0.70,0,0x9C9686,0.9,0.6,true); flat(MW,U(2.35),0.70,WATERL,1);
  band(MW,U(1.4),0.70,0.86,0,0x9C9686,0.9,0.6,true);  flat(MW,U(1.4),0.86,WATERL,1);
  band(MQ,offsetRing(U(2.35),0.02),0.55,0.71,0,0xDCF1FB,1,1,true);
  band(MQ,offsetRing(U(1.4),0.02),0.69,0.87,0,0xDCF1FB,1,1,true);
  addCollider(U(3.85),0.74);
  /* the back wall: cream cast stone between brick end piers, medallion spouts facing the street */
  box(MW,SC-4.0,SC+4.0,FT-0.6,FT,0.30,1.22,CAST,0.66);
  box(MW,SC-4.1,SC+4.1,FT-0.7,FT+0.1,1.22,1.34,CREAM,0.8);
  [-1,1].forEach(function(sd){ var s0=SC+sd*4.45;
    box(MW,s0-0.42,s0+0.42,FT-0.75,FT+0.12,0.30,1.58,BRICK,0.6);
    box(MW,s0-0.5,s0+0.5,FT-0.83,FT+0.2,1.58,1.70,CREAM,0.8);
    box(MW,s0-0.36,s0+0.36,FT-0.69,FT+0.06,1.70,1.80,CREAM,0.85);
    solid(s0-0.5,s0+0.5,FT-0.83,FT+0.2,1.8);
  });
  solid(SC-4.1,SC+4.1,FT-0.7,FT+0.1,1.34);
  var MED=[SC-2.2,SC,SC+2.2];
  MED.forEach(function(s){
    discT(MW,s,FT+0.01,0.98,1,0.25,14,BRONZE);
    discT(MW,s,FT+0.02,0.98,1,0.18,14,0x4F8577);
    discT(MW,s,FT+0.03,0.98,1,0.06,8,0x2E2A22);
    /* the stream: an arc from the spout to the tier below */
    var land=Math.abs(s-SC)<0.5?0.86:0.70, prev=null;
    for(var k=0;k<=5;k++){
      var f=k/5, t=FT+0.04+f*0.75, y=0.97-(0.97-land)*f*f, p=W3(s,t,y);
      if(prev){ var h=0.05, e=[ES[0]*h,0,ES[1]*h], cw=rgb(0xDCF1FB,1);
        MQ.quad([prev[0]-e[0],prev[1],prev[2]-e[2]],[prev[0]+e[0],prev[1],prev[2]+e[2]],[p[0]+e[0],p[1],p[2]+e[2]],[p[0]-e[0],p[1],p[2]-e[2]],cw,cw,cw,cw); }
      prev=p;
    }
  });

  /* ================= the gate line ================= */
  function pier(s,t,sz,seal){
    var h=sz/2;
    box(MW,s-h-0.12,s+h+0.12,t-h-0.12,t+h+0.12,0,0.95,CAST,0.62);
    box(MW,s-h-0.06,s+h+0.06,t-h-0.06,t+h+0.06,0.95,1.08,CREAM,0.8);
    box(MW,s-h,s+h,t-h,t+h,1.08,3.45,BRICK,0.58);
    box(MW,s-h-0.02,s+h+0.02,t-h-0.02,t+h+0.02,2.98,3.06,CASTD,0.8);
    box(MW,s-h-0.14,s+h+0.14,t-h-0.14,t+h+0.14,3.45,3.62,CREAM,0.78);
    box(MW,s-h-0.06,s+h+0.06,t-h-0.06,t+h+0.06,3.62,3.82,CAST,0.8);
    box(MW,s-h+0.08,s+h-0.08,t-h+0.08,t+h-0.08,3.82,3.92,CREAM,0.85);
    if(seal) [-1,1].forEach(function(d){ var tf=t+d*h;
      discT(MW,s,tf+d*0.01,2.3,d,0.40,18,0x6B4E28);
      discT(MW,s,tf+d*0.025,2.3,d,0.34,18,0x9C7A40);
      discT(MW,s,tf+d*0.04,2.3,d,0.22,16,0x7A5A2E);
    });
    solid(s-h-0.14,s+h+0.14,t-h-0.14,t+h+0.14,3.9);
  }
  var WP=198.6, EP=212.2, PS=1.1;
  pier(WP,GL,PS,true); pier(EP,GL,PS,true);
  /* the two gate leaves, swung right back inside along the edges of the drive */
  [[WP+PS/2+0.15,1],[EP-PS/2-0.15,-1]].forEach(function(g){
    var s=g[0], t0=GL-0.2, t1=GL-6.2;
    var p0=P(s,t0), p1=P(s,t1);
    segBox(MW,p0,p1,0.10,0.20,0.07,BLACK,0.7); segBox(MW,p0,p1,2.70,2.80,0.07,BLACK,0.7);
    segBox(MW,p0,p1,2.25,2.31,0.05,BLACK,0.7);
    postAt(MW,p0[0],p0[1],0.05,2.95,0.05,BLACK,0.7); postAt(MW,p1[0],p1[1],0.05,2.95,0.05,BLACK,0.7);
    postAt(MW,p0[0],p0[1],2.95,3.05,0.07,BLACK,0.8); postAt(MW,p1[0],p1[1],2.95,3.05,0.07,BLACK,0.8);
    ironT(s,t0,t1,0.2,2.7);
    cols.push([ccw([P(s-0.08,t1),P(s+0.08,t1),P(s+0.08,t0),P(s-0.08,t0)]),2.9]);
  });
  /* low brick curb and iron railing either side of the gates */
  function railing(s0,s1){
    box(MW,s0,s1,GL-0.22,GL+0.22,0,0.45,BRICK,0.6); box(MW,s0-0.03,s1+0.03,GL-0.27,GL+0.27,0.45,0.53,CREAM,0.8);
    ironS(s0,s1,GL,0.53,2.35);
    var a=P(s0,GL), b=P(s1,GL); segBox(MW,a,b,2.32,2.40,0.06,BLACK,0.7);
    solid(s0,s1,GL-0.25,GL+0.25,2.4);
  }
  railing(192.75,WP-PS/2-0.12);
  railing(EP+PS/2+0.12,214.85);

  /* ---- the brick gate pavilion against VPD, walked through north to south ---- */
  var V0=187.9, V1=192.7, VT0=89.4, VT1=94.2, VA=190.3, VR=1.2, VY=2.6;
  box(MW,V0,VA-VR,VT0,VT1,0,4.0,BRICK,0.58); box(MW,VA+VR,V1,VT0,VT1,0,4.0,BRICK,0.58);
  box(MW,V0-0.06,VA-VR,VT0-0.06,VT1+0.06,0,0.7,CAST,0.62); box(MW,VA+VR,V1+0.06,VT0-0.06,VT1+0.06,0,0.7,CAST,0.62);
  box(MW,VA-VR-0.1,VA-VR+0.02,VT0-0.04,VT1+0.04,VY-0.12,VY,CREAM,0.8);
  box(MW,VA+VR-0.02,VA+VR+0.1,VT0-0.04,VT1+0.04,VY-0.12,VY,CREAM,0.8);
  box(MW,VA-VR,VA+VR,VT0,VT1,VY+VR,4.0,BRICK,0.58);
  archAlongS(MW,VA,VT0,VT0+0.3,VY,VR,VY+VR,BRICK); archAlongS(MW,VA,VT1-0.3,VT1,VY,VR,VY+VR,BRICK);
  (function(){ var c=rgb(0xB9AE98,0.7), y=VY+VR-0.001, A=W3(VA-VR,VT0,y), B=W3(VA+VR,VT0,y), C=W3(VA+VR,VT1,y), D=W3(VA-VR,VT1,y);
    MW.quad(A,B,C,D,c,c,c,c); MW.quad(D,C,B,A,c,c,c,c); })();               /* the passage ceiling */
  var vr=rect(V0-0.12,V1+0.12,VT0-0.12,VT1+0.12);
  band(MW,vr,3.86,4.15,0,CREAM,1,0.78);
  hipRoof(MW,offsetRing(rect(V0,V1,VT0,VT1),0.5),4.15,1.5,2.6,TILE);
  solid(V0,VA-VR,VT0,VT1,4.2); solid(VA+VR,V1,VT0,VT1,4.2);

  /* ---- the Popovich loggia along Exposition: brick round arches filled with iron, tile roof ---- */
  var LS0=224.4, LS1=241, LT0=95.1, LT1=95.7, NB=5, LP=(LS1-LS0)/NB, LW=0.74, LY=2.6, LH=4.45;
  var LR=(LP-LW)/2;
  for(var k=0;k<=NB;k++){
    var ps=LS0+k*LP, hw=(k===0||k===NB)?0.45:LW/2;
    box(MW,ps-hw,ps+hw,LT0,LT1,0,LH,BRICK,0.58);
    box(MW,ps-hw-0.05,ps+hw+0.05,LT0-0.05,LT1+0.05,0,0.6,CAST,0.62);
    box(MW,ps-hw-0.04,ps+hw+0.04,LT0-0.04,LT1+0.04,LY-0.14,LY,CREAM,0.8);
    solid(ps-hw,ps+hw,LT0,LT1,LH);
    if(k<NB){
      var sc=ps+LP/2;
      archAlongS(MW,sc,LT0,LT1,LY,LR,LY+LR+0.05,BRICK);
      ironS(sc-LR,sc+LR,(LT0+LT1)/2,0.08,LY-0.1);
      box(MW,sc-LR,sc+LR,LT0+0.25,LT1-0.25,LY-0.16,LY-0.08,BLACK,0.7);
      solid(sc-LR,sc+LR,LT0+0.2,LT1-0.2,2.6);
    }
  }
  box(MW,LS0-0.45,LS1+0.45,LT0,LT1,LY+LR+0.05,LH,BRICK,0.58);
  box(MW,LS0-0.5,LS1+0.5,LT0-0.1,LT1+0.1,LH-0.12,LH+0.1,CREAM,0.8);
  /* end walls back to the building */
  box(MW,LS0-0.45,LS0+0.35,91.5,LT0,0,LH,BRICK,0.58); solid(LS0-0.45,LS0+0.35,91.5,LT0,LH);
  box(MW,LS1-0.35,LS1+0.45,85.0,LT0,0,LH,BRICK,0.58); solid(LS1-0.35,LS1+0.45,85.0,LT0,LH);
  (function(){                                  /* the shed roof, tile on top, plaster under */
    var tb=85.0, y0=LH+0.1, y1=LH+1.25, c=rgb(TILE,0.95), cu=rgb(0xD8CFBC,0.6), ce=rgb(TILED,0.7);
    var A=W3(LS0-0.5,LT1+0.35,y0), B=W3(LS1+0.5,LT1+0.35,y0), C=W3(LS1+0.5,tb,y1), D=W3(LS0-0.5,tb,y1);
    MW.quad(A,D,C,B,c,c,c,c); MW.quad(A,B,C,D,cu,cu,cu,cu);
    MW.quad(A,B,W3(LS1+0.5,LT1+0.35,y0-0.18),W3(LS0-0.5,LT1+0.35,y0-0.18),ce,ce,ce,ce);
  })();

  /* ================= inside: the island, the booth, the drive ================= */
  var BI0=203.9, BI1=206.9, BT0=76.0, BT1=89.8;
  var bisl=ccw([P(BI0+0.5,BT0),P(BI1-0.5,BT0),P(BI1,BT0+0.6),P(BI1,BT1-0.6),P(BI1-0.5,BT1),P(BI0+0.5,BT1),P(BI0,BT1-0.6),P(BI0,BT0+0.6)]);
  prism(MW,bisl,0.10,0.30,KERB,KERB,0.7);
  flat(MG,offsetRing(bisl,-0.22),0.305,BRK,1);
  addCollider(bisl,0.30);
  /* the attendant booth */
  var KS0=204.5, KS1=206.3, KT0=81.0, KT1=84.4;
  box(MW,KS0,KS1,KT0,KT1,0.30,1.25,BRICK,0.6);
  box(MW,KS0-0.06,KS1+0.06,KT0-0.06,KT1+0.06,1.25,1.34,CREAM,0.8);
  box(MW,KS0+0.03,KS1-0.03,KT0+0.03,KT1-0.03,1.34,2.42,GLASS,0.8);
  [[KS0,KT0],[KS1,KT0],[KS1,KT1],[KS0,KT1],[KS0,(KT0+KT1)/2],[KS1,(KT0+KT1)/2],[(KS0+KS1)/2,KT0],[(KS0+KS1)/2,KT1]].forEach(function(q){
    var p=P(q[0],q[1]); postAt(MW,p[0],p[1],1.34,2.42,0.045,0xEDE9DF,0.85); });
  box(MW,KS0-0.04,KS1+0.04,KT0-0.04,KT1+0.04,2.42,2.68,0xEDE9DF,0.8);
  var kr=offsetRing(rect(KS0,KS1,KT0,KT1),0.42);
  band(MW,kr,2.62,2.72,0,TILED,0.85,0.55,true);
  hipRoof(MW,kr,2.72,0.95,1.3,TILE);
  solid(KS0,KS1,KT0,KT1,2.7);
  /* the stop sign, for the lane coming in */
  (function(){
    var s=BI1-0.35, t=BT1-0.45, p=P(s,t);
    postAt(MW,p[0],p[1],0.30,2.05,0.035,0x9A9DA2,0.8);
    var c=P(s,t+0.04);
    discT(MW,s,t+0.04,2.15,1,0.38,8,0xF2F0EA);
    discT(MW,s,t+0.05,2.15,1,0.33,8,0xB3232B);
    facadeText('STOP',c[0]+ET[0]*0.02,c[1]+ET[1]*0.02,ET[0],ET[1],2.15,0.62,0.16,'#FFFFFF');
  })();
  bollard(SC,BT1-0.5); bollard(SC,BT0+0.5);
  /* the drive: pale concrete, brick edges, scored joints, brick bands at the walk and the gate */
  var DS0=200.4, DS1=210.4, DT0=22, DT1=GL-0.7;
  slab(MG,DS0,DS1,DT0,88.6,0.150,CONC);
  slab(MG,DS0,DS1,88.6,DT1,0.152,BRK);
  for(var tj=DT0+3.25;tj<88.4;tj+=3.25) slab(MG,DS0,DS1,tj-0.04,tj+0.04,0.153,CONC_D);
  slab(MG,SC-0.05,SC+0.05,DT0,88.6,0.153,CONC_D);
  [30.5,52.8].forEach(function(b){ slab(MG,DS0,DS1,b-1.25,b+1.25,0.155,BRK); });
  [[DS0-0.55,DS0],[DS1,DS1+0.55]].forEach(function(e){ slab(MG,e[0],e[1],DT0,DT1,0.152,BRICKD); });
  /* hedges, trees and lamps down both sides, open where the walk crosses */
  [[DS0-1.35,DS0-0.75],[DS1+0.75,DS1+1.35]].forEach(function(h){
    [[24,51.2],[54.4,84.6]].forEach(function(r){ box(MW,h[0],h[1],r[0],r[1],0.12,0.78,HEDGE,0.7); solid(h[0],h[1],r[0],r[1],0.8); });
  });
  function near(x,z,r){ for(var q=0;q<TREE_POS.length;q++) if(Math.hypot(TREE_POS[q][0]-x,TREE_POS[q][1]-z)<r) return true; return false; }
  [[196.8,28],[196.8,45],[196.8,64],[214.0,28],[214.0,45],[214.0,64]].forEach(function(q,qi){
    var p=P(q[0],q[1]); if(!near(p[0],p[1],4.5)) TREE_POS.push([p[0],p[1],0,qi%2?'syc':'ficus',1.0]); });
  [[198.3,37],[198.3,71],[212.5,37],[212.5,71],[193.4,96.2],[217.0,96.4],[192.8,tSide(192.8)-1.6],[217.6,tSide(217.6)-1.4]].forEach(function(q){
    var p=P(q[0],q[1]); campusLamp(MW,p[0],p[1],4.0,false); });
  /* the rill along Popovich's west front */
  for(var rt=54;rt<82;rt+=7){ box(MW,216.2,217.5,rt,rt+7,0.12,0.42,CAST,0.66); flat(MW,rect(216.4,217.3,rt+0.15,rt+6.85),0.425,WATER,1); }
  solid(216.2,217.5,54,82,0.42);
  /* bollards keep cars out of the walks at the forecourt */
  for(var bt=99;bt<tSide(194.6)-1.2;bt+=2.6) bollard(194.6,bt);
  for(bt=97.5;bt<tSide(215.6)-1.2;bt+=2.6) bollard(215.6,bt);
  [IS0+0.6,IS1-0.6].forEach(function(s){ bollard(s,IT0-0.45); });
  /* the sign on the corner of the forecourt */
  (function(){
    var s=190.6, t=tSide(190.6)-1.3, a=P(s-0.62,t), b=P(s+0.62,t);
    postAt(MW,a[0],a[1],0.15,1.7,0.05,0x5A1E1A,0.7); postAt(MW,b[0],b[1],0.15,1.7,0.05,0x5A1E1A,0.7);
    box(MW,s-0.72,s+0.72,t-0.04,t+0.04,0.62,1.62,0x8E1F23,0.75);
    box(MW,s-0.72,s+0.72,t-0.05,t+0.05,1.42,1.62,0xF2EFE8,0.85);
    var c=P(s,t+0.05);
    facadeText('USC',c[0],c[1],ET[0],ET[1],1.52,0.6,0.14,'#8E1F23');
    facadeText('PARDEE WAY',c[0],c[1],ET[0],ET[1],1.15,1.25,0.15,'#FFFFFF');
    facadeText('ENTRANCE',c[0],c[1],ET[0],ET[1],0.92,1.1,0.14,'#FFFFFF');
    solid(s-0.75,s+0.75,t-0.08,t+0.08,1.7);
  })();

  /* ================= Judge Robert M. Widney, in front of the alumni house =================
     The 8 ft bronze (Christopher Slatoff, 2014) of USC's founder stood at the entrance to
     Widney Alumni House; it was taken down for maintenance in November 2024. Shown here on
     its plinth beside the walk to the door, west of the house's centre line, clear of the
     stoop and of Childs Way. */
  (function(){
    var s=200.6, t=-10.6, M=MW, BZ=0x6E5634, BZL=0x86704A;
    function pb(s0,s1,t0,t1,y0,y1,c){ box(M,s+s0,s+s1,t+t0,t+t1,y0,y1,c,0.6); }
    pb(-0.75,0.75,-0.75,0.75,0.12,0.32,CASTD);
    pb(-0.6,0.6,-0.6,0.6,0.32,1.12,CAST);
    pb(-0.68,0.68,-0.68,0.68,1.12,1.22,CREAM);
    discT(M,s,t+0.61,0.75,1,0.18,12,BRONZE);
    var y=1.22;                                     /* standing, facing down Pardee Way */
    pb(-0.24,-0.06,-0.12,0.12,y,y+0.9,BZ); pb(0.06,0.24,-0.12,0.12,y,y+0.9,BZ);       /* legs */
    pb(-0.26,-0.04,-0.12,0.22,y,y+0.1,BZ); pb(0.04,0.26,-0.12,0.22,y,y+0.1,BZ);        /* shoes */
    pb(-0.3,0.3,-0.17,0.17,y+0.75,y+1.0,BZ);                                          /* frock coat skirt */
    pb(-0.28,0.28,-0.15,0.15,y+1.0,y+1.62,BZL);                                       /* body */
    pb(-0.36,0.36,-0.15,0.15,y+1.5,y+1.66,BZ);                                        /* shoulders */
    pb(-0.42,-0.3,-0.1,0.1,y+0.95,y+1.6,BZ); pb(0.3,0.42,-0.1,0.18,y+1.0,y+1.6,BZ);   /* arms */
    pb(0.3,0.44,0.12,0.42,y+1.0,y+1.12,BZ);                                           /* forearm holding a hat */
    pb(-0.07,0.07,-0.07,0.07,y+1.66,y+1.74,BZ);                                       /* neck */
    pb(-0.12,0.12,-0.12,0.13,y+1.74,y+2.02,BZL);                                      /* head */
    pb(-0.1,0.1,0.1,0.15,y+1.74,y+1.86,BZ);                                           /* beard */
    solid(s-0.75,s+0.75,t-0.75,t+0.75,y+2.0);
  })();

  /* ================= finish ================= */
  /* herringbone brick on the grid: one texture, uv from the grid frame */
  var cv=document.createElement('canvas'); cv.width=cv.height=512;
  var g=cv.getContext('2d'), U1=32;
  g.fillStyle='#B4A592'; g.fillRect(0,0,512,512);
  function bcol(a,b){ var h=Math.sin(((a%16+16)%16)*127.1+((b%16+16)%16)*311.7)*43758.5453; h-=Math.floor(h);
    var r=Math.round(150+h*32), gg=Math.round(70+h*18), bb=Math.round(54+h*14); if(h>0.86){ r-=26; gg-=12; bb-=8; }
    return 'rgb('+r+','+gg+','+bb+')'; }
  for(var n=-20;n<36;n++) for(var m=-12;m<12;m++){
    var cx=n+4*m;
    g.fillStyle=bcol(cx,n); g.fillRect(cx*U1+1.5,n*U1+1.5,2*U1-3,U1-3);
    g.fillStyle=bcol(cx+100,n+1); g.fillRect(cx*U1+1.5,(n+1)*U1+1.5,U1-3,2*U1-3);
  }
  var tex=new T.CanvasTexture(cv); tex.wrapS=tex.wrapT=T.RepeatWrapping;
  tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  var gb=MB.geom(), pos=gb.attributes.position.array, uv=new Float32Array(pos.length/3*2);
  for(i=0;i<pos.length/3;i++){ var l=loc([pos[i*3],pos[i*3+2]]); uv[i*2]=l[0]/1.6; uv[i*2+1]=l[1]/1.6; }
  gb.setAttribute('uv',new T.BufferAttribute(uv,2));
  var mb=new T.Mesh(gb,new T.MeshLambertMaterial({map:tex,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  mb.receiveShadow=true; mb.frustumCulled=false; scene.add(mb);
  /* the iron: one textured quad per panel, the bars are in the texture */
  var ic=document.createElement('canvas'); ic.width=128; ic.height=256;
  var ig=ic.getContext('2d'); ig.clearRect(0,0,128,256); ig.fillStyle='#16171A';
  for(i=0;i<8;i++) ig.fillRect(i*16+6,0,4,256);
  ig.fillRect(0,0,128,7); ig.fillRect(0,249,128,7); ig.fillRect(0,40,128,5);
  ig.strokeStyle='#16171A'; ig.lineWidth=3;
  for(i=0;i<4;i++){ ig.beginPath(); ig.arc(i*32+16,24,10,0,6.2832); ig.stroke(); }
  var itx=new T.CanvasTexture(ic); itx.wrapS=T.RepeatWrapping; itx.wrapT=T.ClampToEdgeWrapping;
  var IP=[], IU=[];
  IRON.forEach(function(q){ var a=q[0], b=q[1], y0=q[2], y1=q[3], L=Math.hypot(b[0]-a[0],b[1]-a[1]), u=L/0.96;
    IP.push(a[0],y0,a[1], b[0],y0,b[1], b[0],y1,b[1],  a[0],y0,a[1], b[0],y1,b[1], a[0],y1,a[1]);
    IU.push(0,0, u,0, u,1,  0,0, u,1, 0,1); });
  var ig2=new T.BufferGeometry();
  ig2.setAttribute('position',new T.Float32BufferAttribute(IP,3));
  ig2.setAttribute('uv',new T.Float32BufferAttribute(IU,2));
  ig2.computeVertexNormals(); ig2.computeBoundingSphere();
  var im=new T.Mesh(ig2,new T.MeshLambertMaterial({map:itx,alphaTest:0.5,side:T.DoubleSide}));
  im.frustumCulled=false; im.userData.noShadow=true; im.raycast=function(){}; scene.add(im);
  var mq=new T.Mesh(MQ.geom(),new T.MeshLambertMaterial({color:0xDCF1FB,transparent:true,opacity:0.55,
    flatShading:true,side:T.DoubleSide,depthWrite:false}));
  mq.frustumCulled=false; mq.userData.noShadow=true; mq.raycast=function(){}; scene.add(mq);
  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; scene.add(mg);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  /* the minimap: the U drive and Pardee Way */
  ROADS.push({w:4.5,pts:[P(197.6,tKerb(197.6)),P(197.8,106),P(SC,96.6),P(212.9,104),P(213.2,tKerb(213.2))]},
             {w:7,pts:[P(SC,22),P(SC,GL)]});
  window.__pardee={tris:MW.count()+MG.count()+MB.count()+MQ.count()+IRON.length*2,iron:IRON.length};
})();
