/* ==================================================================
   Birnkrant Residential College, the 1960s residence slab just east of
   Leavey Library. Footprint from world.txt on the campus grid (origin at
   its south west corner (267,-71), u grid east, v grid south): the slab
   u -5..12, v -60.7..-4.9 with stair towers at both ends, and the east
   wing u 12..39.9, v -43.6..-18.5. In HAND_HALLS.

   From photos: eight storeys of rooms over a ground storey of white
   columns with glass set back behind them. The long faces are all
   balconies: a white slab cantilevers out at every floor and at the
   roof, thick at thin white fins between the bays and thin between
   them (the scalloped soffits), with a dark rail; behind them walls of
   glass with curtains. The ends are tan stucco with white bands at each
   floor and white frames, and the stair towers carry a strip of narrow
   windows. A white penthouse on the roof.
   Draw calls: one Mesher (matWorld), the window walls on one canvas
   texture.
   ================================================================== */
(function(){
  var Bd=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Birnkrant Residential College') Bd=CAMPUS[bi];
  if(!Bd) return;
  var O=[267,-71], DU=[0.8862,0.4633], DV=[-0.4633,0.8862];
  function P(u,v){ return [O[0]+u*DU[0]+v*DV[0], O[1]+u*DU[1]+v*DV[1]]; }
  var M=new Mesher(), cols=[];
  var WHITE=0xF6F4EE, WHITED=0xE6E2DA, TAN=0xD8C6A8, TAND=0xC0AC8C, GLASSG=0x2F3638, RAIL=0x6C6E6E, ROOF=0x8E8B84;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ return ccw([P(Math.min(u0,u1),Math.min(v0,v1)),P(Math.max(u0,u1),Math.min(v0,v1)),
    P(Math.max(u0,u1),Math.max(v0,v1)),P(Math.min(u0,u1),Math.max(v0,v1))]); }
  function box(u0,u1,v0,v1,y0,y1,col,sh,top){ var r=R(u0,u1,v0,v1); prism(M,r,y0,y1,col,top||col,sh===undefined?0.66:sh); return r; }
  function W3(u,y,v){ var p=P(u,v); return [p[0],y,p[1]]; }

  /* ---------------- textured window walls ---------------- */
  var TP=[], TN=[], TU=[];
  function tquad(pts,want,uvs){
    var A=pts[0],B=pts[1],C=pts[2], ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, o=[0,1,2,3];
    if(nx*want[0]+ny*want[1]+nz*want[2]<0){ o=[0,3,2,1]; nx=-nx; ny=-ny; nz=-nz; }
    var l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
    [o[0],o[1],o[2],o[0],o[2],o[3]].forEach(function(i){ TP.push(pts[i][0],pts[i][1],pts[i][2]); TN.push(nx/l,ny/l,nz/l); TU.push(uvs[i][0],uvs[i][1]); });
  }
  function mquad(pts,want,hex,k){
    var A=pts[0],B=pts[1],C=pts[2], ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, o=[0,1,2,3], c=rgb(hex,k===undefined?1:k);
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) o=[0,3,2,1];
    M.quad(pts[o[0]],pts[o[1]],pts[o[2]],pts[o[3]],c,c,c,c);
  }
  function nW(nu,nv){ return [nu*DU[0]+nv*DV[0],0,nu*DU[1]+nv*DV[1]]; }

  /* ---------------- a face: s along it, d in from the window wall (balconies at negative d) ---------------- */
  function Face(side,line){
    var F={};
    if(side==='W'){ F.pt=function(s,d){ return [line+d,s]; }; F.n=[-1,0]; }
    if(side==='E'){ F.pt=function(s,d){ return [line-d,s]; }; F.n=[1,0]; }
    if(side==='N'){ F.pt=function(s,d){ return [s,line+d]; }; F.n=[0,-1]; }
    if(side==='S'){ F.pt=function(s,d){ return [s,line-d]; }; F.n=[0,1]; }
    F.slab=function(a,b,d0,d1,y0,y1,col,sh,top){ var p=F.pt(a,d0), q=F.pt(b,d1); return box(p[0],q[0],p[1],q[1],y0,y1,col,sh,top); };
    F.wq=function(a,b,d,y0,y1,u0,u1){ var p=F.pt(a,d), q=F.pt(b,d);
      tquad([W3(p[0],y0,p[1]),W3(q[0],y0,q[1]),W3(q[0],y1,q[1]),W3(p[0],y1,p[1])],nW(F.n[0],F.n[1]),[[u0,0],[u1,0],[u1,1],[u0,1]]); };
    F.mq=function(a,b,d,y0,y1,hex,k){ var p=F.pt(a,d), q=F.pt(b,d);
      mquad([W3(p[0],y0,p[1]),W3(q[0],y0,q[1]),W3(q[0],y1,q[1]),W3(p[0],y1,p[1])],nW(F.n[0],F.n[1]),hex,k); };
    F.under=function(a,b,d0,d1,y,hex){ var p=F.pt(a,d0), q=F.pt(b,d1);
      mquad([W3(p[0],y,p[1]),W3(q[0],y,p[1]),W3(q[0],y,q[1]),W3(p[0],y,q[1])],[0,-1,0],hex,0.7); };
    return F;
  }
  var G=4.0, FH=3.0, NF=8, TOP=G+NF*FH, BD=1.5;     /* ground storey, floor height, floors, roof, balcony depth */
  /* a balcony face from s0 to s1 (s0<s1), nb bays */
  function balconies(F,s0,s1,nb){
    var L=s1-s0, bw=L/nb, k, j;
    /* ground storey: glass under the first slab, white columns standing out under its edge at every other bay line */
    F.wq(s0,s1,-0.04,0,G-0.25,0,L/(4*bw)*2);
    for(j=0;j<=nb;j++){ var s=s0+bw*j; F.slab(Math.max(s0,s-0.35),Math.min(s1,s+0.35),-1.25,-0.55,0,G-0.25,WHITE,0.74); }
    /* the floors: window wall, then a slab at each floor and at the roof */
    for(k=0;k<NF;k++){ var y0=G+k*FH; F.wq(s0,s1,-0.04,y0,y0+FH-0.25,0,L/(4*bw)); }
    for(k=0;k<=NF;k++){
      var yt=G+k*FH;
      F.slab(s0,s1,-BD,0,yt-0.25,yt,WHITE,0.9,WHITE); F.under(s0,s1,-BD,0,yt-0.25,WHITED);
      /* the haunches at the fins make the scalloped soffit */
      for(j=0;j<=nb;j++){ var sj=s0+bw*j, e=(j===0||j===nb), w1=e?0.3:0.45, w2=e?0.55:0.95;
        var a1=Math.max(s0,sj-w1), b1=Math.min(s1,sj+w1), a2=Math.max(s0,sj-w2), b2=Math.min(s1,sj+w2);
        F.slab(a2,b2,-BD,0,yt-0.4,yt-0.25,WHITE,0.88); F.under(a2,b2,-BD,0,yt-0.4,WHITED);
        F.slab(a1,b1,-BD,0,yt-0.6,yt-0.4,WHITE,0.86); F.under(a1,b1,-BD,0,yt-0.6,WHITED); }
      /* the rail */
      if(k>0&&k<NF){ var a=F.pt(s0+0.35,-BD+0.05), b=F.pt(s1-0.35,-BD+0.05); segBox(M,P(a[0],a[1]),P(b[0],b[1]),yt+0.96,yt+1.0,0.025,RAIL,0.9);
        for(j=0;j<nb;j++){ var m=F.pt(s0+bw*(j+0.5),-BD+0.05), pm=P(m[0],m[1]); postAt(M,pm[0],pm[1],yt,yt+0.98,0.012,RAIL,0.9); } }
    }
    /* thin white fins between the bays, wider frames at the ends */
    for(j=0;j<=nb;j++){ var sf=s0+bw*j, wf=(j===0||j===nb)?0.28:0.07;
      F.slab(Math.max(s0,sf-wf),Math.min(s1,sf+wf),-BD-0.03,0,G-0.6,TOP,WHITE,0.92); }
  }
  /* white bands at every floor on a tan end wall */
  function bands(F,s0,s1){
    for(var k=0;k<=NF;k++){ var y=G+k*FH; F.slab(s0,s1,-0.14,0,y-0.45,y,WHITE,0.9); }
    F.slab(s0,s1,-0.08,0,0,0.5,WHITED,0.75);
    /* white frames up the corners */
    F.slab(s0,Math.min(s1,s0+0.5),-0.18,0,0,TOP,WHITE,0.92); F.slab(Math.max(s0,s1-0.5),s1,-0.18,0,0,TOP,WHITE,0.92);
  }
  /* a strip of narrow stair windows */
  function slits(F,s,w){
    for(var k=0;k<NF;k++){ var y=G+k*FH; F.mq(s-w/2,s+w/2,-0.04,y+0.4,y+FH-0.6,GLASSG,1); }
  }

  /* ---------------- the slab, the wing, the stair towers ---------------- */
  box(-5,12,-60.7,-4.9,0,TOP,TAN,0.66,ROOF); cols.push([R(-5,12,-60.7,-4.9),TOP]);
  box(12,39.9,-43.6,-18.5,0,TOP,TAN,0.66,ROOF); cols.push([R(12,39.9,-43.6,-18.5),TOP]);
  box(0.7,7.3,-65.8,-60.7,0,TOP+2.4,TAN,0.66,ROOF); cols.push([R(0.7,7.3,-65.8,-60.7),TOP+2.4]);
  box(0,6.7,-4.9,0,0,TOP+2.4,TAN,0.66,ROOF); cols.push([R(0,6.7,-4.9,0),TOP+2.4]);
  balconies(Face('W',-5),-60.7,-4.9,16);
  balconies(Face('E',12),-60.7,-43.6,5);
  balconies(Face('E',12),-18.5,-4.9,4);
  balconies(Face('N',-43.6),13.6,39.9,8);
  balconies(Face('S',-18.5),13.6,39.9,8);
  /* tan ends with white bands, frames and stair windows */
  bands(Face('N',-60.7),-5,0.7); bands(Face('N',-60.7),7.3,12);
  bands(Face('N',-65.8),0.7,7.3); slits(Face('N',-65.8),4.0,1.7);
  bands(Face('W',0.7),-65.8,-60.7); bands(Face('E',7.3),-65.8,-60.7);
  bands(Face('S',-4.9),-5,0); bands(Face('S',-4.9),6.7,12);
  bands(Face('S',0),0,6.7); slits(Face('S',0),3.35,1.7);
  bands(Face('W',0),-4.9,0); bands(Face('E',6.7),-4.9,0);
  bands(Face('E',39.9),-43.6,-18.5); slits(Face('E',39.9),-31,1.7);
  /* the roof: penthouse, parapet caps */
  box(-1.5,8.5,-40,-22,TOP,TOP+3.6,WHITE,0.74,ROOF); box(-1.7,8.7,-40.2,-21.8,TOP+3.6,TOP+3.85,WHITED,0.8);
  box(20,27,-34,-28,TOP,TOP+2.6,WHITE,0.74,ROOF);
  [[0.7,7.3,-65.8,-60.7],[0,6.7,-4.9,0]].forEach(function(q){ box(q[0]-0.1,q[1]+0.1,q[2]-0.1,q[3]+0.1,TOP+2.4,TOP+2.65,WHITE,0.8); });

  /* ---------------- the window texture: glass with curtains in white frames, four bays ---------------- */
  var cv=document.createElement('canvas'); cv.width=512; cv.height=128;
  (function(){
    var g=cv.getContext('2d'), seed=5;
    function rr(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    for(var b=0;b<4;b++){
      var x0=b*128, gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,'#5E6A70'); gr.addColorStop(1,'#33393B');
      g.fillStyle=gr; g.fillRect(x0,0,128,128);
      for(var p=0;p<3;p++){ var r=rr(); if(r<0.55){ g.fillStyle=r<0.3?'rgba(232,224,204,0.85)':'rgba(214,200,170,0.75)';
        var cw=20+rr()*20; g.fillRect(x0+p*42+4,10,cw,114); } }
      g.fillStyle='#ECEAE4'; for(p=0;p<=3;p++) g.fillRect(x0+p*42-2,0,4,128);
      g.fillRect(x0,0,128,6); g.fillRect(x0,96,128,4);
    }
  })();
  var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  var geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(TP,3));
  geo.setAttribute('normal',new T.Float32BufferAttribute(TN,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(TU,2));
  geo.computeBoundingSphere();
  var wm=new T.Mesh(geo,new T.MeshLambertMaterial({map:tex})); wm.frustumCulled=false; wm.receiveShadow=true; wm.raycast=function(){}; scene.add(wm);

  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  window.__birnkrant={tris:M.count(),glass:TP.length/9};
})();
