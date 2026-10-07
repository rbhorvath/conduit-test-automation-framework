import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { APIResponse } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Local refs ("#/components/...") must point at the registered spec document.
const spec = JSON.parse(
  JSON.stringify(parse(readFileSync(join(__dirname, '..', 'specs', 'openapi.yml'), 'utf8'))).replace(
    /"\$ref":"#\//g,
    '"$ref":"spec#/',
  ),
);

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema(spec, 'spec');

function resolveRef<T = any>(node: any): T {
  if (node?.$ref) {
    const pointer = (node.$ref as string).replace('spec#/', '').split('/');
    return resolveRef(pointer.reduce((acc: any, key) => acc[key], spec));
  }
  return node;
}

export interface ContractResult {
  valid: boolean;
  errors: string;
}

/**
 * Validates a response body against the OpenAPI schema for the given operation.
 * `pathTemplate` is the spec path, e.g. `/articles/{slug}`.
 */
export async function validateAgainstSpec(
  res: APIResponse,
  method: 'get' | 'post' | 'put' | 'delete',
  pathTemplate: string,
): Promise<ContractResult> {
  const operation = spec.paths?.[pathTemplate]?.[method];
  if (!operation) return { valid: false, errors: `No ${method.toUpperCase()} ${pathTemplate} in the spec` };

  const status = String(res.status());
  const declared = operation.responses?.[status];
  if (!declared)
    return { valid: false, errors: `Status ${status} is not documented for ${method.toUpperCase()} ${pathTemplate}` };

  const schema = resolveRef(declared).content?.['application/json']?.schema;
  if (!schema) return { valid: true, errors: '' };

  const validate = ajv.compile(schema);
  const body = await res.json();
  const valid = validate(body) as boolean;
  return { valid, errors: valid ? '' : ajv.errorsText(validate.errors, { separator: '\n' }) };
}
