type Card2Props = {
  color?: string;
  heading: string;
  text: string;
};

export default function Card2({ color = "text-white", heading, text }: Card2Props) {
  return (
    <div className="m-1 h-44 w-72 rounded-xl border border-gray-800 bg-[#101428] px-6 py-5 shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{heading}</p>
      <p className="pt-3 text-base text-gray-300">{text}</p>
    </div>
  );
}
