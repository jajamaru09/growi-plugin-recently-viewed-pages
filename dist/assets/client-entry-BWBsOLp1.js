const b="recently-viewed";let u=null;function A(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=b,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",()=>{u==null||u()}),t}function g(t){u=t;const e=document.getElementById(b);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const r=A();return n.insertAdjacentElement("afterend",r),r}const p="growi-recently-viewed-pages",w=30;function S(){try{const t=localStorage.getItem(p);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function x(t,e){try{const n=S().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>w&&(n.length=w),localStorage.setItem(p,JSON.stringify(n))}catch{}}function D(){try{localStorage.removeItem(p)}catch{}}function k(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),s=Math.floor(i/60),o=Math.floor(s/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(s<2)return"1 hour";if(s<24)return`${s} hours`;if(o<2)return"1 day";if(o<30)return`${o} days`;const a=new Date(t),E=a.getFullYear(),M=String(a.getMonth()+1).padStart(2,"0"),$=String(a.getDate()).padStart(2,"0"),T=String(a.getHours()).padStart(2,"0"),I=String(a.getMinutes()).padStart(2,"0");return`${E}/${M}/${$} ${T}:${I}`}const H={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function l(t){return t.replace(/[&<>"']/g,e=>H[e])}const m="grw-recently-viewed-modal";function B(t){try{return decodeURIComponent(t)}catch{return t}}function L(t){const e=t.split("/").filter(Boolean);if(e.length<=1)return"";const n=e.slice(0,-1);let r="";return`<span class="path-segment"><a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${n.map(s=>{r+="/"+s;const o=B(s);return`<a class="page-segment grw-rv-link" data-rv-href="${l(r)}">${l(o)}</a>`}).join('<span class="separator" style="margin:0 0.2em">/</span>')}`}function P(t){const e=L(t.path),n=k(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${e?`<div class="col-12"><div style="font-size:0.85em;color:#888">${e}</div></div>`:""}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment grw-rv-link" data-rv-href="${l(t.path)}">${l(t.title)}</a>
            </h6>
            <div class="col-12">
              <div class="d-flex justify-content-end">
                <div class="grw-formatted-distance-date mt-auto">
                  <span>${l(n)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  `}function y(){const t=S();return t.length===0?'<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>':`
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${t.map(P).join("")}
      </ul>
    </div>
  `}function C(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function _(){let t=document.getElementById(m);return t||(t=document.createElement("div"),t.id=m,t.className="grw-rv-modal-backdrop",t.innerHTML=`
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
    `,document.body.appendChild(t)),t}function v(){const t=_(),e=t.querySelector(".grw-rv-modal-body");e.innerHTML=y(),t.classList.add("active"),t.onclick=n=>{const r=n.target;if(r===t){f();return}if(r.closest(".grw-rv-modal-close")){f();return}if(r.closest(".grw-btn-clear-history")){D(),e.innerHTML=y();return}const i=r.closest(".grw-rv-link");if(i){n.preventDefault();const s=i.getAttribute("data-rv-href");s&&(f(),C(s))}}}function f(){const t=document.getElementById(m);t&&t.classList.remove("active")}const O=["/_api/","/_search","/admin","/me","/trash"];function R(t){return t==="/"?!0:O.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function j(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function N(){const t=document.title;if(t){const e=t.lastIndexOf(" - "),n=t.lastIndexOf(" | "),r=Math.max(e,n);if(r>0){const i=t.substring(0,r).trim();if(i&&!/^[0-9a-f]{24}$/i.test(i))return i}}return j(window.location.pathname)}function h(){const t=window.location.pathname;if(R(t))return;const e=N();x(t,e)}let c=null;function U(){setTimeout(h,500),window.navigation&&(c=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(h,500)},{signal:c.signal}))}function z(){c&&(c.abort(),c=null)}let d=null;function W(){g(()=>v())||setTimeout(()=>g(()=>v()),1e3)}const X=()=>{W(),U(),window.navigation&&(d=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>g(()=>v()),{signal:d.signal}))},q=()=>{z(),d&&(d.abort(),d=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:X,deactivate:q};
//# sourceMappingURL=client-entry-BWBsOLp1.js.map
