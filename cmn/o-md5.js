!function(woo){
  var fn = {};
  fn.add = function(x1, x2) {
    var l = (x1 & 0xFFFF) + (x2 & 0xFFFF);
    var m = (x1 >> 16) + (x2 >> 16) + (l >> 16);
    return (m << 16) | (l & 0xFFFF);
  };
  fn.rol = function(v, cnt) {
    return (v << cnt) | (v >>> (32 - cnt));
  };
  fn.cmn = function(q, a, b, x, s, t) {
    return this.add(this.rol(this.add(this.add(a, q), this.add(x, t)), s),b);
  };
  fn.ff = function(a, b, c, d, x, s, t){
    return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  fn.gg = function(a, b, c, d, x, s, t) {
    return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  fn.hh = function(a, b, c, d, x, s, t) {
    return this.cmn(b ^ c ^ d, a, b, x, s, t);
  }
  fn.ii = function(a, b, c, d, x, s, t) {
    return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  fn.core = function(x) {
    var len = x.len;
    x.buffer[len >> 5] |= 0x80 << ((len) % 32);
    x.buffer[(((len + 64) >>> 9) << 4) + 14] = len;
    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;
    for(var i = 0; i < x.buffer.length; i += 16) {
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      a = this.ff(a, b, c, d, x.buffer[i+ 0], 7 , -680876936);
      d = this.ff(d, a, b, c, x.buffer[i+ 1], 12, -389564586);
      c = this.ff(c, d, a, b, x.buffer[i+ 2], 17,  606105819);
      b = this.ff(b, c, d, a, x.buffer[i+ 3], 22, -1044525330);
      a = this.ff(a, b, c, d, x.buffer[i+ 4], 7 , -176418897);
      d = this.ff(d, a, b, c, x.buffer[i+ 5], 12,  1200080426);
      c = this.ff(c, d, a, b, x.buffer[i+ 6], 17, -1473231341);
      b = this.ff(b, c, d, a, x.buffer[i+ 7], 22, -45705983);
      a = this.ff(a, b, c, d, x.buffer[i+ 8], 7 ,  1770035416);
      d = this.ff(d, a, b, c, x.buffer[i+ 9], 12, -1958414417);
      c = this.ff(c, d, a, b, x.buffer[i+10], 17, -42063);
      b = this.ff(b, c, d, a, x.buffer[i+11], 22, -1990404162);
      a = this.ff(a, b, c, d, x.buffer[i+12], 7 ,  1804603682);
      d = this.ff(d, a, b, c, x.buffer[i+13], 12, -40341101);
      c = this.ff(c, d, a, b, x.buffer[i+14], 17, -1502002290);
      b = this.ff(b, c, d, a, x.buffer[i+15], 22,  1236535329);
      a = this.gg(a, b, c, d, x.buffer[i+ 1], 5 , -165796510);
      d = this.gg(d, a, b, c, x.buffer[i+ 6], 9 , -1069501632);
      c = this.gg(c, d, a, b, x.buffer[i+11], 14,  643717713);
      b = this.gg(b, c, d, a, x.buffer[i+ 0], 20, -373897302);
      a = this.gg(a, b, c, d, x.buffer[i+ 5], 5 , -701558691);
      d = this.gg(d, a, b, c, x.buffer[i+10], 9 ,  38016083);
      c = this.gg(c, d, a, b, x.buffer[i+15], 14, -660478335);
      b = this.gg(b, c, d, a, x.buffer[i+ 4], 20, -405537848);
      a = this.gg(a, b, c, d, x.buffer[i+ 9], 5 ,  568446438);
      d = this.gg(d, a, b, c, x.buffer[i+14], 9 , -1019803690);
      c = this.gg(c, d, a, b, x.buffer[i+ 3], 14, -187363961);
      b = this.gg(b, c, d, a, x.buffer[i+ 8], 20,  1163531501);
      a = this.gg(a, b, c, d, x.buffer[i+13], 5 , -1444681467);
      d = this.gg(d, a, b, c, x.buffer[i+ 2], 9 , -51403784);
      c = this.gg(c, d, a, b, x.buffer[i+ 7], 14,  1735328473);
      b = this.gg(b, c, d, a, x.buffer[i+12], 20, -1926607734);
      a = this.hh(a, b, c, d, x.buffer[i+ 5], 4 , -378558);
      d = this.hh(d, a, b, c, x.buffer[i+ 8], 11, -2022574463);
      c = this.hh(c, d, a, b, x.buffer[i+11], 16,  1839030562);
      b = this.hh(b, c, d, a, x.buffer[i+14], 23, -35309556);
      a = this.hh(a, b, c, d, x.buffer[i+ 1], 4 , -1530992060);
      d = this.hh(d, a, b, c, x.buffer[i+ 4], 11,  1272893353);
      c = this.hh(c, d, a, b, x.buffer[i+ 7], 16, -155497632);
      b = this.hh(b, c, d, a, x.buffer[i+10], 23, -1094730640);
      a = this.hh(a, b, c, d, x.buffer[i+13], 4 ,  681279174);
      d = this.hh(d, a, b, c, x.buffer[i+ 0], 11, -358537222);
      c = this.hh(c, d, a, b, x.buffer[i+ 3], 16, -722521979);
      b = this.hh(b, c, d, a, x.buffer[i+ 6], 23,  76029189);
      a = this.hh(a, b, c, d, x.buffer[i+ 9], 4 , -640364487);
      d = this.hh(d, a, b, c, x.buffer[i+12], 11, -421815835);
      c = this.hh(c, d, a, b, x.buffer[i+15], 16,  530742520);
      b = this.hh(b, c, d, a, x.buffer[i+ 2], 23, -995338651);
      a = this.ii(a, b, c, d, x.buffer[i+ 0], 6 , -198630844);
      d = this.ii(d, a, b, c, x.buffer[i+ 7], 10,  1126891415);
      c = this.ii(c, d, a, b, x.buffer[i+14], 15, -1416354905);
      b = this.ii(b, c, d, a, x.buffer[i+ 5], 21, -57434055);
      a = this.ii(a, b, c, d, x.buffer[i+12], 6 ,  1700485571);
      d = this.ii(d, a, b, c, x.buffer[i+ 3], 10, -1894986606);
      c = this.ii(c, d, a, b, x.buffer[i+10], 15, -1051523);
      b = this.ii(b, c, d, a, x.buffer[i+ 1], 21, -2054922799);
      a = this.ii(a, b, c, d, x.buffer[i+ 8], 6 ,  1873313359);
      d = this.ii(d, a, b, c, x.buffer[i+15], 10, -30611744);
      c = this.ii(c, d, a, b, x.buffer[i+ 6], 15, -1560198380);
      b = this.ii(b, c, d, a, x.buffer[i+13], 21,  1309151649);
      a = this.ii(a, b, c, d, x.buffer[i+ 4], 6 , -145523070);
      d = this.ii(d, a, b, c, x.buffer[i+11], 10, -1120210379);
      c = this.ii(c, d, a, b, x.buffer[i+ 2], 15,  718787259);
      b = this.ii(b, c, d, a, x.buffer[i+ 9], 21, -343485551);
      a = this.add(a, olda);
      b = this.add(b, oldb);
      c = this.add(c, oldc);
      d = this.add(d, oldd);
    }
    return [a, b, c, d];
  };
  fn.hex = function(buffer){
    var t = "0123456789abcdef";
    var ret = [];
    for(var i = 0; i < buffer.length * 4; i++) {
      ret.push( t.charAt((buffer[i>>2] >> ((i%4)*8+4)) & 0xF) + t.charAt((buffer[i>>2] >> ((i%4)*8  )) & 0xF) );
    }
    return ret.join('');
  };
  var charsize = 8;
  fn.stob = function(text) {
    var bin = [];
    var mask = (1 << charsize) - 1;
    for(var i = 0; i < text.length * charsize; i += charsize) {
      bin[i>>5] |= (text.charCodeAt(i / charsize) & mask) << (i%32);
    }
    return bin;
  }
  fn.md5 = function(text) {
    return this.hex(this.core({buffer: this.stob(text), len: text.length*charsize}));
  };
  woo.add("md5", { 
    hex: function(text){ 
      return fn.hex(this.array(text)); 
    }, 
    array: function(text){
      return fn.core({buffer: fn.stob(text), len: text.length*charsize});
    } 
  });
  woo.end();  
}({
  modules: [],
  add: function(name, module){
    this.modules.push({name: name, module: module});
  },
  end: function(){
    window.modules = window.modules||{};
    for(var i=0; i<this.modules.length; i++){
      var m = this.modules[i];
      window.modules[m.name] = m.module;
    }
    if(window.Modules && window.Modules.add){
      for(var i=0; i<this.modules.length; i++){
        var m = this.modules[i];
        window.Modules.add(m.name, m.module);
      }
    }
  }
});