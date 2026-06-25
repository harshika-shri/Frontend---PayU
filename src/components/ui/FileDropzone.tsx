import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileDropzoneProps {
  accept?: string[];
  maxSizeMb?: number;
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff'],
  maxSizeMb = 20,
  onFile,
  disabled,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(ext) && !accept.includes('*')) {
      return `Unsupported format. Accepted: ${accept.join(', ')}`;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMb} MB`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setSelected(file);
      onFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accept, maxSizeMb, onFile],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && !selected && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && !selected && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors',
          'focus-visible:outline-2 focus-visible:outline-[var(--color-ring)]',
          !disabled && !selected && 'cursor-pointer',
          dragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)]'
            : selected
            ? 'border-[var(--color-success)] bg-[var(--color-success-muted)]'
            : error
            ? 'border-[var(--color-destructive)] bg-[var(--color-destructive-muted)]'
            : 'border-[var(--color-border)] bg-[var(--color-muted)] hover:border-slate-400 hover:bg-slate-100',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleChange}
          className="sr-only"
          disabled={disabled}
        />

        {selected ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
              <FileIcon className="h-5 w-5 text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)] max-w-[260px] truncate">
                {selected.name}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {formatSize(selected.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] transition-colors mt-1"
            >
              <X className="h-3.5 w-3.5" /> Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[var(--color-border)]">
              <UploadCloud className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                Drag & drop or{' '}
                <span className="text-[var(--color-primary)]">browse</span>
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {accept.join(', ')} · Max {maxSizeMb} MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-[var(--color-destructive)]">{error}</p>
      )}
    </div>
  );
};
