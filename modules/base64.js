const Woo = {};
((Woo)=>{
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
  Woo.Base64 = Object.freeze(Base64());
})(Woo);
export default Object.freeze(Woo.Base64);
export const base64 = Woo.Base64;