import type { ApiTokenUsage } from '@/types/api';
import './CostDisplay.css';

interface CostDisplayProps {
  cost: number;
  usage?: ApiTokenUsage;
  compact?: boolean;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export default function CostDisplay({ cost, usage, compact }: CostDisplayProps) {
  if (cost === 0 && !usage) return null;

  if (compact) {
    return (
      <span className="cost-display cost-display--compact">
        {formatCost(cost)}
      </span>
    );
  }

  return (
    <div className="cost-display">
      <span className="cost-display-total">{formatCost(cost)}</span>
      {usage && (
        <span className="cost-display-tokens">
          {usage.inputTokens.toLocaleString()}in / {usage.outputTokens.toLocaleString()}out
        </span>
      )}
    </div>
  );
}
