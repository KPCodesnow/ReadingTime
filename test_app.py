from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return '<h1>Flask is working!</h1>'

@app.route('/test')
def test():
    return render_template('base.html', title='Test')

if __name__ == '__main__':
    app.run(debug=True, port=5003) 