# -*- coding: utf-8 -*-
import sys
import io
import urllib.request
import urllib.parse
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("1. Testing Health Endpoint...")
    with urllib.request.urlopen(f"{BASE_URL}/api/health") as response:
        assert response.status == 200
        print("  -> Health status:", json.loads(response.read().decode('utf-8')))

    print("\n2. Testing GET /api/dinvishesh for May (month=5)...")
    with urllib.request.urlopen(f"{BASE_URL}/api/dinvishesh?month=5") as response:
        assert response.status == 200
        data = json.loads(response.read().decode('utf-8'))
        print(f"  -> Total May Events Found: {len(data)}")
        assert len(data) >= 30, f"Expected at least 30 May events, found {len(data)}"
        
        # Check specific key dates
        days_found = {item['day'] for item in data}
        print(f"  -> Days with events in May: {sorted(list(days_found))}")
        assert 1 in days_found
        assert 14 in days_found
        assert 16 in days_found
        assert 31 in days_found

        print("\n3. Sample May Events Check:")
        for ev in data[:5]:
            print(f"  [{ev['day']} मे {ev.get('year', '')}] - {ev['title']} ({ev.get('location', '')})")

    print("\n4. Testing Personality Filter (Chhatrapati Sambhaji Maharaj)...")
    with urllib.request.urlopen(f"{BASE_URL}/api/dinvishesh?month=5&personality=" + urllib.parse.quote("छत्रपती संभाजी महाराज")) as response:
        assert response.status == 200
        sambhaji_data = json.loads(response.read().decode('utf-8'))
        print(f"  -> Sambhaji Maharaj May events: {len(sambhaji_data)}")
        for ev in sambhaji_data[:3]:
            print(f"     * {ev['day']} मे: {ev['title']}")

    print("\n5. Testing Search Filter ('मुरारबाजी')...")
    with urllib.request.urlopen(f"{BASE_URL}/api/dinvishesh?search=" + urllib.parse.quote("मुरारबाजी")) as response:
        assert response.status == 200
        search_data = json.loads(response.read().decode('utf-8'))
        print(f"  -> Search results for 'मुरारबाजी': {len(search_data)} events found")
        for ev in search_data:
            print(f"     * {ev['day']} {ev['month']}: {ev['title']}")

    print("\n6. Testing /api/dinvishesh/stats...")
    with urllib.request.urlopen(f"{BASE_URL}/api/dinvishesh/stats") as response:
        assert response.status == 200
        stats = json.loads(response.read().decode('utf-8'))
        print(f"  -> Stats: Total published events: {stats.get('total_events')}")
        print(f"  -> Personality breakdown: {stats.get('personality_distribution')}")

    print("\nAll Dinvishesh API & Data Verification tests PASSED successfully!")

if __name__ == "__main__":
    import urllib.parse
    test_api()
