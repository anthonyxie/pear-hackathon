// static/js/main.js

// Store surveys in local storage
let surveys = JSON.parse(localStorage.getItem('surveys') || '[]');

// DOM elements
const surveyForm = document.getElementById('survey-form');
const surveyList = document.getElementById('survey-list');
const apiLog = document.getElementById('api-log');
const clearLogBtn = document.getElementById('clear-log');
const apiStatus = document.getElementById('api-status');
const claudeStatus = document.getElementById('claude-status');
const surveyModal = new bootstrap.Modal(document.getElementById('surveyModal'));
const surveyDetails = document.getElementById('survey-details');

// Initialize the dashboard
function init() {
    // Check API connection
    fetch('/health')
        .then(response => {
            if (response.ok) {
                apiStatus.textContent = 'Connected';
                apiStatus.className = 'badge bg-success';
            } else {
                apiStatus.textContent = 'Error';
                apiStatus.className = 'badge bg-danger';
            }
            return response.json();
        })
        .catch(error => {
            apiStatus.textContent = 'Disconnected';
            apiStatus.className = 'badge bg-danger';
            logToConsole('API Error', error);
        });
    
    // Populate recent surveys
    updateSurveyList();
}

// Log API activities
function logToConsole(title, data) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<strong>${timestamp} - ${title}:</strong>`;
    
    const logContent = document.createElement('div');
    if (typeof data === 'object') {
        logContent.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
        logContent.textContent = data;
    }
    
    logEntry.appendChild(logContent);
    apiLog.appendChild(logEntry);
    apiLog.scrollTop = apiLog.scrollHeight;
}

// Update the survey list
function updateSurveyList() {
    surveyList.innerHTML = '';
    
    if (surveys.length === 0) {
        surveyList.innerHTML = '<li class="list-group-item">No surveys generated yet</li>';
        return;
    }
    
    // Sort surveys by creation time (newest first)
    surveys.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    surveys.forEach((survey, index) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const title = document.createElement('span');
        title.textContent = survey.title || `Survey ${index + 1}`;
        
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-outline-primary';
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => viewSurvey(survey);
        
        item.appendChild(title);
        item.appendChild(viewBtn);
        surveyList.appendChild(item);
    });
}

// Generate a survey from form data
function generateSurvey(formData) {
    logToConsole('Generating survey', formData);
    
    fetch('/api/surveys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        logToConsole('Survey generated', data);
        
        // Add timestamp
        data.createdAt = new Date().toISOString();
        
        // Save to local storage
        surveys.unshift(data);
        localStorage.setItem('surveys', JSON.stringify(surveys));
        
        // Update UI
        updateSurveyList();
        claudeStatus.textContent = 'Working';
        claudeStatus.className = 'badge bg-success';
        
        // Show the survey
        viewSurvey(data);
    })
    .catch(error => {
        logToConsole('Error', error.message);
        claudeStatus.textContent = 'Error';
        claudeStatus.className = 'badge bg-danger';
    });
}

// Display a survey in the modal
function viewSurvey(survey) {
    document.getElementById('surveyModalLabel').textContent = survey.title || 'Survey Details';
    
    let html = `
        <div class="mb-4">
            <h5>Basic Information</h5>
            <table class="table table-sm">
                <tr>
                    <th>ID</th>
                    <td>${survey.id}</td>
                </tr>
                <tr>
                    <th>Type</th>
                    <td>${survey.type}</td>
                </tr>
                <tr>
                    <th>Description</th>
                    <td>${survey.description}</td>
                </tr>
            </table>
        </div>
    `;
    
    survey.sections.forEach(section => {
        html += `
            <div class="card mb-3">
                <div class="card-header">
                    <h5 class="mb-0">${section.name}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${section.description}</p>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th style="width: 5%">#</th>
                                    <th style="width: 55%">Question</th>
                                    <th style="width: 15%">Type</th>
                                    <th style="width: 25%">Options</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        if (section.questions && section.questions.length > 0) {
            section.questions.forEach((question, index) => {
                const options = question.options 
                    ? question.options.join(', ') 
                    : '-';
                    
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${question.text}</td>
                        <td><span class="badge bg-info">${question.type.replace('_', ' ')}</span></td>
                        <td>${options}</td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr>
                    <td colspan="4" class="text-center">No questions available</td>
                </tr>
            `;
        }
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });
    
    surveyDetails.innerHTML = html;
    surveyModal.show();
}

// Event listeners
surveyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const formData = {
        acquiringCompany: document.getElementById('acquiringCompany').value,
        targetCompany: document.getElementById('targetCompany').value,
        surveyType: document.getElementById('surveyType').value,
        productCategories: document.getElementById('productCategories').value
            .split(',')
            .map(cat => cat.trim())
            .filter(cat => cat.length > 0)
    };
    
    generateSurvey(formData);
});

clearLogBtn.addEventListener('click', function() {
    apiLog.innerHTML = '';
});

// Initialize
document.addEventListener('DOMContentLoaded', init);