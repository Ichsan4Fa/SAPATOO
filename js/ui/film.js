// The film plays only while it is on screen, and not at all for reduced motion.
export const startFilm = () => {
  const video = document.querySelector('.faq__film video');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.removeAttribute('autoplay'); video.pause(); return; }
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {}); else video.pause();
  });
  observer.observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
};
