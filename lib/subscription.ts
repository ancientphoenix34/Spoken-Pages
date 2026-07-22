import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { PlanLimits, PlanType } from '@/components/types';
import { getPlanLimits, PLAN_SLUGS } from './subscription-constants';

// Resolves the current user's plan by checking Clerk Billing plans, highest tier first.
// Users without an active subscription fall back to "free".
export const getUserPlan = async (): Promise<PlanType> => {
    const { has } = await auth();

    if (has({ plan: PLAN_SLUGS.pro })) return 'pro';
    if (has({ plan: PLAN_SLUGS.standard })) return 'standard';
    return 'free';
};

export const getUserPlanLimits = async (): Promise<{ plan: PlanType; limits: PlanLimits }> => {
    const plan = await getUserPlan();
    return { plan, limits: getPlanLimits(plan) };
};
