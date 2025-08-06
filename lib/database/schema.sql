-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pre-generated test images
CREATE TABLE test_images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    style TEXT,
    subject TEXT,
    palette TEXT,
    complexity TEXT,
    test_category TEXT NOT NULL CHECK (test_category IN ('style', 'complexity', 'subject', 'color')),
    prompt_used TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    stated_room TEXT,
    stated_palette TEXT,
    stated_size TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User choices during discovery
CREATE TABLE choices (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    shown_left_id INTEGER REFERENCES test_images(id),
    shown_right_id INTEGER REFERENCES test_images(id),
    choice TEXT CHECK (choice IN ('left', 'right')),
    choice_number INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Generated artworks
CREATE TABLE generated_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User profiles (learned preferences)
CREATE TABLE user_profiles (
    session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    preferred_style TEXT,
    preferred_complexity FLOAT,
    preferred_subjects TEXT[],
    preferred_palette TEXT,
    explanation_text TEXT,
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_choices_session_id ON choices(session_id);
CREATE INDEX idx_generated_artworks_session_id ON generated_artworks(session_id);
CREATE INDEX idx_test_images_category ON test_images(test_category);
CREATE INDEX idx_test_images_style ON test_images(style);
CREATE INDEX idx_test_images_subject ON test_images(subject);