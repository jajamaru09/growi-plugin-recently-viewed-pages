const m="recently-viewed";let u=null;function P(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=m,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",e=>{e.stopPropagation(),u==null||u()}),t}function y(t){u=t;const e=document.getElementById(m);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const r=P();return n.insertAdjacentElement("afterend",r),r}function b(t){const e=document.getElementById(m);if(e)if(t){const n=e.parentElement;n&&n.querySelectorAll("button.btn").forEach(r=>r.classList.remove("active")),e.classList.add("active")}else e.classList.remove("active")}const v="growi-recently-viewed-pages",w=30;function E(){try{const t=localStorage.getItem(v);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function C(t,e){try{const n=E().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>w&&(n.length=w),localStorage.setItem(v,JSON.stringify(n))}catch{}}function k(){try{localStorage.removeItem(v)}catch{}}function B(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),s=Math.floor(r/60),i=Math.floor(s/60),o=Math.floor(i/24);if(s<1)return"just now";if(s<2)return"1 minute";if(s<60)return`${s} minutes`;if(i<2)return"1 hour";if(i<24)return`${i} hours`;if(o<2)return"1 day";if(o<30)return`${o} days`;const a=new Date(t),$=a.getFullYear(),A=String(a.getMonth()+1).padStart(2,"0"),I=String(a.getDate()).padStart(2,"0"),T=String(a.getHours()).padStart(2,"0"),L=String(a.getMinutes()).padStart(2,"0");return`${$}/${A}/${I} ${T}:${L}`}const M={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function c(t){return t.replace(/[&<>"']/g,e=>M[e])}const g="grw-recently-viewed-panel";function x(t){try{return decodeURIComponent(t)}catch{return t}}function D(t){const e=t.split("/").filter(Boolean);if(e.length<=1)return"";const n=e.slice(0,-1);let r="";return`<span class="path-segment"><a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${n.map(i=>{r+="/"+i;const o=x(i);return`<a class="page-segment grw-rv-link" data-rv-href="${c(r)}">${c(o)}</a>`}).join('<span class="separator" style="margin:0 0.2em">/</span>')}`}function H(t){const e=D(t.path),n=B(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${e?`<div class="col-12"><div style="font-size:0.85em;color:#888">${e}</div></div>`:""}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment grw-rv-link" data-rv-href="${c(t.path)}">${c(t.title)}</a>
            </h6>
            <div class="col-12">
              <div class="d-flex justify-content-end">
                <div class="grw-formatted-distance-date mt-auto">
                  <span>${c(n)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  `}function _(){const t=E(),e=`
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
  `}function N(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function R(){let t=document.getElementById(g);if(!t){t=document.createElement("div"),t.id=g,t.className="grw-recently-viewed-panel d-none",t.style.cssText="height:100%;overflow-y:auto;";const e=document.querySelector(".grw-sidebar-contents");e&&e.parentElement&&e.parentElement.appendChild(t)}return t}function p(){const t=R(),e=document.querySelector(".grw-sidebar-contents");t.innerHTML=_(),t.classList.remove("d-none"),e&&e.classList.add("d-none"),t.onclick=n=>{const r=n.target;if(r.closest(".grw-btn-clear-history")){k(),p();return}const s=r.closest(".grw-rv-link");if(s){n.preventDefault();const i=s.getAttribute("data-rv-href");i&&N(i)}}}function j(){const t=document.getElementById(g),e=document.querySelector(".grw-sidebar-contents");t&&t.classList.add("d-none"),e&&e.classList.remove("d-none")}const q=["/_api/","/_search","/admin","/me","/trash"];function O(t){return t==="/"?!0:q.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function U(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function W(){const t=document.title;if(t){const e=t.replace(/\s*[-|][^-|]*$/,"").trim();if(e&&!/^[0-9a-f]{24}$/i.test(e))return e}return U(window.location.pathname)}function h(){const t=window.location.pathname;if(O(t))return;const e=W();C(t,e)}let l=null;function X(){setTimeout(h,500),window.navigation&&(l=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(h,500)},{signal:l.signal}))}function z(){l&&(l.abort(),l=null)}let f=!1,d=null;function S(){f=!0,b(!0),p()}function F(){y(S)&&document.addEventListener("click",e=>{if(!f)return;const n=e.target;n.closest("#recently-viewed")||n.closest("#grw-recently-viewed-panel")||(f=!1,b(!1),j())},!0)}function G(){y(S),f&&p()}const J=()=>{F(),X(),window.navigation&&(d=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>G(),{signal:d.signal}))},Y=()=>{z(),d&&(d.abort(),d=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:J,deactivate:Y};
//# sourceMappingURL=client-entry-D7cHP9Vq.js.map
