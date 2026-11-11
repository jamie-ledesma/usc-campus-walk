/* ==================================================================
   USC Village plaza (Hecuba's Central Piazza), built with VK.
   The plaza is a rectangle on the campus grid (OSM way 727175816, about
   70 x 55 m) between McCarthy Honors (clock tower, Dulce under its
   arcade), Irani, McMorrow, Bohnett and the Cowlings half of Building 9;
   PLAZAS[2] in a_world.js runs wall to wall round it.
   Frame G: origin at the fountain centre (from the OSM water way), u along
   the campus grid (grid east, the fountain's long axis), v grid south.
   - Paving: red brick field (VK.MP, uv on the grid) with 4.4 m squares of
     pale stone triangles framed by brick bands and split by brick
     diagonals, a darker soldier course round the edge.
   - The long fountain: low grey granite rim and coping, pebble floor seen
     through the water, two rows of arcing jets (one mesh).
   - Hecuba, Queen of Troy (Christopher Slatoff, 2017): 12 ft bronze queen,
     veiled and crowned, right arm raised in appeal, left hand gathering her
     robe, on a bronze drum with six relief women joined by a ribbon, on a
     granite plinth and three round steps; she faces campus (Tommy Trojan).
   - Red umbrellas over black tables and chairs (one instanced mesh, yellow
     for Dulce along McCarthy), kept out of the crowd's walking lanes.
   - Black Village lamp posts with two hanging lanterns, bollards, square
     planters with trees, benches facing the fountain.
   - The "USC Village" monument signs (cast stone panel on a brick wall, a
     brick pier with a stone pinnacle and bronze seal, agaves in front) at
     the Jefferson paseo (with the USC sign opposite), Hoover and McClintock.
   ================================================================== */
(function(){
  if(typeof VK==='undefined') return;
  var C=VK.C, M=VK.M, MG=VK.MG, VPL=window.__vplaza={};
  var seed=20170817; function R(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  var O=[27,-517.75], G=VK.frame(O,[0.8829,0.4695]);
  var RING=PLAZAS[2];
  var VLAMPS=[];                                  /* every Village lantern, so the umbrellas keep clear of them */
  var Y0=0.14;                                   /* paving level: above the generic walks (0.132) */
  var V3=new T.Vector3(), D3=new T.Object3D();
  function W(u,v){ return G.P(u,v); }
  function pos(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function rect(u0,u1,v0,v1){ return pos([W(u0,v0),W(u1,v0),W(u1,v1),W(u0,v1)]); }
  function circ(x,z,r,n){ return pos(ngon(x,z,r,n||24,0)); }
  function mat(x,y,z,ry,sx,sy,sz,rx,rz){ D3.position.set(x,y,z); D3.rotation.set(rx||0,ry||0,rz||0);
    D3.scale.set(sx===undefined?1:sx,sy===undefined?sx||1:sy,sz===undefined?sx||1:sz); D3.updateMatrix(); return D3.matrix.clone(); }
  /* any three.js geometry into a Mesher, through a matrix */
  function part(Mx,geo,col,m,sh){
    var g=geo.index?geo.toNonIndexed():geo, p=g.attributes.position.array, c=rgb(col,sh||1);
    function tp(i){ V3.set(p[i],p[i+1],p[i+2]); if(m) V3.applyMatrix4(m); return [V3.x,V3.y,V3.z]; }
    for(var i=0;i<p.length;i+=9) Mx.tri(tp(i),tp(i+3),tp(i+6),c,c,c);
  }
  function segDist(x,z,a,b){ var dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1e-9;
    var t=((x-a[0])*dx+(z-a[1])*dz)/L2; t=t<0?0:(t>1?1:t); return Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z); }
  function edgeDist(ring,x,z){ var b=1e9; for(var i=0;i<ring.length;i++) b=Math.min(b,segDist(x,z,ring[i],ring[(i+1)%ring.length])); return b; }
  var cols=[];                                   /* colliders, added at the end */

  /* ---------------- the crowd's lanes: every walk near the plaza ---------------- */
  var LANES=[];
  PATHS.forEach(function(p){
    if(p.w<1.6) return;
    for(var i=0;i<p.pts.length-1;i++){ var a=p.pts[i], b=p.pts[i+1];
      if(Math.max(a[0],b[0])<-140||Math.min(a[0],b[0])>160||Math.max(a[1],b[1])<-600||Math.min(a[1],b[1])>-400) continue;
      LANES.push([a,b,p.w*0.5]); }
  });
  function laneGap(x,z){ var g=1e9; for(var i=0;i<LANES.length;i++) g=Math.min(g,segDist(x,z,LANES[i][0],LANES[i][1])-LANES[i][2]); return g; }

  /* ---------------- key places in G ---------------- */
  var FU=8.8, FV=3.3;                            /* fountain half length and half width */
  var HX=62, HZ=-496;                            /* Hecuba (world.txt point) */
  var HL=G.loc([HX,HZ]);
  var face=[-65,500], fl=Math.hypot(face[0],face[1]); face=[face[0]/fl,face[1]/fl];   /* toward Tommy Trojan */
  var HYAW=Math.atan2(face[0],face[1]);
  var STEP_R=[3.5,2.9,2.3];
  var PLANTERS=[[-1.5,13.2],[10.5,13.2]];        /* G (u,v): south of the fountain, out of the lanes */
  function inFountain(u,v,pad){ return Math.abs(u)<FU+pad&&Math.abs(v)<FV+pad; }

  /* ================================================================ paving */
  (function(){
    /* the brick field, textured with the kit's paver texture, red tinted, uv along the grid */
    var tint=[0.84,0.54,0.47], f=triangulate(RING);
    for(var i=0;i<f.length;i++){
      var A=RING[f[i][0]], B=RING[f[i][1]], D=RING[f[i][2]];
      var la=G.loc(A), lb=G.loc(B), ld=G.loc(D);
      var cr=(B[0]-A[0])*(D[1]-A[1])-(B[1]-A[1])*(D[0]-A[0]);
      if(cr<0) VK.MP.tri([A[0],Y0,A[1]],[B[0],Y0,B[1]],[D[0],Y0,D[1]],[la[0]/2,la[1]/2],[lb[0]/2,lb[1]/2],[ld[0]/2,ld[1]/2],tint);
      else     VK.MP.tri([A[0],Y0,A[1]],[D[0],Y0,D[1]],[B[0],Y0,B[1]],[la[0]/2,la[1]/2],[ld[0]/2,ld[1]/2],[lb[0]/2,lb[1]/2],tint);
    }
    /* the squares: four pale triangles each, between brick bands and the two brick diagonals */
    var CS=4.4, hb=0.30, hd=0.15*Math.SQRT2, y=Y0+0.02, n=0;
    var lo=[1e9,1e9], hi=[-1e9,-1e9];
    RING.forEach(function(p){ var l=G.loc(p); lo[0]=Math.min(lo[0],l[0]); lo[1]=Math.min(lo[1],l[1]); hi[0]=Math.max(hi[0],l[0]); hi[1]=Math.max(hi[1],l[1]); });
    var pale=[[1.04,1.0,0.97],[1.0,0.96,0.93]], tri=[[hb+hd,hb],[CS-hb-hd,hb],[CS/2,CS/2-hd]];
    for(var i0=Math.floor(lo[0]/CS);i0<=Math.ceil(hi[0]/CS);i0++) for(var j0=Math.floor(lo[1]/CS);j0<=Math.ceil(hi[1]/CS);j0++){
      var u0=i0*CS, v0=j0*CS, ok=true;
      [[0,0],[CS,0],[CS,CS],[0,CS],[CS/2,CS/2]].forEach(function(o){ var p=W(u0+o[0],v0+o[1]);
        if(!inRing(RING,p[0],p[1])||edgeDist(RING,p[0],p[1])<0.9) ok=false; });
      if(!ok) continue;
      if(u0+CS>-FU-0.7&&u0<FU+0.7&&v0+CS>-FV-0.7&&v0<FV+0.7) continue;          /* the fountain and its brick apron */
      var cu=Math.max(u0,Math.min(HL[0],u0+CS)), cv=Math.max(v0,Math.min(HL[1],v0+CS));
      if(Math.hypot(cu-HL[0],cv-HL[1])<STEP_R[0]+0.7) continue;               /* Hecuba's steps */
      var skipP=false; PLANTERS.forEach(function(q){ if(Math.abs(q[0]-(u0+CS/2))<CS&&Math.abs(q[1]-(v0+CS/2))<CS) skipP=true; });
      if(skipP) continue;
      var k=0.97+R()*0.06;
      /* the four sides of the square: base along the side, apex toward the centre */
      [[[u0,v0],[1,0],[0,1]],[[u0+CS,v0],[0,1],[-1,0]],[[u0+CS,v0+CS],[-1,0],[0,-1]],[[u0,v0+CS],[0,-1],[1,0]]].forEach(function(sd,si){
        var P=tri.map(function(t){ return W(sd[0][0]+sd[1][0]*t[0]+sd[2][0]*t[1], sd[0][1]+sd[1][1]*t[0]+sd[2][1]*t[1]); });
        var c=pale[si%2].map(function(x){ return x*k; }), L0=G.loc(P[0]), L1=G.loc(P[1]), L2=G.loc(P[2]);
        var cr=(P[1][0]-P[0][0])*(P[2][1]-P[0][1])-(P[1][1]-P[0][1])*(P[2][0]-P[0][0]);
        /* pavers on the diagonal of the square, a finer course than the field */
        var t0=[(L0[0]+L0[1])/1.4,(L0[0]-L0[1])/1.4], t1=[(L1[0]+L1[1])/1.4,(L1[0]-L1[1])/1.4], t2=[(L2[0]+L2[1])/1.4,(L2[0]-L2[1])/1.4];
        if(cr<0) VK.MP.tri([P[0][0],y,P[0][1]],[P[1][0],y,P[1][1]],[P[2][0],y,P[2][1]],t0,t1,t2,c);
        else     VK.MP.tri([P[0][0],y,P[0][1]],[P[2][0],y,P[2][1]],[P[1][0],y,P[1][1]],t0,t2,t1,c);
      });
      n++;
    }
    /* a darker soldier course round the edge */
    var e=offsetRing(RING,-0.35); if(e){ e.push(e[0]); ribbon(MG,e,0.45,Y0+0.01,0x86402F,1); }
    VPL.squares=n;
  })();

  /* ================================================================ the fountain */
  (function(){
    var RW=0.55, RT=0.47, WY=0.41, GR=0x8E8C87, GRL=0xADAAA3;
    function gb(u0,u1,v0,v1,y0,y1,col,sh){ prism(M,rect(u0,u1,v0,v1),y0,y1,col,col,sh===undefined?0.62:sh); }
    /* a low granite rim, its coping a little proud */
    gb(-FU,FU,-FV,-FV+RW,Y0,RT,GR); gb(-FU,FU,FV-RW,FV,Y0,RT,GR);
    gb(-FU,-FU+RW,-FV+RW,FV-RW,Y0,RT,GR); gb(FU-RW,FU,-FV+RW,FV-RW,Y0,RT,GR);
    var e=0.05;
    gb(-FU-e,FU+e,-FV-e,-FV+RW,RT,RT+0.06,GRL,0.8); gb(-FU-e,FU+e,FV-RW,FV+e,RT,RT+0.06,GRL,0.8);
    gb(-FU-e,-FU+RW,-FV+RW,FV-RW,RT,RT+0.06,GRL,0.8); gb(FU-RW,FU+e,-FV+RW,FV-RW,RT,RT+0.06,GRL,0.8);
    /* water over a floor of dark river pebbles in swirls */
    flat(MG,rect(-FU+RW,FU-RW,-FV+RW,FV-RW),WY,0xA9CCD3,1);
    var pc=[0x5F6967,0x77817E,0x8E9894,0x4E5856];
    for(var i=0;i<70;i++){
      var u=(R()*2-1)*(FU-RW-0.6), v=(R()*2-1)*(FV-RW-0.5), r=0.25+R()*0.45, sq=0.5+R()*0.5, rot=R()*3.14, ring=[];
      for(var k=0;k<7;k++){ var a=k/7*6.2832, cu=Math.cos(a)*r, cv=Math.sin(a)*r*sq;
        ring.push(W(u+cu*Math.cos(rot)-cv*Math.sin(rot), v+cu*Math.sin(rot)+cv*Math.cos(rot))); }
      flat(MG,pos(ring),WY+0.012,pc[i%4],1);
    }
    cols.push([rect(-FU-e,FU+e,-FV-e,FV+e),1.0]);
    /* jets: from each long rim, arcing in over the water, staggered */
    var reach=2.6, ha=1.45, NJ=9, P=[], N=[];
    var arc=new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(0,0,0),new T.Vector3(0,ha*2,reach*0.5),new T.Vector3(0,0,reach)),10,0.045,5,false).toNonIndexed();
    var ap=arc.attributes.position.array, an=arc.attributes.normal.array, nm=new T.Matrix3();
    [-1,1].forEach(function(sd){
      for(var k=0;k<NJ;k++){
        var u=-FU+1.2+(2*FU-2.4)*(k+(sd>0?0.25:0.75))/NJ, p=W(u,sd*(FV-RW*0.6));
        var yaw=Math.atan2(-sd*G.dv[0],-sd*G.dv[1]);      /* local +z points across the basin */
        var m=mat(p[0],RT+0.02,p[1],yaw,1,0.85+0.3*R(),1); nm.getNormalMatrix(m);
        for(var q=0;q<ap.length;q+=3){ V3.set(ap[q],ap[q+1],ap[q+2]).applyMatrix4(m); P.push(V3.x,V3.y,V3.z);
          V3.set(an[q],an[q+1],an[q+2]).applyMatrix3(nm).normalize(); N.push(V3.x,V3.y,V3.z); }
      }
    });
    var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(P,3)); g.setAttribute('normal',new T.Float32BufferAttribute(N,3));
    var jm=new T.Mesh(g,new T.MeshLambertMaterial({color:0xE6F4FB,emissive:0x1E3440,transparent:true,opacity:0.72}));
    jm.frustumCulled=false; jm.raycast=function(){}; jm.userData.noShadow=true; scene.add(jm);
    VPL.jets=2*NJ;
  })();

  /* ================================================================ Hecuba */
  (function(){
    var GRA=0x48484B, GRT=0x5A5A5E, BR=0x4D3D2C, BRL=0x5E4B37, BRP=0x4A4838;
    /* three round granite steps and a plinth */
    var ys=[Y0,Y0+0.17,Y0+0.34,Y0+0.51];
    for(var i=0;i<3;i++){ var r=circ(HX,HZ,STEP_R[i],32); prism(M,r,ys[i],ys[i+1],GRA,GRT,0.6); cols.push([r,ys[i+1]]); }
    var pl=circ(HX,HZ,1.35,24); prism(M,pl,ys[3],ys[3]+0.38,0x3E3E41,0x505054,0.6);
    var B0=ys[3]+0.38;                             /* base of the bronze drum */
    var base=new T.Matrix4().makeTranslation(HX,0,HZ).multiply(new T.Matrix4().makeRotationY(HYAW));
    function L(x,y,z,ry,sx,sy,sz,rx,rz){ return base.clone().multiply(mat(x,y,z,ry,sx,sy,sz,rx,rz)); }
    function lathe(pts,seg,col,m,ps,pl2){ part(M,new T.LatheGeometry(pts.map(function(p){ return new T.Vector2(p[0],p[1]); }),seg,ps||0,pl2||6.2832),col,m); }
    /* the drum: moulded foot, the shaft with the six women, cornice */
    lathe([[0.001,0],[1.12,0],[1.12,0.12],[1.0,0.2],[0.95,0.3],[0.93,1.6],[0.97,1.7],[1.08,1.78],[1.08,1.92],[0.98,2.0],[0.94,2.05],[0.001,2.06]],20,BR,L(0,B0,0));
    var ic=new T.IcosahedronGeometry(1,1), ic0=new T.IcosahedronGeometry(1,0);
    for(i=0;i<6;i++){
      var a=(i+0.5)/6*6.2832, ca=Math.cos(a), sa=Math.sin(a), rd=0.9;
      part(M,ic,BRL,L(sa*rd,B0+0.95,ca*rd,a,0.17,0.52,0.1));                         /* robed body */
      part(M,ic0,BRL,L(sa*(rd+0.03),B0+1.5,ca*(rd+0.03),a,0.085,0.1,0.085));          /* head */
      part(M,ic0,BRL,L(sa*rd+ca*0.14,B0+1.22,ca*rd-sa*0.14,a,0.05,0.22,0.06,0,0.5));  /* an arm reaching to the next */
    }
    var rib=[]; for(i=0;i<48;i++){ var b=i/48*6.2832; rib.push(new T.Vector3(Math.sin(b)*0.99,B0+1.2+0.28*Math.sin(b*3+0.6),Math.cos(b)*0.99)); }
    part(M,new T.TubeGeometry(new T.CatmullRomCurve3(rib,true),48,0.035,4,true),BRP,base);
    /* the queen, 3.66 m, on a thin bronze base */
    var y0=B0+2.06;
    lathe([[0.001,y0],[0.62,y0],[0.62,y0+0.06],[0.001,y0+0.06]],16,BR,L(0,0,0));
    var robe=[[0.001,0],[0.56,0],[0.5,0.25],[0.43,0.8],[0.37,1.3],[0.31,1.65],[0.29,1.9],[0.31,2.2],[0.33,2.42],[0.3,2.58],[0.16,2.7],[0.07,2.76]];
    lathe(robe.map(function(p){ return [p[0],p[1]+y0+0.06]; }),14,BR,L(0,0,0,0,1,1,0.8));
    var yb=y0+0.06;
    /* folds down the front of the robe */
    [-0.75,-0.35,0.05,0.42,0.8].forEach(function(a,k){ var rr2=0.43;
      part(M,ic0,BRL,L(Math.sin(a)*rr2*0.98,yb+0.65+k%2*0.1,Math.cos(a)*rr2*0.8,a,0.05,0.62,0.05)); });
    /* the mantle down her back, hood over the head */
    lathe([[0.15,yb+2.98],[0.2,yb+2.86],[0.33,yb+2.62],[0.41,yb+2.3],[0.47,yb+1.6],[0.55,yb+0.6],[0.6,yb+0.04]],10,BRP,L(0,0,-0.02,0,1,1,0.85),Math.PI*0.5,Math.PI);
    part(M,new T.CylinderGeometry(0.06,0.07,0.16,8),BR,L(0,yb+2.8,0));               /* neck */
    part(M,new T.SphereGeometry(0.13,10,8),BRL,L(0,yb+3.0,0.01,0,0.92,1.12,1));        /* head */
    part(M,new T.SphereGeometry(0.155,10,6,0,6.2832,0,1.7),BRP,L(0,yb+2.99,-0.03,0,1,1.1,1));   /* veil */
    part(M,new T.CylinderGeometry(0.13,0.14,0.08,10),BRL,L(0,yb+3.13,-0.01));          /* diadem */
    function limb(a,b,r0,r1,col){ var dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2], l=Math.sqrt(dx*dx+dy*dy+dz*dz);
      var g=new T.CylinderGeometry(r1,r0,l,8); g.translate(0,l/2,0);
      var q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(dx/l,dy/l,dz/l));
      var m=new T.Matrix4().compose(new T.Vector3(a[0],a[1],a[2]),q,new T.Vector3(1,1,1));
      part(M,g,col||BR,base.clone().multiply(m)); }
    /* right arm raised forward in appeal, a hanging sleeve under it */
    var S=[0.3,yb+2.6,0.02], E=[0.5,yb+2.76,0.34], H=[0.58,yb+3.08,0.62];
    limb(S,E,0.1,0.13); limb(E,H,0.075,0.05,BRL);
    part(M,ic0,BRL,L(H[0]+0.02,H[1]+0.06,H[2]+0.04,0.3,0.06,0.11,0.035,-0.3));         /* open hand */
    part(M,ic0,BRP,L(0.47,yb+2.48,0.3,0.4,0.09,0.32,0.13,0.3));                         /* sleeve */
    /* left arm down, the hand gathering the robe */
    var S2=[-0.3,yb+2.6,0.02], E2=[-0.38,yb+2.14,0.07], H2=[-0.22,yb+1.86,0.24];
    limb(S2,E2,0.1,0.09); limb(E2,H2,0.07,0.055,BRL);
    part(M,ic0,BRL,L(H2[0],H2[1],H2[2],0,0.07,0.08,0.07));
    part(M,ic0,BRP,L(-0.27,yb+1.25,0.27,0,0.1,0.6,0.08,0.12,0.1));                       /* gathered folds */
    cols.push([circ(HX,HZ,1.4,16),B0+2.1]);
    VPL.hecubaTop=yb+3.2;
  })();

  /* ================================================================ planters, benches, lamps, bollards */
  (function(){
    /* square planters with a cast stone coping, shrubs and a tree */
    PLANTERS.forEach(function(q){
      var r=rect(q[0]-1.5,q[0]+1.5,q[1]-1.5,q[1]+1.5), cq=W(q[0],q[1]);
      prism(M,r,Y0,0.58,C.BRICK,0x4A3A2B,0.6);
      for(var e=0;e<4;e++){ var a0=r[e], a1=r[(e+1)%4];
        VK.face(a0,a1,[(a0[0]+a1[0])/2-cq[0],(a0[1]+a1[1])/2-cq[1]]).brick(0,3,Y0,0.58,0.008); }
      band(M,r,0.58,0.68,0.06,C.CAST,1,0.7,true);
      var inner=rect(q[0]-1.32,q[0]+1.32,q[1]-1.32,q[1]+1.32);
      prism(M,inner,0.6,0.66,C.CAST,0x4A3A2B,0.7);
      for(var k=0;k<6;k++){ var a=k/6*6.2832+0.4, p=W(q[0]+Math.cos(a)*0.85,q[1]+Math.sin(a)*0.85);
        part(M,new T.IcosahedronGeometry(1,0),k%2?0x3E6B2E:0x4F7A35,mat(p[0],0.78,p[1],a,0.42,0.3,0.42)); }
      var c=W(q[0],q[1]);
      TREE_POS.push([c[0],c[1],0,'syc',0.5,0.62]);
      cols.push([r,0.68]);
    });
    NO_PLANT.push(RING.slice());
    /* benches facing the fountain from the south (the crowd sits on them) */
    var seat=new T.BoxGeometry(1.8,0.07,0.46), back=new T.BoxGeometry(1.8,0.38,0.06), leg=new T.BoxGeometry(0.07,0.44,0.5);
    [[-5.5,7.4],[4.5,7.4],[13.2,7.4]].forEach(function(q){
      var p=W(q[0],q[1]), yaw=Math.atan2(-G.dv[0],-G.dv[1]);
      var b=new T.Matrix4().makeTranslation(p[0],Y0-0.02,p[1]).multiply(new T.Matrix4().makeRotationY(yaw));
      function bm(x,y,z){ return b.clone().multiply(new T.Matrix4().makeTranslation(x,y,z)); }
      part(M,seat,0x7E5C3E,bm(0,0.46,0)); part(M,back,0x7E5C3E,bm(0,0.75,-0.22));
      part(M,leg,0x232325,bm(-0.8,0.22,0)); part(M,leg,0x232325,bm(0.8,0.22,0));
      BENCHES.push([p[0],p[1],yaw]);
    });
    /* Village lamp posts: black, a cross arm with two hanging lanterns */
    var BLK=0x1D1D1F, GLS=0xEFE6C9;
    function lamp(x,z,rot){
      var b=new T.Matrix4().makeTranslation(x,Y0,z).multiply(new T.Matrix4().makeRotationY(rot));
      function lm(px,py,pz){ return b.clone().multiply(new T.Matrix4().makeTranslation(px,py,pz)); }
      part(M,new T.CylinderGeometry(0.12,0.16,0.55,8),BLK,lm(0,0.275,0));
      part(M,new T.CylinderGeometry(0.05,0.07,3.45,8),BLK,lm(0,0.55+1.725,0));
      part(M,new T.CylinderGeometry(0.085,0.085,0.1,8),BLK,lm(0,2.9,0));
      part(M,new T.SphereGeometry(0.07,6,4),BLK,lm(0,4.08,0));
      part(M,new T.BoxGeometry(1.08,0.05,0.05),BLK,lm(0,3.86,0));
      part(M,new T.TorusGeometry(0.16,0.022,4,8,Math.PI),BLK,lm(-0.3,3.7,0));
      part(M,new T.TorusGeometry(0.16,0.022,4,8,Math.PI),BLK,lm(0.3,3.7,0));
      [-0.52,0.52].forEach(function(sx){
        part(M,new T.CylinderGeometry(0.015,0.015,0.14,4),BLK,lm(sx,3.79,0));
        part(M,new T.ConeGeometry(0.17,0.16,6),BLK,lm(sx,3.66,0));
        part(M,new T.CylinderGeometry(0.125,0.09,0.34,6),GLS,lm(sx,3.41,0));
        part(M,new T.ConeGeometry(0.06,0.12,6),BLK,lm(sx,3.18,0).multiply(new T.Matrix4().makeRotationX(Math.PI)));
      });
      cols.push([[[x-0.2,z-0.2],[x+0.2,z-0.2],[x+0.2,z+0.2],[x-0.2,z+0.2]],3.0]);
    }
    var lamps=0;
    [[-11.8,-6.2],[11.8,-6.2],[-11.8,6.2],[11.8,6.2],[26.5,-17.8],[26.5,10.5],[39.6,-17.8],[17.2,-15.5],[-7.6,-15.5],[18,14.5],[-8.5,18.5]].forEach(function(q){
      var p=W(q[0],q[1]);
      if(!inRing(RING,p[0],p[1])||laneGap(p[0],p[1])<0.4) return;
      lamp(p[0],p[1],Math.atan2(G.du[0],G.du[1])); lamps++; VLAMPS.push(p);
    });
    /* the campus lamps that stood in the Village's streets become Village lanterns (a_world.js VILLAGE_LAMP_PTS) */
    (typeof VILLAGE_LAMP_PTS!=='undefined'?VILLAGE_LAMP_PTS:[]).forEach(function(p){
      for(var i=0;i<VLAMPS.length;i++) if(Math.hypot(p[0]-VLAMPS[i][0],p[1]-VLAMPS[i][1])<4) return;
      lamp(p[0],p[1],Math.atan2(G.du[0],G.du[1])); lamps++; VLAMPS.push(p);
    });
    VPL.lamps=lamps;
  })();

  /* ================================================================ tables, chairs and umbrellas */
  (function(){
    /* one set: table, pedestal, pole, four chairs, canopy; the canopy is white, so the
       instance colour makes it red or yellow (the black frame barely takes the tint) */
    var SM=new Mesher(), K=0x242424, KT=0x2E2B28;
    part(SM,new T.BoxGeometry(0.78,0.04,0.78),KT,mat(0,0.74,0));
    part(SM,new T.CylinderGeometry(0.035,0.035,0.72,6),K,mat(0,0.36,0));
    part(SM,new T.BoxGeometry(0.56,0.03,0.07),K,mat(0,0.015,0)); part(SM,new T.BoxGeometry(0.07,0.03,0.56),K,mat(0,0.015,0));
    part(SM,new T.CylinderGeometry(0.022,0.022,1.75,5),0x3A3A3A,mat(0,0.76+0.875,0));
    for(var c=0;c<4;c++){ var a=c/4*6.2832+0.25, ca=Math.cos(a), sa=Math.sin(a), r=0.72;
      part(SM,new T.BoxGeometry(0.44,0.04,0.42),K,mat(sa*r,0.46,ca*r,a));
      part(SM,new T.BoxGeometry(0.44,0.44,0.03),K,mat(sa*(r+0.21),0.7,ca*(r+0.21),a,1,1,1,-0.12));
      for(var lx=-1;lx<=1;lx+=2) for(var lz=-1;lz<=1;lz+=2){ var ox=lx*0.19, oz=lz*0.18;
        part(SM,new T.BoxGeometry(0.03,0.46,0.03),K,mat(sa*r+ca*ox+sa*oz,0.23,ca*r-sa*ox+ca*oz,a)); } }
    part(SM,new T.CylinderGeometry(0.03,1.32,0.42,8,1,true),0xFFFFFF,mat(0,2.47,0));
    part(SM,new T.CylinderGeometry(1.32,1.32,0.12,8,1,true),0xF2F2F2,mat(0,2.2,0));
    part(SM,new T.SphereGeometry(0.05,5,3),0xFFFFFF,mat(0,2.7,0));
    var SETS=[], RED=0xC81E2B, YEL=0xF0BE2C;
    function clearOf(x,z){
      var l=G.loc([x,z]);
      if(inFountain(l[0],l[1],1.7)) return false;
      if(Math.hypot(x-HX,z-HZ)<STEP_R[0]+2.8) return false;
      for(var lp=0;lp<VLAMPS.length;lp++) if(Math.hypot(x-VLAMPS[lp][0],z-VLAMPS[lp][1])<1.7) return false;
      for(var i=0;i<PLANTERS.length;i++) if(Math.abs(l[0]-PLANTERS[i][0])<3.2&&Math.abs(l[1]-PLANTERS[i][1])<3.2) return false;
      return true;
    }
    /* red: on the paving squares, wherever the walking lanes leave room */
    for(var i=-6;i<=12;i++) for(var j=-6;j<=6;j++){
      var u=2.2+i*4.4+(R()-0.5)*0.7, v=2.2+j*4.4+(R()-0.5)*0.7, p=W(u,v);
      if(!inRing(RING,p[0],p[1])||edgeDist(RING,p[0],p[1])<2.4) continue;
      if(laneGap(p[0],p[1])<1.05||!clearOf(p[0],p[1])) continue;
      if(v>11) { if(R()<0.6) continue; } else if(R()<0.1) continue;   /* the side toward Irani stays more open */
      SETS.push([p[0],p[1],R()*1.57,RED]);
    }
    /* yellow: Dulce's tables along McCarthy's arcade, between the tower and the plaza's west corner */
    var A=[14,-538], dir=[-12/25.94,23/25.94], nrm=[dir[1],-dir[0]];
    if(nrm[0]*(O[0]-A[0])+nrm[1]*(O[1]-A[1])<0) nrm=[-nrm[0],-nrm[1]];
    for(var k=0;k<5;k++){ var t=3+k*3.3, p2=[A[0]+dir[0]*t+nrm[0]*1.75, A[1]+dir[1]*t+nrm[1]*1.75];
      SETS.push([p2[0],p2[1],Math.atan2(dir[0],dir[1])+0.785,YEL]);
      cols.push([[[p2[0]-0.95,p2[1]-0.95],[p2[0]+0.95,p2[1]-0.95],[p2[0]+0.95,p2[1]+0.95],[p2[0]-0.95,p2[1]+0.95]],0.8]); }
    var im=new T.InstancedMesh(SM.geom(),new T.MeshLambertMaterial({vertexColors:true,flatShading:true,side:T.DoubleSide}),Math.max(1,SETS.length));
    var cc=new T.Color();
    SETS.forEach(function(s,i){ D3.position.set(s[0],Y0-0.01,s[1]); D3.rotation.set(0,s[2],0); D3.scale.set(1,1,1); D3.updateMatrix();
      im.setMatrixAt(i,D3.matrix); im.setColorAt(i,cc.setHex(s[3])); });
    if(!SETS.length){ im.setColorAt(0,cc.setHex(RED)); }
    im.count=SETS.length; im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; im.raycast=function(){}; scene.add(im);
    VPL.umbrellas=SETS.length; VPL.setTris=SM.count();
  })();

  /* ================================================================ monument signs */
  (function(){
    /* the panels and the seal plaque: one canvas, one textured mesh */
    var cv=document.createElement('canvas'); cv.width=cv.height=1024; var g=cv.getContext('2d');
    var FONT='"USC Caslon",Georgia,"Times New Roman",serif';
    function panel(y0,lines){
      g.fillStyle='#E8DFCB'; g.fillRect(0,y0,1024,384);
      g.strokeStyle='#C8BB9C'; g.lineWidth=8; g.strokeRect(26,y0+26,972,332);
      g.strokeStyle='#D6CBB1'; g.lineWidth=3; g.strokeRect(40,y0+40,944,304);
      g.fillStyle='#4A3D30'; g.textAlign='center'; g.textBaseline='alphabetic';
      lines.forEach(function(l){ g.font=l[2]+'px '+FONT; g.fillText(l[0],512,y0+l[1],900); });
      /* the band of small pointed arches under the name */
      g.strokeStyle='#B4A585'; g.lineWidth=3; g.strokeRect(70,y0+282,884,44);
      for(var x=70;x<954;x+=34){ g.beginPath(); g.moveTo(x,y0+326); g.quadraticCurveTo(x,y0+290,x+17,y0+288); g.quadraticCurveTo(x+34,y0+290,x+34,y0+326); g.stroke(); }
    }
    panel(0,[['USC Village',215,150]]);
    panel(384,[['USC',150,118],['University of Southern California',248,64]]);
    /* bronze plaque with the seal */
    g.fillStyle='#4E3E2C'; g.fillRect(0,768,256,256); g.strokeStyle='#8A7350'; g.lineWidth=10; g.strokeRect(12,780,232,232);
    g.beginPath(); g.arc(128,896,80,0,6.2832); g.stroke(); g.lineWidth=4; g.beginPath(); g.arc(128,896,62,0,6.2832); g.stroke();
    g.fillStyle='#9C845C'; g.font='bold 44px '+FONT; g.textAlign='center'; g.fillText('USC',128,912);
    var tex=new T.CanvasTexture(cv); tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var TM=new VK.TM();
    function texQuad(F,s0,s1,y0,y1,d,t){   /* t: [u0,v0,u1,v1] in canvas pixels */
      var uv=[[t[0]/1024,1-t[3]/1024],[t[2]/1024,1-t[3]/1024],[t[2]/1024,1-t[1]/1024],[t[0]/1024,1-t[1]/1024]];
      VK.quad(TM,[F.p3(s0,d,y0),F.p3(s1,d,y0),F.p3(s1,d,y1),F.p3(s0,d,y1)],F.want,0xFFFFFF,1,uv); }
    function agave(x,z,s){
      for(var k=0;k<7;k++){ var a=k/7*6.2832+R(), tilt=0.5+R()*0.4;
        part(M,new T.ConeGeometry(0.07*s,0.9*s,3),k%2?0xA9B66E:0x8BA05A,mat(x+Math.sin(a)*0.18*s,0.35*s,z+Math.cos(a)*0.18*s,a,1,1,1,tilt)); }
    }
    var n=0;
    function triOut(a,b,c,ox,oz,col){
      var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
      var nx=uy*vz-uz*vy, nz=ux*vy-uy*vx;
      if(nx*ox+nz*oz<0) M.tri(a,c,b,col,col,col); else M.tri(a,b,c,col,col,col); }
    /* c: centre of the wall, f: the way it faces, kind 0 Village / 1 USC, pier: +1 pier at the right end (seen from the front), -1 left */
    function sign(c,f,kind,pier){
      var l=Math.hypot(f[0],f[1]); f=[f[0]/l,f[1]/l];
      var side=[-f[1],f[0]], L=4.6;
      var F=VK.face([c[0]-side[0]*L/2,c[1]-side[1]*L/2],[c[0]+side[0]*L/2,c[1]+side[1]*L/2],f);
      var yb=0.03, WH=1.0;
      /* brick wall with a stone cap */
      F.block(0,L,-0.6,0,yb,WH,C.BRICK,0.7,C.CAST);
      F.brick(0,L,yb,WH,0.005);
      var Bk=VK.face(F.pt(L,-0.6),F.pt(0,-0.6),[-f[0],-f[1]]); Bk.brick(0,L,yb,WH,0.005);
      F.block(-0.05,L+0.05,-0.66,0.06,WH,WH+0.08,C.CAST,0.75);
      /* the cast stone panel on its sill */
      var p0=pier>0?0.25:1.15, p1=p0+3.2;
      F.block(p0-0.12,p1+0.12,-0.42,0.2,WH-0.18,WH-0.05,C.CAST,0.72);
      F.block(p0,p1,-0.35,0.14,WH-0.05,WH+1.15,C.CAST_L,0.75);
      texQuad(F,p0+0.02,p1-0.02,WH-0.03,WH+1.13,0.145,kind?[0,384,1024,768]:[0,0,1024,384]);
      /* the brick pier with its stone pinnacle and bronze seal */
      var q0=pier>0?L-0.95:0, q1=q0+0.95;
      F.block(q0,q1,-0.78,0.17,yb,1.95,C.BRICK,0.7,C.CAST);
      F.brick(q0,q1,yb,1.95,0.175);
      var Fs=VK.face(F.pt(pier>0?q1:q0,0.17),F.pt(pier>0?q1:q0,-0.78),[F.t[0]*pier,F.t[1]*pier]); Fs.brick(0,0.95,yb,1.95,0.005);
      F.block(q0-0.06,q1+0.06,-0.84,0.23,1.95,2.08,C.CAST,0.75);
      F.block(q0+0.08,q1-0.08,-0.7,0.09,2.08,2.62,C.CAST_L,0.7);
      var m=F.pt((q0+q1)/2,-0.305), tip=[m[0],3.75,m[1]], cs=rgb(C.CAST_L,0.95), cd=rgb(C.CAST_L,0.72);
      var cr=[F.p3(q0+0.04,0.13,2.62),F.p3(q1-0.04,0.13,2.62),F.p3(q1-0.04,-0.74,2.62),F.p3(q0+0.04,-0.74,2.62)];
      for(var k=0;k<4;k++){ var a=cr[k], b=cr[(k+1)%4], mid=[(a[0]+b[0])/2,3.02,(a[2]+b[2])/2];
        triOut(a,b,mid,mid[0]-m[0],mid[2]-m[1],cs);                                  /* gable */
        triOut(a,b,tip,mid[0]-m[0],mid[2]-m[1],cd);                                  /* spire */
      }
      texQuad(F,q0+0.2,q1-0.2,1.15,1.7,0.18,[0,768,256,1024]);
      /* planting bed with agaves */
      flat(MG,F.ring(-0.1,L+0.1,0.03,1.35),0.06,0x5E4C38,1);
      for(k=0;k<4;k++){ var pa=F.pt(0.5+k*1.2+R()*0.3,0.6+R()*0.3); agave(pa[0],pa[1],0.8+R()*0.3); }
      cols.push([F.ring(-0.06,L+0.06,-0.85,0.25),2.0]);
      n++;
    }
    /* Jefferson: the paseo between Irani and McMorrow (path to the plaza), signs either side facing campus */
    var t=[-0.447,0.894], lf=[-0.894,-0.447];             /* t toward Jefferson; lf: left, seen walking in */
    var Cj=[20.1,-419.3];
    sign([Cj[0]+lf[0]*11.6,Cj[1]+lf[1]*11.6],t,0,1);
    sign([Cj[0]-lf[0]*11.6,Cj[1]-lf[1]*11.6],t,1,-1);
    /* bollards across the paseo mouth */
    for(var b=-2;b<=2;b++){ var p=[Cj[0]+t[0]*1.2+lf[0]*b*2.3,Cj[1]+t[1]*1.2+lf[1]*b*2.3];
      part(M,new T.CylinderGeometry(0.11,0.13,0.82,10),0x1E1E20,mat(p[0],0.41,p[1]));
      part(M,new T.SphereGeometry(0.11,8,4,0,6.2832,0,1.6),0x1E1E20,mat(p[0],0.82,p[1]));
      part(M,new T.CylinderGeometry(0.145,0.145,0.06,10),0x2A2A2C,mat(p[0],0.62,p[1])); }
    /* Hoover: beside the walk in from Hoover, facing the street */
    sign([123,-536.5],[1,0],0,1);
    /* McClintock: south of the walk in from McClintock, facing the street */
    sign([-103.2,-552.5],[-0.88,-0.475],0,-1);
    var mesh=new T.Mesh(TM.geom(),new T.MeshLambertMaterial({map:tex,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    mesh.frustumCulled=false; mesh.raycast=function(){}; mesh.receiveShadow=true; scene.add(mesh);
    VPL.signs=n;
  })();

  /* ================================================================ the Village's walks in brick
     The walks between the buildings are brick paving like the plaza (photo 24), not the campus concrete:
     every drawn walk segment within 18 m of a Village building (the paseos are about 30 m wide), outside the plaza, gets the Village paving
     laid over its full width (walk and border), on the same world-mapped texture so the pieces join. */
  (function(){
    var VR=CAMPUS.filter(function(b){ return VILLAGE_NAMES[b.name]; }).map(function(b){ return b.ring; });
    function sd(x,z,a,b){ var dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));
      return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t); }
    function inV(x,z){ if(inRing(RING,x,z)) return false;
      for(var i=0;i<VR.length;i++){ var r=VR[i]; for(var k=0;k<r.length;k++) if(sd(x,z,r[k],r[(k+1)%r.length])<18) return true; }
      return false; }
    var segs=0;
    PATHS.forEach(function(pa){
      if(pa.hide) return;
      var pw=pa.w, w=pw>6?pw*1.5+2.3+2.4:(pw>=2.5?pw*1.3+1.0+1.24:pw*1.2), hw=w/2+0.05;
      for(var k=0;k<pa.pts.length-1;k++){
        var a=pa.pts[k], b=pa.pts[k+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L<0.05) continue;
        var n=Math.max(1,Math.ceil(L/3)), dx=(b[0]-a[0])/L, dz=(b[1]-a[1])/L, nx=-dz*hw, nz=dx*hw;
        for(var j=0;j<n;j++){
          var t0=j/n, t1=(j+1)/n, p0=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0], p1=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1];
          if(!inV((p0[0]+p1[0])/2,(p0[1]+p1[1])/2)) continue;
          /* overlap a little along the walk so the pieces close up at joints */
          var e0=[p0[0]-dx*0.3,p0[1]-dz*0.3], e1=[p1[0]+dx*0.3,p1[1]+dz*0.3];
          VK.pave([[e0[0]+nx,e0[1]+nz],[e1[0]+nx,e1[1]+nz],[e1[0]-nx,e1[1]-nz],[e0[0]-nx,e0[1]-nz]],0.142,0.96); segs++;
        }
      }
    });
    VPL.walkPaving=segs;
  })();

  cols.forEach(function(c){ VK.collider(c[0],c[1]); });
  VPL.colliders=cols.length;
  VPL.look=function(i){ var V=[[110,25,-470,30,0,-520],[70,1.7,-505,20,3,-525],[70,2,-488,62,3,-496],[60,24,-570,35,0,-485],[20,1.7,-408,22,1.5,-425]][i||0];
    if(window.__cam) window.__cam(V[0],V[1],V[2],V[3],V[4],V[5]); };
})();
