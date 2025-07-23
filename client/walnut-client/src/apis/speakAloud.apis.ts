const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length) return resolve(voices);
        speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    });
}

const speakAloud = async (text: string): Promise<void> => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = await loadVoices();

    console.log(voices);

    const preferredVoice = voices.find((v) => {
        return (
            v.name.includes("Google UK English Female") ||
            v.name.includes("Google US English") ||
            v.name.includes("Microsoft Zira") ||
            (v.lang === "en-US" && v.name.toLowerCase().includes("female"))
        );
    });

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
};

export default speakAloud;
