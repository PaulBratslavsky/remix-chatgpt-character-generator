import { useEffect, useState, useRef } from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import type { V2_MetaFunction } from "@remix-run/node";
import { getCharacterById } from "~/api/strapi.server";
import { sendMessage } from "~/api/chat-gpt.server";

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
  const { name, imageUrl, description } = data;
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <img
        className="w-full h-56 object-fit object-top"
        src={imageUrl}
        alt={name}
      />
      <div className="py-4 px-6">
        <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
        <p className="text-gray-700 text-base mt-4">{description}</p>
      </div>
    </div>
  );
};

const ChatView = ({ chatData, name }: { chatData: any; name: string }) => (
  <div className="flex flex-col h-full p-6 space-y-4">
    {chatData.map((msg: any, index: any) => (
      <div
        key={index}
        className={`max-w-lg p-2 rounded-md ${
          msg.role === "user"
            ? "bg-violet-600 text-white self-start"
            : "bg-pink-600 text-white self-end"
        }`}
      >
        <h4 className="font-semibold">{msg.role === "user" ? "you" : name}</h4>
        <p>{msg.content}</p>
      </div>
    ))}
  </div>
);

export const loader = async ({ params }: LoaderArgs) => {
  const characterId = params.characterId;
  if (characterId) {
    const character = await getCharacterById(characterId);
    const { personaPrompt, description, name, imageUrl } =
      character.data[0].attributes;
    return json({ characterId, name, imageUrl, description, personaPrompt });
  }
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const message = formData.get("chat");
  const history = formData.get("history");

  if (typeof message === "string") {
    const messageResponse = await sendMessage(message, history);
    return json({ data: messageResponse });
  }
};

function removeDuplicates(array: any) {
  const uniqueArray = [];
  const contentSet = new Set();

  for (const obj of array) {
    if (!contentSet.has(obj.content)) {
      uniqueArray.push(obj);
      contentSet.add(obj.content);
    }
  }

  return uniqueArray;
}

export default function CharacterGetRoute() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();

  const chatRef = useRef(null);
  const historyRef = useRef(null);

  function submitForm() {
    fetcher.submit(
      {
        chat: chatRef.current.value,
        history: historyRef.current.value,
      },
      { method: "post" }
    );
    setHistory((prevState) => [
      ...prevState,
      { role: "user", content: chatRef.current.value },
    ]);
  }

  const { description, personaPrompt, name } = loaderData;
  const prompt = `You are ${description} and your persona is ${personaPrompt}. We are roleplaying and I want you to answer in character. Your name is ${name} and we just met and you are ready to take me on a adventure.  Communicate with me in character always.  Start the chat with an introduction about yourself.`;
  const [history, setHistory] = useState([{ role: "user", content: prompt }]);

  useEffect(() => {
    if (fetcher.state !== "loading" && fetcher.data) {
      const message = fetcher.data.data.choices[0].message;
      setHistory((prevState) => {
        const tempArray = [...prevState, message];
        return removeDuplicates(tempArray);
      });
    }
  }, [fetcher]);

  return (
    <div className="grid grid-cols-4 gap-4 my-6">
      <div className="col-span-3 grid grid-rows-5 gap-4 h-[calc(100vh-100px)]">
        <div className="row-span-4 overflow-auto bg-gray-50 rounded-md">
          <ChatView chatData={history.slice(1)} name={name} />
        </div>
        <div className="row-span-1">
          <fetcher.Form method="post" className="flex items-center">
            <textarea
              name="chat"
              ref={chatRef}
              className="flex-grow p-2 mr-2 rounded-md border border-gray-300 resize-none"
              placeholder="Type your message here..."
              key={JSON.stringify(history)}
            />
            <input
              name="history"
              defaultValue={JSON.stringify(history)}
              ref={historyRef}
              hidden
            />
            <button
              type="button"
              onClick={submitForm}
              className="py-2 px-6 text-white bg-violet-600 rounded-md hover:bg-violet-600 h-16"
            >
              Submit
            </button>
          </fetcher.Form>
        </div>
      </div>
      <div className="col-span-1">
        <Card data={loaderData} />
      </div>
    </div>
  );
}
