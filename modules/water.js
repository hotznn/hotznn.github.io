const Modules = {};
const Random_hsla = (alpha = 0.5) => `hsla(${Math.floor(Math.random() * 360)}, 60%, 40%, ${alpha})`;
Modules.WaterColor = (()=>{
  const Canvas = document.createElement("canvas");
  Canvas.style.display = "block";
  return {
    ctx: null,
    init(meta = {}) {
      const me = this;
      this.meta = Object.assign({ width:1280, height:720 }, meta);
      this.ctx = Canvas.getContext("2d");
      this.resize(this.meta.width, this.meta.height);
      return me;
    },
    resize(w,h) {
      Canvas.width = w || window.innerWidth;
      Canvas.height = h || window.innerHeight;
    },
    textor(title, memo) {
      const w = Canvas.width;
      const h = Canvas.height;
      this.ctx.save();
      this.ctx.fillStyle = "#FFFFFF60";
      this.ctx.font = `normal 64px verdana`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowColor = "rgba(0,0,0,0.4)";
      this.ctx.shadowBlur = 6;
      const x = w / 2;
      this.ctx.fillText(title, x, h * 0.45);
      this.ctx.font = `normal 32px verdana`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowColor = "rgba(0,0,0,0.4)";
      this.ctx.shadowBlur = 6;
      this.ctx.fillText(memo, x, h * 0.56);
      this.ctx.restore();
    },
    /**
     * @description
     *   draw water color
     * @param {String} title - title
     * @param {String} memo - memo
     * @returns {Object} this
     */
    draw(title, memo) {
      const bc = 12;
      const blur = 40;
      const RadiusRatio = {min: 0, max: 0.5};
      const w = Canvas.width;
      const h = Canvas.height;
      this.ctx.clearRect(0, 0, w, h);
      this.ctx.filter = `blur(${blur}px)`;
      for (let i = 0; i < bc; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = w * (RadiusRatio.min + Math.random() * (RadiusRatio.max - RadiusRatio.min));
        const color1 = Random_hsla(0.5);
        const color2 = Random_hsla(0);
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.filter = "none";
      this.textor(title||"", memo||"");
    },
    /**
     * @description
     *   save canvas as image/jpeg
     * @param {String} [name='WaterColor.jpg'] - filename
     */
    save(name = 'WaterColor.jpg') {
      const link = document.createElement('a');
      link.download = name;
      link.href = Canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    },
    /**
     * @description
     *   get data url of canvas as image/jpeg
     * @returns {String} data url
     */
    url(){
      return Canvas.toDataURL('image/jpeg', 0.9);
    }
  }
})();
export default Modules.WaterColor.init();
export const WaterColor = Modules.WaterColor.init();