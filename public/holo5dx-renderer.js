export class Holo5DXRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { antialias: true });
    this.mode = this.gl ? 'webgl2' : 'canvas2d';
    this.ctx2d = this.gl ? null : canvas.getContext('2d');
  }

  resize(width, height) {
    this.canvas.width = Math.max(1, width|0);
    this.canvas.height = Math.max(1, height|0);
    if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  clear() {
    if (this.gl) {
      this.gl.clearColor(0.02,0.02,0.05,1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    } else {
      this.ctx2d.fillStyle = '#05050d';
      this.ctx2d.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
  }

  renderPackedViews(plan, drawView) {
    this.clear();
    const packing = Array.isArray(plan?.packing) ? plan.packing : [{view:0,x:0,y:0,width:this.canvas.width,height:this.canvas.height}];
    const ctx = this.ctx2d || this.canvas.getContext('2d');
    // WebGL2 is detected for the production path, while this prototype uses Canvas2D compositing
    // until calibrated warp shaders/render targets are implemented and validated on physical hardware.
    packing.forEach(cell => {
      ctx.save();
      ctx.beginPath(); ctx.rect(cell.x,cell.y,cell.width,cell.height); ctx.clip();
      drawView(ctx, cell);
      ctx.restore();
    });
  }

  static chooseFallback({ requested='STANDARD-3D', holoHardware=false, xr=false }={}) {
    if (requested.startsWith('QCONE') && !holoHardware) return xr ? 'XR-SPATIAL' : 'STANDARD-3D';
    return requested;
  }
}
