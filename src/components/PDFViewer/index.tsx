import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spin, Alert, Button, Tooltip } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined } from '@ant-design/icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { COLORS } from '../../theme/tokens';

// Use local worker (copied to public/ at build time) — no CDN dependency
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  onScrollProgress?: (progress: number) => void;
  onScrollComplete?: () => void;
  onTotalPages?: (n: number) => void;
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 3;
const DOUBLE_TAP_SCALE = 2;
const MAX_PAGE_WIDTH = 820;
const VIEWER_BG = '#eceef1';
const clamp = (v: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, v));

export const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  onScrollProgress,
  onScrollComplete,
  onTotalPages,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [baseWidth, setBaseWidth] = useState(360);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollCompleteRef = useRef(false);

  // Mirror the latest scale into a ref so the (mount-only) gesture handlers read it.
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // Measure container → fit page width responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.min(el.clientWidth - 32, MAX_PAGE_WIDTH);
      if (w > 0) setBaseWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    pageRefs.current = new Array(n).fill(null);
    setLoading(false);
    onTotalPages?.(n);
  };

  // Scroll handler: reading progress (optional callers) + current page indicator
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Current page = the page whose top is at/above the viewport midpoint
    const mid = el.scrollTop + el.clientHeight / 2;
    let cur = 1;
    for (let i = 0; i < pageRefs.current.length; i++) {
      const p = pageRefs.current[i];
      if (p && p.offsetTop <= mid) cur = i + 1;
    }
    setCurrentPage(prev => (prev !== cur ? cur : prev));

    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      if (!scrollCompleteRef.current) {
        scrollCompleteRef.current = true;
        onScrollComplete?.();
      }
      return;
    }
    const progress = Math.min(el.scrollTop / max, 1);
    onScrollProgress?.(progress);
    if (progress >= 0.95 && !scrollCompleteRef.current) {
      scrollCompleteRef.current = true;
      onScrollComplete?.();
    }
  }, [onScrollProgress, onScrollComplete]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Pinch-to-zoom + double-tap.
  // Smooth approach: during the gesture we only apply a cheap CSS transform (60fps,
  // GPU) to the pages wrapper; on release we commit the scale once so react-pdf
  // re-rasterizes crisply. Zoom is anchored on the focal point (between the fingers
  // / the tap), and the scroll position is adjusted so that point stays put.
  useEffect(() => {
    const el = containerRef.current;
    const pages = pagesRef.current;
    if (!el || !pages) return;

    let pinch: { startDist: number; startScale: number; originY: number; lastScale: number } | null = null;
    let raf = 0;
    let pendingTransform = '';
    let pinchHappened = false;
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const flush = () => {
      raf = 0;
      pages.style.transform = pendingTransform;
    };

    // Re-anchor scroll so the focal content point stays at the same screen position
    const reanchor = (originY: number, startScale: number, finalScale: number) => {
      const fy = originY - el.scrollTop;
      requestAnimationFrame(() => {
        el.scrollTop = (originY * finalScale) / startScale - fy;
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchHappened = true;
        const rect = el.getBoundingClientRect();
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const originY = el.scrollTop + (midY - rect.top);
        pinch = {
          startDist: dist(e.touches),
          startScale: scaleRef.current,
          originY,
          lastScale: scaleRef.current,
        };
        pages.style.transformOrigin = `50% ${originY}px`;
        pages.style.willChange = 'transform';
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        const ratio = dist(e.touches) / pinch.startDist;
        const target = clamp(pinch.startScale * ratio);
        pinch.lastScale = target;
        pendingTransform = `scale(${target / pinch.startScale})`;
        if (!raf) raf = requestAnimationFrame(flush);
      }
    };

    const commitPinch = () => {
      if (!pinch) return;
      const { originY, startScale, lastScale } = pinch;
      pinch = null;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      pages.style.transform = '';
      pages.style.transformOrigin = '';
      pages.style.willChange = '';
      setScale(lastScale);
      reanchor(originY, startScale, lastScale);
    };

    const onTouchEnd = (e: TouchEvent) => {
      // A finger lifted mid-pinch → commit
      if (pinch && e.touches.length < 2) {
        commitPinch();
        return;
      }
      // Double-tap to toggle zoom (single finger, no pinch during this sequence)
      if (!pinchHappened && e.touches.length === 0 && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const now = Date.now();
        if (now - lastTapTime < 300 && Math.hypot(t.clientX - lastTapX, t.clientY - lastTapY) < 30) {
          const rect = el.getBoundingClientRect();
          const originY = el.scrollTop + (t.clientY - rect.top);
          const startScale = scaleRef.current;
          const target = startScale > 1.2 ? 1 : DOUBLE_TAP_SCALE;
          setScale(target);
          reanchor(originY, startScale, target);
          lastTapTime = 0;
        } else {
          lastTapTime = now;
          lastTapX = t.clientX;
          lastTapY = t.clientY;
        }
      }
      if (e.touches.length === 0) pinchHappened = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const adjustZoom = (delta: number) => setScale(s => clamp(+(s + delta).toFixed(2)));
  const resetZoom = () => setScale(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: VIEWER_BG }}>
      {/* Toolbar */}
      <div
        style={{
          flexShrink: 0,
          height: 44,
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>
          {numPages > 0 ? `Página ${currentPage} de ${numPages}` : 'Carregando…'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Reduzir">
            <Button
              type="text"
              size="small"
              icon={<ZoomOutOutlined />}
              onClick={() => adjustZoom(-0.2)}
              disabled={scale <= MIN_SCALE}
            />
          </Tooltip>
          <span
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              minWidth: 42,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(scale * 100)}%
          </span>
          <Tooltip title="Ampliar">
            <Button
              type="text"
              size="small"
              icon={<ZoomInOutlined />}
              onClick={() => adjustZoom(0.2)}
              disabled={scale >= MAX_SCALE}
            />
          </Tooltip>
          <Tooltip title="Ajustar à largura">
            <Button type="text" size="small" icon={<ExpandOutlined />} onClick={resetZoom} />
          </Tooltip>
        </div>
      </div>

      {/* Scrollable pages */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          // Allow native panning; pinch & double-tap are handled by us.
          touchAction: 'pan-x pan-y',
          padding: '20px 0 28px',
        }}
      >
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 48 }}>
            <Spin size="large" />
            <span style={{ color: COLORS.textSecondary, fontSize: 13 }}>Carregando documento…</span>
          </div>
        )}

        {error && (
          <Alert type="error" showIcon message="Erro ao carregar PDF" description={error} style={{ margin: 16 }} />
        )}

        <div ref={pagesRef} style={{ transformOrigin: '50% 0' }}>
          <Document file={url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={e => { setError(e.message); setLoading(false); }} loading={null}>
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={i}
                ref={el => { pageRefs.current[i] = el; }}
                data-page={i + 1}
                style={{
                  width: baseWidth * scale,
                  margin: '0 auto 18px',
                  background: '#fff',
                  borderRadius: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                }}
              >
                <Page
                  pageNumber={i + 1}
                  width={baseWidth * scale}
                  renderTextLayer
                  renderAnnotationLayer
                  loading={
                    <div style={{ height: (baseWidth * scale) * 1.414, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Spin />
                    </div>
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};
