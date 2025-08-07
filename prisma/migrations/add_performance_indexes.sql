-- Add indexes for performance optimization

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_session_id ON Session(id);
CREATE INDEX IF NOT EXISTS idx_session_created_at ON Session(createdAt);
CREATE INDEX IF NOT EXISTS idx_session_algorithm_version ON Session(algorithmVersion);

-- Index for choice queries
CREATE INDEX IF NOT EXISTS idx_choice_session_id ON Choice(sessionId);
CREATE INDEX IF NOT EXISTS idx_choice_number ON Choice(sessionId, choiceNumber);
CREATE INDEX IF NOT EXISTS idx_choice_created_at ON Choice(createdAt);

-- Composite index for getting choices with images
CREATE INDEX IF NOT EXISTS idx_choice_session_images ON Choice(sessionId, shownLeftId, shownRightId);

-- Index for test images by category
CREATE INDEX IF NOT EXISTS idx_test_image_category ON TestImage(testCategory);
CREATE INDEX IF NOT EXISTS idx_test_image_style ON TestImage(style);
CREATE INDEX IF NOT EXISTS idx_test_image_subject ON TestImage(subject);

-- Index for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profile_session ON UserProfile(sessionId);

-- Index for generated artworks
CREATE INDEX IF NOT EXISTS idx_artwork_session ON GeneratedArtwork(sessionId);
CREATE INDEX IF NOT EXISTS idx_artwork_order ON GeneratedArtwork(sessionId, orderIndex);
CREATE INDEX IF NOT EXISTS idx_artwork_type ON GeneratedArtwork(variationType);

-- Index for algorithm metrics
CREATE INDEX IF NOT EXISTS idx_metrics_session ON AlgorithmMetrics(sessionId);
CREATE INDEX IF NOT EXISTS idx_metrics_version ON AlgorithmMetrics(algorithmVersion);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON AlgorithmMetrics(createdAt);