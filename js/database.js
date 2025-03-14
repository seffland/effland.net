document.addEventListener('DOMContentLoaded', function() {
    const API_ENDPOINT = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ? 
                        'http://localhost:3001/api/database' : 
                        '/api/database';
    
    // Fixed table name for all operations
    const TABLE_NAME = 'effland-net';
    
    const dbStatus = document.getElementById('db-status');
    const tableContainer = document.getElementById('table-container');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    const tableLoading = document.getElementById('table-loading');
    const noData = document.getElementById('no-data');
    const insertBtn = document.getElementById('insert-btn');
    const insertLoading = document.getElementById('insert-loading');
    const insertError = document.getElementById('insert-error');
    const deleteBtn = document.getElementById('delete-btn');

    // Check database connection
    fetch(`${API_ENDPOINT}/status`)
        .then(async response => {
            if (!response.ok) {
                // If response isn't OK, try to read the text content
                const text = await response.text();
                throw new Error(`Server responded with ${response.status}: ${text}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.connected) {
                dbStatus.innerHTML = `
                    <div class="flex items-center">
                        <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <p>Connected to database</p>
                    </div>
                `;
                // Load table data immediately since we have a fixed table
                loadTableData();
                // Set up the insert form with the known columns
                setupInsertForm();
            } else {
                dbStatus.innerHTML = `
                    <div class="flex items-center">
                        <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        <p>Database connection failed: ${data.error || 'Unknown error'}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error("API Endpoint Error:", error);
            console.log("API_ENDPOINT used:", API_ENDPOINT);
            dbStatus.innerHTML = `
                <div class="flex items-center">
                    <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <p>API Endpoint Error: ${error.message}</p>
                </div>
            `;
        });

    // Load effland-net table data
    function loadTableData() {
        tableLoading.classList.remove('hidden');
        tableContainer.classList.remove('hidden');
        noData.classList.add('hidden');

        fetch(`${API_ENDPOINT}/table/${TABLE_NAME}`)
            .then(response => response.json())
            .then(data => {
                tableLoading.classList.add('hidden');
                
                if (data.error) {
                    noData.textContent = data.error;
                    noData.classList.remove('hidden');
                    tableHeader.innerHTML = '';
                    tableBody.innerHTML = '';
                    return;
                }

                if (data.rows && data.rows.length > 0) {
                    // Create table header - we know the columns, but let's use the API data to be safe
                    const columns = Object.keys(data.rows[0]);
                    tableHeader.innerHTML = `
                        <tr>
                            ${columns.map(col => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col}</th>`).join('')}
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    `;

                    // Create table body with delete button for each row
                    tableBody.innerHTML = data.rows.map(row => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                            ${columns.map(col => `<td class="px-6 py-4 whitespace-nowrap text-sm">${row[col] !== null ? row[col] : '<span class="text-gray-400">null</span>'}</td>`).join('')}
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button class="delete-row-btn text-red-600 hover:text-red-900" data-id="${row.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('');

                    // Add event listeners to all delete buttons
                    document.querySelectorAll('.delete-row-btn').forEach(button => {
                        button.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            deleteRow(id);
                        });
                    });
                } else {
                    noData.textContent = 'No data available in the table';
                    noData.classList.remove('hidden');
                    tableHeader.innerHTML = '';
                    tableBody.innerHTML = '';
                }
            })
            .catch(error => {
                tableLoading.classList.add('hidden');
                noData.textContent = `Error loading table data: ${error.message}`;
                noData.classList.remove('hidden');
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';
            });
    }

    // Set up the insert form with the known columns
    function setupInsertForm() {
        const insertForm = document.getElementById('insert-form');
        insertForm.innerHTML = '';

        // Create field for DATA (we don't need fields for id and created_on since they're auto-generated)
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="DATA" class="block font-bold mb-2 dark:text-white">Data</label>
            <textarea id="DATA" name="DATA" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="4"></textarea>
        `;
        insertForm.appendChild(formGroup);
    }

    // Handle form submission to construct and execute the INSERT statement
    insertBtn.addEventListener('click', function(event) {
        event.preventDefault();

        const dataValue = document.getElementById('DATA').value.trim();
        
        if (!dataValue) {
            insertError.textContent = "Please enter some data";
            insertError.classList.remove('hidden');
            return;
        }

        const query = `INSERT INTO "${TABLE_NAME}" (DATA) VALUES ('${dataValue.replace(/'/g, "''")}')`; // Escape single quotes for SQL

        insertLoading.classList.remove('hidden');
        insertError.classList.add('hidden');

        fetch(`${API_ENDPOINT}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
            .then(response => response.json())
            .then(data => {
                insertLoading.classList.add('hidden');

                if (data.error) {
                    insertError.textContent = data.error;
                    insertError.classList.remove('hidden');
                    return;
                }

                // Clear the form after successful insert
                document.getElementById('insert-form').reset();
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'mt-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800';
                successMsg.textContent = 'Row inserted successfully';
                document.getElementById('insert-form').appendChild(successMsg);
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMsg.remove();
                }, 3000);
                
                // Refresh table data to show the newly added row
                loadTableData();
            })
            .catch(error => {
                insertLoading.classList.add('hidden');
                insertError.textContent = `Error inserting row: ${error.message}`;
                insertError.classList.remove('hidden');
            });
    });

    // Function to delete a row by id
    function deleteRow(id) {
        if (!confirm(`Are you sure you want to delete row with ID ${id}?`)) {
            return;
        }

        const query = `DELETE FROM "${TABLE_NAME}" WHERE id = ${id}`;
        
        fetch(`${API_ENDPOINT}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Error deleting row: ${data.error}`);
                    return;
                }

                // Refresh table data
                loadTableData();
            })
            .catch(error => {
                alert(`Error deleting row: ${error.message}`);
            });
    }
});