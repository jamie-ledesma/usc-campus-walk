/* ==================================================================
   USC Gould School of Law (the Musick Law Building, 1966), between Town
   and Gown and Exposition Boulevard. a_world.js leaves the footprint
   empty (HAND_HALLS) and sets GOULD (frame fitted to the footprint:
   origin at the north west corner, u along the north front, v toward
   Exposition; the forecourt; the walk to it).

   From photos: warm beige board formed concrete. A four storey block on
   the north, with wings stepping down to three and two storeys toward
   Exposition. Square concrete piers run up every bay and stop under a
   deep plain parapet band. Between them, each floor is a deep spandrel
   band over a recessed band of bronze framed windows; the ground storey
   is glass set further back behind the piers. On the roof a penthouse
   ringed with narrow vertical slots and a round drum at the east end.
   The entrance in the middle of the north front: wide steps up to a
   terrace between planter walls with hedges, handrails, glass doors,
   USC GOULD SCHOOL OF LAW over them, a brick forecourt with five globe
   lamps, planters and trees. A plain door on the west front.
   Draw calls: one Mesher (matWorld), one ground Mesher, the windows on
   one canvas texture.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='USC Gould School of Law') B=CAMPUS[bi];
  if(!B||typeof GOULD==='undefined'||!GOULD) return;
  var G=GOULD, P=G.P, DU=G.du, DV=G.dv, EC=G.EC;
  var M=new Mesher(), MG=new Mesher(), cols=[], GLB=[];
  var CON=0xDDCFB4, CONL=0xE6DAC4, COND=0xC2B49A, CORE=0x8F877A, ROOF=0x8B877F, BRICKP=0x9A5544,
      BRICKL=0xB98A6E, HEDGE=0x35632C, METAL=0x2C2E2E, BRONZE=0x4B3E30, DOOR=0x2B2E2E, GLOBE=0xF4F1E6;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ return ccw([P(Math.min(u0,u1),Math.min(v0,v1)),P(Math.max(u0,u1),Math.min(v0,v1)),
    P(Math.max(u0,u1),Math.max(v0,v1)),P(Math.min(u0,u1),Math.max(v0,v1))]); }
  function box(u0,u1,v0,v1,y0,y1,col,sh,top){ var r=R(u0,u1,v0,v1); prism(M,r,y0,y1,col,top||col,sh===undefined?0.62:sh); return r; }
  function solid(r,h){ cols.push([r,h]); }
  function W3(u,y,v){ var p=P(u,v); return [p[0],y,p[1]]; }

  /* ---------------- the windows: one canvas texture, quads with uv ---------------- */
  function TM(){ this.p=[]; this.n=[]; this.c=[]; this.u=[]; }
  TM.prototype.quad=function(A,B2,C,D,ta,tb,tc,td,c){
    var ux=B2[0]-A[0],uy=B2[1]-A[1],uz=B2[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1; nx/=l; ny/=l; nz/=l;
    var self=this;
    [[A,ta],[B2,tb],[C,tc],[A,ta],[C,tc],[D,td]].forEach(function(q){
      self.p.push(q[0][0],q[0][1],q[0][2]); self.n.push(nx,ny,nz); self.c.push(c[0],c[1],c[2]); self.u.push(q[1][0],q[1][1]); });
  };
  TM.prototype.geom=function(){
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));
    g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
    g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
    g.computeBoundingSphere(); return g; };
  var GL=new TM();

  /* a quad on a vertical or flat plane, turned to face `want` (world) */
  function quad(tgt,pts,want,hex,k,uvs){
    var A=pts[0],B2=pts[1],C=pts[2];
    var ux=B2[0]-A[0],uy=B2[1]-A[1],uz=B2[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, o=[0,1,2,3];
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) o=[0,3,2,1];
    var q=o.map(function(i){ return pts[i]; }), c=rgb(hex,k===undefined?1:k);
    if(tgt===M) M.quad(q[0],q[1],q[2],q[3],c,c,c,c);
    else { var t=o.map(function(i){ return uvs[i]; }); tgt.quad(q[0],q[1],q[2],q[3],t[0],t[1],t[2],t[3],c); }
  }
  function nW(nu,nv){ return [nu*DU[0]+nv*DV[0],0,nu*DU[1]+nv*DV[1]]; }

  /* ---------------- the wings ---------------- */
  /* storey bases; a wing of n storeys has its roof at LV[n] and the parapet band from LV[n-1]+3.0 to LV[n]+1.0 */
  var LV=[0,4.6,8.5,12.4,16.3], I=0.9, IG=2.2, PO=0.35, BAY=7.25;
  /* a face of a wing: s runs along it, d goes in from the outer line */
  function Face(side,u0,u1,v0,v1,s0,s1){
    var F={s0:s0,s1:s1};
    if(side==='N'){ F.pt=function(s,d){ return [s,v0+d]; }; F.n=[0,-1]; }
    if(side==='S'){ F.pt=function(s,d){ return [s,v1-d]; }; F.n=[0,1]; }
    if(side==='W'){ F.pt=function(s,d){ return [u0+d,s]; }; F.n=[-1,0]; }
    if(side==='E'){ F.pt=function(s,d){ return [u1-d,s]; }; F.n=[1,0]; }
    F.slab=function(a,b,d0,d1,y0,y1,col,sh,top){ var p=F.pt(a,d0), q=F.pt(b,d1); return box(p[0],q[0],p[1],q[1],y0,y1,col,sh,top); };
    F.vq=function(tgt,a,b,d,y0,y1,hex,k,uvs){ var p=F.pt(a,d), q=F.pt(b,d);
      quad(tgt,[W3(p[0],y0,p[1]),W3(q[0],y0,q[1]),W3(q[0],y1,q[1]),W3(p[0],y1,p[1])],nW(F.n[0],F.n[1]),hex,k,uvs); };
    F.under=function(a,b,d0,d1,y,hex){ var p=F.pt(a,d0), q=F.pt(b,d1);
      quad(M,[W3(p[0],y,p[1]),W3(q[0],y,p[1]),W3(q[0],y,q[1]),W3(p[0],y,q[1])],[0,-1,0],hex,0.62); };
    F.uv=function(a,b){ return [[(a-F.s0)/7.2,0],[(b-F.s0)/7.2,0],[(b-F.s0)/7.2,1],[(a-F.s0)/7.2,1]]; };
    return F;
  }
  function wing(u0,u1,v0,v1,n,faces){
    var top=LV[n], par=top+1.0, pb=LV[n-1]+3.0;
    box(u0+IG,u1-IG,v0+IG,v1-IG,0,LV[1]-0.9,CORE,0.7);
    box(u0+I,u1-I,v0+I,v1-I,LV[1]-0.9,top,CORE,0.7,ROOF);
    flat(M,R(u0+0.1,u1-0.1,v0+0.1,v1-0.1),top+0.02,ROOF,1);
    solid(R(u0,u1,v0,v1),par);
    faces.forEach(function(f){
      var F=Face(f[0],u0,u1,v0,v1,f[1],f[2]), a=f[1], b=f[2];
      /* the ground storey: glass far back behind the piers, the first band over it */
      F.vq(GL,a,b,IG-0.04,0,3.7,0xFFFFFF,1,F.uv(a,b));
      F.slab(a,b,0,I,3.7,LV[1]+1.0,CON,0.72,CONL); F.under(a,b,0,IG,3.7,COND);
      /* the floors: recessed windows, then a band; the top one runs on into the parapet */
      for(var k=1;k<n;k++){
        var g0=LV[k]+1.0, g1=LV[k]+3.0, t1=(k===n-1)?par:LV[k+1]+1.0;
        F.vq(GL,a,b,I-0.04,g0,g1,0xFFFFFF,1,F.uv(a,b));
        F.slab(a,b,k===n-1?-PO:0,I,g1,t1,CON,0.72,CONL); F.under(a,b,k===n-1?-PO:0,I,g1,COND);
      }
      if(n===1) F.slab(a,b,-PO,I,3.7,par,CON,0.6,CONL);
      /* the piers, square, every bay, from the ground to the parapet band */
      var L=b-a, nb=Math.max(1,Math.round(L/BAY));
      for(var j=0;j<=nb;j++){ var s=a+L*j/nb, w=(j===0||j===nb)?0.6:0.45;
        F.slab(s-w,s+w,-PO,IG,0,pb,CON,0.74,CONL); }
      /* a shadow line under the parapet band */
      F.vq(M,a,b,-PO-0.01,pb-0.06,pb,COND,0.7);
    });
  }
  /* main block (four storeys) and the wings stepping down toward Exposition */
  wing(0,87,0,24.7,4,[['N',0,87],['W',0,24.7],['E',0,24.7],['S',0,87]]);
  wing(0,43.7,24.7,43.7,3,[['W',24.7,43.7],['S',0,43.7],['E',37.4,43.7]]);
  wing(43.7,63,24.7,37.4,3,[['S',43.7,63],['E',24.7,37.4]]);
  wing(63,75.5,24.7,31,2,[['S',63,75.5],['E',24.7,31]]);

  /* ---------------- the roof: slotted penthouse and the drum ---------------- */
  (function(){
    var y0=LV[4], y1=y0+5.2;
    box(12,58,5,21,y0,y1,CON,0.7,ROOF); box(11.8,58.2,4.8,21.2,y1-0.5,y1+0.06,CONL,0.75);
    var sides=[['N',12,58,5],['S',12,58,21],['W',5,21,12],['E',5,21,58]];
    sides.forEach(function(sd){
      for(var s=sd[1]+0.8;s<sd[2]-0.6;s+=1.25){
        var a=s, b=s+0.36, y=[y0+0.45,y1-0.6], p, q, n;
        if(sd[0]==='N'){ p=[a,sd[3]-0.03]; q=[b,sd[3]-0.03]; n=[0,-1]; }
        if(sd[0]==='S'){ p=[a,sd[3]+0.03]; q=[b,sd[3]+0.03]; n=[0,1]; }
        if(sd[0]==='W'){ p=[sd[3]-0.03,a]; q=[sd[3]-0.03,b]; n=[-1,0]; }
        if(sd[0]==='E'){ p=[sd[3]+0.03,a]; q=[sd[3]+0.03,b]; n=[1,0]; }
        quad(M,[W3(p[0],y[0],p[1]),W3(q[0],y[0],q[1]),W3(q[0],y[1],q[1]),W3(p[0],y[1],p[1])],nW(n[0],n[1]),0x2E2C28,1);
      }
    });
    /* the drum */
    var DH=5.6, c=P(74,12.2), cg=new T.CylinderGeometry(9.0,9.0,DH,32,1,false).toNonIndexed(), pa=cg.attributes.position, cc=rgb(CON,0.86), ct=rgb(ROOF,1);
    for(var i=0;i<pa.count;i+=3){
      var t=[0,1,2].map(function(k){ return [pa.getX(i+k)+c[0],pa.getY(i+k)+y0+DH/2,pa.getZ(i+k)+c[1]]; });
      var top=t[0][1]>y0+DH-0.05&&t[1][1]>y0+DH-0.05&&t[2][1]>y0+DH-0.05, bot=t[0][1]<y0+0.05&&t[1][1]<y0+0.05&&t[2][1]<y0+0.05;
      if(bot) continue; var col=top?ct:cc; M.tri(t[0],t[1],t[2],col,col,col);
    }
    var rg=new T.CylinderGeometry(9.25,9.25,0.4,32,1,true).toNonIndexed(), rp=rg.attributes.position, cr=rgb(CONL,0.85);
    var ry=y0+DH-0.2;
    for(i=0;i<rp.count;i+=3) M.tri([rp.getX(i)+c[0],rp.getY(i)+ry,rp.getZ(i)+c[1]],[rp.getX(i+1)+c[0],rp.getY(i+1)+ry,rp.getZ(i+1)+c[1]],
      [rp.getX(i+2)+c[0],rp.getY(i+2)+ry,rp.getZ(i+2)+c[1]],cr,cr,cr);
  })();

  /* ---------------- the entrance on the north front ---------------- */
  (function(){
    var a=EC-10.9, b=EC+10.9, H=1.0, NS=6, SD=0.5, v0=-6;
    /* terrace from the steps back to the glass */
    solid(box(a,b,v0,IG,0,H,CONL,0.66,0xC9BCA4),H);
    for(var i=1;i<NS;i++){ var top=H*(1-i/NS); solid(box(a+1.4,b-1.4,v0-SD*i,v0-SD*(i-1),0,top,CONL,0.66,0xD3C6AE),top); }
    /* planter walls either side, hedges on top */
    [[a-1.6,a],[b,b+1.6]].forEach(function(q){ solid(box(q[0],q[1],v0-SD*NS,IG,0,1.25,CON,0.62,CONL),1.25);
      box(q[0]+0.15,q[1]-0.15,v0-SD*NS+0.15,-0.2,1.25,1.85,HEDGE,0.7); });
    box(a,a+1.4,v0-SD*NS,v0,0,H,CON,0.62,CONL); box(b-1.4,b,v0-SD*NS,v0,0,H,CON,0.62,CONL);
    /* handrails down the steps */
    [EC-3,EC+3].forEach(function(u){
      for(var k=0;k<=2;k++){ var vv=v0-SD*NS*k/2, yb=k===2?0:H*(1-k/2); var p=P(u,vv); postAt(M,p[0],p[1],yb,yb+0.95,0.03,METAL,0.8); }
      segBox(M,P(u,v0),P(u,v0-SD*NS),H+0.9,H+0.96,0.05,METAL,0.85);
      segBox(M,P(u,v0+0.6),P(u,v0),H+0.9,H+0.96,0.05,METAL,0.85);
    });
    /* glass doors in the middle bays: dark frames on the ground glass */
    var F=Face('N',0,87,0,24.7,0,87);
    for(var d=-1;d<=1;d++){ var s=EC+d*1.7; F.vq(M,s-0.8,s+0.8,IG-0.03,H,H+2.6,DOOR,0.9); F.vq(M,s-0.7,s+0.7,IG-0.05,H+0.1,H+2.45,0x46514F,1); }
    F.vq(M,EC-2.7,EC+2.7,IG-0.02,H+2.6,H+2.75,BRONZE,0.9);
    var t=P(EC,-0.4); facadeText('USC GOULD SCHOOL OF LAW',t[0],t[1],-DV[0],-DV[1],4.65,6.5,0.6,'#2A231C');
    /* the west door */
    var FW=Face('W',0,87,0,24.7,0,24.7);
    FW.vq(M,10.6,13.8,IG-0.03,0,2.7,DOOR,0.9); FW.vq(M,10.8,13.6,IG-0.05,0.1,2.55,0x46514F,1);
  })();

  /* ---------------- the forecourt: brick, planters, five globe lamps, trees ---------------- */
  (function(){
    var u0=15, u1=50, v0=-13.5, v1=0;
    flat(MG,R(u0,u1,v0,v1),0.10,BRICKP,1);
    for(var u=u0;u<=u1+0.01;u+=3) ribbon(MG,[P(u,v0),P(u,v1)],0.14,0.105,BRICKL,1);
    for(var v=v0;v<=v1+0.01;v+=3) ribbon(MG,[P(u0,v),P(u1,v)],0.14,0.105,BRICKL,1);
    /* raised planters with hedges */
    [[15.5,19.5,-12,-8.5],[45.5,49.5,-12,-8.5]].forEach(function(q){
      solid(box(q[0],q[1],q[2],q[3],0,0.55,CON,0.62,CONL),0.55); box(q[0]+0.2,q[1]-0.2,q[2]+0.2,q[3]-0.2,0.55,1.15,HEDGE,0.7); });
    /* five globe lamps either side of the steps */
    [[EC-11.3,-10.6],[EC+11.3,-10.6]].forEach(function(q){
      var p=P(q[0],q[1]), x=p[0], z=p[1];
      postAt(M,x,z,0.1,0.6,0.16,METAL,0.7); postAt(M,x,z,0.6,4.1,0.06,METAL,0.75);
      solid(sq(x,z,0.2),4.1);
      [[0.55,0],[-0.55,0],[0,0.55],[0,-0.55]].forEach(function(o){
        var gx=x+o[0]*DU[0]+o[1]*DV[0], gz=z+o[0]*DU[1]+o[1]*DV[1];
        segBox(M,[x,z],[gx,gz],3.62,3.68,0.04,METAL,0.8);
        GLB.push([gx,3.95,gz]); });
      GLB.push([x,4.42,z]);
    });
    function sq(x,z,h){ return ccw([[x-h,z-h],[x+h,z-h],[x+h,z+h],[x-h,z+h]]); }
    /* trees: the forecourt corners and the lawn on the west */
    for(var i=TREE_POS.length-1;i>=0;i--){ var tp=TREE_POS[i]; if(inRing(G.court,tp[0],tp[1])) TREE_POS.splice(i,1); }
    [[16.5,-6.0,'mag',1.3],[48.5,-6.0,'mag',1.3],[11.5,-11.0,'syc',1.2],[53.5,-11.5,'mag',1.25]]
      .forEach(function(q){ var p=P(q[0],q[1]); TREE_POS.push([p[0],p[1],0,q[2],q[3]]); });
  })();

  /* ================= build ================= */
  var cv=document.createElement('canvas'); cv.width=256; cv.height=128;
  (function(){
    var g=cv.getContext('2d'), seed=11;
    function rr(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    var gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,'#7E8B93'); gr.addColorStop(0.45,'#505A5F'); gr.addColorStop(1,'#3A3D3C');
    g.fillStyle=gr; g.fillRect(0,0,256,128);
    for(var k=0;k<4;k++){ if(rr()<0.22){ g.fillStyle='rgba(176,132,74,0.55)'; g.fillRect(k*64+5,50,54,74); }
      if(rr()<0.3){ g.fillStyle='rgba(205,200,186,0.35)'; g.fillRect(k*64+5,6,54,38); } }
    g.fillStyle='#9A8466';
    for(k=0;k<=4;k++) g.fillRect(k*64-3,0,6,128);
    g.fillRect(0,0,256,5); g.fillRect(0,123,256,5); g.fillRect(0,44,256,5);
  })();
  var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  var gm=new T.Mesh(GL.geom(),new T.MeshLambertMaterial({map:tex,vertexColors:true}));
  gm.frustumCulled=false; gm.receiveShadow=true; gm.raycast=function(){}; scene.add(gm);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var ig=new T.InstancedMesh(new T.SphereGeometry(0.24,10,8),new T.MeshLambertMaterial({color:GLOBE,emissive:0x5E5A50}),GLB.length), D=new T.Object3D();
  GLB.forEach(function(q,i){ D.position.set(q[0],q[1],q[2]); D.updateMatrix(); ig.setMatrixAt(i,D.matrix); });
  ig.frustumCulled=false; ig.raycast=function(){}; scene.add(ig);
  window.__gould={tris:M.count(),glass:GL.p.length/9,ground:MG.count(),cols:cols.length};
})();
