/* КИШЛАК / АПФС ARCHIVE — interactions */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year stamps ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- active nav ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- header: scrolled + progress ---------- */
  const header = $('.site-header');
  const progress = $('.progress span');
  const toTop = $('.to-top');

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const nav = $('#nav');
  if (menuBtn && nav) {
    const setMenu = open => {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', () => {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 940) setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- animated counters ---------- */
  const counters = $$('[data-count]');
  const animateCount = el => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    if (!Number.isFinite(target)) return;
    if (reduce) { el.textContent = prefix + target + suffix; return; }
    const dur = 1200;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- project filters ---------- */
  const filters = $$('.filter');
  const projectCards = $$('[data-tags]');
  if (filters.length && projectCards.length) {
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        filters.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        projectCards.forEach(card => {
          const show = f === 'all' || card.dataset.tags.split(' ').includes(f);
          card.classList.toggle('project--hidden', !show);
        });
      });
    });
  }

  /* ---------- quote rotator ---------- */
  const quoteEl = $('[data-quote-text]');
  const quoteSrc = $('[data-quote-src]');
  const quoteBtn = $('[data-quote-next]');
  if (quoteEl && quoteBtn) {
    const quotes = [
      {
        text: '«Сошлись два алкоголика и родили меня».',
        src: 'О детстве · из интервью'
      },
      {
        text: '«Люди думали, что употреблять наркотики — это очень круто и весело. А в „Автостопом по фазе сна“ я хотел донести, что не надо жить так, как я».',
        src: 'О закрытии АПФС · The Flow, 2023'
      },
      {
        text: '«Самый лучший день — это никогда».',
        src: '«Самый лучший день» · Эскапист, 2022'
      },
      {
        text: '«Я начал понимать, что музыка, которую я делаю, несёт не тот посыл, который я хотел».',
        src: 'О проекте АПФС'
      },
      {
        text: '«Мне кажется, что судьбой управлять невозможно. Дважды чуть не сел в тюрьму, несколько раз мог уйти из жизни — и меня всё толкало к тому, что я стою здесь».',
        src: 'Из интервью · Artchange'
      }
    ];
    let qi = 0;
    quoteBtn.addEventListener('click', () => {
      qi = (qi + 1) % quotes.length;
      quoteEl.style.opacity = '0';
      quoteEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        quoteEl.textContent = quotes[qi].text;
        quoteSrc.textContent = quotes[qi].src;
        quoteEl.style.opacity = '1';
        quoteEl.style.transform = 'none';
      }, reduce ? 0 : 160);
    });
    quoteEl.style.transition = 'opacity .16s ease, transform .16s ease';
  }

  /* ---------- album explorer ---------- */
  const albumData = {
    apfs: {
      year: '2018—2020 · проект',
      title: 'Автостопом по фазе сна',
      desc: 'Не альбом, а целая эпоха и визуальный язык этого сайта. Максим придумал АПФС в 14 лет, записывал треки на диктофон, а позже собрал вокруг проекта первую аудиторию. Грязный звук, подъезды, ночные дороги, сатира на самого себя — и главная ошибка: слушатели приняли это за инструкцию. В марте 2020 года проект был закрыт.',
      tracks: ['Эхо 51', 'Слепые', 'Мам, я умираю', 'Я впадаю в кому', 'Собачий вальс'],
      tags: ['lo-fi', 'эмо', 'сатира', '2018—2020'],
      hint: 'Треки-ориентиры из трёх релизов проекта: «Твой Первый Суицид» (2018), «Кругосветка в рамках черепной коробки» (2019), «Собачий вальс» (2020).'
    },
    '1111': {
      year: '17.08.2020 · LP',
      title: '11:11',
      desc: 'Дебютный полноформатник под новым именем. 11 треков, чуть больше получаса, на стыке эмо, рэпа, панка и рока. Аудиотег «11:11» звучит почти в каждом треке; «11:11» — это смена эпох и ключ к тайнам вселенной, если верить описанию комьюнити.',
      tracks: ['Марсиане'],
      tags: ['дебют', '11:11', '2020'],
      hint: 'Полный треклист — в стриминговых сервисах. «Марсиане» — первая песня новой эпохи.'
    },
    shik: {
      year: 'июнь 2021 · LP',
      title: 'СХИК',
      desc: '«Сборник хуйни и картинки» — первый релиз на Sony и история пары, которая тонет в зависимостях и любви. Именно здесь появляются «Эй», «Я диско шар» и «Дрочу на твои фото». Часть треков вырезали из-за цензуры, а кавер на «Ранеток» так и не вышел.',
      tracks: ['Эй', 'Я диско шар', 'Дрочу на твои фото', 'alfa-pve'],
      tags: ['Sony', 'эмо-рэп', '2021'],
      hint: 'Четыре самые известные точки альбома; полный треклист — в стримингах.'
    },
    escapist: {
      year: '04.03.2022 · LP',
      title: 'Эскапист',
      desc: 'Отказ от «музыки на коленке»: громкие гитары, клавиши, танцевальные биты. Москва сначала «подъедает» героя, а к финалу — «схавала». «Самый лучший день» и «Слёзы» стали гимнами для тех, кто устал быть собой.',
      tracks: ['Самый лучший день', 'Слёзы', 'Двинулся на тебе', 'Настя'],
      tags: ['альт-рок', 'Москва', '2022'],
      hint: 'Ориентиры по альбому; на «Двинулся на тебе» есть скрипт-ответ критикам за «опопсение».'
    },
    per: {
      year: 'ноябрь 2022 · EP',
      title: 'Пацанский эмо-рэп',
      desc: 'Совместный EP с Семьсот Семь: четыре трека, мрачные исповеди и попытка закрепить новый вектор. «По-старому» — про ад, в котором всё так же, как по-старому.',
      tracks: ['По-старому'],
      tags: ['семьсот семь', 'EP', '2022'],
      hint: 'EP из четырёх треков; «По-старому» — главный ориентир.'
    },
    shik2: {
      year: 'ноябрь 2023 · LP',
      title: 'СХИК2',
      desc: '19 треков, подведение итогов: от малиновой «лады» до стадионов. Здесь уже много трезвости, рефлексии и попытки вернуться к истокам на новом уровне. «Ржавый» и «Грязный кайф» — самые атмосферные точки альбома.',
      tracks: ['Ржавый', 'Грязный кайф', 'Холодно', 'СХИК2'],
      tags: ['19 треков', 'трезвость', '2023'],
      hint: '19 треков — самый длинный альбом в дискографии.'
    },
    per2: {
      year: 'осень 2024 · LP',
      title: 'Пацанский эмо-рэп 2',
      desc: 'Второй совместный альбом с Семьсот Семь. Позитивнее и злее одновременно: путь к успеху, гангстерский вайб и обложка, вдохновлённая кадром покушения на Трампа. «Стиральная машина» и «Робот» — главные треки.',
      tracks: ['Стиральная машина', 'Робот'],
      tags: ['семьсот семь', '2024'],
      hint: 'Два самых популярных трека релиза.'
    },
    popsa: {
      year: '02.05.2025 · LP',
      title: 'POPSA 2025',
      desc: 'Меланхоличный, цепкий и тягучий альбом с автотюном и любовью к поп-эстетике. 10 песен, среди них «Заколдовала» с Дианой Астер. Попса здесь — не ругательство, а способ говорить о боли проще.',
      tracks: ['Заколдовала', '02.06.2022'],
      tags: ['поп', 'автотюн', '2025'],
      hint: '10 треков; «Заколдовала» — с Дианой Астер, «02.06.2022» — про знакомство с Александрой.'
    },
    vdps: {
      year: '11.09.2026 · LP',
      title: 'ВДПС',
      desc: '«Всемирный день предотвращения самоубийств». Девять треков, семь смертных грехов и главная мысль: прошлые ошибки не отменяют права на будущее. Самый светлый — и самый тяжёлый — альбом на этом сайте.',
      tracks: ['Когда я умер', 'Поцелуями'],
      tags: ['7 грехов', '2026', 'надежда'],
      hint: 'Концепция: семь смертных грехов. Девять треков, включая инструментальные связки.'
    }
  };

  const albumBtns = $$('.album-btn');
  const detail = $('.album-detail');
  if (albumBtns.length && detail) {
    const dYear = $('[data-album-year]', detail);
    const dTitle = $('[data-album-title]', detail);
    const dDesc = $('[data-album-desc]', detail);
    const dTracks = $('[data-album-tracks]', detail);
    const dTags = $('[data-album-tags]', detail);
    const dHint = $('[data-album-hint]', detail);

    const render = key => {
      const data = albumData[key];
      if (!data) return;
      dYear.textContent = data.year;
      dTitle.textContent = data.title;
      dDesc.textContent = data.desc;
      dTracks.innerHTML = data.tracks
        .map((t, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${t}</li>`)
        .join('');
      dTags.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');
      if (dHint) dHint.textContent = data.hint || '';
    };

    const activate = key => {
      const btn = albumBtns.find(b => b.dataset.album === key);
      if (!btn) return false;
      albumBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      render(key);
      return true;
    };

    albumBtns.forEach(btn => {
      btn.addEventListener('click', () => activate(btn.dataset.album));
    });

    const wanted = new URLSearchParams(location.search).get('album');
    if (!(wanted && activate(wanted))) activate('1111');
  }

  /* ---------- smooth anchor offset for sticky header ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 118;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

})();
