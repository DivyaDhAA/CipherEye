import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB

# Define directory to save models
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

def extract_url_features(url):
    """
    Extracts lexical features from a URL for machine learning classification.
    """
    features = []
    # 1. URL Length
    features.append(len(url))
    # 2. Count of dots
    features.append(url.count('.'))
    # 3. Count of hyphens
    features.append(url.count('-'))
    # 4. Count of slashes
    features.append(url.count('/'))
    # 5. Count of question marks
    features.append(url.count('?'))
    # 6. Count of equal signs
    features.append(url.count('='))
    # 7. Presence of '@'
    features.append(1 if '@' in url else 0)
    # 8. Presence of IP address (simple check)
    has_ip = 0
    parts = url.split('/')
    for part in parts:
        part_clean = part.split(':')[0]
        subparts = part_clean.split('.')
        if len(subparts) == 4 and all(s.isdigit() for s in subparts):
            has_ip = 1
            break
    features.append(has_ip)
    # 9. Presence of suspicious keywords
    keywords = ['login', 'verify', 'secure', 'update', 'banking', 'paypal', 'signin', 'support', 'free', 'gift', 'account', 'wallet', 'crypto']
    url_lower = url.lower()
    for kw in keywords:
        features.append(1 if kw in url_lower else 0)
        
    return features

def train_url_model():
    print("Training URL Phishing Classifier...")
    
    # Dataset of benign and phishing URLs
    data = [
        # Benign URLs (Label = 0)
        ("https://www.google.com", 0),
        ("https://github.com/profile", 0),
        ("https://www.wikipedia.org", 0),
        ("https://stackoverflow.com/questions", 0),
        ("https://www.amazon.com/gp/goldbox", 0),
        ("https://www.nytimes.com", 0),
        ("https://medium.com/@username/story", 0),
        ("https://www.linkedin.com/feed", 0),
        ("https://twitter.com/home", 0),
        ("https://docs.microsoft.com", 0),
        ("https://reactjs.org", 0),
        ("https://www.apple.com/macbook", 0),
        ("https://www.netflix.com/browse", 0),
        ("https://www.zoom.us/join", 0),
        ("https://slack.com", 0),
        ("https://www.spotify.com", 0),
        
        # Phishing/Scam URLs (Label = 1)
        ("http://paypal-security-update-login.xyz", 1),
        ("http://verify-bank-account-signin.info", 1),
        ("https://secure-wallet-login.com.im", 1),
        ("http://free-gift-card-claim.xyz/win", 1),
        ("http://netflix-billing-alert.com/signin", 1),
        ("http://cryptowallet-support-auth.com", 1),
        ("http://192.168.1.105/login.html", 1),
        ("http://chase-bank-verify-identity.net", 1),
        ("http://amazon-prime-gift.xyz", 1),
        ("http://apple-login-support-update.com", 1),
        ("http://verify-metamask-seedphrase.org", 1),
        ("http://steam-community-free-skins.net", 1),
        ("http://wells-fargo-alert-login.info", 1),
        ("http://suspicious-activity-detected.cc", 1)
    ]
    
    # Extract features
    X = []
    y = []
    for url, label in data:
        X.append(extract_url_features(url))
        y.append(label)
        
    X = np.array(X)
    y = np.array(y)
    
    # Train Logistic Regression Model
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    
    # Save model
    model_path = os.path.join(MODEL_DIR, "url_model.joblib")
    joblib.dump(model, model_path)
    print(f"URL Model saved to {model_path}")
    
def train_message_model():
    print("Training Message Scam Classifier...")
    
    # Dataset of benign (0) and scam (1) messages
    data = [
        # Ham messages (0)
        ("Hey, are we still meeting for lunch today?", 0),
        ("Can you send me the slide deck for the presentation?", 0),
        ("I'm running a bit late, see you in 10 minutes.", 0),
        ("Let's review the code together this afternoon.", 0),
        ("Did you see the new movie that came out last weekend?", 0),
        ("Please remember to buy milk on your way home.", 0),
        ("Happy birthday! Hope you have a wonderful day.", 0),
        ("Thanks for the feedback on my document, I'll update it.", 0),
        ("Let me know when you're free for a quick call.", 0),
        ("The weather is nice today, let's walk outside.", 0),
        
        # Scam messages (1)
        ("URGENT: Your bank account has been locked. Verify identity now at http://fake-bank.xyz", 1),
        ("Congratulations! You won a $1000 Amazon gift card! Click here to claim your reward http://scam-win.info", 1),
        ("Dear user, Netflix billing failed. Update payment method immediately http://fake-netflix.net", 1),
        ("Suspicious transaction detected on your debit card. Call 1-800-FAKE-NUM or log in http://chase-auth.net", 1),
        ("Crypto Wallet Alert: Secure your recovery phrase now to prevent funds lock: http://fake-wallet-auth.com", 1),
        ("You have an unclaimed package from FedEx. Track and pay delivery fee at http://fake-fedex.info", 1),
        ("IRS Notice: You owe $2500 in unpaid taxes. Pay immediately to avoid arrest. Visit http://fake-irs.gov.in", 1),
        ("Your WhatsApp account will be deleted in 24 hours. Verify your login code here: http://fake-wa.xyz", 1)
    ]
    
    texts = [item[0] for item in data]
    labels = [item[1] for item in data]
    
    # Text vectorization using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    X = vectorizer.fit_transform(texts)
    y = np.array(labels)
    
    # Train Naive Bayes Classifier
    model = MultinomialNB()
    model.fit(X, y)
    
    # Save model and vectorizer
    model_path = os.path.join(MODEL_DIR, "message_model.joblib")
    vectorizer_path = os.path.join(MODEL_DIR, "message_vectorizer.joblib")
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print(f"Message Model saved to {model_path}")
    print(f"Message Vectorizer saved to {vectorizer_path}")

if __name__ == "__main__":
    train_url_model()
    train_message_model()
    print("All models trained successfully!")
