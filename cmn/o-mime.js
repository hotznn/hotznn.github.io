!function(woo){
  var w = window;
  var fn = {};
  fn.trim = function(text){
    return (text || "").replace(/^\s+|\s+$/g, "");
  };
  fn.nv = function(text){
    var kv = {name:"", value:""};
    var mc = (text||"").match(/^([^:]*):(.*)$/);
    if(mc){
      kv.name = this.trim(mc[1]);
      kv.value = this.trim(mc[2]);
    }
    return kv;
  };
  fn.create = function(text){
    var ret =  { headers: {}, items: [] };
    var brk = text.indexOf("\r\n\r\n");
    if(brk==-1) {
      return ret;
    }   
    var meta = { header: text.slice(0, brk), content: text.slice(brk + 2), items: [] };
    var mch = meta.header.match(/^([^:]*)\:(.*)$/mg);
    if(!mch) {
      return ret;
    }
    for(var i=0; i<mch.length; i++){
      var kv = this.nv(mch[i]);
      ret.headers[kv.name] = kv.value;
    }
    var boundary = "\r\n" + ret.headers["boundary"];
    meta.items = meta.content.split(boundary);
    for(var i=0; i<meta.items.length; i++){
      var text = meta.items[i];
      if( (text=="")||(text=="--\r\n") ) continue;
      var brk = text.indexOf("\r\n\r\n");
      if(brk==-1) continue;
      var headers = text.slice(0, brk);
      if(headers=="") continue;
      var item = { headers: {}, content: "" };
      var mch = headers.match(/^([^:]*)\:(.*)$/mg);
      if(!mch) continue;
      for(var ii=0; ii<mch.length; ii++){
        var kv = this.nv(mch[ii]);
        item.headers[kv.name] = kv.value;
      }
      item.content = text.slice(brk+4);
      ret.items.push(item);
    }
    ret.foreach = function(f){
      var fun = typeof(f)=='function'? f: function(){};
      for(var i=0; i<this.items.length; i++){
        fun(this.items[i]);
      }
    }
    return ret;
  };
  woo.add("mime", function(text){
    return fn.create(text||"");
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
