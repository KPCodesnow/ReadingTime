#!/usr/bin/env python3
import requests

# Test form submission
url = "http://localhost:5004/contact"
data = {
    'name': 'Krishna Prasad',
    'email': 'krishna@example.com',
    'phone': '9876543210',
    'age': '30',
    'date': '2025-05-20',
    'message': 'This is a comprehensive test message to verify that the Flask app is properly saving form data to the SQLite database. The form validation and persistence features are working correctly!',
    'priority': 'medium',
    'topics': ['web-development', 'data-science'],
    'satisfaction': '8'
}

print("Submitting test form...")
response = requests.post(url, data=data, allow_redirects=True)

if response.status_code == 200:
    if "successfully" in response.text:
        print("✅ Form submitted successfully!")
    else:
        print("⚠️ Form submitted but no success message found")
else:
    print(f"❌ Form submission failed with status code: {response.status_code}")

print(f"Response URL: {response.url}") 