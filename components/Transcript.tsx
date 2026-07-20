'use client'

import { useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'
import { Messages } from './types'

interface TranscriptProps {
    messages: Messages[];
    currentMessage: string;
    currentUserMessage: string;
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentMessage, currentUserMessage]);

    const hasContent = messages.length > 0 || currentMessage || currentUserMessage;

    if (!hasContent) {
        return (
            <div className="transcript-container">
                <div className="transcript-empty">
                    <Mic className="size-12 text-[var(--text-muted)] mb-4" />
                    <p className="transcript-empty-text">No conversation yet</p>
                    <p className="transcript-empty-hint">Click the mic button above to start talking</p>
                </div>
            </div>
        )
    }

    return (
        <div className="transcript-container">
            <div className="transcript-messages">
                {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                        <div
                            key={index}
                            className={`transcript-message ${isUser ? 'transcript-message-user' : 'transcript-message-assistant'}`}
                        >
                            <div className={`transcript-bubble ${isUser ? 'transcript-bubble-user' : 'transcript-bubble-assistant'}`}>
                                {message.content}
                            </div>
                        </div>
                    )
                })}

                {currentUserMessage && (
                    <div className="transcript-message transcript-message-user">
                        <div className="transcript-bubble transcript-bubble-user">
                            {currentUserMessage}
                            <span className="transcript-cursor" />
                        </div>
                    </div>
                )}

                {currentMessage && (
                    <div className="transcript-message transcript-message-assistant">
                        <div className="transcript-bubble transcript-bubble-assistant">
                            {currentMessage}
                            <span className="transcript-cursor" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    )
}

export default Transcript
