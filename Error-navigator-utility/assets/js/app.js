document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');
    const logoutButton = document.getElementById('logoutButton');
    const backButton = document.getElementById('backButton');
    const searchButton = document.getElementById('searchButton');
    const updateButton = document.getElementById('updateButton');
    const deleteButton = document.getElementById('deleteButton');
    const refNameSelect = document.getElementById('ref_name');  

    if (submitButton) {
        submitButton.addEventListener('click', validateForm);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', navigateToLogOut);
    }
    if (backButton) {
        backButton.addEventListener('click', goBackToSearch);
    }
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    if (updateButton) {
        updateButton.addEventListener('click', performUpdate);
    }
    if (deleteButton) {
        deleteButton.addEventListener('click', performDelete);
    }
    if (refNameSelect) {
        refNameSelect.addEventListener('change', updateInputField);  
    }
});

let loginAttempts = 0;
const maxAttempts = 3;
const lockoutTime = 30000;

function validateStaffid(staffid) {
    const regex = /^\d{8}$/;
    return regex.test(staffid);
};

function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#()^|])[A-Za-z\d@$!%*?&#()^|]{12,}$/;
    return regex.test(password);
};

function sanitizeStaffid(staffid) {
    return staffid.replace(/[&<>"'/]/g, function (char) {
        switch (char) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            case '/': return '&#x2F;';
            default: return char;
        }
    });
};

function validateForm() {
    const rawStaffid = document.getElementById('staffid').value;
    const rawPassword = document.getElementById('password').value;
    const staffid = sanitizeStaffid(rawStaffid);
    const password = rawPassword;
    const staffidError = document.getElementById('staffidError');
    const passwordError = document.getElementById('passwordError');

    let valid = true;

    if (!validateStaffid(staffid)) {
        staffidError.textContent = 'Staff ID must be 8 digits long';
        valid = false;
    } else {
        staffidError.textContent = '';
    }

    if (!validatePassword(password)) {
        passwordError.textContent = 'Password must be at least 12 characters long, containing letters, numbers,and at least one special character.';
        valid = false;
    } else {
        passwordError.textContent = '';
    }
    if (valid) {
        if (loginAttempts >= maxAttempts) {
            alert('Too many failed login attempts. Please try again later.');
            return false; 
        }
        loginAttempts++;
        setTimeout(() => { loginAttempts = 0; }, lockoutTime);

        console.log('Sending headers:', { staffid: staffid, password: password });

        fetch('/auth/login', {
            method: 'POST',
            headers: { staffid: staffid, password: password }
        }).then(response =>  {
            if (!response.ok) {
                throw new Error('HTTP error! Status: ' + response.status);
            }
            return response.json();
        }).then(data => {
            console.log(data);
            localStorage.setItem('accessToken', data.accessToken);
            window.location.href = '/search';
        }).catch(error => {
            console.log('Error logging in:', error);
            alert('Error logging in. Please try again.');
        });
        return true; 
        }
    return false; 
};  

function updateInputField() {
    const refName = document.getElementById('ref_name').value;
    const refValue = document.getElementById('ref_value');

    if (refName === 'F20') {
        refValue.placeholder = "Enter F20";
        refValue.pattern = "[A-Za-z0-9]{16}"; 
    } else if (refName === 'MSGID') {
        refValue.placeholder = "Enter MSGID";
        refValue.pattern = "[A-Za-z0-9]{15,50}";  
    } else if (refName === 'UETR') {
        refValue.placeholder = "Enter UETR";
        refValue.pattern = "[a-fA-F0-9\\-]{36}";  
    } else {
        refValue.placeholder = "Enter value";
        refValue.pattern = "";  
    }
};
function performSearch(event) {
    event.preventDefault();

    const refName = document.getElementById('ref_name').value;
    const refValue = document.getElementById('ref_value').value;
    const createdDate = document.getElementById('createddate').value;
    const accessToken = localStorage.getItem('accessToken');
    console.log(accessToken);

    fetch(`/transactions?ref_name=${refName}&ref_value=${refValue}&createddate=${createdDate}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Search result:', data);

        if (data.length > 0) {
            localStorage.setItem('searchResults', JSON.stringify(data));  
            window.location.href = '/result'; 
        } else {
            alert('No results found.');
        }
    })
    .catch(error => {
        console.error('Error during search:', error);
    });
};

function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken'); // Retrieve the refresh token

    return fetch('/auth/refresh-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-refresh-token': refreshToken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }
        return response.json();
    })
    .then(data => {
        const newAccessToken = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken); // Store the new token
        return newAccessToken;
    });
};

function performDelete(event) {
    const refName = document.getElementById('ref_name').value;
    const refValue = document.getElementById('ref_value').value;
    const createdDate = document.getElementById('createddate').value;
    const accessToken = localStorage.getItem('accessToken'); // Retrieve JWT token
    console.log(accessToken);

    fetch(`/transactions/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ref_name: refName, ref_value: refValue, createddate: createdDate })
    }).then(response => response.json())
    .then(data => {
        console.log('Delete result:', data);
    }).catch(error => {
        console.error('Error during delete:', error);
    });
};

// Function to perform Update
function performUpdate(event) {
    const refName = document.getElementById('ref_name').value;
    const refValue = document.getElementById('ref_value').value;
    const createdDate = document.getElementById('date').value;
    const eventDesc = document.getElementById('event_desc').value;
    const rootCause = document.getElementById('root_cause').value;
    const accessToken = localStorage.getItem('accessToken'); // Retrieve JWT token

    fetch(`/transactions/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ref_name: refName, ref_value: refValue, createddate: createdDate, event_desc: eventDesc, root_cause: rootCause })
    }).then(response => response.json())
    .then(data => {
        console.log('Update result:', data);
    }).catch(error => {
        console.error('Error during update:', error);
    });
};


document.addEventListener('DOMContentLoaded', function() {
    // Get the search results from localStorage
    const results = JSON.parse(localStorage.getItem('searchResults'));

    // Get the result-area container
    const resultContainer = document.getElementById('result-area');

    // Check if the resultContainer exists in the DOM
    if (resultContainer && results && results.length > 0) {
        // Clear the container before appending new results
        resultContainer.innerHTML = '';

        // Loop through results and render them
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <p><strong>Reference Name:</strong> ${result.ref_name}</p>
                <p><strong>Reference Value:</strong> ${result.ref_value}</p>
                <p><strong>Date:</strong> ${result.createddate}</p>
                <p><strong>Event Description:</strong> ${result.event_desc}</p>
                <p><strong>Root Cause:</strong> ${result.root_cause}</p>
            `;
            resultContainer.appendChild(resultItem);
        });
    } else {
        // If no results are found, show a 'No results' message
        if (resultContainer) {
            resultContainer.innerHTML = '<p>No results found</p>';
        }
    }
});


function goBackToSearch() {
    const refName = "<%= transactions[0].messegid ? 'MSGID' : 'F20' %>";
    const refValue = "<%= transactions[0].messegid || transactions[0].F20 %>";
    const createdDate = "<%= new Date(transactions[0].createddate).toISOString().split('T')[0] %>";

    const url = `/search?ref_name=${refName}&ref_value=${refValue}&createddate=${createdDate}`;

    window.location.href = url;
};

document.addEventListener('DOMContentLoaded', function() {
    const queryParams = new URLSearchParams(window.location.search);
    const refName = queryParams.get('ref_name');
    const refValue = queryParams.get('ref_value');
    const createdDate = queryParams.get('createddate');

    if (refName) {
        document.getElementById('ref_name').value = refName;
        updateInputField();
    }
    if (refValue) {
        document.getElementById('ref_value').value = refValue;
    }
    if (createdDate) {
        document.getElementById('createddate').value = createdDate;
    }
});

function navigateToSearch(event) {
    window.location.href ='/search';   
};
function navigateToLogOut(event) {
    fetch('close-connection', { 
        method: 'POST'
    }).then(response => {
        alert("You are logged out.");
        window.location.href = '/index';
    }).catch(error => {
        console.error('Error closing connection', error);
        alert("Error logging out, but you are still logged out.");
        window.location.href = '/index';
        });
};