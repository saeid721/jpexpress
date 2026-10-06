
(function(){
"use strict";
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-jp-reveal]").forEach(el=>{
  if(reduced){el.classList.add("revealed");return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}}),{threshold:.08});
  io.observe(el);
});
document.querySelectorAll(".jp-accordion-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const item=btn.closest(".jp-accordion-item"), open=item.classList.toggle("open");
    btn.setAttribute("aria-expanded",String(open));
  });
});
const search=document.querySelector("[data-jp-search]");
const filterButtons=[...document.querySelectorAll("[data-jp-filter]")];
const items=[...document.querySelectorAll("[data-jp-item]")];
function applyFilters(){
  const q=(search?.value||"").trim().toLowerCase();
  const active=document.querySelector("[data-jp-filter].active")?.dataset.jpFilter||"all";
  items.forEach(item=>{
    const text=item.textContent.toLowerCase();
    const cat=(item.dataset.category||"all").toLowerCase();
    item.hidden=!!(q && !text.includes(q)) || (active!=="all" && cat!==active);
  });
}
search?.addEventListener("input",applyFilters);
filterButtons.forEach(btn=>btn.addEventListener("click",()=>{
  filterButtons.forEach(b=>b.classList.remove("active"));btn.classList.add("active");applyFilters();
}));
document.querySelectorAll(".jp-legal-tab").forEach(tab=>tab.addEventListener("click",()=>{
  document.querySelectorAll(".jp-legal-tab").forEach(t=>{t.classList.remove("active");t.setAttribute("aria-selected","false")});
  document.querySelectorAll(".jp-legal-panel").forEach(p=>p.classList.remove("active"));
  tab.classList.add("active");tab.setAttribute("aria-selected","true");
  document.getElementById(tab.dataset.target)?.classList.add("active");
}));
document.querySelectorAll("[data-career-open]").forEach(btn=>btn.addEventListener("click",()=>{
  const title=btn.dataset.careerOpen;
  const field=document.querySelector("#careerRole");
  if(field) field.value=title;
}));
const back=document.querySelector("[data-jp-top]");
window.addEventListener("scroll",()=>back?.classList.toggle("d-none",window.scrollY<600),{passive:true});
back?.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduced?"auto":"smooth"}));
document.querySelectorAll("[data-service-option]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-service-option]").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  const target=document.querySelector("[data-service-result]");
  if(target) target.textContent=btn.dataset.serviceOption;
}));
})();
