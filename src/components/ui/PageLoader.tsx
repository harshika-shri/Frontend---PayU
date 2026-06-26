import React from 'react';
import { Spinner } from './Spinner';

export const PageLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
);
