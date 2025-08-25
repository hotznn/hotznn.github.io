const SITE_ME = {
  'bimwook.com':'Bimwook',
  'omuen.com':'八月远方',
  'comuen.com':'CoMuen',
  'womuen.com':'WoMuen',
};
const SITE_NAME_MAP = {
  'x.com': '推特',
  'chatgpt.com':'ChatGPT',
  'doubao.com': '豆包',
  'youtube.com': 'YouTube',
  'google.com': 'Google',
  'facebook.com': 'Facebook',
  'twitter.com': 'Twitter',
  'weibo.com': '微博',
  'bilibili.com': '哔哩哔哩',
  "tiktok.com": "TikTok",
  "douyin.com": "抖音",
  'taobao.com': '淘宝',
  'jd.com': '京东',
  'amazon.com': 'Amazon',
  'zhihu.com': '知乎'
};

// const SITE_NAME_MAP = {
//   // 社交媒体与社区平台
//   "facebook.com": "Facebook",
//   "twitter.com": "Twitter",
//   "instagram.com": "Instagram",
//   "tiktok.com": "TikTok",
//   "snapchat.com": "Snapchat",
//   "reddit.com": "Reddit",
//   "weibo.com": "微博",
//   "zhihu.com": "知乎",
//   "douban.com": "豆瓣",
//   "discord.com": "Discord",

//   // 视频与流媒体平台
//   "youtube.com": "YouTube",
//   "bilibili.com": "哔哩哔哩",
//   "netflix.com": "Netflix",
//   "iqiyi.com": "爱奇艺",
//   "youku.com": "优酷",
//   "tencentvideo.com": "腾讯视频",
//   "vimeo.com": "Vimeo",
//   "twitch.tv": "Twitch",
//   "huya.com": "虎牙直播",
//   "douyu.com": "斗鱼直播",

//   // 电商与支付平台
//   "amazon.com": "Amazon",
//   "taobao.com": "淘宝",
//   "tmall.com": "天猫",
//   "jd.com": "京东",
//   "pinduoduo.com": "拼多多",
//   "aliexpress.com": "AliExpress",
//   "ebay.com": "eBay",
//   "paypal.com": "PayPal",
//   "stripe.com": "Stripe",
//   "shopify.com": "Shopify",

//   // 搜索引擎与门户
//   "google.com": "Google",
//   "baidu.com": "百度",
//   "bing.com": "Bing",
//   "yahoo.com": "Yahoo",
//   "duckduckgo.com": "DuckDuckGo",
//   "sogou.com": "搜狗",

//   // 新闻媒体平台
//   "cnn.com": "CNN",
//   "bbc.com": "BBC",
//   "nytimes.com": "纽约时报",
//   "theguardian.com": "卫报",
//   "reuters.com": "路透社",
//   "xinhuanet.com": "新华网",
//   "cctv.com": "央视网",
//   "163.com": "网易新闻",

//   // 学习与技术平台
//   "wikipedia.org": "Wikipedia",
//   "stackoverflow.com": "Stack Overflow",
//   "github.com": "GitHub",
//   "gitlab.com": "GitLab",
//   "csdn.net": "CSDN",
//   "juejin.cn": "掘金",
//   "leetcode.com": "LeetCode",
//   "coursera.org": "Coursera",
//   "edx.org": "edX",
//   "khanacademy.org": "可汗学院",

//   // 工具与云服务
//   "dropbox.com": "Dropbox",
//   "drive.google.com": "Google Drive",
//   "docs.google.com": "Google Docs",
//   "office.com": "Microsoft Office",
//   "wetransfer.com": "WeTransfer",
//   "canva.com": "Canva",
//   "notion.so": "Notion",
//   "figma.com": "Figma",
//   "chat.openai.com": "ChatGPT",
//   "openai.com": "OpenAI"
// };
const Woo = {
  /**
   * Get hostname from url, or return null if error.
   * If url not include protocol, use https as default.
   * @param {string} url
   * @return {string|null}
   */
  hostname(url) {
    try {
      const x = new URL(url.includes('://') ? url : 'https://' + url);
      return x.hostname;
    }
    catch(e) {
      console.log(e);
      return null;
    }
  },
  /**
   * Get domain from hostname, or return empty string if error.
   * It will return last two parts of hostname as domain.
   * For example, 'sub.example.com' will return 'example.com'.
   * @param {string} hostname
   * @return {string}
   */
  domain(hostname) {
    if (!hostname) return '';
    const xx = hostname.split('.').filter(Boolean);
    if (xx.length >= 2) {
      return xx.slice(-2).join('.');
    }
    return hostname;
  }
};

export default Object.freeze({
  /**
   * Get domain name or custom name from SITE_NAME_MAP, or return hostname if not found.
   * @param {string} url
   * @param {Object<string,string>} [meta={}] - custom name map
   * @return {string}
   */
  show(url, meta = {}) {
    const hostname = Woo.hostname(url);
    if (!hostname) return '未知';
    const domain = Woo.domain(hostname);
    const names = { ...SITE_NAME_MAP, ...meta };
    return names[domain] || domain;
  }
});