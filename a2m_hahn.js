/* ==================================================================
   Hahn Central Plaza, in front of Tommy Trojan. The real paving is a
   grid of red brick bands making squares of buff brick, with a red
   brick X in each square; the diagonals line up from square to square,
   so they read as long lines across the plaza. Drawn cheaply: one buff
   sheet, then long clipped strips for the diagonals and the bands, all
   flat quads in one ground mesh. Tommy stands on a stepped gray stone
   base, with lamp posts on brick pedestals either side.
   Local frame (HAHN, a_world.js): origin at Tommy, u east, v south.
   ================================================================== */
(function(){
  if(!HAHN) return;
  var P=HAHN.P, L=HAHN.L, du=HAHN.du;
  var S=5.4, BAND=0.62, DIAG=0.26, EDGE=0.95;          /* square pitch, band widths, border */
  var BUFF=0xC3B099, RED=0x7D4238, RED_D=0x703A31, REDX=0x874A3F;
  var MG=new Mesher(), MW=new Mesher();
  var FTN=HAHN.loc([18,43]), TRV=HAHN.loc([20,61]);    /* fountain and Traveler's bed, cut out */
  var HOLES=[[FTN[0],FTN[1],7.25],[TRV[0],TRV[1],7.05]];
  var HB=3.75;                                          /* half width of Tommy's bottom step */
  function ccw(r){ if(ringArea(r)<0) r.reverse(); return r; }

  /* the parts of the line o+t*d (|d|=1) inside the outline and outside the holes */
  function clip(o,d){
    var ts=[], i, n=L.length;
    for(i=0;i<n;i++){
      var a=L[i], b=L[(i+1)%n], ex=b[0]-a[0], ez=b[1]-a[1];
      var den=d[0]*ez-d[1]*ex; if(Math.abs(den)<1e-9) continue;
      var wx=a[0]-o[0], wz=a[1]-o[1];
      var t=(wx*ez-wz*ex)/den, s=(wx*d[1]-wz*d[0])/den;
      if(s>=0&&s<1) ts.push(t);
    }
    ts.sort(function(x,y){ return x-y; });
    var segs=[];
    for(i=0;i+1<ts.length;i+=2) segs.push([ts[i],ts[i+1]]);
    for(var h=0;h<HOLES.length;h++){
      var H=HOLES[h], px=o[0]-H[0], pz=o[1]-H[1];
      var bq=px*d[0]+pz*d[1], cq=px*px+pz*pz-H[2]*H[2], disc=bq*bq-cq;
      if(disc<=0) continue;
      var h0=-bq-Math.sqrt(disc), h1=-bq+Math.sqrt(disc), out=[];
      segs.forEach(function(g){
        if(h1<=g[0]||h0>=g[1]){ out.push(g); return; }
        if(h0>g[0]) out.push([g[0],h0]);
        if(h1<g[1]) out.push([h1,g[1]]);
      });
      segs=out;
    }
    return segs;
  }
  /* a flat strip of brick along the clipped line */
  function strip(o,d,w,y,col){
    var c=rgb(col,1), nu=-d[1]*w/2, nv=d[0]*w/2;
    clip(o,d).forEach(function(g){
      if(g[1]-g[0]<0.05) return;
      var a=[o[0]+d[0]*g[0],o[1]+d[1]*g[0]], b=[o[0]+d[0]*g[1],o[1]+d[1]*g[1]];
      var A=P(a[0]+nu,a[1]+nv), B=P(b[0]+nu,b[1]+nv), C=P(b[0]-nu,b[1]-nv), D=P(a[0]-nu,a[1]-nv);
      MG.quad([A[0],y,A[1]],[B[0],y,B[1]],[C[0],y,C[1]],[D[0],y,D[1]],c,c,c,c);
    });
  }

  /* ---- buff field with the fountain and Traveler's bed left open ---- */
  var holes=HOLES.map(function(H){
    return ngon(0,0,H[2],32,0).map(function(q){ return P(H[0]+q[0],H[1]+q[1]); }).reverse();
  });
  var outer=ccw(L.map(function(p){ return P(p[0],p[1]); }));
  holes.forEach(function(h){ if(ringArea(h)>0) h.reverse(); });
  flatHoled(MG,outer,holes,0.150,BUFF,1);

  /* ---- the X in every square: diagonals through the band crossings ---- */
  var R2=Math.SQRT1_2, k;
  for(k=-6;k<=30;k++){
    strip([k*S/2,-k*S/2],[R2,R2],DIAG,0.155,REDX);       /* u-v = k*S */
    strip([k*S/2, k*S/2],[R2,-R2],DIAG,0.155,REDX);      /* u+v = k*S */
  }
  /* ---- the red bands: squares centred on Tommy ---- */
  for(k=-3;k<=12;k++){
    strip([(k+0.5)*S,0],[0,1],BAND,0.160,RED);
    strip([0,(k+0.5)*S],[1,0],BAND,0.160,RED);
  }
  /* ---- a darker soldier course round the edge ---- */
  function reflex(j){
    var n=L.length, p=L[(j+n-1)%n], q=L[j], r=L[(j+1)%n];
    return (q[0]-p[0])*(r[1]-q[1])-(q[1]-p[1])*(r[0]-q[0])<0;
  }
  for(var i=0;i<L.length;i++){
    var a=L[i], b=L[(i+1)%L.length], ex=b[0]-a[0], ez=b[1]-a[1], len=Math.hypot(ex,ez);
    ex/=len; ez/=len;
    var nu=-ez*EDGE/2, nv=ex*EDGE/2, c=rgb(RED_D,1);
    /* the inside is to the left of each edge: shift the strip inward, and run it on
       past inside corners so they close up */
    var e0=reflex(i)?EDGE:0, e1=reflex((i+1)%L.length)?EDGE:0;
    var a0=[a[0]-ex*e0+nu,a[1]-ez*e0+nv], b0=[b[0]+ex*e1+nu,b[1]+ez*e1+nv];
    var A=P(a0[0]+nu,a0[1]+nv), B=P(b0[0]+nu,b0[1]+nv), C=P(b0[0]-nu,b0[1]-nv), D=P(a0[0]-nu,a0[1]-nv);
    MG.quad([A[0],0.163,A[1]],[B[0],0.163,B[1]],[C[0],0.163,C[1]],[D[0],0.163,D[1]],c,c,c,c);
  }
  /* brick rings round the fountain kerb and Traveler's bed */
  HOLES.forEach(function(H){
    var r=ngon(0,0,H[2]+0.45,32,0).map(function(q){ return P(H[0]+q[0],H[1]+q[1]); });
    r.push(r[0]); ribbon(MG,r,0.9,0.163,RED_D,1);
  });

  /* ---- Tommy's stepped base: three courses of gray granite ---- */
  var T0=P(0,0), ux=du[0], uz=du[1], hb, st;
  for(st=0;st<3;st++){
    hb=HB-st*0.55;
    oriBox(MW,T0[0],T0[1],ux,uz,hb,hb,0,0.17*(st+1),st%2?0xB4B5B1:0xA6A7A3,0.66);
    addCollider(oriRect(T0[0],T0[1],ux,uz,hb,hb),0.17*(st+1));
  }

  /* ---- lamp posts on brick pedestals with cream caps ---- */
  var post=new T.MeshLambertMaterial({color:0x34393A,flatShading:true});
  var glob=new T.MeshLambertMaterial({color:0xFFF8E6,emissive:0x6B6650,flatShading:true});
  var postG=new T.CylinderGeometry(0.075,0.11,4.3,7), globG=new T.SphereGeometry(0.21,8,6),
      armG=new T.BoxGeometry(1.0,0.07,0.07);
  [[-5.0,9.0],[10.6,-7.4],[-5.0,-6.6]].forEach(function(q){
    var p=P(q[0],q[1]);
    oriBox(MW,p[0],p[1],ux,uz,0.80,0.80,0.15,0.30,0xE6DCC4,0.7);   /* cream plinth   */
    oriBox(MW,p[0],p[1],ux,uz,0.50,0.50,0.30,1.15,0xA2503C,0.6);   /* brick pedestal */
    oriBox(MW,p[0],p[1],ux,uz,0.60,0.60,1.15,1.30,0xEADFC6,0.7);   /* cream cap      */
    var m=new T.Mesh(postG,post); m.position.set(p[0],1.30+2.15,p[1]); scene.add(m);
    var arm=new T.Mesh(armG,post); arm.position.set(p[0],5.25,p[1]); arm.rotation.y=HAHN.rot; scene.add(arm);
    for(var s=-1;s<=1;s++){
      var gl=new T.Mesh(globG,glob);
      if(s) gl.position.set(p[0]+du[1]*0.45*s,5.52,p[1]-du[0]*0.45*s);
      else gl.position.set(p[0],5.85,p[1]);
      scene.add(gl);
    }
    addCollider(oriRect(p[0],p[1],ux,uz,0.6,0.6),1.3);
  });

  var mg=new T.Mesh(MG.geom(),matGround); mg.frustumCulled=false; mg.receiveShadow=true; scene.add(mg);
  var mw=new T.Mesh(MW.geom(),matWorld); mw.frustumCulled=false; mw.castShadow=true; mw.receiveShadow=true; scene.add(mw);
})();
