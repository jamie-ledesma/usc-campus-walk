
/* =====================================================================
   Students. Stumble Guys proportions, but a real mix of people: skin
   tones, shirts, trousers, hair and caps, and backpacks. Built as a set
   of baked variants so every combination is one instanced draw call.

   How they move: the walks in PATHS (hidden crowd walks included) are
   welded into one graph (shared and near points merged, crossings and
   T junctions split). Every student is on a trip: a destination (a
   building door, a landmark, a plaza, a bench, the Expo/USC station),
   routed along the graph by a next-hop table per destination (Dijkstra,
   built the first time someone heads there and then cached). They walk
   in their own lane across the walk's width, cut corners, pass oncoming
   people on the right and keep their distance (spatial hash), then stand,
   sit, chat, go inside, and set off again. Some walk in groups of 2-3.
   ===================================================================== */
var CROWD_N=1000, VARIANTS=24;
var STU=[], VAR=[], DEST=[];
var CG={n:0};                      /* walk graph: CSR arrays, see initCrowd */
var CROWD_DEV={arr:[0,0,0,0,0],enter:0,tables:0};   /* read by the dev hooks */

function GeoBag(){ this.p=[]; this.n=[]; this.c=[]; }
GeoBag.prototype.add=function(geo,mat,hex){
  var pos=geo.attributes.position, nor=geo.attributes.normal, idx=geo.index;
  var nm=new T.Matrix3().getNormalMatrix(mat), v=new T.Vector3(), col=new T.Color(hex);
  var order=[],i;
  if(idx){ for(i=0;i<idx.count;i++) order.push(idx.getX(i)); }
  else { for(i=0;i<pos.count;i++) order.push(i); }
  for(var k=0;k<order.length;k++){
    var j=order[k];
    v.fromBufferAttribute(pos,j).applyMatrix4(mat); this.p.push(v.x,v.y,v.z);
    v.fromBufferAttribute(nor,j).applyMatrix3(nm).normalize(); this.n.push(v.x,v.y,v.z);
    this.c.push(col.r,col.g,col.b);
  }
};
GeoBag.prototype.geom=function(){
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));
  g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
  g.computeBoundingSphere();
  return g;
};

/* states */
var S_WALK=0, S_GO=1, S_STAND=2, S_SIT=3, S_IN=4, S_OUT=5;
/* destination kinds */
var D_DOOR=0, D_SPOT=1, D_PLAZA=2, D_BENCH=3, D_TRAIN=4;

/* something solid (a building, wall, fountain basin, step) at (x,z) at least hmin tall: its collider, or null */
function crowdBlocked(x,z,hmin){
  var l=GRID[gkey(Math.floor(x/CELL),Math.floor(z/CELL))];
  if(!l) return false;
  for(var i=0;i<l.length;i++){ var C=l[i];
    if(C.h<hmin||x<C.x0||x>C.x1||z<C.z0||z>C.z1) continue;
    if(inRing(C.ring,x,z)) return C; }
  return null;
}

/* ---------------------------------------------------- routing tables */
var NEXTT={}, _rDist=null, _hk=null, _hv=null, _hn=0;
function _hpush(v,k){
  var i=_hn++; while(i>0){ var p=(i-1)>>1; if(_hk[p]<=k) break; _hk[i]=_hk[p]; _hv[i]=_hv[p]; i=p; }
  _hk[i]=k; _hv[i]=v;
}
function _hpop(){
  var top=_hv[0], k=_hk[--_hn], v=_hv[_hn], i=0;
  for(;;){ var c=2*i+1; if(c>=_hn) break; if(c+1<_hn&&_hk[c+1]<_hk[c]) c++;
    if(_hk[c]>=k) break; _hk[i]=_hk[c]; _hv[i]=_hv[c]; i=c; }
  _hk[i]=k; _hv[i]=v; return top;
}
/* next-hop table toward node d: from node n the next node is tab[n] */
function nextTable(d){
  var t=NEXTT[d]; if(t) return t;
  var N=CG.n, st=CG.start, nb=CG.nb, ln=CG.len, dist=_rDist;
  t=new Int32Array(N); t.fill(-1); dist.fill(1e9);
  dist[d]=0; t[d]=d; _hn=0; _hpush(d,0);
  while(_hn>0){
    var k=_hk[0], u=_hpop();
    if(k>dist[u]) continue;
    for(var e=st[u];e<st[u+1];e++){ var v=nb[e], nd=k+ln[e];
      if(nd<dist[v]){ dist[v]=nd; t[v]=u; _hpush(v,nd); } }
  }
  NEXTT[d]=t; CROWD_DEV.tables++;
  return t;
}
function halfEdge(a,b){ for(var e=CG.start[a];e<CG.start[a+1];e++) if(CG.nb[e]===b) return e; return -1; }

(function initCrowd(){
  var t0=performance.now();
  /* ================================================ the walk graph ===== */
  var X0=-660, X1=720, Z0=-720, Z1=580, SNAP=1.6, HC=4;
  var NX=[], NZ=[], NH={};
  function findNode(x,z,r){
    var cx=Math.floor(x/HC), cz=Math.floor(z/HC), best=-1, bd=r*r;
    for(var i=cx-1;i<=cx+1;i++) for(var j=cz-1;j<=cz+1;j++){
      var l=NH[i+'_'+j]; if(!l) continue;
      for(var k=0;k<l.length;k++){ var n=l[k], dx=NX[n]-x, dz=NZ[n]-z, d=dx*dx+dz*dz;
        if(d<bd){ bd=d; best=n; } } }
    return best;
  }
  function addNode(x,z){
    var n=findNode(x,z,SNAP); if(n>=0) return n;
    n=NX.length; NX.push(x); NZ.push(z);
    var k=Math.floor(x/HC)+'_'+Math.floor(z/HC); (NH[k]||(NH[k]=[])).push(n); return n;
  }
  function inBox(p){ return p[0]>X0&&p[0]<X1&&p[1]>Z0&&p[1]<Z1; }
  /* segments of every walk, hidden crowd walks included */
  var SEG=[], i, j, k;
  for(i=0;i<PATHS.length;i++){
    var pts=PATHS[i].pts, w=PATHS[i].w;
    if(w<1.6) continue;
    for(j=0;j<pts.length-1;j++){
      var p=pts[j], q=pts[j+1];
      if(!inBox(p)||!inBox(q)) continue;
      var L=Math.hypot(q[0]-p[0],q[1]-p[1]); if(L<0.05) continue;
      SEG.push({ax:p[0],az:p[1],bx:q[0],bz:q[1],w:w,path:i,first:j===0,last:j===pts.length-2,
                na:addNode(p[0],p[1]),nb:addNode(q[0],q[1]),cuts:[]});
    }
  }
  /* a coarse grid of segments for crossings and T junctions */
  var SC=16, SG={};
  function segCells(s,fn){
    var x0=Math.floor((Math.min(s.ax,s.bx)-3)/SC), x1=Math.floor((Math.max(s.ax,s.bx)+3)/SC),
        z0=Math.floor((Math.min(s.az,s.bz)-3)/SC), z1=Math.floor((Math.max(s.az,s.bz)+3)/SC);
    for(var a=x0;a<=x1;a++) for(var b=z0;b<=z1;b++) fn(a+'_'+b);
  }
  SEG.forEach(function(s,si){ segCells(s,function(key){ (SG[key]||(SG[key]=[])).push(si); }); });
  /* proper crossings: split both walks there (each pair handled in the cell holding the crossing) */
  for(var key in SG){
    var l=SG[key], kc=key.split('_'), gx=+kc[0], gz=+kc[1];
    for(i=0;i<l.length;i++) for(j=i+1;j<l.length;j++){
      var A=SEG[l[i]], B=SEG[l[j]];
      if(A.na===B.na||A.na===B.nb||A.nb===B.na||A.nb===B.nb) continue;
      var rx=A.bx-A.ax, rz=A.bz-A.az, sx=B.bx-B.ax, sz=B.bz-B.az, den=rx*sz-rz*sx;
      if(Math.abs(den)<1e-9) continue;
      var qx=B.ax-A.ax, qz=B.az-A.az, ta=(qx*sz-qz*sx)/den, tb=(qx*rz-qz*rx)/den;
      if(ta<=0.001||ta>=0.999||tb<=0.001||tb>=0.999) continue;
      var ix=A.ax+rx*ta, iz=A.az+rz*ta;
      if(Math.floor(ix/SC)!==gx||Math.floor(iz/SC)!==gz) continue;
      var n=addNode(ix,iz); A.cuts.push([ta,n]); B.cuts.push([tb,n]);
    }
  }
  /* T junctions: a walk that stops just short of (or on) another one joins it */
  var extra=[];
  for(i=0;i<SEG.length;i++){
    var S0=SEG[i];
    [[S0.first,S0.ax,S0.az,S0.na],[S0.last,S0.bx,S0.bz,S0.nb]].forEach(function(E){
      if(!E[0]) return;
      var ex=E[1], ez=E[2], best=null, bd=1e9, bt=0;
      segCells({ax:ex,az:ez,bx:ex,bz:ez},function(key){
        var l2=SG[key]; if(!l2) return;
        for(var m=0;m<l2.length;m++){ var B2=SEG[l2[m]];
          if(B2.path===S0.path) continue;
          var dx=B2.bx-B2.ax, dz=B2.bz-B2.az, LL=dx*dx+dz*dz;
          var tt=Math.max(0,Math.min(1,((ex-B2.ax)*dx+(ez-B2.az)*dz)/LL));
          var d=Math.hypot(B2.ax+dx*tt-ex,B2.az+dz*tt-ez), reach=Math.min(3,B2.w*0.5+1.2);
          if(d<reach&&d<bd){ bd=d; best=B2; bt=tt; } }
      });
      if(!best) return;
      var px=best.ax+(best.bx-best.ax)*bt, pz=best.az+(best.bz-best.az)*bt, n2;
      if(bt<=0.001) n2=best.na; else if(bt>=0.999) n2=best.nb;
      else { n2=addNode(px,pz); best.cuts.push([bt,n2]); }
      if(n2!==E[3]) extra.push([E[3],n2,Math.min(S0.w,best.w)]);
    });
  }
  /* edges */
  var EA=[], EB=[], EW=[], EK={}, NB=[];
  for(i=0;i<NX.length;i++) NB.push(crowdBlocked(NX[i],NZ[i],0.9)?1:0);   /* points inside buildings, beds, basins */
  function addEdge(a,b,w){
    if(a===b||NB[a]||NB[b]) return;
    var key=a<b?a+'_'+b:b+'_'+a;
    if(EK[key]!==undefined){ EW[EK[key]]=Math.max(EW[EK[key]],w); return; }
    var ax=NX[a], az=NZ[a], bx=NX[b], bz=NZ[b], L=Math.hypot(bx-ax,bz-az);
    if(L<0.3) return;
    if(fenceCuts(ax,az,bx,bz)) return;                  /* students use the entrances */
    /* never through a building */
    var n=Math.floor(L/2);
    for(var s=1;s<=n;s++){ var t=s/(n+1); if(t*L<1||(1-t)*L<1) continue;
      if(crowdBlocked(ax+(bx-ax)*t,az+(bz-az)*t,2.5)) return; }
    EK[key]=EA.length; EA.push(a); EB.push(b); EW.push(w);
  }
  for(i=0;i<SEG.length;i++){
    var S1=SEG[i], c=S1.cuts.slice(); c.push([0,S1.na],[1,S1.nb]);
    c.sort(function(u,v){ return u[0]-v[0]; });
    for(j=0;j<c.length-1;j++) addEdge(c[j][1],c[j+1][1],S1.w);
  }
  for(i=0;i<extra.length;i++) addEdge(extra[i][0],extra[i][1],extra[i][2]);

  /* components: keep the big ones */
  var N0=NX.length, adj0=[]; for(i=0;i<N0;i++) adj0.push([]);
  for(i=0;i<EA.length;i++){ adj0[EA[i]].push(i); adj0[EB[i]].push(i); }
  var comp=new Int32Array(N0).fill(-1), csize=[];
  for(i=0;i<N0;i++){ if(comp[i]>=0||!adj0[i].length) continue;
    var cid=csize.length, stack=[i], cnt=0; comp[i]=cid;
    while(stack.length){ var u=stack.pop(); cnt++;
      for(k=0;k<adj0[u].length;k++){ var e=adj0[u][k], v=EA[e]===u?EB[e]:EA[e];
        if(comp[v]<0){ comp[v]=cid; stack.push(v); } } }
    csize.push(cnt); }
  var keepC={}; for(i=0;i<csize.length;i++) if(csize[i]>=40) keepC[i]=1;
  /* renumber kept nodes */
  var remap=new Int32Array(N0).fill(-1), N=0;
  for(i=0;i<N0;i++) if(comp[i]>=0&&keepC[comp[i]]) remap[i]=N++;
  if(!N) return;
  var gx=new Float32Array(N), gz=new Float32Array(N), gc=new Int32Array(N), deg=new Int32Array(N+1);
  for(i=0;i<N0;i++) if(remap[i]>=0){ gx[remap[i]]=NX[i]; gz[remap[i]]=NZ[i]; gc[remap[i]]=comp[i]; }
  var E2=[]; for(i=0;i<EA.length;i++){ var a2=remap[EA[i]], b2=remap[EB[i]]; if(a2>=0&&b2>=0){ E2.push(i); deg[a2]++; deg[b2]++; } }
  var start=new Int32Array(N+1); for(i=0;i<N;i++) start[i+1]=start[i]+deg[i];
  var H=start[N], nb=new Int32Array(H), len=new Float32Array(H), hr=new Float32Array(H), hl=new Float32Array(H),
      fill=new Int32Array(N);
  /* how far each side of the centreline is clear: the walk's width, less anything solid */
  function clearance(ax,az,bx,bz,w,side){
    var L=Math.hypot(bx-ax,bz-az), ux=(bx-ax)/L, uz=(bz-az)/L, rx=-uz*side, rz=ux*side;
    var half=Math.max(0,w*0.5-0.35), ns=Math.min(12,Math.max(2,Math.ceil(L/2)));
    var low=crowdBlocked((ax+bx)/2,(az+bz)/2,0.3)?2.5:0.3;   /* on a terrace: only walls count */
    for(var off=0.5;off<=half+0.01;off+=0.5){
      for(var s=0;s<ns;s++){ var t=(s+0.5)/ns;
        if(crowdBlocked(ax+(bx-ax)*t+rx*off,az+(bz-az)*t+rz*off,low)) return Math.max(0,off-0.6); } }
    return half;
  }
  for(i=0;i<E2.length;i++){
    var ei=E2[i], a=remap[EA[ei]], b=remap[EB[ei]], wE=EW[ei];
    var Lab=Math.hypot(gx[b]-gx[a],gz[b]-gz[a]);
    var cR=clearance(gx[a],gz[a],gx[b],gz[b],wE,1), cL=clearance(gx[a],gz[a],gx[b],gz[b],wE,-1);
    var ea=start[a]+fill[a]++, eb=start[b]+fill[b]++;
    nb[ea]=b; len[ea]=Lab; hr[ea]=cR; hl[ea]=cL;
    nb[eb]=a; len[eb]=Lab; hr[eb]=cL; hl[eb]=cR;
  }
  CG={n:N,x:gx,z:gz,comp:gc,start:start,nb:nb,len:len,hr:hr,hl:hl};
  _rDist=new Float64Array(N); _hk=new Float64Array(H+N+8); _hv=new Int32Array(H+N+8);
  /* node lookup grid */
  var NG={}, NGC=8;
  for(i=0;i<N;i++){ var kk=Math.floor(gx[i]/NGC)+'_'+Math.floor(gz[i]/NGC); (NG[kk]||(NG[kk]=[])).push(i); }
  function nearestNode(x,z,r){
    var best=-1, bd=r*r, c0=Math.floor((x-r)/NGC), c1=Math.floor((x+r)/NGC), d0=Math.floor((z-r)/NGC), d1=Math.floor((z+r)/NGC);
    for(var a=c0;a<=c1;a++) for(var b=d0;b<=d1;b++){ var l=NG[a+'_'+b]; if(!l) continue;
      for(var m=0;m<l.length;m++){ var n=l[m], dx=gx[n]-x, dz=gz[n]-z, d=dx*dx+dz*dz; if(d<bd){ bd=d; best=n; } } }
    return best;
  }
  function nodesIn(x0,z0,x1,z1,fn){
    for(var a=Math.floor(x0/NGC);a<=Math.floor(x1/NGC);a++) for(var b=Math.floor(z0/NGC);b<=Math.floor(z1/NGC);b++){
      var l=NG[a+'_'+b]; if(l) for(var m=0;m<l.length;m++) fn(l[m]); }
  }
  CROWD_DEV.nearestNode=nearestNode;

  /* =============================================== where people go ===== */
  /* busier along Trousdale, round Hahn Plaza and Tommy, at the Campus Center and in the Village */
  var HOT=[[12,32,55,3],[-77,50,55,3],[25,-505,95,2.5],[-45,262,40,1.5],   /* Hahn, TCC, Village, station */
           [-102,249,45,1.2],[-47,142,45,1.5],[63,-72,45,1.5],[118,-179,45,1.2]];   /* Trousdale */
  function hot(x,z){
    var h=1;
    for(var q=0;q<HOT.length;q++){ var dx=x-HOT[q][0], dz=z-HOT[q][1], r=HOT[q][2];
      h+=HOT[q][3]*Math.exp(-(dx*dx+dz*dz)/(r*r)); }
    if(Math.hypot(x,z)>430) h*=0.5;                      /* the far edges are quieter */
    return h;
  }
  CROWD_DEV.hot=hot;
  function addDest(n,kind,x,z,fx,fz,w,ref){
    DEST.push({n:n,kind:kind,x:x,z:z,fx:fx,fz:fz,w:w*hot(x,z),ref:ref,comp:gc[n]});
  }
  /* building doors: up to three walk points close to each named campus building */
  var used={};
  CAMPUS.forEach(function(B,bi){
    if(!B.name||!B.ring||B.ring.length<3) return;
    var r=B.ring, x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    r.forEach(function(p){ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); z0=Math.min(z0,p[1]); z1=Math.max(z1,p[1]); });
    var cand=[];
    nodesIn(x0-9,z0-9,x1+9,z1+9,function(n){
      if(inRing(r,gx[n],gz[n])) return;
      var bd=1e9, bx=0, bz=0;
      for(var m=0;m<r.length;m++){ var p=r[m], q=r[(m+1)%r.length], dx=q[0]-p[0], dz=q[1]-p[1], LL=dx*dx+dz*dz||1;
        var t=Math.max(0,Math.min(1,((gx[n]-p[0])*dx+(gz[n]-p[1])*dz)/LL)), px=p[0]+dx*t, pz=p[1]+dz*t,
            d=Math.hypot(gx[n]-px,gz[n]-pz);
        if(d<bd){ bd=d; bx=px; bz=pz; } }
      if(bd<9) cand.push([bd,n,bx,bz]);
    });
    cand.sort(function(a,b){ return a[0]-b[0]; });
    var doors=[];
    for(var m=0;m<cand.length&&doors.length<3;m++){ var c2=cand[m], ok=true;
      for(var o=0;o<doors.length;o++) if(Math.hypot(gx[c2[1]]-gx[doors[o][1]],gz[c2[1]]-gz[doors[o][1]])<18) ok=false;
      if(ok) doors.push(c2); }
    var area=Math.abs(ringArea(r)), size=Math.max(0.6,Math.min(3,Math.sqrt(area)/25));
    doors.forEach(function(c3){
      var n=c3[1], dx=c3[2]-gx[n], dz=c3[3]-gz[n], d=Math.hypot(dx,dz)||1;
      /* the point where they step in: just inside the wall */
      addDest(n,D_DOOR,c3[2]+dx/d*0.35,c3[3]+dz/d*0.35,c3[2],c3[3],size/doors.length*1.6,bi);
    });
  });
  /* landmarks: statues, fountains, courtyards, parks */
  NAMED_PLACES.forEach(function(Pl){
    if(Pl.campus) return;
    var n=nearestNode(Pl.x,Pl.z,Pl.park?40:25); if(n<0) return;
    if(used['s'+n]) return; used['s'+n]=1;
    addDest(n,D_SPOT,gx[n],gz[n],Pl.x,Pl.z,Pl.park?0.8:1.4,-1);
  });
  /* plazas: several gathering points inside each */
  PLAZAS.forEach(function(ring){
    var x0=1e9,x1=-1e9,z0=1e9,z1=-1e9, pick=[];
    ring.forEach(function(p){ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); z0=Math.min(z0,p[1]); z1=Math.max(z1,p[1]); });
    var cx=(x0+x1)/2, cz=(z0+z1)/2;
    nodesIn(x0,z0,x1,z1,function(n){
      if(!inRing(ring,gx[n],gz[n])) return;
      for(var m=0;m<pick.length;m++) if(Math.hypot(gx[n]-gx[pick[m]],gz[n]-gz[pick[m]])<9) return;
      if(pick.length<10) pick.push(n);
    });
    pick.forEach(function(n){ addDest(n,D_PLAZA,gx[n],gz[n],cx,cz,1.6,-1); });
  });
  /* benches beside the walks */
  var SEATS=new Int8Array(BENCHES.length*2);
  BENCHES.forEach(function(Bn,bi){
    var n=nearestNode(Bn[0],Bn[1],6); if(n<0) return;
    addDest(n,D_BENCH,Bn[0],Bn[1],Bn[0]+Math.sin(Bn[2])*3,Bn[1]+Math.cos(Bn[2])*3,0.45,bi);
  });
  /* the Expo/USC station: they go down to the platforms and are gone */
  if(typeof EXPO!=='undefined'){
    [EXPO.st-EXPO.stHalf-3,EXPO.st+EXPO.stHalf+3].forEach(function(x){
      var n=nearestNode(x,EXPO.z,18); if(n<0) return;
      addDest(n,D_TRAIN,gx[n],gz[n],EXPO.st,EXPO.z,5,-1);
    });
  }
  /* trips stay inside the biggest connected network */
  var big=-1, bs=0; for(i=0;i<csize.length;i++) if(keepC[i]&&csize[i]>bs){ bs=csize[i]; big=i; }
  DEST=DEST.filter(function(D){ return D.comp===big; });
  if(!DEST.length) return;
  var DCUM=new Float64Array(DEST.length), DTOT=0, DOORS=[];
  for(i=0;i<DEST.length;i++){ DTOT+=DEST[i].w; DCUM[i]=DTOT;
    if(DEST[i].kind===D_DOOR||DEST[i].kind===D_TRAIN) DOORS.push(i); }
  var OCUM=new Float64Array(DOORS.length), OTOT=0;
  for(i=0;i<DOORS.length;i++){ OTOT+=DEST[DOORS[i]].w; OCUM[i]=OTOT; }
  function pickW(cum,tot){ var r=rnd()*tot, lo=0, hi=cum.length-1;
    while(lo<hi){ var mid=(lo+hi)>>1; if(cum[mid]<r) lo=mid+1; else hi=mid; } return lo; }
  /* a destination worth walking to from here: not next door, not usually across the map */
  function chooseDest(x,z,not){
    var want=30-Math.log(1-rnd()*0.995)*110, best=-1, bd=1e9;   /* most trips short, a few across campus */
    for(var tries=0;tries<8;tries++){
      var di=pickW(DCUM,DTOT), D=DEST[di];
      if(di===not) continue;
      var d=Math.hypot(D.x-x,D.z-z);
      if(d<25) continue;
      var e=Math.abs(d-want); if(e<bd){ bd=e; best=di; }
    }
    return best>=0?best:pickW(DCUM,DTOT);
  }

  /* ========================================================= people ===== */
  var SKIN=[0xF7DCC2,0xF0C6A0,0xE3AC82,0xCE9163,0xB27548,0x915934,0x714128,0x54301D];
  var SHIRT=[0x9E1B1B,0xFFC72C,0xF2F2F0,0x2C3E63,0x5A6069,0x2E8B87,0x6B7A3A,0xD98CA6,
             0x6A4C93,0x24262B,0xE07A3A,0x8FB8DE,0x3F7D45,0x7A2E3A,0xE8D9B5,0x4A4E8C];
  var PANT=[0x3D5A80,0x24262B,0xBFAE8C,0x6E7378,0x4A5240,0x2C3145,0xEFEFEA,0x5C3B33];
  var HAIR=[0x1B1512,0x2E1F14,0x4A2F1B,0x6E4A22,0xB08A48,0x8A3D22,0x9A9A96];
  var CAPC=[0x9E1B1B,0xFFC72C,0x2C3E63,0x24262B,0xF2F2F0,0x3F7D45];
  var PACK=[0x24262B,0x2C3E63,0x8E1D1D,0x555A61,0x4A5240,0x5B4173,0x2E7268,0xA8562B];
  var SHOE=[0xEFEFEA,0x24262B,0xC9C6BE,0x8E1D1D,0x2C3E63];
  var EYE=0x1B1B20;

  var m4=new T.Matrix4(), qq=new T.Quaternion(), sv=new T.Vector3(), pv=new T.Vector3();
  function MT(x,y,z,rx,sx,sy,sz){
    qq.setFromEuler(new T.Euler(rx||0,0,0));
    return m4.compose(pv.set(x,y,z), qq,
      sv.set(sx===undefined?1:sx, sy===undefined?1:sy, sz===undefined?1:sz)).clone();
  }
  var mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});

  function buildVariant(v){
    var skin=SKIN[v.s], shirt=SHIRT[v.t], pant=PANT[v.p], shoe=SHOE[v.sh];
    /* head: skin ball, two eyes, and hair or a cap on top */
    var head=new GeoBag();
    head.add(new T.IcosahedronGeometry(0.37,0), MT(0,0.37,0,0,1.0,1.03,0.95), skin);
    head.add(new T.BoxGeometry(0.085,0.125,0.06), MT(-0.145,0.365,-0.315), EYE);
    head.add(new T.BoxGeometry(0.085,0.125,0.06), MT( 0.145,0.365,-0.315), EYE);
    if(v.hat===0){                                   /* hair */
      head.add(new T.IcosahedronGeometry(0.385,0), MT(0,0.415,0.045,0,1.0,0.86,0.98), HAIR[v.hc]);
    } else if(v.hat===1){                            /* baseball cap */
      head.add(new T.CylinderGeometry(0.255,0.400,0.24,7), MT(0,0.615,0.01), CAPC[v.hc]);
      head.add(new T.BoxGeometry(0.33,0.06,0.24), MT(0,0.512,-0.30), CAPC[v.hc]);
    } else {                                         /* beanie */
      head.add(new T.CylinderGeometry(0.30,0.40,0.30,7), MT(0,0.60,0.01), CAPC[v.hc]);
      head.add(new T.IcosahedronGeometry(0.075,0), MT(0,0.78,0.01), CAPC[v.hc]);
    }
    /* torso: shirt, a strip of neck, and usually a backpack */
    var body=new GeoBag();
    body.add(new T.CylinderGeometry(0.300,0.360,0.42,8), MT(0,0.21,0), shirt);
    if(v.pk>=0){
      var pc=PACK[v.pk];
      body.add(new T.BoxGeometry(0.40,0.46,0.24), MT(0,0.27,0.335), pc);
      body.add(new T.BoxGeometry(0.44,0.09,0.62), MT(0,0.40,0.06), pc);
    }
    var arm=new GeoBag();
    arm.add(new T.CylinderGeometry(0.082,0.072,0.29,5), MT(0,-0.145,0), v.sleeve?shirt:skin);
    var leg=new GeoBag();
    leg.add(new T.CylinderGeometry(0.105,0.098,0.26,5), MT(0,-0.13,0), pant);
    leg.add(new T.BoxGeometry(0.195,0.115,0.25), MT(0,-0.305,-0.03), shoe);
    return {head:head.geom(), body:body.geom(), arm:arm.geom(), leg:leg.geom()};
  }

  /* spread skin tones evenly across the variants, randomise everything else */
  var defs=[];
  for(var v=0;v<VARIANTS;v++){
    defs.push({ s:v%SKIN.length,
                t:(rnd()*SHIRT.length)|0,
                p:(rnd()*PANT.length)|0,
                sh:(rnd()*SHOE.length)|0,
                hat:(rnd()<0.55?0:(rnd()<0.78?1:2)),
                hc:0, pk:(rnd()<0.74?((rnd()*PACK.length)|0):-1),
                sleeve:rnd()<0.42 });
    defs[v].hc = defs[v].hat===0 ? (rnd()*HAIR.length)|0 : (rnd()*CAPC.length)|0;
  }

  /* ---- the students themselves: alone, or in twos and threes ---- */
  var counts=new Array(VARIANTS); for(i=0;i<VARIANTS;i++) counts[i]=0;
  function person(lead,gi){
    var r=rnd(), sp=r<0.25?rr(0.95,1.15):(r<0.8?rr(1.2,1.5):rr(1.55,1.9));   /* strollers .. late for class */
    var vi=(rnd()*VARIANTS)|0;
    var keepRight=rnd()<0.75;
    var s={i:STU.length,v:vi,slot:counts[vi]++,scale:rr(1.00,1.18),ph:rr(0,6.28),ph2:rr(0,6.28),
           x:0,z:0,yaw:rr(-3.14,3.14),fx:0,fz:-1,mv:0,vel:0,sp:sp,
           st:S_WALK,tm:0,d:-1,tab:null,a:-1,b:-1,ax:0,az:0,ux:1,uz:0,L:1,hr:0,hl:0,
           lat:0,lf:0,lfT:0,lfLo:keepRight?0.15:-0.85,lfHi:keepRight?0.9:0.85,lfTm:0,dg:0,
           tx:0,tz:0,face:0,lead:lead,gi:gi,gn:1,seat:-1,vis:1,hid:0,near:0,stuck:0,pause:0,
           next:-1};
    s.lfT=s.lf=rr(s.lfLo,s.lfHi);
    STU.push(s); return s;
  }
  var nGroups=0;
  while(STU.length<CROWD_N){
    var Ld=person(-1,0), r2=rnd(), gn=r2<0.66?1:(r2<0.9?2:3);
    gn=Math.min(gn,CROWD_N-STU.length+1); Ld.gn=gn;
    if(gn>1){ nGroups++; var gsp=Ld.sp;
      for(k=1;k<gn;k++){ var F=person(Ld.i,k); gsp=Math.min(gsp,F.sp); }
      Ld.sp=Math.max(0.95,gsp*0.95); }
  }

  /* ---- build one instanced set per variant ---- */
  var tint=new T.Color();
  for(v=0;v<VARIANTS;v++){
    var g=buildVariant(defs[v]), cN=Math.max(1,counts[v]);
    var mk=function(geo){ var m=new T.InstancedMesh(geo,mat,cN);
      m.frustumCulled=false; m.instanceMatrix.setUsage(T.DynamicDrawUsage);
      m.raycast=function(){}; scene.add(m); return m; };
    VAR.push({head:mk(g.head), body:mk(g.body),
              armL:mk(g.arm), armR:mk(g.arm), legL:mk(g.leg), legR:mk(g.leg)});
  }
  for(i=0;i<STU.length;i++){
    var s=STU[i], V=VAR[s.v], bb=rr(0.94,1.06);
    tint.setRGB(bb,bb*rr(0.995,1.005),bb*rr(0.99,1.01));
    V.head.setColorAt(s.slot,tint); V.body.setColorAt(s.slot,tint);
    V.armL.setColorAt(s.slot,tint); V.armR.setColorAt(s.slot,tint);
    V.legL.setColorAt(s.slot,tint); V.legR.setColorAt(s.slot,tint);
  }
  for(v=0;v<VARIANTS;v++){
    var V2=VAR[v];
    ['head','body','armL','armR','legL','legR'].forEach(function(kk){
      if(V2[kk].instanceColor) V2[kk].instanceColor.needsUpdate=true; });
  }

  /* ================================================= behaviour ===== */
  var _rootM=new T.Matrix4(), _partM=new T.Matrix4(), _outM=new T.Matrix4(), _zero=new T.Matrix4().makeScale(0,0,0),
      _qq=new T.Quaternion(), _pp=new T.Vector3(), _ss=new T.Vector3(1,1,1), _ee=new T.Euler();
  function setEdge(s,a,b){
    var e=halfEdge(a,b);
    s.a=a; s.b=b; s.ax=gx[a]; s.az=gz[a];
    var dx=gx[b]-gx[a], dz=gz[b]-gz[a], L=Math.hypot(dx,dz)||1;
    s.ux=dx/L; s.uz=dz/L; s.L=L;
    s.hr=e>=0?hr[e]:0; s.hl=e>=0?hl[e]:0;
  }
  /* head off to destination di from node n0 (where they are now) */
  function startTrip(s,di,n0){
    var D=DEST[di];
    s.d=di; s.tab=nextTable(D.n); s.st=S_WALK; s.stuck=0;
    if(n0===D.n||s.tab[n0]<0){ arrive(s); return; }
    setEdge(s,n0,s.tab[n0]);
  }
  function newTrip(s){
    var D=s.d>=0?DEST[s.d]:null;
    var n0=D?D.n:nearestNode(s.x,s.z,60);
    if(n0<0) n0=DEST[0].n;
    startTrip(s,chooseDest(s.x,s.z,s.d),n0);
  }
  function members(L,fn){ for(var m=1;m<L.gn;m++) fn(STU[L.i+m],m); }
  /* got there: go in, sit, stand about, or carry straight on */
  function arrive(s){
    var D=DEST[s.d], r=rnd();
    CROWD_DEV.arr[D.kind]++;
    s.dg=0;
    if(D.kind===D_DOOR||D.kind===D_TRAIN){
      if(r<(D.kind===D_TRAIN?0.92:0.6)){ s.st=S_GO; s.tx=D.x; s.tz=D.z; s.next=S_IN; return; }
      return stand(s,D,rr(15,60));
    }
    if(D.kind===D_BENCH&&s.gn<=2&&r<0.85){
      var Bn=BENCHES[D.ref], base=D.ref*2, seat=-1;
      if(!SEATS[base]&&(s.gn===1||!SEATS[base+1])) seat=base; else if(!SEATS[base+1]&&s.gn===1) seat=base+1;
      if(seat>=0){ sitAt(s,seat,Bn);
        if(s.gn===2) sitAt(STU[s.i+1],seat^1,Bn);
        s.tm=rr(40,180); return; }
    }
    if(r<(D.kind===D_PLAZA?0.8:0.7)) return stand(s,D,D.kind===D_PLAZA?rr(30,150):rr(20,90));
    newTrip(s);
  }
  function sitAt(s,seat,Bn){
    SEATS[seat]=1; s.seat=seat;
    var lx=(seat&1)?0.45:-0.45, lz=0.12, c=Math.cos(Bn[2]), sn=Math.sin(Bn[2]);
    s.tx=Bn[0]+c*lx+sn*lz; s.tz=Bn[1]-sn*lx+c*lz; s.face=Bn[2]+Math.PI;
    s.st=S_GO; s.next=S_SIT;
  }
  /* stand near the destination, facing what they came for, or each other if in a group */
  function stand(s,D,t){
    var a=rr(0,6.28), rad=D.kind===D_PLAZA?rr(0.5,3.5):rr(0,1.4);
    var x=D.n>=0?gx[D.n]:s.x, z=D.n>=0?gz[D.n]:s.z;
    if(D.kind===D_DOOR){ x=gx[D.n]*0.6+D.fx*0.4; z=gz[D.n]*0.6+D.fz*0.4; rad=0.4; }
    var px=x+Math.cos(a)*rad, pz=z+Math.sin(a)*rad;
    if(crowdBlocked(px,pz,0.3)){ px=gx[D.n]; pz=gz[D.n]; }
    s.tx=px; s.tz=pz; s.st=S_GO; s.next=S_STAND; s.tm=t;
    var fdx=D.fx-px, fdz=D.fz-pz;
    s.face=(Math.abs(fdx)+Math.abs(fdz)>0.5)?Math.atan2(-fdx,-fdz)+rr(-0.6,0.6):rr(-3.14,3.14);
    if(s.gn>1){                                    /* a little circle */
      var R=0.55+0.1*s.gn;
      s.tx=px+Math.cos(a)*R; s.tz=pz+Math.sin(a)*R; s.face=Math.atan2(-(px-s.tx),-(pz-s.tz));
      if(crowdBlocked(s.tx,s.tz,0.3)){ s.tx=px; s.tz=pz; }
      members(s,function(F,m){ var b=a+6.283*m/s.gn;
        F.tx=px+Math.cos(b)*R; F.tz=pz+Math.sin(b)*R;
        if(crowdBlocked(F.tx,F.tz,0.3)){ F.tx=px-Math.cos(a)*R; F.tz=pz-Math.sin(a)*R; } F.face=Math.atan2(-(px-F.tx),-(pz-F.tz));
        F.st=S_GO; F.next=S_STAND; });
    }
  }
  function hide(s){ s.st=S_IN; s.hid=1; s.vis=0; writeHidden(s); }
  /* back out of a building (or up from the station), then off somewhere */
  function emerge(s){
    var di=DOORS[pickW(OCUM,OTOT)], D=DEST[di];
    s.d=di; s.x=D.x; s.z=D.z; s.hid=0; s.vis=0.01;
    s.tx=gx[D.n]; s.tz=gz[D.n]; s.st=S_OUT; s.yaw=Math.atan2(-(s.tx-s.x),-(s.tz-s.z));
    members(s,function(F,m){ F.x=D.x+rr(-0.4,0.4); F.z=D.z+rr(-0.4,0.4); F.hid=0; F.vis=0.01; F.st=S_WALK; F.yaw=s.yaw; });
  }

  /* ---- initial placement: mid-trip, standing about, sitting, or inside ---- */
  function walkAlong(s,dist){
    var guard=0;
    while(dist>s.L&&s.b!==DEST[s.d].n&&guard++<400){ dist-=s.L; setEdge(s,s.b,s.tab[s.b]); }
    dist=Math.min(dist,s.L*0.9);
    var lat=s.lf>=0?s.lf*s.hr:s.lf*s.hl; s.lat=lat;
    s.x=s.ax+s.ux*dist-s.uz*lat; s.z=s.az+s.uz*dist+s.ux*lat;
    s.yaw=Math.atan2(-s.ux,-s.uz);
  }
  for(i=0;i<STU.length;i++){
    var L0=STU[i]; if(L0.lead>=0) continue;
    var r3=rnd(), di0=pickW(DCUM,DTOT), D0=DEST[di0];
    L0.d=di0; L0.x=gx[D0.n]; L0.z=gz[D0.n];
    if(r3<0.08){ hide(L0); L0.tm=rr(1,90); members(L0,function(F){ hide(F); }); continue; }
    if(r3<0.34){
      arrive(L0);
      /* skip the short walk to the spot */
      var snap=function(S2){ if(S2.st===S_GO){ S2.x=S2.tx; S2.z=S2.tz; S2.yaw=S2.face; S2.st=S2.next;
          if(S2.st===S_IN) hide(S2); } };
      snap(L0); members(L0,function(F){ F.x=L0.x+rr(-0.5,0.5); F.z=L0.z+rr(-0.5,0.5); snap(F); });
      if(L0.st===S_IN){ L0.tm=rr(1,90); members(L0,function(F){ hide(F); }); }
      else if(L0.st===S_STAND||L0.st===S_SIT) L0.tm*=rnd();
      if(L0.st===S_WALK) walkAlong(L0,rr(0,40));
      continue;
    }
    newTrip(L0);
    if(L0.st===S_WALK) walkAlong(L0,rr(0,260));
    members(L0,function(F,m){ F.x=L0.x-L0.ux*0.9*m+rr(-0.3,0.3); F.z=L0.z-L0.uz*0.9*m+rr(-0.3,0.3); F.yaw=L0.yaw; });
  }

  var dv={stu:STU,dest:DEST,g:CG,nearestNode:nearestNode,hot:hot,
             groups:nGroups,comps:csize.filter(function(c){ return c>=40; }).sort(function(a,b){ return b-a; }),
             nodes:N,edges:H/2,buildMs:0,n0:N0,segs:SEG.length,small:csize.filter(function(c){ return c<40; }).reduce(function(a,b){ return a+b; },0),
             blocked:crowdBlocked,onWalk:onWalk,paths:PATHS,arr:CROWD_DEV.arr};
  for(var dk in dv) CROWD_DEV[dk]=dv[dk];
  CROWD_DEV.buildMs=Math.round(performance.now()-t0);

  /* ================================================ per frame ===== */
  var HB=4096, HMASK=HB-1, HCELL=2.2, hHead=new Int32Array(HB), hNext=new Int32Array(STU.length);
  var NEAR_R=130, frameNo=0;
  function hkey(cx,cz){ return ((cx*73856093)^(cz*19349663))&HMASK; }
  function wrap(a){ while(a>Math.PI) a-=6.2832; while(a<-Math.PI) a+=6.2832; return a; }
  /* turn toward (tx,tz) and walk at speed v; returns distance left */
  function steer(s,tx,tz,v,dt){
    var dx=tx-s.x, dz=tz-s.z, d=Math.hypot(dx,dz);
    if(d<1e-4){ s.vel=0; return 0; }
    var want=Math.atan2(-dx,-dz), dy=wrap(want-s.yaw), mt=3.4*dt;
    s.yaw=wrap(s.yaw+(dy>mt?mt:(dy<-mt?-mt:dy)));
    var ad=Math.abs(dy), vv=v*(ad>1.2?0.35:1-ad*0.45);
    if(vv*dt>d) vv=d/dt;
    s.fx=-Math.sin(s.yaw); s.fz=-Math.cos(s.yaw);
    s.x+=s.fx*vv*dt; s.z+=s.fz*vv*dt; s.vel=vv;
    return d;
  }
  /* look at the people nearby: keep apart, pass oncoming on the right, slow behind */
  function avoid(s,dt){
    var cx=Math.floor(s.x/HCELL), cz=Math.floor(s.z/HCELL), vm=1, px=0, pz=0;
    var fx=s.fx, fz=s.fz, rx=-fz, rz=fx, moving=s.st===S_WALK;
    var grp=s.lead>=0?s.lead:s.i;
    for(var a=-1;a<=1;a++) for(var b=-1;b<=1;b++){
      for(var j=hHead[hkey(cx+a,cz+b)];j>=0;j=hNext[j]){
        if(j===s.i) continue;
        var o=STU[j], dx=o.x-s.x, dz=o.z-s.z, d2=dx*dx+dz*dz;
        if(d2>9||d2<1e-8) continue;
        var same=(o.lead>=0?o.lead:o.i)===grp, d=Math.sqrt(d2);
        var room=same?0.55:0.72;
        if(d<room){ var k=(room-d)*0.5/d; px-=dx*k; pz-=dz*k; }
        if(!moving||same) continue;
        var ahead=dx*fx+dz*fz; if(ahead<=0||ahead>3) continue;
        var side=dx*rx+dz*rz; if(side>1.1||side<-1.1) continue;
        var urg=1-ahead/3, om=o.vel>0.2, dot=om?fx*o.fx+fz*o.fz:0;
        if(om&&dot<-0.3){                          /* coming the other way */
          s.dg+=(side>0.15?-1:1)*urg*2.4*dt;
        } else if(om&&dot>0.5){                    /* same way, in front */
          if(ahead<1.6&&side<0.65&&side>-0.65){
            if(s.sp>o.vel+0.12) s.dg+=(side>0?-1:1)*1.6*dt;    /* overtake on the left */
            vm=Math.min(vm,Math.max(0.35,(ahead-0.5)/1.1));
          }
        } else if(side<0.85&&side>-0.85){          /* standing, or crossing in front */
          s.dg+=(side>0.05?-1:1)*urg*2.2*dt;
          if(ahead<1.0) vm=Math.min(vm,0.55);
        }
      }
    }
    /* the player is somebody too */
    var qx=P.x-s.x, qz=P.z-s.z, qd=Math.hypot(qx,qz);
    if(qd<3&&qd>1e-4){
      if(qd<0.85){ var k2=(0.85-qd)/qd; px-=qx*k2; pz-=qz*k2; }
      var ah=qx*fx+qz*fz, sd=qx*rx+qz*rz;
      if(moving&&ah>0&&sd<1.1&&sd>-1.1){ s.dg+=(sd>0?-1:1)*(1-ah/3)*2.6*dt; if(ah<1.1) vm=Math.min(vm,0.5); }
    }
    var pl=Math.hypot(px,pz), cap=1.5*dt;
    if(pl>cap){ px*=cap/pl; pz*=cap/pl; }
    if(s.st===S_SIT){ px=0; pz=0; }
    s.x+=px; s.z+=pz;
    return vm;
  }
  function walk(s,dt,vm){
    var D=DEST[s.d];
    /* lane: a preferred place across the walk that drifts now and then */
    s.lfTm-=dt; if(s.lfTm<=0){ s.lfTm=rr(4,14); s.lfT=rr(s.lfLo,s.lfHi); }
    s.lf+=(s.lfT-s.lf)*Math.min(1,dt*0.25);
    s.dg*=Math.max(0,1-dt*0.7);
    if(s.dg>1.4) s.dg=1.4; else if(s.dg<-1.4) s.dg=-1.4;
    var want=(s.lf>=0?s.lf*s.hr:s.lf*s.hl)+s.dg;
    if(want>s.hr+0.25) want=s.hr+0.25; else if(want<-s.hl-0.25) want=-s.hl-0.25;
    s.lat+=(want-s.lat)*Math.min(1,dt*1.6);
    var t=(s.x-s.ax)*s.ux+(s.z-s.az)*s.uz, half=(s.hr+s.hl)*0.5;
    var cut=Math.min(1.4+half*0.45,s.L*0.45);
    if(s.b===D.n){
      if(t>s.L-Math.max(0.9,cut*0.6)) { arrive(s); return; }
    } else if(t>s.L-cut){
      var nb2=s.tab[s.b];
      setEdge(s,s.b,nb2);
      if(rnd()<0.012&&s.gn===1&&s.lead<0) s.pause=rr(1.5,5);     /* a look at the phone */
      t=(s.x-s.ax)*s.ux+(s.z-s.az)*s.uz;
    }
    var la=1.4+s.sp*0.8, tt=t+la, tx, tz;
    if(tt<=s.L||s.b===D.n){ tt=Math.min(tt,s.L);
      tx=s.ax+s.ux*tt-s.uz*s.lat; tz=s.az+s.uz*tt+s.ux*s.lat; }
    else {                                          /* round the corner onto the next walk */
      var c=s.tab[s.b], dx=gx[c]-gx[s.b], dz=gz[c]-gz[s.b], L2=Math.hypot(dx,dz)||1, rem=Math.min(tt-s.L,L2);
      dx/=L2; dz/=L2;
      tx=gx[s.b]+dx*rem-dz*s.lat; tz=gz[s.b]+dz*rem+dx*s.lat;
    }
    var v=s.sp*(1+0.05*Math.sin(s.ph2))*vm;
    if(s.pause>0){ s.pause-=dt; v=0; s.vel=0; return; }
    steer(s,tx,tz,v,dt);
  }
  /* followers keep beside (or behind, on a narrow walk) whoever leads */
  function follow(s,dt,vm){
    var L=STU[s.lead];
    if(L.hid){ if(!s.hid&&(s.st!==S_GO||s.next!==S_IN)) hide(s); return; }
    if(s.hid) return;
    if(L.st===S_WALK||L.st===S_OUT||(L.st===S_GO&&s.st!==S_GO)){
      var half=L.st===S_WALK?(L.hr+L.hl)*0.5:2, wide=half>1.2;
      var rs=L.lat>0?-1:1, offR, offF;
      if(wide){ offR=(s.gi===1?rs:-rs)*0.8; offF=-0.12*s.gi; }
      else { offR=0; offF=-0.95*s.gi; }
      if(L.st===S_GO&&L.next===S_IN){ offR*=0.3; offF=-0.6*s.gi; }
      var lx=-L.fz, lz=L.fx;
      var tx=L.x+lx*offR+L.fx*offF, tz=L.z+lz*offR+L.fz*offF;
      var d=Math.hypot(tx-s.x,tz-s.z), ahead=(tx-s.x)*L.fx+(tz-s.z)*L.fz;
      var v=Math.max(0,L.vel)*Math.max(0.5,Math.min(1.5,1+ahead*0.6))+(d>0.3?0.25:0);
      if(L.vel<0.05&&d<0.35){ s.vel=0; s.yaw+=wrap(L.yaw-s.yaw)*Math.min(1,dt*3); return; }
      steer(s,tx,tz,v*vm,dt);
      if(L.st===S_GO&&L.next===S_IN&&Math.hypot(s.x-L.tx,s.z-L.tz)<1.2){ s.vis=Math.max(0,s.vis-dt*3); }
      s.st=S_WALK;
      return;
    }
    if(s.st===S_GO) goTo(s,dt,1);
    else if(s.st===S_STAND||s.st===S_SIT){ idle(s,dt); if(L.st===S_WALK||L.st===S_OUT) s.st=S_WALK; }
  }
  /* off the graph, a few steps to a door, seat or standing place */
  function goTo(s,dt,vm){
    var d=steer(s,s.tx,s.tz,Math.min(s.sp,1.25)*vm,dt);
    if(s.next===S_IN&&d<0.9) s.vis=Math.max(0,d/0.9);
    if(d<0.12){
      s.x=s.tx; s.z=s.tz; s.vel=0;
      if(s.next===S_IN){ hide(s); CROWD_DEV.enter++; s.tm=s.lead<0?(DEST[s.d].kind===D_TRAIN?rr(40,160):rr(20,120)):0; return; }
      s.st=s.next;
    }
  }
  function idle(s,dt){
    s.vel=0;
    s.yaw+=wrap(s.face-s.yaw)*Math.min(1,dt*2.5);
    if(s.lead<0) s.face+=Math.sin(s.ph2*0.7)*dt*0.12;
  }
  function freeSeat(s){ if(s.seat>=0){ SEATS[s.seat]=0; s.seat=-1; } }

  /* ---- pose ---- */
  function part(root,x,y,z,rx){
    _ee.set(rx||0,0,0); _qq.setFromEuler(_ee); _ss.set(1,1,1);
    _partM.compose(_pp.set(x,y,z),_qq,_ss);
    return _outM.multiplyMatrices(root,_partM);
  }
  function writeHidden(s){ var V=VAR[s.v];
    V.head.setMatrixAt(s.slot,_zero); V.body.setMatrixAt(s.slot,_zero);
    V.armL.setMatrixAt(s.slot,_zero); V.armR.setMatrixAt(s.slot,_zero);
    V.legL.setMatrixAt(s.slot,_zero); V.legR.setMatrixAt(s.slot,_zero); }
  function pose(s){
    var V=VAR[s.v], sc=s.scale*s.vis;
    _ee.set(0,s.yaw,0); _qq.setFromEuler(_ee); _ss.set(sc,sc,sc);
    if(s.st===S_SIT){
      _rootM.compose(_pp.set(s.x,0.51-0.34*sc,s.z),_qq,_ss);
      var br=Math.sin(s.ph)*0.03;
      V.body.setMatrixAt(s.slot, part(_rootM,0,0.34,0,-0.05));
      V.head.setMatrixAt(s.slot, part(_rootM,0,0.735,0,br));
      V.armL.setMatrixAt(s.slot, part(_rootM,-0.295,0.74,0,0.55));
      V.armR.setMatrixAt(s.slot, part(_rootM, 0.295,0.74,0,0.55));
      V.legL.setMatrixAt(s.slot, part(_rootM,-0.125,0.36,0,1.25));
      V.legR.setMatrixAt(s.slot, part(_rootM, 0.125,0.36,0,1.15));
      return;
    }
    var amp=s.vel>0.15?Math.min(1,s.vel/1.25):0.12;
    var swing=Math.sin(s.ph)*amp, bob=Math.abs(Math.cos(s.ph))*0.035*amp;
    _rootM.compose(_pp.set(s.x,0.02+bob*sc,s.z),_qq,_ss);
    V.body.setMatrixAt(s.slot, part(_rootM,0,0.34,0,swing*0.045));
    V.head.setMatrixAt(s.slot, part(_rootM,0,0.735,0,swing*0.035));
    V.armL.setMatrixAt(s.slot, part(_rootM,-0.295,0.74,0,-swing*0.62));
    V.armR.setMatrixAt(s.slot, part(_rootM, 0.295,0.74,0, swing*0.62));
    V.legL.setMatrixAt(s.slot, part(_rootM,-0.125,0.36,0, swing*0.80));
    V.legR.setMatrixAt(s.slot, part(_rootM, 0.125,0.36,0,-swing*0.80));
  }

  updateCrowd=function(dt){
    var i,s,n=STU.length, cx=camera.position.x, cz=camera.position.z, R2=NEAR_R*NEAR_R;
    frameNo++;
    /* spatial hash of everyone near the camera */
    hHead.fill(-1);
    for(i=0;i<n;i++){ s=STU[i];
      var ddx=s.x-cx, ddz=s.z-cz;
      s.near=(!s.hid&&ddx*ddx+ddz*ddz<R2)?1:0;
      if(!s.near) continue;
      var h=hkey(Math.floor(s.x/HCELL),Math.floor(s.z/HCELL)); hNext[i]=hHead[h]; hHead[h]=i; }
    for(i=0;i<n;i++){ s=STU[i];
      var x0=s.x, z0=s.z;
      s.ph2+=dt*0.31;
      if(s.st===S_IN){
        if(s.lead<0){ s.tm-=dt; if(s.tm<=0) emerge(s); }       /* followers come out with their leader */
        if(s.st===S_IN) continue;
      }
      if(s.vis<1&&!s.hid&&!(s.st===S_GO&&s.next===S_IN)) s.vis=Math.min(1,s.vis+dt*3);
      var vm=s.near?avoid(s,dt):1;
      if(s.lead>=0) follow(s,dt,vm);
      else if(s.st===S_WALK) walk(s,dt,vm);
      else if(s.st===S_GO) goTo(s,dt,vm);
      else if(s.st===S_OUT){
        if(steer(s,s.tx,s.tz,s.sp,dt)<0.6){ var D=DEST[s.d]; s.d=-1; startTrip(s,chooseDest(s.x,s.z,-1),D.n); }
      }
      else if(s.st===S_STAND||s.st===S_SIT){
        idle(s,dt); s.tm-=dt;
        if(s.tm<=0){ freeSeat(s); members(s,function(F){ freeSeat(F); });
          newTrip(s); }
      }
      if(s.hid) continue;
      s.ph+=dt*(s.vel>0.15?s.vel*3.6:0.9);
      /* someone not getting anywhere for a long time is put back on the walk */
      var moved=Math.abs(s.x-x0)+Math.abs(s.z-z0);
      if(s.st===S_WALK&&s.lead<0&&s.pause<=0){
        s.stuck=moved<0.15*dt?s.stuck+dt:Math.max(0,s.stuck-dt);
        if(s.stuck>8){ s.stuck=0; s.x=s.ax; s.z=s.az; CROWD_DEV.unstuck=(CROWD_DEV.unstuck||0)+1; }
      }
    }
    /* matrices: every frame near the camera, every third frame further out (sixth on the
       lowest rungs of the frame-rate ladder), and not at all past the fog */
    var every=(typeof QL==='number'&&QL>=3)?6:3, fk=frameNo%every,
        fog=scene.fog?scene.fog.far+40:1e9, F2=fog*fog;
    for(i=0;i<n;i++){ s=STU[i];
      if(s.hid){ if(s.vis>=0){ writeHidden(s); s.vis=-1; } continue; }
      if(!s.near){ if((i%every)!==fk) continue;
        var ex=s.x-cx, ez=s.z-cz; if(ex*ex+ez*ez>F2) continue; }
      pose(s);
    }
    for(i=0;i<VAR.length;i++){
      var W=VAR[i];
      W.head.instanceMatrix.needsUpdate=true; W.body.instanceMatrix.needsUpdate=true;
      W.armL.instanceMatrix.needsUpdate=true; W.armR.instanceMatrix.needsUpdate=true;
      W.legL.instanceMatrix.needsUpdate=true; W.legR.instanceMatrix.needsUpdate=true;
    }
    /* the murmur of a populated campus */
    if(murmurGain){
      var near=0;
      for(i=0;i<n;i+=3){ s=STU[i]; if(s.hid) continue;
        var d2=(s.x-P.x)*(s.x-P.x)+(s.z-P.z)*(s.z-P.z);
        if(d2<3600) near++;
      }
      var want=Math.min(0.10, near*0.0042);
      murmurGain.gain.value += (want-murmurGain.gain.value)*Math.min(1,dt*1.5);
    }
  };
  for(i=0;i<STU.length;i++){ if(STU[i].hid) writeHidden(STU[i]); else pose(STU[i]); }
})();

var updateCrowd=updateCrowd||function(){};

/* shove anyone standing where you just arrived, so they never block the view */
function nudgeCrowd(x,z,r){
  for(var i=0;i<STU.length;i++){
    var s=STU[i], dx=s.x-x, dz=s.z-z, d=Math.hypot(dx,dz);
    if(d>r||s.hid) continue;
    if(d<1e-3){ dx=1; dz=0; d=1; }
    s.x=x+dx/d*r; s.z=z+dz/d*r;
  }
}
