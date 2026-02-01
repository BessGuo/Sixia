// Content block types for notes
export type ContentBlock =
  | { type: 'text'; content: string }
  | {
      type: 'image';
      src: string; // Base64 or local data (current)
      url?: string; // OSS URL (future integration)
      fileKey?: string; // OSS file key (future integration)
    };

export type NoteWithContent = {
  id: string;
  userId: string;
  content: ContentBlock[];
  createdAt: Date;
  updatedAt: Date;
};

// API request/response types
export type CreateNoteRequest = {
  content: ContentBlock[];
};

export type UpdateNoteRequest = {
  content: ContentBlock[];
};

export type NoteResponse = {
  id: string;
  userId: string;
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
};
