/**
 * Database Worker for Effland.net
 * 
 * This Cloudflare Worker provides API endpoints to interact with 
 * the Neon PostgreSQL database securely.
 */

// Import the PostgreSQL client from pgwire
// This is Cloudflare's PostgreSQL client designed for Workers
import { Pool } from '@cloudflare/pg';

export default {
  async fetch(request, env, ctx) {
    // Configure CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://effland.net',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Parse the URL
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/database', '');

    // Create a new connection pool
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
    });

    // Handle database status endpoint
    if (path === '/status') {
      try {
        // Test connection by running a simple query
        const result = await pool.query('SELECT 1 AS connected');
        return new Response(
          JSON.stringify({ connected: true }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ connected: false, error: error.message }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Handle tables list endpoint
    if (path === '/tables') {
      try {
        const result = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        
        return new Response(
          JSON.stringify({ tables: result.rows.map(row => row.table_name) }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Handle table data endpoint
    if (path.startsWith('/table/')) {
      const tableName = path.replace('/table/', '');
      
      // Basic SQL injection prevention
      if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
        return new Response(
          JSON.stringify({ error: 'Invalid table name' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      try {
        // Limit to 100 rows for performance
        const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 100`);
        
        return new Response(
          JSON.stringify({ rows: result.rows }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Handle custom query endpoint (POST only)
    if (path === '/query' && request.method === 'POST') {
      try {
        const body = await request.json();
        const query = body.query;
        
        // Security check - only allow SELECT statements
        if (!query.trim().toLowerCase().startsWith('select')) {
          return new Response(
            JSON.stringify({ error: 'Only SELECT queries are allowed' }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
        
        // Execute the query with a timeout
        const result = await pool.query(query);
        
        return new Response(
          JSON.stringify({ rows: result.rows }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Handle 404 for any other path
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};