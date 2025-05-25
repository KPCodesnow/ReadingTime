from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import os
import re
from datetime import datetime
from werkzeug.utils import secure_filename
from supabase import create_client, Client
import config

# Create Flask application instance
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = config.FLASK_SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Supabase client
try:
    supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    print("✅ Supabase client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Supabase client: {e}")
    supabase = None

# Validation utilities (same as before)
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

# Database functions
def save_contact_submission(validated_data):
    """Save validated contact form data to Supabase database"""
    if not supabase:
        print("❌ Supabase client not available")
        return False
    
    try:
        # Prepare data for database insertion
        db_data = {
            'name': validated_data['name'],
            'email': validated_data['email'],
            'phone': validated_data.get('phone'),
            'age': validated_data['age'],
            'contact_date': validated_data.get('date').isoformat() if validated_data.get('date') else None,
            'priority': validated_data['priority'],
            'topics': validated_data.get('topics', []),
            'satisfaction': validated_data['satisfaction'],
            'message': validated_data['message'],
            'filename': validated_data.get('filename'),
            'form_version': validated_data.get('form_version', '2.0'),
            'timestamp': validated_data.get('timestamp')
        }
        
        # Insert data into Supabase
        result = supabase.table('contact_submissions').insert(db_data).execute()
        
        if result.data:
            print(f"✅ Contact submission saved to database with ID: {result.data[0]['id']}")
            return result.data[0]['id']
        else:
            print("❌ Failed to save contact submission")
            return False
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def get_contact_submissions(limit=10):
    """Retrieve recent contact submissions from database"""
    if not supabase:
        return []
    
    try:
        result = supabase.table('contact_submissions')\
                        .select('*')\
                        .order('created_at', desc=True)\
                        .limit(limit)\
                        .execute()
        
        return result.data if result.data else []
    except Exception as e:
        print(f"❌ Error retrieving submissions: {e}")
        return []

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
    """Enhanced contact page with comprehensive server-side validation and database storage"""
    if request.method == 'POST':
        # DEBUG: Print all form data received
        print("🔍 DEBUG Form data received:")
        for key, value in request.form.items():
            print(f"  {key}: {value}")
        print(f"  topics (getlist): {request.form.getlist('topics')}")
        print("=" * 50)
        
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
        
        # Validate checkboxes (topics) - topics are optional
        topics = request.form.getlist('topics')
        valid_topics = ['web-development', 'mobile-apps', 'data-science', 'ai-ml', 'cybersecurity']
        
        # DEBUG: Print what we received
        print(f"🔍 DEBUG Topics received: {topics}")
        print(f"🔍 DEBUG Valid topics: {valid_topics}")
        
        # Only validate if topics were selected
        if topics:
            invalid_topics = [topic for topic in topics if topic not in valid_topics]
            if invalid_topics:
                print(f"❌ DEBUG Invalid topics found: {invalid_topics}")
                errors.append(f"Topics: Invalid topics selected: {', '.join(invalid_topics)}")
            else:
                print(f"✅ DEBUG All topics valid: {topics}")
                validated_data['topics'] = topics
        else:
            # No topics selected is valid
            print("ℹ️ DEBUG No topics selected")
            validated_data['topics'] = []
        
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
        
        # Add hidden fields
        validated_data['form_version'] = request.form.get('form_version', '2.0')
        validated_data['timestamp'] = request.form.get('timestamp')
        
        # If there are validation errors, show them
        if errors:
            for error in errors:
                flash(error, 'error')
            
            # Create smart form data that preserves valid fields
            smart_form_data = {}
            
            # Keep validated data for fields that passed validation
            for field, value in validated_data.items():
                if field == 'date' and value:
                    # Convert date object back to string for form display
                    smart_form_data[field] = value.strftime('%Y-%m-%d')
                elif field == 'topics':
                    # Keep topics as list for template
                    smart_form_data[field] = value
                else:
                    smart_form_data[field] = value
            
            # For fields that failed validation, keep original form data
            for field in request.form:
                if field not in validated_data:
                    smart_form_data[field] = request.form.get(field)
            
            # Handle topics specially (checkboxes) - always preserve original topics
            if 'topics' not in validated_data:
                smart_form_data['topics'] = request.form.getlist('topics')
            
            
            return render_template('contact.html', title='Contact', form_data=smart_form_data, validation_errors=errors)
        
        # If validation passes, save to database
        submission_id = save_contact_submission(validated_data)
        
        if submission_id:
            flash(f'Thank you {validated_data["name"]}! Your message has been received and saved to the database (ID: {submission_id}).', 'success')
        else:
            flash(f'Thank you {validated_data["name"]}! Your message has been received (but there was an issue saving to database).', 'warning')
        
        # Log the validated data
        print("=== VALIDATED FORM DATA ===")
        for key, value in validated_data.items():
            print(f"{key}: {value}")
        print("===========================")
        
        return redirect(url_for('contact'))
    
    return render_template('contact.html', title='Contact')

@app.route('/submissions')
def submissions():
    """View recent contact submissions from database"""
    if not supabase:
        flash('Database connection not available', 'error')
        return redirect(url_for('home'))
    
    submissions = get_contact_submissions(limit=20)
    return render_template('submissions.html', title='Contact Submissions', submissions=submissions)

@app.route('/database-demo')
def database_demo():
    """Page explaining database integration concepts"""
    return render_template('database_demo.html', title='Database Integration Demo')

@app.route('/validation-demo')
def validation_demo():
    """Page explaining server-side validation concepts"""
    return render_template('validation_demo.html', title='Server-Side Validation Demo')

@app.route('/form-demo')
def form_demo():
    """Educational page about form concepts"""
    return render_template('form_demo.html', title='Form Demo')

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

@app.route('/api/database-status')
def database_status():
    """API endpoint to check database connection status"""
    if not supabase:
        return jsonify({'connected': False, 'error': 'Supabase client not initialized'})
    
    try:
        # Try a simple query to test connection
        result = supabase.table('contact_submissions').select('count').execute()
        return jsonify({'connected': True, 'message': 'Database connection successful'})
    except Exception as e:
        return jsonify({'connected': False, 'error': str(e)})

@app.route('/admin')
def admin():
    """Admin dashboard to view all contact submissions with statistics"""
    if not supabase:
        flash('Database connection not available', 'error')
        return redirect(url_for('home'))
    
    try:
        # Get all submissions
        all_submissions = supabase.table('contact_submissions')\
                                .select('*')\
                                .order('created_at', desc=True)\
                                .execute()
        
        submissions = all_submissions.data if all_submissions.data else []
        
        # Calculate statistics
        stats = {
            'total_submissions': len(submissions),
            'priority_counts': {'high': 0, 'medium': 0, 'low': 0},
            'priority_percentages': {'high': 0, 'medium': 0, 'low': 0},
            'topic_counts': {},
            'avg_satisfaction': 0,
            'recent_submissions': len([s for s in submissions if s.get('created_at') and 
                                     (datetime.now() - datetime.fromisoformat(s['created_at'].replace('Z', '+00:00'))).days <= 7])
        }
        
        # Calculate priority distribution
        for submission in submissions:
            priority = submission.get('priority', 'low')
            if priority in stats['priority_counts']:
                stats['priority_counts'][priority] += 1
        
        # Calculate priority percentages
        if stats['total_submissions'] > 0:
            for priority in stats['priority_counts']:
                stats['priority_percentages'][priority] = round(
                    (stats['priority_counts'][priority] / stats['total_submissions']) * 100, 1
                )
        
        # Calculate topic popularity
        for submission in submissions:
            topics = submission.get('topics', [])
            if topics:
                for topic in topics:
                    stats['topic_counts'][topic] = stats['topic_counts'].get(topic, 0) + 1
        
        # Calculate average satisfaction
        if submissions:
            total_satisfaction = sum(s.get('satisfaction', 0) for s in submissions)
            stats['avg_satisfaction'] = round(total_satisfaction / len(submissions), 1)
        
        return render_template('admin.html', title='Admin Dashboard', 
                             submissions=submissions, stats=stats)
        
    except Exception as e:
        print(f"❌ Error retrieving admin data: {e}")
        flash('Error retrieving admin data', 'error')
        return redirect(url_for('home'))

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
    
    print("🚀 Starting Flask app with Supabase integration")
    print("📊 Database status will be checked on startup")
    
    # Run the application in debug mode
    app.run(debug=True, host='127.0.0.1', port=5001) 