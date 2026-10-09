import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-semibold tracking-tight text-primary">404</p>
      <h1 className="mt-3 text-lg font-semibold text-ink">Page not found</h1>
      <p className="mt-1 text-sm text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-on-primary tap"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
