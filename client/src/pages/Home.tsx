import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AudioVisualizer from '@/components/AudioVisualizer';
import GlitchText from '@/components/GlitchText';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Play, Download } from 'lucide-react';

/**
 * Home Page - Elian Skye Visual Effect Creator
 * 
 * Design Philosophy: Minimalismo Futurista Oscuro
 * - Fondo cinematográfico con gradientes oscuros
 * - Tipografía angular y moderna con efectos de glitch
 * - Animaciones dinámicas que responden a la interacción
 * - Visualizador de audio reactivo
 * - Partículas flotantes interactivas
 * - Herramienta de creación de videos
 */
export default function Home() {
  const [, setLocation] = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<'showcase' | 'creator'>('showcase');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section with Parallax Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
        </div>

        {/* Particle Background */}
        <div className="absolute inset-0">
          <ParticleBackground particleCount={40} />
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          {/* Main Title with Glitch Effect */}
          <div className="mb-8">
            <GlitchText
              className="text-6xl md:text-8xl font-display font-bold neon-glow mb-4"
              triggerOnHover={true}
            >
              ELIAN SKYE
            </GlitchText>
            <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mx-auto mb-8" />
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-mono-custom text-cyan-300 mb-12 tracking-widest">
            VIDEO CREATOR TOOL
          </p>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-300 mb-16 leading-relaxed max-w-2xl mx-auto">
            Crea videos con los efectos visuales cinematográficos de Elian Skye.
            Sube audio, video o imagen y obtén una visualización inmersiva con animaciones dinámicas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="px-8 py-3 bg-cyan-500 text-background font-display font-bold rounded-lg
                         hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105
                         shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/75"
              onClick={() => setLocation('/editor')}
            >
              <Upload className="w-5 h-5 mr-2" />
              CREAR VIDEO
            </Button>
            <Button
              className="px-8 py-3 bg-purple-500 text-background font-display font-bold rounded-lg
                         hover:bg-purple-400 transition-all duration-300 transform hover:scale-105
                         shadow-lg shadow-purple-500/50 hover:shadow-purple-400/75"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <Play className="w-5 h-5 mr-2" />
              VER DEMO
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-cyan-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Audio Visualizer Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-background to-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 neon-glow text-center">
            AUDIO VISUALIZER
          </h2>
          <p className="text-center text-gray-400 mb-12 font-mono-custom">
            Visualización reactiva que simula datos de audio en tiempo real
          </p>

          <Card className="bg-card/50 backdrop-blur-sm p-8 border border-cyan-500/20 shadow-2xl">
            <AudioVisualizer isActive={true} barCount={32} />
          </Card>

          <p className="text-center text-gray-500 text-sm mt-6 font-mono-custom">
            Las barras reaccionan a patrones de audio simulados
          </p>
        </div>
      </section>

      {/* Effects Showcase Section */}
      <section className="relative py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 neon-glow text-center">
            EFECTOS VISUALES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Glitch Effect Card */}
            <Card className="bg-card/50 backdrop-blur-sm p-8 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group">
              <h3 className="text-2xl font-display font-bold mb-4 text-cyan-400 group-hover:neon-glow transition-all">
                GLITCH EFFECT
              </h3>
              <p className="text-gray-400 mb-6">
                Distorsiones digitales que se activan con interacción. Perfecto para momentos de transición
                y cambios de ritmo en la música.
              </p>
              <GlitchText
                className="text-lg font-mono-custom text-cyan-300 cursor-pointer"
                triggerOnHover={true}
              >
                HOVER PARA VER EFECTO
              </GlitchText>
            </Card>

            {/* Parallax Effect Card */}
            <Card className="bg-card/50 backdrop-blur-sm p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group">
              <h3 className="text-2xl font-display font-bold mb-4 text-purple-400 group-hover:neon-glow transition-all">
                PARALLAX EFFECT
              </h3>
              <p className="text-gray-400 mb-6">
                Movimiento de fondo que crea profundidad visual. El fondo se mueve más lentamente que el contenido,
                generando una sensación cinematográfica.
              </p>
              <div className="text-lg font-mono-custom text-purple-300">
                SCROLL PARA VER EFECTO
              </div>
            </Card>

            {/* Particle Effect Card */}
            <Card className="bg-card/50 backdrop-blur-sm p-8 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 group">
              <h3 className="text-2xl font-display font-bold mb-4 text-pink-400 group-hover:neon-glow transition-all">
                PARTICLE SYSTEM
              </h3>
              <p className="text-gray-400 mb-6">
                Partículas flotantes que interactúan con el movimiento del mouse. Crean una atmósfera dinámica
                y envolvente.
              </p>
              <div className="text-lg font-mono-custom text-pink-300">
                MUEVE EL MOUSE PARA VER EFECTO
              </div>
            </Card>

            {/* Neon Glow Card */}
            <Card className="bg-card/50 backdrop-blur-sm p-8 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 group">
              <h3 className="text-2xl font-display font-bold mb-4 text-orange-400 group-hover:neon-glow transition-all">
                NEON GLOW
              </h3>
              <p className="text-gray-400 mb-6">
                Efecto de brillo neón que destaca elementos importantes. Utiliza sombras de texto para crear
                profundidad visual.
              </p>
              <div className="text-lg font-mono-custom text-orange-300 neon-glow">
                EFECTO NEON ACTIVO
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-background to-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-12 neon-glow text-center">
            CREAR TU VIDEO
          </h2>

          <Card className="bg-card/50 backdrop-blur-sm p-8 border border-cyan-500/20">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-display font-bold text-cyan-400 mb-4">
                  Sube tu contenido
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-cyan-500/50 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <p className="font-mono-custom text-sm">Audio (MP3, WAV)</p>
                  </div>
                  <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="font-mono-custom text-sm">Video (MP4)</p>
                  </div>
                  <div className="border-2 border-dashed border-pink-500/50 rounded-lg p-8 text-center hover:border-pink-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                    <p className="font-mono-custom text-sm">Imagen (JPG, PNG)</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-cyan-500/20">
                <p className="text-gray-400 text-sm font-mono-custom mb-4">
                  Funcionalidad en desarrollo. Próximamente podrás:
                </p>
                <ul className="space-y-2 text-gray-400 font-mono-custom text-sm">
                  <li>✦ Subir archivos de audio, video e imagen</li>
                  <li>✦ Ver visualización en tiempo real</li>
                  <li>✦ Grabar la visualización como video</li>
                  <li>✦ Descargar el video generado</li>
                </ul>
              </div>

              <Button
                className="w-full px-8 py-3 bg-cyan-500 text-background font-display font-bold rounded-lg
                           hover:bg-cyan-400 transition-all duration-300"
                disabled
              >
                <Download className="w-5 h-5 mr-2" />
                PRÓXIMAMENTE
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 bg-slate-950/50 border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 font-mono-custom text-sm mb-4">
            Inspirado en los videos de Elian Skye
          </p>
          <p className="text-gray-600 font-mono-custom text-xs">
            © 2026 Elian Skye Visual Effect Creator
          </p>
        </div>
      </footer>
    </div>
  );
}
