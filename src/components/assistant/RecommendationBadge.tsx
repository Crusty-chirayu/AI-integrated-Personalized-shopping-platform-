type Props = {
  text: string;
};

export default function RecommendationBadge({
  text,
}: Props) {

  return (

    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">

      {text}

    </div>

  );

}