# Database Development Patterns

Best practices, patterns, and examples for efficient database design and operations.

## Schema Design Patterns

### User Management Schema
```sql
-- Users table with proper indexing
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- User profiles for additional data
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    website_url TEXT,
    birth_date DATE,
    phone VARCHAR(20),
    preferences JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for JSONB preferences
CREATE INDEX idx_user_profiles_preferences ON user_profiles USING GIN (preferences);
```

### Audit Trail Pattern
```sql
-- Generic audit trail table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), current_setting('app.user_id', true)::INTEGER);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.user_id', true)::INTEGER);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), current_setting('app.user_id', true)::INTEGER);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to users table
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Query Optimization Patterns

### Efficient Pagination
```sql
-- Cursor-based pagination (recommended for large datasets)
-- Instead of OFFSET/LIMIT which becomes slow with large offsets
SELECT 
    id, email, name, created_at
FROM users 
WHERE 
    created_at < $1  -- cursor timestamp
    AND deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- For the first page, use current timestamp
-- For subsequent pages, use the created_at of the last item from previous page

-- Offset pagination with optimization for smaller pages
SELECT 
    id, email, name, created_at,
    COUNT(*) OVER() as total_count
FROM users 
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20 OFFSET $1;

-- Index to support pagination
CREATE INDEX idx_users_pagination ON users(created_at DESC, id DESC) 
WHERE deleted_at IS NULL;
```

### Complex Filtering with Performance
```sql
-- User search with multiple filters
WITH filtered_users AS (
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        up.first_name,
        up.last_name,
        up.location
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE 
        u.deleted_at IS NULL
        AND (
            $1::TEXT IS NULL 
            OR u.name ILIKE '%' || $1 || '%' 
            OR u.email ILIKE '%' || $1 || '%'
            OR up.first_name ILIKE '%' || $1 || '%'
            OR up.last_name ILIKE '%' || $1 || '%'
        )
        AND ($2::VARCHAR IS NULL OR u.role = $2)
        AND (
            $3::VARCHAR IS NULL 
            OR up.location ILIKE '%' || $3 || '%'
        )
        AND (
            $4::TIMESTAMP IS NULL 
            OR u.created_at >= $4
        )
)
SELECT 
    *,
    COUNT(*) OVER() as total_count
FROM filtered_users
ORDER BY created_at DESC
LIMIT $5 OFFSET $6;

-- Indexes to support this query
CREATE INDEX idx_users_search_name ON users USING gin(to_tsvector('english', name))
WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_search ON user_profiles 
USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(location, '')));
```

### Aggregation Patterns
```sql
-- User statistics with window functions
SELECT 
    DATE_TRUNC('month', created_at) as month,
    role,
    COUNT(*) as new_users,
    COUNT(*) OVER (PARTITION BY role ORDER BY DATE_TRUNC('month', created_at) 
                  ROWS UNBOUNDED PRECEDING) as cumulative_users,
    LAG(COUNT(*), 1) OVER (PARTITION BY role ORDER BY DATE_TRUNC('month', created_at)) as prev_month,
    ROUND(
        (COUNT(*) - LAG(COUNT(*), 1) OVER (PARTITION BY role ORDER BY DATE_TRUNC('month', created_at))) 
        * 100.0 / NULLIF(LAG(COUNT(*), 1) OVER (PARTITION BY role ORDER BY DATE_TRUNC('month', created_at)), 0), 2
    ) as growth_rate
FROM users 
WHERE 
    created_at >= '2023-01-01'
    AND deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at), role
ORDER BY month DESC, role;

-- Materialized view for expensive analytics
CREATE MATERIALIZED VIEW user_monthly_stats AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN email_verified THEN 1 END) as verified_count,
    AVG(EXTRACT(days FROM (CURRENT_TIMESTAMP - created_at))) as avg_days_active
FROM users 
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at), role;

-- Index for the materialized view
CREATE INDEX idx_user_monthly_stats_month_role ON user_monthly_stats(month, role);

-- Refresh schedule (in application or cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY user_monthly_stats;
```

## Transaction Patterns

### Safe User Registration Transaction
```sql
-- Function for atomic user registration
CREATE OR REPLACE FUNCTION register_user(
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_password_hash VARCHAR(255),
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE(
    user_id INTEGER,
    email VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Start transaction (implicit in function)
    
    -- Insert user
    INSERT INTO users (email, name, password_hash)
    VALUES (p_email, p_name, p_password_hash)
    RETURNING id INTO v_user_id;
    
    -- Insert user profile
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (v_user_id, p_first_name, p_last_name);
    
    -- Return user data
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.created_at
    FROM users u
    WHERE u.id = v_user_id;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'User with email % already exists', p_email;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
```

### Batch Operations with Error Handling
```sql
-- Function for batch user updates
CREATE OR REPLACE FUNCTION batch_update_users(
    p_updates JSONB
)
RETURNS TABLE(
    user_id INTEGER,
    status VARCHAR(20),
    message TEXT
) AS $$
DECLARE
    v_update JSONB;
    v_user_id INTEGER;
    v_update_data JSONB;
BEGIN
    -- Process each update
    FOR v_update IN SELECT value FROM jsonb_array_elements(p_updates)
    LOOP
        v_user_id := (v_update->>'id')::INTEGER;
        v_update_data := v_update->'data';
        
        BEGIN
            -- Perform the update
            UPDATE users 
            SET 
                name = COALESCE(v_update_data->>'name', name),
                email = COALESCE(v_update_data->>'email', email),
                role = COALESCE(v_update_data->>'role', role),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_user_id AND deleted_at IS NULL;
            
            IF FOUND THEN
                user_id := v_user_id;
                status := 'success';
                message := 'User updated successfully';
                RETURN NEXT;
            ELSE
                user_id := v_user_id;
                status := 'error';
                message := 'User not found';
                RETURN NEXT;
            END IF;
            
        EXCEPTION
            WHEN unique_violation THEN
                user_id := v_user_id;
                status := 'error';
                message := 'Email already exists';
                RETURN NEXT;
            WHEN OTHERS THEN
                user_id := v_user_id;
                status := 'error';
                message := 'Update failed: ' || SQLERRM;
                RETURN NEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Performance Monitoring

### Query Performance Analysis
```sql
-- Identify slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan > 0 THEN idx_tup_read::float / idx_scan 
        ELSE 0 
    END AS avg_tuples_per_scan
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Table statistics
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables 
ORDER BY seq_scan DESC;
```