document.addEventListener('DOMContentLoaded', function() {
    const API_ENDPOINT = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ? 
                        'http://localhost:3001/api/database' : 
                        '/api/database';
    
    // Fixed table name for all operations - using constant to avoid typos
    const TABLE_NAME = 'effland_net';
    
    // Get DOM elements
    const dbStatus = document.getElementById('db-status');
    const tableContainer = document.getElementById('table-container');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    const tableLoading = document.getElementById('table-loading');
    const noData = document.getElementById('no-data');
    const insertBtn = document.getElementById('insert-btn');
    const insertLoading = document.getElementById('insert-loading');
    const insertError = document.getElementById('insert-error');

    // Set up the insert form immediately - no need to wait for API
    setupInsertForm();
    
    // Check database connection
    fetch(`${API_ENDPOINT}/status`)
        .then(async response => {
            if (!response.ok) {
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
                
                // Check the table structure to debug the timestamp issue
                checkTableStructure();
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
        
    // Debug function to check table structure
    function checkTableStructure() {
        fetch(`${API_ENDPOINT}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                query: `SELECT column_name, data_type, column_default, is_nullable 
                        FROM information_schema.columns 
                        WHERE table_name = '${TABLE_NAME}'` 
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Table Structure for " + TABLE_NAME + ":", data);
        })
        .catch(error => {
            console.error("Error fetching table structure:", error);
        });
    }
    
    // Debug function - check table structure
    fetch(`${API_ENDPOINT}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            query: 'SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = \'public\'' 
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log("Database Schema:", data);
        })
        .catch(error => {
            console.error("Error fetching schema:", error);
        });

    // Load effland_net table data
    function loadTableData() {
        console.log("Fetching table data from:", `${API_ENDPOINT}/table/${TABLE_NAME}`);
        
        // Make sure all necessary DOM elements exist before using them
        if (!tableLoading || !tableContainer || !noData) {
            console.error("Required DOM elements not found for table display");
            return;
        }
        
        tableLoading.classList.remove('hidden');
        tableContainer.classList.remove('hidden');
        noData.classList.add('hidden');

        fetch(`${API_ENDPOINT}/table/${TABLE_NAME}`)
            .then(async response => {
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Server error response:", errorText);
                    throw new Error(`Server responded with ${response.status}: ${errorText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data received:", data);
                
                if (!tableLoading || !tableHeader || !tableBody || !noData) {
                    console.error("Required DOM elements not found for displaying table data");
                    return;
                }
                
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
                console.error("Error loading table data:", error);
                
                if (tableLoading && noData) {
                    tableLoading.classList.add('hidden');
                    noData.textContent = `Error loading table data: ${error.message}`;
                    noData.classList.remove('hidden');
                }
                
                if (tableHeader && tableBody) {
                    tableHeader.innerHTML = '';
                    tableBody.innerHTML = '';
                }
            });
    }

    // Set up the insert form with the known columns
    function setupInsertForm() {
        const insertForm = document.getElementById('insert-form');
        if (!insertForm) {
            console.error("Insert form element not found");
            return;
        }
        
        insertForm.innerHTML = '';

        // Create field for DATA (we don't need fields for id and created_on since they're auto-generated)
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="DATA" class="block font-bold mb-2 dark:text-white">Data</label>
            <textarea id="DATA" name="DATA" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="4"></textarea>
        `;
        insertForm.appendChild(formGroup);
        console.log("Insert form set up successfully");
    }

    // Handle form submission to construct and execute the INSERT statement
    if (insertBtn) {
        insertBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            const dataField = document.getElementById('DATA');
            if (!dataField) {
                console.error("DATA field not found");
                return;
            }

            const dataValue = dataField.value.trim();
            
            if (!dataValue) {
                if (insertError) {
                    insertError.textContent = "Please enter some data";
                    insertError.classList.remove('hidden');
                }
                return;
            }

            // First, let's try to fix the created_on column default if needed
            const alterTableQuery = `ALTER TABLE ${TABLE_NAME} ALTER COLUMN created_on SET DEFAULT CURRENT_TIMESTAMP`;
            
            fetch(`${API_ENDPOINT}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: alterTableQuery }),
            })
            .then(response => {
                console.log("Attempted to set default value for created_on column");
                // Continue with insert regardless of success/failure of the ALTER TABLE
                
                // For the insert, we'll now use a simpler approach without specifying the created_on column
                // This will use the default value we just set
                const query = `INSERT INTO "${TABLE_NAME}" (data) VALUES ('${dataValue.replace(/'/g, "''")}')`;
                console.log("Generated query:", query);

                if (insertLoading && insertError) {
                    insertLoading.classList.remove('hidden');
                    insertError.classList.add('hidden');
                }

                return fetch(`${API_ENDPOINT}/query`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });
            })
            .then(async response => {
                const responseText = await response.text();
                console.log("Raw server response:", responseText);
                
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}: ${responseText}`);
                }
                
                // Parse the JSON response after we've logged the raw text
                return JSON.parse(responseText);
            })
            .then(data => {
                if (insertLoading) {
                    insertLoading.classList.add('hidden');
                }

                if (data.error) {
                    if (insertError) {
                        insertError.textContent = `Error: ${data.error}`;
                        if (data.details) {
                            insertError.textContent += ` (${data.details})`;
                        }
                        insertError.classList.remove('hidden');
                    }
                    return;
                }

                // Clear the form after successful insert
                const insertForm = document.getElementById('insert-form');
                if (insertForm) {
                    insertForm.reset();
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'mt-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800';
                    successMsg.textContent = 'Row inserted successfully';
                    insertForm.appendChild(successMsg);
                    
                    // Remove success message after 3 seconds
                    setTimeout(() => {
                        successMsg.remove();
                    }, 3000);
                }
                
                // Refresh table data to show the newly added row
                loadTableData();
            })
            .catch(error => {
                console.error("Error inserting row:", error);
                if (insertLoading) {
                    insertLoading.classList.add('hidden');
                }
                if (insertError) {
                    insertError.innerHTML = `<p>Error inserting row: ${error.message}</p>`;
                    
                    // Add try again button
                    const tryAgainBtn = document.createElement('button');
                    tryAgainBtn.className = 'mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600';
                    tryAgainBtn.textContent = 'Try Again';
                    tryAgainBtn.onclick = function() {
                        insertError.classList.add('hidden');
                    };
                    insertError.appendChild(tryAgainBtn);
                    
                    insertError.classList.remove('hidden');
                }
            });
        });
    } else {
        console.error("Insert button element not found");
    }

    // Function to delete a row by id
    function deleteRow(id) {
        if (!confirm(`Are you sure you want to delete row with ID ${id}?`)) {
            return;
        }

        const query = `DELETE FROM "${TABLE_NAME}" WHERE id = ${id}`;
        console.log("Generated delete query:", query);
        
        fetch(`${API_ENDPOINT}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
            .then(async response => {
                const responseText = await response.text();
                console.log("Raw server response for DELETE:", responseText);
                
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}: ${responseText}`);
                }
                
                // Parse the JSON response after we've logged the raw text
                return JSON.parse(responseText);
            })
            .then(data => {
                if (data.error) {
                    alert(`Error deleting row: ${data.error}`);
                    return;
                }

                // Refresh table data
                loadTableData();
            })
            .catch(error => {
                console.error("Error deleting row:", error);
                alert(`Error deleting row: ${error.message}`);
            });
    }
});