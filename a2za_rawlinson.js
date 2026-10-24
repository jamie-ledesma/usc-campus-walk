/* ==================================================================
   Rawlinson Stadium (formerly McAlister Field): USC soccer and lacrosse.
   a_world.js sets RAWL (campus grid frame, origin at the centre of the
   pitch, u grid east along the touchlines, v grid south to the stand).

   From photos and the architect's renderings:
   - Striped turf pitch, the interlocking SC at midfield, white goals.
   - One grandstand on the south touchline: a red front wall, maroon
     seats in seven sections split by concrete aisles, a red tower at the
     west end and a lower red block at the east end. On top at the back
     the press box: a band of dark glass between red end caps under a
     white roof slab with the RAWLINSON STADIUM fascia, and a roof
     terrace with a rail and red umbrellas.
   - The back of the stand is red brick: cast stone base, arched
     openings in cast stone surrounds, a band, windows and a cap.
   - The entrance: a cream cast stone gateway with an arched opening and
     RAWLINSON STADIUM on top, iron gates standing open, at the south east
     corner. Black iron picket fence on a brick kerb with brick piers
     round the rest, four light masts, a scoreboard, team benches.
   - A match: USC (cardinal and gold) against a blue team, with keepers
     and a referee, and fans in the stand. Same build as the students:
     six instanced meshes in all, so the whole match is six draw calls
     and a ball. It only runs while the camera is within 320 m.
   ================================================================== */
var updateSoccer=function(){};
(function(){
  if(typeof RAWL==='undefined'||!RAWL) return;
  var F=RAWL, P=F.P, DU=F.du, DV=F.dv;
  var M=new Mesher(), MG=new Mesher(), cols=[];
  var RED=0xA4202F, REDD=0x8A1B28, BRICK=0xA0503A, BRICKD=0x8C4430, CAST=0xE6DCC8, CASTD=0xCBBDA2,
      CONC=0xBDB7AC, CONCD=0xA39D92, SEAT=0x8C3446, SEATD=0x6E2636, GLASS=0x2A4547, WHITE=0xECEBE6,
      METAL=0xBFC3C2, IRON=0x1A1B1D, TURF=0x4FA33E, TURFD=0x46953A, LINE=0xF3F2EC, DARK=0x2A221D;
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function R(u0,u1,v0,v1){ return ccw([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)]); }
  function box(u0,u1,v0,v1,y0,y1,col,sh,top){ var r=R(u0,u1,v0,v1); prism(M,r,y0,y1,col,top||col,sh===undefined?0.62:sh); return r; }
  function solid(r,h){ cols.push([r,h]); }
  function sq(x,z,h){ return ccw([[x-h,z-h],[x+h,z-h],[x+h,z+h],[x-h,z+h]]); }
  var TU=60, TVN=-37.5, TVS=35.6, HL=52, HW=31, GW=3.66, GH=2.44;

  /* ================= the pitch ================= */
  (function(){
    var n=16, L=2*TU/n;
    for(var i=0;i<n;i++) flat(MG,R(-TU+i*L,-TU+(i+1)*L,TVN,TVS),0.10,i%2?TURFD:TURF,i%2?1:1.04);
    var LY=0.125;
    function pl(pts){ ribbon(MG,pts.map(function(q){ return P(q[0],q[1]); }),0.12,LY,LINE,1); }
    function rectL(u0,u1,v0,v1){ pl([[u0,v0],[u1,v0],[u1,v1],[u0,v1],[u0,v0]]); }
    function arcL(cu,cv,r,a0,a1,k){ var p=[]; for(var j=0;j<=k;j++){ var a=a0+(a1-a0)*j/k; p.push([cu+Math.cos(a)*r,cv+Math.sin(a)*r]); } pl(p); }
    function spot(u,v){ flat(MG,R(u-0.14,u+0.14,v-0.14,v+0.14),LY+0.002,LINE,1); }
    rectL(-HL,HL,-HW,HW); pl([[0,-HW],[0,HW]]); arcL(0,0,9.15,0,6.2832,40); spot(0,0);
    [-1,1].forEach(function(s){
      var e=s*HL;
      rectL(Math.min(e,e-s*16.5),Math.max(e,e-s*16.5),-20.16,20.16);
      rectL(Math.min(e,e-s*5.5),Math.max(e,e-s*5.5),-9.16,9.16);
      spot(e-s*11,0);
      var a=Math.acos(5.5/9.15);
      if(s>0) arcL(e-11,0,9.15,Math.PI-a,Math.PI+a,10); else arcL(e+11,0,9.15,-a,a,10);
      [-1,1].forEach(function(t){ arcL(e,t*HW,1,s>0?(t>0?-Math.PI:Math.PI/2):(t>0?-Math.PI/2:0),s>0?(t>0?-Math.PI/2:Math.PI):(t>0?0:Math.PI/2),5);
        /* corner flags */
        var c=P(e,t*HW); postAt(M,c[0],c[1],0,1.5,0.025,0xF2F2EE,0.9);
        var f=P(e,t*HW+0.01); prism(M,ccw([[f[0],f[1]],[f[0]+DU[0]*0.03,f[1]+DU[1]*0.03],[f[0]+DU[0]*0.03-DV[0]*t*0.45,f[1]+DU[1]*0.03-DV[1]*t*0.45],[f[0]-DV[0]*t*0.45,f[1]-DV[1]*t*0.45]]),1.15,1.5,s>0?0xF2C230:RED,s>0?0xF2C230:RED,0.9);
      });
    });
    /* the interlocking SC at midfield, reading from the stand */
    var cv=document.createElement('canvas'); cv.width=cv.height=256;
    var g=cv.getContext('2d');
    g.font='900 208px Georgia,"Times New Roman",serif'; g.textAlign='center'; g.textBaseline='middle';
    g.lineJoin='round'; g.fillStyle='#8E1B2A'; g.strokeStyle='#E9C04A'; g.lineWidth=13;
    g.strokeText('C',170,134); g.fillText('C',170,134); g.strokeText('S',100,134); g.fillText('S',100,134);
    var m=new T.Mesh(new T.PlaneGeometry(13,13),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false,
          polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
    m.rotation.set(-Math.PI/2,0,Math.atan2(DV[0],DV[1]));
    var c0=P(0,0); m.position.set(c0[0],0.22,c0[1]); m.renderOrder=2; m.raycast=function(){}; m.frustumCulled=false; scene.add(m);
  })();

  /* ================= goals: white frames, nets as one textured mesh ================= */
  (function(){
    var NP=[], NUV=[], D=1.9, BH=1.3;
    function q(a,b,c,d,w,h){ NP.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2], a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]);
      NUV.push(0,0,w,0,w,h, 0,0,w,h,0,h); }
    function W(u,v,y){ var p=P(u,v); return [p[0],y,p[1]]; }
    [-1,1].forEach(function(s){
      var e=s*HL, b=s*(HL+D);
      [-1,1].forEach(function(t){ var p=P(e,t*GW); postAt(M,p[0],p[1],0,GH,0.06,0xF4F4F0,0.95); solid(sq(p[0],p[1],0.08),GH);
        var p2=P(b,t*GW); postAt(M,p2[0],p2[1],0,BH,0.03,0xD8D8D2,0.9); });
      segBox(M,P(e,-GW),P(e,GW),GH-0.12,GH,0.12,0xF4F4F0,0.95);
      segBox(M,P(b,-GW),P(b,GW),0,0.05,0.05,0xD8D8D2,0.9);
      var k=1/0.13;
      q(W(b,-GW,0),W(b,GW,0),W(b,GW,BH),W(b,-GW,BH),2*GW*k,BH*k);
      q(W(e,-GW,GH),W(e,GW,GH),W(b,GW,BH),W(b,-GW,BH),2*GW*k,D*k);
      [-1,1].forEach(function(t){ q(W(e,t*GW,0),W(b,t*GW,0),W(b,t*GW,BH),W(e,t*GW,GH),D*k,GH*k); });
    });
    var cv=document.createElement('canvas'); cv.width=cv.height=16;
    var g=cv.getContext('2d'); g.fillStyle='rgba(245,245,240,0.9)'; g.fillRect(0,0,16,2); g.fillRect(0,0,2,16);
    var tex=new T.CanvasTexture(cv); tex.wrapS=tex.wrapT=T.RepeatWrapping;
    var geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(NP,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(NUV,2));
    geo.computeBoundingSphere();
    var nm=new T.Mesh(geo,new T.MeshBasicMaterial({map:tex,transparent:true,opacity:0.8,depthWrite:false,side:T.DoubleSide}));
    nm.frustumCulled=false; nm.userData.noShadow=true; nm.raycast=function(){}; scene.add(nm);
  })();

  /* ================= the grandstand ================= */
  var SU0=-33, SU1=33, V0=37.0, RD=0.68, NR=14, RY=0.52, Y0=1.6, BACK=V0+NR*RD, CY=Y0+(NR-1)*RY+0.45;
  var SECT=[[-33,-24.1],[-22.9,-14.7],[-13.5,-5.3],[-4.1,4.1],[5.3,13.5],[14.7,22.9],[24.1,33]];
  var SEATS=[];
  (function(){
    /* apron along the front, the red front wall and its white rail */
    flat(MG,R(-38.6,60,TVS,36.6),0.10,CONCD,1);
    box(SU0,SU1,36.6,V0,0,Y0,RED,0.66);
    box(SU0,SU1,36.6,36.75,Y0,Y0+0.95,0xE8E8E4,0.85);
    box(SU0,SU1,36.62,36.73,Y0+0.95,Y0+1.02,0xE8E8E4,0.9);
    /* rows: concrete treads, seats and backs in each section (the aisles stay bare) */
    for(var r=0;r<NR;r++){
      var va=V0+r*RD, vb=va+RD, y=Y0+r*RY;
      box(SU0,SU1,va,vb,0,y,CONC,0.6,CONCD);
      for(var s=0;s<SECT.length;s++){
        var a=SECT[s][0]+0.15, b=SECT[s][1]-0.15;
        box(a,b,vb-0.5,vb-0.12,y,y+0.2,SEAT,0.75);
        box(a,b,vb-0.14,vb-0.04,y,y+0.56,SEATD,0.7,SEAT);
        if(r<12||a>23||b<-23) for(var u=a+0.35;u<b-0.2;u+=0.62) SEATS.push([u,vb-0.33,y+0.2,r]);
      }
    }
    /* the back concourse behind the top row */
    box(SU0,SU1,BACK,48.0,0,CY,CONC,0.6,0xC9C3B8);
    solid(R(SU0,SU1,36.6,48.0),CY);
    /* the back: brick, cast stone base, arches in cast stone surrounds, band, windows, cap */
    box(SU0,SU1,48.0,48.15,0,0.7,CAST,0.7);
    box(SU0,SU1,47.9,48.0,0.7,CY+0.9,BRICK,0.6);
    box(SU0,SU1,48.0,48.12,4.5,4.78,CAST,0.75);
    box(SU0,SU1,47.9,48.25,CY+0.9,CY+1.25,CAST,0.8,0xF0E8D8);
    var nx=DV[0], nz=DV[1], dx=-nz, dz=nx;
    for(var k=0;k<13;k++){
      var c=P(-30+k*5,48.0);
      archFace(M,c[0],c[1],dx,dz,nx*0.03,nz*0.03,0.7,3.5,2.0,1.75,CAST,0.95);
      archFace(M,c[0],c[1],dx,dz,nx*0.05,nz*0.05,0.7,2.8,2.0,1.4,DARK,0.9);
      archFace(M,c[0],c[1],dx,dz,nx*0.03,nz*0.03,5.4,2.6,2.6,0,CAST,0.95);
      archFace(M,c[0],c[1],dx,dz,nx*0.05,nz*0.05,5.55,2.2,2.3,0,0x2E3A40,0.95);
    }
    for(k=0;k<14;k++) box(-32.5+k*5-0.32,-32.5+k*5+0.32,48.0,48.28,0.7,CY+0.9,BRICK,0.62,BRICKD);
    /* west end: the tall red tower; east end: the lower red block */
    solid(box(-38.6,-33,36.2,48.0,0,18.2,RED,0.62,REDD),18.2);
    box(-38.8,-32.8,36.0,48.2,18.2,18.55,CAST,0.8);
    for(k=0;k<5;k++){ box(-36.6,-35.0,47.98,48.08,2+k*3.4,3.6+k*3.4,0x2E3A40,0.9); box(-38.68,-38.6,40,44,2+k*3.4,3.6+k*3.4,0x2E3A40,0.9); }
    solid(box(33,37,36.2,48.0,0,CY+1.6,RED,0.62,REDD),CY+1.6);
    box(32.9,37.2,36.0,48.2,CY+1.6,CY+1.9,CAST,0.8);
    /* the press box: glass between red end caps, the roof slab and its fascia */
    var PT=CY+3.5, RT=PT+0.55;
    box(-22,22,45.6,49.6,CY,PT,GLASS,0.85,WHITE);
    for(var u2=-22;u2<=22.01;u2+=2.2) box(u2-0.06,u2+0.06,45.5,45.62,CY,PT,METAL,0.85);
    box(-22,22,45.5,45.62,CY,CY+0.3,METAL,0.85);
    box(-24.2,-22,45.4,49.8,CY,RT,RED,0.62); box(22,24.2,45.4,49.8,CY,RT,RED,0.62);
    box(-24.6,24.6,42.75,50.2,PT,RT,WHITE,0.72);
    box(-24.6,24.6,42.45,42.75,PT-0.35,RT+0.55,WHITE,0.8);
    /* the fascia: unlit, so the name reads from the pitch even with the band in shade */
    (function(){
      var cv=document.createElement('canvas'); cv.width=2048; cv.height=64;
      var g=cv.getContext('2d'); g.fillStyle='#F4F4F0'; g.fillRect(0,0,2048,64);
      g.font='600 46px Georgia,"Times New Roman",serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#3A3E44';
      g.fillText('R A W L I N S O N   S T A D I U M',1024,35,1300);
      var tx=new T.CanvasTexture(cv); tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      var m=new T.Mesh(new T.PlaneGeometry(49.2,RT+0.55-PT+0.35),new T.MeshBasicMaterial({map:tx,color:0xE2E2DE}));
      var fc=P(0,42.42); m.position.set(fc[0],(PT-0.35+RT+0.55)/2,fc[1]); m.rotation.y=Math.atan2(-DV[0],-DV[1]);
      m.raycast=function(){}; m.frustumCulled=false; scene.add(m);
    })();
    /* the roof terrace: a rail all round and red umbrellas */
    var rail=[[-24.4,42.9],[24.4,42.9],[24.4,50.0],[-24.4,50.0],[-24.4,42.9]];
    for(k=0;k<rail.length-1;k++){
      var A=P(rail[k][0],rail[k][1]), B=P(rail[k+1][0],rail[k+1][1]);
      segBox(M,A,B,RT+1.0,RT+1.1,0.08,METAL,0.85);
      var L=Math.hypot(B[0]-A[0],B[1]-A[1]), np=Math.round(L/2);
      for(var j=0;j<np;j++){ var t2=j/np; postAt(M,A[0]+(B[0]-A[0])*t2,A[1]+(B[1]-A[1])*t2,RT,RT+1.05,0.035,METAL,0.85); }
    }
    for(k=0;k<6;k++){ var uu=-17.5+k*7, pc=P(uu,47.4);
      postAt(M,pc[0],pc[1],RT,RT+2.15,0.04,0xEDEDED,0.85);
      box(uu-1.25,uu+1.25,46.15,48.65,RT+2.05,RT+2.2,0xC0222E,0.75);
      box(uu-0.8,uu+0.8,46.6,48.2,RT+2.2,RT+2.4,0xC0222E,0.8);
    }
  })();

  /* ================= paving: the concourse behind the gate, the gate apron, the back walk ================= */
  flat(MG,R(37,60,TVS,44.6),0.10,CONC,1);
  flat(MG,R(36,46,44.6,50.5),0.10,CONC,1);
  flat(MG,R(-38.6,36,48.0,50.5),0.10,CONC,0.96);

  /* ================= the entrance gateway ================= */
  (function(){
    var G0=37.0, G1=45.0, GV0=43.9, GV1=45.3, OW=4.4, SPR=4.2, HA=2.2, HD=9.6, ST=0xF2EADA;
    var o0=41-OW/2, o1=41+OW/2;
    solid(box(G0,o0,GV0,GV1,0,HD,ST,0.66,CASTD),HD);
    solid(box(o1,G1,GV0,GV1,0,HD,ST,0.66,CASTD),HD);
    box(G0-0.15,G1+0.15,GV0-0.15,GV1+0.15,HD,11.5,ST,0.66,0xF6F0E4);
    box(G0-0.3,G1+0.3,GV0-0.3,GV1+0.3,11.5,11.8,CASTD,0.75);
    box(G0-0.1,G1+0.1,GV0-0.1,GV1+0.1,0,0.5,CASTD,0.7);
    box(o0,o1,GV0,GV1,SPR+HA+0.05,HD,ST,0.66);
    /* the arch: thin slices under the solid head, and a cast stone ring proud of both faces */
    var N=24;
    for(var i=0;i<N;i++){
      var ua=o0+OW*i/N, ub=o0+OW*(i+1)/N, um=(ua+ub)/2-41, x=Math.min(1,Math.abs(um)/(OW/2)), yy=SPR+HA*Math.sqrt(1-x*x);
      box(ua,ub,GV0,GV1,yy,SPR+HA+0.06,ST,0.66);
      box(ua,ub,GV0-0.12,GV0,yy,yy+0.45,CASTD,0.75); box(ua,ub,GV1,GV1+0.12,yy,yy+0.45,CASTD,0.75);
    }
    /* brick panels in the piers */
    [[G0+0.35,o0-0.35],[o1+0.35,G1-0.35]].forEach(function(q){
      box(q[0],q[1],GV1,GV1+0.06,1.0,8.8,BRICK,0.6); box(q[0],q[1],GV0-0.06,GV0,1.0,8.8,BRICK,0.6); });
    /* iron gates standing open */
    [o0,o1].forEach(function(u,i){ var s=i?-1:1;
      box(u+s*0.05,u+s*0.12,GV0-2.1,GV0,0.05,3.3,IRON,0.8); });
    var a=P(41,GV1+0.15), b=P(41,GV0-0.15);
    facadeText('RAWLINSON STADIUM',a[0],a[1],DV[0],DV[1],10.55,8.0,0.95,'#3A332C');
    facadeText('RAWLINSON STADIUM',b[0],b[1],-DV[0],-DV[1],10.55,8.0,0.95,'#3A332C');
  })();

  /* ================= the fence: iron pickets on a brick kerb, brick piers ================= */
  (function(){
    var line=[[-38.6,36.3],[-60.2,36.3],[-60.2,-37.7],[60.2,-37.7],[60.2,44.6],[45.0,44.6]];
    var FPOS=[], FUV=[], FH=2.3, KB=0.45, U=0, run=0, nextP=0, PIER=9;
    function pier(x,z){
      prism(M,sq(x,z,0.3),0,2.55,BRICK,BRICK,0.6);
      prism(M,sq(x,z,0.38),2.55,2.7,CAST,CAST,0.75);
      solid(sq(x,z,0.38),2.7);
    }
    for(var i=0;i<line.length-1;i++){
      var A=P(line[i][0],line[i][1]), B=P(line[i+1][0],line[i+1][1]);
      var L=Math.hypot(B[0]-A[0],B[1]-A[1]);
      segBox(M,A,B,0,KB,0.34,BRICK,0.6); segBox(M,A,B,KB,KB+0.06,0.4,CAST,0.8);
      FPOS.push(A[0],KB,A[1], B[0],KB,B[1], B[0],FH,B[1],  A[0],KB,A[1], B[0],FH,B[1], A[0],FH,A[1]);
      FUV.push(U,0, U+L/1.2,0, U+L/1.2,1,  U,0, U+L/1.2,1, U,1);
      U+=L/1.2; U-=Math.floor(U);
      var ux=(B[0]-A[0])/L, uz=(B[1]-A[1])/L;
      solid(ccw([[A[0]-uz*0.18,A[1]+ux*0.18],[B[0]-uz*0.18,B[1]+ux*0.18],[B[0]+uz*0.18,B[1]-ux*0.18],[A[0]+uz*0.18,A[1]-ux*0.18]]),FH);
      while(nextP<=run+L){ var t=(nextP-run)/L; pier(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t); nextP+=PIER; }
      run+=L;
    }
    var E=P(line[line.length-1][0],line[line.length-1][1]); pier(E[0],E[1]);
    var cv=document.createElement('canvas'); cv.width=128; cv.height=256;
    var g=cv.getContext('2d'), py=256/(FH-KB);
    for(var k=0;k<8;k++){ var cx=k*16+8;
      g.fillStyle='#17181a'; g.fillRect(cx-2,12,4,244);
      g.beginPath(); g.moveTo(cx-3,15); g.lineTo(cx,0); g.lineTo(cx+3,15); g.closePath(); g.fill(); }
    g.fillStyle='#17181a'; g.fillRect(0,256-1.6*py,128,6); g.fillRect(0,250,128,6);
    var tex=new T.CanvasTexture(cv); tex.wrapS=T.RepeatWrapping; tex.wrapT=T.ClampToEdgeWrapping;
    tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    var geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(FPOS,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(FUV,2));
    geo.computeBoundingSphere();
    var fm=new T.Mesh(geo,new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:0.03,depthWrite:false,side:T.DoubleSide}));
    fm.frustumCulled=false; fm.renderOrder=1; fm.userData.noShadow=true; fm.raycast=function(){}; scene.add(fm);
  })();

  /* ================= light masts, team benches ================= */
  [[-44,-41.5],[44,-41.5],[-46,41],[57,41]].forEach(function(q){
    var p=P(q[0],q[1]), x=p[0], z=p[1], h=24;
    postAt(M,x,z,0,1.3,0.46,0x9A958A,0.6); postAt(M,x,z,0,h,0.22,0xD3CFC4,0.62);
    var fv=q[1]<0?1:-1;
    box(q[0]-2.9,q[0]+2.9,q[1]+fv*0.1-0.5,q[1]+fv*0.1+0.5,h,h+1.7,0x3A3C40,0.7);
    for(var k=-2;k<=2;k++) for(var j=0;j<2;j++) box(q[0]+k*1.15-0.42,q[0]+k*1.15+0.42,q[1]+fv*0.62-0.08,q[1]+fv*0.62+0.08,h+0.1+j*0.8,h+0.8+j*0.8,0xF7F2DE,0.95);
    solid(sq(x,z,0.6),h);
  });
  [-1,1].forEach(function(s){
    var u0=s>0?5:-14, u1=s>0?14:-5;
    box(u0,u1,-36.9,-36.75,0,2.1,0x30353A,0.7);
    box(u0-0.1,u1+0.1,-36.95,-35.2,2.05,2.15,0x9FB0B8,0.85);
    box(u0,u0+0.08,-36.9,-35.3,0,2.1,0x30353A,0.7); box(u1-0.08,u1,-36.9,-35.3,0,2.1,0x30353A,0.7);
    box(u0+0.2,u1-0.2,-36.7,-36.2,0.42,0.52,s>0?0x2353B5:RED,0.8);
    solid(R(u0,u1,-36.95,-35.2),2.1);
  });

  /* ================= the scoreboard (redrawn only when someone scores) ================= */
  var board=document.createElement('canvas'); board.width=512; board.height=232;
  var bctx=board.getContext('2d'), btex=new T.CanvasTexture(board);
  function drawBoard(sc){
    var g=bctx; g.fillStyle='#0F1113'; g.fillRect(0,0,512,232);
    g.fillStyle='#8E1B2A'; g.fillRect(0,0,512,46);
    g.font='bold 30px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#F2C230';
    g.fillText('RAWLINSON STADIUM',256,24,490);
    [['USC','#A4202F',sc[0]],['VISITORS','#2353B5',sc[1]]].forEach(function(t,i){
      var y=92+i*78;
      g.fillStyle=t[1]; g.fillRect(24,y-28,22,56);
      g.textAlign='left'; g.font='bold 44px Arial,sans-serif'; g.fillStyle='#F4F1EA'; g.fillText(t[0],60,y,300);
      g.textAlign='right'; g.font='bold 64px "Courier New",monospace'; g.fillStyle='#FFB52E'; g.fillText(String(t[2]),488,y+2);
    });
    btex.needsUpdate=true;
  }
  (function(){
    var bu=36, bv=-42.4;
    [bu-4.6,bu+4.6].forEach(function(u){ var p=P(u,bv); postAt(M,p[0],p[1],0,4.6,0.18,0x3A3D42,0.7); solid(sq(p[0],p[1],0.2),4.6); });
    box(bu-5.8,bu+5.8,bv-0.35,bv+0.15,4.4,10.0,0x24272B,0.7);
    var p=P(bu,bv+0.16), m=new T.Mesh(new T.PlaneGeometry(11.0,5.0),new T.MeshBasicMaterial({map:btex,color:0xF0F0F0}));
    m.position.set(p[0],7.2,p[1]); m.rotation.y=Math.atan2(DV[0],DV[1]); m.raycast=function(){}; m.frustumCulled=false; scene.add(m);
    drawBoard([0,0]);
  })();

  /* ================= build the static pieces ================= */
  cols.forEach(function(c){ addCollider(c[0],c[1]); });
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  var mw=new T.Mesh(M.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);

  /* ================================================================
     The match. Players are built like the students (e_crowd.js): head,
     body, two arms, two legs, each an instanced mesh with white kit
     parts tinted per instance (jersey on body and arms, shorts and socks
     on the legs). Slots 0..10 USC, 11..21 the blue team (0 and 11 the
     keepers), 22 the referee, then the fans in the stand.
     ================================================================ */
  function Bag(){ this.p=[]; this.n=[]; this.c=[]; }
  Bag.prototype.add=function(geo,mat,hex){
    var g=geo.index?geo.toNonIndexed():geo, pos=g.attributes.position, nor=g.attributes.normal,
        nm=new T.Matrix3().getNormalMatrix(mat), v=new T.Vector3(), c=new T.Color(hex);
    for(var j=0;j<pos.count;j++){
      v.fromBufferAttribute(pos,j).applyMatrix4(mat); this.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(nor,j).applyMatrix3(nm).normalize(); this.n.push(v.x,v.y,v.z);
      this.c.push(c.r,c.g,c.b);
    }
  };
  Bag.prototype.geom=Mesher.prototype.geom;
  function MT(x,y,z,sx,sy,sz){ return new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion(),new T.Vector3(sx||1,sy||1,sz||1)); }
  var head=new Bag(), body=new Bag(), arm=new Bag(), leg=new Bag();
  head.add(new T.IcosahedronGeometry(0.37,0),MT(0,0.37,0,1.0,1.03,0.95),0xFFFFFF);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT(-0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT( 0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.IcosahedronGeometry(0.385,0),MT(0,0.415,0.045,1.0,0.86,0.98),0x3A281C);
  body.add(new T.CylinderGeometry(0.300,0.360,0.42,8),MT(0,0.21,0),0xFFFFFF);
  body.add(new T.CylinderGeometry(0.205,0.24,0.05,8),MT(0,0.43,0),0xE8E8E8);
  arm.add(new T.CylinderGeometry(0.082,0.072,0.29,5),MT(0,-0.145,0),0xFFFFFF);
  leg.add(new T.CylinderGeometry(0.105,0.098,0.26,5),MT(0,-0.13,0),0xFFFFFF);
  leg.add(new T.BoxGeometry(0.195,0.115,0.25),MT(0,-0.305,-0.03),0x3A3A3A);

  var SKIN=[0xF7DCC2,0xF0C6A0,0xE3AC82,0xCE9163,0xB27548,0x915934,0x714128,0x54301D];
  var NPL=23, seed=7;
  function srnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  var fans=[];
  for(var i=0;i<SEATS.length;i++) if(srnd()<0.15) fans.push(SEATS[i]);
  var NI=NPL+fans.length;
  var mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  function mk(g){ var m=new T.InstancedMesh(g.geom(),mat,NI); m.frustumCulled=false;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.raycast=function(){}; scene.add(m); return m; }
  var IH=mk(head), IB=mk(body), IAL=mk(arm), IAR=mk(arm), ILL=mk(leg), ILR=mk(leg), PARTS=[IH,IB,IAL,IAR,ILL,ILR];
  var col=new T.Color();
  function tint(m,i,hex){ col.setHex(hex); m.setColorAt(i,col); }
  var KIT=[[0xA4202F,0xF2C230],[0x2353B5,0xF2F2EE]], KEEP=[[0x2FA84F,0x1E1E1E],[0xF0D530,0x1E1E1E]];
  for(i=0;i<NI;i++){
    var sk=SKIN[(srnd()*SKIN.length)|0], j1, l1;
    if(i<22){ var t=i<11?0:1; j1=i%11===0?KEEP[t][0]:KIT[t][0]; l1=i%11===0?KEEP[t][1]:KIT[t][1]; }
    else if(i===22){ j1=0x1C1C1C; l1=0x1C1C1C; }
    else { var r=srnd(); j1=r<0.45?0xA4202F:(r<0.75?0xF2C230:(r<0.88?0xF2F2EE:0x5A5E66)); l1=[0x3B4F72,0xB8A47E,0x2A2A2E,0x6B7A8F][(srnd()*4)|0]; }
    tint(IH,i,sk); tint(IB,i,j1); tint(IAL,i,j1); tint(IAR,i,j1); tint(ILL,i,l1); tint(ILR,i,l1);
  }
  PARTS.forEach(function(m){ m.instanceColor.needsUpdate=true; });
  var ballM=new T.Mesh(new T.IcosahedronGeometry(0.17,1),new T.MeshLambertMaterial({color:0xF6F6F2,flatShading:true}));
  ballM.castShadow=true; ballM.raycast=function(){}; scene.add(ballM);

  /* ---- pose: the same joints as the students ---- */
  var _r=new T.Matrix4(), _p=new T.Matrix4(), _o=new T.Matrix4(), _q=new T.Quaternion(), _v=new T.Vector3(), _s=new T.Vector3(1,1,1), _e=new T.Euler();
  function part(m,i,x,y,z,rx){ _e.set(rx,0,0); _q.setFromEuler(_e); _p.compose(_v.set(x,y,z),_q,_s); m.setMatrixAt(i,_o.multiplyMatrices(_r,_p)); }
  function root(i,u,v,y,fu,fv,sc){
    var p=P(u,v), wx=fu*DU[0]+fv*DV[0], wz=fu*DU[1]+fv*DV[1];
    _e.set(0,Math.atan2(-wx,-wz),0); _q.setFromEuler(_e); _s.set(sc,sc,sc);
    _r.compose(_v.set(p[0],y,p[1]),_q,_s); _s.set(1,1,1);
  }
  function poseRun(i,u,v,fu,fv,ph,amp,jump,kick){
    var sw=Math.sin(ph)*amp, bob=Math.abs(Math.cos(ph))*0.06*amp;
    root(i,u,v,0.13+bob+jump,fu,fv,1.08);
    part(IB,i,0,0.34,0,-0.08*amp); part(IH,i,0,0.735,0,sw*0.04);
    var up=jump>0.02?2.6:0;
    part(IAL,i,-0.295,0.74,0,up||-sw*0.9); part(IAR,i,0.295,0.74,0,up||sw*0.9);
    part(ILL,i,-0.125,0.36,0,sw*1.0);
    part(ILR,i,0.125,0.36,0,kick>0?1.4*Math.sin(Math.PI*(1-kick/0.28)):-sw*1.0);
  }
  function poseFan(i,f,cheer,t){
    var hop=cheer?Math.max(0,Math.sin(t*9+f[0]*3.1))*0.18:0;
    root(i,f[0],f[1],f[2]-0.34+hop,0,-1,1.0);
    part(IB,i,0,0.34,0,-0.05); part(IH,i,0,0.735,0,0);
    var ar=cheer?2.7+Math.sin(t*11+f[0])*0.3:0.55;
    part(IAL,i,-0.295,0.74,0,ar); part(IAR,i,0.295,0.74,0,ar);
    part(ILL,i,-0.125,0.36,0,1.25); part(ILR,i,0.125,0.36,0,1.15);
  }
  for(i=0;i<fans.length;i++) poseFan(NPL+i,fans[i],false,0);

  /* ---- the players: red (t 0) attacks +u, blue (t 1) attacks -u ---- */
  var FORM=[[-0.94,0],[-0.64,-0.62],[-0.7,-0.21],[-0.7,0.21],[-0.64,0.62],[-0.33,-0.6],[-0.38,-0.19],[-0.38,0.19],[-0.33,0.6],[-0.1,-0.24],[-0.1,0.24]];
  var PL=[];
  for(i=0;i<23;i++){
    var tm=i<11?0:(i<22?1:2), k=i%11, d=tm===0?1:-1, f=FORM[k];
    PL.push({t:tm,k:k,d:d,gk:k===0&&tm<2,hu:tm<2?f[0]*HL*d:0,hv:tm<2?f[1]*HW*d:-20,u:0,v:0,fu:d,fv:0,spd:0,
             sp:4.9+Math.random()*1.3,ph:Math.random()*6,kcd:0,kick:0,hold:0,jump:0});
  }
  var ball={u:0,v:0,h:0,vu:0,vv:0,vh:0,own:-1,last:0,to:-1,shot:0,saved:0}, score=[0,0], ST={pass:0,shot:0,tackle:0,out:0,save:0,inter:0};
  var gs=2, gt=2.5, kickT=0, taker=-1, scorer=0, clock=0, near=true, cheerOn=false;
  function clamp(x,a,b){ return x<a?a:(x>b?b:x); }
  function kickoffSpot(p){
    if(p.t===2) return [0,-HW+2];
    var u=p.hu*0.85, v=p.hv;
    if(p.d*u>-1.5) u=-p.d*1.5-(p.k>8?0:6);
    if(p.t===kickT&&p.k===10) return [-p.d*0.6,0];
    if(p.t===kickT&&p.k===9) return [-p.d*1.2,-7];
    if(p.t!==kickT&&Math.hypot(u,v)<9.6){ var a=Math.atan2(v,u); u=Math.cos(a)*9.8; v=Math.sin(a)*9.8; }
    return [u,v];
  }
  for(i=0;i<23;i++){ var ks=kickoffSpot(PL[i]); PL[i].u=ks[0]; PL[i].v=ks[1]; }
  function turn(p,nu,nv,k){ k=Math.min(1,k); p.fu+=(nu-p.fu)*k; p.fv+=(nv-p.fv)*k; var l=Math.hypot(p.fu,p.fv)||1; p.fu/=l; p.fv/=l; }
  function moveTo(p,tu,tv,mx,dt){
    var a=tu-p.u, b=tv-p.v, L=Math.hypot(a,b), want=L<0.25?0:Math.min(mx,L*1.8);
    p.spd+=(want-p.spd)*Math.min(1,dt*3.2);
    if(L>0.05) turn(p,a/L,b/L,dt*(p.spd>3?6:9));
    p.u+=p.fu*p.spd*dt; p.v+=p.fv*p.spd*dt;
  }
  function faceBall(p,dt){ var a=ball.u-p.u, b=ball.v-p.v, L=Math.hypot(a,b); if(L>0.3&&p.spd<1) turn(p,a/L,b/L,dt*4); }
  function take(i){ var p=PL[i]; if(ball.last!==p.t&&ball.to>=0) ST.inter++; ball.own=i; ball.to=-1; ball.shot=0; ball.last=p.t; ball.h=0; ball.vh=0;
    p.hold=p.gk?1.0+Math.random():0.5+Math.random()*1.8; }
  function kickTo(p,tu,tv,spd,loft){
    var a=tu-ball.u, b=tv-ball.v, L=Math.hypot(a,b)||1;
    ball.own=-1; ball.vu=a/L*spd; ball.vv=b/L*spd; ball.vh=loft; ball.h=0.01; ball.last=p.t;
    p.kcd=0.5; p.kick=0.28; p.fu=a/L; p.fv=b/L;
  }
  function oppNear(p){ var best=1e9, o=(1-p.t)*11; for(var j=o;j<o+11;j++){ var q=PL[j], d2=Math.hypot(q.u-p.u,q.v-p.v); if(d2<best) best=d2; } return best; }
  /* how close the nearest opponent stands to the line of a pass from p to q */
  function lane(p,q){
    var a=q.u-p.u, b=q.v-p.v, L2=a*a+b*b||1, best=1e9, o=(1-p.t)*11;
    for(var j=o;j<o+11;j++){ var r=PL[j], t=clamp(((r.u-p.u)*a+(r.v-p.v)*b)/L2,0,1),
      x=p.u+a*t-r.u, y=p.v+b*t-r.v, d2=x*x+y*y; if(d2<best) best=d2; }
    return Math.sqrt(best)-2;
  }
  /* is there room to run at goal: nobody within 7 m in front */
  function room(p){
    for(var j=(1-p.t)*11;j<(1-p.t)*11+11;j++){ var r=PL[j], a=(r.u-p.u)*p.d, b=r.v-p.v; if(a>-1&&a<7&&Math.abs(b)<4) return false; }
    return true;
  }
  function pass(p,long){
    var best=-1e9, bi=-1, o=p.t*11;
    for(var j=o+1;j<o+11;j++){ var q=PL[j]; if(q===p) continue;
      var dd=Math.hypot(q.u-p.u,q.v-p.v); if(dd<5||dd>(long?48:34)) continue;
      var sc=p.d*(q.u-p.u)*0.5-Math.abs(dd-(long?28:15))*0.3+Math.min(8,oppNear(q))*1.1+(lane(p,q)<0?-9:Math.min(4,lane(p,q))*2)+Math.random()*5;
      if(sc>best){ best=sc; bi=j; } }
    if(bi<0){ kickTo(p,p.u+p.d*20,p.v*0.5,13,1.5); return; }
    var r=PL[bi], tu=r.u+r.fu*r.spd*0.7, tv=r.v+r.fv*r.spd*0.7, dd2=Math.hypot(tu-p.u,tv-p.v);
    kickTo(p,tu,tv,clamp(dd2*0.8+7,9,22),dd2>24?4.5:0);
    ball.to=bi; ST.pass++;
  }
  function shoot(p){
    kickTo(p,p.d*(HL+1),clamp(Math.random()*(2*GW-1)-GW+0.5+(Math.random()-0.5)*4,-9,9),17+Math.random()*6,0.5+Math.random()*3.2);
    ball.shot=1; ball.saved=0; ST.shot++;
  }
  function restartAt(u,v,t,gk){
    gs=3; gt=1.6; ST.out++; ball.u=u; ball.v=v; ball.vu=ball.vv=ball.vh=0; ball.h=0; ball.own=-1; ball.to=-1; ball.shot=0;
    if(gk){ taker=t*11; return; }
    var best=1e9; for(var j=t*11+1;j<t*11+11;j++){ var d2=Math.hypot(PL[j].u-u,PL[j].v-v); if(d2<best){ best=d2; taker=j; } }
  }
  function goal(t){ score[t]++; drawBoard(score); gs=1; gt=4.5; kickT=1-t; scorer=t; ball.to=-1; ball.shot=0; }
  /* where a player stands when his side has the ball, or not */
  function shape(p,dt,mx){
    var poss=ball.own>=0?PL[ball.own].t:-1, push=(poss===p.t?0.3:(poss<0?0.05:-0.1))*(p.k<5?0.6:1);
    var tu=clamp(p.hu+ball.u*0.5+p.d*HL*push+Math.sin(clock*0.3+p.k*1.7)*2,-HL+2,HL-2),
        tv=clamp(p.hv*0.9+ball.v*0.3+Math.cos(clock*0.27+p.k*2.3)*2,-HW+1.5,HW-1.5);
    moveTo(p,tu,tv,mx,dt); faceBall(p,dt);
  }
  function keeper(p,dt){
    var gu=-p.d*(HL-1.2), gv=clamp(ball.v*0.18,-2.6,2.6);
    if(ball.own<0&&ball.shot&&ball.vu*p.d<0){ var tt=(gu-ball.u)/(ball.vu||1e-3); if(tt>0&&tt<2) gv=clamp(ball.v+ball.vv*tt,-GW,GW); }
    moveTo(p,gu,gv,ball.shot?6.5:4,dt); faceBall(p,dt);
    if(ball.own<0&&ball.shot&&!ball.saved&&Math.hypot(p.u-ball.u,p.v-ball.v)<1.9&&ball.h<2.6){
      ball.saved=1; if(Math.random()<0.45){ take(PL.indexOf(p)); p.jump=0.35; ST.save++; } }
  }
  function play(dt){
    var b=ball, i, p;
    if(b.own<0){
      if(Math.abs(b.u)>HL){
        var s=b.u>0?1:-1;
        if(Math.abs(b.v)<GW-0.1&&b.h<GH){ goal(s>0?0:1); return; }
        restartAt(s*(HL-5.5),0,s>0?1:0,true); return;
      }
      if(Math.abs(b.v)>HW){ restartAt(clamp(b.u,-HL+1,HL-1),(b.v>0?1:-1)*HW,1-b.last,false); return; }
      if(b.to>=0&&Math.hypot(b.vu,b.vv)<0.8) b.to=-1;
    }
    var ch=[-1,-1];
    for(var t=0;t<2;t++){
      if(b.own>=0&&PL[b.own].t===t) continue;
      if(b.own<0&&b.to>=0&&PL[b.to].t===t){ ch[t]=b.to; continue; }
      var best=1e9, pu=b.u+b.vu*0.35, pv=b.v+b.vv*0.35;
      for(i=t*11+1;i<t*11+11;i++){ p=PL[i]; var d2=(p.u-pu)*(p.u-pu)+(p.v-pv)*(p.v-pv); if(d2<best){ best=d2; ch[t]=i; } }
      var g=PL[t*11];
      if(b.own<0&&!b.shot&&-g.d*b.u>HL-16&&Math.abs(b.v)<18&&Math.hypot(g.u-b.u,g.v-b.v)<Math.sqrt(best)) ch[t]=t*11;
    }
    for(i=0;i<22;i++){ p=PL[i];
      if(i===b.own){ dribble(p,dt); continue; }
      if(i===ch[p.t]){
        var o=b.own>=0?PL[b.own]:null;
        moveTo(p,o?o.u+o.fu*0.6:b.u+b.vu*0.3,o?o.v+o.fv*0.6:b.v+b.vv*0.3,o?p.sp*0.88:p.sp,dt);
        if(!o&&p.kcd<=0&&b.h<0.9&&Math.hypot(p.u-b.u,p.v-b.v)<0.8) take(i);
        else if(o&&Math.hypot(p.u-o.u,p.v-o.v)<1.0&&Math.random()<dt*0.7){
          ST.tackle++; b.own=-1; b.vu=p.fu*4+(Math.random()-0.5)*4; b.vv=p.fv*4+(Math.random()-0.5)*4; o.kcd=0.9; p.kcd=0.15; b.last=p.t; }
        continue;
      }
      if(p.gk){ keeper(p,dt); continue; }
      shape(p,dt,p.sp*0.72);
    }
  }
  function dribble(p,dt){
    p.hold-=dt;
    if(p.gk){ p.spd*=0.9; turn(p,p.d,0,dt*3); if(p.hold<=0) pass(p,true); return; }
    var gu=p.d*HL, dg=Math.hypot(gu-p.u,p.v), on=oppNear(p);
    if(p.d*p.u>HL-9){ if(Math.abs(p.v)<20) shoot(p); else pass(p,false); return; }
    if(dg<30&&(p.hold<=0||on<2.6||dg<18)&&Math.random()<dt*3){ shoot(p); return; }
    if(p.hold<=0&&room(p)&&on>3) p.hold=0.4;
    if(p.hold<=0||(on<2.2&&Math.random()<dt*4)){ pass(p,false); return; }
    moveTo(p,p.u+p.d*8,clamp(p.v*0.7+Math.sin(clock*0.8+p.k)*5,-HW+3,HW-3),p.sp*0.86,dt);
  }
  function step(dt){
    var b=ball, i, j, p;
    clock+=dt; gt-=dt;
    for(i=0;i<23;i++){ p=PL[i]; p.kcd-=dt; if(p.kick>0) p.kick-=dt; if(p.jump>0&&gs!==1) p.jump=Math.max(0,p.jump-dt*1.5); }
    /* the ball */
    if(b.own<0){
      b.u+=b.vu*dt; b.v+=b.vv*dt;
      if(b.h>0||b.vh>0){ b.vh-=9.8*dt; b.h+=b.vh*dt; if(b.h<=0){ b.h=0; b.vh=b.vh<-1.5?-b.vh*0.45:0; } }
      var fr=Math.exp(-(b.h>0?0.12:0.85)*dt); b.vu*=fr; b.vv*=fr;
      if(Math.abs(b.u)>HL+1.7){ b.u=(b.u>0?1:-1)*(HL+1.7); b.vu=0; b.vv*=0.3; }
    } else { var o=PL[b.own]; b.u=o.u+o.fu*0.55; b.v=o.v+o.fv*0.55; b.h=0; b.vu=o.fu*o.spd; b.vv=o.fv*o.spd; }
    if(gs===0) play(dt);
    else if(gs===1){                         /* a goal: the scorers celebrate, the rest walk back */
      for(i=0;i<22;i++){ p=PL[i];
        if(p.t===scorer&&!p.gk){ moveTo(p,b.u*0.85,b.v*0.6+(p.k-5)*0.9,p.sp*0.6,dt); p.jump=Math.max(0,Math.sin(clock*7+p.k))*0.45; }
        else { var ks=kickoffSpot(p); moveTo(p,ks[0],ks[1],2.2,dt); faceBall(p,dt); } }
      if(gt<=0){ gs=2; gt=7; b.u=b.v=b.h=0; b.vu=b.vv=b.vh=0; b.own=-1; for(i=0;i<22;i++) PL[i].jump=0; }
    } else if(gs===2){                       /* walk back to the kickoff */
      var far=0;
      for(i=0;i<22;i++){ p=PL[i]; var k2=kickoffSpot(p); moveTo(p,k2[0],k2[1],3.2,dt); faceBall(p,dt);
        if(Math.hypot(p.u-k2[0],p.v-k2[1])>1.5) far++; }
      if(gt<=0||(far===0&&gt<5)){ gs=0; var kk=kickT*11+10; take(kk); PL[kk].hold=0.2; }
    } else {                                 /* a throw in or a goal kick */
      for(i=0;i<22;i++){ p=PL[i];
        if(i===taker){ var iu=b.u>0?-1:1, iv=b.v>0?-1:1, su=p.gk?b.u-iu*0.6:b.u, sv=p.gk?b.v:b.v-iv*0.6;
          moveTo(p,su,sv,p.sp,dt);
          if(gt<=0&&Math.hypot(p.u-su,p.v-sv)<1.2){ gs=0; take(i); p.hold=0.25; } }
        else if(p.gk) keeper(p,dt); else shape(p,dt,p.sp*0.6); }
    }
    /* the referee keeps up */
    var rf=PL[22]; moveTo(rf,clamp(b.u-4,-HL,HL),clamp(b.v*0.4-8,-HW+1,HW-1),5,dt); faceBall(rf,dt);
    /* nobody stands inside anybody */
    for(i=0;i<23;i++) for(j=i+1;j<23;j++){
      var a=PL[i], c=PL[j], du=c.u-a.u, dv=c.v-a.v, d2=du*du+dv*dv;
      if(d2<0.81&&d2>1e-6){ var dd=Math.sqrt(d2), push=(0.9-dd)*0.5/dd; a.u-=du*push; a.v-=dv*push; c.u+=du*push; c.v+=dv*push; }
    }
    for(i=0;i<23;i++){ p=PL[i]; p.u=clamp(p.u,-HL-3,HL+3); p.v=clamp(p.v,-HW-3,HW+3); p.ph+=dt*(1.5+p.spd*2.3); }
  }
  function draw(){
    for(var i=0;i<23;i++){ var p=PL[i]; poseRun(i,p.u,p.v,p.fu,p.fv,p.ph,Math.min(1,p.spd/2.4),p.jump,p.kick); }
    var cheer=gs===1&&scorer===0, full=cheer||cheerOn;
    if(full) for(i=0;i<fans.length;i++) poseFan(NPL+i,fans[i],cheer,clock);
    cheerOn=cheer;
    PARTS.forEach(function(m){ var a=m.instanceMatrix; a.updateRange.offset=0; a.updateRange.count=full?-1:NPL*16; a.needsUpdate=true; });
    var bp=P(ball.u,ball.v); ballM.position.set(bp[0],0.29+ball.h,bp[1]);
    ballM.rotation.x+=Math.hypot(ball.vu,ball.vv)*0.03;
  }
  draw();
  PARTS.forEach(function(m){ m.instanceMatrix.updateRange.count=-1; });
  var CX=F.O[0], CZ=F.O[1];
  updateSoccer=function(dt){
    var dx=camera.position.x-CX, dz=camera.position.z-CZ, nr=dx*dx+dz*dz<320*320;
    if(nr!==near){ near=nr; PARTS.forEach(function(m){ m.visible=nr; }); ballM.visible=nr; }
    if(!nr) return;
    dt=Math.min(dt,0.05);
    step(dt); draw();
  };
  window.__rawl={tris:M.count(),ground:MG.count(),fans:fans.length,score:score,state:function(){ return {gs:gs,ball:ball,score:score,st:ST}; }};
})();
