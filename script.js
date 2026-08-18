/* global lucide */

const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = [...document.querySelectorAll(".main-nav a")];
const filters = [...document.querySelectorAll(".product-filter")];
const productCards = [...document.querySelectorAll(".product-card")];
const modal = document.getElementById("consultModal");
const form = document.getElementById("consultForm");
const formStatus = document.getElementById("formStatus");

if (window.lucide) lucide.createIcons({ attrs: { "stroke-width": 1.8 } });

const warpHeading = document.getElementById("heroWarpText");
const initializeWarpHeading = () => {
  if (!warpHeading || !window.createWarpText) return;
  window.createWarpText(warpHeading, { text: "安全高效", color: "#ec3d38" });
};
document.addEventListener("warptextready", initializeWarpHeading, { once: true });
if (window.createWarpText) initializeWarpHeading();

const setHeaderState = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "关闭导航菜单" : "打开导航菜单");
  const icon = menuToggle.querySelector("svg");
  if (icon) icon.outerHTML = window.lucide.icons[isOpen ? "x" : "menu"].toSvg({ "stroke-width": 1.8 });
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  },
  { rootMargin: "-36% 0px -57% 0px", threshold: 0 }
);
sections.forEach((section) => observer.observe(section));

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    filters.forEach((item) => {
      const current = item === filter;
      item.classList.toggle("is-current", current);
      item.setAttribute("aria-selected", String(current));
    });
    productCards.forEach((card) => card.classList.toggle("is-hidden", category !== "all" && card.dataset.category !== category));
  });
});

const solutionTrack = document.getElementById("solutionTrack");
const getScrollAmount = () => Math.min(solutionTrack.clientWidth * 0.82, 360);
document.getElementById("solutionNext").addEventListener("click", () => solutionTrack.scrollBy({ left: getScrollAmount(), behavior: "smooth" }));
document.getElementById("solutionPrev").addEventListener("click", () => solutionTrack.scrollBy({ left: -getScrollAmount(), behavior: "smooth" }));

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
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "已收到您的咨询需求，我们将尽快与您联系。";
  form.reset();
});

const featuredCase = document.querySelector(".case-section");
if (featuredCase) {
  featuredCase.classList.add("has-motion");

  const caseObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      featuredCase.classList.add("is-visible");
      caseObserver.unobserve(featuredCase);
    },
    { threshold: 0.22 }
  );
  caseObserver.observe(featuredCase);

  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (supportsHover) {
    featuredCase.addEventListener("pointermove", (event) => {
      const bounds = featuredCase.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      featuredCase.style.setProperty("--case-x", x.toFixed(3));
      featuredCase.style.setProperty("--case-y", y.toFixed(3));
      featuredCase.classList.add("is-hovered");
    });
    featuredCase.addEventListener("pointerleave", () => {
      featuredCase.classList.remove("is-hovered");
      featuredCase.style.setProperty("--case-x", "0");
      featuredCase.style.setProperty("--case-y", "0");
    });
  }
}

const aboutSection = document.querySelector(".about");
if (aboutSection) {
  aboutSection.classList.add("has-motion");

  const aboutObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      aboutSection.classList.add("is-visible");
      aboutObserver.unobserve(aboutSection);
    },
    { threshold: 0.2 }
  );
  aboutObserver.observe(aboutSection);

  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (supportsHover) {
    aboutSection.addEventListener("pointermove", (event) => {
      const bounds = aboutSection.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      aboutSection.style.setProperty("--about-x", x.toFixed(3));
      aboutSection.style.setProperty("--about-y", y.toFixed(3));
      aboutSection.classList.add("is-hovered");
    });
    aboutSection.addEventListener("pointerleave", () => {
      aboutSection.classList.remove("is-hovered");
      aboutSection.style.setProperty("--about-x", "0");
      aboutSection.style.setProperty("--about-y", "0");
    });
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
