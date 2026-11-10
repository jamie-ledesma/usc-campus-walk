/* ==================================================================
   Bohnett Residential College (USC Village), built with the Village kit VK (a2zm_village_kit.js).
   The north half of Village Building 8 (Nemirovsky and Bohnett Residential College, 3201 S Hoover St):
   Collegiate Gothic, five storeys (a 5.5 m retail ground floor, four residential floors of 3.2 m, eave 18.3 like Nemirovsky),
   red brick with cast stone bands, cream stone oriel bays with lancets, gables, dark tile hip roof
   round a courtyard over the shops.
   Fronts: SW and NW on the plaza garden (Hecuba), north on the street to the Hoover St entrance,
   east on Hoover, the south side joins Nemirovsky (only its notch toward Hoover shows).
   Shops (uscvillage.com directory map): NW front Il Giardino 1850, Bruxie 1845, CAVA 1840; SW front
   Jimmy John's 1835, Simply Nail Bar 1830 and 1824; retail 1860 on the north front. The BOHNETT
   plaque sits on the band over the plaza arches, next to CAVA (photos).
   ================================================================== */
(function(){
  var B=null; for(var i=0;i<CAMPUS.length;i++) if(CAMPUS[i].name==='Bohnett Residential College') B=CAMPUS[i];
  if(!B||typeof VK==='undefined') return;
  var C=VK.C, TL=VK.TILE, M=VK.M, n0=[VK.MB.count(),VK.MA.count(),VK.MP.count(),M.count()];
  var R=B.ring.slice(); if(ringArea(R)<0) R.reverse();
  var N=R.length, cx=0, cz=0; R.forEach(function(p){ cx+=p[0]/N; cz+=p[1]/N; });
  function near(x,z){ var bi=0,bd=1e9; R.forEach(function(p,k){ var d=Math.hypot(p[0]-x,p[1]-z); if(d<bd){ bd=d; bi=k; } }); return R[bi]; }
  var PA=near(89,-449), PX=near(74,-484), PN=near(92,-516), PD=near(118,-515), PE=near(125,-460), PF=near(103.5,-455.7);

  /* heights */
  var GT=4.85, BELT=5.5, FH=3.2, EAVE=BELT+4*FH, RISE=4.3, OVH=0.55, WING=14, YR=EAVE+RISE;

  /* faces: outward from the footprint (or toward the courtyard centre when inner) */
  function faceOf(a,b,inner,ox,oz){ var mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, dx=b[0]-a[0], dz=b[1]-a[1], n=[dz,-dx];
    var away=n[0]*(mx-ox)+n[1]*(mz-oz)>0; if(away===!!inner) n=[-n[0],-n[1]]; return VK.face(a,b,n); }
  function sOf(F,p){ return (p[0]-F.A[0])*F.t[0]+(p[1]-F.A[1])*F.t[1]; }
  /* an s range d0..d1 metres in from point P (one end of the face) */
  function from(F,P,d0,d1){ var s=sOf(F,P); return s<F.L/2?[s+d0,s+d1]:[s-d1,s-d0]; }
  function hit(ex,s,hw){ for(var k=0;k<ex.length;k++) if(s+hw>ex[k][0]-0.15&&s-hw<ex[k][1]+0.15) return true; return false; }
  function cols(F,m0,m1,pitch){ var n=Math.max(1,Math.floor((F.L-m0-m1)/pitch)), p=(F.L-m0-m1)/n, o=[]; for(var k=0;k<n;k++) o.push(m0+p*(k+0.5)); return o; }

  /* a window on floor k (0..3 above the shops); the top floor gets arched heads */
  function win(F,s,k,sill){
    var y=BELT+k*FH;
    if(k===3) F.tile(TL.WIN_ARCH,s-1.0,s+1.0,y+0.22,y+2.6);
    else F.tile(TL.WIN,s-1.0,s+1.0,y+0.45,y+2.9);
    if(sill) F.block(s-0.8,s+0.8,0,0.1,y+(k===3?0.16:0.39),y+(k===3?0.32:0.55),C.CAST_L,0.7);
  }
  function uppers(F,list,ex,sill){ list.forEach(function(s){ if(hit(ex,s,1.0)) return; for(var k=0;k<4;k++) win(F,s,k,sill); }); }

  /* ground floor: shopfronts under round arches (plaza), square shopfronts (street) */
  function arches(F,m0,m1,skipKey){
    var cs=cols(F,m0,m1,5.2), p=cs.length>1?cs[1]-cs[0]:F.L-m0-m1;
    cs.forEach(function(c,k){ F.tile(TL.SHOP_ARCH,c-p/2+0.45,c+p/2-0.45,0.55,GT-0.05);
      if(!(skipKey&&skipKey[k])) F.block(c-0.26,c+0.26,0,0.13,GT-0.72,GT,C.CAST_L,0.8);
      if(k<cs.length-1){ var q=c+p/2;   /* bronze lantern on the pier between arches */
        F.block(q-0.05,q+0.05,0,0.32,3.15,3.25,C.BRONZE,0.8); F.block(q-0.13,q+0.13,0.2,0.46,2.6,3.15,C.DARK,0.85);
        F.block(q-0.17,q+0.17,0.16,0.5,3.15,3.26,C.BRONZE,0.8); } });
    return {cs:cs,p:p};
  }
  function shops(F,m0,m1){
    var cs=cols(F,m0,m1,5.0), p=cs.length>1?cs[1]-cs[0]:F.L-m0-m1;
    cs.forEach(function(c){ F.tile(TL.SHOP,c-p/2+0.42,c+p/2-0.42,0.55,4.0);
      F.block(c-p/2+0.25,c+p/2-0.25,0,0.12,4.0,4.4,C.CAST,0.8);
      F.block(c+p/2-0.3,c+p/2+0.3,0,0.08,0.55,4.0,C.CAST_D,0.7); });
    return {cs:cs,p:p};
  }
  /* bays seen as pairs of windows over each ground floor bay */
  function pairs(g){ var o=[]; g.cs.forEach(function(c){ o.push(c-g.p/4, c+g.p/4); }); return o; }
  /* the k-th bay counted from point P */
  function bay(F,g,P,k){ return sOf(F,P)<F.L/2?g.cs[k]:g.cs[g.cs.length-1-k]; }

  /* a gable over a bay s0..s1 whose front is at d=dg, roof running back into the main roof */
  function gable(F,s0,s1,dg){
    var c=(s0+s1)/2, hw=(s1-s0)/2, K=1.15, pk=EAVE+hw*K, oh=0.28, dF=dg+0.22, dB=-4.2, th=0.24, eY=EAVE-oh*K;
    var a=[c-hw-oh,eY], t=[c,pk+0.02], b=[c+hw+oh,eY];
    VK.quad(VK.MB,[F.p3(s0,dg,EAVE),F.p3(s1,dg,EAVE),F.p3(c,dg,pk),F.p3(c,dg,pk)],F.want,0xFFFFFF,1,[[s0/2,EAVE],[s1/2,EAVE],[c/2,pk],[c/2,pk]]);
    VK.quad(M,[F.p3(a[0],dF,a[1]),F.p3(t[0],dF,t[1]),F.p3(t[0],dB,t[1]),F.p3(a[0],dB,a[1])],[0,1,0],C.ROOF,0.95);
    VK.quad(M,[F.p3(t[0],dF,t[1]),F.p3(b[0],dF,b[1]),F.p3(b[0],dB,b[1]),F.p3(t[0],dB,t[1])],[0,1,0],C.ROOF,0.9);
    [[a,t],[t,b]].forEach(function(e){ var u=e[0], v=e[1];
      VK.quad(M,[F.p3(u[0],dF,u[1]-th),F.p3(v[0],dF,v[1]-th),F.p3(v[0],dF,v[1]),F.p3(u[0],dF,u[1])],F.want,C.CAST,0.92);
      VK.quad(M,[F.p3(u[0],dF,u[1]-th),F.p3(v[0],dF,v[1]-th),F.p3(v[0],dg,v[1]-th),F.p3(u[0],dg,u[1]-th)],[0,-1,0],C.CAST_D,0.6); });
    F.tile(TL.VENT_ARCH,c-0.5,c+0.5,EAVE+0.15,EAVE+0.15+Math.min(1.3,hw*K-0.55),dg+0.03);
    F.block(c-0.11,c+0.11,dF-0.32,dF-0.1,pk-0.1,pk+0.85,C.CAST,0.8);
  }
  /* cream stone oriel bay s0..s1 from the band to the eave: lancet panels, a Gothic window on top */
  function oriel(F,s0,s1,withGable,k0){
    var dg=0.6;
    F.block(s0+0.25,s1-0.25,0,0.42,BELT-0.6,BELT,C.CAST_D,0.7);
    F.block(s0,s1,0,dg,BELT,EAVE,C.CAST,0.78);
    for(var k=k0||0;k<4;k++){ var y=BELT+k*FH; F.tile(k===3?TL.GOTHIC:TL.ORIEL,s0+0.12,s1-0.12,y+0.12,y+FH-0.1,dg+0.03); }
    for(k=1;k<4;k++) F.block(s0-0.04,s1+0.04,0,dg+0.06,BELT+k*FH-0.08,BELT+k*FH+0.06,C.CAST_L,0.8);
    if(withGable) gable(F,s0,s1,dg);
    else { F.block(s0-0.05,s1+0.05,0,dg+0.06,EAVE-0.2,EAVE+0.9,C.CAST,0.8); F.block(s0-0.12,s1+0.12,-0.05,dg+0.14,EAVE+0.9,EAVE+1.04,C.CAST_L,0.85); }
  }
  /* the Gothic lobby entrance on Hoover: stone frontispiece, buttresses with pinnacles, door under tracery */
  function entrance(F,c){
    F.block(c-3.0,c+3.0,0,0.7,0,7.2,C.CAST,0.78);
    F.block(c-3.15,c+3.15,0,0.86,7.2,7.55,C.CAST_L,0.85);
    [-1,1].forEach(function(sg){ var s=c+sg*2.9;
      F.block(s-0.36,s+0.36,0,1.1,0,6.4,C.CAST_D,0.75); F.block(s-0.3,s+0.3,0,0.95,6.4,7.0,C.CAST_D,0.75);
      F.block(s-0.2,s+0.2,0.3,0.7,7.55,8.7,C.CAST,0.8); });
    F.tile(TL.DOOR,c-1.6,c+1.6,0.12,3.6,0.73);
    F.tile(TL.GOTHIC,c-1.75,c+1.75,3.65,7.05,0.73);
    F.block(c-2.3,c+2.3,0.7,1.5,0,0.16,C.CAST_D,0.7);
    VK.collider(F.ring(c-3.3,c+3.3,0,1.1),7);
  }

  /* ---------- the sign atlas: shop names on the band, the carved BOHNETT plaque (one mesh) ---------- */
  var SG=new VK.TM(), ROWS=[], AT=(function(){
    var cv=document.createElement('canvas'); cv.width=1024; cv.height=512; var g=cv.getContext('2d'); g.clearRect(0,0,1024,512);
    function sp(s){ return s.split('').join(String.fromCharCode(8202)); }
    function row(y0,h,lines){ var w=0; lines.forEach(function(l){ g.font=l.f; w=Math.max(w,g.measureText(sp(l.t)).width); });
      lines.forEach(function(l){ g.font=l.f; g.textAlign='center'; g.textBaseline='middle';
        if(l.hi){ g.fillStyle=l.hi; g.fillText(sp(l.t),512+1.5,y0+l.y+1.5); } g.fillStyle=l.c; g.fillText(sp(l.t),512,y0+l.y); });
      var pad=10, u0=(512-w/2-pad)/1024, u1=(512+w/2+pad)/1024;
      ROWS.push({u0:u0,u1:u1,v0:1-(y0+h)/512,v1:1-y0/512,ar:(w+2*pad)/h}); }
    var SANS='700 50px "Helvetica Neue",Helvetica,Arial,sans-serif', BR='#2C241D';
    ['IL GIARDINO','BRUXIE','CAVA','JIMMY JOHN\u2019S','SIMPLY NAIL BAR'].forEach(function(t,k){ row(k*64,64,[{t:t,f:SANS,c:BR,y:34}]); });
    row(320,128,[{t:'BOHNETT',f:'600 58px Georgia,"Times New Roman",serif',c:'#5E5444',hi:'#FBF5E6',y:46},
                 {t:'RESIDENTIAL COLLEGE',f:'600 30px Georgia,"Times New Roman",serif',c:'#5E5444',hi:'#FBF5E6',y:100}]);
    var t=new T.CanvasTexture(cv); t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return t;
  })();
  function sign(F,r,sc,y,h,d,maxW){ var o=ROWS[r], w=h*o.ar; if(maxW&&w>maxW){ y+=(h-h*maxW/w)/2; h*=maxW/w; w=maxW; }
    VK.quad(SG,[F.p3(sc-w/2,d,y),F.p3(sc+w/2,d,y),F.p3(sc+w/2,d,y+h),F.p3(sc-w/2,d,y+h)],F.want,0xFFFFFF,1,[[o.u0,o.v0],[o.u1,o.v0],[o.u1,o.v1],[o.u0,o.v1]]); }
  function plaque(F,sc){ var h=0.82, w=h*ROWS[5].ar;
    F.block(sc-w/2-0.25,sc+w/2+0.25,0,0.22,GT-0.12,BELT+0.12,C.CAST_L,0.8);
    F.block(sc-w/2-0.35,sc+w/2+0.35,0,0.28,BELT+0.12,BELT+0.22,C.CAST,0.8);
    sign(F,5,sc,GT-0.04,h,0.24); }
  function shopName(F,r,sc){ sign(F,r,sc,GT+0.1,0.62,0.18,4.3); }

  /* ---------- outer walls ---------- */
  var FSW=faceOf(PA,PX,false,cx,cz), FNW=faceOf(PX,PN,false,cx,cz), FNo=faceOf(PN,PD,false,cx,cz),
      FE=faceOf(PD,PE,false,cx,cz), FS1=faceOf(PE,PF,false,cx,cz), FS2=faceOf(PF,PA,false,cx,cz);
  [FSW,FNW,FNo,FE,FS1,FS2].forEach(function(F){ F.brick(0,F.L,0,EAVE,0); });

  /* NW front on the plaza garden: arched shops, oriel with a gable at the north end, oriel at the corner */
  (function(F){
    var g=arches(F,0.8,0.8), oN=from(F,PN,2.0,5.4), oX=from(F,PX,1.0,4.2);
    oriel(F,oN[0],oN[1],true); oriel(F,oX[0],oX[1],false);
    uppers(F,pairs(g),[oN,oX],true);
    shopName(F,0,bay(F,g,PN,0)); shopName(F,1,bay(F,g,PN,1)); plaque(F,bay(F,g,PN,2)); shopName(F,2,bay(F,g,PN,3));
  })(FNW);
  /* SW front on the plaza: arched shops, oriel with a gable at the corner */
  (function(F){
    var g=arches(F,0.8,0.8), oX=from(F,PX,1.0,4.4);
    oriel(F,oX[0],oX[1],true);
    uppers(F,pairs(g),[oX],true);
    shopName(F,3,bay(F,g,PX,1)); shopName(F,4,bay(F,g,PX,3));
  })(FSW);
  /* north front on the street to the Hoover entrance: square shopfronts, centre oriel with a gable */
  (function(F){
    var g=shops(F,0.9,0.9), c=F.L/2, o=[c-1.7,c+1.7];
    oriel(F,o[0],o[1],true);
    uppers(F,pairs(g),[o],true);
  })(FNo);
  /* east front on Hoover: lobby entrance under the centre oriel, two more oriels, windows on every floor */
  (function(F){
    var c=F.L/2, o=[c-1.8,c+1.8], o1=[F.L*0.2-1.6,F.L*0.2+1.6], o2=[F.L*0.8-1.6,F.L*0.8+1.6], list=cols(F,1.4,1.4,3.4);
    entrance(F,c); oriel(F,o[0],o[1],true,1); oriel(F,o1[0],o1[1],false); oriel(F,o2[0],o2[1],false);
    list.forEach(function(s){ if(hit([[c-3.4,c+3.4]],s,1.1)) return; F.tile(TL.WIN,s-1.1,s+1.1,0.95,4.2); F.block(s-0.9,s+0.9,0,0.1,0.85,1.0,C.CAST_L,0.7); });
    uppers(F,list,[o,o1,o2],true);
    plaque(F,c+6.2);
  })(FE);
  /* south side: joins Nemirovsky, windows where it shows (the notch toward Hoover, above a lower neighbour) */
  [FS1,FS2].forEach(function(F){ uppers(F,cols(F,1.2,1.2,3.4),[],false); });

  /* bands: plinth, the belt over the shops, string courses, frieze and cornice (mitred all round) */
  function ledge(r,off,y,dir,col){ var o=offsetRing(r,off);
    for(var k=0;k<r.length;k++){ var j=(k+1)%r.length;
      VK.quad(M,[[r[k][0],y,r[k][1]],[r[j][0],y,r[j][1]],[o[j][0],y,o[j][1]],[o[k][0],y,o[k][1]]],[0,dir,0],col||C.CAST,dir>0?1:0.6); } }
  function ringBand(r,off,y0,y1,col,top,bot){ var o=offsetRing(r,off); if(ringArea(o)<0) o.reverse(); band(M,o,y0,y1,0,col,1,0.72,true);
    if(top) ledge(r,off,y1,1,col); if(bot) ledge(r,off,y0,-1,col); }
  ringBand(R,0.07,0,0.6,C.CAST_D,true,false);
  ringBand(R,0.15,GT,BELT,C.CAST,true,true);
  ringBand(R,0.22,BELT-0.16,BELT,C.CAST_L,true,true);
  ringBand(R,0.08,BELT+2*FH-0.06,BELT+2*FH+0.12,C.CAST,true,true);
  ringBand(R,0.1,BELT+3*FH-0.12,BELT+3*FH+0.08,C.CAST,true,true);
  ringBand(R,0.12,EAVE-0.55,EAVE-0.32,C.CAST,false,true);
  ringBand(R,0.32,EAVE-0.32,EAVE,C.CAST_L,false,true);
  (function(){ var a=offsetRing(R,0.32), b=offsetRing(R,OVH);   /* soffit under the eave */
    for(var k=0;k<N;k++){ var j=(k+1)%N; VK.quad(M,[[a[k][0],EAVE,a[k][1]],[a[j][0],EAVE,a[j][1]],[b[j][0],EAVE,b[j][1]],[b[k][0],EAVE,b[k][1]]],[0,-1,0],C.CAST_D,0.6); } })();

  /* ---------- courtyard over the shops: deck, inner walls ---------- */
  var RI=offsetRing(R,-WING), ix=0, iz=0; RI.forEach(function(p){ ix+=p[0]/N; iz+=p[1]/N; });
  VK.pave(RI,BELT+0.02);
  for(var k=0;k<N;k++){ var F=faceOf(RI[k],RI[(k+1)%N],true,ix,iz);
    F.brick(0,F.L,BELT,EAVE,0);
    uppers(F,cols(F,1.3,1.3,3.5),[],false);
    if(F.L>12){ F.block(F.L/2-3,F.L/2+3,0.15,1.15,BELT,BELT+0.55,C.CAST_D,0.75); F.block(F.L/2-2.9,F.L/2+2.9,0.25,1.05,BELT+0.55,BELT+0.62,0x5D7A3C,0.9); }
  }
  (function(){ var r=offsetRing(RI,-0.25).reverse(); band(M,r,EAVE-0.4,EAVE,0,C.CAST,1,0.72,true);
    ledge(RI,-0.25,EAVE-0.4,-1,C.CAST); ledge(offsetRing(RI,-0.25),-0.3,EAVE,-1,C.CAST_D); })();

  /* ---------- roof: tile hips over the ring of wings, ridge ring, fascias ---------- */
  (function(){ var Eo=offsetRing(R,OVH), Rr=offsetRing(R,-WING/2), Ei=offsetRing(R,-WING-OVH);
    for(var k=0;k<N;k++){ var j=(k+1)%N, e=[Eo[j][0]-Eo[k][0],Eo[j][1]-Eo[k][1]], L=Math.hypot(e[0],e[1])||1, out=[e[1]/L,0,-e[0]/L];
      if(out[0]*(Eo[k][0]-cx)+out[2]*(Eo[k][1]-cz)<0) out=[-out[0],0,-out[2]];
      VK.quad(M,[[Eo[k][0],EAVE,Eo[k][1]],[Eo[j][0],EAVE,Eo[j][1]],[Rr[j][0],YR,Rr[j][1]],[Rr[k][0],YR,Rr[k][1]]],[0,1,0],C.ROOF,1);
      VK.quad(M,[[Rr[k][0],YR,Rr[k][1]],[Rr[j][0],YR,Rr[j][1]],[Ei[j][0],EAVE,Ei[j][1]],[Ei[k][0],EAVE,Ei[k][1]]],[0,1,0],C.ROOF,0.92);
      VK.quad(M,[[Eo[k][0],EAVE-0.2,Eo[k][1]],[Eo[j][0],EAVE-0.2,Eo[j][1]],[Eo[j][0],EAVE+0.04,Eo[j][1]],[Eo[k][0],EAVE+0.04,Eo[k][1]]],out,C.ROOF_D,0.85);
      VK.quad(M,[[Ei[k][0],EAVE-0.2,Ei[k][1]],[Ei[j][0],EAVE-0.2,Ei[j][1]],[Ei[j][0],EAVE+0.04,Ei[j][1]],[Ei[k][0],EAVE+0.04,Ei[k][1]]],[-out[0],0,-out[2]],C.ROOF_D,0.85);
      segBox(M,Rr[k],Rr[j],YR-0.06,YR+0.12,0.34,C.ROOF_D,0.8);
    }
    /* two vent stacks and a chimney-like stair overrun on the ridge */
    [[0.3,1],[0.62,3]].forEach(function(q){ var a=Rr[q[1]], b=Rr[(q[1]+1)%N], x=a[0]+(b[0]-a[0])*q[0], z=a[1]+(b[1]-a[1])*q[0];
      postAt(M,x,z,YR-1,YR+1.1,0.55,C.BRICK_D,0.75); postAt(M,x,z,YR+1.1,YR+1.3,0.68,C.CAST,0.8); });
  })();

  VK.collider(R,EAVE+2);

  /* the sign mesh */
  if(SG.count()){ var mesh=new T.Mesh(SG.geom(),new T.MeshLambertMaterial({map:AT,vertexColors:true,transparent:true,alphaTest:0.35,
      polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    mesh.receiveShadow=true; mesh.raycast=function(){}; scene.add(mesh); }

  window.__bohnett={brick:VK.MB.count()-n0[0],atlas:VK.MA.count()-n0[1],pave:VK.MP.count()-n0[2],solid:M.count()-n0[3],signs:SG.count(),
    look:function(i){ var v=[[150,60,-540,98,0,-485],[55,1.7,-500,90,8,-490],[60,1.7,-450,85,8,-470],[160,1.7,-500,122,9,-490],[100,1.7,-545,105,9,-515]][i||0]; window.__cam&&window.__cam.apply(null,v); }};
})();
