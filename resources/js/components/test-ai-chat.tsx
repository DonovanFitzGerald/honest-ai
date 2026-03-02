import React, { useState } from 'react';

const TestAIChat = (props: { className?: string }) => {
    const [inputText, setinputText] = useState(
        'Explain how AI works in a few words',
    );
    const [chatResponse, setchatResponse] = React.useState(null);
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleInputChange = (e) => {
        setinputText(e.target.value);
    };

    const handleButtonPress = async () => {
        const url = '/api/ai';
        console.log('Request prompt:', inputText);
        try {
            setIsLoading(true);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: inputText,
                }),
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            const responses = result.parts;
            setchatResponse(responses);
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`flex h-full w-full items-center justify-center ${props.className ? props.className : ''}`}
        >
            <div className="m-auto flex flex-col items-stretch gap-12">
                {isLoading ? (
                    <p className="w-fit animate-bounce">Awaiting response...</p>
                ) : chatResponse ? (
                    chatResponse.map((r) => <p>{r.text}</p>)
                ) : (
                    <p>No response yet</p>
                )}
                {errorMessage ? (
                    <p className="text-red-500">{errorMessage}</p>
                ) : null}
                <textarea
                    className="border-2 border-black p-4"
                    type="textarea"
                    rows="4"
                    cols="50"
                    onChange={(e) => handleInputChange(e)}
                    value={inputText}
                ></textarea>
                <button
                    className="cursor-pointer rounded-2xl border-black bg-blue-400 px-4 py-4 font-bold text-white"
                    onMouseDown={() => handleButtonPress()}
                >
                    Send prompt
                </button>
            </div>
        </div>
    );
};

export default TestAIChat;
