type SmallNavProps = {
  text: string;
};

export default function SmallNav({ text }: SmallNavProps) {
  return (
    <div className="mb-4 inline-flex items-center rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-sm font-medium text-violet-200">
      {text}
    </div>
  );
}
