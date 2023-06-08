const { Configuration, OpenAIApi } = require("openai");

function configureOpenAi(apiKey: string) {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  return new OpenAIApi(configuration);
}

export async function generateRandomCharacter() {
  // Prompt for generating the character
  const SUPER_PROMPT = `
    Create a random cyberpunk beautiful fantasy character based on the cyberpunk 2077 story. The character can be male or female. The characters should range wildly in personality and skill. Output the character data in JSON format with the following attributes: 
      1. name: Name of the character.
      2. gender: Sex of the character.
      3. description: A detailed description of the character.
      4. personaPrompt: A persona prompt that could be used to set the character's persona for a following conversation with an AI model.
      5. imagePrompt: An image prompt that could be used to generate a visual representation of the character with a generative AI model.
  `;

  // Configuring OpenAI with the provided API key
  const openai = configureOpenAi(process.env.OPENAI_API_KEY as string);

  // Generating the character description using OpenAI's text-davinci-003 model
  const responseCharacter = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: SUPER_PROMPT,
    temperature: 0.7,
    max_tokens: 3500,
  });

  const characterObject = JSON.parse(responseCharacter.data.choices[0].text);

  // Generating an image representation of the character using OpenAI's image model
  const responseImage = await openai.createImage({
    prompt: characterObject.imagePrompt + " in the style of cyberpunk 2077 using Sigma 85 mm f/1.4",
    n: 1,
    size: "1024x1024",
  });

  // Creating the final character object with the generated data and image URL
  const finalCharacter = {
    ...characterObject,
    imageUrl: responseImage.data.data[0].url,
  };

  return finalCharacter;
}

export async function setChatPersona(personaData: {
  personaPrompt: string;
  description: string;
  name: string;
}) {
  const { description, name, personaPrompt } = personaData;

  const prompt = `You are ${description} and your persona is ${personaPrompt}. Your name is ${name} and we just met and you are ready to take me on a adventure.  Communicate with me in character always.  Start the chat with an introduction about yourself.`;
  const openai = configureOpenAi(process.env.OPENAI_API_KEY as string);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: prompt }],
  });

  return response.data;
}

export async function sendMessage(message: string, history: any) {
  const openai = configureOpenAi(process.env.OPENAI_API_KEY as string);
  const prevHistory = JSON.parse(history);
  const messages = [...prevHistory, { role: "user", content: message }];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  return response.data;
}

export async function setPersona(personaData: {
  personaPrompt: string;
  description: string;
  name: string;
}) {
  const { description, name, personaPrompt } = personaData;

  const prompt = `You are ${description} and your persona is ${personaPrompt}. Your name is ${name} and we just met and you are ready to take me on a adventure.  Communicate with me in character always.  Start the chat with an introduction about yourself.`;

  const openai = configureOpenAi(process.env.OPENAI_API_KEY as string);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    max_tokens: 3500,
  });

  return response.data;
}
