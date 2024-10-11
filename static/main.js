document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value.trim();
    if (query === '') {
        alert('Please enter a valid query');
        return;
    }
    
    console.log('Query submitted:', query); 
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => {
        console.log('Response received:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data); 

        if (!data.documents || !data.similarities || !data.indices) {
            throw new Error('Invalid response format');
        }

        displayResults(data);
        displayChart(data);
    })
    .catch(error => {
        console.error('Error in AJAX request:', error);
        document.getElementById('results').innerHTML = 'Error processing your request. Please try again.';
    });
});


function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';

    if (!data.documents.length) {
        resultsDiv.innerHTML += '<p>No matching documents found.</p>';
        return;
    }

    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}


function displayChart(data) {
    // Input: data (object) - contains the following keys:
    //        - documents (list) - list of documents
    //        - indices (list) - list of indices   
    //        - similarities (list) - list of similarities
    // TODO: Implement function to display chart here
    //       There is a canvas element in the HTML file with the id 'similarity-chart'
    try {
        console.log("Chart data received:", data);
    
        if (!data.similarities || !data.indices) {
            throw new Error("Chart data is missing required fields");
        }
    
        if (!Array.isArray(data.similarities) || !Array.isArray(data.indices)) {
            throw new Error("Chart data similarities or indices are not arrays.");
        }
    
        console.log("Similarities array:", data.similarities);
        console.log("Indices array:", data.indices);
    
        if (data.similarities.length !== data.indices.length) {
            throw new Error("Mismatch between length of similarities and indices.");
        }
    
        for (let i = 0; i < data.similarities.length; i++) {
            if (typeof data.similarities[i] !== 'number' || isNaN(data.similarities[i])) {
                throw new Error(`Invalid value in similarities at index ${i}: ${data.similarities[i]}`);
            }
        }
    
        let canvasElement = document.getElementById('similarity-chart');
        if (!canvasElement) {
            throw new Error("Canvas element with ID 'similarity-chart' not found.");
        }
    
        let ctx = canvasElement.getContext('2d');
        if (!ctx) {
            throw new Error("Failed to get the context of the canvas element.");
        }
    
        if (window.similarityChart) {
            window.similarityChart.destroy();
        }
    
        console.log("Creating the chart...");
    
        window.similarityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.indices.map(index => `Document ${index}`),
                datasets: [{
                    label: 'Cosine Similarity',
                    data: data.similarities,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    
        console.log("Chart created successfully");
    } catch (error) {
        console.error('Error in displayChart:', error);
        document.getElementById('results').innerHTML += '<p>Error generating chart. Please try again.</p>';
    }
}
    
document.addEventListener("DOMContentLoaded", function() {
        console.log("DOM fully loaded and parsed");
    });
    
