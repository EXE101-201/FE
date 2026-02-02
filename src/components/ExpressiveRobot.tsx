import React from 'react';

export type RobotExpression = 'neutral' | 'happy' | 'empathetic' | 'thinking' | 'surprised' | 'sad';

interface ExpressiveRobotProps {
    expression: RobotExpression;
    className?: string;
    size?: number;
}

const ExpressiveRobot: React.FC<ExpressiveRobotProps> = ({ expression, className = "", size = 180 }) => {
    // Define eye and mouth states based on expression
    const getExpressionStyles = () => {
        switch (expression) {
            case 'happy':
                return {
                    leftEye: 'M 35 45 Q 45 35 55 45',
                    rightEye: 'M 75 45 Q 85 35 95 45',
                    mouth: 'M 40 70 Q 65 85 90 70',
                    color: '#4ade80'
                };
            case 'sad':
                return {
                    leftEye: 'M 35 45 Q 45 55 55 45', // Droopy
                    rightEye: 'M 75 45 Q 85 55 95 45',
                    mouth: 'M 50 85 Q 65 75 80 85',   // Inverted smile
                    color: '#94a3b8' // Grayish
                };
            case 'empathetic':
                return {
                    leftEye: 'M 35 48 Q 45 42 55 48',
                    rightEye: 'M 75 48 Q 85 42 95 48',
                    mouth: 'M 45 75 Q 65 78 85 75',
                    color: '#60a5fa'
                };
            case 'thinking':
                return {
                    leftEye: 'M 35 45 L 55 45',
                    rightEye: 'M 75 45 L 95 45',
                    mouth: 'M 55 75 L 75 75',
                    color: '#fbbf24'
                };
            case 'surprised':
                return {
                    leftEye: 'M 45 45 A 5 5 0 1 1 45.1 45', // Circle as path
                    rightEye: 'M 85 45 A 5 5 0 1 1 85.1 45',
                    mouth: 'M 55 75 Q 65 85 75 75',
                    color: '#f87171'
                };
            default:
                return {
                    leftEye: 'M 35 45 L 55 45',
                    rightEye: 'M 75 45 L 95 45',
                    mouth: 'M 50 75 L 80 75',
                    color: '#58856c'
                };
        }
    };

    const styles = getExpressionStyles();

    return (
        <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
            {/* CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                }
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                }
                @keyframes sway {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .robot-body {
                    animation: float 4s ease-in-out infinite;
                }
                .robot-head {
                    animation: breathe 3s ease-in-out infinite;
                    transform-origin: center bottom;
                }
                .robot-left-arm {
                    animation: wave 2.5s ease-in-out infinite;
                    transform-origin: 25px 65px;
                }
                .robot-right-arm {
                    animation: sway 3s ease-in-out infinite;
                    transform-origin: 105px 65px;
                }
                .eye-path, .mouth-path {
                    transition: d 0.3s ease-in-out;
                }
            `}</style>

            <svg viewBox="0 0 130 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full robot-body">
                {/* Glow effect */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f8fafc" />
                    </linearGradient>
                </defs>

                {/* Left Arm */}
                <g className="robot-left-arm">
                    <path d="M 25 65 Q 10 70 5 95" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="5" cy="95" r="5" fill="white" stroke="#cbd5e1" strokeWidth="2" />
                </g>

                {/* Right Arm Holding Clipboard */}
                <g className="robot-right-arm">
                    <path d="M 105 65 Q 120 70 125 95" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                    {/* Clipboard */}
                    <g transform="translate(110, 85) rotate(-10)">
                        <rect x="0" y="0" width="18" height="24" rx="2" fill="#94a3b8" />
                        <rect x="2" y="2" width="14" height="20" rx="1" fill="white" />
                        <rect x="4" y="6" width="10" height="1" fill="#e2e8f0" />
                        <rect x="4" y="10" width="10" height="1" fill="#e2e8f0" />
                        <rect x="4" y="14" width="7" height="1" fill="#e2e8f0" />
                        <rect x="6" y="-2" width="6" height="3" rx="1" fill="#64748b" />
                    </g>
                    <circle cx="125" cy="95" r="5" fill="white" stroke="#cbd5e1" strokeWidth="2" />
                </g>

                {/* Robot Head Content */}
                <g className="robot-head">
                    {/* Main Head Shape */}
                    <rect x="20" y="20" width="90" height="85" rx="42" fill="url(#robotGradient)" stroke="#e2e8f0" strokeWidth="2" />

                    {/* Face Screen */}
                    <rect x="30" y="32" width="70" height="50" rx="20" fill="#1e293b" />

                    {/* Eyes */}
                    <path d={styles.leftEye} stroke={styles.color} strokeWidth="4.5" strokeLinecap="round" className="eye-path" filter="url(#glow)" fill="none" />
                    <path d={styles.rightEye} stroke={styles.color} strokeWidth="4.5" strokeLinecap="round" className="eye-path" filter="url(#glow)" fill="none" />

                    {/* Mouth */}
                    <path d={styles.mouth} stroke={styles.color} strokeWidth="3" strokeLinecap="round" className="mouth-path" fill="none" />

                    {/* Antenna */}
                    <line x1="65" y1="20" x2="65" y2="5" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="65" cy="5" r="4.5" fill={styles.color} filter="url(#glow)" />

                    {/* Ear-like speakers */}
                    <circle cx="20" cy="62" r="9" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="110" cy="62" r="9" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                </g>
            </svg>
        </div>
    );
};

export default ExpressiveRobot;
