import requests
import json
import uuid
import sys

# Ensure UTF-8 stdout on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"
passed_tests = 0
failed_tests = 0

def test(name, condition, details=""):
    global passed_tests, failed_tests
    if condition:
        passed_tests += 1
        print(f"[PASS] {name}")
    else:
        failed_tests += 1
        print(f"[FAIL] {name} - {details}")

print(f"--- Starting Comprehensive Automated API Tests on {BASE_URL} ---")

# 1. Health Check
try:
    r = requests.get(f"{BASE_URL}/api/health", timeout=5)
    test("GET /api/health", r.status_code == 200 and r.json().get("status") == "healthy", r.text)
except Exception as e:
    test("GET /api/health", False, str(e))

# 2. Admin Login
admin_token = None
try:
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"username": "admin", "password": "admin123"}, timeout=5)
    data = r.json()
    test("POST /api/admin/login", r.status_code == 200 and "token" in data, r.text)
    admin_token = data.get("token")
except Exception as e:
    test("POST /api/admin/login", False, str(e))

# 3. Admin Stats
try:
    r = requests.get(f"{BASE_URL}/api/admin/stats", timeout=5)
    test("GET /api/admin/stats", r.status_code == 200 and "totalFortsCount" in r.json(), r.text)
except Exception as e:
    test("GET /api/admin/stats", False, str(e))

# 4. Settings
try:
    r = requests.get(f"{BASE_URL}/api/settings", timeout=5)
    test("GET /api/settings", r.status_code == 200, r.text)
    
    settings_data = r.json()
    settings_data["tagline"] = "गड संवर्धन हेच आमचे ध्येय - Automated Test"
    r2 = requests.put(f"{BASE_URL}/api/settings", json=settings_data, timeout=5)
    test("PUT /api/settings", r2.status_code == 200, r2.text)
except Exception as e:
    test("Settings GET/PUT", False, str(e))

# 5. Forts CRUD
fort_id = None
try:
    fort_slug = f"test-fort-{uuid.uuid4().hex[:6]}"
    new_fort = {
        "id": fort_slug,
        "name": "चाचणी किल्ला",
        "nameEn": "Test Fort Automated",
        "district": "पुणे",
        "taluka": "हवेली",
        "height": "1200 m",
        "type": "गिरिदुर्ग",
        "era": "शिवकाळ",
        "difficulty": "मध्यम",
        "difficultyEn": "moderate",
        "status": "progress",
        "statusLabel": "संवर्धन सुरू",
        "image": "/images/raigad.jpg",
        "desc": "स्वयंचलित चाचणी किल्ला तपशील.",
        "history": "छत्रपती शिवाजी महाराजांनी जिंकलेला ऐतिहासिक किल्ला.",
        "trek": {
            "distance": "3 किमी",
            "time": "2-3 तास",
            "season": "ऑक्टोबर–मार्च",
            "water": "उपलब्ध",
            "network": "चांगले"
        },
        "features": ["Water Cistern", "Bastion"],
        "latitude": 18.5204,
        "longitude": 73.8567,
        "isFeatured": True,
        "isSpotlight": False
    }
    r = requests.post(f"{BASE_URL}/api/forts", json=new_fort, timeout=5)
    test("POST /api/forts", r.status_code == 201, r.text)
    if r.status_code == 201:
        fort_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/forts", timeout=5)
    test("GET /api/forts", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    if fort_id:
        r_single = requests.get(f"{BASE_URL}/api/forts/{fort_id}", timeout=5)
        test(f"GET /api/forts/{fort_id}", r_single.status_code == 200 and r_single.json().get("name") == "चाचणी किल्ला", r_single.text)
        
        r_del = requests.delete(f"{BASE_URL}/api/forts/{fort_id}", timeout=5)
        test(f"DELETE /api/forts/{fort_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Forts CRUD", False, str(e))

# 6. Events CRUD & Event Registration
event_id = None
try:
    new_event = {
        "title": "स्वच्छता मोहीम चाचणी",
        "type": "स्वच्छता",
        "date": "2026-11-15",
        "dateNum": "15",
        "month": "NOV",
        "location": "राजगड किल्ला",
        "district": "पुणे",
        "capacity": 100,
        "registered": 0,
        "image": "/images/raigad.jpg",
        "desc": "स्वयंचलित चाचणी मोहीम",
        "status": "नोंदणी सुरू"
    }
    r = requests.post(f"{BASE_URL}/api/events", json=new_event, timeout=5)
    test("POST /api/events", r.status_code == 201, r.text)
    if r.status_code == 201:
        event_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/events", timeout=5)
    test("GET /api/events", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    # Register for event
    reg_payload = {
        "eventId": event_id or "default-event",
        "eventTitle": "स्वच्छता मोहीम चाचणी",
        "fullName": "रोहन पाटील",
        "phone": "9876543210",
        "email": "rohan@example.com",
        "participantsCount": 1,
        "emergencyContact": "9876543211"
    }
    r_reg = requests.post(f"{BASE_URL}/api/events/register", json=reg_payload, timeout=5)
    test("POST /api/events/register", r_reg.status_code == 201, r_reg.text)
    
    r_regs = requests.get(f"{BASE_URL}/api/events/registrations", timeout=5)
    test("GET /api/events/registrations", r_regs.status_code == 200, r_regs.text)
    
    if event_id:
        r_del = requests.delete(f"{BASE_URL}/api/events/{event_id}", timeout=5)
        test(f"DELETE /api/events/{event_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Events & Registrations", False, str(e))

# 7. Volunteers API
vol_id = None
try:
    vol_payload = {
        "fullName": "अमित देशमुख",
        "age": 26,
        "phone": "9988776655",
        "email": "amit.deshmukh@example.com",
        "district": "सातारा",
        "occupation": "इंजिनिअर",
        "interests": ["संवर्धन", "ट्रेकिंग"],
        "availability": "शनिवार-रविवार",
        "trekkingExperience": "मध्यम",
        "about": "मला गडकिल्ल्यांच्या संवर्धनात सहभागी व्हायचे आहे."
    }
    r = requests.post(f"{BASE_URL}/api/volunteers", json=vol_payload, timeout=5)
    test("POST /api/volunteers", r.status_code == 201, r.text)
    
    r_list = requests.get(f"{BASE_URL}/api/volunteers", timeout=5)
    test("GET /api/volunteers", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    if r_list.status_code == 200 and len(r_list.json()) > 0:
        vol_id = r_list.json()[-1].get("id")
        
    if vol_id:
        r_del = requests.delete(f"{BASE_URL}/api/volunteers/{vol_id}", timeout=5)
        test(f"DELETE /api/volunteers/{vol_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Volunteers API", False, str(e))

# 8. Contact API
contact_id = None
try:
    contact_payload = {
        "fullName": "सुनील शिंदे",
        "email": "sunil@example.com",
        "phone": "9822334455",
        "subject": "किल्ले संवर्धन माहिती",
        "message": "आम्हाला पुढच्या मोहिमेबद्दल माहिती हवी आहे."
    }
    r = requests.post(f"{BASE_URL}/api/contact", json=contact_payload, timeout=5)
    test("POST /api/contact", r.status_code == 201, r.text)
    
    r_list = requests.get(f"{BASE_URL}/api/contacts", timeout=5)
    test("GET /api/contacts", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    if r_list.status_code == 200 and len(r_list.json()) > 0:
        contact_id = r_list.json()[-1].get("id")
        
    if contact_id:
        r_del = requests.delete(f"{BASE_URL}/api/contacts/{contact_id}", timeout=5)
        test(f"DELETE /api/contacts/{contact_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Contact API", False, str(e))

# 9. Donations API & Summary
donation_id = None
try:
    donation_payload = {
        "donor_name": "विकास जोशी",
        "email": "vikas@example.com",
        "phone": "9811223344",
        "amount": 2500,
        "project_name": "तोरणा किल्ला संवर्धन",
        "payment_method": "UPI",
        "transaction_ref": "UPI-TEST-123456"
    }
    r = requests.post(f"{BASE_URL}/api/donations", json=donation_payload, timeout=5)
    test("POST /api/donations", r.status_code == 201, r.text)
    
    r_list = requests.get(f"{BASE_URL}/api/donations", timeout=5)
    test("GET /api/donations", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    if r_list.status_code == 200 and len(r_list.json()) > 0:
        donation_id = r_list.json()[-1].get("id")
        
    r_summary = requests.get(f"{BASE_URL}/api/donations/summary", timeout=5)
    test("GET /api/donations/summary", r_summary.status_code == 200 and "totalAmount" in r_summary.json(), r_summary.text)
    
    if donation_id:
        r_del = requests.delete(f"{BASE_URL}/api/donations/{donation_id}", timeout=5)
        test(f"DELETE /api/donations/{donation_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Donations API", False, str(e))

# 10. Certificates API
cert_id = None
cert_code = None
try:
    cert_payload = {
        "recipientName": "प्रशांत मोहिते",
        "eventName": "सिंहगड स्वच्छता मोहीम",
        "certType": "volunteer"
    }
    r = requests.post(f"{BASE_URL}/api/certificates", json=cert_payload, timeout=5)
    test("POST /api/certificates", r.status_code == 201, r.text)
    if r.status_code == 201:
        cert_id = r.json().get("id")
        cert_code = r.json().get("cert_code")
        
    r_list = requests.get(f"{BASE_URL}/api/certificates", timeout=5)
    test("GET /api/certificates", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    if cert_code:
        r_query = requests.get(f"{BASE_URL}/api/certificates/{cert_code}", timeout=5)
        test(f"GET /api/certificates/{cert_code}", r_query.status_code == 200 and r_query.json().get("recipient_name") == "प्रशांत मोहिते", r_query.text)
    
    if cert_id:
        r_del = requests.delete(f"{BASE_URL}/api/certificates/{cert_id}", timeout=5)
        test(f"DELETE /api/certificates/{cert_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Certificates API", False, str(e))

# 11. Projects API
proj_id = None
try:
    proj_payload = {
        "title": "राजगड पायथा संवर्धन मोहीम",
        "fort": "राजगड",
        "status": "सुरू आहे",
        "progress": 35,
        "volunteers": 25,
        "budget": "₹50,000",
        "spent": "₹15,000",
        "desc": "गडावरील जुने पाण्याचे टाके स्वच्छ करणे."
    }
    r = requests.post(f"{BASE_URL}/api/projects", json=proj_payload, timeout=5)
    test("POST /api/projects", r.status_code == 201, r.text)
    if r.status_code == 201:
        proj_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/projects", timeout=5)
    test("GET /api/projects", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    if proj_id:
        r_del = requests.delete(f"{BASE_URL}/api/projects/{proj_id}", timeout=5)
        test(f"DELETE /api/projects/{proj_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Projects API", False, str(e))

# 12. News API
news_id = None
try:
    news_payload = {
        "category": "संवर्धन",
        "title": "नवीन मोहीम जाहीर",
        "date": "04 OCT 2026",
        "author": "गडकिल्ले संघटक",
        "image": "/images/raigad.jpg",
        "desc": "येत्या रविवारी तोरणा किल्ल्यावर विशेष स्वच्छता मोहीम.",
        "body": "सर्व शिवप्रेमींनी वेळेत उपस्थित राहावे."
    }
    r = requests.post(f"{BASE_URL}/api/news", json=news_payload, timeout=5)
    test("POST /api/news", r.status_code == 201, r.text)
    if r.status_code == 201:
        news_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/news", timeout=5)
    test("GET /api/news", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    if news_id:
        r_del = requests.delete(f"{BASE_URL}/api/news/{news_id}", timeout=5)
        test(f"DELETE /api/news/{news_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("News API", False, str(e))

# 13. Gallery API
gal_id = None
try:
    gal_payload = {
        "src": "/images/raigad.jpg",
        "caption": "मेघडंबरी व होळीचा माळ - किल्ले रायगड",
        "category": "गडकिल्ले"
    }
    r = requests.post(f"{BASE_URL}/api/gallery", json=gal_payload, timeout=5)
    test("POST /api/gallery", r.status_code == 201, r.text)
    if r.status_code == 201:
        gal_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/gallery", timeout=5)
    test("GET /api/gallery", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    if gal_id:
        r_del = requests.delete(f"{BASE_URL}/api/gallery/{gal_id}", timeout=5)
        test(f"DELETE /api/gallery/{gal_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Gallery API", False, str(e))

# 14. Students Auth & Participations
student_id = None
student_email = f"student_{uuid.uuid4().hex[:6]}@example.com"
try:
    stud_reg = {
        "fullName": "आकाश जाधव",
        "email": student_email,
        "password": "Password123!",
        "phone": "9876501234",
        "studentType": "college",
        "institution": "पुणे विद्यापीठ",
        "classYear": "तृतीय वर्ष",
        "district": "Pune"
    }
    r = requests.post(f"{BASE_URL}/api/students/register", json=stud_reg, timeout=5)
    test("POST /api/students/register", r.status_code == 201, r.text)
    if r.status_code == 201:
        student_id = r.json().get("studentId")
        
    # Student Login
    r_login = requests.post(f"{BASE_URL}/api/students/login", json={"email": student_email, "password": "Password123!"}, timeout=5)
    test("POST /api/students/login", r_login.status_code == 200 and "token" in r_login.json(), r_login.text)
    
    # Student Participations
    if student_id:
        part_payload = {
            "studentId": student_id,
            "activityType": "quiz",
            "activityTitle": "मराठा इतिहास प्रश्नमंजुषा",
            "score": 90,
            "maxScore": 100,
            "status": "completed",
            "certificateId": ""
        }
        r_part = requests.post(f"{BASE_URL}/api/student-participations", json=part_payload, timeout=5)
        test("POST /api/student-participations", r_part.status_code == 201, r_part.text)
        
        r_parts = requests.get(f"{BASE_URL}/api/students/{student_id}/participations", timeout=5)
        test("GET /api/students/{id}/participations", r_parts.status_code == 200 and len(r_parts.json()) > 0, r_parts.text)
        
        r_del = requests.delete(f"{BASE_URL}/api/students/{student_id}", timeout=5)
        test(f"DELETE /api/students/{student_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Students API", False, str(e))

# 15. Dinvishesh (Historical Events) API
din_id = None
try:
    din_payload = {
        "eventDate": "1674-06-06",
        "day": 6,
        "month": 6,
        "year": 1674,
        "personality": "छत्रपती शिवाजी महाराज",
        "eventType": "शिवराज्याभिषेक सोहळा",
        "title": "छत्रपती शिवाजी महाराज शिवराज्याभिषेक सोहळा",
        "titleMarathi": "छत्रपती शिवाजी महाराज शिवराज्याभिषेक सोहळा",
        "titleEnglish": "Coronation of Chhatrapati Shivaji Maharaj",
        "description": "ज्येष्ठ शुद्ध त्रयोदशी शके १५९६ रोजी रायगडावर शिवराज्याभिषेक संपन्न झाला.",
        "descriptionMarathi": "ज्येष्ठ शुद्ध त्रयोदशी शके १५९६ रोजी रायगडावर शिवराज्याभिषेक संपन्न झाला.",
        "descriptionEnglish": "The grand coronation was held at Fort Raigad.",
        "location": "किल्ले रायगड",
        "historicalSignificance": "हिंदवी स्वराज्याची सार्वभौम स्थापना.",
        "sourceName": "शिवभारत, सभासद बखर",
        "sourceType": "ऐतिहासिक बखर",
        "sourceDescription": "समकालीन कागदपत्रे",
        "verificationStatus": "verified",
        "isDisputed": False,
        "isPublished": True,
        "keyFigures": ["गागाभट्ट", "जिजाऊ माँसाहेब", "हंबीरराव मोहिते"]
    }
    r = requests.post(f"{BASE_URL}/api/dinvishesh", json=din_payload, timeout=5)
    test("POST /api/dinvishesh", r.status_code == 201, r.text)
    if r.status_code == 201:
        din_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/dinvishesh?month=6&day=6", timeout=5)
    test("GET /api/dinvishesh?month=6&day=6", r_list.status_code == 200 and len(r_list.json()) > 0, r_list.text)
    
    r_stats = requests.get(f"{BASE_URL}/api/dinvishesh/stats", timeout=5)
    test("GET /api/dinvishesh/stats", r_stats.status_code == 200 and "total_events" in r_stats.json(), r_stats.text)
    
    if din_id:
        r_del = requests.delete(f"{BASE_URL}/api/dinvishesh/{din_id}", timeout=5)
        test(f"DELETE /api/dinvishesh/{din_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Dinvishesh API", False, str(e))

# 16. Education Programs API
edu_id = None
try:
    edu_payload = {
        "title": "किल्ले इतिहास शिबिर",
        "titleEn": "Fort History Workshop",
        "category": "workshop",
        "description": "विद्यार्थ्यांसाठी ऐतिहासिक दुर्गअभ्यास कार्यशाळा.",
        "descriptionEn": "Educational workshop for students.",
        "targetAudience": "शालेय व महाविद्यालयीन विद्यार्थी",
        "targetAudienceEn": "School and college students",
        "schedule": "रविवार सकाळी ९ ते १२",
        "status": "active",
        "isActive": True
    }
    r = requests.post(f"{BASE_URL}/api/education-programs", json=edu_payload, timeout=5)
    test("POST /api/education-programs", r.status_code == 201, r.text)
    if r.status_code == 201:
        edu_id = r.json().get("id")
        
    r_list = requests.get(f"{BASE_URL}/api/education-programs", timeout=5)
    test("GET /api/education-programs", r_list.status_code == 200, r_list.text)
    
    if edu_id:
        r_del = requests.delete(f"{BASE_URL}/api/education-programs/{edu_id}", timeout=5)
        test(f"DELETE /api/education-programs/{edu_id}", r_del.status_code == 200, r_del.text)
except Exception as e:
    test("Education Programs API", False, str(e))

print(f"\n==========================================")
print(f"AUTOMATED TEST RESULTS: {passed_tests} PASSED, {failed_tests} FAILED")
print(f"==========================================")
if failed_tests > 0:
    sys.exit(1)
