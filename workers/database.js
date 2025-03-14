/**
 * Database Worker for Effland.net
 * 
 * This Cloudflare Worker provides API endpoints to interact with 
 * the Neon PostgreSQL database securely.
 */

// Import Cloudflare's PostgreSQL client
import { Client } from '@neondatabase/serverless';

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

    try {
      // Parse the URL
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/database', '');

      // Create database client
      const client = new Client(env.DATABASE_URL);
      await client.connect();

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
          await client.end();
          return new Response(
            JSON.stringify({ connected: false, error: error.message }),
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
          await client.end();
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Handle table data endpoint
      if (path.startsWith('/table/')) {
        const tableName = path.replace('/table/', '');
        
        // Basic SQL injection prevention
        if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
          await client.end();
          return new Response(
            JSON.stringify({ error: 'Invalid table name' }),
            { status: 400, headers: corsHeaders }
          );
        }
        
        try {
          const result = await client.query(`SELECT * FROM ${tableName} LIMIT 100`);
          await client.end();
          return new Response(
            JSON.stringify({ rows: result.rows }),
            { headers: corsHeaders }
          );
        } catch (error) {
          await client.end();
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Handle table columns endpoint
      if (path.startsWith('/columns/')) {
        const tableName = path.replace('/columns/', '');
        
        // Basic SQL injection prevention
        if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
          await client.end();
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
          await client.end();
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
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
            await client.end();
            return new Response(
              JSON.stringify({ error: 'Only SELECT queries are allowed' }),
              { status: 403, headers: corsHeaders }
            );
          }
          
          const result = await client.query(query);
          await client.end();
          return new Response(
            JSON.stringify({ rows: result.rows }),
            { headers: corsHeaders }
          );
        } catch (error) {
          await client.end();
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // Close client if we reach this point
      await client.end();

      // Handle 404 for any other path
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};