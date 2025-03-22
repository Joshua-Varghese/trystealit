document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    document.getElementById('usernameDisplay').textContent = username ? `Welcome, ${username}` : 'Welcome, Guest';

    document.querySelector('.signout-button').addEventListener('click', signOut);
    document.getElementById('saveCredentialsButton').addEventListener('click', saveCredentials);

    function signOut() {
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }

    function showAlert(message, type = 'danger') {
        const alertDiv = document.getElementById('alertMessage');
        alertDiv.className = `alert alert-${type} position-fixed`;
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';

        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    }

    function saveCredentials() {
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const newOrganization = document.getElementById('newOrganization').value.trim();

        if (!newUsername || !newPassword || !newOrganization) {
            showAlert('All fields are required!');
            return;
        }

        const creationDate = new Date().toLocaleString();
        const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
        credentials.push({ username: newUsername, password: newPassword, organization: newOrganization, date: creationDate });
        localStorage.setItem('credentials', JSON.stringify(credentials));
        showAlert('Credentials saved!', 'success');
        $('#addCredentialsModal').modal('hide');
        displayCredentials();
    }

    function displayCredentials() {
        const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
        const credentialsUl = document.getElementById('credentialsUl');
        credentialsUl.innerHTML = '';
        credentials.forEach((cred, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            const header = document.createElement('div');
            header.className = 'd-flex justify-content-between align-items-center';
            header.style.cursor = 'pointer';

            const organizationSpan = document.createElement('span');
            organizationSpan.textContent = cred.organization;
            organizationSpan.setAttribute('data-toggle', 'collapse');
            organizationSpan.setAttribute('data-target', `#collapse${index}`);

            header.appendChild(organizationSpan);

            const collapseDiv = document.createElement('div');
            collapseDiv.className = 'collapse';
            collapseDiv.id = `collapse${index}`;

            const details = document.createElement('div');
            details.className = 'mt-2 text-center';
            details.innerHTML = `<strong>Username:</strong> ${cred.username}<br><strong>Password:</strong> ${cred.password}<br><strong>Created on:</strong> ${cred.date}`;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'mt-2';

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function(event) {
                event.stopPropagation();
                credentials.splice(index, 1);
                localStorage.setItem('credentials', JSON.stringify(credentials));
                displayCredentials();
            };

            const updateButton = document.createElement('button');
            updateButton.className = 'btn btn-secondary ml-2';
            updateButton.textContent = 'Update Info';
            updateButton.onclick = function(event) {
                event.stopPropagation();
                currentCredentialIndex = index;
                $('#updatePasswordModal').modal('show');
            };

            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(updateButton);

            details.appendChild(buttonContainer);
            collapseDiv.appendChild(details);

            li.appendChild(header);
            li.appendChild(collapseDiv);
            credentialsUl.appendChild(li);
        });
    }

    // Display credentials on page load
    displayCredentials();
});

let currentCredentialIndex = null;

function showSecurityInfo() {
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    let securityInfoHTML = '<div class="row">';

    credentials.forEach((cred, index) => {
        securityInfoHTML += `
            <div class="col-md-3">
                <div class="card bg-light mb-3">
                    <div class="card-header text-dark" data-toggle="collapse" data-target="#securityCollapse${index}" aria-expanded="false" aria-controls="securityCollapse${index}">
                        <strong>Organization:</strong> ${cred.organization}
                    </div>
                    <div id="securityCollapse${index}" class="collapse">
                        <div class="card-body text-dark">
                            <strong>Username:</strong> ${cred.username}<br>
                            <strong>Password:</strong> ${cred.password}<br>
                            <strong>Created on:</strong> ${cred.date}
                        </div>
                    </div>
                </div>
            </div>`;
    });

    securityInfoHTML += '</div>';

    const credentialsList = document.getElementById('credentialsList');
    credentialsList.innerHTML = securityInfoHTML;
    credentialsList.style.display = 'block';
}

function checkPasswordStrength() {
    const credentialsList = document.getElementById('credentialsList');
    credentialsList.style.display = 'block';
    displayCredentials();
}

function searchCredentials() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const credentialsUl = document.getElementById('credentialsUl');
    const items = credentialsUl.getElementsByTagName('li');

    Array.from(items).forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchInput) ? '' : 'none';
    });
}

function manageOrganizations() {
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    const organizations = [...new Set(credentials.map(cred => cred.organization))];
    let orgHTML = '<div class="row">';

    organizations.forEach((org, orgIndex) => {
        orgHTML += `
            <div class="col-md-3">
                <div class="card bg-primary text-dark mb-3">
                    <div class="card-header text-dark" data-toggle="collapse" data-target="#orgCollapse${orgIndex}" aria-expanded="false" aria-controls="orgCollapse${orgIndex}">
                        ${org}
                    </div>
                    <div id="orgCollapse${orgIndex}" class="collapse">
                        <div class="card-body text-dark">
                            <ul class="list-group">
                                ${credentials.filter(cred => cred.organization === org).map((cred, credIndex) => `
                                    <li class="list-group-item text-dark">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span><strong>Username:</strong> ${cred.username}</span>
                                            <button class="btn btn-link" data-toggle="collapse" data-target="#credCollapse${orgIndex}-${credIndex}">
                                                <i class="fas fa-chevron-down"></i>
                                            </button>
                                        </div>
                                        <div id="credCollapse${orgIndex}-${credIndex}" class="collapse">
                                            <div class="mt-2">
                                                <strong>Password:</strong> ${cred.password}<br>
                                                <strong>Created on:</strong> ${cred.date}
                                            </div>
                                        </div>
                                    </li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    orgHTML += '</div>';

    const orgList = document.getElementById('organizationList');
    orgList.innerHTML = orgHTML;
    document.getElementById('organizationSection').style.display = 'block';
}

function getColor(index) {
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];
    return colors[index % colors.length];
}

function displayCredentialsForOrganization(org) {
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    const filteredCredentials = credentials.filter(cred => cred.organization === org);
    const credentialsUl = document.getElementById('organizationCredentialsUl');
    credentialsUl.innerHTML = '';

    filteredCredentials.forEach(cred => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `<strong>Username:</strong> ${cred.username}<br><strong>Password:</strong> ${cred.password}<br><strong>Created on:</strong> ${cred.date}`;
        credentialsUl.appendChild(li);
    });
}

async function reviewPrivacy() {
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    let resultsHTML = '<div class="row">';

    credentials.forEach((cred, index) => {
        const password = cred.password;
        let rating = 'Critical';
        let alertClass = 'alert-danger';

        const lengthCriteria = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const varietyCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

        if (lengthCriteria && varietyCount >= 3) {
            rating = 'Strong';
            alertClass = 'alert-success';
        } else if (lengthCriteria && varietyCount === 2) {
            rating = 'Moderate';
            alertClass = 'alert-info';
        } else if (password.length >= 6 && varietyCount >= 2) {
            rating = 'High';
            alertClass = 'alert-warning';
        }

        resultsHTML += `
            <div class="col-md-3">
                <div class="card ${alertClass} mb-3">
                    <div class="card-header text-dark" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        <strong>Username:</strong> ${cred.username}
                    </div>
                    <div id="collapse${index}" class="collapse">
                        <div class="card-body text-dark">
                            <strong>Password Strength:</strong> ${rating}
                            ${rating === 'Critical' ? `<button class="btn btn-danger mt-2" onclick="triggerUpdatePassword(${index})">Change Password</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
    });

    resultsHTML += '</div>';

    const resultsContainer = document.getElementById('passwordStrengthResults');
    resultsContainer.innerHTML = resultsHTML;
}

function triggerUpdatePassword(index) {
    currentCredentialIndex = index;
    $('#updatePasswordModal').modal('show');
}

document.getElementById('saveUpdatedPasswordButton').addEventListener('click', function() {
    const updatedPassword = document.getElementById('updatedPassword').value.trim();
    if (updatedPassword && currentCredentialIndex !== null) {
        const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
        credentials[currentCredentialIndex].password = updatedPassword;
        localStorage.setItem('credentials', JSON.stringify(credentials));
        $('#updatePasswordModal').modal('hide');
        showAlert('Password updated successfully!', 'success');
        displayCredentials();
    } else {
        showAlert('Please enter a new password.', 'danger');
    }
});

function showInfo() {
    const credentialsList = document.getElementById('credentialsList');
    credentialsList.style.display = 'block';
    displayCredentials();
}

