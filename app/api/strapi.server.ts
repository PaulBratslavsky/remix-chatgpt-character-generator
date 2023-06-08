export async function saveCharacter(character: any) {
  const token = process.env.CREATE_CHARACTER_KEY;
  const url = `${process.env.STRAPI_API_URL}/api/characters`;
  const data = { data: { ...character } };

  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const response = await fetch(url as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  return responseData;
}

export async function getCharacters() {
  const token = process.env.READ_CHARACTER_KEY;
  const url = `${process.env.STRAPI_API_URL}/api/characters?sort[0]=createdAt:desc`;
  // https://docs.strapi.io/dev-docs/api/rest/interactive-query-builder
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const response = await fetch(url as string, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const responseData = await response.json();
  return responseData;
}

export async function getCharacterById(characterId: string) {
  const token = process.env.READ_CHARACTER_KEY;
  const url = `${process.env.STRAPI_API_URL}/api/characters?filters[id]=${characterId}`;
  const response = await fetch(url as string, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const responseData = await response.json();
  return responseData;
}


