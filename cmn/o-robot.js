!function(woo){
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
  
  fn.encodeurl = function(v){
    return window.encodeURIComponent(v);
  }
  
  //ajax
  var ajax = {
    get: function(url, callback){
      fn.go("GET", url, "", callback);
    },
    post: function(url, data, callback){
      fn.go("POST", url, data, callback);
    },
    go: function(method, url, data, callback){
      fn.go(method, url, data, callback);
    }
  };
  
  //robot
  var cmd = {};
  cmd.heartbeat = function(name, sid, callback){
    var me = this;
    var data = [];
    data.push("name=" + fn.encodeurl(name))
    data.push("sid=" + fn.encodeurl(sid));
    ajax.post("/woo/bin/center/heartbeat.do", data.join("&"), function(o){
      try{
        var ret = o.json();
        if(ret && ret.result){
          callback(true);
        }
        else{
          callback(false);
        }
      }
      catch(e) {
        callback(false);
      }
    });
  };
  cmd.connect = function(name, token, callback){
    var me = this;
    var data = [];
    data.push("name=" + fn.encodeurl(name))
    data.push("token=" + fn.encodeurl(token));
    ajax.post("/woo/bin/center/connect.do", data.join("&"), function(o){
      try{
        var ret = o.json();
        if(ret && ret.result){
          callback(ret.sid);
        }
        else{
          callback("");
        }
      }
      catch(e){
        console.log(e);
        callback("");
      }
    });
  };
  cmd.save = function(name, sid, database, summary, content, callback){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.sid=" + fn.encodeurl(sid));
    data.push("robot.dbase=" + fn.encodeurl(database));
    data.push("summary=" + fn.encodeurl(summary));
    data.push("content=" + fn.encodeurl(content));
    ajax.post("/woo/bin/center/dbases/save.do", data.join("&"), function(o){
      //console.log(o.text);
      try{
        var ret = o.json();
        if(ret && ret.result){
          callback(ret.rowid);
        }
        else{
          console.log(o.text);
          callback("");
        }
      }
      catch(e){
        console.log(e);
        callback("");
      }
    });      
  };
  cmd.hash = function(name, database, content, callback){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.dbase=" + fn.encodeurl(database));
    data.push("content=" + fn.encodeurl(content));

    ajax.post("/woo/bin/center/dbases/hash.do", data.join("&"), function(o){
      try{
        var ret = o.json();
        if(ret){
          callback(ret.hash, ret.count);
        }
      }
      catch(e){
        console.log(e);
        callback("", 0);
      }
    });
  };
  var mission = {};
  mission.load = function(name, handler, callback){
    var data = [];
    data.push("name=" + fn.encodeurl(name));
    data.push("handler=" + fn.encodeurl(handler));
    ajax.get('/woo/bin/center/tasks/load.do?' + data.join('&'), function(o){
      var text = o.text;
      var m = {rowid:"", data:""};
      var p = text.indexOf('|');
      if(p>-1){
        m.rowid = text.slice(0,p);
        m.data = text.slice(p+1);
      }
      callback(m);
    });
  };
  mission.push = function(name, sid, handler, content, callback){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.sid=" + fn.encodeurl(sid));
    data.push("handler=" + fn.encodeurl(handler));
    data.push("data=" + fn.encodeurl(content));
    ajax.post("/woo/bin/center/tasks/push.do", data.join("&"), function(o){
      try{
        var ret = o.json();
        if(ret && ret.result){
          callback(ret.rowid);
        }
        else{
          console.log(o.text);
          callback("");
        }
      }
      catch(e){
        console.log(e);
        callback("");
      }
    });  
  };
  mission.remove = function(name, sid, rowid, callback){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.sid=" + fn.encodeurl(sid));
    data.push("rowid=" + fn.encodeurl(rowid));
    ajax.post("/woo/bin/center/tasks/remove.do", data.join("&"), function(o){
      //console.log((data||"").toString());
      try{
        var ret = o.json();
        if(ret && ret.result){
          callback(ret.rowid);
        }
        else{
          console.log(o.text);
          callback("");
        }
      }
      catch(e){
        console.log(e);
        callback("");
      }
    });  
  };
  mission.reset = function(name, sid, rowid, callback){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.sid=" + fn.encodeurl(sid));
    data.push("rowid=" + fn.encodeurl(rowid));
    ajax.post("/woo/bin/center/tasks/reset.do", data.join("&"), function(o){
      //console.log((data||"").toString());
      try{
        var ret = o.json();
        if(ret && ret.result){
          callback(ret.rowid);
        }
        else{
          console.log((data||"").toString());
          callback("");
        }
      }
      catch(e){
        console.log(e);
        callback("");
      }
    });  
  };
  
  var robot = {};
  robot.create = function(name, token){
    var sid = "";
    var timer = 0;
    var database = "";
    var rbt = {};
    function heartbeat() {
      if(!sid) return;
      console.log('robot: I am still alive.');
      cmd.heartbeat(name, sid, function(v){
        if(!v){
          console.log('robot: reconnecting...');
          rbt.connect();
        }
      });    
    };
    rbt.connect = function(callback){
      console.log('robot: connecting...');
      cmd.connect(name, token, function(sessionid){
        var ok = (sessionid!="");
        if(ok){
          sid = sessionid;
          window.clearInterval(timer);
          timer = window.setInterval(heartbeat, 60e3);
          console.log('robot: connected. sid=%s', sid);
        }
        else {
        }
        if(typeof(callback)=="function"){
          try{
            callback(ok)
          }
          catch(e){
            console.log(e);
          }
        }
      });
    };
    
    rbt.disconnect = function(){
      var t = timer;
      sid = "";
      timer = 0;
      window.clearInterval(t);
    };
    
    rbt.database = function(db){
      if(!db){
        return database;
      }
      database = db;
    };
    
    rbt.save = function(summary, content, callback){
      cmd.save(name, sid, database, summary, content, callback||function(){});
    };
    rbt.hash = function(data, callback){
      cmd.hash(name, database, data, callback||function(){});
    };
    rbt.mission = {};
    rbt.mission.load = function(handler, callback){
      mission.load(name, handler, callback||function(){});
    };
    rbt.mission.push = function(handler, data, callback){
      mission.push(name, sid, handler, data, callback||function(){});
    };
    rbt.mission.remove = function(rowid, callback){
      mission.remove(name, sid, rowid, callback||function(){});
    };
    rbt.mission.reset = function(rowid, callback){
      mission.reset(name, sid, rowid, callback||function(){})
    };
    return rbt;
  };
  //export
  //woo.modules.add("ajax", ajax);
  woo.modules.add("robot", robot);
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
      if(window.Modules && window.Modules.add){
        for(var i=0; i<this.modules.length; i++){
          var m = this.modules[i];
          window.Modules.add(m.name, m.module);
        }
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
  return woo;
}());