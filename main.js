// custom cursor follow
const cursor = document.getElementById("hollow-cursor");
let cx = window.innerWidth / 2;
let cy = window.innerHeight / 2;
let tx = cx;
let ty = cy;

window.addEventListener("mousemove", (e) => {
  tx = e.clientX;
  ty = e.clientY;
});

function loopCursor() {
  cx += (tx - cx) * 0.12;
  cy += (ty - cy) * 0.12;
  cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  requestAnimationFrame(loopCursor);
}
loopCursor();

// background particles (ash / hollow effect)
const canvas = document.getElementById("hollow-particles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function makeParticles() {
  particles = [];
  const total = Math.floor((canvas.width * canvas.height) / 30000);
  for (let i = 0; i < total; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.1 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 0.25 + 0.02,
      alpha: Math.random() * 0.35 + 0.05,
    });
  }
}
makeParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(210,210,240,${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    p.x += p.vx;
    p.y -= p.vy * 0.25;

    if (p.x < -10) p.x = canvas.width + 10;
    if (p.x > canvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = canvas.height + 10;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// GSAP reveal
if (window.gsap) {
  gsap.utils.toArray(".section, .hero").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.7,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      }
    });
  });
}

// hero image rotator
// hero image rotator
const heroImg = document.querySelector(".hero-img");
const heroImages = [
  "images/hero-bg.png",
  "images/photo_2025-10-27_17-14-31.jpg",
  "images/photo_2025-10-27_17-15-25.jpg",
  "images/photo_2025-10-28_22-34-09.jpg",
  "images/thumb-1.jpg.jpg"
];

let current = 0;

function rotateHero() {
  if (!heroImg) return;
  current = (current + 1) % heroImages.length;
  if (window.gsap) {
    gsap.to(heroImg, {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        heroImg.src = heroImages[current];
        gsap.to(heroImg, { opacity: 1, duration: 0.8 });
      }
    });
  } else {
    heroImg.src = heroImages[current];
  }
}
setInterval(rotateHero, 7000);

// ====== HOLLOW PFP GENERATOR ======
const pfpCanvas = document.getElementById("pfp-canvas");
const pfpCtx = pfpCanvas ? pfpCanvas.getContext("2d") : null;

if (pfpCanvas && pfpCtx) {
  const PFP = {
    size: 420,
    bg: "#ffffff",
    base: "images/pfp/nobg.png",
    hat: null,
    // let multiple extras
    extrasSelected: [],
    hats: [
      { id: "greyhat",  label: "Grey hat",  src: "images/pfp/greyhat.png" },
      { id: "whitehat", label: "White hat", src: "images/pfp/whitehat.png" },
      { id: "pinkhat",  label: "Pink hat",  src: "images/pfp/pinkhat.png" },
      { id: "redhat",   label: "Red hat",   src: "images/pfp/redhat.png" },
      { id: "bluehat",  label: "Blue hat",  src: "images/pfp/bluehat.png" },
      { id: "greenhat", label: "Green hat", src: "images/pfp/greenhat.png" },
    ],
    extras: [
      { id: "watch", label: "Watch", src: "images/pfp/watch.png" },
      { id: "chain", label: "Chain", src: "images/pfp/chain.png" },
    ],
  };

  const hatListEl = document.getElementById("pfp-hat-list");
  const extraListEl = document.getElementById("pfp-extra-list");
  const bgListEl = document.getElementById("pfp-bg-list");
  const dlBtn = document.getElementById("pfp-download");

  pfpCanvas.width = PFP.size;
  pfpCanvas.height = PFP.size;

  function loadImg(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn("kon afbeelding niet laden:", src);
        resolve(null);
      };
      img.src = src;
    });
  }

  async function renderPfp() {
    // background
    if (PFP.bg === "transparent") {
      pfpCtx.clearRect(0, 0, PFP.size, PFP.size);
    } else {
      pfpCtx.fillStyle = PFP.bg;
      pfpCtx.fillRect(0, 0, PFP.size, PFP.size);
    }

    // base
    const baseImg = await loadImg(PFP.base);
    if (baseImg) pfpCtx.drawImage(baseImg, 0, 0, PFP.size, PFP.size);

    // hat
    if (PFP.hat) {
      const hatImg = await loadImg(PFP.hat);
      if (hatImg) pfpCtx.drawImage(hatImg, 0, 0, PFP.size, PFP.size);
    }

    // ALL selected extras (in order)
    for (const exId of PFP.extrasSelected) {
      const exDef = PFP.extras.find((e) => e.id === exId);
      if (!exDef) continue;
      const exImg = await loadImg(exDef.src);
      if (exImg) pfpCtx.drawImage(exImg, 0, 0, PFP.size, PFP.size);
    }
  }

  // HATS (with "No hat")
  if (hatListEl) {
    const noneHatBtn = document.createElement("button");
    noneHatBtn.className = "pfp-option active";
    noneHatBtn.textContent = "No hat";
    noneHatBtn.addEventListener("click", () => {
      hatListEl.querySelectorAll(".pfp-option").forEach((b) => b.classList.remove("active"));
      noneHatBtn.classList.add("active");
      PFP.hat = null;
      renderPfp();
    });
    hatListEl.appendChild(noneHatBtn);

    PFP.hats.forEach((hat) => {
      const btn = document.createElement("button");
      btn.className = "pfp-option";
      btn.textContent = hat.label;
      btn.addEventListener("click", () => {
        hatListEl.querySelectorAll(".pfp-option").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        PFP.hat = hat.src;
        renderPfp();
      });
      hatListEl.appendChild(btn);
    });
  }

  // EXTRAS – now toggles, and we add a "None" that clears all
  if (extraListEl) {
    const noneBtn = document.createElement("button");
    noneBtn.className = "pfp-option active";
    noneBtn.textContent = "None";
    noneBtn.addEventListener("click", () => {
      // clear all
      PFP.extrasSelected = [];
      extraListEl.querySelectorAll(".pfp-option").forEach((b) => b.classList.remove("active"));
      noneBtn.classList.add("active");
      renderPfp();
    });
    extraListEl.appendChild(noneBtn);

    PFP.extras.forEach((ex) => {
      const btn = document.createElement("button");
      btn.className = "pfp-option";
      btn.textContent = ex.label;
      btn.addEventListener("click", () => {
        // if this extra is selected → remove, else add
        const idx = PFP.extrasSelected.indexOf(ex.id);
        if (idx >= 0) {
          PFP.extrasSelected.splice(idx, 1);
          btn.classList.remove("active");
        } else {
          PFP.extrasSelected.push(ex.id);
          btn.classList.add("active");
          // also remove "None" active state
          const firstBtn = extraListEl.querySelector(".pfp-option");
          if (firstBtn) firstBtn.classList.remove("active");
        }
        renderPfp();
      });
      extraListEl.appendChild(btn);
    });
  }

  // BACKGROUNDS
  if (bgListEl) {
    const bgBtns = bgListEl.querySelectorAll(".pfp-bg-btn");
    bgBtns.forEach((btn, idx) => {
      const col = btn.dataset.color;
      btn.style.background =
        col === "transparent"
          ? "linear-gradient(135deg, #ccc 25%, #eee 25%, #eee 50%, #ccc 50%, #ccc 75%, #eee 75%, #eee 100%)"
          : col;
      if (idx === 0) btn.classList.add("active");
      btn.addEventListener("click", () => {
        bgBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        PFP.bg = col;
        renderPfp();
      });
    });
  }

  // download
  if (dlBtn) {
    dlBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = "hollow-pfp.png";
      link.href = pfpCanvas.toDataURL("image/png");
      link.click();
    });
  }

  renderPfp();
}

