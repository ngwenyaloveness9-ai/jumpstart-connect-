/* eslint-disable no-unused-vars */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import logo from "../../assets/images/jumpstart-logo.webp";
export function LandingPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const canvasRef = useRef(null);
    const bubblesRef = useRef([]);
    const animationIdRef = useRef();
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        // Initialize bubbles
        const initBubbles = () => {
            bubblesRef.current = [];
            for (let i = 0; i < 30; i++) {
                bubblesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height + Math.random() * 200,
                    size: Math.random() * 40 + 10,
                    speedY: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.3 + 0.1,
                });
            }
        };
        initBubbles();
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            bubblesRef.current.forEach((bubble, index) => {
                // Update position
                bubble.y -= bubble.speedY;
                bubble.x += bubble.speedX;
                // Fade out as it rises
                const fadeStart = canvas.height * 0.3;
                if (bubble.y < fadeStart) {
                    bubble.opacity = Math.max(0, (bubble.y / fadeStart) * 0.3);
                }
                // Reset bubble when it goes off screen
                if (bubble.y + bubble.size < 0 || bubble.opacity <= 0) {
                    bubble.y = canvas.height + Math.random() * 100;
                    bubble.x = Math.random() * canvas.width;
                    bubble.size = Math.random() * 40 + 10;
                    bubble.opacity = Math.random() * 0.3 + 0.1;
                }
                // Draw bubble
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245, 197, 24, ${bubble.opacity})`;
                ctx.fill();
                // Add highlight
                const gradient = ctx.createRadialGradient(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, 0, bubble.x, bubble.y, bubble.size);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.8})`);
                gradient.addColorStop(0.4, `rgba(245, 197, 24, ${bubble.opacity * 0.3})`);
                gradient.addColorStop(1, `rgba(245, 197, 24, 0)`);
                ctx.fillStyle = gradient;
                ctx.fill();
            });
            animationIdRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, []);
  // Auto-navigate to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);
    return (<div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Canvas for bubble animation */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}/>

      {/* Theme Toggle Button */}
      <button onClick={toggleTheme} className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Toggle theme">
        {theme === "dark" ? (<Sun size={20} className="text-primary-foreground"/>) : (<Moon size={20} className="text-primary-foreground"/>)}
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
<div className="mb-12 relative flex justify-center items-center">
  {/* Glow effect */}
  <div className="absolute w-64 h-64 bg-primary rounded-full blur-3xl opacity-30 animate-pulse"></div>

  <img
    src={logo}
    alt="JumpStart Logo"
    className="relative w-56 h-56 md:w-64 md:h-64 object-contain drop-shadow-[0_0_40px_rgba(245,197,24,0.6)]"
  />
</div>

        {/* System Name */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground">
            Jumpstart Connect
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Leaving No One Behind.
          </p>
        </div>

        {/* CTA Buttons removed; page auto-redirects to /login after 5s */}

        {/* Tagline */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground">
            Empowering careers, one connection at a time
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20"/>
    </div>);
}
