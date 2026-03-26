import * as core from '@actions/core';

interface GenerateResponse {
  outputText: string;
  outputFormat: string;
  promptTokens: number;
  completionTokens: number;
}

async function run(): Promise<void> {
  const apiKey = core.getInput('api-key', { required: true });
  const repositoryId = core.getInput('repository-id', { required: true });
  const fromRef = core.getInput('from-ref', { required: true });
  const toRef = core.getInput('to-ref') || 'HEAD';
  const outputFormat = core.getInput('output-format') || 'markdown';
  const outputFile = core.getInput('output-file');
  const apiUrl = core.getInput('api-url').replace(/\/$/, '');

  core.info(`Generating changelog: ${fromRef}..${toRef}`);

  const url = `${apiUrl}/api/changelogs/generate`;
  const body = JSON.stringify({ repositoryId, fromRef, toRef, outputFormat });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    core.setFailed(`CodeTrace API error ${response.status}: ${text}`);
    return;
  }

  const data = (await response.json()) as GenerateResponse;
  const changelog = data.outputText;

  core.setOutput('changelog', changelog);
  core.setOutput('prompt-tokens', String(data.promptTokens));
  core.setOutput('completion-tokens', String(data.completionTokens));

  if (outputFile) {
    const { writeFileSync } = await import('fs');
    writeFileSync(outputFile, changelog, 'utf8');
    core.info(`Changelog written to ${outputFile}`);
  }

  core.info('Changelog generated successfully');
  core.info(`Tokens used: ${data.promptTokens} prompt, ${data.completionTokens} completion`);
}

run().catch((err: unknown) => {
  core.setFailed(err instanceof Error ? err.message : String(err));
});
