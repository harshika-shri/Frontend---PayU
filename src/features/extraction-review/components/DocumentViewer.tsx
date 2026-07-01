import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  ImageOff,
  Expand,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';

interface DocumentViewerProps {
  fileUrl?: string;
  fileType?: 'pdf' | 'image' | null;
  /** When true, document fills its container without an inner scroll area */
  fitContainer?: boolean;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileUrl,
  fileType,
  fitContainer = false,
  className,
}) => {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreen]);

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const fitWidth = () => setZoom(100);

  const isImage =
    fileType === 'image' ||
    (fileUrl && /\.(png|jpg|jpeg|tiff?)$/i.test(fileUrl));
  const isPdf =
    fileType === 'pdf' || (fileUrl && /\.pdf$/i.test(fileUrl));

  const toolbar = (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-b border-[var(--color-border)] flex-shrink-0">
      <div className="flex items-center gap-1">
        <FileText className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
        <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
          Original Document
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={zoomOut} title="Zoom out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs text-[var(--color-muted-foreground)] min-w-[38px] text-center">
          {zoom}%
        </span>
        <Button variant="ghost" size="icon-sm" onClick={zoomIn} title="Zoom in">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={fitWidth} title="Fit width">
          <Expand className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setFullscreen((f) => !f)}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );

  const viewerBody = (
    <div
      className={cn(
        'flex-1 flex items-center justify-center p-3 min-h-0',
        fitContainer || fullscreen ? 'overflow-hidden' : 'overflow-auto scrollbar-thin items-start',
      )}
    >
      {!fileUrl ? (
        <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[400px] text-center px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[var(--color-border)]">
            <ImageOff className="h-6 w-6 text-[var(--color-muted-foreground)]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              Document preview unavailable
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] max-w-[220px]">
              The original document file is not directly accessible for preview.
            </p>
          </div>
        </div>
      ) : isImage ? (
        <img
          src={fileUrl}
          alt="Invoice document"
          style={
            fitContainer || fullscreen
              ? undefined
              : { width: `${zoom}%`, maxWidth: 'none' }
          }
          className={cn(
            'rounded shadow-sm border border-[var(--color-border)]',
            (fitContainer || fullscreen) && 'h-full w-full object-contain',
          )}
        />
      ) : isPdf ? (
        <iframe
          src={fileUrl}
          title="Invoice PDF"
          style={
            fitContainer || fullscreen
              ? { width: '100%', height: '100%' }
              : { width: `${zoom}%`, minHeight: '600px', maxWidth: 'none' }
          }
          className={cn(
            'rounded shadow-sm border border-[var(--color-border)] bg-white',
            (fitContainer || fullscreen) && 'h-full min-h-0',
          )}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[400px]">
          <ImageOff className="h-8 w-8 text-[var(--color-muted-foreground)]" />
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Unsupported document type
          </p>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Exit fullscreen"
          onClick={() => setFullscreen(false)}
        />
        <div className="relative z-10 m-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] shadow-2xl">
          {toolbar}
          {viewerBody}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--color-muted)] rounded-lg border border-[var(--color-border)] overflow-hidden',
        className,
      )}
    >
      {toolbar}
      {viewerBody}
    </div>
  );
};
