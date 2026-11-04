/* ==================================================================
   Practice at the Uytengsu Aquatics Center and Dedeaux Field (Jamie
   asked for swimmers and a baseball team). AQUA and DIAM in a_world.js
   are the frames.

   The pool: swimmers in caps doing freestyle laps in six lanes with flip
   turns at the walls, a coach on the deck. The diving well: divers go up
   the tower, walk out to the end of a platform, pause, and go off with a
   tuck and one or two somersaults; a splash; they swim to the wall, climb
   out and walk back to the tower. Two more go off the springboards.
   Dedeaux Field: batting practice. A pitcher behind an L screen throws to
   a batter, the catcher crouches behind the plate, the hit goes out over
   the field, the nearest fielder runs it down and throws it in to a
   collector by the screen; three pairs play catch along the foul lines,
   coaches watch. Cardinal practice tops, grey pants, cardinal caps.
   Same build as the students: instanced head, cap, swim cap, body, two
   arms, two legs, a bat, the balls and the splashes. Each place runs only
   while the camera is within 300 m of it.
   ================================================================== */
var updatePractice=function(){};
(function(){
  if(typeof AQUA==='undefined'||!AQUA||typeof DIAM==='undefined'||!DIAM) return;
  var A=AQUA, D=DIAM;

  /* ---------------- bodies ---------------- */
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
  var head=new Bag(), cap=new Bag(), scap=new Bag(), body=new Bag(), arm=new Bag(), leg=new Bag();
  head.add(new T.IcosahedronGeometry(0.37,0),MT(0,0.37,0,1.0,1.03,0.95),0xFFFFFF);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT(-0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.BoxGeometry(0.085,0.125,0.06),MT( 0.145,0.365,-0.315),0x1B1B20);
  head.add(new T.IcosahedronGeometry(0.385,0),MT(0,0.415,0.045,1.0,0.86,0.98),0x3A281C);
  cap.add(new T.IcosahedronGeometry(0.405,1),MT(0,0.47,0.03,1.0,0.62,1.02),0xFFFFFF);
  cap.add(new T.BoxGeometry(0.42,0.04,0.3),MT(0,0.5,-0.42),0xFFFFFF);
  scap.add(new T.IcosahedronGeometry(0.4,1),MT(0,0.44,0.04,1.0,0.8,1.0),0xFFFFFF);
  body.add(new T.CylinderGeometry(0.300,0.360,0.42,8),MT(0,0.21,0),0xFFFFFF);
  body.add(new T.CylinderGeometry(0.205,0.24,0.05,8),MT(0,0.43,0),0xE8E8E8);
  arm.add(new T.CylinderGeometry(0.082,0.072,0.29,5),MT(0,-0.145,0),0xFFFFFF);
  leg.add(new T.CylinderGeometry(0.105,0.098,0.26,5),MT(0,-0.13,0),0xFFFFFF);
  leg.add(new T.BoxGeometry(0.195,0.115,0.25),MT(0,-0.305,-0.03),0x3A3A3A);
  var SKIN=[0xF7DCC2,0xF0C6A0,0xE3AC82,0xCE9163,0xB27548,0x915934,0x714128,0x54301D];
  var seed=29; function srnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  var RED=0x9D2235, GOLD=0xF2C230, GREY=0xB9BBBC, NAVY=0x22293A;

  var E=[];
  function add(o){ o.ph=srnd()*6; o.spd=0; o.fx=o.fx||0; o.fz=o.fz||1; o.sc=o.sc||1.05; o.pitch=0; o.y=o.y||0; E.push(o); return o; }

  /* ---------------- the pool ---------------- */
  var SW=[], DV=[];
  [-3,-2,-1,1,2,3].forEach(function(lane,i){
    SW.push(add({site:0, kind:'swim', lane:(lane-0.5*Math.sign(lane))*2.3, u:(srnd()*2-1)*(A.hu-3), dir:srnd()<0.5?1:-1,
      sp:1.5+srnd()*0.6, jer:[NAVY,RED,0x1E1E22][i%3], pants:0, skin:1, hat:'swim', hatc:[RED,GOLD,0xF2F2EE][(i+1)%3]}));
  });
  var COACHP=add({site:0, kind:'stand', at:A.P(8,-A.hv-2.6), look:A.P(8,0), jer:RED, pants:0x2A2A2E, hat:'cap', hatc:RED});
  /* divers: platforms, then springboards */
  [0,1,2,3,4].forEach(function(k){
    DV.push(add({site:0, kind:'dive', plat:k<3?[0,1,2][k]:null, board:k>=3?k-3:null, st:'wait', t:1+k*2.3, jer:[RED,NAVY,0x1E1E22,RED,NAVY][k], pants:0, skin:1,
      hat:'swim', hatc:[GOLD,0xF2F2EE,RED,GOLD,RED][k]}));
  });

  /* ---------------- the diamond ---------------- */
  var H=D.home, CF=D.cf;
  function dirAt(t){ var a=D.a1+(D.a2-D.a1)*t; return [Math.cos(a),Math.sin(a)]; }
  function at(t,r){ var d=dirAt(t); return [H[0]+d[0]*r, H[1]+d[1]*r]; }
  var MOUND=[H[0]+CF[0]*18.44, H[1]+CF[1]*18.44], PIT=[H[0]+CF[0]*14.5, H[1]+CF[1]*14.5];
  function bb(o){ o.site=1; o.jer=o.jer||RED; o.pants=o.pants||GREY; o.hat=o.hat===undefined?'cap':o.hat; o.hatc=o.hatc||RED; return add(o); }
  var PITCHER=bb({kind:'pitch', at:PIT, look:H});
  var SIDE=[-CF[1],CF[0]];
  var BATTER=bb({kind:'bat', at:[H[0]+SIDE[0]*0.9,H[1]+SIDE[1]*0.9], look:[H[0]+SIDE[0]*0.9-SIDE[0],H[1]+SIDE[1]*0.9-SIDE[1]], jer:0x1E1E22});
  var CATCHER=bb({kind:'catch', at:[H[0]-CF[0]*1.3,H[1]-CF[1]*1.3], look:MOUND, jer:NAVY, hatc:NAVY});
  var COLLECT=bb({kind:'stand', at:[MOUND[0]+CF[0]*2.5+SIDE[0]*3,MOUND[1]+CF[1]*2.5+SIDE[1]*3], look:H, jer:GREY, pants:0x2A2A2E});
  var FIELD=[], FPOS=[[0.08,62],[0.5,66],[0.92,62],[0.18,30],[0.39,36],[0.61,36],[0.82,30]];
  FPOS.forEach(function(q){ var p=at(q[0],q[1]); FIELD.push(bb({kind:'field', home:p, at:p.slice(), look:H})); });
  bb({kind:'stand', at:[D.b1[0]+(D.b1[0]-H[0])*0.05+SIDE[0]*4,D.b1[1]+(D.b1[1]-H[1])*0.05+SIDE[1]*4], look:H, jer:0x1E1E22, pants:0xB8A47E});
  bb({kind:'stand', at:[H[0]-CF[0]*4-SIDE[0]*6,H[1]-CF[1]*4-SIDE[1]*6], look:MOUND, jer:RED, pants:0xB8A47E});
  /* pairs playing catch along the foul lines, in foul territory */
  var PAIRS=[];
  [[0.0,24,6],[0.0,40,6],[1.0,30,-6]].forEach(function(q){
    var base=at(q[0],q[1]), out=[ -dirAt(q[0])[1]*(q[2]>0?1:-1), dirAt(q[0])[0]*(q[2]>0?1:-1) ];
    var p1=[base[0]+out[0]*4,base[1]+out[1]*4], p2=[base[0]+out[0]*4+dirAt(q[0])[0]*18,base[1]+out[1]*4+dirAt(q[0])[1]*18];
    var a=bb({kind:'stand', at:p1, look:p2}), b=bb({kind:'stand', at:p2, look:p1});
    PAIRS.push({a:a,b:b,t:srnd()*2,dir:0});
  });
  var NI=E.length;

  /* ---------------- meshes ---------------- */
  var mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
  function mk(g){ var m=new T.InstancedMesh(g.geom(),mat,NI); m.frustumCulled=false;
    m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.raycast=function(){}; scene.add(m); return m; }
  var IH=mk(head), IC=mk(cap), IS=mk(scap), IB=mk(body), IAL=mk(arm), IAR=mk(arm), ILL=mk(leg), ILR=mk(leg),
      PARTS=[IH,IC,IS,IB,IAL,IAR,ILL,ILR];
  var col=new T.Color();
  function tint(m,i,hex){ col.setHex(hex); m.setColorAt(i,col); }
  E.forEach(function(p,i){
    var sk=SKIN[(srnd()*SKIN.length)|0];
    tint(IH,i,sk); tint(IC,i,p.hatc||RED); tint(IS,i,p.hatc||RED); tint(IB,i,p.jer);
    tint(IAL,i,p.skin?sk:p.jer); tint(IAR,i,p.skin?sk:p.jer); tint(ILL,i,p.skin?sk:p.pants); tint(ILR,i,p.skin?sk:p.pants);
    if(!p.at) p.at=[0,0];
    if(p.look){ var dx=p.look[0]-p.at[0], dz=p.look[1]-p.at[1], L=Math.hypot(dx,dz)||1; p.fx=dx/L; p.fz=dz/L; }
  });
  PARTS.forEach(function(m){ m.instanceColor.needsUpdate=true; });
  var NB=1+PAIRS.length;
  var balls=new T.InstancedMesh(new T.IcosahedronGeometry(0.06,1),new T.MeshLambertMaterial({color:0xF7F5EE}),NB);
  balls.instanceMatrix.setUsage(T.DynamicDrawUsage); balls.frustumCulled=false; balls.raycast=function(){}; scene.add(balls);
  var bat=new T.Mesh(new T.CylinderGeometry(0.055,0.03,0.95,6).translate(0,0.47,0),new T.MeshLambertMaterial({color:0xE6C48A,flatShading:true}));
  bat.raycast=function(){}; bat.frustumCulled=false; scene.add(bat);
  /* the L screen in front of the pitcher (static) */
  (function(){
    var M=new Mesher(), s0=[PIT[0]+CF[0]*1.2-SIDE[0]*0.9,PIT[1]+CF[1]*1.2-SIDE[1]*0.9], s1=[PIT[0]+CF[0]*1.2+SIDE[0]*0.9,PIT[1]+CF[1]*1.2+SIDE[1]*0.9];
    segBox(M,s0,s1,0.1,1.0,0.05,0x1F4A2E,0.8);
    var s2=[s0[0]+(s1[0]-s0[0])*0.5,s0[1]+(s1[1]-s0[1])*0.5];
    segBox(M,s0,s2,1.0,2.1,0.05,0x1F4A2E,0.8);
    [s0,s2,s1].forEach(function(p){ postAt(M,p[0],p[1],0,p===s1?1.0:2.1,0.03,0x2A2C30,0.8); });
    var m=new T.Mesh(M.geom(),matWorld); m.frustumCulled=false; scene.add(m);
  })();
  /* splashes */
  var SPL=[], splMat=new T.MeshBasicMaterial({color:0xF4FAFF,transparent:true,opacity:0.95,depthWrite:false});
  for(var si=0;si<5;si++){ var sm=new T.Mesh(new T.CylinderGeometry(0.25,0.6,1,10,1,true),splMat); sm.visible=false; sm.raycast=function(){}; scene.add(sm); SPL.push({m:sm,t:0}); }
  function splash(x,z,big){ for(var k=0;k<SPL.length;k++) if(!SPL[k].m.visible){ var s=SPL[k]; s.t=0; s.big=big; s.m.position.set(x,A.WY,z); s.m.visible=true; return; } }

  /* ---------------- poses ---------------- */
  var _r=new T.Matrix4(), _p=new T.Matrix4(), _o=new T.Matrix4(), _q=new T.Quaternion(), _v=new T.Vector3(), _s=new T.Vector3(1,1,1),
      _e=new T.Euler(0,0,0,'YXZ'), _z=new T.Matrix4().makeScale(0,0,0);
  function part(m,i,x,y,z,rx){ _e.set(rx,0,0); _q.setFromEuler(_e); _p.compose(_v.set(x,y,z),_q,_s); m.setMatrixAt(i,_o.multiplyMatrices(_r,_p)); }
  function root(i,x,y,z,fx,fz,sc,pitch,yawAdd){ _e.set(pitch||0,Math.atan2(-fx,-fz)+(yawAdd||0),0); _q.setFromEuler(_e); _s.set(sc,sc,sc); _r.compose(_v.set(x,y,z),_q,_s); _s.set(1,1,1); }
  function hats(i,p,hy,hz,hr){
    part(IH,i,0,hy,hz,hr);
    if(p.hat==='cap') part(IC,i,0,hy,hz,hr); else IC.setMatrixAt(i,_z);
    if(p.hat==='swim') part(IS,i,0,hy,hz,hr); else IS.setMatrixAt(i,_z);
  }
  function hide(i){ PARTS.forEach(function(m){ m.setMatrixAt(i,_z); }); }
  function standPose(i,p,x,z,armL,armR,lean,bob,legs,yawAdd){
    root(i,x,0.13+(bob||0)+(p.y||0),z,p.fx,p.fz,p.sc,lean||0,yawAdd);
    part(IB,i,0,0.34,0,0); hats(i,p,0.735,0,0);
    part(IAL,i,-0.295,0.74,0,armL); part(IAR,i,0.295,0.74,0,armR);
    part(ILL,i,-0.125,0.36,0,legs?legs[0]:0); part(ILR,i,0.125,0.36,0,legs?legs[1]:0);
  }
  function runPose(i,p,x,z,amp){
    var sw=Math.sin(p.ph)*amp, bob=Math.abs(Math.cos(p.ph))*0.06*amp;
    standPose(i,p,x,z,-sw*0.9,sw*0.9,0,bob,[sw,-sw]);
  }
  function swimPose(i,p,x,z,y,stroke){
    /* face down along the way they swim, arms windmilling, legs fluttering */
    root(i,x,y,z,p.fx,p.fz,p.sc,-1.5);
    part(IB,i,0,0.34,0,0); hats(i,p,0.735,0.02,-0.5);
    part(IAL,i,-0.295,0.74,0,stroke); part(IAR,i,0.295,0.74,0,stroke+Math.PI);
    var fl=Math.sin(p.ph*3)*0.35; part(ILL,i,-0.125,0.36,0,fl); part(ILR,i,0.125,0.36,0,-fl);
  }
  function tuckPose(i,p,x,y,z,spin){
    root(i,x,y,z,p.fx,p.fz,p.sc,spin);
    part(IB,i,0,0.34,0,-0.6); hats(i,p,0.68,-0.12,0.4);
    part(IAL,i,-0.295,0.74,-0.1,1.9); part(IAR,i,0.295,0.74,-0.1,1.9);
    part(ILL,i,-0.125,0.36,-0.1,1.9); part(ILR,i,0.125,0.36,-0.1,1.9);
  }
  function crouchPose(i,p,x,z){
    root(i,x,-0.05,z,p.fx,p.fz,p.sc);
    part(IB,i,0,0.27,0,-0.25); hats(i,p,0.66,-0.05,0.15);
    part(IAL,i,-0.295,0.66,0,0.9); part(IAR,i,0.295,0.66,0,0.4);
    part(ILL,i,-0.16,0.3,0,1.4); part(ILR,i,0.16,0.3,0,1.4);
  }

  /* ---------------- the pool, simulated ---------------- */
  function aq(u,v){ return A.P(u,v); }
  var AUX=[A.ux,A.uz], AVX=[-A.uz,A.ux];
  function stepPool(dt,t){
    SW.forEach(function(p){
      p.u+=p.dir*p.sp*dt; p.ph+=dt*p.sp*2.2;
      if(p.turn>0){ p.turn-=dt; }
      var lim=A.hu-1.2;
      if(p.u*p.dir>lim){ p.u=p.dir*lim; p.dir=-p.dir; p.turn=0.5; }
      p.fx=AUX[0]*p.dir; p.fz=AUX[1]*p.dir;
    });
    var W=A.well;
    DV.forEach(function(p){
      p.t-=dt;
      if(p.st==='wait'){ if(p.t<=0){ p.st='up'; var s=p.plat!==null?A.plats[p.plat]:A.boards[p.board];
          p.spot=s; p.u=s.u; p.v=s.v+1.6; p.y=s.y; p.st='walk'; p.t=1.4; } }
      else if(p.st==='walk'){ p.v-=dt*0.9; p.fx=-AVX[0]; p.fz=-AVX[1]; p.ph+=dt*4;
        if(p.v<=p.spot.v){ p.v=p.spot.v; p.st='ready'; p.t=1.2+srnd(); } }
      else if(p.st==='ready'){ if(p.t<=0){ p.st='air'; p.vv=-1.3; p.vy=p.plat!==null?3.2:4.6; p.spin=0;
          var hgt=p.y-A.WY, tt=(p.vy+Math.sqrt(p.vy*p.vy+2*9.8*hgt))/9.8; p.flips=hgt>6?2:1; p.spinR=-(p.flips*6.2832+0.2)/tt; } }
      else if(p.st==='air'){
        p.vy-=9.8*dt; p.y+=p.vy*dt; p.v+=p.vv*dt; p.spin+=p.spinR*dt;
        if(p.y<=A.WY){ var w=aq(p.u,p.v); splash(w[0],w[1],1); p.st='under'; p.t=0.9; } }
      else if(p.st==='under'){ if(p.t<=0){ p.st='swim'; p.y=A.WY-0.12; } }
      else if(p.st==='swim'){ p.v+=dt*1.2; p.ph+=dt*3; p.fx=AVX[0]; p.fz=AVX[1];
        if(p.v>=W[3]-0.6){ p.st='out'; p.t=0.8; } }
      else if(p.st==='out'){ if(p.t<=0){ p.st='deck'; p.v=W[3]+1.0; p.y=A.DECK; } }
      else if(p.st==='deck'){ /* walk back to the tower */
        var tu=A.TU-A.THU-0.8, du=tu-p.u; p.ph+=dt*6;
        if(Math.abs(du)>0.2){ p.u+=Math.sign(du)*Math.min(Math.abs(du),dt*1.4); p.fx=AUX[0]*Math.sign(du); p.fz=AUX[1]*Math.sign(du); }
        else { p.st='wait'; p.t=3+srnd()*4; } }
    });
    SPL.forEach(function(s){ if(!s.m.visible) return; s.t+=dt; var k=s.t/0.9;
      if(k>=1){ s.m.visible=false; return; }
      var r=0.5+k*1.4*(s.big?1:0.6), h=(k<0.25?k/0.25:(1-k)/0.75)*(s.big?2.6:1.2);
      s.m.scale.set(r,h,r); s.m.position.y=A.WY+h*0.5; s.m.material.opacity=0.95*(k<0.5?1:(1-k)*2); });
  }
  function drawPool(t){
    SW.forEach(function(p){ var i=E.indexOf(p), w=aq(p.u,p.lane);
      if(p.turn>0){ root(i,w[0],A.WY-0.3,w[1],p.fx,p.fz,p.sc,-1.5+(0.5-p.turn)*6); part(IB,i,0,0.34,0,0); hats(i,p,0.735,0,0);
        part(IAL,i,-0.3,0.74,0,1.5); part(IAR,i,0.3,0.74,0,1.5); part(ILL,i,-0.125,0.36,0,1.5); part(ILR,i,0.125,0.36,0,1.5); }
      else swimPose(i,p,w[0],w[1],A.WY-0.12,p.ph); });
    var i=E.indexOf(COACHP); COACHP.fx=AVX[0]; COACHP.fz=AVX[1];
    standPose(i,COACHP,COACHP.at[0],COACHP.at[1],0.15,Math.sin(t*0.8)>0.6?2.6:0.15,0,A.DECK,null);
    DV.forEach(function(p){ var i=E.indexOf(p);
      if(p.st==='wait'||p.st==='under'){ hide(i); return; }
      var w=aq(p.u,p.v);
      if(p.st==='air') tuckPose(i,p,w[0],p.y,w[1],p.spin);
      else if(p.st==='swim') swimPose(i,p,w[0],w[1],p.y,p.ph);
      else if(p.st==='out') hide(i);
      else if(p.st==='ready'){ var bob=p.board!==null?Math.abs(Math.sin(t*5))*0.25:0; p.fx=-AVX[0]; p.fz=-AVX[1];
        root(i,w[0],p.y+0.13+bob,w[1],p.fx,p.fz,p.sc,0); part(IB,i,0,0.34,0,0); hats(i,p,0.735,0,0);
        part(IAL,i,-0.295,0.74,0,2.9); part(IAR,i,0.295,0.74,0,2.9); part(ILL,i,-0.125,0.36,0,0); part(ILR,i,0.125,0.36,0,0); }
      else { var sw=Math.sin(p.ph)*0.6; root(i,w[0],p.y+0.13,w[1],p.fx,p.fz,p.sc,0); part(IB,i,0,0.34,0,0); hats(i,p,0.735,0,0);
        part(IAL,i,-0.295,0.74,0,-sw); part(IAR,i,0.295,0.74,0,sw); part(ILL,i,-0.125,0.36,0,sw); part(ILR,i,0.125,0.36,0,-sw); }
    });
  }

  /* ---------------- batting practice, simulated ---------------- */
  var B={st:'set',t:2,x:0,y:0,z:0,vx:0,vy:0,vz:0,fielder:null,swing:-1,hold:null};
  function vec(a,b){ return [b[0]-a[0],b[1]-a[1]]; }
  function throwTo(from,fy,to,ty,speed){
    var d=vec(from,to), L=Math.hypot(d[0],d[1])||1, T2=Math.max(0.35,L/speed);
    B.x=from[0]; B.z=from[1]; B.y=fy; B.vx=d[0]/T2; B.vz=d[1]/T2; B.vy=(ty-fy+4.9*T2*T2)/T2;
  }
  function moveP(p,to,speed,dt){
    var d=vec(p.at,to), L=Math.hypot(d[0],d[1]);
    if(L<0.15){ p.spd=0; return true; }
    var s=Math.min(speed,L/dt*0.5); p.spd=s; p.at[0]+=d[0]/L*s*dt; p.at[1]+=d[1]/L*s*dt; p.fx=d[0]/L; p.fz=d[1]/L; p.ph+=dt*(1.5+s*2.3);
    return false;
  }
  function face(p,to){ var d=vec(p.at,to), L=Math.hypot(d[0],d[1]); if(L>0.2){ p.fx=d[0]/L; p.fz=d[1]/L; } }
  function stepBall(dt){
    B.t-=dt;
    if(B.st==='set'){ B.hold='p'; if(B.t<=0){ B.st='pitch'; throwTo([PIT[0]+CF[0]*0.4,PIT[1]+CF[1]*0.4],1.9,[H[0]+SIDE[0]*0.1,H[1]+SIDE[1]*0.1],0.85,26); B.hold=null; B.t=0.6; PITCHER.throwT=0.3; } }
    else if(B.st==='pitch'){
      B.x+=B.vx*dt; B.z+=B.vz*dt; B.vy-=9.8*dt; B.y+=B.vy*dt;
      if(B.t<=0.12&&B.swing<0) B.swing=0;
      if(B.t<=0){
        if(srnd()<0.82){            /* contact: a line drive or a fly ball out over the field */
          var tt=0.03+srnd()*0.94, d=dirAt(tt), sp=24+srnd()*15, el=(8+srnd()*34)*Math.PI/180;
          B.vx=d[0]*sp*Math.cos(el); B.vz=d[1]*sp*Math.cos(el); B.vy=sp*Math.sin(el); B.st='hit'; B.t=9;
          /* the fielder nearest where it comes down goes for it */
          var Tf=(B.vy+Math.sqrt(B.vy*B.vy+2*9.8*B.y))/9.8, lx=B.x+B.vx*Tf, lz=B.z+B.vz*Tf, best=null, bd=1e9;
          FIELD.forEach(function(f){ var dd=Math.hypot(f.at[0]-lx,f.at[1]-lz); if(dd<bd){ bd=dd; best=f; } });
          B.fielder=best; B.land=[lx,lz];
        } else { B.st='caught'; B.hold='c'; B.t=1.2; }
      }
    }
    else if(B.st==='hit'){
      B.x+=B.vx*dt; B.z+=B.vz*dt; B.vy-=9.8*dt; B.y+=B.vy*dt;
      if(B.y<0.05){ B.y=0.05; B.vy=-B.vy*0.35; B.vx*=0.6; B.vz*=0.6; if(Math.abs(B.vy)<0.6){ B.vy=0; B.vx*=0.9; B.vz*=0.9; } }
      var r=Math.hypot(B.x-H[0],B.z-H[1]); if(r>D.R-0.6){ /* off the wall */ var nx=(B.x-H[0])/r, nz=(B.z-H[1])/r, dot=B.vx*nx+B.vz*nz; if(dot>0){ B.vx-=1.6*dot*nx; B.vz-=1.6*dot*nz; } }
      var f=B.fielder; if(f){ moveP(f,B.y>2?B.land:[B.x,B.z],7,dt);
        if(Math.hypot(f.at[0]-B.x,f.at[1]-B.z)<1.0&&B.y<2.4){ B.st='field'; B.hold=f; B.t=0.7; } }
      if(B.t<=0){ B.st='set'; B.t=2; }
    }
    else if(B.st==='field'){ face(B.hold,COLLECT.at); if(B.t<=0){ var h=B.hold; h.throwT=0.35; throwTo(h.at,1.9,COLLECT.at,1.4,30); B.st='in'; B.hold=null; B.t=8; } }
    else if(B.st==='in'){ B.x+=B.vx*dt; B.z+=B.vz*dt; B.vy-=9.8*dt; B.y+=B.vy*dt;
      if(Math.hypot(B.x-COLLECT.at[0],B.z-COLLECT.at[1])<0.8||B.y<0||B.t<=0){ B.st='set'; B.t=1.6; B.hold='p'; } }
    else if(B.st==='caught'){ if(B.t<=0){ B.st='set'; B.t=1.4; } }
    if(B.swing>=0){ B.swing+=dt; if(B.swing>0.5) B.swing=-1; }
    /* fielders drift home between hits */
    FIELD.forEach(function(f){ if(f!==B.fielder||B.st==='set'||B.st==='in'){ if(!moveP(f,f.home,3,dt)) {} else face(f,H); }
      if(f.throwT>0) f.throwT-=dt; });
    if(PITCHER.throwT>0) PITCHER.throwT-=dt;
    PAIRS.forEach(function(q){ q.t+=dt; });
  }
  var _m=new T.Matrix4();
  function drawBall(t){
    var i;
    for(i=0;i<NI;i++){ var p=E[i]; if(p.site!==1) continue;
      if(p.kind==='catch') crouchPose(i,p,p.at[0],p.at[1]);
      else if(p.kind==='bat'){ var sw=B.swing>=0?Math.min(1,B.swing/0.28):0; standPose(i,p,p.at[0],p.at[1],1.3,1.3,0,0,[0.15,-0.15],-sw*2.2+0.4); }
      else if(p.kind==='field'&&p.spd>0.3) runPose(i,p,p.at[0],p.at[1],Math.min(1,p.spd/2.4));
      else standPose(i,p,p.at[0],p.at[1],0.15,p.throwT>0?2.8:(p.kind==='field'?0.6:0.15),p.kind==='field'?-0.15:0,0,null);
    }
    /* the batting practice ball */
    var bx=B.x, by=B.y, bz=B.z;
    if(B.hold==='p'){ bx=PIT[0]+PITCHER.fx*0.4; bz=PIT[1]+PITCHER.fz*0.4; by=1.3; }
    else if(B.hold==='c'){ bx=CATCHER.at[0]+CATCHER.fx*0.5; bz=CATCHER.at[1]+CATCHER.fz*0.5; by=0.7; }
    else if(B.hold&&B.hold.at){ bx=B.hold.at[0]+B.hold.fx*0.4; bz=B.hold.at[1]+B.hold.fz*0.4; by=1.4; }
    _m.makeTranslation(bx,by,bz); balls.setMatrixAt(0,_m);
    /* the pairs: the ball arcs back and forth */
    PAIRS.forEach(function(q,k){
      var per=1.6, ph=(q.t%(2*per))/per, from=ph<1?q.a:q.b, to=ph<1?q.b:q.a, f=ph<1?ph:ph-1;
      var x=from.at[0]+(to.at[0]-from.at[0])*f, z=from.at[1]+(to.at[1]-from.at[1])*f, y=1.5+Math.sin(Math.PI*f)*2.6;
      _m.makeTranslation(x,y,z); balls.setMatrixAt(k+1,_m);
      var ia=E.indexOf(from), ib=E.indexOf(to);
      standPose(ia,from,from.at[0],from.at[1],0.15,f<0.15?2.8:0.3,0,0,null);
      standPose(ib,to,to.at[0],to.at[1],f>0.75?1.6:0.3,f>0.75?1.6:0.15,0,0,null);
    });
    balls.instanceMatrix.needsUpdate=true;
    /* the bat in the batter's hands */
    var bi=E.indexOf(BATTER), sw2=B.swing>=0?Math.min(1,B.swing/0.28):0, yaw=Math.atan2(-BATTER.fx,-BATTER.fz)-sw2*2.2+0.4;
    bat.position.set(BATTER.at[0],1.25,BATTER.at[1]);
    bat.rotation.set(sw2>0?1.5:0.5,yaw+(sw2>0?0:0.6),sw2>0?0:0.4,'YXZ');
  }

  /* ---------------- the loop ---------------- */
  var PC=A.P(0,0), DC=[H[0]+CF[0]*35,H[1]+CF[1]*35], nearP=true, nearD=true, clk=0;
  stepPool(0.016,0); drawPool(0); stepBall(0.016); drawBall(0);
  PARTS.forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
  updatePractice=function(dt){
    dt=Math.min(dt,0.05); clk+=dt;
    var cx=camera.position.x, cz=camera.position.z;
    var nP=Math.hypot(cx-PC[0],cz-PC[1])<300, nD=Math.hypot(cx-DC[0],cz-DC[1])<300;
    if(!nP&&!nD){ if(nearP||nearD){ PARTS.forEach(function(m){ m.visible=false; }); balls.visible=false; bat.visible=false; } nearP=nearD=false; return; }
    if(!(nearP||nearD)){ PARTS.forEach(function(m){ m.visible=true; }); }
    balls.visible=nD; bat.visible=nD; nearP=nP; nearD=nD;
    if(nP){ stepPool(dt,clk); drawPool(clk); }
    if(nD){ stepBall(dt); drawBall(clk); }
    PARTS.forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
  };
  window.__practice={n:NI,ball:function(){ return {st:B.st,x:+B.x.toFixed(1),y:+B.y.toFixed(1),z:+B.z.toFixed(1)}; },
    divers:function(){ return DV.map(function(p){ return p.st; }).join(','); },
    lookPool:function(){ var e=A.P(-A.hu-6,A.hv+9), t=A.P(20,0); return [e[0],9,e[1],t[0],0,t[1]]; },
    lookWell:function(){ var e=A.P(56,-17), t=A.P(46,4); return [e[0],12,e[1],t[0],3,t[1]]; },
    lookDiamond:function(){ var e=[H[0]+CF[0]*4-SIDE[0]*22,H[1]+CF[1]*4-SIDE[1]*22], t=[H[0]+CF[0]*30,H[1]+CF[1]*30]; return [e[0],12,e[1],t[0],0,t[1]]; }};
})();
