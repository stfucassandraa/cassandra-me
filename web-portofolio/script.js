document.addEventListener("DOMContentLoaded", () => {
  initializeTheme()
  initializeLoading()
  initializeNavigation()
  initializeScrollAnimations()
  initializeSmoothScroll()
  initSplitText()
  initializeTooltips()
  initializeCopyButtons()
  initializeKeyboardNavigation()
})

// Copy to clipboard
function initializeCopyButtons() {
  document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', async function() {
      const text = this.getAttribute('data-copy')

      try {
        await navigator.clipboard.writeText(text)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;left:-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }

      this.classList.add('copied')
      setTimeout(() => this.classList.remove('copied'), 2000)
      showToast('Copied to clipboard!')
    })
  })
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;
    background:#10B981;color:#fff;
    padding:.75rem 1.25rem;border-radius:8px;
    box-shadow:0 4px 16px rgba(0,0,0,.15);
    font-size:.9rem;font-weight:500;z-index:10000;
    animation:toastIn .25s ease;
  `
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes toastOut{to{opacity:0;transform:translateY(8px)}}
    </style>
  `)
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = 'toastOut .25s ease forwards'
    setTimeout(() => toast.remove(), 250)
  }, 2500)
}

// Keyboard shortcuts
function initializeKeyboardNavigation() {
  const navMenu   = document.getElementById('nav-menu')
  const hamburger = document.getElementById('hamburger')

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active')
      navMenu.classList.remove('active')
      hamburger.setAttribute('aria-expanded', 'false')
      hamburger.focus()
    }

    if (e.altKey && e.key === 't') {
      e.preventDefault()
      document.getElementById('theme-toggle').click()
    }
  })
}

// Tooltip
function initializeTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    const track = el.closest('.logo-loop__track')
    if (!track) return
    el.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused')
    el.addEventListener('mouseleave', () => track.style.animationPlayState = 'running')
  })
}

// Theme
function initializeTheme() {
  const toggle = document.getElementById('theme-toggle')
  const saved  = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'))

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    createRipple(toggle)
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }
  })
}

function createRipple(button) {
  const ripple = document.createElement('span')
  const size   = Math.max(button.offsetWidth, button.offsetHeight)
  ripple.style.cssText = `
    position:absolute;width:${size}px;height:${size}px;
    border-radius:50%;background:var(--accent);opacity:.4;
    top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
    animation:ripple .6s ease-out;pointer-events:none;
  `
  document.head.insertAdjacentHTML('beforeend',
    `<style>@keyframes ripple{to{transform:translate(-50%,-50%) scale(2);opacity:0}}</style>`)
  button.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
}

// Loading Screen
function initializeLoading() {
  const screen = document.getElementById('loading-screen')
  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('fade-out')
      setTimeout(() => screen.style.display = 'none', 500)
    }, 600)
  })
}

// Navigation
function initializeNavigation() {
  const navbar    = document.getElementById('navbar')
  const hamburger = document.getElementById('hamburger')
  const navMenu   = document.getElementById('nav-menu')
  const navLinks  = document.querySelectorAll('.nav-link')
  const progress  = document.getElementById('scroll-progress')

  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('active')
    hamburger.classList.toggle('active', open)
    hamburger.setAttribute('aria-expanded', String(open))
    navMenu.setAttribute('aria-hidden', String(!open))
  })

  hamburger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hamburger.click() }
  })

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active')
      navMenu.classList.remove('active')
      hamburger.setAttribute('aria-expanded', 'false')
      navMenu.setAttribute('aria-hidden', 'true')
    })
  })

  let rafId
  window.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 50)

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      progress.style.width = scrollable > 0
        ? `${Math.min((window.scrollY / scrollable) * 100, 100)}%`
        : '0%'

      let current = ''
      document.querySelectorAll('section[id]').forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) current = section.id
      })
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${current}`
        link.classList.toggle('active', active)
        active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current')
      })
    })
  }, { passive: true })
}

// scroll animation + skill bars
function initializeScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('visible')
      if (entry.target.classList.contains('skill-card')) animateSkillBars(entry.target)
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}

function animateSkillBars(card) {
  card.querySelectorAll('.skill-progress-fill').forEach((bar, i) => {
    setTimeout(() => {
      bar.style.setProperty('--progress-width', `${bar.dataset.progress}%`)
      bar.classList.add('animated')
    }, i * 150)
  })
}

// smooth scroll features
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const id = link.getAttribute('href')
      if (id === '#') return
      const target = document.querySelector(id)
      if (target) window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' })
    })
  })
}

// SplitText hero heading
function initSplitText() {
  const el = document.getElementById('split-text-hero')
  if (!el) return

  // fix on Mobile
  if (window.innerWidth <= 820) {
    el.classList.add('visible')
    return
  }

  const text = el.dataset.splitText || el.textContent
  const STAGGER  = 80
  const DURATION = 600

  const ready = document.fonts?.ready ?? Promise.resolve()
  ready.then(() => {
    el.innerHTML = ''
    const chars = []

    for (const char of text) {
      const span = document.createElement('span')
      span.className = 'split-char'
      if (char === ' ') {
        span.classList.add('is-space')
        span.innerHTML = '&nbsp;'
      } else if (char === '.') {
        span.textContent = char
        span.classList.add('split-dot')
      } else {
        span.textContent = char
      }
      el.appendChild(span)
      chars.push(span)
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      chars.forEach((span, i) => {
        span.style.animationDelay = `${i * STAGGER}ms`
        span.classList.add('animate')
      })
      observer.unobserve(el)
    }, { threshold: 0.1 })

    observer.observe(el)
  })
}

    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      chars.forEach((span, i) => {
        span.style.animationDelay = `${i * STAGGER}ms`
        span.classList.add('animate')
      })
      observer.unobserve(el)
    }, { threshold: 0.1 })

    observer.observe(el)
  })
}

// Hero parallax
let parallaxId
window.addEventListener('scroll', () => {
  if (parallaxId) cancelAnimationFrame(parallaxId)
  parallaxId = requestAnimationFrame(() => {
    const hero = document.querySelector('.hero')
    if (hero && window.scrollY < window.innerHeight) {
      hero.style.transform = `translateY(${window.scrollY * -0.5}px)`
    }
  })
}, { passive: true })

