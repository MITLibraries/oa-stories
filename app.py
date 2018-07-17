from flask import Flask, render_template
from flask_sslify import SSLify
from raven.contrib.flask import Sentry

app = Flask(__name__)
sentry = Sentry(app)
sslify = SSLify(app)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
