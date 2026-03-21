const f="recently-viewed";let m=null,s=null;function S(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=f,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",e=>{e.stopPropagation(),m==null||m()}),t}function k(){if(document.getElementById(f))return;const t=document.getElementById("in-app-notification");if(!t)return;const e=S();t.insertAdjacentElement("afterend",e)}function C(t){m=t;const e=document.getElementById("in-app-notification");if(!e)return null;if(document.getElementById(f))return document.getElementById(f);const n=S();e.insertAdjacentElement("afterend",n);const r=e.closest(".grw-sidebar-nav-primary-container");return r&&!s&&(s=new MutationObserver(()=>{k()}),s.observe(r,{childList:!0,subtree:!0})),n}function y(t){const e=document.getElementById(f);if(e)if(t){const n=e.parentElement;n&&n.querySelectorAll("button.btn").forEach(r=>r.classList.remove("active")),e.classList.add("active")}else e.classList.remove("active")}function x(){s&&(s.disconnect(),s=null)}const h="growi-recently-viewed-pages",b=30;function I(){try{const t=localStorage.getItem(h);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function D(t,e){try{const n=I().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>b&&(n.length=b),localStorage.setItem(h,JSON.stringify(n))}catch{}}function H(){try{localStorage.removeItem(h)}catch{}}function _(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),o=Math.floor(i/60),c=Math.floor(o/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(o<2)return"1 hour";if(o<24)return`${o} hours`;if(c<2)return"1 day";if(c<30)return`${c} days`;const l=new Date(t),A=l.getFullYear(),L=String(l.getMonth()+1).padStart(2,"0"),P=String(l.getDate()).padStart(2,"0"),T=String(l.getHours()).padStart(2,"0"),M=String(l.getMinutes()).padStart(2,"0");return`${A}/${L}/${P} ${T}:${M}`}const O={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function d(t){return t.replace(/[&<>"']/g,e=>O[e])}const w="grw-recently-viewed-panel";function j(t){try{return decodeURIComponent(t)}catch{return t}}function q(t){const e=t.split("/").filter(Boolean);if(e.length<=1)return"";const n=e.slice(0,-1);let r="";return`<span class="path-segment"><a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${n.map(o=>{r+="/"+o;const c=j(o);return`<a class="page-segment grw-rv-link" data-rv-href="${d(r)}">${d(c)}</a>`}).join('<span class="separator" style="margin:0 0.2em">/</span>')}`}function R(t){const e=q(t.path),n=_(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${e?`<div class="col-12"><div style="font-size:0.85em;color:#888">${e}</div></div>`:""}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment grw-rv-link" data-rv-href="${d(t.path)}">${d(t.title)}</a>
            </h6>
            <div class="col-12">
              <div class="d-flex justify-content-end">
                <div class="grw-formatted-distance-date mt-auto">
                  <span>${d(n)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  `}function N(){const t=I(),e=`
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
    `;const n=t.map(R).join("");return`
    <div class="px-3">
      ${e}
      <div class="grw-recent-changes">
        <ul class="list-group list-group-flush">
          ${n}
        </ul>
      </div>
    </div>
  `}function U(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function F(){let t=document.getElementById(w);if(!t){t=document.createElement("div"),t.id=w,t.className="grw-recently-viewed-panel d-none",t.style.cssText="height:100%;overflow-y:auto;";const e=document.querySelector(".grw-sidebar-contents");e&&e.parentElement&&e.parentElement.appendChild(t)}return t}function B(){const t=F(),e=document.querySelector(".grw-sidebar-contents");t.innerHTML=N(),t.classList.remove("d-none"),e&&e.classList.add("d-none"),t.onclick=n=>{const r=n.target;if(r.closest(".grw-btn-clear-history")){H(),B();return}const i=r.closest(".grw-rv-link");if(i){n.preventDefault();const o=i.getAttribute("data-rv-href");o&&U(o)}}}function $(){const t=document.getElementById(w),e=document.querySelector(".grw-sidebar-contents");t&&t.classList.add("d-none"),e&&e.classList.remove("d-none")}const W=["/_api/","/_search","/admin","/me","/trash"];function X(t){return t==="/"?!0:W.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function z(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function G(){const t=document.title;if(t){const e=t.replace(/\s*[-|]\s*[^-|]+$/,"").trim();if(e)return e}return z(window.location.pathname)}function p(){const t=window.location.pathname;if(X(t))return;const e=G();D(t,e)}let v=null,g="";function J(){g=window.location.pathname,setTimeout(p,500),window.addEventListener("popstate",()=>{setTimeout(p,500)}),v=setInterval(()=>{const t=window.location.pathname;t!==g&&(g=t,setTimeout(p,500))},1e3)}function Y(){window.removeEventListener("popstate",p),v!==null&&(clearInterval(v),v=null)}let u=!1,a=null;function K(){if(u){y(!1),$(),u=!1;return}u=!0,y(!0),B()}function E(){const t=C(K);if(!t)return;const e=t.parentElement;e&&e.addEventListener("click",n=>{const i=n.target.closest("button");i&&i.id!=="recently-viewed"&&u&&(u=!1,y(!1),$())})}function V(){if(document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")){E();return}a=new MutationObserver((e,n)=>{document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")&&(n.disconnect(),a=null,E())}),a.observe(document.body,{childList:!0,subtree:!0})}const Q=()=>{V(),J()},Z=()=>{Y(),x(),a&&(a.disconnect(),a=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:Q,deactivate:Z};
//# sourceMappingURL=client-entry-C4pKaNHV.js.map
