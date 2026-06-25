export interface FinanceManagerSummary {
  my_escalated: number;
  unassigned_queue: number;
  my_claimed_unresolved: number;
  rejected: number;
}

export type ManagerQueue = 'my-claimed' | 'unassigned' | 'my-escalated' | 'rejected';
