const Woo = {};
((Woo)=>{
  const Hot = ()=>{
    return {
      uuid(){
        let rowid = [];
        for (let i = 0; i < 40; i++) {
          rowid.push(Math.floor(Math.random() * 10));
        }
        return rowid.join("");
      },
      now(x){
        let d = new Date();
        let ret = x;
        if (!(typeof (ret) == "string"))
        {
          ret = "yyyy-mm-dd hh:nn:ss";
        }
        return ret
          .replace(/yyyy/ig, d.getFullYear())
          .replace(/mm/ig, ("00" + (d.getMonth() + 1)).slice(-2))
          .replace(/dd/ig, ("00" + d.getDate()).slice(-2))
          .replace(/hh/ig, ("00" + d.getHours()).slice(-2))
          .replace(/nn/ig, ("00" + d.getMinutes()).slice(-2))
          .replace(/ss/ig, ("00" + d.getSeconds()).slice(-2))
          .replace(/zzz/ig, ("000" + d.getMilliseconds()).slice(-3))
      },
      wait(interval){
        return (
          new Promise((resolve, reject)=> {
            setTimeout(()=>{resolve(true)}, interval);
          })
        ).catch(e=>{console.log(e)});
      },
      utc8(){
        let d = new Date();
        let zone = 28800000; //8*3600e3;
        let utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
        return new Date(utc + zone);
      },
      text: {
        encoder: {
          url(text){ return window.encodeURIComponent(text) },
          html(text){
            return (text||"").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&#34;").replace(/'/g, "&#39;");
          }
        },
        decoder: {
          url(text){ return window.decodeURIComponent(text) },
          html(text){
            return (text||"").replace(/&#34;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
          }
        }
      },
      ns(name){
        return {
          id: this.uuid(),
          name: name,
          items:[]
        }
      },
      data:{
        serialize(o){
          return JSON.stringify(o);
        },
        deserialize(s){
          try{
            return JSON.parse(s);
          }
          catch(e){
            return null;
          }
        }
      }
    }
  };
  Woo.Hot = Object.freeze(Hot);
})(Woo);
export default Object.freeze(Woo.Hot());
export const hot = Object.freeze(Woo.Hot());
export const text = Object.freeze(Woo.Hot().text);
export const data = Object.freeze(Woo.Hot().data);
