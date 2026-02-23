import React, { useState, useEffect, CSSProperties } from 'react';
import './EaseOutWrapper.css';

interface EaseOutWrapperProps {
    children: React.ReactNode;
    show: boolean;
    duration?: number;
    style?: CSSProperties;
}

const EaseOutWrapper: React.FC<EaseOutWrapperProps> = ({ children, show, duration = 400, style = {} }) => {
    const [isVisible, setIsVisible] = useState<boolean>(show);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration]);

    return (
        isVisible && (
            <div
                className={show ? "slide-in-top" : "slide-out-top"}
                style={{
                    animationDuration: `${duration}ms`,
                    ...style,
                }}
            >
                {children}
            </div>
        )
    );
};

export default EaseOutWrapper;