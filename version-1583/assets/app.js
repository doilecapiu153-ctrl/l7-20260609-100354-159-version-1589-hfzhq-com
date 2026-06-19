(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-menu-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length <= 1) {
      return;
    }

    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    showSlide(0);
    startAutoPlay();
  }

  function setupLocalFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    var searchInput = document.querySelector("[data-local-search]");
    var yearSelect = document.querySelector("[data-year-filter]");

    if (!grid || (!searchInput && !yearSelect)) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function applyFilters() {
      var keyword = normalise(searchInput ? searchInput.value : "");
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var haystack = normalise([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        var cardYear = card.getAttribute("data-year") || "";
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var yearMatched = !year || cardYear === year;

        card.classList.toggle("is-hidden", !(keywordMatched && yearMatched));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }

    applyFilters();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a href=\"" + escapeAttribute(movie.url) + "\" class=\"movie-poster\" aria-label=\"查看 " + escapeAttribute(movie.title) + "\">",
      "    <img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\" onerror=\"this.style.display='none'; this.parentElement.classList.add('missing-cover');\">",
      "    <span class=\"play-chip\">播放</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"" + escapeAttribute(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-list\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var category = document.querySelector("[data-global-category]");
    var year = document.querySelector("[data-global-year]");
    var result = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!input || !category || !year || !result || !summary || !window.SEARCH_MOVIES) {
      return;
    }

    function applySearch() {
      var keyword = normalise(input.value);
      var categoryValue = category.value;
      var yearValue = year.value;
      var movies = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalise([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.categoryName,
          (movie.tags || []).join(" ")
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !categoryValue || movie.categorySlug === categoryValue;
        var matchedYear = !yearValue || movie.year === yearValue;

        return matchedKeyword && matchedCategory && matchedYear;
      }).slice(0, 120);

      result.innerHTML = movies.map(createSearchCard).join("\n");
      summary.textContent = "已显示 " + movies.length + " 条结果；可继续输入关键词缩小范围。";
    }

    input.addEventListener("input", applySearch);
    category.addEventListener("change", applySearch);
    year.addEventListener("change", applySearch);
    applySearch();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFilters();
    setupGlobalSearch();
  });
})();
