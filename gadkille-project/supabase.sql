-- ============================================================================
-- गडकिल्ले संवर्धन प्रतिष्ठान (Gadkille Sanvardhan Pratishthan)
-- Complete Dynamic Supabase / PostgreSQL Database Schema (v3.0)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 0. Site Settings Table (Dynamic Org Info, Contact, Bank & Counters)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 1. Forts Table (गडकिल्ले)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forts (
    id                  VARCHAR(80) PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    name_en             VARCHAR(150) NOT NULL,
    district            VARCHAR(100) NOT NULL,
    taluka              VARCHAR(100) NOT NULL DEFAULT '',
    height              VARCHAR(80)  NOT NULL DEFAULT '',
    fort_type           VARCHAR(80)  NOT NULL DEFAULT 'गिरिदुर्ग',
    era                 VARCHAR(100) NOT NULL DEFAULT '',
    difficulty          VARCHAR(50)  NOT NULL DEFAULT 'मध्यम',
    difficulty_en       VARCHAR(30)  NOT NULL DEFAULT 'moderate',
    status              VARCHAR(30)  NOT NULL DEFAULT 'progress',
    status_label        VARCHAR(80)  NOT NULL DEFAULT 'संवर्धन सुरू',
    image               VARCHAR(500) NOT NULL DEFAULT '/images/raigad.jpg',
    description         TEXT         NOT NULL DEFAULT '',
    history             TEXT         NOT NULL DEFAULT '',
    trek_distance       VARCHAR(100) NOT NULL DEFAULT '',
    trek_time           VARCHAR(100) NOT NULL DEFAULT '',
    trek_season         VARCHAR(100) NOT NULL DEFAULT 'वर्षभर',
    trek_water          VARCHAR(100) NOT NULL DEFAULT 'उपलब्ध',
    trek_network        VARCHAR(100) NOT NULL DEFAULT 'मध्यम',
    features            TEXT[]       NOT NULL DEFAULT '{}',
    latitude            DOUBLE PRECISION NOT NULL DEFAULT 18.5,
    longitude           DOUBLE PRECISION NOT NULL DEFAULT 73.8,
    is_featured         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_spotlight        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Events Table (मोहिमा व कार्यक्रम)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200) NOT NULL,
    event_type          VARCHAR(80)  NOT NULL DEFAULT 'स्वच्छता',
    date_text           VARCHAR(100) NOT NULL,
    date_num            VARCHAR(10)  NOT NULL DEFAULT '01',
    month_text          VARCHAR(20)  NOT NULL DEFAULT 'JAN',
    location            VARCHAR(150) NOT NULL,
    district            VARCHAR(100) NOT NULL DEFAULT 'पुणे',
    capacity            INT          NOT NULL DEFAULT 100,
    registered          INT          NOT NULL DEFAULT 0,
    image               VARCHAR(500) NOT NULL DEFAULT '/images/raigad.jpg',
    description         TEXT         NOT NULL DEFAULT '',
    status              VARCHAR(80)  NOT NULL DEFAULT 'नोंदणी सुरू',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. Conservation Projects Table (संवर्धन प्रकल्प)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(200) NOT NULL,
    fort                VARCHAR(150) NOT NULL,
    status              VARCHAR(50)  NOT NULL DEFAULT 'सुरू आहे',
    progress            INT          NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    volunteers          INT          NOT NULL DEFAULT 0,
    budget              VARCHAR(80)  NOT NULL DEFAULT '₹1,00,000',
    spent               VARCHAR(80)  NOT NULL DEFAULT '₹0',
    start_date          VARCHAR(80)  NOT NULL DEFAULT '',
    end_date            VARCHAR(80)  NOT NULL DEFAULT '',
    impact              VARCHAR(255) NOT NULL DEFAULT '',
    description         TEXT         NOT NULL DEFAULT '',
    before_img          VARCHAR(500) NOT NULL DEFAULT '/images/conservation.jpg',
    after_img           VARCHAR(500) NOT NULL DEFAULT '/images/raigad.jpg',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. News Articles Table (बातम्या व लेख)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category            VARCHAR(80)  NOT NULL DEFAULT 'संवर्धन',
    title               VARCHAR(250) NOT NULL,
    date_text           VARCHAR(80)  NOT NULL,
    author              VARCHAR(120) NOT NULL DEFAULT 'संपादकीय',
    image               VARCHAR(500) NOT NULL DEFAULT '/images/raigad.jpg',
    summary             TEXT         NOT NULL DEFAULT '',
    body                TEXT         NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Gallery Table (फोटो गॅलरी)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    src                 VARCHAR(500) NOT NULL,
    caption             VARCHAR(250) NOT NULL,
    category            VARCHAR(80)  NOT NULL DEFAULT 'गडकिल्ले',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. Volunteers Table (स्वयंसेवक नोंदणी)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.volunteers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    age                 INT CHECK (age IS NULL OR (age >= 15 AND age <= 75)),
    phone               VARCHAR(30)  NOT NULL,
    email               VARCHAR(255) NOT NULL,
    district            VARCHAR(80),
    occupation          VARCHAR(150),
    interests           TEXT[]       DEFAULT '{}',
    availability        VARCHAR(80),
    trekking_experience VARCHAR(80),
    about               TEXT,
    xp_points           INT          NOT NULL DEFAULT 100,
    level               INT          NOT NULL DEFAULT 1,
    status              VARCHAR(30)  NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. Contacts Table (संपर्क संदेश)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    phone               VARCHAR(30),
    email               VARCHAR(255) NOT NULL,
    subject             VARCHAR(150) DEFAULT 'सामान्य चौकशी',
    message             TEXT         NOT NULL,
    status              VARCHAR(30)  NOT NULL DEFAULT 'unread',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. Donations Table (देणगी व्यवहार)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name          VARCHAR(150) NOT NULL DEFAULT 'अनाम (Anonymous)',
    email               VARCHAR(255),
    phone               VARCHAR(30),
    amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    project_name        VARCHAR(150) NOT NULL DEFAULT 'सामान्य संवर्धन निधी',
    payment_method      VARCHAR(50)  NOT NULL DEFAULT 'UPI',
    transaction_ref     VARCHAR(100),
    pan_number          VARCHAR(20),
    status              VARCHAR(30)  NOT NULL DEFAULT 'completed',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. Event Registrations Table (मोहीम व कार्यक्रम नोंदणी)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            VARCHAR(100) NOT NULL,
    event_title         VARCHAR(200) NOT NULL,
    full_name           VARCHAR(150) NOT NULL,
    phone               VARCHAR(30)  NOT NULL,
    email               VARCHAR(255) NOT NULL,
    participants_count  INT          NOT NULL DEFAULT 1 CHECK (participants_count >= 1 AND participants_count <= 20),
    emergency_contact   VARCHAR(50),
    status              VARCHAR(30)  NOT NULL DEFAULT 'confirmed',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. Digital Certificates Table (डिजिटल प्रमाणपत्र)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cert_code           VARCHAR(60)  UNIQUE NOT NULL,
    recipient_name      VARCHAR(150) NOT NULL,
    cert_type           VARCHAR(50)  NOT NULL DEFAULT 'volunteer',
    event_name          VARCHAR(200) NOT NULL,
    issued_date         DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. Dinvishesh Table (ऐतिहासिक दिनविशेष)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dinvishesh (
    id                      VARCHAR(100) PRIMARY KEY,
    event_date              DATE NOT NULL,
    day                     INT NOT NULL,
    month                   INT NOT NULL,
    year                    INT,
    figure                  VARCHAR(150) NOT NULL DEFAULT 'छत्रपती शिवाजी महाराज',
    personality             VARCHAR(150) NOT NULL DEFAULT 'छत्रपती शिवाजी महाराज',
    event_type              VARCHAR(100) DEFAULT 'ऐतिहासिक प्रसंग',
    title                   VARCHAR(255) NOT NULL,
    title_marathi           VARCHAR(255) DEFAULT '',
    title_en                VARCHAR(255) DEFAULT '',
    title_english           VARCHAR(255) DEFAULT '',
    description             TEXT NOT NULL,
    description_marathi     TEXT DEFAULT '',
    description_en          TEXT DEFAULT '',
    description_english     TEXT DEFAULT '',
    location                VARCHAR(200) DEFAULT '',
    image                   VARCHAR(500) DEFAULT '/images/raigad.jpg',
    image_url               VARCHAR(500) DEFAULT '/images/raigad.jpg',
    historical_significance TEXT DEFAULT '',
    source_name             VARCHAR(255) DEFAULT 'गडकिल्ले संवर्धन प्रतिष्ठान',
    source_url              VARCHAR(500) DEFAULT '',
    source_type             VARCHAR(100) DEFAULT 'Published historical book',
    source_description      TEXT DEFAULT '',
    verification_status     VARCHAR(50) DEFAULT 'verified',
    is_disputed             INT DEFAULT 0,
    dispute_note            TEXT DEFAULT '',
    key_figures             TEXT DEFAULT '[]',
    sources                 TEXT DEFAULT 'शिवसाम्राज्याचे दिनविशेष - गडकिल्ले संवर्धन प्रतिष्ठान, महाराष्ट्र राज्य',
    is_published            INT NOT NULL DEFAULT 1,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. Event Sources Table (दिनविशेष संदर्भ)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_sources (
    id                  VARCHAR(100) PRIMARY KEY,
    dinvishesh_id       VARCHAR(100) NOT NULL REFERENCES public.dinvishesh(id) ON DELETE CASCADE,
    source_name         VARCHAR(255) NOT NULL,
    source_url          VARCHAR(500) DEFAULT '',
    source_type         VARCHAR(100) DEFAULT 'Published historical book',
    source_description  TEXT DEFAULT '',
    is_primary          INT DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
