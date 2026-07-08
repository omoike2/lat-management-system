"use client";

import { useTransition } from "react";
import { registerCourse, unregisterCourse } from "@/features/students/actions";

interface CourseRegistrationFormProps {
  courseId: string;
  label: string;
  sublabel: string;
  isOwnLevel: boolean;
  isRegistered: boolean;
}

export function CourseRegistrationForm({
  courseId,
  label,
  sublabel,
  isOwnLevel,
  isRegistered,
}: CourseRegistrationFormProps) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const action = isRegistered ? unregisterCourse : registerCourse;
      await action({ courseId });
    });
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
        isOwnLevel
          ? "border-(--color-brand-light) bg-(--color-brand-subtle)"
          : isRegistered
            ? "border-(--color-brand) bg-(--color-brand-light)"
            : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <input
        type="checkbox"
        checked={isOwnLevel || isRegistered}
        disabled={isOwnLevel || pending}
        onChange={toggle}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-(--color-brand) disabled:opacity-60 cursor-pointer disabled:cursor-default"
        aria-label={label}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {sublabel}
          {isOwnLevel && <span className="ml-1 text-(--color-brand)">(your level)</span>}
        </p>
      </div>
    </div>
  );
}
