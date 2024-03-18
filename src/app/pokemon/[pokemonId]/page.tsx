"use client";

import { useRouter } from "next/navigation";
import { Loading } from "~/components/Loading";
import { PokemonEvolution } from "~/components/PokemonEvolution";
import { Types } from "~/components/Types";
import { capitalize } from "~/tools/capitalize";
import { imageNotFound } from "~/tools/constants";
import { generationTranslate } from "~/tools/generationTranslate";
import { api } from "~/trpc/react";

export default function Pokemon({
  params: { pokemonId },
}: {
  params: { pokemonId: string };
}) {
  const router = useRouter();

  const { data: pokemon, isLoading: loadingPokemon } =
    api.pokemon.pokemon.useQuery({ id: parseInt(pokemonId) });

  return loadingPokemon ? (
    <Loading />
  ) : !pokemon ? (
    "ERROR"
  ) : (
    <div className="flex flex-col items-center justify-center overflow-hidden p-2">
      <button className="self-start" onClick={() => router.back()}>
        ← Go Back
      </button>
      <div className="mb-12 flex w-full flex-col items-center justify-center gap-12 sm:w-3/4 sm:flex-row">
        <div className="flex w-full flex-col gap-2 rounded bg-gray-800 p-4 text-center sm:max-w-96">
          <div>
            <img
              className="ml-auto mr-auto h-48"
              src={pokemon.image ?? imageNotFound}
              alt={pokemon.name}
            />
          </div>
          <div className="mb-4 text-3xl font-bold">
            {capitalize(pokemon.name)}
          </div>
          <div>{generationTranslate(pokemon.generation)}</div>
          <div className="mb-4">Species: {pokemon.speciesName}</div>
          <Types types={pokemon.types} />
        </div>
        <div className="w-full max-w-64 rounded bg-gray-800 p-4 sm:self-end">
          <div className="mb-4 text-center text-3xl font-bold">STATS</div>
          {pokemon.stats.map((stat) => (
            <div key={stat.stat.name} className="flex gap-2">
              <span className="text-end font-bold ">{stat.base_stat}</span>
              {stat.stat.name.toLocaleUpperCase()}
            </div>
          ))}
        </div>
      </div>
      <PokemonEvolution
        pokemonChain={pokemon.pokemonChain}
        selected={pokemon.id}
      />
    </div>
  );
}
