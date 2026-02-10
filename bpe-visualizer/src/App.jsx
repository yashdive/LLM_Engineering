import { useState } from 'react';
import { Hero } from './components/Hero';
import { TextInput } from './components/TextInput';
import { StatsBar } from './components/StatsBar';
import { TokenVisualization } from './components/TokenVisualization';
import { Network3D } from './components/Network3D';
import { useTokenizer } from './hooks/useTokenizer';

function App() {
  const [inputText, setInputText] = useState('');
  const { 
    currentStep, 
    isProcessing,
    isInitialized,
    tokenize, 
    getMergeHistory 
  } = useTokenizer();

  const handleTokenize = (text) => {
    setInputText(text);
    tokenize(text);
  };

  const showVisualization = currentStep && currentStep.stepNumber > 0;
  const show3D = currentStep && !isProcessing && currentStep.stepNumber > 5;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Input Section */}
      <TextInput 
        onTokenize={handleTokenize} 
        isProcessing={isProcessing}
        isInitialized={isInitialized}
      />

      {/* Stats Bar */}
      {showVisualization && (
        <StatsBar step={currentStep} text={inputText} />
      )}

      {/* Token Visualization */}
      {showVisualization && (
        <TokenVisualization step={currentStep} />
      )}

      {/* 3D Network */}
      {show3D && (
        <Network3D 
          tokens={currentStep.tokens} 
          mergeHistory={getMergeHistory()}
          inputText={inputText}
        />
      )}

      {/* Footer */}
      <footer className="py-12 text-center text-sm text-apple-gray-400">
        <p>Built with React, Framer Motion, Three.js, and GPT-4's tiktoken</p>
      </footer>
    </div>
  );
}

export default App;