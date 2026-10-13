/* ==================================================================
   Childs Way: the gated campus street that runs from the corner of
   Alumni Park along the south side of Doheny Library, past Hubbard and
   Lewis halls, and ends in the square paved plaza where Pardee Way turns
   south between Lewis Hall (Price School) and Popovich Hall.
   As built: a 7 m pale concrete carriageway crossed by brick bands about
   every 19.5 m, brick parking bays with nose-in stalls on both sides
   between tree planters, low brown fences along the edges at the
   two gate points, campus lamps, and a plaza of big concrete squares with bollards
   on its east side. Data layer (CHILDS, a_world.js) has already taken
   the OSM walk out and given the crowd the street.
   Local frame: s along the street from its west end, t across (+ south).
   ================================================================== */
(function(){
  if(!CHILDS) return;
  var P=CHILDS.P, loc=CHILDS.loc, L=CHILDS.L, ux=CHILDS.ux, uz=CHILDS.uz;
  var S0=1.5, SG=78.5, SE=186;          /* street start, west gate (OSM lift gate), plaza edge */
  var RH=3.5, GT=0.5, PD=5.0;            /* half carriageway, gutter strip, stall depth */
  var PS0=RH+GT, PS1=RH+GT+PD;           /* parking strip from |t|=4 to 9 */
  var SN1=150;                           /* north stalls stop where the walk to Doheny's east end runs */
  var MG=new Mesher(), MW=new Mesher();
  var CONC=0xC4BFB4, CONC_D=0xB3AEA3, BRICK=0x9C5845, BRICK_D=0x83462F, BAY=0xA9654F,
      LINE=0xEDEBE4, GATE=0x5A3B26, GATE_D=0x47301F, CURB=0xC9C2B2, SOIL=0x4E3B2C, BOLL=0x3A3B3E;
  function hs(a,b,c){ var x=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453; return x-Math.floor(x); }
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }
  function rect(s0,s1,t0,t1){ return ccw([P(s0,t0),P(s1,t0),P(s1,t1),P(s0,t1)]); }
  /* thin strips go down in short pieces: triangulate() drops needle triangles */
  function slab(s0,s1,t0,t1,y,col,sh){
    var ds=s1-s0, dt=t1-t0, ns=Math.max(1,Math.ceil(ds/Math.max(2,dt*20))), nt=Math.max(1,Math.ceil(dt/Math.max(2,ds*20)));
    for(var a=0;a<ns;a++) for(var b=0;b<nt;b++)
      flat(MG,rect(s0+ds*a/ns,s0+ds*(a+1)/ns,t0+dt*b/nt,t0+dt*(b+1)/nt),y,col,sh===undefined?1:sh);
  }
  function box(s0,s1,t0,t1,y0,y1,col,sh){ prism(MW,rect(s0,s1,t0,t1),y0,y1,col,col,sh===undefined?0.66:sh); }
  function seg(s0,t0,s1,t1,y0,y1,w,col,sh){ segBox(MW,P(s0,t0),P(s1,t1),y0,y1,w,col,sh); }

  /* ---- clear the old planting off the street and the plaza ---- */
  var PZ=[[SE,226,-7,12.6],[198.6,214.6,12.6,22]];      /* plaza: main square, and the mouth of Pardee Way */
  function onStreet(l,pad){
    var hw=(l[0]>SG-2?PS1:RH+1.2)+pad;
    if(l[0]>S0-pad&&l[0]<SE+pad&&Math.abs(l[1])<hw) return true;
    for(var i=0;i<PZ.length;i++) if(l[0]>PZ[i][0]-pad&&l[0]<PZ[i][1]+pad&&l[1]>PZ[i][2]-pad&&l[1]<PZ[i][3]+pad) return true;
    return false;
  }
  for(var i=TREE_POS.length-1;i>=0;i--) if(onStreet(loc(TREE_POS[i]),1.5)) TREE_POS.splice(i,1);
  var FOOT=[rect(S0,SG,-RH-1.7,RH+1.7),rect(SG-2,SE,-PS1-0.6,PS1+0.6)];
  PZ.forEach(function(z){ FOOT.push(rect(z[0]-0.6,z[1]+0.6,z[2]-0.6,z[3]+0.6)); });
  FOOT.forEach(function(r){ NO_PLANT.push(r); NO_LAWN_TREES.push(r); });

  /* ---- where walks cross the parking strips: keep them open ---- */
  var GAPS={n:[],s:[]};
  PATHS.forEach(function(pa){
    if(pa.hide) return;
    var hw=pa.w>=2.5?(pa.w*1.3+1.0)/2+0.62:pa.w*0.6, q=pa.pts;
    for(var k=0;k<q.length-1;k++){
      var a=loc(q[k]), b=loc(q[k+1]);
      [-1,1].forEach(function(sd){
        var tl=sd*(PS0+PS1)/2, lo=Math.min(a[1],b[1]), hi=Math.max(a[1],b[1]);
        if(tl<lo||tl>hi||hi-lo<0.5) return;
        var s=a[0]+(b[0]-a[0])*(tl-a[1])/(b[1]-a[1]);
        if(s>SG-3&&s<SE+3) GAPS[sd<0?'n':'s'].push([s-hw-0.3,s+hw+0.3]);
      });
    }
  });
  function gapAt(side,s0,s1){ var g=GAPS[side];
    for(var i=0;i<g.length;i++) if(s1>g[i][0]&&s0<g[i][1]) return g[i]; return null; }

  /* ---- the carriageway: pale concrete, brick edges, brick cross bands ---- */
  slab(S0,SE,-RH,RH,0.150,CONC,1);
  for(var s=S0+6;s<SE-1;s+=6.5) slab(s,s+0.07,-RH,RH,0.153,CONC_D,1);         /* score joints */
  slab(S0,SE,-0.05,0.05,0.153,CONC_D,1);
  var BANDS=[];
  for(s=18;s<SE-4;s+=19.5) BANDS.push(s);
  BANDS.forEach(function(b){ slab(b-1.2,b+1.2,-RH,RH,0.155,BRICK,1);
    for(var sd=-1;sd<=1;sd+=2) slab(b-1.2,b+1.2,sd*RH-0.1,sd*RH+0.1,0.157,BRICK_D,1); });
  /* west of the gate: just a brick edge, the park and the old trees come right up */
  for(var sd=-1;sd<=1;sd+=2){
    slab(S0,SG,sd>0?RH:-RH-1.2,sd>0?RH+1.2:-RH,0.150,BRICK,1);
    slab(S0,SG,sd>0?RH+1.05:-RH-1.2,sd>0?RH+1.2:-RH-1.05,0.153,BRICK_D,1);
  }

  /* ---- parking bays, planters, stalls ---- */
  var cars=[], STALL=2.6;
  var PL=BANDS.filter(function(b){ return b>SG+5; });          /* planters line up with the cross bands */
  var bays=[], edges=[SG+1.6].concat(PL).concat([SE]);
  for(i=0;i<edges.length-1;i++) bays.push([edges[i]+(i?1.5:0),edges[i+1]-(i<edges.length-2?1.5:0)]);
  ['n','s'].forEach(function(side){
    var sg=side==='n'?-1:1, sEnd=side==='n'?SN1:SE, t0=sg*PS0, t1=sg*PS1, tm=sg*(PS0+PS1)/2;
    var lo=Math.min(t0,t1), hi=Math.max(t0,t1);
    /* gutter strip and the brick bay floor, broken where a walk crosses */
    var runs=[[SG-1.5,sEnd]];
    GAPS[side].forEach(function(g){
      var nr=[]; runs.forEach(function(r){
        if(g[1]<=r[0]||g[0]>=r[1]){ nr.push(r); return; }
        if(g[0]>r[0]) nr.push([r[0],g[0]]); if(g[1]<r[1]) nr.push([g[1],r[1]]); });
      runs=nr; });
    slab(SG-1.5,SE,sg>0?RH:-PS0,sg>0?PS0:-RH,0.152,BRICK_D,1);
    runs.forEach(function(r){ if(r[1]-r[0]<0.3) return;
      slab(r[0],r[1],lo,hi,0.151,BAY,1);
      slab(r[0],r[1],sg>0?hi-0.25:lo,sg>0?hi:lo+0.25,0.154,CURB,1);
    });
    GAPS[side].forEach(function(g){ var a=Math.max(g[0],SG-1.5), b=Math.min(g[1],sEnd); if(b>a) slab(a,b,lo,hi,0.151,0xC8C2B2,1); });
    if(side==='n'&&SN1<SE) slab(SN1,SE,-RH-1.2,-RH,0.150,BRICK,1);
    /* tree planters with a low concrete kerb, one at every cross band */
    PL.forEach(function(b,pi){
      if(b+1.3>sEnd||gapAt(side,b-1.3,b+1.3)) return;
      box(b-1.3,b+1.3,lo+0.2,hi-0.2,0.10,0.42,CURB,0.7);
      slab(b-1.05,b+1.05,lo+0.45,hi-0.45,0.43,SOIL,1);
      var tp=P(b,tm);
      TREE_POS.push([tp[0],tp[1],0,['syc','ficus','oak','syc'][(pi+(sg>0?1:0))%4],1.05+hs(b,sg,3)*0.3]);
      if((pi+(sg>0?1:0))%2===0){ var lp=P(b+1.75,sg*(PS1-0.4)); campusLamp(MW,lp[0],lp[1],3.6,false); }
    });
    /* nose-in stalls between the planters, and the cars in them */
    bays.forEach(function(by,bi){
      var b0=by[0], b1=Math.min(by[1],sEnd-0.3);
      if(bi===bays.length-1) b1=Math.min(b1,SE-4.3);              /* leave room for the low fence */
      var n=Math.floor((b1-b0)/STALL); if(n<1) return;
      var st=(b0+b1)/2-n*STALL/2;
      for(var k=0;k<n;k++){
        var a=st+k*STALL, c=a+STALL/2;
        if(gapAt(side,a,a+STALL)) continue;
        for(var e=0;e<2;e++){ if(e===1&&k<n-1) continue;
          var ls=e?a+STALL:a; slab(ls-0.06,ls+0.06,lo+0.25,hi-0.3,0.156,LINE,1); }
        var h=hs(c,sg,7);
        if(h<0.74) cars.push([c,sg*(PS0+2.55),sg,h]);
      }
    });
  });

  /* ---- simple low brown fences along the street edge at the two gate points ---- */
  function lowFence(s0,sd,dir){                 /* starts at s0 on side sd, runs Lf toward dir*s */
    var t=sd*(RH+0.22), Lf=3.3, s1=s0+dir*Lf, np=3;
    for(var q=0;q<=np;q++){ var pq=P(s0+dir*Lf*q/np,t); postAt(MW,pq[0],pq[1],0,0.95,0.06,GATE_D,0.7); }
    [0.40,0.82].forEach(function(y){ seg(s0,t,s1,t,y,y+0.08,0.06,GATE,0.75); });
    var a=P(s0,t), b=P(s1,t); addCollider(ccw([[a[0]-uz*0.08,a[1]+ux*0.08],[b[0]-uz*0.08,b[1]+ux*0.08],[b[0]+uz*0.08,b[1]-ux*0.08],[a[0]+uz*0.08,a[1]-ux*0.08]]),0.95);
  }
  for(sd=-1;sd<=1;sd+=2){ lowFence(SG,sd,-1); lowFence(SE-0.4,sd,-1); }

  /* ---- the plaza between Lewis and Popovich: big concrete squares ---- */
  var PQ=0xCCC6B9, JOINT=0x8E897F;
  PZ.forEach(function(z){
    slab(z[0],z[1],z[2],z[3],0.150,PQ,1);
    for(var a=z[0]+3;a<z[1]-0.2;a+=3) slab(a-0.08,a+0.08,z[2],z[3],0.153,JOINT,1);
    for(var b=Math.ceil(z[2]/3)*3;b<z[3]-0.2;b+=3) if(b>z[2]+0.2) slab(z[0],z[1],b-0.08,b+0.08,0.153,JOINT,1);
  });
  slab(SE,SE+1.0,-7,12.6,0.155,BRICK,1);                                 /* brick band where the street meets it */
  slab(SE,226,-7.8,-7,0.152,BRICK,1);
  [-6,-4,-2,0,2].forEach(function(t){ var p=P(226.4,t); postAt(MW,p[0],p[1],0,0.95,0.11,BOLL,0.7); });

  /* ---- parked cars, instanced ---- */
  if(cars.length){
    var CARC=[0xF2F2F0,0x1E1E20,0x8A8D91,0xB7BABD,0x9C1C22,0x1F3B6B,0xE9E4D8,0x3C4A3E,0x5B5F63,0x2F2F31,0xD8D4CC,0x6E7378];
    var cb=new T.BoxGeometry(1,1,1); cb.translate(0,0.5,0);
    var D=new T.Object3D(), col=new T.Color(), ang=Math.atan2(ux,-uz);
    var mk=function(fn){
      var im=new T.InstancedMesh(cb,new T.MeshLambertMaterial({color:0xFFFFFF,flatShading:true}),cars.length);
      for(var i=0;i<cars.length;i++){ fn(cars[i]); D.updateMatrix(); im.setMatrixAt(i,D.matrix); im.setColorAt(i,col); }
      if(im.instanceColor) im.instanceColor.needsUpdate=true;
      im.frustumCulled=false; im.raycast=function(){}; scene.add(im); return im;
    };
    var at=function(c,dt,y){ var p=P(c[0],c[1]+c[2]*dt); D.position.set(p[0],y,p[1]); D.rotation.set(0,-ang,0); };
    mk(function(c){ at(c,0,0.12); D.scale.set(3.9,0.36,1.62); col.setHex(0x1C1D20); });                     /* tyres */
    mk(function(c){ at(c,0,0.34); D.scale.set(4.4,0.70,1.80); col.setHex(CARC[Math.floor(c[3]*97)%CARC.length]); });
    mk(function(c){ at(c,0.25,1.04); D.scale.set(2.3,0.46,1.62); col.setHex(0x2A3036); });                   /* glass */
    mk(function(c){ at(c,0.30,1.50); D.scale.set(2.0,0.08,1.56); col.setHex(CARC[Math.floor(c[3]*97)%CARC.length]); });  /* roof */
    cars.forEach(function(c){ var p=P(c[0],c[1]); addCollider(oriRect(p[0],p[1],-uz,ux,2.25,0.95),1.5); });
  }

  /* ---- finish ---- */
  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; scene.add(mw);
  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; scene.add(mg);
  ROADS.push({w:7,pts:[P(S0,0),P(SE,0)]});           /* minimap, and keeps lawn planting off it */
  window.__childs={cars:cars.length,bands:BANDS.length,gaps:GAPS,tris:MW.count()+MG.count()};
})();
