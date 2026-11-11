/* ==================================================================
   Frame rate: let three.js skip what is off screen, and drop small
   detail in the distance.

   Most props are InstancedMeshes (lamps, benches, trees, cars, flowers,
   people) built with frustumCulled=false, because an InstancedMesh is
   culled by its geometry's bounding sphere, which knows nothing about
   where the instances are. So every one of them was drawn every frame,
   in the main pass and again in the shadow pass, wherever you looked.

   perfTune runs once, a moment after the page starts (so it can tell the
   instanced sets that move, the crowd, players and fans, from the ones that
   never change), and then:
   - gives each static set its own geometry object (sharing the same
     buffers, so nothing is copied) whose bounding sphere covers its
     instances, and turns frustum culling on (it then also works for the
     shadow pass);
   - splits sets spread over a big area (city trees, campus lamps, cars)
     into tiles about 500 m across, each culled on its own; the LOD lists
     in CITY_LOD are pointed at the tiles so the frame rate ladder still
     thins them;
   - gives every tuned set a draw distance: small things (flowers, benches,
     lamp heads, bollards) a few hundred metres, the rest the fog distance
     (past it they are fog colour anyway); hidden through their layer, so
     other code that toggles .visible still works;
   - turns frustum culling on for plain meshes that had it off.
   Moving sets are left alone. Nothing about how anything looks changes
   up close.
   ================================================================== */
var perfTune=(function(){
  var frames=0, done=false, VER=null, FAR=[], tick=0, TILE=500;
  var _m=new T.Matrix4(), _p=new T.Vector3(), _q=new T.Quaternion(), _s=new T.Vector3();
  function wrap(g,sphere){
    var w=new T.BufferGeometry();
    for(var k in g.attributes) w.setAttribute(k,g.attributes[k]);
    if(g.index) w.setIndex(g.index);
    w.groups=g.groups; w.drawRange=g.drawRange; w.boundingSphere=sphere; w.boundingBox=null;
    return w;
  }
  function geoR(g){ if(!g.boundingSphere) g.computeBoundingSphere(); return g.boundingSphere; }
  /* bounds of instances [i0..] given as a list of indices */
  function boundsOf(im,ids){
    var gs=geoR(im.geometry), x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9, smax=0;
    for(var j=0;j<ids.length;j++){ im.getMatrixAt(ids[j],_m); _m.decompose(_p,_q,_s);
      var sc=Math.max(Math.abs(_s.x),Math.abs(_s.y),Math.abs(_s.z)); if(sc===0) continue; if(sc>smax) smax=sc;
      var c=gs.center.clone().applyMatrix4(_m);
      if(c.x<x0)x0=c.x; if(c.x>x1)x1=c.x; if(c.y<y0)y0=c.y; if(c.y>y1)y1=c.y; if(c.z<z0)z0=c.z; if(c.z>z1)z1=c.z; }
    if(x0>x1) return null;
    var ctr=new T.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2), r=Math.hypot(x1-x0,y1-y0,z1-z0)/2+gs.radius*smax;
    return {sphere:new T.Sphere(ctr,r), item:gs.radius*smax};
  }
  function lodListOf(im){
    if(typeof CITY_LOD==='undefined') return null;
    for(var k in CITY_LOD){ var L=CITY_LOD[k], i=L.indexOf(im); if(i>=0) return [L,i]; }
    return null;
  }
  /* draw distance: small things a few hundred metres, the rest out to the fog (past it they are all fog colour anyway) */
  function addFar(o,item){
    var d=item<1.4?340:(item<4.5?720:-1), bs=o.geometry.boundingSphere;
    FAR.push([o,bs.center.x,bs.center.z,bs.radius,d]);
  }
  function tune(){
    var list=[], i;
    scene.traverse(function(o){ if(o.isInstancedMesh) list.push(o); });
    var nT=0, nC=0, nP=0, nTiles=0;
    list.forEach(function(im){
      if(im.userData.noTune) return;
      var v=VER.get(im);
      if(im.instanceMatrix.usage===T.DynamicDrawUsage||v===undefined||v!==im.instanceMatrix.version) return;   /* moves: leave it */
      var full=im.userData.full!==undefined?im.userData.full:im.count;
      if(full<1) return;
      var all=[]; for(i=0;i<full;i++) all.push(i);
      var b=boundsOf(im,all); if(!b) return;
      var parent=im.parent; if(!parent) return;
      if(b.sphere.radius>650&&full>48){
        /* split into tiles */
        var groups={};
        for(i=0;i<full;i++){ im.getMatrixAt(i,_m); _p.setFromMatrixPosition(_m);
          var key=Math.floor(_p.x/TILE)+'_'+Math.floor(_p.z/TILE); (groups[key]||(groups[key]=[])).push(i); }
        var frac=full?im.count/full:1, tiles=[];
        Object.keys(groups).forEach(function(key){
          var ids=groups[key], tb=boundsOf(im,ids); if(!tb) return;
          var t=new T.InstancedMesh(wrap(im.geometry,tb.sphere),im.material,ids.length);
          ids.forEach(function(src,j){ im.getMatrixAt(src,_m); t.setMatrixAt(j,_m); });
          if(im.instanceColor){ var c=new T.Color(); ids.forEach(function(src,j){ im.getColorAt(src,c); t.setColorAt(j,c); }); }
          t.castShadow=im.castShadow; t.receiveShadow=im.receiveShadow; t.renderOrder=im.renderOrder; t.raycast=im.raycast;
          t.userData=Object.assign({},im.userData,{full:ids.length}); t.visible=im.visible; t.layers.mask=im.layers.mask;
          t.position.copy(im.position); t.quaternion.copy(im.quaternion); t.scale.copy(im.scale);
          t.count=Math.ceil(ids.length*frac); t.frustumCulled=true;
          parent.add(t); tiles.push(t); addFar(t,tb.item); nTiles++;
        });
        var ll=lodListOf(im);
        if(ll){ ll[0].splice(ll[1],1); tiles.forEach(function(t){ ll[0].push(t); }); }
        parent.remove(im); nT++;
      } else {
        im.geometry=wrap(im.geometry,b.sphere); im.frustumCulled=true; addFar(im,b.item); nC++;
      }
    });
    /* plain meshes with culling off: their geometry is in world space, so the sphere is right */
    scene.traverse(function(o){
      if(!o.isMesh||o.isInstancedMesh||o.frustumCulled||o.userData.noTune) return;
      var g=o.geometry; if(!g||!g.attributes||!g.attributes.position) return;
      if(!g.boundingSphere) g.computeBoundingSphere();
      if(!g.boundingSphere||!isFinite(g.boundingSphere.radius)||g.boundingSphere.radius>1500) return;
      o.frustumCulled=true; nP++;
    });
    window.__perf={tiledSets:nT,tiles:nTiles,culledSets:nC,plainMeshes:nP,far:FAR.length};
  }
  return function(dt){
    if(!done){
      frames++;
      if(frames===20){ VER=new Map(); scene.traverse(function(o){ if(o.isInstancedMesh) VER.set(o,o.instanceMatrix.version); }); }
      else if(frames===80){ done=true; tune(); }
      return;
    }
    tick+=dt; if(tick<0.25) return; tick=0;
    var cx=camera.position.x, cz=camera.position.z;
    var fogR=(scene.fog?scene.fog.far:1600)+80+Math.max(0,camera.position.y)*0.5;
    for(var i=0;i<FAR.length;i++){ var f=FAR[i], d=Math.hypot(f[1]-cx,f[2]-cz)-f[3];
      f[0].layers.mask=d<(f[4]<0?fogR:Math.min(f[4],fogR))?1:0; }
  };
})();
