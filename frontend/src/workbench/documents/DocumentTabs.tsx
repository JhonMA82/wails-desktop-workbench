import type { DocumentRecord } from '../../shared/schemas/records';
// Label used by the docking tab strip. Document identity is owned by DocumentService.
export function DocumentTabs({ document }: { document: DocumentRecord }) {
  return (
    <span>
      {document.title}
      {document.dirty && (
        <span className="dirty-dot" aria-label="Modified">
          {' '}
          ●
        </span>
      )}
    </span>
  );
}
