-- ============================================================================
-- गडकिल्ले संवर्धन प्रतिष्ठान — Incremental Migration Script
-- Run this in your Supabase SQL Editor on top of your existing database.
-- It safely:
--   1. Creates any missing dynamic CMS tables (IF NOT EXISTS)
--   2. Updates phone number to '90496 87970' only (clears phone2)
--   3. Resets default counters to 0 (no data unless added by Admin)
--   4. Deletes any pre-seeded sample rows if they existed
-- ============================================================================

-- 1. Ensure dynamic CMS tables exist (no-op if you already created them)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id                  INT PRIMARY KEY DEFAULT 1,
    name_marathi        VARCHAR(150) NOT NULL DEFAULT 'गड-किल्ले संवर्धन प्रतिष्ठान',
    name_english        VARCHAR(150) NOT NULL DEFAULT 'Gadkille Sanvardhan Pratishthan',
    state               VARCHAR(100) NOT NULL DEFAULT 'महाराष्ट्र राज्य',
    founded             VARCHAR(20)  NOT NULL DEFAULT '२०११',
    founder             VARCHAR(100) NOT NULL DEFAULT 'श्री. योगेश सोनवणे',
    president           VARCHAR(100) NOT NULL DEFAULT 'श्री. अभिषेक नावले',
    address             TEXT         NOT NULL DEFAULT 'गडकिल्ले-५१३, अथर्व कॉम्प्लेक्स, कृष्णा चौक, पिंपळे गुरव, पुणे – ४११०६१',
    phone1              VARCHAR(30)  NOT NULL DEFAULT '90496 87970',
    phone2              VARCHAR(30)  NOT NULL DEFAULT '',
    email               VARCHAR(150) NOT NULL DEFAULT 'gadkille.sanvardhan1630@gmail.com',
    facebook            VARCHAR(255) NOT NULL DEFAULT 'https://www.facebook.com/gadkillesanvardhanpratishthan',
    motto               TEXT         NOT NULL DEFAULT 'गड जपूया • इतिहास जपूया • वारसा पुढील पिढीकडे नेऊया',
    mission             TEXT         NOT NULL DEFAULT 'महाराष्ट्रातील गड-किल्ल्यांचे संवर्धन, संशोधन व जनजागृती',
    bank_name           VARCHAR(100) NOT NULL DEFAULT 'State Bank of India',
    bank_account        VARCHAR(100) NOT NULL DEFAULT 'XXXX XXXX XXXX',
    bank_ifsc           VARCHAR(50)  NOT NULL DEFAULT 'SBIN0XXXXXX',
    upi_id              VARCHAR(100) NOT NULL DEFAULT 'gadkille@sbi',
    stat_forts          INT          NOT NULL DEFAULT 0,
    stat_campaigns      INT          NOT NULL DEFAULT 0,
    stat_volunteers     INT          NOT NULL DEFAULT 0,
    stat_events         INT          NOT NULL DEFAULT 0,
    stat_trees          INT          NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forts (
    id                  VARCHAR(100) PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    name_en             VARCHAR(150) NOT NULL,
    district            VARCHAR(100) NOT NULL,
    taluka              VARCHAR(100) NOT NULL DEFAULT '',
    height              VARCHAR(100) NOT NULL DEFAULT '',
    fort_type           VARCHAR(50)  NOT NULL DEFAULT 'गिरिदुर्ग',
    era                 VARCHAR(100) NOT NULL DEFAULT '',
    difficulty          VARCHAR(50)  NOT NULL DEFAULT 'मध्यम',
    difficulty_en       VARCHAR(50)  NOT NULL DEFAULT 'moderate',
    status              VARCHAR(50)  NOT NULL DEFAULT 'progress',
    status_label        VARCHAR(100) NOT NULL DEFAULT 'संवर्धन सुरू',
    image               TEXT         NOT NULL DEFAULT '/images/raigad.jpg',
    description         TEXT         NOT NULL DEFAULT '',
    history             TEXT         NOT NULL DEFAULT '',
    trek_distance       VARCHAR(50)  NOT NULL DEFAULT '',
    trek_time           VARCHAR(50)  NOT NULL DEFAULT '',
    trek_season         VARCHAR(50)  NOT NULL DEFAULT 'वर्षभर',
    trek_water          VARCHAR(50)  NOT NULL DEFAULT 'उपलब्ध',
    trek_network        VARCHAR(50)  NOT NULL DEFAULT 'मध्यम',
    features            JSONB        NOT NULL DEFAULT '[]'::jsonb,
    latitude            DOUBLE PRECISION NOT NULL DEFAULT 18.5,
    longitude           DOUBLE PRECISION NOT NULL DEFAULT 73.8,
    is_featured         BOOLEAN      NOT NULL DEFAULT false,
    is_spotlight        BOOLEAN      NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id                  VARCHAR(100) PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    event_type          VARCHAR(100) NOT NULL,
    date_text           VARCHAR(100) NOT NULL,
    date_num            VARCHAR(20)  NOT NULL,
    month_text          VARCHAR(50)  NOT NULL,
    location            VARCHAR(150) NOT NULL,
    district            VARCHAR(100) NOT NULL,
    capacity            INT          NOT NULL DEFAULT 100,
    registered          INT          NOT NULL DEFAULT 0,
    image               TEXT         NOT NULL DEFAULT '/images/raigad.jpg',
    description         TEXT         NOT NULL,
    status              VARCHAR(50)  NOT NULL DEFAULT 'नोंदणी सुरू',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id                  VARCHAR(100) PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    fort                VARCHAR(150) NOT NULL,
    status              VARCHAR(50)  NOT NULL DEFAULT 'सुरू आहे',
    progress            INT          NOT NULL DEFAULT 0,
    volunteers          INT          NOT NULL DEFAULT 0,
    budget              VARCHAR(50)  NOT NULL DEFAULT '₹0',
    spent               VARCHAR(50)  NOT NULL DEFAULT '₹0',
    start_date          VARCHAR(50)  NOT NULL DEFAULT '',
    end_date            VARCHAR(50)  NOT NULL DEFAULT '',
    image               TEXT         NOT NULL DEFAULT '/images/raigad.jpg',
    description         TEXT         NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news (
    id                  VARCHAR(100) PRIMARY KEY,
    title               VARCHAR(250) NOT NULL,
    date_text           VARCHAR(100) NOT NULL,
    category            VARCHAR(100) NOT NULL,
    summary             TEXT         NOT NULL,
    image               TEXT         NOT NULL DEFAULT '/images/raigad.jpg',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery (
    id                  VARCHAR(100) PRIMARY KEY,
    src                 TEXT         NOT NULL,
    title               VARCHAR(200) NOT NULL,
    fort                VARCHAR(150) NOT NULL,
    category            VARCHAR(100) NOT NULL DEFAULT 'किल्ले',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. Alter existing site_settings column defaults
ALTER TABLE public.site_settings
    ALTER COLUMN phone1 SET DEFAULT '90496 87970',
    ALTER COLUMN phone2 SET DEFAULT '',
    ALTER COLUMN stat_forts SET DEFAULT 0,
    ALTER COLUMN stat_campaigns SET DEFAULT 0,
    ALTER COLUMN stat_volunteers SET DEFAULT 0,
    ALTER COLUMN stat_events SET DEFAULT 0,
    ALTER COLUMN stat_trees SET DEFAULT 0;

-- 3. Upsert / update the active settings row (id = 1) with phone '90496 87970' only & zero counters
INSERT INTO public.site_settings (
    id, phone1, phone2, stat_forts, stat_campaigns, stat_volunteers, stat_events, stat_trees, updated_at
)
VALUES (
    1, '90496 87970', '', 0, 0, 0, 0, 0, NOW()
)
ON CONFLICT (id) DO UPDATE SET
    phone1          = '90496 87970',
    phone2          = '',
    stat_forts      = CASE WHEN public.site_settings.stat_forts = 350 THEN 0 ELSE public.site_settings.stat_forts END,
    stat_campaigns  = CASE WHEN public.site_settings.stat_campaigns = 100 THEN 0 ELSE public.site_settings.stat_campaigns END,
    stat_volunteers = CASE WHEN public.site_settings.stat_volunteers = 5000 THEN 0 ELSE public.site_settings.stat_volunteers END,
    stat_events     = CASE WHEN public.site_settings.stat_events = 200 THEN 0 ELSE public.site_settings.stat_events END,
    stat_trees      = CASE WHEN public.site_settings.stat_trees = 10000 THEN 0 ELSE public.site_settings.stat_trees END,
    updated_at      = NOW();

-- 4. Remove any pre-seeded sample rows (so website has NO data unless added by Admin)
DELETE FROM public.forts WHERE id IN ('raigad', 'sinhagad', 'pratapgad', 'shivneri', 'torna', 'rajgad', 'panhala', 'sindhudurg');
DELETE FROM public.events WHERE id IN ('e1', 'e2', 'e3', 'e4', 'e5', 'e6');
DELETE FROM public.projects WHERE id IN ('p1', 'p2', 'p3', 'p4');
DELETE FROM public.news WHERE id IN ('n1', 'n2', 'n3');
DELETE FROM public.gallery WHERE id IN ('g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8');
DELETE FROM public.certificates WHERE cert_code IN ('GSP-CERT-2026-0194', 'GSP-CERT-2026-0001');
