/* ==================================================================
   Alumni Park, in front of Doheny Memorial Library. Laid out on the
   library's axis: limestone steps down from the porch onto a long walk
   of rose brick, a round brick plaza with a white two-tier fountain in
   a ring of red roses, clipped boxwood hedges framing the lawns, and
   further out the walk opens round a raised bed of red and yellow
   flowers with SC spelled in hedge. Big shade trees close it in on both
   sides, with a pair of Canary palms. The data layer (ALUM, a_world.js)
   has already cleared the OSM fountain and walks and added the new
   walks for the crowd.
   Local frame: u along the library front, v out from it into the park.
   ================================================================== */
(function(){
  if(!ALUM) return;
  var F=ALUM.F, P=ALUM.P, FV=ALUM.FV, VB=ALUM.VB, BW=ALUM.BW, U=ALUM.U, V1=ALUM.V1;
  var TAU=Math.PI*2, DEG=Math.PI/180;
  var MW=new Mesher(), MG=new Mesher(), KW=wallKit(MW,F);
  var BRICK=0xC0806C, BRICK_D=0xA4614F, STONE=0xEAE4D6, STONE_D=0xCFC7B6,
      HEDGE=0x2F6A2A, SOIL=0x55402F, BENCH=0xE6E1D5;
  var WH=3.4, SV0=6.3, PR=11;                   /* walk half width, walk start, plaza radius */
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function hs(a,b,c){ var x=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453; return x-Math.floor(x); }
  function rect(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function circ(r,y,col,n){ var c=P(0,FV); flat(MG,ccw(ngon(c[0],c[1],r,n||64,0)),y,col,1); }
  function PC(r,a){ return P(r*Math.cos(a),FV+r*Math.sin(a)); }   /* polar round the fountain */
  /* keep trees, hedges and lamps on the lawn: off Hahn Plaza and the concrete walks round the park */
  var WALKS=PATHS.filter(function(p){ return !p.hide&&p.w>=2.5; });
  function segD(p,a,b){ var dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1,
    t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2)); return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t); }
  function onLawn(p,pad){
    if(inPlaza(p[0],p[1])||(pad!==0&&lawnAt(p[0],p[1])<0.45)) return false;
    for(var i=0;i<WALKS.length;i++){
      var w=WALKS[i].w, hw=(w>6?w*1.5+2.3:w*1.3+1.0)/2+(pad||1), q=WALKS[i].pts;
      for(var k=0;k<q.length-1;k++) if(segD(p,q[k],q[k+1])<hw) return false;
    }
    return true;
  }
  var VE=VB+13; while(VE<V1&&onLawn(P(0,VE+1),0)) VE+=1;

  /* ---- clear the old planting ---- */
  for(var i=TREE_POS.length-1;i>=0;i--){
    var l=ALUM.loc(TREE_POS[i]); if(l[0]>-U-2&&l[0]<U+2&&l[1]>2&&l[1]<V1+2) TREE_POS.splice(i,1);
  }
  NO_LAWN_TREES.push(rect(-U-2,U+2,0,V1+2));
  NO_PLANT.push(rect(-BW-1,BW+1,SV0,V1), rect(-U,U,FV-3,FV+3));

  /* ---- limestone steps down from the porch ---- */
  for(var st=0;st<3;st++) KW.box(-7.6,7.6,4.3,4.3+(3-st)*0.65,0,0.32+st*0.28,st%2?STONE:STONE_D,0.74);

  /* ---- the brick walks: soldier course edges and cross joints ---- */
  function walkV(v0,v1){
    flat(MG,rect(-WH,WH,v0,v1),0.150,BRICK,1);
    for(var sd=-1;sd<=1;sd+=2) flat(MG,rect(sd*WH-0.22*(sd+1),sd*WH-0.22*(sd-1),v0,v1),0.154,BRICK_D,1);
    for(var v=v0+0.7;v<v1-0.1;v+=1.4) flat(MG,rect(-WH,WH,v,v+0.07),0.153,BRICK_D,1);
  }
  function walkU(u0,u1){
    var h=1.9;
    flat(MG,rect(u0,u1,FV-h,FV+h),0.150,BRICK,1);
    for(var sd=-1;sd<=1;sd+=2) flat(MG,rect(u0,u1,FV+sd*h-0.18*(sd+1),FV+sd*h-0.18*(sd-1)),0.154,BRICK_D,1);
    for(var u=u0+0.7;u<u1-0.1;u+=1.4) flat(MG,rect(u,u+0.07,FV-h,FV+h),0.153,BRICK_D,1);
  }
  walkV(SV0,VB-13); if(VE>VB+13.5) walkV(VB+13,VE);
  walkU(-U,-PR+0.5); walkU(PR-0.5,U);
  /* round the flower bed the walk opens out */
  flat(MG,ccw([P(-WH,VB-13),P(WH,VB-13),P(BW,VB-8),P(BW,VB+8),P(WH,VB+13),P(-WH,VB+13),P(-BW,VB+8),P(-BW,VB-8)]),0.150,BRICK,1);
  for(var v2=VB-7.3;v2<VB+7.4;v2+=1.4) flat(MG,rect(-BW,BW,v2,v2+0.07),0.153,BRICK_D,1);
  for(var sd2=-1;sd2<=1;sd2+=2){
    var e=[[sd2*WH,VB-13],[sd2*BW,VB-8],[sd2*BW,VB+8],[sd2*WH,VB+13]];
    for(var q=0;q<3;q++) segBox(MG,P(e[q][0],e[q][1]),P(e[q+1][0],e[q+1][1]),0.152,0.156,0.44,BRICK_D,1);
  }

  /* ---- the fountain plaza ---- */
  circ(PR+0.45,0.156,STONE_D); circ(PR,0.158,BRICK);
  circ(8.9,0.1585,BRICK_D); circ(8.65,0.159,BRICK);
  circ(7.75,0.162,STONE); circ(7.45,0.165,SOIL);
  var FC=P(0,FV);
  NO_PLANT.push(ngon(FC[0],FC[1],PR+1,20,0));

  /* ---- boxwood hedges framing the lawns ---- */
  var HR=13.4, HY=0.95, HWD=0.95;
  function hedge(a,b){                           /* in short runs, kept on the lawn */
    var L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/2));
    for(var k=0;k<n;k++){
      var p0=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n], p1=[a[0]+(b[0]-a[0])*(k+1)/n,a[1]+(b[1]-a[1])*(k+1)/n];
      if(onLawn([(p0[0]+p1[0])/2,(p0[1]+p1[1])/2])) segBox(MW,p0,p1,0.0,HY,HWD,HEDGE,0.6);
    }
  }
  for(var qd=0;qd<4;qd++){
    var a0=qd*90+12, a1=qd*90+78;
    for(var a=a0;a<a1;a+=6) hedge(PC(HR,a*DEG),PC(HR,Math.min(a+6,a1)*DEG));
  }
  var hu=WH+1.0, hv=FV-Math.sqrt(HR*HR-hu*hu);
  for(var sd3=-1;sd3<=1;sd3+=2){
    hedge(P(sd3*hu,SV0+2.5),P(sd3*hu,hv));
    hedge(P(sd3*hu,2*FV-hv),P(sd3*hu,VB-14));
    var hc=Math.sqrt(HR*HR-2.9*2.9);
    hedge(P(sd3*hc,FV-2.9),P(sd3*(U-3),FV-2.9));
    hedge(P(sd3*hc,FV+2.9),P(sd3*(U-3),FV+2.9));
    if(VE>VB+16) hedge(P(sd3*hu,VB+14),P(sd3*hu,VE-1));
  }

  /* ---- the SC bed: white curb, yellow border, red fill, letters in hedge ---- */
  var CELL=1.5, BU=7.4, BV=5.9, BY=0.24;
  KW.box(-BU-0.3,BU+0.3,VB-BV-0.3,VB+BV+0.3,0,BY,STONE,0.78);
  flat(MG,rect(-BU,BU,VB-BV,VB+BV),BY+0.012,0xE2B92C,1);
  flat(MG,rect(-BU+0.9,BU-0.9,VB-BV+0.9,VB+BV-0.9),BY+0.018,0x9E1F2B,1);
  /* read standing on the walk facing the library: letter tops toward Doheny,
     the viewer's left is +u */
  var GLY={S:['###','#..','###','..#','###'], C:['###','#..','#..','#..','###']};
  var hedgeCells=[], vTop=VB-2.5*CELL;
  [['S',3*CELL+0.75],['C',-0.75]].forEach(function(g){
    var rows=GLY[g[0]], uL=g[1];
    for(var r=0;r<5;r++) for(var c=0;c<3;c++) if(rows[r][c]==='#'){
      var u1=uL-c*CELL, u0=u1-CELL, v0=vTop+r*CELL;
      KW.box(u0-0.02,u1+0.02,v0-0.02,v0+CELL+0.02,BY,BY+0.62,HEDGE,0.62);
      hedgeCells.push([u0,u1,v0,v0+CELL]);
    }
  });
  function inHedge(u,v){ for(var k=0;k<hedgeCells.length;k++){ var h=hedgeCells[k];
    if(u>h[0]-0.15&&u<h[1]+0.15&&v>h[2]-0.15&&v<h[3]+0.15) return true; } return false; }
  addCollider(rect(-BU-0.3,BU+0.3,VB-BV-0.3,VB+BV+0.3),BY+0.6);

  /* ---- flowers and rose shrubs (instanced) ---- */
  var flowers=[], bushes=[];
  for(var fu=-BU+0.3;fu<BU-0.2;fu+=0.62) for(var fv=VB-BV+0.3;fv<VB+BV-0.2;fv+=0.62){
    var ju=fu+(hs(fu,fv,1)-0.5)*0.3, jv=fv+(hs(fv,fu,2)-0.5)*0.3;
    if(inHedge(ju,jv)) continue;
    var border=Math.abs(ju)>BU-0.9||Math.abs(jv-VB)>BV-0.9;
    var p=P(ju,jv); flowers.push([p[0],BY+0.1,p[1],border?0xF0C531:(hs(ju,jv,3)<0.5?0xB8202E:0xD0303C),0.9]);
  }
  for(var rr=0;rr<2;rr++){
    var rad=5.75+rr*0.95, n=Math.round(rad*TAU/0.95);
    for(var k=0;k<n;k++){
      var an=(k+rr*0.5)/n*TAU, bp=PC(rad,an), sc=0.85+hs(k,rr,4)*0.3;
      bushes.push([bp[0],bp[1],sc,0.165]);
      for(var f=0;f<3;f++){
        var fa=hs(k,f,5)*TAU, fr=0.22*sc;
        flowers.push([bp[0]+Math.cos(fa)*fr,0.165+0.75*sc,bp[1]+Math.sin(fa)*fr,
                      hs(k,f,6)<0.7?0xC0283A:0xE85A7A,1.1]);
      }
    }
  }
  var D2=new T.Object3D(), cc=new T.Color();
  var iB=new T.InstancedMesh(new T.DodecahedronGeometry(0.5,0),
    new T.MeshLambertMaterial({color:0xFFFFFF,flatShading:true}),Math.max(1,bushes.length));
  for(i=0;i<bushes.length;i++){
    var b=bushes[i];
    D2.position.set(b[0],b[3]+0.45*b[2],b[1]); D2.rotation.set(0,hs(b[0],b[1],7)*TAU,0);
    D2.scale.set(b[2]*1.1,b[2]*0.95,b[2]*1.1); D2.updateMatrix(); iB.setMatrixAt(i,D2.matrix);
    cc.setHex(0x3B6A2B).multiplyScalar(0.85+hs(b[1],b[0],8)*0.3); iB.setColorAt(i,cc);
  }
  if(iB.instanceColor) iB.instanceColor.needsUpdate=true;
  iB.frustumCulled=false; iB.raycast=function(){}; scene.add(iB);
  var iF=new T.InstancedMesh(new T.OctahedronGeometry(0.16,0),
    new T.MeshLambertMaterial({color:0xFFFFFF,emissive:0x303030,flatShading:true}),Math.max(1,flowers.length));
  for(i=0;i<flowers.length;i++){
    var fl=flowers[i];
    D2.position.set(fl[0],fl[1],fl[2]); D2.rotation.set(hs(fl[0],1,1)*3,hs(fl[2],2,2)*3,0);
    D2.scale.set(fl[4],fl[4]*0.8,fl[4]); D2.updateMatrix(); iF.setMatrixAt(i,D2.matrix);
    cc.setHex(fl[3]).multiplyScalar(0.9+hs(fl[0],fl[2],3)*0.2); iF.setColorAt(i,cc);
  }
  if(iF.instanceColor) iF.instanceColor.needsUpdate=true;
  iF.userData.noShadow=true; iF.frustumCulled=false; iF.raycast=function(){}; scene.add(iF);

  /* ---- lamps and white benches along the walk ---- */
  [14,30,58,88].forEach(function(v){
    for(var sd=-1;sd<=1;sd+=2){ var lp=P(sd*(hu+1.1),v); if(onLawn(lp)) campusLamp(MW,lp[0],lp[1],3.3,false); }
  });
  function bench(u,v,alongU){
    var c=P(u,v), d=alongU?[F.dx,F.dz]:[F.nx,F.nz], L=1.2;
    segBox(MW,[c[0]-d[0]*L,c[1]-d[1]*L],[c[0]+d[0]*L,c[1]+d[1]*L],0.40,0.52,0.6,BENCH,0.8);
    for(var e2=-1;e2<=1;e2+=2){
      var m=[c[0]+d[0]*L*0.8*e2,c[1]+d[1]*L*0.8*e2];
      segBox(MW,[m[0]-d[0]*0.1,m[1]-d[1]*0.1],[m[0]+d[0]*0.1,m[1]+d[1]*0.1],0,0.40,0.5,STONE_D,0.7);
    }
  }
  [20,25].forEach(function(v){ bench(WH+0.6,v,false); bench(-WH-0.6,v,false); });
  [17,30].forEach(function(u){ bench(u,FV+2.3,true); bench(-u,FV-2.3,true); });

  /* ---- big shade trees either side, palms flanking the walk ---- */
  var SP=['syc','oak','ficus','syc','oak','mag'];
  var rows=[[12.5,15,12],[24,9,13],[36,14,14]];
  rows.forEach(function(rw,ri){
    for(var v=rw[1];v<V1-4;v+=rw[2]){
      if(Math.abs(v-FV)<6) continue;
      for(var sd=-1;sd<=1;sd+=2){
        var jx=(hs(v,sd,ri)-0.5)*2.5, jv=(hs(sd,v,ri+3)-0.5)*3;
        var u=sd*(rw[0]+jx), vv=v+jv;
        if(Math.hypot(u,vv-FV)<HR+4) continue;
        if(Math.abs(u)<BW+5&&Math.abs(vv-VB)<BV+5) continue;
        var tp=P(u,vv); if(!onLawn(tp,3)) continue;
        TREE_POS.push([tp[0],tp[1],0,SP[(Math.round(v)+ri+(sd>0?0:3))%SP.length],1.3+hs(u,vv,9)*0.35]);
      }
    }
  });
  [[8.4,24],[-8.4,24],[8.4,VB+17],[-8.4,VB+17]].forEach(function(p){
    var tp=P(p[0],p[1]); if(onLawn(tp,2)) TREE_POS.push([tp[0],tp[1],3]);
  });

  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; scene.add(mg);
  NAMED_PLACES.push({name:'Alumni Park Fountain',x:FC[0],z:FC[1],h:5,rad:PR});
  window.__alum={flowers:flowers.length,bushes:bushes.length,ve:VE,fc:FC,n:[F.nx,F.nz]};
})();
