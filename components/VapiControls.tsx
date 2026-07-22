'use client'

import useVapi, { CallStatus } from '@/hooks/useVapi'
import { AlertTriangle, Mic, MicOff, X } from 'lucide-react'
import { IBook } from './types';
import Image from 'next/image'
import { formatDuration, getVoice } from '@/lib/utils'
import Transcript from './Transcript'

const STATUS_DISPLAY: Record<CallStatus, { label: string; dotClass: string }> = {
    idle: { label: 'Ready', dotClass: 'vapi-status-dot-ready' },
    connecting: { label: 'Connecting…', dotClass: 'vapi-status-dot-connecting' },
    starting: { label: 'Starting…', dotClass: 'vapi-status-dot-starting' },
    listening: { label: 'Listening…', dotClass: 'vapi-status-dot-listening' },
    thinking: { label: 'Thinking…', dotClass: 'vapi-status-dot-thinking' },
    speaking: { label: 'Speaking…', dotClass: 'vapi-status-dot-speaking' },
};

const VapiControls = ({ book }: { book: IBook }) => {

    const voice = getVoice(book.persona)
    const { status, isActive, messages, currentMessage, currentUserMessage, duration,
        maxDurationSeconds, start, stop, limitError, clearError } = useVapi(book);
    const statusDisplay = STATUS_DISPLAY[status];
    return (
        <>
            {limitError && (
                <div className="warning-banner w-full">
                    <div className="warning-banner-content">
                        <AlertTriangle className="warning-banner-icon shrink-0" />
                        <span className="warning-banner-text flex-1">{limitError}</span>
                        <button
                            onClick={clearError}
                            aria-label="Dismiss"
                            className="text-[var(--accent-warm)] hover:opacity-70 transition-opacity cursor-pointer shrink-0"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            )}

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
                            onClick={isActive ? stop : start}
                            disabled={status === 'connecting'}
                            aria-label={isActive ? "Stop voice assistant" : "Start voice assistant"}
                            title={isActive ? "Stop voice assistant" : "Start voice assistant"}
                            className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] z-10 ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'
                                }`}
                        >
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
                            <span className={`vapi-status-dot ${statusDisplay.dotClass}`} />
                            <span className="vapi-status-text">{statusDisplay.label}</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">Voice: {voice.name}</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">
                                {formatDuration(duration)}/{formatDuration(maxDurationSeconds)}
                            </span>
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
