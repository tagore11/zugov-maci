import { o as al, x as bv, n as mv } from "./index-myL0f5cF.js";
import { r as hv } from "./index-BV8s6ez1.js";
import { r as yv } from "./events-DQ172AOg.js";
function pv(e, r) {
  for (var n = 0; n < r.length; n++) {
    const t = r[n];
    if (typeof t != "string" && !Array.isArray(t)) {
      for (const o in t)
        if (o !== "default" && !(o in e)) {
          const s = Object.getOwnPropertyDescriptor(t, o);
          s && Object.defineProperty(e, o, s.get ? s : { enumerable: !0, get: () => t[o] });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
function gv() {
  if (typeof WebSocket < "u") return WebSocket;
  if (typeof al.WebSocket < "u") return al.WebSocket;
  if (typeof window.WebSocket < "u") return window.WebSocket;
  if (typeof self.WebSocket < "u") return self.WebSocket;
  throw new Error("`WebSocket` is not supported in this environment");
}
const _v = gv(),
  vv = Object.freeze(
    Object.defineProperty({ __proto__: null, WebSocket: _v }, Symbol.toStringTag, { value: "Module" }),
  );
var pd = {},
  On = {},
  xt = {},
  Kr = {},
  jr = {},
  xn = {},
  Cn = {},
  sl;
function Gp() {
  if (sl) return Cn;
  ((sl = 1), Object.defineProperty(Cn, "__esModule", { value: !0 }), (Cn.getSDKVersion = void 0));
  const e = () => "9.1.0";
  return ((Cn.getSDKVersion = e), Cn);
}
var qn = {},
  cl;
function Ev() {
  if (cl) return qn;
  ((cl = 1), Object.defineProperty(qn, "__esModule", { value: !0 }), (qn.generateRequestId = void 0));
  const e = (t) => t.toString(16).padStart(2, "0"),
    r = (t) => {
      const o = new Uint8Array(t / 2);
      return (window.crypto.getRandomValues(o), Array.from(o, e).join(""));
    },
    n = () => (typeof window < "u" ? r(10) : new Date().getTime().toString(36));
  return ((qn.generateRequestId = n), qn);
}
var ul;
function Vp() {
  if (ul) return xn;
  ((ul = 1), Object.defineProperty(xn, "__esModule", { value: !0 }), (xn.MessageFormatter = void 0));
  const e = Gp(),
    r = Ev();
  class n {}
  return (
    (xn.MessageFormatter = n),
    (n.makeRequest = (t, o) => ({
      id: (0, r.generateRequestId)(),
      method: t,
      params: o,
      env: { sdkVersion: (0, e.getSDKVersion)() },
    })),
    (n.makeResponse = (t, o, s) => ({ id: t, success: !0, version: s, data: o })),
    (n.makeErrorResponse = (t, o, s) => ({ id: t, success: !1, error: o, version: s })),
    xn
  );
}
var wr = {},
  dl;
function Fr() {
  if (dl) return wr;
  ((dl = 1), Object.defineProperty(wr, "__esModule", { value: !0 }), (wr.RestrictedMethods = wr.Methods = void 0));
  var e;
  (function (n) {
    ((n.sendTransactions = "sendTransactions"),
      (n.rpcCall = "rpcCall"),
      (n.getChainInfo = "getChainInfo"),
      (n.getSafeInfo = "getSafeInfo"),
      (n.getTxBySafeTxHash = "getTxBySafeTxHash"),
      (n.getSafeBalances = "getSafeBalances"),
      (n.signMessage = "signMessage"),
      (n.signTypedMessage = "signTypedMessage"),
      (n.getEnvironmentInfo = "getEnvironmentInfo"),
      (n.getOffChainSignature = "getOffChainSignature"),
      (n.requestAddressBook = "requestAddressBook"),
      (n.wallet_getPermissions = "wallet_getPermissions"),
      (n.wallet_requestPermissions = "wallet_requestPermissions"));
  })(e || (wr.Methods = e = {}));
  var r;
  return (
    (function (n) {
      n.requestAddressBook = "requestAddressBook";
    })(r || (wr.RestrictedMethods = r = {})),
    wr
  );
}
var fl;
function jv() {
  return (
    fl ||
      ((fl = 1),
      (function (e) {
        var r =
            (jr && jr.__createBinding) ||
            (Object.create
              ? function (s, i, a, c) {
                  c === void 0 && (c = a);
                  var u = Object.getOwnPropertyDescriptor(i, a);
                  ((!u || ("get" in u ? !i.__esModule : u.writable || u.configurable)) &&
                    (u = {
                      enumerable: !0,
                      get: function () {
                        return i[a];
                      },
                    }),
                    Object.defineProperty(s, c, u));
                }
              : function (s, i, a, c) {
                  (c === void 0 && (c = a), (s[c] = i[a]));
                }),
          n =
            (jr && jr.__exportStar) ||
            function (s, i) {
              for (var a in s) a !== "default" && !Object.prototype.hasOwnProperty.call(i, a) && r(i, s, a);
            };
        Object.defineProperty(e, "__esModule", { value: !0 });
        const t = Vp();
        class o {
          constructor(i = null, a = !1) {
            ((this.allowedOrigins = null),
              (this.callbacks = new Map()),
              (this.debugMode = !1),
              (this.isServer = typeof window > "u"),
              (this.isValidMessage = ({ origin: c, data: u, source: l }) => {
                const f = !u,
                  m = !this.isServer && l === window.parent,
                  g = typeof u.version < "u" && parseInt(u.version.split(".")[0]),
                  h = typeof g == "number" && g >= 1;
                let b = !0;
                return (
                  Array.isArray(this.allowedOrigins) && (b = this.allowedOrigins.find((v) => v.test(c)) !== void 0),
                  !f && m && h && b
                );
              }),
              (this.logIncomingMessage = (c) => {
                console.info(`Safe Apps SDK v1: A message was received from origin ${c.origin}. `, c.data);
              }),
              (this.onParentMessage = (c) => {
                this.isValidMessage(c) &&
                  (this.debugMode && this.logIncomingMessage(c), this.handleIncomingMessage(c.data));
              }),
              (this.handleIncomingMessage = (c) => {
                const { id: u } = c,
                  l = this.callbacks.get(u);
                l && (l(c), this.callbacks.delete(u));
              }),
              (this.send = (c, u) => {
                const l = t.MessageFormatter.makeRequest(c, u);
                if (this.isServer) throw new Error("Window doesn't exist");
                return (
                  window.parent.postMessage(l, "*"),
                  new Promise((f, m) => {
                    this.callbacks.set(l.id, (g) => {
                      if (!g.success) {
                        m(new Error(g.error));
                        return;
                      }
                      f(g);
                    });
                  })
                );
              }),
              (this.allowedOrigins = i),
              (this.debugMode = a),
              this.isServer || window.addEventListener("message", this.onParentMessage));
          }
        }
        ((e.default = o), n(Fr(), e));
      })(jr)),
    jr
  );
}
var Mn = {},
  Pr = {},
  Hn = {},
  ll;
function wv() {
  if (ll) return Hn;
  ((ll = 1), Object.defineProperty(Hn, "__esModule", { value: !0 }), (Hn.isObjectEIP712TypedData = void 0));
  const e = (r) => typeof r == "object" && r != null && "domain" in r && "types" in r && "message" in r;
  return ((Hn.isObjectEIP712TypedData = e), Hn);
}
var gd = {},
  bl;
function Pv() {
  return (bl || ((bl = 1), Object.defineProperty(gd, "__esModule", { value: !0 })), gd);
}
var _d = {},
  ml;
function Av() {
  return (
    ml ||
      ((ml = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.TransferDirection = e.TransactionStatus = e.TokenType = e.Operation = void 0));
        var r = hv();
        (Object.defineProperty(e, "Operation", {
          enumerable: !0,
          get: function () {
            return r.Operation;
          },
        }),
          Object.defineProperty(e, "TokenType", {
            enumerable: !0,
            get: function () {
              return r.TokenType;
            },
          }),
          Object.defineProperty(e, "TransactionStatus", {
            enumerable: !0,
            get: function () {
              return r.TransactionStatus;
            },
          }),
          Object.defineProperty(e, "TransferDirection", {
            enumerable: !0,
            get: function () {
              return r.TransferDirection;
            },
          }));
      })(_d)),
    _d
  );
}
var vd = {},
  hl;
function Tv() {
  return (hl || ((hl = 1), Object.defineProperty(vd, "__esModule", { value: !0 }), Fr()), vd);
}
var yl;
function Kd() {
  return (
    yl ||
      ((yl = 1),
      (function (e) {
        var r =
            (Pr && Pr.__createBinding) ||
            (Object.create
              ? function (t, o, s, i) {
                  i === void 0 && (i = s);
                  var a = Object.getOwnPropertyDescriptor(o, s);
                  ((!a || ("get" in a ? !o.__esModule : a.writable || a.configurable)) &&
                    (a = {
                      enumerable: !0,
                      get: function () {
                        return o[s];
                      },
                    }),
                    Object.defineProperty(t, i, a));
                }
              : function (t, o, s, i) {
                  (i === void 0 && (i = s), (t[i] = o[s]));
                }),
          n =
            (Pr && Pr.__exportStar) ||
            function (t, o) {
              for (var s in t) s !== "default" && !Object.prototype.hasOwnProperty.call(o, s) && r(o, t, s);
            };
        (Object.defineProperty(e, "__esModule", { value: !0 }), n(wv(), e), n(Pv(), e), n(Av(), e), n(Tv(), e));
      })(Pr)),
    Pr
  );
}
var pl;
function Sv() {
  if (pl) return Mn;
  ((pl = 1), Object.defineProperty(Mn, "__esModule", { value: !0 }), (Mn.TXs = void 0));
  const e = Fr(),
    r = Kd();
  class n {
    constructor(o) {
      this.communicator = o;
    }
    async getBySafeTxHash(o) {
      if (!o) throw new Error("Invalid safeTxHash");
      return (await this.communicator.send(e.Methods.getTxBySafeTxHash, { safeTxHash: o })).data;
    }
    async signMessage(o) {
      const s = { message: o };
      return (await this.communicator.send(e.Methods.signMessage, s)).data;
    }
    async signTypedMessage(o) {
      if (!(0, r.isObjectEIP712TypedData)(o)) throw new Error("Invalid typed data");
      return (await this.communicator.send(e.Methods.signTypedMessage, { typedData: o })).data;
    }
    async send({ txs: o, params: s }) {
      if (!o || !o.length) throw new Error("No transactions were passed");
      const i = { txs: o, params: s };
      return (await this.communicator.send(e.Methods.sendTransactions, i)).data;
    }
  }
  return ((Mn.TXs = n), Mn);
}
var kn = {},
  Fn = {},
  gl;
function Zd() {
  return (
    gl ||
      ((gl = 1),
      Object.defineProperty(Fn, "__esModule", { value: !0 }),
      (Fn.RPC_CALLS = void 0),
      (Fn.RPC_CALLS = {
        eth_call: "eth_call",
        eth_gasPrice: "eth_gasPrice",
        eth_getLogs: "eth_getLogs",
        eth_getBalance: "eth_getBalance",
        eth_getCode: "eth_getCode",
        eth_getBlockByHash: "eth_getBlockByHash",
        eth_getBlockByNumber: "eth_getBlockByNumber",
        eth_getStorageAt: "eth_getStorageAt",
        eth_getTransactionByHash: "eth_getTransactionByHash",
        eth_getTransactionReceipt: "eth_getTransactionReceipt",
        eth_getTransactionCount: "eth_getTransactionCount",
        eth_estimateGas: "eth_estimateGas",
        safe_setSettings: "safe_setSettings",
      })),
    Fn
  );
}
var _l;
function Iv() {
  if (_l) return kn;
  ((_l = 1), Object.defineProperty(kn, "__esModule", { value: !0 }), (kn.Eth = void 0));
  const e = Zd(),
    r = Fr(),
    n = {
      defaultBlockParam: (o = "latest") => o,
      returnFullTxObjectParam: (o = !1) => o,
      blockNumberToHex: (o) => (Number.isInteger(o) ? `0x${o.toString(16)}` : o),
    };
  class t {
    constructor(s) {
      ((this.communicator = s),
        (this.call = this.buildRequest({ call: e.RPC_CALLS.eth_call, formatters: [null, n.defaultBlockParam] })),
        (this.getBalance = this.buildRequest({
          call: e.RPC_CALLS.eth_getBalance,
          formatters: [null, n.defaultBlockParam],
        })),
        (this.getCode = this.buildRequest({ call: e.RPC_CALLS.eth_getCode, formatters: [null, n.defaultBlockParam] })),
        (this.getStorageAt = this.buildRequest({
          call: e.RPC_CALLS.eth_getStorageAt,
          formatters: [null, n.blockNumberToHex, n.defaultBlockParam],
        })),
        (this.getPastLogs = this.buildRequest({ call: e.RPC_CALLS.eth_getLogs })),
        (this.getBlockByHash = this.buildRequest({
          call: e.RPC_CALLS.eth_getBlockByHash,
          formatters: [null, n.returnFullTxObjectParam],
        })),
        (this.getBlockByNumber = this.buildRequest({
          call: e.RPC_CALLS.eth_getBlockByNumber,
          formatters: [n.blockNumberToHex, n.returnFullTxObjectParam],
        })),
        (this.getTransactionByHash = this.buildRequest({ call: e.RPC_CALLS.eth_getTransactionByHash })),
        (this.getTransactionReceipt = this.buildRequest({ call: e.RPC_CALLS.eth_getTransactionReceipt })),
        (this.getTransactionCount = this.buildRequest({
          call: e.RPC_CALLS.eth_getTransactionCount,
          formatters: [null, n.defaultBlockParam],
        })),
        (this.getGasPrice = this.buildRequest({ call: e.RPC_CALLS.eth_gasPrice })),
        (this.getEstimateGas = (i) => this.buildRequest({ call: e.RPC_CALLS.eth_estimateGas })([i])),
        (this.setSafeSettings = this.buildRequest({ call: e.RPC_CALLS.safe_setSettings })));
    }
    buildRequest(s) {
      const { call: i, formatters: a } = s;
      return async (c) => {
        a &&
          Array.isArray(c) &&
          a.forEach((f, m) => {
            f && (c[m] = f(c[m]));
          });
        const u = { call: i, params: c || [] };
        return (await this.communicator.send(r.Methods.rpcCall, u)).data;
      };
    }
  }
  return ((kn.Eth = t), kn);
}
var Ct = {},
  Ed = {},
  jd = {},
  Nn = {},
  $n = {},
  vl;
function Rv() {
  return (
    vl ||
      ((vl = 1), Object.defineProperty($n, "__esModule", { value: !0 }), ($n.version = void 0), ($n.version = "1.2.3")),
    $n
  );
}
var El;
function pn() {
  if (El) return Nn;
  ((El = 1), Object.defineProperty(Nn, "__esModule", { value: !0 }), (Nn.BaseError = void 0));
  const e = Rv();
  class r extends Error {
    constructor(t, o = {}) {
      var c;
      const s =
          o.cause instanceof r ? o.cause.details : (c = o.cause) != null && c.message ? o.cause.message : o.details,
        i = (o.cause instanceof r && o.cause.docsPath) || o.docsPath,
        a = [
          t || "An error occurred.",
          "",
          ...(o.metaMessages ? [...o.metaMessages, ""] : []),
          ...(i ? [`Docs: https://abitype.dev${i}`] : []),
          ...(s ? [`Details: ${s}`] : []),
          `Version: abitype@${e.version}`,
        ].join(`
`);
      (super(a),
        Object.defineProperty(this, "details", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "docsPath", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "metaMessages", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "shortMessage", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "name", { enumerable: !0, configurable: !0, writable: !0, value: "AbiTypeError" }),
        o.cause && (this.cause = o.cause),
        (this.details = s),
        (this.docsPath = i),
        (this.metaMessages = o.metaMessages),
        (this.shortMessage = t));
    }
  }
  return ((Nn.BaseError = r), Nn);
}
var di = {},
  jl;
function Bv() {
  if (jl) return di;
  ((jl = 1), Object.defineProperty(di, "__esModule", { value: !0 }), (di.narrow = e));
  function e(r) {
    return r;
  }
  return di;
}
var fi = {},
  li = {},
  bi = {},
  mi = {},
  Tt = {},
  wl;
function Pu() {
  if (wl) return Tt;
  ((wl = 1),
    Object.defineProperty(Tt, "__esModule", { value: !0 }),
    (Tt.isTupleRegex = Tt.integerRegex = Tt.bytesRegex = void 0),
    (Tt.execTyped = e));
  function e(r, n) {
    const t = r.exec(n);
    return t == null ? void 0 : t.groups;
  }
  return (
    (Tt.bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/),
    (Tt.integerRegex =
      /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/),
    (Tt.isTupleRegex = /^\(.+?\).*?$/),
    Tt
  );
}
var Pl;
function Wp() {
  if (Pl) return mi;
  ((Pl = 1), Object.defineProperty(mi, "__esModule", { value: !0 }), (mi.formatAbiParameter = n));
  const e = Pu(),
    r = /^tuple(?<array>(\[(\d*)\])*)$/;
  function n(t) {
    let o = t.type;
    if (r.test(t.type) && "components" in t) {
      o = "(";
      const s = t.components.length;
      for (let a = 0; a < s; a++) {
        const c = t.components[a];
        ((o += n(c)), a < s - 1 && (o += ", "));
      }
      const i = (0, e.execTyped)(r, t.type);
      return ((o += `)${(i == null ? void 0 : i.array) || ""}`), n({ ...t, type: o }));
    }
    return ("indexed" in t && t.indexed && (o = `${o} indexed`), t.name ? `${o} ${t.name}` : o);
  }
  return mi;
}
var Al;
function Kp() {
  if (Al) return bi;
  ((Al = 1), Object.defineProperty(bi, "__esModule", { value: !0 }), (bi.formatAbiParameters = r));
  const e = Wp();
  function r(n) {
    let t = "";
    const o = n.length;
    for (let s = 0; s < o; s++) {
      const i = n[s];
      ((t += (0, e.formatAbiParameter)(i)), s !== o - 1 && (t += ", "));
    }
    return t;
  }
  return bi;
}
var Tl;
function Zp() {
  if (Tl) return li;
  ((Tl = 1), Object.defineProperty(li, "__esModule", { value: !0 }), (li.formatAbiItem = r));
  const e = Kp();
  function r(n) {
    var t;
    return n.type === "function"
      ? `function ${n.name}(${(0, e.formatAbiParameters)(n.inputs)})${n.stateMutability && n.stateMutability !== "nonpayable" ? ` ${n.stateMutability}` : ""}${(t = n.outputs) != null && t.length ? ` returns (${(0, e.formatAbiParameters)(n.outputs)})` : ""}`
      : n.type === "event"
        ? `event ${n.name}(${(0, e.formatAbiParameters)(n.inputs)})`
        : n.type === "error"
          ? `error ${n.name}(${(0, e.formatAbiParameters)(n.inputs)})`
          : n.type === "constructor"
            ? `constructor(${(0, e.formatAbiParameters)(n.inputs)})${n.stateMutability === "payable" ? " payable" : ""}`
            : n.type === "fallback"
              ? `fallback() external${n.stateMutability === "payable" ? " payable" : ""}`
              : "receive() external payable";
  }
  return li;
}
var Sl;
function Ov() {
  if (Sl) return fi;
  ((Sl = 1), Object.defineProperty(fi, "__esModule", { value: !0 }), (fi.formatAbi = r));
  const e = Zp();
  function r(n) {
    const t = [],
      o = n.length;
    for (let s = 0; s < o; s++) {
      const i = n[s],
        a = (0, e.formatAbiItem)(i);
      t.push(a);
    }
    return t;
  }
  return fi;
}
var hi = {},
  Re = {},
  Il;
function gn() {
  if (Il) return Re;
  ((Il = 1),
    Object.defineProperty(Re, "__esModule", { value: !0 }),
    (Re.functionModifiers = Re.eventModifiers = Re.modifiers = void 0),
    (Re.isErrorSignature = n),
    (Re.execErrorSignature = t),
    (Re.isEventSignature = s),
    (Re.execEventSignature = i),
    (Re.isFunctionSignature = c),
    (Re.execFunctionSignature = u),
    (Re.isStructSignature = f),
    (Re.execStructSignature = m),
    (Re.isConstructorSignature = h),
    (Re.execConstructorSignature = b),
    (Re.isFallbackSignature = _),
    (Re.execFallbackSignature = E),
    (Re.isReceiveSignature = d));
  const e = Pu(),
    r = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
  function n(j) {
    return r.test(j);
  }
  function t(j) {
    return (0, e.execTyped)(r, j);
  }
  const o = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
  function s(j) {
    return o.test(j);
  }
  function i(j) {
    return (0, e.execTyped)(o, j);
  }
  const a =
    /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
  function c(j) {
    return a.test(j);
  }
  function u(j) {
    return (0, e.execTyped)(a, j);
  }
  const l = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
  function f(j) {
    return l.test(j);
  }
  function m(j) {
    return (0, e.execTyped)(l, j);
  }
  const g = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
  function h(j) {
    return g.test(j);
  }
  function b(j) {
    return (0, e.execTyped)(g, j);
  }
  const v = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
  function _(j) {
    return v.test(j);
  }
  function E(j) {
    return (0, e.execTyped)(v, j);
  }
  const P = /^receive\(\) external payable$/;
  function d(j) {
    return P.test(j);
  }
  return (
    (Re.modifiers = new Set(["memory", "indexed", "storage", "calldata"])),
    (Re.eventModifiers = new Set(["indexed"])),
    (Re.functionModifiers = new Set(["calldata", "memory", "storage"])),
    Re
  );
}
var yi = {},
  qt = {},
  Rl;
function Au() {
  if (Rl) return qt;
  ((Rl = 1),
    Object.defineProperty(qt, "__esModule", { value: !0 }),
    (qt.UnknownSolidityTypeError = qt.UnknownTypeError = qt.InvalidAbiItemError = void 0));
  const e = pn();
  class r extends e.BaseError {
    constructor({ signature: s }) {
      (super("Failed to parse ABI item.", {
        details: `parseAbiItem(${JSON.stringify(s, null, 2)})`,
        docsPath: "/api/human#parseabiitem-1",
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidAbiItemError",
        }));
    }
  }
  qt.InvalidAbiItemError = r;
  class n extends e.BaseError {
    constructor({ type: s }) {
      (super("Unknown type.", {
        metaMessages: [`Type "${s}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "UnknownTypeError",
        }));
    }
  }
  qt.UnknownTypeError = n;
  class t extends e.BaseError {
    constructor({ type: s }) {
      (super("Unknown type.", { metaMessages: [`Type "${s}" is not a valid ABI type.`] }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "UnknownSolidityTypeError",
        }));
    }
  }
  return ((qt.UnknownSolidityTypeError = t), qt);
}
var ke = {},
  Bl;
function Co() {
  if (Bl) return ke;
  ((Bl = 1),
    Object.defineProperty(ke, "__esModule", { value: !0 }),
    (ke.InvalidAbiTypeParameterError =
      ke.InvalidFunctionModifierError =
      ke.InvalidModifierError =
      ke.SolidityProtectedKeywordError =
      ke.InvalidParameterError =
      ke.InvalidAbiParametersError =
      ke.InvalidAbiParameterError =
        void 0));
  const e = pn();
  class r extends e.BaseError {
    constructor({ param: u }) {
      (super("Failed to parse ABI parameter.", {
        details: `parseAbiParameter(${JSON.stringify(u, null, 2)})`,
        docsPath: "/api/human#parseabiparameter-1",
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidAbiParameterError",
        }));
    }
  }
  ke.InvalidAbiParameterError = r;
  class n extends e.BaseError {
    constructor({ params: u }) {
      (super("Failed to parse ABI parameters.", {
        details: `parseAbiParameters(${JSON.stringify(u, null, 2)})`,
        docsPath: "/api/human#parseabiparameters-1",
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidAbiParametersError",
        }));
    }
  }
  ke.InvalidAbiParametersError = n;
  class t extends e.BaseError {
    constructor({ param: u }) {
      (super("Invalid ABI parameter.", { details: u }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidParameterError",
        }));
    }
  }
  ke.InvalidParameterError = t;
  class o extends e.BaseError {
    constructor({ param: u, name: l }) {
      (super("Invalid ABI parameter.", {
        details: u,
        metaMessages: [
          `"${l}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`,
        ],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "SolidityProtectedKeywordError",
        }));
    }
  }
  ke.SolidityProtectedKeywordError = o;
  class s extends e.BaseError {
    constructor({ param: u, type: l, modifier: f }) {
      (super("Invalid ABI parameter.", {
        details: u,
        metaMessages: [`Modifier "${f}" not allowed${l ? ` in "${l}" type` : ""}.`],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidModifierError",
        }));
    }
  }
  ke.InvalidModifierError = s;
  class i extends e.BaseError {
    constructor({ param: u, type: l, modifier: f }) {
      (super("Invalid ABI parameter.", {
        details: u,
        metaMessages: [
          `Modifier "${f}" not allowed${l ? ` in "${l}" type` : ""}.`,
          `Data location can only be specified for array, struct, or mapping types, but "${f}" was given.`,
        ],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidFunctionModifierError",
        }));
    }
  }
  ke.InvalidFunctionModifierError = i;
  class a extends e.BaseError {
    constructor({ abiParameter: u }) {
      (super("Invalid ABI parameter.", {
        details: JSON.stringify(u, null, 2),
        metaMessages: ["ABI parameter type is invalid."],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidAbiTypeParameterError",
        }));
    }
  }
  return ((ke.InvalidAbiTypeParameterError = a), ke);
}
var Mt = {},
  Ol;
function Jd() {
  if (Ol) return Mt;
  ((Ol = 1),
    Object.defineProperty(Mt, "__esModule", { value: !0 }),
    (Mt.InvalidStructSignatureError = Mt.UnknownSignatureError = Mt.InvalidSignatureError = void 0));
  const e = pn();
  class r extends e.BaseError {
    constructor({ signature: s, type: i }) {
      (super(`Invalid ${i} signature.`, { details: s }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidSignatureError",
        }));
    }
  }
  Mt.InvalidSignatureError = r;
  class n extends e.BaseError {
    constructor({ signature: s }) {
      (super("Unknown signature.", { details: s }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "UnknownSignatureError",
        }));
    }
  }
  Mt.UnknownSignatureError = n;
  class t extends e.BaseError {
    constructor({ signature: s }) {
      (super("Invalid struct signature.", { details: s, metaMessages: ["No properties exist."] }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidStructSignatureError",
        }));
    }
  }
  return ((Mt.InvalidStructSignatureError = t), Mt);
}
var zn = {},
  xl;
function Jp() {
  if (xl) return zn;
  ((xl = 1), Object.defineProperty(zn, "__esModule", { value: !0 }), (zn.CircularReferenceError = void 0));
  const e = pn();
  class r extends e.BaseError {
    constructor({ type: t }) {
      (super("Circular reference detected.", { metaMessages: [`Struct "${t}" is a circular reference.`] }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "CircularReferenceError",
        }));
    }
  }
  return ((zn.CircularReferenceError = r), zn);
}
var Je = {},
  Un = {},
  Cl;
function Yp() {
  if (Cl) return Un;
  ((Cl = 1), Object.defineProperty(Un, "__esModule", { value: !0 }), (Un.InvalidParenthesisError = void 0));
  const e = pn();
  class r extends e.BaseError {
    constructor({ current: t, depth: o }) {
      (super("Unbalanced parentheses.", {
        metaMessages: [`"${t.trim()}" has too many ${o > 0 ? "opening" : "closing"} parentheses.`],
        details: `Depth "${o}"`,
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "InvalidParenthesisError",
        }));
    }
  }
  return ((Un.InvalidParenthesisError = r), Un);
}
var Zr = {},
  ql;
function xv() {
  if (ql) return Zr;
  ((ql = 1),
    Object.defineProperty(Zr, "__esModule", { value: !0 }),
    (Zr.parameterCache = void 0),
    (Zr.getParameterCacheKey = e));
  function e(r, n, t) {
    let o = "";
    if (t)
      for (const s of Object.entries(t)) {
        if (!s) continue;
        let i = "";
        for (const a of s[1]) i += `[${a.type}${a.name ? `:${a.name}` : ""}]`;
        o += `(${s[0]}{${i}})`;
      }
    return n ? `${n}:${r}${o}` : `${r}${o}`;
  }
  return (
    (Zr.parameterCache = new Map([
      ["address", { type: "address" }],
      ["bool", { type: "bool" }],
      ["bytes", { type: "bytes" }],
      ["bytes32", { type: "bytes32" }],
      ["int", { type: "int256" }],
      ["int256", { type: "int256" }],
      ["string", { type: "string" }],
      ["uint", { type: "uint256" }],
      ["uint8", { type: "uint8" }],
      ["uint16", { type: "uint16" }],
      ["uint24", { type: "uint24" }],
      ["uint32", { type: "uint32" }],
      ["uint64", { type: "uint64" }],
      ["uint96", { type: "uint96" }],
      ["uint112", { type: "uint112" }],
      ["uint160", { type: "uint160" }],
      ["uint192", { type: "uint192" }],
      ["uint256", { type: "uint256" }],
      ["address owner", { type: "address", name: "owner" }],
      ["address to", { type: "address", name: "to" }],
      ["bool approved", { type: "bool", name: "approved" }],
      ["bytes _data", { type: "bytes", name: "_data" }],
      ["bytes data", { type: "bytes", name: "data" }],
      ["bytes signature", { type: "bytes", name: "signature" }],
      ["bytes32 hash", { type: "bytes32", name: "hash" }],
      ["bytes32 r", { type: "bytes32", name: "r" }],
      ["bytes32 root", { type: "bytes32", name: "root" }],
      ["bytes32 s", { type: "bytes32", name: "s" }],
      ["string name", { type: "string", name: "name" }],
      ["string symbol", { type: "string", name: "symbol" }],
      ["string tokenURI", { type: "string", name: "tokenURI" }],
      ["uint tokenId", { type: "uint256", name: "tokenId" }],
      ["uint8 v", { type: "uint8", name: "v" }],
      ["uint256 balance", { type: "uint256", name: "balance" }],
      ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
      ["uint256 value", { type: "uint256", name: "value" }],
      ["event:address indexed from", { type: "address", name: "from", indexed: !0 }],
      ["event:address indexed to", { type: "address", name: "to", indexed: !0 }],
      ["event:uint indexed tokenId", { type: "uint256", name: "tokenId", indexed: !0 }],
      ["event:uint256 indexed tokenId", { type: "uint256", name: "tokenId", indexed: !0 }],
    ])),
    Zr
  );
}
var Ml;
function yn() {
  if (Ml) return Je;
  ((Ml = 1),
    Object.defineProperty(Je, "__esModule", { value: !0 }),
    (Je.parseSignature = a),
    (Je.parseFunctionSignature = c),
    (Je.parseEventSignature = u),
    (Je.parseErrorSignature = l),
    (Je.parseConstructorSignature = f),
    (Je.parseFallbackSignature = m),
    (Je.parseAbiParameter = v),
    (Je.splitParameters = _),
    (Je.isSolidityType = E),
    (Je.isSolidityKeyword = d),
    (Je.isValidDataLocation = j));
  const e = Pu(),
    r = Au(),
    n = Co(),
    t = Jd(),
    o = Yp(),
    s = xv(),
    i = gn();
  function a(p, y = {}) {
    if ((0, i.isFunctionSignature)(p)) return c(p, y);
    if ((0, i.isEventSignature)(p)) return u(p, y);
    if ((0, i.isErrorSignature)(p)) return l(p, y);
    if ((0, i.isConstructorSignature)(p)) return f(p, y);
    if ((0, i.isFallbackSignature)(p)) return m(p);
    if ((0, i.isReceiveSignature)(p)) return { type: "receive", stateMutability: "payable" };
    throw new t.UnknownSignatureError({ signature: p });
  }
  function c(p, y = {}) {
    const I = (0, i.execFunctionSignature)(p);
    if (!I) throw new t.InvalidSignatureError({ signature: p, type: "function" });
    const w = _(I.parameters),
      A = [],
      B = w.length;
    for (let S = 0; S < B; S++) A.push(v(w[S], { modifiers: i.functionModifiers, structs: y, type: "function" }));
    const R = [];
    if (I.returns) {
      const S = _(I.returns),
        x = S.length;
      for (let F = 0; F < x; F++) R.push(v(S[F], { modifiers: i.functionModifiers, structs: y, type: "function" }));
    }
    return {
      name: I.name,
      type: "function",
      stateMutability: I.stateMutability ?? "nonpayable",
      inputs: A,
      outputs: R,
    };
  }
  function u(p, y = {}) {
    const I = (0, i.execEventSignature)(p);
    if (!I) throw new t.InvalidSignatureError({ signature: p, type: "event" });
    const w = _(I.parameters),
      A = [],
      B = w.length;
    for (let R = 0; R < B; R++) A.push(v(w[R], { modifiers: i.eventModifiers, structs: y, type: "event" }));
    return { name: I.name, type: "event", inputs: A };
  }
  function l(p, y = {}) {
    const I = (0, i.execErrorSignature)(p);
    if (!I) throw new t.InvalidSignatureError({ signature: p, type: "error" });
    const w = _(I.parameters),
      A = [],
      B = w.length;
    for (let R = 0; R < B; R++) A.push(v(w[R], { structs: y, type: "error" }));
    return { name: I.name, type: "error", inputs: A };
  }
  function f(p, y = {}) {
    const I = (0, i.execConstructorSignature)(p);
    if (!I) throw new t.InvalidSignatureError({ signature: p, type: "constructor" });
    const w = _(I.parameters),
      A = [],
      B = w.length;
    for (let R = 0; R < B; R++) A.push(v(w[R], { structs: y, type: "constructor" }));
    return { type: "constructor", stateMutability: I.stateMutability ?? "nonpayable", inputs: A };
  }
  function m(p) {
    const y = (0, i.execFallbackSignature)(p);
    if (!y) throw new t.InvalidSignatureError({ signature: p, type: "fallback" });
    return { type: "fallback", stateMutability: y.stateMutability ?? "nonpayable" };
  }
  const g =
      /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/,
    h =
      /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/,
    b = /^u?int$/;
  function v(p, y) {
    var T, k;
    const I = (0, s.getParameterCacheKey)(p, y == null ? void 0 : y.type, y == null ? void 0 : y.structs);
    if (s.parameterCache.has(I)) return s.parameterCache.get(I);
    const w = e.isTupleRegex.test(p),
      A = (0, e.execTyped)(w ? h : g, p);
    if (!A) throw new n.InvalidParameterError({ param: p });
    if (A.name && d(A.name)) throw new n.SolidityProtectedKeywordError({ param: p, name: A.name });
    const B = A.name ? { name: A.name } : {},
      R = A.modifier === "indexed" ? { indexed: !0 } : {},
      S = (y == null ? void 0 : y.structs) ?? {};
    let x,
      F = {};
    if (w) {
      x = "tuple";
      const O = _(A.type),
        C = [],
        q = O.length;
      for (let M = 0; M < q; M++) C.push(v(O[M], { structs: S }));
      F = { components: C };
    } else if (A.type in S) ((x = "tuple"), (F = { components: S[A.type] }));
    else if (b.test(A.type)) x = `${A.type}256`;
    else if (A.type === "address payable") x = "address";
    else if (((x = A.type), (y == null ? void 0 : y.type) !== "struct" && !E(x)))
      throw new r.UnknownSolidityTypeError({ type: x });
    if (A.modifier) {
      if (!((k = (T = y == null ? void 0 : y.modifiers) == null ? void 0 : T.has) != null && k.call(T, A.modifier)))
        throw new n.InvalidModifierError({ param: p, type: y == null ? void 0 : y.type, modifier: A.modifier });
      if (i.functionModifiers.has(A.modifier) && !j(x, !!A.array))
        throw new n.InvalidFunctionModifierError({ param: p, type: y == null ? void 0 : y.type, modifier: A.modifier });
    }
    const H = { type: `${x}${A.array ?? ""}`, ...B, ...R, ...F };
    return (s.parameterCache.set(I, H), H);
  }
  function _(p, y = [], I = "", w = 0) {
    const A = p.trim().length;
    for (let B = 0; B < A; B++) {
      const R = p[B],
        S = p.slice(B + 1);
      switch (R) {
        case ",":
          return w === 0 ? _(S, [...y, I.trim()]) : _(S, y, `${I}${R}`, w);
        case "(":
          return _(S, y, `${I}${R}`, w + 1);
        case ")":
          return _(S, y, `${I}${R}`, w - 1);
        default:
          return _(S, y, `${I}${R}`, w);
      }
    }
    if (I === "") return y;
    if (w !== 0) throw new o.InvalidParenthesisError({ current: I, depth: w });
    return (y.push(I.trim()), y);
  }
  function E(p) {
    return (
      p === "address" ||
      p === "bool" ||
      p === "function" ||
      p === "string" ||
      e.bytesRegex.test(p) ||
      e.integerRegex.test(p)
    );
  }
  const P =
    /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
  function d(p) {
    return (
      p === "address" ||
      p === "bool" ||
      p === "function" ||
      p === "string" ||
      p === "tuple" ||
      e.bytesRegex.test(p) ||
      e.integerRegex.test(p) ||
      P.test(p)
    );
  }
  function j(p, y) {
    return y || p === "bytes" || p === "string" || p === "tuple";
  }
  return Je;
}
var Hl;
function Tu() {
  if (Hl) return yi;
  ((Hl = 1), Object.defineProperty(yi, "__esModule", { value: !0 }), (yi.parseStructs = a));
  const e = Pu(),
    r = Au(),
    n = Co(),
    t = Jd(),
    o = Jp(),
    s = gn(),
    i = yn();
  function a(l) {
    const f = {},
      m = l.length;
    for (let v = 0; v < m; v++) {
      const _ = l[v];
      if (!(0, s.isStructSignature)(_)) continue;
      const E = (0, s.execStructSignature)(_);
      if (!E) throw new t.InvalidSignatureError({ signature: _, type: "struct" });
      const P = E.properties.split(";"),
        d = [],
        j = P.length;
      for (let p = 0; p < j; p++) {
        const I = P[p].trim();
        if (!I) continue;
        const w = (0, i.parseAbiParameter)(I, { type: "struct" });
        d.push(w);
      }
      if (!d.length) throw new t.InvalidStructSignatureError({ signature: _ });
      f[E.name] = d;
    }
    const g = {},
      h = Object.entries(f),
      b = h.length;
    for (let v = 0; v < b; v++) {
      const [_, E] = h[v];
      g[_] = u(E, f);
    }
    return g;
  }
  const c = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
  function u(l = [], f = {}, m = new Set()) {
    const g = [],
      h = l.length;
    for (let b = 0; b < h; b++) {
      const v = l[b];
      if (e.isTupleRegex.test(v.type)) g.push(v);
      else {
        const E = (0, e.execTyped)(c, v.type);
        if (!(E != null && E.type)) throw new n.InvalidAbiTypeParameterError({ abiParameter: v });
        const { array: P, type: d } = E;
        if (d in f) {
          if (m.has(d)) throw new o.CircularReferenceError({ type: d });
          g.push({ ...v, type: `tuple${P ?? ""}`, components: u(f[d], f, new Set([...m, d])) });
        } else if ((0, i.isSolidityType)(d)) g.push(v);
        else throw new r.UnknownTypeError({ type: d });
      }
    }
    return g;
  }
  return yi;
}
var kl;
function Cv() {
  if (kl) return hi;
  ((kl = 1), Object.defineProperty(hi, "__esModule", { value: !0 }), (hi.parseAbi = t));
  const e = gn(),
    r = Tu(),
    n = yn();
  function t(o) {
    const s = (0, r.parseStructs)(o),
      i = [],
      a = o.length;
    for (let c = 0; c < a; c++) {
      const u = o[c];
      (0, e.isStructSignature)(u) || i.push((0, n.parseSignature)(u, s));
    }
    return i;
  }
  return hi;
}
var pi = {},
  Fl;
function qv() {
  if (Fl) return pi;
  ((Fl = 1), Object.defineProperty(pi, "__esModule", { value: !0 }), (pi.parseAbiItem = o));
  const e = Au(),
    r = gn(),
    n = Tu(),
    t = yn();
  function o(s) {
    let i;
    if (typeof s == "string") i = (0, t.parseSignature)(s);
    else {
      const a = (0, n.parseStructs)(s),
        c = s.length;
      for (let u = 0; u < c; u++) {
        const l = s[u];
        if (!(0, r.isStructSignature)(l)) {
          i = (0, t.parseSignature)(l, a);
          break;
        }
      }
    }
    if (!i) throw new e.InvalidAbiItemError({ signature: s });
    return i;
  }
  return pi;
}
var gi = {},
  Nl;
function Mv() {
  if (Nl) return gi;
  ((Nl = 1), Object.defineProperty(gi, "__esModule", { value: !0 }), (gi.parseAbiParameter = o));
  const e = Co(),
    r = gn(),
    n = Tu(),
    t = yn();
  function o(s) {
    let i;
    if (typeof s == "string") i = (0, t.parseAbiParameter)(s, { modifiers: r.modifiers });
    else {
      const a = (0, n.parseStructs)(s),
        c = s.length;
      for (let u = 0; u < c; u++) {
        const l = s[u];
        if (!(0, r.isStructSignature)(l)) {
          i = (0, t.parseAbiParameter)(l, { modifiers: r.modifiers, structs: a });
          break;
        }
      }
    }
    if (!i) throw new e.InvalidAbiParameterError({ param: s });
    return i;
  }
  return gi;
}
var _i = {},
  $l;
function Hv() {
  if ($l) return _i;
  (($l = 1), Object.defineProperty(_i, "__esModule", { value: !0 }), (_i.parseAbiParameters = s));
  const e = Co(),
    r = gn(),
    n = Tu(),
    t = yn(),
    o = yn();
  function s(i) {
    const a = [];
    if (typeof i == "string") {
      const c = (0, t.splitParameters)(i),
        u = c.length;
      for (let l = 0; l < u; l++) a.push((0, o.parseAbiParameter)(c[l], { modifiers: r.modifiers }));
    } else {
      const c = (0, n.parseStructs)(i),
        u = i.length;
      for (let l = 0; l < u; l++) {
        const f = i[l];
        if ((0, r.isStructSignature)(f)) continue;
        const m = (0, t.splitParameters)(f),
          g = m.length;
        for (let h = 0; h < g; h++) a.push((0, o.parseAbiParameter)(m[h], { modifiers: r.modifiers, structs: c }));
      }
    }
    if (a.length === 0) throw new e.InvalidAbiParametersError({ params: i });
    return a;
  }
  return _i;
}
var zl;
function ir() {
  return (
    zl ||
      ((zl = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.CircularReferenceError =
            e.InvalidParenthesisError =
            e.UnknownSignatureError =
            e.InvalidSignatureError =
            e.InvalidStructSignatureError =
            e.InvalidAbiParameterError =
            e.InvalidAbiParametersError =
            e.InvalidParameterError =
            e.SolidityProtectedKeywordError =
            e.InvalidModifierError =
            e.InvalidFunctionModifierError =
            e.InvalidAbiTypeParameterError =
            e.UnknownSolidityTypeError =
            e.InvalidAbiItemError =
            e.UnknownTypeError =
            e.parseAbiParameters =
            e.parseAbiParameter =
            e.parseAbiItem =
            e.parseAbi =
            e.formatAbiParameters =
            e.formatAbiParameter =
            e.formatAbiItem =
            e.formatAbi =
            e.narrow =
            e.BaseError =
              void 0));
        var r = pn();
        Object.defineProperty(e, "BaseError", {
          enumerable: !0,
          get: function () {
            return r.BaseError;
          },
        });
        var n = Bv();
        Object.defineProperty(e, "narrow", {
          enumerable: !0,
          get: function () {
            return n.narrow;
          },
        });
        var t = Ov();
        Object.defineProperty(e, "formatAbi", {
          enumerable: !0,
          get: function () {
            return t.formatAbi;
          },
        });
        var o = Zp();
        Object.defineProperty(e, "formatAbiItem", {
          enumerable: !0,
          get: function () {
            return o.formatAbiItem;
          },
        });
        var s = Wp();
        Object.defineProperty(e, "formatAbiParameter", {
          enumerable: !0,
          get: function () {
            return s.formatAbiParameter;
          },
        });
        var i = Kp();
        Object.defineProperty(e, "formatAbiParameters", {
          enumerable: !0,
          get: function () {
            return i.formatAbiParameters;
          },
        });
        var a = Cv();
        Object.defineProperty(e, "parseAbi", {
          enumerable: !0,
          get: function () {
            return a.parseAbi;
          },
        });
        var c = qv();
        Object.defineProperty(e, "parseAbiItem", {
          enumerable: !0,
          get: function () {
            return c.parseAbiItem;
          },
        });
        var u = Mv();
        Object.defineProperty(e, "parseAbiParameter", {
          enumerable: !0,
          get: function () {
            return u.parseAbiParameter;
          },
        });
        var l = Hv();
        Object.defineProperty(e, "parseAbiParameters", {
          enumerable: !0,
          get: function () {
            return l.parseAbiParameters;
          },
        });
        var f = Au();
        (Object.defineProperty(e, "UnknownTypeError", {
          enumerable: !0,
          get: function () {
            return f.UnknownTypeError;
          },
        }),
          Object.defineProperty(e, "InvalidAbiItemError", {
            enumerable: !0,
            get: function () {
              return f.InvalidAbiItemError;
            },
          }),
          Object.defineProperty(e, "UnknownSolidityTypeError", {
            enumerable: !0,
            get: function () {
              return f.UnknownSolidityTypeError;
            },
          }));
        var m = Co();
        (Object.defineProperty(e, "InvalidAbiTypeParameterError", {
          enumerable: !0,
          get: function () {
            return m.InvalidAbiTypeParameterError;
          },
        }),
          Object.defineProperty(e, "InvalidFunctionModifierError", {
            enumerable: !0,
            get: function () {
              return m.InvalidFunctionModifierError;
            },
          }),
          Object.defineProperty(e, "InvalidModifierError", {
            enumerable: !0,
            get: function () {
              return m.InvalidModifierError;
            },
          }),
          Object.defineProperty(e, "SolidityProtectedKeywordError", {
            enumerable: !0,
            get: function () {
              return m.SolidityProtectedKeywordError;
            },
          }),
          Object.defineProperty(e, "InvalidParameterError", {
            enumerable: !0,
            get: function () {
              return m.InvalidParameterError;
            },
          }),
          Object.defineProperty(e, "InvalidAbiParametersError", {
            enumerable: !0,
            get: function () {
              return m.InvalidAbiParametersError;
            },
          }),
          Object.defineProperty(e, "InvalidAbiParameterError", {
            enumerable: !0,
            get: function () {
              return m.InvalidAbiParameterError;
            },
          }));
        var g = Jd();
        (Object.defineProperty(e, "InvalidStructSignatureError", {
          enumerable: !0,
          get: function () {
            return g.InvalidStructSignatureError;
          },
        }),
          Object.defineProperty(e, "InvalidSignatureError", {
            enumerable: !0,
            get: function () {
              return g.InvalidSignatureError;
            },
          }),
          Object.defineProperty(e, "UnknownSignatureError", {
            enumerable: !0,
            get: function () {
              return g.UnknownSignatureError;
            },
          }));
        var h = Yp();
        Object.defineProperty(e, "InvalidParenthesisError", {
          enumerable: !0,
          get: function () {
            return h.InvalidParenthesisError;
          },
        });
        var b = Jp();
        Object.defineProperty(e, "CircularReferenceError", {
          enumerable: !0,
          get: function () {
            return b.CircularReferenceError;
          },
        });
      })(jd)),
    jd
  );
}
var Jr = {},
  vi = {},
  Ul;
function me() {
  if (Ul) return vi;
  ((Ul = 1), Object.defineProperty(vi, "__esModule", { value: !0 }), (vi.getAction = e));
  function e(r, n, t) {
    const o = r[n.name];
    if (typeof o == "function") return o;
    const s = r[t];
    return typeof s == "function" ? s : (i) => n(r, i);
  }
  return vi;
}
var Ei = {},
  ji = {},
  ae = {},
  Ln = {},
  Ll;
function Vt() {
  if (Ll) return Ln;
  ((Ll = 1), Object.defineProperty(Ln, "__esModule", { value: !0 }), (Ln.formatAbiItem = r), (Ln.formatAbiParams = n));
  const e = Se();
  function r(o, { includeName: s = !1 } = {}) {
    if (o.type !== "function" && o.type !== "event" && o.type !== "error")
      throw new e.InvalidDefinitionTypeError(o.type);
    return `${o.name}(${n(o.inputs, { includeName: s })})`;
  }
  function n(o, { includeName: s = !1 } = {}) {
    return o ? o.map((i) => t(i, { includeName: s })).join(s ? ", " : ",") : "";
  }
  function t(o, { includeName: s }) {
    return o.type.startsWith("tuple")
      ? `(${n(o.components, { includeName: s })})${o.type.slice(5)}`
      : o.type + (s && o.name ? ` ${o.name}` : "");
  }
  return Ln;
}
var wi = {},
  Pi = {},
  Dl;
function Ge() {
  if (Dl) return Pi;
  ((Dl = 1), Object.defineProperty(Pi, "__esModule", { value: !0 }), (Pi.isHex = e));
  function e(r, { strict: n = !0 } = {}) {
    return !r || typeof r != "string" ? !1 : n ? /^0x[0-9a-fA-F]*$/.test(r) : r.startsWith("0x");
  }
  return Pi;
}
var Gl;
function Ve() {
  if (Gl) return wi;
  ((Gl = 1), Object.defineProperty(wi, "__esModule", { value: !0 }), (wi.size = r));
  const e = Ge();
  function r(n) {
    return (0, e.isHex)(n, { strict: !1 }) ? Math.ceil((n.length - 2) / 2) : n.length;
  }
  return wi;
}
var Yr = {},
  Dn = {},
  Vl;
function kv() {
  return (
    Vl ||
      ((Vl = 1),
      Object.defineProperty(Dn, "__esModule", { value: !0 }),
      (Dn.version = void 0),
      (Dn.version = "2.48.8")),
    Dn
  );
}
var Wl;
function ue() {
  if (Wl) return Yr;
  ((Wl = 1), Object.defineProperty(Yr, "__esModule", { value: !0 }), (Yr.BaseError = void 0), (Yr.setErrorConfig = n));
  const e = kv();
  let r = {
    getDocsUrl: ({ docsBaseUrl: s, docsPath: i = "", docsSlug: a }) =>
      i ? `${s ?? "https://viem.sh"}${i}${a ? `#${a}` : ""}` : void 0,
    version: `viem@${e.version}`,
  };
  function n(s) {
    r = s;
  }
  class t extends Error {
    constructor(i, a = {}) {
      var m;
      const c = (() => {
          var g;
          return a.cause instanceof t
            ? a.cause.details
            : (g = a.cause) != null && g.message
              ? a.cause.message
              : a.details;
        })(),
        u = (a.cause instanceof t && a.cause.docsPath) || a.docsPath,
        l = (m = r.getDocsUrl) == null ? void 0 : m.call(r, { ...a, docsPath: u }),
        f = [
          i || "An error occurred.",
          "",
          ...(a.metaMessages ? [...a.metaMessages, ""] : []),
          ...(l ? [`Docs: ${l}`] : []),
          ...(c ? [`Details: ${c}`] : []),
          ...(r.version ? [`Version: ${r.version}`] : []),
        ].join(`
`);
      (super(f, a.cause ? { cause: a.cause } : void 0),
        Object.defineProperty(this, "details", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "docsPath", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "metaMessages", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "shortMessage", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "version", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "name", { enumerable: !0, configurable: !0, writable: !0, value: "BaseError" }),
        (this.details = c),
        (this.docsPath = u),
        (this.metaMessages = a.metaMessages),
        (this.name = a.name ?? this.name),
        (this.shortMessage = i),
        (this.version = e.version));
    }
    walk(i) {
      return o(this, i);
    }
  }
  Yr.BaseError = t;
  function o(s, i) {
    return i != null && i(s)
      ? s
      : s && typeof s == "object" && "cause" in s && s.cause !== void 0
        ? o(s.cause, i)
        : i
          ? null
          : s;
  }
  return Yr;
}
var Kl;
function Se() {
  if (Kl) return ae;
  ((Kl = 1),
    Object.defineProperty(ae, "__esModule", { value: !0 }),
    (ae.UnsupportedPackedAbiType =
      ae.InvalidDefinitionTypeError =
      ae.InvalidArrayError =
      ae.InvalidAbiDecodingTypeError =
      ae.InvalidAbiEncodingTypeError =
      ae.DecodeLogTopicsMismatch =
      ae.DecodeLogDataMismatch =
      ae.BytesSizeMismatchError =
      ae.AbiItemAmbiguityError =
      ae.AbiFunctionSignatureNotFoundError =
      ae.AbiFunctionOutputsNotFoundError =
      ae.AbiFunctionNotFoundError =
      ae.AbiEventNotFoundError =
      ae.AbiEventSignatureNotFoundError =
      ae.AbiEventSignatureEmptyTopicsError =
      ae.AbiErrorSignatureNotFoundError =
      ae.AbiErrorNotFoundError =
      ae.AbiErrorInputsNotFoundError =
      ae.AbiEncodingLengthMismatchError =
      ae.AbiEncodingBytesSizeMismatchError =
      ae.AbiEncodingArrayLengthMismatchError =
      ae.AbiDecodingZeroDataError =
      ae.AbiDecodingDataSizeTooSmallError =
      ae.AbiDecodingDataSizeInvalidError =
      ae.AbiConstructorParamsNotFoundError =
      ae.AbiConstructorNotFoundError =
        void 0));
  const e = Vt(),
    r = Ve(),
    n = ue();
  class t extends n.BaseError {
    constructor({ docsPath: x }) {
      super(
        [
          "A constructor was not found on the ABI.",
          "Make sure you are using the correct ABI and that the constructor exists on it.",
        ].join(`
`),
        { docsPath: x, name: "AbiConstructorNotFoundError" },
      );
    }
  }
  ae.AbiConstructorNotFoundError = t;
  class o extends n.BaseError {
    constructor({ docsPath: x }) {
      super(
        [
          "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
          "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists.",
        ].join(`
`),
        { docsPath: x, name: "AbiConstructorParamsNotFoundError" },
      );
    }
  }
  ae.AbiConstructorParamsNotFoundError = o;
  class s extends n.BaseError {
    constructor({ data: x, size: F }) {
      super(
        [`Data size of ${F} bytes is invalid.`, "Size must be in increments of 32 bytes (size % 32 === 0)."].join(`
`),
        { metaMessages: [`Data: ${x} (${F} bytes)`], name: "AbiDecodingDataSizeInvalidError" },
      );
    }
  }
  ae.AbiDecodingDataSizeInvalidError = s;
  class i extends n.BaseError {
    constructor({ data: x, params: F, size: H }) {
      (super(
        [`Data size of ${H} bytes is too small for given parameters.`].join(`
`),
        {
          metaMessages: [`Params: (${(0, e.formatAbiParams)(F, { includeName: !0 })})`, `Data:   ${x} (${H} bytes)`],
          name: "AbiDecodingDataSizeTooSmallError",
        },
      ),
        Object.defineProperty(this, "data", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "params", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "size", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.data = x),
        (this.params = F),
        (this.size = H));
    }
  }
  ae.AbiDecodingDataSizeTooSmallError = i;
  class a extends n.BaseError {
    constructor({ cause: x } = {}) {
      super('Cannot decode zero data ("0x") with ABI parameters.', { name: "AbiDecodingZeroDataError", cause: x });
    }
  }
  ae.AbiDecodingZeroDataError = a;
  class c extends n.BaseError {
    constructor({ expectedLength: x, givenLength: F, type: H }) {
      super(
        [`ABI encoding array length mismatch for type ${H}.`, `Expected length: ${x}`, `Given length: ${F}`].join(`
`),
        { name: "AbiEncodingArrayLengthMismatchError" },
      );
    }
  }
  ae.AbiEncodingArrayLengthMismatchError = c;
  class u extends n.BaseError {
    constructor({ expectedSize: x, value: F }) {
      super(`Size of bytes "${F}" (bytes${(0, r.size)(F)}) does not match expected size (bytes${x}).`, {
        name: "AbiEncodingBytesSizeMismatchError",
      });
    }
  }
  ae.AbiEncodingBytesSizeMismatchError = u;
  class l extends n.BaseError {
    constructor({ expectedLength: x, givenLength: F }) {
      super(
        ["ABI encoding params/values length mismatch.", `Expected length (params): ${x}`, `Given length (values): ${F}`]
          .join(`
`),
        { name: "AbiEncodingLengthMismatchError" },
      );
    }
  }
  ae.AbiEncodingLengthMismatchError = l;
  class f extends n.BaseError {
    constructor(x, { docsPath: F }) {
      super(
        [
          `Arguments (\`args\`) were provided to "${x}", but "${x}" on the ABI does not contain any parameters (\`inputs\`).`,
          "Cannot encode error result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the inputs exist on it.",
        ].join(`
`),
        { docsPath: F, name: "AbiErrorInputsNotFoundError" },
      );
    }
  }
  ae.AbiErrorInputsNotFoundError = f;
  class m extends n.BaseError {
    constructor(x, { docsPath: F } = {}) {
      super(
        [
          `Error ${x ? `"${x}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
        ].join(`
`),
        { docsPath: F, name: "AbiErrorNotFoundError" },
      );
    }
  }
  ae.AbiErrorNotFoundError = m;
  class g extends n.BaseError {
    constructor(x, { docsPath: F, cause: H }) {
      (super(
        [
          `Encoded error signature "${x}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${x}.`,
        ].join(`
`),
        { docsPath: F, name: "AbiErrorSignatureNotFoundError", cause: H },
      ),
        Object.defineProperty(this, "signature", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.signature = x));
    }
  }
  ae.AbiErrorSignatureNotFoundError = g;
  class h extends n.BaseError {
    constructor({ docsPath: x }) {
      super("Cannot extract event signature from empty topics.", {
        docsPath: x,
        name: "AbiEventSignatureEmptyTopicsError",
      });
    }
  }
  ae.AbiEventSignatureEmptyTopicsError = h;
  class b extends n.BaseError {
    constructor(x, { docsPath: F }) {
      super(
        [
          `Encoded event signature "${x}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it.",
          `You can look up the signature here: https://4byte.sourcify.dev/?q=${x}.`,
        ].join(`
`),
        { docsPath: F, name: "AbiEventSignatureNotFoundError" },
      );
    }
  }
  ae.AbiEventSignatureNotFoundError = b;
  class v extends n.BaseError {
    constructor(x, { docsPath: F } = {}) {
      super(
        [
          `Event ${x ? `"${x}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it.",
        ].join(`
`),
        { docsPath: F, name: "AbiEventNotFoundError" },
      );
    }
  }
  ae.AbiEventNotFoundError = v;
  class _ extends n.BaseError {
    constructor(x, { docsPath: F } = {}) {
      super(
        [
          `Function ${x ? `"${x}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it.",
        ].join(`
`),
        { docsPath: F, name: "AbiFunctionNotFoundError" },
      );
    }
  }
  ae.AbiFunctionNotFoundError = _;
  class E extends n.BaseError {
    constructor(x, { docsPath: F }) {
      super(
        [
          `Function "${x}" does not contain any \`outputs\` on ABI.`,
          "Cannot decode function result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the function exists on it.",
        ].join(`
`),
        { docsPath: F, name: "AbiFunctionOutputsNotFoundError" },
      );
    }
  }
  ae.AbiFunctionOutputsNotFoundError = E;
  class P extends n.BaseError {
    constructor(x, { docsPath: F }) {
      super(
        [
          `Encoded function signature "${x}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it.",
          `You can look up the signature here: https://4byte.sourcify.dev/?q=${x}.`,
        ].join(`
`),
        { docsPath: F, name: "AbiFunctionSignatureNotFoundError" },
      );
    }
  }
  ae.AbiFunctionSignatureNotFoundError = P;
  class d extends n.BaseError {
    constructor(x, F) {
      super("Found ambiguous types in overloaded ABI items.", {
        metaMessages: [
          `\`${x.type}\` in \`${(0, e.formatAbiItem)(x.abiItem)}\`, and`,
          `\`${F.type}\` in \`${(0, e.formatAbiItem)(F.abiItem)}\``,
          "",
          "These types encode differently and cannot be distinguished at runtime.",
          "Remove one of the ambiguous items in the ABI.",
        ],
        name: "AbiItemAmbiguityError",
      });
    }
  }
  ae.AbiItemAmbiguityError = d;
  class j extends n.BaseError {
    constructor({ expectedSize: x, givenSize: F }) {
      super(`Expected bytes${x}, got bytes${F}.`, { name: "BytesSizeMismatchError" });
    }
  }
  ae.BytesSizeMismatchError = j;
  class p extends n.BaseError {
    constructor({ abiItem: x, data: F, params: H, size: T }) {
      (super(
        [`Data size of ${T} bytes is too small for non-indexed event parameters.`].join(`
`),
        {
          metaMessages: [`Params: (${(0, e.formatAbiParams)(H, { includeName: !0 })})`, `Data:   ${F} (${T} bytes)`],
          name: "DecodeLogDataMismatch",
        },
      ),
        Object.defineProperty(this, "abiItem", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "data", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "params", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "size", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.abiItem = x),
        (this.data = F),
        (this.params = H),
        (this.size = T));
    }
  }
  ae.DecodeLogDataMismatch = p;
  class y extends n.BaseError {
    constructor({ abiItem: x, param: F }) {
      (super(
        [
          `Expected a topic for indexed event parameter${F.name ? ` "${F.name}"` : ""} on event "${(0, e.formatAbiItem)(x, { includeName: !0 })}".`,
        ].join(`
`),
        { name: "DecodeLogTopicsMismatch" },
      ),
        Object.defineProperty(this, "abiItem", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.abiItem = x));
    }
  }
  ae.DecodeLogTopicsMismatch = y;
  class I extends n.BaseError {
    constructor(x, { docsPath: F }) {
      super(
        [`Type "${x}" is not a valid encoding type.`, "Please provide a valid ABI type."].join(`
`),
        { docsPath: F, name: "InvalidAbiEncodingType" },
      );
    }
  }
  ae.InvalidAbiEncodingTypeError = I;
  class w extends n.BaseError {
    constructor(x, { docsPath: F }) {
      super(
        [`Type "${x}" is not a valid decoding type.`, "Please provide a valid ABI type."].join(`
`),
        { docsPath: F, name: "InvalidAbiDecodingType" },
      );
    }
  }
  ae.InvalidAbiDecodingTypeError = w;
  class A extends n.BaseError {
    constructor(x) {
      super(
        [`Value "${x}" is not a valid array.`].join(`
`),
        { name: "InvalidArrayError" },
      );
    }
  }
  ae.InvalidArrayError = A;
  class B extends n.BaseError {
    constructor(x) {
      super(
        [`"${x}" is not a valid definition type.`, 'Valid types: "function", "event", "error"'].join(`
`),
        { name: "InvalidDefinitionTypeError" },
      );
    }
  }
  ae.InvalidDefinitionTypeError = B;
  class R extends n.BaseError {
    constructor(x) {
      super(`Type "${x}" is not supported for packed encoding.`, { name: "UnsupportedPackedAbiType" });
    }
  }
  return ((ae.UnsupportedPackedAbiType = R), ae);
}
var Gn = {},
  Zl;
function Xp() {
  if (Zl) return Gn;
  ((Zl = 1), Object.defineProperty(Gn, "__esModule", { value: !0 }), (Gn.FilterTypeNotSupportedError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor(t) {
      super(`Filter type "${t}" is not supported.`, { name: "FilterTypeNotSupportedError" });
    }
  }
  return ((Gn.FilterTypeNotSupportedError = r), Gn);
}
var Yt = {},
  Xr = {},
  Ht = {},
  Jl;
function Su() {
  if (Jl) return Ht;
  ((Jl = 1),
    Object.defineProperty(Ht, "__esModule", { value: !0 }),
    (Ht.InvalidBytesLengthError = Ht.SizeExceedsPaddingSizeError = Ht.SliceOffsetOutOfBoundsError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ offset: s, position: i, size: a }) {
      super(`Slice ${i === "start" ? "starting" : "ending"} at offset "${s}" is out-of-bounds (size: ${a}).`, {
        name: "SliceOffsetOutOfBoundsError",
      });
    }
  }
  Ht.SliceOffsetOutOfBoundsError = r;
  class n extends e.BaseError {
    constructor({ size: s, targetSize: i, type: a }) {
      super(`${a.charAt(0).toUpperCase()}${a.slice(1).toLowerCase()} size (${s}) exceeds padding size (${i}).`, {
        name: "SizeExceedsPaddingSizeError",
      });
    }
  }
  Ht.SizeExceedsPaddingSizeError = n;
  class t extends e.BaseError {
    constructor({ size: s, targetSize: i, type: a }) {
      super(
        `${a.charAt(0).toUpperCase()}${a.slice(1).toLowerCase()} is expected to be ${i} ${a} long, but is ${s} ${a} long.`,
        { name: "InvalidBytesLengthError" },
      );
    }
  }
  return ((Ht.InvalidBytesLengthError = t), Ht);
}
var Yl;
function ar() {
  if (Yl) return Xr;
  ((Yl = 1), Object.defineProperty(Xr, "__esModule", { value: !0 }), (Xr.pad = r), (Xr.padHex = n), (Xr.padBytes = t));
  const e = Su();
  function r(o, { dir: s, size: i = 32 } = {}) {
    return typeof o == "string" ? n(o, { dir: s, size: i }) : t(o, { dir: s, size: i });
  }
  function n(o, { dir: s, size: i = 32 } = {}) {
    if (i === null) return o;
    const a = o.replace("0x", "");
    if (a.length > i * 2)
      throw new e.SizeExceedsPaddingSizeError({ size: Math.ceil(a.length / 2), targetSize: i, type: "hex" });
    return `0x${a[s === "right" ? "padEnd" : "padStart"](i * 2, "0")}`;
  }
  function t(o, { dir: s, size: i = 32 } = {}) {
    if (i === null) return o;
    if (o.length > i) throw new e.SizeExceedsPaddingSizeError({ size: o.length, targetSize: i, type: "bytes" });
    const a = new Uint8Array(i);
    for (let c = 0; c < i; c++) {
      const u = s === "right";
      a[u ? c : i - c - 1] = o[u ? c : o.length - c - 1];
    }
    return a;
  }
  return Xr;
}
var kt = {},
  rt = {},
  Xl;
function _n() {
  if (Xl) return rt;
  ((Xl = 1),
    Object.defineProperty(rt, "__esModule", { value: !0 }),
    (rt.SizeOverflowError =
      rt.InvalidHexValueError =
      rt.InvalidHexBooleanError =
      rt.InvalidBytesBooleanError =
      rt.IntegerOutOfRangeError =
        void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ max: a, min: c, signed: u, size: l, value: f }) {
      super(
        `Number "${f}" is not in safe ${l ? `${l * 8}-bit ${u ? "signed" : "unsigned"} ` : ""}integer range ${a ? `(${c} to ${a})` : `(above ${c})`}`,
        { name: "IntegerOutOfRangeError" },
      );
    }
  }
  rt.IntegerOutOfRangeError = r;
  class n extends e.BaseError {
    constructor(a) {
      super(
        `Bytes value "${a}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`,
        { name: "InvalidBytesBooleanError" },
      );
    }
  }
  rt.InvalidBytesBooleanError = n;
  class t extends e.BaseError {
    constructor(a) {
      super(`Hex value "${a}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, {
        name: "InvalidHexBooleanError",
      });
    }
  }
  rt.InvalidHexBooleanError = t;
  class o extends e.BaseError {
    constructor(a) {
      super(`Hex value "${a}" is an odd length (${a.length}). It must be an even length.`, {
        name: "InvalidHexValueError",
      });
    }
  }
  rt.InvalidHexValueError = o;
  class s extends e.BaseError {
    constructor({ givenSize: a, maxSize: c }) {
      super(`Size cannot exceed ${c} bytes. Given size: ${a} bytes.`, { name: "SizeOverflowError" });
    }
  }
  return ((rt.SizeOverflowError = s), rt);
}
var Ai = {},
  Ql;
function Wt() {
  if (Ql) return Ai;
  ((Ql = 1), Object.defineProperty(Ai, "__esModule", { value: !0 }), (Ai.trim = e));
  function e(r, { dir: n = "left" } = {}) {
    let t = typeof r == "string" ? r.replace("0x", "") : r,
      o = 0;
    for (let s = 0; s < t.length - 1 && t[n === "left" ? s : t.length - s - 1].toString() === "0"; s++) o++;
    return (
      (t = n === "left" ? t.slice(o) : t.slice(0, t.length - o)),
      typeof r == "string"
        ? (t.length === 1 && n === "right" && (t = `${t}0`), `0x${t.length % 2 === 1 ? `0${t}` : t}`)
        : t
    );
  }
  return Ai;
}
var e0;
function Be() {
  if (e0) return kt;
  ((e0 = 1),
    Object.defineProperty(kt, "__esModule", { value: !0 }),
    (kt.assertSize = o),
    (kt.fromHex = s),
    (kt.hexToBigInt = i),
    (kt.hexToBool = a),
    (kt.hexToNumber = c),
    (kt.hexToString = u));
  const e = _n(),
    r = Ve(),
    n = Wt(),
    t = ve();
  function o(l, { size: f }) {
    if ((0, r.size)(l) > f) throw new e.SizeOverflowError({ givenSize: (0, r.size)(l), maxSize: f });
  }
  function s(l, f) {
    const m = typeof f == "string" ? { to: f } : f,
      g = m.to;
    return g === "number"
      ? c(l, m)
      : g === "bigint"
        ? i(l, m)
        : g === "string"
          ? u(l, m)
          : g === "boolean"
            ? a(l, m)
            : (0, t.hexToBytes)(l, m);
  }
  function i(l, f = {}) {
    const { signed: m } = f;
    f.size && o(l, { size: f.size });
    const g = BigInt(l);
    if (!m) return g;
    const h = (l.length - 2) / 2,
      b = (1n << (BigInt(h) * 8n - 1n)) - 1n;
    return g <= b ? g : g - BigInt(`0x${"f".padStart(h * 2, "f")}`) - 1n;
  }
  function a(l, f = {}) {
    let m = l;
    if ((f.size && (o(m, { size: f.size }), (m = (0, n.trim)(m))), (0, n.trim)(m) === "0x00")) return !1;
    if ((0, n.trim)(m) === "0x01") return !0;
    throw new e.InvalidHexBooleanError(m);
  }
  function c(l, f = {}) {
    const m = i(l, f),
      g = Number(m);
    if (!Number.isSafeInteger(g))
      throw new e.IntegerOutOfRangeError({
        max: `${Number.MAX_SAFE_INTEGER}`,
        min: `${Number.MIN_SAFE_INTEGER}`,
        signed: f.signed,
        size: f.size,
        value: `${m}n`,
      });
    return g;
  }
  function u(l, f = {}) {
    let m = (0, t.hexToBytes)(l);
    return (f.size && (o(m, { size: f.size }), (m = (0, n.trim)(m, { dir: "right" }))), new TextDecoder().decode(m));
  }
  return kt;
}
var Xt = {},
  t0;
function te() {
  if (t0) return Xt;
  ((t0 = 1),
    Object.defineProperty(Xt, "__esModule", { value: !0 }),
    (Xt.toHex = o),
    (Xt.boolToHex = s),
    (Xt.bytesToHex = i),
    (Xt.numberToHex = a),
    (Xt.stringToHex = u));
  const e = _n(),
    r = ar(),
    n = Be(),
    t = Array.from({ length: 256 }, (l, f) => f.toString(16).padStart(2, "0"));
  function o(l, f = {}) {
    return typeof l == "number" || typeof l == "bigint"
      ? a(l, f)
      : typeof l == "string"
        ? u(l, f)
        : typeof l == "boolean"
          ? s(l, f)
          : i(l, f);
  }
  function s(l, f = {}) {
    const m = `0x${Number(l)}`;
    return typeof f.size == "number" ? ((0, n.assertSize)(m, { size: f.size }), (0, r.pad)(m, { size: f.size })) : m;
  }
  function i(l, f = {}) {
    let m = "";
    for (let h = 0; h < l.length; h++) m += t[l[h]];
    const g = `0x${m}`;
    return typeof f.size == "number"
      ? ((0, n.assertSize)(g, { size: f.size }), (0, r.pad)(g, { dir: "right", size: f.size }))
      : g;
  }
  function a(l, f = {}) {
    const { signed: m, size: g } = f,
      h = BigInt(l);
    let b;
    g
      ? m
        ? (b = (1n << (BigInt(g) * 8n - 1n)) - 1n)
        : (b = 2n ** (BigInt(g) * 8n) - 1n)
      : typeof l == "number" && (b = BigInt(Number.MAX_SAFE_INTEGER));
    const v = typeof b == "bigint" && m ? -b - 1n : 0;
    if ((b && h > b) || h < v) {
      const E = typeof l == "bigint" ? "n" : "";
      throw new e.IntegerOutOfRangeError({
        max: b ? `${b}${E}` : void 0,
        min: `${v}${E}`,
        signed: m,
        size: g,
        value: `${l}${E}`,
      });
    }
    const _ = `0x${(m && h < 0 ? (1n << BigInt(g * 8)) + BigInt(h) : h).toString(16)}`;
    return g ? (0, r.pad)(_, { size: g }) : _;
  }
  const c = new TextEncoder();
  function u(l, f = {}) {
    const m = c.encode(l);
    return i(m, f);
  }
  return Xt;
}
var r0;
function ve() {
  if (r0) return Yt;
  ((r0 = 1),
    Object.defineProperty(Yt, "__esModule", { value: !0 }),
    (Yt.toBytes = i),
    (Yt.boolToBytes = a),
    (Yt.hexToBytes = l),
    (Yt.numberToBytes = f),
    (Yt.stringToBytes = m));
  const e = ue(),
    r = Ge(),
    n = ar(),
    t = Be(),
    o = te(),
    s = new TextEncoder();
  function i(g, h = {}) {
    return typeof g == "number" || typeof g == "bigint"
      ? f(g, h)
      : typeof g == "boolean"
        ? a(g, h)
        : (0, r.isHex)(g)
          ? l(g, h)
          : m(g, h);
  }
  function a(g, h = {}) {
    const b = new Uint8Array(1);
    return (
      (b[0] = Number(g)),
      typeof h.size == "number" ? ((0, t.assertSize)(b, { size: h.size }), (0, n.pad)(b, { size: h.size })) : b
    );
  }
  const c = { zero: 48, nine: 57, A: 65, F: 70, a: 97, f: 102 };
  function u(g) {
    if (g >= c.zero && g <= c.nine) return g - c.zero;
    if (g >= c.A && g <= c.F) return g - (c.A - 10);
    if (g >= c.a && g <= c.f) return g - (c.a - 10);
  }
  function l(g, h = {}) {
    let b = g;
    h.size && ((0, t.assertSize)(b, { size: h.size }), (b = (0, n.pad)(b, { dir: "right", size: h.size })));
    let v = b.slice(2);
    v.length % 2 && (v = `0${v}`);
    const _ = v.length / 2,
      E = new Uint8Array(_);
    for (let P = 0, d = 0; P < _; P++) {
      const j = u(v.charCodeAt(d++)),
        p = u(v.charCodeAt(d++));
      if (j === void 0 || p === void 0)
        throw new e.BaseError(`Invalid byte sequence ("${v[d - 2]}${v[d - 1]}" in "${v}").`);
      E[P] = j * 16 + p;
    }
    return E;
  }
  function f(g, h) {
    const b = (0, o.numberToHex)(g, h);
    return l(b);
  }
  function m(g, h = {}) {
    const b = s.encode(g);
    return typeof h.size == "number"
      ? ((0, t.assertSize)(b, { size: h.size }), (0, n.pad)(b, { dir: "right", size: h.size }))
      : b;
  }
  return Yt;
}
var Ti = {},
  je = {},
  ce = {},
  n0;
function Qp() {
  if (n0) return ce;
  ((n0 = 1),
    Object.defineProperty(ce, "__esModule", { value: !0 }),
    (ce.toBig =
      ce.shrSL =
      ce.shrSH =
      ce.rotrSL =
      ce.rotrSH =
      ce.rotrBL =
      ce.rotrBH =
      ce.rotr32L =
      ce.rotr32H =
      ce.rotlSL =
      ce.rotlSH =
      ce.rotlBL =
      ce.rotlBH =
      ce.add5L =
      ce.add5H =
      ce.add4L =
      ce.add4H =
      ce.add3L =
      ce.add3H =
        void 0),
    (ce.add = _),
    (ce.fromBig = n),
    (ce.split = t));
  const e = BigInt(2 ** 32 - 1),
    r = BigInt(32);
  function n(w, A = !1) {
    return A ? { h: Number(w & e), l: Number((w >> r) & e) } : { h: Number((w >> r) & e) | 0, l: Number(w & e) | 0 };
  }
  function t(w, A = !1) {
    const B = w.length;
    let R = new Uint32Array(B),
      S = new Uint32Array(B);
    for (let x = 0; x < B; x++) {
      const { h: F, l: H } = n(w[x], A);
      [R[x], S[x]] = [F, H];
    }
    return [R, S];
  }
  const o = (w, A) => (BigInt(w >>> 0) << r) | BigInt(A >>> 0);
  ce.toBig = o;
  const s = (w, A, B) => w >>> B;
  ce.shrSH = s;
  const i = (w, A, B) => (w << (32 - B)) | (A >>> B);
  ce.shrSL = i;
  const a = (w, A, B) => (w >>> B) | (A << (32 - B));
  ce.rotrSH = a;
  const c = (w, A, B) => (w << (32 - B)) | (A >>> B);
  ce.rotrSL = c;
  const u = (w, A, B) => (w << (64 - B)) | (A >>> (B - 32));
  ce.rotrBH = u;
  const l = (w, A, B) => (w >>> (B - 32)) | (A << (64 - B));
  ce.rotrBL = l;
  const f = (w, A) => A;
  ce.rotr32H = f;
  const m = (w, A) => w;
  ce.rotr32L = m;
  const g = (w, A, B) => (w << B) | (A >>> (32 - B));
  ce.rotlSH = g;
  const h = (w, A, B) => (A << B) | (w >>> (32 - B));
  ce.rotlSL = h;
  const b = (w, A, B) => (A << (B - 32)) | (w >>> (64 - B));
  ce.rotlBH = b;
  const v = (w, A, B) => (w << (B - 32)) | (A >>> (64 - B));
  ce.rotlBL = v;
  function _(w, A, B, R) {
    const S = (A >>> 0) + (R >>> 0);
    return { h: (w + B + ((S / 2 ** 32) | 0)) | 0, l: S | 0 };
  }
  const E = (w, A, B) => (w >>> 0) + (A >>> 0) + (B >>> 0);
  ce.add3L = E;
  const P = (w, A, B, R) => (A + B + R + ((w / 2 ** 32) | 0)) | 0;
  ce.add3H = P;
  const d = (w, A, B, R) => (w >>> 0) + (A >>> 0) + (B >>> 0) + (R >>> 0);
  ce.add4L = d;
  const j = (w, A, B, R, S) => (A + B + R + S + ((w / 2 ** 32) | 0)) | 0;
  ce.add4H = j;
  const p = (w, A, B, R, S) => (w >>> 0) + (A >>> 0) + (B >>> 0) + (R >>> 0) + (S >>> 0);
  ce.add5L = p;
  const y = (w, A, B, R, S, x) => (A + B + R + S + x + ((w / 2 ** 32) | 0)) | 0;
  ce.add5H = y;
  const I = {
    fromBig: n,
    split: t,
    toBig: o,
    shrSH: s,
    shrSL: i,
    rotrSH: a,
    rotrSL: c,
    rotrBH: u,
    rotrBL: l,
    rotr32H: f,
    rotr32L: m,
    rotlSH: g,
    rotlSL: h,
    rotlBH: b,
    rotlBL: v,
    add: _,
    add3L: E,
    add3H: P,
    add4L: d,
    add4H: j,
    add5H: y,
    add5L: p,
  };
  return ((ce.default = I), ce);
}
var wd = {},
  Vn = {},
  o0;
function Fv() {
  return (
    o0 ||
      ((o0 = 1),
      Object.defineProperty(Vn, "__esModule", { value: !0 }),
      (Vn.crypto = void 0),
      (Vn.crypto = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0)),
    Vn
  );
}
var i0;
function sr() {
  return (
    i0 ||
      ((i0 = 1),
      (function (e) {
        /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ (Object.defineProperty(e, "__esModule", {
          value: !0,
        }),
          (e.wrapXOFConstructorWithOpts =
            e.wrapConstructorWithOpts =
            e.wrapConstructor =
            e.Hash =
            e.nextTick =
            e.swap32IfBE =
            e.byteSwapIfBE =
            e.swap8IfBE =
            e.isLE =
              void 0),
          (e.isBytes = n),
          (e.anumber = t),
          (e.abytes = o),
          (e.ahash = s),
          (e.aexists = i),
          (e.aoutput = a),
          (e.u8 = c),
          (e.u32 = u),
          (e.clean = l),
          (e.createView = f),
          (e.rotr = m),
          (e.rotl = g),
          (e.byteSwap = h),
          (e.byteSwap32 = b),
          (e.bytesToHex = E),
          (e.hexToBytes = j),
          (e.asyncLoop = y),
          (e.utf8ToBytes = I),
          (e.bytesToUtf8 = w),
          (e.toBytes = A),
          (e.kdfInputToBytes = B),
          (e.concatBytes = R),
          (e.checkOpts = S),
          (e.createHasher = F),
          (e.createOptHasher = H),
          (e.createXOFer = T),
          (e.randomBytes = k));
        const r = Fv();
        function n(O) {
          return O instanceof Uint8Array || (ArrayBuffer.isView(O) && O.constructor.name === "Uint8Array");
        }
        function t(O) {
          if (!Number.isSafeInteger(O) || O < 0) throw new Error("positive integer expected, got " + O);
        }
        function o(O, ...C) {
          if (!n(O)) throw new Error("Uint8Array expected");
          if (C.length > 0 && !C.includes(O.length))
            throw new Error("Uint8Array expected of length " + C + ", got length=" + O.length);
        }
        function s(O) {
          if (typeof O != "function" || typeof O.create != "function")
            throw new Error("Hash should be wrapped by utils.createHasher");
          (t(O.outputLen), t(O.blockLen));
        }
        function i(O, C = !0) {
          if (O.destroyed) throw new Error("Hash instance has been destroyed");
          if (C && O.finished) throw new Error("Hash#digest() has already been called");
        }
        function a(O, C) {
          o(O);
          const q = C.outputLen;
          if (O.length < q) throw new Error("digestInto() expects output buffer of length at least " + q);
        }
        function c(O) {
          return new Uint8Array(O.buffer, O.byteOffset, O.byteLength);
        }
        function u(O) {
          return new Uint32Array(O.buffer, O.byteOffset, Math.floor(O.byteLength / 4));
        }
        function l(...O) {
          for (let C = 0; C < O.length; C++) O[C].fill(0);
        }
        function f(O) {
          return new DataView(O.buffer, O.byteOffset, O.byteLength);
        }
        function m(O, C) {
          return (O << (32 - C)) | (O >>> C);
        }
        function g(O, C) {
          return (O << C) | ((O >>> (32 - C)) >>> 0);
        }
        e.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
        function h(O) {
          return ((O << 24) & 4278190080) | ((O << 8) & 16711680) | ((O >>> 8) & 65280) | ((O >>> 24) & 255);
        }
        ((e.swap8IfBE = e.isLE ? (O) => O : (O) => h(O)), (e.byteSwapIfBE = e.swap8IfBE));
        function b(O) {
          for (let C = 0; C < O.length; C++) O[C] = h(O[C]);
          return O;
        }
        e.swap32IfBE = e.isLE ? (O) => O : b;
        const v = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function",
          _ = Array.from({ length: 256 }, (O, C) => C.toString(16).padStart(2, "0"));
        function E(O) {
          if ((o(O), v)) return O.toHex();
          let C = "";
          for (let q = 0; q < O.length; q++) C += _[O[q]];
          return C;
        }
        const P = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
        function d(O) {
          if (O >= P._0 && O <= P._9) return O - P._0;
          if (O >= P.A && O <= P.F) return O - (P.A - 10);
          if (O >= P.a && O <= P.f) return O - (P.a - 10);
        }
        function j(O) {
          if (typeof O != "string") throw new Error("hex string expected, got " + typeof O);
          if (v) return Uint8Array.fromHex(O);
          const C = O.length,
            q = C / 2;
          if (C % 2) throw new Error("hex string expected, got unpadded hex of length " + C);
          const M = new Uint8Array(q);
          for (let N = 0, z = 0; N < q; N++, z += 2) {
            const $ = d(O.charCodeAt(z)),
              U = d(O.charCodeAt(z + 1));
            if ($ === void 0 || U === void 0) {
              const G = O[z] + O[z + 1];
              throw new Error('hex string expected, got non-hex character "' + G + '" at index ' + z);
            }
            M[N] = $ * 16 + U;
          }
          return M;
        }
        const p = async () => {};
        e.nextTick = p;
        async function y(O, C, q) {
          let M = Date.now();
          for (let N = 0; N < O; N++) {
            q(N);
            const z = Date.now() - M;
            (z >= 0 && z < C) || (await (0, e.nextTick)(), (M += z));
          }
        }
        function I(O) {
          if (typeof O != "string") throw new Error("string expected");
          return new Uint8Array(new TextEncoder().encode(O));
        }
        function w(O) {
          return new TextDecoder().decode(O);
        }
        function A(O) {
          return (typeof O == "string" && (O = I(O)), o(O), O);
        }
        function B(O) {
          return (typeof O == "string" && (O = I(O)), o(O), O);
        }
        function R(...O) {
          let C = 0;
          for (let M = 0; M < O.length; M++) {
            const N = O[M];
            (o(N), (C += N.length));
          }
          const q = new Uint8Array(C);
          for (let M = 0, N = 0; M < O.length; M++) {
            const z = O[M];
            (q.set(z, N), (N += z.length));
          }
          return q;
        }
        function S(O, C) {
          if (C !== void 0 && {}.toString.call(C) !== "[object Object]")
            throw new Error("options should be object or undefined");
          return Object.assign(O, C);
        }
        class x {}
        e.Hash = x;
        function F(O) {
          const C = (M) => O().update(A(M)).digest(),
            q = O();
          return ((C.outputLen = q.outputLen), (C.blockLen = q.blockLen), (C.create = () => O()), C);
        }
        function H(O) {
          const C = (M, N) => O(N).update(A(M)).digest(),
            q = O({});
          return ((C.outputLen = q.outputLen), (C.blockLen = q.blockLen), (C.create = (M) => O(M)), C);
        }
        function T(O) {
          const C = (M, N) => O(N).update(A(M)).digest(),
            q = O({});
          return ((C.outputLen = q.outputLen), (C.blockLen = q.blockLen), (C.create = (M) => O(M)), C);
        }
        ((e.wrapConstructor = F), (e.wrapConstructorWithOpts = H), (e.wrapXOFConstructorWithOpts = T));
        function k(O = 32) {
          if (r.crypto && typeof r.crypto.getRandomValues == "function")
            return r.crypto.getRandomValues(new Uint8Array(O));
          if (r.crypto && typeof r.crypto.randomBytes == "function") return Uint8Array.from(r.crypto.randomBytes(O));
          throw new Error("crypto.getRandomValues must be defined");
        }
      })(wd)),
    wd
  );
}
var a0;
function eg() {
  if (a0) return je;
  ((a0 = 1),
    Object.defineProperty(je, "__esModule", { value: !0 }),
    (je.shake256 =
      je.shake128 =
      je.keccak_512 =
      je.keccak_384 =
      je.keccak_256 =
      je.keccak_224 =
      je.sha3_512 =
      je.sha3_384 =
      je.sha3_256 =
      je.sha3_224 =
      je.Keccak =
        void 0),
    (je.keccakP = v));
  const e = Qp(),
    r = sr(),
    n = BigInt(0),
    t = BigInt(1),
    o = BigInt(2),
    s = BigInt(7),
    i = BigInt(256),
    a = BigInt(113),
    c = [],
    u = [],
    l = [];
  for (let d = 0, j = t, p = 1, y = 0; d < 24; d++) {
    (([p, y] = [y, (2 * p + 3 * y) % 5]), c.push(2 * (5 * y + p)), u.push((((d + 1) * (d + 2)) / 2) % 64));
    let I = n;
    for (let w = 0; w < 7; w++) ((j = ((j << t) ^ ((j >> s) * a)) % i), j & o && (I ^= t << ((t << BigInt(w)) - t)));
    l.push(I);
  }
  const f = (0, e.split)(l, !0),
    m = f[0],
    g = f[1],
    h = (d, j, p) => (p > 32 ? (0, e.rotlBH)(d, j, p) : (0, e.rotlSH)(d, j, p)),
    b = (d, j, p) => (p > 32 ? (0, e.rotlBL)(d, j, p) : (0, e.rotlSL)(d, j, p));
  function v(d, j = 24) {
    const p = new Uint32Array(10);
    for (let y = 24 - j; y < 24; y++) {
      for (let A = 0; A < 10; A++) p[A] = d[A] ^ d[A + 10] ^ d[A + 20] ^ d[A + 30] ^ d[A + 40];
      for (let A = 0; A < 10; A += 2) {
        const B = (A + 8) % 10,
          R = (A + 2) % 10,
          S = p[R],
          x = p[R + 1],
          F = h(S, x, 1) ^ p[B],
          H = b(S, x, 1) ^ p[B + 1];
        for (let T = 0; T < 50; T += 10) ((d[A + T] ^= F), (d[A + T + 1] ^= H));
      }
      let I = d[2],
        w = d[3];
      for (let A = 0; A < 24; A++) {
        const B = u[A],
          R = h(I, w, B),
          S = b(I, w, B),
          x = c[A];
        ((I = d[x]), (w = d[x + 1]), (d[x] = R), (d[x + 1] = S));
      }
      for (let A = 0; A < 50; A += 10) {
        for (let B = 0; B < 10; B++) p[B] = d[A + B];
        for (let B = 0; B < 10; B++) d[A + B] ^= ~p[(B + 2) % 10] & p[(B + 4) % 10];
      }
      ((d[0] ^= m[y]), (d[1] ^= g[y]));
    }
    (0, r.clean)(p);
  }
  class _ extends r.Hash {
    constructor(j, p, y, I = !1, w = 24) {
      if (
        (super(),
        (this.pos = 0),
        (this.posOut = 0),
        (this.finished = !1),
        (this.destroyed = !1),
        (this.enableXOF = !1),
        (this.blockLen = j),
        (this.suffix = p),
        (this.outputLen = y),
        (this.enableXOF = I),
        (this.rounds = w),
        (0, r.anumber)(y),
        !(0 < j && j < 200))
      )
        throw new Error("only keccak-f1600 function is supported");
      ((this.state = new Uint8Array(200)), (this.state32 = (0, r.u32)(this.state)));
    }
    clone() {
      return this._cloneInto();
    }
    keccak() {
      ((0, r.swap32IfBE)(this.state32),
        v(this.state32, this.rounds),
        (0, r.swap32IfBE)(this.state32),
        (this.posOut = 0),
        (this.pos = 0));
    }
    update(j) {
      ((0, r.aexists)(this), (j = (0, r.toBytes)(j)), (0, r.abytes)(j));
      const { blockLen: p, state: y } = this,
        I = j.length;
      for (let w = 0; w < I; ) {
        const A = Math.min(p - this.pos, I - w);
        for (let B = 0; B < A; B++) y[this.pos++] ^= j[w++];
        this.pos === p && this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished) return;
      this.finished = !0;
      const { state: j, suffix: p, pos: y, blockLen: I } = this;
      ((j[y] ^= p), (p & 128) !== 0 && y === I - 1 && this.keccak(), (j[I - 1] ^= 128), this.keccak());
    }
    writeInto(j) {
      ((0, r.aexists)(this, !1), (0, r.abytes)(j), this.finish());
      const p = this.state,
        { blockLen: y } = this;
      for (let I = 0, w = j.length; I < w; ) {
        this.posOut >= y && this.keccak();
        const A = Math.min(y - this.posOut, w - I);
        (j.set(p.subarray(this.posOut, this.posOut + A), I), (this.posOut += A), (I += A));
      }
      return j;
    }
    xofInto(j) {
      if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
      return this.writeInto(j);
    }
    xof(j) {
      return ((0, r.anumber)(j), this.xofInto(new Uint8Array(j)));
    }
    digestInto(j) {
      if (((0, r.aoutput)(j, this), this.finished)) throw new Error("digest() was already called");
      return (this.writeInto(j), this.destroy(), j);
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      ((this.destroyed = !0), (0, r.clean)(this.state));
    }
    _cloneInto(j) {
      const { blockLen: p, suffix: y, outputLen: I, rounds: w, enableXOF: A } = this;
      return (
        j || (j = new _(p, y, I, A, w)),
        j.state32.set(this.state32),
        (j.pos = this.pos),
        (j.posOut = this.posOut),
        (j.finished = this.finished),
        (j.rounds = w),
        (j.suffix = y),
        (j.outputLen = I),
        (j.enableXOF = A),
        (j.destroyed = this.destroyed),
        j
      );
    }
  }
  je.Keccak = _;
  const E = (d, j, p) => (0, r.createHasher)(() => new _(j, d, p));
  ((je.sha3_224 = E(6, 144, 224 / 8)),
    (je.sha3_256 = E(6, 136, 256 / 8)),
    (je.sha3_384 = E(6, 104, 384 / 8)),
    (je.sha3_512 = E(6, 72, 512 / 8)),
    (je.keccak_224 = E(1, 144, 224 / 8)),
    (je.keccak_256 = E(1, 136, 256 / 8)),
    (je.keccak_384 = E(1, 104, 384 / 8)),
    (je.keccak_512 = E(1, 72, 512 / 8)));
  const P = (d, j, p) => (0, r.createXOFer)((y = {}) => new _(j, d, y.dkLen === void 0 ? p : y.dkLen, !0));
  return ((je.shake128 = P(31, 168, 128 / 8)), (je.shake256 = P(31, 136, 256 / 8)), je);
}
var s0;
function Xe() {
  if (s0) return Ti;
  ((s0 = 1), Object.defineProperty(Ti, "__esModule", { value: !0 }), (Ti.keccak256 = o));
  const e = eg(),
    r = Ge(),
    n = ve(),
    t = te();
  function o(s, i) {
    const a = i || "hex",
      c = (0, e.keccak_256)((0, r.isHex)(s, { strict: !1 }) ? (0, n.toBytes)(s) : s);
    return a === "bytes" ? c : (0, t.toHex)(c);
  }
  return Ti;
}
var Wn = {},
  Si = {},
  Ii = {},
  c0;
function Nv() {
  if (c0) return Ii;
  ((c0 = 1), Object.defineProperty(Ii, "__esModule", { value: !0 }), (Ii.hashSignature = t));
  const e = ve(),
    r = Xe(),
    n = (o) => (0, r.keccak256)((0, e.toBytes)(o));
  function t(o) {
    return n(o);
  }
  return Ii;
}
var Kn = {},
  Ri = {},
  u0;
function $v() {
  if (u0) return Ri;
  ((u0 = 1), Object.defineProperty(Ri, "__esModule", { value: !0 }), (Ri.normalizeSignature = r));
  const e = ue();
  function r(n) {
    let t = !0,
      o = "",
      s = 0,
      i = "",
      a = !1;
    for (let c = 0; c < n.length; c++) {
      const u = n[c];
      if ((["(", ")", ","].includes(u) && (t = !0), u === "(" && s++, u === ")" && s--, !!t)) {
        if (s === 0) {
          if (u === " " && ["event", "function", ""].includes(i)) i = "";
          else if (((i += u), u === ")")) {
            a = !0;
            break;
          }
          continue;
        }
        if (u === " ") {
          n[c - 1] !== "," && o !== "," && o !== ",(" && ((o = ""), (t = !1));
          continue;
        }
        ((i += u), (o += u));
      }
    }
    if (!a) throw new e.BaseError("Unable to normalize signature.");
    return i;
  }
  return Ri;
}
var d0;
function Yd() {
  if (d0) return Kn;
  ((d0 = 1), Object.defineProperty(Kn, "__esModule", { value: !0 }), (Kn.toSignature = void 0));
  const e = ir(),
    r = $v(),
    n = (t) => {
      const o = typeof t == "string" ? t : (0, e.formatAbiItem)(t);
      return (0, r.normalizeSignature)(o);
    };
  return ((Kn.toSignature = n), Kn);
}
var f0;
function Iu() {
  if (f0) return Si;
  ((f0 = 1), Object.defineProperty(Si, "__esModule", { value: !0 }), (Si.toSignatureHash = n));
  const e = Nv(),
    r = Yd();
  function n(t) {
    return (0, e.hashSignature)((0, r.toSignature)(t));
  }
  return Si;
}
var l0;
function vn() {
  if (l0) return Wn;
  ((l0 = 1), Object.defineProperty(Wn, "__esModule", { value: !0 }), (Wn.toEventSelector = void 0));
  const e = Iu();
  return ((Wn.toEventSelector = e.toSignatureHash), Wn);
}
var Zn = {},
  Jn = {},
  b0;
function _t() {
  if (b0) return Jn;
  ((b0 = 1), Object.defineProperty(Jn, "__esModule", { value: !0 }), (Jn.InvalidAddressError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ address: t }) {
      super(`Address "${t}" is invalid.`, {
        metaMessages: [
          "- Address must be a hex value of 20 bytes (40 hex characters).",
          "- Address must match its checksum counterpart.",
        ],
        name: "InvalidAddressError",
      });
    }
  }
  return ((Jn.InvalidAddressError = r), Jn);
}
var Pd = {},
  Yn = {},
  m0;
function Nr() {
  if (m0) return Yn;
  ((m0 = 1), Object.defineProperty(Yn, "__esModule", { value: !0 }), (Yn.LruMap = void 0));
  class e extends Map {
    constructor(n) {
      (super(),
        Object.defineProperty(this, "maxSize", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.maxSize = n));
    }
    get(n) {
      const t = super.get(n);
      return (super.has(n) && (super.delete(n), super.set(n, t)), t);
    }
    set(n, t) {
      if ((super.has(n) && super.delete(n), super.set(n, t), this.maxSize && this.size > this.maxSize)) {
        const o = super.keys().next().value;
        o !== void 0 && super.delete(o);
      }
      return this;
    }
  }
  return ((Yn.LruMap = e), Yn);
}
var Xn = {},
  h0;
function Qe() {
  if (h0) return Xn;
  ((h0 = 1), Object.defineProperty(Xn, "__esModule", { value: !0 }), (Xn.checksumAddress = i), (Xn.getAddress = a));
  const e = _t(),
    r = ve(),
    n = Xe(),
    t = Nr(),
    o = et(),
    s = new t.LruMap(8192);
  function i(c, u) {
    if (s.has(`${c}.${u}`)) return s.get(`${c}.${u}`);
    const l = u ? `${u}${c.toLowerCase()}` : c.substring(2).toLowerCase(),
      f = (0, n.keccak256)((0, r.stringToBytes)(l), "bytes"),
      m = (u ? l.substring(`${u}0x`.length) : l).split("");
    for (let h = 0; h < 40; h += 2)
      (f[h >> 1] >> 4 >= 8 && m[h] && (m[h] = m[h].toUpperCase()),
        (f[h >> 1] & 15) >= 8 && m[h + 1] && (m[h + 1] = m[h + 1].toUpperCase()));
    const g = `0x${m.join("")}`;
    return (s.set(`${c}.${u}`, g), g);
  }
  function a(c, u) {
    if (!(0, o.isAddress)(c, { strict: !1 })) throw new e.InvalidAddressError({ address: c });
    return i(c, u);
  }
  return Xn;
}
var y0;
function et() {
  return (
    y0 ||
      ((y0 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.isAddressCache = void 0), (e.isAddress = o));
        const r = Nr(),
          n = Qe(),
          t = /^0x[a-fA-F0-9]{40}$/;
        e.isAddressCache = new r.LruMap(8192);
        function o(s, i) {
          const { strict: a = !0 } = i ?? {},
            c = `${s}.${a}`;
          if (e.isAddressCache.has(c)) return e.isAddressCache.get(c);
          const u = t.test(s) ? (s.toLowerCase() === s ? !0 : a ? (0, n.checksumAddress)(s) === s : !0) : !1;
          return (e.isAddressCache.set(c, u), u);
        }
      })(Pd)),
    Pd
  );
}
var Qr = {},
  p0;
function qe() {
  if (p0) return Qr;
  ((p0 = 1),
    Object.defineProperty(Qr, "__esModule", { value: !0 }),
    (Qr.concat = e),
    (Qr.concatBytes = r),
    (Qr.concatHex = n));
  function e(t) {
    return typeof t[0] == "string" ? n(t) : r(t);
  }
  function r(t) {
    let o = 0;
    for (const a of t) o += a.length;
    const s = new Uint8Array(o);
    let i = 0;
    for (const a of t) (s.set(a, i), (i += a.length));
    return s;
  }
  function n(t) {
    return `0x${t.reduce((o, s) => o + s.replace("0x", ""), "")}`;
  }
  return Qr;
}
var en = {},
  g0;
function st() {
  if (g0) return en;
  ((g0 = 1),
    Object.defineProperty(en, "__esModule", { value: !0 }),
    (en.slice = t),
    (en.sliceBytes = i),
    (en.sliceHex = a));
  const e = Su(),
    r = Ge(),
    n = Ve();
  function t(c, u, l, { strict: f } = {}) {
    return (0, r.isHex)(c, { strict: !1 }) ? a(c, u, l, { strict: f }) : i(c, u, l, { strict: f });
  }
  function o(c, u) {
    if (typeof u == "number" && u > 0 && u > (0, n.size)(c) - 1)
      throw new e.SliceOffsetOutOfBoundsError({ offset: u, position: "start", size: (0, n.size)(c) });
  }
  function s(c, u, l) {
    if (typeof u == "number" && typeof l == "number" && (0, n.size)(c) !== l - u)
      throw new e.SliceOffsetOutOfBoundsError({ offset: l, position: "end", size: (0, n.size)(c) });
  }
  function i(c, u, l, { strict: f } = {}) {
    o(c, u);
    const m = c.slice(u, l);
    return (f && s(m, u, l), m);
  }
  function a(c, u, l, { strict: f } = {}) {
    o(c, u);
    const m = `0x${c.replace("0x", "").slice((u ?? 0) * 2, (l ?? c.length) * 2)}`;
    return (f && s(m, u, l), m);
  }
  return en;
}
var Ft = {},
  _0;
function Ru() {
  return (
    _0 ||
      ((_0 = 1),
      Object.defineProperty(Ft, "__esModule", { value: !0 }),
      (Ft.integerRegex = Ft.bytesRegex = Ft.arrayRegex = void 0),
      (Ft.arrayRegex = /^(.*)\[([0-9]*)\]$/),
      (Ft.bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/),
      (Ft.integerRegex =
        /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/)),
    Ft
  );
}
var v0;
function vt() {
  if (v0) return Zn;
  ((v0 = 1),
    Object.defineProperty(Zn, "__esModule", { value: !0 }),
    (Zn.encodeAbiParameters = f),
    (Zn.getArrayComponents = p));
  const e = Se(),
    r = _t(),
    n = ue(),
    t = _n(),
    o = et(),
    s = qe(),
    i = ar(),
    a = Ve(),
    c = st(),
    u = te(),
    l = Ru();
  function f(y, I) {
    if (y.length !== I.length)
      throw new e.AbiEncodingLengthMismatchError({ expectedLength: y.length, givenLength: I.length });
    const w = m({ params: y, values: I }),
      A = h(w);
    return A.length === 0 ? "0x" : A;
  }
  function m({ params: y, values: I }) {
    const w = [];
    for (let A = 0; A < y.length; A++) w.push(g({ param: y[A], value: I[A] }));
    return w;
  }
  function g({ param: y, value: I }) {
    const w = p(y.type);
    if (w) {
      const [A, B] = w;
      return v(I, { length: A, param: { ...y, type: B } });
    }
    if (y.type === "tuple") return j(I, { param: y });
    if (y.type === "address") return b(I);
    if (y.type === "bool") return E(I);
    if (y.type.startsWith("uint") || y.type.startsWith("int")) {
      const A = y.type.startsWith("int"),
        [, , B = "256"] = l.integerRegex.exec(y.type) ?? [];
      return P(I, { signed: A, size: Number(B) });
    }
    if (y.type.startsWith("bytes")) return _(I, { param: y });
    if (y.type === "string") return d(I);
    throw new e.InvalidAbiEncodingTypeError(y.type, { docsPath: "/docs/contract/encodeAbiParameters" });
  }
  function h(y) {
    let I = 0;
    for (let R = 0; R < y.length; R++) {
      const { dynamic: S, encoded: x } = y[R];
      S ? (I += 32) : (I += (0, a.size)(x));
    }
    const w = [],
      A = [];
    let B = 0;
    for (let R = 0; R < y.length; R++) {
      const { dynamic: S, encoded: x } = y[R];
      S ? (w.push((0, u.numberToHex)(I + B, { size: 32 })), A.push(x), (B += (0, a.size)(x))) : w.push(x);
    }
    return (0, s.concat)([...w, ...A]);
  }
  function b(y) {
    if (!(0, o.isAddress)(y)) throw new r.InvalidAddressError({ address: y });
    return { dynamic: !1, encoded: (0, i.padHex)(y.toLowerCase()) };
  }
  function v(y, { length: I, param: w }) {
    const A = I === null;
    if (!Array.isArray(y)) throw new e.InvalidArrayError(y);
    if (!A && y.length !== I)
      throw new e.AbiEncodingArrayLengthMismatchError({
        expectedLength: I,
        givenLength: y.length,
        type: `${w.type}[${I}]`,
      });
    let B = !1;
    const R = [];
    for (let S = 0; S < y.length; S++) {
      const x = g({ param: w, value: y[S] });
      (x.dynamic && (B = !0), R.push(x));
    }
    if (A || B) {
      const S = h(R);
      if (A) {
        const x = (0, u.numberToHex)(R.length, { size: 32 });
        return { dynamic: !0, encoded: R.length > 0 ? (0, s.concat)([x, S]) : x };
      }
      if (B) return { dynamic: !0, encoded: S };
    }
    return { dynamic: !1, encoded: (0, s.concat)(R.map(({ encoded: S }) => S)) };
  }
  function _(y, { param: I }) {
    const [, w] = I.type.split("bytes"),
      A = (0, a.size)(y);
    if (!w) {
      let B = y;
      return (
        A % 32 !== 0 && (B = (0, i.padHex)(B, { dir: "right", size: Math.ceil((y.length - 2) / 2 / 32) * 32 })),
        { dynamic: !0, encoded: (0, s.concat)([(0, i.padHex)((0, u.numberToHex)(A, { size: 32 })), B]) }
      );
    }
    if (A !== Number.parseInt(w, 10))
      throw new e.AbiEncodingBytesSizeMismatchError({ expectedSize: Number.parseInt(w, 10), value: y });
    return { dynamic: !1, encoded: (0, i.padHex)(y, { dir: "right" }) };
  }
  function E(y) {
    if (typeof y != "boolean")
      throw new n.BaseError(`Invalid boolean value: "${y}" (type: ${typeof y}). Expected: \`true\` or \`false\`.`);
    return { dynamic: !1, encoded: (0, i.padHex)((0, u.boolToHex)(y)) };
  }
  function P(y, { signed: I, size: w = 256 }) {
    if (typeof w == "number") {
      const A = 2n ** (BigInt(w) - (I ? 1n : 0n)) - 1n,
        B = I ? -A - 1n : 0n;
      if (y > A || y < B)
        throw new t.IntegerOutOfRangeError({
          max: A.toString(),
          min: B.toString(),
          signed: I,
          size: w / 8,
          value: y.toString(),
        });
    }
    return { dynamic: !1, encoded: (0, u.numberToHex)(y, { size: 32, signed: I }) };
  }
  function d(y) {
    const I = (0, u.stringToHex)(y),
      w = Math.ceil((0, a.size)(I) / 32),
      A = [];
    for (let B = 0; B < w; B++) A.push((0, i.padHex)((0, c.slice)(I, B * 32, (B + 1) * 32), { dir: "right" }));
    return {
      dynamic: !0,
      encoded: (0, s.concat)([(0, i.padHex)((0, u.numberToHex)((0, a.size)(I), { size: 32 })), ...A]),
    };
  }
  function j(y, { param: I }) {
    let w = !1;
    const A = [];
    for (let B = 0; B < I.components.length; B++) {
      const R = I.components[B],
        S = Array.isArray(y) ? B : R.name,
        x = g({ param: R, value: y[S] });
      (A.push(x), x.dynamic && (w = !0));
    }
    return { dynamic: w, encoded: w ? h(A) : (0, s.concat)(A.map(({ encoded: B }) => B)) };
  }
  function p(y) {
    const I = y.match(/^(.*)\[(\d+)?\]$/);
    return I ? [I[2] ? Number(I[2]) : null, I[1]] : void 0;
  }
  return Zn;
}
var tn = {},
  Qn = {},
  E0;
function $r() {
  if (E0) return Qn;
  ((E0 = 1), Object.defineProperty(Qn, "__esModule", { value: !0 }), (Qn.toFunctionSelector = void 0));
  const e = st(),
    r = Iu(),
    n = (t) => (0, e.slice)((0, r.toSignatureHash)(t), 0, 4);
  return ((Qn.toFunctionSelector = n), Qn);
}
var j0;
function Kt() {
  if (j0) return tn;
  ((j0 = 1),
    Object.defineProperty(tn, "__esModule", { value: !0 }),
    (tn.getAbiItem = s),
    (tn.isArgOfType = i),
    (tn.getAmbiguousTypes = a));
  const e = Se(),
    r = Ge(),
    n = et(),
    t = vn(),
    o = $r();
  function s(c) {
    const { abi: u, args: l = [], name: f } = c,
      m = (0, r.isHex)(f, { strict: !1 }),
      g = u.filter((b) =>
        m
          ? b.type === "function"
            ? (0, o.toFunctionSelector)(b) === f
            : b.type === "event"
              ? (0, t.toEventSelector)(b) === f
              : !1
          : "name" in b && b.name === f,
      );
    if (g.length === 0) return;
    if (g.length === 1) return g[0];
    let h;
    for (const b of g) {
      if (!("inputs" in b)) continue;
      if (!l || l.length === 0) {
        if (!b.inputs || b.inputs.length === 0) return b;
        continue;
      }
      if (!b.inputs || b.inputs.length === 0 || b.inputs.length !== l.length) continue;
      if (
        l.every((_, E) => {
          const P = "inputs" in b && b.inputs[E];
          return P ? i(_, P) : !1;
        })
      ) {
        if (h && "inputs" in h && h.inputs) {
          const _ = a(b.inputs, h.inputs, l);
          if (_) throw new e.AbiItemAmbiguityError({ abiItem: b, type: _[0] }, { abiItem: h, type: _[1] });
        }
        h = b;
      }
    }
    return h || g[0];
  }
  function i(c, u) {
    const l = typeof c,
      f = u.type;
    switch (f) {
      case "address":
        return (0, n.isAddress)(c, { strict: !1 });
      case "bool":
        return l === "boolean";
      case "function":
        return l === "string";
      case "string":
        return l === "string";
      default:
        return f === "tuple" && "components" in u
          ? Object.values(u.components).every((m, g) => l === "object" && i(Object.values(c)[g], m))
          : /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(
                f,
              )
            ? l === "number" || l === "bigint"
            : /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(f)
              ? l === "string" || c instanceof Uint8Array
              : /[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(f)
                ? Array.isArray(c) && c.every((m) => i(m, { ...u, type: f.replace(/(\[[0-9]{0,}\])$/, "") }))
                : !1;
    }
  }
  function a(c, u, l) {
    for (const f in c) {
      const m = c[f],
        g = u[f];
      if (m.type === "tuple" && g.type === "tuple" && "components" in m && "components" in g)
        return a(m.components, g.components, l[f]);
      const h = [m.type, g.type];
      if (
        h.includes("address") && h.includes("bytes20")
          ? !0
          : h.includes("address") && h.includes("string")
            ? (0, n.isAddress)(l[f], { strict: !1 })
            : h.includes("address") && h.includes("bytes")
              ? (0, n.isAddress)(l[f], { strict: !1 })
              : !1
      )
        return h;
    }
  }
  return tn;
}
var w0;
function zr() {
  if (w0) return ji;
  ((w0 = 1), Object.defineProperty(ji, "__esModule", { value: !0 }), (ji.encodeEventTopics = u));
  const e = Se(),
    r = Xp(),
    n = ve(),
    t = Xe(),
    o = vn(),
    s = vt(),
    i = Vt(),
    a = Kt(),
    c = "/docs/contract/encodeEventTopics";
  function u(f) {
    var P;
    const { abi: m, eventName: g, args: h } = f;
    let b = m[0];
    if (g) {
      const d = (0, a.getAbiItem)({ abi: m, name: g });
      if (!d) throw new e.AbiEventNotFoundError(g, { docsPath: c });
      b = d;
    }
    if (b.type !== "event") throw new e.AbiEventNotFoundError(void 0, { docsPath: c });
    const v = (0, i.formatAbiItem)(b),
      _ = (0, o.toEventSelector)(v);
    let E = [];
    if (h && "inputs" in b) {
      const d = (P = b.inputs) == null ? void 0 : P.filter((p) => "indexed" in p && p.indexed),
        j = Array.isArray(h)
          ? h
          : Object.values(h).length > 0
            ? ((d == null ? void 0 : d.map((p) => h[p.name])) ?? [])
            : [];
      j.length > 0 &&
        (E =
          (d == null
            ? void 0
            : d.map((p, y) =>
                Array.isArray(j[y])
                  ? j[y].map((I, w) => l({ param: p, value: j[y][w] }))
                  : typeof j[y] < "u" && j[y] !== null
                    ? l({ param: p, value: j[y] })
                    : null,
              )) ?? []);
    }
    return [_, ...E];
  }
  function l({ param: f, value: m }) {
    if (f.type === "string" || f.type === "bytes") return (0, t.keccak256)((0, n.toBytes)(m));
    if (f.type === "tuple" || f.type.match(/^(.*)\[(\d+)?\]$/)) throw new r.FilterTypeNotSupportedError(f.type);
    return (0, s.encodeAbiParameters)([f], [m]);
  }
  return ji;
}
var Bi = {},
  P0;
function Bu() {
  if (P0) return Bi;
  ((P0 = 1), Object.defineProperty(Bi, "__esModule", { value: !0 }), (Bi.createFilterRequestScope = e));
  function e(r, { method: n }) {
    var o, s;
    const t = {};
    return (
      r.transport.type === "fallback" &&
        ((s = (o = r.transport).onResponse) == null ||
          s.call(o, ({ method: i, response: a, status: c, transport: u }) => {
            c === "success" && n === i && (t[a] = u.request);
          })),
      (i) => t[i] || r.request
    );
  }
  return Bi;
}
var A0;
function Xd() {
  if (A0) return Ei;
  ((A0 = 1), Object.defineProperty(Ei, "__esModule", { value: !0 }), (Ei.createContractEventFilter = t));
  const e = zr(),
    r = te(),
    n = Bu();
  async function t(o, s) {
    const { address: i, abi: a, args: c, eventName: u, fromBlock: l, strict: f, toBlock: m } = s,
      g = (0, n.createFilterRequestScope)(o, { method: "eth_newFilter" }),
      h = u ? (0, e.encodeEventTopics)({ abi: a, args: c, eventName: u }) : void 0,
      b = await o.request({
        method: "eth_newFilter",
        params: [
          {
            address: i,
            fromBlock: typeof l == "bigint" ? (0, r.numberToHex)(l) : l,
            toBlock: typeof m == "bigint" ? (0, r.numberToHex)(m) : m,
            topics: h,
          },
        ],
      });
    return { abi: a, args: c, eventName: u, id: b, request: g(b), strict: !!f, type: "event" };
  }
  return Ei;
}
var Oi = {},
  xi = {},
  T0;
function Ie() {
  if (T0) return xi;
  ((T0 = 1), Object.defineProperty(xi, "__esModule", { value: !0 }), (xi.parseAccount = e));
  function e(r) {
    return typeof r == "string" ? { address: r, type: "json-rpc" } : r;
  }
  return xi;
}
var Ci = {},
  qi = {},
  S0;
function tg() {
  if (S0) return qi;
  ((S0 = 1), Object.defineProperty(qi, "__esModule", { value: !0 }), (qi.prepareEncodeFunctionData = s));
  const e = Se(),
    r = $r(),
    n = Vt(),
    t = Kt(),
    o = "/docs/contract/encodeFunctionData";
  function s(i) {
    const { abi: a, args: c, functionName: u } = i;
    let l = a[0];
    if (u) {
      const f = (0, t.getAbiItem)({ abi: a, args: c, name: u });
      if (!f) throw new e.AbiFunctionNotFoundError(u, { docsPath: o });
      l = f;
    }
    if (l.type !== "function") throw new e.AbiFunctionNotFoundError(void 0, { docsPath: o });
    return { abi: [l], functionName: (0, r.toFunctionSelector)((0, n.formatAbiItem)(l)) };
  }
  return qi;
}
var I0;
function We() {
  if (I0) return Ci;
  ((I0 = 1), Object.defineProperty(Ci, "__esModule", { value: !0 }), (Ci.encodeFunctionData = t));
  const e = qe(),
    r = vt(),
    n = tg();
  function t(o) {
    const { args: s } = o,
      { abi: i, functionName: a } = (() => {
        var f;
        return o.abi.length === 1 && (f = o.functionName) != null && f.startsWith("0x")
          ? o
          : (0, n.prepareEncodeFunctionData)(o);
      })(),
      c = i[0],
      u = a,
      l = "inputs" in c && c.inputs ? (0, r.encodeAbiParameters)(c.inputs, s ?? []) : void 0;
    return (0, e.concatHex)([u, l ?? "0x"]);
  }
  return Ci;
}
var Mi = {},
  ze = {},
  Nt = {},
  R0;
function Qd() {
  return (
    R0 ||
      ((R0 = 1),
      Object.defineProperty(Nt, "__esModule", { value: !0 }),
      (Nt.solidityPanic = Nt.solidityError = Nt.panicReasons = void 0),
      (Nt.panicReasons = {
        1: "An `assert` condition failed.",
        17: "Arithmetic operation resulted in underflow or overflow.",
        18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
        33: "Attempted to convert to an invalid type.",
        34: "Attempted to access a storage byte array that is incorrectly encoded.",
        49: "Performed `.pop()` on an empty array",
        50: "Array index is out of bounds.",
        65: "Allocated too much memory or created an array which is too large.",
        81: "Attempted to call a zero-initialized variable of internal function type.",
      }),
      (Nt.solidityError = { inputs: [{ name: "message", type: "string" }], name: "Error", type: "error" }),
      (Nt.solidityPanic = { inputs: [{ name: "reason", type: "uint256" }], name: "Panic", type: "error" })),
    Nt
  );
}
var Hi = {},
  ki = {},
  Fi = {},
  $t = {},
  B0;
function rg() {
  if (B0) return $t;
  ((B0 = 1),
    Object.defineProperty($t, "__esModule", { value: !0 }),
    ($t.RecursiveReadLimitExceededError = $t.PositionOutOfBoundsError = $t.NegativeOffsetError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ offset: s }) {
      super(`Offset \`${s}\` cannot be negative.`, { name: "NegativeOffsetError" });
    }
  }
  $t.NegativeOffsetError = r;
  class n extends e.BaseError {
    constructor({ length: s, position: i }) {
      super(`Position \`${i}\` is out of bounds (\`0 < position < ${s}\`).`, { name: "PositionOutOfBoundsError" });
    }
  }
  $t.PositionOutOfBoundsError = n;
  class t extends e.BaseError {
    constructor({ count: s, limit: i }) {
      super(`Recursive read limit of \`${i}\` exceeded (recursive read count: \`${s}\`).`, {
        name: "RecursiveReadLimitExceededError",
      });
    }
  }
  return (($t.RecursiveReadLimitExceededError = t), $t);
}
var O0;
function qo() {
  if (O0) return Fi;
  ((O0 = 1), Object.defineProperty(Fi, "__esModule", { value: !0 }), (Fi.createCursor = n));
  const e = rg(),
    r = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new e.RecursiveReadLimitExceededError({
            count: this.recursiveReadCount + 1,
            limit: this.recursiveReadLimit,
          });
      },
      assertPosition(t) {
        if (t < 0 || t > this.bytes.length - 1)
          throw new e.PositionOutOfBoundsError({ length: this.bytes.length, position: t });
      },
      decrementPosition(t) {
        if (t < 0) throw new e.NegativeOffsetError({ offset: t });
        const o = this.position - t;
        (this.assertPosition(o), (this.position = o));
      },
      getReadCount(t) {
        return this.positionReadCount.get(t || this.position) || 0;
      },
      incrementPosition(t) {
        if (t < 0) throw new e.NegativeOffsetError({ offset: t });
        const o = this.position + t;
        (this.assertPosition(o), (this.position = o));
      },
      inspectByte(t) {
        const o = t ?? this.position;
        return (this.assertPosition(o), this.bytes[o]);
      },
      inspectBytes(t, o) {
        const s = o ?? this.position;
        return (this.assertPosition(s + t - 1), this.bytes.subarray(s, s + t));
      },
      inspectUint8(t) {
        const o = t ?? this.position;
        return (this.assertPosition(o), this.bytes[o]);
      },
      inspectUint16(t) {
        const o = t ?? this.position;
        return (this.assertPosition(o + 1), this.dataView.getUint16(o));
      },
      inspectUint24(t) {
        const o = t ?? this.position;
        return (this.assertPosition(o + 2), (this.dataView.getUint16(o) << 8) + this.dataView.getUint8(o + 2));
      },
      inspectUint32(t) {
        const o = t ?? this.position;
        return (this.assertPosition(o + 3), this.dataView.getUint32(o));
      },
      pushByte(t) {
        (this.assertPosition(this.position), (this.bytes[this.position] = t), this.position++);
      },
      pushBytes(t) {
        (this.assertPosition(this.position + t.length - 1),
          this.bytes.set(t, this.position),
          (this.position += t.length));
      },
      pushUint8(t) {
        (this.assertPosition(this.position), (this.bytes[this.position] = t), this.position++);
      },
      pushUint16(t) {
        (this.assertPosition(this.position + 1), this.dataView.setUint16(this.position, t), (this.position += 2));
      },
      pushUint24(t) {
        (this.assertPosition(this.position + 2),
          this.dataView.setUint16(this.position, t >> 8),
          this.dataView.setUint8(this.position + 2, t & 255),
          (this.position += 3));
      },
      pushUint32(t) {
        (this.assertPosition(this.position + 3), this.dataView.setUint32(this.position, t), (this.position += 4));
      },
      readByte() {
        (this.assertReadLimit(), this._touch());
        const t = this.inspectByte();
        return (this.position++, t);
      },
      readBytes(t, o) {
        (this.assertReadLimit(), this._touch());
        const s = this.inspectBytes(t);
        return ((this.position += o ?? t), s);
      },
      readUint8() {
        (this.assertReadLimit(), this._touch());
        const t = this.inspectUint8();
        return ((this.position += 1), t);
      },
      readUint16() {
        (this.assertReadLimit(), this._touch());
        const t = this.inspectUint16();
        return ((this.position += 2), t);
      },
      readUint24() {
        (this.assertReadLimit(), this._touch());
        const t = this.inspectUint24();
        return ((this.position += 3), t);
      },
      readUint32() {
        (this.assertReadLimit(), this._touch());
        const t = this.inspectUint32();
        return ((this.position += 4), t);
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(t) {
        const o = this.position;
        return (this.assertPosition(t), (this.position = t), () => (this.position = o));
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY) return;
        const t = this.getReadCount();
        (this.positionReadCount.set(this.position, t + 1), t > 0 && this.recursiveReadCount++);
      },
    };
  function n(t, { recursiveReadLimit: o = 8192 } = {}) {
    const s = Object.create(r);
    return (
      (s.bytes = t),
      (s.dataView = new DataView(t.buffer ?? t, t.byteOffset, t.byteLength)),
      (s.positionReadCount = new Map()),
      (s.recursiveReadLimit = o),
      s
    );
  }
  return Fi;
}
var Qt = {},
  x0;
function ef() {
  if (x0) return Qt;
  ((x0 = 1),
    Object.defineProperty(Qt, "__esModule", { value: !0 }),
    (Qt.fromBytes = o),
    (Qt.bytesToBigInt = s),
    (Qt.bytesToBool = i),
    (Qt.bytesToNumber = a),
    (Qt.bytesToString = c));
  const e = _n(),
    r = Wt(),
    n = Be(),
    t = te();
  function o(u, l) {
    const f = typeof l == "string" ? { to: l } : l,
      m = f.to;
    return m === "number"
      ? a(u, f)
      : m === "bigint"
        ? s(u, f)
        : m === "boolean"
          ? i(u, f)
          : m === "string"
            ? c(u, f)
            : (0, t.bytesToHex)(u, f);
  }
  function s(u, l = {}) {
    typeof l.size < "u" && (0, n.assertSize)(u, { size: l.size });
    const f = (0, t.bytesToHex)(u, l);
    return (0, n.hexToBigInt)(f, l);
  }
  function i(u, l = {}) {
    let f = u;
    if (
      (typeof l.size < "u" && ((0, n.assertSize)(f, { size: l.size }), (f = (0, r.trim)(f))), f.length > 1 || f[0] > 1)
    )
      throw new e.InvalidBytesBooleanError(f);
    return !!f[0];
  }
  function a(u, l = {}) {
    typeof l.size < "u" && (0, n.assertSize)(u, { size: l.size });
    const f = (0, t.bytesToHex)(u, l);
    return (0, n.hexToNumber)(f, l);
  }
  function c(u, l = {}) {
    let f = u;
    return (
      typeof l.size < "u" && ((0, n.assertSize)(f, { size: l.size }), (f = (0, r.trim)(f, { dir: "right" }))),
      new TextDecoder().decode(f)
    );
  }
  return Qt;
}
var C0;
function cr() {
  if (C0) return ki;
  ((C0 = 1), Object.defineProperty(ki, "__esModule", { value: !0 }), (ki.decodeAbiParameters = l));
  const e = Se(),
    r = Qe(),
    n = qo(),
    t = Ve(),
    o = st(),
    s = Wt(),
    i = ef(),
    a = ve(),
    c = te(),
    u = vt();
  function l(p, y) {
    const I = typeof y == "string" ? (0, a.hexToBytes)(y) : y,
      w = (0, n.createCursor)(I);
    if ((0, t.size)(I) === 0 && p.length > 0) throw new e.AbiDecodingZeroDataError();
    if ((0, t.size)(y) && (0, t.size)(y) < 32)
      throw new e.AbiDecodingDataSizeTooSmallError({
        data: typeof y == "string" ? y : (0, c.bytesToHex)(y),
        params: p,
        size: (0, t.size)(y),
      });
    let A = 0;
    const B = [];
    for (let R = 0; R < p.length; ++R) {
      const S = p[R];
      w.setPosition(A);
      const [x, F] = f(w, S, { staticPosition: 0 });
      ((A += F), B.push(x));
    }
    return B;
  }
  function f(p, y, { staticPosition: I }) {
    const w = (0, u.getArrayComponents)(y.type);
    if (w) {
      const [A, B] = w;
      return b(p, { ...y, type: B }, { length: A, staticPosition: I });
    }
    if (y.type === "tuple") return P(p, y, { staticPosition: I });
    if (y.type === "address") return h(p);
    if (y.type === "bool") return v(p);
    if (y.type.startsWith("bytes")) return _(p, y, { staticPosition: I });
    if (y.type.startsWith("uint") || y.type.startsWith("int")) return E(p, y);
    if (y.type === "string") return d(p, { staticPosition: I });
    throw new e.InvalidAbiDecodingTypeError(y.type, { docsPath: "/docs/contract/decodeAbiParameters" });
  }
  const m = 32,
    g = 32;
  function h(p) {
    const y = p.readBytes(32);
    return [(0, r.checksumAddress)((0, c.bytesToHex)((0, o.sliceBytes)(y, -20))), 32];
  }
  function b(p, y, { length: I, staticPosition: w }) {
    if (!I) {
      const R = (0, i.bytesToNumber)(p.readBytes(g)),
        S = w + R,
        x = S + m;
      p.setPosition(S);
      const F = (0, i.bytesToNumber)(p.readBytes(m)),
        H = j(y);
      let T = 0;
      const k = [];
      for (let O = 0; O < F; ++O) {
        p.setPosition(x + (H ? O * 32 : T));
        const [C, q] = f(p, y, { staticPosition: x });
        ((T += q), k.push(C));
      }
      return (p.setPosition(w + 32), [k, 32]);
    }
    if (j(y)) {
      const R = (0, i.bytesToNumber)(p.readBytes(g)),
        S = w + R,
        x = [];
      for (let F = 0; F < I; ++F) {
        p.setPosition(S + F * 32);
        const [H] = f(p, y, { staticPosition: S });
        x.push(H);
      }
      return (p.setPosition(w + 32), [x, 32]);
    }
    let A = 0;
    const B = [];
    for (let R = 0; R < I; ++R) {
      const [S, x] = f(p, y, { staticPosition: w + A });
      ((A += x), B.push(S));
    }
    return [B, A];
  }
  function v(p) {
    return [(0, i.bytesToBool)(p.readBytes(32), { size: 32 }), 32];
  }
  function _(p, y, { staticPosition: I }) {
    const [w, A] = y.type.split("bytes");
    if (!A) {
      const R = (0, i.bytesToNumber)(p.readBytes(32));
      p.setPosition(I + R);
      const S = (0, i.bytesToNumber)(p.readBytes(32));
      if (S === 0) return (p.setPosition(I + 32), ["0x", 32]);
      const x = p.readBytes(S);
      return (p.setPosition(I + 32), [(0, c.bytesToHex)(x), 32]);
    }
    return [(0, c.bytesToHex)(p.readBytes(Number.parseInt(A, 10), 32)), 32];
  }
  function E(p, y) {
    const I = y.type.startsWith("int"),
      w = Number.parseInt(y.type.split("int")[1] || "256", 10),
      A = p.readBytes(32);
    return [w > 48 ? (0, i.bytesToBigInt)(A, { signed: I }) : (0, i.bytesToNumber)(A, { signed: I }), 32];
  }
  function P(p, y, { staticPosition: I }) {
    const w = y.components.length === 0 || y.components.some(({ name: R }) => !R),
      A = w ? [] : {};
    let B = 0;
    if (j(y)) {
      const R = (0, i.bytesToNumber)(p.readBytes(g)),
        S = I + R;
      for (let x = 0; x < y.components.length; ++x) {
        const F = y.components[x];
        p.setPosition(S + B);
        const [H, T] = f(p, F, { staticPosition: S });
        ((B += T), (A[w ? x : F == null ? void 0 : F.name] = H));
      }
      return (p.setPosition(I + 32), [A, 32]);
    }
    for (let R = 0; R < y.components.length; ++R) {
      const S = y.components[R],
        [x, F] = f(p, S, { staticPosition: I });
      ((A[w ? R : S == null ? void 0 : S.name] = x), (B += F));
    }
    return [A, B];
  }
  function d(p, { staticPosition: y }) {
    const I = (0, i.bytesToNumber)(p.readBytes(32)),
      w = y + I;
    p.setPosition(w);
    const A = (0, i.bytesToNumber)(p.readBytes(32));
    if (A === 0) return (p.setPosition(y + 32), ["", 32]);
    const B = p.readBytes(A, 32),
      R = (0, i.bytesToString)((0, s.trim)(B));
    return (p.setPosition(y + 32), [R, 32]);
  }
  function j(p) {
    var w;
    const { type: y } = p;
    if (y === "string" || y === "bytes" || y.endsWith("[]")) return !0;
    if (y === "tuple") return (w = p.components) == null ? void 0 : w.some(j);
    const I = (0, u.getArrayComponents)(p.type);
    return !!(I && j({ ...p, type: I[1] }));
  }
  return ki;
}
var q0;
function Ou() {
  if (q0) return Hi;
  ((q0 = 1), Object.defineProperty(Hi, "__esModule", { value: !0 }), (Hi.decodeErrorResult = i));
  const e = Qd(),
    r = Se(),
    n = st(),
    t = $r(),
    o = cr(),
    s = Vt();
  function i(a) {
    const { abi: c, data: u, cause: l } = a,
      f = (0, n.slice)(u, 0, 4);
    if (f === "0x") throw new r.AbiDecodingZeroDataError({ cause: l });
    const g = [...(c || []), e.solidityError, e.solidityPanic].find(
      (h) => h.type === "error" && f === (0, t.toFunctionSelector)((0, s.formatAbiItem)(h)),
    );
    if (!g) throw new r.AbiErrorSignatureNotFoundError(f, { docsPath: "/docs/contract/decodeErrorResult", cause: l });
    return {
      abiItem: g,
      args:
        "inputs" in g && g.inputs && g.inputs.length > 0
          ? (0, o.decodeAbiParameters)(g.inputs, (0, n.slice)(u, 4))
          : void 0,
      errorName: g.name,
    };
  }
  return Hi;
}
var Ni = {},
  eo = {},
  M0;
function Fe() {
  if (M0) return eo;
  ((M0 = 1), Object.defineProperty(eo, "__esModule", { value: !0 }), (eo.stringify = void 0));
  const e = (r, n, t) =>
    JSON.stringify(
      r,
      (o, s) => {
        const i = typeof s == "bigint" ? s.toString() : s;
        return typeof n == "function" ? n(o, i) : i;
      },
      t,
    );
  return ((eo.stringify = e), eo);
}
var H0;
function ng() {
  if (H0) return Ni;
  ((H0 = 1), Object.defineProperty(Ni, "__esModule", { value: !0 }), (Ni.formatAbiItemWithArgs = r));
  const e = Fe();
  function r({ abiItem: n, args: t, includeFunctionName: o = !0, includeName: s = !1 }) {
    if ("name" in n && "inputs" in n && n.inputs)
      return `${o ? n.name : ""}(${n.inputs.map((i, a) => `${s && i.name ? `${i.name}: ` : ""}${typeof t[a] == "object" ? (0, e.stringify)(t[a]) : t[a]}`).join(", ")})`;
  }
  return Ni;
}
var $i = {},
  zt = {},
  k0;
function Mo() {
  return (
    k0 ||
      ((k0 = 1),
      Object.defineProperty(zt, "__esModule", { value: !0 }),
      (zt.weiUnits = zt.gweiUnits = zt.etherUnits = void 0),
      (zt.etherUnits = { gwei: 9, wei: 18 }),
      (zt.gweiUnits = { ether: -9, wei: 9 }),
      (zt.weiUnits = { ether: -18, gwei: -9 })),
    zt
  );
}
var zi = {},
  F0;
function xu() {
  if (F0) return zi;
  ((F0 = 1), Object.defineProperty(zi, "__esModule", { value: !0 }), (zi.formatUnits = e));
  function e(r, n) {
    let t = r.toString();
    const o = t.startsWith("-");
    (o && (t = t.slice(1)), (t = t.padStart(n, "0")));
    let [s, i] = [t.slice(0, t.length - n), t.slice(t.length - n)];
    return ((i = i.replace(/(0+)$/, "")), `${o ? "-" : ""}${s || "0"}${i ? `.${i}` : ""}`);
  }
  return zi;
}
var N0;
function Ho() {
  if (N0) return $i;
  ((N0 = 1), Object.defineProperty($i, "__esModule", { value: !0 }), ($i.formatEther = n));
  const e = Mo(),
    r = xu();
  function n(t, o = "wei") {
    return (0, r.formatUnits)(t, e.etherUnits[o]);
  }
  return $i;
}
var Ui = {},
  $0;
function Ur() {
  if ($0) return Ui;
  (($0 = 1), Object.defineProperty(Ui, "__esModule", { value: !0 }), (Ui.formatGwei = n));
  const e = Mo(),
    r = xu();
  function n(t, o = "wei") {
    return (0, r.formatUnits)(t, e.gweiUnits[o]);
  }
  return Ui;
}
var Ut = {},
  z0;
function tf() {
  if (z0) return Ut;
  ((z0 = 1),
    Object.defineProperty(Ut, "__esModule", { value: !0 }),
    (Ut.StateAssignmentConflictError = Ut.AccountStateConflictError = void 0),
    (Ut.prettyStateMapping = t),
    (Ut.prettyStateOverride = o));
  const e = ue();
  class r extends e.BaseError {
    constructor({ address: i }) {
      super(`State for account "${i}" is set multiple times.`, { name: "AccountStateConflictError" });
    }
  }
  Ut.AccountStateConflictError = r;
  class n extends e.BaseError {
    constructor() {
      super("state and stateDiff are set on the same account.", { name: "StateAssignmentConflictError" });
    }
  }
  Ut.StateAssignmentConflictError = n;
  function t(s) {
    return s.reduce(
      (i, { slot: a, value: c }) => `${i}        ${a}: ${c}
`,
      "",
    );
  }
  function o(s) {
    return s
      .reduce(
        (i, { address: a, ...c }) => {
          let u = `${i}    ${a}:
`;
          return (
            c.nonce &&
              (u += `      nonce: ${c.nonce}
`),
            c.balance &&
              (u += `      balance: ${c.balance}
`),
            c.code &&
              (u += `      code: ${c.code}
`),
            c.state &&
              ((u += `      state:
`),
              (u += t(c.state))),
            c.stateDiff &&
              ((u += `      stateDiff:
`),
              (u += t(c.stateDiff))),
            u
          );
        },
        `  State Override:
`,
      )
      .slice(0, -1);
  }
  return Ut;
}
var we = {},
  U0;
function tt() {
  if (U0) return we;
  ((U0 = 1),
    Object.defineProperty(we, "__esModule", { value: !0 }),
    (we.WaitForTransactionReceiptTimeoutError =
      we.TransactionReceiptRevertedError =
      we.TransactionReceiptNotFoundError =
      we.TransactionNotFoundError =
      we.TransactionExecutionError =
      we.InvalidStorageKeySizeError =
      we.InvalidSerializedTransactionError =
      we.InvalidSerializedTransactionTypeError =
      we.InvalidSerializableTransactionError =
      we.InvalidLegacyVError =
      we.FeeConflictError =
        void 0),
    (we.prettyPrint = t));
  const e = Ho(),
    r = Ur(),
    n = ue();
  function t(b) {
    const v = Object.entries(b)
        .map(([E, P]) => (P === void 0 || P === !1 ? null : [E, P]))
        .filter(Boolean),
      _ = v.reduce((E, [P]) => Math.max(E, P.length), 0);
    return v.map(([E, P]) => `  ${`${E}:`.padEnd(_ + 1)}  ${P}`).join(`
`);
  }
  class o extends n.BaseError {
    constructor() {
      super(
        [
          "Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.",
          "Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others.",
        ].join(`
`),
        { name: "FeeConflictError" },
      );
    }
  }
  we.FeeConflictError = o;
  class s extends n.BaseError {
    constructor({ v }) {
      super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, { name: "InvalidLegacyVError" });
    }
  }
  we.InvalidLegacyVError = s;
  class i extends n.BaseError {
    constructor({ transaction: v }) {
      super("Cannot infer a transaction type from provided transaction.", {
        metaMessages: [
          "Provided Transaction:",
          "{",
          t(v),
          "}",
          "",
          "To infer the type, either provide:",
          "- a `type` to the Transaction, or",
          "- an EIP-1559 Transaction with `maxFeePerGas`, or",
          "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
          "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
          "- an EIP-7702 Transaction with `authorizationList`, or",
          "- a Legacy Transaction with `gasPrice`",
        ],
        name: "InvalidSerializableTransactionError",
      });
    }
  }
  we.InvalidSerializableTransactionError = i;
  class a extends n.BaseError {
    constructor({ serializedType: v }) {
      (super(`Serialized transaction type "${v}" is invalid.`, { name: "InvalidSerializedTransactionType" }),
        Object.defineProperty(this, "serializedType", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: void 0,
        }),
        (this.serializedType = v));
    }
  }
  we.InvalidSerializedTransactionTypeError = a;
  class c extends n.BaseError {
    constructor({ attributes: v, serializedTransaction: _, type: E }) {
      const P = Object.entries(v)
        .map(([d, j]) => (typeof j > "u" ? d : void 0))
        .filter(Boolean);
      (super(`Invalid serialized transaction of type "${E}" was provided.`, {
        metaMessages: [
          `Serialized Transaction: "${_}"`,
          P.length > 0 ? `Missing Attributes: ${P.join(", ")}` : "",
        ].filter(Boolean),
        name: "InvalidSerializedTransactionError",
      }),
        Object.defineProperty(this, "serializedTransaction", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: void 0,
        }),
        Object.defineProperty(this, "type", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.serializedTransaction = _),
        (this.type = E));
    }
  }
  we.InvalidSerializedTransactionError = c;
  class u extends n.BaseError {
    constructor({ storageKey: v }) {
      super(`Size for storage key "${v}" is invalid. Expected 32 bytes. Got ${Math.floor((v.length - 2) / 2)} bytes.`, {
        name: "InvalidStorageKeySizeError",
      });
    }
  }
  we.InvalidStorageKeySizeError = u;
  class l extends n.BaseError {
    constructor(
      v,
      {
        account: _,
        docsPath: E,
        chain: P,
        data: d,
        gas: j,
        gasPrice: p,
        maxFeePerGas: y,
        maxPriorityFeePerGas: I,
        nonce: w,
        to: A,
        value: B,
      },
    ) {
      var S;
      const R = t({
        chain: P && `${P == null ? void 0 : P.name} (id: ${P == null ? void 0 : P.id})`,
        from: _ == null ? void 0 : _.address,
        to: A,
        value:
          typeof B < "u" &&
          `${(0, e.formatEther)(B)} ${((S = P == null ? void 0 : P.nativeCurrency) == null ? void 0 : S.symbol) || "ETH"}`,
        data: d,
        gas: j,
        gasPrice: typeof p < "u" && `${(0, r.formatGwei)(p)} gwei`,
        maxFeePerGas: typeof y < "u" && `${(0, r.formatGwei)(y)} gwei`,
        maxPriorityFeePerGas: typeof I < "u" && `${(0, r.formatGwei)(I)} gwei`,
        nonce: w,
      });
      (super(v.shortMessage, {
        cause: v,
        docsPath: E,
        metaMessages: [...(v.metaMessages ? [...v.metaMessages, " "] : []), "Request Arguments:", R].filter(Boolean),
        name: "TransactionExecutionError",
      }),
        Object.defineProperty(this, "cause", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.cause = v));
    }
  }
  we.TransactionExecutionError = l;
  class f extends n.BaseError {
    constructor({ blockHash: v, blockNumber: _, blockTag: E, hash: P, index: d }) {
      let j = "Transaction";
      (E && d !== void 0 && (j = `Transaction at block time "${E}" at index "${d}"`),
        v && d !== void 0 && (j = `Transaction at block hash "${v}" at index "${d}"`),
        _ && d !== void 0 && (j = `Transaction at block number "${_}" at index "${d}"`),
        P && (j = `Transaction with hash "${P}"`),
        super(`${j} could not be found.`, { name: "TransactionNotFoundError" }));
    }
  }
  we.TransactionNotFoundError = f;
  class m extends n.BaseError {
    constructor({ hash: v }) {
      super(
        `Transaction receipt with hash "${v}" could not be found. The Transaction may not be processed on a block yet.`,
        { name: "TransactionReceiptNotFoundError" },
      );
    }
  }
  we.TransactionReceiptNotFoundError = m;
  class g extends n.BaseError {
    constructor({ receipt: v }) {
      (super(`Transaction with hash "${v.transactionHash}" reverted.`, {
        metaMessages: [
          'The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.',
          " ",
          "You can attempt to extract the revert reason by:",
          "- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract",
          "- using the `call` Action with raw `data`",
        ],
        name: "TransactionReceiptRevertedError",
      }),
        Object.defineProperty(this, "receipt", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.receipt = v));
    }
  }
  we.TransactionReceiptRevertedError = g;
  class h extends n.BaseError {
    constructor({ hash: v }) {
      super(`Timed out while waiting for transaction with hash "${v}" to be confirmed.`, {
        name: "WaitForTransactionReceiptTimeoutError",
      });
    }
  }
  return ((we.WaitForTransactionReceiptTimeoutError = h), we);
}
var Ar = {},
  L0;
function rf() {
  if (L0) return Ar;
  ((L0 = 1), Object.defineProperty(Ar, "__esModule", { value: !0 }), (Ar.getUrl = Ar.getContractAddress = void 0));
  const e = (n) => n;
  Ar.getContractAddress = e;
  const r = (n) => {
    try {
      const t = new URL(n);
      return !t.username && !t.password ? n : ((t.username = ""), (t.password = ""), t.toString());
    } catch {
      return n;
    }
  };
  return ((Ar.getUrl = r), Ar);
}
var D0;
function ur() {
  if (D0) return ze;
  ((D0 = 1),
    Object.defineProperty(ze, "__esModule", { value: !0 }),
    (ze.RawContractError =
      ze.CounterfactualDeploymentFailedError =
      ze.ContractFunctionZeroDataError =
      ze.ContractFunctionRevertedError =
      ze.ContractFunctionExecutionError =
      ze.CallExecutionError =
        void 0));
  const e = Ie(),
    r = Qd(),
    n = Ou(),
    t = Vt(),
    o = ng(),
    s = Kt(),
    i = Ho(),
    a = Ur(),
    c = Se(),
    u = ue(),
    l = tf(),
    f = tt(),
    m = rf();
  class g extends u.BaseError {
    constructor(
      d,
      {
        account: j,
        docsPath: p,
        chain: y,
        data: I,
        gas: w,
        gasPrice: A,
        maxFeePerGas: B,
        maxPriorityFeePerGas: R,
        nonce: S,
        to: x,
        value: F,
        stateOverride: H,
      },
    ) {
      var O;
      const T = j ? (0, e.parseAccount)(j) : void 0;
      let k = (0, f.prettyPrint)({
        from: T == null ? void 0 : T.address,
        to: x,
        value:
          typeof F < "u" &&
          `${(0, i.formatEther)(F)} ${((O = y == null ? void 0 : y.nativeCurrency) == null ? void 0 : O.symbol) || "ETH"}`,
        data: I,
        gas: w,
        gasPrice: typeof A < "u" && `${(0, a.formatGwei)(A)} gwei`,
        maxFeePerGas: typeof B < "u" && `${(0, a.formatGwei)(B)} gwei`,
        maxPriorityFeePerGas: typeof R < "u" && `${(0, a.formatGwei)(R)} gwei`,
        nonce: S,
      });
      (H &&
        (k += `
${(0, l.prettyStateOverride)(H)}`),
        super(d.shortMessage, {
          cause: d,
          docsPath: p,
          metaMessages: [...(d.metaMessages ? [...d.metaMessages, " "] : []), "Raw Call Arguments:", k].filter(Boolean),
          name: "CallExecutionError",
        }),
        Object.defineProperty(this, "cause", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.cause = d));
    }
  }
  ze.CallExecutionError = g;
  class h extends u.BaseError {
    constructor(d, { abi: j, args: p, contractAddress: y, docsPath: I, functionName: w, sender: A }) {
      const B = (0, s.getAbiItem)({ abi: j, args: p, name: w }),
        R = B
          ? (0, o.formatAbiItemWithArgs)({ abiItem: B, args: p, includeFunctionName: !1, includeName: !1 })
          : void 0,
        S = B ? (0, t.formatAbiItem)(B, { includeName: !0 }) : void 0,
        x = (0, f.prettyPrint)({
          address: y && (0, m.getContractAddress)(y),
          function: S,
          args:
            R && R !== "()" && `${[...Array((w == null ? void 0 : w.length) ?? 0).keys()].map(() => " ").join("")}${R}`,
          sender: A,
        });
      (super(d.shortMessage || `An unknown error occurred while executing the contract function "${w}".`, {
        cause: d,
        docsPath: I,
        metaMessages: [...(d.metaMessages ? [...d.metaMessages, " "] : []), x && "Contract Call:", x].filter(Boolean),
        name: "ContractFunctionExecutionError",
      }),
        Object.defineProperty(this, "abi", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "args", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "cause", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "contractAddress", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: void 0,
        }),
        Object.defineProperty(this, "formattedArgs", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "functionName", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "sender", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.abi = j),
        (this.args = p),
        (this.cause = d),
        (this.contractAddress = y),
        (this.functionName = w),
        (this.sender = A));
    }
  }
  ze.ContractFunctionExecutionError = h;
  class b extends u.BaseError {
    constructor({ abi: d, data: j, functionName: p, message: y, cause: I }) {
      let w, A, B, R;
      if (j && j !== "0x")
        try {
          A = (0, n.decodeErrorResult)({ abi: d, data: j, cause: I });
          const { abiItem: x, errorName: F, args: H } = A;
          if (F === "Error") R = H[0];
          else if (F === "Panic") {
            const [T] = H;
            R = r.panicReasons[T];
          } else {
            const T = x ? (0, t.formatAbiItem)(x, { includeName: !0 }) : void 0,
              k =
                x && H
                  ? (0, o.formatAbiItemWithArgs)({ abiItem: x, args: H, includeFunctionName: !1, includeName: !1 })
                  : void 0;
            B = [
              T ? `Error: ${T}` : "",
              k && k !== "()"
                ? `       ${[...Array((F == null ? void 0 : F.length) ?? 0).keys()].map(() => " ").join("")}${k}`
                : "",
            ];
          }
        } catch (x) {
          w = x;
        }
      else y && (R = y);
      let S;
      (w instanceof c.AbiErrorSignatureNotFoundError &&
        ((S = w.signature),
        (B = [
          `Unable to decode signature "${S}" as it was not found on the provided ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${S}.`,
        ])),
        super(
          (R && R !== "execution reverted") || S
            ? [`The contract function "${p}" reverted with the following ${S ? "signature" : "reason"}:`, R || S].join(`
`)
            : `The contract function "${p}" reverted.`,
          { cause: w ?? I, metaMessages: B, name: "ContractFunctionRevertedError" },
        ),
        Object.defineProperty(this, "data", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "raw", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "reason", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "signature", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.data = A),
        (this.raw = j),
        (this.reason = R),
        (this.signature = S));
    }
  }
  ze.ContractFunctionRevertedError = b;
  class v extends u.BaseError {
    constructor({ functionName: d, cause: j }) {
      super(`The contract function "${d}" returned no data ("0x").`, {
        metaMessages: [
          "This could be due to any of the following:",
          `  - The contract does not have the function "${d}",`,
          "  - The parameters passed to the contract function may be invalid, or",
          "  - The address is not a contract.",
        ],
        name: "ContractFunctionZeroDataError",
        cause: j,
      });
    }
  }
  ze.ContractFunctionZeroDataError = v;
  class _ extends u.BaseError {
    constructor({ factory: d }) {
      super(`Deployment for counterfactual contract call failed${d ? ` for factory "${d}".` : ""}`, {
        metaMessages: [
          "Please ensure:",
          "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
          "- The `factoryData` is a valid encoded function call for contract deployment function on the factory.",
        ],
        name: "CounterfactualDeploymentFailedError",
      });
    }
  }
  ze.CounterfactualDeploymentFailedError = _;
  class E extends u.BaseError {
    constructor({ data: d, message: j }) {
      (super(j || "", { name: "RawContractError" }),
        Object.defineProperty(this, "code", { enumerable: !0, configurable: !0, writable: !0, value: 3 }),
        Object.defineProperty(this, "data", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.data = d));
    }
  }
  return ((ze.RawContractError = E), ze);
}
var nt = {},
  G0;
function Et() {
  if (G0) return nt;
  ((G0 = 1),
    Object.defineProperty(nt, "__esModule", { value: !0 }),
    (nt.TimeoutError =
      nt.SocketClosedError =
      nt.RpcRequestError =
      nt.WebSocketRequestError =
      nt.HttpRequestError =
        void 0));
  const e = Fe(),
    r = ue(),
    n = rf();
  class t extends r.BaseError {
    constructor({ body: u, cause: l, details: f, headers: m, status: g, url: h }) {
      (super("HTTP request failed.", {
        cause: l,
        details: f,
        metaMessages: [
          g && `Status: ${g}`,
          `URL: ${(0, n.getUrl)(h)}`,
          u && `Request body: ${(0, e.stringify)(u)}`,
        ].filter(Boolean),
        name: "HttpRequestError",
      }),
        Object.defineProperty(this, "body", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "headers", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "status", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "url", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.body = u),
        (this.headers = m),
        (this.status = g),
        (this.url = h));
    }
  }
  nt.HttpRequestError = t;
  class o extends r.BaseError {
    constructor({ body: u, cause: l, details: f, url: m }) {
      (super("WebSocket request failed.", {
        cause: l,
        details: f,
        metaMessages: [`URL: ${(0, n.getUrl)(m)}`, u && `Request body: ${(0, e.stringify)(u)}`].filter(Boolean),
        name: "WebSocketRequestError",
      }),
        Object.defineProperty(this, "url", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.url = m));
    }
  }
  nt.WebSocketRequestError = o;
  class s extends r.BaseError {
    constructor({ body: u, error: l, url: f }) {
      (super("RPC Request failed.", {
        cause: l,
        details: l.message,
        metaMessages: [`URL: ${(0, n.getUrl)(f)}`, `Request body: ${(0, e.stringify)(u)}`],
        name: "RpcRequestError",
      }),
        Object.defineProperty(this, "code", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "data", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "url", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.code = l.code),
        (this.data = l.data),
        (this.url = f));
    }
  }
  nt.RpcRequestError = s;
  class i extends r.BaseError {
    constructor({ url: u } = {}) {
      (super("The socket has been closed.", {
        metaMessages: [u && `URL: ${(0, n.getUrl)(u)}`].filter(Boolean),
        name: "SocketClosedError",
      }),
        Object.defineProperty(this, "url", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.url = u));
    }
  }
  nt.SocketClosedError = i;
  class a extends r.BaseError {
    constructor({ body: u, url: l }) {
      (super("The request took too long to respond.", {
        details: "The request timed out.",
        metaMessages: [`URL: ${(0, n.getUrl)(l)}`, `Request body: ${(0, e.stringify)(u)}`],
        name: "TimeoutError",
      }),
        Object.defineProperty(this, "url", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.url = l));
    }
  }
  return ((nt.TimeoutError = a), nt);
}
var ne = {},
  V0;
function dr() {
  if (V0) return ne;
  ((V0 = 1),
    Object.defineProperty(ne, "__esModule", { value: !0 }),
    (ne.UnknownRpcError =
      ne.WalletConnectSessionSettlementError =
      ne.AtomicityNotSupportedError =
      ne.AtomicReadyWalletRejectedUpgradeError =
      ne.BundleTooLargeError =
      ne.UnknownBundleIdError =
      ne.DuplicateIdError =
      ne.UnsupportedChainIdError =
      ne.UnsupportedNonOptionalCapabilityError =
      ne.SwitchChainError =
      ne.ChainDisconnectedError =
      ne.ProviderDisconnectedError =
      ne.UnsupportedProviderMethodError =
      ne.UnauthorizedProviderError =
      ne.UserRejectedRequestError =
      ne.JsonRpcVersionUnsupportedError =
      ne.LimitExceededRpcError =
      ne.MethodNotSupportedRpcError =
      ne.TransactionRejectedRpcError =
      ne.ResourceUnavailableRpcError =
      ne.ResourceNotFoundRpcError =
      ne.InvalidInputRpcError =
      ne.InternalRpcError =
      ne.InvalidParamsRpcError =
      ne.MethodNotFoundRpcError =
      ne.InvalidRequestRpcError =
      ne.ParseRpcError =
      ne.ProviderRpcError =
      ne.RpcError =
        void 0));
  const e = ue(),
    r = Et(),
    n = -1;
  class t extends e.BaseError {
    constructor(T, { code: k, docsPath: O, metaMessages: C, name: q, shortMessage: M }) {
      (super(M, {
        cause: T,
        docsPath: O,
        metaMessages: C || (T == null ? void 0 : T.metaMessages),
        name: q || "RpcError",
      }),
        Object.defineProperty(this, "code", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.name = q || T.name),
        (this.code = T instanceof r.RpcRequestError ? T.code : (k ?? n)));
    }
  }
  ne.RpcError = t;
  class o extends t {
    constructor(T, k) {
      (super(T, k),
        Object.defineProperty(this, "data", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.data = k.data));
    }
  }
  ne.ProviderRpcError = o;
  class s extends t {
    constructor(T) {
      super(T, {
        code: s.code,
        name: "ParseRpcError",
        shortMessage:
          "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.",
      });
    }
  }
  ((ne.ParseRpcError = s),
    Object.defineProperty(s, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32700 }));
  class i extends t {
    constructor(T) {
      super(T, { code: i.code, name: "InvalidRequestRpcError", shortMessage: "JSON is not a valid request object." });
    }
  }
  ((ne.InvalidRequestRpcError = i),
    Object.defineProperty(i, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32600 }));
  class a extends t {
    constructor(T, { method: k } = {}) {
      super(T, {
        code: a.code,
        name: "MethodNotFoundRpcError",
        shortMessage: `The method${k ? ` "${k}"` : ""} does not exist / is not available.`,
      });
    }
  }
  ((ne.MethodNotFoundRpcError = a),
    Object.defineProperty(a, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32601 }));
  class c extends t {
    constructor(T) {
      super(T, {
        code: c.code,
        name: "InvalidParamsRpcError",
        shortMessage: [
          "Invalid parameters were provided to the RPC method.",
          "Double check you have provided the correct parameters.",
        ].join(`
`),
      });
    }
  }
  ((ne.InvalidParamsRpcError = c),
    Object.defineProperty(c, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32602 }));
  class u extends t {
    constructor(T) {
      super(T, { code: u.code, name: "InternalRpcError", shortMessage: "An internal error was received." });
    }
  }
  ((ne.InternalRpcError = u),
    Object.defineProperty(u, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32603 }));
  class l extends t {
    constructor(T) {
      super(T, {
        code: l.code,
        name: "InvalidInputRpcError",
        shortMessage: ["Missing or invalid parameters.", "Double check you have provided the correct parameters."]
          .join(`
`),
      });
    }
  }
  ((ne.InvalidInputRpcError = l),
    Object.defineProperty(l, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32e3 }));
  class f extends t {
    constructor(T) {
      (super(T, { code: f.code, name: "ResourceNotFoundRpcError", shortMessage: "Requested resource not found." }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "ResourceNotFoundRpcError",
        }));
    }
  }
  ((ne.ResourceNotFoundRpcError = f),
    Object.defineProperty(f, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32001 }));
  class m extends t {
    constructor(T) {
      super(T, {
        code: m.code,
        name: "ResourceUnavailableRpcError",
        shortMessage: "Requested resource not available.",
      });
    }
  }
  ((ne.ResourceUnavailableRpcError = m),
    Object.defineProperty(m, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32002 }));
  class g extends t {
    constructor(T) {
      super(T, { code: g.code, name: "TransactionRejectedRpcError", shortMessage: "Transaction creation failed." });
    }
  }
  ((ne.TransactionRejectedRpcError = g),
    Object.defineProperty(g, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32003 }));
  class h extends t {
    constructor(T, { method: k } = {}) {
      super(T, {
        code: h.code,
        name: "MethodNotSupportedRpcError",
        shortMessage: `Method${k ? ` "${k}"` : ""} is not supported.`,
      });
    }
  }
  ((ne.MethodNotSupportedRpcError = h),
    Object.defineProperty(h, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32004 }));
  class b extends t {
    constructor(T) {
      super(T, { code: b.code, name: "LimitExceededRpcError", shortMessage: "Request exceeds defined limit." });
    }
  }
  ((ne.LimitExceededRpcError = b),
    Object.defineProperty(b, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32005 }));
  class v extends t {
    constructor(T) {
      super(T, {
        code: v.code,
        name: "JsonRpcVersionUnsupportedError",
        shortMessage: "Version of JSON-RPC protocol is not supported.",
      });
    }
  }
  ((ne.JsonRpcVersionUnsupportedError = v),
    Object.defineProperty(v, "code", { enumerable: !0, configurable: !0, writable: !0, value: -32006 }));
  class _ extends o {
    constructor(T) {
      super(T, { code: _.code, name: "UserRejectedRequestError", shortMessage: "User rejected the request." });
    }
  }
  ((ne.UserRejectedRequestError = _),
    Object.defineProperty(_, "code", { enumerable: !0, configurable: !0, writable: !0, value: 4001 }));
  class E extends o {
    constructor(T) {
      super(T, {
        code: E.code,
        name: "UnauthorizedProviderError",
        shortMessage: "The requested method and/or account has not been authorized by the user.",
      });
    }
  }
  ((ne.UnauthorizedProviderError = E),
    Object.defineProperty(E, "code", { enumerable: !0, configurable: !0, writable: !0, value: 4100 }));
  class P extends o {
    constructor(T, { method: k } = {}) {
      super(T, {
        code: P.code,
        name: "UnsupportedProviderMethodError",
        shortMessage: `The Provider does not support the requested method${k ? ` " ${k}"` : ""}.`,
      });
    }
  }
  ((ne.UnsupportedProviderMethodError = P),
    Object.defineProperty(P, "code", { enumerable: !0, configurable: !0, writable: !0, value: 4200 }));
  class d extends o {
    constructor(T) {
      super(T, {
        code: d.code,
        name: "ProviderDisconnectedError",
        shortMessage: "The Provider is disconnected from all chains.",
      });
    }
  }
  ((ne.ProviderDisconnectedError = d),
    Object.defineProperty(d, "code", { enumerable: !0, configurable: !0, writable: !0, value: 4900 }));
  class j extends o {
    constructor(T) {
      super(T, {
        code: j.code,
        name: "ChainDisconnectedError",
        shortMessage: "The Provider is not connected to the requested chain.",
      });
    }
  }
  ((ne.ChainDisconnectedError = j),
    Object.defineProperty(j, "code", { enumerable: !0, configurable: !0, writable: !0, value: 4901 }));
  class p extends o {
    constructor(T) {
      super(T, {
        code: p.code,
        name: "SwitchChainError",
        shortMessage: "An error occurred when attempting to switch chain.",
      });
    }
  }
  ((ne.SwitchChainError = p),
    Object.defineProperty(p, "code", { enumerable: !0, configurable: !0, writable: !0, value: 4902 }));
  class y extends o {
    constructor(T) {
      super(T, {
        code: y.code,
        name: "UnsupportedNonOptionalCapabilityError",
        shortMessage: "This Wallet does not support a capability that was not marked as optional.",
      });
    }
  }
  ((ne.UnsupportedNonOptionalCapabilityError = y),
    Object.defineProperty(y, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5700 }));
  class I extends o {
    constructor(T) {
      super(T, {
        code: I.code,
        name: "UnsupportedChainIdError",
        shortMessage: "This Wallet does not support the requested chain ID.",
      });
    }
  }
  ((ne.UnsupportedChainIdError = I),
    Object.defineProperty(I, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5710 }));
  class w extends o {
    constructor(T) {
      super(T, {
        code: w.code,
        name: "DuplicateIdError",
        shortMessage: "There is already a bundle submitted with this ID.",
      });
    }
  }
  ((ne.DuplicateIdError = w),
    Object.defineProperty(w, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5720 }));
  class A extends o {
    constructor(T) {
      super(T, {
        code: A.code,
        name: "UnknownBundleIdError",
        shortMessage: "This bundle id is unknown / has not been submitted",
      });
    }
  }
  ((ne.UnknownBundleIdError = A),
    Object.defineProperty(A, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5730 }));
  class B extends o {
    constructor(T) {
      super(T, {
        code: B.code,
        name: "BundleTooLargeError",
        shortMessage: "The call bundle is too large for the Wallet to process.",
      });
    }
  }
  ((ne.BundleTooLargeError = B),
    Object.defineProperty(B, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5740 }));
  class R extends o {
    constructor(T) {
      super(T, {
        code: R.code,
        name: "AtomicReadyWalletRejectedUpgradeError",
        shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade.",
      });
    }
  }
  ((ne.AtomicReadyWalletRejectedUpgradeError = R),
    Object.defineProperty(R, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5750 }));
  class S extends o {
    constructor(T) {
      super(T, {
        code: S.code,
        name: "AtomicityNotSupportedError",
        shortMessage: "The wallet does not support atomic execution but the request requires it.",
      });
    }
  }
  ((ne.AtomicityNotSupportedError = S),
    Object.defineProperty(S, "code", { enumerable: !0, configurable: !0, writable: !0, value: 5760 }));
  class x extends o {
    constructor(T) {
      super(T, {
        code: x.code,
        name: "WalletConnectSessionSettlementError",
        shortMessage: "WalletConnect session settlement failed.",
      });
    }
  }
  ((ne.WalletConnectSessionSettlementError = x),
    Object.defineProperty(x, "code", { enumerable: !0, configurable: !0, writable: !0, value: 7e3 }));
  class F extends t {
    constructor(T) {
      super(T, { name: "UnknownRpcError", shortMessage: "An unknown RPC error occurred." });
    }
  }
  return ((ne.UnknownRpcError = F), ne);
}
var W0;
function fr() {
  if (W0) return Mi;
  ((W0 = 1), Object.defineProperty(Mi, "__esModule", { value: !0 }), (Mi.getContractError = i));
  const e = Se(),
    r = ue(),
    n = ur(),
    t = Et(),
    o = dr(),
    s = 3;
  function i(a, { abi: c, address: u, args: l, docsPath: f, functionName: m, sender: g }) {
    const h =
        a instanceof n.RawContractError ? a : a instanceof r.BaseError ? a.walk((j) => "data" in j) || a.walk() : {},
      { code: b, data: v, details: _, message: E, shortMessage: P } = h,
      d =
        a instanceof e.AbiDecodingZeroDataError
          ? new n.ContractFunctionZeroDataError({ functionName: m, cause: a })
          : ([s, o.InternalRpcError.code].includes(b) && (v || _ || E || P)) ||
              (b === o.InvalidInputRpcError.code && _ === "execution reverted" && v)
            ? new n.ContractFunctionRevertedError({
                abi: c,
                data: typeof v == "object" ? v.data : v,
                functionName: m,
                message: h instanceof t.RpcRequestError ? _ : (P ?? E),
                cause: a,
              })
            : a;
    return new n.ContractFunctionExecutionError(d, {
      abi: c,
      args: l,
      contractAddress: u,
      docsPath: f,
      functionName: m,
      sender: g,
    });
  }
  return Mi;
}
var Li = {},
  Di = {},
  Gi = {},
  Vi = {},
  K0;
function og() {
  if (K0) return Vi;
  ((K0 = 1), Object.defineProperty(Vi, "__esModule", { value: !0 }), (Vi.publicKeyToAddress = n));
  const e = Qe(),
    r = Xe();
  function n(t) {
    const o = (0, r.keccak256)(`0x${t.substring(4)}`).substring(26);
    return (0, e.checksumAddress)(`0x${o}`);
  }
  return Vi;
}
var Wi = {},
  Ad = {},
  ge = {},
  $e = {},
  Z0;
function ig() {
  if (Z0) return $e;
  ((Z0 = 1),
    Object.defineProperty($e, "__esModule", { value: !0 }),
    ($e.SHA512_IV = $e.SHA384_IV = $e.SHA224_IV = $e.SHA256_IV = $e.HashMD = void 0),
    ($e.setBigUint64 = r),
    ($e.Chi = n),
    ($e.Maj = t));
  const e = sr();
  function r(s, i, a, c) {
    if (typeof s.setBigUint64 == "function") return s.setBigUint64(i, a, c);
    const u = BigInt(32),
      l = BigInt(4294967295),
      f = Number((a >> u) & l),
      m = Number(a & l),
      g = c ? 4 : 0,
      h = c ? 0 : 4;
    (s.setUint32(i + g, f, c), s.setUint32(i + h, m, c));
  }
  function n(s, i, a) {
    return (s & i) ^ (~s & a);
  }
  function t(s, i, a) {
    return (s & i) ^ (s & a) ^ (i & a);
  }
  class o extends e.Hash {
    constructor(i, a, c, u) {
      (super(),
        (this.finished = !1),
        (this.length = 0),
        (this.pos = 0),
        (this.destroyed = !1),
        (this.blockLen = i),
        (this.outputLen = a),
        (this.padOffset = c),
        (this.isLE = u),
        (this.buffer = new Uint8Array(i)),
        (this.view = (0, e.createView)(this.buffer)));
    }
    update(i) {
      ((0, e.aexists)(this), (i = (0, e.toBytes)(i)), (0, e.abytes)(i));
      const { view: a, buffer: c, blockLen: u } = this,
        l = i.length;
      for (let f = 0; f < l; ) {
        const m = Math.min(u - this.pos, l - f);
        if (m === u) {
          const g = (0, e.createView)(i);
          for (; u <= l - f; f += u) this.process(g, f);
          continue;
        }
        (c.set(i.subarray(f, f + m), this.pos),
          (this.pos += m),
          (f += m),
          this.pos === u && (this.process(a, 0), (this.pos = 0)));
      }
      return ((this.length += i.length), this.roundClean(), this);
    }
    digestInto(i) {
      ((0, e.aexists)(this), (0, e.aoutput)(i, this), (this.finished = !0));
      const { buffer: a, view: c, blockLen: u, isLE: l } = this;
      let { pos: f } = this;
      ((a[f++] = 128), (0, e.clean)(this.buffer.subarray(f)), this.padOffset > u - f && (this.process(c, 0), (f = 0)));
      for (let v = f; v < u; v++) a[v] = 0;
      (r(c, u - 8, BigInt(this.length * 8), l), this.process(c, 0));
      const m = (0, e.createView)(i),
        g = this.outputLen;
      if (g % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
      const h = g / 4,
        b = this.get();
      if (h > b.length) throw new Error("_sha2: outputLen bigger than state");
      for (let v = 0; v < h; v++) m.setUint32(4 * v, b[v], l);
    }
    digest() {
      const { buffer: i, outputLen: a } = this;
      this.digestInto(i);
      const c = i.slice(0, a);
      return (this.destroy(), c);
    }
    _cloneInto(i) {
      (i || (i = new this.constructor()), i.set(...this.get()));
      const { blockLen: a, buffer: c, length: u, finished: l, destroyed: f, pos: m } = this;
      return ((i.destroyed = f), (i.finished = l), (i.length = u), (i.pos = m), u % a && i.buffer.set(c), i);
    }
    clone() {
      return this._cloneInto();
    }
  }
  return (
    ($e.HashMD = o),
    ($e.SHA256_IV = Uint32Array.from([
      1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225,
    ])),
    ($e.SHA224_IV = Uint32Array.from([
      3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428,
    ])),
    ($e.SHA384_IV = Uint32Array.from([
      3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697, 1731405415,
      4290775857, 2394180231, 1750603025, 3675008525, 1694076839, 1203062813, 3204075428,
    ])),
    ($e.SHA512_IV = Uint32Array.from([
      1779033703, 4089235720, 3144134277, 2227873595, 1013904242, 4271175723, 2773480762, 1595750129, 1359893119,
      2917565137, 2600822924, 725511199, 528734635, 4215389547, 1541459225, 327033209,
    ])),
    $e
  );
}
var J0;
function ag() {
  if (J0) return ge;
  ((J0 = 1),
    Object.defineProperty(ge, "__esModule", { value: !0 }),
    (ge.sha512_224 =
      ge.sha512_256 =
      ge.sha384 =
      ge.sha512 =
      ge.sha224 =
      ge.sha256 =
      ge.SHA512_256 =
      ge.SHA512_224 =
      ge.SHA384 =
      ge.SHA512 =
      ge.SHA224 =
      ge.SHA256 =
        void 0));
  const e = ig(),
    r = Qp(),
    n = sr(),
    t = Uint32Array.from([
      1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080,
      310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
      264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808,
      3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
      1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817,
      3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063,
      1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298,
    ]),
    o = new Uint32Array(64);
  class s extends e.HashMD {
    constructor(P = 32) {
      (super(64, P, 8, !1),
        (this.A = e.SHA256_IV[0] | 0),
        (this.B = e.SHA256_IV[1] | 0),
        (this.C = e.SHA256_IV[2] | 0),
        (this.D = e.SHA256_IV[3] | 0),
        (this.E = e.SHA256_IV[4] | 0),
        (this.F = e.SHA256_IV[5] | 0),
        (this.G = e.SHA256_IV[6] | 0),
        (this.H = e.SHA256_IV[7] | 0));
    }
    get() {
      const { A: P, B: d, C: j, D: p, E: y, F: I, G: w, H: A } = this;
      return [P, d, j, p, y, I, w, A];
    }
    set(P, d, j, p, y, I, w, A) {
      ((this.A = P | 0),
        (this.B = d | 0),
        (this.C = j | 0),
        (this.D = p | 0),
        (this.E = y | 0),
        (this.F = I | 0),
        (this.G = w | 0),
        (this.H = A | 0));
    }
    process(P, d) {
      for (let S = 0; S < 16; S++, d += 4) o[S] = P.getUint32(d, !1);
      for (let S = 16; S < 64; S++) {
        const x = o[S - 15],
          F = o[S - 2],
          H = (0, n.rotr)(x, 7) ^ (0, n.rotr)(x, 18) ^ (x >>> 3),
          T = (0, n.rotr)(F, 17) ^ (0, n.rotr)(F, 19) ^ (F >>> 10);
        o[S] = (T + o[S - 7] + H + o[S - 16]) | 0;
      }
      let { A: j, B: p, C: y, D: I, E: w, F: A, G: B, H: R } = this;
      for (let S = 0; S < 64; S++) {
        const x = (0, n.rotr)(w, 6) ^ (0, n.rotr)(w, 11) ^ (0, n.rotr)(w, 25),
          F = (R + x + (0, e.Chi)(w, A, B) + t[S] + o[S]) | 0,
          T = (((0, n.rotr)(j, 2) ^ (0, n.rotr)(j, 13) ^ (0, n.rotr)(j, 22)) + (0, e.Maj)(j, p, y)) | 0;
        ((R = B), (B = A), (A = w), (w = (I + F) | 0), (I = y), (y = p), (p = j), (j = (F + T) | 0));
      }
      ((j = (j + this.A) | 0),
        (p = (p + this.B) | 0),
        (y = (y + this.C) | 0),
        (I = (I + this.D) | 0),
        (w = (w + this.E) | 0),
        (A = (A + this.F) | 0),
        (B = (B + this.G) | 0),
        (R = (R + this.H) | 0),
        this.set(j, p, y, I, w, A, B, R));
    }
    roundClean() {
      (0, n.clean)(o);
    }
    destroy() {
      (this.set(0, 0, 0, 0, 0, 0, 0, 0), (0, n.clean)(this.buffer));
    }
  }
  ge.SHA256 = s;
  class i extends s {
    constructor() {
      (super(28),
        (this.A = e.SHA224_IV[0] | 0),
        (this.B = e.SHA224_IV[1] | 0),
        (this.C = e.SHA224_IV[2] | 0),
        (this.D = e.SHA224_IV[3] | 0),
        (this.E = e.SHA224_IV[4] | 0),
        (this.F = e.SHA224_IV[5] | 0),
        (this.G = e.SHA224_IV[6] | 0),
        (this.H = e.SHA224_IV[7] | 0));
    }
  }
  ge.SHA224 = i;
  const a = r.split(
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
      ].map((E) => BigInt(E)),
    ),
    c = a[0],
    u = a[1],
    l = new Uint32Array(80),
    f = new Uint32Array(80);
  class m extends e.HashMD {
    constructor(P = 64) {
      (super(128, P, 16, !1),
        (this.Ah = e.SHA512_IV[0] | 0),
        (this.Al = e.SHA512_IV[1] | 0),
        (this.Bh = e.SHA512_IV[2] | 0),
        (this.Bl = e.SHA512_IV[3] | 0),
        (this.Ch = e.SHA512_IV[4] | 0),
        (this.Cl = e.SHA512_IV[5] | 0),
        (this.Dh = e.SHA512_IV[6] | 0),
        (this.Dl = e.SHA512_IV[7] | 0),
        (this.Eh = e.SHA512_IV[8] | 0),
        (this.El = e.SHA512_IV[9] | 0),
        (this.Fh = e.SHA512_IV[10] | 0),
        (this.Fl = e.SHA512_IV[11] | 0),
        (this.Gh = e.SHA512_IV[12] | 0),
        (this.Gl = e.SHA512_IV[13] | 0),
        (this.Hh = e.SHA512_IV[14] | 0),
        (this.Hl = e.SHA512_IV[15] | 0));
    }
    get() {
      const {
        Ah: P,
        Al: d,
        Bh: j,
        Bl: p,
        Ch: y,
        Cl: I,
        Dh: w,
        Dl: A,
        Eh: B,
        El: R,
        Fh: S,
        Fl: x,
        Gh: F,
        Gl: H,
        Hh: T,
        Hl: k,
      } = this;
      return [P, d, j, p, y, I, w, A, B, R, S, x, F, H, T, k];
    }
    set(P, d, j, p, y, I, w, A, B, R, S, x, F, H, T, k) {
      ((this.Ah = P | 0),
        (this.Al = d | 0),
        (this.Bh = j | 0),
        (this.Bl = p | 0),
        (this.Ch = y | 0),
        (this.Cl = I | 0),
        (this.Dh = w | 0),
        (this.Dl = A | 0),
        (this.Eh = B | 0),
        (this.El = R | 0),
        (this.Fh = S | 0),
        (this.Fl = x | 0),
        (this.Gh = F | 0),
        (this.Gl = H | 0),
        (this.Hh = T | 0),
        (this.Hl = k | 0));
    }
    process(P, d) {
      for (let q = 0; q < 16; q++, d += 4) ((l[q] = P.getUint32(d)), (f[q] = P.getUint32((d += 4))));
      for (let q = 16; q < 80; q++) {
        const M = l[q - 15] | 0,
          N = f[q - 15] | 0,
          z = r.rotrSH(M, N, 1) ^ r.rotrSH(M, N, 8) ^ r.shrSH(M, N, 7),
          $ = r.rotrSL(M, N, 1) ^ r.rotrSL(M, N, 8) ^ r.shrSL(M, N, 7),
          U = l[q - 2] | 0,
          G = f[q - 2] | 0,
          Z = r.rotrSH(U, G, 19) ^ r.rotrBH(U, G, 61) ^ r.shrSH(U, G, 6),
          K = r.rotrSL(U, G, 19) ^ r.rotrBL(U, G, 61) ^ r.shrSL(U, G, 6),
          V = r.add4L($, K, f[q - 7], f[q - 16]),
          Y = r.add4H(V, z, Z, l[q - 7], l[q - 16]);
        ((l[q] = Y | 0), (f[q] = V | 0));
      }
      let {
        Ah: j,
        Al: p,
        Bh: y,
        Bl: I,
        Ch: w,
        Cl: A,
        Dh: B,
        Dl: R,
        Eh: S,
        El: x,
        Fh: F,
        Fl: H,
        Gh: T,
        Gl: k,
        Hh: O,
        Hl: C,
      } = this;
      for (let q = 0; q < 80; q++) {
        const M = r.rotrSH(S, x, 14) ^ r.rotrSH(S, x, 18) ^ r.rotrBH(S, x, 41),
          N = r.rotrSL(S, x, 14) ^ r.rotrSL(S, x, 18) ^ r.rotrBL(S, x, 41),
          z = (S & F) ^ (~S & T),
          $ = (x & H) ^ (~x & k),
          U = r.add5L(C, N, $, u[q], f[q]),
          G = r.add5H(U, O, M, z, c[q], l[q]),
          Z = U | 0,
          K = r.rotrSH(j, p, 28) ^ r.rotrBH(j, p, 34) ^ r.rotrBH(j, p, 39),
          V = r.rotrSL(j, p, 28) ^ r.rotrBL(j, p, 34) ^ r.rotrBL(j, p, 39),
          Y = (j & y) ^ (j & w) ^ (y & w),
          re = (p & I) ^ (p & A) ^ (I & A);
        ((O = T | 0),
          (C = k | 0),
          (T = F | 0),
          (k = H | 0),
          (F = S | 0),
          (H = x | 0),
          ({ h: S, l: x } = r.add(B | 0, R | 0, G | 0, Z | 0)),
          (B = w | 0),
          (R = A | 0),
          (w = y | 0),
          (A = I | 0),
          (y = j | 0),
          (I = p | 0));
        const J = r.add3L(Z, V, re);
        ((j = r.add3H(J, G, K, Y)), (p = J | 0));
      }
      (({ h: j, l: p } = r.add(this.Ah | 0, this.Al | 0, j | 0, p | 0)),
        ({ h: y, l: I } = r.add(this.Bh | 0, this.Bl | 0, y | 0, I | 0)),
        ({ h: w, l: A } = r.add(this.Ch | 0, this.Cl | 0, w | 0, A | 0)),
        ({ h: B, l: R } = r.add(this.Dh | 0, this.Dl | 0, B | 0, R | 0)),
        ({ h: S, l: x } = r.add(this.Eh | 0, this.El | 0, S | 0, x | 0)),
        ({ h: F, l: H } = r.add(this.Fh | 0, this.Fl | 0, F | 0, H | 0)),
        ({ h: T, l: k } = r.add(this.Gh | 0, this.Gl | 0, T | 0, k | 0)),
        ({ h: O, l: C } = r.add(this.Hh | 0, this.Hl | 0, O | 0, C | 0)),
        this.set(j, p, y, I, w, A, B, R, S, x, F, H, T, k, O, C));
    }
    roundClean() {
      (0, n.clean)(l, f);
    }
    destroy() {
      ((0, n.clean)(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    }
  }
  ge.SHA512 = m;
  class g extends m {
    constructor() {
      (super(48),
        (this.Ah = e.SHA384_IV[0] | 0),
        (this.Al = e.SHA384_IV[1] | 0),
        (this.Bh = e.SHA384_IV[2] | 0),
        (this.Bl = e.SHA384_IV[3] | 0),
        (this.Ch = e.SHA384_IV[4] | 0),
        (this.Cl = e.SHA384_IV[5] | 0),
        (this.Dh = e.SHA384_IV[6] | 0),
        (this.Dl = e.SHA384_IV[7] | 0),
        (this.Eh = e.SHA384_IV[8] | 0),
        (this.El = e.SHA384_IV[9] | 0),
        (this.Fh = e.SHA384_IV[10] | 0),
        (this.Fl = e.SHA384_IV[11] | 0),
        (this.Gh = e.SHA384_IV[12] | 0),
        (this.Gl = e.SHA384_IV[13] | 0),
        (this.Hh = e.SHA384_IV[14] | 0),
        (this.Hl = e.SHA384_IV[15] | 0));
    }
  }
  ge.SHA384 = g;
  const h = Uint32Array.from([
      2352822216, 424955298, 1944164710, 2312950998, 502970286, 855612546, 1738396948, 1479516111, 258812777,
      2077511080, 2011393907, 79989058, 1067287976, 1780299464, 286451373, 2446758561,
    ]),
    b = Uint32Array.from([
      573645204, 4230739756, 2673172387, 3360449730, 596883563, 1867755857, 2520282905, 1497426621, 2519219938,
      2827943907, 3193839141, 1401305490, 721525244, 746961066, 246885852, 2177182882,
    ]);
  class v extends m {
    constructor() {
      (super(28),
        (this.Ah = h[0] | 0),
        (this.Al = h[1] | 0),
        (this.Bh = h[2] | 0),
        (this.Bl = h[3] | 0),
        (this.Ch = h[4] | 0),
        (this.Cl = h[5] | 0),
        (this.Dh = h[6] | 0),
        (this.Dl = h[7] | 0),
        (this.Eh = h[8] | 0),
        (this.El = h[9] | 0),
        (this.Fh = h[10] | 0),
        (this.Fl = h[11] | 0),
        (this.Gh = h[12] | 0),
        (this.Gl = h[13] | 0),
        (this.Hh = h[14] | 0),
        (this.Hl = h[15] | 0));
    }
  }
  ge.SHA512_224 = v;
  class _ extends m {
    constructor() {
      (super(32),
        (this.Ah = b[0] | 0),
        (this.Al = b[1] | 0),
        (this.Bh = b[2] | 0),
        (this.Bl = b[3] | 0),
        (this.Ch = b[4] | 0),
        (this.Cl = b[5] | 0),
        (this.Dh = b[6] | 0),
        (this.Dl = b[7] | 0),
        (this.Eh = b[8] | 0),
        (this.El = b[9] | 0),
        (this.Fh = b[10] | 0),
        (this.Fl = b[11] | 0),
        (this.Gh = b[12] | 0),
        (this.Gl = b[13] | 0),
        (this.Hh = b[14] | 0),
        (this.Hl = b[15] | 0));
    }
  }
  return (
    (ge.SHA512_256 = _),
    (ge.sha256 = (0, n.createHasher)(() => new s())),
    (ge.sha224 = (0, n.createHasher)(() => new i())),
    (ge.sha512 = (0, n.createHasher)(() => new m())),
    (ge.sha384 = (0, n.createHasher)(() => new g())),
    (ge.sha512_256 = (0, n.createHasher)(() => new _())),
    (ge.sha512_224 = (0, n.createHasher)(() => new v())),
    ge
  );
}
var to = {},
  Td = {},
  Y0;
function sg() {
  return (
    Y0 ||
      ((Y0 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.hmac = e.HMAC = void 0));
        const r = sr();
        class n extends r.Hash {
          constructor(s, i) {
            (super(), (this.finished = !1), (this.destroyed = !1), (0, r.ahash)(s));
            const a = (0, r.toBytes)(i);
            if (((this.iHash = s.create()), typeof this.iHash.update != "function"))
              throw new Error("Expected instance of class which extends utils.Hash");
            ((this.blockLen = this.iHash.blockLen), (this.outputLen = this.iHash.outputLen));
            const c = this.blockLen,
              u = new Uint8Array(c);
            u.set(a.length > c ? s.create().update(a).digest() : a);
            for (let l = 0; l < u.length; l++) u[l] ^= 54;
            (this.iHash.update(u), (this.oHash = s.create()));
            for (let l = 0; l < u.length; l++) u[l] ^= 106;
            (this.oHash.update(u), (0, r.clean)(u));
          }
          update(s) {
            return ((0, r.aexists)(this), this.iHash.update(s), this);
          }
          digestInto(s) {
            ((0, r.aexists)(this),
              (0, r.abytes)(s, this.outputLen),
              (this.finished = !0),
              this.iHash.digestInto(s),
              this.oHash.update(s),
              this.oHash.digestInto(s),
              this.destroy());
          }
          digest() {
            const s = new Uint8Array(this.oHash.outputLen);
            return (this.digestInto(s), s);
          }
          _cloneInto(s) {
            s || (s = Object.create(Object.getPrototypeOf(this), {}));
            const { oHash: i, iHash: a, finished: c, destroyed: u, blockLen: l, outputLen: f } = this;
            return (
              (s = s),
              (s.finished = c),
              (s.destroyed = u),
              (s.blockLen = l),
              (s.outputLen = f),
              (s.oHash = i._cloneInto(s.oHash)),
              (s.iHash = a._cloneInto(s.iHash)),
              s
            );
          }
          clone() {
            return this._cloneInto();
          }
          destroy() {
            ((this.destroyed = !0), this.oHash.destroy(), this.iHash.destroy());
          }
        }
        e.HMAC = n;
        const t = (o, s, i) => new n(o, s).update(i).digest();
        ((e.hmac = t), (e.hmac.create = (o, s) => new n(o, s)));
      })(Td)),
    Td
  );
}
var Sd = {},
  Tr = {},
  Pe = {},
  he = {},
  X0;
function Lr() {
  if (X0) return he;
  X0 = 1;
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ (Object.defineProperty(he, "__esModule", {
    value: !0,
  }),
    (he.notImplemented = he.bitMask = void 0),
    (he.isBytes = n),
    (he.abytes = t),
    (he.abool = o),
    (he.numberToHexUnpadded = s),
    (he.hexToNumber = i),
    (he.bytesToHex = u),
    (he.hexToBytes = m),
    (he.bytesToNumberBE = g),
    (he.bytesToNumberLE = h),
    (he.numberToBytesBE = b),
    (he.numberToBytesLE = v),
    (he.numberToVarBytesBE = _),
    (he.ensureBytes = E),
    (he.concatBytes = P),
    (he.equalBytes = d),
    (he.utf8ToBytes = j),
    (he.inRange = y),
    (he.aInRange = I),
    (he.bitLen = w),
    (he.bitGet = A),
    (he.bitSet = B),
    (he.createHmacDrbg = F),
    (he.validateObject = T),
    (he.memoized = O));
  const e = BigInt(0),
    r = BigInt(1);
  function n(C) {
    return C instanceof Uint8Array || (ArrayBuffer.isView(C) && C.constructor.name === "Uint8Array");
  }
  function t(C) {
    if (!n(C)) throw new Error("Uint8Array expected");
  }
  function o(C, q) {
    if (typeof q != "boolean") throw new Error(C + " boolean expected, got " + q);
  }
  function s(C) {
    const q = C.toString(16);
    return q.length & 1 ? "0" + q : q;
  }
  function i(C) {
    if (typeof C != "string") throw new Error("hex string expected, got " + typeof C);
    return C === "" ? e : BigInt("0x" + C);
  }
  const a = typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function",
    c = Array.from({ length: 256 }, (C, q) => q.toString(16).padStart(2, "0"));
  function u(C) {
    if ((t(C), a)) return C.toHex();
    let q = "";
    for (let M = 0; M < C.length; M++) q += c[C[M]];
    return q;
  }
  const l = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function f(C) {
    if (C >= l._0 && C <= l._9) return C - l._0;
    if (C >= l.A && C <= l.F) return C - (l.A - 10);
    if (C >= l.a && C <= l.f) return C - (l.a - 10);
  }
  function m(C) {
    if (typeof C != "string") throw new Error("hex string expected, got " + typeof C);
    if (a) return Uint8Array.fromHex(C);
    const q = C.length,
      M = q / 2;
    if (q % 2) throw new Error("hex string expected, got unpadded hex of length " + q);
    const N = new Uint8Array(M);
    for (let z = 0, $ = 0; z < M; z++, $ += 2) {
      const U = f(C.charCodeAt($)),
        G = f(C.charCodeAt($ + 1));
      if (U === void 0 || G === void 0) {
        const Z = C[$] + C[$ + 1];
        throw new Error('hex string expected, got non-hex character "' + Z + '" at index ' + $);
      }
      N[z] = U * 16 + G;
    }
    return N;
  }
  function g(C) {
    return i(u(C));
  }
  function h(C) {
    return (t(C), i(u(Uint8Array.from(C).reverse())));
  }
  function b(C, q) {
    return m(C.toString(16).padStart(q * 2, "0"));
  }
  function v(C, q) {
    return b(C, q).reverse();
  }
  function _(C) {
    return m(s(C));
  }
  function E(C, q, M) {
    let N;
    if (typeof q == "string")
      try {
        N = m(q);
      } catch ($) {
        throw new Error(C + " must be hex string or Uint8Array, cause: " + $);
      }
    else if (n(q)) N = Uint8Array.from(q);
    else throw new Error(C + " must be hex string or Uint8Array");
    const z = N.length;
    if (typeof M == "number" && z !== M) throw new Error(C + " of length " + M + " expected, got " + z);
    return N;
  }
  function P(...C) {
    let q = 0;
    for (let N = 0; N < C.length; N++) {
      const z = C[N];
      (t(z), (q += z.length));
    }
    const M = new Uint8Array(q);
    for (let N = 0, z = 0; N < C.length; N++) {
      const $ = C[N];
      (M.set($, z), (z += $.length));
    }
    return M;
  }
  function d(C, q) {
    if (C.length !== q.length) return !1;
    let M = 0;
    for (let N = 0; N < C.length; N++) M |= C[N] ^ q[N];
    return M === 0;
  }
  function j(C) {
    if (typeof C != "string") throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(C));
  }
  const p = (C) => typeof C == "bigint" && e <= C;
  function y(C, q, M) {
    return p(C) && p(q) && p(M) && q <= C && C < M;
  }
  function I(C, q, M, N) {
    if (!y(q, M, N)) throw new Error("expected valid " + C + ": " + M + " <= n < " + N + ", got " + q);
  }
  function w(C) {
    let q;
    for (q = 0; C > e; C >>= r, q += 1);
    return q;
  }
  function A(C, q) {
    return (C >> BigInt(q)) & r;
  }
  function B(C, q, M) {
    return C | ((M ? r : e) << BigInt(q));
  }
  const R = (C) => (r << BigInt(C)) - r;
  he.bitMask = R;
  const S = (C) => new Uint8Array(C),
    x = (C) => Uint8Array.from(C);
  function F(C, q, M) {
    if (typeof C != "number" || C < 2) throw new Error("hashLen must be a number");
    if (typeof q != "number" || q < 2) throw new Error("qByteLen must be a number");
    if (typeof M != "function") throw new Error("hmacFn must be a function");
    let N = S(C),
      z = S(C),
      $ = 0;
    const U = () => {
        (N.fill(1), z.fill(0), ($ = 0));
      },
      G = (...Y) => M(z, N, ...Y),
      Z = (Y = S(0)) => {
        ((z = G(x([0]), Y)), (N = G()), Y.length !== 0 && ((z = G(x([1]), Y)), (N = G())));
      },
      K = () => {
        if ($++ >= 1e3) throw new Error("drbg: tried 1000 values");
        let Y = 0;
        const re = [];
        for (; Y < q; ) {
          N = G();
          const J = N.slice();
          (re.push(J), (Y += N.length));
        }
        return P(...re);
      };
    return (Y, re) => {
      (U(), Z(Y));
      let J;
      for (; !(J = re(K())); ) Z();
      return (U(), J);
    };
  }
  const H = {
    bigint: (C) => typeof C == "bigint",
    function: (C) => typeof C == "function",
    boolean: (C) => typeof C == "boolean",
    string: (C) => typeof C == "string",
    stringOrUint8Array: (C) => typeof C == "string" || n(C),
    isSafeInteger: (C) => Number.isSafeInteger(C),
    array: (C) => Array.isArray(C),
    field: (C, q) => q.Fp.isValid(C),
    hash: (C) => typeof C == "function" && Number.isSafeInteger(C.outputLen),
  };
  function T(C, q, M = {}) {
    const N = (z, $, U) => {
      const G = H[$];
      if (typeof G != "function") throw new Error("invalid validator function");
      const Z = C[z];
      if (!(U && Z === void 0) && !G(Z, C))
        throw new Error("param " + String(z) + " is invalid. Expected " + $ + ", got " + Z);
    };
    for (const [z, $] of Object.entries(q)) N(z, $, !1);
    for (const [z, $] of Object.entries(M)) N(z, $, !0);
    return C;
  }
  const k = () => {
    throw new Error("not implemented");
  };
  he.notImplemented = k;
  function O(C) {
    const q = new WeakMap();
    return (M, ...N) => {
      const z = q.get(M);
      if (z !== void 0) return z;
      const $ = C(M, ...N);
      return (q.set(M, $), $);
    };
  }
  return he;
}
var Q0;
function Cu() {
  if (Q0) return Pe;
  ((Q0 = 1),
    Object.defineProperty(Pe, "__esModule", { value: !0 }),
    (Pe.isNegativeLE = void 0),
    (Pe.mod = u),
    (Pe.pow = l),
    (Pe.pow2 = f),
    (Pe.invert = m),
    (Pe.tonelliShanks = b),
    (Pe.FpSqrt = v),
    (Pe.validateField = P),
    (Pe.FpPow = d),
    (Pe.FpInvertBatch = j),
    (Pe.FpDiv = p),
    (Pe.FpLegendre = y),
    (Pe.FpIsSquare = I),
    (Pe.nLength = w),
    (Pe.Field = A),
    (Pe.FpSqrtOdd = B),
    (Pe.FpSqrtEven = R),
    (Pe.hashToPrivateScalar = S),
    (Pe.getFieldBytesLength = x),
    (Pe.getMinHashLength = F),
    (Pe.mapHashToField = H));
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const e = sr(),
    r = Lr(),
    n = BigInt(0),
    t = BigInt(1),
    o = BigInt(2),
    s = BigInt(3),
    i = BigInt(4),
    a = BigInt(5),
    c = BigInt(8);
  function u(T, k) {
    const O = T % k;
    return O >= n ? O : k + O;
  }
  function l(T, k, O) {
    return d(A(O), T, k);
  }
  function f(T, k, O) {
    let C = T;
    for (; k-- > n; ) ((C *= C), (C %= O));
    return C;
  }
  function m(T, k) {
    if (T === n) throw new Error("invert: expected non-zero number");
    if (k <= n) throw new Error("invert: expected positive modulus, got " + k);
    let O = u(T, k),
      C = k,
      q = n,
      M = t;
    for (; O !== n; ) {
      const z = C / O,
        $ = C % O,
        U = q - M * z;
      ((C = O), (O = $), (q = M), (M = U));
    }
    if (C !== t) throw new Error("invert: does not exist");
    return u(q, k);
  }
  function g(T, k) {
    const O = (T.ORDER + t) / i,
      C = T.pow(k, O);
    if (!T.eql(T.sqr(C), k)) throw new Error("Cannot find square root");
    return C;
  }
  function h(T, k) {
    const O = (T.ORDER - a) / c,
      C = T.mul(k, o),
      q = T.pow(C, O),
      M = T.mul(k, q),
      N = T.mul(T.mul(M, o), q),
      z = T.mul(M, T.sub(N, T.ONE));
    if (!T.eql(T.sqr(z), k)) throw new Error("Cannot find square root");
    return z;
  }
  function b(T) {
    if (T < BigInt(3)) throw new Error("sqrt is not defined for small field");
    let k = T - t,
      O = 0;
    for (; k % o === n; ) ((k /= o), O++);
    let C = o;
    const q = A(T);
    for (; y(q, C) === 1; ) if (C++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
    if (O === 1) return g;
    let M = q.pow(C, k);
    const N = (k + t) / o;
    return function ($, U) {
      if ($.is0(U)) return U;
      if (y($, U) !== 1) throw new Error("Cannot find square root");
      let G = O,
        Z = $.mul($.ONE, M),
        K = $.pow(U, k),
        V = $.pow(U, N);
      for (; !$.eql(K, $.ONE); ) {
        if ($.is0(K)) return $.ZERO;
        let Y = 1,
          re = $.sqr(K);
        for (; !$.eql(re, $.ONE); ) if ((Y++, (re = $.sqr(re)), Y === G)) throw new Error("Cannot find square root");
        const J = t << BigInt(G - Y - 1),
          X = $.pow(Z, J);
        ((G = Y), (Z = $.sqr(X)), (K = $.mul(K, Z)), (V = $.mul(V, X)));
      }
      return V;
    };
  }
  function v(T) {
    return T % i === s ? g : T % c === a ? h : b(T);
  }
  const _ = (T, k) => (u(T, k) & t) === t;
  Pe.isNegativeLE = _;
  const E = [
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
  function P(T) {
    const k = { ORDER: "bigint", MASK: "bigint", BYTES: "isSafeInteger", BITS: "isSafeInteger" },
      O = E.reduce((C, q) => ((C[q] = "function"), C), k);
    return (0, r.validateObject)(T, O);
  }
  function d(T, k, O) {
    if (O < n) throw new Error("invalid exponent, negatives unsupported");
    if (O === n) return T.ONE;
    if (O === t) return k;
    let C = T.ONE,
      q = k;
    for (; O > n; ) (O & t && (C = T.mul(C, q)), (q = T.sqr(q)), (O >>= t));
    return C;
  }
  function j(T, k, O = !1) {
    const C = new Array(k.length).fill(O ? T.ZERO : void 0),
      q = k.reduce((N, z, $) => (T.is0(z) ? N : ((C[$] = N), T.mul(N, z))), T.ONE),
      M = T.inv(q);
    return (k.reduceRight((N, z, $) => (T.is0(z) ? N : ((C[$] = T.mul(N, C[$])), T.mul(N, z))), M), C);
  }
  function p(T, k, O) {
    return T.mul(k, typeof O == "bigint" ? m(O, T.ORDER) : T.inv(O));
  }
  function y(T, k) {
    const O = (T.ORDER - t) / o,
      C = T.pow(k, O),
      q = T.eql(C, T.ONE),
      M = T.eql(C, T.ZERO),
      N = T.eql(C, T.neg(T.ONE));
    if (!q && !M && !N) throw new Error("invalid Legendre symbol result");
    return q ? 1 : M ? 0 : -1;
  }
  function I(T, k) {
    return y(T, k) === 1;
  }
  function w(T, k) {
    k !== void 0 && (0, e.anumber)(k);
    const O = k !== void 0 ? k : T.toString(2).length,
      C = Math.ceil(O / 8);
    return { nBitLength: O, nByteLength: C };
  }
  function A(T, k, O = !1, C = {}) {
    if (T <= n) throw new Error("invalid field: expected ORDER > 0, got " + T);
    const { nBitLength: q, nByteLength: M } = w(T, k);
    if (M > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    let N;
    const z = Object.freeze({
      ORDER: T,
      isLE: O,
      BITS: q,
      BYTES: M,
      MASK: (0, r.bitMask)(q),
      ZERO: n,
      ONE: t,
      create: ($) => u($, T),
      isValid: ($) => {
        if (typeof $ != "bigint") throw new Error("invalid field element: expected bigint, got " + typeof $);
        return n <= $ && $ < T;
      },
      is0: ($) => $ === n,
      isOdd: ($) => ($ & t) === t,
      neg: ($) => u(-$, T),
      eql: ($, U) => $ === U,
      sqr: ($) => u($ * $, T),
      add: ($, U) => u($ + U, T),
      sub: ($, U) => u($ - U, T),
      mul: ($, U) => u($ * U, T),
      pow: ($, U) => d(z, $, U),
      div: ($, U) => u($ * m(U, T), T),
      sqrN: ($) => $ * $,
      addN: ($, U) => $ + U,
      subN: ($, U) => $ - U,
      mulN: ($, U) => $ * U,
      inv: ($) => m($, T),
      sqrt: C.sqrt || (($) => (N || (N = v(T)), N(z, $))),
      toBytes: ($) => (O ? (0, r.numberToBytesLE)($, M) : (0, r.numberToBytesBE)($, M)),
      fromBytes: ($) => {
        if ($.length !== M) throw new Error("Field.fromBytes: expected " + M + " bytes, got " + $.length);
        return O ? (0, r.bytesToNumberLE)($) : (0, r.bytesToNumberBE)($);
      },
      invertBatch: ($) => j(z, $),
      cmov: ($, U, G) => (G ? U : $),
    });
    return Object.freeze(z);
  }
  function B(T, k) {
    if (!T.isOdd) throw new Error("Field doesn't have isOdd");
    const O = T.sqrt(k);
    return T.isOdd(O) ? O : T.neg(O);
  }
  function R(T, k) {
    if (!T.isOdd) throw new Error("Field doesn't have isOdd");
    const O = T.sqrt(k);
    return T.isOdd(O) ? T.neg(O) : O;
  }
  function S(T, k, O = !1) {
    T = (0, r.ensureBytes)("privateHash", T);
    const C = T.length,
      q = w(k).nByteLength + 8;
    if (q < 24 || C < q || C > 1024)
      throw new Error("hashToPrivateScalar: expected " + q + "-1024 bytes of input, got " + C);
    const M = O ? (0, r.bytesToNumberLE)(T) : (0, r.bytesToNumberBE)(T);
    return u(M, k - t) + t;
  }
  function x(T) {
    if (typeof T != "bigint") throw new Error("field order must be bigint");
    const k = T.toString(2).length;
    return Math.ceil(k / 8);
  }
  function F(T) {
    const k = x(T);
    return k + Math.ceil(k / 2);
  }
  function H(T, k, O = !1) {
    const C = T.length,
      q = x(k),
      M = F(k);
    if (C < 16 || C < M || C > 1024) throw new Error("expected " + M + "-1024 bytes of input, got " + C);
    const N = O ? (0, r.bytesToNumberLE)(T) : (0, r.bytesToNumberBE)(T),
      z = u(N, k - t) + t;
    return O ? (0, r.numberToBytesLE)(z, q) : (0, r.numberToBytesBE)(z, q);
  }
  return Pe;
}
var e1;
function zv() {
  if (e1) return Tr;
  ((e1 = 1),
    Object.defineProperty(Tr, "__esModule", { value: !0 }),
    (Tr.wNAF = g),
    (Tr.pippenger = h),
    (Tr.precomputeMSMUnsafe = b),
    (Tr.validateBasic = v));
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const e = Cu(),
    r = Lr(),
    n = BigInt(0),
    t = BigInt(1);
  function o(_, E) {
    const P = E.negate();
    return _ ? P : E;
  }
  function s(_, E) {
    if (!Number.isSafeInteger(_) || _ <= 0 || _ > E)
      throw new Error("invalid window size, expected [1.." + E + "], got W=" + _);
  }
  function i(_, E) {
    s(_, E);
    const P = Math.ceil(E / _) + 1,
      d = 2 ** (_ - 1),
      j = 2 ** _,
      p = (0, r.bitMask)(_),
      y = BigInt(_);
    return { windows: P, windowSize: d, mask: p, maxNumber: j, shiftBy: y };
  }
  function a(_, E, P) {
    const { windowSize: d, mask: j, maxNumber: p, shiftBy: y } = P;
    let I = Number(_ & j),
      w = _ >> y;
    I > d && ((I -= p), (w += t));
    const A = E * d,
      B = A + Math.abs(I) - 1,
      R = I === 0,
      S = I < 0,
      x = E % 2 !== 0;
    return { nextN: w, offset: B, isZero: R, isNeg: S, isNegF: x, offsetF: A };
  }
  function c(_, E) {
    if (!Array.isArray(_)) throw new Error("array expected");
    _.forEach((P, d) => {
      if (!(P instanceof E)) throw new Error("invalid point at index " + d);
    });
  }
  function u(_, E) {
    if (!Array.isArray(_)) throw new Error("array of scalars expected");
    _.forEach((P, d) => {
      if (!E.isValid(P)) throw new Error("invalid scalar at index " + d);
    });
  }
  const l = new WeakMap(),
    f = new WeakMap();
  function m(_) {
    return f.get(_) || 1;
  }
  function g(_, E) {
    return {
      constTimeNegate: o,
      hasPrecomputes(P) {
        return m(P) !== 1;
      },
      unsafeLadder(P, d, j = _.ZERO) {
        let p = P;
        for (; d > n; ) (d & t && (j = j.add(p)), (p = p.double()), (d >>= t));
        return j;
      },
      precomputeWindow(P, d) {
        const { windows: j, windowSize: p } = i(d, E),
          y = [];
        let I = P,
          w = I;
        for (let A = 0; A < j; A++) {
          ((w = I), y.push(w));
          for (let B = 1; B < p; B++) ((w = w.add(I)), y.push(w));
          I = w.double();
        }
        return y;
      },
      wNAF(P, d, j) {
        let p = _.ZERO,
          y = _.BASE;
        const I = i(P, E);
        for (let w = 0; w < I.windows; w++) {
          const { nextN: A, offset: B, isZero: R, isNeg: S, isNegF: x, offsetF: F } = a(j, w, I);
          ((j = A), R ? (y = y.add(o(x, d[F]))) : (p = p.add(o(S, d[B]))));
        }
        return { p, f: y };
      },
      wNAFUnsafe(P, d, j, p = _.ZERO) {
        const y = i(P, E);
        for (let I = 0; I < y.windows && j !== n; I++) {
          const { nextN: w, offset: A, isZero: B, isNeg: R } = a(j, I, y);
          if (((j = w), !B)) {
            const S = d[A];
            p = p.add(R ? S.negate() : S);
          }
        }
        return p;
      },
      getPrecomputes(P, d, j) {
        let p = l.get(d);
        return (p || ((p = this.precomputeWindow(d, P)), P !== 1 && l.set(d, j(p))), p);
      },
      wNAFCached(P, d, j) {
        const p = m(P);
        return this.wNAF(p, this.getPrecomputes(p, P, j), d);
      },
      wNAFCachedUnsafe(P, d, j, p) {
        const y = m(P);
        return y === 1 ? this.unsafeLadder(P, d, p) : this.wNAFUnsafe(y, this.getPrecomputes(y, P, j), d, p);
      },
      setWindowSize(P, d) {
        (s(d, E), f.set(P, d), l.delete(P));
      },
    };
  }
  function h(_, E, P, d) {
    (c(P, _), u(d, E));
    const j = P.length,
      p = d.length;
    if (j !== p) throw new Error("arrays of points and scalars must have equal length");
    const y = _.ZERO,
      I = (0, r.bitLen)(BigInt(j));
    let w = 1;
    I > 12 ? (w = I - 3) : I > 4 ? (w = I - 2) : I > 0 && (w = 2);
    const A = (0, r.bitMask)(w),
      B = new Array(Number(A) + 1).fill(y),
      R = Math.floor((E.BITS - 1) / w) * w;
    let S = y;
    for (let x = R; x >= 0; x -= w) {
      B.fill(y);
      for (let H = 0; H < p; H++) {
        const T = d[H],
          k = Number((T >> BigInt(x)) & A);
        B[k] = B[k].add(P[H]);
      }
      let F = y;
      for (let H = B.length - 1, T = y; H > 0; H--) ((T = T.add(B[H])), (F = F.add(T)));
      if (((S = S.add(F)), x !== 0)) for (let H = 0; H < w; H++) S = S.double();
    }
    return S;
  }
  function b(_, E, P, d) {
    (s(d, E.BITS), c(P, _));
    const j = _.ZERO,
      p = 2 ** d - 1,
      y = Math.ceil(E.BITS / d),
      I = (0, r.bitMask)(d),
      w = P.map((A) => {
        const B = [];
        for (let R = 0, S = A; R < p; R++) (B.push(S), (S = S.add(A)));
        return B;
      });
    return (A) => {
      if ((u(A, E), A.length > P.length)) throw new Error("array of scalars must be smaller than array of points");
      let B = j;
      for (let R = 0; R < y; R++) {
        if (B !== j) for (let x = 0; x < d; x++) B = B.double();
        const S = BigInt(y * d - (R + 1) * d);
        for (let x = 0; x < A.length; x++) {
          const F = A[x],
            H = Number((F >> S) & I);
          H && (B = B.add(w[x][H - 1]));
        }
      }
      return B;
    };
  }
  function v(_) {
    return (
      (0, e.validateField)(_.Fp),
      (0, r.validateObject)(
        _,
        { n: "bigint", h: "bigint", Gx: "field", Gy: "field" },
        { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" },
      ),
      Object.freeze({ ...(0, e.nLength)(_.n, _.nBitLength), ..._, p: _.Fp.ORDER })
    );
  }
  return Tr;
}
var t1;
function cg() {
  return (
    t1 ||
      ((t1 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.DER = e.DERErr = void 0),
          (e.weierstrassPoints = g),
          (e.weierstrass = b),
          (e.SWUFpSqrtRatio = v),
          (e.mapToCurveSimpleSWU = _));
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const r = zv(),
          n = Cu(),
          t = Lr();
        function o(E) {
          (E.lowS !== void 0 && (0, t.abool)("lowS", E.lowS),
            E.prehash !== void 0 && (0, t.abool)("prehash", E.prehash));
        }
        function s(E) {
          const P = (0, r.validateBasic)(E);
          (0, t.validateObject)(
            P,
            { a: "field", b: "field" },
            {
              allowInfinityPoint: "boolean",
              allowedPrivateKeyLengths: "array",
              clearCofactor: "function",
              fromBytes: "function",
              isTorsionFree: "function",
              toBytes: "function",
              wrapPrivateKey: "boolean",
            },
          );
          const { endo: d, Fp: j, a: p } = P;
          if (d) {
            if (!j.eql(p, j.ZERO)) throw new Error("invalid endo: CURVE.a must be 0");
            if (typeof d != "object" || typeof d.beta != "bigint" || typeof d.splitScalar != "function")
              throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
          }
          return Object.freeze({ ...P });
        }
        class i extends Error {
          constructor(P = "") {
            super(P);
          }
        }
        ((e.DERErr = i),
          (e.DER = {
            Err: i,
            _tlv: {
              encode: (E, P) => {
                const { Err: d } = e.DER;
                if (E < 0 || E > 256) throw new d("tlv.encode: wrong tag");
                if (P.length & 1) throw new d("tlv.encode: unpadded data");
                const j = P.length / 2,
                  p = (0, t.numberToHexUnpadded)(j);
                if ((p.length / 2) & 128) throw new d("tlv.encode: long form length too big");
                const y = j > 127 ? (0, t.numberToHexUnpadded)((p.length / 2) | 128) : "";
                return (0, t.numberToHexUnpadded)(E) + y + p + P;
              },
              decode(E, P) {
                const { Err: d } = e.DER;
                let j = 0;
                if (E < 0 || E > 256) throw new d("tlv.encode: wrong tag");
                if (P.length < 2 || P[j++] !== E) throw new d("tlv.decode: wrong tlv");
                const p = P[j++],
                  y = !!(p & 128);
                let I = 0;
                if (!y) I = p;
                else {
                  const A = p & 127;
                  if (!A) throw new d("tlv.decode(long): indefinite length not supported");
                  if (A > 4) throw new d("tlv.decode(long): byte length is too big");
                  const B = P.subarray(j, j + A);
                  if (B.length !== A) throw new d("tlv.decode: length bytes not complete");
                  if (B[0] === 0) throw new d("tlv.decode(long): zero leftmost byte");
                  for (const R of B) I = (I << 8) | R;
                  if (((j += A), I < 128)) throw new d("tlv.decode(long): not minimal encoding");
                }
                const w = P.subarray(j, j + I);
                if (w.length !== I) throw new d("tlv.decode: wrong value length");
                return { v: w, l: P.subarray(j + I) };
              },
            },
            _int: {
              encode(E) {
                const { Err: P } = e.DER;
                if (E < c) throw new P("integer: negative integers are not allowed");
                let d = (0, t.numberToHexUnpadded)(E);
                if ((Number.parseInt(d[0], 16) & 8 && (d = "00" + d), d.length & 1))
                  throw new P("unexpected DER parsing assertion: unpadded hex");
                return d;
              },
              decode(E) {
                const { Err: P } = e.DER;
                if (E[0] & 128) throw new P("invalid signature integer: negative");
                if (E[0] === 0 && !(E[1] & 128)) throw new P("invalid signature integer: unnecessary leading zero");
                return (0, t.bytesToNumberBE)(E);
              },
            },
            toSig(E) {
              const { Err: P, _int: d, _tlv: j } = e.DER,
                p = (0, t.ensureBytes)("signature", E),
                { v: y, l: I } = j.decode(48, p);
              if (I.length) throw new P("invalid signature: left bytes after parsing");
              const { v: w, l: A } = j.decode(2, y),
                { v: B, l: R } = j.decode(2, A);
              if (R.length) throw new P("invalid signature: left bytes after parsing");
              return { r: d.decode(w), s: d.decode(B) };
            },
            hexFromSig(E) {
              const { _tlv: P, _int: d } = e.DER,
                j = P.encode(2, d.encode(E.r)),
                p = P.encode(2, d.encode(E.s)),
                y = j + p;
              return P.encode(48, y);
            },
          }));
        function a(E, P) {
          return (0, t.bytesToHex)((0, t.numberToBytesBE)(E, P));
        }
        const c = BigInt(0),
          u = BigInt(1),
          l = BigInt(2),
          f = BigInt(3),
          m = BigInt(4);
        function g(E) {
          const P = s(E),
            { Fp: d } = P,
            j = (0, n.Field)(P.n, P.nBitLength),
            p =
              P.toBytes ||
              ((q, M, N) => {
                const z = M.toAffine();
                return (0, t.concatBytes)(Uint8Array.from([4]), d.toBytes(z.x), d.toBytes(z.y));
              }),
            y =
              P.fromBytes ||
              ((q) => {
                const M = q.subarray(1),
                  N = d.fromBytes(M.subarray(0, d.BYTES)),
                  z = d.fromBytes(M.subarray(d.BYTES, 2 * d.BYTES));
                return { x: N, y: z };
              });
          function I(q) {
            const { a: M, b: N } = P,
              z = d.sqr(q),
              $ = d.mul(z, q);
            return d.add(d.add($, d.mul(q, M)), N);
          }
          function w(q, M) {
            const N = d.sqr(M),
              z = I(q);
            return d.eql(N, z);
          }
          if (!w(P.Gx, P.Gy)) throw new Error("bad curve params: generator point");
          const A = d.mul(d.pow(P.a, f), m),
            B = d.mul(d.sqr(P.b), BigInt(27));
          if (d.is0(d.add(A, B))) throw new Error("bad curve params: a or b");
          function R(q) {
            return (0, t.inRange)(q, u, P.n);
          }
          function S(q) {
            const { allowedPrivateKeyLengths: M, nByteLength: N, wrapPrivateKey: z, n: $ } = P;
            if (M && typeof q != "bigint") {
              if (((0, t.isBytes)(q) && (q = (0, t.bytesToHex)(q)), typeof q != "string" || !M.includes(q.length)))
                throw new Error("invalid private key");
              q = q.padStart(N * 2, "0");
            }
            let U;
            try {
              U = typeof q == "bigint" ? q : (0, t.bytesToNumberBE)((0, t.ensureBytes)("private key", q, N));
            } catch {
              throw new Error("invalid private key, expected hex or " + N + " bytes, got " + typeof q);
            }
            return (z && (U = (0, n.mod)(U, $)), (0, t.aInRange)("private key", U, u, $), U);
          }
          function x(q) {
            if (!(q instanceof T)) throw new Error("ProjectivePoint expected");
          }
          const F = (0, t.memoized)((q, M) => {
              const { px: N, py: z, pz: $ } = q;
              if (d.eql($, d.ONE)) return { x: N, y: z };
              const U = q.is0();
              M == null && (M = U ? d.ONE : d.inv($));
              const G = d.mul(N, M),
                Z = d.mul(z, M),
                K = d.mul($, M);
              if (U) return { x: d.ZERO, y: d.ZERO };
              if (!d.eql(K, d.ONE)) throw new Error("invZ was invalid");
              return { x: G, y: Z };
            }),
            H = (0, t.memoized)((q) => {
              if (q.is0()) {
                if (P.allowInfinityPoint && !d.is0(q.py)) return;
                throw new Error("bad point: ZERO");
              }
              const { x: M, y: N } = q.toAffine();
              if (!d.isValid(M) || !d.isValid(N)) throw new Error("bad point: x or y not FE");
              if (!w(M, N)) throw new Error("bad point: equation left != right");
              if (!q.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
              return !0;
            });
          class T {
            constructor(M, N, z) {
              if (M == null || !d.isValid(M)) throw new Error("x required");
              if (N == null || !d.isValid(N) || d.is0(N)) throw new Error("y required");
              if (z == null || !d.isValid(z)) throw new Error("z required");
              ((this.px = M), (this.py = N), (this.pz = z), Object.freeze(this));
            }
            static fromAffine(M) {
              const { x: N, y: z } = M || {};
              if (!M || !d.isValid(N) || !d.isValid(z)) throw new Error("invalid affine point");
              if (M instanceof T) throw new Error("projective point not allowed");
              const $ = (U) => d.eql(U, d.ZERO);
              return $(N) && $(z) ? T.ZERO : new T(N, z, d.ONE);
            }
            get x() {
              return this.toAffine().x;
            }
            get y() {
              return this.toAffine().y;
            }
            static normalizeZ(M) {
              const N = (0, n.FpInvertBatch)(
                d,
                M.map((z) => z.pz),
              );
              return M.map((z, $) => z.toAffine(N[$])).map(T.fromAffine);
            }
            static fromHex(M) {
              const N = T.fromAffine(y((0, t.ensureBytes)("pointHex", M)));
              return (N.assertValidity(), N);
            }
            static fromPrivateKey(M) {
              return T.BASE.multiply(S(M));
            }
            static msm(M, N) {
              return (0, r.pippenger)(T, j, M, N);
            }
            _setWindowSize(M) {
              C.setWindowSize(this, M);
            }
            assertValidity() {
              H(this);
            }
            hasEvenY() {
              const { y: M } = this.toAffine();
              if (d.isOdd) return !d.isOdd(M);
              throw new Error("Field doesn't support isOdd");
            }
            equals(M) {
              x(M);
              const { px: N, py: z, pz: $ } = this,
                { px: U, py: G, pz: Z } = M,
                K = d.eql(d.mul(N, Z), d.mul(U, $)),
                V = d.eql(d.mul(z, Z), d.mul(G, $));
              return K && V;
            }
            negate() {
              return new T(this.px, d.neg(this.py), this.pz);
            }
            double() {
              const { a: M, b: N } = P,
                z = d.mul(N, f),
                { px: $, py: U, pz: G } = this;
              let Z = d.ZERO,
                K = d.ZERO,
                V = d.ZERO,
                Y = d.mul($, $),
                re = d.mul(U, U),
                J = d.mul(G, G),
                X = d.mul($, U);
              return (
                (X = d.add(X, X)),
                (V = d.mul($, G)),
                (V = d.add(V, V)),
                (Z = d.mul(M, V)),
                (K = d.mul(z, J)),
                (K = d.add(Z, K)),
                (Z = d.sub(re, K)),
                (K = d.add(re, K)),
                (K = d.mul(Z, K)),
                (Z = d.mul(X, Z)),
                (V = d.mul(z, V)),
                (J = d.mul(M, J)),
                (X = d.sub(Y, J)),
                (X = d.mul(M, X)),
                (X = d.add(X, V)),
                (V = d.add(Y, Y)),
                (Y = d.add(V, Y)),
                (Y = d.add(Y, J)),
                (Y = d.mul(Y, X)),
                (K = d.add(K, Y)),
                (J = d.mul(U, G)),
                (J = d.add(J, J)),
                (Y = d.mul(J, X)),
                (Z = d.sub(Z, Y)),
                (V = d.mul(J, re)),
                (V = d.add(V, V)),
                (V = d.add(V, V)),
                new T(Z, K, V)
              );
            }
            add(M) {
              x(M);
              const { px: N, py: z, pz: $ } = this,
                { px: U, py: G, pz: Z } = M;
              let K = d.ZERO,
                V = d.ZERO,
                Y = d.ZERO;
              const re = P.a,
                J = d.mul(P.b, f);
              let X = d.mul(N, U),
                Q = d.mul(z, G),
                oe = d.mul($, Z),
                ie = d.add(N, z),
                se = d.add(U, G);
              ((ie = d.mul(ie, se)), (se = d.add(X, Q)), (ie = d.sub(ie, se)), (se = d.add(N, $)));
              let de = d.add(U, Z);
              return (
                (se = d.mul(se, de)),
                (de = d.add(X, oe)),
                (se = d.sub(se, de)),
                (de = d.add(z, $)),
                (K = d.add(G, Z)),
                (de = d.mul(de, K)),
                (K = d.add(Q, oe)),
                (de = d.sub(de, K)),
                (Y = d.mul(re, se)),
                (K = d.mul(J, oe)),
                (Y = d.add(K, Y)),
                (K = d.sub(Q, Y)),
                (Y = d.add(Q, Y)),
                (V = d.mul(K, Y)),
                (Q = d.add(X, X)),
                (Q = d.add(Q, X)),
                (oe = d.mul(re, oe)),
                (se = d.mul(J, se)),
                (Q = d.add(Q, oe)),
                (oe = d.sub(X, oe)),
                (oe = d.mul(re, oe)),
                (se = d.add(se, oe)),
                (X = d.mul(Q, se)),
                (V = d.add(V, X)),
                (X = d.mul(de, se)),
                (K = d.mul(ie, K)),
                (K = d.sub(K, X)),
                (X = d.mul(ie, Q)),
                (Y = d.mul(de, Y)),
                (Y = d.add(Y, X)),
                new T(K, V, Y)
              );
            }
            subtract(M) {
              return this.add(M.negate());
            }
            is0() {
              return this.equals(T.ZERO);
            }
            wNAF(M) {
              return C.wNAFCached(this, M, T.normalizeZ);
            }
            multiplyUnsafe(M) {
              const { endo: N, n: z } = P;
              (0, t.aInRange)("scalar", M, c, z);
              const $ = T.ZERO;
              if (M === c) return $;
              if (this.is0() || M === u) return this;
              if (!N || C.hasPrecomputes(this)) return C.wNAFCachedUnsafe(this, M, T.normalizeZ);
              let { k1neg: U, k1: G, k2neg: Z, k2: K } = N.splitScalar(M),
                V = $,
                Y = $,
                re = this;
              for (; G > c || K > c; )
                (G & u && (V = V.add(re)), K & u && (Y = Y.add(re)), (re = re.double()), (G >>= u), (K >>= u));
              return (
                U && (V = V.negate()),
                Z && (Y = Y.negate()),
                (Y = new T(d.mul(Y.px, N.beta), Y.py, Y.pz)),
                V.add(Y)
              );
            }
            multiply(M) {
              const { endo: N, n: z } = P;
              (0, t.aInRange)("scalar", M, u, z);
              let $, U;
              if (N) {
                const { k1neg: G, k1: Z, k2neg: K, k2: V } = N.splitScalar(M);
                let { p: Y, f: re } = this.wNAF(Z),
                  { p: J, f: X } = this.wNAF(V);
                ((Y = C.constTimeNegate(G, Y)),
                  (J = C.constTimeNegate(K, J)),
                  (J = new T(d.mul(J.px, N.beta), J.py, J.pz)),
                  ($ = Y.add(J)),
                  (U = re.add(X)));
              } else {
                const { p: G, f: Z } = this.wNAF(M);
                (($ = G), (U = Z));
              }
              return T.normalizeZ([$, U])[0];
            }
            multiplyAndAddUnsafe(M, N, z) {
              const $ = T.BASE,
                U = (Z, K) => (K === c || K === u || !Z.equals($) ? Z.multiplyUnsafe(K) : Z.multiply(K)),
                G = U(this, N).add(U(M, z));
              return G.is0() ? void 0 : G;
            }
            toAffine(M) {
              return F(this, M);
            }
            isTorsionFree() {
              const { h: M, isTorsionFree: N } = P;
              if (M === u) return !0;
              if (N) return N(T, this);
              throw new Error("isTorsionFree() has not been declared for the elliptic curve");
            }
            clearCofactor() {
              const { h: M, clearCofactor: N } = P;
              return M === u ? this : N ? N(T, this) : this.multiplyUnsafe(P.h);
            }
            toRawBytes(M = !0) {
              return ((0, t.abool)("isCompressed", M), this.assertValidity(), p(T, this, M));
            }
            toHex(M = !0) {
              return ((0, t.abool)("isCompressed", M), (0, t.bytesToHex)(this.toRawBytes(M)));
            }
          }
          ((T.BASE = new T(P.Gx, P.Gy, d.ONE)), (T.ZERO = new T(d.ZERO, d.ONE, d.ZERO)));
          const { endo: k, nBitLength: O } = P,
            C = (0, r.wNAF)(T, k ? Math.ceil(O / 2) : O);
          return {
            CURVE: P,
            ProjectivePoint: T,
            normPrivateKeyToScalar: S,
            weierstrassEquation: I,
            isWithinCurveOrder: R,
          };
        }
        function h(E) {
          const P = (0, r.validateBasic)(E);
          return (
            (0, t.validateObject)(
              P,
              { hash: "hash", hmac: "function", randomBytes: "function" },
              { bits2int: "function", bits2int_modN: "function", lowS: "boolean" },
            ),
            Object.freeze({ lowS: !0, ...P })
          );
        }
        function b(E) {
          const P = h(E),
            { Fp: d, n: j, nByteLength: p, nBitLength: y } = P,
            I = d.BYTES + 1,
            w = 2 * d.BYTES + 1;
          function A(J) {
            return (0, n.mod)(J, j);
          }
          function B(J) {
            return (0, n.invert)(J, j);
          }
          const {
            ProjectivePoint: R,
            normPrivateKeyToScalar: S,
            weierstrassEquation: x,
            isWithinCurveOrder: F,
          } = g({
            ...P,
            toBytes(J, X, Q) {
              const oe = X.toAffine(),
                ie = d.toBytes(oe.x),
                se = t.concatBytes;
              return (
                (0, t.abool)("isCompressed", Q),
                Q ? se(Uint8Array.from([X.hasEvenY() ? 2 : 3]), ie) : se(Uint8Array.from([4]), ie, d.toBytes(oe.y))
              );
            },
            fromBytes(J) {
              const X = J.length,
                Q = J[0],
                oe = J.subarray(1);
              if (X === I && (Q === 2 || Q === 3)) {
                const ie = (0, t.bytesToNumberBE)(oe);
                if (!(0, t.inRange)(ie, u, d.ORDER)) throw new Error("Point is not on curve");
                const se = x(ie);
                let de;
                try {
                  de = d.sqrt(se);
                } catch (W) {
                  const Ee = W instanceof Error ? ": " + W.message : "";
                  throw new Error("Point is not on curve" + Ee);
                }
                const ye = (de & u) === u;
                return (((Q & 1) === 1) !== ye && (de = d.neg(de)), { x: ie, y: de });
              } else if (X === w && Q === 4) {
                const ie = d.fromBytes(oe.subarray(0, d.BYTES)),
                  se = d.fromBytes(oe.subarray(d.BYTES, 2 * d.BYTES));
                return { x: ie, y: se };
              } else {
                const ie = I,
                  se = w;
                throw new Error("invalid Point, expected length of " + ie + ", or uncompressed " + se + ", got " + X);
              }
            },
          });
          function H(J) {
            const X = j >> u;
            return J > X;
          }
          function T(J) {
            return H(J) ? A(-J) : J;
          }
          const k = (J, X, Q) => (0, t.bytesToNumberBE)(J.slice(X, Q));
          class O {
            constructor(X, Q, oe) {
              ((0, t.aInRange)("r", X, u, j),
                (0, t.aInRange)("s", Q, u, j),
                (this.r = X),
                (this.s = Q),
                oe != null && (this.recovery = oe),
                Object.freeze(this));
            }
            static fromCompact(X) {
              const Q = p;
              return ((X = (0, t.ensureBytes)("compactSignature", X, Q * 2)), new O(k(X, 0, Q), k(X, Q, 2 * Q)));
            }
            static fromDER(X) {
              const { r: Q, s: oe } = e.DER.toSig((0, t.ensureBytes)("DER", X));
              return new O(Q, oe);
            }
            assertValidity() {}
            addRecoveryBit(X) {
              return new O(this.r, this.s, X);
            }
            recoverPublicKey(X) {
              const { r: Q, s: oe, recovery: ie } = this,
                se = $((0, t.ensureBytes)("msgHash", X));
              if (ie == null || ![0, 1, 2, 3].includes(ie)) throw new Error("recovery id invalid");
              const de = ie === 2 || ie === 3 ? Q + P.n : Q;
              if (de >= d.ORDER) throw new Error("recovery id 2 or 3 invalid");
              const ye = (ie & 1) === 0 ? "02" : "03",
                ee = R.fromHex(ye + a(de, d.BYTES)),
                W = B(de),
                Ee = A(-se * W),
                Ce = A(oe * W),
                Oe = R.BASE.multiplyAndAddUnsafe(ee, Ee, Ce);
              if (!Oe) throw new Error("point at infinify");
              return (Oe.assertValidity(), Oe);
            }
            hasHighS() {
              return H(this.s);
            }
            normalizeS() {
              return this.hasHighS() ? new O(this.r, A(-this.s), this.recovery) : this;
            }
            toDERRawBytes() {
              return (0, t.hexToBytes)(this.toDERHex());
            }
            toDERHex() {
              return e.DER.hexFromSig(this);
            }
            toCompactRawBytes() {
              return (0, t.hexToBytes)(this.toCompactHex());
            }
            toCompactHex() {
              const X = p;
              return a(this.r, X) + a(this.s, X);
            }
          }
          const C = {
            isValidPrivateKey(J) {
              try {
                return (S(J), !0);
              } catch {
                return !1;
              }
            },
            normPrivateKeyToScalar: S,
            randomPrivateKey: () => {
              const J = (0, n.getMinHashLength)(P.n);
              return (0, n.mapHashToField)(P.randomBytes(J), P.n);
            },
            precompute(J = 8, X = R.BASE) {
              return (X._setWindowSize(J), X.multiply(BigInt(3)), X);
            },
          };
          function q(J, X = !0) {
            return R.fromPrivateKey(J).toRawBytes(X);
          }
          function M(J) {
            if (typeof J == "bigint") return !1;
            if (J instanceof R) return !0;
            const Q = (0, t.ensureBytes)("key", J).length,
              oe = d.BYTES,
              ie = oe + 1,
              se = 2 * oe + 1;
            if (!(P.allowedPrivateKeyLengths || p === ie)) return Q === ie || Q === se;
          }
          function N(J, X, Q = !0) {
            if (M(J) === !0) throw new Error("first arg must be private key");
            if (M(X) === !1) throw new Error("second arg must be public key");
            return R.fromHex(X).multiply(S(J)).toRawBytes(Q);
          }
          const z =
              P.bits2int ||
              function (J) {
                if (J.length > 8192) throw new Error("input is too large");
                const X = (0, t.bytesToNumberBE)(J),
                  Q = J.length * 8 - y;
                return Q > 0 ? X >> BigInt(Q) : X;
              },
            $ =
              P.bits2int_modN ||
              function (J) {
                return A(z(J));
              },
            U = (0, t.bitMask)(y);
          function G(J) {
            return ((0, t.aInRange)("num < 2^" + y, J, c, U), (0, t.numberToBytesBE)(J, p));
          }
          function Z(J, X, Q = K) {
            if (["recovered", "canonical"].some((Ke) => Ke in Q))
              throw new Error("sign() legacy options not supported");
            const { hash: oe, randomBytes: ie } = P;
            let { lowS: se, prehash: de, extraEntropy: ye } = Q;
            (se == null && (se = !0),
              (J = (0, t.ensureBytes)("msgHash", J)),
              o(Q),
              de && (J = (0, t.ensureBytes)("prehashed msgHash", oe(J))));
            const ee = $(J),
              W = S(X),
              Ee = [G(W), G(ee)];
            if (ye != null && ye !== !1) {
              const Ke = ye === !0 ? ie(d.BYTES) : ye;
              Ee.push((0, t.ensureBytes)("extraEntropy", Ke));
            }
            const Ce = (0, t.concatBytes)(...Ee),
              Oe = ee;
            function He(Ke) {
              const lt = z(Ke);
              if (!F(lt)) return;
              const ut = B(lt),
                dt = R.BASE.multiply(lt).toAffine(),
                Ze = A(dt.x);
              if (Ze === c) return;
              const Me = A(ut * A(Oe + Ze * W));
              if (Me === c) return;
              let At = (dt.x === Ze ? 0 : 2) | Number(dt.y & u),
                bt = Me;
              return (se && H(Me) && ((bt = T(Me)), (At ^= 1)), new O(Ze, bt, At));
            }
            return { seed: Ce, k2sig: He };
          }
          const K = { lowS: P.lowS, prehash: !1 },
            V = { lowS: P.lowS, prehash: !1 };
          function Y(J, X, Q = K) {
            const { seed: oe, k2sig: ie } = Z(J, X, Q),
              se = P;
            return (0, t.createHmacDrbg)(se.hash.outputLen, se.nByteLength, se.hmac)(oe, ie);
          }
          R.BASE._setWindowSize(8);
          function re(J, X, Q, oe = V) {
            var At;
            const ie = J;
            ((X = (0, t.ensureBytes)("msgHash", X)), (Q = (0, t.ensureBytes)("publicKey", Q)));
            const { lowS: se, prehash: de, format: ye } = oe;
            if ((o(oe), "strict" in oe)) throw new Error("options.strict was renamed to lowS");
            if (ye !== void 0 && ye !== "compact" && ye !== "der") throw new Error("format must be compact or der");
            const ee = typeof ie == "string" || (0, t.isBytes)(ie),
              W =
                !ee &&
                !ye &&
                typeof ie == "object" &&
                ie !== null &&
                typeof ie.r == "bigint" &&
                typeof ie.s == "bigint";
            if (!ee && !W) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
            let Ee, Ce;
            try {
              if ((W && (Ee = new O(ie.r, ie.s)), ee)) {
                try {
                  ye !== "compact" && (Ee = O.fromDER(ie));
                } catch (bt) {
                  if (!(bt instanceof e.DER.Err)) throw bt;
                }
                !Ee && ye !== "der" && (Ee = O.fromCompact(ie));
              }
              Ce = R.fromHex(Q);
            } catch {
              return !1;
            }
            if (!Ee || (se && Ee.hasHighS())) return !1;
            de && (X = P.hash(X));
            const { r: Oe, s: He } = Ee,
              Ke = $(X),
              lt = B(He),
              ut = A(Ke * lt),
              dt = A(Oe * lt),
              Ze = (At = R.BASE.multiplyAndAddUnsafe(Ce, ut, dt)) == null ? void 0 : At.toAffine();
            return Ze ? A(Ze.x) === Oe : !1;
          }
          return {
            CURVE: P,
            getPublicKey: q,
            getSharedSecret: N,
            sign: Y,
            verify: re,
            ProjectivePoint: R,
            Signature: O,
            utils: C,
          };
        }
        function v(E, P) {
          const d = E.ORDER;
          let j = c;
          for (let H = d - u; H % l === c; H /= l) j += u;
          const p = j,
            y = l << (p - u - u),
            I = y * l,
            w = (d - u) / I,
            A = (w - u) / l,
            B = I - u,
            R = y,
            S = E.pow(P, w),
            x = E.pow(P, (w + u) / l);
          let F = (H, T) => {
            let k = S,
              O = E.pow(T, B),
              C = E.sqr(O);
            C = E.mul(C, T);
            let q = E.mul(H, C);
            ((q = E.pow(q, A)), (q = E.mul(q, O)), (O = E.mul(q, T)), (C = E.mul(q, H)));
            let M = E.mul(C, O);
            q = E.pow(M, R);
            let N = E.eql(q, E.ONE);
            ((O = E.mul(C, x)), (q = E.mul(M, k)), (C = E.cmov(O, C, N)), (M = E.cmov(q, M, N)));
            for (let z = p; z > u; z--) {
              let $ = z - l;
              $ = l << ($ - u);
              let U = E.pow(M, $);
              const G = E.eql(U, E.ONE);
              ((O = E.mul(C, k)), (k = E.mul(k, k)), (U = E.mul(M, k)), (C = E.cmov(O, C, G)), (M = E.cmov(U, M, G)));
            }
            return { isValid: N, value: C };
          };
          if (E.ORDER % m === f) {
            const H = (E.ORDER - f) / m,
              T = E.sqrt(E.neg(P));
            F = (k, O) => {
              let C = E.sqr(O);
              const q = E.mul(k, O);
              C = E.mul(C, q);
              let M = E.pow(C, H);
              M = E.mul(M, q);
              const N = E.mul(M, T),
                z = E.mul(E.sqr(M), O),
                $ = E.eql(z, k);
              let U = E.cmov(N, M, $);
              return { isValid: $, value: U };
            };
          }
          return F;
        }
        function _(E, P) {
          if (((0, n.validateField)(E), !E.isValid(P.A) || !E.isValid(P.B) || !E.isValid(P.Z)))
            throw new Error("mapToCurveSimpleSWU: invalid opts");
          const d = v(E, P.Z);
          if (!E.isOdd) throw new Error("Fp.isOdd is not implemented!");
          return (j) => {
            let p, y, I, w, A, B, R, S;
            ((p = E.sqr(j)),
              (p = E.mul(p, P.Z)),
              (y = E.sqr(p)),
              (y = E.add(y, p)),
              (I = E.add(y, E.ONE)),
              (I = E.mul(I, P.B)),
              (w = E.cmov(P.Z, E.neg(y), !E.eql(y, E.ZERO))),
              (w = E.mul(w, P.A)),
              (y = E.sqr(I)),
              (B = E.sqr(w)),
              (A = E.mul(B, P.A)),
              (y = E.add(y, A)),
              (y = E.mul(y, I)),
              (B = E.mul(B, w)),
              (A = E.mul(B, P.B)),
              (y = E.add(y, A)),
              (R = E.mul(p, I)));
            const { isValid: x, value: F } = d(y, B);
            ((S = E.mul(p, j)), (S = E.mul(S, F)), (R = E.cmov(R, I, x)), (S = E.cmov(S, F, x)));
            const H = E.isOdd(j) === E.isOdd(S);
            S = E.cmov(E.neg(S), S, H);
            const T = (0, n.FpInvertBatch)(E, [w], !0)[0];
            return ((R = E.mul(R, T)), { x: R, y: S });
          };
        }
      })(Sd)),
    Sd
  );
}
var r1;
function Uv() {
  if (r1) return to;
  ((r1 = 1), Object.defineProperty(to, "__esModule", { value: !0 }), (to.getHash = t), (to.createCurve = o));
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const e = sg(),
    r = sr(),
    n = cg();
  function t(s) {
    return { hash: s, hmac: (i, ...a) => (0, e.hmac)(s, i, (0, r.concatBytes)(...a)), randomBytes: r.randomBytes };
  }
  function o(s, i) {
    const a = (c) => (0, n.weierstrass)({ ...s, ...t(c) });
    return { ...a(i), create: a };
  }
  return to;
}
var er = {},
  n1;
function Lv() {
  if (n1) return er;
  ((n1 = 1),
    Object.defineProperty(er, "__esModule", { value: !0 }),
    (er.expand_message_xmd = i),
    (er.expand_message_xof = a),
    (er.hash_to_field = c),
    (er.isogenyMap = u),
    (er.createHasher = l));
  const e = Cu(),
    r = Lr(),
    n = r.bytesToNumberBE;
  function t(f, m) {
    if ((s(f), s(m), f < 0 || f >= 1 << (8 * m))) throw new Error("invalid I2OSP input: " + f);
    const g = Array.from({ length: m }).fill(0);
    for (let h = m - 1; h >= 0; h--) ((g[h] = f & 255), (f >>>= 8));
    return new Uint8Array(g);
  }
  function o(f, m) {
    const g = new Uint8Array(f.length);
    for (let h = 0; h < f.length; h++) g[h] = f[h] ^ m[h];
    return g;
  }
  function s(f) {
    if (!Number.isSafeInteger(f)) throw new Error("number expected");
  }
  function i(f, m, g, h) {
    ((0, r.abytes)(f),
      (0, r.abytes)(m),
      s(g),
      m.length > 255 && (m = h((0, r.concatBytes)((0, r.utf8ToBytes)("H2C-OVERSIZE-DST-"), m))));
    const { outputLen: b, blockLen: v } = h,
      _ = Math.ceil(g / b);
    if (g > 65535 || _ > 255) throw new Error("expand_message_xmd: invalid lenInBytes");
    const E = (0, r.concatBytes)(m, t(m.length, 1)),
      P = t(0, v),
      d = t(g, 2),
      j = new Array(_),
      p = h((0, r.concatBytes)(P, f, d, t(0, 1), E));
    j[0] = h((0, r.concatBytes)(p, t(1, 1), E));
    for (let I = 1; I <= _; I++) {
      const w = [o(p, j[I - 1]), t(I + 1, 1), E];
      j[I] = h((0, r.concatBytes)(...w));
    }
    return (0, r.concatBytes)(...j).slice(0, g);
  }
  function a(f, m, g, h, b) {
    if (((0, r.abytes)(f), (0, r.abytes)(m), s(g), m.length > 255)) {
      const v = Math.ceil((2 * h) / 8);
      m = b
        .create({ dkLen: v })
        .update((0, r.utf8ToBytes)("H2C-OVERSIZE-DST-"))
        .update(m)
        .digest();
    }
    if (g > 65535 || m.length > 255) throw new Error("expand_message_xof: invalid lenInBytes");
    return b.create({ dkLen: g }).update(f).update(t(g, 2)).update(m).update(t(m.length, 1)).digest();
  }
  function c(f, m, g) {
    (0, r.validateObject)(g, {
      DST: "stringOrUint8Array",
      p: "bigint",
      m: "isSafeInteger",
      k: "isSafeInteger",
      hash: "hash",
    });
    const { p: h, k: b, m: v, hash: _, expand: E, DST: P } = g;
    ((0, r.abytes)(f), s(m));
    const d = typeof P == "string" ? (0, r.utf8ToBytes)(P) : P,
      j = h.toString(2).length,
      p = Math.ceil((j + b) / 8),
      y = m * v * p;
    let I;
    if (E === "xmd") I = i(f, d, y, _);
    else if (E === "xof") I = a(f, d, y, b, _);
    else if (E === "_internal_pass") I = f;
    else throw new Error('expand must be "xmd" or "xof"');
    const w = new Array(m);
    for (let A = 0; A < m; A++) {
      const B = new Array(v);
      for (let R = 0; R < v; R++) {
        const S = p * (R + A * v),
          x = I.subarray(S, S + p);
        B[R] = (0, e.mod)(n(x), h);
      }
      w[A] = B;
    }
    return w;
  }
  function u(f, m) {
    const g = m.map((h) => Array.from(h).reverse());
    return (h, b) => {
      const [v, _, E, P] = g.map((p) => p.reduce((y, I) => f.add(f.mul(y, h), I))),
        [d, j] = (0, e.FpInvertBatch)(f, [_, P], !0);
      return ((h = f.mul(v, d)), (b = f.mul(b, f.mul(E, j))), { x: h, y: b });
    };
  }
  function l(f, m, g) {
    if (typeof m != "function") throw new Error("mapToCurve() must be defined");
    function h(v) {
      return f.fromAffine(m(v));
    }
    function b(v) {
      const _ = v.clearCofactor();
      return _.equals(f.ZERO) ? f.ZERO : (_.assertValidity(), _);
    }
    return {
      defaults: g,
      hashToCurve(v, _) {
        const E = c(v, 2, { ...g, DST: g.DST, ..._ }),
          P = h(E[0]),
          d = h(E[1]);
        return b(P.add(d));
      },
      encodeToCurve(v, _) {
        const E = c(v, 1, { ...g, DST: g.encodeDST, ..._ });
        return b(h(E[0]));
      },
      mapToCurve(v) {
        if (!Array.isArray(v)) throw new Error("expected array of bigints");
        for (const _ of v) if (typeof _ != "bigint") throw new Error("expected array of bigints");
        return b(h(v));
      },
    };
  }
  return er;
}
var o1;
function Dr() {
  return (
    o1 ||
      ((o1 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.encodeToCurve = e.hashToCurve = e.secp256k1_hasher = e.schnorr = e.secp256k1 = void 0));
        /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const r = ag(),
          n = sr(),
          t = Uv(),
          o = Lv(),
          s = Cu(),
          i = Lr(),
          a = cg(),
          c = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
          u = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
          l = BigInt(0),
          f = BigInt(1),
          m = BigInt(2),
          g = (T, k) => (T + k / m) / k;
        function h(T) {
          const k = c,
            O = BigInt(3),
            C = BigInt(6),
            q = BigInt(11),
            M = BigInt(22),
            N = BigInt(23),
            z = BigInt(44),
            $ = BigInt(88),
            U = (T * T * T) % k,
            G = (U * U * T) % k,
            Z = ((0, s.pow2)(G, O, k) * G) % k,
            K = ((0, s.pow2)(Z, O, k) * G) % k,
            V = ((0, s.pow2)(K, m, k) * U) % k,
            Y = ((0, s.pow2)(V, q, k) * V) % k,
            re = ((0, s.pow2)(Y, M, k) * Y) % k,
            J = ((0, s.pow2)(re, z, k) * re) % k,
            X = ((0, s.pow2)(J, $, k) * J) % k,
            Q = ((0, s.pow2)(X, z, k) * re) % k,
            oe = ((0, s.pow2)(Q, O, k) * G) % k,
            ie = ((0, s.pow2)(oe, N, k) * Y) % k,
            se = ((0, s.pow2)(ie, C, k) * U) % k,
            de = (0, s.pow2)(se, m, k);
          if (!b.eql(b.sqr(de), T)) throw new Error("Cannot find square root");
          return de;
        }
        const b = (0, s.Field)(c, void 0, void 0, { sqrt: h });
        e.secp256k1 = (0, t.createCurve)(
          {
            a: l,
            b: BigInt(7),
            Fp: b,
            n: u,
            Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
            Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
            h: BigInt(1),
            lowS: !0,
            endo: {
              beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
              splitScalar: (T) => {
                const k = u,
                  O = BigInt("0x3086d221a7d46bcde86c90e49284eb15"),
                  C = -f * BigInt("0xe4437ed6010e88286f547fa90abfe4c3"),
                  q = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"),
                  M = O,
                  N = BigInt("0x100000000000000000000000000000000"),
                  z = g(M * T, k),
                  $ = g(-C * T, k);
                let U = (0, s.mod)(T - z * O - $ * q, k),
                  G = (0, s.mod)(-z * C - $ * M, k);
                const Z = U > N,
                  K = G > N;
                if ((Z && (U = k - U), K && (G = k - G), U > N || G > N))
                  throw new Error("splitScalar: Endomorphism failed, k=" + T);
                return { k1neg: Z, k1: U, k2neg: K, k2: G };
              },
            },
          },
          r.sha256,
        );
        const v = {};
        function _(T, ...k) {
          let O = v[T];
          if (O === void 0) {
            const C = (0, r.sha256)(Uint8Array.from(T, (q) => q.charCodeAt(0)));
            ((O = (0, i.concatBytes)(C, C)), (v[T] = O));
          }
          return (0, r.sha256)((0, i.concatBytes)(O, ...k));
        }
        const E = (T) => T.toRawBytes(!0).slice(1),
          P = (T) => (0, i.numberToBytesBE)(T, 32),
          d = (T) => (0, s.mod)(T, c),
          j = (T) => (0, s.mod)(T, u),
          p = e.secp256k1.ProjectivePoint,
          y = (T, k, O) => p.BASE.multiplyAndAddUnsafe(T, k, O);
        function I(T) {
          let k = e.secp256k1.utils.normPrivateKeyToScalar(T),
            O = p.fromPrivateKey(k);
          return { scalar: O.hasEvenY() ? k : j(-k), bytes: E(O) };
        }
        function w(T) {
          (0, i.aInRange)("x", T, f, c);
          const k = d(T * T),
            O = d(k * T + BigInt(7));
          let C = h(O);
          C % m !== l && (C = d(-C));
          const q = new p(T, C, f);
          return (q.assertValidity(), q);
        }
        const A = i.bytesToNumberBE;
        function B(...T) {
          return j(A(_("BIP0340/challenge", ...T)));
        }
        function R(T) {
          return I(T).bytes;
        }
        function S(T, k, O = (0, n.randomBytes)(32)) {
          const C = (0, i.ensureBytes)("message", T),
            { bytes: q, scalar: M } = I(k),
            N = (0, i.ensureBytes)("auxRand", O, 32),
            z = P(M ^ A(_("BIP0340/aux", N))),
            $ = _("BIP0340/nonce", z, q, C),
            U = j(A($));
          if (U === l) throw new Error("sign failed: k is zero");
          const { bytes: G, scalar: Z } = I(U),
            K = B(G, q, C),
            V = new Uint8Array(64);
          if ((V.set(G, 0), V.set(P(j(Z + K * M)), 32), !x(V, C, q)))
            throw new Error("sign: Invalid signature produced");
          return V;
        }
        function x(T, k, O) {
          const C = (0, i.ensureBytes)("signature", T, 64),
            q = (0, i.ensureBytes)("message", k),
            M = (0, i.ensureBytes)("publicKey", O, 32);
          try {
            const N = w(A(M)),
              z = A(C.subarray(0, 32));
            if (!(0, i.inRange)(z, f, c)) return !1;
            const $ = A(C.subarray(32, 64));
            if (!(0, i.inRange)($, f, u)) return !1;
            const U = B(P(z), E(N), q),
              G = y(N, $, j(-U));
            return !(!G || !G.hasEvenY() || G.toAffine().x !== z);
          } catch {
            return !1;
          }
        }
        e.schnorr = {
          getPublicKey: R,
          sign: S,
          verify: x,
          utils: {
            randomPrivateKey: e.secp256k1.utils.randomPrivateKey,
            lift_x: w,
            pointToBytes: E,
            numberToBytesBE: i.numberToBytesBE,
            bytesToNumberBE: i.bytesToNumberBE,
            taggedHash: _,
            mod: s.mod,
          },
        };
        const F = (0, o.isogenyMap)(
            b,
            [
              [
                "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
                "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
                "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
                "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c",
              ],
              [
                "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
                "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
              ],
              [
                "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
                "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
                "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
                "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84",
              ],
              [
                "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
                "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
                "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
              ],
            ].map((T) => T.map((k) => BigInt(k))),
          ),
          H = (0, a.mapToCurveSimpleSWU)(b, {
            A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
            B: BigInt("1771"),
            Z: b.create(BigInt("-11")),
          });
        ((e.secp256k1_hasher = (0, o.createHasher)(
          e.secp256k1.ProjectivePoint,
          (T) => {
            const { x: k, y: O } = H(b.create(T[0]));
            return F(k, O);
          },
          {
            DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
            encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
            p: b.ORDER,
            m: 1,
            k: 128,
            expand: "xmd",
            hash: r.sha256,
          },
        )),
          (e.hashToCurve = e.secp256k1_hasher.hashToCurve),
          (e.encodeToCurve = e.secp256k1_hasher.encodeToCurve));
      })(Ad)),
    Ad
  );
}
var i1;
function nf() {
  if (i1) return Wi;
  ((i1 = 1), Object.defineProperty(Wi, "__esModule", { value: !0 }), (Wi.recoverPublicKey = o));
  const e = Ge(),
    r = Ve(),
    n = Be(),
    t = te();
  async function o({ hash: i, signature: a }) {
    const c = (0, e.isHex)(i) ? i : (0, t.toHex)(i),
      { secp256k1: u } = await Promise.resolve().then(() => Dr());
    return `0x${(() => {
      if (typeof a == "object" && "r" in a && "s" in a) {
        const { r: b, s: v, v: _, yParity: E } = a,
          P = Number(E ?? _),
          d = s(P);
        return new u.Signature((0, n.hexToBigInt)(b), (0, n.hexToBigInt)(v)).addRecoveryBit(d);
      }
      const m = (0, e.isHex)(a) ? a : (0, t.toHex)(a);
      if ((0, r.size)(m) !== 65) throw new Error("invalid signature length");
      const g = (0, n.hexToNumber)(`0x${m.slice(130)}`),
        h = s(g);
      return u.Signature.fromCompact(m.substring(2, 130)).addRecoveryBit(h);
    })()
      .recoverPublicKey(c.substring(2))
      .toHex(!1)}`;
  }
  function s(i) {
    if (i === 0 || i === 1) return i;
    if (i === 27) return 0;
    if (i === 28) return 1;
    throw new Error("Invalid yParityOrV value");
  }
  return Wi;
}
var a1;
function lr() {
  if (a1) return Gi;
  ((a1 = 1), Object.defineProperty(Gi, "__esModule", { value: !0 }), (Gi.recoverAddress = n));
  const e = og(),
    r = nf();
  async function n({ hash: t, signature: o }) {
    return (0, e.publicKeyToAddress)(await (0, r.recoverPublicKey)({ hash: t, signature: o }));
  }
  return Gi;
}
var Ki = {},
  rn = {},
  s1;
function ko() {
  if (s1) return rn;
  ((s1 = 1),
    Object.defineProperty(rn, "__esModule", { value: !0 }),
    (rn.toRlp = o),
    (rn.bytesToRlp = s),
    (rn.hexToRlp = i));
  const e = ue(),
    r = qo(),
    n = ve(),
    t = te();
  function o(f, m = "hex") {
    const g = a(f),
      h = (0, r.createCursor)(new Uint8Array(g.length));
    return (g.encode(h), m === "hex" ? (0, t.bytesToHex)(h.bytes) : h.bytes);
  }
  function s(f, m = "bytes") {
    return o(f, m);
  }
  function i(f, m = "hex") {
    return o(f, m);
  }
  function a(f) {
    return Array.isArray(f) ? c(f.map((m) => a(m))) : u(f);
  }
  function c(f) {
    const m = f.reduce((b, v) => b + v.length, 0),
      g = l(m);
    return {
      length: m <= 55 ? 1 + m : 1 + g + m,
      encode(b) {
        m <= 55
          ? b.pushByte(192 + m)
          : (b.pushByte(247 + g),
            g === 1 ? b.pushUint8(m) : g === 2 ? b.pushUint16(m) : g === 3 ? b.pushUint24(m) : b.pushUint32(m));
        for (const { encode: v } of f) v(b);
      },
    };
  }
  function u(f) {
    const m = typeof f == "string" ? (0, n.hexToBytes)(f) : f,
      g = l(m.length);
    return {
      length: m.length === 1 && m[0] < 128 ? 1 : m.length <= 55 ? 1 + m.length : 1 + g + m.length,
      encode(b) {
        m.length === 1 && m[0] < 128
          ? b.pushBytes(m)
          : m.length <= 55
            ? (b.pushByte(128 + m.length), b.pushBytes(m))
            : (b.pushByte(183 + g),
              g === 1
                ? b.pushUint8(m.length)
                : g === 2
                  ? b.pushUint16(m.length)
                  : g === 3
                    ? b.pushUint24(m.length)
                    : b.pushUint32(m.length),
              b.pushBytes(m));
      },
    };
  }
  function l(f) {
    if (f < 2 ** 8) return 1;
    if (f < 2 ** 16) return 2;
    if (f < 2 ** 24) return 3;
    if (f < 2 ** 32) return 4;
    throw new e.BaseError("Length is too large.");
  }
  return rn;
}
var c1;
function ug() {
  if (c1) return Ki;
  ((c1 = 1), Object.defineProperty(Ki, "__esModule", { value: !0 }), (Ki.hashAuthorization = s));
  const e = qe(),
    r = ve(),
    n = te(),
    t = ko(),
    o = Xe();
  function s(i) {
    const { chainId: a, nonce: c, to: u } = i,
      l = i.contractAddress ?? i.address,
      f = (0, o.keccak256)(
        (0, e.concatHex)([
          "0x05",
          (0, t.toRlp)([a ? (0, n.numberToHex)(a) : "0x", l, c ? (0, n.numberToHex)(c) : "0x"]),
        ]),
      );
    return u === "bytes" ? (0, r.hexToBytes)(f) : f;
  }
  return Ki;
}
var u1;
function Fo() {
  if (u1) return Di;
  ((u1 = 1), Object.defineProperty(Di, "__esModule", { value: !0 }), (Di.recoverAuthorizationAddress = n));
  const e = lr(),
    r = ug();
  async function n(t) {
    const { authorization: o, signature: s } = t;
    return (0, e.recoverAddress)({ hash: (0, r.hashAuthorization)(o), signature: s ?? o });
  }
  return Di;
}
var Zi = {},
  ro = {},
  d1;
function dg() {
  if (d1) return ro;
  ((d1 = 1), Object.defineProperty(ro, "__esModule", { value: !0 }), (ro.EstimateGasExecutionError = void 0));
  const e = Ho(),
    r = Ur(),
    n = ue(),
    t = tt();
  class o extends n.BaseError {
    constructor(
      i,
      {
        account: a,
        docsPath: c,
        chain: u,
        data: l,
        gas: f,
        gasPrice: m,
        maxFeePerGas: g,
        maxPriorityFeePerGas: h,
        nonce: b,
        to: v,
        value: _,
      },
    ) {
      var P;
      const E = (0, t.prettyPrint)({
        from: a == null ? void 0 : a.address,
        to: v,
        value:
          typeof _ < "u" &&
          `${(0, e.formatEther)(_)} ${((P = u == null ? void 0 : u.nativeCurrency) == null ? void 0 : P.symbol) || "ETH"}`,
        data: l,
        gas: f,
        gasPrice: typeof m < "u" && `${(0, r.formatGwei)(m)} gwei`,
        maxFeePerGas: typeof g < "u" && `${(0, r.formatGwei)(g)} gwei`,
        maxPriorityFeePerGas: typeof h < "u" && `${(0, r.formatGwei)(h)} gwei`,
        nonce: b,
      });
      (super(i.shortMessage, {
        cause: i,
        docsPath: c,
        metaMessages: [...(i.metaMessages ? [...i.metaMessages, " "] : []), "Estimate Gas Arguments:", E].filter(
          Boolean,
        ),
        name: "EstimateGasExecutionError",
      }),
        Object.defineProperty(this, "cause", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.cause = i));
    }
  }
  return ((ro.EstimateGasExecutionError = o), ro);
}
var _e = {},
  f1;
function Zt() {
  if (f1) return _e;
  ((f1 = 1),
    Object.defineProperty(_e, "__esModule", { value: !0 }),
    (_e.UnknownNodeError =
      _e.TipAboveFeeCapError =
      _e.TransactionTypeNotSupportedError =
      _e.IntrinsicGasTooLowError =
      _e.IntrinsicGasTooHighError =
      _e.InsufficientFundsError =
      _e.NonceMaxValueError =
      _e.NonceTooLowError =
      _e.NonceTooHighError =
      _e.FeeCapTooLowError =
      _e.FeeCapTooHighError =
      _e.ExecutionRevertedError =
        void 0));
  const e = Ur(),
    r = ue();
  class n extends r.BaseError {
    constructor({ cause: b, message: v } = {}) {
      var E;
      const _ =
        (E = v == null ? void 0 : v.replace("execution reverted: ", "")) == null
          ? void 0
          : E.replace("execution reverted", "");
      super(`Execution reverted ${_ ? `with reason: ${_}` : "for an unknown reason"}.`, {
        cause: b,
        name: "ExecutionRevertedError",
      });
    }
  }
  ((_e.ExecutionRevertedError = n),
    Object.defineProperty(n, "code", { enumerable: !0, configurable: !0, writable: !0, value: 3 }),
    Object.defineProperty(n, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /execution reverted|gas required exceeds allowance/,
    }));
  class t extends r.BaseError {
    constructor({ cause: b, maxFeePerGas: v } = {}) {
      super(
        `The fee cap (\`maxFeePerGas\`${v ? ` = ${(0, e.formatGwei)(v)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`,
        { cause: b, name: "FeeCapTooHighError" },
      );
    }
  }
  ((_e.FeeCapTooHighError = t),
    Object.defineProperty(t, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/,
    }));
  class o extends r.BaseError {
    constructor({ cause: b, maxFeePerGas: v } = {}) {
      super(
        `The fee cap (\`maxFeePerGas\`${v ? ` = ${(0, e.formatGwei)(v)}` : ""} gwei) cannot be lower than the block base fee.`,
        { cause: b, name: "FeeCapTooLowError" },
      );
    }
  }
  ((_e.FeeCapTooLowError = o),
    Object.defineProperty(o, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/,
    }));
  class s extends r.BaseError {
    constructor({ cause: b, nonce: v } = {}) {
      super(`Nonce provided for the transaction ${v ? `(${v}) ` : ""}is higher than the next one expected.`, {
        cause: b,
        name: "NonceTooHighError",
      });
    }
  }
  ((_e.NonceTooHighError = s),
    Object.defineProperty(s, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /nonce too high/,
    }));
  class i extends r.BaseError {
    constructor({ cause: b, nonce: v } = {}) {
      super(
        [
          `Nonce provided for the transaction ${v ? `(${v}) ` : ""}is lower than the current nonce of the account.`,
          "Try increasing the nonce or find the latest nonce with `getTransactionCount`.",
        ].join(`
`),
        { cause: b, name: "NonceTooLowError" },
      );
    }
  }
  ((_e.NonceTooLowError = i),
    Object.defineProperty(i, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /nonce too low|transaction already imported|already known/,
    }));
  class a extends r.BaseError {
    constructor({ cause: b, nonce: v } = {}) {
      super(`Nonce provided for the transaction ${v ? `(${v}) ` : ""}exceeds the maximum allowed nonce.`, {
        cause: b,
        name: "NonceMaxValueError",
      });
    }
  }
  ((_e.NonceMaxValueError = a),
    Object.defineProperty(a, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /nonce has max value/,
    }));
  class c extends r.BaseError {
    constructor({ cause: b } = {}) {
      super(
        ["The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."]
          .join(`
`),
        {
          cause: b,
          metaMessages: [
            "This error could arise when the account does not have enough funds to:",
            " - pay for the total gas fee,",
            " - pay for the value to send.",
            " ",
            "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
            " - `gas` is the amount of gas needed for transaction to execute,",
            " - `gas fee` is the gas fee,",
            " - `value` is the amount of ether to send to the recipient.",
          ],
          name: "InsufficientFundsError",
        },
      );
    }
  }
  ((_e.InsufficientFundsError = c),
    Object.defineProperty(c, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /insufficient funds|exceeds transaction sender account balance/,
    }));
  class u extends r.BaseError {
    constructor({ cause: b, gas: v } = {}) {
      super(
        `The amount of gas ${v ? `(${v}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`,
        { cause: b, name: "IntrinsicGasTooHighError" },
      );
    }
  }
  ((_e.IntrinsicGasTooHighError = u),
    Object.defineProperty(u, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /intrinsic gas too high|gas limit reached/,
    }));
  class l extends r.BaseError {
    constructor({ cause: b, gas: v } = {}) {
      super(`The amount of gas ${v ? `(${v}) ` : ""}provided for the transaction is too low.`, {
        cause: b,
        name: "IntrinsicGasTooLowError",
      });
    }
  }
  ((_e.IntrinsicGasTooLowError = l),
    Object.defineProperty(l, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /intrinsic gas too low/,
    }));
  class f extends r.BaseError {
    constructor({ cause: b }) {
      super("The transaction type is not supported for this chain.", {
        cause: b,
        name: "TransactionTypeNotSupportedError",
      });
    }
  }
  ((_e.TransactionTypeNotSupportedError = f),
    Object.defineProperty(f, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /transaction type not valid/,
    }));
  class m extends r.BaseError {
    constructor({ cause: b, maxPriorityFeePerGas: v, maxFeePerGas: _ } = {}) {
      super(
        [
          `The provided tip (\`maxPriorityFeePerGas\`${v ? ` = ${(0, e.formatGwei)(v)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${_ ? ` = ${(0, e.formatGwei)(_)} gwei` : ""}).`,
        ].join(`
`),
        { cause: b, name: "TipAboveFeeCapError" },
      );
    }
  }
  ((_e.TipAboveFeeCapError = m),
    Object.defineProperty(m, "nodeMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/,
    }));
  class g extends r.BaseError {
    constructor({ cause: b }) {
      super(`An error occurred while executing: ${b == null ? void 0 : b.shortMessage}`, {
        cause: b,
        name: "UnknownNodeError",
      });
    }
  }
  return ((_e.UnknownNodeError = g), _e);
}
var no = {},
  l1;
function No() {
  if (l1) return no;
  ((l1 = 1), Object.defineProperty(no, "__esModule", { value: !0 }), (no.containsNodeError = o), (no.getNodeError = s));
  const e = ue(),
    r = Zt(),
    n = Et(),
    t = dr();
  function o(i) {
    return (
      i instanceof t.TransactionRejectedRpcError ||
      i instanceof t.InvalidInputRpcError ||
      (i instanceof n.RpcRequestError && i.code === r.ExecutionRevertedError.code)
    );
  }
  function s(i, a) {
    const c = (i.details || "").toLowerCase(),
      u = i instanceof e.BaseError ? i.walk((l) => (l == null ? void 0 : l.code) === r.ExecutionRevertedError.code) : i;
    return u instanceof e.BaseError
      ? new r.ExecutionRevertedError({ cause: i, message: u.details })
      : r.ExecutionRevertedError.nodeMessage.test(c)
        ? new r.ExecutionRevertedError({ cause: i, message: i.details })
        : r.FeeCapTooHighError.nodeMessage.test(c)
          ? new r.FeeCapTooHighError({ cause: i, maxFeePerGas: a == null ? void 0 : a.maxFeePerGas })
          : r.FeeCapTooLowError.nodeMessage.test(c)
            ? new r.FeeCapTooLowError({ cause: i, maxFeePerGas: a == null ? void 0 : a.maxFeePerGas })
            : r.NonceTooHighError.nodeMessage.test(c)
              ? new r.NonceTooHighError({ cause: i, nonce: a == null ? void 0 : a.nonce })
              : r.NonceTooLowError.nodeMessage.test(c)
                ? new r.NonceTooLowError({ cause: i, nonce: a == null ? void 0 : a.nonce })
                : r.NonceMaxValueError.nodeMessage.test(c)
                  ? new r.NonceMaxValueError({ cause: i, nonce: a == null ? void 0 : a.nonce })
                  : r.InsufficientFundsError.nodeMessage.test(c)
                    ? new r.InsufficientFundsError({ cause: i })
                    : r.IntrinsicGasTooHighError.nodeMessage.test(c)
                      ? new r.IntrinsicGasTooHighError({ cause: i, gas: a == null ? void 0 : a.gas })
                      : r.IntrinsicGasTooLowError.nodeMessage.test(c)
                        ? new r.IntrinsicGasTooLowError({ cause: i, gas: a == null ? void 0 : a.gas })
                        : r.TransactionTypeNotSupportedError.nodeMessage.test(c)
                          ? new r.TransactionTypeNotSupportedError({ cause: i })
                          : r.TipAboveFeeCapError.nodeMessage.test(c)
                            ? new r.TipAboveFeeCapError({
                                cause: i,
                                maxFeePerGas: a == null ? void 0 : a.maxFeePerGas,
                                maxPriorityFeePerGas: a == null ? void 0 : a.maxPriorityFeePerGas,
                              })
                            : new r.UnknownNodeError({ cause: i });
  }
  return no;
}
var b1;
function fg() {
  if (b1) return Zi;
  ((b1 = 1), Object.defineProperty(Zi, "__esModule", { value: !0 }), (Zi.getEstimateGasError = t));
  const e = dg(),
    r = Zt(),
    n = No();
  function t(o, { docsPath: s, ...i }) {
    const a = (() => {
      const c = (0, n.getNodeError)(o, i);
      return c instanceof r.UnknownNodeError ? o : c;
    })();
    return new e.EstimateGasExecutionError(a, { docsPath: s, ...i });
  }
  return Zi;
}
var Ji = {},
  m1;
function br() {
  if (m1) return Ji;
  ((m1 = 1), Object.defineProperty(Ji, "__esModule", { value: !0 }), (Ji.extract = e));
  function e(r, { format: n }) {
    if (!n) return {};
    const t = {};
    function o(i) {
      const a = Object.keys(i);
      for (const c of a) (c in r && (t[c] = r[c]), i[c] && typeof i[c] == "object" && !Array.isArray(i[c]) && o(i[c]));
    }
    const s = n(r || {});
    return (o(s), t);
  }
  return Ji;
}
var Id = {},
  Yi = {},
  h1;
function $o() {
  if (h1) return Yi;
  ((h1 = 1), Object.defineProperty(Yi, "__esModule", { value: !0 }), (Yi.defineFormatter = e));
  function e(r, n) {
    return ({ exclude: t, format: o }) => ({
      exclude: t,
      format: (s, i) => {
        const a = n(s, i);
        if (t) for (const c of t) delete a[c];
        return { ...a, ...o(s, i) };
      },
      type: r,
    });
  }
  return Yi;
}
var y1;
function jt() {
  return (
    y1 ||
      ((y1 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.defineTransactionRequest = e.rpcTransactionType = void 0),
          (e.formatTransactionRequest = t));
        const r = te(),
          n = $o();
        e.rpcTransactionType = { legacy: "0x0", eip2930: "0x1", eip1559: "0x2", eip4844: "0x3", eip7702: "0x4" };
        function t(s, i) {
          const a = {};
          return (
            typeof s.authorizationList < "u" && (a.authorizationList = o(s.authorizationList)),
            typeof s.accessList < "u" && (a.accessList = s.accessList),
            typeof s.blobVersionedHashes < "u" && (a.blobVersionedHashes = s.blobVersionedHashes),
            typeof s.blobs < "u" &&
              (typeof s.blobs[0] != "string"
                ? (a.blobs = s.blobs.map((c) => (0, r.bytesToHex)(c)))
                : (a.blobs = s.blobs)),
            typeof s.data < "u" && (a.data = s.data),
            s.account && (a.from = s.account.address),
            typeof s.from < "u" && (a.from = s.from),
            typeof s.gas < "u" && (a.gas = (0, r.numberToHex)(s.gas)),
            typeof s.gasPrice < "u" && (a.gasPrice = (0, r.numberToHex)(s.gasPrice)),
            typeof s.maxFeePerBlobGas < "u" && (a.maxFeePerBlobGas = (0, r.numberToHex)(s.maxFeePerBlobGas)),
            typeof s.maxFeePerGas < "u" && (a.maxFeePerGas = (0, r.numberToHex)(s.maxFeePerGas)),
            typeof s.maxPriorityFeePerGas < "u" &&
              (a.maxPriorityFeePerGas = (0, r.numberToHex)(s.maxPriorityFeePerGas)),
            typeof s.nonce < "u" && (a.nonce = (0, r.numberToHex)(s.nonce)),
            typeof s.to < "u" && (a.to = s.to),
            typeof s.type < "u" && (a.type = e.rpcTransactionType[s.type]),
            typeof s.value < "u" && (a.value = (0, r.numberToHex)(s.value)),
            a
          );
        }
        e.defineTransactionRequest = (0, n.defineFormatter)("transactionRequest", t);
        function o(s) {
          return s.map((i) => ({
            address: i.address,
            r: i.r ? (0, r.numberToHex)(BigInt(i.r)) : i.r,
            s: i.s ? (0, r.numberToHex)(BigInt(i.s)) : i.s,
            chainId: (0, r.numberToHex)(i.chainId),
            nonce: (0, r.numberToHex)(i.nonce),
            ...(typeof i.yParity < "u" ? { yParity: (0, r.numberToHex)(i.yParity) } : {}),
            ...(typeof i.v < "u" && typeof i.yParity > "u" ? { v: (0, r.numberToHex)(i.v) } : {}),
          }));
        }
      })(Id)),
    Id
  );
}
var nn = {},
  p1;
function of() {
  if (p1) return nn;
  ((p1 = 1),
    Object.defineProperty(nn, "__esModule", { value: !0 }),
    (nn.serializeStateMapping = s),
    (nn.serializeAccountStateOverride = i),
    (nn.serializeStateOverride = a));
  const e = _t(),
    r = Su(),
    n = tf(),
    t = et(),
    o = te();
  function s(c) {
    if (!(!c || c.length === 0))
      return c.reduce((u, { slot: l, value: f }) => {
        if (l.length !== 66) throw new r.InvalidBytesLengthError({ size: l.length, targetSize: 66, type: "hex" });
        if (f.length !== 66) throw new r.InvalidBytesLengthError({ size: f.length, targetSize: 66, type: "hex" });
        return ((u[l] = f), u);
      }, {});
  }
  function i(c) {
    const { balance: u, nonce: l, state: f, stateDiff: m, code: g } = c,
      h = {};
    if (
      (g !== void 0 && (h.code = g),
      u !== void 0 && (h.balance = (0, o.numberToHex)(u)),
      l !== void 0 && (h.nonce = (0, o.numberToHex)(l)),
      f !== void 0 && (h.state = s(f)),
      m !== void 0)
    ) {
      if (h.state) throw new n.StateAssignmentConflictError();
      h.stateDiff = s(m);
    }
    return h;
  }
  function a(c) {
    if (!c) return;
    const u = {};
    for (const { address: l, ...f } of c) {
      if (!(0, t.isAddress)(l, { strict: !1 })) throw new e.InvalidAddressError({ address: l });
      if (u[l]) throw new n.AccountStateConflictError({ address: l });
      u[l] = i(f);
    }
    return u;
  }
  return nn;
}
var Xi = {},
  D = {},
  g1;
function af() {
  return (
    g1 ||
      ((g1 = 1),
      Object.defineProperty(D, "__esModule", { value: !0 }),
      (D.minInt144 =
        D.minInt136 =
        D.minInt128 =
        D.minInt120 =
        D.minInt112 =
        D.minInt104 =
        D.minInt96 =
        D.minInt88 =
        D.minInt80 =
        D.minInt72 =
        D.minInt64 =
        D.minInt56 =
        D.minInt48 =
        D.minInt40 =
        D.minInt32 =
        D.minInt24 =
        D.minInt16 =
        D.minInt8 =
        D.maxInt256 =
        D.maxInt248 =
        D.maxInt240 =
        D.maxInt232 =
        D.maxInt224 =
        D.maxInt216 =
        D.maxInt208 =
        D.maxInt200 =
        D.maxInt192 =
        D.maxInt184 =
        D.maxInt176 =
        D.maxInt168 =
        D.maxInt160 =
        D.maxInt152 =
        D.maxInt144 =
        D.maxInt136 =
        D.maxInt128 =
        D.maxInt120 =
        D.maxInt112 =
        D.maxInt104 =
        D.maxInt96 =
        D.maxInt88 =
        D.maxInt80 =
        D.maxInt72 =
        D.maxInt64 =
        D.maxInt56 =
        D.maxInt48 =
        D.maxInt40 =
        D.maxInt32 =
        D.maxInt24 =
        D.maxInt16 =
        D.maxInt8 =
          void 0),
      (D.maxUint256 =
        D.maxUint248 =
        D.maxUint240 =
        D.maxUint232 =
        D.maxUint224 =
        D.maxUint216 =
        D.maxUint208 =
        D.maxUint200 =
        D.maxUint192 =
        D.maxUint184 =
        D.maxUint176 =
        D.maxUint168 =
        D.maxUint160 =
        D.maxUint152 =
        D.maxUint144 =
        D.maxUint136 =
        D.maxUint128 =
        D.maxUint120 =
        D.maxUint112 =
        D.maxUint104 =
        D.maxUint96 =
        D.maxUint88 =
        D.maxUint80 =
        D.maxUint72 =
        D.maxUint64 =
        D.maxUint56 =
        D.maxUint48 =
        D.maxUint40 =
        D.maxUint32 =
        D.maxUint24 =
        D.maxUint16 =
        D.maxUint8 =
        D.minInt256 =
        D.minInt248 =
        D.minInt240 =
        D.minInt232 =
        D.minInt224 =
        D.minInt216 =
        D.minInt208 =
        D.minInt200 =
        D.minInt192 =
        D.minInt184 =
        D.minInt176 =
        D.minInt168 =
        D.minInt160 =
        D.minInt152 =
          void 0),
      (D.maxInt8 = 2n ** (8n - 1n) - 1n),
      (D.maxInt16 = 2n ** (16n - 1n) - 1n),
      (D.maxInt24 = 2n ** (24n - 1n) - 1n),
      (D.maxInt32 = 2n ** (32n - 1n) - 1n),
      (D.maxInt40 = 2n ** (40n - 1n) - 1n),
      (D.maxInt48 = 2n ** (48n - 1n) - 1n),
      (D.maxInt56 = 2n ** (56n - 1n) - 1n),
      (D.maxInt64 = 2n ** (64n - 1n) - 1n),
      (D.maxInt72 = 2n ** (72n - 1n) - 1n),
      (D.maxInt80 = 2n ** (80n - 1n) - 1n),
      (D.maxInt88 = 2n ** (88n - 1n) - 1n),
      (D.maxInt96 = 2n ** (96n - 1n) - 1n),
      (D.maxInt104 = 2n ** (104n - 1n) - 1n),
      (D.maxInt112 = 2n ** (112n - 1n) - 1n),
      (D.maxInt120 = 2n ** (120n - 1n) - 1n),
      (D.maxInt128 = 2n ** (128n - 1n) - 1n),
      (D.maxInt136 = 2n ** (136n - 1n) - 1n),
      (D.maxInt144 = 2n ** (144n - 1n) - 1n),
      (D.maxInt152 = 2n ** (152n - 1n) - 1n),
      (D.maxInt160 = 2n ** (160n - 1n) - 1n),
      (D.maxInt168 = 2n ** (168n - 1n) - 1n),
      (D.maxInt176 = 2n ** (176n - 1n) - 1n),
      (D.maxInt184 = 2n ** (184n - 1n) - 1n),
      (D.maxInt192 = 2n ** (192n - 1n) - 1n),
      (D.maxInt200 = 2n ** (200n - 1n) - 1n),
      (D.maxInt208 = 2n ** (208n - 1n) - 1n),
      (D.maxInt216 = 2n ** (216n - 1n) - 1n),
      (D.maxInt224 = 2n ** (224n - 1n) - 1n),
      (D.maxInt232 = 2n ** (232n - 1n) - 1n),
      (D.maxInt240 = 2n ** (240n - 1n) - 1n),
      (D.maxInt248 = 2n ** (248n - 1n) - 1n),
      (D.maxInt256 = 2n ** (256n - 1n) - 1n),
      (D.minInt8 = -(2n ** (8n - 1n))),
      (D.minInt16 = -(2n ** (16n - 1n))),
      (D.minInt24 = -(2n ** (24n - 1n))),
      (D.minInt32 = -(2n ** (32n - 1n))),
      (D.minInt40 = -(2n ** (40n - 1n))),
      (D.minInt48 = -(2n ** (48n - 1n))),
      (D.minInt56 = -(2n ** (56n - 1n))),
      (D.minInt64 = -(2n ** (64n - 1n))),
      (D.minInt72 = -(2n ** (72n - 1n))),
      (D.minInt80 = -(2n ** (80n - 1n))),
      (D.minInt88 = -(2n ** (88n - 1n))),
      (D.minInt96 = -(2n ** (96n - 1n))),
      (D.minInt104 = -(2n ** (104n - 1n))),
      (D.minInt112 = -(2n ** (112n - 1n))),
      (D.minInt120 = -(2n ** (120n - 1n))),
      (D.minInt128 = -(2n ** (128n - 1n))),
      (D.minInt136 = -(2n ** (136n - 1n))),
      (D.minInt144 = -(2n ** (144n - 1n))),
      (D.minInt152 = -(2n ** (152n - 1n))),
      (D.minInt160 = -(2n ** (160n - 1n))),
      (D.minInt168 = -(2n ** (168n - 1n))),
      (D.minInt176 = -(2n ** (176n - 1n))),
      (D.minInt184 = -(2n ** (184n - 1n))),
      (D.minInt192 = -(2n ** (192n - 1n))),
      (D.minInt200 = -(2n ** (200n - 1n))),
      (D.minInt208 = -(2n ** (208n - 1n))),
      (D.minInt216 = -(2n ** (216n - 1n))),
      (D.minInt224 = -(2n ** (224n - 1n))),
      (D.minInt232 = -(2n ** (232n - 1n))),
      (D.minInt240 = -(2n ** (240n - 1n))),
      (D.minInt248 = -(2n ** (248n - 1n))),
      (D.minInt256 = -(2n ** (256n - 1n))),
      (D.maxUint8 = 2n ** 8n - 1n),
      (D.maxUint16 = 2n ** 16n - 1n),
      (D.maxUint24 = 2n ** 24n - 1n),
      (D.maxUint32 = 2n ** 32n - 1n),
      (D.maxUint40 = 2n ** 40n - 1n),
      (D.maxUint48 = 2n ** 48n - 1n),
      (D.maxUint56 = 2n ** 56n - 1n),
      (D.maxUint64 = 2n ** 64n - 1n),
      (D.maxUint72 = 2n ** 72n - 1n),
      (D.maxUint80 = 2n ** 80n - 1n),
      (D.maxUint88 = 2n ** 88n - 1n),
      (D.maxUint96 = 2n ** 96n - 1n),
      (D.maxUint104 = 2n ** 104n - 1n),
      (D.maxUint112 = 2n ** 112n - 1n),
      (D.maxUint120 = 2n ** 120n - 1n),
      (D.maxUint128 = 2n ** 128n - 1n),
      (D.maxUint136 = 2n ** 136n - 1n),
      (D.maxUint144 = 2n ** 144n - 1n),
      (D.maxUint152 = 2n ** 152n - 1n),
      (D.maxUint160 = 2n ** 160n - 1n),
      (D.maxUint168 = 2n ** 168n - 1n),
      (D.maxUint176 = 2n ** 176n - 1n),
      (D.maxUint184 = 2n ** 184n - 1n),
      (D.maxUint192 = 2n ** 192n - 1n),
      (D.maxUint200 = 2n ** 200n - 1n),
      (D.maxUint208 = 2n ** 208n - 1n),
      (D.maxUint216 = 2n ** 216n - 1n),
      (D.maxUint224 = 2n ** 224n - 1n),
      (D.maxUint232 = 2n ** 232n - 1n),
      (D.maxUint240 = 2n ** 240n - 1n),
      (D.maxUint248 = 2n ** 248n - 1n),
      (D.maxUint256 = 2n ** 256n - 1n)),
    D
  );
}
var _1;
function wt() {
  if (_1) return Xi;
  ((_1 = 1), Object.defineProperty(Xi, "__esModule", { value: !0 }), (Xi.assertRequest = s));
  const e = Ie(),
    r = af(),
    n = _t(),
    t = Zt(),
    o = et();
  function s(i) {
    const { account: a, maxFeePerGas: c, maxPriorityFeePerGas: u, to: l } = i,
      f = a ? (0, e.parseAccount)(a) : void 0;
    if (f && !(0, o.isAddress)(f.address)) throw new n.InvalidAddressError({ address: f.address });
    if (l && !(0, o.isAddress)(l)) throw new n.InvalidAddressError({ address: l });
    if (c && c > r.maxUint256) throw new t.FeeCapTooHighError({ maxFeePerGas: c });
    if (u && c && u > c) throw new t.TipAboveFeeCapError({ maxFeePerGas: c, maxPriorityFeePerGas: u });
  }
  return Xi;
}
var Rd = {},
  oo = {},
  Lt = {},
  v1;
function zo() {
  if (v1) return Lt;
  ((v1 = 1),
    Object.defineProperty(Lt, "__esModule", { value: !0 }),
    (Lt.MaxFeePerGasTooLowError = Lt.Eip1559FeesNotSupportedError = Lt.BaseFeeScalarError = void 0));
  const e = Ur(),
    r = ue();
  class n extends r.BaseError {
    constructor() {
      super("`baseFeeMultiplier` must be greater than 1.", { name: "BaseFeeScalarError" });
    }
  }
  Lt.BaseFeeScalarError = n;
  class t extends r.BaseError {
    constructor() {
      super("Chain does not support EIP-1559 fees.", { name: "Eip1559FeesNotSupportedError" });
    }
  }
  Lt.Eip1559FeesNotSupportedError = t;
  class o extends r.BaseError {
    constructor({ maxPriorityFeePerGas: i }) {
      super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${(0, e.formatGwei)(i)} gwei).`, {
        name: "MaxFeePerGasTooLowError",
      });
    }
  }
  return ((Lt.MaxFeePerGasTooLowError = o), Lt);
}
var io = {},
  Qi = {},
  ao = {},
  E1;
function sf() {
  if (E1) return ao;
  ((E1 = 1), Object.defineProperty(ao, "__esModule", { value: !0 }), (ao.BlockNotFoundError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ blockHash: t, blockNumber: o }) {
      let s = "Block";
      (t && (s = `Block at hash "${t}"`),
        o && (s = `Block at number "${o}"`),
        super(`${s} could not be found.`, { name: "BlockNotFoundError" }));
    }
  }
  return ((ao.BlockNotFoundError = r), ao);
}
var on = {},
  Bd = {},
  j1;
function En() {
  return (
    j1 ||
      ((j1 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.defineTransaction = e.transactionType = void 0),
          (e.formatTransaction = t));
        const r = Be(),
          n = $o();
        e.transactionType = { "0x0": "legacy", "0x1": "eip2930", "0x2": "eip1559", "0x3": "eip4844", "0x4": "eip7702" };
        function t(s, i) {
          const a = {
            ...s,
            blockHash: s.blockHash ? s.blockHash : null,
            blockNumber: s.blockNumber ? BigInt(s.blockNumber) : null,
            ...(s.blockTimestamp != null && { blockTimestamp: BigInt(s.blockTimestamp) }),
            chainId: s.chainId ? (0, r.hexToNumber)(s.chainId) : void 0,
            gas: s.gas ? BigInt(s.gas) : void 0,
            gasPrice: s.gasPrice ? BigInt(s.gasPrice) : void 0,
            maxFeePerBlobGas: s.maxFeePerBlobGas ? BigInt(s.maxFeePerBlobGas) : void 0,
            maxFeePerGas: s.maxFeePerGas ? BigInt(s.maxFeePerGas) : void 0,
            maxPriorityFeePerGas: s.maxPriorityFeePerGas ? BigInt(s.maxPriorityFeePerGas) : void 0,
            nonce: s.nonce ? (0, r.hexToNumber)(s.nonce) : void 0,
            to: s.to ? s.to : null,
            transactionIndex: s.transactionIndex ? Number(s.transactionIndex) : null,
            type: s.type ? e.transactionType[s.type] : void 0,
            typeHex: s.type ? s.type : void 0,
            value: s.value ? BigInt(s.value) : void 0,
            v: s.v ? BigInt(s.v) : void 0,
          };
          return (
            s.authorizationList && (a.authorizationList = o(s.authorizationList)),
            (a.yParity = (() => {
              if (s.yParity) return Number(s.yParity);
              if (typeof a.v == "bigint") {
                if (a.v === 0n || a.v === 27n) return 0;
                if (a.v === 1n || a.v === 28n) return 1;
                if (a.v >= 35n) return a.v % 2n === 0n ? 1 : 0;
              }
            })()),
            a.type === "legacy" &&
              (delete a.accessList,
              delete a.maxFeePerBlobGas,
              delete a.maxFeePerGas,
              delete a.maxPriorityFeePerGas,
              delete a.yParity),
            a.type === "eip2930" && (delete a.maxFeePerBlobGas, delete a.maxFeePerGas, delete a.maxPriorityFeePerGas),
            a.type === "eip1559" && delete a.maxFeePerBlobGas,
            a
          );
        }
        e.defineTransaction = (0, n.defineFormatter)("transaction", t);
        function o(s) {
          return s.map((i) => ({
            address: i.address,
            chainId: Number(i.chainId),
            nonce: Number(i.nonce),
            r: i.r,
            s: i.s,
            yParity: Number(i.yParity),
          }));
        }
      })(Bd)),
    Bd
  );
}
var w1;
function qu() {
  if (w1) return on;
  ((w1 = 1), Object.defineProperty(on, "__esModule", { value: !0 }), (on.defineBlock = void 0), (on.formatBlock = n));
  const e = $o(),
    r = En();
  function n(t, o) {
    const s = (t.transactions ?? []).map((i) => (typeof i == "string" ? i : (0, r.formatTransaction)(i)));
    return {
      ...t,
      baseFeePerGas: t.baseFeePerGas ? BigInt(t.baseFeePerGas) : null,
      blobGasUsed: t.blobGasUsed ? BigInt(t.blobGasUsed) : void 0,
      difficulty: t.difficulty ? BigInt(t.difficulty) : void 0,
      excessBlobGas: t.excessBlobGas ? BigInt(t.excessBlobGas) : void 0,
      gasLimit: t.gasLimit ? BigInt(t.gasLimit) : void 0,
      gasUsed: t.gasUsed ? BigInt(t.gasUsed) : void 0,
      hash: t.hash ? t.hash : null,
      logsBloom: t.logsBloom ? t.logsBloom : null,
      nonce: t.nonce ? t.nonce : null,
      number: t.number ? BigInt(t.number) : null,
      size: t.size ? BigInt(t.size) : void 0,
      timestamp: t.timestamp ? BigInt(t.timestamp) : void 0,
      transactions: s,
      totalDifficulty: t.totalDifficulty ? BigInt(t.totalDifficulty) : null,
    };
  }
  return ((on.defineBlock = (0, e.defineFormatter)("block", n)), on);
}
var P1;
function Gr() {
  if (P1) return Qi;
  ((P1 = 1), Object.defineProperty(Qi, "__esModule", { value: !0 }), (Qi.getBlock = t));
  const e = sf(),
    r = te(),
    n = qu();
  async function t(
    o,
    { blockHash: s, blockNumber: i, blockTag: a = o.experimental_blockTag ?? "latest", includeTransactions: c } = {},
  ) {
    var g, h, b;
    const u = c ?? !1,
      l = i !== void 0 ? (0, r.numberToHex)(i) : void 0;
    let f = null;
    if (
      (s
        ? (f = await o.request({ method: "eth_getBlockByHash", params: [s, u] }, { dedupe: !0 }))
        : (f = await o.request({ method: "eth_getBlockByNumber", params: [l || a, u] }, { dedupe: !!l })),
      !f)
    )
      throw new e.BlockNotFoundError({ blockHash: s, blockNumber: i });
    return (
      ((b = (h = (g = o.chain) == null ? void 0 : g.formatters) == null ? void 0 : h.block) == null
        ? void 0
        : b.format) || n.formatBlock
    )(f, "getBlock");
  }
  return Qi;
}
var ea = {},
  A1;
function cf() {
  if (A1) return ea;
  ((A1 = 1), Object.defineProperty(ea, "__esModule", { value: !0 }), (ea.getGasPrice = e));
  async function e(r) {
    const n = await r.request({ method: "eth_gasPrice" });
    return BigInt(n);
  }
  return ea;
}
var T1;
function lg() {
  if (T1) return io;
  ((T1 = 1),
    Object.defineProperty(io, "__esModule", { value: !0 }),
    (io.estimateMaxPriorityFeePerGas = s),
    (io.internal_estimateMaxPriorityFeePerGas = i));
  const e = zo(),
    r = Be(),
    n = me(),
    t = Gr(),
    o = cf();
  async function s(a, c) {
    return i(a, c);
  }
  async function i(a, c) {
    var m, g;
    const { block: u, chain: l = a.chain, request: f } = c || {};
    try {
      const h =
        ((m = l == null ? void 0 : l.fees) == null ? void 0 : m.maxPriorityFeePerGas) ??
        ((g = l == null ? void 0 : l.fees) == null ? void 0 : g.defaultPriorityFee);
      if (typeof h == "function") {
        const v = u || (await (0, n.getAction)(a, t.getBlock, "getBlock")({})),
          _ = await h({ block: v, client: a, request: f });
        if (_ === null) throw new Error();
        return _;
      }
      if (typeof h < "u") return h;
      const b = await a.request({ method: "eth_maxPriorityFeePerGas" });
      return (0, r.hexToBigInt)(b);
    } catch {
      const [h, b] = await Promise.all([
        u ? Promise.resolve(u) : (0, n.getAction)(a, t.getBlock, "getBlock")({}),
        (0, n.getAction)(a, o.getGasPrice, "getGasPrice")({}),
      ]);
      if (typeof h.baseFeePerGas != "bigint") throw new e.Eip1559FeesNotSupportedError();
      const v = b - h.baseFeePerGas;
      return v < 0n ? 0n : v;
    }
  }
  return io;
}
var S1;
function bg() {
  if (S1) return oo;
  ((S1 = 1),
    Object.defineProperty(oo, "__esModule", { value: !0 }),
    (oo.estimateFeesPerGas = s),
    (oo.internal_estimateFeesPerGas = i));
  const e = zo(),
    r = me(),
    n = lg(),
    t = Gr(),
    o = cf();
  async function s(a, c) {
    return i(a, c);
  }
  async function i(a, c) {
    var P, d;
    const { block: u, chain: l = a.chain, request: f, type: m = "eip1559" } = c || {},
      g = await (async () => {
        var j, p;
        return typeof ((j = l == null ? void 0 : l.fees) == null ? void 0 : j.baseFeeMultiplier) == "function"
          ? l.fees.baseFeeMultiplier({ block: u, client: a, request: f })
          : (((p = l == null ? void 0 : l.fees) == null ? void 0 : p.baseFeeMultiplier) ?? 1.2);
      })();
    if (g < 1) throw new e.BaseFeeScalarError();
    const b = 10 ** (((P = g.toString().split(".")[1]) == null ? void 0 : P.length) ?? 0),
      v = (j) => (j * BigInt(Math.ceil(g * b))) / BigInt(b),
      _ = u || (await (0, r.getAction)(a, t.getBlock, "getBlock")({}));
    if (typeof ((d = l == null ? void 0 : l.fees) == null ? void 0 : d.estimateFeesPerGas) == "function") {
      const j = await l.fees.estimateFeesPerGas({ block: u, client: a, multiply: v, request: f, type: m });
      if (j !== null) return j;
    }
    if (m === "eip1559") {
      if (typeof _.baseFeePerGas != "bigint") throw new e.Eip1559FeesNotSupportedError();
      const j =
          typeof (f == null ? void 0 : f.maxPriorityFeePerGas) == "bigint"
            ? f.maxPriorityFeePerGas
            : await (0, n.internal_estimateMaxPriorityFeePerGas)(a, { block: _, chain: l, request: f }),
        p = v(_.baseFeePerGas);
      return { maxFeePerGas: (f == null ? void 0 : f.maxFeePerGas) ?? p + j, maxPriorityFeePerGas: j };
    }
    return {
      gasPrice: (f == null ? void 0 : f.gasPrice) ?? v(await (0, r.getAction)(a, o.getGasPrice, "getGasPrice")({})),
    };
  }
  return oo;
}
var ta = {},
  I1;
function Mu() {
  if (I1) return ta;
  ((I1 = 1), Object.defineProperty(ta, "__esModule", { value: !0 }), (ta.getTransactionCount = n));
  const e = Be(),
    r = te();
  async function n(t, { address: o, blockTag: s = "latest", blockNumber: i }) {
    const a = await t.request(
      { method: "eth_getTransactionCount", params: [o, typeof i == "bigint" ? (0, r.numberToHex)(i) : s] },
      { dedupe: !!i },
    );
    return (0, e.hexToNumber)(a);
  }
  return ta;
}
var ra = {},
  R1;
function Hu() {
  if (R1) return ra;
  ((R1 = 1), Object.defineProperty(ra, "__esModule", { value: !0 }), (ra.blobsToCommitments = n));
  const e = ve(),
    r = te();
  function n(t) {
    const { kzg: o } = t,
      s = t.to ?? (typeof t.blobs[0] == "string" ? "hex" : "bytes"),
      i = typeof t.blobs[0] == "string" ? t.blobs.map((c) => (0, e.hexToBytes)(c)) : t.blobs,
      a = [];
    for (const c of i) a.push(Uint8Array.from(o.blobToKzgCommitment(c)));
    return s === "bytes" ? a : a.map((c) => (0, r.bytesToHex)(c));
  }
  return ra;
}
var na = {},
  B1;
function ku() {
  if (B1) return na;
  ((B1 = 1), Object.defineProperty(na, "__esModule", { value: !0 }), (na.blobsToProofs = n));
  const e = ve(),
    r = te();
  function n(t) {
    const { kzg: o } = t,
      s = t.to ?? (typeof t.blobs[0] == "string" ? "hex" : "bytes"),
      i = typeof t.blobs[0] == "string" ? t.blobs.map((u) => (0, e.hexToBytes)(u)) : t.blobs,
      a = typeof t.commitments[0] == "string" ? t.commitments.map((u) => (0, e.hexToBytes)(u)) : t.commitments,
      c = [];
    for (let u = 0; u < i.length; u++) {
      const l = i[u],
        f = a[u];
      c.push(Uint8Array.from(o.computeBlobKzgProof(l, f)));
    }
    return s === "bytes" ? c : c.map((u) => (0, r.bytesToHex)(u));
  }
  return na;
}
var oa = {},
  ia = {},
  aa = {},
  mt = {},
  O1;
function mg() {
  if (O1) return mt;
  ((O1 = 1),
    Object.defineProperty(mt, "__esModule", { value: !0 }),
    (mt.sha224 = mt.SHA224 = mt.sha256 = mt.SHA256 = void 0));
  const e = ag();
  return ((mt.SHA256 = e.SHA256), (mt.sha256 = e.sha256), (mt.SHA224 = e.SHA224), (mt.sha224 = e.sha224), mt);
}
var x1;
function uf() {
  if (x1) return aa;
  ((x1 = 1), Object.defineProperty(aa, "__esModule", { value: !0 }), (aa.sha256 = o));
  const e = mg(),
    r = Ge(),
    n = ve(),
    t = te();
  function o(s, i) {
    const a = i || "hex",
      c = (0, e.sha256)((0, r.isHex)(s, { strict: !1 }) ? (0, n.toBytes)(s) : s);
    return a === "bytes" ? c : (0, t.toHex)(c);
  }
  return aa;
}
var C1;
function df() {
  if (C1) return ia;
  ((C1 = 1), Object.defineProperty(ia, "__esModule", { value: !0 }), (ia.commitmentToVersionedHash = n));
  const e = te(),
    r = uf();
  function n(t) {
    const { commitment: o, version: s = 1 } = t,
      i = t.to ?? (typeof o == "string" ? "hex" : "bytes"),
      a = (0, r.sha256)(o, "bytes");
    return (a.set([s], 0), i === "bytes" ? a : (0, e.bytesToHex)(a));
  }
  return ia;
}
var q1;
function ff() {
  if (q1) return oa;
  ((q1 = 1), Object.defineProperty(oa, "__esModule", { value: !0 }), (oa.commitmentsToVersionedHashes = r));
  const e = df();
  function r(n) {
    const { commitments: t, version: o } = n,
      s = n.to ?? (typeof t[0] == "string" ? "hex" : "bytes"),
      i = [];
    for (const a of t) i.push((0, e.commitmentToVersionedHash)({ commitment: a, to: s, version: o }));
    return i;
  }
  return oa;
}
var sa = {},
  ca = {},
  Od = {},
  M1;
function Dv() {
  return (
    M1 ||
      ((M1 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.maxBytesPerTransaction = e.bytesPerBlob = e.fieldElementsPerBlob = e.bytesPerFieldElement = void 0));
        const r = 6;
        ((e.bytesPerFieldElement = 32),
          (e.fieldElementsPerBlob = 4096),
          (e.bytesPerBlob = e.bytesPerFieldElement * e.fieldElementsPerBlob),
          (e.maxBytesPerTransaction = e.bytesPerBlob * r - 1 - 1 * e.fieldElementsPerBlob * r));
      })(Od)),
    Od
  );
}
var ht = {},
  so = {},
  H1;
function hg() {
  return (
    H1 ||
      ((H1 = 1),
      Object.defineProperty(so, "__esModule", { value: !0 }),
      (so.versionedHashVersionKzg = void 0),
      (so.versionedHashVersionKzg = 1)),
    so
  );
}
var k1;
function yg() {
  if (k1) return ht;
  ((k1 = 1),
    Object.defineProperty(ht, "__esModule", { value: !0 }),
    (ht.InvalidVersionedHashVersionError =
      ht.InvalidVersionedHashSizeError =
      ht.EmptyBlobError =
      ht.BlobSizeTooLargeError =
        void 0));
  const e = hg(),
    r = ue();
  class n extends r.BaseError {
    constructor({ maxSize: a, size: c }) {
      super("Blob size is too large.", {
        metaMessages: [`Max: ${a} bytes`, `Given: ${c} bytes`],
        name: "BlobSizeTooLargeError",
      });
    }
  }
  ht.BlobSizeTooLargeError = n;
  class t extends r.BaseError {
    constructor() {
      super("Blob data must not be empty.", { name: "EmptyBlobError" });
    }
  }
  ht.EmptyBlobError = t;
  class o extends r.BaseError {
    constructor({ hash: a, size: c }) {
      super(`Versioned hash "${a}" size is invalid.`, {
        metaMessages: ["Expected: 32", `Received: ${c}`],
        name: "InvalidVersionedHashSizeError",
      });
    }
  }
  ht.InvalidVersionedHashSizeError = o;
  class s extends r.BaseError {
    constructor({ hash: a, version: c }) {
      super(`Versioned hash "${a}" version is invalid.`, {
        metaMessages: [`Expected: ${e.versionedHashVersionKzg}`, `Received: ${c}`],
        name: "InvalidVersionedHashVersionError",
      });
    }
  }
  return ((ht.InvalidVersionedHashVersionError = s), ht);
}
var F1;
function pg() {
  if (F1) return ca;
  ((F1 = 1), Object.defineProperty(ca, "__esModule", { value: !0 }), (ca.toBlobs = i));
  const e = Dv(),
    r = yg(),
    n = qo(),
    t = Ve(),
    o = ve(),
    s = te();
  function i(a) {
    const c = a.to ?? (typeof a.data == "string" ? "hex" : "bytes"),
      u = typeof a.data == "string" ? (0, o.hexToBytes)(a.data) : a.data,
      l = (0, t.size)(u);
    if (!l) throw new r.EmptyBlobError();
    if (l > e.maxBytesPerTransaction) throw new r.BlobSizeTooLargeError({ maxSize: e.maxBytesPerTransaction, size: l });
    const f = [];
    let m = !0,
      g = 0;
    for (; m; ) {
      const h = (0, n.createCursor)(new Uint8Array(e.bytesPerBlob));
      let b = 0;
      for (; b < e.fieldElementsPerBlob; ) {
        const v = u.slice(g, g + (e.bytesPerFieldElement - 1));
        if ((h.pushByte(0), h.pushBytes(v), v.length < 31)) {
          (h.pushByte(128), (m = !1));
          break;
        }
        (b++, (g += 31));
      }
      f.push(h);
    }
    return c === "bytes" ? f.map((h) => h.bytes) : f.map((h) => (0, s.bytesToHex)(h.bytes));
  }
  return ca;
}
var N1;
function Fu() {
  if (N1) return sa;
  ((N1 = 1), Object.defineProperty(sa, "__esModule", { value: !0 }), (sa.toBlobSidecars = t));
  const e = Hu(),
    r = ku(),
    n = pg();
  function t(o) {
    const { data: s, kzg: i, to: a } = o,
      c = o.blobs ?? (0, n.toBlobs)({ data: s, to: a }),
      u = o.commitments ?? (0, e.blobsToCommitments)({ blobs: c, kzg: i, to: a }),
      l = o.proofs ?? (0, r.blobsToProofs)({ blobs: c, commitments: u, kzg: i, to: a }),
      f = [];
    for (let m = 0; m < c.length; m++) f.push({ blob: c[m], commitment: u[m], proof: l[m] });
    return f;
  }
  return sa;
}
var ua = {},
  $1;
function Nu() {
  if ($1) return ua;
  (($1 = 1), Object.defineProperty(ua, "__esModule", { value: !0 }), (ua.getTransactionType = r));
  const e = tt();
  function r(n) {
    if (n.type) return n.type;
    if (typeof n.authorizationList < "u") return "eip7702";
    if (
      typeof n.blobs < "u" ||
      typeof n.blobVersionedHashes < "u" ||
      typeof n.maxFeePerBlobGas < "u" ||
      typeof n.sidecars < "u"
    )
      return "eip4844";
    if (typeof n.maxFeePerGas < "u" || typeof n.maxPriorityFeePerGas < "u") return "eip1559";
    if (typeof n.gasPrice < "u") return typeof n.accessList < "u" ? "eip2930" : "legacy";
    throw new e.InvalidSerializableTransactionError({ transaction: n });
  }
  return ua;
}
var da = {},
  fa = {},
  z1;
function Uo() {
  if (z1) return fa;
  ((z1 = 1), Object.defineProperty(fa, "__esModule", { value: !0 }), (fa.getTransactionError = t));
  const e = Zt(),
    r = tt(),
    n = No();
  function t(o, { docsPath: s, ...i }) {
    const a = (() => {
      const c = (0, n.getNodeError)(o, i);
      return c instanceof e.UnknownNodeError ? o : c;
    })();
    return new r.TransactionExecutionError(a, { docsPath: s, ...i });
  }
  return fa;
}
var la = {},
  U1;
function mr() {
  if (U1) return la;
  ((U1 = 1), Object.defineProperty(la, "__esModule", { value: !0 }), (la.getChainId = r));
  const e = Be();
  async function r(n) {
    const t = await n.request({ method: "eth_chainId" }, { dedupe: !0 });
    return (0, e.hexToNumber)(t);
  }
  return la;
}
var L1;
function lf() {
  if (L1) return da;
  ((L1 = 1), Object.defineProperty(da, "__esModule", { value: !0 }), (da.fillTransaction = l));
  const e = Ie(),
    r = zo(),
    n = Uo(),
    t = br(),
    o = En(),
    s = jt(),
    i = me(),
    a = wt(),
    c = Gr(),
    u = mr();
  async function l(f, m) {
    var O, C, q, M, N;
    const {
        account: g = f.account,
        accessList: h,
        authorizationList: b,
        chain: v = f.chain,
        blobVersionedHashes: _,
        blobs: E,
        data: P,
        gas: d,
        gasPrice: j,
        maxFeePerBlobGas: p,
        maxFeePerGas: y,
        maxPriorityFeePerGas: I,
        nonce: w,
        nonceManager: A,
        to: B,
        type: R,
        value: S,
        ...x
      } = m,
      F = await (async () => {
        if (!g || !A || typeof w < "u") return w;
        const z = (0, e.parseAccount)(g),
          $ = v ? v.id : await (0, i.getAction)(f, u.getChainId, "getChainId")({});
        return await A.consume({ address: z.address, chainId: $, client: f });
      })();
    (0, a.assertRequest)(m);
    const H =
        (C = (O = v == null ? void 0 : v.formatters) == null ? void 0 : O.transactionRequest) == null
          ? void 0
          : C.format,
      k = (H || s.formatTransactionRequest)(
        {
          ...(0, t.extract)(x, { format: H }),
          account: g ? (0, e.parseAccount)(g) : void 0,
          accessList: h,
          authorizationList: b,
          blobs: E,
          blobVersionedHashes: _,
          data: P,
          gas: d,
          gasPrice: j,
          maxFeePerBlobGas: p,
          maxFeePerGas: y,
          maxPriorityFeePerGas: I,
          nonce: F,
          to: B,
          type: R,
          value: S,
        },
        "fillTransaction",
      );
    try {
      const z = await f.request({ method: "eth_fillTransaction", params: [k] }),
        U = (
          ((M = (q = v == null ? void 0 : v.formatters) == null ? void 0 : q.transaction) == null
            ? void 0
            : M.format) || o.formatTransaction
        )(z.tx);
      (delete U.blockHash,
        delete U.blockNumber,
        delete U.r,
        delete U.s,
        delete U.transactionIndex,
        delete U.v,
        delete U.yParity,
        (U.data = U.input),
        U.gas && (U.gas = m.gas ?? U.gas),
        U.gasPrice && (U.gasPrice = m.gasPrice ?? U.gasPrice),
        U.maxFeePerBlobGas && (U.maxFeePerBlobGas = m.maxFeePerBlobGas ?? U.maxFeePerBlobGas),
        U.maxFeePerGas && (U.maxFeePerGas = m.maxFeePerGas ?? U.maxFeePerGas),
        U.maxPriorityFeePerGas && (U.maxPriorityFeePerGas = m.maxPriorityFeePerGas ?? U.maxPriorityFeePerGas),
        typeof U.nonce < "u" && (U.nonce = m.nonce ?? U.nonce));
      const G = await (async () => {
        var Y, re;
        if (typeof ((Y = v == null ? void 0 : v.fees) == null ? void 0 : Y.baseFeeMultiplier) == "function") {
          const J = await (0, i.getAction)(f, c.getBlock, "getBlock")({});
          return v.fees.baseFeeMultiplier({ block: J, client: f, request: m });
        }
        return ((re = v == null ? void 0 : v.fees) == null ? void 0 : re.baseFeeMultiplier) ?? 1.2;
      })();
      if (G < 1) throw new r.BaseFeeScalarError();
      const K = 10 ** (((N = G.toString().split(".")[1]) == null ? void 0 : N.length) ?? 0),
        V = (Y) => (Y * BigInt(Math.ceil(G * K))) / BigInt(K);
      return (
        U.feePayerSignature ||
          (U.maxFeePerGas && !m.maxFeePerGas && (U.maxFeePerGas = V(U.maxFeePerGas)),
          U.gasPrice && !m.gasPrice && (U.gasPrice = V(U.gasPrice))),
        { raw: z.raw, transaction: { from: k.from, ...U }, ...(z.capabilities ? { capabilities: z.capabilities } : {}) }
      );
    } catch (z) {
      throw (0, n.getTransactionError)(z, { ...m, chain: f.chain });
    }
  }
  return da;
}
var D1;
function Lo() {
  return (
    D1 ||
      ((D1 = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.supportsFillTransaction = e.eip1559NetworkCache = e.defaultParameters = void 0),
          (e.prepareTransactionRequest = _));
        const r = Ie(),
          n = bg(),
          t = bf(),
          o = Gr(),
          s = Mu(),
          i = zo(),
          a = Hu(),
          c = ku(),
          u = ff(),
          l = Fu(),
          f = me(),
          m = Nr(),
          g = wt(),
          h = Nu(),
          b = lf(),
          v = mr();
        ((e.defaultParameters = ["blobVersionedHashes", "chainId", "fees", "gas", "nonce", "type"]),
          (e.eip1559NetworkCache = new Map()),
          (e.supportsFillTransaction = new m.LruMap(128)));
        async function _(E, P) {
          var M, N, z;
          let d = P;
          (d.account ?? (d.account = E.account), d.parameters ?? (d.parameters = e.defaultParameters));
          const { account: j, chain: p = E.chain, nonceManager: y, parameters: I } = d,
            w = (() => {
              if (typeof (p == null ? void 0 : p.prepareTransactionRequest) == "function")
                return { fn: p.prepareTransactionRequest, runAt: ["beforeFillTransaction"] };
              if (Array.isArray(p == null ? void 0 : p.prepareTransactionRequest))
                return { fn: p.prepareTransactionRequest[0], runAt: p.prepareTransactionRequest[1].runAt };
            })();
          let A;
          async function B() {
            return (
              A ||
              (typeof d.chainId < "u"
                ? d.chainId
                : p
                  ? p.id
                  : ((A = await (0, f.getAction)(E, v.getChainId, "getChainId")({})), A))
            );
          }
          const R = j && (0, r.parseAccount)(j);
          let S = d.nonce;
          if (I.includes("nonce") && typeof S > "u" && R && y) {
            const $ = await B();
            S = await y.consume({ address: R.address, chainId: $, client: E });
          }
          w != null &&
            w.fn &&
            (M = w.runAt) != null &&
            M.includes("beforeFillTransaction") &&
            ((d = await w.fn({ ...d, chain: p }, { phase: "beforeFillTransaction" })), S ?? (S = d.nonce));
          const F = (
            ((I.includes("blobVersionedHashes") || I.includes("sidecars")) && d.kzg && d.blobs) ||
            e.supportsFillTransaction.get(E.uid) === !1 ||
            !["fees", "gas"].some((U) => I.includes(U))
              ? !1
              : !!(
                  (I.includes("chainId") && typeof d.chainId != "number") ||
                  (I.includes("nonce") && typeof S != "number") ||
                  (I.includes("fees") &&
                    typeof d.gasPrice != "bigint" &&
                    (typeof d.maxFeePerGas != "bigint" || typeof d.maxPriorityFeePerGas != "bigint")) ||
                  (I.includes("gas") && typeof d.gas != "bigint")
                )
          )
            ? await (0, f.getAction)(
                E,
                b.fillTransaction,
                "fillTransaction",
              )({ ...d, nonce: S })
                .then(($) => {
                  const {
                    chainId: U,
                    from: G,
                    gas: Z,
                    gasPrice: K,
                    nonce: V,
                    maxFeePerBlobGas: Y,
                    maxFeePerGas: re,
                    maxPriorityFeePerGas: J,
                    type: X,
                    ...Q
                  } = $.transaction;
                  return (
                    e.supportsFillTransaction.set(E.uid, !0),
                    {
                      ...d,
                      ...(G ? { from: G } : {}),
                      ...(X && !d.type ? { type: X } : {}),
                      ...(typeof U < "u" ? { chainId: U } : {}),
                      ...(typeof Z < "u" ? { gas: Z } : {}),
                      ...(typeof K < "u" ? { gasPrice: K } : {}),
                      ...(typeof V < "u" ? { nonce: V } : {}),
                      ...(typeof Y < "u" && d.type !== "legacy" && d.type !== "eip2930" ? { maxFeePerBlobGas: Y } : {}),
                      ...(typeof re < "u" && d.type !== "legacy" && d.type !== "eip2930" ? { maxFeePerGas: re } : {}),
                      ...(typeof J < "u" && d.type !== "legacy" && d.type !== "eip2930"
                        ? { maxPriorityFeePerGas: J }
                        : {}),
                      ...("nonceKey" in Q && typeof Q.nonceKey < "u" ? { nonceKey: Q.nonceKey } : {}),
                      ...("keyAuthorization" in Q &&
                      typeof Q.keyAuthorization < "u" &&
                      Q.keyAuthorization !== null &&
                      !("keyAuthorization" in d)
                        ? { keyAuthorization: Q.keyAuthorization }
                        : {}),
                      ...("feePayerSignature" in Q && typeof Q.feePayerSignature < "u" && Q.feePayerSignature !== null
                        ? { feePayerSignature: Q.feePayerSignature }
                        : {}),
                      ...("feeToken" in Q && typeof Q.feeToken < "u" && Q.feeToken !== null && !("feeToken" in d)
                        ? { feeToken: Q.feeToken }
                        : {}),
                      ...($.capabilities ? { _capabilities: $.capabilities } : {}),
                    }
                  );
                })
                .catch(($) => {
                  var K, V;
                  const U = $;
                  if (U.name !== "TransactionExecutionError") return d;
                  if ((K = U.walk) == null ? void 0 : K.call(U, (Y) => Y.name === "ExecutionRevertedError")) throw $;
                  return (
                    ((V = U.walk) == null
                      ? void 0
                      : V.call(U, (Y) => {
                          var J;
                          const re = Y;
                          return (
                            re.name === "MethodNotFoundRpcError" ||
                            re.name === "MethodNotSupportedRpcError" ||
                            ((J = re.message) == null ? void 0 : J.includes("eth_fillTransaction is not available"))
                          );
                        })) && e.supportsFillTransaction.set(E.uid, !1),
                    d
                  );
                })
            : d;
          (S ?? (S = F.nonce),
            (d = {
              ...F,
              ...(R ? { from: R == null ? void 0 : R.address } : {}),
              ...(typeof S < "u" ? { nonce: S } : {}),
            }));
          const { blobs: H, gas: T, kzg: k, type: O } = d;
          w != null &&
            w.fn &&
            (N = w.runAt) != null &&
            N.includes("beforeFillParameters") &&
            (d = await w.fn({ ...d, chain: p }, { phase: "beforeFillParameters" }));
          let C;
          async function q() {
            return C || ((C = await (0, f.getAction)(E, o.getBlock, "getBlock")({ blockTag: "latest" })), C);
          }
          if (
            (I.includes("nonce") &&
              typeof S > "u" &&
              R &&
              !y &&
              (d.nonce = await (0, f.getAction)(
                E,
                s.getTransactionCount,
                "getTransactionCount",
              )({ address: R.address, blockTag: "pending" })),
            (I.includes("blobVersionedHashes") || I.includes("sidecars")) && H && k)
          ) {
            const $ = (0, a.blobsToCommitments)({ blobs: H, kzg: k });
            if (I.includes("blobVersionedHashes")) {
              const U = (0, u.commitmentsToVersionedHashes)({ commitments: $, to: "hex" });
              d.blobVersionedHashes = U;
            }
            if (I.includes("sidecars")) {
              const U = (0, c.blobsToProofs)({ blobs: H, commitments: $, kzg: k }),
                G = (0, l.toBlobSidecars)({ blobs: H, commitments: $, proofs: U, to: "hex" });
              d.sidecars = G;
            }
          }
          if (
            (I.includes("chainId") && (d.chainId = await B()),
            (I.includes("fees") || I.includes("type")) && typeof O > "u")
          )
            try {
              d.type = (0, h.getTransactionType)(d);
            } catch {
              let $ = e.eip1559NetworkCache.get(E.uid);
              if (typeof $ > "u") {
                const U = await q();
                (($ = typeof (U == null ? void 0 : U.baseFeePerGas) == "bigint"), e.eip1559NetworkCache.set(E.uid, $));
              }
              d.type = $ ? "eip1559" : "legacy";
            }
          if (I.includes("fees"))
            if (d.type !== "legacy" && d.type !== "eip2930") {
              if (typeof d.maxFeePerGas > "u" || typeof d.maxPriorityFeePerGas > "u") {
                const $ = await q(),
                  { maxFeePerGas: U, maxPriorityFeePerGas: G } = await (0, n.internal_estimateFeesPerGas)(E, {
                    block: $,
                    chain: p,
                    request: d,
                  });
                if (typeof d.maxPriorityFeePerGas > "u" && d.maxFeePerGas && d.maxFeePerGas < G)
                  throw new i.MaxFeePerGasTooLowError({ maxPriorityFeePerGas: G });
                ((d.maxPriorityFeePerGas = G), (d.maxFeePerGas = U));
              }
            } else {
              if (typeof d.maxFeePerGas < "u" || typeof d.maxPriorityFeePerGas < "u")
                throw new i.Eip1559FeesNotSupportedError();
              if (typeof d.gasPrice > "u") {
                const $ = await q(),
                  { gasPrice: U } = await (0, n.internal_estimateFeesPerGas)(E, {
                    block: $,
                    chain: p,
                    request: d,
                    type: "legacy",
                  });
                d.gasPrice = U;
              }
            }
          return (
            I.includes("gas") &&
              typeof T > "u" &&
              (d.gas = await (0, f.getAction)(
                E,
                t.estimateGas,
                "estimateGas",
              )({
                ...d,
                account: R,
                prepare: (R == null ? void 0 : R.type) === "local" ? [] : ["blobVersionedHashes"],
              })),
            w != null &&
              w.fn &&
              (z = w.runAt) != null &&
              z.includes("afterFillParameters") &&
              (d = await w.fn({ ...d, chain: p }, { phase: "afterFillParameters" })),
            (0, g.assertRequest)(d),
            delete d.parameters,
            d
          );
        }
      })(Rd)),
    Rd
  );
}
var G1;
function bf() {
  if (G1) return Li;
  ((G1 = 1), Object.defineProperty(Li, "__esModule", { value: !0 }), (Li.estimateGas = l));
  const e = Ie(),
    r = ue(),
    n = Fo(),
    t = te(),
    o = fg(),
    s = br(),
    i = jt(),
    a = of(),
    c = wt(),
    u = Lo();
  async function l(f, m) {
    var _, E, P;
    const { account: g = f.account, prepare: h = !0 } = m,
      b = g ? (0, e.parseAccount)(g) : void 0,
      v = (() => {
        if (Array.isArray(h)) return h;
        if ((b == null ? void 0 : b.type) !== "local") return ["blobVersionedHashes"];
      })();
    try {
      const d = await (async () => {
          if (m.to) return m.to;
          if (m.authorizationList && m.authorizationList.length > 0)
            return await (0, n.recoverAuthorizationAddress)({ authorization: m.authorizationList[0] }).catch(() => {
              throw new r.BaseError("`to` is required. Could not infer from `authorizationList`");
            });
        })(),
        {
          accessList: j,
          authorizationList: p,
          blobs: y,
          blobVersionedHashes: I,
          blockNumber: w,
          blockTag: A,
          data: B,
          gas: R,
          gasPrice: S,
          maxFeePerBlobGas: x,
          maxFeePerGas: F,
          maxPriorityFeePerGas: H,
          nonce: T,
          value: k,
          stateOverride: O,
          ...C
        } = h ? await (0, u.prepareTransactionRequest)(f, { ...m, parameters: v, to: d }) : m;
      if (R && m.gas !== R) return R;
      const M = (typeof w == "bigint" ? (0, t.numberToHex)(w) : void 0) || A,
        N = (0, a.serializeStateOverride)(O);
      (0, c.assertRequest)(m);
      const z =
          (P = (E = (_ = f.chain) == null ? void 0 : _.formatters) == null ? void 0 : E.transactionRequest) == null
            ? void 0
            : P.format,
        U = (z || i.formatTransactionRequest)(
          {
            ...(0, s.extract)(C, { format: z }),
            account: b,
            accessList: j,
            authorizationList: p,
            blobs: y,
            blobVersionedHashes: I,
            data: B,
            gasPrice: S,
            maxFeePerBlobGas: x,
            maxFeePerGas: F,
            maxPriorityFeePerGas: H,
            nonce: T,
            to: d,
            value: k,
          },
          "estimateGas",
        );
      return BigInt(
        await f.request({
          method: "eth_estimateGas",
          params: N ? [U, M ?? f.experimental_blockTag ?? "latest", N] : M ? [U, M] : [U],
        }),
      );
    } catch (d) {
      throw (0, o.getEstimateGasError)(d, { ...m, account: b, chain: f.chain });
    }
  }
  return Li;
}
var V1;
function gg() {
  if (V1) return Oi;
  ((V1 = 1), Object.defineProperty(Oi, "__esModule", { value: !0 }), (Oi.estimateContractGas = s));
  const e = Ie(),
    r = We(),
    n = fr(),
    t = me(),
    o = bf();
  async function s(i, a) {
    var b;
    const {
        abi: c,
        address: u,
        args: l,
        functionName: f,
        dataSuffix: m = typeof i.dataSuffix == "string" ? i.dataSuffix : (b = i.dataSuffix) == null ? void 0 : b.value,
        ...g
      } = a,
      h = (0, r.encodeFunctionData)({ abi: c, args: l, functionName: f });
    try {
      return await (0, t.getAction)(
        i,
        o.estimateGas,
        "estimateGas",
      )({ data: `${h}${m ? m.replace("0x", "") : ""}`, to: u, ...g });
    } catch (v) {
      const _ = g.account ? (0, e.parseAccount)(g.account) : void 0;
      throw (0, n.getContractError)(v, {
        abi: c,
        address: u,
        args: l,
        docsPath: "/docs/contract/estimateContractGas",
        functionName: f,
        sender: _ == null ? void 0 : _.address,
      });
    }
  }
  return Oi;
}
var ba = {},
  ma = {},
  ha = {},
  ya = {},
  W1;
function Pt() {
  if (W1) return ya;
  ((W1 = 1), Object.defineProperty(ya, "__esModule", { value: !0 }), (ya.isAddressEqual = n));
  const e = _t(),
    r = et();
  function n(t, o) {
    if (!(0, r.isAddress)(t, { strict: !1 })) throw new e.InvalidAddressError({ address: t });
    if (!(0, r.isAddress)(o, { strict: !1 })) throw new e.InvalidAddressError({ address: o });
    return t.toLowerCase() === o.toLowerCase();
  }
  return ya;
}
var pa = {},
  K1;
function It() {
  if (K1) return pa;
  ((K1 = 1), Object.defineProperty(pa, "__esModule", { value: !0 }), (pa.formatLog = e));
  function e(r, { args: n, eventName: t } = {}) {
    return {
      ...r,
      blockHash: r.blockHash ? r.blockHash : null,
      blockNumber: r.blockNumber ? BigInt(r.blockNumber) : null,
      blockTimestamp: r.blockTimestamp ? BigInt(r.blockTimestamp) : r.blockTimestamp === null ? null : void 0,
      logIndex: r.logIndex ? Number(r.logIndex) : null,
      transactionHash: r.transactionHash ? r.transactionHash : null,
      transactionIndex: r.transactionIndex ? Number(r.transactionIndex) : null,
      ...(t ? { args: n, eventName: t } : {}),
    };
  }
  return pa;
}
var ga = {},
  Z1;
function Do() {
  if (Z1) return ga;
  ((Z1 = 1), Object.defineProperty(ga, "__esModule", { value: !0 }), (ga.decodeEventLog = a));
  const e = Se(),
    r = rg(),
    n = Ve(),
    t = vn(),
    o = cr(),
    s = Vt(),
    i = "/docs/contract/decodeEventLog";
  function a(u) {
    const { abi: l, data: f, strict: m, topics: g } = u,
      h = m ?? !0,
      [b, ...v] = g;
    if (!b) throw new e.AbiEventSignatureEmptyTopicsError({ docsPath: i });
    const _ = l.find((A) => A.type === "event" && b === (0, t.toEventSelector)((0, s.formatAbiItem)(A)));
    if (!(_ && "name" in _) || _.type !== "event") throw new e.AbiEventSignatureNotFoundError(b, { docsPath: i });
    const { name: E, inputs: P } = _,
      d = P == null ? void 0 : P.some((A) => !("name" in A && A.name)),
      j = d ? [] : {},
      p = P.map((A, B) => [A, B]).filter(([A]) => "indexed" in A && A.indexed),
      y = [];
    for (let A = 0; A < p.length; A++) {
      const [B, R] = p[A],
        S = v[A];
      if (!S) {
        if (h) throw new e.DecodeLogTopicsMismatch({ abiItem: _, param: B });
        y.push([B, R]);
        continue;
      }
      j[d ? R : B.name || R] = c({ param: B, value: S });
    }
    const I = P.filter((A) => !("indexed" in A && A.indexed)),
      w = h ? I : [...y.map(([A]) => A), ...I];
    if (w.length > 0) {
      if (f && f !== "0x")
        try {
          const A = (0, o.decodeAbiParameters)(w, f);
          if (A) {
            let B = 0;
            if (!h) for (const [R, S] of y) j[d ? S : R.name || S] = A[B++];
            if (d) for (let R = 0; R < P.length; R++) j[R] === void 0 && B < A.length && (j[R] = A[B++]);
            else for (let R = 0; R < I.length; R++) j[I[R].name] = A[B++];
          }
        } catch (A) {
          if (h)
            throw A instanceof e.AbiDecodingDataSizeTooSmallError || A instanceof r.PositionOutOfBoundsError
              ? new e.DecodeLogDataMismatch({ abiItem: _, data: f, params: w, size: (0, n.size)(f) })
              : A;
        }
      else if (h) throw new e.DecodeLogDataMismatch({ abiItem: _, data: "0x", params: w, size: 0 });
    }
    return { eventName: E, args: Object.values(j).length > 0 ? j : void 0 };
  }
  function c({ param: u, value: l }) {
    return u.type === "string" || u.type === "bytes" || u.type === "tuple" || u.type.match(/^(.*)\[(\d+)?\]$/)
      ? l
      : ((0, o.decodeAbiParameters)([u], l) || [])[0];
  }
  return ga;
}
var J1;
function Go() {
  if (J1) return ha;
  ((J1 = 1), Object.defineProperty(ha, "__esModule", { value: !0 }), (ha.parseEventLogs = i));
  const e = Pt(),
    r = ve(),
    n = It(),
    t = Xe(),
    o = vn(),
    s = Do();
  function i(c) {
    const { abi: u, args: l, logs: f, strict: m = !0 } = c,
      g = (() => {
        if (c.eventName) return Array.isArray(c.eventName) ? c.eventName : [c.eventName];
      })(),
      h = u.filter((b) => b.type === "event").map((b) => ({ abi: b, selector: (0, o.toEventSelector)(b) }));
    return f
      .map((b) => {
        var d;
        const v = typeof b.blockNumber == "string" ? (0, n.formatLog)(b) : b,
          _ = h.filter((j) => v.topics[0] === j.selector);
        if (_.length === 0) return null;
        let E, P;
        for (const j of _)
          try {
            ((E = (0, s.decodeEventLog)({ ...v, abi: [j.abi], strict: !0 })), (P = j));
            break;
          } catch {}
        if (!E && !m) {
          P = _[0];
          try {
            E = (0, s.decodeEventLog)({ data: v.data, topics: v.topics, abi: [P.abi], strict: !1 });
          } catch {
            const j = (d = P.abi.inputs) == null ? void 0 : d.some((p) => !("name" in p && p.name));
            return { ...v, args: j ? [] : {}, eventName: P.abi.name };
          }
        }
        return !E || !P || (g && !g.includes(E.eventName)) || !a({ args: E.args, inputs: P.abi.inputs, matchArgs: l })
          ? null
          : { ...E, ...v };
      })
      .filter(Boolean);
  }
  function a(c) {
    const { args: u, inputs: l, matchArgs: f } = c;
    if (!f) return !0;
    if (!u) return !1;
    function m(g, h, b) {
      try {
        return g.type === "address"
          ? (0, e.isAddressEqual)(h, b)
          : g.type === "string" || g.type === "bytes"
            ? (0, t.keccak256)((0, r.toBytes)(h)) === b
            : h === b;
      } catch {
        return !1;
      }
    }
    return Array.isArray(u) && Array.isArray(f)
      ? f.every((g, h) => {
          if (g == null) return !0;
          const b = l[h];
          return b ? (Array.isArray(g) ? g : [g]).some((_) => m(b, _, u[h])) : !1;
        })
      : typeof u == "object" && !Array.isArray(u) && typeof f == "object" && !Array.isArray(f)
        ? Object.entries(f).every(([g, h]) => {
            if (h == null) return !0;
            const b = l.find((_) => _.name === g);
            return b ? (Array.isArray(h) ? h : [h]).some((_) => m(b, _, u[g])) : !1;
          })
        : !1;
  }
  return ha;
}
var Y1;
function mf() {
  if (Y1) return ma;
  ((Y1 = 1), Object.defineProperty(ma, "__esModule", { value: !0 }), (ma.getLogs = o));
  const e = zr(),
    r = Go(),
    n = te(),
    t = It();
  async function o(
    s,
    { address: i, blockHash: a, fromBlock: c, toBlock: u, event: l, events: f, args: m, strict: g } = {},
  ) {
    const h = g ?? !1,
      b = f ?? (l ? [l] : void 0);
    let v = [];
    b &&
      ((v = [b.flatMap((d) => (0, e.encodeEventTopics)({ abi: [d], eventName: d.name, args: f ? void 0 : m }))]),
      l && (v = v[0]));
    let _;
    a
      ? (_ = await s.request({ method: "eth_getLogs", params: [{ address: i, topics: v, blockHash: a }] }))
      : (_ = await s.request({
          method: "eth_getLogs",
          params: [
            {
              address: i,
              topics: v,
              fromBlock: typeof c == "bigint" ? (0, n.numberToHex)(c) : c,
              toBlock: typeof u == "bigint" ? (0, n.numberToHex)(u) : u,
            },
          ],
        }));
    const E = _.map((P) => (0, t.formatLog)(P));
    return b ? (0, r.parseEventLogs)({ abi: b, args: m, logs: E, strict: h }) : E;
  }
  return ma;
}
var X1;
function hf() {
  if (X1) return ba;
  ((X1 = 1), Object.defineProperty(ba, "__esModule", { value: !0 }), (ba.getContractEvents = t));
  const e = Kt(),
    r = me(),
    n = mf();
  async function t(o, s) {
    const { abi: i, address: a, args: c, blockHash: u, eventName: l, fromBlock: f, toBlock: m, strict: g } = s,
      h = l ? (0, e.getAbiItem)({ abi: i, name: l }) : void 0,
      b = h ? void 0 : i.filter((v) => v.type === "event");
    return (0, r.getAction)(
      o,
      n.getLogs,
      "getLogs",
    )({ address: a, args: c, blockHash: u, event: h, events: b, fromBlock: f, toBlock: m, strict: g });
  }
  return ba;
}
var _a = {},
  va = {},
  Q1;
function Rt() {
  if (Q1) return va;
  ((Q1 = 1), Object.defineProperty(va, "__esModule", { value: !0 }), (va.decodeFunctionResult = o));
  const e = Se(),
    r = cr(),
    n = Kt(),
    t = "/docs/contract/decodeFunctionResult";
  function o(s) {
    const { abi: i, args: a, functionName: c, data: u } = s;
    let l = i[0];
    if (c) {
      const m = (0, n.getAbiItem)({ abi: i, args: a, name: c });
      if (!m) throw new e.AbiFunctionNotFoundError(c, { docsPath: t });
      l = m;
    }
    if (l.type !== "function") throw new e.AbiFunctionNotFoundError(void 0, { docsPath: t });
    if (!l.outputs) throw new e.AbiFunctionOutputsNotFoundError(l.name, { docsPath: t });
    const f = (0, r.decodeAbiParameters)(l.outputs, u);
    if (f && f.length > 1) return f;
    if (f && f.length === 1) return f[0];
  }
  return va;
}
var co = {},
  uo = {},
  fe = {},
  le = {},
  fo = {},
  an = {},
  lo = {},
  eb;
function Gv() {
  return (
    eb ||
      ((eb = 1), Object.defineProperty(lo, "__esModule", { value: !0 }), (lo.version = void 0), (lo.version = "0.1.1")),
    lo
  );
}
var tb;
function Vv() {
  if (tb) return an;
  ((tb = 1),
    Object.defineProperty(an, "__esModule", { value: !0 }),
    (an.getUrl = r),
    (an.getVersion = n),
    (an.prettyPrint = t));
  const e = Gv();
  function r(o) {
    return o;
  }
  function n() {
    return e.version;
  }
  function t(o) {
    if (!o) return "";
    const s = Object.entries(o)
        .map(([a, c]) => (c === void 0 || c === !1 ? null : [a, c]))
        .filter(Boolean),
      i = s.reduce((a, [c]) => Math.max(a, c.length), 0);
    return s.map(([a, c]) => `  ${`${a}:`.padEnd(i + 1)}  ${c}`).join(`
`);
  }
  return an;
}
var rb;
function ct() {
  if (rb) return fo;
  ((rb = 1), Object.defineProperty(fo, "__esModule", { value: !0 }), (fo.BaseError = void 0));
  const e = Vv();
  class r extends Error {
    static setStaticOptions(o) {
      ((r.prototype.docsOrigin = o.docsOrigin),
        (r.prototype.showVersion = o.showVersion),
        (r.prototype.version = o.version));
    }
    constructor(o, s = {}) {
      const i = (() => {
          var g;
          if (s.cause instanceof r) {
            if (s.cause.details) return s.cause.details;
            if (s.cause.shortMessage) return s.cause.shortMessage;
          }
          return s.cause && "details" in s.cause && typeof s.cause.details == "string"
            ? s.cause.details
            : (g = s.cause) != null && g.message
              ? s.cause.message
              : s.details;
        })(),
        a = (s.cause instanceof r && s.cause.docsPath) || s.docsPath,
        c = s.docsOrigin ?? r.prototype.docsOrigin,
        u = `${c}${a ?? ""}`,
        l = !!(s.version ?? r.prototype.showVersion),
        f = s.version ?? r.prototype.version,
        m = [
          o || "An error occurred.",
          ...(s.metaMessages ? ["", ...s.metaMessages] : []),
          ...(i || a || l
            ? ["", i ? `Details: ${i}` : void 0, a ? `See: ${u}` : void 0, l ? `Version: ${f}` : void 0]
            : []),
        ].filter((g) => typeof g == "string").join(`
`);
      (super(m, s.cause ? { cause: s.cause } : void 0),
        Object.defineProperty(this, "details", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "docs", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "docsOrigin", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "docsPath", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "shortMessage", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "showVersion", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "version", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "cause", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "name", { enumerable: !0, configurable: !0, writable: !0, value: "BaseError" }),
        (this.cause = s.cause),
        (this.details = i),
        (this.docs = u),
        (this.docsOrigin = c),
        (this.docsPath = a),
        (this.shortMessage = o),
        (this.showVersion = l),
        (this.version = f));
    }
    walk(o) {
      return n(this, o);
    }
  }
  ((fo.BaseError = r),
    Object.defineProperty(r, "defaultStaticOptions", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: { docsOrigin: "https://oxlib.sh", showVersion: !1, version: `ox@${(0, e.getVersion)()}` },
    }),
    r.setStaticOptions(r.defaultStaticOptions));
  function n(t, o) {
    return o != null && o(t) ? t : t && typeof t == "object" && "cause" in t && t.cause ? n(t.cause, o) : o ? null : t;
  }
  return fo;
}
var xd = {},
  nb;
function _g() {
  return (
    nb ||
      ((nb = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.charCodeMap = void 0),
          (e.assertSize = n),
          (e.assertStartOffset = t),
          (e.assertEndOffset = o),
          (e.charCodeToBase16 = s),
          (e.pad = i),
          (e.trim = a));
        const r = Bt();
        function n(c, u) {
          if (r.size(c) > u) throw new r.SizeOverflowError({ givenSize: r.size(c), maxSize: u });
        }
        function t(c, u) {
          if (typeof u == "number" && u > 0 && u > r.size(c) - 1)
            throw new r.SliceOffsetOutOfBoundsError({ offset: u, position: "start", size: r.size(c) });
        }
        function o(c, u, l) {
          if (typeof u == "number" && typeof l == "number" && r.size(c) !== l - u)
            throw new r.SliceOffsetOutOfBoundsError({ offset: l, position: "end", size: r.size(c) });
        }
        e.charCodeMap = { zero: 48, nine: 57, A: 65, F: 70, a: 97, f: 102 };
        function s(c) {
          if (c >= e.charCodeMap.zero && c <= e.charCodeMap.nine) return c - e.charCodeMap.zero;
          if (c >= e.charCodeMap.A && c <= e.charCodeMap.F) return c - (e.charCodeMap.A - 10);
          if (c >= e.charCodeMap.a && c <= e.charCodeMap.f) return c - (e.charCodeMap.a - 10);
        }
        function i(c, u = {}) {
          const { dir: l, size: f = 32 } = u;
          if (f === 0) return c;
          if (c.length > f) throw new r.SizeExceedsPaddingSizeError({ size: c.length, targetSize: f, type: "Bytes" });
          const m = new Uint8Array(f);
          for (let g = 0; g < f; g++) {
            const h = l === "right";
            m[h ? g : f - g - 1] = c[h ? g : c.length - g - 1];
          }
          return m;
        }
        function a(c, u = {}) {
          const { dir: l = "left" } = u;
          let f = c,
            m = 0;
          for (let g = 0; g < f.length - 1 && f[l === "left" ? g : f.length - g - 1].toString() === "0"; g++) m++;
          return ((f = l === "left" ? f.slice(m) : f.slice(0, f.length - m)), f);
        }
      })(xd)),
    xd
  );
}
var tr = {},
  ob;
function vg() {
  if (ob) return tr;
  ((ob = 1),
    Object.defineProperty(tr, "__esModule", { value: !0 }),
    (tr.assertSize = r),
    (tr.assertStartOffset = n),
    (tr.assertEndOffset = t),
    (tr.pad = o),
    (tr.trim = s));
  const e = Ne();
  function r(i, a) {
    if (e.size(i) > a) throw new e.SizeOverflowError({ givenSize: e.size(i), maxSize: a });
  }
  function n(i, a) {
    if (typeof a == "number" && a > 0 && a > e.size(i) - 1)
      throw new e.SliceOffsetOutOfBoundsError({ offset: a, position: "start", size: e.size(i) });
  }
  function t(i, a, c) {
    if (typeof a == "number" && typeof c == "number" && e.size(i) !== c - a)
      throw new e.SliceOffsetOutOfBoundsError({ offset: c, position: "end", size: e.size(i) });
  }
  function o(i, a = {}) {
    const { dir: c, size: u = 32 } = a;
    if (u === 0) return i;
    const l = i.replace("0x", "");
    if (l.length > u * 2)
      throw new e.SizeExceedsPaddingSizeError({ size: Math.ceil(l.length / 2), targetSize: u, type: "Hex" });
    return `0x${l[c === "right" ? "padEnd" : "padStart"](u * 2, "0")}`;
  }
  function s(i, a = {}) {
    const { dir: c = "left" } = a;
    let u = i.replace("0x", ""),
      l = 0;
    for (let f = 0; f < u.length - 1 && u[c === "left" ? f : u.length - f - 1].toString() === "0"; f++) l++;
    return (
      (u = c === "left" ? u.slice(l) : u.slice(0, u.length - l)),
      u === "0" ? "0x" : c === "right" && u.length % 2 === 1 ? `0x${u}0` : `0x${u}`
    );
  }
  return tr;
}
var sn = {},
  ib;
function $u() {
  if (ib) return sn;
  ((ib = 1),
    Object.defineProperty(sn, "__esModule", { value: !0 }),
    (sn.canonicalize = r),
    (sn.parse = n),
    (sn.stringify = t));
  const e = "#__bigint";
  function r(o) {
    if (o === null || typeof o == "boolean" || typeof o == "string") return JSON.stringify(o);
    if (typeof o == "number") {
      if (!Number.isFinite(o)) throw new TypeError("Cannot canonicalize non-finite number");
      return Object.is(o, -0) ? "0" : JSON.stringify(o);
    }
    if (typeof o == "bigint") throw new TypeError("Cannot canonicalize bigint");
    if (Array.isArray(o)) return `[${o.map((s) => r(s)).join(",")}]`;
    if (typeof o == "object")
      return `{${Object.keys(o)
        .sort()
        .reduce((i, a) => {
          const c = o[a];
          return (c !== void 0 && i.push(`${JSON.stringify(a)}:${r(c)}`), i);
        }, [])
        .join(",")}}`;
  }
  function n(o, s) {
    return JSON.parse(o, (i, a) => {
      const c = a;
      return typeof c == "string" && c.endsWith(e)
        ? BigInt(c.slice(0, -e.length))
        : typeof s == "function"
          ? s(i, c)
          : c;
    });
  }
  function t(o, s, i) {
    return JSON.stringify(
      o,
      (a, c) => (typeof s == "function" ? s(a, c) : typeof c == "bigint" ? c.toString() + e : c),
      i,
    );
  }
  return sn;
}
var ab;
function Bt() {
  if (ab) return le;
  ((ab = 1),
    Object.defineProperty(le, "__esModule", { value: !0 }),
    (le.SizeExceedsPaddingSizeError =
      le.SliceOffsetOutOfBoundsError =
      le.SizeOverflowError =
      le.InvalidBytesTypeError =
      le.InvalidBytesBooleanError =
        void 0),
    (le.assert = c),
    (le.concat = u),
    (le.from = l),
    (le.fromArray = f),
    (le.fromBoolean = m),
    (le.fromHex = g),
    (le.fromNumber = h),
    (le.fromString = b),
    (le.isEqual = v),
    (le.padLeft = _),
    (le.padRight = E),
    (le.random = P),
    (le.size = d),
    (le.slice = j),
    (le.toBigInt = p),
    (le.toBoolean = y),
    (le.toHex = I),
    (le.toNumber = w),
    (le.toString = A),
    (le.trimLeft = B),
    (le.trimRight = R),
    (le.validate = S));
  const e = Lr(),
    r = ct(),
    n = Ne(),
    t = _g(),
    o = vg(),
    s = $u(),
    i = new TextDecoder(),
    a = new TextEncoder();
  function c(O) {
    if (!(O instanceof Uint8Array)) {
      if (!O) throw new F(O);
      if (typeof O != "object") throw new F(O);
      if (!("BYTES_PER_ELEMENT" in O)) throw new F(O);
      if (O.BYTES_PER_ELEMENT !== 1 || O.constructor.name !== "Uint8Array") throw new F(O);
    }
  }
  function u(...O) {
    let C = 0;
    for (const M of O) C += M.length;
    const q = new Uint8Array(C);
    for (let M = 0, N = 0; M < O.length; M++) {
      const z = O[M];
      (q.set(z, N), (N += z.length));
    }
    return q;
  }
  function l(O) {
    return O instanceof Uint8Array ? O : typeof O == "string" ? g(O) : f(O);
  }
  function f(O) {
    return O instanceof Uint8Array ? O : new Uint8Array(O);
  }
  function m(O, C = {}) {
    const { size: q } = C,
      M = new Uint8Array(1);
    return ((M[0] = Number(O)), typeof q == "number" ? (t.assertSize(M, q), _(M, q)) : M);
  }
  function g(O, C = {}) {
    const { size: q } = C;
    let M = O;
    q && (o.assertSize(O, q), (M = n.padRight(O, q)));
    let N = M.slice(2);
    N.length % 2 && (N = `0${N}`);
    const z = N.length / 2,
      $ = new Uint8Array(z);
    for (let U = 0, G = 0; U < z; U++) {
      const Z = t.charCodeToBase16(N.charCodeAt(G++)),
        K = t.charCodeToBase16(N.charCodeAt(G++));
      if (Z === void 0 || K === void 0)
        throw new r.BaseError(`Invalid byte sequence ("${N[G - 2]}${N[G - 1]}" in "${N}").`);
      $[U] = (Z << 4) | K;
    }
    return $;
  }
  function h(O, C) {
    const q = n.fromNumber(O, C);
    return g(q);
  }
  function b(O, C = {}) {
    const { size: q } = C,
      M = a.encode(O);
    return typeof q == "number" ? (t.assertSize(M, q), E(M, q)) : M;
  }
  function v(O, C) {
    return (0, e.equalBytes)(O, C);
  }
  function _(O, C) {
    return t.pad(O, { dir: "left", size: C });
  }
  function E(O, C) {
    return t.pad(O, { dir: "right", size: C });
  }
  function P(O) {
    return crypto.getRandomValues(new Uint8Array(O));
  }
  function d(O) {
    return O.length;
  }
  function j(O, C, q, M = {}) {
    const { strict: N } = M;
    t.assertStartOffset(O, C);
    const z = O.slice(C, q);
    return (N && t.assertEndOffset(z, C, q), z);
  }
  function p(O, C = {}) {
    const { size: q } = C;
    typeof q < "u" && t.assertSize(O, q);
    const M = n.fromBytes(O, C);
    return n.toBigInt(M, C);
  }
  function y(O, C = {}) {
    const { size: q } = C;
    let M = O;
    if ((typeof q < "u" && (t.assertSize(M, q), (M = B(M))), M.length > 1 || M[0] > 1)) throw new x(M);
    return !!M[0];
  }
  function I(O, C = {}) {
    return n.fromBytes(O, C);
  }
  function w(O, C = {}) {
    const { size: q } = C;
    typeof q < "u" && t.assertSize(O, q);
    const M = n.fromBytes(O, C);
    return n.toNumber(M, C);
  }
  function A(O, C = {}) {
    const { size: q } = C;
    let M = O;
    return (typeof q < "u" && (t.assertSize(M, q), (M = R(M))), i.decode(M));
  }
  function B(O) {
    return t.trim(O, { dir: "left" });
  }
  function R(O) {
    return t.trim(O, { dir: "right" });
  }
  function S(O) {
    try {
      return (c(O), !0);
    } catch {
      return !1;
    }
  }
  class x extends r.BaseError {
    constructor(C) {
      (super(`Bytes value \`${C}\` is not a valid boolean.`, {
        metaMessages: ["The bytes array must contain a single byte of either a `0` or `1` value."],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Bytes.InvalidBytesBooleanError",
        }));
    }
  }
  le.InvalidBytesBooleanError = x;
  class F extends r.BaseError {
    constructor(C) {
      (super(
        `Value \`${typeof C == "object" ? s.stringify(C) : C}\` of type \`${typeof C}\` is an invalid Bytes value.`,
        { metaMessages: ["Bytes values must be of type `Bytes`."] },
      ),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Bytes.InvalidBytesTypeError",
        }));
    }
  }
  le.InvalidBytesTypeError = F;
  class H extends r.BaseError {
    constructor({ givenSize: C, maxSize: q }) {
      (super(`Size cannot exceed \`${q}\` bytes. Given size: \`${C}\` bytes.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Bytes.SizeOverflowError",
        }));
    }
  }
  le.SizeOverflowError = H;
  class T extends r.BaseError {
    constructor({ offset: C, position: q, size: M }) {
      (super(`Slice ${q === "start" ? "starting" : "ending"} at offset \`${C}\` is out-of-bounds (size: \`${M}\`).`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Bytes.SliceOffsetOutOfBoundsError",
        }));
    }
  }
  le.SliceOffsetOutOfBoundsError = T;
  class k extends r.BaseError {
    constructor({ size: C, targetSize: q, type: M }) {
      (super(
        `${M.charAt(0).toUpperCase()}${M.slice(1).toLowerCase()} size (\`${C}\`) exceeds padding size (\`${q}\`).`,
      ),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Bytes.SizeExceedsPaddingSizeError",
        }));
    }
  }
  return ((le.SizeExceedsPaddingSizeError = k), le);
}
var sb;
function Ne() {
  if (sb) return fe;
  ((sb = 1),
    Object.defineProperty(fe, "__esModule", { value: !0 }),
    (fe.SizeExceedsPaddingSizeError =
      fe.SliceOffsetOutOfBoundsError =
      fe.SizeOverflowError =
      fe.InvalidLengthError =
      fe.InvalidHexValueError =
      fe.InvalidHexTypeError =
      fe.InvalidHexBooleanError =
      fe.IntegerOutOfRangeError =
        void 0),
    (fe.assert = c),
    (fe.concat = u),
    (fe.from = l),
    (fe.fromBoolean = f),
    (fe.fromBytes = m),
    (fe.fromNumber = g),
    (fe.fromString = h),
    (fe.isEqual = b),
    (fe.padLeft = v),
    (fe.padRight = _),
    (fe.random = E),
    (fe.slice = P),
    (fe.size = d),
    (fe.trimLeft = j),
    (fe.trimRight = p),
    (fe.toBigInt = y),
    (fe.toBoolean = I),
    (fe.toBytes = w),
    (fe.toNumber = A),
    (fe.toString = B),
    (fe.validate = R));
  const e = Lr(),
    r = Bt(),
    n = ct(),
    t = _g(),
    o = vg(),
    s = $u(),
    i = new TextEncoder(),
    a = Array.from({ length: 256 }, (q, M) => M.toString(16).padStart(2, "0"));
  function c(q, M = {}) {
    const { strict: N = !1 } = M;
    if (!q) throw new F(q);
    if (typeof q != "string") throw new F(q);
    if (N && !/^0x[0-9a-fA-F]*$/.test(q)) throw new H(q);
    if (!q.startsWith("0x")) throw new H(q);
  }
  function u(...q) {
    return `0x${q.reduce((M, N) => M + N.replace("0x", ""), "")}`;
  }
  function l(q) {
    return q instanceof Uint8Array ? m(q) : Array.isArray(q) ? m(new Uint8Array(q)) : q;
  }
  function f(q, M = {}) {
    const N = `0x${Number(q)}`;
    return typeof M.size == "number" ? (o.assertSize(N, M.size), v(N, M.size)) : N;
  }
  function m(q, M = {}) {
    let N = "";
    for (let $ = 0; $ < q.length; $++) N += a[q[$]];
    const z = `0x${N}`;
    return typeof M.size == "number" ? (o.assertSize(z, M.size), _(z, M.size)) : z;
  }
  function g(q, M = {}) {
    const { signed: N, size: z } = M,
      $ = BigInt(q);
    let U;
    z
      ? N
        ? (U = (1n << (BigInt(z) * 8n - 1n)) - 1n)
        : (U = 2n ** (BigInt(z) * 8n) - 1n)
      : typeof q == "number" && (U = BigInt(Number.MAX_SAFE_INTEGER));
    const G = typeof U == "bigint" && N ? -U - 1n : 0;
    if ((U && $ > U) || $ < G) {
      const V = typeof q == "bigint" ? "n" : "";
      throw new S({ max: U ? `${U}${V}` : void 0, min: `${G}${V}`, signed: N, size: z, value: `${q}${V}` });
    }
    const K = `0x${(N && $ < 0 ? BigInt.asUintN(z * 8, BigInt($)) : $).toString(16)}`;
    return z ? v(K, z) : K;
  }
  function h(q, M = {}) {
    return m(i.encode(q), M);
  }
  function b(q, M) {
    return (0, e.equalBytes)(r.fromHex(q), r.fromHex(M));
  }
  function v(q, M) {
    return o.pad(q, { dir: "left", size: M });
  }
  function _(q, M) {
    return o.pad(q, { dir: "right", size: M });
  }
  function E(q) {
    return m(r.random(q));
  }
  function P(q, M, N, z = {}) {
    const { strict: $ } = z;
    o.assertStartOffset(q, M);
    const U = `0x${q.replace("0x", "").slice((M ?? 0) * 2, (N ?? q.length) * 2)}`;
    return ($ && o.assertEndOffset(U, M, N), U);
  }
  function d(q) {
    return Math.ceil((q.length - 2) / 2);
  }
  function j(q) {
    return o.trim(q, { dir: "left" });
  }
  function p(q) {
    return o.trim(q, { dir: "right" });
  }
  function y(q, M = {}) {
    const { signed: N } = M;
    M.size && o.assertSize(q, M.size);
    const z = BigInt(q);
    if (!N) return z;
    const $ = (q.length - 2) / 2,
      U = (1n << (BigInt($) * 8n)) - 1n,
      G = U >> 1n;
    return z <= G ? z : z - U - 1n;
  }
  function I(q, M = {}) {
    M.size && o.assertSize(q, M.size);
    const N = j(q);
    if (N === "0x") return !1;
    if (N === "0x1") return !0;
    throw new x(q);
  }
  function w(q, M = {}) {
    return r.fromHex(q, M);
  }
  function A(q, M = {}) {
    const { signed: N, size: z } = M;
    return Number(!N && !z ? q : y(q, M));
  }
  function B(q, M = {}) {
    const { size: N } = M;
    let z = r.fromHex(q);
    return (N && (t.assertSize(z, N), (z = r.trimRight(z))), new TextDecoder().decode(z));
  }
  function R(q, M = {}) {
    const { strict: N = !1 } = M;
    try {
      return (c(q, { strict: N }), !0);
    } catch {
      return !1;
    }
  }
  class S extends n.BaseError {
    constructor({ max: M, min: N, signed: z, size: $, value: U }) {
      (super(
        `Number \`${U}\` is not in safe${$ ? ` ${$ * 8}-bit` : ""}${z ? " signed" : " unsigned"} integer range ${M ? `(\`${N}\` to \`${M}\`)` : `(above \`${N}\`)`}`,
      ),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.IntegerOutOfRangeError",
        }));
    }
  }
  fe.IntegerOutOfRangeError = S;
  class x extends n.BaseError {
    constructor(M) {
      (super(`Hex value \`"${M}"\` is not a valid boolean.`, {
        metaMessages: ['The hex value must be `"0x0"` (false) or `"0x1"` (true).'],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.InvalidHexBooleanError",
        }));
    }
  }
  fe.InvalidHexBooleanError = x;
  class F extends n.BaseError {
    constructor(M) {
      (super(`Value \`${typeof M == "object" ? s.stringify(M) : M}\` of type \`${typeof M}\` is an invalid hex type.`, {
        metaMessages: ['Hex types must be represented as `"0x${string}"`.'],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.InvalidHexTypeError",
        }));
    }
  }
  fe.InvalidHexTypeError = F;
  class H extends n.BaseError {
    constructor(M) {
      (super(`Value \`${M}\` is an invalid hex value.`, {
        metaMessages: ['Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.InvalidHexValueError",
        }));
    }
  }
  fe.InvalidHexValueError = H;
  class T extends n.BaseError {
    constructor(M) {
      (super(`Hex value \`"${M}"\` is an odd length (${M.length - 2} nibbles).`, {
        metaMessages: ["It must be an even length."],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.InvalidLengthError",
        }));
    }
  }
  fe.InvalidLengthError = T;
  class k extends n.BaseError {
    constructor({ givenSize: M, maxSize: N }) {
      (super(`Size cannot exceed \`${N}\` bytes. Given size: \`${M}\` bytes.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.SizeOverflowError",
        }));
    }
  }
  fe.SizeOverflowError = k;
  class O extends n.BaseError {
    constructor({ offset: M, position: N, size: z }) {
      (super(`Slice ${N === "start" ? "starting" : "ending"} at offset \`${M}\` is out-of-bounds (size: \`${z}\`).`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.SliceOffsetOutOfBoundsError",
        }));
    }
  }
  fe.SliceOffsetOutOfBoundsError = O;
  class C extends n.BaseError {
    constructor({ size: M, targetSize: N, type: z }) {
      (super(
        `${z.charAt(0).toUpperCase()}${z.slice(1).toLowerCase()} size (\`${M}\`) exceeds padding size (\`${N}\`).`,
      ),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Hex.SizeExceedsPaddingSizeError",
        }));
    }
  }
  return ((fe.SizeExceedsPaddingSizeError = C), fe);
}
var bo = {},
  cb;
function Wv() {
  if (cb) return bo;
  ((cb = 1), Object.defineProperty(bo, "__esModule", { value: !0 }), (bo.fromRpc = r), (bo.toRpc = n));
  const e = Ne();
  function r(t) {
    return { ...t, amount: BigInt(t.amount), index: Number(t.index), validatorIndex: Number(t.validatorIndex) };
  }
  function n(t) {
    return {
      address: t.address,
      amount: e.fromNumber(t.amount),
      index: e.fromNumber(t.index),
      validatorIndex: e.fromNumber(t.validatorIndex),
    };
  }
  return bo;
}
var ub;
function Eg() {
  if (ub) return uo;
  ((ub = 1), Object.defineProperty(uo, "__esModule", { value: !0 }), (uo.fromRpc = n), (uo.toRpc = t));
  const e = Ne(),
    r = Wv();
  function n(o) {
    return {
      ...(o.baseFeePerGas && { baseFeePerGas: BigInt(o.baseFeePerGas) }),
      ...(o.blobBaseFee && { blobBaseFee: BigInt(o.blobBaseFee) }),
      ...(o.feeRecipient && { feeRecipient: o.feeRecipient }),
      ...(o.gasLimit && { gasLimit: BigInt(o.gasLimit) }),
      ...(o.number && { number: BigInt(o.number) }),
      ...(o.prevRandao && { prevRandao: BigInt(o.prevRandao) }),
      ...(o.time && { time: BigInt(o.time) }),
      ...(o.withdrawals && { withdrawals: o.withdrawals.map(r.fromRpc) }),
    };
  }
  function t(o) {
    return {
      ...(typeof o.baseFeePerGas == "bigint" && { baseFeePerGas: e.fromNumber(o.baseFeePerGas) }),
      ...(typeof o.blobBaseFee == "bigint" && { blobBaseFee: e.fromNumber(o.blobBaseFee) }),
      ...(typeof o.feeRecipient == "string" && { feeRecipient: o.feeRecipient }),
      ...(typeof o.gasLimit == "bigint" && { gasLimit: e.fromNumber(o.gasLimit) }),
      ...(typeof o.number == "bigint" && { number: e.fromNumber(o.number) }),
      ...(typeof o.prevRandao == "bigint" && { prevRandao: e.fromNumber(o.prevRandao) }),
      ...(typeof o.time == "bigint" && { time: e.fromNumber(o.time) }),
      ...(o.withdrawals && { withdrawals: o.withdrawals.map(r.toRpc) }),
    };
  }
  return uo;
}
var pe = {},
  db;
function Jt() {
  if (db) return pe;
  ((db = 1),
    Object.defineProperty(pe, "__esModule", { value: !0 }),
    (pe.erc4626Abi =
      pe.erc721Abi =
      pe.erc1155Abi =
      pe.erc20Abi_bytes32 =
      pe.erc20Abi =
      pe.erc6492SignatureValidatorAbi =
      pe.erc1271Abi =
      pe.addressResolverAbi =
      pe.textResolverAbi =
      pe.universalResolverReverseAbi =
      pe.universalResolverResolveAbi =
      pe.batchGatewayAbi =
      pe.multicall3Abi =
        void 0),
    (pe.multicall3Abi = [
      {
        inputs: [
          {
            components: [
              { name: "target", type: "address" },
              { name: "allowFailure", type: "bool" },
              { name: "callData", type: "bytes" },
            ],
            name: "calls",
            type: "tuple[]",
          },
        ],
        name: "aggregate3",
        outputs: [
          {
            components: [
              { name: "success", type: "bool" },
              { name: "returnData", type: "bytes" },
            ],
            name: "returnData",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "addr", type: "address" }],
        name: "getEthBalance",
        outputs: [{ name: "balance", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentBlockTimestamp",
        outputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ]),
    (pe.batchGatewayAbi = [
      {
        name: "query",
        type: "function",
        stateMutability: "view",
        inputs: [
          {
            type: "tuple[]",
            name: "queries",
            components: [
              { type: "address", name: "sender" },
              { type: "string[]", name: "urls" },
              { type: "bytes", name: "data" },
            ],
          },
        ],
        outputs: [
          { type: "bool[]", name: "failures" },
          { type: "bytes[]", name: "responses" },
        ],
      },
      {
        name: "HttpError",
        type: "error",
        inputs: [
          { type: "uint16", name: "status" },
          { type: "string", name: "message" },
        ],
      },
    ]));
  const e = [
    { inputs: [{ name: "dns", type: "bytes" }], name: "DNSDecodingFailed", type: "error" },
    { inputs: [{ name: "ens", type: "string" }], name: "DNSEncodingFailed", type: "error" },
    { inputs: [], name: "EmptyAddress", type: "error" },
    {
      inputs: [
        { name: "status", type: "uint16" },
        { name: "message", type: "string" },
      ],
      name: "HttpError",
      type: "error",
    },
    { inputs: [], name: "InvalidBatchGatewayResponse", type: "error" },
    { inputs: [{ name: "errorData", type: "bytes" }], name: "ResolverError", type: "error" },
    {
      inputs: [
        { name: "name", type: "bytes" },
        { name: "resolver", type: "address" },
      ],
      name: "ResolverNotContract",
      type: "error",
    },
    { inputs: [{ name: "name", type: "bytes" }], name: "ResolverNotFound", type: "error" },
    {
      inputs: [
        { name: "primary", type: "string" },
        { name: "primaryAddress", type: "bytes" },
      ],
      name: "ReverseAddressMismatch",
      type: "error",
    },
    {
      inputs: [{ internalType: "bytes4", name: "selector", type: "bytes4" }],
      name: "UnsupportedResolverProfile",
      type: "error",
    },
  ];
  return (
    (pe.universalResolverResolveAbi = [
      ...e,
      {
        name: "resolveWithGateways",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes" },
          { name: "data", type: "bytes" },
          { name: "gateways", type: "string[]" },
        ],
        outputs: [
          { name: "", type: "bytes" },
          { name: "address", type: "address" },
        ],
      },
    ]),
    (pe.universalResolverReverseAbi = [
      ...e,
      {
        name: "reverseWithGateways",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "bytes", name: "reverseName" },
          { type: "uint256", name: "coinType" },
          { type: "string[]", name: "gateways" },
        ],
        outputs: [
          { type: "string", name: "resolvedName" },
          { type: "address", name: "resolver" },
          { type: "address", name: "reverseResolver" },
        ],
      },
    ]),
    (pe.textResolverAbi = [
      {
        name: "text",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "key", type: "string" },
        ],
        outputs: [{ name: "", type: "string" }],
      },
    ]),
    (pe.addressResolverAbi = [
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "name", type: "bytes32" }],
        outputs: [{ name: "", type: "address" }],
      },
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "coinType", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bytes" }],
      },
    ]),
    (pe.erc1271Abi = [
      {
        name: "isValidSignature",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "hash", type: "bytes32" },
          { name: "signature", type: "bytes" },
        ],
        outputs: [{ name: "", type: "bytes4" }],
      },
    ]),
    (pe.erc6492SignatureValidatorAbi = [
      {
        inputs: [
          { name: "_signer", type: "address" },
          { name: "_hash", type: "bytes32" },
          { name: "_signature", type: "bytes" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          { name: "_signer", type: "address" },
          { name: "_hash", type: "bytes32" },
          { name: "_signature", type: "bytes" },
        ],
        outputs: [{ type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
        name: "isValidSig",
      },
    ]),
    (pe.erc20Abi = [
      {
        type: "event",
        name: "Approval",
        inputs: [
          { indexed: !0, name: "owner", type: "address" },
          { indexed: !0, name: "spender", type: "address" },
          { indexed: !1, name: "value", type: "uint256" },
        ],
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          { indexed: !0, name: "from", type: "address" },
          { indexed: !0, name: "to", type: "address" },
          { indexed: !1, name: "value", type: "uint256" },
        ],
      },
      {
        type: "function",
        name: "allowance",
        stateMutability: "view",
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        outputs: [{ type: "uint256" }],
      },
      {
        type: "function",
        name: "approve",
        stateMutability: "nonpayable",
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ type: "bool" }],
      },
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ type: "uint256" }],
      },
      { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
      { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
      { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
      { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ type: "bool" }],
      },
      {
        type: "function",
        name: "transferFrom",
        stateMutability: "nonpayable",
        inputs: [
          { name: "sender", type: "address" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ type: "bool" }],
      },
    ]),
    (pe.erc20Abi_bytes32 = [
      {
        type: "event",
        name: "Approval",
        inputs: [
          { indexed: !0, name: "owner", type: "address" },
          { indexed: !0, name: "spender", type: "address" },
          { indexed: !1, name: "value", type: "uint256" },
        ],
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          { indexed: !0, name: "from", type: "address" },
          { indexed: !0, name: "to", type: "address" },
          { indexed: !1, name: "value", type: "uint256" },
        ],
      },
      {
        type: "function",
        name: "allowance",
        stateMutability: "view",
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        outputs: [{ type: "uint256" }],
      },
      {
        type: "function",
        name: "approve",
        stateMutability: "nonpayable",
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ type: "bool" }],
      },
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ type: "uint256" }],
      },
      { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
      { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
      { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
      { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ type: "bool" }],
      },
      {
        type: "function",
        name: "transferFrom",
        stateMutability: "nonpayable",
        inputs: [
          { name: "sender", type: "address" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ type: "bool" }],
      },
    ]),
    (pe.erc1155Abi = [
      {
        inputs: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "uint256", name: "balance", type: "uint256" },
          { internalType: "uint256", name: "needed", type: "uint256" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "ERC1155InsufficientBalance",
        type: "error",
      },
      {
        inputs: [{ internalType: "address", name: "approver", type: "address" }],
        name: "ERC1155InvalidApprover",
        type: "error",
      },
      {
        inputs: [
          { internalType: "uint256", name: "idsLength", type: "uint256" },
          { internalType: "uint256", name: "valuesLength", type: "uint256" },
        ],
        name: "ERC1155InvalidArrayLength",
        type: "error",
      },
      {
        inputs: [{ internalType: "address", name: "operator", type: "address" }],
        name: "ERC1155InvalidOperator",
        type: "error",
      },
      {
        inputs: [{ internalType: "address", name: "receiver", type: "address" }],
        name: "ERC1155InvalidReceiver",
        type: "error",
      },
      {
        inputs: [{ internalType: "address", name: "sender", type: "address" }],
        name: "ERC1155InvalidSender",
        type: "error",
      },
      {
        inputs: [
          { internalType: "address", name: "operator", type: "address" },
          { internalType: "address", name: "owner", type: "address" },
        ],
        name: "ERC1155MissingApprovalForAll",
        type: "error",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, internalType: "address", name: "account", type: "address" },
          { indexed: !0, internalType: "address", name: "operator", type: "address" },
          { indexed: !1, internalType: "bool", name: "approved", type: "bool" },
        ],
        name: "ApprovalForAll",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, internalType: "address", name: "operator", type: "address" },
          { indexed: !0, internalType: "address", name: "from", type: "address" },
          { indexed: !0, internalType: "address", name: "to", type: "address" },
          { indexed: !1, internalType: "uint256[]", name: "ids", type: "uint256[]" },
          { indexed: !1, internalType: "uint256[]", name: "values", type: "uint256[]" },
        ],
        name: "TransferBatch",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, internalType: "address", name: "operator", type: "address" },
          { indexed: !0, internalType: "address", name: "from", type: "address" },
          { indexed: !0, internalType: "address", name: "to", type: "address" },
          { indexed: !1, internalType: "uint256", name: "id", type: "uint256" },
          { indexed: !1, internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "TransferSingle",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !1, internalType: "string", name: "value", type: "string" },
          { indexed: !0, internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "URI",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address[]", name: "accounts", type: "address[]" },
          { internalType: "uint256[]", name: "ids", type: "uint256[]" },
        ],
        name: "balanceOfBatch",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "address", name: "operator", type: "address" },
        ],
        name: "isApprovedForAll",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256[]", name: "ids", type: "uint256[]" },
          { internalType: "uint256[]", name: "values", type: "uint256[]" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "operator", type: "address" },
          { internalType: "bool", name: "approved", type: "bool" },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "uri",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ]),
    (pe.erc721Abi = [
      {
        type: "event",
        name: "Approval",
        inputs: [
          { indexed: !0, name: "owner", type: "address" },
          { indexed: !0, name: "spender", type: "address" },
          { indexed: !0, name: "tokenId", type: "uint256" },
        ],
      },
      {
        type: "event",
        name: "ApprovalForAll",
        inputs: [
          { indexed: !0, name: "owner", type: "address" },
          { indexed: !0, name: "operator", type: "address" },
          { indexed: !1, name: "approved", type: "bool" },
        ],
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          { indexed: !0, name: "from", type: "address" },
          { indexed: !0, name: "to", type: "address" },
          { indexed: !0, name: "tokenId", type: "uint256" },
        ],
      },
      {
        type: "function",
        name: "approve",
        stateMutability: "payable",
        inputs: [
          { name: "spender", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
        outputs: [],
      },
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ type: "uint256" }],
      },
      {
        type: "function",
        name: "getApproved",
        stateMutability: "view",
        inputs: [{ name: "tokenId", type: "uint256" }],
        outputs: [{ type: "address" }],
      },
      {
        type: "function",
        name: "isApprovedForAll",
        stateMutability: "view",
        inputs: [
          { name: "owner", type: "address" },
          { name: "operator", type: "address" },
        ],
        outputs: [{ type: "bool" }],
      },
      { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
      {
        type: "function",
        name: "ownerOf",
        stateMutability: "view",
        inputs: [{ name: "tokenId", type: "uint256" }],
        outputs: [{ name: "owner", type: "address" }],
      },
      {
        type: "function",
        name: "safeTransferFrom",
        stateMutability: "payable",
        inputs: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
        outputs: [],
      },
      {
        type: "function",
        name: "safeTransferFrom",
        stateMutability: "nonpayable",
        inputs: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "id", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
        outputs: [],
      },
      {
        type: "function",
        name: "setApprovalForAll",
        stateMutability: "nonpayable",
        inputs: [
          { name: "operator", type: "address" },
          { name: "approved", type: "bool" },
        ],
        outputs: [],
      },
      { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
      {
        type: "function",
        name: "tokenByIndex",
        stateMutability: "view",
        inputs: [{ name: "index", type: "uint256" }],
        outputs: [{ type: "uint256" }],
      },
      {
        type: "function",
        name: "tokenByIndex",
        stateMutability: "view",
        inputs: [
          { name: "owner", type: "address" },
          { name: "index", type: "uint256" },
        ],
        outputs: [{ name: "tokenId", type: "uint256" }],
      },
      {
        type: "function",
        name: "tokenURI",
        stateMutability: "view",
        inputs: [{ name: "tokenId", type: "uint256" }],
        outputs: [{ type: "string" }],
      },
      { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
      {
        type: "function",
        name: "transferFrom",
        stateMutability: "payable",
        inputs: [
          { name: "sender", type: "address" },
          { name: "recipient", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
        outputs: [],
      },
    ]),
    (pe.erc4626Abi = [
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, name: "owner", type: "address" },
          { indexed: !0, name: "spender", type: "address" },
          { indexed: !1, name: "value", type: "uint256" },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, name: "sender", type: "address" },
          { indexed: !0, name: "receiver", type: "address" },
          { indexed: !1, name: "assets", type: "uint256" },
          { indexed: !1, name: "shares", type: "uint256" },
        ],
        name: "Deposit",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, name: "from", type: "address" },
          { indexed: !0, name: "to", type: "address" },
          { indexed: !1, name: "value", type: "uint256" },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        anonymous: !1,
        inputs: [
          { indexed: !0, name: "sender", type: "address" },
          { indexed: !0, name: "receiver", type: "address" },
          { indexed: !0, name: "owner", type: "address" },
          { indexed: !1, name: "assets", type: "uint256" },
          { indexed: !1, name: "shares", type: "uint256" },
        ],
        name: "Withdraw",
        type: "event",
      },
      {
        inputs: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "asset",
        outputs: [{ name: "assetTokenAddress", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "shares", type: "uint256" }],
        name: "convertToAssets",
        outputs: [{ name: "assets", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "assets", type: "uint256" }],
        name: "convertToShares",
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "assets", type: "uint256" },
          { name: "receiver", type: "address" },
        ],
        name: "deposit",
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ name: "caller", type: "address" }],
        name: "maxDeposit",
        outputs: [{ name: "maxAssets", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "caller", type: "address" }],
        name: "maxMint",
        outputs: [{ name: "maxShares", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "owner", type: "address" }],
        name: "maxRedeem",
        outputs: [{ name: "maxShares", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "owner", type: "address" }],
        name: "maxWithdraw",
        outputs: [{ name: "maxAssets", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "shares", type: "uint256" },
          { name: "receiver", type: "address" },
        ],
        name: "mint",
        outputs: [{ name: "assets", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ name: "assets", type: "uint256" }],
        name: "previewDeposit",
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "shares", type: "uint256" }],
        name: "previewMint",
        outputs: [{ name: "assets", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "shares", type: "uint256" }],
        name: "previewRedeem",
        outputs: [{ name: "assets", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ name: "assets", type: "uint256" }],
        name: "previewWithdraw",
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { name: "shares", type: "uint256" },
          { name: "receiver", type: "address" },
          { name: "owner", type: "address" },
        ],
        name: "redeem",
        outputs: [{ name: "assets", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "totalAssets",
        outputs: [{ name: "totalManagedAssets", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { name: "assets", type: "uint256" },
          { name: "receiver", type: "address" },
          { name: "owner", type: "address" },
        ],
        name: "withdraw",
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ]),
    pe
  );
}
var mo = {},
  fb;
function Kv() {
  return (
    fb ||
      ((fb = 1),
      Object.defineProperty(mo, "__esModule", { value: !0 }),
      (mo.aggregate3Signature = void 0),
      (mo.aggregate3Signature = "0x82ad56cb")),
    mo
  );
}
var yt = {},
  lb;
function Vo() {
  return (
    lb ||
      ((lb = 1),
      Object.defineProperty(yt, "__esModule", { value: !0 }),
      (yt.multicall3Bytecode =
        yt.erc6492SignatureValidatorByteCode =
        yt.deploylessCallViaFactoryBytecode =
        yt.deploylessCallViaBytecodeBytecode =
          void 0),
      (yt.deploylessCallViaBytecodeBytecode =
        "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe"),
      (yt.deploylessCallViaFactoryBytecode =
        "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe"),
      (yt.erc6492SignatureValidatorByteCode =
        "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572"),
      (yt.multicall3Bytecode =
        "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033")),
    yt
  );
}
var ot = {},
  bb;
function Wo() {
  if (bb) return ot;
  ((bb = 1),
    Object.defineProperty(ot, "__esModule", { value: !0 }),
    (ot.InvalidChainIdError =
      ot.ClientChainNotConfiguredError =
      ot.ChainNotFoundError =
      ot.ChainMismatchError =
      ot.ChainDoesNotSupportContract =
        void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ blockNumber: a, chain: c, contract: u }) {
      super(`Chain "${c.name}" does not support contract "${u.name}".`, {
        metaMessages: [
          "This could be due to any of the following:",
          ...(a && u.blockCreated && u.blockCreated > a
            ? [`- The contract "${u.name}" was not deployed until block ${u.blockCreated} (current block ${a}).`]
            : [`- The chain does not have the contract "${u.name}" configured.`]),
        ],
        name: "ChainDoesNotSupportContract",
      });
    }
  }
  ot.ChainDoesNotSupportContract = r;
  class n extends e.BaseError {
    constructor({ chain: a, currentChainId: c }) {
      super(
        `The current chain of the wallet (id: ${c}) does not match the target chain for the transaction (id: ${a.id} – ${a.name}).`,
        {
          metaMessages: [`Current Chain ID:  ${c}`, `Expected Chain ID: ${a.id} – ${a.name}`],
          name: "ChainMismatchError",
        },
      );
    }
  }
  ot.ChainMismatchError = n;
  class t extends e.BaseError {
    constructor() {
      super(
        [
          "No chain was provided to the request.",
          "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient.",
        ].join(`
`),
        { name: "ChainNotFoundError" },
      );
    }
  }
  ot.ChainNotFoundError = t;
  class o extends e.BaseError {
    constructor() {
      super("No chain was provided to the Client.", { name: "ClientChainNotConfiguredError" });
    }
  }
  ot.ClientChainNotConfiguredError = o;
  class s extends e.BaseError {
    constructor({ chainId: a }) {
      super(typeof a == "number" ? `Chain ID "${a}" is invalid.` : "Chain ID is invalid.", {
        name: "InvalidChainIdError",
      });
    }
  }
  return ((ot.InvalidChainIdError = s), ot);
}
var Ea = {},
  mb;
function Ko() {
  if (mb) return Ea;
  ((mb = 1), Object.defineProperty(Ea, "__esModule", { value: !0 }), (Ea.encodeDeployData = o));
  const e = Se(),
    r = qe(),
    n = vt(),
    t = "/docs/contract/encodeDeployData";
  function o(s) {
    const { abi: i, args: a, bytecode: c } = s;
    if (!a || a.length === 0) return c;
    const u = i.find((f) => "type" in f && f.type === "constructor");
    if (!u) throw new e.AbiConstructorNotFoundError({ docsPath: t });
    if (!("inputs" in u)) throw new e.AbiConstructorParamsNotFoundError({ docsPath: t });
    if (!u.inputs || u.inputs.length === 0) throw new e.AbiConstructorParamsNotFoundError({ docsPath: t });
    const l = (0, n.encodeAbiParameters)(u.inputs, a);
    return (0, r.concatHex)([c, l]);
  }
  return Ea;
}
var ja = {},
  hb;
function hr() {
  if (hb) return ja;
  ((hb = 1), Object.defineProperty(ja, "__esModule", { value: !0 }), (ja.getChainContractAddress = r));
  const e = Wo();
  function r({ blockNumber: n, chain: t, contract: o }) {
    var i;
    const s = (i = t == null ? void 0 : t.contracts) == null ? void 0 : i[o];
    if (!s) throw new e.ChainDoesNotSupportContract({ chain: t, contract: { name: o } });
    if (n && s.blockCreated && s.blockCreated > n)
      throw new e.ChainDoesNotSupportContract({
        blockNumber: n,
        chain: t,
        contract: { name: o, blockCreated: s.blockCreated },
      });
    return s.address;
  }
  return ja;
}
var wa = {},
  yb;
function yf() {
  if (yb) return wa;
  ((yb = 1), Object.defineProperty(wa, "__esModule", { value: !0 }), (wa.getCallError = t));
  const e = ur(),
    r = Zt(),
    n = No();
  function t(o, { docsPath: s, ...i }) {
    const a = (() => {
      const c = (0, n.getNodeError)(o, i);
      return c instanceof r.UnknownNodeError ? o : c;
    })();
    return new e.CallExecutionError(a, { docsPath: s, ...i });
  }
  return wa;
}
var Pa = {},
  Aa = {},
  pb;
function pf() {
  if (pb) return Aa;
  ((pb = 1), Object.defineProperty(Aa, "__esModule", { value: !0 }), (Aa.withResolvers = e));
  function e() {
    let r = () => {},
      n = () => {};
    return {
      promise: new Promise((o, s) => {
        ((r = o), (n = s));
      }),
      resolve: r,
      reject: n,
    };
  }
  return Aa;
}
var gb;
function gf() {
  if (gb) return Pa;
  ((gb = 1), Object.defineProperty(Pa, "__esModule", { value: !0 }), (Pa.createBatchScheduler = n));
  const e = pf(),
    r = new Map();
  function n({ fn: t, id: o, shouldSplitBatch: s, wait: i = 0, sort: a }) {
    const c = async () => {
        const g = f();
        u();
        const h = g.map(({ args: b }) => b);
        h.length !== 0 &&
          t(h)
            .then((b) => {
              a && Array.isArray(b) && b.sort(a);
              for (let v = 0; v < g.length; v++) {
                const { resolve: _ } = g[v];
                _ == null || _([b[v], b]);
              }
            })
            .catch((b) => {
              for (let v = 0; v < g.length; v++) {
                const { reject: _ } = g[v];
                _ == null || _(b);
              }
            });
      },
      u = () => r.delete(o),
      l = () => f().map(({ args: g }) => g),
      f = () => r.get(o) || [],
      m = (g) => r.set(o, [...f(), g]);
    return {
      flush: u,
      async schedule(g) {
        const { promise: h, resolve: b, reject: v } = (0, e.withResolvers)();
        return (
          (s == null ? void 0 : s([...l(), g])) && c(),
          f().length > 0
            ? (m({ args: g, resolve: b, reject: v }), h)
            : (m({ args: g, resolve: b, reject: v }), setTimeout(c, i), h)
        );
      },
    };
  }
  return Pa;
}
var Cd = {},
  Dt = {},
  _b;
function Zv() {
  if (_b) return Dt;
  ((_b = 1),
    Object.defineProperty(Dt, "__esModule", { value: !0 }),
    (Dt.OffchainLookupSenderMismatchError = Dt.OffchainLookupResponseMalformedError = Dt.OffchainLookupError = void 0));
  const e = Fe(),
    r = ue(),
    n = rf();
  class t extends r.BaseError {
    constructor({ callbackSelector: a, cause: c, data: u, extraData: l, sender: f, urls: m }) {
      var g;
      super(c.shortMessage || "An error occurred while fetching for an offchain result.", {
        cause: c,
        metaMessages: [
          ...(c.metaMessages || []),
          (g = c.metaMessages) != null && g.length ? "" : [],
          "Offchain Gateway Call:",
          m && ["  Gateway URL(s):", ...m.map((h) => `    ${(0, n.getUrl)(h)}`)],
          `  Sender: ${f}`,
          `  Data: ${u}`,
          `  Callback selector: ${a}`,
          `  Extra data: ${l}`,
        ].flat(),
        name: "OffchainLookupError",
      });
    }
  }
  Dt.OffchainLookupError = t;
  class o extends r.BaseError {
    constructor({ result: a, url: c }) {
      super("Offchain gateway response is malformed. Response data must be a hex value.", {
        metaMessages: [`Gateway URL: ${(0, n.getUrl)(c)}`, `Response: ${(0, e.stringify)(a)}`],
        name: "OffchainLookupResponseMalformedError",
      });
    }
  }
  Dt.OffchainLookupResponseMalformedError = o;
  class s extends r.BaseError {
    constructor({ sender: a, to: c }) {
      super("Reverted sender address does not match target contract address (`to`).", {
        metaMessages: [`Contract address: ${c}`, `OffchainLookup sender address: ${a}`],
        name: "OffchainLookupSenderMismatchError",
      });
    }
  }
  return ((Dt.OffchainLookupSenderMismatchError = s), Dt);
}
var qd = {},
  Ta = {},
  vb;
function _f() {
  if (vb) return Ta;
  ((vb = 1), Object.defineProperty(Ta, "__esModule", { value: !0 }), (Ta.decodeFunctionData = s));
  const e = Se(),
    r = st(),
    n = $r(),
    t = cr(),
    o = Vt();
  function s(i) {
    const { abi: a, data: c } = i,
      u = (0, r.slice)(c, 0, 4),
      l = a.find((f) => f.type === "function" && u === (0, n.toFunctionSelector)((0, o.formatAbiItem)(f)));
    if (!l) throw new e.AbiFunctionSignatureNotFoundError(u, { docsPath: "/docs/contract/decodeFunctionData" });
    return {
      functionName: l.name,
      args:
        "inputs" in l && l.inputs && l.inputs.length > 0
          ? (0, t.decodeAbiParameters)(l.inputs, (0, r.slice)(c, 4))
          : void 0,
    };
  }
  return Ta;
}
var Sa = {},
  Eb;
function vf() {
  if (Eb) return Sa;
  ((Eb = 1), Object.defineProperty(Sa, "__esModule", { value: !0 }), (Sa.encodeErrorResult = a));
  const e = Se(),
    r = qe(),
    n = $r(),
    t = vt(),
    o = Vt(),
    s = Kt(),
    i = "/docs/contract/encodeErrorResult";
  function a(c) {
    const { abi: u, errorName: l, args: f } = c;
    let m = u[0];
    if (l) {
      const v = (0, s.getAbiItem)({ abi: u, args: f, name: l });
      if (!v) throw new e.AbiErrorNotFoundError(l, { docsPath: i });
      m = v;
    }
    if (m.type !== "error") throw new e.AbiErrorNotFoundError(void 0, { docsPath: i });
    const g = (0, o.formatAbiItem)(m),
      h = (0, n.toFunctionSelector)(g);
    let b = "0x";
    if (f && f.length > 0) {
      if (!m.inputs) throw new e.AbiErrorInputsNotFoundError(m.name, { docsPath: i });
      b = (0, t.encodeAbiParameters)(m.inputs, f);
    }
    return (0, r.concatHex)([h, b]);
  }
  return Sa;
}
var Ia = {},
  jb;
function Ef() {
  if (jb) return Ia;
  ((jb = 1), Object.defineProperty(Ia, "__esModule", { value: !0 }), (Ia.encodeFunctionResult = o));
  const e = Se(),
    r = vt(),
    n = Kt(),
    t = "/docs/contract/encodeFunctionResult";
  function o(s) {
    const { abi: i, functionName: a, result: c } = s;
    let u = i[0];
    if (a) {
      const f = (0, n.getAbiItem)({ abi: i, name: a });
      if (!f) throw new e.AbiFunctionNotFoundError(a, { docsPath: t });
      u = f;
    }
    if (u.type !== "function") throw new e.AbiFunctionNotFoundError(void 0, { docsPath: t });
    if (!u.outputs) throw new e.AbiFunctionOutputsNotFoundError(u.name, { docsPath: t });
    const l = (() => {
      if (u.outputs.length === 0) return [];
      if (u.outputs.length === 1) return [c];
      if (Array.isArray(c)) return c;
      throw new e.InvalidArrayError(c);
    })();
    return (0, r.encodeAbiParameters)(u.outputs, l);
  }
  return Ia;
}
var wb;
function zu() {
  return (
    wb ||
      ((wb = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.localBatchGatewayUrl = void 0),
          (e.localBatchGatewayRequest = i));
        const r = Jt(),
          n = Qd(),
          t = _f(),
          o = vf(),
          s = Ef();
        e.localBatchGatewayUrl = "x-batch-gateway:true";
        async function i(c) {
          const { data: u, ccipRequest: l } = c,
            {
              args: [f],
            } = (0, t.decodeFunctionData)({ abi: r.batchGatewayAbi, data: u }),
            m = [],
            g = [];
          return (
            await Promise.all(
              f.map(async (h, b) => {
                try {
                  ((g[b] = h.urls.includes(e.localBatchGatewayUrl)
                    ? await i({ data: h.data, ccipRequest: l })
                    : await l(h)),
                    (m[b] = !1));
                } catch (v) {
                  ((m[b] = !0), (g[b] = a(v)));
                }
              }),
            ),
            (0, s.encodeFunctionResult)({ abi: r.batchGatewayAbi, functionName: "query", result: [m, g] })
          );
        }
        function a(c) {
          return c.name === "HttpRequestError" && c.status
            ? (0, o.encodeErrorResult)({
                abi: r.batchGatewayAbi,
                errorName: "HttpError",
                args: [c.status, c.shortMessage],
              })
            : (0, o.encodeErrorResult)({
                abi: [n.solidityError],
                errorName: "Error",
                args: ["shortMessage" in c ? c.shortMessage : c.message],
              });
        }
      })(qd)),
    qd
  );
}
var Pb;
function jf() {
  return (
    Pb ||
      ((Pb = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.offchainLookupAbiItem = e.offchainLookupSignature = void 0),
          (e.offchainLookup = f),
          (e.ccipRequest = m));
        const r = jn(),
          n = Zv(),
          t = Et(),
          o = Ou(),
          s = vt(),
          i = Pt(),
          a = qe(),
          c = Ge(),
          u = zu(),
          l = Fe();
        ((e.offchainLookupSignature = "0x556f1830"),
          (e.offchainLookupAbiItem = {
            name: "OffchainLookup",
            type: "error",
            inputs: [
              { name: "sender", type: "address" },
              { name: "urls", type: "string[]" },
              { name: "callData", type: "bytes" },
              { name: "callbackFunction", type: "bytes4" },
              { name: "extraData", type: "bytes" },
            ],
          }));
        async function f(g, { blockNumber: h, blockTag: b, data: v, to: _ }) {
          const { args: E } = (0, o.decodeErrorResult)({ data: v, abi: [e.offchainLookupAbiItem] }),
            [P, d, j, p, y] = E,
            { ccipRead: I } = g,
            w = I && typeof (I == null ? void 0 : I.request) == "function" ? I.request : m;
          try {
            if (!(0, i.isAddressEqual)(_, P)) throw new n.OffchainLookupSenderMismatchError({ sender: P, to: _ });
            const A = d.includes(u.localBatchGatewayUrl)
                ? await (0, u.localBatchGatewayRequest)({ data: j, ccipRequest: w })
                : await w({ data: j, sender: P, urls: d }),
              { data: B } = await (0, r.call)(g, {
                blockNumber: h,
                blockTag: b,
                data: (0, a.concat)([p, (0, s.encodeAbiParameters)([{ type: "bytes" }, { type: "bytes" }], [A, y])]),
                to: _,
              });
            return B;
          } catch (A) {
            throw new n.OffchainLookupError({
              callbackSelector: p,
              cause: A,
              data: v,
              extraData: y,
              sender: P,
              urls: d,
            });
          }
        }
        async function m({ data: g, sender: h, urls: b }) {
          var _;
          let v = new Error("An unknown error occurred.");
          for (let E = 0; E < b.length; E++) {
            const P = b[E],
              d = P.includes("{data}") ? "GET" : "POST",
              j = d === "POST" ? { data: g, sender: h } : void 0,
              p = d === "POST" ? { "Content-Type": "application/json" } : {};
            try {
              const y = await fetch(P.replace("{sender}", h.toLowerCase()).replace("{data}", g), {
                body: JSON.stringify(j),
                headers: p,
                method: d,
              });
              let I;
              if (
                ((_ = y.headers.get("Content-Type")) != null && _.startsWith("application/json")
                  ? (I = (await y.json()).data)
                  : (I = await y.text()),
                !y.ok)
              ) {
                v = new t.HttpRequestError({
                  body: j,
                  details: I != null && I.error ? (0, l.stringify)(I.error) : y.statusText,
                  headers: y.headers,
                  status: y.status,
                  url: P,
                });
                continue;
              }
              if (!(0, c.isHex)(I)) {
                v = new n.OffchainLookupResponseMalformedError({ result: I, url: P });
                continue;
              }
              return I;
            } catch (y) {
              v = new t.HttpRequestError({ body: j, details: y.message, url: P });
            }
          }
          throw v;
        }
      })(Cd)),
    Cd
  );
}
var Ab;
function jn() {
  if (Ab) return co;
  ((Ab = 1), Object.defineProperty(co, "__esModule", { value: !0 }), (co.call = d), (co.getRevertErrorData = w));
  const e = ir(),
    r = Eg(),
    n = Ie(),
    t = Jt(),
    o = Kv(),
    s = Vo(),
    i = ue(),
    a = Wo(),
    c = ur(),
    u = Rt(),
    l = Ko(),
    f = We(),
    m = hr(),
    g = te(),
    h = yf(),
    b = br(),
    v = jt(),
    _ = gf(),
    E = of(),
    P = wt();
  async function d(A, B) {
    var de, ye, ee, W;
    const {
        account: R = A.account,
        authorizationList: S,
        batch: x = !!((de = A.batch) != null && de.multicall),
        blockNumber: F,
        blockTag: H = A.experimental_blockTag ?? "latest",
        accessList: T,
        blobs: k,
        blockOverrides: O,
        code: C,
        data: q,
        factory: M,
        factoryData: N,
        gas: z,
        gasPrice: $,
        maxFeePerBlobGas: U,
        maxFeePerGas: G,
        maxPriorityFeePerGas: Z,
        nonce: K,
        to: V,
        value: Y,
        stateOverride: re,
        ...J
      } = B,
      X = R ? (0, n.parseAccount)(R) : void 0;
    if (C && (M || N)) throw new i.BaseError("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
    if (C && V) throw new i.BaseError("Cannot provide both `code` & `to` as parameters.");
    const Q = C && q,
      oe = M && N && V && q,
      ie = Q || oe,
      se = Q ? y({ code: C, data: q }) : oe ? I({ data: q, factory: M, factoryData: N, to: V }) : q;
    try {
      (0, P.assertRequest)(B);
      const Ce = (typeof F == "bigint" ? (0, g.numberToHex)(F) : void 0) || H,
        Oe = O ? r.toRpc(O) : void 0,
        He = (0, E.serializeStateOverride)(re),
        Ke =
          (W = (ee = (ye = A.chain) == null ? void 0 : ye.formatters) == null ? void 0 : ee.transactionRequest) == null
            ? void 0
            : W.format,
        ut = (Ke || v.formatTransactionRequest)(
          {
            ...(0, b.extract)(J, { format: Ke }),
            accessList: T,
            account: X,
            authorizationList: S,
            blobs: k,
            data: se,
            gas: z,
            gasPrice: $,
            maxFeePerBlobGas: U,
            maxFeePerGas: G,
            maxPriorityFeePerGas: Z,
            nonce: K,
            to: ie ? void 0 : V,
            value: Y,
          },
          "call",
        );
      if (x && j({ request: ut }) && !He && !Oe)
        try {
          return await p(A, { ...ut, blockNumber: F, blockTag: H });
        } catch (Me) {
          if (!(Me instanceof a.ClientChainNotConfiguredError) && !(Me instanceof a.ChainDoesNotSupportContract))
            throw Me;
        }
      const dt = (() => {
          const Me = [ut, Ce];
          return He && Oe ? [...Me, He, Oe] : He ? [...Me, He] : Oe ? [...Me, {}, Oe] : Me;
        })(),
        Ze = await A.request({ method: "eth_call", params: dt });
      return Ze === "0x" ? { data: void 0 } : { data: Ze };
    } catch (Ee) {
      const Ce = w(Ee),
        { offchainLookup: Oe, offchainLookupSignature: He } = await Promise.resolve().then(() => jf());
      if (A.ccipRead !== !1 && (Ce == null ? void 0 : Ce.slice(0, 10)) === He && V)
        return { data: await Oe(A, { data: Ce, to: V }) };
      throw ie && (Ce == null ? void 0 : Ce.slice(0, 10)) === "0x101bb98d"
        ? new c.CounterfactualDeploymentFailedError({ factory: M })
        : (0, h.getCallError)(Ee, { ...B, account: X, chain: A.chain });
    }
  }
  function j({ request: A }) {
    const { data: B, to: R, ...S } = A;
    return !(
      !B ||
      B.startsWith(o.aggregate3Signature) ||
      !R ||
      Object.values(S).filter((x) => typeof x < "u").length > 0
    );
  }
  async function p(A, B) {
    var $;
    const {
        batchSize: R = 1024,
        deployless: S = !1,
        wait: x = 0,
      } = typeof (($ = A.batch) == null ? void 0 : $.multicall) == "object" ? A.batch.multicall : {},
      { blockNumber: F, blockTag: H = A.experimental_blockTag ?? "latest", data: T, to: k } = B,
      O = (() => {
        if (S) return null;
        if (B.multicallAddress) return B.multicallAddress;
        if (A.chain) return (0, m.getChainContractAddress)({ blockNumber: F, chain: A.chain, contract: "multicall3" });
        throw new a.ClientChainNotConfiguredError();
      })(),
      q = (typeof F == "bigint" ? (0, g.numberToHex)(F) : void 0) || H,
      { schedule: M } = (0, _.createBatchScheduler)({
        id: `${A.uid}.${q}`,
        wait: x,
        shouldSplitBatch(U) {
          return U.reduce((Z, { data: K }) => Z + (K.length - 2), 0) > R * 2;
        },
        fn: async (U) => {
          const G = U.map((V) => ({ allowFailure: !0, callData: V.data, target: V.to })),
            Z = (0, f.encodeFunctionData)({ abi: t.multicall3Abi, args: [G], functionName: "aggregate3" }),
            K = await A.request({
              method: "eth_call",
              params: [
                { ...(O === null ? { data: y({ code: s.multicall3Bytecode, data: Z }) } : { to: O, data: Z }) },
                q,
              ],
            });
          return (0, u.decodeFunctionResult)({
            abi: t.multicall3Abi,
            args: [G],
            functionName: "aggregate3",
            data: K || "0x",
          });
        },
      }),
      [{ returnData: N, success: z }] = await M({ data: T, to: k });
    if (!z) throw new c.RawContractError({ data: N });
    return N === "0x" ? { data: void 0 } : { data: N };
  }
  function y(A) {
    const { code: B, data: R } = A;
    return (0, l.encodeDeployData)({
      abi: (0, e.parseAbi)(["constructor(bytes, bytes)"]),
      bytecode: s.deploylessCallViaBytecodeBytecode,
      args: [B, R],
    });
  }
  function I(A) {
    const { data: B, factory: R, factoryData: S, to: x } = A;
    return (0, l.encodeDeployData)({
      abi: (0, e.parseAbi)(["constructor(address, bytes, address, bytes)"]),
      bytecode: s.deploylessCallViaFactoryBytecode,
      args: [x, B, R, S],
    });
  }
  function w(A) {
    var R;
    if (!(A instanceof i.BaseError)) return;
    const B = A.walk();
    return typeof (B == null ? void 0 : B.data) == "object" ? ((R = B.data) == null ? void 0 : R.data) : B.data;
  }
  return co;
}
var Tb;
function Ot() {
  if (Tb) return _a;
  ((Tb = 1), Object.defineProperty(_a, "__esModule", { value: !0 }), (_a.readContract = s));
  const e = Rt(),
    r = We(),
    n = fr(),
    t = me(),
    o = jn();
  async function s(i, a) {
    const { abi: c, address: u, args: l, functionName: f, ...m } = a,
      g = (0, r.encodeFunctionData)({ abi: c, args: l, functionName: f });
    try {
      const { data: h } = await (0, t.getAction)(i, o.call, "call")({ ...m, data: g, to: u });
      return (0, e.decodeFunctionResult)({ abi: c, args: l, functionName: f, data: h || "0x" });
    } catch (h) {
      throw (0, n.getContractError)(h, {
        abi: c,
        address: u,
        args: l,
        docsPath: "/docs/contract/readContract",
        functionName: f,
      });
    }
  }
  return _a;
}
var Ra = {},
  Sb;
function jg() {
  if (Sb) return Ra;
  ((Sb = 1), Object.defineProperty(Ra, "__esModule", { value: !0 }), (Ra.simulateContract = i));
  const e = Ie(),
    r = Rt(),
    n = We(),
    t = fr(),
    o = me(),
    s = jn();
  async function i(a, c) {
    var _;
    const {
        abi: u,
        address: l,
        args: f,
        functionName: m,
        dataSuffix: g = typeof a.dataSuffix == "string" ? a.dataSuffix : (_ = a.dataSuffix) == null ? void 0 : _.value,
        ...h
      } = c,
      b = h.account ? (0, e.parseAccount)(h.account) : a.account,
      v = (0, n.encodeFunctionData)({ abi: u, args: f, functionName: m });
    try {
      const { data: E } = await (0, o.getAction)(
          a,
          s.call,
          "call",
        )({ batch: !1, data: `${v}${g ? g.replace("0x", "") : ""}`, to: l, ...h, account: b }),
        P = (0, r.decodeFunctionResult)({ abi: u, args: f, functionName: m, data: E || "0x" }),
        d = u.filter((j) => "name" in j && j.name === c.functionName);
      return { result: P, request: { abi: d, address: l, args: f, dataSuffix: g, functionName: m, ...h, account: b } };
    } catch (E) {
      throw (0, t.getContractError)(E, {
        abi: u,
        address: l,
        args: f,
        docsPath: "/docs/contract/simulateContract",
        functionName: m,
        sender: b == null ? void 0 : b.address,
      });
    }
  }
  return Ra;
}
var Ba = {},
  Md = {},
  Ib;
function Vr() {
  return (
    Ib ||
      ((Ib = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.cleanupCache = e.listenersCache = void 0),
          (e.observe = n),
          (e.listenersCache = new Map()),
          (e.cleanupCache = new Map()));
        let r = 0;
        function n(t, o, s) {
          const i = ++r,
            a = () => e.listenersCache.get(t) || [],
            c = () => {
              const g = a();
              e.listenersCache.set(
                t,
                g.filter((h) => h.id !== i),
              );
            },
            u = () => {
              const g = a();
              if (!g.some((b) => b.id === i)) return;
              const h = e.cleanupCache.get(t);
              if (g.length === 1 && h) {
                const b = h();
                b instanceof Promise && b.catch(() => {});
              }
              c();
            },
            l = a();
          if ((e.listenersCache.set(t, [...l, { id: i, fns: o }]), l && l.length > 0)) return u;
          const f = {};
          for (const g in o)
            f[g] = (...h) => {
              var v, _;
              const b = a();
              if (b.length !== 0) for (const E of b) (_ = (v = E.fns)[g]) == null || _.call(v, ...h);
            };
          const m = s(f);
          return (typeof m == "function" && e.cleanupCache.set(t, m), u);
        }
      })(Md)),
    Md
  );
}
var Oa = {},
  xa = {},
  Rb;
function wf() {
  if (Rb) return xa;
  ((Rb = 1), Object.defineProperty(xa, "__esModule", { value: !0 }), (xa.wait = e));
  async function e(r) {
    return new Promise((n) => setTimeout(n, r));
  }
  return xa;
}
var Bb;
function wn() {
  if (Bb) return Oa;
  ((Bb = 1), Object.defineProperty(Oa, "__esModule", { value: !0 }), (Oa.poll = r));
  const e = wf();
  function r(n, { emitOnBegin: t, initialWaitTime: o, interval: s }) {
    let i = !0;
    const a = () => (i = !1);
    return (
      (async () => {
        let u;
        t && (u = await n({ unpoll: a }));
        const l = (await (o == null ? void 0 : o(u))) ?? s;
        await (0, e.wait)(l);
        const f = async () => {
          i && (await n({ unpoll: a }), await (0, e.wait)(s), f());
        };
        f();
      })(),
      a
    );
  }
  return Oa;
}
var ho = {},
  Hd = {},
  Ob;
function wg() {
  return (
    Ob ||
      ((Ob = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.responseCache = e.promiseCache = void 0),
          (e.getCache = r),
          (e.withCache = n),
          (e.promiseCache = new Map()),
          (e.responseCache = new Map()));
        function r(t) {
          const o = (a, c) => ({ clear: () => c.delete(a), get: () => c.get(a), set: (u) => c.set(a, u) }),
            s = o(t, e.promiseCache),
            i = o(t, e.responseCache);
          return {
            clear: () => {
              (s.clear(), i.clear());
            },
            promise: s,
            response: i,
          };
        }
        async function n(t, { cacheKey: o, cacheTime: s = Number.POSITIVE_INFINITY }) {
          const i = r(o),
            a = i.response.get();
          if (a && s > 0 && Date.now() - a.created.getTime() < s) return a.data;
          let c = i.promise.get();
          c || ((c = t()), i.promise.set(c));
          try {
            const u = await c;
            return (i.response.set({ created: new Date(), data: u }), u);
          } finally {
            i.promise.clear();
          }
        }
      })(Hd)),
    Hd
  );
}
var xb;
function Zo() {
  if (xb) return ho;
  ((xb = 1),
    Object.defineProperty(ho, "__esModule", { value: !0 }),
    (ho.getBlockNumberCache = n),
    (ho.getBlockNumber = t));
  const e = wg(),
    r = (o) => `blockNumber.${o}`;
  function n(o) {
    return (0, e.getCache)(r(o));
  }
  async function t(o, { cacheTime: s = o.cacheTime } = {}) {
    const i = await (0, e.withCache)(() => o.request({ method: "eth_blockNumber" }), {
      cacheKey: r(o.uid),
      cacheTime: s,
    });
    return BigInt(i);
  }
  return ho;
}
var Ca = {},
  Cb;
function Uu() {
  if (Cb) return Ca;
  ((Cb = 1), Object.defineProperty(Ca, "__esModule", { value: !0 }), (Ca.getFilterChanges = n));
  const e = Go(),
    r = It();
  async function n(t, { filter: o }) {
    const s = "strict" in o && o.strict,
      i = await o.request({ method: "eth_getFilterChanges", params: [o.id] });
    if (typeof i[0] == "string") return i;
    const a = i.map((c) => (0, r.formatLog)(c));
    return !("abi" in o) || !o.abi ? a : (0, e.parseEventLogs)({ abi: o.abi, logs: a, strict: s });
  }
  return Ca;
}
var qa = {},
  qb;
function Lu() {
  if (qb) return qa;
  ((qb = 1), Object.defineProperty(qa, "__esModule", { value: !0 }), (qa.uninstallFilter = e));
  async function e(r, { filter: n }) {
    return n.request({ method: "eth_uninstallFilter", params: [n.id] });
  }
  return qa;
}
var Mb;
function Pg() {
  if (Mb) return Ba;
  ((Mb = 1), Object.defineProperty(Ba, "__esModule", { value: !0 }), (Ba.watchContractEvent = h));
  const e = Se(),
    r = dr(),
    n = Do(),
    t = zr(),
    o = It(),
    s = me(),
    i = Vr(),
    a = wn(),
    c = Fe(),
    u = Xd(),
    l = Zo(),
    f = hf(),
    m = Uu(),
    g = Lu();
  function h(b, v) {
    const {
      abi: _,
      address: E,
      args: P,
      batch: d = !0,
      eventName: j,
      fromBlock: p,
      onError: y,
      onLogs: I,
      poll: w,
      pollingInterval: A = b.pollingInterval,
      strict: B,
    } = v;
    return (
      typeof w < "u"
        ? w
        : typeof p == "bigint"
          ? !0
          : !(
              b.transport.type === "webSocket" ||
              b.transport.type === "ipc" ||
              (b.transport.type === "fallback" &&
                (b.transport.transports[0].config.type === "webSocket" ||
                  b.transport.transports[0].config.type === "ipc"))
            )
    )
      ? (() => {
          const F = B ?? !1,
            H = (0, c.stringify)(["watchContractEvent", E, P, d, b.uid, j, A, F, p]);
          return (0, i.observe)(H, { onLogs: I, onError: y }, (T) => {
            let k;
            p !== void 0 && (k = p - 1n);
            let O,
              C = !1;
            const q = (0, a.poll)(
              async () => {
                var M;
                if (!C) {
                  try {
                    O = await (0, s.getAction)(
                      b,
                      u.createContractEventFilter,
                      "createContractEventFilter",
                    )({ abi: _, address: E, args: P, eventName: j, strict: F, fromBlock: p });
                  } catch {}
                  C = !0;
                  return;
                }
                try {
                  let N;
                  if (O) N = await (0, s.getAction)(b, m.getFilterChanges, "getFilterChanges")({ filter: O });
                  else {
                    const z = await (0, s.getAction)(b, l.getBlockNumber, "getBlockNumber")({});
                    (k && k < z
                      ? (N = await (0, s.getAction)(
                          b,
                          f.getContractEvents,
                          "getContractEvents",
                        )({ abi: _, address: E, args: P, eventName: j, fromBlock: k + 1n, toBlock: z, strict: F }))
                      : (N = []),
                      (k = z));
                  }
                  if (N.length === 0) return;
                  if (d) T.onLogs(N);
                  else for (const z of N) T.onLogs([z]);
                } catch (N) {
                  (O && N instanceof r.InvalidInputRpcError && (C = !1), (M = T.onError) == null || M.call(T, N));
                }
              },
              { emitOnBegin: !0, interval: A },
            );
            return async () => {
              (O && (await (0, s.getAction)(b, g.uninstallFilter, "uninstallFilter")({ filter: O })), q());
            };
          });
        })()
      : (() => {
          const F = B ?? !1,
            H = (0, c.stringify)(["watchContractEvent", E, P, d, b.uid, j, A, F]);
          let T = !0,
            k = () => (T = !1);
          return (0, i.observe)(
            H,
            { onLogs: I, onError: y },
            (O) => (
              (async () => {
                try {
                  const C = (() => {
                      if (b.transport.type === "fallback") {
                        const N = b.transport.transports.find(
                          (z) => z.config.type === "webSocket" || z.config.type === "ipc",
                        );
                        return N ? N.value : b.transport;
                      }
                      return b.transport;
                    })(),
                    q = j ? (0, t.encodeEventTopics)({ abi: _, eventName: j, args: P }) : [],
                    { unsubscribe: M } = await C.subscribe({
                      params: ["logs", { address: E, topics: q }],
                      onData(N) {
                        var $;
                        if (!T) return;
                        const z = N.result;
                        try {
                          const { eventName: U, args: G } = (0, n.decodeEventLog)({
                              abi: _,
                              data: z.data,
                              topics: z.topics,
                              strict: B,
                            }),
                            Z = (0, o.formatLog)(z, { args: G, eventName: U });
                          O.onLogs([Z]);
                        } catch (U) {
                          let G, Z;
                          if (U instanceof e.DecodeLogDataMismatch || U instanceof e.DecodeLogTopicsMismatch) {
                            if (B) return;
                            ((G = U.abiItem.name),
                              (Z = ($ = U.abiItem.inputs) == null ? void 0 : $.some((V) => !("name" in V && V.name))));
                          }
                          const K = (0, o.formatLog)(z, { args: Z ? [] : {}, eventName: G });
                          O.onLogs([K]);
                        }
                      },
                      onError(N) {
                        var z;
                        (z = O.onError) == null || z.call(O, N);
                      },
                    });
                  ((k = M), T || k());
                } catch (C) {
                  y == null || y(C);
                }
              })(),
              () => k()
            ),
          );
        })();
  }
  return Ba;
}
var yo = {},
  Sr = {},
  Hb;
function yr() {
  if (Hb) return Sr;
  ((Hb = 1),
    Object.defineProperty(Sr, "__esModule", { value: !0 }),
    (Sr.AccountTypeNotSupportedError = Sr.AccountNotFoundError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ docsPath: o } = {}) {
      super(
        [
          "Could not find an Account to execute with this Action.",
          "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.",
        ].join(`
`),
        { docsPath: o, docsSlug: "account", name: "AccountNotFoundError" },
      );
    }
  }
  Sr.AccountNotFoundError = r;
  class n extends e.BaseError {
    constructor({ docsPath: o, metaMessages: s, type: i }) {
      super(`Account type "${i}" is not supported.`, {
        docsPath: o,
        metaMessages: s,
        name: "AccountTypeNotSupportedError",
      });
    }
  }
  return ((Sr.AccountTypeNotSupportedError = n), Sr);
}
var Ma = {},
  Ha = {},
  kb;
function Jo() {
  if (kb) return Ha;
  ((kb = 1), Object.defineProperty(Ha, "__esModule", { value: !0 }), (Ha.assertCurrentChain = r));
  const e = Wo();
  function r({ chain: n, currentChainId: t }) {
    if (!n) throw new e.ChainNotFoundError();
    if (t !== n.id) throw new e.ChainMismatchError({ chain: n, currentChainId: t });
  }
  return Ha;
}
var ka = {},
  Fb;
function Pf() {
  if (Fb) return ka;
  ((Fb = 1), Object.defineProperty(ka, "__esModule", { value: !0 }), (ka.sendRawTransaction = e));
  async function e(r, { serializedTransaction: n }) {
    return r.request({ method: "eth_sendRawTransaction", params: [n] }, { retryCount: 0 });
  }
  return ka;
}
var Nb;
function Du() {
  if (Nb) return Ma;
  ((Nb = 1), Object.defineProperty(Ma, "__esModule", { value: !0 }), (Ma.sendTransaction = v));
  const e = Ie(),
    r = yr(),
    n = ue(),
    t = Fo(),
    o = Jo(),
    s = qe(),
    i = Uo(),
    a = br(),
    c = jt(),
    u = me(),
    l = Nr(),
    f = wt(),
    m = mr(),
    g = Lo(),
    h = Pf(),
    b = new l.LruMap(128);
  async function v(_, E) {
    var q, M, N, z, $;
    const {
      account: P = _.account,
      assertChainId: d = !0,
      chain: j = _.chain,
      accessList: p,
      authorizationList: y,
      blobs: I,
      data: w,
      dataSuffix: A = typeof _.dataSuffix == "string" ? _.dataSuffix : (q = _.dataSuffix) == null ? void 0 : q.value,
      gas: B,
      gasPrice: R,
      maxFeePerBlobGas: S,
      maxFeePerGas: x,
      maxPriorityFeePerGas: F,
      nonce: H,
      type: T,
      value: k,
      ...O
    } = E;
    if (typeof P > "u") throw new r.AccountNotFoundError({ docsPath: "/docs/actions/wallet/sendTransaction" });
    const C = P ? (0, e.parseAccount)(P) : null;
    try {
      (0, f.assertRequest)(E);
      const U = await (async () => {
        if (E.to) return E.to;
        if (E.to !== null && y && y.length > 0)
          return await (0, t.recoverAuthorizationAddress)({ authorization: y[0] }).catch(() => {
            throw new n.BaseError("`to` is required. Could not infer from `authorizationList`.");
          });
      })();
      if ((C == null ? void 0 : C.type) === "json-rpc" || C === null) {
        let G;
        j !== null &&
          ((G = await (0, u.getAction)(_, m.getChainId, "getChainId")({})),
          d && (0, o.assertCurrentChain)({ currentChainId: G, chain: j }));
        const Z =
            (z = (N = (M = _.chain) == null ? void 0 : M.formatters) == null ? void 0 : N.transactionRequest) == null
              ? void 0
              : z.format,
          V = (Z || c.formatTransactionRequest)(
            {
              ...(0, a.extract)(O, { format: Z }),
              accessList: p,
              account: C,
              authorizationList: y,
              blobs: I,
              chainId: G,
              data: A ? (0, s.concat)([w ?? "0x", A]) : w,
              gas: B,
              gasPrice: R,
              maxFeePerBlobGas: S,
              maxFeePerGas: x,
              maxPriorityFeePerGas: F,
              nonce: H,
              to: U,
              type: T,
              value: k,
            },
            "sendTransaction",
          ),
          Y = b.get(_.uid),
          re = Y ? "wallet_sendTransaction" : "eth_sendTransaction";
        try {
          return await _.request({ method: re, params: [V] }, { retryCount: 0 });
        } catch (J) {
          if (Y === !1) throw J;
          const X = J;
          if (
            X.name === "InvalidInputRpcError" ||
            X.name === "InvalidParamsRpcError" ||
            X.name === "MethodNotFoundRpcError" ||
            X.name === "MethodNotSupportedRpcError"
          )
            return await _.request({ method: "wallet_sendTransaction", params: [V] }, { retryCount: 0 })
              .then((Q) => (b.set(_.uid, !0), Q))
              .catch((Q) => {
                const oe = Q;
                throw oe.name === "MethodNotFoundRpcError" || oe.name === "MethodNotSupportedRpcError"
                  ? (b.set(_.uid, !1), X)
                  : oe;
              });
          throw X;
        }
      }
      if ((C == null ? void 0 : C.type) === "local") {
        const G = await (0, u.getAction)(
            _,
            g.prepareTransactionRequest,
            "prepareTransactionRequest",
          )({
            account: C,
            accessList: p,
            authorizationList: y,
            blobs: I,
            chain: j,
            data: A ? (0, s.concat)([w ?? "0x", A]) : w,
            gas: B,
            gasPrice: R,
            maxFeePerBlobGas: S,
            maxFeePerGas: x,
            maxPriorityFeePerGas: F,
            nonce: H,
            nonceManager: C.nonceManager,
            parameters: [...g.defaultParameters, "sidecars"],
            type: T,
            value: k,
            ...O,
            to: U,
          }),
          Z = ($ = j == null ? void 0 : j.serializers) == null ? void 0 : $.transaction,
          K = await C.signTransaction(G, { serializer: Z });
        return await (0, u.getAction)(_, h.sendRawTransaction, "sendRawTransaction")({ serializedTransaction: K });
      }
      throw (C == null ? void 0 : C.type) === "smart"
        ? new r.AccountTypeNotSupportedError({
            metaMessages: ["Consider using the `sendUserOperation` Action instead."],
            docsPath: "/docs/actions/bundler/sendUserOperation",
            type: "smart",
          })
        : new r.AccountTypeNotSupportedError({
            docsPath: "/docs/actions/wallet/sendTransaction",
            type: C == null ? void 0 : C.type,
          });
    } catch (U) {
      throw U instanceof r.AccountTypeNotSupportedError
        ? U
        : (0, i.getTransactionError)(U, { ...E, account: C, chain: E.chain || void 0 });
    }
  }
  return Ma;
}
var $b;
function Af() {
  if ($b) return yo;
  (($b = 1), Object.defineProperty(yo, "__esModule", { value: !0 }), (yo.writeContract = i));
  const e = Ie(),
    r = yr(),
    n = We(),
    t = fr(),
    o = me(),
    s = Du();
  async function i(a, c) {
    return i.internal(a, s.sendTransaction, "sendTransaction", c);
  }
  return (
    (function (a) {
      async function c(u, l, f, m) {
        const { abi: g, account: h = u.account, address: b, args: v, functionName: _, ...E } = m;
        if (typeof h > "u") throw new r.AccountNotFoundError({ docsPath: "/docs/contract/writeContract" });
        const P = h ? (0, e.parseAccount)(h) : null,
          d = (0, n.encodeFunctionData)({ abi: g, args: v, functionName: _ });
        try {
          return await (0, o.getAction)(u, l, f)({ data: d, to: b, account: P, ...E });
        } catch (j) {
          throw (0, t.getContractError)(j, {
            abi: g,
            address: b,
            args: v,
            docsPath: "/docs/contract/writeContract",
            functionName: _,
            sender: P == null ? void 0 : P.address,
          });
        }
      }
      a.internal = c;
    })(i || (yo.writeContract = i = {})),
    yo
  );
}
var zb;
function Jv() {
  if (zb) return Jr;
  ((zb = 1),
    Object.defineProperty(Jr, "__esModule", { value: !0 }),
    (Jr.getContract = c),
    (Jr.getFunctionParameters = u),
    (Jr.getEventParameters = l));
  const e = me(),
    r = Xd(),
    n = gg(),
    t = hf(),
    o = Ot(),
    s = jg(),
    i = Pg(),
    a = Af();
  function c({ abi: f, address: m, client: g }) {
    const h = g,
      [b, v] = h
        ? "public" in h && "wallet" in h
          ? [h.public, h.wallet]
          : "public" in h
            ? [h.public, void 0]
            : "wallet" in h
              ? [void 0, h.wallet]
              : [h, h]
        : [void 0, void 0],
      _ = b != null,
      E = v != null,
      P = {};
    let d = !1,
      j = !1,
      p = !1;
    for (const y of f)
      if (
        (y.type === "function"
          ? y.stateMutability === "view" || y.stateMutability === "pure"
            ? (d = !0)
            : (j = !0)
          : y.type === "event" && (p = !0),
        d && j && p)
      )
        break;
    return (
      _ &&
        (d &&
          (P.read = new Proxy(
            {},
            {
              get(y, I) {
                return (...w) => {
                  const { args: A, options: B } = u(w);
                  return (0, e.getAction)(
                    b,
                    o.readContract,
                    "readContract",
                  )({ abi: f, address: m, functionName: I, args: A, ...B });
                };
              },
            },
          )),
        j &&
          (P.simulate = new Proxy(
            {},
            {
              get(y, I) {
                return (...w) => {
                  const { args: A, options: B } = u(w);
                  return (0, e.getAction)(
                    b,
                    s.simulateContract,
                    "simulateContract",
                  )({ abi: f, address: m, functionName: I, args: A, ...B });
                };
              },
            },
          )),
        p &&
          ((P.createEventFilter = new Proxy(
            {},
            {
              get(y, I) {
                return (...w) => {
                  const A = f.find((S) => S.type === "event" && S.name === I),
                    { args: B, options: R } = l(w, A);
                  return (0, e.getAction)(
                    b,
                    r.createContractEventFilter,
                    "createContractEventFilter",
                  )({ abi: f, address: m, eventName: I, args: B, ...R });
                };
              },
            },
          )),
          (P.getEvents = new Proxy(
            {},
            {
              get(y, I) {
                return (...w) => {
                  const A = f.find((S) => S.type === "event" && S.name === I),
                    { args: B, options: R } = l(w, A);
                  return (0, e.getAction)(
                    b,
                    t.getContractEvents,
                    "getContractEvents",
                  )({ abi: f, address: m, eventName: I, args: B, ...R });
                };
              },
            },
          )),
          (P.watchEvent = new Proxy(
            {},
            {
              get(y, I) {
                return (...w) => {
                  const A = f.find((S) => S.type === "event" && S.name === I),
                    { args: B, options: R } = l(w, A);
                  return (0, e.getAction)(
                    b,
                    i.watchContractEvent,
                    "watchContractEvent",
                  )({ abi: f, address: m, eventName: I, args: B, ...R });
                };
              },
            },
          )))),
      E &&
        j &&
        (P.write = new Proxy(
          {},
          {
            get(y, I) {
              return (...w) => {
                const { args: A, options: B } = u(w);
                return (0, e.getAction)(
                  v,
                  a.writeContract,
                  "writeContract",
                )({ abi: f, address: m, functionName: I, args: A, ...B });
              };
            },
          },
        )),
      (_ || E) &&
        j &&
        (P.estimateGas = new Proxy(
          {},
          {
            get(y, I) {
              return (...w) => {
                const { args: A, options: B } = u(w),
                  R = b ?? v;
                return (0, e.getAction)(
                  R,
                  n.estimateContractGas,
                  "estimateContractGas",
                )({ abi: f, address: m, functionName: I, args: A, ...B, account: B.account ?? v.account });
              };
            },
          },
        )),
      (P.address = m),
      (P.abi = f),
      P
    );
  }
  function u(f) {
    const m = f.length && Array.isArray(f[0]),
      g = m ? f[0] : [],
      h = (m ? f[1] : f[0]) ?? {};
    return { args: g, options: h };
  }
  function l(f, m) {
    let g = !1;
    Array.isArray(f[0])
      ? (g = !0)
      : f.length === 1
        ? (g = m.inputs.some((v) => v.indexed))
        : f.length === 2 && (g = !0);
    const h = g ? f[0] : void 0,
      b = (g ? f[1] : f[0]) ?? {};
    return { args: h, options: b };
  }
  return Jr;
}
var cn = {},
  po = {},
  Ub;
function Ag() {
  if (Ub) return po;
  ((Ub = 1), Object.defineProperty(po, "__esModule", { value: !0 }), (po.BundleFailedError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor(t) {
      (super(`Call bundle failed with status: ${t.statusCode}`, { name: "BundleFailedError" }),
        Object.defineProperty(this, "result", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.result = t));
    }
  }
  return ((po.BundleFailedError = r), po);
}
var Fa = {},
  Lb;
function Gu() {
  if (Lb) return Fa;
  ((Lb = 1), Object.defineProperty(Fa, "__esModule", { value: !0 }), (Fa.withRetry = r));
  const e = wf();
  function r(n, { delay: t = 100, retryCount: o = 2, shouldRetry: s = () => !0 } = {}) {
    return new Promise((i, a) => {
      const c = async ({ count: u = 0 } = {}) => {
        const l = async ({ error: f }) => {
          const m = typeof t == "function" ? t({ count: u, error: f }) : t;
          (m && (await (0, e.wait)(m)), c({ count: u + 1 }));
        };
        try {
          const f = await n();
          i(f);
        } catch (f) {
          if (u < o && (await s({ count: u, error: f }))) return l({ error: f });
          a(f);
        }
      };
      c();
    });
  }
  return Fa;
}
var Na = {},
  kd = {},
  Db;
function Yo() {
  return (
    Db ||
      ((Db = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.defineTransactionReceipt = e.receiptStatuses = void 0),
          (e.formatTransactionReceipt = s));
        const r = Be(),
          n = $o(),
          t = It(),
          o = En();
        e.receiptStatuses = { "0x0": "reverted", "0x1": "success" };
        function s(i, a) {
          const c = {
            ...i,
            blockNumber: i.blockNumber ? BigInt(i.blockNumber) : null,
            contractAddress: i.contractAddress ? i.contractAddress : null,
            cumulativeGasUsed: i.cumulativeGasUsed ? BigInt(i.cumulativeGasUsed) : null,
            effectiveGasPrice: i.effectiveGasPrice ? BigInt(i.effectiveGasPrice) : null,
            gasUsed: i.gasUsed ? BigInt(i.gasUsed) : null,
            logs: i.logs ? i.logs.map((u) => (0, t.formatLog)(u)) : null,
            to: i.to ? i.to : null,
            transactionIndex: i.transactionIndex ? (0, r.hexToNumber)(i.transactionIndex) : null,
            status: i.status ? e.receiptStatuses[i.status] : null,
            type: i.type ? o.transactionType[i.type] || i.type : null,
          };
          return (
            i.blobGasPrice && (c.blobGasPrice = BigInt(i.blobGasPrice)),
            i.blobGasUsed && (c.blobGasUsed = BigInt(i.blobGasUsed)),
            c
          );
        }
        e.defineTransactionReceipt = (0, n.defineFormatter)("transactionReceipt", s);
      })(kd)),
    kd
  );
}
var Fd = {},
  Gb;
function Tf() {
  return (
    Gb ||
      ((Gb = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.fallbackTransactionErrorMagicIdentifier = e.fallbackMagicIdentifier = void 0),
          (e.sendCalls = l));
        const r = Ie(),
          n = ue(),
          t = dr(),
          o = We(),
          s = qe(),
          i = Be(),
          a = te(),
          c = Uo(),
          u = Du();
        ((e.fallbackMagicIdentifier = "0x5792579257925792579257925792579257925792579257925792579257925792"),
          (e.fallbackTransactionErrorMagicIdentifier = (0, a.numberToHex)(0, { size: 32 })));
        async function l(f, m) {
          var y;
          const {
              account: g = f.account,
              chain: h = f.chain,
              experimental_fallback: b,
              experimental_fallbackDelay: v = 32,
              forceAtomic: _ = !1,
              id: E,
              version: P = "2.0.0",
            } = m,
            d = g ? (0, r.parseAccount)(g) : null;
          let j = m.capabilities;
          f.dataSuffix &&
            !((y = m.capabilities) != null && y.dataSuffix) &&
            (typeof f.dataSuffix == "string"
              ? (j = { ...m.capabilities, dataSuffix: { value: f.dataSuffix, optional: !0 } })
              : (j = {
                  ...m.capabilities,
                  dataSuffix: { value: f.dataSuffix.value, ...(f.dataSuffix.required ? {} : { optional: !0 }) },
                }));
          const p = m.calls.map((I) => {
            const w = I,
              A = w.abi
                ? (0, o.encodeFunctionData)({ abi: w.abi, functionName: w.functionName, args: w.args })
                : w.data;
            return {
              data: w.dataSuffix && A ? (0, s.concat)([A, w.dataSuffix]) : A,
              to: w.to,
              value: w.value ? (0, a.numberToHex)(w.value) : void 0,
            };
          });
          try {
            const I = await f.request(
              {
                method: "wallet_sendCalls",
                params: [
                  {
                    atomicRequired: _,
                    calls: p,
                    capabilities: j,
                    chainId: (0, a.numberToHex)(h.id),
                    from: d == null ? void 0 : d.address,
                    id: E,
                    version: P,
                  },
                ],
              },
              { retryCount: 0 },
            );
            return typeof I == "string" ? { id: I } : I;
          } catch (I) {
            const w = I;
            if (
              b &&
              (w.name === "MethodNotFoundRpcError" ||
                w.name === "MethodNotSupportedRpcError" ||
                w.name === "UnknownRpcError" ||
                w.details.toLowerCase().includes("does not exist / is not available") ||
                w.details.toLowerCase().includes("missing or invalid. request()") ||
                w.details.toLowerCase().includes("did not match any variant of untagged enum") ||
                w.details.toLowerCase().includes("account upgraded to unsupported contract") ||
                w.details.toLowerCase().includes("eip-7702 not supported") ||
                w.details.toLowerCase().includes("unsupported wc_ method") ||
                w.details.toLowerCase().includes("feature toggled misconfigured") ||
                w.details.toLowerCase().includes("jsonrpcengine: response has no error or result for request"))
            ) {
              if (j && Object.values(j).some((x) => !x.optional)) {
                const x = "non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.";
                throw new t.UnsupportedNonOptionalCapabilityError(new n.BaseError(x, { details: x }));
              }
              if (_ && p.length > 1) {
                const S = "`forceAtomic` is not supported on fallback to `eth_sendTransaction`.";
                throw new t.AtomicityNotSupportedError(new n.BaseError(S, { details: S }));
              }
              const A = [];
              for (const S of p) {
                const x = (0, u.sendTransaction)(f, {
                  account: d,
                  chain: h,
                  data: S.data,
                  to: S.to,
                  value: S.value ? (0, i.hexToBigInt)(S.value) : void 0,
                });
                (A.push(x), v > 0 && (await new Promise((F) => setTimeout(F, v))));
              }
              const B = await Promise.allSettled(A);
              if (B.every((S) => S.status === "rejected")) throw B[0].reason;
              const R = B.map((S) => (S.status === "fulfilled" ? S.value : e.fallbackTransactionErrorMagicIdentifier));
              return { id: (0, s.concat)([...R, (0, a.numberToHex)(h.id, { size: 32 }), e.fallbackMagicIdentifier]) };
            }
            throw (0, c.getTransactionError)(I, { ...m, account: d, chain: m.chain });
          }
        }
      })(Fd)),
    Fd
  );
}
var Vb;
function Tg() {
  if (Vb) return Na;
  ((Vb = 1), Object.defineProperty(Na, "__esModule", { value: !0 }), (Na.getCallsStatus = s));
  const e = st(),
    r = Wt(),
    n = Be(),
    t = Yo(),
    o = Tf();
  async function s(i, a) {
    async function c(v) {
      if (v.endsWith(o.fallbackMagicIdentifier.slice(2))) {
        const E = (0, r.trim)((0, e.sliceHex)(v, -64, -32)),
          P = (0, e.sliceHex)(v, 0, -64)
            .slice(2)
            .match(/.{1,64}/g),
          d = await Promise.all(
            P.map((p) =>
              o.fallbackTransactionErrorMagicIdentifier.slice(2) !== p
                ? i.request({ method: "eth_getTransactionReceipt", params: [`0x${p}`] }, { dedupe: !0 })
                : void 0,
            ),
          ),
          j = d.some((p) => p === null)
            ? 100
            : d.every((p) => (p == null ? void 0 : p.status) === "0x1")
              ? 200
              : d.every((p) => (p == null ? void 0 : p.status) === "0x0")
                ? 500
                : 600;
        return { atomic: !1, chainId: (0, n.hexToNumber)(E), receipts: d.filter(Boolean), status: j, version: "2.0.0" };
      }
      return i.request({ method: "wallet_getCallsStatus", params: [v] });
    }
    const { atomic: u = !1, chainId: l, receipts: f, version: m = "2.0.0", ...g } = await c(a.id),
      [h, b] = (() => {
        const v = g.status;
        return v >= 100 && v < 200
          ? ["pending", v]
          : v >= 200 && v < 300
            ? ["success", v]
            : v >= 300 && v < 700
              ? ["failure", v]
              : v === "CONFIRMED"
                ? ["success", 200]
                : v === "PENDING"
                  ? ["pending", 100]
                  : [void 0, v];
      })();
    return {
      ...g,
      atomic: u,
      chainId: l ? (0, n.hexToNumber)(l) : void 0,
      receipts:
        (f == null
          ? void 0
          : f.map((v) => ({
              ...v,
              blockNumber: (0, n.hexToBigInt)(v.blockNumber),
              gasUsed: (0, n.hexToBigInt)(v.gasUsed),
              status: t.receiptStatuses[v.status],
            }))) ?? [],
      statusCode: b,
      status: h,
      version: m,
    };
  }
  return Na;
}
var Wb;
function Sf() {
  if (Wb) return cn;
  ((Wb = 1),
    Object.defineProperty(cn, "__esModule", { value: !0 }),
    (cn.WaitForCallsStatusTimeoutError = void 0),
    (cn.waitForCallsStatus = u));
  const e = ue(),
    r = Ag(),
    n = me(),
    t = Vr(),
    o = wn(),
    s = pf(),
    i = Gu(),
    a = Fe(),
    c = Tg();
  async function u(f, m) {
    const {
        id: g,
        pollingInterval: h = f.pollingInterval,
        status: b = ({ statusCode: A }) => A === 200 || A >= 300,
        retryCount: v = 4,
        retryDelay: _ = ({ count: A }) => ~~(1 << A) * 200,
        timeout: E = 6e4,
        throwOnFailure: P = !1,
      } = m,
      d = (0, a.stringify)(["waitForCallsStatus", f.uid, g]),
      { promise: j, resolve: p, reject: y } = (0, s.withResolvers)();
    let I;
    const w = (0, t.observe)(d, { resolve: p, reject: y }, (A) => {
      const B = (0, o.poll)(
        async () => {
          const R = (S) => {
            (clearTimeout(I), B(), S(), w());
          };
          try {
            const S = await (0, i.withRetry)(
              async () => {
                const x = await (0, n.getAction)(f, c.getCallsStatus, "getCallsStatus")({ id: g });
                if (P && x.status === "failure") throw new r.BundleFailedError(x);
                return x;
              },
              { retryCount: v, delay: _ },
            );
            if (!b(S)) return;
            R(() => A.resolve(S));
          } catch (S) {
            R(() => A.reject(S));
          }
        },
        { interval: h, emitOnBegin: !0 },
      );
      return B;
    });
    return (
      (I = E
        ? setTimeout(() => {
            (w(), clearTimeout(I), y(new l({ id: g })));
          }, E)
        : void 0),
      await j
    );
  }
  class l extends e.BaseError {
    constructor({ id: m }) {
      super(`Timed out while waiting for call bundle with id "${m}" to be confirmed.`, {
        name: "WaitForCallsStatusTimeoutError",
      });
    }
  }
  return ((cn.WaitForCallsStatusTimeoutError = l), cn);
}
var go = {},
  $a = {},
  Kb;
function Sg() {
  if (Kb) return $a;
  ((Kb = 1), Object.defineProperty($a, "__esModule", { value: !0 }), ($a.uid = t));
  const e = 256;
  let r = e,
    n;
  function t(o = 11) {
    if (!n || r + o > e * 2) {
      ((n = ""), (r = 0));
      for (let s = 0; s < e; s++) n += ((256 + Math.random() * 256) | 0).toString(16).substring(1);
    }
    return n.substring(r, r++ + o);
  }
  return $a;
}
var Zb;
function Vu() {
  if (Zb) return go;
  ((Zb = 1), Object.defineProperty(go, "__esModule", { value: !0 }), (go.createClient = n), (go.rpcSchema = t));
  const e = Ie(),
    r = Sg();
  function n(o) {
    const {
        batch: s,
        chain: i,
        ccipRead: a,
        dataSuffix: c,
        key: u = "base",
        name: l = "Base Client",
        type: f = "base",
      } = o,
      m =
        o.experimental_blockTag ??
        (typeof (i == null ? void 0 : i.experimental_preconfirmationTime) == "number" ? "pending" : void 0),
      g = (i == null ? void 0 : i.blockTime) ?? 12e3,
      h = Math.min(Math.max(Math.floor(g / 2), 500), 4e3),
      b = o.pollingInterval ?? h,
      v = o.cacheTime ?? b,
      _ = o.account ? (0, e.parseAccount)(o.account) : void 0,
      { config: E, request: P, value: d } = o.transport({ account: _, chain: i, pollingInterval: b }),
      j = { ...E, ...d },
      p = {
        account: _,
        batch: s,
        cacheTime: v,
        ccipRead: a,
        chain: i,
        dataSuffix: c,
        key: u,
        name: l,
        pollingInterval: b,
        request: P,
        transport: j,
        type: f,
        uid: (0, r.uid)(),
        ...(m ? { experimental_blockTag: m } : {}),
      };
    function y(I) {
      return (w) => {
        const A = w(I);
        for (const R in p) delete A[R];
        const B = { ...I, ...A };
        return Object.assign(B, { extend: y(B) });
      };
    }
    return Object.assign(p, { extend: y(p) });
  }
  function t() {
    return null;
  }
  return go;
}
var za = {},
  Ua = {},
  La = {},
  Da = {},
  Jb;
function If() {
  if (Jb) return Da;
  ((Jb = 1), Object.defineProperty(Da, "__esModule", { value: !0 }), (Da.isNullUniversalResolverError = n));
  const e = ue(),
    r = ur();
  function n(t) {
    var s, i, a, c, u, l;
    if (!(t instanceof e.BaseError)) return !1;
    const o = t.walk((f) => f instanceof r.ContractFunctionRevertedError);
    return o instanceof r.ContractFunctionRevertedError
      ? ((s = o.data) == null ? void 0 : s.errorName) === "HttpError" ||
          ((i = o.data) == null ? void 0 : i.errorName) === "ResolverError" ||
          ((a = o.data) == null ? void 0 : a.errorName) === "ResolverNotContract" ||
          ((c = o.data) == null ? void 0 : c.errorName) === "ResolverNotFound" ||
          ((u = o.data) == null ? void 0 : u.errorName) === "ReverseAddressMismatch" ||
          ((l = o.data) == null ? void 0 : l.errorName) === "UnsupportedResolverProfile"
      : !1;
  }
  return Da;
}
var Ga = {},
  Va = {},
  Yb;
function Ig() {
  if (Yb) return Va;
  ((Yb = 1), Object.defineProperty(Va, "__esModule", { value: !0 }), (Va.encodedLabelToLabelhash = r));
  const e = Ge();
  function r(n) {
    if (n.length !== 66 || n.indexOf("[") !== 0 || n.indexOf("]") !== 65) return null;
    const t = `0x${n.slice(1, 65)}`;
    return (0, e.isHex)(t) ? t : null;
  }
  return Va;
}
var Xb;
function Rf() {
  if (Xb) return Ga;
  ((Xb = 1), Object.defineProperty(Ga, "__esModule", { value: !0 }), (Ga.namehash = s));
  const e = qe(),
    r = ve(),
    n = te(),
    t = Xe(),
    o = Ig();
  function s(i) {
    let a = new Uint8Array(32).fill(0);
    if (!i) return (0, n.bytesToHex)(a);
    const c = i.split(".");
    for (let u = c.length - 1; u >= 0; u -= 1) {
      const l = (0, o.encodedLabelToLabelhash)(c[u]),
        f = l ? (0, r.toBytes)(l) : (0, t.keccak256)((0, r.stringToBytes)(c[u]), "bytes");
      a = (0, t.keccak256)((0, e.concat)([a, f]), "bytes");
    }
    return (0, n.bytesToHex)(a);
  }
  return Ga;
}
var Wa = {},
  Ka = {},
  Qb;
function Yv() {
  if (Qb) return Ka;
  ((Qb = 1), Object.defineProperty(Ka, "__esModule", { value: !0 }), (Ka.encodeLabelhash = e));
  function e(r) {
    return `[${r.slice(2)}]`;
  }
  return Ka;
}
var Za = {},
  em;
function Rg() {
  if (em) return Za;
  ((em = 1), Object.defineProperty(Za, "__esModule", { value: !0 }), (Za.labelhash = o));
  const e = ve(),
    r = te(),
    n = Xe(),
    t = Ig();
  function o(s) {
    const i = new Uint8Array(32).fill(0);
    return s ? (0, t.encodedLabelToLabelhash)(s) || (0, n.keccak256)((0, e.stringToBytes)(s)) : (0, r.bytesToHex)(i);
  }
  return Za;
}
var tm;
function Bf() {
  if (tm) return Wa;
  ((tm = 1), Object.defineProperty(Wa, "__esModule", { value: !0 }), (Wa.packetToBytes = t));
  const e = ve(),
    r = Yv(),
    n = Rg();
  function t(o) {
    const s = o.replace(/^\.|\.$/gm, "");
    if (s.length === 0) return new Uint8Array(1);
    const i = new Uint8Array((0, e.stringToBytes)(s).byteLength + 2);
    let a = 0;
    const c = s.split(".");
    for (let u = 0; u < c.length; u++) {
      let l = (0, e.stringToBytes)(c[u]);
      (l.byteLength > 255 && (l = (0, e.stringToBytes)((0, r.encodeLabelhash)((0, n.labelhash)(c[u])))),
        (i[a] = l.length),
        i.set(l, a + 1),
        (a += l.length + 1));
    }
    return i.byteLength !== a + 1 ? i.slice(0, a + 1) : i;
  }
  return Wa;
}
var rm;
function Xv() {
  if (rm) return La;
  ((rm = 1), Object.defineProperty(La, "__esModule", { value: !0 }), (La.getEnsAddress = m));
  const e = Jt(),
    r = Rt(),
    n = We(),
    t = hr(),
    o = Wt(),
    s = te(),
    i = If(),
    a = zu(),
    c = Rf(),
    u = Bf(),
    l = me(),
    f = Ot();
  async function m(g, h) {
    const { blockNumber: b, blockTag: v, coinType: _, name: E, gatewayUrls: P, strict: d } = h,
      { chain: j } = g,
      p = (() => {
        if (h.universalResolverAddress) return h.universalResolverAddress;
        if (!j) throw new Error("client chain not configured. universalResolverAddress is required.");
        return (0, t.getChainContractAddress)({ blockNumber: b, chain: j, contract: "ensUniversalResolver" });
      })(),
      y = j == null ? void 0 : j.ensTlds;
    if (y && !y.some((w) => E.endsWith(w))) return null;
    const I = _ != null ? [(0, c.namehash)(E), BigInt(_)] : [(0, c.namehash)(E)];
    try {
      const w = (0, n.encodeFunctionData)({ abi: e.addressResolverAbi, functionName: "addr", args: I }),
        A = {
          address: p,
          abi: e.universalResolverResolveAbi,
          functionName: "resolveWithGateways",
          args: [(0, s.toHex)((0, u.packetToBytes)(E)), w, P ?? [a.localBatchGatewayUrl]],
          blockNumber: b,
          blockTag: v,
        },
        R = await (0, l.getAction)(g, f.readContract, "readContract")(A);
      if (R[0] === "0x") return null;
      const S = (0, r.decodeFunctionResult)({ abi: e.addressResolverAbi, args: I, functionName: "addr", data: R[0] });
      return S === "0x" || (0, o.trim)(S) === "0x00" ? null : S;
    } catch (w) {
      if (d) throw w;
      if ((0, i.isNullUniversalResolverError)(w)) return null;
      throw w;
    }
  }
  return La;
}
var Ja = {},
  Ya = {},
  pt = {},
  it = {},
  nm;
function Of() {
  if (nm) return it;
  ((nm = 1),
    Object.defineProperty(it, "__esModule", { value: !0 }),
    (it.EnsInvalidChainIdError =
      it.EnsAvatarUnsupportedNamespaceError =
      it.EnsAvatarUriResolutionError =
      it.EnsAvatarInvalidNftUriError =
      it.EnsAvatarInvalidMetadataError =
        void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ data: a }) {
      super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
        metaMessages: [
          "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
          "",
          `Provided data: ${JSON.stringify(a)}`,
        ],
        name: "EnsAvatarInvalidMetadataError",
      });
    }
  }
  it.EnsAvatarInvalidMetadataError = r;
  class n extends e.BaseError {
    constructor({ reason: a }) {
      super(`ENS NFT avatar URI is invalid. ${a}`, { name: "EnsAvatarInvalidNftUriError" });
    }
  }
  it.EnsAvatarInvalidNftUriError = n;
  class t extends e.BaseError {
    constructor({ uri: a }) {
      super(
        `Unable to resolve ENS avatar URI "${a}". The URI may be malformed, invalid, or does not respond with a valid image.`,
        { name: "EnsAvatarUriResolutionError" },
      );
    }
  }
  it.EnsAvatarUriResolutionError = t;
  class o extends e.BaseError {
    constructor({ namespace: a }) {
      super(`ENS NFT avatar namespace "${a}" is not supported. Must be "erc721" or "erc1155".`, {
        name: "EnsAvatarUnsupportedNamespaceError",
      });
    }
  }
  it.EnsAvatarUnsupportedNamespaceError = o;
  class s extends e.BaseError {
    constructor({ chainId: a }) {
      super(`Invalid ENSIP-11 chainId: ${a}. Must be between 0 and 0x7fffffff, or 1.`, {
        name: "EnsInvalidChainIdError",
      });
    }
  }
  return ((it.EnsInvalidChainIdError = s), it);
}
var om;
function Qv() {
  if (om) return pt;
  ((om = 1),
    Object.defineProperty(pt, "__esModule", { value: !0 }),
    (pt.isImageUri = i),
    (pt.getGateway = a),
    (pt.resolveAvatarUri = c),
    (pt.getJsonImage = u),
    (pt.getMetadataAvatarUri = l),
    (pt.parseAvatarUri = f),
    (pt.parseNftUri = m),
    (pt.getNftTokenUri = g));
  const e = Ot(),
    r = Of(),
    n =
      /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/,
    t =
      /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/,
    o = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/,
    s = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
  async function i(h) {
    try {
      const b = await fetch(h, { method: "HEAD" });
      if (b.status === 200) {
        const v = b.headers.get("content-type");
        return v == null ? void 0 : v.startsWith("image/");
      }
      return !1;
    } catch (b) {
      return (typeof b == "object" && typeof b.response < "u") || !Object.hasOwn(globalThis, "Image")
        ? !1
        : new Promise((v) => {
            const _ = new Image();
            ((_.onload = () => {
              v(!0);
            }),
              (_.onerror = () => {
                v(!1);
              }),
              (_.src = h));
          });
    }
  }
  function a(h, b) {
    return h ? (h.endsWith("/") ? h.slice(0, -1) : h) : b;
  }
  function c({ uri: h, gatewayUrls: b }) {
    const v = o.test(h);
    if (v) return { uri: h, isOnChain: !0, isEncoded: v };
    const _ = a(b == null ? void 0 : b.ipfs, "https://ipfs.io"),
      E = a(b == null ? void 0 : b.arweave, "https://arweave.net"),
      P = h.match(n),
      { protocol: d, subpath: j, target: p, subtarget: y = "" } = (P == null ? void 0 : P.groups) || {},
      I = d === "ipns:/" || j === "ipns/",
      w = d === "ipfs:/" || j === "ipfs/" || t.test(h);
    if (h.startsWith("http") && !I && !w) {
      let B = h;
      return (
        b != null && b.arweave && (B = h.replace(/https:\/\/arweave.net/g, b == null ? void 0 : b.arweave)),
        { uri: B, isOnChain: !1, isEncoded: !1 }
      );
    }
    if ((I || w) && p) return { uri: `${_}/${I ? "ipns" : "ipfs"}/${p}${y}`, isOnChain: !1, isEncoded: !1 };
    if (d === "ar:/" && p) return { uri: `${E}/${p}${y || ""}`, isOnChain: !1, isEncoded: !1 };
    let A = h.replace(s, "");
    if (
      (A.startsWith("<svg") && (A = `data:image/svg+xml;base64,${btoa(A)}`), A.startsWith("data:") || A.startsWith("{"))
    )
      return { uri: A, isOnChain: !0, isEncoded: !1 };
    throw new r.EnsAvatarUriResolutionError({ uri: h });
  }
  function u(h) {
    if (typeof h != "object" || (!("image" in h) && !("image_url" in h) && !("image_data" in h)))
      throw new r.EnsAvatarInvalidMetadataError({ data: h });
    return h.image || h.image_url || h.image_data;
  }
  async function l({ gatewayUrls: h, uri: b }) {
    try {
      const v = await fetch(b).then((E) => E.json());
      return await f({ gatewayUrls: h, uri: u(v) });
    } catch {
      throw new r.EnsAvatarUriResolutionError({ uri: b });
    }
  }
  async function f({ gatewayUrls: h, uri: b }) {
    const { uri: v, isOnChain: _ } = c({ uri: b, gatewayUrls: h });
    if (_ || (await i(v))) return v;
    throw new r.EnsAvatarUriResolutionError({ uri: b });
  }
  function m(h) {
    let b = h;
    b.startsWith("did:nft:") && (b = b.replace("did:nft:", "").replace(/_/g, "/"));
    const [v, _, E] = b.split("/"),
      [P, d] = v.split(":"),
      [j, p] = _.split(":");
    if (!P || P.toLowerCase() !== "eip155")
      throw new r.EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
    if (!d) throw new r.EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
    if (!p) throw new r.EnsAvatarInvalidNftUriError({ reason: "Contract address not found" });
    if (!E) throw new r.EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
    if (!j) throw new r.EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
    return { chainID: Number.parseInt(d, 10), namespace: j.toLowerCase(), contractAddress: p, tokenID: E };
  }
  async function g(h, { nft: b }) {
    if (b.namespace === "erc721")
      return (0, e.readContract)(h, {
        address: b.contractAddress,
        abi: [
          {
            name: "tokenURI",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "tokenId", type: "uint256" }],
            outputs: [{ name: "", type: "string" }],
          },
        ],
        functionName: "tokenURI",
        args: [BigInt(b.tokenID)],
      });
    if (b.namespace === "erc1155")
      return (0, e.readContract)(h, {
        address: b.contractAddress,
        abi: [
          {
            name: "uri",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "_id", type: "uint256" }],
            outputs: [{ name: "", type: "string" }],
          },
        ],
        functionName: "uri",
        args: [BigInt(b.tokenID)],
      });
    throw new r.EnsAvatarUnsupportedNamespaceError({ namespace: b.namespace });
  }
  return pt;
}
var im;
function e6() {
  if (im) return Ya;
  ((im = 1), Object.defineProperty(Ya, "__esModule", { value: !0 }), (Ya.parseAvatarRecord = r));
  const e = Qv();
  async function r(t, { gatewayUrls: o, record: s }) {
    return /eip155:/i.test(s) ? n(t, { gatewayUrls: o, record: s }) : (0, e.parseAvatarUri)({ uri: s, gatewayUrls: o });
  }
  async function n(t, { gatewayUrls: o, record: s }) {
    const i = (0, e.parseNftUri)(s),
      a = await (0, e.getNftTokenUri)(t, { nft: i }),
      { uri: c, isOnChain: u, isEncoded: l } = (0, e.resolveAvatarUri)({ uri: a, gatewayUrls: o });
    if (u && (c.includes("data:application/json;base64,") || c.startsWith("{"))) {
      const m = l ? atob(c.replace("data:application/json;base64,", "")) : c,
        g = JSON.parse(m);
      return (0, e.parseAvatarUri)({ uri: (0, e.getJsonImage)(g), gatewayUrls: o });
    }
    let f = i.tokenID;
    return (
      i.namespace === "erc1155" && (f = f.replace("0x", "").padStart(64, "0")),
      (0, e.getMetadataAvatarUri)({ gatewayUrls: o, uri: c.replace(/(?:0x)?{id}/, f) })
    );
  }
  return Ya;
}
var Xa = {},
  am;
function Bg() {
  if (am) return Xa;
  ((am = 1), Object.defineProperty(Xa, "__esModule", { value: !0 }), (Xa.getEnsText = f));
  const e = Jt(),
    r = Rt(),
    n = We(),
    t = hr(),
    o = te(),
    s = If(),
    i = zu(),
    a = Rf(),
    c = Bf(),
    u = me(),
    l = Ot();
  async function f(m, g) {
    const { blockNumber: h, blockTag: b, key: v, name: _, gatewayUrls: E, strict: P } = g,
      { chain: d } = m,
      j = (() => {
        if (g.universalResolverAddress) return g.universalResolverAddress;
        if (!d) throw new Error("client chain not configured. universalResolverAddress is required.");
        return (0, t.getChainContractAddress)({ blockNumber: h, chain: d, contract: "ensUniversalResolver" });
      })(),
      p = d == null ? void 0 : d.ensTlds;
    if (p && !p.some((y) => _.endsWith(y))) return null;
    try {
      const y = {
          address: j,
          abi: e.universalResolverResolveAbi,
          args: [
            (0, o.toHex)((0, c.packetToBytes)(_)),
            (0, n.encodeFunctionData)({ abi: e.textResolverAbi, functionName: "text", args: [(0, a.namehash)(_), v] }),
            E ?? [i.localBatchGatewayUrl],
          ],
          functionName: "resolveWithGateways",
          blockNumber: h,
          blockTag: b,
        },
        w = await (0, u.getAction)(m, l.readContract, "readContract")(y);
      if (w[0] === "0x") return null;
      const A = (0, r.decodeFunctionResult)({ abi: e.textResolverAbi, functionName: "text", data: w[0] });
      return A === "" ? null : A;
    } catch (y) {
      if (P) throw y;
      if ((0, s.isNullUniversalResolverError)(y)) return null;
      throw y;
    }
  }
  return Xa;
}
var sm;
function t6() {
  if (sm) return Ja;
  ((sm = 1), Object.defineProperty(Ja, "__esModule", { value: !0 }), (Ja.getEnsAvatar = t));
  const e = e6(),
    r = me(),
    n = Bg();
  async function t(
    o,
    {
      blockNumber: s,
      blockTag: i,
      assetGatewayUrls: a,
      name: c,
      gatewayUrls: u,
      strict: l,
      universalResolverAddress: f,
    },
  ) {
    const m = await (0, r.getAction)(
      o,
      n.getEnsText,
      "getEnsText",
    )({ blockNumber: s, blockTag: i, key: "avatar", name: c, universalResolverAddress: f, gatewayUrls: u, strict: l });
    if (!m) return null;
    try {
      return await (0, e.parseAvatarRecord)(o, { record: m, gatewayUrls: a });
    } catch {
      return null;
    }
  }
  return Ja;
}
var Qa = {},
  cm;
function r6() {
  if (cm) return Qa;
  ((cm = 1), Object.defineProperty(Qa, "__esModule", { value: !0 }), (Qa.getEnsName = i));
  const e = Jt(),
    r = hr(),
    n = If(),
    t = zu(),
    o = me(),
    s = Ot();
  async function i(a, c) {
    const { address: u, blockNumber: l, blockTag: f, coinType: m = 60n, gatewayUrls: g, strict: h } = c,
      { chain: b } = a,
      v = (() => {
        if (c.universalResolverAddress) return c.universalResolverAddress;
        if (!b) throw new Error("client chain not configured. universalResolverAddress is required.");
        return (0, r.getChainContractAddress)({ blockNumber: l, chain: b, contract: "ensUniversalResolver" });
      })();
    try {
      const _ = {
          address: v,
          abi: e.universalResolverReverseAbi,
          args: [u, m, g ?? [t.localBatchGatewayUrl]],
          functionName: "reverseWithGateways",
          blockNumber: l,
          blockTag: f,
        },
        E = (0, o.getAction)(a, s.readContract, "readContract"),
        [P] = await E(_);
      return P || null;
    } catch (_) {
      if (h) throw _;
      if ((0, n.isNullUniversalResolverError)(_)) return null;
      throw _;
    }
  }
  return Qa;
}
var es = {},
  um;
function n6() {
  if (um) return es;
  ((um = 1), Object.defineProperty(es, "__esModule", { value: !0 }), (es.getEnsResolver = s));
  const e = hr(),
    r = te(),
    n = Bf(),
    t = me(),
    o = Ot();
  async function s(i, a) {
    const { blockNumber: c, blockTag: u, name: l } = a,
      { chain: f } = i,
      m = (() => {
        if (a.universalResolverAddress) return a.universalResolverAddress;
        if (!f) throw new Error("client chain not configured. universalResolverAddress is required.");
        return (0, e.getChainContractAddress)({ blockNumber: c, chain: f, contract: "ensUniversalResolver" });
      })(),
      g = f == null ? void 0 : f.ensTlds;
    if (g && !g.some((b) => l.endsWith(b)))
      throw new Error(
        `${l} is not a valid ENS TLD (${g == null ? void 0 : g.join(", ")}) for chain "${f.name}" (id: ${f.id}).`,
      );
    const [h] = await (0, t.getAction)(
      i,
      o.readContract,
      "readContract",
    )({
      address: m,
      abi: [
        {
          inputs: [{ type: "bytes" }],
          name: "findResolver",
          outputs: [{ type: "address" }, { type: "bytes32" }, { type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "findResolver",
      args: [(0, r.toHex)((0, n.packetToBytes)(l))],
      blockNumber: c,
      blockTag: u,
    });
    return h;
  }
  return es;
}
var ts = {},
  dm;
function Og() {
  if (dm) return ts;
  ((dm = 1), Object.defineProperty(ts, "__esModule", { value: !0 }), (ts.createAccessList = i));
  const e = Ie(),
    r = te(),
    n = yf(),
    t = br(),
    o = jt(),
    s = wt();
  async function i(a, c) {
    var y, I, w;
    const {
        account: u = a.account,
        blockNumber: l,
        blockTag: f = "latest",
        blobs: m,
        data: g,
        gas: h,
        gasPrice: b,
        maxFeePerBlobGas: v,
        maxFeePerGas: _,
        maxPriorityFeePerGas: E,
        to: P,
        value: d,
        ...j
      } = c,
      p = u ? (0, e.parseAccount)(u) : void 0;
    try {
      (0, s.assertRequest)(c);
      const B = (typeof l == "bigint" ? (0, r.numberToHex)(l) : void 0) || f,
        R =
          (w = (I = (y = a.chain) == null ? void 0 : y.formatters) == null ? void 0 : I.transactionRequest) == null
            ? void 0
            : w.format,
        x = (R || o.formatTransactionRequest)(
          {
            ...(0, t.extract)(j, { format: R }),
            account: p,
            blobs: m,
            data: g,
            gas: h,
            gasPrice: b,
            maxFeePerBlobGas: v,
            maxFeePerGas: _,
            maxPriorityFeePerGas: E,
            to: P,
            value: d,
          },
          "createAccessList",
        ),
        F = await a.request({ method: "eth_createAccessList", params: [x, B] });
      return { accessList: F.accessList, gasUsed: BigInt(F.gasUsed) };
    } catch (A) {
      throw (0, n.getCallError)(A, { ...c, account: p, chain: a.chain });
    }
  }
  return ts;
}
var rs = {},
  fm;
function o6() {
  if (fm) return rs;
  ((fm = 1), Object.defineProperty(rs, "__esModule", { value: !0 }), (rs.createBlockFilter = r));
  const e = Bu();
  async function r(n) {
    const t = (0, e.createFilterRequestScope)(n, { method: "eth_newBlockFilter" }),
      o = await n.request({ method: "eth_newBlockFilter" });
    return { id: o, request: t(o), type: "block" };
  }
  return rs;
}
var ns = {},
  lm;
function xg() {
  if (lm) return ns;
  ((lm = 1), Object.defineProperty(ns, "__esModule", { value: !0 }), (ns.createEventFilter = t));
  const e = zr(),
    r = te(),
    n = Bu();
  async function t(o, { address: s, args: i, event: a, events: c, fromBlock: u, strict: l, toBlock: f } = {}) {
    const m = c ?? (a ? [a] : void 0),
      g = (0, n.createFilterRequestScope)(o, { method: "eth_newFilter" });
    let h = [];
    m &&
      ((h = [m.flatMap((_) => (0, e.encodeEventTopics)({ abi: [_], eventName: _.name, args: i }))]), a && (h = h[0]));
    const b = await o.request({
      method: "eth_newFilter",
      params: [
        {
          address: s,
          fromBlock: typeof u == "bigint" ? (0, r.numberToHex)(u) : u,
          toBlock: typeof f == "bigint" ? (0, r.numberToHex)(f) : f,
          ...(h.length ? { topics: h } : {}),
        },
      ],
    });
    return {
      abi: m,
      args: i,
      eventName: a ? a.name : void 0,
      fromBlock: u,
      id: b,
      request: g(b),
      strict: !!l,
      toBlock: f,
      type: "event",
    };
  }
  return ns;
}
var os = {},
  bm;
function Cg() {
  if (bm) return os;
  ((bm = 1), Object.defineProperty(os, "__esModule", { value: !0 }), (os.createPendingTransactionFilter = r));
  const e = Bu();
  async function r(n) {
    const t = (0, e.createFilterRequestScope)(n, { method: "eth_newPendingTransactionFilter" }),
      o = await n.request({ method: "eth_newPendingTransactionFilter" });
    return { id: o, request: t(o), type: "transaction" };
  }
  return os;
}
var is = {},
  mm;
function i6() {
  if (mm) return is;
  ((mm = 1), Object.defineProperty(is, "__esModule", { value: !0 }), (is.getBalance = i));
  const e = Jt(),
    r = Rt(),
    n = We(),
    t = te(),
    o = me(),
    s = jn();
  async function i(a, { address: c, blockNumber: u, blockTag: l = a.experimental_blockTag ?? "latest" }) {
    var g, h, b;
    if (
      (g = a.batch) != null &&
      g.multicall &&
      (b = (h = a.chain) == null ? void 0 : h.contracts) != null &&
      b.multicall3
    ) {
      const v = a.chain.contracts.multicall3.address,
        _ = (0, n.encodeFunctionData)({ abi: e.multicall3Abi, functionName: "getEthBalance", args: [c] }),
        { data: E } = await (0, o.getAction)(a, s.call, "call")({ to: v, data: _, blockNumber: u, blockTag: l });
      return (0, r.decodeFunctionResult)({
        abi: e.multicall3Abi,
        functionName: "getEthBalance",
        args: [c],
        data: E || "0x",
      });
    }
    const f = typeof u == "bigint" ? (0, t.numberToHex)(u) : void 0,
      m = await a.request({ method: "eth_getBalance", params: [c, f || l] });
    return BigInt(m);
  }
  return is;
}
var as = {},
  hm;
function a6() {
  if (hm) return as;
  ((hm = 1), Object.defineProperty(as, "__esModule", { value: !0 }), (as.getBlobBaseFee = e));
  async function e(r) {
    const n = await r.request({ method: "eth_blobBaseFee" });
    return BigInt(n);
  }
  return as;
}
var ss = {},
  ym;
function s6() {
  if (ym) return ss;
  ((ym = 1), Object.defineProperty(ss, "__esModule", { value: !0 }), (ss.getBlockTransactionCount = n));
  const e = Be(),
    r = te();
  async function n(t, { blockHash: o, blockNumber: s, blockTag: i = "latest" } = {}) {
    const a = s !== void 0 ? (0, r.numberToHex)(s) : void 0;
    let c;
    return (
      o
        ? (c = await t.request({ method: "eth_getBlockTransactionCountByHash", params: [o] }, { dedupe: !0 }))
        : (c = await t.request({ method: "eth_getBlockTransactionCountByNumber", params: [a || i] }, { dedupe: !!a })),
      (0, e.hexToNumber)(c)
    );
  }
  return ss;
}
var cs = {},
  pm;
function xf() {
  if (pm) return cs;
  ((pm = 1), Object.defineProperty(cs, "__esModule", { value: !0 }), (cs.getCode = r));
  const e = te();
  async function r(n, { address: t, blockNumber: o, blockTag: s = "latest" }) {
    const i = o !== void 0 ? (0, e.numberToHex)(o) : void 0,
      a = await n.request({ method: "eth_getCode", params: [t, i || s] }, { dedupe: !!i });
    if (a !== "0x") return a;
  }
  return cs;
}
var us = {},
  gm;
function c6() {
  if (gm) return us;
  ((gm = 1), Object.defineProperty(us, "__esModule", { value: !0 }), (us.getDelegation = o));
  const e = Qe(),
    r = Ve(),
    n = st(),
    t = xf();
  async function o(s, { address: i, blockNumber: a, blockTag: c = "latest" }) {
    const u = await (0, t.getCode)(s, { address: i, ...(a !== void 0 ? { blockNumber: a } : { blockTag: c }) });
    if (u && (0, r.size)(u) === 23 && u.startsWith("0xef0100")) return (0, e.getAddress)((0, n.slice)(u, 3, 23));
  }
  return us;
}
var ds = {},
  _o = {},
  _m;
function u6() {
  if (_m) return _o;
  ((_m = 1), Object.defineProperty(_o, "__esModule", { value: !0 }), (_o.Eip712DomainNotFoundError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ address: t }) {
      super(`No EIP-712 domain found on contract "${t}".`, {
        metaMessages: [
          "Ensure that:",
          `- The contract is deployed at the address "${t}".`,
          "- `eip712Domain()` function exists on the contract.",
          "- `eip712Domain()` function matches signature to ERC-5267 specification.",
        ],
        name: "Eip712DomainNotFoundError",
      });
    }
  }
  return ((_o.Eip712DomainNotFoundError = r), _o);
}
var vm;
function d6() {
  if (vm) return ds;
  ((vm = 1), Object.defineProperty(ds, "__esModule", { value: !0 }), (ds.getEip712Domain = t));
  const e = u6(),
    r = me(),
    n = Ot();
  async function t(s, i) {
    const { address: a, factory: c, factoryData: u } = i;
    try {
      const [l, f, m, g, h, b, v] = await (0, r.getAction)(
        s,
        n.readContract,
        "readContract",
      )({ abi: o, address: a, functionName: "eip712Domain", factory: c, factoryData: u });
      return {
        domain: { name: f, version: m, chainId: Number(g), verifyingContract: h, salt: b },
        extensions: v,
        fields: l,
      };
    } catch (l) {
      const f = l;
      throw f.name === "ContractFunctionExecutionError" && f.cause.name === "ContractFunctionZeroDataError"
        ? new e.Eip712DomainNotFoundError({ address: a })
        : f;
    }
  }
  const o = [
    {
      inputs: [],
      name: "eip712Domain",
      outputs: [
        { name: "fields", type: "bytes1" },
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
        { name: "extensions", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  return ds;
}
var fs = {},
  ls = {},
  Em;
function f6() {
  if (Em) return ls;
  ((Em = 1), Object.defineProperty(ls, "__esModule", { value: !0 }), (ls.formatFeeHistory = e));
  function e(r) {
    var n;
    return {
      baseFeePerGas: r.baseFeePerGas.map((t) => BigInt(t)),
      gasUsedRatio: r.gasUsedRatio,
      oldestBlock: BigInt(r.oldestBlock),
      reward: (n = r.reward) == null ? void 0 : n.map((t) => t.map((o) => BigInt(o))),
    };
  }
  return ls;
}
var jm;
function l6() {
  if (jm) return fs;
  ((jm = 1), Object.defineProperty(fs, "__esModule", { value: !0 }), (fs.getFeeHistory = n));
  const e = te(),
    r = f6();
  async function n(t, { blockCount: o, blockNumber: s, blockTag: i = "latest", rewardPercentiles: a }) {
    const c = typeof s == "bigint" ? (0, e.numberToHex)(s) : void 0,
      u = await t.request({ method: "eth_feeHistory", params: [(0, e.numberToHex)(o), c || i, a] }, { dedupe: !!c });
    return (0, r.formatFeeHistory)(u);
  }
  return fs;
}
var bs = {},
  wm;
function b6() {
  if (wm) return bs;
  ((wm = 1), Object.defineProperty(bs, "__esModule", { value: !0 }), (bs.getFilterLogs = n));
  const e = Go(),
    r = It();
  async function n(t, { filter: o }) {
    const s = o.strict ?? !1,
      a = (await o.request({ method: "eth_getFilterLogs", params: [o.id] })).map((c) => (0, r.formatLog)(c));
    return o.abi ? (0, e.parseEventLogs)({ abi: o.abi, logs: a, strict: s }) : a;
  }
  return bs;
}
var ms = {},
  hs = {},
  Nd = {},
  ys = {},
  Pm;
function qg() {
  if (Pm) return ys;
  ((Pm = 1), Object.defineProperty(ys, "__esModule", { value: !0 }), (ys.encodePacked = a));
  const e = Se(),
    r = _t(),
    n = et(),
    t = qe(),
    o = ar(),
    s = te(),
    i = Ru();
  function a(u, l) {
    if (u.length !== l.length)
      throw new e.AbiEncodingLengthMismatchError({ expectedLength: u.length, givenLength: l.length });
    const f = [];
    for (let m = 0; m < u.length; m++) {
      const g = u[m],
        h = l[m];
      f.push(c(g, h));
    }
    return (0, t.concatHex)(f);
  }
  function c(u, l, f = !1) {
    if (u === "address") {
      const b = l;
      if (!(0, n.isAddress)(b)) throw new r.InvalidAddressError({ address: b });
      return (0, o.pad)(b.toLowerCase(), { size: f ? 32 : null });
    }
    if (u === "string") return (0, s.stringToHex)(l);
    if (u === "bytes") return l;
    if (u === "bool") return (0, o.pad)((0, s.boolToHex)(l), { size: f ? 32 : 1 });
    const m = u.match(i.integerRegex);
    if (m) {
      const [b, v, _ = "256"] = m,
        E = Number.parseInt(_, 10) / 8;
      return (0, s.numberToHex)(l, { size: f ? 32 : E, signed: v === "int" });
    }
    const g = u.match(i.bytesRegex);
    if (g) {
      const [b, v] = g;
      if (Number.parseInt(v, 10) !== (l.length - 2) / 2)
        throw new e.BytesSizeMismatchError({ expectedSize: Number.parseInt(v, 10), givenSize: (l.length - 2) / 2 });
      return (0, o.pad)(l, { dir: "right", size: f ? 32 : null });
    }
    const h = u.match(i.arrayRegex);
    if (h && Array.isArray(l)) {
      const [b, v] = h,
        _ = [];
      for (let E = 0; E < l.length; E++) _.push(c(v, l[E], !0));
      return _.length === 0 ? "0x" : (0, t.concatHex)(_);
    }
    throw new e.UnsupportedPackedAbiType(u);
  }
  return ys;
}
var un = {},
  ps = {},
  Am;
function Cf() {
  if (Am) return ps;
  ((Am = 1), Object.defineProperty(ps, "__esModule", { value: !0 }), (ps.isBytes = e));
  function e(r) {
    return !r || typeof r != "object" || !("BYTES_PER_ELEMENT" in r)
      ? !1
      : r.BYTES_PER_ELEMENT === 1 && r.constructor.name === "Uint8Array";
  }
  return ps;
}
var Tm;
function Mg() {
  if (Tm) return un;
  ((Tm = 1),
    Object.defineProperty(un, "__esModule", { value: !0 }),
    (un.getContractAddress = c),
    (un.getCreateAddress = u),
    (un.getCreate2Address = l));
  const e = qe(),
    r = Cf(),
    n = ar(),
    t = st(),
    o = ve(),
    s = ko(),
    i = Xe(),
    a = Qe();
  function c(f) {
    return f.opcode === "CREATE2" ? l(f) : u(f);
  }
  function u(f) {
    const m = (0, o.toBytes)((0, a.getAddress)(f.from));
    let g = (0, o.toBytes)(f.nonce);
    return (
      g[0] === 0 && (g = new Uint8Array([])),
      (0, a.getAddress)(`0x${(0, i.keccak256)((0, s.toRlp)([m, g], "bytes")).slice(26)}`)
    );
  }
  function l(f) {
    const m = (0, o.toBytes)((0, a.getAddress)(f.from)),
      g = (0, n.pad)((0, r.isBytes)(f.salt) ? f.salt : (0, o.toBytes)(f.salt), { size: 32 }),
      h =
        "bytecodeHash" in f
          ? (0, r.isBytes)(f.bytecodeHash)
            ? f.bytecodeHash
            : (0, o.toBytes)(f.bytecodeHash)
          : (0, i.keccak256)(f.bytecode, "bytes");
    return (0, a.getAddress)((0, t.slice)((0, i.keccak256)((0, e.concat)([(0, o.toBytes)("0xff"), m, g, h])), 12));
  }
  return un;
}
var gs = {},
  vo = {},
  rr = {},
  Sm;
function Wu() {
  if (Sm) return rr;
  ((Sm = 1),
    Object.defineProperty(rr, "__esModule", { value: !0 }),
    (rr.assertTransactionEIP7702 = f),
    (rr.assertTransactionEIP4844 = m),
    (rr.assertTransactionEIP1559 = g),
    (rr.assertTransactionEIP2930 = h),
    (rr.assertTransactionLegacy = b));
  const e = hg(),
    r = af(),
    n = _t(),
    t = ue(),
    o = yg(),
    s = Wo(),
    i = Zt(),
    a = et(),
    c = Ve(),
    u = st(),
    l = Be();
  function f(v) {
    const { authorizationList: _ } = v;
    if (_)
      for (const E of _) {
        const { chainId: P } = E,
          d = E.address;
        if (!(0, a.isAddress)(d)) throw new n.InvalidAddressError({ address: d });
        if (P < 0) throw new s.InvalidChainIdError({ chainId: P });
      }
    g(v);
  }
  function m(v) {
    const { blobVersionedHashes: _ } = v;
    if (_) {
      if (_.length === 0) throw new o.EmptyBlobError();
      for (const E of _) {
        const P = (0, c.size)(E),
          d = (0, l.hexToNumber)((0, u.slice)(E, 0, 1));
        if (P !== 32) throw new o.InvalidVersionedHashSizeError({ hash: E, size: P });
        if (d !== e.versionedHashVersionKzg) throw new o.InvalidVersionedHashVersionError({ hash: E, version: d });
      }
    }
    g(v);
  }
  function g(v) {
    const { chainId: _, maxPriorityFeePerGas: E, maxFeePerGas: P, to: d } = v;
    if (_ <= 0) throw new s.InvalidChainIdError({ chainId: _ });
    if (d && !(0, a.isAddress)(d)) throw new n.InvalidAddressError({ address: d });
    if (P && P > r.maxUint256) throw new i.FeeCapTooHighError({ maxFeePerGas: P });
    if (E && P && E > P) throw new i.TipAboveFeeCapError({ maxFeePerGas: P, maxPriorityFeePerGas: E });
  }
  function h(v) {
    const { chainId: _, maxPriorityFeePerGas: E, gasPrice: P, maxFeePerGas: d, to: j } = v;
    if (_ <= 0) throw new s.InvalidChainIdError({ chainId: _ });
    if (j && !(0, a.isAddress)(j)) throw new n.InvalidAddressError({ address: j });
    if (E || d)
      throw new t.BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
    if (P && P > r.maxUint256) throw new i.FeeCapTooHighError({ maxFeePerGas: P });
  }
  function b(v) {
    const { chainId: _, maxPriorityFeePerGas: E, gasPrice: P, maxFeePerGas: d, to: j } = v;
    if (j && !(0, a.isAddress)(j)) throw new n.InvalidAddressError({ address: j });
    if (typeof _ < "u" && _ <= 0) throw new s.InvalidChainIdError({ chainId: _ });
    if (E || d)
      throw new t.BaseError("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
    if (P && P > r.maxUint256) throw new i.FeeCapTooHighError({ maxFeePerGas: P });
  }
  return rr;
}
var _s = {},
  Im;
function qf() {
  if (Im) return _s;
  ((Im = 1), Object.defineProperty(_s, "__esModule", { value: !0 }), (_s.serializeAccessList = t));
  const e = _t(),
    r = tt(),
    n = et();
  function t(o) {
    if (!o || o.length === 0) return [];
    const s = [];
    for (let i = 0; i < o.length; i++) {
      const { address: a, storageKeys: c } = o[i];
      for (let u = 0; u < c.length; u++)
        if (c[u].length - 2 !== 64) throw new r.InvalidStorageKeySizeError({ storageKey: c[u] });
      if (!(0, n.isAddress)(a, { strict: !1 })) throw new e.InvalidAddressError({ address: a });
      s.push([a, c]);
    }
    return s;
  }
  return _s;
}
var Rm;
function Ku() {
  if (Rm) return vo;
  ((Rm = 1),
    Object.defineProperty(vo, "__esModule", { value: !0 }),
    (vo.serializeTransaction = g),
    (vo.toYParitySignatureArray = P));
  const e = tt(),
    r = Hg(),
    n = Hu(),
    t = ku(),
    o = ff(),
    s = Fu(),
    i = qe(),
    a = Wt(),
    c = te(),
    u = ko(),
    l = Wu(),
    f = Nu(),
    m = qf();
  function g(d, j) {
    const p = (0, f.getTransactionType)(d);
    return p === "eip1559"
      ? v(d, j)
      : p === "eip2930"
        ? _(d, j)
        : p === "eip4844"
          ? b(d, j)
          : p === "eip7702"
            ? h(d, j)
            : E(d, j);
  }
  function h(d, j) {
    const {
      authorizationList: p,
      chainId: y,
      gas: I,
      nonce: w,
      to: A,
      value: B,
      maxFeePerGas: R,
      maxPriorityFeePerGas: S,
      accessList: x,
      data: F,
    } = d;
    (0, l.assertTransactionEIP7702)(d);
    const H = (0, m.serializeAccessList)(x),
      T = (0, r.serializeAuthorizationList)(p);
    return (0, i.concatHex)([
      "0x04",
      (0, u.toRlp)([
        (0, c.numberToHex)(y),
        w ? (0, c.numberToHex)(w) : "0x",
        S ? (0, c.numberToHex)(S) : "0x",
        R ? (0, c.numberToHex)(R) : "0x",
        I ? (0, c.numberToHex)(I) : "0x",
        A ?? "0x",
        B ? (0, c.numberToHex)(B) : "0x",
        F ?? "0x",
        H,
        T,
        ...P(d, j),
      ]),
    ]);
  }
  function b(d, j) {
    const {
      chainId: p,
      gas: y,
      nonce: I,
      to: w,
      value: A,
      maxFeePerBlobGas: B,
      maxFeePerGas: R,
      maxPriorityFeePerGas: S,
      accessList: x,
      data: F,
    } = d;
    (0, l.assertTransactionEIP4844)(d);
    let H = d.blobVersionedHashes,
      T = d.sidecars;
    if (d.blobs && (typeof H > "u" || typeof T > "u")) {
      const N = typeof d.blobs[0] == "string" ? d.blobs : d.blobs.map((U) => (0, c.bytesToHex)(U)),
        z = d.kzg,
        $ = (0, n.blobsToCommitments)({ blobs: N, kzg: z });
      if ((typeof H > "u" && (H = (0, o.commitmentsToVersionedHashes)({ commitments: $ })), typeof T > "u")) {
        const U = (0, t.blobsToProofs)({ blobs: N, commitments: $, kzg: z });
        T = (0, s.toBlobSidecars)({ blobs: N, commitments: $, proofs: U });
      }
    }
    const k = (0, m.serializeAccessList)(x),
      O = [
        (0, c.numberToHex)(p),
        I ? (0, c.numberToHex)(I) : "0x",
        S ? (0, c.numberToHex)(S) : "0x",
        R ? (0, c.numberToHex)(R) : "0x",
        y ? (0, c.numberToHex)(y) : "0x",
        w ?? "0x",
        A ? (0, c.numberToHex)(A) : "0x",
        F ?? "0x",
        k,
        B ? (0, c.numberToHex)(B) : "0x",
        H ?? [],
        ...P(d, j),
      ],
      C = [],
      q = [],
      M = [];
    if (T)
      for (let N = 0; N < T.length; N++) {
        const { blob: z, commitment: $, proof: U } = T[N];
        (C.push(z), q.push($), M.push(U));
      }
    return (0, i.concatHex)(["0x03", T ? (0, u.toRlp)([O, C, q, M]) : (0, u.toRlp)(O)]);
  }
  function v(d, j) {
    const {
      chainId: p,
      gas: y,
      nonce: I,
      to: w,
      value: A,
      maxFeePerGas: B,
      maxPriorityFeePerGas: R,
      accessList: S,
      data: x,
    } = d;
    (0, l.assertTransactionEIP1559)(d);
    const F = (0, m.serializeAccessList)(S),
      H = [
        (0, c.numberToHex)(p),
        I ? (0, c.numberToHex)(I) : "0x",
        R ? (0, c.numberToHex)(R) : "0x",
        B ? (0, c.numberToHex)(B) : "0x",
        y ? (0, c.numberToHex)(y) : "0x",
        w ?? "0x",
        A ? (0, c.numberToHex)(A) : "0x",
        x ?? "0x",
        F,
        ...P(d, j),
      ];
    return (0, i.concatHex)(["0x02", (0, u.toRlp)(H)]);
  }
  function _(d, j) {
    const { chainId: p, gas: y, data: I, nonce: w, to: A, value: B, accessList: R, gasPrice: S } = d;
    (0, l.assertTransactionEIP2930)(d);
    const x = (0, m.serializeAccessList)(R),
      F = [
        (0, c.numberToHex)(p),
        w ? (0, c.numberToHex)(w) : "0x",
        S ? (0, c.numberToHex)(S) : "0x",
        y ? (0, c.numberToHex)(y) : "0x",
        A ?? "0x",
        B ? (0, c.numberToHex)(B) : "0x",
        I ?? "0x",
        x,
        ...P(d, j),
      ];
    return (0, i.concatHex)(["0x01", (0, u.toRlp)(F)]);
  }
  function E(d, j) {
    const { chainId: p = 0, gas: y, data: I, nonce: w, to: A, value: B, gasPrice: R } = d;
    (0, l.assertTransactionLegacy)(d);
    let S = [
      w ? (0, c.numberToHex)(w) : "0x",
      R ? (0, c.numberToHex)(R) : "0x",
      y ? (0, c.numberToHex)(y) : "0x",
      A ?? "0x",
      B ? (0, c.numberToHex)(B) : "0x",
      I ?? "0x",
    ];
    if (j) {
      const x = (() => {
          if (j.v >= 35n) return (j.v - 35n) / 2n > 0 ? j.v : 27n + (j.v === 35n ? 0n : 1n);
          if (p > 0) return BigInt(p * 2) + BigInt(35n + j.v - 27n);
          const T = 27n + (j.v === 27n ? 0n : 1n);
          if (j.v !== T) throw new e.InvalidLegacyVError({ v: j.v });
          return T;
        })(),
        F = (0, a.trim)(j.r),
        H = (0, a.trim)(j.s);
      S = [...S, (0, c.numberToHex)(x), F === "0x00" ? "0x" : F, H === "0x00" ? "0x" : H];
    } else p > 0 && (S = [...S, (0, c.numberToHex)(p), "0x", "0x"]);
    return (0, u.toRlp)(S);
  }
  function P(d, j) {
    const p = j ?? d,
      { v: y, yParity: I } = p;
    if (typeof p.r > "u") return [];
    if (typeof p.s > "u") return [];
    if (typeof y > "u" && typeof I > "u") return [];
    const w = (0, a.trim)(p.r),
      A = (0, a.trim)(p.s);
    return [
      typeof I == "number"
        ? I
          ? (0, c.numberToHex)(1)
          : "0x"
        : y === 0n
          ? "0x"
          : y === 1n
            ? (0, c.numberToHex)(1)
            : y === 27n
              ? "0x"
              : (0, c.numberToHex)(1),
      w === "0x00" ? "0x" : w,
      A === "0x00" ? "0x" : A,
    ];
  }
  return vo;
}
var Bm;
function Hg() {
  if (Bm) return gs;
  ((Bm = 1), Object.defineProperty(gs, "__esModule", { value: !0 }), (gs.serializeAuthorizationList = n));
  const e = te(),
    r = Ku();
  function n(t) {
    if (!t || t.length === 0) return [];
    const o = [];
    for (const s of t) {
      const { chainId: i, nonce: a, ...c } = s,
        u = s.address;
      o.push([i ? (0, e.toHex)(i) : "0x", u, a ? (0, e.toHex)(a) : "0x", ...(0, r.toYParitySignatureArray)({}, c)]);
    }
    return o;
  }
  return gs;
}
var vs = {},
  Om;
function kg() {
  if (Om) return vs;
  ((Om = 1), Object.defineProperty(vs, "__esModule", { value: !0 }), (vs.verifyAuthorization = t));
  const e = Qe(),
    r = Pt(),
    n = Fo();
  async function t({ address: o, authorization: s, signature: i }) {
    return (0, r.isAddressEqual)(
      (0, e.getAddress)(o),
      await (0, n.recoverAuthorizationAddress)({ authorization: s, signature: i }),
    );
  }
  return vs;
}
var Eo = {},
  $d = {},
  xm;
function m6() {
  return (
    xm ||
      ((xm = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.promiseCache = void 0), (e.withDedupe = n));
        const r = Nr();
        e.promiseCache = new r.LruMap(8192);
        function n(t, { enabled: o = !0, id: s }) {
          if (!o || !s) return t();
          if (e.promiseCache.get(s)) return e.promiseCache.get(s);
          const i = t().finally(() => e.promiseCache.delete(s));
          return (e.promiseCache.set(s, i), i);
        }
      })($d)),
    $d
  );
}
var Cm;
function Fg() {
  if (Cm) return Eo;
  ((Cm = 1), Object.defineProperty(Eo, "__esModule", { value: !0 }), (Eo.buildRequest = i), (Eo.shouldRetry = a));
  const e = ue(),
    r = Et(),
    n = dr(),
    t = m6(),
    o = Gu(),
    s = Fe();
  function i(u, l = {}) {
    return async (f, m = {}) => {
      var d;
      const { dedupe: g = !1, methods: h, retryDelay: b = 150, retryCount: v = 3, uid: _ } = { ...l, ...m },
        { method: E } = f;
      if ((d = h == null ? void 0 : h.exclude) != null && d.includes(E))
        throw new n.MethodNotSupportedRpcError(new Error("method not supported"), { method: E });
      if (h != null && h.include && !h.include.includes(E))
        throw new n.MethodNotSupportedRpcError(new Error("method not supported"), { method: E });
      const P = g ? c(`${_}.${(0, s.stringify)(f)}`) : void 0;
      return (0, t.withDedupe)(
        () =>
          (0, o.withRetry)(
            async () => {
              try {
                return await u(f);
              } catch (j) {
                const p = j;
                switch (p.code) {
                  case n.ParseRpcError.code:
                    throw new n.ParseRpcError(p);
                  case n.InvalidRequestRpcError.code:
                    throw new n.InvalidRequestRpcError(p);
                  case n.MethodNotFoundRpcError.code:
                    throw new n.MethodNotFoundRpcError(p, { method: f.method });
                  case n.InvalidParamsRpcError.code:
                    throw new n.InvalidParamsRpcError(p);
                  case n.InternalRpcError.code:
                    throw new n.InternalRpcError(p);
                  case n.InvalidInputRpcError.code:
                    throw new n.InvalidInputRpcError(p);
                  case n.ResourceNotFoundRpcError.code:
                    throw new n.ResourceNotFoundRpcError(p);
                  case n.ResourceUnavailableRpcError.code:
                    throw new n.ResourceUnavailableRpcError(p);
                  case n.TransactionRejectedRpcError.code:
                    throw new n.TransactionRejectedRpcError(p);
                  case n.MethodNotSupportedRpcError.code:
                    throw new n.MethodNotSupportedRpcError(p, { method: f.method });
                  case n.LimitExceededRpcError.code:
                    throw new n.LimitExceededRpcError(p);
                  case n.JsonRpcVersionUnsupportedError.code:
                    throw new n.JsonRpcVersionUnsupportedError(p);
                  case n.UserRejectedRequestError.code:
                    throw new n.UserRejectedRequestError(p);
                  case n.UnauthorizedProviderError.code:
                    throw new n.UnauthorizedProviderError(p);
                  case n.UnsupportedProviderMethodError.code:
                    throw new n.UnsupportedProviderMethodError(p);
                  case n.ProviderDisconnectedError.code:
                    throw new n.ProviderDisconnectedError(p);
                  case n.ChainDisconnectedError.code:
                    throw new n.ChainDisconnectedError(p);
                  case n.SwitchChainError.code:
                    throw new n.SwitchChainError(p);
                  case n.UnsupportedNonOptionalCapabilityError.code:
                    throw new n.UnsupportedNonOptionalCapabilityError(p);
                  case n.UnsupportedChainIdError.code:
                    throw new n.UnsupportedChainIdError(p);
                  case n.DuplicateIdError.code:
                    throw new n.DuplicateIdError(p);
                  case n.UnknownBundleIdError.code:
                    throw new n.UnknownBundleIdError(p);
                  case n.BundleTooLargeError.code:
                    throw new n.BundleTooLargeError(p);
                  case n.AtomicReadyWalletRejectedUpgradeError.code:
                    throw new n.AtomicReadyWalletRejectedUpgradeError(p);
                  case n.AtomicityNotSupportedError.code:
                    throw new n.AtomicityNotSupportedError(p);
                  case 5e3:
                    throw new n.UserRejectedRequestError(p);
                  case n.WalletConnectSessionSettlementError.code:
                    throw new n.WalletConnectSessionSettlementError(p);
                  default:
                    throw j instanceof e.BaseError ? j : new n.UnknownRpcError(p);
                }
              }
            },
            {
              delay: ({ count: j, error: p }) => {
                var y;
                if (p && p instanceof r.HttpRequestError) {
                  const I = (y = p == null ? void 0 : p.headers) == null ? void 0 : y.get("Retry-After");
                  if (I != null && I.match(/\d/)) return Number.parseInt(I, 10) * 1e3;
                }
                return ~~(1 << j) * b;
              },
              retryCount: v,
              shouldRetry: ({ error: j }) => a(j),
            },
          ),
        { enabled: g, id: P },
      );
    };
  }
  function a(u) {
    return "code" in u && typeof u.code == "number"
      ? u.code === -1 || u.code === n.LimitExceededRpcError.code || u.code === n.InternalRpcError.code || u.code === 429
      : u instanceof r.HttpRequestError && u.status
        ? u.status === 403 ||
          u.status === 408 ||
          u.status === 413 ||
          u.status === 429 ||
          u.status === 500 ||
          u.status === 502 ||
          u.status === 503 ||
          u.status === 504
        : !0;
  }
  function c(u, l = 0) {
    let f = 3735928559 ^ l,
      m = 1103547991 ^ l;
    for (let g = 0; g < u.length; g++) {
      const h = u.charCodeAt(g);
      ((f = Math.imul(f ^ h, 2654435761)), (m = Math.imul(m ^ h, 1597334677)));
    }
    return (
      (f = Math.imul(f ^ (f >>> 16), 2246822507)),
      (f ^= Math.imul(m ^ (m >>> 16), 3266489909)),
      (m = Math.imul(m ^ (m >>> 16), 2246822507)),
      (m ^= Math.imul(f ^ (f >>> 16), 3266489909)),
      (4294967296 * (2097151 & m) + (f >>> 0)).toString(36)
    );
  }
  return Eo;
}
var jo = {},
  qm;
function Ng() {
  if (qm) return jo;
  ((qm = 1), Object.defineProperty(jo, "__esModule", { value: !0 }), (jo.defineChain = e), (jo.extendSchema = r));
  function e(n) {
    const t = { formatters: void 0, fees: void 0, serializers: void 0, ...n };
    function o(s) {
      return (i) => {
        const a = typeof i == "function" ? i(s) : i,
          c = { ...s, ...a };
        return Object.assign(c, { extend: o(c) });
      };
    }
    return Object.assign(t, { extend: o(t) });
  }
  function r() {
    return {};
  }
  return jo;
}
var Es = {},
  Mm;
function $g() {
  if (Mm) return Es;
  ((Mm = 1), Object.defineProperty(Es, "__esModule", { value: !0 }), (Es.extractChain = e));
  function e({ chains: r, id: n }) {
    return r.find((t) => t.id === n);
  }
  return Es;
}
var js = {},
  Hm;
function Mf() {
  if (Hm) return js;
  ((Hm = 1), Object.defineProperty(js, "__esModule", { value: !0 }), (js.fromRlp = s));
  const e = ue(),
    r = _n(),
    n = qo(),
    t = ve(),
    o = te();
  function s(u, l = "hex") {
    const f = (() => {
        if (typeof u == "string") {
          if (u.length > 3 && u.length % 2 !== 0) throw new r.InvalidHexValueError(u);
          return (0, t.hexToBytes)(u);
        }
        return u;
      })(),
      m = (0, n.createCursor)(f, { recursiveReadLimit: Number.POSITIVE_INFINITY });
    return i(m, l);
  }
  function i(u, l = "hex") {
    if (u.bytes.length === 0) return l === "hex" ? (0, o.bytesToHex)(u.bytes) : u.bytes;
    const f = u.readByte();
    if ((f < 128 && u.decrementPosition(1), f < 192)) {
      const g = a(u, f, 128),
        h = u.readBytes(g);
      return l === "hex" ? (0, o.bytesToHex)(h) : h;
    }
    const m = a(u, f, 192);
    return c(u, m, l);
  }
  function a(u, l, f) {
    if (f === 128 && l < 128) return 1;
    if (l <= f + 55) return l - f;
    if (l === f + 55 + 1) return u.readUint8();
    if (l === f + 55 + 2) return u.readUint16();
    if (l === f + 55 + 3) return u.readUint24();
    if (l === f + 55 + 4) return u.readUint32();
    throw new e.BaseError("Invalid RLP prefix");
  }
  function c(u, l, f) {
    const m = u.position,
      g = [];
    for (; u.position - m < l; ) g.push(i(u, f));
    return g;
  }
  return js;
}
var ws = {},
  km;
function Hf() {
  if (km) return ws;
  ((km = 1), Object.defineProperty(ws, "__esModule", { value: !0 }), (ws.isHash = n));
  const e = Ge(),
    r = Ve();
  function n(t) {
    return (0, e.isHex)(t) && (0, r.size)(t) === 32;
  }
  return ws;
}
var Ps = {},
  Ir = {},
  Ue = {},
  Fm;
function h6() {
  if (Fm) return Ue;
  ((Fm = 1),
    Object.defineProperty(Ue, "__esModule", { value: !0 }),
    (Ue.ripemd160 = Ue.RIPEMD160 = Ue.md5 = Ue.MD5 = Ue.sha1 = Ue.SHA1 = void 0));
  const e = ig(),
    r = sr(),
    n = Uint32Array.from([1732584193, 4023233417, 2562383102, 271733878, 3285377520]),
    t = new Uint32Array(80);
  class o extends e.HashMD {
    constructor() {
      (super(64, 20, 8, !1),
        (this.A = n[0] | 0),
        (this.B = n[1] | 0),
        (this.C = n[2] | 0),
        (this.D = n[3] | 0),
        (this.E = n[4] | 0));
    }
    get() {
      const { A: w, B: A, C: B, D: R, E: S } = this;
      return [w, A, B, R, S];
    }
    set(w, A, B, R, S) {
      ((this.A = w | 0), (this.B = A | 0), (this.C = B | 0), (this.D = R | 0), (this.E = S | 0));
    }
    process(w, A) {
      for (let H = 0; H < 16; H++, A += 4) t[H] = w.getUint32(A, !1);
      for (let H = 16; H < 80; H++) t[H] = (0, r.rotl)(t[H - 3] ^ t[H - 8] ^ t[H - 14] ^ t[H - 16], 1);
      let { A: B, B: R, C: S, D: x, E: F } = this;
      for (let H = 0; H < 80; H++) {
        let T, k;
        H < 20
          ? ((T = (0, e.Chi)(R, S, x)), (k = 1518500249))
          : H < 40
            ? ((T = R ^ S ^ x), (k = 1859775393))
            : H < 60
              ? ((T = (0, e.Maj)(R, S, x)), (k = 2400959708))
              : ((T = R ^ S ^ x), (k = 3395469782));
        const O = ((0, r.rotl)(B, 5) + T + F + k + t[H]) | 0;
        ((F = x), (x = S), (S = (0, r.rotl)(R, 30)), (R = B), (B = O));
      }
      ((B = (B + this.A) | 0),
        (R = (R + this.B) | 0),
        (S = (S + this.C) | 0),
        (x = (x + this.D) | 0),
        (F = (F + this.E) | 0),
        this.set(B, R, S, x, F));
    }
    roundClean() {
      (0, r.clean)(t);
    }
    destroy() {
      (this.set(0, 0, 0, 0, 0), (0, r.clean)(this.buffer));
    }
  }
  ((Ue.SHA1 = o), (Ue.sha1 = (0, r.createHasher)(() => new o())));
  const s = Math.pow(2, 32),
    i = Array.from({ length: 64 }, (I, w) => Math.floor(s * Math.abs(Math.sin(w + 1)))),
    a = n.slice(0, 4),
    c = new Uint32Array(16);
  class u extends e.HashMD {
    constructor() {
      (super(64, 16, 8, !0), (this.A = a[0] | 0), (this.B = a[1] | 0), (this.C = a[2] | 0), (this.D = a[3] | 0));
    }
    get() {
      const { A: w, B: A, C: B, D: R } = this;
      return [w, A, B, R];
    }
    set(w, A, B, R) {
      ((this.A = w | 0), (this.B = A | 0), (this.C = B | 0), (this.D = R | 0));
    }
    process(w, A) {
      for (let F = 0; F < 16; F++, A += 4) c[F] = w.getUint32(A, !0);
      let { A: B, B: R, C: S, D: x } = this;
      for (let F = 0; F < 64; F++) {
        let H, T, k;
        (F < 16
          ? ((H = (0, e.Chi)(R, S, x)), (T = F), (k = [7, 12, 17, 22]))
          : F < 32
            ? ((H = (0, e.Chi)(x, R, S)), (T = (5 * F + 1) % 16), (k = [5, 9, 14, 20]))
            : F < 48
              ? ((H = R ^ S ^ x), (T = (3 * F + 5) % 16), (k = [4, 11, 16, 23]))
              : ((H = S ^ (R | ~x)), (T = (7 * F) % 16), (k = [6, 10, 15, 21])),
          (H = H + B + i[F] + c[T]),
          (B = x),
          (x = S),
          (S = R),
          (R = R + (0, r.rotl)(H, k[F % 4])));
      }
      ((B = (B + this.A) | 0),
        (R = (R + this.B) | 0),
        (S = (S + this.C) | 0),
        (x = (x + this.D) | 0),
        this.set(B, R, S, x));
    }
    roundClean() {
      (0, r.clean)(c);
    }
    destroy() {
      (this.set(0, 0, 0, 0), (0, r.clean)(this.buffer));
    }
  }
  ((Ue.MD5 = u), (Ue.md5 = (0, r.createHasher)(() => new u())));
  const l = Uint8Array.from([7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8]),
    f = Uint8Array.from(new Array(16).fill(0).map((I, w) => w)),
    m = f.map((I) => (9 * I + 5) % 16),
    g = (() => {
      const A = [[f], [m]];
      for (let B = 0; B < 4; B++) for (let R of A) R.push(R[B].map((S) => l[S]));
      return A;
    })(),
    h = g[0],
    b = g[1],
    v = [
      [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
      [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
      [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
      [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
      [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5],
    ].map((I) => Uint8Array.from(I)),
    _ = h.map((I, w) => I.map((A) => v[w][A])),
    E = b.map((I, w) => I.map((A) => v[w][A])),
    P = Uint32Array.from([0, 1518500249, 1859775393, 2400959708, 2840853838]),
    d = Uint32Array.from([1352829926, 1548603684, 1836072691, 2053994217, 0]);
  function j(I, w, A, B) {
    return I === 0
      ? w ^ A ^ B
      : I === 1
        ? (w & A) | (~w & B)
        : I === 2
          ? (w | ~A) ^ B
          : I === 3
            ? (w & B) | (A & ~B)
            : w ^ (A | ~B);
  }
  const p = new Uint32Array(16);
  class y extends e.HashMD {
    constructor() {
      (super(64, 20, 8, !0),
        (this.h0 = 1732584193),
        (this.h1 = -271733879),
        (this.h2 = -1732584194),
        (this.h3 = 271733878),
        (this.h4 = -1009589776));
    }
    get() {
      const { h0: w, h1: A, h2: B, h3: R, h4: S } = this;
      return [w, A, B, R, S];
    }
    set(w, A, B, R, S) {
      ((this.h0 = w | 0), (this.h1 = A | 0), (this.h2 = B | 0), (this.h3 = R | 0), (this.h4 = S | 0));
    }
    process(w, A) {
      for (let q = 0; q < 16; q++, A += 4) p[q] = w.getUint32(A, !0);
      let B = this.h0 | 0,
        R = B,
        S = this.h1 | 0,
        x = S,
        F = this.h2 | 0,
        H = F,
        T = this.h3 | 0,
        k = T,
        O = this.h4 | 0,
        C = O;
      for (let q = 0; q < 5; q++) {
        const M = 4 - q,
          N = P[q],
          z = d[q],
          $ = h[q],
          U = b[q],
          G = _[q],
          Z = E[q];
        for (let K = 0; K < 16; K++) {
          const V = ((0, r.rotl)(B + j(q, S, F, T) + p[$[K]] + N, G[K]) + O) | 0;
          ((B = O), (O = T), (T = (0, r.rotl)(F, 10) | 0), (F = S), (S = V));
        }
        for (let K = 0; K < 16; K++) {
          const V = ((0, r.rotl)(R + j(M, x, H, k) + p[U[K]] + z, Z[K]) + C) | 0;
          ((R = C), (C = k), (k = (0, r.rotl)(H, 10) | 0), (H = x), (x = V));
        }
      }
      this.set(
        (this.h1 + F + k) | 0,
        (this.h2 + T + C) | 0,
        (this.h3 + O + R) | 0,
        (this.h4 + B + x) | 0,
        (this.h0 + S + H) | 0,
      );
    }
    roundClean() {
      (0, r.clean)(p);
    }
    destroy() {
      ((this.destroyed = !0), (0, r.clean)(this.buffer), this.set(0, 0, 0, 0, 0));
    }
  }
  return ((Ue.RIPEMD160 = y), (Ue.ripemd160 = (0, r.createHasher)(() => new y())), Ue);
}
var Nm;
function zg() {
  if (Nm) return Ir;
  ((Nm = 1), Object.defineProperty(Ir, "__esModule", { value: !0 }), (Ir.ripemd160 = Ir.RIPEMD160 = void 0));
  const e = h6();
  return ((Ir.RIPEMD160 = e.RIPEMD160), (Ir.ripemd160 = e.ripemd160), Ir);
}
var $m;
function Ug() {
  if ($m) return Ps;
  (($m = 1), Object.defineProperty(Ps, "__esModule", { value: !0 }), (Ps.ripemd160 = o));
  const e = zg(),
    r = Ge(),
    n = ve(),
    t = te();
  function o(s, i) {
    const a = i || "hex",
      c = (0, e.ripemd160)((0, r.isHex)(s, { strict: !1 }) ? (0, n.toBytes)(s) : s);
    return a === "bytes" ? c : (0, t.toHex)(c);
  }
  return Ps;
}
var zd = {},
  zm;
function Lg() {
  return (
    zm ||
      ((zm = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.toEventHash = void 0));
        var r = Iu();
        Object.defineProperty(e, "toEventHash", {
          enumerable: !0,
          get: function () {
            return r.toSignatureHash;
          },
        });
      })(zd)),
    zd
  );
}
var Ud = {},
  Um;
function Dg() {
  return (
    Um ||
      ((Um = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.toEventSignature = void 0));
        var r = Yd();
        Object.defineProperty(e, "toEventSignature", {
          enumerable: !0,
          get: function () {
            return r.toSignature;
          },
        });
      })(Ud)),
    Ud
  );
}
var Ld = {},
  Lm;
function Gg() {
  return (
    Lm ||
      ((Lm = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.toFunctionHash = void 0));
        var r = Iu();
        Object.defineProperty(e, "toFunctionHash", {
          enumerable: !0,
          get: function () {
            return r.toSignatureHash;
          },
        });
      })(Ld)),
    Ld
  );
}
var Dd = {},
  Dm;
function Vg() {
  return (
    Dm ||
      ((Dm = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.toFunctionSignature = void 0));
        var r = Yd();
        Object.defineProperty(e, "toFunctionSignature", {
          enumerable: !0,
          get: function () {
            return r.toSignature;
          },
        });
      })(Dd)),
    Dd
  );
}
var Rr = {},
  Gm;
function Wg() {
  if (Gm) return Rr;
  ((Gm = 1),
    Object.defineProperty(Rr, "__esModule", { value: !0 }),
    (Rr.nonceManager = void 0),
    (Rr.createNonceManager = n),
    (Rr.jsonRpc = t));
  const e = Mu(),
    r = Nr();
  function n(o) {
    const { source: s } = o,
      i = new Map(),
      a = new r.LruMap(8192),
      c = new Map(),
      u = ({ address: l, chainId: f }) => `${l}.${f}`;
    return {
      async consume({ address: l, chainId: f, client: m }) {
        const g = u({ address: l, chainId: f }),
          h = this.get({ address: l, chainId: f, client: m });
        this.increment({ address: l, chainId: f });
        const b = await h;
        return (await s.set({ address: l, chainId: f }, b), a.set(g, b), b);
      },
      async increment({ address: l, chainId: f }) {
        const m = u({ address: l, chainId: f }),
          g = i.get(m) ?? 0;
        i.set(m, g + 1);
      },
      async get({ address: l, chainId: f, client: m }) {
        const g = u({ address: l, chainId: f });
        let h = c.get(g);
        return (
          h ||
            ((h = (async () => {
              try {
                const v = await s.get({ address: l, chainId: f, client: m }),
                  _ = a.get(g) ?? 0;
                return _ > 0 && v <= _ ? _ + 1 : (a.delete(g), v);
              } finally {
                this.reset({ address: l, chainId: f });
              }
            })()),
            c.set(g, h)),
          (i.get(g) ?? 0) + (await h)
        );
      },
      reset({ address: l, chainId: f }) {
        const m = u({ address: l, chainId: f });
        (i.delete(m), c.delete(m));
      },
    };
  }
  function t() {
    return {
      async get(o) {
        const { address: s, client: i } = o;
        return (0, e.getTransactionCount)(i, { address: s, blockTag: "pending" });
      },
      set() {},
    };
  }
  return ((Rr.nonceManager = n({ source: t() })), Rr);
}
var dn = {},
  wo = {},
  As = {},
  Vm;
function kf() {
  if (Vm) return As;
  ((Vm = 1), Object.defineProperty(As, "__esModule", { value: !0 }), (As.withTimeout = e));
  function e(r, { errorInstance: n = new Error("timed out"), timeout: t, signal: o }) {
    return new Promise((s, i) => {
      (async () => {
        let a;
        try {
          const c = new AbortController();
          (t > 0 &&
            (a = setTimeout(() => {
              o ? c.abort() : i(n);
            }, t)),
            s(await r({ signal: (c == null ? void 0 : c.signal) || null })));
        } catch (c) {
          ((c == null ? void 0 : c.name) === "AbortError" && i(n), i(c));
        } finally {
          clearTimeout(a);
        }
      })();
    });
  }
  return As;
}
var Po = {},
  Wm;
function Kg() {
  if (Wm) return Po;
  ((Wm = 1), Object.defineProperty(Po, "__esModule", { value: !0 }), (Po.idCache = void 0));
  function e() {
    return {
      current: 0,
      take() {
        return this.current++;
      },
      reset() {
        this.current = 0;
      },
    };
  }
  return ((Po.idCache = e()), Po);
}
var Km;
function Ff() {
  if (Km) return wo;
  ((Km = 1), Object.defineProperty(wo, "__esModule", { value: !0 }), (wo.getHttpRpcClient = o), (wo.parseUrl = s));
  const e = Et(),
    r = kf(),
    n = Fe(),
    t = Kg();
  function o(i, a = {}) {
    const { url: c, headers: u } = s(i);
    return {
      async request(l) {
        var d, j, p;
        const {
            body: f,
            fetchFn: m = a.fetchFn ?? fetch,
            onRequest: g = a.onRequest,
            onResponse: h = a.onResponse,
            timeout: b = a.timeout ?? 1e4,
          } = l,
          v = { ...(a.fetchOptions ?? {}), ...(l.fetchOptions ?? {}) },
          { headers: _, method: E, signal: P } = v;
        try {
          const y = await (0, r.withTimeout)(
            async ({ signal: w }) => {
              const A = {
                  ...v,
                  body: Array.isArray(f)
                    ? (0, n.stringify)(f.map((x) => ({ jsonrpc: "2.0", id: x.id ?? t.idCache.take(), ...x })))
                    : (0, n.stringify)({ jsonrpc: "2.0", id: f.id ?? t.idCache.take(), ...f }),
                  headers: { ...u, "Content-Type": "application/json", ..._ },
                  method: E || "POST",
                  signal: P || (b > 0 ? w : null),
                },
                B = new Request(c, A),
                R = (await (g == null ? void 0 : g(B, A))) ?? { ...A, url: c };
              return await m(R.url ?? c, R);
            },
            { errorInstance: new e.TimeoutError({ body: f, url: c }), timeout: b, signal: !0 },
          );
          h && (await h(y));
          let I;
          if ((d = y.headers.get("Content-Type")) != null && d.startsWith("application/json")) I = await y.json();
          else {
            I = await y.text();
            try {
              I = JSON.parse(I || "{}");
            } catch (w) {
              if (y.ok) throw w;
              I = { error: I };
            }
          }
          if (!y.ok) {
            if (
              typeof ((j = I.error) == null ? void 0 : j.code) == "number" &&
              typeof ((p = I.error) == null ? void 0 : p.message) == "string"
            )
              return I;
            throw new e.HttpRequestError({
              body: f,
              details: (0, n.stringify)(I.error) || y.statusText,
              headers: y.headers,
              status: y.status,
              url: c,
            });
          }
          return I;
        } catch (y) {
          throw y instanceof e.HttpRequestError || y instanceof e.TimeoutError
            ? y
            : new e.HttpRequestError({ body: f, cause: y, url: c });
        }
      },
    };
  }
  function s(i) {
    try {
      const a = new URL(i),
        c = (() => {
          if (a.username) {
            const u = `${decodeURIComponent(a.username)}:${decodeURIComponent(a.password)}`;
            return (
              (a.username = ""),
              (a.password = ""),
              { url: a.toString(), headers: { Authorization: `Basic ${btoa(u)}` } }
            );
          }
        })();
      return { url: a.toString(), ...c };
    } catch {
      return { url: i };
    }
  }
  return wo;
}
var Ts = {},
  Gd = {},
  Zm;
function Zg() {
  return (
    Zm ||
      ((Zm = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.socketClientCache = void 0),
          (e.getSocketRpcClient = s));
        const r = Et(),
          n = gf(),
          t = kf(),
          o = Kg();
        e.socketClientCache = new Map();
        async function s(i) {
          const { getSocket: a, keepAlive: c = !0, key: u = "socket", reconnect: l = !0, url: f } = i,
            { interval: m = 3e4 } = typeof c == "object" ? c : {},
            { attempts: g = 5, delay: h = 2e3 } = typeof l == "object" ? l : {},
            b = JSON.stringify({ keepAlive: c, key: u, url: f, reconnect: l });
          let v = e.socketClientCache.get(b);
          if (v) return v;
          let _ = 0;
          const { schedule: E } = (0, n.createBatchScheduler)({
              id: b,
              fn: async () => {
                const j = new Map(),
                  p = new Map();
                let y,
                  I,
                  w,
                  A = !1;
                function B() {
                  if (l && _ < g) {
                    if (A) return;
                    ((A = !0),
                      _++,
                      I == null || I.close(),
                      setTimeout(async () => {
                        (await R().catch(console.error), (A = !1));
                      }, h));
                  } else (j.clear(), p.clear());
                }
                async function R() {
                  const S = await a({
                    onClose() {
                      var x, F;
                      for (const H of j.values())
                        (x = H.onError) == null || x.call(H, new r.SocketClosedError({ url: f }));
                      for (const H of p.values())
                        (F = H.onError) == null || F.call(H, new r.SocketClosedError({ url: f }));
                      B();
                    },
                    onError(x) {
                      var F, H;
                      y = x;
                      for (const T of j.values()) (F = T.onError) == null || F.call(T, y);
                      for (const T of p.values()) (H = T.onError) == null || H.call(T, y);
                      B();
                    },
                    onOpen() {
                      ((y = void 0), (_ = 0));
                    },
                    onResponse(x) {
                      const F = x.method === "eth_subscription",
                        H = F ? x.params.subscription : x.id,
                        T = F ? p : j,
                        k = T.get(H);
                      (k && k.onResponse(x), F || T.delete(H));
                    },
                  });
                  if (
                    ((I = S),
                    c &&
                      (w && clearInterval(w),
                      (w = setInterval(() => {
                        var x;
                        return (x = I.ping) == null ? void 0 : x.call(I);
                      }, m))),
                    l && p.size > 0)
                  ) {
                    const x = p.entries();
                    for (const [F, { onResponse: H, body: T, onError: k }] of x)
                      T && (p.delete(F), v == null || v.request({ body: T, onResponse: H, onError: k }));
                  }
                  return S;
                }
                return (
                  await R(),
                  (y = void 0),
                  (v = {
                    close() {
                      (w && clearInterval(w), I.close(), e.socketClientCache.delete(b));
                    },
                    get socket() {
                      return I;
                    },
                    request({ body: S, onError: x, onResponse: F }) {
                      var k;
                      y && x && x(y);
                      const H = S.id ?? o.idCache.take(),
                        T = (O) => {
                          (typeof O.id == "number" && H !== O.id) ||
                            (S.method === "eth_subscribe" &&
                              typeof O.result == "string" &&
                              p.set(O.result, { onResponse: T, onError: x, body: S }),
                            F(O));
                        };
                      (S.method === "eth_unsubscribe" && p.delete((k = S.params) == null ? void 0 : k[0]),
                        j.set(H, { onResponse: T, onError: x }));
                      try {
                        I.request({ body: { jsonrpc: "2.0", id: H, ...S } });
                      } catch (O) {
                        x == null || x(O);
                      }
                    },
                    requestAsync({ body: S, timeout: x = 1e4 }) {
                      return (0, t.withTimeout)(
                        () => new Promise((F, H) => this.request({ body: S, onError: H, onResponse: F })),
                        { errorInstance: new r.TimeoutError({ body: S, url: f }), timeout: x },
                      );
                    },
                    requests: j,
                    subscriptions: p,
                    url: f,
                  }),
                  e.socketClientCache.set(b, v),
                  [v]
                );
              },
            }),
            [P, [d]] = await E();
          return d;
        }
      })(Gd)),
    Gd
  );
}
const y6 = bv(vv);
var Jm;
function Nf() {
  if (Jm) return Ts;
  ((Jm = 1), Object.defineProperty(Ts, "__esModule", { value: !0 }), (Ts.getWebSocketRpcClient = n));
  const e = Et(),
    r = Zg();
  async function n(t, o = {}) {
    const { keepAlive: s, reconnect: i } = o;
    return (0, r.getSocketRpcClient)({
      async getSocket({ onClose: a, onError: c, onOpen: u, onResponse: l }) {
        const f = await Promise.resolve()
            .then(() => y6)
            .then((v) => v.WebSocket),
          m = new f(t);
        function g() {
          (m.removeEventListener("close", g),
            m.removeEventListener("message", h),
            m.removeEventListener("error", c),
            m.removeEventListener("open", u),
            a());
        }
        function h({ data: v }) {
          if (!(typeof v == "string" && v.trim().length === 0))
            try {
              const _ = JSON.parse(v);
              l(_);
            } catch (_) {
              c(_);
            }
        }
        (m.addEventListener("close", g),
          m.addEventListener("message", h),
          m.addEventListener("error", c),
          m.addEventListener("open", u),
          m.readyState === f.CONNECTING &&
            (await new Promise((v, _) => {
              m && ((m.onopen = v), (m.onerror = _));
            })));
        const { close: b } = m;
        return Object.assign(m, {
          close() {
            (b.bind(m)(), g());
          },
          ping() {
            try {
              if (m.readyState === m.CLOSED || m.readyState === m.CLOSING)
                throw new e.WebSocketRequestError({ url: m.url, cause: new e.SocketClosedError({ url: m.url }) });
              const v = { jsonrpc: "2.0", id: null, method: "net_version", params: [] };
              m.send(JSON.stringify(v));
            } catch (v) {
              c(v);
            }
          },
          request({ body: v }) {
            if (m.readyState === m.CLOSED || m.readyState === m.CLOSING)
              throw new e.WebSocketRequestError({
                body: v,
                url: m.url,
                cause: new e.SocketClosedError({ url: m.url }),
              });
            return m.send(JSON.stringify(v));
          },
        });
      },
      keepAlive: s,
      reconnect: i,
      url: t,
    });
  }
  return Ts;
}
var Ym;
function Jg() {
  if (Ym) return dn;
  ((Ym = 1), Object.defineProperty(dn, "__esModule", { value: !0 }), (dn.rpc = void 0), (dn.getSocket = o));
  const e = Ff(),
    r = Nf();
  function n(s, { body: i, onError: a, onResponse: c }) {
    return (s.request({ body: i, onError: a, onResponse: c }), s);
  }
  async function t(s, { body: i, timeout: a = 1e4 }) {
    return s.requestAsync({ body: i, timeout: a });
  }
  async function o(s) {
    const i = await (0, r.getWebSocketRpcClient)(s);
    return Object.assign(i.socket, { requests: i.requests, subscriptions: i.subscriptions });
  }
  return (
    (dn.rpc = {
      http(s, i) {
        return (0, e.getHttpRpcClient)(s).request(i);
      },
      webSocket: n,
      webSocketAsync: t,
    }),
    dn
  );
}
var Ss = {},
  Is = {},
  Ao = {},
  Xm;
function Yg() {
  return (
    Xm ||
      ((Xm = 1),
      Object.defineProperty(Ao, "__esModule", { value: !0 }),
      (Ao.presignMessagePrefix = void 0),
      (Ao.presignMessagePrefix = `Ethereum Signed Message:
`)),
    Ao
  );
}
var Qm;
function Xg() {
  if (Qm) return Is;
  ((Qm = 1), Object.defineProperty(Is, "__esModule", { value: !0 }), (Is.toPrefixedMessage = o));
  const e = Yg(),
    r = qe(),
    n = Ve(),
    t = te();
  function o(s) {
    const i =
        typeof s == "string" ? (0, t.stringToHex)(s) : typeof s.raw == "string" ? s.raw : (0, t.bytesToHex)(s.raw),
      a = (0, t.stringToHex)(`${e.presignMessagePrefix}${(0, n.size)(i)}`);
    return (0, r.concat)([a, i]);
  }
  return Is;
}
var eh;
function Xo() {
  if (eh) return Ss;
  ((eh = 1), Object.defineProperty(Ss, "__esModule", { value: !0 }), (Ss.hashMessage = n));
  const e = Xe(),
    r = Xg();
  function n(t, o) {
    return (0, e.keccak256)((0, r.toPrefixedMessage)(t), o);
  }
  return Ss;
}
var Br = {},
  Or = {},
  Gt = {},
  th;
function Qg() {
  if (th) return Gt;
  ((th = 1),
    Object.defineProperty(Gt, "__esModule", { value: !0 }),
    (Gt.InvalidStructTypeError = Gt.InvalidPrimaryTypeError = Gt.InvalidDomainError = void 0));
  const e = Fe(),
    r = ue();
  class n extends r.BaseError {
    constructor({ domain: i }) {
      super(`Invalid domain "${(0, e.stringify)(i)}".`, { metaMessages: ["Must be a valid EIP-712 domain."] });
    }
  }
  Gt.InvalidDomainError = n;
  class t extends r.BaseError {
    constructor({ primaryType: i, types: a }) {
      super(`Invalid primary type \`${i}\` must be one of \`${JSON.stringify(Object.keys(a))}\`.`, {
        docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
        metaMessages: ["Check that the primary type is a key in `types`."],
      });
    }
  }
  Gt.InvalidPrimaryTypeError = t;
  class o extends r.BaseError {
    constructor({ type: i }) {
      super(`Struct type "${i}" is invalid.`, {
        metaMessages: ["Struct type must not be a Solidity type."],
        name: "InvalidStructTypeError",
      });
    }
  }
  return ((Gt.InvalidStructTypeError = o), Gt);
}
var rh;
function Zu() {
  if (rh) return Or;
  ((rh = 1),
    Object.defineProperty(Or, "__esModule", { value: !0 }),
    (Or.serializeTypedData = u),
    (Or.validateTypedData = l),
    (Or.getTypesForEIP712Domain = f),
    (Or.domainSeparator = m));
  const e = Se(),
    r = _t(),
    n = Qg(),
    t = et(),
    o = Ve(),
    s = te(),
    i = Ru(),
    a = Qo(),
    c = Fe();
  function u(h) {
    const { domain: b, message: v, primaryType: _, types: E } = h,
      P = (p, y) => {
        const I = { ...y };
        for (const w of p) {
          const { name: A, type: B } = w;
          B === "address" && (I[A] = I[A].toLowerCase());
        }
        return I;
      },
      d = E.EIP712Domain ? (b ? P(E.EIP712Domain, b) : {}) : {},
      j = (() => {
        if (_ !== "EIP712Domain") return P(E[_], v);
      })();
    return (0, c.stringify)({ domain: d, message: j, primaryType: _, types: E });
  }
  function l(h) {
    const { domain: b, message: v, primaryType: _, types: E } = h,
      P = (d, j) => {
        for (const p of d) {
          const { name: y, type: I } = p,
            w = j[y],
            A = I.match(i.integerRegex);
          if (A && (typeof w == "number" || typeof w == "bigint")) {
            const [S, x, F] = A;
            (0, s.numberToHex)(w, { signed: x === "int", size: Number.parseInt(F, 10) / 8 });
          }
          if (I === "address" && typeof w == "string" && !(0, t.isAddress)(w))
            throw new r.InvalidAddressError({ address: w });
          const B = I.match(i.bytesRegex);
          if (B) {
            const [S, x] = B;
            if (x && (0, o.size)(w) !== Number.parseInt(x, 10))
              throw new e.BytesSizeMismatchError({ expectedSize: Number.parseInt(x, 10), givenSize: (0, o.size)(w) });
          }
          const R = E[I];
          R && (g(I), P(R, w));
        }
      };
    if (E.EIP712Domain && b) {
      if (typeof b != "object") throw new n.InvalidDomainError({ domain: b });
      P(E.EIP712Domain, b);
    }
    if (_ !== "EIP712Domain")
      if (E[_]) P(E[_], v);
      else throw new n.InvalidPrimaryTypeError({ primaryType: _, types: E });
  }
  function f({ domain: h }) {
    return [
      typeof (h == null ? void 0 : h.name) == "string" && { name: "name", type: "string" },
      (h == null ? void 0 : h.version) && { name: "version", type: "string" },
      (typeof (h == null ? void 0 : h.chainId) == "number" || typeof (h == null ? void 0 : h.chainId) == "bigint") && {
        name: "chainId",
        type: "uint256",
      },
      (h == null ? void 0 : h.verifyingContract) && { name: "verifyingContract", type: "address" },
      (h == null ? void 0 : h.salt) && { name: "salt", type: "bytes32" },
    ].filter(Boolean);
  }
  function m({ domain: h }) {
    return (0, a.hashDomain)({ domain: h, types: { EIP712Domain: f({ domain: h }) } });
  }
  function g(h) {
    if (
      h === "address" ||
      h === "bool" ||
      h === "string" ||
      h.startsWith("bytes") ||
      h.startsWith("uint") ||
      h.startsWith("int")
    )
      throw new n.InvalidStructTypeError({ type: h });
  }
  return Or;
}
var nh;
function Qo() {
  if (nh) return Br;
  ((nh = 1),
    Object.defineProperty(Br, "__esModule", { value: !0 }),
    (Br.hashTypedData = s),
    (Br.hashDomain = i),
    (Br.hashStruct = a),
    (Br.encodeType = l));
  const e = vt(),
    r = qe(),
    n = te(),
    t = Xe(),
    o = Zu();
  function s(g) {
    const { domain: h = {}, message: b, primaryType: v } = g,
      _ = { EIP712Domain: (0, o.getTypesForEIP712Domain)({ domain: h }), ...g.types };
    (0, o.validateTypedData)({ domain: h, message: b, primaryType: v, types: _ });
    const E = ["0x1901"];
    return (
      h && E.push(i({ domain: h, types: _ })),
      v !== "EIP712Domain" && E.push(a({ data: b, primaryType: v, types: _ })),
      (0, t.keccak256)((0, r.concat)(E))
    );
  }
  function i({ domain: g, types: h }) {
    return a({ data: g, primaryType: "EIP712Domain", types: h });
  }
  function a({ data: g, primaryType: h, types: b }) {
    const v = c({ data: g, primaryType: h, types: b });
    return (0, t.keccak256)(v);
  }
  function c({ data: g, primaryType: h, types: b }) {
    const v = [{ type: "bytes32" }],
      _ = [u({ primaryType: h, types: b })];
    for (const E of b[h]) {
      const [P, d] = m({ types: b, name: E.name, type: E.type, value: g[E.name] });
      (v.push(P), _.push(d));
    }
    return (0, e.encodeAbiParameters)(v, _);
  }
  function u({ primaryType: g, types: h }) {
    const b = (0, n.toHex)(l({ primaryType: g, types: h }));
    return (0, t.keccak256)(b);
  }
  function l({ primaryType: g, types: h }) {
    let b = "";
    const v = f({ primaryType: g, types: h });
    v.delete(g);
    const _ = [g, ...Array.from(v).sort()];
    for (const E of _) b += `${E}(${h[E].map(({ name: P, type: d }) => `${d} ${P}`).join(",")})`;
    return b;
  }
  function f({ primaryType: g, types: h }, b = new Set()) {
    const v = g.match(/^\w*/u),
      _ = v == null ? void 0 : v[0];
    if (b.has(_) || h[_] === void 0) return b;
    b.add(_);
    for (const E of h[_]) f({ primaryType: E.type, types: h }, b);
    return b;
  }
  function m({ types: g, name: h, type: b, value: v }) {
    if (g[b] !== void 0) return [{ type: "bytes32" }, (0, t.keccak256)(c({ data: v, primaryType: b, types: g }))];
    if (b === "bytes") return [{ type: "bytes32" }, (0, t.keccak256)(v)];
    if (b === "string") return [{ type: "bytes32" }, (0, t.keccak256)((0, n.toHex)(v))];
    if (b.lastIndexOf("]") === b.length - 1) {
      const _ = b.slice(0, b.lastIndexOf("[")),
        E = v.map((P) => m({ name: h, type: _, types: g, value: P }));
      return [
        { type: "bytes32" },
        (0, t.keccak256)(
          (0, e.encodeAbiParameters)(
            E.map(([P]) => P),
            E.map(([, P]) => P),
          ),
        ),
      ];
    }
    return [{ type: b }, v];
  }
  return Br;
}
var Rs = {},
  xr = {},
  oh;
function $f() {
  return (
    oh ||
      ((oh = 1),
      Object.defineProperty(xr, "__esModule", { value: !0 }),
      (xr.zeroHash = xr.erc6492MagicBytes = void 0),
      (xr.erc6492MagicBytes = "0x6492649264926492649264926492649264926492649264926492649264926492"),
      (xr.zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000")),
    xr
  );
}
var ih;
function zf() {
  if (ih) return Rs;
  ((ih = 1), Object.defineProperty(Rs, "__esModule", { value: !0 }), (Rs.isErc6492Signature = n));
  const e = $f(),
    r = st();
  function n(t) {
    return (0, r.sliceHex)(t, -32) === e.erc6492MagicBytes;
  }
  return Rs;
}
var Bs = {},
  To = {},
  Vd = {},
  Ae = {},
  Le = {},
  fn = {},
  So = {},
  ah;
function p6() {
  if (ah) return So;
  ((ah = 1), Object.defineProperty(So, "__esModule", { value: !0 }), (So.LruMap = void 0));
  class e extends Map {
    constructor(n) {
      (super(),
        Object.defineProperty(this, "maxSize", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.maxSize = n));
    }
    get(n) {
      const t = super.get(n);
      return (super.has(n) && t !== void 0 && (this.delete(n), super.set(n, t)), t);
    }
    set(n, t) {
      if ((super.set(n, t), this.maxSize && this.size > this.maxSize)) {
        const o = this.keys().next().value;
        o && this.delete(o);
      }
      return this;
    }
  }
  return ((So.LruMap = e), So);
}
var sh;
function g6() {
  if (sh) return fn;
  ((sh = 1), Object.defineProperty(fn, "__esModule", { value: !0 }), (fn.checksum = void 0), (fn.clear = n));
  const e = p6(),
    r = { checksum: new e.LruMap(8192) };
  fn.checksum = r.checksum;
  function n() {
    for (const t of Object.values(r)) t.clear();
  }
  return fn;
}
var nr = {},
  ch;
function Uf() {
  if (ch) return nr;
  ((ch = 1),
    Object.defineProperty(nr, "__esModule", { value: !0 }),
    (nr.keccak256 = i),
    (nr.hmac256 = a),
    (nr.ripemd160 = c),
    (nr.sha256 = u),
    (nr.validate = l));
  const e = sg(),
    r = zg(),
    n = eg(),
    t = mg(),
    o = Bt(),
    s = Ne();
  function i(f, m = {}) {
    const { as: g = typeof f == "string" ? "Hex" : "Bytes" } = m,
      h = (0, n.keccak_256)(o.from(f));
    return g === "Bytes" ? h : s.fromBytes(h);
  }
  function a(f, m, g = {}) {
    const { as: h = typeof m == "string" ? "Hex" : "Bytes" } = g,
      b = (0, e.hmac)(t.sha256, o.from(f), o.from(m));
    return h === "Bytes" ? b : s.fromBytes(b);
  }
  function c(f, m = {}) {
    const { as: g = typeof f == "string" ? "Hex" : "Bytes" } = m,
      h = (0, r.ripemd160)(o.from(f));
    return g === "Bytes" ? h : s.fromBytes(h);
  }
  function u(f, m = {}) {
    const { as: g = typeof f == "string" ? "Hex" : "Bytes" } = m,
      h = (0, t.sha256)(o.from(f));
    return g === "Bytes" ? h : s.fromBytes(h);
  }
  function l(f) {
    return s.validate(f) && s.size(f) === 32;
  }
  return nr;
}
var xe = {},
  uh;
function e_() {
  if (uh) return xe;
  ((uh = 1),
    Object.defineProperty(xe, "__esModule", { value: !0 }),
    (xe.InvalidSerializedSizeError =
      xe.InvalidUncompressedPrefixError =
      xe.InvalidCompressedPrefixError =
      xe.InvalidPrefixError =
      xe.InvalidError =
        void 0),
    (xe.assert = o),
    (xe.compress = s),
    (xe.from = i),
    (xe.fromBytes = a),
    (xe.fromHex = c),
    (xe.toBytes = u),
    (xe.toHex = l),
    (xe.validate = f));
  const e = Bt(),
    r = ct(),
    n = Ne(),
    t = $u();
  function o(_, E = {}) {
    const { compressed: P } = E,
      { prefix: d, x: j, y: p } = _;
    if (P === !1 || (typeof j == "bigint" && typeof p == "bigint")) {
      if (d !== 4) throw new g({ prefix: d, cause: new b() });
      return;
    }
    if (P === !0 || (typeof j == "bigint" && typeof p > "u")) {
      if (d !== 3 && d !== 2) throw new g({ prefix: d, cause: new h() });
      return;
    }
    throw new m({ publicKey: _ });
  }
  function s(_) {
    const { x: E, y: P } = _;
    return { prefix: P % 2n === 0n ? 2 : 3, x: E };
  }
  function i(_) {
    const E = (() => {
      if (n.validate(_)) return c(_);
      if (e.validate(_)) return a(_);
      const { prefix: P, x: d, y: j } = _;
      return typeof d == "bigint" && typeof j == "bigint" ? { prefix: P ?? 4, x: d, y: j } : { prefix: P, x: d };
    })();
    return (o(E), E);
  }
  function a(_) {
    return c(n.fromBytes(_));
  }
  function c(_) {
    if (_.length !== 132 && _.length !== 130 && _.length !== 68) throw new v({ publicKey: _ });
    if (_.length === 130) {
      const d = BigInt(n.slice(_, 0, 32)),
        j = BigInt(n.slice(_, 32, 64));
      return { prefix: 4, x: d, y: j };
    }
    if (_.length === 132) {
      const d = Number(n.slice(_, 0, 1)),
        j = BigInt(n.slice(_, 1, 33)),
        p = BigInt(n.slice(_, 33, 65));
      return { prefix: d, x: j, y: p };
    }
    const E = Number(n.slice(_, 0, 1)),
      P = BigInt(n.slice(_, 1, 33));
    return { prefix: E, x: P };
  }
  function u(_, E = {}) {
    return e.fromHex(l(_, E));
  }
  function l(_, E = {}) {
    o(_);
    const { prefix: P, x: d, y: j } = _,
      { includePrefix: p = !0 } = E;
    return n.concat(
      p ? n.fromNumber(P, { size: 1 }) : "0x",
      n.fromNumber(d, { size: 32 }),
      typeof j == "bigint" ? n.fromNumber(j, { size: 32 }) : "0x",
    );
  }
  function f(_, E = {}) {
    try {
      return (o(_, E), !0);
    } catch {
      return !1;
    }
  }
  class m extends r.BaseError {
    constructor({ publicKey: E }) {
      (super(`Value \`${t.stringify(E)}\` is not a valid public key.`, {
        metaMessages: [
          "Public key must contain:",
          "- an `x` and `prefix` value (compressed)",
          "- an `x`, `y`, and `prefix` value (uncompressed)",
        ],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "PublicKey.InvalidError",
        }));
    }
  }
  xe.InvalidError = m;
  class g extends r.BaseError {
    constructor({ prefix: E, cause: P }) {
      (super(`Prefix "${E}" is invalid.`, { cause: P }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "PublicKey.InvalidPrefixError",
        }));
    }
  }
  xe.InvalidPrefixError = g;
  class h extends r.BaseError {
    constructor() {
      (super("Prefix must be 2 or 3 for compressed public keys."),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "PublicKey.InvalidCompressedPrefixError",
        }));
    }
  }
  xe.InvalidCompressedPrefixError = h;
  class b extends r.BaseError {
    constructor() {
      (super("Prefix must be 4 for uncompressed public keys."),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "PublicKey.InvalidUncompressedPrefixError",
        }));
    }
  }
  xe.InvalidUncompressedPrefixError = b;
  class v extends r.BaseError {
    constructor({ publicKey: E }) {
      (super(`Value \`${E}\` is an invalid public key size.`, {
        metaMessages: [
          "Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).",
          `Received ${n.size(n.from(E))} bytes.`,
        ],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "PublicKey.InvalidSerializedSizeError",
        }));
    }
  }
  return ((xe.InvalidSerializedSizeError = v), xe);
}
var dh;
function Ju() {
  if (dh) return Le;
  ((dh = 1),
    Object.defineProperty(Le, "__esModule", { value: !0 }),
    (Le.InvalidChecksumError = Le.InvalidInputError = Le.InvalidAddressError = void 0),
    (Le.assert = i),
    (Le.checksum = a),
    (Le.from = c),
    (Le.fromPublicKey = u),
    (Le.isEqual = l),
    (Le.validate = f));
  const e = Bt(),
    r = g6(),
    n = ct(),
    t = Uf(),
    o = e_(),
    s = /^0x[a-fA-F0-9]{40}$/;
  function i(b, v = {}) {
    const { strict: _ = !0 } = v;
    if (!s.test(b)) throw new m({ address: b, cause: new g() });
    if (_) {
      if (b.toLowerCase() === b) return;
      if (a(b) !== b) throw new m({ address: b, cause: new h() });
    }
  }
  function a(b) {
    if (r.checksum.has(b)) return r.checksum.get(b);
    i(b, { strict: !1 });
    const v = b.substring(2).toLowerCase(),
      _ = t.keccak256(e.fromString(v), { as: "Bytes" }),
      E = v.split("");
    for (let d = 0; d < 40; d += 2)
      (_[d >> 1] >> 4 >= 8 && E[d] && (E[d] = E[d].toUpperCase()),
        (_[d >> 1] & 15) >= 8 && E[d + 1] && (E[d + 1] = E[d + 1].toUpperCase()));
    const P = `0x${E.join("")}`;
    return (r.checksum.set(b, P), P);
  }
  function c(b, v = {}) {
    const { checksum: _ = !1 } = v;
    return (i(b), _ ? a(b) : b);
  }
  function u(b, v = {}) {
    const _ = t.keccak256(`0x${o.toHex(b).slice(4)}`).substring(26);
    return c(`0x${_}`, v);
  }
  function l(b, v) {
    return (i(b, { strict: !1 }), i(v, { strict: !1 }), b.toLowerCase() === v.toLowerCase());
  }
  function f(b, v = {}) {
    const { strict: _ = !0 } = v ?? {};
    try {
      return (i(b, { strict: _ }), !0);
    } catch {
      return !1;
    }
  }
  class m extends n.BaseError {
    constructor({ address: v, cause: _ }) {
      (super(`Address "${v}" is invalid.`, { cause: _ }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Address.InvalidAddressError",
        }));
    }
  }
  Le.InvalidAddressError = m;
  class g extends n.BaseError {
    constructor() {
      (super("Address is not a 20 byte (40 hexadecimal character) value."),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Address.InvalidInputError",
        }));
    }
  }
  Le.InvalidInputError = g;
  class h extends n.BaseError {
    constructor() {
      (super("Address does not match its checksum counterpart."),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Address.InvalidChecksumError",
        }));
    }
  }
  return ((Le.InvalidChecksumError = h), Le);
}
var Te = {},
  L = {},
  fh;
function Lf() {
  return (
    fh ||
      ((fh = 1),
      Object.defineProperty(L, "__esModule", { value: !0 }),
      (L.minInt120 =
        L.minInt112 =
        L.minInt104 =
        L.minInt96 =
        L.minInt88 =
        L.minInt80 =
        L.minInt72 =
        L.minInt64 =
        L.minInt56 =
        L.minInt48 =
        L.minInt40 =
        L.minInt32 =
        L.minInt24 =
        L.minInt16 =
        L.minInt8 =
        L.maxInt256 =
        L.maxInt248 =
        L.maxInt240 =
        L.maxInt232 =
        L.maxInt224 =
        L.maxInt216 =
        L.maxInt208 =
        L.maxInt200 =
        L.maxInt192 =
        L.maxInt184 =
        L.maxInt176 =
        L.maxInt168 =
        L.maxInt160 =
        L.maxInt152 =
        L.maxInt144 =
        L.maxInt136 =
        L.maxInt128 =
        L.maxInt120 =
        L.maxInt112 =
        L.maxInt104 =
        L.maxInt96 =
        L.maxInt88 =
        L.maxInt80 =
        L.maxInt72 =
        L.maxInt64 =
        L.maxInt56 =
        L.maxInt48 =
        L.maxInt40 =
        L.maxInt32 =
        L.maxInt24 =
        L.maxInt16 =
        L.maxInt8 =
        L.integerRegex =
        L.bytesRegex =
        L.arrayRegex =
          void 0),
      (L.maxUint256 =
        L.maxUint248 =
        L.maxUint240 =
        L.maxUint232 =
        L.maxUint224 =
        L.maxUint216 =
        L.maxUint208 =
        L.maxUint200 =
        L.maxUint192 =
        L.maxUint184 =
        L.maxUint176 =
        L.maxUint168 =
        L.maxUint160 =
        L.maxUint152 =
        L.maxUint144 =
        L.maxUint136 =
        L.maxUint128 =
        L.maxUint120 =
        L.maxUint112 =
        L.maxUint104 =
        L.maxUint96 =
        L.maxUint88 =
        L.maxUint80 =
        L.maxUint72 =
        L.maxUint64 =
        L.maxUint56 =
        L.maxUint48 =
        L.maxUint40 =
        L.maxUint32 =
        L.maxUint24 =
        L.maxUint16 =
        L.maxUint8 =
        L.minInt256 =
        L.minInt248 =
        L.minInt240 =
        L.minInt232 =
        L.minInt224 =
        L.minInt216 =
        L.minInt208 =
        L.minInt200 =
        L.minInt192 =
        L.minInt184 =
        L.minInt176 =
        L.minInt168 =
        L.minInt160 =
        L.minInt152 =
        L.minInt144 =
        L.minInt136 =
        L.minInt128 =
          void 0),
      (L.arrayRegex = /^(.*)\[([0-9]*)\]$/),
      (L.bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/),
      (L.integerRegex =
        /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/),
      (L.maxInt8 = 2n ** (8n - 1n) - 1n),
      (L.maxInt16 = 2n ** (16n - 1n) - 1n),
      (L.maxInt24 = 2n ** (24n - 1n) - 1n),
      (L.maxInt32 = 2n ** (32n - 1n) - 1n),
      (L.maxInt40 = 2n ** (40n - 1n) - 1n),
      (L.maxInt48 = 2n ** (48n - 1n) - 1n),
      (L.maxInt56 = 2n ** (56n - 1n) - 1n),
      (L.maxInt64 = 2n ** (64n - 1n) - 1n),
      (L.maxInt72 = 2n ** (72n - 1n) - 1n),
      (L.maxInt80 = 2n ** (80n - 1n) - 1n),
      (L.maxInt88 = 2n ** (88n - 1n) - 1n),
      (L.maxInt96 = 2n ** (96n - 1n) - 1n),
      (L.maxInt104 = 2n ** (104n - 1n) - 1n),
      (L.maxInt112 = 2n ** (112n - 1n) - 1n),
      (L.maxInt120 = 2n ** (120n - 1n) - 1n),
      (L.maxInt128 = 2n ** (128n - 1n) - 1n),
      (L.maxInt136 = 2n ** (136n - 1n) - 1n),
      (L.maxInt144 = 2n ** (144n - 1n) - 1n),
      (L.maxInt152 = 2n ** (152n - 1n) - 1n),
      (L.maxInt160 = 2n ** (160n - 1n) - 1n),
      (L.maxInt168 = 2n ** (168n - 1n) - 1n),
      (L.maxInt176 = 2n ** (176n - 1n) - 1n),
      (L.maxInt184 = 2n ** (184n - 1n) - 1n),
      (L.maxInt192 = 2n ** (192n - 1n) - 1n),
      (L.maxInt200 = 2n ** (200n - 1n) - 1n),
      (L.maxInt208 = 2n ** (208n - 1n) - 1n),
      (L.maxInt216 = 2n ** (216n - 1n) - 1n),
      (L.maxInt224 = 2n ** (224n - 1n) - 1n),
      (L.maxInt232 = 2n ** (232n - 1n) - 1n),
      (L.maxInt240 = 2n ** (240n - 1n) - 1n),
      (L.maxInt248 = 2n ** (248n - 1n) - 1n),
      (L.maxInt256 = 2n ** (256n - 1n) - 1n),
      (L.minInt8 = -(2n ** (8n - 1n))),
      (L.minInt16 = -(2n ** (16n - 1n))),
      (L.minInt24 = -(2n ** (24n - 1n))),
      (L.minInt32 = -(2n ** (32n - 1n))),
      (L.minInt40 = -(2n ** (40n - 1n))),
      (L.minInt48 = -(2n ** (48n - 1n))),
      (L.minInt56 = -(2n ** (56n - 1n))),
      (L.minInt64 = -(2n ** (64n - 1n))),
      (L.minInt72 = -(2n ** (72n - 1n))),
      (L.minInt80 = -(2n ** (80n - 1n))),
      (L.minInt88 = -(2n ** (88n - 1n))),
      (L.minInt96 = -(2n ** (96n - 1n))),
      (L.minInt104 = -(2n ** (104n - 1n))),
      (L.minInt112 = -(2n ** (112n - 1n))),
      (L.minInt120 = -(2n ** (120n - 1n))),
      (L.minInt128 = -(2n ** (128n - 1n))),
      (L.minInt136 = -(2n ** (136n - 1n))),
      (L.minInt144 = -(2n ** (144n - 1n))),
      (L.minInt152 = -(2n ** (152n - 1n))),
      (L.minInt160 = -(2n ** (160n - 1n))),
      (L.minInt168 = -(2n ** (168n - 1n))),
      (L.minInt176 = -(2n ** (176n - 1n))),
      (L.minInt184 = -(2n ** (184n - 1n))),
      (L.minInt192 = -(2n ** (192n - 1n))),
      (L.minInt200 = -(2n ** (200n - 1n))),
      (L.minInt208 = -(2n ** (208n - 1n))),
      (L.minInt216 = -(2n ** (216n - 1n))),
      (L.minInt224 = -(2n ** (224n - 1n))),
      (L.minInt232 = -(2n ** (232n - 1n))),
      (L.minInt240 = -(2n ** (240n - 1n))),
      (L.minInt248 = -(2n ** (248n - 1n))),
      (L.minInt256 = -(2n ** (256n - 1n))),
      (L.maxUint8 = 2n ** 8n - 1n),
      (L.maxUint16 = 2n ** 16n - 1n),
      (L.maxUint24 = 2n ** 24n - 1n),
      (L.maxUint32 = 2n ** 32n - 1n),
      (L.maxUint40 = 2n ** 40n - 1n),
      (L.maxUint48 = 2n ** 48n - 1n),
      (L.maxUint56 = 2n ** 56n - 1n),
      (L.maxUint64 = 2n ** 64n - 1n),
      (L.maxUint72 = 2n ** 72n - 1n),
      (L.maxUint80 = 2n ** 80n - 1n),
      (L.maxUint88 = 2n ** 88n - 1n),
      (L.maxUint96 = 2n ** 96n - 1n),
      (L.maxUint104 = 2n ** 104n - 1n),
      (L.maxUint112 = 2n ** 112n - 1n),
      (L.maxUint120 = 2n ** 120n - 1n),
      (L.maxUint128 = 2n ** 128n - 1n),
      (L.maxUint136 = 2n ** 136n - 1n),
      (L.maxUint144 = 2n ** 144n - 1n),
      (L.maxUint152 = 2n ** 152n - 1n),
      (L.maxUint160 = 2n ** 160n - 1n),
      (L.maxUint168 = 2n ** 168n - 1n),
      (L.maxUint176 = 2n ** 176n - 1n),
      (L.maxUint184 = 2n ** 184n - 1n),
      (L.maxUint192 = 2n ** 192n - 1n),
      (L.maxUint200 = 2n ** 200n - 1n),
      (L.maxUint208 = 2n ** 208n - 1n),
      (L.maxUint216 = 2n ** 216n - 1n),
      (L.maxUint224 = 2n ** 224n - 1n),
      (L.maxUint232 = 2n ** 232n - 1n),
      (L.maxUint240 = 2n ** 240n - 1n),
      (L.maxUint248 = 2n ** 248n - 1n),
      (L.maxUint256 = 2n ** 256n - 1n)),
    L
  );
}
var lh;
function _6() {
  if (lh) return Te;
  ((lh = 1),
    Object.defineProperty(Te, "__esModule", { value: !0 }),
    (Te.decodeParameter = i),
    (Te.decodeAddress = u),
    (Te.decodeArray = l),
    (Te.decodeBool = f),
    (Te.decodeBytes = m),
    (Te.decodeNumber = g),
    (Te.decodeTuple = h),
    (Te.decodeString = b),
    (Te.prepareParameters = v),
    (Te.prepareParameter = _),
    (Te.encode = E),
    (Te.encodeAddress = P),
    (Te.encodeArray = d),
    (Te.encodeBytes = j),
    (Te.encodeBoolean = p),
    (Te.encodeNumber = y),
    (Te.encodeString = I),
    (Te.encodeTuple = w),
    (Te.getArrayComponents = A),
    (Te.hasDynamicChild = B));
  const e = ei(),
    r = Ju(),
    n = Bt(),
    t = ct(),
    o = Ne(),
    s = Lf();
  function i(R, S, x) {
    const { checksumAddress: F, staticPosition: H } = x,
      T = A(S.type);
    if (T) {
      const [k, O] = T;
      return l(R, { ...S, type: O }, { checksumAddress: F, length: k, staticPosition: H });
    }
    if (S.type === "tuple") return h(R, S, { checksumAddress: F, staticPosition: H });
    if (S.type === "address") return u(R, { checksum: F });
    if (S.type === "bool") return f(R);
    if (S.type.startsWith("bytes")) return m(R, S, { staticPosition: H });
    if (S.type.startsWith("uint") || S.type.startsWith("int")) return g(R, S);
    if (S.type === "string") return b(R, { staticPosition: H });
    throw new e.InvalidTypeError(S.type);
  }
  const a = 32,
    c = 32;
  function u(R, S = {}) {
    const { checksum: x = !1 } = S,
      F = R.readBytes(32);
    return [((T) => (x ? r.checksum(T) : T))(o.fromBytes(n.slice(F, -20))), 32];
  }
  function l(R, S, x) {
    const { checksumAddress: F, length: H, staticPosition: T } = x;
    if (!H) {
      const C = n.toNumber(R.readBytes(c)),
        q = T + C,
        M = q + a;
      R.setPosition(q);
      const N = n.toNumber(R.readBytes(a)),
        z = B(S);
      let $ = 0;
      const U = [];
      for (let G = 0; G < N; ++G) {
        R.setPosition(M + (z ? G * 32 : $));
        const [Z, K] = i(R, S, { checksumAddress: F, staticPosition: M });
        (($ += K), U.push(Z));
      }
      return (R.setPosition(T + 32), [U, 32]);
    }
    if (B(S)) {
      const C = n.toNumber(R.readBytes(c)),
        q = T + C,
        M = [];
      for (let N = 0; N < H; ++N) {
        R.setPosition(q + N * 32);
        const [z] = i(R, S, { checksumAddress: F, staticPosition: q });
        M.push(z);
      }
      return (R.setPosition(T + 32), [M, 32]);
    }
    let k = 0;
    const O = [];
    for (let C = 0; C < H; ++C) {
      const [q, M] = i(R, S, { checksumAddress: F, staticPosition: T + k });
      ((k += M), O.push(q));
    }
    return [O, k];
  }
  function f(R) {
    return [n.toBoolean(R.readBytes(32), { size: 32 }), 32];
  }
  function m(R, S, { staticPosition: x }) {
    const [F, H] = S.type.split("bytes");
    if (!H) {
      const k = n.toNumber(R.readBytes(32));
      R.setPosition(x + k);
      const O = n.toNumber(R.readBytes(32));
      if (O === 0) return (R.setPosition(x + 32), ["0x", 32]);
      const C = R.readBytes(O);
      return (R.setPosition(x + 32), [o.fromBytes(C), 32]);
    }
    return [o.fromBytes(R.readBytes(Number.parseInt(H, 10), 32)), 32];
  }
  function g(R, S) {
    const x = S.type.startsWith("int"),
      F = Number.parseInt(S.type.split("int")[1] || "256", 10),
      H = R.readBytes(32);
    return [F > 48 ? n.toBigInt(H, { signed: x }) : n.toNumber(H, { signed: x }), 32];
  }
  function h(R, S, x) {
    const { checksumAddress: F, staticPosition: H } = x,
      T = S.components.length === 0 || S.components.some(({ name: C }) => !C),
      k = T ? [] : {};
    let O = 0;
    if (B(S)) {
      const C = n.toNumber(R.readBytes(c)),
        q = H + C;
      for (let M = 0; M < S.components.length; ++M) {
        const N = S.components[M];
        R.setPosition(q + O);
        const [z, $] = i(R, N, { checksumAddress: F, staticPosition: q });
        ((O += $), (k[T ? M : N == null ? void 0 : N.name] = z));
      }
      return (R.setPosition(H + 32), [k, 32]);
    }
    for (let C = 0; C < S.components.length; ++C) {
      const q = S.components[C],
        [M, N] = i(R, q, { checksumAddress: F, staticPosition: H });
      ((k[T ? C : q == null ? void 0 : q.name] = M), (O += N));
    }
    return [k, O];
  }
  function b(R, { staticPosition: S }) {
    const x = n.toNumber(R.readBytes(32)),
      F = S + x;
    R.setPosition(F);
    const H = n.toNumber(R.readBytes(32));
    if (H === 0) return (R.setPosition(S + 32), ["", 32]);
    const T = R.readBytes(H, 32),
      k = n.toString(n.trimLeft(T));
    return (R.setPosition(S + 32), [k, 32]);
  }
  function v({ checksumAddress: R, parameters: S, values: x }) {
    const F = [];
    for (let H = 0; H < S.length; H++) F.push(_({ checksumAddress: R, parameter: S[H], value: x[H] }));
    return F;
  }
  function _({ checksumAddress: R = !1, parameter: S, value: x }) {
    const F = S,
      H = A(F.type);
    if (H) {
      const [T, k] = H;
      return d(x, { checksumAddress: R, length: T, parameter: { ...F, type: k } });
    }
    if (F.type === "tuple") return w(x, { checksumAddress: R, parameter: F });
    if (F.type === "address") return P(x, { checksum: R });
    if (F.type === "bool") return p(x);
    if (F.type.startsWith("uint") || F.type.startsWith("int")) {
      const T = F.type.startsWith("int"),
        [, , k = "256"] = s.integerRegex.exec(F.type) ?? [];
      return y(x, { signed: T, size: Number(k) });
    }
    if (F.type.startsWith("bytes")) return j(x, { type: F.type });
    if (F.type === "string") return I(x);
    throw new e.InvalidTypeError(F.type);
  }
  function E(R) {
    let S = 0;
    for (let T = 0; T < R.length; T++) {
      const { dynamic: k, encoded: O } = R[T];
      k ? (S += 32) : (S += o.size(O));
    }
    const x = [],
      F = [];
    let H = 0;
    for (let T = 0; T < R.length; T++) {
      const { dynamic: k, encoded: O } = R[T];
      k ? (x.push(o.fromNumber(S + H, { size: 32 })), F.push(O), (H += o.size(O))) : x.push(O);
    }
    return o.concat(...x, ...F);
  }
  function P(R, S) {
    const { checksum: x = !1 } = S;
    return (r.assert(R, { strict: x }), { dynamic: !1, encoded: o.padLeft(R.toLowerCase()) });
  }
  function d(R, S) {
    const { checksumAddress: x, length: F, parameter: H } = S,
      T = F === null;
    if (!Array.isArray(R)) throw new e.InvalidArrayError(R);
    if (!T && R.length !== F)
      throw new e.ArrayLengthMismatchError({ expectedLength: F, givenLength: R.length, type: `${H.type}[${F}]` });
    let k = !1;
    const O = [];
    for (let C = 0; C < R.length; C++) {
      const q = _({ checksumAddress: x, parameter: H, value: R[C] });
      (q.dynamic && (k = !0), O.push(q));
    }
    if (T || k) {
      const C = E(O);
      if (T) {
        const q = o.fromNumber(O.length, { size: 32 });
        return { dynamic: !0, encoded: O.length > 0 ? o.concat(q, C) : q };
      }
      if (k) return { dynamic: !0, encoded: C };
    }
    return { dynamic: !1, encoded: o.concat(...O.map(({ encoded: C }) => C)) };
  }
  function j(R, { type: S }) {
    const [, x] = S.split("bytes"),
      F = o.size(R);
    if (!x) {
      let H = R;
      return (
        F % 32 !== 0 && (H = o.padRight(H, Math.ceil((R.length - 2) / 2 / 32) * 32)),
        { dynamic: !0, encoded: o.concat(o.padLeft(o.fromNumber(F, { size: 32 })), H) }
      );
    }
    if (F !== Number.parseInt(x, 10))
      throw new e.BytesSizeMismatchError({ expectedSize: Number.parseInt(x, 10), value: R });
    return { dynamic: !1, encoded: o.padRight(R) };
  }
  function p(R) {
    if (typeof R != "boolean")
      throw new t.BaseError(`Invalid boolean value: "${R}" (type: ${typeof R}). Expected: \`true\` or \`false\`.`);
    return { dynamic: !1, encoded: o.padLeft(o.fromBoolean(R)) };
  }
  function y(R, { signed: S, size: x }) {
    if (typeof x == "number") {
      const F = 2n ** (BigInt(x) - (S ? 1n : 0n)) - 1n,
        H = S ? -F - 1n : 0n;
      if (R > F || R < H)
        throw new o.IntegerOutOfRangeError({
          max: F.toString(),
          min: H.toString(),
          signed: S,
          size: x / 8,
          value: R.toString(),
        });
    }
    return { dynamic: !1, encoded: o.fromNumber(R, { size: 32, signed: S }) };
  }
  function I(R) {
    const S = o.fromString(R),
      x = Math.ceil(o.size(S) / 32),
      F = [];
    for (let H = 0; H < x; H++) F.push(o.padRight(o.slice(S, H * 32, (H + 1) * 32)));
    return { dynamic: !0, encoded: o.concat(o.padRight(o.fromNumber(o.size(S), { size: 32 })), ...F) };
  }
  function w(R, S) {
    const { checksumAddress: x, parameter: F } = S;
    let H = !1;
    const T = [];
    for (let k = 0; k < F.components.length; k++) {
      const O = F.components[k],
        C = Array.isArray(R) ? k : O.name,
        q = _({ checksumAddress: x, parameter: O, value: R[C] });
      (T.push(q), q.dynamic && (H = !0));
    }
    return { dynamic: H, encoded: H ? E(T) : o.concat(...T.map(({ encoded: k }) => k)) };
  }
  function A(R) {
    const S = R.match(/^(.*)\[(\d+)?\]$/);
    return S ? [S[2] ? Number(S[2]) : null, S[1]] : void 0;
  }
  function B(R) {
    var F;
    const { type: S } = R;
    if (S === "string" || S === "bytes" || S.endsWith("[]")) return !0;
    if (S === "tuple") return (F = R.components) == null ? void 0 : F.some(B);
    const x = A(R.type);
    return !!(x && B({ ...R, type: x[1] }));
  }
  return Te;
}
var St = {},
  bh;
function t_() {
  if (bh) return St;
  ((bh = 1),
    Object.defineProperty(St, "__esModule", { value: !0 }),
    (St.RecursiveReadLimitExceededError = St.PositionOutOfBoundsError = St.NegativeOffsetError = void 0),
    (St.create = n));
  const e = ct(),
    r = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new s({ count: this.recursiveReadCount + 1, limit: this.recursiveReadLimit });
      },
      assertPosition(i) {
        if (i < 0 || i > this.bytes.length - 1) throw new o({ length: this.bytes.length, position: i });
      },
      decrementPosition(i) {
        if (i < 0) throw new t({ offset: i });
        const a = this.position - i;
        (this.assertPosition(a), (this.position = a));
      },
      getReadCount(i) {
        return this.positionReadCount.get(i || this.position) || 0;
      },
      incrementPosition(i) {
        if (i < 0) throw new t({ offset: i });
        const a = this.position + i;
        (this.assertPosition(a), (this.position = a));
      },
      inspectByte(i) {
        const a = i ?? this.position;
        return (this.assertPosition(a), this.bytes[a]);
      },
      inspectBytes(i, a) {
        const c = a ?? this.position;
        return (this.assertPosition(c + i - 1), this.bytes.subarray(c, c + i));
      },
      inspectUint8(i) {
        const a = i ?? this.position;
        return (this.assertPosition(a), this.bytes[a]);
      },
      inspectUint16(i) {
        const a = i ?? this.position;
        return (this.assertPosition(a + 1), this.dataView.getUint16(a));
      },
      inspectUint24(i) {
        const a = i ?? this.position;
        return (this.assertPosition(a + 2), (this.dataView.getUint16(a) << 8) + this.dataView.getUint8(a + 2));
      },
      inspectUint32(i) {
        const a = i ?? this.position;
        return (this.assertPosition(a + 3), this.dataView.getUint32(a));
      },
      pushByte(i) {
        (this.assertPosition(this.position), (this.bytes[this.position] = i), this.position++);
      },
      pushBytes(i) {
        (this.assertPosition(this.position + i.length - 1),
          this.bytes.set(i, this.position),
          (this.position += i.length));
      },
      pushUint8(i) {
        (this.assertPosition(this.position), (this.bytes[this.position] = i), this.position++);
      },
      pushUint16(i) {
        (this.assertPosition(this.position + 1), this.dataView.setUint16(this.position, i), (this.position += 2));
      },
      pushUint24(i) {
        (this.assertPosition(this.position + 2),
          this.dataView.setUint16(this.position, i >> 8),
          this.dataView.setUint8(this.position + 2, i & 255),
          (this.position += 3));
      },
      pushUint32(i) {
        (this.assertPosition(this.position + 3), this.dataView.setUint32(this.position, i), (this.position += 4));
      },
      readByte() {
        (this.assertReadLimit(), this._touch());
        const i = this.inspectByte();
        return (this.position++, i);
      },
      readBytes(i, a) {
        (this.assertReadLimit(), this._touch());
        const c = this.inspectBytes(i);
        return ((this.position += a ?? i), c);
      },
      readUint8() {
        (this.assertReadLimit(), this._touch());
        const i = this.inspectUint8();
        return ((this.position += 1), i);
      },
      readUint16() {
        (this.assertReadLimit(), this._touch());
        const i = this.inspectUint16();
        return ((this.position += 2), i);
      },
      readUint24() {
        (this.assertReadLimit(), this._touch());
        const i = this.inspectUint24();
        return ((this.position += 3), i);
      },
      readUint32() {
        (this.assertReadLimit(), this._touch());
        const i = this.inspectUint32();
        return ((this.position += 4), i);
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(i) {
        const a = this.position;
        return (this.assertPosition(i), (this.position = i), () => (this.position = a));
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY) return;
        const i = this.getReadCount();
        (this.positionReadCount.set(this.position, i + 1), i > 0 && this.recursiveReadCount++);
      },
    };
  function n(i, { recursiveReadLimit: a = 8192 } = {}) {
    const c = Object.create(r);
    return (
      (c.bytes = i),
      (c.dataView = new DataView(i.buffer, i.byteOffset, i.byteLength)),
      (c.positionReadCount = new Map()),
      (c.recursiveReadLimit = a),
      c
    );
  }
  class t extends e.BaseError {
    constructor({ offset: a }) {
      (super(`Offset \`${a}\` cannot be negative.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Cursor.NegativeOffsetError",
        }));
    }
  }
  St.NegativeOffsetError = t;
  class o extends e.BaseError {
    constructor({ length: a, position: c }) {
      (super(`Position \`${c}\` is out of bounds (\`0 < position < ${a}\`).`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Cursor.PositionOutOfBoundsError",
        }));
    }
  }
  St.PositionOutOfBoundsError = o;
  class s extends e.BaseError {
    constructor({ count: a, limit: c }) {
      (super(`Recursive read limit of \`${c}\` exceeded (recursive read count: \`${a}\`).`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Cursor.RecursiveReadLimitExceededError",
        }));
    }
  }
  return ((St.RecursiveReadLimitExceededError = s), St);
}
var mh;
function ei() {
  if (mh) return Ae;
  ((mh = 1),
    Object.defineProperty(Ae, "__esModule", { value: !0 }),
    (Ae.InvalidTypeError =
      Ae.InvalidArrayError =
      Ae.LengthMismatchError =
      Ae.BytesSizeMismatchError =
      Ae.ArrayLengthMismatchError =
      Ae.ZeroDataError =
      Ae.DataSizeTooSmallError =
        void 0),
    (Ae.decode = c),
    (Ae.encode = u),
    (Ae.encodePacked = l),
    (Ae.format = f),
    (Ae.from = m));
  const e = ir(),
    r = Ju(),
    n = Bt(),
    t = ct(),
    o = Ne(),
    s = _6(),
    i = t_(),
    a = Lf();
  function c(d, j, p = {}) {
    const { as: y = "Array", checksumAddress: I = !1 } = p,
      w = typeof j == "string" ? n.fromHex(j) : j,
      A = i.create(w);
    if (n.size(w) === 0 && d.length > 0) throw new h();
    if (n.size(w) && n.size(w) < 32)
      throw new g({ data: typeof j == "string" ? j : o.fromBytes(j), parameters: d, size: n.size(w) });
    let B = 0;
    const R = y === "Array" ? [] : {};
    for (let S = 0; S < d.length; ++S) {
      const x = d[S];
      A.setPosition(B);
      const [F, H] = s.decodeParameter(A, x, { checksumAddress: I, staticPosition: 0 });
      ((B += H), y === "Array" ? R.push(F) : (R[x.name ?? S] = F));
    }
    return R;
  }
  function u(d, j, p) {
    const { checksumAddress: y = !1 } = p ?? {};
    if (d.length !== j.length) throw new _({ expectedLength: d.length, givenLength: j.length });
    const I = s.prepareParameters({ checksumAddress: y, parameters: d, values: j }),
      w = s.encode(I);
    return w.length === 0 ? "0x" : w;
  }
  function l(d, j) {
    if (d.length !== j.length) throw new _({ expectedLength: d.length, givenLength: j.length });
    const p = [];
    for (let y = 0; y < d.length; y++) {
      const I = d[y],
        w = j[y];
      p.push(l.encode(I, w));
    }
    return o.concat(...p);
  }
  (function (d) {
    function j(p, y, I = !1) {
      if (p === "address") {
        const R = y;
        return (r.assert(R), o.padLeft(R.toLowerCase(), I ? 32 : 0));
      }
      if (p === "string") return o.fromString(y);
      if (p === "bytes") return y;
      if (p === "bool") return o.padLeft(o.fromBoolean(y), I ? 32 : 1);
      const w = p.match(a.integerRegex);
      if (w) {
        const [R, S, x = "256"] = w,
          F = Number.parseInt(x, 10) / 8;
        return o.fromNumber(y, { size: I ? 32 : F, signed: S === "int" });
      }
      const A = p.match(a.bytesRegex);
      if (A) {
        const [R, S] = A;
        if (Number.parseInt(S, 10) !== (y.length - 2) / 2)
          throw new v({ expectedSize: Number.parseInt(S, 10), value: y });
        return o.padRight(y, I ? 32 : 0);
      }
      const B = p.match(a.arrayRegex);
      if (B && Array.isArray(y)) {
        const [R, S] = B,
          x = [];
        for (let F = 0; F < y.length; F++) x.push(j(S, y[F], !0));
        return x.length === 0 ? "0x" : o.concat(...x);
      }
      throw new P(p);
    }
    d.encode = j;
  })(l || (Ae.encodePacked = l = {}));
  function f(d) {
    return e.formatAbiParameters(d);
  }
  function m(d) {
    return (Array.isArray(d) && typeof d[0] == "string") || typeof d == "string" ? e.parseAbiParameters(d) : d;
  }
  class g extends t.BaseError {
    constructor({ data: j, parameters: p, size: y }) {
      (super(`Data size of ${y} bytes is too small for given parameters.`, {
        metaMessages: [`Params: (${e.formatAbiParameters(p)})`, `Data:   ${j} (${y} bytes)`],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.DataSizeTooSmallError",
        }));
    }
  }
  Ae.DataSizeTooSmallError = g;
  class h extends t.BaseError {
    constructor() {
      (super('Cannot decode zero data ("0x") with ABI parameters.'),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.ZeroDataError",
        }));
    }
  }
  Ae.ZeroDataError = h;
  class b extends t.BaseError {
    constructor({ expectedLength: j, givenLength: p, type: y }) {
      (super(`Array length mismatch for type \`${y}\`. Expected: \`${j}\`. Given: \`${p}\`.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.ArrayLengthMismatchError",
        }));
    }
  }
  Ae.ArrayLengthMismatchError = b;
  class v extends t.BaseError {
    constructor({ expectedSize: j, value: p }) {
      (super(`Size of bytes "${p}" (bytes${o.size(p)}) does not match expected size (bytes${j}).`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.BytesSizeMismatchError",
        }));
    }
  }
  Ae.BytesSizeMismatchError = v;
  class _ extends t.BaseError {
    constructor({ expectedLength: j, givenLength: p }) {
      (super(
        [
          "ABI encoding parameters/values length mismatch.",
          `Expected length (parameters): ${j}`,
          `Given length (values): ${p}`,
        ].join(`
`),
      ),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.LengthMismatchError",
        }));
    }
  }
  Ae.LengthMismatchError = _;
  class E extends t.BaseError {
    constructor(j) {
      (super(`Value \`${j}\` is not a valid array.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.InvalidArrayError",
        }));
    }
  }
  Ae.InvalidArrayError = E;
  class P extends t.BaseError {
    constructor(j) {
      (super(`Type \`${j}\` is not a valid ABI Type.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiParameters.InvalidTypeError",
        }));
    }
  }
  return ((Ae.InvalidTypeError = P), Ae);
}
var Ye = {},
  ft = {},
  hh;
function v6() {
  if (hh) return ft;
  ((hh = 1),
    Object.defineProperty(ft, "__esModule", { value: !0 }),
    (ft.toBytes = o),
    (ft.toHex = s),
    (ft.to = i),
    (ft.decodeRlpCursor = a),
    (ft.readLength = c),
    (ft.readList = u),
    (ft.from = l),
    (ft.fromBytes = f),
    (ft.fromHex = m));
  const e = Bt(),
    r = ct(),
    n = Ne(),
    t = t_();
  function o(_) {
    return i(_, "Bytes");
  }
  function s(_) {
    return i(_, "Hex");
  }
  function i(_, E) {
    const P = E ?? (typeof _ == "string" ? "Hex" : "Bytes"),
      d = (() => {
        if (typeof _ == "string") {
          if (_.length > 3 && _.length % 2 !== 0) throw new n.InvalidLengthError(_);
          return e.fromHex(_);
        }
        return _;
      })(),
      j = t.create(d, { recursiveReadLimit: Number.POSITIVE_INFINITY });
    return a(j, P);
  }
  function a(_, E = "Hex") {
    if (_.bytes.length === 0) return E === "Hex" ? n.fromBytes(_.bytes) : _.bytes;
    const P = _.readByte();
    if ((P < 128 && _.decrementPosition(1), P < 192)) {
      const j = c(_, P, 128),
        p = _.readBytes(j);
      return E === "Hex" ? n.fromBytes(p) : p;
    }
    const d = c(_, P, 192);
    return u(_, d, E);
  }
  function c(_, E, P) {
    if (P === 128 && E < 128) return 1;
    if (E <= P + 55) return E - P;
    if (E === P + 55 + 1) return _.readUint8();
    if (E === P + 55 + 2) return _.readUint16();
    if (E === P + 55 + 3) return _.readUint24();
    if (E === P + 55 + 4) return _.readUint32();
    throw new r.BaseError("Invalid RLP prefix");
  }
  function u(_, E, P) {
    const d = _.position,
      j = [];
    for (; _.position - d < E; ) j.push(a(_, P));
    return j;
  }
  function l(_, E) {
    const { as: P } = E,
      d = g(_),
      j = t.create(new Uint8Array(d.length));
    return (d.encode(j), P === "Hex" ? n.fromBytes(j.bytes) : j.bytes);
  }
  function f(_, E = {}) {
    const { as: P = "Bytes" } = E;
    return l(_, { as: P });
  }
  function m(_, E = {}) {
    const { as: P = "Hex" } = E;
    return l(_, { as: P });
  }
  function g(_) {
    return Array.isArray(_) ? h(_.map((E) => g(E))) : b(_);
  }
  function h(_) {
    const E = _.reduce((j, p) => j + p.length, 0),
      P = v(E);
    return {
      length: E <= 55 ? 1 + E : 1 + P + E,
      encode(j) {
        E <= 55
          ? j.pushByte(192 + E)
          : (j.pushByte(247 + P),
            P === 1 ? j.pushUint8(E) : P === 2 ? j.pushUint16(E) : P === 3 ? j.pushUint24(E) : j.pushUint32(E));
        for (const { encode: p } of _) p(j);
      },
    };
  }
  function b(_) {
    const E = typeof _ == "string" ? e.fromHex(_) : _,
      P = v(E.length);
    return {
      length: E.length === 1 && E[0] < 128 ? 1 : E.length <= 55 ? 1 + E.length : 1 + P + E.length,
      encode(j) {
        E.length === 1 && E[0] < 128
          ? j.pushBytes(E)
          : E.length <= 55
            ? (j.pushByte(128 + E.length), j.pushBytes(E))
            : (j.pushByte(183 + P),
              P === 1
                ? j.pushUint8(E.length)
                : P === 2
                  ? j.pushUint16(E.length)
                  : P === 3
                    ? j.pushUint24(E.length)
                    : j.pushUint32(E.length),
              j.pushBytes(E));
      },
    };
  }
  function v(_) {
    if (_ <= 255) return 1;
    if (_ <= 65535) return 2;
    if (_ <= 16777215) return 3;
    if (_ <= 4294967295) return 4;
    throw new r.BaseError("Length is too large.");
  }
  return ft;
}
var be = {},
  yh;
function r_() {
  if (yh) return be;
  ((yh = 1),
    Object.defineProperty(be, "__esModule", { value: !0 }),
    (be.InvalidVError =
      be.InvalidYParityError =
      be.InvalidSError =
      be.InvalidRError =
      be.MissingPropertiesError =
      be.InvalidSerializedSizeError =
        void 0),
    (be.assert = i),
    (be.fromBytes = a),
    (be.fromHex = c),
    (be.extract = u),
    (be.from = l),
    (be.fromDerBytes = f),
    (be.fromDerHex = m),
    (be.fromLegacy = g),
    (be.fromRpc = h),
    (be.fromTuple = b),
    (be.toBytes = v),
    (be.toHex = _),
    (be.toDerBytes = E),
    (be.toDerHex = P),
    (be.toLegacy = d),
    (be.toRpc = j),
    (be.toTuple = p),
    (be.validate = y),
    (be.vToYParity = I),
    (be.yParityToV = w));
  const e = Dr(),
    r = Bt(),
    n = ct(),
    t = Ne(),
    o = $u(),
    s = Lf();
  function i(H, T = {}) {
    const { recovered: k } = T;
    if (typeof H.r > "u") throw new B({ signature: H });
    if (typeof H.s > "u") throw new B({ signature: H });
    if (k && typeof H.yParity > "u") throw new B({ signature: H });
    if (H.r < 0n || H.r > s.maxUint256) throw new R({ value: H.r });
    if (H.s < 0n || H.s > s.maxUint256) throw new S({ value: H.s });
    if (typeof H.yParity == "number" && H.yParity !== 0 && H.yParity !== 1) throw new x({ value: H.yParity });
  }
  function a(H) {
    return c(t.fromBytes(H));
  }
  function c(H) {
    if (H.length !== 130 && H.length !== 132) throw new A({ signature: H });
    const T = BigInt(t.slice(H, 0, 32)),
      k = BigInt(t.slice(H, 32, 64)),
      O = (() => {
        const C = +`0x${H.slice(130)}`;
        if (!Number.isNaN(C))
          try {
            return I(C);
          } catch {
            throw new x({ value: C });
          }
      })();
    return typeof O > "u" ? { r: T, s: k } : { r: T, s: k, yParity: O };
  }
  function u(H) {
    if (!(typeof H.r > "u") && !(typeof H.s > "u")) return l(H);
  }
  function l(H) {
    const T =
      typeof H == "string"
        ? c(H)
        : H instanceof Uint8Array
          ? a(H)
          : typeof H.r == "string"
            ? h(H)
            : H.v
              ? g(H)
              : { r: H.r, s: H.s, ...(typeof H.yParity < "u" ? { yParity: H.yParity } : {}) };
    return (i(T), T);
  }
  function f(H) {
    return m(t.fromBytes(H));
  }
  function m(H) {
    const { r: T, s: k } = e.secp256k1.Signature.fromDER(t.from(H).slice(2));
    return { r: T, s: k };
  }
  function g(H) {
    return { r: H.r, s: H.s, yParity: I(H.v) };
  }
  function h(H) {
    const T = (() => {
      const k = H.v ? Number(H.v) : void 0;
      let O = H.yParity ? Number(H.yParity) : void 0;
      if ((typeof k == "number" && typeof O != "number" && (O = I(k)), typeof O != "number"))
        throw new x({ value: H.yParity });
      return O;
    })();
    return { r: BigInt(H.r), s: BigInt(H.s), yParity: T };
  }
  function b(H) {
    const [T, k, O] = H;
    return l({ r: k === "0x" ? 0n : BigInt(k), s: O === "0x" ? 0n : BigInt(O), yParity: T === "0x" ? 0 : Number(T) });
  }
  function v(H) {
    return r.fromHex(_(H));
  }
  function _(H) {
    i(H);
    const T = H.r,
      k = H.s;
    return t.concat(
      t.fromNumber(T, { size: 32 }),
      t.fromNumber(k, { size: 32 }),
      typeof H.yParity == "number" ? t.fromNumber(w(H.yParity), { size: 1 }) : "0x",
    );
  }
  function E(H) {
    return new e.secp256k1.Signature(H.r, H.s).toDERRawBytes();
  }
  function P(H) {
    return `0x${new e.secp256k1.Signature(H.r, H.s).toDERHex()}`;
  }
  function d(H) {
    return { r: H.r, s: H.s, v: w(H.yParity) };
  }
  function j(H) {
    const { r: T, s: k, yParity: O } = H;
    return { r: t.fromNumber(T, { size: 32 }), s: t.fromNumber(k, { size: 32 }), yParity: O === 0 ? "0x0" : "0x1" };
  }
  function p(H) {
    const { r: T, s: k, yParity: O } = H;
    return [
      O ? "0x01" : "0x",
      T === 0n ? "0x" : t.trimLeft(t.fromNumber(T)),
      k === 0n ? "0x" : t.trimLeft(t.fromNumber(k)),
    ];
  }
  function y(H, T = {}) {
    try {
      return (i(H, T), !0);
    } catch {
      return !1;
    }
  }
  function I(H) {
    if (H === 0 || H === 27) return 0;
    if (H === 1 || H === 28) return 1;
    if (H >= 35) return H % 2 === 0 ? 1 : 0;
    throw new F({ value: H });
  }
  function w(H) {
    if (H === 0) return 27;
    if (H === 1) return 28;
    throw new x({ value: H });
  }
  class A extends n.BaseError {
    constructor({ signature: T }) {
      (super(`Value \`${T}\` is an invalid signature size.`, {
        metaMessages: ["Expected: 64 bytes or 65 bytes.", `Received ${t.size(t.from(T))} bytes.`],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Signature.InvalidSerializedSizeError",
        }));
    }
  }
  be.InvalidSerializedSizeError = A;
  class B extends n.BaseError {
    constructor({ signature: T }) {
      (super(`Signature \`${o.stringify(T)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Signature.MissingPropertiesError",
        }));
    }
  }
  be.MissingPropertiesError = B;
  class R extends n.BaseError {
    constructor({ value: T }) {
      (super(`Value \`${T}\` is an invalid r value. r must be a positive integer less than 2^256.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Signature.InvalidRError",
        }));
    }
  }
  be.InvalidRError = R;
  class S extends n.BaseError {
    constructor({ value: T }) {
      (super(`Value \`${T}\` is an invalid s value. s must be a positive integer less than 2^256.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Signature.InvalidSError",
        }));
    }
  }
  be.InvalidSError = S;
  class x extends n.BaseError {
    constructor({ value: T }) {
      (super(`Value \`${T}\` is an invalid y-parity value. Y-parity must be 0 or 1.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Signature.InvalidYParityError",
        }));
    }
  }
  be.InvalidYParityError = x;
  class F extends n.BaseError {
    constructor({ value: T }) {
      (super(`Value \`${T}\` is an invalid v value. v must be 27, 28 or >=35.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "Signature.InvalidVError",
        }));
    }
  }
  return ((be.InvalidVError = F), be);
}
var ph;
function E6() {
  if (ph) return Ye;
  ((ph = 1),
    Object.defineProperty(Ye, "__esModule", { value: !0 }),
    (Ye.from = o),
    (Ye.fromRpc = s),
    (Ye.fromRpcList = i),
    (Ye.fromTuple = a),
    (Ye.fromTupleList = c),
    (Ye.getSignPayload = u),
    (Ye.hash = l),
    (Ye.toRpc = f),
    (Ye.toRpcList = m),
    (Ye.toTuple = g),
    (Ye.toTupleList = h));
  const e = Uf(),
    r = Ne(),
    n = v6(),
    t = r_();
  function o(b, v = {}) {
    return typeof b.chainId == "string" ? s(b) : { ...b, ...v.signature };
  }
  function s(b) {
    const { address: v, chainId: _, nonce: E } = b,
      P = t.extract(b);
    return { address: v, chainId: Number(_), nonce: BigInt(E), ...P };
  }
  function i(b) {
    return b.map(s);
  }
  function a(b) {
    const [v, _, E, P, d, j] = b;
    let p = { address: _, chainId: v === "0x" ? 0 : Number(v), nonce: E === "0x" ? 0n : BigInt(E) };
    return (P && d && j && (p = { ...p, ...t.fromTuple([P, d, j]) }), o(p));
  }
  function c(b) {
    const v = [];
    for (const _ of b) v.push(a(_));
    return v;
  }
  function u(b) {
    return l(b, { presign: !0 });
  }
  function l(b, v = {}) {
    const { presign: _ } = v;
    return e.keccak256(
      r.concat("0x05", n.fromHex(g(_ ? { address: b.address, chainId: b.chainId, nonce: b.nonce } : b))),
    );
  }
  function f(b) {
    const { address: v, chainId: _, nonce: E, ...P } = b;
    return { address: v, chainId: r.fromNumber(_), nonce: r.fromNumber(E), ...t.toRpc(P) };
  }
  function m(b) {
    return b.map(f);
  }
  function g(b) {
    const { address: v, chainId: _, nonce: E } = b,
      P = t.extract(b);
    return [_ ? r.fromNumber(_) : "0x", v, E ? r.fromNumber(E) : "0x", ...(P ? t.toTuple(P) : [])];
  }
  function h(b) {
    if (!b || b.length === 0) return [];
    const v = [];
    for (const _ of b) v.push(g(_));
    return v;
  }
  return Ye;
}
var at = {},
  Cr = {},
  gh;
function j6() {
  if (gh) return Cr;
  ((gh = 1),
    Object.defineProperty(Cr, "__esModule", { value: !0 }),
    (Cr.extraEntropy = void 0),
    (Cr.setExtraEntropy = e),
    (Cr.extraEntropy = !1));
  function e(r) {
    Cr.extraEntropy = r;
  }
  return Cr;
}
var _h;
function w6() {
  if (_h) return at;
  ((_h = 1),
    Object.defineProperty(at, "__esModule", { value: !0 }),
    (at.noble = void 0),
    (at.createKeyPair = i),
    (at.getPublicKey = a),
    (at.getSharedSecret = c),
    (at.randomPrivateKey = u),
    (at.recoverAddress = l),
    (at.recoverPublicKey = f),
    (at.sign = m),
    (at.verify = g));
  const e = Dr(),
    r = Ju(),
    n = Bt(),
    t = Ne(),
    o = j6(),
    s = e_();
  at.noble = e.secp256k1;
  function i(h = {}) {
    const { as: b = "Hex" } = h,
      v = u({ as: b }),
      _ = a({ privateKey: v });
    return { privateKey: v, publicKey: _ };
  }
  function a(h) {
    const { privateKey: b } = h,
      v = e.secp256k1.ProjectivePoint.fromPrivateKey(t.from(b).slice(2));
    return s.from(v);
  }
  function c(h) {
    const { as: b = "Hex", privateKey: v, publicKey: _ } = h,
      d = e.secp256k1.ProjectivePoint.fromHex(s.toHex(_).slice(2))
        .multiply(e.secp256k1.utils.normPrivateKeyToScalar(t.from(v).slice(2)))
        .toRawBytes(!0);
    return b === "Hex" ? t.fromBytes(d) : d;
  }
  function u(h = {}) {
    const { as: b = "Hex" } = h,
      v = e.secp256k1.utils.randomPrivateKey();
    return b === "Hex" ? t.fromBytes(v) : v;
  }
  function l(h) {
    return r.fromPublicKey(f(h));
  }
  function f(h) {
    const { payload: b, signature: v } = h,
      { r: _, s: E, yParity: P } = v,
      j = new e.secp256k1.Signature(BigInt(_), BigInt(E)).addRecoveryBit(P).recoverPublicKey(t.from(b).substring(2));
    return s.from(j);
  }
  function m(h) {
    const { extraEntropy: b = o.extraEntropy, hash: v, payload: _, privateKey: E } = h,
      {
        r: P,
        s: d,
        recovery: j,
      } = e.secp256k1.sign(n.from(_), n.from(E), {
        extraEntropy: typeof b == "boolean" ? b : t.from(b).slice(2),
        lowS: !0,
        ...(v ? { prehash: !0 } : {}),
      });
    return { r: P, s: d, yParity: j };
  }
  function g(h) {
    const { address: b, hash: v, payload: _, publicKey: E, signature: P } = h;
    return b
      ? r.isEqual(b, l({ payload: _, signature: P }))
      : e.secp256k1.verify(P, n.from(_), s.toBytes(E), ...(v ? [{ prehash: !0, lowS: !0 }] : []));
  }
  return at;
}
var vh;
function P6() {
  return (
    vh ||
      ((vh = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.InvalidWrappedSignatureError = e.suffixParameters = e.magicBytes = void 0),
          (e.assert = a),
          (e.from = c),
          (e.unwrap = u),
          (e.wrap = l),
          (e.validate = f));
        const r = ei(),
          n = E6(),
          t = ct(),
          o = Ne(),
          s = w6(),
          i = r_();
        ((e.magicBytes = "0x8010801080108010801080108010801080108010801080108010801080108010"),
          (e.suffixParameters = r.from(
            "(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data",
          )));
        function a(g) {
          if (typeof g == "string") {
            if (o.slice(g, -32) !== e.magicBytes) throw new m(g);
          } else i.assert(g.authorization);
        }
        function c(g) {
          return typeof g == "string" ? u(g) : g;
        }
        function u(g) {
          a(g);
          const h = o.toNumber(o.slice(g, -64, -32)),
            b = o.slice(g, -h - 64, -64),
            v = o.slice(g, 0, -h - 64),
            [_, E, P] = r.decode(e.suffixParameters, b);
          return {
            authorization: n.from({
              address: _.delegation,
              chainId: Number(_.chainId),
              nonce: _.nonce,
              yParity: _.yParity,
              r: _.r,
              s: _.s,
            }),
            signature: v,
            ...(P && P !== "0x" ? { data: P, to: E } : {}),
          };
        }
        function l(g) {
          const { data: h, signature: b } = g;
          a(g);
          const v = s.recoverAddress({
              payload: n.getSignPayload(g.authorization),
              signature: i.from(g.authorization),
            }),
            _ = r.encode(e.suffixParameters, [
              { ...g.authorization, delegation: g.authorization.address, chainId: BigInt(g.authorization.chainId) },
              g.to ?? v,
              h ?? "0x",
            ]),
            E = o.fromNumber(o.size(_), { size: 32 });
          return o.concat(b, _, E, e.magicBytes);
        }
        function f(g) {
          try {
            return (a(g), !0);
          } catch {
            return !1;
          }
        }
        class m extends t.BaseError {
          constructor(h) {
            (super(`Value \`${h}\` is an invalid ERC-8010 wrapped signature.`),
              Object.defineProperty(this, "name", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: "SignatureErc8010.InvalidWrappedSignatureError",
              }));
          }
        }
        e.InvalidWrappedSignatureError = m;
      })(Vd)),
    Vd
  );
}
var Eh;
function Yu() {
  return (
    Eh ||
      ((Eh = 1),
      Object.defineProperty(To, "__esModule", { value: !0 }),
      (To.SignatureErc8010 = void 0),
      (To.SignatureErc8010 = P6())),
    To
  );
}
var jh;
function Df() {
  if (jh) return Bs;
  ((jh = 1), Object.defineProperty(Bs, "__esModule", { value: !0 }), (Bs.isErc8010Signature = r));
  const e = Yu();
  function r(n) {
    return e.SignatureErc8010.validate(n);
  }
  return Bs;
}
var Os = {},
  wh;
function n_() {
  if (wh) return Os;
  ((wh = 1), Object.defineProperty(Os, "__esModule", { value: !0 }), (Os.parseErc6492Signature = n));
  const e = cr(),
    r = zf();
  function n(t) {
    if (!(0, r.isErc6492Signature)(t)) return { signature: t };
    const [o, s, i] = (0, e.decodeAbiParameters)([{ type: "address" }, { type: "bytes" }, { type: "bytes" }], t);
    return { address: o, data: s, signature: i };
  }
  return Os;
}
var xs = {},
  Ph;
function o_() {
  if (Ph) return xs;
  ((Ph = 1), Object.defineProperty(xs, "__esModule", { value: !0 }), (xs.parseErc8010Signature = t));
  const e = Yu(),
    r = te(),
    n = Df();
  function t(o) {
    if (!(0, n.isErc8010Signature)(o)) return { signature: o };
    const { authorization: s, to: i, ...a } = e.SignatureErc8010.unwrap(o);
    return {
      authorization: {
        address: s.address,
        chainId: s.chainId,
        nonce: Number(s.nonce),
        r: (0, r.numberToHex)(s.r, { size: 32 }),
        s: (0, r.numberToHex)(s.s, { size: 32 }),
        yParity: s.yParity,
      },
      ...(i ? { address: i } : {}),
      ...a,
    };
  }
  return xs;
}
var Cs = {},
  Ah;
function Gf() {
  if (Ah) return Cs;
  ((Ah = 1), Object.defineProperty(Cs, "__esModule", { value: !0 }), (Cs.recoverMessageAddress = n));
  const e = Xo(),
    r = lr();
  async function n({ message: t, signature: o }) {
    return (0, r.recoverAddress)({ hash: (0, e.hashMessage)(t), signature: o });
  }
  return Cs;
}
var qs = {},
  Th;
function Vf() {
  if (Th) return qs;
  ((Th = 1), Object.defineProperty(qs, "__esModule", { value: !0 }), (qs.recoverTypedDataAddress = n));
  const e = Qo(),
    r = lr();
  async function n(t) {
    const { domain: o, message: s, primaryType: i, signature: a, types: c } = t;
    return (0, r.recoverAddress)({
      hash: (0, e.hashTypedData)({ domain: o, message: s, primaryType: i, types: c }),
      signature: a,
    });
  }
  return qs;
}
var Ms = {},
  Sh;
function i_() {
  if (Sh) return Ms;
  ((Sh = 1), Object.defineProperty(Ms, "__esModule", { value: !0 }), (Ms.serializeErc6492Signature = o));
  const e = $f(),
    r = vt(),
    n = qe(),
    t = ve();
  function o(s) {
    const { address: i, data: a, signature: c, to: u = "hex" } = s,
      l = (0, n.concatHex)([
        (0, r.encodeAbiParameters)([{ type: "address" }, { type: "bytes" }, { type: "bytes" }], [i, a, c]),
        e.erc6492MagicBytes,
      ]);
    return u === "hex" ? l : (0, t.hexToBytes)(l);
  }
  return Ms;
}
var Hs = {},
  Ih;
function a_() {
  if (Ih) return Hs;
  ((Ih = 1), Object.defineProperty(Hs, "__esModule", { value: !0 }), (Hs.serializeErc8010Signature = n));
  const e = Yu(),
    r = ve();
  function n(t) {
    const { address: o, data: s, signature: i, to: a = "hex" } = t,
      c = e.SignatureErc8010.wrap({
        authorization: {
          address: t.authorization.address,
          chainId: t.authorization.chainId,
          nonce: BigInt(t.authorization.nonce),
          r: BigInt(t.authorization.r),
          s: BigInt(t.authorization.s),
          yParity: t.authorization.yParity,
        },
        data: s,
        signature: i,
        to: o,
      });
    return a === "hex" ? c : (0, r.hexToBytes)(c);
  }
  return Hs;
}
var ks = {},
  Rh;
function s_() {
  if (Rh) return ks;
  ((Rh = 1), Object.defineProperty(ks, "__esModule", { value: !0 }), (ks.verifyHash = t));
  const e = Qe(),
    r = Pt(),
    n = lr();
  async function t({ address: o, hash: s, signature: i }) {
    return (0, r.isAddressEqual)((0, e.getAddress)(o), await (0, n.recoverAddress)({ hash: s, signature: i }));
  }
  return ks;
}
var Fs = {},
  Bh;
function c_() {
  if (Bh) return Fs;
  ((Bh = 1), Object.defineProperty(Fs, "__esModule", { value: !0 }), (Fs.verifyMessage = t));
  const e = Qe(),
    r = Pt(),
    n = Gf();
  async function t({ address: o, message: s, signature: i }) {
    return (0, r.isAddressEqual)(
      (0, e.getAddress)(o),
      await (0, n.recoverMessageAddress)({ message: s, signature: i }),
    );
  }
  return Fs;
}
var Ns = {},
  Oh;
function u_() {
  if (Oh) return Ns;
  ((Oh = 1), Object.defineProperty(Ns, "__esModule", { value: !0 }), (Ns.verifyTypedData = t));
  const e = Qe(),
    r = Pt(),
    n = Vf();
  async function t(o) {
    const { address: s, domain: i, message: a, primaryType: c, signature: u, types: l } = o;
    return (0, r.isAddressEqual)(
      (0, e.getAddress)(s),
      await (0, n.recoverTypedDataAddress)({ domain: i, message: a, primaryType: c, signature: u, types: l }),
    );
  }
  return Ns;
}
var $s = {},
  xh;
function Wf() {
  if (xh) return $s;
  ((xh = 1), Object.defineProperty($s, "__esModule", { value: !0 }), ($s.getSerializedTransactionType = t));
  const e = tt(),
    r = st(),
    n = Be();
  function t(o) {
    const s = (0, r.sliceHex)(o, 0, 1);
    if (s === "0x04") return "eip7702";
    if (s === "0x03") return "eip4844";
    if (s === "0x02") return "eip1559";
    if (s === "0x01") return "eip2930";
    if (s !== "0x" && (0, n.hexToNumber)(s) >= 192) return "legacy";
    throw new e.InvalidSerializedTransactionTypeError({ serializedType: s });
  }
  return $s;
}
var ln = {},
  Ch;
function Kf() {
  if (Ch) return ln;
  ((Ch = 1),
    Object.defineProperty(ln, "__esModule", { value: !0 }),
    (ln.parseTransaction = m),
    (ln.toTransactionArray = E),
    (ln.parseAccessList = P));
  const e = _t(),
    r = tt(),
    n = et(),
    t = Fu(),
    o = Ge(),
    s = ar(),
    i = Wt(),
    a = Be(),
    c = Mf(),
    u = Hf(),
    l = Wu(),
    f = Wf();
  function m(p) {
    const y = (0, f.getSerializedTransactionType)(p);
    return y === "eip1559" ? b(p) : y === "eip2930" ? v(p) : y === "eip4844" ? h(p) : y === "eip7702" ? g(p) : _(p);
  }
  function g(p) {
    const y = E(p),
      [I, w, A, B, R, S, x, F, H, T, k, O, C] = y;
    if (y.length !== 10 && y.length !== 13)
      throw new r.InvalidSerializedTransactionError({
        attributes: {
          chainId: I,
          nonce: w,
          maxPriorityFeePerGas: A,
          maxFeePerGas: B,
          gas: R,
          to: S,
          value: x,
          data: F,
          accessList: H,
          authorizationList: T,
          ...(y.length > 9 ? { v: k, r: O, s: C } : {}),
        },
        serializedTransaction: p,
        type: "eip7702",
      });
    const q = { chainId: (0, a.hexToNumber)(I), type: "eip7702" };
    return (
      (0, o.isHex)(S) && S !== "0x" && (q.to = S),
      (0, o.isHex)(R) && R !== "0x" && (q.gas = (0, a.hexToBigInt)(R)),
      (0, o.isHex)(F) && F !== "0x" && (q.data = F),
      (0, o.isHex)(w) && (q.nonce = w === "0x" ? 0 : (0, a.hexToNumber)(w)),
      (0, o.isHex)(x) && x !== "0x" && (q.value = (0, a.hexToBigInt)(x)),
      (0, o.isHex)(B) && B !== "0x" && (q.maxFeePerGas = (0, a.hexToBigInt)(B)),
      (0, o.isHex)(A) && A !== "0x" && (q.maxPriorityFeePerGas = (0, a.hexToBigInt)(A)),
      H.length !== 0 && H !== "0x" && (q.accessList = P(H)),
      T.length !== 0 && T !== "0x" && (q.authorizationList = d(T)),
      (0, l.assertTransactionEIP7702)(q),
      { ...(y.length === 13 ? j(y) : void 0), ...q }
    );
  }
  function h(p) {
    const y = E(p),
      I = y.length === 4,
      w = I ? y[0] : y,
      A = I ? y.slice(1) : [],
      [B, R, S, x, F, H, T, k, O, C, q, M, N, z] = w,
      [$, U, G] = A;
    if (!(w.length === 11 || w.length === 14))
      throw new r.InvalidSerializedTransactionError({
        attributes: {
          chainId: B,
          nonce: R,
          maxPriorityFeePerGas: S,
          maxFeePerGas: x,
          gas: F,
          to: H,
          value: T,
          data: k,
          accessList: O,
          ...(w.length > 9 ? { v: M, r: N, s: z } : {}),
        },
        serializedTransaction: p,
        type: "eip4844",
      });
    const Z = { blobVersionedHashes: q, chainId: (0, a.hexToNumber)(B), to: H, type: "eip4844" };
    return (
      (0, o.isHex)(F) && F !== "0x" && (Z.gas = (0, a.hexToBigInt)(F)),
      (0, o.isHex)(k) && k !== "0x" && (Z.data = k),
      (0, o.isHex)(R) && (Z.nonce = R === "0x" ? 0 : (0, a.hexToNumber)(R)),
      (0, o.isHex)(T) && T !== "0x" && (Z.value = (0, a.hexToBigInt)(T)),
      (0, o.isHex)(C) && C !== "0x" && (Z.maxFeePerBlobGas = (0, a.hexToBigInt)(C)),
      (0, o.isHex)(x) && x !== "0x" && (Z.maxFeePerGas = (0, a.hexToBigInt)(x)),
      (0, o.isHex)(S) && S !== "0x" && (Z.maxPriorityFeePerGas = (0, a.hexToBigInt)(S)),
      O.length !== 0 && O !== "0x" && (Z.accessList = P(O)),
      $ && U && G && (Z.sidecars = (0, t.toBlobSidecars)({ blobs: $, commitments: U, proofs: G })),
      (0, l.assertTransactionEIP4844)(Z),
      { ...(w.length === 14 ? j(w) : void 0), ...Z }
    );
  }
  function b(p) {
    const y = E(p),
      [I, w, A, B, R, S, x, F, H, T, k, O] = y;
    if (!(y.length === 9 || y.length === 12))
      throw new r.InvalidSerializedTransactionError({
        attributes: {
          chainId: I,
          nonce: w,
          maxPriorityFeePerGas: A,
          maxFeePerGas: B,
          gas: R,
          to: S,
          value: x,
          data: F,
          accessList: H,
          ...(y.length > 9 ? { v: T, r: k, s: O } : {}),
        },
        serializedTransaction: p,
        type: "eip1559",
      });
    const C = { chainId: (0, a.hexToNumber)(I), type: "eip1559" };
    return (
      (0, o.isHex)(S) && S !== "0x" && (C.to = S),
      (0, o.isHex)(R) && R !== "0x" && (C.gas = (0, a.hexToBigInt)(R)),
      (0, o.isHex)(F) && F !== "0x" && (C.data = F),
      (0, o.isHex)(w) && (C.nonce = w === "0x" ? 0 : (0, a.hexToNumber)(w)),
      (0, o.isHex)(x) && x !== "0x" && (C.value = (0, a.hexToBigInt)(x)),
      (0, o.isHex)(B) && B !== "0x" && (C.maxFeePerGas = (0, a.hexToBigInt)(B)),
      (0, o.isHex)(A) && A !== "0x" && (C.maxPriorityFeePerGas = (0, a.hexToBigInt)(A)),
      H.length !== 0 && H !== "0x" && (C.accessList = P(H)),
      (0, l.assertTransactionEIP1559)(C),
      { ...(y.length === 12 ? j(y) : void 0), ...C }
    );
  }
  function v(p) {
    const y = E(p),
      [I, w, A, B, R, S, x, F, H, T, k] = y;
    if (!(y.length === 8 || y.length === 11))
      throw new r.InvalidSerializedTransactionError({
        attributes: {
          chainId: I,
          nonce: w,
          gasPrice: A,
          gas: B,
          to: R,
          value: S,
          data: x,
          accessList: F,
          ...(y.length > 8 ? { v: H, r: T, s: k } : {}),
        },
        serializedTransaction: p,
        type: "eip2930",
      });
    const O = { chainId: (0, a.hexToNumber)(I), type: "eip2930" };
    return (
      (0, o.isHex)(R) && R !== "0x" && (O.to = R),
      (0, o.isHex)(B) && B !== "0x" && (O.gas = (0, a.hexToBigInt)(B)),
      (0, o.isHex)(x) && x !== "0x" && (O.data = x),
      (0, o.isHex)(w) && (O.nonce = w === "0x" ? 0 : (0, a.hexToNumber)(w)),
      (0, o.isHex)(S) && S !== "0x" && (O.value = (0, a.hexToBigInt)(S)),
      (0, o.isHex)(A) && A !== "0x" && (O.gasPrice = (0, a.hexToBigInt)(A)),
      F.length !== 0 && F !== "0x" && (O.accessList = P(F)),
      (0, l.assertTransactionEIP2930)(O),
      { ...(y.length === 11 ? j(y) : void 0), ...O }
    );
  }
  function _(p) {
    const y = (0, c.fromRlp)(p, "hex"),
      [I, w, A, B, R, S, x, F, H] = y;
    if (!(y.length === 6 || y.length === 9))
      throw new r.InvalidSerializedTransactionError({
        attributes: {
          nonce: I,
          gasPrice: w,
          gas: A,
          to: B,
          value: R,
          data: S,
          ...(y.length > 6 ? { v: x, r: F, s: H } : {}),
        },
        serializedTransaction: p,
        type: "legacy",
      });
    const T = { type: "legacy" };
    if (
      ((0, o.isHex)(B) && B !== "0x" && (T.to = B),
      (0, o.isHex)(A) && A !== "0x" && (T.gas = (0, a.hexToBigInt)(A)),
      (0, o.isHex)(S) && S !== "0x" && (T.data = S),
      (0, o.isHex)(I) && (T.nonce = I === "0x" ? 0 : (0, a.hexToNumber)(I)),
      (0, o.isHex)(R) && R !== "0x" && (T.value = (0, a.hexToBigInt)(R)),
      (0, o.isHex)(w) && w !== "0x" && (T.gasPrice = (0, a.hexToBigInt)(w)),
      (0, l.assertTransactionLegacy)(T),
      y.length === 6)
    )
      return T;
    const k = (0, o.isHex)(x) && x !== "0x" ? (0, a.hexToBigInt)(x) : 0n;
    if (H === "0x" && F === "0x") return (k > 0 && (T.chainId = Number(k)), T);
    const O = k,
      C = Number((O - 35n) / 2n);
    if (C > 0) T.chainId = C;
    else if (O !== 27n && O !== 28n) throw new r.InvalidLegacyVError({ v: O });
    return ((T.v = O), (T.s = H), (T.r = F), (T.yParity = O % 2n === 0n ? 1 : 0), T);
  }
  function E(p) {
    return (0, c.fromRlp)(`0x${p.slice(4)}`, "hex");
  }
  function P(p) {
    const y = [];
    for (let I = 0; I < p.length; I++) {
      const [w, A] = p[I];
      if (!(0, n.isAddress)(w, { strict: !1 })) throw new e.InvalidAddressError({ address: w });
      y.push({ address: w, storageKeys: A.map((B) => ((0, u.isHash)(B) ? B : (0, i.trim)(B))) });
    }
    return y;
  }
  function d(p) {
    const y = [];
    for (let I = 0; I < p.length; I++) {
      const [w, A, B, R, S, x] = p[I];
      y.push({
        address: A,
        chainId: w === "0x" ? 0 : (0, a.hexToNumber)(w),
        nonce: B === "0x" ? 0 : (0, a.hexToNumber)(B),
        ...j([R, S, x]),
      });
    }
    return y;
  }
  function j(p) {
    const y = p.slice(-3),
      I = y[0] === "0x" || (0, a.hexToBigInt)(y[0]) === 0n ? 27n : 28n;
    return {
      r: (0, s.padHex)(y[1], { size: 32 }),
      s: (0, s.padHex)(y[2], { size: 32 }),
      v: I,
      yParity: I === 27n ? 0 : 1,
    };
  }
  return ln;
}
var zs = {},
  Us = {},
  Io = {},
  qh;
function d_() {
  if (qh) return Io;
  ((qh = 1), Object.defineProperty(Io, "__esModule", { value: !0 }), (Io.InvalidDecimalNumberError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor({ value: t }) {
      super(`Number \`${t}\` is not a valid decimal number.`, { name: "InvalidDecimalNumberError" });
    }
  }
  return ((Io.InvalidDecimalNumberError = r), Io);
}
var Mh;
function Xu() {
  if (Mh) return Us;
  ((Mh = 1), Object.defineProperty(Us, "__esModule", { value: !0 }), (Us.parseUnits = r));
  const e = d_();
  function r(n, t) {
    if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(n)) throw new e.InvalidDecimalNumberError({ value: n });
    let [o, s = "0"] = n.split(".");
    const i = o.startsWith("-");
    if ((i && (o = o.slice(1)), (s = s.replace(/(0+)$/, "")), t === 0))
      (Math.round(+`.${s}`) === 1 && (o = `${BigInt(o) + 1n}`), (s = ""));
    else if (s.length > t) {
      const [a, c, u] = [s.slice(0, t - 1), s.slice(t - 1, t), s.slice(t)],
        l = Math.round(+`${c}.${u}`);
      (l > 9 ? (s = `${BigInt(a) + BigInt(1)}0`.padStart(a.length + 1, "0")) : (s = `${a}${l}`),
        s.length > t && ((s = s.slice(1)), (o = `${BigInt(o) + 1n}`)),
        (s = s.slice(0, t)));
    } else s = s.padEnd(t, "0");
    return BigInt(`${i ? "-" : ""}${o}${s}`);
  }
  return Us;
}
var Hh;
function f_() {
  if (Hh) return zs;
  ((Hh = 1), Object.defineProperty(zs, "__esModule", { value: !0 }), (zs.parseEther = n));
  const e = Mo(),
    r = Xu();
  function n(t, o = "wei") {
    return (0, r.parseUnits)(t, e.etherUnits[o]);
  }
  return zs;
}
var Ls = {},
  kh;
function l_() {
  if (kh) return Ls;
  ((kh = 1), Object.defineProperty(Ls, "__esModule", { value: !0 }), (Ls.parseGwei = n));
  const e = Mo(),
    r = Xu();
  function n(t, o = "wei") {
    return (0, r.parseUnits)(t, e.gweiUnits[o]);
  }
  return Ls;
}
var Fh;
function b_() {
  return (
    Fh ||
      ((Fh = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.padBytes =
            e.pad =
            e.isHex =
            e.isBytes =
            e.concatHex =
            e.concatBytes =
            e.concat =
            e.getChainContractAddress =
            e.extractChain =
            e.defineChain =
            e.assertCurrentChain =
            e.offchainLookupSignature =
            e.offchainLookupAbiItem =
            e.offchainLookup =
            e.ccipFetch =
            e.ccipRequest =
            e.buildRequest =
            e.verifyAuthorization =
            e.serializeAuthorizationList =
            e.recoverAuthorizationAddress =
            e.hashAuthorization =
            e.isAddressEqual =
            e.isAddress =
            e.getCreateAddress =
            e.getCreate2Address =
            e.getContractAddress =
            e.getAddress =
            e.parseEventLogs =
            e.getAbiItem =
            e.formatAbiItemWithArgs =
            e.formatAbiParams =
            e.formatAbiItem =
            e.encodePacked =
            e.encodeFunctionResult =
            e.encodeFunctionData =
            e.encodeEventTopics =
            e.encodeErrorResult =
            e.encodeDeployData =
            e.encodeAbiParameters =
            e.decodeFunctionResult =
            e.decodeFunctionData =
            e.decodeEventLog =
            e.decodeErrorResult =
            e.decodeAbiParameters =
            e.publicKeyToAddress =
            e.parseAccount =
            e.parseAbiParameters =
            e.parseAbiParameter =
            e.parseAbiItem =
            e.parseAbi =
              void 0),
          (e.ripemd160 =
            e.keccak256 =
            e.isHash =
            e.getAction =
            e.formatTransactionRequest =
            e.defineTransactionRequest =
            e.defineTransactionReceipt =
            e.transactionType =
            e.formatTransaction =
            e.defineTransaction =
            e.formatLog =
            e.defineFormatter =
            e.extract =
            e.formatBlock =
            e.defineBlock =
            e.getTransactionError =
            e.getNodeError =
            e.containsNodeError =
            e.getEstimateGasError =
            e.getContractError =
            e.getCallError =
            e.toRlp =
            e.toHex =
            e.stringToHex =
            e.numberToHex =
            e.bytesToHex =
            e.boolToHex =
            e.toBytes =
            e.stringToBytes =
            e.numberToBytes =
            e.hexToBytes =
            e.boolToBytes =
            e.fromRlp =
            e.hexToString =
            e.hexToNumber =
            e.hexToBool =
            e.hexToBigInt =
            e.fromHex =
            e.fromBytes =
            e.bytesToString =
            e.bytesToNumber =
            e.bytesToBool =
            e.bytesToBigint =
            e.bytesToBigInt =
            e.trim =
            e.sliceHex =
            e.sliceBytes =
            e.slice =
            e.size =
            e.padHex =
              void 0),
          (e.validateTypedData =
            e.serializeTypedData =
            e.serializeTransaction =
            e.serializeAccessList =
            e.parseTransaction =
            e.getTransactionType =
            e.getSerializedTransactionType =
            e.assertTransactionLegacy =
            e.assertTransactionEIP2930 =
            e.assertTransactionEIP1559 =
            e.assertRequest =
            e.stringify =
            e.verifyTypedData =
            e.verifyMessage =
            e.verifyHash =
            e.serializeErc8010Signature =
            e.serializeErc6492Signature =
            e.recoverTypedDataAddress =
            e.recoverPublicKey =
            e.recoverMessageAddress =
            e.recoverAddress =
            e.parseErc8010Signature =
            e.parseErc6492Signature =
            e.isErc8010Signature =
            e.isErc6492Signature =
            e.hashTypedData =
            e.hashStruct =
            e.hashMessage =
            e.getWebSocketRpcClient =
            e.socketClientCache =
            e.getSocketRpcClient =
            e.getHttpRpcClient =
            e.rpc =
            e.getSocket =
            e.integerRegex =
            e.bytesRegex =
            e.arrayRegex =
            e.nonceManager =
            e.createNonceManager =
            e.getFunctionSignature =
            e.toFunctionSignature =
            e.getFunctionSelector =
            e.toFunctionSelector =
            e.toFunctionHash =
            e.getEventSignature =
            e.toEventSignature =
            e.getEventSelector =
            e.toEventSelector =
            e.toEventHash =
            e.sha256 =
              void 0),
          (e.parseUnits = e.parseGwei = e.parseEther = e.formatUnits = e.formatGwei = e.formatEther = void 0));
        var r = ir();
        (Object.defineProperty(e, "parseAbi", {
          enumerable: !0,
          get: function () {
            return r.parseAbi;
          },
        }),
          Object.defineProperty(e, "parseAbiItem", {
            enumerable: !0,
            get: function () {
              return r.parseAbiItem;
            },
          }),
          Object.defineProperty(e, "parseAbiParameter", {
            enumerable: !0,
            get: function () {
              return r.parseAbiParameter;
            },
          }),
          Object.defineProperty(e, "parseAbiParameters", {
            enumerable: !0,
            get: function () {
              return r.parseAbiParameters;
            },
          }));
        var n = Ie();
        Object.defineProperty(e, "parseAccount", {
          enumerable: !0,
          get: function () {
            return n.parseAccount;
          },
        });
        var t = og();
        Object.defineProperty(e, "publicKeyToAddress", {
          enumerable: !0,
          get: function () {
            return t.publicKeyToAddress;
          },
        });
        var o = cr();
        Object.defineProperty(e, "decodeAbiParameters", {
          enumerable: !0,
          get: function () {
            return o.decodeAbiParameters;
          },
        });
        var s = Ou();
        Object.defineProperty(e, "decodeErrorResult", {
          enumerable: !0,
          get: function () {
            return s.decodeErrorResult;
          },
        });
        var i = Do();
        Object.defineProperty(e, "decodeEventLog", {
          enumerable: !0,
          get: function () {
            return i.decodeEventLog;
          },
        });
        var a = _f();
        Object.defineProperty(e, "decodeFunctionData", {
          enumerable: !0,
          get: function () {
            return a.decodeFunctionData;
          },
        });
        var c = Rt();
        Object.defineProperty(e, "decodeFunctionResult", {
          enumerable: !0,
          get: function () {
            return c.decodeFunctionResult;
          },
        });
        var u = vt();
        Object.defineProperty(e, "encodeAbiParameters", {
          enumerable: !0,
          get: function () {
            return u.encodeAbiParameters;
          },
        });
        var l = Ko();
        Object.defineProperty(e, "encodeDeployData", {
          enumerable: !0,
          get: function () {
            return l.encodeDeployData;
          },
        });
        var f = vf();
        Object.defineProperty(e, "encodeErrorResult", {
          enumerable: !0,
          get: function () {
            return f.encodeErrorResult;
          },
        });
        var m = zr();
        Object.defineProperty(e, "encodeEventTopics", {
          enumerable: !0,
          get: function () {
            return m.encodeEventTopics;
          },
        });
        var g = We();
        Object.defineProperty(e, "encodeFunctionData", {
          enumerable: !0,
          get: function () {
            return g.encodeFunctionData;
          },
        });
        var h = Ef();
        Object.defineProperty(e, "encodeFunctionResult", {
          enumerable: !0,
          get: function () {
            return h.encodeFunctionResult;
          },
        });
        var b = qg();
        Object.defineProperty(e, "encodePacked", {
          enumerable: !0,
          get: function () {
            return b.encodePacked;
          },
        });
        var v = Vt();
        (Object.defineProperty(e, "formatAbiItem", {
          enumerable: !0,
          get: function () {
            return v.formatAbiItem;
          },
        }),
          Object.defineProperty(e, "formatAbiParams", {
            enumerable: !0,
            get: function () {
              return v.formatAbiParams;
            },
          }));
        var _ = ng();
        Object.defineProperty(e, "formatAbiItemWithArgs", {
          enumerable: !0,
          get: function () {
            return _.formatAbiItemWithArgs;
          },
        });
        var E = Kt();
        Object.defineProperty(e, "getAbiItem", {
          enumerable: !0,
          get: function () {
            return E.getAbiItem;
          },
        });
        var P = Go();
        Object.defineProperty(e, "parseEventLogs", {
          enumerable: !0,
          get: function () {
            return P.parseEventLogs;
          },
        });
        var d = Qe();
        Object.defineProperty(e, "getAddress", {
          enumerable: !0,
          get: function () {
            return d.getAddress;
          },
        });
        var j = Mg();
        (Object.defineProperty(e, "getContractAddress", {
          enumerable: !0,
          get: function () {
            return j.getContractAddress;
          },
        }),
          Object.defineProperty(e, "getCreate2Address", {
            enumerable: !0,
            get: function () {
              return j.getCreate2Address;
            },
          }),
          Object.defineProperty(e, "getCreateAddress", {
            enumerable: !0,
            get: function () {
              return j.getCreateAddress;
            },
          }));
        var p = et();
        Object.defineProperty(e, "isAddress", {
          enumerable: !0,
          get: function () {
            return p.isAddress;
          },
        });
        var y = Pt();
        Object.defineProperty(e, "isAddressEqual", {
          enumerable: !0,
          get: function () {
            return y.isAddressEqual;
          },
        });
        var I = ug();
        Object.defineProperty(e, "hashAuthorization", {
          enumerable: !0,
          get: function () {
            return I.hashAuthorization;
          },
        });
        var w = Fo();
        Object.defineProperty(e, "recoverAuthorizationAddress", {
          enumerable: !0,
          get: function () {
            return w.recoverAuthorizationAddress;
          },
        });
        var A = Hg();
        Object.defineProperty(e, "serializeAuthorizationList", {
          enumerable: !0,
          get: function () {
            return A.serializeAuthorizationList;
          },
        });
        var B = kg();
        Object.defineProperty(e, "verifyAuthorization", {
          enumerable: !0,
          get: function () {
            return B.verifyAuthorization;
          },
        });
        var R = Fg();
        Object.defineProperty(e, "buildRequest", {
          enumerable: !0,
          get: function () {
            return R.buildRequest;
          },
        });
        var S = jf();
        (Object.defineProperty(e, "ccipRequest", {
          enumerable: !0,
          get: function () {
            return S.ccipRequest;
          },
        }),
          Object.defineProperty(e, "ccipFetch", {
            enumerable: !0,
            get: function () {
              return S.ccipRequest;
            },
          }),
          Object.defineProperty(e, "offchainLookup", {
            enumerable: !0,
            get: function () {
              return S.offchainLookup;
            },
          }),
          Object.defineProperty(e, "offchainLookupAbiItem", {
            enumerable: !0,
            get: function () {
              return S.offchainLookupAbiItem;
            },
          }),
          Object.defineProperty(e, "offchainLookupSignature", {
            enumerable: !0,
            get: function () {
              return S.offchainLookupSignature;
            },
          }));
        var x = Jo();
        Object.defineProperty(e, "assertCurrentChain", {
          enumerable: !0,
          get: function () {
            return x.assertCurrentChain;
          },
        });
        var F = Ng();
        Object.defineProperty(e, "defineChain", {
          enumerable: !0,
          get: function () {
            return F.defineChain;
          },
        });
        var H = $g();
        Object.defineProperty(e, "extractChain", {
          enumerable: !0,
          get: function () {
            return H.extractChain;
          },
        });
        var T = hr();
        Object.defineProperty(e, "getChainContractAddress", {
          enumerable: !0,
          get: function () {
            return T.getChainContractAddress;
          },
        });
        var k = qe();
        (Object.defineProperty(e, "concat", {
          enumerable: !0,
          get: function () {
            return k.concat;
          },
        }),
          Object.defineProperty(e, "concatBytes", {
            enumerable: !0,
            get: function () {
              return k.concatBytes;
            },
          }),
          Object.defineProperty(e, "concatHex", {
            enumerable: !0,
            get: function () {
              return k.concatHex;
            },
          }));
        var O = Cf();
        Object.defineProperty(e, "isBytes", {
          enumerable: !0,
          get: function () {
            return O.isBytes;
          },
        });
        var C = Ge();
        Object.defineProperty(e, "isHex", {
          enumerable: !0,
          get: function () {
            return C.isHex;
          },
        });
        var q = ar();
        (Object.defineProperty(e, "pad", {
          enumerable: !0,
          get: function () {
            return q.pad;
          },
        }),
          Object.defineProperty(e, "padBytes", {
            enumerable: !0,
            get: function () {
              return q.padBytes;
            },
          }),
          Object.defineProperty(e, "padHex", {
            enumerable: !0,
            get: function () {
              return q.padHex;
            },
          }));
        var M = Ve();
        Object.defineProperty(e, "size", {
          enumerable: !0,
          get: function () {
            return M.size;
          },
        });
        var N = st();
        (Object.defineProperty(e, "slice", {
          enumerable: !0,
          get: function () {
            return N.slice;
          },
        }),
          Object.defineProperty(e, "sliceBytes", {
            enumerable: !0,
            get: function () {
              return N.sliceBytes;
            },
          }),
          Object.defineProperty(e, "sliceHex", {
            enumerable: !0,
            get: function () {
              return N.sliceHex;
            },
          }));
        var z = Wt();
        Object.defineProperty(e, "trim", {
          enumerable: !0,
          get: function () {
            return z.trim;
          },
        });
        var $ = ef();
        (Object.defineProperty(e, "bytesToBigInt", {
          enumerable: !0,
          get: function () {
            return $.bytesToBigInt;
          },
        }),
          Object.defineProperty(e, "bytesToBigint", {
            enumerable: !0,
            get: function () {
              return $.bytesToBigInt;
            },
          }),
          Object.defineProperty(e, "bytesToBool", {
            enumerable: !0,
            get: function () {
              return $.bytesToBool;
            },
          }),
          Object.defineProperty(e, "bytesToNumber", {
            enumerable: !0,
            get: function () {
              return $.bytesToNumber;
            },
          }),
          Object.defineProperty(e, "bytesToString", {
            enumerable: !0,
            get: function () {
              return $.bytesToString;
            },
          }),
          Object.defineProperty(e, "fromBytes", {
            enumerable: !0,
            get: function () {
              return $.fromBytes;
            },
          }));
        var U = Be();
        (Object.defineProperty(e, "fromHex", {
          enumerable: !0,
          get: function () {
            return U.fromHex;
          },
        }),
          Object.defineProperty(e, "hexToBigInt", {
            enumerable: !0,
            get: function () {
              return U.hexToBigInt;
            },
          }),
          Object.defineProperty(e, "hexToBool", {
            enumerable: !0,
            get: function () {
              return U.hexToBool;
            },
          }),
          Object.defineProperty(e, "hexToNumber", {
            enumerable: !0,
            get: function () {
              return U.hexToNumber;
            },
          }),
          Object.defineProperty(e, "hexToString", {
            enumerable: !0,
            get: function () {
              return U.hexToString;
            },
          }));
        var G = Mf();
        Object.defineProperty(e, "fromRlp", {
          enumerable: !0,
          get: function () {
            return G.fromRlp;
          },
        });
        var Z = ve();
        (Object.defineProperty(e, "boolToBytes", {
          enumerable: !0,
          get: function () {
            return Z.boolToBytes;
          },
        }),
          Object.defineProperty(e, "hexToBytes", {
            enumerable: !0,
            get: function () {
              return Z.hexToBytes;
            },
          }),
          Object.defineProperty(e, "numberToBytes", {
            enumerable: !0,
            get: function () {
              return Z.numberToBytes;
            },
          }),
          Object.defineProperty(e, "stringToBytes", {
            enumerable: !0,
            get: function () {
              return Z.stringToBytes;
            },
          }),
          Object.defineProperty(e, "toBytes", {
            enumerable: !0,
            get: function () {
              return Z.toBytes;
            },
          }));
        var K = te();
        (Object.defineProperty(e, "boolToHex", {
          enumerable: !0,
          get: function () {
            return K.boolToHex;
          },
        }),
          Object.defineProperty(e, "bytesToHex", {
            enumerable: !0,
            get: function () {
              return K.bytesToHex;
            },
          }),
          Object.defineProperty(e, "numberToHex", {
            enumerable: !0,
            get: function () {
              return K.numberToHex;
            },
          }),
          Object.defineProperty(e, "stringToHex", {
            enumerable: !0,
            get: function () {
              return K.stringToHex;
            },
          }),
          Object.defineProperty(e, "toHex", {
            enumerable: !0,
            get: function () {
              return K.toHex;
            },
          }));
        var V = ko();
        Object.defineProperty(e, "toRlp", {
          enumerable: !0,
          get: function () {
            return V.toRlp;
          },
        });
        var Y = yf();
        Object.defineProperty(e, "getCallError", {
          enumerable: !0,
          get: function () {
            return Y.getCallError;
          },
        });
        var re = fr();
        Object.defineProperty(e, "getContractError", {
          enumerable: !0,
          get: function () {
            return re.getContractError;
          },
        });
        var J = fg();
        Object.defineProperty(e, "getEstimateGasError", {
          enumerable: !0,
          get: function () {
            return J.getEstimateGasError;
          },
        });
        var X = No();
        (Object.defineProperty(e, "containsNodeError", {
          enumerable: !0,
          get: function () {
            return X.containsNodeError;
          },
        }),
          Object.defineProperty(e, "getNodeError", {
            enumerable: !0,
            get: function () {
              return X.getNodeError;
            },
          }));
        var Q = Uo();
        Object.defineProperty(e, "getTransactionError", {
          enumerable: !0,
          get: function () {
            return Q.getTransactionError;
          },
        });
        var oe = qu();
        (Object.defineProperty(e, "defineBlock", {
          enumerable: !0,
          get: function () {
            return oe.defineBlock;
          },
        }),
          Object.defineProperty(e, "formatBlock", {
            enumerable: !0,
            get: function () {
              return oe.formatBlock;
            },
          }));
        var ie = br();
        Object.defineProperty(e, "extract", {
          enumerable: !0,
          get: function () {
            return ie.extract;
          },
        });
        var se = $o();
        Object.defineProperty(e, "defineFormatter", {
          enumerable: !0,
          get: function () {
            return se.defineFormatter;
          },
        });
        var de = It();
        Object.defineProperty(e, "formatLog", {
          enumerable: !0,
          get: function () {
            return de.formatLog;
          },
        });
        var ye = En();
        (Object.defineProperty(e, "defineTransaction", {
          enumerable: !0,
          get: function () {
            return ye.defineTransaction;
          },
        }),
          Object.defineProperty(e, "formatTransaction", {
            enumerable: !0,
            get: function () {
              return ye.formatTransaction;
            },
          }),
          Object.defineProperty(e, "transactionType", {
            enumerable: !0,
            get: function () {
              return ye.transactionType;
            },
          }));
        var ee = Yo();
        Object.defineProperty(e, "defineTransactionReceipt", {
          enumerable: !0,
          get: function () {
            return ee.defineTransactionReceipt;
          },
        });
        var W = jt();
        (Object.defineProperty(e, "defineTransactionRequest", {
          enumerable: !0,
          get: function () {
            return W.defineTransactionRequest;
          },
        }),
          Object.defineProperty(e, "formatTransactionRequest", {
            enumerable: !0,
            get: function () {
              return W.formatTransactionRequest;
            },
          }));
        var Ee = me();
        Object.defineProperty(e, "getAction", {
          enumerable: !0,
          get: function () {
            return Ee.getAction;
          },
        });
        var Ce = Hf();
        Object.defineProperty(e, "isHash", {
          enumerable: !0,
          get: function () {
            return Ce.isHash;
          },
        });
        var Oe = Xe();
        Object.defineProperty(e, "keccak256", {
          enumerable: !0,
          get: function () {
            return Oe.keccak256;
          },
        });
        var He = Ug();
        Object.defineProperty(e, "ripemd160", {
          enumerable: !0,
          get: function () {
            return He.ripemd160;
          },
        });
        var Ke = uf();
        Object.defineProperty(e, "sha256", {
          enumerable: !0,
          get: function () {
            return Ke.sha256;
          },
        });
        var lt = Lg();
        Object.defineProperty(e, "toEventHash", {
          enumerable: !0,
          get: function () {
            return lt.toEventHash;
          },
        });
        var ut = vn();
        (Object.defineProperty(e, "toEventSelector", {
          enumerable: !0,
          get: function () {
            return ut.toEventSelector;
          },
        }),
          Object.defineProperty(e, "getEventSelector", {
            enumerable: !0,
            get: function () {
              return ut.toEventSelector;
            },
          }));
        var dt = Dg();
        (Object.defineProperty(e, "toEventSignature", {
          enumerable: !0,
          get: function () {
            return dt.toEventSignature;
          },
        }),
          Object.defineProperty(e, "getEventSignature", {
            enumerable: !0,
            get: function () {
              return dt.toEventSignature;
            },
          }));
        var Ze = Gg();
        Object.defineProperty(e, "toFunctionHash", {
          enumerable: !0,
          get: function () {
            return Ze.toFunctionHash;
          },
        });
        var Me = $r();
        (Object.defineProperty(e, "toFunctionSelector", {
          enumerable: !0,
          get: function () {
            return Me.toFunctionSelector;
          },
        }),
          Object.defineProperty(e, "getFunctionSelector", {
            enumerable: !0,
            get: function () {
              return Me.toFunctionSelector;
            },
          }));
        var At = Vg();
        (Object.defineProperty(e, "toFunctionSignature", {
          enumerable: !0,
          get: function () {
            return At.toFunctionSignature;
          },
        }),
          Object.defineProperty(e, "getFunctionSignature", {
            enumerable: !0,
            get: function () {
              return At.toFunctionSignature;
            },
          }));
        var bt = Wg();
        (Object.defineProperty(e, "createNonceManager", {
          enumerable: !0,
          get: function () {
            return bt.createNonceManager;
          },
        }),
          Object.defineProperty(e, "nonceManager", {
            enumerable: !0,
            get: function () {
              return bt.nonceManager;
            },
          }));
        var Pn = Ru();
        (Object.defineProperty(e, "arrayRegex", {
          enumerable: !0,
          get: function () {
            return Pn.arrayRegex;
          },
        }),
          Object.defineProperty(e, "bytesRegex", {
            enumerable: !0,
            get: function () {
              return Pn.bytesRegex;
            },
          }),
          Object.defineProperty(e, "integerRegex", {
            enumerable: !0,
            get: function () {
              return Pn.integerRegex;
            },
          }));
        var ri = Jg();
        (Object.defineProperty(e, "getSocket", {
          enumerable: !0,
          get: function () {
            return ri.getSocket;
          },
        }),
          Object.defineProperty(e, "rpc", {
            enumerable: !0,
            get: function () {
              return ri.rpc;
            },
          }));
        var pr = Ff();
        Object.defineProperty(e, "getHttpRpcClient", {
          enumerable: !0,
          get: function () {
            return pr.getHttpRpcClient;
          },
        });
        var ni = Zg();
        (Object.defineProperty(e, "getSocketRpcClient", {
          enumerable: !0,
          get: function () {
            return ni.getSocketRpcClient;
          },
        }),
          Object.defineProperty(e, "socketClientCache", {
            enumerable: !0,
            get: function () {
              return ni.socketClientCache;
            },
          }));
        var oi = Nf();
        Object.defineProperty(e, "getWebSocketRpcClient", {
          enumerable: !0,
          get: function () {
            return oi.getWebSocketRpcClient;
          },
        });
        var ed = Xo();
        Object.defineProperty(e, "hashMessage", {
          enumerable: !0,
          get: function () {
            return ed.hashMessage;
          },
        });
        var ii = Qo();
        (Object.defineProperty(e, "hashStruct", {
          enumerable: !0,
          get: function () {
            return ii.hashStruct;
          },
        }),
          Object.defineProperty(e, "hashTypedData", {
            enumerable: !0,
            get: function () {
              return ii.hashTypedData;
            },
          }));
        var An = zf();
        Object.defineProperty(e, "isErc6492Signature", {
          enumerable: !0,
          get: function () {
            return An.isErc6492Signature;
          },
        });
        var td = Df();
        Object.defineProperty(e, "isErc8010Signature", {
          enumerable: !0,
          get: function () {
            return td.isErc8010Signature;
          },
        });
        var rd = n_();
        Object.defineProperty(e, "parseErc6492Signature", {
          enumerable: !0,
          get: function () {
            return rd.parseErc6492Signature;
          },
        });
        var Tn = o_();
        Object.defineProperty(e, "parseErc8010Signature", {
          enumerable: !0,
          get: function () {
            return Tn.parseErc8010Signature;
          },
        });
        var nd = lr();
        Object.defineProperty(e, "recoverAddress", {
          enumerable: !0,
          get: function () {
            return nd.recoverAddress;
          },
        });
        var Sn = Gf();
        Object.defineProperty(e, "recoverMessageAddress", {
          enumerable: !0,
          get: function () {
            return Sn.recoverMessageAddress;
          },
        });
        var od = nf();
        Object.defineProperty(e, "recoverPublicKey", {
          enumerable: !0,
          get: function () {
            return od.recoverPublicKey;
          },
        });
        var gr = Vf();
        Object.defineProperty(e, "recoverTypedDataAddress", {
          enumerable: !0,
          get: function () {
            return gr.recoverTypedDataAddress;
          },
        });
        var _r = i_();
        Object.defineProperty(e, "serializeErc6492Signature", {
          enumerable: !0,
          get: function () {
            return _r.serializeErc6492Signature;
          },
        });
        var id = a_();
        Object.defineProperty(e, "serializeErc8010Signature", {
          enumerable: !0,
          get: function () {
            return id.serializeErc8010Signature;
          },
        });
        var vr = s_();
        Object.defineProperty(e, "verifyHash", {
          enumerable: !0,
          get: function () {
            return vr.verifyHash;
          },
        });
        var Er = c_();
        Object.defineProperty(e, "verifyMessage", {
          enumerable: !0,
          get: function () {
            return Er.verifyMessage;
          },
        });
        var In = u_();
        Object.defineProperty(e, "verifyTypedData", {
          enumerable: !0,
          get: function () {
            return In.verifyTypedData;
          },
        });
        var ad = Fe();
        Object.defineProperty(e, "stringify", {
          enumerable: !0,
          get: function () {
            return ad.stringify;
          },
        });
        var sd = wt();
        Object.defineProperty(e, "assertRequest", {
          enumerable: !0,
          get: function () {
            return sd.assertRequest;
          },
        });
        var Rn = Wu();
        (Object.defineProperty(e, "assertTransactionEIP1559", {
          enumerable: !0,
          get: function () {
            return Rn.assertTransactionEIP1559;
          },
        }),
          Object.defineProperty(e, "assertTransactionEIP2930", {
            enumerable: !0,
            get: function () {
              return Rn.assertTransactionEIP2930;
            },
          }),
          Object.defineProperty(e, "assertTransactionLegacy", {
            enumerable: !0,
            get: function () {
              return Rn.assertTransactionLegacy;
            },
          }));
        var cd = Wf();
        Object.defineProperty(e, "getSerializedTransactionType", {
          enumerable: !0,
          get: function () {
            return cd.getSerializedTransactionType;
          },
        });
        var ai = Nu();
        Object.defineProperty(e, "getTransactionType", {
          enumerable: !0,
          get: function () {
            return ai.getTransactionType;
          },
        });
        var ud = Kf();
        Object.defineProperty(e, "parseTransaction", {
          enumerable: !0,
          get: function () {
            return ud.parseTransaction;
          },
        });
        var Bn = qf();
        Object.defineProperty(e, "serializeAccessList", {
          enumerable: !0,
          get: function () {
            return Bn.serializeAccessList;
          },
        });
        var si = Ku();
        Object.defineProperty(e, "serializeTransaction", {
          enumerable: !0,
          get: function () {
            return si.serializeTransaction;
          },
        });
        var Wr = Zu();
        (Object.defineProperty(e, "serializeTypedData", {
          enumerable: !0,
          get: function () {
            return Wr.serializeTypedData;
          },
        }),
          Object.defineProperty(e, "validateTypedData", {
            enumerable: !0,
            get: function () {
              return Wr.validateTypedData;
            },
          }));
        var dd = Ho();
        Object.defineProperty(e, "formatEther", {
          enumerable: !0,
          get: function () {
            return dd.formatEther;
          },
        });
        var fd = Ur();
        Object.defineProperty(e, "formatGwei", {
          enumerable: !0,
          get: function () {
            return fd.formatGwei;
          },
        });
        var ld = xu();
        Object.defineProperty(e, "formatUnits", {
          enumerable: !0,
          get: function () {
            return ld.formatUnits;
          },
        });
        var bd = f_();
        Object.defineProperty(e, "parseEther", {
          enumerable: !0,
          get: function () {
            return bd.parseEther;
          },
        });
        var md = l_();
        Object.defineProperty(e, "parseGwei", {
          enumerable: !0,
          get: function () {
            return md.parseGwei;
          },
        });
        var ci = Xu();
        Object.defineProperty(e, "parseUnits", {
          enumerable: !0,
          get: function () {
            return ci.parseUnits;
          },
        });
      })(Nd)),
    Nd
  );
}
var Nh;
function A6() {
  if (Nh) return hs;
  ((Nh = 1), Object.defineProperty(hs, "__esModule", { value: !0 }), (hs.formatProof = n));
  const e = b_();
  function r(t) {
    return t.map((o) => ({ ...o, value: BigInt(o.value) }));
  }
  function n(t) {
    return {
      ...t,
      balance: t.balance ? BigInt(t.balance) : void 0,
      nonce: t.nonce ? (0, e.hexToNumber)(t.nonce) : void 0,
      storageProof: t.storageProof ? r(t.storageProof) : void 0,
    };
  }
  return hs;
}
var $h;
function T6() {
  if ($h) return ms;
  (($h = 1), Object.defineProperty(ms, "__esModule", { value: !0 }), (ms.getProof = n));
  const e = te(),
    r = A6();
  async function n(t, { address: o, blockNumber: s, blockTag: i, storageKeys: a }) {
    const c = i ?? "latest",
      u = s !== void 0 ? (0, e.numberToHex)(s) : void 0,
      l = await t.request({ method: "eth_getProof", params: [o, a, u || c] });
    return (0, r.formatProof)(l);
  }
  return ms;
}
var Ds = {},
  zh;
function S6() {
  if (zh) return Ds;
  ((zh = 1), Object.defineProperty(Ds, "__esModule", { value: !0 }), (Ds.getStorageAt = r));
  const e = te();
  async function r(n, { address: t, blockNumber: o, blockTag: s = "latest", slot: i }) {
    const a = o !== void 0 ? (0, e.numberToHex)(o) : void 0;
    return await n.request({ method: "eth_getStorageAt", params: [t, i, a || s] });
  }
  return Ds;
}
var Gs = {},
  Uh;
function Zf() {
  if (Uh) return Gs;
  ((Uh = 1), Object.defineProperty(Gs, "__esModule", { value: !0 }), (Gs.getTransaction = t));
  const e = tt(),
    r = te(),
    n = En();
  async function t(o, { blockHash: s, blockNumber: i, blockTag: a, hash: c, index: u, sender: l, nonce: f }) {
    var v, _, E;
    const m = a || "latest",
      g = i !== void 0 ? (0, r.numberToHex)(i) : void 0;
    let h = null;
    if (
      (c
        ? (h = await o.request({ method: "eth_getTransactionByHash", params: [c] }, { dedupe: !0 }))
        : s
          ? (h = await o.request(
              { method: "eth_getTransactionByBlockHashAndIndex", params: [s, (0, r.numberToHex)(u)] },
              { dedupe: !0 },
            ))
          : typeof u == "number"
            ? (h = await o.request(
                { method: "eth_getTransactionByBlockNumberAndIndex", params: [g || m, (0, r.numberToHex)(u)] },
                { dedupe: !!g },
              ))
            : l &&
              typeof f == "number" &&
              (h = await o.request(
                { method: "eth_getTransactionBySenderAndNonce", params: [l, (0, r.numberToHex)(f)] },
                { dedupe: !0 },
              )),
      !h)
    )
      throw new e.TransactionNotFoundError({ blockHash: s, blockNumber: i, blockTag: m, hash: c, index: u });
    return (
      ((E = (_ = (v = o.chain) == null ? void 0 : v.formatters) == null ? void 0 : _.transaction) == null
        ? void 0
        : E.format) || n.formatTransaction
    )(h, "getTransaction");
  }
  return Gs;
}
var Vs = {},
  Lh;
function I6() {
  if (Lh) return Vs;
  ((Lh = 1), Object.defineProperty(Vs, "__esModule", { value: !0 }), (Vs.getTransactionConfirmations = t));
  const e = me(),
    r = Zo(),
    n = Zf();
  async function t(o, { hash: s, transactionReceipt: i }) {
    const [a, c] = await Promise.all([
        (0, e.getAction)(o, r.getBlockNumber, "getBlockNumber")({}),
        s ? (0, e.getAction)(o, n.getTransaction, "getTransaction")({ hash: s }) : void 0,
      ]),
      u = (i == null ? void 0 : i.blockNumber) || (c == null ? void 0 : c.blockNumber);
    return u ? a - u + 1n : 0n;
  }
  return Vs;
}
var Ws = {},
  Dh;
function m_() {
  if (Dh) return Ws;
  ((Dh = 1), Object.defineProperty(Ws, "__esModule", { value: !0 }), (Ws.getTransactionReceipt = n));
  const e = tt(),
    r = Yo();
  async function n(t, { hash: o }) {
    var a, c, u;
    const s = await t.request({ method: "eth_getTransactionReceipt", params: [o] }, { dedupe: !0 });
    if (!s) throw new e.TransactionReceiptNotFoundError({ hash: o });
    return (
      ((u = (c = (a = t.chain) == null ? void 0 : a.formatters) == null ? void 0 : c.transactionReceipt) == null
        ? void 0
        : u.format) || r.formatTransactionReceipt
    )(s, "getTransactionReceipt");
  }
  return Ws;
}
var Ks = {},
  Gh;
function R6() {
  if (Gh) return Ks;
  ((Gh = 1), Object.defineProperty(Ks, "__esModule", { value: !0 }), (Ks.multicall = f));
  const e = Jt(),
    r = Vo(),
    n = Se(),
    t = ue(),
    o = ur(),
    s = Rt(),
    i = We(),
    a = hr(),
    c = fr(),
    u = me(),
    l = Ot();
  async function f(m, g) {
    var x;
    const {
        account: h,
        authorizationList: b,
        allowFailure: v = !0,
        blockNumber: _,
        blockOverrides: E,
        blockTag: P,
        stateOverride: d,
      } = g,
      j = g.contracts,
      { batchSize: p = g.batchSize ?? 1024, deployless: y = g.deployless ?? !1 } =
        typeof ((x = m.batch) == null ? void 0 : x.multicall) == "object" ? m.batch.multicall : {},
      I = (() => {
        if (g.multicallAddress) return g.multicallAddress;
        if (y) return null;
        if (m.chain) return (0, a.getChainContractAddress)({ blockNumber: _, chain: m.chain, contract: "multicall3" });
        throw new Error("client chain not configured. multicallAddress is required.");
      })(),
      w = [[]];
    let A = 0,
      B = 0;
    for (let F = 0; F < j.length; F++) {
      const { abi: H, address: T, args: k, functionName: O } = j[F];
      try {
        const C = (0, i.encodeFunctionData)({ abi: H, args: k, functionName: O });
        ((B += (C.length - 2) / 2),
          p > 0 && B > p && w[A].length > 0 && (A++, (B = (C.length - 2) / 2), (w[A] = [])),
          (w[A] = [...w[A], { allowFailure: !0, callData: C, target: T }]));
      } catch (C) {
        const q = (0, c.getContractError)(C, {
          abi: H,
          address: T,
          args: k,
          docsPath: "/docs/contract/multicall",
          functionName: O,
          sender: h,
        });
        if (!v) throw q;
        w[A] = [...w[A], { allowFailure: !0, callData: "0x", target: T }];
      }
    }
    const R = await Promise.allSettled(
        w.map((F) =>
          (0, u.getAction)(
            m,
            l.readContract,
            "readContract",
          )({
            ...(I === null ? { code: r.multicall3Bytecode } : { address: I }),
            abi: e.multicall3Abi,
            account: h,
            args: [F],
            authorizationList: b,
            blockNumber: _,
            blockOverrides: E,
            blockTag: P,
            functionName: "aggregate3",
            stateOverride: d,
          }),
        ),
      ),
      S = [];
    for (let F = 0; F < R.length; F++) {
      const H = R[F];
      if (H.status === "rejected") {
        if (!v) throw H.reason;
        for (let k = 0; k < w[F].length; k++) S.push({ status: "failure", error: H.reason, result: void 0 });
        continue;
      }
      const T = H.value;
      for (let k = 0; k < T.length; k++) {
        const { returnData: O, success: C } = T[k],
          { callData: q } = w[F][k],
          { abi: M, address: N, functionName: z, args: $ } = j[S.length];
        try {
          if (q === "0x") throw new n.AbiDecodingZeroDataError();
          if (!C) throw new o.RawContractError({ data: O });
          const U = (0, s.decodeFunctionResult)({ abi: M, args: $, data: O, functionName: z });
          S.push(v ? { result: U, status: "success" } : U);
        } catch (U) {
          const G = (0, c.getContractError)(U, {
            abi: M,
            address: N,
            args: $,
            docsPath: "/docs/contract/multicall",
            functionName: z,
          });
          if (!v) throw G;
          S.push({ error: G, result: void 0, status: "failure" });
        }
      }
    }
    if (S.length !== j.length) throw new t.BaseError("multicall results mismatch");
    return S;
  }
  return Ks;
}
var Zs = {},
  Vh;
function h_() {
  if (Vh) return Zs;
  ((Vh = 1), Object.defineProperty(Zs, "__esModule", { value: !0 }), (Zs.simulateBlocks = v));
  const e = Eg(),
    r = Ie(),
    n = Se(),
    t = ur(),
    o = Zt(),
    s = Rt(),
    i = We(),
    a = qe(),
    c = te(),
    u = fr(),
    l = No(),
    f = qu(),
    m = It(),
    g = jt(),
    h = of(),
    b = wt();
  async function v(_, E) {
    const {
      blockNumber: P,
      blockTag: d = _.experimental_blockTag ?? "latest",
      blocks: j,
      returnFullTransactions: p,
      traceTransfers: y,
      validation: I,
    } = E;
    try {
      const w = [];
      for (const S of j) {
        const x = S.blockOverrides ? e.toRpc(S.blockOverrides) : void 0,
          F = S.calls.map((T) => {
            const k = T,
              O = k.account ? (0, r.parseAccount)(k.account) : void 0,
              C = k.abi ? (0, i.encodeFunctionData)(k) : k.data,
              q = {
                ...k,
                account: O,
                data: k.dataSuffix ? (0, a.concat)([C || "0x", k.dataSuffix]) : C,
                from: k.from ?? (O == null ? void 0 : O.address),
              };
            return ((0, b.assertRequest)(q), (0, g.formatTransactionRequest)(q));
          }),
          H = S.stateOverrides ? (0, h.serializeStateOverride)(S.stateOverrides) : void 0;
        w.push({ blockOverrides: x, calls: F, stateOverrides: H });
      }
      const B = (typeof P == "bigint" ? (0, c.numberToHex)(P) : void 0) || d;
      return (
        await _.request({
          method: "eth_simulateV1",
          params: [{ blockStateCalls: w, returnFullTransactions: p, traceTransfers: y, validation: I }, B],
        })
      ).map((S, x) => ({
        ...(0, f.formatBlock)(S),
        calls: S.calls.map((F, H) => {
          var G, Z;
          const { abi: T, args: k, functionName: O, to: C } = j[x].calls[H],
            q = ((G = F.error) == null ? void 0 : G.data) ?? F.returnData,
            M = BigInt(F.gasUsed),
            N = (Z = F.logs) == null ? void 0 : Z.map((K) => (0, m.formatLog)(K)),
            z = F.status === "0x1" ? "success" : "failure",
            $ =
              T && z === "success" && q !== "0x"
                ? (0, s.decodeFunctionResult)({ abi: T, data: q, functionName: O })
                : null,
            U = (() => {
              if (z === "success") return;
              let K;
              if (
                (q === "0x" ? (K = new n.AbiDecodingZeroDataError()) : q && (K = new t.RawContractError({ data: q })),
                !!K)
              )
                return (0, u.getContractError)(K, {
                  abi: T ?? [],
                  address: C ?? "0x",
                  args: k,
                  functionName: O ?? "<unknown>",
                });
            })();
          return { data: q, gasUsed: M, logs: N, status: z, ...(z === "success" ? { result: $ } : { error: U }) };
        }),
      }));
    } catch (w) {
      const A = w,
        B = (0, l.getNodeError)(A, {});
      throw B instanceof o.UnknownNodeError ? A : B;
    }
  }
  return Zs;
}
var Js = {},
  or = {},
  De = {},
  bn = {},
  Wh;
function B6() {
  if (Wh) return bn;
  ((Wh = 1),
    Object.defineProperty(bn, "__esModule", { value: !0 }),
    (bn.normalizeSignature = n),
    (bn.isArgOfType = t),
    (bn.getAmbiguousTypes = o));
  const e = Ju(),
    r = ct();
  function n(s) {
    let i = !0,
      a = "",
      c = 0,
      u = "",
      l = !1;
    for (let f = 0; f < s.length; f++) {
      const m = s[f];
      if ((["(", ")", ","].includes(m) && (i = !0), m === "(" && c++, m === ")" && c--, !!i)) {
        if (c === 0) {
          if (m === " " && ["event", "function", "error", ""].includes(u)) u = "";
          else if (((u += m), m === ")")) {
            l = !0;
            break;
          }
          continue;
        }
        if (m === " ") {
          s[f - 1] !== "," && a !== "," && a !== ",(" && ((a = ""), (i = !1));
          continue;
        }
        ((u += m), (a += m));
      }
    }
    if (!l) throw new r.BaseError("Unable to normalize signature.");
    return u;
  }
  function t(s, i) {
    const a = typeof s,
      c = i.type;
    switch (c) {
      case "address":
        return e.validate(s, { strict: !1 });
      case "bool":
        return a === "boolean";
      case "function":
        return a === "string";
      case "string":
        return a === "string";
      default:
        return c === "tuple" && "components" in i
          ? Object.values(i.components).every((u, l) => t(Object.values(s)[l], u))
          : /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(
                c,
              )
            ? a === "number" || a === "bigint"
            : /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(c)
              ? a === "string" || s instanceof Uint8Array
              : /[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(c)
                ? Array.isArray(s) && s.every((u) => t(u, { ...i, type: c.replace(/(\[[0-9]{0,}\])$/, "") }))
                : !1;
    }
  }
  function o(s, i, a) {
    for (const c in s) {
      const u = s[c],
        l = i[c];
      if (u.type === "tuple" && l.type === "tuple" && "components" in u && "components" in l)
        return o(u.components, l.components, a[c]);
      const f = [u.type, l.type];
      if (
        f.includes("address") && f.includes("bytes20")
          ? !0
          : f.includes("address") && f.includes("string")
            ? e.validate(a[c], { strict: !1 })
            : f.includes("address") && f.includes("bytes")
              ? e.validate(a[c], { strict: !1 })
              : !1
      )
        return f;
    }
  }
  return bn;
}
var Kh;
function y_() {
  if (Kh) return De;
  ((Kh = 1),
    Object.defineProperty(De, "__esModule", { value: !0 }),
    (De.InvalidSelectorSizeError = De.NotFoundError = De.AmbiguityError = void 0),
    (De.format = s),
    (De.from = i),
    (De.fromAbi = a),
    (De.getSelector = c),
    (De.getSignature = u),
    (De.getSignatureHash = l));
  const e = ir(),
    r = ct(),
    n = Uf(),
    t = Ne(),
    o = B6();
  function s(h) {
    return e.formatAbiItem(h);
  }
  function i(h, b = {}) {
    const { prepare: v = !0 } = b,
      _ = Array.isArray(h) || typeof h == "string" ? e.parseAbiItem(h) : h;
    return { ..._, ...(v ? { hash: l(_) } : {}) };
  }
  function a(h, b, v) {
    const { args: _ = [], prepare: E = !0 } = v ?? {},
      P = t.validate(b, { strict: !1 }),
      d = h.filter((y) =>
        P
          ? y.type === "function" || y.type === "error"
            ? c(y) === t.slice(b, 0, 4)
            : y.type === "event"
              ? l(y) === b
              : !1
          : "name" in y && y.name === b,
      );
    if (d.length === 0) throw new m({ name: b });
    if (d.length === 1) return { ...d[0], ...(E ? { hash: l(d[0]) } : {}) };
    let j;
    for (const y of d) {
      if (!("inputs" in y)) continue;
      if (!_ || _.length === 0) {
        if (!y.inputs || y.inputs.length === 0) return { ...y, ...(E ? { hash: l(y) } : {}) };
        continue;
      }
      if (!y.inputs || y.inputs.length === 0 || y.inputs.length !== _.length) continue;
      if (
        _.every((w, A) => {
          const B = "inputs" in y && y.inputs[A];
          return B ? o.isArgOfType(w, B) : !1;
        })
      ) {
        if (j && "inputs" in j && j.inputs) {
          const w = o.getAmbiguousTypes(y.inputs, j.inputs, _);
          if (w) throw new f({ abiItem: y, type: w[0] }, { abiItem: j, type: w[1] });
        }
        j = y;
      }
    }
    const p = (() => {
      if (j) return j;
      const [y, ...I] = d;
      return { ...y, overloads: I };
    })();
    if (!p) throw new m({ name: b });
    return { ...p, ...(E ? { hash: l(p) } : {}) };
  }
  function c(...h) {
    const b = (() => {
      if (Array.isArray(h[0])) {
        const [v, _] = h;
        return a(v, _);
      }
      return h[0];
    })();
    return t.slice(l(b), 0, 4);
  }
  function u(...h) {
    const b = (() => {
        if (Array.isArray(h[0])) {
          const [_, E] = h;
          return a(_, E);
        }
        return h[0];
      })(),
      v = typeof b == "string" ? b : e.formatAbiItem(b);
    return o.normalizeSignature(v);
  }
  function l(...h) {
    const b = (() => {
      if (Array.isArray(h[0])) {
        const [v, _] = h;
        return a(v, _);
      }
      return h[0];
    })();
    return typeof b != "string" && "hash" in b && b.hash ? b.hash : n.keccak256(t.fromString(u(b)));
  }
  class f extends r.BaseError {
    constructor(b, v) {
      (super("Found ambiguous types in overloaded ABI Items.", {
        metaMessages: [
          `\`${b.type}\` in \`${o.normalizeSignature(e.formatAbiItem(b.abiItem))}\`, and`,
          `\`${v.type}\` in \`${o.normalizeSignature(e.formatAbiItem(v.abiItem))}\``,
          "",
          "These types encode differently and cannot be distinguished at runtime.",
          "Remove one of the ambiguous items in the ABI.",
        ],
      }),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiItem.AmbiguityError",
        }));
    }
  }
  De.AmbiguityError = f;
  class m extends r.BaseError {
    constructor({ name: b, data: v, type: _ = "item" }) {
      const E = b ? ` with name "${b}"` : v ? ` with data "${v}"` : "";
      (super(`ABI ${_}${E} not found.`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiItem.NotFoundError",
        }));
    }
  }
  De.NotFoundError = m;
  class g extends r.BaseError {
    constructor({ data: b }) {
      (super(`Selector size is invalid. Expected 4 bytes. Received ${t.size(b)} bytes ("${b}").`),
        Object.defineProperty(this, "name", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: "AbiItem.InvalidSelectorSizeError",
        }));
    }
  }
  return ((De.InvalidSelectorSizeError = g), De);
}
var Zh;
function O6() {
  if (Zh) return or;
  ((Zh = 1),
    Object.defineProperty(or, "__esModule", { value: !0 }),
    (or.decode = o),
    (or.encode = s),
    (or.format = i),
    (or.from = a),
    (or.fromAbi = c));
  const e = ir(),
    r = y_(),
    n = ei(),
    t = Ne();
  function o(...u) {
    var h;
    const [l, f] = (() => {
        if (Array.isArray(u[0])) {
          const [b, v] = u;
          return [c(b), v];
        }
        return u;
      })(),
      { bytecode: m } = f;
    if (((h = l.inputs) == null ? void 0 : h.length) === 0) return;
    const g = f.data.replace(m, "0x");
    return n.decode(l.inputs, g);
  }
  function s(...u) {
    var h;
    const [l, f] = (() => {
        if (Array.isArray(u[0])) {
          const [b, v] = u;
          return [c(b), v];
        }
        return u;
      })(),
      { bytecode: m, args: g } = f;
    return t.concat(m, (h = l.inputs) != null && h.length && g != null && g.length ? n.encode(l.inputs, g) : "0x");
  }
  function i(u) {
    return e.formatAbiItem(u);
  }
  function a(u) {
    return r.from(u);
  }
  function c(u) {
    const l = u.find((f) => f.type === "constructor");
    if (!l) throw new r.NotFoundError({ name: "constructor" });
    return l;
  }
  return or;
}
var gt = {},
  Jh;
function x6() {
  if (Jh) return gt;
  ((Jh = 1),
    Object.defineProperty(gt, "__esModule", { value: !0 }),
    (gt.decodeData = o),
    (gt.decodeResult = s),
    (gt.encodeData = i),
    (gt.encodeResult = a),
    (gt.format = c),
    (gt.from = u),
    (gt.fromAbi = l),
    (gt.getSelector = f));
  const e = ir(),
    r = y_(),
    n = ei(),
    t = Ne();
  function o(...m) {
    var _;
    const [g, h] = (() => {
        if (Array.isArray(m[0])) {
          const [E, P, d] = m;
          return [l(E, P), d];
        }
        return m;
      })(),
      { overloads: b } = g;
    if (t.size(h) < 4) throw new r.InvalidSelectorSizeError({ data: h });
    if (((_ = g.inputs) == null ? void 0 : _.length) === 0) return;
    const v = b ? l([g, ...b], h) : g;
    if (!(t.size(h) <= 4)) return n.decode(v.inputs, t.slice(h, 4));
  }
  function s(...m) {
    const [g, h, b = {}] = (() => {
        if (Array.isArray(m[0])) {
          const [_, E, P, d] = m;
          return [l(_, E), P, d];
        }
        return m;
      })(),
      v = n.decode(g.outputs, h, b);
    if (!(v && Object.keys(v).length === 0))
      return v && Object.keys(v).length === 1 ? (Array.isArray(v) ? v[0] : Object.values(v)[0]) : v;
  }
  function i(...m) {
    const [g, h = []] = (() => {
        if (Array.isArray(m[0])) {
          const [j, p, y] = m;
          return [l(j, p, { args: y }), y];
        }
        const [P, d] = m;
        return [P, d];
      })(),
      { overloads: b } = g,
      v = b ? l([g, ...b], g.name, { args: h }) : g,
      _ = f(v),
      E = h.length > 0 ? n.encode(v.inputs, h) : void 0;
    return E ? t.concat(_, E) : _;
  }
  function a(...m) {
    const [g, h, b = {}] = (() => {
        if (Array.isArray(m[0])) {
          const [E, P, d, j] = m;
          return [l(E, P), d, j];
        }
        return m;
      })(),
      { as: v = "Array" } = b,
      _ = g.outputs.length === 1 ? [h] : Array.isArray(h) ? h : v === "Object" ? Object.values(h) : [h];
    return n.encode(g.outputs, _);
  }
  function c(m) {
    return e.formatAbiItem(m);
  }
  function u(m, g = {}) {
    return r.from(m, g);
  }
  function l(m, g, h) {
    const b = r.fromAbi(m, g, h);
    if (b.type !== "function") throw new r.NotFoundError({ name: g, type: "function" });
    return b;
  }
  function f(m) {
    return r.getSelector(m);
  }
  return gt;
}
var qr = {},
  Yh;
function p_() {
  return (
    Yh ||
      ((Yh = 1),
      Object.defineProperty(qr, "__esModule", { value: !0 }),
      (qr.zeroAddress = qr.ethAddress = void 0),
      (qr.ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
      (qr.zeroAddress = "0x0000000000000000000000000000000000000000")),
    qr
  );
}
var Xh;
function C6() {
  if (Xh) return Js;
  ((Xh = 1), Object.defineProperty(Js, "__esModule", { value: !0 }), (Js.simulateCalls = f));
  const e = O6(),
    r = x6(),
    n = Ie(),
    t = p_(),
    o = Vo(),
    s = ue(),
    i = We(),
    a = b_(),
    c = Og(),
    u = h_(),
    l =
      "0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033";
  async function f(m, g) {
    const {
        blockNumber: h,
        blockTag: b,
        calls: v,
        stateOverrides: _,
        traceAssetChanges: E,
        traceTransfers: P,
        validation: d,
      } = g,
      j = g.account ? (0, n.parseAccount)(g.account) : void 0;
    if (E && !j) throw new s.BaseError("`account` is required when `traceAssetChanges` is true");
    const p = j
        ? e.encode(e.from("constructor(bytes, bytes)"), {
            bytecode: o.deploylessCallViaBytecodeBytecode,
            args: [l, r.encodeData(r.from("function getBalance(address)"), [j.address])],
          })
        : void 0,
      y = E
        ? await Promise.all(
            g.calls.map(async (V) => {
              if (!V.data && !V.abi) return;
              const { accessList: Y } = await (0, c.createAccessList)(m, {
                account: j.address,
                ...V,
                data: V.abi ? (0, i.encodeFunctionData)(V) : V.data,
              });
              return Y.map(({ address: re, storageKeys: J }) => (J.length > 0 ? re : null));
            }),
          ).then((V) => V.flat().filter(Boolean))
        : [],
      I = await (0, u.simulateBlocks)(m, {
        blockNumber: h,
        blockTag: b,
        blocks: [
          ...(E
            ? [
                { calls: [{ data: p }], stateOverrides: _ },
                {
                  calls: y.map((V, Y) => ({
                    abi: [r.from("function balanceOf(address) returns (uint256)")],
                    functionName: "balanceOf",
                    args: [j.address],
                    to: V,
                    from: t.zeroAddress,
                    nonce: Y,
                  })),
                  stateOverrides: [{ address: t.zeroAddress, nonce: 0 }],
                },
              ]
            : []),
          {
            calls: [...v, { to: t.zeroAddress }].map((V) => ({ ...V, from: j == null ? void 0 : j.address })),
            stateOverrides: _,
          },
          ...(E
            ? [
                { calls: [{ data: p }] },
                {
                  calls: y.map((V, Y) => ({
                    abi: [r.from("function balanceOf(address) returns (uint256)")],
                    functionName: "balanceOf",
                    args: [j.address],
                    to: V,
                    from: t.zeroAddress,
                    nonce: Y,
                  })),
                  stateOverrides: [{ address: t.zeroAddress, nonce: 0 }],
                },
                {
                  calls: y.map((V, Y) => ({
                    to: V,
                    abi: [r.from("function decimals() returns (uint256)")],
                    functionName: "decimals",
                    from: t.zeroAddress,
                    nonce: Y,
                  })),
                  stateOverrides: [{ address: t.zeroAddress, nonce: 0 }],
                },
                {
                  calls: y.map((V, Y) => ({
                    to: V,
                    abi: [r.from("function tokenURI(uint256) returns (string)")],
                    functionName: "tokenURI",
                    args: [0n],
                    from: t.zeroAddress,
                    nonce: Y,
                  })),
                  stateOverrides: [{ address: t.zeroAddress, nonce: 0 }],
                },
                {
                  calls: y.map((V, Y) => ({
                    to: V,
                    abi: [r.from("function symbol() returns (string)")],
                    functionName: "symbol",
                    from: t.zeroAddress,
                    nonce: Y,
                  })),
                  stateOverrides: [{ address: t.zeroAddress, nonce: 0 }],
                },
              ]
            : []),
        ],
        traceTransfers: P,
        validation: d,
      }),
      w = E ? I[2] : I[0],
      [A, B, , R, S, x, F, H] = E ? I : [],
      { calls: T, ...k } = w,
      O = T.slice(0, -1) ?? [],
      C = (A == null ? void 0 : A.calls) ?? [],
      q = (B == null ? void 0 : B.calls) ?? [],
      M = [...C, ...q].map((V) => (V.status === "success" ? (0, a.hexToBigInt)(V.data) : null)),
      N = (R == null ? void 0 : R.calls) ?? [],
      z = (S == null ? void 0 : S.calls) ?? [],
      $ = [...N, ...z].map((V) => (V.status === "success" ? (0, a.hexToBigInt)(V.data) : null)),
      U = ((x == null ? void 0 : x.calls) ?? []).map((V) => (V.status === "success" ? V.result : null)),
      G = ((H == null ? void 0 : H.calls) ?? []).map((V) => (V.status === "success" ? V.result : null)),
      Z = ((F == null ? void 0 : F.calls) ?? []).map((V) => (V.status === "success" ? V.result : null)),
      K = [];
    for (const [V, Y] of $.entries()) {
      const re = M[V];
      if (typeof Y != "bigint" || typeof re != "bigint") continue;
      const J = U[V - 1],
        X = G[V - 1],
        Q = Z[V - 1],
        oe =
          V === 0
            ? { address: t.ethAddress, decimals: 18, symbol: "ETH" }
            : { address: y[V - 1], decimals: Q || J ? Number(J ?? 1) : void 0, symbol: X ?? void 0 };
      K.some((ie) => ie.token.address === oe.address) ||
        K.push({ token: oe, value: { pre: re, post: Y, diff: Y - re } });
    }
    return { assetChanges: K, block: k, results: O };
  }
  return Js;
}
var mn = {},
  Ro = {},
  Wd = {},
  Qh;
function q6() {
  return (
    Qh ||
      ((Qh = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.InvalidWrappedSignatureError =
            e.universalSignatureValidatorAbi =
            e.universalSignatureValidatorBytecode =
            e.magicBytes =
              void 0),
          (e.assert = o),
          (e.from = s),
          (e.unwrap = i),
          (e.wrap = a),
          (e.validate = c));
        const r = ei(),
          n = ct(),
          t = Ne();
        ((e.magicBytes = "0x6492649264926492649264926492649264926492649264926492649264926492"),
          (e.universalSignatureValidatorBytecode =
            "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572"),
          (e.universalSignatureValidatorAbi = [
            {
              inputs: [
                { name: "_signer", type: "address" },
                { name: "_hash", type: "bytes32" },
                { name: "_signature", type: "bytes" },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              inputs: [
                { name: "_signer", type: "address" },
                { name: "_hash", type: "bytes32" },
                { name: "_signature", type: "bytes" },
              ],
              outputs: [{ type: "bool" }],
              stateMutability: "nonpayable",
              type: "function",
              name: "isValidSig",
            },
          ]));
        function o(l) {
          if (t.slice(l, -32) !== e.magicBytes) throw new u(l);
        }
        function s(l) {
          return typeof l == "string" ? i(l) : l;
        }
        function i(l) {
          o(l);
          const [f, m, g] = r.decode(r.from("address, bytes, bytes"), l);
          return { data: m, signature: g, to: f };
        }
        function a(l) {
          const { data: f, signature: m, to: g } = l;
          return t.concat(r.encode(r.from("address, bytes, bytes"), [g, f, m]), e.magicBytes);
        }
        function c(l) {
          try {
            return (o(l), !0);
          } catch {
            return !1;
          }
        }
        class u extends n.BaseError {
          constructor(f) {
            (super(`Value \`${f}\` is an invalid ERC-6492 wrapped signature.`),
              Object.defineProperty(this, "name", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: "SignatureErc6492.InvalidWrappedSignatureError",
              }));
          }
        }
        e.InvalidWrappedSignatureError = u;
      })(Wd)),
    Wd
  );
}
var ey;
function M6() {
  return (
    ey ||
      ((ey = 1),
      Object.defineProperty(Ro, "__esModule", { value: !0 }),
      (Ro.SignatureErc6492 = void 0),
      (Ro.SignatureErc6492 = q6())),
    Ro
  );
}
var Ys = {},
  ty;
function g_() {
  if (ty) return Ys;
  ((ty = 1), Object.defineProperty(Ys, "__esModule", { value: !0 }), (Ys.serializeSignature = t));
  const e = Dr(),
    r = Be(),
    n = ve();
  function t({ r: o, s, to: i = "hex", v: a, yParity: c }) {
    const u = (() => {
        if (c === 0 || c === 1) return c;
        if (a && (a === 27n || a === 28n || a >= 35n)) return a % 2n === 0n ? 1 : 0;
        throw new Error("Invalid `v` or `yParity` value");
      })(),
      l = `0x${new e.secp256k1.Signature((0, r.hexToBigInt)(o), (0, r.hexToBigInt)(s)).toCompactHex()}${u === 0 ? "1b" : "1c"}`;
    return i === "hex" ? l : (0, n.hexToBytes)(l);
  }
  return Ys;
}
var ry;
function Qu() {
  if (ry) return mn;
  ((ry = 1),
    Object.defineProperty(mn, "__esModule", { value: !0 }),
    (mn.verifyHash = d),
    (mn.verifyErc8010 = j),
    (mn.verifyErc1271 = y));
  const e = M6(),
    r = Yu(),
    n = Jt(),
    t = Vo(),
    o = ur(),
    s = Ko(),
    i = We(),
    a = Qe(),
    c = Pt(),
    u = kg(),
    l = qe(),
    f = Ge(),
    m = Be(),
    g = te(),
    h = me(),
    b = lr(),
    v = g_(),
    _ = jn(),
    E = xf(),
    P = Ot();
  async function d(w, A) {
    var k, O, C, q;
    const {
      address: B,
      chain: R = w.chain,
      hash: S,
      erc6492VerifierAddress: x = A.universalSignatureVerifierAddress ??
        ((O = (k = R == null ? void 0 : R.contracts) == null ? void 0 : k.erc6492Verifier) == null
          ? void 0
          : O.address),
      multicallAddress: F = A.multicallAddress ??
        ((q = (C = R == null ? void 0 : R.contracts) == null ? void 0 : C.multicall3) == null ? void 0 : q.address),
      mode: H = "auto",
    } = A;
    if (R != null && R.verifyHash) return await R.verifyHash(w, A);
    const T = (() => {
      const M = A.signature;
      return (0, f.isHex)(M)
        ? M
        : typeof M == "object" && "r" in M && "s" in M
          ? (0, v.serializeSignature)(M)
          : (0, g.bytesToHex)(M);
    })();
    try {
      if (H === "eoa")
        try {
          if ((0, c.isAddressEqual)((0, a.getAddress)(B), await (0, b.recoverAddress)({ hash: S, signature: T })))
            return !0;
        } catch {}
      return r.SignatureErc8010.validate(T)
        ? await j(w, { ...A, multicallAddress: F, signature: T })
        : await p(w, { ...A, verifierAddress: x, signature: T });
    } catch (M) {
      if (H !== "eoa")
        try {
          if ((0, c.isAddressEqual)((0, a.getAddress)(B), await (0, b.recoverAddress)({ hash: S, signature: T })))
            return !0;
        } catch {}
      if (M instanceof I) return !1;
      throw M;
    }
  }
  async function j(w, A) {
    var $;
    const { address: B, blockNumber: R, blockTag: S, hash: x, multicallAddress: F } = A,
      { authorization: H, data: T, signature: k, to: O } = r.SignatureErc8010.unwrap(A.signature);
    if (
      (await (0, E.getCode)(w, { address: B, blockNumber: R, blockTag: S })) ===
      (0, l.concatHex)(["0xef0100", H.address])
    )
      return await y(w, { address: B, blockNumber: R, blockTag: S, hash: x, signature: k });
    const q = {
      address: H.address,
      chainId: Number(H.chainId),
      nonce: Number(H.nonce),
      r: (0, g.numberToHex)(H.r, { size: 32 }),
      s: (0, g.numberToHex)(H.s, { size: 32 }),
      yParity: H.yParity,
    };
    if (!(await (0, u.verifyAuthorization)({ address: B, authorization: q }))) throw new I();
    const N = await (0, h.getAction)(
        w,
        P.readContract,
        "readContract",
      )({
        ...(F ? { address: F } : { code: t.multicall3Bytecode }),
        authorizationList: [q],
        abi: n.multicall3Abi,
        blockNumber: R,
        blockTag: "pending",
        functionName: "aggregate3",
        args: [
          [
            ...(T ? [{ allowFailure: !0, target: O ?? B, callData: T }] : []),
            {
              allowFailure: !0,
              target: B,
              callData: (0, i.encodeFunctionData)({
                abi: n.erc1271Abi,
                functionName: "isValidSignature",
                args: [x, k],
              }),
            },
          ],
        ],
      }),
      z = ($ = N[N.length - 1]) == null ? void 0 : $.returnData;
    if (z != null && z.startsWith("0x1626ba7e")) return !0;
    throw new I();
  }
  async function p(w, A) {
    const { address: B, factory: R, factoryData: S, hash: x, signature: F, verifierAddress: H, ...T } = A,
      k = await (async () =>
        (!R && !S) || e.SignatureErc6492.validate(F) ? F : e.SignatureErc6492.wrap({ data: S, signature: F, to: R }))(),
      O = H
        ? {
            to: H,
            data: (0, i.encodeFunctionData)({
              abi: n.erc6492SignatureValidatorAbi,
              functionName: "isValidSig",
              args: [B, x, k],
            }),
            ...T,
          }
        : {
            data: (0, s.encodeDeployData)({
              abi: n.erc6492SignatureValidatorAbi,
              args: [B, x, k],
              bytecode: t.erc6492SignatureValidatorByteCode,
            }),
            ...T,
          },
      { data: C } = await (0, h.getAction)(
        w,
        _.call,
        "call",
      )(O).catch((q) => {
        throw q instanceof o.CallExecutionError ? new I() : q;
      });
    if ((0, m.hexToBool)(C ?? "0x0")) return !0;
    throw new I();
  }
  async function y(w, A) {
    const { address: B, blockNumber: R, blockTag: S, hash: x, signature: F } = A;
    if (
      (
        await (0, h.getAction)(
          w,
          P.readContract,
          "readContract",
        )({
          address: B,
          abi: n.erc1271Abi,
          args: [x, F],
          blockNumber: R,
          blockTag: S,
          functionName: "isValidSignature",
        }).catch((T) => {
          throw T instanceof o.ContractFunctionExecutionError ? new I() : T;
        })
      ).startsWith("0x1626ba7e")
    )
      return !0;
    throw new I();
  }
  class I extends Error {}
  return mn;
}
var Xs = {},
  ny;
function H6() {
  if (ny) return Xs;
  ((ny = 1), Object.defineProperty(Xs, "__esModule", { value: !0 }), (Xs.verifyMessage = t));
  const e = me(),
    r = Xo(),
    n = Qu();
  async function t(o, { address: s, message: i, factory: a, factoryData: c, signature: u, ...l }) {
    const f = (0, r.hashMessage)(i);
    return (0, e.getAction)(
      o,
      n.verifyHash,
      "verifyHash",
    )({ address: s, factory: a, factoryData: c, hash: f, signature: u, ...l });
  }
  return Xs;
}
var Qs = {},
  oy;
function k6() {
  if (oy) return Qs;
  ((oy = 1), Object.defineProperty(Qs, "__esModule", { value: !0 }), (Qs.verifyTypedData = t));
  const e = me(),
    r = Qo(),
    n = Qu();
  async function t(o, s) {
    const {
        address: i,
        factory: a,
        factoryData: c,
        signature: u,
        message: l,
        primaryType: f,
        types: m,
        domain: g,
        ...h
      } = s,
      b = (0, r.hashTypedData)({ message: l, primaryType: f, types: m, domain: g });
    return (0, e.getAction)(
      o,
      n.verifyHash,
      "verifyHash",
    )({ address: i, factory: a, factoryData: c, hash: b, signature: u, ...h });
  }
  return Qs;
}
var ec = {},
  tc = {},
  iy;
function __() {
  if (iy) return tc;
  ((iy = 1), Object.defineProperty(tc, "__esModule", { value: !0 }), (tc.watchBlockNumber = i));
  const e = Be(),
    r = me(),
    n = Vr(),
    t = wn(),
    o = Fe(),
    s = Zo();
  function i(
    a,
    {
      emitOnBegin: c = !1,
      emitMissed: u = !1,
      onBlockNumber: l,
      onError: f,
      poll: m,
      pollingInterval: g = a.pollingInterval,
    },
  ) {
    const h =
      typeof m < "u"
        ? m
        : !(
            a.transport.type === "webSocket" ||
            a.transport.type === "ipc" ||
            (a.transport.type === "fallback" &&
              (a.transport.transports[0].config.type === "webSocket" ||
                a.transport.transports[0].config.type === "ipc"))
          );
    let b;
    return h
      ? (() => {
          const E = (0, o.stringify)(["watchBlockNumber", a.uid, c, u, g]);
          return (0, n.observe)(E, { onBlockNumber: l, onError: f }, (P) =>
            (0, t.poll)(
              async () => {
                var d;
                try {
                  const j = await (0, r.getAction)(a, s.getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
                  if (b !== void 0) {
                    if (j === b) return;
                    if (j - b > 1 && u) for (let p = b + 1n; p < j; p++) (P.onBlockNumber(p, b), (b = p));
                  }
                  (b === void 0 || j > b) && (P.onBlockNumber(j, b), (b = j));
                } catch (j) {
                  (d = P.onError) == null || d.call(P, j);
                }
              },
              { emitOnBegin: c, interval: g },
            ),
          );
        })()
      : (() => {
          const E = (0, o.stringify)(["watchBlockNumber", a.uid, c, u]);
          return (0, n.observe)(E, { onBlockNumber: l, onError: f }, (P) => {
            let d = !0,
              j = () => (d = !1);
            return (
              (async () => {
                try {
                  const p = (() => {
                      if (a.transport.type === "fallback") {
                        const I = a.transport.transports.find(
                          (w) => w.config.type === "webSocket" || w.config.type === "ipc",
                        );
                        return I ? I.value : a.transport;
                      }
                      return a.transport;
                    })(),
                    { unsubscribe: y } = await p.subscribe({
                      params: ["newHeads"],
                      onData(I) {
                        var A;
                        if (!d) return;
                        const w = (0, e.hexToBigInt)((A = I.result) == null ? void 0 : A.number);
                        (P.onBlockNumber(w, b), (b = w));
                      },
                      onError(I) {
                        var w;
                        (w = P.onError) == null || w.call(P, I);
                      },
                    });
                  ((j = y), d || j());
                } catch (p) {
                  f == null || f(p);
                }
              })(),
              () => j()
            );
          });
        })();
  }
  return tc;
}
var ay;
function v_() {
  if (ay) return ec;
  ((ay = 1), Object.defineProperty(ec, "__esModule", { value: !0 }), (ec.waitForTransactionReceipt = f));
  const e = sf(),
    r = tt(),
    n = me(),
    t = Vr(),
    o = pf(),
    s = Gu(),
    i = Fe(),
    a = Gr(),
    c = Zf(),
    u = m_(),
    l = __();
  async function f(m, g) {
    const {
        checkReplacement: h = !0,
        confirmations: b = 1,
        hash: v,
        onReplaced: _,
        retryCount: E = 6,
        retryDelay: P = ({ count: T }) => ~~(1 << T) * 200,
        timeout: d = 18e4,
      } = g,
      j = (0, i.stringify)(["waitForTransactionReceipt", m.uid, v]),
      p = (() => {
        var T;
        return g.pollingInterval
          ? g.pollingInterval
          : (T = m.chain) != null && T.experimental_preconfirmationTime
            ? m.chain.experimental_preconfirmationTime
            : m.pollingInterval;
      })();
    let y,
      I,
      w,
      A = !1,
      B,
      R;
    const { promise: S, resolve: x, reject: F } = (0, o.withResolvers)(),
      H = d
        ? setTimeout(() => {
            (R == null || R(), B == null || B(), F(new r.WaitForTransactionReceiptTimeoutError({ hash: v })));
          }, d)
        : void 0;
    return (
      (B = (0, t.observe)(j, { onReplaced: _, resolve: x, reject: F }, async (T) => {
        if (
          ((w = await (0, n.getAction)(
            m,
            u.getTransactionReceipt,
            "getTransactionReceipt",
          )({ hash: v }).catch(() => {})),
          w && b <= 1)
        ) {
          (clearTimeout(H), T.resolve(w), B == null || B());
          return;
        }
        R = (0, n.getAction)(
          m,
          l.watchBlockNumber,
          "watchBlockNumber",
        )({
          emitMissed: !0,
          emitOnBegin: !0,
          poll: !0,
          pollingInterval: p,
          async onBlockNumber(k) {
            const O = (q) => {
              (clearTimeout(H), R == null || R(), q(), B == null || B());
            };
            let C = k;
            if (!A)
              try {
                if (w) {
                  if (b > 1 && (!w.blockNumber || C - w.blockNumber + 1n < b)) return;
                  O(() => T.resolve(w));
                  return;
                }
                if (
                  (h &&
                    !y &&
                    ((A = !0),
                    await (0, s.withRetry)(
                      async () => {
                        ((y = await (0, n.getAction)(m, c.getTransaction, "getTransaction")({ hash: v })),
                          y.blockNumber && (C = y.blockNumber));
                      },
                      { delay: P, retryCount: E },
                    ),
                    (A = !1)),
                  (w = await (0, n.getAction)(m, u.getTransactionReceipt, "getTransactionReceipt")({ hash: v })),
                  b > 1 && (!w.blockNumber || C - w.blockNumber + 1n < b))
                )
                  return;
                O(() => T.resolve(w));
              } catch (q) {
                if (q instanceof r.TransactionNotFoundError || q instanceof r.TransactionReceiptNotFoundError) {
                  if (!y) {
                    A = !1;
                    return;
                  }
                  try {
                    ((I = y), (A = !0));
                    const M = await (0, s.withRetry)(
                      () => (0, n.getAction)(m, a.getBlock, "getBlock")({ blockNumber: C, includeTransactions: !0 }),
                      { delay: P, retryCount: E, shouldRetry: ({ error: $ }) => $ instanceof e.BlockNotFoundError },
                    );
                    A = !1;
                    const N = M.transactions.find(({ from: $, nonce: U }) => $ === I.from && U === I.nonce);
                    if (
                      !N ||
                      ((w = await (0, n.getAction)(
                        m,
                        u.getTransactionReceipt,
                        "getTransactionReceipt",
                      )({ hash: N.hash })),
                      b > 1 && (!w.blockNumber || C - w.blockNumber + 1n < b))
                    )
                      return;
                    let z = "replaced";
                    (N.to === I.to && N.value === I.value && N.input === I.input
                      ? (z = "repriced")
                      : N.from === N.to && N.value === 0n && (z = "cancelled"),
                      O(() => {
                        var $;
                        (($ = T.onReplaced) == null ||
                          $.call(T, { reason: z, replacedTransaction: I, transaction: N, transactionReceipt: w }),
                          T.resolve(w));
                      }));
                  } catch (M) {
                    O(() => T.reject(M));
                  }
                } else O(() => T.reject(q));
              }
          },
        });
      })),
      S
    );
  }
  return ec;
}
var rc = {},
  sy;
function F6() {
  if (sy) return rc;
  ((sy = 1), Object.defineProperty(rc, "__esModule", { value: !0 }), (rc.watchBlocks = s));
  const e = me(),
    r = Vr(),
    n = wn(),
    t = Fe(),
    o = Gr();
  function s(
    i,
    {
      blockTag: a = i.experimental_blockTag ?? "latest",
      emitMissed: c = !1,
      emitOnBegin: u = !1,
      onBlock: l,
      onError: f,
      includeTransactions: m,
      poll: g,
      pollingInterval: h = i.pollingInterval,
    },
  ) {
    const b =
        typeof g < "u"
          ? g
          : !(
              i.transport.type === "webSocket" ||
              i.transport.type === "ipc" ||
              (i.transport.type === "fallback" &&
                (i.transport.transports[0].config.type === "webSocket" ||
                  i.transport.transports[0].config.type === "ipc"))
            ),
      v = m ?? !1;
    let _;
    return b
      ? (() => {
          const d = (0, t.stringify)(["watchBlocks", i.uid, a, c, u, v, h]);
          return (0, r.observe)(d, { onBlock: l, onError: f }, (j) =>
            (0, n.poll)(
              async () => {
                var p;
                try {
                  const y = await (0, e.getAction)(i, o.getBlock, "getBlock")({ blockTag: a, includeTransactions: v });
                  if (y.number !== null && (_ == null ? void 0 : _.number) != null) {
                    if (y.number === _.number) return;
                    if (y.number - _.number > 1 && c)
                      for (let I = (_ == null ? void 0 : _.number) + 1n; I < y.number; I++) {
                        const w = await (0, e.getAction)(
                          i,
                          o.getBlock,
                          "getBlock",
                        )({ blockNumber: I, includeTransactions: v });
                        (j.onBlock(w, _), (_ = w));
                      }
                  }
                  ((_ == null ? void 0 : _.number) == null ||
                    (a === "pending" && (y == null ? void 0 : y.number) == null) ||
                    (y.number !== null && y.number > _.number)) &&
                    (j.onBlock(y, _), (_ = y));
                } catch (y) {
                  (p = j.onError) == null || p.call(j, y);
                }
              },
              { emitOnBegin: u, interval: h },
            ),
          );
        })()
      : (() => {
          let d = !0,
            j = !0,
            p = () => (d = !1);
          return (
            (async () => {
              try {
                u &&
                  (0, e.getAction)(
                    i,
                    o.getBlock,
                    "getBlock",
                  )({ blockTag: a, includeTransactions: v })
                    .then((w) => {
                      d && j && (l(w, void 0), (j = !1));
                    })
                    .catch(f);
                const y = (() => {
                    if (i.transport.type === "fallback") {
                      const w = i.transport.transports.find(
                        (A) => A.config.type === "webSocket" || A.config.type === "ipc",
                      );
                      return w ? w.value : i.transport;
                    }
                    return i.transport;
                  })(),
                  { unsubscribe: I } = await y.subscribe({
                    params: ["newHeads"],
                    async onData(w) {
                      var B;
                      if (!d) return;
                      const A = await (0, e.getAction)(
                        i,
                        o.getBlock,
                        "getBlock",
                      )({ blockNumber: (B = w.result) == null ? void 0 : B.number, includeTransactions: v }).catch(
                        () => {},
                      );
                      d && (l(A, _), (j = !1), (_ = A));
                    },
                    onError(w) {
                      f == null || f(w);
                    },
                  });
                ((p = I), d || p());
              } catch (y) {
                f == null || f(y);
              }
            })(),
            () => p()
          );
        })();
  }
  return rc;
}
var nc = {},
  cy;
function N6() {
  if (cy) return nc;
  ((cy = 1), Object.defineProperty(nc, "__esModule", { value: !0 }), (nc.watchEvent = h));
  const e = Se(),
    r = dr(),
    n = Do(),
    t = zr(),
    o = It(),
    s = me(),
    i = Vr(),
    a = wn(),
    c = Fe(),
    u = xg(),
    l = Zo(),
    f = Uu(),
    m = mf(),
    g = Lu();
  function h(
    b,
    {
      address: v,
      args: _,
      batch: E = !0,
      event: P,
      events: d,
      fromBlock: j,
      onError: p,
      onLogs: y,
      poll: I,
      pollingInterval: w = b.pollingInterval,
      strict: A,
    },
  ) {
    const B =
        typeof I < "u"
          ? I
          : typeof j == "bigint"
            ? !0
            : !(
                b.transport.type === "webSocket" ||
                b.transport.type === "ipc" ||
                (b.transport.type === "fallback" &&
                  (b.transport.transports[0].config.type === "webSocket" ||
                    b.transport.transports[0].config.type === "ipc"))
              ),
      R = A ?? !1;
    return B
      ? (() => {
          const F = (0, c.stringify)(["watchEvent", v, _, E, b.uid, P, w, j]);
          return (0, i.observe)(F, { onLogs: y, onError: p }, (H) => {
            let T;
            j !== void 0 && (T = j - 1n);
            let k,
              O = !1;
            const C = (0, a.poll)(
              async () => {
                var q;
                if (!O) {
                  try {
                    k = await (0, s.getAction)(
                      b,
                      u.createEventFilter,
                      "createEventFilter",
                    )({ address: v, args: _, event: P, events: d, strict: R, fromBlock: j });
                  } catch {}
                  O = !0;
                  return;
                }
                try {
                  let M;
                  if (k) M = await (0, s.getAction)(b, f.getFilterChanges, "getFilterChanges")({ filter: k });
                  else {
                    const N = await (0, s.getAction)(b, l.getBlockNumber, "getBlockNumber")({});
                    (T && T !== N
                      ? (M = await (0, s.getAction)(
                          b,
                          m.getLogs,
                          "getLogs",
                        )({ address: v, args: _, event: P, events: d, fromBlock: T + 1n, toBlock: N }))
                      : (M = []),
                      (T = N));
                  }
                  if (M.length === 0) return;
                  if (E) H.onLogs(M);
                  else for (const N of M) H.onLogs([N]);
                } catch (M) {
                  (k && M instanceof r.InvalidInputRpcError && (O = !1), (q = H.onError) == null || q.call(H, M));
                }
              },
              { emitOnBegin: !0, interval: w },
            );
            return async () => {
              (k && (await (0, s.getAction)(b, g.uninstallFilter, "uninstallFilter")({ filter: k })), C());
            };
          });
        })()
      : (() => {
          let F = !0,
            H = () => (F = !1);
          return (
            (async () => {
              try {
                const T = (() => {
                    if (b.transport.type === "fallback") {
                      const q = b.transport.transports.find(
                        (M) => M.config.type === "webSocket" || M.config.type === "ipc",
                      );
                      return q ? q.value : b.transport;
                    }
                    return b.transport;
                  })(),
                  k = d ?? (P ? [P] : void 0);
                let O = [];
                k &&
                  ((O = [k.flatMap((M) => (0, t.encodeEventTopics)({ abi: [M], eventName: M.name, args: _ }))]),
                  P && (O = O[0]));
                const { unsubscribe: C } = await T.subscribe({
                  params: ["logs", { address: v, topics: O }],
                  onData(q) {
                    var N;
                    if (!F) return;
                    const M = q.result;
                    try {
                      const { eventName: z, args: $ } = (0, n.decodeEventLog)({
                          abi: k ?? [],
                          data: M.data,
                          topics: M.topics,
                          strict: R,
                        }),
                        U = (0, o.formatLog)(M, { args: $, eventName: z });
                      y([U]);
                    } catch (z) {
                      let $, U;
                      if (z instanceof e.DecodeLogDataMismatch || z instanceof e.DecodeLogTopicsMismatch) {
                        if (A) return;
                        (($ = z.abiItem.name),
                          (U = (N = z.abiItem.inputs) == null ? void 0 : N.some((Z) => !("name" in Z && Z.name))));
                      }
                      const G = (0, o.formatLog)(M, { args: U ? [] : {}, eventName: $ });
                      y([G]);
                    }
                  },
                  onError(q) {
                    p == null || p(q);
                  },
                });
                ((H = C), F || H());
              } catch (T) {
                p == null || p(T);
              }
            })(),
            () => H()
          );
        })();
  }
  return nc;
}
var oc = {},
  uy;
function $6() {
  if (uy) return oc;
  ((uy = 1), Object.defineProperty(oc, "__esModule", { value: !0 }), (oc.watchPendingTransactions = a));
  const e = me(),
    r = Vr(),
    n = wn(),
    t = Fe(),
    o = Cg(),
    s = Uu(),
    i = Lu();
  function a(c, { batch: u = !0, onError: l, onTransactions: f, poll: m, pollingInterval: g = c.pollingInterval }) {
    return (typeof m < "u" ? m : c.transport.type !== "webSocket" && c.transport.type !== "ipc")
      ? (() => {
          const _ = (0, t.stringify)(["watchPendingTransactions", c.uid, u, g]);
          return (0, r.observe)(_, { onTransactions: f, onError: l }, (E) => {
            let P;
            const d = (0, n.poll)(
              async () => {
                var j;
                try {
                  if (!P)
                    try {
                      P = await (0, e.getAction)(
                        c,
                        o.createPendingTransactionFilter,
                        "createPendingTransactionFilter",
                      )({});
                      return;
                    } catch (y) {
                      throw (d(), y);
                    }
                  const p = await (0, e.getAction)(c, s.getFilterChanges, "getFilterChanges")({ filter: P });
                  if (p.length === 0) return;
                  if (u) E.onTransactions(p);
                  else for (const y of p) E.onTransactions([y]);
                } catch (p) {
                  (j = E.onError) == null || j.call(E, p);
                }
              },
              { emitOnBegin: !0, interval: g },
            );
            return async () => {
              (P && (await (0, e.getAction)(c, i.uninstallFilter, "uninstallFilter")({ filter: P })), d());
            };
          });
        })()
      : (() => {
          let _ = !0,
            E = () => (_ = !1);
          return (
            (async () => {
              try {
                const { unsubscribe: P } = await c.transport.subscribe({
                  params: ["newPendingTransactions"],
                  onData(d) {
                    if (!_) return;
                    const j = d.result;
                    f([j]);
                  },
                  onError(d) {
                    l == null || l(d);
                  },
                });
                ((E = P), _ || E());
              } catch (P) {
                l == null || l(P);
              }
            })(),
            () => E()
          );
        })();
  }
  return oc;
}
var ic = {},
  ac = {},
  dy;
function z6() {
  if (dy) return ac;
  ((dy = 1), Object.defineProperty(ac, "__esModule", { value: !0 }), (ac.parseSiweMessage = e));
  function e(t) {
    var h, b, v;
    const { scheme: o, statement: s, ...i } = ((h = t.match(r)) == null ? void 0 : h.groups) ?? {},
      {
        chainId: a,
        expirationTime: c,
        issuedAt: u,
        notBefore: l,
        requestId: f,
        ...m
      } = ((b = t.match(n)) == null ? void 0 : b.groups) ?? {},
      g =
        (v = t.split("Resources:")[1]) == null
          ? void 0
          : v
              .split(
                `
- `,
              )
              .slice(1);
    return {
      ...i,
      ...m,
      ...(a ? { chainId: Number(a) } : {}),
      ...(c ? { expirationTime: new Date(c) } : {}),
      ...(u ? { issuedAt: new Date(u) } : {}),
      ...(l ? { notBefore: new Date(l) } : {}),
      ...(f ? { requestId: f } : {}),
      ...(g ? { resources: g } : {}),
      ...(o ? { scheme: o } : {}),
      ...(s ? { statement: s } : {}),
    };
  }
  const r =
      /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/,
    n =
      /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;
  return ac;
}
var sc = {},
  fy;
function U6() {
  if (fy) return sc;
  ((fy = 1), Object.defineProperty(sc, "__esModule", { value: !0 }), (sc.validateSiweMessage = n));
  const e = et(),
    r = Pt();
  function n(t) {
    const { address: o, domain: s, message: i, nonce: a, scheme: c, time: u = new Date() } = t;
    if (
      (s && i.domain !== s) ||
      (a && i.nonce !== a) ||
      (c && i.scheme !== c) ||
      (i.expirationTime && u >= i.expirationTime) ||
      (i.notBefore && u < i.notBefore)
    )
      return !1;
    try {
      if (!i.address || !(0, e.isAddress)(i.address, { strict: !1 }) || (o && !(0, r.isAddressEqual)(i.address, o)))
        return !1;
    } catch {
      return !1;
    }
    return !0;
  }
  return sc;
}
var ly;
function L6() {
  if (ly) return ic;
  ((ly = 1), Object.defineProperty(ic, "__esModule", { value: !0 }), (ic.verifySiweMessage = o));
  const e = Xo(),
    r = z6(),
    n = U6(),
    t = Qu();
  async function o(s, i) {
    const { address: a, domain: c, message: u, nonce: l, scheme: f, signature: m, time: g = new Date(), ...h } = i,
      b = (0, r.parseSiweMessage)(u);
    if (!b.address || !(0, n.validateSiweMessage)({ address: a, domain: c, message: b, nonce: l, scheme: f, time: g }))
      return !1;
    const _ = (0, e.hashMessage)(u);
    return (0, t.verifyHash)(s, { address: b.address, hash: _, signature: m, ...h });
  }
  return ic;
}
var cc = {},
  by;
function Jf() {
  if (by) return cc;
  ((by = 1), Object.defineProperty(cc, "__esModule", { value: !0 }), (cc.sendRawTransactionSync = n));
  const e = tt(),
    r = Yo();
  async function n(t, { serializedTransaction: o, throwOnReceiptRevert: s, timeout: i }) {
    var l, f, m;
    const a = await t.request({ method: "eth_sendRawTransactionSync", params: i ? [o, i] : [o] }, { retryCount: 0 }),
      u = (
        ((m = (f = (l = t.chain) == null ? void 0 : l.formatters) == null ? void 0 : f.transactionReceipt) == null
          ? void 0
          : m.format) || r.formatTransactionReceipt
      )(a);
    if (u.status === "reverted" && s) throw new e.TransactionReceiptRevertedError({ receipt: u });
    return u;
  }
  return cc;
}
var my;
function E_() {
  if (my) return Ua;
  ((my = 1), Object.defineProperty(Ua, "__esModule", { value: !0 }), (Ua.publicActions = ye));
  const e = Xv(),
    r = t6(),
    n = r6(),
    t = n6(),
    o = Bg(),
    s = jn(),
    i = Og(),
    a = o6(),
    c = Xd(),
    u = xg(),
    l = Cg(),
    f = gg(),
    m = bg(),
    g = bf(),
    h = lg(),
    b = lf(),
    v = i6(),
    _ = a6(),
    E = Gr(),
    P = Zo(),
    d = s6(),
    j = mr(),
    p = xf(),
    y = hf(),
    I = c6(),
    w = d6(),
    A = l6(),
    B = Uu(),
    R = b6(),
    S = cf(),
    x = mf(),
    F = T6(),
    H = S6(),
    T = Zf(),
    k = I6(),
    O = Mu(),
    C = m_(),
    q = R6(),
    M = Ot(),
    N = h_(),
    z = C6(),
    $ = jg(),
    U = Lu(),
    G = Qu(),
    Z = H6(),
    K = k6(),
    V = v_(),
    Y = __(),
    re = F6(),
    J = Pg(),
    X = N6(),
    Q = $6(),
    oe = L6(),
    ie = Lo(),
    se = Pf(),
    de = Jf();
  function ye(ee) {
    return {
      call: (W) => (0, s.call)(ee, W),
      createAccessList: (W) => (0, i.createAccessList)(ee, W),
      createBlockFilter: () => (0, a.createBlockFilter)(ee),
      createContractEventFilter: (W) => (0, c.createContractEventFilter)(ee, W),
      createEventFilter: (W) => (0, u.createEventFilter)(ee, W),
      createPendingTransactionFilter: () => (0, l.createPendingTransactionFilter)(ee),
      estimateContractGas: (W) => (0, f.estimateContractGas)(ee, W),
      estimateGas: (W) => (0, g.estimateGas)(ee, W),
      getBalance: (W) => (0, v.getBalance)(ee, W),
      getBlobBaseFee: () => (0, _.getBlobBaseFee)(ee),
      getBlock: (W) => (0, E.getBlock)(ee, W),
      getBlockNumber: (W) => (0, P.getBlockNumber)(ee, W),
      getBlockTransactionCount: (W) => (0, d.getBlockTransactionCount)(ee, W),
      getBytecode: (W) => (0, p.getCode)(ee, W),
      getChainId: () => (0, j.getChainId)(ee),
      getCode: (W) => (0, p.getCode)(ee, W),
      getContractEvents: (W) => (0, y.getContractEvents)(ee, W),
      getDelegation: (W) => (0, I.getDelegation)(ee, W),
      getEip712Domain: (W) => (0, w.getEip712Domain)(ee, W),
      getEnsAddress: (W) => (0, e.getEnsAddress)(ee, W),
      getEnsAvatar: (W) => (0, r.getEnsAvatar)(ee, W),
      getEnsName: (W) => (0, n.getEnsName)(ee, W),
      getEnsResolver: (W) => (0, t.getEnsResolver)(ee, W),
      getEnsText: (W) => (0, o.getEnsText)(ee, W),
      getFeeHistory: (W) => (0, A.getFeeHistory)(ee, W),
      estimateFeesPerGas: (W) => (0, m.estimateFeesPerGas)(ee, W),
      getFilterChanges: (W) => (0, B.getFilterChanges)(ee, W),
      getFilterLogs: (W) => (0, R.getFilterLogs)(ee, W),
      getGasPrice: () => (0, S.getGasPrice)(ee),
      getLogs: (W) => (0, x.getLogs)(ee, W),
      getProof: (W) => (0, F.getProof)(ee, W),
      estimateMaxPriorityFeePerGas: (W) => (0, h.estimateMaxPriorityFeePerGas)(ee, W),
      fillTransaction: (W) => (0, b.fillTransaction)(ee, W),
      getStorageAt: (W) => (0, H.getStorageAt)(ee, W),
      getTransaction: (W) => (0, T.getTransaction)(ee, W),
      getTransactionConfirmations: (W) => (0, k.getTransactionConfirmations)(ee, W),
      getTransactionCount: (W) => (0, O.getTransactionCount)(ee, W),
      getTransactionReceipt: (W) => (0, C.getTransactionReceipt)(ee, W),
      multicall: (W) => (0, q.multicall)(ee, W),
      prepareTransactionRequest: (W) => (0, ie.prepareTransactionRequest)(ee, W),
      readContract: (W) => (0, M.readContract)(ee, W),
      sendRawTransaction: (W) => (0, se.sendRawTransaction)(ee, W),
      sendRawTransactionSync: (W) => (0, de.sendRawTransactionSync)(ee, W),
      simulate: (W) => (0, N.simulateBlocks)(ee, W),
      simulateBlocks: (W) => (0, N.simulateBlocks)(ee, W),
      simulateCalls: (W) => (0, z.simulateCalls)(ee, W),
      simulateContract: (W) => (0, $.simulateContract)(ee, W),
      verifyHash: (W) => (0, G.verifyHash)(ee, W),
      verifyMessage: (W) => (0, Z.verifyMessage)(ee, W),
      verifySiweMessage: (W) => (0, oe.verifySiweMessage)(ee, W),
      verifyTypedData: (W) => (0, K.verifyTypedData)(ee, W),
      uninstallFilter: (W) => (0, U.uninstallFilter)(ee, W),
      waitForTransactionReceipt: (W) => (0, V.waitForTransactionReceipt)(ee, W),
      watchBlocks: (W) => (0, re.watchBlocks)(ee, W),
      watchBlockNumber: (W) => (0, Y.watchBlockNumber)(ee, W),
      watchContractEvent: (W) => (0, J.watchContractEvent)(ee, W),
      watchEvent: (W) => (0, X.watchEvent)(ee, W),
      watchPendingTransactions: (W) => (0, Q.watchPendingTransactions)(ee, W),
    };
  }
  return Ua;
}
var hy;
function D6() {
  if (hy) return za;
  ((hy = 1), Object.defineProperty(za, "__esModule", { value: !0 }), (za.createPublicClient = n));
  const e = Vu(),
    r = E_();
  function n(t) {
    const { key: o = "public", name: s = "Public Client" } = t;
    return (0, e.createClient)({ ...t, key: o, name: s, type: "publicClient" }).extend(r.publicActions);
  }
  return za;
}
var uc = {},
  dc = {},
  fc = {},
  yy;
function G6() {
  if (yy) return fc;
  ((yy = 1), Object.defineProperty(fc, "__esModule", { value: !0 }), (fc.dropTransaction = e));
  async function e(r, { hash: n }) {
    await r.request({ method: `${r.mode}_dropTransaction`, params: [n] });
  }
  return fc;
}
var lc = {},
  py;
function V6() {
  if (py) return lc;
  ((py = 1), Object.defineProperty(lc, "__esModule", { value: !0 }), (lc.dumpState = e));
  async function e(r) {
    return r.request({ method: `${r.mode}_dumpState` });
  }
  return lc;
}
var bc = {},
  gy;
function W6() {
  if (gy) return bc;
  ((gy = 1), Object.defineProperty(bc, "__esModule", { value: !0 }), (bc.getAutomine = e));
  async function e(r) {
    return r.mode === "ganache"
      ? await r.request({ method: "eth_mining" })
      : await r.request({ method: `${r.mode}_getAutomine` });
  }
  return bc;
}
var mc = {},
  _y;
function K6() {
  if (_y) return mc;
  ((_y = 1), Object.defineProperty(mc, "__esModule", { value: !0 }), (mc.getTxpoolContent = e));
  async function e(r) {
    return await r.request({ method: "txpool_content" });
  }
  return mc;
}
var hc = {},
  vy;
function Z6() {
  if (vy) return hc;
  ((vy = 1), Object.defineProperty(hc, "__esModule", { value: !0 }), (hc.getTxpoolStatus = r));
  const e = Be();
  async function r(n) {
    const { pending: t, queued: o } = await n.request({ method: "txpool_status" });
    return { pending: (0, e.hexToNumber)(t), queued: (0, e.hexToNumber)(o) };
  }
  return hc;
}
var yc = {},
  Ey;
function J6() {
  if (Ey) return yc;
  ((Ey = 1), Object.defineProperty(yc, "__esModule", { value: !0 }), (yc.impersonateAccount = e));
  async function e(r, { address: n }) {
    await r.request({ method: `${r.mode}_impersonateAccount`, params: [n] });
  }
  return yc;
}
var pc = {},
  jy;
function Y6() {
  if (jy) return pc;
  ((jy = 1), Object.defineProperty(pc, "__esModule", { value: !0 }), (pc.increaseTime = r));
  const e = te();
  async function r(n, { seconds: t }) {
    return await n.request({ method: "evm_increaseTime", params: [(0, e.numberToHex)(t)] });
  }
  return pc;
}
var gc = {},
  wy;
function X6() {
  if (wy) return gc;
  ((wy = 1), Object.defineProperty(gc, "__esModule", { value: !0 }), (gc.inspectTxpool = e));
  async function e(r) {
    return await r.request({ method: "txpool_inspect" });
  }
  return gc;
}
var _c = {},
  Py;
function Q6() {
  if (Py) return _c;
  ((Py = 1), Object.defineProperty(_c, "__esModule", { value: !0 }), (_c.loadState = e));
  async function e(r, { state: n }) {
    await r.request({ method: `${r.mode}_loadState`, params: [n] });
  }
  return _c;
}
var vc = {},
  Ay;
function e2() {
  if (Ay) return vc;
  ((Ay = 1), Object.defineProperty(vc, "__esModule", { value: !0 }), (vc.mine = r));
  const e = te();
  async function r(n, { blocks: t, interval: o }) {
    n.mode === "ganache"
      ? await n.request({ method: "evm_mine", params: [{ blocks: (0, e.numberToHex)(t) }] })
      : await n.request({ method: `${n.mode}_mine`, params: [(0, e.numberToHex)(t), (0, e.numberToHex)(o || 0)] });
  }
  return vc;
}
var Ec = {},
  Ty;
function t2() {
  if (Ty) return Ec;
  ((Ty = 1), Object.defineProperty(Ec, "__esModule", { value: !0 }), (Ec.removeBlockTimestampInterval = e));
  async function e(r) {
    await r.request({ method: `${r.mode}_removeBlockTimestampInterval` });
  }
  return Ec;
}
var jc = {},
  Sy;
function r2() {
  if (Sy) return jc;
  ((Sy = 1), Object.defineProperty(jc, "__esModule", { value: !0 }), (jc.reset = e));
  async function e(r, { blockNumber: n, jsonRpcUrl: t } = {}) {
    await r.request({ method: `${r.mode}_reset`, params: [{ forking: { blockNumber: Number(n), jsonRpcUrl: t } }] });
  }
  return jc;
}
var wc = {},
  Iy;
function n2() {
  if (Iy) return wc;
  ((Iy = 1), Object.defineProperty(wc, "__esModule", { value: !0 }), (wc.revert = e));
  async function e(r, { id: n }) {
    await r.request({ method: "evm_revert", params: [n] });
  }
  return wc;
}
var Pc = {},
  Ry;
function o2() {
  if (Ry) return Pc;
  ((Ry = 1), Object.defineProperty(Pc, "__esModule", { value: !0 }), (Pc.sendUnsignedTransaction = n));
  const e = br(),
    r = jt();
  async function n(t, o) {
    var d, j, p;
    const {
        accessList: s,
        data: i,
        from: a,
        gas: c,
        gasPrice: u,
        maxFeePerGas: l,
        maxPriorityFeePerGas: f,
        nonce: m,
        to: g,
        value: h,
        ...b
      } = o,
      v =
        (p = (j = (d = t.chain) == null ? void 0 : d.formatters) == null ? void 0 : j.transactionRequest) == null
          ? void 0
          : p.format,
      E = (v || r.formatTransactionRequest)(
        {
          ...(0, e.extract)(b, { format: v }),
          accessList: s,
          data: i,
          from: a,
          gas: c,
          gasPrice: u,
          maxFeePerGas: l,
          maxPriorityFeePerGas: f,
          nonce: m,
          to: g,
          value: h,
        },
        "sendUnsignedTransaction",
      );
    return await t.request({ method: "eth_sendUnsignedTransaction", params: [E] });
  }
  return Pc;
}
var Ac = {},
  By;
function i2() {
  if (By) return Ac;
  ((By = 1), Object.defineProperty(Ac, "__esModule", { value: !0 }), (Ac.setAutomine = e));
  async function e(r, n) {
    r.mode === "ganache"
      ? n
        ? await r.request({ method: "miner_start" })
        : await r.request({ method: "miner_stop" })
      : await r.request({ method: "evm_setAutomine", params: [n] });
  }
  return Ac;
}
var Tc = {},
  Oy;
function a2() {
  if (Oy) return Tc;
  ((Oy = 1), Object.defineProperty(Tc, "__esModule", { value: !0 }), (Tc.setBalance = r));
  const e = te();
  async function r(n, { address: t, value: o }) {
    n.mode === "ganache"
      ? await n.request({ method: "evm_setAccountBalance", params: [t, (0, e.numberToHex)(o)] })
      : await n.request({ method: `${n.mode}_setBalance`, params: [t, (0, e.numberToHex)(o)] });
  }
  return Tc;
}
var Sc = {},
  xy;
function s2() {
  if (xy) return Sc;
  ((xy = 1), Object.defineProperty(Sc, "__esModule", { value: !0 }), (Sc.setBlockGasLimit = r));
  const e = te();
  async function r(n, { gasLimit: t }) {
    await n.request({ method: "evm_setBlockGasLimit", params: [(0, e.numberToHex)(t)] });
  }
  return Sc;
}
var Ic = {},
  Cy;
function c2() {
  if (Cy) return Ic;
  ((Cy = 1), Object.defineProperty(Ic, "__esModule", { value: !0 }), (Ic.setBlockTimestampInterval = e));
  async function e(r, { interval: n }) {
    const t = r.mode === "hardhat" ? n * 1e3 : n;
    await r.request({ method: `${r.mode}_setBlockTimestampInterval`, params: [t] });
  }
  return Ic;
}
var Rc = {},
  qy;
function u2() {
  if (qy) return Rc;
  ((qy = 1), Object.defineProperty(Rc, "__esModule", { value: !0 }), (Rc.setCode = e));
  async function e(r, { address: n, bytecode: t }) {
    r.mode === "ganache"
      ? await r.request({ method: "evm_setAccountCode", params: [n, t] })
      : await r.request({ method: `${r.mode}_setCode`, params: [n, t] });
  }
  return Rc;
}
var Bc = {},
  My;
function d2() {
  if (My) return Bc;
  ((My = 1), Object.defineProperty(Bc, "__esModule", { value: !0 }), (Bc.setCoinbase = e));
  async function e(r, { address: n }) {
    await r.request({ method: `${r.mode}_setCoinbase`, params: [n] });
  }
  return Bc;
}
var Oc = {},
  Hy;
function f2() {
  if (Hy) return Oc;
  ((Hy = 1), Object.defineProperty(Oc, "__esModule", { value: !0 }), (Oc.setIntervalMining = e));
  async function e(r, { interval: n }) {
    const t = r.mode === "hardhat" ? n * 1e3 : n;
    await r.request({ method: "evm_setIntervalMining", params: [t] });
  }
  return Oc;
}
var xc = {},
  ky;
function l2() {
  if (ky) return xc;
  ((ky = 1), Object.defineProperty(xc, "__esModule", { value: !0 }), (xc.setLoggingEnabled = e));
  async function e(r, n) {
    await r.request({ method: `${r.mode}_setLoggingEnabled`, params: [n] });
  }
  return xc;
}
var Cc = {},
  Fy;
function b2() {
  if (Fy) return Cc;
  ((Fy = 1), Object.defineProperty(Cc, "__esModule", { value: !0 }), (Cc.setMinGasPrice = r));
  const e = te();
  async function r(n, { gasPrice: t }) {
    await n.request({ method: `${n.mode}_setMinGasPrice`, params: [(0, e.numberToHex)(t)] });
  }
  return Cc;
}
var qc = {},
  Ny;
function m2() {
  if (Ny) return qc;
  ((Ny = 1), Object.defineProperty(qc, "__esModule", { value: !0 }), (qc.setNextBlockBaseFeePerGas = r));
  const e = te();
  async function r(n, { baseFeePerGas: t }) {
    await n.request({ method: `${n.mode}_setNextBlockBaseFeePerGas`, params: [(0, e.numberToHex)(t)] });
  }
  return qc;
}
var Mc = {},
  $y;
function h2() {
  if ($y) return Mc;
  (($y = 1), Object.defineProperty(Mc, "__esModule", { value: !0 }), (Mc.setNextBlockTimestamp = r));
  const e = te();
  async function r(n, { timestamp: t }) {
    await n.request({ method: "evm_setNextBlockTimestamp", params: [(0, e.numberToHex)(t)] });
  }
  return Mc;
}
var Hc = {},
  zy;
function y2() {
  if (zy) return Hc;
  ((zy = 1), Object.defineProperty(Hc, "__esModule", { value: !0 }), (Hc.setNonce = r));
  const e = te();
  async function r(n, { address: t, nonce: o }) {
    await n.request({ method: `${n.mode}_setNonce`, params: [t, (0, e.numberToHex)(o)] });
  }
  return Hc;
}
var kc = {},
  Uy;
function p2() {
  if (Uy) return kc;
  ((Uy = 1), Object.defineProperty(kc, "__esModule", { value: !0 }), (kc.setRpcUrl = e));
  async function e(r, n) {
    await r.request({ method: `${r.mode}_setRpcUrl`, params: [n] });
  }
  return kc;
}
var Fc = {},
  Ly;
function g2() {
  if (Ly) return Fc;
  ((Ly = 1), Object.defineProperty(Fc, "__esModule", { value: !0 }), (Fc.setStorageAt = r));
  const e = te();
  async function r(n, { address: t, index: o, value: s }) {
    await n.request({
      method: `${n.mode}_setStorageAt`,
      params: [t, typeof o == "number" ? (0, e.numberToHex)(o) : o, s],
    });
  }
  return Fc;
}
var Nc = {},
  Dy;
function _2() {
  if (Dy) return Nc;
  ((Dy = 1), Object.defineProperty(Nc, "__esModule", { value: !0 }), (Nc.snapshot = e));
  async function e(r) {
    return await r.request({ method: "evm_snapshot" });
  }
  return Nc;
}
var $c = {},
  Gy;
function v2() {
  if (Gy) return $c;
  ((Gy = 1), Object.defineProperty($c, "__esModule", { value: !0 }), ($c.stopImpersonatingAccount = e));
  async function e(r, { address: n }) {
    await r.request({ method: `${r.mode}_stopImpersonatingAccount`, params: [n] });
  }
  return $c;
}
var Vy;
function j_() {
  if (Vy) return dc;
  ((Vy = 1), Object.defineProperty(dc, "__esModule", { value: !0 }), (dc.testActions = x));
  const e = G6(),
    r = V6(),
    n = W6(),
    t = K6(),
    o = Z6(),
    s = J6(),
    i = Y6(),
    a = X6(),
    c = Q6(),
    u = e2(),
    l = t2(),
    f = r2(),
    m = n2(),
    g = o2(),
    h = i2(),
    b = a2(),
    v = s2(),
    _ = c2(),
    E = u2(),
    P = d2(),
    d = f2(),
    j = l2(),
    p = b2(),
    y = m2(),
    I = h2(),
    w = y2(),
    A = p2(),
    B = g2(),
    R = _2(),
    S = v2();
  function x({ mode: F }) {
    return (H) => {
      const T = H.extend(() => ({ mode: F }));
      return {
        dropTransaction: (k) => (0, e.dropTransaction)(T, k),
        dumpState: () => (0, r.dumpState)(T),
        getAutomine: () => (0, n.getAutomine)(T),
        getTxpoolContent: () => (0, t.getTxpoolContent)(T),
        getTxpoolStatus: () => (0, o.getTxpoolStatus)(T),
        impersonateAccount: (k) => (0, s.impersonateAccount)(T, k),
        increaseTime: (k) => (0, i.increaseTime)(T, k),
        inspectTxpool: () => (0, a.inspectTxpool)(T),
        loadState: (k) => (0, c.loadState)(T, k),
        mine: (k) => (0, u.mine)(T, k),
        removeBlockTimestampInterval: () => (0, l.removeBlockTimestampInterval)(T),
        reset: (k) => (0, f.reset)(T, k),
        revert: (k) => (0, m.revert)(T, k),
        sendUnsignedTransaction: (k) => (0, g.sendUnsignedTransaction)(T, k),
        setAutomine: (k) => (0, h.setAutomine)(T, k),
        setBalance: (k) => (0, b.setBalance)(T, k),
        setBlockGasLimit: (k) => (0, v.setBlockGasLimit)(T, k),
        setBlockTimestampInterval: (k) => (0, _.setBlockTimestampInterval)(T, k),
        setCode: (k) => (0, E.setCode)(T, k),
        setCoinbase: (k) => (0, P.setCoinbase)(T, k),
        setIntervalMining: (k) => (0, d.setIntervalMining)(T, k),
        setLoggingEnabled: (k) => (0, j.setLoggingEnabled)(T, k),
        setMinGasPrice: (k) => (0, p.setMinGasPrice)(T, k),
        setNextBlockBaseFeePerGas: (k) => (0, y.setNextBlockBaseFeePerGas)(T, k),
        setNextBlockTimestamp: (k) => (0, I.setNextBlockTimestamp)(T, k),
        setNonce: (k) => (0, w.setNonce)(T, k),
        setRpcUrl: (k) => (0, A.setRpcUrl)(T, k),
        setStorageAt: (k) => (0, B.setStorageAt)(T, k),
        snapshot: () => (0, R.snapshot)(T),
        stopImpersonatingAccount: (k) => (0, S.stopImpersonatingAccount)(T, k),
      };
    };
  }
  return dc;
}
var Wy;
function E2() {
  if (Wy) return uc;
  ((Wy = 1), Object.defineProperty(uc, "__esModule", { value: !0 }), (uc.createTestClient = n));
  const e = Vu(),
    r = j_();
  function n(t) {
    const { key: o = "test", name: s = "Test Client", mode: i } = t;
    return (0, e.createClient)({ ...t, key: o, name: s, type: "testClient" }).extend((c) => ({
      mode: i,
      ...(0, r.testActions)({ mode: i })(c),
    }));
  }
  return uc;
}
var zc = {},
  Uc = {},
  Lc = {},
  Ky;
function j2() {
  if (Ky) return Lc;
  ((Ky = 1), Object.defineProperty(Lc, "__esModule", { value: !0 }), (Lc.addChain = r));
  const e = te();
  async function r(n, { chain: t }) {
    const { id: o, name: s, nativeCurrency: i, rpcUrls: a, blockExplorers: c } = t;
    await n.request(
      {
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: (0, e.numberToHex)(o),
            chainName: s,
            nativeCurrency: i,
            rpcUrls: a.default.http,
            blockExplorerUrls: c ? Object.values(c).map(({ url: u }) => u) : void 0,
          },
        ],
      },
      { dedupe: !0, retryCount: 0 },
    );
  }
  return Lc;
}
var Dc = {},
  Zy;
function w2() {
  if (Zy) return Dc;
  ((Zy = 1), Object.defineProperty(Dc, "__esModule", { value: !0 }), (Dc.deployContract = n));
  const e = Ko(),
    r = Du();
  function n(t, o) {
    const { abi: s, args: i, bytecode: a, ...c } = o,
      u = (0, e.encodeDeployData)({ abi: s, args: i, bytecode: a });
    return (0, r.sendTransaction)(t, { ...c, ...(c.authorizationList ? { to: null } : {}), data: u });
  }
  return Dc;
}
var Gc = {},
  Jy;
function P2() {
  if (Jy) return Gc;
  ((Jy = 1), Object.defineProperty(Gc, "__esModule", { value: !0 }), (Gc.getAddresses = r));
  const e = Qe();
  async function r(n) {
    var o;
    return ((o = n.account) == null ? void 0 : o.type) === "local"
      ? [n.account.address]
      : (await n.request({ method: "eth_accounts" }, { dedupe: !0 })).map((s) => (0, e.checksumAddress)(s));
  }
  return Gc;
}
var Vc = {},
  Yy;
function A2() {
  if (Yy) return Vc;
  ((Yy = 1), Object.defineProperty(Vc, "__esModule", { value: !0 }), (Vc.getCapabilities = n));
  const e = Ie(),
    r = te();
  async function n(t, o = {}) {
    const { account: s = t.account, chainId: i } = o,
      a = s ? (0, e.parseAccount)(s) : void 0,
      c = i ? [a == null ? void 0 : a.address, [(0, r.numberToHex)(i)]] : [a == null ? void 0 : a.address],
      u = await t.request({ method: "wallet_getCapabilities", params: c }),
      l = {};
    for (const [f, m] of Object.entries(u)) {
      l[Number(f)] = {};
      for (let [g, h] of Object.entries(m))
        (g === "addSubAccount" && (g = "unstable_addSubAccount"), (l[Number(f)][g] = h));
    }
    return typeof i == "number" ? l[i] : l;
  }
  return Vc;
}
var Wc = {},
  Xy;
function T2() {
  if (Xy) return Wc;
  ((Xy = 1), Object.defineProperty(Wc, "__esModule", { value: !0 }), (Wc.getPermissions = e));
  async function e(r) {
    return await r.request({ method: "wallet_getPermissions" }, { dedupe: !0 });
  }
  return Wc;
}
var Kc = {},
  Qy;
function w_() {
  if (Qy) return Kc;
  ((Qy = 1), Object.defineProperty(Kc, "__esModule", { value: !0 }), (Kc.prepareAuthorization = i));
  const e = Ie(),
    r = yr(),
    n = Pt(),
    t = me(),
    o = mr(),
    s = Mu();
  async function i(a, c) {
    var b;
    const { account: u = a.account, chainId: l, nonce: f } = c;
    if (!u) throw new r.AccountNotFoundError({ docsPath: "/docs/eip7702/prepareAuthorization" });
    const m = (0, e.parseAccount)(u),
      g = (() => {
        if (c.executor) return c.executor === "self" ? c.executor : (0, e.parseAccount)(c.executor);
      })(),
      h = { address: c.contractAddress ?? c.address, chainId: l, nonce: f };
    return (
      typeof h.chainId > "u" &&
        (h.chainId =
          ((b = a.chain) == null ? void 0 : b.id) ?? (await (0, t.getAction)(a, o.getChainId, "getChainId")({}))),
      typeof h.nonce > "u" &&
        ((h.nonce = await (0, t.getAction)(
          a,
          s.getTransactionCount,
          "getTransactionCount",
        )({ address: m.address, blockTag: "pending" })),
        (g === "self" || (g != null && g.address && (0, n.isAddressEqual)(g.address, m.address))) && (h.nonce += 1)),
      h
    );
  }
  return Kc;
}
var Zc = {},
  ep;
function S2() {
  if (ep) return Zc;
  ((ep = 1), Object.defineProperty(Zc, "__esModule", { value: !0 }), (Zc.requestAddresses = r));
  const e = Qe();
  async function r(n) {
    return (await n.request({ method: "eth_requestAccounts" }, { dedupe: !0, retryCount: 0 })).map((o) =>
      (0, e.getAddress)(o),
    );
  }
  return Zc;
}
var Jc = {},
  tp;
function I2() {
  if (tp) return Jc;
  ((tp = 1), Object.defineProperty(Jc, "__esModule", { value: !0 }), (Jc.requestPermissions = e));
  async function e(r, n) {
    return r.request({ method: "wallet_requestPermissions", params: [n] }, { retryCount: 0 });
  }
  return Jc;
}
var Yc = {},
  rp;
function R2() {
  if (rp) return Yc;
  ((rp = 1), Object.defineProperty(Yc, "__esModule", { value: !0 }), (Yc.sendCallsSync = t));
  const e = me(),
    r = Tf(),
    n = Sf();
  async function t(o, s) {
    const { chain: i = o.chain } = s,
      a = s.timeout ?? Math.max(((i == null ? void 0 : i.blockTime) ?? 0) * 3, 5e3),
      c = await (0, e.getAction)(o, r.sendCalls, "sendCalls")(s);
    return await (0, e.getAction)(o, n.waitForCallsStatus, "waitForCallsStatus")({ ...s, id: c.id, timeout: a });
  }
  return Yc;
}
var Xc = {},
  np;
function P_() {
  if (np) return Xc;
  ((np = 1), Object.defineProperty(Xc, "__esModule", { value: !0 }), (Xc.sendTransactionSync = E));
  const e = Ie(),
    r = yr(),
    n = ue(),
    t = tt(),
    o = Fo(),
    s = Jo(),
    i = qe(),
    a = Uo(),
    c = br(),
    u = jt(),
    l = me(),
    f = Nr(),
    m = wt(),
    g = mr(),
    h = v_(),
    b = Lo(),
    v = Jf(),
    _ = new f.LruMap(128);
  async function E(P, d) {
    var U, G, Z, K, V;
    const {
        account: j = P.account,
        assertChainId: p = !0,
        chain: y = P.chain,
        accessList: I,
        authorizationList: w,
        blobs: A,
        data: B,
        dataSuffix: R = typeof P.dataSuffix == "string" ? P.dataSuffix : (U = P.dataSuffix) == null ? void 0 : U.value,
        gas: S,
        gasPrice: x,
        maxFeePerBlobGas: F,
        maxFeePerGas: H,
        maxPriorityFeePerGas: T,
        nonce: k,
        pollingInterval: O,
        throwOnReceiptRevert: C,
        type: q,
        value: M,
        ...N
      } = d,
      z = d.timeout ?? Math.max(((y == null ? void 0 : y.blockTime) ?? 0) * 3, 5e3);
    if (typeof j > "u") throw new r.AccountNotFoundError({ docsPath: "/docs/actions/wallet/sendTransactionSync" });
    const $ = j ? (0, e.parseAccount)(j) : null;
    try {
      (0, m.assertRequest)(d);
      const Y = await (async () => {
        if (d.to) return d.to;
        if (d.to !== null && w && w.length > 0)
          return await (0, o.recoverAuthorizationAddress)({ authorization: w[0] }).catch(() => {
            throw new n.BaseError("`to` is required. Could not infer from `authorizationList`.");
          });
      })();
      if (($ == null ? void 0 : $.type) === "json-rpc" || $ === null) {
        let re;
        y !== null &&
          ((re = await (0, l.getAction)(P, g.getChainId, "getChainId")({})),
          p && (0, s.assertCurrentChain)({ currentChainId: re, chain: y }));
        const J =
            (K = (Z = (G = P.chain) == null ? void 0 : G.formatters) == null ? void 0 : Z.transactionRequest) == null
              ? void 0
              : K.format,
          Q = (J || u.formatTransactionRequest)(
            {
              ...(0, c.extract)(N, { format: J }),
              accessList: I,
              account: $,
              authorizationList: w,
              blobs: A,
              chainId: re,
              data: B && (0, i.concat)([B, R ?? "0x"]),
              gas: S,
              gasPrice: x,
              maxFeePerBlobGas: F,
              maxFeePerGas: H,
              maxPriorityFeePerGas: T,
              nonce: k,
              to: Y,
              type: q,
              value: M,
            },
            "sendTransaction",
          ),
          oe = _.get(P.uid),
          ie = oe ? "wallet_sendTransaction" : "eth_sendTransaction",
          se = await (async () => {
            try {
              return await P.request({ method: ie, params: [Q] }, { retryCount: 0 });
            } catch (ye) {
              if (oe === !1) throw ye;
              const ee = ye;
              if (
                ee.name === "InvalidInputRpcError" ||
                ee.name === "InvalidParamsRpcError" ||
                ee.name === "MethodNotFoundRpcError" ||
                ee.name === "MethodNotSupportedRpcError"
              )
                return await P.request({ method: "wallet_sendTransaction", params: [Q] }, { retryCount: 0 })
                  .then((W) => (_.set(P.uid, !0), W))
                  .catch((W) => {
                    const Ee = W;
                    throw Ee.name === "MethodNotFoundRpcError" || Ee.name === "MethodNotSupportedRpcError"
                      ? (_.set(P.uid, !1), ee)
                      : Ee;
                  });
              throw ee;
            }
          })(),
          de = await (0, l.getAction)(
            P,
            h.waitForTransactionReceipt,
            "waitForTransactionReceipt",
          )({ checkReplacement: !1, hash: se, pollingInterval: O, timeout: z });
        if (C && de.status === "reverted") throw new t.TransactionReceiptRevertedError({ receipt: de });
        return de;
      }
      if (($ == null ? void 0 : $.type) === "local") {
        const re = await (0, l.getAction)(
            P,
            b.prepareTransactionRequest,
            "prepareTransactionRequest",
          )({
            account: $,
            accessList: I,
            authorizationList: w,
            blobs: A,
            chain: y,
            data: B && (0, i.concat)([B, R ?? "0x"]),
            gas: S,
            gasPrice: x,
            maxFeePerBlobGas: F,
            maxFeePerGas: H,
            maxPriorityFeePerGas: T,
            nonce: k,
            nonceManager: $.nonceManager,
            parameters: [...b.defaultParameters, "sidecars"],
            type: q,
            value: M,
            ...N,
            to: Y,
          }),
          J = (V = y == null ? void 0 : y.serializers) == null ? void 0 : V.transaction,
          X = await $.signTransaction(re, { serializer: J });
        return await (0, l.getAction)(
          P,
          v.sendRawTransactionSync,
          "sendRawTransactionSync",
        )({ serializedTransaction: X, throwOnReceiptRevert: C, timeout: d.timeout });
      }
      throw ($ == null ? void 0 : $.type) === "smart"
        ? new r.AccountTypeNotSupportedError({
            metaMessages: ["Consider using the `sendUserOperation` Action instead."],
            docsPath: "/docs/actions/bundler/sendUserOperation",
            type: "smart",
          })
        : new r.AccountTypeNotSupportedError({
            docsPath: "/docs/actions/wallet/sendTransactionSync",
            type: $ == null ? void 0 : $.type,
          });
    } catch (Y) {
      throw Y instanceof r.AccountTypeNotSupportedError
        ? Y
        : (0, a.getTransactionError)(Y, { ...d, account: $, chain: d.chain || void 0 });
    }
  }
  return Xc;
}
var Qc = {},
  op;
function B2() {
  if (op) return Qc;
  ((op = 1), Object.defineProperty(Qc, "__esModule", { value: !0 }), (Qc.showCallsStatus = e));
  async function e(r, n) {
    const { id: t } = n;
    await r.request({ method: "wallet_showCallsStatus", params: [t] });
  }
  return Qc;
}
var eu = {},
  ip;
function O2() {
  if (ip) return eu;
  ((ip = 1), Object.defineProperty(eu, "__esModule", { value: !0 }), (eu.signAuthorization = t));
  const e = Ie(),
    r = yr(),
    n = w_();
  async function t(o, s) {
    const { account: i = o.account } = s;
    if (!i) throw new r.AccountNotFoundError({ docsPath: "/docs/eip7702/signAuthorization" });
    const a = (0, e.parseAccount)(i);
    if (!a.signAuthorization)
      throw new r.AccountTypeNotSupportedError({
        docsPath: "/docs/eip7702/signAuthorization",
        metaMessages: ["The `signAuthorization` Action does not support JSON-RPC Accounts."],
        type: a.type,
      });
    const c = await (0, n.prepareAuthorization)(o, s);
    return a.signAuthorization(c);
  }
  return eu;
}
var tu = {},
  ap;
function x2() {
  if (ap) return tu;
  ((ap = 1), Object.defineProperty(tu, "__esModule", { value: !0 }), (tu.signMessage = t));
  const e = Ie(),
    r = yr(),
    n = te();
  async function t(o, { account: s = o.account, message: i }) {
    if (!s) throw new r.AccountNotFoundError({ docsPath: "/docs/actions/wallet/signMessage" });
    const a = (0, e.parseAccount)(s);
    if (a.signMessage) return a.signMessage({ message: i });
    const c = typeof i == "string" ? (0, n.stringToHex)(i) : i.raw instanceof Uint8Array ? (0, n.toHex)(i.raw) : i.raw;
    return o.request({ method: "personal_sign", params: [c, a.address] }, { retryCount: 0 });
  }
  return tu;
}
var ru = {},
  sp;
function C2() {
  if (sp) return ru;
  ((sp = 1), Object.defineProperty(ru, "__esModule", { value: !0 }), (ru.signTransaction = c));
  const e = Ie(),
    r = yr(),
    n = Jo(),
    t = te(),
    o = jt(),
    s = me(),
    i = wt(),
    a = mr();
  async function c(u, l) {
    var E, P, d, j;
    const { account: f = u.account, chain: m = u.chain, ...g } = l;
    if (!f) throw new r.AccountNotFoundError({ docsPath: "/docs/actions/wallet/signTransaction" });
    const h = (0, e.parseAccount)(f);
    (0, i.assertRequest)({ account: h, ...l });
    const b = await (0, s.getAction)(u, a.getChainId, "getChainId")({});
    m !== null && (0, n.assertCurrentChain)({ currentChainId: b, chain: m });
    const v = (m == null ? void 0 : m.formatters) || ((E = u.chain) == null ? void 0 : E.formatters),
      _ = ((P = v == null ? void 0 : v.transactionRequest) == null ? void 0 : P.format) || o.formatTransactionRequest;
    return h.signTransaction
      ? h.signTransaction(
          { ...g, account: h, chainId: b },
          { serializer: (j = (d = u.chain) == null ? void 0 : d.serializers) == null ? void 0 : j.transaction },
        )
      : await u.request(
          {
            method: "eth_signTransaction",
            params: [
              { ..._({ ...g, account: h }, "signTransaction"), chainId: (0, t.numberToHex)(b), from: h.address },
            ],
          },
          { retryCount: 0 },
        );
  }
  return ru;
}
var nu = {},
  cp;
function q2() {
  if (cp) return nu;
  ((cp = 1), Object.defineProperty(nu, "__esModule", { value: !0 }), (nu.signTypedData = t));
  const e = Ie(),
    r = yr(),
    n = Zu();
  async function t(o, s) {
    const { account: i = o.account, domain: a, message: c, primaryType: u } = s;
    if (!i) throw new r.AccountNotFoundError({ docsPath: "/docs/actions/wallet/signTypedData" });
    const l = (0, e.parseAccount)(i),
      f = { EIP712Domain: (0, n.getTypesForEIP712Domain)({ domain: a }), ...s.types };
    if (((0, n.validateTypedData)({ domain: a, message: c, primaryType: u, types: f }), l.signTypedData))
      return l.signTypedData({ domain: a, message: c, primaryType: u, types: f });
    const m = (0, n.serializeTypedData)({ domain: a, message: c, primaryType: u, types: f });
    return o.request({ method: "eth_signTypedData_v4", params: [l.address, m] }, { retryCount: 0 });
  }
  return nu;
}
var ou = {},
  up;
function M2() {
  if (up) return ou;
  ((up = 1), Object.defineProperty(ou, "__esModule", { value: !0 }), (ou.switchChain = r));
  const e = te();
  async function r(n, { id: t }) {
    await n.request(
      { method: "wallet_switchEthereumChain", params: [{ chainId: (0, e.numberToHex)(t) }] },
      { retryCount: 0 },
    );
  }
  return ou;
}
var iu = {},
  dp;
function H2() {
  if (dp) return iu;
  ((dp = 1), Object.defineProperty(iu, "__esModule", { value: !0 }), (iu.watchAsset = e));
  async function e(r, n) {
    return await r.request({ method: "wallet_watchAsset", params: n }, { retryCount: 0 });
  }
  return iu;
}
var au = {},
  fp;
function k2() {
  if (fp) return au;
  ((fp = 1), Object.defineProperty(au, "__esModule", { value: !0 }), (au.writeContractSync = n));
  const e = P_(),
    r = Af();
  async function n(t, o) {
    return r.writeContract.internal(t, e.sendTransactionSync, "sendTransactionSync", o);
  }
  return au;
}
var lp;
function A_() {
  if (lp) return Uc;
  ((lp = 1), Object.defineProperty(Uc, "__esModule", { value: !0 }), (Uc.walletActions = R));
  const e = lf(),
    r = mr(),
    n = j2(),
    t = w2(),
    o = P2(),
    s = Tg(),
    i = A2(),
    a = T2(),
    c = w_(),
    u = Lo(),
    l = S2(),
    f = I2(),
    m = Tf(),
    g = R2(),
    h = Pf(),
    b = Jf(),
    v = Du(),
    _ = P_(),
    E = B2(),
    P = O2(),
    d = x2(),
    j = C2(),
    p = q2(),
    y = M2(),
    I = Sf(),
    w = H2(),
    A = Af(),
    B = k2();
  function R(S) {
    return {
      addChain: (x) => (0, n.addChain)(S, x),
      deployContract: (x) => (0, t.deployContract)(S, x),
      fillTransaction: (x) => (0, e.fillTransaction)(S, x),
      getAddresses: () => (0, o.getAddresses)(S),
      getCallsStatus: (x) => (0, s.getCallsStatus)(S, x),
      getCapabilities: (x) => (0, i.getCapabilities)(S, x),
      getChainId: () => (0, r.getChainId)(S),
      getPermissions: () => (0, a.getPermissions)(S),
      prepareAuthorization: (x) => (0, c.prepareAuthorization)(S, x),
      prepareTransactionRequest: (x) => (0, u.prepareTransactionRequest)(S, x),
      requestAddresses: () => (0, l.requestAddresses)(S),
      requestPermissions: (x) => (0, f.requestPermissions)(S, x),
      sendCalls: (x) => (0, m.sendCalls)(S, x),
      sendCallsSync: (x) => (0, g.sendCallsSync)(S, x),
      sendRawTransaction: (x) => (0, h.sendRawTransaction)(S, x),
      sendRawTransactionSync: (x) => (0, b.sendRawTransactionSync)(S, x),
      sendTransaction: (x) => (0, v.sendTransaction)(S, x),
      sendTransactionSync: (x) => (0, _.sendTransactionSync)(S, x),
      showCallsStatus: (x) => (0, E.showCallsStatus)(S, x),
      signAuthorization: (x) => (0, P.signAuthorization)(S, x),
      signMessage: (x) => (0, d.signMessage)(S, x),
      signTransaction: (x) => (0, j.signTransaction)(S, x),
      signTypedData: (x) => (0, p.signTypedData)(S, x),
      switchChain: (x) => (0, y.switchChain)(S, x),
      waitForCallsStatus: (x) => (0, I.waitForCallsStatus)(S, x),
      watchAsset: (x) => (0, w.watchAsset)(S, x),
      writeContract: (x) => (0, A.writeContract)(S, x),
      writeContractSync: (x) => (0, B.writeContractSync)(S, x),
    };
  }
  return Uc;
}
var bp;
function F2() {
  if (bp) return zc;
  ((bp = 1), Object.defineProperty(zc, "__esModule", { value: !0 }), (zc.createWalletClient = n));
  const e = Vu(),
    r = A_();
  function n(t) {
    const { key: o = "wallet", name: s = "Wallet Client", transport: i } = t;
    return (0, e.createClient)({ ...t, key: o, name: s, transport: i, type: "walletClient" }).extend(r.walletActions);
  }
  return zc;
}
var su = {},
  mp;
function ti() {
  if (mp) return su;
  ((mp = 1), Object.defineProperty(su, "__esModule", { value: !0 }), (su.createTransport = n));
  const e = Fg(),
    r = Sg();
  function n(
    { key: t, methods: o, name: s, request: i, retryCount: a = 3, retryDelay: c = 150, timeout: u, type: l },
    f,
  ) {
    const m = (0, r.uid)();
    return {
      config: { key: t, methods: o, name: s, request: i, retryCount: a, retryDelay: c, timeout: u, type: l },
      request: (0, e.buildRequest)(i, { methods: o, retryCount: a, retryDelay: c, uid: m }),
      value: f,
    };
  }
  return su;
}
var cu = {},
  hp;
function N2() {
  if (hp) return cu;
  ((hp = 1), Object.defineProperty(cu, "__esModule", { value: !0 }), (cu.custom = r));
  const e = ti();
  function r(n, t = {}) {
    const { key: o = "custom", methods: s, name: i = "Custom Provider", retryDelay: a } = t;
    return ({ retryCount: c }) =>
      (0, e.createTransport)({
        key: o,
        methods: s,
        name: i,
        request: n.request.bind(n),
        retryCount: t.retryCount ?? c,
        retryDelay: a,
        type: "custom",
      });
  }
  return cu;
}
var hn = {},
  yp;
function $2() {
  if (yp) return hn;
  ((yp = 1),
    Object.defineProperty(hn, "__esModule", { value: !0 }),
    (hn.fallback = o),
    (hn.shouldThrow = s),
    (hn.rankTransports = i));
  const e = Zt(),
    r = dr(),
    n = wf(),
    t = ti();
  function o(a, c = {}) {
    const {
      key: u = "fallback",
      name: l = "Fallback",
      rank: f = !1,
      shouldThrow: m = s,
      retryCount: g,
      retryDelay: h,
    } = c;
    return ({ chain: b, pollingInterval: v = 4e3, timeout: _, ...E }) => {
      let P = a,
        d = () => {};
      const j = (0, t.createTransport)(
        {
          key: u,
          name: l,
          async request({ method: p, params: y }) {
            let I;
            const w = async (A = 0) => {
              const B = P[A]({ ...E, chain: b, retryCount: 0, timeout: _ });
              try {
                const R = await B.request({ method: p, params: y });
                return (d({ method: p, params: y, response: R, transport: B, status: "success" }), R);
              } catch (R) {
                if (
                  (d({ error: R, method: p, params: y, transport: B, status: "error" }),
                  m(R) ||
                    A === P.length - 1 ||
                    (I ??
                      (I = P.slice(A + 1).some((S) => {
                        const { include: x, exclude: F } = S({ chain: b }).config.methods || {};
                        return x ? x.includes(p) : F ? !F.includes(p) : !0;
                      })),
                    !I))
                )
                  throw R;
                return w(A + 1);
              }
            };
            return w();
          },
          retryCount: g,
          retryDelay: h,
          type: "fallback",
        },
        { onResponse: (p) => (d = p), transports: P.map((p) => p({ chain: b, retryCount: 0 })) },
      );
      if (f) {
        const p = typeof f == "object" ? f : {};
        i({
          chain: b,
          interval: p.interval ?? v,
          onTransports: (y) => (P = y),
          ping: p.ping,
          sampleCount: p.sampleCount,
          timeout: p.timeout,
          transports: P,
          weights: p.weights,
        });
      }
      return j;
    };
  }
  function s(a) {
    return !!(
      "code" in a &&
      typeof a.code == "number" &&
      (a.code === r.TransactionRejectedRpcError.code ||
        a.code === r.UserRejectedRequestError.code ||
        a.code === r.WalletConnectSessionSettlementError.code ||
        e.ExecutionRevertedError.nodeMessage.test(a.message) ||
        a.code === 5e3)
    );
  }
  function i({
    chain: a,
    interval: c = 4e3,
    onTransports: u,
    ping: l,
    sampleCount: f = 10,
    timeout: m = 1e3,
    transports: g,
    weights: h = {},
  }) {
    const { stability: b = 0.7, latency: v = 0.3 } = h,
      _ = [],
      E = async () => {
        const P = await Promise.all(
          g.map(async (p) => {
            const y = p({ chain: a, retryCount: 0, timeout: m }),
              I = Date.now();
            let w, A;
            try {
              (await (l ? l({ transport: y }) : y.request({ method: "net_listening" })), (A = 1));
            } catch {
              A = 0;
            } finally {
              w = Date.now();
            }
            return { latency: w - I, success: A };
          }),
        );
        (_.push(P), _.length > f && _.shift());
        const d = Math.max(..._.map((p) => Math.max(...p.map(({ latency: y }) => y)))),
          j = g
            .map((p, y) => {
              const I = _.map((S) => S[y].latency),
                A = 1 - I.reduce((S, x) => S + x, 0) / I.length / d,
                B = _.map((S) => S[y].success),
                R = B.reduce((S, x) => S + x, 0) / B.length;
              return R === 0 ? [0, y] : [v * A + b * R, y];
            })
            .sort((p, y) => y[0] - p[0]);
        (u(j.map(([, p]) => g[p])), await (0, n.wait)(c), E());
      };
    E();
  }
  return hn;
}
var uu = {},
  Bo = {},
  pp;
function Yf() {
  if (pp) return Bo;
  ((pp = 1), Object.defineProperty(Bo, "__esModule", { value: !0 }), (Bo.UrlRequiredError = void 0));
  const e = ue();
  class r extends e.BaseError {
    constructor() {
      super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
        docsPath: "/docs/clients/intro",
        name: "UrlRequiredError",
      });
    }
  }
  return ((Bo.UrlRequiredError = r), Bo);
}
var gp;
function z2() {
  if (gp) return uu;
  ((gp = 1), Object.defineProperty(uu, "__esModule", { value: !0 }), (uu.http = s));
  const e = Et(),
    r = Yf(),
    n = gf(),
    t = Ff(),
    o = ti();
  function s(i, a = {}) {
    const {
      batch: c,
      fetchFn: u,
      fetchOptions: l,
      key: f = "http",
      methods: m,
      name: g = "HTTP JSON-RPC",
      onFetchRequest: h,
      onFetchResponse: b,
      retryDelay: v,
      raw: _,
    } = a;
    return ({ chain: E, retryCount: P, timeout: d }) => {
      const { batchSize: j = 1e3, wait: p = 0 } = typeof c == "object" ? c : {},
        y = a.retryCount ?? P,
        I = d ?? a.timeout ?? 1e4,
        w = i || (E == null ? void 0 : E.rpcUrls.default.http[0]);
      if (!w) throw new r.UrlRequiredError();
      const A = (0, t.getHttpRpcClient)(w, { fetchFn: u, fetchOptions: l, onRequest: h, onResponse: b, timeout: I });
      return (0, o.createTransport)(
        {
          key: f,
          methods: m,
          name: g,
          async request({ method: B, params: R }) {
            const S = { method: B, params: R },
              { schedule: x } = (0, n.createBatchScheduler)({
                id: w,
                wait: p,
                shouldSplitBatch(k) {
                  return k.length > j;
                },
                fn: (k) => A.request({ body: k }),
                sort: (k, O) => k.id - O.id,
              }),
              F = async (k) => (c ? x(k) : [await A.request({ body: k })]),
              [{ error: H, result: T }] = await F(S);
            if (_) return { error: H, result: T };
            if (H) throw new e.RpcRequestError({ body: S, error: H, url: w });
            return T;
          },
          retryCount: y,
          retryDelay: v,
          timeout: I,
          type: "http",
        },
        { fetchOptions: l, url: w },
      );
    };
  }
  return uu;
}
var du = {},
  _p;
function U2() {
  if (_p) return du;
  ((_p = 1), Object.defineProperty(du, "__esModule", { value: !0 }), (du.webSocket = s));
  const e = Et(),
    r = Yf(),
    n = Jg(),
    t = Nf(),
    o = ti();
  function s(i, a = {}) {
    const {
      keepAlive: c,
      key: u = "webSocket",
      methods: l,
      name: f = "WebSocket JSON-RPC",
      reconnect: m,
      retryDelay: g,
    } = a;
    return ({ chain: h, retryCount: b, timeout: v }) => {
      var j;
      const _ = a.retryCount ?? b,
        E = v ?? a.timeout ?? 1e4,
        P = i || ((j = h == null ? void 0 : h.rpcUrls.default.webSocket) == null ? void 0 : j[0]),
        d = { keepAlive: c, reconnect: m };
      if (!P) throw new r.UrlRequiredError();
      return (0, o.createTransport)(
        {
          key: u,
          methods: l,
          name: f,
          async request({ method: p, params: y }) {
            const I = { method: p, params: y },
              w = await (0, t.getWebSocketRpcClient)(P, d),
              { error: A, result: B } = await w.requestAsync({ body: I, timeout: E });
            if (A) throw new e.RpcRequestError({ body: I, error: A, url: P });
            return B;
          },
          retryCount: _,
          retryDelay: g,
          timeout: E,
          type: "webSocket",
        },
        {
          getSocket() {
            return (0, n.getSocket)(P);
          },
          getRpcClient() {
            return (0, t.getWebSocketRpcClient)(P, d);
          },
          async subscribe({ params: p, onData: y, onError: I }) {
            const w = await (0, t.getWebSocketRpcClient)(P, d),
              { result: A } = await new Promise((B, R) =>
                w.request({
                  body: { method: "eth_subscribe", params: p },
                  onError(S) {
                    (R(S), I == null || I(S));
                  },
                  onResponse(S) {
                    if (S.error) {
                      (R(S.error), I == null || I(S.error));
                      return;
                    }
                    if (typeof S.id == "number") {
                      B(S);
                      return;
                    }
                    S.method === "eth_subscription" && y(S.params);
                  },
                }),
              );
            return {
              subscriptionId: A,
              async unsubscribe() {
                return new Promise((B) =>
                  w.request({ body: { method: "eth_unsubscribe", params: [A] }, onResponse: B }),
                );
              },
            };
          },
        },
      );
    };
  }
  return du;
}
var Oo = {},
  vp;
function L2() {
  if (vp) return Oo;
  ((vp = 1), Object.defineProperty(Oo, "__esModule", { value: !0 }), (Oo.ProviderRpcError = void 0));
  class e extends Error {
    constructor(n, t) {
      (super(t),
        Object.defineProperty(this, "code", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        Object.defineProperty(this, "details", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }),
        (this.code = n),
        (this.details = t));
    }
  }
  return ((Oo.ProviderRpcError = e), Oo);
}
var fu = {},
  Ep;
function D2() {
  if (Ep) return fu;
  ((Ep = 1), Object.defineProperty(fu, "__esModule", { value: !0 }), (fu.decodeDeployData = t));
  const e = Se(),
    r = cr(),
    n = "/docs/contract/decodeDeployData";
  function t(o) {
    const { abi: s, bytecode: i, data: a } = o;
    if (a === i) return { bytecode: i };
    const c = s.find((l) => "type" in l && l.type === "constructor");
    if (!c) throw new e.AbiConstructorNotFoundError({ docsPath: n });
    if (!("inputs" in c)) throw new e.AbiConstructorParamsNotFoundError({ docsPath: n });
    if (!c.inputs || c.inputs.length === 0) throw new e.AbiConstructorParamsNotFoundError({ docsPath: n });
    return { args: (0, r.decodeAbiParameters)(c.inputs, `0x${a.replace(i, "")}`), bytecode: i };
  }
  return fu;
}
var lu = {},
  jp;
function G2() {
  if (jp) return lu;
  ((jp = 1), Object.defineProperty(lu, "__esModule", { value: !0 }), (lu.fromBlobs = t));
  const e = qo(),
    r = ve(),
    n = te();
  function t(o) {
    const s = o.to ?? (typeof o.blobs[0] == "string" ? "hex" : "bytes"),
      i = typeof o.blobs[0] == "string" ? o.blobs.map((f) => (0, r.hexToBytes)(f)) : o.blobs,
      a = i.reduce((f, m) => f + m.length, 0),
      c = (0, e.createCursor)(new Uint8Array(a));
    let u = !0;
    for (const f of i) {
      const m = (0, e.createCursor)(f);
      for (; u && m.position < f.length; ) {
        m.incrementPosition(1);
        let g = 31;
        f.length - m.position < 31 && (g = f.length - m.position);
        for (const h in Array.from({ length: g })) {
          const b = m.readByte();
          if (b === 128 && !m.inspectBytes(m.remaining).includes(128)) {
            u = !1;
            break;
          }
          c.pushByte(b);
        }
      }
    }
    const l = c.bytes.slice(0, c.position);
    return s === "hex" ? (0, n.bytesToHex)(l) : l;
  }
  return lu;
}
var bu = {},
  wp;
function V2() {
  if (wp) return bu;
  ((wp = 1), Object.defineProperty(bu, "__esModule", { value: !0 }), (bu.sidecarsToVersionedHashes = r));
  const e = df();
  function r(n) {
    const { sidecars: t, version: o } = n,
      s = n.to ?? (typeof t[0].blob == "string" ? "hex" : "bytes"),
      i = [];
    for (const { commitment: a } of t) i.push((0, e.commitmentToVersionedHash)({ commitment: a, to: s, version: o }));
    return i;
  }
  return bu;
}
var mu = {},
  Pp;
function W2() {
  if (Pp) return mu;
  ((Pp = 1), Object.defineProperty(mu, "__esModule", { value: !0 }), (mu.toCoinType = n));
  const e = Of(),
    r = 2147483648;
  function n(t) {
    if (t === 1) return 60n;
    if (t >= r || t < 0) throw new e.EnsInvalidChainIdError({ chainId: t });
    return BigInt((2147483648 | t) >>> 0);
  }
  return mu;
}
var hu = {},
  Ap;
function T_() {
  if (Ap) return hu;
  ((Ap = 1), Object.defineProperty(hu, "__esModule", { value: !0 }), (hu.defineKzg = e));
  function e({ blobToKzgCommitment: r, computeBlobKzgProof: n }) {
    return { blobToKzgCommitment: r, computeBlobKzgProof: n };
  }
  return hu;
}
var yu = {},
  Tp;
function K2() {
  if (Tp) return yu;
  ((Tp = 1), Object.defineProperty(yu, "__esModule", { value: !0 }), (yu.setupKzg = r));
  const e = T_();
  function r(n, t) {
    try {
      n.loadTrustedSetup(t);
    } catch (o) {
      const s = o;
      if (!s.message.includes("trusted setup is already loaded")) throw s;
    }
    return (0, e.defineKzg)(n);
  }
  return yu;
}
var pu = {},
  Sp;
function Z2() {
  if (Sp) return pu;
  ((Sp = 1), Object.defineProperty(pu, "__esModule", { value: !0 }), (pu.compactSignatureToSignature = n));
  const e = ve(),
    r = te();
  function n({ r: t, yParityAndS: o }) {
    const s = (0, e.hexToBytes)(o),
      i = s[0] & 128 ? 1 : 0,
      a = s;
    return (i === 1 && (a[0] &= 127), { r: t, s: (0, r.bytesToHex)(a), yParity: i });
  }
  return pu;
}
var gu = {},
  Ip;
function J2() {
  if (Ip) return gu;
  ((Ip = 1), Object.defineProperty(gu, "__esModule", { value: !0 }), (gu.parseCompactSignature = n));
  const e = Dr(),
    r = te();
  function n(t) {
    const { r: o, s } = e.secp256k1.Signature.fromCompact(t.slice(2, 130));
    return { r: (0, r.numberToHex)(o, { size: 32 }), yParityAndS: (0, r.numberToHex)(s, { size: 32 }) };
  }
  return gu;
}
var _u = {},
  Rp;
function Y2() {
  if (Rp) return _u;
  ((Rp = 1), Object.defineProperty(_u, "__esModule", { value: !0 }), (_u.parseSignature = n));
  const e = Dr(),
    r = te();
  function n(t) {
    const { r: o, s } = e.secp256k1.Signature.fromCompact(t.slice(2, 130)),
      i = +`0x${t.slice(130)}`,
      [a, c] = (() => {
        if (i === 0 || i === 1) return [void 0, i];
        if (i === 27) return [BigInt(i), 0];
        if (i === 28) return [BigInt(i), 1];
        throw new Error("Invalid yParityOrV value");
      })();
    return typeof a < "u"
      ? { r: (0, r.numberToHex)(o, { size: 32 }), s: (0, r.numberToHex)(s, { size: 32 }), v: a, yParity: c }
      : { r: (0, r.numberToHex)(o, { size: 32 }), s: (0, r.numberToHex)(s, { size: 32 }), yParity: c };
  }
  return _u;
}
var vu = {},
  Bp;
function X2() {
  if (Bp) return vu;
  ((Bp = 1), Object.defineProperty(vu, "__esModule", { value: !0 }), (vu.recoverTransactionAddress = o));
  const e = Xe(),
    r = Kf(),
    n = Ku(),
    t = lr();
  async function o(s) {
    const { serializedTransaction: i, signature: a } = s,
      c = (0, r.parseTransaction)(i),
      u = a ?? { r: c.r, s: c.s, v: c.v, yParity: c.yParity },
      l = (0, n.serializeTransaction)({ ...c, r: void 0, s: void 0, v: void 0, yParity: void 0, sidecars: void 0 });
    return await (0, t.recoverAddress)({ hash: (0, e.keccak256)(l), signature: u });
  }
  return vu;
}
var Eu = {},
  Op;
function Q2() {
  if (Op) return Eu;
  ((Op = 1), Object.defineProperty(Eu, "__esModule", { value: !0 }), (Eu.serializeCompactSignature = n));
  const e = Dr(),
    r = Be();
  function n({ r: t, yParityAndS: o }) {
    return `0x${new e.secp256k1.Signature((0, r.hexToBigInt)(t), (0, r.hexToBigInt)(o)).toCompactHex()}`;
  }
  return Eu;
}
var ju = {},
  xp;
function e5() {
  if (xp) return ju;
  ((xp = 1), Object.defineProperty(ju, "__esModule", { value: !0 }), (ju.signatureToCompactSignature = n));
  const e = ve(),
    r = te();
  function n(t) {
    const { r: o, s, v: i, yParity: a } = t,
      c = Number(a ?? i - 27n);
    let u = s;
    if (c === 1) {
      const l = (0, e.hexToBytes)(s);
      ((l[0] |= 128), (u = (0, r.bytesToHex)(l)));
    }
    return { r: o, yParityAndS: u };
  }
  return ju;
}
var Cp;
function t5() {
  return (
    Cp ||
      ((Cp = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.maxInt8 =
            e.universalSignatureValidatorByteCode =
            e.erc6492SignatureValidatorByteCode =
            e.deploylessCallViaFactoryBytecode =
            e.deploylessCallViaBytecodeBytecode =
            e.zeroHash =
            e.zeroAddress =
            e.ethAddress =
            e.multicall3Abi =
            e.universalSignatureValidatorAbi =
            e.erc6492SignatureValidatorAbi =
            e.erc4626Abi =
            e.erc1155Abi =
            e.erc721Abi =
            e.erc20Abi_bytes32 =
            e.erc20Abi =
            e.webSocket =
            e.http =
            e.shouldThrow =
            e.fallback =
            e.custom =
            e.createTransport =
            e.walletActions =
            e.testActions =
            e.publicActions =
            e.createWalletClient =
            e.createTestClient =
            e.createPublicClient =
            e.rpcSchema =
            e.createClient =
            e.WaitForCallsStatusTimeoutError =
            e.getContract =
            e.UnknownTypeError =
            e.UnknownSignatureError =
            e.SolidityProtectedKeywordError =
            e.parseAbiParameters =
            e.parseAbiParameter =
            e.parseAbiItem =
            e.parseAbi =
            e.InvalidStructSignatureError =
            e.InvalidSignatureError =
            e.InvalidParenthesisError =
            e.InvalidParameterError =
            e.InvalidModifierError =
            e.InvalidFunctionModifierError =
            e.InvalidAbiTypeParameterError =
            e.InvalidAbiParametersError =
            e.InvalidAbiParameterError =
            e.InvalidAbiItemError =
            e.CircularReferenceError =
              void 0),
          (e.maxUint152 =
            e.maxUint144 =
            e.maxUint136 =
            e.maxUint128 =
            e.maxUint120 =
            e.maxUint112 =
            e.maxUint104 =
            e.maxUint96 =
            e.maxUint88 =
            e.maxUint80 =
            e.maxUint72 =
            e.maxUint64 =
            e.maxUint56 =
            e.maxUint48 =
            e.maxUint40 =
            e.maxUint32 =
            e.maxUint24 =
            e.maxUint16 =
            e.maxUint8 =
            e.maxInt256 =
            e.maxInt248 =
            e.maxInt240 =
            e.maxInt232 =
            e.maxInt224 =
            e.maxInt216 =
            e.maxInt208 =
            e.maxInt200 =
            e.maxInt192 =
            e.maxInt184 =
            e.maxInt176 =
            e.maxInt168 =
            e.maxInt160 =
            e.maxInt152 =
            e.maxInt144 =
            e.maxInt136 =
            e.maxInt128 =
            e.maxInt120 =
            e.maxInt112 =
            e.maxInt104 =
            e.maxInt96 =
            e.maxInt88 =
            e.maxInt80 =
            e.maxInt72 =
            e.maxInt64 =
            e.maxInt56 =
            e.maxInt48 =
            e.maxInt40 =
            e.maxInt32 =
            e.maxInt24 =
            e.maxInt16 =
              void 0),
          (e.AbiConstructorNotFoundError =
            e.weiUnits =
            e.gweiUnits =
            e.etherUnits =
            e.presignMessagePrefix =
            e.minInt256 =
            e.minInt248 =
            e.minInt240 =
            e.minInt232 =
            e.minInt224 =
            e.minInt216 =
            e.minInt208 =
            e.minInt200 =
            e.minInt192 =
            e.minInt184 =
            e.minInt176 =
            e.minInt168 =
            e.minInt160 =
            e.minInt152 =
            e.minInt144 =
            e.minInt136 =
            e.minInt128 =
            e.minInt120 =
            e.minInt112 =
            e.minInt104 =
            e.minInt96 =
            e.minInt88 =
            e.minInt80 =
            e.minInt72 =
            e.minInt64 =
            e.minInt56 =
            e.minInt48 =
            e.minInt40 =
            e.minInt32 =
            e.minInt24 =
            e.minInt16 =
            e.minInt8 =
            e.maxUint256 =
            e.maxUint248 =
            e.maxUint240 =
            e.maxUint232 =
            e.maxUint224 =
            e.maxUint216 =
            e.maxUint208 =
            e.maxUint200 =
            e.maxUint192 =
            e.maxUint184 =
            e.maxUint176 =
            e.maxUint168 =
            e.maxUint160 =
              void 0),
          (e.EnsAvatarUriResolutionError =
            e.EnsAvatarUnsupportedNamespaceError =
            e.EnsAvatarInvalidNftUriError =
            e.SizeOverflowError =
            e.InvalidHexValueError =
            e.InvalidHexBooleanError =
            e.InvalidBytesBooleanError =
            e.IntegerOutOfRangeError =
            e.SliceOffsetOutOfBoundsError =
            e.SizeExceedsPaddingSizeError =
            e.RawContractError =
            e.CounterfactualDeploymentFailedError =
            e.ContractFunctionZeroDataError =
            e.ContractFunctionRevertedError =
            e.ContractFunctionExecutionError =
            e.CallExecutionError =
            e.InvalidChainIdError =
            e.ClientChainNotConfiguredError =
            e.ChainNotFoundError =
            e.ChainMismatchError =
            e.ChainDoesNotSupportContract =
            e.BundleFailedError =
            e.BlockNotFoundError =
            e.setErrorConfig =
            e.BaseError =
            e.InvalidAddressError =
            e.UnsupportedPackedAbiType =
            e.InvalidDefinitionTypeError =
            e.InvalidArrayError =
            e.InvalidAbiEncodingTypeError =
            e.InvalidAbiDecodingTypeError =
            e.DecodeLogTopicsMismatch =
            e.DecodeLogDataMismatch =
            e.BytesSizeMismatchError =
            e.AbiFunctionSignatureNotFoundError =
            e.AbiFunctionOutputsNotFoundError =
            e.AbiFunctionNotFoundError =
            e.AbiEventSignatureNotFoundError =
            e.AbiEventSignatureEmptyTopicsError =
            e.AbiEventNotFoundError =
            e.AbiErrorSignatureNotFoundError =
            e.AbiErrorNotFoundError =
            e.AbiErrorInputsNotFoundError =
            e.AbiEncodingLengthMismatchError =
            e.AbiEncodingBytesSizeMismatchError =
            e.AbiEncodingArrayLengthMismatchError =
            e.AbiDecodingZeroDataError =
            e.AbiDecodingDataSizeTooSmallError =
            e.AbiDecodingDataSizeInvalidError =
            e.AbiConstructorParamsNotFoundError =
              void 0),
          (e.UnsupportedProviderMethodError =
            e.UnsupportedNonOptionalCapabilityError =
            e.UnsupportedChainIdError =
            e.UnknownRpcError =
            e.UnknownBundleIdError =
            e.UnauthorizedProviderError =
            e.TransactionRejectedRpcError =
            e.SwitchChainError =
            e.RpcError =
            e.ResourceUnavailableRpcError =
            e.ResourceNotFoundRpcError =
            e.ProviderRpcError =
            e.ProviderDisconnectedError =
            e.ParseRpcError =
            e.MethodNotSupportedRpcError =
            e.MethodNotFoundRpcError =
            e.LimitExceededRpcError =
            e.JsonRpcVersionUnsupportedError =
            e.InvalidRequestRpcError =
            e.InvalidParamsRpcError =
            e.InvalidInputRpcError =
            e.InternalRpcError =
            e.DuplicateIdError =
            e.ChainDisconnectedError =
            e.BundleTooLargeError =
            e.AtomicReadyWalletRejectedUpgradeError =
            e.AtomicityNotSupportedError =
            e.WebSocketRequestError =
            e.TimeoutError =
            e.SocketClosedError =
            e.RpcRequestError =
            e.HttpRequestError =
            e.UnknownNodeError =
            e.TransactionTypeNotSupportedError =
            e.TipAboveFeeCapError =
            e.NonceTooLowError =
            e.NonceTooHighError =
            e.NonceMaxValueError =
            e.IntrinsicGasTooLowError =
            e.IntrinsicGasTooHighError =
            e.InsufficientFundsError =
            e.FeeCapTooLowError =
            e.FeeCapTooHighError =
            e.ExecutionRevertedError =
            e.FilterTypeNotSupportedError =
            e.MaxFeePerGasTooLowError =
            e.Eip1559FeesNotSupportedError =
            e.BaseFeeScalarError =
            e.EstimateGasExecutionError =
            e.EnsInvalidChainIdError =
              void 0),
          (e.toBlobs =
            e.toBlobSidecars =
            e.sidecarsToVersionedHashes =
            e.fromBlobs =
            e.commitmentToVersionedHash =
            e.commitmentsToVersionedHashes =
            e.blobsToProofs =
            e.blobsToCommitments =
            e.isAddressEqual =
            e.isAddress =
            e.getCreateAddress =
            e.getCreate2Address =
            e.getContractAddress =
            e.getAddress =
            e.checksumAddress =
            e.prepareEncodeFunctionData =
            e.parseEventLogs =
            e.getAbiItem =
            e.encodePacked =
            e.encodeFunctionResult =
            e.encodeFunctionData =
            e.encodeEventTopics =
            e.encodeErrorResult =
            e.encodeDeployData =
            e.encodeAbiParameters =
            e.decodeFunctionResult =
            e.decodeFunctionData =
            e.decodeEventLog =
            e.decodeErrorResult =
            e.decodeDeployData =
            e.decodeAbiParameters =
            e.EIP1193ProviderRpcError =
            e.InvalidDecimalNumberError =
            e.InvalidStructTypeError =
            e.InvalidPrimaryTypeError =
            e.InvalidDomainError =
            e.UrlRequiredError =
            e.WaitForTransactionReceiptTimeoutError =
            e.TransactionReceiptNotFoundError =
            e.TransactionNotFoundError =
            e.TransactionExecutionError =
            e.InvalidStorageKeySizeError =
            e.InvalidSerializedTransactionTypeError =
            e.InvalidSerializedTransactionError =
            e.InvalidSerializableTransactionError =
            e.InvalidLegacyVError =
            e.FeeConflictError =
            e.StateAssignmentConflictError =
            e.AccountStateConflictError =
            e.UserRejectedRequestError =
              void 0),
          (e.toCoinType =
            e.namehash =
            e.labelhash =
            e.toRlp =
            e.hexToRlp =
            e.bytesToRlp =
            e.toHex =
            e.stringToHex =
            e.numberToHex =
            e.bytesToHex =
            e.boolToHex =
            e.toBytes =
            e.stringToBytes =
            e.numberToBytes =
            e.hexToBytes =
            e.boolToBytes =
            e.fromRlp =
            e.hexToString =
            e.hexToNumber =
            e.hexToBool =
            e.hexToBigInt =
            e.fromHex =
            e.fromBytes =
            e.bytesToString =
            e.bytesToNumber =
            e.bytesToBool =
            e.bytesToBigInt =
            e.trim =
            e.sliceHex =
            e.sliceBytes =
            e.slice =
            e.size =
            e.padHex =
            e.padBytes =
            e.pad =
            e.isHex =
            e.isBytes =
            e.concatHex =
            e.concatBytes =
            e.concat =
            e.getChainContractAddress =
            e.extractChain =
            e.extendSchema =
            e.defineChain =
            e.assertCurrentChain =
            e.offchainLookupSignature =
            e.offchainLookupAbiItem =
            e.offchainLookup =
            e.ccipFetch =
            e.ccipRequest =
              void 0),
          (e.recoverTransactionAddress =
            e.recoverPublicKey =
            e.recoverMessageAddress =
            e.recoverAddress =
            e.parseSignature =
            e.hexToSignature =
            e.parseErc8010Signature =
            e.parseErc6492Signature =
            e.parseCompactSignature =
            e.hexToCompactSignature =
            e.isErc8010Signature =
            e.isErc6492Signature =
            e.hashTypedData =
            e.hashStruct =
            e.hashDomain =
            e.hashMessage =
            e.compactSignatureToSignature =
            e.withTimeout =
            e.withRetry =
            e.withCache =
            e.nonceManager =
            e.createNonceManager =
            e.setupKzg =
            e.defineKzg =
            e.getFunctionSignature =
            e.toFunctionSignature =
            e.getFunctionSelector =
            e.toFunctionSelector =
            e.toFunctionHash =
            e.getEventSignature =
            e.toEventSignature =
            e.getEventSelector =
            e.toEventSelector =
            e.toEventHash =
            e.sha256 =
            e.ripemd160 =
            e.keccak256 =
            e.isHash =
            e.rpcTransactionType =
            e.formatTransactionRequest =
            e.defineTransactionRequest =
            e.formatTransactionReceipt =
            e.defineTransactionReceipt =
            e.transactionType =
            e.formatTransaction =
            e.defineTransaction =
            e.formatLog =
            e.formatBlock =
            e.defineBlock =
            e.getContractError =
              void 0),
          (e.parseUnits =
            e.parseGwei =
            e.parseEther =
            e.formatUnits =
            e.formatGwei =
            e.formatEther =
            e.validateTypedData =
            e.serializeTypedData =
            e.getTypesForEIP712Domain =
            e.domainSeparator =
            e.serializeTransaction =
            e.serializeAccessList =
            e.parseTransaction =
            e.getTransactionType =
            e.getSerializedTransactionType =
            e.assertTransactionLegacy =
            e.assertTransactionEIP2930 =
            e.assertTransactionEIP1559 =
            e.assertRequest =
            e.stringify =
            e.verifyTypedData =
            e.verifyMessage =
            e.verifyHash =
            e.toPrefixedMessage =
            e.signatureToCompactSignature =
            e.serializeSignature =
            e.signatureToHex =
            e.serializeErc8010Signature =
            e.serializeErc6492Signature =
            e.serializeCompactSignature =
            e.compactSignatureToHex =
            e.recoverTypedDataAddress =
              void 0));
        var r = ir();
        (Object.defineProperty(e, "CircularReferenceError", {
          enumerable: !0,
          get: function () {
            return r.CircularReferenceError;
          },
        }),
          Object.defineProperty(e, "InvalidAbiItemError", {
            enumerable: !0,
            get: function () {
              return r.InvalidAbiItemError;
            },
          }),
          Object.defineProperty(e, "InvalidAbiParameterError", {
            enumerable: !0,
            get: function () {
              return r.InvalidAbiParameterError;
            },
          }),
          Object.defineProperty(e, "InvalidAbiParametersError", {
            enumerable: !0,
            get: function () {
              return r.InvalidAbiParametersError;
            },
          }),
          Object.defineProperty(e, "InvalidAbiTypeParameterError", {
            enumerable: !0,
            get: function () {
              return r.InvalidAbiTypeParameterError;
            },
          }),
          Object.defineProperty(e, "InvalidFunctionModifierError", {
            enumerable: !0,
            get: function () {
              return r.InvalidFunctionModifierError;
            },
          }),
          Object.defineProperty(e, "InvalidModifierError", {
            enumerable: !0,
            get: function () {
              return r.InvalidModifierError;
            },
          }),
          Object.defineProperty(e, "InvalidParameterError", {
            enumerable: !0,
            get: function () {
              return r.InvalidParameterError;
            },
          }),
          Object.defineProperty(e, "InvalidParenthesisError", {
            enumerable: !0,
            get: function () {
              return r.InvalidParenthesisError;
            },
          }),
          Object.defineProperty(e, "InvalidSignatureError", {
            enumerable: !0,
            get: function () {
              return r.InvalidSignatureError;
            },
          }),
          Object.defineProperty(e, "InvalidStructSignatureError", {
            enumerable: !0,
            get: function () {
              return r.InvalidStructSignatureError;
            },
          }),
          Object.defineProperty(e, "parseAbi", {
            enumerable: !0,
            get: function () {
              return r.parseAbi;
            },
          }),
          Object.defineProperty(e, "parseAbiItem", {
            enumerable: !0,
            get: function () {
              return r.parseAbiItem;
            },
          }),
          Object.defineProperty(e, "parseAbiParameter", {
            enumerable: !0,
            get: function () {
              return r.parseAbiParameter;
            },
          }),
          Object.defineProperty(e, "parseAbiParameters", {
            enumerable: !0,
            get: function () {
              return r.parseAbiParameters;
            },
          }),
          Object.defineProperty(e, "SolidityProtectedKeywordError", {
            enumerable: !0,
            get: function () {
              return r.SolidityProtectedKeywordError;
            },
          }),
          Object.defineProperty(e, "UnknownSignatureError", {
            enumerable: !0,
            get: function () {
              return r.UnknownSignatureError;
            },
          }),
          Object.defineProperty(e, "UnknownTypeError", {
            enumerable: !0,
            get: function () {
              return r.UnknownTypeError;
            },
          }));
        var n = Jv();
        Object.defineProperty(e, "getContract", {
          enumerable: !0,
          get: function () {
            return n.getContract;
          },
        });
        var t = Sf();
        Object.defineProperty(e, "WaitForCallsStatusTimeoutError", {
          enumerable: !0,
          get: function () {
            return t.WaitForCallsStatusTimeoutError;
          },
        });
        var o = Vu();
        (Object.defineProperty(e, "createClient", {
          enumerable: !0,
          get: function () {
            return o.createClient;
          },
        }),
          Object.defineProperty(e, "rpcSchema", {
            enumerable: !0,
            get: function () {
              return o.rpcSchema;
            },
          }));
        var s = D6();
        Object.defineProperty(e, "createPublicClient", {
          enumerable: !0,
          get: function () {
            return s.createPublicClient;
          },
        });
        var i = E2();
        Object.defineProperty(e, "createTestClient", {
          enumerable: !0,
          get: function () {
            return i.createTestClient;
          },
        });
        var a = F2();
        Object.defineProperty(e, "createWalletClient", {
          enumerable: !0,
          get: function () {
            return a.createWalletClient;
          },
        });
        var c = E_();
        Object.defineProperty(e, "publicActions", {
          enumerable: !0,
          get: function () {
            return c.publicActions;
          },
        });
        var u = j_();
        Object.defineProperty(e, "testActions", {
          enumerable: !0,
          get: function () {
            return u.testActions;
          },
        });
        var l = A_();
        Object.defineProperty(e, "walletActions", {
          enumerable: !0,
          get: function () {
            return l.walletActions;
          },
        });
        var f = ti();
        Object.defineProperty(e, "createTransport", {
          enumerable: !0,
          get: function () {
            return f.createTransport;
          },
        });
        var m = N2();
        Object.defineProperty(e, "custom", {
          enumerable: !0,
          get: function () {
            return m.custom;
          },
        });
        var g = $2();
        (Object.defineProperty(e, "fallback", {
          enumerable: !0,
          get: function () {
            return g.fallback;
          },
        }),
          Object.defineProperty(e, "shouldThrow", {
            enumerable: !0,
            get: function () {
              return g.shouldThrow;
            },
          }));
        var h = z2();
        Object.defineProperty(e, "http", {
          enumerable: !0,
          get: function () {
            return h.http;
          },
        });
        var b = U2();
        Object.defineProperty(e, "webSocket", {
          enumerable: !0,
          get: function () {
            return b.webSocket;
          },
        });
        var v = Jt();
        (Object.defineProperty(e, "erc20Abi", {
          enumerable: !0,
          get: function () {
            return v.erc20Abi;
          },
        }),
          Object.defineProperty(e, "erc20Abi_bytes32", {
            enumerable: !0,
            get: function () {
              return v.erc20Abi_bytes32;
            },
          }),
          Object.defineProperty(e, "erc721Abi", {
            enumerable: !0,
            get: function () {
              return v.erc721Abi;
            },
          }),
          Object.defineProperty(e, "erc1155Abi", {
            enumerable: !0,
            get: function () {
              return v.erc1155Abi;
            },
          }),
          Object.defineProperty(e, "erc4626Abi", {
            enumerable: !0,
            get: function () {
              return v.erc4626Abi;
            },
          }),
          Object.defineProperty(e, "erc6492SignatureValidatorAbi", {
            enumerable: !0,
            get: function () {
              return v.erc6492SignatureValidatorAbi;
            },
          }),
          Object.defineProperty(e, "universalSignatureValidatorAbi", {
            enumerable: !0,
            get: function () {
              return v.erc6492SignatureValidatorAbi;
            },
          }),
          Object.defineProperty(e, "multicall3Abi", {
            enumerable: !0,
            get: function () {
              return v.multicall3Abi;
            },
          }));
        var _ = p_();
        (Object.defineProperty(e, "ethAddress", {
          enumerable: !0,
          get: function () {
            return _.ethAddress;
          },
        }),
          Object.defineProperty(e, "zeroAddress", {
            enumerable: !0,
            get: function () {
              return _.zeroAddress;
            },
          }));
        var E = $f();
        Object.defineProperty(e, "zeroHash", {
          enumerable: !0,
          get: function () {
            return E.zeroHash;
          },
        });
        var P = Vo();
        (Object.defineProperty(e, "deploylessCallViaBytecodeBytecode", {
          enumerable: !0,
          get: function () {
            return P.deploylessCallViaBytecodeBytecode;
          },
        }),
          Object.defineProperty(e, "deploylessCallViaFactoryBytecode", {
            enumerable: !0,
            get: function () {
              return P.deploylessCallViaFactoryBytecode;
            },
          }),
          Object.defineProperty(e, "erc6492SignatureValidatorByteCode", {
            enumerable: !0,
            get: function () {
              return P.erc6492SignatureValidatorByteCode;
            },
          }),
          Object.defineProperty(e, "universalSignatureValidatorByteCode", {
            enumerable: !0,
            get: function () {
              return P.erc6492SignatureValidatorByteCode;
            },
          }));
        var d = af();
        (Object.defineProperty(e, "maxInt8", {
          enumerable: !0,
          get: function () {
            return d.maxInt8;
          },
        }),
          Object.defineProperty(e, "maxInt16", {
            enumerable: !0,
            get: function () {
              return d.maxInt16;
            },
          }),
          Object.defineProperty(e, "maxInt24", {
            enumerable: !0,
            get: function () {
              return d.maxInt24;
            },
          }),
          Object.defineProperty(e, "maxInt32", {
            enumerable: !0,
            get: function () {
              return d.maxInt32;
            },
          }),
          Object.defineProperty(e, "maxInt40", {
            enumerable: !0,
            get: function () {
              return d.maxInt40;
            },
          }),
          Object.defineProperty(e, "maxInt48", {
            enumerable: !0,
            get: function () {
              return d.maxInt48;
            },
          }),
          Object.defineProperty(e, "maxInt56", {
            enumerable: !0,
            get: function () {
              return d.maxInt56;
            },
          }),
          Object.defineProperty(e, "maxInt64", {
            enumerable: !0,
            get: function () {
              return d.maxInt64;
            },
          }),
          Object.defineProperty(e, "maxInt72", {
            enumerable: !0,
            get: function () {
              return d.maxInt72;
            },
          }),
          Object.defineProperty(e, "maxInt80", {
            enumerable: !0,
            get: function () {
              return d.maxInt80;
            },
          }),
          Object.defineProperty(e, "maxInt88", {
            enumerable: !0,
            get: function () {
              return d.maxInt88;
            },
          }),
          Object.defineProperty(e, "maxInt96", {
            enumerable: !0,
            get: function () {
              return d.maxInt96;
            },
          }),
          Object.defineProperty(e, "maxInt104", {
            enumerable: !0,
            get: function () {
              return d.maxInt104;
            },
          }),
          Object.defineProperty(e, "maxInt112", {
            enumerable: !0,
            get: function () {
              return d.maxInt112;
            },
          }),
          Object.defineProperty(e, "maxInt120", {
            enumerable: !0,
            get: function () {
              return d.maxInt120;
            },
          }),
          Object.defineProperty(e, "maxInt128", {
            enumerable: !0,
            get: function () {
              return d.maxInt128;
            },
          }),
          Object.defineProperty(e, "maxInt136", {
            enumerable: !0,
            get: function () {
              return d.maxInt136;
            },
          }),
          Object.defineProperty(e, "maxInt144", {
            enumerable: !0,
            get: function () {
              return d.maxInt144;
            },
          }),
          Object.defineProperty(e, "maxInt152", {
            enumerable: !0,
            get: function () {
              return d.maxInt152;
            },
          }),
          Object.defineProperty(e, "maxInt160", {
            enumerable: !0,
            get: function () {
              return d.maxInt160;
            },
          }),
          Object.defineProperty(e, "maxInt168", {
            enumerable: !0,
            get: function () {
              return d.maxInt168;
            },
          }),
          Object.defineProperty(e, "maxInt176", {
            enumerable: !0,
            get: function () {
              return d.maxInt176;
            },
          }),
          Object.defineProperty(e, "maxInt184", {
            enumerable: !0,
            get: function () {
              return d.maxInt184;
            },
          }),
          Object.defineProperty(e, "maxInt192", {
            enumerable: !0,
            get: function () {
              return d.maxInt192;
            },
          }),
          Object.defineProperty(e, "maxInt200", {
            enumerable: !0,
            get: function () {
              return d.maxInt200;
            },
          }),
          Object.defineProperty(e, "maxInt208", {
            enumerable: !0,
            get: function () {
              return d.maxInt208;
            },
          }),
          Object.defineProperty(e, "maxInt216", {
            enumerable: !0,
            get: function () {
              return d.maxInt216;
            },
          }),
          Object.defineProperty(e, "maxInt224", {
            enumerable: !0,
            get: function () {
              return d.maxInt224;
            },
          }),
          Object.defineProperty(e, "maxInt232", {
            enumerable: !0,
            get: function () {
              return d.maxInt232;
            },
          }),
          Object.defineProperty(e, "maxInt240", {
            enumerable: !0,
            get: function () {
              return d.maxInt240;
            },
          }),
          Object.defineProperty(e, "maxInt248", {
            enumerable: !0,
            get: function () {
              return d.maxInt248;
            },
          }),
          Object.defineProperty(e, "maxInt256", {
            enumerable: !0,
            get: function () {
              return d.maxInt256;
            },
          }),
          Object.defineProperty(e, "maxUint8", {
            enumerable: !0,
            get: function () {
              return d.maxUint8;
            },
          }),
          Object.defineProperty(e, "maxUint16", {
            enumerable: !0,
            get: function () {
              return d.maxUint16;
            },
          }),
          Object.defineProperty(e, "maxUint24", {
            enumerable: !0,
            get: function () {
              return d.maxUint24;
            },
          }),
          Object.defineProperty(e, "maxUint32", {
            enumerable: !0,
            get: function () {
              return d.maxUint32;
            },
          }),
          Object.defineProperty(e, "maxUint40", {
            enumerable: !0,
            get: function () {
              return d.maxUint40;
            },
          }),
          Object.defineProperty(e, "maxUint48", {
            enumerable: !0,
            get: function () {
              return d.maxUint48;
            },
          }),
          Object.defineProperty(e, "maxUint56", {
            enumerable: !0,
            get: function () {
              return d.maxUint56;
            },
          }),
          Object.defineProperty(e, "maxUint64", {
            enumerable: !0,
            get: function () {
              return d.maxUint64;
            },
          }),
          Object.defineProperty(e, "maxUint72", {
            enumerable: !0,
            get: function () {
              return d.maxUint72;
            },
          }),
          Object.defineProperty(e, "maxUint80", {
            enumerable: !0,
            get: function () {
              return d.maxUint80;
            },
          }),
          Object.defineProperty(e, "maxUint88", {
            enumerable: !0,
            get: function () {
              return d.maxUint88;
            },
          }),
          Object.defineProperty(e, "maxUint96", {
            enumerable: !0,
            get: function () {
              return d.maxUint96;
            },
          }),
          Object.defineProperty(e, "maxUint104", {
            enumerable: !0,
            get: function () {
              return d.maxUint104;
            },
          }),
          Object.defineProperty(e, "maxUint112", {
            enumerable: !0,
            get: function () {
              return d.maxUint112;
            },
          }),
          Object.defineProperty(e, "maxUint120", {
            enumerable: !0,
            get: function () {
              return d.maxUint120;
            },
          }),
          Object.defineProperty(e, "maxUint128", {
            enumerable: !0,
            get: function () {
              return d.maxUint128;
            },
          }),
          Object.defineProperty(e, "maxUint136", {
            enumerable: !0,
            get: function () {
              return d.maxUint136;
            },
          }),
          Object.defineProperty(e, "maxUint144", {
            enumerable: !0,
            get: function () {
              return d.maxUint144;
            },
          }),
          Object.defineProperty(e, "maxUint152", {
            enumerable: !0,
            get: function () {
              return d.maxUint152;
            },
          }),
          Object.defineProperty(e, "maxUint160", {
            enumerable: !0,
            get: function () {
              return d.maxUint160;
            },
          }),
          Object.defineProperty(e, "maxUint168", {
            enumerable: !0,
            get: function () {
              return d.maxUint168;
            },
          }),
          Object.defineProperty(e, "maxUint176", {
            enumerable: !0,
            get: function () {
              return d.maxUint176;
            },
          }),
          Object.defineProperty(e, "maxUint184", {
            enumerable: !0,
            get: function () {
              return d.maxUint184;
            },
          }),
          Object.defineProperty(e, "maxUint192", {
            enumerable: !0,
            get: function () {
              return d.maxUint192;
            },
          }),
          Object.defineProperty(e, "maxUint200", {
            enumerable: !0,
            get: function () {
              return d.maxUint200;
            },
          }),
          Object.defineProperty(e, "maxUint208", {
            enumerable: !0,
            get: function () {
              return d.maxUint208;
            },
          }),
          Object.defineProperty(e, "maxUint216", {
            enumerable: !0,
            get: function () {
              return d.maxUint216;
            },
          }),
          Object.defineProperty(e, "maxUint224", {
            enumerable: !0,
            get: function () {
              return d.maxUint224;
            },
          }),
          Object.defineProperty(e, "maxUint232", {
            enumerable: !0,
            get: function () {
              return d.maxUint232;
            },
          }),
          Object.defineProperty(e, "maxUint240", {
            enumerable: !0,
            get: function () {
              return d.maxUint240;
            },
          }),
          Object.defineProperty(e, "maxUint248", {
            enumerable: !0,
            get: function () {
              return d.maxUint248;
            },
          }),
          Object.defineProperty(e, "maxUint256", {
            enumerable: !0,
            get: function () {
              return d.maxUint256;
            },
          }),
          Object.defineProperty(e, "minInt8", {
            enumerable: !0,
            get: function () {
              return d.minInt8;
            },
          }),
          Object.defineProperty(e, "minInt16", {
            enumerable: !0,
            get: function () {
              return d.minInt16;
            },
          }),
          Object.defineProperty(e, "minInt24", {
            enumerable: !0,
            get: function () {
              return d.minInt24;
            },
          }),
          Object.defineProperty(e, "minInt32", {
            enumerable: !0,
            get: function () {
              return d.minInt32;
            },
          }),
          Object.defineProperty(e, "minInt40", {
            enumerable: !0,
            get: function () {
              return d.minInt40;
            },
          }),
          Object.defineProperty(e, "minInt48", {
            enumerable: !0,
            get: function () {
              return d.minInt48;
            },
          }),
          Object.defineProperty(e, "minInt56", {
            enumerable: !0,
            get: function () {
              return d.minInt56;
            },
          }),
          Object.defineProperty(e, "minInt64", {
            enumerable: !0,
            get: function () {
              return d.minInt64;
            },
          }),
          Object.defineProperty(e, "minInt72", {
            enumerable: !0,
            get: function () {
              return d.minInt72;
            },
          }),
          Object.defineProperty(e, "minInt80", {
            enumerable: !0,
            get: function () {
              return d.minInt80;
            },
          }),
          Object.defineProperty(e, "minInt88", {
            enumerable: !0,
            get: function () {
              return d.minInt88;
            },
          }),
          Object.defineProperty(e, "minInt96", {
            enumerable: !0,
            get: function () {
              return d.minInt96;
            },
          }),
          Object.defineProperty(e, "minInt104", {
            enumerable: !0,
            get: function () {
              return d.minInt104;
            },
          }),
          Object.defineProperty(e, "minInt112", {
            enumerable: !0,
            get: function () {
              return d.minInt112;
            },
          }),
          Object.defineProperty(e, "minInt120", {
            enumerable: !0,
            get: function () {
              return d.minInt120;
            },
          }),
          Object.defineProperty(e, "minInt128", {
            enumerable: !0,
            get: function () {
              return d.minInt128;
            },
          }),
          Object.defineProperty(e, "minInt136", {
            enumerable: !0,
            get: function () {
              return d.minInt136;
            },
          }),
          Object.defineProperty(e, "minInt144", {
            enumerable: !0,
            get: function () {
              return d.minInt144;
            },
          }),
          Object.defineProperty(e, "minInt152", {
            enumerable: !0,
            get: function () {
              return d.minInt152;
            },
          }),
          Object.defineProperty(e, "minInt160", {
            enumerable: !0,
            get: function () {
              return d.minInt160;
            },
          }),
          Object.defineProperty(e, "minInt168", {
            enumerable: !0,
            get: function () {
              return d.minInt168;
            },
          }),
          Object.defineProperty(e, "minInt176", {
            enumerable: !0,
            get: function () {
              return d.minInt176;
            },
          }),
          Object.defineProperty(e, "minInt184", {
            enumerable: !0,
            get: function () {
              return d.minInt184;
            },
          }),
          Object.defineProperty(e, "minInt192", {
            enumerable: !0,
            get: function () {
              return d.minInt192;
            },
          }),
          Object.defineProperty(e, "minInt200", {
            enumerable: !0,
            get: function () {
              return d.minInt200;
            },
          }),
          Object.defineProperty(e, "minInt208", {
            enumerable: !0,
            get: function () {
              return d.minInt208;
            },
          }),
          Object.defineProperty(e, "minInt216", {
            enumerable: !0,
            get: function () {
              return d.minInt216;
            },
          }),
          Object.defineProperty(e, "minInt224", {
            enumerable: !0,
            get: function () {
              return d.minInt224;
            },
          }),
          Object.defineProperty(e, "minInt232", {
            enumerable: !0,
            get: function () {
              return d.minInt232;
            },
          }),
          Object.defineProperty(e, "minInt240", {
            enumerable: !0,
            get: function () {
              return d.minInt240;
            },
          }),
          Object.defineProperty(e, "minInt248", {
            enumerable: !0,
            get: function () {
              return d.minInt248;
            },
          }),
          Object.defineProperty(e, "minInt256", {
            enumerable: !0,
            get: function () {
              return d.minInt256;
            },
          }));
        var j = Yg();
        Object.defineProperty(e, "presignMessagePrefix", {
          enumerable: !0,
          get: function () {
            return j.presignMessagePrefix;
          },
        });
        var p = Mo();
        (Object.defineProperty(e, "etherUnits", {
          enumerable: !0,
          get: function () {
            return p.etherUnits;
          },
        }),
          Object.defineProperty(e, "gweiUnits", {
            enumerable: !0,
            get: function () {
              return p.gweiUnits;
            },
          }),
          Object.defineProperty(e, "weiUnits", {
            enumerable: !0,
            get: function () {
              return p.weiUnits;
            },
          }));
        var y = Se();
        (Object.defineProperty(e, "AbiConstructorNotFoundError", {
          enumerable: !0,
          get: function () {
            return y.AbiConstructorNotFoundError;
          },
        }),
          Object.defineProperty(e, "AbiConstructorParamsNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiConstructorParamsNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiDecodingDataSizeInvalidError", {
            enumerable: !0,
            get: function () {
              return y.AbiDecodingDataSizeInvalidError;
            },
          }),
          Object.defineProperty(e, "AbiDecodingDataSizeTooSmallError", {
            enumerable: !0,
            get: function () {
              return y.AbiDecodingDataSizeTooSmallError;
            },
          }),
          Object.defineProperty(e, "AbiDecodingZeroDataError", {
            enumerable: !0,
            get: function () {
              return y.AbiDecodingZeroDataError;
            },
          }),
          Object.defineProperty(e, "AbiEncodingArrayLengthMismatchError", {
            enumerable: !0,
            get: function () {
              return y.AbiEncodingArrayLengthMismatchError;
            },
          }),
          Object.defineProperty(e, "AbiEncodingBytesSizeMismatchError", {
            enumerable: !0,
            get: function () {
              return y.AbiEncodingBytesSizeMismatchError;
            },
          }),
          Object.defineProperty(e, "AbiEncodingLengthMismatchError", {
            enumerable: !0,
            get: function () {
              return y.AbiEncodingLengthMismatchError;
            },
          }),
          Object.defineProperty(e, "AbiErrorInputsNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiErrorInputsNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiErrorNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiErrorNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiErrorSignatureNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiErrorSignatureNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiEventNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiEventNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiEventSignatureEmptyTopicsError", {
            enumerable: !0,
            get: function () {
              return y.AbiEventSignatureEmptyTopicsError;
            },
          }),
          Object.defineProperty(e, "AbiEventSignatureNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiEventSignatureNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiFunctionNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiFunctionNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiFunctionOutputsNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiFunctionOutputsNotFoundError;
            },
          }),
          Object.defineProperty(e, "AbiFunctionSignatureNotFoundError", {
            enumerable: !0,
            get: function () {
              return y.AbiFunctionSignatureNotFoundError;
            },
          }),
          Object.defineProperty(e, "BytesSizeMismatchError", {
            enumerable: !0,
            get: function () {
              return y.BytesSizeMismatchError;
            },
          }),
          Object.defineProperty(e, "DecodeLogDataMismatch", {
            enumerable: !0,
            get: function () {
              return y.DecodeLogDataMismatch;
            },
          }),
          Object.defineProperty(e, "DecodeLogTopicsMismatch", {
            enumerable: !0,
            get: function () {
              return y.DecodeLogTopicsMismatch;
            },
          }),
          Object.defineProperty(e, "InvalidAbiDecodingTypeError", {
            enumerable: !0,
            get: function () {
              return y.InvalidAbiDecodingTypeError;
            },
          }),
          Object.defineProperty(e, "InvalidAbiEncodingTypeError", {
            enumerable: !0,
            get: function () {
              return y.InvalidAbiEncodingTypeError;
            },
          }),
          Object.defineProperty(e, "InvalidArrayError", {
            enumerable: !0,
            get: function () {
              return y.InvalidArrayError;
            },
          }),
          Object.defineProperty(e, "InvalidDefinitionTypeError", {
            enumerable: !0,
            get: function () {
              return y.InvalidDefinitionTypeError;
            },
          }),
          Object.defineProperty(e, "UnsupportedPackedAbiType", {
            enumerable: !0,
            get: function () {
              return y.UnsupportedPackedAbiType;
            },
          }));
        var I = _t();
        Object.defineProperty(e, "InvalidAddressError", {
          enumerable: !0,
          get: function () {
            return I.InvalidAddressError;
          },
        });
        var w = ue();
        (Object.defineProperty(e, "BaseError", {
          enumerable: !0,
          get: function () {
            return w.BaseError;
          },
        }),
          Object.defineProperty(e, "setErrorConfig", {
            enumerable: !0,
            get: function () {
              return w.setErrorConfig;
            },
          }));
        var A = sf();
        Object.defineProperty(e, "BlockNotFoundError", {
          enumerable: !0,
          get: function () {
            return A.BlockNotFoundError;
          },
        });
        var B = Ag();
        Object.defineProperty(e, "BundleFailedError", {
          enumerable: !0,
          get: function () {
            return B.BundleFailedError;
          },
        });
        var R = Wo();
        (Object.defineProperty(e, "ChainDoesNotSupportContract", {
          enumerable: !0,
          get: function () {
            return R.ChainDoesNotSupportContract;
          },
        }),
          Object.defineProperty(e, "ChainMismatchError", {
            enumerable: !0,
            get: function () {
              return R.ChainMismatchError;
            },
          }),
          Object.defineProperty(e, "ChainNotFoundError", {
            enumerable: !0,
            get: function () {
              return R.ChainNotFoundError;
            },
          }),
          Object.defineProperty(e, "ClientChainNotConfiguredError", {
            enumerable: !0,
            get: function () {
              return R.ClientChainNotConfiguredError;
            },
          }),
          Object.defineProperty(e, "InvalidChainIdError", {
            enumerable: !0,
            get: function () {
              return R.InvalidChainIdError;
            },
          }));
        var S = ur();
        (Object.defineProperty(e, "CallExecutionError", {
          enumerable: !0,
          get: function () {
            return S.CallExecutionError;
          },
        }),
          Object.defineProperty(e, "ContractFunctionExecutionError", {
            enumerable: !0,
            get: function () {
              return S.ContractFunctionExecutionError;
            },
          }),
          Object.defineProperty(e, "ContractFunctionRevertedError", {
            enumerable: !0,
            get: function () {
              return S.ContractFunctionRevertedError;
            },
          }),
          Object.defineProperty(e, "ContractFunctionZeroDataError", {
            enumerable: !0,
            get: function () {
              return S.ContractFunctionZeroDataError;
            },
          }),
          Object.defineProperty(e, "CounterfactualDeploymentFailedError", {
            enumerable: !0,
            get: function () {
              return S.CounterfactualDeploymentFailedError;
            },
          }),
          Object.defineProperty(e, "RawContractError", {
            enumerable: !0,
            get: function () {
              return S.RawContractError;
            },
          }));
        var x = Su();
        (Object.defineProperty(e, "SizeExceedsPaddingSizeError", {
          enumerable: !0,
          get: function () {
            return x.SizeExceedsPaddingSizeError;
          },
        }),
          Object.defineProperty(e, "SliceOffsetOutOfBoundsError", {
            enumerable: !0,
            get: function () {
              return x.SliceOffsetOutOfBoundsError;
            },
          }));
        var F = _n();
        (Object.defineProperty(e, "IntegerOutOfRangeError", {
          enumerable: !0,
          get: function () {
            return F.IntegerOutOfRangeError;
          },
        }),
          Object.defineProperty(e, "InvalidBytesBooleanError", {
            enumerable: !0,
            get: function () {
              return F.InvalidBytesBooleanError;
            },
          }),
          Object.defineProperty(e, "InvalidHexBooleanError", {
            enumerable: !0,
            get: function () {
              return F.InvalidHexBooleanError;
            },
          }),
          Object.defineProperty(e, "InvalidHexValueError", {
            enumerable: !0,
            get: function () {
              return F.InvalidHexValueError;
            },
          }),
          Object.defineProperty(e, "SizeOverflowError", {
            enumerable: !0,
            get: function () {
              return F.SizeOverflowError;
            },
          }));
        var H = Of();
        (Object.defineProperty(e, "EnsAvatarInvalidNftUriError", {
          enumerable: !0,
          get: function () {
            return H.EnsAvatarInvalidNftUriError;
          },
        }),
          Object.defineProperty(e, "EnsAvatarUnsupportedNamespaceError", {
            enumerable: !0,
            get: function () {
              return H.EnsAvatarUnsupportedNamespaceError;
            },
          }),
          Object.defineProperty(e, "EnsAvatarUriResolutionError", {
            enumerable: !0,
            get: function () {
              return H.EnsAvatarUriResolutionError;
            },
          }),
          Object.defineProperty(e, "EnsInvalidChainIdError", {
            enumerable: !0,
            get: function () {
              return H.EnsInvalidChainIdError;
            },
          }));
        var T = dg();
        Object.defineProperty(e, "EstimateGasExecutionError", {
          enumerable: !0,
          get: function () {
            return T.EstimateGasExecutionError;
          },
        });
        var k = zo();
        (Object.defineProperty(e, "BaseFeeScalarError", {
          enumerable: !0,
          get: function () {
            return k.BaseFeeScalarError;
          },
        }),
          Object.defineProperty(e, "Eip1559FeesNotSupportedError", {
            enumerable: !0,
            get: function () {
              return k.Eip1559FeesNotSupportedError;
            },
          }),
          Object.defineProperty(e, "MaxFeePerGasTooLowError", {
            enumerable: !0,
            get: function () {
              return k.MaxFeePerGasTooLowError;
            },
          }));
        var O = Xp();
        Object.defineProperty(e, "FilterTypeNotSupportedError", {
          enumerable: !0,
          get: function () {
            return O.FilterTypeNotSupportedError;
          },
        });
        var C = Zt();
        (Object.defineProperty(e, "ExecutionRevertedError", {
          enumerable: !0,
          get: function () {
            return C.ExecutionRevertedError;
          },
        }),
          Object.defineProperty(e, "FeeCapTooHighError", {
            enumerable: !0,
            get: function () {
              return C.FeeCapTooHighError;
            },
          }),
          Object.defineProperty(e, "FeeCapTooLowError", {
            enumerable: !0,
            get: function () {
              return C.FeeCapTooLowError;
            },
          }),
          Object.defineProperty(e, "InsufficientFundsError", {
            enumerable: !0,
            get: function () {
              return C.InsufficientFundsError;
            },
          }),
          Object.defineProperty(e, "IntrinsicGasTooHighError", {
            enumerable: !0,
            get: function () {
              return C.IntrinsicGasTooHighError;
            },
          }),
          Object.defineProperty(e, "IntrinsicGasTooLowError", {
            enumerable: !0,
            get: function () {
              return C.IntrinsicGasTooLowError;
            },
          }),
          Object.defineProperty(e, "NonceMaxValueError", {
            enumerable: !0,
            get: function () {
              return C.NonceMaxValueError;
            },
          }),
          Object.defineProperty(e, "NonceTooHighError", {
            enumerable: !0,
            get: function () {
              return C.NonceTooHighError;
            },
          }),
          Object.defineProperty(e, "NonceTooLowError", {
            enumerable: !0,
            get: function () {
              return C.NonceTooLowError;
            },
          }),
          Object.defineProperty(e, "TipAboveFeeCapError", {
            enumerable: !0,
            get: function () {
              return C.TipAboveFeeCapError;
            },
          }),
          Object.defineProperty(e, "TransactionTypeNotSupportedError", {
            enumerable: !0,
            get: function () {
              return C.TransactionTypeNotSupportedError;
            },
          }),
          Object.defineProperty(e, "UnknownNodeError", {
            enumerable: !0,
            get: function () {
              return C.UnknownNodeError;
            },
          }));
        var q = Et();
        (Object.defineProperty(e, "HttpRequestError", {
          enumerable: !0,
          get: function () {
            return q.HttpRequestError;
          },
        }),
          Object.defineProperty(e, "RpcRequestError", {
            enumerable: !0,
            get: function () {
              return q.RpcRequestError;
            },
          }),
          Object.defineProperty(e, "SocketClosedError", {
            enumerable: !0,
            get: function () {
              return q.SocketClosedError;
            },
          }),
          Object.defineProperty(e, "TimeoutError", {
            enumerable: !0,
            get: function () {
              return q.TimeoutError;
            },
          }),
          Object.defineProperty(e, "WebSocketRequestError", {
            enumerable: !0,
            get: function () {
              return q.WebSocketRequestError;
            },
          }));
        var M = dr();
        (Object.defineProperty(e, "AtomicityNotSupportedError", {
          enumerable: !0,
          get: function () {
            return M.AtomicityNotSupportedError;
          },
        }),
          Object.defineProperty(e, "AtomicReadyWalletRejectedUpgradeError", {
            enumerable: !0,
            get: function () {
              return M.AtomicReadyWalletRejectedUpgradeError;
            },
          }),
          Object.defineProperty(e, "BundleTooLargeError", {
            enumerable: !0,
            get: function () {
              return M.BundleTooLargeError;
            },
          }),
          Object.defineProperty(e, "ChainDisconnectedError", {
            enumerable: !0,
            get: function () {
              return M.ChainDisconnectedError;
            },
          }),
          Object.defineProperty(e, "DuplicateIdError", {
            enumerable: !0,
            get: function () {
              return M.DuplicateIdError;
            },
          }),
          Object.defineProperty(e, "InternalRpcError", {
            enumerable: !0,
            get: function () {
              return M.InternalRpcError;
            },
          }),
          Object.defineProperty(e, "InvalidInputRpcError", {
            enumerable: !0,
            get: function () {
              return M.InvalidInputRpcError;
            },
          }),
          Object.defineProperty(e, "InvalidParamsRpcError", {
            enumerable: !0,
            get: function () {
              return M.InvalidParamsRpcError;
            },
          }),
          Object.defineProperty(e, "InvalidRequestRpcError", {
            enumerable: !0,
            get: function () {
              return M.InvalidRequestRpcError;
            },
          }),
          Object.defineProperty(e, "JsonRpcVersionUnsupportedError", {
            enumerable: !0,
            get: function () {
              return M.JsonRpcVersionUnsupportedError;
            },
          }),
          Object.defineProperty(e, "LimitExceededRpcError", {
            enumerable: !0,
            get: function () {
              return M.LimitExceededRpcError;
            },
          }),
          Object.defineProperty(e, "MethodNotFoundRpcError", {
            enumerable: !0,
            get: function () {
              return M.MethodNotFoundRpcError;
            },
          }),
          Object.defineProperty(e, "MethodNotSupportedRpcError", {
            enumerable: !0,
            get: function () {
              return M.MethodNotSupportedRpcError;
            },
          }),
          Object.defineProperty(e, "ParseRpcError", {
            enumerable: !0,
            get: function () {
              return M.ParseRpcError;
            },
          }),
          Object.defineProperty(e, "ProviderDisconnectedError", {
            enumerable: !0,
            get: function () {
              return M.ProviderDisconnectedError;
            },
          }),
          Object.defineProperty(e, "ProviderRpcError", {
            enumerable: !0,
            get: function () {
              return M.ProviderRpcError;
            },
          }),
          Object.defineProperty(e, "ResourceNotFoundRpcError", {
            enumerable: !0,
            get: function () {
              return M.ResourceNotFoundRpcError;
            },
          }),
          Object.defineProperty(e, "ResourceUnavailableRpcError", {
            enumerable: !0,
            get: function () {
              return M.ResourceUnavailableRpcError;
            },
          }),
          Object.defineProperty(e, "RpcError", {
            enumerable: !0,
            get: function () {
              return M.RpcError;
            },
          }),
          Object.defineProperty(e, "SwitchChainError", {
            enumerable: !0,
            get: function () {
              return M.SwitchChainError;
            },
          }),
          Object.defineProperty(e, "TransactionRejectedRpcError", {
            enumerable: !0,
            get: function () {
              return M.TransactionRejectedRpcError;
            },
          }),
          Object.defineProperty(e, "UnauthorizedProviderError", {
            enumerable: !0,
            get: function () {
              return M.UnauthorizedProviderError;
            },
          }),
          Object.defineProperty(e, "UnknownBundleIdError", {
            enumerable: !0,
            get: function () {
              return M.UnknownBundleIdError;
            },
          }),
          Object.defineProperty(e, "UnknownRpcError", {
            enumerable: !0,
            get: function () {
              return M.UnknownRpcError;
            },
          }),
          Object.defineProperty(e, "UnsupportedChainIdError", {
            enumerable: !0,
            get: function () {
              return M.UnsupportedChainIdError;
            },
          }),
          Object.defineProperty(e, "UnsupportedNonOptionalCapabilityError", {
            enumerable: !0,
            get: function () {
              return M.UnsupportedNonOptionalCapabilityError;
            },
          }),
          Object.defineProperty(e, "UnsupportedProviderMethodError", {
            enumerable: !0,
            get: function () {
              return M.UnsupportedProviderMethodError;
            },
          }),
          Object.defineProperty(e, "UserRejectedRequestError", {
            enumerable: !0,
            get: function () {
              return M.UserRejectedRequestError;
            },
          }));
        var N = tf();
        (Object.defineProperty(e, "AccountStateConflictError", {
          enumerable: !0,
          get: function () {
            return N.AccountStateConflictError;
          },
        }),
          Object.defineProperty(e, "StateAssignmentConflictError", {
            enumerable: !0,
            get: function () {
              return N.StateAssignmentConflictError;
            },
          }));
        var z = tt();
        (Object.defineProperty(e, "FeeConflictError", {
          enumerable: !0,
          get: function () {
            return z.FeeConflictError;
          },
        }),
          Object.defineProperty(e, "InvalidLegacyVError", {
            enumerable: !0,
            get: function () {
              return z.InvalidLegacyVError;
            },
          }),
          Object.defineProperty(e, "InvalidSerializableTransactionError", {
            enumerable: !0,
            get: function () {
              return z.InvalidSerializableTransactionError;
            },
          }),
          Object.defineProperty(e, "InvalidSerializedTransactionError", {
            enumerable: !0,
            get: function () {
              return z.InvalidSerializedTransactionError;
            },
          }),
          Object.defineProperty(e, "InvalidSerializedTransactionTypeError", {
            enumerable: !0,
            get: function () {
              return z.InvalidSerializedTransactionTypeError;
            },
          }),
          Object.defineProperty(e, "InvalidStorageKeySizeError", {
            enumerable: !0,
            get: function () {
              return z.InvalidStorageKeySizeError;
            },
          }),
          Object.defineProperty(e, "TransactionExecutionError", {
            enumerable: !0,
            get: function () {
              return z.TransactionExecutionError;
            },
          }),
          Object.defineProperty(e, "TransactionNotFoundError", {
            enumerable: !0,
            get: function () {
              return z.TransactionNotFoundError;
            },
          }),
          Object.defineProperty(e, "TransactionReceiptNotFoundError", {
            enumerable: !0,
            get: function () {
              return z.TransactionReceiptNotFoundError;
            },
          }),
          Object.defineProperty(e, "WaitForTransactionReceiptTimeoutError", {
            enumerable: !0,
            get: function () {
              return z.WaitForTransactionReceiptTimeoutError;
            },
          }));
        var $ = Yf();
        Object.defineProperty(e, "UrlRequiredError", {
          enumerable: !0,
          get: function () {
            return $.UrlRequiredError;
          },
        });
        var U = Qg();
        (Object.defineProperty(e, "InvalidDomainError", {
          enumerable: !0,
          get: function () {
            return U.InvalidDomainError;
          },
        }),
          Object.defineProperty(e, "InvalidPrimaryTypeError", {
            enumerable: !0,
            get: function () {
              return U.InvalidPrimaryTypeError;
            },
          }),
          Object.defineProperty(e, "InvalidStructTypeError", {
            enumerable: !0,
            get: function () {
              return U.InvalidStructTypeError;
            },
          }));
        var G = d_();
        Object.defineProperty(e, "InvalidDecimalNumberError", {
          enumerable: !0,
          get: function () {
            return G.InvalidDecimalNumberError;
          },
        });
        var Z = L2();
        Object.defineProperty(e, "EIP1193ProviderRpcError", {
          enumerable: !0,
          get: function () {
            return Z.ProviderRpcError;
          },
        });
        var K = cr();
        Object.defineProperty(e, "decodeAbiParameters", {
          enumerable: !0,
          get: function () {
            return K.decodeAbiParameters;
          },
        });
        var V = D2();
        Object.defineProperty(e, "decodeDeployData", {
          enumerable: !0,
          get: function () {
            return V.decodeDeployData;
          },
        });
        var Y = Ou();
        Object.defineProperty(e, "decodeErrorResult", {
          enumerable: !0,
          get: function () {
            return Y.decodeErrorResult;
          },
        });
        var re = Do();
        Object.defineProperty(e, "decodeEventLog", {
          enumerable: !0,
          get: function () {
            return re.decodeEventLog;
          },
        });
        var J = _f();
        Object.defineProperty(e, "decodeFunctionData", {
          enumerable: !0,
          get: function () {
            return J.decodeFunctionData;
          },
        });
        var X = Rt();
        Object.defineProperty(e, "decodeFunctionResult", {
          enumerable: !0,
          get: function () {
            return X.decodeFunctionResult;
          },
        });
        var Q = vt();
        Object.defineProperty(e, "encodeAbiParameters", {
          enumerable: !0,
          get: function () {
            return Q.encodeAbiParameters;
          },
        });
        var oe = Ko();
        Object.defineProperty(e, "encodeDeployData", {
          enumerable: !0,
          get: function () {
            return oe.encodeDeployData;
          },
        });
        var ie = vf();
        Object.defineProperty(e, "encodeErrorResult", {
          enumerable: !0,
          get: function () {
            return ie.encodeErrorResult;
          },
        });
        var se = zr();
        Object.defineProperty(e, "encodeEventTopics", {
          enumerable: !0,
          get: function () {
            return se.encodeEventTopics;
          },
        });
        var de = We();
        Object.defineProperty(e, "encodeFunctionData", {
          enumerable: !0,
          get: function () {
            return de.encodeFunctionData;
          },
        });
        var ye = Ef();
        Object.defineProperty(e, "encodeFunctionResult", {
          enumerable: !0,
          get: function () {
            return ye.encodeFunctionResult;
          },
        });
        var ee = qg();
        Object.defineProperty(e, "encodePacked", {
          enumerable: !0,
          get: function () {
            return ee.encodePacked;
          },
        });
        var W = Kt();
        Object.defineProperty(e, "getAbiItem", {
          enumerable: !0,
          get: function () {
            return W.getAbiItem;
          },
        });
        var Ee = Go();
        Object.defineProperty(e, "parseEventLogs", {
          enumerable: !0,
          get: function () {
            return Ee.parseEventLogs;
          },
        });
        var Ce = tg();
        Object.defineProperty(e, "prepareEncodeFunctionData", {
          enumerable: !0,
          get: function () {
            return Ce.prepareEncodeFunctionData;
          },
        });
        var Oe = Qe();
        (Object.defineProperty(e, "checksumAddress", {
          enumerable: !0,
          get: function () {
            return Oe.checksumAddress;
          },
        }),
          Object.defineProperty(e, "getAddress", {
            enumerable: !0,
            get: function () {
              return Oe.getAddress;
            },
          }));
        var He = Mg();
        (Object.defineProperty(e, "getContractAddress", {
          enumerable: !0,
          get: function () {
            return He.getContractAddress;
          },
        }),
          Object.defineProperty(e, "getCreate2Address", {
            enumerable: !0,
            get: function () {
              return He.getCreate2Address;
            },
          }),
          Object.defineProperty(e, "getCreateAddress", {
            enumerable: !0,
            get: function () {
              return He.getCreateAddress;
            },
          }));
        var Ke = et();
        Object.defineProperty(e, "isAddress", {
          enumerable: !0,
          get: function () {
            return Ke.isAddress;
          },
        });
        var lt = Pt();
        Object.defineProperty(e, "isAddressEqual", {
          enumerable: !0,
          get: function () {
            return lt.isAddressEqual;
          },
        });
        var ut = Hu();
        Object.defineProperty(e, "blobsToCommitments", {
          enumerable: !0,
          get: function () {
            return ut.blobsToCommitments;
          },
        });
        var dt = ku();
        Object.defineProperty(e, "blobsToProofs", {
          enumerable: !0,
          get: function () {
            return dt.blobsToProofs;
          },
        });
        var Ze = ff();
        Object.defineProperty(e, "commitmentsToVersionedHashes", {
          enumerable: !0,
          get: function () {
            return Ze.commitmentsToVersionedHashes;
          },
        });
        var Me = df();
        Object.defineProperty(e, "commitmentToVersionedHash", {
          enumerable: !0,
          get: function () {
            return Me.commitmentToVersionedHash;
          },
        });
        var At = G2();
        Object.defineProperty(e, "fromBlobs", {
          enumerable: !0,
          get: function () {
            return At.fromBlobs;
          },
        });
        var bt = V2();
        Object.defineProperty(e, "sidecarsToVersionedHashes", {
          enumerable: !0,
          get: function () {
            return bt.sidecarsToVersionedHashes;
          },
        });
        var Pn = Fu();
        Object.defineProperty(e, "toBlobSidecars", {
          enumerable: !0,
          get: function () {
            return Pn.toBlobSidecars;
          },
        });
        var ri = pg();
        Object.defineProperty(e, "toBlobs", {
          enumerable: !0,
          get: function () {
            return ri.toBlobs;
          },
        });
        var pr = jf();
        (Object.defineProperty(e, "ccipRequest", {
          enumerable: !0,
          get: function () {
            return pr.ccipRequest;
          },
        }),
          Object.defineProperty(e, "ccipFetch", {
            enumerable: !0,
            get: function () {
              return pr.ccipRequest;
            },
          }),
          Object.defineProperty(e, "offchainLookup", {
            enumerable: !0,
            get: function () {
              return pr.offchainLookup;
            },
          }),
          Object.defineProperty(e, "offchainLookupAbiItem", {
            enumerable: !0,
            get: function () {
              return pr.offchainLookupAbiItem;
            },
          }),
          Object.defineProperty(e, "offchainLookupSignature", {
            enumerable: !0,
            get: function () {
              return pr.offchainLookupSignature;
            },
          }));
        var ni = Jo();
        Object.defineProperty(e, "assertCurrentChain", {
          enumerable: !0,
          get: function () {
            return ni.assertCurrentChain;
          },
        });
        var oi = Ng();
        (Object.defineProperty(e, "defineChain", {
          enumerable: !0,
          get: function () {
            return oi.defineChain;
          },
        }),
          Object.defineProperty(e, "extendSchema", {
            enumerable: !0,
            get: function () {
              return oi.extendSchema;
            },
          }));
        var ed = $g();
        Object.defineProperty(e, "extractChain", {
          enumerable: !0,
          get: function () {
            return ed.extractChain;
          },
        });
        var ii = hr();
        Object.defineProperty(e, "getChainContractAddress", {
          enumerable: !0,
          get: function () {
            return ii.getChainContractAddress;
          },
        });
        var An = qe();
        (Object.defineProperty(e, "concat", {
          enumerable: !0,
          get: function () {
            return An.concat;
          },
        }),
          Object.defineProperty(e, "concatBytes", {
            enumerable: !0,
            get: function () {
              return An.concatBytes;
            },
          }),
          Object.defineProperty(e, "concatHex", {
            enumerable: !0,
            get: function () {
              return An.concatHex;
            },
          }));
        var td = Cf();
        Object.defineProperty(e, "isBytes", {
          enumerable: !0,
          get: function () {
            return td.isBytes;
          },
        });
        var rd = Ge();
        Object.defineProperty(e, "isHex", {
          enumerable: !0,
          get: function () {
            return rd.isHex;
          },
        });
        var Tn = ar();
        (Object.defineProperty(e, "pad", {
          enumerable: !0,
          get: function () {
            return Tn.pad;
          },
        }),
          Object.defineProperty(e, "padBytes", {
            enumerable: !0,
            get: function () {
              return Tn.padBytes;
            },
          }),
          Object.defineProperty(e, "padHex", {
            enumerable: !0,
            get: function () {
              return Tn.padHex;
            },
          }));
        var nd = Ve();
        Object.defineProperty(e, "size", {
          enumerable: !0,
          get: function () {
            return nd.size;
          },
        });
        var Sn = st();
        (Object.defineProperty(e, "slice", {
          enumerable: !0,
          get: function () {
            return Sn.slice;
          },
        }),
          Object.defineProperty(e, "sliceBytes", {
            enumerable: !0,
            get: function () {
              return Sn.sliceBytes;
            },
          }),
          Object.defineProperty(e, "sliceHex", {
            enumerable: !0,
            get: function () {
              return Sn.sliceHex;
            },
          }));
        var od = Wt();
        Object.defineProperty(e, "trim", {
          enumerable: !0,
          get: function () {
            return od.trim;
          },
        });
        var gr = ef();
        (Object.defineProperty(e, "bytesToBigInt", {
          enumerable: !0,
          get: function () {
            return gr.bytesToBigInt;
          },
        }),
          Object.defineProperty(e, "bytesToBool", {
            enumerable: !0,
            get: function () {
              return gr.bytesToBool;
            },
          }),
          Object.defineProperty(e, "bytesToNumber", {
            enumerable: !0,
            get: function () {
              return gr.bytesToNumber;
            },
          }),
          Object.defineProperty(e, "bytesToString", {
            enumerable: !0,
            get: function () {
              return gr.bytesToString;
            },
          }),
          Object.defineProperty(e, "fromBytes", {
            enumerable: !0,
            get: function () {
              return gr.fromBytes;
            },
          }));
        var _r = Be();
        (Object.defineProperty(e, "fromHex", {
          enumerable: !0,
          get: function () {
            return _r.fromHex;
          },
        }),
          Object.defineProperty(e, "hexToBigInt", {
            enumerable: !0,
            get: function () {
              return _r.hexToBigInt;
            },
          }),
          Object.defineProperty(e, "hexToBool", {
            enumerable: !0,
            get: function () {
              return _r.hexToBool;
            },
          }),
          Object.defineProperty(e, "hexToNumber", {
            enumerable: !0,
            get: function () {
              return _r.hexToNumber;
            },
          }),
          Object.defineProperty(e, "hexToString", {
            enumerable: !0,
            get: function () {
              return _r.hexToString;
            },
          }));
        var id = Mf();
        Object.defineProperty(e, "fromRlp", {
          enumerable: !0,
          get: function () {
            return id.fromRlp;
          },
        });
        var vr = ve();
        (Object.defineProperty(e, "boolToBytes", {
          enumerable: !0,
          get: function () {
            return vr.boolToBytes;
          },
        }),
          Object.defineProperty(e, "hexToBytes", {
            enumerable: !0,
            get: function () {
              return vr.hexToBytes;
            },
          }),
          Object.defineProperty(e, "numberToBytes", {
            enumerable: !0,
            get: function () {
              return vr.numberToBytes;
            },
          }),
          Object.defineProperty(e, "stringToBytes", {
            enumerable: !0,
            get: function () {
              return vr.stringToBytes;
            },
          }),
          Object.defineProperty(e, "toBytes", {
            enumerable: !0,
            get: function () {
              return vr.toBytes;
            },
          }));
        var Er = te();
        (Object.defineProperty(e, "boolToHex", {
          enumerable: !0,
          get: function () {
            return Er.boolToHex;
          },
        }),
          Object.defineProperty(e, "bytesToHex", {
            enumerable: !0,
            get: function () {
              return Er.bytesToHex;
            },
          }),
          Object.defineProperty(e, "numberToHex", {
            enumerable: !0,
            get: function () {
              return Er.numberToHex;
            },
          }),
          Object.defineProperty(e, "stringToHex", {
            enumerable: !0,
            get: function () {
              return Er.stringToHex;
            },
          }),
          Object.defineProperty(e, "toHex", {
            enumerable: !0,
            get: function () {
              return Er.toHex;
            },
          }));
        var In = ko();
        (Object.defineProperty(e, "bytesToRlp", {
          enumerable: !0,
          get: function () {
            return In.bytesToRlp;
          },
        }),
          Object.defineProperty(e, "hexToRlp", {
            enumerable: !0,
            get: function () {
              return In.hexToRlp;
            },
          }),
          Object.defineProperty(e, "toRlp", {
            enumerable: !0,
            get: function () {
              return In.toRlp;
            },
          }));
        var ad = Rg();
        Object.defineProperty(e, "labelhash", {
          enumerable: !0,
          get: function () {
            return ad.labelhash;
          },
        });
        var sd = Rf();
        Object.defineProperty(e, "namehash", {
          enumerable: !0,
          get: function () {
            return sd.namehash;
          },
        });
        var Rn = W2();
        Object.defineProperty(e, "toCoinType", {
          enumerable: !0,
          get: function () {
            return Rn.toCoinType;
          },
        });
        var cd = fr();
        Object.defineProperty(e, "getContractError", {
          enumerable: !0,
          get: function () {
            return cd.getContractError;
          },
        });
        var ai = qu();
        (Object.defineProperty(e, "defineBlock", {
          enumerable: !0,
          get: function () {
            return ai.defineBlock;
          },
        }),
          Object.defineProperty(e, "formatBlock", {
            enumerable: !0,
            get: function () {
              return ai.formatBlock;
            },
          }));
        var ud = It();
        Object.defineProperty(e, "formatLog", {
          enumerable: !0,
          get: function () {
            return ud.formatLog;
          },
        });
        var Bn = En();
        (Object.defineProperty(e, "defineTransaction", {
          enumerable: !0,
          get: function () {
            return Bn.defineTransaction;
          },
        }),
          Object.defineProperty(e, "formatTransaction", {
            enumerable: !0,
            get: function () {
              return Bn.formatTransaction;
            },
          }),
          Object.defineProperty(e, "transactionType", {
            enumerable: !0,
            get: function () {
              return Bn.transactionType;
            },
          }));
        var si = Yo();
        (Object.defineProperty(e, "defineTransactionReceipt", {
          enumerable: !0,
          get: function () {
            return si.defineTransactionReceipt;
          },
        }),
          Object.defineProperty(e, "formatTransactionReceipt", {
            enumerable: !0,
            get: function () {
              return si.formatTransactionReceipt;
            },
          }));
        var Wr = jt();
        (Object.defineProperty(e, "defineTransactionRequest", {
          enumerable: !0,
          get: function () {
            return Wr.defineTransactionRequest;
          },
        }),
          Object.defineProperty(e, "formatTransactionRequest", {
            enumerable: !0,
            get: function () {
              return Wr.formatTransactionRequest;
            },
          }),
          Object.defineProperty(e, "rpcTransactionType", {
            enumerable: !0,
            get: function () {
              return Wr.rpcTransactionType;
            },
          }));
        var dd = Hf();
        Object.defineProperty(e, "isHash", {
          enumerable: !0,
          get: function () {
            return dd.isHash;
          },
        });
        var fd = Xe();
        Object.defineProperty(e, "keccak256", {
          enumerable: !0,
          get: function () {
            return fd.keccak256;
          },
        });
        var ld = Ug();
        Object.defineProperty(e, "ripemd160", {
          enumerable: !0,
          get: function () {
            return ld.ripemd160;
          },
        });
        var bd = uf();
        Object.defineProperty(e, "sha256", {
          enumerable: !0,
          get: function () {
            return bd.sha256;
          },
        });
        var md = Lg();
        Object.defineProperty(e, "toEventHash", {
          enumerable: !0,
          get: function () {
            return md.toEventHash;
          },
        });
        var ci = vn();
        (Object.defineProperty(e, "toEventSelector", {
          enumerable: !0,
          get: function () {
            return ci.toEventSelector;
          },
        }),
          Object.defineProperty(e, "getEventSelector", {
            enumerable: !0,
            get: function () {
              return ci.toEventSelector;
            },
          }));
        var Xf = Dg();
        (Object.defineProperty(e, "toEventSignature", {
          enumerable: !0,
          get: function () {
            return Xf.toEventSignature;
          },
        }),
          Object.defineProperty(e, "getEventSignature", {
            enumerable: !0,
            get: function () {
              return Xf.toEventSignature;
            },
          }));
        var B_ = Gg();
        Object.defineProperty(e, "toFunctionHash", {
          enumerable: !0,
          get: function () {
            return B_.toFunctionHash;
          },
        });
        var Qf = $r();
        (Object.defineProperty(e, "toFunctionSelector", {
          enumerable: !0,
          get: function () {
            return Qf.toFunctionSelector;
          },
        }),
          Object.defineProperty(e, "getFunctionSelector", {
            enumerable: !0,
            get: function () {
              return Qf.toFunctionSelector;
            },
          }));
        var el = Vg();
        (Object.defineProperty(e, "toFunctionSignature", {
          enumerable: !0,
          get: function () {
            return el.toFunctionSignature;
          },
        }),
          Object.defineProperty(e, "getFunctionSignature", {
            enumerable: !0,
            get: function () {
              return el.toFunctionSignature;
            },
          }));
        var O_ = T_();
        Object.defineProperty(e, "defineKzg", {
          enumerable: !0,
          get: function () {
            return O_.defineKzg;
          },
        });
        var x_ = K2();
        Object.defineProperty(e, "setupKzg", {
          enumerable: !0,
          get: function () {
            return x_.setupKzg;
          },
        });
        var tl = Wg();
        (Object.defineProperty(e, "createNonceManager", {
          enumerable: !0,
          get: function () {
            return tl.createNonceManager;
          },
        }),
          Object.defineProperty(e, "nonceManager", {
            enumerable: !0,
            get: function () {
              return tl.nonceManager;
            },
          }));
        var C_ = wg();
        Object.defineProperty(e, "withCache", {
          enumerable: !0,
          get: function () {
            return C_.withCache;
          },
        });
        var q_ = Gu();
        Object.defineProperty(e, "withRetry", {
          enumerable: !0,
          get: function () {
            return q_.withRetry;
          },
        });
        var M_ = kf();
        Object.defineProperty(e, "withTimeout", {
          enumerable: !0,
          get: function () {
            return M_.withTimeout;
          },
        });
        var H_ = Z2();
        Object.defineProperty(e, "compactSignatureToSignature", {
          enumerable: !0,
          get: function () {
            return H_.compactSignatureToSignature;
          },
        });
        var k_ = Xo();
        Object.defineProperty(e, "hashMessage", {
          enumerable: !0,
          get: function () {
            return k_.hashMessage;
          },
        });
        var hd = Qo();
        (Object.defineProperty(e, "hashDomain", {
          enumerable: !0,
          get: function () {
            return hd.hashDomain;
          },
        }),
          Object.defineProperty(e, "hashStruct", {
            enumerable: !0,
            get: function () {
              return hd.hashStruct;
            },
          }),
          Object.defineProperty(e, "hashTypedData", {
            enumerable: !0,
            get: function () {
              return hd.hashTypedData;
            },
          }));
        var F_ = zf();
        Object.defineProperty(e, "isErc6492Signature", {
          enumerable: !0,
          get: function () {
            return F_.isErc6492Signature;
          },
        });
        var N_ = Df();
        Object.defineProperty(e, "isErc8010Signature", {
          enumerable: !0,
          get: function () {
            return N_.isErc8010Signature;
          },
        });
        var rl = J2();
        (Object.defineProperty(e, "hexToCompactSignature", {
          enumerable: !0,
          get: function () {
            return rl.parseCompactSignature;
          },
        }),
          Object.defineProperty(e, "parseCompactSignature", {
            enumerable: !0,
            get: function () {
              return rl.parseCompactSignature;
            },
          }));
        var $_ = n_();
        Object.defineProperty(e, "parseErc6492Signature", {
          enumerable: !0,
          get: function () {
            return $_.parseErc6492Signature;
          },
        });
        var z_ = o_();
        Object.defineProperty(e, "parseErc8010Signature", {
          enumerable: !0,
          get: function () {
            return z_.parseErc8010Signature;
          },
        });
        var nl = Y2();
        (Object.defineProperty(e, "hexToSignature", {
          enumerable: !0,
          get: function () {
            return nl.parseSignature;
          },
        }),
          Object.defineProperty(e, "parseSignature", {
            enumerable: !0,
            get: function () {
              return nl.parseSignature;
            },
          }));
        var U_ = lr();
        Object.defineProperty(e, "recoverAddress", {
          enumerable: !0,
          get: function () {
            return U_.recoverAddress;
          },
        });
        var L_ = Gf();
        Object.defineProperty(e, "recoverMessageAddress", {
          enumerable: !0,
          get: function () {
            return L_.recoverMessageAddress;
          },
        });
        var D_ = nf();
        Object.defineProperty(e, "recoverPublicKey", {
          enumerable: !0,
          get: function () {
            return D_.recoverPublicKey;
          },
        });
        var G_ = X2();
        Object.defineProperty(e, "recoverTransactionAddress", {
          enumerable: !0,
          get: function () {
            return G_.recoverTransactionAddress;
          },
        });
        var V_ = Vf();
        Object.defineProperty(e, "recoverTypedDataAddress", {
          enumerable: !0,
          get: function () {
            return V_.recoverTypedDataAddress;
          },
        });
        var ol = Q2();
        (Object.defineProperty(e, "compactSignatureToHex", {
          enumerable: !0,
          get: function () {
            return ol.serializeCompactSignature;
          },
        }),
          Object.defineProperty(e, "serializeCompactSignature", {
            enumerable: !0,
            get: function () {
              return ol.serializeCompactSignature;
            },
          }));
        var W_ = i_();
        Object.defineProperty(e, "serializeErc6492Signature", {
          enumerable: !0,
          get: function () {
            return W_.serializeErc6492Signature;
          },
        });
        var K_ = a_();
        Object.defineProperty(e, "serializeErc8010Signature", {
          enumerable: !0,
          get: function () {
            return K_.serializeErc8010Signature;
          },
        });
        var il = g_();
        (Object.defineProperty(e, "signatureToHex", {
          enumerable: !0,
          get: function () {
            return il.serializeSignature;
          },
        }),
          Object.defineProperty(e, "serializeSignature", {
            enumerable: !0,
            get: function () {
              return il.serializeSignature;
            },
          }));
        var Z_ = e5();
        Object.defineProperty(e, "signatureToCompactSignature", {
          enumerable: !0,
          get: function () {
            return Z_.signatureToCompactSignature;
          },
        });
        var J_ = Xg();
        Object.defineProperty(e, "toPrefixedMessage", {
          enumerable: !0,
          get: function () {
            return J_.toPrefixedMessage;
          },
        });
        var Y_ = s_();
        Object.defineProperty(e, "verifyHash", {
          enumerable: !0,
          get: function () {
            return Y_.verifyHash;
          },
        });
        var X_ = c_();
        Object.defineProperty(e, "verifyMessage", {
          enumerable: !0,
          get: function () {
            return X_.verifyMessage;
          },
        });
        var Q_ = u_();
        Object.defineProperty(e, "verifyTypedData", {
          enumerable: !0,
          get: function () {
            return Q_.verifyTypedData;
          },
        });
        var ev = Fe();
        Object.defineProperty(e, "stringify", {
          enumerable: !0,
          get: function () {
            return ev.stringify;
          },
        });
        var tv = wt();
        Object.defineProperty(e, "assertRequest", {
          enumerable: !0,
          get: function () {
            return tv.assertRequest;
          },
        });
        var yd = Wu();
        (Object.defineProperty(e, "assertTransactionEIP1559", {
          enumerable: !0,
          get: function () {
            return yd.assertTransactionEIP1559;
          },
        }),
          Object.defineProperty(e, "assertTransactionEIP2930", {
            enumerable: !0,
            get: function () {
              return yd.assertTransactionEIP2930;
            },
          }),
          Object.defineProperty(e, "assertTransactionLegacy", {
            enumerable: !0,
            get: function () {
              return yd.assertTransactionLegacy;
            },
          }));
        var rv = Wf();
        Object.defineProperty(e, "getSerializedTransactionType", {
          enumerable: !0,
          get: function () {
            return rv.getSerializedTransactionType;
          },
        });
        var nv = Nu();
        Object.defineProperty(e, "getTransactionType", {
          enumerable: !0,
          get: function () {
            return nv.getTransactionType;
          },
        });
        var ov = Kf();
        Object.defineProperty(e, "parseTransaction", {
          enumerable: !0,
          get: function () {
            return ov.parseTransaction;
          },
        });
        var iv = qf();
        Object.defineProperty(e, "serializeAccessList", {
          enumerable: !0,
          get: function () {
            return iv.serializeAccessList;
          },
        });
        var av = Ku();
        Object.defineProperty(e, "serializeTransaction", {
          enumerable: !0,
          get: function () {
            return av.serializeTransaction;
          },
        });
        var ui = Zu();
        (Object.defineProperty(e, "domainSeparator", {
          enumerable: !0,
          get: function () {
            return ui.domainSeparator;
          },
        }),
          Object.defineProperty(e, "getTypesForEIP712Domain", {
            enumerable: !0,
            get: function () {
              return ui.getTypesForEIP712Domain;
            },
          }),
          Object.defineProperty(e, "serializeTypedData", {
            enumerable: !0,
            get: function () {
              return ui.serializeTypedData;
            },
          }),
          Object.defineProperty(e, "validateTypedData", {
            enumerable: !0,
            get: function () {
              return ui.validateTypedData;
            },
          }));
        var sv = Ho();
        Object.defineProperty(e, "formatEther", {
          enumerable: !0,
          get: function () {
            return sv.formatEther;
          },
        });
        var cv = Ur();
        Object.defineProperty(e, "formatGwei", {
          enumerable: !0,
          get: function () {
            return cv.formatGwei;
          },
        });
        var uv = xu();
        Object.defineProperty(e, "formatUnits", {
          enumerable: !0,
          get: function () {
            return uv.formatUnits;
          },
        });
        var dv = f_();
        Object.defineProperty(e, "parseEther", {
          enumerable: !0,
          get: function () {
            return dv.parseEther;
          },
        });
        var fv = l_();
        Object.defineProperty(e, "parseGwei", {
          enumerable: !0,
          get: function () {
            return fv.parseGwei;
          },
        });
        var lv = Xu();
        Object.defineProperty(e, "parseUnits", {
          enumerable: !0,
          get: function () {
            return lv.parseUnits;
          },
        });
      })(Ed)),
    Ed
  );
}
var Mr = {},
  qp;
function r5() {
  if (qp) return Mr;
  ((qp = 1), Object.defineProperty(Mr, "__esModule", { value: !0 }), (Mr.MAGIC_VALUE_BYTES = Mr.MAGIC_VALUE = void 0));
  const e = "0x1626ba7e";
  Mr.MAGIC_VALUE = e;
  const r = "0x20c13b0b";
  return ((Mr.MAGIC_VALUE_BYTES = r), Mr);
}
var wu = {},
  xo = {},
  Hr = {},
  Mp;
function S_() {
  if (Mp) return Hr;
  ((Mp = 1),
    Object.defineProperty(Hr, "__esModule", { value: !0 }),
    (Hr.PermissionsError = Hr.PERMISSIONS_REQUEST_REJECTED = void 0),
    (Hr.PERMISSIONS_REQUEST_REJECTED = 4001));
  class e extends Error {
    constructor(n, t, o) {
      (super(n), (this.code = t), (this.data = o), Object.setPrototypeOf(this, e.prototype));
    }
  }
  return ((Hr.PermissionsError = e), Hr);
}
var Hp;
function I_() {
  if (Hp) return xo;
  ((Hp = 1), Object.defineProperty(xo, "__esModule", { value: !0 }), (xo.Wallet = void 0));
  const e = Fr(),
    r = S_();
  class n {
    constructor(o) {
      this.communicator = o;
    }
    async getPermissions() {
      return (await this.communicator.send(e.Methods.wallet_getPermissions, void 0)).data;
    }
    async requestPermissions(o) {
      if (!this.isPermissionRequestValid(o))
        throw new r.PermissionsError("Permissions request is invalid", r.PERMISSIONS_REQUEST_REJECTED);
      try {
        return (await this.communicator.send(e.Methods.wallet_requestPermissions, o)).data;
      } catch {
        throw new r.PermissionsError("Permissions rejected", r.PERMISSIONS_REQUEST_REJECTED);
      }
    }
    isPermissionRequestValid(o) {
      return o.every((s) =>
        typeof s == "object" ? Object.keys(s).every((i) => !!Object.values(e.RestrictedMethods).includes(i)) : !1,
      );
    }
  }
  return ((xo.Wallet = n), xo);
}
var kp;
function n5() {
  if (kp) return wu;
  ((kp = 1), Object.defineProperty(wu, "__esModule", { value: !0 }));
  const e = I_(),
    r = S_(),
    n = (o, s) => s.some((i) => i.parentCapability === o),
    t = () => (o, s, i) => {
      const a = i.value;
      return (
        (i.value = async function () {
          const c = new e.Wallet(this.communicator);
          let u = await c.getPermissions();
          if ((n(s, u) || (u = await c.requestPermissions([{ [s]: {} }])), !n(s, u)))
            throw new r.PermissionsError("Permissions rejected", r.PERMISSIONS_REQUEST_REJECTED);
          return a.apply(this);
        }),
        i
      );
    };
  return ((wu.default = t), wu);
}
var Fp;
function o5() {
  if (Fp) return Ct;
  Fp = 1;
  var e =
      (Ct && Ct.__decorate) ||
      function (u, l, f, m) {
        var g = arguments.length,
          h = g < 3 ? l : m === null ? (m = Object.getOwnPropertyDescriptor(l, f)) : m,
          b;
        if (typeof Reflect == "object" && typeof Reflect.decorate == "function") h = Reflect.decorate(u, l, f, m);
        else
          for (var v = u.length - 1; v >= 0; v--)
            (b = u[v]) && (h = (g < 3 ? b(h) : g > 3 ? b(l, f, h) : b(l, f)) || h);
        return (g > 3 && h && Object.defineProperty(l, f, h), h);
      },
    r =
      (Ct && Ct.__importDefault) ||
      function (u) {
        return u && u.__esModule ? u : { default: u };
      };
  (Object.defineProperty(Ct, "__esModule", { value: !0 }), (Ct.Safe = void 0));
  const n = t5(),
    t = r5(),
    o = Fr(),
    s = Zd(),
    i = Kd(),
    a = r(n5());
  class c {
    constructor(l) {
      this.communicator = l;
    }
    async getChainInfo() {
      return (await this.communicator.send(o.Methods.getChainInfo, void 0)).data;
    }
    async getInfo() {
      return (await this.communicator.send(o.Methods.getSafeInfo, void 0)).data;
    }
    async experimental_getBalances({ currency: l = "usd" } = {}) {
      return (await this.communicator.send(o.Methods.getSafeBalances, { currency: l })).data;
    }
    async check1271Signature(l, f = "0x") {
      const m = await this.getInfo(),
        g = (0, n.encodeFunctionData)({
          abi: [
            {
              constant: !1,
              inputs: [
                { name: "_dataHash", type: "bytes32" },
                { name: "_signature", type: "bytes" },
              ],
              name: "isValidSignature",
              outputs: [{ name: "", type: "bytes4" }],
              payable: !1,
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "isValidSignature",
          args: [l, f],
        }),
        h = { call: s.RPC_CALLS.eth_call, params: [{ to: m.safeAddress, data: g }, "latest"] };
      try {
        return (await this.communicator.send(o.Methods.rpcCall, h)).data.slice(0, 10).toLowerCase() === t.MAGIC_VALUE;
      } catch {
        return !1;
      }
    }
    async check1271SignatureBytes(l, f = "0x") {
      const m = await this.getInfo(),
        g = (0, n.encodeFunctionData)({
          abi: [
            {
              constant: !1,
              inputs: [
                { name: "_data", type: "bytes" },
                { name: "_signature", type: "bytes" },
              ],
              name: "isValidSignature",
              outputs: [{ name: "", type: "bytes4" }],
              payable: !1,
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "isValidSignature",
          args: [l, f],
        }),
        h = { call: s.RPC_CALLS.eth_call, params: [{ to: m.safeAddress, data: g }, "latest"] };
      try {
        return (
          (await this.communicator.send(o.Methods.rpcCall, h)).data.slice(0, 10).toLowerCase() === t.MAGIC_VALUE_BYTES
        );
      } catch {
        return !1;
      }
    }
    calculateMessageHash(l) {
      return (0, n.hashMessage)(l);
    }
    calculateTypedMessageHash(l) {
      const f = typeof l.domain.chainId == "object" ? l.domain.chainId.toNumber() : Number(l.domain.chainId);
      let m = l.primaryType;
      if (!m) {
        const g = Object.values(l.types),
          h = Object.keys(l.types).filter((b) =>
            g.every((v) => v.every(({ type: _ }) => _.replace("[", "").replace("]", "") !== b)),
          );
        if (h.length === 0 || h.length > 1) throw new Error("Please specify primaryType");
        m = h[0];
      }
      return (0, n.hashTypedData)({
        message: l.message,
        domain: { ...l.domain, chainId: f, verifyingContract: l.domain.verifyingContract, salt: l.domain.salt },
        types: l.types,
        primaryType: m,
      });
    }
    async getOffChainSignature(l) {
      return (await this.communicator.send(o.Methods.getOffChainSignature, l)).data;
    }
    async isMessageSigned(l, f = "0x") {
      let m;
      if (
        (typeof l == "string" &&
          (m = async () => {
            const g = this.calculateMessageHash(l);
            return await this.isMessageHashSigned(g, f);
          }),
        (0, i.isObjectEIP712TypedData)(l) &&
          (m = async () => {
            const g = this.calculateTypedMessageHash(l);
            return await this.isMessageHashSigned(g, f);
          }),
        m)
      )
        return await m();
      throw new Error("Invalid message type");
    }
    async isMessageHashSigned(l, f = "0x") {
      const m = [this.check1271Signature.bind(this), this.check1271SignatureBytes.bind(this)];
      for (const g of m) if (await g(l, f)) return !0;
      return !1;
    }
    async getEnvironmentInfo() {
      return (await this.communicator.send(o.Methods.getEnvironmentInfo, void 0)).data;
    }
    async requestAddressBook() {
      return (await this.communicator.send(o.Methods.requestAddressBook, void 0)).data;
    }
  }
  return ((Ct.Safe = c), e([(0, a.default)()], c.prototype, "requestAddressBook", null), Ct);
}
var Np;
function $p() {
  if (Np) return Kr;
  Np = 1;
  var e =
    (Kr && Kr.__importDefault) ||
    function (a) {
      return a && a.__esModule ? a : { default: a };
    };
  Object.defineProperty(Kr, "__esModule", { value: !0 });
  const r = e(jv()),
    n = Sv(),
    t = Iv(),
    o = o5(),
    s = I_();
  class i {
    constructor(c = {}) {
      const { allowedDomains: u = null, debug: l = !1 } = c;
      ((this.communicator = new r.default(u, l)),
        (this.eth = new t.Eth(this.communicator)),
        (this.txs = new n.TXs(this.communicator)),
        (this.safe = new o.Safe(this.communicator)),
        (this.wallet = new s.Wallet(this.communicator)));
    }
  }
  return ((Kr.default = i), Kr);
}
var zp;
function i5() {
  return (
    zp ||
      ((zp = 1),
      (function (e) {
        var r =
            (xt && xt.__createBinding) ||
            (Object.create
              ? function (i, a, c, u) {
                  u === void 0 && (u = c);
                  var l = Object.getOwnPropertyDescriptor(a, c);
                  ((!l || ("get" in l ? !a.__esModule : l.writable || l.configurable)) &&
                    (l = {
                      enumerable: !0,
                      get: function () {
                        return a[c];
                      },
                    }),
                    Object.defineProperty(i, u, l));
                }
              : function (i, a, c, u) {
                  (u === void 0 && (u = c), (i[u] = a[c]));
                }),
          n =
            (xt && xt.__exportStar) ||
            function (i, a) {
              for (var c in i) c !== "default" && !Object.prototype.hasOwnProperty.call(a, c) && r(a, i, c);
            },
          t =
            (xt && xt.__importDefault) ||
            function (i) {
              return i && i.__esModule ? i : { default: i };
            };
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.getSDKVersion = void 0));
        const o = t($p());
        ((e.default = o.default), n($p(), e), n(Kd(), e), n(Fr(), e), n(Vp(), e));
        var s = Gp();
        (Object.defineProperty(e, "getSDKVersion", {
          enumerable: !0,
          get: function () {
            return s.getSDKVersion;
          },
        }),
          n(Zd(), e));
      })(xt)),
    xt
  );
}
var kr = {},
  Up;
function a5() {
  if (Up) return kr;
  ((Up = 1), Object.defineProperty(kr, "__esModule", { value: !0 }), (kr.numberToHex = kr.getLowerCase = void 0));
  function e(n) {
    return n && n.toLowerCase();
  }
  kr.getLowerCase = e;
  function r(n) {
    return `0x${n.toString(16)}`;
  }
  return ((kr.numberToHex = r), kr);
}
var Lp;
function s5() {
  if (Lp) return On;
  ((Lp = 1), Object.defineProperty(On, "__esModule", { value: !0 }), (On.SafeAppProvider = void 0));
  const e = i5(),
    r = yv(),
    n = a5();
  class t extends r.EventEmitter {
    constructor(s, i) {
      (super(), (this.submittedTxs = new Map()), (this.safe = s), (this.sdk = i));
    }
    async connect() {
      this.emit("connect", { chainId: this.chainId });
    }
    async disconnect() {}
    get chainId() {
      return this.safe.chainId;
    }
    async request(s) {
      var c, u, l, f;
      const { method: i, params: a = [] } = s;
      switch (i) {
        case "eth_accounts":
          return [this.safe.safeAddress];
        case "net_version":
        case "eth_chainId":
          return (0, n.numberToHex)(this.chainId);
        case "personal_sign": {
          const [v, _] = a;
          if (this.safe.safeAddress.toLowerCase() !== _.toLowerCase())
            throw new Error("The address or message hash is invalid");
          const E = await this.sdk.txs.signMessage(v);
          return ("signature" in E ? E.signature : void 0) || "0x";
        }
        case "eth_sign": {
          const [v, _] = a;
          if (this.safe.safeAddress.toLowerCase() !== v.toLowerCase() || !_.startsWith("0x"))
            throw new Error("The address or message hash is invalid");
          const E = await this.sdk.txs.signMessage(_);
          return ("signature" in E ? E.signature : void 0) || "0x";
        }
        case "eth_signTypedData":
        case "eth_signTypedData_v4": {
          const [v, _] = a,
            E = typeof _ == "string" ? JSON.parse(_) : _;
          if (this.safe.safeAddress.toLowerCase() !== v.toLowerCase()) throw new Error("The address is invalid");
          const P = await this.sdk.txs.signTypedMessage(E);
          return ("signature" in P ? P.signature : void 0) || "0x";
        }
        case "eth_sendTransaction":
          const m = { ...a[0], value: a[0].value || "0", data: a[0].data || "0x" };
          typeof m.gas == "string" && m.gas.startsWith("0x") && (m.gas = parseInt(m.gas, 16));
          const g = await this.sdk.txs.send({ txs: [m], params: { safeTxGas: m.gas } });
          return (
            this.submittedTxs.set(g.safeTxHash, {
              from: this.safe.safeAddress,
              hash: g.safeTxHash,
              gas: 0,
              gasPrice: "0x00",
              nonce: 0,
              input: m.data,
              value: m.value,
              to: m.to,
              blockHash: null,
              blockNumber: null,
              transactionIndex: null,
            }),
            g.safeTxHash
          );
        case "eth_blockNumber":
          return (await this.sdk.eth.getBlockByNumber(["latest"])).number;
        case "eth_getBalance":
          return this.sdk.eth.getBalance([(0, n.getLowerCase)(a[0]), a[1]]);
        case "eth_getCode":
          return this.sdk.eth.getCode([(0, n.getLowerCase)(a[0]), a[1]]);
        case "eth_getTransactionCount":
          return this.sdk.eth.getTransactionCount([(0, n.getLowerCase)(a[0]), a[1]]);
        case "eth_getStorageAt":
          return this.sdk.eth.getStorageAt([(0, n.getLowerCase)(a[0]), a[1], a[2]]);
        case "eth_getBlockByNumber":
          return this.sdk.eth.getBlockByNumber([a[0], a[1]]);
        case "eth_getBlockByHash":
          return this.sdk.eth.getBlockByHash([a[0], a[1]]);
        case "eth_getTransactionByHash":
          let b = a[0];
          try {
            b = (await this.sdk.txs.getBySafeTxHash(b)).txHash || b;
          } catch {}
          return this.submittedTxs.has(b)
            ? this.submittedTxs.get(b)
            : this.sdk.eth.getTransactionByHash([b]).then((v) => (v && (v.hash = a[0]), v));
        case "eth_getTransactionReceipt": {
          let v = a[0];
          try {
            v = (await this.sdk.txs.getBySafeTxHash(v)).txHash || v;
          } catch {}
          return this.sdk.eth.getTransactionReceipt([v]).then((_) => (_ && (_.transactionHash = a[0]), _));
        }
        case "eth_estimateGas":
          return this.sdk.eth.getEstimateGas(a[0]);
        case "eth_call":
          return this.sdk.eth.call([a[0], a[1]]);
        case "eth_getLogs":
          return this.sdk.eth.getPastLogs([a[0]]);
        case "eth_gasPrice":
          return this.sdk.eth.getGasPrice();
        case "wallet_getPermissions":
          return this.sdk.wallet.getPermissions();
        case "wallet_requestPermissions":
          return this.sdk.wallet.requestPermissions(a[0]);
        case "safe_setSettings":
          return this.sdk.eth.setSafeSettings([a[0]]);
        case "wallet_sendCalls": {
          const { from: v, calls: _, chainId: E } = a[0];
          if (E !== (0, n.numberToHex)(this.chainId)) throw new Error(`Safe is not on chain ${E}`);
          if (v !== this.safe.safeAddress) throw Error("Invalid from address");
          const P = _.map((p, y) => {
              if (!p.to) throw new Error(`Invalid call #${y}: missing "to" field`);
              return { to: p.to, data: p.data ?? "0x", value: p.value ?? (0, n.numberToHex)(0) };
            }),
            { safeTxHash: d } = await this.sdk.txs.send({ txs: P });
          return { id: d };
        }
        case "wallet_getCallsStatus": {
          const v = a[0],
            _ = {
              [e.TransactionStatus.AWAITING_CONFIRMATIONS]: 100,
              [e.TransactionStatus.AWAITING_EXECUTION]: 100,
              [e.TransactionStatus.SUCCESS]: 200,
              [e.TransactionStatus.CANCELLED]: 400,
              [e.TransactionStatus.FAILED]: 500,
            },
            E = await this.sdk.txs.getBySafeTxHash(v),
            P = { version: "1.0", id: v, chainId: (0, n.numberToHex)(this.chainId), status: _[E.txStatus] };
          if (!E.txHash) return P;
          const d = await this.sdk.eth.getTransactionReceipt([E.txHash]);
          if (!d) return P;
          const j =
              ((u = (c = E.txData) == null ? void 0 : c.dataDecoded) == null ? void 0 : u.method) !== "multiSend"
                ? 1
                : (((f = (l = E.txData.dataDecoded.parameters) == null ? void 0 : l[0].valueDecoded) == null
                    ? void 0
                    : f.length) ?? 1),
            p = Number(d.blockNumber),
            y = Number(d.gasUsed);
          return (
            (P.receipts = Array(j).fill({
              logs: d.logs,
              status: (0, n.numberToHex)(E.txStatus === e.TransactionStatus.SUCCESS ? 1 : 0),
              blockHash: d.blockHash,
              blockNumber: (0, n.numberToHex)(p),
              gasUsed: (0, n.numberToHex)(y),
              transactionHash: E.txHash,
            })),
            P
          );
        }
        case "wallet_showCallsStatus":
          throw new Error(`"${s.method}" not supported`);
        case "wallet_getCapabilities":
          return { [(0, n.numberToHex)(this.chainId)]: { atomicBatch: { supported: !0 } } };
        default:
          throw Error(`"${s.method}" not implemented`);
      }
    }
    send(s, i) {
      (s || i("Undefined request"),
        this.request(s)
          .then((a) => i(null, { jsonrpc: "2.0", id: s.id, result: a }))
          .catch((a) => i(a, null)));
    }
  }
  return ((On.SafeAppProvider = t), On);
}
var Dp;
function c5() {
  return (
    Dp ||
      ((Dp = 1),
      (function (e) {
        (Object.defineProperty(e, "__esModule", { value: !0 }), (e.SafeAppProvider = void 0));
        var r = s5();
        Object.defineProperty(e, "SafeAppProvider", {
          enumerable: !0,
          get: function () {
            return r.SafeAppProvider;
          },
        });
      })(pd)),
    pd
  );
}
var R_ = c5();
const u5 = mv(R_),
  b5 = pv({ __proto__: null, default: u5 }, [R_]);
export { b5 as i };
