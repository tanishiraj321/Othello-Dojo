'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, Eye, Repeat } from 'lucide-react';

interface AIPanelProps {
  onSuggestMove: () => void;
  suggestion: { move: string; rationale: string } | null;
  suggestionLoading: boolean;
  onVisualize: () => void;
  visualization: { explanation: string } | null;
  visualizationLoading: boolean;
  onNewTraining: () => void;
  isPlayerTurn: boolean;
}

export default function AiPanel({
  onSuggestMove,
  suggestion,
  suggestionLoading,
  onVisualize,
  visualization,
  visualizationLoading,
  onNewTraining,
  isPlayerTurn,
}: AIPanelProps) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onSuggestMove}
        disabled={suggestionLoading || !isPlayerTurn}
        className="w-full"
      >
        {suggestionLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lightbulb className="mr-2 h-4 w-4" />
        )}
        Suggest a Move
      </Button>
      {suggestion && (
        <div className="text-sm p-3 bg-muted rounded-md space-y-1">
            <p><strong className="text-primary">Suggested Move:</strong> {suggestion.move}</p>
            <p className="font-code text-muted-foreground">{suggestion.rationale}</p>
        </div>
      )}

      <Button
        onClick={onVisualize}
        disabled={visualizationLoading}
        className="w-full"
        variant="secondary"
      >
        {visualizationLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Eye className="mr-2 h-4 w-4" />
        )}
        Visualize AI Decision
      </Button>
      {visualization && (
         <div className="text-sm p-3 bg-muted rounded-md space-y-1">
            <p><strong className="text-primary">AI Thought Process:</strong></p>
            <p className="font-code text-muted-foreground">{visualization.explanation}</p>
        </div>
      )}

       <Button
        onClick={onNewTraining}
        className="w-full"
        variant="outline"
      >
        <Repeat className="mr-2 h-4 w-4" />
        Start New Training Session
      </Button>

    </div>
  );
}
