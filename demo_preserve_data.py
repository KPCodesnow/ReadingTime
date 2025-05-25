#!/usr/bin/env python3
"""
Demonstration: How Form Data Preservation Works
This script shows the concept behind preserving user input on validation errors.
"""

from flask import Flask, render_template_string, request, flash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'demo-key'

# Simple template to demonstrate the concept
DEMO_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Form Data Preservation Demo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .error { color: red; background: #ffe6e6; padding: 10px; margin: 10px 0; }
        .success { color: green; background: #e6ffe6; padding: 10px; margin: 10px 0; }
        input, textarea { width: 300px; padding: 8px; margin: 5px 0; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; }
    </style>
</head>
<body>
    <h1>Form Data Preservation Demo</h1>
    
    <!-- Flash Messages -->
    {% with messages = get_flashed_messages(with_categories=true) %}
        {% if messages %}
            {% for category, message in messages %}
                <div class="{{ category }}">{{ message }}</div>
            {% endfor %}
        {% endif %}
    {% endwith %}
    
    <form method="POST">
        <h3>Try submitting with invalid data to see preservation in action:</h3>
        
        <label>Name (min 2 chars):</label><br>
        <input type="text" name="name" 
               value="{{ form_data.name if form_data else '' }}" 
               placeholder="Enter your name"><br>
        
        <label>Email:</label><br>
        <input type="email" name="email" 
               value="{{ form_data.email if form_data else '' }}" 
               placeholder="Enter your email"><br>
        
        <label>Age (13-120):</label><br>
        <input type="number" name="age" 
               value="{{ form_data.age if form_data else '' }}" 
               placeholder="Enter your age"><br>
        
        <label>Priority:</label><br>
        <input type="radio" name="priority" value="low" 
               {{ 'checked' if form_data and form_data.priority == 'low' else '' }}> Low
        <input type="radio" name="priority" value="high" 
               {{ 'checked' if form_data and form_data.priority == 'high' else '' }}> High<br><br>
        
        <label>Message (min 5 chars):</label><br>
        <textarea name="message" rows="3" placeholder="Enter your message">{{ form_data.message if form_data else '' }}</textarea><br>
        
        <button type="submit">Submit</button>
    </form>
    
    <div style="margin-top: 30px; background: #f0f0f0; padding: 20px;">
        <h3>🔍 What's Happening Behind the Scenes:</h3>
        <p><strong>1. First Visit:</strong> form_data is None, all fields are empty</p>
        <p><strong>2. Submit with errors:</strong> form_data = request.form, fields repopulated</p>
        <p><strong>3. Submit successfully:</strong> Redirect (form_data reset)</p>
        
        {% if form_data %}
        <h4>Current form_data contents:</h4>
        <pre>{{ form_data_debug }}</pre>
        {% endif %}
    </div>
</body>
</html>
'''

@app.route('/', methods=['GET', 'POST'])
def demo():
    if request.method == 'POST':
        errors = []
        
        # Validate name
        name = request.form.get('name', '').strip()
        if len(name) < 2:
            errors.append("Name must be at least 2 characters")
        
        # Validate email
        email = request.form.get('email', '').strip()
        if not email or '@' not in email:
            errors.append("Please enter a valid email")
        
        # Validate age
        try:
            age = int(request.form.get('age', 0))
            if age < 13 or age > 120:
                errors.append("Age must be between 13 and 120")
        except ValueError:
            errors.append("Age must be a number")
        
        # Validate priority
        priority = request.form.get('priority')
        if not priority:
            errors.append("Please select a priority")
        
        # Validate message
        message = request.form.get('message', '').strip()
        if len(message) < 5:
            errors.append("Message must be at least 5 characters")
        
        if errors:
            # VALIDATION FAILED - Preserve form data
            for error in errors:
                flash(error, 'error')
            
            # Create debug info to show what's preserved
            form_data_debug = dict(request.form)
            
            # Re-render template with form data preserved
            return render_template_string(
                DEMO_TEMPLATE, 
                form_data=request.form,
                form_data_debug=form_data_debug
            )
        else:
            # VALIDATION PASSED - Process and redirect
            flash(f"Success! Hello {name}, your form was submitted successfully!", 'success')
            # Note: We redirect here, so form_data is reset
            return render_template_string(DEMO_TEMPLATE, form_data=None)
    
    # GET request - show empty form
    return render_template_string(DEMO_TEMPLATE, form_data=None)

if __name__ == '__main__':
    print("🚀 Starting Form Data Preservation Demo")
    print("📝 Visit http://localhost:5002 to see the demo")
    print("💡 Try submitting with invalid data to see preservation in action!")
    app.run(debug=True, port=5002) 