import { z } from "zod";
import {
  type ChainLink,
  type EvolutionChain,
  type Pokemon,
  type List,
  type Species,
  type Reference,
  type CustomLink,
} from "~/interfaces/pokemon";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

async function cacheFetch(url: string) {
  return (await fetch(url, { cache: "force-cache" })).json();
}

function chainLinkSpecies(chainLink: ChainLink) {
  const species: Reference[] = [];
  function extractSpeciesFromLink(link: ChainLink) {
    species.push(link.species);
    link.evolves_to.forEach((nextLink) => extractSpeciesFromLink(nextLink));
  }
  extractSpeciesFromLink(chainLink);
  return species;
}

export const pokemonRouter = createTRPCRouter({
  pokemon: publicProcedure
    .input(z.object({ id: z.number().int().min(1) }))
    .query(async ({ input: { id } }) => {
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}/`;
      const pokemon = (await cacheFetch(pokemonUrl)) as Pokemon;
      const species = (await cacheFetch(pokemon.species.url)) as Species;
      const evolutionChain = (await cacheFetch(
        species.evolution_chain.url,
      )) as EvolutionChain;

      async function createEvolutionChain(currLink: ChainLink) {
        let currPokemon: Pokemon;
        let currSpecies: Species;
        if (currLink.species.url === pokemon.species.url) {
          currPokemon = pokemon;
          currSpecies = species;
        } else {
          currSpecies = (await cacheFetch(currLink.species.url)) as Species;
          const currPokemonUrl = currSpecies.varieties.find(
            ({ is_default }) => is_default,
          )!.pokemon.url;
          currPokemon = (await cacheFetch(currPokemonUrl)) as Pokemon;
        }
        const finalPokemon = {
          id: currPokemon.id,
          name: currPokemon.name,
          generation: currSpecies.generation.name,
          types: currPokemon.types.map(({ type }) => type.name),
          image: currPokemon.sprites.front_default,
        };
        let evolvesTo: CustomLink<typeof finalPokemon>[] = [];
        if (currLink.evolves_to.length) {
          evolvesTo = await Promise.all(
            currLink.evolves_to.map(createEvolutionChain),
          );
        }
        return {
          pokemon: finalPokemon,
          evolvesTo,
        };
      }

      const pokemonChain = await createEvolutionChain(evolutionChain.chain);

      const pokemonCustom = {
        id: pokemon.id,
        name: pokemon.name,
        speciesName: pokemon.species.name,
        generation: species.generation.name,
        types: pokemon.types.map(({ type }) => type.name),
        image: pokemon.sprites.front_default,
        stats: pokemon.stats,
        pokemonChain,
      };

      return pokemonCustom;
    }),

  pokemons: publicProcedure.query(async () => {
    const pokemonListUrl = "https://pokeapi.co/api/v2/pokemon/?limit=9999";
    const pokemonList = (await cacheFetch(pokemonListUrl)) as List;
    const pokemons = await Promise.all(
      pokemonList.results.map(({ url }) => {
        return cacheFetch(url) as Promise<Pokemon>;
      }),
    );

    const speciesListUrl =
      "https://pokeapi.co/api/v2/pokemon-species/?limit=9999";
    const speciesList = (await cacheFetch(speciesListUrl)) as List;
    const species = await Promise.all(
      speciesList.results.map(({ url }) => {
        return cacheFetch(url) as Promise<Species>;
      }),
    );
    const speciesMap = species.reduce(
      (acc, curr) => {
        acc[curr.name] = curr;
        return acc;
      },
      {} as Record<string, Species>,
    );

    const pokemonsCustom = pokemons.map((pokemon) => {
      return {
        id: pokemon.id,
        name: pokemon.name,
        speciesName: pokemon.species.name,
        generation: speciesMap[pokemon.species.name]!.generation.name,
        types: pokemon.types.map(({ type }) => type.name),
        image: pokemon.sprites.front_default,
      };
    });

    return pokemonsCustom;
  }),

  evolutionChains: publicProcedure.query(async () => {
    const evolutionChainsListUrl =
      "https://pokeapi.co/api/v2/evolution-chain/?limit=9999";
    const evolutionChainsList = (await cacheFetch(
      evolutionChainsListUrl,
    )) as List;
    const evolutionChains = await Promise.all(
      evolutionChainsList.results.map(({ url }) => {
        return cacheFetch(url) as Promise<EvolutionChain>;
      }),
    );

    const evolutionChainsCustom = evolutionChains.map(({ chain }) => {
      const speciesNames = chainLinkSpecies(chain).map((spec) => spec.name);

      return { speciesNames };
    });

    return evolutionChainsCustom;
  }),

  generations: publicProcedure.query(async () => {
    const generationsListUrl =
      "https://pokeapi.co/api/v2/generation/?limit=9999";

    const generationsList = (await cacheFetch(generationsListUrl)) as List;

    return generationsList.results;
  }),

  types: publicProcedure.query(async () => {
    const typesListUrl = "https://pokeapi.co/api/v2/type/?limit=9999";

    const typesList = (await cacheFetch(typesListUrl)) as List;

    return typesList.results;
  }),
});
