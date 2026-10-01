import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createMcpHandler, McpServer } from 'npm:@modelcontextprotocol/server@^2.0.0'
import { pipeline } from 'npm:@supabase/middleware@1'
import { withOAuthProtectedResource, withSupabase } from 'npm:@supabase/server@1'
import { registerExpenseTools } from './tools.ts'

Deno.serve(
  pipeline(
    [withOAuthProtectedResource(), withSupabase({ auth: 'user' })],
    async (request, { supabase }) => {
      const handler = createMcpHandler(() => {
        const server = new McpServer({ name: 'expense-tracker', version: '0.1.0' })
        registerExpenseTools(server, supabase)
        return server
      })
      return handler.fetch(request)
    }
  )
)
