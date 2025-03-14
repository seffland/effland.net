document.addEventListener('DOMContentLoaded', function() {
    const API_ENDPOINT = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ? 
                        'http://localhost:3001/api/database' : 
                        '/api/database';
    
    const dbStatus = document.getElementById('db-status');
    const tableSelector = document.getElementById('table-selector');
    const tableContainer = document.getElementById('table-container');
    const tableName = document.getElementById('table-name');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    const tableLoading = document.getElementById('table-loading');
    const noData = document.getElementById('no-data');
    const sqlQuery = document.getElementById('sql-query');
    const executeBtn = document.getElementById('execute-btn');
    const queryLoading = document.getElementById('query-loading');
    const queryResult = document.getElementById('query-result');
    const queryHeader = document.getElementById('query-header');
    const queryBody = document.getElementById('query-body');
    const queryError = document.getElementById('query-error');
    const insertBtn = document.getElementById('insert-btn');

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
                loadTablesList();
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

    // Load tables list
    function loadTablesList() {
        fetch(`${API_ENDPOINT}/tables`)
            .then(response => response.json())
            .then(data => {
                tableSelector.innerHTML = '<option value="">Select a table</option>';
                data.tables.forEach(table => {
                    const option = document.createElement('option');
                    option.value = table;
                    option.textContent = table;
                    tableSelector.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading tables:', error);
            });
    }

    // Load table data when a table is selected
    tableSelector.addEventListener('change', function() {
        const selectedTable = this.value;
        if (!selectedTable) {
            tableContainer.classList.add('hidden');
            return;
        }

        tableName.textContent = selectedTable;
        tableLoading.classList.remove('hidden');
        tableContainer.classList.remove('hidden');
        noData.classList.add('hidden');

        fetch(`${API_ENDPOINT}/table/${selectedTable}`)
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
                    // Create table header
                    const columns = Object.keys(data.rows[0]);
                    tableHeader.innerHTML = `
                        <tr>
                            ${columns.map(col => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col}</th>`).join('')}
                        </tr>
                    `;

                    // Create table body
                    tableBody.innerHTML = data.rows.map(row => `
                        <tr class="hover:bg-gray-50">
                            ${columns.map(col => `<td class="px-6 py-4 whitespace-nowrap text-sm">${row[col] !== null ? row[col] : '<span class="text-gray-400">null</span>'}</td>`).join('')}
                        </tr>
                    `).join('');
                } else {
                    noData.textContent = 'No data available in this table';
                    noData.classList.remove('hidden');
                    tableHeader.innerHTML = '';
                    tableBody.innerHTML = '';
                }

                // Load table columns for insert form
                loadTableColumns(selectedTable);
            })
            .catch(error => {
                tableLoading.classList.add('hidden');
                noData.textContent = `Error loading table data: ${error.message}`;
                noData.classList.remove('hidden');
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';
            });
    });

    // Execute custom SQL query
    executeBtn.addEventListener('click', function() {
        const query = sqlQuery.value.trim();
        if (!query) return;

        // Only allow INSERT statements for security
        if (!query.toLowerCase().startsWith('insert')) {
            queryError.textContent = 'Only INSERT statements are allowed for security reasons';
            queryError.classList.remove('hidden');
            queryResult.classList.remove('hidden');
            return;
        }

        queryLoading.classList.remove('hidden');
        queryError.classList.add('hidden');
        queryHeader.innerHTML = '';
        queryBody.innerHTML = '';

        fetch(`${API_ENDPOINT}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
            .then(response => response.json())
            .then(data => {
                queryLoading.classList.add('hidden');
                queryResult.classList.remove('hidden');

                if (data.error) {
                    queryError.textContent = data.error;
                    queryError.classList.remove('hidden');
                    return;
                }

                if (data.rows && data.rows.length > 0) {
                    // Create query result header
                    const columns = Object.keys(data.rows[0]);
                    queryHeader.innerHTML = `
                        <tr>
                            ${columns.map(col => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col}</th>`).join('')}
                        </tr>
                    `;

                    // Create query result body
                    queryBody.innerHTML = data.rows.map(row => `
                        <tr class="hover:bg-gray-50">
                            ${columns.map(col => `<td class="px-6 py-4 whitespace-nowrap text-sm">${row[col] !== null ? row[col] : '<span class="text-gray-400">null</span>'}</td>`).join('')}
                        </tr>
                    `).join('');
                } else {
                    queryError.textContent = 'Query returned no results';
                    queryError.classList.remove('hidden');
                }
            })
            .catch(error => {
                queryLoading.classList.add('hidden');
                queryResult.classList.remove('hidden');
                queryError.textContent = `Error executing query: ${error.message}`;
                queryError.classList.remove('hidden');
            });
    });

    // Update the event listener to fetch column information and generate form fields
    function loadTableColumns(tableName) {
        fetch(`${API_ENDPOINT}/columns/${tableName}`)
            .then(response => response.json())
            .then(data => {
                const insertForm = document.getElementById('insert-form');
                insertForm.innerHTML = '';

                if (data.error) {
                    insertForm.innerHTML = `<p class="text-red-500">${data.error}</p>`;
                    return;
                }

                data.columns.forEach(column => {
                    const formGroup = document.createElement('div');
                    formGroup.className = 'form-group';
                    formGroup.innerHTML = `
                        <label for="${column.name}" class="block font-bold mb-2 dark:text-white">${column.name}</label>
                        <input type="text" id="${column.name}" name="${column.name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    `;
                    insertForm.appendChild(formGroup);
                });
            })
            .catch(error => {
                console.error('Error loading table columns:', error);
            });
    }

    // Handle form submission to construct and execute the INSERT statement
    insertBtn.addEventListener('click', function(event) {
        event.preventDefault();

        const formData = new FormData(document.getElementById('insert-form'));
        const columns = [];
        const values = [];

        formData.forEach((value, key) => {
            columns.push(key);
            values.push(`'${value}'`);
        });

        const query = `INSERT INTO ${tableName.textContent} (${columns.join(', ')}) VALUES (${values.join(', ')})`;

        queryLoading.classList.remove('hidden');
        queryError.classList.add('hidden');

        fetch(`${API_ENDPOINT}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        })
            .then(response => response.json())
            .then(data => {
                queryLoading.classList.add('hidden');

                if (data.error) {
                    queryError.textContent = data.error;
                    queryError.classList.remove('hidden');
                    return;
                }

                // Clear the form after successful insert
                document.getElementById('insert-form').reset();
                alert('Row inserted successfully');
            })
            .catch(error => {
                queryLoading.classList.add('hidden');
                queryError.textContent = `Error inserting row: ${error.message}`;
                queryError.classList.remove('hidden');
            });
    });
});