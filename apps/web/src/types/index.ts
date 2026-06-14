export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Share {
  id: string;
  documentId: string;
  userId: string;
  role: "editor" | "viewer";
  user: User;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: User;
  shares: Share[];
  createdAt: string;
  updatedAt: string;
  role?: "owner" | "editor" | "viewer";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
