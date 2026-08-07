import Image from "next/image";

export function Logo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="CartIQ"
      width={190}
      height={60}
      priority
      className={className}
    />
  );
}