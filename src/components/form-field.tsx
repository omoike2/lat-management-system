import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ id, label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-[--color-text-primary]">
        {label}
        {required && <span className="text-[--color-danger] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[--color-danger]">{error}</p>}
    </div>
  );
}
