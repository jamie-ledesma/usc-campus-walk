/* ==================================================================
   Allyson Felix Field (Cromwell Field until 2023) in Katherine B. Loker
   Track Stadium, between Grace Ford Salvatori Hall (south), Brittingham
   Field (north) and Heritage Hall (north east). a_world.js sets FELIXP
   (campus grid frame, the sign frame Q, the plaza and bed rings, the
   track outline) and clears the OSM walk loop and the old stand block.

   From aerial imagery and OSM way 140790303:
   - A cardinal red eight lane track (USC Recreational Sports) round a long infield: a striped
     turf football and soccer field with the SC at midfield, the west end
     all red for the jumps, the east end turf with the javelin runway and
     a sand throwing sector.
   - The grandstand on the north straight, wrapping round the north west
     bend: aluminium bench rows over a cream front wall, a brick back wall
     and the press box. Four light masts.
   - A black iron picket fence on brick piers with cast stone caps round
     the rest, with a stretch of brick wall south east of the sign.
   - The entry plaza at Watt Way and Childs Way: pale concrete squares in a
     red brick lattice; a low cast stone bench wall in a shallow arc with
     planter urns at both ends and a twin globe lamp on a brick pier in
     front of it, an interpretive sign, hedges, a planted bed and magnolias,
     and the ALLYSON FELIX FIELD sign: a buff cast stone frame on two brick
     piers with red letters along the top and a big LED screen (cardinal,
     WE'RE THINKING B1G).
   ================================================================== */
(function(){
  if(typeof FELIXP==='undefined'||!FELIXP) return;
  var F=FELIXP, P=F.P, Q=F.Q, TR=F.TR, NA=F.n, AA=F.a;
  var M=new Mesher(), MG=new Mesher(), cols=[], GLOBES=[];
  var RUB=0xB24A38, RUBL=0xBE5844, LINE=0xF4F2EC, TURF=0x4E9E3C, TURFD=0x468F36, APRON=0xA39D90,
      BRICK=0xA0503A, BRICKD=0x8C4430, CAST=0xE3D4B6, CASTL=0xEDE2CB, CASTD=0xC8B898,
      IRON=0x1A1B1D, HEDGE=0x3F6C2D, HEDGED=0x355E27, SEAT=0xD3D6D6, RISER=0xA7A8A3, SAND=0xD9C79E;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function solid(r,h){ cols.push([r,h]); }
  /* boxes in the grid frame (u,v) and in the sign frame (s,t) */
  function gR(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function gbox(u0,u1,v0,v1,y0,y1,col,sh){ var r=gR(u0,u1,v0,v1); prism(M,r,y0,y1,col,col,sh===undefined?0.62:sh); return r; }
  function sR(s0,s1,t0,t1){ return ccw([Q(s0,t0),Q(s1,t0),Q(s1,t1),Q(s0,t1)]); }
  function sbox(s0,s1,t0,t1,y0,y1,col,sh,top){ var r=sR(s0,s1,t0,t1); prism(M,r,y0,y1,col,top||col,sh===undefined?0.62:sh); return r; }
  function sq(x,z,h){ return ccw([[x-h,z-h],[x+h,z-h],[x+h,z+h],[x-h,z+h]]); }

  /* ================= the track ================= */
  var LW=1.22, LN=8, IN=0.3+LN*LW+0.3;      /* inner kerb at R-IN */
  flat(MG,F.trackRing(0.8),0.10,APRON,1);
  flat(MG,F.trackRing(0),0.12,RUB,1);
  for(var k=0;k<=LN;k++) ribbon(MG,loop(F.trackRing(-0.3-k*LW,32)),0.07,0.135,LINE,1);
  ribbon(MG,loop(F.trackRing(-IN+0.12,32)),0.24,0.14,0xFFFFFF,1);
  flat(MG,F.trackRing(-IN),0.14,TURF,1);
  function loop(r){ var o=r.slice(); o.push(r[0]); return o; }
  /* start line and staggered marks on the home straight */
  (function(){
    var u=TR.cu+TR.half-6, v0=TR.cv+TR.R-0.3, v1=TR.cv+TR.R-0.3-LN*LW;
    ribbon(MG,[P(u,v0),P(u,v1)],0.10,0.137,LINE,1);
    for(var l=0;l<LN;l++){ var vv=v0-(l+0.5)*LW; ribbon(MG,[P(u-0.25,vv),P(u+0.25,vv)],0.5,0.137,0xF2D24A,1); }
  })();
  var Rin=TR.R-IN, Ec=TR.cu+TR.half, Wc=TR.cu-TR.half, fcu=TR.cu+2, FH=45.72, FW=24.23;   /* 100 x 53 yd (USC Recreational Sports) */
  /* the west end: all red for the jumps, with two landing pads */
  (function(){
    var cut=fcu-FH-1.2, a0=Math.acos((cut-Wc)/Rin), r=[];
    for(var i=0;i<=20;i++){ var a=a0+(2*Math.PI-2*a0)*i/20; r.push(P(Wc+Math.cos(a)*Rin,TR.cv+Math.sin(a)*Rin)); }
    flat(MG,ccw(r),0.145,RUBL,1);
    [[-339,TR.cv-9],[-343,TR.cv+8]].forEach(function(q){
      var rr=gbox(q[0]-2.6,q[0]+2.6,q[1]-2.4,q[1]+2.4,0.14,0.72,0xB8473D,0.7);
      gbox(q[0]-2.4,q[0]+2.4,q[1]-2.2,q[1]+2.2,0.72,0.82,0x6D7682,0.85);
      solid(rr,0.82);
    });
  })();
  /* the east end: javelin runway across the turf and the sand sector */
  ribbon(MG,[P(fcu+FH+1,TR.cv+9),P(Ec+Math.sqrt(Rin*Rin-81)-0.2,TR.cv+9)],1.3,0.148,RUBL,1);
  flat(MG,ccw([P(Ec+6,TR.cv+16.5),P(Ec+19.5,TR.cv+10.5),P(Ec+15,TR.cv+19.5)]),0.149,SAND,1);
  /* long jump runways in the gaps between the field and the kerb */
  ribbon(MG,[P(TR.cu-46,TR.cv-FW-0.75),P(TR.cu+30,TR.cv-FW-0.75)],0.9,0.146,RUBL,1);
  ribbon(MG,[P(TR.cu-44,TR.cv+FW+0.75),P(TR.cu+40,TR.cv+FW+0.75)],0.9,0.146,RUBL,1);
  flat(MG,gR(TR.cu+31,TR.cu+39,TR.cv-FW-1.3,TR.cv-FW+0.1),0.147,SAND,1);

  /* ================= the field: mown stripes, lines, SC ================= */
  (function(){
    var n=24, L=2*FH/n;
    for(var i=0;i<n;i++){ var u0=fcu-FH+i*L;
      flat(MG,gR(u0,u0+L,TR.cv-FW,TR.cv+FW),0.150,i%2?TURFD:TURF,i%2?1:1.04); }
    function ln(u0,v0,u1,v1,w){ ribbon(MG,[P(u0,v0),P(u1,v1)],w,0.160,LINE,1); }
    /* sidelines in pieces (long thin strips) */
    for(i=0;i<6;i++){ var a=fcu-FH+i*2*FH/6, b=a+2*FH/6;
      ln(a,TR.cv-FW,b,TR.cv-FW,0.2); ln(a,TR.cv+FW,b,TR.cv+FW,0.2); }
    ln(fcu-FH,TR.cv-FW,fcu-FH,TR.cv+FW,0.2); ln(fcu+FH,TR.cv-FW,fcu+FH,TR.cv+FW,0.2);
    for(var y=-10;y<=10;y++){ var u=fcu+y*4.572;
      ln(u,TR.cv-FW,u,TR.cv+FW,y%2?0.1:0.16);
      for(var sd=-1;sd<=1;sd+=2) ln(u+2.286-0.05,TR.cv+sd*6.2-0.5,u+2.286-0.05,TR.cv+sd*6.2+0.5,0.1); }
    /* soccer goals on the end lines */
    for(sd=-1;sd<=1;sd+=2){
      var gu=fcu+sd*FH;
      for(var q=-1;q<=1;q+=2){ var pp=P(gu,TR.cv+q*3.66); postAt(M,pp[0],pp[1],0.15,2.44,0.06,0xF4F4F0,0.9);
        var pb=P(gu+sd*1.6,TR.cv+q*3.66); postAt(M,pb[0],pb[1],0.15,1.2,0.04,0xDADAD4,0.85);
        segBox(M,pp,pb,2.38,2.44,0.06,0xF4F4F0,0.9); }
      segBox(M,P(gu,TR.cv-3.66),P(gu,TR.cv+3.66),2.38,2.48,0.10,0xF4F4F0,0.9);
      segBox(M,P(gu+sd*1.6,TR.cv-3.66),P(gu+sd*1.6,TR.cv+3.66),1.12,1.2,0.06,0xDADAD4,0.85);
    }
    /* the interlocking SC at midfield */
    var cv=document.createElement('canvas'); cv.width=cv.height=256;
    var g=cv.getContext('2d');
    g.font='900 208px Georgia,"Times New Roman",serif'; g.textAlign='center'; g.textBaseline='middle';
    g.lineJoin='round'; g.fillStyle='#8E1B2A'; g.strokeStyle='#E9C04A'; g.lineWidth=13;
    g.strokeText('C',170,134); g.fillText('C',170,134); g.strokeText('S',100,134); g.fillText('S',100,134);
    var m=new T.Mesh(new T.PlaneGeometry(13,13),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false,
        polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
    var c=P(fcu,TR.cv);
    /* read from the grandstand: the letters' up points north (toward the stand) */
    m.rotation.set(-Math.PI/2,0,Math.atan2(F.dv[0],F.dv[1]));
    m.position.set(c[0],0.17,c[1]); m.renderOrder=2; m.raycast=function(){}; m.frustumCulled=false; scene.add(m);
  })();

  /* ================= the grandstand ================= */
  (function(){
    var NR=14, RISE=0.42, TREAD=0.8, FWH=1.3, VF=TR.cv-TR.R-1.6;     /* front line */
    /* the front line as points with outward normals (grid frame), east to west */
    var line=[];
    for(var i=0;i<=4;i++){ var u=-240+(Wc+240)*i/4; line.push([u,VF,0,-1]); }
    var Rf=TR.R+1.6;
    for(i=1;i<=6;i++){ var a=(270-i*10)*Math.PI/180; line.push([Wc+Math.cos(a)*Rf,TR.cv+Math.sin(a)*Rf,Math.cos(a),Math.sin(a)]); }
    function off(p,o){ return P(p[0]+p[2]*o,p[1]+p[3]*o); }
    function strip(o0,o1,y0,y1,side,top,sh){
      for(var j=0;j<line.length-1;j++){
        var p=line[j], q=line[j+1], r=ccw([off(p,o0),off(q,o0),off(q,o1),off(p,o1)]);
        prism(M,r,y0,y1,side,top,sh);
      }
    }
    /* cream front wall with a cardinal stripe, the rows, the top walkway, the back wall */
    strip(-0.3,0,0,FWH+0.9,CAST,CASTL,0.7);
    strip(-0.32,-0.3,FWH+0.25,FWH+0.45,0x9A1F2A,0x9A1F2A,0.8);
    for(var r=0;r<NR;r++){
      var y=FWH+(r+1)*RISE;
      strip(r*TREAD,(r+1)*TREAD,0,y,RISER,r%2?SEAT:0xC9CCCC,0.62);
      /* the bench itself: a thin aluminium plank near the front of each tread */
      strip(r*TREAD+0.12,r*TREAD+0.42,y,y+0.08,SEAT,0xE4E6E6,0.8);
    }
    var top=FWH+NR*RISE, back=NR*TREAD;
    strip(back,back+1.6,0,top,CASTD,0xB9B4A8,0.6);
    strip(back+1.6,back+1.9,0,top+1.1,BRICK,CAST,0.6);
    strip(back+1.55,back+1.95,top+1.1,top+1.25,CAST,CASTL,0.8);
    /* the aisles: a lighter stair every 12 m along the straight */
    for(var ua=-246;ua>Wc;ua-=12){
      var a1=[ua,VF,0,-1], a2=[ua-1.1,VF,0,-1];
      for(r=0;r<NR;r++){ var yy=FWH+(r+1)*RISE;
        prism(M,ccw([off(a1,r*TREAD),off(a2,r*TREAD),off(a2,(r+1)*TREAD),off(a1,(r+1)*TREAD)]),yy-RISE*0.5,yy+0.01,0xB4B2AA,0xDCDAD2,0.66); }
    }
    /* the press box on the top walkway */
    var pu0=-322, pu1=-306, pv0=VF-back-1.9, pv1=VF-back+0.2;
    gbox(pu0,pu1,pv0,pv1,top,top+3.4,0xEFEDE6,0.7);
    var gl=gR(pu0+0.4,pu1-0.4,pv1-0.02,pv1+0.03); prism(M,gl,top+1.2,top+2.8,0x33424C,0x33424C,1);
    gbox(pu0-0.4,pu1+0.4,pv0-0.4,pv1+0.6,top+3.4,top+3.7,0xD9D6CE,0.8);
    /* colliders: one per segment, the whole depth */
    for(var j=0;j<line.length-1;j++){ var p=line[j], q=line[j+1];
      solid(ccw([off(p,-0.3),off(q,-0.3),off(q,back+1.9),off(p,back+1.9)]),top+1.1); }
  })();

  /* ================= light masts ================= */
  function mast(p,face){
    var x=p[0], z=p[1], h=25;
    postAt(M,x,z,0,1.2,0.5,0x9A958A,0.6); postAt(M,x,z,1.2,h,0.24,0xCFCBC0,0.62);
    var fx=face[0]-x, fz=face[1]-z, L=Math.hypot(fx,fz); fx/=L; fz/=L;
    var ax=-fz, az=fx;
    segBox(M,[x-ax*2.6,z-az*2.6],[x+ax*2.6,z+az*2.6],h,h+0.3,0.25,0x3A3C40,0.8);
    segBox(M,[x-ax*2.6,z-az*2.6],[x+ax*2.6,z+az*2.6],h+1.3,h+1.6,0.25,0x3A3C40,0.8);
    for(var r=0;r<2;r++) for(var k=-2;k<=2;k++){
      var cx=x+ax*k*1.15+fx*0.25, cz=z+az*k*1.15+fz*0.25, y=h+0.35+r*0.62;
      prism(M,sq(cx,cz,0.24),y,y+0.5,0x3A3C40,0x3A3C40,0.8);
      prism(M,ccw([[cx+fx*0.25-ax*0.2,cz+fz*0.25-az*0.2],[cx+fx*0.25+ax*0.2,cz+fz*0.25+az*0.2],
                   [cx+fx*0.3+ax*0.2,cz+fz*0.3+az*0.2],[cx+fx*0.3-ax*0.2,cz+fz*0.3-az*0.2]]),y+0.05,y+0.45,0xF7F2DE,0xF7F2DE,1);
    }
    solid(sq(x,z,0.6),h);
  }
  var fieldC=P(fcu,TR.cv);
  [[-298,TR.cv+TR.R+6.2],[-248,TR.cv+TR.R+6.2],[-236,TR.cv-TR.R-6.5]].forEach(function(q){ mast(P(q[0],q[1]),fieldC); });
  mast(P(Wc+Math.cos(Math.PI*0.92)*42,TR.cv+Math.sin(Math.PI*0.92)*42),fieldC);

  /* ================= the fence: iron pickets on brick piers ================= */
  var FO=TR.R+5.5, fence=[];
  (function(){
    fence.push([-240,TR.cv-FO]);
    for(var i=0;i<=18;i++){ var a=-Math.PI/2+Math.PI*i/18; fence.push([Ec+Math.cos(a)*FO,TR.cv+Math.sin(a)*FO,a]); }
    for(i=0;i<=12;i++){ var a2=Math.PI/2+(212-90)*Math.PI/180*i/12; fence.push([Wc+Math.cos(a2)*FO,TR.cv+Math.sin(a2)*FO,a2]); }
  })();
  var FPOS=[], FUV=[], FH2=2.3, PIER=8.5, run=0, nextPier=0;
  function pier(x,z){
    prism(M,sq(x,z,0.36),0,0.3,CAST,CAST,0.7);
    prism(M,sq(x,z,0.3),0.3,2.65,BRICK,BRICK,0.6);
    for(var y=0.75;y<2.5;y+=0.45) prism(M,sq(x,z,0.305),y,y+0.03,BRICKD,BRICKD,0.8);
    prism(M,sq(x,z,0.4),2.65,2.8,CAST,CASTL,0.75); prism(M,sq(x,z,0.26),2.8,2.92,CAST,CASTL,0.9);
    solid(sq(x,z,0.4),2.8);
  }
  var U=0;
  for(var fi=0;fi<fence.length-1;fi++){
    var A=P(fence[fi][0],fence[fi][1]), B=P(fence[fi+1][0],fence[fi+1][1]);
    var L=Math.hypot(B[0]-A[0],B[1]-A[1]); if(L<0.05) continue;
    var th=fence[fi+1][2], wall=(fi>0&&fi<19&&th!==undefined&&th>0.87&&th<1.45);   /* brick wall south east of the sign */
    if(wall){
      segBox(M,A,B,0,2.5,0.36,BRICK,0.6); segBox(M,A,B,2.5,2.66,0.48,CAST,0.8);
      segBox(M,A,B,0,0.3,0.44,CAST,0.7);
    } else {
      FPOS.push(A[0],0,A[1], B[0],0,B[1], B[0],FH2,B[1],  A[0],0,A[1], B[0],FH2,B[1], A[0],FH2,A[1]);
      FUV.push(U,0, U+L/1.2,0, U+L/1.2,1,  U,0, U+L/1.2,1, U,1);
      U+=L/1.2; U-=Math.floor(U);
    }
    var dx=(B[0]-A[0])/L, dz=(B[1]-A[1])/L, nx=-dz*0.15, nz=dx*0.15;
    solid(ccw([[A[0]+nx,A[1]+nz],[B[0]+nx,B[1]+nz],[B[0]-nx,B[1]-nz],[A[0]-nx,A[1]-nz]]),FH2);
    while(nextPier<=run+L){ var t=(nextPier-run)/L; pier(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t); nextPier+=PIER; }
    run+=L;
  }
  pier(P(fence[fence.length-1][0],fence[fence.length-1][1])[0],P(fence[fence.length-1][0],fence[fence.length-1][1])[1]);
  (function(){
    var cv=document.createElement('canvas'); cv.width=128; cv.height=256;
    var g=cv.getContext('2d'), py=256/FH2;
    for(var i=0;i<8;i++){ var cx=i*16+8;
      g.fillStyle='#141517'; g.fillRect(cx-2,12,4,256-12);
      g.beginPath(); g.moveTo(cx-3,15); g.lineTo(cx,0); g.lineTo(cx+3,15); g.closePath(); g.fill();
      g.fillStyle='#3d4046'; g.fillRect(cx-2,14,1,256-14); }
    g.fillStyle='#141517'; g.fillRect(0,256-2.05*py,128,6); g.fillRect(0,256-0.25*py,128,6);
    var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.wrapT=T.ClampToEdgeWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(FPOS,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(FUV,2));
    geo.computeBoundingSphere();
    var fm=new T.Mesh(geo,new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:0.03,depthWrite:false,side:T.DoubleSide}));
    fm.frustumCulled=false; fm.renderOrder=1; fm.userData.noShadow=true; fm.raycast=function(){}; scene.add(fm);
  })();

  /* ================= the plaza paving: concrete squares in a brick lattice ================= */
  (function(){
    var cv=document.createElement('canvas'); cv.width=cv.height=512;
    var g=cv.getContext('2d'), C=256, BW=36;
    g.fillStyle='#8F4A38'; g.fillRect(0,0,512,512);
    for(var i=0;i<2;i++) for(var j=0;j<2;j++){
      var h=Math.sin(i*12.9+j*78.2)*43758.5; h-=Math.floor(h);
      var l=Math.round(198+h*12);
      g.fillStyle='rgb('+l+','+(l-4)+','+(l-12)+')';
      g.fillRect(i*C+BW/2,j*C+BW/2,C-BW,C-BW);
      g.fillStyle='rgba(120,110,95,0.18)';
      g.fillRect(i*C+C/2-1,j*C+BW/2,2,C-BW); g.fillRect(i*C+BW/2,j*C+C/2-1,C-BW,2);
    }
    /* brick joints in the bands */
    g.fillStyle='rgba(60,25,18,0.45)';
    for(var k=0;k<=2;k++){ var b=k*C;
      for(var s=0;s<512;s+=22){ g.fillRect(b-BW/2,s,BW,2); g.fillRect(s,b-BW/2,2,BW); }
      g.fillRect(b-1,0,2,512); g.fillRect(0,b-1,512,2); }
    var tex=new T.CanvasTexture(cv); tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var ring=F.plaza, f=triangulate(ring), pos=[], uv=[], S2=4.6, y=0.15;
    function push(p){ var l=F.loc(p); pos.push(p[0],y,p[1]); uv.push((l[0]+0.7)/S2,-(l[1]+0.7)/S2); }
    for(i=0;i<f.length;i++){ var A=ring[f[i][0]], B=ring[f[i][1]], Cc=ring[f[i][2]]; push(A); push(Cc); push(B); }
    var gb=new T.BufferGeometry();
    gb.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    gb.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    gb.computeVertexNormals();
    var mb=new T.Mesh(gb,new T.MeshLambertMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    mb.receiveShadow=true; mb.frustumCulled=false; scene.add(mb);
    ribbon(MG,loop(ring),0.45,0.152,0x8A4535,1);
  })();

  /* ================= the planted bed between the bench wall and the sign ================= */
  flat(MG,F.bed,0.11,0x4A6B32,1);
  for(var ti=TREE_POS.length-1;ti>=0;ti--){ var tq=TREE_POS[ti];
    if(inRing(F.bed,tq[0],tq[1])||inRing(F.plaza,tq[0],tq[1])) TREE_POS.splice(ti,1); }
  NO_LAWN_TREES.push(F.bed.slice(),F.plaza.slice());
  [[-15.5,7.0,1.15],[-8.6,5.6,0.95],[8.2,-0.5,1.05],[-19.5,5.0,1.0]].forEach(function(q){
    var p=Q(q[0],q[1]); TREE_POS.push([p[0],p[1],0,'mag',q[2]]); });
  /* the tall hedge at the foot of the sign, and flowering shrubs in the bed */
  sbox(-19.5,4.2,1.4,2.6,0.1,1.45,HEDGE,0.72,0x4A7A35);
  for(var bs=-18;bs<3;bs+=2.3){
    var hh=0.55+((bs*7.3)%1+1)%1*0.35;
    sbox(bs,bs+1.5,4.2,5.4,0.1,hh,0x557F37,0.72,0x5E8A3C);
    if(Math.round(bs)%2) sbox(bs+0.3,bs+1.2,4.4,5.2,hh,hh+0.12,0xE0A23A,0.9);
  }

  /* ================= the bench wall arc, urns, lamp, interpretive sign ================= */
  var SC=-7, HALF=7.2;
  function nb(s){ var x=(s-SC)/HALF; return 11.45+1.3*x*x; }       /* back of the bench along the arc */
  (function(){
    var N=8;
    for(var i=0;i<N;i++){
      var s0=SC-HALF+2*HALF*i/N, s1=SC-HALF+2*HALF*(i+1)/N, b0=nb(s0), b1=nb(s1);
      var r=ccw([Q(s0,b0),Q(s1,b1),Q(s1,b1+0.6),Q(s0,b0+0.6)]);
      prism(M,r,0,0.38,CAST,CAST,0.68);
      var c=ccw([Q(s0,b0-0.04),Q(s1,b1-0.04),Q(s1,b1+0.66),Q(s0,b0+0.66)]);
      prism(M,c,0.38,0.47,CASTL,CASTL,0.8);
      solid(r,0.47);
      /* the low hedge right behind it */
      var hr=ccw([Q(s0,b0-1.25),Q(s1,b1-1.25),Q(s1,b1-0.08),Q(s0,b0-0.08)]);
      prism(M,hr,0.1,1.05,HEDGED,0x467634,0.72);
    }
    /* the urn planters: square pedestal, wide trough, flowers */
    [SC-HALF-0.55,SC+HALF+0.55].forEach(function(s,i){
      var t=nb(s)+0.35;
      sbox(s-0.5,s+0.5,t-0.45,t+0.45,0,0.12,CASTD,0.7);
      sbox(s-0.38,s+0.38,t-0.33,t+0.33,0.12,0.8,CAST,0.66);
      sbox(s-1.05,s+1.05,t-0.5,t+0.5,0.8,0.98,CAST,0.72,CASTL);
      sbox(s-0.92,s+0.92,t-0.38,t+0.38,0.98,1.12,0x5D8A3A,0.8);
      for(var f=0;f<6;f++){ var fs=s-0.75+f*0.3;
        sbox(fs,fs+0.2,t-0.25+(f%2)*0.25,t-0.05+(f%2)*0.25,1.12,1.24,f%3===0?0xE7C232:(f%3===1?0xD45B2E:0xF0E8C8),0.95); }
      solid(sR(s-1.05,s+1.05,t-0.5,t+0.5),1.12);
    });
    /* the lamp: brick pier with a cast stone cap, a bronze post with two globes */
    var lt=nb(SC)+0.6+0.55, lp=Q(SC,lt);
    sbox(SC-0.42,SC+0.42,lt-0.42,lt+0.42,0,0.18,CASTD,0.7);
    sbox(SC-0.38,SC+0.38,lt-0.38,lt+0.38,0.18,1.05,BRICK,0.6);
    for(var yb=0.4;yb<1.0;yb+=0.22) sbox(SC-0.385,SC+0.385,lt-0.385,lt+0.385,yb,yb+0.025,BRICKD,0.8);
    sbox(SC-0.5,SC+0.5,lt-0.5,lt+0.5,1.05,1.2,CAST,0.75,CASTL);
    solid(sR(SC-0.5,SC+0.5,lt-0.5,lt+0.5),1.2);
    var BRZ=0x3B3631, x=lp[0], z=lp[1];
    prism(M,ccw(ngon(x,z,0.2,8,0)),1.2,1.75,BRZ,BRZ,0.7);
    prism(M,ccw(ngon(x,z,0.09,8,0)),1.75,4.25,BRZ,BRZ,0.72);
    prism(M,ccw(ngon(x,z,0.14,8,0)),3.6,3.75,BRZ,BRZ,0.8);
    var la=Q(SC-0.55,lt), lb=Q(SC+0.55,lt);
    segBox(M,la,lb,4.15,4.25,0.07,BRZ,0.75);
    [la,lb].forEach(function(p){ prism(M,ccw(ngon(p[0],p[1],0.07,6,0)),4.25,4.4,BRZ,BRZ,0.8); GLOBES.push([p[0],4.68,p[1]]); });
    coneRoof(M,x,z,0.07,4.25,0.75,BRZ,6);
    /* the interpretive sign at the west end: a dark lectern with a pale panel */
    var is=SC-HALF-2.6, it=nb(SC-HALF)+1.0;
    sbox(is-0.75,is-0.65,it-0.05,it+0.05,0,0.75,0x2E2A26,0.7);
    sbox(is+0.65,is+0.75,it-0.05,it+0.05,0,0.75,0x2E2A26,0.7);
    var p0=Q(is-0.85,it-0.3), p1=Q(is+0.85,it-0.3), p2=Q(is+0.85,it+0.25), p3=Q(is-0.85,it+0.25);
    var kf=rgb(0x2E2A26,0.8), kp=rgb(0xE8E0CC,1), kr=rgb(0x9A1F2A,1);
    M.quad([p0[0],1.05,p0[1]],[p1[0],1.05,p1[1]],[p2[0],0.75,p2[1]],[p3[0],0.75,p3[1]],kf,kf,kf,kf);
    var e0=Q(is-0.78,it-0.27), e1=Q(is+0.78,it-0.27), e2=Q(is+0.78,it+0.2), e3=Q(is-0.78,it+0.2);
    M.quad([e3[0],0.78,e3[1]],[e2[0],0.78,e2[1]],[e1[0],1.07,e1[1]],[e0[0],1.07,e0[1]],kp,kp,kp,kp);
    var h0=Q(is-0.78,it-0.27), h1=Q(is+0.78,it-0.27), h2=Q(is+0.78,it-0.17), h3=Q(is-0.78,it-0.17);
    M.quad([h3[0],1.04,h3[1]],[h2[0],1.04,h2[1]],[h1[0],1.075,h1[1]],[h0[0],1.075,h0[1]],kr,kr,kr,kr);
    solid(sR(is-0.85,is+0.85,it-0.3,it+0.25),1.05);
    /* the crowd sits on the bench wall, facing the plaza */
    if(typeof BENCHES!=='undefined') [-12.6,-9.9,-4.1,-1.4].forEach(function(s){
      var t=nb(s)+0.3, p=Q(s,t), q=Q(s+0.3,nb(s+0.3)+0.3), dx=q[0]-p[0], dz=q[1]-p[1], L=Math.hypot(dx,dz);
      var fx=dz/L, fz=-dx/L; if(fx*NA[0]+fz*NA[1]<0){ fx=-fx; fz=-fz; }
      BENCHES.push([p[0],p[1],Math.atan2(fx,fz)]);
    });
  })();

  /* ================= the ALLYSON FELIX FIELD sign and video board ================= */
  (function(){
    /* brick piers on cast stone bases with cast stone caps */
    [-3.3,3.3].forEach(function(s){
      sbox(s-0.68,s+0.68,-0.62,0.62,0,0.4,CAST,0.7,CASTL);
      sbox(s-0.6,s+0.6,-0.52,0.52,0.4,3.0,BRICK,0.6);
      for(var y=0.8;y<2.9;y+=0.42) sbox(s-0.605,s+0.605,-0.525,0.525,y,y+0.03,BRICKD,0.8);
      sbox(s-0.72,s+0.72,-0.64,0.64,3.0,3.22,CAST,0.72,CASTL);
      solid(sR(s-0.68,s+0.68,-0.62,0.62),11.4);
    });
    /* the frame */
    sbox(-4.7,4.7,-0.45,0.45,3.22,11.0,CAST,0.66,CASTL);
    sbox(-4.8,4.8,-0.55,0.55,3.22,3.5,CASTD,0.72);
    sbox(-4.9,4.9,-0.62,0.62,11.0,11.18,CASTL,0.78);
    sbox(-4.78,4.78,-0.52,0.52,11.18,11.42,CAST,0.8,CASTL);
    sbox(-4.6,4.6,0.45,0.5,9.55,9.65,CASTD,0.8);
    /* screen bezel, and a dark back panel behind */
    sbox(-4.38,4.38,0.45,0.52,3.9,9.2,0x1C1C1E,0.9);
    sbox(-4.2,4.2,-0.5,-0.45,4.2,8.9,0xD2C3A4,0.85);
    /* small wayfinding signs on a post under the board */
    var wp=Q(0.2,1.0); postAt(M,wp[0],wp[1],0,2.9,0.06,0x4A3A2C,0.7);
    sbox(-0.7,0.15,0.94,1.06,2.45,2.72,0x6B5A48,0.85); sbox(0.25,1.1,0.94,1.06,2.45,2.72,0x6B5A48,0.85);
    solid(sq(wp[0],wp[1],0.12),2.9);

    function plane(w,h,tex,s,t,y,basic){
      var p=Q(s,t), m=new T.Mesh(new T.PlaneGeometry(w,h),basic?new T.MeshBasicMaterial({map:tex,color:0xEEEEEE}):
        new T.MeshLambertMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
      m.position.set(p[0],y,p[1]); m.rotation.y=Math.atan2(NA[0],NA[1]);
      m.raycast=function(){}; m.frustumCulled=false; if(!basic) m.renderOrder=3; scene.add(m);
    }
    /* the red letters along the top */
    var cv=document.createElement('canvas'); cv.width=1024; cv.height=128;
    var g=cv.getContext('2d');
    g.clearRect(0,0,1024,128);
    g.font='bold 104px "Arial Black","Helvetica Neue",Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillStyle='#B91C26'; g.strokeStyle='#7E1018'; g.lineWidth=3;
    g.fillText('ALLYSON FELIX FIELD',512,68,1000); g.strokeText('ALLYSON FELIX FIELD',512,68,1000);
    plane(7.4,0.93,new T.CanvasTexture(cv),0,0.47,10.25,false);
    /* the LED screen */
    var sv=document.createElement('canvas'); sv.width=1024; sv.height=600;
    var s2=sv.getContext('2d');
    var gr=s2.createLinearGradient(0,0,0,600); gr.addColorStop(0,'#B3141F'); gr.addColorStop(1,'#990F19');
    s2.fillStyle=gr; s2.fillRect(0,0,1024,600);
    s2.textAlign='center'; s2.textBaseline='middle';
    s2.font='bold 84px Arial,"Helvetica Neue",sans-serif'; s2.fillStyle='#E6EEF7';
    s2.fillText("WE'RE THINKING",512,120,880);
    s2.font='900 250px "Arial Black",Georgia,serif'; s2.lineJoin='round';
    s2.strokeStyle='#5A0A10'; s2.lineWidth=16; s2.strokeText('B1G',512,325);
    s2.fillStyle='#F2C230'; s2.fillText('B1G',512,325);
    s2.font='bold 44px Georgia,serif'; s2.textAlign='left'; s2.fillStyle='#F4EEE6';
    s2.fillText('USC',80,535);
    s2.fillStyle='#F2C230'; s2.fillRect(40,510,28,40);
    s2.font='bold 32px Arial,sans-serif'; s2.textAlign='right'; s2.fillStyle='#F4EEE6';
    s2.fillText('USC x BIG TEN',980,535);
    /* LED pixel grid */
    s2.fillStyle='rgba(0,0,0,0.13)';
    for(var x=0;x<1024;x+=6) s2.fillRect(x,0,1.5,600);
    for(var y=0;y<600;y+=6) s2.fillRect(0,y,1024,1.5);
    var stex=new T.CanvasTexture(sv); stex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    plane(8.5,4.98,stex,0,0.53,6.55,true);
  })();

  /* ================= build ================= */
  var gG=new T.SphereGeometry(0.3,10,8), iG=new T.InstancedMesh(gG,new T.MeshLambertMaterial({color:0xF7F4EC,emissive:0x5E5A50}),GLOBES.length);
  var D=new T.Object3D();
  GLOBES.forEach(function(q,i){ D.position.set(q[0],q[1],q[2]); D.updateMatrix(); iG.setMatrixAt(i,D.matrix); });
  iG.frustumCulled=false; iG.raycast=function(){}; scene.add(iG);
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
  window.__felix={tris:M.count(),ground:MG.count(),cols:cols.length};
})();
