-function(w){
  var fn = {};
  fn.go = function(method, url, data, callback){
    var xhr = new XMLHttpRequest();
    var f = typeof(callback)=="function"? callback : function(o){};
    var done = function(o){
      f(o);
      xhr = null;
    }
    xhr.onerror = function(e){
      done({text: "", data: this.response, error: "Network-Error", headers: []});
    }
    xhr.onabort = function(){
      done({text: "", data: this.response, error: "User-Abort", headers: []});
    }    
    xhr.ontimeout = function(){
      done({text: "", data: this.response, error: "Time-Out", headers: []});
    }

    xhr.onload = function(){
      var mc = (this.getAllResponseHeaders().replace(/\r/g, "")||"").match(/^([^:]*):(.*)$/igm);
      var headers = [];
      mc.map(function(row){
        var m = row.match(/^([^:]*):(.*)$/);
        headers.push({name: m[1].trim(), value: m[2].trim() });
      });
      done({text: this.responseText, data: this.response, error: null, headers: headers});
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
  Date.prototype.format = function(fmt){
    var ret = fmt;
    if (!(typeof (ret) == "string"))
    {
      //ret = "yyyy-mm-dd hh:nn:ss.zzz";
      ret = "yyyy-mm-dd hh:nn:ss";
    }
    return ret.replace(/yyyy/ig, this.getFullYear()).replace(/mm/ig, ("00" + (this.getMonth() + 1)).slice(-2)).replace(/dd/ig, ("00" + this.getDate()).slice(-2)).replace(/hh/ig, ("00" + this.getHours()).slice(-2)).replace(/nn/ig, ("00" + this.getMinutes()).slice(-2)).replace(/ss/ig, ("00" + this.getSeconds()).slice(-2)).replace(/zzz/ig, ("000" + this.getMilliseconds()).slice(-3));
  };
  w.$nt = {
    now: function(){
      return (new Date()).format();
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
  }
  w.ajax = $nt.ajax;
}(window);
