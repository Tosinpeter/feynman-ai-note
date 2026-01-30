import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, DbNote, DbNoteInsert } from "@/lib/supabase";

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
  // Database sync fields
  dbId?: string; // UUID from database
  userId?: string;
  syncedAt?: number;
}

// Convert database note to local explanation format
const dbNoteToExplanation = (note: DbNote): Explanation => ({
  id: note.id, // Use DB UUID as ID
  dbId: note.id,
  userId: note.user_id,
  topic: note.topic,
  content: note.content,
  timestamp: new Date(note.created_at).getTime(),
  isSaved: note.is_saved,
  imageUri: note.image_uri || undefined,
  summary: note.summary || undefined,
  keyPoints: note.key_points || undefined,
  source: note.source || undefined,
  language: note.language || undefined,
  syncedAt: new Date(note.updated_at).getTime(),
});

// Convert local explanation to database insert format
const explanationToDbNote = (explanation: Explanation, userId: string): DbNoteInsert => ({
  id: explanation.dbId, // Keep existing ID if synced before
  user_id: userId,
  topic: explanation.topic,
  content: explanation.content,
  summary: explanation.summary || null,
  key_points: explanation.keyPoints || null,
  source: explanation.source || null,
  language: explanation.language || null,
  image_uri: explanation.imageUri || null,
  is_saved: explanation.isSaved,
});

export const [ExplanationsContext, useExplanations] = createContextHook(() => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const hasSyncedRef = useRef(false);

  // Load explanations from local storage (cache)
  const loadLocalExplanations = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem("explanations");
      if (data) {
        return JSON.parse(data) as Explanation[];
      }
      return [];
    } catch (error) {
      console.error("Failed to load local explanations:", error);
      return [];
    }
  }, []);

  // Save explanations to local storage
  const saveLocalExplanations = useCallback(async (data: Explanation[]) => {
    try {
      await AsyncStorage.setItem("explanations", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save local explanations:", error);
    }
  }, []);

  // Fetch notes from database
  const fetchNotesFromDb = useCallback(async (userId: string): Promise<Explanation[]> => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes from database:", error);
        return [];
      }

      return (data || []).map(dbNoteToExplanation);
    } catch (error) {
      console.error("Failed to fetch notes from database:", error);
      return [];
    }
  }, []);

  // Save a single note to database
  const saveNoteToDb = useCallback(async (explanation: Explanation, userId: string): Promise<Explanation | null> => {
    try {
      console.log("saveNoteToDb - Starting save for topic:", explanation.topic?.substring(0, 50));
      console.log("saveNoteToDb - User ID:", userId);
      console.log("saveNoteToDb - Has dbId:", !!explanation.dbId);

      const noteData = explanationToDbNote(explanation, userId);

      if (explanation.dbId) {
        // Update existing note
        console.log("saveNoteToDb - Updating existing note:", explanation.dbId);
        const { data, error } = await supabase
          .from("notes")
          .update({
            topic: noteData.topic,
            content: noteData.content,
            summary: noteData.summary,
            key_points: noteData.key_points,
            source: noteData.source,
            language: noteData.language,
            image_uri: noteData.image_uri,
            is_saved: noteData.is_saved,
          })
          .eq("id", explanation.dbId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Error updating note in database:", error.message, error.code, error.details);
          return null;
        }

        console.log("saveNoteToDb - Update successful:", data?.id);
        return data ? dbNoteToExplanation(data) : null;
      } else {
        // Insert new note
        console.log("saveNoteToDb - Inserting new note");
        const insertData = {
          user_id: userId,
          topic: noteData.topic,
          content: noteData.content,
          summary: noteData.summary,
          key_points: noteData.key_points,
          source: noteData.source,
          language: noteData.language,
          image_uri: noteData.image_uri,
          is_saved: noteData.is_saved,
        };
        console.log("saveNoteToDb - Insert data prepared:", {
          user_id: insertData.user_id,
          topic: insertData.topic?.substring(0, 50),
          content_length: insertData.content?.length,
          has_summary: !!insertData.summary,
          key_points_count: insertData.key_points?.length,
          source: insertData.source,
        });

        const { data, error } = await supabase
          .from("notes")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error("Error inserting note to database:", error.message, error.code, error.details, error.hint);
          return null;
        }

        console.log("saveNoteToDb - Insert successful, new ID:", data?.id);
        return data ? dbNoteToExplanation(data) : null;
      }
    } catch (error) {
      console.error("Failed to save note to database - unexpected error:", error);
      return null;
    }
  }, []);

  // Delete note from database
  const deleteNoteFromDb = useCallback(async (dbId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", dbId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting note from database:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to delete note from database:", error);
      return false;
    }
  }, []);

  // Sync local notes with database
  const syncWithDatabase = useCallback(async (userId: string) => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      console.log("Starting sync with database for user:", userId);

      // Fetch notes from database
      const dbNotes = await fetchNotesFromDb(userId);

      // Load local notes
      const localNotes = await loadLocalExplanations();

      // Create a map of DB notes by ID
      const dbNotesMap = new Map(dbNotes.map(n => [n.dbId || n.id, n]));

      // Find local notes that need to be uploaded (no dbId)
      const localOnlyNotes = localNotes.filter(n => !n.dbId && !n.userId);

      // Upload local-only notes to database
      const uploadedNotes: Explanation[] = [];
      for (const note of localOnlyNotes) {
        const uploaded = await saveNoteToDb(note, userId);
        if (uploaded) {
          uploadedNotes.push(uploaded);
        }
      }

      // Merge: DB notes take precedence, add any successfully uploaded local notes
      const mergedNotes = [
        ...dbNotes,
        ...uploadedNotes.filter(n => !dbNotesMap.has(n.dbId || n.id)),
      ];

      // Sort by timestamp (newest first)
      mergedNotes.sort((a, b) => b.timestamp - a.timestamp);

      setExplanations(mergedNotes);
      await saveLocalExplanations(mergedNotes);

      console.log("Sync complete. Total notes:", mergedNotes.length);
      hasSyncedRef.current = true;
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, fetchNotesFromDb, loadLocalExplanations, saveNoteToDb, saveLocalExplanations]);

  // Initialize and listen for auth changes
  useEffect(() => {
    const initializeExplanations = async () => {
      setIsLoading(true);

      // Load local data first for immediate display
      const localData = await loadLocalExplanations();
      setExplanations(localData);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        userIdRef.current = session.user.id;
        // Sync with database in background
        syncWithDatabase(session.user.id);
      }

      setIsLoading(false);
    };

    initializeExplanations();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          userIdRef.current = session.user.id;
          if (event === 'SIGNED_IN' && !hasSyncedRef.current) {
            syncWithDatabase(session.user.id);
          }
        } else {
          userIdRef.current = null;
          hasSyncedRef.current = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addExplanation = useCallback(async (topic: string, content: string, options?: {
    imageUri?: string;
    summary?: string;
    keyPoints?: string[];
    source?: string;
    language?: string;
  }): Promise<Explanation> => {
    const userId = userIdRef.current;

    console.log("addExplanation called - userId:", userId ? "authenticated" : "not authenticated");

    const newExplanation: Explanation = {
      id: Date.now().toString(),
      topic,
      content,
      timestamp: Date.now(),
      isSaved: false,
      userId: userId || undefined,
      ...options,
    };

    // Update local state immediately
    setExplanations(prev => {
      const updated = [newExplanation, ...prev];
      saveLocalExplanations(updated);
      return updated;
    });

    // If user is authenticated, save to database
    if (userId) {
      try {
        console.log("Saving note to database for user:", userId);
        const savedNote = await saveNoteToDb(newExplanation, userId);

        if (savedNote) {
          console.log("Note saved to database successfully with ID:", savedNote.dbId);
          // Update the note with database ID
          setExplanations(prev => {
            const updated = prev.map(exp =>
              exp.id === newExplanation.id ? { ...exp, ...savedNote } : exp
            );
            saveLocalExplanations(updated);
            return updated;
          });
          return { ...newExplanation, ...savedNote };
        } else {
          console.warn("Note was not saved to database - saveNoteToDb returned null");
        }
      } catch (error) {
        console.error("Failed to save note to database:", error);
      }
    } else {
      console.log("Note saved locally only - user not authenticated");
    }

    return newExplanation;
  }, [saveLocalExplanations, saveNoteToDb]);

  const toggleSave = useCallback((id: string) => {
    const userId = userIdRef.current;

    setExplanations(prev => {
      const updated = prev.map((exp) =>
        exp.id === id ? { ...exp, isSaved: !exp.isSaved } : exp
      );
      saveLocalExplanations(updated);

      // Update in database if authenticated
      if (userId) {
        const note = updated.find(e => e.id === id);
        if (note && note.dbId) {
          supabase
            .from("notes")
            .update({ is_saved: note.isSaved })
            .eq("id", note.dbId)
            .eq("user_id", userId)
            .then(({ error }) => {
              if (error) console.error("Error updating save status:", error);
            });
        }
      }

      return updated;
    });
  }, [saveLocalExplanations]);

  const deleteExplanation = useCallback((id: string) => {
    const userId = userIdRef.current;

    setExplanations(prev => {
      const noteToDelete = prev.find(exp => exp.id === id);
      const updated = prev.filter((exp) => exp.id !== id);
      saveLocalExplanations(updated);

      // Delete from database if authenticated and has dbId
      if (userId && noteToDelete?.dbId) {
        deleteNoteFromDb(noteToDelete.dbId, userId);
      }

      return updated;
    });
  }, [saveLocalExplanations, deleteNoteFromDb]);

  const getSavedExplanations = useCallback(() => {
    return explanations.filter((exp) => exp.isSaved);
  }, [explanations]);

  const getRecentExplanations = useCallback(() => {
    return explanations.slice(0, 5);
  }, [explanations]);

  const getExplanationById = useCallback((id: string) => {
    return explanations.find((exp) => exp.id === id);
  }, [explanations]);

  // Manual refresh function to force sync
  const refreshFromDatabase = useCallback(async () => {
    const userId = userIdRef.current;
    if (userId) {
      await syncWithDatabase(userId);
    }
  }, [syncWithDatabase]);

  return {
    explanations,
    isLoading,
    isSyncing,
    addExplanation,
    toggleSave,
    deleteExplanation,
    getSavedExplanations,
    getRecentExplanations,
    getExplanationById,
    refreshFromDatabase,
  };
});
