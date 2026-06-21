import React from 'react';
import { Loader2, Mail, Play, Square } from 'lucide-react';
import { DEFAULT_MONITORING_EMAIL } from '../constants/defaultEmail';
import type { MonitoringStatusResponse } from '../types/mailMonitoring.types';

interface MonitoringControlPanelProps {
  status: MonitoringStatusResponse | null;
  isLoading: boolean;
  isToggling: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const MonitoringControlPanel: React.FC<MonitoringControlPanelProps> = ({
  status,
  isLoading,
  isToggling,
  onStart,
  onStop,
}) => {
  const isMonitoring = status?.is_monitoring ?? false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Gmail Invoice Monitoring</h3>
            <p className="mt-1 text-sm text-slate-500">
              Monitor incoming invoices at{' '}
              <span className="font-medium text-slate-700">{DEFAULT_MONITORING_EMAIL}</span>
            </p>
            {isLoading ? (
              <p className="mt-2 text-xs text-slate-400">Checking status...</p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${
                    isMonitoring
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 ring-slate-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isMonitoring ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {isMonitoring ? 'Active' : 'Stopped'}
                </span>
                {status?.last_processed_history_id != null && (
                  <span className="text-xs text-slate-400">
                    Last history ID: {status.last_processed_history_id}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMonitoring ? (
            <button
              type="button"
              onClick={onStop}
              disabled={isToggling || isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-700 border border-transparent rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Stop Monitoring
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={isToggling || isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Monitoring
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
