-function(woo){
  var w = window;
  if(!String.prototype.trim){
    String.prototype.trim = function(){ return  this.replace(/^\s+|\s+$/g, ''); }
  }
  
  //o-muen
  !function($){
    var fn = {};
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
    
    $.add("o-muen", {
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
      }
    });
  }(woo.modules);

  //ajax
  !function($){
    var fn = {};
    fn.json = function(o){
      try{
        return JSON.parse(o.text);
      }
      catch(e){
        return null;
      }
    };
    fn.go = function(method, url, data, callback){
      var xhr = new XMLHttpRequest();
      var f = typeof(callback)=="function"? callback : function(o){};
      var done = function(o){
        f(o);
        xhr = null;
      }
      xhr.onerror = function(e){
        done({status: 0, text: "", data: this.response, error: "Network-Error", headers: [], json: function(){return null;}});
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
        done({status: this.status, text: this.responseText, data: this.response, error: null, headers: headers, json: function(){ return fn.json(this); }});
      }
      xhr.open(method||"GET", url, true);
      if(method=="POST"){
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");   
      }
      xhr.send(data||"");
    };  
    $.add("ajax", {
      get: function(url, callback){
        fn.go("GET", url, "", callback);
      },
      post: function(url, data, callback){
        fn.go("POST", url, data, callback);
      },
      go: function(method, url, data, callback){
        fn.go(method, url, data, callback);
      }
    });
  }(woo.modules);
  
  //dom
  !function($){
    var bind = function (item, name, fun) {
      var args = Array.prototype.slice.call(arguments).slice(2);
      var e = function (event) {
        return fun.apply(item, [event || window.event].concat(args));
      }
      if (item.addEventListener) {
        item.addEventListener(name, e, false);
      } else if (item.attachEvent) {
        item.attachEvent("on" + name, e);
      } else {
        item["on" + name] = e;
      }
      return { item: item, name: name, callback: e };
    };
    var unbind = function(item, name, callback) {
      if (item.removeEventListener) {
        item.removeEventListener(name, callback, false);
      }
      else if (item.detachEvent) {
        item.detachEvent("on" + name, callback);
      } 
      else { 
        item["on" + name] = null;
      }
    };
    var o = function(v){
      var x = { items: [(typeof(v) === "string")?document.querySelector(v):v] };//querySelectorAll
      x.foreach = function(callback){
        var f = (typeof(callback)=="function") ? callback:function(){};
        for(var i=0; i<this.items.length; i++){
          callback(this.items[i]);
        }
      };
      x.html = function (value) {
        if (value === undefined) {
          var html = [];
          this.foreach(function(item){
            html.push(item.innerHTML);
          });
          return html.join('\r\n');
        }
        this.foreach(function(item){
          item.innerHTML = value;
        });
      };
      x.text = function (value) {
        if (value === undefined) {
          var text = [];
          this.foreach(function(item){
            html.push(item.innerText);
          });
          return html.join('\r\n');
        }
        this.foreach(function(item){
          item.innerText = value;
        });
      };    
      x.append = function (o) {
        var parent = this.items[0];
        if(parent){
          o.foreach(function(dom){
            parent.appendChild(dom);
          });
        }
      };
      x.css = function (key, value) {
        this.foreach(function(item){
          item.style[key] = value;
        });
      };
      x.hide = function(){
        this.foreach(function(item){
          item.style.display = "none";;
        });
      }
      x.show = function(){
        this.foreach(function(item){
          item.style.display = "";;
        });
      }
      
      x.cssclass = function(value){
        this.foreach(function(item){
          item.className = value;
        });
      }
      x.cssclass.add = function(value){
        this.foreach(function(item){
          if(item.className.indexOf(value)==-1){
            item.className += (" " + value);
          }
        });
      }
      x.cssclass.remove = function(value){
        this.foreach(function(item){
          var s = item.className;
          var p = s.indexOf(value);
          if(p>-1){
            this.className = (s.slice(0,p) + s.slice(p + value.length +1)).trim();
          }
        });
      }
      x.val = function(value){
        if (value === undefined) {
          var v = [];
          this.foreach(function(item){
            v.push(item.value);
          });
          return v.join('\r\n');
        }
        this.foreach(function(item){
          item.value = value;
        });
      }

      x.events = x.events||[];
      x.on = function (name, callback) {
        var me = this;
        this.foreach(function(item){
          item.events = item.events ||[];
          item.events.push(bind(item, name, callback));
        });
        return this;
      };
      x.off = function(){
        this.foreach(function(item){
          if(item.events){
            for(var i=0; i<item.events.length; i++){
              var evt = item.events[i];
              unbind(evt.item, evt.name, evt.callback);
            }
          }
          item.events = [];
        });
        return this;
      }
      return x;
    };
    $.add("dom", o);
  }(woo.modules);

  //ready
  woo.finished = true;
}(function(){
  var meta = {
    finished: false,
    modules: [],
    add: function(name, module){
      this.modules.push({name: name, module: module});
    },
    load: function(name){
      for(var i=0; i<this.modules.length; i++){
        var m = this.modules[i];
        if(m.name==name) {
          return m.module;
        }
      }
      return null;
    },
    build: function(){
      window.modules = window.modules||{};
      for(var i=0; i<this.modules.length; i++){
        var m = this.modules[i];
        window.modules[m.name] = m.module;
      }
    }
  };
  var woo = {};
  var define = Object.defineProperty;
  define(woo, "modules", {
    get: function (){
      return {
        add: function(name, module){
          meta.add(name, module);
        }
      }
    } 
  });
  define(woo, "finished", {
    get: function (){return meta.finished},
    set: function(v){
      meta.finished = v;
      if(v){
        meta.build();
      }
    }
  }); 
  define(window, "Modules", {
    get: function (){
      return {
        load: function(name){
          return meta.load(name);
        },
        add: function(name, module){
          meta.add(name, module);
        }
      }
    },
  });
  return woo;
}());