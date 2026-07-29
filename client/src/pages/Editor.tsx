import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import AudioVisualizer from '@/components/AudioVisualizer';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Play, Pause, Download, X } from 'lucide-react';

interface MediaRecorderErrorEvent extends Event {
  error: string;
}

interface EditorState {
  audioFile: File | null;
  videoFile: File | null;
  imageFile: File | null;
  isRecording: boolean;
  recordedChunks: Blob[];
  audioUrl: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  isPlaying: boolean;
  recordingTime: number;
  error: string | null;
}

export default function Editor() {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<EditorState>({
    audioFile: null,
    videoFile: null,
    imageFile: null,
    isRecording: false,
    recordedChunks: [],
    audioUrl: null,
    videoUrl: null,
    imageUrl: null,
    isPlaying: false,
    recordingTime: 0,
    error: null,
  });

  // Manejo de carga de archivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = {
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      image: ['image/jpeg', 'image/png', 'image/webp'],
    };

    if (!validTypes[type].includes(file.type)) {
      setState(prev => ({
        ...prev,
        error: `Tipo de archivo no válido para ${type}. Tipos soportados: ${validTypes[type].join(', ')}`,
      }));
      return;
    }

    // Crear URL para preview
    const url = URL.createObjectURL(file);

    setState(prev => ({
      ...prev,
      [`${type}File`]: file,
      [`${type}Url`]: url,
      error: null,
    }));
  };

  // Inicializar Web Audio API
  const initializeAudio = async () => {
    if (!state.audioUrl || audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const audio = audioElementRef.current;
      if (audio) {
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al inicializar audio',
      }));
    }
  };

  // Dibujar visualización
  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Limpiar canvas con fondo oscuro
    ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar barras del visualizador
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      // Gradiente de colores neón
      const hue = (i / dataArray.length * 360 + Date.now() / 20) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      // Efecto de brillo
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 10;

      x += barWidth + 1;
    }

    if (state.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawVisualization);
    }
  };

  // Reproducir audio
  const handlePlay = async () => {
    if (!state.audioUrl) return;

    await initializeAudio();

    const audio = audioElementRef.current;
    if (audio) {
      if (state.isPlaying) {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        audio.play().catch(err => {
          console.error('Error playing audio:', err);
          setState(prev => ({
            ...prev,
            error: 'Error al reproducir audio',
          }));
        });
        setState(prev => ({ ...prev, isPlaying: true }));
        drawVisualization();
      }
    }
  };

  // Iniciar grabación
  const startRecording = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setState(prev => ({
          ...prev,
          error: 'Canvas no disponible',
        }));
        return;
      }

      // Obtener stream del canvas
      const stream = canvas.captureStream(30);
      streamRef.current = stream;

      // Intentar diferentes codecs
      const mimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4',
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        setState(prev => ({
          ...prev,
          error: 'No hay codec de video soportado en este navegador',
        }));
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setState(prev => ({
            ...prev,
            recordedChunks: [...prev.recordedChunks, event.data],
          }));
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as MediaRecorderErrorEvent;
        console.error('MediaRecorder error:', errorEvent.error);
        setState(prev => ({
          ...prev,
          error: `Error en grabación: ${errorEvent.error}`,
        }));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setState(prev => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        error: null,
      }));

      // Iniciar contador de tiempo
      recordingIntervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          recordingTime: prev.recordingTime + 1,
        }));
      }, 1000);

      // Reproducir audio si existe
      if (state.audioUrl && audioElementRef.current) {
        audioElementRef.current.currentTime = 0;
        audioElementRef.current.play().catch(err => {
          console.error('Error playing audio during recording:', err);
        });
        setState(prev => ({ ...prev, isPlaying: true }));
        drawVisualization();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: `Error al iniciar grabación: ${error}`,
      }));
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      setState(prev => ({
        ...prev,
        isRecording: false,
      }));

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Detener el stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Descargar video
  const downloadVideo = (format: 'webm' | 'mp4') => {
    if (state.recordedChunks.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'No hay video grabado para descargar',
      }));
      return;
    }

    const mimeType = format === 'webm' ? 'video/webm' : 'video/mp4';
    const blob = new Blob(state.recordedChunks, { type: mimeType });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elian-skye-effect-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setState(prev => ({
      ...prev,
      error: null,
    }));
  };

  // Limpiar recursos
  const clearMedia = (type: 'audio' | 'video' | 'image') => {
    setState(prev => ({
      ...prev,
      [`${type}File`]: null,
      [`${type}Url`]: null,
    }));
  };

  // Limpiar grabación
  const clearRecording = () => {
    setState(prev => ({
      ...prev,
      recordedChunks: [],
      recordingTime: 0,
    }));
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation('/')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-display font-bold"
          >
            ← VOLVER
          </button>
          <h1 className="text-2xl font-display font-bold neon-glow">VIDEO EDITOR</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 font-mono-custom text-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas Visualizer */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm p-6 border border-cyan-500/20">
              <h2 className="text-xl font-display font-bold mb-4 text-cyan-400">
                VISUALIZACIÓN
              </h2>

              {/* Canvas */}
              <div className="relative bg-gradient-to-b from-slate-900 to-black rounded-lg overflow-hidden mb-6">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={400}
                  className="w-full h-auto bg-black"
                />

                {/* Background Image if uploaded */}
                {state.imageUrl && (
                  <img
                    src={state.imageUrl}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover -z-10 opacity-30"
                  />
                )}

                {/* Particle Background */}
                <div className="absolute inset-0 -z-20">
                  <ParticleBackground particleCount={20} />
                </div>

                {/* No content message */}
                {!state.audioUrl && !state.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500 font-mono-custom">
                      Sube audio para ver la visualización
                    </p>
                  </div>
                )}
              </div>

              {/* Audio Element (hidden) */}
              <audio
                ref={audioElementRef}
                src={state.audioUrl || undefined}
                crossOrigin="anonymous"
              />

              {/* Controls */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePlay}
                  disabled={!state.audioUrl || state.isRecording}
                  className="flex-1 bg-purple-500 hover:bg-purple-400"
                >
                  {state.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      PAUSAR
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      REPRODUCIR
                    </>
                  )}
                </Button>

                {!state.isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={!state.audioUrl}
                    className="flex-1 bg-red-500 hover:bg-red-400"
                  >
                    ● GRABAR
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="flex-1 bg-red-600 hover:bg-red-500"
                  >
                    ⏹ DETENER ({formatTime(state.recordingTime)})
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Upload & Download */}
          <div className="space-y-6">
            {/* Audio Upload */}
            <Card className="bg-card/50 backdrop-blur-sm p-6 border border-cyan-500/20">
              <h3 className="text-lg font-display font-bold mb-4 text-cyan-400">
                AUDIO
              </h3>

              {state.audioUrl ? (
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <p className="text-sm font-mono-custom text-cyan-300 truncate">
                      {state.audioFile?.name}
                    </p>
                  </div>
                  <Button
                    onClick={() => clearMedia('audio')}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    LIMPIAR
                  </Button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-cyan-500/50 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                  <p className="text-sm font-mono-custom">MP3, WAV</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, 'audio')}
                    className="hidden"
                  />
                </label>
              )}
            </Card>

            {/* Image Upload */}
            <Card className="bg-card/50 backdrop-blur-sm p-6 border border-purple-500/20">
              <h3 className="text-lg font-display font-bold mb-4 text-purple-400">
                FONDO (Opcional)
              </h3>

              {state.imageUrl ? (
                <div className="space-y-3">
                  <img
                    src={state.imageUrl}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => clearMedia('image')}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    LIMPIAR
                  </Button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-purple-500/50 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-sm font-mono-custom">JPG, PNG</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />
                </label>
              )}
            </Card>

            {/* Download */}
            {state.recordedChunks.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm p-6 border border-green-500/20">
                <h3 className="text-lg font-display font-bold mb-4 text-green-400">
                  DESCARGAR
                </h3>

                <div className="space-y-3">
                  <Button
                    onClick={() => downloadVideo('webm')}
                    className="w-full bg-green-500 hover:bg-green-400"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    WebM
                  </Button>
                  <Button
                    onClick={() => downloadVideo('mp4')}
                    className="w-full bg-green-600 hover:bg-green-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    MP4
                  </Button>
                  <Button
                    onClick={clearRecording}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    LIMPIAR
                  </Button>
                </div>

                <p className="text-xs text-gray-500 font-mono-custom mt-3">
                  Tamaño: {(state.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0) / 1024 / 1024).toFixed(2)} MB
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
