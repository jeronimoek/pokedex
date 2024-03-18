"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { Loading } from "~/components/Loading";
import PokemonCard from "~/components/PokemonCard";
import { capitalize } from "~/tools/capitalize";
import { pokemonTypeColors } from "~/tools/pokemonTypeColors";
import { api } from "~/trpc/react";

function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { name, gen, type } = useMemo(() => {
    return {
      name: searchParams.get("name"),
      gen: searchParams.get("gen"),
      type: searchParams.get("type"),
    };
  }, [searchParams]);

  const { data: pokemons = [], isFetching: loadingPokemons } =
    api.pokemon.pokemons.useQuery();
  const { data: evolutionChains = [], isFetching: loadingEvolutionChains } =
    api.pokemon.evolutionChains.useQuery();
  const { data: generations = [], isFetching: loadingGenerations } =
    api.pokemon.generations.useQuery();
  const { data: types = [], isFetching: loadingTypes } =
    api.pokemon.types.useQuery();

  const setQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams],
  );

  const pokemonsFiltered = useMemo(() => {
    let filteredPokemons = pokemons;

    if (name) {
      const nameLowerCase = name.toLocaleLowerCase();
      const matchingPokemons = pokemons.filter(
        (pokemon) =>
          pokemon.name.toLocaleLowerCase().indexOf(nameLowerCase) !== -1,
      );
      const matchingPokemonsSpecies = matchingPokemons.map(
        (matchingPokemon) => matchingPokemon.speciesName,
      );
      const matchingEvolutions = evolutionChains.filter((evChain) =>
        evChain.speciesNames.some((speciesName) =>
          matchingPokemonsSpecies.includes(speciesName),
        ),
      );
      const speciesInMatchingEvolutions = matchingEvolutions.reduce(
        (acc, curr) => {
          acc.push(...curr.speciesNames);
          return acc;
        },
        [] as string[],
      );
      filteredPokemons = filteredPokemons.filter((pokemon) =>
        speciesInMatchingEvolutions.includes(pokemon.speciesName),
      );
    }

    if (gen) {
      filteredPokemons = filteredPokemons.filter(
        (pokemon) => pokemon.generation === gen,
      );
    }

    if (type) {
      filteredPokemons = filteredPokemons.filter((pokemon) =>
        pokemon.types.includes(type),
      );
    }

    return filteredPokemons;
  }, [pokemons, evolutionChains, name, gen, type]);

  return (
    <main className="min-h-screen">
      <div className="center flex flex-col items-center gap-4 p-2 pt-4 md:flex-row md:justify-start ">
        <input
          placeholder="Search..."
          type="search"
          onChange={(e) => setQueryString("name", e.target.value)}
          defaultValue={name ?? undefined}
          className="w-full max-w-96 rounded-lg border-gray-200 p-2 text-sm font-semibold outline-none md:w-60 md:text-base"
        />

        <select
          onChange={(e) => setQueryString("gen", e.target.value)}
          className="w-full max-w-96 rounded-lg border-gray-200 p-2 text-sm font-semibold outline-none md:ml-auto md:w-60 md:text-base"
        >
          <option value={""}>Select generation</option>
          {generations.map(({ name: genName }, i) => (
            <option
              key={genName}
              value={genName}
              selected={gen === genName}
              className="font-semibold"
            >
              Generation {i + 1}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setQueryString("type", e.target.value)}
          className="w-full max-w-96 rounded-lg border-gray-200 p-2 text-sm font-semibold outline-none md:w-60 md:text-base"
        >
          <option value={""}>Select type</option>
          {types.map(({ name: typeName }) => {
            const bgColor =
              pokemonTypeColors[typeName as keyof typeof pokemonTypeColors];
            return (
              <option
                key={typeName}
                value={typeName}
                selected={type === typeName}
                style={{ backgroundColor: bgColor }}
                className="font-semibold"
              >
                {capitalize(typeName)}
              </option>
            );
          })}
        </select>
      </div>
      {loadingPokemons ||
      loadingEvolutionChains ||
      loadingGenerations ||
      loadingTypes ? (
        <Loading />
      ) : (
        <div className="grid w-full grid-cols-2 gap-4 px-2 py-2 md:grid-cols-4 xl:grid-cols-6">
          {pokemonsFiltered?.map(({ id, name, generation, types, image }) => (
            <PokemonCard
              key={id}
              id={id}
              name={name}
              generation={generation}
              types={types}
              image={image}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function Suspensed() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
