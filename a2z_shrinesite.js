/* ==================================================================
   The grounds round the Shrine Auditorium (665 W Jefferson Blvd), across
   Jefferson from campus. The building itself is a2y_shrine.js; this file
   stops 3 m short of its walls. a_world.js sets SHRS (campus grid frame:
   origin at the building's south west corner, u grid east, v grid south),
   hides the OSM walks on the promenade, drops the car park aisles and
   moves Jefferson's north carriageway 3 m off the building.

   From OSM (Royal Street way 511716220, the car park 1041867890) and photos:
   - Royal Street between Jefferson and 32nd Street is a pedestrian promenade
     along the building's west front: pale rose and tan paving in a big
     diamond lattice with a darker border, a double row of tall date palms,
     tall slim lamp posts along the fence, low planters, green barricades.
   - A green steel picket fence with posts and gates between the promenade
     and the surface car park; along Jefferson the car park has brick piers
     with cast stone caps and green pickets, gates standing open at the two
     driveways.
   - The car park: dark asphalt, white stall striping, two aisles, a few cars,
     tall lot lights.
   - The Jefferson corner: a white statue on a cast stone pedestal at the foot
     of the promenade, ornate twin lantern street lamps, traffic signals,
     yellow school zone crosswalks, palms along the Jefferson sidewalk.
   ================================================================== */
(function(){
  if(typeof SHRS==='undefined'||!SHRS) return;
  var S=SHRS, P=S.P, du=S.du, dv=S.dv;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var GREEN=0x2E5A3E, GREEND=0x23452F, BRICK=0x9C4E38, CAST=0xE2D6BE, CASTD=0xC4B79C, ASPH=0x3B3E43,
      LINE=0xE9E9E3, CONC=0xBDB6A8, IRON=0x1E2620, STONE=0xEEE9DF, PLANT=0x3E6B2E;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function gR(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function gbox(u0,u1,v0,v1,y0,y1,col,sh,top){ var r=gR(u0,u1,v0,v1); prism(M,r,y0,y1,col,top||col,sh===undefined?0.62:sh); return r; }
  function cbox(u,v,hu,hv,y0,y1,col,sh,top){ return gbox(u-hu,u+hu,v-hv,v+hv,y0,y1,col,sh,top); }
  function solid(r,h){ cols.push([r,h]); }
  function hs(a,b){ var h=Math.sin(a*127.1+b*311.7)*43758.5453; return h-Math.floor(h); }
  /* a flat quad on the ground mesh, in short pieces */
  function slab(u0,u1,v0,v1,y,col,sh){ var n=Math.max(1,Math.ceil(Math.abs(v1-v0)/12));
    for(var i=0;i<n;i++){ var a=v0+(v1-v0)*i/n, b=v0+(v1-v0)*(i+1)/n; flat(MG,gR(u0,u1,Math.min(a,b),Math.max(a,b)),y,col,sh===undefined?1:sh); } }
  /* a line along v, in short pieces */
  function lineV(u,v0,v1,w,y,col){ var n=Math.max(1,Math.ceil(Math.abs(v1-v0)/10));
    for(var i=0;i<n;i++) ribbon(MG,[P(u,v0+(v1-v0)*i/n),P(u,v0+(v1-v0)*(i+1)/n)],w,y,col,1); }
  function lineU(v,u0,u1,w,y,col){ ribbon(MG,[P(u0,v),P(u1,v)],w,y,col,1); }

  /* ================= the promenade paving ================= */
  /* east edge: 3 m off the building's west wall (see SHRS.promL) */
  var EDGE=[[3.6,0,-3.3,-3.3],[0,-13.5,-3.3,-4.3],[-13.5,-27,-8,-8],[-27,-70,-5.8,-5.8],[-70,-81.5,-7.2,-7.2],
            [-81.5,-110,-3.8,-3.8],[-110,-126.5,-9.6,-9.6],[-126.5,-157,-8,-8],[-157,-170,-9.3,-9.3],[-170,-180,-7,-7]];
  var UW=-24.2, PY=0.15;
  (function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=256;
    var g=cv.getContext('2d'), im=g.createImageData(256,256), d=im.data, x, y;
    for(y=0;y<256;y++) for(x=0;x<256;x++){
      var a=x+y, b=x-y+256, ca=Math.floor(a/128), cb=Math.floor(b/128);
      var fa=(a%128)/128, fb=(b%128)/128, edge=Math.min(fa,1-fa,fb,1-fb);
      var pink=(ca+cb)%2===0, n=(hs(x,y)-0.5)*10;
      var r=pink?212:226, gg=pink?168:204, bb=pink?156:184;
      if(edge<0.035){ r=238; gg=226; bb=212; }                  /* pale joint lines */
      else if(edge<0.09&&pink){ r-=8; gg-=12; bb-=10; }         /* darker rim inside the pink */
      var k=(y*256+x)*4; d[k]=r+n; d[k+1]=gg+n; d[k+2]=bb+n; d[k+3]=255;
    }
    g.putImageData(im,0,0);
    var tex=new T.CanvasTexture(cv); tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var pos=[], uv=[], SC=5.2;
    function V(u,v){ var p=P(u,v); pos.push(p[0],PY,p[1]); uv.push(u/SC,-v/SC); }
    function quad(u0,u1a,u1b,v0,v1){ /* v0 south, v1 north; east edge u1a at v0, u1b at v1 */
      var n=Math.max(1,Math.ceil((v0-v1)/10));
      for(var i=0;i<n;i++){ var a=v0+(v1-v0)*i/n, b=v0+(v1-v0)*(i+1)/n,
        ea=u1a+(u1b-u1a)*i/n, eb=u1a+(u1b-u1a)*(i+1)/n;
        V(u0,a); V(ea,a); V(eb,b);  V(u0,a); V(eb,b); V(u0,b); }
    }
    EDGE.forEach(function(e){ quad(UW,e[2],e[3],e[0],e[1]); });
    var gb=new T.BufferGeometry();
    gb.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    gb.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    gb.computeVertexNormals();
    /* (u west to east, v south to north) winds every triangle face up */
    var mb=new T.Mesh(gb,new T.MeshLambertMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    mb.receiveShadow=true; mb.frustumCulled=false; scene.add(mb);
  })();
  /* darker rose border bands: along the fence, across the foot at the corner, round the tree wells */
  lineV(UW+0.45,3.4,-180,0.9,PY+0.012,0xA9675C);
  lineU(3.2,UW,-3.4,0.8,PY+0.012,0xA9675C);
  lineU(-12.5,UW,-8,0.6,PY+0.012,0xA9675C);

  /* ================= the palms: a double row of tall date palms ================= */
  var ROWW=-19.5, ROWE=-11.5, palmsV=[];
  for(var pv=-16;pv>=-171;pv-=9.7) palmsV.push(pv);
  palmsV.forEach(function(v,i){
    [ROWW,ROWE].forEach(function(u,j){
      var p=P(u,v); TREE_POS.push([p[0],p[1],3,0,1.35+hs(i,j)*0.3]);
      flat(MG,gR(u-0.8,u+0.8,v-0.8,v+0.8),PY+0.014,0x6B5A4A,1);          /* tree well */
      flat(MG,gR(u-0.62,u+0.62,v-0.62,v+0.62),PY+0.018,0x4A3E33,1);
    });
  });

  /* ================= planters and lamps on the promenade ================= */
  for(var i=1;i<palmsV.length-1;i+=3){
    var v=palmsV[i]-4.85;
    cbox(ROWE,v,0.65,1.6,0,0.55,CONC,0.7,0xCDC6B8);
    cbox(ROWE,v,0.5,1.45,0.55,0.75,PLANT,0.75);
    solid(gR(ROWE-0.65,ROWE+0.65,v-1.6,v+1.6),0.6);
  }
  var LAMPS=[];
  for(i=0;i<palmsV.length-1;i+=2) LAMPS.push(palmsV[i]-4.85);
  LAMPS.forEach(function(v){
    var u=UW+0.9, p=P(u,v);
    postAt(M,p[0],p[1],0,0.5,0.22,0x5A5D60,0.7);
    postAt(M,p[0],p[1],0.5,8.2,0.09,0x4A4D50,0.7);
    segBox(M,P(u,v),P(u+1.4,v),8.0,8.12,0.1,0x4A4D50,0.7);
    var h=P(u+1.5,v); postAt(M,h[0],h[1],7.78,8.08,0.24,0x3A3D40,0.7);
    postAt(M,h[0],h[1],7.72,7.8,0.2,0xF4EEDC,1);
    solid(ccw([[p[0]-0.25,p[1]-0.25],[p[0]+0.25,p[1]-0.25],[p[0]+0.25,p[1]+0.25],[p[0]-0.25,p[1]+0.25]]),3);
  });
  /* green crowd barricades along the fence near the corner */
  for(v=-18;v>-62;v-=2.45){
    cbox(UW+0.55,v,0.03,1.08,0.12,1.08,GREEN,0.7);
    cbox(UW+0.55,v-0.9,0.28,0.04,0,0.12,GREEND,0.7); cbox(UW+0.55,v+0.9,0.28,0.04,0,0.12,GREEND,0.7);
  }
  solid(gR(UW+0.45,UW+0.65,-62,-17),1.1);

  /* ================= fences: green pickets on posts, brick piers on Jefferson ================= */
  var FPOS=[], FUV=[], FH=1.85;
  function pickets(A,B,h){
    var L=Math.hypot(B[0]-A[0],B[1]-A[1]), n=Math.max(1,Math.ceil(L/12)), U=0;
    for(var k=0;k<n;k++){
      var a=[A[0]+(B[0]-A[0])*k/n,A[1]+(B[1]-A[1])*k/n], b=[A[0]+(B[0]-A[0])*(k+1)/n,A[1]+(B[1]-A[1])*(k+1)/n], l=L/n;
      FPOS.push(a[0],0,a[1], b[0],0,b[1], b[0],h,b[1],  a[0],0,a[1], b[0],h,b[1], a[0],h,a[1]);
      FUV.push(U,0, U+l/1.1,0, U+l/1.1,1,  U,0, U+l/1.1,1, U,1);
      U+=l/1.1; U-=Math.floor(U);
    }
    var dx=(B[0]-A[0])/L, dz=(B[1]-A[1])/L, nx=-dz*0.1, nz=dx*0.1;
    solid(ccw([[A[0]+nx,A[1]+nz],[B[0]+nx,B[1]+nz],[B[0]-nx,B[1]-nz],[A[0]-nx,A[1]-nz]]),h);
  }
  function post(u,v,h,w){ var p=P(u,v); postAt(M,p[0],p[1],0,h,w||0.055,GREEN,0.7); postAt(M,p[0],p[1],h,h+0.06,(w||0.055)+0.03,GREEND,0.7); }
  /* the promenade fence along u=UW, two gates standing open onto the promenade */
  var GATES=[[-58,-61.6],[-120,-123.6]], FU=UW-0.15, fv=-3;
  GATES.concat([[-172,-172]]).forEach(function(gt){
    var v0=fv, v1=gt[0];
    pickets(P(FU,v0),P(FU,v1),FH);
    for(var vv=v0;vv>v1-0.01;vv-=3) post(FU,vv,FH+0.1);
    post(FU,v1,FH+0.1);
    if(gt[1]<gt[0]){
      post(FU,gt[0],2.15,0.09); post(FU,gt[1],2.15,0.09);
      pickets(P(FU,gt[0]),P(FU+1.75,gt[0]-0.12),FH-0.05);     /* leaves swung open */
      pickets(P(FU,gt[1]),P(FU+1.75,gt[1]+0.12),FH-0.05);
    }
    fv=gt[1];
  });
  /* the Jefferson frontage of the car park: brick piers and pickets, open at the two driveways */
  var JV=-3, DRIVES=[[-54,-47.5],[-36.5,-30]];
  function pier(u,v,big){ var w=big?0.36:0.28;
    var r=cbox(u,v,w,w,0,2.05,BRICK,0.62); cbox(u,v,w+0.08,w+0.08,2.05,2.2,CAST,0.75,CASTD);
    cbox(u,v,w-0.06,w-0.06,2.2,2.42,CAST,0.75); cbox(u,v,w+0.06,w+0.06,0,0.3,CASTD,0.7);
    solid(r,2.2); }
  var JR=[[-59.5,-54],[-47.5,-36.5],[-30,UW]];
  JR.forEach(function(s){
    var n=Math.max(1,Math.round((s[1]-s[0])/5.2));
    for(var k=0;k<=n;k++) pier(s[0]+(s[1]-s[0])*k/n,JV,(k===n&&s[1]===UW)||k===0||k===n);
    for(k=0;k<n;k++){ var a=s[0]+(s[1]-s[0])*k/n+0.35, b=s[0]+(s[1]-s[0])*(k+1)/n-0.35;
      pickets(P(a,JV),P(b,JV),1.75); }
  });
  DRIVES.forEach(function(dr){   /* gate leaves folded back into the car park */
    pickets(P(dr[0]+0.4,JV-0.2),P(dr[0]+0.6,JV-3.2),1.7); pickets(P(dr[1]-0.4,JV-0.2),P(dr[1]-0.6,JV-3.2),1.7); });
  (function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=256;
    var g=cv.getContext('2d'), py=256/FH;
    for(var i=0;i<8;i++){ var cx=i*16+8;
      g.fillStyle='#24452f'; g.fillRect(cx-2,10,4,256-10);
      g.beginPath(); g.moveTo(cx-3,12); g.lineTo(cx,0); g.lineTo(cx+3,12); g.closePath(); g.fill();
      g.fillStyle='#3f6c4c'; g.fillRect(cx-2,12,1,256-12); }
    g.fillStyle='#24452f'; g.fillRect(0,256-1.6*py,128,7); g.fillRect(0,256-0.2*py,128,7);
    var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.wrapT=T.ClampToEdgeWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(FPOS,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(FUV,2));
    geo.computeBoundingSphere();
    var fm=new T.Mesh(geo,new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:0.03,depthWrite:false,side:T.DoubleSide}));
    fm.frustumCulled=false; fm.renderOrder=1; fm.userData.noShadow=true; fm.raycast=function(){}; scene.add(fm);
  })();

  /* ================= the car park ================= */
  var LY=0.11;
  [[-59.5,-24.6,-86.6,-3],[-65,-24.6,-129.3,-86.6],[-61.5,-24.6,-134.5,-129.3],[-47,-24.6,-172,-134.5],
   [-36.5,-30,-180,-172]].forEach(function(r){ slab(r[0],r[1],r[2],r[3],LY,ASPH,1); });
  DRIVES.forEach(function(dr){ slab(dr[0],dr[1],-3,4.1,LY+0.04,ASPH,1); });   /* across the sidewalk */
  var SL=0.13, SW=0.12, ST=2.7;
  /* rows: [u0,u1,vSouth,vNorth] - stall lines run along u, one every 2.7 m */
  var ROWS=[[-59.5,-54,-6,-127],[-47.5,-42,-6,-127],[-42,-36.5,-6,-127],[-30,-24.6,-6,-170],
            [-47,-42,-137,-170],[-42,-36.5,-137,-170]];
  var cars=[];
  ROWS.forEach(function(r,ri){
    var n=Math.floor((r[2]-r[3])/ST);
    for(var k=0;k<=n;k++){ var vv=r[2]-k*ST; lineU(vv,r[0],r[1],SW,SL,LINE); }
    for(k=0;k<n;k++){ var vc=r[2]-(k+0.5)*ST;
      if(hs(ri*31+k,7)<0.3) cars.push([(r[0]+r[1])/2,vc,hs(k,ri*3+1)]); }
  });
  lineV(-42,-6,-127,SW,SL,LINE); lineV(-42,-137,-170,SW,SL,LINE);
  /* arrows down the aisles */
  [[-50.75,-20],[-50.75,-80],[-33.25,-40],[-33.25,-110],[-33.25,-160]].forEach(function(a,i){
    var s=i<2?-1:1;
    ribbon(MG,[P(a[0],a[1]),P(a[0],a[1]+s*2.6)],0.22,SL,LINE,1);
    flat(MG,ccw([P(a[0]-0.6,a[1]+s*2.6),P(a[0]+0.6,a[1]+s*2.6),P(a[0],a[1]+s*3.6)]),SL,LINE,1);
  });
  /* tall lot lights on the middle row */
  [-26,-66,-106,-152].forEach(function(v){
    var p=P(-42,v);
    postAt(M,p[0],p[1],0,0.7,0.3,CONC,0.7); postAt(M,p[0],p[1],0.7,9.4,0.1,0x7C8084,0.7);
    [-1,1].forEach(function(s){ var a=P(-42+s*1.1,v);
      segBox(M,p,a,9.2,9.3,0.08,0x7C8084,0.7);
      postAt(M,a[0],a[1],9.05,9.35,0.32,0x6A6E72,0.7); postAt(M,a[0],a[1],9.0,9.05,0.27,0xF4EEDC,1); });
    solid(ccw([[p[0]-0.32,p[1]-0.32],[p[0]+0.32,p[1]-0.32],[p[0]+0.32,p[1]+0.32],[p[0]-0.32,p[1]+0.32]]),3);
  });
  /* parked cars, instanced (the a2l_road.js recipe) */
  if(cars.length){
    var CARC=[0xF2F2F0,0x1E1E20,0x8A8D91,0xB7BABD,0x9C1C22,0x1F3B6B,0xE9E4D8,0x3C4A3E,0x5B5F63,0x2F2F31,0xD8D4CC,0x6E7378];
    var cb=new T.BoxGeometry(1,1,1); cb.translate(0,0.5,0);
    var D=new T.Object3D(), col=new T.Color(), ang=Math.atan2(du[1],du[0]);
    var mk=function(fn){
      var im=new T.InstancedMesh(cb,new T.MeshLambertMaterial({color:0xFFFFFF,flatShading:true}),cars.length);
      for(var i=0;i<cars.length;i++){ fn(cars[i]); D.updateMatrix(); im.setMatrixAt(i,D.matrix); im.setColorAt(i,col); }
      if(im.instanceColor) im.instanceColor.needsUpdate=true;
      im.frustumCulled=false; im.raycast=function(){}; im.castShadow=true; scene.add(im); return im;
    };
    var at=function(c,du2,y){ var p=P(c[0]+du2,c[1]); D.position.set(p[0],y,p[1]); D.rotation.set(0,-ang,0); };
    mk(function(c){ at(c,0,0.12); D.scale.set(3.9,0.36,1.62); col.setHex(0x1C1D20); });
    mk(function(c){ at(c,0,0.34); D.scale.set(4.4,0.70,1.80); col.setHex(CARC[Math.floor(c[2]*97)%CARC.length]); });
    mk(function(c){ at(c,0.1,1.04); D.scale.set(2.3,0.46,1.62); col.setHex(0x2A3036); });
    mk(function(c){ at(c,0.1,1.50); D.scale.set(2.0,0.08,1.56); col.setHex(CARC[Math.floor(c[2]*97)%CARC.length]); });
    cars.forEach(function(c){ var p=P(c[0],c[1]); solid(oriRect(p[0],p[1],du[0],du[1],2.25,0.95),1.5); });
  }

  /* ================= the Jefferson corner ================= */
  /* the white statue on its pedestal at the foot of the promenade, facing Jefferson */
  var SU=-19.5, SV=-6;
  cbox(SU,SV,1.5,1.5,0,0.3,CASTD,0.7,CAST); cbox(SU,SV,1.2,1.2,0.3,0.55,CAST,0.72);
  cbox(SU,SV,0.82,0.82,0.55,2.35,CAST,0.68); cbox(SU,SV,0.95,0.95,2.35,2.55,CAST,0.75,0xEDE4D0);
  solid(gR(SU-1.5,SU+1.5,SV-1.5,SV+1.5),2.5);
  (function(){
    var wm=new T.MeshLambertMaterial({color:0xF3F1EC,flatShading:true}), g=new T.Group(), c=P(SU,SV);
    g.position.set(c[0],2.55,c[1]); g.rotation.y=Math.atan2(dv[0],dv[1]); g.scale.set(1.3,1.3,1.3);
    var robe=new T.Mesh(new T.CylinderGeometry(0.3,0.46,1.5,9),wm); robe.position.y=0.75; g.add(robe);
    var chest=new T.Mesh(new T.CylinderGeometry(0.33,0.3,0.5,9),wm); chest.position.y=1.72; g.add(chest);
    var sh=new T.Mesh(new T.BoxGeometry(0.86,0.18,0.36),wm); sh.position.y=1.95; g.add(sh);
    var head=new T.Mesh(new T.IcosahedronGeometry(0.17,1),wm); head.position.y=2.2; g.add(head);
    [-1,1].forEach(function(s){ var arm=new T.Mesh(new T.CylinderGeometry(0.08,0.07,0.8,6),wm);
      arm.position.set(s*0.42,1.55,0.08); arm.rotation.z=s*0.18; arm.rotation.x=-0.25; g.add(arm); });
    g.traverse(function(o){ o.castShadow=true; o.raycast=function(){}; });
    scene.add(g);
  })();
  /* twin lantern street lamps: dark green cast iron post, cross arm, two lanterns */
  function twin(u,v){
    var p=P(u,v);
    postAt(M,p[0],p[1],0,0.6,0.2,IRON,0.7); postAt(M,p[0],p[1],0.6,0.75,0.16,IRON,0.8);
    postAt(M,p[0],p[1],0.75,4.1,0.075,IRON,0.7);
    var a=P(u-0.62,v), b=P(u+0.62,v);
    segBox(M,a,b,4.0,4.1,0.08,IRON,0.7);
    [a,b].forEach(function(q){
      postAt(M,q[0],q[1],4.1,4.2,0.14,IRON,0.7);
      postAt(M,q[0],q[1],4.2,4.75,0.15,0xF6E9C4,1);
      postAt(M,q[0],q[1],4.75,4.88,0.2,IRON,0.7); postAt(M,q[0],q[1],4.88,5.02,0.08,IRON,0.7); });
    postAt(M,p[0],p[1],4.1,4.6,0.05,IRON,0.7);
    solid(ccw([[p[0]-0.2,p[1]-0.2],[p[0]+0.2,p[1]-0.2],[p[0]+0.2,p[1]+0.2],[p[0]-0.2,p[1]+0.2]]),3);
  }
  twin(-23,2.2); twin(-5.2,2.2); twin(-23,-11); twin(-15.8,-11); twin(-41.8,2.4);
  /* traffic signals at the two north corners of Royal and Jefferson */
  function signalHead(q,y){ postAt(M,q[0],q[1],y-1.0,y,0.2,0x2A2B26,0.7);
    var c=[0xC03028,0xE0B030,0x38A048];
    for(var i=0;i<3;i++){ var s=[q[0]+dv[0]*0.21,q[1]+dv[1]*0.21];
      postAt(M,s[0],s[1],y-0.32*(i+1)+0.04,y-0.32*i-0.06,0.07,i===0?c[0]:0x3A3B36,0.9); } }
  (function(){
    var u=-25.6, v=3.5, p=P(u,v);
    postAt(M,p[0],p[1],0,6.4,0.13,0x6E7074,0.7);
    segBox(M,P(u,v),P(u,v+9.5),6.0,6.18,0.14,0x6E7074,0.7);
    signalHead(P(u,v+5.5),5.95); signalHead(P(u,v+9.0),5.95);
    signalHead(P(u+0.35,v),3.3);
    solid(ccw([[p[0]-0.2,p[1]-0.2],[p[0]+0.2,p[1]-0.2],[p[0]+0.2,p[1]+0.2],[p[0]-0.2,p[1]+0.2]]),3);
    u=-3.9; p=P(u,v);
    postAt(M,p[0],p[1],0,4.2,0.1,0x6E7074,0.7);
    signalHead(P(u,v+0.2),4.1);
    solid(ccw([[p[0]-0.2,p[1]-0.2],[p[0]+0.2,p[1]-0.2],[p[0]+0.2,p[1]+0.2],[p[0]-0.2,p[1]+0.2]]),3);
  })();
  /* yellow school zone crosswalks across Jefferson either side of Royal */
  [-27.6,-6.3].forEach(function(u){
    for(var v2=5.3;v2<28.5;v2+=1.15) ribbon(MG,[P(u-1.6,v2),P(u+1.6,v2)],0.55,0.085,0xE2C24A,1);
    lineV(u-1.9,4.8,28.8,0.2,0.085,0xF0EEE6); lineV(u+1.9,4.8,28.8,0.2,0.085,0xF0EEE6);
  });
  /* palms along the Jefferson sidewalk: fan palms in front of the car park, date palms along the building */
  [-57.5,-44.5,-39.5].forEach(function(u){ var p=P(u,1.0); TREE_POS.push([p[0],p[1],4,0,1.05]);
    flat(MG,gR(u-0.7,u+0.7,0.3,1.7),0.15,0x4A3E33,1); });
  [8,20,32,44,56].forEach(function(u,i){ var p=P(u,3.1); TREE_POS.push([p[0],p[1],3,0,1.3+hs(u,3)*0.25]); });
  [68,80].forEach(function(u){ var p=P(u,3.1); TREE_POS.push([p[0],p[1],4,0,1.1]); });

  /* ================= finish ================= */
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  /* the car park aisles on the minimap */
  ROADS.push({w:5,pts:[P(-50.75,4),P(-50.75,-132),P(-33.25,-132)]},{w:5,pts:[P(-33.25,4),P(-33.25,-180)]});
  window.__shrinesite={cars:cars.length,lamps:LAMPS.length,palms:palmsV.length*2,tris:M.count()+MG.count()};
})();
