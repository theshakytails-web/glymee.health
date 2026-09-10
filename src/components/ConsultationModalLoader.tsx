"use client";

import { lazy, Suspense } from "react";

const Modal = lazy(() => import("./ConsultationModal"));

export default function ConsultationModalLoader() {
  return (
    <Suspense fallback={null}>
      <Modal />
    </Suspense>
  );
}