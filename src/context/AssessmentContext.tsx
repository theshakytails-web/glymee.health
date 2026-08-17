"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { ProfileData } from "@/lib/assessment/types";

export interface AssessmentState {
  assessmentSlug: string;
  currentStep: number;
  totalSteps: number;
  profile: ProfileData;
  responses: Record<string, unknown>;
  uploads: { id: string; fileName: string; fileType: string }[];
  isSubmitting: boolean;
  submissionId: string | null;
  error: string | null;
}

type AssessmentAction =
  | { type: "SET_ASSESSMENT"; slug: string; totalSteps: number }
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_PROFILE"; profile: Partial<ProfileData> }
  | { type: "SET_RESPONSE"; key: string; value: unknown }
  | { type: "SET_RESPONSES"; responses: Record<string, unknown> }
  | { type: "ADD_UPLOAD"; upload: { id: string; fileName: string; fileType: string } }
  | { type: "REMOVE_UPLOAD"; uploadId: string }
  | { type: "SET_SUBMITTING"; submitting: boolean }
  | { type: "SET_SUBMISSION_ID"; id: string }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

const initialProfile: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  age: 0,
  gender: "",
  heightCm: 0,
  weightKg: 0,
  city: "",
};

const initialState: AssessmentState = {
  assessmentSlug: "",
  currentStep: 0,
  totalSteps: 0,
  profile: initialProfile,
  responses: {},
  uploads: [],
  isSubmitting: false,
  submissionId: null,
  error: null,
};

function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction
): AssessmentState {
  switch (action.type) {
    case "SET_ASSESSMENT":
      return {
        ...state,
        assessmentSlug: action.slug,
        totalSteps: action.totalSteps,
      };

    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
      };

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    case "SET_PROFILE":
      return {
        ...state,
        profile: { ...state.profile, ...action.profile },
      };

    case "SET_RESPONSE":
      return {
        ...state,
        responses: { ...state.responses, [action.key]: action.value },
      };

    case "SET_RESPONSES":
      return {
        ...state,
        responses: { ...state.responses, ...action.responses },
      };

    case "ADD_UPLOAD":
      return {
        ...state,
        uploads: [...state.uploads, action.upload],
      };

    case "REMOVE_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.filter((u) => u.id !== action.uploadId),
      };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.submitting };

    case "SET_SUBMISSION_ID":
      return { ...state, submissionId: action.id };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface AssessmentContextType {
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
  setAssessment: (slug: string, totalSteps: number) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProfile: (profile: Partial<ProfileData>) => void;
  setResponse: (key: string, value: unknown) => void;
  setResponses: (responses: Record<string, unknown>) => void;
  addUpload: (upload: { id: string; fileName: string; fileType: string }) => void;
  removeUpload: (uploadId: string) => void;
  setSubmitting: (submitting: boolean) => void;
  setSubmissionId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  calculateBMI: () => number;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  const setAssessment = useCallback(
    (slug: string, totalSteps: number) =>
      dispatch({ type: "SET_ASSESSMENT", slug, totalSteps }),
    []
  );

  const setStep = useCallback(
    (step: number) => dispatch({ type: "SET_STEP", step }),
    []
  );

  const nextStep = useCallback(
    () => dispatch({ type: "NEXT_STEP" }),
    []
  );

  const prevStep = useCallback(
    () => dispatch({ type: "PREV_STEP" }),
    []
  );

  const setProfile = useCallback(
    (profile: Partial<ProfileData>) =>
      dispatch({ type: "SET_PROFILE", profile }),
    []
  );

  const setResponse = useCallback(
    (key: string, value: unknown) =>
      dispatch({ type: "SET_RESPONSE", key, value }),
    []
  );

  const setResponses = useCallback(
    (responses: Record<string, unknown>) =>
      dispatch({ type: "SET_RESPONSES", responses }),
    []
  );

  const addUpload = useCallback(
    (upload: { id: string; fileName: string; fileType: string }) =>
      dispatch({ type: "ADD_UPLOAD", upload }),
    []
  );

  const removeUpload = useCallback(
    (uploadId: string) => dispatch({ type: "REMOVE_UPLOAD", uploadId }),
    []
  );

  const setSubmitting = useCallback(
    (submitting: boolean) => dispatch({ type: "SET_SUBMITTING", submitting }),
    []
  );

  const setSubmissionId = useCallback(
    (id: string) => dispatch({ type: "SET_SUBMISSION_ID", id }),
    []
  );

  const setError = useCallback(
    (error: string | null) => dispatch({ type: "SET_ERROR", error }),
    []
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const calculateBMI = useCallback(() => {
    const { heightCm, weightKg } = state.profile;
    if (!heightCm || !weightKg) return 0;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }, [state.profile]);

  return (
    <AssessmentContext.Provider
      value={{
        state,
        dispatch,
        setAssessment,
        setStep,
        nextStep,
        prevStep,
        setProfile,
        setResponse,
        setResponses,
        addUpload,
        removeUpload,
        setSubmitting,
        setSubmissionId,
        setError,
        reset,
        calculateBMI,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}
