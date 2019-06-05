/*!
 * https://www.bimwook.com/
 *
 * Copyright (c) 2016-2018 Yangbo
 *
 * Date: 2018-01-03 16:00:00 +0800
 * Revision: 2.0
 */
!function(woo){
  var marked = {};
  marked.encode = function(s){
    return s.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  marked.items = [
    {
      name: "img",
      regex: /!\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var alt = (mcs[1]||"");
          var v = {id: Math.random().toString(36), value: '<img src="' + marked.encode(mcs[2]) + '" alt="' + marked.encode(alt) + '" />'};
          if(alt=="video"){
            v.value= '<video src="' + marked.encode(mcs[2]) + '"></video>';
          }
          else if(alt=="audio"){
            v.value= '<audio src="' + marked.encode(mcs[2]) + '"></audio>';
          }
          
          cache.push(v);
          data = data.replace(this.regex, "<!--%" + v.id + "%-->");
        }
        return data;
      }
    },
    {
      name: "link",
      regex: /!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var v = {id: Math.random().toString(36), value: '<a target="_blank" href="' + marked.encode(mcs[2]) + '" title="' + marked.encode(mcs[3]||"") + '">' + marked.encode(mcs[1]) + '</a>'};
          cache.push(v);          
          data = data.replace(this.regex, "<!--%" + v.id + "%-->");
        }
        return data;      
      }
    },
    {
      name: "blockquote",
      regex: /^> ([^\n]+)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<blockquote>' + mcs[1] + '</blockquote>';        
          data = data.replace(this.regex, s);
        }
        return data;
      }
    },
    {
      name: "heading",
      regex: /^(#{1,6}) {0,}([^\n]+?) *#* *(?:\n+|$)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var l = mcs[1].length;
          var s = '<h' + l +">"  + mcs[2] + '</h' + l + '>';        
          data = data.replace(this.regex, s);
        }
        return data;
      }
    },
    {
      name: "hr",
      regex: /^( *[-*_]){3,} *(\n+|$)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<hr />';        
          data = data.replace(this.regex, s);
        }
        return data;  
      }
    },
    //code: /^( {4}[^\n]+\n*)+/,
    {
      name: "strong",
      regex: /\*\*([\s\S]+?)\*\*(?!\*)|__([\s\S]+?)__(?!_)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          
          var s = '<strong>' + marked.encode(mcs[1]||mcs[2]) + '</strong>';        
          data = data.replace(this.regex, s);
        }
        return data;        
      }
    },
    {
      name: "italic",
      regex: /_([\s\S]+?)_(?!_)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<i>' + marked.encode(mcs[1]) + '</i>';        
          data = data.replace(this.regex, s);
        }
        return data;        
      }
    },  
    {
      name: "tag",
      regex: /`([\s\S]+?)`(?!`)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<em class="tag">' + marked.encode(mcs[1]) + '</em>';        
          data = data.replace(this.regex, s);
        }
        return data;        
      }
    },
    {
      name: "p",
      regex: /^ {0,}([\w\W]+?)$/g,
      execute: function(data, cache){
        var mcs = (data||"").match(this.regex);
        if(!mcs) return data;
        var lines = [];
        for(var i=0; i<mcs.length; i++){
          var mc = mcs[i];
          var text = (mc + "").replace(/(^\s*)|(\s*$)/g, "");
          if(text.indexOf("<h")>-1 || text.indexOf("<img ")>-1 || text.indexOf("<blockquote")>-1){
            lines.push(text);
          }
          else{
            lines.push("<p>" + text + "</p>");
          }
        }
        //data = '<p>' + data.replace(this.regex, s) + '</p>';
        return lines.join('\r\n');  
      }
    },
  ];
  marked.parse = function(data, indent){
    var fn = {};
    var ret = [];
    fn.lines = data.replace(/\r/g, "").split('\n');
    fn.cache = [];
    if(!fn.lines) return "";
    for(var i=0; i<fn.lines.length; i++){
      var line = (fn.lines[i]).replace(/(^\s*)|(\s*$)/g, "");
      if(line){
        for(var rr=0; rr<this.items.length; rr++){
          var reg = this.items[rr];
          if(!reg) continue;
          line = reg.execute(line, fn.cache);
        }
      }
      else {
        line = "<p>　</p>";
      }
      //console.log(line);
      ret.push((indent||"") + line);
    }
    var text = ret.join("\r\n");
    for(var i=0; i<fn.cache.length; i++){
      var v = fn.cache[i];
      text = text.replace("<!--%" + v.id + "%-->", v.value);
    }
    //console.log(text);
    //console.log(ret.join(''));
    return text;
  };
  woo.add("marked", marked);
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