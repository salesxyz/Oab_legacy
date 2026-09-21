import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import styles from './ScrollStack.module.css';

type ScrollStackItemProps = {
  children: ReactNode;
  itemClassName?: string;
};

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
};

export function ScrollStackItem({ children, itemClassName = '' }: ScrollStackItemProps) {
  return (
    <article data-scroll-stack-card className={`${styles.card} ${itemClassName}`.trim()}>
      {children}
    </article>
  );
}

export function ScrollStack({
  children,
  className = '',
  itemDistance = 72,
  itemScale = 0.025,
  itemStackDistance = 28,
  stackPosition = '18%',
  scaleEndPosition = '8%',
  baseScale = 0.9,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const completedRef = useRef(false);

  const updateTransforms = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = cardsRef.current;
    const viewportHeight = useWindowScroll ? window.innerHeight : root.clientHeight;
    const scrollTop = useWindowScroll ? window.scrollY : root.scrollTop;
    const stackPositionPx = parsePosition(stackPosition, viewportHeight);
    const scaleEndPositionPx = parsePosition(scaleEndPosition, viewportHeight);
    const endElement = root.querySelector<HTMLElement>('[data-scroll-stack-end]');
    const endTop = endElement ? endElement.getBoundingClientRect().top + scrollTop : 0;
    const pinEnd = endTop - viewportHeight / 2;

    cards.forEach((card, index) => {
      const cardTop = useWindowScroll ? card.getBoundingClientRect().top + window.scrollY : card.offsetTop;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * index;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const progress = clamp((scrollTop - triggerStart) / Math.max(triggerEnd - triggerStart, 1), 0, 1);
      const targetScale = baseScale + index * itemScale;
      const scale = 1 - progress * (1 - targetScale);
      const isPinned = scrollTop >= triggerStart && scrollTop <= pinEnd;
      const translateY = isPinned ? scrollTop - cardTop + stackPositionPx + itemStackDistance * index : scrollTop > pinEnd ? pinEnd - cardTop + stackPositionPx + itemStackDistance * index : 0;

      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${index * rotationAmount * progress}deg)`;
      card.style.filter = blurAmount && index < cards.length - 1 ? `blur(${Math.max(0, (cards.length - index - 1) * blurAmount * progress)}px)` : '';
    });

    const lastCard = cards.at(-1);
    const lastTop = lastCard ? lastCard.getBoundingClientRect().top + scrollTop : 0;
    const isComplete = Boolean(lastCard && scrollTop >= lastTop - stackPositionPx && scrollTop <= pinEnd);
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onStackComplete?.();
    } else if (!isComplete) {
      completedRef.current = false;
    }
  }, [baseScale, blurAmount, itemScale, itemStackDistance, onStackComplete, rotationAmount, scaleEndPosition, stackPosition, useWindowScroll]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    cardsRef.current = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll-stack-card]'));
    cardsRef.current.forEach((card, index) => {
      card.style.marginBottom = index === cardsRef.current.length - 1 ? '0' : `${itemDistance}px`;
      card.style.willChange = 'transform, filter';
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reducedMotion
      ? null
      : new Lenis({
          wrapper: useWindowScroll ? undefined : root,
          content: useWindowScroll ? undefined : root.firstElementChild ?? undefined,
          duration: scaleDuration,
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: true,
        });
    const raf = (time: number) => {
      lenis?.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    if (lenis) {
      lenisRef.current = lenis;
      lenis.on('scroll', updateTransforms);
      animationFrameRef.current = requestAnimationFrame(raf);
    }

    const handleScroll = () => updateTransforms();
    const scrollTarget = useWindowScroll ? window : root;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    updateTransforms();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lenis?.destroy();
      lenisRef.current = null;
      cardsRef.current = [];
    };
  }, [itemDistance, scaleDuration, updateTransforms, useWindowScroll]);

  return (
    <div ref={rootRef} className={`${styles.scroller} ${className}`.trim()}>
      <div className={styles.inner}>
        {children}
        <div data-scroll-stack-end className={styles.end} />
      </div>
    </div>
  );
}

export default ScrollStack;

function parsePosition(value: string, height: number) {
  return value.includes('%') ? (Number.parseFloat(value) / 100) * height : Number.parseFloat(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
