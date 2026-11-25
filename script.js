const header = document.querySelector(".site-header");
const navToggle = document.getElementById("navToggle");
const navPanel = document.getElementById("navPanel");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const backToTop = document.getElementById("backToTop");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const backdrop = document.createElement("div");
backdrop.className = "nav-backdrop";
backdrop.setAttribute("aria-hidden", "true");
document.body.append(backdrop);

function setMenu(open) {
  const focusWasInMenu = navPanel.contains(document.activeElement);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  navPanel.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  if (open) navLinks.querySelector("a")?.focus();
  else if (focusWasInMenu) navToggle.focus();
}

navToggle.addEventListener("click", () =>
  setMenu(navToggle.getAttribute("aria-expanded") !== "true"),
);
backdrop.addEventListener("click", () => {
  setMenu(false);
  navToggle.focus();
});
navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    navToggle.getAttribute("aria-expanded") === "true"
  ) {
    setMenu(false);
    navToggle.focus();
  }
});
window.addEventListener("resize", () => {
  if (
    window.innerWidth > 720 &&
    navToggle.getAttribute("aria-expanded") === "true"
  )
    setMenu(false);
});

function updateScrollState() {
  const scrolled = window.scrollY > 24;
  header.classList.toggle("is-scrolled", scrolled);
  backToTop.classList.toggle("is-visible", window.scrollY > 560);
}
window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const themeKey = "portfolio-theme";
const storedTheme = sessionStorage.getItem(themeKey);
if (storedTheme === "light" || storedTheme === "dark")
  document.documentElement.dataset.theme = storedTheme;
function updateThemeButton() {
  const isDark = document.documentElement.dataset.theme !== "light";
  themeToggle.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} theme`,
  );
  themeToggle.querySelector(".theme-label").textContent = isDark
    ? "Light"
    : "Dark";
  themeToggle.querySelector(".theme-icon").textContent = isDark ? "☼" : "◐";
}
updateThemeButton();
themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  sessionStorage.setItem(themeKey, nextTheme);
  updateThemeButton();
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    },
    { rootMargin: "-24% 0px -62% 0px" },
  );
  observedSections.forEach((section) => sectionObserver.observe(section));
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const filterEmpty = document.getElementById("filterEmpty");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    projectCards.forEach((card) => {
      const matches =
        filter === "all" || card.dataset.categories.split(" ").includes(filter);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    filterEmpty.hidden = visibleCount > 0;
  });
});

const form = document.getElementById("contactForm");
const successMessage = document.getElementById("formSuccess");
const errorMessage = document.getElementById("formError");
const submitButton = document.getElementById("submitBtn");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const originalButton = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButton.textContent = "Sending…";
  errorMessage.hidden = true;
  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Form submission was not accepted.");
    form.hidden = true;
    successMessage.hidden = false;
    successMessage.focus();
  } catch {
    errorMessage.hidden = false;
    errorMessage.focus();
    submitButton.innerHTML = originalButton;
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
});

document.getElementById("currentYear").textContent = String(
  new Date().getFullYear(),
);
