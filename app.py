from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords
import ssl
import traceback

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('stopwords')

app = Flask(__name__)

newsgroups = fetch_20newsgroups(subset='all')
vectorizer = TfidfVectorizer(stop_words=stopwords.words('english'))
X = vectorizer.fit_transform(newsgroups.data)
svd = TruncatedSVD(n_components=50) 
X_reduced = svd.fit_transform(X)

def search_engine(query):
    if not query.strip():
        print("Empty query received.")
        return [], [], []

    try:
        print("search_engine called with query:", query)
        
        query_vec = vectorizer.transform([query])
        print("Vectorized query shape:", query_vec.shape)

        query_reduced = svd.transform(query_vec)
        print("Reduced query shape:", query_reduced.shape)

        similarities = cosine_similarity(query_reduced, X_reduced)[0]
        print("Cosine similarities:", similarities)

        top_indices = np.argsort(similarities)[-5:][::-1]
        documents = [newsgroups.data[i] for i in top_indices]
        top_similarities = [similarities[i] for i in top_indices]

        print("Top documents found:", documents)
        return documents, top_similarities, top_indices

    except Exception as e:
        print(f"Error in search_engine: {e}")
        return [], [], []


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    try:
        query = request.form['query']
        print(f"Received query: {query}")

        documents, similarities, indices = search_engine(query)
        print(f"Returning documents: {documents}")
        print(f"Similarities: {similarities}")
        print(f"Indices: {indices}")

        similarities = [float(sim) for sim in similarities]
        indices = [int(idx) for idx in indices]

        return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices})
    
    except Exception as e:
        print(f"Error processing query: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Error processing your query'}), 500


if __name__ == '__main__':
    app.run(debug=True)
