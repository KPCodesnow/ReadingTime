"""
Configuration Template for Supabase Integration

To set up Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to Settings > API
4. Copy the Project URL and anon/public key
5. Replace the values below in a new file called 'config.py'
"""

# Supabase Configuration
SUPABASE_URL = "https://your-project-id.supabase.co"
SUPABASE_KEY = "your_supabase_anon_key_here"

# Flask Configuration
FLASK_SECRET_KEY = "your-secret-key-change-this-in-production"
FLASK_ENV = "development"

# Database Table Schema (we'll create this in Supabase)
"""
CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INTEGER NOT NULL,
    contact_date DATE,
    priority VARCHAR(10) NOT NULL,
    topics TEXT[],
    satisfaction INTEGER NOT NULL,
    message TEXT NOT NULL,
    filename VARCHAR(255),
    form_version VARCHAR(10),
    timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""" 