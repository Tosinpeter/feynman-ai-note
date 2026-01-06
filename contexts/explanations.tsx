import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";

export interface Explanation {
  id: string;
  topic: string;
  content: string;
  timestamp: number;
  isSaved: boolean;
  imageUri?: string;
  summary?: string;
  keyPoints?: string[];
  source?: string;
  language?: string;
}

export const [ExplanationsContext, useExplanations] = createContextHook(() => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExplanations();
  }, []);

  const loadExplanations = async () => {
    try {
      const data = await AsyncStorage.getItem("explanations");
      if (data) {
        setExplanations(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load explanations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExplanations = async (data: Explanation[]) => {
    try {
      await AsyncStorage.setItem("explanations", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save explanations:", error);
    }
  };

  const addExplanation = (topic: string, content: string, options?: {
    imageUri?: string;
    summary?: string;
    keyPoints?: string[];
    source?: string;
    language?: string;
  }) => {
    const newExplanation: Explanation = {
      id: Date.now().toString(),
      topic,
      content,
      timestamp: Date.now(),
      isSaved: false,
      ...options,
    };
    const updated = [newExplanation, ...explanations];
    setExplanations(updated);
    saveExplanations(updated);
    return newExplanation;
  };

  const toggleSave = (id: string) => {
    const updated = explanations.map((exp) =>
      exp.id === id ? { ...exp, isSaved: !exp.isSaved } : exp
    );
    setExplanations(updated);
    saveExplanations(updated);
  };

  const deleteExplanation = (id: string) => {
    const updated = explanations.filter((exp) => exp.id !== id);
    setExplanations(updated);
    saveExplanations(updated);
  };

  const getSavedExplanations = () => {
    return explanations.filter((exp) => exp.isSaved);
  };

  const getRecentExplanations = () => {
    return explanations.slice(0, 5);
  };

  const getExplanationById = (id: string) => {
    return explanations.find((exp) => exp.id === id);
  };

  return {
    explanations,
    isLoading,
    addExplanation,
    toggleSave,
    deleteExplanation,
    getSavedExplanations,
    getRecentExplanations,
    getExplanationById,
  };
});
