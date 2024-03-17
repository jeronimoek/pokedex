"use client";

import { useEffect, useState } from "react";
import { type Pokemon } from "~/interfaces/pokemon";
import { api } from "~/trpc/react";

export default function Home() {
  // const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  const [pokemons, refetchPokemons] = api.pokemon.pokemons.useSuspenseQuery();

  async function searchPokemon(name?: string) {
    refetchPokemons.refetch({ name });
  }

  // useEffect(() => {
  //   void searchPokemon();
  // }, []);

  return (
    <main className="min-h-screen bg-blue-950 text-white">
      <div className="grid w-full grid-cols-5 gap-12 px-2 py-2">
        <input onChange={(e) => searchPokemon(e.target.value)} />
        {pokemons.map(({ name }) => (
          <div key={name}>{name}</div>
        ))}
      </div>
    </main>
  );
}
