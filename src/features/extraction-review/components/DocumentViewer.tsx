import React, { useState } from 'react';
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
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileUrl,
  fileType,
  className,
}) => {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const fitWidth = () => setZoom(100);

  const isImage =
    fileType === 'image' ||
    (fileUrl && /\.(png|jpg|jpeg|tiff?)$/i.test(fileUrl));
  const isPdf =
    fileType === 'pdf' || (fileUrl && /\.pdf$/i.test(fileUrl));

  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--color-muted)] rounded-lg border border-[var(--color-border)] overflow-hidden',
        fullscreen && 'fixed inset-4 z-50 shadow-2xl',
        className,
      )}
    >
      {/* Toolbar */}
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

      {/* Viewer */}
      <div className="flex-1 overflow-auto scrollbar-thin flex items-start justify-center p-3">
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
            style={{ width: `${zoom}%`, maxWidth: 'none' }}
            className="rounded shadow-sm border border-[var(--color-border)]"
          />
        ) : isPdf ? (
          <iframe
            src={fileUrl}
            title="Invoice PDF"
            style={{ width: `${zoom}%`, minHeight: '600px', maxWidth: 'none' }}
            className="rounded shadow-sm border border-[var(--color-border)] bg-white"
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

      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/40 -z-10"
          onClick={() => setFullscreen(false)}
        />
      )}
    </div>
  );
};
