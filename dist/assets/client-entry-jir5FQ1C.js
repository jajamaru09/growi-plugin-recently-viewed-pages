const I="recently-viewed";let u=null;function k(){const t=document.createElement("button");return t.type="button",t.className="btn btn-primary m-1 rounded",t.id=I,t.innerHTML='<div class="position-relative"><span class="material-symbols-outlined">history</span></div>',t.addEventListener("click",()=>{u==null||u()}),t}function p(t){u=t;const e=document.getElementById(I);if(e)return e;const n=document.getElementById("in-app-notification");if(!n)return null;const r=k();return n.insertAdjacentElement("afterend",r),r}const y="growi-recently-viewed-pages",b=100;function P(){try{const t=localStorage.getItem(y);if(!t)return[];const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function L(t,e){try{const n=P().filter(r=>r.path!==t);n.unshift({path:t,title:e,viewedAt:Date.now()}),n.length>b&&(n.length=b),localStorage.setItem(y,JSON.stringify(n))}catch{}}function $(){try{localStorage.removeItem(y)}catch{}}function A(t,e=Date.now()){const n=e-t,r=Math.floor(n/1e3),i=Math.floor(r/60),s=Math.floor(i/60),a=Math.floor(s/24);if(i<1)return"just now";if(i<2)return"1 minute";if(i<60)return`${i} minutes`;if(s<2)return"1 hour";if(s<24)return`${s} hours`;if(a<2)return"1 day";if(a<30)return`${a} days`;const o=new Date(t),d=o.getFullYear(),f=String(o.getMonth()+1).padStart(2,"0"),M=String(o.getDate()).padStart(2,"0"),E=String(o.getHours()).padStart(2,"0"),T=String(o.getMinutes()).padStart(2,"0");return`${d}/${f}/${M} ${E}:${T}`}const C={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function v(t){return t.replace(/[&<>"']/g,e=>C[e])}const w="grw-recently-viewed-modal";function x(t){try{return decodeURIComponent(t)}catch{return t}}function B(t,e){const n=t.split("/").filter(Boolean);let r="";const i=n.map((o,d)=>{r+="/"+o;const f=d===n.length-1?e:x(o);return`<a class="grw-rv-link" data-rv-href="${v(r)}">${v(f)}</a>`}),s='<a class="grw-rv-link" data-rv-href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span></a>',a='<span class="grw-rv-sep">/</span>';return s+a+i.join(a)}function D(t){const e=B(t.path,t.title),n=A(t.viewedAt);return`
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex align-items-baseline ms-2">
        <div class="flex-grow-1 grw-rv-full-path">${e}</div>
        <div class="grw-formatted-distance-date ms-3 text-nowrap">
          <span>${v(n)}</span>
        </div>
      </div>
    </li>
  `}function g(t=""){const e=P();if(e.length===0)return'<div class="grw-recently-viewed-empty">閲覧履歴はありません</div>';const n=t.trim()?e.filter(i=>i.title.toLowerCase().includes(t.toLowerCase())||i.path.toLowerCase().includes(t.toLowerCase())):e;return n.length===0?'<div class="grw-recently-viewed-empty">該当する履歴が見つかりません</div>':`
    <div class="grw-recent-changes">
      <ul class="list-group list-group-flush">
        ${n.map(D).join("")}
      </ul>
    </div>
  `}function H(t){var e;try{const n=(e=window.next)==null?void 0:e.router;if(n&&typeof n.push=="function"){n.push(t);return}}catch{}window.location.href=t}function _(){let t=document.getElementById(w);return t||(t=document.createElement("div"),t.id=w,t.className="grw-rv-modal-backdrop",t.innerHTML=`
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
        <div class="grw-rv-search-container">
          <input type="text" class="grw-rv-search-input" placeholder="ページを検索..." autocomplete="off">
        </div>
        <div class="grw-rv-modal-body"></div>
      </div>
    `,document.body.appendChild(t)),t}function h(){const t=_(),e=t.querySelector(".grw-rv-modal-body"),n=t.querySelector(".grw-rv-search-input");e.innerHTML=g(),n&&(n.value=""),t.classList.add("active"),setTimeout(()=>{n&&n.focus()},100);const r=()=>{const i=n?n.value:"";e.innerHTML=g(i)};n&&(n.oninput=r),t.onclick=i=>{const s=i.target;if(s===t){m();return}if(s.closest(".grw-rv-modal-close")){m();return}if(s.closest(".grw-btn-clear-history")){$();const o=n?n.value:"";e.innerHTML=g(o);return}const a=s.closest(".grw-rv-link");if(a){i.preventDefault();const o=a.getAttribute("data-rv-href");o&&(m(),H(o))}}}function m(){const t=document.getElementById(w);t&&t.classList.remove("active")}const O=["/_api/","/_search","/admin","/me","/trash"];function R(t){return/^[0-9a-f]{24}$/i.test(t)}function j(t){return t==="/"?!0:O.some(e=>e.endsWith("/")?t.startsWith(e):t===e||t.startsWith(e+"/"))}function W(t){const e=t.split("/").filter(Boolean),n=e[e.length-1]||"";try{return decodeURIComponent(n)}catch{return n}}function q(){const t=document.title;if(t){const e=t.lastIndexOf(" - "),n=t.lastIndexOf(" | "),r=Math.max(e,n);if(r>0){const i=t.substring(0,r).trim();if(i&&!/^[0-9a-f]{24}$/i.test(i))return i}}return W(window.location.pathname)}function N(){const t=window.location.pathname,e=t.split("/").filter(Boolean);return e.length===1&&R(e[0])?null:t}async function U(t){var e;try{const n=await fetch(`/_api/v3/page?pageId=${t}`);if(!n.ok)return null;const r=await n.json(),i=(e=r==null?void 0:r.page)==null?void 0:e.path;if(i&&typeof i=="string")return i}catch{}return null}async function z(){const t=window.location.pathname,e=N();if(e!==null)return e;const n=t.split("/").filter(Boolean)[0];return await U(n)??t}async function S(){const t=await z();if(j(t))return;const e=q();L(t,e)}let l=null;function F(){setTimeout(S,500),window.navigation&&(l=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>{setTimeout(S,500)},{signal:l.signal}))}function X(){l&&(l.abort(),l=null)}let c=null;function G(){p(()=>h())||setTimeout(()=>p(()=>h()),1e3)}const J=()=>{G(),F(),window.navigation&&(c=new AbortController,window.navigation.addEventListener("navigatesuccess",()=>p(()=>h()),{signal:c.signal}))},Y=()=>{X(),c&&(c.abort(),c=null)};window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-recently-viewed-pages"]={activate:J,deactivate:Y};
//# sourceMappingURL=client-entry-jir5FQ1C.js.map
