/* ==================================================================
   USC Village kit (VK), shared by the Village building files (a2zn..a2zw)
   and finished by a2zx_village_end.js. One look for the whole Village:
   red running bond brick (a real texture, mapped in metres), pale cast
   stone trim, dark brown-grey tile roofs, and one window atlas (square
   and arched windows in stone surrounds, pointed Gothic windows, stone
   oriel bays with lancets, shopfronts, arcade arches, doors, clock).
   Everything every Village file adds goes into the same few meshes, so
   the Village as a whole is five draw calls however many buildings use it.

   Frames: VK.frame(origin,[ux,uz]) gives P(u,v) and loc(p) for a right
   handed frame (u along the given direction, v 90 degrees clockwise from
   it seen from above, i.e. v = (-uz,ux)). VK.face(A,B,out) is a wall face
   between world points A and B with outward direction out ([x,z]; if
   omitted, the right hand side of A->B seen from above). s runs along it
   LEFT TO RIGHT AS SEEN FROM OUTSIDE (0..L; A and B are swapped when out
   requires it, check F.A), d is distance OUT from the wall plane
   (negative goes into the building), y is height.
   ================================================================== */
var VK=(function(){
  var C={BRICK:0xB0583F, BRICK_D:0x8E4331, CAST:0xE7DCC4, CAST_L:0xF0E8D6, CAST_D:0xCBBEA2,
         ROOF:0x5E5652, ROOF_D:0x4A4340, GLASS:0x2C3438, FRAME:0xEDE7DA, BRONZE:0x4A3E30, DARK:0x221E1B,
         PAVE:0xC79A84, PAVE_D:0xA8735E, PAVE_L:0xE0C7B4};
  /* ---------------- accumulators ---------------- */
  function TM(){ this.p=[]; this.n=[]; this.c=[]; this.u=[]; }
  TM.prototype.tri=function(A,B,D,ta,tb,td,c){
    var ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1; nx/=l; ny/=l; nz/=l;
    this.p.push(A[0],A[1],A[2],B[0],B[1],B[2],D[0],D[1],D[2]); this.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);
    this.c.push(c[0],c[1],c[2],c[0],c[1],c[2],c[0],c[1],c[2]); this.u.push(ta[0],ta[1],tb[0],tb[1],td[0],td[1]);
  };
  TM.prototype.count=function(){ return this.p.length/9; };
  TM.prototype.geom=function(){ var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(this.p,3)); g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
    g.setAttribute('color',new T.Float32BufferAttribute(this.c,3)); g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
    g.computeBoundingSphere(); return g; };
  var MB=new TM(), MA=new TM(), MP=new TM(), M=new Mesher(), MG=new Mesher(), COLS=[];

  /* a quad turned to face `want` (a world vector), on any accumulator */
  function quad(tgt,pts,want,hex,k,uvs){
    var A=pts[0],B=pts[1],D=pts[2];
    var ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2], vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, o=[0,1,2,3];
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) o=[0,3,2,1];
    var q=o.map(function(i){ return pts[i]; }), c=rgb(hex,k===undefined?1:k);
    if(tgt===M||tgt===MG) tgt.quad(q[0],q[1],q[2],q[3],c,c,c,c);
    else { var t=o.map(function(i){ return uvs[i]; }); tgt.tri(q[0],q[1],q[2],t[0],t[1],t[2],c); tgt.tri(q[0],q[2],q[3],t[0],t[2],t[3],c); }
  }

  /* ---------------- frames and faces ---------------- */
  function frame(O,dir){ var l=Math.hypot(dir[0],dir[1])||1, du=[dir[0]/l,dir[1]/l], dv=[-du[1],du[0]];
    return {O:O,du:du,dv:dv,
      P:function(u,v){ return [O[0]+u*du[0]+v*dv[0], O[1]+u*du[1]+v*dv[1]]; },
      loc:function(p){ var x=p[0]-O[0], z=p[1]-O[1]; return [x*du[0]+z*du[1], x*dv[0]+z*dv[1]]; },
      yaw:Math.atan2(-du[1],du[0])}; }
  /* a wall face from A to B; out: [x,z] pointing away from the building (if omitted: to the right of A->B seen from above) */
  function face(A,B,out){
    var dx=B[0]-A[0], dz=B[1]-A[1], L=Math.hypot(dx,dz)||1; dx/=L; dz/=L;
    /* s must run left to right as seen from outside, or tiles and text come out mirrored: swap ends if out says so */
    if(out&&out[0]*-dz+out[1]*dx<0){ var tmp=A; A=B; B=tmp; dx=-dx; dz=-dz; }
    var n=[-dz,dx];
    var F={A:A,B:B,L:L,t:[dx,dz],n:n,want:[n[0],0,n[1]]};
    F.pt=function(s,d){ return [A[0]+dx*s+n[0]*d, A[1]+dz*s+n[1]*d]; };
    F.p3=function(s,d,y){ var p=F.pt(s,d); return [p[0],y,p[1]]; };
    F.ring=function(s0,s1,d0,d1){ var r=[F.pt(s0,d0),F.pt(s1,d0),F.pt(s1,d1),F.pt(s0,d1)]; if(ringArea(r)<0) r.reverse(); return r; };
    /* brick wall panel in the plane at distance d */
    F.brick=function(s0,s1,y0,y1,d,shade){ var p=[F.p3(s0,d||0,y0),F.p3(s1,d||0,y0),F.p3(s1,d||0,y1),F.p3(s0,d||0,y1)];
      var u0=(s0)/2.0, u1=(s1)/2.0;  /* the brick texture tile is 2 m by 1 m */
      quad(MB,p,F.want,0xFFFFFF,shade===undefined?1:shade,[[u0,y0],[u1,y0],[u1,y1],[u0,y1]]); };
    /* a solid stone (or any colour) block in face coordinates */
    F.block=function(s0,s1,d0,d1,y0,y1,col,sh,top){ var r=F.ring(s0,s1,d0,d1); prism(M,r,y0,y1,col||C.CAST,top||col||C.CAST,sh===undefined?0.7:sh); return r; };
    /* a flat coloured quad on the face (shadow lines, panels) */
    F.flat=function(s0,s1,y0,y1,d,col,k){ quad(M,[F.p3(s0,d,y0),F.p3(s1,d,y0),F.p3(s1,d,y1),F.p3(s0,d,y1)],F.want,col,k); };
    /* an atlas tile (see VK.TILE) stretched over s0..s1, y0..y1, at d (a little proud of the wall by default) */
    F.tile=function(id,s0,s1,y0,y1,d,flip){ var t=tileUV(id), p=[F.p3(s0,d===undefined?0.03:d,y0),F.p3(s1,d===undefined?0.03:d,y0),F.p3(s1,d===undefined?0.03:d,y1),F.p3(s0,d===undefined?0.03:d,y1)];
      var uv=flip?[[t[2],t[1]],[t[0],t[1]],[t[0],t[3]],[t[2],t[3]]]:[[t[0],t[1]],[t[2],t[1]],[t[2],t[3]],[t[0],t[3]]];
      quad(MA,p,F.want,0xFFFFFF,1,uv); };
    /* the underside of something that overhangs (eaves, arcades, balconies) */
    F.under=function(s0,s1,d0,d1,y,col){ quad(M,[F.p3(s0,d0,y),F.p3(s1,d0,y),F.p3(s1,d1,y),F.p3(s0,d1,y)],[0,-1,0],col||C.CAST_D,0.7); };
    return F;
  }

  /* ---------------- the brick texture: running bond, 2 m x 1 m per tile ---------------- */
  var brickTex=(function(){
    var cv=document.createElement('canvas'); cv.width=256; cv.height=128;
    var g=cv.getContext('2d'), seed=7; function r(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    g.fillStyle='#CDBFAE'; g.fillRect(0,0,256,128);                 /* mortar */
    var rows=16, bh=128/rows, bw=256/9.5;
    for(var y=0;y<rows;y++){ var off=(y%2)?bw/2:0;
      for(var x=-1;x<11;x++){ var x0=x*bw+off, k=0.84+r()*0.3, t=r();
        var base=t<0.08?[150,62,46]:(t<0.2?[186,96,70]:(t<0.32?[160,78,56]:[176,86,62]));
        g.fillStyle='rgb('+Math.round(base[0]*k)+','+Math.round(base[1]*k)+','+Math.round(base[2]*k)+')';
        g.fillRect(x0+1,y*bh+1,bw-2,bh-1.6); } }
    var t=new T.CanvasTexture(cv); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    return t;
  })();

  /* ---------------- the window atlas: 4 x 4 tiles of 256 px in a 1024 canvas ---------------- */
  var TILE={WIN:0, WIN_ARCH:1, GOTHIC:2, ORIEL:3, SHOP:4, ARCADE:5, DOOR:6, CLOCK:7, WIN_PAIR:8, VENT_ARCH:9, LANCET:10, SHOP_ARCH:11, BLANK_STONE:12, WIN_SMALL:13, ROSE:14, SPIRE_LOUVRE:15};
  function tileUV(id){ var c=id%4, r=(id/4)|0, e=2/1024; return [c/4+e, 1-(r+1)/4+e, (c+1)/4-e, 1-r/4-e]; }
  var atlasTex=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=1024;
    var g=cv.getContext('2d');
    g.clearRect(0,0,1024,1024);
    var STONE='#EEE5D2', STONE_D='#CDBF9F', GL='#33404A', GLL='#6F8796', MUL='#F3EEE4';
    function at(id,fn){ var c=id%4, r=(id/4)|0; g.save(); g.translate(c*256,r*256); g.beginPath(); g.rect(0,0,256,256); g.clip(); fn(); g.restore(); }
    function glass(x,y,w,h){ var gr=g.createLinearGradient(x,y,x+w*0.6,y+h); gr.addColorStop(0,GLL); gr.addColorStop(0.45,GL); gr.addColorStop(1,'#232A30'); g.fillStyle=gr; g.fillRect(x,y,w,h); }
    function sash(x,y,w,h,cols,rows){ glass(x,y,w,h); g.fillStyle=MUL; g.fillRect(x,y,w,5); g.fillRect(x,y+h-5,w,5); g.fillRect(x,y,5,h); g.fillRect(x+w-5,y,5,h);
      g.fillRect(x,y+h*0.5-3,w,6); for(var i=1;i<cols;i++) g.fillRect(x+w*i/cols-2,y,4,h); for(var j=1;j<rows;j++) g.fillRect(x,y+h*j/rows-2,w,4); }
    function archPath(x,y,w,h,pointed){ g.beginPath(); var r=w/2;
      if(pointed){ g.moveTo(x,y+h); g.lineTo(x,y+r*1.1); g.quadraticCurveTo(x,y,x+r,y); g.quadraticCurveTo(x+w,y,x+w,y+r*1.1); g.lineTo(x+w,y+h); }
      else { g.moveTo(x,y+h); g.lineTo(x,y+r); g.arc(x+r,y+r,r,Math.PI,0); g.lineTo(x+w,y+h); }
      g.closePath(); }
    /* 0: double hung window in a stone surround with sill and keystone head */
    at(0,function(){ g.fillStyle=STONE; g.fillRect(40,8,176,240); g.fillStyle=STONE_D; g.fillRect(28,228,200,22); g.fillRect(34,8,188,22);
      sash(62,34,132,190,2,2); });
    /* 1: arched head window in a stone surround */
    at(1,function(){ g.fillStyle=STONE; archPath(36,8,184,244,false); g.fill(); g.fillStyle=STONE_D; g.fillRect(28,230,200,22);
      g.save(); archPath(60,32,136,200,false); g.clip(); sash(60,32,136,200,2,3); g.restore(); });
    /* 2: tall pointed Gothic window with tracery */
    at(2,function(){ g.fillStyle=STONE; archPath(34,4,188,252,true); g.fill(); g.save(); archPath(56,24,144,224,true); g.clip(); glass(56,24,144,224);
      g.fillStyle=MUL; g.fillRect(124,24,8,224); g.fillRect(56,150,144,6); g.fillRect(56,90,144,4);
      g.strokeStyle=MUL; g.lineWidth=5; g.beginPath(); g.arc(128,66,22,0,6.283); g.stroke(); g.restore(); });
    /* 3: a cream stone oriel bay panel with two lancets (stack it up a facade) */
    at(3,function(){ g.fillStyle=STONE; g.fillRect(0,0,256,256); g.fillStyle=STONE_D; g.fillRect(0,0,256,10); g.fillRect(0,246,256,10); g.fillRect(0,0,10,256); g.fillRect(246,0,10,256);
      [[34,90],[134,90]].forEach(function(p){ g.save(); archPath(p[0],26,p[1],200,true); g.clip(); sash(p[0],26,p[1],200,1,3); g.restore();
        g.strokeStyle=STONE_D; g.lineWidth=4; archPath(p[0],26,p[1],200,true); g.stroke(); });
      g.fillStyle=STONE_D; g.fillRect(20,226,216,10); });
    /* 4: shopfront, dark glass with mullions, warm inside */
    at(4,function(){ g.fillStyle='#2A2522'; g.fillRect(0,0,256,256); var gr=g.createLinearGradient(0,40,0,256); gr.addColorStop(0,'#55606A'); gr.addColorStop(0.5,'#8C6E49'); gr.addColorStop(1,'#3B3129');
      g.fillStyle=gr; g.fillRect(10,40,236,206); g.fillStyle='#1E1A17'; g.fillRect(0,0,256,40); g.fillRect(0,246,256,10);
      for(var i=0;i<=4;i++) g.fillRect(8+i*60,40,6,206); g.fillRect(8,150,240,5); });
    /* 5: arcade arch: stone voussoirs round a dark opening (transparent outside the pier faces) */
    at(5,function(){ g.fillStyle=STONE; g.fillRect(0,0,256,256); g.fillStyle='#2A2421'; archPath(36,30,184,226,false); g.fill();
      g.strokeStyle=STONE_D; g.lineWidth=10; archPath(36,30,184,226,false); g.stroke(); g.fillStyle=STONE_D; g.fillRect(120,18,16,28); });
    /* 6: double glass door with transom */
    at(6,function(){ g.fillStyle=STONE; g.fillRect(16,0,224,256); g.fillStyle='#2A2522'; g.fillRect(36,20,184,236);
      glass(44,28,80,52); glass(132,28,80,52); glass(44,92,80,160); glass(132,92,80,160); g.fillStyle='#B7A47F'; g.fillRect(118,140,4,40); g.fillRect(134,140,4,40); });
    /* 7: clock face */
    at(7,function(){ g.fillStyle=STONE; g.fillRect(0,0,256,256); g.fillStyle='#FBF8F0'; g.beginPath(); g.arc(128,128,108,0,6.283); g.fill();
      g.strokeStyle='#2B2622'; g.lineWidth=8; g.stroke(); g.lineWidth=6;
      for(var i=0;i<12;i++){ var a=i/12*6.283; g.beginPath(); g.moveTo(128+Math.cos(a)*86,128+Math.sin(a)*86); g.lineTo(128+Math.cos(a)*100,128+Math.sin(a)*100); g.stroke(); }
      g.lineWidth=9; g.beginPath(); g.moveTo(128,128); g.lineTo(128,62); g.stroke(); g.lineWidth=7; g.beginPath(); g.moveTo(128,128); g.lineTo(178,128); g.stroke(); });
    /* 8: a pair of windows under one stone head */
    at(8,function(){ g.fillStyle=STONE; g.fillRect(10,10,236,236); g.fillStyle=STONE_D; g.fillRect(0,228,256,24); sash(28,40,92,184,1,2); sash(136,40,92,184,1,2); });
    /* 9: arched louvred vent in a stone surround (top floor gable) */
    at(9,function(){ g.fillStyle=STONE; archPath(40,10,176,236,false); g.fill(); g.save(); archPath(66,36,124,190,false); g.clip(); g.fillStyle='#3E3A36'; g.fillRect(66,36,124,190);
      g.fillStyle='#857C70'; for(var y=60;y<226;y+=14) g.fillRect(66,y,124,5); g.restore(); });
    /* 10: narrow lancet in stone */
    at(10,function(){ g.fillStyle=STONE; archPath(70,4,116,252,true); g.fill(); g.save(); archPath(90,26,76,226,true); g.clip(); sash(90,26,76,226,1,4); g.restore(); });
    /* 11: shopfront under a round arch */
    at(11,function(){ g.fillStyle=STONE; g.fillRect(0,0,256,256); g.save(); archPath(22,14,212,242,false); g.clip(); g.fillStyle='#2A2522'; g.fillRect(0,0,256,256);
      var gr=g.createLinearGradient(0,60,0,256); gr.addColorStop(0,'#5E6A73'); gr.addColorStop(0.5,'#94754C'); gr.addColorStop(1,'#3B3129'); g.fillStyle=gr; g.fillRect(34,40,188,216);
      g.fillStyle='#1E1A17'; g.fillRect(124,40,8,216); g.fillRect(34,120,188,6); g.restore(); g.strokeStyle='#CDBF9F'; g.lineWidth=8; archPath(22,14,212,242,false); g.stroke(); });
    /* 12: plain cast stone (for blank panels, signs set on it with facadeText) */
    at(12,function(){ g.fillStyle=STONE; g.fillRect(0,0,256,256); g.strokeStyle=STONE_D; g.lineWidth=6; g.strokeRect(14,14,228,228); });
    /* 13: small square window */
    at(13,function(){ g.fillStyle=STONE; g.fillRect(48,48,160,160); sash(70,70,116,116,2,2); });
    /* 14: rose window */
    at(14,function(){ g.fillStyle=STONE; g.beginPath(); g.arc(128,128,124,0,6.283); g.fill(); g.fillStyle=GL; g.beginPath(); g.arc(128,128,96,0,6.283); g.fill();
      g.strokeStyle=MUL; g.lineWidth=7; for(var i=0;i<8;i++){ var a=i/8*6.283; g.beginPath(); g.moveTo(128,128); g.lineTo(128+Math.cos(a)*96,128+Math.sin(a)*96); g.stroke(); }
      g.beginPath(); g.arc(128,128,40,0,6.283); g.stroke(); });
    /* 15: belfry louvre under a pointed arch */
    at(15,function(){ g.fillStyle=STONE; archPath(30,4,196,252,true); g.fill(); g.save(); archPath(52,24,152,232,true); g.clip(); g.fillStyle='#2F2B28'; g.fillRect(52,24,152,232);
      g.fillStyle='#7A6F62'; for(var y=70;y<256;y+=16) g.fillRect(52,y,152,6); g.restore(); });
    var t=new T.CanvasTexture(cv); t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return t;
  })();

  /* ---------------- paving texture for plazas and walks (2 m tile, herringbone-ish squares with brick bands) ---------------- */
  var paveTex=(function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=256; var g=cv.getContext('2d'), seed=3;
    function r(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    g.fillStyle='#B98F7B'; g.fillRect(0,0,256,256);
    for(var y=0;y<256;y+=16) for(var x=0;x<256;x+=32){ var k=0.9+r()*0.18; g.fillStyle='rgb('+Math.round(196*k)+','+Math.round(150*k)+','+Math.round(128*k)+')'; g.fillRect(x+((y/16)%2?16:0)+1,y+1,30,14); }
    var t=new T.CanvasTexture(cv); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return t;
  })();

  /* ---------------- convenience ---------------- */
  /* a hip roof over a footprint ring, dark tile, with a stone cornice band under it */
  function roof(ring,y,rise,overhang){
    var e=offsetRing(ring,overhang===undefined?0.6:overhang);
    band(M,e,y,y+0.45,0,C.CAST,0.9,0.6);
    hipRoof(M,e,y+0.45,rise||4.2,Math.min((rise||4.2)*1.3,9),C.ROOF);
  }
  /* brick on every edge of a ring from y0 to y1 (outward faces), e.g. a whole block */
  function brickRing(ring,y0,y1){ var r=ring.slice(); if(ringArea(r)<0) r.reverse();
    for(var i=0;i<r.length;i++){ var a=r[i], b=r[(i+1)%r.length], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz); if(L<0.05) continue;
      face(a,b,null).brick(0,L,y0,y1,0); } }
  /* paving (textured, in metres) on a ring at height y */
  function pave(ring,y,k){ var r=ring.slice(); if(ringArea(r)<0) r.reverse(); var f=triangulate(r), c=[k||1,k||1,k||1];
    for(var i=0;i<f.length;i++){ var A=r[f[i][0]],B=r[f[i][1]],D=r[f[i][2]];
      MP.tri([A[0],y,A[1]],[D[0],y,D[1]],[B[0],y,B[1]],[A[0]/2,A[1]/2],[D[0]/2,D[1]/2],[B[0]/2,B[1]/2],c); } }
  function collider(ring,h){ COLS.push([ring,h]); }

  var done=false;
  function finish(){
    if(done) return; done=true;
    COLS.forEach(function(c){ addCollider(c[0],c[1]); });
    function add(g,mat,cast){ var m=new T.Mesh(g,mat); m.frustumCulled=false; m.castShadow=!!cast; m.receiveShadow=true; m.raycast=function(){}; scene.add(m); return m; }
    if(MB.count()) add(MB.geom(),new T.MeshLambertMaterial({map:brickTex,vertexColors:true}),true);
    if(MA.count()) add(MA.geom(),new T.MeshLambertMaterial({map:atlasTex,vertexColors:true,transparent:true,alphaTest:0.5,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),false);
    if(MP.count()) add(MP.geom(),new T.MeshLambertMaterial({map:paveTex,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),false);
    if(M.count()) add(M.geom(),matWorld,true);
    if(MG.count()) add(MG.geom(),matGround,false);
    window.__village={brick:MB.count(),atlas:MA.count(),pave:MP.count(),solid:M.count(),ground:MG.count(),cols:COLS.length};
  }
  return {C:C,TILE:TILE,tileUV:tileUV,frame:frame,face:face,quad:quad,roof:roof,brickRing:brickRing,pave:pave,collider:collider,finish:finish,
          M:M,MG:MG,MB:MB,MA:MA,MP:MP,TM:TM};
})();
