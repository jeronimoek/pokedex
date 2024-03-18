import { useRouter } from "next/navigation";
import { capitalize } from "~/tools/capitalize";
import { generationTranslate } from "~/tools/generationTranslate";
import { Types } from "./Types";
import { imageNotFound } from "~/tools/constants";

interface PokemonCardProps {
  id: number;
  name: string;
  generation: string;
  types: string[];
  image?: string;
}

export default function PokemonCard({
  id,
  name,
  generation,
  types,
  image,
}: PokemonCardProps) {
  const router = useRouter();

  return (
    <div
      className="flex cursor-pointer flex-col gap-2 rounded bg-blue-900 p-2"
      onClick={() => router.push(`/pokemon/${id}`)}
      key={name}
    >
      <img src={image ?? imageNotFound} alt={name} />
      <div>#{id}</div>
      <div className="grow text-lg font-semibold leading-5">
        {capitalize(name)}
      </div>
      <div>{generationTranslate(generation)}</div>
      <Types types={types} />
    </div>
  );
}
