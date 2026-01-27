"use client";

import { useState, useCallback } from "react";

interface ContentTypeField {
  id: string;
  name: string;
  defaultValue: string | null;
}

export function useFieldValues(fields: ContentTypeField[]) {
  const getInitialValues = useCallback(() => {
    const initial: Record<string, any> = {};
    for (const field of fields) {
      if (field.defaultValue) {
        initial[field.name] = field.defaultValue;
      }
    }
    return initial;
  }, [fields]);

  const [values, setValues] = useState<Record<string, any>>(getInitialValues);

  const setValue = useCallback((fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const resetValues = useCallback(() => {
    setValues(getInitialValues());
  }, [getInitialValues]);

  return { values, setValue, setValues, resetValues };
}
