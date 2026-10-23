export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn-light"
        disabled={meta.current_page === 1}
        onClick={() => onPage(meta.current_page - 1)}
      >
        Previous
      </button>
      <span>
        Page {meta.current_page} of {meta.last_page} ({meta.total} total)
      </span>
      <button
        className="btn btn-light"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPage(meta.current_page + 1)}
      >
        Next
      </button>
    </div>
  );
}