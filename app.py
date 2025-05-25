from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import os
import re
from datetime import datetime
from werkzeug.utils import secure_filename
import sqlite3

# Create Flask application instance
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Database setup
DATABASE = 'contact_submissions.db'

def init_db():
    """Initialize the database with contact submissions table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            age INTEGER,
            date TEXT,
            message TEXT NOT NULL,
            priority TEXT,
            topics TEXT,
            satisfaction INTEGER,
            filename TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def save_contact_submission(data):
    """Save contact form submission to database"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO contact_submissions 
        (name, email, phone, age, date, message, priority, topics, satisfaction, filename)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('name'),
        data.get('email'),
        data.get('phone'),
        data.get('age'),
        str(data.get('date')) if data.get('date') else None,
        data.get('message'),
        data.get('priority'),
        ','.join(data.get('topics', [])),
        data.get('satisfaction'),
        data.get('filename')
    ))
    
    submission_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return submission_id

def get_all_submissions():
    """Get all contact submissions from database"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, email, phone, age, date, message, priority, topics, 
               satisfaction, filename, submitted_at
        FROM contact_submissions 
        ORDER BY submitted_at DESC
    ''')
    
    submissions = cursor.fetchall()
    conn.close()
    
    return submissions

# Initialize database on startup
init_db()

# Validation utilities
class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

def validate_email(email):
    """Validate email format using regex"""
    if not email:
        raise ValidationError("Email is required")
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError("Please enter a valid email address")
    
    return email.lower().strip()

def validate_name(name):
    """Validate name field"""
    if not name:
        raise ValidationError("Name is required")
    
    name = name.strip()
    if len(name) < 2:
        raise ValidationError("Name must be at least 2 characters long")
    
    if len(name) > 50:
        raise ValidationError("Name must be less than 50 characters")
    
    # Check for valid characters (letters, spaces, hyphens, apostrophes)
    if not re.match(r"^[a-zA-Z\s\-']+$", name):
        raise ValidationError("Name can only contain letters, spaces, hyphens, and apostrophes")
    
    return name

def validate_phone(phone):
    """Validate phone number"""
    if not phone:
        return None  # Phone is optional
    
    # Remove all non-digit characters
    phone_digits = re.sub(r'\D', '', phone)
    
    if len(phone_digits) < 10:
        raise ValidationError("Phone number must have at least 10 digits")
    
    if len(phone_digits) > 15:
        raise ValidationError("Phone number must have less than 15 digits")
    
    return phone_digits

def validate_age(age_str):
    """Validate age field"""
    if not age_str:
        raise ValidationError("Age is required")
    
    try:
        age = int(age_str)
    except ValueError:
        raise ValidationError("Age must be a valid number")
    
    if age < 13:
        raise ValidationError("You must be at least 13 years old")
    
    if age > 120:
        raise ValidationError("Please enter a valid age")
    
    return age

def validate_date(date_str):
    """Validate date field"""
    if not date_str:
        return None  # Date is optional
    
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Check if date is not in the future
        if date_obj.date() > datetime.now().date():
            raise ValidationError("Date cannot be in the future")
        
        return date_obj.date()
    except ValueError:
        raise ValidationError("Please enter a valid date")

def validate_message(message):
    """Validate message field"""
    if not message:
        raise ValidationError("Message is required")
    
    message = message.strip()
    if len(message) < 10:
        raise ValidationError("Message must be at least 10 characters long")
    
    if len(message) > 1000:
        raise ValidationError("Message must be less than 1000 characters")
    
    return message

def validate_file(file):
    """Validate uploaded file"""
    if not file or file.filename == '':
        return None  # File is optional
    
    # Check file size (already handled by Flask config, but good to double-check)
    if request.content_length > app.config['MAX_CONTENT_LENGTH']:
        raise ValidationError("File size too large. Maximum size is 16MB")
    
    # Check file extension
    allowed_extensions = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    filename = file.filename.lower()
    
    if '.' not in filename or filename.rsplit('.', 1)[1] not in allowed_extensions:
        raise ValidationError(f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")
    
    return file

# Routes
@app.route('/')
def home():
    """Home page route"""
    return render_template('index.html', title='Python Web App')

@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html', title='About')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """Enhanced contact page with comprehensive server-side validation"""
    if request.method == 'POST':
        errors = []
        validated_data = {}
        
        try:
            # Validate each field individually
            validated_data['name'] = validate_name(request.form.get('name'))
        except ValidationError as e:
            errors.append(f"Name: {str(e)}")
        
        try:
            validated_data['email'] = validate_email(request.form.get('email'))
        except ValidationError as e:
            errors.append(f"Email: {str(e)}")
        
        try:
            validated_data['phone'] = validate_phone(request.form.get('phone'))
        except ValidationError as e:
            errors.append(f"Phone: {str(e)}")
        
        try:
            validated_data['age'] = validate_age(request.form.get('age'))
        except ValidationError as e:
            errors.append(f"Age: {str(e)}")
        
        try:
            validated_data['date'] = validate_date(request.form.get('date'))
        except ValidationError as e:
            errors.append(f"Date: {str(e)}")
        
        try:
            validated_data['message'] = validate_message(request.form.get('message'))
        except ValidationError as e:
            errors.append(f"Message: {str(e)}")
        
        # Validate select field
        priority = request.form.get('priority')
        if priority not in ['low', 'medium', 'high']:
            errors.append("Priority: Please select a valid priority level")
        else:
            validated_data['priority'] = priority
        
        # Validate checkboxes (topics)
        topics = request.form.getlist('topics')
        valid_topics = ['web-development', 'mobile-apps', 'data-science', 'ai-ml', 'cybersecurity']
        invalid_topics = [topic for topic in topics if topic not in valid_topics]
        if invalid_topics:
            errors.append(f"Topics: Invalid topics selected: {', '.join(invalid_topics)}")
        else:
            validated_data['topics'] = topics
        
        # Validate range input
        try:
            satisfaction = int(request.form.get('satisfaction', 0))
            if satisfaction < 1 or satisfaction > 10:
                errors.append("Satisfaction: Please select a value between 1 and 10")
            else:
                validated_data['satisfaction'] = satisfaction
        except ValueError:
            errors.append("Satisfaction: Invalid satisfaction rating")
        
        # Validate file upload
        try:
            file = request.files.get('attachment')
            validated_file = validate_file(file)
            if validated_file:
                filename = secure_filename(validated_file.filename)
                # In a real app, you'd save the file here
                validated_data['filename'] = filename
        except ValidationError as e:
            errors.append(f"File: {str(e)}")
        
        # If there are validation errors, show them
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('contact.html', title='Contact', form_data=request.form)
        
        # If validation passes, process the form
        # Save the submission to the database
        submission_id = save_contact_submission(validated_data)
        
        flash(f'Thank you {validated_data["name"]}! Your message has been received and saved successfully. (Submission ID: {submission_id})', 'success')
        
        # Log the validated data for debugging
        print("=== VALIDATED FORM DATA SAVED ===")
        for key, value in validated_data.items():
            print(f"{key}: {value}")
        print(f"Saved with ID: {submission_id}")
        print("=================================")
        
        return redirect(url_for('contact'))
    
    return render_template('contact.html', title='Contact')

@app.route('/validation-demo')
def validation_demo():
    """Page explaining server-side validation concepts"""
    return render_template('validation_demo.html', title='Server-Side Validation Demo')

@app.route('/form-demo')
def form_demo():
    """Educational page about form concepts"""
    return render_template('form_demo.html', title='Form Demo')

@app.route('/submissions')
def submissions():
    """View all contact form submissions"""
    all_submissions = get_all_submissions()
    return render_template('submissions.html', title='Contact Submissions', submissions=all_submissions)

@app.route('/api/validate-email', methods=['POST'])
def validate_email_api():
    """API endpoint for real-time email validation"""
    data = request.get_json()
    email = data.get('email', '')
    
    try:
        validated_email = validate_email(email)
        return jsonify({'valid': True, 'email': validated_email})
    except ValidationError as e:
        return jsonify({'valid': False, 'error': str(e)})

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

@app.errorhandler(413)
def file_too_large(error):
    flash('File too large. Maximum size is 16MB.', 'error')
    return redirect(url_for('contact'))

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('uploads', exist_ok=True)
    
    # Run the application in debug mode
    app.run(debug=True, host='0.0.0.0', port=5001) 