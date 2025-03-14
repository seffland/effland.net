/**
 * Database Worker for Effland.net
 * 
 * This Cloudflare Worker provides API endpoints to interact with 
 * the Neon PostgreSQL database securely.
 */

// Import Cloudflare's PostgreSQL client
import { Client } from '@neondatabase/serverless';

// Function to insert wind speed data into the WindspeedLogs table
async function insertWindSpeedData(client, windspeed, unit, location) {
    const query = `INSERT INTO "WindspeedLogs" (timestamp, windspeed, unit, location) VALUES (CURRENT_TIMESTAMP, $1, $2, $3)`;
    const values = [windspeed, unit, location];
    await client.query(query, values);
}

// Function to fetch wind speed data from the weather station
async function fetchWindSpeedData() {
    // Replace with actual API call to fetch wind speed data from your weather station
    // For demonstration, we'll use dummy data
    return {
        windspeed: 5.5,
        unit: 'm/s',
        location: 'Your Location'
    };
}

export default {
  async fetch(request, env, ctx) {
    // Configure CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // In production, change to your domain
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    let client = null;
    
    try {
      // Parse the URL
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/database', '');

      // Log request details for debugging
      console.log(`Processing ${request.method} request to ${path}`);

      // Create database client
      client = new Client(env.DATABASE_URL);
      await client.connect();
      console.log("Database connection established");

      // Ensure the default value for the created_on column is set to CURRENT_TIMESTAMP
      if (path === '/ensure-default') {
        try {
          const alterQuery = `ALTER TABLE effland_net ALTER COLUMN created_on SET DEFAULT CURRENT_TIMESTAMP`;
          await client.query(alterQuery);
          console.log("Default value for created_on column set to CURRENT_TIMESTAMP");
          await client.end();
          return new Response(
            JSON.stringify({ success: true }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Error setting default value for created_on column:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ success: false, error: error.message, stack: error.stack }),
            { headers: corsHeaders }
          );
        }
      }

      // Handle database status endpoint
      if (path === '/status') {
        try {
          const result = await client.query('SELECT 1 as connected');
          await client.end();
          return new Response(
            JSON.stringify({ connected: true }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Database status check error:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ connected: false, error: error.message, stack: error.stack }),
            { headers: corsHeaders }
          );
        }
      }

      // Handle tables list endpoint
      if (path === '/tables') {
        try {
          const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
          `);
          await client.end();
          return new Response(
            JSON.stringify({ tables: result.rows.map(row => row.table_name) }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Tables list error:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ error: error.message, stack: error.stack }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Handle table data endpoint
      if (path.startsWith('/table/')) {
        const tableName = path.replace('/table/', '');
        
        // Basic SQL injection prevention
        if (!tableName.match(/^[a-zA-Z0-9_-]+$/)) {  // Added hyphen to allowed characters
          if (client) await client.end();
          return new Response(
            JSON.stringify({ error: 'Invalid table name' }),
            { status: 400, headers: corsHeaders }
          );
        }
        
        try {
          console.log(`Executing query: SELECT * FROM "${tableName}" LIMIT 100`);
          const result = await client.query(`SELECT * FROM "${tableName}" LIMIT 100`);
          console.log("Query result:", result);
          await client.end();
          return new Response(
            JSON.stringify({ rows: result.rows }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Table data error:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ error: error.message, stack: error.stack, details: error.toString() }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Handle table columns endpoint
      if (path.startsWith('/columns/')) {
        const tableName = path.replace('/columns/', '');
        
        // Basic SQL injection prevention
        if (!tableName.match(/^[a-zA-Z0-9_-]+$/)) {  // Added hyphen to allowed characters
          if (client) await client.end();
          return new Response(
            JSON.stringify({ error: 'Invalid table name' }),
            { status: 400, headers: corsHeaders }
          );
        }
        
        try {
          const result = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = $1
          `, [tableName]);
          await client.end();
          return new Response(
            JSON.stringify({ columns: result.rows.map(row => ({ name: row.column_name })) }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Columns error:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ error: error.message, stack: error.stack }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Handle custom query endpoint (POST only)
      if (path === '/query' && request.method === 'POST') {
        try {
          const body = await request.json();
          const query = body.query;
          const queryLower = query.trim().toLowerCase();
          
          console.log("Received query:", query);
          
          // Security check - allow SELECT, INSERT, DELETE and specific ALTER TABLE statements 
          const isSelect = queryLower.startsWith('select');
          const isInsert = queryLower.startsWith('insert');
          const isDelete = queryLower.startsWith('delete');
          const isAlterTable = queryLower.startsWith('alter table') && 
                              queryLower.includes('effland_net') && 
                              queryLower.includes('created_on') && 
                              queryLower.includes('default');
          
          if (!isSelect && !isInsert && !isDelete && !isAlterTable) {
            if (client) await client.end();
            return new Response(
              JSON.stringify({ error: 'Only SELECT, INSERT, DELETE, and specific ALTER TABLE statements are allowed' }),
              { status: 403, headers: corsHeaders }
            );
          }
          
          // Extra security for ALTER TABLE - ensure it targets our specific table
          if (isAlterTable) {
            const alterTableRegex = /alter\s+table\s+["']?effland_net["']?\s+alter\s+column\s+["']?created_on["']?\s+set\s+default\s+/i;
            if (!alterTableRegex.test(queryLower)) {
              if (client) await client.end();
              return new Response(
                JSON.stringify({ error: 'Only specific ALTER TABLE statements for the created_on column in effland_net are allowed' }),
                { status: 403, headers: corsHeaders }
              );
            }
            
            console.log("ALTER TABLE query passed validation:", query);
          }
          
          // Extra security for DELETE - ensure it targets our specific table with an ID
          if (isDelete) {
            const deleteRegex = /delete\s+from\s+["']?effland_net["']?\s+where\s+id\s*=\s*\d+/i;
            if (!deleteRegex.test(queryLower)) {
              if (client) await client.end();
              return new Response(
                JSON.stringify({ error: 'DELETE operations must target the effland_net table and include an ID condition' }),
                { status: 403, headers: corsHeaders }
              );
            }
          }
          
          // Extra security for INSERT - ensure it targets our specific table
          if (isInsert) {
            // Check if it's inserting into effland_net
            const validTableRegex = /insert\s+into\s+["']?effland_net["']?/i;
            if (!validTableRegex.test(queryLower)) {
              if (client) await client.end();
              return new Response(
                JSON.stringify({ error: 'INSERT operations are only allowed for the effland_net table' }),
                { status: 403, headers: corsHeaders }
              );
            }
            
            console.log("INSERT query passed validation:", query);
          }
          
          console.log("Executing query:", query);
          const result = await client.query(query);
          console.log("Query executed successfully:", result);
          
          if (client) await client.end();
          
          return new Response(
            JSON.stringify({ 
              success: true,
              rows: result.rows,
              rowCount: result.rowCount
            }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Query error:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ 
              error: error.message, 
              stack: error.stack,
              details: error.toString()
            }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Handle wind speed data insertion endpoint
      if (path === '/insert-wind-speed') {
        let client = null;
        try {
          client = new Client(env.DATABASE_URL);
          await client.connect();
          console.log("Database connection established");

          const windSpeedData = await fetchWindSpeedData();
          await insertWindSpeedData(client, windSpeedData.windspeed, windSpeedData.unit, windSpeedData.location);
          console.log("Wind speed data inserted successfully");

          await client.end();
          return new Response(
            JSON.stringify({ success: true }),
            { headers: corsHeaders }
          );
        } catch (error) {
          console.error("Error inserting wind speed data:", error);
          if (client) await client.end();
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: corsHeaders }
          );
        }
      }

      // Close client if we reach this point
      if (client) await client.end();

      // Handle 404 for any other path
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      console.error("Worker error:", error);
      if (client) {
        try {
          await client.end();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: error.message || "Internal Server Error",
          stack: error.stack,
          details: error.toString()
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};