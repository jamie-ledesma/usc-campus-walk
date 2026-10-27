/* ==================================================================
   Game day tailgates on the four lawn triangles of McCarthy Quad (between
   the X walks) and on the lawn in front of Leavey Library (west of the
   quad, between the Social Sciences Building and the quad's west walk).
   Positions in the LEAVEY frame (a_world.js: u grid east, v grid south).

   Pop up canopies in cardinal (and a few in gold) printed USC TROJANS
   with the SC, folding tables in USC print cloths with food, camp
   chairs, USC coolers, flags, and fans in cardinal and gold: some
   dancing, some holding red cups and sipping, some sitting.
   Kept apart from everything else on purpose: no colliders, nothing
   pushed into PATHS, TREE_POS, NO_PLANT or NAMED_PLACES, and its own
   random numbers (never rnd()), so the rest of the map and the crowd
   are exactly as they were. Everything is instanced; the fans animate
   only near the camera and the whole lot hides when it is far away.
   ================================================================== */
var updateTailgate=function(){};
(function(){
  if(typeof LEAVEY==='undefined'||!LEAVEY) return;
  var P=LEAVEY.P, DU=LEAVEY.du, DV=LEAVEY.dv;
  var seed=20261026;
  function rr(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  function rb(a,b){ return a+(b-a)*rr(); }
  var YAW0=Math.atan2(-DU[1],DU[0]);       /* rotation.y that turns local x,z into u,v */

  /* ---------------- where the tailgates may go ---------------- */
  function dLine(u,v,a,b){ var dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz, t=((u-a[0])*dx+(v-a[1])*dz)/L2;
    t=Math.max(0,Math.min(1,t)); return Math.hypot(u-(a[0]+dx*t),v-(a[1]+dz*t)); }
  var X1=[[-10.1,34.6],[43.4,126.2]], X2=[[44,34.5],[-9.8,125.9]];
  var AVOID=[[-27.3,49.7,4.0],[-35.9,39.1,4.0],[-40.6,61.2,2.6],[-12.6,58.9,2.6],[-7.4,90.9,2.6],[-7.3,82.9,2.4]];
  /* m: how far a point must keep from the edges (walks) */
  function inQuad(u,v,m){ return u>-6.4+m&&u<42-m&&v>38+m&&v<122-m&&!(u<-1.5+m&&v<41.7+m)&&dLine(u,v,X1[0],X1[1])>1.8+m&&dLine(u,v,X2[0],X2[1])>1.8+m; }
  function inLawn(u,v,m){ return u>-44.5+m&&u<-13.2-m&&v>32.5+m&&v<61.5-m; }
  function free(u,v,m){ for(var i=0;i<AVOID.length;i++) if(Math.hypot(u-AVOID[i][0],v-AVOID[i][1])<AVOID[i][2]+m) return false; return true; }
  function ok(u,v,m){ return (inQuad(u,v,m)||inLawn(u,v,m))&&free(u,v,m-1.4); }

  /* ---------------- the canopies: one atlas per colourway ---------------- */
  function atlas(roof,ink,val,valInk){
    var cv=document.createElement('canvas'); cv.width=512; cv.height=512;
    var g=cv.getContext('2d');
    g.fillStyle=roof; g.fillRect(0,0,512,320);
    g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
    g.font='900 120px Georgia,"Times New Roman",serif'; g.fillStyle=ink; g.strokeStyle=val; g.lineWidth=6;
    g.strokeText('SC',256,200); g.fillText('SC',256,200);
    g.font='italic bold 44px Georgia,serif'; g.fillText('Trojans',256,112);
    g.fillStyle=val; g.fillRect(0,320,512,96);
    g.fillStyle=valInk; g.fillRect(0,324,512,6); g.fillRect(0,406,512,6);
    g.font='900 60px "Arial Black",Impact,Arial,sans-serif'; g.fillText('USC TROJANS',256,370,480);
    g.fillStyle='#FFFFFF'; g.fillRect(0,480,32,32);
    var t=new T.CanvasTexture(cv); t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return t;
  }
  function tentGeom(){
    var p=[], uv=[], c=[], S=1.5, E=2.15, H=2.95, VH=0.3;
    function tri(a,b,d,ta,tb,td,col){ p.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]); uv.push(ta[0],ta[1],tb[0],tb[1],td[0],td[1]);
      for(var k=0;k<3;k++) c.push(col[0],col[1],col[2]); }
    var W=[1,1,1], cn=[[-S,-S],[S,-S],[S,S],[-S,S]];
    for(var i=0;i<4;i++){ var a=cn[i], b=cn[(i+1)%4];
      /* roof face: base along the bottom of the roof area, apex at its top middle */
      /* seen from outside, a is on the right: the texture runs from b (left) to a (right) */
      tri([a[0],E,a[1]],[b[0],E,b[1]],[0,H,0],[1,1-320/512],[0,1-320/512],[0.5,1],W);
      /* valance */
      var v0=1-416/512, v1=1-320/512;
      tri([a[0],E-VH,a[1]],[b[0],E-VH,b[1]],[b[0],E,b[1]],[1,v0],[0,v0],[0,v1],W);
      tri([a[0],E-VH,a[1]],[b[0],E,b[1]],[a[0],E,a[1]],[1,v0],[0,v1],[1,v1],W);
    }
    /* legs and a cross brace, on the white patch */
    var wu=[0.02,0.02], gr=[0.82,0.83,0.84];
    function boxAt(x0,x1,y0,y1,z0,z1,col){
      var q=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
      for(var k=0;k<4;k++){ var a2=q[k], b2=q[(k+1)%4];
        tri([a2[0],y0,a2[1]],[b2[0],y0,b2[1]],[b2[0],y1,b2[1]],wu,wu,wu,col); tri([a2[0],y0,a2[1]],[b2[0],y1,b2[1]],[a2[0],y1,a2[1]],wu,wu,wu,col); }
    }
    cn.forEach(function(q){ boxAt(q[0]-0.03,q[0]+0.03,0,E,q[1]-0.03,q[1]+0.03,gr); });
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(p,3)); g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    g.setAttribute('color',new T.Float32BufferAttribute(c,3)); g.computeVertexNormals(); g.computeBoundingSphere();
    return g;
  }

  /* ---------------- props: merged three.js parts with a colour each ---------------- */
  function Bag(){ this.p=[]; this.n=[]; this.c=[]; }
  Bag.prototype.add=function(geo,mat,hex){
    var g=geo.index?geo.toNonIndexed():geo, pos=g.attributes.position, nor=g.attributes.normal,
        nm=new T.Matrix3().getNormalMatrix(mat), v=new T.Vector3(), col=new T.Color(hex);
    for(var j=0;j<pos.count;j++){
      v.fromBufferAttribute(pos,j).applyMatrix4(mat); this.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(nor,j).applyMatrix3(nm).normalize(); this.n.push(v.x,v.y,v.z);
      this.c.push(col.r,col.g,col.b);
    }
  };
  Bag.prototype.geom=Mesher.prototype.geom;
  function MT(x,y,z,sx,sy,sz,rx,ry,rz){ return new T.Matrix4().compose(new T.Vector3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)),new T.Vector3(sx||1,sy||1,sz||1)); }
  var BX=new T.BoxGeometry(1,1,1), CY=new T.CylinderGeometry(1,1,1,10);
  var CARD=0x9D2235, GOLD=0xF2C230, IRON=0x2A2B2D;
  /* folding table with a USC cloth and a spread */
  var tab=new Bag();
  tab.add(BX,MT(0,0.755,0,1.84,0.03,0.78),0xF4F2EC);
  tab.add(BX,MT(0,0.5,0,1.86,0.5,0.8),CARD);
  tab.add(BX,MT(0,0.27,0,1.88,0.05,0.82),GOLD);
  tab.add(BX,MT(-0.55,0.86,0.1,0.3,0.2,0.08,0,0.3,0),0xF5C23A);       /* chips */
  tab.add(BX,MT(-0.15,0.8,-0.15,0.42,0.06,0.28),0xC9CCCF);            /* foil tray */
  tab.add(CY,MT(0.3,0.85,0.18,0.05,0.18,0.05),0xC4161C);              /* cups */
  tab.add(CY,MT(0.42,0.85,0.18,0.05,0.18,0.05),0xF6F4EF);
  tab.add(CY,MT(0.65,0.88,-0.12,0.12,0.24,0.12),0xB5793A);            /* pretzel jar */
  tab.add(BX,MT(0.05,0.85,0.22,0.08,0.16,0.06),0xC21E26);              /* ketchup */
  tab.add(BX,MT(-0.75,0.84,-0.2,0.2,0.14,0.16),0x2E6B3A);
  tab.add(BX,MT(0.35,0.9,-0.18,0.24,0.26,0.16),0xE8B23A);              /* another bag, a box of wings, buns */
  tab.add(BX,MT(-0.35,0.81,0.2,0.3,0.08,0.2),0xB0521F); tab.add(CY,MT(0.75,0.8,0.25,0.1,0.06,0.1),0xE9D3A0);
  /* the USC print: gold marks on the cloth */
  for(var px=-0.8;px<=0.81;px+=0.32) for(var py=0.38;py<=0.66;py+=0.14){ var ofs=((Math.round(py*7))%2)?0.16:0;
    tab.add(BX,MT(px+ofs,py,-0.405,0.08,0.06,0.005),GOLD); tab.add(BX,MT(px+ofs,py,0.405,0.08,0.06,0.005),GOLD); }
  /* camp chair: red seat, gold back with a red band, armrests, legs */
  var chr=new Bag();
  chr.add(BX,MT(0,0.42,0,0.5,0.05,0.46),CARD);
  chr.add(BX,MT(0,0.72,0.24,0.5,0.56,0.04,-0.15),GOLD);
  chr.add(BX,MT(0,0.76,0.25,0.5,0.12,0.042,-0.15),CARD);
  [-0.26,0.26].forEach(function(x){ chr.add(BX,MT(x,0.6,0,0.05,0.04,0.46),IRON);
    chr.add(BX,MT(x,0.21,-0.19,0.03,0.44,0.03),IRON); chr.add(BX,MT(x,0.21,0.19,0.03,0.44,0.03),IRON); });
  /* coolers: USC red with a gold lid and SC, and a white one */
  var cR=new Bag();
  cR.add(BX,MT(0,0.2,0,0.66,0.4,0.42),0xC0161E); cR.add(BX,MT(0,0.43,0,0.68,0.07,0.44),0xF4C21E);
  cR.add(BX,MT(0,0.22,-0.212,0.16,0.22,0.01),0xF4C21E); cR.add(BX,MT(0,0.48,0,0.4,0.03,0.05),0xF6F4EF);
  var cW=new Bag();
  cW.add(BX,MT(0,0.22,0,0.72,0.44,0.44),0xE9EBEC); cW.add(BX,MT(0,0.47,0,0.74,0.07,0.46),0x9EA4A8);
  cW.add(BX,MT(-0.39,0.32,0,0.04,0.06,0.3),0x7E8488); cW.add(BX,MT(0.39,0.32,0,0.04,0.06,0.3),0x7E8488);
  /* a flag on a pole */
  var flg=new Bag();
  flg.add(CY,MT(0,1.9,0,0.025,3.8,0.025),0xD8D8D2);
  flg.add(BX,MT(0.62,3.3,0,1.2,0.78,0.02),CARD); flg.add(BX,MT(0.62,3.3,0,1.2,0.16,0.024),GOLD);

  /* ---------------- lay out the tailgates ---------------- */
  var TENTS=[[],[]], TABLES=[], CHAIRS=[], COOLR=[], COOLW=[], FLAGS=[], FANS=[];
  function W(u,v){ return P(u,v); }
  function put(list,u,v,yawLocal,y){ var p=W(u,v); list.push([p[0],y||0,p[1],YAW0+yawLocal]); }
  function rot(x,z,a){ var c=Math.cos(a), s=Math.sin(a); return [x*c+z*s,-x*s+z*c]; }
  /* first the canopies, so everything else can keep out of all of them */
  var SITES=[];
  for(var gv=36;gv<=124;gv+=6.3) for(var gu=-46;gu<=44;gu+=5.9){
    var cu=gu+rb(-0.9,0.9)+((Math.round(gv/6.3)%2)?2.2:0), cv=gv+rb(-0.9,0.9);
    if(!ok(cu,cv,2.2)||rr()<0.08) continue;
    SITES.push({u:cu,v:cv,a:Math.floor(rr()*4)*Math.PI/2+rb(-0.08,0.08),gold:rr()<0.24});
  }
  /* inside a canopy (other than `own`), with a margin, in that canopy's own frame */
  function underTent(u,v,own,m){
    for(var i=0;i<SITES.length;i++){ var S=SITES[i]; if(S===own) continue;
      var l=rot(u-S.u,v-S.v,-S.a); if(Math.abs(l[0])<1.5+m&&Math.abs(l[1])<1.5+m) return true; }
    return false;
  }
  /* props and people already placed, so nobody stands in a cooler or in someone else */
  var OB=[];
  function clear(u,v){ for(var i=0;i<OB.length;i++){ var q=OB[i]; if(Math.hypot(u-q[0],v-q[1])<q[2]) return false; }
    for(i=0;i<FANS.length;i++) if(Math.hypot(u-FANS[i].u,v-FANS[i].v)<0.75) return false; return true; }
  /* every canopy's four legs */
  SITES.forEach(function(S){ [[-1.5,-1.5],[1.5,-1.5],[1.5,1.5],[-1.5,1.5]].forEach(function(c){ var o=rot(c[0],c[1],S.a); OB.push([S.u+o[0],S.v+o[1],0.45]); }); });
  SITES.forEach(function(S){
    var cu=S.u, cv=S.v, a=S.a, k;
    put(TENTS[S.gold?1:0],cu,cv,a);
    /* under the canopy: the table, chairs; at the edge: coolers, sometimes a flag */
    var o=rot(0,-0.35,a); put(TABLES,cu+o[0],cv+o[1],a);
    var nc=1+Math.floor(rr()*3);
    /* chairs on the open side, turned to the table, and someone in most of them */
    for(k=0;k<nc;k++){ var cx=-1.0+k*1.0+rb(-0.15,0.15), oc=rot(cx,0.62,a), ca=a+rb(-0.35,0.35); put(CHAIRS,cu+oc[0],cv+oc[1],ca); OB.push([cu+oc[0],cv+oc[1],0.55]);
      if(rr()<0.7) FANS.push({u:cu+oc[0],v:cv+oc[1],sit:1,fu:-Math.sin(ca),fv:-Math.cos(ca)}); }
    /* one or two coolers behind it, one on each side */
    var ncool=1+(rr()<0.5?1:0);
    for(k=0;k<ncool;k++){ var side=ncool===1?(rr()<0.5?-1:1):(k?1:-1), ok2=rot(side*rb(0.45,1.25),-1.55-rb(0,0.4),a);
      if(!underTent(cu+ok2[0],cv+ok2[1],S,0.45)&&free(cu+ok2[0],cv+ok2[1],0)){ put(rr()<0.7?COOLR:COOLW,cu+ok2[0],cv+ok2[1],a+rb(-0.5,0.5)); OB.push([cu+ok2[0],cv+ok2[1],0.75]); } }
    if(rr()<0.35){ var of=rot(1.6,1.6,a); if(ok(cu+of[0],cv+of[1],0.5)&&!underTent(cu+of[0],cv+of[1],S,0.3)) { put(FLAGS,cu+of[0],cv+of[1],rb(0,6.28)); OB.push([cu+of[0],cv+of[1],0.4]); } }
    /* fans in a knot beside it, facing each other, clear of every other canopy */
    var nf=3+Math.floor(rr()*5), ga=rb(0,6.283), gx=cu+Math.cos(ga)*2.4, gz=cv+Math.sin(ga)*2.4;
    for(k=0;k<nf;k++){
      for(var tries=0;tries<12;tries++){
        var ang=rb(0,6.283), r=rb(0.7,1.5), fu=gx+Math.cos(ang)*r, fv=gz+Math.sin(ang)*r;
        if(!ok(fu,fv,0.6)||Math.hypot(fu-cu,fv-cv)<1.75||underTent(fu,fv,S,0.45)||!clear(fu,fv)) continue;
        var tu=gx+rb(-0.3,0.3)-fu, tv=gz+rb(-0.3,0.3)-fv, tl=Math.hypot(tu,tv)||1;
        FANS.push({u:fu,v:fv,sit:0,dance:rr()<0.3?1:0,fu:tu/tl,fv:tv/tl}); break;
      }
    }
  });

  /* ---------------- build the props ---------------- */
  function inst(geo,mat,list){
    var im=new T.InstancedMesh(geo,mat,Math.max(1,list.length)), D=new T.Object3D();
    list.forEach(function(q,i){ D.position.set(q[0],q[1],q[2]); D.rotation.set(0,q[3],0); D.updateMatrix(); im.setMatrixAt(i,D.matrix); });
    im.count=list.length; im.frustumCulled=false; im.raycast=function(){}; scene.add(im); return im;
  }
  var tg=tentGeom(), lam=new T.MeshLambertMaterial({vertexColors:true,flatShading:true}), ALL=[];
  ALL.push(inst(tg,new T.MeshLambertMaterial({map:atlas('#A3202F','#F2C230','#9D1B2A','#F2C230'),vertexColors:true,side:T.DoubleSide}),TENTS[0]));
  ALL.push(inst(tg,new T.MeshLambertMaterial({map:atlas('#F2C230','#9D1B2A','#A3202F','#F2C230'),vertexColors:true,side:T.DoubleSide}),TENTS[1]));
  ALL.push(inst(tab.geom(),lam,TABLES)); ALL.push(inst(chr.geom(),lam,CHAIRS));
  ALL.push(inst(cR.geom(),lam,COOLR)); ALL.push(inst(cW.geom(),lam,COOLW)); ALL.push(inst(flg.geom(),lam,FLAGS));

  /* ---------------- the fans: built like the students, kit tinted per instance ---------------- */
  var head=new Bag(), hair=new Bag(), cap=new Bag(), body=new Bag(), arm=new Bag(), leg=new Bag(), cup=new Bag();
  head.add(new T.IcosahedronGeometry(0.37,0),MT(0,0.37,0,1.0,1.03,0.95),0xFFFFFF);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT(-0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT( 0.145,0.365,-0.315),0x1B1B20);
  hair.add(new T.IcosahedronGeometry(0.385,0),MT(0,0.415,0.045,1.0,0.86,0.98),0xFFFFFF);
  cap.add(new T.CylinderGeometry(0.255,0.400,0.24,7),MT(0,0.615,0.01),0xFFFFFF);
  cap.add(new T.BoxGeometry(0.33,0.06,0.24),MT(0,0.512,-0.30),0xFFFFFF);
  body.add(new T.CylinderGeometry(0.300,0.360,0.42,8),MT(0,0.21,0),0xFFFFFF);
  body.add(new T.CylinderGeometry(0.33,0.33,0.12,8),MT(0,0.37,0),0xFFFFFF);
  arm.add(new T.CylinderGeometry(0.082,0.072,0.29,5),MT(0,-0.145,0),0xFFFFFF);
  leg.add(new T.CylinderGeometry(0.105,0.098,0.26,5),MT(0,-0.13,0),0xFFFFFF);
  leg.add(new T.BoxGeometry(0.195,0.115,0.25),MT(0,-0.305,-0.03),0x333333);
  cup.add(new T.CylinderGeometry(0.075,0.055,0.17,8),MT(0,0,0),0xD0141C);
  cup.add(new T.CylinderGeometry(0.078,0.078,0.02,8),MT(0,0.08,0),0xF6F4EF);
  var NF=FANS.length, mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  function mk(b){ var m=new T.InstancedMesh(b.geom(),mat,Math.max(1,NF)); m.count=NF; m.frustumCulled=false;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.raycast=function(){}; scene.add(m); ALL.push(m); return m; }
  var IH=mk(head), IHR=mk(hair), ICP=mk(cap), IB=mk(body), IAL=mk(arm), IAR=mk(arm), ILL=mk(leg), ILR=mk(leg), ICU=mk(cup);
  var PARTS=[IH,IHR,ICP,IB,IAL,IAR,ILL,ILR,ICU];
  var SKIN=[0xF7DCC2,0xF0C6A0,0xE3AC82,0xCE9163,0xB27548,0x915934,0x714128,0x54301D];
  var HAIR=[0x1B1512,0x2E1F14,0x4A2F1B,0x6E4A22,0xB08A48,0x8A3D22];
  var SHIRT=[0x9D2235,0x9D2235,0xA51E2E,0x8E1B2A,0xF2C230,0xF6C62E,0xF2F1EC,0x2A2A2E,0x9D2235,0xF2C230];
  var PANT=[0x3B4F72,0xB8A47E,0x2A2A2E,0x6B7A8F,0xC9B48A,0x9D2235];
  var CAPC=[0x9D2235,0xF2C230,0xF2F1EC,0x9D2235];
  var col=new T.Color(), Z=new T.Matrix4().makeScale(0,0,0);
  function tint(m,i,h){ col.setHex(h); m.setColorAt(i,col); }
  FANS.forEach(function(f,i){
    var sk=SKIN[(rr()*SKIN.length)|0], sh=SHIRT[(rr()*SHIRT.length)|0];
    f.cap=rr()<0.55; f.cup=f.dance?rr()<0.5:rr()<0.75; f.sc=rb(1.0,1.16); f.ph=rb(0,6.28); f.sp=rb(0.8,1.25);
    f.yaw=Math.atan2(-(f.fu*DU[0]+f.fv*DV[0]),-(f.fu*DU[1]+f.fv*DV[1]));
    var p=W(f.u,f.v); f.x=p[0]; f.z=p[1];
    tint(IH,i,sk); tint(IAL,i,sk); tint(IAR,i,sk); tint(IB,i,sh); tint(IHR,i,HAIR[(rr()*HAIR.length)|0]); tint(ICP,i,CAPC[(rr()*CAPC.length)|0]);
    var pt=PANT[(rr()*PANT.length)|0]; tint(ILL,i,pt); tint(ILR,i,pt); tint(ICU,i,0xFFFFFF);
  });
  PARTS.forEach(function(m){ if(m.instanceColor) m.instanceColor.needsUpdate=true; });

  var _r=new T.Matrix4(), _p=new T.Matrix4(), _o=new T.Matrix4(), _a=new T.Matrix4(), _q=new T.Quaternion(), _v=new T.Vector3(), _s=new T.Vector3(1,1,1), _e=new T.Euler();
  function part(m,i,x,y,z,rx,rz){ _e.set(rx||0,0,rz||0); _q.setFromEuler(_e); _p.compose(_v.set(x,y,z),_q,_s); _o.multiplyMatrices(_r,_p); m.setMatrixAt(i,_o); return _o; }
  function pose(f,i,t){
    var sc=f.sc, ph=f.ph+t*f.sp, y=0, yaw=f.yaw, bodyRx=-0.04, aL=0.12, aR=0.12, lL=0, lR=0, rzL=0, rzR=0, hx=0;
    if(f.sit){ y=0.43-0.34*sc; aL=0.55; aR=f.cup?1.15+Math.max(0,Math.sin(ph*0.7)-0.8)*4.0:0.55; lL=1.25; lR=1.15; }
    else if(f.dance){
      var b=Math.sin(ph*5.2); y=Math.abs(b)*0.13; yaw+=Math.sin(ph*1.7)*0.45;
      aL=2.5+Math.sin(ph*5.2)*0.45; aR=2.5-Math.sin(ph*5.2)*0.45; rzL=0.35+Math.sin(ph*2.6)*0.3; rzR=-0.35-Math.sin(ph*2.6)*0.3;
      lL=Math.max(0,b)*0.45; lR=Math.max(0,-b)*0.45; hx=Math.sin(ph*5.2)*0.12;
    } else {
      var sip=Math.max(0,Math.sin(ph*0.55)-0.82)*5.5;          /* now and then a sip */
      aR=f.cup?0.95+sip*0.9:0.12+Math.sin(ph*0.9)*0.08; aL=0.15+Math.max(0,Math.sin(ph*1.3+1))*0.5; yaw+=Math.sin(ph*0.4)*0.12;
      hx=-sip*0.25;
    }
    _e.set(0,yaw,0); _q.setFromEuler(_e); _s.set(sc,sc,sc); _r.compose(_v.set(f.x,y,f.z),_q,_s); _s.set(1,1,1);
    part(IB,i,0,0.34,0,bodyRx); part(IH,i,0,0.735,0,hx);
    if(f.cap){ part(ICP,i,0,0.735,0,hx); IHR.setMatrixAt(i,Z); } else { part(IHR,i,0,0.735,0,hx); ICP.setMatrixAt(i,Z); }
    part(IAL,i,-0.295,0.74,0,aL,rzL);
    var arm=part(IAR,i,0.295,0.74,0,aR,rzR);
    if(f.cup){ _a.copy(arm); _e.set(-aR+Math.min(0.9,Math.max(0,aR-1.6)),0,-rzR); _q.setFromEuler(_e); _p.compose(_v.set(0,-0.33,0),_q,_s);
      ICU.setMatrixAt(i,_o.multiplyMatrices(_a,_p)); } else ICU.setMatrixAt(i,Z);
    part(ILL,i,-0.125,0.36,0,lL); part(ILR,i,0.125,0.36,0,lR);
  }
  var clock=0, frame=0, near=true, CEN=P(10,72);
  for(var i=0;i<NF;i++) pose(FANS[i],i,0);
  updateTailgate=function(dt){
    var dx=camera.position.x-CEN[0], dz=camera.position.z-CEN[1], d2=dx*dx+dz*dz, nr=d2<420*420;
    if(nr!==near){ near=nr; ALL.forEach(function(m){ m.visible=nr; }); }
    if(!nr||d2>170*170) return;                         /* far: hidden, or frozen in the last pose */
    clock+=Math.min(dt,0.1); frame++;
    var half=frame&1;                                   /* each fan moves at half the frame rate */
    for(var i=half;i<NF;i+=2) pose(FANS[i],i,clock);
    PARTS.forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
  };
  window.__tailgate={tents:TENTS[0].length+TENTS[1].length,tables:TABLES.length,chairs:CHAIRS.length,coolers:COOLR.length+COOLW.length,flags:FLAGS.length,fans:NF};
})();
