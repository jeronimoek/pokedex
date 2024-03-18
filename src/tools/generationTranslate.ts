export function generationTranslate(generation: string) {
  const romanNumber = generation.slice("generation-".length);
  let generationNumber = 1;
  switch (romanNumber) {
    case "i":
      generationNumber = 1;
      break;
    case "ii":
      generationNumber = 2;
      break;
    case "iii":
      generationNumber = 3;
      break;
    case "iv":
      generationNumber = 4;
      break;
    case "v":
      generationNumber = 5;
      break;
    case "vi":
      generationNumber = 6;
      break;
    case "vii":
      generationNumber = 7;
      break;
    case "viii":
      generationNumber = 8;
      break;
    case "ix":
      generationNumber = 9;
      break;
  }
  return `Gen. ${generationNumber}`;
}
