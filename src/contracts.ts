// Generated public schemas only. No interpreter.
export const contracts = {
  schemas: {
    Error: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
        },
        message: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          ],
        },
        error: {
          type: 'string',
        },
        code: {
          type: 'string',
        },
      },
      required: [],
      additionalProperties: true,
    },
    ExecuteRequest: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          minLength: 1,
          maxLength: 6000,
        },
        mode: {
          type: 'string',
          enum: ['dry-run', 'live'],
        },
        event: {
          type: 'object',
          additionalProperties: true,
          description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
        },
        retainSource: {
          type: 'boolean',
        },
        scriptName: {
          type: 'string',
          maxLength: 80,
        },
        secretNames: {
          type: 'array',
          items: {
            type: 'string',
            pattern: '^[A-Z][A-Z0-9_]{0,63}$',
          },
          maxItems: 16,
          uniqueItems: true,
          description:
            'Explicit secret grant; requires secrets:use in addition to scripts:execute. Policies are enforced server-side.',
        },
        scriptId: {
          type: 'string',
          format: 'uuid',
        },
      },
      required: ['code'],
      additionalProperties: false,
    },
    Diagnostic: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
        line: {
          type: 'integer',
        },
        column: {
          type: 'integer',
        },
        filename: {
          type: 'string',
        },
        snippet: {
          type: 'string',
        },
      },
      required: ['message'],
      additionalProperties: true,
    },
    Timings: {
      type: 'object',
      additionalProperties: {
        type: 'number',
      },
    },
    ExecutionResult: {
      type: 'object',
      properties: {
        durationMs: {
          type: 'number',
        },
        instructions: {
          type: 'integer',
        },
        returnValue: {},
        replies: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
            },
            lastPayload: {},
          },
          required: ['count'],
          additionalProperties: false,
        },
        counters: {
          type: 'object',
          properties: {
            dbOps: {
              type: 'integer',
            },
            httpCalls: {
              type: 'integer',
            },
          },
          required: ['dbOps', 'httpCalls'],
          additionalProperties: false,
        },
        explain: {
          type: 'object',
          additionalProperties: true,
          description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
        },
      },
      required: ['durationMs', 'instructions', 'replies'],
      additionalProperties: false,
    },
    ExecuteResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        mocked: {
          type: 'boolean',
        },
        error: {
          $ref: '#/components/schemas/Diagnostic',
        },
        executionResult: {
          $ref: '#/components/schemas/ExecutionResult',
        },
        replies: {
          type: 'array',
          items: {},
        },
        metrics: {
          type: 'object',
          additionalProperties: true,
          description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
        },
        telemetryRecorded: {
          type: 'boolean',
        },
        executionId: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        replayed: {
          type: 'boolean',
        },
        originalResultOmitted: {
          type: 'boolean',
        },
      },
      required: ['success'],
      additionalProperties: true,
    },
    Policy: {
      type: 'object',
      additionalProperties: true,
      description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
    },
    Execution: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        scriptName: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        mode: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
        durationMs: {
          type: 'number',
        },
        instructionsUsed: {
          type: 'integer',
        },
        errorCode: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        httpCalls: {
          type: 'integer',
        },
        dbOps: {
          type: 'integer',
        },
        errorMessage: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        hasSource: {
          type: 'boolean',
        },
        timings: {
          $ref: '#/components/schemas/Timings',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
        },
      },
      required: ['id', 'mode', 'status', 'durationMs', 'instructionsUsed', 'createdAt'],
      additionalProperties: true,
    },
    ExecutionDetail: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        scriptName: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        mode: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
        durationMs: {
          type: 'number',
        },
        instructionsUsed: {
          type: 'integer',
        },
        errorCode: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        httpCalls: {
          type: 'integer',
        },
        dbOps: {
          type: 'integer',
        },
        errorMessage: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        hasSource: {
          type: 'boolean',
        },
        timings: {
          $ref: '#/components/schemas/Timings',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
        },
        sourceCode: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        outputPreview: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
      },
      required: ['id', 'mode', 'status', 'durationMs', 'instructionsUsed', 'createdAt'],
      additionalProperties: true,
    },
    ExecutionPage: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Execution',
          },
        },
        nextCursor: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'null',
            },
          ],
        },
        policy: {
          $ref: '#/components/schemas/Policy',
        },
      },
      required: ['items', 'nextCursor', 'policy'],
      additionalProperties: false,
    },
    Script: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        name: {
          type: 'string',
        },
        currentVersion: {
          type: 'integer',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
      },
      required: ['id', 'name', 'currentVersion', 'createdAt', 'updatedAt'],
      additionalProperties: false,
    },
    ScriptDetail: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        name: {
          type: 'string',
        },
        currentVersion: {
          type: 'integer',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        code: {
          type: 'string',
        },
        versions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              version: {
                type: 'integer',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              bytes: {
                type: 'integer',
              },
            },
            required: ['version', 'createdAt', 'bytes'],
            additionalProperties: false,
          },
        },
      },
      required: ['id', 'name', 'currentVersion', 'createdAt', 'updatedAt', 'code', 'versions'],
      additionalProperties: true,
    },
    ScriptList: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Script',
          },
        },
        policy: {
          $ref: '#/components/schemas/Policy',
        },
      },
      required: ['items', 'policy'],
      additionalProperties: false,
    },
    ScriptCreate: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 80,
          pattern: '\\S',
        },
        code: {
          type: 'string',
          minLength: 1,
          maxLength: 6000,
        },
      },
      required: ['name', 'code'],
      additionalProperties: false,
    },
    ScriptUpdate: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 80,
          pattern: '\\S',
        },
        code: {
          type: 'string',
          minLength: 1,
          maxLength: 6000,
        },
        expectedVersion: {
          type: 'integer',
          minimum: 1,
          maximum: 2147483646,
        },
      },
      required: ['name', 'code', 'expectedVersion'],
      additionalProperties: false,
    },
    ScriptRestore: {
      type: 'object',
      properties: {
        version: {
          type: 'integer',
          minimum: 1,
          maximum: 2147483646,
        },
        expectedVersion: {
          type: 'integer',
          minimum: 1,
          maximum: 2147483646,
        },
      },
      required: ['version', 'expectedVersion'],
      additionalProperties: false,
    },
    ScriptVersion: {
      type: 'object',
      properties: {
        version: {
          type: 'integer',
        },
        code: {
          type: 'string',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
      },
      required: ['version', 'code', 'createdAt'],
      additionalProperties: false,
    },
    Deleted: {
      type: 'object',
      properties: {
        deleted: {
          type: 'boolean',
        },
      },
      required: ['deleted'],
      additionalProperties: false,
    },
    Storage: {
      type: 'object',
      properties: {
        policy: {
          $ref: '#/components/schemas/Policy',
        },
        history: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
            },
            bytes: {
              type: 'integer',
            },
          },
          required: ['count', 'bytes'],
          additionalProperties: false,
        },
        scripts: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
            },
            versions: {
              type: 'integer',
            },
            bytes: {
              type: 'integer',
            },
          },
          required: ['count', 'versions', 'bytes'],
          additionalProperties: false,
        },
      },
      required: ['policy', 'history', 'scripts'],
      additionalProperties: false,
    },
    Secret: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          pattern: '^[A-Z][A-Z0-9_]{0,63}$',
        },
        allowInline: {
          type: 'boolean',
        },
        scriptIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
        },
        version: {
          type: 'integer',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
      },
      required: ['name', 'allowInline', 'scriptIds', 'version', 'createdAt', 'updatedAt'],
      additionalProperties: false,
    },
    SecretList: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Secret',
          },
        },
      },
      required: ['items'],
      additionalProperties: false,
    },
    SecretCreate: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          pattern: '^[A-Z][A-Z0-9_]{0,63}$',
        },
        value: {
          type: 'string',
          minLength: 8,
          maxLength: 4096,
          writeOnly: true,
          description:
            'Write-only credential: 8–4096 UTF-8 bytes; never returned. No null characters or malformed Unicode.',
        },
        allowInline: {
          type: 'boolean',
          default: false,
        },
        scriptIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
          maxItems: 10,
          uniqueItems: true,
        },
      },
      required: ['name', 'value'],
      additionalProperties: false,
    },
    SecretUpdate: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          minLength: 8,
          maxLength: 4096,
          writeOnly: true,
          description:
            'Write-only credential: 8–4096 UTF-8 bytes; never returned. No null characters or malformed Unicode.',
        },
        allowInline: {
          type: 'boolean',
        },
        scriptIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
          maxItems: 10,
          uniqueItems: true,
        },
      },
      required: [],
      additionalProperties: false,
      minProperties: 1,
    },
    SandboxLimits: {
      type: 'object',
      properties: {
        timeoutMs: {
          type: 'integer',
        },
        maxInstructions: {
          type: 'integer',
        },
        maxMemoryMb: {
          type: 'integer',
        },
      },
      required: ['timeoutMs', 'maxInstructions', 'maxMemoryMb'],
      additionalProperties: false,
    },
    Sandbox: {
      type: 'object',
      properties: {
        plan: {
          type: 'string',
        },
        configurable: {
          type: 'boolean',
        },
        limits: {
          $ref: '#/components/schemas/SandboxLimits',
        },
        defaults: {
          $ref: '#/components/schemas/SandboxLimits',
        },
        maxLimits: {
          $ref: '#/components/schemas/SandboxLimits',
        },
      },
      required: ['plan', 'configurable', 'limits', 'defaults', 'maxLimits'],
      additionalProperties: false,
    },
    Plan: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        configurable: {
          type: 'boolean',
        },
        limits: {
          $ref: '#/components/schemas/SandboxLimits',
        },
        maxLimits: {
          $ref: '#/components/schemas/SandboxLimits',
        },
        name: {
          type: 'string',
        },
        monthlyUsd: {
          anyOf: [
            {
              type: 'number',
            },
            {
              type: 'null',
            },
          ],
        },
        yearlyMonthlyUsd: {
          anyOf: [
            {
              type: 'number',
            },
            {
              type: 'null',
            },
          ],
        },
        usageUsdPer1k: {
          type: 'number',
        },
        executionsPerMonth: {
          anyOf: [
            {
              type: 'integer',
            },
            {
              type: 'null',
            },
          ],
        },
        timeoutMs: {
          type: 'integer',
        },
        features: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['id', 'name', 'limits', 'executionsPerMonth'],
      additionalProperties: true,
    },
    Plans: {
      type: 'object',
      properties: {
        configured: {
          type: 'boolean',
        },
        plans: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Plan',
          },
        },
      },
      required: ['configured', 'plans'],
      additionalProperties: false,
    },
    BillingStatus: {
      type: 'object',
      properties: {
        configured: {
          type: 'boolean',
        },
        plan: {
          $ref: '#/components/schemas/Plan',
        },
        subscription: {
          anyOf: [
            {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                },
                interval: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                },
                currentPeriodEnd: {
                  anyOf: [
                    {
                      type: 'string',
                      format: 'date-time',
                    },
                    {
                      type: 'null',
                    },
                  ],
                },
                cancelAtPeriodEnd: {
                  type: 'boolean',
                },
                hasCustomer: {
                  type: 'boolean',
                },
              },
              required: [],
              additionalProperties: true,
            },
            {
              type: 'null',
            },
          ],
        },
        usage: {
          type: 'object',
          properties: {
            executions: {
              type: 'integer',
            },
            limit: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
            },
            resetsAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['executions', 'limit', 'resetsAt'],
          additionalProperties: false,
        },
      },
      required: ['configured', 'plan', 'subscription', 'usage'],
      additionalProperties: false,
    },
    UsageSummary: {
      type: 'object',
      properties: {
        windowDays: {
          type: 'integer',
        },
        totalExecutions: {
          type: 'integer',
        },
        successfulExecutions: {
          type: 'integer',
        },
        failedExecutions: {
          type: 'integer',
        },
        averageDurationMs: {
          type: 'number',
        },
        latest: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
          },
        },
      },
      required: [
        'windowDays',
        'totalExecutions',
        'successfulExecutions',
        'failedExecutions',
        'averageDurationMs',
        'latest',
      ],
      additionalProperties: false,
    },
    UsageHistory: {
      type: 'object',
      properties: {
        days: {
          type: 'integer',
        },
        total: {
          type: 'integer',
        },
        success: {
          type: 'integer',
        },
        failed: {
          type: 'integer',
        },
        successRate: {
          type: 'number',
        },
        daily: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
              },
              total: {
                type: 'integer',
              },
              success: {
                type: 'integer',
              },
              failed: {
                type: 'integer',
              },
              avgDurationMs: {
                type: 'number',
              },
            },
            required: ['date', 'total', 'success', 'failed', 'avgDurationMs'],
            additionalProperties: false,
          },
        },
        topScripts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              count: {
                type: 'integer',
              },
            },
            required: ['name', 'count'],
            additionalProperties: false,
          },
        },
        topScriptsSample: {
          type: 'object',
          properties: {
            days: {
              type: 'integer',
            },
            limit: {
              type: 'integer',
            },
          },
          required: ['days', 'limit'],
          additionalProperties: false,
        },
        apiKeys: {
          type: 'object',
          properties: {
            active: {
              type: 'integer',
            },
            lastUsedAt: {
              anyOf: [
                {
                  type: 'string',
                  format: 'date-time',
                },
                {
                  type: 'null',
                },
              ],
            },
          },
          required: ['active', 'lastUsedAt'],
          additionalProperties: false,
        },
      },
      required: [
        'days',
        'total',
        'success',
        'failed',
        'successRate',
        'daily',
        'topScripts',
        'topScriptsSample',
        'apiKeys',
      ],
      additionalProperties: false,
    },
    TelemetryExecution: {
      type: 'object',
      properties: {
        scriptName: {
          type: 'string',
          maxLength: 200,
        },
        mode: {
          type: 'string',
          maxLength: 40,
        },
        status: {
          type: 'string',
          maxLength: 40,
        },
        durationMs: {
          type: 'integer',
          minimum: 0,
          maximum: 86400000,
        },
        instructionsUsed: {
          type: 'integer',
          minimum: 0,
        },
        memoryUsageKb: {
          type: 'integer',
          minimum: 0,
        },
        errorCode: {
          type: 'string',
          maxLength: 100,
        },
        metadata: {
          type: 'object',
          additionalProperties: true,
          description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
        },
      },
      required: ['status', 'durationMs', 'instructionsUsed'],
      additionalProperties: false,
    },
    TelemetryEvent: {
      type: 'object',
      properties: {
        eventName: {
          type: 'string',
          maxLength: 80,
        },
        pagePath: {
          type: 'string',
          maxLength: 300,
        },
        sessionId: {
          type: 'string',
          maxLength: 100,
        },
        fingerprintHash: {
          type: 'string',
          maxLength: 128,
        },
        properties: {
          type: 'object',
          additionalProperties: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'number',
              },
              {
                type: 'boolean',
              },
              {
                type: 'null',
              },
            ],
          },
        },
      },
      required: ['eventName'],
      additionalProperties: false,
    },
    TelemetryRecorded: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: true,
          description: 'JSON execution input, at most 8 KiB encoded. Available as ctx.input.',
        },
        {
          type: 'string',
        },
        {
          type: 'null',
        },
      ],
    },
    Accepted: {
      type: 'object',
      properties: {
        accepted: {
          type: 'boolean',
        },
      },
      required: ['accepted'],
      additionalProperties: false,
    },
    Health: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['operational', 'degraded'],
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: ['operational', 'degraded'],
              },
            },
            required: ['id', 'name', 'status'],
            additionalProperties: false,
          },
        },
      },
      required: ['status', 'timestamp', 'services'],
      additionalProperties: false,
    },
  },
  operations: [
    {
      id: 'execute',
      method: 'POST',
      path: '/api/runtime/execute',
      request: 'ExecuteRequest',
      response: 'ExecuteResponse',
      scope: 'scripts:execute',
    },
    {
      id: 'executions.list',
      method: 'GET',
      path: '/api/workspace/history',
      request: null,
      response: 'ExecutionPage',
      scope: 'executions:read',
    },
    {
      id: 'executions.get',
      method: 'GET',
      path: '/api/workspace/history/{id}',
      request: null,
      response: 'ExecutionDetail',
      scope: 'executions:read',
    },
    {
      id: 'scripts.list',
      method: 'GET',
      path: '/api/workspace/scripts',
      request: null,
      response: 'ScriptList',
      scope: 'scripts:read',
    },
    {
      id: 'scripts.create',
      method: 'POST',
      path: '/api/workspace/scripts',
      request: 'ScriptCreate',
      response: 'Script',
      scope: 'scripts:write',
    },
    {
      id: 'scripts.get',
      method: 'GET',
      path: '/api/workspace/scripts/{id}',
      request: null,
      response: 'ScriptDetail',
      scope: 'scripts:read',
    },
    {
      id: 'scripts.update',
      method: 'PATCH',
      path: '/api/workspace/scripts/{id}',
      request: 'ScriptUpdate',
      response: 'Script',
      scope: 'scripts:write',
    },
    {
      id: 'scripts.delete',
      method: 'DELETE',
      path: '/api/workspace/scripts/{id}',
      request: null,
      response: 'Deleted',
      scope: 'scripts:write',
    },
    {
      id: 'scripts.getVersion',
      method: 'GET',
      path: '/api/workspace/scripts/{id}/versions/{version}',
      request: null,
      response: 'ScriptVersion',
      scope: 'scripts:read',
    },
    {
      id: 'scripts.restore',
      method: 'POST',
      path: '/api/workspace/scripts/{id}/restore',
      request: 'ScriptRestore',
      response: 'Script',
      scope: 'scripts:write',
    },
    {
      id: 'scripts.storage',
      method: 'GET',
      path: '/api/workspace/storage',
      request: null,
      response: 'Storage',
      scope: 'scripts:read',
    },
    {
      id: 'secrets.list',
      method: 'GET',
      path: '/api/secrets',
      request: null,
      response: 'SecretList',
      scope: 'secrets:read',
    },
    {
      id: 'secrets.create',
      method: 'POST',
      path: '/api/secrets',
      request: 'SecretCreate',
      response: 'Secret',
      scope: 'secrets:write',
    },
    {
      id: 'secrets.get',
      method: 'GET',
      path: '/api/secrets/{name}',
      request: null,
      response: 'Secret',
      scope: 'secrets:read',
    },
    {
      id: 'secrets.update',
      method: 'PATCH',
      path: '/api/secrets/{name}',
      request: 'SecretUpdate',
      response: 'Secret',
      scope: 'secrets:write',
    },
    {
      id: 'secrets.delete',
      method: 'DELETE',
      path: '/api/secrets/{name}',
      request: null,
      response: 'Deleted',
      scope: 'secrets:write',
    },
    {
      id: 'usage.get',
      method: 'GET',
      path: '/api/billing/status',
      request: null,
      response: 'BillingStatus',
      scope: 'usage:read',
    },
    {
      id: 'usage.summary',
      method: 'GET',
      path: '/api/telemetry/summary',
      request: null,
      response: 'UsageSummary',
      scope: 'usage:read',
    },
    {
      id: 'usage.history',
      method: 'GET',
      path: '/api/telemetry/usage',
      request: null,
      response: 'UsageHistory',
      scope: 'usage:read',
    },
    {
      id: 'sandbox.get',
      method: 'GET',
      path: '/api/billing/sandbox',
      request: null,
      response: 'Sandbox',
      scope: 'scripts:read',
    },
    {
      id: 'billing.plans',
      method: 'GET',
      path: '/api/billing/plans',
      request: null,
      response: 'Plans',
      scope: null,
    },
    {
      id: 'telemetry.recordExecution',
      method: 'POST',
      path: '/api/telemetry/executions',
      request: 'TelemetryExecution',
      response: 'TelemetryRecorded',
      scope: 'telemetry:write',
    },
    {
      id: 'telemetry.recordEvent',
      method: 'POST',
      path: '/api/telemetry/events',
      request: 'TelemetryEvent',
      response: 'Accepted',
      scope: 'telemetry:write',
    },
    {
      id: 'health.get',
      method: 'GET',
      path: '/api/health',
      request: null,
      response: 'Health',
      scope: null,
    },
  ],
} as const;
