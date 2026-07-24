type Props = {
  text: string;
};

export default function ProductTag({
  text,
}: Props) {
  return (
    <span
      className="rounded-full bg-zinc-100 px-3 py-1 text-xs"
    >
      {text}
    </span>
  );
}