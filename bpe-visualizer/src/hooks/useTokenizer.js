import { useState, useCallback, useEffect } from 'react';
import { BPETokenizer } from '../utils/tokenizer';

export const useTokenizer = () => {
  const [steps, setSteps] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tokenizer] = useState(() => new BPETokenizer());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tokenizer on mount
  useEffect(() => {
    const init = async () => {
      try {
        await tokenizer.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize tokenizer:', error);
      }
    };
    init();

    // Cleanup on unmount
    return () => {
      tokenizer.free();
    };
  }, [tokenizer]);

  const tokenize = useCallback(async (text) => {
    if (!isInitialized) {
      console.error('Tokenizer not initialized yet');
      return;
    }

    setSteps([]);
    setCurrentStepIndex(0);
    setIsProcessing(true);

    const allSteps = [];
    
    try {
      for await (const step of tokenizer.generateMergeSteps(text)) {
        allSteps.push(step);
        setSteps([...allSteps]);
        setCurrentStepIndex(allSteps.length - 1);
        
        // Delay for animation
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    } catch (error) {
      console.error('Error during tokenization:', error);
    }

    setIsProcessing(false);
  }, [tokenizer, isInitialized]);

  const reset = useCallback(() => {
    setSteps([]);
    setCurrentStepIndex(0);
    setIsProcessing(false);
  }, []);

  const getMergeHistory = useCallback(() => {
    return tokenizer.getMergeHistory();
  }, [tokenizer]);

  return {
    steps,
    currentStepIndex,
    isProcessing,
    isInitialized,
    tokenize,
    reset,
    getMergeHistory,
    currentStep: steps[currentStepIndex] || null
  };
};