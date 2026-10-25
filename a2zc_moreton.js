/* ==================================================================
   Moreton Fig: the restaurant on the ground floor of Steven and Kathryn
   Sample Hall and its patio round the Moreton Bay fig, on Trousdale
   between the Student Union and Zumberge Hall. a_world.js sets MORETON
   (frame on Sample Hall's east wall: u out toward Trousdale, v along
   the wall toward Zumberge), cuts the walks, adds the crowd's hidden
   lanes and keeps the generic hedges, lamps, benches and trees off it.

   From photos:
   - The fig: one huge, low, spreading Moreton Bay fig with buttress
     roots, pale grey bark, a few great limbs and a broad dark canopy,
     in a round raised planter with a cast stone rim and river rocks.
     String lights hang from its limbs to the building and the lamps.
   - Red brick herringbone paving; a black iron picket fence round the
     patio, open to Trousdale, to the walk west toward TCC and up the
     passage between Sample Hall and the Student Union, which the patio
     paves through to the TCC courtyard.
   - The restaurant front: red brick on a cast stone base with cast
     stone bands, tall glass doors in green frames under round arches of
     alternating dark and cream voussoirs with pierced lattice tympana,
     sconces, MORETON FIG on the string course; brick upper floors with
     green framed windows on cast stone sills. A wooden bar counter.
   - Tables in white tablecloths with dark wicker armchairs on green cushions,
     two long wood tables, leather sofas round a low table, black market umbrellas,
     lamp posts.
   One Mesher for everything solid, one textured mesh each for the
   paving, the arch heads and the fence, instanced tables, umbrellas
   and bulbs, and the wires as one line set.
   ================================================================== */
(function(){
  if(typeof MORETON==='undefined'||!MORETON) return;
  var F=MORETON, P=F.P, loc=F.loc, du=F.du, dv=F.dv;
  var MW=new Mesher(), MB=new Mesher(), cols=[], ARCH=[], FENCE=[], WIRES=[], BULBS=[];
  var YAW=Math.atan2(-du[1],du[0]);            /* rotation.y that turns local x,z into u,v */
  var BRICK=0x9C4A37, CAST=0xD9CDB2, CASTL=0xE6DCC6, CASTD=0xBDAF94, FRAME=0x2D4A3B,
      GLASS=0x34444A, GLASSL=0x4E6168, BRONZE=0x3A3128, IRON=0x1A1B1D, WOOD=0x7A5638,
      WOODD=0x5A3E29, TOPW=0x9C8468, WICK=0x45372B, WICKL=0x5A4837, CUSH=0x86B24A, LEATH=0xA0612F,
      BARK=0xC9C2B4, CLOTH=0xF2F1EC, CLOTHD=0xFAF9F5, RIM=0xCBBEA2;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function hsh(i){ var h=Math.sin(i*12.9898+78.233)*43758.5453; return h-Math.floor(h); }
  function lp(u,y,v){ var p=P(u,v); return [p[0],y,p[1]]; }
  function R(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function solid(r,h){ cols.push([r,h]); }

  /* a quad whose face points away from c (convex pieces) */
  function qOut(M,a,b,c,d,ctr,ca,cb,cc,cd){
    var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    var mx=(a[0]+b[0]+c[0]+d[0])/4-ctr[0], my=(a[1]+b[1]+c[1]+d[1])/4-ctr[1], mz=(a[2]+b[2]+c[2]+d[2])/4-ctr[2];
    if(nx*mx+ny*my+nz*mz>=0) M.quad(a,b,c,d,ca,cb,cc,cd); else M.quad(a,d,c,b,ca,cd,cc,cb);
  }
  /* a box from a map W(s,t)->[x,z]; built face by face, so no thin cap is lost (no triangulation) */
  function cub(M,W,s0,s1,t0,t1,y0,y1,col,sh,noBack){
    var c=rgb(col,1), cd=rgb(col,sh===undefined?0.62:sh), cb=rgb(col,0.5);
    function C(s,t,y){ var p=W(s,t); return [p[0],y,p[1]]; }
    var A=C(s0,t0,y0),B=C(s1,t0,y0),Cc=C(s1,t1,y0),D=C(s0,t1,y0),E=C(s0,t0,y1),G=C(s1,t0,y1),H=C(s1,t1,y1),I=C(s0,t1,y1);
    var m=C((s0+s1)/2,(t0+t1)/2,(y0+y1)/2);
    qOut(M,E,G,H,I,m,c,c,c,c);
    if(y0>0.2) qOut(M,A,B,Cc,D,m,cb,cb,cb,cb);
    if(!noBack) qOut(M,A,B,G,E,m,cd,cd,c,c);
    qOut(M,B,Cc,H,G,m,cd,cd,c,c); qOut(M,Cc,D,I,H,m,cd,cd,c,c); qOut(M,D,A,E,I,m,cd,cd,c,c);
  }
  /* a wall frame: s from local point A to B, t out of the wall toward hint */
  function Frame(A,B,hint){
    var o=P(A[0],A[1]), e=P(B[0],B[1]), L=Math.hypot(e[0]-o[0],e[1]-o[1]);
    var d=[(e[0]-o[0])/L,(e[1]-o[1])/L], h=[du[0]*hint[0]+dv[0]*hint[1], du[1]*hint[0]+dv[1]*hint[1]];
    var n=[-d[1],d[0]]; if(n[0]*h[0]+n[1]*h[1]<0) n=[d[1],-d[0]];
    return {o:o,d:d,n:n,L:L,W:function(s,t){ return [o[0]+d[0]*s+n[0]*t, o[1]+d[1]*s+n[1]*t]; }};
  }
  function fb(Fr,s0,s1,t0,t1,y0,y1,col,sh){ cub(MW,Fr.W,s0,s1,t0,t1,y0,y1,col,sh,t0<0.01); }
  function farch(Fr,s,t,y0,w,hs,ha,col,sh){ var p=Fr.W(s,t); archFace(MW,p[0],p[1],-Fr.n[1],Fr.n[0],0,0,y0,w,hs,ha,col,sh); }
  function fsolid(Fr,s0,s1,t0,t1,h){ cols.push([ccw([Fr.W(s0,t0),Fr.W(s1,t0),Fr.W(s1,t1),Fr.W(s0,t1)]),h]); }
  /* three.js geometry into a Mesher through a matrix, colour per vertex from fn(x,y,z) or a hex */
  var D3=new T.Object3D(), V3=new T.Vector3();
  function mat(x,y,z,rx,ry,rz,sx,sy,sz){ D3.position.set(x,y,z); D3.rotation.set(rx||0,ry||0,rz||0);
    D3.scale.set(sx===undefined?1:sx,sy===undefined?1:sy,sz===undefined?1:sz); D3.updateMatrix(); return D3.matrix.clone(); }
  function part(M,geo,col,m,sh){
    var g=geo.index?geo.toNonIndexed():geo, p=g.attributes.position.array, fn=typeof col==='function'?col:null, c=fn?null:rgb(col,sh||1);
    function tp(i){ V3.set(p[i],p[i+1],p[i+2]).applyMatrix4(m); return [V3.x,V3.y,V3.z]; }
    for(var i=0;i<p.length;i+=9){ var a=tp(i), b=tp(i+3), d=tp(i+6);
      if(fn) M.tri(a,b,d,fn(a),fn(b),fn(d)); else M.tri(a,b,d,c,c,c); }
  }
  /* local (u,y,v) -> world, for geometry built in the patio frame */
  var FM=new T.Matrix4().compose(new T.Vector3(F.O[0],0,F.O[1]),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),YAW),new T.Vector3(1,1,1));
  function lmat(u,y,v,rx,ry,rz,sx,sy,sz){ return FM.clone().multiply(mat(u,y,v,rx,ry,rz,sx,sy,sz)); }
  function inst(M,list,mt){
    var g=M.geom(), im=new T.InstancedMesh(g,mt||matWorld,Math.max(1,list.length)), D=new T.Object3D();
    list.forEach(function(q,i){ D.position.set(q[0],q[3]||0,q[1]); D.rotation.set(0,q[2]||0,0); D.scale.set(1,1,1);
      D.updateMatrix(); im.setMatrixAt(i,D.matrix); });
    im.count=list.length; im.frustumCulled=false; im.raycast=function(){}; scene.add(im); return im;
  }

  /* ---- the old lawn trees off the patio ---- */
  for(var i=TREE_POS.length-1;i>=0;i--) if(inRing(F.zone,TREE_POS[i][0],TREE_POS[i][1])) TREE_POS.splice(i,1);
  NO_LAWN_TREES.push(offsetRing(F.zone,1.0));

  /* ================= the paving: red brick herringbone ================= */
  flat(MB,F.zone,0.15,0xFFFFFF,1);

  /* ================= the restaurant front ================= */
  var T0=0.3, HT=18.4;
  var FE=Frame([0,0],[0,32.65],[1,0]),            /* east wall, on the patio and Trousdale */
      FS=Frame([0,32.65],[-25.94,32.56],[0,1]),   /* south wall, on the fig court */
      FN=Frame([0,0],[-25.05,-0.55],[0,-1]),      /* north wall, on the passage to TCC */
      FR=Frame([-25.05,-0.55],[-25.08,-2.79],[1,0]);   /* the short return where TCC's limestone end begins */
  function archHead(Fr,c,y){ var a=Fr.W(c-1.58,T0+0.1), b=Fr.W(c+1.58,T0+0.1); ARCH.push([a,b,y,1.58]); }
  function front(Fr,ext0,ext1,nb,sign){
    var L=Fr.L, pitch=L/nb, k, c;
    fb(Fr,-ext0,L+ext1,0,T0,0,HT,BRICK,0.6); fsolid(Fr,-ext0,L+ext1,0,T0+0.05,HT);
    var cs=[]; for(k=0;k<nb;k++) cs.push((k+0.5)*pitch);
    /* ground storey: base, bands and imposts on the piers between the arches */
    var piers=[[-ext0,cs[0]-1.2]]; for(k=0;k<nb-1;k++) piers.push([cs[k]+1.2,cs[k+1]-1.2]); piers.push([cs[nb-1]+1.2,L+ext1]);
    piers.forEach(function(pr){ var a=pr[0], b=pr[1]; if(b-a<0.05) return;
      fb(Fr,a,b,T0,T0+0.07,0,0.95,CAST,0.66); fb(Fr,a,b,T0,T0+0.09,0.95,1.08,CASTL,0.8);
      fb(Fr,a,b,T0,T0+0.05,1.75,1.95,CAST,0.75); fb(Fr,a,b,T0,T0+0.05,2.65,2.85,CAST,0.75);
      fb(Fr,a,b,T0,T0+0.08,3.5,3.72,CASTL,0.8); });
    cs.forEach(function(c){
      /* green framed glass doors, transom and mullions, the arch head (texture) over them */
      farch(Fr,c,T0+0.012,0.12,2.5,3.6,0,FRAME,1);
      farch(Fr,c,T0+0.022,0.2,2.26,2.42,0,GLASS,1);
      farch(Fr,c,T0+0.022,2.8,2.26,0.85,0,GLASSL,1);
      fb(Fr,c-1.18,c+1.18,T0,T0+0.07,2.62,2.8,FRAME,0.8);
      [-0.38,0.38].forEach(function(o){ fb(Fr,c+o-0.04,c+o+0.04,T0,T0+0.06,0.12,3.7,FRAME,0.8); });
      [-1.17,1.17].forEach(function(o){ fb(Fr,c+o-0.06,c+o+0.06,T0,T0+0.07,0.12,3.72,FRAME,0.8); });
      fb(Fr,c-1.3,c+1.3,T0,T0+0.14,0,0.12,CASTD,0.7);                 /* threshold */
      archHead(Fr,c,3.72);
      /* windows on the three floors above: green frames, cast stone sill and head */
      [6.95,10.75,14.55].forEach(function(y){
        farch(Fr,c,T0+0.045,y,2.14,2.42,0,FRAME,1);
        farch(Fr,c,T0+0.055,y+0.08,1.94,2.26,0,GLASS,1);
        [-0.33,0.33].forEach(function(o){ fb(Fr,c+o-0.035,c+o+0.035,T0,T0+0.08,y,y+2.42,FRAME,0.8); });
        fb(Fr,c-1.0,c+1.0,T0,T0+0.08,y+1.55,y+1.61,FRAME,0.8);
        fb(Fr,c-1.25,c+1.25,T0,T0+0.13,y-0.2,y,CAST,0.72);
        fb(Fr,c-1.2,c+1.2,T0,T0+0.07,y+2.42,y+2.68,CAST,0.78);
      });
    });
    /* sconces on the piers */
    for(k=0;k<nb-1;k++){ c=(cs[k]+cs[k+1])/2;
      fb(Fr,c-0.1,c+0.1,T0,T0+0.12,2.95,3.38,BRONZE,0.8);
      cub(MW,Fr.W,c-0.08,c+0.08,T0+0.12,T0+0.26,3.02,3.3,0xFFE9B8,1.25); }
    /* string course, floor bands, thin stripes and the top band under Sample Hall's cornice */
    fb(Fr,-ext0,L+ext1,T0,T0+0.13,5.55,6.05,CASTL,0.72);
    fb(Fr,-ext0,L+ext1,T0,T0+0.06,6.05,6.25,CAST,0.7);
    [9.6,13.4].forEach(function(y){ fb(Fr,-ext0,L+ext1,T0,T0+0.08,y,y+0.3,CAST,0.74); });
    [8.25,12.05,15.85].forEach(function(y){ fb(Fr,-ext0,L+ext1,T0,T0+0.035,y,y+0.14,CAST,0.8); });
    fb(Fr,-ext0,L+ext1,T0,T0+0.1,17.45,HT,CAST,0.74);
    return cs;
  }
  var csE=front(FE,T0,T0,6), csS=front(FS,0,0,5), csN=front(FN,0,0,5);
  /* the return: brick and bands only */
  (function(){ var Fr=FR, L=Fr.L;
    fb(Fr,0,L,0,T0,0,HT,BRICK,0.6); fsolid(Fr,0,L,0,T0+0.05,HT);
    fb(Fr,0,L,T0,T0+0.07,0,0.95,CAST,0.66); fb(Fr,0,L,T0,T0+0.09,0.95,1.08,CASTL,0.8);
    [1.75,2.65].forEach(function(y){ fb(Fr,0,L,T0,T0+0.05,y,y+0.2,CAST,0.75); });
    fb(Fr,0,L,T0,T0+0.08,3.5,3.72,CASTL,0.8);
    fb(Fr,0,L,T0,T0+0.13,5.55,6.05,CASTL,0.72); fb(Fr,0,L,T0,T0+0.06,6.05,6.25,CAST,0.7);
    [9.6,13.4].forEach(function(y){ fb(Fr,0,L,T0,T0+0.08,y,y+0.3,CAST,0.74); });
    fb(Fr,0,L,T0,T0+0.1,17.45,HT,CAST,0.74);
  })();
  /* the name on the string course, over the middle pier of the east front and the middle door of the south */
  (function(){
    var p=FE.W(FE.L/2,T0+0.14); facadeText('MORETON FIG',p[0],p[1],FE.n[0],FE.n[1],5.8,6.4,0.48,'#F4EAD2');
    var q=FS.W(csS[2],T0+0.14); facadeText('MORETON FIG',q[0],q[1],FS.n[0],FS.n[1],5.8,5.0,0.42,'#2E2620');
  })();

  /* ================= the outdoor bar against the south front, on the pier west of the middle door ================= */
  (function(){
    var Fr=FS, a=(csS[1]+csS[2])/2-1.3, b=a+2.6;
    for(var k=0;k<10;k++){ var s0=a+k*0.26; fb(Fr,s0,s0+0.26,T0+0.25,T0+0.95,0,1.06,k%2?WOOD:0x84603F,0.7); }
    fb(Fr,a-0.08,b+0.08,T0+0.18,T0+1.1,1.06,1.13,WOODD,0.8);
    fb(Fr,a-0.04,b+0.04,T0+0.28,T0+0.92,0,0.12,0x2B2420,0.8);
    fsolid(Fr,a-0.08,b+0.08,T0+0.18,T0+1.1,1.13);
    /* bottles on the back shelf and three stools */
    fb(Fr,a+0.2,b-0.2,T0,T0+0.22,1.4,1.46,WOODD,0.8);
    for(k=0;k<9;k++) fb(Fr,a+0.35+k*0.24,a+0.43+k*0.24,T0+0.05,T0+0.13,1.46,1.74,[0x3C6A3A,0x8A5A2A,0x2F4F6A,0xC9B27A][k%4],1.0);
    [0.5,1.3,2.1].forEach(function(o){ var p=Fr.W(a+o,T0+1.5);
      part(MW,new T.CylinderGeometry(0.04,0.06,0.74,6),IRON,mat(p[0],0.37,p[1]));
      part(MW,new T.CylinderGeometry(0.2,0.2,0.07,10),WICK,mat(p[0],0.76,p[1])); });
  })();

  /* ================= the planter and the Moreton Bay fig ================= */
  var TC=[1.5,40.8], PR=4.0;
  (function(){
    var n=30, rIn=PR-0.32, yR=0.46, cr=rgb(RIM,1), crd=rgb(RIM,0.62), ct=rgb(0xD8CCB2,1);
    for(var k=0;k<n;k++){
      var a0=k/n*6.2832, a1=(k+1)/n*6.2832;
      var o0=lp(TC[0]+Math.cos(a0)*PR,0,TC[1]+Math.sin(a0)*PR), o1=lp(TC[0]+Math.cos(a1)*PR,0,TC[1]+Math.sin(a1)*PR);
      var i0=lp(TC[0]+Math.cos(a0)*rIn,0,TC[1]+Math.sin(a0)*rIn), i1=lp(TC[0]+Math.cos(a1)*rIn,0,TC[1]+Math.sin(a1)*rIn);
      var mid=lp(TC[0],yR/2,TC[1]);
      qOut(MW,[o0[0],0,o0[2]],[o1[0],0,o1[2]],[o1[0],yR,o1[2]],[o0[0],yR,o0[2]],mid,crd,crd,cr,cr);
      /* the inner face looks toward the trunk */
      var ic=lp(TC[0]+Math.cos((a0+a1)/2)*(PR+3),yR,TC[1]+Math.sin((a0+a1)/2)*(PR+3));
      qOut(MW,[i0[0],0.3,i0[2]],[i1[0],0.3,i1[2]],[i1[0],yR,i1[2]],[i0[0],yR,i0[2]],ic,crd,crd,cr,cr);
      qOut(MW,[o0[0],yR,o0[2]],[o1[0],yR,o1[2]],[i1[0],yR,i1[2]],[i0[0],yR,i0[2]],[mid[0],-5,mid[2]],ct,ct,ct,ct);
    }
    var bed=[]; for(k=0;k<n;k++){ var a=k/n*6.2832; bed.push(P(TC[0]+Math.cos(a)*rIn,TC[1]+Math.sin(a)*rIn)); }
    flat(MW,ccw(bed),0.3,0x5E5A55,1);
    /* river rocks */
    var RC=[0x8C8984,0x6E6B66,0xA29E96,0x5C5955,0x7F7A72];
    for(k=0;k<110;k++){
      var ra=hsh(k*3.1)*6.2832, rr2=1.9+hsh(k*7.7)*(rIn-2.1), sz=0.1+hsh(k*1.3)*0.13;
      part(MW,new T.DodecahedronGeometry(sz,0),RC[k%5],lmat(TC[0]+Math.cos(ra)*rr2,0.3+sz*0.25,TC[1]+Math.sin(ra)*rr2,hsh(k)*3,hsh(k+1)*3,0,1,0.55,1.2),1);
    }
    var pc=P(TC[0],TC[1]); solid(ccw(ngon(pc[0],pc[1],PR+0.05,14,0)),1.0);
  })();

  /* the tree, built in the local frame (x=u, y, z=v) */
  var TREE_TRIS=0, MCN=null;   /* MCN: the big canopy masses, which cast no shadow so the patio gets dappled shade */
  (function(){
    var MT=MW, n0=MW.count();
    MCN=new Mesher();
    function barkCol(p){ var l=loc([p[0],p[2]]), k=0.8+Math.min(1,p[1]/9)*0.28+(hsh(Math.round(l[0]*3)+Math.round(p[1]*4)*17+Math.round(l[1]*3)*31)-0.5)*0.1;
      return rgb(BARK,k); }
    /* the trunk: a lumpy column, wide at the foot */
    var tg=new T.CylinderGeometry(1.2,1.85,5.0,14,4,false), pa=tg.attributes.position;
    for(var k=0;k<pa.count;k++){ var x=pa.getX(k), z=pa.getZ(k), y=pa.getY(k), a=Math.atan2(z,x);
      var f=1+0.15*Math.sin(a*5+0.7)+0.08*Math.sin(a*3+y*1.3); pa.setX(k,x*f); pa.setZ(k,z*f); }
    part(MT,tg,barkCol,lmat(TC[0],0.3+2.5,TC[1]));
    var crown=new T.IcosahedronGeometry(1.6,1); part(MT,crown,barkCol,lmat(TC[0],5.2,TC[1],0,0,0,1.2,0.7,1.15));
    /* buttress roots: thin fins from high on the trunk down across the rocks to the rim */
    var NF=12;
    for(k=0;k<NF;k++){
      var ang=k/NF*6.2832+hsh(k*5)*0.35, reach=3.2+hsh(k*9)*0.45, top=2.2+hsh(k*2)*1.3, th=0.38+hsh(k*4)*0.2;
      var prof=[[1.2,0.28],[reach,0.3],[reach*0.76,0.55],[reach*0.56,1.05],[1.55,top]];
      var er=[Math.cos(ang),Math.sin(ang)], et=[-Math.sin(ang),Math.cos(ang)];
      var ptL=function(q,sd){ var h=th*(1-0.75*(q[0]-1.2)/(reach-1.2));
        var u=TC[0]+er[0]*q[0]+et[0]*sd*h, v=TC[1]+er[1]*q[0]+et[1]*sd*h; return lp(u,q[1],v); };
      var ctr=lp(TC[0]+er[0]*1.5,0.8,TC[1]+er[1]*1.5);
      var Lp=prof.map(function(q){ return ptL(q,1); }), Rp=prof.map(function(q){ return ptL(q,-1); });
      var side=function(Pp,sd){ var o=lp(TC[0]+er[0]*1.5+et[0]*sd*3,0.8,TC[1]+er[1]*1.5+et[1]*sd*3);
        for(var j=1;j<Pp.length-1;j++){ var a=Pp[0], b=Pp[j], c=Pp[j+1];
          var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
          var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, mx=o[0]-a[0], my=o[1]-a[1], mz=o[2]-a[2];
          if(nx*mx+ny*my+nz*mz>0) MT.tri(a,b,c,barkCol(a),barkCol(b),barkCol(c)); else MT.tri(a,c,b,barkCol(a),barkCol(c),barkCol(b)); } };
      side(Lp,1); side(Rp,-1);
      for(var j=0;j<prof.length;j++){ var j2=(j+1)%prof.length;
        var e0=prof[j], e1=prof[j2], nr=e1[1]-e0[1], ny=-(e1[0]-e0[0]);
        var om=lp(TC[0]+er[0]*((e0[0]+e1[0])/2-nr*2),(e0[1]+e1[1])/2-ny*2,TC[1]+er[1]*((e0[0]+e1[0])/2-nr*2));
        qOut(MT,Lp[j],Lp[j2],Rp[j2],Rp[j],om,barkCol(Lp[j]),barkCol(Lp[j2]),barkCol(Rp[j2]),barkCol(Rp[j])); }
    }
    /* limbs: tapered round pieces between points, a knuckle at each joint */
    var UP=new T.Vector3(0,1,0), Q=new T.Quaternion();
    function seg(A,B,r0,r1){
      var dx=B[0]-A[0], dy=B[1]-A[1], dz=B[2]-A[2], L=Math.hypot(dx,dy,dz);
      var g=new T.CylinderGeometry(r1,r0,L,7,1,true); g.translate(0,L/2,0);
      Q.setFromUnitVectors(UP,new T.Vector3(dx/L,dy/L,dz/L));
      var m=FM.clone().multiply(new T.Matrix4().compose(new T.Vector3(A[0],A[1],A[2]),Q,new T.Vector3(1,1,1)));
      part(MT,g,barkCol,m);
      part(MT,new T.IcosahedronGeometry(r1*1.08,0),barkCol,lmat(B[0],B[1],B[2]));
    }
    /* a limb that curves: one tube along a smooth curve through its control points, its rings scaled
       down from r0 to r1, so it bends without kinks; returns points along it (9, evenly spaced) */
    function curve(pts,r0,r1,n,rad){
      var c=new T.CatmullRomCurve3(pts.map(function(q){ return new T.Vector3(q[0],q[1],q[2]); }),false,'centripetal');
      rad=rad||8;
      var g=new T.TubeGeometry(c,n,1,rad,false), pa=g.attributes.position, C=new T.Vector3();
      for(var i=0;i<=n;i++){ c.getPointAt(i/n,C); var r=r0+(r1-r0)*Math.pow(i/n,0.8);
        for(var j=0;j<=rad;j++){ var k=i*(rad+1)+j;
          pa.setXYZ(k,C.x+(pa.getX(k)-C.x)*r,C.y+(pa.getY(k)-C.y)*r,C.z+(pa.getZ(k)-C.z)*r); } }
      part(MT,g,barkCol,FM);
      var e=c.getPointAt(1); part(MT,new T.IcosahedronGeometry(r1,0),barkCol,lmat(e.x,e.y,e.z));
      return c.getSpacedPoints(8).map(function(v){ return [v.x,v.y,v.z]; });
    }
    function at(sp,t){ var f=t*8, j=Math.min(7,Math.floor(f)), w=f-j, a=sp[j], b=sp[j+1];
      return [a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w,a[2]+(b[2]-a[2])*w]; }
    /* keep a branch tip out of Sample Hall (u<0.6 with v<33.2) and Zumberge (u<5.9 with v>49.6) */
    function clear(e){ if(e[0]<0.8&&e[2]<33.4) e[0]=0.8; if(e[0]<6.1&&e[2]>49.4) e[2]=49.4; return e; }
    /* the great limbs: out low over the patio, then sweeping up, as in the photos. Five leave the trunk
       at different heights; the other four split off them, so they do not all fan from one point.
       [points, r0, r1, parent limb or -1, where on the parent, height on the trunk] */
    var LIMBS=[
      [[[-2.2,5.6,41.2],[-7,6.4,42.6],[-11.6,8.2,41.4],[-15.4,10.6,42.6],[-18.2,12.4,41.8]],1.0,0.2,-1,0,3.7],
      [[[-1.0,5.8,43.4],[-3.8,7.0,45.8],[-6.6,9.4,45.4],[-9.0,12.2,46.4]],0.6,0.16,0,0.3,0],
      [[[2.8,5.9,43.8],[3.4,7.6,46.4],[6.0,10.0,46.6],[8.6,12.8,47.2]],0.82,0.18,-1,0,4.6],
      [[[4.8,5.7,41.4],[7.8,7.0,42.6],[10.4,9.6,41.4],[13.0,12.2,43.0]],0.88,0.18,-1,0,4.1],
      [[[4.2,6.0,38.0],[5.8,7.8,35.0],[6.0,10.4,31.4],[7.8,12.6,27.2]],0.82,0.18,-1,0,5.0],
      [[[2.4,6.2,37.6],[3.0,8.6,34.4],[2.4,11.2,30.8],[3.6,13.6,26.4]],0.5,0.14,4,0.3,0],
      [[[-1.0,6.0,38.4],[-4.6,7.4,37.4],[-8.6,10.0,36.4],[-12.4,12.0,37.6]],0.75,0.18,-1,0,4.4],
      [[[1.4,7.0,40.4],[0.4,10.2,39.8],[-1.4,13.2,41.0],[-2.8,15.4,41.6]],0.7,0.16,-1,0,5.4],
      [[[2.8,6.8,41.6],[4.8,9.8,40.4],[6.8,12.8,40.2],[8.2,14.8,40.8]],0.5,0.14,3,0.32,0]];
    var LP=[], LS=[];
    LIMBS.forEach(function(L){ var c0=L[0][0], start, path;
      if(L[3]<0){ var dx=c0[0]-TC[0], dz=c0[2]-TC[1], dl=Math.hypot(dx,dz)||1;
        start=[TC[0]+dx/dl*0.5,L[5],TC[1]+dz/dl*0.5]; path=[start].concat(L[0]); }
      else { start=at(LS[L[3]],L[4]); path=[start].concat(L[0].slice(1)); }
      var sp=curve(path,L[1],L[2],18,9); LS.push(sp); sp.forEach(function(q,j){ if(j>2) LP.push(q); }); });
    /* side branches off the outer half of each limb, curving up */
    LS.forEach(function(sp,k){ [4,6].forEach(function(j,i){
      var a=sp[j], b=sp[j+1], dx=b[0]-a[0], dz=b[2]-a[2], L=Math.hypot(dx,dz)||1, s=(k+i)%2?1:-1;
      var e=clear([a[0]+(-dz/L*s*2.6)+dx/L*1.2,a[1]+2.6,a[2]+(dx/L*s*2.6)+dz/L*1.2]);
      var sp2=curve([a,[(a[0]+e[0])/2,a[1]+0.9,(a[2]+e[2])/2],e],0.24,0.09,6,6); LP.push(sp2[8]); }); });
    /* aerial roots hanging from the low parts of the limbs */
    LS.forEach(function(sp,k){ if(k>6) return; var r=sp[3+(k%2)], len=r[1]-1.5-hsh(k*3)*1.8;
      part(MT,new T.BoxGeometry(0.05,len,0.05),0x6F6455,lmat(r[0],r[1]-len/2,r[2],0,0,(hsh(k)-0.5)*0.08),1); });
    /* the canopy: separate clumps high over the limbs, with sky between them, kept clear of Sample Hall
       (u<0.6 with v<33.2) and Zumberge (u<5.9 with v>49.6). [u, v, y, radius u, radius y, radius v] */
    var LEAF=[0x3B6A30,0x447436,0x386329,0x4A7B3C];
    var CAN=[];
    LS.forEach(function(sp,k){ [6,7,8].forEach(function(j,i){ var q=sp[j], r=2.2+hsh(k*7+i)*1.1;
      CAN.push([q[0]+(hsh(k*3+i)-0.5)*2.4,q[2]+(hsh(k*5+i)-0.5)*2.4,Math.max(q[1]+1.6,12.6+i*0.7),r,1.4+hsh(k+i*9)*0.4,r*(0.85+hsh(k*11+i)*0.3)]); }); });
    [[1,41,17.4,3.4,1.8,3.2],[-4,44,16.2,3.0,1.6,2.8],[6,37,16.4,3.0,1.6,2.8],[-6,39,15.6,2.6,1.5,2.6],[5,45,15.8,2.6,1.5,2.4],
     [10,40,15.0,2.4,1.4,2.4],[-12,41,14.4,2.6,1.4,2.4],[4,30,15.2,2.4,1.4,2.6]].forEach(function(c){ CAN.push(c); });
    var cgL=new T.IcosahedronGeometry(1,1), q2=cgL.attributes.position;
    for(var k2=0;k2<q2.count;k2++){ var x2=q2.getX(k2), y2=q2.getY(k2), z2=q2.getZ(k2);
      var f2=1+(hsh(Math.round(x2*40)*7+Math.round(y2*40)*131+Math.round(z2*40)*977)-0.5)*0.3; q2.setXYZ(k2,x2*f2,y2*f2,z2*f2); }
    CAN.forEach(function(c,k){
      if(c[0]-c[3]<0.6&&c[1]-c[5]<33.2){ c[5]=Math.max(1.6,c[1]-33.2); if(c[1]-c[5]<33.2) c[3]=Math.max(1.6,c[0]-0.6); }
      if(c[0]-c[3]<5.9&&c[1]+c[5]>49.6){ c[5]=Math.max(1.6,49.6-c[1]); if(c[1]+c[5]>49.6) c[3]=Math.max(1.6,c[0]-5.9); }
      var base=LEAF[k%4], y0=c[2]-c[4], y1=c[2]+c[4];
      var fn=function(p){ var t=(p[1]-y0)/(y1-y0), v=0.74+0.4*t+(hsh(Math.round(p[0]*5)+Math.round(p[2]*7)*13+k)-0.5)*0.18; return rgb(base,v); };
      /* every third clump casts no shadow, so the patio gets dappled light rather than full shade */
      part(k%3===0?MCN:MT,cgL,fn,lmat(c[0],c[2],c[1],0,k*0.7,0,c[3],c[4],c[5]));
      /* a twig from the nearest branch up into the clump */
      var tgt=[c[0],c[2]-c[4]*0.4,c[1]], best=null, bd=1e9;
      LP.forEach(function(q){ var d=Math.hypot(q[0]-tgt[0],q[1]-tgt[1],q[2]-tgt[2]); if(q[1]<tgt[1]&&d<bd){ bd=d; best=q; } });
      if(best&&bd>1.0&&bd<9) seg(best,tgt,0.14,0.06);
    });
    TREE_TRIS=MW.count()-n0+MCN.count();
    var cm=new T.Mesh(MCN.geom(),new T.MeshLambertMaterial({vertexColors:true,flatShading:true,emissive:0x0E180B})); cm.frustumCulled=false; cm.raycast=function(){}; scene.add(cm);
    /* string light hubs: the point on a limb nearest each of the old hub spots, low enough to sling from */
    var low=[]; LS.forEach(function(sp){ sp.forEach(function(q){ if(q[1]<9.5) low.push(q); }); });
    F.hubs=[[-8.5,5.4,41.8],[-4.0,6.0,46.0],[6.6,6.6,33.4],[8.5,5.8,42.0],[-6.0,7.4,36.6],[-15,6.6,42.6],[4.2,6.4,46.4],[3.0,7.2,33.6]].map(function(h){
      var best=h, bd=1e9; low.forEach(function(q){ var d=Math.hypot(q[0]-h[0],q[1]-h[1],q[2]-h[2]); if(d<bd){ bd=d; best=q; } }); return best.slice(); });
  })();

  /* ================= the fence: iron pickets on a low cast stone kerb ================= */
  var FU=6.0, FV=47.25, FW=-26.0;
  var FL=[[[FU,1.0],[FU,14.2]],[[FU,17.2],[FU,43.2]],[[FW,32.75],[FW,40.3]],[[FW,43.9],[FW,FV]],[[FW,FV],[3.4,FV]]];
  var FH=1.15;
  FL.forEach(function(s){
    var A=P(s[0][0],s[0][1]), B=P(s[1][0],s[1][1]), L=Math.hypot(B[0]-A[0],B[1]-A[1]);
    segBox(MW,A,B,0,0.14,0.26,CASTD,0.7);
    FENCE.push([A,B,L]);
    var np=Math.max(1,Math.round(L/2.4));
    for(var k=0;k<=np;k++){ var t=k/np, x=A[0]+(B[0]-A[0])*t, z=A[1]+(B[1]-A[1])*t;
      postAt(MW,x,z,0.14,FH+0.12,0.04,IRON,0.8); postAt(MW,x,z,FH+0.12,FH+0.18,0.06,IRON,0.9); }
    var ux=(B[0]-A[0])/L, uz=(B[1]-A[1])/L;
    solid(ccw([[A[0]-uz*0.15,A[1]+ux*0.15],[B[0]-uz*0.15,B[1]+ux*0.15],[B[0]+uz*0.15,B[1]-ux*0.15],[A[0]+uz*0.15,A[1]-ux*0.15]]),FH);
  });

  /* ================= lamps, urns ================= */
  [[5.45,0.4],[5.45,14.0],[5.45,17.4],[5.45,43.65],[-25.5,33.3],[-25.5,46.9],[-13.5,-6.7],[-2.5,-6.3]].forEach(function(q){
    var p=P(q[0],q[1]); campusLamp(MW,p[0],p[1],4.2,false); });
  /* cast stone urns with shrubs beside the doors */
  var urn=function(u,v){
    var p=P(u,v), prof=[[0,0],[0.26,0],[0.22,0.12],[0.16,0.42],[0.34,0.62],[0.42,0.8],[0.38,0.86],[0,0.86]].map(function(q){ return new T.Vector2(q[0],q[1]); });
    part(MW,new T.LatheGeometry(prof,10),CASTL,mat(p[0],0,p[1]),0.9);
    part(MW,new T.IcosahedronGeometry(0.42,0),0x3D6A30,mat(p[0],1.12,p[1],0,0,0,1,0.8,1));
    solid(ccw(ngon(p[0],p[1],0.42,8,0)),1.0);
  };
  [[0.75,(csE[1]+csE[2])/2],[0.75,(csE[3]+csE[4])/2],[0.75,(csE[4]+csE[5])/2]].forEach(function(q){ urn(q[0],q[1]); });
  (function(){ var p=FS.W((csS[3]+csS[4])/2,T0+0.5), l=loc(p); urn(l[0],l[1]);
    p=FS.W((csS[0]+csS[1])/2,T0+0.5); l=loc(p); urn(l[0],l[1]); })();
  [-20,-8.5].forEach(function(u){ urn(u,-6.9+(u-6.6)*0.036+0.7); });

  /* ================= the lounge: leather sofas round a low table, west of the fig ================= */
  (function(){
    var cu=-5.4, cv=40.8;
    function sofa(u,v,ang,seats){
      var w=0.82*seats;
      part(MW,new T.BoxGeometry(1,1,1),WICK,lmat(u,0.22,v,0,ang,0,0.9,0.44,w+0.24));
      part(MW,new T.BoxGeometry(1,1,1),WICKL,lmat(u,0.0,v,0,ang,0).multiply(mat(-0.36,0.62,0,0,0,0,0.2,0.84,w+0.24)));
      [-1,1].forEach(function(s){ part(MW,new T.BoxGeometry(1,1,1),WICKL,lmat(u,0,v,0,ang,0).multiply(mat(0,0.5,s*(w/2+0.06),0,0,0,0.9,0.56,0.14))); });
      for(var k=0;k<seats;k++){ var z=-w/2+0.41+k*0.82;
        part(MW,new T.BoxGeometry(1,1,1),LEATH,lmat(u,0,v,0,ang,0).multiply(mat(0.05,0.5,z,0,0,0,0.66,0.14,0.78)));
        part(MW,new T.BoxGeometry(1,1,1),LEATH,lmat(u,0,v,0,ang,0).multiply(mat(-0.2,0.78,z,0,0,-0.12,0.16,0.44,0.76))); }
      var r=[], c=Math.cos(-ang), s2=Math.sin(-ang);
      [[-0.48,-w/2-0.14],[0.45,-w/2-0.14],[0.45,w/2+0.14],[-0.48,w/2+0.14]].forEach(function(q){ r.push(P(u+q[0]*c-q[1]*s2,v+q[0]*s2+q[1]*c)); });
      solid(ccw(r),0.8);
    }
    sofa(cu-1.45,cv,0,3);                  /* faces the fig (local +x) */
    sofa(cu,cv-1.5,-Math.PI/2,1);
    sofa(cu,cv+1.5,Math.PI/2,1);
    part(MW,new T.BoxGeometry(1.3,0.08,0.8),WICK,lmat(cu,0.4,cv)); part(MW,new T.BoxGeometry(1.2,0.36,0.7),WICKL,lmat(cu,0.18,cv));
    [-0.3,0.05,0.35].forEach(function(o,k){ part(MW,new T.CylinderGeometry(0.04,0.04,0.12+k*0.04,6),0xF4EEDC,lmat(cu+o,0.5+k*0.02,cv+(k-1)*0.12),1.1); });
  })();

  /* ================= furniture: instanced ================= */
  var box1=new T.BoxGeometry(1,1,1);
  /* a wicker armchair with a green cushion; the sitter faces local +x: woven seat, a back of slats
     leaning back under a rolled top rail, open arms on front posts, four legs */
  function chair(M,x,z,ry){
    var m=function(px,py,pz,sx,sy,sz,rz){ return mat(x,0,z,0,ry,0).multiply(mat(px,py,pz,0,0,rz||0,sx,sy,sz)); };
    part(M,box1,WICK,m(0,0.4,0,0.52,0.08,0.54));
    part(M,box1,CUSH,m(0.03,0.47,0,0.44,0.07,0.46));
    [-0.2,-0.12,-0.04,0.04,0.12,0.2].forEach(function(t,i){ part(M,box1,i%2?WICK:WICKL,m(-0.29,0.7,t,0.035,0.52,0.05,0.2)); });
    part(M,box1,WICK,m(-0.34,0.95,0,0.08,0.08,0.56,0.2)); part(M,box1,WICK,m(-0.25,0.47,0,0.05,0.06,0.52,0.2));
    [-0.26,0.26].forEach(function(t){
      part(M,box1,WICK,m(-0.02,0.67,t,0.54,0.05,0.07));
      part(M,box1,WICKL,m(0.22,0.54,t,0.05,0.26,0.05));
      part(M,box1,WICKL,m(-0.04,0.55,t,0.4,0.16,0.025));
      [-0.22,0.22].forEach(function(q){ part(M,box1,WICK,m(q,0.18,t*0.85,0.045,0.36,0.045)); });
    });
  }
  function around(M,n,r,off){ for(var k=0;k<n;k++){ var a=off+k*6.2832/n; chair(M,Math.cos(a)*r,-Math.sin(a)*r,a+Math.PI); } }
  var SQ=new Mesher(), TWO=new Mesher(), LONG=new Mesher(), UM=new Mesher();
  part(SQ,box1,TOPW,mat(0,0.74,0,0,0,0,0.82,0.04,0.82));
  /* white tablecloths falling most of the way to the paving */
  part(SQ,box1,CLOTH,mat(0,0.5,0,0,0,0,0.96,0.52,0.96),1); part(SQ,box1,CLOTHD,mat(0,0.765,0,0,0,0,0.98,0.02,0.98),1); part(SQ,box1,IRON,mat(0,0.37,0,0,0,0,0.07,0.72,0.07));
  part(SQ,box1,IRON,mat(0,0.02,0,0,0,0,0.56,0.04,0.07)); part(SQ,box1,IRON,mat(0,0.02,0,0,0,0,0.07,0.04,0.56));
  around(SQ,4,0.82,0);
  part(TWO,box1,TOPW,mat(0,0.74,0,0,0,0,0.7,0.04,0.7));
  part(TWO,box1,CLOTH,mat(0,0.5,0,0,0,0,0.84,0.52,0.84),1); part(TWO,box1,CLOTHD,mat(0,0.765,0,0,0,0,0.86,0.02,0.86),1); part(TWO,box1,IRON,mat(0,0.37,0,0,0,0,0.06,0.72,0.06));
  part(TWO,box1,IRON,mat(0,0.02,0,0,0,0,0.45,0.04,0.45));
  chair(TWO,0.76,0,Math.PI); chair(TWO,-0.76,0,0);
  part(LONG,box1,TOPW,mat(0,0.75,0,0,0,0,3.4,0.05,0.92)); part(LONG,box1,WOODD,mat(0,0.72,0,0,0,0,3.2,0.04,0.8));
  [-1.3,1.3].forEach(function(x){ part(LONG,box1,IRON,mat(x,0.36,0,0,0,0,0.07,0.72,0.7)); });
  [-1.1,0,1.1].forEach(function(x){ chair(LONG,x,0.82,Math.PI/2); chair(LONG,x,-0.82,-Math.PI/2); });
  chair(LONG,2.05,0,Math.PI); chair(LONG,-2.05,0,0);
  /* black market umbrella: pole, eight ribs of canopy (both faces), finial */
  (function(){
    part(UM,new T.CylinderGeometry(0.03,0.03,2.6,6),0x2A2A2A,mat(0,1.3,0));
    var ap=[0,2.72,0], rr=1.45, rim=[], k;
    for(k=0;k<8;k++){ var a=k/8*6.2832+0.39; rim.push([Math.cos(a)*rr,2.3,Math.sin(a)*rr]); }
    var ct=rgb(0x262628,1), cu2=rgb(0x1C1C1E,0.75);
    for(k=0;k<8;k++){ var a1=rim[k], b1=rim[(k+1)%8];
      UM.tri(ap,b1,a1,ct,ct,ct); UM.tri(ap,a1,b1,cu2,cu2,cu2);
      UM.quad([a1[0],2.3,a1[2]],[b1[0],2.3,b1[2]],[b1[0]*0.98,2.17,b1[2]*0.98],[a1[0]*0.98,2.17,a1[2]*0.98],ct,ct,ct,ct);
      UM.quad([a1[0]*0.98,2.17,a1[2]*0.98],[b1[0]*0.98,2.17,b1[2]*0.98],[b1[0],2.3,b1[2]],[a1[0],2.3,a1[2]],ct,ct,ct,ct); }
    part(UM,new T.ConeGeometry(0.06,0.18,6),0x2A2A2A,mat(0,2.8,0));
  })();
  var SQL=[], TWL=[], LGL=[], UML=[];
  function put(list,u,v,ry,hr){ var p=P(u,v); list.push([p[0],p[1],ry+YAW]); if(hr) solid(ccw(ngon(p[0],p[1],hr,6,0)),0.8); }
  /* the strip in front of the east front: four-tops on the fence side, umbrellas on every other one */
  [2.8,6.1,9.4,12.4,19.4,22.6,25.8,29.0].forEach(function(v,k){ put(SQL,4.25,v,(hsh(k)-0.5)*0.3,0.5); if(k%2===0) put(UML,4.25,v,0); });
  /* the south court: two long tables, four-tops, two-tops along the front */
  put(LGL,-16.0,38.7,0,0); put(LGL,-16.0,43.0,0,0);
  solid(R(-17.75,-14.25,38.25,39.15),0.8); solid(R(-17.75,-14.25,42.55,43.45),0.8);
  [[-21.4,39.1],[-21.2,43.0],[-10.6,38.6],[-10.6,43.0]].forEach(function(q,k){ put(SQL,q[0],q[1],(hsh(k+9)-0.5)*0.4,0.5); });
  put(UML,-21.4,39.1,0); put(UML,-21.2,43.0,0);
  [-2.6,-4.9,-15.0,-18.2,-21.4,-24.4].forEach(function(u,k){ put(TWL,u,34.1,0,0.42); });
  /* the passage: two-tops along Sample Hall */
  [-21.5,-17.5,-13.5,-9.5,-5.5].forEach(function(u){ put(TWL,u,-0.55+(u+25.05)*0.022-1.05,0,0.42); });
  inst(SQ,SQL); inst(TWO,TWL); inst(LONG,LGL); inst(UM,UML);

  /* ================= string lights: wires and bulbs on catenaries ================= */
  function sling(A,B,sag){
    var L=Math.hypot(B[0]-A[0],B[1]-A[1],B[2]-A[2]), n=Math.max(2,Math.round(L/0.75)), prev=null;
    for(var k=0;k<=n;k++){ var t=k/n, y=A[1]+(B[1]-A[1])*t-sag*L*4*t*(1-t);
      var q=lp(A[0]+(B[0]-A[0])*t,y,A[2]+(B[2]-A[2])*t);
      if(prev) WIRES.push(prev[0],prev[1],prev[2],q[0],q[1],q[2]);
      if(k>0&&k<n) BULBS.push([q[0],q[2],0,q[1]-0.07]);
      prev=q; }
  }
  (function(){
    var H=F.hubs, Sx=function(s,y){ var p=FS.W(s,T0+0.2), l=loc(p); return [l[0],y,l[1]]; },
        Ex=function(s,y){ var p=FE.W(s,T0+0.2), l=loc(p); return [l[0],y,l[1]]; };
    sling(H[0],Sx(csS[2]-2.6,4.9),0.05); sling(H[4],Sx(csS[1]-2.6,4.9),0.05); sling(H[4],Sx(csS[0]+2.6,4.9),0.05);
    sling(H[5],Sx(csS[3]+2.6,4.9),0.05); sling(H[5],[-25.5,4.7,33.3],0.05); sling(H[5],[-25.5,4.7,46.9],0.05);
    sling(H[1],[-25.5,4.7,46.9],0.04); sling(H[6],[5.45,4.7,43.65],0.05); sling(H[3],[5.45,4.7,43.65],0.05);
    sling(H[2],Ex(csE[5]-2.7,4.9),0.05); sling(H[7],Ex(csE[4]+2.7,4.9),0.05); sling(H[2],[5.45,4.7,17.4],0.05);
    sling(H[7],Ex(csE[4]-2.7,4.9),0.05); sling(H[0],H[5],0.03); sling(H[1],H[6],0.03); sling(H[3],H[2],0.03);
    /* across the passage, zigzag between Sample Hall and the Student Union */
    var su=function(u){ return -6.81+(u-6.61)*0.036+0.15; }, sh=function(u){ return -0.55+(u+25.05)*0.022-0.45; };
    for(var u=-23.5;u<4;u+=3.4){ sling([u,4.8,sh(u)],[u+1.7,4.8,su(u+1.7)],0.05); sling([u+1.7,4.8,su(u+1.7)],[u+3.4,4.8,sh(u+3.4)],0.05); }
  })();
  (function(){
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(WIRES,3));
    var ln=new T.LineSegments(g,new T.LineBasicMaterial({color:0x2A2622})); ln.frustumCulled=false; ln.raycast=function(){}; scene.add(ln);
    var BM=new Mesher(); part(BM,new T.OctahedronGeometry(0.045,0),0xFFFFFF,mat(0,0,0));
    var bm=inst(BM,BULBS,new T.MeshBasicMaterial({color:0xFFE2A0})); bm.userData.noShadow=true;
  })();

  /* ================= textures: paving, arch heads, fence ================= */
  /* herringbone brick on the frame (uv from u,v) */
  (function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=512;
    var g=cv.getContext('2d'), U1=32;
    g.fillStyle='#8E8073'; g.fillRect(0,0,512,512);
    function bcol(a,b){ var h=Math.sin(((a%16+16)%16)*127.1+((b%16+16)%16)*311.7)*43758.5453; h-=Math.floor(h);
      var r=Math.round(128+h*38), gg=Math.round(50+h*18), bb=Math.round(44+h*14); if(h>0.84){ r-=30; gg-=12; bb-=4; }
      return 'rgb('+r+','+gg+','+bb+')'; }
    for(var n=-20;n<36;n++) for(var m=-12;m<12;m++){
      var cx=n+4*m;
      g.fillStyle=bcol(cx,n); g.fillRect(cx*U1+1.5,n*U1+1.5,2*U1-3,U1-3);
      g.fillStyle=bcol(cx+100,n+1); g.fillRect(cx*U1+1.5,(n+1)*U1+1.5,U1-3,2*U1-3);
    }
    var tex=new T.CanvasTexture(cv); tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var gb=MB.geom(), pos=gb.attributes.position.array, uv=new Float32Array(pos.length/3*2);
    for(var i2=0;i2<pos.length/3;i2++){ var l=loc([pos[i2*3],pos[i2*3+2]]); uv[i2*2]=l[0]/1.6; uv[i2*2+1]=l[1]/1.6; }
    gb.setAttribute('uv',new T.BufferAttribute(uv,2));
    var mb=new T.Mesh(gb,new T.MeshLambertMaterial({map:tex,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
    mb.receiveShadow=true; mb.frustumCulled=false; scene.add(mb);
  })();
  /* arch heads: dark and cream voussoirs round a pierced cream lattice */
  (function(){
    var cv=document.createElement('canvas'); cv.width=256; cv.height=128;
    var g=cv.getContext('2d'), cx=128, cy=128, RO=127, RI=97, NV=15, k;
    g.clearRect(0,0,256,128);
    for(k=0;k<NV;k++){ var a0=Math.PI+k/NV*Math.PI, a1=Math.PI+(k+1)/NV*Math.PI;
      g.beginPath(); g.moveTo(cx+Math.cos(a0)*RI,cy+Math.sin(a0)*RI); g.arc(cx,cy,RO,a0,a1); g.arc(cx,cy,RI,a1,a0,true); g.closePath();
      g.fillStyle=k%2?'#E4D9C2':'#2B2A2C'; g.fill(); }
    g.beginPath(); g.arc(cx,cy,RI,Math.PI,2*Math.PI); g.closePath(); g.fillStyle='#E2D6BC'; g.fill();
    g.save(); g.beginPath(); g.arc(cx,cy,RI-5,Math.PI,2*Math.PI); g.closePath(); g.clip();
    g.fillStyle='#3A3430';
    for(var row=0;row<12;row++) for(var col=-12;col<=12;col++){
      var x=cx+col*11+(row%2)*5.5, y=cy-6-row*9;
      g.beginPath(); g.moveTo(x,y-4); g.lineTo(x+3.4,y); g.lineTo(x,y+4); g.lineTo(x-3.4,y); g.closePath(); g.fill(); }
    g.restore();
    g.strokeStyle='#C8BBA0'; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,RI,Math.PI,2*Math.PI); g.stroke();
    var tex=new T.CanvasTexture(cv); tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    var IP=[], IU=[];
    ARCH.forEach(function(q){ var a=q[0], b=q[1], y0=q[2], h=q[3];
      IP.push(a[0],y0,a[1], b[0],y0,b[1], b[0],y0+h,b[1],  a[0],y0,a[1], b[0],y0+h,b[1], a[0],y0+h,a[1]);
      IU.push(0,0, 1,0, 1,1,  0,0, 1,1, 0,1); });
    var gg=new T.BufferGeometry();
    gg.setAttribute('position',new T.Float32BufferAttribute(IP,3)); gg.setAttribute('uv',new T.Float32BufferAttribute(IU,2));
    gg.computeVertexNormals(); gg.computeBoundingSphere();
    var m=new T.Mesh(gg,new T.MeshLambertMaterial({map:tex,alphaTest:0.5,side:T.DoubleSide}));
    m.frustumCulled=false; m.userData.noShadow=true; m.raycast=function(){}; scene.add(m);
  })();
  /* the fence pickets */
  (function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=128;
    var g=cv.getContext('2d'); g.clearRect(0,0,128,128); g.fillStyle='#17181A';
    for(var k=0;k<8;k++){ var x=k*16+8; g.fillRect(x-1.5,8,3,120);
      g.beginPath(); g.moveTo(x-3.5,10); g.lineTo(x,0); g.lineTo(x+3.5,10); g.closePath(); g.fill(); }
    g.fillRect(0,14,128,5); g.fillRect(0,118,128,6);
    var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.wrapT=T.ClampToEdgeWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var IP=[], IU=[];
    FENCE.forEach(function(q){ var a=q[0], b=q[1], u=q[2]/1.0, y0=0.14, y1=FH;
      IP.push(a[0],y0,a[1], b[0],y0,b[1], b[0],y1,b[1],  a[0],y0,a[1], b[0],y1,b[1], a[0],y1,a[1]);
      IU.push(0,0, u,0, u,1,  0,0, u,1, 0,1); });
    var gg=new T.BufferGeometry();
    gg.setAttribute('position',new T.Float32BufferAttribute(IP,3)); gg.setAttribute('uv',new T.Float32BufferAttribute(IU,2));
    gg.computeVertexNormals(); gg.computeBoundingSphere();
    var m=new T.Mesh(gg,new T.MeshLambertMaterial({map:tex,alphaTest:0.5,side:T.DoubleSide}));
    m.frustumCulled=false; m.userData.noShadow=true; m.raycast=function(){}; scene.add(m);
  })();

  /* ================= finish ================= */
  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var tp=P(TC[0],TC[1]);
  NAMED_PLACES.push({name:'Moreton Fig',x:tp[0],z:tp[1],h:12,rad:9});
  LABELS.push({name:'Moreton Fig',x:tp[0],z:tp[1],y:5});
  window.__moreton={tris:MW.count()+MB.count()+MCN.count(),tree:TREE_TRIS,instances:SQL.length+TWL.length+LGL.length+UML.length+BULBS.length,
    tables:SQL.length+TWL.length+LGL.length,umbrellas:UML.length,bulbs:BULBS.length,fence:FENCE.length};
})();
