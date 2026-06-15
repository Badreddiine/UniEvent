"use client";

import { useState, useCallback } from "react";
import { z } from "zod";

type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function useAuthForm<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  initialValues: Partial<T> = {}
) {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear error on change
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const touchField = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): boolean => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FieldErrors<T> = {};
    result.error.errors.forEach((err) => {
      const key = err.path[0] as keyof T;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = err.message;
      }
    });
    setErrors(fieldErrors);
    // Touch all errored fields
    const allTouched = Object.keys(fieldErrors).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Partial<Record<keyof T, boolean>>
    );
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return false;
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => Promise<void>) => {
      if (!validate()) return;
      setIsSubmitting(true);
      try {
        await onSubmit(values as T);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    touchField,
    validate,
    handleSubmit,
    reset,
  };
}
