type Props = {
  value: number;
};

export default function ConfidenceBadge({
  value,
}: Props) {

  const color =
    value > 95
      ? "text-green-600"
      : value > 90
      ? "text-yellow-600"
      : "text-red-500";

  return (

    <div className="flex items-center justify-between text-sm">

      <span className="text-zinc-500">
        AI Confidence
      </span>

      <span className={`font-bold ${color}`}>
        {value}%
      </span>

    </div>

  );

}