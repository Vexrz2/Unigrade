"use client";

import React from 'react';

interface UniMascotProps {
    mood?: 'happy' | 'thinking' | 'excited' | 'waving' | 'celebrating';
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export default function UniMascot({ mood = 'happy', size = 'md', message }: UniMascotProps) {
    const sizeClasses = {
        sm: 'w-20 h-16',
        md: 'w-32 h-24',
        lg: 'w-44 h-32',
    };

    const getMoodAnimation = () => {
        switch (mood) {
            case 'waving':
                return 'animate-wave-gentle';
            case 'excited':
                return 'animate-bounce-gentle';
            case 'thinking':
                return 'animate-thinking-gentle';
            default:
                return 'animate-float';
        }
    };

    const getMouthPath = () => {
        // Face center is at (47, 44), mouth should be centered below
        switch (mood) {
            case 'excited':
                return 'M 40 52 Q 47 58 54 52';
            case 'thinking':
                return 'M 41 54 Q 47 52 53 54'; // Slight frown/thinking
            case 'waving':
                return 'M 40 52 Q 47 58 54 52';
            default:
                return 'M 40 52 Q 47 57 54 52'; // Happy smile
        }
    };

    // For thinking mood - eyes look up-right
    const getEyePupilOffset = () => {
        if (mood === 'thinking') {
            return { x: 1, y: -1 };
        }
        return { x: 0, y: 0 };
    };

    const pupilOffset = getEyePupilOffset();

    return (
        <div className="flex flex-col items-center gap-3">
            <div className={`${sizeClasses[size]} ${getMoodAnimation()} relative`}>
                <svg viewBox="0 0 95 70" className="w-full h-full drop-shadow-lg">
                    {/* Graduation cap - shifted right by 12 to center in wider viewBox */}
                    <g>
                        {/* Cap base */}
                        <polygon
                            points="27,22 47,12 67,22 47,32"
                            fill="#112D4E"
                            className="drop-shadow-sm"
                        />
                        {/* Cap top square */}
                        <rect x="39" y="7" width="16" height="5" rx="1" fill="#112D4E" />
                        {/* Tassel - attached at button point on cap */}
                        <g style={{ transformOrigin: '55px 9px' }} className={mood === 'waving' ? 'animate-tassel-swing' : ''}>
                            {/* Tassel button (attachment point) */}
                            <circle cx="55" cy="9" r="2" fill="#FFD700" />
                            {/* Tassel string */}
                            <path
                                d="M 55 11 Q 60 16 62 22"
                                stroke="#FFD700"
                                strokeWidth="2"
                                fill="none"
                            />
                            {/* Tassel end */}
                            <ellipse cx="63" cy="24" rx="3" ry="4" fill="#FFD700" />
                        </g>
                    </g>

                    {/* Face/body - centered at x=47 */}
                    <circle cx="47" cy="44" r="22" fill="#3F72AF" className="drop-shadow" />

                    {/* Cheeks */}
                    <circle cx="34" cy="48" r="4" fill="#FFB6C1" opacity="0.5" />
                    <circle cx="60" cy="48" r="4" fill="#FFB6C1" opacity="0.5" />

                    {/* Eyebrows for thinking mood */}
                    {mood === 'thinking' && (
                        <>
                            <path d="M 36 36 Q 39 34 42 36" stroke="#112D4E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            <path d="M 52 36 Q 55 34 58 36" stroke="#112D4E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </>
                    )}

                    {/* Eyes */}
                    <g>
                        {/* Left eye white */}
                        <circle cx="40" cy="42" r="5" fill="white" />
                        {/* Right eye white */}
                        <circle cx="54" cy="42" r="5" fill="white" />
                        {/* Left pupil */}
                        <circle
                            cx={40 + pupilOffset.x}
                            cy={42 + pupilOffset.y}
                            r="2.5"
                            fill="#112D4E"
                            className="animate-blink"
                        />
                        {/* Right pupil */}
                        <circle
                            cx={54 + pupilOffset.x}
                            cy={42 + pupilOffset.y}
                            r="2.5"
                            fill="#112D4E"
                            className="animate-blink"
                        />
                        {/* Eye shine */}
                        <circle cx={41 + pupilOffset.x} cy={41 + pupilOffset.y} r="1" fill="white" opacity="0.9" />
                        <circle cx={55 + pupilOffset.x} cy={41 + pupilOffset.y} r="1" fill="white" opacity="0.9" />
                    </g>

                    {/* Mouth - centered at x=47 */}
                    <path
                        d={getMouthPath()}
                        stroke="#112D4E"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Waving hand for waving mood */}
                    {mood === 'waving' && (
                        <g className="animate-wave-hand-gentle" style={{ transformOrigin: '64px 50px' }}>
                            <ellipse cx="70" cy="42" rx="5" ry="4" fill="#3F72AF" />
                            {/* Small fingers hint */}
                            <ellipse cx="73" cy="40" rx="2" ry="1.5" fill="#3F72AF" />
                        </g>
                    )}

                    {/* Thinking bubble - wide fluffy cloud */}
                    {mood === 'thinking' && (
                        <g className="animate-think-bubble-gentle">
                            {/* Tail bubbles */}
                            <circle cx="72" cy="34" r="2.5" fill="#DBE2EF" />
                            <circle cx="76" cy="26" r="3" fill="#DBE2EF" />

                            {/* Main thought cloud */}
                            <g>
                                <circle cx="80" cy="12" r="6" fill="#DBE2EF" />
                                <circle cx="88" cy="14" r="6" fill="#DBE2EF" />
                                <circle cx="84" cy="16" r="5" fill="#DBE2EF" />
                                <circle cx="81" cy="8" r="5" fill="#DBE2EF" />
                                <circle cx="77" cy="16" r="5" fill="#DBE2EF" />
                                <circle cx="83" cy="16" r="4" fill="#DBE2EF" />
                                <circle cx="85" cy="18" r="5" fill="#DBE2EF" />
                                <circle cx="82" cy="20" r="4" fill="#DBE2EF" />
                                <circle cx="87" cy="20" r="4" fill="#DBE2EF" />
                                <circle cx="86" cy="10" r="4" fill="#DBE2EF" />
                            </g>
                        </g>
                    )}
                </svg>
            </div>

            {message && (
                <div className="relative bg-white rounded-xl px-4 py-2 shadow-md border-2 border-theme3/20 max-w-xs">
                    {/* Speech bubble pointer */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-theme3/20 rotate-45" />
                    <p className="text-gray-700 text-sm font-medium text-center relative z-10">
                        {message}
                    </p>
                </div>
            )}
        </div>
    );
}
