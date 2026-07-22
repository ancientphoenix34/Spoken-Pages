'use server';

import { EndSessionResult, SessionCheckResult, StartSessionResult } from "@/components/types";
import VoiceSession from "@/database/models/voiceSession.model";
import { connectToDatabase } from "@/database/mongoose";
import { getCurrentBillingPeriodStart } from "../subscription-constants";
import { getUserPlanLimits } from "../subscription";

export const checkSessionLimit = async (clerkId: string): Promise<SessionCheckResult> => {
  try {
    await connectToDatabase();

    const { plan, limits } = await getUserPlanLimits();

    const currentCount = await VoiceSession.countDocuments({
      clerkId,
      billingPeriodStart: getCurrentBillingPeriodStart(),
    });

    const limit = limits.monthlySessionLimit;

    return {
      allowed: limit === null || currentCount < limit,
      currentCount,
      limit: limit ?? Infinity,
      plan,
      maxDurationMinutes: limits.maxSessionMinutes,
    }
  } catch (e) {
    console.error('Error checking session limit', e);
    return {
      allowed: false,
      currentCount: 0,
      limit: 0,
      plan: 'free',
      maxDurationMinutes: 0,
      error: 'Failed to verify session limit. Please try again later.',
    }
  }
}

export const startVoiceSession=async(clerkId:string,bookId:string):Promise<StartSessionResult>=>{
try{
  await connectToDatabase();

  // Limits/plan to see wether a session is allowed
  const limitCheck = await checkSessionLimit(clerkId);
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: limitCheck.error
        || `You've reached your ${limitCheck.plan} plan limit of ${limitCheck.limit} sessions this month. Upgrade your plan for more.`,
    }
  }

  const session = await VoiceSession.create({
    clerkId ,
    bookId,
    startedAt:new Date(),
    billingPeriodStart:getCurrentBillingPeriodStart(),
    durationSeconds:0,
  });

  return {
    success:true,
    sessionId:session.id.toString(),
    maxDurationMinutes:limitCheck.maxDurationMinutes,

  }
}catch(e){
    console.error('Error starting voice session',e);
    return {
        success:false,
        error:'Failed to start voice session.Please try again later.'
    }
}
}

export const endVoiceSession=async(sessionId:string,durationSeconds:number):Promise<EndSessionResult>=>{
try{
  await connectToDatabase();

  const result=await VoiceSession.findByIdAndUpdate(sessionId,{
    endedAt:new Date(),
    durationSeconds,
  });

  if(!result) return { success:false, error:'Voice session not found.'}

  return {
    success:true,
  }
}catch(e){
    console.error('Error ending voice session',e);
    return {
        success:false,
        error:'Failed to end voice session.Please try again later.'
    }
}
}