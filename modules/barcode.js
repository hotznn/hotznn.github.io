"use strict";
const Version = "1.0";
export default Object.freeze({
  EAN13: (() => {
    const CONSTS = {
      L: {
        "0":"0001101","1":"0011001","2":"0010011","3":"0111101","4":"0100011",
        "5":"0110001","6":"0101111","7":"0111011","8":"0110111","9":"0001011"
      },
      G: {
        "0":"0100111","1":"0110011","2":"0011011","3":"0100001","4":"0011101",
        "5":"0111001","6":"0000101","7":"0010001","8":"0001001","9":"0010111"
      },
      R: {
        "0":"1110010","1":"1100110","2":"1101100","3":"1000010","4":"1011100",
        "5":"1001110","6":"1010000","7":"1000100","8":"1001000","9":"1110100"
      },
      STRUCTURE:{
        "0":"LLLLLL","1":"LLGLGG","2":"LLGGLG","3":"LLGGGL","4":"LGLLGG",
        "5":"LGGLLG","6":"LGGGLL","7":"LGLGLG","8":"LGLGGL","9":"LGGLGL"
      }
    };
    const Actions = {
      checksum(code12){
        let sum = 0;
        for(let i=0;i<12;i++){
          const n = + parseInt(code12[i]);
          sum += (i % 2 === 0) ? n : n * 3;
        }
        return (10 - (sum % 10)) % 10;
      },
      normalize(code){
        if(!/^\d{12,13}$/.test(code)){
          throw new Error("EAN13 必须是12或13位数字");
        }
        if(code.length === 12){
          code += this.checksum(code);
        }
        return code;
      },
      encode(code){
        const structure = CONSTS.STRUCTURE[code[0]];
        let bits = "101";
        for(let i=1;i<=6;i++){
          const t = structure[i-1];
          bits += (t==="L"?CONSTS.L[code[i]]:CONSTS.G[code[i]]);
        }
        bits += "01010";
        for(let i=7;i<=12;i++){
          bits += CONSTS.R[code[i]];
        }
        bits += "101";
        return bits;
      },
      build(bits, text, meta){
        const mw = meta.moduleWidth || 2;
        const bh = meta.barHeight || 96;
        const ex = meta.guardExtraHeight || 10;
        const fontSize = meta.fontSize || 16;
        const quiet = (meta.quietZoneModules ?? 9) * mw;
        const width = bits.length * mw;
        const tw = width + quiet*2;
        const th = bh + ex + fontSize + 8;
        let svg = [];
        svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}">`);
        let x = quiet;
        for(let i=0;i<bits.length;i++){
          if(bits[i] === "1"){
            const isGuard = i<3 || (i>=45 && i<50) || i>=92;
            const h = isGuard ? bh + ex : bh;
            svg.push(`  <rect x="${x}" y="0" width="${mw}" height="${h}" fill="#000"/>`);
          }
          x += mw;
        }
        const ts = bh + fontSize;
        svg.push(`  <text x="${quiet-4}" y="${ts}" font-size="${fontSize}" font-family="verdana" text-anchor="end">${text.slice(0,1)}</text>`);
        svg.push(`  <text x="${quiet+mw*24}" y="${ts}" font-size="${fontSize}" font-family="verdana" text-anchor="middle">${text.slice(1,7)}</text>`);
        svg.push(`  <text x="${quiet+mw*71}" y="${ts}" font-size="${fontSize}" font-family="verdana" text-anchor="middle">${text.slice(7)}</text>`);
        svg.push(`</svg>`);
        return svg.join("\r\n");
      }
    }
    const build = (code, meta={})=>{
      const normalized = Actions.normalize(code);
      const bits = Actions.encode(normalized);
      return Actions.build(bits, normalized, meta);
    }
    return { build, checksum: Actions.checksum };
  })(),
  CODE128: (()=>{
    const PATTERNS = [
      "212222","222122","222221","121223","121322","131222","122213","122312",
      "132212","221213","221312","231212","112232","122132","122231","113222",
      "123122","123221","223211","221132","221231","213212","223112","312131",
      "311222","321122","321221","312212","322112","322211","212123","212321",
      "232121","111323","131123","131321","112313","132113","132311","211313",
      "231113","231311","112133","112331","132131","113123","113321","133121",
      "313121","211331","231131","213113","213311","213131","311123","311321",
      "331121","312113","312311","332111","314111","221411","431111","111224",
      "111422","121124","121421","141122","141221","112214","112412","122114",
      "122411","142112","142211","241211","221114","413111","241112","134111",
      "111242","121142","121241","114212","124112","124211","411212","421112",
      "421211","212141","214121","412121","111143","111341","131141","114113",
      "114311","411113","411311","113141","114131","311141","411131","211412",
      "211214","211232","2331112" // stop
    ];
    const CODE_B = 100;
    const CODE_C = 99;
    const START_A = 103;
    const START_B = 104;
    const START_C = 105;
    const STOP = 106;
    const Actions = {
      encode(data){
        let i = 0;
        let codes = [];
        let set = null;
        const cd = (pos)=>{
          let n = 0;
          while(pos+n < data.length && /\d/.test(data[pos+n])){
            n++;
          }
          return n;
        }
        while(i < data.length){
          const dc = cd(i);
          if(dc >= 4){
            const usable = dc - (dc % 2);
            if(set !== 'C'){
              codes.push(codes.length===0 ? START_C : CODE_C);
              set = 'C';
            }
            for(let j=0;j<usable;j+=2){
              const pair = data.substr(i+j,2);
              codes.push(parseInt(pair));
            }
            i += usable;
            continue;
          }
          if(set !== 'B'){
            codes.push(codes.length===0 ? START_B : CODE_B);
            set = 'B';
          }
          const val = data.charCodeAt(i) - 32;
          if(val < 0 || val > 95){
            throw new Error("CODE128B 不支持该字符: "+data[i]);
          }
          codes.push(val);
          i++;
        }
        return codes;
      },
      bits(codes){
        let ret = "";
        const x = (p)=>{
          for(let i=0;i<p.length;i++){
            const w = parseInt(p[i]);
            ret += (i%2===0 ? "1":"0").repeat(w);
          }
        }
        for(const c of codes){
          x(PATTERNS[c]);
        }
        x(PATTERNS[STOP]);
        ret += "11";
        return ret;
      },
      checksum(codes){
        let sum = codes[0];
        for(let i=1;i<codes.length;i++){
          sum += codes[i]*i;
        }
        return sum % 103;
      },
      build(bits, text, meta){
        const mw = meta.moduleWidth || 2;
        const bh = meta.barHeight || 80;
        const fontSize = meta.fontSize || 16;
        const quiet = (meta.quietZoneModules ?? 10) * mw;
        const width = bits.length * mw;
        const tw = width + quiet*2;
        const th = bh + fontSize + 10;
        let svg = [];
        svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}">`);
        let x = quiet;
        for(let i=0;i<bits.length;i++){
          if(bits[i]==="1"){
            svg.push(`  <rect x="${x}" y="0" width="${mw}" height="${bh}" fill="#000"/>`);
          }
          x += mw;
        }
        svg.push(`<text x="${tw/2}" y="${bh+fontSize}" text-anchor="middle" font-family="verdana" font-size="${fontSize}">${text}</text>`);
        svg.push(`</svg>`);
        return svg;
      }
    }
    return {
       build(data, meta={}){
        if(typeof data !== "string" || !data.length){
          throw new Error("CODE128 内容不能为空");
        }
        const codes = Actions.encode(data);
        const cs = Actions.checksum(codes);
        codes.push(cs);
        const bits = Actions.bits(codes);
        return Actions.build(bits, data, meta);
      }
    };
  })()
});