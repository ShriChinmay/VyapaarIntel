import { SarvamAIClient } from "sarvamai";
const YOUR_API_SUBSCRIPTION_KEY = process.env.YOUR_API_SUBSCRIPTION_KEY;

const client = new SarvamAIClient({
    apiSubscriptionKey: "YOUR_API_SUBSCRIPTION_KEY"
});

export const AutoToEnglish = async (req, res) => {
    try {
        const prompt = req.body;
        const response = await client.text.translate({
            input: prompt,
            source_language_code: "auto",
            target_language_code: "gu-IN",
            model: "sarvam-translate:v1"
        });

        return res.json({ translation: response });
    } catch (error) {
        console.error(error);
        return res.status(501).json({ error: error.message });
    }
}


