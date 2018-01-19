-function(w){
  var fn = {};
  fn.json = function(o){
    try{
      return JSON.parse(o.text);
    }
    catch(e){
      return null;
    }
  }
  fn.go = function(method, url, data, callback){
    var xhr = new XMLHttpRequest();
    var f = typeof(callback)=="function"? callback : function(o){};
    var done = function(o){
      f(o);
      xhr = null;
    }
    xhr.onerror = function(e){
      done({status:0, text: "", data: this.response, error: "Network-Error", headers: [], json: function(){return null;}});
    }
    xhr.onabort = function(){
      done({status:0, text: "", data: this.response, error: "User-Abort", headers: [], json: function(){return null;}});
    }    
    xhr.ontimeout = function(){
      done({status:0, text: "", data: this.response, error: "Time-Out", headers: [], json: function(){return null;}});
    }
    xhr.onload = function(){
      var mc = (this.getAllResponseHeaders().replace(/\r/g, "")||"").match(/^([^:]*):(.*)$/igm);
      var headers = [];
      mc.map(function(row){
        var m = row.match(/^([^:]*):(.*)$/);
        headers.push({name: m[1].trim(), value: m[2].trim() });
      });
      done({status: this.status, text: this.responseText, data: this.response, error: null, headers: headers, json: function(){ return fn.json(this); }});
    }
    xhr.open(method||"GET", url, true);
    if(method=="POST"){
      xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");   
    }
    xhr.send(data||"");
  };
  if(!String.prototype.trim){
    String.prototype.trim = function(){ return  this.replace(/^\s+|\s+$/g, ''); }
  }
  fn.now = function(fmt){
    var d = new Date();
    var ret = fmt;
    if (!(typeof (ret) == "string"))
    {
      //ret = "yyyy-mm-dd hh:nn:ss.zzz";
      ret = "yyyy-mm-dd hh:nn:ss";
    }
    return ret.replace(/yyyy/ig, d.getFullYear()).replace(/mm/ig, ("00" + (d.getMonth() + 1)).slice(-2)).replace(/dd/ig, ("00" + d.getDate()).slice(-2)).replace(/hh/ig, ("00" + d.getHours()).slice(-2)).replace(/nn/ig, ("00" + d.getMinutes()).slice(-2)).replace(/ss/ig, ("00" + d.getSeconds()).slice(-2)).replace(/zzz/ig, ("000" + d.getMilliseconds()).slice(-3));
  };
  fn.encoder = {};
  fn.encoder.html = function(text){
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  fn.encoder.url = function(v){
    return w.encodeURIComponent(v);
  }; 
  var o = {
    now: function(fmt){
      return fn.now(fmt);
    },
    date :{
      now: function(){
        return fn.now();
      },
      format: function(fmt){
        return fn.now(fmt);
      }
    },
    encoder: {
      html: function(v){
        return fn.encoder.html(v);
      },
      url: function(v){
        return fn.encoder.url(v);
      }
    },
    ajax :{
      get: function(url, callback){
        fn.go("GET", url, "", callback);
      },
      post: function(url, data, callback){
        fn.go("POST", url, data, callback);
      },
      go: function(method, url, data, callback){
        fn.go(method, url, data, callback);
      }
    }
  };
  w.ajax = o.ajax;
  w["o-muen"] = o;
}(window);
