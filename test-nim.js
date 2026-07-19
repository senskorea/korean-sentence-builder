import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{"role":"user","content":"Respond with {} in JSON"}],
      response_format: { type: 'json_object' },
      max_tokens: 50,
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (e) {
    console.error("Error:", e.message);
    if (e.response) {
      console.error(e.response.data);
    }
  }
}
test();
