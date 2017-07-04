//-ajax.js
//Bamboo
//Created: 2010-06-21
//Modified: 2014-03-20

var ajax = {};
ajax.xhr = function() {   
  return window.XMLHttpRequest ? new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");  
};
ajax.get = function(url, callback){
  var me = this;
  if(typeof(callback)=="function"){
    me.hi.get(url, callback);
  }
  else{
    var xhr = this.xhr();
    var strResult=" ";
    xhr.open("GET", url, false);
    try{
      xhr.send("");
      if((xhr.readyState==4||xhr.readyState=="complete") && (xhr.status==200)){
        strResult = xhr.responseText;
      }
      else{
        strResult = "Error: Can not connect to the server. ";
      }
    }
    catch(err){
      return "";
    }
    xhr = null;
    return strResult;
  }
};
ajax.go = function(url){
  var xhr = this.xhr();
  var ret={status:0, header:"", text:""};
  xhr.open("GET", url, false);
  try{
    xhr.send("");
    if((xhr.readyState==4||xhr.readyState=="complete") && (xhr.status==200)){
      ret.status = 200;
      ret.header = xhr.getAllResponseHeaders();
      ret.text = xhr.responseText;
    }
    else{
      ret.status = 500;
      ret.header = "";
      ret.text = "Error: Can not connect to the server. ";
    }
  }
  catch(err){
    return ret;
  }
  xhr = null;
  return ret;
}
ajax.post = function(url, content, callback){
  var me = this;
  if(typeof(callback)=="function"){
    me.hi.post(url, content, callback);
  }
  else{
    var xhr=this.xhr();
    var strResult=" ";
    xhr.open("POST", url, false); 
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
    //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');   
    try{
      xhr.send(content);
      if((xhr.readyState==4) && (xhr.status==200)){
        strResult = xhr.responseText;
      }
      else{
        strResult = "Error: Can not connect to the server. ";
      }
    }
    catch(err){
      return "";
    }

    xhr = null; 
    return strResult;
  }
};
ajax.hi={};
ajax.hi.go = function(method, url, body, callback, timeout){
  var xhr = ajax.xhr();
  var tot = {current:0, timeout: timeout||150};
  var timer = null;
  var f = typeof(callback)=="function"? callback : function(text, err){};
  var done = function(text, err){
    if(timer) window.clearInterval(timer);
    f(text, err);
    xhr = null;
  }
  
  
  xhr.onreadystatechange = function(){
    if (!(this.readyState==4 || this.readyState=="complete")){
      return;
    }
    if(this.status==200){
      done(this.responseText, null);
    }
    else{
      done("", this.status);
    }
  };
  
  xhr.open(method||"GET", url, true);
  if(method=="POST"){
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");   
  }
  xhr.send(body||"");
  timer = window.setInterval(function(){
    if(tot.current>tot.timeout){
      done("", "{result:false, msg:'timeout'}");
    }
    tot.current++;
  },100);  
}
ajax.hi.get=function(url, callback, timeout){
  this.go("GET", url, "", callback, timeout);
};
ajax.hi.post = function(url, body, callback, timeout){
  this.go("POST", url, body, callback, timeout);
}
ajax.json={};
ajax.json.get=function(url, callback){
  var me = this;
  if(typeof(callback)=="function"){
    ajax.hi.get(url, function(text, err){
      if(err){
        callback(null, err);
        return;
      }
      try{
        var json = eval("(" + text + ");");
        callback(json, null);
      }
      catch(e){
        callback(null, e);
      }
    });
  }
  else{
    try{
      return eval("(" + ajax.get(url) + ");");
    }
    catch(e){
      return null;
    }
  }
};
ajax.json.post=function(url, content, callback){
  var me = this;
  if(typeof(callback)=="function"){
    ajax.hi.post(url, content, function(text, err){
      if(err){
        callback(null, err);
        return;
      }
      try{
        var json = eval("(" + text + ");");
        callback(json, null);
      }
      catch(e){
        callback(null, e);
      }
    });
  }
  else{
    try{
      return eval("(" + ajax.post(url, content) + ");");
    }
    catch(e){
      return null;
    }
  }
};
