// Vercel forwards the unused :path* rewrite parameter as query metadata.
// It is reserved by this adapter and is not an application filter.
export function removeRoutingMetadata(request) {
  const url = new URL(request.url, 'https://deployment.invalid');
  url.searchParams.delete('path');
  request.url = url.pathname + url.search;
  if (request.query && Object.hasOwn(request.query, 'path'))
    delete request.query.path;
}
