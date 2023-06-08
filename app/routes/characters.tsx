import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { V2_MetaFunction } from "@remix-run/node";
import { getCharacters } from "~/api/strapi.server";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "All Character" },
    {
      name: "Character Generated Characters",
      content: "Get All Cyberpunk Characters",
    },
  ];
};

const Card = ({ data }: { data: any }) => {
  const { attributes: character } = data;
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <img
        className="w-full h-56 object-cover object-center"
        src={character.imageUrl}
        alt={character.name}
      />
      <div className="py-4 px-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {character.name}
        </h2>
        <p className="text-gray-600 mt-2">{character.gender}</p>
        <p className="text-gray-700 text-base mt-4">{character.description}</p>
      </div>
    </div>
  );
};

export const loader = async () => {
  const allCharacters = await getCharacters();
  return json({ ...allCharacters });
};

export default function CharacterGetRoute() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <div className="grid grid-cols-4 gap-4 my-6">
      {loaderData.data.map((character: any) => (
        <Card key={character.id} data={character} />
      ))}
    </div>
  );
}
