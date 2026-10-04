import type { Job } from '../../shared/schemas/records';
export function JobProgress({ job }: { job: Job }) {
  return (
    <div className="job-row">
      <div>
        <strong>{job.type}</strong>
        <span className={'job-state ' + job.status}>{job.status}</span>
      </div>
      <progress value={job.progress} max={100} aria-label={'Progress ' + job.id} />
      <div className="muted">
        {job.progress}% · {job.error || job.message}
      </div>
    </div>
  );
}
