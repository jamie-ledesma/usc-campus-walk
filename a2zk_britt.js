/* ==================================================================
   Brittingham Field's podium and its Watt Way front, and the John McKay
   Center's portal onto the field (Jamie asked for these from Street View
   and video stills). BRITF in a_world.js is the frame (u grid east along
   the field, v grid south); the athletics block lifts the turf, lines,
   SC, goals and fence to RH.

   The street front, north to south (s = v + 23.4 from the McKay corner;
   d out toward the street from the lower wall at u -50.8):
   - two brick piers with dark headers standing proud of every few
     courses, a wide flight of stairs between them with a centre rail;
   - the NADINE & WILLIAM TILLEY FOOTBALL ALL-AMERICAN WALK: a cream cast
     stone wall in panels, a step back, a second tier up to the field,
     a clipped hedge on top, a planter of hibiscus along its foot;
   - the arch over the ramp: piers of brick banded with cast stone, a ring
     of alternating brick and stone voussoirs, the entablature carved
     Nous ygies en somati ygiei (in Greek), sconces; in front the Trojan
     sword on its drum; the ramp runs up east between handrails;
   - the BRITTINGHAM FIELD pylon with the SC medallion and plaques, BLOOM
     HALL OF FAME WALK on its side toward the ramp.
   Lamp posts with cardinal SC FIGHT ON! banners and magnolias in grates
   down both sides of Watt Way.
   On the field side of the McKay Center: the Stevens portal (THROUGH
   THIS PORTAL ENTER THE WORLD'S GREATEST ATHLETES round a cast stone arch,
   glass doors with the SC medallion), a three-bay arcade of striped
   arches under a pergola, a bronze statue and a lamp with gold banners.
   Draw calls: one Mesher (matWorld), one atlas (lettering, banners,
   portal, arcade), one ground Mesher.
   ================================================================== */
(function(){
  if(typeof BRITF==='undefined'||!BRITF) return;
  var P=BRITF.P, DU=BRITF.du, DV=BRITF.dv, RH=BRITF.RH;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var BRICK=0xA9533C, BRICKD=0x7A3826, CAST=0xE6DFCF, CASTL=0xF0EBDF, CASTD=0xCFC7B4, DECK=0xCFC9BC,
      HEDGE=0x2F5E2A, HEDGEL=0x3E7034, IRON=0x26292B, POST=0x3A3D40, RAIL=0xCFC6AE, WHITE=0xFFFFFF,
      GOLD=0xC9A24E, SILVER=0xC4C7CA, BRONZE=0x6A563C;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }

  /* ---------------- textured accumulator and quad helpers (as in a2zh_ped.js) ---------------- */
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
  TM.prototype.geom=function(){
    var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));
    g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
    g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));
    g.computeBoundingSphere(); return g; };
  var MA=new TM();
  function shade(hex,y,k){ return rgb(hex,(k===undefined?1:k)*(0.84+0.16*Math.min(1,Math.max(0,y)/3.5))); }
  function emit(tgt,pts,want,hex,k,uvs){
    var A=pts[0],B2=pts[1],C=pts[2];
    var ux=B2[0]-A[0],uy=B2[1]-A[1],uz=B2[2]-A[2], vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, o=[0,1,2,3];
    if(nx*want[0]+ny*want[1]+nz*want[2]<0) o=[0,3,2,1];
    var q=o.map(function(i){ return pts[i]; }), c=q.map(function(p){ return shade(hex,p[1],k); });
    if(tgt===M) M.quad(q[0],q[1],q[2],q[3],c[0],c[1],c[2],c[3]);
    else { var t=o.map(function(i){ return uvs[i]; }); tgt.quad(q[0],q[1],q[2],q[3],c[0],c[1],c[2],c[3],t[0],t[1],t[2],t[3]); }
  }
  function Face(a,t,n,L){
    var F={a:a,t:t,n:n,L:L};
    F.nw=[DU[0]*n[0]+DV[0]*n[1],0,DU[1]*n[0]+DV[1]*n[1]];
    F.tw=[DU[0]*t[0]+DV[0]*t[1],0,DU[1]*t[0]+DV[1]*t[1]];
    F.W=function(s,d,y){ var p=P(a[0]+t[0]*s+n[0]*d, a[1]+t[1]*s+n[1]*d); return [p[0],y,p[1]]; };
    F.G=function(s,d){ return P(a[0]+t[0]*s+n[0]*d, a[1]+t[1]*s+n[1]*d); };
    return F;
  }
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
  function panel(F,s0,s1,d,y0,y1,rg,flip){
    var W=F.W, u0=rg[0], v0=rg[1], u1=rg[2], v1=rg[3];
    if((F.n[1]*F.t[0]-F.n[0]*F.t[1]<0)!==!!flip){ var tmp=u0; u0=u1; u1=tmp; }
    var want=flip?[-F.nw[0],0,-F.nw[2]]:F.nw;
    emit(MA,[W(s0,d,y0),W(s1,d,y0),W(s1,d,y1),W(s0,d,y1)],want,WHITE,1,[[u0,v1],[u1,v1],[u1,v0],[u0,v0]]);
  }
  function col(r,h){ cols.push([ccw(r),h]); }
  function fcol(F,s0,s1,d0,d1,h){ col([F.G(s0,d0),F.G(s1,d0),F.G(s1,d1),F.G(s0,d1)],h); }
  function cyl(c,r0,r1,y0,y1,hex,n){
    n=n||10;
    for(var i=0;i<n;i++){ var t0=i/n*6.2832, t1=(i+1)/n*6.2832, tm=(t0+t1)/2;
      emit(M,[[c[0]+Math.cos(t0)*r0,y0,c[1]+Math.sin(t0)*r0],[c[0]+Math.cos(t1)*r0,y0,c[1]+Math.sin(t1)*r0],
              [c[0]+Math.cos(t1)*r1,y1,c[1]+Math.sin(t1)*r1],[c[0]+Math.cos(t0)*r1,y1,c[1]+Math.sin(t0)*r1]],[Math.cos(tm),0,Math.sin(tm)],hex,1); }
    if(r1>0.001){ var top=[]; for(i=0;i<n;i++){ var a=i/n*6.2832; top.push([c[0]+Math.cos(a)*r1,c[1]+Math.sin(a)*r1]); } flat(M,ccw(top),y1,hex,1.05); }
  }
  function ball(c,y,r,hex){
    var NA=8, NB=5;
    function pt(a,b){ var th=a/NA*6.2832, ph=b/NB*Math.PI; return [c[0]+Math.cos(th)*Math.sin(ph)*r, y+Math.cos(ph)*r, c[1]+Math.sin(th)*Math.sin(ph)*r]; }
    for(var i=0;i<NA;i++) for(var j=0;j<NB;j++){ var th=(i+0.5)/NA*6.2832, ph=(j+0.5)/NB*Math.PI;
      emit(M,[pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1)],[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)],hex,1); }
  }
  /* a square rail running from (s,d0,y0) to (s,d1,y1) in a wall frame */
  function rail(F,s,d0,y0,d1,y1,w,hex){
    var h=w/2, A=F.W(s-h,d0,y0+h), B=F.W(s+h,d0,y0+h), C=F.W(s+h,d1,y1+h), D=F.W(s-h,d1,y1+h),
        A2=F.W(s-h,d0,y0-h), B2=F.W(s+h,d0,y0-h), C2=F.W(s+h,d1,y1-h), D2=F.W(s-h,d1,y1-h);
    emit(M,[A,B,C,D],[0,1,0],hex,1.05); emit(M,[A2,B2,C2,D2],[0,-1,0],hex,0.8);
    emit(M,[A,A2,D2,D],[-F.tw[0],0,-F.tw[2]],hex,0.95); emit(M,[B,B2,C2,C],F.tw,hex,0.95);
  }

  /* ---------------- the atlas (1024 x 1024) ---------------- */
  var AW=1024, cv=document.createElement('canvas'); cv.width=cv.height=AW;
  var g=cv.getContext('2d');
  function RG(x,y,w,h){ return [x/AW,1-y/AW,(x+w)/AW,1-(y+h)/AW]; }
  function stone(x,y,w,h,base){
    g.fillStyle=base||'#E8E1D1'; g.fillRect(x,y,w,h);
    for(var i=0;i<Math.floor(w*h/90);i++){ var v=205+((i*53)%40); g.fillStyle='rgba('+v+','+(v-4)+','+(v-14)+',0.22)'; g.fillRect(x+(i*97)%w,y+(i*61)%h,2,2); }
  }
  function carve(txt,x,y,font,col){
    g.font=font; g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle='rgba(255,252,242,0.85)'; g.fillText(txt,x+1.5,y+1.5);
    g.fillStyle=col||'#3E3A33'; g.fillText(txt,x,y);
  }
  /* the Greek motto on the arch */
  stone(0,0,1024,96,'#E6DFCF');
  carve('\u039d\u03bf\u1fe6\u03c2 \u1f51\u03b3\u03b9\u1f74\u03c2 \u1f10\u03bd \u03c3\u03ce\u03bc\u03b1\u03c4\u03b9 \u1f51\u03b3\u03b9\u03b5\u1fd6',512,50,'italic 62px Georgia, "Times New Roman", serif','#3A3630');
  var R_GK=RG(0,2,1024,92);
  /* the Tilley walk inscription */
  stone(0,96,1024,32,'#E6DFCF');
  carve('NADINE & WILLIAM TILLEY FOOTBALL ALL-AMERICAN WALK',512,113,'25px Georgia, "Times New Roman", serif','#2C2925');
  var R_TL=RG(0,97,1024,30);
  /* the pylon: BRITTINGHAM FIELD, the SC medallion, a plaque */
  function scMark(cx,cy,sz,fill,stroke){
    g.font='900 '+sz+'px Georgia,"Times New Roman",serif'; g.textAlign='center'; g.textBaseline='middle';
    g.lineJoin='round'; g.lineWidth=Math.max(2,sz*0.06); g.strokeStyle=stroke; g.fillStyle=fill;
    g.strokeText('C',cx+sz*0.17,cy+sz*0.06); g.fillText('C',cx+sz*0.17,cy+sz*0.06);
    g.strokeText('S',cx-sz*0.15,cy-sz*0.04); g.fillText('S',cx-sz*0.15,cy-sz*0.04);
  }
  (function(){
    var x=0,y=128,w=256,h=320;
    stone(x,y,w,h,'#ECE6D8');
    g.fillStyle='rgba(120,110,95,0.35)'; for(var k=1;k<7;k++) g.fillRect(x,y+k*46,w,2);
    g.fillStyle='#ECE6D8'; g.fillRect(x+6,y+6,w-12,82);
    carve('BRITTINGHAM',x+w/2,y+32,'34px Georgia, serif','#3A3630');
    carve('F I E L D',x+w/2,y+70,'bold 26px Georgia, serif','#3A3630');
    g.fillStyle='#E2DBCB'; g.beginPath(); g.arc(x+w/2,y+170,62,0,6.2832); g.fill();
    g.strokeStyle='#B9B09C'; g.lineWidth=5; g.beginPath(); g.arc(x+w/2,y+170,58,0,6.2832); g.stroke();
    g.strokeStyle='#F6F2E8'; g.lineWidth=2; g.beginPath(); g.arc(x+w/2,y+170,52,0,6.2832); g.stroke();
    scMark(x+w/2,y+172,74,'#EFEAE0','#A9A08C');
    g.fillStyle='#24211E'; g.fillRect(x+98,y+250,60,62); g.strokeStyle='#8E8065'; g.lineWidth=2; g.strokeRect(x+101,y+253,54,56);
    g.fillStyle='#B8AC8E'; for(k=0;k<6;k++) g.fillRect(x+108,y+266+k*7,40-(k%2)*10,2);
  })();
  var R_PY=RG(1,129,254,318);
  /* the side of the pylon: BLOOM HALL OF FAME WALK and a plaque */
  (function(){
    var x=256,y=128,w=256,h=320;
    stone(x,y,w,h,'#ECE6D8');
    g.fillStyle='rgba(120,110,95,0.35)'; for(var k=1;k<7;k++) g.fillRect(x,y+k*46,w,2);
    g.fillStyle='#ECE6D8'; g.fillRect(x+40,y+60,w-80,100);
    carve('BLOOM',x+w/2,y+80,'26px Georgia, serif','#3A3630');
    carve('HALL OF FAME',x+w/2,y+112,'26px Georgia, serif','#3A3630');
    carve('WALK',x+w/2,y+144,'26px Georgia, serif','#3A3630');
    g.fillStyle='#24211E'; g.fillRect(x+98,y+200,60,80); g.fillStyle='#B8AC8E'; for(k=0;k<8;k++) g.fillRect(x+108,y+214+k*7,40-(k%2)*10,2);
  })();
  var R_BL=RG(257,129,254,318);
  /* banners: cardinal with a gold key border, SC and FIGHT ON!; the gold McKay ones */
  function banner(x,y,bg,fg,key,txt){
    var w=128,h=256;
    g.fillStyle=bg; g.fillRect(x,y,w,h);
    g.strokeStyle=key; g.lineWidth=3;
    [y+6,y+h-20].forEach(function(yy){ for(var kx=0;kx<w;kx+=16){ g.beginPath(); g.moveTo(x+kx+1,yy+12); g.lineTo(x+kx+1,yy+2);
      g.lineTo(x+kx+11,yy+2); g.lineTo(x+kx+11,yy+8); g.lineTo(x+kx+6,yy+8); g.lineTo(x+kx+6,yy+12); g.lineTo(x+kx+16,yy+12); g.stroke(); } });
    scMark(x+w/2,y+110,118,fg,bg);
    g.font='italic 900 24px Impact, "Arial Black", sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle=fg; g.fillText(txt,x+w/2,y+200);
  }
  banner(512,128,'#8E1B2A','#F2C230','#E2B23C','FIGHT ON!');
  banner(640,128,'#F2C230','#A4202F','#A4202F','FIGHT ON!');
  var R_BC=RG(513,129,126,254), R_BG=RG(641,129,126,254);
  /* the Stevens portal: 8 m square, 64 px a metre; corners outside the arch are cut away (alpha) */
  (function(){
    var x=0,y=448,S=512,cx=x+256,sp=y+S-3.0*64, R0=250, R1=170;
    g.clearRect(x,y,S,S);
    /* jambs and the arch ring in cast stone */
    g.fillStyle='#E9E3D4';
    g.beginPath(); g.moveTo(cx-R0,y+S); g.lineTo(cx-R0,sp); g.arc(cx,sp,R0,Math.PI,0); g.lineTo(cx+R0,y+S);
    g.lineTo(cx+R1,y+S); g.lineTo(cx+R1,sp); g.arc(cx,sp,R1,0,Math.PI,true); g.lineTo(cx-R1,y+S); g.closePath(); g.fill();
    g.strokeStyle='#C6BEAB'; g.lineWidth=3;
    g.beginPath(); g.arc(cx,sp,R0-6,Math.PI,0); g.stroke(); g.beginPath(); g.arc(cx,sp,R1+8,Math.PI,0); g.stroke();
    for(var k=1;k<8;k++){ var a=Math.PI+k*Math.PI/8; g.beginPath(); g.moveTo(cx+Math.cos(a)*(R1+8),sp+Math.sin(a)*(R1+8));
      g.lineTo(cx+Math.cos(a)*(R0-6),sp+Math.sin(a)*(R0-6)); g.stroke(); }
    for(k=1;k<5;k++){ g.beginPath(); g.moveTo(cx-R0,sp+k*38); g.lineTo(cx-R1,sp+k*38); g.moveTo(cx+R1,sp+k*38); g.lineTo(cx+R0,sp+k*38); g.stroke(); }
    /* the inscription round the arch */
    var txt="THROUGH THIS PORTAL ENTER THE WORLD'S GREATEST ATHLETES", n=txt.length, rr=(R0+R1)/2+2;
    g.font='bold 19px Georgia, "Times New Roman", serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#3A3630';
    for(k=0;k<n;k++){ var t=Math.PI*(1.06+0.88*k/(n-1));
      g.save(); g.translate(cx+Math.cos(t)*rr,sp+Math.sin(t)*rr); g.rotate(t+Math.PI/2); g.fillText(txt[k],0,0); g.restore(); }
    /* glass lunette, transom, doors */
    var gr=g.createLinearGradient(0,sp-R1,0,y+S); gr.addColorStop(0,'#7E9AAE'); gr.addColorStop(0.5,'#4E6576'); gr.addColorStop(1,'#33414C');
    g.fillStyle=gr; g.beginPath(); g.moveTo(cx-R1+10,y+S); g.lineTo(cx-R1+10,sp); g.arc(cx,sp,R1-10,Math.PI,0); g.lineTo(cx+R1-10,y+S); g.closePath(); g.fill();
    g.fillStyle='#BFC2C0'; g.fillRect(cx-R1+10,sp-4,2*R1-20,10); g.fillRect(cx-3,sp-R1+12,6,R1-12);
    g.fillRect(cx-R1+10,sp,8,S-(sp-y)); g.fillRect(cx+R1-18,sp,8,S-(sp-y));
    [cx-80,cx,cx+80].forEach(function(xx){ g.fillRect(xx-4,sp,8,S-(sp-y)); });
    g.fillStyle='#A9ACAA'; g.fillRect(cx-R1+10,y+S-10,2*R1-20,10);
    g.fillStyle='#3B3226'; g.beginPath(); g.arc(cx,y+S-80,26,0,6.2832); g.fill();
    g.fillStyle='#C9A86A'; g.beginPath(); g.arc(cx,y+S-80,22,0,6.2832); g.fill();
    scMark(cx,y+S-80,30,'#3B3226','#C9A86A');
  })();
  var R_PO=RG(0,448,512,512);
  /* the arcade: three round arches banded brick and stone, 10 m by 5 m */
  (function(){
    var x=512,y=448,w=512,h=256, ppm=51.2;
    g.fillStyle='#A9533C'; g.fillRect(x,y,w,h);
    g.fillStyle='rgba(60,25,15,0.18)'; for(var r=0;r<h;r+=5) g.fillRect(x,y+r,w,1);
    var ow=2.5*ppm, pw=(w-3*ow)/4;
    for(var k=0;k<3;k++){
      var ax=x+pw+k*(ow+pw), cx=ax+ow/2, sp=y+h-2.6*ppm, R=ow/2;
      /* piers banded with stone */
      for(var yy=sp;yy<y+h;yy+=26){ g.fillStyle='#E6DFCF'; g.fillRect(ax-14,yy,14,11); g.fillRect(ax+ow,yy,14,11); }
      /* voussoirs */
      for(var j=0;j<9;j++){ var a0=Math.PI+j*Math.PI/9, a1=Math.PI+(j+1)*Math.PI/9;
        g.fillStyle=j%2?'#A9533C':'#E6DFCF';
        g.beginPath(); g.arc(cx,sp,R+30,a0,a1); g.arc(cx,sp,R,a1,a0,true); g.closePath(); g.fill(); }
      g.fillStyle='#2A2622'; g.beginPath(); g.moveTo(ax,y+h); g.lineTo(ax,sp); g.arc(cx,sp,R,Math.PI,0); g.lineTo(ax+ow,y+h); g.closePath(); g.fill();
      g.fillStyle='rgba(70,80,86,0.6)'; g.fillRect(ax+ow*0.3,sp+10,ow*0.4,40);
    }
    g.fillStyle='#E6DFCF'; g.fillRect(x,y,w,14); g.fillRect(x,y+h-10,w,10);
  })();
  var R_AR=RG(512,448,512,256);
  var atlas=new T.CanvasTexture(cv); atlas.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

  /* ---------------- the podium ---------------- */
  prism(M,BRITF.pod,0,RH,CAST,DECK,0.85);
  col(BRITF.pod,RH);
  var F=Face([-50.8,-23.4],[0,1],[-1,0],45.4);     /* the street front: s = v + 23.4, d out of the lower wall */
  var LW=2.4;                                       /* the lower tier */
  function tilley(s0,s1,inscr){
    fbox(F,s0,s1,-1.25,0,0,LW,CAST,{noSides:1});
    fbox(F,s0-0.02,s1+0.02,-1.25,0.06,LW,LW+0.12,CASTL,{bot:1,noSides:1});
    for(var s=s0+2.4;s<s1-0.3;s+=2.4) emit(M,[F.W(s-0.012,0.004,0),F.W(s+0.012,0.004,0),F.W(s+0.012,0.004,LW),F.W(s-0.012,0.004,LW)],F.nw,CASTD,1);
    for(s=s0+1.2;s<s1-0.3;s+=2.4) emit(M,[F.W(s-0.012,-1.196,LW),F.W(s+0.012,-1.196,LW),F.W(s+0.012,-1.196,RH),F.W(s-0.012,-1.196,RH)],F.nw,CASTD,1);
    emit(M,[F.W(s0,0.004,1.3),F.W(s1,0.004,1.3),F.W(s1,0.004,1.32),F.W(s0,0.004,1.32)],F.nw,CASTD,1);
    /* the hibiscus planter */
    fbox(F,s0,s1,0,1.25,0,0.42,CASTD,{});
    for(s=s0+0.3;s<s1-0.4;s+=1.1){
      var h=0.42+((s*7.3)%1)*0.25;
      fbox(F,s,s+1.15,0.12,1.12,0.42,0.42+h,HEDGE,{});
      fbox(F,s+0.08,s+1.07,0.2,1.04,0.42+h,0.52+h,HEDGEL,{});
      for(var f=0;f<4;f++){ var fs=s+0.15+((f*0.37+s*1.7)%0.9), fy=0.6+((f*0.29+s)%1)*h, fc=(f+Math.round(s))%3===0?0xF2D04A:0xD8262E;
        fbox(F,fs,fs+0.12,1.12,1.16,fy,fy+0.11,fc,{noTop:1}); }
    }
    fcol(F,s0,s1,-1.25,1.25,LW);
    if(inscr){ panel(F,inscr[0],inscr[1],0.006,1.62,1.89,R_TL);
      fbox(F,(inscr[0]+inscr[1])/2-0.55,(inscr[0]+inscr[1])/2+0.55,0,0.04,0.55,1.0,0x2A2724,{bot:1}); }
  }
  /* the hedge and the cap along the top of the front */
  function topEdge(s0,s1){
    fbox(F,s0,s1,-1.45,-1.12,RH,RH+0.12,CASTL,{bot:1});
    fbox(F,s0,s1,-2.45,-1.55,RH,RH+0.95,HEDGE,{noTop:1});
    fbox(F,s0+0.05,s1-0.05,-2.4,-1.6,RH+0.95,RH+1.08,HEDGEL,{});
  }
  tilley(9.4,32.6,[14.4,27.6]); topEdge(9.4,33.4);
  tilley(43.0,45.4,null); topEdge(37.4,45.4);
  /* brick piers with dark headers standing proud, the stairs between them */
  function pier(s0,s1,d0,d1,h){
    fbox(F,s0,s1,d0,d1,0,h,BRICK,{});
    for(var y=0.45;y<h-0.3;y+=0.42){
      [[s0+0.25,d1],[s1-0.5,d1]].forEach(function(q,qi){
        var ss=q[0]+((y*10|0)%2)*0.12; fbox(F,ss,ss+0.26,d1,d1+0.07,y,y+0.065,BRICKD,{bot:1}); });
      [d1-0.6,d0+0.6].forEach(function(dd){ fbox(F,s0-0.07,s0,dd-0.13,dd+0.13,y,y+0.065,BRICKD,{bot:1}); fbox(F,s1,s1+0.07,dd-0.13,dd+0.13,y,y+0.065,BRICKD,{bot:1}); });
    }
    fbox(F,s0-0.06,s1+0.06,d0,d1+0.06,h,h+0.18,CASTL,{bot:1});
    fcol(F,s0,s1,d0,d1,h+0.18);
  }
  pier(0,1.9,-1.4,1.6,4.4); pier(6.9,9.4,-1.4,1.6,4.4);
  var NS=18, RS=RH/NS, TRD=0.3, SD0=1.4;
  for(var k=0;k<NS;k++){
    var dF=SD0-k*TRD, top=(k+1)*RS;
    fbox(F,1.9,6.9,-4.6,dF,0,top,CASTL,{noSides:1});
    emit(M,[F.W(1.9,dF+0.004,top-0.03),F.W(6.9,dF+0.004,top-0.03),F.W(6.9,dF+0.004,top),F.W(1.9,dF+0.004,top)],F.nw,CASTD,1);
    fcol(F,1.9,6.9,-4.6,dF,top);
  }
  [2.15,4.4,6.65].forEach(function(s){
    rail(F,s,SD0+0.1,0.95,SD0-NS*TRD+0.2,RH+0.95,0.06,s===4.4?RAIL:IRON);
    [SD0-0.1,SD0-NS*TRD*0.5,SD0-NS*TRD+0.3].forEach(function(dd){ var yy=Math.max(0,(SD0-dd)/TRD)*RS+RS;
      fbox(F,s-0.03,s+0.03,dd-0.03,dd+0.03,yy,yy+0.95,s===4.4?RAIL:IRON,{}); });
  });

  /* ---------------- the arch over the ramp ---------------- */
  var A0=32.6, A1=38.2, OA=33.4, OB=37.4, AC=35.4, AR=2.0, ASP=2.5, ATOP=5.0, AD0=-0.2, AD1=1.1;
  [[A0,OA],[OB,A1]].forEach(function(p){
    var y=0, i=0;
    while(y<ASP-0.01){ var hh=Math.min(i%2?0.28:0.46,ASP-y); fbox(F,p[0],p[1],-1.3,AD1+(i%2?0.03:0),y,y+hh,i%2?CAST:BRICK,{bot:i%2===1}); y+=hh; i++; }
    fbox(F,p[0],p[1],-1.3,AD1,ASP,ATOP,BRICK,{noTop:1});
    fcol(F,p[0],p[1],AD0,AD1+0.03,ATOP);
    /* sconces */
    var sc=(p[0]+p[1])/2; fbox(F,sc-0.05,sc+0.05,AD1,AD1+0.32,3.6,3.7,IRON,{bot:1}); fbox(F,sc-0.09,sc+0.09,AD1+0.25,AD1+0.42,3.35,3.75,IRON,{});
  });
  (function(){
    var N=9, W=F.W;
    function X(i,r){ var th=Math.PI*(1-i/N); return [AC+r*Math.cos(th), ASP+r*Math.sin(th)]; }
    for(var i=0;i<N;i++){
      var a=X(i,AR), b=X(i+1,AR), m=X(i+0.5,AR);
      [AD1,AD0].forEach(function(dd,side){
        var want=side?[-F.nw[0],0,-F.nw[2]]:F.nw;
        emit(M,[W(a[0],dd,a[1]),W(b[0],dd,b[1]),W(b[0],dd,ATOP),W(a[0],dd,ATOP)],want,BRICK,1);
        var a2=X(i,AR+0.55), b2=X(i+1,AR+0.55), dz=dd+(side?-0.03:0.03), col2=i%2?BRICK:CAST;
        emit(M,[W(a[0],dz,a[1]),W(b[0],dz,b[1]),W(b2[0],dz,b2[1]),W(a2[0],dz,a2[1])],want,col2,1);
      });
      var ds=AC-m[0], dy=ASP-m[1], l=Math.hypot(ds,dy)||1;
      emit(M,[W(a[0],AD0,a[1]),W(b[0],AD0,b[1]),W(b[0],AD1,b[1]),W(a[0],AD1,a[1])],[F.tw[0]*ds/l,dy/l,F.tw[2]*ds/l],CASTD,0.92);
    }
    fbox(F,A0-0.15,A1+0.15,AD0-0.1,AD1+0.1,ATOP,ATOP+1.05,CAST,{bot:1,back:1});
    panel(F,A0,A1,AD1+0.105,ATOP+0.12,ATOP+0.95,R_GK);
    panel(F,A0,A1,AD0-0.105,ATOP+0.12,ATOP+0.95,R_GK,true);
    fbox(F,A0-0.3,A1+0.3,AD0-0.22,AD1+0.22,ATOP+1.05,ATOP+1.3,CASTL,{bot:1,back:1});
  })();
  /* the ramp, up east through the podium between handrails */
  var RL=24, RS0=OA, RS1=OB;
  (function(){
    var W=F.W;
    emit(M,[W(RS0,AD1+0.4,0.08),W(RS1,AD1+0.4,0.08),W(RS1,0,0.08),W(RS0,0,0.08)],[0,1,0],DECK,1);
    emit(M,[W(RS0,0,0.08),W(RS1,0,0.08),W(RS1,-RL,RH),W(RS0,-RL,RH)],[0,1,0],DECK,1);
    for(var k=0;k<RL;k++) fcol(F,RS0,RS1,-k-1,-k+(k?0:1.5),0.08+(RH-0.08)*(k+1)/RL);
    [RS0+0.3,RS1-0.3].forEach(function(s){
      rail(F,s,0.4,1.0,-RL,RH+1.0,0.06,RAIL);
      for(var d=0;d>=-RL;d-=3){ var yy=0.08+(RH-0.08)*(-d)/RL; fbox(F,s-0.03,s+0.03,d-0.03,d+0.03,yy,yy+1.0,RAIL,{}); }
    });
  })();
  /* the Trojan sword on its drum, in front of the arch */
  (function(){
    var c=F.G(34.0,2.0);
    cyl(c,0.45,0.42,0,0.95,CASTL,14);
    fbox(F,33.75,34.25,2.0+0.43,2.0+0.46,0.42,0.72,0x24211E,{});
    fbox(F,33.95,34.05,1.985,2.015,0.95,1.62,SILVER,{});
    cyl(c,0.26,0.26,1.62,1.68,GOLD,12);
    for(var i=0;i<5;i++) cyl(c,i%2?0.07:0.085,i%2?0.07:0.085,1.68+i*0.07,1.75+i*0.07,i%2?SILVER:BRONZE,8);
    ball(c,2.08,0.12,GOLD);
    col([F.G(33.5,1.5),F.G(34.5,1.5),F.G(34.5,2.5),F.G(33.5,2.5)],0.95);
  })();
  /* the BRITTINGHAM FIELD pylon */
  (function(){
    var s0=38.6, s1=43.0, d0=-1.2, d1=2.2, h=5.8;
    fbox(F,s0,s1,d0,d1,0,h,CASTL,{});
    fbox(F,s0-0.06,s1+0.06,d0,d1+0.06,h,h+0.16,CAST,{bot:1});
    panel(F,s0+0.15,s1-0.15,d1+0.006,0.4,5.5,R_PY);
    /* the side toward the ramp */
    var FS=Face([-50.8-d1,-23.4+s0],[1,0],[0,-1],d1-d0);
    panel(FS,0.2,FS.L-0.2,0.006,0.4,5.5,R_BL);
    fcol(F,s0,s1,d0,d1,h+0.16);
  })();
  NO_PLANT.push(ccw([F.G(-1,-5),F.G(46,-5),F.G(46,4.2),F.G(-1,4.2)]));

  /* ---------------- lamps with banners and magnolias down Watt Way ---------------- */
  function lamp(c,along,bannerRG,h,y0){
    y0=y0||0; h=(h||5.2)+y0;
    cyl(c,0.16,0.12,y0,y0+0.9,POST,8); cyl(c,0.075,0.065,y0+0.9,h,POST,8);
    ball(c,h+0.25,0.24,0xF4F0E4); cyl(c,0.1,0.1,h,h+0.05,POST,8);
    /* two banners hung either side of the post, facing along the street */
    var ax=[-along[1],along[0]];
    [-1,1].forEach(function(sd){
      var bx=c[0]+ax[0]*sd*0.12, bz=c[1]+ax[1]*sd*0.12, ex=c[0]+ax[0]*sd*0.92, ez=c[1]+ax[1]*sd*0.92;
      segBox(M,[bx,bz],[ex,ez],h-0.65,h-0.6,0.04,POST,0.8); segBox(M,[bx,bz],[ex,ez],h-2.15,h-2.1,0.04,POST,0.8);
      var A=[bx,h-2.1,bz], B=[ex,h-2.1,ez], C=[ex,h-0.6,ez], D=[bx,h-0.6,bz];
      var u0=bannerRG[0], u1=bannerRG[2], v0=bannerRG[1], v1=bannerRG[3], n1=[along[0],0,along[1]], n2=[-along[0],0,-along[1]];
      /* read from both ends of the street: swap u on one face so neither is mirrored */
      var l0=sd>0?u0:u1, l1=sd>0?u1:u0;
      emit(MA,[A,B,C,D],n1,WHITE,1,[[l1,v1],[l0,v1],[l0,v0],[l1,v0]]);
      emit(MA,[[A[0]+along[0]*0.01,A[1],A[2]+along[1]*0.01],[B[0]+along[0]*0.01,B[1],B[2]+along[1]*0.01],[C[0]+along[0]*0.01,C[1],C[2]+along[1]*0.01],[D[0]+along[0]*0.01,D[1],D[2]+along[1]*0.01]],
           n2,WHITE,1,[[l0,v1],[l1,v1],[l1,v0],[l0,v0]]);
    });
    col([[c[0]-0.25,c[1]-0.25],[c[0]+0.25,c[1]-0.25],[c[0]+0.25,c[1]+0.25],[c[0]-0.25,c[1]+0.25]],h);
  }
  var ALONG=[DV[0],DV[1]];
  [-40,-28,-16,-4,8,24,36,50].forEach(function(v){
    lamp(P(-54.35,v),ALONG,R_BC); lamp(P(-66.05,v),ALONG,R_BC);
  });
  (function(){
    /* clear the old street trees along the front, plant magnolias in grates between the lamps */
    var keep=BRITF.front;
    for(var i=TREE_POS.length-1;i>=0;i--){ var t=TREE_POS[i], l=BRITF.loc([t[0],t[1]]);
      if(inRing(keep,t[0],t[1])||inRing(BRITF.pod,t[0],t[1])||(l[0]>-70&&l[0]<-50&&l[1]>-48&&l[1]<58)) TREE_POS.splice(i,1); }
    [-34,-22,-10,2,30,43].forEach(function(v){
      [-54.35,-66.05].forEach(function(u){ var p=P(u,v); TREE_POS.push([p[0],p[1],0,'mag',0.7]);
        flat(MG,ccw([P(u-0.7,v-0.7),P(u+0.7,v-0.7),P(u+0.7,v+0.7),P(u-0.7,v+0.7)]),0.09,0x3A3D40,1); });
    });
  })();

  /* ---------------- the McKay Center's portal and arcade, on the field side ---------------- */
  (function(){
    var FM=Face([1.8,-23.65],[-1,0],[0,1],10.3);          /* s west along the face, d south toward the field */
    fbox(FM,0.6,9.7,0,0.25,RH,RH+8.1,CAST,{});
    panel(FM,1.15,9.15,0.26,RH,RH+8.0,R_PO);
    fbox(FM,0.9,9.4,0.25,0.9,RH,RH+0.14,CASTL,{});
    [0.85,9.45].forEach(function(s){ fbox(FM,s-0.22,s+0.22,0.25,0.55,RH+3.0,RH+3.9,0x3A3530,{bot:1});
      fbox(FM,s-0.16,s+0.16,0.55,0.57,RH+3.1,RH+3.8,0xEDE6CC,{}); });
    var FA=Face([-8.6,-25.9],[-1,0],[0,1],11.2);
    panel(FA,0.6,10.6,0.06,RH,RH+5.0,R_AR);
    /* the pergola over it: stone posts, beams, slats */
    for(var s=0.6;s<=10.7;s+=2.5){ fbox(FA,s-0.2,s+0.2,0.1,0.5,RH+5.0,RH+7.6,CASTL,{}); fbox(FA,s-0.2,s+0.2,2.2,2.6,RH+5.0,RH+7.6,CASTL,{}); }
    fbox(FA,0.4,10.8,0.1,2.6,RH+5.0,RH+5.3,CAST,{bot:1});
    for(s=0.6;s<10.7;s+=0.45) fbox(FA,s-0.05,s+0.05,-0.1,2.8,RH+7.6,RH+7.85,0xE8E2D4,{bot:1});
    fbox(FA,0.4,10.8,2.4,2.8,RH+7.4,RH+7.6,CAST,{bot:1});
    /* a bronze figure on a low plinth, hand to his chin */
    var st=P(-21.6,-22.4);
    cyl(st,0.55,0.55,RH,RH+0.35,CASTD,10);
    var fp=Face([-21.6,-22.4],[-1,0],[0,1],1);
    fbox(fp,-0.2,-0.04,-0.12,0.08,RH+0.35,RH+1.25,BRONZE,{}); fbox(fp,0.04,0.2,-0.12,0.08,RH+0.35,RH+1.25,BRONZE,{});
    fbox(fp,-0.26,0.26,-0.16,0.12,RH+1.25,RH+2.0,BRONZE,{});
    fbox(fp,-0.38,-0.26,-0.08,0.08,RH+1.3,RH+1.95,BRONZE,{});
    fbox(fp,0.18,0.3,0.06,0.2,RH+1.55,RH+1.95,BRONZE,{});
    ball(st,RH+2.22,0.17,BRONZE);
    col([[st[0]-0.6,st[1]-0.6],[st[0]+0.6,st[1]-0.6],[st[0]+0.6,st[1]+0.6],[st[0]-0.6,st[1]+0.6]],RH+2.4);
    lamp(P(-24.6,-21.2),[DU[0],DU[1]],R_BG,5.0,RH);
  })();

  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  var ma=new T.Mesh(MA.geom(),new T.MeshLambertMaterial({map:atlas,vertexColors:true,alphaTest:0.5}));
  ma.frustumCulled=false; ma.receiveShadow=true; scene.add(ma);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  window.__britt={tris:M.count()+MA.p.length/9,cols:cols.length};
})();
