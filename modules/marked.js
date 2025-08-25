const Woo = {};
((Woo)=>{
  let marked = {
    version: "v3.0",
    memo: "",
    encode(txt){
      return txt.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    items: [
      {
        name: "center",
        regex: /^\s*:::\s*(.+?)\s*:::\s*$/gm,
        execute(data, cache){
          return data.replace(this.regex, (match, content) => {
            return `<div class="md-center">${content}</div>`;
          })
        }
      },
      {
        name: "img",
        regex: /!\[((?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?)\]\(\s*(<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let alt = (mcs[1]||"");
            let url = mcs[2].replace(/_/g, "%5F").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/#/g, "%23");
            let v = {
              id: Math.random().toString(36) + Math.random().toString(36),
              value: '<img src="' + marked.encode(url) + '" class="md-media-loader" alt="' + marked.encode(alt) + '" />'
            };
            if(alt=="video"){
              v.value= '<video controls="controls" class="md-media-video" src="' + marked.encode(url) + '"></video>';
            }
            else if(alt=="audio"){
              v.value= '<audio controls="controls" class="md-media-audio" src="' + marked.encode(url) + '"></audio>';
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
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let id = Math.random().toString(36) + Math.random().toString(36);
            let url = mcs[2].replace(/_/g, "%5F").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/#/g, "%23");
            let label = marked.encode(mcs[1]);
            let value = '<a class="md-anchor" target="_blank" href="' + url + '" title="' + marked.encode(mcs[3]||"") + '">' + label + '</a>';
            if(label.indexOf("download:")==0){
              let name = label.slice(9).replace(/"|'/g, "_");
              value = '<a class="md-anchor" download="' + name + '" href="' + url + '" title="' + marked.encode(mcs[3]||"") + '">' + label + '</a>'
            }
            cache.push({ id: id, value: value });
            data = data.replace(this.regex, "<!--%" + id + "%-->");
          }
          return data;
        }
      },
      {
        name: "blockquote",
        regex: /^>[ 　]([^\n]+)/,
        execute(data, cache){
          let d = (data||"").replace("&gt;", ">");
          while(true){
            let mcs = d.match(this.regex);
            if(!mcs) break;
            let s = '<dd class="md-block-item">' + mcs[1] + '</dd>';
            data = d.replace(this.regex, s.replace(/\$1/g, "$$$1"));
            d = data;
          }
          return data;
        }
      },
      {
        name: "li",
        regex: /^[-*][ 　]([^\n]+)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let s = '<li class="md-listview-item">' + mcs[1] + '</li>';
            data = data.replace(this.regex, s.replace(/\$1/g, "$$$1"));
          }
          return data;
        }
      },
      {
        name: "heading",
        regex: /^(#{1,6}) {0,}([^\n]+?) *#* *(?:\n+|$)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let lv = mcs[1].length;
            let s = '<h' + lv + ' class="md-head-' + lv + '">'  + mcs[2] + '</h' + lv + '>';
            s = s.replace(/\$1/g, "$$$1");
            s = s.replace(/\$2/g, "$$$2");
            s = s.replace(/\$3/g, "$$$3");
            data = data.replace(this.regex, s);
          }
          return data;
        }
      },
      {
        name: "hr",
        regex: /^( *[-=*_]){3,} *(\n+|$)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let s = '<hr class="md-line" />';
            data = data.replace(this.regex, s);
          }
          return data;
        }
      },
      //code: /^( {4}[^\n]+\n*)+/,
      {
        name: "strong",
        regex: /\*\*([\s\S]+?)\*\*(?!\*)|__ ([\s\S]+?) __(?!_)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let s = '<b class="md-bold">' + marked.encode(mcs[1]||mcs[2]) + '</b>';
            s = s.replace(/\$1/g, "$$$1");
            s = s.replace(/\$2/g, "$$$2");
            s = s.replace(/\$3/g, "$$$3");
            s = s.replace(/\$4/g, "$$$4");
            data = data.replace(this.regex, s);
          }
          return data;
        }
      },
      {
        name: "italic",
        regex: /_ ([\s\S]+?) _(?!_)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let s = '<i class="md-italic">' + marked.encode(mcs[1]) + '</i>';
            s = s.replace(/\$1/g, "$$$1");
            s = s.replace(/\$2/g, "$$$2");
            data = data.replace(this.regex, s);
          }
          return data;
        }
      },
      {
        name: "label",
        regex: /`([\s\S]+?)`(?!`)/,
        execute(data, cache){
          while(true){
            let mcs = (data||"").match(this.regex);
            if(!mcs) break;
            let s = '<em class="md-label">' + marked.encode(mcs[1]) + '</em>';
            s = s.replace(/\$1/g, "$$$1");
            s = s.replace(/\$2/g, "$$$2");
            data = data.replace(this.regex, s);
          }
          return data;
        }
      },
      {
        name: "p",
        regex: /^ {0,}([\w\W]+?)$/g,
        execute(data, cache){
          let mcs = (data||"").match(this.regex);
          if(!mcs) return data;
          let lines = [];
          for(let i=0; i<mcs.length; i++){
            let mc = mcs[i];
            let text = (mc + "").replace(/(^\s*)|(\s*$)/g, "");
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
    ],
    build(data, indent){
      let context = {};
      let ret = [];
      let idt = (indent||"");
      context.lines = data.replace(/\r/g, "").split('\n');
      context.cache = [];
      if(!context.lines) return "";
      let is_list = false;
      let is_blocks = false;
      context.lines.push("");
      //console.log(context.lines.join("\r\n"));
      for(let i=0; i<context.lines.length; i++) {
        let line = (context.lines[i]).replace(/(^\s*)|(\s*$)/g, "");
        //List
        if(line.match(/^[-*][ 　].+$/)){
          if(!is_list){
            if(is_blocks){
              ret.push(idt + "</dl>");
            }
            is_blocks = false;
            ret.push(idt + '<ul class="md-listview">');
          }
          is_list = true;
        }
        else {
          if(is_list){
            ret.push(idt + "</ul>");
          }
          is_list = false;
        }
        //Quote
        if(line.replace("&gt;",">").match(/^>[ 　].+$/)){
          if(!is_blocks){
            if(is_list){
              ret.push(idt + "</ul>");
            }
            is_list = false;
            ret.push(idt + '<dl class="md-blocks">');
          }
          is_blocks = true;
        }
        else {
          if(is_blocks){
            ret.push(idt + "</dl>");
          }
          is_blocks = false;
        }
        if(line){
          for(let rr=0; rr<this.items.length; rr++){
            let reg = this.items[rr];
            if(!reg) continue;
            line = reg.execute(line, context.cache);
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
      let text = ret.join("\r\n");
      for(let i=0; i<context.cache.length; i++){
        let v = context.cache[i];
        text = text.replace("<!--%" + v.id + "%-->", v.value);
        text = text.replace("<!--#" + v.id + "#-->", v.value);
      }
      return text;
    }
  };
  Woo.Marked = Object.freeze({
    version: marked.version,
    build(text, indent){ return marked.build(text, indent) }
  });
})(Woo);
export default Object.freeze({
  build(text, indent) {
    return Woo.Marked.build(text, indent);
  }
});
export const Marked = Woo.Marked;