const b="recently-viewed";let d=null;function $(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=b,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",()=>{d==null||d()}),t}function f(t){d=t;const e=document.getElementById(b);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const r=$();return n.insertAdjacentElement("afterend",r),r}const p="growi-recently-viewed-pages",w=30;function S(){try{const t=localStorage.getItem(p);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function D(t,e){try{const n=S().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>w&&(n.length=w),localStorage.setItem(p,JSON.stringify(n))}catch{}}function x(){try{localStorage.removeItem(p)}catch{}}function L(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),o=Math.floor(i/60),a=Math.floor(o/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(o<2)return"1 hour";if(o<24)return`${o} hours`;if(a<2)return"1 day";if(a<30)return`${a} days`;const s=new Date(t),E=s.getFullYear(),M=String(s.getMonth()+1).padStart(2,"0"),T=String(s.getDate()).padStart(2,"0"),I=String(s.getHours()).padStart(2,"0"),A=String(s.getMinutes()).padStart(2,"0");return`${E}/${M}/${T} ${I}:${A}`}const P={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function g(t){return t.replace(/[&<>"']/g,e=>P[e])}const m="grw-recently-viewed-modal";function k(t){try{return decodeURIComponent(t)}catch{return t}}function B(t){const e=t.split("/").filter(Boolean);let n="";const r=e.map(a=>{n+="/"+a;const s=k(a);return`<a class="grw-rv-link" data-rv-href="${g(n)}">${g(s)}</a>`}),i='<a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span></a>',o='<span class="grw-rv-sep">/</span>';return i+o+r.join(o)}function C(t){const e=B(t.path),n=L(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex align-items-baseline ms-2">
        <div class="flex-grow-1 grw-rv-full-path">${e}</div>
        <div class="grw-formatted-distance-date ms-3 text-nowrap">
          <span>${g(n)}</span>
        </div>
      </div>
    </li>
  `}function y(){const t=S();return t.length===0?'<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>':`
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${t.map(C).join("")}
      </ul>
    </div>
  `}function H(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function _(){let t=document.getElementById(m);return t||(t=document.createElement("div"),t.id=m,t.className="grw-rv-modal-backdrop",t.innerHTML=`
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
    `,document.body.appendChild(t)),t}function v(){const t=_(),e=t.querySelector(".grw-rv-modal-body");e.innerHTML=y(),t.classList.add("active"),t.onclick=n=>{const r=n.target;if(r===t){u();return}if(r.closest(".grw-rv-modal-close")){u();return}if(r.closest(".grw-btn-clear-history")){x(),e.innerHTML=y();return}const i=r.closest(".grw-rv-link");if(i){n.preventDefault();const o=i.getAttribute("data-rv-href");o&&(u(),H(o))}}}function u(){const t=document.getElementById(m);t&&t.classList.remove("active")}const O=["/_api/","/_search","/admin","/me","/trash"];function R(t){return t==="/"?!0:O.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function N(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function U(){const t=document.title;if(t){const e=t.lastIndexOf(" - "),n=t.lastIndexOf(" | "),r=Math.max(e,n);if(r>0){const i=t.substring(0,r).trim();if(i&&!/^[0-9a-f]{24}$/i.test(i))return i}}return N(window.location.pathname)}function h(){const t=window.location.pathname;if(R(t))return;const e=U();D(t,e)}let l=null;function j(){setTimeout(h,500),window.navigation&&(l=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(h,500)},{signal:l.signal}))}function z(){l&&(l.abort(),l=null)}let c=null;function F(){f(()=>v())||setTimeout(()=>f(()=>v()),1e3)}const W=()=>{F(),j(),window.navigation&&(c=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>f(()=>v()),{signal:c.signal}))},X=()=>{z(),c&&(c.abort(),c=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:W,deactivate:X};
//# sourceMappingURL=client-entry-BYIbshk6.js.map
