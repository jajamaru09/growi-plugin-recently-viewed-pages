const I="recently-viewed";let u=null;function T(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=I,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",()=>{u==null||u()}),t}function m(t){u=t;const n=document.getElementById(I);if(n)return n;const e=document.getElementById("in-app-notification");if(!e)return null;const i=T();return e.insertAdjacentElement("afterend",i),i}const h="growi-recently-viewed-pages",y=30;function P(){try{const t=localStorage.getItem(h);if(!t)return[];const n=JSON.parse(t);return Array.isArray(n)?n:[]}catch{return[]}}function $(t,n){try{const e=P().filter(i=>i.path!==t);e.unshift({path:t,title:n,viewedAt:Date.now()}),e.length>y&&(e.length=y),localStorage.setItem(h,JSON.stringify(e))}catch{}}function A(){try{localStorage.removeItem(h)}catch{}}function L(t,n=Date.now()){const e=n-t,i=Math.floor(e/1e3),r=Math.floor(i/60),o=Math.floor(r/60),a=Math.floor(o/24);if(r<1)return"just now";if(r<2)return"1 minute";if(r<60)return`${r} minutes`;if(o<2)return"1 hour";if(o<24)return`${o} hours`;if(a<2)return"1 day";if(a<30)return`${a} days`;const s=new Date(t),d=s.getFullYear(),f=String(s.getMonth()+1).padStart(2,"0"),E=String(s.getDate()).padStart(2,"0"),M=String(s.getHours()).padStart(2,"0"),k=String(s.getMinutes()).padStart(2,"0");return`${d}/${f}/${E} ${M}:${k}`}const B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function p(t){return t.replace(/[&<>"']/g,n=>B[n])}const v="grw-recently-viewed-modal";function D(t){try{return decodeURIComponent(t)}catch{return t}}function x(t,n){const e=t.split("/").filter(Boolean);let i="";const r=e.map((s,d)=>{i+="/"+s;const f=d===e.length-1?n:D(s);return`<a class="grw-rv-link" data-rv-href="${p(i)}">${p(f)}</a>`}),o='<a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span></a>',a='<span class="grw-rv-sep">/</span>';return o+a+r.join(a)}function C(t){const n=x(t.path,t.title),e=L(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex align-items-baseline ms-2">
        <div class="flex-grow-1 grw-rv-full-path">${n}</div>
        <div class="grw-formatted-distance-date ms-3 text-nowrap">
          <span>${p(e)}</span>
        </div>
      </div>
    </li>
  `}function b(){const t=P();return t.length===0?'<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>':`
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${t.map(C).join("")}
      </ul>
    </div>
  `}function H(t){var n;try{const e=(n=window.next)==null?void 0:n.router;if(e&&typeof e.push=="function"){e.push(t);return}}catch{}window.location.href=t}function _(){let t=document.getElementById(v);return t||(t=document.createElement("div"),t.id=v,t.className="grw-rv-modal-backdrop",t.innerHTML=`
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
    `,document.body.appendChild(t)),t}function w(){const t=_(),n=t.querySelector(".grw-rv-modal-body");n.innerHTML=b(),t.classList.add("active"),t.onclick=e=>{const i=e.target;if(i===t){g();return}if(i.closest(".grw-rv-modal-close")){g();return}if(i.closest(".grw-btn-clear-history")){A(),n.innerHTML=b();return}const r=i.closest(".grw-rv-link");if(r){e.preventDefault();const o=r.getAttribute("data-rv-href");o&&(g(),H(o))}}}function g(){const t=document.getElementById(v);t&&t.classList.remove("active")}const O=["/_api/","/_search","/admin","/me","/trash"];function R(t){return/^[0-9a-f]{24}$/i.test(t)}function j(t){return t==="/"?!0:O.some(n=>n.endsWith("/")?t.startsWith(n):t===n||t.startsWith(n+"/"))}function W(t){const n=t.split("/").filter(Boolean),e=n[n.length-1]||"";try{return decodeURIComponent(e)}catch{return e}}function N(){const t=document.title;if(t){const n=t.lastIndexOf(" - "),e=t.lastIndexOf(" | "),i=Math.max(n,e);if(i>0){const r=t.substring(0,i).trim();if(r&&!/^[0-9a-f]{24}$/i.test(r))return r}}return W(window.location.pathname)}function U(){const t=window.location.pathname,n=t.split("/").filter(Boolean);return n.length===1&&R(n[0])?null:t}async function z(t){var n;try{const e=await fetch(`/_api/v3/page?pageId=${t}`);if(!e.ok)return null;const i=await e.json(),r=(n=i==null?void 0:i.page)==null?void 0:n.path;if(r&&typeof r=="string")return r}catch{}return null}async function F(){const t=window.location.pathname,n=U();if(n!==null)return n;const e=t.split("/").filter(Boolean)[0];return await z(e)??t}async function S(){const t=await F();if(j(t))return;const n=N();$(t,n)}let l=null;function X(){setTimeout(S,500),window.navigation&&(l=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(S,500)},{signal:l.signal}))}function q(){l&&(l.abort(),l=null)}let c=null;function G(){m(()=>w())||setTimeout(()=>m(()=>w()),1e3)}const J=()=>{G(),X(),window.navigation&&(c=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>m(()=>w()),{signal:c.signal}))},Y=()=>{q(),c&&(c.abort(),c=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:J,deactivate:Y};
//# sourceMappingURL=client-entry-6Ehxpogg.js.map
