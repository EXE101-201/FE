import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GlobalRobot() {
    const navigate = useNavigate();
    const location = useLocation();
    const [pos, setPos] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [showBubble, setShowBubble] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });



    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: pos.x,
            initialY: pos.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = dragRef.current.startX - e.clientX;
            const deltaY = dragRef.current.startY - e.clientY;

            setPos({
                x: dragRef.current.initialX + deltaX,
                y: dragRef.current.initialY + deltaY
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleClick = () => {
        if (!isDragging) {
            navigate('/chat');
        }
    };

    if (location.pathname === '/chat') return null;

    return (
        <div
            className="fixed z-[9999] select-none pointer-events-none"
            style={{
                right: pos.x,
                bottom: pos.y,
                transition: isDragging ? 'none' : 'all 0.3s ease'
            }}
        >
            <div
                className="relative group pointer-events-auto cursor-pointer"
                onMouseDown={onMouseDown}
                onClick={handleClick}
                onMouseEnter={() => setShowBubble(true)}
                onMouseLeave={() => setShowBubble(false)}
            >
                {/* Speech Bubble */}
                <div className={`absolute bottom-full right-1/2 translate-x-1/2 mb-4 w-40 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 text-[13px] text-[#58856c] font-medium transition-all duration-300 ${showBubble ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    Chào bạn! Bạn cần tâm sự gì không?
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/80"></div>
                </div>

                <div className={`p-2 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl transition-transform ${isDragging ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}>
                    <img src="/robot.png" alt="robot" className="w-20 h-20 md:w-28 md:h-28 object-contain mt-2" />
                </div>

            </div>

            {/* Reset Position Button (only visible if robot is moved far) */}
            {(Math.abs(pos.x - 20) > 100 || Math.abs(pos.y - 20) > 100) && (
                <button
                    onClick={() => setPos({ x: 20, y: 20 })}
                    className="fixed bottom-5 left-5 z-[9999] bg-white/60 backdrop-blur-md p-3 rounded-full border border-[#58856c]/30 text-[#58856c] shadow-lg hover:bg-[#58856c] hover:text-white transition-all pointer-events-auto flex items-center gap-2 group animate-in fade-in slide-in-from-left-4"
                    title="Gọi Robot quay lại"
                >
                    <img src="/robot.png" alt="robot" className="w-20 h-20 md:w-28 md:h-28 object-contain mt-2" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold">
                        Gọi Robot quay lại
                    </span>
                </button>
            )}
        </div>
    );
}
