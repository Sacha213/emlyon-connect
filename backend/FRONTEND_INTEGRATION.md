# Intégration Frontend - Backend

Guide pour connecter le frontend React à l'API backend.

## 🔧 Configuration Frontend

### 1. Installation des dépendances

```bash
cd /chemin/vers/frontend
npm install axios
```

### 2. Créer le client API

Créez `src/services/apiClient.ts` :

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Services API

Créez `src/services/api/` avec les fichiers suivants :

#### `src/services/api/auth.ts`

```typescript
import apiClient from '../apiClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  avatarUrl?: string;
}

export const authAPI = {
  async login(data: LoginData) {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
};
```

#### `src/services/api/checkins.ts`

```typescript
import apiClient from '../apiClient';
import { CheckIn } from '../../types';

export interface CreateCheckInData {
  locationName: string;
  latitude: number;
  longitude: number;
  statusEmoji?: string;
}

export const checkInsAPI = {
  async getAll(): Promise<CheckIn[]> {
    const response = await apiClient.get('/checkins');
    return response.data.data;
  },

  async create(data: CreateCheckInData): Promise<CheckIn> {
    const response = await apiClient.post('/checkins', data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/checkins/${id}`);
  },

  async getUserCheckIn(userId: string): Promise<CheckIn | null> {
    const response = await apiClient.get(`/checkins/user/${userId}`);
    return response.data.data;
  },
};
```

#### `src/services/api/events.ts`

```typescript
import apiClient from '../apiClient';
import { Event } from '../../types';

export interface CreateEventData {
  title: string;
  description: string;
  date: number; // timestamp
}

export const eventsAPI = {
  async getAll(): Promise<Event[]> {
    const response = await apiClient.get('/events');
    return response.data.data;
  },

  async getById(id: string): Promise<Event> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.data;
  },

  async create(data: CreateEventData): Promise<Event> {
    const response = await apiClient.post('/events', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateEventData>): Promise<Event> {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async attend(id: string): Promise<void> {
    await apiClient.post(`/events/${id}/attend`);
  },

  async unattend(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}/attend`);
  },
};
```

#### `src/services/api/users.ts`

```typescript
import apiClient from '../apiClient';
import { User } from '../../types';

export const usersAPI = {
  async getMe(): Promise<User> {
    const response = await apiClient.get('/users/me');
    return response.data.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  async getAll(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data.data;
  },
};
```

### 4. WebSocket Client

Créez `src/services/websocket.ts` :

```typescript
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(token: string) {
    this.token = token;
  }

  connect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
    
    try {
      this.ws = new WebSocket(`${wsUrl}?token=${this.token}`);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect(onMessage, onError);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  private attemptReconnect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      
      setTimeout(() => {
        this.connect(onMessage, onError);
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
```

### 5. Hook React pour WebSocket

Créez `src/hooks/useWebSocket.ts` :

```typescript
import { useEffect, useRef } from 'react';
import { WebSocketClient } from '../services/websocket';

export const useWebSocket = (
  token: string | null,
  onMessage: (data: any) => void
) => {
  const wsClientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!token) return;

    const wsClient = new WebSocketClient(token);
    wsClientRef.current = wsClient;

    wsClient.connect(onMessage, (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      wsClient.disconnect();
    };
  }, [token, onMessage]);

  return wsClientRef.current;
};
```

### 6. Variables d'Environnement

Créez `.env` à la racine du frontend :

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

## 🔄 Utilisation dans les Composants

### Exemple : Login

```typescript
import { useState } from 'react';
import { authAPI } from '../services/api/auth';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      
      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Rediriger vers le dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  );
};
```

### Exemple : Dashboard avec WebSocket

```typescript
import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { checkInsAPI } from '../services/api/checkins';
import { eventsAPI } from '../services/api/events';
import { CheckIn, Event } from '../types';

export const Dashboard = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const token = localStorage.getItem('token');

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [checkInsData, eventsData] = await Promise.all([
          checkInsAPI.getAll(),
          eventsAPI.getAll(),
        ]);
        setCheckIns(checkInsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  // WebSocket pour les mises à jour en temps réel
  useWebSocket(token, (data) => {
    switch (data.type) {
      case 'initial':
        setCheckIns(data.checkIns);
        setEvents(data.events);
        break;
      case 'checkIns':
        setCheckIns(data.data);
        break;
      case 'events':
        setEvents(data.data);
        break;
    }
  });

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Afficher checkIns et events */}
    </div>
  );
};
```

### Exemple : Créer un Check-In

```typescript
import { useState } from 'react';
import { checkInsAPI } from '../services/api/checkins';

export const CreateCheckIn = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateCheckIn = async (
    locationName: string,
    latitude: number,
    longitude: number,
    statusEmoji?: string
  ) => {
    setLoading(true);
    try {
      await checkInsAPI.create({
        locationName,
        latitude,
        longitude,
        statusEmoji,
      });
      // Le WebSocket mettra à jour automatiquement la liste
    } catch (error) {
      console.error('Failed to create check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... reste du composant
};
```

## 🔐 Gestion de l'Authentification

### Context Provider

Créez `src/contexts/AuthContext.tsx` :

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { usersAPI } from '../services/api/users';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les infos du localStorage au chargement
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Optionnel : valider le token en récupérant l'utilisateur
      usersAPI.getMe().catch(() => {
        // Token invalide, déconnecter
        logout();
      });
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Utilisation

Dans `App.tsx` :

```typescript
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Votre application */}
    </AuthProvider>
  );
}
```

Dans un composant :

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div>
      <p>Bonjour {user?.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};
```

## 🧪 Tests

### Tester la connexion API

```typescript
// Test simple dans la console
import { authAPI } from './services/api/auth';

authAPI.login({
  email: 'alice@emlyon.com',
  password: 'password123'
}).then(console.log).catch(console.error);
```

### Vérifier le WebSocket

```typescript
// Dans la console du navigateur
const ws = new WebSocket('ws://localhost:3001/ws?token=VOTRE_TOKEN');
ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
```

## 🚀 Production

### Build Frontend

```bash
npm run build
```

### Variables d'Environnement Production

```env
VITE_API_URL=https://api.votre-domaine.com/api
VITE_WS_URL=wss://api.votre-domaine.com/ws
```

## 📝 Checklist d'Intégration

- [ ] Installer axios
- [ ] Créer apiClient avec intercepteurs
- [ ] Créer les services API (auth, checkins, events, users)
- [ ] Créer le WebSocket client
- [ ] Créer le hook useWebSocket
- [ ] Créer l'AuthContext
- [ ] Configurer les variables d'environnement (.env)
- [ ] Implémenter la connexion/inscription
- [ ] Implémenter le dashboard avec WebSocket
- [ ] Gérer les erreurs et le loading
- [ ] Tester toutes les fonctionnalités

## 🐛 Debugging

### Problèmes CORS

Si vous avez des erreurs CORS, vérifiez que :
- Le backend a `FRONTEND_URL` correctement configuré dans `.env`
- Vous utilisez le bon port (3001 pour backend, 5173 pour frontend)

### WebSocket ne se connecte pas

- Vérifier que le token est valide
- Vérifier que le serveur WebSocket écoute sur /ws
- Vérifier l'URL WebSocket (ws:// en dev, wss:// en prod)

### Token expiré

L'intercepteur axios redirige automatiquement vers /login si le token est invalide (401).
