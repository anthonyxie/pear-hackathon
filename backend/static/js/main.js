// static/js/main.js

// Store surveys in local storage
let surveys = JSON.parse(localStorage.getItem('surveys') || '[]');

// DOM elements
const surveyForm    = document.getElementById('survey-form');
const surveyList    = document.getElementById('survey-list');
const apiLog        = document.getElementById('api-log');
const clearLogBtn   = document.getElementById('clear-log');
const apiStatus     = document.getElementById('api-status');
const claudeStatus  = document.getElementById('claude-status');
const surveyModal   = new bootstrap.Modal(document.getElementById('surveyModal'));
const surveyDetails = document.getElementById('survey-details');

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
function init() {
    // Check API connection
    fetch('/health')
        .then(response => {
            if (response.ok) {
                apiStatus.textContent = 'Connected';
                apiStatus.className   = 'badge bg-success';
            } else {
                apiStatus.textContent = 'Error';
                apiStatus.className   = 'badge bg-danger';
            }
            return response.json();
        })
        .catch(error => {
            apiStatus.textContent = 'Disconnected';
            apiStatus.className   = 'badge bg-danger';
            logToConsole('API Error', error);
        });

    // Populate recent surveys
    updateSurveyList();
}

// ---------------------------------------------------------------------------
// Utility – Console log helper
// ---------------------------------------------------------------------------
function logToConsole(title, data) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry  = document.createElement('div');
    logEntry.innerHTML = `<strong>${timestamp} – ${title}:</strong>`;

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

// ---------------------------------------------------------------------------
// Survey list sidebar
// ---------------------------------------------------------------------------
function updateSurveyList() {
    surveyList.innerHTML = '';

    if (surveys.length === 0) {
        surveyList.innerHTML =
            '<li class="list-group-item">No surveys generated yet</li>';
        return;
    }

    // Newest first
    surveys.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    surveys.forEach((survey, index) => {
        const item = document.createElement('li');
        item.className =
            'list-group-item d-flex justify-content-between align-items-center';

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

// ---------------------------------------------------------------------------
// Generate survey (POST to backend)
// ---------------------------------------------------------------------------
function generateSurvey(formData) {
    logToConsole('Generating survey', formData);

    fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

            data.createdAt = new Date().toISOString(); // timestamp

            surveys.unshift(data);
            localStorage.setItem('surveys', JSON.stringify(surveys));

            updateSurveyList();
            claudeStatus.textContent = 'Working';
            claudeStatus.className   = 'badge bg-success';

            viewSurvey(data); // open modal
        })
        .catch(error => {
            logToConsole('Error', error.message);
            claudeStatus.textContent = 'Error';
            claudeStatus.className   = 'badge bg-danger';
        });
}

// ---------------------------------------------------------------------------
// Render survey modal
// ---------------------------------------------------------------------------
function viewSurvey(survey) {
    document.getElementById('surveyModalLabel').textContent =
        survey.title || 'Survey Details';

    // ── Basic info ────────────────────────────────────────────────────────
    let html = `
        <div class="mb-4">
            <h5>Basic Information</h5>
            <table class="table table-sm">
                <tr><th>ID</th><td>${survey.id}</td></tr>
                <tr><th>Type</th><td>${survey.type}</td></tr>
                <tr><th>Description</th><td>${survey.description}</td></tr>
            </table>
        </div>
    `;

    // ── Disqualifying criteria (if any) ───────────────────────────────────
    const disqs = survey.disqualifiers || [];
    if (disqs.length) {
        html += `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0 text-danger">Disqualifying criteria</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th style="width:20%">Section</th>
                                    <th style="width:55%">Question</th>
                                    <th style="width:25%">Disqualifying Responses</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${disqs.map(d => `
                                    <tr>
                                        <td>${d.section}</td>
                                        <td>${d.question}</td>
                                        <td>${Array.isArray(d.responses) ? d.responses.join(', ') : d.responses}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // ── Sections & questions ─────────────────────────────────────────────
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
                                    <th style="width:5%">#</th>
                                    <th style="width:55%">Question</th>
                                    <th style="width:15%">Type</th>
                                    <th style="width:25%">Options</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        if (section.questions?.length) {
            section.questions.forEach((q, i) => {
                const opts = q.options ? q.options.join(', ') : '-';
                html += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${q.text}</td>
                        <td><span class="badge bg-info">${q.type.replace('_', ' ')}</span></td>
                        <td>${opts}</td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr><td colspan="4" class="text-center">No questions available</td></tr>
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

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------
surveyForm.addEventListener('submit', e => {
    e.preventDefault();

    // Build form data (includes new Target Audience field)
    const formData = {
        acquiringCompany: document.getElementById('acquiringCompany').value,
        targetCompany:    document.getElementById('targetCompany').value,
        surveyType:       document.getElementById('surveyType').value,
        targetAudience:   document.getElementById('targetAudience').value, // ← NEW
        productCategories: document
            .getElementById('productCategories')
            .value.split(',')
            .map(cat => cat.trim())
            .filter(cat => cat.length > 0)
    };

    generateSurvey(formData);
});

clearLogBtn.addEventListener('click', () => (apiLog.innerHTML = ''));

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', init);
