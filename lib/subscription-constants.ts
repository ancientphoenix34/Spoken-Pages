import { PlanLimits, PlanType } from '@/components/types';

// Clerk Dashboard plan slugs. Users without an active subscription are on "free".
export const PLAN_SLUGS = {
    standard: 'standard',
    pro: 'pro',
} as const;

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    free: {
        maxBooks: 1,
        monthlySessionLimit: 5,
        maxSessionMinutes: 5,
        sessionHistory: false,
    },
    standard: {
        maxBooks: 10,
        monthlySessionLimit: 100,
        maxSessionMinutes: 15,
        sessionHistory: true,
    },
    pro: {
        maxBooks: 100,
        monthlySessionLimit: null, // unlimited
        maxSessionMinutes: 60,
        sessionHistory: true,
    },
};

export const getPlanLimits = (plan: PlanType): PlanLimits => PLAN_LIMITS[plan];

export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};
