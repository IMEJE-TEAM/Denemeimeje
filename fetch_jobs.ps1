$response = Invoke-RestMethod -Uri "https://api.github.com/repos/IMEJE-TEAM/Denemeimeje/actions/runs"
$lastRunId = $response.workflow_runs[0].id
$jobsUrl = $response.workflow_runs[0].jobs_url
$jobs = Invoke-RestMethod -Uri $jobsUrl
$jobs | ConvertTo-Json -Depth 5 | Out-File "github_jobs.json"
Write-Host "Jobs fetched."
