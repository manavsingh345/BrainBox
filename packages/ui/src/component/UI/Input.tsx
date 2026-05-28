import { forwardRef } from "react"
interface content {
    placeholder: string;
}
export const  Input= forwardRef<HTMLInputElement,content>(
  ({ placeholder }, ref) => {
  return (
    <div>
      <input ref={ref} type="text" placeholder={placeholder}
        className="px-4 py-2 border rounded m-2 w-full"
      />
    </div>
  );
}
);