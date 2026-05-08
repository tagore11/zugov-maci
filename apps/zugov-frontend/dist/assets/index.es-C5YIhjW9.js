const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/secp256k1-DTFLwK5h.js",
      "assets/index-myL0f5cF.js",
      "assets/index-N-YbqMNG.css",
      "assets/events-DQ172AOg.js",
      "assets/core-CcnASMk0.js",
    ]),
) => i.map((i) => d[i]);
import { n as _o, p as nt, x as Td, _ as tu, o as V, t as _e, m as It } from "./index-myL0f5cF.js";
import { r as Rd } from "./events-DQ172AOg.js";
function gr(r) {
  return new Promise((e, t) => {
    ((r.oncomplete = r.onsuccess = () => e(r.result)), (r.onabort = r.onerror = () => t(r.error)));
  });
}
function ru(r, e) {
  let t;
  const i = () => {
    if (t) return t;
    const s = indexedDB.open(r);
    return (
      (s.onupgradeneeded = () => s.result.createObjectStore(e)),
      (t = gr(s)),
      t.then(
        (n) => {
          n.onclose = () => (t = void 0);
        },
        () => {},
      ),
      t
    );
  };
  return (s, n) => i().then((o) => n(o.transaction(e, s).objectStore(e)));
}
let Ks;
function Ti() {
  return (Ks || (Ks = ru("keyval-store", "keyval")), Ks);
}
function Xo(r, e = Ti()) {
  return e("readonly", (t) => gr(t.get(r)));
}
function Nd(r, e, t = Ti()) {
  return t("readwrite", (i) => (i.put(e, r), gr(i.transaction)));
}
function jd(r, e = Ti()) {
  return e("readwrite", (t) => (t.delete(r), gr(t.transaction)));
}
function Bd(r = Ti()) {
  return r("readwrite", (e) => (e.clear(), gr(e.transaction)));
}
function Ud(r, e) {
  return (
    (r.openCursor().onsuccess = function () {
      this.result && (e(this.result), this.result.continue());
    }),
    gr(r.transaction)
  );
}
function Fd(r = Ti()) {
  return r("readonly", (e) => {
    if (e.getAllKeys) return gr(e.getAllKeys());
    const t = [];
    return Ud(e, (i) => t.push(i.key)).then(() => t);
  });
}
var Ze = Rd();
const Io = _o(Ze);
var ea = function (r, e, t) {
    if (t || arguments.length === 2)
      for (var i = 0, s = e.length, n; i < s; i++)
        (n || !(i in e)) && (n || (n = Array.prototype.slice.call(e, 0, i)), (n[i] = e[i]));
    return r.concat(n || Array.prototype.slice.call(e));
  },
  kd = (function () {
    function r(e, t, i) {
      ((this.name = e), (this.version = t), (this.os = i), (this.type = "browser"));
    }
    return r;
  })(),
  Ld = (function () {
    function r(e) {
      ((this.version = e), (this.type = "node"), (this.name = "node"), (this.os = nt.platform));
    }
    return r;
  })(),
  qd = (function () {
    function r(e, t, i, s) {
      ((this.name = e), (this.version = t), (this.os = i), (this.bot = s), (this.type = "bot-device"));
    }
    return r;
  })(),
  Md = (function () {
    function r() {
      ((this.type = "bot"), (this.bot = !0), (this.name = "bot"), (this.version = null), (this.os = null));
    }
    return r;
  })(),
  zd = (function () {
    function r() {
      ((this.type = "react-native"), (this.name = "react-native"), (this.version = null), (this.os = null));
    }
    return r;
  })(),
  Hd =
    /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/,
  Vd = /(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/,
  ta = 3,
  Kd = [
    ["aol", /AOLShield\/([0-9\._]+)/],
    ["edge", /Edge\/([0-9\._]+)/],
    ["edge-ios", /EdgiOS\/([0-9\._]+)/],
    ["yandexbrowser", /YaBrowser\/([0-9\._]+)/],
    ["kakaotalk", /KAKAOTALK\s([0-9\.]+)/],
    ["samsung", /SamsungBrowser\/([0-9\.]+)/],
    ["silk", /\bSilk\/([0-9._-]+)\b/],
    ["miui", /MiuiBrowser\/([0-9\.]+)$/],
    ["beaker", /BeakerBrowser\/([0-9\.]+)/],
    ["edge-chromium", /EdgA?\/([0-9\.]+)/],
    ["chromium-webview", /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
    ["chrome", /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
    ["phantomjs", /PhantomJS\/([0-9\.]+)(:?\s|$)/],
    ["crios", /CriOS\/([0-9\.]+)(:?\s|$)/],
    ["firefox", /Firefox\/([0-9\.]+)(?:\s|$)/],
    ["fxios", /FxiOS\/([0-9\.]+)/],
    ["opera-mini", /Opera Mini.*Version\/([0-9\.]+)/],
    ["opera", /Opera\/([0-9\.]+)(?:\s|$)/],
    ["opera", /OPR\/([0-9\.]+)(:?\s|$)/],
    ["pie", /^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/],
    ["pie", /^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/],
    ["netfront", /^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/],
    ["ie", /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
    ["ie", /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
    ["ie", /MSIE\s(7\.0)/],
    ["bb10", /BB10;\sTouch.*Version\/([0-9\.]+)/],
    ["android", /Android\s([0-9\.]+)/],
    ["ios", /Version\/([0-9\._]+).*Mobile.*Safari.*/],
    ["safari", /Version\/([0-9\._]+).*Safari/],
    ["facebook", /FB[AS]V\/([0-9\.]+)/],
    ["instagram", /Instagram\s([0-9\.]+)/],
    ["ios-webview", /AppleWebKit\/([0-9\.]+).*Mobile/],
    ["ios-webview", /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
    ["curl", /^curl\/([0-9\.]+)$/],
    ["searchbot", Hd],
  ],
  ra = [
    ["iOS", /iP(hone|od|ad)/],
    ["Android OS", /Android/],
    ["BlackBerry OS", /BlackBerry|BB10/],
    ["Windows Mobile", /IEMobile/],
    ["Amazon OS", /Kindle/],
    ["Windows 3.11", /Win16/],
    ["Windows 95", /(Windows 95)|(Win95)|(Windows_95)/],
    ["Windows 98", /(Windows 98)|(Win98)/],
    ["Windows 2000", /(Windows NT 5.0)|(Windows 2000)/],
    ["Windows XP", /(Windows NT 5.1)|(Windows XP)/],
    ["Windows Server 2003", /(Windows NT 5.2)/],
    ["Windows Vista", /(Windows NT 6.0)/],
    ["Windows 7", /(Windows NT 6.1)/],
    ["Windows 8", /(Windows NT 6.2)/],
    ["Windows 8.1", /(Windows NT 6.3)/],
    ["Windows 10", /(Windows NT 10.0)/],
    ["Windows ME", /Windows ME/],
    ["Windows CE", /Windows CE|WinCE|Microsoft Pocket Internet Explorer/],
    ["Open BSD", /OpenBSD/],
    ["Sun OS", /SunOS/],
    ["Chrome OS", /CrOS/],
    ["Linux", /(Linux)|(X11)/],
    ["Mac OS", /(Mac_PowerPC)|(Macintosh)/],
    ["QNX", /QNX/],
    ["BeOS", /BeOS/],
    ["OS/2", /OS\/2/],
  ];
function Wd(r) {
  return typeof document > "u" && typeof navigator < "u" && navigator.product === "ReactNative"
    ? new zd()
    : typeof navigator < "u"
      ? Yd(navigator.userAgent)
      : Zd();
}
function Gd(r) {
  return (
    r !== "" &&
    Kd.reduce(function (e, t) {
      var i = t[0],
        s = t[1];
      if (e) return e;
      var n = s.exec(r);
      return !!n && [i, n];
    }, !1)
  );
}
function Yd(r) {
  var e = Gd(r);
  if (!e) return null;
  var t = e[0],
    i = e[1];
  if (t === "searchbot") return new Md();
  var s = i[1] && i[1].split(".").join("_").split("_").slice(0, 3);
  s ? s.length < ta && (s = ea(ea([], s, !0), Qd(ta - s.length), !0)) : (s = []);
  var n = s.join("."),
    o = Jd(r),
    a = Vd.exec(r);
  return a && a[1] ? new qd(t, n, o, a[1]) : new kd(t, n, o);
}
function Jd(r) {
  for (var e = 0, t = ra.length; e < t; e++) {
    var i = ra[e],
      s = i[0],
      n = i[1],
      o = n.exec(r);
    if (o) return s;
  }
  return null;
}
function Zd() {
  var r = typeof nt < "u" && nt.version;
  return r ? new Ld(nt.version.slice(1)) : null;
}
function Qd(r) {
  for (var e = [], t = 0; t < r; t++) e.push("0");
  return e;
}
var Ws = {};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ var jn = function (r, e) {
  return (
    (jn =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (t, i) {
          t.__proto__ = i;
        }) ||
      function (t, i) {
        for (var s in i) i.hasOwnProperty(s) && (t[s] = i[s]);
      }),
    jn(r, e)
  );
};
function Xd(r, e) {
  jn(r, e);
  function t() {
    this.constructor = r;
  }
  r.prototype = e === null ? Object.create(e) : ((t.prototype = e.prototype), new t());
}
var Bn = function () {
  return (
    (Bn =
      Object.assign ||
      function (e) {
        for (var t, i = 1, s = arguments.length; i < s; i++) {
          t = arguments[i];
          for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        }
        return e;
      }),
    Bn.apply(this, arguments)
  );
};
function ep(r, e) {
  var t = {};
  for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && e.indexOf(i) < 0 && (t[i] = r[i]);
  if (r != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, i = Object.getOwnPropertySymbols(r); s < i.length; s++)
      e.indexOf(i[s]) < 0 && Object.prototype.propertyIsEnumerable.call(r, i[s]) && (t[i[s]] = r[i[s]]);
  return t;
}
function tp(r, e, t, i) {
  var s = arguments.length,
    n = s < 3 ? e : i === null ? (i = Object.getOwnPropertyDescriptor(e, t)) : i,
    o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") n = Reflect.decorate(r, e, t, i);
  else for (var a = r.length - 1; a >= 0; a--) (o = r[a]) && (n = (s < 3 ? o(n) : s > 3 ? o(e, t, n) : o(e, t)) || n);
  return (s > 3 && n && Object.defineProperty(e, t, n), n);
}
function rp(r, e) {
  return function (t, i) {
    e(t, i, r);
  };
}
function ip(r, e) {
  if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(r, e);
}
function sp(r, e, t, i) {
  function s(n) {
    return n instanceof t
      ? n
      : new t(function (o) {
          o(n);
        });
  }
  return new (t || (t = Promise))(function (n, o) {
    function a(u) {
      try {
        h(i.next(u));
      } catch (l) {
        o(l);
      }
    }
    function c(u) {
      try {
        h(i.throw(u));
      } catch (l) {
        o(l);
      }
    }
    function h(u) {
      u.done ? n(u.value) : s(u.value).then(a, c);
    }
    h((i = i.apply(r, e || [])).next());
  });
}
function np(r, e) {
  var t = {
      label: 0,
      sent: function () {
        if (n[0] & 1) throw n[1];
        return n[1];
      },
      trys: [],
      ops: [],
    },
    i,
    s,
    n,
    o;
  return (
    (o = { next: a(0), throw: a(1), return: a(2) }),
    typeof Symbol == "function" &&
      (o[Symbol.iterator] = function () {
        return this;
      }),
    o
  );
  function a(h) {
    return function (u) {
      return c([h, u]);
    };
  }
  function c(h) {
    if (i) throw new TypeError("Generator is already executing.");
    for (; t; )
      try {
        if (
          ((i = 1),
          s &&
            (n = h[0] & 2 ? s.return : h[0] ? s.throw || ((n = s.return) && n.call(s), 0) : s.next) &&
            !(n = n.call(s, h[1])).done)
        )
          return n;
        switch (((s = 0), n && (h = [h[0] & 2, n.value]), h[0])) {
          case 0:
          case 1:
            n = h;
            break;
          case 4:
            return (t.label++, { value: h[1], done: !1 });
          case 5:
            (t.label++, (s = h[1]), (h = [0]));
            continue;
          case 7:
            ((h = t.ops.pop()), t.trys.pop());
            continue;
          default:
            if (((n = t.trys), !(n = n.length > 0 && n[n.length - 1]) && (h[0] === 6 || h[0] === 2))) {
              t = 0;
              continue;
            }
            if (h[0] === 3 && (!n || (h[1] > n[0] && h[1] < n[3]))) {
              t.label = h[1];
              break;
            }
            if (h[0] === 6 && t.label < n[1]) {
              ((t.label = n[1]), (n = h));
              break;
            }
            if (n && t.label < n[2]) {
              ((t.label = n[2]), t.ops.push(h));
              break;
            }
            (n[2] && t.ops.pop(), t.trys.pop());
            continue;
        }
        h = e.call(r, t);
      } catch (u) {
        ((h = [6, u]), (s = 0));
      } finally {
        i = n = 0;
      }
    if (h[0] & 5) throw h[1];
    return { value: h[0] ? h[1] : void 0, done: !0 };
  }
}
function op(r, e, t, i) {
  (i === void 0 && (i = t), (r[i] = e[t]));
}
function ap(r, e) {
  for (var t in r) t !== "default" && !e.hasOwnProperty(t) && (e[t] = r[t]);
}
function Un(r) {
  var e = typeof Symbol == "function" && Symbol.iterator,
    t = e && r[e],
    i = 0;
  if (t) return t.call(r);
  if (r && typeof r.length == "number")
    return {
      next: function () {
        return (r && i >= r.length && (r = void 0), { value: r && r[i++], done: !r });
      },
    };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function iu(r, e) {
  var t = typeof Symbol == "function" && r[Symbol.iterator];
  if (!t) return r;
  var i = t.call(r),
    s,
    n = [],
    o;
  try {
    for (; (e === void 0 || e-- > 0) && !(s = i.next()).done; ) n.push(s.value);
  } catch (a) {
    o = { error: a };
  } finally {
    try {
      s && !s.done && (t = i.return) && t.call(i);
    } finally {
      if (o) throw o.error;
    }
  }
  return n;
}
function cp() {
  for (var r = [], e = 0; e < arguments.length; e++) r = r.concat(iu(arguments[e]));
  return r;
}
function hp() {
  for (var r = 0, e = 0, t = arguments.length; e < t; e++) r += arguments[e].length;
  for (var i = Array(r), s = 0, e = 0; e < t; e++)
    for (var n = arguments[e], o = 0, a = n.length; o < a; o++, s++) i[s] = n[o];
  return i;
}
function Di(r) {
  return this instanceof Di ? ((this.v = r), this) : new Di(r);
}
function up(r, e, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var i = t.apply(r, e || []),
    s,
    n = [];
  return (
    (s = {}),
    o("next"),
    o("throw"),
    o("return"),
    (s[Symbol.asyncIterator] = function () {
      return this;
    }),
    s
  );
  function o(d) {
    i[d] &&
      (s[d] = function (f) {
        return new Promise(function (p, g) {
          n.push([d, f, p, g]) > 1 || a(d, f);
        });
      });
  }
  function a(d, f) {
    try {
      c(i[d](f));
    } catch (p) {
      l(n[0][3], p);
    }
  }
  function c(d) {
    d.value instanceof Di ? Promise.resolve(d.value.v).then(h, u) : l(n[0][2], d);
  }
  function h(d) {
    a("next", d);
  }
  function u(d) {
    a("throw", d);
  }
  function l(d, f) {
    (d(f), n.shift(), n.length && a(n[0][0], n[0][1]));
  }
}
function lp(r) {
  var e, t;
  return (
    (e = {}),
    i("next"),
    i("throw", function (s) {
      throw s;
    }),
    i("return"),
    (e[Symbol.iterator] = function () {
      return this;
    }),
    e
  );
  function i(s, n) {
    e[s] = r[s]
      ? function (o) {
          return (t = !t) ? { value: Di(r[s](o)), done: s === "return" } : n ? n(o) : o;
        }
      : n;
  }
}
function dp(r) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = r[Symbol.asyncIterator],
    t;
  return e
    ? e.call(r)
    : ((r = typeof Un == "function" ? Un(r) : r[Symbol.iterator]()),
      (t = {}),
      i("next"),
      i("throw"),
      i("return"),
      (t[Symbol.asyncIterator] = function () {
        return this;
      }),
      t);
  function i(n) {
    t[n] =
      r[n] &&
      function (o) {
        return new Promise(function (a, c) {
          ((o = r[n](o)), s(a, c, o.done, o.value));
        });
      };
  }
  function s(n, o, a, c) {
    Promise.resolve(c).then(function (h) {
      n({ value: h, done: a });
    }, o);
  }
}
function pp(r, e) {
  return (Object.defineProperty ? Object.defineProperty(r, "raw", { value: e }) : (r.raw = e), r);
}
function fp(r) {
  if (r && r.__esModule) return r;
  var e = {};
  if (r != null) for (var t in r) Object.hasOwnProperty.call(r, t) && (e[t] = r[t]);
  return ((e.default = r), e);
}
function gp(r) {
  return r && r.__esModule ? r : { default: r };
}
function yp(r, e) {
  if (!e.has(r)) throw new TypeError("attempted to get private field on non-instance");
  return e.get(r);
}
function mp(r, e, t) {
  if (!e.has(r)) throw new TypeError("attempted to set private field on non-instance");
  return (e.set(r, t), t);
}
const wp = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        get __assign() {
          return Bn;
        },
        __asyncDelegator: lp,
        __asyncGenerator: up,
        __asyncValues: dp,
        __await: Di,
        __awaiter: sp,
        __classPrivateFieldGet: yp,
        __classPrivateFieldSet: mp,
        __createBinding: op,
        __decorate: tp,
        __exportStar: ap,
        __extends: Xd,
        __generator: np,
        __importDefault: gp,
        __importStar: fp,
        __makeTemplateObject: pp,
        __metadata: ip,
        __param: rp,
        __read: iu,
        __rest: ep,
        __spread: cp,
        __spreadArrays: hp,
        __values: Un,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Ri = Td(wp);
var Gs = {},
  ni = {},
  ia;
function bp() {
  if (ia) return ni;
  ((ia = 1), Object.defineProperty(ni, "__esModule", { value: !0 }), (ni.delay = void 0));
  function r(e) {
    return new Promise((t) => {
      setTimeout(() => {
        t(!0);
      }, e);
    });
  }
  return ((ni.delay = r), ni);
}
var Zt = {},
  Ys = {},
  Qt = {},
  sa;
function vp() {
  return (
    sa ||
      ((sa = 1),
      Object.defineProperty(Qt, "__esModule", { value: !0 }),
      (Qt.ONE_THOUSAND = Qt.ONE_HUNDRED = void 0),
      (Qt.ONE_HUNDRED = 100),
      (Qt.ONE_THOUSAND = 1e3)),
    Qt
  );
}
var Js = {},
  na;
function Ep() {
  return (
    na ||
      ((na = 1),
      (function (r) {
        (Object.defineProperty(r, "__esModule", { value: !0 }),
          (r.ONE_YEAR =
            r.FOUR_WEEKS =
            r.THREE_WEEKS =
            r.TWO_WEEKS =
            r.ONE_WEEK =
            r.THIRTY_DAYS =
            r.SEVEN_DAYS =
            r.FIVE_DAYS =
            r.THREE_DAYS =
            r.ONE_DAY =
            r.TWENTY_FOUR_HOURS =
            r.TWELVE_HOURS =
            r.SIX_HOURS =
            r.THREE_HOURS =
            r.ONE_HOUR =
            r.SIXTY_MINUTES =
            r.THIRTY_MINUTES =
            r.TEN_MINUTES =
            r.FIVE_MINUTES =
            r.ONE_MINUTE =
            r.SIXTY_SECONDS =
            r.THIRTY_SECONDS =
            r.TEN_SECONDS =
            r.FIVE_SECONDS =
            r.ONE_SECOND =
              void 0),
          (r.ONE_SECOND = 1),
          (r.FIVE_SECONDS = 5),
          (r.TEN_SECONDS = 10),
          (r.THIRTY_SECONDS = 30),
          (r.SIXTY_SECONDS = 60),
          (r.ONE_MINUTE = r.SIXTY_SECONDS),
          (r.FIVE_MINUTES = r.ONE_MINUTE * 5),
          (r.TEN_MINUTES = r.ONE_MINUTE * 10),
          (r.THIRTY_MINUTES = r.ONE_MINUTE * 30),
          (r.SIXTY_MINUTES = r.ONE_MINUTE * 60),
          (r.ONE_HOUR = r.SIXTY_MINUTES),
          (r.THREE_HOURS = r.ONE_HOUR * 3),
          (r.SIX_HOURS = r.ONE_HOUR * 6),
          (r.TWELVE_HOURS = r.ONE_HOUR * 12),
          (r.TWENTY_FOUR_HOURS = r.ONE_HOUR * 24),
          (r.ONE_DAY = r.TWENTY_FOUR_HOURS),
          (r.THREE_DAYS = r.ONE_DAY * 3),
          (r.FIVE_DAYS = r.ONE_DAY * 5),
          (r.SEVEN_DAYS = r.ONE_DAY * 7),
          (r.THIRTY_DAYS = r.ONE_DAY * 30),
          (r.ONE_WEEK = r.SEVEN_DAYS),
          (r.TWO_WEEKS = r.ONE_WEEK * 2),
          (r.THREE_WEEKS = r.ONE_WEEK * 3),
          (r.FOUR_WEEKS = r.ONE_WEEK * 4),
          (r.ONE_YEAR = r.ONE_DAY * 365));
      })(Js)),
    Js
  );
}
var oa;
function su() {
  return (
    oa ||
      ((oa = 1),
      (function (r) {
        Object.defineProperty(r, "__esModule", { value: !0 });
        const e = Ri;
        (e.__exportStar(vp(), r), e.__exportStar(Ep(), r));
      })(Ys)),
    Ys
  );
}
var aa;
function _p() {
  if (aa) return Zt;
  ((aa = 1), Object.defineProperty(Zt, "__esModule", { value: !0 }), (Zt.fromMiliseconds = Zt.toMiliseconds = void 0));
  const r = su();
  function e(i) {
    return i * r.ONE_THOUSAND;
  }
  Zt.toMiliseconds = e;
  function t(i) {
    return Math.floor(i / r.ONE_THOUSAND);
  }
  return ((Zt.fromMiliseconds = t), Zt);
}
var ca;
function Ip() {
  return (
    ca ||
      ((ca = 1),
      (function (r) {
        Object.defineProperty(r, "__esModule", { value: !0 });
        const e = Ri;
        (e.__exportStar(bp(), r), e.__exportStar(_p(), r));
      })(Gs)),
    Gs
  );
}
var Er = {},
  ha;
function $p() {
  if (ha) return Er;
  ((ha = 1), Object.defineProperty(Er, "__esModule", { value: !0 }), (Er.Watch = void 0));
  class r {
    constructor() {
      this.timestamps = new Map();
    }
    start(t) {
      if (this.timestamps.has(t)) throw new Error(`Watch already started for label: ${t}`);
      this.timestamps.set(t, { started: Date.now() });
    }
    stop(t) {
      const i = this.get(t);
      if (typeof i.elapsed < "u") throw new Error(`Watch already stopped for label: ${t}`);
      const s = Date.now() - i.started;
      this.timestamps.set(t, { started: i.started, elapsed: s });
    }
    get(t) {
      const i = this.timestamps.get(t);
      if (typeof i > "u") throw new Error(`No timestamp found for label: ${t}`);
      return i;
    }
    elapsed(t) {
      const i = this.get(t);
      return i.elapsed || Date.now() - i.started;
    }
  }
  return ((Er.Watch = r), (Er.default = r), Er);
}
var Zs = {},
  oi = {},
  ua;
function Dp() {
  if (ua) return oi;
  ((ua = 1), Object.defineProperty(oi, "__esModule", { value: !0 }), (oi.IWatch = void 0));
  class r {}
  return ((oi.IWatch = r), oi);
}
var la;
function Sp() {
  return (
    la ||
      ((la = 1),
      (function (r) {
        (Object.defineProperty(r, "__esModule", { value: !0 }), Ri.__exportStar(Dp(), r));
      })(Zs)),
    Zs
  );
}
var da;
function Op() {
  return (
    da ||
      ((da = 1),
      (function (r) {
        Object.defineProperty(r, "__esModule", { value: !0 });
        const e = Ri;
        (e.__exportStar(Ip(), r), e.__exportStar($p(), r), e.__exportStar(Sp(), r), e.__exportStar(su(), r));
      })(Ws)),
    Ws
  );
}
var U = Op(),
  ie = {},
  pa;
function nu() {
  if (pa) return ie;
  ((pa = 1),
    Object.defineProperty(ie, "__esModule", { value: !0 }),
    (ie.getLocalStorage =
      ie.getLocalStorageOrThrow =
      ie.getCrypto =
      ie.getCryptoOrThrow =
      ie.getLocation =
      ie.getLocationOrThrow =
      ie.getNavigator =
      ie.getNavigatorOrThrow =
      ie.getDocument =
      ie.getDocumentOrThrow =
      ie.getFromWindowOrThrow =
      ie.getFromWindow =
        void 0));
  function r(d) {
    let f;
    return (typeof window < "u" && typeof window[d] < "u" && (f = window[d]), f);
  }
  ie.getFromWindow = r;
  function e(d) {
    const f = r(d);
    if (!f) throw new Error(`${d} is not defined in Window`);
    return f;
  }
  ie.getFromWindowOrThrow = e;
  function t() {
    return e("document");
  }
  ie.getDocumentOrThrow = t;
  function i() {
    return r("document");
  }
  ie.getDocument = i;
  function s() {
    return e("navigator");
  }
  ie.getNavigatorOrThrow = s;
  function n() {
    return r("navigator");
  }
  ie.getNavigator = n;
  function o() {
    return e("location");
  }
  ie.getLocationOrThrow = o;
  function a() {
    return r("location");
  }
  ie.getLocation = a;
  function c() {
    return e("crypto");
  }
  ie.getCryptoOrThrow = c;
  function h() {
    return r("crypto");
  }
  ie.getCrypto = h;
  function u() {
    return e("localStorage");
  }
  ie.getLocalStorageOrThrow = u;
  function l() {
    return r("localStorage");
  }
  return ((ie.getLocalStorage = l), ie);
}
var Ft = nu(),
  ai = {},
  fa;
function Pp() {
  if (fa) return ai;
  ((fa = 1), Object.defineProperty(ai, "__esModule", { value: !0 }), (ai.getWindowMetadata = void 0));
  const r = nu();
  function e() {
    let t, i;
    try {
      ((t = r.getDocumentOrThrow()), (i = r.getLocationOrThrow()));
    } catch {
      return null;
    }
    function s() {
      const f = t.getElementsByTagName("link"),
        p = [];
      for (let g = 0; g < f.length; g++) {
        const w = f[g],
          E = w.getAttribute("rel");
        if (E && E.toLowerCase().indexOf("icon") > -1) {
          const b = w.getAttribute("href");
          if (b)
            if (
              b.toLowerCase().indexOf("https:") === -1 &&
              b.toLowerCase().indexOf("http:") === -1 &&
              b.indexOf("//") !== 0
            ) {
              let _ = i.protocol + "//" + i.host;
              if (b.indexOf("/") === 0) _ += b;
              else {
                const A = i.pathname.split("/");
                A.pop();
                const T = A.join("/");
                _ += T + "/" + b;
              }
              p.push(_);
            } else if (b.indexOf("//") === 0) {
              const _ = i.protocol + b;
              p.push(_);
            } else p.push(b);
        }
      }
      return p;
    }
    function n(...f) {
      const p = t.getElementsByTagName("meta");
      for (let g = 0; g < p.length; g++) {
        const w = p[g],
          E = ["itemprop", "property", "name"].map((b) => w.getAttribute(b)).filter((b) => (b ? f.includes(b) : !1));
        if (E.length && E) {
          const b = w.getAttribute("content");
          if (b) return b;
        }
      }
      return "";
    }
    function o() {
      let f = n("name", "og:site_name", "og:title", "twitter:title");
      return (f || (f = t.title), f);
    }
    function a() {
      return n("description", "og:description", "twitter:description", "keywords");
    }
    const c = o(),
      h = a(),
      u = i.origin,
      l = s();
    return { description: h, url: u, icons: l, name: c };
  }
  return ((ai.getWindowMetadata = e), ai);
}
var Ap = Pp();
function Si(r, { strict: e = !0 } = {}) {
  return !r || typeof r != "string" ? !1 : e ? /^0x[0-9a-fA-F]*$/.test(r) : r.startsWith("0x");
}
function ga(r) {
  return Si(r, { strict: !1 }) ? Math.ceil((r.length - 2) / 2) : r.length;
}
const ou = "2.23.2";
let ci = {
  getDocsUrl: ({ docsBaseUrl: r, docsPath: e = "", docsSlug: t }) =>
    e ? `${r ?? "https://viem.sh"}${e}${t ? `#${t}` : ""}` : void 0,
  version: `viem@${ou}`,
};
class ur extends Error {
  constructor(e, t = {}) {
    var a;
    const i = (() => {
        var c;
        return t.cause instanceof ur
          ? t.cause.details
          : (c = t.cause) != null && c.message
            ? t.cause.message
            : t.details;
      })(),
      s = (t.cause instanceof ur && t.cause.docsPath) || t.docsPath,
      n = (a = ci.getDocsUrl) == null ? void 0 : a.call(ci, { ...t, docsPath: s }),
      o = [
        e || "An error occurred.",
        "",
        ...(t.metaMessages ? [...t.metaMessages, ""] : []),
        ...(n ? [`Docs: ${n}`] : []),
        ...(i ? [`Details: ${i}`] : []),
        ...(ci.version ? [`Version: ${ci.version}`] : []),
      ].join(`
`);
    (super(o, t.cause ? { cause: t.cause } : void 0),
      Object.defineProperty(this, "details", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
      Object.defineProperty(this, "docsPath", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
      Object.defineProperty(this, "metaMessages", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
      Object.defineProperty(this, "shortMessage", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
      Object.defineProperty(this, "version", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
      Object.defineProperty(this, "name", { enumerable: !0, configurable: !0, writable: !0, value: "BaseError" }),
      (this.details = i),
      (this.docsPath = s),
      (this.metaMessages = t.metaMessages),
      (this.name = t.name ?? this.name),
      (this.shortMessage = e),
      (this.version = ou));
  }
  walk(e) {
    return au(this, e);
  }
}
function au(r, e) {
  return e != null && e(r)
    ? r
    : r && typeof r == "object" && "cause" in r && r.cause !== void 0
      ? au(r.cause, e)
      : e
        ? null
        : r;
}
class cu extends ur {
  constructor({ size: e, targetSize: t, type: i }) {
    super(`${i.charAt(0).toUpperCase()}${i.slice(1).toLowerCase()} size (${e}) exceeds padding size (${t}).`, {
      name: "SizeExceedsPaddingSizeError",
    });
  }
}
function Qr(r, { dir: e, size: t = 32 } = {}) {
  return typeof r == "string" ? xp(r, { dir: e, size: t }) : Cp(r, { dir: e, size: t });
}
function xp(r, { dir: e, size: t = 32 } = {}) {
  if (t === null) return r;
  const i = r.replace("0x", "");
  if (i.length > t * 2) throw new cu({ size: Math.ceil(i.length / 2), targetSize: t, type: "hex" });
  return `0x${i[e === "right" ? "padEnd" : "padStart"](t * 2, "0")}`;
}
function Cp(r, { dir: e, size: t = 32 } = {}) {
  if (t === null) return r;
  if (r.length > t) throw new cu({ size: r.length, targetSize: t, type: "bytes" });
  const i = new Uint8Array(t);
  for (let s = 0; s < t; s++) {
    const n = e === "right";
    i[n ? s : t - s - 1] = r[n ? s : r.length - s - 1];
  }
  return i;
}
class Tp extends ur {
  constructor({ max: e, min: t, signed: i, size: s, value: n }) {
    super(
      `Number "${n}" is not in safe ${s ? `${s * 8}-bit ${i ? "signed" : "unsigned"} ` : ""}integer range ${e ? `(${t} to ${e})` : `(above ${t})`}`,
      { name: "IntegerOutOfRangeError" },
    );
  }
}
class Rp extends ur {
  constructor({ givenSize: e, maxSize: t }) {
    super(`Size cannot exceed ${t} bytes. Given size: ${e} bytes.`, { name: "SizeOverflowError" });
  }
}
function Xr(r, { size: e }) {
  if (ga(r) > e) throw new Rp({ givenSize: ga(r), maxSize: e });
}
function Fn(r, e = {}) {
  const { signed: t } = e;
  e.size && Xr(r, { size: e.size });
  const i = BigInt(r);
  if (!t) return i;
  const s = (r.length - 2) / 2,
    n = (1n << (BigInt(s) * 8n - 1n)) - 1n;
  return i <= n ? i : i - BigInt(`0x${"f".padStart(s * 2, "f")}`) - 1n;
}
function Np(r, e = {}) {
  return Number(Fn(r, e));
}
const jp = Array.from({ length: 256 }, (r, e) => e.toString(16).padStart(2, "0"));
function kn(r, e = {}) {
  return typeof r == "number" || typeof r == "bigint"
    ? uu(r, e)
    : typeof r == "string"
      ? Fp(r, e)
      : typeof r == "boolean"
        ? Bp(r, e)
        : hu(r, e);
}
function Bp(r, e = {}) {
  const t = `0x${Number(r)}`;
  return typeof e.size == "number" ? (Xr(t, { size: e.size }), Qr(t, { size: e.size })) : t;
}
function hu(r, e = {}) {
  let t = "";
  for (let s = 0; s < r.length; s++) t += jp[r[s]];
  const i = `0x${t}`;
  return typeof e.size == "number" ? (Xr(i, { size: e.size }), Qr(i, { dir: "right", size: e.size })) : i;
}
function uu(r, e = {}) {
  const { signed: t, size: i } = e,
    s = BigInt(r);
  let n;
  i
    ? t
      ? (n = (1n << (BigInt(i) * 8n - 1n)) - 1n)
      : (n = 2n ** (BigInt(i) * 8n) - 1n)
    : typeof r == "number" && (n = BigInt(Number.MAX_SAFE_INTEGER));
  const o = typeof n == "bigint" && t ? -n - 1n : 0;
  if ((n && s > n) || s < o) {
    const c = typeof r == "bigint" ? "n" : "";
    throw new Tp({ max: n ? `${n}${c}` : void 0, min: `${o}${c}`, signed: t, size: i, value: `${r}${c}` });
  }
  const a = `0x${(t && s < 0 ? (1n << BigInt(i * 8)) + BigInt(s) : s).toString(16)}`;
  return i ? Qr(a, { size: i }) : a;
}
const Up = new TextEncoder();
function Fp(r, e = {}) {
  const t = Up.encode(r);
  return hu(t, e);
}
const kp = new TextEncoder();
function Lp(r, e = {}) {
  return typeof r == "number" || typeof r == "bigint"
    ? Mp(r, e)
    : typeof r == "boolean"
      ? qp(r, e)
      : Si(r)
        ? lu(r, e)
        : du(r, e);
}
function qp(r, e = {}) {
  const t = new Uint8Array(1);
  return ((t[0] = Number(r)), typeof e.size == "number" ? (Xr(t, { size: e.size }), Qr(t, { size: e.size })) : t);
}
const Ot = { zero: 48, nine: 57, A: 65, F: 70, a: 97, f: 102 };
function ya(r) {
  if (r >= Ot.zero && r <= Ot.nine) return r - Ot.zero;
  if (r >= Ot.A && r <= Ot.F) return r - (Ot.A - 10);
  if (r >= Ot.a && r <= Ot.f) return r - (Ot.a - 10);
}
function lu(r, e = {}) {
  let t = r;
  e.size && (Xr(t, { size: e.size }), (t = Qr(t, { dir: "right", size: e.size })));
  let i = t.slice(2);
  i.length % 2 && (i = `0${i}`);
  const s = i.length / 2,
    n = new Uint8Array(s);
  for (let o = 0, a = 0; o < s; o++) {
    const c = ya(i.charCodeAt(a++)),
      h = ya(i.charCodeAt(a++));
    if (c === void 0 || h === void 0) throw new ur(`Invalid byte sequence ("${i[a - 2]}${i[a - 1]}" in "${i}").`);
    n[o] = c * 16 + h;
  }
  return n;
}
function Mp(r, e) {
  const t = uu(r, e);
  return lu(t);
}
function du(r, e = {}) {
  const t = kp.encode(r);
  return typeof e.size == "number" ? (Xr(t, { size: e.size }), Qr(t, { dir: "right", size: e.size })) : t;
}
function gs(r) {
  if (!Number.isSafeInteger(r) || r < 0) throw new Error("positive integer expected, got " + r);
}
function zp(r) {
  return r instanceof Uint8Array || (ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array");
}
function Os(r, ...e) {
  if (!zp(r)) throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(r.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + r.length);
}
function QS(r) {
  if (typeof r != "function" || typeof r.create != "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  (gs(r.outputLen), gs(r.blockLen));
}
function ma(r, e = !0) {
  if (r.destroyed) throw new Error("Hash instance has been destroyed");
  if (e && r.finished) throw new Error("Hash#digest() has already been called");
}
function Hp(r, e) {
  Os(r);
  const t = e.outputLen;
  if (r.length < t) throw new Error("digestInto() expects output buffer of length at least " + t);
}
const Vi = BigInt(2 ** 32 - 1),
  wa = BigInt(32);
function Vp(r, e = !1) {
  return e
    ? { h: Number(r & Vi), l: Number((r >> wa) & Vi) }
    : { h: Number((r >> wa) & Vi) | 0, l: Number(r & Vi) | 0 };
}
function Kp(r, e = !1) {
  let t = new Uint32Array(r.length),
    i = new Uint32Array(r.length);
  for (let s = 0; s < r.length; s++) {
    const { h: n, l: o } = Vp(r[s], e);
    [t[s], i[s]] = [n, o];
  }
  return [t, i];
}
const Wp = (r, e, t) => (r << t) | (e >>> (32 - t)),
  Gp = (r, e, t) => (e << t) | (r >>> (32 - t)),
  Yp = (r, e, t) => (e << (t - 32)) | (r >>> (64 - t)),
  Jp = (r, e, t) => (r << (t - 32)) | (e >>> (64 - t)),
  _r = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ function Zp(r) {
  return new Uint32Array(r.buffer, r.byteOffset, Math.floor(r.byteLength / 4));
}
function XS(r) {
  return new DataView(r.buffer, r.byteOffset, r.byteLength);
}
function eO(r, e) {
  return (r << (32 - e)) | (r >>> e);
}
const ba = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function Qp(r) {
  return ((r << 24) & 4278190080) | ((r << 8) & 16711680) | ((r >>> 8) & 65280) | ((r >>> 24) & 255);
}
function va(r) {
  for (let e = 0; e < r.length; e++) r[e] = Qp(r[e]);
}
function Xp(r) {
  if (typeof r != "string") throw new Error("utf8ToBytes expected string, got " + typeof r);
  return new Uint8Array(new TextEncoder().encode(r));
}
function pu(r) {
  return (typeof r == "string" && (r = Xp(r)), Os(r), r);
}
function tO(...r) {
  let e = 0;
  for (let i = 0; i < r.length; i++) {
    const s = r[i];
    (Os(s), (e += s.length));
  }
  const t = new Uint8Array(e);
  for (let i = 0, s = 0; i < r.length; i++) {
    const n = r[i];
    (t.set(n, s), (s += n.length));
  }
  return t;
}
class ef {
  clone() {
    return this._cloneInto();
  }
}
function tf(r) {
  const e = (i) => r().update(pu(i)).digest(),
    t = r();
  return ((e.outputLen = t.outputLen), (e.blockLen = t.blockLen), (e.create = () => r()), e);
}
function rO(r = 32) {
  if (_r && typeof _r.getRandomValues == "function") return _r.getRandomValues(new Uint8Array(r));
  if (_r && typeof _r.randomBytes == "function") return _r.randomBytes(r);
  throw new Error("crypto.getRandomValues must be defined");
}
const fu = [],
  gu = [],
  yu = [],
  rf = BigInt(0),
  hi = BigInt(1),
  sf = BigInt(2),
  nf = BigInt(7),
  of = BigInt(256),
  af = BigInt(113);
for (let r = 0, e = hi, t = 1, i = 0; r < 24; r++) {
  (([t, i] = [i, (2 * t + 3 * i) % 5]), fu.push(2 * (5 * i + t)), gu.push((((r + 1) * (r + 2)) / 2) % 64));
  let s = rf;
  for (let n = 0; n < 7; n++)
    ((e = ((e << hi) ^ ((e >> nf) * af)) % of), e & sf && (s ^= hi << ((hi << BigInt(n)) - hi)));
  yu.push(s);
}
const [cf, hf] = Kp(yu, !0),
  Ea = (r, e, t) => (t > 32 ? Yp(r, e, t) : Wp(r, e, t)),
  _a = (r, e, t) => (t > 32 ? Jp(r, e, t) : Gp(r, e, t));
function uf(r, e = 24) {
  const t = new Uint32Array(10);
  for (let i = 24 - e; i < 24; i++) {
    for (let o = 0; o < 10; o++) t[o] = r[o] ^ r[o + 10] ^ r[o + 20] ^ r[o + 30] ^ r[o + 40];
    for (let o = 0; o < 10; o += 2) {
      const a = (o + 8) % 10,
        c = (o + 2) % 10,
        h = t[c],
        u = t[c + 1],
        l = Ea(h, u, 1) ^ t[a],
        d = _a(h, u, 1) ^ t[a + 1];
      for (let f = 0; f < 50; f += 10) ((r[o + f] ^= l), (r[o + f + 1] ^= d));
    }
    let s = r[2],
      n = r[3];
    for (let o = 0; o < 24; o++) {
      const a = gu[o],
        c = Ea(s, n, a),
        h = _a(s, n, a),
        u = fu[o];
      ((s = r[u]), (n = r[u + 1]), (r[u] = c), (r[u + 1] = h));
    }
    for (let o = 0; o < 50; o += 10) {
      for (let a = 0; a < 10; a++) t[a] = r[o + a];
      for (let a = 0; a < 10; a++) r[o + a] ^= ~t[(a + 2) % 10] & t[(a + 4) % 10];
    }
    ((r[0] ^= cf[i]), (r[1] ^= hf[i]));
  }
  t.fill(0);
}
class $o extends ef {
  constructor(e, t, i, s = !1, n = 24) {
    if (
      (super(),
      (this.blockLen = e),
      (this.suffix = t),
      (this.outputLen = i),
      (this.enableXOF = s),
      (this.rounds = n),
      (this.pos = 0),
      (this.posOut = 0),
      (this.finished = !1),
      (this.destroyed = !1),
      gs(i),
      0 >= this.blockLen || this.blockLen >= 200)
    )
      throw new Error("Sha3 supports only keccak-f1600 function");
    ((this.state = new Uint8Array(200)), (this.state32 = Zp(this.state)));
  }
  keccak() {
    (ba || va(this.state32), uf(this.state32, this.rounds), ba || va(this.state32), (this.posOut = 0), (this.pos = 0));
  }
  update(e) {
    ma(this);
    const { blockLen: t, state: i } = this;
    e = pu(e);
    const s = e.length;
    for (let n = 0; n < s; ) {
      const o = Math.min(t - this.pos, s - n);
      for (let a = 0; a < o; a++) i[this.pos++] ^= e[n++];
      this.pos === t && this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished) return;
    this.finished = !0;
    const { state: e, suffix: t, pos: i, blockLen: s } = this;
    ((e[i] ^= t), (t & 128) !== 0 && i === s - 1 && this.keccak(), (e[s - 1] ^= 128), this.keccak());
  }
  writeInto(e) {
    (ma(this, !1), Os(e), this.finish());
    const t = this.state,
      { blockLen: i } = this;
    for (let s = 0, n = e.length; s < n; ) {
      this.posOut >= i && this.keccak();
      const o = Math.min(i - this.posOut, n - s);
      (e.set(t.subarray(this.posOut, this.posOut + o), s), (this.posOut += o), (s += o));
    }
    return e;
  }
  xofInto(e) {
    if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
    return this.writeInto(e);
  }
  xof(e) {
    return (gs(e), this.xofInto(new Uint8Array(e)));
  }
  digestInto(e) {
    if ((Hp(e, this), this.finished)) throw new Error("digest() was already called");
    return (this.writeInto(e), this.destroy(), e);
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    ((this.destroyed = !0), this.state.fill(0));
  }
  _cloneInto(e) {
    const { blockLen: t, suffix: i, outputLen: s, rounds: n, enableXOF: o } = this;
    return (
      e || (e = new $o(t, i, s, o, n)),
      e.state32.set(this.state32),
      (e.pos = this.pos),
      (e.posOut = this.posOut),
      (e.finished = this.finished),
      (e.rounds = n),
      (e.suffix = i),
      (e.outputLen = s),
      (e.enableXOF = o),
      (e.destroyed = this.destroyed),
      e
    );
  }
}
const lf = (r, e, t) => tf(() => new $o(e, r, t)),
  df = lf(1, 136, 256 / 8);
function mu(r, e) {
  const t = e || "hex",
    i = df(Si(r, { strict: !1 }) ? Lp(r) : r);
  return t === "bytes" ? i : kn(i);
}
class pf extends Map {
  constructor(e) {
    (super(),
      Object.defineProperty(this, "maxSize", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
      (this.maxSize = e));
  }
  get(e) {
    const t = super.get(e);
    return (super.has(e) && t !== void 0 && (this.delete(e), super.set(e, t)), t);
  }
  set(e, t) {
    if ((super.set(e, t), this.maxSize && this.size > this.maxSize)) {
      const i = this.keys().next().value;
      i && this.delete(i);
    }
    return this;
  }
}
const Qs = new pf(8192);
function ff(r, e) {
  if (Qs.has(`${r}.${e}`)) return Qs.get(`${r}.${e}`);
  const t = r.substring(2).toLowerCase(),
    i = mu(du(t), "bytes"),
    s = t.split("");
  for (let o = 0; o < 40; o += 2)
    (i[o >> 1] >> 4 >= 8 && s[o] && (s[o] = s[o].toUpperCase()),
      (i[o >> 1] & 15) >= 8 && s[o + 1] && (s[o + 1] = s[o + 1].toUpperCase()));
  const n = `0x${s.join("")}`;
  return (Qs.set(`${r}.${e}`, n), n);
}
function gf(r) {
  const e = mu(`0x${r.substring(4)}`).substring(26);
  return ff(`0x${e}`);
}
async function yf({ hash: r, signature: e }) {
  const t = Si(r) ? r : kn(r),
    { secp256k1: i } = await tu(
      async () => {
        const { secp256k1: o } = await import("./secp256k1-DTFLwK5h.js");
        return { secp256k1: o };
      },
      __vite__mapDeps([0, 1, 2, 3]),
    );
  return `0x${(() => {
    if (typeof e == "object" && "r" in e && "s" in e) {
      const { r: h, s: u, v: l, yParity: d } = e,
        f = Number(d ?? l),
        p = Ia(f);
      return new i.Signature(Fn(h), Fn(u)).addRecoveryBit(p);
    }
    const o = Si(e) ? e : kn(e),
      a = Np(`0x${o.slice(130)}`),
      c = Ia(a);
    return i.Signature.fromCompact(o.substring(2, 130)).addRecoveryBit(c);
  })()
    .recoverPublicKey(t.substring(2))
    .toHex(!1)}`;
}
function Ia(r) {
  if (r === 0 || r === 1) return r;
  if (r === 27) return 0;
  if (r === 28) return 1;
  throw new Error("Invalid yParityOrV value");
}
async function mf({ hash: r, signature: e }) {
  return gf(await yf({ hash: r, signature: e }));
}
function wf(r) {
  if (r.length >= 255) throw new TypeError("Alphabet too long");
  const e = new Uint8Array(256);
  for (let h = 0; h < e.length; h++) e[h] = 255;
  for (let h = 0; h < r.length; h++) {
    const u = r.charAt(h),
      l = u.charCodeAt(0);
    if (e[l] !== 255) throw new TypeError(u + " is ambiguous");
    e[l] = h;
  }
  const t = r.length,
    i = r.charAt(0),
    s = Math.log(t) / Math.log(256),
    n = Math.log(256) / Math.log(t);
  function o(h) {
    if (
      (h instanceof Uint8Array ||
        (ArrayBuffer.isView(h)
          ? (h = new Uint8Array(h.buffer, h.byteOffset, h.byteLength))
          : Array.isArray(h) && (h = Uint8Array.from(h))),
      !(h instanceof Uint8Array))
    )
      throw new TypeError("Expected Uint8Array");
    if (h.length === 0) return "";
    let u = 0,
      l = 0,
      d = 0;
    const f = h.length;
    for (; d !== f && h[d] === 0; ) (d++, u++);
    const p = ((f - d) * n + 1) >>> 0,
      g = new Uint8Array(p);
    for (; d !== f; ) {
      let b = h[d],
        _ = 0;
      for (let A = p - 1; (b !== 0 || _ < l) && A !== -1; A--, _++)
        ((b += (256 * g[A]) >>> 0), (g[A] = b % t >>> 0), (b = (b / t) >>> 0));
      if (b !== 0) throw new Error("Non-zero carry");
      ((l = _), d++);
    }
    let w = p - l;
    for (; w !== p && g[w] === 0; ) w++;
    let E = i.repeat(u);
    for (; w < p; ++w) E += r.charAt(g[w]);
    return E;
  }
  function a(h) {
    if (typeof h != "string") throw new TypeError("Expected String");
    if (h.length === 0) return new Uint8Array();
    let u = 0,
      l = 0,
      d = 0;
    for (; h[u] === i; ) (l++, u++);
    const f = ((h.length - u) * s + 1) >>> 0,
      p = new Uint8Array(f);
    for (; u < h.length; ) {
      const b = h.charCodeAt(u);
      if (b > 255) return;
      let _ = e[b];
      if (_ === 255) return;
      let A = 0;
      for (let T = f - 1; (_ !== 0 || A < d) && T !== -1; T--, A++)
        ((_ += (t * p[T]) >>> 0), (p[T] = _ % 256 >>> 0), (_ = (_ / 256) >>> 0));
      if (_ !== 0) throw new Error("Non-zero carry");
      ((d = A), u++);
    }
    let g = f - d;
    for (; g !== f && p[g] === 0; ) g++;
    const w = new Uint8Array(l + (f - g));
    let E = l;
    for (; g !== f; ) w[E++] = p[g++];
    return w;
  }
  function c(h) {
    const u = a(h);
    if (u) return u;
    throw new Error("Non-base" + t + " character");
  }
  return { encode: o, decodeUnsafe: a, decode: c };
}
var bf = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const vf = wf(bf),
  Ef = (r) => JSON.stringify(r, (e, t) => (typeof t == "bigint" ? t.toString() + "n" : t)),
  _f = (r) => {
    const e =
        /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g,
      t = r.replace(e, '$1"$2n"$3');
    return JSON.parse(t, (i, s) =>
      typeof s == "string" && s.match(/^\d+n$/) ? BigInt(s.substring(0, s.length - 1)) : s,
    );
  };
function lr(r) {
  if (typeof r != "string") throw new Error(`Cannot safe json parse value of type ${typeof r}`);
  try {
    return _f(r);
  } catch {
    return r;
  }
}
function kt(r) {
  return typeof r == "string" ? r : Ef(r) || "";
}
function If(r) {
  return r instanceof Uint8Array || (ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array");
}
function wu(r, ...e) {
  if (!If(r)) throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(r.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + r.length);
}
function $a(r, e = !0) {
  if (r.destroyed) throw new Error("Hash instance has been destroyed");
  if (e && r.finished) throw new Error("Hash#digest() has already been called");
}
function $f(r, e) {
  wu(r);
  const t = e.outputLen;
  if (r.length < t) throw new Error("digestInto() expects output buffer of length at least " + t);
}
const Ir = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Xs = (r) =>
  new DataView(r.buffer, r.byteOffset, r.byteLength);
function Df(r) {
  if (typeof r != "string") throw new Error("utf8ToBytes expected string, got " + typeof r);
  return new Uint8Array(new TextEncoder().encode(r));
}
function bu(r) {
  return (typeof r == "string" && (r = Df(r)), wu(r), r);
}
let Sf = class {
  clone() {
    return this._cloneInto();
  }
};
function Of(r) {
  const e = (i) => r().update(bu(i)).digest(),
    t = r();
  return ((e.outputLen = t.outputLen), (e.blockLen = t.blockLen), (e.create = () => r()), e);
}
function vu(r = 32) {
  if (Ir && typeof Ir.getRandomValues == "function") return Ir.getRandomValues(new Uint8Array(r));
  if (Ir && typeof Ir.randomBytes == "function") return Ir.randomBytes(r);
  throw new Error("crypto.getRandomValues must be defined");
}
function Pf(r, e, t, i) {
  if (typeof r.setBigUint64 == "function") return r.setBigUint64(e, t, i);
  const s = BigInt(32),
    n = BigInt(4294967295),
    o = Number((t >> s) & n),
    a = Number(t & n),
    c = i ? 4 : 0,
    h = i ? 0 : 4;
  (r.setUint32(e + c, o, i), r.setUint32(e + h, a, i));
}
let Af = class extends Sf {
  constructor(e, t, i, s) {
    (super(),
      (this.blockLen = e),
      (this.outputLen = t),
      (this.padOffset = i),
      (this.isLE = s),
      (this.finished = !1),
      (this.length = 0),
      (this.pos = 0),
      (this.destroyed = !1),
      (this.buffer = new Uint8Array(e)),
      (this.view = Xs(this.buffer)));
  }
  update(e) {
    $a(this);
    const { view: t, buffer: i, blockLen: s } = this;
    e = bu(e);
    const n = e.length;
    for (let o = 0; o < n; ) {
      const a = Math.min(s - this.pos, n - o);
      if (a === s) {
        const c = Xs(e);
        for (; s <= n - o; o += s) this.process(c, o);
        continue;
      }
      (i.set(e.subarray(o, o + a), this.pos),
        (this.pos += a),
        (o += a),
        this.pos === s && (this.process(t, 0), (this.pos = 0)));
    }
    return ((this.length += e.length), this.roundClean(), this);
  }
  digestInto(e) {
    ($a(this), $f(e, this), (this.finished = !0));
    const { buffer: t, view: i, blockLen: s, isLE: n } = this;
    let { pos: o } = this;
    ((t[o++] = 128), this.buffer.subarray(o).fill(0), this.padOffset > s - o && (this.process(i, 0), (o = 0)));
    for (let l = o; l < s; l++) t[l] = 0;
    (Pf(i, s - 8, BigInt(this.length * 8), n), this.process(i, 0));
    const a = Xs(e),
      c = this.outputLen;
    if (c % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    const h = c / 4,
      u = this.get();
    if (h > u.length) throw new Error("_sha2: outputLen bigger than state");
    for (let l = 0; l < h; l++) a.setUint32(4 * l, u[l], n);
  }
  digest() {
    const { buffer: e, outputLen: t } = this;
    this.digestInto(e);
    const i = e.slice(0, t);
    return (this.destroy(), i);
  }
  _cloneInto(e) {
    (e || (e = new this.constructor()), e.set(...this.get()));
    const { blockLen: t, buffer: i, length: s, finished: n, destroyed: o, pos: a } = this;
    return ((e.length = s), (e.pos = a), (e.finished = n), (e.destroyed = o), s % t && e.buffer.set(i), e);
  }
};
const Ki = BigInt(2 ** 32 - 1),
  Ln = BigInt(32);
function Eu(r, e = !1) {
  return e
    ? { h: Number(r & Ki), l: Number((r >> Ln) & Ki) }
    : { h: Number((r >> Ln) & Ki) | 0, l: Number(r & Ki) | 0 };
}
function xf(r, e = !1) {
  let t = new Uint32Array(r.length),
    i = new Uint32Array(r.length);
  for (let s = 0; s < r.length; s++) {
    const { h: n, l: o } = Eu(r[s], e);
    [t[s], i[s]] = [n, o];
  }
  return [t, i];
}
const Cf = (r, e) => (BigInt(r >>> 0) << Ln) | BigInt(e >>> 0),
  Tf = (r, e, t) => r >>> t,
  Rf = (r, e, t) => (r << (32 - t)) | (e >>> t),
  Nf = (r, e, t) => (r >>> t) | (e << (32 - t)),
  jf = (r, e, t) => (r << (32 - t)) | (e >>> t),
  Bf = (r, e, t) => (r << (64 - t)) | (e >>> (t - 32)),
  Uf = (r, e, t) => (r >>> (t - 32)) | (e << (64 - t)),
  Ff = (r, e) => e,
  kf = (r, e) => r,
  Lf = (r, e, t) => (r << t) | (e >>> (32 - t)),
  qf = (r, e, t) => (e << t) | (r >>> (32 - t)),
  Mf = (r, e, t) => (e << (t - 32)) | (r >>> (64 - t)),
  zf = (r, e, t) => (r << (t - 32)) | (e >>> (64 - t));
function Hf(r, e, t, i) {
  const s = (e >>> 0) + (i >>> 0);
  return { h: (r + t + ((s / 2 ** 32) | 0)) | 0, l: s | 0 };
}
const Vf = (r, e, t) => (r >>> 0) + (e >>> 0) + (t >>> 0),
  Kf = (r, e, t, i) => (e + t + i + ((r / 2 ** 32) | 0)) | 0,
  Wf = (r, e, t, i) => (r >>> 0) + (e >>> 0) + (t >>> 0) + (i >>> 0),
  Gf = (r, e, t, i, s) => (e + t + i + s + ((r / 2 ** 32) | 0)) | 0,
  Yf = (r, e, t, i, s) => (r >>> 0) + (e >>> 0) + (t >>> 0) + (i >>> 0) + (s >>> 0),
  Jf = (r, e, t, i, s, n) => (e + t + i + s + n + ((r / 2 ** 32) | 0)) | 0,
  W = {
    fromBig: Eu,
    split: xf,
    toBig: Cf,
    shrSH: Tf,
    shrSL: Rf,
    rotrSH: Nf,
    rotrSL: jf,
    rotrBH: Bf,
    rotrBL: Uf,
    rotr32H: Ff,
    rotr32L: kf,
    rotlSH: Lf,
    rotlSL: qf,
    rotlBH: Mf,
    rotlBL: zf,
    add: Hf,
    add3L: Vf,
    add3H: Kf,
    add4L: Wf,
    add4H: Gf,
    add5H: Jf,
    add5L: Yf,
  },
  [Zf, Qf] = W.split(
    [
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817",
    ].map((r) => BigInt(r)),
  ),
  Lt = new Uint32Array(80),
  qt = new Uint32Array(80);
let Xf = class extends Af {
  constructor() {
    (super(128, 64, 16, !1),
      (this.Ah = 1779033703),
      (this.Al = -205731576),
      (this.Bh = -1150833019),
      (this.Bl = -2067093701),
      (this.Ch = 1013904242),
      (this.Cl = -23791573),
      (this.Dh = -1521486534),
      (this.Dl = 1595750129),
      (this.Eh = 1359893119),
      (this.El = -1377402159),
      (this.Fh = -1694144372),
      (this.Fl = 725511199),
      (this.Gh = 528734635),
      (this.Gl = -79577749),
      (this.Hh = 1541459225),
      (this.Hl = 327033209));
  }
  get() {
    const {
      Ah: e,
      Al: t,
      Bh: i,
      Bl: s,
      Ch: n,
      Cl: o,
      Dh: a,
      Dl: c,
      Eh: h,
      El: u,
      Fh: l,
      Fl: d,
      Gh: f,
      Gl: p,
      Hh: g,
      Hl: w,
    } = this;
    return [e, t, i, s, n, o, a, c, h, u, l, d, f, p, g, w];
  }
  set(e, t, i, s, n, o, a, c, h, u, l, d, f, p, g, w) {
    ((this.Ah = e | 0),
      (this.Al = t | 0),
      (this.Bh = i | 0),
      (this.Bl = s | 0),
      (this.Ch = n | 0),
      (this.Cl = o | 0),
      (this.Dh = a | 0),
      (this.Dl = c | 0),
      (this.Eh = h | 0),
      (this.El = u | 0),
      (this.Fh = l | 0),
      (this.Fl = d | 0),
      (this.Gh = f | 0),
      (this.Gl = p | 0),
      (this.Hh = g | 0),
      (this.Hl = w | 0));
  }
  process(e, t) {
    for (let _ = 0; _ < 16; _++, t += 4) ((Lt[_] = e.getUint32(t)), (qt[_] = e.getUint32((t += 4))));
    for (let _ = 16; _ < 80; _++) {
      const A = Lt[_ - 15] | 0,
        T = qt[_ - 15] | 0,
        v = W.rotrSH(A, T, 1) ^ W.rotrSH(A, T, 8) ^ W.shrSH(A, T, 7),
        I = W.rotrSL(A, T, 1) ^ W.rotrSL(A, T, 8) ^ W.shrSL(A, T, 7),
        O = Lt[_ - 2] | 0,
        D = qt[_ - 2] | 0,
        j = W.rotrSH(O, D, 19) ^ W.rotrBH(O, D, 61) ^ W.shrSH(O, D, 6),
        N = W.rotrSL(O, D, 19) ^ W.rotrBL(O, D, 61) ^ W.shrSL(O, D, 6),
        B = W.add4L(I, N, qt[_ - 7], qt[_ - 16]),
        M = W.add4H(B, v, j, Lt[_ - 7], Lt[_ - 16]);
      ((Lt[_] = M | 0), (qt[_] = B | 0));
    }
    let {
      Ah: i,
      Al: s,
      Bh: n,
      Bl: o,
      Ch: a,
      Cl: c,
      Dh: h,
      Dl: u,
      Eh: l,
      El: d,
      Fh: f,
      Fl: p,
      Gh: g,
      Gl: w,
      Hh: E,
      Hl: b,
    } = this;
    for (let _ = 0; _ < 80; _++) {
      const A = W.rotrSH(l, d, 14) ^ W.rotrSH(l, d, 18) ^ W.rotrBH(l, d, 41),
        T = W.rotrSL(l, d, 14) ^ W.rotrSL(l, d, 18) ^ W.rotrBL(l, d, 41),
        v = (l & f) ^ (~l & g),
        I = (d & p) ^ (~d & w),
        O = W.add5L(b, T, I, Qf[_], qt[_]),
        D = W.add5H(O, E, A, v, Zf[_], Lt[_]),
        j = O | 0,
        N = W.rotrSH(i, s, 28) ^ W.rotrBH(i, s, 34) ^ W.rotrBH(i, s, 39),
        B = W.rotrSL(i, s, 28) ^ W.rotrBL(i, s, 34) ^ W.rotrBL(i, s, 39),
        M = (i & n) ^ (i & a) ^ (n & a),
        P = (s & o) ^ (s & c) ^ (o & c);
      ((E = g | 0),
        (b = w | 0),
        (g = f | 0),
        (w = p | 0),
        (f = l | 0),
        (p = d | 0),
        ({ h: l, l: d } = W.add(h | 0, u | 0, D | 0, j | 0)),
        (h = a | 0),
        (u = c | 0),
        (a = n | 0),
        (c = o | 0),
        (n = i | 0),
        (o = s | 0));
      const y = W.add3L(j, B, P);
      ((i = W.add3H(y, D, N, M)), (s = y | 0));
    }
    (({ h: i, l: s } = W.add(this.Ah | 0, this.Al | 0, i | 0, s | 0)),
      ({ h: n, l: o } = W.add(this.Bh | 0, this.Bl | 0, n | 0, o | 0)),
      ({ h: a, l: c } = W.add(this.Ch | 0, this.Cl | 0, a | 0, c | 0)),
      ({ h, l: u } = W.add(this.Dh | 0, this.Dl | 0, h | 0, u | 0)),
      ({ h: l, l: d } = W.add(this.Eh | 0, this.El | 0, l | 0, d | 0)),
      ({ h: f, l: p } = W.add(this.Fh | 0, this.Fl | 0, f | 0, p | 0)),
      ({ h: g, l: w } = W.add(this.Gh | 0, this.Gl | 0, g | 0, w | 0)),
      ({ h: E, l: b } = W.add(this.Hh | 0, this.Hl | 0, E | 0, b | 0)),
      this.set(i, s, n, o, a, c, h, u, l, d, f, p, g, w, E, b));
  }
  roundClean() {
    (Lt.fill(0), qt.fill(0));
  }
  destroy() {
    (this.buffer.fill(0), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
  }
};
const eg = Of(() => new Xf());
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Do = BigInt(0),
  _u = BigInt(1),
  tg = BigInt(2);
function So(r) {
  return r instanceof Uint8Array || (ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array");
}
function Oo(r) {
  if (!So(r)) throw new Error("Uint8Array expected");
}
function en(r, e) {
  if (typeof e != "boolean") throw new Error(r + " boolean expected, got " + e);
}
const rg = Array.from({ length: 256 }, (r, e) => e.toString(16).padStart(2, "0"));
function Po(r) {
  Oo(r);
  let e = "";
  for (let t = 0; t < r.length; t++) e += rg[r[t]];
  return e;
}
function Iu(r) {
  if (typeof r != "string") throw new Error("hex string expected, got " + typeof r);
  return r === "" ? Do : BigInt("0x" + r);
}
const Pt = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function Da(r) {
  if (r >= Pt._0 && r <= Pt._9) return r - Pt._0;
  if (r >= Pt.A && r <= Pt.F) return r - (Pt.A - 10);
  if (r >= Pt.a && r <= Pt.f) return r - (Pt.a - 10);
}
function $u(r) {
  if (typeof r != "string") throw new Error("hex string expected, got " + typeof r);
  const e = r.length,
    t = e / 2;
  if (e % 2) throw new Error("hex string expected, got unpadded hex of length " + e);
  const i = new Uint8Array(t);
  for (let s = 0, n = 0; s < t; s++, n += 2) {
    const o = Da(r.charCodeAt(n)),
      a = Da(r.charCodeAt(n + 1));
    if (o === void 0 || a === void 0) {
      const c = r[n] + r[n + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + n);
    }
    i[s] = o * 16 + a;
  }
  return i;
}
function ig(r) {
  return Iu(Po(r));
}
function cs(r) {
  return (Oo(r), Iu(Po(Uint8Array.from(r).reverse())));
}
function Du(r, e) {
  return $u(r.toString(16).padStart(e * 2, "0"));
}
function qn(r, e) {
  return Du(r, e).reverse();
}
function At(r, e, t) {
  let i;
  if (typeof e == "string")
    try {
      i = $u(e);
    } catch (n) {
      throw new Error(r + " must be hex string or Uint8Array, cause: " + n);
    }
  else if (So(e)) i = Uint8Array.from(e);
  else throw new Error(r + " must be hex string or Uint8Array");
  const s = i.length;
  if (typeof t == "number" && s !== t) throw new Error(r + " of length " + t + " expected, got " + s);
  return i;
}
function Sa(...r) {
  let e = 0;
  for (let i = 0; i < r.length; i++) {
    const s = r[i];
    (Oo(s), (e += s.length));
  }
  const t = new Uint8Array(e);
  for (let i = 0, s = 0; i < r.length; i++) {
    const n = r[i];
    (t.set(n, s), (s += n.length));
  }
  return t;
}
const tn = (r) => typeof r == "bigint" && Do <= r;
function sg(r, e, t) {
  return tn(r) && tn(e) && tn(t) && e <= r && r < t;
}
function ui(r, e, t, i) {
  if (!sg(e, t, i)) throw new Error("expected valid " + r + ": " + t + " <= n < " + i + ", got " + e);
}
function ng(r) {
  let e;
  for (e = 0; r > Do; r >>= _u, e += 1);
  return e;
}
const og = (r) => (tg << BigInt(r - 1)) - _u,
  ag = {
    bigint: (r) => typeof r == "bigint",
    function: (r) => typeof r == "function",
    boolean: (r) => typeof r == "boolean",
    string: (r) => typeof r == "string",
    stringOrUint8Array: (r) => typeof r == "string" || So(r),
    isSafeInteger: (r) => Number.isSafeInteger(r),
    array: (r) => Array.isArray(r),
    field: (r, e) => e.Fp.isValid(r),
    hash: (r) => typeof r == "function" && Number.isSafeInteger(r.outputLen),
  };
function Ao(r, e, t = {}) {
  const i = (s, n, o) => {
    const a = ag[n];
    if (typeof a != "function") throw new Error("invalid validator function");
    const c = r[s];
    if (!(o && c === void 0) && !a(c, r))
      throw new Error("param " + String(s) + " is invalid. Expected " + n + ", got " + c);
  };
  for (const [s, n] of Object.entries(e)) i(s, n, !1);
  for (const [s, n] of Object.entries(t)) i(s, n, !0);
  return r;
}
function Oa(r) {
  const e = new WeakMap();
  return (t, ...i) => {
    const s = e.get(t);
    if (s !== void 0) return s;
    const n = r(t, ...i);
    return (e.set(t, n), n);
  };
}
const ve = BigInt(0),
  he = BigInt(1),
  ir = BigInt(2),
  cg = BigInt(3),
  Mn = BigInt(4),
  Pa = BigInt(5),
  Aa = BigInt(8);
function fe(r, e) {
  const t = r % e;
  return t >= ve ? t : e + t;
}
function hg(r, e, t) {
  if (e < ve) throw new Error("invalid exponent, negatives unsupported");
  if (t <= ve) throw new Error("invalid modulus");
  if (t === he) return ve;
  let i = he;
  for (; e > ve; ) (e & he && (i = (i * r) % t), (r = (r * r) % t), (e >>= he));
  return i;
}
function yt(r, e, t) {
  let i = r;
  for (; e-- > ve; ) ((i *= i), (i %= t));
  return i;
}
function xa(r, e) {
  if (r === ve) throw new Error("invert: expected non-zero number");
  if (e <= ve) throw new Error("invert: expected positive modulus, got " + e);
  let t = fe(r, e),
    i = e,
    s = ve,
    n = he;
  for (; t !== ve; ) {
    const o = i / t,
      a = i % t,
      c = s - n * o;
    ((i = t), (t = a), (s = n), (n = c));
  }
  if (i !== he) throw new Error("invert: does not exist");
  return fe(s, e);
}
function ug(r) {
  const e = (r - he) / ir;
  let t, i, s;
  for (t = r - he, i = 0; t % ir === ve; t /= ir, i++);
  for (s = ir; s < r && hg(s, e, r) !== r - he; s++)
    if (s > 1e3) throw new Error("Cannot find square root: likely non-prime P");
  if (i === 1) {
    const o = (r + he) / Mn;
    return function (a, c) {
      const h = a.pow(c, o);
      if (!a.eql(a.sqr(h), c)) throw new Error("Cannot find square root");
      return h;
    };
  }
  const n = (t + he) / ir;
  return function (o, a) {
    if (o.pow(a, e) === o.neg(o.ONE)) throw new Error("Cannot find square root");
    let c = i,
      h = o.pow(o.mul(o.ONE, s), t),
      u = o.pow(a, n),
      l = o.pow(a, t);
    for (; !o.eql(l, o.ONE); ) {
      if (o.eql(l, o.ZERO)) return o.ZERO;
      let d = 1;
      for (let p = o.sqr(l); d < c && !o.eql(p, o.ONE); d++) p = o.sqr(p);
      const f = o.pow(h, he << BigInt(c - d - 1));
      ((h = o.sqr(f)), (u = o.mul(u, f)), (l = o.mul(l, h)), (c = d));
    }
    return u;
  };
}
function lg(r) {
  if (r % Mn === cg) {
    const e = (r + he) / Mn;
    return function (t, i) {
      const s = t.pow(i, e);
      if (!t.eql(t.sqr(s), i)) throw new Error("Cannot find square root");
      return s;
    };
  }
  if (r % Aa === Pa) {
    const e = (r - Pa) / Aa;
    return function (t, i) {
      const s = t.mul(i, ir),
        n = t.pow(s, e),
        o = t.mul(i, n),
        a = t.mul(t.mul(o, ir), n),
        c = t.mul(o, t.sub(a, t.ONE));
      if (!t.eql(t.sqr(c), i)) throw new Error("Cannot find square root");
      return c;
    };
  }
  return ug(r);
}
const dg = (r, e) => (fe(r, e) & he) === he,
  pg = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN",
  ];
function fg(r) {
  const e = { ORDER: "bigint", MASK: "bigint", BYTES: "isSafeInteger", BITS: "isSafeInteger" },
    t = pg.reduce((i, s) => ((i[s] = "function"), i), e);
  return Ao(r, t);
}
function gg(r, e, t) {
  if (t < ve) throw new Error("invalid exponent, negatives unsupported");
  if (t === ve) return r.ONE;
  if (t === he) return e;
  let i = r.ONE,
    s = e;
  for (; t > ve; ) (t & he && (i = r.mul(i, s)), (s = r.sqr(s)), (t >>= he));
  return i;
}
function yg(r, e) {
  const t = new Array(e.length),
    i = e.reduce((n, o, a) => (r.is0(o) ? n : ((t[a] = n), r.mul(n, o))), r.ONE),
    s = r.inv(i);
  return (e.reduceRight((n, o, a) => (r.is0(o) ? n : ((t[a] = r.mul(n, t[a])), r.mul(n, o))), s), t);
}
function Su(r, e) {
  const t = e !== void 0 ? e : r.toString(2).length,
    i = Math.ceil(t / 8);
  return { nBitLength: t, nByteLength: i };
}
function Ou(r, e, t = !1, i = {}) {
  if (r <= ve) throw new Error("invalid field: expected ORDER > 0, got " + r);
  const { nBitLength: s, nByteLength: n } = Su(r, e);
  if (n > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let o;
  const a = Object.freeze({
    ORDER: r,
    isLE: t,
    BITS: s,
    BYTES: n,
    MASK: og(s),
    ZERO: ve,
    ONE: he,
    create: (c) => fe(c, r),
    isValid: (c) => {
      if (typeof c != "bigint") throw new Error("invalid field element: expected bigint, got " + typeof c);
      return ve <= c && c < r;
    },
    is0: (c) => c === ve,
    isOdd: (c) => (c & he) === he,
    neg: (c) => fe(-c, r),
    eql: (c, h) => c === h,
    sqr: (c) => fe(c * c, r),
    add: (c, h) => fe(c + h, r),
    sub: (c, h) => fe(c - h, r),
    mul: (c, h) => fe(c * h, r),
    pow: (c, h) => gg(a, c, h),
    div: (c, h) => fe(c * xa(h, r), r),
    sqrN: (c) => c * c,
    addN: (c, h) => c + h,
    subN: (c, h) => c - h,
    mulN: (c, h) => c * h,
    inv: (c) => xa(c, r),
    sqrt: i.sqrt || ((c) => (o || (o = lg(r)), o(a, c))),
    invertBatch: (c) => yg(a, c),
    cmov: (c, h, u) => (u ? h : c),
    toBytes: (c) => (t ? qn(c, n) : Du(c, n)),
    fromBytes: (c) => {
      if (c.length !== n) throw new Error("Field.fromBytes: expected " + n + " bytes, got " + c.length);
      return t ? cs(c) : ig(c);
    },
  });
  return Object.freeze(a);
}
const Ca = BigInt(0),
  Wi = BigInt(1);
function rn(r, e) {
  const t = e.negate();
  return r ? t : e;
}
function Pu(r, e) {
  if (!Number.isSafeInteger(r) || r <= 0 || r > e)
    throw new Error("invalid window size, expected [1.." + e + "], got W=" + r);
}
function sn(r, e) {
  Pu(r, e);
  const t = Math.ceil(e / r) + 1,
    i = 2 ** (r - 1);
  return { windows: t, windowSize: i };
}
function mg(r, e) {
  if (!Array.isArray(r)) throw new Error("array expected");
  r.forEach((t, i) => {
    if (!(t instanceof e)) throw new Error("invalid point at index " + i);
  });
}
function wg(r, e) {
  if (!Array.isArray(r)) throw new Error("array of scalars expected");
  r.forEach((t, i) => {
    if (!e.isValid(t)) throw new Error("invalid scalar at index " + i);
  });
}
const nn = new WeakMap(),
  Au = new WeakMap();
function on(r) {
  return Au.get(r) || 1;
}
function bg(r, e) {
  return {
    constTimeNegate: rn,
    hasPrecomputes(t) {
      return on(t) !== 1;
    },
    unsafeLadder(t, i, s = r.ZERO) {
      let n = t;
      for (; i > Ca; ) (i & Wi && (s = s.add(n)), (n = n.double()), (i >>= Wi));
      return s;
    },
    precomputeWindow(t, i) {
      const { windows: s, windowSize: n } = sn(i, e),
        o = [];
      let a = t,
        c = a;
      for (let h = 0; h < s; h++) {
        ((c = a), o.push(c));
        for (let u = 1; u < n; u++) ((c = c.add(a)), o.push(c));
        a = c.double();
      }
      return o;
    },
    wNAF(t, i, s) {
      const { windows: n, windowSize: o } = sn(t, e);
      let a = r.ZERO,
        c = r.BASE;
      const h = BigInt(2 ** t - 1),
        u = 2 ** t,
        l = BigInt(t);
      for (let d = 0; d < n; d++) {
        const f = d * o;
        let p = Number(s & h);
        ((s >>= l), p > o && ((p -= u), (s += Wi)));
        const g = f,
          w = f + Math.abs(p) - 1,
          E = d % 2 !== 0,
          b = p < 0;
        p === 0 ? (c = c.add(rn(E, i[g]))) : (a = a.add(rn(b, i[w])));
      }
      return { p: a, f: c };
    },
    wNAFUnsafe(t, i, s, n = r.ZERO) {
      const { windows: o, windowSize: a } = sn(t, e),
        c = BigInt(2 ** t - 1),
        h = 2 ** t,
        u = BigInt(t);
      for (let l = 0; l < o; l++) {
        const d = l * a;
        if (s === Ca) break;
        let f = Number(s & c);
        if (((s >>= u), f > a && ((f -= h), (s += Wi)), f === 0)) continue;
        let p = i[d + Math.abs(f) - 1];
        (f < 0 && (p = p.negate()), (n = n.add(p)));
      }
      return n;
    },
    getPrecomputes(t, i, s) {
      let n = nn.get(i);
      return (n || ((n = this.precomputeWindow(i, t)), t !== 1 && nn.set(i, s(n))), n);
    },
    wNAFCached(t, i, s) {
      const n = on(t);
      return this.wNAF(n, this.getPrecomputes(n, t, s), i);
    },
    wNAFCachedUnsafe(t, i, s, n) {
      const o = on(t);
      return o === 1 ? this.unsafeLadder(t, i, n) : this.wNAFUnsafe(o, this.getPrecomputes(o, t, s), i, n);
    },
    setWindowSize(t, i) {
      (Pu(i, e), Au.set(t, i), nn.delete(t));
    },
  };
}
function vg(r, e, t, i) {
  if ((mg(t, r), wg(i, e), t.length !== i.length))
    throw new Error("arrays of points and scalars must have equal length");
  const s = r.ZERO,
    n = ng(BigInt(t.length)),
    o = n > 12 ? n - 3 : n > 4 ? n - 2 : n ? 2 : 1,
    a = (1 << o) - 1,
    c = new Array(a + 1).fill(s),
    h = Math.floor((e.BITS - 1) / o) * o;
  let u = s;
  for (let l = h; l >= 0; l -= o) {
    c.fill(s);
    for (let f = 0; f < i.length; f++) {
      const p = i[f],
        g = Number((p >> BigInt(l)) & BigInt(a));
      c[g] = c[g].add(t[f]);
    }
    let d = s;
    for (let f = c.length - 1, p = s; f > 0; f--) ((p = p.add(c[f])), (d = d.add(p)));
    if (((u = u.add(d)), l !== 0)) for (let f = 0; f < o; f++) u = u.double();
  }
  return u;
}
function Eg(r) {
  return (
    fg(r.Fp),
    Ao(
      r,
      { n: "bigint", h: "bigint", Gx: "field", Gy: "field" },
      { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" },
    ),
    Object.freeze({ ...Su(r.n, r.nBitLength), ...r, p: r.Fp.ORDER })
  );
}
const ct = BigInt(0),
  Ue = BigInt(1),
  Gi = BigInt(2),
  _g = BigInt(8),
  Ig = { zip215: !0 };
function $g(r) {
  const e = Eg(r);
  return (
    Ao(
      r,
      { hash: "function", a: "bigint", d: "bigint", randomBytes: "function" },
      { adjustScalarBytes: "function", domain: "function", uvRatio: "function", mapToCurve: "function" },
    ),
    Object.freeze({ ...e })
  );
}
function Dg(r) {
  const e = $g(r),
    { Fp: t, n: i, prehash: s, hash: n, randomBytes: o, nByteLength: a, h: c } = e,
    h = Gi << (BigInt(a * 8) - Ue),
    u = t.create,
    l = Ou(e.n, e.nBitLength),
    d =
      e.uvRatio ||
      ((y, m) => {
        try {
          return { isValid: !0, value: t.sqrt(y * t.inv(m)) };
        } catch {
          return { isValid: !1, value: ct };
        }
      }),
    f = e.adjustScalarBytes || ((y) => y),
    p =
      e.domain ||
      ((y, m, $) => {
        if ((en("phflag", $), m.length || $)) throw new Error("Contexts/pre-hash are not supported");
        return y;
      });
  function g(y, m) {
    ui("coordinate " + y, m, ct, h);
  }
  function w(y) {
    if (!(y instanceof _)) throw new Error("ExtendedPoint expected");
  }
  const E = Oa((y, m) => {
      const { ex: $, ey: x, ez: S } = y,
        C = y.is0();
      m == null && (m = C ? _g : t.inv(S));
      const k = u($ * m),
        q = u(x * m),
        z = u(S * m);
      if (C) return { x: ct, y: Ue };
      if (z !== Ue) throw new Error("invZ was invalid");
      return { x: k, y: q };
    }),
    b = Oa((y) => {
      const { a: m, d: $ } = e;
      if (y.is0()) throw new Error("bad point: ZERO");
      const { ex: x, ey: S, ez: C, et: k } = y,
        q = u(x * x),
        z = u(S * S),
        L = u(C * C),
        H = u(L * L),
        K = u(q * m),
        oe = u(L * u(K + z)),
        te = u(H + u($ * u(q * z)));
      if (oe !== te) throw new Error("bad point: equation left != right (1)");
      const J = u(x * S),
        Ce = u(C * k);
      if (J !== Ce) throw new Error("bad point: equation left != right (2)");
      return !0;
    });
  class _ {
    constructor(m, $, x, S) {
      ((this.ex = m),
        (this.ey = $),
        (this.ez = x),
        (this.et = S),
        g("x", m),
        g("y", $),
        g("z", x),
        g("t", S),
        Object.freeze(this));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static fromAffine(m) {
      if (m instanceof _) throw new Error("extended point not allowed");
      const { x: $, y: x } = m || {};
      return (g("x", $), g("y", x), new _($, x, Ue, u($ * x)));
    }
    static normalizeZ(m) {
      const $ = t.invertBatch(m.map((x) => x.ez));
      return m.map((x, S) => x.toAffine($[S])).map(_.fromAffine);
    }
    static msm(m, $) {
      return vg(_, l, m, $);
    }
    _setWindowSize(m) {
      v.setWindowSize(this, m);
    }
    assertValidity() {
      b(this);
    }
    equals(m) {
      w(m);
      const { ex: $, ey: x, ez: S } = this,
        { ex: C, ey: k, ez: q } = m,
        z = u($ * q),
        L = u(C * S),
        H = u(x * q),
        K = u(k * S);
      return z === L && H === K;
    }
    is0() {
      return this.equals(_.ZERO);
    }
    negate() {
      return new _(u(-this.ex), this.ey, this.ez, u(-this.et));
    }
    double() {
      const { a: m } = e,
        { ex: $, ey: x, ez: S } = this,
        C = u($ * $),
        k = u(x * x),
        q = u(Gi * u(S * S)),
        z = u(m * C),
        L = $ + x,
        H = u(u(L * L) - C - k),
        K = z + k,
        oe = K - q,
        te = z - k,
        J = u(H * oe),
        Ce = u(K * te),
        Ie = u(H * te),
        Re = u(oe * K);
      return new _(J, Ce, Re, Ie);
    }
    add(m) {
      w(m);
      const { a: $, d: x } = e,
        { ex: S, ey: C, ez: k, et: q } = this,
        { ex: z, ey: L, ez: H, et: K } = m;
      if ($ === BigInt(-1)) {
        const Ko = u((C - S) * (L + z)),
          Wo = u((C + S) * (L - z)),
          Vs = u(Wo - Ko);
        if (Vs === ct) return this.double();
        const Go = u(k * Gi * K),
          Yo = u(q * Gi * H),
          Jo = Yo + Go,
          Zo = Wo + Ko,
          Qo = Yo - Go,
          Pd = u(Jo * Vs),
          Ad = u(Zo * Qo),
          xd = u(Jo * Qo),
          Cd = u(Vs * Zo);
        return new _(Pd, Ad, Cd, xd);
      }
      const oe = u(S * z),
        te = u(C * L),
        J = u(q * x * K),
        Ce = u(k * H),
        Ie = u((S + C) * (z + L) - oe - te),
        Re = Ce - J,
        Qe = Ce + J,
        Xe = u(te - $ * oe),
        vr = u(Ie * Re),
        Dd = u(Qe * Xe),
        Sd = u(Ie * Xe),
        Od = u(Re * Qe);
      return new _(vr, Dd, Od, Sd);
    }
    subtract(m) {
      return this.add(m.negate());
    }
    wNAF(m) {
      return v.wNAFCached(this, m, _.normalizeZ);
    }
    multiply(m) {
      const $ = m;
      ui("scalar", $, Ue, i);
      const { p: x, f: S } = this.wNAF($);
      return _.normalizeZ([x, S])[0];
    }
    multiplyUnsafe(m, $ = _.ZERO) {
      const x = m;
      return (
        ui("scalar", x, ct, i),
        x === ct ? T : this.is0() || x === Ue ? this : v.wNAFCachedUnsafe(this, x, _.normalizeZ, $)
      );
    }
    isSmallOrder() {
      return this.multiplyUnsafe(c).is0();
    }
    isTorsionFree() {
      return v.unsafeLadder(this, i).is0();
    }
    toAffine(m) {
      return E(this, m);
    }
    clearCofactor() {
      const { h: m } = e;
      return m === Ue ? this : this.multiplyUnsafe(m);
    }
    static fromHex(m, $ = !1) {
      const { d: x, a: S } = e,
        C = t.BYTES;
      ((m = At("pointHex", m, C)), en("zip215", $));
      const k = m.slice(),
        q = m[C - 1];
      k[C - 1] = q & -129;
      const z = cs(k),
        L = $ ? h : t.ORDER;
      ui("pointHex.y", z, ct, L);
      const H = u(z * z),
        K = u(H - Ue),
        oe = u(x * H - S);
      let { isValid: te, value: J } = d(K, oe);
      if (!te) throw new Error("Point.fromHex: invalid y coordinate");
      const Ce = (J & Ue) === Ue,
        Ie = (q & 128) !== 0;
      if (!$ && J === ct && Ie) throw new Error("Point.fromHex: x=0 and x_0=1");
      return (Ie !== Ce && (J = u(-J)), _.fromAffine({ x: J, y: z }));
    }
    static fromPrivateKey(m) {
      return D(m).point;
    }
    toRawBytes() {
      const { x: m, y: $ } = this.toAffine(),
        x = qn($, t.BYTES);
      return ((x[x.length - 1] |= m & Ue ? 128 : 0), x);
    }
    toHex() {
      return Po(this.toRawBytes());
    }
  }
  ((_.BASE = new _(e.Gx, e.Gy, Ue, u(e.Gx * e.Gy))), (_.ZERO = new _(ct, Ue, Ue, ct)));
  const { BASE: A, ZERO: T } = _,
    v = bg(_, a * 8);
  function I(y) {
    return fe(y, i);
  }
  function O(y) {
    return I(cs(y));
  }
  function D(y) {
    const m = t.BYTES;
    y = At("private key", y, m);
    const $ = At("hashed private key", n(y), 2 * m),
      x = f($.slice(0, m)),
      S = $.slice(m, 2 * m),
      C = O(x),
      k = A.multiply(C),
      q = k.toRawBytes();
    return { head: x, prefix: S, scalar: C, point: k, pointBytes: q };
  }
  function j(y) {
    return D(y).pointBytes;
  }
  function N(y = new Uint8Array(), ...m) {
    const $ = Sa(...m);
    return O(n(p($, At("context", y), !!s)));
  }
  function B(y, m, $ = {}) {
    ((y = At("message", y)), s && (y = s(y)));
    const { prefix: x, scalar: S, pointBytes: C } = D(m),
      k = N($.context, x, y),
      q = A.multiply(k).toRawBytes(),
      z = N($.context, q, C, y),
      L = I(k + z * S);
    ui("signature.s", L, ct, i);
    const H = Sa(q, qn(L, t.BYTES));
    return At("result", H, t.BYTES * 2);
  }
  const M = Ig;
  function P(y, m, $, x = M) {
    const { context: S, zip215: C } = x,
      k = t.BYTES;
    ((y = At("signature", y, 2 * k)),
      (m = At("message", m)),
      ($ = At("publicKey", $, k)),
      C !== void 0 && en("zip215", C),
      s && (m = s(m)));
    const q = cs(y.slice(k, 2 * k));
    let z, L, H;
    try {
      ((z = _.fromHex($, C)), (L = _.fromHex(y.slice(0, k), C)), (H = A.multiplyUnsafe(q)));
    } catch {
      return !1;
    }
    if (!C && z.isSmallOrder()) return !1;
    const K = N(S, L.toRawBytes(), z.toRawBytes(), m);
    return L.add(z.multiplyUnsafe(K)).subtract(H).clearCofactor().equals(_.ZERO);
  }
  return (
    A._setWindowSize(8),
    {
      CURVE: e,
      getPublicKey: j,
      sign: B,
      verify: P,
      ExtendedPoint: _,
      utils: {
        getExtendedPublicKey: D,
        randomPrivateKey: () => o(t.BYTES),
        precompute(y = 8, m = _.BASE) {
          return (m._setWindowSize(y), m.multiply(BigInt(3)), m);
        },
      },
    }
  );
}
(BigInt(0), BigInt(1));
const xo = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819949"),
  Ta = BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
BigInt(0);
const Sg = BigInt(1),
  Ra = BigInt(2);
BigInt(3);
const Og = BigInt(5),
  Pg = BigInt(8);
function Ag(r) {
  const e = BigInt(10),
    t = BigInt(20),
    i = BigInt(40),
    s = BigInt(80),
    n = xo,
    o = (((r * r) % n) * r) % n,
    a = (yt(o, Ra, n) * o) % n,
    c = (yt(a, Sg, n) * r) % n,
    h = (yt(c, Og, n) * c) % n,
    u = (yt(h, e, n) * h) % n,
    l = (yt(u, t, n) * u) % n,
    d = (yt(l, i, n) * l) % n,
    f = (yt(d, s, n) * d) % n,
    p = (yt(f, s, n) * d) % n,
    g = (yt(p, e, n) * h) % n;
  return { pow_p_5_8: (yt(g, Ra, n) * r) % n, b2: o };
}
function xg(r) {
  return ((r[0] &= 248), (r[31] &= 127), (r[31] |= 64), r);
}
function Cg(r, e) {
  const t = xo,
    i = fe(e * e * e, t),
    s = fe(i * i * e, t),
    n = Ag(r * s).pow_p_5_8;
  let o = fe(r * i * n, t);
  const a = fe(e * o * o, t),
    c = o,
    h = fe(o * Ta, t),
    u = a === r,
    l = a === fe(-r, t),
    d = a === fe(-r * Ta, t);
  return (u && (o = c), (l || d) && (o = h), dg(o, t) && (o = fe(-o, t)), { isValid: u || l, value: o });
}
const Tg = Ou(xo, void 0, !0),
  Rg = {
    a: BigInt(-1),
    d: BigInt("37095705934669439343138083508754565189542113879843219016388785533085940283555"),
    Fp: Tg,
    n: BigInt("7237005577332262213973186563042994240857116359379907606001950938285454250989"),
    h: Pg,
    Gx: BigInt("15112221349535400772501151409588531511454012693041857206046113283949847762202"),
    Gy: BigInt("46316835694926478169428394003475163141307993866256225615783033603165251855960"),
    hash: eg,
    randomBytes: vu,
    adjustScalarBytes: xg,
    uvRatio: Cg,
  },
  xu = Dg(Rg),
  Ng = "EdDSA",
  jg = "JWT",
  ys = ".",
  Ps = "base64url",
  Cu = "utf8",
  Tu = "utf8",
  Bg = ":",
  Ug = "did",
  Fg = "key",
  Na = "base58btc",
  kg = "z",
  Lg = "K36",
  qg = 32;
function Co(r) {
  return globalThis.Buffer != null ? new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : r;
}
function Ru(r = 0) {
  return globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null
    ? Co(globalThis.Buffer.allocUnsafe(r))
    : new Uint8Array(r);
}
function Nu(r, e) {
  e || (e = r.reduce((s, n) => s + n.length, 0));
  const t = Ru(e);
  let i = 0;
  for (const s of r) (t.set(s, i), (i += s.length));
  return Co(t);
}
function Mg(r, e) {
  if (r.length >= 255) throw new TypeError("Alphabet too long");
  for (var t = new Uint8Array(256), i = 0; i < t.length; i++) t[i] = 255;
  for (var s = 0; s < r.length; s++) {
    var n = r.charAt(s),
      o = n.charCodeAt(0);
    if (t[o] !== 255) throw new TypeError(n + " is ambiguous");
    t[o] = s;
  }
  var a = r.length,
    c = r.charAt(0),
    h = Math.log(a) / Math.log(256),
    u = Math.log(256) / Math.log(a);
  function l(p) {
    if (
      (p instanceof Uint8Array ||
        (ArrayBuffer.isView(p)
          ? (p = new Uint8Array(p.buffer, p.byteOffset, p.byteLength))
          : Array.isArray(p) && (p = Uint8Array.from(p))),
      !(p instanceof Uint8Array))
    )
      throw new TypeError("Expected Uint8Array");
    if (p.length === 0) return "";
    for (var g = 0, w = 0, E = 0, b = p.length; E !== b && p[E] === 0; ) (E++, g++);
    for (var _ = ((b - E) * u + 1) >>> 0, A = new Uint8Array(_); E !== b; ) {
      for (var T = p[E], v = 0, I = _ - 1; (T !== 0 || v < w) && I !== -1; I--, v++)
        ((T += (256 * A[I]) >>> 0), (A[I] = T % a >>> 0), (T = (T / a) >>> 0));
      if (T !== 0) throw new Error("Non-zero carry");
      ((w = v), E++);
    }
    for (var O = _ - w; O !== _ && A[O] === 0; ) O++;
    for (var D = c.repeat(g); O < _; ++O) D += r.charAt(A[O]);
    return D;
  }
  function d(p) {
    if (typeof p != "string") throw new TypeError("Expected String");
    if (p.length === 0) return new Uint8Array();
    var g = 0;
    if (p[g] !== " ") {
      for (var w = 0, E = 0; p[g] === c; ) (w++, g++);
      for (var b = ((p.length - g) * h + 1) >>> 0, _ = new Uint8Array(b); p[g]; ) {
        var A = t[p.charCodeAt(g)];
        if (A === 255) return;
        for (var T = 0, v = b - 1; (A !== 0 || T < E) && v !== -1; v--, T++)
          ((A += (a * _[v]) >>> 0), (_[v] = A % 256 >>> 0), (A = (A / 256) >>> 0));
        if (A !== 0) throw new Error("Non-zero carry");
        ((E = T), g++);
      }
      if (p[g] !== " ") {
        for (var I = b - E; I !== b && _[I] === 0; ) I++;
        for (var O = new Uint8Array(w + (b - I)), D = w; I !== b; ) O[D++] = _[I++];
        return O;
      }
    }
  }
  function f(p) {
    var g = d(p);
    if (g) return g;
    throw new Error(`Non-${e} character`);
  }
  return { encode: l, decodeUnsafe: d, decode: f };
}
var zg = Mg,
  Hg = zg;
const ju = (r) => {
    if (r instanceof Uint8Array && r.constructor.name === "Uint8Array") return r;
    if (r instanceof ArrayBuffer) return new Uint8Array(r);
    if (ArrayBuffer.isView(r)) return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
    throw new Error("Unknown type, must be binary type");
  },
  Vg = (r) => new TextEncoder().encode(r),
  Kg = (r) => new TextDecoder().decode(r);
let Wg = class {
    constructor(e, t, i) {
      ((this.name = e), (this.prefix = t), (this.baseEncode = i));
    }
    encode(e) {
      if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
      throw Error("Unknown type, must be binary type");
    }
  },
  Gg = class {
    constructor(e, t, i) {
      if (((this.name = e), (this.prefix = t), t.codePointAt(0) === void 0))
        throw new Error("Invalid prefix character");
      ((this.prefixCodePoint = t.codePointAt(0)), (this.baseDecode = i));
    }
    decode(e) {
      if (typeof e == "string") {
        if (e.codePointAt(0) !== this.prefixCodePoint)
          throw Error(
            `Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`,
          );
        return this.baseDecode(e.slice(this.prefix.length));
      } else throw Error("Can only multibase decode strings");
    }
    or(e) {
      return Bu(this, e);
    }
  },
  Yg = class {
    constructor(e) {
      this.decoders = e;
    }
    or(e) {
      return Bu(this, e);
    }
    decode(e) {
      const t = e[0],
        i = this.decoders[t];
      if (i) return i.decode(e);
      throw RangeError(
        `Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`,
      );
    }
  };
const Bu = (r, e) => new Yg({ ...(r.decoders || { [r.prefix]: r }), ...(e.decoders || { [e.prefix]: e }) });
let Jg = class {
  constructor(e, t, i, s) {
    ((this.name = e),
      (this.prefix = t),
      (this.baseEncode = i),
      (this.baseDecode = s),
      (this.encoder = new Wg(e, t, i)),
      (this.decoder = new Gg(e, t, s)));
  }
  encode(e) {
    return this.encoder.encode(e);
  }
  decode(e) {
    return this.decoder.decode(e);
  }
};
const As = ({ name: r, prefix: e, encode: t, decode: i }) => new Jg(r, e, t, i),
  Ni = ({ prefix: r, name: e, alphabet: t }) => {
    const { encode: i, decode: s } = Hg(t, e);
    return As({ prefix: r, name: e, encode: i, decode: (n) => ju(s(n)) });
  },
  Zg = (r, e, t, i) => {
    const s = {};
    for (let u = 0; u < e.length; ++u) s[e[u]] = u;
    let n = r.length;
    for (; r[n - 1] === "="; ) --n;
    const o = new Uint8Array(((n * t) / 8) | 0);
    let a = 0,
      c = 0,
      h = 0;
    for (let u = 0; u < n; ++u) {
      const l = s[r[u]];
      if (l === void 0) throw new SyntaxError(`Non-${i} character`);
      ((c = (c << t) | l), (a += t), a >= 8 && ((a -= 8), (o[h++] = 255 & (c >> a))));
    }
    if (a >= t || 255 & (c << (8 - a))) throw new SyntaxError("Unexpected end of data");
    return o;
  },
  Qg = (r, e, t) => {
    const i = e[e.length - 1] === "=",
      s = (1 << t) - 1;
    let n = "",
      o = 0,
      a = 0;
    for (let c = 0; c < r.length; ++c) for (a = (a << 8) | r[c], o += 8; o > t; ) ((o -= t), (n += e[s & (a >> o)]));
    if ((o && (n += e[s & (a << (t - o))]), i)) for (; (n.length * t) & 7; ) n += "=";
    return n;
  },
  Pe = ({ name: r, prefix: e, bitsPerChar: t, alphabet: i }) =>
    As({
      prefix: e,
      name: r,
      encode(s) {
        return Qg(s, i, t);
      },
      decode(s) {
        return Zg(s, i, t, r);
      },
    }),
  Xg = As({ prefix: "\0", name: "identity", encode: (r) => Kg(r), decode: (r) => Vg(r) });
var ey = Object.freeze({ __proto__: null, identity: Xg });
const ty = Pe({ prefix: "0", name: "base2", alphabet: "01", bitsPerChar: 1 });
var ry = Object.freeze({ __proto__: null, base2: ty });
const iy = Pe({ prefix: "7", name: "base8", alphabet: "01234567", bitsPerChar: 3 });
var sy = Object.freeze({ __proto__: null, base8: iy });
const ny = Ni({ prefix: "9", name: "base10", alphabet: "0123456789" });
var oy = Object.freeze({ __proto__: null, base10: ny });
const ay = Pe({ prefix: "f", name: "base16", alphabet: "0123456789abcdef", bitsPerChar: 4 }),
  cy = Pe({ prefix: "F", name: "base16upper", alphabet: "0123456789ABCDEF", bitsPerChar: 4 });
var hy = Object.freeze({ __proto__: null, base16: ay, base16upper: cy });
const uy = Pe({ prefix: "b", name: "base32", alphabet: "abcdefghijklmnopqrstuvwxyz234567", bitsPerChar: 5 }),
  ly = Pe({ prefix: "B", name: "base32upper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", bitsPerChar: 5 }),
  dy = Pe({ prefix: "c", name: "base32pad", alphabet: "abcdefghijklmnopqrstuvwxyz234567=", bitsPerChar: 5 }),
  py = Pe({ prefix: "C", name: "base32padupper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=", bitsPerChar: 5 }),
  fy = Pe({ prefix: "v", name: "base32hex", alphabet: "0123456789abcdefghijklmnopqrstuv", bitsPerChar: 5 }),
  gy = Pe({ prefix: "V", name: "base32hexupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV", bitsPerChar: 5 }),
  yy = Pe({ prefix: "t", name: "base32hexpad", alphabet: "0123456789abcdefghijklmnopqrstuv=", bitsPerChar: 5 }),
  my = Pe({ prefix: "T", name: "base32hexpadupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=", bitsPerChar: 5 }),
  wy = Pe({ prefix: "h", name: "base32z", alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769", bitsPerChar: 5 });
var by = Object.freeze({
  __proto__: null,
  base32: uy,
  base32upper: ly,
  base32pad: dy,
  base32padupper: py,
  base32hex: fy,
  base32hexupper: gy,
  base32hexpad: yy,
  base32hexpadupper: my,
  base32z: wy,
});
const vy = Ni({ prefix: "k", name: "base36", alphabet: "0123456789abcdefghijklmnopqrstuvwxyz" }),
  Ey = Ni({ prefix: "K", name: "base36upper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
var _y = Object.freeze({ __proto__: null, base36: vy, base36upper: Ey });
const Iy = Ni({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  }),
  $y = Ni({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
  });
var Dy = Object.freeze({ __proto__: null, base58btc: Iy, base58flickr: $y });
const Sy = Pe({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6,
  }),
  Oy = Pe({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6,
  }),
  Py = Pe({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6,
  }),
  Ay = Pe({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6,
  });
var xy = Object.freeze({ __proto__: null, base64: Sy, base64pad: Oy, base64url: Py, base64urlpad: Ay });
const Uu = Array.from(
    "🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂",
  ),
  Cy = Uu.reduce((r, e, t) => ((r[t] = e), r), []),
  Ty = Uu.reduce((r, e, t) => ((r[e.codePointAt(0)] = t), r), []);
function Ry(r) {
  return r.reduce((e, t) => ((e += Cy[t]), e), "");
}
function Ny(r) {
  const e = [];
  for (const t of r) {
    const i = Ty[t.codePointAt(0)];
    if (i === void 0) throw new Error(`Non-base256emoji character: ${t}`);
    e.push(i);
  }
  return new Uint8Array(e);
}
const jy = As({ prefix: "🚀", name: "base256emoji", encode: Ry, decode: Ny });
var By = Object.freeze({ __proto__: null, base256emoji: jy }),
  Uy = Fu,
  ja = 128,
  Fy = -128,
  ky = Math.pow(2, 31);
function Fu(r, e, t) {
  ((e = e || []), (t = t || 0));
  for (var i = t; r >= ky; ) ((e[t++] = (r & 255) | ja), (r /= 128));
  for (; r & Fy; ) ((e[t++] = (r & 255) | ja), (r >>>= 7));
  return ((e[t] = r | 0), (Fu.bytes = t - i + 1), e);
}
var Ly = zn,
  qy = 128,
  Ba = 127;
function zn(r, i) {
  var t = 0,
    i = i || 0,
    s = 0,
    n = i,
    o,
    a = r.length;
  do {
    if (n >= a) throw ((zn.bytes = 0), new RangeError("Could not decode varint"));
    ((o = r[n++]), (t += s < 28 ? (o & Ba) << s : (o & Ba) * Math.pow(2, s)), (s += 7));
  } while (o >= qy);
  return ((zn.bytes = n - i), t);
}
var My = Math.pow(2, 7),
  zy = Math.pow(2, 14),
  Hy = Math.pow(2, 21),
  Vy = Math.pow(2, 28),
  Ky = Math.pow(2, 35),
  Wy = Math.pow(2, 42),
  Gy = Math.pow(2, 49),
  Yy = Math.pow(2, 56),
  Jy = Math.pow(2, 63),
  Zy = function (r) {
    return r < My
      ? 1
      : r < zy
        ? 2
        : r < Hy
          ? 3
          : r < Vy
            ? 4
            : r < Ky
              ? 5
              : r < Wy
                ? 6
                : r < Gy
                  ? 7
                  : r < Yy
                    ? 8
                    : r < Jy
                      ? 9
                      : 10;
  },
  Qy = { encode: Uy, decode: Ly, encodingLength: Zy },
  ku = Qy;
const Ua = (r, e, t = 0) => (ku.encode(r, e, t), e),
  Fa = (r) => ku.encodingLength(r),
  Hn = (r, e) => {
    const t = e.byteLength,
      i = Fa(r),
      s = i + Fa(t),
      n = new Uint8Array(s + t);
    return (Ua(r, n, 0), Ua(t, n, i), n.set(e, s), new Xy(r, t, e, n));
  };
let Xy = class {
  constructor(e, t, i, s) {
    ((this.code = e), (this.size = t), (this.digest = i), (this.bytes = s));
  }
};
const Lu = ({ name: r, code: e, encode: t }) => new em(r, e, t);
let em = class {
  constructor(e, t, i) {
    ((this.name = e), (this.code = t), (this.encode = i));
  }
  digest(e) {
    if (e instanceof Uint8Array) {
      const t = this.encode(e);
      return t instanceof Uint8Array ? Hn(this.code, t) : t.then((i) => Hn(this.code, i));
    } else throw Error("Unknown type, must be binary type");
  }
};
const qu = (r) => async (e) => new Uint8Array(await crypto.subtle.digest(r, e)),
  tm = Lu({ name: "sha2-256", code: 18, encode: qu("SHA-256") }),
  rm = Lu({ name: "sha2-512", code: 19, encode: qu("SHA-512") });
var im = Object.freeze({ __proto__: null, sha256: tm, sha512: rm });
const Mu = 0,
  sm = "identity",
  zu = ju,
  nm = (r) => Hn(Mu, zu(r)),
  om = { code: Mu, name: sm, encode: zu, digest: nm };
var am = Object.freeze({ __proto__: null, identity: om });
(new TextEncoder(), new TextDecoder());
const ka = { ...ey, ...ry, ...sy, ...oy, ...hy, ...by, ..._y, ...Dy, ...xy, ...By };
({ ...im, ...am });
function Hu(r, e, t, i) {
  return { name: r, prefix: e, encoder: { name: r, prefix: e, encode: t }, decoder: { decode: i } };
}
const La = Hu(
    "utf8",
    "u",
    (r) => "u" + new TextDecoder("utf8").decode(r),
    (r) => new TextEncoder().encode(r.substring(1)),
  ),
  an = Hu(
    "ascii",
    "a",
    (r) => {
      let e = "a";
      for (let t = 0; t < r.length; t++) e += String.fromCharCode(r[t]);
      return e;
    },
    (r) => {
      r = r.substring(1);
      const e = Ru(r.length);
      for (let t = 0; t < r.length; t++) e[t] = r.charCodeAt(t);
      return e;
    },
  ),
  Vu = { utf8: La, "utf-8": La, hex: ka.base16, latin1: an, ascii: an, binary: an, ...ka };
function xs(r, e = "utf8") {
  const t = Vu[e];
  if (!t) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null
    ? globalThis.Buffer.from(r.buffer, r.byteOffset, r.byteLength).toString("utf8")
    : t.encoder.encode(r).substring(1);
}
function ei(r, e = "utf8") {
  const t = Vu[e];
  if (!t) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null
    ? Co(globalThis.Buffer.from(r, "utf-8"))
    : t.decoder.decode(`${t.prefix}${r}`);
}
function qa(r) {
  return lr(xs(ei(r, Ps), Cu));
}
function ms(r) {
  return xs(ei(kt(r), Cu), Ps);
}
function Ku(r) {
  const e = ei(Lg, Na),
    t = kg + xs(Nu([e, r]), Na);
  return [Ug, Fg, t].join(Bg);
}
function cm(r) {
  return xs(r, Ps);
}
function hm(r) {
  return ei(r, Ps);
}
function um(r) {
  return ei([ms(r.header), ms(r.payload)].join(ys), Tu);
}
function lm(r) {
  return [ms(r.header), ms(r.payload), cm(r.signature)].join(ys);
}
function Vn(r) {
  const e = r.split(ys),
    t = qa(e[0]),
    i = qa(e[1]),
    s = hm(e[2]),
    n = ei(e.slice(0, 2).join(ys), Tu);
  return { header: t, payload: i, signature: s, data: n };
}
function Ma(r = vu(qg)) {
  const e = xu.getPublicKey(r);
  return { secretKey: Nu([r, e]), publicKey: e };
}
async function dm(r, e, t, i, s = U.fromMiliseconds(Date.now())) {
  const n = { alg: Ng, typ: jg },
    o = Ku(i.publicKey),
    a = s + t,
    c = { iss: o, sub: r, aud: e, iat: s, exp: a },
    h = um({ header: n, payload: c }),
    u = xu.sign(h, i.secretKey.slice(0, 32));
  return lm({ header: n, payload: c, signature: u });
}
function Wu(r = 0) {
  return globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null
    ? globalThis.Buffer.allocUnsafe(r)
    : new Uint8Array(r);
}
function vi(r, e) {
  e || (e = r.reduce((s, n) => s + n.length, 0));
  const t = Wu(e);
  let i = 0;
  for (const s of r) (t.set(s, i), (i += s.length));
  return t;
}
function pm(r, e) {
  if (r.length >= 255) throw new TypeError("Alphabet too long");
  for (var t = new Uint8Array(256), i = 0; i < t.length; i++) t[i] = 255;
  for (var s = 0; s < r.length; s++) {
    var n = r.charAt(s),
      o = n.charCodeAt(0);
    if (t[o] !== 255) throw new TypeError(n + " is ambiguous");
    t[o] = s;
  }
  var a = r.length,
    c = r.charAt(0),
    h = Math.log(a) / Math.log(256),
    u = Math.log(256) / Math.log(a);
  function l(p) {
    if (
      (p instanceof Uint8Array ||
        (ArrayBuffer.isView(p)
          ? (p = new Uint8Array(p.buffer, p.byteOffset, p.byteLength))
          : Array.isArray(p) && (p = Uint8Array.from(p))),
      !(p instanceof Uint8Array))
    )
      throw new TypeError("Expected Uint8Array");
    if (p.length === 0) return "";
    for (var g = 0, w = 0, E = 0, b = p.length; E !== b && p[E] === 0; ) (E++, g++);
    for (var _ = ((b - E) * u + 1) >>> 0, A = new Uint8Array(_); E !== b; ) {
      for (var T = p[E], v = 0, I = _ - 1; (T !== 0 || v < w) && I !== -1; I--, v++)
        ((T += (256 * A[I]) >>> 0), (A[I] = T % a >>> 0), (T = (T / a) >>> 0));
      if (T !== 0) throw new Error("Non-zero carry");
      ((w = v), E++);
    }
    for (var O = _ - w; O !== _ && A[O] === 0; ) O++;
    for (var D = c.repeat(g); O < _; ++O) D += r.charAt(A[O]);
    return D;
  }
  function d(p) {
    if (typeof p != "string") throw new TypeError("Expected String");
    if (p.length === 0) return new Uint8Array();
    var g = 0;
    if (p[g] !== " ") {
      for (var w = 0, E = 0; p[g] === c; ) (w++, g++);
      for (var b = ((p.length - g) * h + 1) >>> 0, _ = new Uint8Array(b); p[g]; ) {
        var A = t[p.charCodeAt(g)];
        if (A === 255) return;
        for (var T = 0, v = b - 1; (A !== 0 || T < E) && v !== -1; v--, T++)
          ((A += (a * _[v]) >>> 0), (_[v] = A % 256 >>> 0), (A = (A / 256) >>> 0));
        if (A !== 0) throw new Error("Non-zero carry");
        ((E = T), g++);
      }
      if (p[g] !== " ") {
        for (var I = b - E; I !== b && _[I] === 0; ) I++;
        for (var O = new Uint8Array(w + (b - I)), D = w; I !== b; ) O[D++] = _[I++];
        return O;
      }
    }
  }
  function f(p) {
    var g = d(p);
    if (g) return g;
    throw new Error(`Non-${e} character`);
  }
  return { encode: l, decodeUnsafe: d, decode: f };
}
var fm = pm,
  gm = fm;
const ym = (r) => {
    if (r instanceof Uint8Array && r.constructor.name === "Uint8Array") return r;
    if (r instanceof ArrayBuffer) return new Uint8Array(r);
    if (ArrayBuffer.isView(r)) return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
    throw new Error("Unknown type, must be binary type");
  },
  mm = (r) => new TextEncoder().encode(r),
  wm = (r) => new TextDecoder().decode(r);
class bm {
  constructor(e, t, i) {
    ((this.name = e), (this.prefix = t), (this.baseEncode = i));
  }
  encode(e) {
    if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
    throw Error("Unknown type, must be binary type");
  }
}
class vm {
  constructor(e, t, i) {
    if (((this.name = e), (this.prefix = t), t.codePointAt(0) === void 0)) throw new Error("Invalid prefix character");
    ((this.prefixCodePoint = t.codePointAt(0)), (this.baseDecode = i));
  }
  decode(e) {
    if (typeof e == "string") {
      if (e.codePointAt(0) !== this.prefixCodePoint)
        throw Error(
          `Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`,
        );
      return this.baseDecode(e.slice(this.prefix.length));
    } else throw Error("Can only multibase decode strings");
  }
  or(e) {
    return Gu(this, e);
  }
}
class Em {
  constructor(e) {
    this.decoders = e;
  }
  or(e) {
    return Gu(this, e);
  }
  decode(e) {
    const t = e[0],
      i = this.decoders[t];
    if (i) return i.decode(e);
    throw RangeError(
      `Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`,
    );
  }
}
const Gu = (r, e) => new Em({ ...(r.decoders || { [r.prefix]: r }), ...(e.decoders || { [e.prefix]: e }) });
class _m {
  constructor(e, t, i, s) {
    ((this.name = e),
      (this.prefix = t),
      (this.baseEncode = i),
      (this.baseDecode = s),
      (this.encoder = new bm(e, t, i)),
      (this.decoder = new vm(e, t, s)));
  }
  encode(e) {
    return this.encoder.encode(e);
  }
  decode(e) {
    return this.decoder.decode(e);
  }
}
const Cs = ({ name: r, prefix: e, encode: t, decode: i }) => new _m(r, e, t, i),
  ji = ({ prefix: r, name: e, alphabet: t }) => {
    const { encode: i, decode: s } = gm(t, e);
    return Cs({ prefix: r, name: e, encode: i, decode: (n) => ym(s(n)) });
  },
  Im = (r, e, t, i) => {
    const s = {};
    for (let u = 0; u < e.length; ++u) s[e[u]] = u;
    let n = r.length;
    for (; r[n - 1] === "="; ) --n;
    const o = new Uint8Array(((n * t) / 8) | 0);
    let a = 0,
      c = 0,
      h = 0;
    for (let u = 0; u < n; ++u) {
      const l = s[r[u]];
      if (l === void 0) throw new SyntaxError(`Non-${i} character`);
      ((c = (c << t) | l), (a += t), a >= 8 && ((a -= 8), (o[h++] = 255 & (c >> a))));
    }
    if (a >= t || 255 & (c << (8 - a))) throw new SyntaxError("Unexpected end of data");
    return o;
  },
  $m = (r, e, t) => {
    const i = e[e.length - 1] === "=",
      s = (1 << t) - 1;
    let n = "",
      o = 0,
      a = 0;
    for (let c = 0; c < r.length; ++c) for (a = (a << 8) | r[c], o += 8; o > t; ) ((o -= t), (n += e[s & (a >> o)]));
    if ((o && (n += e[s & (a << (t - o))]), i)) for (; (n.length * t) & 7; ) n += "=";
    return n;
  },
  Ae = ({ name: r, prefix: e, bitsPerChar: t, alphabet: i }) =>
    Cs({
      prefix: e,
      name: r,
      encode(s) {
        return $m(s, i, t);
      },
      decode(s) {
        return Im(s, i, t, r);
      },
    }),
  Dm = Cs({ prefix: "\0", name: "identity", encode: (r) => wm(r), decode: (r) => mm(r) }),
  Sm = Object.freeze(Object.defineProperty({ __proto__: null, identity: Dm }, Symbol.toStringTag, { value: "Module" })),
  Om = Ae({ prefix: "0", name: "base2", alphabet: "01", bitsPerChar: 1 }),
  Pm = Object.freeze(Object.defineProperty({ __proto__: null, base2: Om }, Symbol.toStringTag, { value: "Module" })),
  Am = Ae({ prefix: "7", name: "base8", alphabet: "01234567", bitsPerChar: 3 }),
  xm = Object.freeze(Object.defineProperty({ __proto__: null, base8: Am }, Symbol.toStringTag, { value: "Module" })),
  Cm = ji({ prefix: "9", name: "base10", alphabet: "0123456789" }),
  Tm = Object.freeze(Object.defineProperty({ __proto__: null, base10: Cm }, Symbol.toStringTag, { value: "Module" })),
  Rm = Ae({ prefix: "f", name: "base16", alphabet: "0123456789abcdef", bitsPerChar: 4 }),
  Nm = Ae({ prefix: "F", name: "base16upper", alphabet: "0123456789ABCDEF", bitsPerChar: 4 }),
  jm = Object.freeze(
    Object.defineProperty({ __proto__: null, base16: Rm, base16upper: Nm }, Symbol.toStringTag, { value: "Module" }),
  ),
  Bm = Ae({ prefix: "b", name: "base32", alphabet: "abcdefghijklmnopqrstuvwxyz234567", bitsPerChar: 5 }),
  Um = Ae({ prefix: "B", name: "base32upper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", bitsPerChar: 5 }),
  Fm = Ae({ prefix: "c", name: "base32pad", alphabet: "abcdefghijklmnopqrstuvwxyz234567=", bitsPerChar: 5 }),
  km = Ae({ prefix: "C", name: "base32padupper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=", bitsPerChar: 5 }),
  Lm = Ae({ prefix: "v", name: "base32hex", alphabet: "0123456789abcdefghijklmnopqrstuv", bitsPerChar: 5 }),
  qm = Ae({ prefix: "V", name: "base32hexupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV", bitsPerChar: 5 }),
  Mm = Ae({ prefix: "t", name: "base32hexpad", alphabet: "0123456789abcdefghijklmnopqrstuv=", bitsPerChar: 5 }),
  zm = Ae({ prefix: "T", name: "base32hexpadupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=", bitsPerChar: 5 }),
  Hm = Ae({ prefix: "h", name: "base32z", alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769", bitsPerChar: 5 }),
  Vm = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        base32: Bm,
        base32hex: Lm,
        base32hexpad: Mm,
        base32hexpadupper: zm,
        base32hexupper: qm,
        base32pad: Fm,
        base32padupper: km,
        base32upper: Um,
        base32z: Hm,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Km = ji({ prefix: "k", name: "base36", alphabet: "0123456789abcdefghijklmnopqrstuvwxyz" }),
  Wm = ji({ prefix: "K", name: "base36upper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" }),
  Gm = Object.freeze(
    Object.defineProperty({ __proto__: null, base36: Km, base36upper: Wm }, Symbol.toStringTag, { value: "Module" }),
  ),
  Ym = ji({ name: "base58btc", prefix: "z", alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" }),
  Jm = ji({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
  }),
  Zm = Object.freeze(
    Object.defineProperty({ __proto__: null, base58btc: Ym, base58flickr: Jm }, Symbol.toStringTag, {
      value: "Module",
    }),
  ),
  Qm = Ae({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6,
  }),
  Xm = Ae({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6,
  }),
  ew = Ae({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6,
  }),
  tw = Ae({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6,
  }),
  rw = Object.freeze(
    Object.defineProperty(
      { __proto__: null, base64: Qm, base64pad: Xm, base64url: ew, base64urlpad: tw },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Yu = Array.from(
    "🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂",
  ),
  iw = Yu.reduce((r, e, t) => ((r[t] = e), r), []),
  sw = Yu.reduce((r, e, t) => ((r[e.codePointAt(0)] = t), r), []);
function nw(r) {
  return r.reduce((e, t) => ((e += iw[t]), e), "");
}
function ow(r) {
  const e = [];
  for (const t of r) {
    const i = sw[t.codePointAt(0)];
    if (i === void 0) throw new Error(`Non-base256emoji character: ${t}`);
    e.push(i);
  }
  return new Uint8Array(e);
}
const aw = Cs({ prefix: "🚀", name: "base256emoji", encode: nw, decode: ow }),
  cw = Object.freeze(
    Object.defineProperty({ __proto__: null, base256emoji: aw }, Symbol.toStringTag, { value: "Module" }),
  );
new TextEncoder();
new TextDecoder();
const za = { ...Sm, ...Pm, ...xm, ...Tm, ...jm, ...Vm, ...Gm, ...Zm, ...rw, ...cw };
function Ju(r, e, t, i) {
  return { name: r, prefix: e, encoder: { name: r, prefix: e, encode: t }, decoder: { decode: i } };
}
const Ha = Ju(
    "utf8",
    "u",
    (r) => "u" + new TextDecoder("utf8").decode(r),
    (r) => new TextEncoder().encode(r.substring(1)),
  ),
  cn = Ju(
    "ascii",
    "a",
    (r) => {
      let e = "a";
      for (let t = 0; t < r.length; t++) e += String.fromCharCode(r[t]);
      return e;
    },
    (r) => {
      r = r.substring(1);
      const e = Wu(r.length);
      for (let t = 0; t < r.length; t++) e[t] = r.charCodeAt(t);
      return e;
    },
  ),
  Zu = { utf8: Ha, "utf-8": Ha, hex: za.base16, latin1: cn, ascii: cn, binary: cn, ...za };
function st(r, e = "utf8") {
  const t = Zu[e];
  if (!t) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null
    ? globalThis.Buffer.from(r, "utf8")
    : t.decoder.decode(`${t.prefix}${r}`);
}
function Me(r, e = "utf8") {
  const t = Zu[e];
  if (!t) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null
    ? globalThis.Buffer.from(r.buffer, r.byteOffset, r.byteLength).toString("utf8")
    : t.encoder.encode(r).substring(1);
}
const hw = {
  waku: {
    publish: "waku_publish",
    batchPublish: "waku_batchPublish",
    subscribe: "waku_subscribe",
    batchSubscribe: "waku_batchSubscribe",
    subscription: "waku_subscription",
    unsubscribe: "waku_unsubscribe",
    batchUnsubscribe: "waku_batchUnsubscribe",
    batchFetchMessages: "waku_batchFetchMessages",
  },
  irn: {
    publish: "irn_publish",
    batchPublish: "irn_batchPublish",
    subscribe: "irn_subscribe",
    batchSubscribe: "irn_batchSubscribe",
    subscription: "irn_subscription",
    unsubscribe: "irn_unsubscribe",
    batchUnsubscribe: "irn_batchUnsubscribe",
    batchFetchMessages: "irn_batchFetchMessages",
  },
  iridium: {
    publish: "iridium_publish",
    batchPublish: "iridium_batchPublish",
    subscribe: "iridium_subscribe",
    batchSubscribe: "iridium_batchSubscribe",
    subscription: "iridium_subscription",
    unsubscribe: "iridium_unsubscribe",
    batchUnsubscribe: "iridium_batchUnsubscribe",
    batchFetchMessages: "iridium_batchFetchMessages",
  },
};
var uw = {};
const lw = ":";
function Hr(r) {
  const [e, t] = r.split(lw);
  return { namespace: e, reference: t };
}
function Va(r, e = []) {
  const t = [];
  return (
    Object.keys(r).forEach((i) => {
      if (e.length && !e.includes(i)) return;
      const s = r[i];
      t.push(...s.accounts);
    }),
    t
  );
}
function Qu(r, e) {
  return r.includes(":") ? [r] : e.chains || [];
}
var dw = Object.defineProperty,
  pw = Object.defineProperties,
  fw = Object.getOwnPropertyDescriptors,
  Ka = Object.getOwnPropertySymbols,
  gw = Object.prototype.hasOwnProperty,
  yw = Object.prototype.propertyIsEnumerable,
  Wa = (r, e, t) => (e in r ? dw(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Ga = (r, e) => {
    for (var t in e || (e = {})) gw.call(e, t) && Wa(r, t, e[t]);
    if (Ka) for (var t of Ka(e)) yw.call(e, t) && Wa(r, t, e[t]);
    return r;
  },
  mw = (r, e) => pw(r, fw(e));
const ww = "ReactNative",
  Ye = { reactNative: "react-native", node: "node", browser: "browser", unknown: "unknown" },
  bw = "js";
function ws() {
  return typeof nt < "u" && typeof nt.versions < "u" && typeof nt.versions.node < "u";
}
function Jt() {
  return !Ft.getDocument() && !!Ft.getNavigator() && navigator.product === ww;
}
function vw() {
  return (
    Jt() &&
    typeof V < "u" &&
    typeof (V == null ? void 0 : V.Platform) < "u" &&
    (V == null ? void 0 : V.Platform.OS) === "android"
  );
}
function Ew() {
  return (
    Jt() &&
    typeof V < "u" &&
    typeof (V == null ? void 0 : V.Platform) < "u" &&
    (V == null ? void 0 : V.Platform.OS) === "ios"
  );
}
function ti() {
  return !ws() && !!Ft.getNavigator() && !!Ft.getDocument();
}
function Bi() {
  return Jt() ? Ye.reactNative : ws() ? Ye.node : ti() ? Ye.browser : Ye.unknown;
}
function Ya() {
  var r;
  try {
    return Jt() && typeof V < "u" && typeof (V == null ? void 0 : V.Application) < "u"
      ? (r = V.Application) == null
        ? void 0
        : r.applicationId
      : void 0;
  } catch {
    return;
  }
}
function _w(r, e) {
  const t = new URLSearchParams(r);
  for (const i of Object.keys(e).sort())
    if (e.hasOwnProperty(i)) {
      const s = e[i];
      s !== void 0 && t.set(i, s);
    }
  return t.toString();
}
function Iw(r) {
  var e, t;
  const i = Xu();
  try {
    return (
      r != null &&
        r.url &&
        i.url &&
        new URL(r.url).host !== new URL(i.url).host &&
        (console.warn(
          `The configured WalletConnect 'metadata.url':${r.url} differs from the actual page url:${i.url}. This is probably unintended and can lead to issues.`,
        ),
        (r.url = i.url)),
      (e = r == null ? void 0 : r.icons) != null &&
        e.length &&
        r.icons.length > 0 &&
        (r.icons = r.icons.filter((s) => s !== "")),
      mw(Ga(Ga({}, i), r), {
        url: (r == null ? void 0 : r.url) || i.url,
        name: (r == null ? void 0 : r.name) || i.name,
        description: (r == null ? void 0 : r.description) || i.description,
        icons: (t = r == null ? void 0 : r.icons) != null && t.length && r.icons.length > 0 ? r.icons : i.icons,
      })
    );
  } catch (s) {
    return (console.warn("Error populating app metadata", s), r || i);
  }
}
function Xu() {
  return Ap.getWindowMetadata() || { name: "", description: "", url: "", icons: [""] };
}
function $w() {
  if (Bi() === Ye.reactNative && typeof V < "u" && typeof (V == null ? void 0 : V.Platform) < "u") {
    const { OS: t, Version: i } = V.Platform;
    return [t, i].join("-");
  }
  const r = Wd();
  if (r === null) return "unknown";
  const e = r.os ? r.os.replace(" ", "").toLowerCase() : "unknown";
  return r.type === "browser" ? [e, r.name, r.version].join("-") : [e, r.version].join("-");
}
function Dw() {
  var r;
  const e = Bi();
  return e === Ye.browser ? [e, ((r = Ft.getLocation()) == null ? void 0 : r.host) || "unknown"].join(":") : e;
}
function el(r, e, t) {
  const i = $w(),
    s = Dw();
  return [[r, e].join("-"), [bw, t].join("-"), i, s].join("/");
}
function Sw({
  protocol: r,
  version: e,
  relayUrl: t,
  sdkVersion: i,
  auth: s,
  projectId: n,
  useOnCloseEvent: o,
  bundleId: a,
  packageName: c,
}) {
  const h = t.split("?"),
    u = el(r, e, i),
    l = { auth: s, ua: u, projectId: n, useOnCloseEvent: o, packageName: c || void 0, bundleId: a || void 0 },
    d = _w(h[1] || "", l);
  return h[0] + "?" + d;
}
function ar(r, e) {
  return r.filter((t) => e.includes(t)).length === r.length;
}
function Kn(r) {
  return Object.fromEntries(r.entries());
}
function Wn(r) {
  return new Map(Object.entries(r));
}
function tr(r = U.FIVE_MINUTES, e) {
  const t = U.toMiliseconds(r || U.FIVE_MINUTES);
  let i, s, n, o;
  return {
    resolve: (a) => {
      n && i && (clearTimeout(n), i(a), (o = Promise.resolve(a)));
    },
    reject: (a) => {
      n && s && (clearTimeout(n), s(a));
    },
    done: () =>
      new Promise((a, c) => {
        if (o) return a(o);
        ((n = setTimeout(() => {
          const h = new Error(e);
          ((o = Promise.reject(h)), c(h));
        }, t)),
          (i = a),
          (s = c));
      }),
  };
}
function Kt(r, e, t) {
  return new Promise(async (i, s) => {
    const n = setTimeout(() => s(new Error(t)), e);
    try {
      const o = await r;
      i(o);
    } catch (o) {
      s(o);
    }
    clearTimeout(n);
  });
}
function tl(r, e) {
  if (typeof e == "string" && e.startsWith(`${r}:`)) return e;
  if (r.toLowerCase() === "topic") {
    if (typeof e != "string") throw new Error('Value must be "string" for expirer target type: topic');
    return `topic:${e}`;
  } else if (r.toLowerCase() === "id") {
    if (typeof e != "number") throw new Error('Value must be "number" for expirer target type: id');
    return `id:${e}`;
  }
  throw new Error(`Unknown expirer target type: ${r}`);
}
function Ow(r) {
  return tl("topic", r);
}
function Pw(r) {
  return tl("id", r);
}
function rl(r) {
  const [e, t] = r.split(":"),
    i = { id: void 0, topic: void 0 };
  if (e === "topic" && typeof t == "string") i.topic = t;
  else if (e === "id" && Number.isInteger(Number(t))) i.id = Number(t);
  else throw new Error(`Invalid target, expected id:number or topic:string, got ${e}:${t}`);
  return i;
}
function pe(r, e) {
  return U.fromMiliseconds(Date.now() + U.toMiliseconds(r));
}
function Ht(r) {
  return Date.now() >= U.toMiliseconds(r);
}
function ee(r, e) {
  return `${r}${e ? `:${e}` : ""}`;
}
function Dt(r = [], e = []) {
  return [...new Set([...r, ...e])];
}
async function Aw({ id: r, topic: e, wcDeepLink: t }) {
  var i;
  try {
    if (!t) return;
    const s = typeof t == "string" ? JSON.parse(t) : t,
      n = s == null ? void 0 : s.href;
    if (typeof n != "string") return;
    const o = xw(n, r, e),
      a = Bi();
    if (a === Ye.browser) {
      if (!((i = Ft.getDocument()) != null && i.hasFocus())) {
        console.warn("Document does not have focus, skipping deeplink.");
        return;
      }
      Cw(o);
    } else a === Ye.reactNative && typeof (V == null ? void 0 : V.Linking) < "u" && (await V.Linking.openURL(o));
  } catch (s) {
    console.error(s);
  }
}
function xw(r, e, t) {
  const i = `requestId=${e}&sessionTopic=${t}`;
  r.endsWith("/") && (r = r.slice(0, -1));
  let s = `${r}`;
  if (r.startsWith("https://t.me")) {
    const n = r.includes("?") ? "&startapp=" : "?startapp=";
    s = `${s}${n}${jw(i, !0)}`;
  } else s = `${s}/wc?${i}`;
  return s;
}
function Cw(r) {
  let e = "_self";
  (Nw() ? (e = "_top") : (Rw() || r.startsWith("https://") || r.startsWith("http://")) && (e = "_blank"),
    window.open(r, e, "noreferrer noopener"));
}
async function Tw(r, e) {
  let t = "";
  try {
    if (ti() && ((t = localStorage.getItem(e)), t)) return t;
    t = await r.getItem(e);
  } catch (i) {
    console.error(i);
  }
  return t;
}
function Ja(r, e) {
  if (!r.includes(e)) return null;
  const t = r.split(/([&,?,=])/),
    i = t.indexOf(e);
  return t[i + 2];
}
function Za() {
  return typeof crypto < "u" && crypto != null && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu, (r) => {
        const e = (Math.random() * 16) | 0;
        return (r === "x" ? e : (e & 3) | 8).toString(16);
      });
}
function To() {
  return typeof nt < "u" && uw.IS_VITEST === "true";
}
function Rw() {
  return (
    typeof window < "u" && (!!window.TelegramWebviewProxy || !!window.Telegram || !!window.TelegramWebviewProxyProto)
  );
}
function Nw() {
  try {
    return window.self !== window.top;
  } catch {
    return !1;
  }
}
function jw(r, e = !1) {
  const t = _e.from(r).toString("base64");
  return e ? t.replace(/[=]/g, "") : t;
}
function il(r) {
  return _e.from(r, "base64").toString("utf-8");
}
function Bw(r) {
  return new Promise((e) => setTimeout(e, r));
}
function Oi(r) {
  if (!Number.isSafeInteger(r) || r < 0) throw new Error("positive integer expected, got " + r);
}
function Uw(r) {
  return r instanceof Uint8Array || (ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array");
}
function Ui(r, ...e) {
  if (!Uw(r)) throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(r.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + r.length);
}
function Ro(r) {
  if (typeof r != "function" || typeof r.create != "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  (Oi(r.outputLen), Oi(r.blockLen));
}
function Vr(r, e = !0) {
  if (r.destroyed) throw new Error("Hash instance has been destroyed");
  if (e && r.finished) throw new Error("Hash#digest() has already been called");
}
function sl(r, e) {
  Ui(r);
  const t = e.outputLen;
  if (r.length < t) throw new Error("digestInto() expects output buffer of length at least " + t);
}
const Yi = BigInt(2 ** 32 - 1),
  Qa = BigInt(32);
function Fw(r, e = !1) {
  return e
    ? { h: Number(r & Yi), l: Number((r >> Qa) & Yi) }
    : { h: Number((r >> Qa) & Yi) | 0, l: Number(r & Yi) | 0 };
}
function kw(r, e = !1) {
  let t = new Uint32Array(r.length),
    i = new Uint32Array(r.length);
  for (let s = 0; s < r.length; s++) {
    const { h: n, l: o } = Fw(r[s], e);
    [t[s], i[s]] = [n, o];
  }
  return [t, i];
}
const Lw = (r, e, t) => (r << t) | (e >>> (32 - t)),
  qw = (r, e, t) => (e << t) | (r >>> (32 - t)),
  Mw = (r, e, t) => (e << (t - 32)) | (r >>> (64 - t)),
  zw = (r, e, t) => (r << (t - 32)) | (e >>> (64 - t)),
  $r = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
function Hw(r) {
  return new Uint32Array(r.buffer, r.byteOffset, Math.floor(r.byteLength / 4));
}
function hn(r) {
  return new DataView(r.buffer, r.byteOffset, r.byteLength);
}
function mt(r, e) {
  return (r << (32 - e)) | (r >>> e);
}
const Xa = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function Vw(r) {
  return ((r << 24) & 4278190080) | ((r << 8) & 16711680) | ((r >>> 8) & 65280) | ((r >>> 24) & 255);
}
function ec(r) {
  for (let e = 0; e < r.length; e++) r[e] = Vw(r[e]);
}
function Kw(r) {
  if (typeof r != "string") throw new Error("utf8ToBytes expected string, got " + typeof r);
  return new Uint8Array(new TextEncoder().encode(r));
}
function Kr(r) {
  return (typeof r == "string" && (r = Kw(r)), Ui(r), r);
}
function Ww(...r) {
  let e = 0;
  for (let i = 0; i < r.length; i++) {
    const s = r[i];
    (Ui(s), (e += s.length));
  }
  const t = new Uint8Array(e);
  for (let i = 0, s = 0; i < r.length; i++) {
    const n = r[i];
    (t.set(n, s), (s += n.length));
  }
  return t;
}
let No = class {
  clone() {
    return this._cloneInto();
  }
};
function nl(r) {
  const e = (i) => r().update(Kr(i)).digest(),
    t = r();
  return ((e.outputLen = t.outputLen), (e.blockLen = t.blockLen), (e.create = () => r()), e);
}
function ri(r = 32) {
  if ($r && typeof $r.getRandomValues == "function") return $r.getRandomValues(new Uint8Array(r));
  if ($r && typeof $r.randomBytes == "function") return $r.randomBytes(r);
  throw new Error("crypto.getRandomValues must be defined");
}
const ol = [],
  al = [],
  cl = [],
  Gw = BigInt(0),
  li = BigInt(1),
  Yw = BigInt(2),
  Jw = BigInt(7),
  Zw = BigInt(256),
  Qw = BigInt(113);
for (let r = 0, e = li, t = 1, i = 0; r < 24; r++) {
  (([t, i] = [i, (2 * t + 3 * i) % 5]), ol.push(2 * (5 * i + t)), al.push((((r + 1) * (r + 2)) / 2) % 64));
  let s = Gw;
  for (let n = 0; n < 7; n++)
    ((e = ((e << li) ^ ((e >> Jw) * Qw)) % Zw), e & Yw && (s ^= li << ((li << BigInt(n)) - li)));
  cl.push(s);
}
const [Xw, eb] = kw(cl, !0),
  tc = (r, e, t) => (t > 32 ? Mw(r, e, t) : Lw(r, e, t)),
  rc = (r, e, t) => (t > 32 ? zw(r, e, t) : qw(r, e, t));
function tb(r, e = 24) {
  const t = new Uint32Array(10);
  for (let i = 24 - e; i < 24; i++) {
    for (let o = 0; o < 10; o++) t[o] = r[o] ^ r[o + 10] ^ r[o + 20] ^ r[o + 30] ^ r[o + 40];
    for (let o = 0; o < 10; o += 2) {
      const a = (o + 8) % 10,
        c = (o + 2) % 10,
        h = t[c],
        u = t[c + 1],
        l = tc(h, u, 1) ^ t[a],
        d = rc(h, u, 1) ^ t[a + 1];
      for (let f = 0; f < 50; f += 10) ((r[o + f] ^= l), (r[o + f + 1] ^= d));
    }
    let s = r[2],
      n = r[3];
    for (let o = 0; o < 24; o++) {
      const a = al[o],
        c = tc(s, n, a),
        h = rc(s, n, a),
        u = ol[o];
      ((s = r[u]), (n = r[u + 1]), (r[u] = c), (r[u + 1] = h));
    }
    for (let o = 0; o < 50; o += 10) {
      for (let a = 0; a < 10; a++) t[a] = r[o + a];
      for (let a = 0; a < 10; a++) r[o + a] ^= ~t[(a + 2) % 10] & t[(a + 4) % 10];
    }
    ((r[0] ^= Xw[i]), (r[1] ^= eb[i]));
  }
  t.fill(0);
}
let rb = class hl extends No {
  constructor(e, t, i, s = !1, n = 24) {
    if (
      (super(),
      (this.blockLen = e),
      (this.suffix = t),
      (this.outputLen = i),
      (this.enableXOF = s),
      (this.rounds = n),
      (this.pos = 0),
      (this.posOut = 0),
      (this.finished = !1),
      (this.destroyed = !1),
      Oi(i),
      0 >= this.blockLen || this.blockLen >= 200)
    )
      throw new Error("Sha3 supports only keccak-f1600 function");
    ((this.state = new Uint8Array(200)), (this.state32 = Hw(this.state)));
  }
  keccak() {
    (Xa || ec(this.state32), tb(this.state32, this.rounds), Xa || ec(this.state32), (this.posOut = 0), (this.pos = 0));
  }
  update(e) {
    Vr(this);
    const { blockLen: t, state: i } = this;
    e = Kr(e);
    const s = e.length;
    for (let n = 0; n < s; ) {
      const o = Math.min(t - this.pos, s - n);
      for (let a = 0; a < o; a++) i[this.pos++] ^= e[n++];
      this.pos === t && this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished) return;
    this.finished = !0;
    const { state: e, suffix: t, pos: i, blockLen: s } = this;
    ((e[i] ^= t), (t & 128) !== 0 && i === s - 1 && this.keccak(), (e[s - 1] ^= 128), this.keccak());
  }
  writeInto(e) {
    (Vr(this, !1), Ui(e), this.finish());
    const t = this.state,
      { blockLen: i } = this;
    for (let s = 0, n = e.length; s < n; ) {
      this.posOut >= i && this.keccak();
      const o = Math.min(i - this.posOut, n - s);
      (e.set(t.subarray(this.posOut, this.posOut + o), s), (this.posOut += o), (s += o));
    }
    return e;
  }
  xofInto(e) {
    if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
    return this.writeInto(e);
  }
  xof(e) {
    return (Oi(e), this.xofInto(new Uint8Array(e)));
  }
  digestInto(e) {
    if ((sl(e, this), this.finished)) throw new Error("digest() was already called");
    return (this.writeInto(e), this.destroy(), e);
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    ((this.destroyed = !0), this.state.fill(0));
  }
  _cloneInto(e) {
    const { blockLen: t, suffix: i, outputLen: s, rounds: n, enableXOF: o } = this;
    return (
      e || (e = new hl(t, i, s, o, n)),
      e.state32.set(this.state32),
      (e.pos = this.pos),
      (e.posOut = this.posOut),
      (e.finished = this.finished),
      (e.rounds = n),
      (e.suffix = i),
      (e.outputLen = s),
      (e.enableXOF = o),
      (e.destroyed = this.destroyed),
      e
    );
  }
};
const ib = (r, e, t) => nl(() => new rb(e, r, t)),
  sb = ib(1, 136, 256 / 8),
  nb = "https://rpc.walletconnect.org/v1";
function ul(r) {
  const e = `Ethereum Signed Message:
${r.length}`,
    t = new TextEncoder().encode(e + r);
  return "0x" + _e.from(sb(t)).toString("hex");
}
async function ob(r, e, t, i, s, n) {
  switch (t.t) {
    case "eip191":
      return await ab(r, e, t.s);
    case "eip1271":
      return await cb(r, e, t.s, i, s, n);
    default:
      throw new Error(`verifySignature failed: Attempted to verify CacaoSignature with unknown type: ${t.t}`);
  }
}
async function ab(r, e, t) {
  return (await mf({ hash: ul(e), signature: t })).toLowerCase() === r.toLowerCase();
}
async function cb(r, e, t, i, s, n) {
  const o = Hr(i);
  if (!o.namespace || !o.reference)
    throw new Error(`isValidEip1271Signature failed: chainId must be in CAIP-2 format, received: ${i}`);
  try {
    const a = "0x1626ba7e",
      c = "0000000000000000000000000000000000000000000000000000000000000040",
      h = "0000000000000000000000000000000000000000000000000000000000000041",
      u = t.substring(2),
      l = ul(e).substring(2),
      d = a + l + c + h + u,
      f = await fetch(`${n || nb}/?chainId=${i}&projectId=${s}`, {
        method: "POST",
        body: JSON.stringify({ id: hb(), jsonrpc: "2.0", method: "eth_call", params: [{ to: r, data: d }, "latest"] }),
      }),
      { result: p } = await f.json();
    return p ? p.slice(0, a.length).toLowerCase() === a.toLowerCase() : !1;
  } catch (a) {
    return (console.error("isValidEip1271Signature: ", a), !1);
  }
}
function hb() {
  return Date.now() + Math.floor(Math.random() * 1e3);
}
function ub(r) {
  const e = atob(r),
    t = new Uint8Array(e.length);
  for (let o = 0; o < e.length; o++) t[o] = e.charCodeAt(o);
  const i = t[0];
  if (i === 0) throw new Error("No signatures found");
  const s = 1 + i * 64;
  if (t.length < s) throw new Error("Transaction data too short for claimed signature count");
  if (t.length < 100) throw new Error("Transaction too short");
  const n = _e.from(r, "base64").slice(1, 65);
  return vf.encode(n);
}
var lb = Object.defineProperty,
  db = Object.defineProperties,
  pb = Object.getOwnPropertyDescriptors,
  ic = Object.getOwnPropertySymbols,
  fb = Object.prototype.hasOwnProperty,
  gb = Object.prototype.propertyIsEnumerable,
  sc = (r, e, t) => (e in r ? lb(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  yb = (r, e) => {
    for (var t in e || (e = {})) fb.call(e, t) && sc(r, t, e[t]);
    if (ic) for (var t of ic(e)) gb.call(e, t) && sc(r, t, e[t]);
    return r;
  },
  mb = (r, e) => db(r, pb(e));
const wb = "did:pkh:",
  jo = (r) => (r == null ? void 0 : r.split(":")),
  bb = (r) => {
    const e = r && jo(r);
    if (e) return r.includes(wb) ? e[3] : e[1];
  },
  Gn = (r) => {
    const e = r && jo(r);
    if (e) return e[2] + ":" + e[3];
  },
  bs = (r) => {
    const e = r && jo(r);
    if (e) return e.pop();
  };
async function nc(r) {
  const { cacao: e, projectId: t } = r,
    { s: i, p: s } = e,
    n = ll(s, s.iss),
    o = bs(s.iss);
  return await ob(o, n, i, Gn(s.iss), t);
}
const ll = (r, e) => {
  const t = `${r.domain} wants you to sign in with your Ethereum account:`,
    i = bs(e);
  if (!r.aud && !r.uri) throw new Error("Either `aud` or `uri` is required to construct the message");
  let s = r.statement || void 0;
  const n = `URI: ${r.aud || r.uri}`,
    o = `Version: ${r.version}`,
    a = `Chain ID: ${bb(e)}`,
    c = `Nonce: ${r.nonce}`,
    h = `Issued At: ${r.iat}`,
    u = r.exp ? `Expiration Time: ${r.exp}` : void 0,
    l = r.nbf ? `Not Before: ${r.nbf}` : void 0,
    d = r.requestId ? `Request ID: ${r.requestId}` : void 0,
    f = r.resources
      ? `Resources:${r.resources
          .map(
            (g) => `
- ${g}`,
          )
          .join("")}`
      : void 0,
    p = hs(r.resources);
  if (p) {
    const g = Pi(p);
    s = Pb(s, g);
  }
  return [t, i, "", s, "", n, o, a, c, h, u, l, d, f].filter((g) => g != null).join(`
`);
};
function vb(r) {
  return _e.from(JSON.stringify(r)).toString("base64");
}
function Eb(r) {
  return JSON.parse(_e.from(r, "base64").toString("utf-8"));
}
function dr(r) {
  if (!r) throw new Error("No recap provided, value is undefined");
  if (!r.att) throw new Error("No `att` property found");
  const e = Object.keys(r.att);
  if (!(e != null && e.length)) throw new Error("No resources found in `att` property");
  e.forEach((t) => {
    const i = r.att[t];
    if (Array.isArray(i)) throw new Error(`Resource must be an object: ${t}`);
    if (typeof i != "object") throw new Error(`Resource must be an object: ${t}`);
    if (!Object.keys(i).length) throw new Error(`Resource object is empty: ${t}`);
    Object.keys(i).forEach((s) => {
      const n = i[s];
      if (!Array.isArray(n)) throw new Error(`Ability limits ${s} must be an array of objects, found: ${n}`);
      if (!n.length) throw new Error(`Value of ${s} is empty array, must be an array with objects`);
      n.forEach((o) => {
        if (typeof o != "object") throw new Error(`Ability limits (${s}) must be an array of objects, found: ${o}`);
      });
    });
  });
}
function _b(r, e, t, i = {}) {
  return (t == null || t.sort((s, n) => s.localeCompare(n)), { att: { [r]: Ib(e, t, i) } });
}
function Ib(r, e, t = {}) {
  e = e == null ? void 0 : e.sort((s, n) => s.localeCompare(n));
  const i = e.map((s) => ({ [`${r}/${s}`]: [t] }));
  return Object.assign({}, ...i);
}
function dl(r) {
  return (dr(r), `urn:recap:${vb(r).replace(/=/g, "")}`);
}
function Pi(r) {
  const e = Eb(r.replace("urn:recap:", ""));
  return (dr(e), e);
}
function $b(r, e, t) {
  const i = _b(r, e, t);
  return dl(i);
}
function Db(r) {
  return r && r.includes("urn:recap:");
}
function Sb(r, e) {
  const t = Pi(r),
    i = Pi(e),
    s = Ob(t, i);
  return dl(s);
}
function Ob(r, e) {
  (dr(r), dr(e));
  const t = Object.keys(r.att)
      .concat(Object.keys(e.att))
      .sort((s, n) => s.localeCompare(n)),
    i = { att: {} };
  return (
    t.forEach((s) => {
      var n, o;
      Object.keys(((n = r.att) == null ? void 0 : n[s]) || {})
        .concat(Object.keys(((o = e.att) == null ? void 0 : o[s]) || {}))
        .sort((a, c) => a.localeCompare(c))
        .forEach((a) => {
          var c, h;
          i.att[s] = mb(yb({}, i.att[s]), {
            [a]: ((c = r.att[s]) == null ? void 0 : c[a]) || ((h = e.att[s]) == null ? void 0 : h[a]),
          });
        });
    }),
    i
  );
}
function Pb(r = "", e) {
  dr(e);
  const t = "I further authorize the stated URI to perform the following actions on my behalf: ";
  if (r.includes(t)) return r;
  const i = [];
  let s = 0;
  Object.keys(e.att).forEach((a) => {
    const c = Object.keys(e.att[a]).map((l) => ({ ability: l.split("/")[0], action: l.split("/")[1] }));
    c.sort((l, d) => l.action.localeCompare(d.action));
    const h = {};
    c.forEach((l) => {
      (h[l.ability] || (h[l.ability] = []), h[l.ability].push(l.action));
    });
    const u = Object.keys(h).map((l) => (s++, `(${s}) '${l}': '${h[l].join("', '")}' for '${a}'.`));
    i.push(u.join(", ").replace(".,", "."));
  });
  const n = i.join(" "),
    o = `${t}${n}`;
  return `${r ? r + " " : ""}${o}`;
}
function oc(r) {
  var e;
  const t = Pi(r);
  dr(t);
  const i = (e = t.att) == null ? void 0 : e.eip155;
  return i ? Object.keys(i).map((s) => s.split("/")[1]) : [];
}
function ac(r) {
  const e = Pi(r);
  dr(e);
  const t = [];
  return (
    Object.values(e.att).forEach((i) => {
      Object.values(i).forEach((s) => {
        var n;
        (n = s == null ? void 0 : s[0]) != null && n.chains && t.push(s[0].chains);
      });
    }),
    [...new Set(t.flat())]
  );
}
function hs(r) {
  if (!r) return;
  const e = r == null ? void 0 : r[r.length - 1];
  return Db(e) ? e : void 0;
}
function un(r) {
  if (!Number.isSafeInteger(r) || r < 0) throw new Error("positive integer expected, got " + r);
}
function pl(r) {
  return r instanceof Uint8Array || (ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array");
}
function Ge(r, ...e) {
  if (!pl(r)) throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(r.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + r.length);
}
function cc(r, e = !0) {
  if (r.destroyed) throw new Error("Hash instance has been destroyed");
  if (e && r.finished) throw new Error("Hash#digest() has already been called");
}
function Ab(r, e) {
  Ge(r);
  const t = e.outputLen;
  if (r.length < t) throw new Error("digestInto() expects output buffer of length at least " + t);
}
function hc(r) {
  if (typeof r != "boolean") throw new Error(`boolean expected, not ${r}`);
}
const Gt = (r) => new Uint32Array(r.buffer, r.byteOffset, Math.floor(r.byteLength / 4)),
  xb = (r) => new DataView(r.buffer, r.byteOffset, r.byteLength),
  Cb = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!Cb) throw new Error("Non little-endian hardware is not supported");
function Tb(r) {
  if (typeof r != "string") throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(r));
}
function Yn(r) {
  if (typeof r == "string") r = Tb(r);
  else if (pl(r)) r = Jn(r);
  else throw new Error("Uint8Array expected, got " + typeof r);
  return r;
}
function Rb(r, e) {
  if (e == null || typeof e != "object") throw new Error("options must be defined");
  return Object.assign(r, e);
}
function Nb(r, e) {
  if (r.length !== e.length) return !1;
  let t = 0;
  for (let i = 0; i < r.length; i++) t |= r[i] ^ e[i];
  return t === 0;
}
const jb = (r, e) => {
  function t(i, ...s) {
    if ((Ge(i), r.nonceLength !== void 0)) {
      const h = s[0];
      if (!h) throw new Error("nonce / iv required");
      r.varSizeNonce ? Ge(h) : Ge(h, r.nonceLength);
    }
    const n = r.tagLength;
    n && s[1] !== void 0 && Ge(s[1]);
    const o = e(i, ...s),
      a = (h, u) => {
        if (u !== void 0) {
          if (h !== 2) throw new Error("cipher output not supported");
          Ge(u);
        }
      };
    let c = !1;
    return {
      encrypt(h, u) {
        if (c) throw new Error("cannot encrypt() twice with same key + nonce");
        return ((c = !0), Ge(h), a(o.encrypt.length, u), o.encrypt(h, u));
      },
      decrypt(h, u) {
        if ((Ge(h), n && h.length < n)) throw new Error("invalid ciphertext length: smaller than tagLength=" + n);
        return (a(o.decrypt.length, u), o.decrypt(h, u));
      },
    };
  }
  return (Object.assign(t, r), t);
};
function uc(r, e, t = !0) {
  if (e === void 0) return new Uint8Array(r);
  if (e.length !== r) throw new Error("invalid output length, expected " + r + ", got: " + e.length);
  if (t && !Bb(e)) throw new Error("invalid output, must be aligned");
  return e;
}
function lc(r, e, t, i) {
  if (typeof r.setBigUint64 == "function") return r.setBigUint64(e, t, i);
  const s = BigInt(32),
    n = BigInt(4294967295),
    o = Number((t >> s) & n),
    a = Number(t & n);
  (r.setUint32(e + 4, o, i), r.setUint32(e + 0, a, i));
}
function Bb(r) {
  return r.byteOffset % 4 === 0;
}
function Jn(r) {
  return Uint8Array.from(r);
}
function Wr(...r) {
  for (let e = 0; e < r.length; e++) r[e].fill(0);
}
const fl = (r) => Uint8Array.from(r.split("").map((e) => e.charCodeAt(0))),
  Ub = fl("expand 16-byte k"),
  Fb = fl("expand 32-byte k"),
  kb = Gt(Ub),
  Lb = Gt(Fb);
function Z(r, e) {
  return (r << e) | (r >>> (32 - e));
}
function Zn(r) {
  return r.byteOffset % 4 === 0;
}
const Ji = 64,
  qb = 16,
  gl = 2 ** 32 - 1,
  dc = new Uint32Array();
function Mb(r, e, t, i, s, n, o, a) {
  const c = s.length,
    h = new Uint8Array(Ji),
    u = Gt(h),
    l = Zn(s) && Zn(n),
    d = l ? Gt(s) : dc,
    f = l ? Gt(n) : dc;
  for (let p = 0; p < c; o++) {
    if ((r(e, t, i, u, o, a), o >= gl)) throw new Error("arx: counter overflow");
    const g = Math.min(Ji, c - p);
    if (l && g === Ji) {
      const w = p / 4;
      if (p % 4 !== 0) throw new Error("arx: invalid block position");
      for (let E = 0, b; E < qb; E++) ((b = w + E), (f[b] = d[b] ^ u[E]));
      p += Ji;
      continue;
    }
    for (let w = 0, E; w < g; w++) ((E = p + w), (n[E] = s[E] ^ h[w]));
    p += g;
  }
}
function zb(r, e) {
  const {
    allowShortKeys: t,
    extendNonceFn: i,
    counterLength: s,
    counterRight: n,
    rounds: o,
  } = Rb({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, e);
  if (typeof r != "function") throw new Error("core must be a function");
  return (
    un(s),
    un(o),
    hc(n),
    hc(t),
    (a, c, h, u, l = 0) => {
      (Ge(a), Ge(c), Ge(h));
      const d = h.length;
      if ((u === void 0 && (u = new Uint8Array(d)), Ge(u), un(l), l < 0 || l >= gl))
        throw new Error("arx: counter overflow");
      if (u.length < d) throw new Error(`arx: output (${u.length}) is shorter than data (${d})`);
      const f = [];
      let p = a.length,
        g,
        w;
      if (p === 32) (f.push((g = Jn(a))), (w = Lb));
      else if (p === 16 && t) ((g = new Uint8Array(32)), g.set(a), g.set(a, 16), (w = kb), f.push(g));
      else throw new Error(`arx: invalid 32-byte key, got length=${p}`);
      Zn(c) || f.push((c = Jn(c)));
      const E = Gt(g);
      if (i) {
        if (c.length !== 24) throw new Error("arx: extended nonce must be 24 bytes");
        (i(w, E, Gt(c.subarray(0, 16)), E), (c = c.subarray(16)));
      }
      const b = 16 - s;
      if (b !== c.length) throw new Error(`arx: nonce must be ${b} or 16 bytes`);
      if (b !== 12) {
        const A = new Uint8Array(12);
        (A.set(c, n ? 0 : 12 - c.length), (c = A), f.push(c));
      }
      const _ = Gt(c);
      return (Mb(r, w, E, _, h, u, l, o), Wr(...f), u);
    }
  );
}
const $e = (r, e) => (r[e++] & 255) | ((r[e++] & 255) << 8);
class Hb {
  constructor(e) {
    ((this.blockLen = 16),
      (this.outputLen = 16),
      (this.buffer = new Uint8Array(16)),
      (this.r = new Uint16Array(10)),
      (this.h = new Uint16Array(10)),
      (this.pad = new Uint16Array(8)),
      (this.pos = 0),
      (this.finished = !1),
      (e = Yn(e)),
      Ge(e, 32));
    const t = $e(e, 0),
      i = $e(e, 2),
      s = $e(e, 4),
      n = $e(e, 6),
      o = $e(e, 8),
      a = $e(e, 10),
      c = $e(e, 12),
      h = $e(e, 14);
    ((this.r[0] = t & 8191),
      (this.r[1] = ((t >>> 13) | (i << 3)) & 8191),
      (this.r[2] = ((i >>> 10) | (s << 6)) & 7939),
      (this.r[3] = ((s >>> 7) | (n << 9)) & 8191),
      (this.r[4] = ((n >>> 4) | (o << 12)) & 255),
      (this.r[5] = (o >>> 1) & 8190),
      (this.r[6] = ((o >>> 14) | (a << 2)) & 8191),
      (this.r[7] = ((a >>> 11) | (c << 5)) & 8065),
      (this.r[8] = ((c >>> 8) | (h << 8)) & 8191),
      (this.r[9] = (h >>> 5) & 127));
    for (let u = 0; u < 8; u++) this.pad[u] = $e(e, 16 + 2 * u);
  }
  process(e, t, i = !1) {
    const s = i ? 0 : 2048,
      { h: n, r: o } = this,
      a = o[0],
      c = o[1],
      h = o[2],
      u = o[3],
      l = o[4],
      d = o[5],
      f = o[6],
      p = o[7],
      g = o[8],
      w = o[9],
      E = $e(e, t + 0),
      b = $e(e, t + 2),
      _ = $e(e, t + 4),
      A = $e(e, t + 6),
      T = $e(e, t + 8),
      v = $e(e, t + 10),
      I = $e(e, t + 12),
      O = $e(e, t + 14);
    let D = n[0] + (E & 8191),
      j = n[1] + (((E >>> 13) | (b << 3)) & 8191),
      N = n[2] + (((b >>> 10) | (_ << 6)) & 8191),
      B = n[3] + (((_ >>> 7) | (A << 9)) & 8191),
      M = n[4] + (((A >>> 4) | (T << 12)) & 8191),
      P = n[5] + ((T >>> 1) & 8191),
      y = n[6] + (((T >>> 14) | (v << 2)) & 8191),
      m = n[7] + (((v >>> 11) | (I << 5)) & 8191),
      $ = n[8] + (((I >>> 8) | (O << 8)) & 8191),
      x = n[9] + ((O >>> 5) | s),
      S = 0,
      C = S + D * a + j * (5 * w) + N * (5 * g) + B * (5 * p) + M * (5 * f);
    ((S = C >>> 13),
      (C &= 8191),
      (C += P * (5 * d) + y * (5 * l) + m * (5 * u) + $ * (5 * h) + x * (5 * c)),
      (S += C >>> 13),
      (C &= 8191));
    let k = S + D * c + j * a + N * (5 * w) + B * (5 * g) + M * (5 * p);
    ((S = k >>> 13),
      (k &= 8191),
      (k += P * (5 * f) + y * (5 * d) + m * (5 * l) + $ * (5 * u) + x * (5 * h)),
      (S += k >>> 13),
      (k &= 8191));
    let q = S + D * h + j * c + N * a + B * (5 * w) + M * (5 * g);
    ((S = q >>> 13),
      (q &= 8191),
      (q += P * (5 * p) + y * (5 * f) + m * (5 * d) + $ * (5 * l) + x * (5 * u)),
      (S += q >>> 13),
      (q &= 8191));
    let z = S + D * u + j * h + N * c + B * a + M * (5 * w);
    ((S = z >>> 13),
      (z &= 8191),
      (z += P * (5 * g) + y * (5 * p) + m * (5 * f) + $ * (5 * d) + x * (5 * l)),
      (S += z >>> 13),
      (z &= 8191));
    let L = S + D * l + j * u + N * h + B * c + M * a;
    ((S = L >>> 13),
      (L &= 8191),
      (L += P * (5 * w) + y * (5 * g) + m * (5 * p) + $ * (5 * f) + x * (5 * d)),
      (S += L >>> 13),
      (L &= 8191));
    let H = S + D * d + j * l + N * u + B * h + M * c;
    ((S = H >>> 13),
      (H &= 8191),
      (H += P * a + y * (5 * w) + m * (5 * g) + $ * (5 * p) + x * (5 * f)),
      (S += H >>> 13),
      (H &= 8191));
    let K = S + D * f + j * d + N * l + B * u + M * h;
    ((S = K >>> 13),
      (K &= 8191),
      (K += P * c + y * a + m * (5 * w) + $ * (5 * g) + x * (5 * p)),
      (S += K >>> 13),
      (K &= 8191));
    let oe = S + D * p + j * f + N * d + B * l + M * u;
    ((S = oe >>> 13),
      (oe &= 8191),
      (oe += P * h + y * c + m * a + $ * (5 * w) + x * (5 * g)),
      (S += oe >>> 13),
      (oe &= 8191));
    let te = S + D * g + j * p + N * f + B * d + M * l;
    ((S = te >>> 13),
      (te &= 8191),
      (te += P * u + y * h + m * c + $ * a + x * (5 * w)),
      (S += te >>> 13),
      (te &= 8191));
    let J = S + D * w + j * g + N * p + B * f + M * d;
    ((S = J >>> 13),
      (J &= 8191),
      (J += P * l + y * u + m * h + $ * c + x * a),
      (S += J >>> 13),
      (J &= 8191),
      (S = ((S << 2) + S) | 0),
      (S = (S + C) | 0),
      (C = S & 8191),
      (S = S >>> 13),
      (k += S),
      (n[0] = C),
      (n[1] = k),
      (n[2] = q),
      (n[3] = z),
      (n[4] = L),
      (n[5] = H),
      (n[6] = K),
      (n[7] = oe),
      (n[8] = te),
      (n[9] = J));
  }
  finalize() {
    const { h: e, pad: t } = this,
      i = new Uint16Array(10);
    let s = e[1] >>> 13;
    e[1] &= 8191;
    for (let a = 2; a < 10; a++) ((e[a] += s), (s = e[a] >>> 13), (e[a] &= 8191));
    ((e[0] += s * 5),
      (s = e[0] >>> 13),
      (e[0] &= 8191),
      (e[1] += s),
      (s = e[1] >>> 13),
      (e[1] &= 8191),
      (e[2] += s),
      (i[0] = e[0] + 5),
      (s = i[0] >>> 13),
      (i[0] &= 8191));
    for (let a = 1; a < 10; a++) ((i[a] = e[a] + s), (s = i[a] >>> 13), (i[a] &= 8191));
    i[9] -= 8192;
    let n = (s ^ 1) - 1;
    for (let a = 0; a < 10; a++) i[a] &= n;
    n = ~n;
    for (let a = 0; a < 10; a++) e[a] = (e[a] & n) | i[a];
    ((e[0] = (e[0] | (e[1] << 13)) & 65535),
      (e[1] = ((e[1] >>> 3) | (e[2] << 10)) & 65535),
      (e[2] = ((e[2] >>> 6) | (e[3] << 7)) & 65535),
      (e[3] = ((e[3] >>> 9) | (e[4] << 4)) & 65535),
      (e[4] = ((e[4] >>> 12) | (e[5] << 1) | (e[6] << 14)) & 65535),
      (e[5] = ((e[6] >>> 2) | (e[7] << 11)) & 65535),
      (e[6] = ((e[7] >>> 5) | (e[8] << 8)) & 65535),
      (e[7] = ((e[8] >>> 8) | (e[9] << 5)) & 65535));
    let o = e[0] + t[0];
    e[0] = o & 65535;
    for (let a = 1; a < 8; a++) ((o = (((e[a] + t[a]) | 0) + (o >>> 16)) | 0), (e[a] = o & 65535));
    Wr(i);
  }
  update(e) {
    cc(this);
    const { buffer: t, blockLen: i } = this;
    e = Yn(e);
    const s = e.length;
    for (let n = 0; n < s; ) {
      const o = Math.min(i - this.pos, s - n);
      if (o === i) {
        for (; i <= s - n; n += i) this.process(e, n);
        continue;
      }
      (t.set(e.subarray(n, n + o), this.pos),
        (this.pos += o),
        (n += o),
        this.pos === i && (this.process(t, 0, !1), (this.pos = 0)));
    }
    return this;
  }
  destroy() {
    Wr(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(e) {
    (cc(this), Ab(e, this), (this.finished = !0));
    const { buffer: t, h: i } = this;
    let { pos: s } = this;
    if (s) {
      for (t[s++] = 1; s < 16; s++) t[s] = 0;
      this.process(t, 0, !0);
    }
    this.finalize();
    let n = 0;
    for (let o = 0; o < 8; o++) ((e[n++] = i[o] >>> 0), (e[n++] = i[o] >>> 8));
    return e;
  }
  digest() {
    const { buffer: e, outputLen: t } = this;
    this.digestInto(e);
    const i = e.slice(0, t);
    return (this.destroy(), i);
  }
}
function Vb(r) {
  const e = (i, s) => r(s).update(Yn(i)).digest(),
    t = r(new Uint8Array(32));
  return ((e.outputLen = t.outputLen), (e.blockLen = t.blockLen), (e.create = (i) => r(i)), e);
}
const Kb = Vb((r) => new Hb(r));
function Wb(r, e, t, i, s, n = 20) {
  let o = r[0],
    a = r[1],
    c = r[2],
    h = r[3],
    u = e[0],
    l = e[1],
    d = e[2],
    f = e[3],
    p = e[4],
    g = e[5],
    w = e[6],
    E = e[7],
    b = s,
    _ = t[0],
    A = t[1],
    T = t[2],
    v = o,
    I = a,
    O = c,
    D = h,
    j = u,
    N = l,
    B = d,
    M = f,
    P = p,
    y = g,
    m = w,
    $ = E,
    x = b,
    S = _,
    C = A,
    k = T;
  for (let z = 0; z < n; z += 2)
    ((v = (v + j) | 0),
      (x = Z(x ^ v, 16)),
      (P = (P + x) | 0),
      (j = Z(j ^ P, 12)),
      (v = (v + j) | 0),
      (x = Z(x ^ v, 8)),
      (P = (P + x) | 0),
      (j = Z(j ^ P, 7)),
      (I = (I + N) | 0),
      (S = Z(S ^ I, 16)),
      (y = (y + S) | 0),
      (N = Z(N ^ y, 12)),
      (I = (I + N) | 0),
      (S = Z(S ^ I, 8)),
      (y = (y + S) | 0),
      (N = Z(N ^ y, 7)),
      (O = (O + B) | 0),
      (C = Z(C ^ O, 16)),
      (m = (m + C) | 0),
      (B = Z(B ^ m, 12)),
      (O = (O + B) | 0),
      (C = Z(C ^ O, 8)),
      (m = (m + C) | 0),
      (B = Z(B ^ m, 7)),
      (D = (D + M) | 0),
      (k = Z(k ^ D, 16)),
      ($ = ($ + k) | 0),
      (M = Z(M ^ $, 12)),
      (D = (D + M) | 0),
      (k = Z(k ^ D, 8)),
      ($ = ($ + k) | 0),
      (M = Z(M ^ $, 7)),
      (v = (v + N) | 0),
      (k = Z(k ^ v, 16)),
      (m = (m + k) | 0),
      (N = Z(N ^ m, 12)),
      (v = (v + N) | 0),
      (k = Z(k ^ v, 8)),
      (m = (m + k) | 0),
      (N = Z(N ^ m, 7)),
      (I = (I + B) | 0),
      (x = Z(x ^ I, 16)),
      ($ = ($ + x) | 0),
      (B = Z(B ^ $, 12)),
      (I = (I + B) | 0),
      (x = Z(x ^ I, 8)),
      ($ = ($ + x) | 0),
      (B = Z(B ^ $, 7)),
      (O = (O + M) | 0),
      (S = Z(S ^ O, 16)),
      (P = (P + S) | 0),
      (M = Z(M ^ P, 12)),
      (O = (O + M) | 0),
      (S = Z(S ^ O, 8)),
      (P = (P + S) | 0),
      (M = Z(M ^ P, 7)),
      (D = (D + j) | 0),
      (C = Z(C ^ D, 16)),
      (y = (y + C) | 0),
      (j = Z(j ^ y, 12)),
      (D = (D + j) | 0),
      (C = Z(C ^ D, 8)),
      (y = (y + C) | 0),
      (j = Z(j ^ y, 7)));
  let q = 0;
  ((i[q++] = (o + v) | 0),
    (i[q++] = (a + I) | 0),
    (i[q++] = (c + O) | 0),
    (i[q++] = (h + D) | 0),
    (i[q++] = (u + j) | 0),
    (i[q++] = (l + N) | 0),
    (i[q++] = (d + B) | 0),
    (i[q++] = (f + M) | 0),
    (i[q++] = (p + P) | 0),
    (i[q++] = (g + y) | 0),
    (i[q++] = (w + m) | 0),
    (i[q++] = (E + $) | 0),
    (i[q++] = (b + x) | 0),
    (i[q++] = (_ + S) | 0),
    (i[q++] = (A + C) | 0),
    (i[q++] = (T + k) | 0));
}
const Gb = zb(Wb, { counterRight: !1, counterLength: 4, allowShortKeys: !1 }),
  Yb = new Uint8Array(16),
  pc = (r, e) => {
    r.update(e);
    const t = e.length % 16;
    t && r.update(Yb.subarray(t));
  },
  Jb = new Uint8Array(32);
function fc(r, e, t, i, s) {
  const n = r(e, t, Jb),
    o = Kb.create(n);
  (s && pc(o, s), pc(o, i));
  const a = new Uint8Array(16),
    c = xb(a);
  (lc(c, 0, BigInt(s ? s.length : 0), !0), lc(c, 8, BigInt(i.length), !0), o.update(a));
  const h = o.digest();
  return (Wr(n, a), h);
}
const Zb = (r) => (e, t, i) => ({
    encrypt(s, n) {
      const o = s.length;
      ((n = uc(o + 16, n, !1)), n.set(s));
      const a = n.subarray(0, -16);
      r(e, t, a, a, 1);
      const c = fc(r, e, t, a, i);
      return (n.set(c, o), Wr(c), n);
    },
    decrypt(s, n) {
      n = uc(s.length - 16, n, !1);
      const o = s.subarray(0, -16),
        a = s.subarray(-16),
        c = fc(r, e, t, o, i);
      if (!Nb(a, c)) throw new Error("invalid tag");
      return (n.set(s.subarray(0, -16)), r(e, t, n, n, 1), Wr(c), n);
    },
  }),
  yl = jb({ blockSize: 64, nonceLength: 12, tagLength: 16 }, Zb(Gb));
let ml = class extends No {
  constructor(e, t) {
    (super(), (this.finished = !1), (this.destroyed = !1), Ro(e));
    const i = Kr(t);
    if (((this.iHash = e.create()), typeof this.iHash.update != "function"))
      throw new Error("Expected instance of class which extends utils.Hash");
    ((this.blockLen = this.iHash.blockLen), (this.outputLen = this.iHash.outputLen));
    const s = this.blockLen,
      n = new Uint8Array(s);
    n.set(i.length > s ? e.create().update(i).digest() : i);
    for (let o = 0; o < n.length; o++) n[o] ^= 54;
    (this.iHash.update(n), (this.oHash = e.create()));
    for (let o = 0; o < n.length; o++) n[o] ^= 106;
    (this.oHash.update(n), n.fill(0));
  }
  update(e) {
    return (Vr(this), this.iHash.update(e), this);
  }
  digestInto(e) {
    (Vr(this),
      Ui(e, this.outputLen),
      (this.finished = !0),
      this.iHash.digestInto(e),
      this.oHash.update(e),
      this.oHash.digestInto(e),
      this.destroy());
  }
  digest() {
    const e = new Uint8Array(this.oHash.outputLen);
    return (this.digestInto(e), e);
  }
  _cloneInto(e) {
    e || (e = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash: t, iHash: i, finished: s, destroyed: n, blockLen: o, outputLen: a } = this;
    return (
      (e = e),
      (e.finished = s),
      (e.destroyed = n),
      (e.blockLen = o),
      (e.outputLen = a),
      (e.oHash = t._cloneInto(e.oHash)),
      (e.iHash = i._cloneInto(e.iHash)),
      e
    );
  }
  destroy() {
    ((this.destroyed = !0), this.oHash.destroy(), this.iHash.destroy());
  }
};
const Ts = (r, e, t) => new ml(r, e).update(t).digest();
Ts.create = (r, e) => new ml(r, e);
function Qb(r, e, t) {
  return (Ro(r), t === void 0 && (t = new Uint8Array(r.outputLen)), Ts(r, Kr(t), Kr(e)));
}
const ln = new Uint8Array([0]),
  gc = new Uint8Array();
function Xb(r, e, t, i = 32) {
  if ((Ro(r), Oi(i), i > 255 * r.outputLen)) throw new Error("Length should be <= 255*HashLen");
  const s = Math.ceil(i / r.outputLen);
  t === void 0 && (t = gc);
  const n = new Uint8Array(s * r.outputLen),
    o = Ts.create(r, e),
    a = o._cloneInto(),
    c = new Uint8Array(o.outputLen);
  for (let h = 0; h < s; h++)
    ((ln[0] = h + 1),
      a
        .update(h === 0 ? gc : c)
        .update(t)
        .update(ln)
        .digestInto(c),
      n.set(c, r.outputLen * h),
      o._cloneInto(a));
  return (o.destroy(), a.destroy(), c.fill(0), ln.fill(0), n.slice(0, i));
}
const ev = (r, e, t, i, s) => Xb(r, Qb(r, e, t), i, s);
function tv(r, e, t, i) {
  if (typeof r.setBigUint64 == "function") return r.setBigUint64(e, t, i);
  const s = BigInt(32),
    n = BigInt(4294967295),
    o = Number((t >> s) & n),
    a = Number(t & n),
    c = i ? 4 : 0,
    h = i ? 0 : 4;
  (r.setUint32(e + c, o, i), r.setUint32(e + h, a, i));
}
function rv(r, e, t) {
  return (r & e) ^ (~r & t);
}
function iv(r, e, t) {
  return (r & e) ^ (r & t) ^ (e & t);
}
let sv = class extends No {
  constructor(e, t, i, s) {
    (super(),
      (this.blockLen = e),
      (this.outputLen = t),
      (this.padOffset = i),
      (this.isLE = s),
      (this.finished = !1),
      (this.length = 0),
      (this.pos = 0),
      (this.destroyed = !1),
      (this.buffer = new Uint8Array(e)),
      (this.view = hn(this.buffer)));
  }
  update(e) {
    Vr(this);
    const { view: t, buffer: i, blockLen: s } = this;
    e = Kr(e);
    const n = e.length;
    for (let o = 0; o < n; ) {
      const a = Math.min(s - this.pos, n - o);
      if (a === s) {
        const c = hn(e);
        for (; s <= n - o; o += s) this.process(c, o);
        continue;
      }
      (i.set(e.subarray(o, o + a), this.pos),
        (this.pos += a),
        (o += a),
        this.pos === s && (this.process(t, 0), (this.pos = 0)));
    }
    return ((this.length += e.length), this.roundClean(), this);
  }
  digestInto(e) {
    (Vr(this), sl(e, this), (this.finished = !0));
    const { buffer: t, view: i, blockLen: s, isLE: n } = this;
    let { pos: o } = this;
    ((t[o++] = 128), this.buffer.subarray(o).fill(0), this.padOffset > s - o && (this.process(i, 0), (o = 0)));
    for (let l = o; l < s; l++) t[l] = 0;
    (tv(i, s - 8, BigInt(this.length * 8), n), this.process(i, 0));
    const a = hn(e),
      c = this.outputLen;
    if (c % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    const h = c / 4,
      u = this.get();
    if (h > u.length) throw new Error("_sha2: outputLen bigger than state");
    for (let l = 0; l < h; l++) a.setUint32(4 * l, u[l], n);
  }
  digest() {
    const { buffer: e, outputLen: t } = this;
    this.digestInto(e);
    const i = e.slice(0, t);
    return (this.destroy(), i);
  }
  _cloneInto(e) {
    (e || (e = new this.constructor()), e.set(...this.get()));
    const { blockLen: t, buffer: i, length: s, finished: n, destroyed: o, pos: a } = this;
    return ((e.length = s), (e.pos = a), (e.finished = n), (e.destroyed = o), s % t && e.buffer.set(i), e);
  }
};
const nv = new Uint32Array([
    1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080,
    310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078,
    604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671,
    3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051,
    2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909,
    275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222,
    2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298,
  ]),
  Mt = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]),
  zt = new Uint32Array(64);
class ov extends sv {
  constructor() {
    (super(64, 32, 8, !1),
      (this.A = Mt[0] | 0),
      (this.B = Mt[1] | 0),
      (this.C = Mt[2] | 0),
      (this.D = Mt[3] | 0),
      (this.E = Mt[4] | 0),
      (this.F = Mt[5] | 0),
      (this.G = Mt[6] | 0),
      (this.H = Mt[7] | 0));
  }
  get() {
    const { A: e, B: t, C: i, D: s, E: n, F: o, G: a, H: c } = this;
    return [e, t, i, s, n, o, a, c];
  }
  set(e, t, i, s, n, o, a, c) {
    ((this.A = e | 0),
      (this.B = t | 0),
      (this.C = i | 0),
      (this.D = s | 0),
      (this.E = n | 0),
      (this.F = o | 0),
      (this.G = a | 0),
      (this.H = c | 0));
  }
  process(e, t) {
    for (let l = 0; l < 16; l++, t += 4) zt[l] = e.getUint32(t, !1);
    for (let l = 16; l < 64; l++) {
      const d = zt[l - 15],
        f = zt[l - 2],
        p = mt(d, 7) ^ mt(d, 18) ^ (d >>> 3),
        g = mt(f, 17) ^ mt(f, 19) ^ (f >>> 10);
      zt[l] = (g + zt[l - 7] + p + zt[l - 16]) | 0;
    }
    let { A: i, B: s, C: n, D: o, E: a, F: c, G: h, H: u } = this;
    for (let l = 0; l < 64; l++) {
      const d = mt(a, 6) ^ mt(a, 11) ^ mt(a, 25),
        f = (u + d + rv(a, c, h) + nv[l] + zt[l]) | 0,
        p = ((mt(i, 2) ^ mt(i, 13) ^ mt(i, 22)) + iv(i, s, n)) | 0;
      ((u = h), (h = c), (c = a), (a = (o + f) | 0), (o = n), (n = s), (s = i), (i = (f + p) | 0));
    }
    ((i = (i + this.A) | 0),
      (s = (s + this.B) | 0),
      (n = (n + this.C) | 0),
      (o = (o + this.D) | 0),
      (a = (a + this.E) | 0),
      (c = (c + this.F) | 0),
      (h = (h + this.G) | 0),
      (u = (u + this.H) | 0),
      this.set(i, s, n, o, a, c, h, u));
  }
  roundClean() {
    zt.fill(0);
  }
  destroy() {
    (this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0));
  }
}
const Fi = nl(() => new ov());
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Rs = BigInt(0),
  Ns = BigInt(1),
  av = BigInt(2);
function pr(r) {
  return r instanceof Uint8Array || (ArrayBuffer.isView(r) && r.constructor.name === "Uint8Array");
}
function ki(r) {
  if (!pr(r)) throw new Error("Uint8Array expected");
}
function Gr(r, e) {
  if (typeof e != "boolean") throw new Error(r + " boolean expected, got " + e);
}
const cv = Array.from({ length: 256 }, (r, e) => e.toString(16).padStart(2, "0"));
function Yr(r) {
  ki(r);
  let e = "";
  for (let t = 0; t < r.length; t++) e += cv[r[t]];
  return e;
}
function qr(r) {
  const e = r.toString(16);
  return e.length & 1 ? "0" + e : e;
}
function Bo(r) {
  if (typeof r != "string") throw new Error("hex string expected, got " + typeof r);
  return r === "" ? Rs : BigInt("0x" + r);
}
const xt = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function yc(r) {
  if (r >= xt._0 && r <= xt._9) return r - xt._0;
  if (r >= xt.A && r <= xt.F) return r - (xt.A - 10);
  if (r >= xt.a && r <= xt.f) return r - (xt.a - 10);
}
function Jr(r) {
  if (typeof r != "string") throw new Error("hex string expected, got " + typeof r);
  const e = r.length,
    t = e / 2;
  if (e % 2) throw new Error("hex string expected, got unpadded hex of length " + e);
  const i = new Uint8Array(t);
  for (let s = 0, n = 0; s < t; s++, n += 2) {
    const o = yc(r.charCodeAt(n)),
      a = yc(r.charCodeAt(n + 1));
    if (o === void 0 || a === void 0) {
      const c = r[n] + r[n + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + n);
    }
    i[s] = o * 16 + a;
  }
  return i;
}
function hr(r) {
  return Bo(Yr(r));
}
function Ai(r) {
  return (ki(r), Bo(Yr(Uint8Array.from(r).reverse())));
}
function Zr(r, e) {
  return Jr(r.toString(16).padStart(e * 2, "0"));
}
function js(r, e) {
  return Zr(r, e).reverse();
}
function hv(r) {
  return Jr(qr(r));
}
function We(r, e, t) {
  let i;
  if (typeof e == "string")
    try {
      i = Jr(e);
    } catch (n) {
      throw new Error(r + " must be hex string or Uint8Array, cause: " + n);
    }
  else if (pr(e)) i = Uint8Array.from(e);
  else throw new Error(r + " must be hex string or Uint8Array");
  const s = i.length;
  if (typeof t == "number" && s !== t) throw new Error(r + " of length " + t + " expected, got " + s);
  return i;
}
function xi(...r) {
  let e = 0;
  for (let i = 0; i < r.length; i++) {
    const s = r[i];
    (ki(s), (e += s.length));
  }
  const t = new Uint8Array(e);
  for (let i = 0, s = 0; i < r.length; i++) {
    const n = r[i];
    (t.set(n, s), (s += n.length));
  }
  return t;
}
function uv(r, e) {
  if (r.length !== e.length) return !1;
  let t = 0;
  for (let i = 0; i < r.length; i++) t |= r[i] ^ e[i];
  return t === 0;
}
function lv(r) {
  if (typeof r != "string") throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(r));
}
const dn = (r) => typeof r == "bigint" && Rs <= r;
function Bs(r, e, t) {
  return dn(r) && dn(e) && dn(t) && e <= r && r < t;
}
function Bt(r, e, t, i) {
  if (!Bs(e, t, i)) throw new Error("expected valid " + r + ": " + t + " <= n < " + i + ", got " + e);
}
function wl(r) {
  let e;
  for (e = 0; r > Rs; r >>= Ns, e += 1);
  return e;
}
function dv(r, e) {
  return (r >> BigInt(e)) & Ns;
}
function pv(r, e, t) {
  return r | ((t ? Ns : Rs) << BigInt(e));
}
const Uo = (r) => (av << BigInt(r - 1)) - Ns,
  pn = (r) => new Uint8Array(r),
  mc = (r) => Uint8Array.from(r);
function bl(r, e, t) {
  if (typeof r != "number" || r < 2) throw new Error("hashLen must be a number");
  if (typeof e != "number" || e < 2) throw new Error("qByteLen must be a number");
  if (typeof t != "function") throw new Error("hmacFn must be a function");
  let i = pn(r),
    s = pn(r),
    n = 0;
  const o = () => {
      (i.fill(1), s.fill(0), (n = 0));
    },
    a = (...u) => t(s, i, ...u),
    c = (u = pn()) => {
      ((s = a(mc([0]), u)), (i = a()), u.length !== 0 && ((s = a(mc([1]), u)), (i = a())));
    },
    h = () => {
      if (n++ >= 1e3) throw new Error("drbg: tried 1000 values");
      let u = 0;
      const l = [];
      for (; u < e; ) {
        i = a();
        const d = i.slice();
        (l.push(d), (u += i.length));
      }
      return xi(...l);
    };
  return (u, l) => {
    (o(), c(u));
    let d;
    for (; !(d = l(h())); ) c();
    return (o(), d);
  };
}
const fv = {
  bigint: (r) => typeof r == "bigint",
  function: (r) => typeof r == "function",
  boolean: (r) => typeof r == "boolean",
  string: (r) => typeof r == "string",
  stringOrUint8Array: (r) => typeof r == "string" || pr(r),
  isSafeInteger: (r) => Number.isSafeInteger(r),
  array: (r) => Array.isArray(r),
  field: (r, e) => e.Fp.isValid(r),
  hash: (r) => typeof r == "function" && Number.isSafeInteger(r.outputLen),
};
function ii(r, e, t = {}) {
  const i = (s, n, o) => {
    const a = fv[n];
    if (typeof a != "function") throw new Error("invalid validator function");
    const c = r[s];
    if (!(o && c === void 0) && !a(c, r))
      throw new Error("param " + String(s) + " is invalid. Expected " + n + ", got " + c);
  };
  for (const [s, n] of Object.entries(e)) i(s, n, !1);
  for (const [s, n] of Object.entries(t)) i(s, n, !0);
  return r;
}
const gv = () => {
  throw new Error("not implemented");
};
function Qn(r) {
  const e = new WeakMap();
  return (t, ...i) => {
    const s = e.get(t);
    if (s !== void 0) return s;
    const n = r(t, ...i);
    return (e.set(t, n), n);
  };
}
var yv = Object.freeze({
  __proto__: null,
  isBytes: pr,
  abytes: ki,
  abool: Gr,
  bytesToHex: Yr,
  numberToHexUnpadded: qr,
  hexToNumber: Bo,
  hexToBytes: Jr,
  bytesToNumberBE: hr,
  bytesToNumberLE: Ai,
  numberToBytesBE: Zr,
  numberToBytesLE: js,
  numberToVarBytesBE: hv,
  ensureBytes: We,
  concatBytes: xi,
  equalBytes: uv,
  utf8ToBytes: lv,
  inRange: Bs,
  aInRange: Bt,
  bitLen: wl,
  bitGet: dv,
  bitSet: pv,
  bitMask: Uo,
  createHmacDrbg: bl,
  validateObject: ii,
  notImplemented: gv,
  memoized: Qn,
});
const Ee = BigInt(0),
  ue = BigInt(1),
  sr = BigInt(2),
  mv = BigInt(3),
  Xn = BigInt(4),
  wc = BigInt(5),
  bc = BigInt(8);
function qe(r, e) {
  const t = r % e;
  return t >= Ee ? t : e + t;
}
function vl(r, e, t) {
  if (e < Ee) throw new Error("invalid exponent, negatives unsupported");
  if (t <= Ee) throw new Error("invalid modulus");
  if (t === ue) return Ee;
  let i = ue;
  for (; e > Ee; ) (e & ue && (i = (i * r) % t), (r = (r * r) % t), (e >>= ue));
  return i;
}
function dt(r, e, t) {
  let i = r;
  for (; e-- > Ee; ) ((i *= i), (i %= t));
  return i;
}
function eo(r, e) {
  if (r === Ee) throw new Error("invert: expected non-zero number");
  if (e <= Ee) throw new Error("invert: expected positive modulus, got " + e);
  let t = qe(r, e),
    i = e,
    s = Ee,
    n = ue;
  for (; t !== Ee; ) {
    const o = i / t,
      a = i % t,
      c = s - n * o;
    ((i = t), (t = a), (s = n), (n = c));
  }
  if (i !== ue) throw new Error("invert: does not exist");
  return qe(s, e);
}
function wv(r) {
  const e = (r - ue) / sr;
  let t, i, s;
  for (t = r - ue, i = 0; t % sr === Ee; t /= sr, i++);
  for (s = sr; s < r && vl(s, e, r) !== r - ue; s++)
    if (s > 1e3) throw new Error("Cannot find square root: likely non-prime P");
  if (i === 1) {
    const o = (r + ue) / Xn;
    return function (a, c) {
      const h = a.pow(c, o);
      if (!a.eql(a.sqr(h), c)) throw new Error("Cannot find square root");
      return h;
    };
  }
  const n = (t + ue) / sr;
  return function (o, a) {
    if (o.pow(a, e) === o.neg(o.ONE)) throw new Error("Cannot find square root");
    let c = i,
      h = o.pow(o.mul(o.ONE, s), t),
      u = o.pow(a, n),
      l = o.pow(a, t);
    for (; !o.eql(l, o.ONE); ) {
      if (o.eql(l, o.ZERO)) return o.ZERO;
      let d = 1;
      for (let p = o.sqr(l); d < c && !o.eql(p, o.ONE); d++) p = o.sqr(p);
      const f = o.pow(h, ue << BigInt(c - d - 1));
      ((h = o.sqr(f)), (u = o.mul(u, f)), (l = o.mul(l, h)), (c = d));
    }
    return u;
  };
}
function bv(r) {
  if (r % Xn === mv) {
    const e = (r + ue) / Xn;
    return function (t, i) {
      const s = t.pow(i, e);
      if (!t.eql(t.sqr(s), i)) throw new Error("Cannot find square root");
      return s;
    };
  }
  if (r % bc === wc) {
    const e = (r - wc) / bc;
    return function (t, i) {
      const s = t.mul(i, sr),
        n = t.pow(s, e),
        o = t.mul(i, n),
        a = t.mul(t.mul(o, sr), n),
        c = t.mul(o, t.sub(a, t.ONE));
      if (!t.eql(t.sqr(c), i)) throw new Error("Cannot find square root");
      return c;
    };
  }
  return wv(r);
}
const vv = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN",
];
function Ev(r) {
  const e = { ORDER: "bigint", MASK: "bigint", BYTES: "isSafeInteger", BITS: "isSafeInteger" },
    t = vv.reduce((i, s) => ((i[s] = "function"), i), e);
  return ii(r, t);
}
function _v(r, e, t) {
  if (t < Ee) throw new Error("invalid exponent, negatives unsupported");
  if (t === Ee) return r.ONE;
  if (t === ue) return e;
  let i = r.ONE,
    s = e;
  for (; t > Ee; ) (t & ue && (i = r.mul(i, s)), (s = r.sqr(s)), (t >>= ue));
  return i;
}
function Iv(r, e) {
  const t = new Array(e.length),
    i = e.reduce((n, o, a) => (r.is0(o) ? n : ((t[a] = n), r.mul(n, o))), r.ONE),
    s = r.inv(i);
  return (e.reduceRight((n, o, a) => (r.is0(o) ? n : ((t[a] = r.mul(n, t[a])), r.mul(n, o))), s), t);
}
function El(r, e) {
  const t = e !== void 0 ? e : r.toString(2).length,
    i = Math.ceil(t / 8);
  return { nBitLength: t, nByteLength: i };
}
function _l(r, e, t = !1, i = {}) {
  if (r <= Ee) throw new Error("invalid field: expected ORDER > 0, got " + r);
  const { nBitLength: s, nByteLength: n } = El(r, e);
  if (n > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let o;
  const a = Object.freeze({
    ORDER: r,
    isLE: t,
    BITS: s,
    BYTES: n,
    MASK: Uo(s),
    ZERO: Ee,
    ONE: ue,
    create: (c) => qe(c, r),
    isValid: (c) => {
      if (typeof c != "bigint") throw new Error("invalid field element: expected bigint, got " + typeof c);
      return Ee <= c && c < r;
    },
    is0: (c) => c === Ee,
    isOdd: (c) => (c & ue) === ue,
    neg: (c) => qe(-c, r),
    eql: (c, h) => c === h,
    sqr: (c) => qe(c * c, r),
    add: (c, h) => qe(c + h, r),
    sub: (c, h) => qe(c - h, r),
    mul: (c, h) => qe(c * h, r),
    pow: (c, h) => _v(a, c, h),
    div: (c, h) => qe(c * eo(h, r), r),
    sqrN: (c) => c * c,
    addN: (c, h) => c + h,
    subN: (c, h) => c - h,
    mulN: (c, h) => c * h,
    inv: (c) => eo(c, r),
    sqrt: i.sqrt || ((c) => (o || (o = bv(r)), o(a, c))),
    invertBatch: (c) => Iv(a, c),
    cmov: (c, h, u) => (u ? h : c),
    toBytes: (c) => (t ? js(c, n) : Zr(c, n)),
    fromBytes: (c) => {
      if (c.length !== n) throw new Error("Field.fromBytes: expected " + n + " bytes, got " + c.length);
      return t ? Ai(c) : hr(c);
    },
  });
  return Object.freeze(a);
}
function Il(r) {
  if (typeof r != "bigint") throw new Error("field order must be bigint");
  const e = r.toString(2).length;
  return Math.ceil(e / 8);
}
function $l(r) {
  const e = Il(r);
  return e + Math.ceil(e / 2);
}
function $v(r, e, t = !1) {
  const i = r.length,
    s = Il(e),
    n = $l(e);
  if (i < 16 || i < n || i > 1024) throw new Error("expected " + n + "-1024 bytes of input, got " + i);
  const o = t ? Ai(r) : hr(r),
    a = qe(o, e - ue) + ue;
  return t ? js(a, s) : Zr(a, s);
}
const vc = BigInt(0),
  Zi = BigInt(1);
function fn(r, e) {
  const t = e.negate();
  return r ? t : e;
}
function Dl(r, e) {
  if (!Number.isSafeInteger(r) || r <= 0 || r > e)
    throw new Error("invalid window size, expected [1.." + e + "], got W=" + r);
}
function gn(r, e) {
  Dl(r, e);
  const t = Math.ceil(e / r) + 1,
    i = 2 ** (r - 1);
  return { windows: t, windowSize: i };
}
function Dv(r, e) {
  if (!Array.isArray(r)) throw new Error("array expected");
  r.forEach((t, i) => {
    if (!(t instanceof e)) throw new Error("invalid point at index " + i);
  });
}
function Sv(r, e) {
  if (!Array.isArray(r)) throw new Error("array of scalars expected");
  r.forEach((t, i) => {
    if (!e.isValid(t)) throw new Error("invalid scalar at index " + i);
  });
}
const yn = new WeakMap(),
  Sl = new WeakMap();
function mn(r) {
  return Sl.get(r) || 1;
}
function Ov(r, e) {
  return {
    constTimeNegate: fn,
    hasPrecomputes(t) {
      return mn(t) !== 1;
    },
    unsafeLadder(t, i, s = r.ZERO) {
      let n = t;
      for (; i > vc; ) (i & Zi && (s = s.add(n)), (n = n.double()), (i >>= Zi));
      return s;
    },
    precomputeWindow(t, i) {
      const { windows: s, windowSize: n } = gn(i, e),
        o = [];
      let a = t,
        c = a;
      for (let h = 0; h < s; h++) {
        ((c = a), o.push(c));
        for (let u = 1; u < n; u++) ((c = c.add(a)), o.push(c));
        a = c.double();
      }
      return o;
    },
    wNAF(t, i, s) {
      const { windows: n, windowSize: o } = gn(t, e);
      let a = r.ZERO,
        c = r.BASE;
      const h = BigInt(2 ** t - 1),
        u = 2 ** t,
        l = BigInt(t);
      for (let d = 0; d < n; d++) {
        const f = d * o;
        let p = Number(s & h);
        ((s >>= l), p > o && ((p -= u), (s += Zi)));
        const g = f,
          w = f + Math.abs(p) - 1,
          E = d % 2 !== 0,
          b = p < 0;
        p === 0 ? (c = c.add(fn(E, i[g]))) : (a = a.add(fn(b, i[w])));
      }
      return { p: a, f: c };
    },
    wNAFUnsafe(t, i, s, n = r.ZERO) {
      const { windows: o, windowSize: a } = gn(t, e),
        c = BigInt(2 ** t - 1),
        h = 2 ** t,
        u = BigInt(t);
      for (let l = 0; l < o; l++) {
        const d = l * a;
        if (s === vc) break;
        let f = Number(s & c);
        if (((s >>= u), f > a && ((f -= h), (s += Zi)), f === 0)) continue;
        let p = i[d + Math.abs(f) - 1];
        (f < 0 && (p = p.negate()), (n = n.add(p)));
      }
      return n;
    },
    getPrecomputes(t, i, s) {
      let n = yn.get(i);
      return (n || ((n = this.precomputeWindow(i, t)), t !== 1 && yn.set(i, s(n))), n);
    },
    wNAFCached(t, i, s) {
      const n = mn(t);
      return this.wNAF(n, this.getPrecomputes(n, t, s), i);
    },
    wNAFCachedUnsafe(t, i, s, n) {
      const o = mn(t);
      return o === 1 ? this.unsafeLadder(t, i, n) : this.wNAFUnsafe(o, this.getPrecomputes(o, t, s), i, n);
    },
    setWindowSize(t, i) {
      (Dl(i, e), Sl.set(t, i), yn.delete(t));
    },
  };
}
function Pv(r, e, t, i) {
  if ((Dv(t, r), Sv(i, e), t.length !== i.length))
    throw new Error("arrays of points and scalars must have equal length");
  const s = r.ZERO,
    n = wl(BigInt(t.length)),
    o = n > 12 ? n - 3 : n > 4 ? n - 2 : n ? 2 : 1,
    a = (1 << o) - 1,
    c = new Array(a + 1).fill(s),
    h = Math.floor((e.BITS - 1) / o) * o;
  let u = s;
  for (let l = h; l >= 0; l -= o) {
    c.fill(s);
    for (let f = 0; f < i.length; f++) {
      const p = i[f],
        g = Number((p >> BigInt(l)) & BigInt(a));
      c[g] = c[g].add(t[f]);
    }
    let d = s;
    for (let f = c.length - 1, p = s; f > 0; f--) ((p = p.add(c[f])), (d = d.add(p)));
    if (((u = u.add(d)), l !== 0)) for (let f = 0; f < o; f++) u = u.double();
  }
  return u;
}
function Ol(r) {
  return (
    Ev(r.Fp),
    ii(
      r,
      { n: "bigint", h: "bigint", Gx: "field", Gy: "field" },
      { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" },
    ),
    Object.freeze({ ...El(r.n, r.nBitLength), ...r, p: r.Fp.ORDER })
  );
}
(BigInt(0), BigInt(1), BigInt(2), BigInt(8));
const Dr = BigInt(0),
  wn = BigInt(1);
function Av(r) {
  return (
    ii(
      r,
      { a: "bigint" },
      {
        montgomeryBits: "isSafeInteger",
        nByteLength: "isSafeInteger",
        adjustScalarBytes: "function",
        domain: "function",
        powPminus2: "function",
        Gu: "bigint",
      },
    ),
    Object.freeze({ ...r })
  );
}
function xv(r) {
  const e = Av(r),
    { P: t } = e,
    i = (b) => qe(b, t),
    s = e.montgomeryBits,
    n = Math.ceil(s / 8),
    o = e.nByteLength,
    a = e.adjustScalarBytes || ((b) => b),
    c = e.powPminus2 || ((b) => vl(b, t - BigInt(2), t));
  function h(b, _, A) {
    const T = i(b * (_ - A));
    return ((_ = i(_ - T)), (A = i(A + T)), [_, A]);
  }
  const u = (e.a - BigInt(2)) / BigInt(4);
  function l(b, _) {
    (Bt("u", b, Dr, t), Bt("scalar", _, Dr, t));
    const A = _,
      T = b;
    let v = wn,
      I = Dr,
      O = b,
      D = wn,
      j = Dr,
      N;
    for (let M = BigInt(s - 1); M >= Dr; M--) {
      const P = (A >> M) & wn;
      ((j ^= P), (N = h(j, v, O)), (v = N[0]), (O = N[1]), (N = h(j, I, D)), (I = N[0]), (D = N[1]), (j = P));
      const y = v + I,
        m = i(y * y),
        $ = v - I,
        x = i($ * $),
        S = m - x,
        C = O + D,
        k = O - D,
        q = i(k * y),
        z = i(C * $),
        L = q + z,
        H = q - z;
      ((O = i(L * L)), (D = i(T * i(H * H))), (v = i(m * x)), (I = i(S * (m + i(u * S)))));
    }
    ((N = h(j, v, O)), (v = N[0]), (O = N[1]), (N = h(j, I, D)), (I = N[0]), (D = N[1]));
    const B = c(I);
    return i(v * B);
  }
  function d(b) {
    return js(i(b), n);
  }
  function f(b) {
    const _ = We("u coordinate", b, n);
    return (o === 32 && (_[31] &= 127), Ai(_));
  }
  function p(b) {
    const _ = We("scalar", b),
      A = _.length;
    if (A !== n && A !== o) {
      let T = "" + n + " or " + o;
      throw new Error("invalid scalar, expected " + T + " bytes, got " + A);
    }
    return Ai(a(_));
  }
  function g(b, _) {
    const A = f(_),
      T = p(b),
      v = l(A, T);
    if (v === Dr) throw new Error("invalid private or public key received");
    return d(v);
  }
  const w = d(e.Gu);
  function E(b) {
    return g(b, w);
  }
  return {
    scalarMult: g,
    scalarMultBase: E,
    getSharedSecret: (b, _) => g(b, _),
    getPublicKey: (b) => E(b),
    utils: { randomPrivateKey: () => e.randomBytes(e.nByteLength) },
    GuBytes: w,
  };
}
const to = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819949");
BigInt(0);
const Cv = BigInt(1),
  Ec = BigInt(2),
  Tv = BigInt(3),
  Rv = BigInt(5);
BigInt(8);
function Nv(r) {
  const e = BigInt(10),
    t = BigInt(20),
    i = BigInt(40),
    s = BigInt(80),
    n = to,
    o = (((r * r) % n) * r) % n,
    a = (dt(o, Ec, n) * o) % n,
    c = (dt(a, Cv, n) * r) % n,
    h = (dt(c, Rv, n) * c) % n,
    u = (dt(h, e, n) * h) % n,
    l = (dt(u, t, n) * u) % n,
    d = (dt(l, i, n) * l) % n,
    f = (dt(d, s, n) * d) % n,
    p = (dt(f, s, n) * d) % n,
    g = (dt(p, e, n) * h) % n;
  return { pow_p_5_8: (dt(g, Ec, n) * r) % n, b2: o };
}
function jv(r) {
  return ((r[0] &= 248), (r[31] &= 127), (r[31] |= 64), r);
}
const ro = xv({
  P: to,
  a: BigInt(486662),
  montgomeryBits: 255,
  nByteLength: 32,
  Gu: BigInt(9),
  powPminus2: (r) => {
    const e = to,
      { pow_p_5_8: t, b2: i } = Nv(r);
    return qe(dt(t, Tv, e) * i, e);
  },
  adjustScalarBytes: jv,
  randomBytes: ri,
});
function _c(r) {
  (r.lowS !== void 0 && Gr("lowS", r.lowS), r.prehash !== void 0 && Gr("prehash", r.prehash));
}
function Bv(r) {
  const e = Ol(r);
  ii(
    e,
    { a: "field", b: "field" },
    {
      allowedPrivateKeyLengths: "array",
      wrapPrivateKey: "boolean",
      isTorsionFree: "function",
      clearCofactor: "function",
      allowInfinityPoint: "boolean",
      fromBytes: "function",
      toBytes: "function",
    },
  );
  const { endo: t, Fp: i, a: s } = e;
  if (t) {
    if (!i.eql(s, i.ZERO))
      throw new Error("invalid endomorphism, can only be defined for Koblitz curves that have a=0");
    if (typeof t != "object" || typeof t.beta != "bigint" || typeof t.splitScalar != "function")
      throw new Error("invalid endomorphism, expected beta: bigint and splitScalar: function");
  }
  return Object.freeze({ ...e });
}
const { bytesToNumberBE: Uv, hexToBytes: Fv } = yv;
class kv extends Error {
  constructor(e = "") {
    super(e);
  }
}
const Nt = {
    Err: kv,
    _tlv: {
      encode: (r, e) => {
        const { Err: t } = Nt;
        if (r < 0 || r > 256) throw new t("tlv.encode: wrong tag");
        if (e.length & 1) throw new t("tlv.encode: unpadded data");
        const i = e.length / 2,
          s = qr(i);
        if ((s.length / 2) & 128) throw new t("tlv.encode: long form length too big");
        const n = i > 127 ? qr((s.length / 2) | 128) : "";
        return qr(r) + n + s + e;
      },
      decode(r, e) {
        const { Err: t } = Nt;
        let i = 0;
        if (r < 0 || r > 256) throw new t("tlv.encode: wrong tag");
        if (e.length < 2 || e[i++] !== r) throw new t("tlv.decode: wrong tlv");
        const s = e[i++],
          n = !!(s & 128);
        let o = 0;
        if (!n) o = s;
        else {
          const c = s & 127;
          if (!c) throw new t("tlv.decode(long): indefinite length not supported");
          if (c > 4) throw new t("tlv.decode(long): byte length is too big");
          const h = e.subarray(i, i + c);
          if (h.length !== c) throw new t("tlv.decode: length bytes not complete");
          if (h[0] === 0) throw new t("tlv.decode(long): zero leftmost byte");
          for (const u of h) o = (o << 8) | u;
          if (((i += c), o < 128)) throw new t("tlv.decode(long): not minimal encoding");
        }
        const a = e.subarray(i, i + o);
        if (a.length !== o) throw new t("tlv.decode: wrong value length");
        return { v: a, l: e.subarray(i + o) };
      },
    },
    _int: {
      encode(r) {
        const { Err: e } = Nt;
        if (r < jt) throw new e("integer: negative integers are not allowed");
        let t = qr(r);
        if ((Number.parseInt(t[0], 16) & 8 && (t = "00" + t), t.length & 1))
          throw new e("unexpected DER parsing assertion: unpadded hex");
        return t;
      },
      decode(r) {
        const { Err: e } = Nt;
        if (r[0] & 128) throw new e("invalid signature integer: negative");
        if (r[0] === 0 && !(r[1] & 128)) throw new e("invalid signature integer: unnecessary leading zero");
        return Uv(r);
      },
    },
    toSig(r) {
      const { Err: e, _int: t, _tlv: i } = Nt,
        s = typeof r == "string" ? Fv(r) : r;
      ki(s);
      const { v: n, l: o } = i.decode(48, s);
      if (o.length) throw new e("invalid signature: left bytes after parsing");
      const { v: a, l: c } = i.decode(2, n),
        { v: h, l: u } = i.decode(2, c);
      if (u.length) throw new e("invalid signature: left bytes after parsing");
      return { r: t.decode(a), s: t.decode(h) };
    },
    hexFromSig(r) {
      const { _tlv: e, _int: t } = Nt,
        i = e.encode(2, t.encode(r.r)),
        s = e.encode(2, t.encode(r.s)),
        n = i + s;
      return e.encode(48, n);
    },
  },
  jt = BigInt(0),
  we = BigInt(1);
BigInt(2);
const Ic = BigInt(3);
BigInt(4);
function Lv(r) {
  const e = Bv(r),
    { Fp: t } = e,
    i = _l(e.n, e.nBitLength),
    s =
      e.toBytes ||
      ((g, w, E) => {
        const b = w.toAffine();
        return xi(Uint8Array.from([4]), t.toBytes(b.x), t.toBytes(b.y));
      }),
    n =
      e.fromBytes ||
      ((g) => {
        const w = g.subarray(1),
          E = t.fromBytes(w.subarray(0, t.BYTES)),
          b = t.fromBytes(w.subarray(t.BYTES, 2 * t.BYTES));
        return { x: E, y: b };
      });
  function o(g) {
    const { a: w, b: E } = e,
      b = t.sqr(g),
      _ = t.mul(b, g);
    return t.add(t.add(_, t.mul(g, w)), E);
  }
  if (!t.eql(t.sqr(e.Gy), o(e.Gx))) throw new Error("bad generator point: equation left != right");
  function a(g) {
    return Bs(g, we, e.n);
  }
  function c(g) {
    const { allowedPrivateKeyLengths: w, nByteLength: E, wrapPrivateKey: b, n: _ } = e;
    if (w && typeof g != "bigint") {
      if ((pr(g) && (g = Yr(g)), typeof g != "string" || !w.includes(g.length))) throw new Error("invalid private key");
      g = g.padStart(E * 2, "0");
    }
    let A;
    try {
      A = typeof g == "bigint" ? g : hr(We("private key", g, E));
    } catch {
      throw new Error("invalid private key, expected hex or " + E + " bytes, got " + typeof g);
    }
    return (b && (A = qe(A, _)), Bt("private key", A, we, _), A);
  }
  function h(g) {
    if (!(g instanceof d)) throw new Error("ProjectivePoint expected");
  }
  const u = Qn((g, w) => {
      const { px: E, py: b, pz: _ } = g;
      if (t.eql(_, t.ONE)) return { x: E, y: b };
      const A = g.is0();
      w == null && (w = A ? t.ONE : t.inv(_));
      const T = t.mul(E, w),
        v = t.mul(b, w),
        I = t.mul(_, w);
      if (A) return { x: t.ZERO, y: t.ZERO };
      if (!t.eql(I, t.ONE)) throw new Error("invZ was invalid");
      return { x: T, y: v };
    }),
    l = Qn((g) => {
      if (g.is0()) {
        if (e.allowInfinityPoint && !t.is0(g.py)) return;
        throw new Error("bad point: ZERO");
      }
      const { x: w, y: E } = g.toAffine();
      if (!t.isValid(w) || !t.isValid(E)) throw new Error("bad point: x or y not FE");
      const b = t.sqr(E),
        _ = o(w);
      if (!t.eql(b, _)) throw new Error("bad point: equation left != right");
      if (!g.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
      return !0;
    });
  class d {
    constructor(w, E, b) {
      if (((this.px = w), (this.py = E), (this.pz = b), w == null || !t.isValid(w))) throw new Error("x required");
      if (E == null || !t.isValid(E)) throw new Error("y required");
      if (b == null || !t.isValid(b)) throw new Error("z required");
      Object.freeze(this);
    }
    static fromAffine(w) {
      const { x: E, y: b } = w || {};
      if (!w || !t.isValid(E) || !t.isValid(b)) throw new Error("invalid affine point");
      if (w instanceof d) throw new Error("projective point not allowed");
      const _ = (A) => t.eql(A, t.ZERO);
      return _(E) && _(b) ? d.ZERO : new d(E, b, t.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static normalizeZ(w) {
      const E = t.invertBatch(w.map((b) => b.pz));
      return w.map((b, _) => b.toAffine(E[_])).map(d.fromAffine);
    }
    static fromHex(w) {
      const E = d.fromAffine(n(We("pointHex", w)));
      return (E.assertValidity(), E);
    }
    static fromPrivateKey(w) {
      return d.BASE.multiply(c(w));
    }
    static msm(w, E) {
      return Pv(d, i, w, E);
    }
    _setWindowSize(w) {
      p.setWindowSize(this, w);
    }
    assertValidity() {
      l(this);
    }
    hasEvenY() {
      const { y: w } = this.toAffine();
      if (t.isOdd) return !t.isOdd(w);
      throw new Error("Field doesn't support isOdd");
    }
    equals(w) {
      h(w);
      const { px: E, py: b, pz: _ } = this,
        { px: A, py: T, pz: v } = w,
        I = t.eql(t.mul(E, v), t.mul(A, _)),
        O = t.eql(t.mul(b, v), t.mul(T, _));
      return I && O;
    }
    negate() {
      return new d(this.px, t.neg(this.py), this.pz);
    }
    double() {
      const { a: w, b: E } = e,
        b = t.mul(E, Ic),
        { px: _, py: A, pz: T } = this;
      let v = t.ZERO,
        I = t.ZERO,
        O = t.ZERO,
        D = t.mul(_, _),
        j = t.mul(A, A),
        N = t.mul(T, T),
        B = t.mul(_, A);
      return (
        (B = t.add(B, B)),
        (O = t.mul(_, T)),
        (O = t.add(O, O)),
        (v = t.mul(w, O)),
        (I = t.mul(b, N)),
        (I = t.add(v, I)),
        (v = t.sub(j, I)),
        (I = t.add(j, I)),
        (I = t.mul(v, I)),
        (v = t.mul(B, v)),
        (O = t.mul(b, O)),
        (N = t.mul(w, N)),
        (B = t.sub(D, N)),
        (B = t.mul(w, B)),
        (B = t.add(B, O)),
        (O = t.add(D, D)),
        (D = t.add(O, D)),
        (D = t.add(D, N)),
        (D = t.mul(D, B)),
        (I = t.add(I, D)),
        (N = t.mul(A, T)),
        (N = t.add(N, N)),
        (D = t.mul(N, B)),
        (v = t.sub(v, D)),
        (O = t.mul(N, j)),
        (O = t.add(O, O)),
        (O = t.add(O, O)),
        new d(v, I, O)
      );
    }
    add(w) {
      h(w);
      const { px: E, py: b, pz: _ } = this,
        { px: A, py: T, pz: v } = w;
      let I = t.ZERO,
        O = t.ZERO,
        D = t.ZERO;
      const j = e.a,
        N = t.mul(e.b, Ic);
      let B = t.mul(E, A),
        M = t.mul(b, T),
        P = t.mul(_, v),
        y = t.add(E, b),
        m = t.add(A, T);
      ((y = t.mul(y, m)), (m = t.add(B, M)), (y = t.sub(y, m)), (m = t.add(E, _)));
      let $ = t.add(A, v);
      return (
        (m = t.mul(m, $)),
        ($ = t.add(B, P)),
        (m = t.sub(m, $)),
        ($ = t.add(b, _)),
        (I = t.add(T, v)),
        ($ = t.mul($, I)),
        (I = t.add(M, P)),
        ($ = t.sub($, I)),
        (D = t.mul(j, m)),
        (I = t.mul(N, P)),
        (D = t.add(I, D)),
        (I = t.sub(M, D)),
        (D = t.add(M, D)),
        (O = t.mul(I, D)),
        (M = t.add(B, B)),
        (M = t.add(M, B)),
        (P = t.mul(j, P)),
        (m = t.mul(N, m)),
        (M = t.add(M, P)),
        (P = t.sub(B, P)),
        (P = t.mul(j, P)),
        (m = t.add(m, P)),
        (B = t.mul(M, m)),
        (O = t.add(O, B)),
        (B = t.mul($, m)),
        (I = t.mul(y, I)),
        (I = t.sub(I, B)),
        (B = t.mul(y, M)),
        (D = t.mul($, D)),
        (D = t.add(D, B)),
        new d(I, O, D)
      );
    }
    subtract(w) {
      return this.add(w.negate());
    }
    is0() {
      return this.equals(d.ZERO);
    }
    wNAF(w) {
      return p.wNAFCached(this, w, d.normalizeZ);
    }
    multiplyUnsafe(w) {
      const { endo: E, n: b } = e;
      Bt("scalar", w, jt, b);
      const _ = d.ZERO;
      if (w === jt) return _;
      if (this.is0() || w === we) return this;
      if (!E || p.hasPrecomputes(this)) return p.wNAFCachedUnsafe(this, w, d.normalizeZ);
      let { k1neg: A, k1: T, k2neg: v, k2: I } = E.splitScalar(w),
        O = _,
        D = _,
        j = this;
      for (; T > jt || I > jt; )
        (T & we && (O = O.add(j)), I & we && (D = D.add(j)), (j = j.double()), (T >>= we), (I >>= we));
      return (A && (O = O.negate()), v && (D = D.negate()), (D = new d(t.mul(D.px, E.beta), D.py, D.pz)), O.add(D));
    }
    multiply(w) {
      const { endo: E, n: b } = e;
      Bt("scalar", w, we, b);
      let _, A;
      if (E) {
        const { k1neg: T, k1: v, k2neg: I, k2: O } = E.splitScalar(w);
        let { p: D, f: j } = this.wNAF(v),
          { p: N, f: B } = this.wNAF(O);
        ((D = p.constTimeNegate(T, D)),
          (N = p.constTimeNegate(I, N)),
          (N = new d(t.mul(N.px, E.beta), N.py, N.pz)),
          (_ = D.add(N)),
          (A = j.add(B)));
      } else {
        const { p: T, f: v } = this.wNAF(w);
        ((_ = T), (A = v));
      }
      return d.normalizeZ([_, A])[0];
    }
    multiplyAndAddUnsafe(w, E, b) {
      const _ = d.BASE,
        A = (v, I) => (I === jt || I === we || !v.equals(_) ? v.multiplyUnsafe(I) : v.multiply(I)),
        T = A(this, E).add(A(w, b));
      return T.is0() ? void 0 : T;
    }
    toAffine(w) {
      return u(this, w);
    }
    isTorsionFree() {
      const { h: w, isTorsionFree: E } = e;
      if (w === we) return !0;
      if (E) return E(d, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: w, clearCofactor: E } = e;
      return w === we ? this : E ? E(d, this) : this.multiplyUnsafe(e.h);
    }
    toRawBytes(w = !0) {
      return (Gr("isCompressed", w), this.assertValidity(), s(d, this, w));
    }
    toHex(w = !0) {
      return (Gr("isCompressed", w), Yr(this.toRawBytes(w)));
    }
  }
  ((d.BASE = new d(e.Gx, e.Gy, t.ONE)), (d.ZERO = new d(t.ZERO, t.ONE, t.ZERO)));
  const f = e.nBitLength,
    p = Ov(d, e.endo ? Math.ceil(f / 2) : f);
  return { CURVE: e, ProjectivePoint: d, normPrivateKeyToScalar: c, weierstrassEquation: o, isWithinCurveOrder: a };
}
function qv(r) {
  const e = Ol(r);
  return (
    ii(
      e,
      { hash: "hash", hmac: "function", randomBytes: "function" },
      { bits2int: "function", bits2int_modN: "function", lowS: "boolean" },
    ),
    Object.freeze({ lowS: !0, ...e })
  );
}
function Mv(r) {
  const e = qv(r),
    { Fp: t, n: i } = e,
    s = t.BYTES + 1,
    n = 2 * t.BYTES + 1;
  function o(P) {
    return qe(P, i);
  }
  function a(P) {
    return eo(P, i);
  }
  const {
      ProjectivePoint: c,
      normPrivateKeyToScalar: h,
      weierstrassEquation: u,
      isWithinCurveOrder: l,
    } = Lv({
      ...e,
      toBytes(P, y, m) {
        const $ = y.toAffine(),
          x = t.toBytes($.x),
          S = xi;
        return (
          Gr("isCompressed", m),
          m ? S(Uint8Array.from([y.hasEvenY() ? 2 : 3]), x) : S(Uint8Array.from([4]), x, t.toBytes($.y))
        );
      },
      fromBytes(P) {
        const y = P.length,
          m = P[0],
          $ = P.subarray(1);
        if (y === s && (m === 2 || m === 3)) {
          const x = hr($);
          if (!Bs(x, we, t.ORDER)) throw new Error("Point is not on curve");
          const S = u(x);
          let C;
          try {
            C = t.sqrt(S);
          } catch (q) {
            const z = q instanceof Error ? ": " + q.message : "";
            throw new Error("Point is not on curve" + z);
          }
          const k = (C & we) === we;
          return (((m & 1) === 1) !== k && (C = t.neg(C)), { x, y: C });
        } else if (y === n && m === 4) {
          const x = t.fromBytes($.subarray(0, t.BYTES)),
            S = t.fromBytes($.subarray(t.BYTES, 2 * t.BYTES));
          return { x, y: S };
        } else {
          const x = s,
            S = n;
          throw new Error("invalid Point, expected length of " + x + ", or uncompressed " + S + ", got " + y);
        }
      },
    }),
    d = (P) => Yr(Zr(P, e.nByteLength));
  function f(P) {
    const y = i >> we;
    return P > y;
  }
  function p(P) {
    return f(P) ? o(-P) : P;
  }
  const g = (P, y, m) => hr(P.slice(y, m));
  class w {
    constructor(y, m, $) {
      ((this.r = y), (this.s = m), (this.recovery = $), this.assertValidity());
    }
    static fromCompact(y) {
      const m = e.nByteLength;
      return ((y = We("compactSignature", y, m * 2)), new w(g(y, 0, m), g(y, m, 2 * m)));
    }
    static fromDER(y) {
      const { r: m, s: $ } = Nt.toSig(We("DER", y));
      return new w(m, $);
    }
    assertValidity() {
      (Bt("r", this.r, we, i), Bt("s", this.s, we, i));
    }
    addRecoveryBit(y) {
      return new w(this.r, this.s, y);
    }
    recoverPublicKey(y) {
      const { r: m, s: $, recovery: x } = this,
        S = v(We("msgHash", y));
      if (x == null || ![0, 1, 2, 3].includes(x)) throw new Error("recovery id invalid");
      const C = x === 2 || x === 3 ? m + e.n : m;
      if (C >= t.ORDER) throw new Error("recovery id 2 or 3 invalid");
      const k = (x & 1) === 0 ? "02" : "03",
        q = c.fromHex(k + d(C)),
        z = a(C),
        L = o(-S * z),
        H = o($ * z),
        K = c.BASE.multiplyAndAddUnsafe(q, L, H);
      if (!K) throw new Error("point at infinify");
      return (K.assertValidity(), K);
    }
    hasHighS() {
      return f(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new w(this.r, o(-this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return Jr(this.toDERHex());
    }
    toDERHex() {
      return Nt.hexFromSig({ r: this.r, s: this.s });
    }
    toCompactRawBytes() {
      return Jr(this.toCompactHex());
    }
    toCompactHex() {
      return d(this.r) + d(this.s);
    }
  }
  const E = {
    isValidPrivateKey(P) {
      try {
        return (h(P), !0);
      } catch {
        return !1;
      }
    },
    normPrivateKeyToScalar: h,
    randomPrivateKey: () => {
      const P = $l(e.n);
      return $v(e.randomBytes(P), e.n);
    },
    precompute(P = 8, y = c.BASE) {
      return (y._setWindowSize(P), y.multiply(BigInt(3)), y);
    },
  };
  function b(P, y = !0) {
    return c.fromPrivateKey(P).toRawBytes(y);
  }
  function _(P) {
    const y = pr(P),
      m = typeof P == "string",
      $ = (y || m) && P.length;
    return y ? $ === s || $ === n : m ? $ === 2 * s || $ === 2 * n : P instanceof c;
  }
  function A(P, y, m = !0) {
    if (_(P)) throw new Error("first arg must be private key");
    if (!_(y)) throw new Error("second arg must be public key");
    return c.fromHex(y).multiply(h(P)).toRawBytes(m);
  }
  const T =
      e.bits2int ||
      function (P) {
        if (P.length > 8192) throw new Error("input is too large");
        const y = hr(P),
          m = P.length * 8 - e.nBitLength;
        return m > 0 ? y >> BigInt(m) : y;
      },
    v =
      e.bits2int_modN ||
      function (P) {
        return o(T(P));
      },
    I = Uo(e.nBitLength);
  function O(P) {
    return (Bt("num < 2^" + e.nBitLength, P, jt, I), Zr(P, e.nByteLength));
  }
  function D(P, y, m = j) {
    if (["recovered", "canonical"].some((te) => te in m)) throw new Error("sign() legacy options not supported");
    const { hash: $, randomBytes: x } = e;
    let { lowS: S, prehash: C, extraEntropy: k } = m;
    (S == null && (S = !0), (P = We("msgHash", P)), _c(m), C && (P = We("prehashed msgHash", $(P))));
    const q = v(P),
      z = h(y),
      L = [O(z), O(q)];
    if (k != null && k !== !1) {
      const te = k === !0 ? x(t.BYTES) : k;
      L.push(We("extraEntropy", te));
    }
    const H = xi(...L),
      K = q;
    function oe(te) {
      const J = T(te);
      if (!l(J)) return;
      const Ce = a(J),
        Ie = c.BASE.multiply(J).toAffine(),
        Re = o(Ie.x);
      if (Re === jt) return;
      const Qe = o(Ce * o(K + Re * z));
      if (Qe === jt) return;
      let Xe = (Ie.x === Re ? 0 : 2) | Number(Ie.y & we),
        vr = Qe;
      return (S && f(Qe) && ((vr = p(Qe)), (Xe ^= 1)), new w(Re, vr, Xe));
    }
    return { seed: H, k2sig: oe };
  }
  const j = { lowS: e.lowS, prehash: !1 },
    N = { lowS: e.lowS, prehash: !1 };
  function B(P, y, m = j) {
    const { seed: $, k2sig: x } = D(P, y, m),
      S = e;
    return bl(S.hash.outputLen, S.nByteLength, S.hmac)($, x);
  }
  c.BASE._setWindowSize(8);
  function M(P, y, m, $ = N) {
    var Qe;
    const x = P;
    ((y = We("msgHash", y)), (m = We("publicKey", m)));
    const { lowS: S, prehash: C, format: k } = $;
    if ((_c($), "strict" in $)) throw new Error("options.strict was renamed to lowS");
    if (k !== void 0 && k !== "compact" && k !== "der") throw new Error("format must be compact or der");
    const q = typeof x == "string" || pr(x),
      z = !q && !k && typeof x == "object" && x !== null && typeof x.r == "bigint" && typeof x.s == "bigint";
    if (!q && !z) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let L, H;
    try {
      if ((z && (L = new w(x.r, x.s)), q)) {
        try {
          k !== "compact" && (L = w.fromDER(x));
        } catch (Xe) {
          if (!(Xe instanceof Nt.Err)) throw Xe;
        }
        !L && k !== "der" && (L = w.fromCompact(x));
      }
      H = c.fromHex(m);
    } catch {
      return !1;
    }
    if (!L || (S && L.hasHighS())) return !1;
    C && (y = e.hash(y));
    const { r: K, s: oe } = L,
      te = v(y),
      J = a(oe),
      Ce = o(te * J),
      Ie = o(K * J),
      Re = (Qe = c.BASE.multiplyAndAddUnsafe(H, Ce, Ie)) == null ? void 0 : Qe.toAffine();
    return Re ? o(Re.x) === K : !1;
  }
  return {
    CURVE: e,
    getPublicKey: b,
    getSharedSecret: A,
    sign: B,
    verify: M,
    ProjectivePoint: c,
    Signature: w,
    utils: E,
  };
}
function zv(r) {
  return { hash: r, hmac: (e, ...t) => Ts(r, e, Ww(...t)), randomBytes: ri };
}
function Hv(r, e) {
  const t = (i) => Mv({ ...r, ...zv(i) });
  return { ...t(e), create: t };
}
const Pl = _l(BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff")),
  Vv = Pl.create(BigInt("-3")),
  Kv = BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
  Wv = Hv(
    {
      a: Vv,
      b: Kv,
      Fp: Pl,
      n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
      Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
      Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
      h: BigInt(1),
      lowS: !1,
    },
    Fi,
  ),
  Al = "base10",
  je = "base16",
  pt = "base64pad",
  Vt = "base64url",
  Li = "utf8",
  xl = 0,
  Ut = 1,
  qi = 2,
  Gv = 0,
  $c = 1,
  Ei = 12,
  Fo = 32;
function Yv() {
  const r = ro.utils.randomPrivateKey(),
    e = ro.getPublicKey(r);
  return { privateKey: Me(r, je), publicKey: Me(e, je) };
}
function io() {
  const r = ri(Fo);
  return Me(r, je);
}
function Jv(r, e) {
  const t = ro.getSharedSecret(st(r, je), st(e, je)),
    i = ev(Fi, t, void 0, void 0, Fo);
  return Me(i, je);
}
function us(r) {
  const e = Fi(st(r, je));
  return Me(e, je);
}
function $t(r) {
  const e = Fi(st(r, Li));
  return Me(e, je);
}
function Cl(r) {
  return st(`${r}`, Al);
}
function fr(r) {
  return Number(Me(r, Al));
}
function Tl(r) {
  return r.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function Rl(r) {
  const e = r.replace(/-/g, "+").replace(/_/g, "/"),
    t = (4 - (e.length % 4)) % 4;
  return e + "=".repeat(t);
}
function Zv(r) {
  const e = Cl(typeof r.type < "u" ? r.type : xl);
  if (fr(e) === Ut && typeof r.senderPublicKey > "u") throw new Error("Missing sender public key for type 1 envelope");
  const t = typeof r.senderPublicKey < "u" ? st(r.senderPublicKey, je) : void 0,
    i = typeof r.iv < "u" ? st(r.iv, je) : ri(Ei),
    s = st(r.symKey, je),
    n = yl(s, i).encrypt(st(r.message, Li)),
    o = Nl({ type: e, sealed: n, iv: i, senderPublicKey: t });
  return r.encoding === Vt ? Tl(o) : o;
}
function Qv(r) {
  const e = st(r.symKey, je),
    { sealed: t, iv: i } = Ci({ encoded: r.encoded, encoding: r.encoding }),
    s = yl(e, i).decrypt(t);
  if (s === null) throw new Error("Failed to decrypt");
  return Me(s, Li);
}
function Xv(r, e) {
  const t = Cl(qi),
    i = ri(Ei),
    s = st(r, Li),
    n = Nl({ type: t, sealed: s, iv: i });
  return e === Vt ? Tl(n) : n;
}
function e0(r, e) {
  const { sealed: t } = Ci({ encoded: r, encoding: e });
  return Me(t, Li);
}
function Nl(r) {
  if (fr(r.type) === qi) return Me(vi([r.type, r.sealed]), pt);
  if (fr(r.type) === Ut) {
    if (typeof r.senderPublicKey > "u") throw new Error("Missing sender public key for type 1 envelope");
    return Me(vi([r.type, r.senderPublicKey, r.iv, r.sealed]), pt);
  }
  return Me(vi([r.type, r.iv, r.sealed]), pt);
}
function Ci(r) {
  const e = (r.encoding || pt) === Vt ? Rl(r.encoded) : r.encoded,
    t = st(e, pt),
    i = t.slice(Gv, $c),
    s = $c;
  if (fr(i) === Ut) {
    const c = s + Fo,
      h = c + Ei,
      u = t.slice(s, c),
      l = t.slice(c, h),
      d = t.slice(h);
    return { type: i, sealed: d, iv: l, senderPublicKey: u };
  }
  if (fr(i) === qi) {
    const c = t.slice(s),
      h = ri(Ei);
    return { type: i, sealed: c, iv: h };
  }
  const n = s + Ei,
    o = t.slice(s, n),
    a = t.slice(n);
  return { type: i, sealed: a, iv: o };
}
function t0(r, e) {
  const t = Ci({ encoded: r, encoding: e == null ? void 0 : e.encoding });
  return jl({
    type: fr(t.type),
    senderPublicKey: typeof t.senderPublicKey < "u" ? Me(t.senderPublicKey, je) : void 0,
    receiverPublicKey: e == null ? void 0 : e.receiverPublicKey,
  });
}
function jl(r) {
  const e = (r == null ? void 0 : r.type) || xl;
  if (e === Ut) {
    if (typeof (r == null ? void 0 : r.senderPublicKey) > "u") throw new Error("missing sender public key");
    if (typeof (r == null ? void 0 : r.receiverPublicKey) > "u") throw new Error("missing receiver public key");
  }
  return {
    type: e,
    senderPublicKey: r == null ? void 0 : r.senderPublicKey,
    receiverPublicKey: r == null ? void 0 : r.receiverPublicKey,
  };
}
function Dc(r) {
  return r.type === Ut && typeof r.senderPublicKey == "string" && typeof r.receiverPublicKey == "string";
}
function Sc(r) {
  return r.type === qi;
}
function r0(r) {
  const e = _e.from(r.x, "base64"),
    t = _e.from(r.y, "base64");
  return vi([new Uint8Array([4]), e, t]);
}
function i0(r, e) {
  const [t, i, s] = r.split("."),
    n = _e.from(Rl(s), "base64");
  if (n.length !== 64) throw new Error("Invalid signature length");
  const o = n.slice(0, 32),
    a = n.slice(32, 64),
    c = `${t}.${i}`,
    h = Fi(c),
    u = r0(e);
  if (!Wv.verify(vi([o, a]), h, u)) throw new Error("Invalid signature");
  return Vn(r).payload;
}
const s0 = "irn";
function vs(r) {
  return (r == null ? void 0 : r.relay) || { protocol: s0 };
}
function wi(r) {
  const e = hw[r];
  if (typeof e > "u") throw new Error(`Relay Protocol not supported: ${r}`);
  return e;
}
function n0(r, e = "-") {
  const t = {},
    i = "relay" + e;
  return (
    Object.keys(r).forEach((s) => {
      if (s.startsWith(i)) {
        const n = s.replace(i, ""),
          o = r[s];
        t[n] = o;
      }
    }),
    t
  );
}
function Oc(r) {
  if (!r.includes("wc:")) {
    const h = il(r);
    h != null && h.includes("wc:") && (r = h);
  }
  ((r = r.includes("wc://") ? r.replace("wc://", "") : r), (r = r.includes("wc:") ? r.replace("wc:", "") : r));
  const e = r.indexOf(":"),
    t = r.indexOf("?") !== -1 ? r.indexOf("?") : void 0,
    i = r.substring(0, e),
    s = r.substring(e + 1, t).split("@"),
    n = typeof t < "u" ? r.substring(t) : "",
    o = new URLSearchParams(n),
    a = {};
  o.forEach((h, u) => {
    a[u] = h;
  });
  const c = typeof a.methods == "string" ? a.methods.split(",") : void 0;
  return {
    protocol: i,
    topic: o0(s[0]),
    version: parseInt(s[1], 10),
    symKey: a.symKey,
    relay: n0(a),
    methods: c,
    expiryTimestamp: a.expiryTimestamp ? parseInt(a.expiryTimestamp, 10) : void 0,
  };
}
function o0(r) {
  return r.startsWith("//") ? r.substring(2) : r;
}
function a0(r, e = "-") {
  const t = "relay",
    i = {};
  return (
    Object.keys(r).forEach((s) => {
      const n = s,
        o = t + e + n;
      r[n] && (i[o] = r[n]);
    }),
    i
  );
}
function Pc(r) {
  const e = new URLSearchParams(),
    t = a0(r.relay);
  (Object.keys(t)
    .sort()
    .forEach((s) => {
      e.set(s, t[s]);
    }),
    e.set("symKey", r.symKey),
    r.expiryTimestamp && e.set("expiryTimestamp", r.expiryTimestamp.toString()),
    r.methods && e.set("methods", r.methods.join(",")));
  const i = e.toString();
  return `${r.protocol}:${r.topic}@${r.version}?${i}`;
}
function Qi(r, e, t) {
  return `${r}?wc_ev=${t}&topic=${e}`;
}
var c0 = Object.defineProperty,
  h0 = Object.defineProperties,
  u0 = Object.getOwnPropertyDescriptors,
  Ac = Object.getOwnPropertySymbols,
  l0 = Object.prototype.hasOwnProperty,
  d0 = Object.prototype.propertyIsEnumerable,
  xc = (r, e, t) => (e in r ? c0(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  p0 = (r, e) => {
    for (var t in e || (e = {})) l0.call(e, t) && xc(r, t, e[t]);
    if (Ac) for (var t of Ac(e)) d0.call(e, t) && xc(r, t, e[t]);
    return r;
  },
  f0 = (r, e) => h0(r, u0(e));
function si(r) {
  const e = [];
  return (
    r.forEach((t) => {
      const [i, s] = t.split(":");
      e.push(`${i}:${s}`);
    }),
    e
  );
}
function g0(r) {
  const e = [];
  return (
    Object.values(r).forEach((t) => {
      e.push(...si(t.accounts));
    }),
    e
  );
}
function y0(r, e) {
  const t = [];
  return (
    Object.values(r).forEach((i) => {
      si(i.accounts).includes(e) && t.push(...i.methods);
    }),
    t
  );
}
function m0(r, e) {
  const t = [];
  return (
    Object.values(r).forEach((i) => {
      si(i.accounts).includes(e) && t.push(...i.events);
    }),
    t
  );
}
function Us(r) {
  return r.includes(":");
}
function Mr(r) {
  return Us(r) ? r.split(":")[0] : r;
}
function Cc(r) {
  var e, t, i;
  const s = {};
  if (!Yt(r)) return s;
  for (const [n, o] of Object.entries(r)) {
    const a = Us(n) ? [n] : o.chains,
      c = o.methods || [],
      h = o.events || [],
      u = Mr(n);
    s[u] = f0(p0({}, s[u]), {
      chains: Dt(a, (e = s[u]) == null ? void 0 : e.chains),
      methods: Dt(c, (t = s[u]) == null ? void 0 : t.methods),
      events: Dt(h, (i = s[u]) == null ? void 0 : i.events),
    });
  }
  return s;
}
function w0(r) {
  const e = {};
  return (
    r == null ||
      r.forEach((t) => {
        var i;
        const [s, n] = t.split(":");
        (e[s] || (e[s] = { accounts: [], chains: [], events: [], methods: [] }),
          e[s].accounts.push(t),
          (i = e[s].chains) == null || i.push(`${s}:${n}`));
      }),
    e
  );
}
function Tc(r, e) {
  e = e.map((i) => i.replace("did:pkh:", ""));
  const t = w0(e);
  for (const [i, s] of Object.entries(t))
    (s.methods ? (s.methods = Dt(s.methods, r)) : (s.methods = r), (s.events = ["chainChanged", "accountsChanged"]));
  return t;
}
function b0(r, e) {
  var t, i, s, n, o, a;
  const c = Cc(r),
    h = Cc(e),
    u = {},
    l = Object.keys(c).concat(Object.keys(h));
  for (const d of l)
    u[d] = {
      chains: Dt((t = c[d]) == null ? void 0 : t.chains, (i = h[d]) == null ? void 0 : i.chains),
      methods: Dt((s = c[d]) == null ? void 0 : s.methods, (n = h[d]) == null ? void 0 : n.methods),
      events: Dt((o = c[d]) == null ? void 0 : o.events, (a = h[d]) == null ? void 0 : a.events),
    };
  return u;
}
const v0 = {
    INVALID_METHOD: { message: "Invalid method.", code: 1001 },
    INVALID_EVENT: { message: "Invalid event.", code: 1002 },
    INVALID_UPDATE_REQUEST: { message: "Invalid update request.", code: 1003 },
    INVALID_EXTEND_REQUEST: { message: "Invalid extend request.", code: 1004 },
    INVALID_SESSION_SETTLE_REQUEST: { message: "Invalid session settle request.", code: 1005 },
    UNAUTHORIZED_METHOD: { message: "Unauthorized method.", code: 3001 },
    UNAUTHORIZED_EVENT: { message: "Unauthorized event.", code: 3002 },
    UNAUTHORIZED_UPDATE_REQUEST: { message: "Unauthorized update request.", code: 3003 },
    UNAUTHORIZED_EXTEND_REQUEST: { message: "Unauthorized extend request.", code: 3004 },
    USER_REJECTED: { message: "User rejected.", code: 5e3 },
    USER_REJECTED_CHAINS: { message: "User rejected chains.", code: 5001 },
    USER_REJECTED_METHODS: { message: "User rejected methods.", code: 5002 },
    USER_REJECTED_EVENTS: { message: "User rejected events.", code: 5003 },
    UNSUPPORTED_CHAINS: { message: "Unsupported chains.", code: 5100 },
    UNSUPPORTED_METHODS: { message: "Unsupported methods.", code: 5101 },
    UNSUPPORTED_EVENTS: { message: "Unsupported events.", code: 5102 },
    UNSUPPORTED_ACCOUNTS: { message: "Unsupported accounts.", code: 5103 },
    UNSUPPORTED_NAMESPACE_KEY: { message: "Unsupported namespace key.", code: 5104 },
    USER_DISCONNECTED: { message: "User disconnected.", code: 6e3 },
    SESSION_SETTLEMENT_FAILED: { message: "Session settlement failed.", code: 7e3 },
    WC_METHOD_UNSUPPORTED: { message: "Unsupported wc_ method.", code: 10001 },
  },
  E0 = {
    NOT_INITIALIZED: { message: "Not initialized.", code: 1 },
    NO_MATCHING_KEY: { message: "No matching key.", code: 2 },
    RESTORE_WILL_OVERRIDE: { message: "Restore will override.", code: 3 },
    RESUBSCRIBED: { message: "Resubscribed.", code: 4 },
    MISSING_OR_INVALID: { message: "Missing or invalid.", code: 5 },
    EXPIRED: { message: "Expired.", code: 6 },
    UNKNOWN_TYPE: { message: "Unknown type.", code: 7 },
    MISMATCHED_TOPIC: { message: "Mismatched topic.", code: 8 },
    NON_CONFORMING_NAMESPACES: { message: "Non conforming namespaces.", code: 9 },
  };
function F(r, e) {
  const { message: t, code: i } = E0[r];
  return { message: e ? `${t} ${e}` : t, code: i };
}
function re(r, e) {
  const { message: t, code: i } = v0[r];
  return { message: e ? `${t} ${e}` : t, code: i };
}
function ft(r, e) {
  return !!Array.isArray(r);
}
function Yt(r) {
  return Object.getPrototypeOf(r) === Object.prototype && Object.keys(r).length;
}
function Oe(r) {
  return typeof r > "u";
}
function de(r, e) {
  return e && Oe(r) ? !0 : typeof r == "string" && !!r.trim().length;
}
function ko(r, e) {
  return e && Oe(r) ? !0 : typeof r == "number" && !isNaN(r);
}
function _0(r, e) {
  const { requiredNamespaces: t } = e,
    i = Object.keys(r.namespaces),
    s = Object.keys(t);
  let n = !0;
  return ar(s, i)
    ? (i.forEach((o) => {
        const { accounts: a, methods: c, events: h } = r.namespaces[o],
          u = si(a),
          l = t[o];
        (!ar(Qu(o, l), u) || !ar(l.methods, c) || !ar(l.events, h)) && (n = !1);
      }),
      n)
    : !1;
}
function Es(r) {
  return de(r, !1) && r.includes(":") ? r.split(":").length === 2 : !1;
}
function I0(r) {
  if (de(r, !1) && r.includes(":")) {
    const e = r.split(":");
    if (e.length === 3) {
      const t = e[0] + ":" + e[1];
      return !!e[2] && Es(t);
    }
  }
  return !1;
}
function $0(r) {
  function e(t) {
    try {
      return typeof new URL(t) < "u";
    } catch {
      return !1;
    }
  }
  try {
    if (de(r, !1)) {
      if (e(r)) return !0;
      const t = il(r);
      return e(t);
    }
  } catch {}
  return !1;
}
function D0(r) {
  var e;
  return (e = r == null ? void 0 : r.proposer) == null ? void 0 : e.publicKey;
}
function S0(r) {
  return r == null ? void 0 : r.topic;
}
function O0(r, e) {
  let t = null;
  return (
    de(r == null ? void 0 : r.publicKey, !1) ||
      (t = F("MISSING_OR_INVALID", `${e} controller public key should be a string`)),
    t
  );
}
function Rc(r) {
  let e = !0;
  return (ft(r) ? r.length && (e = r.every((t) => de(t, !1))) : (e = !1), e);
}
function P0(r, e, t) {
  let i = null;
  return (
    ft(e) && e.length
      ? e.forEach((s) => {
          i ||
            Es(s) ||
            (i = re(
              "UNSUPPORTED_CHAINS",
              `${t}, chain ${s} should be a string and conform to "namespace:chainId" format`,
            ));
        })
      : Es(r) ||
        (i = re(
          "UNSUPPORTED_CHAINS",
          `${t}, chains must be defined as "namespace:chainId" e.g. "eip155:1": {...} in the namespace key OR as an array of CAIP-2 chainIds e.g. eip155: { chains: ["eip155:1", "eip155:5"] }`,
        )),
    i
  );
}
function A0(r, e, t) {
  let i = null;
  return (
    Object.entries(r).forEach(([s, n]) => {
      if (i) return;
      const o = P0(s, Qu(s, n), `${e} ${t}`);
      o && (i = o);
    }),
    i
  );
}
function x0(r, e) {
  let t = null;
  return (
    ft(r)
      ? r.forEach((i) => {
          t ||
            I0(i) ||
            (t = re(
              "UNSUPPORTED_ACCOUNTS",
              `${e}, account ${i} should be a string and conform to "namespace:chainId:address" format`,
            ));
        })
      : (t = re(
          "UNSUPPORTED_ACCOUNTS",
          `${e}, accounts should be an array of strings conforming to "namespace:chainId:address" format`,
        )),
    t
  );
}
function C0(r, e) {
  let t = null;
  return (
    Object.values(r).forEach((i) => {
      if (t) return;
      const s = x0(i == null ? void 0 : i.accounts, `${e} namespace`);
      s && (t = s);
    }),
    t
  );
}
function T0(r, e) {
  let t = null;
  return (
    Rc(r == null ? void 0 : r.methods)
      ? Rc(r == null ? void 0 : r.events) ||
        (t = re("UNSUPPORTED_EVENTS", `${e}, events should be an array of strings or empty array for no events`))
      : (t = re("UNSUPPORTED_METHODS", `${e}, methods should be an array of strings or empty array for no methods`)),
    t
  );
}
function Bl(r, e) {
  let t = null;
  return (
    Object.values(r).forEach((i) => {
      if (t) return;
      const s = T0(i, `${e}, namespace`);
      s && (t = s);
    }),
    t
  );
}
function R0(r, e, t) {
  let i = null;
  if (r && Yt(r)) {
    const s = Bl(r, e);
    s && (i = s);
    const n = A0(r, e, t);
    n && (i = n);
  } else i = F("MISSING_OR_INVALID", `${e}, ${t} should be an object with data`);
  return i;
}
function bn(r, e) {
  let t = null;
  if (r && Yt(r)) {
    const i = Bl(r, e);
    i && (t = i);
    const s = C0(r, e);
    s && (t = s);
  } else t = F("MISSING_OR_INVALID", `${e}, namespaces should be an object with data`);
  return t;
}
function Ul(r) {
  return de(r.protocol, !0);
}
function N0(r, e) {
  let t = !1;
  return (
    r
      ? r &&
        ft(r) &&
        r.length &&
        r.forEach((i) => {
          t = Ul(i);
        })
      : (t = !0),
    t
  );
}
function j0(r) {
  return typeof r == "number";
}
function Le(r) {
  return typeof r < "u" && typeof r !== null;
}
function B0(r) {
  return !(!r || typeof r != "object" || !r.code || !ko(r.code, !1) || !r.message || !de(r.message, !1));
}
function U0(r) {
  return !(Oe(r) || !de(r.method, !1));
}
function F0(r) {
  return !(Oe(r) || (Oe(r.result) && Oe(r.error)) || !ko(r.id, !1) || !de(r.jsonrpc, !1));
}
function k0(r) {
  return !(Oe(r) || !de(r.name, !1));
}
function Nc(r, e) {
  return !(!Es(e) || !g0(r).includes(e));
}
function L0(r, e, t) {
  return de(t, !1) ? y0(r, e).includes(t) : !1;
}
function q0(r, e, t) {
  return de(t, !1) ? m0(r, e).includes(t) : !1;
}
function jc(r, e, t) {
  let i = null;
  const s = M0(r),
    n = z0(e),
    o = Object.keys(s),
    a = Object.keys(n),
    c = Bc(Object.keys(r)),
    h = Bc(Object.keys(e)),
    u = c.filter((l) => !h.includes(l));
  return (
    u.length &&
      (i = F(
        "NON_CONFORMING_NAMESPACES",
        `${t} namespaces keys don't satisfy requiredNamespaces.
      Required: ${u.toString()}
      Received: ${Object.keys(e).toString()}`,
      )),
    ar(o, a) ||
      (i = F(
        "NON_CONFORMING_NAMESPACES",
        `${t} namespaces chains don't satisfy required namespaces.
      Required: ${o.toString()}
      Approved: ${a.toString()}`,
      )),
    Object.keys(e).forEach((l) => {
      if (!l.includes(":") || i) return;
      const d = si(e[l].accounts);
      d.includes(l) ||
        (i = F(
          "NON_CONFORMING_NAMESPACES",
          `${t} namespaces accounts don't satisfy namespace accounts for ${l}
        Required: ${l}
        Approved: ${d.toString()}`,
        ));
    }),
    o.forEach((l) => {
      i ||
        (ar(s[l].methods, n[l].methods)
          ? ar(s[l].events, n[l].events) ||
            (i = F("NON_CONFORMING_NAMESPACES", `${t} namespaces events don't satisfy namespace events for ${l}`))
          : (i = F("NON_CONFORMING_NAMESPACES", `${t} namespaces methods don't satisfy namespace methods for ${l}`)));
    }),
    i
  );
}
function M0(r) {
  const e = {};
  return (
    Object.keys(r).forEach((t) => {
      var i;
      t.includes(":")
        ? (e[t] = r[t])
        : (i = r[t].chains) == null ||
          i.forEach((s) => {
            e[s] = { methods: r[t].methods, events: r[t].events };
          });
    }),
    e
  );
}
function Bc(r) {
  return [...new Set(r.map((e) => (e.includes(":") ? e.split(":")[0] : e)))];
}
function z0(r) {
  const e = {};
  return (
    Object.keys(r).forEach((t) => {
      if (t.includes(":")) e[t] = r[t];
      else {
        const i = si(r[t].accounts);
        i == null ||
          i.forEach((s) => {
            e[s] = {
              accounts: r[t].accounts.filter((n) => n.includes(`${s}:`)),
              methods: r[t].methods,
              events: r[t].events,
            };
          });
      }
    }),
    e
  );
}
function H0(r, e) {
  return ko(r, !1) && r <= e.max && r >= e.min;
}
function Uc() {
  const r = Bi();
  return new Promise((e) => {
    switch (r) {
      case Ye.browser:
        e(V0());
        break;
      case Ye.reactNative:
        e(K0());
        break;
      case Ye.node:
        e(W0());
        break;
      default:
        e(!0);
    }
  });
}
function V0() {
  return ti() && (navigator == null ? void 0 : navigator.onLine);
}
async function K0() {
  if (Jt() && typeof V < "u" && V != null && V.NetInfo) {
    const r = await (V == null ? void 0 : V.NetInfo.fetch());
    return r == null ? void 0 : r.isConnected;
  }
  return !0;
}
function W0() {
  return !0;
}
function G0(r) {
  switch (Bi()) {
    case Ye.browser:
      Y0(r);
      break;
    case Ye.reactNative:
      J0(r);
      break;
  }
}
function Y0(r) {
  !Jt() && ti() && (window.addEventListener("online", () => r(!0)), window.addEventListener("offline", () => r(!1)));
}
function J0(r) {
  var e;
  Jt() &&
    typeof V < "u" &&
    V != null &&
    V.NetInfo &&
    ((e = V) == null || e.NetInfo.addEventListener((t) => r(t == null ? void 0 : t.isConnected)));
}
function Z0() {
  var r;
  return ti() && Ft.getDocument() ? ((r = Ft.getDocument()) == null ? void 0 : r.visibilityState) === "visible" : !0;
}
const vn = {};
class di {
  static get(e) {
    return vn[e];
  }
  static set(e, t) {
    vn[e] = t;
  }
  static delete(e) {
    delete vn[e];
  }
}
class yr {}
let Q0 = class extends yr {
  constructor(e) {
    super();
  }
};
const Fc = U.FIVE_SECONDS,
  mr = { pulse: "heartbeat_pulse" };
let X0 = class Fl extends Q0 {
  constructor(e) {
    (super(e),
      (this.events = new Ze.EventEmitter()),
      (this.interval = Fc),
      (this.interval = (e == null ? void 0 : e.interval) || Fc));
  }
  static async init(e) {
    const t = new Fl(e);
    return (await t.init(), t);
  }
  async init() {
    await this.initialize();
  }
  stop() {
    clearInterval(this.intervalRef);
  }
  on(e, t) {
    this.events.on(e, t);
  }
  once(e, t) {
    this.events.once(e, t);
  }
  off(e, t) {
    this.events.off(e, t);
  }
  removeListener(e, t) {
    this.events.removeListener(e, t);
  }
  async initialize() {
    this.intervalRef = setInterval(() => this.pulse(), U.toMiliseconds(this.interval));
  }
  pulse() {
    this.events.emit(mr.pulse);
  }
};
const e1 =
    /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  t1 =
    /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  r1 = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function i1(r, e) {
  if (r === "__proto__" || (r === "constructor" && e && typeof e == "object" && "prototype" in e)) {
    s1(r);
    return;
  }
  return e;
}
function s1(r) {
  console.warn(`[destr] Dropping "${r}" key to prevent prototype pollution.`);
}
function Xi(r, e = {}) {
  if (typeof r != "string") return r;
  if (r[0] === '"' && r[r.length - 1] === '"' && r.indexOf("\\") === -1) return r.slice(1, -1);
  const t = r.trim();
  if (t.length <= 9)
    switch (t.toLowerCase()) {
      case "true":
        return !0;
      case "false":
        return !1;
      case "undefined":
        return;
      case "null":
        return null;
      case "nan":
        return Number.NaN;
      case "infinity":
        return Number.POSITIVE_INFINITY;
      case "-infinity":
        return Number.NEGATIVE_INFINITY;
    }
  if (!r1.test(r)) {
    if (e.strict) throw new SyntaxError("[destr] Invalid JSON");
    return r;
  }
  try {
    if (e1.test(r) || t1.test(r)) {
      if (e.strict) throw new Error("[destr] Possible prototype pollution");
      return JSON.parse(r, i1);
    }
    return JSON.parse(r);
  } catch (i) {
    if (e.strict) throw i;
    return r;
  }
}
function n1(r) {
  return !r || typeof r.then != "function" ? Promise.resolve(r) : r;
}
function me(r, ...e) {
  try {
    return n1(r(...e));
  } catch (t) {
    return Promise.reject(t);
  }
}
function o1(r) {
  const e = typeof r;
  return r === null || (e !== "object" && e !== "function");
}
function a1(r) {
  const e = Object.getPrototypeOf(r);
  return !e || e.isPrototypeOf(Object);
}
function ls(r) {
  if (o1(r)) return String(r);
  if (a1(r) || Array.isArray(r)) return JSON.stringify(r);
  if (typeof r.toJSON == "function") return ls(r.toJSON());
  throw new Error("[unstorage] Cannot stringify value!");
}
const so = "base64:";
function c1(r) {
  return typeof r == "string" ? r : so + l1(r);
}
function h1(r) {
  return typeof r != "string" || !r.startsWith(so) ? r : u1(r.slice(so.length));
}
function u1(r) {
  return globalThis.Buffer ? _e.from(r, "base64") : Uint8Array.from(globalThis.atob(r), (e) => e.codePointAt(0));
}
function l1(r) {
  return globalThis.Buffer ? _e.from(r).toString("base64") : globalThis.btoa(String.fromCodePoint(...r));
}
function ke(r) {
  var e;
  return (
    (r &&
      ((e = r.split("?")[0]) == null ? void 0 : e.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, ""))) ||
    ""
  );
}
function d1(...r) {
  return ke(r.join(":"));
}
function es(r) {
  return ((r = ke(r)), r ? r + ":" : "");
}
function p1(r, e) {
  if (e === void 0) return !0;
  let t = 0,
    i = r.indexOf(":");
  for (; i > -1; ) (t++, (i = r.indexOf(":", i + 1)));
  return t <= e;
}
function f1(r, e) {
  return e ? r.startsWith(e) && r[r.length - 1] !== "$" : r[r.length - 1] !== "$";
}
const g1 = "memory",
  y1 = () => {
    const r = new Map();
    return {
      name: g1,
      getInstance: () => r,
      hasItem(e) {
        return r.has(e);
      },
      getItem(e) {
        return r.get(e) ?? null;
      },
      getItemRaw(e) {
        return r.get(e) ?? null;
      },
      setItem(e, t) {
        r.set(e, t);
      },
      setItemRaw(e, t) {
        r.set(e, t);
      },
      removeItem(e) {
        r.delete(e);
      },
      getKeys() {
        return [...r.keys()];
      },
      clear() {
        r.clear();
      },
      dispose() {
        r.clear();
      },
    };
  };
function m1(r = {}) {
  const e = { mounts: { "": r.driver || y1() }, mountpoints: [""], watching: !1, watchListeners: [], unwatch: {} },
    t = (h) => {
      for (const u of e.mountpoints)
        if (h.startsWith(u)) return { base: u, relativeKey: h.slice(u.length), driver: e.mounts[u] };
      return { base: "", relativeKey: h, driver: e.mounts[""] };
    },
    i = (h, u) =>
      e.mountpoints
        .filter((l) => l.startsWith(h) || (u && h.startsWith(l)))
        .map((l) => ({
          relativeBase: h.length > l.length ? h.slice(l.length) : void 0,
          mountpoint: l,
          driver: e.mounts[l],
        })),
    s = (h, u) => {
      if (e.watching) {
        u = ke(u);
        for (const l of e.watchListeners) l(h, u);
      }
    },
    n = async () => {
      if (!e.watching) {
        e.watching = !0;
        for (const h in e.mounts) e.unwatch[h] = await kc(e.mounts[h], s, h);
      }
    },
    o = async () => {
      if (e.watching) {
        for (const h in e.unwatch) await e.unwatch[h]();
        ((e.unwatch = {}), (e.watching = !1));
      }
    },
    a = (h, u, l) => {
      const d = new Map(),
        f = (p) => {
          let g = d.get(p.base);
          return (g || ((g = { driver: p.driver, base: p.base, items: [] }), d.set(p.base, g)), g);
        };
      for (const p of h) {
        const g = typeof p == "string",
          w = ke(g ? p : p.key),
          E = g ? void 0 : p.value,
          b = g || !p.options ? u : { ...u, ...p.options },
          _ = t(w);
        f(_).items.push({ key: w, value: E, relativeKey: _.relativeKey, options: b });
      }
      return Promise.all([...d.values()].map((p) => l(p))).then((p) => p.flat());
    },
    c = {
      hasItem(h, u = {}) {
        h = ke(h);
        const { relativeKey: l, driver: d } = t(h);
        return me(d.hasItem, l, u);
      },
      getItem(h, u = {}) {
        h = ke(h);
        const { relativeKey: l, driver: d } = t(h);
        return me(d.getItem, l, u).then((f) => Xi(f));
      },
      getItems(h, u = {}) {
        return a(h, u, (l) =>
          l.driver.getItems
            ? me(
                l.driver.getItems,
                l.items.map((d) => ({ key: d.relativeKey, options: d.options })),
                u,
              ).then((d) => d.map((f) => ({ key: d1(l.base, f.key), value: Xi(f.value) })))
            : Promise.all(
                l.items.map((d) =>
                  me(l.driver.getItem, d.relativeKey, d.options).then((f) => ({ key: d.key, value: Xi(f) })),
                ),
              ),
        );
      },
      getItemRaw(h, u = {}) {
        h = ke(h);
        const { relativeKey: l, driver: d } = t(h);
        return d.getItemRaw ? me(d.getItemRaw, l, u) : me(d.getItem, l, u).then((f) => h1(f));
      },
      async setItem(h, u, l = {}) {
        if (u === void 0) return c.removeItem(h);
        h = ke(h);
        const { relativeKey: d, driver: f } = t(h);
        f.setItem && (await me(f.setItem, d, ls(u), l), f.watch || s("update", h));
      },
      async setItems(h, u) {
        await a(h, u, async (l) => {
          if (l.driver.setItems)
            return me(
              l.driver.setItems,
              l.items.map((d) => ({ key: d.relativeKey, value: ls(d.value), options: d.options })),
              u,
            );
          l.driver.setItem &&
            (await Promise.all(l.items.map((d) => me(l.driver.setItem, d.relativeKey, ls(d.value), d.options))));
        });
      },
      async setItemRaw(h, u, l = {}) {
        if (u === void 0) return c.removeItem(h, l);
        h = ke(h);
        const { relativeKey: d, driver: f } = t(h);
        if (f.setItemRaw) await me(f.setItemRaw, d, u, l);
        else if (f.setItem) await me(f.setItem, d, c1(u), l);
        else return;
        f.watch || s("update", h);
      },
      async removeItem(h, u = {}) {
        (typeof u == "boolean" && (u = { removeMeta: u }), (h = ke(h)));
        const { relativeKey: l, driver: d } = t(h);
        d.removeItem &&
          (await me(d.removeItem, l, u),
          (u.removeMeta || u.removeMata) && (await me(d.removeItem, l + "$", u)),
          d.watch || s("remove", h));
      },
      async getMeta(h, u = {}) {
        (typeof u == "boolean" && (u = { nativeOnly: u }), (h = ke(h)));
        const { relativeKey: l, driver: d } = t(h),
          f = Object.create(null);
        if ((d.getMeta && Object.assign(f, await me(d.getMeta, l, u)), !u.nativeOnly)) {
          const p = await me(d.getItem, l + "$", u).then((g) => Xi(g));
          p &&
            typeof p == "object" &&
            (typeof p.atime == "string" && (p.atime = new Date(p.atime)),
            typeof p.mtime == "string" && (p.mtime = new Date(p.mtime)),
            Object.assign(f, p));
        }
        return f;
      },
      setMeta(h, u, l = {}) {
        return this.setItem(h + "$", u, l);
      },
      removeMeta(h, u = {}) {
        return this.removeItem(h + "$", u);
      },
      async getKeys(h, u = {}) {
        var w;
        h = es(h);
        const l = i(h, !0);
        let d = [];
        const f = [];
        let p = !0;
        for (const E of l) {
          ((w = E.driver.flags) != null && w.maxDepth) || (p = !1);
          const b = await me(E.driver.getKeys, E.relativeBase, u);
          for (const _ of b) {
            const A = E.mountpoint + ke(_);
            d.some((T) => A.startsWith(T)) || f.push(A);
          }
          d = [E.mountpoint, ...d.filter((_) => !_.startsWith(E.mountpoint))];
        }
        const g = u.maxDepth !== void 0 && !p;
        return f.filter((E) => (!g || p1(E, u.maxDepth)) && f1(E, h));
      },
      async clear(h, u = {}) {
        ((h = es(h)),
          await Promise.all(
            i(h, !1).map(async (l) => {
              if (l.driver.clear) return me(l.driver.clear, l.relativeBase, u);
              if (l.driver.removeItem) {
                const d = await l.driver.getKeys(l.relativeBase || "", u);
                return Promise.all(d.map((f) => l.driver.removeItem(f, u)));
              }
            }),
          ));
      },
      async dispose() {
        await Promise.all(Object.values(e.mounts).map((h) => Lc(h)));
      },
      async watch(h) {
        return (
          await n(),
          e.watchListeners.push(h),
          async () => {
            ((e.watchListeners = e.watchListeners.filter((u) => u !== h)),
              e.watchListeners.length === 0 && (await o()));
          }
        );
      },
      async unwatch() {
        ((e.watchListeners = []), await o());
      },
      mount(h, u) {
        if (((h = es(h)), h && e.mounts[h])) throw new Error(`already mounted at ${h}`);
        return (
          h && (e.mountpoints.push(h), e.mountpoints.sort((l, d) => d.length - l.length)),
          (e.mounts[h] = u),
          e.watching &&
            Promise.resolve(kc(u, s, h))
              .then((l) => {
                e.unwatch[h] = l;
              })
              .catch(console.error),
          c
        );
      },
      async unmount(h, u = !0) {
        var l, d;
        ((h = es(h)),
          !(!h || !e.mounts[h]) &&
            (e.watching && h in e.unwatch && ((d = (l = e.unwatch)[h]) == null || d.call(l), delete e.unwatch[h]),
            u && (await Lc(e.mounts[h])),
            (e.mountpoints = e.mountpoints.filter((f) => f !== h)),
            delete e.mounts[h]));
      },
      getMount(h = "") {
        h = ke(h) + ":";
        const u = t(h);
        return { driver: u.driver, base: u.base };
      },
      getMounts(h = "", u = {}) {
        return ((h = ke(h)), i(h, u.parents).map((d) => ({ driver: d.driver, base: d.mountpoint })));
      },
      keys: (h, u = {}) => c.getKeys(h, u),
      get: (h, u = {}) => c.getItem(h, u),
      set: (h, u, l = {}) => c.setItem(h, u, l),
      has: (h, u = {}) => c.hasItem(h, u),
      del: (h, u = {}) => c.removeItem(h, u),
      remove: (h, u = {}) => c.removeItem(h, u),
    };
  return c;
}
function kc(r, e, t) {
  return r.watch ? r.watch((i, s) => e(i, t + s)) : () => {};
}
async function Lc(r) {
  typeof r.dispose == "function" && (await me(r.dispose));
}
const w1 = "idb-keyval";
var b1 = (r = {}) => {
  const e = r.base && r.base.length > 0 ? `${r.base}:` : "",
    t = (s) => e + s;
  let i;
  return (
    r.dbName && r.storeName && (i = ru(r.dbName, r.storeName)),
    {
      name: w1,
      options: r,
      async hasItem(s) {
        return !(typeof (await Xo(t(s), i)) > "u");
      },
      async getItem(s) {
        return (await Xo(t(s), i)) ?? null;
      },
      setItem(s, n) {
        return Nd(t(s), n, i);
      },
      removeItem(s) {
        return jd(t(s), i);
      },
      getKeys() {
        return Fd(i);
      },
      clear() {
        return Bd(i);
      },
    }
  );
};
const v1 = "WALLET_CONNECT_V2_INDEXED_DB",
  E1 = "keyvaluestorage";
let _1 = class {
  constructor() {
    this.indexedDb = m1({ driver: b1({ dbName: v1, storeName: E1 }) });
  }
  async getKeys() {
    return this.indexedDb.getKeys();
  }
  async getEntries() {
    return (await this.indexedDb.getItems(await this.indexedDb.getKeys())).map((e) => [e.key, e.value]);
  }
  async getItem(e) {
    const t = await this.indexedDb.getItem(e);
    if (t !== null) return t;
  }
  async setItem(e, t) {
    await this.indexedDb.setItem(e, kt(t));
  }
  async removeItem(e) {
    await this.indexedDb.removeItem(e);
  }
};
var En =
    typeof globalThis < "u"
      ? globalThis
      : typeof window < "u"
        ? window
        : typeof V < "u"
          ? V
          : typeof self < "u"
            ? self
            : {},
  ds = { exports: {} };
(function () {
  let r;
  function e() {}
  ((r = e),
    (r.prototype.getItem = function (t) {
      return this.hasOwnProperty(t) ? String(this[t]) : null;
    }),
    (r.prototype.setItem = function (t, i) {
      this[t] = String(i);
    }),
    (r.prototype.removeItem = function (t) {
      delete this[t];
    }),
    (r.prototype.clear = function () {
      const t = this;
      Object.keys(t).forEach(function (i) {
        ((t[i] = void 0), delete t[i]);
      });
    }),
    (r.prototype.key = function (t) {
      return ((t = t || 0), Object.keys(this)[t]);
    }),
    r.prototype.__defineGetter__("length", function () {
      return Object.keys(this).length;
    }),
    typeof En < "u" && En.localStorage
      ? (ds.exports = En.localStorage)
      : typeof window < "u" && window.localStorage
        ? (ds.exports = window.localStorage)
        : (ds.exports = new e()));
})();
function I1(r) {
  var e;
  return [r[0], lr((e = r[1]) != null ? e : "")];
}
let $1 = class {
  constructor() {
    this.localStorage = ds.exports;
  }
  async getKeys() {
    return Object.keys(this.localStorage);
  }
  async getEntries() {
    return Object.entries(this.localStorage).map(I1);
  }
  async getItem(e) {
    const t = this.localStorage.getItem(e);
    if (t !== null) return lr(t);
  }
  async setItem(e, t) {
    this.localStorage.setItem(e, kt(t));
  }
  async removeItem(e) {
    this.localStorage.removeItem(e);
  }
};
const D1 = "wc_storage_version",
  qc = 1,
  S1 = async (r, e, t) => {
    const i = D1,
      s = await e.getItem(i);
    if (s && s >= qc) {
      t(e);
      return;
    }
    const n = await r.getKeys();
    if (!n.length) {
      t(e);
      return;
    }
    const o = [];
    for (; n.length; ) {
      const a = n.shift();
      if (!a) continue;
      const c = a.toLowerCase();
      if (c.includes("wc@") || c.includes("walletconnect") || c.includes("wc_") || c.includes("wallet_connect")) {
        const h = await r.getItem(a);
        (await e.setItem(a, h), o.push(a));
      }
    }
    (await e.setItem(i, qc), t(e), O1(r, o));
  },
  O1 = async (r, e) => {
    e.length &&
      e.forEach(async (t) => {
        await r.removeItem(t);
      });
  };
let P1 = class {
  constructor() {
    ((this.initialized = !1),
      (this.setInitialized = (t) => {
        ((this.storage = t), (this.initialized = !0));
      }));
    const e = new $1();
    this.storage = e;
    try {
      const t = new _1();
      S1(e, t, this.setInitialized);
    } catch {
      this.initialized = !0;
    }
  }
  async getKeys() {
    return (await this.initialize(), this.storage.getKeys());
  }
  async getEntries() {
    return (await this.initialize(), this.storage.getEntries());
  }
  async getItem(e) {
    return (await this.initialize(), this.storage.getItem(e));
  }
  async setItem(e, t) {
    return (await this.initialize(), this.storage.setItem(e, t));
  }
  async removeItem(e) {
    return (await this.initialize(), this.storage.removeItem(e));
  }
  async initialize() {
    this.initialized ||
      (await new Promise((e) => {
        const t = setInterval(() => {
          this.initialized && (clearInterval(t), e());
        }, 20);
      }));
  }
};
var _n, Mc;
function A1() {
  if (Mc) return _n;
  Mc = 1;
  function r(t) {
    try {
      return JSON.stringify(t);
    } catch {
      return '"[Circular]"';
    }
  }
  _n = e;
  function e(t, i, s) {
    var n = (s && s.stringify) || r,
      o = 1;
    if (typeof t == "object" && t !== null) {
      var a = i.length + o;
      if (a === 1) return t;
      var c = new Array(a);
      c[0] = n(t);
      for (var h = 1; h < a; h++) c[h] = n(i[h]);
      return c.join(" ");
    }
    if (typeof t != "string") return t;
    var u = i.length;
    if (u === 0) return t;
    for (var l = "", d = 1 - o, f = -1, p = (t && t.length) || 0, g = 0; g < p; ) {
      if (t.charCodeAt(g) === 37 && g + 1 < p) {
        switch (((f = f > -1 ? f : 0), t.charCodeAt(g + 1))) {
          case 100:
          case 102:
            if (d >= u || i[d] == null) break;
            (f < g && (l += t.slice(f, g)), (l += Number(i[d])), (f = g + 2), g++);
            break;
          case 105:
            if (d >= u || i[d] == null) break;
            (f < g && (l += t.slice(f, g)), (l += Math.floor(Number(i[d]))), (f = g + 2), g++);
            break;
          case 79:
          case 111:
          case 106:
            if (d >= u || i[d] === void 0) break;
            f < g && (l += t.slice(f, g));
            var w = typeof i[d];
            if (w === "string") {
              ((l += "'" + i[d] + "'"), (f = g + 2), g++);
              break;
            }
            if (w === "function") {
              ((l += i[d].name || "<anonymous>"), (f = g + 2), g++);
              break;
            }
            ((l += n(i[d])), (f = g + 2), g++);
            break;
          case 115:
            if (d >= u) break;
            (f < g && (l += t.slice(f, g)), (l += String(i[d])), (f = g + 2), g++);
            break;
          case 37:
            (f < g && (l += t.slice(f, g)), (l += "%"), (f = g + 2), g++, d--);
            break;
        }
        ++d;
      }
      ++g;
    }
    return f === -1 ? t : (f < p && (l += t.slice(f)), l);
  }
  return _n;
}
var In, zc;
function x1() {
  if (zc) return In;
  zc = 1;
  const r = A1();
  In = s;
  const e = T().console || {},
    t = {
      mapHttpRequest: p,
      mapHttpResponse: p,
      wrapRequestSerializer: g,
      wrapResponseSerializer: g,
      wrapErrorSerializer: g,
      req: p,
      res: p,
      err: d,
    };
  function i(v, I) {
    return Array.isArray(v)
      ? v.filter(function (D) {
          return D !== "!stdSerializers.err";
        })
      : v === !0
        ? Object.keys(I)
        : !1;
  }
  function s(v) {
    ((v = v || {}), (v.browser = v.browser || {}));
    const I = v.browser.transmit;
    if (I && typeof I.send != "function") throw Error("pino: transmit option must have a send function");
    const O = v.browser.write || e;
    v.browser.write && (v.browser.asObject = !0);
    const D = v.serializers || {},
      j = i(v.browser.serialize, D);
    let N = v.browser.serialize;
    Array.isArray(v.browser.serialize) && v.browser.serialize.indexOf("!stdSerializers.err") > -1 && (N = !1);
    const B = ["error", "fatal", "warn", "info", "debug", "trace"];
    (typeof O == "function" && (O.error = O.fatal = O.warn = O.info = O.debug = O.trace = O),
      v.enabled === !1 && (v.level = "silent"));
    const M = v.level || "info",
      P = Object.create(O);
    (P.log || (P.log = w),
      Object.defineProperty(P, "levelVal", { get: m }),
      Object.defineProperty(P, "level", { get: $, set: x }));
    const y = { transmit: I, serialize: j, asObject: v.browser.asObject, levels: B, timestamp: f(v) };
    ((P.levels = s.levels),
      (P.level = M),
      (P.setMaxListeners =
        P.getMaxListeners =
        P.emit =
        P.addListener =
        P.on =
        P.prependListener =
        P.once =
        P.prependOnceListener =
        P.removeListener =
        P.removeAllListeners =
        P.listeners =
        P.listenerCount =
        P.eventNames =
        P.write =
        P.flush =
          w),
      (P.serializers = D),
      (P._serialize = j),
      (P._stdErrSerialize = N),
      (P.child = S),
      I && (P._logEvent = l()));
    function m() {
      return this.level === "silent" ? 1 / 0 : this.levels.values[this.level];
    }
    function $() {
      return this._level;
    }
    function x(C) {
      if (C !== "silent" && !this.levels.values[C]) throw Error("unknown level " + C);
      ((this._level = C),
        n(y, P, "error", "log"),
        n(y, P, "fatal", "error"),
        n(y, P, "warn", "error"),
        n(y, P, "info", "log"),
        n(y, P, "debug", "log"),
        n(y, P, "trace", "log"));
    }
    function S(C, k) {
      if (!C) throw new Error("missing bindings for child Pino");
      ((k = k || {}), j && C.serializers && (k.serializers = C.serializers));
      const q = k.serializers;
      if (j && q) {
        var z = Object.assign({}, D, q),
          L = v.browser.serialize === !0 ? Object.keys(z) : j;
        (delete C.serializers, c([C], L, z, this._stdErrSerialize));
      }
      function H(K) {
        ((this._childLevel = (K._childLevel | 0) + 1),
          (this.error = h(K, C, "error")),
          (this.fatal = h(K, C, "fatal")),
          (this.warn = h(K, C, "warn")),
          (this.info = h(K, C, "info")),
          (this.debug = h(K, C, "debug")),
          (this.trace = h(K, C, "trace")),
          z && ((this.serializers = z), (this._serialize = L)),
          I && (this._logEvent = l([].concat(K._logEvent.bindings, C))));
      }
      return ((H.prototype = this), new H(this));
    }
    return P;
  }
  ((s.levels = {
    values: { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 },
    labels: { 10: "trace", 20: "debug", 30: "info", 40: "warn", 50: "error", 60: "fatal" },
  }),
    (s.stdSerializers = t),
    (s.stdTimeFunctions = Object.assign({}, { nullTime: E, epochTime: b, unixTime: _, isoTime: A })));
  function n(v, I, O, D) {
    const j = Object.getPrototypeOf(I);
    ((I[O] = I.levelVal > I.levels.values[O] ? w : j[O] ? j[O] : e[O] || e[D] || w), o(v, I, O));
  }
  function o(v, I, O) {
    (!v.transmit && I[O] === w) ||
      (I[O] = (function (D) {
        return function () {
          const N = v.timestamp(),
            B = new Array(arguments.length),
            M = Object.getPrototypeOf && Object.getPrototypeOf(this) === e ? e : this;
          for (var P = 0; P < B.length; P++) B[P] = arguments[P];
          if (
            (v.serialize && !v.asObject && c(B, this._serialize, this.serializers, this._stdErrSerialize),
            v.asObject ? D.call(M, a(this, O, B, N)) : D.apply(M, B),
            v.transmit)
          ) {
            const y = v.transmit.level || I.level,
              m = s.levels.values[y],
              $ = s.levels.values[O];
            if ($ < m) return;
            u(
              this,
              {
                ts: N,
                methodLevel: O,
                methodValue: $,
                transmitValue: s.levels.values[v.transmit.level || I.level],
                send: v.transmit.send,
                val: I.levelVal,
              },
              B,
            );
          }
        };
      })(I[O]));
  }
  function a(v, I, O, D) {
    v._serialize && c(O, v._serialize, v.serializers, v._stdErrSerialize);
    const j = O.slice();
    let N = j[0];
    const B = {};
    (D && (B.time = D), (B.level = s.levels.values[I]));
    let M = (v._childLevel | 0) + 1;
    if ((M < 1 && (M = 1), N !== null && typeof N == "object")) {
      for (; M-- && typeof j[0] == "object"; ) Object.assign(B, j.shift());
      N = j.length ? r(j.shift(), j) : void 0;
    } else typeof N == "string" && (N = r(j.shift(), j));
    return (N !== void 0 && (B.msg = N), B);
  }
  function c(v, I, O, D) {
    for (const j in v)
      if (D && v[j] instanceof Error) v[j] = s.stdSerializers.err(v[j]);
      else if (typeof v[j] == "object" && !Array.isArray(v[j]))
        for (const N in v[j]) I && I.indexOf(N) > -1 && N in O && (v[j][N] = O[N](v[j][N]));
  }
  function h(v, I, O) {
    return function () {
      const D = new Array(1 + arguments.length);
      D[0] = I;
      for (var j = 1; j < D.length; j++) D[j] = arguments[j - 1];
      return v[O].apply(this, D);
    };
  }
  function u(v, I, O) {
    const D = I.send,
      j = I.ts,
      N = I.methodLevel,
      B = I.methodValue,
      M = I.val,
      P = v._logEvent.bindings;
    (c(
      O,
      v._serialize || Object.keys(v.serializers),
      v.serializers,
      v._stdErrSerialize === void 0 ? !0 : v._stdErrSerialize,
    ),
      (v._logEvent.ts = j),
      (v._logEvent.messages = O.filter(function (y) {
        return P.indexOf(y) === -1;
      })),
      (v._logEvent.level.label = N),
      (v._logEvent.level.value = B),
      D(N, v._logEvent, M),
      (v._logEvent = l(P)));
  }
  function l(v) {
    return { ts: 0, messages: [], bindings: v || [], level: { label: "", value: 0 } };
  }
  function d(v) {
    const I = { type: v.constructor.name, msg: v.message, stack: v.stack };
    for (const O in v) I[O] === void 0 && (I[O] = v[O]);
    return I;
  }
  function f(v) {
    return typeof v.timestamp == "function" ? v.timestamp : v.timestamp === !1 ? E : b;
  }
  function p() {
    return {};
  }
  function g(v) {
    return v;
  }
  function w() {}
  function E() {
    return !1;
  }
  function b() {
    return Date.now();
  }
  function _() {
    return Math.round(Date.now() / 1e3);
  }
  function A() {
    return new Date(Date.now()).toISOString();
  }
  function T() {
    function v(I) {
      return typeof I < "u" && I;
    }
    try {
      return (
        typeof globalThis < "u" ||
          Object.defineProperty(Object.prototype, "globalThis", {
            get: function () {
              return (delete Object.prototype.globalThis, (this.globalThis = this));
            },
            configurable: !0,
          }),
        globalThis
      );
    } catch {
      return v(self) || v(window) || v(this) || {};
    }
  }
  return In;
}
var kr = x1();
const Mi = _o(kr),
  C1 = { level: "info" },
  zi = "custom_context",
  Lo = 1e3 * 1024;
let T1 = class {
    constructor(e) {
      ((this.nodeValue = e), (this.sizeInBytes = new TextEncoder().encode(this.nodeValue).length), (this.next = null));
    }
    get value() {
      return this.nodeValue;
    }
    get size() {
      return this.sizeInBytes;
    }
  },
  Hc = class {
    constructor(e) {
      ((this.head = null),
        (this.tail = null),
        (this.lengthInNodes = 0),
        (this.maxSizeInBytes = e),
        (this.sizeInBytes = 0));
    }
    append(e) {
      const t = new T1(e);
      if (t.size > this.maxSizeInBytes)
        throw new Error(`[LinkedList] Value too big to insert into list: ${e} with size ${t.size}`);
      for (; this.size + t.size > this.maxSizeInBytes; ) this.shift();
      (this.head ? (this.tail && (this.tail.next = t), (this.tail = t)) : ((this.head = t), (this.tail = t)),
        this.lengthInNodes++,
        (this.sizeInBytes += t.size));
    }
    shift() {
      if (!this.head) return;
      const e = this.head;
      ((this.head = this.head.next),
        this.head || (this.tail = null),
        this.lengthInNodes--,
        (this.sizeInBytes -= e.size));
    }
    toArray() {
      const e = [];
      let t = this.head;
      for (; t !== null; ) (e.push(t.value), (t = t.next));
      return e;
    }
    get length() {
      return this.lengthInNodes;
    }
    get size() {
      return this.sizeInBytes;
    }
    toOrderedArray() {
      return Array.from(this);
    }
    [Symbol.iterator]() {
      let e = this.head;
      return {
        next: () => {
          if (!e) return { done: !0, value: null };
          const t = e.value;
          return ((e = e.next), { done: !1, value: t });
        },
      };
    }
  },
  kl = class {
    constructor(e, t = Lo) {
      ((this.level = e ?? "error"),
        (this.levelValue = kr.levels.values[this.level]),
        (this.MAX_LOG_SIZE_IN_BYTES = t),
        (this.logs = new Hc(this.MAX_LOG_SIZE_IN_BYTES)));
    }
    forwardToConsole(e, t) {
      t === kr.levels.values.error
        ? console.error(e)
        : t === kr.levels.values.warn
          ? console.warn(e)
          : t === kr.levels.values.debug
            ? console.debug(e)
            : t === kr.levels.values.trace
              ? console.trace(e)
              : console.log(e);
    }
    appendToLogs(e) {
      this.logs.append(kt({ timestamp: new Date().toISOString(), log: e }));
      const t = typeof e == "string" ? JSON.parse(e).level : e.level;
      t >= this.levelValue && this.forwardToConsole(e, t);
    }
    getLogs() {
      return this.logs;
    }
    clearLogs() {
      this.logs = new Hc(this.MAX_LOG_SIZE_IN_BYTES);
    }
    getLogArray() {
      return Array.from(this.logs);
    }
    logsToBlob(e) {
      const t = this.getLogArray();
      return (t.push(kt({ extraMetadata: e })), new Blob(t, { type: "application/json" }));
    }
  },
  R1 = class {
    constructor(e, t = Lo) {
      this.baseChunkLogger = new kl(e, t);
    }
    write(e) {
      this.baseChunkLogger.appendToLogs(e);
    }
    getLogs() {
      return this.baseChunkLogger.getLogs();
    }
    clearLogs() {
      this.baseChunkLogger.clearLogs();
    }
    getLogArray() {
      return this.baseChunkLogger.getLogArray();
    }
    logsToBlob(e) {
      return this.baseChunkLogger.logsToBlob(e);
    }
    downloadLogsBlobInBrowser(e) {
      const t = URL.createObjectURL(this.logsToBlob(e)),
        i = document.createElement("a");
      ((i.href = t),
        (i.download = `walletconnect-logs-${new Date().toISOString()}.txt`),
        document.body.appendChild(i),
        i.click(),
        document.body.removeChild(i),
        URL.revokeObjectURL(t));
    }
  },
  N1 = class {
    constructor(e, t = Lo) {
      this.baseChunkLogger = new kl(e, t);
    }
    write(e) {
      this.baseChunkLogger.appendToLogs(e);
    }
    getLogs() {
      return this.baseChunkLogger.getLogs();
    }
    clearLogs() {
      this.baseChunkLogger.clearLogs();
    }
    getLogArray() {
      return this.baseChunkLogger.getLogArray();
    }
    logsToBlob(e) {
      return this.baseChunkLogger.logsToBlob(e);
    }
  };
var j1 = Object.defineProperty,
  B1 = Object.defineProperties,
  U1 = Object.getOwnPropertyDescriptors,
  Vc = Object.getOwnPropertySymbols,
  F1 = Object.prototype.hasOwnProperty,
  k1 = Object.prototype.propertyIsEnumerable,
  Kc = (r, e, t) => (e in r ? j1(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  _s = (r, e) => {
    for (var t in e || (e = {})) F1.call(e, t) && Kc(r, t, e[t]);
    if (Vc) for (var t of Vc(e)) k1.call(e, t) && Kc(r, t, e[t]);
    return r;
  },
  Is = (r, e) => B1(r, U1(e));
function Fs(r) {
  return Is(_s({}, r), { level: (r == null ? void 0 : r.level) || C1.level });
}
function L1(r, e = zi) {
  return r[e] || "";
}
function q1(r, e, t = zi) {
  return ((r[t] = e), r);
}
function ze(r, e = zi) {
  let t = "";
  return (typeof r.bindings > "u" ? (t = L1(r, e)) : (t = r.bindings().context || ""), t);
}
function M1(r, e, t = zi) {
  const i = ze(r, t);
  return i.trim() ? `${i}/${e}` : e;
}
function Be(r, e, t = zi) {
  const i = M1(r, e, t),
    s = r.child({ context: i });
  return q1(s, i, t);
}
function z1(r) {
  var e, t;
  const i = new R1((e = r.opts) == null ? void 0 : e.level, r.maxSizeInBytes);
  return {
    logger: Mi(
      Is(_s({}, r.opts), {
        level: "trace",
        browser: Is(_s({}, (t = r.opts) == null ? void 0 : t.browser), { write: (s) => i.write(s) }),
      }),
    ),
    chunkLoggerController: i,
  };
}
function H1(r) {
  var e;
  const t = new N1((e = r.opts) == null ? void 0 : e.level, r.maxSizeInBytes);
  return { logger: Mi(Is(_s({}, r.opts), { level: "trace" }), t), chunkLoggerController: t };
}
function V1(r) {
  return typeof r.loggerOverride < "u" && typeof r.loggerOverride != "string"
    ? { logger: r.loggerOverride, chunkLoggerController: null }
    : typeof window < "u"
      ? z1(r)
      : H1(r);
}
var K1 = Object.defineProperty,
  W1 = (r, e, t) => (e in r ? K1(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Wc = (r, e, t) => W1(r, typeof e != "symbol" ? e + "" : e, t);
let G1 = class extends yr {
  constructor(e) {
    (super(), (this.opts = e), Wc(this, "protocol", "wc"), Wc(this, "version", 2));
  }
};
var Y1 = Object.defineProperty,
  J1 = (r, e, t) => (e in r ? Y1(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Z1 = (r, e, t) => J1(r, e + "", t);
let Q1 = class extends yr {
    constructor(e, t) {
      (super(), (this.core = e), (this.logger = t), Z1(this, "records", new Map()));
    }
  },
  X1 = class {
    constructor(e, t) {
      ((this.logger = e), (this.core = t));
    }
  };
class eE extends yr {
  constructor(e, t) {
    (super(), (this.relayer = e), (this.logger = t));
  }
}
let tE = class extends yr {
    constructor(e) {
      super();
    }
  },
  rE = class {
    constructor(e, t, i, s) {
      ((this.core = e), (this.logger = t), (this.name = i));
    }
  },
  iE = class extends yr {
    constructor(e, t) {
      (super(), (this.relayer = e), (this.logger = t));
    }
  },
  sE = class extends yr {
    constructor(e, t) {
      (super(), (this.core = e), (this.logger = t));
    }
  },
  nE = class {
    constructor(e, t, i) {
      ((this.core = e), (this.logger = t), (this.store = i));
    }
  },
  oE = class {
    constructor(e, t) {
      ((this.projectId = e), (this.logger = t));
    }
  },
  aE = class {
    constructor(e, t, i) {
      ((this.core = e), (this.logger = t), (this.telemetryEnabled = i));
    }
  };
var cE = Object.defineProperty,
  hE = (r, e, t) => (e in r ? cE(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Gc = (r, e, t) => hE(r, typeof e != "symbol" ? e + "" : e, t);
let uE = class {
    constructor(e) {
      ((this.opts = e), Gc(this, "protocol", "wc"), Gc(this, "version", 2));
    }
  },
  lE = class {
    constructor(e) {
      this.client = e;
    }
  };
const dE = "PARSE_ERROR",
  pE = "INVALID_REQUEST",
  fE = "METHOD_NOT_FOUND",
  gE = "INVALID_PARAMS",
  Ll = "INTERNAL_ERROR",
  qo = "SERVER_ERROR",
  yE = [-32700, -32600, -32601, -32602, -32603],
  _i = {
    [dE]: { code: -32700, message: "Parse error" },
    [pE]: { code: -32600, message: "Invalid Request" },
    [fE]: { code: -32601, message: "Method not found" },
    [gE]: { code: -32602, message: "Invalid params" },
    [Ll]: { code: -32603, message: "Internal error" },
    [qo]: { code: -32e3, message: "Server error" },
  },
  ql = qo;
function mE(r) {
  return yE.includes(r);
}
function Yc(r) {
  return Object.keys(_i).includes(r) ? _i[r] : _i[ql];
}
function wE(r) {
  const e = Object.values(_i).find((t) => t.code === r);
  return e || _i[ql];
}
function Ml(r, e, t) {
  return r.message.includes("getaddrinfo ENOTFOUND") || r.message.includes("connect ECONNREFUSED")
    ? new Error(`Unavailable ${t} RPC url at ${e}`)
    : r;
}
var $n = {},
  Ct = {},
  Jc;
function bE() {
  if (Jc) return Ct;
  ((Jc = 1),
    Object.defineProperty(Ct, "__esModule", { value: !0 }),
    (Ct.isBrowserCryptoAvailable = Ct.getSubtleCrypto = Ct.getBrowerCrypto = void 0));
  function r() {
    return (
      (It === null || It === void 0 ? void 0 : It.crypto) || (It === null || It === void 0 ? void 0 : It.msCrypto) || {}
    );
  }
  Ct.getBrowerCrypto = r;
  function e() {
    const i = r();
    return i.subtle || i.webkitSubtle;
  }
  Ct.getSubtleCrypto = e;
  function t() {
    return !!r() && !!e();
  }
  return ((Ct.isBrowserCryptoAvailable = t), Ct);
}
var Tt = {},
  Zc;
function vE() {
  if (Zc) return Tt;
  ((Zc = 1),
    Object.defineProperty(Tt, "__esModule", { value: !0 }),
    (Tt.isBrowser = Tt.isNode = Tt.isReactNative = void 0));
  function r() {
    return typeof document > "u" && typeof navigator < "u" && navigator.product === "ReactNative";
  }
  Tt.isReactNative = r;
  function e() {
    return typeof nt < "u" && typeof nt.versions < "u" && typeof nt.versions.node < "u";
  }
  Tt.isNode = e;
  function t() {
    return !r() && !e();
  }
  return ((Tt.isBrowser = t), Tt);
}
var Qc;
function EE() {
  return (
    Qc ||
      ((Qc = 1),
      (function (r) {
        Object.defineProperty(r, "__esModule", { value: !0 });
        const e = Ri;
        (e.__exportStar(bE(), r), e.__exportStar(vE(), r));
      })($n)),
    $n
  );
}
var _E = EE();
function Et(r = 3) {
  const e = Date.now() * Math.pow(10, r),
    t = Math.floor(Math.random() * Math.pow(10, r));
  return e + t;
}
function cr(r = 6) {
  return BigInt(Et(r));
}
function Wt(r, e, t) {
  return { id: t || Et(), jsonrpc: "2.0", method: r, params: e };
}
function ks(r, e) {
  return { id: r, jsonrpc: "2.0", result: e };
}
function Ls(r, e, t) {
  return { id: r, jsonrpc: "2.0", error: IE(e) };
}
function IE(r, e) {
  return typeof r > "u"
    ? Yc(Ll)
    : (typeof r == "string" && (r = Object.assign(Object.assign({}, Yc(qo)), { message: r })),
      mE(r.code) && (r = wE(r.code)),
      r);
}
class $E {}
class DE extends $E {
  constructor() {
    super();
  }
}
class SE extends DE {
  constructor(e) {
    super();
  }
}
const OE = "^https?:",
  PE = "^wss?:";
function AE(r) {
  const e = r.match(new RegExp(/^\w+:/, "gi"));
  if (!(!e || !e.length)) return e[0];
}
function zl(r, e) {
  const t = AE(r);
  return typeof t > "u" ? !1 : new RegExp(e).test(t);
}
function Xc(r) {
  return zl(r, OE);
}
function eh(r) {
  return zl(r, PE);
}
function xE(r) {
  return new RegExp("wss?://localhost(:d{2,5})?").test(r);
}
function Hl(r) {
  return typeof r == "object" && "id" in r && "jsonrpc" in r && r.jsonrpc === "2.0";
}
function Mo(r) {
  return Hl(r) && "method" in r;
}
function qs(r) {
  return Hl(r) && (_t(r) || it(r));
}
function _t(r) {
  return "result" in r;
}
function it(r) {
  return "error" in r;
}
let ot = class extends SE {
  constructor(e) {
    (super(e),
      (this.events = new Ze.EventEmitter()),
      (this.hasRegisteredEventListeners = !1),
      (this.connection = this.setConnection(e)),
      this.connection.connected && this.registerEventListeners());
  }
  async connect(e = this.connection) {
    await this.open(e);
  }
  async disconnect() {
    await this.close();
  }
  on(e, t) {
    this.events.on(e, t);
  }
  once(e, t) {
    this.events.once(e, t);
  }
  off(e, t) {
    this.events.off(e, t);
  }
  removeListener(e, t) {
    this.events.removeListener(e, t);
  }
  async request(e, t) {
    return this.requestStrict(Wt(e.method, e.params || [], e.id || cr().toString()), t);
  }
  async requestStrict(e, t) {
    return new Promise(async (i, s) => {
      if (!this.connection.connected)
        try {
          await this.open();
        } catch (n) {
          s(n);
        }
      this.events.on(`${e.id}`, (n) => {
        it(n) ? s(n.error) : i(n.result);
      });
      try {
        await this.connection.send(e, t);
      } catch (n) {
        s(n);
      }
    });
  }
  setConnection(e = this.connection) {
    return e;
  }
  onPayload(e) {
    (this.events.emit("payload", e),
      qs(e) ? this.events.emit(`${e.id}`, e) : this.events.emit("message", { type: e.method, data: e.params }));
  }
  onClose(e) {
    (e &&
      e.code === 3e3 &&
      this.events.emit(
        "error",
        new Error(`WebSocket connection closed abnormally with code: ${e.code} ${e.reason ? `(${e.reason})` : ""}`),
      ),
      this.events.emit("disconnect"));
  }
  async open(e = this.connection) {
    (this.connection === e && this.connection.connected) ||
      (this.connection.connected && this.close(),
      typeof e == "string" && (await this.connection.open(e), (e = this.connection)),
      (this.connection = this.setConnection(e)),
      await this.connection.open(),
      this.registerEventListeners(),
      this.events.emit("connect"));
  }
  async close() {
    await this.connection.close();
  }
  registerEventListeners() {
    this.hasRegisteredEventListeners ||
      (this.connection.on("payload", (e) => this.onPayload(e)),
      this.connection.on("close", (e) => this.onClose(e)),
      this.connection.on("error", (e) => this.events.emit("error", e)),
      this.connection.on("register_error", (e) => this.onClose()),
      (this.hasRegisteredEventListeners = !0));
  }
};
const CE = () =>
    typeof WebSocket < "u"
      ? WebSocket
      : typeof V < "u" && typeof V.WebSocket < "u"
        ? V.WebSocket
        : typeof window < "u" && typeof window.WebSocket < "u"
          ? window.WebSocket
          : typeof self < "u" && typeof self.WebSocket < "u"
            ? self.WebSocket
            : require("ws"),
  TE = () =>
    typeof WebSocket < "u" ||
    (typeof V < "u" && typeof V.WebSocket < "u") ||
    (typeof window < "u" && typeof window.WebSocket < "u") ||
    (typeof self < "u" && typeof self.WebSocket < "u"),
  th = (r) => r.split("?")[0],
  rh = 10,
  RE = CE();
let NE = class {
  constructor(e) {
    if (((this.url = e), (this.events = new Ze.EventEmitter()), (this.registering = !1), !eh(e)))
      throw new Error(`Provided URL is not compatible with WebSocket connection: ${e}`);
    this.url = e;
  }
  get connected() {
    return typeof this.socket < "u";
  }
  get connecting() {
    return this.registering;
  }
  on(e, t) {
    this.events.on(e, t);
  }
  once(e, t) {
    this.events.once(e, t);
  }
  off(e, t) {
    this.events.off(e, t);
  }
  removeListener(e, t) {
    this.events.removeListener(e, t);
  }
  async open(e = this.url) {
    await this.register(e);
  }
  async close() {
    return new Promise((e, t) => {
      if (typeof this.socket > "u") {
        t(new Error("Connection already closed"));
        return;
      }
      ((this.socket.onclose = (i) => {
        (this.onClose(i), e());
      }),
        this.socket.close());
    });
  }
  async send(e) {
    typeof this.socket > "u" && (this.socket = await this.register());
    try {
      this.socket.send(kt(e));
    } catch (t) {
      this.onError(e.id, t);
    }
  }
  register(e = this.url) {
    if (!eh(e)) throw new Error(`Provided URL is not compatible with WebSocket connection: ${e}`);
    if (this.registering) {
      const t = this.events.getMaxListeners();
      return (
        (this.events.listenerCount("register_error") >= t || this.events.listenerCount("open") >= t) &&
          this.events.setMaxListeners(t + 1),
        new Promise((i, s) => {
          (this.events.once("register_error", (n) => {
            (this.resetMaxListeners(), s(n));
          }),
            this.events.once("open", () => {
              if ((this.resetMaxListeners(), typeof this.socket > "u"))
                return s(new Error("WebSocket connection is missing or invalid"));
              i(this.socket);
            }));
        })
      );
    }
    return (
      (this.url = e),
      (this.registering = !0),
      new Promise((t, i) => {
        const s = _E.isReactNative() ? void 0 : { rejectUnauthorized: !xE(e) },
          n = new RE(e, [], s);
        (TE()
          ? (n.onerror = (o) => {
              const a = o;
              i(this.emitError(a.error));
            })
          : n.on("error", (o) => {
              i(this.emitError(o));
            }),
          (n.onopen = () => {
            (this.onOpen(n), t(n));
          }));
      })
    );
  }
  onOpen(e) {
    ((e.onmessage = (t) => this.onPayload(t)),
      (e.onclose = (t) => this.onClose(t)),
      (this.socket = e),
      (this.registering = !1),
      this.events.emit("open"));
  }
  onClose(e) {
    ((this.socket = void 0), (this.registering = !1), this.events.emit("close", e));
  }
  onPayload(e) {
    if (typeof e.data > "u") return;
    const t = typeof e.data == "string" ? lr(e.data) : e.data;
    this.events.emit("payload", t);
  }
  onError(e, t) {
    const i = this.parseError(t),
      s = i.message || i.toString(),
      n = Ls(e, s);
    this.events.emit("payload", n);
  }
  parseError(e, t = this.url) {
    return Ml(e, th(t), "WS");
  }
  resetMaxListeners() {
    this.events.getMaxListeners() > rh && this.events.setMaxListeners(rh);
  }
  emitError(e) {
    const t = this.parseError(
      new Error((e == null ? void 0 : e.message) || `WebSocket connection failed for host: ${th(this.url)}`),
    );
    return (this.events.emit("register_error", t), t);
  }
};
var jE = {};
const Vl = "wc",
  Kl = 2,
  no = "core",
  St = `${Vl}@2:${no}:`,
  BE = { logger: "error" },
  UE = { database: ":memory:" },
  FE = "crypto",
  ih = "client_ed25519_seed",
  kE = U.ONE_DAY,
  LE = "keychain",
  qE = "0.3",
  ME = "messages",
  zE = "0.3",
  sh = U.SIX_HOURS,
  HE = "publisher",
  Wl = "irn",
  VE = "error",
  Gl = "wss://relay.walletconnect.org",
  KE = "relayer",
  be = {
    message: "relayer_message",
    message_ack: "relayer_message_ack",
    connect: "relayer_connect",
    disconnect: "relayer_disconnect",
    error: "relayer_error",
    connection_stalled: "relayer_connection_stalled",
    transport_closed: "relayer_transport_closed",
    publish: "relayer_publish",
  },
  WE = "_subscription",
  et = { payload: "payload", connect: "connect", disconnect: "disconnect", error: "error" },
  GE = 0.1,
  oo = "2.21.1",
  ce = { link_mode: "link_mode", relay: "relay" },
  ps = { inbound: "inbound", outbound: "outbound" },
  YE = "0.3",
  JE = "WALLETCONNECT_CLIENT_ID",
  nh = "WALLETCONNECT_LINK_MODE_APPS",
  Ke = {
    created: "subscription_created",
    deleted: "subscription_deleted",
    expired: "subscription_expired",
    disabled: "subscription_disabled",
    sync: "subscription_sync",
    resubscribed: "subscription_resubscribed",
  },
  ZE = "subscription",
  QE = "0.3",
  XE = "pairing",
  e_ = "0.3",
  pi = {
    wc_pairingDelete: { req: { ttl: U.ONE_DAY, prompt: !1, tag: 1e3 }, res: { ttl: U.ONE_DAY, prompt: !1, tag: 1001 } },
    wc_pairingPing: {
      req: { ttl: U.THIRTY_SECONDS, prompt: !1, tag: 1002 },
      res: { ttl: U.THIRTY_SECONDS, prompt: !1, tag: 1003 },
    },
    unregistered_method: { req: { ttl: U.ONE_DAY, prompt: !1, tag: 0 }, res: { ttl: U.ONE_DAY, prompt: !1, tag: 0 } },
  },
  nr = { create: "pairing_create", expire: "pairing_expire", delete: "pairing_delete", ping: "pairing_ping" },
  ht = { created: "history_created", updated: "history_updated", deleted: "history_deleted", sync: "history_sync" },
  t_ = "history",
  r_ = "0.3",
  i_ = "expirer",
  rt = { created: "expirer_created", deleted: "expirer_deleted", expired: "expirer_expired", sync: "expirer_sync" },
  s_ = "0.3",
  n_ = "verify-api",
  o_ = "https://verify.walletconnect.com",
  Yl = "https://verify.walletconnect.org",
  Ii = Yl,
  a_ = `${Ii}/v3`,
  c_ = [o_, Yl],
  h_ = "echo",
  u_ = "https://echo.walletconnect.com",
  vt = {
    pairing_started: "pairing_started",
    pairing_uri_validation_success: "pairing_uri_validation_success",
    pairing_uri_not_expired: "pairing_uri_not_expired",
    store_new_pairing: "store_new_pairing",
    subscribing_pairing_topic: "subscribing_pairing_topic",
    subscribe_pairing_topic_success: "subscribe_pairing_topic_success",
    existing_pairing: "existing_pairing",
    pairing_not_expired: "pairing_not_expired",
    emit_inactive_pairing: "emit_inactive_pairing",
    emit_session_proposal: "emit_session_proposal",
    subscribing_to_pairing_topic: "subscribing_to_pairing_topic",
  },
  Rt = {
    no_wss_connection: "no_wss_connection",
    no_internet_connection: "no_internet_connection",
    malformed_pairing_uri: "malformed_pairing_uri",
    active_pairing_already_exists: "active_pairing_already_exists",
    subscribe_pairing_topic_failure: "subscribe_pairing_topic_failure",
    pairing_expired: "pairing_expired",
    proposal_expired: "proposal_expired",
    proposal_listener_not_found: "proposal_listener_not_found",
  },
  ut = {
    session_approve_started: "session_approve_started",
    proposal_not_expired: "proposal_not_expired",
    session_namespaces_validation_success: "session_namespaces_validation_success",
    create_session_topic: "create_session_topic",
    subscribing_session_topic: "subscribing_session_topic",
    subscribe_session_topic_success: "subscribe_session_topic_success",
    publishing_session_approve: "publishing_session_approve",
    session_approve_publish_success: "session_approve_publish_success",
    store_session: "store_session",
    publishing_session_settle: "publishing_session_settle",
    session_settle_publish_success: "session_settle_publish_success",
  },
  Xt = {
    no_internet_connection: "no_internet_connection",
    no_wss_connection: "no_wss_connection",
    proposal_expired: "proposal_expired",
    subscribe_session_topic_failure: "subscribe_session_topic_failure",
    session_approve_publish_failure: "session_approve_publish_failure",
    session_settle_publish_failure: "session_settle_publish_failure",
    session_approve_namespace_validation_failure: "session_approve_namespace_validation_failure",
    proposal_not_found: "proposal_not_found",
  },
  er = {
    authenticated_session_approve_started: "authenticated_session_approve_started",
    create_authenticated_session_topic: "create_authenticated_session_topic",
    cacaos_verified: "cacaos_verified",
    store_authenticated_session: "store_authenticated_session",
    subscribing_authenticated_session_topic: "subscribing_authenticated_session_topic",
    subscribe_authenticated_session_topic_success: "subscribe_authenticated_session_topic_success",
    publishing_authenticated_session_approve: "publishing_authenticated_session_approve",
  },
  fi = {
    no_internet_connection: "no_internet_connection",
    invalid_cacao: "invalid_cacao",
    subscribe_authenticated_session_topic_failure: "subscribe_authenticated_session_topic_failure",
    authenticated_session_approve_publish_failure: "authenticated_session_approve_publish_failure",
    authenticated_session_pending_request_not_found: "authenticated_session_pending_request_not_found",
  },
  l_ = 0.1,
  d_ = "event-client",
  p_ = 86400,
  f_ = "https://pulse.walletconnect.org/batch";
function g_(r, e) {
  if (r.length >= 255) throw new TypeError("Alphabet too long");
  for (var t = new Uint8Array(256), i = 0; i < t.length; i++) t[i] = 255;
  for (var s = 0; s < r.length; s++) {
    var n = r.charAt(s),
      o = n.charCodeAt(0);
    if (t[o] !== 255) throw new TypeError(n + " is ambiguous");
    t[o] = s;
  }
  var a = r.length,
    c = r.charAt(0),
    h = Math.log(a) / Math.log(256),
    u = Math.log(256) / Math.log(a);
  function l(p) {
    if (
      (p instanceof Uint8Array ||
        (ArrayBuffer.isView(p)
          ? (p = new Uint8Array(p.buffer, p.byteOffset, p.byteLength))
          : Array.isArray(p) && (p = Uint8Array.from(p))),
      !(p instanceof Uint8Array))
    )
      throw new TypeError("Expected Uint8Array");
    if (p.length === 0) return "";
    for (var g = 0, w = 0, E = 0, b = p.length; E !== b && p[E] === 0; ) (E++, g++);
    for (var _ = ((b - E) * u + 1) >>> 0, A = new Uint8Array(_); E !== b; ) {
      for (var T = p[E], v = 0, I = _ - 1; (T !== 0 || v < w) && I !== -1; I--, v++)
        ((T += (256 * A[I]) >>> 0), (A[I] = T % a >>> 0), (T = (T / a) >>> 0));
      if (T !== 0) throw new Error("Non-zero carry");
      ((w = v), E++);
    }
    for (var O = _ - w; O !== _ && A[O] === 0; ) O++;
    for (var D = c.repeat(g); O < _; ++O) D += r.charAt(A[O]);
    return D;
  }
  function d(p) {
    if (typeof p != "string") throw new TypeError("Expected String");
    if (p.length === 0) return new Uint8Array();
    var g = 0;
    if (p[g] !== " ") {
      for (var w = 0, E = 0; p[g] === c; ) (w++, g++);
      for (var b = ((p.length - g) * h + 1) >>> 0, _ = new Uint8Array(b); p[g]; ) {
        var A = t[p.charCodeAt(g)];
        if (A === 255) return;
        for (var T = 0, v = b - 1; (A !== 0 || T < E) && v !== -1; v--, T++)
          ((A += (a * _[v]) >>> 0), (_[v] = A % 256 >>> 0), (A = (A / 256) >>> 0));
        if (A !== 0) throw new Error("Non-zero carry");
        ((E = T), g++);
      }
      if (p[g] !== " ") {
        for (var I = b - E; I !== b && _[I] === 0; ) I++;
        for (var O = new Uint8Array(w + (b - I)), D = w; I !== b; ) O[D++] = _[I++];
        return O;
      }
    }
  }
  function f(p) {
    var g = d(p);
    if (g) return g;
    throw new Error(`Non-${e} character`);
  }
  return { encode: l, decodeUnsafe: d, decode: f };
}
var y_ = g_,
  m_ = y_;
const Jl = (r) => {
    if (r instanceof Uint8Array && r.constructor.name === "Uint8Array") return r;
    if (r instanceof ArrayBuffer) return new Uint8Array(r);
    if (ArrayBuffer.isView(r)) return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
    throw new Error("Unknown type, must be binary type");
  },
  w_ = (r) => new TextEncoder().encode(r),
  b_ = (r) => new TextDecoder().decode(r);
class v_ {
  constructor(e, t, i) {
    ((this.name = e), (this.prefix = t), (this.baseEncode = i));
  }
  encode(e) {
    if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
    throw Error("Unknown type, must be binary type");
  }
}
class E_ {
  constructor(e, t, i) {
    if (((this.name = e), (this.prefix = t), t.codePointAt(0) === void 0)) throw new Error("Invalid prefix character");
    ((this.prefixCodePoint = t.codePointAt(0)), (this.baseDecode = i));
  }
  decode(e) {
    if (typeof e == "string") {
      if (e.codePointAt(0) !== this.prefixCodePoint)
        throw Error(
          `Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`,
        );
      return this.baseDecode(e.slice(this.prefix.length));
    } else throw Error("Can only multibase decode strings");
  }
  or(e) {
    return Zl(this, e);
  }
}
class __ {
  constructor(e) {
    this.decoders = e;
  }
  or(e) {
    return Zl(this, e);
  }
  decode(e) {
    const t = e[0],
      i = this.decoders[t];
    if (i) return i.decode(e);
    throw RangeError(
      `Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`,
    );
  }
}
const Zl = (r, e) => new __({ ...(r.decoders || { [r.prefix]: r }), ...(e.decoders || { [e.prefix]: e }) });
class I_ {
  constructor(e, t, i, s) {
    ((this.name = e),
      (this.prefix = t),
      (this.baseEncode = i),
      (this.baseDecode = s),
      (this.encoder = new v_(e, t, i)),
      (this.decoder = new E_(e, t, s)));
  }
  encode(e) {
    return this.encoder.encode(e);
  }
  decode(e) {
    return this.decoder.decode(e);
  }
}
const Ms = ({ name: r, prefix: e, encode: t, decode: i }) => new I_(r, e, t, i),
  Hi = ({ prefix: r, name: e, alphabet: t }) => {
    const { encode: i, decode: s } = m_(t, e);
    return Ms({ prefix: r, name: e, encode: i, decode: (n) => Jl(s(n)) });
  },
  $_ = (r, e, t, i) => {
    const s = {};
    for (let u = 0; u < e.length; ++u) s[e[u]] = u;
    let n = r.length;
    for (; r[n - 1] === "="; ) --n;
    const o = new Uint8Array(((n * t) / 8) | 0);
    let a = 0,
      c = 0,
      h = 0;
    for (let u = 0; u < n; ++u) {
      const l = s[r[u]];
      if (l === void 0) throw new SyntaxError(`Non-${i} character`);
      ((c = (c << t) | l), (a += t), a >= 8 && ((a -= 8), (o[h++] = 255 & (c >> a))));
    }
    if (a >= t || 255 & (c << (8 - a))) throw new SyntaxError("Unexpected end of data");
    return o;
  },
  D_ = (r, e, t) => {
    const i = e[e.length - 1] === "=",
      s = (1 << t) - 1;
    let n = "",
      o = 0,
      a = 0;
    for (let c = 0; c < r.length; ++c) for (a = (a << 8) | r[c], o += 8; o > t; ) ((o -= t), (n += e[s & (a >> o)]));
    if ((o && (n += e[s & (a << (t - o))]), i)) for (; (n.length * t) & 7; ) n += "=";
    return n;
  },
  xe = ({ name: r, prefix: e, bitsPerChar: t, alphabet: i }) =>
    Ms({
      prefix: e,
      name: r,
      encode(s) {
        return D_(s, i, t);
      },
      decode(s) {
        return $_(s, i, t, r);
      },
    }),
  S_ = Ms({ prefix: "\0", name: "identity", encode: (r) => b_(r), decode: (r) => w_(r) });
var O_ = Object.freeze({ __proto__: null, identity: S_ });
const P_ = xe({ prefix: "0", name: "base2", alphabet: "01", bitsPerChar: 1 });
var A_ = Object.freeze({ __proto__: null, base2: P_ });
const x_ = xe({ prefix: "7", name: "base8", alphabet: "01234567", bitsPerChar: 3 });
var C_ = Object.freeze({ __proto__: null, base8: x_ });
const T_ = Hi({ prefix: "9", name: "base10", alphabet: "0123456789" });
var R_ = Object.freeze({ __proto__: null, base10: T_ });
const N_ = xe({ prefix: "f", name: "base16", alphabet: "0123456789abcdef", bitsPerChar: 4 }),
  j_ = xe({ prefix: "F", name: "base16upper", alphabet: "0123456789ABCDEF", bitsPerChar: 4 });
var B_ = Object.freeze({ __proto__: null, base16: N_, base16upper: j_ });
const U_ = xe({ prefix: "b", name: "base32", alphabet: "abcdefghijklmnopqrstuvwxyz234567", bitsPerChar: 5 }),
  F_ = xe({ prefix: "B", name: "base32upper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", bitsPerChar: 5 }),
  k_ = xe({ prefix: "c", name: "base32pad", alphabet: "abcdefghijklmnopqrstuvwxyz234567=", bitsPerChar: 5 }),
  L_ = xe({ prefix: "C", name: "base32padupper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=", bitsPerChar: 5 }),
  q_ = xe({ prefix: "v", name: "base32hex", alphabet: "0123456789abcdefghijklmnopqrstuv", bitsPerChar: 5 }),
  M_ = xe({ prefix: "V", name: "base32hexupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV", bitsPerChar: 5 }),
  z_ = xe({ prefix: "t", name: "base32hexpad", alphabet: "0123456789abcdefghijklmnopqrstuv=", bitsPerChar: 5 }),
  H_ = xe({ prefix: "T", name: "base32hexpadupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=", bitsPerChar: 5 }),
  V_ = xe({ prefix: "h", name: "base32z", alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769", bitsPerChar: 5 });
var K_ = Object.freeze({
  __proto__: null,
  base32: U_,
  base32upper: F_,
  base32pad: k_,
  base32padupper: L_,
  base32hex: q_,
  base32hexupper: M_,
  base32hexpad: z_,
  base32hexpadupper: H_,
  base32z: V_,
});
const W_ = Hi({ prefix: "k", name: "base36", alphabet: "0123456789abcdefghijklmnopqrstuvwxyz" }),
  G_ = Hi({ prefix: "K", name: "base36upper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
var Y_ = Object.freeze({ __proto__: null, base36: W_, base36upper: G_ });
const J_ = Hi({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  }),
  Z_ = Hi({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
  });
var Q_ = Object.freeze({ __proto__: null, base58btc: J_, base58flickr: Z_ });
const X_ = xe({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6,
  }),
  eI = xe({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6,
  }),
  tI = xe({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6,
  }),
  rI = xe({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6,
  });
var iI = Object.freeze({ __proto__: null, base64: X_, base64pad: eI, base64url: tI, base64urlpad: rI });
const Ql = Array.from(
    "🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂",
  ),
  sI = Ql.reduce((r, e, t) => ((r[t] = e), r), []),
  nI = Ql.reduce((r, e, t) => ((r[e.codePointAt(0)] = t), r), []);
function oI(r) {
  return r.reduce((e, t) => ((e += sI[t]), e), "");
}
function aI(r) {
  const e = [];
  for (const t of r) {
    const i = nI[t.codePointAt(0)];
    if (i === void 0) throw new Error(`Non-base256emoji character: ${t}`);
    e.push(i);
  }
  return new Uint8Array(e);
}
const cI = Ms({ prefix: "🚀", name: "base256emoji", encode: oI, decode: aI });
var hI = Object.freeze({ __proto__: null, base256emoji: cI }),
  uI = Xl,
  oh = 128,
  lI = -128,
  dI = Math.pow(2, 31);
function Xl(r, e, t) {
  ((e = e || []), (t = t || 0));
  for (var i = t; r >= dI; ) ((e[t++] = (r & 255) | oh), (r /= 128));
  for (; r & lI; ) ((e[t++] = (r & 255) | oh), (r >>>= 7));
  return ((e[t] = r | 0), (Xl.bytes = t - i + 1), e);
}
var pI = ao,
  fI = 128,
  ah = 127;
function ao(r, i) {
  var t = 0,
    i = i || 0,
    s = 0,
    n = i,
    o,
    a = r.length;
  do {
    if (n >= a) throw ((ao.bytes = 0), new RangeError("Could not decode varint"));
    ((o = r[n++]), (t += s < 28 ? (o & ah) << s : (o & ah) * Math.pow(2, s)), (s += 7));
  } while (o >= fI);
  return ((ao.bytes = n - i), t);
}
var gI = Math.pow(2, 7),
  yI = Math.pow(2, 14),
  mI = Math.pow(2, 21),
  wI = Math.pow(2, 28),
  bI = Math.pow(2, 35),
  vI = Math.pow(2, 42),
  EI = Math.pow(2, 49),
  _I = Math.pow(2, 56),
  II = Math.pow(2, 63),
  $I = function (r) {
    return r < gI
      ? 1
      : r < yI
        ? 2
        : r < mI
          ? 3
          : r < wI
            ? 4
            : r < bI
              ? 5
              : r < vI
                ? 6
                : r < EI
                  ? 7
                  : r < _I
                    ? 8
                    : r < II
                      ? 9
                      : 10;
  },
  DI = { encode: uI, decode: pI, encodingLength: $I },
  ed = DI;
const ch = (r, e, t = 0) => (ed.encode(r, e, t), e),
  hh = (r) => ed.encodingLength(r),
  co = (r, e) => {
    const t = e.byteLength,
      i = hh(r),
      s = i + hh(t),
      n = new Uint8Array(s + t);
    return (ch(r, n, 0), ch(t, n, i), n.set(e, s), new SI(r, t, e, n));
  };
class SI {
  constructor(e, t, i, s) {
    ((this.code = e), (this.size = t), (this.digest = i), (this.bytes = s));
  }
}
const td = ({ name: r, code: e, encode: t }) => new OI(r, e, t);
class OI {
  constructor(e, t, i) {
    ((this.name = e), (this.code = t), (this.encode = i));
  }
  digest(e) {
    if (e instanceof Uint8Array) {
      const t = this.encode(e);
      return t instanceof Uint8Array ? co(this.code, t) : t.then((i) => co(this.code, i));
    } else throw Error("Unknown type, must be binary type");
  }
}
const rd = (r) => async (e) => new Uint8Array(await crypto.subtle.digest(r, e)),
  PI = td({ name: "sha2-256", code: 18, encode: rd("SHA-256") }),
  AI = td({ name: "sha2-512", code: 19, encode: rd("SHA-512") });
var xI = Object.freeze({ __proto__: null, sha256: PI, sha512: AI });
const id = 0,
  CI = "identity",
  sd = Jl,
  TI = (r) => co(id, sd(r)),
  RI = { code: id, name: CI, encode: sd, digest: TI };
var NI = Object.freeze({ __proto__: null, identity: RI });
(new TextEncoder(), new TextDecoder());
const uh = { ...O_, ...A_, ...C_, ...R_, ...B_, ...K_, ...Y_, ...Q_, ...iI, ...hI };
({ ...xI, ...NI });
function jI(r = 0) {
  return globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null
    ? globalThis.Buffer.allocUnsafe(r)
    : new Uint8Array(r);
}
function nd(r, e, t, i) {
  return { name: r, prefix: e, encoder: { name: r, prefix: e, encode: t }, decoder: { decode: i } };
}
const lh = nd(
    "utf8",
    "u",
    (r) => "u" + new TextDecoder("utf8").decode(r),
    (r) => new TextEncoder().encode(r.substring(1)),
  ),
  Dn = nd(
    "ascii",
    "a",
    (r) => {
      let e = "a";
      for (let t = 0; t < r.length; t++) e += String.fromCharCode(r[t]);
      return e;
    },
    (r) => {
      r = r.substring(1);
      const e = jI(r.length);
      for (let t = 0; t < r.length; t++) e[t] = r.charCodeAt(t);
      return e;
    },
  ),
  BI = { utf8: lh, "utf-8": lh, hex: uh.base16, latin1: Dn, ascii: Dn, binary: Dn, ...uh };
function UI(r, e = "utf8") {
  const t = BI[e];
  if (!t) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null
    ? globalThis.Buffer.from(r, "utf8")
    : t.decoder.decode(`${t.prefix}${r}`);
}
var FI = Object.defineProperty,
  kI = (r, e, t) => (e in r ? FI(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  wt = (r, e, t) => kI(r, typeof e != "symbol" ? e + "" : e, t);
class LI {
  constructor(e, t) {
    ((this.core = e),
      (this.logger = t),
      wt(this, "keychain", new Map()),
      wt(this, "name", LE),
      wt(this, "version", qE),
      wt(this, "initialized", !1),
      wt(this, "storagePrefix", St),
      wt(this, "init", async () => {
        if (!this.initialized) {
          const i = await this.getKeyChain();
          (typeof i < "u" && (this.keychain = i), (this.initialized = !0));
        }
      }),
      wt(this, "has", (i) => (this.isInitialized(), this.keychain.has(i))),
      wt(this, "set", async (i, s) => {
        (this.isInitialized(), this.keychain.set(i, s), await this.persist());
      }),
      wt(this, "get", (i) => {
        this.isInitialized();
        const s = this.keychain.get(i);
        if (typeof s > "u") {
          const { message: n } = F("NO_MATCHING_KEY", `${this.name}: ${i}`);
          throw new Error(n);
        }
        return s;
      }),
      wt(this, "del", async (i) => {
        (this.isInitialized(), this.keychain.delete(i), await this.persist());
      }),
      (this.core = e),
      (this.logger = Be(t, this.name)));
  }
  get context() {
    return ze(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  async setKeyChain(e) {
    await this.core.storage.setItem(this.storageKey, Kn(e));
  }
  async getKeyChain() {
    const e = await this.core.storage.getItem(this.storageKey);
    return typeof e < "u" ? Wn(e) : void 0;
  }
  async persist() {
    await this.setKeyChain(this.keychain);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
var qI = Object.defineProperty,
  MI = (r, e, t) => (e in r ? qI(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  De = (r, e, t) => MI(r, typeof e != "symbol" ? e + "" : e, t);
class zI {
  constructor(e, t, i) {
    ((this.core = e),
      (this.logger = t),
      De(this, "name", FE),
      De(this, "keychain"),
      De(this, "randomSessionIdentifier", io()),
      De(this, "initialized", !1),
      De(this, "init", async () => {
        this.initialized || (await this.keychain.init(), (this.initialized = !0));
      }),
      De(this, "hasKeys", (s) => (this.isInitialized(), this.keychain.has(s))),
      De(this, "getClientId", async () => {
        this.isInitialized();
        const s = await this.getClientSeed(),
          n = Ma(s);
        return Ku(n.publicKey);
      }),
      De(this, "generateKeyPair", () => {
        this.isInitialized();
        const s = Yv();
        return this.setPrivateKey(s.publicKey, s.privateKey);
      }),
      De(this, "signJWT", async (s) => {
        this.isInitialized();
        const n = await this.getClientSeed(),
          o = Ma(n),
          a = this.randomSessionIdentifier;
        return await dm(a, s, kE, o);
      }),
      De(this, "generateSharedKey", (s, n, o) => {
        this.isInitialized();
        const a = this.getPrivateKey(s),
          c = Jv(a, n);
        return this.setSymKey(c, o);
      }),
      De(this, "setSymKey", async (s, n) => {
        this.isInitialized();
        const o = n || us(s);
        return (await this.keychain.set(o, s), o);
      }),
      De(this, "deleteKeyPair", async (s) => {
        (this.isInitialized(), await this.keychain.del(s));
      }),
      De(this, "deleteSymKey", async (s) => {
        (this.isInitialized(), await this.keychain.del(s));
      }),
      De(this, "encode", async (s, n, o) => {
        this.isInitialized();
        const a = jl(o),
          c = kt(n);
        if (Sc(a)) return Xv(c, o == null ? void 0 : o.encoding);
        if (Dc(a)) {
          const d = a.senderPublicKey,
            f = a.receiverPublicKey;
          s = await this.generateSharedKey(d, f);
        }
        const h = this.getSymKey(s),
          { type: u, senderPublicKey: l } = a;
        return Zv({ type: u, symKey: h, message: c, senderPublicKey: l, encoding: o == null ? void 0 : o.encoding });
      }),
      De(this, "decode", async (s, n, o) => {
        this.isInitialized();
        const a = t0(n, o);
        if (Sc(a)) {
          const c = e0(n, o == null ? void 0 : o.encoding);
          return lr(c);
        }
        if (Dc(a)) {
          const c = a.receiverPublicKey,
            h = a.senderPublicKey;
          s = await this.generateSharedKey(c, h);
        }
        try {
          const c = this.getSymKey(s),
            h = Qv({ symKey: c, encoded: n, encoding: o == null ? void 0 : o.encoding });
          return lr(h);
        } catch (c) {
          (this.logger.error(`Failed to decode message from topic: '${s}', clientId: '${await this.getClientId()}'`),
            this.logger.error(c));
        }
      }),
      De(this, "getPayloadType", (s, n = pt) => {
        const o = Ci({ encoded: s, encoding: n });
        return fr(o.type);
      }),
      De(this, "getPayloadSenderPublicKey", (s, n = pt) => {
        const o = Ci({ encoded: s, encoding: n });
        return o.senderPublicKey ? Me(o.senderPublicKey, je) : void 0;
      }),
      (this.core = e),
      (this.logger = Be(t, this.name)),
      (this.keychain = i || new LI(this.core, this.logger)));
  }
  get context() {
    return ze(this.logger);
  }
  async setPrivateKey(e, t) {
    return (await this.keychain.set(e, t), e);
  }
  getPrivateKey(e) {
    return this.keychain.get(e);
  }
  async getClientSeed() {
    let e = "";
    try {
      e = this.keychain.get(ih);
    } catch {
      ((e = io()), await this.keychain.set(ih, e));
    }
    return UI(e, "base16");
  }
  getSymKey(e) {
    return this.keychain.get(e);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
var HI = Object.defineProperty,
  VI = Object.defineProperties,
  KI = Object.getOwnPropertyDescriptors,
  dh = Object.getOwnPropertySymbols,
  WI = Object.prototype.hasOwnProperty,
  GI = Object.prototype.propertyIsEnumerable,
  ho = (r, e, t) => (e in r ? HI(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  YI = (r, e) => {
    for (var t in e || (e = {})) WI.call(e, t) && ho(r, t, e[t]);
    if (dh) for (var t of dh(e)) GI.call(e, t) && ho(r, t, e[t]);
    return r;
  },
  JI = (r, e) => VI(r, KI(e)),
  He = (r, e, t) => ho(r, typeof e != "symbol" ? e + "" : e, t);
class ZI extends X1 {
  constructor(e, t) {
    (super(e, t),
      (this.logger = e),
      (this.core = t),
      He(this, "messages", new Map()),
      He(this, "messagesWithoutClientAck", new Map()),
      He(this, "name", ME),
      He(this, "version", zE),
      He(this, "initialized", !1),
      He(this, "storagePrefix", St),
      He(this, "init", async () => {
        if (!this.initialized) {
          this.logger.trace("Initialized");
          try {
            const i = await this.getRelayerMessages();
            typeof i < "u" && (this.messages = i);
            const s = await this.getRelayerMessagesWithoutClientAck();
            (typeof s < "u" && (this.messagesWithoutClientAck = s),
              this.logger.debug(`Successfully Restored records for ${this.name}`),
              this.logger.trace({ type: "method", method: "restore", size: this.messages.size }));
          } catch (i) {
            (this.logger.debug(`Failed to Restore records for ${this.name}`), this.logger.error(i));
          } finally {
            this.initialized = !0;
          }
        }
      }),
      He(this, "set", async (i, s, n) => {
        this.isInitialized();
        const o = $t(s);
        let a = this.messages.get(i);
        if ((typeof a > "u" && (a = {}), typeof a[o] < "u")) return o;
        if (((a[o] = s), this.messages.set(i, a), n === ps.inbound)) {
          const c = this.messagesWithoutClientAck.get(i) || {};
          this.messagesWithoutClientAck.set(i, JI(YI({}, c), { [o]: s }));
        }
        return (await this.persist(), o);
      }),
      He(this, "get", (i) => {
        this.isInitialized();
        let s = this.messages.get(i);
        return (typeof s > "u" && (s = {}), s);
      }),
      He(this, "getWithoutAck", (i) => {
        this.isInitialized();
        const s = {};
        for (const n of i) {
          const o = this.messagesWithoutClientAck.get(n) || {};
          s[n] = Object.values(o);
        }
        return s;
      }),
      He(this, "has", (i, s) => {
        this.isInitialized();
        const n = this.get(i),
          o = $t(s);
        return typeof n[o] < "u";
      }),
      He(this, "ack", async (i, s) => {
        this.isInitialized();
        const n = this.messagesWithoutClientAck.get(i);
        if (typeof n > "u") return;
        const o = $t(s);
        (delete n[o],
          Object.keys(n).length === 0
            ? this.messagesWithoutClientAck.delete(i)
            : this.messagesWithoutClientAck.set(i, n),
          await this.persist());
      }),
      He(this, "del", async (i) => {
        (this.isInitialized(), this.messages.delete(i), this.messagesWithoutClientAck.delete(i), await this.persist());
      }),
      (this.logger = Be(e, this.name)),
      (this.core = t));
  }
  get context() {
    return ze(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get storageKeyWithoutClientAck() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name + "_withoutClientAck";
  }
  async setRelayerMessages(e) {
    await this.core.storage.setItem(this.storageKey, Kn(e));
  }
  async setRelayerMessagesWithoutClientAck(e) {
    await this.core.storage.setItem(this.storageKeyWithoutClientAck, Kn(e));
  }
  async getRelayerMessages() {
    const e = await this.core.storage.getItem(this.storageKey);
    return typeof e < "u" ? Wn(e) : void 0;
  }
  async getRelayerMessagesWithoutClientAck() {
    const e = await this.core.storage.getItem(this.storageKeyWithoutClientAck);
    return typeof e < "u" ? Wn(e) : void 0;
  }
  async persist() {
    (await this.setRelayerMessages(this.messages),
      await this.setRelayerMessagesWithoutClientAck(this.messagesWithoutClientAck));
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
var QI = Object.defineProperty,
  XI = Object.defineProperties,
  e2 = Object.getOwnPropertyDescriptors,
  ph = Object.getOwnPropertySymbols,
  t2 = Object.prototype.hasOwnProperty,
  r2 = Object.prototype.propertyIsEnumerable,
  uo = (r, e, t) => (e in r ? QI(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  ts = (r, e) => {
    for (var t in e || (e = {})) t2.call(e, t) && uo(r, t, e[t]);
    if (ph) for (var t of ph(e)) r2.call(e, t) && uo(r, t, e[t]);
    return r;
  },
  Sn = (r, e) => XI(r, e2(e)),
  lt = (r, e, t) => uo(r, typeof e != "symbol" ? e + "" : e, t);
class i2 extends eE {
  constructor(e, t) {
    (super(e, t),
      (this.relayer = e),
      (this.logger = t),
      lt(this, "events", new Ze.EventEmitter()),
      lt(this, "name", HE),
      lt(this, "queue", new Map()),
      lt(this, "publishTimeout", U.toMiliseconds(U.ONE_MINUTE)),
      lt(this, "initialPublishTimeout", U.toMiliseconds(U.ONE_SECOND * 15)),
      lt(this, "needsTransportRestart", !1),
      lt(this, "publish", async (i, s, n) => {
        var o;
        (this.logger.debug("Publishing Payload"),
          this.logger.trace({ type: "method", method: "publish", params: { topic: i, message: s, opts: n } }));
        const a = (n == null ? void 0 : n.ttl) || sh,
          c = vs(n),
          h = (n == null ? void 0 : n.prompt) || !1,
          u = (n == null ? void 0 : n.tag) || 0,
          l = (n == null ? void 0 : n.id) || cr().toString(),
          d = {
            topic: i,
            message: s,
            opts: {
              ttl: a,
              relay: c,
              prompt: h,
              tag: u,
              id: l,
              attestation: n == null ? void 0 : n.attestation,
              tvf: n == null ? void 0 : n.tvf,
            },
          },
          f = `Failed to publish payload, please try again. id:${l} tag:${u}`;
        try {
          const p = new Promise(async (g) => {
            const w = ({ id: b }) => {
              d.opts.id === b &&
                (this.removeRequestFromQueue(b), this.relayer.events.removeListener(be.publish, w), g(d));
            };
            this.relayer.events.on(be.publish, w);
            const E = Kt(
              new Promise((b, _) => {
                this.rpcPublish({
                  topic: i,
                  message: s,
                  ttl: a,
                  prompt: h,
                  tag: u,
                  id: l,
                  attestation: n == null ? void 0 : n.attestation,
                  tvf: n == null ? void 0 : n.tvf,
                })
                  .then(b)
                  .catch((A) => {
                    (this.logger.warn(A, A == null ? void 0 : A.message), _(A));
                  });
              }),
              this.initialPublishTimeout,
              `Failed initial publish, retrying.... id:${l} tag:${u}`,
            );
            try {
              (await E, this.events.removeListener(be.publish, w));
            } catch (b) {
              (this.queue.set(l, Sn(ts({}, d), { attempt: 1 })), this.logger.warn(b, b == null ? void 0 : b.message));
            }
          });
          (this.logger.trace({ type: "method", method: "publish", params: { id: l, topic: i, message: s, opts: n } }),
            await Kt(p, this.publishTimeout, f));
        } catch (p) {
          if (
            (this.logger.debug("Failed to Publish Payload"),
            this.logger.error(p),
            (o = n == null ? void 0 : n.internal) != null && o.throwOnFailedPublish)
          )
            throw p;
        } finally {
          this.queue.delete(l);
        }
      }),
      lt(this, "on", (i, s) => {
        this.events.on(i, s);
      }),
      lt(this, "once", (i, s) => {
        this.events.once(i, s);
      }),
      lt(this, "off", (i, s) => {
        this.events.off(i, s);
      }),
      lt(this, "removeListener", (i, s) => {
        this.events.removeListener(i, s);
      }),
      (this.relayer = e),
      (this.logger = Be(t, this.name)),
      this.registerEventListeners());
  }
  get context() {
    return ze(this.logger);
  }
  async rpcPublish(e) {
    var t, i, s, n;
    const { topic: o, message: a, ttl: c = sh, prompt: h, tag: u, id: l, attestation: d, tvf: f } = e,
      p = {
        method: wi(vs().protocol).publish,
        params: ts({ topic: o, message: a, ttl: c, prompt: h, tag: u, attestation: d }, f),
        id: l,
      };
    (Oe((t = p.params) == null ? void 0 : t.prompt) && ((i = p.params) == null || delete i.prompt),
      Oe((s = p.params) == null ? void 0 : s.tag) && ((n = p.params) == null || delete n.tag),
      this.logger.debug("Outgoing Relay Payload"),
      this.logger.trace({ type: "message", direction: "outgoing", request: p }));
    const g = await this.relayer.request(p);
    return (this.relayer.events.emit(be.publish, e), this.logger.debug("Successfully Published Payload"), g);
  }
  removeRequestFromQueue(e) {
    this.queue.delete(e);
  }
  checkQueue() {
    this.queue.forEach(async (e, t) => {
      const i = e.attempt + 1;
      this.queue.set(t, Sn(ts({}, e), { attempt: i }));
      const { topic: s, message: n, opts: o, attestation: a } = e;
      (this.logger.warn({}, `Publisher: queue->publishing: ${e.opts.id}, tag: ${e.opts.tag}, attempt: ${i}`),
        await this.rpcPublish(
          Sn(ts({}, e), {
            topic: s,
            message: n,
            ttl: o.ttl,
            prompt: o.prompt,
            tag: o.tag,
            id: o.id,
            attestation: a,
            tvf: o.tvf,
          }),
        ),
        this.logger.warn({}, `Publisher: queue->published: ${e.opts.id}`));
    });
  }
  registerEventListeners() {
    (this.relayer.core.heartbeat.on(mr.pulse, () => {
      if (this.needsTransportRestart) {
        ((this.needsTransportRestart = !1), this.relayer.events.emit(be.connection_stalled));
        return;
      }
      this.checkQueue();
    }),
      this.relayer.on(be.message_ack, (e) => {
        this.removeRequestFromQueue(e.id.toString());
      }));
  }
}
var s2 = Object.defineProperty,
  n2 = (r, e, t) => (e in r ? s2(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Sr = (r, e, t) => n2(r, typeof e != "symbol" ? e + "" : e, t);
class o2 {
  constructor() {
    (Sr(this, "map", new Map()),
      Sr(this, "set", (e, t) => {
        const i = this.get(e);
        this.exists(e, t) || this.map.set(e, [...i, t]);
      }),
      Sr(this, "get", (e) => this.map.get(e) || []),
      Sr(this, "exists", (e, t) => this.get(e).includes(t)),
      Sr(this, "delete", (e, t) => {
        if (typeof t > "u") {
          this.map.delete(e);
          return;
        }
        if (!this.map.has(e)) return;
        const i = this.get(e);
        if (!this.exists(e, t)) return;
        const s = i.filter((n) => n !== t);
        if (!s.length) {
          this.map.delete(e);
          return;
        }
        this.map.set(e, s);
      }),
      Sr(this, "clear", () => {
        this.map.clear();
      }));
  }
  get topics() {
    return Array.from(this.map.keys());
  }
}
var a2 = Object.defineProperty,
  c2 = Object.defineProperties,
  h2 = Object.getOwnPropertyDescriptors,
  fh = Object.getOwnPropertySymbols,
  u2 = Object.prototype.hasOwnProperty,
  l2 = Object.prototype.propertyIsEnumerable,
  lo = (r, e, t) => (e in r ? a2(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  gi = (r, e) => {
    for (var t in e || (e = {})) u2.call(e, t) && lo(r, t, e[t]);
    if (fh) for (var t of fh(e)) l2.call(e, t) && lo(r, t, e[t]);
    return r;
  },
  On = (r, e) => c2(r, h2(e)),
  se = (r, e, t) => lo(r, typeof e != "symbol" ? e + "" : e, t);
class d2 extends iE {
  constructor(e, t) {
    (super(e, t),
      (this.relayer = e),
      (this.logger = t),
      se(this, "subscriptions", new Map()),
      se(this, "topicMap", new o2()),
      se(this, "events", new Ze.EventEmitter()),
      se(this, "name", ZE),
      se(this, "version", QE),
      se(this, "pending", new Map()),
      se(this, "cached", []),
      se(this, "initialized", !1),
      se(this, "storagePrefix", St),
      se(this, "subscribeTimeout", U.toMiliseconds(U.ONE_MINUTE)),
      se(this, "initialSubscribeTimeout", U.toMiliseconds(U.ONE_SECOND * 15)),
      se(this, "clientId"),
      se(this, "batchSubscribeTopicsLimit", 500),
      se(this, "init", async () => {
        (this.initialized || (this.logger.trace("Initialized"), this.registerEventListeners(), await this.restore()),
          (this.initialized = !0));
      }),
      se(this, "subscribe", async (i, s) => {
        (this.isInitialized(),
          this.logger.debug("Subscribing Topic"),
          this.logger.trace({ type: "method", method: "subscribe", params: { topic: i, opts: s } }));
        try {
          const n = vs(s),
            o = { topic: i, relay: n, transportType: s == null ? void 0 : s.transportType };
          this.pending.set(i, o);
          const a = await this.rpcSubscribe(i, n, s);
          return (
            typeof a == "string" &&
              (this.onSubscribe(a, o),
              this.logger.debug("Successfully Subscribed Topic"),
              this.logger.trace({ type: "method", method: "subscribe", params: { topic: i, opts: s } })),
            a
          );
        } catch (n) {
          throw (this.logger.debug("Failed to Subscribe Topic"), this.logger.error(n), n);
        }
      }),
      se(this, "unsubscribe", async (i, s) => {
        (this.isInitialized(),
          typeof (s == null ? void 0 : s.id) < "u"
            ? await this.unsubscribeById(i, s.id, s)
            : await this.unsubscribeByTopic(i, s));
      }),
      se(
        this,
        "isSubscribed",
        (i) =>
          new Promise((s) => {
            s(this.topicMap.topics.includes(i));
          }),
      ),
      se(
        this,
        "isKnownTopic",
        (i) =>
          new Promise((s) => {
            s(this.topicMap.topics.includes(i) || this.pending.has(i) || this.cached.some((n) => n.topic === i));
          }),
      ),
      se(this, "on", (i, s) => {
        this.events.on(i, s);
      }),
      se(this, "once", (i, s) => {
        this.events.once(i, s);
      }),
      se(this, "off", (i, s) => {
        this.events.off(i, s);
      }),
      se(this, "removeListener", (i, s) => {
        this.events.removeListener(i, s);
      }),
      se(this, "start", async () => {
        await this.onConnect();
      }),
      se(this, "stop", async () => {
        await this.onDisconnect();
      }),
      se(this, "restart", async () => {
        (await this.restore(), await this.onRestart());
      }),
      se(this, "checkPending", async () => {
        if (this.pending.size === 0 && (!this.initialized || !this.relayer.connected)) return;
        const i = [];
        (this.pending.forEach((s) => {
          i.push(s);
        }),
          await this.batchSubscribe(i));
      }),
      se(this, "registerEventListeners", () => {
        (this.relayer.core.heartbeat.on(mr.pulse, async () => {
          await this.checkPending();
        }),
          this.events.on(Ke.created, async (i) => {
            const s = Ke.created;
            (this.logger.info(`Emitting ${s}`),
              this.logger.debug({ type: "event", event: s, data: i }),
              await this.persist());
          }),
          this.events.on(Ke.deleted, async (i) => {
            const s = Ke.deleted;
            (this.logger.info(`Emitting ${s}`),
              this.logger.debug({ type: "event", event: s, data: i }),
              await this.persist());
          }));
      }),
      (this.relayer = e),
      (this.logger = Be(t, this.name)),
      (this.clientId = ""));
  }
  get context() {
    return ze(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.relayer.core.customStoragePrefix + "//" + this.name;
  }
  get length() {
    return this.subscriptions.size;
  }
  get ids() {
    return Array.from(this.subscriptions.keys());
  }
  get values() {
    return Array.from(this.subscriptions.values());
  }
  get topics() {
    return this.topicMap.topics;
  }
  get hasAnyTopics() {
    return (
      this.topicMap.topics.length > 0 || this.pending.size > 0 || this.cached.length > 0 || this.subscriptions.size > 0
    );
  }
  hasSubscription(e, t) {
    let i = !1;
    try {
      i = this.getSubscription(e).topic === t;
    } catch {}
    return i;
  }
  reset() {
    ((this.cached = []), (this.initialized = !0));
  }
  onDisable() {
    (this.values.length > 0 && (this.cached = this.values), this.subscriptions.clear(), this.topicMap.clear());
  }
  async unsubscribeByTopic(e, t) {
    const i = this.topicMap.get(e);
    await Promise.all(i.map(async (s) => await this.unsubscribeById(e, s, t)));
  }
  async unsubscribeById(e, t, i) {
    (this.logger.debug("Unsubscribing Topic"),
      this.logger.trace({ type: "method", method: "unsubscribe", params: { topic: e, id: t, opts: i } }));
    try {
      const s = vs(i);
      (await this.restartToComplete({ topic: e, id: t, relay: s }), await this.rpcUnsubscribe(e, t, s));
      const n = re("USER_DISCONNECTED", `${this.name}, ${e}`);
      (await this.onUnsubscribe(e, t, n),
        this.logger.debug("Successfully Unsubscribed Topic"),
        this.logger.trace({ type: "method", method: "unsubscribe", params: { topic: e, id: t, opts: i } }));
    } catch (s) {
      throw (this.logger.debug("Failed to Unsubscribe Topic"), this.logger.error(s), s);
    }
  }
  async rpcSubscribe(e, t, i) {
    var s;
    (!i || (i == null ? void 0 : i.transportType) === ce.relay) &&
      (await this.restartToComplete({ topic: e, id: e, relay: t }));
    const n = { method: wi(t.protocol).subscribe, params: { topic: e } };
    (this.logger.debug("Outgoing Relay Payload"),
      this.logger.trace({ type: "payload", direction: "outgoing", request: n }));
    const o = (s = i == null ? void 0 : i.internal) == null ? void 0 : s.throwOnFailedPublish;
    try {
      const a = await this.getSubscriptionId(e);
      if ((i == null ? void 0 : i.transportType) === ce.link_mode)
        return (
          setTimeout(() => {
            (this.relayer.connected || this.relayer.connecting) &&
              this.relayer.request(n).catch((u) => this.logger.warn(u));
          }, U.toMiliseconds(U.ONE_SECOND)),
          a
        );
      const c = new Promise(async (u) => {
          const l = (d) => {
            d.topic === e && (this.events.removeListener(Ke.created, l), u(d.id));
          };
          this.events.on(Ke.created, l);
          try {
            const d = await Kt(
              new Promise((f, p) => {
                this.relayer
                  .request(n)
                  .catch((g) => {
                    (this.logger.warn(g, g == null ? void 0 : g.message), p(g));
                  })
                  .then(f);
              }),
              this.initialSubscribeTimeout,
              `Subscribing to ${e} failed, please try again`,
            );
            (this.events.removeListener(Ke.created, l), u(d));
          } catch {}
        }),
        h = await Kt(c, this.subscribeTimeout, `Subscribing to ${e} failed, please try again`);
      if (!h && o) throw new Error(`Subscribing to ${e} failed, please try again`);
      return h ? a : null;
    } catch (a) {
      if (
        (this.logger.debug("Outgoing Relay Subscribe Payload stalled"),
        this.relayer.events.emit(be.connection_stalled),
        o)
      )
        throw a;
    }
    return null;
  }
  async rpcBatchSubscribe(e) {
    if (!e.length) return;
    const t = e[0].relay,
      i = { method: wi(t.protocol).batchSubscribe, params: { topics: e.map((s) => s.topic) } };
    (this.logger.debug("Outgoing Relay Payload"),
      this.logger.trace({ type: "payload", direction: "outgoing", request: i }));
    try {
      await await Kt(
        new Promise((s) => {
          this.relayer
            .request(i)
            .catch((n) => this.logger.warn(n))
            .then(s);
        }),
        this.subscribeTimeout,
        "rpcBatchSubscribe failed, please try again",
      );
    } catch {
      this.relayer.events.emit(be.connection_stalled);
    }
  }
  async rpcBatchFetchMessages(e) {
    if (!e.length) return;
    const t = e[0].relay,
      i = { method: wi(t.protocol).batchFetchMessages, params: { topics: e.map((n) => n.topic) } };
    (this.logger.debug("Outgoing Relay Payload"),
      this.logger.trace({ type: "payload", direction: "outgoing", request: i }));
    let s;
    try {
      s = await await Kt(
        new Promise((n, o) => {
          this.relayer
            .request(i)
            .catch((a) => {
              (this.logger.warn(a), o(a));
            })
            .then(n);
        }),
        this.subscribeTimeout,
        "rpcBatchFetchMessages failed, please try again",
      );
    } catch {
      this.relayer.events.emit(be.connection_stalled);
    }
    return s;
  }
  rpcUnsubscribe(e, t, i) {
    const s = { method: wi(i.protocol).unsubscribe, params: { topic: e, id: t } };
    return (
      this.logger.debug("Outgoing Relay Payload"),
      this.logger.trace({ type: "payload", direction: "outgoing", request: s }),
      this.relayer.request(s)
    );
  }
  onSubscribe(e, t) {
    (this.setSubscription(e, On(gi({}, t), { id: e })), this.pending.delete(t.topic));
  }
  onBatchSubscribe(e) {
    e.length &&
      e.forEach((t) => {
        (this.setSubscription(t.id, gi({}, t)), this.pending.delete(t.topic));
      });
  }
  async onUnsubscribe(e, t, i) {
    (this.events.removeAllListeners(t),
      this.hasSubscription(t, e) && this.deleteSubscription(t, i),
      await this.relayer.messages.del(e));
  }
  async setRelayerSubscriptions(e) {
    await this.relayer.core.storage.setItem(this.storageKey, e);
  }
  async getRelayerSubscriptions() {
    return await this.relayer.core.storage.getItem(this.storageKey);
  }
  setSubscription(e, t) {
    (this.logger.debug("Setting subscription"),
      this.logger.trace({ type: "method", method: "setSubscription", id: e, subscription: t }),
      this.addSubscription(e, t));
  }
  addSubscription(e, t) {
    (this.subscriptions.set(e, gi({}, t)), this.topicMap.set(t.topic, e), this.events.emit(Ke.created, t));
  }
  getSubscription(e) {
    (this.logger.debug("Getting subscription"),
      this.logger.trace({ type: "method", method: "getSubscription", id: e }));
    const t = this.subscriptions.get(e);
    if (!t) {
      const { message: i } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw new Error(i);
    }
    return t;
  }
  deleteSubscription(e, t) {
    (this.logger.debug("Deleting subscription"),
      this.logger.trace({ type: "method", method: "deleteSubscription", id: e, reason: t }));
    const i = this.getSubscription(e);
    (this.subscriptions.delete(e),
      this.topicMap.delete(i.topic, e),
      this.events.emit(Ke.deleted, On(gi({}, i), { reason: t })));
  }
  async persist() {
    (await this.setRelayerSubscriptions(this.values), this.events.emit(Ke.sync));
  }
  async onRestart() {
    if (this.cached.length) {
      const e = [...this.cached],
        t = Math.ceil(this.cached.length / this.batchSubscribeTopicsLimit);
      for (let i = 0; i < t; i++) {
        const s = e.splice(0, this.batchSubscribeTopicsLimit);
        await this.batchSubscribe(s);
      }
    }
    this.events.emit(Ke.resubscribed);
  }
  async restore() {
    try {
      const e = await this.getRelayerSubscriptions();
      if (typeof e > "u" || !e.length) return;
      if (this.subscriptions.size) {
        const { message: t } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw (this.logger.error(t), this.logger.error(`${this.name}: ${JSON.stringify(this.values)}`), new Error(t));
      }
      ((this.cached = e),
        this.logger.debug(`Successfully Restored subscriptions for ${this.name}`),
        this.logger.trace({ type: "method", method: "restore", subscriptions: this.values }));
    } catch (e) {
      (this.logger.debug(`Failed to Restore subscriptions for ${this.name}`), this.logger.error(e));
    }
  }
  async batchSubscribe(e) {
    e.length &&
      (await this.rpcBatchSubscribe(e),
      this.onBatchSubscribe(
        await Promise.all(e.map(async (t) => On(gi({}, t), { id: await this.getSubscriptionId(t.topic) }))),
      ));
  }
  async batchFetchMessages(e) {
    if (!e.length) return;
    this.logger.trace(`Fetching batch messages for ${e.length} subscriptions`);
    const t = await this.rpcBatchFetchMessages(e);
    t &&
      t.messages &&
      (await Bw(U.toMiliseconds(U.ONE_SECOND)), await this.relayer.handleBatchMessageEvents(t.messages));
  }
  async onConnect() {
    (await this.restart(), this.reset());
  }
  onDisconnect() {
    this.onDisable();
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  async restartToComplete(e) {
    !this.relayer.connected && !this.relayer.connecting && (this.cached.push(e), await this.relayer.transportOpen());
  }
  async getClientId() {
    return (this.clientId || (this.clientId = await this.relayer.core.crypto.getClientId()), this.clientId);
  }
  async getSubscriptionId(e) {
    return $t(e + (await this.getClientId()));
  }
}
var p2 = Object.defineProperty,
  gh = Object.getOwnPropertySymbols,
  f2 = Object.prototype.hasOwnProperty,
  g2 = Object.prototype.propertyIsEnumerable,
  po = (r, e, t) => (e in r ? p2(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  yh = (r, e) => {
    for (var t in e || (e = {})) f2.call(e, t) && po(r, t, e[t]);
    if (gh) for (var t of gh(e)) g2.call(e, t) && po(r, t, e[t]);
    return r;
  },
  Q = (r, e, t) => po(r, typeof e != "symbol" ? e + "" : e, t);
class y2 extends tE {
  constructor(e) {
    (super(e),
      Q(this, "protocol", "wc"),
      Q(this, "version", 2),
      Q(this, "core"),
      Q(this, "logger"),
      Q(this, "events", new Ze.EventEmitter()),
      Q(this, "provider"),
      Q(this, "messages"),
      Q(this, "subscriber"),
      Q(this, "publisher"),
      Q(this, "name", KE),
      Q(this, "transportExplicitlyClosed", !1),
      Q(this, "initialized", !1),
      Q(this, "connectionAttemptInProgress", !1),
      Q(this, "relayUrl"),
      Q(this, "projectId"),
      Q(this, "packageName"),
      Q(this, "bundleId"),
      Q(this, "hasExperiencedNetworkDisruption", !1),
      Q(this, "pingTimeout"),
      Q(this, "heartBeatTimeout", U.toMiliseconds(U.THIRTY_SECONDS + U.FIVE_SECONDS)),
      Q(this, "reconnectTimeout"),
      Q(this, "connectPromise"),
      Q(this, "reconnectInProgress", !1),
      Q(this, "requestsInFlight", []),
      Q(this, "connectTimeout", U.toMiliseconds(U.ONE_SECOND * 15)),
      Q(this, "request", async (t) => {
        var i, s;
        this.logger.debug("Publishing Request Payload");
        const n = t.id || cr().toString();
        await this.toEstablishConnection();
        try {
          this.logger.trace(
            { id: n, method: t.method, topic: (i = t.params) == null ? void 0 : i.topic },
            "relayer.request - publishing...",
          );
          const o = `${n}:${((s = t.params) == null ? void 0 : s.tag) || ""}`;
          this.requestsInFlight.push(o);
          const a = await this.provider.request(t);
          return ((this.requestsInFlight = this.requestsInFlight.filter((c) => c !== o)), a);
        } catch (o) {
          throw (this.logger.debug(`Failed to Publish Request: ${n}`), o);
        }
      }),
      Q(this, "resetPingTimeout", () => {
        ws() &&
          (clearTimeout(this.pingTimeout),
          (this.pingTimeout = setTimeout(() => {
            var t, i, s, n;
            try {
              (this.logger.debug({}, "pingTimeout: Connection stalled, terminating..."),
                (n =
                  (s = (i = (t = this.provider) == null ? void 0 : t.connection) == null ? void 0 : i.socket) == null
                    ? void 0
                    : s.terminate) == null || n.call(s));
            } catch (o) {
              this.logger.warn(o, o == null ? void 0 : o.message);
            }
          }, this.heartBeatTimeout)));
      }),
      Q(this, "onPayloadHandler", (t) => {
        (this.onProviderPayload(t), this.resetPingTimeout());
      }),
      Q(this, "onConnectHandler", () => {
        (this.logger.warn({}, "Relayer connected 🛜"), this.startPingTimeout(), this.events.emit(be.connect));
      }),
      Q(this, "onDisconnectHandler", () => {
        (this.logger.warn({}, "Relayer disconnected 🛑"), (this.requestsInFlight = []), this.onProviderDisconnect());
      }),
      Q(this, "onProviderErrorHandler", (t) => {
        (this.logger.fatal(`Fatal socket error: ${t.message}`),
          this.events.emit(be.error, t),
          this.logger.fatal("Fatal socket error received, closing transport"),
          this.transportClose());
      }),
      Q(this, "registerProviderListeners", () => {
        (this.provider.on(et.payload, this.onPayloadHandler),
          this.provider.on(et.connect, this.onConnectHandler),
          this.provider.on(et.disconnect, this.onDisconnectHandler),
          this.provider.on(et.error, this.onProviderErrorHandler));
      }),
      (this.core = e.core),
      (this.logger =
        typeof e.logger < "u" && typeof e.logger != "string"
          ? Be(e.logger, this.name)
          : Mi(Fs({ level: e.logger || VE }))),
      (this.messages = new ZI(this.logger, e.core)),
      (this.subscriber = new d2(this, this.logger)),
      (this.publisher = new i2(this, this.logger)),
      (this.relayUrl = (e == null ? void 0 : e.relayUrl) || Gl),
      (this.projectId = e.projectId),
      vw() ? (this.packageName = Ya()) : Ew() && (this.bundleId = Ya()),
      (this.provider = {}));
  }
  async init() {
    if (
      (this.logger.trace("Initialized"),
      this.registerEventListeners(),
      await Promise.all([this.messages.init(), this.subscriber.init()]),
      (this.initialized = !0),
      this.subscriber.hasAnyTopics)
    )
      try {
        await this.transportOpen();
      } catch (e) {
        this.logger.warn(e, e == null ? void 0 : e.message);
      }
  }
  get context() {
    return ze(this.logger);
  }
  get connected() {
    var e, t, i;
    return (
      ((i = (t = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : t.socket) == null
        ? void 0
        : i.readyState) === 1 || !1
    );
  }
  get connecting() {
    var e, t, i;
    return (
      ((i = (t = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : t.socket) == null
        ? void 0
        : i.readyState) === 0 ||
      this.connectPromise !== void 0 ||
      !1
    );
  }
  async publish(e, t, i) {
    (this.isInitialized(),
      await this.publisher.publish(e, t, i),
      await this.recordMessageEvent(
        { topic: e, message: t, publishedAt: Date.now(), transportType: ce.relay },
        ps.outbound,
      ));
  }
  async subscribe(e, t) {
    var i, s, n;
    (this.isInitialized(),
      (!(t != null && t.transportType) || (t == null ? void 0 : t.transportType) === "relay") &&
        (await this.toEstablishConnection()));
    const o =
      typeof ((i = t == null ? void 0 : t.internal) == null ? void 0 : i.throwOnFailedPublish) > "u"
        ? !0
        : (s = t == null ? void 0 : t.internal) == null
          ? void 0
          : s.throwOnFailedPublish;
    let a = ((n = this.subscriber.topicMap.get(e)) == null ? void 0 : n[0]) || "",
      c;
    const h = (u) => {
      u.topic === e && (this.subscriber.off(Ke.created, h), c());
    };
    return (
      await Promise.all([
        new Promise((u) => {
          ((c = u), this.subscriber.on(Ke.created, h));
        }),
        new Promise(async (u, l) => {
          ((a =
            (await this.subscriber.subscribe(e, yh({ internal: { throwOnFailedPublish: o } }, t)).catch((d) => {
              o && l(d);
            })) || a),
            u());
        }),
      ]),
      a
    );
  }
  async unsubscribe(e, t) {
    (this.isInitialized(), await this.subscriber.unsubscribe(e, t));
  }
  on(e, t) {
    this.events.on(e, t);
  }
  once(e, t) {
    this.events.once(e, t);
  }
  off(e, t) {
    this.events.off(e, t);
  }
  removeListener(e, t) {
    this.events.removeListener(e, t);
  }
  async transportDisconnect() {
    this.provider.disconnect && (this.hasExperiencedNetworkDisruption || this.connected)
      ? await Kt(this.provider.disconnect(), 2e3, "provider.disconnect()").catch(() => this.onProviderDisconnect())
      : this.onProviderDisconnect();
  }
  async transportClose() {
    ((this.transportExplicitlyClosed = !0), await this.transportDisconnect());
  }
  async transportOpen(e) {
    if (!this.subscriber.hasAnyTopics) {
      this.logger.warn("Starting WS connection skipped because the client has no topics to work with.");
      return;
    }
    if (
      (this.connectPromise
        ? (this.logger.debug({}, "Waiting for existing connection attempt to resolve..."),
          await this.connectPromise,
          this.logger.debug({}, "Existing connection attempt resolved"))
        : ((this.connectPromise = new Promise(async (t, i) => {
            await this.connect(e)
              .then(t)
              .catch(i)
              .finally(() => {
                this.connectPromise = void 0;
              });
          })),
          await this.connectPromise),
      !this.connected)
    )
      throw new Error(`Couldn't establish socket connection to the relay server: ${this.relayUrl}`);
  }
  async restartTransport(e) {
    (this.logger.debug({}, "Restarting transport..."),
      !this.connectionAttemptInProgress &&
        ((this.relayUrl = e || this.relayUrl),
        await this.confirmOnlineStateOrThrow(),
        await this.transportClose(),
        await this.transportOpen()));
  }
  async confirmOnlineStateOrThrow() {
    if (!(await Uc())) throw new Error("No internet connection detected. Please restart your network and try again.");
  }
  async handleBatchMessageEvents(e) {
    if ((e == null ? void 0 : e.length) === 0) {
      this.logger.trace("Batch message events is empty. Ignoring...");
      return;
    }
    const t = e.sort((i, s) => i.publishedAt - s.publishedAt);
    this.logger.debug(`Batch of ${t.length} message events sorted`);
    for (const i of t)
      try {
        await this.onMessageEvent(i);
      } catch (s) {
        this.logger.warn(s, "Error while processing batch message event: " + (s == null ? void 0 : s.message));
      }
    this.logger.trace(`Batch of ${t.length} message events processed`);
  }
  async onLinkMessageEvent(e, t) {
    const { topic: i } = e;
    if (!t.sessionExists) {
      const s = pe(U.FIVE_MINUTES),
        n = { topic: i, expiry: s, relay: { protocol: "irn" }, active: !1 };
      await this.core.pairing.pairings.set(i, n);
    }
    (this.events.emit(be.message, e), await this.recordMessageEvent(e, ps.inbound));
  }
  async connect(e) {
    (await this.confirmOnlineStateOrThrow(),
      e && e !== this.relayUrl && ((this.relayUrl = e), await this.transportDisconnect()),
      (this.connectionAttemptInProgress = !0),
      (this.transportExplicitlyClosed = !1));
    let t = 1;
    for (; t < 6; ) {
      try {
        if (this.transportExplicitlyClosed) break;
        (this.logger.debug({}, `Connecting to ${this.relayUrl}, attempt: ${t}...`),
          await this.createProvider(),
          await new Promise(async (i, s) => {
            const n = () => {
              s(new Error("Connection interrupted while trying to subscribe"));
            };
            (this.provider.once(et.disconnect, n),
              await Kt(
                new Promise((o, a) => {
                  this.provider.connect().then(o).catch(a);
                }),
                this.connectTimeout,
                `Socket stalled when trying to connect to ${this.relayUrl}`,
              )
                .catch((o) => {
                  s(o);
                })
                .finally(() => {
                  (this.provider.off(et.disconnect, n), clearTimeout(this.reconnectTimeout));
                }),
              await new Promise(async (o, a) => {
                const c = () => {
                  a(new Error("Connection interrupted while trying to subscribe"));
                };
                (this.provider.once(et.disconnect, c),
                  await this.subscriber
                    .start()
                    .then(o)
                    .catch(a)
                    .finally(() => {
                      this.provider.off(et.disconnect, c);
                    }));
              }),
              (this.hasExperiencedNetworkDisruption = !1),
              i());
          }));
      } catch (i) {
        await this.subscriber.stop();
        const s = i;
        (this.logger.warn({}, s.message), (this.hasExperiencedNetworkDisruption = !0));
      } finally {
        this.connectionAttemptInProgress = !1;
      }
      if (this.connected) {
        this.logger.debug({}, `Connected to ${this.relayUrl} successfully on attempt: ${t}`);
        break;
      }
      (await new Promise((i) => setTimeout(i, U.toMiliseconds(t * 1))), t++);
    }
  }
  startPingTimeout() {
    var e, t, i, s, n;
    if (ws())
      try {
        ((t = (e = this.provider) == null ? void 0 : e.connection) != null &&
          t.socket &&
          ((n = (s = (i = this.provider) == null ? void 0 : i.connection) == null ? void 0 : s.socket) == null ||
            n.on("ping", () => {
              this.resetPingTimeout();
            })),
          this.resetPingTimeout());
      } catch (o) {
        this.logger.warn(o, o == null ? void 0 : o.message);
      }
  }
  async createProvider() {
    this.provider.connection && this.unregisterProviderListeners();
    const e = await this.core.crypto.signJWT(this.relayUrl);
    ((this.provider = new ot(
      new NE(
        Sw({
          sdkVersion: oo,
          protocol: this.protocol,
          version: this.version,
          relayUrl: this.relayUrl,
          projectId: this.projectId,
          auth: e,
          useOnCloseEvent: !0,
          bundleId: this.bundleId,
          packageName: this.packageName,
        }),
      ),
    )),
      this.registerProviderListeners());
  }
  async recordMessageEvent(e, t) {
    const { topic: i, message: s } = e;
    await this.messages.set(i, s, t);
  }
  async shouldIgnoreMessageEvent(e) {
    const { topic: t, message: i } = e;
    if (!i || i.length === 0) return (this.logger.warn(`Ignoring invalid/empty message: ${i}`), !0);
    if (!(await this.subscriber.isKnownTopic(t)))
      return (this.logger.warn(`Ignoring message for unknown topic ${t}`), !0);
    const s = this.messages.has(t, i);
    return (s && this.logger.warn(`Ignoring duplicate message: ${i}`), s);
  }
  async onProviderPayload(e) {
    if (
      (this.logger.debug("Incoming Relay Payload"),
      this.logger.trace({ type: "payload", direction: "incoming", payload: e }),
      Mo(e))
    ) {
      if (!e.method.endsWith(WE)) return;
      const t = e.params,
        { topic: i, message: s, publishedAt: n, attestation: o } = t.data,
        a = { topic: i, message: s, publishedAt: n, transportType: ce.relay, attestation: o };
      (this.logger.debug("Emitting Relayer Payload"),
        this.logger.trace(yh({ type: "event", event: t.id }, a)),
        this.events.emit(t.id, a),
        await this.acknowledgePayload(e),
        await this.onMessageEvent(a));
    } else qs(e) && this.events.emit(be.message_ack, e);
  }
  async onMessageEvent(e) {
    (await this.shouldIgnoreMessageEvent(e)) ||
      (await this.recordMessageEvent(e, ps.inbound), this.events.emit(be.message, e));
  }
  async acknowledgePayload(e) {
    const t = ks(e.id, !0);
    await this.provider.connection.send(t);
  }
  unregisterProviderListeners() {
    (this.provider.off(et.payload, this.onPayloadHandler),
      this.provider.off(et.connect, this.onConnectHandler),
      this.provider.off(et.disconnect, this.onDisconnectHandler),
      this.provider.off(et.error, this.onProviderErrorHandler),
      clearTimeout(this.pingTimeout));
  }
  async registerEventListeners() {
    let e = await Uc();
    (G0(async (t) => {
      e !== t &&
        ((e = t),
        t
          ? await this.transportOpen().catch((i) => this.logger.error(i, i == null ? void 0 : i.message))
          : ((this.hasExperiencedNetworkDisruption = !0),
            await this.transportDisconnect(),
            (this.transportExplicitlyClosed = !1)));
    }),
      this.core.heartbeat.on(mr.pulse, async () => {
        if (!this.transportExplicitlyClosed && !this.connected && Z0())
          try {
            (await this.confirmOnlineStateOrThrow(), await this.transportOpen());
          } catch (t) {
            this.logger.warn(t, t == null ? void 0 : t.message);
          }
      }));
  }
  async onProviderDisconnect() {
    (clearTimeout(this.pingTimeout),
      this.events.emit(be.disconnect),
      (this.connectionAttemptInProgress = !1),
      !this.reconnectInProgress &&
        ((this.reconnectInProgress = !0),
        await this.subscriber.stop(),
        this.subscriber.hasAnyTopics &&
          (this.transportExplicitlyClosed ||
            (this.reconnectTimeout = setTimeout(async () => {
              (await this.transportOpen().catch((e) => this.logger.error(e, e == null ? void 0 : e.message)),
                (this.reconnectTimeout = void 0),
                (this.reconnectInProgress = !1));
            }, U.toMiliseconds(GE))))));
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  async toEstablishConnection() {
    if ((await this.confirmOnlineStateOrThrow(), !this.connected)) {
      if (this.connectPromise) {
        await this.connectPromise;
        return;
      }
      await this.connect();
    }
  }
}
function m2() {}
function mh(r) {
  if (!r || typeof r != "object") return !1;
  const e = Object.getPrototypeOf(r);
  return e === null || e === Object.prototype || Object.getPrototypeOf(e) === null
    ? Object.prototype.toString.call(r) === "[object Object]"
    : !1;
}
function wh(r) {
  return Object.getOwnPropertySymbols(r).filter((e) => Object.prototype.propertyIsEnumerable.call(r, e));
}
function bh(r) {
  return r == null ? (r === void 0 ? "[object Undefined]" : "[object Null]") : Object.prototype.toString.call(r);
}
const w2 = "[object RegExp]",
  b2 = "[object String]",
  v2 = "[object Number]",
  E2 = "[object Boolean]",
  vh = "[object Arguments]",
  _2 = "[object Symbol]",
  I2 = "[object Date]",
  $2 = "[object Map]",
  D2 = "[object Set]",
  S2 = "[object Array]",
  O2 = "[object Function]",
  P2 = "[object ArrayBuffer]",
  Pn = "[object Object]",
  A2 = "[object Error]",
  x2 = "[object DataView]",
  C2 = "[object Uint8Array]",
  T2 = "[object Uint8ClampedArray]",
  R2 = "[object Uint16Array]",
  N2 = "[object Uint32Array]",
  j2 = "[object BigUint64Array]",
  B2 = "[object Int8Array]",
  U2 = "[object Int16Array]",
  F2 = "[object Int32Array]",
  k2 = "[object BigInt64Array]",
  L2 = "[object Float32Array]",
  q2 = "[object Float64Array]";
function M2(r, e) {
  return r === e || (Number.isNaN(r) && Number.isNaN(e));
}
function z2(r, e, t) {
  return bi(r, e, void 0, void 0, void 0, void 0, t);
}
function bi(r, e, t, i, s, n, o) {
  const a = o(r, e, t, i, s, n);
  if (a !== void 0) return a;
  if (typeof r == typeof e)
    switch (typeof r) {
      case "bigint":
      case "string":
      case "boolean":
      case "symbol":
      case "undefined":
        return r === e;
      case "number":
        return r === e || Object.is(r, e);
      case "function":
        return r === e;
      case "object":
        return $i(r, e, n, o);
    }
  return $i(r, e, n, o);
}
function $i(r, e, t, i) {
  if (Object.is(r, e)) return !0;
  let s = bh(r),
    n = bh(e);
  if ((s === vh && (s = Pn), n === vh && (n = Pn), s !== n)) return !1;
  switch (s) {
    case b2:
      return r.toString() === e.toString();
    case v2: {
      const c = r.valueOf(),
        h = e.valueOf();
      return M2(c, h);
    }
    case E2:
    case I2:
    case _2:
      return Object.is(r.valueOf(), e.valueOf());
    case w2:
      return r.source === e.source && r.flags === e.flags;
    case O2:
      return r === e;
  }
  t = t ?? new Map();
  const o = t.get(r),
    a = t.get(e);
  if (o != null && a != null) return o === e;
  (t.set(r, e), t.set(e, r));
  try {
    switch (s) {
      case $2: {
        if (r.size !== e.size) return !1;
        for (const [c, h] of r.entries()) if (!e.has(c) || !bi(h, e.get(c), c, r, e, t, i)) return !1;
        return !0;
      }
      case D2: {
        if (r.size !== e.size) return !1;
        const c = Array.from(r.values()),
          h = Array.from(e.values());
        for (let u = 0; u < c.length; u++) {
          const l = c[u],
            d = h.findIndex((f) => bi(l, f, void 0, r, e, t, i));
          if (d === -1) return !1;
          h.splice(d, 1);
        }
        return !0;
      }
      case S2:
      case C2:
      case T2:
      case R2:
      case N2:
      case j2:
      case B2:
      case U2:
      case F2:
      case k2:
      case L2:
      case q2: {
        if ((typeof _e < "u" && _e.isBuffer(r) !== _e.isBuffer(e)) || r.length !== e.length) return !1;
        for (let c = 0; c < r.length; c++) if (!bi(r[c], e[c], c, r, e, t, i)) return !1;
        return !0;
      }
      case P2:
        return r.byteLength !== e.byteLength ? !1 : $i(new Uint8Array(r), new Uint8Array(e), t, i);
      case x2:
        return r.byteLength !== e.byteLength || r.byteOffset !== e.byteOffset
          ? !1
          : $i(new Uint8Array(r), new Uint8Array(e), t, i);
      case A2:
        return r.name === e.name && r.message === e.message;
      case Pn: {
        if (!($i(r.constructor, e.constructor, t, i) || (mh(r) && mh(e)))) return !1;
        const c = [...Object.keys(r), ...wh(r)],
          h = [...Object.keys(e), ...wh(e)];
        if (c.length !== h.length) return !1;
        for (let u = 0; u < c.length; u++) {
          const l = c[u],
            d = r[l];
          if (!Object.hasOwn(e, l)) return !1;
          const f = e[l];
          if (!bi(d, f, l, r, e, t, i)) return !1;
        }
        return !0;
      }
      default:
        return !1;
    }
  } finally {
    (t.delete(r), t.delete(e));
  }
}
function H2(r, e) {
  return z2(r, e, m2);
}
var V2 = Object.defineProperty,
  Eh = Object.getOwnPropertySymbols,
  K2 = Object.prototype.hasOwnProperty,
  W2 = Object.prototype.propertyIsEnumerable,
  fo = (r, e, t) => (e in r ? V2(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  _h = (r, e) => {
    for (var t in e || (e = {})) K2.call(e, t) && fo(r, t, e[t]);
    if (Eh) for (var t of Eh(e)) W2.call(e, t) && fo(r, t, e[t]);
    return r;
  },
  Fe = (r, e, t) => fo(r, typeof e != "symbol" ? e + "" : e, t);
class wr extends rE {
  constructor(e, t, i, s = St, n = void 0) {
    (super(e, t, i, s),
      (this.core = e),
      (this.logger = t),
      (this.name = i),
      Fe(this, "map", new Map()),
      Fe(this, "version", YE),
      Fe(this, "cached", []),
      Fe(this, "initialized", !1),
      Fe(this, "getKey"),
      Fe(this, "storagePrefix", St),
      Fe(this, "recentlyDeleted", []),
      Fe(this, "recentlyDeletedLimit", 200),
      Fe(this, "init", async () => {
        this.initialized ||
          (this.logger.trace("Initialized"),
          await this.restore(),
          this.cached.forEach((o) => {
            this.getKey && o !== null && !Oe(o)
              ? this.map.set(this.getKey(o), o)
              : D0(o)
                ? this.map.set(o.id, o)
                : S0(o) && this.map.set(o.topic, o);
          }),
          (this.cached = []),
          (this.initialized = !0));
      }),
      Fe(this, "set", async (o, a) => {
        (this.isInitialized(),
          this.map.has(o)
            ? await this.update(o, a)
            : (this.logger.debug("Setting value"),
              this.logger.trace({ type: "method", method: "set", key: o, value: a }),
              this.map.set(o, a),
              await this.persist()));
      }),
      Fe(
        this,
        "get",
        (o) => (
          this.isInitialized(),
          this.logger.debug("Getting value"),
          this.logger.trace({ type: "method", method: "get", key: o }),
          this.getData(o)
        ),
      ),
      Fe(
        this,
        "getAll",
        (o) => (
          this.isInitialized(),
          o ? this.values.filter((a) => Object.keys(o).every((c) => H2(a[c], o[c]))) : this.values
        ),
      ),
      Fe(this, "update", async (o, a) => {
        (this.isInitialized(),
          this.logger.debug("Updating value"),
          this.logger.trace({ type: "method", method: "update", key: o, update: a }));
        const c = _h(_h({}, this.getData(o)), a);
        (this.map.set(o, c), await this.persist());
      }),
      Fe(this, "delete", async (o, a) => {
        (this.isInitialized(),
          this.map.has(o) &&
            (this.logger.debug("Deleting value"),
            this.logger.trace({ type: "method", method: "delete", key: o, reason: a }),
            this.map.delete(o),
            this.addToRecentlyDeleted(o),
            await this.persist()));
      }),
      (this.logger = Be(t, this.name)),
      (this.storagePrefix = s),
      (this.getKey = n));
  }
  get context() {
    return ze(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get length() {
    return this.map.size;
  }
  get keys() {
    return Array.from(this.map.keys());
  }
  get values() {
    return Array.from(this.map.values());
  }
  addToRecentlyDeleted(e) {
    (this.recentlyDeleted.push(e),
      this.recentlyDeleted.length >= this.recentlyDeletedLimit &&
        this.recentlyDeleted.splice(0, this.recentlyDeletedLimit / 2));
  }
  async setDataStore(e) {
    await this.core.storage.setItem(this.storageKey, e);
  }
  async getDataStore() {
    return await this.core.storage.getItem(this.storageKey);
  }
  getData(e) {
    const t = this.map.get(e);
    if (!t) {
      if (this.recentlyDeleted.includes(e)) {
        const { message: s } = F("MISSING_OR_INVALID", `Record was recently deleted - ${this.name}: ${e}`);
        throw (this.logger.error(s), new Error(s));
      }
      const { message: i } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw (this.logger.error(i), new Error(i));
    }
    return t;
  }
  async persist() {
    await this.setDataStore(this.values);
  }
  async restore() {
    try {
      const e = await this.getDataStore();
      if (typeof e > "u" || !e.length) return;
      if (this.map.size) {
        const { message: t } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw (this.logger.error(t), new Error(t));
      }
      ((this.cached = e),
        this.logger.debug(`Successfully Restored value for ${this.name}`),
        this.logger.trace({ type: "method", method: "restore", value: this.values }));
    } catch (e) {
      (this.logger.debug(`Failed to Restore value for ${this.name}`), this.logger.error(e));
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
var G2 = Object.defineProperty,
  Y2 = (r, e, t) => (e in r ? G2(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  G = (r, e, t) => Y2(r, typeof e != "symbol" ? e + "" : e, t);
class J2 {
  constructor(e, t) {
    ((this.core = e),
      (this.logger = t),
      G(this, "name", XE),
      G(this, "version", e_),
      G(this, "events", new Io()),
      G(this, "pairings"),
      G(this, "initialized", !1),
      G(this, "storagePrefix", St),
      G(this, "ignoredPayloadTypes", [Ut]),
      G(this, "registeredMethods", []),
      G(this, "init", async () => {
        this.initialized ||
          (await this.pairings.init(),
          await this.cleanup(),
          this.registerRelayerEvents(),
          this.registerExpirerEvents(),
          (this.initialized = !0),
          this.logger.trace("Initialized"));
      }),
      G(this, "register", ({ methods: i }) => {
        (this.isInitialized(), (this.registeredMethods = [...new Set([...this.registeredMethods, ...i])]));
      }),
      G(this, "create", async (i) => {
        this.isInitialized();
        const s = io(),
          n = await this.core.crypto.setSymKey(s),
          o = pe(U.FIVE_MINUTES),
          a = { protocol: Wl },
          c = { topic: n, expiry: o, relay: a, active: !1, methods: i == null ? void 0 : i.methods },
          h = Pc({
            protocol: this.core.protocol,
            version: this.core.version,
            topic: n,
            symKey: s,
            relay: a,
            expiryTimestamp: o,
            methods: i == null ? void 0 : i.methods,
          });
        return (
          this.events.emit(nr.create, c),
          this.core.expirer.set(n, o),
          await this.pairings.set(n, c),
          await this.core.relayer.subscribe(n, { transportType: i == null ? void 0 : i.transportType }),
          { topic: n, uri: h }
        );
      }),
      G(this, "pair", async (i) => {
        this.isInitialized();
        const s = this.core.eventClient.createEvent({
          properties: { topic: i == null ? void 0 : i.uri, trace: [vt.pairing_started] },
        });
        this.isValidPair(i, s);
        const { topic: n, symKey: o, relay: a, expiryTimestamp: c, methods: h } = Oc(i.uri);
        ((s.props.properties.topic = n),
          s.addTrace(vt.pairing_uri_validation_success),
          s.addTrace(vt.pairing_uri_not_expired));
        let u;
        if (this.pairings.keys.includes(n)) {
          if (((u = this.pairings.get(n)), s.addTrace(vt.existing_pairing), u.active))
            throw (
              s.setError(Rt.active_pairing_already_exists),
              new Error(`Pairing already exists: ${n}. Please try again with a new connection URI.`)
            );
          s.addTrace(vt.pairing_not_expired);
        }
        const l = c || pe(U.FIVE_MINUTES),
          d = { topic: n, relay: a, expiry: l, active: !1, methods: h };
        (this.core.expirer.set(n, l),
          await this.pairings.set(n, d),
          s.addTrace(vt.store_new_pairing),
          i.activatePairing && (await this.activate({ topic: n })),
          this.events.emit(nr.create, d),
          s.addTrace(vt.emit_inactive_pairing),
          this.core.crypto.keychain.has(n) || (await this.core.crypto.setSymKey(o, n)),
          s.addTrace(vt.subscribing_pairing_topic));
        try {
          await this.core.relayer.confirmOnlineStateOrThrow();
        } catch {
          s.setError(Rt.no_internet_connection);
        }
        try {
          await this.core.relayer.subscribe(n, { relay: a });
        } catch (f) {
          throw (s.setError(Rt.subscribe_pairing_topic_failure), f);
        }
        return (s.addTrace(vt.subscribe_pairing_topic_success), d);
      }),
      G(this, "activate", async ({ topic: i }) => {
        this.isInitialized();
        const s = pe(U.FIVE_MINUTES);
        (this.core.expirer.set(i, s), await this.pairings.update(i, { active: !0, expiry: s }));
      }),
      G(this, "ping", async (i) => {
        (this.isInitialized(),
          await this.isValidPing(i),
          this.logger.warn("ping() is deprecated and will be removed in the next major release."));
        const { topic: s } = i;
        if (this.pairings.keys.includes(s)) {
          const n = await this.sendRequest(s, "wc_pairingPing", {}),
            { done: o, resolve: a, reject: c } = tr();
          (this.events.once(ee("pairing_ping", n), ({ error: h }) => {
            h ? c(h) : a();
          }),
            await o());
        }
      }),
      G(this, "updateExpiry", async ({ topic: i, expiry: s }) => {
        (this.isInitialized(), await this.pairings.update(i, { expiry: s }));
      }),
      G(this, "updateMetadata", async ({ topic: i, metadata: s }) => {
        (this.isInitialized(), await this.pairings.update(i, { peerMetadata: s }));
      }),
      G(this, "getPairings", () => (this.isInitialized(), this.pairings.values)),
      G(this, "disconnect", async (i) => {
        (this.isInitialized(), await this.isValidDisconnect(i));
        const { topic: s } = i;
        this.pairings.keys.includes(s) &&
          (await this.sendRequest(s, "wc_pairingDelete", re("USER_DISCONNECTED")), await this.deletePairing(s));
      }),
      G(this, "formatUriFromPairing", (i) => {
        this.isInitialized();
        const { topic: s, relay: n, expiry: o, methods: a } = i,
          c = this.core.crypto.keychain.get(s);
        return Pc({
          protocol: this.core.protocol,
          version: this.core.version,
          topic: s,
          symKey: c,
          relay: n,
          expiryTimestamp: o,
          methods: a,
        });
      }),
      G(this, "sendRequest", async (i, s, n) => {
        const o = Wt(s, n),
          a = await this.core.crypto.encode(i, o),
          c = pi[s].req;
        return (this.core.history.set(i, o), this.core.relayer.publish(i, a, c), o.id);
      }),
      G(this, "sendResult", async (i, s, n) => {
        const o = ks(i, n),
          a = await this.core.crypto.encode(s, o),
          c = (await this.core.history.get(s, i)).request.method,
          h = pi[c].res;
        (await this.core.relayer.publish(s, a, h), await this.core.history.resolve(o));
      }),
      G(this, "sendError", async (i, s, n) => {
        const o = Ls(i, n),
          a = await this.core.crypto.encode(s, o),
          c = (await this.core.history.get(s, i)).request.method,
          h = pi[c] ? pi[c].res : pi.unregistered_method.res;
        (await this.core.relayer.publish(s, a, h), await this.core.history.resolve(o));
      }),
      G(this, "deletePairing", async (i, s) => {
        (await this.core.relayer.unsubscribe(i),
          await Promise.all([
            this.pairings.delete(i, re("USER_DISCONNECTED")),
            this.core.crypto.deleteSymKey(i),
            s ? Promise.resolve() : this.core.expirer.del(i),
          ]));
      }),
      G(this, "cleanup", async () => {
        const i = this.pairings.getAll().filter((s) => Ht(s.expiry));
        await Promise.all(i.map((s) => this.deletePairing(s.topic)));
      }),
      G(this, "onRelayEventRequest", async (i) => {
        const { topic: s, payload: n } = i;
        switch (n.method) {
          case "wc_pairingPing":
            return await this.onPairingPingRequest(s, n);
          case "wc_pairingDelete":
            return await this.onPairingDeleteRequest(s, n);
          default:
            return await this.onUnknownRpcMethodRequest(s, n);
        }
      }),
      G(this, "onRelayEventResponse", async (i) => {
        const { topic: s, payload: n } = i,
          o = (await this.core.history.get(s, n.id)).request.method;
        switch (o) {
          case "wc_pairingPing":
            return this.onPairingPingResponse(s, n);
          default:
            return this.onUnknownRpcMethodResponse(o);
        }
      }),
      G(this, "onPairingPingRequest", async (i, s) => {
        const { id: n } = s;
        try {
          (this.isValidPing({ topic: i }),
            await this.sendResult(n, i, !0),
            this.events.emit(nr.ping, { id: n, topic: i }));
        } catch (o) {
          (await this.sendError(n, i, o), this.logger.error(o));
        }
      }),
      G(this, "onPairingPingResponse", (i, s) => {
        const { id: n } = s;
        setTimeout(() => {
          _t(s)
            ? this.events.emit(ee("pairing_ping", n), {})
            : it(s) && this.events.emit(ee("pairing_ping", n), { error: s.error });
        }, 500);
      }),
      G(this, "onPairingDeleteRequest", async (i, s) => {
        const { id: n } = s;
        try {
          (this.isValidDisconnect({ topic: i }),
            await this.deletePairing(i),
            this.events.emit(nr.delete, { id: n, topic: i }));
        } catch (o) {
          (await this.sendError(n, i, o), this.logger.error(o));
        }
      }),
      G(this, "onUnknownRpcMethodRequest", async (i, s) => {
        const { id: n, method: o } = s;
        try {
          if (this.registeredMethods.includes(o)) return;
          const a = re("WC_METHOD_UNSUPPORTED", o);
          (await this.sendError(n, i, a), this.logger.error(a));
        } catch (a) {
          (await this.sendError(n, i, a), this.logger.error(a));
        }
      }),
      G(this, "onUnknownRpcMethodResponse", (i) => {
        this.registeredMethods.includes(i) || this.logger.error(re("WC_METHOD_UNSUPPORTED", i));
      }),
      G(this, "isValidPair", (i, s) => {
        var n;
        if (!Le(i)) {
          const { message: a } = F("MISSING_OR_INVALID", `pair() params: ${i}`);
          throw (s.setError(Rt.malformed_pairing_uri), new Error(a));
        }
        if (!$0(i.uri)) {
          const { message: a } = F("MISSING_OR_INVALID", `pair() uri: ${i.uri}`);
          throw (s.setError(Rt.malformed_pairing_uri), new Error(a));
        }
        const o = Oc(i == null ? void 0 : i.uri);
        if (!((n = o == null ? void 0 : o.relay) != null && n.protocol)) {
          const { message: a } = F("MISSING_OR_INVALID", "pair() uri#relay-protocol");
          throw (s.setError(Rt.malformed_pairing_uri), new Error(a));
        }
        if (!(o != null && o.symKey)) {
          const { message: a } = F("MISSING_OR_INVALID", "pair() uri#symKey");
          throw (s.setError(Rt.malformed_pairing_uri), new Error(a));
        }
        if (o != null && o.expiryTimestamp && U.toMiliseconds(o == null ? void 0 : o.expiryTimestamp) < Date.now()) {
          s.setError(Rt.pairing_expired);
          const { message: a } = F("EXPIRED", "pair() URI has expired. Please try again with a new connection URI.");
          throw new Error(a);
        }
      }),
      G(this, "isValidPing", async (i) => {
        if (!Le(i)) {
          const { message: n } = F("MISSING_OR_INVALID", `ping() params: ${i}`);
          throw new Error(n);
        }
        const { topic: s } = i;
        await this.isValidPairingTopic(s);
      }),
      G(this, "isValidDisconnect", async (i) => {
        if (!Le(i)) {
          const { message: n } = F("MISSING_OR_INVALID", `disconnect() params: ${i}`);
          throw new Error(n);
        }
        const { topic: s } = i;
        await this.isValidPairingTopic(s);
      }),
      G(this, "isValidPairingTopic", async (i) => {
        if (!de(i, !1)) {
          const { message: s } = F("MISSING_OR_INVALID", `pairing topic should be a string: ${i}`);
          throw new Error(s);
        }
        if (!this.pairings.keys.includes(i)) {
          const { message: s } = F("NO_MATCHING_KEY", `pairing topic doesn't exist: ${i}`);
          throw new Error(s);
        }
        if (Ht(this.pairings.get(i).expiry)) {
          await this.deletePairing(i);
          const { message: s } = F("EXPIRED", `pairing topic: ${i}`);
          throw new Error(s);
        }
      }),
      (this.core = e),
      (this.logger = Be(t, this.name)),
      (this.pairings = new wr(this.core, this.logger, this.name, this.storagePrefix)));
  }
  get context() {
    return ze(this.logger);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  registerRelayerEvents() {
    this.core.relayer.on(be.message, async (e) => {
      const { topic: t, message: i, transportType: s } = e;
      if (
        this.pairings.keys.includes(t) &&
        s !== ce.link_mode &&
        !this.ignoredPayloadTypes.includes(this.core.crypto.getPayloadType(i))
      )
        try {
          const n = await this.core.crypto.decode(t, i);
          (Mo(n)
            ? (this.core.history.set(t, n), await this.onRelayEventRequest({ topic: t, payload: n }))
            : qs(n) &&
              (await this.core.history.resolve(n),
              await this.onRelayEventResponse({ topic: t, payload: n }),
              this.core.history.delete(t, n.id)),
            await this.core.relayer.messages.ack(t, i));
        } catch (n) {
          this.logger.error(n);
        }
    });
  }
  registerExpirerEvents() {
    this.core.expirer.on(rt.expired, async (e) => {
      const { topic: t } = rl(e.target);
      t &&
        this.pairings.keys.includes(t) &&
        (await this.deletePairing(t, !0), this.events.emit(nr.expire, { topic: t }));
    });
  }
}
var Z2 = Object.defineProperty,
  Q2 = (r, e, t) => (e in r ? Z2(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Se = (r, e, t) => Q2(r, typeof e != "symbol" ? e + "" : e, t);
class X2 extends Q1 {
  constructor(e, t) {
    (super(e, t),
      (this.core = e),
      (this.logger = t),
      Se(this, "records", new Map()),
      Se(this, "events", new Ze.EventEmitter()),
      Se(this, "name", t_),
      Se(this, "version", r_),
      Se(this, "cached", []),
      Se(this, "initialized", !1),
      Se(this, "storagePrefix", St),
      Se(this, "init", async () => {
        this.initialized ||
          (this.logger.trace("Initialized"),
          await this.restore(),
          this.cached.forEach((i) => this.records.set(i.id, i)),
          (this.cached = []),
          this.registerEventListeners(),
          (this.initialized = !0));
      }),
      Se(this, "set", (i, s, n) => {
        if (
          (this.isInitialized(),
          this.logger.debug("Setting JSON-RPC request history record"),
          this.logger.trace({ type: "method", method: "set", topic: i, request: s, chainId: n }),
          this.records.has(s.id))
        )
          return;
        const o = {
          id: s.id,
          topic: i,
          request: { method: s.method, params: s.params || null },
          chainId: n,
          expiry: pe(U.THIRTY_DAYS),
        };
        (this.records.set(o.id, o), this.persist(), this.events.emit(ht.created, o));
      }),
      Se(this, "resolve", async (i) => {
        if (
          (this.isInitialized(),
          this.logger.debug("Updating JSON-RPC response history record"),
          this.logger.trace({ type: "method", method: "update", response: i }),
          !this.records.has(i.id))
        )
          return;
        const s = await this.getRecord(i.id);
        typeof s.response > "u" &&
          ((s.response = it(i) ? { error: i.error } : { result: i.result }),
          this.records.set(s.id, s),
          this.persist(),
          this.events.emit(ht.updated, s));
      }),
      Se(
        this,
        "get",
        async (i, s) => (
          this.isInitialized(),
          this.logger.debug("Getting record"),
          this.logger.trace({ type: "method", method: "get", topic: i, id: s }),
          await this.getRecord(s)
        ),
      ),
      Se(this, "delete", (i, s) => {
        (this.isInitialized(),
          this.logger.debug("Deleting record"),
          this.logger.trace({ type: "method", method: "delete", id: s }),
          this.values.forEach((n) => {
            if (n.topic === i) {
              if (typeof s < "u" && n.id !== s) return;
              (this.records.delete(n.id), this.events.emit(ht.deleted, n));
            }
          }),
          this.persist());
      }),
      Se(
        this,
        "exists",
        async (i, s) => (this.isInitialized(), this.records.has(s) ? (await this.getRecord(s)).topic === i : !1),
      ),
      Se(this, "on", (i, s) => {
        this.events.on(i, s);
      }),
      Se(this, "once", (i, s) => {
        this.events.once(i, s);
      }),
      Se(this, "off", (i, s) => {
        this.events.off(i, s);
      }),
      Se(this, "removeListener", (i, s) => {
        this.events.removeListener(i, s);
      }),
      (this.logger = Be(t, this.name)));
  }
  get context() {
    return ze(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get size() {
    return this.records.size;
  }
  get keys() {
    return Array.from(this.records.keys());
  }
  get values() {
    return Array.from(this.records.values());
  }
  get pending() {
    const e = [];
    return (
      this.values.forEach((t) => {
        if (typeof t.response < "u") return;
        const i = { topic: t.topic, request: Wt(t.request.method, t.request.params, t.id), chainId: t.chainId };
        return e.push(i);
      }),
      e
    );
  }
  async setJsonRpcRecords(e) {
    await this.core.storage.setItem(this.storageKey, e);
  }
  async getJsonRpcRecords() {
    return await this.core.storage.getItem(this.storageKey);
  }
  getRecord(e) {
    this.isInitialized();
    const t = this.records.get(e);
    if (!t) {
      const { message: i } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw new Error(i);
    }
    return t;
  }
  async persist() {
    (await this.setJsonRpcRecords(this.values), this.events.emit(ht.sync));
  }
  async restore() {
    try {
      const e = await this.getJsonRpcRecords();
      if (typeof e > "u" || !e.length) return;
      if (this.records.size) {
        const { message: t } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw (this.logger.error(t), new Error(t));
      }
      ((this.cached = e),
        this.logger.debug(`Successfully Restored records for ${this.name}`),
        this.logger.trace({ type: "method", method: "restore", records: this.values }));
    } catch (e) {
      (this.logger.debug(`Failed to Restore records for ${this.name}`), this.logger.error(e));
    }
  }
  registerEventListeners() {
    (this.events.on(ht.created, (e) => {
      const t = ht.created;
      (this.logger.info(`Emitting ${t}`), this.logger.debug({ type: "event", event: t, record: e }));
    }),
      this.events.on(ht.updated, (e) => {
        const t = ht.updated;
        (this.logger.info(`Emitting ${t}`), this.logger.debug({ type: "event", event: t, record: e }));
      }),
      this.events.on(ht.deleted, (e) => {
        const t = ht.deleted;
        (this.logger.info(`Emitting ${t}`), this.logger.debug({ type: "event", event: t, record: e }));
      }),
      this.core.heartbeat.on(mr.pulse, () => {
        this.cleanup();
      }));
  }
  cleanup() {
    try {
      this.isInitialized();
      let e = !1;
      (this.records.forEach((t) => {
        U.toMiliseconds(t.expiry || 0) - Date.now() <= 0 &&
          (this.logger.info(`Deleting expired history log: ${t.id}`),
          this.records.delete(t.id),
          this.events.emit(ht.deleted, t, !1),
          (e = !0));
      }),
        e && this.persist());
    } catch (e) {
      this.logger.warn(e);
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
var e$ = Object.defineProperty,
  t$ = (r, e, t) => (e in r ? e$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Te = (r, e, t) => t$(r, typeof e != "symbol" ? e + "" : e, t);
class r$ extends sE {
  constructor(e, t) {
    (super(e, t),
      (this.core = e),
      (this.logger = t),
      Te(this, "expirations", new Map()),
      Te(this, "events", new Ze.EventEmitter()),
      Te(this, "name", i_),
      Te(this, "version", s_),
      Te(this, "cached", []),
      Te(this, "initialized", !1),
      Te(this, "storagePrefix", St),
      Te(this, "init", async () => {
        this.initialized ||
          (this.logger.trace("Initialized"),
          await this.restore(),
          this.cached.forEach((i) => this.expirations.set(i.target, i)),
          (this.cached = []),
          this.registerEventListeners(),
          (this.initialized = !0));
      }),
      Te(this, "has", (i) => {
        try {
          const s = this.formatTarget(i);
          return typeof this.getExpiration(s) < "u";
        } catch {
          return !1;
        }
      }),
      Te(this, "set", (i, s) => {
        this.isInitialized();
        const n = this.formatTarget(i),
          o = { target: n, expiry: s };
        (this.expirations.set(n, o),
          this.checkExpiry(n, o),
          this.events.emit(rt.created, { target: n, expiration: o }));
      }),
      Te(this, "get", (i) => {
        this.isInitialized();
        const s = this.formatTarget(i);
        return this.getExpiration(s);
      }),
      Te(this, "del", (i) => {
        if ((this.isInitialized(), this.has(i))) {
          const s = this.formatTarget(i),
            n = this.getExpiration(s);
          (this.expirations.delete(s), this.events.emit(rt.deleted, { target: s, expiration: n }));
        }
      }),
      Te(this, "on", (i, s) => {
        this.events.on(i, s);
      }),
      Te(this, "once", (i, s) => {
        this.events.once(i, s);
      }),
      Te(this, "off", (i, s) => {
        this.events.off(i, s);
      }),
      Te(this, "removeListener", (i, s) => {
        this.events.removeListener(i, s);
      }),
      (this.logger = Be(t, this.name)));
  }
  get context() {
    return ze(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get length() {
    return this.expirations.size;
  }
  get keys() {
    return Array.from(this.expirations.keys());
  }
  get values() {
    return Array.from(this.expirations.values());
  }
  formatTarget(e) {
    if (typeof e == "string") return Ow(e);
    if (typeof e == "number") return Pw(e);
    const { message: t } = F("UNKNOWN_TYPE", `Target type: ${typeof e}`);
    throw new Error(t);
  }
  async setExpirations(e) {
    await this.core.storage.setItem(this.storageKey, e);
  }
  async getExpirations() {
    return await this.core.storage.getItem(this.storageKey);
  }
  async persist() {
    (await this.setExpirations(this.values), this.events.emit(rt.sync));
  }
  async restore() {
    try {
      const e = await this.getExpirations();
      if (typeof e > "u" || !e.length) return;
      if (this.expirations.size) {
        const { message: t } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw (this.logger.error(t), new Error(t));
      }
      ((this.cached = e),
        this.logger.debug(`Successfully Restored expirations for ${this.name}`),
        this.logger.trace({ type: "method", method: "restore", expirations: this.values }));
    } catch (e) {
      (this.logger.debug(`Failed to Restore expirations for ${this.name}`), this.logger.error(e));
    }
  }
  getExpiration(e) {
    const t = this.expirations.get(e);
    if (!t) {
      const { message: i } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw (this.logger.warn(i), new Error(i));
    }
    return t;
  }
  checkExpiry(e, t) {
    const { expiry: i } = t;
    U.toMiliseconds(i) - Date.now() <= 0 && this.expire(e, t);
  }
  expire(e, t) {
    (this.expirations.delete(e), this.events.emit(rt.expired, { target: e, expiration: t }));
  }
  checkExpirations() {
    this.core.relayer.connected && this.expirations.forEach((e, t) => this.checkExpiry(t, e));
  }
  registerEventListeners() {
    (this.core.heartbeat.on(mr.pulse, () => this.checkExpirations()),
      this.events.on(rt.created, (e) => {
        const t = rt.created;
        (this.logger.info(`Emitting ${t}`), this.logger.debug({ type: "event", event: t, data: e }), this.persist());
      }),
      this.events.on(rt.expired, (e) => {
        const t = rt.expired;
        (this.logger.info(`Emitting ${t}`), this.logger.debug({ type: "event", event: t, data: e }), this.persist());
      }),
      this.events.on(rt.deleted, (e) => {
        const t = rt.deleted;
        (this.logger.info(`Emitting ${t}`), this.logger.debug({ type: "event", event: t, data: e }), this.persist());
      }));
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
var i$ = Object.defineProperty,
  s$ = (r, e, t) => (e in r ? i$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  le = (r, e, t) => s$(r, typeof e != "symbol" ? e + "" : e, t);
class n$ extends nE {
  constructor(e, t, i) {
    (super(e, t, i),
      (this.core = e),
      (this.logger = t),
      (this.store = i),
      le(this, "name", n_),
      le(this, "abortController"),
      le(this, "isDevEnv"),
      le(this, "verifyUrlV3", a_),
      le(this, "storagePrefix", St),
      le(this, "version", Kl),
      le(this, "publicKey"),
      le(this, "fetchPromise"),
      le(this, "init", async () => {
        var s;
        this.isDevEnv ||
          ((this.publicKey = await this.store.getItem(this.storeKey)),
          this.publicKey &&
            U.toMiliseconds((s = this.publicKey) == null ? void 0 : s.expiresAt) < Date.now() &&
            (this.logger.debug("verify v2 public key expired"), await this.removePublicKey()));
      }),
      le(this, "register", async (s) => {
        if (!ti() || this.isDevEnv) return;
        const n = window.location.origin,
          { id: o, decryptedId: a } = s,
          c = `${this.verifyUrlV3}/attestation?projectId=${this.core.projectId}&origin=${n}&id=${o}&decryptedId=${a}`;
        try {
          const h = Ft.getDocument(),
            u = this.startAbortTimer(U.ONE_SECOND * 5),
            l = await new Promise((d, f) => {
              const p = () => {
                (window.removeEventListener("message", w), h.body.removeChild(g), f("attestation aborted"));
              };
              this.abortController.signal.addEventListener("abort", p);
              const g = h.createElement("iframe");
              ((g.src = c),
                (g.style.display = "none"),
                g.addEventListener("error", p, { signal: this.abortController.signal }));
              const w = (E) => {
                if (E.data && typeof E.data == "string")
                  try {
                    const b = JSON.parse(E.data);
                    if (b.type === "verify_attestation") {
                      if (Vn(b.attestation).payload.id !== o) return;
                      (clearInterval(u),
                        h.body.removeChild(g),
                        this.abortController.signal.removeEventListener("abort", p),
                        window.removeEventListener("message", w),
                        d(b.attestation === null ? "" : b.attestation));
                    }
                  } catch (b) {
                    this.logger.warn(b);
                  }
              };
              (h.body.appendChild(g), window.addEventListener("message", w, { signal: this.abortController.signal }));
            });
          return (this.logger.debug("jwt attestation", l), l);
        } catch (h) {
          this.logger.warn(h);
        }
        return "";
      }),
      le(this, "resolve", async (s) => {
        if (this.isDevEnv) return "";
        const { attestationId: n, hash: o, encryptedId: a } = s;
        if (n === "") {
          this.logger.debug("resolve: attestationId is empty, skipping");
          return;
        }
        if (n) {
          if (Vn(n).payload.id !== a) return;
          const h = await this.isValidJwtAttestation(n);
          if (h) {
            if (!h.isVerified) {
              this.logger.warn("resolve: jwt attestation: origin url not verified");
              return;
            }
            return h;
          }
        }
        if (!o) return;
        const c = this.getVerifyUrl(s == null ? void 0 : s.verifyUrl);
        return this.fetchAttestation(o, c);
      }),
      le(this, "fetchAttestation", async (s, n) => {
        this.logger.debug(`resolving attestation: ${s} from url: ${n}`);
        const o = this.startAbortTimer(U.ONE_SECOND * 5),
          a = await fetch(`${n}/attestation/${s}?v2Supported=true`, { signal: this.abortController.signal });
        return (clearTimeout(o), a.status === 200 ? await a.json() : void 0);
      }),
      le(this, "getVerifyUrl", (s) => {
        let n = s || Ii;
        return (
          c_.includes(n) ||
            (this.logger.info(`verify url: ${n}, not included in trusted list, assigning default: ${Ii}`), (n = Ii)),
          n
        );
      }),
      le(this, "fetchPublicKey", async () => {
        try {
          this.logger.debug(`fetching public key from: ${this.verifyUrlV3}`);
          const s = this.startAbortTimer(U.FIVE_SECONDS),
            n = await fetch(`${this.verifyUrlV3}/public-key`, { signal: this.abortController.signal });
          return (clearTimeout(s), await n.json());
        } catch (s) {
          this.logger.warn(s);
        }
      }),
      le(this, "persistPublicKey", async (s) => {
        (this.logger.debug("persisting public key to local storage", s),
          await this.store.setItem(this.storeKey, s),
          (this.publicKey = s));
      }),
      le(this, "removePublicKey", async () => {
        (this.logger.debug("removing verify v2 public key from storage"),
          await this.store.removeItem(this.storeKey),
          (this.publicKey = void 0));
      }),
      le(this, "isValidJwtAttestation", async (s) => {
        const n = await this.getPublicKey();
        try {
          if (n) return this.validateAttestation(s, n);
        } catch (a) {
          (this.logger.error(a), this.logger.warn("error validating attestation"));
        }
        const o = await this.fetchAndPersistPublicKey();
        try {
          if (o) return this.validateAttestation(s, o);
        } catch (a) {
          (this.logger.error(a), this.logger.warn("error validating attestation"));
        }
      }),
      le(this, "getPublicKey", async () => (this.publicKey ? this.publicKey : await this.fetchAndPersistPublicKey())),
      le(this, "fetchAndPersistPublicKey", async () => {
        if (this.fetchPromise) return (await this.fetchPromise, this.publicKey);
        this.fetchPromise = new Promise(async (n) => {
          const o = await this.fetchPublicKey();
          o && (await this.persistPublicKey(o), n(o));
        });
        const s = await this.fetchPromise;
        return ((this.fetchPromise = void 0), s);
      }),
      le(this, "validateAttestation", (s, n) => {
        const o = i0(s, n.publicKey),
          a = { hasExpired: U.toMiliseconds(o.exp) < Date.now(), payload: o };
        if (a.hasExpired)
          throw (this.logger.warn("resolve: jwt attestation expired"), new Error("JWT attestation expired"));
        return { origin: a.payload.origin, isScam: a.payload.isScam, isVerified: a.payload.isVerified };
      }),
      (this.logger = Be(t, this.name)),
      (this.abortController = new AbortController()),
      (this.isDevEnv = To()),
      this.init());
  }
  get storeKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//verify:public:key";
  }
  get context() {
    return ze(this.logger);
  }
  startAbortTimer(e) {
    return (
      (this.abortController = new AbortController()),
      setTimeout(() => this.abortController.abort(), U.toMiliseconds(e))
    );
  }
}
var o$ = Object.defineProperty,
  a$ = (r, e, t) => (e in r ? o$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Ih = (r, e, t) => a$(r, typeof e != "symbol" ? e + "" : e, t);
class c$ extends oE {
  constructor(e, t) {
    (super(e, t),
      (this.projectId = e),
      (this.logger = t),
      Ih(this, "context", h_),
      Ih(this, "registerDeviceToken", async (i) => {
        const { clientId: s, token: n, notificationType: o, enableEncrypted: a = !1 } = i,
          c = `${u_}/${this.projectId}/clients`;
        await fetch(c, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: s, type: o, token: n, always_raw: a }),
        });
      }),
      (this.logger = Be(t, this.context)));
  }
}
var h$ = Object.defineProperty,
  $h = Object.getOwnPropertySymbols,
  u$ = Object.prototype.hasOwnProperty,
  l$ = Object.prototype.propertyIsEnumerable,
  go = (r, e, t) => (e in r ? h$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  yi = (r, e) => {
    for (var t in e || (e = {})) u$.call(e, t) && go(r, t, e[t]);
    if ($h) for (var t of $h(e)) l$.call(e, t) && go(r, t, e[t]);
    return r;
  },
  ge = (r, e, t) => go(r, typeof e != "symbol" ? e + "" : e, t);
class d$ extends aE {
  constructor(e, t, i = !0) {
    (super(e, t, i),
      (this.core = e),
      (this.logger = t),
      ge(this, "context", d_),
      ge(this, "storagePrefix", St),
      ge(this, "storageVersion", l_),
      ge(this, "events", new Map()),
      ge(this, "shouldPersist", !1),
      ge(this, "init", async () => {
        if (!To())
          try {
            const s = {
              eventId: Za(),
              timestamp: Date.now(),
              domain: this.getAppDomain(),
              props: {
                event: "INIT",
                type: "",
                properties: {
                  client_id: await this.core.crypto.getClientId(),
                  user_agent: el(this.core.relayer.protocol, this.core.relayer.version, oo),
                },
              },
            };
            await this.sendEvent([s]);
          } catch (s) {
            this.logger.warn(s);
          }
      }),
      ge(this, "createEvent", (s) => {
        const {
            event: n = "ERROR",
            type: o = "",
            properties: { topic: a, trace: c },
          } = s,
          h = Za(),
          u = this.core.projectId || "",
          l = Date.now(),
          d = yi(
            {
              eventId: h,
              timestamp: l,
              props: { event: n, type: o, properties: { topic: a, trace: c } },
              bundleId: u,
              domain: this.getAppDomain(),
            },
            this.setMethods(h),
          );
        return (this.telemetryEnabled && (this.events.set(h, d), (this.shouldPersist = !0)), d);
      }),
      ge(this, "getEvent", (s) => {
        const { eventId: n, topic: o } = s;
        if (n) return this.events.get(n);
        const a = Array.from(this.events.values()).find((c) => c.props.properties.topic === o);
        if (a) return yi(yi({}, a), this.setMethods(a.eventId));
      }),
      ge(this, "deleteEvent", (s) => {
        const { eventId: n } = s;
        (this.events.delete(n), (this.shouldPersist = !0));
      }),
      ge(this, "setEventListeners", () => {
        this.core.heartbeat.on(mr.pulse, async () => {
          (this.shouldPersist && (await this.persist()),
            this.events.forEach((s) => {
              U.fromMiliseconds(Date.now()) - U.fromMiliseconds(s.timestamp) > p_ &&
                (this.events.delete(s.eventId), (this.shouldPersist = !0));
            }));
        });
      }),
      ge(this, "setMethods", (s) => ({ addTrace: (n) => this.addTrace(s, n), setError: (n) => this.setError(s, n) })),
      ge(this, "addTrace", (s, n) => {
        const o = this.events.get(s);
        o && (o.props.properties.trace.push(n), this.events.set(s, o), (this.shouldPersist = !0));
      }),
      ge(this, "setError", (s, n) => {
        const o = this.events.get(s);
        o && ((o.props.type = n), (o.timestamp = Date.now()), this.events.set(s, o), (this.shouldPersist = !0));
      }),
      ge(this, "persist", async () => {
        (await this.core.storage.setItem(this.storageKey, Array.from(this.events.values())), (this.shouldPersist = !1));
      }),
      ge(this, "restore", async () => {
        try {
          const s = (await this.core.storage.getItem(this.storageKey)) || [];
          if (!s.length) return;
          s.forEach((n) => {
            this.events.set(n.eventId, yi(yi({}, n), this.setMethods(n.eventId)));
          });
        } catch (s) {
          this.logger.warn(s);
        }
      }),
      ge(this, "submit", async () => {
        if (!this.telemetryEnabled || this.events.size === 0) return;
        const s = [];
        for (const [n, o] of this.events) o.props.type && s.push(o);
        if (s.length !== 0)
          try {
            if ((await this.sendEvent(s)).ok)
              for (const n of s) (this.events.delete(n.eventId), (this.shouldPersist = !0));
          } catch (n) {
            this.logger.warn(n);
          }
      }),
      ge(this, "sendEvent", async (s) => {
        const n = this.getAppDomain() ? "" : "&sp=desktop";
        return await fetch(`${f_}?projectId=${this.core.projectId}&st=events_sdk&sv=js-${oo}${n}`, {
          method: "POST",
          body: JSON.stringify(s),
        });
      }),
      ge(this, "getAppDomain", () => Xu().url),
      (this.logger = Be(t, this.context)),
      (this.telemetryEnabled = i),
      i
        ? this.restore().then(async () => {
            (await this.submit(), this.setEventListeners());
          })
        : this.persist());
  }
  get storageKey() {
    return this.storagePrefix + this.storageVersion + this.core.customStoragePrefix + "//" + this.context;
  }
}
var p$ = Object.defineProperty,
  Dh = Object.getOwnPropertySymbols,
  f$ = Object.prototype.hasOwnProperty,
  g$ = Object.prototype.propertyIsEnumerable,
  yo = (r, e, t) => (e in r ? p$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Sh = (r, e) => {
    for (var t in e || (e = {})) f$.call(e, t) && yo(r, t, e[t]);
    if (Dh) for (var t of Dh(e)) g$.call(e, t) && yo(r, t, e[t]);
    return r;
  },
  ae = (r, e, t) => yo(r, typeof e != "symbol" ? e + "" : e, t);
let y$ = class od extends G1 {
  constructor(e) {
    var t;
    (super(e),
      ae(this, "protocol", Vl),
      ae(this, "version", Kl),
      ae(this, "name", no),
      ae(this, "relayUrl"),
      ae(this, "projectId"),
      ae(this, "customStoragePrefix"),
      ae(this, "events", new Ze.EventEmitter()),
      ae(this, "logger"),
      ae(this, "heartbeat"),
      ae(this, "relayer"),
      ae(this, "crypto"),
      ae(this, "storage"),
      ae(this, "history"),
      ae(this, "expirer"),
      ae(this, "pairing"),
      ae(this, "verify"),
      ae(this, "echoClient"),
      ae(this, "linkModeSupportedApps"),
      ae(this, "eventClient"),
      ae(this, "initialized", !1),
      ae(this, "logChunkController"),
      ae(this, "on", (a, c) => this.events.on(a, c)),
      ae(this, "once", (a, c) => this.events.once(a, c)),
      ae(this, "off", (a, c) => this.events.off(a, c)),
      ae(this, "removeListener", (a, c) => this.events.removeListener(a, c)),
      ae(this, "dispatchEnvelope", ({ topic: a, message: c, sessionExists: h }) => {
        if (!a || !c) return;
        const u = { topic: a, message: c, publishedAt: Date.now(), transportType: ce.link_mode };
        this.relayer.onLinkMessageEvent(u, { sessionExists: h });
      }));
    const i = this.getGlobalCore(e == null ? void 0 : e.customStoragePrefix);
    if (i)
      try {
        return (
          (this.customStoragePrefix = i.customStoragePrefix),
          (this.logger = i.logger),
          (this.heartbeat = i.heartbeat),
          (this.crypto = i.crypto),
          (this.history = i.history),
          (this.expirer = i.expirer),
          (this.storage = i.storage),
          (this.relayer = i.relayer),
          (this.pairing = i.pairing),
          (this.verify = i.verify),
          (this.echoClient = i.echoClient),
          (this.linkModeSupportedApps = i.linkModeSupportedApps),
          (this.eventClient = i.eventClient),
          (this.initialized = i.initialized),
          (this.logChunkController = i.logChunkController),
          i
        );
      } catch (a) {
        console.warn("Failed to copy global core", a);
      }
    ((this.projectId = e == null ? void 0 : e.projectId),
      (this.relayUrl = (e == null ? void 0 : e.relayUrl) || Gl),
      (this.customStoragePrefix = e != null && e.customStoragePrefix ? `:${e.customStoragePrefix}` : ""));
    const s = Fs({
        level: typeof (e == null ? void 0 : e.logger) == "string" && e.logger ? e.logger : BE.logger,
        name: no,
      }),
      { logger: n, chunkLoggerController: o } = V1({
        opts: s,
        maxSizeInBytes: e == null ? void 0 : e.maxLogBlobSizeInBytes,
        loggerOverride: e == null ? void 0 : e.logger,
      });
    ((this.logChunkController = o),
      (t = this.logChunkController) != null &&
        t.downloadLogsBlobInBrowser &&
        (window.downloadLogsBlobInBrowser = async () => {
          var a, c;
          (a = this.logChunkController) != null &&
            a.downloadLogsBlobInBrowser &&
            ((c = this.logChunkController) == null ||
              c.downloadLogsBlobInBrowser({ clientId: await this.crypto.getClientId() }));
        }),
      (this.logger = Be(n, this.name)),
      (this.heartbeat = new X0()),
      (this.crypto = new zI(this, this.logger, e == null ? void 0 : e.keychain)),
      (this.history = new X2(this, this.logger)),
      (this.expirer = new r$(this, this.logger)),
      (this.storage =
        e != null && e.storage ? e.storage : new P1(Sh(Sh({}, UE), e == null ? void 0 : e.storageOptions))),
      (this.relayer = new y2({ core: this, logger: this.logger, relayUrl: this.relayUrl, projectId: this.projectId })),
      (this.pairing = new J2(this, this.logger)),
      (this.verify = new n$(this, this.logger, this.storage)),
      (this.echoClient = new c$(this.projectId || "", this.logger)),
      (this.linkModeSupportedApps = []),
      (this.eventClient = new d$(this, this.logger, e == null ? void 0 : e.telemetryEnabled)),
      this.setGlobalCore(this));
  }
  static async init(e) {
    const t = new od(e);
    await t.initialize();
    const i = await t.crypto.getClientId();
    return (await t.storage.setItem(JE, i), t);
  }
  get context() {
    return ze(this.logger);
  }
  async start() {
    this.initialized || (await this.initialize());
  }
  async getLogsBlob() {
    var e;
    return (e = this.logChunkController) == null ? void 0 : e.logsToBlob({ clientId: await this.crypto.getClientId() });
  }
  async addLinkModeSupportedApp(e) {
    this.linkModeSupportedApps.includes(e) ||
      (this.linkModeSupportedApps.push(e), await this.storage.setItem(nh, this.linkModeSupportedApps));
  }
  async initialize() {
    this.logger.trace("Initialized");
    try {
      (await this.crypto.init(),
        await this.history.init(),
        await this.expirer.init(),
        await this.relayer.init(),
        await this.heartbeat.init(),
        await this.pairing.init(),
        (this.linkModeSupportedApps = (await this.storage.getItem(nh)) || []),
        (this.initialized = !0),
        this.logger.info("Core Initialization Success"));
    } catch (e) {
      throw (
        this.logger.warn(`Core Initialization Failure at epoch ${Date.now()}`, e),
        this.logger.error(e.message),
        e
      );
    }
  }
  getGlobalCore(e = "") {
    try {
      if (this.isGlobalCoreDisabled()) return;
      const t = `_walletConnectCore_${e}`,
        i = `${t}_count`;
      return (
        (globalThis[i] = (globalThis[i] || 0) + 1),
        globalThis[i] > 1 &&
          console.warn(
            `WalletConnect Core is already initialized. This is probably a mistake and can lead to unexpected behavior. Init() was called ${globalThis[i]} times.`,
          ),
        globalThis[t]
      );
    } catch (t) {
      console.warn("Failed to get global WalletConnect core", t);
      return;
    }
  }
  setGlobalCore(e) {
    var t;
    try {
      if (this.isGlobalCoreDisabled()) return;
      const i = `_walletConnectCore_${((t = e.opts) == null ? void 0 : t.customStoragePrefix) || ""}`;
      globalThis[i] = e;
    } catch (i) {
      console.warn("Failed to set global WalletConnect core", i);
    }
  }
  isGlobalCoreDisabled() {
    try {
      return typeof nt < "u" && jE.DISABLE_GLOBAL_CORE === "true";
    } catch {
      return !0;
    }
  }
};
const m$ = y$,
  ad = "wc",
  cd = 2,
  hd = "client",
  zo = `${ad}@${cd}:${hd}:`,
  An = { name: hd, logger: "error" },
  Oh = "WALLETCONNECT_DEEPLINK_CHOICE",
  w$ = "proposal",
  Ph = "Proposal expired",
  b$ = "session",
  Or = U.SEVEN_DAYS,
  v$ = "engine",
  ye = {
    wc_sessionPropose: {
      req: { ttl: U.FIVE_MINUTES, prompt: !0, tag: 1100 },
      res: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1101 },
      reject: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1120 },
      autoReject: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1121 },
    },
    wc_sessionSettle: {
      req: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1102 },
      res: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1103 },
    },
    wc_sessionUpdate: {
      req: { ttl: U.ONE_DAY, prompt: !1, tag: 1104 },
      res: { ttl: U.ONE_DAY, prompt: !1, tag: 1105 },
    },
    wc_sessionExtend: {
      req: { ttl: U.ONE_DAY, prompt: !1, tag: 1106 },
      res: { ttl: U.ONE_DAY, prompt: !1, tag: 1107 },
    },
    wc_sessionRequest: {
      req: { ttl: U.FIVE_MINUTES, prompt: !0, tag: 1108 },
      res: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1109 },
    },
    wc_sessionEvent: {
      req: { ttl: U.FIVE_MINUTES, prompt: !0, tag: 1110 },
      res: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1111 },
    },
    wc_sessionDelete: {
      req: { ttl: U.ONE_DAY, prompt: !1, tag: 1112 },
      res: { ttl: U.ONE_DAY, prompt: !1, tag: 1113 },
    },
    wc_sessionPing: { req: { ttl: U.ONE_DAY, prompt: !1, tag: 1114 }, res: { ttl: U.ONE_DAY, prompt: !1, tag: 1115 } },
    wc_sessionAuthenticate: {
      req: { ttl: U.ONE_HOUR, prompt: !0, tag: 1116 },
      res: { ttl: U.ONE_HOUR, prompt: !1, tag: 1117 },
      reject: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1118 },
      autoReject: { ttl: U.FIVE_MINUTES, prompt: !1, tag: 1119 },
    },
  },
  xn = { min: U.FIVE_MINUTES, max: U.SEVEN_DAYS },
  bt = { idle: "IDLE", active: "ACTIVE" },
  Ah = {
    eth_sendTransaction: { key: "" },
    eth_sendRawTransaction: { key: "" },
    wallet_sendCalls: { key: "" },
    solana_signTransaction: { key: "signature" },
    solana_signAllTransactions: { key: "transactions" },
    solana_signAndSendTransaction: { key: "signature" },
  },
  E$ = "request",
  _$ = ["wc_sessionPropose", "wc_sessionRequest", "wc_authRequest", "wc_sessionAuthenticate"],
  I$ = "wc",
  $$ = "auth",
  D$ = "authKeys",
  S$ = "pairingTopics",
  O$ = "requests",
  zs = `${I$}@${1.5}:${$$}:`,
  fs = `${zs}:PUB_KEY`;
var P$ = Object.defineProperty,
  A$ = Object.defineProperties,
  x$ = Object.getOwnPropertyDescriptors,
  xh = Object.getOwnPropertySymbols,
  C$ = Object.prototype.hasOwnProperty,
  T$ = Object.prototype.propertyIsEnumerable,
  mo = (r, e, t) => (e in r ? P$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  ne = (r, e) => {
    for (var t in e || (e = {})) C$.call(e, t) && mo(r, t, e[t]);
    if (xh) for (var t of xh(e)) T$.call(e, t) && mo(r, t, e[t]);
    return r;
  },
  Ne = (r, e) => A$(r, x$(e)),
  R = (r, e, t) => mo(r, typeof e != "symbol" ? e + "" : e, t);
class R$ extends lE {
  constructor(e) {
    (super(e),
      R(this, "name", v$),
      R(this, "events", new Io()),
      R(this, "initialized", !1),
      R(this, "requestQueue", { state: bt.idle, queue: [] }),
      R(this, "sessionRequestQueue", { state: bt.idle, queue: [] }),
      R(this, "requestQueueDelay", U.ONE_SECOND),
      R(this, "expectedPairingMethodMap", new Map()),
      R(this, "recentlyDeletedMap", new Map()),
      R(this, "recentlyDeletedLimit", 200),
      R(this, "relayMessageCache", []),
      R(this, "pendingSessions", new Map()),
      R(this, "init", async () => {
        this.initialized ||
          (await this.cleanup(),
          this.registerRelayerEvents(),
          this.registerExpirerEvents(),
          this.registerPairingEvents(),
          await this.registerLinkModeListeners(),
          this.client.core.pairing.register({ methods: Object.keys(ye) }),
          (this.initialized = !0),
          setTimeout(async () => {
            (await this.processPendingMessageEvents(),
              (this.sessionRequestQueue.queue = this.getPendingSessionRequests()),
              this.processSessionRequestQueue());
          }, U.toMiliseconds(this.requestQueueDelay)));
      }),
      R(this, "connect", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        const i = Ne(ne({}, t), {
          requiredNamespaces: t.requiredNamespaces || {},
          optionalNamespaces: t.optionalNamespaces || {},
        });
        (await this.isValidConnect(i),
          (i.optionalNamespaces = b0(i.requiredNamespaces, i.optionalNamespaces)),
          (i.requiredNamespaces = {}));
        const {
          pairingTopic: s,
          requiredNamespaces: n,
          optionalNamespaces: o,
          sessionProperties: a,
          scopedProperties: c,
          relays: h,
        } = i;
        let u = s,
          l,
          d = !1;
        try {
          if (u) {
            const v = this.client.core.pairing.pairings.get(u);
            (this.client.logger.warn(
              "connect() with existing pairing topic is deprecated and will be removed in the next major release.",
            ),
              (d = v.active));
          }
        } catch (v) {
          throw (this.client.logger.error(`connect() -> pairing.get(${u}) failed`), v);
        }
        if (!u || !d) {
          const { topic: v, uri: I } = await this.client.core.pairing.create();
          ((u = v), (l = I));
        }
        if (!u) {
          const { message: v } = F("NO_MATCHING_KEY", `connect() pairing topic: ${u}`);
          throw new Error(v);
        }
        const f = await this.client.core.crypto.generateKeyPair(),
          p = ye.wc_sessionPropose.req.ttl || U.FIVE_MINUTES,
          g = pe(p),
          w = Ne(
            ne(
              ne(
                {
                  requiredNamespaces: n,
                  optionalNamespaces: o,
                  relays: h ?? [{ protocol: Wl }],
                  proposer: { publicKey: f, metadata: this.client.metadata },
                  expiryTimestamp: g,
                  pairingTopic: u,
                },
                a && { sessionProperties: a },
              ),
              c && { scopedProperties: c },
            ),
            { id: Et() },
          ),
          E = ee("session_connect", w.id),
          { reject: b, resolve: _, done: A } = tr(p, Ph),
          T = ({ id: v }) => {
            v === w.id &&
              (this.client.events.off("proposal_expire", T),
              this.pendingSessions.delete(w.id),
              this.events.emit(E, { error: { message: Ph, code: 0 } }));
          };
        return (
          this.client.events.on("proposal_expire", T),
          this.events.once(E, ({ error: v, session: I }) => {
            (this.client.events.off("proposal_expire", T), v ? b(v) : I && _(I));
          }),
          await this.sendRequest({
            topic: u,
            method: "wc_sessionPropose",
            params: w,
            throwOnFailedPublish: !0,
            clientRpcId: w.id,
          }),
          await this.setProposal(w.id, w),
          { uri: l, approval: A }
        );
      }),
      R(this, "pair", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        try {
          return await this.client.core.pairing.pair(t);
        } catch (i) {
          throw (this.client.logger.error("pair() failed"), i);
        }
      }),
      R(this, "approve", async (t) => {
        var i, s, n;
        const o = this.client.core.eventClient.createEvent({
          properties: {
            topic: (i = t == null ? void 0 : t.id) == null ? void 0 : i.toString(),
            trace: [ut.session_approve_started],
          },
        });
        try {
          (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        } catch (D) {
          throw (o.setError(Xt.no_internet_connection), D);
        }
        try {
          await this.isValidProposalId(t == null ? void 0 : t.id);
        } catch (D) {
          throw (
            this.client.logger.error(`approve() -> proposal.get(${t == null ? void 0 : t.id}) failed`),
            o.setError(Xt.proposal_not_found),
            D
          );
        }
        try {
          await this.isValidApprove(t);
        } catch (D) {
          throw (
            this.client.logger.error("approve() -> isValidApprove() failed"),
            o.setError(Xt.session_approve_namespace_validation_failure),
            D
          );
        }
        const {
            id: a,
            relayProtocol: c,
            namespaces: h,
            sessionProperties: u,
            scopedProperties: l,
            sessionConfig: d,
          } = t,
          f = this.client.proposal.get(a);
        this.client.core.eventClient.deleteEvent({ eventId: o.eventId });
        const { pairingTopic: p, proposer: g, requiredNamespaces: w, optionalNamespaces: E } = f;
        let b = (s = this.client.core.eventClient) == null ? void 0 : s.getEvent({ topic: p });
        b ||
          (b =
            (n = this.client.core.eventClient) == null
              ? void 0
              : n.createEvent({
                  type: ut.session_approve_started,
                  properties: {
                    topic: p,
                    trace: [ut.session_approve_started, ut.session_namespaces_validation_success],
                  },
                }));
        const _ = await this.client.core.crypto.generateKeyPair(),
          A = g.publicKey,
          T = await this.client.core.crypto.generateSharedKey(_, A),
          v = ne(
            ne(
              ne(
                {
                  relay: { protocol: c ?? "irn" },
                  namespaces: h,
                  controller: { publicKey: _, metadata: this.client.metadata },
                  expiry: pe(Or),
                },
                u && { sessionProperties: u },
              ),
              l && { scopedProperties: l },
            ),
            d && { sessionConfig: d },
          ),
          I = ce.relay;
        b.addTrace(ut.subscribing_session_topic);
        try {
          await this.client.core.relayer.subscribe(T, { transportType: I });
        } catch (D) {
          throw (b.setError(Xt.subscribe_session_topic_failure), D);
        }
        b.addTrace(ut.subscribe_session_topic_success);
        const O = Ne(ne({}, v), {
          topic: T,
          requiredNamespaces: w,
          optionalNamespaces: E,
          pairingTopic: p,
          acknowledged: !1,
          self: v.controller,
          peer: { publicKey: g.publicKey, metadata: g.metadata },
          controller: _,
          transportType: ce.relay,
        });
        (await this.client.session.set(T, O), b.addTrace(ut.store_session));
        try {
          (b.addTrace(ut.publishing_session_settle),
            await this.sendRequest({ topic: T, method: "wc_sessionSettle", params: v, throwOnFailedPublish: !0 }).catch(
              (D) => {
                throw (b == null || b.setError(Xt.session_settle_publish_failure), D);
              },
            ),
            b.addTrace(ut.session_settle_publish_success),
            b.addTrace(ut.publishing_session_approve),
            await this.sendResult({
              id: a,
              topic: p,
              result: { relay: { protocol: c ?? "irn" }, responderPublicKey: _ },
              throwOnFailedPublish: !0,
            }).catch((D) => {
              throw (b == null || b.setError(Xt.session_approve_publish_failure), D);
            }),
            b.addTrace(ut.session_approve_publish_success));
        } catch (D) {
          throw (
            this.client.logger.error(D),
            this.client.session.delete(T, re("USER_DISCONNECTED")),
            await this.client.core.relayer.unsubscribe(T),
            D
          );
        }
        return (
          this.client.core.eventClient.deleteEvent({ eventId: b.eventId }),
          await this.client.core.pairing.updateMetadata({ topic: p, metadata: g.metadata }),
          await this.client.proposal.delete(a, re("USER_DISCONNECTED")),
          await this.client.core.pairing.activate({ topic: p }),
          await this.setExpiry(T, pe(Or)),
          { topic: T, acknowledged: () => Promise.resolve(this.client.session.get(T)) }
        );
      }),
      R(this, "reject", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        try {
          await this.isValidReject(t);
        } catch (o) {
          throw (this.client.logger.error("reject() -> isValidReject() failed"), o);
        }
        const { id: i, reason: s } = t;
        let n;
        try {
          n = this.client.proposal.get(i).pairingTopic;
        } catch (o) {
          throw (this.client.logger.error(`reject() -> proposal.get(${i}) failed`), o);
        }
        n &&
          (await this.sendError({ id: i, topic: n, error: s, rpcOpts: ye.wc_sessionPropose.reject }),
          await this.client.proposal.delete(i, re("USER_DISCONNECTED")));
      }),
      R(this, "update", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        try {
          await this.isValidUpdate(t);
        } catch (l) {
          throw (this.client.logger.error("update() -> isValidUpdate() failed"), l);
        }
        const { topic: i, namespaces: s } = t,
          { done: n, resolve: o, reject: a } = tr(),
          c = Et(),
          h = cr().toString(),
          u = this.client.session.get(i).namespaces;
        return (
          this.events.once(ee("session_update", c), ({ error: l }) => {
            l ? a(l) : o();
          }),
          await this.client.session.update(i, { namespaces: s }),
          await this.sendRequest({
            topic: i,
            method: "wc_sessionUpdate",
            params: { namespaces: s },
            throwOnFailedPublish: !0,
            clientRpcId: c,
            relayRpcId: h,
          }).catch((l) => {
            (this.client.logger.error(l), this.client.session.update(i, { namespaces: u }), a(l));
          }),
          { acknowledged: n }
        );
      }),
      R(this, "extend", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        try {
          await this.isValidExtend(t);
        } catch (c) {
          throw (this.client.logger.error("extend() -> isValidExtend() failed"), c);
        }
        const { topic: i } = t,
          s = Et(),
          { done: n, resolve: o, reject: a } = tr();
        return (
          this.events.once(ee("session_extend", s), ({ error: c }) => {
            c ? a(c) : o();
          }),
          await this.setExpiry(i, pe(Or)),
          this.sendRequest({
            topic: i,
            method: "wc_sessionExtend",
            params: {},
            clientRpcId: s,
            throwOnFailedPublish: !0,
          }).catch((c) => {
            a(c);
          }),
          { acknowledged: n }
        );
      }),
      R(this, "request", async (t) => {
        this.isInitialized();
        try {
          await this.isValidRequest(t);
        } catch (E) {
          throw (this.client.logger.error("request() -> isValidRequest() failed"), E);
        }
        const { chainId: i, request: s, topic: n, expiry: o = ye.wc_sessionRequest.req.ttl } = t,
          a = this.client.session.get(n);
        (a == null ? void 0 : a.transportType) === ce.relay && (await this.confirmOnlineStateOrThrow());
        const c = Et(),
          h = cr().toString(),
          { done: u, resolve: l, reject: d } = tr(o, "Request expired. Please try again.");
        this.events.once(ee("session_request", c), ({ error: E, result: b }) => {
          E ? d(E) : l(b);
        });
        const f = "wc_sessionRequest",
          p = this.getAppLinkIfEnabled(a.peer.metadata, a.transportType);
        if (p)
          return (
            await this.sendRequest({
              clientRpcId: c,
              relayRpcId: h,
              topic: n,
              method: f,
              params: { request: Ne(ne({}, s), { expiryTimestamp: pe(o) }), chainId: i },
              expiry: o,
              throwOnFailedPublish: !0,
              appLink: p,
            }).catch((E) => d(E)),
            this.client.events.emit("session_request_sent", { topic: n, request: s, chainId: i, id: c }),
            await u()
          );
        const g = { request: Ne(ne({}, s), { expiryTimestamp: pe(o) }), chainId: i },
          w = this.shouldSetTVF(f, g);
        return await Promise.all([
          new Promise(async (E) => {
            (await this.sendRequest(
              ne(
                { clientRpcId: c, relayRpcId: h, topic: n, method: f, params: g, expiry: o, throwOnFailedPublish: !0 },
                w && { tvf: this.getTVFParams(c, g) },
              ),
            ).catch((b) => d(b)),
              this.client.events.emit("session_request_sent", { topic: n, request: s, chainId: i, id: c }),
              E());
          }),
          new Promise(async (E) => {
            var b;
            if (!((b = a.sessionConfig) != null && b.disableDeepLink)) {
              const _ = await Tw(this.client.core.storage, Oh);
              await Aw({ id: c, topic: n, wcDeepLink: _ });
            }
            E();
          }),
          u(),
        ]).then((E) => E[2]);
      }),
      R(this, "respond", async (t) => {
        (this.isInitialized(), await this.isValidRespond(t));
        const { topic: i, response: s } = t,
          { id: n } = s,
          o = this.client.session.get(i);
        o.transportType === ce.relay && (await this.confirmOnlineStateOrThrow());
        const a = this.getAppLinkIfEnabled(o.peer.metadata, o.transportType);
        (_t(s)
          ? await this.sendResult({ id: n, topic: i, result: s.result, throwOnFailedPublish: !0, appLink: a })
          : it(s) && (await this.sendError({ id: n, topic: i, error: s.error, appLink: a })),
          this.cleanupAfterResponse(t));
      }),
      R(this, "ping", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow());
        try {
          await this.isValidPing(t);
        } catch (s) {
          throw (this.client.logger.error("ping() -> isValidPing() failed"), s);
        }
        const { topic: i } = t;
        if (this.client.session.keys.includes(i)) {
          const s = Et(),
            n = cr().toString(),
            { done: o, resolve: a, reject: c } = tr();
          (this.events.once(ee("session_ping", s), ({ error: h }) => {
            h ? c(h) : a();
          }),
            await Promise.all([
              this.sendRequest({
                topic: i,
                method: "wc_sessionPing",
                params: {},
                throwOnFailedPublish: !0,
                clientRpcId: s,
                relayRpcId: n,
              }),
              o(),
            ]));
        } else
          this.client.core.pairing.pairings.keys.includes(i) &&
            (this.client.logger.warn(
              "ping() on pairing topic is deprecated and will be removed in the next major release.",
            ),
            await this.client.core.pairing.ping({ topic: i }));
      }),
      R(this, "emit", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow(), await this.isValidEmit(t));
        const { topic: i, event: s, chainId: n } = t,
          o = cr().toString(),
          a = Et();
        await this.sendRequest({
          topic: i,
          method: "wc_sessionEvent",
          params: { event: s, chainId: n },
          throwOnFailedPublish: !0,
          relayRpcId: o,
          clientRpcId: a,
        });
      }),
      R(this, "disconnect", async (t) => {
        (this.isInitialized(), await this.confirmOnlineStateOrThrow(), await this.isValidDisconnect(t));
        const { topic: i } = t;
        if (this.client.session.keys.includes(i))
          (await this.sendRequest({
            topic: i,
            method: "wc_sessionDelete",
            params: re("USER_DISCONNECTED"),
            throwOnFailedPublish: !0,
          }),
            await this.deleteSession({ topic: i, emitEvent: !1 }));
        else if (this.client.core.pairing.pairings.keys.includes(i))
          await this.client.core.pairing.disconnect({ topic: i });
        else {
          const { message: s } = F("MISMATCHED_TOPIC", `Session or pairing topic not found: ${i}`);
          throw new Error(s);
        }
      }),
      R(this, "find", (t) => (this.isInitialized(), this.client.session.getAll().filter((i) => _0(i, t)))),
      R(this, "getPendingSessionRequests", () => this.client.pendingRequest.getAll()),
      R(this, "authenticate", async (t, i) => {
        var s;
        (this.isInitialized(), this.isValidAuthenticate(t));
        const n =
            i &&
            this.client.core.linkModeSupportedApps.includes(i) &&
            ((s = this.client.metadata.redirect) == null ? void 0 : s.linkMode),
          o = n ? ce.link_mode : ce.relay;
        o === ce.relay && (await this.confirmOnlineStateOrThrow());
        const {
            chains: a,
            statement: c = "",
            uri: h,
            domain: u,
            nonce: l,
            type: d,
            exp: f,
            nbf: p,
            methods: g = [],
            expiry: w,
          } = t,
          E = [...(t.resources || [])],
          { topic: b, uri: _ } = await this.client.core.pairing.create({
            methods: ["wc_sessionAuthenticate"],
            transportType: o,
          });
        this.client.logger.info({ message: "Generated new pairing", pairing: { topic: b, uri: _ } });
        const A = await this.client.core.crypto.generateKeyPair(),
          T = us(A);
        if (
          (await Promise.all([
            this.client.auth.authKeys.set(fs, { responseTopic: T, publicKey: A }),
            this.client.auth.pairingTopics.set(T, { topic: T, pairingTopic: b }),
          ]),
          await this.client.core.relayer.subscribe(T, { transportType: o }),
          this.client.logger.info(`sending request to new pairing topic: ${b}`),
          g.length > 0)
        ) {
          const { namespace: S } = Hr(a[0]);
          let C = $b(S, "request", g);
          (hs(E) && (C = Sb(C, E.pop())), E.push(C));
        }
        const v = w && w > ye.wc_sessionAuthenticate.req.ttl ? w : ye.wc_sessionAuthenticate.req.ttl,
          I = {
            authPayload: {
              type: d ?? "caip122",
              chains: a,
              statement: c,
              aud: h,
              domain: u,
              version: "1",
              nonce: l,
              iat: new Date().toISOString(),
              exp: f,
              nbf: p,
              resources: E,
            },
            requester: { publicKey: A, metadata: this.client.metadata },
            expiryTimestamp: pe(v),
          },
          O = {
            eip155: {
              chains: a,
              methods: [...new Set(["personal_sign", ...g])],
              events: ["chainChanged", "accountsChanged"],
            },
          },
          D = {
            requiredNamespaces: {},
            optionalNamespaces: O,
            relays: [{ protocol: "irn" }],
            pairingTopic: b,
            proposer: { publicKey: A, metadata: this.client.metadata },
            expiryTimestamp: pe(ye.wc_sessionPropose.req.ttl),
            id: Et(),
          },
          { done: j, resolve: N, reject: B } = tr(v, "Request expired"),
          M = Et(),
          P = ee("session_connect", D.id),
          y = ee("session_request", M),
          m = async ({ error: S, session: C }) => {
            (this.events.off(y, $), S ? B(S) : C && N({ session: C }));
          },
          $ = async (S) => {
            var C, k, q;
            if ((await this.deletePendingAuthRequest(M, { message: "fulfilled", code: 0 }), S.error)) {
              const J = re("WC_METHOD_UNSUPPORTED", "wc_sessionAuthenticate");
              return S.error.code === J.code ? void 0 : (this.events.off(P, m), B(S.error.message));
            }
            (await this.deleteProposal(D.id), this.events.off(P, m));
            const { cacaos: z, responder: L } = S.result,
              H = [],
              K = [];
            for (const J of z) {
              (await nc({ cacao: J, projectId: this.client.core.projectId })) ||
                (this.client.logger.error(J, "Signature verification failed"),
                B(re("SESSION_SETTLEMENT_FAILED", "Signature verification failed")));
              const { p: Ce } = J,
                Ie = hs(Ce.resources),
                Re = [Gn(Ce.iss)],
                Qe = bs(Ce.iss);
              if (Ie) {
                const Xe = oc(Ie),
                  vr = ac(Ie);
                (H.push(...Xe), Re.push(...vr));
              }
              for (const Xe of Re) K.push(`${Xe}:${Qe}`);
            }
            const oe = await this.client.core.crypto.generateSharedKey(A, L.publicKey);
            let te;
            (H.length > 0 &&
              ((te = {
                topic: oe,
                acknowledged: !0,
                self: { publicKey: A, metadata: this.client.metadata },
                peer: L,
                controller: L.publicKey,
                expiry: pe(Or),
                requiredNamespaces: {},
                optionalNamespaces: {},
                relay: { protocol: "irn" },
                pairingTopic: b,
                namespaces: Tc([...new Set(H)], [...new Set(K)]),
                transportType: o,
              }),
              await this.client.core.relayer.subscribe(oe, { transportType: o }),
              await this.client.session.set(oe, te),
              b && (await this.client.core.pairing.updateMetadata({ topic: b, metadata: L.metadata })),
              (te = this.client.session.get(oe))),
              (C = this.client.metadata.redirect) != null &&
                C.linkMode &&
                (k = L.metadata.redirect) != null &&
                k.linkMode &&
                (q = L.metadata.redirect) != null &&
                q.universal &&
                i &&
                (this.client.core.addLinkModeSupportedApp(L.metadata.redirect.universal),
                this.client.session.update(oe, { transportType: ce.link_mode })),
              N({ auths: z, session: te }));
          };
        (this.events.once(P, m), this.events.once(y, $));
        let x;
        try {
          if (n) {
            const S = Wt("wc_sessionAuthenticate", I, M);
            this.client.core.history.set(b, S);
            const C = await this.client.core.crypto.encode("", S, { type: qi, encoding: Vt });
            x = Qi(i, b, C);
          } else
            await Promise.all([
              this.sendRequest({
                topic: b,
                method: "wc_sessionAuthenticate",
                params: I,
                expiry: t.expiry,
                throwOnFailedPublish: !0,
                clientRpcId: M,
              }),
              this.sendRequest({
                topic: b,
                method: "wc_sessionPropose",
                params: D,
                expiry: ye.wc_sessionPropose.req.ttl,
                throwOnFailedPublish: !0,
                clientRpcId: D.id,
              }),
            ]);
        } catch (S) {
          throw (this.events.off(P, m), this.events.off(y, $), S);
        }
        return (
          await this.setProposal(D.id, D),
          await this.setAuthRequest(M, {
            request: Ne(ne({}, I), { verifyContext: {} }),
            pairingTopic: b,
            transportType: o,
          }),
          { uri: x ?? _, response: j }
        );
      }),
      R(this, "approveSessionAuthenticate", async (t) => {
        const { id: i, auths: s } = t,
          n = this.client.core.eventClient.createEvent({
            properties: { topic: i.toString(), trace: [er.authenticated_session_approve_started] },
          });
        try {
          this.isInitialized();
        } catch (w) {
          throw (n.setError(fi.no_internet_connection), w);
        }
        const o = this.getPendingAuthRequest(i);
        if (!o)
          throw (
            n.setError(fi.authenticated_session_pending_request_not_found),
            new Error(`Could not find pending auth request with id ${i}`)
          );
        const a = o.transportType || ce.relay;
        a === ce.relay && (await this.confirmOnlineStateOrThrow());
        const c = o.requester.publicKey,
          h = await this.client.core.crypto.generateKeyPair(),
          u = us(c),
          l = { type: Ut, receiverPublicKey: c, senderPublicKey: h },
          d = [],
          f = [];
        for (const w of s) {
          if (!(await nc({ cacao: w, projectId: this.client.core.projectId }))) {
            n.setError(fi.invalid_cacao);
            const T = re("SESSION_SETTLEMENT_FAILED", "Signature verification failed");
            throw (await this.sendError({ id: i, topic: u, error: T, encodeOpts: l }), new Error(T.message));
          }
          n.addTrace(er.cacaos_verified);
          const { p: E } = w,
            b = hs(E.resources),
            _ = [Gn(E.iss)],
            A = bs(E.iss);
          if (b) {
            const T = oc(b),
              v = ac(b);
            (d.push(...T), _.push(...v));
          }
          for (const T of _) f.push(`${T}:${A}`);
        }
        const p = await this.client.core.crypto.generateSharedKey(h, c);
        n.addTrace(er.create_authenticated_session_topic);
        let g;
        if ((d == null ? void 0 : d.length) > 0) {
          ((g = {
            topic: p,
            acknowledged: !0,
            self: { publicKey: h, metadata: this.client.metadata },
            peer: { publicKey: c, metadata: o.requester.metadata },
            controller: c,
            expiry: pe(Or),
            authentication: s,
            requiredNamespaces: {},
            optionalNamespaces: {},
            relay: { protocol: "irn" },
            pairingTopic: o.pairingTopic,
            namespaces: Tc([...new Set(d)], [...new Set(f)]),
            transportType: a,
          }),
            n.addTrace(er.subscribing_authenticated_session_topic));
          try {
            await this.client.core.relayer.subscribe(p, { transportType: a });
          } catch (w) {
            throw (n.setError(fi.subscribe_authenticated_session_topic_failure), w);
          }
          (n.addTrace(er.subscribe_authenticated_session_topic_success),
            await this.client.session.set(p, g),
            n.addTrace(er.store_authenticated_session),
            await this.client.core.pairing.updateMetadata({ topic: o.pairingTopic, metadata: o.requester.metadata }));
        }
        n.addTrace(er.publishing_authenticated_session_approve);
        try {
          await this.sendResult({
            topic: u,
            id: i,
            result: { cacaos: s, responder: { publicKey: h, metadata: this.client.metadata } },
            encodeOpts: l,
            throwOnFailedPublish: !0,
            appLink: this.getAppLinkIfEnabled(o.requester.metadata, a),
          });
        } catch (w) {
          throw (n.setError(fi.authenticated_session_approve_publish_failure), w);
        }
        return (
          await this.client.auth.requests.delete(i, { message: "fulfilled", code: 0 }),
          await this.client.core.pairing.activate({ topic: o.pairingTopic }),
          this.client.core.eventClient.deleteEvent({ eventId: n.eventId }),
          { session: g }
        );
      }),
      R(this, "rejectSessionAuthenticate", async (t) => {
        this.isInitialized();
        const { id: i, reason: s } = t,
          n = this.getPendingAuthRequest(i);
        if (!n) throw new Error(`Could not find pending auth request with id ${i}`);
        n.transportType === ce.relay && (await this.confirmOnlineStateOrThrow());
        const o = n.requester.publicKey,
          a = await this.client.core.crypto.generateKeyPair(),
          c = us(o),
          h = { type: Ut, receiverPublicKey: o, senderPublicKey: a };
        (await this.sendError({
          id: i,
          topic: c,
          error: s,
          encodeOpts: h,
          rpcOpts: ye.wc_sessionAuthenticate.reject,
          appLink: this.getAppLinkIfEnabled(n.requester.metadata, n.transportType),
        }),
          await this.client.auth.requests.delete(i, { message: "rejected", code: 0 }),
          await this.client.proposal.delete(i, re("USER_DISCONNECTED")));
      }),
      R(this, "formatAuthMessage", (t) => {
        this.isInitialized();
        const { request: i, iss: s } = t;
        return ll(i, s);
      }),
      R(this, "processRelayMessageCache", () => {
        setTimeout(async () => {
          if (this.relayMessageCache.length !== 0)
            for (; this.relayMessageCache.length > 0; )
              try {
                const t = this.relayMessageCache.shift();
                t && (await this.onRelayMessage(t));
              } catch (t) {
                this.client.logger.error(t);
              }
        }, 50);
      }),
      R(this, "cleanupDuplicatePairings", async (t) => {
        if (t.pairingTopic)
          try {
            const i = this.client.core.pairing.pairings.get(t.pairingTopic),
              s = this.client.core.pairing.pairings.getAll().filter((n) => {
                var o, a;
                return (
                  ((o = n.peerMetadata) == null ? void 0 : o.url) &&
                  ((a = n.peerMetadata) == null ? void 0 : a.url) === t.peer.metadata.url &&
                  n.topic &&
                  n.topic !== i.topic
                );
              });
            if (s.length === 0) return;
            (this.client.logger.info(`Cleaning up ${s.length} duplicate pairing(s)`),
              await Promise.all(s.map((n) => this.client.core.pairing.disconnect({ topic: n.topic }))),
              this.client.logger.info("Duplicate pairings clean up finished"));
          } catch (i) {
            this.client.logger.error(i);
          }
      }),
      R(this, "deleteSession", async (t) => {
        var i;
        const { topic: s, expirerHasDeleted: n = !1, emitEvent: o = !0, id: a = 0 } = t,
          { self: c } = this.client.session.get(s);
        (await this.client.core.relayer.unsubscribe(s),
          await this.client.session.delete(s, re("USER_DISCONNECTED")),
          this.addToRecentlyDeleted(s, "session"),
          this.client.core.crypto.keychain.has(c.publicKey) &&
            (await this.client.core.crypto.deleteKeyPair(c.publicKey)),
          this.client.core.crypto.keychain.has(s) && (await this.client.core.crypto.deleteSymKey(s)),
          n || this.client.core.expirer.del(s),
          this.client.core.storage.removeItem(Oh).catch((h) => this.client.logger.warn(h)),
          this.getPendingSessionRequests().forEach((h) => {
            h.topic === s && this.deletePendingSessionRequest(h.id, re("USER_DISCONNECTED"));
          }),
          s === ((i = this.sessionRequestQueue.queue[0]) == null ? void 0 : i.topic) &&
            (this.sessionRequestQueue.state = bt.idle),
          o && this.client.events.emit("session_delete", { id: a, topic: s }));
      }),
      R(this, "deleteProposal", async (t, i) => {
        if (i)
          try {
            const s = this.client.proposal.get(t),
              n = this.client.core.eventClient.getEvent({ topic: s.pairingTopic });
            n == null || n.setError(Xt.proposal_expired);
          } catch {}
        (await Promise.all([
          this.client.proposal.delete(t, re("USER_DISCONNECTED")),
          i ? Promise.resolve() : this.client.core.expirer.del(t),
        ]),
          this.addToRecentlyDeleted(t, "proposal"));
      }),
      R(this, "deletePendingSessionRequest", async (t, i, s = !1) => {
        (await Promise.all([
          this.client.pendingRequest.delete(t, i),
          s ? Promise.resolve() : this.client.core.expirer.del(t),
        ]),
          this.addToRecentlyDeleted(t, "request"),
          (this.sessionRequestQueue.queue = this.sessionRequestQueue.queue.filter((n) => n.id !== t)),
          s &&
            ((this.sessionRequestQueue.state = bt.idle), this.client.events.emit("session_request_expire", { id: t })));
      }),
      R(this, "deletePendingAuthRequest", async (t, i, s = !1) => {
        await Promise.all([
          this.client.auth.requests.delete(t, i),
          s ? Promise.resolve() : this.client.core.expirer.del(t),
        ]);
      }),
      R(this, "setExpiry", async (t, i) => {
        this.client.session.keys.includes(t) &&
          (this.client.core.expirer.set(t, i), await this.client.session.update(t, { expiry: i }));
      }),
      R(this, "setProposal", async (t, i) => {
        (this.client.core.expirer.set(t, pe(ye.wc_sessionPropose.req.ttl)), await this.client.proposal.set(t, i));
      }),
      R(this, "setAuthRequest", async (t, i) => {
        const { request: s, pairingTopic: n, transportType: o = ce.relay } = i;
        (this.client.core.expirer.set(t, s.expiryTimestamp),
          await this.client.auth.requests.set(t, {
            authPayload: s.authPayload,
            requester: s.requester,
            expiryTimestamp: s.expiryTimestamp,
            id: t,
            pairingTopic: n,
            verifyContext: s.verifyContext,
            transportType: o,
          }));
      }),
      R(this, "setPendingSessionRequest", async (t) => {
        const { id: i, topic: s, params: n, verifyContext: o } = t,
          a = n.request.expiryTimestamp || pe(ye.wc_sessionRequest.req.ttl);
        (this.client.core.expirer.set(i, a),
          await this.client.pendingRequest.set(i, { id: i, topic: s, params: n, verifyContext: o }));
      }),
      R(this, "sendRequest", async (t) => {
        const {
            topic: i,
            method: s,
            params: n,
            expiry: o,
            relayRpcId: a,
            clientRpcId: c,
            throwOnFailedPublish: h,
            appLink: u,
            tvf: l,
          } = t,
          d = Wt(s, n, c);
        let f;
        const p = !!u;
        try {
          const E = p ? Vt : pt;
          f = await this.client.core.crypto.encode(i, d, { encoding: E });
        } catch (E) {
          throw (
            await this.cleanup(),
            this.client.logger.error(`sendRequest() -> core.crypto.encode() for topic ${i} failed`),
            E
          );
        }
        let g;
        if (_$.includes(s)) {
          const E = $t(JSON.stringify(d)),
            b = $t(f);
          g = await this.client.core.verify.register({ id: b, decryptedId: E });
        }
        const w = ye[s].req;
        if (((w.attestation = g), o && (w.ttl = o), a && (w.id = a), this.client.core.history.set(i, d), p)) {
          const E = Qi(u, i, f);
          await V.Linking.openURL(E, this.client.name);
        } else {
          const E = ye[s].req;
          (o && (E.ttl = o),
            a && (E.id = a),
            (E.tvf = Ne(ne({}, l), { correlationId: d.id })),
            h
              ? ((E.internal = Ne(ne({}, E.internal), { throwOnFailedPublish: !0 })),
                await this.client.core.relayer.publish(i, f, E))
              : this.client.core.relayer.publish(i, f, E).catch((b) => this.client.logger.error(b)));
        }
        return d.id;
      }),
      R(this, "sendResult", async (t) => {
        const { id: i, topic: s, result: n, throwOnFailedPublish: o, encodeOpts: a, appLink: c } = t,
          h = ks(i, n);
        let u;
        const l = c && typeof (V == null ? void 0 : V.Linking) < "u";
        try {
          const p = l ? Vt : pt;
          u = await this.client.core.crypto.encode(s, h, Ne(ne({}, a || {}), { encoding: p }));
        } catch (p) {
          throw (
            await this.cleanup(),
            this.client.logger.error(`sendResult() -> core.crypto.encode() for topic ${s} failed`),
            p
          );
        }
        let d, f;
        try {
          d = await this.client.core.history.get(s, i);
          const p = d.request;
          try {
            this.shouldSetTVF(p.method, p.params) && (f = this.getTVFParams(i, p.params, n));
          } catch (g) {
            this.client.logger.warn("sendResult() -> getTVFParams() failed", g);
          }
        } catch (p) {
          throw (this.client.logger.error(`sendResult() -> history.get(${s}, ${i}) failed`), p);
        }
        if (l) {
          const p = Qi(c, s, u);
          await V.Linking.openURL(p, this.client.name);
        } else {
          const p = d.request.method,
            g = ye[p].res;
          ((g.tvf = Ne(ne({}, f), { correlationId: i })),
            o
              ? ((g.internal = Ne(ne({}, g.internal), { throwOnFailedPublish: !0 })),
                await this.client.core.relayer.publish(s, u, g))
              : this.client.core.relayer.publish(s, u, g).catch((w) => this.client.logger.error(w)));
        }
        await this.client.core.history.resolve(h);
      }),
      R(this, "sendError", async (t) => {
        const { id: i, topic: s, error: n, encodeOpts: o, rpcOpts: a, appLink: c } = t,
          h = Ls(i, n);
        let u;
        const l = c && typeof (V == null ? void 0 : V.Linking) < "u";
        try {
          const f = l ? Vt : pt;
          u = await this.client.core.crypto.encode(s, h, Ne(ne({}, o || {}), { encoding: f }));
        } catch (f) {
          throw (
            await this.cleanup(),
            this.client.logger.error(`sendError() -> core.crypto.encode() for topic ${s} failed`),
            f
          );
        }
        let d;
        try {
          d = await this.client.core.history.get(s, i);
        } catch (f) {
          throw (this.client.logger.error(`sendError() -> history.get(${s}, ${i}) failed`), f);
        }
        if (l) {
          const f = Qi(c, s, u);
          await V.Linking.openURL(f, this.client.name);
        } else {
          const f = d.request.method,
            p = a || ye[f].res;
          this.client.core.relayer.publish(s, u, p);
        }
        await this.client.core.history.resolve(h);
      }),
      R(this, "cleanup", async () => {
        const t = [],
          i = [];
        (this.client.session.getAll().forEach((s) => {
          let n = !1;
          (Ht(s.expiry) && (n = !0), this.client.core.crypto.keychain.has(s.topic) || (n = !0), n && t.push(s.topic));
        }),
          this.client.proposal.getAll().forEach((s) => {
            Ht(s.expiryTimestamp) && i.push(s.id);
          }),
          await Promise.all([
            ...t.map((s) => this.deleteSession({ topic: s })),
            ...i.map((s) => this.deleteProposal(s)),
          ]));
      }),
      R(this, "onProviderMessageEvent", async (t) => {
        !this.initialized || this.relayMessageCache.length > 0
          ? this.relayMessageCache.push(t)
          : await this.onRelayMessage(t);
      }),
      R(this, "onRelayEventRequest", async (t) => {
        (this.requestQueue.queue.push(t), await this.processRequestsQueue());
      }),
      R(this, "processRequestsQueue", async () => {
        if (this.requestQueue.state === bt.active) {
          this.client.logger.info("Request queue already active, skipping...");
          return;
        }
        for (
          this.client.logger.info(`Request queue starting with ${this.requestQueue.queue.length} requests`);
          this.requestQueue.queue.length > 0;

        ) {
          this.requestQueue.state = bt.active;
          const t = this.requestQueue.queue.shift();
          if (t)
            try {
              await this.processRequest(t);
            } catch (i) {
              this.client.logger.warn(i);
            }
        }
        this.requestQueue.state = bt.idle;
      }),
      R(this, "processRequest", async (t) => {
        const { topic: i, payload: s, attestation: n, transportType: o, encryptedId: a } = t,
          c = s.method;
        if (!this.shouldIgnorePairingRequest({ topic: i, requestMethod: c }))
          switch (c) {
            case "wc_sessionPropose":
              return await this.onSessionProposeRequest({ topic: i, payload: s, attestation: n, encryptedId: a });
            case "wc_sessionSettle":
              return await this.onSessionSettleRequest(i, s);
            case "wc_sessionUpdate":
              return await this.onSessionUpdateRequest(i, s);
            case "wc_sessionExtend":
              return await this.onSessionExtendRequest(i, s);
            case "wc_sessionPing":
              return await this.onSessionPingRequest(i, s);
            case "wc_sessionDelete":
              return await this.onSessionDeleteRequest(i, s);
            case "wc_sessionRequest":
              return await this.onSessionRequest({
                topic: i,
                payload: s,
                attestation: n,
                encryptedId: a,
                transportType: o,
              });
            case "wc_sessionEvent":
              return await this.onSessionEventRequest(i, s);
            case "wc_sessionAuthenticate":
              return await this.onSessionAuthenticateRequest({
                topic: i,
                payload: s,
                attestation: n,
                encryptedId: a,
                transportType: o,
              });
            default:
              return this.client.logger.info(`Unsupported request method ${c}`);
          }
      }),
      R(this, "onRelayEventResponse", async (t) => {
        const { topic: i, payload: s, transportType: n } = t,
          o = (await this.client.core.history.get(i, s.id)).request.method;
        switch (o) {
          case "wc_sessionPropose":
            return this.onSessionProposeResponse(i, s, n);
          case "wc_sessionSettle":
            return this.onSessionSettleResponse(i, s);
          case "wc_sessionUpdate":
            return this.onSessionUpdateResponse(i, s);
          case "wc_sessionExtend":
            return this.onSessionExtendResponse(i, s);
          case "wc_sessionPing":
            return this.onSessionPingResponse(i, s);
          case "wc_sessionRequest":
            return this.onSessionRequestResponse(i, s);
          case "wc_sessionAuthenticate":
            return this.onSessionAuthenticateResponse(i, s);
          default:
            return this.client.logger.info(`Unsupported response method ${o}`);
        }
      }),
      R(this, "onRelayEventUnknownPayload", (t) => {
        const { topic: i } = t,
          { message: s } = F(
            "MISSING_OR_INVALID",
            `Decoded payload on topic ${i} is not identifiable as a JSON-RPC request or a response.`,
          );
        throw new Error(s);
      }),
      R(this, "shouldIgnorePairingRequest", (t) => {
        const { topic: i, requestMethod: s } = t,
          n = this.expectedPairingMethodMap.get(i);
        return !n || n.includes(s)
          ? !1
          : !!(n.includes("wc_sessionAuthenticate") && this.client.events.listenerCount("session_authenticate") > 0);
      }),
      R(this, "onSessionProposeRequest", async (t) => {
        const { topic: i, payload: s, attestation: n, encryptedId: o } = t,
          { params: a, id: c } = s;
        try {
          const h = this.client.core.eventClient.getEvent({ topic: i });
          (this.client.events.listenerCount("session_proposal") === 0 &&
            (console.warn("No listener for session_proposal event"),
            h == null || h.setError(Rt.proposal_listener_not_found)),
            this.isValidConnect(ne({}, s.params)));
          const u = a.expiryTimestamp || pe(ye.wc_sessionPropose.req.ttl),
            l = ne({ id: c, pairingTopic: i, expiryTimestamp: u }, a);
          await this.setProposal(c, l);
          const d = await this.getVerifyContext({
            attestationId: n,
            hash: $t(JSON.stringify(s)),
            encryptedId: o,
            metadata: l.proposer.metadata,
          });
          (h == null || h.addTrace(vt.emit_session_proposal),
            this.client.events.emit("session_proposal", { id: c, params: l, verifyContext: d }));
        } catch (h) {
          (await this.sendError({ id: c, topic: i, error: h, rpcOpts: ye.wc_sessionPropose.autoReject }),
            this.client.logger.error(h));
        }
      }),
      R(this, "onSessionProposeResponse", async (t, i, s) => {
        const { id: n } = i;
        if (_t(i)) {
          const { result: o } = i;
          this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", result: o });
          const a = this.client.proposal.get(n);
          this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", proposal: a });
          const c = a.proposer.publicKey;
          this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", selfPublicKey: c });
          const h = o.responderPublicKey;
          this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", peerPublicKey: h });
          const u = await this.client.core.crypto.generateSharedKey(c, h);
          this.pendingSessions.set(n, { sessionTopic: u, pairingTopic: t, proposalId: n, publicKey: c });
          const l = await this.client.core.relayer.subscribe(u, { transportType: s });
          (this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", subscriptionId: l }),
            await this.client.core.pairing.activate({ topic: t }));
        } else if (it(i)) {
          await this.client.proposal.delete(n, re("USER_DISCONNECTED"));
          const o = ee("session_connect", n);
          if (this.events.listenerCount(o) === 0) throw new Error(`emitting ${o} without any listeners, 954`);
          this.events.emit(o, { error: i.error });
        }
      }),
      R(this, "onSessionSettleRequest", async (t, i) => {
        const { id: s, params: n } = i;
        try {
          this.isValidSessionSettleRequest(n);
          const {
              relay: o,
              controller: a,
              expiry: c,
              namespaces: h,
              sessionProperties: u,
              scopedProperties: l,
              sessionConfig: d,
            } = i.params,
            f = [...this.pendingSessions.values()].find((w) => w.sessionTopic === t);
          if (!f) return this.client.logger.error(`Pending session not found for topic ${t}`);
          const p = this.client.proposal.get(f.proposalId),
            g = Ne(
              ne(
                ne(
                  ne(
                    {
                      topic: t,
                      relay: o,
                      expiry: c,
                      namespaces: h,
                      acknowledged: !0,
                      pairingTopic: f.pairingTopic,
                      requiredNamespaces: p.requiredNamespaces,
                      optionalNamespaces: p.optionalNamespaces,
                      controller: a.publicKey,
                      self: { publicKey: f.publicKey, metadata: this.client.metadata },
                      peer: { publicKey: a.publicKey, metadata: a.metadata },
                    },
                    u && { sessionProperties: u },
                  ),
                  l && { scopedProperties: l },
                ),
                d && { sessionConfig: d },
              ),
              { transportType: ce.relay },
            );
          (await this.client.session.set(g.topic, g),
            await this.setExpiry(g.topic, g.expiry),
            await this.client.core.pairing.updateMetadata({ topic: f.pairingTopic, metadata: g.peer.metadata }),
            this.client.events.emit("session_connect", { session: g }),
            this.events.emit(ee("session_connect", f.proposalId), { session: g }),
            this.pendingSessions.delete(f.proposalId),
            this.deleteProposal(f.proposalId, !1),
            this.cleanupDuplicatePairings(g),
            await this.sendResult({ id: i.id, topic: t, result: !0, throwOnFailedPublish: !0 }));
        } catch (o) {
          (await this.sendError({ id: s, topic: t, error: o }), this.client.logger.error(o));
        }
      }),
      R(this, "onSessionSettleResponse", async (t, i) => {
        const { id: s } = i;
        _t(i)
          ? (await this.client.session.update(t, { acknowledged: !0 }), this.events.emit(ee("session_approve", s), {}))
          : it(i) &&
            (await this.client.session.delete(t, re("USER_DISCONNECTED")),
            this.events.emit(ee("session_approve", s), { error: i.error }));
      }),
      R(this, "onSessionUpdateRequest", async (t, i) => {
        const { params: s, id: n } = i;
        try {
          const o = `${t}_session_update`,
            a = di.get(o);
          if (a && this.isRequestOutOfSync(a, n)) {
            (this.client.logger.warn(`Discarding out of sync request - ${n}`),
              this.sendError({ id: n, topic: t, error: re("INVALID_UPDATE_REQUEST") }));
            return;
          }
          this.isValidUpdate(ne({ topic: t }, s));
          try {
            (di.set(o, n),
              await this.client.session.update(t, { namespaces: s.namespaces }),
              await this.sendResult({ id: n, topic: t, result: !0, throwOnFailedPublish: !0 }));
          } catch (c) {
            throw (di.delete(o), c);
          }
          this.client.events.emit("session_update", { id: n, topic: t, params: s });
        } catch (o) {
          (await this.sendError({ id: n, topic: t, error: o }), this.client.logger.error(o));
        }
      }),
      R(this, "isRequestOutOfSync", (t, i) => i.toString().slice(0, -3) < t.toString().slice(0, -3)),
      R(this, "onSessionUpdateResponse", (t, i) => {
        const { id: s } = i,
          n = ee("session_update", s);
        if (this.events.listenerCount(n) === 0) throw new Error(`emitting ${n} without any listeners`);
        _t(i)
          ? this.events.emit(ee("session_update", s), {})
          : it(i) && this.events.emit(ee("session_update", s), { error: i.error });
      }),
      R(this, "onSessionExtendRequest", async (t, i) => {
        const { id: s } = i;
        try {
          (this.isValidExtend({ topic: t }),
            await this.setExpiry(t, pe(Or)),
            await this.sendResult({ id: s, topic: t, result: !0, throwOnFailedPublish: !0 }),
            this.client.events.emit("session_extend", { id: s, topic: t }));
        } catch (n) {
          (await this.sendError({ id: s, topic: t, error: n }), this.client.logger.error(n));
        }
      }),
      R(this, "onSessionExtendResponse", (t, i) => {
        const { id: s } = i,
          n = ee("session_extend", s);
        if (this.events.listenerCount(n) === 0) throw new Error(`emitting ${n} without any listeners`);
        _t(i)
          ? this.events.emit(ee("session_extend", s), {})
          : it(i) && this.events.emit(ee("session_extend", s), { error: i.error });
      }),
      R(this, "onSessionPingRequest", async (t, i) => {
        const { id: s } = i;
        try {
          (this.isValidPing({ topic: t }),
            await this.sendResult({ id: s, topic: t, result: !0, throwOnFailedPublish: !0 }),
            this.client.events.emit("session_ping", { id: s, topic: t }));
        } catch (n) {
          (await this.sendError({ id: s, topic: t, error: n }), this.client.logger.error(n));
        }
      }),
      R(this, "onSessionPingResponse", (t, i) => {
        const { id: s } = i,
          n = ee("session_ping", s);
        setTimeout(() => {
          if (this.events.listenerCount(n) === 0) throw new Error(`emitting ${n} without any listeners 2176`);
          _t(i)
            ? this.events.emit(ee("session_ping", s), {})
            : it(i) && this.events.emit(ee("session_ping", s), { error: i.error });
        }, 500);
      }),
      R(this, "onSessionDeleteRequest", async (t, i) => {
        const { id: s } = i;
        try {
          (this.isValidDisconnect({ topic: t, reason: i.params }),
            Promise.all([
              new Promise((n) => {
                this.client.core.relayer.once(be.publish, async () => {
                  n(await this.deleteSession({ topic: t, id: s }));
                });
              }),
              this.sendResult({ id: s, topic: t, result: !0, throwOnFailedPublish: !0 }),
              this.cleanupPendingSentRequestsForTopic({ topic: t, error: re("USER_DISCONNECTED") }),
            ]).catch((n) => this.client.logger.error(n)));
        } catch (n) {
          this.client.logger.error(n);
        }
      }),
      R(this, "onSessionRequest", async (t) => {
        var i, s, n;
        const { topic: o, payload: a, attestation: c, encryptedId: h, transportType: u } = t,
          { id: l, params: d } = a;
        try {
          await this.isValidRequest(ne({ topic: o }, d));
          const f = this.client.session.get(o),
            p = await this.getVerifyContext({
              attestationId: c,
              hash: $t(JSON.stringify(Wt("wc_sessionRequest", d, l))),
              encryptedId: h,
              metadata: f.peer.metadata,
              transportType: u,
            }),
            g = { id: l, topic: o, params: d, verifyContext: p };
          (await this.setPendingSessionRequest(g),
            u === ce.link_mode &&
              (i = f.peer.metadata.redirect) != null &&
              i.universal &&
              this.client.core.addLinkModeSupportedApp((s = f.peer.metadata.redirect) == null ? void 0 : s.universal),
            (n = this.client.signConfig) != null && n.disableRequestQueue
              ? this.emitSessionRequest(g)
              : (this.addSessionRequestToSessionRequestQueue(g), this.processSessionRequestQueue()));
        } catch (f) {
          (await this.sendError({ id: l, topic: o, error: f }), this.client.logger.error(f));
        }
      }),
      R(this, "onSessionRequestResponse", (t, i) => {
        const { id: s } = i,
          n = ee("session_request", s);
        if (this.events.listenerCount(n) === 0) throw new Error(`emitting ${n} without any listeners`);
        _t(i)
          ? this.events.emit(ee("session_request", s), { result: i.result })
          : it(i) && this.events.emit(ee("session_request", s), { error: i.error });
      }),
      R(this, "onSessionEventRequest", async (t, i) => {
        const { id: s, params: n } = i;
        try {
          const o = `${t}_session_event_${n.event.name}`,
            a = di.get(o);
          if (a && this.isRequestOutOfSync(a, s)) {
            this.client.logger.info(`Discarding out of sync request - ${s}`);
            return;
          }
          (this.isValidEmit(ne({ topic: t }, n)),
            this.client.events.emit("session_event", { id: s, topic: t, params: n }),
            di.set(o, s));
        } catch (o) {
          (await this.sendError({ id: s, topic: t, error: o }), this.client.logger.error(o));
        }
      }),
      R(this, "onSessionAuthenticateResponse", (t, i) => {
        const { id: s } = i;
        (this.client.logger.trace({ type: "method", method: "onSessionAuthenticateResponse", topic: t, payload: i }),
          _t(i)
            ? this.events.emit(ee("session_request", s), { result: i.result })
            : it(i) && this.events.emit(ee("session_request", s), { error: i.error }));
      }),
      R(this, "onSessionAuthenticateRequest", async (t) => {
        var i;
        const { topic: s, payload: n, attestation: o, encryptedId: a, transportType: c } = t;
        try {
          const { requester: h, authPayload: u, expiryTimestamp: l } = n.params,
            d = await this.getVerifyContext({
              attestationId: o,
              hash: $t(JSON.stringify(n)),
              encryptedId: a,
              metadata: h.metadata,
              transportType: c,
            }),
            f = { requester: h, pairingTopic: s, id: n.id, authPayload: u, verifyContext: d, expiryTimestamp: l };
          (await this.setAuthRequest(n.id, { request: f, pairingTopic: s, transportType: c }),
            c === ce.link_mode &&
              (i = h.metadata.redirect) != null &&
              i.universal &&
              this.client.core.addLinkModeSupportedApp(h.metadata.redirect.universal),
            this.client.events.emit("session_authenticate", {
              topic: s,
              params: n.params,
              id: n.id,
              verifyContext: d,
            }));
        } catch (h) {
          this.client.logger.error(h);
          const u = n.params.requester.publicKey,
            l = await this.client.core.crypto.generateKeyPair(),
            d = this.getAppLinkIfEnabled(n.params.requester.metadata, c),
            f = { type: Ut, receiverPublicKey: u, senderPublicKey: l };
          await this.sendError({
            id: n.id,
            topic: s,
            error: h,
            encodeOpts: f,
            rpcOpts: ye.wc_sessionAuthenticate.autoReject,
            appLink: d,
          });
        }
      }),
      R(this, "addSessionRequestToSessionRequestQueue", (t) => {
        this.sessionRequestQueue.queue.push(t);
      }),
      R(this, "cleanupAfterResponse", (t) => {
        (this.deletePendingSessionRequest(t.response.id, { message: "fulfilled", code: 0 }),
          setTimeout(() => {
            ((this.sessionRequestQueue.state = bt.idle), this.processSessionRequestQueue());
          }, U.toMiliseconds(this.requestQueueDelay)));
      }),
      R(this, "cleanupPendingSentRequestsForTopic", ({ topic: t, error: i }) => {
        const s = this.client.core.history.pending;
        s.length > 0 &&
          s
            .filter((n) => n.topic === t && n.request.method === "wc_sessionRequest")
            .forEach((n) => {
              const o = n.request.id,
                a = ee("session_request", o);
              if (this.events.listenerCount(a) === 0) throw new Error(`emitting ${a} without any listeners`);
              this.events.emit(ee("session_request", n.request.id), { error: i });
            });
      }),
      R(this, "processSessionRequestQueue", () => {
        if (this.sessionRequestQueue.state === bt.active) {
          this.client.logger.info("session request queue is already active.");
          return;
        }
        const t = this.sessionRequestQueue.queue[0];
        if (!t) {
          this.client.logger.info("session request queue is empty.");
          return;
        }
        try {
          ((this.sessionRequestQueue.state = bt.active), this.emitSessionRequest(t));
        } catch (i) {
          this.client.logger.error(i);
        }
      }),
      R(this, "emitSessionRequest", (t) => {
        this.client.events.emit("session_request", t);
      }),
      R(this, "onPairingCreated", (t) => {
        if ((t.methods && this.expectedPairingMethodMap.set(t.topic, t.methods), t.active)) return;
        const i = this.client.proposal.getAll().find((s) => s.pairingTopic === t.topic);
        i &&
          this.onSessionProposeRequest({
            topic: t.topic,
            payload: Wt(
              "wc_sessionPropose",
              Ne(ne({}, i), {
                requiredNamespaces: i.requiredNamespaces,
                optionalNamespaces: i.optionalNamespaces,
                relays: i.relays,
                proposer: i.proposer,
                sessionProperties: i.sessionProperties,
                scopedProperties: i.scopedProperties,
              }),
              i.id,
            ),
          });
      }),
      R(this, "isValidConnect", async (t) => {
        if (!Le(t)) {
          const { message: h } = F("MISSING_OR_INVALID", `connect() params: ${JSON.stringify(t)}`);
          throw new Error(h);
        }
        const {
          pairingTopic: i,
          requiredNamespaces: s,
          optionalNamespaces: n,
          sessionProperties: o,
          scopedProperties: a,
          relays: c,
        } = t;
        if ((Oe(i) || (await this.isValidPairingTopic(i)), !N0(c))) {
          const { message: h } = F("MISSING_OR_INVALID", `connect() relays: ${c}`);
          throw new Error(h);
        }
        if (!Oe(s) && Yt(s) !== 0) {
          const h = "requiredNamespaces are deprecated and are automatically assigned to optionalNamespaces";
          (["fatal", "error", "silent"].includes(this.client.logger.level)
            ? console.warn(h)
            : this.client.logger.warn(h),
            this.validateNamespaces(s, "requiredNamespaces"));
        }
        if (
          (!Oe(n) && Yt(n) !== 0 && this.validateNamespaces(n, "optionalNamespaces"),
          Oe(o) || this.validateSessionProps(o, "sessionProperties"),
          !Oe(a))
        ) {
          this.validateSessionProps(a, "scopedProperties");
          const h = Object.keys(s || {}).concat(Object.keys(n || {}));
          if (!Object.keys(a).every((u) => h.includes(u)))
            throw new Error(
              `Scoped properties must be a subset of required/optional namespaces, received: ${JSON.stringify(a)}, required/optional namespaces: ${JSON.stringify(h)}`,
            );
        }
      }),
      R(this, "validateNamespaces", (t, i) => {
        const s = R0(t, "connect()", i);
        if (s) throw new Error(s.message);
      }),
      R(this, "isValidApprove", async (t) => {
        if (!Le(t)) throw new Error(F("MISSING_OR_INVALID", `approve() params: ${t}`).message);
        const { id: i, namespaces: s, relayProtocol: n, sessionProperties: o, scopedProperties: a } = t;
        (this.checkRecentlyDeleted(i), await this.isValidProposalId(i));
        const c = this.client.proposal.get(i),
          h = bn(s, "approve()");
        if (h) throw new Error(h.message);
        const u = jc(c.requiredNamespaces, s, "approve()");
        if (u) throw new Error(u.message);
        if (!de(n, !0)) {
          const { message: l } = F("MISSING_OR_INVALID", `approve() relayProtocol: ${n}`);
          throw new Error(l);
        }
        if ((Oe(o) || this.validateSessionProps(o, "sessionProperties"), !Oe(a))) {
          this.validateSessionProps(a, "scopedProperties");
          const l = new Set(Object.keys(s));
          if (!Object.keys(a).every((d) => l.has(d)))
            throw new Error(
              `Scoped properties must be a subset of approved namespaces, received: ${JSON.stringify(a)}, approved namespaces: ${Array.from(l).join(", ")}`,
            );
        }
      }),
      R(this, "isValidReject", async (t) => {
        if (!Le(t)) {
          const { message: n } = F("MISSING_OR_INVALID", `reject() params: ${t}`);
          throw new Error(n);
        }
        const { id: i, reason: s } = t;
        if ((this.checkRecentlyDeleted(i), await this.isValidProposalId(i), !B0(s))) {
          const { message: n } = F("MISSING_OR_INVALID", `reject() reason: ${JSON.stringify(s)}`);
          throw new Error(n);
        }
      }),
      R(this, "isValidSessionSettleRequest", (t) => {
        if (!Le(t)) {
          const { message: h } = F("MISSING_OR_INVALID", `onSessionSettleRequest() params: ${t}`);
          throw new Error(h);
        }
        const { relay: i, controller: s, namespaces: n, expiry: o } = t;
        if (!Ul(i)) {
          const { message: h } = F("MISSING_OR_INVALID", "onSessionSettleRequest() relay protocol should be a string");
          throw new Error(h);
        }
        const a = O0(s, "onSessionSettleRequest()");
        if (a) throw new Error(a.message);
        const c = bn(n, "onSessionSettleRequest()");
        if (c) throw new Error(c.message);
        if (Ht(o)) {
          const { message: h } = F("EXPIRED", "onSessionSettleRequest()");
          throw new Error(h);
        }
      }),
      R(this, "isValidUpdate", async (t) => {
        if (!Le(t)) {
          const { message: c } = F("MISSING_OR_INVALID", `update() params: ${t}`);
          throw new Error(c);
        }
        const { topic: i, namespaces: s } = t;
        (this.checkRecentlyDeleted(i), await this.isValidSessionTopic(i));
        const n = this.client.session.get(i),
          o = bn(s, "update()");
        if (o) throw new Error(o.message);
        const a = jc(n.requiredNamespaces, s, "update()");
        if (a) throw new Error(a.message);
      }),
      R(this, "isValidExtend", async (t) => {
        if (!Le(t)) {
          const { message: s } = F("MISSING_OR_INVALID", `extend() params: ${t}`);
          throw new Error(s);
        }
        const { topic: i } = t;
        (this.checkRecentlyDeleted(i), await this.isValidSessionTopic(i));
      }),
      R(this, "isValidRequest", async (t) => {
        if (!Le(t)) {
          const { message: c } = F("MISSING_OR_INVALID", `request() params: ${t}`);
          throw new Error(c);
        }
        const { topic: i, request: s, chainId: n, expiry: o } = t;
        (this.checkRecentlyDeleted(i), await this.isValidSessionTopic(i));
        const { namespaces: a } = this.client.session.get(i);
        if (!Nc(a, n)) {
          const { message: c } = F("MISSING_OR_INVALID", `request() chainId: ${n}`);
          throw new Error(c);
        }
        if (!U0(s)) {
          const { message: c } = F("MISSING_OR_INVALID", `request() ${JSON.stringify(s)}`);
          throw new Error(c);
        }
        if (!L0(a, n, s.method)) {
          const { message: c } = F("MISSING_OR_INVALID", `request() method: ${s.method}`);
          throw new Error(c);
        }
        if (o && !H0(o, xn)) {
          const { message: c } = F(
            "MISSING_OR_INVALID",
            `request() expiry: ${o}. Expiry must be a number (in seconds) between ${xn.min} and ${xn.max}`,
          );
          throw new Error(c);
        }
      }),
      R(this, "isValidRespond", async (t) => {
        var i;
        if (!Le(t)) {
          const { message: o } = F("MISSING_OR_INVALID", `respond() params: ${t}`);
          throw new Error(o);
        }
        const { topic: s, response: n } = t;
        try {
          await this.isValidSessionTopic(s);
        } catch (o) {
          throw ((i = t == null ? void 0 : t.response) != null && i.id && this.cleanupAfterResponse(t), o);
        }
        if (!F0(n)) {
          const { message: o } = F("MISSING_OR_INVALID", `respond() response: ${JSON.stringify(n)}`);
          throw new Error(o);
        }
      }),
      R(this, "isValidPing", async (t) => {
        if (!Le(t)) {
          const { message: s } = F("MISSING_OR_INVALID", `ping() params: ${t}`);
          throw new Error(s);
        }
        const { topic: i } = t;
        await this.isValidSessionOrPairingTopic(i);
      }),
      R(this, "isValidEmit", async (t) => {
        if (!Le(t)) {
          const { message: a } = F("MISSING_OR_INVALID", `emit() params: ${t}`);
          throw new Error(a);
        }
        const { topic: i, event: s, chainId: n } = t;
        await this.isValidSessionTopic(i);
        const { namespaces: o } = this.client.session.get(i);
        if (!Nc(o, n)) {
          const { message: a } = F("MISSING_OR_INVALID", `emit() chainId: ${n}`);
          throw new Error(a);
        }
        if (!k0(s)) {
          const { message: a } = F("MISSING_OR_INVALID", `emit() event: ${JSON.stringify(s)}`);
          throw new Error(a);
        }
        if (!q0(o, n, s.name)) {
          const { message: a } = F("MISSING_OR_INVALID", `emit() event: ${JSON.stringify(s)}`);
          throw new Error(a);
        }
      }),
      R(this, "isValidDisconnect", async (t) => {
        if (!Le(t)) {
          const { message: s } = F("MISSING_OR_INVALID", `disconnect() params: ${t}`);
          throw new Error(s);
        }
        const { topic: i } = t;
        await this.isValidSessionOrPairingTopic(i);
      }),
      R(this, "isValidAuthenticate", (t) => {
        const { chains: i, uri: s, domain: n, nonce: o } = t;
        if (!Array.isArray(i) || i.length === 0) throw new Error("chains is required and must be a non-empty array");
        if (!de(s, !1)) throw new Error("uri is required parameter");
        if (!de(n, !1)) throw new Error("domain is required parameter");
        if (!de(o, !1)) throw new Error("nonce is required parameter");
        if ([...new Set(i.map((c) => Hr(c).namespace))].length > 1)
          throw new Error("Multi-namespace requests are not supported. Please request single namespace only.");
        const { namespace: a } = Hr(i[0]);
        if (a !== "eip155")
          throw new Error(
            "Only eip155 namespace is supported for authenticated sessions. Please use .connect() for non-eip155 chains.",
          );
      }),
      R(this, "getVerifyContext", async (t) => {
        const { attestationId: i, hash: s, encryptedId: n, metadata: o, transportType: a } = t,
          c = { verified: { verifyUrl: o.verifyUrl || Ii, validation: "UNKNOWN", origin: o.url || "" } };
        try {
          if (a === ce.link_mode) {
            const u = this.getAppLinkIfEnabled(o, a);
            return (
              (c.verified.validation = u && new URL(u).origin === new URL(o.url).origin ? "VALID" : "INVALID"),
              c
            );
          }
          const h = await this.client.core.verify.resolve({
            attestationId: i,
            hash: s,
            encryptedId: n,
            verifyUrl: o.verifyUrl,
          });
          h &&
            ((c.verified.origin = h.origin),
            (c.verified.isScam = h.isScam),
            (c.verified.validation = h.origin === new URL(o.url).origin ? "VALID" : "INVALID"));
        } catch (h) {
          this.client.logger.warn(h);
        }
        return (this.client.logger.debug(`Verify context: ${JSON.stringify(c)}`), c);
      }),
      R(this, "validateSessionProps", (t, i) => {
        Object.values(t).forEach((s, n) => {
          if (s == null) {
            const { message: o } = F(
              "MISSING_OR_INVALID",
              `${i} must contain an existing value for each key. Received: ${s} for key ${Object.keys(t)[n]}`,
            );
            throw new Error(o);
          }
        });
      }),
      R(this, "getPendingAuthRequest", (t) => {
        const i = this.client.auth.requests.get(t);
        return typeof i == "object" ? i : void 0;
      }),
      R(this, "addToRecentlyDeleted", (t, i) => {
        if ((this.recentlyDeletedMap.set(t, i), this.recentlyDeletedMap.size >= this.recentlyDeletedLimit)) {
          let s = 0;
          const n = this.recentlyDeletedLimit / 2;
          for (const o of this.recentlyDeletedMap.keys()) {
            if (s++ >= n) break;
            this.recentlyDeletedMap.delete(o);
          }
        }
      }),
      R(this, "checkRecentlyDeleted", (t) => {
        const i = this.recentlyDeletedMap.get(t);
        if (i) {
          const { message: s } = F("MISSING_OR_INVALID", `Record was recently deleted - ${i}: ${t}`);
          throw new Error(s);
        }
      }),
      R(this, "isLinkModeEnabled", (t, i) => {
        var s, n, o, a, c, h, u, l, d;
        return !t || i !== ce.link_mode
          ? !1
          : ((n = (s = this.client.metadata) == null ? void 0 : s.redirect) == null ? void 0 : n.linkMode) === !0 &&
              ((a = (o = this.client.metadata) == null ? void 0 : o.redirect) == null ? void 0 : a.universal) !==
                void 0 &&
              ((h = (c = this.client.metadata) == null ? void 0 : c.redirect) == null ? void 0 : h.universal) !== "" &&
              ((u = t == null ? void 0 : t.redirect) == null ? void 0 : u.universal) !== void 0 &&
              ((l = t == null ? void 0 : t.redirect) == null ? void 0 : l.universal) !== "" &&
              ((d = t == null ? void 0 : t.redirect) == null ? void 0 : d.linkMode) === !0 &&
              this.client.core.linkModeSupportedApps.includes(t.redirect.universal) &&
              typeof (V == null ? void 0 : V.Linking) < "u";
      }),
      R(this, "getAppLinkIfEnabled", (t, i) => {
        var s;
        return this.isLinkModeEnabled(t, i)
          ? (s = t == null ? void 0 : t.redirect) == null
            ? void 0
            : s.universal
          : void 0;
      }),
      R(this, "handleLinkModeMessage", ({ url: t }) => {
        if (!t || !t.includes("wc_ev") || !t.includes("topic")) return;
        const i = Ja(t, "topic") || "",
          s = decodeURIComponent(Ja(t, "wc_ev") || ""),
          n = this.client.session.keys.includes(i);
        (n && this.client.session.update(i, { transportType: ce.link_mode }),
          this.client.core.dispatchEnvelope({ topic: i, message: s, sessionExists: n }));
      }),
      R(this, "registerLinkModeListeners", async () => {
        var t;
        if (To() || (Jt() && (t = this.client.metadata.redirect) != null && t.linkMode)) {
          const i = V == null ? void 0 : V.Linking;
          if (typeof i < "u") {
            i.addEventListener("url", this.handleLinkModeMessage, this.client.name);
            const s = await i.getInitialURL();
            s &&
              setTimeout(() => {
                this.handleLinkModeMessage({ url: s });
              }, 50);
          }
        }
      }),
      R(this, "shouldSetTVF", (t, i) => {
        if (!i || t !== "wc_sessionRequest") return !1;
        const { request: s } = i;
        return Object.keys(Ah).includes(s.method);
      }),
      R(this, "getTVFParams", (t, i, s) => {
        var n, o;
        try {
          const a = i.request.method,
            c = this.extractTxHashesFromResult(a, s);
          return Ne(
            ne(
              { correlationId: t, rpcMethods: [a], chainId: i.chainId },
              this.isValidContractData(i.request.params) && {
                contractAddresses: [(o = (n = i.request.params) == null ? void 0 : n[0]) == null ? void 0 : o.to],
              },
            ),
            { txHashes: c },
          );
        } catch (a) {
          this.client.logger.warn("Error getting TVF params", a);
        }
        return {};
      }),
      R(this, "isValidContractData", (t) => {
        var i;
        if (!t) return !1;
        try {
          const s = (t == null ? void 0 : t.data) || ((i = t == null ? void 0 : t[0]) == null ? void 0 : i.data);
          if (!s.startsWith("0x")) return !1;
          const n = s.slice(2);
          return /^[0-9a-fA-F]*$/.test(n) ? n.length % 2 === 0 : !1;
        } catch {}
        return !1;
      }),
      R(this, "extractTxHashesFromResult", (t, i) => {
        try {
          const s = Ah[t];
          if (typeof i == "string") return [i];
          const n = i[s.key];
          if (ft(n)) return t === "solana_signAllTransactions" ? n.map((o) => ub(o)) : n;
          if (typeof n == "string") return [n];
        } catch (s) {
          this.client.logger.warn("Error extracting tx hashes from result", s);
        }
        return [];
      }));
  }
  async processPendingMessageEvents() {
    try {
      const e = this.client.session.keys,
        t = this.client.core.relayer.messages.getWithoutAck(e);
      for (const [i, s] of Object.entries(t))
        for (const n of s)
          try {
            await this.onProviderMessageEvent({ topic: i, message: n, publishedAt: Date.now() });
          } catch {
            this.client.logger.warn(`Error processing pending message event for topic: ${i}, message: ${n}`);
          }
    } catch (e) {
      this.client.logger.warn("processPendingMessageEvents failed", e);
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  async confirmOnlineStateOrThrow() {
    await this.client.core.relayer.confirmOnlineStateOrThrow();
  }
  registerRelayerEvents() {
    this.client.core.relayer.on(be.message, (e) => {
      this.onProviderMessageEvent(e);
    });
  }
  async onRelayMessage(e) {
    const { topic: t, message: i, attestation: s, transportType: n } = e,
      { publicKey: o } = this.client.auth.authKeys.keys.includes(fs)
        ? this.client.auth.authKeys.get(fs)
        : { publicKey: void 0 };
    try {
      const a = await this.client.core.crypto.decode(t, i, {
        receiverPublicKey: o,
        encoding: n === ce.link_mode ? Vt : pt,
      });
      (Mo(a)
        ? (this.client.core.history.set(t, a),
          await this.onRelayEventRequest({
            topic: t,
            payload: a,
            attestation: s,
            transportType: n,
            encryptedId: $t(i),
          }))
        : qs(a)
          ? (await this.client.core.history.resolve(a),
            await this.onRelayEventResponse({ topic: t, payload: a, transportType: n }),
            this.client.core.history.delete(t, a.id))
          : await this.onRelayEventUnknownPayload({ topic: t, payload: a, transportType: n }),
        await this.client.core.relayer.messages.ack(t, i));
    } catch (a) {
      this.client.logger.error(a);
    }
  }
  registerExpirerEvents() {
    this.client.core.expirer.on(rt.expired, async (e) => {
      const { topic: t, id: i } = rl(e.target);
      if (i && this.client.pendingRequest.keys.includes(i))
        return await this.deletePendingSessionRequest(i, F("EXPIRED"), !0);
      if (i && this.client.auth.requests.keys.includes(i))
        return await this.deletePendingAuthRequest(i, F("EXPIRED"), !0);
      t
        ? this.client.session.keys.includes(t) &&
          (await this.deleteSession({ topic: t, expirerHasDeleted: !0 }),
          this.client.events.emit("session_expire", { topic: t }))
        : i && (await this.deleteProposal(i, !0), this.client.events.emit("proposal_expire", { id: i }));
    });
  }
  registerPairingEvents() {
    (this.client.core.pairing.events.on(nr.create, (e) => this.onPairingCreated(e)),
      this.client.core.pairing.events.on(nr.delete, (e) => {
        this.addToRecentlyDeleted(e.topic, "pairing");
      }));
  }
  isValidPairingTopic(e) {
    if (!de(e, !1)) {
      const { message: t } = F("MISSING_OR_INVALID", `pairing topic should be a string: ${e}`);
      throw new Error(t);
    }
    if (!this.client.core.pairing.pairings.keys.includes(e)) {
      const { message: t } = F("NO_MATCHING_KEY", `pairing topic doesn't exist: ${e}`);
      throw new Error(t);
    }
    if (Ht(this.client.core.pairing.pairings.get(e).expiry)) {
      const { message: t } = F("EXPIRED", `pairing topic: ${e}`);
      throw new Error(t);
    }
  }
  async isValidSessionTopic(e) {
    if (!de(e, !1)) {
      const { message: t } = F("MISSING_OR_INVALID", `session topic should be a string: ${e}`);
      throw new Error(t);
    }
    if ((this.checkRecentlyDeleted(e), !this.client.session.keys.includes(e))) {
      const { message: t } = F("NO_MATCHING_KEY", `session topic doesn't exist: ${e}`);
      throw new Error(t);
    }
    if (Ht(this.client.session.get(e).expiry)) {
      await this.deleteSession({ topic: e });
      const { message: t } = F("EXPIRED", `session topic: ${e}`);
      throw new Error(t);
    }
    if (!this.client.core.crypto.keychain.has(e)) {
      const { message: t } = F("MISSING_OR_INVALID", `session topic does not exist in keychain: ${e}`);
      throw (await this.deleteSession({ topic: e }), new Error(t));
    }
  }
  async isValidSessionOrPairingTopic(e) {
    if ((this.checkRecentlyDeleted(e), this.client.session.keys.includes(e))) await this.isValidSessionTopic(e);
    else if (this.client.core.pairing.pairings.keys.includes(e)) this.isValidPairingTopic(e);
    else if (de(e, !1)) {
      const { message: t } = F("NO_MATCHING_KEY", `session or pairing topic doesn't exist: ${e}`);
      throw new Error(t);
    } else {
      const { message: t } = F("MISSING_OR_INVALID", `session or pairing topic should be a string: ${e}`);
      throw new Error(t);
    }
  }
  async isValidProposalId(e) {
    if (!j0(e)) {
      const { message: t } = F("MISSING_OR_INVALID", `proposal id should be a number: ${e}`);
      throw new Error(t);
    }
    if (!this.client.proposal.keys.includes(e)) {
      const { message: t } = F("NO_MATCHING_KEY", `proposal id doesn't exist: ${e}`);
      throw new Error(t);
    }
    if (Ht(this.client.proposal.get(e).expiryTimestamp)) {
      await this.deleteProposal(e);
      const { message: t } = F("EXPIRED", `proposal id: ${e}`);
      throw new Error(t);
    }
  }
}
class N$ extends wr {
  constructor(e, t) {
    (super(e, t, w$, zo), (this.core = e), (this.logger = t));
  }
}
let j$ = class extends wr {
  constructor(e, t) {
    (super(e, t, b$, zo), (this.core = e), (this.logger = t));
  }
};
class B$ extends wr {
  constructor(e, t) {
    (super(e, t, E$, zo, (i) => i.id), (this.core = e), (this.logger = t));
  }
}
class U$ extends wr {
  constructor(e, t) {
    (super(e, t, D$, zs, () => fs), (this.core = e), (this.logger = t));
  }
}
class F$ extends wr {
  constructor(e, t) {
    (super(e, t, S$, zs), (this.core = e), (this.logger = t));
  }
}
class k$ extends wr {
  constructor(e, t) {
    (super(e, t, O$, zs, (i) => i.id), (this.core = e), (this.logger = t));
  }
}
var L$ = Object.defineProperty,
  q$ = (r, e, t) => (e in r ? L$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Cn = (r, e, t) => q$(r, typeof e != "symbol" ? e + "" : e, t);
class M$ {
  constructor(e, t) {
    ((this.core = e),
      (this.logger = t),
      Cn(this, "authKeys"),
      Cn(this, "pairingTopics"),
      Cn(this, "requests"),
      (this.authKeys = new U$(this.core, this.logger)),
      (this.pairingTopics = new F$(this.core, this.logger)),
      (this.requests = new k$(this.core, this.logger)));
  }
  async init() {
    (await this.authKeys.init(), await this.pairingTopics.init(), await this.requests.init());
  }
}
var z$ = Object.defineProperty,
  H$ = (r, e, t) => (e in r ? z$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Y = (r, e, t) => H$(r, typeof e != "symbol" ? e + "" : e, t);
let V$ = class ud extends uE {
  constructor(e) {
    (super(e),
      Y(this, "protocol", ad),
      Y(this, "version", cd),
      Y(this, "name", An.name),
      Y(this, "metadata"),
      Y(this, "core"),
      Y(this, "logger"),
      Y(this, "events", new Ze.EventEmitter()),
      Y(this, "engine"),
      Y(this, "session"),
      Y(this, "proposal"),
      Y(this, "pendingRequest"),
      Y(this, "auth"),
      Y(this, "signConfig"),
      Y(this, "on", (i, s) => this.events.on(i, s)),
      Y(this, "once", (i, s) => this.events.once(i, s)),
      Y(this, "off", (i, s) => this.events.off(i, s)),
      Y(this, "removeListener", (i, s) => this.events.removeListener(i, s)),
      Y(this, "removeAllListeners", (i) => this.events.removeAllListeners(i)),
      Y(this, "connect", async (i) => {
        try {
          return await this.engine.connect(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "pair", async (i) => {
        try {
          return await this.engine.pair(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "approve", async (i) => {
        try {
          return await this.engine.approve(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "reject", async (i) => {
        try {
          return await this.engine.reject(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "update", async (i) => {
        try {
          return await this.engine.update(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "extend", async (i) => {
        try {
          return await this.engine.extend(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "request", async (i) => {
        try {
          return await this.engine.request(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "respond", async (i) => {
        try {
          return await this.engine.respond(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "ping", async (i) => {
        try {
          return await this.engine.ping(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "emit", async (i) => {
        try {
          return await this.engine.emit(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "disconnect", async (i) => {
        try {
          return await this.engine.disconnect(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "find", (i) => {
        try {
          return this.engine.find(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "getPendingSessionRequests", () => {
        try {
          return this.engine.getPendingSessionRequests();
        } catch (i) {
          throw (this.logger.error(i.message), i);
        }
      }),
      Y(this, "authenticate", async (i, s) => {
        try {
          return await this.engine.authenticate(i, s);
        } catch (n) {
          throw (this.logger.error(n.message), n);
        }
      }),
      Y(this, "formatAuthMessage", (i) => {
        try {
          return this.engine.formatAuthMessage(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "approveSessionAuthenticate", async (i) => {
        try {
          return await this.engine.approveSessionAuthenticate(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      Y(this, "rejectSessionAuthenticate", async (i) => {
        try {
          return await this.engine.rejectSessionAuthenticate(i);
        } catch (s) {
          throw (this.logger.error(s.message), s);
        }
      }),
      (this.name = (e == null ? void 0 : e.name) || An.name),
      (this.metadata = Iw(e == null ? void 0 : e.metadata)),
      (this.signConfig = e == null ? void 0 : e.signConfig));
    const t =
      typeof (e == null ? void 0 : e.logger) < "u" && typeof (e == null ? void 0 : e.logger) != "string"
        ? e.logger
        : Mi(Fs({ level: (e == null ? void 0 : e.logger) || An.logger }));
    ((this.core = (e == null ? void 0 : e.core) || new m$(e)),
      (this.logger = Be(t, this.name)),
      (this.session = new j$(this.core, this.logger)),
      (this.proposal = new N$(this.core, this.logger)),
      (this.pendingRequest = new B$(this.core, this.logger)),
      (this.engine = new R$(this)),
      (this.auth = new M$(this.core, this.logger)));
  }
  static async init(e) {
    const t = new ud(e);
    return (await t.initialize(), t);
  }
  get context() {
    return ze(this.logger);
  }
  get pairing() {
    return this.core.pairing.pairings;
  }
  async initialize() {
    this.logger.trace("Initialized");
    try {
      (await this.core.start(),
        await this.session.init(),
        await this.proposal.init(),
        await this.pendingRequest.init(),
        await this.auth.init(),
        await this.engine.init(),
        this.logger.info("SignClient Initialization Success"),
        setTimeout(() => {
          this.engine.processRelayMessageCache();
        }, U.toMiliseconds(U.ONE_SECOND)));
    } catch (e) {
      throw (this.logger.info("SignClient Initialization Failure"), this.logger.error(e.message), e);
    }
  }
};
var rs = { exports: {} },
  Ch;
function K$() {
  return (
    Ch ||
      ((Ch = 1),
      (function (r, e) {
        var t = (typeof globalThis < "u" && globalThis) || (typeof self < "u" && self) || (typeof It < "u" && It),
          i = (function () {
            function n() {
              ((this.fetch = !1), (this.DOMException = t.DOMException));
            }
            return ((n.prototype = t), new n());
          })();
        ((function (n) {
          (function (o) {
            var a = (typeof n < "u" && n) || (typeof self < "u" && self) || (typeof It < "u" && It) || {},
              c = {
                searchParams: "URLSearchParams" in a,
                iterable: "Symbol" in a && "iterator" in Symbol,
                blob:
                  "FileReader" in a &&
                  "Blob" in a &&
                  (function () {
                    try {
                      return (new Blob(), !0);
                    } catch {
                      return !1;
                    }
                  })(),
                formData: "FormData" in a,
                arrayBuffer: "ArrayBuffer" in a,
              };
            function h(y) {
              return y && DataView.prototype.isPrototypeOf(y);
            }
            if (c.arrayBuffer)
              var u = [
                  "[object Int8Array]",
                  "[object Uint8Array]",
                  "[object Uint8ClampedArray]",
                  "[object Int16Array]",
                  "[object Uint16Array]",
                  "[object Int32Array]",
                  "[object Uint32Array]",
                  "[object Float32Array]",
                  "[object Float64Array]",
                ],
                l =
                  ArrayBuffer.isView ||
                  function (y) {
                    return y && u.indexOf(Object.prototype.toString.call(y)) > -1;
                  };
            function d(y) {
              if ((typeof y != "string" && (y = String(y)), /[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(y) || y === ""))
                throw new TypeError('Invalid character in header field name: "' + y + '"');
              return y.toLowerCase();
            }
            function f(y) {
              return (typeof y != "string" && (y = String(y)), y);
            }
            function p(y) {
              var m = {
                next: function () {
                  var $ = y.shift();
                  return { done: $ === void 0, value: $ };
                },
              };
              return (
                c.iterable &&
                  (m[Symbol.iterator] = function () {
                    return m;
                  }),
                m
              );
            }
            function g(y) {
              ((this.map = {}),
                y instanceof g
                  ? y.forEach(function (m, $) {
                      this.append($, m);
                    }, this)
                  : Array.isArray(y)
                    ? y.forEach(function (m) {
                        if (m.length != 2)
                          throw new TypeError(
                            "Headers constructor: expected name/value pair to be length 2, found" + m.length,
                          );
                        this.append(m[0], m[1]);
                      }, this)
                    : y &&
                      Object.getOwnPropertyNames(y).forEach(function (m) {
                        this.append(m, y[m]);
                      }, this));
            }
            ((g.prototype.append = function (y, m) {
              ((y = d(y)), (m = f(m)));
              var $ = this.map[y];
              this.map[y] = $ ? $ + ", " + m : m;
            }),
              (g.prototype.delete = function (y) {
                delete this.map[d(y)];
              }),
              (g.prototype.get = function (y) {
                return ((y = d(y)), this.has(y) ? this.map[y] : null);
              }),
              (g.prototype.has = function (y) {
                return this.map.hasOwnProperty(d(y));
              }),
              (g.prototype.set = function (y, m) {
                this.map[d(y)] = f(m);
              }),
              (g.prototype.forEach = function (y, m) {
                for (var $ in this.map) this.map.hasOwnProperty($) && y.call(m, this.map[$], $, this);
              }),
              (g.prototype.keys = function () {
                var y = [];
                return (
                  this.forEach(function (m, $) {
                    y.push($);
                  }),
                  p(y)
                );
              }),
              (g.prototype.values = function () {
                var y = [];
                return (
                  this.forEach(function (m) {
                    y.push(m);
                  }),
                  p(y)
                );
              }),
              (g.prototype.entries = function () {
                var y = [];
                return (
                  this.forEach(function (m, $) {
                    y.push([$, m]);
                  }),
                  p(y)
                );
              }),
              c.iterable && (g.prototype[Symbol.iterator] = g.prototype.entries));
            function w(y) {
              if (!y._noBody) {
                if (y.bodyUsed) return Promise.reject(new TypeError("Already read"));
                y.bodyUsed = !0;
              }
            }
            function E(y) {
              return new Promise(function (m, $) {
                ((y.onload = function () {
                  m(y.result);
                }),
                  (y.onerror = function () {
                    $(y.error);
                  }));
              });
            }
            function b(y) {
              var m = new FileReader(),
                $ = E(m);
              return (m.readAsArrayBuffer(y), $);
            }
            function _(y) {
              var m = new FileReader(),
                $ = E(m),
                x = /charset=([A-Za-z0-9_-]+)/.exec(y.type),
                S = x ? x[1] : "utf-8";
              return (m.readAsText(y, S), $);
            }
            function A(y) {
              for (var m = new Uint8Array(y), $ = new Array(m.length), x = 0; x < m.length; x++)
                $[x] = String.fromCharCode(m[x]);
              return $.join("");
            }
            function T(y) {
              if (y.slice) return y.slice(0);
              var m = new Uint8Array(y.byteLength);
              return (m.set(new Uint8Array(y)), m.buffer);
            }
            function v() {
              return (
                (this.bodyUsed = !1),
                (this._initBody = function (y) {
                  ((this.bodyUsed = this.bodyUsed),
                    (this._bodyInit = y),
                    y
                      ? typeof y == "string"
                        ? (this._bodyText = y)
                        : c.blob && Blob.prototype.isPrototypeOf(y)
                          ? (this._bodyBlob = y)
                          : c.formData && FormData.prototype.isPrototypeOf(y)
                            ? (this._bodyFormData = y)
                            : c.searchParams && URLSearchParams.prototype.isPrototypeOf(y)
                              ? (this._bodyText = y.toString())
                              : c.arrayBuffer && c.blob && h(y)
                                ? ((this._bodyArrayBuffer = T(y.buffer)),
                                  (this._bodyInit = new Blob([this._bodyArrayBuffer])))
                                : c.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(y) || l(y))
                                  ? (this._bodyArrayBuffer = T(y))
                                  : (this._bodyText = y = Object.prototype.toString.call(y))
                      : ((this._noBody = !0), (this._bodyText = "")),
                    this.headers.get("content-type") ||
                      (typeof y == "string"
                        ? this.headers.set("content-type", "text/plain;charset=UTF-8")
                        : this._bodyBlob && this._bodyBlob.type
                          ? this.headers.set("content-type", this._bodyBlob.type)
                          : c.searchParams &&
                            URLSearchParams.prototype.isPrototypeOf(y) &&
                            this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")));
                }),
                c.blob &&
                  (this.blob = function () {
                    var y = w(this);
                    if (y) return y;
                    if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
                    if (this._bodyArrayBuffer) return Promise.resolve(new Blob([this._bodyArrayBuffer]));
                    if (this._bodyFormData) throw new Error("could not read FormData body as blob");
                    return Promise.resolve(new Blob([this._bodyText]));
                  }),
                (this.arrayBuffer = function () {
                  if (this._bodyArrayBuffer) {
                    var y = w(this);
                    return (
                      y ||
                      (ArrayBuffer.isView(this._bodyArrayBuffer)
                        ? Promise.resolve(
                            this._bodyArrayBuffer.buffer.slice(
                              this._bodyArrayBuffer.byteOffset,
                              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength,
                            ),
                          )
                        : Promise.resolve(this._bodyArrayBuffer))
                    );
                  } else {
                    if (c.blob) return this.blob().then(b);
                    throw new Error("could not read as ArrayBuffer");
                  }
                }),
                (this.text = function () {
                  var y = w(this);
                  if (y) return y;
                  if (this._bodyBlob) return _(this._bodyBlob);
                  if (this._bodyArrayBuffer) return Promise.resolve(A(this._bodyArrayBuffer));
                  if (this._bodyFormData) throw new Error("could not read FormData body as text");
                  return Promise.resolve(this._bodyText);
                }),
                c.formData &&
                  (this.formData = function () {
                    return this.text().then(j);
                  }),
                (this.json = function () {
                  return this.text().then(JSON.parse);
                }),
                this
              );
            }
            var I = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
            function O(y) {
              var m = y.toUpperCase();
              return I.indexOf(m) > -1 ? m : y;
            }
            function D(y, m) {
              if (!(this instanceof D))
                throw new TypeError(
                  'Please use the "new" operator, this DOM object constructor cannot be called as a function.',
                );
              m = m || {};
              var $ = m.body;
              if (y instanceof D) {
                if (y.bodyUsed) throw new TypeError("Already read");
                ((this.url = y.url),
                  (this.credentials = y.credentials),
                  m.headers || (this.headers = new g(y.headers)),
                  (this.method = y.method),
                  (this.mode = y.mode),
                  (this.signal = y.signal),
                  !$ && y._bodyInit != null && (($ = y._bodyInit), (y.bodyUsed = !0)));
              } else this.url = String(y);
              if (
                ((this.credentials = m.credentials || this.credentials || "same-origin"),
                (m.headers || !this.headers) && (this.headers = new g(m.headers)),
                (this.method = O(m.method || this.method || "GET")),
                (this.mode = m.mode || this.mode || null),
                (this.signal =
                  m.signal ||
                  this.signal ||
                  (function () {
                    if ("AbortController" in a) {
                      var C = new AbortController();
                      return C.signal;
                    }
                  })()),
                (this.referrer = null),
                (this.method === "GET" || this.method === "HEAD") && $)
              )
                throw new TypeError("Body not allowed for GET or HEAD requests");
              if (
                (this._initBody($),
                (this.method === "GET" || this.method === "HEAD") && (m.cache === "no-store" || m.cache === "no-cache"))
              ) {
                var x = /([?&])_=[^&]*/;
                if (x.test(this.url)) this.url = this.url.replace(x, "$1_=" + new Date().getTime());
                else {
                  var S = /\?/;
                  this.url += (S.test(this.url) ? "&" : "?") + "_=" + new Date().getTime();
                }
              }
            }
            D.prototype.clone = function () {
              return new D(this, { body: this._bodyInit });
            };
            function j(y) {
              var m = new FormData();
              return (
                y
                  .trim()
                  .split("&")
                  .forEach(function ($) {
                    if ($) {
                      var x = $.split("="),
                        S = x.shift().replace(/\+/g, " "),
                        C = x.join("=").replace(/\+/g, " ");
                      m.append(decodeURIComponent(S), decodeURIComponent(C));
                    }
                  }),
                m
              );
            }
            function N(y) {
              var m = new g(),
                $ = y.replace(/\r?\n[\t ]+/g, " ");
              return (
                $.split("\r")
                  .map(function (x) {
                    return x.indexOf(`
`) === 0
                      ? x.substr(1, x.length)
                      : x;
                  })
                  .forEach(function (x) {
                    var S = x.split(":"),
                      C = S.shift().trim();
                    if (C) {
                      var k = S.join(":").trim();
                      try {
                        m.append(C, k);
                      } catch (q) {
                        console.warn("Response " + q.message);
                      }
                    }
                  }),
                m
              );
            }
            v.call(D.prototype);
            function B(y, m) {
              if (!(this instanceof B))
                throw new TypeError(
                  'Please use the "new" operator, this DOM object constructor cannot be called as a function.',
                );
              if (
                (m || (m = {}),
                (this.type = "default"),
                (this.status = m.status === void 0 ? 200 : m.status),
                this.status < 200 || this.status > 599)
              )
                throw new RangeError(
                  "Failed to construct 'Response': The status provided (0) is outside the range [200, 599].",
                );
              ((this.ok = this.status >= 200 && this.status < 300),
                (this.statusText = m.statusText === void 0 ? "" : "" + m.statusText),
                (this.headers = new g(m.headers)),
                (this.url = m.url || ""),
                this._initBody(y));
            }
            (v.call(B.prototype),
              (B.prototype.clone = function () {
                return new B(this._bodyInit, {
                  status: this.status,
                  statusText: this.statusText,
                  headers: new g(this.headers),
                  url: this.url,
                });
              }),
              (B.error = function () {
                var y = new B(null, { status: 200, statusText: "" });
                return ((y.ok = !1), (y.status = 0), (y.type = "error"), y);
              }));
            var M = [301, 302, 303, 307, 308];
            ((B.redirect = function (y, m) {
              if (M.indexOf(m) === -1) throw new RangeError("Invalid status code");
              return new B(null, { status: m, headers: { location: y } });
            }),
              (o.DOMException = a.DOMException));
            try {
              new o.DOMException();
            } catch {
              ((o.DOMException = function (m, $) {
                ((this.message = m), (this.name = $));
                var x = Error(m);
                this.stack = x.stack;
              }),
                (o.DOMException.prototype = Object.create(Error.prototype)),
                (o.DOMException.prototype.constructor = o.DOMException));
            }
            function P(y, m) {
              return new Promise(function ($, x) {
                var S = new D(y, m);
                if (S.signal && S.signal.aborted) return x(new o.DOMException("Aborted", "AbortError"));
                var C = new XMLHttpRequest();
                function k() {
                  C.abort();
                }
                ((C.onload = function () {
                  var L = { statusText: C.statusText, headers: N(C.getAllResponseHeaders() || "") };
                  (S.url.indexOf("file://") === 0 && (C.status < 200 || C.status > 599)
                    ? (L.status = 200)
                    : (L.status = C.status),
                    (L.url = "responseURL" in C ? C.responseURL : L.headers.get("X-Request-URL")));
                  var H = "response" in C ? C.response : C.responseText;
                  setTimeout(function () {
                    $(new B(H, L));
                  }, 0);
                }),
                  (C.onerror = function () {
                    setTimeout(function () {
                      x(new TypeError("Network request failed"));
                    }, 0);
                  }),
                  (C.ontimeout = function () {
                    setTimeout(function () {
                      x(new TypeError("Network request timed out"));
                    }, 0);
                  }),
                  (C.onabort = function () {
                    setTimeout(function () {
                      x(new o.DOMException("Aborted", "AbortError"));
                    }, 0);
                  }));
                function q(L) {
                  try {
                    return L === "" && a.location.href ? a.location.href : L;
                  } catch {
                    return L;
                  }
                }
                if (
                  (C.open(S.method, q(S.url), !0),
                  S.credentials === "include"
                    ? (C.withCredentials = !0)
                    : S.credentials === "omit" && (C.withCredentials = !1),
                  "responseType" in C &&
                    (c.blob ? (C.responseType = "blob") : c.arrayBuffer && (C.responseType = "arraybuffer")),
                  m &&
                    typeof m.headers == "object" &&
                    !(m.headers instanceof g || (a.Headers && m.headers instanceof a.Headers)))
                ) {
                  var z = [];
                  (Object.getOwnPropertyNames(m.headers).forEach(function (L) {
                    (z.push(d(L)), C.setRequestHeader(L, f(m.headers[L])));
                  }),
                    S.headers.forEach(function (L, H) {
                      z.indexOf(H) === -1 && C.setRequestHeader(H, L);
                    }));
                } else
                  S.headers.forEach(function (L, H) {
                    C.setRequestHeader(H, L);
                  });
                (S.signal &&
                  (S.signal.addEventListener("abort", k),
                  (C.onreadystatechange = function () {
                    C.readyState === 4 && S.signal.removeEventListener("abort", k);
                  })),
                  C.send(typeof S._bodyInit > "u" ? null : S._bodyInit));
              });
            }
            return (
              (P.polyfill = !0),
              a.fetch || ((a.fetch = P), (a.Headers = g), (a.Request = D), (a.Response = B)),
              (o.Headers = g),
              (o.Request = D),
              (o.Response = B),
              (o.fetch = P),
              Object.defineProperty(o, "__esModule", { value: !0 }),
              o
            );
          })({});
        })(i),
          (i.fetch.ponyfill = !0),
          delete i.fetch.polyfill);
        var s = t.fetch ? t : i;
        ((e = s.fetch),
          (e.default = s.fetch),
          (e.fetch = s.fetch),
          (e.Headers = s.Headers),
          (e.Request = s.Request),
          (e.Response = s.Response),
          (r.exports = e));
      })(rs, rs.exports)),
    rs.exports
  );
}
var W$ = K$();
const Th = _o(W$);
var G$ = Object.defineProperty,
  Y$ = Object.defineProperties,
  J$ = Object.getOwnPropertyDescriptors,
  Rh = Object.getOwnPropertySymbols,
  Z$ = Object.prototype.hasOwnProperty,
  Q$ = Object.prototype.propertyIsEnumerable,
  Nh = (r, e, t) => (e in r ? G$(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  jh = (r, e) => {
    for (var t in e || (e = {})) Z$.call(e, t) && Nh(r, t, e[t]);
    if (Rh) for (var t of Rh(e)) Q$.call(e, t) && Nh(r, t, e[t]);
    return r;
  },
  Bh = (r, e) => Y$(r, J$(e));
const X$ = { Accept: "application/json", "Content-Type": "application/json" },
  eD = "POST",
  Uh = { headers: X$, method: eD },
  Fh = 10;
let gt = class {
  constructor(e, t = !1) {
    if (
      ((this.url = e),
      (this.disableProviderPing = t),
      (this.events = new Ze.EventEmitter()),
      (this.isAvailable = !1),
      (this.registering = !1),
      !Xc(e))
    )
      throw new Error(`Provided URL is not compatible with HTTP connection: ${e}`);
    ((this.url = e), (this.disableProviderPing = t));
  }
  get connected() {
    return this.isAvailable;
  }
  get connecting() {
    return this.registering;
  }
  on(e, t) {
    this.events.on(e, t);
  }
  once(e, t) {
    this.events.once(e, t);
  }
  off(e, t) {
    this.events.off(e, t);
  }
  removeListener(e, t) {
    this.events.removeListener(e, t);
  }
  async open(e = this.url) {
    await this.register(e);
  }
  async close() {
    if (!this.isAvailable) throw new Error("Connection already closed");
    this.onClose();
  }
  async send(e) {
    this.isAvailable || (await this.register());
    try {
      const t = kt(e),
        i = await (await Th(this.url, Bh(jh({}, Uh), { body: t }))).json();
      this.onPayload({ data: i });
    } catch (t) {
      this.onError(e.id, t);
    }
  }
  async register(e = this.url) {
    if (!Xc(e)) throw new Error(`Provided URL is not compatible with HTTP connection: ${e}`);
    if (this.registering) {
      const t = this.events.getMaxListeners();
      return (
        (this.events.listenerCount("register_error") >= t || this.events.listenerCount("open") >= t) &&
          this.events.setMaxListeners(t + 1),
        new Promise((i, s) => {
          (this.events.once("register_error", (n) => {
            (this.resetMaxListeners(), s(n));
          }),
            this.events.once("open", () => {
              if ((this.resetMaxListeners(), typeof this.isAvailable > "u"))
                return s(new Error("HTTP connection is missing or invalid"));
              i();
            }));
        })
      );
    }
    ((this.url = e), (this.registering = !0));
    try {
      if (!this.disableProviderPing) {
        const t = kt({ id: 1, jsonrpc: "2.0", method: "test", params: [] });
        await Th(e, Bh(jh({}, Uh), { body: t }));
      }
      this.onOpen();
    } catch (t) {
      const i = this.parseError(t);
      throw (this.events.emit("register_error", i), this.onClose(), i);
    }
  }
  onOpen() {
    ((this.isAvailable = !0), (this.registering = !1), this.events.emit("open"));
  }
  onClose() {
    ((this.isAvailable = !1), (this.registering = !1), this.events.emit("close"));
  }
  onPayload(e) {
    if (typeof e.data > "u") return;
    const t = typeof e.data == "string" ? lr(e.data) : e.data;
    this.events.emit("payload", t);
  }
  onError(e, t) {
    const i = this.parseError(t),
      s = i.message || i.toString(),
      n = Ls(e, s);
    this.events.emit("payload", n);
  }
  parseError(e, t = this.url) {
    return Ml(e, t, "HTTP");
  }
  resetMaxListeners() {
    this.events.getMaxListeners() > Fh && this.events.setMaxListeners(Fh);
  }
};
const kh = "error",
  tD = "wss://relay.walletconnect.org",
  rD = "wc",
  iD = "universal_provider",
  is = `${rD}@2:${iD}:`,
  ld = "https://rpc.walletconnect.org/v1/",
  Lr = "generic",
  sD = `${ld}bundler`,
  at = { DEFAULT_CHAIN_CHANGED: "default_chain_changed" };
function nD() {}
function Ho(r) {
  return r == null || (typeof r != "object" && typeof r != "function");
}
function Vo(r) {
  return ArrayBuffer.isView(r) && !(r instanceof DataView);
}
function oD(r) {
  if (Ho(r)) return r;
  if (
    Array.isArray(r) ||
    Vo(r) ||
    r instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer < "u" && r instanceof SharedArrayBuffer)
  )
    return r.slice(0);
  const e = Object.getPrototypeOf(r),
    t = e.constructor;
  if (r instanceof Date || r instanceof Map || r instanceof Set) return new t(r);
  if (r instanceof RegExp) {
    const i = new t(r);
    return ((i.lastIndex = r.lastIndex), i);
  }
  if (r instanceof DataView) return new t(r.buffer.slice(0));
  if (r instanceof Error) {
    const i = new t(r.message);
    return ((i.stack = r.stack), (i.name = r.name), (i.cause = r.cause), i);
  }
  if (typeof File < "u" && r instanceof File) return new t([r], r.name, { type: r.type, lastModified: r.lastModified });
  if (typeof r == "object") {
    const i = Object.create(e);
    return Object.assign(i, r);
  }
  return r;
}
function Lh(r) {
  return typeof r == "object" && r !== null;
}
function dd(r) {
  return Object.getOwnPropertySymbols(r).filter((e) => Object.prototype.propertyIsEnumerable.call(r, e));
}
function pd(r) {
  return r == null ? (r === void 0 ? "[object Undefined]" : "[object Null]") : Object.prototype.toString.call(r);
}
const aD = "[object RegExp]",
  fd = "[object String]",
  gd = "[object Number]",
  yd = "[object Boolean]",
  md = "[object Arguments]",
  cD = "[object Symbol]",
  hD = "[object Date]",
  uD = "[object Map]",
  lD = "[object Set]",
  dD = "[object Array]",
  pD = "[object ArrayBuffer]",
  fD = "[object Object]",
  gD = "[object DataView]",
  yD = "[object Uint8Array]",
  mD = "[object Uint8ClampedArray]",
  wD = "[object Uint16Array]",
  bD = "[object Uint32Array]",
  vD = "[object Int8Array]",
  ED = "[object Int16Array]",
  _D = "[object Int32Array]",
  ID = "[object Float32Array]",
  $D = "[object Float64Array]";
function DD(r, e) {
  return zr(r, void 0, r, new Map(), e);
}
function zr(r, e, t, i = new Map(), s = void 0) {
  const n = s == null ? void 0 : s(r, e, t, i);
  if (n != null) return n;
  if (Ho(r)) return r;
  if (i.has(r)) return i.get(r);
  if (Array.isArray(r)) {
    const o = new Array(r.length);
    i.set(r, o);
    for (let a = 0; a < r.length; a++) o[a] = zr(r[a], a, t, i, s);
    return (Object.hasOwn(r, "index") && (o.index = r.index), Object.hasOwn(r, "input") && (o.input = r.input), o);
  }
  if (r instanceof Date) return new Date(r.getTime());
  if (r instanceof RegExp) {
    const o = new RegExp(r.source, r.flags);
    return ((o.lastIndex = r.lastIndex), o);
  }
  if (r instanceof Map) {
    const o = new Map();
    i.set(r, o);
    for (const [a, c] of r) o.set(a, zr(c, a, t, i, s));
    return o;
  }
  if (r instanceof Set) {
    const o = new Set();
    i.set(r, o);
    for (const a of r) o.add(zr(a, void 0, t, i, s));
    return o;
  }
  if (typeof _e < "u" && _e.isBuffer(r)) return r.subarray();
  if (Vo(r)) {
    const o = new (Object.getPrototypeOf(r).constructor)(r.length);
    i.set(r, o);
    for (let a = 0; a < r.length; a++) o[a] = zr(r[a], a, t, i, s);
    return o;
  }
  if (r instanceof ArrayBuffer || (typeof SharedArrayBuffer < "u" && r instanceof SharedArrayBuffer)) return r.slice(0);
  if (r instanceof DataView) {
    const o = new DataView(r.buffer.slice(0), r.byteOffset, r.byteLength);
    return (i.set(r, o), or(o, r, t, i, s), o);
  }
  if (typeof File < "u" && r instanceof File) {
    const o = new File([r], r.name, { type: r.type });
    return (i.set(r, o), or(o, r, t, i, s), o);
  }
  if (r instanceof Blob) {
    const o = new Blob([r], { type: r.type });
    return (i.set(r, o), or(o, r, t, i, s), o);
  }
  if (r instanceof Error) {
    const o = new r.constructor();
    return (
      i.set(r, o),
      (o.message = r.message),
      (o.name = r.name),
      (o.stack = r.stack),
      (o.cause = r.cause),
      or(o, r, t, i, s),
      o
    );
  }
  if (typeof r == "object" && SD(r)) {
    const o = Object.create(Object.getPrototypeOf(r));
    return (i.set(r, o), or(o, r, t, i, s), o);
  }
  return r;
}
function or(r, e, t = r, i, s) {
  const n = [...Object.keys(e), ...dd(e)];
  for (let o = 0; o < n.length; o++) {
    const a = n[o],
      c = Object.getOwnPropertyDescriptor(r, a);
    (c == null || c.writable) && (r[a] = zr(e[a], a, t, i, s));
  }
}
function SD(r) {
  switch (pd(r)) {
    case md:
    case dD:
    case pD:
    case gD:
    case yd:
    case hD:
    case ID:
    case $D:
    case vD:
    case ED:
    case _D:
    case uD:
    case gd:
    case fD:
    case aD:
    case lD:
    case fd:
    case cD:
    case yD:
    case mD:
    case wD:
    case bD:
      return !0;
    default:
      return !1;
  }
}
function OD(r, e) {
  return DD(r, (t, i, s, n) => {
    if (typeof r == "object")
      switch (Object.prototype.toString.call(r)) {
        case gd:
        case fd:
        case yd: {
          const o = new r.constructor(r == null ? void 0 : r.valueOf());
          return (or(o, r), o);
        }
        case md: {
          const o = {};
          return (or(o, r), (o.length = r.length), (o[Symbol.iterator] = r[Symbol.iterator]), o);
        }
        default:
          return;
      }
  });
}
function qh(r) {
  return OD(r);
}
function Mh(r) {
  return r !== null && typeof r == "object" && pd(r) === "[object Arguments]";
}
function PD(r) {
  return Vo(r);
}
function AD(r) {
  var t;
  if (typeof r != "object" || r == null) return !1;
  if (Object.getPrototypeOf(r) === null) return !0;
  if (Object.prototype.toString.call(r) !== "[object Object]") {
    const i = r[Symbol.toStringTag];
    return i == null || !((t = Object.getOwnPropertyDescriptor(r, Symbol.toStringTag)) != null && t.writable)
      ? !1
      : r.toString() === `[object ${i}]`;
  }
  let e = r;
  for (; Object.getPrototypeOf(e) !== null; ) e = Object.getPrototypeOf(e);
  return Object.getPrototypeOf(r) === e;
}
function xD(r, ...e) {
  const t = e.slice(0, -1),
    i = e[e.length - 1];
  let s = r;
  for (let n = 0; n < t.length; n++) {
    const o = t[n];
    s = wo(s, o, i, new Map());
  }
  return s;
}
function wo(r, e, t, i) {
  if ((Ho(r) && (r = Object(r)), e == null || typeof e != "object")) return r;
  if (i.has(e)) return oD(i.get(e));
  if ((i.set(e, r), Array.isArray(e))) {
    e = e.slice();
    for (let n = 0; n < e.length; n++) e[n] = e[n] ?? void 0;
  }
  const s = [...Object.keys(e), ...dd(e)];
  for (let n = 0; n < s.length; n++) {
    const o = s[n];
    let a = e[o],
      c = r[o];
    if (
      (Mh(a) && (a = { ...a }),
      Mh(c) && (c = { ...c }),
      typeof _e < "u" && _e.isBuffer(a) && (a = qh(a)),
      Array.isArray(a))
    )
      if (typeof c == "object" && c != null) {
        const u = [],
          l = Reflect.ownKeys(c);
        for (let d = 0; d < l.length; d++) {
          const f = l[d];
          u[f] = c[f];
        }
        c = u;
      } else c = [];
    const h = t(c, a, o, r, e, i);
    h != null
      ? (r[o] = h)
      : Array.isArray(a) || (Lh(c) && Lh(a))
        ? (r[o] = wo(c, a, t, i))
        : c == null && AD(a)
          ? (r[o] = wo({}, a, t, i))
          : c == null && PD(a)
            ? (r[o] = qh(a))
            : (c === void 0 || a !== void 0) && (r[o] = a);
  }
  return r;
}
function CD(r, ...e) {
  return xD(r, ...e, nD);
}
var TD = Object.defineProperty,
  RD = Object.defineProperties,
  ND = Object.getOwnPropertyDescriptors,
  zh = Object.getOwnPropertySymbols,
  jD = Object.prototype.hasOwnProperty,
  BD = Object.prototype.propertyIsEnumerable,
  Hh = (r, e, t) => (e in r ? TD(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  ss = (r, e) => {
    for (var t in e || (e = {})) jD.call(e, t) && Hh(r, t, e[t]);
    if (zh) for (var t of zh(e)) BD.call(e, t) && Hh(r, t, e[t]);
    return r;
  },
  UD = (r, e) => RD(r, ND(e));
function Je(r, e, t) {
  var i;
  const s = Hr(r);
  return (
    ((i = e.rpcMap) == null ? void 0 : i[s.reference]) || `${ld}?chainId=${s.namespace}:${s.reference}&projectId=${t}`
  );
}
function br(r) {
  return r.includes(":") ? r.split(":")[1] : r;
}
function wd(r) {
  return r.map((e) => `${e.split(":")[0]}:${e.split(":")[1]}`);
}
function FD(r, e) {
  const t = Object.keys(e.namespaces).filter((s) => s.includes(r));
  if (!t.length) return [];
  const i = [];
  return (
    t.forEach((s) => {
      const n = e.namespaces[s].accounts;
      i.push(...n);
    }),
    i
  );
}
function ns(r = {}, e = {}) {
  const t = Vh(r),
    i = Vh(e);
  return CD(t, i);
}
function Vh(r) {
  var e, t, i, s, n;
  const o = {};
  if (!Yt(r)) return o;
  for (const [a, c] of Object.entries(r)) {
    const h = Us(a) ? [a] : c.chains,
      u = c.methods || [],
      l = c.events || [],
      d = c.rpcMap || {},
      f = Mr(a);
    ((o[f] = UD(ss(ss({}, o[f]), c), {
      chains: Dt(h, (e = o[f]) == null ? void 0 : e.chains),
      methods: Dt(u, (t = o[f]) == null ? void 0 : t.methods),
      events: Dt(l, (i = o[f]) == null ? void 0 : i.events),
    })),
      (Yt(d) || Yt(((s = o[f]) == null ? void 0 : s.rpcMap) || {})) &&
        (o[f].rpcMap = ss(ss({}, d), (n = o[f]) == null ? void 0 : n.rpcMap)));
  }
  return o;
}
function Kh(r) {
  return r.includes(":") ? r.split(":")[2] : r;
}
function Wh(r) {
  const e = {};
  for (const [t, i] of Object.entries(r)) {
    const s = i.methods || [],
      n = i.events || [],
      o = i.accounts || [],
      a = Us(t) ? [t] : i.chains ? i.chains : wd(i.accounts);
    e[t] = { chains: a, methods: s, events: n, accounts: o };
  }
  return e;
}
function Tn(r) {
  return typeof r == "number"
    ? r
    : r.includes("0x")
      ? parseInt(r, 16)
      : ((r = r.includes(":") ? r.split(":")[1] : r), isNaN(Number(r)) ? r : Number(r));
}
const bd = {},
  X = (r) => bd[r],
  Rn = (r, e) => {
    bd[r] = e;
  };
var kD = Object.defineProperty,
  LD = (r, e, t) => (e in r ? kD(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Pr = (r, e, t) => LD(r, typeof e != "symbol" ? e + "" : e, t);
class qD {
  constructor(e) {
    (Pr(this, "name", "polkadot"),
      Pr(this, "client"),
      Pr(this, "httpProviders"),
      Pr(this, "events"),
      Pr(this, "namespace"),
      Pr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${e}`));
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e ? e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]) || [] : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        const s = br(t);
        e[s] = this.createHttpProvider(s, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var MD = Object.defineProperty,
  zD = Object.defineProperties,
  HD = Object.getOwnPropertyDescriptors,
  Gh = Object.getOwnPropertySymbols,
  VD = Object.prototype.hasOwnProperty,
  KD = Object.prototype.propertyIsEnumerable,
  bo = (r, e, t) => (e in r ? MD(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Yh = (r, e) => {
    for (var t in e || (e = {})) VD.call(e, t) && bo(r, t, e[t]);
    if (Gh) for (var t of Gh(e)) KD.call(e, t) && bo(r, t, e[t]);
    return r;
  },
  Jh = (r, e) => zD(r, HD(e)),
  Ar = (r, e, t) => bo(r, typeof e != "symbol" ? e + "" : e, t);
class WD {
  constructor(e) {
    (Ar(this, "name", "eip155"),
      Ar(this, "client"),
      Ar(this, "chainId"),
      Ar(this, "namespace"),
      Ar(this, "httpProviders"),
      Ar(this, "events"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.httpProviders = this.createHttpProviders()),
      (this.chainId = parseInt(this.getDefaultChain())));
  }
  async request(e) {
    switch (e.request.method) {
      case "eth_requestAccounts":
        return this.getAccounts();
      case "eth_accounts":
        return this.getAccounts();
      case "wallet_switchEthereumChain":
        return await this.handleSwitchChain(e);
      case "eth_chainId":
        return parseInt(this.getDefaultChain());
      case "wallet_getCapabilities":
        return await this.getCapabilities(e);
      case "wallet_getCallsStatus":
        return await this.getCallStatus(e);
    }
    return this.namespace.methods.includes(e.request.method)
      ? await this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(parseInt(e), t),
      (this.chainId = parseInt(e)),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${e}`));
  }
  requestAccounts() {
    return this.getAccounts();
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId.toString();
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  createHttpProvider(e, t) {
    const i = t || Je(`${this.name}:${e}`, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        const s = parseInt(br(t));
        e[s] = this.createHttpProvider(s, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  getHttpProvider() {
    const e = this.chainId,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  async handleSwitchChain(e) {
    var t, i;
    let s = e.request.params ? ((t = e.request.params[0]) == null ? void 0 : t.chainId) : "0x0";
    s = s.startsWith("0x") ? s : `0x${s}`;
    const n = parseInt(s, 16);
    if (this.isChainApproved(n)) this.setDefaultChain(`${n}`);
    else if (this.namespace.methods.includes("wallet_switchEthereumChain"))
      (await this.client.request({
        topic: e.topic,
        request: { method: e.request.method, params: [{ chainId: s }] },
        chainId: (i = this.namespace.chains) == null ? void 0 : i[0],
      }),
        this.setDefaultChain(`${n}`));
    else
      throw new Error(
        `Failed to switch to chain 'eip155:${n}'. The chain is not approved or the wallet does not support 'wallet_switchEthereumChain' method.`,
      );
    return null;
  }
  isChainApproved(e) {
    return this.namespace.chains.includes(`${this.name}:${e}`);
  }
  async getCapabilities(e) {
    var t, i, s, n, o;
    const a = (i = (t = e.request) == null ? void 0 : t.params) == null ? void 0 : i[0],
      c = ((n = (s = e.request) == null ? void 0 : s.params) == null ? void 0 : n[1]) || [],
      h = `${a}${c.join(",")}`;
    if (!a) throw new Error("Missing address parameter in `wallet_getCapabilities` request");
    const u = this.client.session.get(e.topic),
      l = ((o = u == null ? void 0 : u.sessionProperties) == null ? void 0 : o.capabilities) || {};
    if (l != null && l[h]) return l == null ? void 0 : l[h];
    const d = await this.client.request(e);
    try {
      await this.client.session.update(e.topic, {
        sessionProperties: Jh(Yh({}, u.sessionProperties || {}), { capabilities: Jh(Yh({}, l || {}), { [h]: d }) }),
      });
    } catch (f) {
      console.warn("Failed to update session with capabilities", f);
    }
    return d;
  }
  async getCallStatus(e) {
    var t, i;
    const s = this.client.session.get(e.topic),
      n = (t = s.sessionProperties) == null ? void 0 : t.bundler_name;
    if (n) {
      const a = this.getBundlerUrl(e.chainId, n);
      try {
        return await this.getUserOperationReceipt(a, e);
      } catch (c) {
        console.warn("Failed to fetch call status from bundler", c, a);
      }
    }
    const o = (i = s.sessionProperties) == null ? void 0 : i.bundler_url;
    if (o)
      try {
        return await this.getUserOperationReceipt(o, e);
      } catch (a) {
        console.warn("Failed to fetch call status from custom bundler", a, o);
      }
    if (this.namespace.methods.includes(e.request.method)) return await this.client.request(e);
    throw new Error("Fetching call status not approved by the wallet.");
  }
  async getUserOperationReceipt(e, t) {
    var i;
    const s = new URL(e),
      n = await fetch(s, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Wt("eth_getUserOperationReceipt", [(i = t.request.params) == null ? void 0 : i[0]])),
      });
    if (!n.ok) throw new Error(`Failed to fetch user operation receipt - ${n.status}`);
    return await n.json();
  }
  getBundlerUrl(e, t) {
    return `${sD}?projectId=${this.client.core.projectId}&chainId=${e}&bundler=${t}`;
  }
}
var GD = Object.defineProperty,
  YD = (r, e, t) => (e in r ? GD(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  xr = (r, e, t) => YD(r, typeof e != "symbol" ? e + "" : e, t);
class JD {
  constructor(e) {
    (xr(this, "name", "solana"),
      xr(this, "client"),
      xr(this, "httpProviders"),
      xr(this, "events"),
      xr(this, "namespace"),
      xr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${e}`));
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        const s = br(t);
        e[s] = this.createHttpProvider(s, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var ZD = Object.defineProperty,
  QD = (r, e, t) => (e in r ? ZD(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Cr = (r, e, t) => QD(r, typeof e != "symbol" ? e + "" : e, t);
class XD {
  constructor(e) {
    (Cr(this, "name", "cosmos"),
      Cr(this, "client"),
      Cr(this, "httpProviders"),
      Cr(this, "events"),
      Cr(this, "namespace"),
      Cr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${this.chainId}`));
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        const s = br(t);
        e[s] = this.createHttpProvider(s, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var eS = Object.defineProperty,
  tS = (r, e, t) => (e in r ? eS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Tr = (r, e, t) => tS(r, typeof e != "symbol" ? e + "" : e, t);
class rS {
  constructor(e) {
    (Tr(this, "name", "algorand"),
      Tr(this, "client"),
      Tr(this, "httpProviders"),
      Tr(this, "events"),
      Tr(this, "namespace"),
      Tr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    if (!this.httpProviders[e]) {
      const i = t || Je(`${this.name}:${e}`, this.namespace, this.client.core.projectId);
      if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
      this.setHttpProvider(e, i);
    }
    ((this.chainId = e), this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${this.chainId}`));
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        e[t] = this.createHttpProvider(t, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    return typeof i > "u" ? void 0 : new ot(new gt(i, X("disableProviderPing")));
  }
}
var iS = Object.defineProperty,
  sS = (r, e, t) => (e in r ? iS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Rr = (r, e, t) => sS(r, typeof e != "symbol" ? e + "" : e, t);
class nS {
  constructor(e) {
    (Rr(this, "name", "cip34"),
      Rr(this, "client"),
      Rr(this, "httpProviders"),
      Rr(this, "events"),
      Rr(this, "namespace"),
      Rr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${this.chainId}`));
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        const i = this.getCardanoRPCUrl(t),
          s = br(t);
        e[s] = this.createHttpProvider(s, i);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  getCardanoRPCUrl(e) {
    const t = this.namespace.rpcMap;
    if (t) return t[e];
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || this.getCardanoRPCUrl(e);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var oS = Object.defineProperty,
  aS = (r, e, t) => (e in r ? oS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Nr = (r, e, t) => aS(r, typeof e != "symbol" ? e + "" : e, t);
class cS {
  constructor(e) {
    (Nr(this, "name", "elrond"),
      Nr(this, "client"),
      Nr(this, "httpProviders"),
      Nr(this, "events"),
      Nr(this, "namespace"),
      Nr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${e}`));
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        const s = br(t);
        e[s] = this.createHttpProvider(s, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var hS = Object.defineProperty,
  uS = (r, e, t) => (e in r ? hS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  jr = (r, e, t) => uS(r, typeof e != "symbol" ? e + "" : e, t);
class lS {
  constructor(e) {
    (jr(this, "name", "multiversx"),
      jr(this, "client"),
      jr(this, "httpProviders"),
      jr(this, "events"),
      jr(this, "namespace"),
      jr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${e}`));
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        const s = br(t);
        e[s] = this.createHttpProvider(s, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var dS = Object.defineProperty,
  pS = (r, e, t) => (e in r ? dS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Br = (r, e, t) => pS(r, typeof e != "symbol" ? e + "" : e, t);
class fS {
  constructor(e) {
    (Br(this, "name", "near"),
      Br(this, "client"),
      Br(this, "httpProviders"),
      Br(this, "events"),
      Br(this, "namespace"),
      Br(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    if (((this.chainId = e), !this.httpProviders[e])) {
      const i = t || Je(`${this.name}:${e}`, this.namespace);
      if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
      this.setHttpProvider(e, i);
    }
    this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${this.chainId}`);
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e ? e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]) || [] : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        var i;
        e[t] = this.createHttpProvider(t, (i = this.namespace.rpcMap) == null ? void 0 : i[t]);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace);
    return typeof i > "u" ? void 0 : new ot(new gt(i, X("disableProviderPing")));
  }
}
var gS = Object.defineProperty,
  yS = (r, e, t) => (e in r ? gS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Ur = (r, e, t) => yS(r, typeof e != "symbol" ? e + "" : e, t);
class mS {
  constructor(e) {
    (Ur(this, "name", "tezos"),
      Ur(this, "client"),
      Ur(this, "httpProviders"),
      Ur(this, "events"),
      Ur(this, "namespace"),
      Ur(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    this.namespace = Object.assign(this.namespace, e);
  }
  requestAccounts() {
    return this.getAccounts();
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider().request(e.request);
  }
  setDefaultChain(e, t) {
    if (((this.chainId = e), !this.httpProviders[e])) {
      const i = t || Je(`${this.name}:${e}`, this.namespace);
      if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
      this.setHttpProvider(e, i);
    }
    this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${this.chainId}`);
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e ? e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]) || [] : [];
  }
  createHttpProviders() {
    const e = {};
    return (
      this.namespace.chains.forEach((t) => {
        e[t] = this.createHttpProvider(t);
      }),
      e
    );
  }
  getHttpProvider() {
    const e = `${this.name}:${this.chainId}`,
      t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace);
    return typeof i > "u" ? void 0 : new ot(new gt(i));
  }
}
var wS = Object.defineProperty,
  bS = (r, e, t) => (e in r ? wS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Fr = (r, e, t) => bS(r, typeof e != "symbol" ? e + "" : e, t);
class vS {
  constructor(e) {
    (Fr(this, "name", Lr),
      Fr(this, "client"),
      Fr(this, "httpProviders"),
      Fr(this, "events"),
      Fr(this, "namespace"),
      Fr(this, "chainId"),
      (this.namespace = e.namespace),
      (this.events = X("events")),
      (this.client = X("client")),
      (this.chainId = this.getDefaultChain()),
      (this.httpProviders = this.createHttpProviders()));
  }
  updateNamespace(e) {
    ((this.namespace.chains = [...new Set((this.namespace.chains || []).concat(e.chains || []))]),
      (this.namespace.accounts = [...new Set((this.namespace.accounts || []).concat(e.accounts || []))]),
      (this.namespace.methods = [...new Set((this.namespace.methods || []).concat(e.methods || []))]),
      (this.namespace.events = [...new Set((this.namespace.events || []).concat(e.events || []))]),
      (this.httpProviders = this.createHttpProviders()));
  }
  requestAccounts() {
    return this.getAccounts();
  }
  request(e) {
    return this.namespace.methods.includes(e.request.method)
      ? this.client.request(e)
      : this.getHttpProvider(e.chainId).request(e.request);
  }
  setDefaultChain(e, t) {
    (this.httpProviders[e] || this.setHttpProvider(e, t),
      (this.chainId = e),
      this.events.emit(at.DEFAULT_CHAIN_CHANGED, `${this.name}:${e}`));
  }
  getDefaultChain() {
    if (this.chainId) return this.chainId;
    if (this.namespace.defaultChain) return this.namespace.defaultChain;
    const e = this.namespace.chains[0];
    if (!e) throw new Error("ChainId not found");
    return e.split(":")[1];
  }
  getAccounts() {
    const e = this.namespace.accounts;
    return e
      ? [...new Set(e.filter((t) => t.split(":")[1] === this.chainId.toString()).map((t) => t.split(":")[2]))]
      : [];
  }
  createHttpProviders() {
    var e, t;
    const i = {};
    return (
      (t = (e = this.namespace) == null ? void 0 : e.accounts) == null ||
        t.forEach((s) => {
          const n = Hr(s);
          i[`${n.namespace}:${n.reference}`] = this.createHttpProvider(s);
        }),
      i
    );
  }
  getHttpProvider(e) {
    const t = this.httpProviders[e];
    if (typeof t > "u") throw new Error(`JSON-RPC provider for ${e} not found`);
    return t;
  }
  setHttpProvider(e, t) {
    const i = this.createHttpProvider(e, t);
    i && (this.httpProviders[e] = i);
  }
  createHttpProvider(e, t) {
    const i = t || Je(e, this.namespace, this.client.core.projectId);
    if (!i) throw new Error(`No RPC url provided for chainId: ${e}`);
    return new ot(new gt(i, X("disableProviderPing")));
  }
}
var ES = Object.defineProperty,
  _S = Object.defineProperties,
  IS = Object.getOwnPropertyDescriptors,
  Zh = Object.getOwnPropertySymbols,
  $S = Object.prototype.hasOwnProperty,
  DS = Object.prototype.propertyIsEnumerable,
  vo = (r, e, t) => (e in r ? ES(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  os = (r, e) => {
    for (var t in e || (e = {})) $S.call(e, t) && vo(r, t, e[t]);
    if (Zh) for (var t of Zh(e)) DS.call(e, t) && vo(r, t, e[t]);
    return r;
  },
  Nn = (r, e) => _S(r, IS(e)),
  tt = (r, e, t) => vo(r, typeof e != "symbol" ? e + "" : e, t);
let SS = class vd {
  constructor(e) {
    (tt(this, "client"),
      tt(this, "namespaces"),
      tt(this, "optionalNamespaces"),
      tt(this, "sessionProperties"),
      tt(this, "scopedProperties"),
      tt(this, "events", new Io()),
      tt(this, "rpcProviders", {}),
      tt(this, "session"),
      tt(this, "providerOpts"),
      tt(this, "logger"),
      tt(this, "uri"),
      tt(this, "disableProviderPing", !1),
      (this.providerOpts = e),
      (this.logger =
        typeof (e == null ? void 0 : e.logger) < "u" && typeof (e == null ? void 0 : e.logger) != "string"
          ? e.logger
          : Mi(Fs({ level: (e == null ? void 0 : e.logger) || kh }))),
      (this.disableProviderPing = (e == null ? void 0 : e.disableProviderPing) || !1));
  }
  static async init(e) {
    const t = new vd(e);
    return (await t.initialize(), t);
  }
  async request(e, t, i) {
    const [s, n] = this.validateChain(t);
    if (!this.session) throw new Error("Please call connect() before request()");
    return await this.getProvider(s).request({
      request: os({}, e),
      chainId: `${s}:${n}`,
      topic: this.session.topic,
      expiry: i,
    });
  }
  sendAsync(e, t, i, s) {
    const n = new Date().getTime();
    this.request(e, i, s)
      .then((o) => t(null, ks(n, o)))
      .catch((o) => t(o, void 0));
  }
  async enable() {
    if (!this.client) throw new Error("Sign Client not initialized");
    return (
      this.session ||
        (await this.connect({
          namespaces: this.namespaces,
          optionalNamespaces: this.optionalNamespaces,
          sessionProperties: this.sessionProperties,
          scopedProperties: this.scopedProperties,
        })),
      await this.requestAccounts()
    );
  }
  async disconnect() {
    var e;
    if (!this.session) throw new Error("Please call connect() before enable()");
    (await this.client.disconnect({
      topic: (e = this.session) == null ? void 0 : e.topic,
      reason: re("USER_DISCONNECTED"),
    }),
      await this.cleanup());
  }
  async connect(e) {
    if (!this.client) throw new Error("Sign Client not initialized");
    if ((this.setNamespaces(e), await this.cleanupPendingPairings(), !e.skipPairing))
      return await this.pair(e.pairingTopic);
  }
  async authenticate(e, t) {
    if (!this.client) throw new Error("Sign Client not initialized");
    (this.setNamespaces(e), await this.cleanupPendingPairings());
    const { uri: i, response: s } = await this.client.authenticate(e, t);
    i && ((this.uri = i), this.events.emit("display_uri", i));
    const n = await s();
    if (((this.session = n.session), this.session)) {
      const o = Wh(this.session.namespaces);
      ((this.namespaces = ns(this.namespaces, o)), await this.persist("namespaces", this.namespaces), this.onConnect());
    }
    return n;
  }
  on(e, t) {
    this.events.on(e, t);
  }
  once(e, t) {
    this.events.once(e, t);
  }
  removeListener(e, t) {
    this.events.removeListener(e, t);
  }
  off(e, t) {
    this.events.off(e, t);
  }
  get isWalletConnect() {
    return !0;
  }
  async pair(e) {
    const { uri: t, approval: i } = await this.client.connect({
      pairingTopic: e,
      requiredNamespaces: this.namespaces,
      optionalNamespaces: this.optionalNamespaces,
      sessionProperties: this.sessionProperties,
      scopedProperties: this.scopedProperties,
    });
    t && ((this.uri = t), this.events.emit("display_uri", t));
    const s = await i();
    this.session = s;
    const n = Wh(s.namespaces);
    return (
      (this.namespaces = ns(this.namespaces, n)),
      await this.persist("namespaces", this.namespaces),
      await this.persist("optionalNamespaces", this.optionalNamespaces),
      this.onConnect(),
      this.session
    );
  }
  setDefaultChain(e, t) {
    try {
      if (!this.session) return;
      const [i, s] = this.validateChain(e),
        n = this.getProvider(i);
      n.name === Lr ? n.setDefaultChain(`${i}:${s}`, t) : n.setDefaultChain(s, t);
    } catch (i) {
      if (!/Please call connect/.test(i.message)) throw i;
    }
  }
  async cleanupPendingPairings(e = {}) {
    this.logger.info("Cleaning up inactive pairings...");
    const t = this.client.pairing.getAll();
    if (ft(t)) {
      for (const i of t)
        e.deletePairings
          ? this.client.core.expirer.set(i.topic, 0)
          : await this.client.core.relayer.subscriber.unsubscribe(i.topic);
      this.logger.info(`Inactive pairings cleared: ${t.length}`);
    }
  }
  abortPairingAttempt() {
    this.logger.warn("abortPairingAttempt is deprecated. This is now a no-op.");
  }
  async checkStorage() {
    ((this.namespaces = (await this.getFromStore("namespaces")) || {}),
      (this.optionalNamespaces = (await this.getFromStore("optionalNamespaces")) || {}),
      this.session && this.createProviders());
  }
  async initialize() {
    (this.logger.trace("Initialized"),
      await this.createClient(),
      await this.checkStorage(),
      this.registerEventListeners());
  }
  async createClient() {
    var e, t;
    if (
      ((this.client =
        this.providerOpts.client ||
        (await V$.init({
          core: this.providerOpts.core,
          logger: this.providerOpts.logger || kh,
          relayUrl: this.providerOpts.relayUrl || tD,
          projectId: this.providerOpts.projectId,
          metadata: this.providerOpts.metadata,
          storageOptions: this.providerOpts.storageOptions,
          storage: this.providerOpts.storage,
          name: this.providerOpts.name,
          customStoragePrefix: this.providerOpts.customStoragePrefix,
          telemetryEnabled: this.providerOpts.telemetryEnabled,
        }))),
      this.providerOpts.session)
    )
      try {
        this.session = this.client.session.get(this.providerOpts.session.topic);
      } catch (i) {
        throw (
          this.logger.error("Failed to get session", i),
          new Error(
            `The provided session: ${(t = (e = this.providerOpts) == null ? void 0 : e.session) == null ? void 0 : t.topic} doesn't exist in the Sign client`,
          )
        );
      }
    else {
      const i = this.client.session.getAll();
      this.session = i[0];
    }
    this.logger.trace("SignClient Initialized");
  }
  createProviders() {
    if (!this.client) throw new Error("Sign Client not initialized");
    if (!this.session) throw new Error("Session not initialized. Please call connect() before enable()");
    const e = [...new Set(Object.keys(this.session.namespaces).map((t) => Mr(t)))];
    (Rn("client", this.client),
      Rn("events", this.events),
      Rn("disableProviderPing", this.disableProviderPing),
      e.forEach((t) => {
        if (!this.session) return;
        const i = FD(t, this.session),
          s = wd(i),
          n = ns(this.namespaces, this.optionalNamespaces),
          o = Nn(os({}, n[t]), { accounts: i, chains: s });
        switch (t) {
          case "eip155":
            this.rpcProviders[t] = new WD({ namespace: o });
            break;
          case "algorand":
            this.rpcProviders[t] = new rS({ namespace: o });
            break;
          case "solana":
            this.rpcProviders[t] = new JD({ namespace: o });
            break;
          case "cosmos":
            this.rpcProviders[t] = new XD({ namespace: o });
            break;
          case "polkadot":
            this.rpcProviders[t] = new qD({ namespace: o });
            break;
          case "cip34":
            this.rpcProviders[t] = new nS({ namespace: o });
            break;
          case "elrond":
            this.rpcProviders[t] = new cS({ namespace: o });
            break;
          case "multiversx":
            this.rpcProviders[t] = new lS({ namespace: o });
            break;
          case "near":
            this.rpcProviders[t] = new fS({ namespace: o });
            break;
          case "tezos":
            this.rpcProviders[t] = new mS({ namespace: o });
            break;
          default:
            this.rpcProviders[Lr]
              ? this.rpcProviders[Lr].updateNamespace(o)
              : (this.rpcProviders[Lr] = new vS({ namespace: o }));
        }
      }));
  }
  registerEventListeners() {
    if (typeof this.client > "u") throw new Error("Sign Client is not initialized");
    (this.client.on("session_ping", (e) => {
      var t;
      const { topic: i } = e;
      i === ((t = this.session) == null ? void 0 : t.topic) && this.events.emit("session_ping", e);
    }),
      this.client.on("session_event", (e) => {
        var t;
        const { params: i, topic: s } = e;
        if (s !== ((t = this.session) == null ? void 0 : t.topic)) return;
        const { event: n } = i;
        if (n.name === "accountsChanged") {
          const o = n.data;
          o && ft(o) && this.events.emit("accountsChanged", o.map(Kh));
        } else if (n.name === "chainChanged") {
          const o = i.chainId,
            a = i.event.data,
            c = Mr(o),
            h = Tn(o) !== Tn(a) ? `${c}:${Tn(a)}` : o;
          this.onChainChanged(h);
        } else this.events.emit(n.name, n.data);
        this.events.emit("session_event", e);
      }),
      this.client.on("session_update", ({ topic: e, params: t }) => {
        var i, s;
        if (e !== ((i = this.session) == null ? void 0 : i.topic)) return;
        const { namespaces: n } = t,
          o = (s = this.client) == null ? void 0 : s.session.get(e);
        ((this.session = Nn(os({}, o), { namespaces: n })),
          this.onSessionUpdate(),
          this.events.emit("session_update", { topic: e, params: t }));
      }),
      this.client.on("session_delete", async (e) => {
        var t;
        e.topic === ((t = this.session) == null ? void 0 : t.topic) &&
          (await this.cleanup(),
          this.events.emit("session_delete", e),
          this.events.emit("disconnect", Nn(os({}, re("USER_DISCONNECTED")), { data: e.topic })));
      }),
      this.on(at.DEFAULT_CHAIN_CHANGED, (e) => {
        this.onChainChanged(e, !0);
      }));
  }
  getProvider(e) {
    return this.rpcProviders[e] || this.rpcProviders[Lr];
  }
  onSessionUpdate() {
    Object.keys(this.rpcProviders).forEach((e) => {
      var t;
      this.getProvider(e).updateNamespace((t = this.session) == null ? void 0 : t.namespaces[e]);
    });
  }
  setNamespaces(e) {
    const { namespaces: t = {}, optionalNamespaces: i = {}, sessionProperties: s, scopedProperties: n } = e;
    ((this.optionalNamespaces = ns(t, i)), (this.sessionProperties = s), (this.scopedProperties = n));
  }
  validateChain(e) {
    const [t, i] = (e == null ? void 0 : e.split(":")) || ["", ""];
    if (!this.namespaces || !Object.keys(this.namespaces).length) return [t, i];
    if (
      t &&
      !Object.keys(this.namespaces || {})
        .map((o) => Mr(o))
        .includes(t)
    )
      throw new Error(`Namespace '${t}' is not configured. Please call connect() first with namespace config.`);
    if (t && i) return [t, i];
    const s = Mr(Object.keys(this.namespaces)[0]),
      n = this.rpcProviders[s].getDefaultChain();
    return [s, n];
  }
  async requestAccounts() {
    const [e] = this.validateChain();
    return await this.getProvider(e).requestAccounts();
  }
  async onChainChanged(e, t = !1) {
    if (!this.namespaces) return;
    const [i, s] = this.validateChain(e);
    if (!s) return;
    (this.updateNamespaceChain(i, s), this.events.emit("chainChanged", s));
    const n = this.getProvider(i).getDefaultChain();
    (t || this.getProvider(i).setDefaultChain(s),
      this.emitAccountsChangedOnChainChange({ namespace: i, previousChainId: n, newChainId: e }),
      await this.persist("namespaces", this.namespaces));
  }
  emitAccountsChangedOnChainChange({ namespace: e, previousChainId: t, newChainId: i }) {
    var s, n;
    try {
      if (t === i) return;
      const o = (n = (s = this.session) == null ? void 0 : s.namespaces[e]) == null ? void 0 : n.accounts;
      if (!o) return;
      const a = o.filter((c) => c.includes(`${i}:`)).map(Kh);
      if (!ft(a)) return;
      this.events.emit("accountsChanged", a);
    } catch (o) {
      this.logger.warn("Failed to emit accountsChanged on chain change", o);
    }
  }
  updateNamespaceChain(e, t) {
    if (!this.namespaces) return;
    const i = this.namespaces[e] ? e : `${e}:${t}`,
      s = { chains: [], methods: [], events: [], defaultChain: t };
    this.namespaces[i] ? this.namespaces[i] && (this.namespaces[i].defaultChain = t) : (this.namespaces[i] = s);
  }
  onConnect() {
    (this.createProviders(), this.events.emit("connect", { session: this.session }));
  }
  async cleanup() {
    ((this.namespaces = void 0),
      (this.optionalNamespaces = void 0),
      (this.sessionProperties = void 0),
      await this.deleteFromStore("namespaces"),
      await this.deleteFromStore("optionalNamespaces"),
      await this.deleteFromStore("sessionProperties"),
      (this.session = void 0),
      await this.cleanupPendingPairings({ deletePairings: !0 }),
      await this.cleanupStorage());
  }
  async persist(e, t) {
    var i;
    const s = ((i = this.session) == null ? void 0 : i.topic) || "";
    await this.client.core.storage.setItem(`${is}/${e}${s}`, t);
  }
  async getFromStore(e) {
    var t;
    const i = ((t = this.session) == null ? void 0 : t.topic) || "";
    return await this.client.core.storage.getItem(`${is}/${e}${i}`);
  }
  async deleteFromStore(e) {
    var t;
    const i = ((t = this.session) == null ? void 0 : t.topic) || "";
    await this.client.core.storage.removeItem(`${is}/${e}${i}`);
  }
  async cleanupStorage() {
    var e;
    try {
      if (((e = this.client) == null ? void 0 : e.session.length) > 0) return;
      const t = await this.client.core.storage.getKeys();
      for (const i of t) i.startsWith(is) && (await this.client.core.storage.removeItem(i));
    } catch (t) {
      this.logger.warn("Failed to cleanup storage", t);
    }
  }
};
const OS = SS,
  PS = "wc",
  AS = "ethereum_provider",
  xS = `${PS}@2:${AS}:`,
  CS = "https://rpc.walletconnect.org/v1/",
  $s = ["eth_sendTransaction", "personal_sign"],
  Ed = [
    "eth_accounts",
    "eth_requestAccounts",
    "eth_sendRawTransaction",
    "eth_sign",
    "eth_signTransaction",
    "eth_signTypedData",
    "eth_signTypedData_v3",
    "eth_signTypedData_v4",
    "eth_sendTransaction",
    "personal_sign",
    "wallet_switchEthereumChain",
    "wallet_addEthereumChain",
    "wallet_getPermissions",
    "wallet_requestPermissions",
    "wallet_registerOnboarding",
    "wallet_watchAsset",
    "wallet_scanQRCode",
    "wallet_sendCalls",
    "wallet_getCapabilities",
    "wallet_getCallsStatus",
    "wallet_showCallsStatus",
  ],
  Ds = ["chainChanged", "accountsChanged"],
  _d = ["chainChanged", "accountsChanged", "message", "disconnect", "connect"],
  TS = async () => {
    const { createAppKit: r } = await tu(
      () => import("./core-CcnASMk0.js").then((e) => e.G),
      __vite__mapDeps([4, 1, 2]),
    );
    return r;
  };
var RS = Object.defineProperty,
  NS = Object.defineProperties,
  jS = Object.getOwnPropertyDescriptors,
  Qh = Object.getOwnPropertySymbols,
  BS = Object.prototype.hasOwnProperty,
  US = Object.prototype.propertyIsEnumerable,
  Eo = (r, e, t) => (e in r ? RS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  rr = (r, e) => {
    for (var t in e || (e = {})) BS.call(e, t) && Eo(r, t, e[t]);
    if (Qh) for (var t of Qh(e)) US.call(e, t) && Eo(r, t, e[t]);
    return r;
  },
  mi = (r, e) => NS(r, jS(e)),
  Ve = (r, e, t) => Eo(r, typeof e != "symbol" ? e + "" : e, t);
function Ss(r) {
  return Number(r[0].split(":")[1]);
}
function as(r) {
  return `0x${r.toString(16)}`;
}
function FS(r) {
  const { chains: e, optionalChains: t, methods: i, optionalMethods: s, events: n, optionalEvents: o, rpcMap: a } = r;
  if (!ft(e)) throw new Error("Invalid chains");
  const c = { chains: e, methods: i || $s, events: n || Ds, rpcMap: rr({}, e.length ? { [Ss(e)]: a[Ss(e)] } : {}) },
    h = n == null ? void 0 : n.filter((f) => !Ds.includes(f)),
    u = i == null ? void 0 : i.filter((f) => !$s.includes(f));
  if (!t && !o && !s && !(h != null && h.length) && !(u != null && u.length))
    return { required: e.length ? c : void 0 };
  const l = ((h == null ? void 0 : h.length) && (u == null ? void 0 : u.length)) || !t,
    d = {
      chains: [...new Set(l ? c.chains.concat(t || []) : t)],
      methods: [...new Set(c.methods.concat(s != null && s.length ? s : Ed))],
      events: [...new Set(c.events.concat(o != null && o.length ? o : _d))],
      rpcMap: a,
    };
  return { required: e.length ? c : void 0, optional: t.length ? d : void 0 };
}
class Hs {
  constructor() {
    (Ve(this, "events", new Ze.EventEmitter()),
      Ve(this, "namespace", "eip155"),
      Ve(this, "accounts", []),
      Ve(this, "signer"),
      Ve(this, "chainId", 1),
      Ve(this, "modal"),
      Ve(this, "rpc"),
      Ve(this, "STORAGE_KEY", xS),
      Ve(this, "on", (e, t) => (this.events.on(e, t), this)),
      Ve(this, "once", (e, t) => (this.events.once(e, t), this)),
      Ve(this, "removeListener", (e, t) => (this.events.removeListener(e, t), this)),
      Ve(this, "off", (e, t) => (this.events.off(e, t), this)),
      Ve(this, "parseAccount", (e) => (this.isCompatibleChainId(e) ? this.parseAccountId(e).address : e)),
      (this.signer = {}),
      (this.rpc = {}));
  }
  static async init(e) {
    const t = new Hs();
    return (await t.initialize(e), t);
  }
  async request(e, t) {
    return await this.signer.request(e, this.formatChainId(this.chainId), t);
  }
  sendAsync(e, t, i) {
    this.signer.sendAsync(e, t, this.formatChainId(this.chainId), i);
  }
  get connected() {
    return this.signer.client ? this.signer.client.core.relayer.connected : !1;
  }
  get connecting() {
    return this.signer.client ? this.signer.client.core.relayer.connecting : !1;
  }
  async enable() {
    return (this.session || (await this.connect()), await this.request({ method: "eth_requestAccounts" }));
  }
  async connect(e) {
    var t;
    if (!this.signer.client) throw new Error("Provider not initialized. Call init() first");
    this.loadConnectOpts(e);
    const { required: i, optional: s } = FS(this.rpc);
    try {
      const n = await new Promise(async (a, c) => {
        var h, u;
        this.rpc.showQrModal &&
          ((h = this.modal) == null || h.open(),
          (u = this.modal) == null ||
            u.subscribeState((d) => {
              !d.open &&
                !this.signer.session &&
                (this.signer.abortPairingAttempt(), c(new Error("Connection request reset. Please try again.")));
            }));
        const l = e != null && e.scopedProperties ? { [this.namespace]: e.scopedProperties } : void 0;
        await this.signer
          .connect(
            mi(
              rr(
                { namespaces: rr({}, i && { [this.namespace]: i }) },
                s && { optionalNamespaces: { [this.namespace]: s } },
              ),
              { pairingTopic: e == null ? void 0 : e.pairingTopic, scopedProperties: l },
            ),
          )
          .then((d) => {
            a(d);
          })
          .catch((d) => {
            var f;
            ((f = this.modal) == null || f.showErrorMessage("Unable to connect"), c(new Error(d.message)));
          });
      });
      if (!n) return;
      const o = Va(n.namespaces, [this.namespace]);
      (this.setChainIds(this.rpc.chains.length ? this.rpc.chains : o),
        this.setAccounts(o),
        this.events.emit("connect", { chainId: as(this.chainId) }));
    } catch (n) {
      throw (this.signer.logger.error(n), n);
    } finally {
      (t = this.modal) == null || t.close();
    }
  }
  async authenticate(e, t) {
    var i;
    if (!this.signer.client) throw new Error("Provider not initialized. Call init() first");
    this.loadConnectOpts({ chains: e == null ? void 0 : e.chains });
    try {
      const s = await new Promise(async (o, a) => {
          var c, h;
          (this.rpc.showQrModal &&
            ((c = this.modal) == null || c.open(),
            (h = this.modal) == null ||
              h.subscribeState((u) => {
                !u.open &&
                  !this.signer.session &&
                  (this.signer.abortPairingAttempt(), a(new Error("Connection request reset. Please try again.")));
              })),
            await this.signer
              .authenticate(mi(rr({}, e), { chains: this.rpc.chains }), t)
              .then((u) => {
                o(u);
              })
              .catch((u) => {
                var l;
                ((l = this.modal) == null || l.showErrorMessage("Unable to connect"), a(new Error(u.message)));
              }));
        }),
        n = s.session;
      if (n) {
        const o = Va(n.namespaces, [this.namespace]);
        (this.setChainIds(this.rpc.chains.length ? this.rpc.chains : o),
          this.setAccounts(o),
          this.events.emit("connect", { chainId: as(this.chainId) }));
      }
      return s;
    } catch (s) {
      throw (this.signer.logger.error(s), s);
    } finally {
      (i = this.modal) == null || i.close();
    }
  }
  async disconnect() {
    (this.session && (await this.signer.disconnect()), this.reset());
  }
  get isWalletConnect() {
    return !0;
  }
  get session() {
    return this.signer.session;
  }
  registerEventListeners() {
    (this.signer.on("session_event", (e) => {
      const { params: t } = e,
        { event: i } = t;
      (i.name === "accountsChanged"
        ? ((this.accounts = this.parseAccounts(i.data)), this.events.emit("accountsChanged", this.accounts))
        : i.name === "chainChanged"
          ? this.setChainId(this.formatChainId(i.data))
          : this.events.emit(i.name, i.data),
        this.events.emit("session_event", e));
    }),
      this.signer.on("accountsChanged", (e) => {
        ((this.accounts = this.parseAccounts(e)), this.events.emit("accountsChanged", this.accounts));
      }),
      this.signer.on("chainChanged", (e) => {
        const t = parseInt(e);
        ((this.chainId = t), this.events.emit("chainChanged", as(this.chainId)), this.persist());
      }),
      this.signer.on("session_update", (e) => {
        this.events.emit("session_update", e);
      }),
      this.signer.on("session_delete", (e) => {
        (this.reset(),
          this.events.emit("session_delete", e),
          this.events.emit(
            "disconnect",
            mi(rr({}, re("USER_DISCONNECTED")), { data: e.topic, name: "USER_DISCONNECTED" }),
          ));
      }),
      this.signer.on("display_uri", (e) => {
        this.events.emit("display_uri", e);
      }));
  }
  switchEthereumChain(e) {
    this.request({ method: "wallet_switchEthereumChain", params: [{ chainId: e.toString(16) }] });
  }
  isCompatibleChainId(e) {
    return typeof e == "string" ? e.startsWith(`${this.namespace}:`) : !1;
  }
  formatChainId(e) {
    return `${this.namespace}:${e}`;
  }
  parseChainId(e) {
    return Number(e.split(":")[1]);
  }
  setChainIds(e) {
    const t = e.filter((i) => this.isCompatibleChainId(i)).map((i) => this.parseChainId(i));
    t.length && ((this.chainId = t[0]), this.events.emit("chainChanged", as(this.chainId)), this.persist());
  }
  setChainId(e) {
    if (this.isCompatibleChainId(e)) {
      const t = this.parseChainId(e);
      ((this.chainId = t), this.switchEthereumChain(t));
    }
  }
  parseAccountId(e) {
    const [t, i, s] = e.split(":");
    return { chainId: `${t}:${i}`, address: s };
  }
  setAccounts(e) {
    ((this.accounts = e
      .filter((t) => this.parseChainId(this.parseAccountId(t).chainId) === this.chainId)
      .map((t) => this.parseAccountId(t).address)),
      this.events.emit("accountsChanged", this.accounts));
  }
  getRpcConfig(e) {
    var t, i;
    const s = (t = e == null ? void 0 : e.chains) != null ? t : [],
      n = (i = e == null ? void 0 : e.optionalChains) != null ? i : [],
      o = s.concat(n);
    if (!o.length) throw new Error("No chains specified in either `chains` or `optionalChains`");
    const a = s.length ? (e == null ? void 0 : e.methods) || $s : [],
      c = s.length ? (e == null ? void 0 : e.events) || Ds : [],
      h = (e == null ? void 0 : e.optionalMethods) || [],
      u = (e == null ? void 0 : e.optionalEvents) || [],
      l = (e == null ? void 0 : e.rpcMap) || this.buildRpcMap(o, e.projectId),
      d = (e == null ? void 0 : e.qrModalOptions) || void 0;
    return {
      chains: s == null ? void 0 : s.map((f) => this.formatChainId(f)),
      optionalChains: n.map((f) => this.formatChainId(f)),
      methods: a,
      events: c,
      optionalMethods: h,
      optionalEvents: u,
      rpcMap: l,
      showQrModal: !!(e != null && e.showQrModal),
      qrModalOptions: d,
      projectId: e.projectId,
      metadata: e.metadata,
    };
  }
  buildRpcMap(e, t) {
    const i = {};
    return (
      e.forEach((s) => {
        i[s] = this.getRpcUrl(s, t);
      }),
      i
    );
  }
  async initialize(e) {
    if (
      ((this.rpc = this.getRpcConfig(e)),
      (this.chainId = this.rpc.chains.length ? Ss(this.rpc.chains) : Ss(this.rpc.optionalChains)),
      (this.signer = await OS.init({
        projectId: this.rpc.projectId,
        metadata: this.rpc.metadata,
        disableProviderPing: e.disableProviderPing,
        relayUrl: e.relayUrl,
        storage: e.storage,
        storageOptions: e.storageOptions,
        customStoragePrefix: e.customStoragePrefix,
        telemetryEnabled: e.telemetryEnabled,
        logger: e.logger,
      })),
      this.registerEventListeners(),
      await this.loadPersistedSession(),
      this.rpc.showQrModal)
    ) {
      let t;
      try {
        const i = await TS(),
          { convertWCMToAppKitOptions: s } = await Promise.resolve().then(function () {
            return YS;
          }),
          n = s(
            mi(rr({}, this.rpc.qrModalOptions), {
              chains: [...new Set([...this.rpc.chains, ...this.rpc.optionalChains])],
              metadata: this.rpc.metadata,
              projectId: this.rpc.projectId,
            }),
          );
        if (!n.networks.length) throw new Error("No networks found for WalletConnect·");
        t = i(mi(rr({}, n), { universalProvider: this.signer, manualWCControl: !0 }));
      } catch (i) {
        throw (console.warn(i), new Error("To use QR modal, please install @reown/appkit package"));
      }
      if (t)
        try {
          this.modal = t;
        } catch (i) {
          throw (this.signer.logger.error(i), new Error("Could not generate WalletConnectModal Instance"));
        }
    }
  }
  loadConnectOpts(e) {
    if (!e) return;
    const { chains: t, optionalChains: i, rpcMap: s } = e;
    (t &&
      ft(t) &&
      ((this.rpc.chains = t.map((n) => this.formatChainId(n))),
      t.forEach((n) => {
        this.rpc.rpcMap[n] = (s == null ? void 0 : s[n]) || this.getRpcUrl(n);
      })),
      i &&
        ft(i) &&
        ((this.rpc.optionalChains = []),
        (this.rpc.optionalChains = i == null ? void 0 : i.map((n) => this.formatChainId(n))),
        i.forEach((n) => {
          this.rpc.rpcMap[n] = (s == null ? void 0 : s[n]) || this.getRpcUrl(n);
        })));
  }
  getRpcUrl(e, t) {
    var i;
    return (
      ((i = this.rpc.rpcMap) == null ? void 0 : i[e]) ||
      `${CS}?chainId=eip155:${e}&projectId=${t || this.rpc.projectId}`
    );
  }
  async loadPersistedSession() {
    if (this.session)
      try {
        const e = await this.signer.client.core.storage.getItem(`${this.STORAGE_KEY}/chainId`),
          t = this.session.namespaces[`${this.namespace}:${e}`]
            ? this.session.namespaces[`${this.namespace}:${e}`]
            : this.session.namespaces[this.namespace];
        (this.setChainIds(e ? [this.formatChainId(e)] : t == null ? void 0 : t.accounts),
          this.setAccounts(t == null ? void 0 : t.accounts));
      } catch (e) {
        (this.signer.logger.error("Failed to load persisted session, clearing state..."),
          this.signer.logger.error(e),
          await this.disconnect().catch((t) => this.signer.logger.warn(t)));
      }
  }
  reset() {
    ((this.chainId = 1), (this.accounts = []));
  }
  persist() {
    this.session && this.signer.client.core.storage.setItem(`${this.STORAGE_KEY}/chainId`, this.chainId);
  }
  parseAccounts(e) {
    return typeof e == "string" || e instanceof String ? [this.parseAccount(e)] : e.map((t) => this.parseAccount(t));
  }
}
const kS = Hs;
var LS = Object.defineProperty,
  qS = Object.defineProperties,
  MS = Object.getOwnPropertyDescriptors,
  Xh = Object.getOwnPropertySymbols,
  zS = Object.prototype.hasOwnProperty,
  HS = Object.prototype.propertyIsEnumerable,
  eu = (r, e, t) => (e in r ? LS(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (r[e] = t)),
  Id = (r, e) => {
    for (var t in e || (e = {})) zS.call(e, t) && eu(r, t, e[t]);
    if (Xh) for (var t of Xh(e)) HS.call(e, t) && eu(r, t, e[t]);
    return r;
  },
  VS = (r, e) => qS(r, MS(e));
function KS(r) {
  if (r)
    return {
      "--w3m-font-family": r["--wcm-font-family"],
      "--w3m-accent": r["--wcm-accent-color"],
      "--w3m-color-mix": r["--wcm-background-color"],
      "--w3m-z-index": r["--wcm-z-index"] ? Number(r["--wcm-z-index"]) : void 0,
      "--w3m-qr-color": r["--wcm-accent-color"],
      "--w3m-font-size-master": r["--wcm-text-medium-regular-size"],
      "--w3m-border-radius-master": r["--wcm-container-border-radius"],
      "--w3m-color-mix-strength": 0,
    };
}
const WS = (r) => {
  const [e, t] = r.split(":");
  return $d({
    id: t,
    caipNetworkId: r,
    chainNamespace: e,
    name: "",
    nativeCurrency: { name: "", symbol: "", decimals: 8 },
    rpcUrls: { default: { http: ["https://rpc.walletconnect.org/v1"] } },
  });
};
function GS(r) {
  var e, t, i, s, n, o, a;
  const c = (e = r.chains) == null ? void 0 : e.map(WS).filter(Boolean);
  if (c.length === 0) throw new Error("At least one chain must be specified");
  const h = c.find((l) => {
      var d;
      return l.id === ((d = r.defaultChain) == null ? void 0 : d.id);
    }),
    u = {
      projectId: r.projectId,
      networks: c,
      themeMode: r.themeMode,
      themeVariables: KS(r.themeVariables),
      chainImages: r.chainImages,
      connectorImages: r.walletImages,
      defaultNetwork: h,
      metadata: VS(Id({}, r.metadata), {
        name: ((t = r.metadata) == null ? void 0 : t.name) || "WalletConnect",
        description:
          ((i = r.metadata) == null ? void 0 : i.description) || "Connect to WalletConnect-compatible wallets",
        url: ((s = r.metadata) == null ? void 0 : s.url) || "https://walletconnect.org",
        icons: ((n = r.metadata) == null ? void 0 : n.icons) || ["https://walletconnect.org/walletconnect-logo.png"],
      }),
      showWallets: !0,
      featuredWalletIds:
        r.explorerRecommendedWalletIds === "NONE"
          ? []
          : Array.isArray(r.explorerRecommendedWalletIds)
            ? r.explorerRecommendedWalletIds
            : [],
      excludeWalletIds:
        r.explorerExcludedWalletIds === "ALL"
          ? []
          : Array.isArray(r.explorerExcludedWalletIds)
            ? r.explorerExcludedWalletIds
            : [],
      enableEIP6963: !1,
      enableInjected: !1,
      enableCoinbase: !0,
      enableWalletConnect: !0,
      features: { email: !1, socials: !1 },
    };
  if (((o = r.mobileWallets) != null && o.length) || ((a = r.desktopWallets) != null && a.length)) {
    const l = [
        ...(r.mobileWallets || []).map((p) => ({ id: p.id, name: p.name, links: p.links })),
        ...(r.desktopWallets || []).map((p) => ({
          id: p.id,
          name: p.name,
          links: { native: p.links.native, universal: p.links.universal },
        })),
      ],
      d = [...(u.featuredWalletIds || []), ...(u.excludeWalletIds || [])],
      f = l.filter((p) => !d.includes(p.id));
    f.length && (u.customWallets = f);
  }
  return u;
}
function $d(r) {
  return Id({ formatters: void 0, fees: void 0, serializers: void 0 }, r);
}
var YS = Object.freeze({ __proto__: null, convertWCMToAppKitOptions: GS, defineChain: $d });
const LO = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      EthereumProvider: kS,
      OPTIONAL_EVENTS: _d,
      OPTIONAL_METHODS: Ed,
      REQUIRED_EVENTS: Ds,
      REQUIRED_METHODS: $s,
      default: Hs,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
export {
  V1 as A,
  mr as B,
  hw as C,
  ot as D,
  Be as E,
  NE as F,
  Mo as G,
  ef as H,
  yr as I,
  qs as J,
  ks as K,
  dm as L,
  kt as M,
  Io as N,
  Mi as O,
  Ma as P,
  Ku as Q,
  lr as R,
  cr as S,
  Ls as T,
  _t as U,
  it as V,
  Et as W,
  gt as X,
  LO as Y,
  ma as a,
  Hp as b,
  XS as c,
  QS as d,
  Os as e,
  rO as f,
  tO as g,
  Ap as h,
  st as i,
  Me as j,
  U as k,
  Ft as l,
  Wd as m,
  vi as n,
  vf as o,
  mf as p,
  Ze as q,
  eO as r,
  Vn as s,
  pu as t,
  Fs as u,
  X0 as v,
  tf as w,
  P1 as x,
  ze as y,
  Wt as z,
};
