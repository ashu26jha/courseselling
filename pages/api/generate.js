const { Configuration, OpenAIApi } = require("openai");

import reportData from "../../data/report.json";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const basePromptPrefix = `
Given this dataset about a hemp farm, with a set of observations for each month of the year, represented in the "datetime" field.

Dataset:
`;

export default async function handler(req, res) {
  if (req.method === "GET") {
    const query = req.query.query;

    const observations = reportData.map(({ observations }) => ({
      observations,
    }));

    const prompt = `
      ${basePromptPrefix}${JSON.stringify(observations)}
      

      Can you tell me ${query}

      If there are any calculations don't worry about them, just give me the answer.
      `;

    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0.7,
        max_tokens: 500,
      });

      const output = completion.data.choices[0].text;

      return res.status(200).json(output);
    } catch (error) {
      console.error("Error: ", error);
      return res.status(500).json({ message: error });
    }
  } else {
    return res.status(405).json({ message: "Method is not allowed" });
  }
}
