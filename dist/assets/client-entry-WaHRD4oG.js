const A="recently-viewed";let d=null;function P(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=A,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",()=>{d==null||d()}),t}function m(t){d=t;const e=document.getElementById(A);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const i=P();return n.insertAdjacentElement("afterend",i),i}const w="growi-recently-viewed-pages",y=30;function I(){try{const t=localStorage.getItem(w);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function L(t,e){try{const n=I().filter(i=>i.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>y&&(n.length=y),localStorage.setItem(w,JSON.stringify(n))}catch{}}function $(){try{localStorage.removeItem(w)}catch{}}function x(t,e=Date.now()){const n=e-t,i=Math.floor(n/1e3),s=Math.floor(i/60),r=Math.floor(s/60),o=Math.floor(r/24);if(s<1)return"just now";if(s<2)return"1 minute";if(s<60)return`${s} minutes`;if(r<2)return"1 hour";if(r<24)return`${r} hours`;if(o<2)return"1 day";if(o<30)return`${o} days`;const a=new Date(t),l=a.getFullYear(),f=String(a.getMonth()+1).padStart(2,"0"),M=String(a.getDate()).padStart(2,"0"),T=String(a.getHours()).padStart(2,"0"),k=String(a.getMinutes()).padStart(2,"0");return`${l}/${f}/${M} ${T}:${k}`}const _={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function p(t){return t.replace(/[&<>"']/g,e=>_[e])}const v="grw-recently-viewed-modal";function D(t){try{return decodeURIComponent(t)}catch{return t}}function B(t,e){const n=t.split("/").filter(Boolean);let i="";const s=n.map((a,l)=>{i+="/"+a;const f=l===n.length-1?e:D(a);return`<a class="grw-rv-link" data-rv-href="${p(i)}">${p(f)}</a>`}),r='<a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span></a>',o='<span class="grw-rv-sep">/</span>';return r+o+s.join(o)}function C(t){const e=B(t.path,t.title),n=x(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex align-items-baseline ms-2">
        <div class="flex-grow-1 grw-rv-full-path">${e}</div>
        <div class="grw-formatted-distance-date ms-3 text-nowrap">
          <span>${p(n)}</span>
        </div>
      </div>
    </li>
  `}function b(){const t=I();return t.length===0?'<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>':`
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${t.map(C).join("")}
      </ul>
    </div>
  `}function H(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function O(){let t=document.getElementById(v);return t||(t=document.createElement("div"),t.id=v,t.className="grw-rv-modal-backdrop",t.innerHTML=`
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
    `,document.body.appendChild(t)),t}function h(){const t=O(),e=t.querySelector(".grw-rv-modal-body");e.innerHTML=b(),t.classList.add("active"),t.onclick=n=>{const i=n.target;if(i===t){g();return}if(i.closest(".grw-rv-modal-close")){g();return}if(i.closest(".grw-btn-clear-history")){$(),e.innerHTML=b();return}const s=i.closest(".grw-rv-link");if(s){n.preventDefault();const r=s.getAttribute("data-rv-href");r&&(g(),H(r))}}}function g(){const t=document.getElementById(v);t&&t.classList.remove("active")}const N=["/_api/","/_search","/admin","/me","/trash"];function S(t){return/^[0-9a-f]{24}$/i.test(t)}function R(t){return t==="/"?!0:N.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function W(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function j(){const t=document.title;if(t){const e=t.lastIndexOf(" - "),n=t.lastIndexOf(" | "),i=Math.max(e,n);if(i>0){const s=t.substring(0,i).trim();if(s&&!/^[0-9a-f]{24}$/i.test(s))return s}}return W(window.location.pathname)}function q(){var i,s;const t=window.location.pathname,e=t.split("/").filter(Boolean);if(!(e.length===1&&S(e[0])))return t;try{const r=window.__NEXT_DATA__,o=(s=(i=r==null?void 0:r.props)==null?void 0:i.pageServerSideProps)==null?void 0:s.currentPage;if(o!=null&&o.path&&typeof o.path=="string")return o.path}catch{}try{const r=document.querySelector(".grw-page-path-nav");if(r){const o=r.querySelectorAll("a[href]");if(o.length>0){const l=o[o.length-1].getAttribute("href");if(l&&l.startsWith("/")&&!S(l.replace("/","")))return l}}}catch{}try{const r=document.querySelector(".grw-page-path-text-muted-container");if(r!=null&&r.textContent){const o=r.textContent.trim();if(o.startsWith("/"))return o}}catch{}return t}function E(){const t=q();if(R(t))return;const e=j();L(t,e)}let c=null;function U(){setTimeout(E,500),window.navigation&&(c=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(E,500)},{signal:c.signal}))}function X(){c&&(c.abort(),c=null)}let u=null;function z(){m(()=>h())||setTimeout(()=>m(()=>h()),1e3)}const F=()=>{z(),U(),window.navigation&&(u=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>m(()=>h()),{signal:u.signal}))},G=()=>{X(),u&&(u.abort(),u=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:F,deactivate:G};
//# sourceMappingURL=client-entry-WaHRD4oG.js.map
