!function(woo){
  var cn = {};
  cn.table = ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=").split("");
  cn.map = {};
  +function(){
    for (var i = 0; i < cn.table.length; i++) {
      cn.map[cn.table[i]] = i;
    }
    cn.map['='] = 0;
  }();
  cn.stob = function(text) {
    var ret = [];
    var len = text.length;
    for (var i = 0; i < len; i++) {
      var code = text.charCodeAt(i);
      if ((code > 0x0000) && (code <= 0x007F)) {
        //第一平面
        ret.push(code);
      }
      else if ((code >= 0x0080) && (code <= 0x07FF)) {
        //第一平面
        ret.push(0xC0 | ((code >> 6) & 0x1F));
        ret.push(0x80 | (code & 0x3F));
      }
      else if( ((code >= 0x0800) && (code <= 0xD7FF)) || ((code >= 0xE000) && (code <= 0xFFFF)) ){
        //第一平面
        ret.push(0xE0 | ((code >> 12) & 0x0F));
        ret.push(0x80 | ((code >> 6) & 0x3F));
        ret.push(0x80 | (code & 0x3F));
      }
      else if((code >= 0xD800) && (code <= 0xDBFF)) {
        //辅助平面
        var extra = text.charCodeAt(i+1);
        if ((extra & 0xFC00) == 0xDC00) { //0xDC00 ~ 0xDFFF
          i++;
          code = ((code & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
        }
        ret.push(0xF0 | ((code >> 18) & 0x07));
        ret.push(0x80 | ((code >> 12) & 0x3F));
        ret.push(0x80 | ((code >> 6) & 0x3F));
        ret.push(0x80 | (code & 0x3F));
      }
      else if ((code >= 0x00010000) && (code <= 0x001FFFFF)) {
      }
      else if ((code >= 0x00200000) && (code <= 0x03FFFFFF)) {
      }
      else if ((code >= 0x04000000) && (code <= 0x7FFFFFFF)) {
      }
    }
    return ret;
  }
  cn.btos = function(buffer) {
    var ret = [];
    var len = buffer.length;
    for (var i = 0; i < len; i++) {
      var codes = [];
      codes.push(buffer[i]);
      if (((codes[0] >> 7) & 0xFF) == 0x0) {
        // 0xxxxxxx
        ret.push(String.fromCharCode(codes[0]));
      }
      else if (((codes[0] >> 5) & 0xFF) == 0x6) {
        // 110xxxxx 10xxxxxx
        codes.push(buffer[++i]);
        var utf16 = ((codes[0] & 0x1F) << 6) | (codes[1] & 0x3F);
        ret.push(String.fromCharCode(utf16));
      }
      else if (((codes[0] >> 4) & 0xFF) == 0xE) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        codes.push(buffer[++i]);
        codes.push(buffer[++i]);
        var utf16 =  ((codes[0] & 0x0F) << 12) | ((codes[1]  & 0x3F)  << 6) |  (codes[2]  & 0x3F);
        ret.push(String.fromCharCode(utf16));
      }
      else if (((codes[0] >> 3) & 0xFF) == 0x1E) {
        // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        codes.push(buffer[++i]);
        codes.push(buffer[++i]);
        codes.push(buffer[++i]);
        var utf16 = (((codes[0] & 0x07) << 18) | ((codes[1] & 0x3F) << 12) | ((codes[2] & 0x3F) << 06) | (codes[3] & 0x3F));
        ret.push(String.fromCharCode(0xD800 | utf16 >>> 10 & 0x3F ) + String.fromCharCode(0xDC00 | utf16  & 0x3FF) );
      }
      else if (((codes[0] >> 2) & 0xFF) == 0x3E) {
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
      }
      else if (((codes[0] >> 1) & 0xFF) == 0x7E) {
        // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
      }
    }
    return ret.join('');
  }
  cn.encode = function (buffer) {
    var i = 0;
    var len = buffer.length;
    var ret = [];
    while (i < len) {
      var c1 = buffer[i++];
      var h2 = i < len;
      var c2 = h2 ? buffer[i++] : 0;
      var h3 = i < len;
      var c3 = h3 ? buffer[i++] : 0;
      var e1 = c1 >>> 2;
      var e2 = ((c1 & 0x03) << 4) | (c2 >>> 4);
      var e3 = ((c2 & 0x0f) << 2) | (c3 >>> 6);
      var e4 = c3 & 0x3f;
      if (!h2) {
        e4 = e3 = 64;
      }
      else if (!h3) {
        e4 = 64;
      }
      ret.push(cn.table[e1]);
      ret.push(cn.table[e2]);
      ret.push(cn.table[e3]);
      ret.push(cn.table[e4]);
    }
    return ret.join('');
  };
  cn.decode = function (text) {
    var buffer = [];
    var len = text.length;
    text += "====";
    for (var i = 0; i < len; i += 4) {
      var c1 = text.charAt(i);
      var c2 = text.charAt(i + 1);
      var c3 = text.charAt(i + 2);
      var c4 = text.charAt(i + 3);
      buffer.push(((cn.map[c1] << 2) & 0xff) | (cn.map[c2] >> 4));
      if (c3 != '=') buffer.push(((cn.map[c2] << 4) & 0xff) | (cn.map[c3] >> 2));
      if (c4 != '=') buffer.push(((cn.map[c3] << 6) & 0xff) | cn.map[c4]);
    }
    buffer.push("\r\n");
    return buffer;
  };
  woo.add("base64", {
    encode: function(text){
      return cn.encode(cn.stob(text));
    },
    decode: function(data){
      return cn.btos(cn.decode(data.replace(/\s/g,"")));
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