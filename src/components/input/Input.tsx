import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={props.id}
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          {label}
        </label>
        <input
          ref={ref}
          type="text"
          id={props.id}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder={props.placeholder}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
