// app/debug-session/page.js
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function DebugSession() {
  const { data: session, status } = useSession();
  const [apiCheck, setApiCheck] = useState(null);
  const [envCheck, setEnvCheck] = useState(null);

  useEffect(() => {
    // Check what the API sees
    fetch('/api/debug/session')
      .then(res => res.json())
      .then(data => setApiCheck(data))
      .catch(err => setApiCheck({ error: err.message }));

    // Check environment variable
    fetch('/api/debug/env')
      .then(res => res.json())
      .then(data => setEnvCheck(data))
      .catch(err => setEnvCheck({ error: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Session Debug Information</h1>
        
        {/* Client-Side Session */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Client-Side Session (useSession)</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2"><strong>Status:</strong> {status}</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {/* Server-Side Session Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Server-Side Session (API Route)</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(apiCheck, null, 2)}
            </pre>
          </div>
        </div>

        {/* Environment Variable Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variable Check</h2>
          <div className="bg-gray-50 p-4 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(envCheck, null, 2)}
            </pre>
          </div>
        </div>

        {/* Email Comparison */}
        {session?.user?.email && envCheck?.adminEmail && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Email Comparison</h2>
            <div className="space-y-2">
              <p><strong>Your Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{session.user.email}</code></p>
              <p><strong>Admin Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{envCheck.adminEmail}</code></p>
              <p><strong>Lowercase Match:</strong> {
                session.user.email.toLowerCase() === envCheck.adminEmail.toLowerCase() 
                  ? <span className="text-green-600 font-semibold">✓ MATCH</span>
                  : <span className="text-red-600 font-semibold">✗ NO MATCH</span>
              }</p>
              <p><strong>Character Count - Your Email:</strong> {session.user.email.length}</p>
              <p><strong>Character Count - Admin Email:</strong> {envCheck.adminEmail.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}