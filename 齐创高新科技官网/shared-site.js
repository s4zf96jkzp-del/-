/* global lucide */

const pageName = document.body.dataset.page || "";

const headerHost = document.querySelector("[data-site-header]");
const footerHost = document.querySelector("[data-site-footer]");

const navItems = [
  ["首页", "index.html", "home"],
  ["产品中心", "products.html", "products"],
  ["解决方案", "solutions.html", "solutions"],
  ["服务支持", "services.html", "services"],
  ["关于我们", "about.html", "about"],
  ["合作伙伴", "partners.html", "partners"]
];

const navMarkup = navItems
  .map(([label, href, page]) => `<a href="${href}" class="${pageName === page ? "is-active" : ""}">${label}</a>`)
  .join("");

if (headerHost) {
  headerHost.innerHTML = `
    <header class="site-header page-header is-scrolled">
      <div class="nav-shell">
        <a class="brand" href="index.html" aria-label="齐创高新科技首页">
          <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="brand-copy"><b>齐创</b><small>高新科技</small></span>
        </a>
        <nav class="main-nav" id="mainNav" aria-label="主导航">${navMarkup}</nav>
        <button class="nav-cta js-consult" type="button"><i data-lucide="message-circle-more"></i><span>预约咨询</span></button>
        <button class="menu-toggle" id="menuToggle" type="button" aria-label="打开导航菜单" aria-expanded="false" aria-controls="mainNav"><i data-lucide="menu"></i></button>
      </div>
    </header>`;
}

if (footerHost) {
  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-main">
        <div class="footer-brand"><a class="brand brand-footer" href="index.html"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span class="brand-copy"><b>齐创</b><small>高新科技</small></span></a><p>以科技为企业创造持续价值。</p></div>
        <div class="footer-links"><div><h3>产品与服务</h3><a href="products.html">智能硬件</a><a href="products.html">数字平台</a><a href="products.html">安全管理</a></div><div><h3>解决方案</h3><a href="solutions.html">智慧园区</a><a href="solutions.html">智能工厂</a><a href="solutions.html">城市空间</a></div><div><h3>关于齐创</h3><a href="about.html">公司介绍</a><a href="news.html">新闻资讯</a><a href="contact.html">联系我们</a></div></div>
        <div class="footer-contact"><h3>联系咨询</h3><a href="tel:4000002014">400-000-2014</a><p>周一至周五 09:00 - 18:00</p><button class="footer-consult js-consult" type="button">在线留言 <i data-lucide="arrow-up-right"></i></button></div>
      </div>
      <div class="container footer-bottom"><span>Copyright © <span class="js-year"></span> 齐创高新科技有限公司</span><span>粤ICP备XXXXXXXX号</span><a href="#top">返回顶部 <i data-lucide="arrow-up"></i></a></div>
    </footer>`;
}

document.body.insertAdjacentHTML("beforeend", `
  <div class="modal" id="consultModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="consultTitle">
    <div class="modal-backdrop" data-close-modal></div>
    <div class="modal-dialog">
      <button class="modal-close" type="button" aria-label="关闭咨询表单" data-close-modal><i data-lucide="x"></i></button>
      <p class="eyebrow"><span></span>CONSULTATION</p><h2 id="consultTitle">预约方案咨询</h2>
      <p>留下您的需求，我们将在一个工作日内与您联系。</p>
      <form id="consultForm"><label>您的称呼<input name="name" type="text" placeholder="请输入姓名" required /></label><label>联系电话<input name="phone" type="tel" placeholder="请输入联系电话" required /></label><label>关注方向<select name="interest"><option>智慧园区</option><option>智能工厂</option><option>城市空间</option><option>其他需求</option></select></label><button class="button button-primary" type="submit">提交咨询 <i data-lucide="arrow-up-right"></i></button></form>
      <p class="form-status" id="formStatus" aria-live="polite"></p>
    </div>
  </div>`);

if (window.lucide) lucide.createIcons({ attrs: { "stroke-width": 1.8 } });

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "关闭导航菜单" : "打开导航菜单");
    const icon = menuToggle.querySelector("svg");
    if (icon && window.lucide) icon.outerHTML = window.lucide.icons[isOpen ? "x" : "menu"].toSvg({ "stroke-width": 1.8 });
  });
}

const modal = document.getElementById("consultModal");
const form = document.getElementById("consultForm");
function openModal() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  window.setTimeout(() => form.elements.name.focus(), 100);
}
function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
document.querySelectorAll(".js-consult").forEach((button) => button.addEventListener("click", openModal));
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
form.addEventListener("submit", (event) => { event.preventDefault(); document.getElementById("formStatus").textContent = "已收到您的咨询需求，我们将尽快与您联系。"; form.reset(); });
document.querySelectorAll(".js-year").forEach((year) => { year.textContent = new Date().getFullYear(); });
