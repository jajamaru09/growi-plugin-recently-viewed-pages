const u="recently-viewed";function B(t){const e=document.getElementById("in-app-notification");if(!e)return null;if(document.getElementById(u))return document.getElementById(u);const n=document.createElement("button");return n.type="button",n.className="btn btn-primary m-1 rounded",n.id=u,n.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',n.addEventListener("click",r=>{r.stopPropagation(),t()}),e.insertAdjacentElement("afterend",n),n}function g(t){const e=document.getElementById(u);if(e)if(t){const n=e.parentElement;n&&n.querySelectorAll("button.btn").forEach(r=>r.classList.remove("active")),e.classList.add("active")}else e.classList.remove("active")}const v="growi-recently-viewed-pages",h=30;function w(){try{const t=localStorage.getItem(v);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function M(t,e){try{const n=w().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>h&&(n.length=h),localStorage.setItem(v,JSON.stringify(n))}catch{}}function P(){try{localStorage.removeItem(v)}catch{}}function C(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),s=Math.floor(i/60),o=Math.floor(s/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(s<2)return"1 hour";if(s<24)return`${s} hours`;if(o<2)return"1 day";if(o<30)return`${o} days`;const c=new Date(t),S=c.getFullYear(),E=String(c.getMonth()+1).padStart(2,"0"),I=String(c.getDate()).padStart(2,"0"),$=String(c.getHours()).padStart(2,"0"),A=String(c.getMinutes()).padStart(2,"0");return`${S}/${E}/${I} ${$}:${A}`}const L={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function l(t){return t.replace(/[&<>"']/g,e=>L[e])}function x(t){const e=t.split("/").filter(Boolean);if(e.length<=1)return"";const n=e.slice(0,-1);let r="";return`<span class="path-segment"><a href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${n.map(s=>{r+="/"+encodeURIComponent(decodeURIComponent(s));const o=decodeURIComponent(s);return`<a class="page-segment" href="${l(r)}">${l(o)}</a>`}).join('<span class="separator" style="margin:0 0.2em">/</span>')}`}function H(t){const e=x(t.path),n=C(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${e?`<div class="col-12"><div style="font-size:0.85em;color:#888">${e}</div></div>`:""}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment" href="${l(t.path)}">${l(t.title)}</a>
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
  `}function T(){const t=w(),e=`
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
    `;const n=t.map(H).join("");return`
    <div class="px-3">
      ${e}
      <div class="grw-recent-changes">
        <ul class="list-group list-group-flush">
          ${n}
        </ul>
      </div>
    </div>
  `}function b(t){const e=()=>b(t);t.innerHTML=T();const n=t.querySelector(".grw-btn-clear-history");n&&n.addEventListener("click",()=>{P(),e()})}const k=["/_api/","/_search","/admin","/me","/trash"];function _(t){return t==="/"?!0:k.some(e=>t.startsWith(e))}function D(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function f(){const t=window.location.pathname;if(_(t))return;const e=D(t);M(t,e)}let m=null,p="";function R(){p=window.location.pathname,f(),window.addEventListener("popstate",f),m=setInterval(()=>{const t=window.location.pathname;t!==p&&(p=t,f())},1e3)}function j(){window.removeEventListener("popstate",f),m!==null&&(clearInterval(m),m=null)}let d=!1,a=null;function q(){return document.querySelector(".grw-sidebar-contents")}function U(){const t=q();if(t){if(d){g(!1),d=!1;return}d=!0,g(!0),b(t)}}function y(){const t=B(U);if(!t)return;const e=t.parentElement;e&&e.addEventListener("click",n=>{const i=n.target.closest("button");i&&i.id!=="recently-viewed"&&d&&(d=!1,g(!1))})}function O(){if(document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")){y();return}a=new MutationObserver((e,n)=>{document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")&&(n.disconnect(),a=null,y())}),a.observe(document.body,{childList:!0,subtree:!0})}const N=()=>{O(),R()},F=()=>{j(),a&&(a.disconnect(),a=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:N,deactivate:F};
//# sourceMappingURL=client-entry-B0iJ0KuL.js.map
