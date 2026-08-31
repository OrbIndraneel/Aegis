-- ====================================================================
-- SURAKSHA AI — Complete Supabase PostgreSQL + PostGIS Schema Migration
-- Matches all TypeScript types & terms in Suraksha_AI_App
-- ====================================================================

-- 1. Enable PostGIS & UUID extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Relief Shelters Table (Matches `Shelter` interface in app)
CREATE TABLE IF NOT EXISTS shelters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOMETRY(Point, 4326),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    total_capacity INT NOT NULL DEFAULT 500,
    current_occupancy INT NOT NULL DEFAULT 0,
    available_beds INT GENERATED ALWAYS AS (total_capacity - current_occupancy) STORED,
    occupancy_percentage INT GENERATED ALWAYS AS (ROUND((current_occupancy::numeric / GREATEST(total_capacity, 1)) * 100)) STORED,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'FULL', 'CLOSED', 'COMPROMISED'
    capacity_level VARCHAR(50) DEFAULT 'Available', -- 'Available', 'Limited', 'Full'
    distance_km FLOAT DEFAULT 0.0,
    contact_number VARCHAR(100),
    ndrf_unit_id VARCHAR(100),
    -- Amenities breakdown (JSONB or individual columns)
    amenities JSONB DEFAULT '{
        "medicalKit": true,
        "foodSupplies": true,
        "cleanWater": true,
        "powerGenerator": true,
        "sanitation": true,
        "petFriendly": false
    }'::jsonb,
    medical_facilities_available BOOLEAN DEFAULT TRUE,
    food_supplies_days INT DEFAULT 7,
    power_generator BOOLEAN DEFAULT TRUE,
    helipad_access BOOLEAN DEFAULT FALSE,
    water_supply_liters INT DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shelters_location ON shelters USING GIST (location);

-- 3. Hazard Zones Table (Matches `Hazard` interface in app)
CREATE TABLE IF NOT EXISTS hazard_zones (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,            -- 'FLOOD', 'LANDSLIDE', 'CYCLONE', 'EARTHQUAKE', 'EXTREME_RAINFALL'
    severity VARCHAR(20) NOT NULL,       -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    probability FLOAT NOT NULL,          -- 0 - 100%
    risk_score FLOAT NOT NULL,           -- 0 - 100
    affected_population INT DEFAULT 0,
    center_latitude FLOAT NOT NULL,
    center_longitude FLOAT NOT NULL,
    center_location GEOMETRY(Point, 4326),
    radius_meters FLOAT DEFAULT 1500.0,
    description TEXT,
    predicted_surge_time_mins INT DEFAULT 45,
    road_closures_count INT DEFAULT 0,
    recommended_action TEXT,
    polygon_coordinates JSONB,           -- Array of [lat, lng] pairs
    landslide_susceptibility_score FLOAT DEFAULT 0.0,
    geometry GEOMETRY(Polygon, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hazard_geometry ON hazard_zones USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_hazard_center ON hazard_zones USING GIST (center_location);

-- 4. Emergency Alerts Table (Matches `EmergencyAlert` interface in app)
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,       -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    disaster_type VARCHAR(50) NOT NULL,  -- 'LANDSLIDE', 'FLOOD', etc.
    target_region VARCHAR(150) NOT NULL,
    issued_by VARCHAR(150) DEFAULT 'State Disaster Management Authority',
    action_required VARCHAR(100) NOT NULL, -- 'EVACUATE_IMMEDIATELY', 'SEEK_HIGH_GROUND', 'STAY_INDOORS', 'PREPARE_KIT', 'ADVISORY_ONLY'
    affected_population_estimate INT DEFAULT 0,
    acknowledgment_required BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Landslide Field Reports / Incidents Table (Matches `Incident` interface in app)
CREATE TABLE IF NOT EXISTS landslide_field_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    reporter_id VARCHAR(100) NOT NULL,
    reporter_role VARCHAR(50) DEFAULT 'CIVILIAN', -- 'CIVILIAN', 'AUTHORITY'
    civilian_phone VARCHAR(50),
    location_name VARCHAR(255),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    location GEOMETRY(Point, 4326),
    incident_type VARCHAR(100) NOT NULL, -- 'Slope Crack', 'Mudslide', 'Rockfall', 'Blocked Road'
    severity VARCHAR(20) DEFAULT 'HIGH', -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Monitoring', 'Warning', 'Critical', 'Evacuation', 'Resolved'
    affected_population INT DEFAULT 0,
    media_url TEXT,                      -- Geotagged photo/video URL
    description TEXT,
    predicted_escalation VARCHAR(100) DEFAULT 'High Probability within 60 mins',
    verified_by_user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_field_reports_location ON landslide_field_reports USING GIST (location);

-- 6. Evacuation Routes Table (Matches `EvacuationRoute` interface in app)
CREATE TABLE IF NOT EXISTS evacuation_routes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_latitude FLOAT NOT NULL,
    origin_longitude FLOAT NOT NULL,
    origin_location GEOMETRY(Point, 4326),
    destination_shelter_id VARCHAR(50) REFERENCES shelters(id),
    shelter_name VARCHAR(255),
    distance_km FLOAT NOT NULL,
    estimated_time_mins INT NOT NULL,
    safety_score FLOAT DEFAULT 95.0,    -- 0 - 100%
    risk_index VARCHAR(20) DEFAULT 'LOW', -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    hazard_exposure_count INT DEFAULT 0,
    road_closures_count INT DEFAULT 0,
    polyline_json JSONB,                -- Array of route coordinates
    alternative_polyline_json JSONB,
    turn_by_turn_instructions JSONB,    -- Array of route segment instructions
    avoided_hazards JSONB,
    road_closures_en_route JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Civilian Profiles Table (Matches `CivilianProfile` interface in app)
CREATE TABLE IF NOT EXISTS civilian_profiles (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'EN',  -- 'EN', 'HI', 'GU'
    selected_city VARCHAR(100) DEFAULT 'Vadodara',
    medical_conditions TEXT,
    blood_group VARCHAR(10),
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    offline_mode_enabled BOOLEAN DEFAULT FALSE,
    high_contrast_mode_enabled BOOLEAN DEFAULT FALSE,
    current_latitude FLOAT,
    current_longitude FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Emergency Response Priority Queue Table (SIH 26001 Requirement)
CREATE TABLE IF NOT EXISTS emergency_priority_queue (
    id SERIAL PRIMARY KEY,
    target_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,   -- 'Village', 'Road Segment', 'Critical Facility'
    location GEOMETRY(Geometry, 4326),
    landslide_risk_score FLOAT NOT NULL,
    population_exposed INT DEFAULT 0,
    connectivity_status VARCHAR(50) DEFAULT 'Accessible', -- 'Isolated', 'Partial', 'Accessible'
    priority_index FLOAT NOT NULL,      -- Emergency Priority Index (EPI)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_priority_queue_geom ON emergency_priority_queue USING GIST (location);

-- 9. OpenStreetMap Road Network Edges Table
CREATE TABLE IF NOT EXISTS road_network_edges (
    id SERIAL PRIMARY KEY,
    source_node INT NOT NULL,
    target_node INT NOT NULL,
    length_m FLOAT NOT NULL,
    geom GEOMETRY(LineString, 4326) NOT NULL,
    hazard_penalty FLOAT DEFAULT 1.0,
    is_blocked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_road_geom ON road_network_edges USING GIST (geom);
