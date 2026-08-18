document.querySelectorAll("[data-product-filter]").forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    const filter = tab.dataset.productFilter;
    document.querySelectorAll("[data-product-filter]").forEach((item) => item.classList.toggle("is-active", item === tab));
    document.querySelectorAll("[data-product-category]").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.productCategory !== filter;
    });
  });
});

const pageContactForm = document.getElementById("pageContactForm");
if (pageContactForm) {
  pageContactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.getElementById("pageFormStatus");
    status.textContent = "已收到您的需求，我们将在一个工作日内回复。";
    pageContactForm.reset();
  });
}
