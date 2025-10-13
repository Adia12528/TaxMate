gsap.registerPlugin(ScrollTrigger);

var tl =gsap.timeline()
tl.from("nav h1,nav h4, nav button ",{
    y:-30,
    opacity:0,
    delay:0.5,
    duration:0.7,
    stagger:0.15
})

tl.from(".center-part1 h1",{
    x:-300,
    opacity:0,
    duration:0.5
})


tl.from(".center-part1 p",{
    x:-100,
    opacity:0,
    duration:0.4
})


tl.from(".center-part1 button",{
   
    opacity:0,
    duration:0.4
})

tl.from(".center-part2 img",{
   
    opacity:0,
    x:200,
    duration:0.4
},"-=1")

tl.from(".section1bottom img",{
   
    opacity:0,
    y:30,
    stagger:0.1,
    duration:0.6,
   
    duration:0.4
})
tl.from(".work h1", {

    y:30,
    opacity:0,
    duration:0.6,
    scrollTrigger:{
        trigger:".work h1",
        scroller:"body",
        start:"top 80%",
        end:"top 30%", 
        scrub:1,
    }
});
gsap.registerPlugin(ScrollTrigger);

// Initial fade-in for hero text
gsap.from(".center-part1 h1", {
  opacity: 0,
  y: 30,
  duration: 1,
  ease: "power2.out",
});

gsap.from(".center-part1 p", {
  opacity: 0,
  y: 30,
  duration: 1,
  delay: 0.3,
  ease: "power2.out",
});

gsap.from(".center-part1 button", {
  opacity: 0,
  y: 20,
  duration: 0.8,
  delay: 0.6,
});

// Horizontal scroll animation
const scrollContainer = document.querySelector(".work-inner");
const totalScrollWidth = scrollContainer.scrollWidth - window.innerWidth;

gsap.to(scrollContainer, {
  x: -totalScrollWidth,
  ease: "none",
  scrollTrigger: {
    trigger: ".work",
    start: "top top",
    end: () => "+=" + totalScrollWidth,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  },
});

// Optional fade-in when entering the section
gsap.from(".work h2", {
  opacity: 0,
  y: 50,
  stagger: 0.3,
  duration: 1,
  scrollTrigger: {
    trigger: ".work",
    start: "top 80%",
  },
});
gsap.from(".next-content h3", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  scrollTrigger: {
    trigger: ".next",
    start: "top 80%",
  },
});

gsap.from(".next-content h1", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  delay: 0.2,
  scrollTrigger: {
    trigger: ".next",
    start: "top 80%",
  },
});

gsap.from(".next-content p", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  delay: 0.4,
  scrollTrigger: {
    trigger: ".next",
    start: "top 80%",
  },
});

gsap.from(".next-content button", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  delay: 0.6,
  scrollTrigger: {
    trigger: ".next",
    start: "top 80%",
  },
});
gsap.from(".footer-container > div", {
  opacity: 0,
  y: 30,
  stagger: 0.2,
  duration: 1,
  scrollTrigger: {
    trigger: ".footer",
    start: "top 90%",
  },
});

gsap.from(".footer-bottom", {
  opacity: 0,
  y: 20,
  duration: 1,
  delay: 0.5,
  scrollTrigger: {
    trigger: ".footer",
    start: "top 90%",
  },
});

// Pin the hero video container and lock scroll for 20 seconds when it enters view
const heroVideoContainer = document.querySelector('.hero-video-container');
if (heroVideoContainer) {
  // require a real user interaction (wheel/touch/keydown/mousedown) before triggering
  let userHasInteracted = false;

  const setUserInteracted = () => {
    userHasInteracted = true;
    // remove listeners after first interaction
    window.removeEventListener('wheel', setUserInteracted);
    window.removeEventListener('touchstart', setUserInteracted);
    window.removeEventListener('keydown', setUserInteracted);
    window.removeEventListener('mousedown', setUserInteracted);
  };

  window.addEventListener('wheel', setUserInteracted, { passive: true });
  window.addEventListener('touchstart', setUserInteracted, { passive: true });
  window.addEventListener('keydown', setUserInteracted, { passive: true });
  window.addEventListener('mousedown', setUserInteracted, { passive: true });

  ScrollTrigger.create({
    trigger: heroVideoContainer,
    start: 'top center',
    onEnter: () => {
      // ensure the user actually scrolled/interacted before pinning
      if (!userHasInteracted) return;

      // only trigger once
      if (heroVideoContainer.classList.contains('pinned')) return;

      // pin visually via class
      heroVideoContainer.classList.add('pinned');

      // lock scroll
      document.documentElement.classList.add('body-fixed-lock');
      document.body.classList.add('body-fixed-lock');

      // ensure video plays
      const vid = heroVideoContainer.querySelector('video');
      if (vid) {
        vid.play().catch(() => {});
      }

      // show overlay and start countdown
      const overlay = heroVideoContainer.querySelector('.hero-video-overlay');
      const countdownEl = heroVideoContainer.querySelector('.hero-video-overlay .countdown');
      const skipBtn = heroVideoContainer.querySelector('.hero-video-overlay .skip-btn');
      let remaining = 20;
      let countdownTimer = null;

      if (overlay && countdownEl) {
        countdownEl.textContent = String(remaining);
        overlay.style.display = 'flex';

        countdownTimer = setInterval(() => {
          remaining -= 1;
          countdownEl.textContent = String(remaining);
          if (remaining <= 0) {
            clearInterval(countdownTimer);
            overlay.style.display = 'none';
            heroVideoContainer.classList.remove('pinned');
            document.documentElement.classList.remove('body-fixed-lock');
            document.body.classList.remove('body-fixed-lock');
          }
        }, 1000);
      }

      const cleanup = () => {
        if (countdownTimer) clearInterval(countdownTimer);
        if (overlay) overlay.style.display = 'none';
        heroVideoContainer.classList.remove('pinned');
        document.documentElement.classList.remove('body-fixed-lock');
        document.body.classList.remove('body-fixed-lock');
      };

      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          cleanup();
        });
      }
    },
    once: true,
  });
}
