import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

// Ordem de exibição no carrossel; quem não estiver na lista vem depois, na ordem original
const PREFERRED_ORDER = ['teu', 'gustavo', 'matheus'];
const rankOf = (barber) => {
  const i = PREFERRED_ORDER.indexOf(String(barber.name || '').trim().toLowerCase());
  return i === -1 ? PREFERRED_ORDER.length : i;
};

const mod = (a, n) => ((a % n) + n) % n;
// Distância circular no intervalo [-n/2, n/2): é o que torna o carrossel "infinito"
const wrapOffset = (d, n) => {
  const m = mod(d, n);
  return m >= n / 2 ? m - n : m;
};

const SPACING = 0.8; // deslocamento lateral entre cards, em fração da largura do card
const DRAG_START_PX = 6;
const SWIPE_MIN_PX = 30;

export default function BarberCarousel({ barbers, selectedBarberId, onSelect }) {
  const ordered = useMemo(
    () => barbers
      .map((b, i) => ({ b, i }))
      .sort((x, y) => rankOf(x.b) - rankOf(y.b) || x.i - y.i)
      .map(x => x.b),
    [barbers]
  );
  const n = ordered.length;

  const initialIndex = Math.max(0, ordered.findIndex(b => b.id === selectedBarberId));
  const [pos, setPos] = useState(initialIndex); // posição contínua (não limitada) do carrossel
  const posRef = useRef(initialIndex);
  const targetRef = useRef(initialIndex);
  const animRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const stageRef = useRef(null);

  const updatePos = (p) => {
    posRef.current = p;
    setPos(p);
  };

  const animateTo = useCallback((target) => {
    cancelAnimationFrame(animRef.current);
    targetRef.current = target;
    const from = posRef.current;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) {
      updatePos(target);
      return;
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 1 : 420;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      updatePos(from + delta * eased);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const goTo = useCallback((target) => {
    if (!n) return;
    animateTo(target);
    const barber = ordered[mod(target, n)];
    if (barber && barber.id !== selectedBarberId) onSelect(barber.id);
  }, [animateTo, n, ordered, selectedBarberId, onSelect]);

  // Mantém o carrossel alinhado se a seleção mudar por fora (ou se o selecionado não existir)
  useEffect(() => {
    if (!n) return;
    const idx = ordered.findIndex(b => b.id === selectedBarberId);
    if (idx === -1) {
      onSelect(ordered[mod(targetRef.current, n)].id);
      return;
    }
    const current = targetRef.current;
    if (mod(current, n) !== idx) animateTo(current + wrapOffset(idx - current, n));
  }, [selectedBarberId, ordered, n, animateTo, onSelect]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const stepPx = () => {
    const card = stageRef.current?.querySelector('[data-carousel-card]');
    return Math.max(80, (card?.offsetWidth || 300) * SPACING);
  };

  const handlePointerDown = (e) => {
    if (n < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    movedRef.current = false;
    dragRef.current = { x: e.clientX, y: e.clientY, startPos: posRef.current, active: false };
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.active) {
      // Só vira arraste se o gesto for horizontal; vertical continua rolando a página
      if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
      drag.active = true;
      movedRef.current = true;
      cancelAnimationFrame(animRef.current);
      drag.startPos = posRef.current;
      drag.x = e.clientX;
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ponteiro já liberado */ }
      return;
    }
    updatePos(drag.startPos - dx / stepPx());
  };

  const handlePointerEnd = (e) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.active) return;
    const dx = e.clientX - drag.x;
    const base = Math.round(drag.startPos);
    let target = Math.round(posRef.current);
    // Um gesto curto e decidido também troca de profissional
    if (target === base && Math.abs(dx) > SWIPE_MIN_PX) target = base + (dx < 0 ? 1 : -1);
    goTo(target);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(targetRef.current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(targetRef.current - 1); }
  };

  if (!n) return null;

  const activeIndex = mod(Math.round(pos), n);
  const fadeEdge = n / 2;

  return (
    <div className="space-y-4">
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Profissionais"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative grid place-items-center overflow-hidden py-4 -mx-4 px-4 select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-2xl cursor-grab active:cursor-grabbing"
        style={{ perspective: '1200px', touchAction: 'pan-y' }}
      >
        {ordered.map((barber, i) => {
          const d = wrapOffset(i - pos, n);
          const abs = Math.abs(d);
          const isCenter = i === activeIndex;
          const isSelected = isCenter && barber.id === selectedBarberId;
          let opacity = 1 - 0.45 * Math.min(abs, 1);
          if (abs > 1 && fadeEdge > 1) opacity = Math.max(0, 0.55 * (fadeEdge - abs) / (fadeEdge - 1));

          return (
            <div
              key={barber.id}
              data-carousel-card
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                if (movedRef.current) return;
                if (!isCenter) goTo(Math.round(posRef.current) + Math.round(d));
              }}
              className={`[grid-area:1/1] w-[64%] max-w-[300px] p-5 rounded-2xl border metallic-card ${
                isSelected
                  ? 'border-amber-400/80 ring-2 ring-amber-400/30 bg-gradient-to-b from-slate-900 to-[#1b1e26]'
                  : 'border-white/10'
              } ${isCenter ? '' : 'cursor-pointer'}`}
              style={{
                transform: `translateX(${d * SPACING * 100}%) scale(${1 - 0.16 * Math.min(abs, 1.5)}) rotateY(${-d * 18}deg)`,
                opacity,
                zIndex: 100 - Math.round(abs * 10),
                pointerEvents: opacity < 0.1 ? 'none' : 'auto',
                willChange: 'transform, opacity'
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    draggable={false}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-600 shadow-md"
                  />
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-lg">
                      <Check className="w-3.5 h-3.5 font-bold" />
                    </div>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-white">{barber.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{barber.role}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">{barber.specialty}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center text-xs">
                <span className={`font-semibold flex items-center gap-1 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                  {isSelected ? 'Selecionado' : 'Toque para escolher'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(targetRef.current - 1)}
            aria-label="Profissional anterior"
            className="p-2 rounded-full border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {ordered.map((barber, i) => (
              <button
                key={barber.id}
                type="button"
                onClick={() => goTo(targetRef.current + wrapOffset(i - targetRef.current, n))}
                aria-label={`Escolher ${barber.name}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(targetRef.current + 1)}
            aria-label="Próximo profissional"
            className="p-2 rounded-full border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
