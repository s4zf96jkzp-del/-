(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = [...document.querySelectorAll("main > section, .site-footer")].filter(
    (section) => !section.classList.contains("hero")
      && !section.classList.contains("page-hero")
      && !section.classList.contains("case-section")
      && !section.classList.contains("about")
  );

  const itemSelector = [
    ".intro-grid", ".section-heading", ".section-intro", ".product-controls",
    ".product-grid", ".capability-copy", ".capability-list", ".solution-arrows",
    ".solution-track", ".news-grid", ".contact-content", ".footer-main",
    ".catalog-grid", ".solution-layout", ".service-grid", ".flow-list",
    ".data-band .container", ".about-story", ".value-grid", ".timeline",
    ".partner-grid", ".news-page-grid", ".contact-grid", ".detail-layout"
  ].join(",");

  const cardGroupSelector = [
    ".product-grid", ".solution-track", ".catalog-grid", ".solution-list",
    ".service-grid", ".flow-list", ".value-grid", ".timeline", ".partner-grid",
    ".news-grid", ".news-page-grid"
  ].join(",");

  const revealImmediately = (section) => section.classList.add("is-revealed");

  targets.forEach((section) => {
    section.classList.add("scroll-reveal");

    [...section.querySelectorAll(itemSelector)].forEach((item, index) => {
      item.classList.add("scroll-reveal-item");
      item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 75}ms`);
    });

    section.querySelectorAll(cardGroupSelector).forEach((group) => {
      [...group.children].forEach((card, index) => {
        card.classList.add("scroll-reveal-card");
        card.style.setProperty("--card-delay", `${Math.min(index, 5) * 80}ms`);
      });
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(revealImmediately);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealImmediately(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8%" }
  );

  targets.forEach((section) => observer.observe(section));
})();
