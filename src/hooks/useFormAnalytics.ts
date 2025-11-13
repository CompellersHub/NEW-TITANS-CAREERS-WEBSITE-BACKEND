import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;

interface FormAnalyticsEvent {
  formName: string;
  stepNumber?: number;
  stepTitle?: string;
  fieldName?: string;
  eventType: 'field_focus' | 'field_blur' | 'field_error' | 'step_complete' | 'step_abandon' | 'form_complete' | 'form_abandon';
  timeSpentMs?: number;
  errorMessage?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

export function useFormAnalytics(formName: string) {
  const sessionIdRef = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const fieldStartTimesRef = useRef<Record<string, number>>({});
  const stepStartTimeRef = useRef<number>(Date.now());
  const currentStepRef = useRef<number>(0);

  // Track form abandonment on unmount
  useEffect(() => {
    return () => {
      // Track form abandonment if user leaves before completion
      trackEvent({
        formName,
        eventType: 'form_abandon',
        stepNumber: currentStepRef.current,
        timeSpentMs: Date.now() - stepStartTimeRef.current,
      });
    };
  }, [formName]);

  const trackEvent = useCallback(async (event: FormAnalyticsEvent) => {
    try {
      await sb.from('form_analytics').insert({
        form_name: event.formName,
        step_number: event.stepNumber,
        step_title: event.stepTitle,
        field_name: event.fieldName,
        event_type: event.eventType,
        time_spent_ms: event.timeSpentMs,
        error_message: event.errorMessage,
        session_id: sessionIdRef.current,
        user_email: event.userEmail,
        metadata: event.metadata || {},
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error('Form analytics error:', error);
    }
  }, []);

  const trackFieldFocus = useCallback((fieldName: string, stepNumber: number, stepTitle: string) => {
    fieldStartTimesRef.current[fieldName] = Date.now();
    trackEvent({
      formName,
      stepNumber,
      stepTitle,
      fieldName,
      eventType: 'field_focus',
    });
  }, [formName, trackEvent]);

  const trackFieldBlur = useCallback((fieldName: string, stepNumber: number, stepTitle: string) => {
    const startTime = fieldStartTimesRef.current[fieldName];
    const timeSpent = startTime ? Date.now() - startTime : 0;
    
    trackEvent({
      formName,
      stepNumber,
      stepTitle,
      fieldName,
      eventType: 'field_blur',
      timeSpentMs: timeSpent,
    });
    
    delete fieldStartTimesRef.current[fieldName];
  }, [formName, trackEvent]);

  const trackFieldError = useCallback((
    fieldName: string, 
    errorMessage: string, 
    stepNumber: number, 
    stepTitle: string
  ) => {
    trackEvent({
      formName,
      stepNumber,
      stepTitle,
      fieldName,
      eventType: 'field_error',
      errorMessage,
    });
  }, [formName, trackEvent]);

  const trackStepComplete = useCallback((stepNumber: number, stepTitle: string) => {
    const timeSpent = Date.now() - stepStartTimeRef.current;
    
    trackEvent({
      formName,
      stepNumber,
      stepTitle,
      eventType: 'step_complete',
      timeSpentMs: timeSpent,
    });
    
    // Reset for next step
    stepStartTimeRef.current = Date.now();
    currentStepRef.current = stepNumber + 1;
  }, [formName, trackEvent]);

  const trackStepAbandon = useCallback((stepNumber: number, stepTitle: string) => {
    const timeSpent = Date.now() - stepStartTimeRef.current;
    
    trackEvent({
      formName,
      stepNumber,
      stepTitle,
      eventType: 'step_abandon',
      timeSpentMs: timeSpent,
    });
  }, [formName, trackEvent]);

  const trackFormComplete = useCallback((userEmail?: string) => {
    trackEvent({
      formName,
      eventType: 'form_complete',
      userEmail,
    });
  }, [formName, trackEvent]);

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFieldError,
    trackStepComplete,
    trackStepAbandon,
    trackFormComplete,
  };
}
