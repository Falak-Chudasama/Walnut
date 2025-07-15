import constants from "../constants/constants";

export default async function getResponse(prompt: string, model: string): Promise<string> {
    try {
        const res = await fetch(`${constants.origin}/ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                model: model
            })
        });

        if (!res.ok) {
            console.log(res);
            throw new Error('Server error');
        }

        const data = await res.json();
        return data.result;
    } catch (err) {
        console.error(err);
        return '<Error fetching response>: ' + err;
    }
}