// Regular dot-matrix of land points in the same equirectangular map space as the pins (W=1000, lat 84..-58).
const fs = require('fs'); const topo = require('topojson-client');
(async () => {
  const d3 = await import('d3-geo');
  const W = 1000, N = 84, S = -58, H = (N - S) / 360 * W, STEP = +process.argv[3] || 7;
  const t = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
  const land = topo.feature(t, t.objects.land);
  const pts = [];
  for (let y = STEP / 2; y < H; y += STEP) for (let x = STEP / 2; x < W; x += STEP) {
    const lon = x / W * 360 - 180, lat = N - y / W * 360;
    if (d3.geoContains(land, [lon, lat])) pts.push(Math.round(x * 10), Math.round(y * 10));
  }
  fs.writeFileSync(process.argv[2], JSON.stringify({ step: STEP, pts }));
  console.log('dots', pts.length / 2);
})();
