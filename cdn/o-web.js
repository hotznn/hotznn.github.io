void function(w){
  var woo = {};
  woo.json = function(o){
    try{
      return JSON.parse(o.text);
    }
    catch(e){
      return null;
    }
  };
  woo.go = function(method, url, data){
    var me = this;
    var blob = false;
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var ret = {status: 0, text: "", data: this.response, error: "Network-Error", headers: [], json: function(){return null;}};
      var done = function(o){
        resolve(o);
        xhr = null;
      }
      xhr.onerror = function(e){
        reject(e);
      }
      xhr.onabort = function(){
        done({status: 0, text: "", data: this.response, error: "User-Abort", headers: [], json: function(){return null;}});
      }
      xhr.ontimeout = function(){
        done({status: 0, text: "", data: this.response, error: "Time-Out", headers: [], json: function(){return null;}});
      }
      xhr.onload = function(){
        var mc = (this.getAllResponseHeaders().replace(/\r/g, "")||"").match(/^([^:]*):(.*)$/igm);
        var headers = [];
        mc.map(function(row){
          var m = row.match(/^([^:]*):(.*)$/);
          headers.push({name: m[1].trim(), value: m[2].trim() });
        });
        done({status: this.status, text: (!!blob)?"[blob]":this.responseText, data: this.response, error: null, headers: headers, json: function(){ return me.json(this); }});
      };
      xhr.open(method||"GET", url, true);
      xhr.setRequestHeader("X-With","o-muen/1.0");
      if(!!blob){
        xhr.responseType = "blob";
      }
      else if( (method=="POST")||(method=="PUT")||(method=="DELETE") ){
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
      }
      xhr.send(data||"");
    });
  };
  w.add("web", {
    get: async function(url){
      return await woo.go("GET", url, "");
    },
    post: async function(url, data){
      return await woo.go("POST", url, data);
    },
    go: async function(method, url, data){
      return await woo.go(method, url, data);
    },
    data: function(nv){
      var ret = {
        data:[],
        add: function(name, value){
          this.data.push(name + "=" + window.encodeURIComponent(value));
        },
        build: function(){
          return this.data.join("&");
        }
      };
      for(var n in nv){
        ret.add(n, nv[n]);
      }
      return ret;
    }
  });
  w.end();
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
