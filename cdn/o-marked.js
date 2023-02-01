/*!
 * https://www.bimwook.com/
 *
 * Copyright (c) 2016-2020 Yangbo
 *
 * Date: 2018-01-03 16:00:00 +0800
 * Revision: 2.0
 *
 * Date: 2021-07-13 16:00:00 +0800
 * Revision: 2.1
 *
 * Date: 2022-07-19 16:00:00 +0800
 * Revision: 2.2
 */
!function(woo){
  var marked = {};
  marked.version = "v2.1";
  marked.memo = "";
  marked.encode = function(s){
    return s.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  marked.items = [
    {
      name: "img",
      regex: /!\[((?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?)\]\(\s*(<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var alt = (mcs[1]||"");
          var url = mcs[2].replace(/_/g, "%5F").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/#/g, "%23");
          var v = {
            id: Math.random().toString(36) + Math.random().toString(36),
            value: '<img src="' + marked.encode(url) + '" class="md-media-image" alt="' + marked.encode(alt) + '" />'
          };
          if(alt=="video"){
            v.value= '<video class="md-media-video" src="' + marked.encode(url) + '"></video>';
          }
          else if(alt=="audio"){
            v.value= '<audio class="md-media-audio" src="' + marked.encode(url) + '"></audio>';
          }
          cache.push(v);
          data = data.replace(this.regex, "<!--#" + v.id + "#-->");
        }
        return data;
      }
    },
    {
      name: "link",
      regex: /!?\[((?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?)\]\(\s*(<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var url = mcs[2].replace(/_/g, "%5F").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/#/g, "%23");
          var v = {
            id: Math.random().toString(36) + Math.random().toString(36),
            value: '<a class="md-anchor" target="_blank" href="' + marked.encode(url) + '" title="' + marked.encode(mcs[3]||"") + '">' + marked.encode(mcs[1]) + '</a>'
          };
          cache.push(v);
          data = data.replace(this.regex, "<!--%" + v.id + "%-->");
        }
        return data;
      }
    },
    {
      name: "blockquote",
      regex: /^>[ 　]([^\n]+)/,
      execute: function(data, cache){
        var d = (data||"").replace("&gt;", ">");
        while(true){
          var mcs = d.match(this.regex);
          if(!mcs) break;
          var s = '<dd class="md-block-item">' + mcs[1] + '</dd>';
          data = d.replace(this.regex, s);
          d = data;
        }
        return data;
      }
    },
    {
      name: "li",
      regex: /^-[ 　]([^\n]+)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<li class="md-listview-item">' + mcs[1] + '</li>';
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
          var lv = mcs[1].length;
          var s = '<h' + lv + ' class="md-head-' + lv + '">'  + mcs[2] + '</h' + lv + '>';
          data = data.replace(this.regex, s);
        }
        return data;
      }
    },
    {
      name: "hr",
      regex: /^( *[-=*_]){3,} *(\n+|$)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<hr class="md-line" />';
          data = data.replace(this.regex, s);
        }
        return data;
      }
    },
    //code: /^( {4}[^\n]+\n*)+/,
    {
      name: "strong",
      regex: /\*\* ([\s\S]+?) \*\*(?!\*)|__ ([\s\S]+?) __(?!_)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<b class="md-bold">' + marked.encode(mcs[1]||mcs[2]) + '</b>';
          data = data.replace(this.regex, s);
        }
        return data;
      }
    },
    {
      name: "italic",
      regex: /_ ([\s\S]+?) _(?!_)/,
      execute: function(data, cache){
        while(true){
          var mcs = (data||"").match(this.regex);
          if(!mcs) break;
          var s = '<i class="md-italic">' + marked.encode(mcs[1]) + '</i>';
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
          if(text.indexOf("<h")>-1 || text.indexOf("<!--#")>-1 || text.indexOf("<dd")>-1 || text.indexOf("<li")>-1) {
            lines.push(text);
          }
          else{
            lines.push('<p>' + text + '</p>');
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
    var idt = (indent||"");
    fn.lines = data.replace(/\r/g, "").split('\n');
    fn.cache = [];
    if(!fn.lines) return "";
    var islist = false;
    var isquote = false;
    fn.lines.push("");
    //console.log(fn.lines.join("\r\n"));
    for(var i=0; i<fn.lines.length; i++) {
      var line = (fn.lines[i]).replace(/(^\s*)|(\s*$)/g, "");
      //List
      if(line.match(/^-[ 　].+$/)){
        if(!islist){
          ret.push(idt + '<ul class="md-listview">');
        }
        islist = true;
      }
      else {
        if(islist){
          ret.push(idt + "</ul>");
        }
        islist = false;
      }
      //Quote
      if(line.replace("&gt;",">").match(/^>[ 　].+$/)){
        if(!isquote){
          ret.push(idt + '<dl class="quote">');
        }
        isquote = true;
      }
      else {
        if(isquote){
          ret.push(idt + "</dl>");
        }
        isquote = false;
      }
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
      if(line.indexOf("<li ")>-1){
        line = "  " + line;
      }
      else if(line.indexOf("<dd ")>-1) {
        line = "  " + line;
      }
      //console.log(line);
      ret.push(idt + line);
    }
    ret.pop();
    var text = ret.join("\r\n");
    for(var i=0; i<fn.cache.length; i++){
      var v = fn.cache[i];
      text = text.replace("<!--%" + v.id + "%-->", v.value);
      text = text.replace("<!--#" + v.id + "#-->", v.value);
    }
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
