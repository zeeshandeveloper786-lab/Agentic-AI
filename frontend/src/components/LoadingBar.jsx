import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingBar = () => {
    const location = useLocation();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Trigger on every location change
        setIsAnimating(true);

        // Duration of the "fake" loading phase
        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [location.pathname, location.search]); // Trigger on path or query change

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none">
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        key={location.key} // Unique key ensures a new animation starts every time
                        initial={{ width: "0%", opacity: 1 }}
                        animate={{
                            width: ["0%", "30%", "70%", "100%"],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            width: { duration: 1.2, ease: [0.16, 1, 0.3, 1], times: [0, 0.2, 0.6, 1] },
                            opacity: { duration: 0.3 }
                        }}
                        className="h-full bg-gradient-to-r from-accent-primary via-orange-400 to-accent-primary shadow-[0_0_15px_rgba(246,111,20,1)] relative"
                    >
                        {/* Glowing tip */}
                        <div className="absolute top-0 right-0 h-full w-20 bg-white/30 blur-sm" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoadingBar;
