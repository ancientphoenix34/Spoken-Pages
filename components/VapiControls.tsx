'use client'

import useVapi from '@/hooks/useVapi'
import { Mic, MicOff } from 'lucide-react'
import { IBook } from './types';
import Image from 'next/image'
import { getVoice } from '@/lib/utils'
import Transcript from './Transcript'


const VapiControls = ({ book }: { book: IBook }) => {

    const voice = getVoice(book.persona)
    const { status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, clearError } = useVapi(book);
    return (
        <>
            <div className="vapi-header-card w-full">
                <div className="vapi-cover-wrapper">
                    <Image
                        src={book.coverURL}
                        alt={book.title}
                        width={120}
                        height={180}
                        className="vapi-cover-image"
                    />
                    <div className="vapi-mic-wrapper">
                        {(status === 'thinking' || status === 'speaking') && (
                            <span className="vapi-pulse-ring" />
                        )}
                        <button
                        onClick={isActive?stop:start}
                        disabled={status ==='connecting'}
                        type="button"
                        className={`vapi-mic-btn ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                        aria-label="Toggle microphone">
                            {isActive
                                ? <Mic className="size-5 text-white" />
                                : <MicOff className="size-5 text-[#212a3b]" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#212a3b]">
                            {book.title}
                        </h1>
                        <p className="text-[#3d485e] mt-1">by {book.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-dot vapi-status-dot-ready" />
                            <span className="vapi-status-text">Ready</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">Voice: {voice.name}</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">0:00/15:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="vapi-transcript-wrapper w-full">
                <Transcript
                    messages={messages}
                    currentMessage={currentMessage}
                    currentUserMessage={currentUserMessage}
                />
            </div>
        </>
    )
}

export default VapiControls
