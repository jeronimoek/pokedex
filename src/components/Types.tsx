import { capitalize } from "~/tools/capitalize";
import { pokemonTypeColors } from "~/tools/pokemonTypeColors";

export function Types({ types }: { types: string[] }) {
  return (
    <div className="flex justify-between gap-2">
      {types.map((type) => {
        const bgColor =
          pokemonTypeColors[type as keyof typeof pokemonTypeColors];
        return (
          <div
            style={{ backgroundColor: bgColor }}
            className={`w-1/2 grow rounded text-center font-semibold text-black`}
            key={type}
          >
            {capitalize(type)}
          </div>
        );
      })}
    </div>
  );
}
