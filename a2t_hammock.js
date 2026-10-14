/* ==================================================================
   Hammock Hill: the lawn between the walk along McCarthy Quad's east
   side (the one toward Birnkrant) and the walk in front of the McCarthy
   Way Parking Structure (OSM way 221557193; HHILL in a_world.js).
   A smooth grass mound, about 1.9 m at the crest, runs along the middle
   of the lawn and fades out well short of both walks. Along its crest two
   straight rows of multi-stemmed shade trees (smooth gray-brown bark,
   light green crowns), about 5 m apart in the row and 7.5 m across, make
   an allee; each tree stands in a ring of bare earth. Hammocks hang
   between facing trees across the rows on black straps, some with
   students in them, backpacks on the grass; a few students sit on the
   slope. On the east slope near the south end, a small paved pad with a
   metal table and stool.
   Frame: s along the walks (grid south), t across (grid east).
   hillAt(x,z) is the ground height here; the loop uses it for the player.
   ================================================================== */
var HH=null;
function hillAt(x,z){
  if(!HH) return 0;
  var s=x*HH.d[0]+z*HH.d[1], t=x*HH.n[0]+z*HH.n[1];
  if(s<HH.s0||s>HH.s1||t<HH.t0||t>HH.t1) return 0;
  return HH.top(s,t);
}
(function(){
  if(!HHILL) return;
  var d=[-0.465,0.8853], n=[0.8853,0.465];
  function W(s,t){ return [d[0]*s+n[0]*t, d[1]*s+n[1]*t]; }
  function loc(x,z){ return [x*d[0]+z*d[1], x*n[0]+z*n[1]]; }
  /* the mound: a rounded ridge, flat-topped along the allee, smoothstep flanks */
  var TC=211.8, SC=-121.3, H=2.1, PT=3.8, FT=9.0, PS=17, FS=15.5;
  var S0=-154, S1=-88.5, T0=198.3, T1=225.2;
  var PAD={s:-97, t:221.0, hw:1.5};
  function raw(s,t){
    var a=Math.max(0,Math.abs(t-TC)-PT)/FT, b=Math.max(0,Math.abs(s-SC)-PS)/FS, r=Math.sqrt(a*a+b*b);
    if(r>=1) return 0;
    return H*(1-r*r*(3-2*r));
  }
  var padH=raw(PAD.s,PAD.t);
  function grass(s,t){                       /* the lawn, levelled round the pad */
    var v=raw(s,t), e=Math.max(Math.abs(s-PAD.s),Math.abs(t-PAD.t))-PAD.hw;
    if(e<2.0){ var w=e<=0.2?1:1-(e-0.2)/1.8; w=w*w*(3-2*w); v+=(padH-v)*w; }
    return v;
  }
  function top(s,t){
    if(Math.abs(s-PAD.s)<=PAD.hw&&Math.abs(t-PAD.t)<=PAD.hw) return padH+0.12;
    return grass(s,t);
  }
  HH={d:d,n:n,s0:S0,s1:S1,t0:T0,t1:T1,top:top,W:W,loc:loc};
  function gAt(x,z){ var l=loc(x,z); return grass(l[0],l[1]); }

  /* clear the old random trees and the lawn tree pass out of the patch */
  var clear=HHILL.ring.slice(); if(ringArea(clear)<0) clear.reverse();
  var clearPad=offsetRing(clear,1.5);
  for(var i=TREE_POS.length-1;i>=0;i--) if(inRing(clearPad,TREE_POS[i][0],TREE_POS[i][1])) TREE_POS.splice(i,1);
  NO_LAWN_TREES.push(offsetRing(clear,3));
  NO_PLANT.push(clear);
  var ctr=W(SC,TC);
  NAMED_PLACES.push({name:'Hammock Hill',x:ctr[0],z:ctr[1],h:3,rad:16,park:true});

  /* ---------------------------------------------------------- the mound */
  var STP=0.7, NS=Math.ceil((S1-S0)/STP), NT=Math.ceil((T1-T0)/STP);
  var gc=rgb(C_GRASS,HHILL.sh||1), pos=[], nor=[], col=[], idx=[], vid={};
  function vert(i,j){
    var k=i*(NT+1)+j; if(vid[k]!==undefined) return vid[k];
    var s=Math.min(S1,S0+i*STP), t=Math.min(T1,T0+j*STP), p=W(s,t), h=grass(s,t), e=0.05;
    var hs=(grass(s+e,t)-grass(s-e,t))/(2*e), ht=(grass(s,t+e)-grass(s,t-e))/(2*e);
    var gx=hs*d[0]+ht*n[0], gz=hs*d[1]+ht*n[1], L=Math.sqrt(gx*gx+1+gz*gz);
    var nz=Math.sin(p[0]*0.31+Math.cos(p[1]*0.17)*2)*Math.cos(p[1]*0.27-p[0]*0.09), m=1+0.05*nz*Math.min(1,h/0.6);
    pos.push(p[0],0.03+h,p[1]); nor.push(-gx/L,1/L,-gz/L); col.push(gc[0]*m,gc[1]*m,gc[2]*m);
    vid[k]=pos.length/3-1; return vid[k];
  }
  for(i=0;i<NS;i++) for(var j=0;j<NT;j++){
    var sa=S0+i*STP, sb=Math.min(S1,sa+STP), ta=T0+j*STP, tb=Math.min(T1,ta+STP);
    if(grass(sa,ta)<1e-4&&grass(sb,ta)<1e-4&&grass(sa,tb)<1e-4&&grass(sb,tb)<1e-4&&
       grass((sa+sb)/2,(ta+tb)/2)<1e-4) continue;
    var a=vert(i,j), b=vert(i+1,j), c=vert(i,j+1), e2=vert(i+1,j+1);
    idx.push(a,b,c, b,e2,c);
  }
  var hg=new T.BufferGeometry();
  hg.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  hg.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
  hg.setAttribute('color',new T.Float32BufferAttribute(col,3));
  hg.setIndex(idx); hg.computeBoundingSphere();
  var hm=new T.Mesh(hg,new T.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  hm.frustumCulled=false; scene.add(hm); GROUND_MESHES.push(hm);

  /* ---------------------------------------------------------- helpers */
  var D3=new T.Object3D(), V3=new T.Vector3(), UP=new T.Vector3(0,1,0), DV=new T.Vector3(), Q=new T.Quaternion();
  function hsh(a,b){ var h=Math.sin(a*12.9898+b*78.233)*43758.5453; return h-Math.floor(h); }
  function mtx(x,y,z,rx,ry,rz,sx,sy,sz){ D3.position.set(x,y,z); D3.rotation.set(rx||0,ry||0,rz||0,'YXZ');
    D3.scale.set(sx===undefined?1:sx,sy===undefined?1:sy,sz===undefined?1:sz); D3.updateMatrix(); return D3.matrix.clone(); }
  function addGeo(M,geo,m,colf){
    var g=geo.index?geo.toNonIndexed():geo, p=g.attributes.position.array;
    var tp=function(i){ V3.set(p[i],p[i+1],p[i+2]).applyMatrix4(m); return [V3.x,V3.y,V3.z]; };
    for(var i=0;i<p.length;i+=9){ var A=tp(i),B=tp(i+3),C=tp(i+6); M.tri(A,B,C,colf(A),colf(B),colf(C)); }
  }
  function solid(hex,sh){ var c=rgb(hex,sh||1); return function(){ return c; }; }
  /* a cylinder from point a to point b ([x,y,z]) */
  function limb(M,a,b,r0,r1,colf,seg){
    DV.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]); var L=DV.length(); DV.normalize();
    Q.setFromUnitVectors(UP,DV);
    var m=new T.Matrix4().compose(new T.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),Q,new T.Vector3(1,1,1));
    addGeo(M,new T.CylinderGeometry(r1,r0,L,seg||6,1,true),m,colf);
  }

  /* ---------------------------------------------------------- the trees */
  var BARK=0x8C8176, LEAF=0x9DC25C;
  function treeGeom(seed){
    var M=new Mesher(), bark=function(p){ var v=0.86+0.14*Math.min(1,p[1]/3); return rgb(BARK,v); };
    var leaf=function(p){ var v=0.84+0.26*Math.max(0,Math.min(1,(p[1]-3.6)/2.6))+0.06*(hsh(p[0]*3.1,p[2]*2.7)-0.5); return rgb(LEAF,v); };
    var lean=(hsh(seed,1)-0.5)*0.25, fk=[lean,1.9+hsh(seed,2)*0.4,0];
    limb(M,[0,-0.25,0],fk,0.21,0.16,bark,7);
    var nl=3+(hsh(seed,3)<0.5?1:0), tips=[];
    for(var k=0;k<nl;k++){
      var az=k/nl*6.2832+hsh(seed,4+k)*0.8, tl=0.42+hsh(seed,9+k)*0.2, L=2.1+hsh(seed,14+k)*0.5;
      var e=[fk[0]+Math.sin(tl)*Math.cos(az)*L, fk[1]+Math.cos(tl)*L, fk[2]+Math.sin(tl)*Math.sin(az)*L];
      limb(M,[fk[0],fk[1]-0.15,fk[2]],e,0.12,0.075,bark,6);
      for(var q=-1;q<=1;q+=2){
        var a2=az+q*0.55, t2=tl+0.3, L2=1.3+hsh(seed,20+k+q)*0.4;
        var e2=[e[0]+Math.sin(t2)*Math.cos(a2)*L2, e[1]+Math.cos(t2)*L2, e[2]+Math.sin(t2)*Math.sin(a2)*L2];
        limb(M,e,e2,0.065,0.035,bark,5); tips.push(e2);
      }
    }
    tips.forEach(function(p,k){
      var r=1.05+hsh(seed,30+k)*0.35;
      addGeo(M,new T.IcosahedronGeometry(1,1),mtx(p[0],p[1]+0.15,p[2],0,hsh(seed,40+k)*3,0,r*1.25,r*0.62,r*1.25),leaf);
    });
    addGeo(M,new T.IcosahedronGeometry(1,1),mtx(fk[0],fk[1]+3.4,0,0,0,0,2.0,0.85,2.0),leaf);
    return M.geom();
  }
  var TV=[treeGeom(1),treeGeom(2),treeGeom(3)], tlist=[[],[],[]];
  var ROWT=[TC-3.75,TC+3.75], NTREE=12, SA=-149, SB=-93, trees=[];
  var MR=new Mesher(), earth=0x7E6C50;
  for(var r=0;r<2;r++) for(var k=0;k<NTREE;k++){
    var s=SA+(SB-SA)*k/(NTREE-1)+(hsh(r,k)-0.5)*0.3, t=ROWT[r]+(hsh(k,r+5)-0.5)*0.2, p=W(s,t), y=gAt(p[0],p[1]);
    trees.push({x:p[0],z:p[1],y:y});
    tlist[(k*2+r)%3].push([p[0],p[1],y,hsh(p[0],p[1])*6.28,0.92+hsh(p[1],p[0])*0.16]);
    /* the bare earth ring, laid on the slope */
    var ring=[]; for(var a=0;a<14;a++){ var an=a/14*6.2832, rx=p[0]+Math.cos(an)*0.95, rz=p[1]+Math.sin(an)*0.95; ring.push([rx,gAt(rx,rz)+0.04,rz]); }
    var cE=rgb(earth,0.95+hsh(k,r)*0.1), cM=[p[0],y+0.045,p[1]];
    for(a=0;a<14;a++){ var A=ring[a], B=ring[(a+1)%14]; MR.tri(cM,B,A,cE,cE,cE); }
    var cr=[[p[0]-0.3,p[1]-0.3],[p[0]+0.3,p[1]-0.3],[p[0]+0.3,p[1]+0.3],[p[0]-0.3,p[1]+0.3]];
    addCollider(cr,y+4);
  }
  var matTree=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  TV.forEach(function(g,v){
    var L=tlist[v]; if(!L.length) return;
    var im=new T.InstancedMesh(g,matTree,L.length);
    L.forEach(function(q,i){ D3.position.set(q[0],q[2]-0.02,q[1]); D3.rotation.set(0,q[3],0); D3.scale.set(q[4],q[4],q[4]);
      D3.updateMatrix(); im.setMatrixAt(i,D3.matrix); });
    im.frustumCulled=false; im.raycast=function(){}; scene.add(im);
  });
  var mr=new T.Mesh(MR.geom(),new T.MeshLambertMaterial({vertexColors:true,flatShading:true,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  mr.frustumCulled=false; scene.add(mr); GROUND_MESHES.push(mr);

  /* ---------------------------------------------------------- hammocks */
  var MW=new Mesher(), MF=new Mesher(), STRAP=0x1D1E21;
  function hammock(k,cA,cB){
    var a=trees[k], b=trees[NTREE+k];                    /* facing trees, west row and east row */
    var ux=b.x-a.x, uz=b.z-a.z, L=Math.hypot(ux,uz); ux/=L; uz/=L;
    var lx=-uz, lz=ux, base=(a.y+b.y)/2, yA=base+1.78, yE=base+1.3, off=1.05, sag=0.8;
    [[a,1],[b,-1]].forEach(function(e){
      var T0=e[0], sg=e[1];
      addGeo(MW,new T.CylinderGeometry(0.168,0.168,0.05,8),mtx(T0.x,yA,T0.z),solid(STRAP));
      limb(MW,[T0.x+ux*sg*0.16,yA,T0.z+uz*sg*0.16],[T0.x+ux*sg*off,yE,T0.z+uz*sg*off],0.018,0.018,solid(STRAP),4);
    });
    var e0=[a.x+ux*off,a.z+uz*off], Lf=L-2*off, NU=16, NW=8, G=[];
    for(var i=0;i<=NU;i++){ G.push([]);
      var u=i/NU, su=Math.sin(Math.PI*u), half=0.74*Math.pow(su,0.6), yc=yE-sag*su;
      for(var j=0;j<=NW;j++){
        var w=-1+2*j/NW;
        G[i].push([e0[0]+ux*Lf*u+lx*half*w, yc+0.4*w*w*Math.pow(su,0.8), e0[1]+uz*Lf*u+lz*half*w]);
      }
    }
    for(i=0;i<NU;i++) for(var j2=0;j2<NW;j2++){
      var wm=Math.abs(-1+2*(j2+0.5)/NW), c=rgb(wm>0.62?cB:cA,0.92+0.08*((i+j2)%2));
      MF.tri(G[i][j2],G[i+1][j2],G[i][j2+1],c,c,c); MF.tri(G[i+1][j2],G[i+1][j2+1],G[i][j2+1],c,c,c);
    }
    var mx=(a.x+b.x)/2, mz=(a.z+b.z)/2;
    addCollider(oriRect(mx,mz,ux,uz,2.2,0.6),base+1.0);
    return {x:mx,z:mz,ux:ux,uz:uz,lx:lx,lz:lz,seat:yE-sag+0.1,base:base};
  }

  /* ---------------------------------------------------------- people (the crowd's look) */
  var SKIN=[0xF0C6A0,0xCE9163,0x915934,0xE3AC82,0x714128], HAIR=[0x1B1512,0x4A2F1B,0xB08A48,0x2E1F14];
  function person(M,x,y,z,yaw,o){
    var sc=o.sc||1.08, root=new T.Matrix4().compose(new T.Vector3(x,y,z),
      new T.Quaternion().setFromEuler(new T.Euler(o.rx||0,yaw,0,'YXZ')),new T.Vector3(sc,sc,sc));
    function at(px,py,pz,rx){ return new T.Matrix4().multiplyMatrices(root,mtx(px,py,pz,rx||0,0,0)); }
    function put(geo,base,m2,hex){ addGeo(M,geo,new T.Matrix4().multiplyMatrices(base,m2),solid(hex)); }
    var B=at(0,0.34,0,o.bodyRx||0);
    put(new T.CylinderGeometry(0.300,0.360,0.42,8),B,mtx(0,0.21,0),o.shirt);
    var Hd=at(0,0.735,0,o.headRx||0);
    put(new T.IcosahedronGeometry(0.37,0),Hd,mtx(0,0.37,0,0,0,0,1.0,1.03,0.95),o.skin);
    put(new T.BoxGeometry(0.085,0.125,0.06),Hd,mtx(-0.145,0.365,-0.315),0x1B1B20);
    put(new T.BoxGeometry(0.085,0.125,0.06),Hd,mtx( 0.145,0.365,-0.315),0x1B1B20);
    if(o.cap){ put(new T.CylinderGeometry(0.255,0.400,0.24,7),Hd,mtx(0,0.615,0.01),o.cap);
               put(new T.BoxGeometry(0.33,0.06,0.24),Hd,mtx(0,0.512,-0.30),o.cap); }
    else put(new T.IcosahedronGeometry(0.385,0),Hd,mtx(0,0.415,0.045,0,0,0,1.0,0.86,0.98),o.hair);
    for(var sd=-1;sd<=1;sd+=2){
      put(new T.CylinderGeometry(0.082,0.072,0.29,5),at(sd*0.295,0.74,0,o.armRx||0),mtx(0,-0.145,0),o.skin);
      var Lg=at(sd*0.125,0.36,0,o.legRx||0);
      put(new T.CylinderGeometry(0.105,0.098,0.26,5),Lg,mtx(0,-0.13,0),o.pant);
      put(new T.BoxGeometry(0.195,0.115,0.25),Lg,mtx(0,-0.305,-0.03),o.shoe===undefined?o.skin:o.shoe);
    }
    if(o.laptop) put(new T.BoxGeometry(0.42,0.03,0.3),at(0,0.52,-0.3,-0.35),mtx(0,0,0),o.laptop);
  }
  function backpack(x,z,yaw,c,trim){
    var y=gAt(x,z);
    addGeo(MW,new T.BoxGeometry(0.36,0.44,0.2),mtx(x,y+0.24,z,-0.25,yaw,0),solid(c,0.95));
    addGeo(MW,new T.BoxGeometry(0.3,0.2,0.09),mtx(x,y+0.17,z,-0.25,yaw,0).multiply(mtx(0,0,-0.14)),solid(trim||c,0.85));
  }

  var hamm=[
    hammock(2,0x1F6E57,0x2F45C8),      /* green body, blue rim, as in the photo */
    hammock(5,0xD9361F,0xE8642C),      /* red */
    hammock(8,0x1C9AA0,0x5B6168),      /* teal and gray */
    hammock(10,0x6B3FA2,0x2B2D33)      /* purple and charcoal */
  ];
  var hA=hamm[0];
  /* sitting crosswise in the blue/green one, facing grid north, laptop on her lap */
  person(MW,hA.x,hA.seat-0.34*1.05,hA.z,Math.atan2(hA.lx,hA.lz),
    {sc:1.05,rx:0.18,legRx:0.95,armRx:0.9,shirt:0xEDEDEA,pant:0xE3AC82,skin:0xE3AC82,cap:0xF2C9D0,laptop:0xE8D7CF,shoe:0xE3AC82});
  /* two in the red one */
  var hB=hamm[1];
  [-0.5,0.5].forEach(function(o2,q){
    person(MW,hB.x+hB.ux*o2,hB.seat+0.04-0.34*1.05,hB.z+hB.uz*o2,Math.atan2(hB.lx,hB.lz),
      {sc:1.05,rx:0.22,legRx:1.0,armRx:0.4,shirt:q?0x2C3E63:0xF2F2F0,pant:q?0xBFAE8C:0x3D5A80,skin:SKIN[q?3:0],hair:HAIR[q?2:1],shoe:0xEFEFEA});
  });
  /* lying along the purple one */
  var hD=hamm[3];
  person(MW,hD.x-hD.ux*0.35,hD.seat-0.05,hD.z-hD.uz*0.35,Math.atan2(-hD.ux,-hD.uz),
    {sc:1.0,rx:1.25,legRx:0.25,armRx:0.3,shirt:0x9E1B1B,pant:0x24262B,skin:SKIN[2],hair:HAIR[0],shoe:0x24262B});
  /* backpacks on the grass */
  backpack(hA.x+hA.lx*0.9+hA.ux*0.6,hA.z+hA.lz*0.9+hA.uz*0.6,0.4,0x1F9C93,0xD0457A);
  backpack(hB.x+hB.lx*1.0,hB.z+hB.lz*1.0,1.9,0x24262B);
  backpack(hB.x+hB.lx*1.1+hB.ux*0.7,hB.z+hB.lz*1.1+hB.uz*0.7,2.6,0xA8562B);
  backpack(hD.x-hD.lx*0.9,hD.z-hD.lz*0.9,0.9,0x2C3E63);
  /* a few sitting on the slope */
  [[-130,201.5,0.4,0x3F7D45],[-118,203,0.1,0xFFC72C],[-140,221,-0.2,0x9E1B1B]].forEach(function(q,i){
    var p=W(q[0],q[1]), y=gAt(p[0],p[1]), face=q[1]<TC?-1:1;       /* facing down the slope */
    person(MW,p[0],y+0.12-0.34,p[1],Math.atan2(-n[0]*face,-n[1]*face)+q[2],
      {sc:1.0,rx:0.12,legRx:1.45,armRx:0.35,shirt:q[3],pant:0x3D5A80,skin:SKIN[(i+1)%5],hair:HAIR[i%4],shoe:0xEFEFEA});
  });

  /* ---------------------------------------------------------- the pad, table and stool */
  var pc=W(PAD.s,PAD.t), pr=oriRect(pc[0],pc[1],d[0],d[1],PAD.hw,PAD.hw);
  prism(MW,pr,padH-0.2,padH+0.105,0x7E6E5E,0x8A7A68,0.8);
  prism(MW,oriRect(pc[0],pc[1],d[0],d[1],PAD.hw-0.16,PAD.hw-0.16),padH+0.1,padH+0.12,0xB9AE9C,0xB9AE9C,1);
  for(var g2=-2;g2<=2;g2++){
    var o3=g2*(PAD.hw-0.16)/2.5;
    segBox(MW,W(PAD.s+o3,PAD.t-PAD.hw+0.16),W(PAD.s+o3,PAD.t+PAD.hw-0.16),padH+0.12,padH+0.125,0.02,0xA09581,1);
    segBox(MW,W(PAD.s-PAD.hw+0.16,PAD.t+o3),W(PAD.s+PAD.hw-0.16,PAD.t+o3),padH+0.12,padH+0.125,0.02,0xA09581,1);
  }
  var py=padH+0.12, MET=0x2E3236, tq=W(PAD.s+0.2,PAD.t-0.1), sq=W(PAD.s+0.25,PAD.t+0.65), rot=Math.atan2(d[0],d[1]);
  addGeo(MW,new T.BoxGeometry(0.85,0.04,0.85),mtx(tq[0],py+0.74,tq[1],0,rot,0),solid(MET,0.95));
  addGeo(MW,new T.CylinderGeometry(0.05,0.05,0.72,6),mtx(tq[0],py+0.37,tq[1]),solid(MET,0.8));
  addGeo(MW,new T.BoxGeometry(0.55,0.03,0.55),mtx(tq[0],py+0.015,tq[1],0,rot,0),solid(MET,0.8));
  addGeo(MW,new T.CylinderGeometry(0.2,0.2,0.04,10),mtx(sq[0],py+0.46,sq[1]),solid(MET,0.95));
  addGeo(MW,new T.CylinderGeometry(0.035,0.035,0.44,6),mtx(sq[0],py+0.22,sq[1]),solid(MET,0.8));
  addCollider(oriRect(tq[0],tq[1],d[0],d[1],0.45,0.45),py+0.76);
  addCollider(oriRect(sq[0],sq[1],d[0],d[1],0.22,0.22),py+0.48);

  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  var mf=new T.Mesh(MF.geom(),new T.MeshLambertMaterial({vertexColors:true,flatShading:true,side:T.DoubleSide}));
  mf.frustumCulled=false; mf.castShadow=true; mf.receiveShadow=true; scene.add(mf);
  window.__hammock={trees:trees.length,hammocks:hamm.length,padH:padH,tris:idx.length/3,at:hillAt};
})();
