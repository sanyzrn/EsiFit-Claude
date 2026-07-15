import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { hasTierAccess, type SubscriptionTier } from '@/lib/types';
import { useEntitlements } from '@/lib/entitlements';

interface TierGateProps {
  minTier: SubscriptionTier;
  children: ReactNode;
  showBlur?: boolean;
}

export default function TierGate({ minTier, children, showBlur = true }: TierGateProps) {
  const { subscriptionTier, loading } = useEntitlements();

  if (loading) {
    return showBlur ? (
      <div className="relative min-h-[12rem] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading access…</div>
      </div>
    ) : null;
  }

  if (hasTierAccess(subscriptionTier, minTier)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[12rem] flex items-center justify-center">
      {showBlur && (
        <div
          className="absolute inset-0 rounded-xl border border-dashed border-gray-800 bg-gray-900/70"
          aria-hidden="true"
        />
      )}
      <div
        className="relative z-10 bg-gray-900/95 border border-gray-700 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl"
        role="region"
        aria-labelledby="tier-gate-title"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 flex items-center justify-center">
          {minTier === 'VIP' || minTier === 'ELITE' ? (
            <Crown className="w-8 h-8 text-orange-400" />
          ) : (
            <Lock className="w-8 h-8 text-orange-400" />
          )}
        </div>
        <h3 id="tier-gate-title" className="text-lg font-bold mb-2">
          {minTier} Content
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          This content requires a {minTier} subscription or higher. Upgrade now to unlock.
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Crown className="w-4 h-4" />
          Upgrade to {minTier}
        </Link>
      </div>
    </div>
  );
}
