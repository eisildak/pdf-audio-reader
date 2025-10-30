import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlaybackState } from './types';
import { extractTextFromPdf } from './services/pdfService';
import { generateSimpleSpeech } from './services/simpleTts';
import { splitIntoParagraphs } from './utils/textUtils';
import { decode, decodeAudioData } from './utils/audioUtils';
import { testAudio } from './utils/testAudio';
import { testGeminiAPI } from './utils/testGemini';

// --- Helper Components (defined outside App to prevent re-creation on render) ---

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

interface FileUploadScreenProps {
    onFileSelect: (file: File) => void;
    isLoading: boolean;
}

const FileUploadScreen: React.FC<FileUploadScreenProps> = ({ onFileSelect, isLoading }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">PDF Sesli Okuyucu</h1>
            <p className="text-gray-300 mb-8">Yapay zekanın sizin için herhangi bir PDF makalesini okumasına izin verin.</p>
            <label htmlFor="pdf-upload" className="w-full max-w-lg cursor-pointer">
                <div className="relative border-2 border-dashed border-gray-600 rounded-xl p-8 sm:p-12 hover:border-blue-400 transition-colors duration-300 bg-gray-900/50">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <UploadIcon />
                        <p className="text-lg font-semibold text-gray-200">
                            {isLoading ? 'PDF işleniyor...' : 'Yüklemek için tıklayın veya sürükleyip bırakın'}
                        </p>
                        <p className="text-sm text-gray-400">PDF (10MB'a kadar)</p>
                    </div>
                    {isLoading && (
                         <div className="absolute inset-0 bg-gray-500 bg-opacity-20 flex items-center justify-center rounded-xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>
            </label>
            <input
                id="pdf-upload"
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
            />
        </div>
    );
};


interface ArticleViewProps {
    textChunks: string[];
    currentChunkIndex: number;
    onTextSelect: (text: string) => void;
    fileName: string;
    onReset: () => void;
}
const ArticleView: React.FC<ArticleViewProps> = ({ textChunks, currentChunkIndex, onTextSelect, fileName, onReset }) => {
    const handleMouseUp = () => {
        const selection = window.getSelection()?.toString().trim();
        if (selection) {
            onTextSelect(selection);
        }
    };

    return (
        <div className="flex-grow flex flex-col overflow-hidden">
             <header className="sticky top-0 bg-gray-900/80 backdrop-blur-sm shadow-sm z-10 p-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white truncate px-4">{fileName}</h2>
                <button onClick={onReset} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
                    Yeni PDF
                </button>
            </header>
            <main onMouseUp={handleMouseUp} className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-3xl mx-auto text-gray-200 text-lg leading-relaxed space-y-6">
                    {textChunks.map((chunk, index) => (
                        <p key={index} id={`chunk-${index}`} className={`transition-colors duration-300 p-2 rounded-md ${index === currentChunkIndex ? 'bg-blue-800/50' : ''}`}>
                            {chunk}
                        </p>
                    ))}
                </div>
            </main>
        </div>
    );
};

interface PlaybackControlsProps {
    state: PlaybackState;
    selectedText: string;
    isNextDisabled: boolean;
    playbackRate: number;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    onNext: () => void;
    onPlayFromSelection: () => void;
    onRateChange: (rate: number) => void;
}
const PlaybackControls: React.FC<PlaybackControlsProps> = ({ state, selectedText, isNextDisabled, playbackRate, onPlay, onPause, onStop, onNext, onPlayFromSelection, onRateChange }) => {
    const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>);
    const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 00-.75.75v12c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-12a.75.75 0 00-.75-.75H6.75zm8.25 0a.75.75 0 00-.75.75v12c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-12a.75.75 0 00-.75-.75h-2.25z" clipRule="evenodd" /></svg>);
    const StopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>);
    const NextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>);

    return (
        <footer className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-4">
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center space-y-4">
                 <div className="flex items-center justify-center space-x-2 w-full max-w-xs px-4">
                    <span className="text-sm font-medium text-gray-300">Hız</span>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={playbackRate}
                        onChange={(e) => onRateChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={state === PlaybackState.LOADING}
                        aria-label="Okuma Hızı"
                    />
                    <span className="text-sm font-semibold text-gray-200 w-10 text-center">
                        {playbackRate.toFixed(1)}x
                    </span>
                </div>

                <div className="flex items-center justify-around w-full max-w-xs sm:max-w-sm">
                    <button 
                        onClick={onStop} 
                        disabled={state === PlaybackState.STOPPED || state === PlaybackState.LOADING} 
                        className="text-gray-300 hover:text-white disabled:opacity-30 transition-all p-2"
                        aria-label="Durdur"
                    >
                        <StopIcon />
                    </button>
                    <button
                        onClick={state === PlaybackState.PLAYING ? onPause : onPlay}
                        disabled={state === PlaybackState.LOADING}
                        className="bg-blue-500 text-white rounded-full p-5 shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400 transition-all transform hover:scale-105"
                        aria-label={state === PlaybackState.PLAYING ? 'Duraklat' : 'Oynat'}
                    >
                        {state === PlaybackState.LOADING ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                        ) : state === PlaybackState.PLAYING ? (
                            <PauseIcon />
                        ) : (
                            <PlayIcon />
                        )}
                    </button>
                    <button 
                        onClick={onNext} 
                        disabled={isNextDisabled} 
                        className="text-gray-300 hover:text-white disabled:opacity-30 transition-all p-2"
                        aria-label="Sonraki Paragraf"
                    >
                        <NextIcon />
                    </button>
                </div>

                {selectedText && (
                    <div className="pt-2">
                        <button 
                            onClick={onPlayFromSelection} 
                            disabled={state === PlaybackState.LOADING} 
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full transition-colors text-sm disabled:opacity-50 whitespace-nowrap"
                            aria-label="Seçimden Başla"
                        >
                            Seçimden Başla
                        </button>
                    </div>
                )}
                
                {/* Test butonları - debug için */}
                <div className="pt-2 flex gap-2">
                    <button 
                        onClick={() => testAudio()} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded-full transition-colors text-xs"
                        aria-label="Test Audio"
                    >
                        🔊 Audio
                    </button>
                    <button 
                        onClick={() => testGeminiAPI()} 
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded-full transition-colors text-xs"
                        aria-label="Test API"
                    >
                        🤖 API
                    </button>
                </div>
            </div>
        </footer>
    );
};


// --- Main App Component ---

export default function App() {
    const [file, setFile] = useState<File | null>(null);
    const [textChunks, setTextChunks] = useState<string[]>([]);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.STOPPED);
    const [selectedText, setSelectedText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isAudioInitialized, setIsAudioInitialized] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const isPlayingSelectionRef = useRef<boolean>(false);

    const cleanupAudio = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.onended = null;
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
    }, []);

    const initAudioContext = useCallback(async () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        // iOS için özel kontrol
        if (!isAudioInitialized && audioContextRef.current.state === 'running') {
            setIsAudioInitialized(true);
        }
        
        return audioContextRef.current;
    }, []);

    const playAudio = useCallback(async (text: string) => {
        try {
            console.log('PlayAudio called with text length:', text.length);
            
            if (!text || text.trim().length === 0) {
                console.error('Empty text provided to playAudio');
                setPlaybackState(PlaybackState.STOPPED);
                return null;
            }

            const audioContext = await initAudioContext();
            console.log('Audio context initialized, state:', audioContext.state);

            setPlaybackState(PlaybackState.LOADING);
            console.log('Generating speech...');
            
            const base64Audio = await generateSimpleSpeech(text);
            console.log('Speech generated, base64Audio length:', base64Audio?.length || 0);

            if (base64Audio && audioContext) {
                try {
                    const audioBytes = decode(base64Audio);
                    const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
                    console.log('Audio decoded successfully, duration:', audioBuffer.duration);

                    cleanupAudio();

                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.playbackRate.value = playbackRate;
                    source.connect(audioContext.destination);
                    source.start();
                    setPlaybackState(PlaybackState.PLAYING);
                    sourceNodeRef.current = source;
                    console.log('Audio playbook started successfully');
                    return source;
                } catch (decodeError) {
                    console.error("Error decoding audio:", decodeError);
                    setPlaybackState(PlaybackState.STOPPED);
                    return null;
                }
            } else {
                console.error('No audio data received from generateSpeech');
                setPlaybackState(PlaybackState.STOPPED);
                return null;
            }
        } catch (error) {
            console.error("Error in playAudio:", error);
            setPlaybackState(PlaybackState.STOPPED);
            return null;
        }
    }, [playbackRate, cleanupAudio, initAudioContext]);

    const playNextChunk = useCallback(() => {
        if (isPlayingSelectionRef.current) return;

        const playFunction = () => {
             setCurrentChunkIndex(prevIndex => {
                const nextIndex = prevIndex + 1;
                if (nextIndex < textChunks.length) {
                    const textToPlay = textChunks[nextIndex];
                    playAudio(textToPlay).then(source => {
                        if (source) {
                            source.onended = playFunction;
                        }
                    });
                    return nextIndex;
                } else {
                    setPlaybackState(PlaybackState.STOPPED);
                    return 0; // Reset for next play
                }
            });
        };
        playFunction();
    }, [textChunks, playAudio]);

    const handlePlay = useCallback(async () => {
        try {
            console.log('Play button clicked, current state:', playbackState);
            
            // İlk kez oynatılıyorsa audio context'i başlat
            await initAudioContext();
            
            if (playbackState === PlaybackState.PAUSED && audioContextRef.current) {
                await audioContextRef.current.resume();
                setPlaybackState(PlaybackState.PLAYING);
                console.log('Resumed from pause');
                return;
            }

            if (textChunks.length > 0 && playbackState !== PlaybackState.PLAYING) {
                console.log('Starting playback from chunk:', currentChunkIndex);
                isPlayingSelectionRef.current = false;
                
                // If stopped, start from the current index (which is 0 or set by selection)
                const textToPlay = textChunks[currentChunkIndex];
                if (!textToPlay || textToPlay.trim().length === 0) {
                    console.error('No text to play at index:', currentChunkIndex);
                    return;
                }
                
                const source = await playAudio(textToPlay);
                if (source) {
                    source.onended = playNextChunk;
                    console.log('Audio source created and playing');
                } else {
                    console.error('Failed to create audio source');
                }
            }
        } catch (error) {
            console.error('Error in handlePlay:', error);
            setPlaybackState(PlaybackState.STOPPED);
        }
    }, [playbackState, textChunks, playAudio, playNextChunk, currentChunkIndex, initAudioContext]);

    const handlePause = useCallback(() => {
        if (audioContextRef.current && playbackState === PlaybackState.PLAYING) {
            audioContextRef.current.suspend();
            setPlaybackState(PlaybackState.PAUSED);
        }
    }, [playbackState]);

    const handleStop = useCallback(() => {
        cleanupAudio();
        isPlayingSelectionRef.current = false;
        setPlaybackState(PlaybackState.STOPPED);
        setCurrentChunkIndex(0); // Reset to the beginning
    }, [cleanupAudio]);

    const handleNext = useCallback(() => {
        const nextIndex = currentChunkIndex + 1;
        if (nextIndex < textChunks.length && playbackState !== PlaybackState.LOADING) {
            cleanupAudio();
            setCurrentChunkIndex(nextIndex);

            const textToPlay = textChunks[nextIndex];
            playAudio(textToPlay).then(source => {
                if (source) {
                    source.onended = playNextChunk;
                }
            });
        }
    }, [currentChunkIndex, textChunks, playbackState, playAudio, playNextChunk, cleanupAudio]);

    const handlePlayFromSelection = useCallback(async () => {
        if (selectedText) {
            const startIndex = textChunks.findIndex(chunk => chunk.includes(selectedText));
            setSelectedText(''); // Clear selection immediately

            if (startIndex !== -1) {
                cleanupAudio();
                isPlayingSelectionRef.current = false;

                setCurrentChunkIndex(startIndex);

                const textToPlay = textChunks[startIndex];
                const source = await playAudio(textToPlay);
                if (source) {
                    source.onended = playNextChunk;
                }
            } else {
                alert("Seçiminiz bir paragraf içinde bulunamadı. Lütfen tek bir paragraf içinden seçim yapın.");
            }
        }
    }, [selectedText, textChunks, cleanupAudio, playAudio, playNextChunk]);

    const handleFileSelect = async (selectedFile: File) => {
        setIsParsing(true);
        try {
            const text = await extractTextFromPdf(selectedFile);
            setTextChunks(splitIntoParagraphs(text));
            setFile(selectedFile);
        } catch (error) {
            console.error("Failed to process PDF", error);
            alert("Üzgünüz, bu PDF işlenirken bir hata oluştu.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleReset = () => {
        handleStop();
        setFile(null);
        setTextChunks([]);
        setSelectedText('');
        setCurrentChunkIndex(0);
    };

    useEffect(() => {
        if (playbackState === PlaybackState.PLAYING) {
            const chunkElement = document.getElementById(`chunk-${currentChunkIndex}`);
            if (chunkElement) {
                chunkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentChunkIndex, playbackState]);

    useEffect(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.playbackRate.value = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        return () => {
            cleanupAudio();
            audioContextRef.current?.close();
        };
    }, [cleanupAudio]);

    const isNextDisabled =
        playbackState === PlaybackState.LOADING ||
        playbackState === PlaybackState.STOPPED ||
        currentChunkIndex >= textChunks.length - 1 ||
        isPlayingSelectionRef.current;


    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-black text-gray-100">
            {!file ? (
                <FileUploadScreen onFileSelect={handleFileSelect} isLoading={isParsing} />
            ) : (
                <>
                    <ArticleView
                        textChunks={textChunks}
                        currentChunkIndex={playbackState !== PlaybackState.STOPPED ? currentChunkIndex : -1}
                        onTextSelect={setSelectedText}
                        fileName={file.name}
                        onReset={handleReset}
                    />
                    <PlaybackControls
                        state={playbackState}
                        selectedText={selectedText}
                        isNextDisabled={isNextDisabled}
                        playbackRate={playbackRate}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onStop={handleStop}
                        onNext={handleNext}
                        onPlayFromSelection={handlePlayFromSelection}
                        onRateChange={setPlaybackRate}
                    />
                </>
            )}
        </div>
    );
}
