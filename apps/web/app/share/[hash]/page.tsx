import { DEFAULT_BACKEND_URL } from "@mysecondbrain/common";

type SharedBrainPageProps = {
  params: Promise<{
    hash: string;
  }>;
};

type SharedContent = {
  _id: string;
  title: string;
  type: string;
  link: string;
};

async function getSharedBrain(hash: string) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL;

  const response = await fetch(`${backendUrl}/api/v1/brain/${hash}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    username: string;
    content: SharedContent[];
  };
}

export default async function SharedBrainPage({ params }: SharedBrainPageProps) {
  const { hash } = await params;
  const data = await getSharedBrain(hash);

  if (!data) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-card">
          <h1 className="text-3xl font-bold">Shared brain not found</h1>
          <p className="mt-3 text-muted-foreground">
            This link may be invalid, expired, or the backend may be offline.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-14 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Shared Brain
          </p>
          <h1 className="mt-3 text-4xl font-bold">{data.username}&apos;s knowledge base</h1>
          <p className="mt-3 text-muted-foreground">
            Browse the content this workspace owner chose to share publicly.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data.content.map((item) => (
            <article
              key={item._id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {item.type}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
              <a
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                Open source
              </a>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
