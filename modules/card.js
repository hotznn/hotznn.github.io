const Woo = {};
((Woo)=>{
  const SCHEME = "woo";
  const encoder = {
    url: window.encodeURIComponent
  };
  const Card = (()=>{
    const RE = /^woo:\/\/(mod|ext|err)\/([.a-zA-Z0-9_-]+)\/([.a-zA-Z0-9_-]+)\/([.a-zA-Z0-9_-]+)?(\?[^#]*)?$/;
    return {
      /**
       * Return true if the url matches the card scheme.
       * @param {string} url
       * @returns {boolean}
       */
      match(url){
        return !!url?.match(RE);
      },
      /**
       * Given a url, returns an object with the following properties:
       * - scheme: string; "woo"
       * - method: string; "mod", "ext", or "err"
       * - name: string; module or extension name
       * - action: string; action name
       * - rowid: string; optional rowid
       * - nvs: object; additional name-value pairs
       * @param {string} url
       * @returns {object}
       */
      data(url){
        const [_, method, name, action, rowid, search] = url?.match(RE) ?? ["","unknown","","","",""];
        const nvs = Object.fromEntries(new URLSearchParams(search || '').entries());
        return { scheme: SCHEME, method, name, action, rowid, nvs };
      },
      /**
       * Build a card url with the given method, name, action, rowid and search.
       * @param {string} method - "mod", "ext", or "err"
       * @param {string} name - module or extension name
       * @param {string} action - action name
       * @param {string} [rowid] - optional rowid
       * @param {string} [search] - optional search string
       * @returns {string} - the built card url
       */
      build(method, name, action, rowid, search){
        return `${SCHEME}://${method}/${name}/${action}${rowid ? "/"+rowid : ""}${search? "?"+search : ""}`;
      },
      mod(name, action, rowid, search){
        return `${SCHEME}://mod/${name}/${action}${rowid ? "/"+rowid : ""}${search? "?"+search : ""}`;
      },
      verse(){

      },
      website(title, url){
        return `${SCHEME}://ext/website/share/view.do?title=${encoder.url(title)}&url=${encoder.url(url)}`
      }
    }
  });
  Woo.Card = Object.freeze(Card());
})(Woo);
export default Woo.Card;
export const Card = Woo.Card;