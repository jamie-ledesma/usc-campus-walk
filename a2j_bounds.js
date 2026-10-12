/* ==================================================================
   The edge of the tour: an invisible wall round the area Jamie marked
   on the map. North it stops a block above USC Village, east just past
   the 110 beyond Galen Center, south below the Coliseum at 40th Place,
   west a block past Vermont. Nothing is drawn: the city, the skyline and
   the mountains carry on behind it, you just cannot walk or fly past.
   Walking into it slides you along it rather than stopping you dead.
   ================================================================== */
var BOUNDS=[[-822,-969],[-478,-1005],[-337,-917],[-182,-834],[154,-814],[489,-819],[824,-783],
            [897,-685],[915,-246],[966,321],[1005,786],[1018,1082],[953,1134],[489,1142],
            [-182,1126],[-749,1134],[-806,1044],[-814,12]];
if(ringArea(BOUNDS)<0) BOUNDS.reverse();
function inBounds(x,z){ return inRing(BOUNDS,x,z); }
/* nearest point on the wall to (x,z) */
function boundsNearest(x,z){
  var bx=x, bz=z, bd=1e18, n=BOUNDS.length;
  for(var i=0;i<n;i++){
    var a=BOUNDS[i], b=BOUNDS[(i+1)%n], dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz;
    var t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)), qx=a[0]+dx*t, qz=a[1]+dz*t;
    var d=(x-qx)*(x-qx)+(z-qz)*(z-qz);
    if(d<bd){ bd=d; bx=qx; bz=qz; }
  }
  return [bx,bz];
}
/* put an object with x, z (and optional vx, vz) back inside, keeping the motion along the wall */
function boundsClamp(o){
  if(inBounds(o.x,o.z)) return false;
  for(var it=0;it<4;it++){
    var q=boundsNearest(o.x,o.z), nx=q[0]-o.x, nz=q[1]-o.z, L=Math.hypot(nx,nz)||1;
    nx/=L; nz/=L;                                      /* points back inside */
    o.x=q[0]+nx*0.06; o.z=q[1]+nz*0.06;
    if(o.vx!==undefined){ var vn=o.vx*nx+o.vz*nz; if(vn<0){ o.vx-=vn*nx; o.vz-=vn*nz; } }
    if(inBounds(o.x,o.z)) return true;
  }
  /* a corner can still leave it outside: step toward the middle of campus until it is in */
  for(it=0;it<40&&!inBounds(o.x,o.z);it++){ o.x+=(60-o.x)*0.05; o.z+=(150-o.z)*0.05; }
  return true;
}
