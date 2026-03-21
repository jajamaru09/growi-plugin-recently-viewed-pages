const E="recently-viewed";let d=null;function $(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=E,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",()=>{d==null||d()}),t}function m(t){d=t;const e=document.getElementById(E);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const r=$();return n.insertAdjacentElement("afterend",r),r}const y="growi-recently-viewed-pages",h=30;function M(){try{const t=localStorage.getItem(y);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function D(t,e){try{const n=M().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>h&&(n.length=h),localStorage.setItem(y,JSON.stringify(n))}catch{}}function x(){try{localStorage.removeItem(y)}catch{}}function L(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),o=Math.floor(i/60),a=Math.floor(o/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(o<2)return"1 hour";if(o<24)return`${o} hours`;if(a<2)return"1 day";if(a<30)return`${a} days`;const s=new Date(t),u=s.getFullYear(),f=String(s.getMonth()+1).padStart(2,"0"),T=String(s.getDate()).padStart(2,"0"),I=String(s.getHours()).padStart(2,"0"),A=String(s.getMinutes()).padStart(2,"0");return`${u}/${f}/${T} ${I}:${A}`}const P={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function v(t){return t.replace(/[&<>"']/g,e=>P[e])}const p="grw-recently-viewed-modal";function k(t){try{return decodeURIComponent(t)}catch{return t}}function B(t,e){const n=t.split("/").filter(Boolean);let r="";const i=n.map((s,u)=>{r+="/"+s;const f=u===n.length-1?e:k(s);return`<a class="grw-rv-link" data-rv-href="${v(r)}">${v(f)}</a>`}),o='<a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span></a>',a='<span class="grw-rv-sep">/</span>';return o+a+i.join(a)}function C(t){const e=B(t.path,t.title),n=L(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex align-items-baseline ms-2">
        <div class="flex-grow-1 grw-rv-full-path">${e}</div>
        <div class="grw-formatted-distance-date ms-3 text-nowrap">
          <span>${v(n)}</span>
        </div>
      </div>
    </li>
  `}function b(){const t=M();return t.length===0?'<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>':`
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${t.map(C).join("")}
      </ul>
    </div>
  `}function H(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function _(){let t=document.getElementById(p);return t||(t=document.createElement("div"),t.id=p,t.className="grw-rv-modal-backdrop",t.innerHTML=`
      <div class="grw-rv-modal">
        <div class="grw-rv-modal-header">
          <h5 class="fw-bold mb-0">閲覧履歴</h5>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary grw-btn-clear-history" title="履歴をクリア">
              <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">delete_sweep</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary grw-rv-modal-close" title="閉じる">
              <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">close</span>
            </button>
          </div>
        </div>
        <div class="grw-rv-modal-body"></div>
      </div>
    `,document.body.appendChild(t)),t}function w(){const t=_(),e=t.querySelector(".grw-rv-modal-body");e.innerHTML=b(),t.classList.add("active"),t.onclick=n=>{const r=n.target;if(r===t){g();return}if(r.closest(".grw-rv-modal-close")){g();return}if(r.closest(".grw-btn-clear-history")){x(),e.innerHTML=b();return}const i=r.closest(".grw-rv-link");if(i){n.preventDefault();const o=i.getAttribute("data-rv-href");o&&(g(),H(o))}}}function g(){const t=document.getElementById(p);t&&t.classList.remove("active")}const O=["/_api/","/_search","/admin","/me","/trash"];function R(t){return t==="/"?!0:O.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function N(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function U(){const t=document.title;if(t){const e=t.lastIndexOf(" - "),n=t.lastIndexOf(" | "),r=Math.max(e,n);if(r>0){const i=t.substring(0,r).trim();if(i&&!/^[0-9a-f]{24}$/i.test(i))return i}}return N(window.location.pathname)}function S(){const t=window.location.pathname;if(R(t))return;const e=U();D(t,e)}let l=null;function j(){setTimeout(S,500),window.navigation&&(l=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(S,500)},{signal:l.signal}))}function z(){l&&(l.abort(),l=null)}let c=null;function F(){m(()=>w())||setTimeout(()=>m(()=>w()),1e3)}const W=()=>{F(),j(),window.navigation&&(c=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>m(()=>w()),{signal:c.signal}))},X=()=>{z(),c&&(c.abort(),c=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:W,deactivate:X};
//# sourceMappingURL=client-entry-CtLe-eGe.js.map
