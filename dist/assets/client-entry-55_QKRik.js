const f="recently-viewed";function B(t){const e=document.getElementById("in-app-notification");if(!e)return null;if(document.getElementById(f))return document.getElementById(f);const n=document.createElement("button");return n.type="button",n.className="btn btn-primary m-1 rounded",n.id=f,n.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',n.addEventListener("click",r=>{r.stopPropagation(),t()}),e.insertAdjacentElement("afterend",n),n}function v(t){const e=document.getElementById(f);if(e)if(t){const n=e.parentElement;n&&n.querySelectorAll("button.btn").forEach(r=>r.classList.remove("active")),e.classList.add("active")}else e.classList.remove("active")}const h="growi-recently-viewed-pages",y=30;function b(){try{const t=localStorage.getItem(h);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function L(t,e){try{const n=b().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>y&&(n.length=y),localStorage.setItem(h,JSON.stringify(n))}catch{}}function C(){try{localStorage.removeItem(h)}catch{}}function H(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),s=Math.floor(i/60),o=Math.floor(s/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(s<2)return"1 hour";if(s<24)return`${s} hours`;if(o<2)return"1 day";if(o<30)return`${o} days`;const c=new Date(t),E=c.getFullYear(),I=String(c.getMonth()+1).padStart(2,"0"),$=String(c.getDate()).padStart(2,"0"),M=String(c.getHours()).padStart(2,"0"),A=String(c.getMinutes()).padStart(2,"0");return`${E}/${I}/${$} ${M}:${A}`}const P={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function d(t){return t.replace(/[&<>"']/g,e=>P[e])}function T(t){const e=t.split("/").filter(Boolean);if(e.length<=1)return"";const n=e.slice(0,-1);let r="";return`<span class="path-segment"><a href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${n.map(s=>{r+="/"+encodeURIComponent(decodeURIComponent(s));const o=decodeURIComponent(s);return`<a class="page-segment" href="${d(r)}">${d(o)}</a>`}).join('<span class="separator" style="margin:0 0.2em">/</span>')}`}function k(t){const e=T(t.path),n=H(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${e?`<div class="col-12"><div style="font-size:0.85em;color:#888">${e}</div></div>`:""}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment" href="${d(t.path)}">${d(t.title)}</a>
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
  `}function _(){const t=b(),e=`
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
    `;const n=t.map(k).join("");return`
    <div class="px-3">
      ${e}
      <div class="grw-recent-changes">
        <ul class="list-group list-group-flush">
          ${n}
        </ul>
      </div>
    </div>
  `}function S(t){const e=()=>S(t);t.innerHTML=_();const n=t.querySelector(".grw-btn-clear-history");n&&n.addEventListener("click",()=>{C(),e()})}const x=["/_api/","/_search","/admin","/me","/trash"];function D(t){return t==="/"?!0:x.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function R(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function m(){const t=window.location.pathname;if(D(t))return;const e=R(t);L(t,e)}let p=null,g="";function j(){g=window.location.pathname,m(),window.addEventListener("popstate",m),p=setInterval(()=>{const t=window.location.pathname;t!==g&&(g=t,m())},1e3)}function q(){window.removeEventListener("popstate",m),p!==null&&(clearInterval(p),p=null)}let u=!1,a=null,l=null;function U(){return document.querySelector(".grw-sidebar-contents")}function O(){const t=U();if(t){if(u){v(!1),u=!1,l!==null&&(t.innerHTML=l,l=null);return}l=t.innerHTML,u=!0,v(!0),S(t)}}function w(){const t=B(O);if(!t)return;const e=t.parentElement;e&&e.addEventListener("click",n=>{const i=n.target.closest("button");i&&i.id!=="recently-viewed"&&u&&(u=!1,v(!1),l=null)})}function N(){if(document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")){w();return}a=new MutationObserver((e,n)=>{document.querySelector(".grw-sidebar-nav-primary-container")&&document.getElementById("in-app-notification")&&(n.disconnect(),a=null,w())}),a.observe(document.body,{childList:!0,subtree:!0})}const F=()=>{N(),j()},W=()=>{q(),a&&(a.disconnect(),a=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:F,deactivate:W};
//# sourceMappingURL=client-entry-55_QKRik.js.map
