'use client';

import { useAuth } from '@clerk/nextjs';
import { PlanLimits, PlanType } from '@/components/types';
import { getPlanLimits, PLAN_SLUGS } from '@/lib/subscription-constants';

export interface UseSubscriptionReturn {
    isLoaded: boolean;
    plan: PlanType;
    limits: PlanLimits;
}

// Client-side counterpart to lib/subscription.ts — resolves the signed-in user's
// plan via Clerk's has() so components can gate UI without a round-trip.
export function useSubscription(): UseSubscriptionReturn {
    const { isLoaded, has } = useAuth();

    let plan: PlanType = 'free';
    if (isLoaded && has) {
        if (has({ plan: PLAN_SLUGS.pro })) plan = 'pro';
        else if (has({ plan: PLAN_SLUGS.standard })) plan = 'standard';
    }

    return {
        isLoaded,
        plan,
        limits: getPlanLimits(plan),
    };
}

export default useSubscription;
