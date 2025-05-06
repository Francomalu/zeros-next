import { Label } from '@/components/ui/label';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={label.toLowerCase()} className="text-right text-gray-700">
        {label}
      </Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}
