/* ==================================================================
   Allan Hancock Foundation Building (1940), on Trousdale Parkway behind
   Traveler. a_world.js leaves the footprint empty (HAND_HALLS) and sets
   HANC (campus grid frame: origin at the north west corner, u grid east,
   v grid south along the Trousdale front; the walk to the steps; the
   front lawn kept clear).

   From photos: a brick block of three tall storeys and an attic. Red
   brick piers run up between the bays to the coping. The ground storey
   is pale cast stone striped with brick courses (canvas texture), with
   pairs of tall steel windows. Above it a stone band with a row of
   brick squares, then stone sill and head bands across each bay for the
   two upper storeys of paired steel windows, carved stone plaques with
   sea creatures and the Velero III in the attic, stone coping. Wider
   piers at the outside corners.
   The entrance in the middle of the west front: a projecting Moderne
   cast stone pavilion (piers with fluted, stepped tops; a grille; two
   dark wood doors in deep portals under chevron hoods; bronze plaque),
   above it three tall strips of windows with stone spandrels between
   stone frames picked out with brick squares. Steps between low cheek
   walls with white urns of flowers, clipped hedges along the base, the
   lawn with magnolias, figs and a sycamore. Flat roof with a penthouse
   and a vent stack.
   Draw calls: one Mesher (matWorld), one ground Mesher, the striped
   stone storey (repeating texture) and everything else textured
   (windows, plaques, grille, doors, hoods) on one canvas atlas.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Hancock Foundation Building') B=CAMPUS[bi];
  if(!B||typeof HANC==='undefined'||!HANC) return;
  var P=HANC.P, DU=HANC.du, DV=HANC.dv, VC=HANC.VC;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var BRICK=0xBE6C55, BRICKD=0x8E4A38, STONE=0xD5D0C3, STONEL=0xE2DED3, STONED=0xB9B3A4,
      ROOF=0x8E8B84, HEDGE=0x32602B, HEDGEL=0x41733A, MULCH=0x56402F, PAVE=0xC4BDAE, URN=0xEFEDE6,
      METAL=0xB9BCBC, LEAF=0x3E6B32;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }

  /* ---------------- textured accumulator (position, normal, colour, uv) ---------------- */
  function TM(){ this.p=[]; this.n=[]; this.c=[]; this.u=[]; }
  TM.prototype.tri=function(A,B2,C,ca,cb,cc,ta,tb,tc){
    var ux=B2[0]-A[0],uy=B2[1]-A[1],uz=B2[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
    nx/=l; ny/=l; nz/=l;
    this.p.push(A[0],A[1],A[2],B2[0],B2[1],B2[2],C[0],C[1],C[2]);
    this.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);
    this.c.push(ca[0],ca[1],ca[2],cb[0],cb[1],cb[2],cc[0],cc[1],cc[2]);
    this.u.push(ta[0],ta[1],tb[0],tb[1],tc[0],tc[1]);
  };
  TM.prototype.quad=function(A,B2,C,D,ca,cb,cc,cd,ta,tb,tc,td){
    this.tri(A,B2,C,ca,cb,cc,ta,tb,tc); this.tri(A,C,D,ca,cc,cd,ta,tc,td); };
  TM.prototype.count=function(){ return this.p.length/9; };
  TM.prototype.geom=function(){
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));
    g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
    g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
    g.computeBoundingSphere(); return g; };
  var MS=new TM(), MA=new TM();

  /* darker toward the ground, like the soft shadow at the foot of a wall */
  function shade(hex,y,k){ return rgb(hex,(k===undefined?1:k)*(0.82+0.18*Math.min(1,Math.max(0,y)/3.5))); }
  var WHITE=0xFFFFFF;
  /* one quad, turned so it faces `want`; tgt is M, MS or MA */
  function emit(tgt,pts,want,hex,k,uvs){
    var A=pts[0],B2=pts[1],C=pts[2];
    var ux=B2[0]-A[0],uy=B2[1]-A[1],uz=B2[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    var o=[0,1,2,3];
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) o=[0,3,2,1];
    var q=o.map(function(i){ return pts[i]; }), c=q.map(function(p){ return shade(hex,p[1],k); });
    if(tgt===M) M.quad(q[0],q[1],q[2],q[3],c[0],c[1],c[2],c[3]);
    else { var t=o.map(function(i){ return uvs[i]; }); tgt.quad(q[0],q[1],q[2],q[3],c[0],c[1],c[2],c[3],t[0],t[1],t[2],t[3]); }
  }

  /* ---------------- a wall frame: s along the wall, d out of it ---------------- */
  function Face(a,t,n,L){
    var F={a:a,t:t,n:n,L:L};
    F.nw=[DU[0]*n[0]+DV[0]*n[1],0,DU[1]*n[0]+DV[1]*n[1]];
    F.tw=[DU[0]*t[0]+DV[0]*t[1],0,DU[1]*t[0]+DV[1]*t[1]];
    F.W=function(s,d,y){ var p=P(a[0]+t[0]*s+n[0]*d, a[1]+t[1]*s+n[1]*d); return [p[0],y,p[1]]; };
    F.G=function(s,d){ return P(a[0]+t[0]*s+n[0]*d, a[1]+t[1]*s+n[1]*d); };
    return F;
  }
  var KS=1/1.2;   /* stone texture: one tile is 1.2 m square, two brick courses */
  /* a box in a wall frame. mat: a colour (M) or 'S' (the striped stone storey). o: back, bot, noTop, noSides */
  function fbox(F,s0,s1,d0,d1,y0,y1,mat,o){
    o=o||{};
    var tg=mat==='S'?MS:M, hex=mat==='S'?WHITE:mat, W=F.W, nw=F.nw, tw=F.tw;
    var mt=[-tw[0],0,-tw[2]], mn=[-nw[0],0,-nw[2]];
    function uv(a,b){ return [a*KS,b*KS]; }
    emit(tg,[W(s0,d1,y0),W(s1,d1,y0),W(s1,d1,y1),W(s0,d1,y1)],nw,hex,1,[uv(s0,y0),uv(s1,y0),uv(s1,y1),uv(s0,y1)]);
    if(!o.noSides){
      emit(tg,[W(s0,d0,y0),W(s0,d1,y0),W(s0,d1,y1),W(s0,d0,y1)],mt,hex,1,[uv(s0+d0,y0),uv(s0+d1,y0),uv(s0+d1,y1),uv(s0+d0,y1)]);
      emit(tg,[W(s1,d0,y0),W(s1,d1,y0),W(s1,d1,y1),W(s1,d0,y1)],tw,hex,1,[uv(s1-d0,y0),uv(s1-d1,y0),uv(s1-d1,y1),uv(s1-d0,y1)]);
    }
    if(!o.noTop) emit(tg,[W(s0,d0,y1),W(s1,d0,y1),W(s1,d1,y1),W(s0,d1,y1)],[0,1,0],hex,1.06,[uv(s0,d0),uv(s1,d0),uv(s1,d1),uv(s0,d1)]);
    if(o.bot) emit(tg,[W(s0,d0,y0),W(s1,d0,y0),W(s1,d1,y0),W(s0,d1,y0)],[0,-1,0],hex,0.8,[uv(s0,d0),uv(s1,d0),uv(s1,d1),uv(s0,d1)]);
    if(o.back) emit(tg,[W(s0,d0,y0),W(s1,d0,y0),W(s1,d0,y1),W(s0,d0,y1)],mn,hex,1,[uv(s0,y0),uv(s1,y0),uv(s1,y1),uv(s0,y1)]);
  }
  /* a flat textured panel on the atlas, facing out of the wall at depth d */
  function panel(F,s0,s1,d,y0,y1,rg){
    var W=F.W, u0=rg[0], v0=rg[1], u1=rg[2], v1=rg[3];
    /* s runs to the viewer's left on some walls: mirror so the carvings read the right way */
    if(F.n[1]*F.t[0]-F.n[0]*F.t[1]<0){ var tmp=u0; u0=u1; u1=tmp; }
    emit(MA,[W(s0,d,y0),W(s1,d,y0),W(s1,d,y1),W(s0,d,y1)],F.nw,WHITE,1,[[u0,v1],[u1,v1],[u1,v0],[u0,v0]]);
  }

  /* ---------------- the canvas atlas ---------------- */
  var AT=512, cv=document.createElement('canvas'); cv.width=cv.height=AT;
  var g=cv.getContext('2d');
  /* region in uv (u0, v0 top, u1, v1 bottom) from canvas pixels */
  function RG(x,y,w,h){ return [x/AT,1-y/AT,(x+w)/AT,1-(y+h)/AT]; }
  function steelWindow(x,y,w,h,ncol,nrow){
    var gr=g.createLinearGradient(0,y,0,y+h);
    gr.addColorStop(0,'#8EA3B2'); gr.addColorStop(0.45,'#5A6C79'); gr.addColorStop(1,'#3A4853');
    g.fillStyle=gr; g.fillRect(x,y,w,h);
    /* a few panes catch the sky */
    var pw=(w-10)/ncol, ph=(h-10)/nrow;
    for(var r=0;r<nrow;r++) for(var c=0;c<ncol;c++){
      var hsh=((r*7+c*13+x)%5);
      if(hsh===0){ g.fillStyle='rgba(170,195,215,0.35)'; g.fillRect(x+5+c*pw,y+5+r*ph,pw,ph); }
      if(hsh===3){ g.fillStyle='rgba(20,26,32,0.35)'; g.fillRect(x+5+c*pw,y+5+r*ph,pw,ph); }
    }
    g.fillStyle='#E4E1D7';
    g.fillRect(x,y,w,6); g.fillRect(x,y+h-6,w,6); g.fillRect(x,y,6,h); g.fillRect(x+w-6,y,6,h);
    for(c=1;c<ncol;c++) g.fillRect(x+5+c*pw-2,y,5,h);
    for(r=1;r<nrow;r++) g.fillRect(x,y+5+r*ph-2,w,4);
    g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(x+6,y+6,w-12,3);
  }
  steelWindow(0,0,128,512,2,6);          /* tall ground storey windows */
  steelWindow(128,0,128,384,2,4);        /* upper windows */
  var R_GW=RG(2,2,124,508), R_UW=RG(130,2,124,380);
  /* carved plaques: dolphin, fish, scallop shell, the Velero III */
  function plaque(x,y,w,h,kind){
    g.fillStyle='#D9D4C6'; g.fillRect(x,y,w,h);
    g.strokeStyle='#ABA493'; g.lineWidth=3; g.strokeRect(x+5,y+5,w-10,h-10);
    g.strokeStyle='#F0ECE2'; g.lineWidth=2; g.strokeRect(x+9,y+9,w-18,h-18);
    var cx=x+w/2, cy=y+h/2;
    function shape(dx,dy){
      g.beginPath();
      if(kind===0){        /* dolphin leaping */
        g.moveTo(cx-38+dx,cy+16+dy); g.quadraticCurveTo(cx-10+dx,cy-34+dy,cx+30+dx,cy-6+dy);
        g.lineTo(cx+42+dx,cy-14+dy); g.lineTo(cx+36+dx,cy+2+dy); g.quadraticCurveTo(cx-6+dx,cy-14+dy,cx-30+dx,cy+20+dy);
        g.lineTo(cx-44+dx,cy+26+dy); g.closePath();
        g.moveTo(cx-4+dx,cy-16+dy); g.lineTo(cx+2+dx,cy-30+dy); g.lineTo(cx+8+dx,cy-14+dy); g.closePath();
      } else if(kind===1){ /* fish */
        g.ellipse(cx-6+dx,cy+dy,30,14,0,0,6.2832);
        g.moveTo(cx+20+dx,cy+dy); g.lineTo(cx+42+dx,cy-14+dy); g.lineTo(cx+42+dx,cy+14+dy); g.closePath();
      } else if(kind===2){ /* scallop shell */
        g.moveTo(cx+dx,cy+26+dy);
        for(var i=0;i<=8;i++){ var a=Math.PI*(1.12+i*0.095); g.lineTo(cx+Math.cos(a)*40+dx,cy+18+Math.sin(a)*40+dy); }
        g.closePath();
        g.rect(cx-12+dx,cy+22+dy,24,8);
      } else {             /* the research ship */
        g.moveTo(cx-44+dx,cy+8+dy); g.lineTo(cx+44+dx,cy+8+dy); g.lineTo(cx+34+dx,cy+22+dy); g.lineTo(cx-36+dx,cy+22+dy); g.closePath();
        g.rect(cx-20+dx,cy-6+dy,30,14); g.rect(cx-4+dx,cy-30+dy,4,24); g.rect(cx-30+dx,cy-18+dy,3,26);
      }
    }
    g.fillStyle='#9E9786'; shape(3,3); g.fill();
    g.fillStyle='#EEEAE0'; shape(0,0); g.fill();
    g.strokeStyle='#C2BBA9'; g.lineWidth=1.5; for(var k=0;k<3;k++){ g.beginPath(); g.moveTo(x+16,y+h-18+k*4); g.lineTo(x+w-16,y+h-18+k*4); g.stroke(); }
  }
  var R_PL=[];
  for(var pk=0;pk<4;pk++){ plaque(256,pk*96,128,96,pk); R_PL.push(RG(258,pk*96+2,124,92)); }
  /* the Moderne grille beside the doors */
  (function(){
    var x=384,y=0,w=128,h=384;
    g.fillStyle='#2A2D2F'; g.fillRect(x,y,w,h);
    g.strokeStyle='#C9C6BC'; g.lineWidth=4;
    for(var i=0;i<=6;i++){ g.beginPath(); g.moveTo(x+8+i*(w-16)/6,y+6); g.lineTo(x+8+i*(w-16)/6,y+h-6); g.stroke(); }
    g.lineWidth=3;
    for(var r=0;r<9;r++){ var yy=y+20+r*40;
      g.beginPath(); g.moveTo(x+8,yy+18); g.lineTo(x+w/2,yy); g.lineTo(x+w-8,yy+18); g.stroke();
      g.beginPath(); g.moveTo(x+w/2-14,yy+20); g.lineTo(x+w/2,yy+8); g.lineTo(x+w/2+14,yy+20); g.stroke(); }
    g.strokeStyle='#E4E1D7'; g.lineWidth=8; g.strokeRect(x+4,y+4,w-8,h-8);
  })();
  var R_GR=RG(386,2,124,380);
  /* dark wood door with panels and a glazed top */
  (function(){
    var x=256,y=384,w=64,h=128;
    g.fillStyle='#7A4426'; g.fillRect(x,y,w,h);
    g.fillStyle='#8E5530'; g.fillRect(x+5,y+5,w-10,h-10);
    g.fillStyle='#2E3840'; g.fillRect(x+12,y+12,w-24,30);
    g.strokeStyle='#5E331C'; g.lineWidth=2;
    for(var i=0;i<3;i++) g.strokeRect(x+12,y+50+i*24,w-24,20);
    g.fillStyle='#C9A86A'; g.fillRect(x+w-14,y+70,4,10);
  })();
  var R_DR=RG(258,386,60,124);
  /* chevron hood over the doors */
  (function(){
    var x=320,y=384,w=128,h=64;
    g.fillStyle='#A39888'; g.fillRect(x,y,w,h);
    g.strokeStyle='#6E6253'; g.lineWidth=3;
    for(var r=0;r<4;r++) for(var i=0;i<8;i++){ var xx=x+i*16, yy=y+8+r*14;
      g.beginPath(); g.moveTo(xx,yy+8); g.lineTo(xx+8,yy); g.lineTo(xx+16,yy+8); g.stroke(); }
    g.fillStyle='#CFC8BA'; g.fillRect(x,y,w,5); g.fillRect(x,y+h-5,w,5);
  })();
  var R_HD=RG(322,386,124,60);
  /* bronze plaque */
  (function(){
    var x=448,y=384,w=64,h=64;
    g.fillStyle='#4E3F2C'; g.fillRect(x,y,w,h);
    g.strokeStyle='#A88D5E'; g.lineWidth=2; g.strokeRect(x+5,y+5,w-10,h-10);
    g.fillStyle='#B39866'; for(var i=0;i<6;i++) g.fillRect(x+12,y+14+i*7,w-24-(i%2)*10,3);
  })();
  var R_BZ=RG(450,386,60,60);
  var atlas=new T.CanvasTexture(cv);
  atlas.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

  /* the striped stone storey: pale cast stone, a brick course every 0.6 m, faint joints */
  var cs=document.createElement('canvas'); cs.width=cs.height=256;
  (function(){
    var c=cs.getContext('2d');
    c.fillStyle='#D6D1C4'; c.fillRect(0,0,256,256);
    for(var i=0;i<900;i++){ var v=200+((i*53)%40); c.fillStyle='rgba('+v+','+(v-5)+','+(v-16)+',0.25)';
      c.fillRect((i*97)%256,(i*61)%256,3,2); }
    /* joints between blocks (two rows of blocks per course) */
    c.fillStyle='rgba(120,112,98,0.35)';
    [0,1,2,3].forEach(function(r){ var yy=r*64+16; c.fillRect(0,yy+46,256,2);
      var off=(r%2)?64:0; for(var x=off;x<256+64;x+=128) c.fillRect(x%256,yy,2,48); });
    /* brick courses at y = 0 and 0.6 m (rows 240..255 and 112..127 from the top) */
    c.fillStyle='#A75A43'; c.fillRect(0,240,256,16); c.fillRect(0,112,256,16);
    c.fillStyle='rgba(60,30,20,0.35)'; c.fillRect(0,240,256,2); c.fillRect(0,112,256,2);
  })();
  var stoneTex=new T.CanvasTexture(cs); stoneTex.wrapS=stoneTex.wrapT=T.RepeatWrapping;
  stoneTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

  /* ---------------- heights ---------------- */
  var PL=0.75, GW0=0.95, GW1=4.2, ST=4.6, CB=ST+0.68, F2A=7.0, F2B=9.9, F3A=11.4, F3B=14.0,
      TOP=16.5, CAP=16.82, ROOFY=16.05, DIN=-0.25, DG=-0.2, PJ=0.32;

  /* ---------------- the bays ---------------- */
  function rowPieces(s0,s1,wins){ var out=[], a=s0;
    wins.forEach(function(w){ if(w[0]>a+0.001) out.push([a,w[0]]); a=w[1]; });
    if(s1>a+0.001) out.push([a,s1]); return out; }
  function winSpans(s0,s1,n){
    var w=s1-s0, ww=n===2?Math.min(1.3,(w-0.95)/2):Math.min(1.3,w-0.6), c=(s0+s1)/2;
    if(n===1) return [[c-ww/2,c+ww/2]];
    return [[c-0.21-ww,c-0.21],[c+0.21,c+0.21+ww]];
  }
  function checker(F,s0,s1){
    fbox(F,s0,s1,0,0.05,ST,ST+0.22,STONE,{bot:1});
    fbox(F,s0,s1,0,0.05,ST+0.46,CB,STONE,{bot:1});
    var n=Math.max(1,Math.round((s1-s0)/0.5)), p=(s1-s0)/n, a=s0;
    for(var i=0;i<n;i++){ var c=s0+(i+0.5)*p;
      fbox(F,a,c-0.13,0,0.05,ST+0.22,ST+0.46,STONE,{noTop:1}); a=c+0.13; }
    fbox(F,a,s1,0,0.05,ST+0.22,ST+0.46,STONE,{noTop:1});
  }
  function coping(F,s0,s1){ fbox(F,s0,s1,-0.34,0.08,TOP,TOP+0.28,STONE,{bot:1,back:1}); }
  var plq=0, HED=[];
  function bay(F,s0,s1,kind){
    if(kind==='B'){                     /* blank brick field */
      fbox(F,s0,s1,DIN,0.06,0,PL,'S',{});
      fbox(F,s0,s1,DIN,0,PL,ST,'S',{noTop:1,noSides:1});
      fbox(F,s0,s1,DIN,0,ST,TOP,BRICK,{noSides:1,back:1});
      checker(F,s0,s1); coping(F,s0,s1); return;
    }
    var n=kind==='W2'?2:1, ws=winSpans(s0,s1,n);
    /* stone storey: plinth, sill strip, pieces between the windows, strip over them */
    fbox(F,s0,s1,DIN,0.06,0,PL,'S',{});
    fbox(F,s0,s1,DIN,0,PL,GW0,'S',{noSides:1});
    rowPieces(s0,s1,ws).forEach(function(q){ fbox(F,q[0],q[1],DIN,0,GW0,GW1,'S',{noTop:1}); });
    fbox(F,s0,s1,DIN,0,GW1,ST,'S',{noTop:1,noSides:1,bot:1});
    ws.forEach(function(w){ panel(F,w[0],w[1],DG,GW0,GW1,R_GW); });
    /* brick above, the upper windows, stone sills and heads across the bay */
    fbox(F,s0,s1,DIN,0,ST,F2A-0.2,BRICK,{noSides:1,noTop:1});
    rowPieces(s0,s1,ws).forEach(function(q){ fbox(F,q[0],q[1],DIN,0,F2A,F2B,BRICK,{noTop:1}); });
    fbox(F,s0,s1,DIN,0,F2B,F3A-0.2,BRICK,{noSides:1,noTop:1,bot:1});
    rowPieces(s0,s1,ws).forEach(function(q){ fbox(F,q[0],q[1],DIN,0,F3A,F3B,BRICK,{noTop:1}); });
    fbox(F,s0,s1,DIN,0,F3B,TOP,BRICK,{noSides:1,bot:1,back:1});
    ws.forEach(function(w){ panel(F,w[0],w[1],DG,F2A,F2B,R_UW); panel(F,w[0],w[1],DG,F3A,F3B,R_UW); });
    checker(F,s0,s1);
    /* sills run back into the window reveals */
    fbox(F,s0,s1,DIN,0.09,F2A-0.2,F2A,STONE,{bot:1,noSides:1});
    fbox(F,s0,s1,0,0.05,F2B,F2B+0.45,STONE,{bot:1});
    fbox(F,s0,s1,DIN,0.09,F3A-0.2,F3A,STONE,{bot:1,noSides:1});
    fbox(F,s0,s1,0,0.05,F3B,F3B+0.4,STONE,{bot:1});
    /* carved plaque in the attic */
    var c=(s0+s1)/2, pw=n===2?0.78:0.5;
    fbox(F,c-pw,c+pw,0,0.05,14.78,15.9,STONE,{bot:1});
    panel(F,c-pw+0.07,c+pw-0.07,0.075,14.85,15.83,R_PL[(plq++)%4]);
    coping(F,s0,s1);
  }
  function pier(F,s0,s1,pj,e0,e1,yb){
    var a=s0-(e0?pj:0), b=s1+(e1?pj:0); yb=yb||0;
    if(yb<ST){ fbox(F,a,b,DIN,pj+0.04,yb,PL,'S',{}); fbox(F,a,b,DIN,pj,PL,ST,'S',{noTop:1}); }
    fbox(F,a,b,DIN,pj,Math.max(ST,yb),TOP,BRICK,{back:1,noTop:1,bot:yb>ST});
    fbox(F,a-0.05,b+0.05,-0.38,pj+0.07,TOP,CAP,STONE,{bot:1,back:1});
  }
  /* lay out a face from a list of [kind,width]; P and C keep their widths, the rest share what is left */
  function layout(F,list,ext0,ext1){
    var fixed=0, flex=0;
    list.forEach(function(q){ if(q[0]==='P'||q[0]==='C'||q[0]==='E') fixed+=q[1]; else flex+=q[1]; });
    var k=(F.L-fixed)/flex, s=0, out=[];
    list.forEach(function(q,i){
      var w=(q[0]==='P'||q[0]==='C'||q[0]==='E')?q[1]:q[1]*k, s0=s, s1=s+w;
      if(q[0]==='P') pier(F,s0,s1,PJ,false,false);
      else if(q[0]==='C'){
        /* the corner pier wraps the corner on one face; the other face's pier starts behind it */
        if(i===0) pier(F,ext0?s0:s0-DIN,s1,PJ,ext0,false); else pier(F,s0,ext1?s1:s1+DIN,PJ,false,ext1);
      }
      else if(q[0]==='E') out.push([s0,s1]);
      else bay(F,s0,s1,q[0]);
      s=s1;
    });
    return out;
  }

  /* ---------------- faces, round the footprint ---------------- */
  var U1=14.5, V1=47.3, NV=12.6, SV=35.0, EU=40.9;
  var FW=Face([0,0],[0,1],[-1,0],V1);            /* the Trousdale front, s north to south */
  var FN=Face([0,0],[1,0],[0,-1],U1);            /* north end, toward Traveler */
  var FE1=Face([U1,0],[0,1],[1,0],NV);
  var FN2=Face([U1,NV],[1,0],[0,-1],EU-0.6-U1);
  var FS2=Face([EU,SV],[-1,0],[0,1],EU-U1);
  var FE3=Face([U1,SV],[0,1],[1,0],V1-SV);
  var FS=Face([U1,V1],[-1,0],[0,1],U1);
  var ENT=layout(FW,[['C',1.3],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W1',1.8],
    ['E',6.7],['W1',1.8],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['C',1.3]],true,false);
  layout(FN,[['C',1.3],['B',1.7],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['B',1.7],['C',1.3]],false,true);
  layout(FE1,[['C',1.3],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W1',1.8]],false,false);
  layout(FN2,[['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['C',1.3]],false,true);
  layout(FS2,[['C',1.3],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4]],true,false);
  layout(FE3,[['W1',1.8],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['C',1.3]],false,true);
  layout(FS,[['C',1.3],['W2',3.4],['P',0.9],['W2',3.4],['P',0.9],['W2',3.4],['C',1.3]],false,true);
  /* fill the two inside corners where the wings meet */
  [[FE1,NV,NV-DIN],[FE3,DIN,0]].forEach(function(q){
    fbox(q[0],q[1],q[2],DIN,0.06,0,PL,'S',{}); fbox(q[0],q[1],q[2],DIN,0,PL,ST,'S',{noTop:1});
    fbox(q[0],q[1],q[2],DIN,0,ST,TOP,BRICK,{back:1}); coping(q[0],q[1],q[2]); });
  /* the east end meets Newman Recital Hall and the museum: plain brick */
  (function(){
    var pts=[[EU-0.6,NV],[EU,NV+3.1],[EU,SV]];
    for(var i=0;i<2;i++){
      var a=pts[i], b=pts[i+1], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz);
      var F=Face(a,[dx/L,dz/L],[dz/L,-dx/L],L);
      fbox(F,0,L,DIN,0,0,TOP,BRICK,{back:1}); coping(F,0,L);
    }
  })();
  /* the core behind the skin, with the flat roof on top */
  prism(M,ccw([P(-DIN,-DIN),P(U1+DIN,-DIN),P(U1+DIN,NV-DIN),P(EU-0.6+DIN,NV-DIN),P(EU+DIN,NV+3.1),P(EU+DIN,SV+DIN),
    P(U1+DIN,SV+DIN),P(U1+DIN,V1+DIN),P(-DIN,V1+DIN)]),0,ROOFY,BRICKD,ROOF,0.9);

  /* ---------------- the entrance on the west front ---------------- */
  (function(){
    var F=FW, e0=ENT[0][0], e1=ENT[0][1], ec=(e0+e1)/2;
    /* above the pavilion: flanking piers, three strips of windows with stone spandrels */
    pier(F,e0,e0+1.0,0.42,false,false,5.4);
    pier(F,e1-1.0,e1,0.42,false,false,5.4);
    var m0=e0+1.0, m1=e1-1.0, sw=0.92, gap=(m1-m0-3*sw)/4, strips=[];
    for(var i=0;i<3;i++){ var a=m0+gap+i*(sw+gap); strips.push([a,a+sw]); }
    fbox(F,m0,m1,DIN,0,0,ST,'S',{noSides:1,noTop:1});
    fbox(F,m0,m1,DIN,0,ST,F2A-0.2,BRICK,{noSides:1,noTop:1});
    rowPieces(m0,m1,strips).forEach(function(q){ fbox(F,q[0],q[1],DIN,0,F2A,F3B,BRICK,{noTop:1}); });
    fbox(F,m0,m1,DIN,0,F3B,TOP,BRICK,{noSides:1,bot:1,back:1});
    strips.forEach(function(w){
      panel(F,w[0],w[1],DG,F2A,9.8,R_UW); panel(F,w[0],w[1],DG,F3A,F3B,R_UW);
      fbox(F,w[0],w[1],DIN,-0.07,9.8,F3A,STONE,{bot:1});
      fbox(F,w[0]+0.1,w[1]-0.1,-0.07,-0.04,10.15,11.05,STONED,{bot:1});
      /* stone frames, picked out with brick squares */
      [[w[0]-0.17,w[0]],[w[1],w[1]+0.17]].forEach(function(fr){
        fbox(F,fr[0],fr[1],0,0.07,F2A-0.15,F3B+0.1,STONE,{});
        for(var y=F2A+0.15;y<F3B-0.1;y+=0.42)
          emit(M,[F.W(fr[0]+0.04,0.085,y),F.W(fr[1]-0.04,0.085,y),F.W(fr[1]-0.04,0.085,y+0.09),F.W(fr[0]+0.04,0.085,y+0.09)],F.nw,BRICK,1);
      });
    });
    fbox(F,m0,m1,DIN,0.09,F2A-0.2,F2A,STONE,{bot:1,noSides:1});
    fbox(F,m0,m1,0,0.05,F3B,F3B+0.4,STONE,{bot:1});
    fbox(F,ec-0.6,ec+0.6,0,0.05,14.78,15.9,STONE,{bot:1});
    panel(F,ec-0.53,ec+0.53,0.075,14.85,15.83,R_PL[3]);
    coping(F,m0,m1);

    /* the pavilion: end pier, grille, pier, portal, middle pier, portal, end pier (north to south) */
    var parts=[['p',0.85],['g',1.15],['p',0.8],['d',1.55],['m',1.05],['d',1.55],['p',0.85]], tot=7.8, PW=7.0, k=PW/tot;
    var p0=ec-PW/2, p1=ec+PW/2, PD=1.6, FL=0.6, LT=4.5, CO=5.25, CT=5.55, s=p0;
    parts.forEach(function(q){
      var w=q[1]*k, a=s, b=s+w; s=b;
      if(q[0]==='p'||q[0]==='m'){
        var hp=q[0]==='m'?6.5:6.15, fr=PD+0.15;
        fbox(F,a,b,0,fr,0,hp,STONEL,{});
        fbox(F,a+0.1,b-0.1,0,fr-0.06,hp,hp+0.3,STONEL,{});
        /* flutes on the upper part */
        for(var f=1;f<=3;f++){ var fs=a+w*f/4;
          fbox(F,fs-0.035,fs+0.035,fr,fr+0.035,CO-0.5,hp-0.12,STONE,{bot:1}); }
        if(q[0]==='m'){ fbox(F,a+0.2,b-0.2,fr,fr+0.02,1.9,2.6,0x4E3F2C,{bot:1}); panel(F,a+0.24,b-0.24,fr+0.025,1.94,2.56,R_BZ); }
        cols.push([ccw([F.G(a,0),F.G(b,0),F.G(b,fr),F.G(a,fr)]),hp]);
      } else {
        var dep=q[0]==='g'?0.45:1.0, back=PD-dep;
        fbox(F,a,b,0,back,0,CT,STONEL,{noSides:1});                     /* the back of the opening */
        fbox(F,a,b,back,PD,LT,CT,STONEL,{noSides:1,bot:1});              /* lintel over it */
        fbox(F,a,b,back,PD,0,FL,STONEL,{noSides:1});                     /* floor of the opening */
        if(q[0]==='g') panel(F,a+0.06,b-0.06,back+0.02,FL,LT,R_GR);
        else {
          panel(F,a+(w-1.0)/2,b-(w-1.0)/2,back+0.02,FL,3.55,R_DR);
          fbox(F,a,b,back+0.25,PD-0.09,3.7,LT,0xA39888,{bot:1,noSides:1});
          panel(F,a+0.01,b-0.01,PD-0.06,3.7,LT,R_HD);
          fbox(F,a,a+0.12,back,PD,FL,3.7,STONE,{noTop:1}); fbox(F,b-0.12,b,back,PD,FL,3.7,STONE,{noTop:1});
        }
        cols.push([ccw([F.G(a,0),F.G(b,0),F.G(b,back),F.G(a,back)]),CT]);
      }
    });
    /* cornice over the pavilion between the piers, and its top */
    fbox(F,p0,p1,0,PD+0.06,CO,CT,STONE,{bot:1});
    fbox(F,p0-0.02,p1+0.02,0,PD+0.02,CT,CT+0.08,STONED,{});
    /* landing, steps, cheek walls, pedestals */
    var CW=0.62, SD=[2.25,2.63,3.01,3.39];
    fbox(F,p0,p1,PD,SD[0],0,FL,STONE,{noSides:1});
    for(var st=1;st<4;st++) fbox(F,p0,p1,SD[st-1],SD[st],0,FL-st*0.15,STONE,{noSides:1});
    cols.push([ccw([F.G(p0,0),F.G(p1,0),F.G(p1,SD[0]),F.G(p0,SD[0])]),FL]);
    for(st=1;st<4;st++) cols.push([ccw([F.G(p0,0),F.G(p1,0),F.G(p1,SD[st]),F.G(p0,SD[st])]),FL-st*0.15]);
    [[p0-CW,p0],[p1,p1+CW]].forEach(function(cw,ci){
      fbox(F,cw[0],cw[1],0,3.55,0,0.92,STONE,{});
      fbox(F,cw[0]-0.04,cw[1]+0.04,-0.0,3.59,0.92,1.0,STONEL,{bot:1});
      fbox(F,cw[0]-0.06,cw[1]+0.06,2.85,3.67,1.0,1.28,STONEL,{bot:1});
      cols.push([ccw([F.G(cw[0],0),F.G(cw[1],0),F.G(cw[1],3.6),F.G(cw[0],3.6)]),1.0]);
      cols.push([ccw([F.G(cw[0],2.85),F.G(cw[1],2.85),F.G(cw[1],3.67),F.G(cw[0],3.67)]),2.4]);
      urn(F.G((cw[0]+cw[1])/2,3.26),1.28,ci===0?0xD8508C:0xF2F0EA);
    });
    /* paved apron at the foot of the steps */
    var ap=ccw([F.G(p0-1.6,SD[3]),F.G(p1+1.6,SD[3]),F.G(p1+1.6,5.4),F.G(p0-1.6,5.4)]);
    flat(MG,ap,0.16,PAVE,1);
    HED.push([F,0.6,p0-CW-0.25],[F,p1+CW+0.25,F.L-0.6]);
  })();

  /* a white urn of flowers: a turned profile on a short stem */
  function urn(c,y0,flower){
    var prof=[[0.0,0],[0.24,0],[0.24,0.07],[0.13,0.13],[0.10,0.3],[0.2,0.38],[0.36,0.52],[0.42,0.72],[0.40,0.84],[0.30,0.86]];
    var N=10, i, j;
    for(j=0;j<prof.length-1;j++){
      var a=prof[j], b=prof[j+1];
      for(i=0;i<N;i++){
        var t0=i/N*6.2832, t1=(i+1)/N*6.2832;
        var A=[c[0]+Math.cos(t0)*a[0],y0+a[1],c[1]+Math.sin(t0)*a[0]], B2=[c[0]+Math.cos(t1)*a[0],y0+a[1],c[1]+Math.sin(t1)*a[0]],
            C=[c[0]+Math.cos(t1)*b[0],y0+b[1],c[1]+Math.sin(t1)*b[0]], D=[c[0]+Math.cos(t0)*b[0],y0+b[1],c[1]+Math.sin(t0)*b[0]];
        var mx=Math.cos((t0+t1)/2), mz=Math.sin((t0+t1)/2), up=b[0]<a[0]?1:(b[0]>a[0]?-1:0);
        emit(M,[A,B2,C,D],[mx,up*0.5,mz],URN,1);
      }
    }
    /* flowers heaped in it, leaves round the rim */
    var fr=[[0.46,0.82],[0.5,0.95],[0.42,1.12],[0.26,1.24],[0.0,1.3]];
    for(j=0;j<fr.length-1;j++){ a=fr[j]; b=fr[j+1];
      for(i=0;i<N;i++){
        var w0=i/N*6.2832+0.3*j, w1=(i+1)/N*6.2832+0.3*j, ra=a[0]*(1+0.08*((i+j)%3-1)), rb=b[0]*(1+0.08*((i+j+1)%3-1));
        var A2=[c[0]+Math.cos(w0)*ra,y0+a[1],c[1]+Math.sin(w0)*ra], B3=[c[0]+Math.cos(w1)*ra,y0+a[1],c[1]+Math.sin(w1)*ra],
            C2=[c[0]+Math.cos(w1)*rb,y0+b[1],c[1]+Math.sin(w1)*rb], D2=[c[0]+Math.cos(w0)*rb,y0+b[1],c[1]+Math.sin(w0)*rb];
        emit(M,[A2,B3,C2,D2],[Math.cos((w0+w1)/2),0.7,Math.sin((w0+w1)/2)],j===0?LEAF:flower,j===0?1:(i%2?1:0.9));
      }
    }
  }

  /* ---------------- hedges along the base (face, s from, s to) ---------------- */
  HED.push([FN,1.8,U1-1.2],[FE1,1.6,NV-0.5],[FN2,0.5,FN2.L-1.6],[FS2,1.6,FS2.L-0.5],[FE3,0.5,FE3.L-1.6],[FS,1.6,U1-1.6]);
  function hedges(){
    HED.forEach(function(h){
      var F=h[0], a=h[1], b=h[2]; if(b-a<1) return;
      fbox(F,a,b,0.42,1.32,0,0.92,HEDGE,{noTop:1});
      fbox(F,a+0.06,b-0.06,0.48,1.26,0.92,1.08,HEDGEL,{});
      flat(MG,ccw([F.G(a-0.2,0.0),F.G(b+0.2,0.0),F.G(b+0.2,1.55),F.G(a-0.2,1.55)]),0.04,MULCH,1);
      cols.push([ccw([F.G(a,0.42),F.G(b,0.42),F.G(b,1.32),F.G(a,1.32)]),1.08]);
    });
  }
  hedges();

  /* ---------------- on the roof: penthouse and vent stack ---------------- */
  (function(){
    var r=R(3.5,11.0,5.0,13.5);
    prism(M,r,ROOFY,19.3,BRICK,BRICK,0.85);
    band(M,r,19.3,19.6,0.08,STONE,1,0.8);
    flat(M,offsetRing(r,-0.05),19.62,ROOF,1);
    band(M,r,ROOFY,ROOFY+0.3,0.06,STONE,0.95,0.8);
    var F=Face([3.5,5.0],[1,0],[0,-1],7.5);
    fbox(F,5.5,6.6,0,0.04,ROOFY,ROOFY+2.2,0x4C4640,{});
    var c=P(6.5,33.5), n=8, r1=0.22;
    for(var i=0;i<n;i++){ var t0=i/n*6.2832, t1=(i+1)/n*6.2832;
      emit(M,[[c[0]+Math.cos(t0)*r1,ROOFY,c[1]+Math.sin(t0)*r1],[c[0]+Math.cos(t1)*r1,ROOFY,c[1]+Math.sin(t1)*r1],
              [c[0]+Math.cos(t1)*r1,19.9,c[1]+Math.sin(t1)*r1],[c[0]+Math.cos(t0)*r1,19.9,c[1]+Math.sin(t0)*r1]],
           [Math.cos((t0+t1)/2),0,Math.sin((t0+t1)/2)],METAL,1); }
    /* roof hatches and a skylight box over the east wing */
    prism(M,R(25.0,31.0,20.0,27.5),ROOFY,17.0,0xA9A59C,0x7D8A93,0.8);
    prism(M,R(7.0,9.0,38.0,40.0),ROOFY,16.9,0xA9A59C,0xA9A59C,0.8);
  })();

  /* ---------------- trees on the front lawn ---------------- */
  (function(){
    var keep=HANC.poly([[-24,-3],[0,-3],[0,51],[-24,51]]);
    for(var i=TREE_POS.length-1;i>=0;i--){ var t=TREE_POS[i];
      if(inRing(keep,t[0],t[1])||inRing(HANC.lawn,t[0],t[1])) TREE_POS.splice(i,1); }
    [[-19.0,6.0,'mag',1.55],[-8.5,15.8,'syc',1.25],[-19.5,30.0,'mag',1.6],[-18.5,43.0,'mag',1.5],[-6.8,35.0,'mag',1.2],[-6.8,44.5,'mag',1.15]]
      .forEach(function(q){ var p=P(q[0],q[1]); TREE_POS.push([p[0],p[1],0,q[2],q[3]]); });
  })();

  /* ---------------- colliders and meshes ---------------- */
  cols.push([R(-0.3,U1+0.3,-0.3,V1+0.3),CAP]);
  cols.push([ccw([P(U1,NV-0.3),P(EU-0.6,NV-0.3),P(EU+0.05,NV+3.1),P(EU+0.05,SV+0.3),P(U1,SV+0.3)]),CAP]);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var ms=new T.Mesh(MS.geom(),new T.MeshLambertMaterial({map:stoneTex,vertexColors:true}));
  ms.frustumCulled=false; ms.castShadow=true; ms.receiveShadow=true; scene.add(ms);
  var ma=new T.Mesh(MA.geom(),new T.MeshLambertMaterial({map:atlas,vertexColors:true}));
  ma.frustumCulled=false; ma.receiveShadow=true; scene.add(ma);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__hancock={tris:M.count()+MS.count()+MA.count(),world:M.count(),stone:MS.count(),atlas:MA.count(),ground:MG.count(),cols:cols.length};
})();
