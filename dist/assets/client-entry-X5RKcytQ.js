const v="recently-viewed";let f=null;function P(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=v,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",e=>{e.stopPropagation(),f==null||f()}),t}function E(t){f=t;const e=document.getElementById(v);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const r=P();return n.insertAdjacentElement("afterend",r),r}function g(t){const e=document.getElementById(v);if(e)if(t){const n=e.parentElement;n&&n.querySelectorAll("button.btn").forEach(r=>r.classList.remove("active")),e.classList.add("active")}else e.classList.remove("active")}const p="growi-recently-viewed-pages",y=30;function S(){try{const t=localStorage.getItem(p);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function k(t,e){try{const n=S().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>y&&(n.length=y),localStorage.setItem(p,JSON.stringify(n))}catch{}}function M(){try{localStorage.removeItem(p)}catch{}}function x(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),s=Math.floor(i/60),a=Math.floor(s/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(s<2)return"1 hour";if(s<24)return`${s} hours`;if(a<2)return"1 day";if(a<30)return`${a} days`;const c=new Date(t),I=c.getFullYear(),C=String(c.getMonth()+1).padStart(2,"0"),B=String(c.getDate()).padStart(2,"0"),L=String(c.getHours()).padStart(2,"0"),T=String(c.getMinutes()).padStart(2,"0");return`${I}/${C}/${B} ${L}:${T}`}const D={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function l(t){return t.replace(/[&<>"']/g,e=>D[e])}const m="grw-recently-viewed-panel";function H(t){try{return decodeURIComponent(t)}catch{return t}}function _(t){const e=t.split("/").filter(Boolean);if(e.length<=1)return"";const n=e.slice(0,-1);let r="";return`<span class="path-segment"><a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${n.map(s=>{r+="/"+s;const a=H(s);return`<a class="page-segment grw-rv-link" data-rv-href="${l(r)}">${l(a)}</a>`}).join('<span class="separator" style="margin:0 0.2em">/</span>')}`}function q(t){const e=_(t.path),n=x(t.viewedAt);return`
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
  `}function N(){const t=S(),e=`
    <div class="grw-sidebar-content-header py-4 d-flex">
      <h3 class="fs-6 fw-bold mb-0 text-nowrap">閲覧履歴</h3>
      <button type="button" class="btn btn-sm ms-auto py-0 grw-btn-clear-history" title="履歴をクリア">
        <span class="material-symbols-outlined">delete_sweep</span>
      </button>
    </div>
  `;if(t.length===0)return`
      <div class="px-3">
        ${e}
        <div class="grw-recently-viewed-empty">閲覧履歴はありません</div>
      </div>
    `;const n=t.map(q).join("");return`
    <div class="px-3">
      ${e}
      <div class="grw-recent-changes">
        <ul class="list-group list-group-flush">
          ${n}
        </ul>
      </div>
    </div>
  `}function R(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function O(){let t=document.getElementById(m);if(!t){t=document.createElement("div"),t.id=m,t.className="grw-recently-viewed-panel d-none",t.style.cssText="height:100%;overflow-y:auto;";const e=document.querySelector(".grw-sidebar-contents");e&&e.parentElement&&e.parentElement.appendChild(t)}return t}function w(){const t=O(),e=document.querySelector(".grw-sidebar-contents");t.innerHTML=N(),t.classList.remove("d-none"),e&&e.classList.add("d-none"),t.onclick=n=>{const r=n.target;if(r.closest(".grw-btn-clear-history")){M(),w();return}const i=r.closest(".grw-rv-link");if(i){n.preventDefault();const s=i.getAttribute("data-rv-href");s&&R(s)}}}function $(){const t=document.getElementById(m),e=document.querySelector(".grw-sidebar-contents");t&&t.classList.add("d-none"),e&&e.classList.remove("d-none")}const j=["/_api/","/_search","/admin","/me","/trash"];function U(t){return t==="/"?!0:j.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function F(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function W(){const t=document.title;if(t){const e=t.replace(/\s*[-|]\s*[^-|]+$/,"").trim();if(e)return e}return F(window.location.pathname)}function h(){const t=window.location.pathname;if(U(t))return;const e=W();k(t,e)}let d=null;function X(){setTimeout(h,500),window.navigation&&(d=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(h,500)},{signal:d.signal}))}function z(){d&&(d.abort(),d=null)}let o=!1,u=null;function A(){if(o){g(!1),$(),o=!1;return}o=!0,g(!0),w()}function b(){const t=E(A);if(!t)return;const e=t.parentElement;e&&e.addEventListener("click",n=>{const i=n.target.closest("button");i&&i.id!=="recently-viewed"&&o&&(o=!1,g(!1),$())})}function G(){E(A),o&&w()}function J(){if(document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")){b();return}new MutationObserver((n,r)=>{document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")&&(r.disconnect(),b())}).observe(document.body,{childList:!0,subtree:!0})}const Y=()=>{J(),X(),window.navigation&&(u=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>G(),{signal:u.signal}))},K=()=>{z(),u&&(u.abort(),u=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:Y,deactivate:K};
//# sourceMappingURL=client-entry-X5RKcytQ.js.map
