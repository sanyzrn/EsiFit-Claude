import { type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { getState, subscribe } from '@/lib/store';
import { hasTierAccess, type SubscriptionTier } from '@/lib/types';

interface TierGateProps {
  minTier: SubscriptionTier;
  children: ReactNode;
  showBlur?: boolean;
}

export default function TierGate({ minTier, children, showBlur = true }: TierGateProps) {
  const [state, setState] = useState(getState());
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  const user = state.currentUser;
  const userTier = user?.subscriptionTier || 'FREE';

  if (hasTierAccess(userTier, minTier)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {showBlur && <div className="content-locked">{children}</div>}
      <div className={`${showBlur ? 'absolute inset-0' : ''} flex items-center justify-center`}>
        <div className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            {minTier === 'VIP' || minTier === 'ELITE' ? (
              <Crown className="w-8 h-8 text-orange-400" />
            ) : (
              <Lock className="w-8 h-8 text-orange-400" />
            )}
          </div>
          <h3 className="text-lg font-bold mb-2">
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
    </div>
  );
}
