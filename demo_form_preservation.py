#!/usr/bin/env python3
"""
Demo script to test improved form data preservation.
"""

import requests

def demo_form_preservation():
    """Demo the improved form data preservation feature"""
    
    # Test data with mixed valid/invalid fields
    test_data = {
        'name': 'John Doe',           # ✅ VALID - should be preserved
        'email': 'invalid-email',     # ❌ INVALID - should show error but keep value
        'phone': '555-123-4567',      # ✅ VALID - should be preserved  
        'age': '25',                  # ✅ VALID - should be preserved
        'date': '2025-12-31',         # ❌ INVALID - future date, should show error
        'priority': 'medium',         # ✅ VALID - should be preserved
        'topics': ['web-development', 'ai-ml'],  # ✅ VALID - should be preserved
        'satisfaction': '8',          # ✅ VALID - should be preserved
        'message': 'Hi',              # ❌ INVALID - too short, should show error
        'form_version': '2.0',
        'timestamp': '2024-01-15T10:30:00'
    }
    
    print("🧪 Testing Form Data Preservation")
    print("=" * 50)
    print("Submitting form with mixed valid/invalid data:")
    print()
    
    for field, value in test_data.items():
        if field == 'email' and value == 'invalid-email':
            status = "❌ INVALID"
        elif field == 'date' and '2025' in str(value):
            status = "❌ INVALID"
        elif field == 'message' and len(str(value)) < 10:
            status = "❌ INVALID"
        else:
            status = "✅ VALID"
        
        # Handle list values properly
        if isinstance(value, list):
            value_str = ', '.join(value)
        else:
            value_str = str(value)
        
        print(f"{field:12}: {value_str:20} {status}")
    
    print()
    print("Expected behavior:")
    print("- Valid fields should be preserved in the form")
    print("- Invalid fields should show errors but keep user input")
    print("- User doesn't have to re-enter valid data")
    print()
    
    try:
        # Submit the form
        response = requests.post(
            'http://localhost:5001/contact',
            data=test_data,
            allow_redirects=False
        )
        
        if response.status_code == 200:
            print("✅ Form submitted successfully!")
            print("📝 Check the contact form in your browser to see:")
            print("   - Valid fields are preserved")
            print("   - Invalid fields show errors but keep values")
            print("   - Flash messages show specific validation errors")
            print()
            print("🌐 Open your browser and go to: http://localhost:5001/contact")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Flask app.")
        print("   Make sure the app is running on http://localhost:5001")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    demo_form_preservation() 