let page = 1;
let currentQuery = "Technology";
let isLoading = false;

const API_KEY = "0ea2bdb2e0714ed0a010339f866ae4b0";
const url = "https://newsapi.org/v2/everything?q=";

/* ---------------- INIT ---------------- */
window.addEventListener("load", () => {
    fetchNews(currentQuery, true);
    loadTheme();
});

/* ---------------- FETCH NEWS ---------------- */
async function fetchNews(query = currentQuery, isNewSearch = false) {

    if (isLoading) return;
    isLoading = true;

    if (isNewSearch) {
        page = 1;
        currentQuery = query;
        document.getElementById("cards-container").innerHTML = "";
    }

    try {
        const res = await fetch(
            `${url}${currentQuery}&page=${page}&pageSize=10&apiKey=${API_KEY}`
        );

        const data = await res.json();

        if (!data.articles || data.articles.length === 0) {
            showNoResults(true);
            isLoading = false;
            return;
        } else {
            showNoResults(false);
        }

        bindData(data.articles);

    } catch (error) {
        console.log("API Error:", error);
    }

    isLoading = false;
}

/* ---------------- BIND DATA ---------------- */
function bindData(articles) {

    const container = document.getElementById("cards-container");
    const template = document.getElementById("news-card-template");

    if (!container || !template) return;

    articles.forEach(article => {

        if (!article.urlToImage) return;

        const clone = template.content.cloneNode(true);

        const card = clone.querySelector(".card");
        card.style.animationDelay = `${Math.random() * 0.3}s`;

        fillData(clone, article);
        container.appendChild(clone);
    });
}

/* ---------------- FILL CARD ---------------- */
function fillData(clone, article) {

    clone.querySelector(".news-img").src = article.urlToImage;
    clone.querySelector(".news-title").textContent = article.title;
    clone.querySelector(".news-desc").textContent = article.description || "";
    clone.querySelector(".news-source").textContent = article.source.name;

    clone.querySelector(".card").addEventListener("click", () => {
        window.open(article.url, "_blank");
    });

    const btn = clone.querySelector(".bookmark-btn");

    btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const saved = JSON.parse(localStorage.getItem("news")) || [];

        if (saved.some(n => n.url === article.url)) {
            alert("Already saved!");
            return;
        }

        saved.push(article);
        localStorage.setItem("news", JSON.stringify(saved));

        alert("Saved!");
    });
}

/* ---------------- CATEGORY CLICK ---------------- */
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {

        const category = item.dataset.category;

        document.querySelector(".active")?.classList.remove("active");
        item.classList.add("active");

        fetchNews(category, true);
    });
});

/* ---------------- SEARCH ---------------- */
const searchBtn = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchBtn?.addEventListener("click", () => {
    const query = searchText.value.trim();
    if (!query) return;

    fetchNews(query, true);
});

searchText?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

/* ---------------- DARK MODE ---------------- */
const toggleBtn = document.getElementById("theme-toggle");

toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

function loadTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
}

/* ---------------- INFINITE SCROLL (FIXED) ---------------- */
let scrollTimeout;

window.addEventListener("scroll", () => {

    if (isLoading) return;

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

        const scrollPos = window.innerHeight + window.scrollY;
        const bottom = document.body.offsetHeight - 150;

        if (scrollPos >= bottom) {
            page++;
            fetchNews(currentQuery, false);
        }

    }, 150);
});

/* ---------------- BACK TO TOP ---------------- */
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});

backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* ---------------- NO RESULTS UI ---------------- */
function showNoResults(show) {
    const el = document.getElementById("no-results");
    if (!el) return;

    el.style.display = show ? "block" : "none";
}