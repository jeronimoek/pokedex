import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import PokemonCard from "./PokemonCard";

export function PokemonEvolution({
  pokemonChain,
  selected,
}: {
  pokemonChain: inferRouterOutputs<AppRouter>["pokemon"]["pokemon"]["pokemonChain"];
  selected: number;
}) {
  const steps: (typeof pokemonChain.pokemon)[][] = [];
  function processPokemonChain(currLink: typeof pokemonChain, count = 0) {
    steps[count] ??= [];
    steps[count]?.push(currLink.pokemon);
    currLink.evolvesTo.forEach((ev) => processPokemonChain(ev, count + 1));
  }
  processPokemonChain(pokemonChain);
  return (
    <div className="w-full">
      <div className="mb-4 text-center text-3xl font-bold">EVOLUTIONS</div>
      <div className="flex w-full justify-center gap-12">
        {steps.map((pokemons, i) => (
          <div key={i} className="relative flex">
            <div className="flex flex-col gap-12">
              {pokemons.map((pokemon) => {
                const isSelected = selected === pokemon.id;
                return (
                  <div
                    key={pokemon.name}
                    className={`w-48 ${isSelected ? "rounded border-2 border-solid border-white" : ""}`}
                  >
                    <PokemonCard
                      generation={pokemon.generation}
                      id={pokemon.id}
                      name={pokemon.name}
                      types={pokemon.types}
                      image={pokemon.image}
                    />
                  </div>
                );
              })}
            </div>
            {i !== steps.length - 1 && (
              <div style={{ right: -20 }} className="absolute  top-20">
                <img
                  className="h-8 w-8"
                  src="https://static-00.iconduck.com/assets.00/arrow-right-small-icon-2048x1365-cmy5bz89.png"
                  alt="arrow to right"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
