/* ==================================================================
   Physical Education Building (1929), on Watt Way between Annenberg and
   Bovard. a_world.js leaves the footprint empty (HAND_HALLS) and sets
   PEDB (campus grid frame: origin at the north west corner, u grid east,
   v grid south; the block is u 0..60, v 0..75.6, the west front has a bay
   projecting 1.1 m at v 30..45.6 round the entrance at v=VC).

   From photos: red brick over a cast stone plinth, a cast stone string
   course over the ground storey, rectangular windows with stone sills
   and lintels below, tall round arched windows with stone arches above,
   a brick corbel table under a stone cornice, a low parapet, stone
   quoins at the corners. The west front's projecting bay: brick flanks
   with quoins and lanterns, and in the middle a cream cast stone
   frontispiece standing above the parapet. It holds the great arch: a
   deep, rusticated opening under a moulded archivolt with a carved
   keystone; inside it two columns carry an entablature lettered
   PHYSICAL EDUCATION with stone urns over the columns, three glass doors
   below and a great fan window above. Brick lozenges in the stone frieze.
   A landing between cheek blocks (3560 cut in the north one), a broad
   flight down to a platform, and three more steps that wrap along the
   front with chamfered corners, every riser edged in red. Clipped hedges
   and topiary standards along the base, the red brick walk along the
   front (Watt Way), trees between it and the Watt Way walk. The east
   door on Associates Park is a2b_assoc.js's. Flat roof, raised gym.
   Draw calls: one Mesher (matWorld), one ground Mesher, the brick walk
   (repeating texture) and the windows, doors, lettering on one atlas.
   ================================================================== */
(function(){
  var B=null; for(var bi=0;bi<CAMPUS.length;bi++) if(CAMPUS[bi].name==='Physical Education Building') B=CAMPUS[bi];
  if(!B||typeof PEDB==='undefined'||!PEDB) return;
  var P=PEDB.P, DU=PEDB.du, DV=PEDB.dv, U=PEDB.U, V=PEDB.V, VC=PEDB.VC;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var BRICK=0xB4614A, BRICKD=0x934C3A, CAST=0xF2E6CA, CASTL=0xFAF1DD, CASTD=0xDCCDAE, RED=0xB8392A,
      ROOF=0x8E8B84, HEDGE=0x32602B, HEDGEL=0x41733A, MULCH=0x56402F, CONC=0xC9C3B6, TRUNK=0x5A4632,
      GLOBE=0xF4EEDC, IRON=0x26292B, WHITE=0xFFFFFF;
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
  var MA=new TM(), MW=new TM();

  /* darker toward the ground, like the soft shadow at the foot of a wall */
  function shade(hex,y,k){ return rgb(hex,(k===undefined?1:k)*(0.82+0.18*Math.min(1,Math.max(0,y)/3.5))); }
  /* one quad, turned so it faces `want`; tgt is M or MA */
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
  /* a box in a wall frame. o: back, bot, noTop, noSides */
  function fbox(F,s0,s1,d0,d1,y0,y1,hex,o){
    o=o||{};
    var W=F.W, nw=F.nw, tw=F.tw, mt=[-tw[0],0,-tw[2]], mn=[-nw[0],0,-nw[2]];
    emit(M,[W(s0,d1,y0),W(s1,d1,y0),W(s1,d1,y1),W(s0,d1,y1)],nw,hex,1);
    if(!o.noSides){
      emit(M,[W(s0,d0,y0),W(s0,d1,y0),W(s0,d1,y1),W(s0,d0,y1)],mt,hex,0.94);
      emit(M,[W(s1,d0,y0),W(s1,d1,y0),W(s1,d1,y1),W(s1,d0,y1)],tw,hex,0.94);
    }
    if(!o.noTop) emit(M,[W(s0,d0,y1),W(s1,d0,y1),W(s1,d1,y1),W(s0,d1,y1)],[0,1,0],hex,1.06);
    if(o.bot) emit(M,[W(s0,d0,y0),W(s1,d0,y0),W(s1,d1,y0),W(s0,d1,y0)],[0,-1,0],hex,0.78);
    if(o.back) emit(M,[W(s0,d0,y0),W(s1,d0,y0),W(s1,d0,y1),W(s0,d0,y1)],mn,hex,1);
  }
  /* a flat textured panel on the atlas, facing out of the wall at depth d */
  function panel(F,s0,s1,d,y0,y1,rg){
    var W=F.W, u0=rg[0], v0=rg[1], u1=rg[2], v1=rg[3];
    if(F.n[1]*F.t[0]-F.n[0]*F.t[1]<0){ var tmp=u0; u0=u1; u1=tmp; }
    emit(MA,[W(s0,d,y0),W(s1,d,y0),W(s1,d,y1),W(s0,d,y1)],F.nw,WHITE,1,[[u0,v1],[u1,v1],[u1,v0],[u0,v0]]);
  }
  /* a round shaft standing in a wall frame (columns, trunks, stems) */
  function cyl(F,s,d,r0,r1,y0,y1,hex,n){
    n=n||10; var c=F.G(s,d);
    for(var i=0;i<n;i++){
      var t0=i/n*6.2832, t1=(i+1)/n*6.2832, tm=(t0+t1)/2;
      emit(M,[[c[0]+Math.cos(t0)*r0,y0,c[1]+Math.sin(t0)*r0],[c[0]+Math.cos(t1)*r0,y0,c[1]+Math.sin(t1)*r0],
              [c[0]+Math.cos(t1)*r1,y1,c[1]+Math.sin(t1)*r1],[c[0]+Math.cos(t0)*r1,y1,c[1]+Math.sin(t0)*r1]],
           [Math.cos(tm),0,Math.sin(tm)],hex,1);
    }
  }
  /* a lumpy low-poly ball (topiary heads, lantern globes) */
  function ball(c,y,r,hex,lump){
    var NA=9, NB=6, i, j;
    function pt(a,b){ var th=a/NA*6.2832, ph=b/NB*Math.PI, k=1+(lump||0)*(((a*7+b*3)%5)/4-0.5);
      return [c[0]+Math.cos(th)*Math.sin(ph)*r*k, y+Math.cos(ph)*r*k, c[1]+Math.sin(th)*Math.sin(ph)*r*k]; }
    for(i=0;i<NA;i++) for(j=0;j<NB;j++){
      var th=(i+0.5)/NA*6.2832, ph=(j+0.5)/NB*Math.PI;
      emit(M,[pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1)],[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)],hex,
           j<2?1.08:(j>3?0.85:1));
    }
  }

  /* ---------------- the canvas atlas (1024 x 512) ---------------- */
  var AW=1024, AH=512, cv=document.createElement('canvas'); cv.width=AW; cv.height=AH;
  var g=cv.getContext('2d');
  function RG(x,y,w,h){ return [x/AW,1-y/AH,(x+w)/AW,1-(y+h)/AH]; }
  function glass(x,y,w,h){
    var gr=g.createLinearGradient(0,y,0,y+h);
    gr.addColorStop(0,'#8FA4B4'); gr.addColorStop(0.5,'#566978'); gr.addColorStop(1,'#33414C');
    g.fillStyle=gr; g.fillRect(x,y,w,h);
  }
  function panes(x,y,w,h,nc,nr,seed){
    var pw=w/nc, ph=h/nr;
    for(var r=0;r<nr;r++) for(var c=0;c<nc;c++){
      var hs=(r*7+c*13+seed)%6;
      if(hs===0){ g.fillStyle='rgba(175,200,220,0.35)'; g.fillRect(x+c*pw,y+r*ph,pw,ph); }
      if(hs===3){ g.fillStyle='rgba(18,24,30,0.35)'; g.fillRect(x+c*pw,y+r*ph,pw,ph); }
    }
  }
  /* ground storey window: cream wood frame, six over six */
  (function(){
    var x=0,y=0,w=128,h=200;
    glass(x,y,w,h); panes(x+6,y+6,w-12,h-12,3,4,1);
    g.fillStyle='#E8E2D2';
    g.fillRect(x,y,w,7); g.fillRect(x,y+h-7,w,7); g.fillRect(x,y,7,h); g.fillRect(x+w-7,y,7,h);
    g.fillRect(x,y+h/2-4,w,8);
    for(var c=1;c<3;c++) g.fillRect(x+6+c*(w-12)/3-2,y,4,h);
    for(var r=1;r<4;r++) if(r!==2) g.fillRect(x,y+6+r*(h-12)/4-2,w,3);
    g.fillStyle='rgba(0,0,0,0.2)'; g.fillRect(x+7,y+7,w-14,4);
  })();
  var R_GW=RG(1,1,126,198);
  /* upper storey window: tall, round headed; the corners outside the arch are hidden by the wall */
  (function(){
    var x=128,y=0,w=128,h=286,r=64,cx=x+64,cy=y+64;
    glass(x,y,w,h); panes(x+6,y+70,w-12,h-76,2,5,3);
    g.strokeStyle='#E8E2D2'; g.lineWidth=7;
    g.beginPath(); g.arc(cx,cy,r-4,Math.PI,0); g.stroke();
    g.fillStyle='#E8E2D2';
    g.fillRect(x,cy,7,h-64); g.fillRect(x+w-7,cy,7,h-64); g.fillRect(x,y+h-7,w,7);
    g.fillRect(x,cy-3,w,7);                                 /* transom at the spring */
    g.fillRect(cx-3,y,6,h);                                 /* mullion */
    for(var k=1;k<5;k++) g.fillRect(x,cy+k*(h-64)/5-1,w,3);
    g.lineWidth=3; g.beginPath(); g.arc(cx,cy,26,Math.PI,0); g.stroke();
    for(k=1;k<4;k++){ var a=Math.PI+k*Math.PI/4; g.beginPath(); g.moveTo(cx+Math.cos(a)*26,cy+Math.sin(a)*26);
      g.lineTo(cx+Math.cos(a)*(r-4),cy+Math.sin(a)*(r-4)); g.stroke(); }
  })();
  var R_UW=RG(129,1,126,284);
  /* the great fan window over the entrance: 7.6 m wide, 0.9 m straight then a 3.8 m half circle */
  (function(){
    var x=256,y=0,w=256,h=160,r=128,cx=x+128,cy=y+h-30;
    glass(x,y,w,h);
    g.fillStyle='rgba(20,26,32,0.25)'; g.fillRect(x,y+h-30,w,30);
    panes(x+8,y,w-16,h,8,5,5);
    g.strokeStyle='#E1D7C2'; g.fillStyle='#E1D7C2';
    g.lineWidth=8; g.beginPath(); g.arc(cx,cy,r-5,Math.PI,0); g.stroke();
    g.lineWidth=5; g.beginPath(); g.arc(cx,cy,r*0.42,Math.PI,0); g.stroke();
    g.beginPath(); g.arc(cx,cy,r*0.75,Math.PI,0); g.stroke();
    for(var k=1;k<8;k++){ var a=Math.PI+k*Math.PI/8;
      g.lineWidth=k%2?3:5; g.beginPath(); g.moveTo(cx+Math.cos(a)*r*0.42,cy+Math.sin(a)*r*0.42);
      g.lineTo(cx+Math.cos(a)*(r-5),cy+Math.sin(a)*(r-5)); g.stroke(); }
    g.fillRect(x,cy-4,w,8);
    [0.25,0.5,0.75].forEach(function(f){ g.fillRect(x+w*f-4,cy,8,30); });
    g.fillRect(x,y+h-6,w,6);
  })();
  var R_BIG=RG(257,1,254,158);
  /* glass doors under a leaded transom, dark bronze frames */
  (function(){
    var x=512,y=0,w=128,h=256;
    g.fillStyle='#8C6A5A'; g.fillRect(x,y,w,h);
    /* transom: leaded glass */
    glass(x+8,y+8,w-16,70);
    g.strokeStyle='rgba(225,210,170,0.8)'; g.lineWidth=2;
    for(var i=0;i<6;i++){ g.beginPath(); g.moveTo(x+8+i*20,y+8); g.lineTo(x+8+i*20+30,y+78); g.stroke();
      g.beginPath(); g.moveTo(x+w-8-i*20,y+8); g.lineTo(x+w-38-i*20,y+78); g.stroke(); }
    g.fillStyle='#C9A86A'; g.beginPath(); g.arc(x+w/2,y+43,13,0,6.2832); g.fill();
    g.fillStyle='#8C6A5A'; g.fillRect(x,y+80,w,8);
    /* the pair of doors */
    glass(x+10,y+92,w/2-14,h-100); glass(x+w/2+4,y+92,w/2-14,h-100);
    panes(x+10,y+92,w-20,h-100,2,3,2);
    g.fillStyle='#8C6A5A'; g.fillRect(x+w/2-4,y+88,8,h-88);
    g.fillRect(x+10,y+175,w-20,6);
    g.fillStyle='#C9A86A'; g.fillRect(x+w/2-14,y+178,6,26); g.fillRect(x+w/2+8,y+178,6,26);
  })();
  var R_DR=RG(513,1,126,254);
  /* lettering on the entablature */
  (function(){
    var x=0,y=400,w=1024,h=56;
    g.fillStyle='#E3D6B8'; g.fillRect(x,y,w,h);
    g.font='bold 40px Georgia, "Times New Roman", serif'; g.textAlign='center'; g.textBaseline='middle';
    var txt='P H Y S I C A L    E D U C A T I O N';
    g.fillStyle='rgba(255,250,235,0.9)'; g.fillText(txt,x+w/2+1.5,y+h/2+2);
    g.fillStyle='#6E6250'; g.fillText(txt,x+w/2,y+h/2);
  })();
  var R_TX=RG(0,401,1024,54);
  /* the street number on the north cheek block */
  (function(){
    var x=640,y=0,w=128,h=64;
    g.fillStyle='#D9CCAE'; g.fillRect(x,y,w,h);
    g.font='bold 36px Georgia, serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle='rgba(255,250,235,0.85)'; g.fillText('3560',x+w/2+1.5,y+h/2+2);
    g.fillStyle='#6A5E4C'; g.fillText('3560',x+w/2,y+h/2);
  })();
  var R_NO=RG(641,1,126,62);
  var atlas=new T.CanvasTexture(cv);
  atlas.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

  /* the red brick walk: running bond, laid along the walk */
  var cw=document.createElement('canvas'); cw.width=cw.height=256;
  (function(){
    var c=cw.getContext('2d'), bw=64, bh=21.33;
    c.fillStyle='#B9A08F'; c.fillRect(0,0,256,256);
    for(var r=0;r<12;r++) for(var k=-1;k<5;k++){
      var x=k*bw+((r%2)?bw/2:0), y=r*bh, h=((r*5+k*3)%7);
      c.fillStyle='rgb('+(150+h*5)+','+(70+h*3)+','+(56+h*2)+')';
      c.fillRect(x+1.5,y+1.5,bw-3,bh-3);
    }
    for(var i=0;i<600;i++){ c.fillStyle='rgba(60,25,15,0.12)'; c.fillRect((i*97)%256,(i*61)%256,2,2); }
  })();
  var walkTex=new T.CanvasTexture(cw); walkTex.wrapS=walkTex.wrapT=T.RepeatWrapping;
  walkTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

  /* ---------------- heights ---------------- */
  var DIN=-0.3, DG=-0.22,
      PL0=1.2, PLC=1.35, GW0=2.0, GW1=4.3, LIN=4.62, SC0=5.4, SC1=5.75,
      UW0=6.3, SP=9.6, AR=0.95, AZ=SP+AR+0.5, CT0=12.5, CT1=12.85, CN1=13.3, PAR=14.45, COP=14.65, ROOFY=13.9;

  function rowPieces(s0,s1,wins){ var out=[], a=s0;
    wins.forEach(function(w){ if(w[0]>a+0.001) out.push([a,w[0]]); a=w[1]; });
    if(s1>a+0.001) out.push([a,s1]); return out; }
  /* window centres spread evenly between a and b at about `pitch` */
  function spread(a,b,pitch){ var n=Math.max(1,Math.floor((b-a)/pitch)+1), out=[];
    if(n===1) return [(a+b)/2];
    var p=(b-a)/(n-1); for(var i=0;i<n;i++) out.push(a+i*p); return out; }

  /* a round arch in a wall: spandrel strips, the soffit, the stone ring */
  function archHead(F,c,r,sp,top,din,dr,face,soff,ring,key){
    var N=9, W=F.W, i;
    var X=function(k,rr){ var th=Math.PI*(1-k/N); return [c+rr*Math.cos(th), sp+rr*Math.sin(th)]; };
    for(i=0;i<N;i++){
      var a=X(i,r), b=X(i+1,r), m=X(i+0.5,r);
      emit(M,[W(a[0],face,a[1]),W(b[0],face,b[1]),W(b[0],face,top),W(a[0],face,top)],F.nw,ring.wall,1);
      var ds=c-m[0], dy=sp-m[1], l=Math.hypot(ds,dy)||1;
      emit(M,[W(a[0],din,a[1]),W(b[0],din,b[1]),W(b[0],face,b[1]),W(a[0],face,a[1])],
           [F.tw[0]*ds/l,dy/l,F.tw[2]*ds/l],soff,0.92);
    }
    /* the ring of voussoirs, standing proud by dr; the middle one is the keystone */
    for(i=0;i<N;i++){
      var ro=r+ring.w+(i===(N-1)/2&&key?key:0);
      var a1=X(i,r), b1=X(i+1,r), a2=X(i,ro), b2=X(i+1,ro), mm=X(i+0.5,1);
      var col=i===(N-1)/2?ring.key:(i%2?ring.c1:ring.c2);
      emit(M,[W(a1[0],face+dr,a1[1]),W(b1[0],face+dr,b1[1]),W(b2[0],face+dr,b2[1]),W(a2[0],face+dr,a2[1])],F.nw,col,1);
      var os=mm[0]-c, oy=mm[1]-sp;
      emit(M,[W(a2[0],face,a2[1]),W(b2[0],face,b2[1]),W(b2[0],face+dr,b2[1]),W(a2[0],face+dr,a2[1])],
           [F.tw[0]*os,oy,F.tw[2]*os],col,0.95);
      emit(M,[W(a1[0],face,a1[1]),W(b1[0],face,b1[1]),W(b1[0],face+dr,b1[1]),W(a1[0],face+dr,a1[1])],
           [-F.tw[0]*os,-oy,-F.tw[2]*os],col,0.9);
      if(ro>r+ring.w){   /* sides of the taller keystone */
        emit(M,[W(a2[0],face,a2[1]),W(X(i,r+ring.w)[0],face,X(i,r+ring.w)[1]),W(X(i,r+ring.w)[0],face+dr,X(i,r+ring.w)[1]),W(a2[0],face+dr,a2[1])],
             [-F.tw[0],0,-F.tw[2]],col,0.9);
        emit(M,[W(b2[0],face,b2[1]),W(X(i+1,r+ring.w)[0],face,X(i+1,r+ring.w)[1]),W(X(i+1,r+ring.w)[0],face+dr,X(i+1,r+ring.w)[1]),W(b2[0],face+dr,b2[1])],
             F.tw,col,0.9);
      }
    }
  }

  /* quoins: alternate long and short stone blocks up a corner. at: 0 the s0 end, 1 the s1 end */
  function quoins(F,s,at,wrap,y0,y1,par){
    var h=0.5, n=Math.floor((y1-y0)/h), pj=0.045;
    for(var k=0;k<n;k++){
      var len=((k+par)%2)?0.95:0.55, ya=y0+k*h+0.02, yb=y0+(k+1)*h-0.02;
      if(at===0) fbox(F,s-(wrap?pj:0),s+len,0,pj,ya,yb,CAST,{bot:1});
      else fbox(F,s-len,s+(wrap?pj:0),0,pj,ya,yb,CAST,{bot:1});
    }
  }

  /* ---------------- a run of wall: bands, ground windows, arched windows ----------------
     o: din (inner depth), gw (half width of the ground windows), ar (arch radius), e0/e1 (outside
     corners at the ends: bands and quoins wrap), q0/q1 (quoins), ret0/ret1 (show the end of the wall) */
  function run(F,s0,s1,cs,o){
    o=o||{};
    var din=o.din===undefined?DIN:o.din, gw=o.gw||0.75, ar=o.ar||AR, az=SP+ar+0.5;
    var gws=cs.map(function(c){ return [c-gw,c+gw]; }), uws=cs.map(function(c){ return [c-ar,c+ar]; });
    function ends(y0,y1){   /* the exposed end of a wall (a return of the bay) */
      if(o.ret0) emit(M,[F.W(s0,din,y0),F.W(s0,0,y0),F.W(s0,0,y1),F.W(s0,din,y1)],[-F.tw[0],0,-F.tw[2]],BRICK,0.94);
      if(o.ret1) emit(M,[F.W(s1,din,y0),F.W(s1,0,y0),F.W(s1,0,y1),F.W(s1,din,y1)],F.tw,BRICK,0.94);
    }
    function hb(y0,y1,pj,hex,ex){
      var a=s0-((o.e0||o.ret0)?pj:0), b=s1+((o.e1||o.ret1)?pj:0);
      fbox(F,a,b,ex&&ex.d0!==undefined?ex.d0:din,pj,y0,y1,hex,ex||{bot:1});
    }
    /* plinth, cap, string course, cornice, coping */
    hb(0,PL0,0.12,CASTD,{});
    hb(PL0,PLC,0.16,CAST,{bot:1});
    hb(SC0,SC1,0.1,CAST,{bot:1});
    hb(CT1,CN1,0.32,CAST,{bot:1});
    hb(PAR,COP,0.08,CAST,{bot:1,back:1,d0:din-0.08});
    /* brick below the ground windows, the piers between them, over them */
    fbox(F,s0,s1,din,0,PLC,GW0,BRICK,{noSides:1,noTop:1}); ends(PLC,GW0);
    rowPieces(s0,s1,gws).forEach(function(q){ fbox(F,q[0],q[1],din,0,GW0,GW1,BRICK,{noTop:1,noSides:1});
      if(q[0]>s0+0.001) emit(M,[F.W(q[0],din,GW0),F.W(q[0],0,GW0),F.W(q[0],0,GW1),F.W(q[0],din,GW1)],[-F.tw[0],0,-F.tw[2]],CASTD,0.9);
      if(q[1]<s1-0.001) emit(M,[F.W(q[1],din,GW0),F.W(q[1],0,GW0),F.W(q[1],0,GW1),F.W(q[1],din,GW1)],F.tw,CASTD,0.9); });
    ends(GW0,GW1);
    fbox(F,s0,s1,din,0,GW1,SC0,BRICK,{noSides:1,noTop:1,bot:1}); ends(GW1,SC0);
    gws.forEach(function(w){
      panel(F,w[0],w[1],DG,GW0,GW1,R_GW);
      fbox(F,w[0]-0.12,w[1]+0.12,din,0.1,GW0-0.12,GW0,CAST,{bot:1});
      fbox(F,w[0]-0.18,w[1]+0.18,0,0.06,GW1,LIN,CAST,{bot:1});
      fbox(F,(w[0]+w[1])/2-0.16,(w[0]+w[1])/2+0.16,0,0.09,GW1-0.06,LIN+0.06,CASTL,{bot:1});
    });
    /* upper storey: brick to the sills, piers between the arched windows, the arch heads */
    fbox(F,s0,s1,din,0,SC1,UW0,BRICK,{noSides:1,noTop:1}); ends(SC1,UW0);
    rowPieces(s0,s1,uws).forEach(function(q){ fbox(F,q[0],q[1],din,0,UW0,az,BRICK,{noTop:1,noSides:1}); });
    ends(UW0,az);
    uws.forEach(function(w){
      var c=(w[0]+w[1])/2;
      emit(M,[F.W(w[0],din,UW0),F.W(w[0],0,UW0),F.W(w[0],0,SP),F.W(w[0],din,SP)],F.tw,CASTD,0.9);
      emit(M,[F.W(w[1],din,UW0),F.W(w[1],0,UW0),F.W(w[1],0,SP),F.W(w[1],din,SP)],[-F.tw[0],0,-F.tw[2]],CASTD,0.9);
      panel(F,w[0],w[1],DG,UW0,SP+ar,R_UW);
      fbox(F,w[0]-0.14,w[1]+0.14,din,0.12,UW0-0.14,UW0,CAST,{bot:1});
      archHead(F,c,ar,SP,az,din,0.05,0,CASTD,{wall:BRICK,w:0.3,c1:CAST,c2:CASTL,key:CASTL},0.14);
    });
    fbox(F,s0,s1,din,0,az,CT1,BRICK,{noSides:1,noTop:1}); ends(az,CT1);
    /* corbel table under the cornice */
    for(var cs2=s0+0.45;cs2<s1-0.3;cs2+=0.75) fbox(F,cs2-0.13,cs2+0.13,0,0.13,CT0,CT1,BRICKD,{bot:1,noTop:1});
    /* parapet */
    fbox(F,s0,s1,din,0,CN1,PAR,BRICK,{noSides:1,noTop:1,back:1}); ends(CN1,PAR);
    if(o.q0) quoins(F,s0,0,o.e0||o.ret0,PLC,SC0,0), quoins(F,s0,0,o.e0||o.ret0,SC1,CT0,1);
    if(o.q1) quoins(F,s1,1,o.e1||o.ret1,PLC,SC0,1), quoins(F,s1,1,o.e1||o.ret1,SC1,CT0,0);
  }

  /* ---------------- the four fronts ---------------- */
  var FW=Face([0,0],[0,1],[-1,0],V);      /* Watt Way front, s north to south */
  var FN=Face([U,0],[-1,0],[0,-1],U);     /* north, s east to west */
  var FE=Face([U,V],[0,-1],[1,0],V);      /* Associates Park, s south to north */
  var FS=Face([0,V],[1,0],[0,1],U);       /* Childs Way, s west to east */
  var PIT=3.9;
  run(FW,0,30,spread(2.4,27.6,PIT),{e0:1,q0:1});
  run(FW,45.6,V,spread(48.0,V-2.4,PIT),{e1:1,q1:1});
  run(FN,0,U,spread(2.4,U-2.4,PIT),{e0:1,e1:1,q0:1,q1:1});
  run(FS,0,U,spread(2.4,U-2.4,PIT),{e0:1,e1:1,q0:1,q1:1});
  /* the east front: the door pavilion (a2b_assoc.js) covers s 29.3..46.9 */
  run(FE,0,29.3,spread(2.4,26.6,PIT),{e0:1,q0:1});
  run(FE,29.3,46.9,[],{});
  run(FE,46.9,V,spread(49.6,V-2.4,PIT),{e1:1,q1:1});
  /* the core behind the skin, with the flat roof on top */
  prism(M,ccw([P(-DIN,-DIN),P(U+DIN,-DIN),P(U+DIN,V+DIN),P(-DIN,V+DIN)]),0,ROOFY,BRICKD,ROOF,0.9);

  /* ---------------- the entrance bay on the west front ----------------
     FB: the bay's face (u -1.1), s from its north end (v 30) south, d out from it */
  var FB=Face([-1.1,30],[0,1],[-1,0],15.6), BL=15.6, BIN=-1.4;
  run(FB,0,2.2,[1.35],{din:BIN,gw:0.32,ar:0.36,ret0:1,q0:1});
  run(FB,BL-2.2,BL,[BL-1.35],{din:BIN,gw:0.32,ar:0.36,ret1:1,q1:1});

  /* the frontispiece: s 2.2..13.4 of the bay, front 0.5 out, the great arch in it */
  var S0=2.2, S1=BL-2.2, DF=0.5, DR=-0.9, AC=BL/2, GR=3.8, OA=AC-GR, OB=AC+GR, FL=1.45,
      SPG=7.4, ATOP=SPG+GR+0.9, FR0=ATOP, FR1=13.9, FC1=14.35, FP1=15.35, FCP=15.55;
  /* base under the landing and the floor of the arch */
  fbox(FB,S0,S1,BIN,DF,0,FL,CAST,{noSides:1});
  /* jambs, rusticated, with impost blocks */
  [[S0,OA],[OB,S1]].forEach(function(j,ji){
    fbox(FB,j[0],j[1],BIN,DF,FL,SPG,CAST,{noTop:1});
    for(var y=FL+0.45;y<SPG-0.4;y+=0.45)
      emit(M,[FB.W(j[0],DF+0.005,y),FB.W(j[1],DF+0.005,y),FB.W(j[1],DF+0.005,y+0.05),FB.W(j[0],DF+0.005,y+0.05)],FB.nw,CASTD,1);
    fbox(FB,ji===0?j[0]-0.06:j[0],ji===0?j[1]:j[1]+0.06,DR,DF+0.1,SPG-0.35,SPG,CASTL,{bot:1});
  });
  /* the arch: spandrels, deep soffit, a double archivolt, the keystone with a carved head */
  archHead(FB,AC,GR,SPG,ATOP,DR,0.09,DF,CASTD,{wall:CAST,w:0.38,c1:CASTL,c2:CASTL,key:CASTL},0.55);
  (function(){
    var N=24, W=FB.W, r0=GR+0.38, r1=GR+0.62, dz=DF+0.05;
    for(var i=0;i<N;i++){
      var t0=Math.PI*(1-i/N), t1=Math.PI*(1-(i+1)/N);
      var a0=[AC+r0*Math.cos(t0),SPG+r0*Math.sin(t0)], b0=[AC+r0*Math.cos(t1),SPG+r0*Math.sin(t1)],
          a1=[AC+r1*Math.cos(t0),SPG+r1*Math.sin(t0)], b1=[AC+r1*Math.cos(t1),SPG+r1*Math.sin(t1)];
      if(i===N/2-1||i===N/2) continue;   /* the keystone breaks the outer moulding */
      emit(M,[W(a0[0],dz,a0[1]),W(b0[0],dz,b0[1]),W(b1[0],dz,b1[1]),W(a1[0],dz,a1[1])],FB.nw,CAST,1);
      var tm=(t0+t1)/2;
      emit(M,[W(a1[0],DF,a1[1]),W(b1[0],DF,b1[1]),W(b1[0],dz,b1[1]),W(a1[0],dz,a1[1])],[FB.tw[0]*Math.cos(tm),Math.sin(tm),FB.tw[2]*Math.cos(tm)],CAST,0.95);
    }
    /* the head on the keystone */
    var ky=SPG+GR+0.3;
    fbox(FB,AC-0.2,AC+0.2,DF+0.09,DF+0.3,ky-0.25,ky+0.25,CASTL,{bot:1});
    fbox(FB,AC-0.14,AC+0.14,DF+0.3,DF+0.38,ky-0.14,ky+0.14,CAST,{bot:1});
    fbox(FB,AC-0.24,AC+0.24,DF+0.09,DF+0.22,ky+0.25,ky+0.38,CASTD,{bot:1});
  })();
  /* lanterns on the jambs: iron bracket, white globe */
  [S0+0.9,S1-0.9].forEach(function(s){
    fbox(FB,s-0.05,s+0.05,DF,DF+0.48,4.55,4.64,IRON,{bot:1});
    fbox(FB,s-0.1,s+0.1,DF,DF+0.05,4.3,4.8,IRON,{});
    ball(FB.G(s,DF+0.48),4.3,0.22,GLOBE,0);
  });
  /* side pieces of the arch zone, then the frieze, cornice, parapet */
  fbox(FB,S0,OA,BIN,DF,SPG,ATOP,CAST,{noTop:1,noSides:1}); fbox(FB,OB,S1,BIN,DF,SPG,ATOP,CAST,{noTop:1,noSides:1});
  emit(M,[FB.W(S0,0,SPG),FB.W(S0,DF,SPG),FB.W(S0,DF,FR1),FB.W(S0,0,FR1)],[-FB.tw[0],0,-FB.tw[2]],CAST,0.94);
  emit(M,[FB.W(S1,0,SPG),FB.W(S1,DF,SPG),FB.W(S1,DF,FR1),FB.W(S1,0,FR1)],FB.tw,CAST,0.94);
  fbox(FB,S0,S1,BIN,DF,FR0,FR1,CAST,{noSides:1,noTop:1});
  /* brick lozenges in the frieze */
  for(var lz=S0+0.75;lz<S1-0.5;lz+=0.92){
    var ly=(FR0+FR1)/2+0.05;
    emit(M,[FB.W(lz,DF+0.01,ly-0.32),FB.W(lz+0.28,DF+0.01,ly),FB.W(lz,DF+0.01,ly+0.32),FB.W(lz-0.28,DF+0.01,ly)],FB.nw,BRICK,1);
  }
  fbox(FB,S0,S1,0,DF+0.05,FR1-0.22,FR1,CASTL,{bot:1});
  fbox(FB,S0-0.25,S1+0.25,BIN,DF+0.3,FR1,FC1,CAST,{bot:1});
  fbox(FB,S0,S1,BIN,DF,FC1,FP1,CAST,{back:1,noTop:1});
  for(lz=S0+0.9;lz<S1-0.6;lz+=1.12)
    emit(M,[FB.W(lz,DF+0.01,FC1+0.2),FB.W(lz+0.3,DF+0.01,(FC1+FP1)/2),FB.W(lz,DF+0.01,FP1-0.2),FB.W(lz-0.3,DF+0.01,(FC1+FP1)/2)],FB.nw,BRICK,1);
  fbox(FB,S0-0.06,S1+0.06,BIN-0.06,DF+0.08,FP1,FCP,CASTL,{bot:1,back:1});
  /* the crest over the middle, with a carved cartouche */
  fbox(FB,AC-1.6,AC+1.6,BIN+0.3,DF,FCP,16.35,CAST,{back:1});
  fbox(FB,AC-1.7,AC+1.7,BIN+0.24,DF+0.08,16.35,16.5,CASTL,{bot:1,back:1});
  fbox(FB,AC-0.45,AC+0.45,DF,DF+0.12,FCP+0.1,16.2,CASTL,{bot:1});
  fbox(FB,AC-0.3,AC+0.3,DF+0.12,DF+0.18,FCP+0.25,16.0,CASTD,{bot:1});

  /* inside the arch: the back wall, three doors, two columns, the entablature, urns, the fan window */
  fbox(FB,OA,OB,BIN,DR,FL,SPG+GR,CASTD,{noSides:1,noTop:1});
  var DOORS=[[OA+0.15,OA+GR*2/3-0.35],[AC-GR/3+0.35,AC+GR/3-0.35],[OB-GR*2/3+0.35,OB-0.15]];
  var EN0=5.45, EN1=6.5, CR=0.27, CD=DR+0.45;
  DOORS.forEach(function(d){
    panel(FB,d[0],d[1],DR+0.015,FL,EN0-0.05,R_DR);
    /* a bronze frame round the opening: jambs and head, the glass left clear */
    fbox(FB,d[0]-0.12,d[0],DR,DR+0.12,FL,EN0-0.05,0x8C6A5A,{noTop:1});
    fbox(FB,d[1],d[1]+0.12,DR,DR+0.12,FL,EN0-0.05,0x8C6A5A,{noTop:1});
    fbox(FB,d[0],d[1],DR,DR+0.12,EN0-0.17,EN0-0.05,0x8C6A5A,{bot:1});
  });
  /* pilaster strips at the jambs, behind the columns */
  fbox(FB,OA,OA+0.32,DR,DR+0.18,FL,EN0,CASTL,{}); fbox(FB,OB-0.32,OB,DR,DR+0.18,FL,EN0,CASTL,{});
  [AC-GR/3,AC+GR/3].forEach(function(s){
    fbox(FB,s-0.38,s+0.38,CD-0.38,CD+0.38,FL,FL+0.32,CASTL,{});           /* base */
    cyl(FB,s,CD,CR*1.12,CR,FL+0.32,FL+0.55,CAST,12);
    cyl(FB,s,CD,CR,CR*0.86,FL+0.55,EN0-0.45,CASTL,12);                     /* shaft, tapering */
    cyl(FB,s,CD,CR*0.86,CR*1.25,EN0-0.45,EN0-0.2,CAST,12);                 /* capital */
    fbox(FB,s-0.4,s+0.4,CD-0.4,CD+0.4,EN0-0.2,EN0,CASTL,{bot:1});          /* abacus */
    cols.push([ccw([FB.G(s-0.4,CD-0.4),FB.G(s+0.4,CD-0.4),FB.G(s+0.4,CD+0.4),FB.G(s-0.4,CD+0.4)]),EN0]);
  });
  /* entablature across the opening: architrave, the lettered frieze, cornice */
  fbox(FB,OA,OB,DR,CD+0.38,EN0,EN0+0.25,CAST,{bot:1,noSides:1});
  fbox(FB,OA,OB,DR,CD+0.36,EN0+0.25,EN1-0.22,CASTL,{noSides:1,noTop:1});
  panel(FB,OA+0.35,OB-0.35,CD+0.365,EN0+0.29,EN1-0.26,R_TX);
  fbox(FB,OA,OB,DR,CD+0.5,EN1-0.22,EN1,CAST,{bot:1,noSides:1});
  /* the fan window above, set into the back wall */
  panel(FB,OA,OB,DR+0.01,EN1,SPG+GR,R_BIG);
  /* stone urns over the columns */
  function urn(c,y0,k){
    var prof=[[0.0,0],[0.3,0],[0.3,0.1],[0.16,0.16],[0.12,0.34],[0.26,0.44],[0.42,0.6],[0.46,0.8],[0.4,0.95],[0.3,1.0],
              [0.34,1.06],[0.22,1.12],[0.12,1.28],[0.06,1.42],[0.0,1.46]];
    var N=12, i, j;
    for(j=0;j<prof.length-1;j++){
      var a=prof[j], b=prof[j+1];
      for(i=0;i<N;i++){
        var t0=i/N*6.2832, t1=(i+1)/N*6.2832;
        var A=[c[0]+Math.cos(t0)*a[0]*k,y0+a[1]*k,c[1]+Math.sin(t0)*a[0]*k], B2=[c[0]+Math.cos(t1)*a[0]*k,y0+a[1]*k,c[1]+Math.sin(t1)*a[0]*k],
            C=[c[0]+Math.cos(t1)*b[0]*k,y0+b[1]*k,c[1]+Math.sin(t1)*b[0]*k], D=[c[0]+Math.cos(t0)*b[0]*k,y0+b[1]*k,c[1]+Math.sin(t0)*b[0]*k];
        var up=b[0]<a[0]?1:(b[0]>a[0]?-1:0);
        emit(M,[A,B2,C,D],[Math.cos((t0+t1)/2),up*0.6,Math.sin((t0+t1)/2)],CASTL,j%3===2?0.92:1);
      }
    }
  }
  [AC-GR/3,AC+GR/3].forEach(function(s){
    fbox(FB,s-0.32,s+0.32,CD-0.32,CD+0.32,EN1,EN1+0.22,CAST,{});
    urn(FB.G(s,CD),EN1+0.22,1.05);
  });

  /* ---------------- landing, cheek blocks, steps ---------------- */
  var LD=1.9, NST=5, RS=(FL-0.64)/NST, TR=0.38, CK=[[-1.0,0],[BL,BL+1.0]], CKD=LD+NST*TR+0.15;
  fbox(FB,0,BL,-0.2,LD,0,FL,CAST,{noSides:1});
  emit(M,[FB.W(0,LD+0.008,FL-0.09),FB.W(BL,LD+0.008,FL-0.09),FB.W(BL,LD+0.008,FL),FB.W(0,LD+0.008,FL)],FB.nw,RED,1);
  cols.push([ccw([FB.G(0,-0.2),FB.G(BL,-0.2),FB.G(BL,LD),FB.G(0,LD)]),FL]);
  for(var k=1;k<=NST;k++){
    var sf=LD+k*TR, top=FL-k*RS;
    fbox(FB,0,BL,LD-0.05,sf,0,top,CAST,{noSides:1});
    emit(M,[FB.W(0,sf+0.008,top-0.09),FB.W(BL,sf+0.008,top-0.09),FB.W(BL,sf+0.008,top),FB.W(0,sf+0.008,top)],FB.nw,RED,1);
    cols.push([ccw([FB.G(0,LD),FB.G(BL,LD),FB.G(BL,sf),FB.G(0,sf)]),top]);
  }
  /* the platform and three steps below it, chamfered, wrapping along the front */
  var PS0=-6.0, PS1=BL+6.0, PD=LD+NST*TR+0.6, CH=1.4;
  for(var lv=3;lv>=0;lv--){
    var o=lv*TR, ch=CH+o*0.414, tp=0.64-lv*0.16;
    var ring=ccw([FB.G(PS0-o,-1.25),FB.G(PS1+o,-1.25),FB.G(PS1+o,PD+o-ch),FB.G(PS1+o-ch,PD+o),FB.G(PS0-o+ch,PD+o),FB.G(PS0-o,PD+o-ch)]);
    prism(M,ring,0,tp,CAST,CASTL,0.92);
    band(M,ring,tp-0.09,tp,0.012,RED,1.05,1,true);
    cols.push([ring,tp]);
  }
  /* cheek blocks either side of the flight; 3560 on the north one */
  CK.forEach(function(c,ci){
    fbox(FB,c[0],c[1],-0.2,CKD,0,FL+0.75,CAST,{});
    fbox(FB,c[0]-0.06,c[1]+0.06,-0.2,CKD+0.06,FL+0.75,FL+0.88,CASTL,{bot:1});
    fbox(FB,c[0]-0.1,c[1]+0.1,CKD-1.2,CKD+0.1,0,0.5,CASTD,{});
    if(ci===0) panel(FB,c[0]+0.12,c[1]-0.12,CKD+0.006,FL+0.05,FL+0.55,R_NO);
    cols.push([ccw([FB.G(c[0],-0.2),FB.G(c[1],-0.2),FB.G(c[1],CKD+0.1),FB.G(c[0],CKD+0.1)]),FL+0.88]);
  });
  /* concrete apron from the steps to the brick walk */
  var WK=PEDB.WK;
  flat(MG,PEDB.poly([[WK[1]-0.05,22.0],[-4.5,22.0],[-4.5,53.6],[WK[1]-0.05,53.6]]),0.07,CONC,1);
  /* the red brick walk along the front */
  (function(){
    var v0=-8.6, v1=86.2, us=[WK[0],WK[1]], y=0.075, KS=1/1.2;
    var q=[P(us[0],v0),P(us[1],v0),P(us[1],v1),P(us[0],v1)].map(function(p){ return [p[0],y,p[1]]; });
    var t=[[us[0]*KS,v0*KS],[us[1]*KS,v0*KS],[us[1]*KS,v1*KS],[us[0]*KS,v1*KS]].map(function(a){ return [a[1],a[0]]; });
    emit(MW,q,[0,1,0],WHITE,1,t);
    /* soldier course edges */
    [us[0]-0.18,us[1]].forEach(function(u0){
      flat(MG,ccw([P(u0,v0),P(u0+0.18,v0),P(u0+0.18,v1),P(u0,v1)]),0.08,0x8E4A38,1); });
  })();

  /* ---------------- hedges and topiary ---------------- */
  function hedge(F,a,b){
    if(b-a<1) return;
    fbox(F,a,b,0.42,1.32,0,0.92,HEDGE,{noTop:1});
    fbox(F,a+0.06,b-0.06,0.48,1.26,0.92,1.08,HEDGEL,{});
    flat(MG,ccw([F.G(a-0.2,0.0),F.G(b+0.2,0.0),F.G(b+0.2,1.55),F.G(a-0.2,1.55)]),0.04,MULCH,1);
    cols.push([ccw([F.G(a,0.42),F.G(b,0.42),F.G(b,1.32),F.G(a,1.32)]),1.08]);
  }
  hedge(FW,1.8,20.6); hedge(FW,55.0,V-1.8);
  hedge(FN,1.8,U-1.8); hedge(FS,1.8,U-1.8);
  function topiary(F,s,d,y0,h,r){
    cyl(F,s,d,0.07,0.06,y0,y0+h,TRUNK,6);
    ball(F.G(s,d),y0+h+r*0.6,r,HEDGEL,0.25);
    cols.push([ccw([F.G(s-0.3,d-0.3),F.G(s+0.3,d-0.3),F.G(s+0.3,d+0.3),F.G(s-0.3,d+0.3)]),y0+h+r*1.6]);
  }
  topiary(FW,21.6,1.0,0,1.1,0.55); topiary(FW,54.0,1.0,0,1.1,0.55);
  topiary(FB,PS0+1.2,0.4,0.64,1.0,0.5); topiary(FB,PS1-1.2,0.4,0.64,1.0,0.5);
  /* round stone planters for the platform topiary */
  [PS0+1.2,PS1-1.2].forEach(function(s){ cyl(FB,s,0.4,0.45,0.5,0.64,1.05,CASTD,10); flat(M,(function(){
    var c=FB.G(s,0.4), r=[]; for(var i=0;i<10;i++){ var t=i/10*6.2832; r.push([c[0]+Math.cos(t)*0.46,c[1]+Math.sin(t)*0.46]); } return ccw(r); })(),1.0,MULCH,1); });

  /* ---------------- on the roof: the raised gym, a skylight, a stair house ---------------- */
  (function(){
    var r=R(13,47,14,62), TOPG=17.4;
    prism(M,r,ROOFY,TOPG,BRICK,ROOF,0.85);
    band(M,r,TOPG,TOPG+0.22,0.08,CAST,1,0.8);
    flat(M,offsetRing(r,-0.05),TOPG+0.23,ROOF,1);
    band(M,r,ROOFY,ROOFY+0.3,0.06,CAST,0.95,0.8);
    /* clerestory along the long sides */
    var GW=Face([13,14],[0,1],[-1,0],48), GE=Face([47,62],[0,-1],[1,0],48);
    [GW,GE].forEach(function(F){ for(var s=2.0;s<47;s+=3.6){ panel(F,s,s+2.2,0.02,15.0,16.6,R_GW); } });
    prism(M,R(5,10,5,10),ROOFY,16.3,BRICK,ROOF,0.85);
    band(M,R(5,10,5,10),16.3,16.45,0.05,CAST,1,0.8);
    prism(M,R(50,55,64,70),ROOFY,14.6,0xA9A59C,0x7D8A93,0.8);
  })();

  /* ---------------- trees: clear the forecourt, plant the front ---------------- */
  (function(){
    var keep=PEDB.front, mine=[[-16.4,5.0,'ficus',1.3],[-16.4,23.0,'syc',1.2],[-16.4,53.0,'syc',1.25],[-16.4,71.0,'ficus',1.3],
                               [-5.4,10.5,'mag',1.15],[-5.4,65.5,'mag',1.15]];
    var spots=mine.map(function(q){ return P(q[0],q[1]); });
    for(var i=TREE_POS.length-1;i>=0;i--){ var t=TREE_POS[i];
      var near=spots.some(function(p){ return Math.hypot(p[0]-t[0],p[1]-t[1])<5; });
      var lp=PEDB.loc([t[0],t[1]]);
      var onWalk=lp[0]>-24&&lp[0]<-13&&Math.abs(lp[1]-VC)<3;
      if(inRing(keep,t[0],t[1])||near||onWalk) TREE_POS.splice(i,1); }
    mine.forEach(function(q,i){ var p=spots[i]; TREE_POS.push([p[0],p[1],0,q[2],q[3]]); });
  })();

  /* ---------------- colliders and meshes ---------------- */
  cols.push([R(-0.3,U+0.3,-0.3,V+0.3),COP]);
  cols.push([ccw([FB.G(0,BIN),FB.G(BL,BIN),FB.G(BL,0.1),FB.G(S1,0.1),FB.G(S1,DF+0.1),FB.G(OB,DF+0.1),FB.G(OB,DR),
                  FB.G(OA,DR),FB.G(OA,DF+0.1),FB.G(S0,DF+0.1),FB.G(S0,0.1),FB.G(0,0.1)]),FCP]);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var ma=new T.Mesh(MA.geom(),new T.MeshLambertMaterial({map:atlas,vertexColors:true}));
  ma.frustumCulled=false; ma.receiveShadow=true; scene.add(ma);
  var mk=new T.Mesh(MW.geom(),new T.MeshLambertMaterial({map:walkTex,vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  mk.frustumCulled=false; mk.receiveShadow=true; scene.add(mk);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__ped={tris:M.count()+MA.count()+MW.count(),world:M.count(),atlas:MA.count(),ground:MG.count(),cols:cols.length,
    look:function(){ var e=FB.G(AC,22), t=FB.G(AC,0); return [e[0],1.7,e[1],t[0],8,t[1]]; }};
})();
