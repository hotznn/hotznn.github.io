const Woo = {};
((Woo)=>{
  const INDENT = "\u3000\u3000";
  const hot = {
    uuid(){
      let rowid = [];
      for (let i = 0; i < 40; i++) {
        rowid.push(Math.floor(Math.random() * 10));
      }
      return rowid.join("");
    },
    ns(name){
      return { name: name, items: [] }
    }
  };
  const Base64 = ()=>{
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    return {
      encode(text){
        const x = encoder.encode(text);
        const s = Array.from(x).map(byte=>String.fromCharCode(byte)).join('');
        return btoa(s);
      },
      decode(data){
        const s = atob(data.replace(/\s/g,""));
        const x = Uint8Array.from(s, char => char.charCodeAt(0));
        return decoder.decode(x);
      },
      url:{
        encode(text){
          const x = encoder.encode(text);
          const s = Array.from(x).map(byte=>String.fromCharCode(byte)).join('');
          return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        },
        decode(data){
          data = data.replace(/-/g, '+').replace(/_/g, '/');
          while (data.length % 4) {
            data += '=';
          }
          const s = atob(data.replace(/\s/g,""));
          const x = Uint8Array.from(s, char => char.charCodeAt(0));
          return decoder.decode(x);
        }
      }
    }
  };
  const Article = ()=>{
    return {
      clean(v) {
        let ret = (v || "").replace(/#/g, "＃");
        ret = ret.replace(/\*/g, "＊");
        ret = ret.replace(/\_/g, "＿");
        ret = ret.replace(/</g, "〈");
        ret = ret.replace(/>/g, "〉");
        return ret.trim();
      },
      blanks(text) {
        const enc = '(?:[\\x21-\\x7E]|\\p{Emoji})';
        const cnc = '[\u4E00-\u9FFF\u3000-\u303F\uFF01-\uFF60]';
        text = text.replace(
          new RegExp(`([^\\r\\x21-\\x7E\\n]) +(${cnc})`, 'g'),
          '$1$2'
        );
        text = text.replace(
          new RegExp(`(${cnc}) +([^\\r\\x21-\\x7E\\n])`, 'g'),
          '$1$2'
        );
        text = text.replace(
          new RegExp(`(${enc})(${cnc})`, 'gu'),
          '$1 $2'
        );
        text = text.replace(
          new RegExp(`(${cnc})(${enc})`, 'gu'),
          '$1 $2'
        );
        return text;
      },
      title(text){
        let regex = /^(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/;
        let ret = "";
        let min = 7;
        let l1 = "";
        let lines = hot.ns("lines");
        lines.items = (text||"").replace(/\r/g,"").split("\n");
        for(let i=0; i<lines.items.length; i++){
          let line = (lines.items[i]||"").replace(/(^\s*)|(\s*$)/g, "");
          l1 = l1 || line.trim();
          let mcs = line.match(regex);
          if(mcs){
            let len = (mcs[1]).length;
            if(len<min){
              ret = mcs[2];
              min = len;
            }
          }
        }
        ret = ret.replace(/</g,"&lt;").replace(/>/g, "&gt;");
        if(!ret){
          const match = l1.match(/[^,.!?，。！？\n]+/);
          ret = match ? match[0].trim() : l1.slice(0, 72).trim();
        }
        return ret || "无题";
      },
      build(text) {
        const list = hot.ns("list");
        list.items = this.blanks(text || "").replace(/\r/g, "").split("\n");
        let ret = [];
        for (let i = 0; i < list.items.length; i++) {
          let row = list.items[i].trim();
          if (row) {
            ret.push("　　" + row.replace(/\s{2,}/g, ' '));
          }
        }
        if(!!(ret[0]).trim()){
          ret.unshift("");
        }
        if((ret[ret.length-1]).trim()!=""){
          ret.push("");
        }
        return ret.join("\r\n");
      }
    }
  };
  const article = Article();
  const base64 = Base64();
  const EditorActions = ()=>{
    return {
      editor: {
        name:"editor",
        actions:[
          {
            id:"0",
            name:"首行缩进",
            action(text){
              const list = hot.ns("list");
              list.items = text.replace(/\r/g, "").split("\n");
              for(let i=0; i<list.items.length; i++){
                let row = list.items[i].trim();
                if(row==""){
                  list.items[i] = "";
                }
                else if(row.indexOf("---")==0){
                  list.items[i] = row;
                }
                else if(row.indexOf("===")==0){
                  list.items[i] = row;
                }
                else {
                  list.items[i] = INDENT + row;
                }
              }
              return list.items.join("\r\n");
            }
          },
          {
            id:"1",
            name:"首尾空行",
            action(text){
              const list = hot.ns("list");
              list.items = text.replace(/\r/g, "").split("\n");
              if(!!(list.items[0]).trim()){
                list.items.unshift("");
              }
              if((list.items[list.items.length-1]).trim()!=""){
                list.items.push("");
              }
              return list.items.join("\r\n");
            }
          },
          {
            id:"2",
            name:"删除空行",
            action(text){
              const list = hot.ns("list");
              list.items = text.replace(/\r/g, "").split("\n");
              let ret = [];
              for(let i=0; i<list.items.length; i++){
                let v = list.items[i];
                if(v.trim()){
                  ret.push(v);
                }
              }
              return ret.join("\r\n");
            }
          },
          {
            id:"3",
            name:"清除格式",
            action(text){
              return text.replace(/[^\S\r\n]*\*{2}[^\S\r\n]*/g, " ");
            }
          },
          {
            id:"4",
            name:"自动排版",
            action(text){
              const list = hot.ns("list");
              list.items = article.blanks(text).replace(/\r/g, "").split("\n");
              for(let i=0; i<list.items.length; i++){
                let row = list.items[i].trim();
                if(row==""){
                  list.items[i] = "";
                }
                else if(row.match(/^( *[-=*_]){3,} *(\n+|$)/)){
                  list.items[i] = row;
                }
                else {
                  row = row.replace(/^\*[ ]+/,"- ");
                  list.items[i] = INDENT + row;
                }
              }
              if(!!(list.items[0]).trim()){
                list.items.unshift("");
              }
              if((list.items[list.items.length-1]).trim()!=""){
                list.items.push("");
              }
              return list.items.join("\r\n").replace(/“/g, '「').replace(/”/g,'」');
            }
          }
        ]
      },
      tools: {
        name:"tools",
        actions:[
          {
            id:0,
            name:"JSON格式化",
            action(text){
              try {
                let data = JSON.parse(text.replace(/^\u3000*/mg, ""));
                return JSON.stringify(data, null, 2);
              } catch (e) {
                return "JSON格式化失败: " + e.message + "\n" + text;
              }
            }
          },
          {
            id:1,
            name:"BASE64编码",
            action(text){
              return base64.encode(text);
            }
          },
          {
            id:2,
            name:"BASE64解码",
            action(text){
              try {
                return base64.decode(text);
              } catch (e) {
                return "BASE64解码失败: " + e.message;
              }
            }
          },
          {
            id:3,
            name:"URL编码",
            action(text){
              return encodeURIComponent(text);
            }
          },
          {
            id:4,
            name:"URL解码",
            action(text){
              try {
                return decodeURIComponent(text);
              } catch (e) {
                return "URL解码失败: " + e.message;
              }
            }
          }
        ]
      }
    }
  };
  Woo.EditorActions = EditorActions;
})(Woo);
export default Object.freeze(Woo.EditorActions());
export const Const_EditorAction = Object.freeze({
  ACTION_INDENT: 0,
  ACTION_BLANKS: 1,
  ACTION_DELETE_BLANKS: 2,
  ACTION_CLEAN: 3,
  ACTION_BUILD: 4,
});
export const Const_ToolsAction = Object.freeze({
  ACTION_JSON_FORMAT: 0,
  ACTION_BASE64_ENCODE: 1,
  ACTION_BASE64_DECODE: 2,
  ACTION_URL_ENCODE: 3,
  ACTION_URL_DECODE: 4,
});
export const editor = Object.freeze(Woo.EditorActions().editor);
export const tools = Object.freeze(Woo.EditorActions().tools);

