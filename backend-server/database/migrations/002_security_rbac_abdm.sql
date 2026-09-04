-- ====================================================================
-- SURAKSHA AI — Additive Security, RBAC & ABDM Database Migration (002)
-- Non-destructive: Strictly adds new tables, indexes, and constraints.
-- ====================================================================

-- 1. Authority Users Directory & Active Jurisdiction Table
CREATE TABLE IF NOT EXISTS authority_users (
    id VARCHAR(100) PRIMARY KEY,
    badge_number VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- 'ADMIN', 'DISTRICT_MANAGER', 'FIELD_OFFICER', 'ANALYST', 'SHELTER_MANAGER', 'VOLUNTEER'
    department VARCHAR(150) DEFAULT 'State Disaster Management Authority',
    jurisdiction_type VARCHAR(50) DEFAULT 'DISTRICT', -- 'STATE', 'DISTRICT', 'ZONE', 'SHELTER'
    jurisdiction_id VARCHAR(100) NOT NULL DEFAULT 'ALL',
    jurisdiction_name VARCHAR(150) NOT NULL DEFAULT 'All Regions',
    assigned_shelter_id VARCHAR(50) REFERENCES shelters(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_authority_users_role ON authority_users(role);
CREATE INDEX IF NOT EXISTS idx_authority_users_jurisdiction ON authority_users(jurisdiction_type, jurisdiction_id);

-- 2. Authority Geographic Scopes (PostGIS boundaries for spatial enforcement)
CREATE TABLE IF NOT EXISTS authority_scopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authority_id VARCHAR(100) REFERENCES authority_users(id) ON DELETE CASCADE,
    scope_level VARCHAR(50) NOT NULL, -- 'STATE', 'DISTRICT', 'ZONE', 'SHELTER'
    scope_identifier VARCHAR(100) NOT NULL,
    boundary_geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_authority_scopes_geom ON authority_scopes USING GIST (boundary_geom);

-- 3. Enterprise Authority Audit Logs Table
CREATE TABLE IF NOT EXISTS authority_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authority_id VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    request_id VARCHAR(100),
    geographic_scope VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'DENIED', 'FAILED'
    details JSONB DEFAULT '{}'::jsonb,
    reason TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_authority ON authority_audit_logs(authority_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_action ON authority_audit_logs(resource, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON authority_audit_logs(created_at DESC);

-- 4. Civilian Emergency Medical Consents Table
CREATE TABLE IF NOT EXISTS emergency_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    civilian_id VARCHAR(100) NOT NULL,
    apaar_id VARCHAR(100),
    abha_id VARCHAR(100),
    purpose VARCHAR(255) DEFAULT 'Emergency disaster response & life-saving medical triage',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    emergency_use_permitted BOOLEAN DEFAULT TRUE,
    permitted_fields JSONB DEFAULT '["blood_group", "critical_allergies", "critical_conditions", "current_medications", "emergency_contacts"]'::jsonb,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year'),
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consents_civilian ON emergency_consents(civilian_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON emergency_consents(status);

-- 5. Medical Access Audit Trail (Zero sensitive medical values stored)
CREATE TABLE IF NOT EXISTS medical_access_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    civilian_id VARCHAR(100) NOT NULL,
    requesting_authority_id VARCHAR(100) NOT NULL,
    requesting_role VARCHAR(50) NOT NULL,
    access_reason VARCHAR(255) NOT NULL,
    fields_requested JSONB,
    fields_returned JSONB,
    emergency_event_id VARCHAR(100),
    request_id VARCHAR(100),
    decision VARCHAR(50) NOT NULL, -- 'GRANTED', 'DENIED'
    denial_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medical_audit_civilian ON medical_access_audit(civilian_id);
CREATE INDEX IF NOT EXISTS idx_medical_audit_authority ON medical_access_audit(requesting_authority_id);
CREATE INDEX IF NOT EXISTS idx_medical_audit_created_at ON medical_access_audit(created_at DESC);

-- 6. Health & National Identity Links (APAAR / ABHA)
CREATE TABLE IF NOT EXISTS health_identity_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    civilian_id VARCHAR(100) UNIQUE NOT NULL,
    apaar_reference VARCHAR(100),
    abha_address VARCHAR(150),
    verification_status VARCHAR(50) DEFAULT 'VERIFIED', -- 'VERIFIED', 'PENDING', 'UNLINKED'
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_health_identity_civilian ON health_identity_links(civilian_id);

-- 7. Evacuation Route Override Requests (Non-destructive wrapper around core solver)
CREATE TABLE IF NOT EXISTS evacuation_override_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_route_id VARCHAR(100) NOT NULL,
    requested_changes JSONB NOT NULL,
    override_polyline JSONB,
    authority_id VARCHAR(100) NOT NULL,
    authority_role VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evacuation_overrides_status ON evacuation_override_requests(status);
