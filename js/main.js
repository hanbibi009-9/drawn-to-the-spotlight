/**
 * DRAWN TO THE SPOTLIGHT — 상영회 사이트 렌더링 & 인터랙션
 * SHOWCASE_DATA(js/data.js)를 읽어 화면을 구성합니다.
 */
(function () {
  "use strict";

  const data = window.SHOWCASE_DATA;
  if (!data) return;

  /* ---------------------------------------------------------
     0. YouTube IFrame API — lazy load, 1회만
  --------------------------------------------------------- */
  let ytApiPromise = null;
  function loadYouTubeAPI() {
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prevCallback === "function") prevCallback();
        resolve(window.YT);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
    return ytApiPromise;
  }

  /* ---------------------------------------------------------
     1. 히어로
  --------------------------------------------------------- */
  function renderHero() {
    const h = data.hero;
    setText("heroEdition", h.edition);
    setHeroTitleArc("heroTitle", h.title);
    setText("heroSubtitle", h.subtitle);
    setText("heroPeriod", h.period);
    setText("heroCredit", h.creditLine);

    const posterImg = document.querySelector(".hero__poster");
    if (posterImg && h.posterImage) posterImg.src = h.posterImage;

    renderHeroGallery();
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  /* --- 타이틀을 글자 단위로 쪼개 완만한 아치형으로 배치하고, 첫 글자를 드롭캡처럼 키움 --- */
  function setHeroTitleArc(id, text) {
    const el = document.getElementById(id);
    if (!el || text == null) return;

    el.setAttribute("aria-label", text);
    el.textContent = "";

    const chars = Array.from(text);
    const n = chars.length;
    const maxAngle = 24;  // 전체 아치가 벌어지는 최대 각도(도), 양 끝 글자 기준
    const maxLift = 30;   // 가운데 글자가 치솟는 최대 높이(px)

    let firstLetterDone = false;
    chars.forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "hero__title-char";
      span.setAttribute("aria-hidden", "true");

      if (ch === " ") {
        span.className += " hero__title-char--space";
        span.textContent = " ";
        el.appendChild(span);
        return;
      }

      if (!firstLetterDone) {
        span.className += " hero__title-dropcap";
        firstLetterDone = true;
      }

      const t = n > 1 ? i / (n - 1) : 0.5;   // 0(왼쪽 끝) ~ 1(오른쪽 끝)
      const normPos = t * 2 - 1;             // -1(왼쪽 끝) ~ 0(가운데) ~ 1(오른쪽 끝)
      const angle = normPos * (maxAngle / 2);
      const lift = -maxLift * (1 - normPos * normPos); // 가운데일수록 많이 위로(음수)
      span.style.transform = `rotate(${angle.toFixed(2)}deg) translateY(${lift.toFixed(1)}px)`;
      span.textContent = ch;
      el.appendChild(span);
    });
  }

  /* --- 스포트라이트 빔 안에 쌓이는 액자 갤러리: 팀 썸네일이 있으면 쓰고, 없으면 스케치풍 플레이스홀더 --- */
  function renderHeroGallery() {
    const wrap = document.getElementById("heroGallery");
    if (!wrap) return;

    const teams = data.teams.slice().sort((a, b) => a.order - b.order).slice(0, 7);
    wrap.innerHTML = "";

    teams.forEach((team) => {
      const frame = document.createElement("div");
      frame.className = "hero__gallery-frame";

      if (team.thumbnail) {
        const img = document.createElement("img");
        img.src = team.thumbnail;
        img.alt = "";
        frame.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "hero__gallery-placeholder";
        frame.appendChild(placeholder);
      }

      wrap.appendChild(frame);
    });
  }

  /* --- 히어로 스크롤 패럴랙스: 포스터는 느리게, 액자 갤러리는 중간, 텍스트는 빠르게 사라지며 깊이감을 줌 --- */
  function setupHeroParallax() {
    const hero = document.getElementById("hero");
    const poster = hero && hero.querySelector(".hero__poster");
    const content = hero && hero.querySelector(".hero__content");
    const gallery = hero && hero.querySelector(".hero__gallery");
    if (!hero || !poster || !content) return;

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // 등장 애니메이션이 끝나면 CSS animation을 내려서,
    // 이후 스크롤 패럴랙스가 인라인 transform으로 그대로 반영되게 함
    content.addEventListener("animationend", () => { content.style.animation = "none"; }, { once: true });
    if (gallery) {
      gallery.addEventListener("animationend", () => { gallery.style.animation = "none"; }, { once: true });
    }

    const POSTER_SPEED = 0.35;    // 포스터가 스크롤보다 느리게 따라오는 비율
    const GALLERY_SPEED = 0.45;   // 액자 갤러리는 포스터보다 조금 빠르게(텍스트보다는 느리게)
    const CONTENT_SPEED = 0.55;   // 텍스트가 위로 사라지는 비율(가장 빠르게)
    const FADE_RANGE = 0.85;      // 히어로 높이의 몇 %를 스크롤해야 다 사라지는지

    let ticking = false;

    function update() {
      ticking = false;
      const heroHeight = hero.offsetHeight;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(1, Math.max(0, scrollY / (heroHeight * FADE_RANGE)));

      poster.style.transform = `scale(1.15) translateY(${scrollY * POSTER_SPEED}px)`;
      content.style.transform = `translateY(${-scrollY * CONTENT_SPEED}px)`;
      content.style.opacity = String(1 - progress);

      if (gallery) {
        gallery.style.transform = `translateX(-50%) translateY(${-scrollY * GALLERY_SPEED}px)`;
        gallery.style.opacity = String(1 - progress);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* --- 오프닝 커튼: 양옆으로 간단하게 열리기만 함 --- */
  function openCurtain() {
    const left = document.getElementById("curtainLeft");
    const right = document.getElementById("curtainRight");
    if (!left || !right) return;

    // 다 열리고 나면 visibility:hidden 처리 — 화면 가장자리에 살짝 걸쳐 남아있던
    // 커튼 끝단이 스크롤 중 서브픽셀 반올림으로 깜빡이던 문제를 원천 차단
    const hideWhenDone = (el) => {
      el.addEventListener("transitionend", (e) => {
        if (e.propertyName === "transform") el.classList.add("is-hidden");
      }, { once: true });
    };
    hideWhenDone(left);
    hideWhenDone(right);

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        left.classList.add("is-open");
        right.classList.add("is-open");
      }, 500);
    });
  }

  /* ---------------------------------------------------------
     2. 목차 (TOC)
  --------------------------------------------------------- */
  function renderTOC() {
    const list = document.getElementById("tocList");
    if (!list) return;
    const frag = document.createDocumentFragment();

    data.teams
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((team) => {
        const li = document.createElement("li");
        li.className = "toc__item";

        const a = document.createElement("a");
        a.className = "toc__link";
        a.href = `#team-${team.order}`;

        const num = document.createElement("span");
        num.className = "toc__num";
        num.textContent = String(team.order).padStart(2, "0");

        const label = document.createElement("span");
        label.className = "toc__label";
        label.textContent = team.title;

        const genre = document.createElement("span");
        genre.className = "toc__genre";
        genre.textContent = team.genre;

        a.append(num, label, genre);
        li.appendChild(a);
        frag.appendChild(li);
      });

    list.appendChild(frag);
  }

  /* ---------------------------------------------------------
     3. 팀 카드
  --------------------------------------------------------- */
  function renderTeamCards() {
    const wrap = document.getElementById("teamCards");
    if (!wrap) return;
    const frag = document.createDocumentFragment();

    data.teams
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((team) => {
        frag.appendChild(buildTeamCard(team));
      });

    wrap.appendChild(frag);
  }

  function buildTeamCard(team) {
    const isWebtoon = team.mediaType === "video+webtoon";

    const article = document.createElement("article");
    article.className = "team-card";
    article.id = `team-${team.order}`;

    article.innerHTML = `
      <div class="team-card__frame">
        <div class="team-card__media">
          <div class="video-embed" data-order="${team.order}">
            <button type="button" class="video-embed__thumb" aria-label="${escapeAttr(team.title)} 영상 재생">
              <span class="video-embed__thumb-genre">${escapeHtml(team.genre)}</span>
              <span class="video-embed__play" aria-hidden="true">▶</span>
              <span class="video-embed__thumb-caption">Click to Play</span>
            </button>
          </div>
        </div>
        <div class="team-card__body">
          <span class="team-card__order">Feature No. ${String(team.order).padStart(2, "0")}</span>
          <h2 class="team-card__title">${escapeHtml(team.title)}</h2>
          <span class="team-card__genre">${escapeHtml(team.genre)}</span>
          <p class="team-card__synopsis">${escapeHtml(team.synopsis)}</p>
          <span class="team-card__runtime">Running Time — ${escapeHtml(team.runtime)}</span>

          ${isWebtoon ? `
          <div class="webtoon-prompt" id="webtoonPrompt-${team.order}" aria-hidden="true">
            <span class="webtoon-prompt__arrow" aria-hidden="true">▾</span>
            <span>${escapeHtml(team.webtoonPrompt || "웹툰 감상하기")}</span>
          </div>
          <div class="webtoon-viewer" id="webtoonViewer-${team.order}" aria-label="${escapeAttr(team.title)} 웹툰"></div>
          ` : ""}

          <button type="button" class="accordion-toggle" aria-expanded="false" aria-controls="members-${team.order}">
            <span class="accordion-toggle__icon" aria-hidden="true">▾</span>
            <span>만든 사람들 보기</span>
          </button>
          <div class="accordion-panel" id="members-${team.order}"></div>
        </div>
      </div>
    `;

    // video embed
    const videoEmbed = article.querySelector(".video-embed");
    wireVideoEmbed(videoEmbed, team);

    // accordion + members
    const toggle = article.querySelector(".accordion-toggle");
    const panel = article.querySelector(".accordion-panel");
    panel.appendChild(buildMemberGallery(team.members || []));
    wireAccordion(toggle, panel);

    return article;
  }

  /* ---------------------------------------------------------
     4. 영상 임베드 — 클릭 시 재생, 자동재생 금지
  --------------------------------------------------------- */
  function wireVideoEmbed(container, team) {
    const thumbBtn = container.querySelector(".video-embed__thumb");
    if (!thumbBtn) return;

    thumbBtn.addEventListener("click", async () => {
      if (!team.videoUrl) {
        thumbBtn.querySelector(".video-embed__thumb-caption").textContent = "영상 준비 중입니다";
        return;
      }

      thumbBtn.disabled = true;
      thumbBtn.querySelector(".video-embed__thumb-caption").textContent = "불러오는 중…";

      const playerHost = document.createElement("div");
      playerHost.id = `yt-player-${team.order}`;
      container.innerHTML = "";
      container.appendChild(playerHost);

      const YT = await loadYouTubeAPI();
      new YT.Player(playerHost.id, {
        videoId: team.videoUrl,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            if (team.mediaType === "video+webtoon" && e.data === YT.PlayerState.ENDED) {
              revealWebtoonPrompt(team.order);
            }
          }
        }
      });
    });
  }

  /* ---------------------------------------------------------
     5. 웹툰 특수 흐름 — 재생 완료 → 안내 페이드인 →
        스크롤 → 안내 페이드아웃 & 웹툰 인라인 뷰어 노출
  --------------------------------------------------------- */
  function revealWebtoonPrompt(order) {
    const prompt = document.getElementById(`webtoonPrompt-${order}`);
    if (!prompt) return;

    prompt.setAttribute("aria-hidden", "false");
    prompt.classList.add("is-visible");

    let triggered = false;
    const onScroll = () => {
      if (triggered) return;
      triggered = true;
      window.removeEventListener("scroll", onScroll);
      fadeOutPromptAndOpenWebtoon(order);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function fadeOutPromptAndOpenWebtoon(order) {
    const prompt = document.getElementById(`webtoonPrompt-${order}`);
    const viewer = document.getElementById(`webtoonViewer-${order}`);
    if (prompt) {
      prompt.classList.add("is-fading");
      prompt.classList.remove("is-visible");
      window.setTimeout(() => prompt.setAttribute("aria-hidden", "true"), 600);
    }
    if (viewer && !viewer.dataset.rendered) {
      renderWebtoonViewer(viewer, order);
      viewer.dataset.rendered = "true";
    }
    if (viewer) viewer.classList.add("is-open");
  }

  function renderWebtoonViewer(viewer, order) {
    const team = data.teams.find((t) => t.order === order);
    if (!team) return;

    const images = team.webtoonImages;
    const cutCount = (images && images.length) || team.webtoonCutCount || 6;

    for (let i = 0; i < cutCount; i++) {
      const src = images && images[i];
      if (src) {
        const img = document.createElement("img");
        img.className = "webtoon-viewer__cut";
        img.src = src;
        img.alt = `${team.title} 웹툰 ${i + 1}컷`;
        img.loading = "lazy";
        viewer.appendChild(img);
      } else {
        const cut = document.createElement("div");
        cut.className = "webtoon-viewer__placeholder-cut";
        cut.setAttribute("role", "img");
        cut.setAttribute("aria-label", `${team.title} 웹툰 ${i + 1}컷 (이미지 준비 중)`);
        cut.textContent = `Cut ${String(i + 1).padStart(2, "0")} · 이미지 준비 중`;
        viewer.appendChild(cut);
      }
    }
  }

  /* ---------------------------------------------------------
     6. 아코디언 — 만든 사람들 보기
  --------------------------------------------------------- */
  function wireAccordion(toggle, panel) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("is-open", !expanded);
    });
  }

  function buildMemberGallery(members) {
    const gallery = document.createElement("div");
    gallery.className = "member-gallery";

    members.forEach((member) => {
      const item = document.createElement("div");
      item.className = "member";

      const frame = document.createElement("div");
      frame.className = "member__frame";

      if (member.illustration) {
        const img = document.createElement("img");
        img.className = "member__portrait";
        img.src = member.illustration;
        img.alt = `${member.name} 캐릭터 일러스트`;
        frame.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "member__portrait-placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.textContent = initials(member.name);
        frame.appendChild(placeholder);
      }

      const name = document.createElement("p");
      name.className = "member__name";
      name.textContent = member.name;

      const role = document.createElement("p");
      role.className = "member__role";
      role.textContent = member.role;

      const bio = document.createElement("p");
      bio.className = "member__bio";
      bio.textContent = member.bio;

      item.append(frame, name, role, bio);
      gallery.appendChild(item);
    });

    return gallery;
  }

  function initials(name) {
    if (!name) return "?";
    return name.trim().slice(-2);
  }

  /* ---------------------------------------------------------
     6.5 지도 교수진
  --------------------------------------------------------- */
  function renderFaculty() {
    const f = data.faculty;
    if (!f) return;

    const bodyEl = document.getElementById("facultyGreetingBody");
    if (bodyEl && f.greeting) {
      (f.greeting.paragraphs || []).forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        bodyEl.appendChild(p);
      });
    }

    const signEl = document.getElementById("facultyGreetingSign");
    if (signEl) {
      if (f.greeting && f.greeting.name) {
        signEl.textContent = `${f.greeting.name} ${f.greeting.title} 드림`;
      } else {
        signEl.remove();
      }
    }

    const groupsEl = document.getElementById("facultyGroups");
    if (groupsEl) {
      (f.groups || []).forEach((group) => {
        const wrap = document.createElement("div");
        wrap.className = "faculty__group";

        const label = document.createElement("p");
        label.className = "faculty__group-label";
        label.textContent = group.label;

        const names = document.createElement("p");
        names.className = "faculty__group-names";
        names.textContent = (group.names || []).join(" · ");

        wrap.append(label, names);
        groupsEl.appendChild(wrap);
      });
    }
  }

  /* ---------------------------------------------------------
     7. 크레딧
  --------------------------------------------------------- */
  function renderCredits() {
    const c = data.contact;
    if (!c) return;
    setText("creditsDept", c.department);

    const websiteEl = document.getElementById("creditsWebsite");
    if (websiteEl && c.website) {
      websiteEl.href = c.website;
      websiteEl.textContent = c.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }

    const igEl = document.getElementById("creditsInstagram");
    if (igEl && c.instagram) {
      igEl.href = c.instagram;
      const handle = c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
      igEl.textContent = `@${handle}`;
    }
  }

  /* ---------------------------------------------------------
     8. 유틸
  --------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
  function escapeAttr(str) { return escapeHtml(str); }

  /* ---------------------------------------------------------
     init
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderHero();
    renderFaculty();
    renderTOC();
    renderTeamCards();
    renderCredits();
    setupHeroParallax();
    openCurtain();
  });
})();
