# Frontend Development Patterns

Best practices, patterns, and code examples for modern frontend development.

## React Component Patterns

### Functional Component with Hooks
```typescript
import React, { useState, useEffect } from 'react';
import { User } from '../types/User';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div aria-label="Loading user profile">Loading...</div>;
  if (error) return <div role="alert">Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <section className="user-profile" aria-labelledby="profile-heading">
      <h2 id="profile-heading">{user.name}'s Profile</h2>
      <div className="user-details">
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    </section>
  );
};

export default UserProfile;
```

### Custom Hook Pattern
```typescript
import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    fetchData();
  }, [url]);

  return state;
}

export default useFetch;
```

## CSS/Styling Best Practices

### CSS Modules Pattern
```css
/* UserProfile.module.css */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.heading {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.userDetails {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-weight: 600;
  color: var(--text-secondary);
}

.value {
  color: var(--text-primary);
  padding: 0.5rem;
  background: var(--input-background);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .container {
    margin: 0 1rem;
    padding: 0.75rem;
  }
  
  .userDetails {
    grid-template-columns: 1fr;
  }
}
```

### Responsive Design with CSS Grid
```css
.layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }

@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

## Performance Optimization

### Lazy Loading with Suspense
```typescript
import React, { Suspense, lazy } from 'react';

const LazyUserDashboard = lazy(() => import('./UserDashboard'));
const LazySettings = lazy(() => import('./Settings'));

const App: React.FC = () => {
  return (
    <div className="app">
      <Suspense fallback={<div className="loading">Loading dashboard...</div>}>
        <LazyUserDashboard />
      </Suspense>
      
      <Suspense fallback={<div className="loading">Loading settings...</div>}>
        <LazySettings />
      </Suspense>
    </div>
  );
};
```

### Memoization Pattern
```typescript
import React, { memo, useMemo, useCallback } from 'react';

interface UserListProps {
  users: User[];
  onUserClick: (user: User) => void;
  filter: string;
}

const UserList: React.FC<UserListProps> = memo(({ users, onUserClick, filter }) => {
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  const handleUserClick = useCallback((user: User) => {
    onUserClick(user);
  }, [onUserClick]);

  return (
    <ul className="user-list">
      {filteredUsers.map(user => (
        <UserListItem 
          key={user.id} 
          user={user} 
          onClick={handleUserClick}
        />
      ))}
    </ul>
  );
});

UserList.displayName = 'UserList';
export default UserList;
```

## Accessibility Patterns

### Accessible Form Components
```typescript
import React, { useState, useId } from 'react';

interface FormFieldProps {
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  required = false,
  error,
  helperText,
  value,
  onChange
}) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-describedby={`
          ${error ? errorId : ''} 
          ${helperText ? helperId : ''}
        `.trim()}
        aria-invalid={error ? 'true' : 'false'}
        className={`form-input ${error ? 'form-input--error' : ''}`}
      />
      
      {helperText && (
        <div id={helperId} className="form-helper">
          {helperText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
```