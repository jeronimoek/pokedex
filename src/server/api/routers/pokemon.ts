import { z } from "zod";
import {
  type ChainLink,
  type EvolutionChain,
  type Pokemon,
  type PokemonList,
  type Species,
} from "~/interfaces/pokemon";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

async function cacheFetch(url: string) {
  return (await fetch(url, { cache: "force-cache" })).json();
}

export const pokemonRouter = createTRPCRouter({
  pokemons: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(async ({ input: { name } = {} }) => {
      const pokemonListUrl = "https://pokeapi.co/api/v2/pokemon/?limit=9999";
      const pokemonList = (await cacheFetch(pokemonListUrl)) as PokemonList;
      let pokemons = await Promise.all(
        pokemonList.results.map(({ url }) => {
          return cacheFetch(url) as Promise<Pokemon>;
        }),
      );

      if (name) {
        const filteredPokemonsByName = pokemons.filter(
          (pokemon) =>
            pokemon.name.toLocaleLowerCase().indexOf(name.toLocaleLowerCase()) >
            -1,
        );
        const speciesInEvolution: string[] = [];
        for (const pokemon of filteredPokemonsByName) {
          const species = (await cacheFetch(pokemon.species.url)) as Species;
          const evolutionChain = (await cacheFetch(
            species.evolution_chain.url,
          )) as EvolutionChain;
          const getSpeciesFromEvolution = (link: ChainLink) => {
            speciesInEvolution.push(link.species.url);
            link.evolves_to.forEach(getSpeciesFromEvolution);
          };
          getSpeciesFromEvolution(evolutionChain.chain);
        }
        pokemons = pokemons.filter((pokemon) =>
          speciesInEvolution.includes(pokemon.species.url),
        );
      }

      return {
        pokemons,
      };
    }),
});
